      // Disconnect previous Shorts observer if it exists
      if (__ytToolsRuntime.shortsObserver) {
        try { __ytToolsRuntime.shortsObserver.disconnect(); } catch(e){}
        __ytToolsRuntime.shortsObserver = null;
      }
      let domTimeout;
      __ytToolsRuntime.shortsObserver = new MutationObserver(() => {
        if (domTimeout) clearTimeout(domTimeout);
        domTimeout = setTimeout(() => {
          insertButtons();
          addIcon();
        }, 300);
      });

      __ytToolsRuntime.shortsObserver.observe(contentScrollable, { childList: true, subtree: true });
    }
  } // end if (!isYTMusic) shorts observer

  function agregarBotonesDescarga() {
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
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); // Đợi 1s cho trình duyệt bắt đầu tải
        } catch (error) {
          console.error('Error al descargar la imagen:', error);
        }
      };

      img.parentElement.style.position = 'relative';
      img.parentElement.appendChild(button);
    });
  }

  const redirectToClassic = () => {
    const videoId = window.location.pathname.split('/').pop();
    const classicUrl = `https://www.youtube.com/watch?v=${videoId}`;
    window.open(classicUrl, '_blank');
    $e('video.video-stream.html5-main-video').pause();
  };

  // Update the Shorts "views" button label (same bar as Classic). Call with viewCount from API/cache.
  function updateShortsViewsButton(videoId, viewCount) {
    const bar = $e('reel-action-bar-view-model');
    if (!bar) return;
    const viewsWrap = bar.querySelector('[data-yt-tools-shorts-views]');
    if (!viewsWrap) return;
    const labelSpan = viewsWrap.querySelector('.yt-spec-button-shape-with-label__label span, [role="text"]');
    if (!labelSpan) return;
    labelSpan.textContent = Number.isFinite(viewCount) && viewCount >= 0 ? FormatterNumber(viewCount, 0) : '—';
  }

  // Update the Shorts "rating" button label (rating 0–5 from API/cache, shown as e.g. "4.9").
  function updateShortsRatingButton(videoId, rating) {
    const bar = $e('reel-action-bar-view-model');
    if (!bar) return;
    const ratingWrap = bar.querySelector('[data-yt-tools-shorts-rating]');
    if (!ratingWrap) return;
    const labelSpan = ratingWrap.querySelector('.yt-spec-button-shape-with-label__label span, [role="text"]');
    if (!labelSpan) return;
    labelSpan.textContent = (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating.toFixed(1) : '—';
  }

  // Build one YT-style button for the reel action bar using pure DOM API (Trusted Types safe).
  function createReelBarButton(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'button-view-model ytSpecButtonViewModelHost';
    if (opts.dataAttr) wrap.setAttribute(opts.dataAttr, '1');

    const label = document.createElement('label');
    label.className = 'yt-spec-button-shape-with-label ytSpecButtonShapeWithLabelHost';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-l yt-spec-button-shape-next--icon-button ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeL ytSpecButtonShapeNextIconButton';
    button.title = opts.title || '';
    button.setAttribute('aria-label', opts.ariaLabel || '');

    const iconDiv = document.createElement('div');
    iconDiv.className = 'yt-spec-button-shape-next__icon';
    iconDiv.setAttribute('aria-hidden', 'true');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'yt-icon-shape ytSpecIconShapeHost';
    // Use safeHTML + temp div to parse SVG (works with Trusted Types)
    if (opts.iconSvg) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = safeHTML(opts.iconSvg);
        while (tempDiv.firstChild) {
          iconSpan.appendChild(tempDiv.firstChild);
        }
      } catch (e) {
        console.warn('[YT Tools] SVG parse error:', e);
