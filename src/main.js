// ===========================================
// YouTube Tools - Modular Entry Point
// ===========================================
// All features have been migrated to modular ES modules.
// Legacy code has been fully phased out.
// See src/features/ for all feature implementations.
// ===========================================

// --- Modular Features ---
import { setupContinueWatchingFeature } from './features/continue-watching.js';
import { setupDownloadClickHandler, initDownloadFeature } from './features/download.js';
import { initTimeStats, updateUI } from './features/time-stats.js';
import { applyLikeDislikeBarIfEnabled } from './features/like-dislike-bar.js';
import { applyBookmarksIfEnabled } from './features/bookmarks.js';
import { setupLockupCachedStats } from './features/lockup-cached-stats.js';
import { setupShortsChannelNameFeature } from './features/shorts/shorts-channel-name.js';
import { initTranslateComments } from './features/comments/translate-comments.js';
import { initPlayerSize } from './features/player/player-size.js';
import { initEffectsFeature } from './features/effects.js';
import { hideComments } from './features/comments/hide-comments.js';
import { hideSidebar } from './features/hide-sidebar.js';
import { reverseMode } from './features/player/reverse-mode.js';
import { disableSubtitles } from './features/player/disable-subtitles.js';
import { applyNonstopPlayback } from './features/player/nonstop-playback.js';
import { applyAudioOnlyMode, getEffectiveAudioOnly } from './features/player/audio-only.js';
import { applyCinematicLighting } from './features/player/cinematic-lighting.js';
import { setupAvatarDownload } from './features/avatar-download.js';
import { initWaveVisualizer } from './features/wave-visualizer.js';
import { initShortsReelButtons } from './features/shorts/shorts-reel-buttons.js';
import { initDownloadDescription } from './features/download-description.js';
import { setupCommentNavListener } from './features/comments/comment-observer.js';
import { startAmbientWatcher } from './features/ytm-ambient-mode.js';

// --- Modular UI ---

import { initSettingsPanel } from './ui/settings-panel/index.js';

// --- Settings ---
import { loadSettings } from './settings/settings-manager.js';

// --- Modular Utils ---
import { __ytToolsRuntime } from './utils/runtime.js';
import { checkNewVersion } from './utils/helpers.js';

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
    initSettingsPanel();
    console.log('[YT Tools] Modular panel created');
  } catch (e) {
    console.error('[YT Tools] Failed to create panel:', e);
  }

  // 2. Initialize time statistics tracking
  initTimeStats();

  // 3. Initialize download click handler (global delegation)
  setupDownloadClickHandler();

  // 4. Define features and their argument mapping
  const getFeatureList = s => [
    [setupContinueWatchingFeature, s.continueWatching],
    [applyLikeDislikeBarIfEnabled, s],
    [applyBookmarksIfEnabled, s],
    [setupShortsChannelNameFeature, s.shortsChannelName],
    [setupLockupCachedStats, s.lockupStats],
    [initTranslateComments, s],
    [initEffectsFeature, s],
    [initPlayerSize, s],
    [hideComments, s.hideComments],
    [hideSidebar, s.hideSidebar],
    [reverseMode, s.reverseMode],
    [disableSubtitles, s.disableSubtitles],
    [applyNonstopPlayback, s.nonstopPlayback],
    [applyAudioOnlyMode, getEffectiveAudioOnly(s)],
    [applyCinematicLighting, s],
    [setupAvatarDownload, s.avatars],
    [initWaveVisualizer, s],
    [initShortsReelButtons, null],
    [initDownloadDescription, null],
    [setupCommentNavListener, s],
    [startAmbientWatcher, null],
  ];

  function runFeatures(s) {
    for (const [fn, arg] of getFeatureList(s)) {
      try {
        fn(arg);
      } catch (e) {
        console.warn('[YT Tools] Feature init error:', e);
      }
    }
  }

  // Initial run
  runFeatures(settings);

  initDownloadFeature();
  updateUI();
  setTimeout(checkNewVersion, 3000);

  function reinitAll(s) {
    runFeatures(s);
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
    '%cYoutube Tools Extension%c\n%cRun %c(v2.4.4.2)\nBy: DeveloperMDCM.',
    'color: #F00; font-size: 24px; font-family: sans-serif;',
    '',
    'font-size: 14px; font-family: monospace;',
    'color: #00aaff; font-size: 16px; font-family: sans-serif;'
  );
})();

