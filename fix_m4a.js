const fs = require('fs');
let code = fs.readFileSync('src/utils/downloader.js', 'utf8');

// Replace tagM4a arguments
code = code.replace(
    /args\.push\('-c:a', 'copy'\);/,
    "args.push('-c:a', 'copy', '-movflags', '+faststart');"
);

fs.writeFileSync('src/utils/downloader.js', code);
console.log('Fixed tagM4a args');
