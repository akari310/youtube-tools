const fs = require('fs-extra');
const path = require('path');

async function resplit() {
    const backupPath = path.resolve(__dirname, '../backup.js');
    const srcDir = path.resolve(__dirname, '../src');
    const content = await fs.readFile(backupPath, 'utf8');
    const lines = content.split('\n');

    const findLine = (pattern, startLine = 0) => {
        for (let i = startLine; i < lines.length; i++) {
            if (lines[i].includes(pattern)) return i;
        }
        return -1;
    };

    // We define the END marks only, each file starts where the previous one ended
    const boundaries = [
        { file: 'core/meta.js', endMark: '// ==/UserScript==' },
        { file: 'core/init.js', endMark: '// Create a Trusted Types policy', offset: -1 }, // Stop before the comment
        { file: 'core/policy.js', endMark: '// Styles for our enhancement panel', offset: -1 },
        { file: 'ui/components.js', endMark: 'function Notify(', offset: -1 },
        { file: 'ui/helpers.js', endMark: 'GM_addStyle(`', offset: -1 },
        { file: 'ui/styles.js', endMark: 'function buildYTMToolbar()', offset: -1 },
        { file: 'ui/menu.js', endMark: 'function renderizarButtons()', offset: -1 },
        { file: 'ui/buttons.js', endMark: 'async function startDownloadVideoOrAudio(', offset: -1 },
        { file: 'utils/downloader.js', endMark: '// Define themes', offset: -1 },
        { file: 'features/cinema.js', endMark: 'function setupHeaderObserver()', offset: -1 },
        { file: 'main/observers.js', endMark: 'function isWatchPage()', offset: -1, searchFrom: 'setupHeaderObserver' },
        { file: 'main/manager.js', endMark: 'function applySettings()', offset: -1 },
        { file: 'utils/url.js', endMark: 'function nukeShortsCinematic()', offset: -1 },
        { file: 'main/final.js', endMark: null } // Rest of the file
    ];

    let currentStart = 0;
    for (const b of boundaries) {
        let currentEnd;
        if (b.endMark) {
            const searchFrom = b.searchFrom ? findLine(b.searchFrom, currentStart) : currentStart;
            currentEnd = findLine(b.endMark, searchFrom) + (b.offset || 0) + 1;
        } else {
            currentEnd = lines.length;
        }

        const fileContent = lines.slice(currentStart, currentEnd).join('\n');
        const targetPath = path.join(srcDir, b.file);
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, fileContent, 'utf8');
        console.log(`Wrote ${b.file} [${currentStart + 1}-${currentEnd}]`);
        currentStart = currentEnd;
    }

    console.log('Precise resplit complete!');
}

resplit().catch(console.error);
