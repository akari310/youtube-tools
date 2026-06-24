// Debounce and throttle utilities for performance optimization

/**
 * Debounce function - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 */
export function debounce(func, wait = 300) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    lastArgs = args;
    lastThis = this;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(lastThis, lastArgs);
    }, wait);
  };
}

/**
 * Throttle function - ensures execution at most once every wait milliseconds
 */
export function throttle(func, wait = 300) {
  let timeoutId = null;
  let lastRan = 0;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    lastArgs = args;
    lastThis = this;
    const now = Date.now();

    if (now - lastRan >= wait) {
      clearTimeout(timeoutId);
      lastRan = now;
      func.apply(lastThis, lastArgs);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          lastRan = Date.now();
          func.apply(lastThis, lastArgs);
        },
        wait - (now - lastRan)
      );
    }
  };
}

/**
 * RequestAnimationFrame-based throttle for smooth animations
 */
export function rafThrottle(func) {
  let lastArgs = null;
  let lastThis = null;
  let ticking = false;

  return function (...args) {
    lastArgs = args;
    lastThis = this;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        func.apply(lastThis, lastArgs);
        ticking = false;
      });
    }
  };
}
