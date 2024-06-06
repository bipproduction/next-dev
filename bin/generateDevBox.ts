import path from 'path';
import readdirp from 'readdirp';
import fs from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import prettier from 'prettier';

export default async function generateDevBox(argv: any) {
    const log: boolean = argv.log;
    console.log(log ? "START WITH LOG" : "START WITHOUT LOG ");
    for await (const entry of readdirp(path.join(process.cwd(), '/src/ui'), { fileFilter: ['*.tsx'] })) {
        let fileContent = await fs.promises.readFile(entry.fullPath, 'utf8');
        fileContent = useDevModify(fileContent, log);
        if (fileContent.includes("use dev")) {
            await processDevBox({ stringCode: fileContent, fullPath: entry.fullPath, log });
        }
    }

    console.log(`✨✨✨ DONE ✨✨✨`);
}

function useDevModify(text: string, log: boolean): string {
    const lines = text.split('\n');

    // Check if "use dev" is already in the first or second line
    if (lines.length > 0 && lines[0].includes('use dev')) {
        log && console.log(`use dev already present in ${path.basename(lines[0])}`);
        return text; // "use dev" already present in the first line, no need to modify
    }
    if (lines.length > 1 && lines[1].includes('use dev')) {
        log && console.log(`use dev already present in ${path.basename(lines[1])}`);
        return text; // "use dev" already present in the second line, no need to modify
    }

    // Check if the first line has "use client"
    if (lines.length > 0 && lines[0].includes('use client')) {
        // If the second line is empty, add "use dev"
        log && console.log(`use dev added to ${path.basename(lines[0])}`);
        if (lines.length === 1 || lines[1].trim() === '') {
            log && console.log(`use dev added to ${path.basename(lines[0])}`);
            lines.splice(1, 0, '\"use dev\"'); // Add "use dev" to the second line
        } else {
            log && console.log(`use dev added to ${path.basename(lines[1])}`);
            lines.splice(1, 0, '\"use dev\"'); // Insert "use dev" at the second line
        }
    } else {
        // Add "use dev" to the first line
        log && console.log(`use dev added to ${path.basename(lines[0])}`);
        lines.unshift('\"use dev\"');
    }

    return lines.join('\n');
}


async function processDevBox({ stringCode, fullPath, log }: { stringCode: string, fullPath: string, log: boolean }) {
    let formattedCode = await prettier.format(stringCode, { parser: "typescript" });

    let ast: parser.ParseResult<any>;

    try {
        // Parse code into AST
        ast = parser.parse(formattedCode, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
    } catch (error) {
        console.error(`Parsing error: ${fullPath}`.red, (error as Error).message);
        return;
    }

    let hasDevBoxImport = false;
    try {
        const newCodeSegments: string[] = [];
        let lastIndex = 0;

        traverse(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === "next-dev") {
                    path.node.specifiers.forEach((specifier: any) => {
                        if (specifier.imported.name === "DevBox") {
                            hasDevBoxImport = true;
                        }
                    });
                }
            },
            ReturnStatement(innerPath) {

                if (innerPath.node.argument && innerPath.node.argument.type === "JSXElement") {
                    const jsxElement = innerPath.node.argument;

                    if (jsxElement.openingElement.type === "JSXOpeningElement" &&
                        (jsxElement.openingElement.name as any).name === "DevBox") {
                        // Update the path value
                        const start = jsxElement.loc!.start.index!;
                        const end = jsxElement.loc!.end.index!;
                        const mainBody = formattedCode.substring(start, end);

                        const line = jsxElement.loc!.start.line;
                        const pathStringValue = `vscode://file/${fullPath}:${line + 1}:1`;
                        const newPathAttribute = `path="${Buffer.from(pathStringValue).toString('base64')}"`;

                        const updatedBody = mainBody.replace(/path=".*?"/, newPathAttribute);

                        newCodeSegments.push(formattedCode.substring(lastIndex, start));
                        newCodeSegments.push(updatedBody);
                        lastIndex = end;

                        return;
                    }

                    const start = jsxElement.loc!.start.index!;
                    const end = jsxElement.loc!.end.index!;
                    const mainBody = formattedCode.substring(start, end);

                    const line = jsxElement.loc!.start.line;
                    const pathStringValue = `vscode://file/${fullPath}:${line + 1}:1`;
                    newCodeSegments.push(formattedCode.substring(lastIndex, start));
                    newCodeSegments.push(`<DevBox path="${Buffer.from(pathStringValue).toString('base64')}">\n${mainBody}\n</DevBox>`);
                    lastIndex = end;
                }
            }
        });

        newCodeSegments.push(formattedCode.substring(lastIndex));

        let newCode = newCodeSegments.join('');

        if (!hasDevBoxImport) {
            log && console.log("Importing DevBox...".green, fullPath);
            newCode = newCode.replace(/['"]\s*use dev\s*['"]/g, `'use dev';\nimport { DevBox } from 'next-dev';`)

        } else {
            log && console.log("DevBox already imported, skipping...".yellow, fullPath);
        }

        const finalFormattedCode = await prettier.format(newCode, { parser: "typescript" });

        await fs.promises.writeFile(fullPath, finalFormattedCode, "utf8");
        log && console.log(`Updated file: ${fullPath}`);
    } catch (error) {
        console.error(`Traversal error: ${fullPath}`.red, (error as Error).message);
    }
}
