// ===========================================
// Toolbar (buttons below video / YTM side panel)
// Extracted from legacy-full.js lines 8226-8600
// ===========================================
import { $e, $id, $cl, isYTMusic } from '../../utils/dom.js';
import { Notify } from '../../utils/helpers.js';
import { createSvgIcon, makeToolBtn } from './svg.js';
import { buildDownloadContainer } from './download-container.js';

let validoBotones = true;

/**
 * Reset the toolbar injection flag.
 * Called on SPA navigation so toolbar re-injects.
 */
export function resetToolbarFlag() {
  validoBotones = true;
}

/**
 * Build the toolbar using pure DOM API (bypasses Trusted Types).
 * Works for both YT and YTM.
 */
export function buildToolbar() {
  const main = document.createElement('main');
  main.className = 'yt-tools-container';

  const container = document.createElement('div');
  container.className = 'yt-tools-inner-container';

  const form = document.createElement('form');
  form.className = 'yt-tools-form';
  const btnsDiv = document.createElement('div');
  btnsDiv.className = 'containerButtons';

  // Thumbnail (Image download)
  btnsDiv.appendChild(
    makeToolBtn('Image video', 'imagen', '', [
      'M0 0h24v24H0z',
      'M15 8h.01',
      'M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5',
      'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4',
      'M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559',
      'M19 16v6',
      'M22 19l-3 3l-3 -3',
    ])
  );

  // Repeat
  if (!isYTMusic) {
    btnsDiv.appendChild(
      makeToolBtn('Repeat video', 'repeatvideo', '', [
        'M0 0h24v24H0z',
        'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
        'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3',
      ])
    );
  }

  // Bookmark Add
  if (!isYTMusic) {
    const addBmBtn = makeToolBtn('Add bookmark', 'yt-bookmark-add', '', [
      'M0 0h24v24H0z',
      'M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z',
      'M12 7v6',
      'M9 10h6',
    ]);
    addBmBtn.style.display = 'none';
    btnsDiv.appendChild(addBmBtn);

    // Show Bookmarks
    const toggleBmBtn = makeToolBtn('Show bookmarks', 'yt-bookmark-toggle', '', [
      'M0 0h24v24H0z',
      'M9 6h11',
      'M9 12h11',
      'M9 18h11',
      'M5 6h.01',
      'M5 12h.01',
      'M5 18h.01',
    ]);
    toggleBmBtn.style.display = 'none';
    btnsDiv.appendChild(toggleBmBtn);

    // History (Continue Watching)
    const historyBtn = makeToolBtn('History', 'yt-cw-history-toggle', '', [
      'M0 0h24v24H0z',
      'M12 8v4l3 3',
      'M3 12a9 9 0 1 0 3 -6.7',
      'M3 4v4h4',
    ]);
    historyBtn.style.display = 'none';
    btnsDiv.appendChild(historyBtn);
  }

  // Download MP4
  btnsDiv.appendChild(
    makeToolBtn('MP4', null, 'btn1', [
      'M0 0h24v24H0z',
      'M14 3v4a1 1 0 0 0 1 1h4',
      'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
      'M12 17v-6',
      'M9.5 14.5l2.5 2.5l2.5 -2.5',
    ])
  );

  // Download MP3
  btnsDiv.appendChild(
    makeToolBtn('MP3', null, 'btn2', [
      'M0 0h24v24H0z',
      'M14 3v4a1 1 0 0 0 1 1h4',
      'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
      'M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
      'M12 16l0 -5l2 1',
    ])
  );

  // Hide close toolbar

  // Picture-in-Picture
  btnsDiv.appendChild(
    makeToolBtn('Picture to picture', null, 'video_picture_to_picture', [
      'M0 0h24v24H0z',
      'M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4',
      'M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z',
    ])
  );

  // Screenshot
  btnsDiv.appendChild(
    makeToolBtn('Screenshot video', null, 'screenshot_video', [
      'M0 0h24v24H0z',
      'M15 8h.01',
      'M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644',
      'M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644',
      'M4 8v-2a2 2 0 0 1 2 -2h2',
      'M4 16v2a2 2 0 0 0 2 2h2',
      'M16 4h2a2 2 0 0 1 2 2v2',
      'M16 20h2a2 2 0 0 0 2 -2v-2',
    ])
  );

  form.appendChild(btnsDiv);

  if (!isYTMusic) {
    const bookmarksPanel = document.createElement('div');
    bookmarksPanel.id = 'yt-bookmarks-panel';
    bookmarksPanel.className = 'yt-bookmarks-panel';
    bookmarksPanel.style.display = 'none';
    form.appendChild(bookmarksPanel);

    const historyPanel = document.createElement('div');
    historyPanel.id = 'yt-continue-watching-panel';
    historyPanel.className = 'yt-continue-watching-panel';
    historyPanel.style.display = 'none';
    form.appendChild(historyPanel);
  }

  // Download video quality select
  const videoForm = document.createElement('form');
  videoForm.className = 'formulariodescarga ocultarframe';
  const videoSelectDiv = document.createElement('div');
  videoSelectDiv.className = 'containerall';
  const videoSelect = document.createElement('select');
  videoSelect.className = 'selectcalidades ocultarframe';
  videoSelect.required = true;
  [
    ['', 'Video Quality', true],
    ['144', '144p MP4'],
    ['240', '240p MP4'],
    ['360', '360p MP4'],
    ['480', '480p MP4'],
    ['720', '720p HD MP4 Default'],
    ['1080', '1080p FULL HD MP4'],
    ['1440', '1440p 2K WEBM'],
    ['4k', '2160p 4K WEBM'],
    ['8k', '4320p 8K WEBM'],
  ].forEach(([val, text, dis]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (dis) {
      opt.selected = true;
      opt.disabled = true;
    }
    videoSelect.appendChild(opt);
  });
  videoSelectDiv.appendChild(videoSelect);

  // Download video container
  const dlVideoContainer = buildDownloadContainer('descargando', 'video');
  videoSelectDiv.appendChild(dlVideoContainer);
  videoForm.appendChild(videoSelectDiv);

  // Download audio quality select
  const audioForm = document.createElement('form');
  audioForm.className = 'formulariodescargaaudio ocultarframeaudio';
  const audioSelectDiv = document.createElement('div');
  audioSelectDiv.className = 'containerall';
  const audioSelect = document.createElement('select');
  audioSelect.className = 'selectcalidadesaudio ocultarframeaudio';
  audioSelect.required = true;
  [
    ['', 'Audio Quality', true],
    ['flac', 'Audio FLAC UHQ'],
    ['wav', 'Audio WAV UHQ'],
    ['webm', 'Audio WEBM UHQ'],
    ['mp3', 'Audio MP3 Default'],
    ['m4a', 'Audio M4A'],
    ['aac', 'Audio AAC'],
    ['opus', 'Audio OPUS'],
    ['ogg', 'Audio OGG'],
  ].forEach(([val, text, dis]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (dis) {
      opt.selected = true;
      opt.disabled = true;
    }
    audioSelect.appendChild(opt);
  });
  audioSelectDiv.appendChild(audioSelect);

  // Download audio container
  const dlAudioContainer = buildDownloadContainer('descargandomp3', 'audio');
  audioSelectDiv.appendChild(dlAudioContainer);
  audioForm.appendChild(audioSelectDiv);

  const collapsible = document.createElement('div');
  collapsible.className = 'content_collapsible_colors';
  collapsible.style.marginTop = '2px';
  collapsible.appendChild(videoForm);
  collapsible.appendChild(audioForm);

  container.appendChild(form);
  container.appendChild(collapsible);
  main.appendChild(container);

  // Wire btn1 (MP4) and btn2 (MP3) to toggle forms
  const btn1 = main.querySelector('.btn1');
  const btn2 = main.querySelector('.btn2');
  if (btn1) {
    btn1.addEventListener('click', () => {
      const hidden = videoForm.classList.toggle('ocultarframe');
      audioForm.classList.add('ocultarframeaudio');
    });
  }
  if (btn2) {
    btn2.addEventListener('click', () => {
      const hidden = audioForm.classList.toggle('ocultarframeaudio');
      videoForm.classList.add('ocultarframe');
    });
  }

  // Wire Picture-in-Picture
  const pipBtn = main.querySelector('.video_picture_to_picture');
  if (pipBtn) {
    pipBtn.addEventListener('click', () => {
      const video = document.querySelector('video');
      if (!video) {
        console.warn('[YT Tools] No video element found for PiP');
        return;
      }
      try {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
          video.requestPictureInPicture();
        }
      } catch (e) {
        console.warn('[YT Tools] PiP failed:', e);
      }
    });
  }

  // Wire Image (thumbnail download)
  const imgBtn = main.querySelector('#imagen');
  if (imgBtn) {
    imgBtn.addEventListener('click', () => {
      const searchParams = new URLSearchParams(window.location.search);
      const videoId = searchParams.get('v');
      if (!videoId) {
        console.warn('[YT Tools] No video ID found for thumbnail');
        return;
      }
      const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `${videoId}.jpg`;
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        console.warn('[YT Tools] Thumbnail download failed:', e);
        window.open(url);
      }
    });
  }

  // Wire Repeat video
  const repeatBtn = main.querySelector('#repeatvideo');
  if (repeatBtn) {
    repeatBtn.addEventListener('click', e => {
      e.preventDefault();
      const video = document.querySelector('video');
      if (!video) {
        Notify('warning', 'No video element found');
        return;
      }
      video.loop = !video.loop;
      repeatBtn.style.color = video.loop ? 'var(--yt-spec-static-brand-red, #ff0000)' : '';
      Notify('info', video.loop ? 'Repeat ON' : 'Repeat OFF');
    });
  }

  // Wire Screenshot
  const screenshotBtn = main.querySelector('.screenshot_video');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', () => {
      const video = document.querySelector('video');
      if (!video) {
        console.warn('[YT Tools] No video element found for screenshot');
        return;
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `screenshot-${Date.now()}.png`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }, 'image/png');
      } catch (e) {
        console.warn('[YT Tools] Screenshot failed:', e);
      }
    });
  }

  return main;
}

/**
 * Inject the toolbar into the page.
 * For YTM: above the tab header in the side panel.
 * For YT: above the video metadata.
 */
export function renderizarButtons() {
  // Check if toolbar already exists AND is properly placed in current DOM
  const existing = document.querySelector('.yt-tools-container');
  if (existing) {
    if (isYTMusic) {
      // For YTM: toolbar should be inside #side-panel
      if (existing.closest('#side-panel')) return;
    } else {
      // For YT: toolbar should be a sibling of current .ytd-watch-metadata
      const anchor = document.querySelector('.style-scope.ytd-watch-metadata');
      if (anchor && existing.parentNode === anchor.parentNode) return;
    }
    // Stale toolbar from previous SPA navigation — remove it
    try {
      existing.remove();
    } catch {}
  }

  if (isYTMusic) {
    const sidePanel = document.querySelector('#player-page #side-panel');
    const tabHeaders = sidePanel && sidePanel.querySelector('.tab-header-container');
    const addButton = tabHeaders || document.querySelector('#tab-renderer');

    if (!addButton && validoBotones) {
      if (!renderizarButtons._ytmRetries) renderizarButtons._ytmRetries = 0;
      if (renderizarButtons._ytmRetries < 30) {
        renderizarButtons._ytmRetries++;
        setTimeout(renderizarButtons, 500);
      }
      return;
    }
    renderizarButtons._ytmRetries = 0;

    if (addButton && validoBotones) {
      validoBotones = false;
      const sp = document.querySelector('ytmusic-player-page #side-panel');
      if (sp) {
        let sideWrapper = $id('ytm-side-panel-wrapper');
        if (!sideWrapper) {
          sideWrapper = document.createElement('div');
          sideWrapper.id = 'ytm-side-panel-wrapper';
          sp.insertBefore(sideWrapper, addButton);
        }
        const toolbar = buildToolbar();
        sideWrapper.appendChild(toolbar);
        const line = document.createElement('div');
        setTimeout(() => {
          try {
            window.dispatchEvent(new CustomEvent('yt-tools-toolbar-ready'));
          } catch {}
        }, 0);
        line.className = 'ytm-side-panel-divider';
        sideWrapper.appendChild(line);
        sideWrapper.appendChild(addButton);
      }
    }
  } else {
    // Regular YouTube
    const addButton = document.querySelector('.style-scope .ytd-watch-metadata');
    const addButton2 = document.querySelector('#contents');

    if (!addButton) {
      if (!renderizarButtons._ytRetries) renderizarButtons._ytRetries = 0;
      if (renderizarButtons._ytRetries < 30) {
        renderizarButtons._ytRetries++;
        setTimeout(renderizarButtons, 500);
      }
      return;
    }
    renderizarButtons._ytRetries = 0;

    if (addButton) {
      const isVisible = addButton.offsetParent !== null;
      if (isVisible || addButton2) {
        const toolbar = buildToolbar();
        addButton.parentNode.insertBefore(toolbar, addButton);
        setTimeout(() => {
          try {
            window.dispatchEvent(new CustomEvent('yt-tools-toolbar-ready'));
          } catch {}
        }, 0);
      }
    }
  }
}
