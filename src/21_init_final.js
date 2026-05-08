      }
    }
    iconDiv.appendChild(iconSpan);
    button.appendChild(iconDiv);

    const labelDiv = document.createElement('div');
    labelDiv.className = 'yt-spec-button-shape-with-label__label';
    labelDiv.setAttribute('aria-hidden', 'false');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--text-alignment-center yt-core-attributed-string--word-wrapping';
    labelSpan.setAttribute('role', 'text');
    labelSpan.textContent = opts.labelText || '';

    labelDiv.appendChild(labelSpan);
    label.appendChild(button);
    label.appendChild(labelDiv);
    wrap.appendChild(label);

    if (opts.onclick) button.addEventListener('click', opts.onclick);
    return wrap;
  }

  const eyeIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>';
  const classicIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-tv"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" /><path d="M16 3l-4 4l-4 -4" /></svg>';
  const starIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  function insertReelBarButtons() {
    const isShortsPage = document.location.pathname.startsWith('/shorts');
    const bar = $e('reel-action-bar-view-model');
    if (!isShortsPage || !bar) {
      document.querySelectorAll('[data-yt-tools-shorts-classic], [data-yt-tools-shorts-views], [data-yt-tools-shorts-rating]').forEach(el => el.remove());
      return;
    }
    if (bar.querySelector('[data-yt-tools-shorts-classic]')) return;

    const classicBtn = createReelBarButton({
      dataAttr: 'data-yt-tools-shorts-classic',
      title: 'Classic mode',
      ariaLabel: 'Chế độ cổ điển',
      iconSvg: classicIconSvg,
      labelText: '',
      onclick: redirectToClassic,
    });
    const viewsBtn = createReelBarButton({
      dataAttr: 'data-yt-tools-shorts-views',
      title: 'Vistas',
      ariaLabel: 'Vistas',
      iconSvg: eyeIconSvg,
      labelText: '—',
      onclick: function () { },
    });
    const ratingBtn = createReelBarButton({
      dataAttr: 'data-yt-tools-shorts-rating',
      title: 'Rating (likes/dislikes)',
      ariaLabel: 'Rating',
      iconSvg: starIconSvg,
      labelText: '—',
      onclick: function () { },
    });

    bar.insertBefore(ratingBtn, bar.firstChild);
    bar.insertBefore(viewsBtn, bar.firstChild);
    bar.insertBefore(classicBtn, bar.firstChild);

    const videoId = (document.location.pathname.split('/').filter(Boolean))[1];
    if (videoId) {
      const persisted = getLikesDislikesFromPersistedCache(videoId);
      if (persisted && persisted.viewCount != null) updateShortsViewsButton(videoId, persisted.viewCount);
      if (persisted && persisted.rating != null) updateShortsRatingButton(videoId, persisted.rating);
    }
    __ytToolsRuntime.updateShortsViewsButton = updateShortsViewsButton;
    __ytToolsRuntime.updateShortsRatingButton = updateShortsRatingButton;
  }

  const insertButtons = () => {
    insertReelBarButtons();
  };

  const targetNode = $e('body');

  if (targetNode != undefined && !isYTMusic) {
    const element = $e('ytd-item-section-renderer[static-comments-header] #contents');
    if (element != undefined && settings.theme !== 'custom') {
      const observerElementDom = (elem) => {
        const observer = new IntersectionObserver(entries => {

          if (entries[0].isIntersecting) {

            element.style.background = `${selectedTheme.gradient ?? ''}`;
          } else {
            return
          }
        })

        return observer.observe($e(`${elem}`))

      }
      observerElementDom('ytd-item-section-renderer[static-comments-header] #contents')
    }
  }

  // Stats

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0h 0m 0s';
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  function updateUI() {
    $id('total-time').textContent = formatTime(usageTime);
    $id('video-time').textContent = formatTime(videoTime);
    $id('shorts-time').textContent = formatTime(shortsTime);

    const maxTime = 86400; // 24 hours
    $id('usage-bar').style.width =
      `${(usageTime / maxTime) * 100}%`;
    $id('video-bar').style.width =
      `${(videoTime / maxTime) * 100}%`;
    $id('shorts-bar').style.width =
      `${(shortsTime / maxTime) * 100}%`;
  }

  function detectContentType(videoElement) {
    if (/\/shorts\//.test(window.location.pathname)) return 'shorts';

    let parent = videoElement;
    while ((parent = parent.parentElement) !== null) {
      if (parent.classList.contains('shorts-container') ||
        parent.classList.contains('reel-video') ||
        parent.tagName === 'YTD-REEL-VIDEO-RENDERER') {
        return 'shorts';
      }
    }


    if (videoElement.closest('ytd-watch-flexy') ||
      videoElement.closest('#primary-inner')) {
      return 'video';
    }
    if (videoElement.closest('ytd-thumbnail') ||
      videoElement.closest('ytd-rich-item-renderer')) {
      return 'video';
    }

    return null;
  }

  function findActiveVideo() {
    const videos = $m('video');
    for (const video of videos) {
      if (!video.paused && !video.ended && video.readyState > 2) {
        return video;
      }
    }
    return null;
  }

  function updateCanvasSize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = canvasHeight;
    }
  }

  function onWaveStyleChange(e) {
    waveStyle = e.target.value;
    const selectAppend = $id('select-wave-visualizer-select');
    if (selectAppend) selectAppend.value = e.target.value;
    saveSettings();
  }

  function cleanup(fullCleanup = false) {
    if (fullCleanup && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (currentVideo) {
      currentVideo.removeEventListener('play', showCanvas);
      currentVideo.removeEventListener('pause', hideCanvas);
      currentVideo.removeEventListener('ended', hideCanvas);
    }
    if (fullCleanup) {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
        canvas = null;
        ctx = null;
      }
      if (controlPanel && controlPanel.parentNode) {
        controlPanel.parentNode.removeChild(controlPanel);
        controlPanel = null;
      }
      if (source) {
        try {
          source.disconnect();
          // Reconnect source directly to destination to keep audio playing
          // (createMediaElementSource routes ALL audio through Web Audio API)
          if (audioCtx && audioCtx.state !== 'closed') {
            source.connect(audioCtx.destination);
          }
        } catch (err) { }
        // Don't null source — cached on video.__ytToolsAudioSource for reuse
      }
      // Keep audioCtx running — source is connected to destination for audio passthrough
      if (currentVideo && currentVideo[PROCESSED_FLAG]) {
        delete currentVideo[PROCESSED_FLAG];
      }
      currentVideo = null;
      isSetup = false;

      window.removeEventListener('resize', updateCanvasSize);
      const selectAppend = $id('select-wave-visualizer-select');
      if (selectAppend) selectAppend.removeEventListener('change', onWaveStyleChange);
    } else {
      if (canvas) canvas.style.opacity = '0';
      if (controlPanel) controlPanel.style.opacity = '0';
    }
  }



  function createCanvasOverlay() {
    if (canvas) return;
    const parent = document.body;
    canvas = document.createElement('canvas');
    canvas.id = 'wave-visualizer-canvas';
    canvas.width = window.innerWidth;
    canvas.height = canvasHeight;
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.backgroundColor = 'transparent';
    canvas.style.zIndex = '10000';
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.3s';

    parent.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }


  function createControlPanelWave() {
    if (controlPanel) return;

    controlPanel = $cl('div');
    controlPanel.id = 'wave-visualizer-control';
    const selectAppend = $id('select-wave-visualizer-select');
    waveStyle = settings.waveVisualizerSelected;

    if (selectAppend) {
      selectAppend.removeEventListener('change', onWaveStyleChange);
      selectAppend.addEventListener('change', onWaveStyleChange);
    }
  }



  // setting Audio y Analyser
  function setupAudioAnalyzer(video) {
    if (!video || video[PROCESSED_FLAG]) return;
    video[PROCESSED_FLAG] = true;
    cleanup(false);
    currentVideo = video;
    createCanvasOverlay();
    createControlPanelWave();

    // Reuse existing AudioContext if possible (suspend/resume pattern)
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);
    smoothedData = new Array(bufferLength).fill(128);

    try {
      // Reuse cached source if video already has one (createMediaElementSource is one-shot per element)
      if (video.__ytToolsAudioSource) {
        source = video.__ytToolsAudioSource;
        try { source.disconnect(); } catch(e) {}
      } else {
        source = audioCtx.createMediaElementSource(video);
        video.__ytToolsAudioSource = source;
      }
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      Notify('error', "MediaElementSource or error:", e);
      cleanup(true);
      return;
    }

    video.removeEventListener('play', showCanvas);
    video.removeEventListener('pause', hideCanvas);
    video.removeEventListener('ended', hideCanvas);

    video.addEventListener('play', showCanvas);
    video.addEventListener('pause', hideCanvas);
    video.addEventListener('ended', hideCanvas);

    window.removeEventListener('resize', updateCanvasSize);
    window.addEventListener('resize', updateCanvasSize);

    draw();
    isSetup = true;
  }

  function draw() {
    animationId = requestAnimationFrame(draw);

    if (parseFloat(canvas.style.opacity) <= 0) return;

    analyser.getByteTimeDomainData(dataArray);
    for (let i = 0; i < bufferLength; i++) {
      smoothedData[i] += smoothingFactor * (dataArray[i] - smoothedData[i]);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let sliceWidth = canvas.width / bufferLength;

    switch (waveStyle) {

      case 'linea': {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
          if (i === 0) ctx.moveTo(x, amplitude);
          else ctx.lineTo(x, amplitude);
          x += sliceWidth;
        }
        ctx.stroke();
        break;
      }
      case 'barras': {
        let x = 0;
        for (let i = 0; i < bufferLength; i += 5) {
          let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
          ctx.fillStyle = 'cyan';
          ctx.fillRect(x, 0, sliceWidth * 4, amplitude);
          x += sliceWidth * 5;
        }
        break;
      }
      case 'curva': {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(0, Math.max(0, smoothedData[0] - 128) * scale);
        for (let i = 0; i < bufferLength - 1; i++) {
          let x0 = i * sliceWidth;
          let x1 = (i + 1) * sliceWidth;
          let y0 = Math.max(0, smoothedData[i] - 128) * scale;
          let y1 = Math.max(0, smoothedData[i + 1] - 128) * scale;
          let cp1x = x0 + sliceWidth / 3;
          let cp1y = y0;
          let cp2x = x1 - sliceWidth / 3;
          let cp2y = y1;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
        }
        ctx.stroke();
        break;
      }
      case 'picos': {
        ctx.fillStyle = 'magenta';
        let x = 0;
        for (let i = 0; i < bufferLength; i += 5) {
          let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
          ctx.beginPath();
          ctx.arc(x, amplitude, 2, 0, Math.PI * 2);
          ctx.fill();
          x += sliceWidth * 5;
        }
        break;
      }
      case 'solida': {
        ctx.beginPath();
        let x = 0;
        ctx.moveTo(0, 0);
        for (let i = 0; i < bufferLength; i++) {
          let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
          ctx.lineTo(x, amplitude);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,255,0,0.3)';
        ctx.fill();
        break;
      }
      case 'dinamica': {
        let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'purple');
        gradient.addColorStop(1, 'blue');
        ctx.lineWidth = 3;
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
          if (i === 0) ctx.moveTo(x, amplitude);
          else ctx.lineTo(x, amplitude);
          x += sliceWidth;
        }
        ctx.stroke();
        break;
      }
      case 'montana': {
        ctx.beginPath();
        let x = 0;
        ctx.moveTo(0, 0);
        for (let i = 0; i < bufferLength; i++) {
          let amp = (smoothedData[i] - 128) * scale * 0.8;
          ctx.lineTo(x, amp);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(128,128,255,0.4)';
        ctx.fill();
        break;
      }

      default:
        break;
    }
  }

  // Sử dụng các API sự kiện có sẵn của YouTube để tránh dùng MutationObserver
  // (chỉ gắn 1 lần, tránh leak khi applySettings chạy lại)
  if (!window.__ytToolsPageDataBound && !isYTMusic) {
    window.__ytToolsPageDataBound = true;
    document.addEventListener('yt-page-data-updated', () => {
      requestAnimationFrame(() => {
        if (window.location.pathname.startsWith('/shorts')) {
          insertButtons();
        }
        addIcon();
      });
    });
  }

  // Cập nhật thống kê thời gian xem định kỳ mà không cần MutationObserver
  // GM_setValue chỉ gọi mỗi 30 giây để giảm I/O, UI vẫn cập nhật mỗi 1 giây
  if (!__ytToolsRuntime.statsIntervalId) {
    let __lastStatsSave = 0;
    __ytToolsRuntime.statsIntervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdate) / 1000;

      const isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        usageTime += delta;
      }

      // Only do DOM query when tab is visible
      if (isVisible) {
        const activeVideoEl = document.querySelector('video.video-stream');
        if (activeVideoEl && !activeVideoEl.paused && !activeVideoEl.ended) {
          const type = window.location.pathname.startsWith('/shorts') ? 'shorts' : 'video';
          if (type === 'video') videoTime += delta;
          else shortsTime += delta;
        }
      }

      lastUpdate = now;
      // Chỉ lưu vào GM storage mỗi 30 giây để giảm I/O
      if (now - __lastStatsSave >= 30000) {
        __lastStatsSave = now;
        GM_setValue(STORAGE.USAGE, usageTime);
        GM_setValue(STORAGE.VIDEO, videoTime);
        GM_setValue(STORAGE.SHORTS, shortsTime);
      }
      if (isVisible && $id('stats')?.classList?.contains('active')) updateUI();
    }, 2000); // Reduced from 1s to 2s — UI still feels responsive
    // Lưu ngay khi user rời trang
    window.addEventListener('pagehide', () => {
      GM_setValue(STORAGE.USAGE, usageTime);
      GM_setValue(STORAGE.VIDEO, videoTime);
      GM_setValue(STORAGE.SHORTS, shortsTime);
    }, { capture: true });
  }

  // Chạy lần đầu tiên cho Shorts nếu đang ở trang Shorts
  if (!isYTMusic && window.location.pathname.startsWith('/shorts')) {
    insertButtons();
  }
  // --- KẾT THÚC GLOBAL OBSERVER ---

  checkForVideo(); // retry: video element may not exist at first call (line ~5228)

  // [REMOVED] Duplicate stats interval was here — already handled above (line ~5924).



  updateUI();

  // end stats
  if (__ytToolsRuntime.settingsLoaded) {
    saveSettings();
  }

}

let validoBotones = true;

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

// Build YTM toolbar using pure DOM API (bypasses Trusted Types)
function buildYTMToolbar() {
  const main = document.createElement('main');
  main.className = 'yt-tools-container';

  const container = document.createElement('div');
  container.className = 'yt-tools-inner-container';

  const form = document.createElement('form');
  form.className = 'yt-tools-form';
  const btnsDiv = document.createElement('div');
  btnsDiv.className = 'containerButtons';

  // Thumbnail (Image download)
  btnsDiv.appendChild(makeToolBtn('Image video', 'imagen', '', [
    'M0 0h24v24H0z', 'M15 8h.01',
    'M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5',
    'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4',
    'M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559',
    'M19 16v6', 'M22 19l-3 3l-3 -3'
  ]));

  // Repeat
  if (!isYTMusic) {
    btnsDiv.appendChild(makeToolBtn('Repeat video', 'repeatvideo', '', [
      'M0 0h24v24H0z',
      'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
      'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3'
    ]));
  }

  // Download MP4
  btnsDiv.appendChild(makeToolBtn('MP4', null, 'btn1', [
    'M0 0h24v24H0z', 'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M12 17v-6', 'M9.5 14.5l2.5 2.5l2.5 -2.5'
  ]));

  // Download MP3
  btnsDiv.appendChild(makeToolBtn('MP3', null, 'btn2', [
    'M0 0h24v24H0z', 'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M12 16l0 -5l2 1'
  ]));

  // Close
  btnsDiv.appendChild(makeToolBtn('Close', null, 'btn3', [
    'M0 0h24v24H0z',
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M10 10l4 4m0 -4l-4 4'
  ]));
  
  if (!isYTMusic) {
    // Add Bookmark
    btnsDiv.appendChild(makeToolBtn('Add bookmark', 'yt-bookmark-add', '', [
      'M0 0h24v24H0z',
      'M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z',
      'M12 7v6', 'M9 10h6'
    ]));
    
    // Show Bookmarks
    btnsDiv.appendChild(makeToolBtn('Show bookmarks', 'yt-bookmark-toggle', '', [
      'M0 0h24v24H0z',
      'M9 6h11', 'M9 12h11', 'M9 18h11', 'M5 6h.01', 'M5 12h.01', 'M5 18h.01'
    ]));
    
    // History (Continue Watching)
    btnsDiv.appendChild(makeToolBtn('History', 'yt-cw-history-toggle', '', [
      'M0 0h24v24H0z',
      'M12 8v4l3 3', 'M3 12a9 9 0 1 0 3 -6.7', 'M3 4v4h4'
    ]));
  }

  // Picture-in-Picture
  btnsDiv.appendChild(makeToolBtn('Picture to picture', null, 'video_picture_to_picture', [
    'M0 0h24v24H0z',
    'M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4',
    'M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z'
  ]));

  // Screenshot
  btnsDiv.appendChild(makeToolBtn('Screenshot video', null, 'screenshot_video', [
    'M0 0h24v24H0z', 'M15 8h.01',
    'M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644',
    'M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644',
    'M4 8v-2a2 2 0 0 1 2 -2h2', 'M4 16v2a2 2 0 0 0 2 2h2',
    'M16 4h2a2 2 0 0 1 2 2v2', 'M16 20h2a2 2 0 0 0 2 -2v-2'
  ]));

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
  [['', 'Video Quality', true],
  ['144', '144p MP4'], ['240', '240p MP4'], ['360', '360p MP4'],
  ['480', '480p MP4'], ['720', '720p HD MP4 Default'],
  ['1080', '1080p FULL HD MP4'], ['1440', '1440p 2K WEBM'], ['4k', '2160p 4K WEBM'], ['8k', '4320p 8K WEBM']
  ].forEach(([val, text, dis]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (dis) { opt.selected = true; opt.disabled = true; }
    videoSelect.appendChild(opt);
  });
  videoSelectDiv.appendChild(videoSelect);

  // Download video container
  const dlVideoContainer = document.createElement('div');
  dlVideoContainer.id = 'descargando';
  dlVideoContainer.className = 'download-container ocultarframe';

  const dlInfo = document.createElement('div');
  dlInfo.className = 'download-info';
  const dlText = document.createElement('span');
  dlText.className = 'download-text';
  dlText.textContent = 'Download Video And Please Wait...';
  const dlQuality = document.createElement('span');
  dlQuality.className = 'download-quality';
  dlInfo.appendChild(dlText);
  dlInfo.appendChild(dlQuality);

  const dlActions = document.createElement('div');
  dlActions.className = 'download-actions';
  const dlBtn = document.createElement('button');
  dlBtn.className = 'download-btn video-btn';
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

  // progress-retry-btn and download-again-btn (required by startDownloadVideoOrAudio)
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

  dlVideoContainer.appendChild(progRetryBtn);
  dlVideoContainer.appendChild(dlAgainBtn);
  dlVideoContainer.appendChild(dlInfo);
  dlVideoContainer.appendChild(dlActions);
  dlVideoContainer.appendChild(progressC);
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
  [['', 'Audio Quality', true],
  ['flac', 'Audio FLAC UHQ'], ['wav', 'Audio WAV UHQ'],
  ['webm', 'Audio WEBM UHQ'], ['mp3', 'Audio MP3 Default'],
  ['m4a', 'Audio M4A'], ['aac', 'Audio AAC'],
  ['opus', 'Audio OPUS'], ['ogg', 'Audio OGG']
  ].forEach(([val, text, dis]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (dis) { opt.selected = true; opt.disabled = true; }
    audioSelect.appendChild(opt);
  });
  audioSelectDiv.appendChild(audioSelect);

  // Download audio container
  const dlAudioContainer = document.createElement('div');
  dlAudioContainer.id = 'descargandomp3';
  dlAudioContainer.className = 'download-container ocultarframeaudio';

  const dlInfoA = document.createElement('div');
  dlInfoA.className = 'download-info';
  const dlTextA = document.createElement('span');
  dlTextA.className = 'download-text';
  dlTextA.textContent = 'Download Audio And Please Wait...';
  const dlQualityA = document.createElement('span');
  dlQualityA.className = 'download-quality';
  dlInfoA.appendChild(dlTextA);
  dlInfoA.appendChild(dlQualityA);

  const dlActionsA = document.createElement('div');
  dlActionsA.className = 'download-actions';
  const dlBtnA = document.createElement('button');
  dlBtnA.className = 'download-btn audio-btn';
  dlBtnA.textContent = 'Download';
  const retryBtnA = document.createElement('button');
  retryBtnA.className = 'retry-btn';
  retryBtnA.style.display = 'none';
  retryBtnA.textContent = 'Retry';
  dlActionsA.appendChild(dlBtnA);
  dlActionsA.appendChild(retryBtnA);

  const progressCA = document.createElement('div');
  progressCA.className = 'progress-container';
  progressCA.style.display = 'none';
  const progressBarA = document.createElement('div');
  progressBarA.className = 'progress-bar';
  const progressFillA = document.createElement('div');
  progressFillA.className = 'progress-fill';
  progressBarA.appendChild(progressFillA);
  const progressTextA = document.createElement('span');
  progressTextA.className = 'progress-text';
  progressTextA.textContent = '0%';
  progressCA.appendChild(progressBarA);
  progressCA.appendChild(progressTextA);

  // progress-retry-btn and download-again-btn for audio
  const progRetryBtnA = document.createElement('button');
  progRetryBtnA.className = 'progress-retry-btn';
  progRetryBtnA.title = 'Retry';
  progRetryBtnA.style.display = 'none';
  progRetryBtnA.textContent = '↻';
  const dlAgainBtnA = document.createElement('button');
  dlAgainBtnA.className = 'download-again-btn';
  dlAgainBtnA.title = 'Download again';
  dlAgainBtnA.style.display = 'none';
  dlAgainBtnA.textContent = '⬇';

  dlAudioContainer.appendChild(progRetryBtnA);
  dlAudioContainer.appendChild(dlAgainBtnA);
  dlAudioContainer.appendChild(dlInfoA);
  dlAudioContainer.appendChild(dlActionsA);
  dlAudioContainer.appendChild(progressCA);
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

  return main;
}

function renderizarButtons() {
  if (isYTMusic) {
    // YouTube Music: inject ABOVE the tab header container (Tiếp theo/Lời nhạc/Liên quan)
    const sidePanel = document.querySelector('#player-page #side-panel');
    const tabHeaders = sidePanel && sidePanel.querySelector('.tab-header-container');
    const addButton = tabHeaders || document.querySelector('#tab-renderer');

    // YTM loads lazily - if element not found, retry
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
      
      const sidePanel = document.querySelector('ytmusic-player-page #side-panel');
      if (sidePanel) {
        // CREATE A COMMON WRAPPER FOR TOOLS AND TAB HEADERS (Top Box)
        let sideWrapper = $id('ytm-side-panel-wrapper');
        if (!sideWrapper) {
          sideWrapper = document.createElement('div');
          sideWrapper.id = 'ytm-side-panel-wrapper';
          sidePanel.insertBefore(sideWrapper, addButton);
        }
        
        const toolbar = buildYTMToolbar();
        sideWrapper.appendChild(toolbar);
        
        // ADD A LINE SEPARATOR
        const line = document.createElement('div');
        line.className = 'ytm-side-panel-divider';
        sideWrapper.appendChild(line);
        
        // MOVE THE TAB HEADER INTO THE TOP BOX
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
        const toolbar = buildYTMToolbar();
        // Insert before metadata to be above descriptions/comments
        addButton.parentNode.insertBefore(toolbar, addButton);
      }
    }
  }

  const formulariodescarga = $e('.formulariodescarga');
  const formulariodescargaaudio = $e('.formulariodescargaaudio');
  const btn1mp4 = $e('.btn1');
  const btn2mp3 = $e('.btn2');
  const btn3cancel = $e('.btn3');
  const selectcalidades = $e('.selectcalidades');
  const selectcalidadesaudio = $e('.selectcalidadesaudio');

  [formulariodescarga, formulariodescargaaudio].forEach(form => {
    if (!form) return;
    if (form.dataset.ytToolsPreventDefault === '1') return;
    form.addEventListener('click', e => e.preventDefault());
    form.dataset.ytToolsPreventDefault = '1';
  });

  if (selectcalidades && selectcalidades.dataset.ytToolsBound !== '1') {
    selectcalidades.dataset.ytToolsBound = '1';
    selectcalidades.addEventListener('change', e => {
      const quality = e.target.value;
      if (!quality) return; // Don't proceed if no quality selected

      const downloadContainer = $id('descargando');
      const downloadText = downloadContainer.querySelector('.download-text');
      const downloadQuality = downloadContainer.querySelector('.download-quality');
      const downloadBtn = downloadContainer.querySelector('.download-btn');
      const retryBtn = downloadContainer.querySelector('.retry-btn');
      const progressContainer = downloadContainer.querySelector('.progress-container');

      // Update UI
      downloadContainer.classList.add('video');
      downloadContainer.classList.remove('ocultarframe');
      downloadText.textContent = `Download ${quality.toUpperCase()} And Please Wait...`;
      downloadQuality.textContent = `${quality}p`;

      // Show download button, hide progress
      downloadBtn.style.display = 'block';
      retryBtn.style.display = 'none';
      progressContainer.style.display = 'none';

      // Store quality for later use
      downloadContainer.dataset.quality = quality;
      downloadContainer.dataset.type = 'video';
    });
  }

  if (selectcalidadesaudio && selectcalidadesaudio.dataset.ytToolsBound !== '1') {
    selectcalidadesaudio.dataset.ytToolsBound = '1';
    selectcalidadesaudio.addEventListener('change', e => {
      const format = e.target.value;
      if (!format) return; // Don't proceed if no format selected

      const downloadContainer = $id('descargandomp3');
      const downloadText = downloadContainer.querySelector('.download-text');
      const downloadQuality = downloadContainer.querySelector('.download-quality');
      const downloadBtn = downloadContainer.querySelector('.download-btn');
      const retryBtn = downloadContainer.querySelector('.retry-btn');
      const progressContainer = downloadContainer.querySelector('.progress-container');

      // Update UI
      downloadContainer.classList.add('audio');
      downloadContainer.classList.remove('ocultarframeaudio');
      downloadText.textContent = `Download ${format.toUpperCase()} And Please Wait...`;
      downloadQuality.textContent = format.toUpperCase();

      // Show download button, hide progress
      downloadBtn.style.display = 'block';
      retryBtn.style.display = 'none';
      progressContainer.style.display = 'none';

      // Store format for later use
      downloadContainer.dataset.quality = format;
      downloadContainer.dataset.type = 'audio';
    });
  }

  if (btn3cancel && btn3cancel.dataset.ytToolsBound !== '1') {
    btn3cancel.dataset.ytToolsBound = '1';
    btn3cancel.addEventListener('click', () => {
      // Hide all selects
      selectcalidades?.classList.add('ocultarframe');
      selectcalidadesaudio?.classList.add('ocultarframeaudio');

      // Hide all download containers
      const videoContainer = $id('descargando');
      const audioContainer = $id('descargandomp3');

      if (videoContainer) {
        videoContainer.classList.add('ocultarframe');
        videoContainer.classList.remove('video', 'audio', 'completed');
        videoContainer.removeAttribute('data-quality');
        videoContainer.removeAttribute('data-type');
        videoContainer.removeAttribute('data-downloading');
        videoContainer.removeAttribute('data-url-opened');
        videoContainer.removeAttribute('data-last-download-url');
        videoContainer.querySelector?.('.download-again-btn')?.style && (videoContainer.querySelector('.download-again-btn').style.display = 'none');
      }

      if (audioContainer) {
        audioContainer.classList.add('ocultarframeaudio');
        audioContainer.classList.remove('video', 'audio', 'completed');
        audioContainer.removeAttribute('data-quality');
        audioContainer.removeAttribute('data-type');
        audioContainer.removeAttribute('data-downloading');
        audioContainer.removeAttribute('data-url-opened');
        audioContainer.removeAttribute('data-last-download-url');
        audioContainer.querySelector?.('.download-again-btn')?.style && (audioContainer.querySelector('.download-again-btn').style.display = 'none');
      }

      // Hide all forms
      if (formulariodescarga) formulariodescarga.style.setProperty('display', 'none', 'important');
      if (formulariodescargaaudio) formulariodescargaaudio.style.setProperty('display', 'none', 'important');

      // Reset forms
      formulariodescarga?.reset();
      formulariodescargaaudio?.reset();
    });
  }

  // Add event listeners for download buttons (only once)
  if (!__ytToolsRuntime.downloadClickHandlerInitialized) {
    __ytToolsRuntime.downloadClickHandlerInitialized = true;
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const clicked =
        target.closest('.download-btn') ||
        target.closest('.retry-btn') ||
        target.closest('.progress-retry-btn') ||
        target.closest('.download-again-btn');
      if (!clicked) return;

      const container = clicked.closest('.download-container');
      if (!container) return;

      const quality = container.dataset.quality;
      const type = container.dataset.type;
      // download-again just re-opens the last URL (no restart)
      if (clicked.classList.contains('download-again-btn')) {
        const url = container.dataset.lastDownloadUrl;
        if (url) window.open(url);
        return;
      }
      if (!quality || !type) return;

      if (clicked.classList.contains('progress-retry-btn')) {
        container.dataset.downloading = 'false';
        container.dataset.urlOpened = 'false';
        container.dataset.lastDownloadUrl = '';
        container.querySelector?.('.download-again-btn')?.style && (container.querySelector('.download-again-btn').style.display = 'none');
      }
      startDownloadVideoOrAudio(quality, container);
    });
  }



  if (btn1mp4 && btn1mp4.dataset.ytToolsBound !== '1') {
    btn1mp4.dataset.ytToolsBound = '1';
    btn1mp4.addEventListener('click', () => {
      // Show video select, hide audio select
      selectcalidades?.classList.remove('ocultarframe');
      selectcalidadesaudio?.classList.add('ocultarframeaudio');

      // Hide all download containers
      const videoContainer = $id('descargando');
      const audioContainer = $id('descargandomp3');

      if (videoContainer) {
        videoContainer.classList.add('ocultarframe');
        videoContainer.classList.remove('video', 'audio', 'completed');
        videoContainer.removeAttribute('data-quality');
        videoContainer.removeAttribute('data-type');
        videoContainer.removeAttribute('data-downloading');
        videoContainer.removeAttribute('data-url-opened');
      }

      if (audioContainer) {
        audioContainer.classList.add('ocultarframeaudio');
        audioContainer.classList.remove('video', 'audio', 'completed');
        audioContainer.removeAttribute('data-quality');
        audioContainer.removeAttribute('data-type');
        audioContainer.removeAttribute('data-downloading');
        audioContainer.removeAttribute('data-url-opened');
      }

      // Show video form, hide audio form
      if (formulariodescarga) formulariodescarga.style.setProperty('display', 'flex', 'important');
      if (formulariodescargaaudio) formulariodescargaaudio.style.setProperty('display', 'none', 'important');

      // Reset forms
      formulariodescarga?.reset();
      formulariodescargaaudio?.reset();

      // On YTM: auto-select 720p and show download button immediately
      if (isYTMusic && selectcalidades) {
        selectcalidades.value = '720';
        selectcalidades.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  if (btn2mp3 && btn2mp3.dataset.ytToolsBound !== '1') {
    btn2mp3.dataset.ytToolsBound = '1';
    btn2mp3.addEventListener('click', () => {
      // Show audio select, hide video select
      selectcalidadesaudio?.classList.remove('ocultarframeaudio');
      selectcalidades?.classList.add('ocultarframe');

      // Hide all download containers
      const videoContainer = $id('descargando');
      const audioContainer = $id('descargandomp3');

      if (videoContainer) {
        videoContainer.classList.add('ocultarframe');
        videoContainer.classList.remove('video', 'audio', 'completed');
        videoContainer.removeAttribute('data-quality');
        videoContainer.removeAttribute('data-type');
        videoContainer.removeAttribute('data-downloading');
        videoContainer.removeAttribute('data-url-opened');
      }

      if (audioContainer) {
        audioContainer.classList.add('ocultarframeaudio');
        audioContainer.classList.remove('video', 'audio', 'completed');
        audioContainer.removeAttribute('data-quality');
        audioContainer.removeAttribute('data-type');
        audioContainer.removeAttribute('data-downloading');
        audioContainer.removeAttribute('data-url-opened');
      }

      // Show audio form, hide video form
      if (formulariodescargaaudio) formulariodescargaaudio.style.setProperty('display', 'flex', 'important');
      if (formulariodescarga) formulariodescarga.style.setProperty('display', 'none', 'important');

      // Reset forms
      formulariodescargaaudio?.reset();
      formulariodescarga?.reset();

      // On YTM: auto-select MP3 and show download button immediately
      if (isYTMusic && selectcalidadesaudio) {
        selectcalidadesaudio.value = 'mp3';
        selectcalidadesaudio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  // Invertir contenido



  const btnImagen = $e('#imagen');

  // valido modo oscuro và venta de video
  // Repeat video button
  let countRepeat = 0; // count
  const repeat = $e('#repeatvideo'); // Repeat button
  const videoFull = isYTMusic
    ? $e('video')
    : $e('#movie_player > div.html5-video-container > video');
  if (repeat != undefined) {

    repeat.onclick = () => {
      if (
        (isYTMusic ? videoFull : $e('#cinematics > div')) != undefined ||
        videoFull != undefined
      ) {
        countRepeat += 1;
        switch (countRepeat) {
          case 1:
            const videoEl = isYTMusic ? $e('video') : document
              .querySelector('#movie_player > div.html5-video-container > video');
            videoEl?.setAttribute('loop', 'true');
            if (isYTMusic) {
              // On YTM, replace SVG icon using DOM API
              const newSvg = createSvgIcon([
                'M0 0h24v24H0z',
                'M4 12v-3c0 -1.336 .873 -2.468 2.08 -2.856m3.92 -.144h10m-3 -3l3 3l-3 3',
                'M20 12v3a3 3 0 0 1 -.133 .886m-1.99 1.984a3 3 0 0 1 -.877 .13h-13m3 3l-3 -3l3 -3',
                'M3 3l18 18'
              ]);
              repeat.replaceChildren(newSvg);
            } else {
              const imarepeat = $e('.icon-tabler-repeat');
              if (imarepeat) imarepeat.innerHTML = safeHTML(`  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 12v-3c0 -1.336 .873 -2.468 2.08 -2.856m3.92 -.144h10m-3 -3l3 3l-3 3"></path>
                    <path d="M20 12v3a3 3 0 0 1 -.133 .886m-1.99 1.984a3 3 0 0 1 -.877 .13h-13m3 3l-3 -3l3 -3"></path>
                    <path d="M3 3l18 18"></path>
                 </svg> `);
            }
            break;
          case 2:
            countRepeat = 0;
            const videoEl2 = isYTMusic ? $e('video') : document
              .querySelector('#movie_player > div.html5-video-container > video');
            videoEl2?.removeAttribute('loop');
            if (isYTMusic) {
              const newSvg2 = createSvgIcon([
                'M0 0h24v24H0z',
                'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
                'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3'
              ]);
              repeat.replaceChildren(newSvg2);
            } else {
              const imarepeat2 = $e('.icon-tabler-repeat');
              if (imarepeat2) imarepeat2.innerHTML = safeHTML(` <svg  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat" width="24"
                    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
                    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
                  </svg>`);
            }
            break;
        }
      }
    }
  }

  // Background transparent

  const cinematica = $e('#cinematics > div');
  if (cinematica != undefined) {
    cinematica.style.cssText =
      'position: fixed; inset: 0px; pointer-events: none; transform: scale(1.5, 2)';
  }

  if (btnImagen != undefined) {
    btnImagen.onclick = () => {
      if (
        $e('#cinematics > div') != undefined ||
        videoFull != undefined
      ) {
        const parametrosURL = new URLSearchParams(window.location.search);
        let enlace = parametrosURL.get('v');

        const imageUrl = `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`;

        fetch(imageUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.blob();
          })
          .then((blob) => {
            const imageSizeKB = blob.size / 1024;

            if (imageSizeKB >= 20) {
              window.open(
                `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`,
                'popUpWindow',
                'height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
              );
              const imageUrlObject = URL.createObjectURL(blob);

              const enlaceDescarga = $cl('a');
              enlaceDescarga.href = imageUrlObject;
              const titleVideo = isYTMusic
                ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
                : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
              enlaceDescarga.download = `${titleVideo}_maxresdefault.jpg`;
              enlaceDescarga.click();

              URL.revokeObjectURL(imageUrlObject);
            } else {
              console.log(
                'La imagen no excede los 20 KB. No se descargará.'
              );
            }
          })
          .catch((error) => {
            alert('No found image');
            console.error('Error al obtener la imagen:', error);
          });
      }
    };
  }
  // [REMOVED] Duplicate background image handler — handled at end of script (line ~6648+).

  const viewPictureToPicture = $e(
    '.video_picture_to_picture'
  );
  if (viewPictureToPicture != undefined) {
    viewPictureToPicture.onclick = () => {
      const video = $e('video');
      if ('pictureInPictureEnabled' in document) {
        if (!document.pictureInPictureElement) {

          video
            .requestPictureInPicture()
            .then(() => { })
            .catch((error) => {
              console.error(
                'Error al activar el modo Picture-in-Picture:',
                error
              );
            });
        } else {
          // video picture
        }
      } else {
        alert('Picture-in-Picture not supported');
      }
    };
  }
  const screenShotVideo = $e('.screenshot_video');
  if (screenShotVideo != undefined) {
    screenShotVideo.onclick = () => {
      const video = $e('video');
      const canvas = $cl('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imagenURL = canvas.toDataURL('image/png');
      const enlaceDescarga = $cl('a');
      enlaceDescarga.href = imagenURL;
      const titleVideo = isYTMusic
        ? ($e('ytmusic-player-bar .title')?.textContent?.trim() || 'YouTube Music')
        : ($e('h1.style-scope.ytd-watch-metadata')?.innerText || 'video');
      enlaceDescarga.download = `${video.currentTime.toFixed(
        0
      )}s_${titleVideo}.png`;
      enlaceDescarga.click();
    };
  } else {
    const containerButtons = $e('.containerButtons');

    if (containerButtons != undefined) {
      containerButtons.innerHTML = safeHTML('');
    }
  }
  // [REMOVED] clearInterval(renderizarButtons) — was passing a function, not an interval ID.
}



console.log('Script en ejecución by: Akari');
const HEADER_STYLE = 'color: #F00; font-size: 24px; font-family: sans-serif;';
const MESSAGE_STYLE = 'color: #00aaff; font-size: 16px; font-family: sans-serif;';
const CODE_STYLE = 'font-size: 14px; font-family: monospace;';

console.log(
  `%cYoutube Ultimate Tools (v${GM_info.script.version})\n` +
  '%cDeveloped by Akari\n' +
  '%c(Based on MDCM & nvbangg)',
  HEADER_STYLE,
  CODE_STYLE,
  MESSAGE_STYLE
);

const currentVersion = GM_info.script.version;
if (!localStorage.getItem('notification-Akari-' + currentVersion)) {
  Notify('info', 'Youtube Ultimate Tools by: Akari (v' + currentVersion + ')');
  localStorage.setItem('notification-Akari-' + currentVersion, true);
}



// Add event listeners to all inputs
const inputs = panel.querySelectorAll('input');
inputs.forEach((input) => {
  input.addEventListener('change', () => {
    try {
      saveSettings();
    } catch (e) {
      console.error('saveSettings error:', e);
    }
    scheduleApplySettings();
  });
  if (input.type === 'range') {
    input.addEventListener('input', () => {
      updateSliderValues();
    });
  }
});

// Some settings are controlled by <select> elements; ensure they persist and apply without duplicating listeners.
function bindSelectOnce(id) {
  const el = $id(id);
  if (!el) return;
  if (el.dataset.ytToolsBound === '1') return;
  el.dataset.ytToolsBound = '1';
  el.addEventListener('change', () => {
    // Persist immediately
    try {
      saveSettings();
    } catch (e) {
      console.error('saveSettings error:', e);
    }
    // Apply with debounce
    scheduleApplySettings();
  });
}

bindSelectOnce('select-video-qualitys-select');
bindSelectOnce('select-languages-comments-select');
bindSelectOnce('select-wave-visualizer-select');

// Export configuration

//   Settings saved
//   const settings = GM_getValue(SETTINGS_KEY, '{}');
//   $id('config-data').value = settings;

$id('export-config').addEventListener('click', () => {
  const settings = GM_getValue(SETTINGS_KEY, '{}');
  $id('config-data').value = settings;
  const configData = settings;
  try {
    JSON.parse(configData); // Validate JSON
    GM_setValue(SETTINGS_KEY, configData);
    setTimeout(() => {
      Notify('success', 'Configuration export successfully!');
    }, 1000);
  } catch (e) {
    Notify('error', 'Invalid configuration data. Please check and try again.');
  }
});
// Import configuration
$id('import-config').addEventListener('click', () => {
  const configData = $id('config-data').value;
  try {
    JSON.parse(configData); // Validate JSON
    GM_setValue(SETTINGS_KEY, configData);
    setTimeout(() => {
      Notify('success', 'Configuration imported successfully!');
      window.location.reload();
    }, 1000);
    // window.location.reload(); // removed: duplicate (setTimeout above already reloads)
  } catch (e) {
    Notify('error', 'Invalid configuration data. Please check and try again.');
  }
});
panel.style.display = 'none';

// var for wave

// Load saved settings
// Visible element DOM
function checkElement(selector, callback, maxAttempts = 100) {
  let attempts = 0;
  const interval = setInterval(() => {
    if ($e(selector)) {
      clearInterval(interval);
      callback();
    } else {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn(`[Youtube Tools] Không tìm thấy element: ${selector}`);
      }
    }
  }, 100);
}

const checkActiveWave = $id('wave-visualizer-toggle');
if (checkActiveWave) {
  checkActiveWave.addEventListener('change', () => {
    const waveVisualizer = $e('#wave-visualizer-toggle');
    if (waveVisualizer.checked) {
      Notify('success', 'Wave visualizer enabled');
      saveSettings();
      scheduleApplySettings();
    } else {
      // Soft cleanup: hide canvas + stop animation, but keep AudioContext alive
      // (createMediaElementSource can only bind once per video element)
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      hideCanvas();
      saveSettings();
      Notify('success', 'Wave visualizer disabled');
    }
  });
}

const checkAudioOnlyTabToggle = $id('audio-only-tab-toggle');
if (checkAudioOnlyTabToggle) {
  checkAudioOnlyTabToggle.addEventListener('change', () => {
    const defaultEnabled = $id('audio-only-toggle') ? $id('audio-only-toggle').checked : false;
    setAudioOnlyTabOverride(checkAudioOnlyTabToggle.checked, defaultEnabled);
    const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
    syncAudioOnlyTabCheckbox({
      ...settings,
      audioOnly: defaultEnabled
    });
    Notify('success', checkAudioOnlyTabToggle.checked ? 'Audio-only enabled for this tab' : 'Audio-only disabled for this tab');
    scheduleApplySettings();
  });
}

const checkAudioOnlyToggle = $id('audio-only-toggle');
if (checkAudioOnlyToggle) {
  checkAudioOnlyToggle.addEventListener('change', () => {
    const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
    syncAudioOnlyTabCheckbox({
      ...settings,
      audioOnly: checkAudioOnlyToggle.checked
    });
    Notify('success', checkAudioOnlyToggle.checked ? 'Audio-only mode enabled' : 'Audio-only mode disabled');
  });
}

const checkNonstopPlaybackToggle = $id('nonstop-playback-toggle');
if (checkNonstopPlaybackToggle) {
  checkNonstopPlaybackToggle.addEventListener('change', () => {
    Notify('success', checkNonstopPlaybackToggle.checked ? 'Nonstop playback enabled' : 'Nonstop playback disabled');
  });
}

// Themes toggle event listener (auto-disable ambient in YTM if themes are turned on)
const checkThemesToggle = $id('themes-toggle');
if (checkThemesToggle) {
  checkThemesToggle.addEventListener('change', () => {
    if (isYTMusic && checkThemesToggle.checked) {
      const cinematicToggle = $id('cinematic-lighting-toggle');
      if (cinematicToggle && cinematicToggle.checked) {
        cinematicToggle.checked = false;
        try { saveSettings(); } catch (e) { }
        scheduleApplySettings();
      }
    }
  });
}

// Cinematic/Ambient lighting toggle event listener
const checkCinematicLighting = $id('cinematic-lighting-toggle');
if (checkCinematicLighting) {
  checkCinematicLighting.addEventListener('change', () => {
    const cinematicToggle = $e('#cinematic-lighting-toggle');
    const syncToggle = $e('#sync-cinematic-toggle');
    const cinematicDiv = $id('cinematics');

    if (cinematicToggle.checked) {
      Notify('success', isYTMusic ? 'Ambient mode enabled' : 'Cinematic mode enabled');
    } else {
      Notify('success', isYTMusic ? 'Ambient mode disabled' : 'Cinematic mode disabled');
    }

    if (isYTMusic) {
      // YTM: use custom ambient mode
      if (cinematicToggle.checked) {
        // Auto-disable theme when ambient is ON (they conflict)
        const themesToggle = $id('themes-toggle');
        if (themesToggle && themesToggle.checked) {
          themesToggle.checked = false;
          try { saveSettings(); } catch (e) { }
          scheduleApplySettings();
        }
        ytmAmbientMode.show();
      } else {
        ytmAmbientMode.destroy();
      }
    } else {
      // YT: use cinematic lighting
      if (syncToggle.checked) {
        setTimeout(() => {
          toggleCinematicLighting();
        }, 300);
      } else {
        if (cinematicDiv) {
          cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
        }
      }
    }
  });
}

// Sync cinematic toggle event listener
const checkSyncCinematic = $id('sync-cinematic-toggle');
if (checkSyncCinematic) {
  checkSyncCinematic.addEventListener('change', () => {
    const syncToggle = $e('#sync-cinematic-toggle');
    const cinematicToggle = $e('#cinematic-lighting-toggle');
    const cinematicDiv = $id('cinematics');

    if (syncToggle.checked) {
      Notify('success', 'Sync with YouTube enabled');
      // Si se activa la sincronización y el modo cinematic está activado, sincronizar con YouTube
      if (cinematicToggle.checked) {
        setTimeout(() => {
          toggleCinematicLighting();
        }, 500);
      }
    } else {
      Notify('success', 'Sync with YouTube disabled');
      // Si se desactiva la sincronización, aplicar inmediatamente el estado del toggle
      if (cinematicDiv) {
        cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
      }
    }
  });
}

// Side Panel Style listener
const checkSidePanelStyle = $id('side-panel-style-select');
if (checkSidePanelStyle) {
  checkSidePanelStyle.addEventListener('change', () => {
    saveSettings();
    scheduleApplySettings();
  });
}

})();

