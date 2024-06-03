import path from "path";
import readdirp from "readdirp";
import fs from "fs";
import _ from "lodash";

async function genPage(argv: any) {
    const name = "genPage";

    const list: any[] = []
    for await (const entry of readdirp(path.join(process.cwd(), '/src/app'), { fileFilter: ['*.tsx', '!layout.tsx'] })) {
        list.push(generateFunctionCode(entry.fullPath, entry.path));
    }

    fs.writeFileSync(path.join(process.cwd(), `src/util/${name}.tsx`,), `export const ${name} = {\n${list.join(',\n')} \n};`, { encoding: 'utf8' });
    console.log(`✨✨✨ file://src/util/${name}.ts DONE ✨✨✨`)

}

function generateFunctionName(filePath: string) {
    let baseFunctionName = filePath
        .replace('/page.tsx', '')
        .replace('.tsx', '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');

    // Tambahkan "By" untuk setiap parameter
    const params = extractParams(filePath);

    if (params.length > 0) {
        const paramPart = params.map((param: string) => 'By' + param.charAt(0).toUpperCase() + param.slice(1)).join('');
        baseFunctionName += paramPart;
    }

    return baseFunctionName;
}


function extractParams(filePath: string) {
    const matches = filePath.match(/\[([^\]]+)\]/g);
    return matches ? matches.map(param => param.replace(/[\[\]]/g, '')) : [];
}

function generateFunctionCode(fullPath: string, filePath: string) {
    const functionName = generateFunctionName(filePath).replace("page", "home");
    const params = extractParams(filePath);
    const paramString = params.map(param => `${param}: string`).join(', ');
    const paramObjString = params.join(', ');

    const apiPath = filePath.replace(/\[([^\]]+)\]/g, '${$1}').replace(/\\/g, '/').replace("/page.tsx", "").replace("page.tsx", "");
    return `
    /**
     *  [${fullPath}](file://${fullPath})
     */
    ${functionName} : (${_.isEmpty(params) ? "" : "{" + paramObjString + "}"}${_.isEmpty(params) ? "" : ":{" + paramString + "}"}) => {
    return \`/${apiPath}\`;
}`

}

export default genPage