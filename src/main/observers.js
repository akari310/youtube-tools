
        function initSmartCommentObserver(settings) {
            if (isYTMusic) return;
            const commentsContainer = document.querySelector('#comments');
            if (!commentsContainer) return;

            if (window._commentIO) { try { window._commentIO.disconnect(); } catch (e) { } }
            if (window._commentMO) { try { window._commentMO.disconnect(); } catch (e) { } }

            window._commentIO = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    window._commentMO = new MutationObserver((mutations) => {
                        let shouldUpdate = false;
                        for (let m of mutations) {
                            if (m.addedNodes.length > 0) {
                                shouldUpdate = true;
                                break;
                            }
                        }
                        if (shouldUpdate) {
                            window.requestAnimationFrame(() => {
                                if (settings.avatars) addAvatarDownloadButtons(settings);
                                if (settings.translation) applyTranslator();
                            });
                        }
                    });

                    const commentContents = document.querySelector('ytd-comments #contents');
                    if (commentContents) {
                        window._commentMO.observe(commentContents, { childList: true, subtree: true });
                    }
                    window._commentIO.disconnect();
                }
            });

            window._commentIO.observe(commentsContainer);
        }

        function setupShortsObserver() {
            if (isYTMusic) return;
            const contentScrollable = $e('.anchored-panel.style-scope.ytd-shorts #contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer');
            if (contentScrollable) {
                if (__ytToolsRuntime.shortsObserver) {
                    try { __ytToolsRuntime.shortsObserver.disconnect(); } catch (e) { }
                }
                let domTimeout;
                __ytToolsRuntime.shortsObserver = new MutationObserver(() => {
                    if (domTimeout) clearTimeout(domTimeout);
                    domTimeout = setTimeout(() => {
                        insertReelBarButtons();
                        addIcon();
                    }, 300);
                });
                __ytToolsRuntime.shortsObserver.observe(contentScrollable, { childList: true, subtree: true });
            }
        }

        function initCommentNavListener(settings) {
            if (isYTMusic) return;
            if (!window.__ytToolsCommentNavBound) {
                window.__ytToolsCommentNavBound = true;
                document.addEventListener('yt-navigate-finish', () => {
                    setTimeout(() => initSmartCommentObserver(settings), 1500);
                });
            }
            initSmartCommentObserver(settings);
        }
