import { $id, $m } from '../../utils/dom.js';
import { safeHTML } from '../../utils/trusted-types.js';
import { apiGoogleTranslate } from '../../config/constants.js';

// ------------------------------
// Feature: Translate Comments - Optimized Version
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

// Biến cờ phải nằm ngoài hàm để không bị reset
let translatorEventBound = false;

function traductor() {
  // Chỉ quét những comment chưa có nút dịch (dùng thuộc tính data-translated)
  const texts = document.querySelectorAll('#content-text:not([data-translated])');
  if (texts.length === 0) return;

  const languages = languagesTranslate;
  const idiomaDestino = $id('select-languages-comments-select')?.value || 'en';

  // Tạo sẵn HTML cho dropdown ngôn ngữ để dùng chung
  const optionsHTML = Object.entries(languages)
    .map(([code, name]) => `<option value="${code}" ${code === idiomaDestino ? 'selected' : ''}>${name}</option>`)
    .join('');

  // Gắn nút dịch vào các comment mới
  texts.forEach((texto) => {
    texto.setAttribute('data-translated', 'true'); // Đánh dấu là đã gắn nút
    const controlsHTML = `
      <div class="traductor-container">
        <button class="buttons-tranlate" data-action="translate-comment"> Translate <i class="fa-solid fa-language"></i></button>
        <select class="select-traductor">
        ${optionsHTML}
        </select>
      </div>
    `;
    texto.insertAdjacentHTML('afterend', safeHTML(controlsHTML));
  });

  // Áp dụng Event Delegation: Chỉ gắn sự kiện click 1 lần duy nhất lên document
  if (!translatorEventBound) {
    translatorEventBound = true;

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.buttons-tranlate[data-action="translate-comment"]');
      if (!btn) return;

      const container = btn.closest('.traductor-container');
      const selectLang = container.querySelector('.select-traductor');
      const textNode = container.previousElementSibling; // Thẻ #content-text

      if (!textNode || !selectLang) return;

      const urlLista = `?client=dict-chrome-ex&sl=auto&tl=${selectLang.value}&q=` + encodeURIComponent(textNode.textContent);

      btn.innerHTML = safeHTML('Translating... <i class="fa-solid fa-spinner fa-spin"></i>');

      fetch(apiGoogleTranslate + urlLista)
        .then((response) => response.json())
        .then((datos) => {
          textNode.textContent = datos[0][0];
          btn.textContent = 'Translated';
        })
        .catch((err) => {
          console.error('Error en la traducción:', err);
          btn.textContent = 'Error';
        });
    });
  }
}

function limpiarHTML(selector) {
  $m(selector).forEach((button) => button.remove());
}

// === CODE TỐI ƯU MỚI THAY THẾ CHO SCROLL EVENT === (YT only)
let _commentIO = null;
let _commentMO = null;

function initSmartCommentObserver() {
  const commentsContainer = document.querySelector('#comments');
  if (!commentsContainer) return;

  // Disconnect previous observers to avoid duplicates
  if (_commentIO) { try { _commentIO.disconnect(); } catch (e) { } _commentIO = null; }
  if (_commentMO) { try { _commentMO.disconnect(); } catch (e) { } _commentMO = null; }

  _commentIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      _commentMO = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        for (const m of mutations) {
          if (m.addedNodes.length > 0) {
            shouldUpdate = true;
            break;
          }
        }

        if (shouldUpdate) {
          window.requestAnimationFrame(() => {
            traductor();
          });
        }
      });

      const commentContents = document.querySelector('ytd-comments #contents');
      if (commentContents) {
        _commentMO.observe(commentContents, {
          childList: true,
          subtree: true
        });
      }

      _commentIO.disconnect();
    }
  });

  _commentIO.observe(commentsContainer);
}

export function initTranslateComments(settings) {
  if (!settings?.translateComments) return;

  // Initialize smart observer for YouTube only
  if (!window.location.hostname.includes('music.youtube.com')) {
    if (!window.__ytToolsCommentNavBound) {
      window.__ytToolsCommentNavBound = true;
      document.addEventListener('yt-navigate-finish', () => {
        setTimeout(initSmartCommentObserver, 1500);
      });
    }

    initSmartCommentObserver();
  }

  // Run once immediately for any existing comments
  traductor();
}
// === KẾT THÚC CODE TỐI ƯU ===
