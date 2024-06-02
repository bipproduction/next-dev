import fs from 'fs';
import path from 'path';
function isNextJsRootDir() {
    const dir = process.cwd();
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.cjs'];
    const configExists = configFiles.some(name => fs.existsSync(path.join(dir, name)));
    if (configExists) {
        return true;
    }
    return false;

}

export default isNextJsRootDir