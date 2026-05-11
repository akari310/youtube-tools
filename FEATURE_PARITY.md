# Feature Parity Checklist

## Modular Features (src/features/)

### bookmarks
- `getBookmarksForVideo()`
- `saveBookmark()`
- `deleteBookmark()`
- `renderBookmarksPanel()`
- `applyBookmarksIfEnabled()`

### continue-watching
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

### download
- `startDownloadVideoOrAudio()`
- `setupDownloadClickHandler()`
- `initDownloadFeature()`

### like-dislike-bar
- `parseCountText()`
- `getLikesFromDom()`
- `ensureDislikesForCurrentVideo()`
- `updateLikeDislikeBar()`
- `scheduleLikeBarUpdate()`
- `videoDislike()`
- `shortDislike()`
- `applyLikeDislikeBarIfEnabled()`

### lockup-cached-stats
- `setupLockupCachedStats()`

### shorts-channel-name
- `setupShortsChannelNameFeature()`

### time-stats
- `formatTime()`
- `updateUI()`
- `initTimeStats()`

### translate-comments
- `traductor()`
- `initTranslateComments()`

### wave-visualizer
- `cleanupWaveVisualizer()`
- `hideCanvas()`
- `showCanvas()`
- `setupWaveForVideo()`
- `createVisualizerOverlay()`
- `animate()`
- `initWaveVisualizer()`

### effects
- `initEffectsFeature()`
- `cleanupEffects()`

### player-size
- `applyPlayerSize()`
- `resetPlayerSize()`
- `initPlayerSize()`

## Duplicates (both codebases have)

### bookmarks
- `getBookmarksForVideo()` — both have it
- `saveBookmark()` — both have it
- `deleteBookmark()` — both have it
- `renderBookmarksPanel()` — both have it
- `applyBookmarksIfEnabled()` — both have it

### continue-watching
- `isWatchPage()` — both have it
- `getMainVideoEl()` — both have it
- `getCurrentVideoMeta()` — both have it
- `ensureContinueWatchingMapLoaded()` — both have it
- `pruneContinueWatchingMap()` — both have it
- `scheduleContinueWatchingFlush()` — both have it
- `clearContinueWatchingForVideo()` — both have it
- `setContinueWatchingForVideo()` — both have it
- `getContinueWatchingTime()` — both have it
- `updateContinueWatchingButton()` — both have it
- `cssEscapeLite()` — both have it
- `navigateToWatchSpa()` — both have it
- `updateContinueWatchingHistoryUi()` — both have it
- `updateContinueWatchingPanelRow()` — both have it
- `renderContinueWatchingPanel()` — both have it
- `setupContinueWatchingFeature()` — both have it

### download
- `startDownloadVideoOrAudio()` — both have it

### like-dislike-bar
- `parseCountText()` — both have it
- `getLikesFromDom()` — both have it
- `ensureDislikesForCurrentVideo()` — both have it
- `updateLikeDislikeBar()` — both have it
- `scheduleLikeBarUpdate()` — both have it
- `videoDislike()` — both have it
- `shortDislike()` — both have it
- `applyLikeDislikeBarIfEnabled()` — both have it

### lockup-cached-stats
- `setupLockupCachedStats()` — both have it

### shorts-channel-name
- `setupShortsChannelNameFeature()` — both have it

### time-stats
- `formatTime()` — both have it
- `updateUI()` — both have it

### translate-comments
- `traductor()` — both have it

### wave-visualizer
- `hideCanvas()` — both have it
- `showCanvas()` — both have it

### player-size
- `applyPlayerSize()` — both have it

## Legacy-Only Key Features

- `addIcon()` — Gear icon in YT top bar + legacy panel toggle | legacy: ✅ | modular: ❌
- `saveSettings()` — Save settings from legacy panel checkboxes | legacy: ✅ | modular: ❌
- `applySettings()` — Apply all settings to DOM/features | legacy: ✅ | modular: ❌
- `renderizarButtons()` — Download toolbar buttons | legacy: ✅ | modular: ❌
- `toggleCinematicLighting()` — Cinematic lighting toggle | legacy: ✅ | modular: ❌
- `hideCanvas()` — Wave visualizer hide | legacy: ✅ | modular: ✅
- `showCanvas()` — Wave visualizer show | legacy: ✅ | modular: ✅
- `createCanvasOverlay()` — Wave visualizer canvas | legacy: ✅ | modular: ❌
- `setupAudioAnalyzer()` — Wave visualizer audio setup | legacy: ✅ | modular: ❌
- `insertButtons()` — Shorts reel buttons | legacy: ❌ | modular: ❌
- `checkForVideo()` — Video element detection | legacy: ✅ | modular: ❌
- `hideComments()` — Hide comments section | legacy: ❌ | modular: ❌
- `hideSidebar()` — Hide sidebar | legacy: ❌ | modular: ❌
- `reverseMode()` — Reverse mode | legacy: ❌ | modular: ❌
- `disableSubtitles()` — Disable subtitles | legacy: ❌ | modular: ❌
- `playerSize()` — Player size slider | legacy: ❌ | modular: ❌
- `videoDislike()` — Show dislikes on video | legacy: ✅ | modular: ✅
- `shortDislike()` — Show dislikes on shorts | legacy: ✅ | modular: ✅
- `traductor()` — Translate comments | legacy: ✅ | modular: ✅
- `initializeHeaderButtons()` — Header share/import buttons | legacy: ✅ | modular: ❌
- `updateUI()` — Stats UI update (legacy version) | legacy: ✅ | modular: ✅

## Recommendation

| Feature | Keep | Reason |
|---------|------|--------|
| Bookmarks | **Modular** | Cleaner code, scoped DOM queries |
| Continue Watching | **Modular** | Better save logic, video metadata cache, pagehide handler |
| Download | **Modular** | Retry logic, error UX, safe anchor download, fetchWithRetry |
| Like/Dislike Bar | **Legacy** | More robust DOM selectors, works on both video+shorts |
| Lockup Cached Stats | **Modular** | Clean implementation |
| Shorts Channel Name | **Modular** | IntersectionObserver, cache, deduplication |
| Time Stats | **Modular** | Per-video, daily, weekly chart, top videos, export |
| Translate Comments | **Legacy** | More mature, handles edge cases better |
| Wave Visualizer | **Legacy** | Full audio analyzer, multiple styles, canvas management |
| Effects (Game) | **Modular** | Legacy has no equivalent |
| Player Size | **Modular** | CSS width resize, not transform scale |
| Cinematic Lighting | **Legacy** | YTM ambient mode, complex toggle logic |
| Hide Comments | **Legacy** | Simple but effective |
| Hide Sidebar | **Legacy** | Simple toggle |
| Reverse Mode | **Legacy** | No modular equivalent |
| Disable Subtitles | **Legacy** | No modular equivalent |
| Avatar Download | **Legacy** | No modular equivalent |
| Audio-only Mode | **Legacy** | Background art + video hide (just fixed) |
| Settings Panel | **Legacy** | Full settings UI with themes, toggles, slider, import/export |
| Stats Panel | **Modular** | Clean stats-only panel with drag |
