# YouTube Tools Userscript

**Version:** v2.4.4.2  
**Author:** DeveloperMDCM  
**License:** MIT
**Status:** ✅ 100% Modular ES Modules | ✅ All 28 Issues Resolved

All-in-one YouTube userscript for Tampermonkey/Greasemonkey/Violentmonkey. Full support for YouTube and YouTube Music with 23+ powerful features.

---

## 🚀 Key Features

| Icon | Feature                | Description                                                                    |
| ---- | ---------------------- | ------------------------------------------------------------------------------ |
| 📥   | **Download MP3/MP4**   | High-quality video/audio download via SaveNow + Dubs API (exponential backoff) |
| 👎   | **Return Dislike**     | Display dislike count via ReturnYouTubeDislike API (7-day cache)               |
| 📊   | **Watch Statistics**   | Total time, session, daily, weekly chart, top videos                           |
| 🔖   | **Bookmarks**          | Timestamp bookmarks in videos, saved permanently                               |
| ▶️   | **Continue Watching**  | Auto-save position, resume unfinished videos                                   |
| 🌊   | **Wave Visualizer**    | Real-time audio waveform (Web Audio API, SPA cleanup)                          |
| 💬   | **Translate Comments** | Translate comments via Google Translate API                                    |
| 🎨   | **Enhanced Themes**    | 8+ theme presets, custom themes, export/import, glassmorphism                  |

---

## 🎯 Complete Feature List (23 total)

### Download & Media

- 📥 Download MP3/MP4 (SaveNow + Dubs fallback)
- 📝 Download Description (video description as text)
- 🖼️ Avatar Download (channel avatar)

### Player Controls

- 🔊 Audio Only (music-only mode, hide video)
- 📐 Player Size (adjust player dimensions)
- 🎬 Cinematic Lighting (ambient lighting effect)
- 🔤 Disable Subtitles (turn off auto-captions)
- 🔄 Nonstop Playback (auto-skip when video ends)

### UI & Display

- 👎 Like/Dislike Bar (like/dislike ratio bar)
- 📈 Lockup Cached Stats (stats on thumbnails)
- 🔄 Reverse Mode (flip layout)
- 👁️ Hide Sidebar (collapse sidebar)
- 💬 Hide Comments (hide comment section)

### Shorts

- 📺 Shorts Channel Name (display channel name)
- 🎬 Shorts Reel Buttons (custom buttons)

### Statistics & Tracking

- 📊 Time Stats (detailed watch time statistics)

### Comments

- 💬 Translate Comments (translate to target language)
- 💬 Comment Observer (MutationObserver optimization)

### Entertainment

- 🌊 Wave Visualizer (3 modes: dynamic, bars, circular)
- 🎮 Effects Mini-game (dodge the bomb game)

### YouTube Music

- 🎵 YTM Ambient Mode (ambient mode for YTM)

### Quality of Life

- 🔖 Bookmarks (timestamp bookmarks)
- ▶️ Continue Watching (resume playback)

---

## 🖥️ Platform Support

| Platform              | Support    | Notes                                  |
| --------------------- | ---------- | -------------------------------------- |
| **youtube.com**       | ✅ Full    | All 23 features                        |
| **music.youtube.com** | ✅ Partial | Stats, download, dislike, ambient mode |
| **Tampermonkey**      | ✅         | Recommended                            |
| **Greasemonkey 4+**   | ✅         | localStorage fallback                  |
| **Violentmonkey**     | ✅         | Full support                           |

---

## 📦 Installation

### Method 1: Greasy Fork (Recommended)

1. Install **Tampermonkey** for your browser
2. Visit [Greasy Fork - YouTube Tools](https://greasyfork.org/scripts/460680)
3. Click **Install**
4. Go to YouTube — settings panel appears in top-right

### Method 2: Build from Source

```bash
# Clone repository
git clone https://github.com/DeveloperMDCM/youtube-tools.git
cd youtube-tools

# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Output: dist/youtube-tools-userscript.user.js
```

Install `dist/youtube-tools-userscript.user.js` into Tampermonkey.

---

## 🛠️ Development

### NPM Scripts

| Command                | Description                         | Output                                  |
| ---------------------- | ----------------------------------- | --------------------------------------- |
| `npm run dev`          | Rollup dev mode (watch)             | `dist/dev.user.js`                      |
| `npm run build`        | Vite production build               | `dist/youtube-tools-userscript.user.js` |
| `npm run lint`         | ESLint check                        | —                                       |
| `npm run lint:fix`     | ESLint auto-fix                     | —                                       |
| `npm run format`       | Prettier format                     | —                                       |
| `npm run format:check` | Prettier check                      | —                                       |
| `npm run verify`       | CI pipeline (build + lint + format) | —                                       |

### Build System

| Mode           | Tool                      | Entry         | Output                                  | Features              |
| -------------- | ------------------------- | ------------- | --------------------------------------- | --------------------- |
| **Dev**        | Rollup                    | `src/main.js` | `dist/dev.user.js`                      | Watch mode, sourcemap |
| **Production** | Vite + vite-plugin-monkey | `src/main.js` | `dist/youtube-tools-userscript.user.js` | Minified, auto header |
| **Dev (Alt)**  | Vite                      | `src/main.js` | `dist/dev.user.js`                      | Fast HMR              |

### Tech Stack

- **Runtime:** ES6+ Modules, GM APIs, Web Audio API, MutationObserver
- **Build:** Vite 8, Rollup, vite-plugin-monkey
- **Styling:** SCSS (modular: `_youtube.scss`, `_youtube-music.scss`, `_variables.scss`)
- **Linting:** ESLint v9 (flat config) + Prettier
- **UI Library:** iziToast (CDN via `@require`)
- **APIs:** ReturnYouTubeDislike, Google Translate, SaveNow, Dubs

---

## 📁 Project Structure

```
youtube-tools/
├── src/
│   ├── main.js                       # Entry point (ES Modules)
├── config/
│   ├── constants.js              # API endpoints, constants
│   ├── flags.js                  # Feature flags
│   └── settings-key.js           # Storage key constants
│   ├── features/                     # 23 modular features
│   │   ├── avatar-download.js        # Download channel avatar
│   │   ├── bookmarks.js              # Video bookmarks
│   │   ├── comments/                 # Comment-related features
│   │   │   ├── comment-observer.js   # Shared MutationObserver
│   │   │   ├── hide-comments.js     # Hide comments
│   │   │   └── translate-comments.js # Translate comments
│   │   ├── continue-watching.js      # Resume unfinished videos
│   │   ├── download.js               # MP3/MP4 download engine
│   │   ├── download-description.js   # Download video description
│   │   ├── effects.js                # Mini-game
│   │   ├── hide-sidebar.js           # Hide sidebar
│   │   ├── like-dislike-bar.js       # Like/dislike bar
│   │   ├── lockup-cached-stats.js    # Stats on thumbnails
│   │   ├── player/                   # Player-related features
│   │   │   ├── audio-only.js         # Music-only mode
│   │   │   ├── cinematic-lighting.js # Ambient lighting effect
│   │   │   ├── disable-subtitles.js  # Disable auto-captions
│   │   │   ├── nonstop-playback.js   # Auto-skip on end
│   │   │   ├── player-size.js        # Adjust player size
│   │   │   └── reverse-mode.js       # Flip layout
│   │   ├── shorts/                   # Shorts-related features
│   │   │   ├── shorts-channel-name.js # Display channel name
│   │   │   └── shorts-reel-buttons.js # Custom buttons
│   │   ├── time-stats.js             # Watch time statistics
│   │   ├── wave-visualizer.js        # Audio waveform
│   │   └── ytm-ambient-mode.js       # YTM ambient mode
│   ├── ui/
│   │   ├── components/
│   │   │   ├── settings-panel/       # Settings panel module
│   │   │   │   ├── index.js          # Entry point
│   │   │   │   ├── template.js       # HTML template (38KB)
│   │   │   │   └── events.js         # Event handlers
│   │   │   ├── shared/               # Shared UI components
│   │   │   ├── theme-selector/       # Theme selector component
│   │   │   │   ├── index.js          # Theme selector UI
│   │   │   │   └── style.scss        # Theme selector styles
│   │   │   ├── toolbar/              # Download toolbar
│   │   │   └── video-info-panel/     # Video info panel
│   │   ├── styles/                   # SCSS stylesheets
│   │   │   ├── _variables.scss       # CDN imports + CSS variables
│   │   │   ├── _youtube.scss         # YouTube styles (2,120 lines)
│   │   │   ├── _youtube-music.scss   # YTM styles (235 lines)
│   │   │   └── _stats.scss           # Stats panel styles
│   │   ├── gear-icon.js              # Settings gear button
│   │   └── video-info-panel.js       # Video info panel
│   ├── settings/
│   │   ├── defaults.js               # Default settings
│   │   ├── settings-manager.js       # Settings loader/saver
│   │   ├── settings-dom.js           # Shared settings state
│   │   ├── persistence.js            # Settings persistence
│   │   └── storage-key.js            # Storage key constants
│   ├── themes/
│   │   ├── core/                     # Core theme functionality
│   │   │   └── index.js              # Core theme exports
│   │   ├── presets/                  # Theme presets
│   │   │   └── index.js              # 8 theme presets + utilities
│   │   ├── utils/                    # Theme utilities
│   │   │   └── theme-manager.js      # Advanced theme management
│   │   ├── theme-engine.js           # Enhanced theme engine
│   │   ├── theme-data.js             # Legacy theme data
│   │   ├── applier.js                # Theme application logic
│   │   └── apply-settings.js         # Circular dependency fix
│   └── utils/
│       ├── dom.js                    # DOM helpers
│       ├── helpers.js                # FormatterNumber, getCurrentVideoId
│       ├── logger.js                 # Centralized logging
│       ├── fetch-queue.js            # Bounded fetch queue
│       ├── runtime.js                # __ytToolsRuntime global state
│       ├── state.js                  # Wave visualizer state
│       ├── storage.js                # GM storage wrapper
│       └── trusted-types.js          # Trusted Types / CSP compliance
```

---

## 🔌 API Integrations

| API                      | Endpoint                                 | Purpose             | Cache Policy                      |
| ------------------------ | ---------------------------------------- | ------------------- | --------------------------------- |
| **ReturnYouTubeDislike** | `returnyoutubedislikeapi.com/Votes`      | Dislike count       | 10min in-memory, 7 days persisted |
| **Google Translate**     | `translate.googleapis.com/translate_a/t` | Comment translation | None                              |
| **SaveNow**              | `p.savenow.to/ajax/download.php`         | Primary download    | None                              |
| **Dubs**                 | `dubs.io/wp-json/tools/v1/`              | Fallback download   | None                              |

---

## ✅ Migration Status

### Completed (v2.4.4.2)

- ✅ **100% Modular ES Modules** — `legacy-full.js` deleted
- ✅ **28/28 Issues Resolved** — See migration summary below
- ✅ **New UI System** — Glassmorphic settings panel, toolbar, theme engine
- ✅ **Storage Refactor** — Universal `gmRawGet`/`gmRawSet` wrappers
- ✅ **SPA Navigation** — Proper cleanup on `yt-navigate-finish`
- ✅ **Memory Leaks Fixed** — FetchQueue class, RAF loop cleanup
- ✅ **Null Safety** — All features have null guards
- ✅ **Locale-aware Parsing** — Uses `hl` URL param

### Migration Summary

All 28 issues from the original code review have been resolved:

**Phase 1: Critical Fixes (6/6)** ✅

- Dual codebase architecture — Legacy removed
- Panel UI scope errors — Restructured
- Silent error swallowing — Added logging
- State fragmentation — Unified runtime object
- Promise chain memory leak — FetchQueue class
- RAF loop cleanup — SPA navigation handler

**Phase 2: Core Architecture (7/7)** ✅

- Storage mechanism inconsistency — GM wrappers
- Locale-dependent parsing — `hl` param detection
- Download polling backoff — Exponential backoff
- Video metadata caching — metaCache per videoId
- State boilerplate — Simplified to plain object
- Hardcoded translate language — Settings-based
- Missing SPA handler — Added to all features

**Phase 3: Code Quality (7/7)** ✅

- Null-check gaps — Optional chaining
- Duplicate code — Removed
- DOM query optimization — Cached selectors
- Time formatting — Unified formatter
- Legacy DOM IDs — English IDs
- Settings key consistency — Centralized constants
- Centralized logging — logger.js

**Phase 4: Polish (8/8)** ✅

- Large HTML template — Separate file
- Monolithic CSS — Split into modules
- Unused imports — Cleaned up
- Duplicate selectors — Shared utils
- Input validation — Added guards
- Accessibility — ARIA attributes
- Prettier config — Created
- Build log cleanup — .gitignore

### Known Limitations

- ⬜ **No Test Coverage** — Test framework not yet implemented
- ⬜ **API Rate Limits** — SaveNow/Dubs may be rate-limited

---

## 📚 Documentation

| File                         | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| [PROJECT.md](PROJECT.md)     | Architecture, initialization flow, state management |
| [CHANGELOG.md](CHANGELOG.md) | Version history and changelog                       |
| [AGENTS.md](AGENTS.md)       | AI agent development guide                          |

---

## 🐛 Troubleshooting

### Panel not showing?

1. Check if Tampermonkey has the script enabled
2. Refresh YouTube page (F5)
3. Clear browser cache

### Download not working?

1. API key may be expired — check `src/config/constants.js`
2. CORS issues — try VPN/proxy
3. SaveNow/Dubs server temporarily down

### Wave visualizer not running?

1. YouTube may have connected its own AudioContext
2. Check browser console (F12)
3. Disable/enable again in settings

---

## 📄 License

MIT © DeveloperMDCM

---

## 🔗 Links

- **GitHub:** https://github.com/DeveloperMDCM/youtube-tools
- **Greasy Fork:** https://greasyfork.org/scripts/460680
- **Issues:** https://github.com/DeveloperMDCM/youtube-tools/issues
