import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'Youtube Tools DEV',
        namespace: 'dev',
        version: '0.0.0',
        author: 'DeveloperMDCM',
        description: 'DEV MODE - Youtube Tools (auto-reload from localhost)',
        homepage: 'https://github.com/DeveloperMDCM/',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=youtube.com',
        match: [
          '*://www.youtube.com/*',
          '*://youtube.com/*',
          '*://music.youtube.com/*',
          '*://*.music.youtube.com/*',
        ],
        grant: [
          'GM_info',
          'GM_addStyle',
          'GM_setValue',
          'GM_getValue',
          'unsafeWindow',
          'GM_registerMenuCommand',
        ],
        require: ['https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/js/iziToast.min.js'],
        'run-at': 'document-end',
      },
    }),
  ],
});
