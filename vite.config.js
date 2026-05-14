import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'Youtube Tools All in one local download mp3 mp4 HIGT QUALITY return dislikes and more',
        namespace: 'npm/vite-plugin-monkey',
        version: '2.4.4.2',
        author: 'DeveloperMDCM',
        description:
          'Công cụ Youtube Tất cả trong một cục bộ Tải xuống mp4, MP3 - HIGH QUALITY return dislikes and more',
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
