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
        #panel-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
            backdrop-filter: blur(2px);
        }
        #yt-enhancement-panel {
            z-index: 9999 !important;
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
