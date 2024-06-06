import fs from 'fs';
import path from 'path';
function isNextJsRootDir() {
    const dir = process.cwd();
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.cjs'];
    const configExists = configFiles.some(name => fs.existsSync(path.join(dir, name)));
    if (configExists) {
        return true;
    }

    console.log("please run in next project root".yellow);
    process.exit(1);

}

export default isNextJsRootDir