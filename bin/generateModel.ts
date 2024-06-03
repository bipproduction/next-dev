import path from 'path';
import fs from 'fs';
import prettier from 'prettier';

function jsonToTypeScript(json: any, interfaceName: string = 'RootObject'): string {
    const getType = (value: any): string => {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const arrayType = getType(value[0]);
                return `${arrayType}[]`;
            } else {
                return 'any[]';
            }
        } else if (typeof value === 'object' && value !== null) {
            return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${getType(v)}`).join('; ')} }`;
        } else if (typeof value === 'string') {
            return 'string';
        } else if (typeof value === 'number') {
            return 'number';
        } else if (typeof value === 'boolean') {
            return 'boolean';
        } else {
            return 'any';
        }
    };

    const buildInterface = (name: string, obj: any): string => {
        const entries = Object.entries(obj).map(([key, value]) => {
            const type = getType(value);
            return `${key}: ${type};`;
        }).join('\n  ');

        return `export interface ${name} {\n  ${entries}\n}`;
    };

    const interfaces: string[] = [];
    const processObject = (obj: any, name: string) => {
        const interfaceString = buildInterface(name, obj);
        interfaces.push(interfaceString);

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                processObject(value, capitalizeFirstLetter(key));
            }
        }
    };

    const capitalizeFirstLetter = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    processObject(json, interfaceName);
    return interfaces.reverse().join('\n\n');
}

async function fetchJsonFromUrl(url: string): Promise<any> {
    const response = await fetch(url);
    return await response.json();
}

function readJsonFromFile(filePath: string): any {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
}

async function readJsonFromDir(dirPath: string): Promise<{ name: string; json: any }[]> {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));
    const jsonObjects = files.map(file => {
        const filePath = path.join(dirPath, file);
        return { name: path.basename(file, '.json'), json: readJsonFromFile(filePath) };
    });
    return jsonObjects;
}

export default async function genModel(argv: any) {
    const { log, out, name, url, file, dir } = argv;

    if (!url && !file && !dir) {
        throw new Error("You must provide one of the following: url, file, or dir");
    }

    const outputDir = path.resolve(process.cwd(), out);
    if (!fs.existsSync(outputDir)) {
        log && console.log(`Creating output directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
    }

    if (url) {
        log && console.log(`Fetching JSON from URL: ${url}`);
        const json = await fetchJsonFromUrl(url);
        await processAndSaveJson(json, name, outputDir, log);
    } else if (file) {
        log && console.log(`Reading JSON from file: ${file}`);
        const json = readJsonFromFile(file);
        const outputName = path.basename(file, '.json');
        await processAndSaveJson(json, outputName, outputDir, log);
    } else if (dir) {
        log && console.log(`Reading JSON from directory: ${dir}`);
        const jsonObjects = await readJsonFromDir(dir);
        for (const { name, json } of jsonObjects) {
            await processAndSaveJson(json, name, outputDir, log);
        }
    }
}

async function processAndSaveJson(json: any, name: string, outputDir: string, log: boolean) {
    log && console.log(`Saving ${name}.ts to ${outputDir}`);
    if (Array.isArray(json)) {
        if (json.length === 0) {
            throw new Error("The JSON array is empty.");
        }
        json = json[0]; // Use the first element of the array for generating the interface
    }

    const tsInterfaces = jsonToTypeScript(json, name);
    const prettyTsInterfaces = await prettier.format(tsInterfaces, { parser: "typescript" });

    const outputFile = path.join(outputDir, `${name}.ts`);

    log && console.log(`Writing ${outputFile}`);
    fs.writeFileSync(outputFile, prettyTsInterfaces, 'utf8');
    console.log(`✨✨✨ file://${outputFile} DONE ✨✨✨`);
}
