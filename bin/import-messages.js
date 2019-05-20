#!/usr/bin/env node

const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

const args = (() => {
    const argparse = require('argparse');
    const parser = new argparse.ArgumentParser({
        version: '0.1.0',
        addHelp: true,
        description: 'Converts Kendo UI for jQuery message translations to YAML files'
    });

    parser.addArgument('file', {
        help: 'Kendo UI for jQuery message file to convert, e.g. "kendo-messages.es-ES.xlf"',
    });

    parser.addArgument([ '-c', '--component' ], {
        help: 'the component name, for example "scheduler"',
        required: true
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

const msgRoot = path.resolve(__dirname, '../messages');

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

const readObject = (target, expression) => {
    if (expression.type !== 'ObjectExpression') {
        return;
    }

    expression.properties.forEach(prop => {
        const key = prop.key.value;
        const value = prop.value;

        if (!target[key]) {
            target[key] = {};
        }

        if (value.type === 'ObjectExpression') {
            readObject(target[key], value);
        } else if (value.type === 'Literal') {
            target[key] = value.value;
        }
    })
}

const parseFile = () => {
    const text = fs.readFileSync(args.file, args.encoding);
    walk.simple(acorn.parse(text), {
        CallExpression(node) {
            if (node.callee.property && node.callee.property.name === 'extend') {
                const destination = expressionText(node.arguments[1]);
                if (destination.toLowerCase().startsWith('kendo.ui.' + args.component.toLowerCase() + '.') &&
                    destination.toLowerCase().endsWith('messages')) {
                    const data = node.arguments[2];
                    const messages = { kendo: {} };
                    const slot = messages.kendo[args.component.toLowerCase()] = {};
                    readObject(slot, data);

                    console.log(JSON.stringify(messages, null, 2));
                }
            }
        }
    });
}

parseFile();
