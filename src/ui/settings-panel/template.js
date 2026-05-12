// ===========================================
// Settings Panel HTML & DOM Construction
// Extracted from legacy-full.js lines 4800-5800
// ===========================================
import { $cl, $ap, $id, isYTMusic } from '../../utils/dom.js';
import { THEMES } from '../../themes/theme-data.js';
import { safeHTML } from '../../utils/trusted-types.js';

const html = String.raw;

// Pre-compute HTML segments
const themeOptionsHTML = THEMES.map(
  (theme, index) => `
    <label>
      <div class="theme-option">
      <div class="theme-preview" style="background: ${theme.gradient};"></div>
      <input type="radio" name="theme" value="${index}" ${index === 0 ? 'checked' : ''}>
          <span style="${theme.name === 'Default / Reload Page' ? 'color: red; ' : ''}" class="theme-name">${theme.name}</span>
          </div>
    </label>
`
).join('');

const languagesTranslate = {
  en: 'English',
  es: 'Spanish',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  hi: 'Hindi',
  ar: 'Arabic',
  pt: 'Portuguese',
  bn: 'Bengali',
  ru: 'Russian',
  ja: 'Japanese',
  pa: 'Punjabi',
  de: 'German',
  jv: 'Javanese',
  vi: 'Vietnamese',
  ko: 'Korean',
  fr: 'French',
  tr: 'Turkish',
  it: 'Italian',
  te: 'Telugu',
  mr: 'Marathi',
};

const languageOptionsHTML = Object.entries(languagesTranslate)
  .map(([code, name]) => `<option value="${code}">${name}</option>`)
  .join('');

function checkDarkModeActive() {
  if (isYTMusic) return 'dark';
  const prefCookie = document.cookie.split('; ').find(c => c.startsWith('PREF='));
  if (!prefCookie) return 'light';
  const params = new URLSearchParams(prefCookie.substring(5));
  const f6Value = params.get('f6');
  return ['400', '4000000', '40000400', '40000000'].includes(f6Value) ? 'dark' : 'light';
}

/**
 * Create and inject the Settings Panel DOM
 */
export function createSettingsPanel() {
  const panel = $cl('div');
  panel.id = 'yt-enhancement-panel';
  panel.style.display = 'none';

  const panelOverlay = $cl('div');
  panelOverlay.id = 'panel-overlay';
  panelOverlay.style.display = 'none';
  $ap(panelOverlay);

  const isDarkModeActive = checkDarkModeActive();
  const urlSharedCode = encodeURIComponent(
    'https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js'
  );

  // Try to safely get version if available
  let version = '2.4.3.2';
  try {
    if (typeof GM_info !== 'undefined') version = GM_info.script.version;
  } catch (e) {
    /* */
  }

  const menuHTML = html`
    <div class="container-mdcm">
      <div class="header-mdcm">
        <h1><i class="fa-brands fa-youtube"></i> YouTube Tools</h1>
        <div class="icons-mdcm">
          <a
            href="https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js"
            target="_blank"
          >
            <button class="icon-btn-mdcm"><i class="fa-solid fa-arrows-rotate"></i></button>
          </a>
          <a href="https://github.com/akari310" target="_blank">
            <button class="icon-btn-mdcm"><i class="fa-brands fa-github"></i></button>
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
          <i class="fa-solid fa-shield-halved"></i> General
        </button>
        <button class="tab-mdcm" data-tab="themes">
          <i class="fa-solid fa-palette"></i> Themes
        </button>
        <button class="tab-mdcm" data-tab="stats">
          <i class="fa-solid fa-square-poll-vertical"></i> Stats
        </button>
        <button class="tab-mdcm" data-tab="headers">
          <i class="fa-regular fa-newspaper"></i> Header
        </button>
      </div>

      <div id="general" class="tab-content active">
        <div class="options-mdcm">
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="hide-comments-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-comment-slash"></i>Hide Comments</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="hide-comments-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="hide-sidebar-toggle">
              <span class="toggle-label-text"><i class="fa-solid fa-sidebar"></i>Hide Sidebar</span>
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="hide-sidebar-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="autoplay-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-circle-pause"></i>Disable Autoplay</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="autoplay-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="dislikes-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-thumbs-down"></i>Show Dislikes</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="dislikes-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="like-dislike-bar-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-chart-simple"></i>Like vs Dislike bar</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="like-dislike-bar-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="bookmarks-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-bookmark"></i>Bookmarks (timestamps)</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="bookmarks-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="continue-watching-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-forward"></i>Continue watching</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="continue-watching-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="shorts-channel-name-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-user"></i>Shorts: show channel name</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="shorts-channel-name-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="nonstop-playback-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-infinity"></i>Nonstop playback</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="nonstop-playback-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          ${isYTMusic
            ? `
        <label>
          <div class="toggle-row" data-for="audio-only-toggle">
            <span class="toggle-label-text"><i class="fa-solid fa-headphones"></i>Audio-only mode</span>
            <label class="toggle-switch-mdcm">
              <input type="checkbox" class="checkbox-mdcm" id="audio-only-toggle">
              <span class="toggle-slider-mdcm"></span>
            </label>
          </div>
        </label>
        <label>
          <div class="toggle-row" data-for="audio-only-tab-toggle">
            <span class="toggle-label-text"><i class="fa-solid fa-headphones-simple"></i>Audio-only this tab</span>
            <label class="toggle-switch-mdcm">
              <input type="checkbox" class="checkbox-mdcm" id="audio-only-tab-toggle">
              <span class="toggle-slider-mdcm"></span>
            </label>
          </div>
        </label>
        `
            : ''}
          <label>
            <div class="toggle-row" data-for="themes-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-palette"></i>Active Themes</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="themes-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="translation-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-language"></i>Translate comments</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="translation-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="avatars-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-image"></i>Download avatars</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="avatars-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="reverse-mode-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-arrow-right-arrow-left"></i>Reverse mode</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="reverse-mode-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="cinematic-lighting-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-gear"></i>${isYTMusic
                  ? 'Ambient Mode'
                  : 'Cinematic Mode'}</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="cinematic-lighting-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="wave-visualizer-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-wave-square"></i>Wave visualizer Beta</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="wave-visualizer-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${!isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="custom-timeline-color-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-clock"></i>Royal Purple Timeline</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="custom-timeline-color-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>

          <div class="quality-selector-mdcm" style="grid-column: span 2;">
            <div class="select-wrapper-mdcm">
              <label
                >Background Glass Style:
                <select class="tab-button-active" id="side-panel-style-select">
                  <option value="blur">Blur</option>
                  <option value="liquid">Liquid Glass</option>
                  <option value="transparent">Transparent</option>
                </select>
              </label>
            </div>
          </div>
          <label ${isYTMusic ? 'style="display:none"' : ''}>
            <div class="toggle-row" data-for="sync-cinematic-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-gear"></i>Sync Ambient Mode YT</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>

          <div class="quality-selector-mdcm" style="grid-column: span 2;">
            <div class="select-wrapper-mdcm">
              <label
                >Effect wave visualizer:
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
          <div
            class="quality-selector-mdcm"
            style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}"
          >
            <div class="select-wrapper-mdcm">
              <label
                >Default video player quality:
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
          <div
            class="quality-selector-mdcm"
            style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}"
          >
            <div class="select-wrapper-mdcm">
              <label
                >Language for translate comments:
                <select class="tab-button-active" id="select-languages-comments-select">
                  ${languageOptionsHTML}
                </select>
              </label>
            </div>
          </div>
          <div class="slider-container-mdcm" style="grid-column: span 2;">
            <label>Video Player Size: <span id="player-size-value">100</span>%</label>
            <input
              type="range"
              id="player-size-slider"
              class="slider-mdcm"
              min="50"
              max="150"
              value="100"
            />
            <button class="reset-btn-mdcm" id="reset-player-size">Reset video size</button>
          </div>
        </div>
      </div>

      <div id="themes" class="tab-content">
        <div id="background-image-container" class="background-image-container">
          <h4>Background Image</h4>
          <input
            type="file"
            id="background_image"
            accept="image/png, image/jpeg"
            style="display:none;"
          />
          <div id="background-image-preview" class="background-image-preview">
            <span class="background-image-overlay">
              <i class="fa fa-camera"></i>
              <span class="background-image-text">Select image</span>
            </span>
            <button
              id="remove-background-image"
              class="remove-background-image"
              title="Quitar fondo"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="themes-hidden">
          <div class="options-mdcm" style="margin-bottom: 10px;">
            <div>
              <h4>Choose a Theme</h4>
              <p>Disable Mode Cinematic on General</p>
              ${isDarkModeActive === 'dark'
                ? ''
                : '<p style="color: red; margin: 10px 0;font-size: 11px;">Activate dark mode to use this option</p>'}
            </div>
          </div>
          <div class="options-mdcm">
            <label>
              <div class="theme-option option-mdcm">
                <input type="radio" class="radio-mdcm" name="theme" value="custom" checked />
                <span class="theme-name">Custom</span>
              </div>
            </label>
            <label>
              <div class="theme-option option-mdcm theme-selected-normal">
                <input type="radio" class="radio-mdcm" name="theme" value="normal" />
                <span class="theme-name">Selected Themes</span>
              </div>
            </label>
          </div>
          <div class="themes-options">
            <div class="options-mdcm">${themeOptionsHTML}</div>
          </div>
          <div class="theme-custom-options">
            <div class="options-mdcm">
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Progressbar Video:</label
                  ><input
                    type="color"
                    id="progressbar-color-picker"
                    class="color-picker-mdcm"
                    value="#ff0000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Background Color:</label
                  ><input
                    type="color"
                    id="bg-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Primary Color:</label
                  ><input
                    type="color"
                    id="primary-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Secondary Color:</label
                  ><input
                    type="color"
                    id="secondary-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Header Color:</label
                  ><input
                    type="color"
                    id="header-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Icons Color:</label
                  ><input
                    type="color"
                    id="icons-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Menu Color:</label
                  ><input
                    type="color"
                    id="menu-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Line Color Preview:</label
                  ><input
                    type="color"
                    id="line-color-picker"
                    class="color-picker-mdcm"
                    value="#ff0000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Time Color Preview:</label
                  ><input
                    type="color"
                    id="time-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legacy Stats Tab (Migrated to Stats Panel mostly, but kept for legacy UI parity if needed) -->
      <div id="stats" class="tab-content">
        <div class="stats-container" role="group" aria-label="Watch statistics">
          <div class="stat-card stat-card-wide">
            <div class="stat-card-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Total Usage Time</span>
              <span class="stat-value" id="total-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="usage-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#6366f1;--stat-bg:rgba(99,102,241,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">This Session</span>
              <span class="stat-value" id="session-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="session-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#22c55e;--stat-bg:rgba(34,197,94,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-play"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="video-label">Video Watch Time</span>
              <span class="stat-value" id="video-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="video-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#f59e0b;--stat-bg:rgba(245,158,11,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="shorts-label">Shorts Watch Time</span>
              <span class="stat-value" id="shorts-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="shorts-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#ec4899;--stat-bg:rgba(236,72,153,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Today</span>
              <span class="stat-value" id="today-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="today-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#0ea5e9;--stat-bg:rgba(14,165,233,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-film"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Videos Watched</span>
              <span class="stat-value" id="videos-count">0</span>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#a855f7;--stat-bg:rgba(168,85,247,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-stopwatch"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Avg Watch Time</span>
              <span class="stat-value" id="avg-time">-</span>
            </div>
          </div>

          <div
            class="stat-card stat-card-wide"
            style="--stat-accent:#f97316;--stat-bg:rgba(249,115,22,0.14);"
          >
            <div class="stat-card-icon">
              <i class="fas fa-crown"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="most-label">Most Watched</span>
              <span class="stat-value stat-title" id="longest-title">-</span>
              <span class="stat-label stat-meta" id="longest-time">-</span>
            </div>
          </div>
        </div>

        <div class="section-header"><i class="fas fa-chart-column"></i> Weekly</div>
        <div id="weekly-chart"></div>

        <div class="section-header"><i class="fas fa-trophy"></i> Top Videos</div>
        <div id="top-videos-list"></div>

        <div class="panel-actions">
          <button
            id="exportStats"
            class="btn-mdcm btn-secondary"
            aria-label="Export statistics to clipboard"
          >
            <i class="fas fa-copy"></i> Export
          </button>
          <button
            id="resetStats"
            class="btn-mdcm btn-secondary danger"
            aria-label="Reset all statistics"
          >
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>

      <div id="headers" class="tab-content">
        <div class="video-info-panel-mdcm" id="yt-video-info-panel">
          <div class="video-info-empty-mdcm" id="video-info-empty">
            Open a video to see live information here.
          </div>
          <div class="video-info-content-mdcm" id="video-info-content" style="display:none;">
            <div class="video-info-hero-mdcm">
              <img class="video-info-thumb-mdcm" id="video-info-thumb" alt="Video thumbnail" />
              <div>
                <h3 class="video-info-title-mdcm" id="video-info-title">-</h3>
                <p class="video-info-channel-mdcm" id="video-info-channel">-</p>
              </div>
            </div>
            <div class="video-info-grid-mdcm">
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Video ID</span
                ><span class="video-info-value-mdcm" id="video-info-id">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Status</span
                ><span class="video-info-value-mdcm" id="video-info-state">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Time</span
                ><span class="video-info-value-mdcm" id="video-info-time">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Quality</span
                ><span class="video-info-value-mdcm" id="video-info-quality">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Views</span
                ><span class="video-info-value-mdcm" id="video-info-views">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Published</span
                ><span class="video-info-value-mdcm" id="video-info-published">-</span>
              </div>
              <div class="video-info-progress-mdcm">
                <div class="video-info-progress-fill-mdcm" id="video-info-progress"></div>
              </div>
            </div>
            <div class="video-info-actions-mdcm">
              <button class="video-info-copy-mdcm" type="button" data-video-copy="url">
                <i class="fa-solid fa-link"></i> URL
              </button>
              <button class="video-info-copy-mdcm" type="button" data-video-copy="title">
                <i class="fa-solid fa-heading"></i> Title
              </button>
              <button class="video-info-copy-mdcm" type="button" data-video-copy="json">
                <i class="fa-solid fa-code"></i> JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="menu-settings" class="tab-content">
        <div class="options-mdcm"><h4 style="margin: 10px 0">Menu Appearance</h4></div>
        <div class="options-settings-mdcm">
          <div class="option-settings-mdcm">
            <label>Backgrounds:</label>
            <div class="color-boxes" id="bg-color-options">
              <div
                class="color-box"
                data-type="bg"
                data-value="#252525"
                style="background-color: #252525;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#1e1e1e"
                style="background-color: #1e1e1e;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#3a3a3a"
                style="background-color: #3a3a3a;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#4a4a4a"
                style="background-color: #4a4a4a;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#000000"
                style="background-color: #000000;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#00000000"
                style="background-color: transparent;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#2d2d2d"
                style="background-color: #2d2d2d;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#444"
                style="background-color: #444;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Accent Colors:</label>
            <div class="color-boxes" id="bg-accent-color-options">
              <div
                class="color-box"
                data-type="accent"
                data-value="#ff0000"
                style="background-color: #ff0000;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#000000"
                style="background-color: #000000;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#009c37"
                style="background-color: #009c37;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#0c02a0"
                style="background-color: #0c02a0;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Titles Colors:</label>
            <div class="color-boxes" id="text-color-options">
              <div
                class="color-box"
                data-type="color"
                data-value="#ffffff"
                style="background-color: #ffffff;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#cccccc"
                style="background-color: #cccccc;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#b3b3b3"
                style="background-color: #b3b3b3;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#00ffff"
                style="background-color: #00ffff;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#00ff00"
                style="background-color: #00ff00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ffff00"
                style="background-color: #ffff00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ffcc00"
                style="background-color: #ffcc00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ff66cc"
                style="background-color: #ff66cc;"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div id="importExportArea">
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"
        >
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
        <a
          href="https://www.facebook.com/sharer/sharer.php?u=${urlSharedCode}"
          target="_blank"
          data-network="facebook"
          class="share-link"
          ><i class="fa-brands fa-facebook"></i> Facebook</a
        ><br />
        <a
          href="https://twitter.com/intent/tweet?url=${urlSharedCode}"
          target="_blank"
          data-network="twitter"
          class="share-link"
          ><i class="fa-brands fa-twitter"></i> Twitter</a
        ><br />
        <a
          href="https://api.whatsapp.com/send?text=${urlSharedCode}"
          target="_blank"
          data-network="whatsapp"
          class="share-link"
          ><i class="fa-brands fa-whatsapp"></i> WhatsApp</a
        ><br />
        <a
          href="https://www.linkedin.com/sharing/share-offsite/?url=${urlSharedCode}"
          target="_blank"
          data-network="linkedin"
          class="share-link"
          ><i class="fa-brands fa-linkedin"></i> LinkedIn</a
        ><br />
      </div>
    </div>
    <div class="actions-mdcm">
      <div class="developer-mdcm">
        <div
          style="font-size: 11px; opacity: 0.9; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; line-height: 1.6;"
        >
          Developed by
          <a
            href="https://github.com/akari310"
            target="_blank"
            style="color: #ff4444; text-decoration: none;"
            ><i class="fa-brands fa-github"></i> Akari</a
          >. Base by
          <a
            href="https://github.com/DeveloperMDCM"
            target="_blank"
            style="color: #00aaff; text-decoration: none;"
            ><i class="fa-brands fa-github"></i> MDCM</a
          >.
        </div>
      </div>
      <span style="color: #fff">v${version}</span>
    </div>
  `;

  panel.innerHTML = safeHTML(menuHTML);
  $ap(panel);

  return { panel, panelOverlay };
}
