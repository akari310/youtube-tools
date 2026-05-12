// ===========================================
// Theme Manager - Advanced theme management utilities
// ===========================================

import { getThemePreset, getAllThemePresets } from '../presets/index.js';
import { loadSettings, saveSettings } from '../../settings/settings-manager.js';

export class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.customThemes = new Map();
    this.isPreviewMode = false;
  }

  /**
   * Apply a theme preset
   */
  applyThemePreset(presetName, preview = false) {
    const preset = getThemePreset(presetName);
    if (!preset) return false;

    const settings = loadSettings();

    // Apply colors to settings
    Object.entries(preset.colors).forEach(([key, value]) => {
      const settingKey = this.mapColorToSetting(key);
      if (settingKey) {
        settings[settingKey] = value;
      }
    });

    // Enable custom theme mode
    settings.themes = true;
    settings.themeCustom = true;

    if (!preview) {
      saveSettings(settings);
      this.currentTheme = presetName;
      this.applySettings();
    } else {
      this.isPreviewMode = true;
      this.previewTheme(preset.colors);
    }

    return true;
  }

  /**
   * Preview theme without saving
   */
  previewTheme(colors) {
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = this.mapColorToCSSVar(key);
      if (cssVar) {
        if (key === 'background' && value.includes('gradient')) {
          root.style.setProperty(cssVar, value);
        } else {
          root.style.setProperty(cssVar, value);
        }
      }
    });
  }

  /**
   * Stop preview and restore original theme
   */
  stopPreview() {
    if (!this.isPreviewMode) return;

    this.isPreviewMode = false;
    this.applySettings();
  }

  /**
   * Save current colors as custom theme
   */
  saveCustomTheme(name, description = '') {
    const settings = loadSettings();
    const themeColors = this.extractColorsFromSettings(settings);

    const customTheme = {
      name,
      description,
      colors: themeColors,
      createdAt: new Date().toISOString(),
    };

    this.customThemes.set(name, customTheme);
    this.saveCustomThemes();

    return customTheme;
  }

  /**
   * Delete custom theme
   */
  deleteCustomTheme(name) {
    if (this.customThemes.has(name)) {
      this.customThemes.delete(name);
      this.saveCustomThemes();
      return true;
    }
    return false;
  }

  /**
   * Get all available themes (presets + custom)
   */
  getAllThemes() {
    const presets = getAllThemePresets();
    const custom = Array.from(this.customThemes.entries()).map(([key, theme]) => ({
      key,
      ...theme,
      isCustom: true,
    }));

    return [...presets, ...custom];
  }

  /**
   * Export theme configuration
   */
  exportTheme(themeName) {
    const theme = this.getTheme(themeName);
    if (!theme) return null;

    return {
      name: theme.name,
      description: theme.description || '',
      colors: theme.colors,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import theme configuration
   */
  importTheme(themeData) {
    try {
      const { name, description, colors } = themeData;

      if (!name || !colors) {
        throw new Error('Invalid theme data');
      }

      const customTheme = {
        name,
        description: description || '',
        colors,
        createdAt: new Date().toISOString(),
        imported: true,
      };

      this.customThemes.set(name, customTheme);
      this.saveCustomThemes();

      return customTheme;
    } catch (error) {
      console.error('[YT Tools] Failed to import theme:', error);
      return null;
    }
  }

  /**
   * Get theme by name
   */
  getTheme(name) {
    // Try custom themes first
    if (this.customThemes.has(name)) {
      return { key: name, ...this.customThemes.get(name), isCustom: true };
    }

    // Try presets
    const preset = getThemePreset(name);
    if (preset) {
      return { key: name, ...preset, isCustom: false };
    }

    return null;
  }

  /**
   * Apply random theme
   */
  applyRandomTheme() {
    const themes = this.getAllThemes();
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    return this.applyThemePreset(randomTheme.key);
  }

  // Private methods
  mapColorToSetting(colorKey) {
    const mapping = {
      background: 'bgColorPicker',
      primary: 'primaryColorPicker',
      secondary: 'secondaryColorPicker',
      header: 'headerColorPicker',
      icons: 'iconsColorPicker',
      menu: 'menuColorPicker',
      accent: 'lineColorPicker',
      progress: 'progressbarColorPicker',
    };
    return mapping[colorKey];
  }

  mapColorToCSSVar(colorKey) {
    const mapping = {
      background: '--yt-spec-base-background',
      primary: '--yt-spec-text-primary',
      secondary: '--yt-spec-text-secondary',
      header: '--yt-spec-raised-background',
      icons: '--yt-spec-icon-inactive',
      menu: '--yt-spec-menu-background',
      accent: '--yt-spec-static-brand-red',
      progress: '--yt-spec-static-brand-white',
    };
    return mapping[colorKey];
  }

  extractColorsFromSettings(settings) {
    return {
      background: settings.bgColorPicker,
      primary: settings.primaryColorPicker,
      secondary: settings.secondaryColorPicker,
      header: settings.headerColorPicker,
      icons: settings.iconsColorPicker,
      menu: settings.menuColorPicker,
      accent: settings.lineColorPicker,
      progress: settings.progressbarColorPicker,
    };
  }

  saveCustomThemes() {
    const themesArray = Array.from(this.customThemes.entries());
    localStorage.setItem('yt-tools-custom-themes', JSON.stringify(themesArray));
  }

  loadCustomThemes() {
    try {
      const saved = localStorage.getItem('yt-tools-custom-themes');
      if (saved) {
        const themesArray = JSON.parse(saved);
        this.customThemes = new Map(themesArray);
      }
    } catch (error) {
      console.warn('[YT Tools] Failed to load custom themes:', error);
    }
  }

  applySettings() {
    // Trigger settings apply
    document.dispatchEvent(
      new CustomEvent('yt-tools-settings-changed', {
        detail: loadSettings(),
      })
    );
  }
}

// Singleton instance
export const themeManager = new ThemeManager();

// Initialize on load
themeManager.loadCustomThemes();
