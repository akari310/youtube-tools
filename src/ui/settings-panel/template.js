import { $cl, $ap, isYTMusic } from '../../utils/dom.js';
import { safeHTML, setHTML } from '../../utils/trusted-types.js';
import { themeOptionsHTML } from './parts/theme-options.js';
import { languageOptionsHTML } from './parts/language-options.js';
import { buildGeneralTab } from './parts/sections/general-tab.js';
import { buildThemesTab } from './parts/sections/themes-tab.js';
import { buildStatsTab } from './parts/sections/stats-tab.js';
import { buildHeaderTab } from './parts/sections/header-tab.js';
import { buildMenuSettingsTab } from './parts/sections/menu-settings-tab.js';

const html = String.raw;

function checkDarkModeActive() {
  if (isYTMusic) return 'dark';
  const prefCookie = document.cookie.split('; ').find(c => c.startsWith('PREF='));
  if (!prefCookie) return 'light';
  const params = new URLSearchParams(prefCookie.substring(5));
  const f6Value = params.get('f6');
  return ['400', '4000000', '40000400', '40000000'].includes(f6Value) ? 'dark' : 'light';
}

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

  let version = '2.4.3.2';
  try {
    if (typeof GM_info !== 'undefined') version = GM_info.script.version;
  } catch (e) {}

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

      ${buildGeneralTab(isYTMusic, languageOptionsHTML)}
      ${buildThemesTab(isDarkModeActive, themeOptionsHTML)}
      ${buildStatsTab()}
      ${buildHeaderTab()}
      ${buildMenuSettingsTab()}

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

  setHTML(panel, menuHTML);
  $ap(panel);

  return { panel, panelOverlay };
}
