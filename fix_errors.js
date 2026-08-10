const fs = require('fs');
let code = fs.readFileSync('src/utils/downloader.js', 'utf8');

const catchOld = \            } catch (e) {
                console.warn('Metadata tagging failed:', e);
                if (e.message && e.message.includes('corrupted')) {
                    downloadText.textContent = '? L?i: Server tr? v? file h?ng. Vui l?ng t?i l?i.';
                    progressFill.style.backgroundColor = '#ff4444';
                    return;
                }
                downloadText.textContent = 'Tagging failed, downloading direct...';
                GM_download({\;
const catchNew = \            } catch (e) {
                console.warn('Metadata tagging failed:', e);
                const msg = e.message || '';
                if (msg.includes('corrupted') || msg.includes('HTTP ')) {
                    throw e; // Throw network/corruption errors to trigger provider fallback!
                }
                downloadText.textContent = 'Tagging failed, downloading direct...';
                GM_download({\;

code = code.replace(catchOld, catchNew);

fs.writeFileSync('src/utils/downloader.js', code);
console.log('Fixed catch block!');
