// ===========================================
// Toolbar (buttons below video / YTM side panel)
// Extracted from legacy-full.js lines 8226-8600
// ===========================================
import { $e, $id, $cl, isYTMusic } from '../../utils/dom.js';

let validoBotones = true;

/**
 * Reset the toolbar injection flag.
 * Called on SPA navigation so toolbar re-injects.
 */
export function resetToolbarFlag() {
  validoBotones = true;
}

// Helper: create SVG icon using DOM API (no innerHTML needed)
function createSvgIcon(pathsData, size) {
  const sz = size || 24;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', String(sz));
  svg.setAttribute('height', String(sz));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  pathsData.forEach(d => {
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', d);
    if (d === 'M0 0h24v24H0z') p.setAttribute('fill', 'none');
    svg.appendChild(p);
  });
  return svg;
}

// Helper: create a toolbar button with SVG icon
function makeToolBtn(title, id, className, paths) {
  const btn = document.createElement('button');
  btn.title = title;
  btn.type = 'button';
  if (id) btn.id = id;
  btn.className = (className ? className + ' ' : '') + 'botones_div';
  btn.appendChild(createSvgIcon(paths));
  return btn;
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
    btnsDiv.appendChild(
      makeToolBtn('Add bookmark', 'yt-bookmark-add', '', [
        'M0 0h24v24H0z',
        'M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z',
        'M12 7v6',
        'M9 10h6',
      ])
    );

    // Show Bookmarks
    btnsDiv.appendChild(
      makeToolBtn('Show bookmarks', 'yt-bookmark-toggle', '', [
        'M0 0h24v24H0z',
        'M9 6h11',
        'M9 12h11',
        'M9 18h11',
        'M5 6h.01',
        'M5 12h.01',
        'M5 18h.01',
      ])
    );

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

  // Close
  btnsDiv.appendChild(
    makeToolBtn('Close', null, 'btn3', [
      'M0 0h24v24H0z',
      'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
      'M10 10l4 4m0 -4l-4 4',
    ])
  );

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
  audioForm.className = 'formulariodescargaaudio ocultarframe';
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

  return main;
}

/**
 * Build a download progress container (video or audio).
 */
function buildDownloadContainer(id, type) {
  const container = document.createElement('div');
  container.id = id;
  container.className = `download-container ${type === 'audio' ? 'ocultarframeaudio' : 'ocultarframe'}`;

  const progRetryBtn = document.createElement('button');
  progRetryBtn.className = 'progress-retry-btn';
  progRetryBtn.title = 'Retry';
  progRetryBtn.style.display = 'none';
  progRetryBtn.textContent = '↻';

  const dlAgainBtn = document.createElement('button');
  dlAgainBtn.className = 'download-again-btn';
  dlAgainBtn.title = 'Download again';
  dlAgainBtn.style.display = 'none';
  dlAgainBtn.textContent = '⬇';

  const dlInfo = document.createElement('div');
  dlInfo.className = 'download-info';
  const dlText = document.createElement('span');
  dlText.className = 'download-text';
  dlText.textContent = `Download ${type === 'audio' ? 'Audio' : 'Video'} And Please Wait...`;
  const dlQuality = document.createElement('span');
  dlQuality.className = 'download-quality';
  dlInfo.appendChild(dlText);
  dlInfo.appendChild(dlQuality);

  const dlActions = document.createElement('div');
  dlActions.className = 'download-actions';
  const dlBtn = document.createElement('button');
  dlBtn.className = `download-btn ${type}-btn`;
  dlBtn.textContent = 'Download';
  const retryBtn = document.createElement('button');
  retryBtn.className = 'retry-btn';
  retryBtn.style.display = 'none';
  retryBtn.textContent = 'Retry';
  dlActions.appendChild(dlBtn);
  dlActions.appendChild(retryBtn);

  const progressC = document.createElement('div');
  progressC.className = 'progress-container';
  progressC.style.display = 'none';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressBar.appendChild(progressFill);
  const progressText = document.createElement('span');
  progressText.className = 'progress-text';
  progressText.textContent = '0%';
  progressC.appendChild(progressBar);
  progressC.appendChild(progressText);

  container.appendChild(progRetryBtn);
  container.appendChild(dlAgainBtn);
  container.appendChild(dlInfo);
  container.appendChild(dlActions);
  container.appendChild(progressC);

  return container;
}

/**
 * Inject the toolbar into the page.
 * For YTM: above the tab header in the side panel.
 * For YT: above the video metadata.
 */
export function renderizarButtons() {
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
        line.className = 'ytm-side-panel-divider';
        sideWrapper.appendChild(line);
        sideWrapper.appendChild(addButton);
      }
    }
  } else {
    // Regular YouTube
    const addButton = document.querySelector('.style-scope .ytd-watch-metadata');
    const addButton2 = document.querySelector('#contents');

    if (addButton && validoBotones) {
      const isVisible = addButton.offsetParent !== null;
      if (isVisible || addButton2) {
        validoBotones = false;
        const toolbar = buildToolbar();
        addButton.parentNode.insertBefore(toolbar, addButton);
      }
    }
  }
}
