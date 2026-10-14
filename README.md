<div align="center">

# YouTube Ultimate Tools

**A modular, glassmorphic userscript that upgrades both YouTube and YouTube Music — downloads, ambient lighting, comment translation, and 20+ toggles you can actually turn off.**

[![Greasy Fork](https://img.shields.io/greasyfork/v/576162?label=Version&color=red&style=for-the-badge)](https://greasyfork.org/scripts/576162)
[![Installs](https://img.shields.io/greasyfork/total_installs/576162?label=Installs&color=brightgreen&style=for-the-badge)](https://greasyfork.org/scripts/576162)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/akari310/youtube-tools?style=for-the-badge)](https://github.com/akari310/youtube-tools)

[**Install from Greasy Fork →**](https://greasyfork.org/scripts/576162/code/YouTube%20Ultimate%20Tools.user.js)

</div>

---

<div align="center">
  <img src="assets/yt_preview.png?v=2" alt="YouTube watch page with Ambilight casting a blue glow from the video across the header, player and comments. Below the player sits the injected download toolbar. On the right, the Mix watch-next panel is restyled with frosted glass, with the script's recently-viewed History panel underneath it" width="49%">
  <img src="assets/ytm_preview.png?v=2" alt="YouTube Music with Ambilight casting a green glow from the album art across the whole page, and a frosted queue panel on the right with the injected tool icons in its header" width="49%">
</div>

<p align="center"><sub>Ambilight sampling the picture, the injected toolbar, and the frosted queue panel — the same script on both sites.</sub></p>

---

## Contents

- [What it does](#what-it-does)
- [Install](#install)
- [Before you start](#before-you-start)
- [Configuring the interface](#configuring-the-interface)
- [Troubleshooting](#troubleshooting)
- [Building from source](#building-from-source)
- [Credits](#credits)
- [License](#license)

---

## What it does

### Downloading

| | Formats | Notes |
|---|---|---|
| **Video** | `144p`–`1080p` **MP4** · `1440p` `2160p` `4320p` **WEBM** | Higher than 1080p is only available as WEBM |
| **Audio** | `FLAC` `WAV` `WEBM` (lossless) · `MP3` `M4A` `AAC` `OPUS` `OGG` (lossy) | Lossless is only labelled UHQ in the menu |

Extracted files are **tagged in-browser**: title, artist, album and cover art are written
straight into the file — ID3v2 for MP3, Vorbis Comments for FLAC — before it downloads.
You get a finished, library-ready file, not a raw stream.

### Settings

Everything lives in the **General** tab of the script panel. Anything not marked *(on)*
is **off by default**.

<div align="center">
  <img src="assets/settings-general.png?v=1" alt="The YouTube Tools settings panel, General tab. Twenty-two checkboxes in a two-column grid: Active Themes, Ambilight, Audio-only mode, Audio-only this tab, Bookmarks, Cinematic Mode, Save Mix as playlist, Continue watching, Disable Annotations, Disable Autoplay, Disable Subtitles, Download avatars, Hide Comments, Hide Sidebar, Like vs Dislike bar, Nonstop playback, Reverse mode, Royal Purple Timeline, Shorts channel name, Show Dislikes, Translate comments and Wave visualizer Beta. Three are ticked by default. Below the grid sit four dropdowns for UI style, visualiser effect, default player quality and translation language, plus a video player size slider." width="360">
</div>

<p align="center"><sub>The <strong>General</strong> tab — rebuilt from the script's own markup and stylesheet.</sub></p>

**Toggles**

| Appearance | Playback | Community |
|---|---|---|
| Active Themes | Nonstop playback *(on)* | Show Dislikes *(on)* |
| Ambilight | Audio-only mode | Like vs Dislike bar |
| Cinematic Mode | Audio-only this tab | Translate comments |
| Royal Purple Timeline | Reverse mode | Download avatars |
| Wave visualizer Beta *(on)* | Disable Autoplay | Bookmarks (timestamps) |
| Shorts: show channel name | Disable Subtitles | Save Mix as playlist |
| UI style | Disable Annotations | Continue watching |
| | Hide Comments | |
| | Hide Sidebar | |

**Dropdowns and sliders**

| Control | Options |
|---|---|
| **UI style** | `Standard` · `Blur` · `Liquid Glass` · `Transparent` — [detailed below](#configuring-the-interface) |
| **Effect wave visualizer** | how the visualiser draws |
| **Default video player quality** | which quality the player opens at |
| **Language for translate comments** | 12 languages |
| **Video Player Size** | slider, plus *Reset video size* |

> Three labels read `Disable something`. Those are the real menu labels — they mean *"turn
> this YouTube behaviour off"*, not *"stop disabling it"*.

> **Save Mix as playlist** only works on `youtube.com`, and only when signed in — see
> [its troubleshooting entry](#the-save-mix-as-playlist-button-does-not-appear).

### Player buttons

Separate from the settings, the script adds a row of buttons under the player:

`Image video` · `Repeat video` · `Picture to picture` · `Screenshot video` ·
`Add bookmark` · `Show bookmarks` · `History` · and an `MP4` / `MP3` / `Close` download menu

---

## Install

### 1 · Get a userscript manager

| Manager | Chrome | Firefox |
|---|---|---|
| **Tampermonkey** *(recommended)* | [add](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [add](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) |
| **Violentmonkey** | [add](https://chromewebstore.google.com/detail/violentmonkey/jinjacbljjnnnndkhlebbnbiomkhpnih) | [add](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) |

### 2 · Install the script

[![Install](https://img.shields.io/badge/Install-YouTube_Ultimate_Tools-FF0000?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://greasyfork.org/scripts/576162/code/YouTube%20Ultimate%20Tools.user.js)

Then **refresh a YouTube tab you already have open** — a brand-new tab is fine too, but the
gear button only appears once the page finishes loading.

| | Where the gear button appears |
|---|---|
| **youtube.com** | Top-right of the page header, beside the YouTube menu button |
| **music.youtube.com** | At the very top of the **right sidebar**, above your library |

> **The settings button does not appear?** See [the first
> troubleshooting entry](#nothing-appears-after-installing).

---

## Before you start

Three things catch people out on their first run. All three are fixed further down this
document — this is just the short version so you don't have to go looking.

1. **Turn on hardware acceleration** if you want Ambilight or the wave visualiser. Without
   it the browser falls back to software rendering, the shader runs on the CPU, and the
   effect stutters. Check `chrome://gpu` → see [Ambilight needs hardware
   acceleration](#ambilight-needs-hardware-acceleration).

2. **Allowlist the download servers in your adblocker.** uBlock Origin and similar blockers
   break downloads by default — see [Network Error during
   downloads](#network-error-during-downloads).

3. **Downloads are proxied through third-party servers.** The script asks
   `savenow.to` / `lbserver.xyz` / `dubs.io` for a direct file link, and pulls the FFmpeg
   core from `cdn.jsdelivr.net`. Your video request goes through those servers, not
   directly to YouTube. Everything else — settings, bookmarks, history — stays in your
   browser via Tampermonkey storage.

---

## Configuring the interface

**Settings → General → UI style.** YouTube and YouTube Music remember their choice
separately, so the two sites can look different at the same time.

<div align="center">
  <img src="assets/settings-themes.png?v=1" alt="The YouTube Tools settings panel, Themes tab. A background image picker, then Choose a Theme with Custom or Selected Themes, followed by colour pickers for progress bar, background, primary, secondary, header, icons, menu and line colours." width="360">
</div>

<p align="center"><sub>The <strong>Themes</strong> tab — where the background image and colour palette live.</sub></p>

The dropdown in the General tab picks the interface finish:

| Style | What you see |
|---|---|
| `Standard` | Nothing is overridden. Header, search box and panels stay exactly as YouTube built them. |
| `Blur` | Light frosted glass on the watch playlist panel and the YT Music queue panel. |
| `Liquid Glass` | A heavier glass — more blur, more saturation, plus a soft gradient on the playlist panel. |
| `Transparent` | No tint, no blur — the panels are see-through. **Offered on `youtube.com` only.** |

---

## Troubleshooting

### Quick lookup

| Symptom | Cause | Fix |
|---|---|---|
| Nothing appears after installing | Tab not refreshed, or the manager is blocking the script | [Below](#nothing-appears-after-installing) |
| `Network Error` while downloading | Adblocker eating the API | [Below](#network-error-during-downloads) |
| Settings opens but changes do nothing | Preferences did not finish loading | [Below](#settings-do-not-apply) |
| Effects stutter, CPU pinned at 100% | No hardware acceleration | [Below](#ambilight-needs-hardware-acceleration) |
| "Save Mix as playlist" button missing | Wrong site, or signed out | [Below](#the-save-mix-as-playlist-button-does-not-appear) |

Found something else? [Open an issue →](https://github.com/akari310/youtube-tools/issues/new)

### Nothing appears after installing

1. **Refresh the tab you were already on.** A page that was open before you installed the
   script keeps running the old version until you reload it.
2. **Check the manager actually granted permission.** Tampermonkey shows a permissions
   prompt on first install. If you dismissed it, click the Tampermonkey icon in the toolbar
   → this script → allow access to `youtube.com` and `music.youtube.com`.
3. **Confirm the script is enabled** — the Tampermonkey dashboard shows a green toggle per
   script.
4. **Check you are on a supported page.** Shorts, watch pages and YouTube Music all work;
   embedded players and most `youtube.com` sub-pages do not carry the script's UI.

### Network Error during downloads

uBlock Origin and similar blockers break the download API. Add these to **uBlock Origin →
Dashboard → My filters**, at the very bottom:

```text
@@||savenow.to^
@@||lbserver.xyz^
@@||dubs.io^
@@||cdn.jsdelivr.net^
```

`@@` is the prefix that means "do not block". `dubs.io` is the fallback provider and
`cdn.jsdelivr.net` serves the FFmpeg core used to convert and tag files — both are
required even when the primary provider works. Hit **Apply changes**, then refresh.

> The last rule unblocks an entire CDN, not just one file. If you would rather keep it
> narrow, leave it out first and try the download — you only need it when a conversion or
> tagging step fails.

**Still failing?** The script prints every failed request to the browser console. Open
DevTools (`F12`) → Console, retry the download, and look for `SaveNow provider did not
return success/progress_url` or `All SaveNow providers failed` — the message names the
host that actually failed, which is the one to allowlist.

> The script declares `@connect *` because the final file URL is returned by the API at
> runtime, so the full set of possible hosts cannot be listed up front.

### Settings do not apply

A timeout can fire before your preferences finish loading on a slow connection. **Refresh
the page** — that alone fixes it most of the time.

If it still sticks, clear the saved value in the console and reload. Open DevTools
(`F12`) → Console and run:

```js
GM_deleteValue('ytSettingsMDCM');
```

> ⚠️ This wipes **every** stored setting — themes, bookmarks, history, and the Mix
> playlist option all return to defaults. Copy the value out first if you want to restore
> it: `copy(GM_getValue('ytSettingsMDCM'))`

### Ambilight needs hardware acceleration

**Turn hardware acceleration on before using Ambilight.** Without it the browser falls
back to software rendering (SwiftShader), the WebGL shader runs on the CPU, and the
effect stutters while CPU climbs. This matters most on laptops with integrated graphics.

Check `chrome://gpu` and look at the **WebGL** row:

- `Hardware accelerated` → fine
- `SwiftShader` or `Software only` → this is your problem

To enable: `chrome://settings/system` → *Use graphics acceleration when available* →
**restart the browser** (a tab refresh is not enough). Ambilight, the wave visualiser and
the YT Music ambient glow all depend on this.

### The Save Mix as playlist button does not appear

The button only shows on a Mix, and only on the regular YouTube site — not on YouTube
Music. A Mix is any page whose `list` parameter starts with `RD`, which covers all three
shapes YouTube uses. In the examples below, `<token>` stands for any characters:

```text
list=RDMM                      unnamed mix
list=RDMM<token>               named mix (Mixes tab)
list=RD<videoId>&start_radio=1 mix seeded from a single video
```

If the setting is on but no button appears, check the browser console for a line starting
with `[YT Tools] mixPlaylist` — it prints whether the feature is enabled and which `list`
id was found.

Creating the playlist uses an internal YouTube endpoint that requires you to be signed
in. Signed out, the request returns `401` and the popover reports it.

---

## Building from source

Node.js 18 or newer (tested on 24.x). One dependency: `fs-extra`.

```bash
git clone https://github.com/akari310/youtube-tools.git
cd youtube-tools
npm install
npm run build      # → youtube-tools.user.js at the repo root
```

### Layout

16 modules across 5 directories, **concatenated into one IIFE** — not imported.

| Directory | Files | Contents |
|---|---|---|
| `src/core/` | 3 | Userscript header, shared bootstrap and DOM helpers, DOM/security policy |
| `src/ui/` | 5 | Glass components, shared DOM helpers, styles, settings menu, injected buttons |
| `src/features/` | 3 | WebGL Ambilight, Cinema mode, Mix → playlist |
| `src/main/` | 3 | DOM observers, feature manager, bootstrap |
| `src/utils/` | 2 | Downloader/API wrappers, URL-and-settings module |

> **Placement gotcha:** the downloader lives in `src/utils/`, not `src/features/`. The
> wave visualiser and dislike counter also sit outside `src/features/`
> (`src/utils/url.js` and `src/core/policy.js`).

### Build order matters

`scripts/build.js` concatenates using an **explicit `FILE_ORDER` array** — not
alphabetical, not filesystem order. Declaration order is execution order, so a module in
the wrong slot can break the whole bundle.

`core/meta.js` first (it holds the userscript header), `core/init.js` next (it opens the
shared IIFE and declares the DOM/CSS helpers), `main/final.js` last (it runs the
bootstrap). Keep new modules in their `FILE_ORDER` slot.

### Commands

| Command | Effect |
|---|---|
| `npm run build` | Concatenate `src/` into `youtube-tools.user.js` |
| `npm run bump` | Bump the version across every location it appears |
| `npm run release` | Bump, commit, **force-push** to `main` |
| `npm run push` | Commit without bumping |

> ⚠️ **Do not run `npm run release` or `npm run push` casually.** Both stage with
> `git add .` — anything untracked gets swept into the commit — and both push with
> `--force`, which can discard commits on the remote. Stage explicitly instead:
>
> ```bash
> git add -- src/ youtube-tools.user.js package.json
> git commit -m "feat: ..."
> git push origin main
> ```
>
> `npm run bump` touches no git state on its own — it only rewrites version strings. But a
> **push that includes a bumped `youtube-tools.user.js`** kicks off the GitHub Actions
> release workflow, which publishes a GitHub Release the moment it sees that version. The
> release is public and permanent, so **confirm the bump is intended before you push** — a
> published release cannot be taken back, and deleting the tag afterwards only makes the
> next bump collide with it.

---

## Credits

| | |
|---|---|
| [**Akari**](https://github.com/akari310) | Optimization & development |
| [**DeveloperMDCM**](https://github.com/DeveloperMDCM) | Original project creator |
| [**nvbangg**](https://github.com/nvbangg/Nonstop_Audio_Only_for_Youtube_YTMusic) | Audio-only & nonstop playback |
| [**WesselKroos**](https://github.com/WesselKroos/youtube-ambilight) | WebGL Ambilight — [original extension](https://chromewebstore.google.com/detail/ambient-light-for-youtube/paponcgjfojgemddooebbgniglhkajkj) |

---

## License

[GPL-3.0](LICENSE) © Akari, DeveloperMDCM, nvbangg
