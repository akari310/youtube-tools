import { isYTMusic } from './dom.js';
import {
  readJsonGM,
  writeJsonGM,
  STORAGE_KEYS_MDCM,
  UPDATE_META_URL,
  VERSION_CHECK_INTERVAL_MS,
} from './storage.js';

// Notification helper
export function Notify(type = 'info', message = '', title = '') {
  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    warning: 'Warning',
  };

  if (isYTMusic || (window.trustedTypes && window.trustedTypes.defaultPolicy === null)) {
    // Avoid iziToast due to innerHTML TrustedTypes violation on strict environments
    let toast = document.getElementById('yt-tools-custom-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'yt-tools-custom-toast';
      toast.style.cssText =
        'position:fixed;bottom:20px;left:20px;background:rgba(30,30,30,0.9);color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);border-left:4px solid #ff0000;transition:opacity 0.3s;opacity:0;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = (title || defaultTitles[type] || 'Notification') + ': ' + message;
    if (type === 'success') toast.style.borderLeftColor = '#22c55e';
    else if (type === 'error') toast.style.borderLeftColor = '#ef4444';
    else if (type === 'warning') toast.style.borderLeftColor = '#f59e0b';
    else toast.style.borderLeftColor = '#3b82f6';

    toast.style.opacity = '1';
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 3000);
    return;
  }

  // Use iziToast for normal environments
  if (typeof iziToast !== 'undefined') {
    iziToast[type]({
      title: title || defaultTitles[type],
      message: message,
      position: 'bottomLeft',
    });
  }
}

// Get video ID from URL
export function paramsVideoURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

export function getCurrentVideoId() {
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

// Format number
export function FormatterNumber(num, digits) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: ' K' },
    { value: 1e6, symbol: ' M' },
  ];
  const rx = /\.0+$|\(\.[0-9]*[1-9]\)0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(item => num >= item.value);
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

// Format time helper
export function formatTimeShort(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    : `${m}:${String(r).padStart(2, '0')}`;
}

// Version comparison
export function isVersionNewer(latestStr, currentStr) {
  if (!latestStr || !currentStr) return false;
  const parse = s =>
    String(s)
      .trim()
      .split('.')
      .map(n => parseInt(n, 10) || 0);
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

// Check for updates
export async function checkNewVersion() {
  try {
    const last = GM_getValue(STORAGE_KEYS_MDCM.VERSION_CHECK_LAST, 0);
    if (Date.now() - last < VERSION_CHECK_INTERVAL_MS) return;
    GM_setValue(STORAGE_KEYS_MDCM.VERSION_CHECK_LAST, Date.now());

    const res = await fetch(UPDATE_META_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const text = await res.text();
    const m = text.match(/@version\s+\([\d.]+\)/);
    if (!m) return;
    const latestVer = m[1].trim();
    const currentVer =
      typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version
        ? String(GM_info.script.version).trim()
        : '';
    if (!currentVer || !isVersionNewer(latestVer, currentVer)) return;

    const updateUrl =
      'https://update.greasyfork.org/scripts/460680/Youtube%20Tools%20All%20in%20one%20local%20download%20mp3%20mp4%20HIGT%20QUALITY%20return%20dislikes%20and%20more.user.js';
    if (typeof iziToast !== 'undefined') {
      iziToast.show({
        title: 'New Update',
        message: 'A new version YoutubeTools is available.',
        buttons: [
          [
            '<button>View Now</button>',
            function (instance, toast) {
              window.open(updateUrl, '_blank');
              instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
            },
            true,
          ],
        ],
      });
    }
  } catch (e) {
    console.warn('[YT Tools] Version check error:', e);
  }
}
