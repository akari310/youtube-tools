// DOM Selectors
export const $e = el => document.querySelector(el);
export const $id = el => document.getElementById(el);
export const $m = el => document.querySelectorAll(el);
export const $cl = el => document.createElement(el);
export const $sp = (el, pty) => document.documentElement.style.setProperty(el, pty);
export const $ap = el => document.body.appendChild(el);

/**
 * Tampermonkey / isolated world: real page `window` so the real `video` element, Web Audio,
 * and player events match the tab the user sees (sandbox `window`/`document` can break `createMediaElementSource`).
 */
export function pageWindow() {
  try {
    if (typeof unsafeWindow !== 'undefined' && unsafeWindow) return unsafeWindow;
  } catch {
    /* ignore */
  }
  return window;
}

export function pageDocument() {
  return pageWindow().document;
}

// Check platform
export const isYTMusic = location.hostname === 'music.youtube.com';
export let validoUrl = document.location.href;

export function updateValidoUrl() {
  validoUrl = document.location.href;
}
