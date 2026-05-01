// ------------------------------
  function parseCountText(text) {
    if (!text) return null;
    const s0 = String(text).trim().toLowerCase();
    if (!s0) return null;
    let mult = 1;
    let s = s0.replace(/\s+/g, '');
    if (s.includes('mil')) {
      mult = 1000;
      s = s.replace('mil', '');
    } else if (s.includes('k')) {
      mult = 1000;
      s = s.replace('k', '');
    } else if (s.includes('m')) {
      mult = 1000000;
      s = s.replace('m', '');
    }
    // normalize decimal separators
    s = s.replace(/[^\d.,]/g, '');
    if (!s) return null;
    // If both separators exist, assume last is decimal
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');
    let nStr = s;
    if (lastDot !== -1 && lastComma !== -1) {
      const dec = Math.max(lastDot, lastComma);
      const intPart = s.slice(0, dec).replace(/[.,]/g, '');
      const decPart = s.slice(dec + 1);
      nStr = `${intPart}.${decPart}`;
    } else {
      // Use dot as decimal
      nStr = s.replace(',', '.');
    }
    const num = Number.parseFloat(nStr);
    if (!Number.isFinite(num)) return null;
    return Math.round(num * mult);
  }

  async function ensureDislikesForCurrentVideo() {
    const videoId = getCurrentVideoId();
    if (!videoId) return null;
    const now = Date.now();
    if (__ytToolsRuntime.dislikesCache.videoId === videoId && __ytToolsRuntime.dislikesCache.dislikes != null && (now - __ytToolsRuntime.dislikesCache.ts) < 10 * 60 * 1000) {
      return __ytToolsRuntime.dislikesCache.dislikes;
    }
    const persisted = getLikesDislikesFromPersistedCache(videoId);
    if (persisted && persisted.dislikes != null) {
      __ytToolsRuntime.dislikesCache = {
        videoId,
        dislikes: persisted.dislikes,
        ts: now
      };
      return persisted.dislikes;
    }
    try {
      const res = await fetch(`${apiDislikes}${videoId}`);
      const data = await res.json();
      const dislikes = Number(data?.dislikes);
      const viewCount = Number(data?.viewCount);
      const rating = Number(data?.rating);
      if (Number.isFinite(dislikes)) {
        __ytToolsRuntime.dislikesCache = {
          videoId,
          dislikes,
          ts: now
        };
        const likes = getLikesFromDom();
        setLikesDislikesToPersistedCache(videoId, likes != null ? likes : undefined, dislikes, Number.isFinite(viewCount) ? viewCount : undefined, (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined);
        return dislikes;
      }
    } catch (e) { }
    return null;
  }

  function getLikesFromDom() {
    // Try grab visible like count (YouTube UI varies a lot)
    const likeBtn =
      $e('#top-level-buttons-computed like-button-view-model button-view-model button') ||
      $e('#top-level-buttons-computed like-button-view-model button') ||
      $e('#top-level-buttons-computed ytd-toggle-button-renderer:nth-child(1)') ||
      $e('segmented-like-dislike-button-view-model like-button-view-model');
    if (!likeBtn) return null;

    // Prefer visible counter first; aria-label can include locale thousands separators (17.606) that are ambiguous.
    const candidates = [
      likeBtn.querySelector?.('.yt-spec-button-shape-next__button-text-content')?.textContent,
      likeBtn.textContent,
      likeBtn.getAttribute?.('aria-label'),
    ].filter(Boolean);

    for (const txt of candidates) {
      const n = parseCountText(txt);
      if (n != null) return n;
    }
    return null;
  }

  function updateLikeDislikeBar(likes, dislikes) {
    // Prefer placing it above the "copy description" button (as requested).
    const copyDesc = $id('button_copy_description');
    const host =
      $e('#top-level-buttons-computed') ||
      $e('ytd-watch-metadata #top-level-buttons-computed');
    if (!host && !copyDesc) return;

    let bar = $id('yt-like-dislike-bar-mdcm');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'yt-like-dislike-bar-mdcm';
      bar.innerHTML = safeHTML(`<div class="like"></div><div class="dislike"></div>`);
      if (copyDesc) {
        copyDesc.insertAdjacentElement('beforebegin', bar);
      } else {
        host.appendChild(bar);
      }
    } else if (copyDesc && bar.previousElementSibling !== copyDesc) {
      // Keep it near the copy description area if the DOM changed
      try {
        copyDesc.insertAdjacentElement('beforebegin', bar);
      } catch (e) { }
    }

    if (!Number.isFinite(likes) || !Number.isFinite(dislikes) || likes + dislikes <= 0) {
      bar.style.display = 'none';
      return;
    }

    const total = likes + dislikes;
    const likePct = Math.max(0, Math.min(100, (likes / total) * 100));
    const dislikePct = 100 - likePct;
    bar.style.display = 'block';
    const likeEl = bar.querySelector('.like');
    const dislikeEl = bar.querySelector('.dislike');
    likeEl.style.width = `${likePct}%`;
    dislikeEl.style.width = `${dislikePct}%`;
    bar.title = `Likes: ${likes.toLocaleString()} | Dislikes: ${dislikes.toLocaleString()}`;
  }

  async function applyLikeDislikeBarIfEnabled(settings) {
    if (!settings?.likeDislikeBar) {
      const existing = $id('yt-like-dislike-bar-mdcm');
      if (existing) existing.style.display = 'none';
      return;
    }
    if (!window.location.href.includes('youtube.com/watch')) return;
    const videoId = getCurrentVideoId();
    if (!videoId) return;
    const dislikes = await ensureDislikesForCurrentVideo();
    let likes = getLikesFromDom();
    if (likes == null) {
      const persisted = getLikesDislikesFromPersistedCache(videoId);
      if (persisted?.likes != null) likes = persisted.likes;
    }
    if (dislikes == null || likes == null) return;
    updateLikeDislikeBar(likes, dislikes);
  }

  // Retry helper (YT often renders likes late; keep it lightweight)
  function scheduleLikeBarUpdate(settings, attempts = 4) {
    if (!settings?.likeDislikeBar) return;
    let i = 0;
    const tick = async () => {
      i += 1;
      await applyLikeDislikeBarIfEnabled(settings);
      const bar = $id('yt-like-dislike-bar-mdcm');
      if (bar && bar.style.display !== 'none') return;
      if (i < attempts) setTimeout(tick, 800);
    };
    setTimeout(tick, 300);
  }

  //   Dislikes video
  async function videoDislike() {

    validoUrl = document.location.href;

    const validoVentana = $e('#below > ytd-watch-metadata > div');
    if (validoVentana != undefined && document.location.href.split('?v=')[0].includes('youtube.com/watch')) {
      validoUrl = paramsVideoURL();
      let dislikes = null;
      const persisted = getLikesDislikesFromPersistedCache(validoUrl);
      if (persisted && persisted.dislikes != null) {
        dislikes = persisted.dislikes;
      } else {
        const urlShorts = `${apiDislikes}${validoUrl}`;
        try {
          const respuesta = await fetch(urlShorts);
          const datosShort = await respuesta.json();
          dislikes = Number(datosShort?.dislikes);
          if (Number.isFinite(dislikes)) {
            const likes = getLikesFromDom();
            const viewCount = Number(datosShort?.viewCount);
            const rating = Number(datosShort?.rating);
            setLikesDislikesToPersistedCache(validoUrl, likes != null ? likes : undefined, dislikes, Number.isFinite(viewCount) ? viewCount : undefined, (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined);
          }
        } catch (error) {
          console.log(error);
        }
      }
      if (dislikes != null) {
        const dislikes_content = $e('#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button');
        if (dislikes_content != null) {
          dislikes_content.style.cssText = 'width: 90px';
          dislikes_content.innerHTML = safeHTML(`
              <svg class="svg-dislike-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" /></svg>
              ${FormatterNumber(dislikes, 0)}`);
        }
        __ytToolsRuntime.dislikesCache = {
          videoId: validoUrl,
          dislikes,
          ts: Date.now()
        };
        try {
          const st = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
          scheduleLikeBarUpdate(st, 5);
        } catch (e) { }
      }
    }
  }

  // dislikes shorts + views button (viewCount from Return YouTube Dislike API)
  async function shortDislike() {
    validoUrl = document.location.href;
    const validoVentanaShort = $m(
      "#button-bar > reel-action-bar-view-model > dislike-button-view-model > toggle-button-view-model > button-view-model > label > div > span"
    );

    if (validoVentanaShort != undefined && document.location.href.split('/')[3] === 'shorts') {
      validoUrl = document.location.href.split('/')[4];
      let dislikes = null;
      let viewCount = null;
      let rating = null;
      const persisted = getLikesDislikesFromPersistedCache(validoUrl);
      if (persisted && persisted.dislikes != null) {
        dislikes = persisted.dislikes;
        viewCount = persisted.viewCount ?? null;
        rating = persisted.rating ?? null;
      } else {
        const urlShorts = `${apiDislikes}${validoUrl}`;
        try {
          const respuesta = await fetch(urlShorts);
          const datosShort = await respuesta.json();
          dislikes = Number(datosShort?.dislikes);
          viewCount = Number(datosShort?.viewCount);
          rating = Number(datosShort?.rating);
          if (Number.isFinite(dislikes)) setLikesDislikesToPersistedCache(validoUrl, undefined, dislikes, Number.isFinite(viewCount) ? viewCount : undefined, (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined);
        } catch (error) {
          console.log(error);
        }
      }
      if (dislikes != null) {
        for (let i = 0; i < validoVentanaShort.length; i++) {
          validoVentanaShort[i].textContent = `${FormatterNumber(dislikes, 0)}`;
        }
      }
      if (__ytToolsRuntime.updateShortsViewsButton) __ytToolsRuntime.updateShortsViewsButton(validoUrl, viewCount);
      if (__ytToolsRuntime.updateShortsRatingButton) __ytToolsRuntime.updateShortsRatingButton(validoUrl, rating);
    }
  }

  let showDislikes = false;

  window.addEventListener('yt-navigate-finish', () => {
    if (isYTMusic) return; // Dislikes UI not available on YTM
    const svgDislike = $e('.svg-dislike-ico');
    if (!svgDislike && showDislikes) {
      setTimeout(async () => {
        await videoDislike();
        await shortDislike();
      }, 1500);
    }
  });



  // Create a Trusted Types policy (use custom name to avoid conflict with YTM's own 'default' policy)
  let policy = null;
  try {
    const tt = (typeof unsafeWindow !== 'undefined' ? unsafeWindow.trustedTypes : window.trustedTypes);
    if (tt) {
      try {
        policy = tt.createPolicy('yt-tools-mdcm', {
          createHTML: (s) => s
        });
      } catch (e) {
        // fallback: try to reuse 'default' policy if it exists
        policy = tt.defaultPolicy || null;
      }
    }
  } catch (e) {
    policy = null;
  }

  // Helper: wrap raw HTML strings for Trusted Types compliance
  function safeHTML(str) {
    if (policy && typeof policy.createHTML === 'function') return policy.createHTML(str);
    return str;
  }

  // Styles for our enhancement panel
  GM_addStyle(`
       @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
      @import url("https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/css/iziToast.min.css");
      :root {
              --primary-custom: #ff0000 !important;
              --bg-dark-custom: #1a1a1a !important;
              --bg-card-custom: #252525 !important;
              --text-custom: #ffffff !important;
              --text-custom-secondary: #9e9e9e !important;
              --accent-custom: #ff4444 !important;
          }
        body .container-mdcm {
              font-family: "Inter", -apple-system, sans-serif;
              color: var(--yt-enhance-menu-text, var(--text-custom));
        }
        #toggle-button:hover {
          background-color: rgba(255,255,255,0.1);
          border-radius: 50%;
          opacity: 1 !important;
          }
        .container-mdcm {
            width: 420px;
            max-width: 420px;
            background: rgba(30, 30, 30, 0.6) !important;
            border-radius: 16px 16px 0 0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            max-height: 80vh;
            overflow-y: auto;
            overflow-x: hidden;
            height: auto;
        }

        #shareDropdown {
        display: none;
        position: absolute;
        top: 50px;
        right: 100px;
        background-color: var(--yt-enhance-menu-bg, #252525);
        border-radius: 6px;
        padding: 10px;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
        z-index: 11;
        }
        #shareDropdown a {
        color: var(--text-custom);
        text-decoration: none;
        line-height: 2;
        font-size: 14px;
        }
        #shareDropdown a:hover {
        color: var(--primary-custom);
        }
        .header-mdcm {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            position: sticky;
            top: 0;
            background-color: var(--yt-enhance-menu-bg, #252525);
            border-radius: 16px 16px 0 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-mdcm h1 {
            font-size: 16px;
            margin: 0;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }


        .header-mdcm i {
         color: var(--primary-custom)
        }


        .icons-mdcm {
            display: flex;
            gap: 4px;
        }
        .icons-mdcm i {
          color: var(--yt-enhance-menu-accent, var(--text-custom));
        }


        .icon-btn-mdcm {
            background: rgba(255,255,255,0.1);
            border: none;
            color: var(--text-custom);
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .icon-btn-mdcm:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }

        .icon-btn-mdcm i {
         color: var(--text-custom);
         outline: none;
         text-decoration: none;
        }

        .tabs-mdcm {
            padding: 10px 12px;
            margin: 10px 0;
            position: sticky;
            top: 50px;
            background-color: var(--yt-enhance-menu-bg, #252525);
            z-index: 10;
            display: flex;
            gap: 8px;
            -ms-overflow-style: none;
            padding-bottom: 8px;
        }



        .tabs-mdcm::-webkit-scrollbar {
            height: 0px;
            background-color: transparent;
        }

        .tabs-mdcm:hover::-webkit-scrollbar {
            height: 6px;
        }

        .tabs-mdcm::-webkit-scrollbar-thumb {
            background-color: rgba(255, 0, 0, 0.5);
            border-radius: 3px;
        }

        .tabs-mdcm::-webkit-scrollbar-track {
            background-color: transparent;
        }

        .tab-mdcm {
            padding: 6px 10px;
            border: none;
            background: rgba(255,255,255,0.05);
            cursor: pointer;
            font-size: 12px;
            color: var(--text-custom-secondary);
            border-radius: 6px;
            transition: all 0.3s;
            flex: 1;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            justify-content: center;
            white-space: nowrap;
        }

        .tab-mdcm svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        .tab-mdcm.active {
            background: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
            color: var(--text-custom);
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(255,0,0,0.2);
        }

        .tab-mdcm:hover:not(.active) {
            background: rgba(255,255,255,0.1);
            transform: translateY(-1px);
        }

        .options-mdcm {
            flex: 1;
            overflow-y: auto;
            padding: 0 16px 0;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-custom) var(--bg-dark-custom);
            max-height: 300px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 8px;
        }

        .options-settings-mdcm {
            flex: 1;
            overflow-y: auto;
            padding: 0 16px 0;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-custom) var(--bg-dark-custom);
            max-height: 300px;
            display: grid;
            gap: 8px;
        }

         .card-items-end {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 175px;
        }

         .radio-mdcm {
            width: 14px;
            height: 14px;
            accent-color: var(--primary-custom);
        }

        .color-picker-mdcm {
            width: 50px;
            height: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .color-picker-mdcm:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .options-mdcm::-webkit-scrollbar, .options-settings-mdcm::-webkit-scrollbar {
            width: 6px;
        }

        .options-mdcm::-webkit-scrollbar-track, .options-settings-mdcm::-webkit-scrollbar-track {
            background: var(--bg-dark-custom);
            border-radius: 3px;
        }

        .options-mdcm::-webkit-scrollbar-thumb, .options-settings-mdcm::-webkit-scrollbar-thumb {
            background: var(--primary-custom);
            border-radius: 3px;
        }

        .options-mdcm::-webkit-scrollbar-thumb:hover, .options-settings-mdcm::-webkit-scrollbar-thumb:hover {
            background: var(--accent-custom);
        }

        .options-mdcm::after, .options-settings-mdcm::after {
            content: '';
            display: block;
        }

        .option-mdcm {
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            margin-bottom: 0;
            padding: 5px;
            background: rgba(255,255,255,0.05);
            border-radius: 6px;
            transition: all 0.3s;
            border: 1px solid rgba(255,255,255,0.05);
            color: var(--text-custom);
            gap: 6px;
        }

        .option-mdcm:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.1);
        }
        .option-settings-mdcm {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0;
          padding: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.05);
          gap: 6px;
        }

        .option-settings-mdcm:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.1);
        }
            .tab-content {
            display: none;
        }
            .tab-content.active {
                display: block;
                margin-bottom: 10px;
            }

        .checkbox-mdcm {
            width: 14px;
            height: 14px;
            accent-color: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
        }

        label {
            font-size: 12px;
            color: var(--text-custom);
        }

        .slider-container-mdcm {
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 6px;
        }

        .slider-mdcm {
            width: 100%;
            height: 3px;
            accent-color: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
            margin: 10px 0;
        }

        .reset-btn-mdcm {
            padding: 5px 10px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.1);
            color: var(--text-custom);
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.3s;
        }

        .reset-btn-mdcm:hover {
            background: rgba(255,255,255,0.2);
        }

        .quality-selector-mdcm select {
            position: relative;
            padding: 3px;
            outline: none;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
            background: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
            color: var(--text-custom);
            width: fit-content;
            appearance: none;
            cursor: pointer;
            font-size: 11px;
        }


        .quality-selector-mdcm {
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 6px;
        }

        .select-wrapper-mdcm {
          position: relative;
          display: inline-block;
        }

        .select-wrapper-mdcm select {
          -webkit-appearance: auto;
          -moz-appearance: auto;
        }

        .actions-mdcm {
            position: sticky;
            top: 0;
            padding: 12px 16px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            background: rgba(30, 30, 30, 0.6) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 6px;
            width: 390px;
            border-radius: 0 0 16px 16px;
            justify-content: space-between;
            align-items: center;
        }

        .action-buttons-mdcm {
            display: flex;
            gap: 6px;
        }

        .action-btn-mdcm {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 6px;
            background: var(--primary-custom);
            color: var(--text-custom);
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(255,0,0,0.2);
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255,0,0,0.3);
        }

        textarea.textarea-mdcm {
            width: 100%;
            height: 50px;
            margin-top: 10px;
            margin-bottom: 12px;
            padding: 8px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: var(--text-custom);
            font-size: 11px;
            resize: none;
            transition: all 0.3s;
        }

        textarea.textarea-mdcm:focus {
            outline: none;
            border-color: var(--primary-custom);
            background: rgba(255,255,255,0.08);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .container-mdcm {
            animation: fadeIn 0.3s ease-out;
        }

        .developer-mdcm {
            font-size: 10px;
            color: var(--text-custom-secondary);
        }

        .developer-mdcm a {
            color: var(--primary-custom);
            text-decoration: none;
        }

        /* Styles for the import/export area */
        #importExportArea {
            display: none;
            padding: 16px;
            margin: 0px;
            background-color: var(--yt-enhance-menu-bg, #252525);
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        #importExportArea.active {
            display: block;
            margin-top: 10px;
        }

        /* Style the textarea */
        #importExportArea textarea {
            width: 370px;
            height: 20px;
            margin-bottom: 10px;
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            background-color: rgba(255, 255, 255, 0.05);
            color: var(--text-custom);
            font-size: 12px;
            resize: vertical;
        }

        /* Style the buttons */
        #importExportArea .action-buttons-mdcm  {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }

        #importExportArea .action-btn-mdcm {
            flex: 1;
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            background-color: var(--primary-custom);
            color: var(--text-custom);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        #importExportArea .action-btn-mdcm:hover {
            background-color: var(--accent-custom);
        }

      #yt-stats {
      position: fixed;
      top: 60px;
      right: 20px;
      background: #1a1a1a;
      color: white;
      padding: 15px;
      border-radius: 10px;
      width: 320px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      font-family: Arial, sans-serif;
      display: none;
      }
  #yt-stats-toggle {
      font-size: 12px;
      color: #fff;
      padding: 12px 20px;
      border-radius: 5px;
      cursor: pointer;
  }
  .stat-row {
      margin: 15px 0;
  }
  .progress {
      height: 6px;
      overflow: hidden;
      background: #333;
      border-radius: 3px;
      margin: 8px 0;
  }
  .progress-bar {
      height: 100%;
      transition: width 0.3s;
  }
  .total-bar { background: #44aaff !important; }
  .video-bar { background: #00ff88 !important; }
  .shorts-bar { background: #ff4444 !important; }
  #cinematics {
    position: absolute !important;
    width: 90vw !important;
    height: 100vh ;
  }
    #cinematics div {
        position: fixed;
      inset: 0px;
      pointer-events: none;
      transform: scale(1.5, 2);
  }
      #cinematics > div > div > canvas:nth-child(1), #cinematics > div > div > canvas:nth-child(2) {
   position: absolute !important;
    width: 90vw !important;
    height: 100vh ;
      }

    /* .html5-video-player.unstarted-mode {
       background-image: url('https://avatars.githubusercontent.com/u/54366580?v=4');
       background-repeat: no-repeat;
       background-position: 50% 50%;
       display: flex;
       justify-content: center;
       align-items: center;
    } */

        #yt-enhancement-panel {
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 9999;
        }

        .color-picker {
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            background: none;
        }
        .slider {
            width: 100%;
        }
         #toggle-panel {
            z-index: 10000;
            color: white;
            padding: 5px;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            transition: all 0.5s ease;
            width: 43px;
            border-radius: 100px;
        }

        #icon-menu-settings {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 7px;
        font-size: 20px;
        color: var(--yt-spec-icon-inactive);
        cursor: pointer;
        user-select: none;
        filter: drop-shadow(2px 4px 6px black);
        }

        .theme-option {
            margin-bottom: 15px;
        }
        .theme-option label {
            display: flex;
            align-items: center;
        }
       .theme-option {
    position: relative;
    width: auto;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
}

.theme-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    border: 1px solid #000;
    z-index: 1;
}

.theme-option input[type="radio"] {
    position: relative;
    z-index: 2;
    margin-right: 10px;
    cursor: pointer;
}

.theme-name {
    position: relative;
    z-index: 2;
    font-size: 15px;
    color: #fff;
}

.theme-option label {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 2;
}

  .buttons-tranlate, .select-traductor {
        background: #000;
        font-size: 10px;
        border: none;
        color: #fbf4f4 !important;
        padding: 3px 0;
        margin-left: 10px;
        width: 70px;
        border-radius: 10px;
        }
        .buttons-tranlate:hover {
        cursor: pointer;
        background-color: #6b6b6b;
        }
         button.botones_div {
         margin: 0;
         padding: 0;
         }
         button.botones_div:hover {
         cursor: pointer;
         color: #6b6b6b !important;
         }

        .tab-button:hover {
          background-color: #ec3203 !important;
          color: #ffffff !important;
          cursor: pointer;
        }

        .traductor-container {
            display: inline-block;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
          }

        #eyes {
      opacity: 0;
      position: absolute;
      height: 24px;
      left: 0;
      width: 24px;
    }

    /* width */
    .container-mdcm ::-webkit-scrollbar {
      width: 4px;
      height: 10px;
    }

    /* Track */
    .container-mdcm ::-webkit-scrollbar-track {
      background: #d5d5d5;

    }

    /* Handle */
    .container-mdcm ::-webkit-scrollbar-thumb {
      background: #000;

    }

    .color-boxes {
      display: flex;
      gap: 8px;
    }
    .color-box {
      width: 20px;
      height: 20px;
      border: 1px solid rgb(221 221 221 / 60%);
      border-radius: 4px;
      cursor: pointer;
    }
    .color-box.selected {
      border: 2px solid var(--primary-custom);
      filter: drop-shadow(0px 1px 6px red);
    }

    .containerButtons {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .containerButtons > button:hover {
      cursor: pointer;
    }

        /* Download Container Styles */
        .download-container {
          width: 50%;
          padding: 12px;
          border-radius: 8px;
          margin-top: 8px;
          transition: all 0.3s ease;
        }

        .download-container.video {
          background: linear-gradient(135deg, #ff4444, #cc0000);
          color: white;
        }

        .download-container.audio {
          background: linear-gradient(135deg, #00cc44, #009933);
          color: white;
        }

        .download-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .download-text {
          font-weight: 600;
          font-size: 14px;
        }

        .download-quality {
          font-size: 12px;
          opacity: 0.9;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 3px;
          width: 0%;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 500;
          min-width: 30px;
        }

        .download-footer {
          font-size: 10px;
          opacity: 0.7;
          text-align: center;
        }
        .download-footer a {
          text-decoration: none;
          color: #fff;
        }

        .download-container.completed {
          color: #fff;
          background: linear-gradient(135deg, #00cc44, #009933) !important;
        }

        .download-container.completed .download-text {
          font-weight: 700;
        }

      /* Bookmarks panel (under video buttons) */
      .yt-bookmarks-panel {
        margin-top: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 8px;
      }
      .yt-bm-empty {
        font-size: 12px;
        color: var(--text-custom-secondary);
      }
      .yt-bm-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px;
        border-radius: 8px;
      }
      .yt-bm-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .yt-bm-go {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(34,197,94,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
      }
      .yt-bm-label {
        font-size: 12px;
        color: var(--text-custom);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yt-bm-del {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(239,68,68,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
      }

      /* Continue watching panel (under video buttons) */
      .yt-continue-watching-panel {
        margin-top: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 8px;
      }
      .yt-cw-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }
      .yt-cw-header-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-custom, #fff);
      }
      .yt-cw-clear {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(239,68,68,0.18);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
      }
      .yt-cw-empty {
        font-size: 12px;
        color: var(--text-custom-secondary, #aaa);
      }
      .yt-cw-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 8px;
        border-radius: 10px;
      }
      .yt-cw-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .yt-cw-thumb-wrap {
        width: 72px;
        height: 40px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
        flex: none;
      }
      .yt-cw-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .yt-cw-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-custom, #fff);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 520px;
      }
      .yt-cw-meta {
        font-size: 12px;
        color: var(--text-custom-secondary, #aaa);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yt-cw-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .yt-cw-go {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(34,197,94,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
      }
      .yt-cw-del {
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        background: rgba(239,68,68,0.2);
        color: #fff;
        cursor: pointer;
        font-size: 12px;
      }

      /* Shorts channel name label (Home/feed Shorts lockups) */
      html:not([data-mdcm-shorts-channel-name="1"]) .yt-tools-shorts-channel-name {
        display: none !important;
      }
      .yt-tools-shorts-channel-name {
        font-size: 12px;
        line-height: 1.2;
        color: var(--yt-spec-text-secondary, #aaa);
        margin-bottom: 2px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .yt-tools-shorts-stats-wrap {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.2;
        color: var(--yt-spec-text-secondary, #aaa);
      }
      .yt-tools-shorts-stats-wrap .yt-tools-shorts-stats-row {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
      }

      /* Like vs dislike bar (under likes/dislikes) */
      #yt-like-dislike-bar-mdcm {
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        margin-top: 6px;
        background: rgba(255,255,255,0.12);
        max-width: 305px;
      }
      #yt-like-dislike-bar-mdcm .like {
        height: 100%;
        background: #22c55e;
        float: left;
      }
      #yt-like-dislike-bar-mdcm .dislike {
        height: 100%;
        background: #ef4444;
        float: left;
      }

        .progress-retry-btn {
          position: absolute;
          top: 8px;
          left: 8px;
          right: auto;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .progress-retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .download-again-btn {
          position: absolute;
          top: 8px;
          left: 8px;
          right: auto;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.35);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .download-again-btn:hover {
          background: rgba(34, 197, 94, 0.5);
          transform: scale(1.1);
        }

        .download-container {
          position: relative;
        }

        .download-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .download-btn {
          flex: 1;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .download-btn.video-btn {
          background: linear-gradient(135deg, #ff6666, #ff4444);
        }

        .download-btn.audio-btn {
          background: linear-gradient(135deg, #00dd55, #00cc44);
        }

        .download-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .download-info {
          padding-left: 28px !important; /* Space for buttons on the left */
        }

        .download-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .retry-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #ffaa00, #ff8800);
          color: white;
        }

        .retry-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

      body {
      padding: 0;
      margin: 0;
      overflow-y: scroll;
      overflow-x: hidden;
      }
      .style-scope.ytd-comments {
      overflow-y: auto;
      overflow-x: hidden;
      height: auto;
      }
      ytd-comment-view-model[is-reply] #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model, ytd-comment-view-model[is-creator-reply] #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
        #author-thumbnail img.yt-img-shadow {
        border-radius: 50% !important;
        }
        #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: visible;
        }
      ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer {
        --ytd-item-section-item-margin: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        height: auto;
      }
      .right-section.ytcp-header {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 45px;
      justify-content: end;
    }
      #meta.ytd-playlist-panel-video-renderer {
    min-width: 0;
    padding: 0 8px;
    /* display: flexbox; */
    display: flex;
    flex-direction: column-reverse;
    flex: 1;
    flex-basis: 0.000000001px;
}

    .containerall {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding-bottom: 30px;
      max-width: 800px;
      margin: auto;
    }
    .container .botoncalidades {
      margin: 3px 2px;
      width: 24.6%;
    }

    .botoncalidades:first-child {
      background-color: #0af;
    }

    .botoncalidades:last-child {
      background-color: red;
      width: 100px;
    }

    .selectcalidades,
    .botoncalidades,
    .selectcalidadesaudio {
      width: 50%;
      height: 27.8px;
      background-color: #fff;
      color: #000;
      font-size: 25px;
      text-align: center;
      border: 1px solid black;
      border-radius: 10px;
      border: none;
      font-size: 20px;
      margin: 2px 2px;
    }

    .botoncalidades {
      width: 70px;
      height: 30px;
      background-color: rgb(4, 156, 22);
      border: 0px solid #000;
      color: #fff;
      font-size: 20px;
      border-radius: 10px;
      margin: 2px 2px;
    }

    .botoncalidades:hover,
    .bntcontainer:hover {
      cursor: pointer;
    }

   .ocultarframe,
    .ocultarframeaudio {
      display: none;
    }
      .checked_updates {
      cursor: pointer;
      }

      #export-config, #import-config {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background-color: var(--yt-enhance-menu-accent, var(--primary-custom)) !important;
        color: #ffffff;
        border: none;
        padding: 5px;
      }
        #export-config:hover, #import-config:hover {
          background-color: #ff0000;
          color: #ffffff;
          cursor: pointer;
        }

        .yt-image-avatar-download {
          position: absolute;
          bottom: -10px;
          right: -14px;
          border: none;
          z-index: 1000;
          background: transparent;
          filter: drop-shadow(1px 0 6px red);
          color: var(--ytcp-text-primary);
          cursor: pointer;
        }

        .custom-classic-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255,255,255,0.1);
          border-radius: 50%;
          border: none;
          width: 48px;
          height: 48px;
          color: var(--yt-spec-icon-inactive);
          font-size: 24px;
          margin: 0px 8px;
          cursor: pointer;
        }
        .custom-classic-btn:hover {
          background-color: rgba(255,255,255,0.2);
        }
        .background-image-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin: 10px 0;
      }

      .background-image-preview {
        width: 160px;
        height: 90px;
        border-radius: 10px;
        background-size: cover;
        background-position: center;
        border: 2px solid #444;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        overflow: hidden;
      }

      .background-image-preview:hover .background-image-overlay {
        opacity: 1;
      }

      .background-image-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        background: rgba(0,0,0,0.35);
        font-size: 18px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }

      .background-image-preview:hover .background-image-overlay,
      .background-image-preview:focus .background-image-overlay {
        opacity: 1;
      }

      .background-image-overlay i {
        font-size: 28px;
        margin-bottom: 4px;
      }

      .background-image-text {
        font-size: 13px;
        font-weight: 500;
        text-shadow: 0 1px 4px #000;
      }

      .remove-background-image {
        position: absolute;
        top: 6px;
        right: 6px;
        background: #e74c3c;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        font-size: 18px;
        cursor: pointer;
        z-index: 2;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: background 0.2s;
      }
      .remove-background-image:hover {
        background: #c0392b;
      }
      .background-image-preview.has-image .remove-background-image {
        display: flex;
      }

      ytd-feed-filter-chip-bar-renderer[not-sticky] #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
        padding: 10px;
      }
      .text-description-download {
        font-size: 12px;
        text-align: center;
        margin-top: 10px;
        }
        /* === FIX: Căn giữa thanh công cụ khi bật Cinematic Mode === */
    ytd-watch-flexy[cinematic-container-initialized] #primary-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ytd-watch-flexy[cinematic-container-initialized] .yt-tools-container {
      /* Đảm bảo thanh công cụ không bị quá rộng so với video */
      width: 100%;
      max-width: var(--ytd-watch-flexy-max-player-width, 1280px);
    }

    /* === YouTube Music specific styles === */
    #ytm-side-panel-wrapper {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      margin: 0 0 12px 0 !important;
      padding: 4px 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      border-radius: 16px !important;
    }

    ytmusic-player-page #side-panel {
      margin-left: 16px !important;
      padding: 0 !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .ytm-side-panel-divider {
      width: 92%;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 4px 0;
    }

    /* Blur Mode (Standard with subtle blur) */
    body.ytm-style-blur #ytm-side-panel-wrapper,
    body.ytm-style-blur ytmusic-player-page #side-panel ytmusic-tab-renderer {
      background: rgba(20, 20, 20, 0.6) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
      border-radius: 16px !important;
    }

    /* Liquid Mode (Fixed Apple Style) */
    body.ytm-style-liquid #ytm-side-panel-wrapper,
    body.ytm-style-liquid ytmusic-player-page #side-panel ytmusic-tab-renderer {
      background: rgba(25, 25, 25, 0.45) !important;
      backdrop-filter: blur(24px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
      border-radius: 16px !important;
    }

    /* Transparent Mode */
    body.ytm-style-transparent #ytm-side-panel-wrapper,
    body.ytm-style-transparent ytmusic-player-page #side-panel ytmusic-tab-renderer {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Inner Container Resets */
    html[dark] .yt-tools-container,
    ytmusic-app .yt-tools-container,
    ytmusic-app #side-panel ytmusic-tab-renderer,
    ytmusic-app ytmusic-search-box,
    ytmusic-app #side-panel > .tab-header-container,
    tp-yt-paper-tabs.tab-header-container,
    #tabsContainer.tp-yt-paper-tabs,
    tp-yt-paper-tab.tab-header,
    .tab-content.tp-yt-paper-tab {
      background: transparent !important;
      background-color: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
    }

    .yt-tools-container {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 8px 0 !important;
    }

    .tab-header-container {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 4px 0 !important;
    }

    /* Fix YTM side-panel queue layout */
    ytmusic-app #side-panel {
      padding: 8px 12px;
      box-sizing: border-box;
    }
    ytmusic-app #side-panel ytmusic-queue-header-renderer .container-name {
      padding: 0 8px;
    }
    ytmusic-app #side-panel ytmusic-player-queue-item .song-info {
      padding-right: 4px;
    }
    ytmusic-app #side-panel ytmusic-tab-renderer {
      border-radius: 16px !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 12px 0 12px 12px !important;
    }

    /* Make the YTM Search Box premium and glassmorphic (Feature requested by user) */
    ytmusic-app ytmusic-search-box {
      border-radius: 16px !important;
    }
    html[dark] ytmusic-app ytmusic-search-box #input-box,
    ytmusic-app ytmusic-search-box #input-box {
      background: transparent !important;
    }

    /* Tab headers — rounded corners & spacing */
    ytmusic-app #side-panel > .tab-header-container {
      border-radius: 16px !important;
      overflow: hidden !important;
      padding: 4px 8px;
      margin: 0 0 8px 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    /* Compact button layout for narrow YTM side panel */
    ytmusic-app .containerButtons {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    ytmusic-app .botones_div {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #fff !important;
      border-radius: 6px !important;
      padding: 5px 7px !important;
      transition: all 0.2s ease !important;
      line-height: 1 !important;
    }
    ytmusic-app .botones_div svg {
      width: 18px !important;
      height: 18px !important;
    }

    ytmusic-app .botones_div:hover {
      background: rgba(255, 0, 0, 0.25) !important;
      border-color: rgba(255, 0, 0, 0.4) !important;
      transform: translateY(-1px);
    }

    ytmusic-player-page #side-panel select,
    ytmusic-player-page #side-panel select option {
      background: #282828 !important;
      color: #fff !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    ytmusic-app .selectcalidades,
    ytmusic-app .selectcalidadesaudio {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 6px !important;
      padding: 5px 8px !important;
      font-size: 12px !important;
      width: 100% !important;
      cursor: pointer !important;
      outline: none !important;
    }

    ytmusic-app .download-container {
      width: 100% !important;
      background: rgba(0, 0, 0, 0.3) !important;
      border-radius: 6px !important;
      position: relative !important; /* Fix absolute positioned buttons (Retry/Again) */
      padding: 10px !important;
      box-sizing: border-box !important;
    }

    ytmusic-app .content_collapsible_colors {
      margin-top: 6px !important;
    }

    ytmusic-app #toggle-button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 8px;
      margin-right: 4px;
    }

    ytmusic-app #icon-menu-settings {
      color: #fff;
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    ytmusic-app #icon-menu-settings:hover {
      transform: rotate(90deg);
      color: #ff4444;
    }
    `);


  // botons bottom video player

  const thumbnailVideo = `
  <button title="Image video" class="botones_div" type="button" id="imagen">

  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-photo-down" width="24"
    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M15 8h.01"></path>
    <path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5"></path>
    <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4"></path>
    <path d="M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559"></path>
    <path d="M19 16v6"></path>
    <path d="M22 19l-3 3l-3 -3"></path>
  </svg>
</button>
  `;

  const repeatVideo = `
  <button title="Repeat video" class="botones_div" type="button" id="repeatvideo">

  <svg  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat" width="24"
    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
  </svg>
</button>
  `;

  const downloadMP4Mp3 = `
  <button title="MP4" type="button" class="btn1 botones_div">
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-download"
    width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
    <path d="M12 17v-6"></path>
    <path d="M9.5 14.5l2.5 2.5l2.5 -2.5"></path>
  </svg>
</button>
<button title="MP3" type="button" class="btn2 botones_div">

  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-music" width="24"
    height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
    stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
    <path d="M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
    <path d="M12 16l0 -5l2 1"></path>
  </svg>
</button>
<button title="Close" type="button" class="btn3 botones_div">
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-x" width="24"
  height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
  stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
  <path d="M10 10l4 4m0 -4l-4 4"></path>
</svg>
</button>
  `;

  const pictureToPicture = `
  <button title="Picture to picture" type="button" class="video_picture_to_picture botones_div">

  <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4" /><path d="M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" /></svg>
</button>

  `;
  const screenShot = `
  <button title="Screenshot video" type="button" class="screenshot_video botones_div">
  <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644" /><path d="M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644" /><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /></svg>
</button>

  `;

  const bookmarkAddBtn = `
  <button title="Add bookmark" type="button" id="yt-bookmark-add" class="botones_div">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z" />
      <path d="M12 7v6" />
      <path d="M9 10h6" />
    </svg>
  </button>
  `;

  const bookmarkToggleBtn = `
  <button title="Show bookmarks" type="button" id="yt-bookmark-toggle" class="botones_div">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M5 6h.01" />
      <path d="M5 12h.01" />
      <path d="M5 18h.01" />
    </svg>
  </button>
  `;

  const continueWatchingHistoryBtn = `
  <button title="History" type="button" id="yt-cw-history-toggle" class="botones_div" style="display:none;">
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 8v4l3 3" />
      <path d="M3 12a9 9 0 1 0 3 -6.7" />
      <path d="M3 4v4h4" />
    </svg>
  </button>
  `;

  const menuBotones = `
    <main class="yt-tools-container">
    <div class="container">
    <form>
      <div class="containerButtons">
      ${thumbnailVideo}
      ${!isYTMusic ? repeatVideo : ''}
      ${bookmarkAddBtn}
      ${bookmarkToggleBtn}
      ${continueWatchingHistoryBtn}
      ${downloadMP4Mp3}
      ${pictureToPicture}
      ${screenShot}
      </div>
      <div id="yt-bookmarks-panel" class="yt-bookmarks-panel" style="display:none;"></div>
      <div id="yt-continue-watching-panel" class="yt-continue-watching-panel" style="display:none;"></div>
      <div>
      </div>
    </form>

    </div>
    <div class="content_collapsible_colors" style="margin-top: 10px">

    <form class="formulariodescarga ocultarframe" action="">
    <div class="containerall">
    <select class="selectcalidades ocultarframe" required>
      <option selected disabled>Video Quality</option>
      <option value="144">144p MP4</option>
      <option value="240">240p MP4</option>
      <option value="360">360p MP4</option>
      <option value="480">480p MP4</option>
      <option value="720">720p HD MP4 Default</option>
      <option value="1080">1080p FULL HD MP4</option>
      <option value="4k">2160p 4K WEBM</option>
      <option value="8k">4320p 8K WEBM</option>
      </select>
      <div id="descargando" class="download-container ocultarframe">
        <button class="progress-retry-btn" title="Retry" style="display: none;">
        <i class="fa-solid fa-rotate-right"></i>
        </button>
        <button class="download-again-btn" title="Download again" style="display: none;">
        <i class="fa-solid fa-download"></i>
        </button>
        <div class="download-info">
          <span class="download-text">Download Video And Please Wait...</span>
          <span class="download-quality"></span>
        </div>
        <div class="download-actions">
          <button class="download-btn video-btn">Download</button>
          <button class="retry-btn" style="display: none;">Retry</button>
        </div>
        <div class="progress-container" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">0%</span>
        </div>
        <div class="download-footer">
          <a href="https://github.com/akari310/" target="_blank"> <i class="fa-brands fa-github"></i> by: Akari</a>
        </div>
        <h1 class="text-description-download">
          <span >Enable pop-ups on YouTube to download audio or video</span>
        </h1>
      </div>
    </div>
    </form>
    <form class="formulariodescargaaudio ocultarframe" action="">
    <div class="containerall">
    <select class="selectcalidadesaudio ocultarframeaudio" required>
      <option selected disabled>Audio Quality</option>
      <option value="flac">Audio FLAC UHQ</option>
      <option value="wav">Audio WAV UHQ</option>
      <option value="webm">Audio WEBM UHQ</option>
      <option value="mp3">Audio MP3 Default</option>
      <option value="m4a">Audio M4A</option>
      <option value="aac">Audio AAC</option>
      <option value="opus">Audio OPUS</option>
      <option value="ogg">Audio OGG</option>
      </select>
      <div id="descargandomp3" class="download-container ocultarframeaudio">
        <button class="progress-retry-btn" title="Retry" style="display: none;">
        <i class="fa-solid fa-rotate-right"></i>
        </button>
        <button class="download-again-btn" title="Download again" style="display: none;">
        <i class="fa-solid fa-download"></i>
        </button>
        <div class="download-info">
          <span class="download-text">Download Audio And Please Wait...</span>
          <span class="download-quality"></span>
        </div>
        <div class="download-actions">
          <button class="download-btn audio-btn">Download</button>
          <button class="retry-btn" style="display: none;">Retry</button>
        </div>
        <div class="progress-container" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">0%</span>
        </div>
         <div class="download-footer">
          <a href="https://github.com/akari310/" target="_blank"><i class="fa-brands fa-github"></i> by: Akari</a>
        </div>
         <h1 class="text-description-download">
          <span >Enable pop-ups on YouTube to download audio or video</span>
        </h1>
      </div>
    </div>
    </form>
      </main>
  `;



  // Define themes
  const themes = [{
    name: 'Default / Reload',
    gradient: '',
    textColor: '',
    raised: '',
    btnTranslate: '',
    CurrentProgressVideo: '',
    videoDuration: '',
    colorIcons: '',
    textLogo: '',
    primaryColor: '',
    secondaryColor: '',
  }, {
    name: 'Midnight Blue',
    gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    textColor: '#ffffff',
    raised: '#f00',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Forest Green',
    gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Sunset Orange',
    gradient: 'linear-gradient(135deg, #7c2d12, #f97316)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Royal Purple',
    gradient: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Cherry Blossom',
    gradient: 'linear-gradient(135deg, #a9005c, #fc008f)',
    textColor: '#ffffff',
    raised: '#fc008f',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Red Dark',
    gradient: 'linear-gradient(135deg, #790909, #f70131)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Raind ',
    gradient: 'linear-gradient(90deg, #3f5efb 0%, #fc466b) 100%',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Neon',
    gradient: 'linear-gradient(273deg, #ee49fd 0%, #6175ff 100%)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Azure',
    gradient: 'linear-gradient(273deg, #0172af 0%, #74febd 100%)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Butterfly',
    gradient: 'linear-gradient(273deg, #ff4060 0%, #fff16a 100%)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  }, {
    name: 'Colombia',
    gradient: 'linear-gradient(174deg, #fbf63f  0%, #0000bb 45%, #ff0000 99%)',
    textColor: '#ffffff',
    raised: '#303131',
    btnTranslate: '#000',
    CurrentProgressVideo: '#0f0',
    videoDuration: '#fff',
    colorIcons: '#fff',
    textLogo: '#f00',
  },];

  // Create our enhancement panel
  const panel = $cl('div');

  panel.id = 'yt-enhancement-panel';

  // Generate theme options HTML
  const themeOptionsHTML = themes
    .map(
      (theme, index) => `
        <label >
          <div class="theme-option">
          <div class="theme-preview" style="background: ${theme.gradient};"></div>
          <input type="radio" name="theme" value="${index}" ${index === 0 ? 'checked' : ''
        }>
              <span style="${theme.name === 'Default / Reload Page' ? 'color: red; ' : ''}" class="theme-name">${theme.name}</span>
              </div>
        </label>
    `
    )
    .join('');

  const languageOptionsHTML = Object.entries(languagesTranslate)
    .map(([code, name]) => {
      const selected = code === languagesTranslate ? 'selected' : '';
      return `<option value="${code}" ${selected}>${name}</option>`;
    })
    .join('');



  function checkDarkModeActive() {
    // YTM is always dark mode
    if (isYTMusic) return 'dark';

    const prefCookie = document.cookie.split('; ').find(c => c.startsWith('PREF='));
    if (!prefCookie) return 'light';

    const prefValue = prefCookie.substring(5);
    const params = new URLSearchParams(prefValue);

    const f6Value = params.get('f6');
    const darkModes = ['400', '4000000', '40000400', '40000000'];

    return darkModes.includes(f6Value) ? 'dark' : 'light';
  }


  let isDarkModeActive = checkDarkModeActive();


  // Use Trusted Types to set innerHTML
  const menuHTML = `
   <div class="container-mdcm">
    <div class="header-mdcm">
      <h1> <i class="fa-brands fa-youtube"></i> YouTube Tools</h1>
      <div class="icons-mdcm">
        <a href="https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js"
          target="_blank">
          <button class="icon-btn-mdcm">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </a>
        <a href="https://github.com/akari310" target="_blank">
          <button class="icon-btn-mdcm">
            <i class="fa-brands fa-github"></i>
          </button>
        </a>
        <button class="icon-btn-mdcm" id="shareBtn-mdcm">
          <i class="fa-solid fa-share-alt"></i>
        </button>
        <button class="icon-btn-mdcm" id="importExportBtn">
          <i class="fa-solid fa-file-import"></i>
        </button>
        <button id="menu-settings-icon" class="icon-btn-mdcm tab-mdcm" data-tab="menu-settings">
          <i class="fa-solid fa-gear"></i>
        </button>
        <button class="icon-btn-mdcm close_menu_settings">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <div class="tabs-mdcm">
      <button class="tab-mdcm active" data-tab="general">
        <i class="fa-solid fa-shield-halved"></i>
        General
      </button>
      <button class="tab-mdcm" data-tab="themes">
        <i class="fa-solid fa-palette"></i>
        Themes
      </button>
      <button class="tab-mdcm" data-tab="stats">
        <i class="fa-solid fa-square-poll-vertical"></i>
        Stats
      </button>
      <button class="tab-mdcm" data-tab="headers">
        <i class="fa-regular fa-newspaper"></i>
        Header
      </button>
    </div>


    <div id="general" class="tab-content active">

      <div class="options-mdcm">
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="hide-comments-toggle"> Hide Comments
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="hide-sidebar-toggle"> Hide Sidebar
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="autoplay-toggle"> Disable Autoplay
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="subtitles-toggle"> Disable Subtitles
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="dislikes-toggle"> Show Dislikes
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="like-dislike-bar-toggle"> Like vs Dislike bar
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="bookmarks-toggle"> Bookmarks (timestamps)
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="continue-watching-toggle"> Continue watching
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="shorts-channel-name-toggle"> Shorts: show channel name
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="themes-toggle"> Active Themes
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="translation-toggle"> Translate comments
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="avatars-toggle"> Download avatars
          </div>
        </label>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="reverse-mode-toggle"> Reverse mode
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="cinematic-lighting-toggle"> ${isYTMusic ? 'Ambient Mode' : 'Cinematic Mode'}
          </div>
        </label>
        <label>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" checked id="wave-visualizer-toggle"> Wave visualizer Beta
          </div>
        </label>
        <label ${!isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="custom-timeline-color-toggle"> Royal Purple Timeline
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2; ${!isYTMusic ? 'display:none' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Side Panel Style (YTM):
              <select class="tab-button-active" id="side-panel-style-select">
                <option value="blur">Blur</option>
                <option value="liquid">Liquid Glass</option>
                <option value="transparent">Transparent</option>
              </select>
            </label>
          </div>
        </div>
        <label ${isYTMusic ? 'style="display:none"' : ''}>
          <div class="option-mdcm">
            <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle"> Sync Ambient Mode YT
          </div>
        </label>
        <div class="quality-selector-mdcm" style="grid-column: span 2;">
          <div class="select-wrapper-mdcm">
            <label>Effect wave visualizer:
              <select class="tab-button-active" id="select-wave-visualizer-select">
                <option value="linea">Line smooth</option>
                <option value="barras">Vertical bars</option>
                <option value="curva">Curved</option>
                <option value="picos">Smooth peaks</option>
                <option value="solida">Solid wave</option>
                <option value="dinamica">Dynamic wave</option>
                <option value="montana">Smooth mountain</option>
              </select>
            </label>
          </div>
        </div>
        <div class="quality-selector-mdcm" style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Default video player quality:
              <select class="tab-button-active" id="select-video-qualitys-select">
                <option value="user">User Default</option>
                <option value="">Auto</option>
                <option value="144">144</option>
                <option value="240">240</option>
                <option value="360">360</option>
                <option value="480">480</option>
                <option value="720">720</option>
                <option value="1080">1080</option>
                <option value="1440">1440</option>
                <option value="2160">2160</option>
              </select>
            </label>
          </div>
        </div>
        <div class="quality-selector-mdcm" style="grid-column: span 2;${isYTMusic ? ' display:none;' : ''}">
          <div class="select-wrapper-mdcm">
            <label>Language for translate comments:
              <select class="tab-button-active" id="select-languages-comments-select">
              ${languageOptionsHTML}
              </select>
            </label>
          </div>
        </div>
        <div class="slider-container-mdcm" style="grid-column: span 2;">
          <label>Video Player Size: <span id="player-size-value">100</span>%</label>
          <input type="range" id="player-size-slider" class="slider-mdcm" min="50" max="150" value="100">
          <button class="reset-btn-mdcm" id="reset-player-size">Reset video size</button>
        </div>
      </div>
    </div>

    <div id="themes" class="tab-content">
     <div id="background-image-container" class="background-image-container">
     <h4>Background Image</h4>
  <input type="file" id="background_image" accept="image/png, image/jpeg" style="display:none;" />
  <div id="background-image-preview" class="background-image-preview">
    <span class="background-image-overlay">
      <i class="fa fa-camera"></i>
      <span class="background-image-text">Select image</span>
    </span>
    <button id="remove-background-image" class="remove-background-image" title="Quitar fondo">&times;</button>
  </div>
</div>
      <div class="themes-hidden">
        <div class="options-mdcm" style="margin-bottom: 10px;">
          <div>
            <h4>Choose a Theme</h4>
            <p>Disable Mode Cinematic on General</p>
            ${isDarkModeActive === 'dark' ? '' : '<p style="color: red; margin: 10px 0;font-size: 11px;">Activate dark mode to use this option</p>'}
          </div>
        </div>
        <div class="options-mdcm">
          <label>
            <div class="theme-option option-mdcm">
              <input type="radio" class="radio-mdcm" name="theme" value="custom" checked>
              <span class="theme-name">Custom</span>
            </div>
          </label>
          <label>
            <div class="theme-option option-mdcm theme-selected-normal">
              <input type="radio" class="radio-mdcm" name="theme" value="normal">
              <span class="theme-name">Selected Themes</span>
            </div>
          </label>
        </div>
        <div class="themes-options">
          <div class="options-mdcm">
            ${themeOptionsHTML}
          </div>
        </div>
        <div class="theme-custom-options">
          <div class="options-mdcm">
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Progressbar Video:</label>
                <input type="color" id="progressbar-color-picker" class="color-picker-mdcm" value="#ff0000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Background Color:</label>
                <input type="color" id="bg-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Primary Color:</label>
                <input type="color" id="primary-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Secondary Color:</label>
                <input type="color" id="secondary-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Header Color:</label>
                <input type="color" id="header-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Icons Color:</label>
                <input type="color" id="icons-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Menu Color:</label>
                <input type="color" id="menu-color-picker" class="color-picker-mdcm" value="#000000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Line Color Preview:</label>
                <input type="color" id="line-color-picker" class="color-picker-mdcm" value="#ff0000">
              </div>
            </div>
            <div class="option-mdcm">
              <div class="card-items-end">
                <label>Time Color Preview:</label>
                <input type="color" id="time-color-picker" class="color-picker-mdcm" value="#ffffff">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="stats" class="tab-content">
      <div id="yt-stats-toggle">
        <div class="stat-row">
          <div>Foreground Time</div>
          <div class="progress">
            <div class="progress-bar total-bar" id="usage-bar"></div>
          </div>
          <div id="total-time">0h 0m 0s</div>
        </div>
        <div class="stat-row">
          <div>Video Time</div>
          <div class="progress">
            <div class="progress-bar video-bar" id="video-bar"></div>
          </div>
          <div id="video-time">0h 0m 0s</div>
        </div>
        <div class="stat-row">
          <div>Shorts Time</div>
          <div class="progress">
            <div class="progress-bar shorts-bar" id="shorts-bar"></div>
          </div>
          <div id="shorts-time">0h 0m 0s</div>
        </div>
      </div>
    </div>

    <div id="headers" class="tab-content">
      <div class="options-mdcm">
        <label>Available in next update</label>
      </div>
    </div>


    <div id="menu-settings" class="tab-content">
      <div class="options-mdcm">
        <h4 style="margin: 10px 0">Menu Appearance</h4>
      </div>
      <div class="options-settings-mdcm">
        <div class="option-settings-mdcm">
          <label>Backgrounds:</label>
          <div class="color-boxes" id="bg-color-options">
            <div class="color-box" data-type="bg" data-value="#252525" style="background-color: #252525;"></div>
            <div class="color-box" data-type="bg" data-value="#1e1e1e" style="background-color: #1e1e1e;"></div>
            <div class="color-box" data-type="bg" data-value="#3a3a3a" style="background-color: #3a3a3a;"></div>
            <div class="color-box" data-type="bg" data-value="#4a4a4a" style="background-color: #4a4a4a;"></div>
            <div class="color-box" data-type="bg" data-value="#000000" style="background-color: #000000;"></div>
            <div class="color-box" data-type="bg" data-value="#00000000" style="background-color: #00000000;"></div>
            <div class="color-box" data-type="bg" data-value="#2d2d2d" style="background-color: #2d2d2d;"></div>
            <div class="color-box" data-type="bg" data-value="#444" style="background-color: #444;"></div>
          </div>
        </div>

        <div class="option-settings-mdcm">
          <label>Accent Colors:</label>
          <div class="color-boxes" id="bg-accent-color-options">
            <div class="color-box" data-type="accent" data-value="#ff0000" style="background-color: #ff0000;"></div>
            <div class="color-box" data-type="accent" data-value="#000000" style="background-color: #000000;"></div>
            <div class="color-box" data-type="accent" data-value="#009c37 " style="background-color: #009c37 ;"></div>
            <div class="color-box" data-type="accent" data-value="#0c02a0 " style="background-color: #0c02a0 ;"></div>
          </div>
        </div>

        <div class="option-settings-mdcm">
          <label>Titles Colors:</label>
          <div class="color-boxes" id="text-color-options">
            <div class="color-box" data-type="color" data-value="#ffffff" style="background-color: #ffffff;"></div>
            <div class="color-box" data-type="color" data-value="#cccccc" style="background-color: #cccccc;"></div>
            <div class="color-box" data-type="color" data-value="#b3b3b3" style="background-color: #b3b3b3;"></div>
            <div class="color-box" data-type="color" data-value="#00ffff" style="background-color: #00ffff;"></div>
            <div class="color-box" data-type="color" data-value="#00ff00" style="background-color: #00ff00;"></div>
            <div class="color-box" data-type="color" data-value="#ffff00" style="background-color: #ffff00;"></div>
            <div class="color-box" data-type="color" data-value="#ffcc00" style="background-color: #ffcc00;"></div>
            <div class="color-box" data-type="color" data-value="#ff66cc" style="background-color: #ff66cc;"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="importExportArea">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3>Import / Export Settings</h3>
        <button class="icon-btn-mdcm" id="closeImportExportBtn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <textarea id="config-data" placeholder="Paste configuration here to import"></textarea>
      <div class="action-buttons-mdcm">
        <button id="export-config" class="action-btn-mdcm">Export</button>
        <button id="import-config" class="action-btn-mdcm">Import</button>
      </div>
    </div>

    <div id="shareDropdown">
      <a href="https://www.facebook.com/sharer/sharer.php?u=${urlSharedCode}" target="_blank" data-network="facebook"
        class="share-link"><i class="fa-brands fa-facebook"></i> Facebook</a><br>
      <a href="https://twitter.com/intent/tweet?url=${urlSharedCode}" target="_blank" data-network="twitter"
        class="share-link"><i class="fa-brands fa-twitter"></i> Twitter</a><br>
      <a href="https://api.whatsapp.com/send?text=${urlSharedCode}" target="_blank" data-network="whatsapp"
        class="share-link"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a><br>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${urlSharedCode}" target="_blank"
        data-network="linkedin" class="share-link"><i class="fa-brands fa-linkedin"></i> LinkedIn</a><br>
    </div>


  </div>
  <div class="actions-mdcm">
    <div class="developer-mdcm">
      Developed by <a href="https://github.com/akari310" target="_blank"> <i class="fa-brands fa-github"></i> Akari</a>
    </div>
    <span style="color: #fff" ;>v0.0.0.3</span>
  </div>
  `;
  panel.innerHTML = safeHTML(menuHTML);

  $ap(panel);


  function addIcon() {
    if ($id('icon-menu-settings')) return;

    let anchor;
    if (isYTMusic) {
      // YouTube Music: insert into the right side of the nav bar
      anchor = $e('#right-content');
    } else {
      // Regular YouTube: insert before the topbar menu button
      anchor = $e('ytd-topbar-menu-button-renderer');
    }
    if (!anchor) return;

    const toggleButton = $cl('div');
    toggleButton.id = 'toggle-button';

    const icon = $cl('i');
    icon.id = 'icon-menu-settings';
    icon.classList.add('fa-solid', 'fa-gear');

    toggleButton.appendChild(icon);

    if (isYTMusic) {
      // On YTM, prepend inside the right-content container
      anchor.insertBefore(toggleButton, anchor.firstChild);
    } else {
      // On YT, insert before the topbar button
      anchor.parentElement.insertBefore(toggleButton, anchor);
    }

    // Toggle panel visibility
    toggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  let openMenu = false;
  function toggleMenu() {
    openMenu = !openMenu;
    panel.style.display = openMenu ? 'block' : 'none';
  }

  // Close panel when clicking outside
  document.addEventListener('click', (event) => {
    const toggleButton = $id('toggle-button');
    if (openMenu && !panel.contains(event.target) && (!toggleButton || !toggleButton.contains(event.target))) {
      toggleMenu();
    }
  });


  addIcon();
  const close_menu_settings = $e('.close_menu_settings');
  if (close_menu_settings) {
    close_menu_settings.addEventListener('click', () => {
      toggleMenu();
    });
  }

  // $ap(toggleButton);



  // Tab functionality
  const tabButtons = $m('.tab-mdcm');
  const tabContents = $m('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));
      button.classList.add('active');
      $id(tabName).classList.add('active');
    });
  });

  // Function to save settings
  function saveSettings() {
    const settings = {
      theme: $e('input[name="theme"]:checked').value,
      bgColorPicker: $id('bg-color-picker').value,
      progressbarColorPicker: $id('progressbar-color-picker').value,
      primaryColorPicker: $id('primary-color-picker').value,
      secondaryColorPicker: $id('secondary-color-picker').value,
      headerColorPicker: $id('header-color-picker').value,
      iconsColorPicker: $id('icons-color-picker').value,
      menuColorPicker: $id('menu-color-picker').value,
      lineColorPicker: $id('line-color-picker').value,
      timeColorPicker: $id('time-color-picker').value,
      dislikes: $id('dislikes-toggle').checked,
      likeDislikeBar: $id('like-dislike-bar-toggle').checked,
      bookmarks: $id('bookmarks-toggle').checked,
      continueWatching: $id('continue-watching-toggle').checked,
      shortsChannelName: $id('shorts-channel-name-toggle').checked,
      themes: $id('themes-toggle').checked,
      translation: $id('translation-toggle').checked,
      avatars: $id('avatars-toggle').checked,
      reverseMode: $id('reverse-mode-toggle').checked,
      waveVisualizer: $id('wave-visualizer-toggle').checked,
      waveVisualizerSelected: $id('select-wave-visualizer-select').value,
      hideComments: $id('hide-comments-toggle').checked,
      hideSidebar: $id('hide-sidebar-toggle').checked,
      disableAutoplay: $id('autoplay-toggle').checked,
      cinematicLighting: $id('cinematic-lighting-toggle').checked,
      syncCinematic: $id('sync-cinematic-toggle') ? $id('sync-cinematic-toggle').checked : false, // NUEVO SETTING
      sidePanelStyle: $id('side-panel-style-select') ? $id('side-panel-style-select').value : 'normal',
      customTimelineColor: $id('custom-timeline-color-toggle') ? $id('custom-timeline-color-toggle').checked : false,
      disableSubtitles: $id('subtitles-toggle') ? $id('subtitles-toggle').checked : false,
      // fontSize: $id('font-size-slider').value,
      playerSize: $id('player-size-slider').value,
      selectVideoQuality: $id('select-video-qualitys-select').value,
      languagesComments: $id('select-languages-comments-select').value,
      // menuBgColor: $id('menu-bg-color-picker').value,
      // menuTextColor: $id('menu-text-color-picker').value,
      menu_akari: {
        bg: selectedBgColor,
        color: selectedTextColor,
        accent: selectedBgAccentColor
      }
      // menuFontSize: $id('menu-font-size-slider').value,
    };

    GM_setValue(SETTINGS_KEY, JSON.stringify(settings));
  }



  // Function to load settings
  function loadSettings() {
    const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
    // Mark as loaded early so applySettings/saveSettings don't overwrite persisted values with defaults.
    __ytToolsRuntime.settingsLoaded = true;

    if (settings.theme) {
      $e(`input[name="theme"][value="${settings.theme}"]`).checked = true;
    }
    const menuData = settings.menu_akari || settings.menu_developermdcm || {
      bg: "#252525",
      color: "#ffffff",
      accent: "#ff0000"
    };

    $id('bg-color-picker').value = settings.bgColorPicker || '#000000';
    $id('progressbar-color-picker').value = settings.progressbarColorPicker || '#ff0000';
    $id('primary-color-picker').value = settings.primaryColorPicker || '#ffffff';
    $id('secondary-color-picker').value = settings.secondaryColorPicker || '#ffffff';
    $id('header-color-picker').value = settings.headerColorPicker || '#000';
    $id('icons-color-picker').value = settings.iconsColorPicker || '#ffffff';
    $id('menu-color-picker').value = settings.menuColorPicker || '#000';
    $id('line-color-picker').value = settings.lineColorPicker || '#ff0000';
    $id('time-color-picker').value = settings.timeColorPicker || '#ffffff';
    $id('dislikes-toggle').checked = settings.dislikes || false;
    $id('like-dislike-bar-toggle').checked = settings.likeDislikeBar || false;
    $id('bookmarks-toggle').checked = settings.bookmarks || false;
    $id('continue-watching-toggle').checked = settings.continueWatching || false;
    $id('shorts-channel-name-toggle').checked = settings.shortsChannelName || false;
    $id('themes-toggle').checked = settings.themes || false;
    $id('translation-toggle').checked = settings.translation || false;
    $id('avatars-toggle').checked = settings.avatars || false;
    $id('reverse-mode-toggle').checked = settings.reverseMode || false;
    $id('wave-visualizer-toggle').checked = settings.waveVisualizer || false;
    $id('select-wave-visualizer-select').value = settings.waveVisualizerSelected || 'dinamica';
    $id('hide-comments-toggle').checked = settings.hideComments || false;
    $id('hide-sidebar-toggle').checked = settings.hideSidebar || false;
    $id('autoplay-toggle').checked = settings.disableAutoplay || false;
    $id('cinematic-lighting-toggle').checked = settings.cinematicLighting || false;
    if ($id('sync-cinematic-toggle')) $id('sync-cinematic-toggle').checked = settings.syncCinematic || false;
    if ($id('side-panel-style-select')) $id('side-panel-style-select').value = settings.sidePanelStyle || 'blur';
    if ($id('custom-timeline-color-toggle')) $id('custom-timeline-color-toggle').checked = settings.customTimelineColor || false;
    if ($id('subtitles-toggle')) $id('subtitles-toggle').checked = settings.disableSubtitles || false;
    $id('player-size-slider').value = settings.playerSize || 100;
    $id('select-video-qualitys-select').value = settings.selectVideoQuality || 'user';
    $id('select-languages-comments-select').value = settings.languagesComments || 'en';

    selectedBgColor = menuData.bg;
    selectedTextColor = menuData.color;
    selectedBgAccentColor = menuData.accent;


    $m('#bg-color-options .color-box').forEach(el => {
      el.classList.toggle('selected', el.dataset.value === selectedBgColor);
    });

    $m('#text-color-options .color-box').forEach(el => {
      el.classList.toggle('selected', el.dataset.value === selectedTextColor);
    });

    $m('#bg-accent-color-options .color-box').forEach(el => {
      el.classList.toggle('selected', el.dataset.value === selectedBgAccentColor);
    });

    // Apply menu colors
    $sp('--yt-enhance-menu-bg', selectedBgColor);
    $sp('--yt-enhance-menu-text', selectedTextColor);
    $sp('--yt-enhance-menu-accent', selectedBgAccentColor);
    updateSliderValues();

    setTimeout(() => {
      applySettings();
      if (settings.dislikes && !isYTMusic) {
        videoDislike();
        shortDislike();
        showDislikes = true;
      }

      if (!isYTMusic && window.location.href.includes('youtube.com/watch?v=')) {
        detectInitialCinematicState();
      }
    }, 500);
  }

  // Check if the video is in cinematic mode
  async function detectInitialCinematicState() {
    return new Promise((resolve) => {
      const waitForVideo = () => {
        const video = $e('video');
        const cinematicDiv = $id('cinematics');

        if (!video || !cinematicDiv || isNaN(video.duration) || video.duration === 0) {
          setTimeout(waitForVideo, 500);
          return;
        }

        const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
        if (!settings.syncCinematic) {
          // apply cinematic toggle
          const cinematicToggle = $id('cinematic-lighting-toggle');
          if (cinematicToggle && cinematicDiv) {
            cinematicDiv.style.display = cinematicToggle.checked ? 'block' : 'none';
          }
          resolve(false);
          return;
        }

        const startTime = video.currentTime;
        const checkPlayback = () => {
          if (video.currentTime >= startTime + 1) {
            const isActive = isCinematicActive();

            const cinematicToggle = $id('cinematic-lighting-toggle');
            if (cinematicToggle && cinematicToggle.checked !== isActive) {
              cinematicToggle.checked = isActive;
              saveSettings();
            }

            resolve(isActive);
          } else {
            setTimeout(checkPlayback, 300);
          }
        };

        checkPlayback();
      };

      waitForVideo();
    });
  }

  $m('.color-box').forEach(box => {
    box.addEventListener('click', () => {
      const type = box.dataset.type;
      const value = box.dataset.value;

      if (type === 'bg') {
        selectedBgColor = value;
        $sp('--yt-enhance-menu-bg', value);
        $m('#bg-color-options .color-box').forEach(el => {
          el.classList.remove('selected');
        });
        box.classList.add('selected');
      } else if (type === 'color') {
        selectedTextColor = value;
        $sp('--yt-enhance-menu-text', value);
        $m('#text-color-options .color-box').forEach(el => {
          el.classList.remove('selected');
        });
        box.classList.add('selected');
      } else if (type === 'accent') {
        selectedBgAccentColor = value;
        $sp('--yt-enhance-menu-accent', value);
        $m('#bg-accent-color-options .color-box').forEach(el => {
          el.classList.remove('selected');
        });
        box.classList.add('selected');
      }
      saveSettings();
    });
  });


  function updateSliderValues() {
    $id('player-size-value').textContent = $id('player-size-slider').value;

  }

  $id('reset-player-size').addEventListener('click', () => {
    $id('player-size-slider').value = 100;
    updateSliderValues();
    applySettings();
  });

  // Initialize header buttons once
  function initializeHeaderButtons() {
    const shareBtn = $id('shareBtn-mdcm');
    const importExportBtn = $id('importExportBtn');
    const closeImportExportBtn = $id('closeImportExportBtn');

    if (shareBtn && !shareBtn.dataset.initialized) {
      shareBtn.dataset.initialized = 'true';
      shareBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        const dropdown = $id('shareDropdown');
        if (dropdown) {
          dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
      });
    }

    if (importExportBtn && !importExportBtn.dataset.initialized) {
      importExportBtn.dataset.initialized = 'true';
      importExportBtn.addEventListener('click', function () {
        const importExportArea = $id('importExportArea');
        if (importExportArea) {
          importExportArea.classList.toggle('active');
        }
      });
    }

    if (closeImportExportBtn && !closeImportExportBtn.dataset.initialized) {
      closeImportExportBtn.dataset.initialized = 'true';
      closeImportExportBtn.addEventListener('click', function () {
        const importExportArea = $id('importExportArea');
        if (importExportArea) {
          importExportArea.classList.remove('active');
        }
      });
    }
  }

  
