// ===========================================
// YouTube Music Ambient Mode
// Extracted from legacy-full.js lines 6100-6420
// ===========================================
import { $e, isYTMusic } from '../utils/dom.js';
import { SETTINGS_KEY } from '../settings/storage-key.js';

export const ytmAmbientMode = {
  active: false,
  _initialized: false,
  glowEl: null,
  styleEl: null,
  dividerEl: null,
  videoEl: null,
  _lastSrc: '',
  _pollId: null,
  _trackerId: null,

  _getArtUrl() {
    try {
      const mp = document.getElementById('movie_player');
      if (mp && typeof mp.getVideoData === 'function') {
        const vData = mp.getVideoData();
        if (vData && vData.video_id) {
          return `https://i.ytimg.com/vi/${vData.video_id}/sddefault.jpg`;
        }
      }
    } catch (e) {
      /* */
    }

    const selectors = [
      '#song-image yt-img-shadow img',
      '#song-image img',
      'ytmusic-player-page #thumbnail img',
      '#player-page .thumbnail img',
      'ytmusic-player-bar .image img',
      'ytmusic-player-bar img',
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

  _ensureInit() {
    if (this._initialized) return;
    this._initialized = true;

    this.glowEl = document.createElement('div');
    this.glowEl.id = 'ytm-ambient-glow';
    document.body.appendChild(this.glowEl);

    this.dividerEl = document.createElement('div');
    this.dividerEl.id = 'ytm-custom-divider';
    document.body.appendChild(this.dividerEl);

    this.styleEl = document.createElement('style');
    this.styleEl.id = 'ytm-ambient-style';
    this.styleEl.textContent = `
      #ytm-ambient-glow {
        position: fixed;
        top: -200px; left: -200px;
        width: calc(100vw + 400px);
        height: calc(100vh + 400px);
        pointer-events: none;
        z-index: 0;
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
      body.ytm-ambient-active ytmusic-browse-response {
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(this.styleEl);
  },

  show() {
    if (!isYTMusic) return;
    if (this.active) return;
    if (!window.location.href.includes('/watch')) return;

    this._ensureInit();
    this.active = true;
    this.videoEl = document.querySelector('video');

    if (this.glowEl) {
      this.glowEl.classList.add('active');
      document.body.classList.add('ytm-ambient-active');
    }

    this._updateArt();
    this._startPoll();
    this._startTracker();

    if (this.videoEl) {
      this.videoEl.removeEventListener('play', this._onPlay);
      this.videoEl.addEventListener('play', this._onPlay);
    }
  },

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

  destroy() {
    this.hide();
    this._lastSrc = '';
    this._initialized = false;
    if (this.glowEl?.parentNode) this.glowEl.parentNode.removeChild(this.glowEl);
    this.glowEl = null;
    if (this.dividerEl?.parentNode) this.dividerEl.parentNode.removeChild(this.dividerEl);
    this.dividerEl = null;
    if (this.styleEl?.parentNode) this.styleEl.parentNode.removeChild(this.styleEl);
    this.styleEl = null;
  },

  _startTracker() {
    if (this._trackerId) cancelAnimationFrame(this._trackerId);
    const self = this;
    let lastTop = 0,
      lastHeight = 0,
      lastLeft = 0;
    function track() {
      if (!self.active) {
        self._trackerId = null;
        return;
      }
      const nav = document.querySelector('ytmusic-nav-bar');
      const player = document.querySelector('ytmusic-player-bar');
      const drawer = document.querySelector('tp-yt-app-drawer');
      const wrapper =
        document.querySelector('#guide-wrapper') ||
        document.querySelector('#mini-guide-background');

      if (nav && player && drawer && wrapper && self.dividerEl) {
        const navRect = nav.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        let leftPos = wrapperRect.right;
        if (leftPos <= 0 || !leftPos) leftPos = drawer.hasAttribute('opened') ? 240 : 72;
        const top = navRect.bottom;
        const height = playerRect.top - navRect.bottom;
        // Only update DOM if values actually changed
        if (top !== lastTop || height !== lastHeight || leftPos !== lastLeft) {
          lastTop = top;
          lastHeight = height;
          lastLeft = leftPos;
          self.dividerEl.style.top = top + 'px';
          self.dividerEl.style.height = height + 'px';
          self.dividerEl.style.left = leftPos + 'px';
          self.dividerEl.classList.add('active');
        }
      }
      self._trackerId = requestAnimationFrame(track);
    }
    this._trackerId = requestAnimationFrame(track);
  },

  // Legacy aliases
  setup() {
    this.show();
  },
  cleanup() {
    this.hide();
  },

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
      if (!self.active) {
        clearInterval(self._pollId);
        self._pollId = null;
        return;
      }
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

/**
 * Start the ambient mode watcher for YTM.
 * Polls URL changes to show/hide ambient glow.
 */
export function startAmbientWatcher() {
  if (!isYTMusic) return;

  let _ambientWatcherId = null;
  function start() {
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
    }, 1500);
  }
  setTimeout(start, 1500);

  // Also respond to YTM-specific events immediately
  document.addEventListener('yt-page-data-updated', () => {
    const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
    if (!settings.cinematicLighting) return;
    if (window.location.href.includes('/watch')) {
      if (!ytmAmbientMode.active) ytmAmbientMode.show();
      else ytmAmbientMode._updateArt();
    } else if (ytmAmbientMode.active) {
      ytmAmbientMode.hide();
    }
  });
}
