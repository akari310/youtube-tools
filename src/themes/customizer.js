// ===========================================
// Theme Customizer - Advanced customization
// ===========================================

let customTheme = {
  name: 'Custom Theme',
  colors: {
    background: '#ffffff',
    primary: '#000000',
    secondary: '#666666',
    header: '#f5f5f5',
    icons: '#333333',
    menu: '#ffffff',
    accent: '#007bff',
    progress: '#007bff',
  },
  custom: true,
};

import { applySettings } from './applier.js';
import { loadSettings } from '../settings/settings-manager.js';

export function getThemeCustomizer() {
  return {
    current: customTheme,
    presets: getCustomPresets(),
    history: getCustomHistory(),
  };
}

export function applyCustomTheme(themeData) {
  if (!themeData || !themeData.colors) {
    console.warn('[YT Tools] Invalid custom theme data');
    return false;
  }

  // Validate colors
  const validatedColors = validateThemeColors(themeData.colors);
  customTheme = {
    name: themeData.name || 'Custom Theme',
    colors: validatedColors,
    custom: true,
    ...themeData.properties,
  };

  // Apply custom theme
  applySettings({
    ...loadSettings(),
    selectedTheme: 'custom',
    customTheme: customTheme,
  });

  // Save to history
  saveToCustomHistory(customTheme);

  console.log('[YT Tools] Custom theme applied:', customTheme.name);
  return true;
}

export function createCustomThemeFromCurrent() {
  const currentColors = extractCurrentColors();

  const newCustomTheme = {
    name: `Custom ${new Date().toLocaleDateString()}`,
    colors: currentColors,
    custom: true,
    created: Date.now(),
  };

  customTheme = newCustomTheme;
  saveCustomPreset(newCustomTheme);

  return newCustomTheme;
}

export function saveCustomPreset(theme) {
  const presets = getCustomPresets();
  const newPreset = {
    ...theme,
    id: generateId(),
    created: Date.now(),
  };

  presets.push(newPreset);
  localStorage.setItem('yt-custom-theme-presets', JSON.stringify(presets));

  console.log('[YT Tools] Custom preset saved:', newPreset.name);
  return newPreset;
}

export function deleteCustomPreset(id) {
  const presets = getCustomPresets();
  const filtered = presets.filter(p => p.id !== id);
  localStorage.setItem('yt-custom-theme-presets', JSON.stringify(filtered));

  console.log('[YT Tools] Custom preset deleted:', id);
  return true;
}

export function getCustomPresets() {
  try {
    const stored = localStorage.getItem('yt-custom-theme-presets');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('[YT Tools] Failed to load custom presets:', e);
    return [];
  }
}

export function saveToCustomHistory(theme) {
  const history = getCustomHistory();
  const newEntry = {
    ...theme,
    applied: Date.now(),
  };

  // Keep only last 10 entries
  history.unshift(newEntry);
  const limited = history.slice(0, 10);

  localStorage.setItem('yt-custom-theme-history', JSON.stringify(limited));
}

export function getCustomHistory() {
  try {
    const stored = localStorage.getItem('yt-custom-theme-history');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('[YT Tools] Failed to load custom history:', e);
    return [];
  }
}

const colorValidationCache = new Map();

function validateThemeColors(colors) {
  // Performance: Check cache first
  const cacheKey = JSON.stringify(colors);
  if (colorValidationCache.has(cacheKey)) {
    return colorValidationCache.get(cacheKey);
  }

  const validated = {};
  const requiredColors = [
    'background', 'primary', 'secondary', 'header',
    'icons', 'menu', 'accent', 'progress'
  ];

  requiredColors.forEach(colorKey => {
    const color = colors[colorKey];
    if (color && isValidColor(color)) {
      validated[colorKey] = color;
    } else {
      console.warn(`[YT Tools] Invalid color for ${colorKey}:`, color);
      validated[colorKey] = getDefaultColor(colorKey);
    }
  });

  // Performance: Cache result
  colorValidationCache.set(cacheKey, validated);

  return validated;
}

function isValidColor(color) {
  // Check for hex, rgb, rgba, hsl, hsla, and gradient
  const colorPatterns = [
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // hex
    /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)\s*\)$/, // rgb/rgba
    /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)\s*\)$/, // hsl/hsla
    /^linear-gradient\(/, // gradient
    /^radial-gradient\(/, // gradient
  ];

  return colorPatterns.some(pattern => pattern.test(color));
}

function getDefaultColor(colorKey) {
  const defaults = {
    background: '#ffffff',
    primary: '#000000',
    secondary: '#666666',
    header: '#f5f5f5',
    icons: '#333333',
    menu: '#ffffff',
    accent: '#007bff',
    progress: '#007bff',
  };

  return defaults[colorKey] || '#000000';
}

function extractCurrentColors() {
  // Extract current colors from computed styles
  const root = document.documentElement;
  const computed = window.getComputedStyle(root);

  return {
    background: computed.getPropertyValue('--yt-bg-color')?.trim() || '#ffffff',
    primary: computed.getPropertyValue('--yt-primary-color')?.trim() || '#000000',
    secondary: computed.getPropertyValue('--yt-secondary-color')?.trim() || '#666666',
    header: computed.getPropertyValue('--yt-header-color')?.trim() || '#f5f5f5',
    icons: computed.getPropertyValue('--yt-icons-color')?.trim() || '#333333',
    menu: computed.getPropertyValue('--yt-menu-color')?.trim() || '#ffffff',
    accent: computed.getPropertyValue('--yt-accent-color')?.trim() || '#007bff',
    progress: computed.getPropertyValue('--yt-progress-color')?.trim() || '#007bff',
  };
}

function generateId() {
  return 'custom_' + Math.random().toString(36).substr(2, 9);
}

// Color utilities
export function adjustColorBrightness(color, amount = 0.2) {
  if (!color || !isValidColor(color)) return color;

  // Simple brightness adjustment for hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, ((num >> 16) & 255) + amount * 255);
    const g = Math.min(255, ((num >> 8) & 255) + amount * 255);
    const b = Math.min(255, (num & 255) + amount * 255);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  return color;
}

export function generateColorPalette(baseColor) {
  if (!baseColor) return {};

  return {
    primary: baseColor,
    lighter: adjustColorBrightness(baseColor, 0.3),
    darker: adjustColorBrightness(baseColor, -0.3),
    contrast: getContrastColor(baseColor),
    accent: adjustColorBrightness(baseColor, 0.1),
  };
}

function getContrastColor(bgColor) {
  // Simple contrast calculation
  if (!bgColor || !bgColor.startsWith('#')) return '#000000';

  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? '#000000' : '#ffffff';
}
