import path from 'path';
import readdirp from 'readdirp';
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as fs from 'fs';
import prettier from 'prettier';

export default async function clearDevBox(argv: any) {
    const log: boolean = argv.log;

    console.log(log ? "✨✨✨ START WITH LOG ✨✨✨" : "✨✨✨ START WITHOUT LOG ✨✨✨");
    for await (const entry of readdirp(path.join(process.cwd(), '/src/ui'), { fileFilter: ['*.tsx'] })) {

        // Format the initial code with prettier
        const fileContent = (await fs.promises.readFile(entry.fullPath, 'utf8')).toString();
        if (fileContent.includes("use dev")) {
            log && console.log(`Clearing ${entry.fullPath}...`);
            await processClearBox({ stringCode: fileContent, fullPath: entry.fullPath, log });
        }
    }

    console.log(`✨✨✨ DONE ✨✨✨`);
}

async function processClearBox({ stringCode, fullPath, log }: { stringCode: string, fullPath: string, log: boolean }) {
    // Format the initial code with prettier
    log && console.log(`Formating ${fullPath}...`);
    let code = await prettier.format(stringCode, { parser: "typescript" });
    let ast: parser.ParseResult<any>;

    try {
        log && console.log("Parsing code...");
        // Parse code into AST
        ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
    } catch (error) {
        console.error("Parsing error:", (error as Error).message);
        return;
    }

    try {
        const newCodeSegments: string[] = [];
        let lastIndex = 0;

        log && console.log("Traversing code...");
        traverse(ast, {
            JSXElement(path) {

                log && console.log("Traversing JSXElement...");
                const openingElement = (path.node.openingElement.name as any).name;

                if (openingElement === "DevBox") {
                    log && console.log("Found DevBox, removing it...");
                    const start = path.node.loc?.start.index;
                    const end = path.node.loc?.end.index;
                    if (start !== undefined && end !== undefined) {
                        log && console.log(`Removing DevBox from ${path.node.loc?.start.line}:${path.node.loc?.start.column} to ${path.node.loc?.end.line}:${path.node.loc?.end.column}`);
                        const innerJSX = path.node.children.map(child =>
                            code.substring(child.loc!.start.index!, child.loc!.end.index!)
                        ).join('');

                        // Add previous segment and the inner JSX
                        log && console.log("Adding previous segment and inner JSX...");
                        newCodeSegments.push(code.substring(lastIndex, start));
                        newCodeSegments.push(innerJSX);
                        lastIndex = end;
                    }
                }
            }
        });

        // Add the remaining part of the code
        newCodeSegments.push(code.substring(lastIndex));

        let newCode = newCodeSegments.join('');

        // Remove DevBox import if no longer needed
        log && console.log("Removing DevBox import if no longer needed...");
        newCode = newCode.replace(/import { DevBox } from "next-dev";\s*/, '');

        // Format the new code with prettier
        log && console.log("Formatting code...");
        const formattedCode = await prettier.format(newCode, { parser: "typescript" });

        // Write the new code to the file
        log && console.log("Writing new code to file...");
        await fs.promises.writeFile(fullPath, formattedCode, "utf8");
    } catch (error) {
        console.error("Traversal error:", (error as Error).message);
        return;
    }
}
