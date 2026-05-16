# YouTube Tools Userscript

**Version:** v2.4.4.2  
**Author:** DeveloperMDCM  
**License:** MIT
**Status:** ✅ 100% Modular ES Modules | ✅ All 28 Issues Resolved

Công cụ YouTube tất cả trong một — userscript cho Tampermonkey/Greasemonkey/Violentmonkey. Hỗ trợ đầy đủ YouTube và YouTube Music với 23+ tính năng mạnh mẽ.

---

## 🚀 Tính năng nổi bật

| Icon | Tính năng              | Mô tả                                                                       |
| ---- | ---------------------- | --------------------------------------------------------------------------- |
| 📥   | **Download MP3/MP4**   | Tải video/audio chất lượng cao qua SaveNow + Dubs API (exponential backoff) |
| 👎   | **Return Dislike**     | Hiển thị lượt dislike qua ReturnYouTubeDislike API (cache 7 ngày)           |
| 📊   | **Thống kê xem**       | Tổng thời gian, session, daily, weekly chart, top videos                    |
| 🔖   | **Bookmarks**          | Đánh dấu timestamp trong video, lưu vĩnh viễn                               |
| ▶️   | **Continue Watching**  | Tự động lưu vị trí, resume video đang xem dở                                |
| 🌊   | **Wave Visualizer**    | Sóng âm thanh real-time (Web Audio API, cleanup SPA)                        |
| 💬   | **Translate Comments** | Dịch bình luận qua Google Translate API                                     |
| 🎨   | **Enhanced Themes**    | 8+ theme presets, custom themes, export/import, glassmorphism               |

---

## 🎯 Danh sách đầy đủ tính năng (23 total)

### Download & Media

- 📥 Download MP3/MP4 (SaveNow + Dubs fallback)
- 📝 Download Description (tải mô tả video)
- 🖼️ Avatar Download (tải avatar kênh)

### Player Controls

- 🔊 Audio Only (chế độ chỉ nghe nhạc)
- 📐 Player Size (điều chỉnh kích thước)
- 🎬 Cinematic Lighting (ambient lighting effect)
- 🔤 Disable Subtitles (tắt phụ đề tự động)
- 🔄 Nonstop Playback (auto-skip khi kết thúc)

### UI & Display

- 👎 Like/Dislike Bar (thanh tỷ lệ like/dislike)
- 📈 Lockup Cached Stats (stats trên thumbnails)
- 🔄 Reverse Mode (đảo ngược layout)
- 👁️ Hide Sidebar (ẩn sidebar)
- 💬 Hide Comments (ẩn bình luận)

### Shorts

- 📺 Shorts Channel Name (hiển thị tên kênh)
- 🎬 Shorts Reel Buttons (nút tùy chỉnh)

### Statistics & Tracking

- 📊 Time Stats (thống kê thời gian xem chi tiết)

### Comments

- 💬 Translate Comments (dịch bình luận)
- 💬 Comment Observer (MutationObserver optimization)

### Entertainment

- 🌊 Wave Visualizer (3 chế độ: dynamic, bars, circular)
- 🎮 Effects Mini-game (game né bom)

### YouTube Music

- 🎵 YTM Ambient Mode (ambient mode cho YTM)

### Quality of Life

- 🔖 Bookmarks (đánh dấu timestamp)
- ▶️ Continue Watching (tiếp tục xem dở)

---

## 🖥️ Hỗ trợ nền tảng

| Nền tảng              | Hỗ trợ     | Ghi chú                                |
| --------------------- | ---------- | -------------------------------------- |
| **youtube.com**       | ✅ Full    | Tất cả 23 tính năng                    |
| **music.youtube.com** | ✅ Partial | Stats, download, dislike, ambient mode |
| **Tampermonkey**      | ✅         | Recommended                            |
| **Greasemonkey 4+**   | ✅         | Fallback localStorage                  |
| **Violentmonkey**     | ✅         | Full support                           |

---

## 📦 Cài đặt

### Cách 1: Greasy Fork (Recommended)

1. Cài **Tampermonkey** cho trình duyệt
2. Truy cập [Greasy Fork - YouTube Tools](https://greasyfork.org/scripts/460680)
3. Click **Install**
4. Vào YouTube — panel settings xuất hiện góc phải

### Cách 2: Build từ Source

```bash
# Clone repository
git clone https://github.com/DeveloperMDCM/youtube-tools.git
cd youtube-tools

# Cài đặt dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Output: dist/youtube-tools-userscript.user.js
```

Cài file `dist/youtube-tools-userscript.user.js` vào Tampermonkey.

---

## 🛠️ Development

### NPM Scripts

| Command                | Mô tả                               | Output                                  |
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

## 📁 Cấu trúc dự án

```
youtube-tools/
├── src/
├── main.js                       # Entry point (ES Modules)
├── config/
│   ├── constants.js              # API endpoints, constants
│   ├── flags.js                  # Feature flags
│   └── settings-key.js           # Storage key constants
├── features/                     # 23 tính năng modular
│   ├── avatar-download.js        # Tải avatar kênh
│   ├── bookmarks.js              # Bookmark video
│   ├── comments/                 # Comment-related features
│   │   ├── comment-observer.js   # MutationObserver chung
│   │   ├── hide-comments.js     # Ẩn bình luận
│   │   └── translate-comments.js # Dịch bình luận
│   ├── continue-watching.js      # Tiếp tục video đang xem
│   ├── download.js               # Download engine MP3/MP4
│   ├── download-description.js   # Tải mô tả video
│   ├── effects.js                # Mini-game
│   ├── hide-sidebar.js           # Ẩn sidebar
│   ├── like-dislike-bar.js       # Thanh like/dislike
│   ├── lockup-cached-stats.js    # Thống kê trên thumbnails
│   ├── player/                  # Player-related features
│   │   ├── audio-only.js         # Chế độ chỉ nghe nhạc
│   │   ├── cinematic-lighting.js # Hiệu ứng ambient lighting
│   │   ├── disable-subtitles.js  # Tắt phụ đề tự động
│   │   ├── nonstop-playback.js  # Tự động chuyển video
│   │   ├── player-size.js       # Điều chỉnh kích thước player
│   │   └── reverse-mode.js       # Đảo ngược giao diện
│   ├── shorts/                  # Shorts-related features
│   │   ├── shorts-channel-name.js # Hiển thị tên kênh
│   │   └── shorts-reel-buttons.js # Nút tùy chỉnh
│   ├── time-stats.js             # Thống kê thời gian xem
│   ├── wave-visualizer.js        # Sóng nhạc real-time
│   └── ytm-ambient-mode.js       # YouTube Music ambient mode
├── ui/
│   ├── components/
│   │   ├── settings-panel/       # Settings panel module
│   │   │   ├── index.js          # Entry point
│   │   │   ├── template.js       # HTML template (38,429 bytes)
│   │   │   └── events.js         # Event handlers
│   │   ├── shared/               # Shared UI components
│   │   ├── theme-selector/       # Theme selector component
│   │   │   ├── index.js          # Theme selector UI
│   │   │   └── style.scss        # Theme selector styles
│   │   ├── toolbar/              # Download toolbar
│   │   └── video-info-panel/     # Panel thông tin video
│   ├── styles/                   # SCSS stylesheets
│   │   ├── _variables.scss       # CDN imports + CSS variables
│   │   ├── _youtube.scss         # Styles cho YouTube (2,120 dòng)
│   │   ├── _youtube-music.scss   # Styles cho YouTube Music (235 dòng)
│   │   └── _stats.scss           # Stats panel styles
│   ├── gear-icon.js              # Settings gear button
│   └── video-info-panel.js       # Panel thông tin video
├── settings/
│   ├── defaults.js               # Default settings (56 dòng)
│   ├── settings-manager.js       # Settings loader/saver
│   ├── settings-dom.js           # Shared settings state
│   ├── persistence.js           # Settings persistence
│   └── storage-key.js           # Storage key constants
├── themes/
│   ├── core/                     # Core theme functionality
│   │   └── index.js             # Core theme exports
│   ├── presets/                   # Theme presets
│   │   └── index.js             # 8 theme presets + utilities
│   ├── utils/                     # Theme utilities
│   │   └── theme-manager.js       # Advanced theme management class
│   ├── theme-engine.js           # Enhanced theme engine
│   ├── theme-data.js             # Legacy theme data
│   ├── applier.js               # Theme application logic
│   └── apply-settings.js        # Circular dependency fix
└── utils/
    ├── dom.js                    # DOM helpers
    ├── helpers.js                # FormatterNumber, getCurrentVideoId
    ├── logger.js                 # Centralized logging
    ├── fetch-queue.js            # Bounded fetch queue
    ├── runtime.js                # __ytToolsRuntime global state
    ├── state.js                  # State cho wave visualizer
    ├── storage.js                # GM storage wrapper
    └── trusted-types.js          # Trusted Types / CSP compliance
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
- ✅ **28/28 Issues Resolved** — See [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md)
- ✅ **New UI System** — Glassmorphic settings panel, toolbar, theme engine
- ✅ **Storage Refactor** — Universal `gmRawGet`/`gmRawSet` wrappers
- ✅ **SPA Navigation** — Proper cleanup on `yt-navigate-finish`
- ✅ **Memory Leaks Fixed** — FetchQueue class, RAF loop cleanup
- ✅ **Null Safety** — All features have null guards
- ✅ **Locale-aware Parsing** — Uses `hl` URL param

### Known Limitations

- ⬜ **No Test Coverage** — Test framework not yet implemented
- ⬜ **API Rate Limits** — SaveNow/Dubs may be rate-limited

---

## 📚 Documentation

| File                                   | Description                                         |
| -------------------------------------- | --------------------------------------------------- |
| [PROJECT.md](PROJECT.md)               | Architecture, initialization flow, state management |
| [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md) | 28 issues analysis by severity                      |
| [CHECKLIST.md](CHECKLIST.md)           | Issue-by-issue fix checklist                        |
| [FEATURE_PARITY.md](FEATURE_PARITY.md) | Legacy vs modular feature comparison                |
| [AGENTS.md](AGENTS.md)                 | AI agent development guide                          |

---

## 🐛 Troubleshooting

### Panel không hiển thị?

1. Kiểm tra Tampermonkey đã enable script chưa
2. F5 trang YouTube
3. Xóa cache trình duyệt

### Download không hoạt động?

1. API key có thể hết hạn — kiểm tra `src/config/constants.js`
2. CORS issues — thử dùng VPN/proxy
3. Server SaveNow/Dubs tạm thời down

### Wave visualizer không chạy?

1. YouTube có thể đã connect AudioContext riêng
2. Kiểm tra browser console (F12)
3. Disable/enable lại trong settings

---

## 📄 License

MIT © DeveloperMDCM

---

## 🔗 Links

- **GitHub:** https://github.com/DeveloperMDCM/youtube-tools
- **Greasy Fork:** https://greasyfork.org/scripts/460680
- **Issues:** https://github.com/DeveloperMDCM/youtube-tools/issues
