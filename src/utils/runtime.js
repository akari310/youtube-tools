// PERF: runtime guards + dynamic style (avoid style/event/interval leaks)
// Using unique namespace to avoid conflicts with other scripts
export const __ytToolsRuntime = {
  dynamicStyleEl: null,
  dynamicCssLast: '',
  settingsLoaded: false,
  bookmarkClickHandlerInitialized: false,
  bookmarksPanelOpen: false,
  nonstopPlayback: {
    enabled: false,
  },
  audioOnly: {
    enabled: false,
  },
  continueWatching: {
    enabled: false,
    map: null,
    flushT: null,
    boundVideo: null,
    boundVideoId: null,
    lastSaveAt: 0,
    lastSavedTime: -1,
    lastKnownVideoId: null,
    navHandlerInitialized: false,
    panelOpen: false,
    clickHandlerInitialized: false,
    pagehideHandlerInitialized: false,
    handlers: null,
  },
  shortsChannelName: {
    enabled: false,
    observer: null,
    io: null,
    scanT: null,
    cache: new Map(),
    inflight: new Map(),
    fetchChain: Promise.resolve(),
  },
  dislikesCache: {
    videoId: null,
    dislikes: null,
    ts: 0,
  },
  downloadClickHandlerInitialized: false,
  shortsObserver: null,
  shortsReelButtonsInitialized: false,
  statsObserver: null,
  statsIntervalId: null,
  modularStatsIntervalId: null,
  lockupCachedStatsObserver: null,
  lockupCachedStatsObserveTarget: null,
  lockupCachedStatsIntervalId: null,
  updateShortsViewsButton: function () {},
  updateShortsRatingButton: function () {},
};

// Global export with unique namespace to avoid conflicts
if (typeof window !== 'undefined') {
  window.__ytToolsRuntime = __ytToolsRuntime;
  window.__YT_TOOLS_RUNTIME_MDCM__ = __ytToolsRuntime; // Unique namespace
  window.setDynamicCss = setDynamicCss;
  window.scheduleApplySettings = scheduleApplySettings;
}

export function setDynamicCss(cssText = '') {
  if (!__ytToolsRuntime.dynamicStyleEl) {
    const style = document.createElement('style');
    style.id = 'yt-tools-mdcm-dynamic-style';
    document.head.appendChild(style);
    __ytToolsRuntime.dynamicStyleEl = style;
  }
  if (__ytToolsRuntime.dynamicCssLast === cssText) return;
  __ytToolsRuntime.dynamicCssLast = cssText;
  __ytToolsRuntime.dynamicStyleEl.textContent = cssText;
}

export const scheduleApplySettings = (() => {
  let t = null;
  return applySettingsFn => {
    // Prevent overwriting saved config with defaults before loadSettings finishes.
    if (!__ytToolsRuntime.settingsLoaded) return;
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      if (typeof applySettingsFn === 'function') applySettingsFn();
    }, 100);
  };
})();
