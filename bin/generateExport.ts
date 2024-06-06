import readdirp from 'readdirp';
import fs from 'fs';
import path from 'path';

export default async function genExport(argv: any) {
    const dir = argv.dir;
    const listFilter = argv.listFilter || ['*.ts', '*.tsx'];

    // Initialize an array to hold export statements
    const exportStatements: string[] = [];

    // Read files in the directory excluding 'index.*'
    for await (const entry of readdirp(path.join(process.cwd(), dir), { fileFilter: [...listFilter, '!index.*'] })) {
        const relativePath = path.relative(path.join(process.cwd(), dir), entry.fullPath);
        const importPath = `./${relativePath.replace(/\\/g, '/').replace(/\.[jt]sx?$/, '')}`;

        // Generate export statement and add it to the array
        const fileName = path.basename(relativePath, path.extname(relativePath));
        exportStatements.push(`export { default as ${fileName} } from '${importPath}';`);
    }

    // Combine all export statements into a single string
    const indexContent = exportStatements.join('\n');

    // Write the export statements to 'index.ts' in the given directory
    await fs.promises.writeFile(path.join(process.cwd(), dir, 'index.ts'), indexContent, 'utf8');

    console.log(`✨✨✨ index.ts generated in ${dir} ✨✨✨`);
}
