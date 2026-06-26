# YouTube Tools — Architecture & Project Documentation

**Project:** `youtube-tools-userscript` v2.4.4.2  
**Type:** Tampermonkey Userscript  
**Build:** Vite + vite-plugin-monkey (production) / Rollup (dev)  
**Last Updated:** 2026-05-16  
**Status:** ✅ 100% Modular ES Modules | ✅ All 28 Issues Resolved

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Initialization Flow](#initialization-flow)
3. [State Management](#state-management)
4. [API Integrations](#api-integrations)
5. [Feature Details](#feature-details)
6. [Build Pipeline](#build-pipeline)
7. [Project Structure](#project-structure)
8. [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Architecture Overview

This project is a **Tampermonkey userscript** that runs on YouTube and YouTube Music. The codebase has completed migration from monolithic legacy to **100% modular ES modules**.

```
┌───────────────────────────────────────────────────┐
│                  src/main.js                      │
│              (Entry Point)                        │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Modular ES6 Modules                        │  │
│  │  • features/ (21 modules)                   │  │
│  │  • ui/ (settings-panel, toolbar, gear...)   │  │
│  │  • themes/ (theme-engine, theme-data)       │  │
│  │  • utils/ (dom, storage, runtime...)        │  │
│  │  • settings/ (defaults, manager)            │  │
│  │  • config/ (constants, flags, keys)         │  │
│  └──────────────────────┬──────────────────────┘  │
│                         ▼                         │
│              YouTube DOM / GM APIs                │
└───────────────────────────────────────────────────┘
```

### Migration Completed

- ✅ `legacy-full.js` (~8,800 lines) deleted
- ✅ `script.js`, `scripts/sync-legacy.mjs`, `scripts/verify-parity.mjs` deleted
- ✅ All 28 issues from ERROR_ANALYSIS.md resolved

---

## Initialization Flow

```
1. Tampermonkey injects script into youtube.com
2. Vite build → IIFE wrapper around all code
3. main.js executes:
   ├── Import settings-manager (loadSettings)
   ├── Import theme-engine (initThemeEngine)
   ├── Import UI components (panel, toolbar, gear, video-info)
   ├── Import all 21 feature modules
   ├── loadSettings() → read config from GM storage
   ├── initThemeEngine(settings) → apply theme
   ├── createPanel() + initSettingsEvents() → settings panel
   ├── initToolbar() → download toolbar
   ├── initGearIcon() → gear button
   ├── initVideoInfoPanel() → video metadata panel
   ├── Run each feature with settings (try-catch)
   ├── setTimeout(checkNewVersion, 3000)
   ├── Listen 'yt-navigate-finish' → reinit all
   └── Listen 'yt-tools-settings-changed' → reinit
```

### SPA Navigation Handler

YouTube is a Single Page Application — when users click on a video, the page doesn't reload. The script uses custom events:

```javascript
window.addEventListener('yt-navigate-finish', () => {
  reinitAll(settings);
});
```

All features have this handler or are called via reinitAll.

---

## State Management

### 2 Primary State Sources

| Source             | File               | Scope         | Examples                                                   |
| ------------------ | ------------------ | ------------- | ---------------------------------------------------------- |
| `__ytToolsRuntime` | `utils/runtime.js` | Window global | `__ytToolsRuntime.dislikesCache`, `modularStatsIntervalId` |
| GM storage         | Tampermonkey       | Persistent    | `GM_getValue('ytSettingsMDCM', '{}')`                      |

Module-level variables in `time-stats.js` and `state.js` are used for per-feature local state.

### Storage Mechanism

- **Settings:** `GM_getValue('ytSettingsMDCM', '{}')` — JSON (YouTube) / `GM_getValue('ytmSettingsMDCM', '{}')` — JSON (YouTube Music)
- **Statistics:** `GM_setValue('YT_TOTAL_USAGE', ...)`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`, `YT_DETAILED_STATS`, `YT_DAILY_STATS`, `YT_SESSION_START`
- **Bookmarks:** `GM_setValue('YT_BOOKMARKS', ...)`
- **Continue Watching:** `GM_setValue('YT_CONTINUE_VIDEO', ...)`
- **Dislike Cache:** `GM_setValue('ytLikesDislikesCacheMDCM', ...)` + `__ytToolsRuntime.dislikesCache` (in-memory)

---

## API Integrations

### ReturnYouTubeDislike

```
Endpoint: https://returnyoutubedislikeapi.com/Votes?videoId={id}
Method: GET
Cache: 10 phút (in-memory), persistent 7 ngày qua GM storage
Flow:
  1. Check __ytToolsRuntime.dislikesCache (10-min TTL)
  2. Check persisted cache (GM_getValue)
  3. Fetch API → cache kết quả
```

### Google Translate

```
Endpoint: https://translate.googleapis.com/translate_a/t
Parameters: client=dict-chrome-ex, sl=auto, tl={target}, q={text}
Target: Đọc từ settings.translateTarget (mặc định 'en')
```

### SaveNow Download API

```
Endpoint: https://p.savenow.to/ajax/download.php
Fallbacks: ['https://p.savenow.to', 'https://p.lbserver.xyz']
API Key: 'dfcb6d76f2f6a9894gjkege8a4ab232222' (default, có thể override)
Flow:
  1. Gửi request download với video ID + API key
  2. Polling progress với exponential backoff (failCount max 5, delay max 16s)
  3. Trả về download URL khi hoàn thành
```

### Dubs Download Provider (Fallback)

```
Start:  https://dubs.io/wp-json/tools/v1/download-video
Status: https://dubs.io/wp-json/tools/v1/status-video
Method: POST (JSON)
```

---

## Feature Details

### 1. Download (`src/features/download.js`)

- **Purpose:** Download MP4 video or MP3 audio from YouTube
- **Providers:** SaveNow (primary) + Dubs (fallback)
- **UI:** Download toolbar with progress UI (`src/ui/toolbar.js`)

### 2. Like/Dislike Bar (`src/features/like-dislike-bar.js`)

- **Purpose:** Display like/dislike ratio bar + dislike count
- **API:** ReturnYouTubeDislike
- **Parsing:** `parseCountText()` — locale-aware (reads `hl` URL param)

### 3. Time Stats (`src/features/time-stats.js`)

- **Purpose:** Track video/shorts watch time, session, daily, weekly statistics
- **Storage:** `YT_TOTAL_USAGE`, `YT_VIDEO_TIME`, `YT_SHORTS_TIME`, `YT_DETAILED_STATS`, `YT_DAILY_STATS`, `YT_SESSION_START`
- **UI:** Stats panel (`src/ui/_stats.scss`)
- **Update interval:** 1 second | **Save interval:** 30 seconds

### 4. Wave Visualizer (`src/features/wave-visualizer.js`)

- **Purpose:** Real-time audio waveform visualizer using Web Audio API
- **Tech:** AudioContext → AnalyserNode → Canvas (requestAnimationFrame loop)
- **Cleanup:** `cleanupWaveVisualizer()` called on SPA navigate

### 5. Bookmarks (`src/features/bookmarks.js`)

- **Purpose:** Save timestamp bookmarks in videos
- **Storage:** `GM_getValue('YT_BOOKMARKS', '[]')`

### 6. Continue Watching (`src/features/continue-watching.js`)

- **Purpose:** Save current position and auto-resume
- **Storage:** `GM_setValue('YT_CONTINUE_VIDEO', ...)`
- **Cache:** `metaCache` Map per videoId

### 7. Translate Comments (`src/features/translate-comments.js`)

- **Purpose:** Translate YouTube comments to another language
- **API:** Google Translate
- **Target:** Reads from `settings.translateTarget`

### 8. Effects Mini-game (`src/features/effects.js`)

- **Purpose:** Mini-game (dodge the bomb) inside panel
- **Input:** Keyboard (Space, Arrow keys)

### 9. Player Size (`src/features/player-size.js`)

- **Purpose:** Allow users to adjust video player size
- **Has SPA navigation handler**

### 10. Shorts Channel Name (`src/features/shorts-channel-name.js`)

- **Purpose:** Display channel name on YouTube Shorts
- **Tech:** IntersectionObserver + `FetchQueue` bounded concurrency

### 11. Cached Stats on Video Cards (`src/features/lockup-cached-stats.js`)

- **Purpose:** Display cached statistics on video lockup cards

### 12. Audio Only (`src/features/player/audio-only.js`)

- **Purpose:** Hide video, play audio only — black background + art

### 13. Avatar Download (`src/features/avatar-download.js`)

- **Purpose:** Download YouTube channel avatar

### 14. Cinematic Lighting (`src/features/cinematic-lighting.js`)

- **Purpose:** Ambient lighting effect around video player

### 15. Comment Observer (`src/features/comments/comment-observer.js`)

- **Purpose:** Shared MutationObserver for comments

### 16. Disable Subtitles (`src/features/disable-subtitles.js`)

- **Purpose:** Turn off auto-captions

### 17. Download Description (`src/features/download-description.js`)

- **Purpose:** Download video description as text

### 18. Hide Comments (`src/features/hide-comments.js`)

- **Purpose:** Hide comment section

### 19. Hide Sidebar (`src/features/hide-sidebar.js`)

- **Purpose:** Collapse sidebar

### 20. Nonstop Playback (`src/features/nonstop-playback.js`)

- **Purpose:** Auto-skip to next video when current ends

### 21. Reverse Mode (`src/features/reverse-mode.js`)

- **Purpose:** Flip layout horizontally

### 22. Shorts Reel Buttons (`src/features/shorts-reel-buttons.js`)

- **Purpose:** Custom buttons on Shorts reel

### 23. YTM Ambient Mode (`src/features/ytm-ambient-mode.js`)

- **Purpose:** Ambient mode for YouTube Music

---

## Build Pipeline

### Dev Mode (Rollup)

```
src/main.js → Rollup → dist/dev.user.js
              └─ IIFE format
              └─ Inline sourcemap
              └─ Userscript header
```

### Alternative Dev Mode (Vite)

```
src/main.js → Vite (vite.config.dev.js) → dist/dev.user.js
              └─ ES modules + watch mode
              └─ Hot reload support
```

### Production Build (Vite + vite-plugin-monkey)

```
src/main.js → Vite → dist/youtube-tools-userscript.user.js
   ├── ES6 imports tree-shaken
   ├── SCSS compiled to CSS
   ├── vite-plugin-monkey generates userscript header
   └─ @require iziToast CDN
```

- Entry point: `src/main.js` (imports all modular features + UI + themes)
- `vite-plugin-monkey` automatically generates metadata block
- iziToast loaded via CDN (not bundled)

---

## Project Structure

```
youtube-tools/
│
├── README.md                   # User documentation
├── PROJECT.md                  # Architecture docs (this file)
├── CHANGELOG.md                # Version history
├── AGENTS.md                   # AI agent guide
│
├── package.json                # v2.4.4.2, scripts, deps
├── vite.config.js              # Production build config
├── vite.config.dev.js          # Vite dev build config
├── rollup.config.dev.js        # Rollup dev build config
├── eslint.config.js            # ESLint v9 flat config
├── .prettierrc                 # Prettier config
├── .gitignore
│
├── src/
│   ├── main.js                 # Entry point — imports everything
│   │
│   ├── config/
│   │   ├── constants.js        # API URLs, keys, wave constants
│   │   ├── flags.js            # Feature flags
│   │   └── settings-key.js     # Storage key constants
│   │
│   ├── features/
│   │   ├── avatar-download.js  # Download channel avatar
│   │   ├── bookmarks.js        # Video bookmarks
│   │   ├── comments/           # Comment-related features
│   │   │   ├── comment-observer.js # Shared MutationObserver
│   │   │   ├── hide-comments.js # Hide comments
│   │   │   └── translate-comments.js # Translate comments
│   │   ├── continue-watching.js # Resume playback
│   │   ├── download.js         # MP3/MP4 download engine
│   │   ├── download-description.js # Download video description
│   │   ├── effects.js          # Mini-game
│   │   ├── hide-sidebar.js     # Hide sidebar
│   │   ├── like-dislike-bar.js # RYD integration + bar
│   │   ├── lockup-cached-stats.js # Cached stats cards
│   │   ├── player/             # Player-related features
│   │   │   ├── audio-only.js   # Music-only mode
│   │   │   ├── cinematic-lighting.js # Ambient lighting effect
│   │   │   ├── disable-subtitles.js # Disable auto-captions
│   │   │   ├── nonstop-playback.js # Auto-skip on end
│   │   │   ├── player-size.js  # Player width adjustment
│   │   │   └── reverse-mode.js # Flip layout
│   │   ├── shorts/             # Shorts-related features
│   │   │   ├── shorts-channel-name.js # Display channel name
│   │   │   └── shorts-reel-buttons.js # Custom buttons
│   │   ├── time-stats.js       # Usage tracking + stats
│   │   ├── wave-visualizer.js  # Audio waveform visualizer
│   │   └── ytm-ambient-mode.js # YTM ambient mode
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── settings-panel/ # Settings panel module
│   │   │   │   ├── index.js    # Entry point
│   │   │   │   ├── template.js # HTML template (38KB)
│   │   │   │   ├── events.js   # Event handlers
│   │   │   │   └── style.scss  # Settings panel styles
│   │   │   ├── theme-selector/ # Theme selector component
│   │   │   │   ├── index.js    # Theme selector UI
│   │   │   │   └── style.scss  # Theme selector styles
│   │   │   ├── shared/         # Shared UI components
│   │   │   ├── toolbar/        # Download toolbar
│   │   │   └── video-info-panel/ # Video info panel
│   │   ├── styles/             # SCSS stylesheets
│   │   │   ├── _variables.scss # CDN imports + CSS variables
│   │   │   ├── _youtube.scss   # YouTube styles (2,120 lines)
│   │   │   ├── _youtube-music.scss # YTM styles (235 lines)
│   │   │   └── _stats.scss     # Stats panel styles
│   │   ├── gear-icon.js        # Settings gear button
│   │   └── video-info-panel.js # Video info panel
│   │
│   ├── settings/
│   │   ├── defaults.js         # Default settings values
│   │   ├── settings-manager.js # Settings loader/saver
│   │   ├── settings-dom.js     # Shared settings state
│   │   ├── persistence.js     # Settings persistence
│   │   └── storage-key.js     # Storage key constants
│   │
│   ├── themes/
│   │   ├── core/                     # Core theme functionality
│   │   └── index.js             # Core theme exports
│   │   ├── presets/                   # Theme presets
│   │   └── index.js             # 8 theme presets + utilities
│   │   ├── utils/                     # Theme utilities
│   │   └── theme-manager.js       # Advanced theme management class
│   │   ├── theme-engine.js           # Enhanced theme engine
│   │   ├── theme-data.js             # Legacy theme data
│   │   ├── applier.js               # Theme application logic
│   │   └── apply-settings.js        # Circular dependency fix
│   │
│   └── utils/
│       ├── dom.js              # DOM helpers
│       ├── helpers.js          # FormatterNumber, getCurrentVideoId
│       ├── logger.js           # Centralized logging
│       ├── fetch-queue.js      # Bounded fetch queue
│       ├── runtime.js          # __ytToolsRuntime state
│       ├── state.js            # Wave visualizer state
│       ├── storage.js          # GM storage wrapper + cache
│       └── trusted-types.js    # Trusted Types + CSP-safe HTML
│
└── dist/
    └── youtube-tools-userscript.user.js  # Production build
```

---

## Known Issues & Technical Debt

### Resolved (28/28) ✅

All 28 issues from ERROR_ANALYSIS.md have been resolved. Details:

| Phase                   | Total  | Done   |
| ----------------------- | ------ | ------ |
| Phase 1: Critical Fixes | 6      | **6**  |
| Phase 2: Architecture   | 7      | **7**  |
| Phase 3: Code Quality   | 7      | **7**  |
| Phase 4: Polish         | 8      | **8**  |
| **TOTAL**               | **28** | **28** |

### Automated Test Suite

- **Test Framework:** Vitest + JSDOM
- **Coverage:** Unit tests for core helper utilities, storage, and memory cleanup management (`src/tests/**/*.test.js`).
- **Command:** `npm run test` (33 unit tests passing)

---

## CSP & Security

The project uses **Trusted Types** to comply with YouTube's Content Security Policy:

```javascript
// src/utils/trusted-types.js
export function safeHTML(html) {
  /* ... */
}
export function setHTML(el, html) {
  /* ... */
}
```

Panel UI dùng `setHTML()` để inject HTML template một cách an toàn.

## GM API Grants

```javascript
'GM_info'; // Script metadata
'GM_addStyle'; // Inject CSS
'GM_setValue'; // Write persistent storage
'GM_getValue'; // Read persistent storage
'unsafeWindow'; // Access window object
'GM_registerMenuCommand'; // Tampermonkey menu
```

---

## Migration Roadmap

Goal: **remove `import './legacy-full.js'`** — ✅ COMPLETED

1. ✅ Phase 1 — Fix critical bugs
2. ✅ Phase 2 — Design unified AppState, fix core architecture
3. ✅ Phase 3 — Improve code quality, consistency
4. ✅ Phase 4 — Extract inline HTML, split CSS, cleanup
5. ✅ **Removed `legacy-full.js`** — Codebase 100% modular
