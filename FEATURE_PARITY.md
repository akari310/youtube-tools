# Feature Parity Checklist

**Updated:** May 11, 2026 | **Status:** 100% Modular — legacy codebase removed

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

### shorts-channel-name (`src/features/shorts-channel-name.js`)
- `setupShortsChannelNameFeature()` — IntersectionObserver + FetchQueue

### time-stats (`src/features/time-stats.js`)
- `formatTime()` — merged formatter with `{compact}` option
- `updateUI()`
- `initTimeStats()`

### translate-comments (`src/features/translate-comments.js`)
- `traductor()` — đọc `settings.translateTarget`
- `initTranslateComments()`

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

### player-size (`src/features/player-size.js`)
- `applyPlayerSize()`
- `resetPlayerSize()`
- `initPlayerSize()` — có SPA handler

### audio-only (`src/features/audio-only.js`)
- Ẩn video, chỉ phát audio

### avatar-download (`src/features/avatar-download.js`)
- Tải avatar kênh YouTube

### cinematic-lighting (`src/features/cinematic-lighting.js`)
- Ambient lighting effect xung quanh video

### comment-observer (`src/features/comment-observer.js`)
- MutationObserver chung cho bình luận

### disable-subtitles (`src/features/disable-subtitles.js`)
- Tắt phụ đề tự động

### download-description (`src/features/download-description.js`)
- Tải mô tả video dạng text

### hide-comments (`src/features/hide-comments.js`)
- Ẩn section bình luận

### hide-sidebar (`src/features/hide-sidebar.js`)
- Ẩn sidebar

### nonstop-playback (`src/features/nonstop-playback.js`)
- Tự động chuyển video tiếp theo khi kết thúc

### reverse-mode (`src/features/reverse-mode.js`)
- Đảo ngược layout giao diện

### shorts-reel-buttons (`src/features/shorts-reel-buttons.js`)
- Nút tùy chỉnh trên Shorts reel

### ytm-ambient-mode (`src/features/ytm-ambient-mode.js`)
- YouTube Music ambient mode

---

## UI Components

| Component          | File                        | Mô tả                                     |
| ------------------ | --------------------------- | ----------------------------------------- |
| Settings Panel     | `settings-panel.js`         | Entry point, import HTML + events + SCSS  |
| Panel HTML         | `settings-panel-html.js`    | HTML template (857 dòng)                  |
| Panel Events       | `settings-panel-events.js`  | Event handlers cho settings               |
| Toolbar            | `toolbar.js`                | Download toolbar với progress UI          |
| Gear Icon          | `gear-icon.js`              | Nút settings gear trên YT header          |
| Video Info Panel   | `video-info-panel.js`       | Panel metadata video                      |
| Theme Engine       | `theme-engine.js`           | Quản lý theme tập trung                   |
| Theme Data         | `theme-data.js`             | Theme presets & colors                    |

---

## Summary

| Category        | Count |
| --------------- | ----- |
| Feature modules | 21    |
| UI components   | 8     |
| Theme modules   | 2     |
| Utils           | 7     |
| Config/Settings | 3     |
| **Total**       | **41**|
