// Feature flags — modular implementations that legacy should skip
// Set BEFORE importing legacy-full.js in main.js

window.__ytModularActive = true;

// Already modularized (legacy skips these)
window.__ytModularBookmarks = true;
window.__ytModularContinueWatching = true;
window.__ytModularDownload = true;
window.__ytModularEffects = true;
window.__ytModularLikeDislike = true;
window.__ytModularLockupStats = true;
window.__ytModularPlayerSize = true;
window.__ytModularShortsChannel = true;
window.__ytModularTimeStats = true;
window.__ytModularTranslateComments = true;
window.__ytModularWaveVisualizer = true;

// Newly modularized in this migration
window.__ytModularHideComments = true;
window.__ytModularHideSidebar = true;
window.__ytModularReverseMode = true;
window.__ytModularDisableSubtitles = true;
window.__ytModularSettingsManager = true;
