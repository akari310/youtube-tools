const fs = require('fs');
const path = require('path');

const managerPath = 'src/main/manager.js';
let content = fs.readFileSync(managerPath, 'utf8');

// 1. Add menu option
const menuSearch = '<input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle"> Sync Ambient Mode YT';
const menuAdd = `
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2; \${isYTMusic ? 'display:none' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Playlist Panel Style (YT):
              <select class="tab-button-active" id="playlist-style-select">
                <option value="blur">Blur Glass</option>
                <option value="liquid">Liquid Glass</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>
          </div>
        </div>`;
content = content.replace(menuSearch, menuSearch + menuAdd);

// 2. Add saveSettings
const saveSearch = "sidePanelStyle: $id('side-panel-style-select') ? $id('side-panel-style-select').value : 'normal',";
const saveAdd = "\n            playlistStyle: $id('playlist-style-select') ? $id('playlist-style-select').value : 'blur',";
content = content.replace(saveSearch, saveSearch + saveAdd);

// 3. Add loadSettings
const loadSearch = "if ($id('side-panel-style-select')) $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';";
const loadAdd = "\n        if ($id('playlist-style-select')) $id('playlist-style-select').value = settings.playlistStyle || 'blur';";
content = content.replace(loadSearch, loadSearch + loadAdd);

// 4. Add applySettings call
const applySearch = "initializeHeaderButtons();";
const applyAdd = "\n        if (!isYTMusic && typeof applyPlaylistRedesign === 'function') applyPlaylistRedesign();\n        ";
content = content.replace(applySearch, applyAdd + applySearch);

// 5. Append function definition
const extraCode = `
    // ---------------------------------------------------------
    // Playlist Redesign Module (YouTube Main)
    // Adds Glassmorphism / Liquid styles to the playlist panel
    // ---------------------------------------------------------
    function applyPlaylistRedesign() {
        if (isYTMusic) return;
        const rawSettings = GM_getValue('ytSettingsMDCM', '{}');
        let settings = {};
        try { settings = JSON.parse(rawSettings); } catch(e) {}
        const style = settings.playlistStyle || 'blur';
        
        const panel = document.querySelector('ytd-playlist-panel-renderer');
        if (!panel) return;

        panel.classList.remove('yt-playlist-style-blur', 'yt-playlist-style-liquid', 'yt-playlist-style-transparent');
        panel.classList.add(\`yt-playlist-style-\${style}\`);

        if (!document.getElementById('yt-playlist-redesign-css')) {
            const css = \`
                ytd-playlist-panel-renderer.yt-playlist-style-blur {
                    background: rgba(15, 15, 15, 0.7) !important;
                    backdrop-filter: blur(25px) saturate(160%) !important;
                    -webkit-backdrop-filter: blur(25px) saturate(160%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                }
                ytd-playlist-panel-renderer.yt-playlist-style-liquid {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)) !important;
                    backdrop-filter: blur(40px) brightness(1.1) !important;
                    -webkit-backdrop-filter: blur(40px) brightness(1.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
                    border-radius: 16px !important;
                }
                ytd-playlist-panel-renderer.yt-playlist-style-transparent {
                    background: transparent !important;
                    border: none !important;
                }
                ytd-playlist-panel-renderer[class*="yt-playlist-style-"] #container,
                ytd-playlist-panel-renderer[class*="yt-playlist-style-"] #items-container {
                    background: transparent !important;
                }
            \`;
            const styleEl = document.createElement('style');
            styleEl.id = 'yt-playlist-redesign-css';
            styleEl.textContent = css;
            document.head.appendChild(styleEl);
        }
    }
`;
content += extraCode;

fs.writeFileSync(managerPath, content);
console.log('Successfully patched the 9k line manager with new features!');
