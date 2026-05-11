const fs = require('fs-extra');
const path = require('path');
const UglifyJS = require('uglify-js');

async function build() {
    const repoRoot = path.resolve(__dirname, '..');
    const srcDir = path.join(repoRoot, 'src');
    const outputFile = path.join(repoRoot, 'youtube-tools.user.js');

    console.log('Starting clean build process based on backup structure...');

    // Explicit file order based on backup.js structure to ensure functionality
    const FILE_ORDER = [
        'core/meta.js',
        'core/init.js',
        'core/policy.js',
        'ui/components.js',
        'ui/helpers.js',
        'ui/styles.js',
        'ui/menu.js',
        'ui/buttons.js',
        'utils/downloader.js',
        'features/cinema.js',
        'main/observers.js',
        'main/manager.js',
        'utils/url.js',
        'main/final.js'
    ];

    let combinedContent = '';
    let totalFiles = 0;

    for (const relativePath of FILE_ORDER) {
        const filePath = path.join(srcDir, relativePath);
        if (!(await fs.exists(filePath))) {
            console.warn(`Warning: Missing file ${relativePath}`);
            continue;
        }
        const content = await fs.readFile(filePath, 'utf8');
        combinedContent += content + '\n';
        totalFiles += 1;
    }

    await fs.writeFile(outputFile, combinedContent, 'utf8');
    console.log(`Successfully built ${outputFile} from ${totalFiles} files.`);

}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
