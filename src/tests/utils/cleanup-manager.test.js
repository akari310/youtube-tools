import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  globalCleanupManager,
  trackObserver,
  untrackObserver,
  trackInterval,
  trackEventListener,
  cleanupAll,
} from '../../utils/cleanup-manager.js';

describe('cleanup-manager.js', () => {
  beforeEach(() => {
    // Manually clear everything before each test to ensure isolation
    globalCleanupManager.observers.clear();
    globalCleanupManager.intervals.clear();
    globalCleanupManager.timeouts.clear();
    globalCleanupManager.eventListeners = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Observers', () => {
    it('tracks and untracks observers', () => {
      const mockObserver = { disconnect: vi.fn() };
      
      const tracked = trackObserver(mockObserver);
      expect(tracked).toBe(mockObserver);
      expect(globalCleanupManager.observers.has(mockObserver)).toBe(true);

      untrackObserver(mockObserver);
      expect(globalCleanupManager.observers.has(mockObserver)).toBe(false);
      expect(mockObserver.disconnect).toHaveBeenCalledOnce();
    });
  });

  describe('Intervals', () => {
    it('tracks intervals and clears them on cleanupAll', () => {
      const callback = vi.fn();
      const id = setInterval(callback, 1000);
      
      trackInterval(id);
      expect(globalCleanupManager.intervals.has(id)).toBe(true);

      cleanupAll();
      
      expect(globalCleanupManager.intervals.size).toBe(0);
      
      // Fast forward time, callback shouldn't be called because interval was cleared
      vi.advanceTimersByTime(2000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('EventListeners', () => {
    it('tracks event listeners and removes them on cleanupAll', () => {
      const target = document.createElement('div');
      const listener = vi.fn();
      
      vi.spyOn(target, 'addEventListener');
      vi.spyOn(target, 'removeEventListener');

      trackEventListener(target, 'click', listener);
      expect(target.addEventListener).toHaveBeenCalledWith('click', listener, undefined);
      expect(globalCleanupManager.eventListeners.length).toBe(1);

      cleanupAll();
      expect(target.removeEventListener).toHaveBeenCalledWith('click', listener, undefined);
      expect(globalCleanupManager.eventListeners.length).toBe(0);
    });
  });
});
