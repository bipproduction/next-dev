#!/usr/bin/env ts-node
import yargs from 'yargs';
import isNextJsRootDir from './isNextRootDir';
import 'colors'
import generatePath from './generatePath';
import generateApi from './generateApi';
import generatePage from './generatePage';
import fs from 'fs';

const app_config = `
const port = process.env.PORT || 3005;
const localhost = \`http://localhost:\${port}\`;
const serverHost = 'https://wibu-server.wibudev.com'
const isLocal = process.env.NODE_ENV === 'development';
const app_config = {
    title: 'Wibu Server',
    description: 'Server Untuk Wibu',
    host:  isLocal ? localhost : serverHost,
    isLocal
}

export default app_config
`;

if (!isNextJsRootDir()) {
    console.log('please run in next project root'.yellow);
    process.exit(1);
}

if (!fs.existsSync("./src/util")) {
    // ? create dir util
    fs.mkdirSync("./src/util");
    console.log('create dir util');
}

if (!fs.existsSync("./src/util/app_config.ts")) {
    // ? create app_config.ts
    fs.writeFileSync("./src/util/app_config.ts", app_config, { encoding: 'utf8' });
    console.log('create app_config.ts');
};

yargs()
    .command(
        "gen-path",
        "generate path for DevBox",
        yargs => yargs,
        generatePath
    )
    .command(
        "gen-api",
        "generate api",
        yargs => yargs,
        generateApi
    )
    .command(
        "gen-page",
        "generate page",
        yargs => yargs,
        generatePage
    )
    .recommendCommands()
    .demandCommand(1)
    .parse(process.argv.splice(2))