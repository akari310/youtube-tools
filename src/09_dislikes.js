
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
            validoUrl = paramsVideoURL();
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

                // Use MutationObserver for robust state tracking (handles Like button clicks too)
                if (!dislikes_btn.dataset.observerInitialized) {
                    dislikes_btn.dataset.observerInitialized = 'true';
                    
                    const videoId = validoUrl;
                    const sessionKey = `yt-dislike-initial-${videoId}`;

                    // Delay capturing initial state to ensure YouTube's UI has stabilized
                    setTimeout(() => {
                        let initialState = sessionStorage.getItem(sessionKey);
                        if (initialState === null) {
                            initialState = dislikes_btn.getAttribute('aria-pressed') === 'true';
                            sessionStorage.setItem(sessionKey, initialState);
                        } else {
                            initialState = initialState === 'true';
                        }

                        dislikes_btn.dataset.initialState = initialState;
                        dislikes_btn.dataset.originalCount = dislikes;
                        
                        // Initial update
                        updateCount();
                    }, 500);

                    const updateCount = () => {
                        const isPressed = dislikes_btn.getAttribute('aria-pressed') === 'true';
                        const wasPressed = dislikes_btn.dataset.initialState === 'true';
                        const original = Number(dislikes_btn.dataset.originalCount || dislikes);
                        const data = __ytToolsRuntime.dislikesCache;
                        
                        let offset = 0;
                        if (!wasPressed && isPressed) offset = 1;      // Added dislike
                        else if (wasPressed && !isPressed) offset = -1; // Removed dislike
                        
                        const newCount = Math.max(0, original + offset);
                        if (data) data.dislikes = newCount;
                        
                        if (settings.dislikes && textContent) {
                            textContent.textContent = FormatterNumber(newCount, 0);
                        }
                    };

                    const observer = new MutationObserver((mutations) => {
                        for (const mutation of mutations) {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-pressed') {
                                updateCount();
                            }
                        }
                    });

                    observer.observe(dislikes_btn, { attributes: true, attributeFilter: ['aria-pressed'] });
                    
                    // Also handle direct clicks just in case
                    dislikes_btn.addEventListener('click', () => {
                        setTimeout(updateCount, 150);
                    });
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





    // Styles for our enhancement panel
