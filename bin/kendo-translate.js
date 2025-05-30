#!/usr/bin/env node
'use strict';

const {glob} = require('glob');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const cheerio = require('cheerio');
const translate = require('xlf-translate');
const Task = require('data.task');
const R = require('ramda');

const args = (() => {
    const argparse = require('argparse');
    const parser = new argparse.ArgumentParser({
        add_help: true,
        description: 'Populates Kendo UI for Angular messages in i18n message files'
    });

    parser.add_argument('file', {
        help: 'XLIFF file to process, e.g. "src/i18n/messages.en.xlf"',
    });

    parser.add_argument('-l', '--locale', {
        help: 'the locale ID, for example "en-US"',
        required: true
    });

    parser.add_argument('-f', '--force', {
        help: 'overwrites existing translations',
        default: false,
        action: 'store_true'
    });

    parser.add_argument('-e', '--encoding', {
        help: 'Specifies the message files encoding. Default is "utf-8".',
        default: 'utf-8'
    });

    return parser.parse_args();
})();

const msgRoot = path.resolve(__dirname, '../messages');

const langFiles = `/**/*.${args.locale}.yml`;

const extendAll = R.reduce(R.mergeWith(R.mergeRight), {});

const complete = (reject, resolve) => (error, result) => {
    error ? reject(error) : resolve(result);
};

// findFiles :: String => Task [FilePath]
const findFiles = (wildcard) =>
    new Task((reject, resolve) => {
      glob(wildcard, { nocase: true, root: msgRoot }).then(resolve).catch(reject);
    });

//  readFile :: FilePath -> Task FileContent
const readFile = filename => new Task((reject, resolve) => {
    fs.readFile(filename, args.encoding, complete(reject, resolve));
});

// parseYaml :: FileContent -> Task YML
const parseYaml = data => new Task((reject, resolve) => {
    try {
        resolve(yaml.load(data));
    } catch (e) {
        reject(e);
    }
});

// parseXml :: FileContent -> Task XML
const parseXml = data => new Task((reject, resolve) => {
    const doc = cheerio.load(data, { xmlMode: true, decodeEntities: false })
    resolve(doc);
});

// parseYamlFile :: FilePath -> Task YML
const parseYamlFile = R.pipe(readFile, R.chain(parseYaml));

// parseXmlFile :: FilePath -> Task XML
const parseXmlFile = R.pipe(readFile, R.chain(parseXml));

// safeTranslate :: XML -> YML -> Task XML Stats
const safeTranslate = R.curry((data, translations) => new Task((reject, resolve) => {
    try {
        const stats = translate(data, translations, args.force);
        resolve({data, stats});
    } catch(e) {
        reject(e);
    }
}));

// writeFile :: (XML, Stats) -> Task Stats
const writeFile = obj => new Task((reject, resolve) => {
    const out = obj.data.html();

    try {
        fs.writeFileSync(args.file, out);
        resolve(obj.stats);
    } catch(e) {
        reject(e);
    }
});

// processFiles :: (FilePath -> Task a) -> [FilePath] -> Task a
const processFiles = (processor, guard) => R.pipe(
    findFiles,
    R.chain(guard),
    R.map(R.map(processor)),
    R.chain(R.sequence(Task.of))
);

// translations :: [FilePath] -> Task YML
const translations = R.pipe(
    processFiles(parseYamlFile, Task.of),
    R.map(extendAll)
);

// mergeTranslations :: FilePath -> YML -> XML
const mergeTranslations = path => translations => R.pipe(
    parseXmlFile,
    R.chain(xmlFile => safeTranslate(xmlFile, translations))
)(path);

const main = () => {
    translations(langFiles)
        .chain(mergeTranslations(args.file))
        .chain(writeFile)
        .fork(console.error, stats => {
            console.info('Done.');
            console.info(`  ${stats.count} targets translated.`);
            console.info(`  ${stats.skip} non-empty targets skipped. Use --force to overwrite.`);
        });
}

main();


