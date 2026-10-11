// =========================================================================
    // MIX -> PLAYLIST (YouTube only)
    //
    // A "Mix" (Danh sách nhạc kết hợp, ?list=RDMM) is a recommendation list,
    // not a real playlist: YouTube Music refuses to play it and there is no way
    // to save it as one. This feature turns the visible Mix into a normal
    // playlist so it can be opened in YouTube Music.
    //
    // HOW THE TRACK LIST IS READ
    //   From `ytInitialData`, by deep-searching for playlistPanelVideoRenderer /
    //   playlistVideoRenderer. The panel is NEVER scrolled: scrolling it moves
    //   the visible list, looks automated on screen and makes YouTube show a
    //   spinner. A Mix hands out its 50 tracks up front, so nothing is lost.
    //
    // HOW THE PLAYLIST IS CREATED
    //   Two Innertube calls, both captured from YouTube's own UI:
    //     playlist/create       { title, privacyStatus, videoIds[], params }
    //     browse/edit_playlist  { actions: [{addedVideoId, action:"ACTION_ADD_VIDEO"}], ... }
    //
    // AUTHENTICATION
    //   playlist/create answers 401 even with valid cookies. YouTube sends an
    //   extra `authorization` header (SAPISIDHASH / SAPISID1PHASH /
    //   SAPISID3PHASH). That hash is computed server-side and is NOT
    //   reproducible from the cookies - 14 candidate SHA-1 formulas were tried
    //   and none matched. So instead of recomputing it, we borrow YouTube's own:
    //   hook fetch / XMLHttpRequest once and keep the header off the first
    //   Innertube request the page makes. If nothing has been captured yet we
    //   wait for the next request rather than failing.
    //
    // CLICK HANDLING
    //   The Mix panel has its own document-level handler that collapses it, and
    //   the panel lives inside a shadow root, so a normal listener is too late.
    //   A single capture-phase listener on document handles our own clicks
    //   BEFORE YouTube sees them and stops them there. It also routes the click
    //   itself: stopping propagation on an ancestor in the capture phase also
    //   prevents the event from ever reaching our own button, so the handler
    //   cannot live on the button.
    // =========================================================================

    const MIXPL_BATCH = 100;
    const MIXPL_MAX_TRACKS = 500;
    const MIXPL_AUTH_WAIT_MS = 15000;

    const __mixPl = {
        hookInstalled: false,
        guardInstalled: false,
        auth: null,
        authTs: 0,
        visitor: null,
        panelHost: null,
        panelEl: null,
        popAnchor: null,
        lastListId: null,
        pop: null,
    };

    function mixPlCfg(key) {
        try {
            return (typeof unsafeWindow !== 'undefined' && unsafeWindow.ytcfg)
                ? unsafeWindow.ytcfg.get(key)
                : undefined;
        } catch (e) {
            return undefined;
        }
    }

    function mixPlHeadersToObject(h) {
        const o = {};
        try {
            if (!h) return o;
            if (typeof h.forEach === 'function') h.forEach((v, k) => { o[k] = v; });
            else Object.assign(o, h);
        } catch (e) {}
        return o;
    }

    // Our own fetch() calls go through the hook below, so this also sees the
    // headers WE send. Without a freshness check a stale header would be
    // written back over a fresh one and then re-sent forever. Keep whichever
    // has the newer timestamp.
    function mixPlCapture(h) {
        try {
            const a = h && (h.authorization || h.Authorization);
            if (a && a.indexOf('SAPISIDHASH') === 0) {
                const m = a.match(/SAPISIDHASH\s+(\d+)_/);
                const ts = m ? Number(m[1]) : 0;
                if (ts >= (__mixPl.authTs || 0)) {
                    __mixPl.auth = a;
                    __mixPl.authTs = ts;
                }
            }
            const v = h && (h['x-goog-visitor-id'] || h['X-Goog-Visitor-Id']);
            if (v && !__mixPl.visitor) __mixPl.visitor = v;
        } catch (e) {}
    }

    // Transparent pass-through wrappers. Nothing is consumed, nothing is
    // delayed, and any failure inside is swallowed so the page is unaffected.
    function mixPlInstallHooks() {
        if (__mixPl.hookInstalled) return;
        if (typeof unsafeWindow === 'undefined') return;
        __mixPl.hookInstalled = true;

        try {
            const W = unsafeWindow;
            const originalFetch = W.fetch;
            if (typeof originalFetch === 'function') {
                W.fetch = function (input, init) {
                    try {
                        if (input && input.url &&
                            input.url.indexOf('/youtubei/v1/') !== -1) {
                            mixPlCapture(mixPlHeadersToObject(input.headers));
                            if (init && init.headers) {
                                mixPlCapture(mixPlHeadersToObject(init.headers));
                            }
                        }
                    } catch (e) {}
                    return originalFetch.apply(this, arguments);
                };
            }
        } catch (e) {}

        try {
            const proto = unsafeWindow.XMLHttpRequest.prototype;
            const originalSetHeader = proto.setRequestHeader;
            proto.setRequestHeader = function (name, value) {
                try { mixPlCapture({ [String(name).toLowerCase()]: value }); }
                catch (e) {}
                return originalSetHeader.apply(this, arguments);
            };
        } catch (e) {}
    }

    // The header carries a timestamp; an old one may be rejected. Prefer a fresh
    // capture (the page sends Innertube requests constantly, so one arrives
    // within a second or two) but fall back to the stale copy rather than
    // failing outright - it is the only one we have.
    function mixPlAuthIsFresh() {
        if (!__mixPl.auth) return false;
        return (Math.floor(Date.now() / 1000) - (__mixPl.authTs || 0)) < 300;
    }

    function mixPlWaitForAuth(timeoutMs) {
        if (mixPlAuthIsFresh()) return Promise.resolve(__mixPl.auth);

        return new Promise((resolve, reject) => {
            const startedAt = Date.now();
            const tick = setInterval(() => {
                if (mixPlAuthIsFresh()) {
                    clearInterval(tick);
                    resolve(__mixPl.auth);
                } else if (Date.now() - startedAt > timeoutMs) {
                    clearInterval(tick);
                    if (__mixPl.auth) resolve(__mixPl.auth);
                    else {
                        reject(new Error(
                            'Could not capture YouTube\'s auth header. Interact with the page and try again.'
                        ));
                    }
                }
            }, 250);
        });
    }

    function mixPlPost(endpoint, body, auth) {
        const key = mixPlCfg('INNERTUBE_API_KEY');
        if (!key) return Promise.reject(new Error('Missing INNERTUBE_API_KEY'));

        const ver = mixPlCfg('INNERTUBE_CLIENT_VERSION') || '';
        const visitor = __mixPl.visitor || mixPlCfg('VISITOR_DATA') || '';

        return fetch(`https://www.youtube.com/youtubei/v1/${endpoint}?key=${key}&prettyPrint=false`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth,
                'X-Goog-Visitor-Id': visitor,
                'X-Origin': 'https://www.youtube.com',
                'X-Youtube-Bootstrap-Logged-In': 'true',
                'X-Goog-AuthUser': '0',
                'X-YouTube-Client-Name': '1',
                'X-YouTube-Client-Version': ver,
            },
            body: JSON.stringify(body),
        }).then(async (res) => {
            const text = await res.text();
            let json = null;
            try { json = JSON.parse(text); } catch (e) {}
            if (!res.ok) {
                const msg = (json && json.error && json.error.message) || text.slice(0, 200);
                throw new Error(`${endpoint} - HTTP ${res.status}: ${msg}`);
            }
            return json;
        });
    }

    // ytcfg INNERTUBE_CONTEXT is ALREADY { client: {...} }. Wrapping it again
    // gives { client: { client: {...} } } and the server answers 400.
    function mixPlContext() {
        const c = mixPlCfg('INNERTUBE_CONTEXT');
        if (c && c.client) return c;
        return {
            client: {
                clientName: 'WEB',
                clientVersion: mixPlCfg('INNERTUBE_CLIENT_VERSION') || '',
                hl: mixPlCfg('HL') || 'en',
                gl: mixPlCfg('GL') || 'US',
            },
        };
    }

    // ---- track list -------------------------------------------------------

    function mixPlHarvest(node, out, seen) {
        if (!node || typeof node !== 'object') return;

        if (Array.isArray(node)) {
            for (const item of node) mixPlHarvest(item, out, seen);
            return;
        }

        const r = node.playlistPanelVideoRenderer || node.playlistVideoRenderer;
        if (r && r.videoId && !seen.has(r.videoId)) {
            seen.add(r.videoId);
            out.push(r.videoId);
        }

        for (const k of Object.keys(node)) mixPlHarvest(node[k], out, seen);
    }

    // The panel items carry no video-id attribute, so the id has to be read
    // back out of the anchor href.
    function mixPlIdsFromDom() {
        const host = document.querySelector('ytd-playlist-panel-renderer');
        const root = host ? (host.shadowRoot || host) : null;
        if (!root) return [];
        const out = [];
        root.querySelectorAll('ytd-playlist-panel-video-renderer').forEach((el) => {
            const a = el.querySelector('#wc-endpoint');
            const href = a ? a.getAttribute('href') : null;
            if (!href) return;
            const id = new URLSearchParams(href.split('?')[1] || '').get('v');
            if (id) out.push(id);
        });
        return out;
    }

    function mixPlCollectTracks() {
        const seen = new Set();
        const order = [];

        // DOM first: the panel is what the user is looking at, so its order is
        // the order they expect the saved playlist to have. ytInitialData is
        // only a backstop for tracks the panel has not rendered yet.
        for (const id of mixPlIdsFromDom()) {
            if (!seen.has(id)) { seen.add(id); order.push(id); }
        }
        const fromDom = order.length;

        const initial = (typeof unsafeWindow !== 'undefined') ? unsafeWindow.ytInitialData : null;
        if (initial) mixPlHarvest(initial, order, seen);

        if (fromDom === 0) {
            console.warn('[YT Tools] mixPlaylist: panel order unavailable, using ytInitialData order');
        }
        return order.slice(0, MIXPL_MAX_TRACKS);
    }

    // ---- default name -----------------------------------------------------

    function mixPlDefaultName() {
        const host = document.querySelector('ytd-playlist-panel-renderer');
        const root = host ? (host.shadowRoot || host) : null;
        const titleEl = root ? root.querySelector('#title, .title, .byline-title') : null;
        const raw = (titleEl && titleEl.textContent ? titleEl.textContent : '').trim();
        const base = raw || 'Mix';
        const stamp = new Date().toLocaleDateString('en-GB');
        return `${base} - ${stamp}`.slice(0, 100);
    }

    // ---- styles -----------------------------------------------------------

    function mixPlEnsureStyles() {
        if (document.getElementById('yt-tools-mix-playlist-style')) return;
        const style = document.createElement('style');
        style.id = 'yt-tools-mix-playlist-style';
        style.textContent = [
            // Trigger sits in the panel action row. Styled to match YouTube's
            // own tonal text button (Save / Share) using its design tokens, so
            // it follows light/dark and font settings automatically.
            '#yt-tools-mix-pl-open {',
            '    display: inline-flex;',
            '    align-items: center;',
            '    height: 36px;',
            '    padding: 0 16px;',
            '    margin-right: 8px;',
            '    border: 0;',
            '    border-radius: 18px;',
            '    background: var(--yt-spec-badge-chip-background, rgba(128,128,128,0.2));',
            '    color: var(--yt-spec-text-primary, #0f0f0f);',
            '    font-family: "Roboto", "Arial", sans-serif;',
            '    font-size: 1.4rem;',
            '    font-weight: 500;',
            '    letter-spacing: 0.2px;',
            '    cursor: pointer;',
            '    white-space: nowrap;',
            '    flex: none;',
            '}',
            '@media (prefers-color-scheme: dark) {',
            '    #yt-tools-mix-pl-open { color: var(--yt-spec-text-primary, #f1f1f1); }',
            '}',
            '#yt-tools-mix-pl-open:hover {',
            '    background: var(--yt-spec-10-percent-layer, rgba(128,128,128,0.2));',
            '}',
            '#yt-tools-mix-pl-open:active { transform: scale(0.97); }',

            // Popover is appended to <body> with position:fixed. It therefore
            // escapes the panel's own overflow clipping, and no transformed
            // ancestor can turn "fixed" into "absolute" for us.
            '#yt-tools-mix-pl-pop {',
            '    position: fixed;',
            '    z-index: 3000;',
            '    width: 320px;',
            '    box-sizing: border-box;',
            '    padding: 16px;',
            '    border-radius: 12px;',
            '    border: 1px solid rgba(128,128,128,0.25);',
            '    background: var(--yt-spec-general-background-a, #212121);',
            '    color: var(--yt-spec-text-primary, #f1f1f1);',
            '    box-shadow: 0 6px 20px rgba(0,0,0,0.5);',
            '    display: flex;',
            '    flex-direction: column;',
            '    gap: 12px;',
            '    font-family: "Roboto", "Arial", sans-serif;',
            '}',
            '#yt-tools-mix-pl-title {',
            '    font-size: 1.5rem;',
            '    font-weight: 500;',
            '    line-height: 1.4;',
            '}',
            '#yt-tools-mix-pl-input {',
            '    width: 100%;',
            '    box-sizing: border-box;',
            '    padding: 10px 14px;',
            '    font-size: 1.4rem;',
            '    font-family: inherit;',
            '    border-radius: 18px;',
            '    border: 1px solid var(--yt-spec-10-percent-layer, rgba(128,128,128,0.4));',
            '    background: transparent;',
            '    color: inherit;',
            '}',
            '#yt-tools-mix-pl-input:focus {',
            '    outline: 2px solid var(--yt-spec-call-to-action, #065fd4);',
            '    outline-offset: -1px;',
            '}',
            '#yt-tools-mix-pl-actions {',
            '    display: flex;',
            '    flex-wrap: wrap;',
            '    gap: 8px;',
            '    justify-content: center;',
            '}',
            '#yt-tools-mix-pl-pop[data-view="result"] { gap: 14px; }',
            '#yt-tools-mix-pl-pop[data-view="result"] #yt-tools-mix-pl-status {',
            '    font-size: 1.4rem;',
            '    opacity: 1;',
            '    text-align: center;',
            '}',
            '.yt-tools-mix-pl-action {',
            '    border: 0;',
            '    border-radius: 18px;',
            '    padding: 0 16px;',
            '    height: 36px;',
            '    font-family: inherit;',
            '    font-size: 1.4rem;',
            '    font-weight: 500;',
            '    cursor: pointer;',
            '    background: var(--yt-spec-call-to-action, #065fd4);',
            '    color: #fff;',
            '    text-decoration: none;',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    white-space: nowrap;',
            '}',
            '.yt-tools-mix-pl-action.secondary {',
            '    background: var(--yt-spec-badge-chip-background, rgba(128,128,128,0.2));',
            '    color: var(--yt-spec-text-primary, inherit);',
            '}',
            '.yt-tools-mix-pl-action:disabled { opacity: 0.55; cursor: default; }',
            '#yt-tools-mix-pl-status { font-size: 1.2rem; line-height: 1.45; opacity: 0.85; }',
            '#yt-tools-mix-pl-status[data-state="error"] { color: var(--yt-spec-error, #ff4e45); opacity: 1; }',
        ].join('\n');
        document.head.appendChild(style);
    }

    // ---- popover ----------------------------------------------------------

    function mixPlClosePop() {
        if (__mixPl.pop) {
            __mixPl.pop.remove();
            __mixPl.pop = null;
        }
    }

    function mixPlOpenPop(anchor, build) {
        mixPlClosePop();
        mixPlEnsureStyles();

        const pop = document.createElement('div');
        pop.id = 'yt-tools-mix-pl-pop';
        pop.dataset.view = 'form';
        build(pop);
        document.body.appendChild(pop);

        __mixPl.pop = pop;
        __mixPl.popAnchor = anchor;
        mixPlPlacePop();
    }

    // Size and position the popover inside the panel. Called again whenever the
    // content changes: the result view is shorter than the form, so a position
    // computed for the form can leave it hanging off-screen.
    function mixPlPlacePop() {
        const pop = __mixPl.pop;
        const anchor = __mixPl.popAnchor;
        if (!pop || !anchor) return;

        // The panel is only ~400px wide, so a fixed 320px popover anchored to
        // the button spills over the track list.
        const panelEl = __mixPl.panelEl;
        const panelRect = panelEl
            ? panelEl.getBoundingClientRect()
            : { left: 8, right: window.innerWidth - 8, width: window.innerWidth };

        const margin = 8;
        const maxW = Math.max(220, panelRect.width - margin * 2);
        pop.style.width = Math.min(320, maxW) + 'px';

        const r = anchor.getBoundingClientRect();
        const h = pop.offsetHeight || 220;

        // Left edge: keep inside the panel, prefer aligned with the button.
        const minLeft = panelRect.left + margin;
        const maxLeft = panelRect.right - margin - pop.offsetWidth;
        let left = Math.min(Math.max(r.left, minLeft), maxLeft);
        if (maxLeft < minLeft) left = minLeft;
        pop.style.left = left + 'px';

        // Vertical: below the button, flip up when there is no room.
        const below = window.innerHeight - r.bottom;
        if (below < h + margin && r.top > below) {
            pop.style.top = Math.max(margin, r.top - h - 8) + 'px';
        } else {
            pop.style.top = Math.min(r.bottom + 8, window.innerHeight - h - margin) + 'px';
        }
    }

    function mixPlMakeAction(label, secondary) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = secondary ? 'yt-tools-mix-pl-action secondary' : 'yt-tools-mix-pl-action';
        btn.textContent = label;
        return btn;
    }

    function mixPlStatusEl() {
        const el = document.createElement('div');
        el.id = 'yt-tools-mix-pl-status';
        return el;
    }

    function mixPlSetStatus(pop, text, state) {
        const el = pop.querySelector('#yt-tools-mix-pl-status');
        if (!el) return;
        el.textContent = text;
        if (state) el.setAttribute('data-state', state);
        else el.removeAttribute('data-state');
    }

    // ---- the actual conversion -------------------------------------------

    async function mixPlRun(pop, nameInput, createBtn) {
        const title = (nameInput.value || '').trim();
        if (!title) {
            mixPlSetStatus(pop, 'Enter a playlist name.', 'error');
            nameInput.focus();
            return;
        }

        createBtn.disabled = true;
        nameInput.disabled = true;

        try {
            mixPlSetStatus(pop, 'Reading track list...');
            const ids = mixPlCollectTracks();
            if (!ids.length) throw new Error('No tracks found in this Mix.');

            mixPlSetStatus(pop, `Found ${ids.length} tracks. Creating playlist...`);

            if (!__mixPl.auth) {
                mixPlSetStatus(pop, 'Waiting for YouTube to authorise...');
            }
            const auth = await mixPlWaitForAuth(MIXPL_AUTH_WAIT_MS);

            const head = ids.slice(0, MIXPL_BATCH);
            const tail = ids.slice(MIXPL_BATCH);

            const created = await mixPlPost('playlist/create', {
                context: mixPlContext(),
                title: title,
                privacyStatus: 'PRIVATE',
                videoIds: head,
                params: 'CAAoAA%3D%3D',
            }, auth);

            const playlistId = created && created.playlistId;
            if (!playlistId) throw new Error('YouTube did not return a playlist id.');

            let done = head.length;
            let failed = 0;

            for (let i = 0; i < tail.length; i += MIXPL_BATCH) {
                const chunk = tail.slice(i, i + MIXPL_BATCH);
                try {
                    await mixPlPost('browse/edit_playlist', {
                        context: mixPlContext(),
                        actions: chunk.map((id) => ({ addedVideoId: id, action: 'ACTION_ADD_VIDEO' })),
                        params: 'IAE%3D',
                        playlistId: playlistId,
                    }, auth);
                    done += chunk.length;
                } catch (e) {
                    failed += chunk.length;
                    console.warn('[YT Tools] mix playlist chunk failed:', e);
                }
                mixPlSetStatus(pop, `Adding videos... ${done + failed}/${ids.length}`);
            }

            // Swap the form for the result. The link is a real anchor so it can
            // be opened or copied like any other link.
            pop.replaceChildren();
            pop.dataset.view = 'result';

            const status = mixPlStatusEl();
            status.setAttribute('data-state', failed ? 'error' : 'done');
            status.textContent = failed
                ? `Saved ${done}/${ids.length} tracks (${failed} failed).`
                : `Saved ${done} tracks to "${title}".`;

            const actions = document.createElement('div');
            actions.id = 'yt-tools-mix-pl-actions';

            const link = document.createElement('a');
            link.className = 'yt-tools-mix-pl-action';
            link.href = `https://music.youtube.com/playlist?list=${playlistId}`;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'Open in YT Music';
            actions.appendChild(link);

            const again = mixPlMakeAction('Save another', true);
            again.dataset.mixplAction = 'again';
            actions.appendChild(again);

            pop.appendChild(status);
            pop.appendChild(actions);

            mixPlPlacePop();
            Notify('success', `Playlist saved: ${done} tracks`);
        } catch (e) {
            createBtn.disabled = false;
            nameInput.disabled = false;
            mixPlSetStatus(pop, e.message || String(e), 'error');
            Notify('error', e.message || String(e), 'Mix to playlist');
        }
    }

    function mixPlBuildForm(anchor) {
        mixPlOpenPop(anchor, (pop) => {
            const title = document.createElement('div');
            title.id = 'yt-tools-mix-pl-title';
            title.textContent = 'Save Mix as playlist';

            const input = document.createElement('input');
            input.id = 'yt-tools-mix-pl-input';
            input.type = 'text';
            input.maxLength = 100;
            input.placeholder = 'Playlist name';
            input.value = mixPlDefaultName();

            const actions = document.createElement('div');
            actions.id = 'yt-tools-mix-pl-actions';

            const create = mixPlMakeAction('Create', false);
            create.dataset.mixplAction = 'create';
            const cancel = mixPlMakeAction('Cancel', true);
            cancel.dataset.mixplAction = 'cancel';
            actions.appendChild(create);
            actions.appendChild(cancel);

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); mixPlRun(pop, input, create); }
            });

            pop.appendChild(title);
            pop.appendChild(input);
            pop.appendChild(actions);
            pop.appendChild(mixPlStatusEl());
            input.focus();
            input.select();
        });
    }

    // ---- one capture listener --------------------------------------------

    // IMPORTANT: this listener sits on `document`, which is OUTSIDE the
    // playlist panel's shadow root. The browser retargets event.target to the
    // shadow host for such listeners, so target.closest('#our-id') never
    // matches. composedPath() keeps the real nodes, so use that instead.
    function mixPlInitGuard() {
        if (__mixPl.guardInstalled) return;
        __mixPl.guardInstalled = true;

        const onClick = (e) => {
            const path = e.composedPath ? e.composedPath() : [e.target];

            const ours = path.some((n) => n instanceof Element &&
                (n.id === 'yt-tools-mix-pl-open' || n.id === 'yt-tools-mix-pl-pop'));

            if (!ours) {
                // Click elsewhere closes the popover but keeps propagating, so
                // YouTube still behaves normally.
                if (__mixPl.pop) mixPlClosePop();
                return;
            }

            // Stop it before YouTube's own handler collapses the panel.
            e.stopPropagation();

            // ...but never preventDefault on a real link: on a click on an
            // <a href> that cancels the navigation, so "Open in YT Music"
            // silently does nothing. Only the buttons need it. Search the
            // path, not event.target: target is retargeted for the trigger
            // button because the panel lives in a shadow root.
            const isLink = path.some((n) => n instanceof Element &&
                n.tagName === 'A' && n.hasAttribute('href'));
            if (!isLink) e.preventDefault();

            let act = null;
            for (const n of path) {
                if (n instanceof Element && n.dataset && n.dataset.mixplAction) {
                    act = n;
                    break;
                }
            }
            if (!act) return;

            switch (act.dataset.mixplAction) {
                case 'toggle':
                    if (__mixPl.pop) mixPlClosePop();
                    else mixPlBuildForm($id('yt-tools-mix-pl-open'));
                    return;
                case 'cancel':
                    mixPlClosePop();
                    return;
                case 'again':
                    mixPlBuildForm($id('yt-tools-mix-pl-open'));
                    return;
                case 'create': {
                    const pop = __mixPl.pop;
                    const input = pop && pop.querySelector('#yt-tools-mix-pl-input');
                    const create = pop && pop.querySelector('[data-mixpl-action="create"]');
                    if (input && create) mixPlRun(pop, input, create);
                    return;
                }
            }
        };

        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && __mixPl.pop) mixPlClosePop();
        });
    }

    // ---- mount ------------------------------------------------------------

    function mixPlMount() {
        const host = document.querySelector('ytd-playlist-panel-renderer');
        if (!host) return false;

        const root = host.shadowRoot || host;
        const bar = root.querySelector('#top-row-buttons')
            || root.querySelector('#start-actions')
            || root.querySelector('#header-contents');
        if (!bar) return false;

        mixPlEnsureStyles();
        mixPlInitGuard();

        let btn = root.querySelector('#yt-tools-mix-pl-open');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'yt-tools-mix-pl-open';
            btn.type = 'button';
            btn.dataset.mixplAction = 'toggle';
            btn.title = 'Save this Mix as a playlist you can play in YouTube Music';
            btn.textContent = 'Save as playlist';
            // #top-row-buttons is the panel's own action slot and is empty on a
            // Mix. Guessing at "insert before the X" was wrong: the X is
            // <yt-icon-button id="trailing-button">, a sibling of the slot, and
            // .dropdown-trigger belongs to the three-dot menu above it.
            bar.appendChild(btn);
        }

        __mixPl.panelHost = bar;
        __mixPl.panelEl = host;
        console.log('[YT Tools] mixPlaylist: button mounted in #' + (bar.id || 'host'));
        return true;
    }

    function mixPlUnmount() {
        mixPlClosePop();
        if (__mixPl.panelHost) {
            // The toolbar is rebuilt by YouTube on navigation, so the stale node
            // is usually already gone; remove it defensively anyway.
            __mixPl.panelHost.querySelector('#yt-tools-mix-pl-open')?.remove();
            __mixPl.panelHost = null;
        }
        __mixPl.panelEl = null;
        __mixPl.popAnchor = null;
    }

    function applyMixPlaylistIfEnabled(settings) {
        if (isYTMusic) return;

        const enabled = !!settings?.mixPlaylist;
        const listId = new URLSearchParams(location.search).get('list');

        // Every Mix/radio id starts with "RD", and there are at least three
        // shapes, so matching one exact string is never enough:
        //   list=RDMM                         unnamed mix
        //   list=RDMEMCFMFH2exzj...           named mix (Mixes tab)
        //   list=RDTcOO2WEBK94&start_radio=1  mix seeded from a single video
        // Nothing YouTube lets you save is prefixed RD - real playlists are
        // PL / UU / OL / FL / LL / TL - so the prefix is the reliable signal.
        const onMix = !!listId && listId.startsWith('RD');
        console.log('[YT Tools] mixPlaylist enabled=' + enabled + ' list=' + listId);

        // Hooks stay installed once we are turned on: they cost nothing and the
        // captured header must survive leaving the Mix page.
        if (enabled) mixPlInstallHooks();

        if (!enabled || !onMix) {
            mixPlUnmount();
            return;
        }

        if (__mixPl.lastListId === listId && __mixPl.panelHost &&
            document.contains(__mixPl.panelHost)) {
            return;
        }

        mixPlUnmount();
        __mixPl.lastListId = listId;

        let tries = 0;
        const tryMount = () => {
            if (mixPlMount()) return;
            if (++tries > 40) {
                console.warn('[YT Tools] mixPlaylist: panel toolbar not found after 40 tries');
                return;
            }
            setTimeout(tryMount, 500);
        };
        tryMount();
    }