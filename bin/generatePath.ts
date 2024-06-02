import path from 'path';
import readdirp from 'readdirp';
import fs from 'fs';
const generatePath = async (argv: any) => {
    for await (const entry of readdirp(path.join(process.cwd(), '/src/ui'), { fileFilter: ['*.tsx'] })) {
        let fileContent = await fs.promises.readFile(entry.fullPath, 'utf8');
        const lines = fileContent.split('\n');

        const updatedLines = lines.map((line, index) => {
            if (line.includes('<DevBox')) {
                const pathStringValue = `vscode://file/${entry.fullPath}:${index + 1}:1`;
                return line.replace(
                    /<DevBox([^>]*)>/g,
                    `<DevBox path="${Buffer.from(pathStringValue).toString('base64')}">`
                );
            }
            return line;
        });

        const updatedContent = updatedLines.join('\n');
        await fs.promises.writeFile(entry.fullPath, updatedContent, 'utf8');

    }

    console.log(`✨✨✨ DONE ✨✨✨`)
}

export default generatePath