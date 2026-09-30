
    // ---------------------------------------------------------
    // Playlist Redesign Module (YouTube Main)
    // Adds Glassmorphism / Liquid styles to the playlist panel
    // ---------------------------------------------------------
    function applyPlaylistRedesign() {
        if (isYTMusic) return;
        const rawSettings = GM_getValue('ytSettingsMDCM', '{}');
        let settings = {};
        try { settings = JSON.parse(rawSettings); } catch(e) {}
        const style = settings.playlistStyle || 'blur';
        
        const panel = document.querySelector('ytd-playlist-panel-renderer');
        if (!panel) return;

        panel.classList.remove('yt-playlist-style-blur', 'yt-playlist-style-liquid', 'yt-playlist-style-transparent');
        panel.classList.add(`yt-playlist-style-${style}`);

        if (!document.getElementById('yt-playlist-redesign-css')) {
            const css = `
                ytd-playlist-panel-renderer.yt-playlist-style-blur {
                    background: rgba(255, 255, 255, 0.08) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 12px !important;
                    --yt-lightsource-section2-color: transparent !important;
                    --yt-lightsource-section4-color: transparent !important;
                    --yt-lightsource-primary-title-color: #fff !important;
                    --yt-lightsource-secondary-title-color: rgba(255,255,255,0.7) !important;
                }
                ytd-playlist-panel-renderer.yt-playlist-style-liquid {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)) !important;
                    backdrop-filter: blur(40px) saturate(180%) brightness(1.1) !important;
                    -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(1.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-top-color: rgba(255, 255, 255, 0.25) !important;
                    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
                    border-radius: 16px !important;
                    --yt-lightsource-section2-color: transparent !important;
                    --yt-lightsource-section4-color: transparent !important;
                    --yt-lightsource-primary-title-color: #fff !important;
                    --yt-lightsource-secondary-title-color: rgba(255,255,255,0.7) !important;
                }
                ytd-playlist-panel-renderer.yt-playlist-style-transparent {
                    background: transparent !important;
                    border: none !important;
                }
                ytd-playlist-panel-renderer[class*="yt-playlist-style-"] #container,
                ytd-playlist-panel-renderer[class*="yt-playlist-style-"] #items-container {
                    background: transparent !important;
                }
            `;
            const styleEl = document.createElement('style');
            styleEl.id = 'yt-playlist-redesign-css';
            styleEl.textContent = css;
            document.head.appendChild(styleEl);
        }
    }
