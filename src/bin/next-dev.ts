#!/usr/bin/env node
import yargs from 'yargs';
import { generate } from './generate';

; (async () => {
    yargs()
        .command(
            "gen",
            "generate next dev",
            yargs => yargs,
            generate
        )
        .recommendCommands()
        .demandCommand(1)
        .parse(process.argv.splice(2))
})()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })


