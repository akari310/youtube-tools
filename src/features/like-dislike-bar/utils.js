import { $e } from '../../utils/dom.js';

export function parseCountText(text) {
  if (!text) return null;
  const s0 = String(text).trim().toLowerCase();
  if (!s0) return null;
  let mult = 1;
  let s = s0.replace(/\s+/g, '');

  const urlParams = new URLSearchParams(location.search);
  const hl = urlParams.get('hl') || '';

  if (s.includes('mil')) {
    mult = 1000;
    s = s.replace('mil', '');
  } else if (
    s.includes('nghìn') ||
    s.includes('nghin') ||
    s.includes('ngàn') ||
    s.includes('ngan')
  ) {
    mult = 1000;
    s = s.replace(/nghìn|nghin|ngàn|ngan/g, '');
  } else if (/[\d.,]n$/i.test(s)) {
    mult = 1000;
    s = s.replace(/n$/i, '');
  } else if (s.includes('triệu') || s.includes('trieu')) {
    mult = 1000000;
    s = s.replace(/triệu|trieu/g, '');
  } else if (/[\d.,]tr$/i.test(s)) {
    mult = 1000000;
    s = s.replace(/tr$/i, '');
  } else if (s.includes('k')) {
    mult = 1000;
    s = s.replace('k', '');
  } else if (s.includes('m')) {
    mult = 1000000;
    s = s.replace('m', '');
  }
  s = s.replace(/[^\d.,]/g, '');
  if (!s) return null;

  const dotThousandsLocales = [
    'de', 'es', 'pt', 'id', 'tr', 'nl', 'it', 'pl', 'cs', 'da', 'fi', 'nb', 'sv',
    'el', 'hu', 'ro', 'sk', 'sl', 'hr', 'bg', 'uk', 'ru', 'ar', 'vi',
  ];
  const isDotThousandsLocale = dotThousandsLocales.some(l => hl.startsWith(l));

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let nStr = s;
  if (lastDot !== -1 && lastComma !== -1) {
    const dec = Math.max(lastDot, lastComma);
    const intPart = s.slice(0, dec).replace(/[.,]/g, '');
    const decPart = s.slice(dec + 1);
    nStr = `${intPart}.${decPart}`;
  } else if (lastComma !== -1) {
    const afterComma = s.slice(lastComma + 1);
    if (isDotThousandsLocale) {
      nStr = s.replace(',', '.');
    } else if (afterComma.length === 3 && s.indexOf(',') === lastComma) {
      nStr = s.replace(',', '');
    } else {
      nStr = s.replace(',', '.');
    }
  } else if (lastDot !== -1) {
    const afterDot = s.slice(lastDot + 1);
    const dotCount = (s.match(/\./g) || []).length;
    if (dotCount > 1) {
      nStr = s.replace(/\./g, '');
    } else if (isDotThousandsLocale && afterDot.length === 3) {
      nStr = s.replace('.', '');
    } else if (afterDot.length === 3 && mult > 1) {
      nStr = s.replace('.', '');
    }
  }
  const num = Number.parseFloat(nStr);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * mult);
}

export function getLikesFromDom() {
  const likeBtn =
    $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
    $e('like-button-view-model button') ||
    $e('button[aria-label*="like" i]') ||
    $e('ytd-menu-renderer like-button-view-model button');
  if (!likeBtn) return null;

  const btnText = likeBtn.textContent;
  if (btnText) {
    const parsed = parseCountText(btnText);
    if (parsed != null) return parsed;
  }

  const aria = likeBtn.getAttribute('aria-label') || '';
  const m = aria.match(/([\d.,]+)/);
  if (m) {
    const parsed = parseCountText(m[1]);
    if (parsed != null) return parsed;
  }
  return null;
}
