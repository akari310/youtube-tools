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

    const eyeIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>';
    const classicIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" /><path d="M16 3l-4 4l-4 -4" /></svg>';
    const starIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

    function createReelBarButton(opts) {
        const wrap = document.createElement('div');
        wrap.className = 'button-view-model ytSpecButtonViewModelHost';
        if (opts.dataAttr) wrap.setAttribute(opts.dataAttr, '1');
        const label = document.createElement('label');
        label.className = 'yt-spec-button-shape-with-label ytSpecButtonShapeWithLabelHost';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeL ytSpecButtonShapeNextIconButton';
        button.title = opts.title || '';
        button.setAttribute('aria-label', opts.ariaLabel || '');
        const iconDiv = document.createElement('div');
        iconDiv.className = 'yt-spec-button-shape-next__icon';
        iconDiv.setAttribute('aria-hidden', 'true');
        const iconSpan = document.createElement('span');
        iconSpan.className = 'yt-icon-shape ytSpecIconShapeHost';
        if (opts.iconSvg) {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = safeHTML(opts.iconSvg);
                while (tempDiv.firstChild) iconSpan.appendChild(tempDiv.firstChild);
            } catch (e) {}
        }
        iconDiv.appendChild(iconSpan);
        button.appendChild(iconDiv);
        const labelDiv = document.createElement('div');
        labelDiv.className = 'yt-spec-button-shape-with-label__label';
        labelDiv.setAttribute('aria-hidden', 'false');
        const labelSpan = document.createElement('span');
        labelSpan.className = 'yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--text-alignment-center yt-core-attributed-string--word-wrapping';
        labelSpan.setAttribute('role', 'text');
        labelSpan.textContent = opts.labelText || '';
        labelDiv.appendChild(labelSpan);
        label.appendChild(button);
        label.appendChild(labelDiv);
        wrap.appendChild(label);
        if (opts.onclick) button.addEventListener('click', opts.onclick);
        return wrap;
    }

    function updateShortsViewsButton(videoId, viewCount) {
        const bar = $e('reel-action-bar-view-model');
        if (!bar) return;
        const viewsWrap = bar.querySelector('[data-yt-tools-shorts-views]');
        if (!viewsWrap) return;
        const labelSpan = viewsWrap.querySelector('.yt-spec-button-shape-with-label__label span, [role="text"]');
        if (!labelSpan) return;
        labelSpan.textContent = Number.isFinite(viewCount) && viewCount >= 0 ? FormatterNumber(viewCount, 0) : '\u2014';
    }

    function updateShortsRatingButton(videoId, rating) {
        const bar = $e('reel-action-bar-view-model');
        if (!bar) return;
        const ratingWrap = bar.querySelector('[data-yt-tools-shorts-rating]');
        if (!ratingWrap) return;
        const labelSpan = ratingWrap.querySelector('.yt-spec-button-shape-with-label__label span, [role="text"]');
        if (!labelSpan) return;
        labelSpan.textContent = (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating.toFixed(1) : '\u2014';
    }

    function insertReelBarButtons() {
        const isShortsPage = document.location.pathname.startsWith('/shorts');
        const bar = $e('reel-action-bar-view-model');
        if (!isShortsPage || !bar) {
            document.querySelectorAll('[data-yt-tools-shorts-classic], [data-yt-tools-shorts-views], [data-yt-tools-shorts-rating]').forEach(el => el.remove());
            return;
        }
        if (bar.querySelector('[data-yt-tools-shorts-classic]')) return;
        const classicBtn = createReelBarButton({
            dataAttr: 'data-yt-tools-shorts-classic',
            title: 'Classic mode',
            ariaLabel: 'Classic mode',
            iconSvg: classicIconSvg,
            labelText: '',
            onclick: redirectToClassic,
        });
        const viewsBtn = createReelBarButton({
            dataAttr: 'data-yt-tools-shorts-views',
            title: 'Views',
            ariaLabel: 'Views',
            iconSvg: eyeIconSvg,
            labelText: '\u2014',
            onclick: function () {},
        });
        const ratingBtn = createReelBarButton({
            dataAttr: 'data-yt-tools-shorts-rating',
            title: 'Rating',
            ariaLabel: 'Rating',
            iconSvg: starIconSvg,
            labelText: '\u2014',
            onclick: function () {},
        });
        bar.insertBefore(ratingBtn, bar.firstChild);
        bar.insertBefore(viewsBtn, bar.firstChild);
        bar.insertBefore(classicBtn, bar.firstChild);
        const videoId = (document.location.pathname.split('/').filter(Boolean))[1];
        if (videoId) {
            const persisted = getLikesDislikesFromPersistedCache(videoId);
            if (persisted && persisted.viewCount != null) updateShortsViewsButton(videoId, persisted.viewCount);
            if (persisted && persisted.rating != null) updateShortsRatingButton(videoId, persisted.rating);
        }
        __ytToolsRuntime.updateShortsViewsButton = updateShortsViewsButton;
        __ytToolsRuntime.updateShortsRatingButton = updateShortsRatingButton;
    }

    function nukeShortsCinematic() {
        if (isYTMusic) return;
        const selector = '#cinematic-container.ytd-reel-video-renderer, #shorts-cinematic-container, #cinematic-shorts-scrim';
        document.querySelectorAll(selector).forEach(el => el.remove());
        document.querySelectorAll('ytd-reel-video-renderer').forEach(reel => {
            if (reel.shadowRoot) {
                const cinematic = reel.shadowRoot.querySelector('#cinematic-container');
                if (cinematic) cinematic.remove();
            }
        });
        document.querySelectorAll('ytd-engagement-panel-section-list-renderer[shorts-panel], ytd-shorts ytd-engagement-panel-section-list-renderer').forEach(panel => {
            const content = panel.querySelector('#content');
            const header = panel.querySelector('#header');
            if (content) {
                content.style.setProperty('background', 'transparent', 'important');
                content.style.setProperty('background-color', 'transparent', 'important');
            }
            if (header) {
                header.style.setProperty('background', 'transparent', 'important');
                header.style.setProperty('background-color', 'transparent', 'important');
            }
            panel.style.setProperty('background', 'transparent', 'important');
            panel.style.setProperty('background-color', 'transparent', 'important');
        });
        document.querySelectorAll('.navigation-container.ytd-shorts').forEach(nav => {
            nav.style.setProperty('background', 'transparent', 'important');
            nav.style.setProperty('background-color', 'transparent', 'important');
        });
    }

    if (!window.__ytToolsShortsNukeInterval) {
        window.__ytToolsShortsNukeInterval = setInterval(() => {
            if (window.location.pathname.startsWith('/shorts/')) {
                nukeShortsCinematic();
            }
        }, 2000);
    }
