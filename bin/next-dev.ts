#!/usr/bin/env ts-node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import isNextJsRootDir from "./isNextRootDir";
import "colors";
import generateDevBox from "./generateDevBox";
import generateApi from "./generateApi";
import generatePage from "./generatePage";
import fs from "fs";
import clearDevBox from "./clearDevBox";

const app_config = `
const port = process.env.PORT || 3005;
const localhost = \`http://localhost:\${port}\`;
const serverHost = 'https://wibu-server.wibudev.com';
const isLocal = process.env.NODE_ENV === 'development';
const app_config = {
    title: 'Wibu Server',
    description: 'Server Untuk Wibu',
    host:  isLocal ? localhost : serverHost,
    isLocal
}

export default app_config;
`;

if (!isNextJsRootDir()) {
    console.log("please run in next project root".yellow);
    process.exit(1);
}

if (!fs.existsSync("./src/util")) {
    fs.mkdirSync("./src/util");
    console.log("create dir util");
}

if (!fs.existsSync("./src/util/app_config.ts")) {
    fs.writeFileSync("./src/util/app_config.ts", app_config, {
        encoding: "utf8",
    });
    console.log("create app_config.ts");
}

yargs(hideBin(process.argv))
    .command(
        "gen-box",
        "generate DevBox",
        (yargs) => yargs.option("log", { alias: "l", type: "boolean", default: false }),
        async (argv) => {
            try {
                await generateDevBox(argv);
            } catch (error) {
                console.error(`Error generating DevBox: ${error}`.red);
            }
        }
    )
    .command(
        "clear-box",
        "clear DevBox",
        (yargs) => yargs.option("log", { alias: "l", type: "boolean", default: false }),
        async (argv) => {
            try {
                await clearDevBox(argv);
            } catch (error) {
                console.error(`Error clearing DevBox: ${error}`.red);
            }
        }
    )
    .command(
        "gen-api",
        "generate API",
        (yargs) => yargs.option("log", { alias: "l", type: "boolean", default: false }),
        async (argv) => {
            try {
                await generateApi(argv);
            } catch (error) {
                console.error(`Error generating API: ${error}`.red);
            }
        }
    )
    .command(
        "gen-page",
        "generate Page",
        (yargs) => yargs.option("log", { alias: "l", type: "boolean", default: false }),
        async (argv) => {
            try {
                await generatePage(argv);
            } catch (error) {
                console.error(`Error generating Page: ${error}`.red);
            }
        }
    )
    .recommendCommands()
    .demandCommand(1)
    .help()
    .parse();
