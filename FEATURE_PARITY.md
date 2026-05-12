# Feature Parity Checklist

**Updated:** May 12, 2026 | **Status:** 100% Modular — Enhanced Theme System

---

## All Features (modular only — no more dual codebase)

### bookmarks (`src/features/bookmarks.js`)

- `getBookmarksForVideo()`
- `saveBookmark()`
- `deleteBookmark()`
- `renderBookmarksPanel()`
- `applyBookmarksIfEnabled()`

### continue-watching (`src/features/continue-watching.js`)

- `isWatchPage()`
- `getMainVideoEl()`
- `getCurrentVideoMeta()`
- `ensureContinueWatchingMapLoaded()`
- `pruneContinueWatchingMap()`
- `scheduleContinueWatchingFlush()`
- `clearContinueWatchingForVideo()`
- `setContinueWatchingForVideo()`
- `getContinueWatchingTime()`
- `updateContinueWatchingButton()`
- `cssEscapeLite()`
- `navigateToWatchSpa()`
- `updateContinueWatchingHistoryUi()`
- `updateContinueWatchingPanelRow()`
- `renderContinueWatchingPanel()`
- `setupContinueWatchingFeature()`

### download (`src/features/download.js`)

- `startDownloadVideoOrAudio()` — SaveNow + Dubs fallback với exponential backoff
- `setupDownloadClickHandler()`
- `initDownloadFeature()`

### like-dislike-bar (`src/features/like-dislike-bar.js`)

- `parseCountText()` — locale-aware (đọc `hl` URL param)
- `getLikesFromDom()`
- `ensureDislikesForCurrentVideo()`
- `updateLikeDislikeBar()`
- `scheduleLikeBarUpdate()`
- `videoDislike()`
- `shortDislike()`
- `applyLikeDislikeBarIfEnabled()`

### lockup-cached-stats (`src/features/lockup-cached-stats.js`)

- `setupLockupCachedStats()`

### time-stats (`src/features/time-stats.js`)

- `formatTime()` — merged formatter with `{compact}` option
- `updateUI()`
- `initTimeStats()`

### wave-visualizer (`src/features/wave-visualizer.js`)

- `cleanupWaveVisualizer()` — cleanup trên SPA navigate
- `hideCanvas()` / `showCanvas()`
- `setupWaveForVideo()`
- `createVisualizerOverlay()`
- `animate()`
- `initWaveVisualizer()`

### effects (`src/features/effects.js`)

- `initEffectsFeature()`
- `cleanupEffects()`

### avatar-download (`src/features/avatar-download.js`)

- Tải avatar kênh YouTube

### download-description (`src/features/download-description.js`)

- Tải mô tả video dạng text

### hide-sidebar (`src/features/hide-sidebar.js`)

- Ẩn sidebar

### ytm-ambient-mode (`src/features/ytm-ambient-mode.js`)

- YouTube Music ambient mode

---

## Comment Features (`src/features/comments/`)

### comment-observer (`src/features/comments/comment-observer.js`)

- MutationObserver chung cho bình luận

### hide-comments (`src/features/comments/hide-comments.js`)

- Ẩn section bình luận

### translate-comments (`src/features/comments/translate-comments.js`)

- `traductor()` — đọc `settings.translateTarget`
- `initTranslateComments()`

---

## Player Features (`src/features/player/`)

### audio-only (`src/features/player/audio-only.js`)

- Ẩn video, chỉ phát audio

### cinematic-lighting (`src/features/player/cinematic-lighting.js`)

- Ambient lighting effect xung quanh video

### disable-subtitles (`src/features/player/disable-subtitles.js`)

- Tắt phụ đề tự động

### nonstop-playback (`src/features/player/nonstop-playback.js`)

- Tự động chuyển video tiếp theo khi kết thúc

### player-size (`src/features/player/player-size.js`)

- `applyPlayerSize()`
- `resetPlayerSize()`
- `initPlayerSize()` — có SPA handler

### reverse-mode (`src/features/player/reverse-mode.js`)

- Đảo ngược layout giao diện

---

## Shorts Features (`src/features/shorts/`)

### shorts-channel-name (`src/features/shorts/shorts-channel-name.js`)

- `setupShortsChannelNameFeature()` — IntersectionObserver + FetchQueue

### shorts-reel-buttons (`src/features/shorts/shorts-reel-buttons.js`)

- Nút tùy chỉnh trên Shorts reel

---

## UI Components

| Component        | File                         | Mô tả                                      |
| ---------------- | ---------------------------- | ------------------------------------------ |
| Settings Panel   | `settings-panel/index.js`    | Entry point, import HTML + events + SCSS   |
| Panel HTML       | `settings-panel/template.js` | HTML template (38,429 bytes)               |
| Panel Events     | `settings-panel/events.js`   | Event handlers cho settings                |
| Theme Selector   | `theme-selector/index.js`    | Theme gallery UI with preview/apply/delete |
| Toolbar          | `toolbar/`                   | Download toolbar với progress UI           |
| Gear Icon        | `gear-icon.js`               | Nút settings gear trên YT header           |
| Video Info Panel | `video-info-panel/`          | Panel metadata video                       |
| Theme Engine     | `theme-engine.js`            | Enhanced theme engine with presets         |
| Theme Data       | `theme-data.js`              | Legacy theme data                          |

---

## Summary

| Category        | Count  |
| --------------- | ------ |
| Feature modules | 23     |
| UI components   | 9      |
| Theme modules   | 7      |
| Utils           | 8      |
| Config/Settings | 5      |
| **Total**       | **52** |
