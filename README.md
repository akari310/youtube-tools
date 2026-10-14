<div align="center">

# YouTube Ultimate Tools

**Downloads, ambient lighting, comment translation and 20+ toggles — for YouTube and YouTube Music, with separate settings for each.**

[![Greasy Fork](https://img.shields.io/greasyfork/v/576162?label=Version&color=red&style=for-the-badge)](https://greasyfork.org/scripts/576162)
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

## Install

You need a userscript manager, then the script.

| Manager | Chrome | Firefox |
|---|---|---|
| **Tampermonkey** *(recommended)* | [add](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [add](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) |
| **Violentmonkey** | [add](https://chromewebstore.google.com/detail/violentmonkey/jinjacbljjnnnndkhlebbnbiomkhpnih) | [add](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) |

[![Install](https://img.shields.io/badge/Install-YouTube_Ultimate_Tools-FF0000?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://greasyfork.org/scripts/576162/code/YouTube%20Ultimate%20Tools.user.js)

Then **refresh a YouTube tab you already have open** — a brand-new tab is fine too, but
the gear button only appears once the page finishes loading.

| | Where the gear button appears |
|---|---|
| **youtube.com** | Top-right of the page header, beside the YouTube menu button |
| **music.youtube.com** | At the very top of the **right sidebar**, above your library |

## Before you start

Three things catch people out on their first run. All three are fixed further down.

1. **Turn on hardware acceleration** if you want Ambilight or the wave visualiser. Check
   `chrome://gpu` — see [below](#troubleshooting).
2. **Allowlist the download servers** in your adblocker, or downloads fail.
3. **Downloads are proxied through third-party servers.** The script asks `savenow.to` /
   `lbserver.xyz` / `dubs.io` for a direct file link and pulls the FFmpeg core from
   `cdn.jsdelivr.net`. Your video request goes through those servers, not straight to
   YouTube. Settings, bookmarks and history stay in your browser.

---

## What you get

### Downloading

| | Formats | Notes |
|---|---|---|
| **Video** | `144p`–`1080p` **MP4** · `1440p` `2160p` `4320p` **WEBM** | Above 1080p is WEBM only |
| **Audio** | `FLAC` `WAV` `WEBM` (lossless) · `MP3` `M4A` `AAC` `OPUS` `OGG` (lossy) | Lossless is labelled UHQ in the menu |

Files are **tagged in-browser** — title, artist, album and cover art go straight into the
file (ID3v2 for MP3, Vorbis Comments for FLAC) before it downloads.

### Settings

Everything lives in the **General** tab. Anything not marked *(on)* is **off by default**.

<div align="center">
  <img src="assets/settings-general.png?v=1" alt="The YouTube Tools settings panel, General tab. Twenty-two checkboxes in a two-column grid: Active Themes, Ambilight, Audio-only mode, Audio-only this tab, Bookmarks, Cinematic Mode, Save Mix as playlist, Continue watching, Disable Annotations, Disable Autoplay, Disable Subtitles, Download avatars, Hide Comments, Hide Sidebar, Like vs Dislike bar, Nonstop playback, Reverse mode, Royal Purple Timeline, Shorts channel name, Show Dislikes, Translate comments and Wave visualizer Beta. Three are ticked by default. Below the grid sit four dropdowns for UI style, visualiser effect, default player quality and translation language, plus a video player size slider." width="300">
</div>

<p align="center"><sub>Rebuilt from the script's own markup and stylesheet.</sub></p>

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

Five more controls sit below the grid: **UI style**, **Effect wave visualizer**, **Default
video player quality**, **Language for translate comments** (12 languages) and **Video
Player Size** with a *Reset* button.

> Three labels read `Disable something`. Those are the real menu labels — they mean *"turn
> this YouTube behaviour off"*, not *"stop disabling it"*.

### Interface style

**Settings → General → UI style.** YouTube and YouTube Music remember the choice
separately, so the two sites can look different at the same time.

| Style | What you see |
|---|---|
| `Standard` | Nothing is overridden. Header, search box and panels stay exactly as YouTube built them. |
| `Blur` | Light frosted glass on the watch playlist panel and the YT Music queue panel. |
| `Liquid Glass` | Heavier glass — more blur, more saturation, plus a soft gradient on the playlist panel. |
| `Transparent` | No tint, no blur. **Offered on `youtube.com` only.** |

Colours and background image live on the **Themes** tab:

<div align="center">
  <img src="assets/settings-themes.png?v=1" alt="The YouTube Tools settings panel, Themes tab. A background image picker, then Choose a Theme with Custom or Selected Themes, followed by colour pickers for progress bar, background, primary, secondary, header, icons, menu and line colours." width="300">
</div>

### Player buttons

The script also adds its own row of buttons — and **the two sites do not get the same set**.

<div align="center">
  <img src="assets/toolbar.png?v=1" alt="Two rows of player buttons on a dark background. The youtube.com row has eight buttons: image video, repeat video, add bookmark, show bookmarks, history, an MP4/MP3 download, picture to picture and screenshot. The music.youtube.com row has six: image video, MP4, MP3, close, picture to picture and screenshot." width="440">
</div>

<p align="center"><sub>Left: <code>youtube.com</code>, 8 buttons. Right: <code>music.youtube.com</code>, 6.</sub></p>

| youtube.com | music.youtube.com |
|---|---|
| Image video | Image video |
| Repeat video | MP4 |
| Add bookmark | MP3 |
| Show bookmarks | Close |
| History | Picture to picture |
| MP4 / MP3 download | Screenshot video |
| Picture to picture | |
| Screenshot video | |

Repeat video and the bookmark/history buttons are guarded by `if (!isYTMusic)`, so they are
never built on YouTube Music.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| No gear button after installing | Tab not refreshed, or the manager has not granted access |
| `Network Error` while downloading | Adblocker eating the API |
| Settings open but changes do nothing | Preferences did not finish loading |
| Effects stutter, CPU at 100% | No hardware acceleration |
| "Save Mix as playlist" missing | Wrong site, or signed out |

Found something else? [Open an issue →](https://github.com/akari310/youtube-tools/issues/new)

<details>
<summary><b>No gear button after installing</b></summary>

1. **Refresh the tab you were already on.** A page open before you installed keeps running
   the old version until you reload.
2. **Check the manager granted permission.** Click the Tampermonkey icon → this script →
   allow access to `youtube.com` and `music.youtube.com`.
3. **Confirm the script is enabled** — the Tampermonkey dashboard shows a toggle per script.
4. **Check the page.** Shorts, watch pages and YouTube Music work; embedded players and most
   `youtube.com` sub-pages do not carry the script's UI.

</details>

<details>
<summary><b>Network Error during downloads</b></summary>

Add these to **uBlock Origin → Dashboard → My filters**, at the very bottom:

```text
@@||savenow.to^
@@||lbserver.xyz^
@@||dubs.io^
@@||cdn.jsdelivr.net^
```

`@@` means "do not block". `dubs.io` is the fallback provider; `cdn.jsdelivr.net` serves
the FFmpeg core used to convert and tag files — both are required even when the primary
provider works.

The last rule unblocks a whole CDN. To keep it narrow, leave it out first and only add it if
a conversion or tagging step fails.

**Still failing?** Open DevTools (`F12`) → Console and retry. The script logs
`SaveNow provider did not return success/progress_url` or `All SaveNow providers failed`,
which names the host that actually failed.

</details>

<details>
<summary><b>Settings do not apply</b></summary>

A timeout can fire before preferences finish loading on a slow connection. **Refresh the
page** — that fixes it most of the time.

Otherwise, in the DevTools console:

```js
GM_deleteValue('ytSettingsMDCM');
```

⚠️ This wipes **every** stored setting. Copy it out first if you want to restore it:
`copy(GM_getValue('ytSettingsMDCM'))`

</details>

<details>
<summary><b>Ambilight needs hardware acceleration</b></summary>

Without it the browser falls back to software rendering (SwiftShader), the WebGL shader runs
on the CPU, and the effect stutters. This matters most on laptops with integrated graphics.

Check `chrome://gpu` → **WebGL** row:

- `Hardware accelerated` → fine
- `SwiftShader` or `Software only` → this is your problem

Enable it at `chrome://settings/system` → *Use graphics acceleration when available* →
**restart the browser**. A tab refresh is not enough. Ambilight, the wave visualiser and the
YT Music ambient glow all depend on this.

</details>

<details>
<summary><b>"Save Mix as playlist" does not appear</b></summary>

The button only shows on a Mix, and only on the regular YouTube site. A Mix is any page
whose `list` parameter starts with `RD`; in the examples below `<token>` stands for any
characters:

```text
list=RDMM                      unnamed mix
list=RDMM<token>               named mix (Mixes tab)
list=RD<videoId>&start_radio=1 mix seeded from a single video
```

Check the console for a line starting with `[YT Tools] mixPlaylist` — it prints whether
the feature is enabled and which `list` id was found.

Creating the playlist uses an internal YouTube endpoint that needs you signed in. Signed
out, the request returns `401`.

</details>

> The script declares `@connect *` because the final file URL is returned by the API at
> runtime, so the full set of possible hosts cannot be listed up front.

---

## Building from source

Node.js 18 or newer (tested on 24.x). One dependency: `fs-extra`.

```bash
git clone https://github.com/akari310/youtube-tools.git
cd youtube-tools
npm install
npm run build      # → youtube-tools.user.js at the repo root
```

<details>
<summary><b>Layout and build order</b></summary>

16 modules across 5 directories, **concatenated into one IIFE** — not imported.

| Directory | Files | Contents |
|---|---|---|
| `src/core/` | 3 | Userscript header, shared bootstrap and DOM helpers, DOM/security policy |
| `src/ui/` | 5 | Glass components, shared DOM helpers, styles, settings menu, injected buttons |
| `src/features/` | 3 | WebGL Ambilight, Cinema mode, Mix → playlist |
| `src/main/` | 3 | DOM observers, feature manager, bootstrap |
| `src/utils/` | 2 | Downloader/API wrappers, URL-and-settings module |

> **Placement gotcha:** the downloader lives in `src/utils/`, not `src/features/`. The wave
> visualiser and dislike counter also sit outside `src/features/`.

`scripts/build.js` concatenates using an **explicit `FILE_ORDER` array** — not
alphabetical, not filesystem order. Declaration order is execution order, so a module in
the wrong slot can break the whole bundle. `core/meta.js` first, `core/init.js` next (it
opens the IIFE), `main/final.js` last (it runs the bootstrap).

</details>

<details>
<summary><b>Commands</b></summary>

| Command | Effect |
|---|---|
| `npm run build` | Concatenate `src/` into `youtube-tools.user.js` |
| `npm run bump` | Bump the version across every location it appears |
| `npm run release` | Bump, commit, **force-push** to `main` |
| `npm run push` | Commit without bumping |

⚠️ **Do not run `npm run release` or `npm run push` casually.** Both stage with `git add .`
— anything untracked gets swept in — and both push with `--force`. Stage explicitly:

```bash
git add -- src/ youtube-tools.user.js package.json
git commit -m "feat: ..."
git push origin main
```

`npm run bump` touches no git state on its own. But a **push that includes a bumped
`youtube-tools.user.js`** kicks off the release workflow, which publishes a public GitHub
Release the moment it sees that version. Confirm the bump is intended before you push — a
published release cannot be taken back, and deleting the tag afterwards only makes the next
bump collide with it.

</details>

---

## Credits

| | |
|---|---|
| [**Akari**](https://github.com/akari310) | Optimization & development |
| [**DeveloperMDCM**](https://github.com/DeveloperMDCM) | Original project creator |
| [**nvbangg**](https://github.com/nvbangg/Nonstop_Audio_Only_for_Youtube_YTMusic) | Audio-only & nonstop playback |
| [**WesselKroos**](https://github.com/WesselKroos/youtube-ambilight) | WebGL Ambilight — [original extension](https://chromewebstore.google.com/detail/ambient-light-for-youtube/paponcgjfojgemddooebbgniglhkajkj) |

[GPL-3.0](LICENSE) © Akari, DeveloperMDCM, nvbangg