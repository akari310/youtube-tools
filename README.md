# YouTube Tools Userscript

**Version:** v2.4.4.2  
**Author:** DeveloperMDCM  
**License:** MIT

Công cụ YouTube tất cả trong một — userscript cho Tampermonkey/Greasemonkey, hoạt động trên YouTube và YouTube Music. Tải xuống MP3/MP4 chất lượng cao, hiển thị lượt dislike, thống kê thời gian xem, dịch bình luận, visualizer âm thanh và nhiều tính năng khác.

---

## Tính năng

| Tính năng                  | Mô tả                                                    |
| -------------------------- | -------------------------------------------------------- |
| 📥 **Download MP3/MP4**    | Tải video/audio chất lượng cao qua SaveNow và Dubs API   |
| 👎 **Return Dislike**      | Hiển thị lượt dislike qua ReturnYouTubeDislike API       |
| 📊 **Thống kê xem**        | Tổng thời gian, session, today, top videos, weekly chart |
| 🔖 **Bookmarks**           | Đánh dấu timestamp trong video                           |
| ▶️ **Continue Watching**   | Tiếp tục video đang xem dở                               |
| 🌊 **Wave Visualizer**     | Hiển thị sóng âm thanh real-time (Web Audio API)         |
| 💬 **Translate Comments**  | Dịch bình luận qua Google Translate API                  |
| 🎮 **Effects Mini-game**   | Game nhỏ trong panel                                     |
| 📐 **Player Size**         | Điều chỉnh kích thước player                             |
| 📺 **Shorts Channel Name** | Hiển thị tên kênh trên YouTube Shorts                    |
| 📈 **Cached Stats**        | Thống kê lượt xem trên video cards                       |
| 🔊 **Audio Only**          | Chế độ chỉ nghe nhạc, ẩn video                           |
| 🎨 **Cinematic Lighting**  | Hiệu ứng ambient lighting xung quanh video               |
| 🖼️ **Avatar Download**     | Tải avatar kênh YouTube                                  |
| 🔄 **Nonstop Playback**    | Tự động chuyển video tiếp theo khi kết thúc              |
| 🔀 **Reverse Mode**        | Đảo ngược layout giao diện                               |
| 👁️ **Hide Sidebar**        | Ẩn sidebar                                              |
| 💬 **Hide Comments**       | Ẩn section bình luận                                     |
| 🎬 **Shorts Reel Buttons** | Nút tùy chỉnh trên Shorts reel                           |
| 📝 **Download Description**| Tải mô tả video dạng text                                |
| 🔤 **Disable Subtitles**   | Tắt phụ đề tự động                                       |
| 🎵 **YTM Ambient Mode**    | Ambient mode cho YouTube Music                           |

---

## Hỗ trợ nền tảng

- **youtube.com** — toàn bộ tính năng
- **music.youtube.com** — thống kê nghe nhạc, download, dislike, ambient mode
- Tampermonkey / Greasemonkey / Violentmonkey (cần hỗ trợ GM API)

---

## Cài đặt

### Cách 1: Cài từ Greasy Fork

> _Script có sẵn trên Greasy Fork — tìm "YouTube Tools All in one local download"_

1. Cài Tampermonkey cho trình duyệt
2. Truy cập Greasy Fork và cài đặt script
3. Vào YouTube — panel sẽ xuất hiện ở góc phải

### Cách 2: Build từ source

```bash
# Clone repo
git clone https://github.com/DeveloperMDCM/youtube-tools.git
cd youtube-tools

# Cài dependencies
npm install

# Build production
npm run build

# Output: dist/youtube-tools-userscript.user.js
```

Cài file `dist/youtube-tools-userscript.user.js` vào Tampermonkey.

---

## Development

### Scripts

| Command              | Mô tả                                                     |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Dev mode với Rollup — watch `src/`, output `dist/dev.user.js` |
| `npm run build`      | Production build với Vite + vite-plugin-monkey            |
| `npm run lint`       | ESLint check                                              |
| `npm run lint:fix`   | ESLint auto-fix                                           |
| `npm run format`     | Prettier format toàn bộ                                   |
| `npm run format:check` | Check Prettier                                          |
| `npm run verify`     | Build + lint + format check (CI pipeline)                 |

### Cấu trúc build

- **Dev mode** (`rollup.config.dev.js`): Input `src/main.js` → output `dist/dev.user.js` (IIFE + sourcemap inline)
- **Production** (`vite.config.js`): Entry `src/main.js`, plugin `vite-plugin-monkey`, output userscript với đầy đủ header/grant/match

### Công nghệ

- **Build:** Vite + Rollup + vite-plugin-monkey
- **CSS:** SCSS (tách thành _youtube, _youtube-music, _variables, _stats)
- **Lint/Format:** ESLint v9 + Prettier
- **Dependencies:** iziToast (CDN, load qua `@require`)

---

## Cấu trúc dự án

```
src/
├── main.js                       # Entry point (ES Modules)
├── config/
│   ├── constants.js              # API endpoints, constants
│   ├── flags.js                  # Feature flags
│   └── settings-key.js           # Storage key constants
├── features/                     # 21 tính năng modular
│   ├── audio-only.js             # Chế độ chỉ nghe nhạc
│   ├── avatar-download.js        # Tải avatar kênh
│   ├── bookmarks.js              # Bookmark video
│   ├── cinematic-lighting.js     # Ambient lighting effect
│   ├── comment-observer.js       # MutationObserver chung
│   ├── continue-watching.js      # Tiếp tục video đang xem
│   ├── disable-subtitles.js      # Tắt phụ đề tự động
│   ├── download.js               # Download engine MP3/MP4
│   ├── download-description.js   # Tải mô tả video
│   ├── effects.js                # Mini-game
│   ├── hide-comments.js          # Ẩn bình luận
│   ├── hide-sidebar.js           # Ẩn sidebar
│   ├── like-dislike-bar.js       # ReturnYouTubeDislike
│   ├── lockup-cached-stats.js    # Stats trên video cards
│   ├── nonstop-playback.js       # Tự động chuyển video
│   ├── player-size.js            # Điều chỉnh player size
│   ├── reverse-mode.js           # Đảo ngược layout
│   ├── shorts-channel-name.js    # Tên kênh Shorts
│   ├── shorts-reel-buttons.js    # Nút Shorts reel
│   ├── time-stats.js             # Thống kê thời gian
│   ├── translate-comments.js     # Dịch bình luận
│   ├── wave-visualizer.js        # Visualizer âm thanh
│   └── ytm-ambient-mode.js       # YTM ambient mode
├── ui/
│   ├── settings-panel.js         # Entry point settings panel
│   ├── settings-panel-html.js    # HTML template
│   ├── settings-panel-events.js  # Event handlers
│   ├── settings-panel.scss       # Entry SCSS (@use 3 files)
│   ├── _variables.scss           # CDN imports + CSS variables
│   ├── _youtube.scss             # Styles cho YouTube (2,120 dòng)
│   ├── _youtube-music.scss       # Styles cho YouTube Music (235 dòng)
│   ├── _stats.scss               # Stats panel styles
│   ├── toolbar.js                # Download toolbar
│   ├── gear-icon.js              # Settings gear button
│   └── video-info-panel.js       # Panel thông tin video
├── settings/
│   ├── defaults.js               # Default settings
│   └── settings-manager.js       # Settings loader/saver
├── themes/
│   ├── theme-engine.js           # Theme management
│   └── theme-data.js             # Theme presets
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

## API Integrations

| API                  | Endpoint                                 | Mục đích          |
| -------------------- | ---------------------------------------- | ----------------- |
| ReturnYouTubeDislike | `returnyoutubedislikeapi.com/Votes`      | Lấy lượt dislike  |
| Google Translate     | `translate.googleapis.com/translate_a/t` | Dịch bình luận    |
| SaveNow              | `p.savenow.to/ajax/download.php`         | Download MP3/MP4  |
| Dubs                 | `dubs.io/wp-json/tools/v1/`              | Download fallback |

---

## Known Issues

Dự án đã hoàn tất migration từ monolithic legacy sang kiến trúc modular 100%. Tất cả **28 issues** từ [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md) đã được resolved. Chi tiết xem [CHECKLIST.md](CHECKLIST.md).

### Đã resolved (28/28) ✅

- ✅ Dual Codebase — legacy-full.js đã bị xóa
- ✅ State Fragmentation — đã đơn giản hóa
- ✅ Memory leaks — FetchQueue class, RAF cleanup
- ✅ Null-check gaps — tất cả feature có null guard
- ✅ Và 24 issues khác

### Chưa có

- ⬜ Test coverage — chưa có test framework

---

## Tài liệu

- [PROJECT.md](PROJECT.md) — Kiến trúc chi tiết, luồng khởi tạo, state management
- [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md) — 28 issues phân loại theo severity
- [CHECKLIST.md](CHECKLIST.md) — Checklist fix từng issue
- [FEATURE_PARITY.md](FEATURE_PARITY.md) — So sánh tính năng
- [AGENTS.md](AGENTS.md) — Hướng dẫn cho AI agent

---

## License

MIT © DeveloperMDCM
