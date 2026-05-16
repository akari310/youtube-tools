import { THEMES } from '../../../themes/theme-data.js';

export const themeOptionsHTML = THEMES.map(
  (theme, index) => `
    <label>
      <div class="theme-option">
      <div class="theme-preview" style="background: ${theme.gradient};"></div>
      <input type="radio" name="theme" value="${index}" ${index === 0 ? 'checked' : ''}>
          <span style="${theme.name === 'Default / Reload Page' ? 'color: red; ' : ''}" class="theme-name">${theme.name}</span>
          </div>
    </label>
`
).join('');
