#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');
const yaml = require('js-yaml');
const FuzzyMatching = require('fuzzy-matching');
const prompts = require('prompts');
const chalk = require('chalk');

const args = (() => {
    const argparse = require('argparse');
    const parser = new argparse.ArgumentParser({
        version: '0.1.0',
        addHelp: true,
        description: 'Converts Kendo UI for jQuery message translations to YAML files'
    });

    parser.addArgument('jsFile', {
        help: 'Kendo UI for jQuery message file to convert, e.g. "kendo-messages.es-ES.xlf"',
    });

    parser.addArgument('ymlFile', {
        help: 'YAML Message file to update, e.g. "messages/scheduler/scheduler.es-ES.yml"',
    });

    parser.addArgument([ '-f', '--force' ], {
        help: 'overwrites existing translations',
        defaultValue: false,
        action: 'storeTrue'
    });

    parser.addArgument([ '-e', '--encoding' ], {
        help: 'Specifies the message files encoding. Default is "utf-8".',
        defaultValue: 'utf-8'
    });

    return parser.parseArgs();
})();

const stats = {
    translated: 0,
    missing: 0
};

const userKeyMap = new Map();

const expressionText = expression => {
    if (expression.type === 'Identifier') {
        return expression.name;
    }

    let propertyName = '';
    if (expression.property) {
        propertyName = expression.property.name;
    }

    if (expression.object) {
        return expressionText(expression.object) + '.' + propertyName;
    }

    return propertyName;
}

const readMessages = (messages, expression, prefix) => {
    if (expression.type !== 'ObjectExpression') {
        return;
    }

    expression.properties.forEach(prop => {
        const key = prefix + '.' + prop.key.value;
        const value = prop.value;

        if (value.type === 'ObjectExpression') {
            readMessages(messages, value, key);
        } else if (value.type === 'Literal') {
            messages.set(key, value.value);
        }
    })
}

const loadMessages = () => {
    const values = new Map();
    const text = fs.readFileSync(args.jsFile, args.encoding);
    walk.simple(acorn.parse(text), {
        CallExpression(node) {
            if (node.callee.property && node.callee.property.name === 'extend') {
                const destination = expressionText(node.arguments[1]).toLowerCase();
                if (destination.startsWith('kendo.ui.') && destination.endsWith('messages')) {
                    const data = node.arguments[2];
                    const prefix = 'kendo.' + destination.split('.')[2];
                    readMessages(values, data, prefix);
                }
            }
        }
    });

    const index = new FuzzyMatching([...values.keys()]);
    return {
        index,
        values
    };
};

async function confirmTranslations(replacements, confirmations) {
    const questions = confirmations.map(item => ({
        type: 'confirm',
        name: item.key,
        message: chalk.yellow('WARN:') + chalk.bold('Found an approximate match') + chalk.reset() +
`
    ${item.key}: ${item.value}
    ${item.matchedKey}: ${item.matchedValue}

`
    }));

    await prompts(questions, {
        onSubmit: (prompt, answer) => {
            console.log(prompt.name, answer);
        }
    });
}

const ACCEPTABLE_MATCH = 0.7;
const EXACT_MATCH = 1;

function translate(lang, messages, prefix, replacements, confirmations) {
    for (let key of Object.keys(lang)) {
        const value = lang[key];
        const fullKey = prefix + '.' + key;
        if (typeof value === 'object') {
            translate(value, messages, fullKey, replacements, confirmations);
        } else if (typeof value === 'string') {
            const lookup = messages.index.get(fullKey);
            const translation = messages.values.get( lookup.value );

            if (lookup.distance === EXACT_MATCH) {
                replacements.set(fullKey, translation);
                stats.translated++;
            } else if (lookup.distance > ACCEPTABLE_MATCH) {
                confirmations.push({
                    key: fullKey,
                    value: value,
                    matchedKey: lookup.value,
                    matchedValue: translation
                });
            } else {
                stats.missing++;
            }
        }
    };
};

function locateKey(key, lines) {
    const parts = key.split('.');
    let indent = -1;

    let part = parts.shift();
    let lineNum = 0;
    for (lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const trimmed = line.trimStart();
        if (trimmed.startsWith(part + ':')) {
            if (parts.length === 0) {
                return lineNum;
            }

            const lineIndent = line.length - trimmed.length;
            if (lineIndent > indent) {
                indent = lineIndent;
                part = parts.shift();
            }
        }
    }

    return -1;
}

async function translateFile() {
    const ymlText = fs.readFileSync(args.ymlFile, args.encoding);
    const lang = yaml.safeLoad(ymlText);
    const messages = loadMessages();
    const replacements = new Map();
    const confirmations = [];
    translate(lang.kendo, messages, 'kendo', replacements, confirmations);

    await confirmTranslations(replacements, confirmations);

    let ymlLines = ymlText.split('\n');
    for (let [key, value] of replacements) {
        let pos = locateKey(key, ymlLines);
        const delimiter = ymlLines[pos].indexOf(':');

        if (value.startsWith(' ') || value.includes(':')) {
            value = value.replace(/'/g, "''");
            value = `'${value}'`;
        }

        if (delimiter > -1) {
            ymlLines[pos] = ymlLines[pos].substring(0, delimiter) + ': ' + value;
        }
    }

    const output = ymlLines.join('\n');
    //fs.writeFileSync(args.ymlFile, output, args.encoding);

    console.log(`Completed. ${stats.translated} messages translated, ${stats.missing} messages missing.`);
}

translateFile();
