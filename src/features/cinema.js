    // Define themes
    const themes = [{
        name: 'Default / Reload',
        gradient: '',
        textColor: '',
        raised: '',
        btnTranslate: '',
        CurrentProgressVideo: '',
        videoDuration: '',
        colorIcons: '',
        textLogo: '',
        primaryColor: '',
        secondaryColor: '',
    }, {
        name: 'Midnight Blue',
        gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        textColor: '#ffffff',
        raised: '#1e3a8a',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Forest Green',
        gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
        textColor: '#ffffff',
        raised: '#14532d',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Sunset Orange',
        gradient: 'linear-gradient(135deg, #7c2d12, #f97316)',
        textColor: '#ffffff',
        raised: '#7c2d12',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Royal Purple',
        gradient: 'linear-gradient(135deg, #2e1065, #4c1d95)',
        textColor: '#ffffff',
        raised: '#4c1d95',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Cherry Blossom',
        gradient: 'linear-gradient(135deg, #a9005c, #fc008f)',
        textColor: '#ffffff',
        raised: '#fc008f',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Red Dark',
        gradient: 'linear-gradient(135deg, #790909, #f70131)',
        textColor: '#ffffff',
        raised: '#790909',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Raind ',
        gradient: 'linear-gradient(90deg, #3f5efb 0%, #fc466b 100%)',
        textColor: '#ffffff',
        raised: '#3f5efb',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Neon',
        gradient: 'linear-gradient(273deg, #ee49fd 0%, #6175ff 100%)',
        textColor: '#ffffff',
        raised: '#ee49fd',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Azure',
        gradient: 'linear-gradient(273deg, #0172af 0%, #74febd 100%)',
        textColor: '#ffffff',
        raised: '#0172af',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Butterfly',
        gradient: 'linear-gradient(273deg, #ff4060 0%, #fff16a 100%)',
        textColor: '#ffffff',
        raised: '#ff4060',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Colombia',
        gradient: 'linear-gradient(174deg, #fbf63f  0%, #0000bb 45%, #ff0000 99%)',
        textColor: '#ffffff',
        raised: '#0000bb',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    },];

    // Create our enhancement panel
    const panel = $cl('div');

    panel.id = 'yt-enhancement-panel';

    const panelOverlay = $cl('div');
    panelOverlay.id = 'panel-overlay';
    $ap(panelOverlay);

    // Generate theme options HTML
    const themeOptionsHTML = themes
        .map(
            (theme, index) => `
        <label >
          <div class="theme-option">
          <div class="theme-preview" style="background: ${theme.gradient};"></div>
          <input type="radio" name="theme" value="${index}" ${index === 0 ? 'checked' : ''
                }>
              <span style="${theme.name === 'Default / Reload Page' ? 'color: red; ' : ''}" class="theme-name">${theme.name}</span>
              </div>
        </label>
    `
        )
        .join('');

    const languageOptionsHTML = Object.entries(languagesTranslate)
        .map(([code, name]) => {
            const selected = code === 'en' ? 'selected' : '';
            return `<option value="${code}" ${selected}>${name}</option>`;
        })
        .join('');



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
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle"> Sync Ambient Mode YT
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2;">
          <div class="select-wrapper-mdcm">
            <label>Side/Playlist Panel Style:
              <select class="tab-button-active" id="side-panel-style-select">
                <option value="blur">Blur</option>
                <option value="liquid">Liquid Glass</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>
          </div>
        </div>
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
          <div class="options-mdcm themes-grid-mdcm">
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
    <span style="color: #fff" ;>v${GM_info.script.version}</span>
  </div>
  `;
    panel.innerHTML = safeHTML(menuHTML);

    $ap(panel);


    let headerObserver = null;