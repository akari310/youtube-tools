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

### 🎨 UI Style (the glass look is a setting, not a given)

The interface finish is a dropdown: **Settings → General → UI style**. It is stored
**separately per site**, so `youtube.com` and `music.youtube.com` no longer overwrite
each other.

| Option | What you get |
|---|---|
| **Standard** | Nothing is overridden. The header, the search box and the panels stay exactly as YouTube / YouTube Music built them. |
| **Blur** | Light frosted glass. The watch playlist panel and the YT Music queue panel turn semi-transparent and blur what is behind them. |
| **Liquid Glass** | The heavier variant — more blur, more saturation, plus a soft gradient on the playlist panel. |
| **Transparent** | No tint and no blur; the panels are see-through. **Offered on `youtube.com` only** — YouTube Music deliberately does not get this option. |

> `Standard` is the one to pick when you want the original interface back. It is the
> only mode where the script adds no styling of its own.

Because the choice is per site, setting `Transparent` on YouTube and `Blur` on
YouTube Music sticks — changing something on one site no longer resets the other.

### 📺 YouTube Enhancements
- **🚀 High-Quality Downloads**: Download videos up to **4K/8K** (MP4) and high-fidelity audio (MP3/FLAC).
- **👎 Return YouTube Dislikes**: Restore the public dislike count with real-time synchronization.
- **🎬 Cinema & Ambient Mode**: Immersive viewing with dynamic background lighting.
- **📱 Smart Tools**: Picture-in-Picture mode, instant screenshots, and floating controls.
- **🌐 Comment Translator**: Translate comments instantly using integrated Google Translate.
- **🎧 Save Mix as playlist**: A Mix is a recommendation list that YouTube Music refuses to play and that cannot be saved. Turn it into a normal playlist and open it in YouTube Music. Off by default — turn it on in **Settings → General → Save Mix as playlist**.

### 🎵 YouTube Music (YTM) Specialized
- **🔮 Frosted queue panel**: The YT Music queue panel follows the **UI style** setting — frosted, liquid glass, or completely untouched on **Standard**.
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
Settings can fail to apply if a timeout fires before the preferences finish loading.
Refresh the page after installing or updating. If it still does not apply, clear
the stored value in the console and reload:
```js
GM_deleteValue('ytSettingsMDCM');
```

### 🔧 The "Save as playlist" button does not appear

The button only shows on a Mix, and only on the regular YouTube site — not on
YouTube Music. A Mix is any page whose `list` parameter starts with `RD`, which
covers all three shapes YouTube uses:

```text
list=RDMM                      unnamed mix
list=RDMM<token>               named mix (Mixes tab)
list=RD<videoId>&start_radio=1 mix seeded from a single video
```

If the setting is on but no button shows, check the browser console for a line
starting with `[YT Tools] mixPlaylist`: it prints whether the feature is enabled
and which `list` id was found.

Creating the playlist uses an internal YouTube endpoint that requires you to be
signed in. Signed out, the request comes back `401`, and the popover reports it.

---

### ⚠️ Ambilight needs hardware acceleration

**Turn on hardware acceleration before using Ambilight.** Without it the browser
falls back to software rendering (SwiftShader), the WebGL shader runs on the CPU,
and CPU usage climbs while the effect stutters badly.

On a laptop with integrated graphics this matters most.

**How to check:** open a new tab and go to `chrome://gpu`, then find the **WebGL**
row.

- `Hardware accelerated` → fine
- `SwiftShader` or `Software only` → **this is your problem**

**How to enable it:** `chrome://settings/system` → enable *Use graphics
acceleration when available* → **reload the browser** (a tab refresh is not enough).

Ambilight, the wave visualiser, and the YTM ambient glow all depend on this.
If CPU is high or effects stutter on a laptop, check this first.

---

## 🛠️ Development & Contribution

Built with a modern **Node.js** modular workflow for maximum performance and maintainability.

### 📁 Project Architecture

16 source modules across 5 directories. They are **concatenated into a single IIFE**, not imported.

| Directory | Files | Contents |
|---|---|---|
| `src/core/` | 3 | Userscript metadata, shared IIFE bootstrap and DOM helpers, DOM/security policy |
| `src/ui/` | 5 | Glassmorphic components, styles, settings menu, injected buttons |
| `src/features/` | 3 | WebGL Ambilight, Cinema mode, Mix → playlist |
| `src/main/` | 3 | DOM observers, feature manager, final bootstrap |
| `src/utils/` | 2 | Downloader/API wrappers, the main URL-and-settings module |

> **File placement gotcha:** the downloader lives in `src/utils/`, not `src/features/`.
> The wave visualiser and the dislike counter also live outside `src/features/`
> (`src/utils/url.js` and `src/core/policy.js`).

### ⚙️ Build Order Matters

`scripts/build.js` concatenates modules using an **explicit `FILE_ORDER` array**, not
alphabetical sorting or filesystem order. Declaration order determines execution order,
so a file added in the wrong slot can break the whole bundle.

`core/meta.js` comes first (it holds the userscript header), `core/init.js` next
(it opens the shared IIFE and declares the DOM/CSS helpers), and `main/final.js`
last (it runs the bootstrap). Keep the order in `FILE_ORDER` when you add a
module.

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
   | `npm run release` | Bump, commit and **force-push** to `main` |
   | `npm run push` | Commit without bumping |

> ⚠️ **Read this before using `npm run release` or `npm run push`.** Both stage with
> `git add .` — anything untracked gets swept into the commit — and both push with
> `--force`, which can discard commits on the remote. For a normal release, stage
> explicitly instead:
>
> ```bash
> git add -- src/ youtube-tools.user.js package.json
> git commit -m "feat: ..."
> git push origin main
> ```
>
> `npm run bump` is safe on its own; it only rewrites version strings and does not
> touch git.

---

## 📜 Credits

Crafted with passion by:
- [**Akari**](https://github.com/akari310) — Optimization & Development
- [**DeveloperMDCM**](https://github.com/DeveloperMDCM) — Original Project Creator
- [**nvbangg**](https://github.com/nvbangg/Nonstop_Audio_Only_for_Youtube_YTMusic) — Source for Audio-only & Nonstop features
- [**WesselKroos**](https://github.com/WesselKroos/youtube-ambilight) — Source/Inspiration for WebGL Ambilight feature ([Chrome Extension](https://chromewebstore.google.com/detail/ambient-light-for-youtube/paponcgjfojgemddooebbgniglhkajkj))

## 📄 License
This project is licensed under the [GNU General Public License v3.0](LICENSE).
