    function checkDarkModeActive() {
        // YTM is always dark mode
        if (isYTMusic) return 'dark';

        const prefCookie = document.cookie.split('; ').find(c => c.startsWith('PREF='));
        if (!prefCookie) return 'light';

        const prefValue = prefCookie.substring(5);
        const params = new URLSearchParams(prefValue);

        const f6Value = params.get('f6');
        const darkModes = ['400', '4000000', '40000400', '40000000'];

        return darkModes.includes(f6Value) ? 'dark' : 'light';
    }


    let isDarkModeActive = checkDarkModeActive();


    // Use Trusted Types to set innerHTML
    const menuHTML = `
   <div class="container-mdcm">
    <div class="header-mdcm">
      <h1> <i class="fa-brands fa-youtube"></i> YouTube Tools</h1>
      <div class="icons-mdcm">
        <a href="https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js"
          target="_blank">
          <button class="icon-btn-mdcm">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </a>
        <a href="https://github.com/akari310" target="_blank">
          <button class="icon-btn-mdcm">
            <i class="fa-brands fa-github"></i>
          </button>
        </a>
        <button class="icon-btn-mdcm" id="shareBtn-mdcm">
          <i class="fa-solid fa-share-alt"></i>
        </button>
        <button class="icon-btn-mdcm" id="importExportBtn">
          <i class="fa-solid fa-file-import"></i>
        </button>
        <button id="menu-settings-icon" class="icon-btn-mdcm tab-mdcm" data-tab="menu-settings">
          <i class="fa-solid fa-gear"></i>
        </button>
        <button class="icon-btn-mdcm close_menu_settings">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <div class="tabs-mdcm">
      <button class="tab-mdcm active" data-tab="general">
        <i class="fa-solid fa-shield-halved"></i>
        General
      </button>
      <button class="tab-mdcm" data-tab="themes">
        <i class="fa-solid fa-palette"></i>
        Themes
      </button>
      <button class="tab-mdcm" data-tab="stats">
        <i class="fa-solid fa-square-poll-vertical"></i>
        Stats
      </button>
      <button class="tab-mdcm" data-tab="headers">
        <i class="fa-regular fa-newspaper"></i>
        Header
      </button>
    </div>


    <div id="general" class="tab-content active">

      <div class="options-mdcm">
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="hide-comments-toggle"> Hide Comments
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="hide-sidebar-toggle"> Hide Sidebar
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="autoplay-toggle"> Disable Autoplay
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="subtitles-toggle"> Disable Subtitles
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="dislikes-toggle"> Show Dislikes
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="like-dislike-bar-toggle"> Like vs Dislike bar
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="bookmarks-toggle"> Bookmarks (timestamps)
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="continue-watching-toggle"> Continue watching
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="shorts-channel-name-toggle"> Shorts: show channel name
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="nonstop-playback-toggle"> Nonstop playback
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="audio-only-toggle"> Audio-only mode
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="audio-only-tab-toggle"> Audio-only this tab
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="themes-toggle"> Active Themes
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="translation-toggle"> Translate comments
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="avatars-toggle"> Download avatars
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="reverse-mode-toggle"> Reverse mode
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="cinematic-lighting-toggle"> ${isYTMusic ? 'Ambient Mode' : 'Cinematic Mode'}
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="wave-visualizer-toggle"> Wave visualizer Beta
          </div>
        </label>
        <label ${!isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="custom-timeline-color-toggle"> Royal Purple Timeline
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2; ${!isYTMusic ? 'display:none' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Side Panel Style (YTM):
              <select class="tab-button-active" id="side-panel-style-select">
                <option value="blur">Blur</option>
                <option value="liquid">Liquid Glass</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>
          </div>
        </div>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle"> Sync Ambient Mode YT
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2;">
          <div class="select-wrapper-mdcm">
            <label>Effect wave visualizer:
              <select class="tab-button-active" id="select-wave-visualizer-select">
                <option value="linea">Line smooth</option>
                <option value="barras">Vertical bars</option>
                <option value="curva">Curved</option>
                <option value="picos">Smooth peaks</option>
                <option value="solida">Solid wave</option>
                <option value="dinamica">Dynamic wave</option>
                <option value="montana">Smooth mountain</option>
              </select>
            </label>
          </div>
        </div>
        <div class="quality-selector-mdcm" style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Default video player quality:
              <select class="tab-button-active" id="select-video-qualitys-select">
                <option value="user">User Default</option>
                <option value="">Auto</option>
                <option value="144">144</option>
                <option value="240">240</option>
                <option value="360">360</option>
                <option value="480">480</option>
                <option value="720">720</option>
                <option value="1080">1080</option>
                <option value="1440">1440</option>
                <option value="2160">2160</option>
                <option value="4320">4320</option>
              </select>
            </label>
          </div>
        </div>
        <div class="quality-selector-mdcm" style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Language for translate comments:
              <select class="tab-button-active" id="select-languages-comments-select">
              ${languageOptionsHTML}
              </select>
            </label>
          </div>
        </div>
        <div class="slider-container-mdcm" style="grid-column: span 2;">
          <label>Video Player Size: <span id="player-size-value">100</span>%</label>
          <input type="range" id="player-size-slider" class="slider-mdcm" min="50" max="150" value="100">
          <button class="reset-btn-mdcm" id="reset-player-size">Reset video size</button>
        </div>
      </div>
    </div>

    <div id="themes" class="tab-content">
     <div id="background-image-container" class="background-image-container">
     <h4>Background Image</h4>
  <input type="file" id="background_image" accept="image/png, image/jpeg" style="display:none;" />
  <div id="background-image-preview" class="background-image-preview">
    <span class="background-image-overlay">
      <i class="fa fa-camera"></i>
      <span class="background-image-text">Select image</span>
    </span>
    <button id="remove-background-image" class="remove-background-image" title="Quitar fondo">&times;</button>
  </div>
</div>
      <div class="themes-hidden">
        <div class="options-mdcm" style="margin-bottom: 10px;">
          <div>
            <h4>Choose a Theme</h4>
            <p>Disable Mode Cinematic on General</p>
            ${isDarkModeActive === 'dark' ? '' : '<p style="color: red; margin: 10px 0;font-size: 11px;">Activate dark mode to use this option</p>'}
          </div>
        </div>
        <div class="options-mdcm">
          <label>
            <div class="theme-option option-mdcm">
              <input type="radio" class="radio-mdcm" name="theme" value="custom" checked>
              <span class="theme-name">Custom</span>
            </div>
          </label>
          <label>
            <div class="theme-option option-mdcm theme-selected-normal">
              <input type="radio" class="radio-mdcm" name="theme" value="normal">
              <span class="theme-name">Selected Themes</span>
            </div>
          </label>
        </div>
        <div class="themes-options">
          <div class="options-mdcm">
            ${themeOptionsHTML}
          </div>
        </div>
        <div class="theme-custom-options">
          <div class="options-mdcm">
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Progressbar Video:</label>
                <input type="color" id="progressbar-color-picker" class="color-picker-mdcm" value="#ff0000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Background Color:</label>
                <input type="color" id="bg-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Primary Color:</label>
                <input type="color" id="primary-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Secondary Color:</label>
                <input type="color" id="secondary-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Header Color:</label>
                <input type="color" id="header-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Icons Color:</label>
                <input type="color" id="icons-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Menu Color:</label>
                <input type="color" id="menu-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Line Color Preview:</label>
                <input type="color" id="line-color-picker" class="color-picker-mdcm" value="#ff0000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Time Color Preview:</label>
                <input type="color" id="time-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="stats" class="tab-content">
      <div id="yt-stats-toggle">
        <div class="stat-row">
          <div>Foreground Time</div>
          <div class="progress">
            <div class="progress-bar total-bar" id="usage-bar"></div>
          </div>
          <div id="total-time">0h 0m 0s</div>
        </div>
        <div class="stat-row">
          <div>Video Time</div>
          <div class="progress">
            <div class="progress-bar video-bar" id="video-bar"></div>
          </div>
          <div id="video-time">0h 0m 0s</div>
        </div>
        <div class="stat-row">
          <div>Shorts Time</div>
          <div class="progress">
            <div class="progress-bar shorts-bar" id="shorts-bar"></div>
          </div>
          <div id="shorts-time">0h 0m 0s</div>
        </div>
      </div>
    </div>

    <div id="headers" class="tab-content">
      <div class="options-mdcm">
        <label>Available in next update</label>
      </div>
    </div>


    <div id="menu-settings" class="tab-content">
      <div class="options-mdcm">
        <h4 style="margin: 10px 0">Menu Appearance</h4>
      </div>
      <div class="options-settings-mdcm">
        <div class="option-settings-mdcm">
          <label>Backgrounds:</label>
          <div class="color-boxes" id="bg-color-options">
            <div class="color-box" data-type="bg" data-value="#252525" style="background-color: #252525;"></div>
            <div class="color-box" data-type="bg" data-value="#1e1e1e" style="background-color: #1e1e1e;"></div>
            <div class="color-box" data-type="bg" data-value="#3a3a3a" style="background-color: #3a3a3a;"></div>
            <div class="color-box" data-type="bg" data-value="#4a4a4a" style="background-color: #4a4a4a;"></div>
            <div class="color-box" data-type="bg" data-value="#000000" style="background-color: #000000;"></div>
            <div class="color-box" data-type="bg" data-value="#00000000" style="background-color: #00000000;"></div>
            <div class="color-box" data-type="bg" data-value="#2d2d2d" style="background-color: #2d2d2d;"></div>
            <div class="color-box" data-type="bg" data-value="#444" style="background-color: #444;"></div>
          </div>
        </div>

        <div class="option-settings-mdcm">
          <label>Accent Colors:</label>
          <div class="color-boxes" id="bg-accent-color-options">
            <div class="color-box" data-type="accent" data-value="#ff0000" style="background-color: #ff0000;"></div>
            <div class="color-box" data-type="accent" data-value="#000000" style="background-color: #000000;"></div>
            <div class="color-box" data-type="accent" data-value="#009c37 " style="background-color: #009c37 ;"></div>
            <div class="color-box" data-type="accent" data-value="#0c02a0 " style="background-color: #0c02a0 ;"></div>
          </div>
        </div>

        <div class="option-settings-mdcm">
          <label>Titles Colors:</label>
          <div class="color-boxes" id="text-color-options">
            <div class="color-box" data-type="color" data-value="#ffffff" style="background-color: #ffffff;"></div>
            <div class="color-box" data-type="color" data-value="#cccccc" style="background-color: #cccccc;"></div>
            <div class="color-box" data-type="color" data-value="#b3b3b3" style="background-color: #b3b3b3;"></div>
            <div class="color-box" data-type="color" data-value="#00ffff" style="background-color: #00ffff;"></div>
            <div class="color-box" data-type="color" data-value="#00ff00" style="background-color: #00ff00;"></div>
            <div class="color-box" data-type="color" data-value="#ffff00" style="background-color: #ffff00;"></div>
            <div class="color-box" data-type="color" data-value="#ffcc00" style="background-color: #ffcc00;"></div>
            <div class="color-box" data-type="color" data-value="#ff66cc" style="background-color: #ff66cc;"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="importExportArea">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3>Import / Export Settings</h3>
        <button class="icon-btn-mdcm" id="closeImportExportBtn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <textarea id="config-data" placeholder="Paste configuration here to import"></textarea>
      <div class="action-buttons-mdcm">
        <button id="export-config" class="action-btn-mdcm">Export</button>
        <button id="import-config" class="action-btn-mdcm">Import</button>
      </div>
    </div>

    <div id="shareDropdown">
      <a href="https://www.facebook.com/sharer/sharer.php?u=${urlSharedCode}" target="_blank" data-network="facebook"
        class="share-link"><i class="fa-brands fa-facebook"></i> Facebook</a><br>
      <a href="https://twitter.com/intent/tweet?url=${urlSharedCode}" target="_blank" data-network="twitter"
        class="share-link"><i class="fa-brands fa-twitter"></i> Twitter</a><br>
      <a href="https://api.whatsapp.com/send?text=${urlSharedCode}" target="_blank" data-network="whatsapp"
        class="share-link"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a><br>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${urlSharedCode}" target="_blank"
        data-network="linkedin" class="share-link"><i class="fa-brands fa-linkedin"></i> LinkedIn</a><br>
    </div>


  </div>
  <div class="actions-mdcm">
    <div class="developer-mdcm">
      <div style="font-size: 11px; opacity: 0.9; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; line-height: 1.6;">
        Developed by <a href="https://github.com/akari310" target="_blank" style="color: #ff4444; text-decoration: none;"><i class="fa-brands fa-github"></i> Akari</a>. 
        Base by <a href="https://github.com/DeveloperMDCM" target="_blank" style="color: #00aaff; text-decoration: none;"><i class="fa-brands fa-github"></i> MDCM</a>. 
        Features from <a href="https://github.com/nvbangg" target="_blank" style="color: #00ffaa; text-decoration: none;"><i class="fa-brands fa-github"></i> nvbangg</a>.
      </div>
    </div>
    <span style="color: #fff" ;>v0.0.5.9</span>
  </div>
  `;
    panel.innerHTML = safeHTML(menuHTML);

    $ap(panel);


    let headerObserver = null;
    function setupHeaderObserver() {
        if (headerObserver) return;
        const target = $e('#masthead-container') || $e('ytd-masthead') || document.body;
        headerObserver = new MutationObserver(() => {
            const icon = $id('icon-menu-settings');
            if (!icon || !document.body.contains(icon)) {
                addIcon();
            }
        });
        headerObserver.observe(target, { childList: true, subtree: true });
    }

    function addIcon() {
        const existing = $id('icon-menu-settings');
        if (existing && document.body.contains(existing)) return;
        if (existing) existing.closest('#toggle-button')?.remove();

        let anchor;
        if (isYTMusic) {
            anchor = $e('#right-content');
        } else {
            anchor = $e('ytd-topbar-menu-button-renderer') || $e('#buttons') || $e('#end');
        }
        if (!anchor) return;

        const toggleButton = $cl('div');
        toggleButton.id = 'toggle-button';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.marginRight = '8px';

        const icon = $cl('i');
        icon.id = 'icon-menu-settings';
        icon.classList.add('fa-solid', 'fa-gear');
        icon.style.fontSize = '20px';

        toggleButton.appendChild(icon);

        if (isYTMusic) {
            anchor.insertBefore(toggleButton, anchor.firstChild);
        } else {
            anchor.parentElement.insertBefore(toggleButton, anchor);
        }

        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        setupHeaderObserver();
    }

    let openMenu = false;
    function toggleMenu() {
        openMenu = !openMenu;
        panel.style.display = openMenu ? 'block' : 'none';
        panelOverlay.style.display = openMenu ? 'block' : 'none';
    }

    // Close panel when clicking the overlay
    panelOverlay.addEventListener('click', () => {
        if (openMenu) {
            toggleMenu();
        }
    });


    addIcon();
    const close_menu_settings = $e('.close_menu_settings');
    if (close_menu_settings) {
        close_menu_settings.addEventListener('click', () => {
            toggleMenu();
        });
    }

    // $ap(toggleButton);
    
    // Add change listener to the entire panel to save/apply settings immediately
    panel.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox-mdcm') || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
            saveSettings();
            if (typeof applySettings === 'function') {
                applySettings();
            }
        }
    });

    // Specific listeners for live updates of certain features
    $id('dislikes-toggle')?.addEventListener('change', () => {
        const st = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        if (!st.dislikes) {
            // Hide dislikes if turned off
            const dislikes_content = $e('#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button');
            if (dislikes_content) {
                // We don't have the original SVG easily, but we can at least hide our custom one or clear it
                // For now, let's just trigger a reload message or try to refresh the component
                // Actually, the user just wants it to go away.
                dislikes_content.style.width = '';
                // We'll let applySettings handle the bar, but for the button, we might need a refresh or more complex logic.
                // But let's try to at least call applySettings.
            }
        }
    });



    // Tab functionality
    const tabButtons = $m('.tab-mdcm');
    const tabContents = $m('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));
            button.classList.add('active');
            $id(tabName).classList.add('active');
        });
    });

    // Function to save settings
    function saveSettings() {
        const settings = {
            theme: $e('input[name="theme"]:checked').value,
            bgColorPicker: $id('bg-color-picker').value,
            progressbarColorPicker: $id('progressbar-color-picker').value,
            primaryColorPicker: $id('primary-color-picker').value,
            secondaryColorPicker: $id('secondary-color-picker').value,
            headerColorPicker: $id('header-color-picker').value,
            iconsColorPicker: $id('icons-color-picker').value,
            menuColorPicker: $id('menu-color-picker').value,
            lineColorPicker: $id('line-color-picker').value,
            timeColorPicker: $id('time-color-picker').value,
            dislikes: $id('dislikes-toggle').checked,
            likeDislikeBar: $id('like-dislike-bar-toggle').checked,
            bookmarks: $id('bookmarks-toggle').checked,
            continueWatching: $id('continue-watching-toggle').checked,
            shortsChannelName: $id('shorts-channel-name-toggle').checked,
            nonstopPlayback: $id('nonstop-playback-toggle') ? $id('nonstop-playback-toggle').checked : true,
            audioOnly: $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false,
            themes: $id('themes-toggle').checked,
            translation: $id('translation-toggle').checked,
            avatars: $id('avatars-toggle').checked,
            reverseMode: $id('reverse-mode-toggle').checked,
            waveVisualizer: $id('wave-visualizer-toggle').checked,
            waveVisualizerSelected: $id('select-wave-visualizer-select').value,
            hideComments: $id('hide-comments-toggle').checked,
            hideSidebar: $id('hide-sidebar-toggle').checked,
            disableAutoplay: $id('autoplay-toggle').checked,
            cinematicLighting: $id('cinematic-lighting-toggle').checked,
            syncCinematic: $id('sync-cinematic-toggle') ? $id('sync-cinematic-toggle').checked : false, // NUEVO SETTING
            sidePanelStyle: $id('side-panel-style-select') ? $id('side-panel-style-select').value : 'normal',
            customTimelineColor: $id('custom-timeline-color-toggle') ? $id('custom-timeline-color-toggle').checked : false,
            disableSubtitles: $id('subtitles-toggle') ? $id('subtitles-toggle').checked : false,
            // fontSize: $id('font-size-slider').value,
            playerSize: $id('player-size-slider').value,
            selectVideoQuality: $id('select-video-qualitys-select').value,
            languagesComments: $id('select-languages-comments-select').value,
            // menuBgColor: $id('menu-bg-color-picker').value,
            // menuTextColor: $id('menu-text-color-picker').value,
            menu_akari: {
                bg: selectedBgColor,
                color: selectedTextColor,
                accent: selectedBgAccentColor
            }
            // menuFontSize: $id('menu-font-size-slider').value,
        };

        GM_setValue(SETTINGS_KEY, JSON.stringify(settings));
    }



    // Function to load settings
    function loadSettings() {
        const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        // Mark as loaded early so applySettings/saveSettings don't overwrite persisted values with defaults.
        __ytToolsRuntime.settingsLoaded = true;

        if (settings.theme) {
            $e(`input[name="theme"][value="${settings.theme}"]`).checked = true;
        }
        const menuData = settings.menu_akari || settings.menu_developermdcm || {
            bg: "#252525",
            color: "#ffffff",
            accent: "#ff0000"
        };

        $id('bg-color-picker').value = settings.bgColorPicker || '#000000';
        $id('progressbar-color-picker').value = settings.progressbarColorPicker || '#ff0000';
        $id('primary-color-picker').value = settings.primaryColorPicker || '#ffffff';
        $id('secondary-color-picker').value = settings.secondaryColorPicker || '#ffffff';
        $id('header-color-picker').value = settings.headerColorPicker || '#000';
        $id('icons-color-picker').value = settings.iconsColorPicker || '#ffffff';
        $id('menu-color-picker').value = settings.menuColorPicker || '#000';
        $id('line-color-picker').value = settings.lineColorPicker || '#ff0000';
        $id('time-color-picker').value = settings.timeColorPicker || '#ffffff';
        $id('dislikes-toggle').checked = settings.dislikes || false;
        $id('like-dislike-bar-toggle').checked = settings.likeDislikeBar || false;
        $id('bookmarks-toggle').checked = settings.bookmarks || false;
        $id('continue-watching-toggle').checked = settings.continueWatching || false;
        $id('shorts-channel-name-toggle').checked = settings.shortsChannelName || false;
        if ($id('nonstop-playback-toggle')) $id('nonstop-playback-toggle').checked = settings.nonstopPlayback !== false;
        if ($id('audio-only-toggle')) $id('audio-only-toggle').checked = settings.audioOnly || false;
        syncAudioOnlyTabCheckbox(settings);
        $id('themes-toggle').checked = settings.themes || false;
        $id('translation-toggle').checked = settings.translation || false;
        $id('avatars-toggle').checked = settings.avatars || false;
        $id('reverse-mode-toggle').checked = settings.reverseMode || false;
        $id('wave-visualizer-toggle').checked = settings.waveVisualizer || false;
        $id('select-wave-visualizer-select').value = settings.waveVisualizerSelected || 'dinamica';
        $id('hide-comments-toggle').checked = settings.hideComments || false;
        $id('hide-sidebar-toggle').checked = settings.hideSidebar || false;
        $id('autoplay-toggle').checked = settings.disableAutoplay || false;
        $id('cinematic-lighting-toggle').checked = settings.cinematicLighting || false;
        if ($id('sync-cinematic-toggle')) $id('sync-cinematic-toggle').checked = settings.syncCinematic || false;
        if ($id('side-panel-style-select')) $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';
        if ($id('custom-timeline-color-toggle')) $id('custom-timeline-color-toggle').checked = settings.customTimelineColor || false;
        if ($id('subtitles-toggle')) $id('subtitles-toggle').checked = settings.disableSubtitles || false;
        $id('player-size-slider').value = settings.playerSize || 100;
        $id('select-video-qualitys-select').value = settings.selectVideoQuality || 'user';
        $id('select-languages-comments-select').value = settings.languagesComments || 'en';

        selectedBgColor = menuData.bg;
        selectedTextColor = menuData.color;
        selectedBgAccentColor = menuData.accent;


        $m('#bg-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedBgColor);
        });

        $m('#text-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedTextColor);
        });

        $m('#bg-accent-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedBgAccentColor);
        });

        // Apply menu colors
        $sp('--yt-enhance-menu-bg', selectedBgColor);
        $sp('--yt-enhance-menu-text', selectedTextColor);
        $sp('--yt-enhance-menu-accent', selectedBgAccentColor);
        updateSliderValues();

        setTimeout(() => {
            applySettings();
            if (settings.dislikes && !isYTMusic) {
                videoDislike();
                shortDislike();
                showDislikes = true;
            }

            if (!isYTMusic && window.location.href.includes('youtube.com/watch?v=')) {
                detectInitialCinematicState();
            }
        }, 500);
    }

    // Check if the video is in cinematic mode
    async function detectInitialCinematicState() {
        return new Promise((resolve) => {
            const waitForVideo = () => {
                const video = $e('video');
                const cinematicDiv = $id('cinematics');

                if (!video || !cinematicDiv || isNaN(video.duration) || video.duration === 0) {
                    setTimeout(waitForVideo, 500);
                    return;
                }

                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                if (!settings.syncCinematic) {
                    // apply cinematic toggle
                    const cinematicToggle = $id('cinematic-lighting-toggle');
                    if (cinematicToggle && cinematicDiv) {
                        cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
                    }
                    resolve(false);
                    return;
                }

                const startTime = video.currentTime;
                const checkPlayback = () => {
                    if (video.currentTime >= startTime + 1) {
                        const isActive = isCinematicActive();

                        const cinematicToggle = $id('cinematic-lighting-toggle');
                        if (cinematicToggle && cinematicToggle.checked !== isActive) {
                            cinematicToggle.checked = isActive;
                            saveSettings();
                        }

                        resolve(isActive);
                    } else {
                        setTimeout(checkPlayback, 300);
                    }
                };

                checkPlayback();
            };

            waitForVideo();
        });
    }

    $m('.color-box').forEach(box => {
        box.addEventListener('click', () => {
            const type = box.dataset.type;
            const value = box.dataset.value;

            if (type === 'bg') {
                selectedBgColor = value;
                $sp('--yt-enhance-menu-bg', value);
                $m('#bg-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            } else if (type === 'color') {
                selectedTextColor = value;
                $sp('--yt-enhance-menu-text', value);
                $m('#text-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            } else if (type === 'accent') {
                selectedBgAccentColor = value;
                $sp('--yt-enhance-menu-accent', value);
                $m('#bg-accent-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            }
            saveSettings();
        });
    });


    function updateSliderValues() {
        $id('player-size-value').textContent = $id('player-size-slider').value;

    }

    $id('reset-player-size').addEventListener('click', () => {
        $id('player-size-slider').value = 100;
        updateSliderValues();
        applySettings();
    });

    // Initialize header buttons once
    function initializeHeaderButtons() {
        const shareBtn = $id('shareBtn-mdcm');
        const importExportBtn = $id('importExportBtn');
        const closeImportExportBtn = $id('closeImportExportBtn');

        if (shareBtn && !shareBtn.dataset.initialized) {
            shareBtn.dataset.initialized = 'true';
            shareBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                const dropdown = $id('shareDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }

        if (importExportBtn && !importExportBtn.dataset.initialized) {
            importExportBtn.dataset.initialized = 'true';
            importExportBtn.addEventListener('click', function () {
                const importExportArea = $id('importExportArea');
                if (importExportArea) {
                    importExportArea.classList.toggle('active');
                }
            });
        }

        if (closeImportExportBtn && !closeImportExportBtn.dataset.initialized) {
            closeImportExportBtn.dataset.initialized = 'true';
            closeImportExportBtn.addEventListener('click', function () {
                const importExportArea = $id('importExportArea');
                if (importExportArea) {
                    importExportArea.classList.remove('active');
                }
            });
        }
    }



    // Persistent check to ensure the gear icon survives YouTube's dynamic UI updates
    // setupHeaderObserver() is now called inside addIcon()
