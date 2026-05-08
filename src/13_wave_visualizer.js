          </button>
        </div>
      `;

    containerDescription.insertAdjacentHTML('beforebegin', safeHTML(buttomHTML));

    $id('copy-description').addEventListener('click', () => {
      const ldJson = [...$m('script[type="application/ld+json"]')];
      for (let script of ldJson) {
        try {
          const data = JSON.parse(script.innerText);
          if (data['@type'] === 'VideoObject') {
            const description =
              `📅 Date published: ${data.uploadDate || 'No disponible'}\n` +
              `Author: ${data.author || 'No disponible'}\n` +
              `🎬 Name video: ${data.name || 'No disponible'}\n` +
              `🖼️ Thumbnail: ${Array.isArray(data.thumbnailUrl) ? data.thumbnailUrl.join(', ') : data.thumbnailUrl || 'No disponible'}\n` +
              `📝 Description: ${data.description || 'No disponible'}\n\n\n` +
              `🎭 Category: ${data.genre || 'No disponible'}\n`;

            navigator.clipboard.writeText(description);
            Notify('success', 'Description copied');
          }
        } catch (e) {
          Notify('error', 'Error parsing JSON-LD');
        }
      }
    });
  }

  downloadDescriptionVideo();


  // Biến cờ phải nằm ngoài hàm để không bị reset
  let translatorEventBound = false;

  function traductor() {
    // Chỉ quét những comment chưa có nút dịch (dùng thuộc tính data-translated)
    const texts = document.querySelectorAll('#content-text:not([data-translated])');
    if (texts.length === 0) return;

    const languages = languagesTranslate;
    const idiomaDestino = $id('select-languages-comments-select').value;

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
  if (!isYTMusic) {
    let _commentIO = null;
    let _commentMO = null;
    function initSmartCommentObserver() {
      const commentsContainer = document.querySelector('#comments');
      if (!commentsContainer) return;

      // Disconnect previous observers to avoid duplicates
      if (_commentIO) { try { _commentIO.disconnect(); } catch(e){} _commentIO = null; }
      if (_commentMO) { try { _commentMO.disconnect(); } catch(e){} _commentMO = null; }

      _commentIO = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {

          _commentMO = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (let m of mutations) {
              if (m.addedNodes.length > 0) {
                shouldUpdate = true;
                break;
              }
            }

            if (shouldUpdate) {
              window.requestAnimationFrame(() => {
                if (settings.avatars) agregarBotonesDescarga();
                if (settings.translation) traductor();
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

    if (!window.__ytToolsCommentNavBound) {
      window.__ytToolsCommentNavBound = true;
      document.addEventListener('yt-navigate-finish', () => {
        setTimeout(initSmartCommentObserver, 1500);
      });
    }

    initSmartCommentObserver();
  } // end if (!isYTMusic)
  // === KẾT THÚC CODE TỐI ƯU ===


  // Shorts DOM observer (YT only) – guarded via __ytToolsRuntime.shortsObserver
  if (!isYTMusic) {
    const contentScrollable = $e('.anchored-panel.style-scope.ytd-shorts #contents.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer');
    if (contentScrollable) {
