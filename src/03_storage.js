// ------------------------------
  const STORAGE_KEYS_MDCM = {
    BOOKMARKS: 'ytBookmarksMDCM',
    CONTINUE_WATCHING: 'ytContinueWatchingMDCM',
    SHORTS_CHANNEL_CACHE: 'ytShortsChannelCacheMDCM',
    LIKES_DISLIKES_CACHE: 'ytLikesDislikesCacheMDCM',
    VERSION_CHECK_LAST: 'ytVersionCheckLastMDCM',
  };

  const UPDATE_META_URL = 'https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.meta.js';
  const VERSION_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day

  const SHORTS_CHANNEL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const LIKES_DISLIKES_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const PERSISTED_CACHE_MAX_ENTRIES = 500;

  function getShortsChannelFromPersistedCache(videoId) {
    try {
      const map = readJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, {});
      const entry = map?.[videoId];
      if (!entry || typeof entry.channelName !== 'string') return null;
      const age = Date.now() - (Number(entry.ts) || 0);
      if (age > SHORTS_CHANNEL_TTL_MS) return null;
      return entry.channelName;
    } catch (e) {
      return null;
    }
  }

  function setShortsChannelToPersistedCache(videoId, channelName) {
    if (!videoId || typeof channelName !== 'string') return;
    try {
      const map = readJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, {});
      map[videoId] = {
        channelName,
        ts: Date.now()
      };
      const entries = Object.entries(map).sort((a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0));
      const pruned = Object.fromEntries(entries.slice(0, PERSISTED_CACHE_MAX_ENTRIES));
      writeJsonGM(STORAGE_KEYS_MDCM.SHORTS_CHANNEL_CACHE, pruned);
    } catch (e) { }
  }

  function getLikesDislikesFromPersistedCache(videoId) {
    try {
      const map = readJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, {});
      const entry = map?.[videoId];
      if (!entry) return null;
      const age = Date.now() - (Number(entry.ts) || 0);
      if (age > LIKES_DISLIKES_TTL_MS) return null;
      const dislikes = Number(entry.dislikes);
      const likes = Number(entry.likes);
      const viewCount = Number(entry.viewCount);
      const rating = Number(entry.rating);
      return {
        likes: Number.isFinite(likes) ? likes : null,
        dislikes: Number.isFinite(dislikes) ? dislikes : null,
        viewCount: Number.isFinite(viewCount) ? viewCount : null,
        rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
      };
    } catch (e) {
      return null;
    }
  }

  function setLikesDislikesToPersistedCache(videoId, likes, dislikes, viewCount, rating) {
    if (!videoId) return;
    try {
      const map = readJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, {});
      map[videoId] = {
        likes: likes ?? null,
        dislikes: dislikes ?? null,
        viewCount: viewCount ?? null,
        rating: rating ?? null,
        ts: Date.now()
      };
      const entries = Object.entries(map).sort((a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0));
      const pruned = Object.fromEntries(entries.slice(0, Math.min(PERSISTED_CACHE_MAX_ENTRIES, 300)));
      writeJsonGM(STORAGE_KEYS_MDCM.LIKES_DISLIKES_CACHE, pruned);
    } catch (e) { }
  }

  function getCurrentVideoId() {
    try {
      if (location.pathname.startsWith('/shorts/')) {
        const parts = location.pathname.split('/').filter(Boolean);
        return parts[1] || null;
      }
      if (location.href.includes('youtube.com/watch')) {
        return paramsVideoURL();
      }
      return null;
    } catch (e) {
      return null;
    }
  }


  function readJsonGM(key, fallback) {
    try {
      const raw = GM_getValue(key, '');
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJsonGM(key, value) {
    try {
      GM_setValue(key, JSON.stringify(value));
    } catch (e) {
      console.error('writeJsonGM error:', e);
    }
  }

  const AUDIO_ONLY_TAB_OVERRIDE_KEY = 'ytToolsAudioOnlyTabOverrideMDCM';

  // Feature source/inspiration:
  // Nonstop & Audio Only for YouTube & YouTube Music
  // Author: nvbangg / Nguyen Van Bang
  // Repo: https://github.com/nvbangg/Nonstop_Audio_Only_for_Youtube_YTMusic
  // Greasy Fork: https://greasyfork.org/scripts/546130
  // Source license: GPL-3.0. This userscript implements an independent adaptation of the behavior.
  function applyNonstopPlayback(enabled) {
    const rt = __ytToolsRuntime.nonstopPlayback;
    if (enabled && rt.enabled) return;
    if (!enabled && !rt.enabled) return;

    if (enabled) {
      rt.enabled = true;
      rt.hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden') || null;
      rt.visibilityStateDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState') || null;
      try {
        Object.defineProperties(document, {
          hidden: { configurable: true, get: () => false },
          visibilityState: { configurable: true, get: () => 'visible' },
        });
      } catch (e) {
        console.warn('[YT Tools] Could not override visibility state:', e);
      }

      rt.blockVisibilityEvent = (event) => {
        event.stopImmediatePropagation();
      };
      document.addEventListener('visibilitychange', rt.blockVisibilityEvent, true);
      window.addEventListener('visibilitychange', rt.blockVisibilityEvent, true);

      const refreshActivity = () => {
        try {
          const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
          if ('_lact' in pageWindow) pageWindow._lact = Date.now();
        } catch (e) { }
      };
      refreshActivity();
      rt.keepAliveTimer = setInterval(refreshActivity, 60000);
      return;
    }

    rt.enabled = false;
    if (rt.blockVisibilityEvent) {
      document.removeEventListener('visibilitychange', rt.blockVisibilityEvent, true);
      window.removeEventListener('visibilitychange', rt.blockVisibilityEvent, true);
      rt.blockVisibilityEvent = null;
    }
    if (rt.keepAliveTimer) {
      clearInterval(rt.keepAliveTimer);
      rt.keepAliveTimer = null;
    }
    try {
      if (rt.hiddenDescriptor) Object.defineProperty(document, 'hidden', rt.hiddenDescriptor);
      else delete document.hidden;
      if (rt.visibilityStateDescriptor) Object.defineProperty(document, 'visibilityState', rt.visibilityStateDescriptor);
      else delete document.visibilityState;
    } catch (e) { }
    rt.hiddenDescriptor = null;
    rt.visibilityStateDescriptor = null;
  }

  function getAudioOnlyTabOverride() {
    const value = sessionStorage.getItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  }

  function setAudioOnlyTabOverride(enabled, defaultEnabled) {
    if (!!enabled === !!defaultEnabled) {
      sessionStorage.removeItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
      return;
    }
    sessionStorage.setItem(AUDIO_ONLY_TAB_OVERRIDE_KEY, enabled ? 'true' : 'false');
  }

  function getEffectiveAudioOnly(settings) {
    const override = getAudioOnlyTabOverride();
    return override === null ? !!settings?.audioOnly : override;
  }

  function syncAudioOnlyTabCheckbox(settings) {
    const tabToggle = $id('audio-only-tab-toggle');
    if (!tabToggle) return;
    tabToggle.checked = getEffectiveAudioOnly(settings);
    tabToggle.title = getAudioOnlyTabOverride() === null ?
      'Following the global Audio-only mode setting' :
      'Audio-only override is active for this browser tab';
  }

  function getActiveAudioOnlyVideo() {
    const videos = Array.from(document.querySelectorAll('video'));
    if (isYTMusic) return videos[0] || null;
    return videos.find((video) => {
      const rect = video.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) || videos[0] || null;
  }

  async function getAudioOnlyThumbnailUrl() {
    try {
      const moviePlayer = document.getElementById('movie_player');
      if (moviePlayer && typeof moviePlayer.getVideoData === 'function') {
        const data = moviePlayer.getVideoData();
        if (data?.video_id) return `https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg`;
      }
    } catch (e) { }

    const videoId = getCurrentVideoId() || paramsVideoURL();
    if (!videoId) return '';
    const host = isYTMusic ? 'i1.ytimg.com' : 'img.youtube.com';
    return `https://${host}/vi/${videoId}/hqdefault.jpg`;
  }

  async function applyAudioOnlyMode(enabled) {
    const rt = __ytToolsRuntime.audioOnly;
    rt.enabled = !!enabled;
    document.body.classList.toggle('yt-tools-audio-only-active', rt.enabled);

    document.querySelectorAll('.yt-tools-audio-only-video').forEach((el) => el.classList.remove('yt-tools-audio-only-video'));
    document.querySelectorAll('.yt-tools-audio-only-player').forEach((el) => el.classList.remove('yt-tools-audio-only-player'));

    if (!rt.enabled) {
      rt.lastArtUrl = '';
      setAudioOnlyBackground('');
      if (rt.refreshTimer) {
        clearInterval(rt.refreshTimer);
        rt.refreshTimer = null;
      }
      return;
    }

    const video = getActiveAudioOnlyVideo();
    const player = video?.parentNode?.parentNode || video?.parentElement || null;
    if (video) video.classList.add('yt-tools-audio-only-video');
    if (player) player.classList.add('yt-tools-audio-only-player');

    const artUrl = await getAudioOnlyThumbnailUrl();
    if (artUrl && artUrl !== rt.lastArtUrl) {
      rt.lastArtUrl = artUrl;
      setAudioOnlyBackground(artUrl);
    }

    if (!rt.refreshTimer) {
      rt.refreshTimer = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        applyAudioOnlyMode(getEffectiveAudioOnly(settings));
      }, 3000);
    }
  }

  function setAudioOnlyBackground(url) {
    let style = $id('yt-tools-audio-only-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'yt-tools-audio-only-style';
      document.documentElement.appendChild(style);
    }
    style.textContent = url ? `.yt-tools-audio-only-player{background-image:url("${url}")!important;}` : '';
  }

  function isVersionNewer(latestStr, currentStr) {
    if (!latestStr || !currentStr) return false;
    const parse = (s) => String(s).trim().split('.').map((n) => parseInt(n, 10) || 0);
    const a = parse(latestStr);
    const b = parse(currentStr);
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const x = a[i] || 0;
      const y = b[i] || 0;
      if (x > y) return true;
      if (x < y) return false;
    }
    return false;
  }

  async function checkNewVersion() {
    try {
      const last = GM_getValue(STORAGE_KEYS_MDCM.VERSION_CHECK_LAST, 0);
      if (Date.now() - last < VERSION_CHECK_INTERVAL_MS) return;
      GM_setValue(STORAGE_KEYS_MDCM.VERSION_CHECK_LAST, Date.now());

      const res = await fetch(UPDATE_META_URL, {
        cache: 'no-store'
      });
      if (!res.ok) return;
      const text = await res.text();
      const m = text.match(/@version\s+([\d.]+)/);
      if (!m) return;
      const latestVer = m[1].trim();
      const currentVer = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) ?
        String(GM_info.script.version).trim() :
        '';
      if (!currentVer || !isVersionNewer(latestVer, currentVer)) return;

      const updateUrl = 'https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js';
      iziToast.show({
        title: 'New Update',
        message: 'A new version YoutubeTools is available.',
        buttons: [
          ['<button>View Now</button>', function (instance, toast) {
            window.open(updateUrl, '_blank');
            instance.hide({
              transitionOut: 'fadeOut'
            }, toast, 'button');
          }, true] // true = focus
        ]
      });
    } catch (e) {
      // silent: network or parse error
    }
  }

  function formatTimeShort(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
  }



  
