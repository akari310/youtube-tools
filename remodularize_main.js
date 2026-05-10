const fs = require('fs');
const path = require('path');

const srcFile = 'youtube-tools-clone.user.js';
const content = fs.readFileSync(srcFile, 'utf8');
const lines = content.split('\n');

// Find the end of metadata
let metaEnd = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// ==/UserScript==')) {
        metaEnd = i + 1;
        break;
    }
}

// Find the start of IIFE
let iifeStart = metaEnd;
for (let i = metaEnd; i < lines.length; i++) {
    if (lines[i].includes('(function () {') || lines[i].includes('(function() {')) {
        iifeStart = i + 1;
        break;
    }
}

// Find the end of IIFE
let iifeEnd = lines.length - 1;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '})();') {
        iifeEnd = i;
        break;
    }
}

const meta = lines.slice(0, metaEnd).join('\n');
const init = lines.slice(metaEnd, iifeStart).join('\n');
const body = lines.slice(iifeStart, iifeEnd).join('\n');
const final = lines.slice(iifeEnd).join('\n');

const dirs = ['src/core', 'src/utils', 'src/ui', 'src/features', 'src/main'];
dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            fs.unlinkSync(path.join(dir, file));
        });
    } else {
        fs.mkdirSync(dir, { recursive: true });
    }
});

fs.writeFileSync('src/core/meta.js', meta);
fs.writeFileSync('src/core/init.js', init);
fs.writeFileSync('src/main/manager.js', body);
fs.writeFileSync('src/main/final.js', final);

console.log('Successfully cleaned and re-modularized the main 9k line file!');
