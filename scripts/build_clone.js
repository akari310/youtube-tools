const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');
const UglifyJS = require('uglify-js');

async function build() {
    const repoRoot = path.resolve(__dirname, '..');
    const srcDir = path.join(repoRoot, "src_clone");
    const outputFile = path.join(repoRoot, 'youtube-tools-clone.user.js');

    console.log('Starting clean build process...');

    // Explicit order of directories to ensure script structure integrity
    const FOLDER_ORDER = ['core', 'utils', 'ui', 'features', 'main'];
    
    // Explicit order for specific files that must be at the very start/end
    const CORE_FILE_ORDER = ['meta.js', 'init.js', 'state.js', 'storage.js'];
    const MAIN_FILE_ORDER = ['manager.js', 'observers.js', 'final.js'];

    let combinedContent = '';
    let totalFiles = 0;

    for (const folder of FOLDER_ORDER) {
        const folderPath = path.join(srcDir, folder);
        if (!(await fs.exists(folderPath))) continue;

        let files = await fs.readdir(folderPath);
        files = files.filter(f => f.endsWith('.js'));

        // Apply custom sorting for sensitive folders
        if (folder === 'core') {
            files.sort((a, b) => {
                const idxA = CORE_FILE_ORDER.indexOf(a);
                const idxB = CORE_FILE_ORDER.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });
        } else if (folder === 'main') {
            files.sort((a, b) => {
                const idxA = MAIN_FILE_ORDER.indexOf(a);
                const idxB = MAIN_FILE_ORDER.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });
        } else {
            files.sort(); // Alphabetical is fine for utils, ui, features
        }

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const content = await fs.readFile(filePath, 'utf8');
            combinedContent += content + '\n';
            totalFiles += 1;
        }
    }

    await fs.writeFile(outputFile, combinedContent, 'utf8');
    console.log(`Successfully built ${outputFile} from ${totalFiles} files using clean structure.`);

    // Minification
    const minifiedFile = path.join(repoRoot, 'youtube-tools-clone.min.user.js');
    const metaMatch = combinedContent.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
    const metadata = metaMatch ? metaMatch[0] : '';
    const logic = combinedContent.replace(metadata, '');

    const minified = UglifyJS.minify(logic);
    if (minified.error) {
        console.warn('Minification failed:', minified.error);
    } else {
        await fs.writeFile(minifiedFile, metadata + '\n' + minified.code, 'utf8');
        console.log(`Minified: ${minifiedFile} (${(combinedContent.length / 1024).toFixed(1)}KB -> ${((metadata.length + minified.code.length) / 1024).toFixed(1)}KB)`);
    }
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});

