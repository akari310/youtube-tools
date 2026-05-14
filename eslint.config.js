import js from '@eslint/js';

const browserGlobals = {
  AbortController: 'readonly',
  Blob: 'readonly',
  CSS: 'readonly',
  CustomEvent: 'readonly',
  DOMParser: 'readonly',
  Element: 'readonly',
  FileReader: 'readonly',
  FormData: 'readonly',
  Headers: 'readonly',
  IntersectionObserver: 'readonly',
  Map: 'readonly',
  MutationObserver: 'readonly',
  Promise: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  Set: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  WebKitMutationObserver: 'readonly',
  alert: 'readonly',
  atob: 'readonly',
  btoa: 'readonly',
  cancelAnimationFrame: 'readonly',
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  confirm: 'readonly',
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  globalThis: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  navigator: 'readonly',
  prompt: 'readonly',
  requestAnimationFrame: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  window: 'readonly',
};

const userscriptGlobals = {
  GM_addStyle: 'readonly',
  GM_getValue: 'readonly',
  GM_info: 'readonly',
  GM_registerMenuCommand: 'readonly',
  GM_setValue: 'readonly',
  iziToast: 'readonly',
  unsafeWindow: 'readonly',
};

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'src/script-full.js', '*.min.js', 'youtube-tools.user.js'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'rollup.config*.js', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        ...userscriptGlobals,
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/features/**/*.js', 'src/ui/**/*.js', 'src/utils/**/*.js', 'src/index-simple.js'],
    rules: {
      // These files are partial refactor modules that are not active in the production entrypoint yet.
      // Keep syntax/undef checks on, but avoid unused noise until each module is wired in.
      'no-unused-vars': 'off',
    },
  },
];
