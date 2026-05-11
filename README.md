# YouTube Tools Userscript

**Version:** v2.4.3.2  
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

---

## Hỗ trợ nền tảng

- **youtube.com** — toàn bộ tính năng
- **music.youtube.com** — thống kê nghe nhạc, download, dislike (một số tính năng bị giới hạn)
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
npm run build:full

# Output: dist/youtube-tools-userscript.user.js
```

Cài file `dist/youtube-tools-userscript.user.js` vào Tampermonkey.

---

## Development

### Scripts

| Command                 | Mô tả                                                     |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Dev mode với Rollup — watch `src/`, output IIFE           |
| `npm run build`         | Production build với Vite + vite-plugin-monkey            |
| `npm run build:full`    | Sync legacy + build production                            |
| `npm run lint`          | ESLint check                                              |
| `npm run lint:fix`      | ESLint auto-fix                                           |
| `npm run format`        | Prettier format toàn bộ                                   |
| `npm run format:check`  | Check Prettier                                            |
| `npm run verify:parity` | Kiểm tra đồng bộ legacy ↔ modular                         |
| `npm run verify`        | Build + verify parity + lint + format check (CI pipeline) |

### Cấu trúc build

- **Dev mode** (`rollup.config.dev.js`): Input `src/legacy-full.js` → output `dist/dev.user.js` (IIFE + sourcemap inline)
- **Production** (`vite.config.js`): Entry `src/main.js`, plugin `vite-plugin-monkey`, output userscript với đầy đủ header/grant/match

### Công nghệ

- **Build:** Vite + Rollup + vite-plugin-monkey
- **CSS:** SCSS (compile qua Vite)
- **Lint/Format:** ESLint v9 + Prettier
- **Dependencies:** iziToast (CDN, load qua `@require`)

---

## Cấu trúc dự án

```
src/
├── main.js                    # Entry point (dual import: modular + legacy)
├── legacy-full.js             # 8,814-line legacy (đồng bộ từ script.js)
├── config/
│   ├── flags.js               # Feature flags
│   └── constants.js           # API endpoints, hằng số
├── features/
│   ├── bookmarks.js           # Bookmark video
│   ├── continue-watching.js   # Tiếp tục video đang xem
│   ├── download.js            # Download engine MP3/MP4
│   ├── effects.js             # Mini-game
│   ├── like-dislike-bar.js    # ReturnYouTubeDislike
│   ├── lockup-cached-stats.js # Stats trên video cards
│   ├── player-size.js         # Điều chỉnh player size
│   ├── shorts-channel-name.js # Tên kênh Shorts
│   ├── time-stats.js          # Thống kê thời gian
│   ├── translate-comments.js  # Dịch bình luận
│   └── wave-visualizer.js     # Visualizer âm thanh
├── ui/
│   ├── panel.js               # Panel UI + drag + settings
│   └── styles.scss            # SCSS styles
├── utils/
│   ├── dom.js                 # DOM helpers ($e, $cl, $ap, $id)
│   ├── helpers.js             # FormatterNumber, getCurrentVideoId
│   ├── runtime.js             # __ytToolsRuntime global state
│   ├── state.js               # State management
│   ├── storage.js             # GM storage wrapper
│   └── trusted-types.js       # Trusted Types / CSP compliance
└── scripts/
    ├── sync-legacy.mjs        # Đồng bộ script.js → legacy-full.js
    └── verify-parity.mjs      # Kiểm tra parity
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

Dự án có 28 vấn đề đã được phân tích chi tiết: xem [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md) và [CHECKLIST.md](CHECKLIST.md).

**Tóm tắt:**

- 🔴 3 Critical (kiến trúc dual codebase, lỗi scope, silent error)
- 🟠 8 High (memory leak, storage inconsistency, locale parsing)
- 🟡 11 Medium (duplicate code, hardcoded values, monolithic CSS)
- 🟢 6 Minor (a11y, cleanup, .gitignore)

**Đã fix:** 3/28 | **Partial:** 1/28 | **Chưa fix:** 24/28

---

## Tài liệu

- [PROJECT.md](PROJECT.md) — Kiến trúc chi tiết, luồng khởi tạo, state management, migration roadmap
- [ERROR_ANALYSIS.md](ERROR_ANALYSIS.md) — 28 issues phân loại theo severity
- [CHECKLIST.md](CHECKLIST.md) — Checklist fix từng issue

---

## License

MIT © DeveloperMDCM
