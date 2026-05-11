// ===========================================
// YouTube Tools - Modular Entry Point
// ===========================================
// Modular features are imported and initialized first.
// Legacy full source is imported as fallback for features
// not yet modularized (cinematic lighting, theme, player
// size, video quality, avatar downloads, etc.)
// ===========================================

// --- Modular Features ---
import { setupContinueWatchingFeature } from './features/continue-watching.js';
import { setupDownloadClickHandler, initDownloadFeature } from './features/download.js';
import { initTimeStats, updateUI } from './features/time-stats.js';
import { applyLikeDislikeBarIfEnabled } from './features/like-dislike-bar.js';
import { applyBookmarksIfEnabled } from './features/bookmarks.js';
import { setupShortsChannelNameFeature } from './features/shorts-channel-name.js';
import { setupLockupCachedStats } from './features/lockup-cached-stats.js';
import { initTranslateComments } from './features/translate-comments.js';
import { initPlayerSize } from './features/player-size.js';
import { initEffectsFeature } from './features/effects.js';
import { hideComments } from './features/hide-comments.js';
import { hideSidebar } from './features/hide-sidebar.js';
import { reverseMode } from './features/reverse-mode.js';
import { disableSubtitles } from './features/disable-subtitles.js';

// --- Modular UI ---
import { createPanel } from './ui/panel.js';

// --- Settings ---
import { loadSettings } from './settings/settings-manager.js';

// --- Modular Utils ---
import { __ytToolsRuntime } from './utils/runtime.js';
import { checkNewVersion } from './utils/helpers.js';

// --- Flag: tell legacy code to skip its wave visualizer ---
import './config/flags.js';

// --- YouTube Music: Glass-morphism UI improvements ---
GM_addStyle(`
  :root {
    --ytm-glass-bg: rgba(15, 15, 15, 0.2);
    --ytm-glass-bg-scrolled: rgba(15, 15, 15, 0.45);
    --ytm-glass-blur: 18px;
  }

  /* Core Navbar Glass Effect */
  ytmusic-nav-bar {
    background-color: var(--ytm-glass-bg) !important;
    backdrop-filter: blur(var(--ytm-glass-blur)) saturate(1.2) !important;
    -webkit-backdrop-filter: blur(var(--ytm-glass-blur)) saturate(1.2) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    transition: background-color 0.3s ease, backdrop-filter 0.3s ease !important;
  }

  /* Scrolled State */
  .content-scrolled ytmusic-nav-bar {
    background-color: var(--ytm-glass-bg-scrolled) !important;
    backdrop-filter: blur(calc(var(--ytm-glass-blur) + 6px)) saturate(1.3) !important;
    -webkit-backdrop-filter: blur(calc(var(--ytm-glass-blur) + 6px)) saturate(1.3) !important;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3) !important;
  }

  #nav-bar-background { background: transparent !important; }
  #nav-bar-divider { border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; }

  /* Layout & Containers */
  ytmusic-app-layout {
    background: var(--ytmusic-background, transparent) !important;
  }

  /* Sidebar/Guide Glass */
  ytmusic-guide-renderer, tp-yt-app-drawer {
    background-color: rgba(0, 0, 0, 0.2) !important;
    backdrop-filter: blur(15px) !important;
    -webkit-backdrop-filter: blur(15px) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
  }

  /* Dynamic Artwork Backgrounds */
  ytmusic-fullbleed-thumbnail-renderer[is-background], .immersive-background {
    display: block !important;
    opacity: 0.35 !important;
    filter: blur(25px) saturate(1.2) brightness(0.8) !important;
  }

  /* Player Bar Glass */
  ytmusic-player-bar {
    background-color: rgba(10, 10, 12, 0.45) !important;
    backdrop-filter: blur(20px) saturate(1.2) !important;
    -webkit-backdrop-filter: blur(20px) saturate(1.2) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.2) !important;
  }
`);

// --- Legacy fallback (handles remaining features and full panel UI) ---
import './legacy-full.js';

// ===========================================
// Initialization
// ===========================================
(function () {
  'use strict';

  // 1. Load settings
  const settings = loadSettings();
  __ytToolsRuntime.settingsLoaded = true;

  // 1b. Create the modular panel (gear icon + panel UI)
  try {
    createPanel();
    console.log('[YT Tools] Modular panel created');
  } catch (e) {
    console.error('[YT Tools] Failed to create panel:', e);
  }

  // 2. Initialize time statistics tracking
  initTimeStats();

  // 3. Initialize download click handler (global delegation)
  setupDownloadClickHandler();

  // 4. Initialize modular features
  const features = [
    [setupContinueWatchingFeature, settings.continueWatching],
    [applyLikeDislikeBarIfEnabled, settings],
    [applyBookmarksIfEnabled, settings],
    [setupShortsChannelNameFeature, settings.shortsChannelName],
    [setupLockupCachedStats, settings.lockupStats],
    [initTranslateComments, settings],
    [initEffectsFeature, settings],
    [initPlayerSize, settings],
    [hideComments, settings.hideComments],
    [hideSidebar, settings.hideSidebar],
    [reverseMode, settings.reverseMode],
    [disableSubtitles, settings.disableSubtitles],
  ];
  for (const [fn, arg] of features) {
    try {
      fn(arg);
    } catch (e) {
      console.warn('[YT Tools] Init error:', e);
    }
  }

  initDownloadFeature();
  updateUI();
  setTimeout(checkNewVersion, 3000);

  function reinitAll(s) {
    for (const [fn] of features) {
      try {
        fn(s);
      } catch (e) {
        console.warn('[YT Tools] Feature init error:', e);
      }
    }
    try {
      initDownloadFeature();
      updateUI();
    } catch (e) {
      console.warn('[YT Tools] Download init error:', e);
    }
  }

  document.addEventListener('yt-navigate-finish', () => reinitAll(loadSettings()));
  document.addEventListener('yt-tools-settings-changed', e => reinitAll(e.detail));

  console.log(
    '%cYoutube Tools Extension%c\n%cRun %c(v2.4.3.2)\nBy: DeveloperMDCM.',
    'color: #F00; font-size: 24px; font-family: sans-serif;',
    '',
    'font-size: 14px; font-family: monospace;',
    'color: #00aaff; font-size: 16px; font-family: sans-serif;'
  );
})();
