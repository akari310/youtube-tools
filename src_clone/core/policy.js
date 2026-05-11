    // Create a Trusted Types policy
    let policy = null;
    try {
        const tt = (typeof unsafeWindow !== 'undefined' ? unsafeWindow.trustedTypes : window.trustedTypes);
        if (tt) {
            try {
                policy = tt.createPolicy('yt-tools-mdcm', {
                    createHTML: (s) => s
                });
            } catch (e) {
                policy = tt.defaultPolicy || null;
            }
        }
    } catch (e) {
        policy = null;
    }

    function safeHTML(str) {
        if (policy && typeof policy.createHTML === 'function') return policy.createHTML(str);
        return str;
    }
    // ------------------------------
    // Feature helpers: videoId / channelId / storage

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




    // ------------------------------
    // Feature: History / Continue watching (per video)

    // ------------------------------
    function getMainVideoEl() {
        return (
            document.querySelector('#movie_player video.video-stream.html5-main-video') ||
            document.querySelector('ytd-player video.video-stream.html5-main-video') ||
            document.querySelector('video.video-stream.html5-main-video') ||
            document.querySelector('video')
        );
    }

    function getCurrentVideoMeta() {
        try {
            // DOM first (updates earlier on SPA navigation)
            const domTitle =
                $e('ytd-watch-metadata h1 yt-formatted-string')?.textContent?.trim() ||
                $e('h1.ytd-watch-metadata yt-formatted-string')?.textContent?.trim() ||
                '';
            const domAuthor =
                $e('#owner ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a, #text-container.ytd-channel-name a')?.textContent?.trim() ||
                $e('#owner a[href^="/@"], #owner a[href^="/channel/"]')?.textContent?.trim() ||
                '';
            const titleFromDom = (domTitle || document.title || '').replace(/\s*-\s*YouTube\s*$/i, '').trim();
            const authorFromDom = (domAuthor || '').trim();

            const w = (typeof unsafeWindow !== 'undefined' && unsafeWindow) ? unsafeWindow : window;
            const pr = w?.ytInitialPlayerResponse || window.ytInitialPlayerResponse;
            const vd = pr?.videoDetails || null;
            const title = (titleFromDom || vd?.title || document.title || '').replace(/\s*-\s*YouTube\s*$/i, '').trim();
            const author = (authorFromDom || vd?.author || '').trim();
            const thumbs = vd?.thumbnail?.thumbnails;
            const thumb = Array.isArray(thumbs) ? (thumbs[thumbs.length - 1]?.url || '') : '';
            return {
                title,
                author,
                thumb
            };
        } catch (e) {
            return {
                title: '',
                author: '',
                thumb: ''
            };
        }
    }

    function ensureContinueWatchingMapLoaded() {
        const rt = __ytToolsRuntime.continueWatching;
        if (!rt.map) rt.map = readJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, {});
        if (typeof rt.map !== 'object' || !rt.map) rt.map = {};
        return rt.map;
    }

    function pruneContinueWatchingMap(map, maxEntries = 200) {
        try {
            const entries = Object.entries(map || {}).filter(([, v]) => v && typeof v === 'object');
            entries.sort((a, b) => (Number(b[1].updatedAt) || 0) - (Number(a[1].updatedAt) || 0));
            const keep = entries.slice(0, maxEntries);
            const next = {};
            for (const [k, v] of keep) next[k] = v;
            return next;
        } catch (e) {
            return map || {};
        }
    }

    function scheduleContinueWatchingFlush() {
        const rt = __ytToolsRuntime.continueWatching;
        clearTimeout(rt.flushT);
        rt.flushT = setTimeout(() => {
            try {
                if (!rt.map) return;
                rt.map = pruneContinueWatchingMap(rt.map, 200);
                writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, rt.map);
            } catch (e) { }
        }, 800);
    }

    function clearContinueWatchingForVideo(videoId) {
        if (!videoId) return;
        const rt = __ytToolsRuntime.continueWatching;
        const map = ensureContinueWatchingMapLoaded();
        if (map && Object.prototype.hasOwnProperty.call(map, videoId)) {
            delete map[videoId];
            rt.map = map;
            scheduleContinueWatchingFlush();
        }
    }

    function setContinueWatchingForVideo(videoId, seconds, durationSec) {
        if (!videoId) return;
        const rt = __ytToolsRuntime.continueWatching;
        const map = ensureContinueWatchingMapLoaded();
        const t = Math.max(0, Math.floor(Number(seconds) || 0));
        const d = Math.max(0, Math.floor(Number(durationSec) || 0));
        const prev = map[videoId] && typeof map[videoId] === 'object' ? map[videoId] : {};
        const meta = getCurrentVideoMeta();
        map[videoId] = {
            t,
            d,
            updatedAt: Date.now(),
            title: meta.title || prev.title || '',
            author: meta.author || prev.author || '',
            thumb: meta.thumb || prev.thumb || '',
        };
        rt.map = map;
        scheduleContinueWatchingFlush();
    }

    function getContinueWatchingTime(videoId) {
        if (!videoId) return null;
        const map = ensureContinueWatchingMapLoaded();
        const entry = map?.[videoId];
        const t = Number(entry?.t);
        return Number.isFinite(t) ? t : null;
    }

    function updateContinueWatchingButton() {
        const rt = __ytToolsRuntime.continueWatching;
        const enabled = !!rt.enabled;
        if (!enabled || !isWatchPage()) return;

        const videoId = getCurrentVideoId();
        if (!videoId) return;

        const v = getMainVideoEl();
        const t = getContinueWatchingTime(videoId);
        const dur = Number(v?.duration);
        const hasDur = Number.isFinite(dur) && dur > 0;

        if (!t || t < 5) return;

        if (hasDur && t >= (dur - 5)) {
            clearContinueWatchingForVideo(videoId);
            return;
        }
    }

    function updateContinueWatchingHistoryUi() {
        const rt = __ytToolsRuntime.continueWatching;
        const btn = $id('yt-cw-history-toggle');
        const panel = $id('yt-continue-watching-panel');
        if (!btn || !panel) return;

        const enabled = !!rt.enabled;
        if (!enabled || !isWatchPage()) {
            btn.style.display = 'none';
            panel.style.display = 'none';
            return;
        }

        btn.style.display = 'inline-flex';
        panel.style.display = rt.panelOpen ? 'block' : 'none';
    }

    function cssEscapeLite(s) {
        const str = String(s || '');
        if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(str);
        // minimal escape for attribute selector
        return str.replace(/["\\]/g, '\\$&');
    }

    function updateContinueWatchingPanelRow(videoId) {
        try {
            const rt = __ytToolsRuntime.continueWatching;
            if (!rt.enabled || !rt.panelOpen || !isWatchPage()) return false;
            const panel = $id('yt-continue-watching-panel');
            if (!panel) return false;

            const key = cssEscapeLite(videoId);
            const row = panel.querySelector(`.yt-cw-item[data-video-id="${key}"]`);
            if (!row) return false;

            const entry = ensureContinueWatchingMapLoaded()?.[videoId];
            const t = Number(entry?.t);
            if (!Number.isFinite(t)) return false;

            const meta = row.querySelector('.yt-cw-meta');
            if (!meta) return false;
            const author = String(entry?.author || '').trim();
            meta.textContent = `${formatTimeShort(t)}${author ? ` • ${author}` : ''}`;
            return true;
        } catch (e) {
            return false;
        }
    }

    function navigateToWatchSpa(videoId, seconds) {
        const t = Number(seconds);
        const url = `/watch?v=${encodeURIComponent(videoId)}${Number.isFinite(t) ? `&t=${Math.max(0, Math.floor(t))}s` : ''}`;
        try {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_self';
            a.rel = 'noopener';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        } catch (e) { }
        location.href = url;
    }

    function renderContinueWatchingPanel() {
        const panel = $id('yt-continue-watching-panel');
        if (!panel) return;

        const rt = __ytToolsRuntime.continueWatching;
        if (!rt.enabled || !rt.panelOpen || !isWatchPage()) {
            panel.style.display = 'none';
            return;
        }

        const map = pruneContinueWatchingMap(ensureContinueWatchingMapLoaded(), 200);
        rt.map = map;
        const currentVid = getCurrentVideoId();

        const entries = Object.entries(map)
            .map(([videoId, v]) => ({
                videoId,
                ...v
            }))
            .filter((e) => e.videoId && Number.isFinite(Number(e.t)) && Number(e.t) >= 5)
            .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0))
            .slice(0, 25);

        panel.replaceChildren();

        const header = document.createElement('div');
        header.className = 'yt-cw-header';

        const hTitle = document.createElement('div');
        hTitle.className = 'yt-cw-header-title';
        hTitle.textContent = 'Continue watching';

        const clearAll = document.createElement('button');
        clearAll.type = 'button';
        clearAll.className = 'yt-cw-clear';
        clearAll.textContent = 'Clear';
        clearAll.dataset.cwAction = 'clearAll';

        header.appendChild(hTitle);
        header.appendChild(clearAll);
        panel.appendChild(header);

        if (!entries.length) {
            const empty = document.createElement('div');
            empty.className = 'yt-cw-empty';
            empty.textContent = 'No history yet. Watch a bit, then reopen any video.';
            panel.appendChild(empty);
            return;
        }

        for (const e of entries) {
            const item = document.createElement('div');
            item.className = 'yt-cw-item';
            item.dataset.videoId = e.videoId;

            const thumbWrap = document.createElement('div');
            thumbWrap.className = 'yt-cw-thumb-wrap';
            const img = document.createElement('img');
            img.className = 'yt-cw-thumb';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.alt = '';
            const thumbSrc = (e.thumb || '').trim() || `https://i.ytimg.com/vi/${encodeURIComponent(e.videoId)}/hqdefault.jpg`;
            img.src = thumbSrc;
            thumbWrap.appendChild(img);

            const info = document.createElement('div');
            info.className = 'yt-cw-info';

            const title = document.createElement('div');
            title.className = 'yt-cw-title';
            const safeTitle = (e.title || '').trim();
            title.textContent = safeTitle ? safeTitle : e.videoId;

            const meta = document.createElement('div');
            meta.className = 'yt-cw-meta';
            const author = (e.author || '').trim();
            meta.textContent = `${formatTimeShort(e.t)}${author ? ` • ${author}` : ''}`;

            info.appendChild(title);
            info.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'yt-cw-actions';

            const tSec = Math.max(0, Math.floor(Number(e.t) || 0));
            let go = null;
            if (currentVid && currentVid === e.videoId) {
                const seek = document.createElement('button');
                seek.type = 'button';
                seek.className = 'yt-cw-go';
                seek.textContent = 'Resume';
                seek.dataset.cwAction = 'seek';
                seek.dataset.t = String(tSec);
                go = seek;
            } else {
                const a = document.createElement('a');
                a.className = 'yt-simple-endpoint yt-cw-go';
                a.textContent = 'Resume';
                a.href = `/watch?v=${encodeURIComponent(e.videoId)}&t=${tSec}s`;
                a.target = '_self';
                a.rel = 'noopener';
                go = a;
            }

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'yt-cw-del';
            del.textContent = '✕';
            del.title = 'Delete';
            del.dataset.cwAction = 'del';
            del.dataset.videoId = e.videoId;

            actions.appendChild(go);
            actions.appendChild(del);

            item.appendChild(thumbWrap);
            item.appendChild(info);
            item.appendChild(actions);
            panel.appendChild(item);
        }
    }

    function setupContinueWatchingFeature(enabled) {
        const rt = __ytToolsRuntime.continueWatching;
        rt.enabled = !!enabled;

        // Keep UI in sync across YouTube SPA navigations
        if (!rt.navHandlerInitialized) {
            rt.navHandlerInitialized = true;
            const onNav = () => {
                try {
                    const vid = getCurrentVideoId();
                    if (rt.lastKnownVideoId !== vid) {
                        rt.lastKnownVideoId = vid;
                        // reset throttles so new video can save properly
                        rt.lastSaveAt = 0;
                        rt.lastSavedTime = -1;
                        rt.boundVideoId = vid;
                        updateContinueWatchingButton();
                        updateContinueWatchingHistoryUi();
                        if (rt.panelOpen) renderContinueWatchingPanel();
                    } else {
                        updateContinueWatchingButton();
                        updateContinueWatchingHistoryUi();
                        if (rt.panelOpen) renderContinueWatchingPanel();
                    }
                } catch (e) { }
            };
            window.addEventListener('yt-navigate-finish', onNav, true);
            window.addEventListener('popstate', onNav, true);
            window.addEventListener('hashchange', onNav, true);
        }

        // Ensure click handler only once
        if (!rt.clickHandlerInitialized) {
            rt.clickHandlerInitialized = true;
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!(target instanceof Element)) return;
                const historyBtn = target.closest('#yt-cw-history-toggle');
                const cwActionBtn = target.closest('[data-cw-action]');

                if (historyBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    rt.panelOpen = !rt.panelOpen;
                    updateContinueWatchingHistoryUi();
                    if (rt.panelOpen) renderContinueWatchingPanel(); // render only when opened
                    return;
                }

                if (cwActionBtn) {
                    const action = cwActionBtn.getAttribute('data-cw-action');
                    if (!action) return;
                    e.preventDefault();
                    e.stopPropagation();
                    if (action === 'clearAll') {
                        rt.map = {};
                        writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, {});
                        renderContinueWatchingPanel();
                        updateContinueWatchingButton();
                        try {
                            Notify('success', 'History cleared');
                        } catch (e2) { }
                        return;
                    }
                    if (action === 'del') {
                        const vid = cwActionBtn.getAttribute('data-video-id') || '';
                        if (vid) clearContinueWatchingForVideo(vid);
                        renderContinueWatchingPanel();
                        updateContinueWatchingButton();
                        return;
                    }
                    if (action === 'seek') {
                        const t = Number(cwActionBtn.getAttribute('data-t'));
                        const v = getMainVideoEl();
                        if (!v || !Number.isFinite(t)) return;
                        v.currentTime = Math.max(0, t);
                        v.play?.().catch(() => { });
                        try {
                            Notify('success', `Resume: ${formatTimeShort(t)}`);
                        } catch (e2) { }
                        updateContinueWatchingButton();
                        return;
                    }
                }
            }, true);
        }

        // Save on tab close / navigation (once)
        if (!rt.pagehideHandlerInitialized) {
            rt.pagehideHandlerInitialized = true;
            window.addEventListener('pagehide', () => {
                try {
                    if (!rt.enabled) return;
                    if (!isWatchPage()) return;
                    const vid = getCurrentVideoId();
                    const v = getMainVideoEl();
                    if (!vid || !v) return;
                    const t = Number(v.currentTime);
                    const d = Number(v.duration);
                    if (Number.isFinite(t) && t >= 5) setContinueWatchingForVideo(vid, t, d);
                    // best-effort immediate flush
                    if (rt.flushT) {
                        clearTimeout(rt.flushT);
                        rt.flushT = null;
                    }
                    if (rt.map) writeJsonGM(STORAGE_KEYS_MDCM.CONTINUE_WATCHING, pruneContinueWatchingMap(rt.map, 200));
                } catch (e) { }
            }, {
                capture: true
            });
        }

        const historyBtn = $id('yt-cw-history-toggle');
        const panel = $id('yt-continue-watching-panel');
        if (historyBtn && !rt.enabled) historyBtn.style.display = 'none';
        if (panel && !rt.enabled) panel.style.display = 'none';

        // Not on watch page: detach video listeners and hide
        if (!rt.enabled || !isWatchPage()) {
            try {
                if (rt.boundVideo && rt.handlers) {
                    rt.boundVideo.removeEventListener('timeupdate', rt.handlers.timeupdate);
                    rt.boundVideo.removeEventListener('pause', rt.handlers.pause);
                    rt.boundVideo.removeEventListener('ended', rt.handlers.ended);
                    rt.boundVideo.removeEventListener('loadedmetadata', rt.handlers.loadedmetadata);
                    rt.boundVideo.removeEventListener('seeked', rt.handlers.seeked);
                }
            } catch (e) { }
            rt.boundVideo = null;
            rt.boundVideoId = null;
            rt.handlers = null;
            updateContinueWatchingButton();
            updateContinueWatchingHistoryUi();
            return;
        }

        const v = getMainVideoEl();
        const videoId = getCurrentVideoId();
        if (!v || !videoId) {
            updateContinueWatchingButton();
            updateContinueWatchingHistoryUi();
            return;
        }

        // VideoId can change while YouTube reuses the same <video> element
        if (rt.boundVideoId !== videoId) {
            rt.boundVideoId = videoId;
            rt.lastSaveAt = 0;
            rt.lastSavedTime = -1;
        }

        // If video element changed, rebind listeners (avoid leaks)
        if (rt.boundVideo && rt.boundVideo !== v && rt.handlers) {
            try {
                rt.boundVideo.removeEventListener('timeupdate', rt.handlers.timeupdate);
                rt.boundVideo.removeEventListener('pause', rt.handlers.pause);
                rt.boundVideo.removeEventListener('ended', rt.handlers.ended);
                rt.boundVideo.removeEventListener('loadedmetadata', rt.handlers.loadedmetadata);
                rt.boundVideo.removeEventListener('seeked', rt.handlers.seeked);
            } catch (e) { }
            rt.boundVideo = null;
            rt.boundVideoId = null;
            rt.handlers = null;
        }

        rt.boundVideo = v;
        rt.boundVideoId = videoId;

        if (!rt.handlers) {
            rt.handlers = {
                timeupdate: () => {
                    try {
                        if (!rt.enabled) return;
                        const vid = getCurrentVideoId();
                        if (!vid) return;
                        const now = Date.now();
                        if (now - rt.lastSaveAt < 5000) return; // throttle
                        if (v.paused) return;
                        const t = Number(v.currentTime);
                        const d = Number(v.duration);
                        if (!Number.isFinite(t)) return;
                        if (Math.abs(t - rt.lastSavedTime) < 2) return;
                        rt.lastSaveAt = now;
                        rt.lastSavedTime = t;
                        if (t < 5) return;
                        setContinueWatchingForVideo(vid, t, d);
                        updateContinueWatchingButton();
                        // Avoid re-rendering the whole panel every few seconds.
                        // If panel is open and row exists, just update its text.
                        if (rt.panelOpen) {
                            if (!updateContinueWatchingPanelRow(vid)) renderContinueWatchingPanel();
                        }
                    } catch (e) { }
                },
                pause: () => {
                    try {
                        if (!rt.enabled) return;
                        const vid = getCurrentVideoId();
                        if (!vid) return;
                        const t = Number(v.currentTime);
                        const d = Number(v.duration);
                        if (!Number.isFinite(t)) return;
                        if (t < 5) {
                            clearContinueWatchingForVideo(vid);
                        } else {
                            setContinueWatchingForVideo(vid, t, d);
                        }
                        updateContinueWatchingButton();
                        if (rt.panelOpen) {
                            if (!updateContinueWatchingPanelRow(vid)) renderContinueWatchingPanel();
                        }
                    } catch (e) { }
                },
                ended: () => {
                    try {
                        const vid = getCurrentVideoId();
                        if (vid) clearContinueWatchingForVideo(vid);
                        updateContinueWatchingButton();
                        if (rt.panelOpen) renderContinueWatchingPanel();
                    } catch (e) { }
                },
                loadedmetadata: () => {
                    updateContinueWatchingButton();
                    if (rt.panelOpen) renderContinueWatchingPanel();
                },
                seeked: () => {
                    updateContinueWatchingButton();
                    const vid = getCurrentVideoId();
                    if (rt.panelOpen && vid) updateContinueWatchingPanelRow(vid);
                },
            };

            v.addEventListener('timeupdate', rt.handlers.timeupdate, {
                passive: true
            });
            v.addEventListener('pause', rt.handlers.pause, {
                passive: true
            });
            v.addEventListener('ended', rt.handlers.ended, {
                passive: true
            });
            v.addEventListener('loadedmetadata', rt.handlers.loadedmetadata, {
                passive: true
            });
            v.addEventListener('seeked', rt.handlers.seeked, {
                passive: true
            });
        }

        updateContinueWatchingButton();
        updateContinueWatchingHistoryUi();
    }


    // ------------------------------
    // Feature: Show channel name on Shorts list (Home / feeds)
    // Adapted from: @𝖢𝖸 𝖥𝗎𝗇𝗀

    // ------------------------------
    function setupShortsChannelNameFeature(enabled) {
        __ytToolsRuntime.shortsChannelName.enabled = !!enabled;
        document.documentElement.dataset.mdcmShortsChannelName = enabled ? '1' : '0';

        // Disable: stop observers to reduce overhead
        if (!enabled) {
            try {
                __ytToolsRuntime.shortsChannelName.observer?.disconnect?.();
            } catch (e) { }
            try {
                __ytToolsRuntime.shortsChannelName.io?.disconnect?.();
            } catch (e) { }
            __ytToolsRuntime.shortsChannelName.observer = null;
            __ytToolsRuntime.shortsChannelName.io = null;
            clearTimeout(__ytToolsRuntime.shortsChannelName.scanT);
            __ytToolsRuntime.shortsChannelName.scanT = null;
            return;
        }

        const rt = __ytToolsRuntime.shortsChannelName;

        const getShortsVideoIdFromItem = (item) => {
            const a = item.querySelector('a[href^="/shorts/"]');
            const href = a?.getAttribute('href') || '';
            const m = href.match(/\/shorts\/([^/?]+)/);
            return m?.[1] || null;
        };

        const findSubhead = (item) => {
            return item.querySelector(
                '.ShortsLockupViewModelHostOutsideMetadataSubhead,' +
                ' .shortsLockupViewModelHostOutsideMetadataSubhead,' +
                ' .ShortsLockupViewModelHostMetadataSubhead,' +
                ' .shortsLockupViewModelHostMetadataSubhead'
            );
        };

        const ensureLabel = (subhead) => {
            const parent = subhead?.parentElement;
            if (!parent) return null;
            let el = parent.querySelector('.yt-tools-shorts-channel-name');
            if (!el) {
                el = document.createElement('div');
                el.className = 'yt-tools-shorts-channel-name';
                el.textContent = '';
                parent.insertBefore(el, subhead);
            }
            return el;
        };

        const tryExtractChannelNameFromDom = (item) => {
            const a = item.querySelector('a[href^="/@"], a[href^="/channel/"]');
            const name = (a?.textContent || a?.getAttribute('title') || '').trim();
            return name || null;
        };

        const fetchChannelNameFromWatch = (videoId) => {
            rt.fetchChain = rt.fetchChain.then(async () => {
                if (rt.cache.has(videoId)) return rt.cache.get(videoId);
                let res = null;
                try {
                    res = await fetch(`/watch?v=${videoId}`, {
                        method: 'GET',
                        credentials: 'same-origin',
                        cache: 'force-cache',
                    });
                } catch (e) {
                    return '';
                }
                if (!res?.ok) return '';
                const html = await res.text();

                const idx = html.indexOf('itemprop="author"');
                if (idx < 0) return '';
                const start = html.lastIndexOf('<span', idx);
                const end = html.indexOf('</span>', idx);
                if (start < 0 || end < 0) return '';
                const chunk = html.slice(start, end + 7);

                const doc = new DOMParser().parseFromString(chunk, 'text/html');
                const link = doc.querySelector('link[itemprop="name"]');
                return (link?.getAttribute('content') || '').trim();
            });
            return rt.fetchChain;
        };

        const getChannelName = (videoId, item) => {
            const cached = rt.cache.get(videoId);
            if (cached) return Promise.resolve(cached);

            const persisted = getShortsChannelFromPersistedCache(videoId);
            if (persisted) {
                rt.cache.set(videoId, persisted);
                return Promise.resolve(persisted);
            }

            const domName = tryExtractChannelNameFromDom(item);
            if (domName) {
                rt.cache.set(videoId, domName);
                setShortsChannelToPersistedCache(videoId, domName);
                return Promise.resolve(domName);
            }

            const inflight = rt.inflight.get(videoId);
            if (inflight) return inflight;

            const p = fetchChannelNameFromWatch(videoId)
                .then((name) => {
                    const finalName = (name || '').trim();
                    if (finalName) {
                        rt.cache.set(videoId, finalName);
                        setShortsChannelToPersistedCache(videoId, finalName);
                    }
                    return finalName;
                })
                .finally(() => {
                    rt.inflight.delete(videoId);
                });
            rt.inflight.set(videoId, p);
            return p;
        };

        const processItem = (item) => {
            if (!(item instanceof Element)) return;
            if (item.dataset.ytToolsShortsChannelProcessed === '1') return;

            const subhead = findSubhead(item);
            if (!subhead) return;

            const videoId = getShortsVideoIdFromItem(item);
            if (!videoId) return;

            item.dataset.ytToolsShortsChannelProcessed = '1';
            item.dataset.ytToolsShortsVideoId = videoId;

            const label = ensureLabel(subhead);
            if (!label) return;
            label.textContent = '';

            rt.io?.observe(item);
        };

        if (!rt.io) {
            rt.io = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const item = entry.target;
                    const videoId = item?.dataset?.ytToolsShortsVideoId;
                    const subhead = findSubhead(item);
                    const label = subhead?.parentElement?.querySelector?.('.yt-tools-shorts-channel-name');

                    if (!videoId || !label) {
                        rt.io.unobserve(item);
                        continue;
                    }

                    getChannelName(videoId, item)
                        .then((name) => {
                            if (name) label.textContent = name;
                        })
                        .finally(() => {
                            rt.io.unobserve(item);
                        });
                }
            }, {
                threshold: 0.15
            });
        }

        const scan = () => {
            clearTimeout(rt.scanT);
            rt.scanT = setTimeout(() => {
                document
                    .querySelectorAll('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2')
                    .forEach(processItem);
            }, 120);
        };

        if (!rt.observer) {
            rt.observer = new MutationObserver(scan);
            const observeTarget = document.querySelector('#page-manager') || document.body;
            rt.observer.observe(observeTarget, {
                childList: true,
                subtree: true
            });
        }

        scan();
    }


    // ------------------------------
    // Feature: Show cached rating/likes/dislikes on video cards (watch related + home/search)

    // ------------------------------
    function getVideoIdFromLockup(lockup) {
        const a = lockup.querySelector('a[href*="watch?v="]');
        if (a) {
            const m = (a.getAttribute('href') || '').match(/[?&]v=([^&]+)/);
            if (m) return m[1];
        }
        const el = lockup.querySelector('[class*="content-id-"]');
        if (el) {
            const m = el.className.match(/content-id-([A-Za-z0-9_-]+)/);
            if (m) return m[1];
        }
        return null;
    }

    function createSvgIconFromString(svgString, sizePx) {
        const div = document.createElement('div');
        div.innerHTML = safeHTML(svgString.trim());
        const svg = div.firstElementChild;
        if (!svg) return null;
        svg.setAttribute('width', String(sizePx || 14));
        svg.setAttribute('height', String(sizePx || 14));
        svg.style.display = 'inline-block';
        svg.style.verticalAlign = 'middle';
        svg.style.marginRight = '2px';
        return svg;
    }

    const LOCKUP_RATING_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" /></svg>';
    const LOCKUP_LIKE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-thumb-up"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" /></svg>';
    const LOCKUP_DISLIKE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-thumb-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" /></svg>';

    function injectLockupCachedStats() {
        if (!window.location.href.includes('youtube.com')) return;
        document.querySelectorAll('yt-lockup-view-model').forEach((lockup) => {
            if (lockup.hasAttribute('data-yt-tools-lockup-stats')) return;
            const videoId = getVideoIdFromLockup(lockup);
            if (!videoId) return;
            const cached = getLikesDislikesFromPersistedCache(videoId);
            if (!cached) return;
            const hasRating = cached.rating != null;
            const hasLikes = cached.likes != null;
            const hasDislikes = cached.dislikes != null;
            if (!hasRating && !hasLikes && !hasDislikes) return;
            const meta = lockup.querySelector('yt-content-metadata-view-model');
            if (!meta) return;
            const row = document.createElement('div');
            row.className = 'yt-content-metadata-view-model__metadata-row';
            row.setAttribute('data-yt-tools-lockup-stats-row', '1');
            const wrap = document.createElement('span');
            wrap.className = 'yt-core-attributed-string yt-content-metadata-view-model__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color';
            wrap.setAttribute('dir', 'auto');
            wrap.setAttribute('role', 'text');
            const sep = () => {
                const s = document.createTextNode(' · ');
                return s;
            };
            if (hasRating) {
                const ratingIcon = createSvgIconFromString(LOCKUP_RATING_SVG, 14);
                if (ratingIcon) wrap.appendChild(ratingIcon);
                wrap.appendChild(document.createTextNode(' ' + cached.rating.toFixed(1)));
                if (hasLikes || hasDislikes) wrap.appendChild(sep());
            }
            if (hasLikes) {
                const likeIcon = createSvgIconFromString(LOCKUP_LIKE_SVG, 14);
                if (likeIcon) wrap.appendChild(likeIcon);
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.likes, 0)));
                if (hasDislikes) wrap.appendChild(sep());
            }
            if (hasDislikes) {
                const dislikeIcon = createSvgIconFromString(LOCKUP_DISLIKE_SVG, 14);
                if (dislikeIcon) wrap.appendChild(dislikeIcon);
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.dislikes, 0)));
            }
            row.appendChild(wrap);
            meta.appendChild(row);
            lockup.setAttribute('data-yt-tools-lockup-stats', videoId);
        });
    }

    function getVideoIdFromShortsLockup(item) {
        if (item.dataset.ytToolsShortsVideoId) return item.dataset.ytToolsShortsVideoId;
        var a = item.querySelector('a[href^="/shorts/"]');
        if (!a) return null;
        var m = (a.getAttribute('href') || '').match(/\/shorts\/([^/?]+)/);
        return m ? m[1] : null;
    }

    function injectShortsLockupCachedStats() {
        if (!window.location.href.includes('youtube.com')) return;
        // Process inner lockup (has metadata); v2 wraps it and would duplicate
        document.querySelectorAll('ytm-shorts-lockup-view-model').forEach(function (item) {
            if (item.hasAttribute('data-yt-tools-shorts-stats')) return;
            var videoId = getVideoIdFromShortsLockup(item);
            if (!videoId) return;
            var cached = getLikesDislikesFromPersistedCache(videoId);
            if (!cached) return;
            var hasLikes = cached.likes != null;
            var hasDislikes = cached.dislikes != null;
            if (!hasLikes && !hasDislikes) return;
            var subhead = item.querySelector(
                '.ShortsLockupViewModelHostOutsideMetadataSubhead,' +
                '.shortsLockupViewModelHostOutsideMetadataSubhead,' +
                '.ShortsLockupViewModelHostMetadataSubhead,' +
                '.shortsLockupViewModelHostMetadataSubhead'
            );
            if (!subhead || !subhead.parentElement) return;
            var wrap = document.createElement('span');
            wrap.className = 'yt-core-attributed-string yt-content-metadata-view-model__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color yt-tools-shorts-stats-row';
            wrap.setAttribute('dir', 'auto');
            wrap.setAttribute('role', 'text');
            wrap.setAttribute('style', 'color: #aaa !important;');
            var sep = function () {
                return document.createTextNode(' \u00b7 ');
            };
            if (hasLikes) {
                var likeIcon = createSvgIconFromString(LOCKUP_LIKE_SVG, 12);
                if (likeIcon) {
                    likeIcon.style.setProperty('color', '#aaa', 'important');
                    wrap.appendChild(likeIcon);
                }
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.likes, 0)));
                if (hasDislikes) wrap.appendChild(sep());
            }
            if (hasDislikes) {
                var dislikeIcon = createSvgIconFromString(LOCKUP_DISLIKE_SVG, 12);
                if (dislikeIcon) {
                    dislikeIcon.style.setProperty('color', '#aaa', 'important');
                    wrap.appendChild(dislikeIcon);
                }
                wrap.appendChild(document.createTextNode(' ' + FormatterNumber(cached.dislikes, 0)));
            }
            var row = document.createElement('div');
            row.className = 'yt-tools-shorts-stats-wrap';
            row.setAttribute('style', 'color: #aaa !important;');
            row.appendChild(wrap);
            subhead.parentElement.appendChild(row);
            item.setAttribute('data-yt-tools-shorts-stats', videoId);
        });
    }

    function createLockupStatsObserver(target) {
        var lockupStatsDebounceT = null;
        var lockupStatsScheduled = false;
        var obs = new MutationObserver(function () {
            if (lockupStatsScheduled) return;
            lockupStatsScheduled = true;
            clearTimeout(lockupStatsDebounceT);
            lockupStatsDebounceT = setTimeout(function () {
                lockupStatsScheduled = false;
                if (!window.location.href.includes('youtube.com')) return;
                injectLockupCachedStats();
                injectShortsLockupCachedStats();
                // Single extra pass for late-rendered lockups (reduced from 3 passes)
                setTimeout(function () {
                    if (!window.location.href.includes('youtube.com')) return;
                    if (!hasUnprocessedLockups()) return;
                    injectLockupCachedStats();
                    injectShortsLockupCachedStats();
                }, 1200);
            }, 280);
        });
        obs.observe(target, {
            childList: true,
            subtree: true
        });
        return obs;
    }

    function retargetLockupStatsObserverIfNeeded() {
        if (!window.location.href.includes('youtube.com/watch')) return;
        var secondary = document.getElementById('secondary') || document.querySelector('ytd-watch-next-secondary-results-renderer');
        if (!secondary || !secondary.parentNode) return;
        if (__ytToolsRuntime.lockupCachedStatsObserveTarget === secondary) return;
        var obs = __ytToolsRuntime.lockupCachedStatsObserver;
        if (!obs) return;
        obs.disconnect();
        __ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(secondary);
        __ytToolsRuntime.lockupCachedStatsObserveTarget = secondary;
    }

    function hasUnprocessedLockups() {
        var normal = document.querySelectorAll('yt-lockup-view-model:not([data-yt-tools-lockup-stats])').length > 0;
        var shorts = document.querySelectorAll('ytm-shorts-lockup-view-model:not([data-yt-tools-shorts-stats])').length > 0;
        return normal || shorts;
    }

    function runLockupCachedStatsCatchUp() {
        if (!window.location.href.includes('youtube.com')) return;
        if (document.visibilityState !== 'visible') return;
        if (!hasUnprocessedLockups()) return;
        injectLockupCachedStats();
        injectShortsLockupCachedStats();
    }

    function setupLockupCachedStats() {
        if (!window.location.href.includes('youtube.com')) return;
        injectLockupCachedStats();
        injectShortsLockupCachedStats();
        var secondary = document.getElementById('secondary') || document.querySelector('ytd-watch-next-secondary-results-renderer');
        var observeTarget = secondary && secondary.parentNode ? secondary : document.body;
        if (__ytToolsRuntime.lockupCachedStatsObserver) {
            if (observeTarget !== __ytToolsRuntime.lockupCachedStatsObserveTarget) {
                __ytToolsRuntime.lockupCachedStatsObserver.disconnect();
                __ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(observeTarget);
                __ytToolsRuntime.lockupCachedStatsObserveTarget = observeTarget;
            }
            return;
        }
        __ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(observeTarget);
        __ytToolsRuntime.lockupCachedStatsObserveTarget = observeTarget;
        // Catch-up interval: apply stats to any new cards (scroll, filters, SPA) every 1.8s when there are unprocessed lockups
        if (!__ytToolsRuntime.lockupCachedStatsIntervalId) {
            __ytToolsRuntime.lockupCachedStatsIntervalId = setInterval(runLockupCachedStatsCatchUp, 1800);
        }
    }


    // ------------------------------
    // Feature: Bookmarks per video (persisted)

    // ------------------------------
    function getBookmarksForVideo(videoId) {
        const all = readJsonGM(STORAGE_KEYS_MDCM.BOOKMARKS, {});
        const list = Array.isArray(all[videoId]) ? all[videoId] : [];
        return {
            all,
            list
        };
    }

    function saveBookmark(videoId, seconds, label) {
        const {
            all,
            list
        } = getBookmarksForVideo(videoId);
        const t = Math.max(0, Math.floor(Number(seconds) || 0));
        const exists = list.some(b => b && b.t === t);
        const item = {
            t,
            label: (label || formatTimeShort(t)).trim(),
            createdAt: Date.now()
        };
        const nextList = exists ? list.map(b => (b.t === t ? item : b)) : [...list, item];
        nextList.sort((a, b) => a.t - b.t);
        all[videoId] = nextList;
        writeJsonGM(STORAGE_KEYS_MDCM.BOOKMARKS, all);
    }

    function deleteBookmark(videoId, seconds) {
        const {
            all,
            list
        } = getBookmarksForVideo(videoId);
        const t = Math.max(0, Math.floor(Number(seconds) || 0));
        all[videoId] = list.filter(b => b && b.t !== t);
        writeJsonGM(STORAGE_KEYS_MDCM.BOOKMARKS, all);
    }

    function renderBookmarksPanel(videoId) {
        const panel = $id('yt-bookmarks-panel');
        if (!panel) return;

        const {
            list
        } = getBookmarksForVideo(videoId);
        if (!list.length) {
            panel.innerHTML = safeHTML(`<div class="yt-bm-empty">No bookmarks yet. Click ★ to save one.</div>`);
            return;
        }

        panel.innerHTML = safeHTML(list
            .map((b) => {
                const time = formatTimeShort(b.t);
                const safeLabel = (b.label || time).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `
          <div class="yt-bm-item">
            <button type="button" class="yt-bm-go" data-action="go" data-t="${b.t}" title="Go to ${time}">${time}</button>
            <div class="yt-bm-label" title="${safeLabel}">${safeLabel}</div>
            <button type="button" class="yt-bm-del" data-action="del" data-t="${b.t}" title="Delete">✕</button>
          </div>
        `;
            })
            .join(''));
    }

    function applyBookmarksIfEnabled(settings) {
        const addBtn = $id('yt-bookmark-add');
        const toggleBtn = $id('yt-bookmark-toggle');
        const panel = $id('yt-bookmarks-panel');

        if (!addBtn || !toggleBtn || !panel) return;

        const enabled = !!settings?.bookmarks;
        addBtn.style.display = enabled ? 'inline-flex' : 'none';
        toggleBtn.style.display = enabled ? 'inline-flex' : 'none';
        panel.style.display = enabled && __ytToolsRuntime.bookmarksPanelOpen ? 'block' : 'none';

        if (!enabled) return;

        const videoId = getCurrentVideoId();
        if (!videoId) return;
        renderBookmarksPanel(videoId);

        if (__ytToolsRuntime.bookmarkClickHandlerInitialized) return;
        __ytToolsRuntime.bookmarkClickHandlerInitialized = true;

        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;

            const add = target.closest('#yt-bookmark-add');
            const tog = target.closest('#yt-bookmark-toggle');
            const actionBtn = target.closest('[data-action][data-t]');

            if (add) {
                e.preventDefault();
                e.stopPropagation();
                const v = $e('video');
                const vid = getCurrentVideoId();
                if (!v || !vid) return;
                const t = Math.floor(v.currentTime || 0);
                const defaultLabel = formatTimeShort(t);
                const label = prompt('Bookmark name (optional):', defaultLabel) || defaultLabel;
                saveBookmark(vid, t, label);
                __ytToolsRuntime.bookmarksPanelOpen = true;
                panel.style.display = 'block';
                renderBookmarksPanel(vid);
                Notify('success', `Bookmark saved at ${defaultLabel}`);
                return;
            }

            if (tog) {
                e.preventDefault();
                e.stopPropagation();
                __ytToolsRuntime.bookmarksPanelOpen = !__ytToolsRuntime.bookmarksPanelOpen;
                panel.style.display = __ytToolsRuntime.bookmarksPanelOpen ? 'block' : 'none';
                const vid = getCurrentVideoId();
                if (vid && __ytToolsRuntime.bookmarksPanelOpen) renderBookmarksPanel(vid);
                return;
            }

            if (actionBtn) {
                e.preventDefault();
                e.stopPropagation();
                const action = actionBtn.getAttribute('data-action');
                const t = Number(actionBtn.getAttribute('data-t'));
                const v = $e('video');
                const vid = getCurrentVideoId();
                if (!v || !vid) return;
                if (action === 'go') {
                    v.currentTime = Math.max(0, t || 0);
                    v.play?.().catch(() => { });
                } else if (action === 'del') {
                    deleteBookmark(vid, t);
                    renderBookmarksPanel(vid);
                }
            }
        });
    }


    // ------------------------------
    // Feature: Like vs Dislike bar

    // ------------------------------
    function parseCountText(text) {
        if (!text) return null;
        const s0 = String(text).trim().toLowerCase();
        if (!s0) return null;
        let mult = 1;
        let s = s0.replace(/\s+/g, '');
        if (s.includes('mil')) {
            mult = 1000;
            s = s.replace('mil', '');
        } else if (s.includes('k')) {
            mult = 1000;
            s = s.replace('k', '');
        } else if (s.includes('m')) {
            mult = 1000000;
            s = s.replace('m', '');
        }
        // normalize decimal separators
        s = s.replace(/[^\d.,]/g, '');
        if (!s) return null;
        // If both separators exist, assume last is decimal
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        let nStr = s;
        if (lastDot !== -1 && lastComma !== -1) {
            const dec = Math.max(lastDot, lastComma);
            const intPart = s.slice(0, dec).replace(/[.,]/g, '');
            const decPart = s.slice(dec + 1);
            nStr = `${intPart}.${decPart}`;
        } else {
            // Use dot as decimal
            nStr = s.replace(',', '.');
        }
        const num = Number.parseFloat(nStr);
        if (!Number.isFinite(num)) return null;
        return Math.round(num * mult);
    }

    async function ensureDislikesForCurrentVideo() {
        const videoId = getCurrentVideoId();
        if (!videoId) return null;
        const now = Date.now();
        if (__ytToolsRuntime.dislikesCache.videoId === videoId && __ytToolsRuntime.dislikesCache.dislikes != null && (now - __ytToolsRuntime.dislikesCache.ts) < 10 * 60 * 1000) {
            return __ytToolsRuntime.dislikesCache;
        }
        const persisted = getLikesDislikesFromPersistedCache(videoId);
        if (persisted && persisted.dislikes != null) {
            __ytToolsRuntime.dislikesCache = {
                videoId,
                likes: persisted.likes,
                dislikes: persisted.dislikes,
                viewCount: persisted.viewCount,
                rating: persisted.rating,
                ts: now
            };
            return __ytToolsRuntime.dislikesCache;
        }
        try {
            const res = await fetch(`${apiDislikes}${videoId}`);
            const data = await res.json();
            const dislikes = Number(data?.dislikes);
            const likes = Number(data?.likes);
            const viewCount = Number(data?.viewCount);
            const rating = Number(data?.rating);
            const now = Date.now();

            if (Number.isFinite(dislikes)) {
                __ytToolsRuntime.dislikesCache = {
                    videoId,
                    likes: Number.isFinite(likes) ? likes : getLikesFromDom(),
                    dislikes,
                    viewCount,
                    rating,
                    ts: now
                };
                setLikesDislikesToPersistedCache(
                    videoId,
                    __ytToolsRuntime.dislikesCache.likes,
                    dislikes,
                    Number.isFinite(viewCount) ? viewCount : undefined,
                    (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined
                );
                return __ytToolsRuntime.dislikesCache;
            }
        } catch (e) {
            console.error('[YT Tools] Error fetching dislikes:', e);
        }
        return null;
    }

    function getLikesFromDom() {
        // Try grab visible like count (YouTube UI varies a lot)
        const likeBtn =
            $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
            $e('#top-level-buttons-computed like-button-view-model button') ||
            $e('#top-level-buttons-computed ytd-toggle-button-renderer:nth-child(1)') ||
            $e('segmented-like-dislike-button-view-model like-button-view-model');
        if (!likeBtn) return null;

        // Prefer visible counter first; aria-label can include locale thousands separators (17.606) that are ambiguous.
        const candidates = [
            likeBtn.querySelector?.('.yt-spec-button-shape-next__button-text-content')?.textContent,
            likeBtn.textContent,
            likeBtn.getAttribute?.('aria-label'),
        ].filter(Boolean);

        for (const txt of candidates) {
            const n = parseCountText(txt);
            if (n != null) return n;
        }
        return null;
    }

    function updateLikeDislikeBar(likes, dislikes) {
        // Prefer placing it above the "copy description" button (as requested).
        const copyDesc = $id('button_copy_description');
        const host =
            $e('#top-level-buttons-computed') ||
            $e('ytd-watch-metadata #top-level-buttons-computed');
        if (!host && !copyDesc) return;

        let bar = $id('yt-like-dislike-bar-mdcm');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'yt-like-dislike-bar-mdcm';
            bar.innerHTML = safeHTML(`<div class="like"></div><div class="dislike"></div>`);
            if (copyDesc) {
                copyDesc.insertAdjacentElement('beforebegin', bar);
            } else {
                host.appendChild(bar);
            }
        } else if (copyDesc && bar.previousElementSibling !== copyDesc) {
            // Keep it near the copy description area if the DOM changed
            try {
                copyDesc.insertAdjacentElement('beforebegin', bar);
            } catch (e) { }
        }

        if (!Number.isFinite(likes) || !Number.isFinite(dislikes) || likes + dislikes <= 0) {
            bar.style.display = 'none';
            return;
        }

        const total = likes + dislikes;
        const likePct = Math.max(0, Math.min(100, (likes / total) * 100));
        const dislikePct = 100 - likePct;
        bar.style.display = 'block';
        const likeEl = bar.querySelector('.like');
        const dislikeEl = bar.querySelector('.dislike');
        likeEl.style.width = `${likePct}%`;
        dislikeEl.style.width = `${dislikePct}%`;
        bar.title = `Likes: ${likes.toLocaleString()} | Dislikes: ${dislikes.toLocaleString()}`;
    }

    async function applyLikeDislikeBarIfEnabled(settings) {
        if (!settings?.likeDislikeBar) {
            const existing = $id('yt-like-dislike-bar-mdcm');
            if (existing) existing.style.display = 'none';
            return;
        }
        if (!window.location.href.includes('youtube.com/watch')) return;
        const videoId = getCurrentVideoId();
        if (!videoId) return;
        const data = await ensureDislikesForCurrentVideo();
        if (!data || data.likes == null || data.dislikes == null) return;
        updateLikeDislikeBar(data.likes, data.dislikes);
    }

    // Retry helper (YT often renders likes late; keep it lightweight)
    function scheduleLikeBarUpdate(settings, attempts = 4) {
        if (!settings?.likeDislikeBar) return;
        let i = 0;
        const tick = async () => {
            i += 1;
            await applyLikeDislikeBarIfEnabled(settings);
            const bar = $id('yt-like-dislike-bar-mdcm');
            if (bar && bar.style.display !== 'none') return;
            if (i < attempts) setTimeout(tick, 800);
        };
        setTimeout(tick, 300);
    }

    //   Dislikes video
    async function videoDislike() {
        if (isYTMusic) return;
        validoUrl = document.location.href;

        const validoVentana = $e('#below > ytd-watch-metadata > div');
        if (validoVentana != undefined && document.location.href.split('?v=')[0].includes('youtube.com/watch')) {
            let localVideoId = paramsVideoURL();
            if (!localVideoId) return;
            validoUrl = localVideoId;
            const data = await ensureDislikesForCurrentVideo();
            if (!data || data.dislikes == null) return;

            const dislikes = data.dislikes;
            const dislikes_btn = $e('#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button');

            if (dislikes_btn != null) {
                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));

                // Find or create our custom count element
                let textContent = dislikes_btn.querySelector('.yt-tools-dislike-count');
                if (!textContent) {
                    textContent = document.createElement('div');
                    textContent.className = 'ytSpecButtonShapeNextButtonTextContent yt-tools-dislike-count';

                    // Insert it after the icon container
                    const iconDiv = dislikes_btn.querySelector('.ytSpecButtonShapeNextIcon');
                    if (iconDiv) {
                        iconDiv.insertAdjacentElement('afterend', textContent);
                        // Convert button style to icon+text layout
                        dislikes_btn.classList.add('ytSpecButtonShapeNextIconLeading');
                        dislikes_btn.classList.remove('ytSpecButtonShapeNextIconButton');
                    } else {
                        dislikes_btn.appendChild(textContent);
                    }
                }

                if (settings.dislikes) {
                    textContent.textContent = FormatterNumber(dislikes, 0);
                    textContent.style.display = 'block';
                    showDislikes = true;
                } else {
                    textContent.style.display = 'none';
                    showDislikes = false;
                }

                const likes_btn =
                    $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
                    $e('#top-level-buttons-computed like-button-view-model button') ||
                    $e('#top-level-buttons-computed ytd-toggle-button-renderer:nth-child(1)') ||
                    $e('segmented-like-dislike-button-view-model like-button-view-model button');

                // Capture current state as "initial" for this data load
                const currentIsPressed = dislikes_btn.getAttribute('aria-pressed') === 'true';
                dislikes_btn.dataset.initialState = currentIsPressed;
                dislikes_btn.dataset.originalCount = dislikes;

                if (likes_btn) {
                    likes_btn.dataset.initialState = likes_btn.getAttribute('aria-pressed') === 'true';
                    likes_btn.dataset.originalCount = data.likes || 0;
                }

                const updateCount = () => {
                    // Dislikes calculation
                    const isDislikePressed = dislikes_btn.getAttribute('aria-pressed') === 'true';
                    const wasDislikePressed = dislikes_btn.dataset.initialState === 'true';
                    const originalDislikes = Number(dislikes_btn.dataset.originalCount);

                    let dislikeOffset = 0;
                    if (!wasDislikePressed && isDislikePressed) dislikeOffset = 1;
                    else if (wasDislikePressed && !isDislikePressed) dislikeOffset = -1;

                    const newDislikes = Math.max(0, originalDislikes + dislikeOffset);

                    // Likes calculation
                    let newLikes = data.likes || 0;
                    if (likes_btn) {
                        const isLikePressed = likes_btn.getAttribute('aria-pressed') === 'true';
                        const wasLikePressed = likes_btn.dataset.initialState === 'true';
                        const originalLikes = Number(likes_btn.dataset.originalCount);

                        let likeOffset = 0;
                        if (!wasLikePressed && isLikePressed) likeOffset = 1;
                        else if (wasLikePressed && !isLikePressed) likeOffset = -1;

                        newLikes = Math.max(0, originalLikes + likeOffset);
                    }

                    // Update run-time cache
                    if (__ytToolsRuntime.dislikesCache.videoId === localVideoId) {
                        __ytToolsRuntime.dislikesCache.dislikes = newDislikes;
                        __ytToolsRuntime.dislikesCache.likes = newLikes;

                        // Also persist it so F5 uses the updated count as "original"
                        setLikesDislikesToPersistedCache(
                            localVideoId,
                            newLikes,
                            newDislikes,
                            __ytToolsRuntime.dislikesCache.viewCount,
                            __ytToolsRuntime.dislikesCache.rating
                        );
                    }

                    if (settings.dislikes && textContent) {
                        textContent.textContent = FormatterNumber(newDislikes, 0);
                    }

                    // Sync the like/dislike bar immediately
                    if (settings.likeDislikeBar) {
                        updateLikeDislikeBar(newLikes, newDislikes);
                    }
                };

                // Initial update
                updateCount();

                // Use MutationObserver for robust state tracking (handles Like button clicks too)
                if (!dislikes_btn.dataset.observerInitialized) {
                    dislikes_btn.dataset.observerInitialized = 'true';

                    const observer = new MutationObserver((mutations) => {
                        for (const mutation of mutations) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-pressed') {
                                updateCount();
                            }
                        }
                    });

                    observer.observe(dislikes_btn, { attributes: true, attributeFilter: ['aria-pressed'] });
                    if (likes_btn) observer.observe(likes_btn, { attributes: true, attributeFilter: ['aria-pressed'] });

                    // Also handle direct clicks just in case
                    dislikes_btn.addEventListener('click', () => {
                        setTimeout(updateCount, 150);
                    });
                    if (likes_btn) {
                        likes_btn.addEventListener('click', () => {
                            setTimeout(updateCount, 150);
                        });
                    }
                }

                try {
                    scheduleLikeBarUpdate(settings, 5);
                } catch (e) { }
            }
        }
    }

    // dislikes shorts + views button (viewCount from Return YouTube Dislike API)
    async function shortDislike() {
        validoUrl = document.location.href;
        const validoVentanaShort = $m(
            "#button-bar > reel-action-bar-view-model > dislike-button-view-model > toggle-button-view-model > button-view-model > label > div > span"
        );

        if (validoVentanaShort != undefined && document.location.href.split('/')[3] === 'shorts') {
            validoUrl = document.location.href.split('/')[4];
            let dislikes = null;
            let viewCount = null;
            let rating = null;
            const persisted = getLikesDislikesFromPersistedCache(validoUrl);
            if (persisted && persisted.dislikes != null) {
                dislikes = persisted.dislikes;
                viewCount = persisted.viewCount ?? null;
                rating = persisted.rating ?? null;
            } else {
                const urlShorts = `${apiDislikes}${validoUrl}`;
                try {
                    const respuesta = await fetch(urlShorts);
                    const datosShort = await respuesta.json();
                    dislikes = Number(datosShort?.dislikes);
                    viewCount = Number(datosShort?.viewCount);
                    rating = Number(datosShort?.rating);
                    if (Number.isFinite(dislikes)) setLikesDislikesToPersistedCache(validoUrl, undefined, dislikes, Number.isFinite(viewCount) ? viewCount : undefined, (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined);
                } catch (error) {
                    console.log(error);
                }
            }
            if (dislikes != null) {
                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                for (let i = 0; i < validoVentanaShort.length; i++) {
                    const el = validoVentanaShort[i];
                    if (settings.dislikes) {
                        if (!el.dataset.originalLabel) el.dataset.originalLabel = el.textContent;
                        el.textContent = `${FormatterNumber(dislikes, 0)}`;
                    } else {
                        if (el.dataset.originalLabel) {
                            el.textContent = el.dataset.originalLabel;
                            delete el.dataset.originalLabel;
                        }
                    }
                }
            }
            if (__ytToolsRuntime.updateShortsViewsButton) __ytToolsRuntime.updateShortsViewsButton(validoUrl, viewCount);
            if (__ytToolsRuntime.updateShortsRatingButton) __ytToolsRuntime.updateShortsRatingButton(validoUrl, rating);
        }
    }

    let showDislikes = false;

    window.addEventListener('yt-navigate-finish', () => {
        if (isYTMusic) return; // Dislikes UI not available on YTM
        const svgDislike = $e('.svg-dislike-ico');
        if (!svgDislike && showDislikes) {
            setTimeout(async () => {
                await videoDislike();
                await shortDislike();
            }, 1500);
        }
    });




