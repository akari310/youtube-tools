    function setupHeaderObserver() {
        if (headerObserver) return;
        const target = $e('#masthead-container') || $e('ytd-masthead') || document.body;
        headerObserver = new MutationObserver(() => {
            const icon = $id('icon-menu-settings');
            if (!icon || !document.body.contains(icon)) {
                addIcon();
            }
        });
        headerObserver.observe(target, { childList: true, subtree: true });
    }

    function addIcon() {
        const existing = $id('icon-menu-settings');
        if (existing && document.body.contains(existing)) return;
        if (existing) existing.closest('#toggle-button')?.remove();

        let anchor;
        if (isYTMusic) {
            anchor = $e('#right-content');
        } else {
            anchor = $e('ytd-topbar-menu-button-renderer') || $e('#buttons') || $e('#end');
        }
        if (!anchor) return;

        const toggleButton = $cl('div');
        toggleButton.id = 'toggle-button';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.marginRight = '8px';

        const icon = $cl('i');
        icon.id = 'icon-menu-settings';
        icon.classList.add('fa-solid', 'fa-gear');
        icon.style.fontSize = '20px';

        toggleButton.appendChild(icon);

        if (isYTMusic) {
            anchor.insertBefore(toggleButton, anchor.firstChild);
        } else {
            anchor.parentElement.insertBefore(toggleButton, anchor);
        }

        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        setupHeaderObserver();
    }

    let openMenu = false;
    function toggleMenu() {
        openMenu = !openMenu;
        panel.style.display = openMenu ? 'block' : 'none';
        panelOverlay.style.display = openMenu ? 'block' : 'none';
    }

    // Close panel when clicking the overlay
    panelOverlay.addEventListener('click', () => {
        if (openMenu) {
            toggleMenu();
        }
    });


    addIcon();
    const close_menu_settings = $e('.close_menu_settings');
    if (close_menu_settings) {
        close_menu_settings.addEventListener('click', () => {
            toggleMenu();
        });
    }

    // $ap(toggleButton);

    // Add change listener to the entire panel to save/apply settings immediately
    panel.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox-mdcm') || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
            saveSettings();
            if (typeof applySettings === 'function') {
                applySettings();
            }
        }
    });

    // Specific listeners for live updates of certain features
    $id('dislikes-toggle')?.addEventListener('change', () => {
        const st = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        if (!st.dislikes) {
            // Hide dislikes if turned off
            const dislikes_content = $e('#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button');
            if (dislikes_content) {
                // We don't have the original SVG easily, but we can at least hide our custom one or clear it
                // For now, let's just trigger a reload message or try to refresh the component
                // Actually, the user just wants it to go away.
                dislikes_content.style.width = '';
                // We'll let applySettings handle the bar, but for the button, we might need a refresh or more complex logic.
                // But let's try to at least call applySettings.
            }
        }
    });



    // Tab functionality
    const tabButtons = $m('.tab-mdcm');
    const tabContents = $m('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));
            button.classList.add('active');
            $id(tabName).classList.add('active');
        });
    });

    // Function to save settings
    function saveSettings() {
        const settings = {
            theme: $e('input[name="theme"]:checked').value,
            bgColorPicker: $id('bg-color-picker').value,
            progressbarColorPicker: $id('progressbar-color-picker').value,
            primaryColorPicker: $id('primary-color-picker').value,
            secondaryColorPicker: $id('secondary-color-picker').value,
            headerColorPicker: $id('header-color-picker').value,
            iconsColorPicker: $id('icons-color-picker').value,
            menuColorPicker: $id('menu-color-picker').value,
            lineColorPicker: $id('line-color-picker').value,
            timeColorPicker: $id('time-color-picker').value,
            dislikes: $id('dislikes-toggle').checked,
            likeDislikeBar: $id('like-dislike-bar-toggle').checked,
            bookmarks: $id('bookmarks-toggle').checked,
            continueWatching: $id('continue-watching-toggle').checked,
            shortsChannelName: $id('shorts-channel-name-toggle').checked,
            nonstopPlayback: $id('nonstop-playback-toggle') ? $id('nonstop-playback-toggle').checked : true,
            audioOnly: $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false,
            themes: $id('themes-toggle').checked,
            translation: $id('translation-toggle').checked,
            avatars: $id('avatars-toggle').checked,
            reverseMode: $id('reverse-mode-toggle').checked,
            waveVisualizer: $id('wave-visualizer-toggle').checked,
            waveVisualizerSelected: $id('select-wave-visualizer-select').value,
            hideComments: $id('hide-comments-toggle').checked,
            hideSidebar: $id('hide-sidebar-toggle').checked,
            disableAutoplay: $id('autoplay-toggle').checked,
            cinematicLighting: $id('cinematic-lighting-toggle').checked,
            syncCinematic: $id('sync-cinematic-toggle') ? $id('sync-cinematic-toggle').checked : false, // NUEVO SETTING
            sidePanelStyle: $id('side-panel-style-select') ? $id('side-panel-style-select').value : 'normal',
            customTimelineColor: $id('custom-timeline-color-toggle') ? $id('custom-timeline-color-toggle').checked : false,
            disableSubtitles: $id('subtitles-toggle') ? $id('subtitles-toggle').checked : false,
            // fontSize: $id('font-size-slider').value,
            playerSize: $id('player-size-slider').value,
            selectVideoQuality: $id('select-video-qualitys-select').value,
            languagesComments: $id('select-languages-comments-select').value,
            // menuBgColor: $id('menu-bg-color-picker').value,
            // menuTextColor: $id('menu-text-color-picker').value,
            menu_akari: {
                bg: selectedBgColor,
                color: selectedTextColor,
                accent: selectedBgAccentColor
            }
            // menuFontSize: $id('menu-font-size-slider').value,
        };

        GM_setValue(SETTINGS_KEY, JSON.stringify(settings));
    }



    // Function to load settings
    function loadSettings() {
        const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        // Mark as loaded early so applySettings/saveSettings don't overwrite persisted values with defaults.
        __ytToolsRuntime.settingsLoaded = true;

        if (settings.theme) {
            $e(`input[name="theme"][value="${settings.theme}"]`).checked = true;
        }
        const menuData = settings.menu_akari || settings.menu_developermdcm || {
            bg: "#252525",
            color: "#ffffff",
            accent: "#ff0000"
        };

        $id('bg-color-picker').value = settings.bgColorPicker || '#000000';
        $id('progressbar-color-picker').value = settings.progressbarColorPicker || '#ff0000';
        $id('primary-color-picker').value = settings.primaryColorPicker || '#ffffff';
        $id('secondary-color-picker').value = settings.secondaryColorPicker || '#ffffff';
        $id('header-color-picker').value = settings.headerColorPicker || '#000';
        $id('icons-color-picker').value = settings.iconsColorPicker || '#ffffff';
        $id('menu-color-picker').value = settings.menuColorPicker || '#000';
        $id('line-color-picker').value = settings.lineColorPicker || '#ff0000';
        $id('time-color-picker').value = settings.timeColorPicker || '#ffffff';
        $id('dislikes-toggle').checked = settings.dislikes || false;
        $id('like-dislike-bar-toggle').checked = settings.likeDislikeBar || false;
        $id('bookmarks-toggle').checked = settings.bookmarks || false;
        $id('continue-watching-toggle').checked = settings.continueWatching || false;
        $id('shorts-channel-name-toggle').checked = settings.shortsChannelName || false;
        if ($id('nonstop-playback-toggle')) $id('nonstop-playback-toggle').checked = settings.nonstopPlayback !== false;
        if ($id('audio-only-toggle')) $id('audio-only-toggle').checked = settings.audioOnly || false;
        syncAudioOnlyTabCheckbox(settings);
        $id('themes-toggle').checked = settings.themes || false;
        $id('translation-toggle').checked = settings.translation || false;
        $id('avatars-toggle').checked = settings.avatars || false;
        $id('reverse-mode-toggle').checked = settings.reverseMode || false;
        $id('wave-visualizer-toggle').checked = settings.waveVisualizer || false;
        $id('select-wave-visualizer-select').value = settings.waveVisualizerSelected || 'dinamica';
        $id('hide-comments-toggle').checked = settings.hideComments || false;
        $id('hide-sidebar-toggle').checked = settings.hideSidebar || false;
        $id('autoplay-toggle').checked = settings.disableAutoplay || false;
        $id('cinematic-lighting-toggle').checked = settings.cinematicLighting || false;
        if ($id('sync-cinematic-toggle')) $id('sync-cinematic-toggle').checked = settings.syncCinematic || false;
        if ($id('side-panel-style-select')) $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';
        if ($id('custom-timeline-color-toggle')) $id('custom-timeline-color-toggle').checked = settings.customTimelineColor || false;
        if ($id('subtitles-toggle')) $id('subtitles-toggle').checked = settings.disableSubtitles || false;
        $id('player-size-slider').value = settings.playerSize || 100;
        $id('select-video-qualitys-select').value = settings.selectVideoQuality || 'user';
        $id('select-languages-comments-select').value = settings.languagesComments || 'en';

        selectedBgColor = menuData.bg;
        selectedTextColor = menuData.color;
        selectedBgAccentColor = menuData.accent;


        $m('#bg-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedBgColor);
        });

        $m('#text-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedTextColor);
        });

        $m('#bg-accent-color-options .color-box').forEach(el => {
            el.classList.toggle('selected', el.dataset.value === selectedBgAccentColor);
        });

        // Apply menu colors
        $sp('--yt-enhance-menu-bg', selectedBgColor);
        $sp('--yt-enhance-menu-text', selectedTextColor);
        $sp('--yt-enhance-menu-accent', selectedBgAccentColor);
        updateSliderValues();

        setTimeout(() => {
            applySettings();
            if (settings.dislikes && !isYTMusic) {
                videoDislike();
                shortDislike();
                showDislikes = true;
            }

            if (!isYTMusic && window.location.href.includes('youtube.com/watch?v=')) {
                detectInitialCinematicState();
            }
        }, 500);
    }

    // Check if the video is in cinematic mode
    async function detectInitialCinematicState() {
        return new Promise((resolve) => {
            const waitForVideo = () => {
                const video = $e('video');
                const cinematicDiv = $id('cinematics');

                if (!video || !cinematicDiv || isNaN(video.duration) || video.duration === 0) {
                    setTimeout(waitForVideo, 500);
                    return;
                }

                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                if (!settings.syncCinematic) {
                    // apply cinematic toggle
                    const cinematicToggle = $id('cinematic-lighting-toggle');
                    if (cinematicToggle && cinematicDiv) {
                        cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
                    }
                    resolve(false);
                    return;
                }

                const startTime = video.currentTime;
                const checkPlayback = () => {
                    if (video.currentTime >= startTime + 1) {
                        const isActive = isCinematicActive();

                        const cinematicToggle = $id('cinematic-lighting-toggle');
                        if (cinematicToggle && cinematicToggle.checked !== isActive) {
                            cinematicToggle.checked = isActive;
                            saveSettings();
                        }

                        resolve(isActive);
                    } else {
                        setTimeout(checkPlayback, 300);
                    }
                };

                checkPlayback();
            };

            waitForVideo();
        });
    }

    $m('.color-box').forEach(box => {
        box.addEventListener('click', () => {
            const type = box.dataset.type;
            const value = box.dataset.value;

            if (type === 'bg') {
                selectedBgColor = value;
                $sp('--yt-enhance-menu-bg', value);
                $m('#bg-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            } else if (type === 'color') {
                selectedTextColor = value;
                $sp('--yt-enhance-menu-text', value);
                $m('#text-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            } else if (type === 'accent') {
                selectedBgAccentColor = value;
                $sp('--yt-enhance-menu-accent', value);
                $m('#bg-accent-color-options .color-box').forEach(el => {
                    el.classList.remove('selected');
                });
                box.classList.add('selected');
            }
            saveSettings();
        });
    });


    function updateSliderValues() {
        $id('player-size-value').textContent = $id('player-size-slider').value;

    }

    $id('reset-player-size').addEventListener('click', () => {
        $id('player-size-slider').value = 100;
        updateSliderValues();
        applySettings();
    });

    // Initialize header buttons once
    function initializeHeaderButtons() {
        const shareBtn = $id('shareBtn-mdcm');
        const importExportBtn = $id('importExportBtn');
        const closeImportExportBtn = $id('closeImportExportBtn');

        if (shareBtn && !shareBtn.dataset.initialized) {
            shareBtn.dataset.initialized = 'true';
            shareBtn.addEventListener('click', function (event) {
                event.stopPropagation();
                const dropdown = $id('shareDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }

        if (importExportBtn && !importExportBtn.dataset.initialized) {
            importExportBtn.dataset.initialized = 'true';
            importExportBtn.addEventListener('click', function () {
                const importExportArea = $id('importExportArea');
                if (importExportArea) {
                    importExportArea.classList.toggle('active');
                }
            });
        }

        if (closeImportExportBtn && !closeImportExportBtn.dataset.initialized) {
            closeImportExportBtn.dataset.initialized = 'true';
            closeImportExportBtn.addEventListener('click', function () {
                const importExportArea = $id('importExportArea');
                if (importExportArea) {
                    importExportArea.classList.remove('active');
                }
            });
        }
    }



    // Persistent check to ensure the gear icon survives YouTube's dynamic UI updates
    // setupHeaderObserver() is now called inside addIcon()
    // ------------------------------
    // YTM Ambient Mode — CSS background-image blur approach
    // Uses album art or video poster as a blurred full-screen background glow
    // Elements stay persistent for smooth transitions — only .active class toggles

    // ------------------------------

    const ytmAmbientMode = {
        active: false,
        _initialized: false, // true once DOM elements are created
        glowEl: null,
        styleEl: null,
        videoEl: null,
        _lastSrc: '',
        _pollId: null,

        // Find album art image URL from YTM player page
        _getArtUrl() {
            // 1. Rock-solid way: Get from YouTube Player API directly
            try {
                const mp = document.getElementById('movie_player');
                if (mp && typeof mp.getVideoData === 'function') {
                    const vData = mp.getVideoData();
                    if (vData && vData.video_id) {
                        return `https://i.ytimg.com/vi/${vData.video_id}/sddefault.jpg`;
                    }
                }
            } catch (e) { }

            // 2. Fallbacks
            const selectors = [
                '#song-image yt-img-shadow img',
                '#song-image img',
                'ytmusic-player-page #thumbnail img',
                '#player-page .thumbnail img',
                'ytmusic-player-bar .image img',
                'ytmusic-player-bar img'
            ];
            for (const sel of selectors) {
                const img = document.querySelector(sel);
                if (img && img.src && img.src.startsWith('http')) {
                    return img.src.replace(/=w\d+-h\d+/, '=w640-h640').replace(/=s\d+/, '=s640');
                }
            }
            const video = $e('video');
            if (video && video.poster) return video.poster;
            return null;
        },

        // Create DOM elements once (called only once, persists across show/hide)
        _ensureInit() {
            if (this._initialized) return;
            this._initialized = true;

            // Create the glow div
            this.glowEl = document.createElement('div');
            this.glowEl.id = 'ytm-ambient-glow';
            document.body.appendChild(this.glowEl);

            // Create the custom sidebar divider that perfectly fits the top/bottom bars
            this.dividerEl = document.createElement('div');
            this.dividerEl.id = 'ytm-custom-divider';
            document.body.appendChild(this.dividerEl);

            // Create style element
            this.styleEl = document.createElement('style');
            this.styleEl.id = 'ytm-ambient-style';
            this.styleEl.textContent = `
        #ytm-ambient-glow {
          position: fixed;
          top: -200px; left: -200px;
          width: calc(100vw + 400px);
          height: calc(100vh + 400px);
          pointer-events: none;
          z-index: -1;
          opacity: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(140px) saturate(2.2) brightness(0.9);
          transition: opacity 1.2s ease;
        }
        #ytm-ambient-glow.active {
          opacity: 0.7;
        }
        #ytm-custom-divider {
          position: fixed;
          width: 1px;
          background: rgba(255, 255, 255, 0.15);
          pointer-events: none;
          z-index: 2000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        body.ytm-ambient-active #ytm-custom-divider.active {
          opacity: 1;
        }
        /* Make player page backgrounds transparent so glow shows through */
        body.ytm-ambient-active ytmusic-app,
        body.ytm-ambient-active ytmusic-app-layout,
        body.ytm-ambient-active #layout {
          background-color: transparent !important;
          background: transparent !important;
          transition: background-color 0.6s ease;
        }
        body.ytm-ambient-active ytmusic-player-page,
        body.ytm-ambient-active #player-page,
        body.ytm-ambient-active ytmusic-player-page #main-panel,
        body.ytm-ambient-active .background-gradient {
          background-color: transparent !important;
          background: transparent !important;
          background-image: none !important;
        }
        /* Make nav bar, player bar, and side drawer transparent so the aura blends behind them smoothly */
        body.ytm-ambient-active #nav-bar-background,
        body.ytm-ambient-active #player-bar-background,
        body.ytm-ambient-active ytmusic-nav-bar,
        body.ytm-ambient-active ytmusic-player-bar,
        body.ytm-ambient-active tp-yt-app-drawer,
        body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
        body.ytm-ambient-active #guide-wrapper,
        body.ytm-ambient-active #guide-content,
        body.ytm-ambient-active ytmusic-guide-renderer,
        body.ytm-ambient-active #mini-guide-background,
        body.ytm-ambient-active #mini-guide {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        /* Remove borders that piece through the player bar when transparent */
        body.ytm-ambient-active tp-yt-app-drawer,
        body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
        body.ytm-ambient-active #guide-wrapper,
        body.ytm-ambient-active #guide-content,
        body.ytm-ambient-active ytmusic-guide-renderer,
        body.ytm-ambient-active #mini-guide-background {
          border: none !important;
          border-right: none !important;
          box-shadow: none !important;
        }
        /* Hide home/browse pages when player is open so they don't bleed through or block the glow */
        body.ytm-ambient-active ytmusic-browse-response {
          visibility: hidden !important;
          opacity: 0 !important;
        }


      `;
            document.head.appendChild(this.styleEl);
        },

        // Show ambient (fast — just toggle class + update art)
        show() {
            if (!isYTMusic) return;
            if (this.active) return;
            if (!window.location.href.includes('/watch')) return;

            this._ensureInit();
            this.active = true;

            // Update video reference
            this.videoEl = document.querySelector('video');

            if (this.glowEl) {
                this.glowEl.classList.add('active');
                document.body.classList.add('ytm-ambient-active');
            }

            this._updateArt();
            this._startPoll();
            this._startTracker();

            // Listen for play events (for art updates on song change)
            if (this.videoEl) {
                this.videoEl.removeEventListener('play', this._onPlay);
                this.videoEl.addEventListener('play', this._onPlay);
            }
        },

        // Hide ambient (fast — just toggle class, keep elements)
        hide() {
            this.active = false;
            if (this._pollId) {
                clearInterval(this._pollId);
                this._pollId = null;
            }
            if (this._trackerId) {
                cancelAnimationFrame(this._trackerId);
                this._trackerId = null;
            }
            if (this.glowEl) {
                this.glowEl.classList.remove('active');
                document.body.classList.remove('ytm-ambient-active');
            }
            if (this.dividerEl) {
                this.dividerEl.classList.remove('active');
            }
            if (this.videoEl) {
                this.videoEl.removeEventListener('play', this._onPlay);
                this.videoEl = null;
            }
        },

        // Full cleanup — remove all DOM elements (only when disabling feature)
        destroy() {
            this.hide();
            this._lastSrc = '';
            this._initialized = false;
            if (this.glowEl) {
                if (this.glowEl.parentNode) this.glowEl.parentNode.removeChild(this.glowEl);
                this.glowEl = null;
            }
            if (this.dividerEl) {
                if (this.dividerEl.parentNode) this.dividerEl.parentNode.removeChild(this.dividerEl);
                this.dividerEl = null;
            }
            if (this.styleEl) {
                if (this.styleEl.parentNode) this.styleEl.parentNode.removeChild(this.styleEl);
                this.styleEl = null;
            }
        },

        _startTracker() {
            if (this._trackerId) cancelAnimationFrame(this._trackerId);

            const self = this;
            function track() {
                if (!self.active) { self._trackerId = null; return; }

                const nav = document.querySelector('ytmusic-nav-bar');
                const player = document.querySelector('ytmusic-player-bar');
                const drawer = document.querySelector('tp-yt-app-drawer');
                const wrapper = document.querySelector('#guide-wrapper') || document.querySelector('#mini-guide-background');

                if (nav && player && drawer && wrapper && self.dividerEl) {
                    const navRect = nav.getBoundingClientRect();
                    const playerRect = player.getBoundingClientRect();
                    const wrapperRect = wrapper.getBoundingClientRect();

                    let leftPos = wrapperRect.right;
                    // Minor correction if right bound goes missing
                    if (leftPos <= 0 || !leftPos) leftPos = drawer.hasAttribute('opened') ? 240 : 72;

                    self.dividerEl.style.top = navRect.bottom + 'px';
                    self.dividerEl.style.height = (playerRect.top - navRect.bottom) + 'px';
                    self.dividerEl.style.left = leftPos + 'px';
                    self.dividerEl.classList.add('active');
                }

                self._trackerId = requestAnimationFrame(track);
            }

            this._trackerId = requestAnimationFrame(track);
        },

        // Legacy aliases for compatibility
        setup() { this.show(); },
        cleanup() { this.hide(); },

        _updateArt() {
            const url = this._getArtUrl();
            if (url && url !== this._lastSrc) {
                this._lastSrc = url;
                if (this.glowEl) {
                    this.glowEl.style.backgroundImage = `url("${url}")`;
                }
            }
        },

        _startPoll() {
            if (this._pollId) clearInterval(this._pollId);
            const self = this;
            this._pollId = setInterval(() => {
                if (!self.active) { clearInterval(self._pollId); self._pollId = null; return; }
                if (!window.location.href.includes('/watch')) {
                    self.hide();
                    return;
                }
                self._updateArt();
            }, 2000);
        },

        _onPlay: function () {
            if (!window.location.href.includes('/watch')) return;
            const g = document.getElementById('ytm-ambient-glow');
            if (g) {
                g.classList.add('active');
                document.body.classList.add('ytm-ambient-active');
            }
            ytmAmbientMode._updateArt();
        },
    };

    // Persistent ambient watcher — fast URL monitoring for smooth transitions
    if (isYTMusic) {
        let _ambientWatcherId = null;
        function startAmbientWatcher() {
            if (_ambientWatcherId) return;
            _ambientWatcherId = setInterval(() => {
                if (document.visibilityState !== 'visible') return;
                const s = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                const onWatch = window.location.href.includes('/watch');
                if (!s.cinematicLighting) {
                    if (ytmAmbientMode.active) ytmAmbientMode.hide();
                    return;
                }
                if (onWatch && !ytmAmbientMode.active) {
                    ytmAmbientMode.show();
                } else if (!onWatch && ytmAmbientMode.active) {
                    ytmAmbientMode.hide();
                }
            }, 1500); // Reduced frequency from 800ms to 1500ms
        }
        setTimeout(startAmbientWatcher, 1500);

        // Also respond to YTM-specific events immediately
        document.addEventListener('yt-page-data-updated', () => {
            const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
            if (!settings.cinematicLighting) return;
            if (window.location.href.includes('/watch')) {
                if (!ytmAmbientMode.active) ytmAmbientMode.show();
                else ytmAmbientMode._updateArt(); // might be a new song
            } else if (ytmAmbientMode.active) {
                ytmAmbientMode.hide();
            }
        });
    }

    // Cinematic Lighting Control Functions
