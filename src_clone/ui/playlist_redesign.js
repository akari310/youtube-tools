
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
                    background: rgba(15, 15, 15, 0.7) !important;
                    backdrop-filter: blur(25px) saturate(160%) !important;
                    -webkit-backdrop-filter: blur(25px) saturate(160%) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                }
                ytd-playlist-panel-renderer.yt-playlist-style-liquid {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)) !important;
                    backdrop-filter: blur(40px) brightness(1.1) !important;
                    -webkit-backdrop-filter: blur(40px) brightness(1.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
                    border-radius: 16px !important;
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
