import path from "path";
import readdirp from "readdirp";
import fs from "fs";
import _ from "lodash";

const generateApi = async (argv: any) => {
    const name = "genFetchApi";

    const list: any[] = []
    for await (const entry of readdirp(path.join(process.cwd(), '/src/app/api'), { fileFilter: '*.ts' })) {
        list.push(generateFunctionCode(entry.fullPath, entry.path));
    }

    fs.writeFileSync(path.join(process.cwd(), `src/util/${name}.ts`,), `import app_config from "./app_config";\n export const ${name} = {${list.join(',')}};`, { encoding: 'utf8' });
    console.log(`✨✨✨ file://src/util/${name}.ts DONE ✨✨✨`)
}

function generateFunctionName(filePath: string) {
    let baseFunctionName = filePath
        .replace('/route.ts', '')  // Menghapus bagian "route.ts"
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

function detectHttpMethod(fullPath: string) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/export\s+async\s+function\s+(GET|POST|DELETE|PUT|PATCH)\s*\(/);
    return match ? match[1].toUpperCase() : 'GET'; // Default to GET if no method found
}

function detectRequestBodyType(fullPath: string) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/interface\s+BODY\s*{([^}]*)}/);
    if (match) {
        const bodyParams = match[1].trim().split('\n').map(param => {
            const [name, type] = param.trim().split(':').map(item => item.trim());
            let paramType = 'string'; // Default to string if type is not explicitly defined
            if (type.includes('number')) {
                paramType = 'number';
            } else if (type.includes('any[]') || type.includes('[]')) {
                paramType = 'any[]';
            } else if (type.includes('boolean')) {
                paramType = 'boolean';
            } else if (type.includes('object')) {
                paramType = 'object';
            } else if (type.includes('Date')) {
                paramType = 'Date';
            } else if (type.includes('{[key: string]: any}')) {
                paramType = '{[key: string]: any}';
            } else if (type.includes('any')) {
                paramType = 'any';
            }
            return { name, type: paramType };
        });
        return bodyParams;
    }
    return [];
}


function generateFunctionCode(fullPath: string, filePath: string) {
    const functionName = generateFunctionName(filePath);
    const params = extractParams(filePath);
    const method = detectHttpMethod(fullPath);
    const paramString = params.map(param => `${param}: string`).join(', ');
    const paramObjString = params.join(', ');

    const apiPath = filePath.replace(/\[([^\]]+)\]/g, '${$1}').replace(/\\/g, '/'); // Replace params and backslashes for URL

    const bodyParams = detectRequestBodyType(fullPath);
    let bodyString = '';
    if (method === 'POST' && bodyParams.length > 0) {
        bodyString = ', body: { ' + bodyParams.map(param => param.name + ': ' + param.type).join(', ') + ' }';
    }

    if (params.length > 0) {
        return `
/**
 *  [${fullPath}](file://${fullPath})
 *  @param {${_.isEmpty(bodyParams) ? "" : "{" + bodyParams.map(param => param.name + ": " + param.type).join(', ') + "}"}} ${bodyParams.length > 0 ? "body" : ""}
 *  @param {boolean} isServer
 *  @param {string} searchParams ?key=value
 */
${functionName} : async ({${paramObjString}, isServer${_.isEmpty(bodyParams) ? "" : ",body"}, searchParams}: {${paramString}${bodyString}, isServer?: boolean${bodyString}, searchParams?: string}) => {
   
    return fetch(\`\${isServer && app_config.host || ''}/api/${apiPath.replace('route.ts', '').slice(0, -1)}\$\{searchParams || ''}\`, { method: '${method}', ${_.isEmpty(bodyParams) ? "" : "body: JSON.stringify(body),"} cache: 'no-cache' })
        .then(res => res.json());
}
`;
    } else {
        return `
/**
 *  [${fullPath}](file://${fullPath})
 *  @param {${_.isEmpty(bodyParams) ? "" : "{" + bodyParams.map(param => param.name + ": " + param.type).join(', ') + "}"}} ${bodyParams.length > 0 ? "body" : ""}
 *  @param {boolean} isServer
 *  @param {string} searchParams ?key=value
 */
${functionName} : async ({isServer${_.isEmpty(bodyParams) ? "" : ",body"}, searchParams}: {isServer?: boolean${bodyString}, searchParams?: string}) => {

    return fetch(\`\${isServer && app_config.host || ''}/api/${apiPath.replace('route.ts', '').slice(0, -1)}\$\{searchParams || ''}\`, { method: '${method}', ${_.isEmpty(bodyParams) ? "" : "body: JSON.stringify(body),"}  cache: 'no-cache' })
        .then(res => res.json());
}
`;
    }
}

export default generateApi