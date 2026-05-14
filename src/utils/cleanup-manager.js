// ===========================================
// Cleanup Manager - Centralized resource cleanup
// ===========================================
// Prevents memory leaks by tracking and cleaning up:
// - MutationObservers
// - IntersectionObservers
// - Event listeners
// - Intervals/Timeouts
// - AudioContexts
// ===========================================

export class CleanupManager {
  constructor() {
    this.observers = new Set();
    this.intervals = new Set();
    this.timeouts = new Set();
    this.eventListeners = [];
    this.audioContexts = new Set();
    this.callbacks = new Set();
  }

  /**
   * Track an observer for cleanup
   */
  trackObserver(observer) {
    if (!observer) return null;
    this.observers.add(observer);
    return observer;
  }

  /**
   * Untrack and disconnect an observer
   */
  untrackObserver(observer) {
    if (observer) {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn('[CleanupManager] Observer disconnect error:', e);
      }
      this.observers.delete(observer);
    }
  }

  /**
   * Track an interval ID for cleanup
   */
  trackInterval(intervalId) {
    if (!intervalId) return null;
    this.intervals.add(intervalId);
    return intervalId;
  }

  /**
   * Clear and untrack an interval
   */
  untrackInterval(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(intervalId);
    }
  }

  /**
   * Track a timeout ID for cleanup
   */
  trackTimeout(timeoutId) {
    if (!timeoutId) return null;
    this.timeouts.add(timeoutId);
    return timeoutId;
  }

  /**
   * Clear and untrack a timeout
   */
  untrackTimeout(timeoutId) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(timeoutId);
    }
  }

  /**
   * Track an event listener for cleanup
   */
  trackEventListener(target, type, listener, options) {
    if (!target || !type || !listener) return null;
    this.eventListeners.push({ target, type, listener, options });
    target.addEventListener(type, listener, options);
    return { target, type, listener, options };
  }

  /**
   * Remove and untrack an event listener
   */
  untrackEventListener(target, type, listener, options) {
    if (!target || !type || !listener) return;
    try {
      target.removeEventListener(type, listener, options);
    } catch (e) {
      console.warn('[CleanupManager] Event listener removal error:', e);
    }
    this.eventListeners = this.eventListeners.filter(
      el => !(el.target === target && el.type === type && el.listener === listener)
    );
  }

  /**
   * Track an AudioContext for cleanup
   */
  trackAudioContext(audioCtx) {
    if (!audioCtx) return null;
    this.audioContexts.add(audioCtx);
    return audioCtx;
  }

  /**
   * Close and untrack an AudioContext
   */
  untrackAudioContext(audioCtx) {
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.close();
      } catch (e) {
        console.warn('[CleanupManager] AudioContext close error:', e);
      }
      this.audioContexts.delete(audioCtx);
    }
  }

  /**
   * Register a custom cleanup callback
   */
  registerCleanup(callback) {
    if (typeof callback !== 'function') return null;
    this.callbacks.add(callback);
    return callback;
  }

  /**
   * Unregister a cleanup callback
   */
  unregisterCleanup(callback) {
    this.callbacks.delete(callback);
  }

  /**
   * Cleanup all tracked resources
   */
  cleanupAll() {
    console.log('[CleanupManager] Cleaning up all resources...');

    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn('[CleanupManager] Observer cleanup error:', e);
      }
    });
    this.observers.clear();

    // Clear all intervals
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();

    // Remove all event listeners
    this.eventListeners.forEach(({ target, type, listener, options }) => {
      try {
        target.removeEventListener(type, listener, options);
      } catch (e) {
        console.warn('[CleanupManager] Event listener cleanup error:', e);
      }
    });
    this.eventListeners = [];

    // Close all AudioContexts
    this.audioContexts.forEach(audioCtx => {
      if (audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch (e) {
          console.warn('[CleanupManager] AudioContext cleanup error:', e);
        }
      }
    });
    this.audioContexts.clear();

    // Run all custom cleanup callbacks
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.warn('[CleanupManager] Custom cleanup callback error:', e);
      }
    });
    this.callbacks.clear();

    console.log('[CleanupManager] Cleanup complete');
  }
}

// Singleton instance for global cleanup
export const globalCleanupManager = new CleanupManager();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalCleanupManager.cleanupAll();
  });

  window.addEventListener('pagehide', () => {
    globalCleanupManager.cleanupAll();
  });

  // Cleanup on YouTube SPA navigation
  window.addEventListener('yt-navigate-finish', () => {
    // Only cleanup observers and intervals, not event listeners
    globalCleanupManager.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {}
    });
    globalCleanupManager.observers.clear();

    globalCleanupManager.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    globalCleanupManager.intervals.clear();

    globalCleanupManager.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    globalCleanupManager.timeouts.clear();
  });
}

// Export convenience functions
export function trackObserver(observer) {
  return globalCleanupManager.trackObserver(observer);
}

export function untrackObserver(observer) {
  globalCleanupManager.untrackObserver(observer);
}

export function trackInterval(intervalId) {
  return globalCleanupManager.trackInterval(intervalId);
}

export function untrackInterval(intervalId) {
  globalCleanupManager.untrackInterval(intervalId);
}

export function trackTimeout(timeoutId) {
  return globalCleanupManager.trackTimeout(timeoutId);
}

export function untrackTimeout(timeoutId) {
  globalCleanupManager.untrackTimeout(timeoutId);
}

export function trackEventListener(target, type, listener, options) {
  return globalCleanupManager.trackEventListener(target, type, listener, options);
}

export function untrackEventListener(target, type, listener, options) {
  globalCleanupManager.untrackEventListener(target, type, listener, options);
}

export function trackAudioContext(audioCtx) {
  return globalCleanupManager.trackAudioContext(audioCtx);
}

export function untrackAudioContext(audioCtx) {
  globalCleanupManager.untrackAudioContext(audioCtx);
}

export function registerCleanup(callback) {
  return globalCleanupManager.registerCleanup(callback);
}

export function cleanupAll() {
  globalCleanupManager.cleanupAll();
}