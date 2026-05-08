  function applyNonstopPlayback(enabled) {
    const rt = __ytToolsRuntime.nonstopPlayback;
    if (enabled && rt.enabled) return;
    if (!enabled && !rt.enabled) return;

    if (enabled) {
      rt.enabled = true;
      rt.hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden') || null;
      rt.visibilityStateDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState') || null;
      try {
        Object.defineProperties(document, {
          hidden: { configurable: true, get: () => false },
          visibilityState: { configurable: true, get: () => 'visible' },
        });
      } catch (e) {
        console.warn('[YT Tools] Could not override visibility state:', e);
      }

      rt.blockVisibilityEvent = (event) => {
        event.stopImmediatePropagation();
      };
      document.addEventListener('visibilitychange', rt.blockVisibilityEvent, true);
      window.addEventListener('visibilitychange', rt.blockVisibilityEvent, true);

      const refreshActivity = () => {
        try {
          const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
          if ('_lact' in pageWindow) pageWindow._lact = Date.now();
        } catch (e) { }
      };
      refreshActivity();
      rt.keepAliveTimer = setInterval(refreshActivity, 60000);
      return;
    }

    rt.enabled = false;
    if (rt.blockVisibilityEvent) {
      document.removeEventListener('visibilitychange', rt.blockVisibilityEvent, true);
      window.removeEventListener('visibilitychange', rt.blockVisibilityEvent, true);
      rt.blockVisibilityEvent = null;
    }
    if (rt.keepAliveTimer) {
      clearInterval(rt.keepAliveTimer);
      rt.keepAliveTimer = null;
    }
    try {
      if (rt.hiddenDescriptor) Object.defineProperty(document, 'hidden', rt.hiddenDescriptor);
      else delete document.hidden;
      if (rt.visibilityStateDescriptor) Object.defineProperty(document, 'visibilityState', rt.visibilityStateDescriptor);
      else delete document.visibilityState;
    } catch (e) { }
    rt.hiddenDescriptor = null;
    rt.visibilityStateDescriptor = null;
  }
