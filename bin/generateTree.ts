import path from 'path';
import fs from 'fs';
import readdirp from 'readdirp';
import 'colors';

interface DirectoryStructure {
    [key: string]: DirectoryStructure | string[];
}

async function getDirectoryStructure(dir: string): Promise<DirectoryStructure> {
    const entries = readdirp(dir, { directoryFilter: ['!.git', '!*modules', '!.next'] });
    const structure: DirectoryStructure = {};

    for await (const entry of entries) {
        const relativePath = path.relative(dir, entry.fullPath);
        const parts = relativePath.split(path.sep);
        let current = structure;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                if (!Array.isArray(current['files'])) {
                    current['files'] = [];
                }
                current['files'].push(part);
            } else {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part] as DirectoryStructure;
            }
        }
    }

    return structure;
}

function generateStructureString(structure: DirectoryStructure, indent = '', useColor = true): string {
    const entries = Object.entries(structure);
    let result = '';

    for (let i = 0; i < entries.length; i++) {
        const [name, value] = entries[i];
        const isLast = i === entries.length - 1;

        if (name === 'files') {
            for (let j = 0; j < (value as string[]).length; j++) {
                const file = (value as string[])[j];
                const isFileLast = j === (value as string[]).length - 1;
                const text = indent + (isLast && isFileLast ? '└── ' : '├── ') + (useColor ? file.blue : file);
                if (useColor) {
                    console.log(text);
                }
                result += text + '\n';
            }
        } else {
            const folderName = indent + (isLast ? '└── ' : '├── ') + (useColor ? name.green : name);
            if (useColor) {
                console.log(folderName);
            }
            result += folderName + '\n';
            result += generateStructureString(value as DirectoryStructure, indent + (isLast ? '    ' : '│   '), useColor);
        }
    }

    return result;
}

export default async function genTree(argv: any) {
    const { name } = argv;

    const dir = path.join(process.cwd(), './');
    const structure = await getDirectoryStructure(dir);
    const structureString = generateStructureString(structure, '', !name);

    if (name) {
        const outputDir = path.join(process.cwd(), './output_tree');
        const outputFile = path.join(outputDir, `${name}.txt`);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        fs.writeFileSync(outputFile, structureString, 'utf8');
        console.log(`✨✨✨ File saved at file://${outputFile} ✨✨✨`);
    }
}
