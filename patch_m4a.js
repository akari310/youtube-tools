const fs = require('fs');

let dlCode = fs.readFileSync('src/utils/downloader.js', 'utf8');

// 1. Inject validation step in tagM4a
const validationCode = 
            // Validate input audio stream
            downloadText.textContent = 'Validating Audio...';
            const validateArgs = ['-v', 'error', '-i', 'input.m4a', '-f', 'null', '-'];
            const validateExitCode = core.exec(...validateArgs);
            if (validateExitCode !== 0) {
                throw new Error('Server returned a corrupted M4A file');
            }
            
            downloadText.textContent = 'Muxing M4A...';;

dlCode = dlCode.replace(/downloadText\.textContent = 'Muxing M4A\.\.\.';/, validationCode);

// 2. Modify catch block in downloadWithTags
const newCatchBlock = 
            } catch (e) {
                console.warn('Metadata tagging failed:', e);
                if (e.message && e.message.includes('corrupted')) {
                    downloadText.textContent = '? L?i: Server tr? v? file h?ng. Vui l?ng t?i l?i.';
                    progressFill.style.backgroundColor = '#ff4444';
                    return;
                }
                downloadText.textContent = 'Tagging failed, downloading direct...';
                GM_download({;

dlCode = dlCode.replace(/} catch \(e\) \{\s+console\.warn\('Metadata tagging failed:', e\);\s+downloadText\.textContent = 'Tagging failed, downloading direct\.\.\.';\s+GM_download\(\{/, newCatchBlock);

fs.writeFileSync('src/utils/downloader.js', dlCode);
console.log('Patched downloader.js');
