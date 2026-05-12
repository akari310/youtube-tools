import { defineConfig } from 'rollup';

const userscriptHeader = `// ==UserScript==
// @name         Youtube Tools DEV
// @namespace    dev
// @version      2.4.3.2
// @author       DeveloperMDCM
// @description  DEV MODE - Youtube Tools (self-contained)
// @homepage     https://github.com/DeveloperMDCM/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @match        *://music.youtube.com/*
// @match        *://*.music.youtube.com/*
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/js/iziToast.min.js
// @run-at       document-end
// ==/UserScript==
`;

export default defineConfig({
  input: 'src/main.js',
  output: {
    file: 'dist/dev.user.js',
    format: 'iife',
    banner: userscriptHeader,
    sourcemap: 'inline',
  },
  watch: {
    include: 'src/**',
    clearScreen: false,
  },
});
