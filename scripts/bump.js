const fs = require('fs-extra');
const path = require('path');

async function bumpVersion(type = 'auto') {
    const repoRoot = path.resolve(__dirname, '..');
    const metaPath = path.join(repoRoot, 'src/core/meta.js');
    const filesToSync = [
        path.join(repoRoot, 'package.json'),
        path.join(repoRoot, 'src/ui/menu.js'),
        path.join(repoRoot, 'src/ui/ytm_menu.js'),
        path.join(repoRoot, 'src/utils/api_parsers.js')
    ];

    if (!(await fs.exists(metaPath))) {
        console.error(`Error: ${metaPath} not found`);
        return;
    }

    let content = await fs.readFile(metaPath, 'utf8');
    const versionMatch = content.match(/@version\s+([\d.]+)/);
    
    if (!versionMatch) {
        console.error("Could not find version in core/meta.js");
        return;
    }

    let oldVersion = versionMatch[1];
    let parts = oldVersion.split('.').map(Number);
    while (parts.length < 4) parts.push(0);

    if (type === 'auto' || type === 'build') {
        parts[3]++;
        if (parts[3] >= 10) { parts[3] = 0; parts[2]++; }
        if (parts[2] >= 10) { parts[2] = 0; parts[1]++; }
        if (parts[1] >= 10) { parts[1] = 0; parts[0]++; }
    } else if (type === 'patch') {
        parts[2]++; parts[3] = 0;
    } else if (type === 'minor') {
        parts[1]++; parts[2] = 0; parts[3] = 0;
    } else if (type === 'major') {
        parts[0]++; parts[1] = 0; parts[2] = 0; parts[3] = 0;
    }

    let newVersion = parts.join('.');
    console.log(`Bumping version (${type}): ${oldVersion} -> ${newVersion}`);

    let newContent = content.replace(/(@version\s+)[\d.]+/, `$1${newVersion}`);
    await fs.writeFile(metaPath, newContent, 'utf8');

    for (const filePath of filesToSync) {
        if (await fs.exists(filePath)) {
            let fContent = await fs.readFile(filePath, 'utf8');
            let updatedFContent = fContent.split(oldVersion).join(newVersion);
            await fs.writeFile(filePath, updatedFContent, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
    
    return newVersion;
}

if (require.main === module) {
    const type = process.argv[2] || 'auto';
    bumpVersion(type).catch(console.error);
}

module.exports = { bumpVersion };
