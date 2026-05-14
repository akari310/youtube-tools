// ===========================================
// Page Background Manager
// Handles custom background images with blur overlays
// ===========================================
import { $id } from '../utils/dom.js';
import { isYTMusic } from '../utils/dom.js';

/**
 * Apply custom page background with blur effect and theme overlay
 * @param {string} url - Background image URL
 * @param {string|null} themeColor - Theme overlay color (optional)
 */
export function applyPageBackground(url, themeColor = null) {
  const selector = isYTMusic ? 'body, ytmusic-app' : 'ytd-app, body';
  const styleId = 'yt-tools-page-background';
  
  let styleEl = $id(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  if (url) {
    const overlayColor = themeColor || 'rgba(0,0,0,0.5)';
    
    styleEl.textContent = `
${selector} {
  background: transparent !important;
  background-color: transparent !important;
}

/* Layer 1: Blurred Background Image */
body::before {
  content: "" !important;
  position: fixed !important;
  top: -10px !important;
  left: -10px !important;
  width: calc(100% + 20px) !important;
  height: calc(100% + 20px) !important;
  background-image: url("${url}") !important;
  background-size: cover !important;
  background-position: center !important;
  background-attachment: fixed !important;
  background-repeat: no-repeat !important;
  filter: blur(8px) brightness(0.8) !important;
  z-index: -3 !important;
  pointer-events: none !important;
}

/* Layer 2: Theme Overlay (Semi-transparent) */
body::after {
  content: "" !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: ${themeColor ? themeColor : 'rgba(0,0,0,0.5)'} !important;
  opacity: ${themeColor ? '0.6' : '1'} !important;
  z-index: -2 !important;
  pointer-events: none !important;
}

${isYTMusic ? `
/* YTM: Elevate content above blur layers */
ytmusic-app {
  position: relative !important;
  z-index: 3 !important;
}
` : ''}

#content.ytmusic-app,
#page-manager.ytd-app,
#columns.ytd-watch-flexy,
ytd-browse,
ytmusic-browse-response,
ytmusic-section-list-renderer,
ytmusic-shelf-renderer,
ytmusic-grid-renderer,
ytmusic-player-page,
ytmusic-app-layout,
ytmusic-guide-renderer,
tp-yt-app-drawer,
tp-yt-app-drawer #contentContainer,
tp-yt-app-drawer #contentContainer.tp-yt-app-drawer,
#mini-guide,
#mini-guide-renderer,
#guide-wrapper,
#guide-content,
#guide-spacer,
#guide-renderer,
#sections.ytmusic-guide-renderer,
ytmusic-guide-section-renderer,
ytmusic-guide-entry-renderer,
tp-yt-paper-item.ytmusic-guide-entry-renderer,
#items.ytmusic-guide-section-renderer,
#divider.ytmusic-guide-section-renderer,
ytmusic-app-layout.content-scrolled,
ytmusic-app-layout #background,
ytmusic-app-layout #guide-background,
ytmusic-app-layout #player-bar-background,
ytmusic-app-layout #nav-bar-background,
#contents.ytmusic-section-list-renderer,
#header.ytmusic-browse-response,
#guide-wrapper.ytmusic-guide-renderer,
ytmusic-responsive-header-renderer,
.background-gradient.ytmusic-browse-response,
#content-wrapper.ytmusic-browse-response,
ytmusic-carousel-shelf-renderer,
.ytmusic-shelf,
ytmusic-chip-cloud-renderer,
ytmusic-carousel-shelf-basic-header-renderer,
ytmusic-header-renderer,
ytmusic-tabbed-browse-renderer,
ytmusic-detail-header-renderer,
ytmusic-item-section-renderer,
ytmusic-immersive-header-renderer,
ytmusic-card-shelf-renderer {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  --ytmusic-background: transparent !important;
  --ytmusic-general-background: transparent !important;
  --ytmusic-guide-background: transparent !important;
  --iron-drawer-background-color: transparent !important;
  --yt-spec-general-background-a: transparent !important;
  --yt-spec-general-background-b: transparent !important;
  --yt-spec-general-background-c: transparent !important;
  --yt-spec-menu-background: transparent !important;
}

${isYTMusic ? `
/* YTM Nav Bar: transparent at top, dark blurred when scrolled */
body.ytm-style-transparent #nav-bar-background.ytmusic-app-layout,
body.ytm-ambient-active #nav-bar-background.ytmusic-app-layout {
  background: transparent !important;
  transition: background 0.3s ease, backdrop-filter 0.3s ease !important;
}

body.ytm-style-transparent ytmusic-nav-bar,
body.ytm-ambient-active ytmusic-nav-bar,
body.ytm-style-transparent #nav-bar-divider,
body.ytm-ambient-active #nav-bar-divider {
  background: transparent !important;
  border: none !important;
  transition: background 0.3s ease !important;
}

body.ytm-style-transparent ytmusic-nav-bar.scrolled,
body.ytm-ambient-active ytmusic-nav-bar.scrolled,
body.ytm-style-transparent #nav-bar-background.scrolled,
body.ytm-ambient-active #nav-bar-background.scrolled,
body.ytm-style-transparent ytmusic-nav-bar[opened],
body.ytm-ambient-active ytmusic-nav-bar[opened],
body.ytm-style-transparent[player-page-open] ytmusic-nav-bar,
body.ytm-ambient-active[player-page-open] ytmusic-nav-bar,
body.ytm-style-transparent[player-page-open] #nav-bar-background,
body.ytm-ambient-active[player-page-open] #nav-bar-background {
  background: rgba(10, 10, 10, 0.4) !important;
  backdrop-filter: blur(25px) !important;
  -webkit-backdrop-filter: blur(25px) !important;
}

body.ytm-ambient-active[player-page-open] ytmusic-nav-bar,
body.ytm-ambient-active[player-page-open] #nav-bar-background {
  background: transparent !important;
}

/* YTM Player Bar: semi-transparent with blur - respect ambient */
body.ytm-style-transparent ytmusic-player-bar,
body.ytm-ambient-active ytmusic-player-bar {
  background: rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(30px) !important;
  -webkit-backdrop-filter: blur(30px) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

body.ytm-ambient-active ytmusic-player-bar {
  background: transparent !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* YTM Sidebar (Expanded & Collapsed): Glass with separator line - respect ambient */
body.ytm-style-transparent tp-yt-app-drawer #contentContainer,
body.ytm-style-transparent #mini-guide,
body.ytm-style-transparent #mini-guide-renderer,
body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
body.ytm-ambient-active #mini-guide,
body.ytm-ambient-active #mini-guide-renderer {
  background: rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(25px) !important;
  -webkit-backdrop-filter: blur(25px) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
body.ytm-ambient-active #mini-guide,
body.ytm-ambient-active #mini-guide-renderer {
  background: transparent !important;
}

/* Standardized YTM Glass Buttons (Edit, Menu, Play, etc.) */
body.ytm-style-transparent button.ytSpecButtonShapeNextHost,
body.ytm-style-transparent yt-button-shape button,
body.ytm-style-transparent .history-button #button,
body.ytm-ambient-active button.ytSpecButtonShapeNextHost,
body.ytm-ambient-active yt-button-shape button,
body.ytm-ambient-active .history-button #button {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  color: #fff !important;
}

/* Clean Guide Button */
yt-icon-button#guide-button,
yt-icon-button#guide-button *,
#guide-button,
#guide-button #button,
#guide-button #interaction,
#guide-button yt-icon,
#guide-button .yt-interaction,
#guide-button .stroke.yt-interaction,
#guide-button .fill.yt-interaction {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
  --yt-spec-touch-response: transparent !important;
  --yt-spec-touch-response-inverse: transparent !important;
  --yt-sys-color-baseline--touch-response-inverse: transparent !important;
}

/* Play button specific fixes */
ytmusic-play-button-renderer {
  background: transparent !important;
  --ytmusic-play-button-background-color: transparent !important;
  --ytmusic-play-button-active-background-color: rgba(255, 255, 255, 0.25) !important;
}

ytmusic-play-button-renderer .content-wrapper {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  border-radius: 50% !important;
  box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
}

ytmusic-play-button-renderer:hover .content-wrapper {
  background: rgba(255, 255, 255, 0.3) !important;
}

ytmusic-play-button-renderer yt-icon,
ytmusic-play-button-renderer #icon,
ytmusic-play-button-renderer .icon,
ytmusic-play-button-renderer .icon.ytmusic-play-button-renderer,
ytmusic-play-button-renderer yt-icon.ytmusic-play-button-renderer {
  background: transparent !important;
  background-color: transparent !important;
  color: #fff !important;
  --ytmusic-play-button-icon-color: #fff !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Ensure SVGs inside are visible */
ytmusic-play-button-renderer svg {
  fill: #fff !important;
}
` : ''}

/* Engagement panels: Solid on regular YT, but NOT on Shorts */
ytd-watch-flexy ytd-engagement-panel-section-list-renderer,
ytd-watch-flexy ytd-engagement-panel-section-list-renderer #content,
ytd-watch-flexy ytd-engagement-panel-section-list-renderer #header,
ytd-watch-flexy ytd-engagement-panel-title-header-renderer,
ytd-watch-flexy ytd-engagement-panel-title-header-renderer #header,
ytd-watch-flexy ytd-section-list-renderer[engagement-panel] {
  background: #212121 !important;
  background-color: #212121 !important;
}

/* Nuclear transparency for Shorts engagement panels to reveal theme background */
ytd-shorts #shorts-panel-container,
ytd-shorts #anchored-panel,
ytd-shorts ytd-engagement-panel-section-list-renderer,
ytd-shorts ytd-engagement-panel-section-list-renderer #content,
ytd-shorts ytd-engagement-panel-section-list-renderer #header,
/* Highly specific YouTube selectors identified during debugging */
ytd-shorts ytd-engagement-panel-section-list-renderer[match-content-theme] #content,
ytd-shorts ytd-engagement-panel-section-list-renderer[match-content-theme] #content.ytd-engagement-panel-section-list-renderer,
ytd-shorts ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] #content,
ytd-shorts ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] #header,
ytd-shorts ytd-engagement-panel-title-header-renderer,
ytd-shorts ytd-engagement-panel-title-header-renderer #header,
ytd-shorts ytd-comments-header-renderer,
ytd-shorts ytd-comment-thread-renderer,
ytd-shorts ytd-comment-view-model,
ytd-shorts ytd-item-section-renderer,
ytd-shorts #sections.ytd-item-section-renderer,
ytd-shorts #contents.ytd-item-section-renderer,
ytd-shorts ytd-comment-simplebox-renderer {
  background: transparent !important;
  background-color: transparent !important;
}

/* Search button - restore default YT gray */
ytd-searchbox #search-icon-legacy,
button.ytSearchboxComponentSearchButton,
button.ytSearchboxComponentSearchButtonDark {
  background-color: #222222 !important;
  border: none !important;
}

/* Voice search button - add blur backdrop for visibility */
#voice-search-button .ytSpecButtonShapeNextHost,
#voice-search-button button {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 50% !important;
}

/* Hide YTM native background elements when custom background is set */
body:not(.ytm-ambient-active) #mini-guide-background,
ytmusic-browse-response #background.immersive-background,
ytmusic-fullbleed-thumbnail-renderer[is-background],
ytmusic-player-page #background.immersive-background,
#background.ytmusic-browse-response {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* Hide Shorts cinematic black blocks */
#cinematic-container.ytd-reel-video-renderer,
#shorts-cinematic-container,
#cinematic-shorts-scrim.ytd-shorts {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

/* Remove dark gradient overlays from Shorts */
.overlay.ytd-reel-video-renderer,
ytd-reel-player-overlay-renderer,
ytd-reel-player-overlay-renderer #overlay,
.overlay-container.ytd-reel-player-overlay-renderer {
  background: transparent !important;
  background-image: none !important;
}
`;
  } else {
    // Remove background
    styleEl.textContent = '';
  }
}

/**
 * Remove custom page background
 */
export function removePageBackground() {
  const styleId = 'yt-tools-page-background';
  const styleEl = $id(styleId);
  if (styleEl) {
    styleEl.textContent = '';
  }
}
