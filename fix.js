const fs = require('fs');

let b = fs.readFileSync('src/ui/buttons.js', 'utf8');
b = b.replace(
    'dlAudio.dataset.quality = \'m4a\';',
    'dlAudio.dataset.quality = \'mp3\';'
);
b = b.replace(
    'dlAudio.textContent = \'MP3 / M4A (Audio)\';',
    'dlAudio.textContent = \'MP3 (Audio)\';'
);
b = b.replace(
    '<option value=\"m4a\" selected>M4A (T?t nh?t)</option>',
    ''
);
b = b.replace(
    '<option value=\"mp3\">MP3 (Ph? bi?n)</option>',
    '<option value=\"mp3\" selected>MP3 (Ph? bi?n)</option>'
);
fs.writeFileSync('src/ui/buttons.js', b);

let d = fs.readFileSync('src/utils/downloader.js', 'utf8');
let i1 = d.indexOf('// ?? M4A: embed metadata using ffmpeg-core directly');
let i2 = d.indexOf('// ?? Main: download audio with metadata tags ??');
if (i1 !== -1 && i2 !== -1) {
    d = d.slice(0, i1) + d.slice(i2);
}
d = d.replace(/} else if \(fmtLower === 'm4a'\) \{[\s\S]*?\}/, '}');
fs.writeFileSync('src/utils/downloader.js', d);
console.log('done');
