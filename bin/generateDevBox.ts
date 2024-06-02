import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as fs from 'fs';
import prettier from 'prettier';

export default async function generateDevBox({ stringCode, fullPath }: { stringCode: string, fullPath: string }) {
    const code = await prettier.format(stringCode, { parser: "typescript" });
    let ast: parser.ParseResult<any>;
    try {
        // Parse code into AST
        ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
    } catch (error) {
        console.error("Parsing error:", (error as Error).message);
        return;
    }

    let hasDevBoxImport = false;
    let lineNumber = 0;
    try {
        const newCodeSegments: string[] = [];
        let lastIndex = 0;

        traverse(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === "next-dev") {
                    console.log(path.node.source.value);
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

                    // Check if the JSXElement is already wrapped with DivBox
                    if (jsxElement.openingElement.type === "JSXOpeningElement" &&
                        (jsxElement.openingElement.name as any).name === "DivBox") {
                        return;
                    }

                    const start = jsxElement.loc!.start.index!;
                    const end = jsxElement.loc!.end.index!;
                    const mainBody = code.substring(start, end);

                    lineNumber +=2
                    const line = jsxElement.loc!.start.line + lineNumber;
                    const pathStringValue = `vscode://file/${fullPath}:${line}:1`;
                    // Add previous segment and the wrapped JSXElement
                    newCodeSegments.push(code.substring(lastIndex, start));
                    newCodeSegments.push(`<DevBox path="${Buffer.from(pathStringValue).toString('base64')}">\n${mainBody}\n</DevBox>`);
                    lastIndex = end;
                    
                }
            }
        });

        // Add the remaining part of the code
        newCodeSegments.push(code.substring(lastIndex));

        let newCode = newCodeSegments.join('');
        if (!hasDevBoxImport) {
            newCode = newCode.replace(/.*use dev.*/, `'use dev';\nimport { DevBox } from "next-dev";`);
        }

        // Format the new code with prettier
        const formattedCode = await prettier.format(newCode, { parser: "typescript" });

        fs.writeFileSync(fullPath, formattedCode);
        console.log(hasDevBoxImport ? "✨✨✨ DevBox updated ✨✨✨" : "✨✨✨ DevBox added ✨✨✨");
        console.log("New file created: " + fullPath);
    } catch (error) {
        console.error("Traversal error:", (error as Error).message);
        return;
    }
}
