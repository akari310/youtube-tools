// ===========================================
// Theme Animations and Transitions - Performance Optimized
// ===========================================

let animationEnabled = false;
// let currentTransition = null; // Unused
let animationFrameId = null;
const transitionCache = new Map();

// Performance: Cache animation styles
const ANIMATION_STYLES = `
  .yt-theme-transition-overlay {
    mix-blend-mode: screen;
    pointer-events: none;
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 var(--pulse-color, #007bff); }
    50% { box-shadow: 0 0 0 10px var(--pulse-color, #007bff); }
    100% { box-shadow: 0 0 0 0 var(--pulse-color, #007bff); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .yt-theme-shimmer {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.1),
      transparent
    );
    background-size: 200% 100%;
  }
  
  .yt-theme-animate-in {
    animation: slideIn 0.3s ease-out;
  }
  
  .yt-theme-animate-out {
    animation: slideOut 0.3s ease-in;
  }
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-20px); opacity: 0; }
  }
`;

export function initThemeAnimations(enabled = true) {
  animationEnabled = enabled;

  if (enabled && !document.getElementById('yt-theme-animations')) {
    const style = document.createElement('style');
    style.id = 'yt-theme-animations';
    style.textContent = ANIMATION_STYLES;
    document.head.appendChild(style);
    console.log('[YT Tools] Theme animations enabled');
  } else if (!enabled) {
    removeAnimationStyles();
    console.log('[YT Tools] Theme animations disabled');
  }
}

export function playThemeTransition(fromTheme, toTheme, duration = 300) {
  if (!animationEnabled) return Promise.resolve();

  // Performance: Check cache first
  const cacheKey = `${fromTheme}-${toTheme}`;
  if (transitionCache.has(cacheKey)) {
    return transitionCache.get(cacheKey);
  }

  const transitionPromise = new Promise((resolve) => {
    // Performance: Reuse overlay if exists
    let overlay = document.querySelector('.yt-theme-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'yt-theme-transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
        z-index: 999999;
        opacity: 0;
        transition: opacity ${duration}ms ease-in-out;
      `;
      document.body.appendChild(overlay);
    }

    // Performance: Use requestAnimationFrame for smooth transitions
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // Performance: Optimize timeout
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
        resolve();
      }, duration);
    }, duration);

    console.log(`[YT Tools] Theme transition: ${fromTheme} → ${toTheme}`);
  });

  // Cache the transition
  transitionCache.set(cacheKey, transitionPromise);

  // Clean cache after 5 minutes
  setTimeout(() => {
    transitionCache.delete(cacheKey);
  }, 300000);

  return transitionPromise;
}

export function addThemePulse(element, color = '#007bff') {
  if (!animationEnabled) return;

  element.style.animation = `pulse 2s ease-in-out`;
  element.style.setProperty('--pulse-color', color);

  setTimeout(() => {
    element.style.animation = '';
  }, 2000);
}

export function addThemeShimmer(element) {
  if (!animationEnabled) return;

  element.style.animation = 'shimmer 1.5s ease-in-out';

  setTimeout(() => {
    element.style.animation = '';
  }, 1500);
}

// Unused helper removed to clean up code


function removeAnimationStyles() {
  const style = document.getElementById('yt-theme-animations');
  if (style) {
    document.head.removeChild(style);
  }
}

export function setAnimationSpeed(speed = 'normal') {
  const speeds = {
    slow: 0.5,
    normal: 1,
    fast: 1.5
  };

  const root = document.documentElement;
  root.style.setProperty('--theme-animation-speed', speeds[speed] || 1);
}

export function toggleThemeAnimations() {
  initThemeAnimations(!animationEnabled);
  return animationEnabled;
}

// Performance: Cleanup animations on page unload
export function cleanupAnimations() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Remove transition overlays
  const overlays = document.querySelectorAll('.yt-theme-transition-overlay');
  overlays.forEach(overlay => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  });

  // Clear cache
  transitionCache.clear();

  console.log('[YT Tools] Animation cleanup completed');
}

// Performance: Throttle rapid theme changes
let lastThemeChange = 0;
const THEME_CHANGE_THROTTLE = 100; // 100ms minimum

export function throttleThemeChange(_callback) {
  const now = Date.now();
  if (now - lastThemeChange < THEME_CHANGE_THROTTLE) {
    return false;
  }

  lastThemeChange = now;
  return true;
}
