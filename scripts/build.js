const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');
const UglifyJS = require('uglify-js');

async function build() {
    const repoRoot = path.resolve(__dirname, '..');
    const srcDir = path.join(repoRoot, 'src');
    const outputFile = path.join(repoRoot, 'youtube-tools.user.js');

    console.log('Starting build process...');

    // Get ordered subdirectories
    const subdirs = (await fs.readdir(srcDir, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort();

    let combinedContent = '';
    let totalFiles = 0;

    for (const subdir of subdirs) {
        const subdirPath = path.join(srcDir, subdir);
        const files = (await glob(path.join(subdirPath, '*.js').replace(/\\/g, '/'))).sort();
        
        for (const filePath of files) {
            const content = await fs.readFile(filePath, 'utf8');
            combinedContent += content + '\n';
            totalFiles += 1;
        }
    }

    // Write the combined file
    await fs.writeFile(outputFile, combinedContent, 'utf8');
    console.log(`Successfully built ${outputFile} from ${totalFiles} files.`);

    // Optional: Create a minified version for production
    const minifiedFile = path.join(repoRoot, 'youtube-tools.min.user.js');
    
    // Separate metadata (the // ==UserScript== block) from logic for minification
    const metaMatch = combinedContent.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
    const metadata = metaMatch ? metaMatch[0] : '';
    const logic = combinedContent.replace(metadata, '');

    const minified = UglifyJS.minify(logic);
    if (minified.error) {
        console.warn('Minification failed (likely syntax error):', minified.error);
    } else {
        await fs.writeFile(minifiedFile, metadata + '\n' + minified.code, 'utf8');
        const originalSize = (combinedContent.length / 1024).toFixed(2);
        const minifiedSize = ((metadata.length + minified.code.length) / 1024).toFixed(2);
        console.log(`Minified version created: ${minifiedFile} (${originalSize}KB -> ${minifiedSize}KB)`);
    }
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
