
        function agregarBotonesDescarga(settings) {
            const avatars = $m('#author-thumbnail-button #img.style-scope.yt-img-shadow');

            avatars.forEach((img) => {
                if (img.parentElement.querySelector('.yt-image-avatar-download')) return;

                const button = $cl('button');
                button.innerHTML = safeHTML('<i class="fa fa-download"></i>');
                button.classList.add('yt-image-avatar-download');

                button.onclick = async function () {
                    try {
                        const imageUrl = img.src.split('=')[0];
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);

                        const parentComment = img.closest('ytd-comment-thread-renderer, ytd-comment-renderer');
                        const nameElement = parentComment?.querySelector('#author-text');
                        let authorName = nameElement ? nameElement.textContent.trim() : 'avatar';
                        authorName = authorName.replace(/[\/\\:*?"<>|]/g, '');

                        const link = $cl('a');
                        link.href = blobUrl;
                        link.download = `${authorName}_avatar.jpg` || 'avatar.jpg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); 
                    } catch (error) {
                        console.error('Error al descargar la imagen:', error);
                    }
                };

                img.parentElement.style.position = 'relative';
                img.parentElement.appendChild(button);
            });
        }

        function downloadDescriptionVideo() {
            if (isYTMusic) return; 
            if (!window.location.href.includes('youtube.com/watch')) return;
            if ($e('#button_copy_description')) return;

            const containerDescription = $e('#bottom-row.style-scope.ytd-watch-metadata');
            if (!containerDescription) return;

            const buttomHTML = `
                <div id="button_copy_description" style="display: flex; justify-content: end; align-items: center;margin-top: 10px;" >
                  <button id="copy-description" title="Copy description" class="botones_div" type="button" style="cursor: pointer;">
                    <i style="font-size: 20px;" class="fa-solid fa-copy"></i>
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

        let translatorEventBound = false;
        function traductor() {
            const texts = document.querySelectorAll('#content-text:not([data-translated])');
            if (texts.length === 0) return;

            const languages = languagesTranslate;
            const idiomaDestino = $id('select-languages-comments-select')?.value || 'vi';

            const optionsHTML = Object.entries(languages)
                .map(([code, name]) => `<option value="${code}" ${code === idiomaDestino ? 'selected' : ''}>${name}</option>`)
                .join('');

            texts.forEach((texto) => {
                texto.setAttribute('data-translated', 'true'); 
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

            if (!translatorEventBound) {
                translatorEventBound = true;
                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('.buttons-tranlate[data-action="translate-comment"]');
                    if (!btn) return;

                    const container = btn.closest('.traductor-container');
                    const selectLang = container.querySelector('.select-traductor');
                    const textNode = container.previousElementSibling; 

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
