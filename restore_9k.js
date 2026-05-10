const fs = require('fs');
const path = require('path');

const srcFile = 'backup.js'; // The original 9392 line file
const content = fs.readFileSync(srcFile, 'utf8');
const lines = content.split('\n');

// Standard split points for backup.js
// Lines 1-41: Metadata
// Line 42: (function () {
// Lines 43-9391: Body
// Line 9392: })();

const meta = lines.slice(0, 41).join('\n');
const init = lines.slice(41, 42).join('\n');
const body = lines.slice(42, 9391).join('\n');
const final = lines.slice(9391).join('\n');

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

// Also sync to src_clone
const dirsClone = ['src_clone/core', 'src_clone/utils', 'src_clone/ui', 'src_clone/features', 'src_clone/main'];
dirsClone.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            fs.unlinkSync(path.join(dir, file));
        });
    } else {
        fs.mkdirSync(dir, { recursive: true });
    }
});
fs.writeFileSync('src_clone/core/meta.js', meta);
fs.writeFileSync('src_clone/core/init.js', init);
fs.writeFileSync('src_clone/main/manager.js', body);
fs.writeFileSync('src_clone/main/final.js', final);

console.log('Successfully restored build system to clean 9392 lines!');
