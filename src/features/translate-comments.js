import { $id, $m } from '../utils/dom.js';
import { safeHTML } from '../utils/trusted-types.js';
import { apiGoogleTranslate } from '../config/constants.js';

// ------------------------------
// Feature: Translate Comments
// ------------------------------

const languagesTranslate = {
  vi: 'Vietnamese',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  ko: 'Korean',
  'zh-CN': 'Chinese (Simplified)',
};

let translatorEventBound = false;
let commentObserver = null;
// Fallback interval for edge cases where MutationObserver misses updates
const FALLBACK_INTERVAL_MS = 8000;
let fallbackInterval = null;

let translatorTarget = 'en';

export function traductor() {
  const texts = document.querySelectorAll('#content-text:not([data-translated])');
  if (texts.length === 0) return;

  const languages = languagesTranslate;
  const idiomaDestino = translatorTarget;

  const optionsHTML = Object.entries(languages)
    .map(
      ([code, name]) =>
        `<option value="${code}" ${code === idiomaDestino ? 'selected' : ''}>${name}</option>`
    )
    .join('');

  texts.forEach(texto => {
    texto.setAttribute('data-translated', 'true');
    const controlsHTML = `
    <div class="traductor-container" style="margin-top: 5px; margin-bottom: 5px; display: flex; gap: 8px; align-items: center;">
      <button class="buttons-tranlate yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-s" data-action="translate-comment" style="padding: 0 10px; height: 24px; font-size: 12px; border-radius: 12px; cursor: pointer; border: none;">
        Translate
      </button>
      <select class="select-traductor" style="background: transparent; color: inherit; border: 1px solid rgba(150,150,150,0.3); border-radius: 4px; padding: 2px 4px; font-size: 12px; outline: none;">
      ${optionsHTML}
      </select>
    </div>
    `;
    texto.insertAdjacentHTML('afterend', safeHTML(controlsHTML));
  });

  if (!translatorEventBound) {
    translatorEventBound = true;
    document.addEventListener('click', e => {
      const btn = e.target.closest('.buttons-tranlate[data-action="translate-comment"]');
      if (!btn) return;

      const container = btn.closest('.traductor-container');
      const selectLang = container?.querySelector('.select-traductor');
      const textNode = container?.previousElementSibling;

      if (!textNode || !selectLang) return;

      const urlLista =
        `?client=dict-chrome-ex&sl=auto&tl=${selectLang.value}&q=` +
        encodeURIComponent(textNode.textContent);

      btn.innerHTML = safeHTML('Translating...');

      fetch(apiGoogleTranslate + urlLista)
        .then(response => response.json())
        .then(datos => {
          if (datos && datos[0] && datos[0][0]) {
            textNode.textContent = datos[0][0][0] || datos[0][0];
            btn.textContent = 'Translated';
          }
        })
        .catch(() => {
          btn.textContent = 'Error';
        });
    });
  }
}

export function initTranslateComments(settings) {
  if (settings?.languagesComments) translatorTarget = settings.languagesComments;
  if (settings?.translateTarget) translatorTarget = settings.translateTarget;
  if (commentObserver) {
    commentObserver.disconnect();
    commentObserver = null;
  }
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }

  if (!settings?.translateComments) return;

  // Run once immediately for any existing comments
  traductor();

  // Use MutationObserver to watch for new comments instead of polling
  const observeTarget =
    document.querySelector('#comments') ||
    document.querySelector('ytd-comments') ||
    document.querySelector('#content') ||
    document.body;

  let debounceT = null;
  commentObserver = new MutationObserver(() => {
    // Debounce: batch rapid DOM mutations into a single traductor() call
    if (debounceT) return;
    debounceT = setTimeout(() => {
      debounceT = null;
      traductor();
    }, 500);
  });

  commentObserver.observe(observeTarget, {
    childList: true,
    subtree: true,
  });

  // Fallback interval (less frequent) for cases MutationObserver might miss
  // e.g., lazy-loaded comments that don't trigger childList mutations
  fallbackInterval = setInterval(traductor, FALLBACK_INTERVAL_MS);
}
