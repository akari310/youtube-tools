
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c6a977c5-8752-5488-8500-08814f067774")}catch(e){}}();
(function () {
  'use strict';

  
  let console;
  
  (function () {
    const preMessage = 'Ambient light for YouTube™ |';
  
    const enrich = (...args) => {
      if (args.length <= 0) return args;
  
      if (typeof args[0] === 'string') {
        const [firstArg, ...postArgs] = args;
        return [`${preMessage} ${firstArg}`, ...postArgs];
      }
  
      return [preMessage, ...args];
    };
  
    console = {
      log: (...args) => globalThis.console.log(...enrich(...args)),
      debug: (...args) => globalThis.console.debug(...enrich(...args)),
      warn: (...args) => globalThis.console.warn(...enrich(...args)),
      error: (...args) => globalThis.console.error(...enrich(...args)),
      dir: (...args) => globalThis.console.dir(...args),
    };
  })();


  let errorHandler = ex => {
    console.error(ex);
  };
  const setErrorHandler = handler => {
    errorHandler = handler;
  };
  const wrapErrorHandlerHandleError = (stack, ex, reportOnce, reported) => {
    if (reportOnce) {
      if (reported.includes(ex.message)) return;
      reported.push(ex.message);
    }
    appendErrorStack(stack, ex);
    if (errorHandler) errorHandler(ex);
  };
  const withErrorHandler = (callback, reportOnce, stack, reported) => {
    const callbackName = callback.name || 'anonymous';
    const container = {
      [callbackName]: (...args) => {
        try {
          return callback(...args);
        } catch (ex) {
          wrapErrorHandlerHandleError(stack, ex, reportOnce, reported);
        }
      }
    };
    return container[callbackName];
  };
  const withAsyncErrorHandler = (callback, reportOnce, stack, reported) => {
    const callbackName = callback.name || 'anonymous';
    const container = {
      [callbackName]: async (...args) => {
        try {
          return await callback(...args);
        } catch (ex) {
          wrapErrorHandlerHandleError(stack, ex, reportOnce, reported);
        }
      }
    };
    return container[callbackName];
  };
  const wrapErrorHandler = (callback, reportOnce = false) => (callback.constructor.name === 'AsyncFunction' ? withAsyncErrorHandler : withErrorHandler)(callback, reportOnce, new Error().stack, []);
  globalThis.matchMedia('(color-gamut: p3)').matches ? 'display-p3' : 'srgb';
  globalThis.matchMedia('(color-gamut: rec2020)').matches ? 'rec2020' : globalThis.matchMedia('(color-gamut: p3)').matches ? 'display-p3' : 'srgb';
  const appendErrorStack = (stack, ex) => {
    try {
      var _ref;
      const stackToAppend = stack === null || stack === void 0 ? void 0 : stack.substring((stack === null || stack === void 0 ? void 0 : stack.indexOf('\n')) + 1);
      const stackToSearch = stackToAppend === null || stackToAppend === void 0 ? void 0 : stackToAppend.substring((stackToAppend === null || stackToAppend === void 0 ? void 0 : stackToAppend.indexOf('\n')) + 1);
      const alreadyContainsStack = ((_ref = (ex === null || ex === void 0 ? void 0 : ex.stack) || (ex === null || ex === void 0 ? void 0 : ex.message) || (ex === null || ex === void 0 ? void 0 : ex.toString())) === null || _ref === void 0 ? void 0 : _ref.indexOf(stackToSearch)) !== -1;
      if (!alreadyContainsStack) {
        ex.stack = `${ex.stack || ex.message || ex.toString()}\n${stackToAppend}`;
      }
    } catch (ex) {
      console.warn(ex);
    }
  };
  const setStyleProperty = (elem, name, value, priority = '') => {
    const currentValue = elem.style.getPropertyValue(name) ?? '';
    const currentPriority = elem.style.getPropertyPriority(name) ?? '';
    if (currentValue === value && currentPriority === priority) return;
    elem.style.setProperty(name, value, priority);
  };

  const origin = 'https://www.youtube.com';
  const extensionId = 'youtube-ambient-light-extension';
  const isSameWindowMessage = event => event.source === window && event.origin === origin;

  class ContentScript {
    constructor() {
      this.globalListener = void 0;
      this.listeners = [];
      this.addMessageListener = (type, handler) => {
        if (!this.globalListener) {
          this.globalListener = wrapErrorHandler(function contentScriptMessageListenerGlobal(event) {
            if (!event.detail || typeof event.detail !== 'string') return;
            const detail = JSON.parse(event.detail);
            if (!isSameWindowMessage || (detail === null || detail === void 0 ? void 0 : detail.contentScript) !== extensionId || !(detail !== null && detail !== void 0 && detail.type)) return;
            for (const listener of this.listeners) {
              listener(detail);
            }
          }.bind(this), true);
          document.addEventListener('ytal-message', this.globalListener);
        }
        const listener = wrapErrorHandler(function contentScriptMessageListener(detail) {
          if (detail.type !== type) return;
          handler(detail === null || detail === void 0 ? void 0 : detail.message);
        }.bind(this), true);
        this.listeners.push(listener);
        return listener;
      };
      this.removeMessageListener = listener => {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
        if (this.globalListener && this.listeners.length === 0) {
          document.removeEventListener('ytal-message', this.globalListener, true);
          this.globalListener = undefined;
        }
      };
      this.postMessage = (type, message) => {
        const event = new CustomEvent('ytal-message', {
          detail: JSON.stringify({
            type,
            message,
            injectedScript: extensionId
          })
        });
        return document.dispatchEvent(event);
      };
    }
  }
  const contentScript = new ContentScript();

  let reporting = false;
  setErrorHandler(ex => {
    if (reporting) return;
    try {
      reporting = true;
      contentScript.postMessage('error', {
        name: ex.name,
        message: ex.message,
        stack: ex.stack,
        details: ex.details
      });
    } catch (reportEx) {
      console.warn('Failed to report error:', ex, 'innerError:', reportEx);
    } finally {
      reporting = false;
    }
  });
  const getElem = (() => {
    const elems = {};
    return name => {
      var _elems$name;
      if (!((_elems$name = elems[name]) !== null && _elems$name !== void 0 && _elems$name.isConnected)) {
        if (elems[name] && !elems[name].isConnected) {
          elems[name].dataset.ytalElem = name;
        }
        elems[name] = document.querySelector(`[data-ytal-elem="${name}"]`);
        if (elems[name]) {
          delete elems[name].dataset.ytalElem;
        }
      }
      return elems[name];
    };
  })();
  function updateTheme(toDark) {
    document.documentElement.toggleAttribute('dark', toDark);
    const ytdAppElem = getElem('ytd-app');
    if (ytdAppElem !== null && ytdAppElem !== void 0 && ytdAppElem.setMastheadTheme) {
      ytdAppElem.setMastheadTheme();
    }
  }
  contentScript.addMessageListener('update-theme', function onUpdateTheme(toDark) {
    updateTheme(toDark);
    contentScript.postMessage('update-theme');
  });
  const updateImmersiveMode = function updateImmersiveMode(enable, skipVideoPlayerSetSize = false) {
    const html = document.documentElement;
    const enabled = html.getAttribute('data-ambientlight-immersive') != null;
    if (enabled === enable) return;
    const scroll = {
      x: window.scrollX,
      y: window.scrollY
    };
    html.toggleAttribute('data-ambientlight-immersive', enable);
    const shift = enable ? 29 : -29;
    if (scroll.y > 50 && scroll.y < 100) {
      window.scrollTo(scroll.x, scroll.y += shift);
    }
    const ytdApp = getElem('ytd-app');
    if (ytdApp !== null && ytdApp !== void 0 && ytdApp.mastheadHeight) {
      var _ytdApp$updateMasthea;
      ytdApp.mastheadHeight += shift;
      (_ytdApp$updateMasthea = ytdApp.updateMastheadCssHeight) === null || _ytdApp$updateMasthea === void 0 ? void 0 : _ytdApp$updateMasthea.call(ytdApp);
    }
    if (!skipVideoPlayerSetSize && enabled !== enable) videoPlayerSetSize();
  };
  contentScript.addMessageListener('update-immersive-mode', function onUpdateImmersiveMode(enable) {
    updateImmersiveMode(enable);
    contentScript.postMessage('update-immersive-mode');
  });
  contentScript.addMessageListener('set-live-chat-theme', function seLiveChatTheme(toDark) {
    const liveChatElem = getElem('live-chat');
    if (!liveChatElem) return;
    liveChatElem.postToContentWindow({
      'yt-live-chat-set-dark-theme': toDark
    });
  });
  contentScript.addMessageListener('is-hdr-video', function isHdrVideo() {
    var _videoPlayerElem$getV, _videoPlayerElem$getV2;
    const videoPlayerElem = getElem('video-player');
    const isHdr = (videoPlayerElem === null || videoPlayerElem === void 0 ? void 0 : (_videoPlayerElem$getV = videoPlayerElem.getVideoData) === null || _videoPlayerElem$getV === void 0 ? void 0 : (_videoPlayerElem$getV2 = _videoPlayerElem$getV.call(videoPlayerElem)) === null || _videoPlayerElem$getV2 === void 0 ? void 0 : _videoPlayerElem$getV2.isHdr) ?? false;
    contentScript.postMessage('is-hdr-video', isHdr);
  });
  contentScript.addMessageListener('player-storyboard-format', function playerStoryboardSpec() {
    var _player$getStoryboard;
    const player = getElem('video-player');
    const format = player === null || player === void 0 ? void 0 : (_player$getStoryboard = player.getStoryboardFormat) === null || _player$getStoryboard === void 0 ? void 0 : _player$getStoryboard.call(player);
    contentScript.postMessage('player-storyboard-format', format);
  });
  function videoPlayerSetSize() {
    const videoPlayerElem = getElem('video-player');
    if (videoPlayerElem) {
      try {
        videoPlayerElem.setSize();
        videoPlayerElem.setInternalSize();
      } catch (ex) {
        console.warn(`Failed to resize the video player${ex !== null && ex !== void 0 && ex.message ? `: ${ex === null || ex === void 0 ? void 0 : ex.message}` : ''}`);
      }
    }
    contentScript.postMessage('sizes-changed');
  }
  contentScript.addMessageListener('video-player-set-size', function onVideoPlayerSetSize() {
    videoPlayerSetSize();
    contentScript.postMessage('video-player-set-size');
  });
  let vrVideoCtx;
  let vrVideoCtxDrawArrays;
  const drawVR = (...args) => {
    const result = vrVideoCtxDrawArrays.bind(vrVideoCtx)(...args);
    contentScript.postMessage('next-vr-frame');
    return result;
  };
  contentScript.addMessageListener('init-vr-video', function initVrVideo() {
    const vrVideoElem = getElem('vr-video');
    vrVideoCtx = vrVideoElem.getContext('webgl');
    if (vrVideoCtx) {
      if (vrVideoCtx.drawArrays !== drawVR) {
        vrVideoCtxDrawArrays = vrVideoCtx.drawArrays;
        vrVideoCtx.drawArrays = drawVR;
      }
    }
  });
  contentScript.addMessageListener('dispose-vr-video', function disposeVrVideo() {
    if (!vrVideoCtx) return;
    vrVideoCtx.drawArrays = vrVideoCtxDrawArrays;
    vrVideoCtx = undefined;
  });
  contentScript.addMessageListener('show', function show({
    ytdAppElemBackground,
    toDark,
    hideScrollbar,
    relatedScrollbar,
    immersiveMode
  }) {
    const mastheadElem = getElem('masthead');
    if (mastheadElem) mastheadElem.classList.add('no-animation');
    const ytdAppElem = getElem('ytd-app');
    if (ytdAppElem) setStyleProperty(ytdAppElem, 'background', ytdAppElemBackground, 'important');
    const html = document.documentElement;
    if (hideScrollbar) html.toggleAttribute('data-ambientlight-hide-scrollbar', true);
    if (relatedScrollbar) html.toggleAttribute('data-ambientlight-related-scrollbar', true);
    if (immersiveMode) updateImmersiveMode(true, true);
    updateTheme(toDark);
    html.toggleAttribute('data-ambientlight-enabled', true);
    videoPlayerSetSize();
    if (ytdAppElem) ytdAppElem.style.background = '';
    if (mastheadElem) mastheadElem.classList.remove('no-animation');
    contentScript.postMessage('show');
  });
  contentScript.addMessageListener('hide', function hide({
    toDark
  }) {
    const mastheadElem = getElem('masthead');
    if (mastheadElem) mastheadElem.classList.add('no-animation');
    const html = document.documentElement;
    html.toggleAttribute('data-ambientlight-enabled', false);
    html.toggleAttribute('data-ambientlight-hide-scrollbar', false);
    html.toggleAttribute('data-ambientlight-related-scrollbar', false);
    updateImmersiveMode(false, true);
    updateTheme(toDark);
    videoPlayerSetSize();
    if (mastheadElem) mastheadElem.classList.remove('no-animation');
    contentScript.postMessage('hide');
  });
  contentScript.addMessageListener('video-player-update-video-data-keywords', function videoPlayerUpdateVideoDataKeywords(keywords) {
    const videoPlayerElem = getElem('video-player');
    if (!videoPlayerElem) return;
    videoPlayerElem.updateVideoData({
      keywords
    });
  });
  contentScript.addMessageListener('video-player-reload-video-by-id', function videoPlayerReloadVideoById() {
    const videoPlayerElem = getElem('video-player');
    if (videoPlayerElem) {
      var _videoPlayerElem$getV3;
      const id = (_videoPlayerElem$getV3 = videoPlayerElem.getVideoData()) === null || _videoPlayerElem$getV3 === void 0 ? void 0 : _videoPlayerElem$getV3.video_id;
      if (id) videoPlayerElem.loadVideoById(id);
    }
    contentScript.postMessage('video-player-reload-video-by-id');
  });
  let videoObserver;
  let videoObserverElem;
  contentScript.addMessageListener('apply-chromium-bug-1142112-workaround', function applyChromiumBug1142112Workaround() {
    try {
      const videoElem = getElem('video');
      if (videoObserverElem === videoElem) return;
      if (videoObserver) {
        videoObserver.disconnect();
        videoObserver = undefined;
      }
      videoObserverElem = videoElem;
      if (!videoElem || videoElem.ambientlightGetVideoPlaybackQuality) return;
      let videoIsHidden = false;
      let videoVisibilityChangeTime;
      videoObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (videoObserverElem !== entry.target) continue;
          videoIsHidden = entry.intersectionRatio === 0;
          videoVisibilityChangeTime = performance.now();
        }
      }, {
        rootMargin: '-70px 0px 0px 0px',
        threshold: 0.0001
      });
      videoObserver.observe(videoElem);
      Object.defineProperty(videoElem, 'ambientlightGetVideoPlaybackQuality', {
        value: videoElem.getVideoPlaybackQuality
      });
      let previousDroppedVideoFrames = 0;
      let droppedVideoFramesCorrection = 0;
      let previousTime = performance.now();
      videoElem.getVideoPlaybackQuality = function () {
        const original = videoElem.ambientlightGetVideoPlaybackQuality();
        let droppedVideoFrames = original.droppedVideoFrames;
        if (droppedVideoFrames < previousDroppedVideoFrames) {
          previousDroppedVideoFrames = 0;
          droppedVideoFramesCorrection = 0;
        }
        if (videoIsHidden || videoVisibilityChangeTime > previousTime - 2000) {
          droppedVideoFramesCorrection += droppedVideoFrames - previousDroppedVideoFrames;
        }
        previousDroppedVideoFrames = droppedVideoFrames;
        droppedVideoFrames = Math.max(0, droppedVideoFrames - droppedVideoFramesCorrection);
        previousTime = performance.now();
        return {
          corruptedVideoFrames: original.corruptedVideoFrames,
          creationTime: original.creationTime,
          droppedVideoFrames,
          totalVideoFrames: original.totalVideoFrames
        };
      };
    } catch (ex) {
      console.warn('Failed to apply getVideoPlaybackQuality workaround. Continuing ambientlight initialization...');
      throw ex;
    }
  }.bind(window));

})();
//# sourceMappingURL=injected.js.map

//# debugId=c6a977c5-8752-5488-8500-08814f067774
