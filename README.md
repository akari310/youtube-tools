# YouTube Ultimate Tools 🚀

[![Greasy Fork](https://img.shields.io/greasyfork/v/576162?label=Greasy%20Fork&color=red&style=for-the-badge)](https://greasyfork.org/scripts/576162)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)
[![Stars](https://img.shields.io/github/stars/akari310/youtube-tools?style=for-the-badge)](https://github.com/akari310/youtube-tools)

A powerful, modular, and glassmorphic userscript designed to elevate your **YouTube** and **YouTube Music** experience with premium features and a modern aesthetic.

---

## 📸 Previews

<div align="center">
  <img src="assets/yt_preview.png?v=2" alt="YouTube Preview" width="45%">
  <img src="assets/ytm_preview.png?v=2" alt="YouTube Music Preview" width="45%">
  <p><i>Modern Glassmorphic UI & Advanced Features for YouTube & YT Music</i></p>
</div>

---

## ✨ Key Features

### 📺 YouTube Enhancements
- **🚀 High-Quality Downloads**: Download videos up to **4K/8K** (MP4) and high-fidelity audio (MP3/FLAC).
- **👎 Return YouTube Dislikes**: Restore the public dislike count with real-time synchronization.
- **🎬 Cinema & Ambient Mode**: Immersive viewing with dynamic background lighting and glassmorphic panels.
- **📱 Smart Tools**: Picture-in-Picture mode, instant screenshots, and floating controls.
- **🌐 Comment Translator**: Translate comments instantly using integrated Google Translate.

### 🎵 YouTube Music (YTM) Specialized
- **🔮 Glassmorphic UI**: A complete visual overhaul with beautiful blur effects and sleek typography.
- **🌈 Advanced Ambient Mode**: Dynamic aura effects that sync perfectly with album art colors.
- **☕ Nonstop Playback**: Automatically bypasses "Continue watching?" prompts for uninterrupted listening.
- **🎧 Audio-only Mode**: Toggle video off to save bandwidth and focus purely on the music.

---

## 🚀 Quick Installation

### 1. Install a Userscript Manager
- **Tampermonkey** (Recommended): [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Violentmonkey**: [Chrome](https://chromewebstore.google.com/detail/violentmonkey/jinjacbljjnnnndkhlebbnbiomkhpnih) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)

### 2. Install the Script
[![Install Script](https://img.shields.io/badge/Install_YouTube_Ultimate_Tools-FF0000?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://greasyfork.org/scripts/576162/code/YouTube%20Ultimate%20Tools.user.js)

---

## ⚠️ Troubleshooting / Common Issues

### "Network Error" during downloads or Metadata Tagging fails
If you are using **uBlock Origin** or other strict adblockers, they might aggressively block the download API servers (`savenow.to` and `lbserver.xyz`), resulting in a `Network Error` or `xhr_failed` message.

**How to fix (Add an exception to uBlock Origin):**
1. Click the **uBlock Origin** icon in your browser and open the **Dashboard** (⚙️ gear icon).
2. Go to the **My filters** tab.
3. Copy and paste the following lines at the bottom:
   ```text
   @@||savenow.to^
   @@||lbserver.xyz^
   ```
   *(Note: The `@@` prefix is the specific syntax that tells uBlock to whitelist/unblock these domains).*
4. Click **Apply changes** and refresh the YouTube page.

> Note: the script also needs `@connect *` in its header because the final download URL
> is returned by the API at runtime, so the set of possible hosts cannot be listed up front.

### Settings menu opens but nothing happens
The settings can fail to load if a timeout fires before the preferences are ready.
Refresh the page after installing or updating the script. If settings still do not
apply, clear the stored value by opening the console and running:
```js
GM_deleteValue('ytSettingsMDCM');
```
then reload.

### Ambilight dies after toggling it many times
Fixed in build-15. If you are on an older release, update from the Install link above.
The previous WebGL context was never released, so the GPU ran out of contexts after
roughly 16 toggles.

---

## 🛠️ Development & Contribution

Built with a modern **Node.js** modular workflow for maximum performance and maintainability.

### 📁 Project Architecture

15 source modules across 5 directories. They are **concatenated into a single IIFE**, not imported.

| Directory | Files | Contents |
|---|---|---|
| `src/core/` | 3 | Userscript metadata, shared `.lib` state, DOM/security policy helpers |
| `src/ui/` | 5 | Glassmorphic components, styles, settings menu, injected buttons |
| `src/features/` | 2 | WebGL Ambilight, Cinema mode |
| `src/main/` | 3 | DOM observers, feature manager, final bootstrap |
| `src/utils/` | 2 | Downloader/API wrappers, the main URL-and-settings module |

> **File placement gotcha:** the downloader lives in `src/utils/`, not `src/features/`.
> The wave visualiser and the dislike counter also live outside `src/features/`
> (`src/utils/url.js` and `src/core/policy.js`).

### ⚙️ Build Order Matters

`scripts/build.js` concatenates modules using an **explicit `FILE_ORDER` array**, not
alphabetical sorting or filesystem order. Declaration order determines execution order,
so a file added in the wrong slot can break the whole bundle.

Concretely: `core/meta.js` must come first (it holds the userscript header),
`core/init.js` next (it declares the shared `.lib`), and `main/final.js` last
(it runs the bootstrap). Editing `FILE_ORDER` also means editing
`scripts/build-clone.js` so the two stay identical.

Because of this, the project has **no Python build script** — the old alphabetical
Python build has been removed. Always use the Node scripts.

### ⚙️ Workflow

**Requirements:** Node.js 18 or newer (tested on 24.x).

1. **Clone & Setup**:
   ```bash
   git clone https://github.com/akari310/youtube-tools.git
   cd youtube-tools
   npm install
   ```
2. **Build**:
   ```bash
   npm run build
   ```
   *Output: a single `youtube-tools.user.js` at the repository root.*

3. **Other scripts** (from `package.json`):
   | Command | Effect |
   |---|---|
   | `npm run build` | Concatenate `src/` into `youtube-tools.user.js` |
   | `npm run bump` | Bump the version across all locations |
   | `npm run release` | Bump, commit and tag |
   | `npm run push` | Commit without bumping |

---

## 📜 Credits

Crafted with passion by:
- [**Akari**](https://github.com/akari310) — Optimization & Development
- [**DeveloperMDCM**](https://github.com/DeveloperMDCM) — Original Project Creator
- [**nvbangg**](https://github.com/nvbangg/Nonstop_Audio_Only_for_Youtube_YTMusic) — Source for Audio-only & Nonstop features
- [**WesselKroos**](https://github.com/WesselKroos/youtube-ambilight) — Source/Inspiration for WebGL Ambilight feature ([Chrome Extension](https://chromewebstore.google.com/detail/ambient-light-for-youtube/paponcgjfojgemddooebbgniglhkajkj))

## 📄 License
This project is licensed under the [GNU General Public License v3.0](LICENSE).
