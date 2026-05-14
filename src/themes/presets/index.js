// ===========================================
// Theme Presets - Predefined color schemes
// ===========================================

export const THEME_PRESETS = {
  // Minimal themes
  minimal: {
    name: 'Minimal Light',
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
  },

  minimalDark: {
    name: 'Minimal Dark',
    colors: {
      background: '#1a1a1a',
      primary: '#ffffff',
      secondary: '#cccccc',
      header: '#2d2d2d',
      icons: '#ffffff',
      menu: '#2d2d2d',
      accent: '#0066cc',
      progress: '#0066cc',
    },
  },

  // Vibrant themes
  ocean: {
    name: 'Ocean Blue',
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primary: '#ffffff',
      secondary: '#e8f4fd',
      header: 'rgba(255,255,255,0.1)',
      icons: '#ffffff',
      menu: 'rgba(255,255,255,0.1)',
      accent: '#4fc3f7',
      progress: '#29b6f6',
    },
  },

  sunset: {
    name: 'Sunset Orange',
    colors: {
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      primary: '#ffffff',
      secondary: '#fff3e0',
      header: 'rgba(255,255,255,0.1)',
      icons: '#ffffff',
      menu: 'rgba(255,255,255,0.1)',
      accent: '#ff6b6b',
      progress: '#ff5252',
    },
  },

  forest: {
    name: 'Forest Green',
    colors: {
      background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      primary: '#ffffff',
      secondary: '#e8f5e8',
      header: 'rgba(255,255,255,0.1)',
      icons: '#ffffff',
      menu: 'rgba(255,255,255,0.1)',
      accent: '#66bb6a',
      progress: '#4caf50',
    },
  },

  // Professional themes
  corporate: {
    name: 'Corporate Blue',
    colors: {
      background: '#f8f9fa',
      primary: '#1a73e8',
      secondary: '#5f6368',
      header: '#ffffff',
      icons: '#1a73e8',
      menu: '#ffffff',
      accent: '#1a73e8',
      progress: '#1a73e8',
    },
  },

  darkPro: {
    name: 'Dark Professional',
    colors: {
      background: '#0d1117',
      primary: '#c9d1d9',
      secondary: '#8b949e',
      header: '#161b22',
      icons: '#58a6ff',
      menu: '#161b22',
      accent: '#58a6ff',
      progress: '#58a6ff',
    },
  },

  // Gaming themes
  neon: {
    name: 'Neon Gaming',
    colors: {
      background: '#0a0a0a',
      primary: '#00ff41',
      secondary: '#00cc33',
      header: '#1a1a1a',
      icons: '#00ff41',
      menu: '#1a1a1a',
      accent: '#ff0080',
      progress: '#00ff41',
    },
  },

  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      primary: '#ff00ff',
      secondary: '#00ffff',
      header: 'rgba(255,0,255,0.1)',
      icons: '#ff00ff',
      menu: 'rgba(255,0,255,0.1)',
      accent: '#ffff00',
      progress: '#ff00ff',
    },
  },

  // Modern themes
  aurora: {
    name: 'Aurora Borealis',
    colors: {
      background: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)',
      primary: '#1a1a1a',
      secondary: '#ffffff',
      header: 'rgba(255,255,255,0.15)',
      icons: '#1a1a1a',
      menu: 'rgba(255,255,255,0.15)',
      accent: '#00ff88',
      progress: '#00ccff',
    },
  },

  midnight: {
    name: 'Midnight Purple',
    colors: {
      background: 'linear-gradient(135deg, #2e1a47 0%, #4a148c 100%)',
      primary: '#ffffff',
      secondary: '#e1bee7',
      header: 'rgba(255,255,255,0.1)',
      icons: '#ffffff',
      menu: 'rgba(255,255,255,0.1)',
      accent: '#9c27b0',
      progress: '#7b1fa2',
    },
  },

  // Seasonal themes
  spring: {
    name: 'Spring Blossom',
    colors: {
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      primary: '#2e7d32',
      secondary: '#81c784',
      header: 'rgba(255,255,255,0.9)',
      icons: '#2e7d32',
      menu: 'rgba(255,255,255,0.9)',
      accent: '#ff6f00',
      progress: '#4caf50',
    },
  },

  autumn: {
    name: 'Autumn Harvest',
    colors: {
      background: 'linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%)',
      primary: '#ffffff',
      secondary: '#ffe0b2',
      header: 'rgba(255,255,255,0.1)',
      icons: '#ffffff',
      menu: 'rgba(255,255,255,0.1)',
      accent: '#ff6f00',
      progress: '#ff9800',
    },
  },

  // Premium themes
  galaxy: {
    name: 'Galaxy Premium',
    colors: {
      background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
      primary: '#ffffff',
      secondary: '#64b5f6',
      header: 'rgba(255,255,255,0.05)',
      icons: '#ffffff',
      menu: 'rgba(255,255,255,0.05)',
      accent: '#ffd700',
      progress: '#00bcd4',
      animation: true,
    },
  },

  crystal: {
    name: 'Crystal Glass',
    colors: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      primary: '#333333',
      secondary: '#666666',
      header: 'rgba(255,255,255,0.8)',
      icons: '#333333',
      menu: 'rgba(255,255,255,0.8)',
      accent: '#2196f3',
      progress: '#1976d2',
      glass: true,
    },
  },
};

export function getThemePreset(name) {
  return THEME_PRESETS[name] || THEME_PRESETS.minimal;
}

export function getAllThemePresets() {
  return Object.keys(THEME_PRESETS).map(key => ({
    key,
    ...THEME_PRESETS[key],
  }));
}
