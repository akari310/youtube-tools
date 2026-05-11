import { $id } from '../utils/dom.js';
import { setHTML } from '../utils/trusted-types.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { getCurrentVideoId } from '../utils/helpers.js';

const isMusic = location.hostname === 'music.youtube.com';

const STORAGE = {
  USAGE: isMusic ? 'YT_TOTAL_USAGE' : 'YT_TOTAL_USAGE',
  VIDEO: isMusic ? 'YTM_LISTEN_TIME' : 'YT_VIDEO_TIME',
  SHORTS: 'YT_SHORTS_TIME',
  DETAIL: isMusic ? 'YTM_DETAILED_STATS' : 'YT_DETAILED_STATS',
  DAILY: isMusic ? 'YTM_DAILY_STATS' : 'YT_DAILY_STATS',
  SESSION: isMusic ? 'YTM_SESSION_START' : 'YT_SESSION_START',
};

let usageTime = 0;
let videoTime = 0;
let shortsTime = 0;
let sessionTime = 0;
let videosWatched = 0;
let lastUpdate = Date.now();

let detailedStats = {};
let dailyStats = {};

function loadStats() {
  usageTime = Number(GM_getValue(STORAGE.USAGE, 0)) || 0;
  videoTime = Number(GM_getValue(STORAGE.VIDEO, 0)) || 0;
  shortsTime = Number(GM_getValue(STORAGE.SHORTS, 0)) || 0;
  try {
    detailedStats = JSON.parse(GM_getValue(STORAGE.DETAIL, '{}'));
  } catch {
    detailedStats = {};
  }
  try {
    dailyStats = JSON.parse(GM_getValue(STORAGE.DAILY, '{}'));
  } catch {
    dailyStats = {};
  }
  videosWatched = Object.keys(detailedStats).length;

  const sessionStart = Number(GM_getValue(STORAGE.SESSION, 0));
  const now = Date.now();
  if (now - sessionStart > 3600000) {
    sessionTime = 0;
    GM_setValue(STORAGE.SESSION, now);
  } else {
    sessionTime = (now - sessionStart) / 1000;
  }
}

function saveStats() {
  GM_setValue(STORAGE.USAGE, usageTime);
  GM_setValue(STORAGE.VIDEO, videoTime);
  GM_setValue(STORAGE.SHORTS, shortsTime);
  try {
    GM_setValue(STORAGE.DETAIL, JSON.stringify(detailedStats));
  } catch {}
  try {
    GM_setValue(STORAGE.DAILY, JSON.stringify(dailyStats));
  } catch {}
}

function trackVideoWatch(videoId, title, channel, deltaSec) {
  if (!videoId || deltaSec <= 0 || deltaSec > 3600) return;
  const key = String(videoId);
  const now = Date.now();
  if (!detailedStats[key]) {
    detailedStats[key] = {
      title: '',
      channel: '',
      totalSec: 0,
      firstWatched: now,
      lastWatched: now,
      count: 0,
    };
  }
  const e = detailedStats[key];
  e.totalSec += deltaSec;
  e.lastWatched = now;
  e.count++;
  if (title) e.title = String(title).substring(0, 200);
  if (channel) e.channel = String(channel).substring(0, 100);

  const day = new Date(now).toISOString().slice(0, 10);
  if (!dailyStats[day]) dailyStats[day] = { videoSec: 0, shortsSec: 0, totalSec: 0 };
  dailyStats[day].totalSec += deltaSec;
  if (location.pathname.startsWith('/shorts')) dailyStats[day].shortsSec += deltaSec;
  else dailyStats[day].videoSec += deltaSec;

  videosWatched = Object.keys(detailedStats).length;
}

function getTodayStats() {
  const day = new Date().toISOString().slice(0, 10);
  return dailyStats[day] || { videoSec: 0, shortsSec: 0, totalSec: 0 };
}

function getWeekData() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      key,
      sec: dailyStats[key]?.totalSec || 0,
    });
  }
  const max = Math.max(1, ...days.map(d => d.sec));
  return days.map(d => ({ ...d, pct: (d.sec / max) * 100 }));
}

function getTopVideos(limit = 10) {
  return Object.entries(detailedStats)
    .map(([id, d]) => ({ videoId: id, ...d }))
    .sort((a, b) => b.totalSec - a.totalSec)
    .slice(0, limit);
}

function getLongestVideo() {
  const top = getTopVideos(1);
  return top[0] || null;
}

function getAvgWatchTime() {
  const entries = Object.values(detailedStats);
  if (!entries.length) return 0;
  return entries.reduce((s, e) => s + e.totalSec, 0) / entries.length;
}

// --- Formatting ---

export function formatTime(seconds, { compact = false } = {}) {
  if (isNaN(seconds) || seconds < 0) return compact ? '0s' : '0h 0m 0s';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (compact) {
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m` : `${s % 60}s`;
  }
  return `${h}h ${m}m ${s % 60}s`;
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

// --- Export ---

function exportStats() {
  const rows = [
    `Total: ${formatTime(usageTime)}`,
    `${isMusic ? 'Listen' : 'Video'}: ${formatTime(videoTime)}${isMusic ? '' : ' | Shorts: ' + formatTime(shortsTime)}`,
    `${isMusic ? 'Tracks' : 'Videos'} watched: ${videosWatched}`,
    '',
    isMusic ? 'Top Tracks:' : 'Top Videos:',
    ...getTopVideos(10).map(
      (v, i) =>
        `  #${i + 1} ${v.title || v.videoId} (${v.channel || '?'}) - ${formatTime(v.totalSec, { compact: true })}`
    ),
  ];
  const text = rows.join('\n');
  try {
    navigator.clipboard.writeText(text);
  } catch {
    prompt('Copy stats:', text);
  }
}

// --- UI Update ---

export function updateUI() {
  const today = getTodayStats();
  const week = getWeekData();
  const longest = getLongestVideo();
  const avg = getAvgWatchTime();

  const eachById = (id, fn) => {
    document.querySelectorAll(`[id="${id}"]`).forEach(fn);
  };
  const set = (id, val) => {
    eachById(id, el => {
      el.textContent = val;
    });
  };
  set('total-time', formatTime(usageTime));
  set('video-time', formatTime(videoTime));
  set('video-label', isMusic ? 'Listen Time' : 'Video Watch Time');
  set('shorts-time', formatTime(shortsTime));
  if (isMusic) {
    set('shorts-label', '');
    const shortsCard = document.querySelector('#shorts-time')?.closest('.stat-card');
    if (shortsCard) shortsCard.style.display = 'none';
  }
  set('session-time', formatTime(sessionTime));
  set('today-time', formatTime(today.totalSec));
  set('videos-count', String(videosWatched));
  set('avg-time', formatTime(avg, { compact: true }));
  set('longest-title', longest ? escapeHtml(longest.title || longest.videoId) : '-');
  set('longest-time', longest ? formatTime(longest.totalSec, { compact: true }) : '-');
  set('most-label', isMusic ? 'Most Played' : 'Most Watched');

  const maxTime = 86400;
  const bar = (id, v) => {
    eachById(id, el => {
      el.style.width = `${Math.min(100, (v / maxTime) * 100)}%`;
    });
  };
  bar('usage-bar', usageTime);
  bar('video-bar', videoTime);
  bar('shorts-bar', shortsTime);
  bar('session-bar', sessionTime);
  bar('today-bar', today.totalSec);

  // Weekly chart
  const chart = $id('weekly-chart');
  if (chart) {
    setHTML(
      chart,
      week
        .map(d => {
          const h = d.sec > 0 ? formatTime(d.sec, { compact: true }) : '';
          return `<div class="week-bar-wrapper"><div class="week-label">${d.label}</div><div class="week-bar-track"><div class="week-bar-fill" style="height:${d.pct}%"></div></div><div class="week-bar-val">${h}</div></div>`;
        })
        .join('')
    );
  }
  const topList = $id('top-videos-list');
  if (topList) {
    const top = getTopVideos(10);
    setHTML(
      topList,
      top.length === 0
        ? '<div class="stat-empty">Watch some videos first</div>'
        : top
            .map(
              (v, i) =>
                `<div class="top-video-row">
          <span class="top-video-rank">#${i + 1}</span>
          <span class="top-video-title" title="${escapeHtml(v.title || v.videoId)}">${escapeHtml(v.title || v.videoId)}</span>
          <span class="top-video-chan">${escapeHtml(v.channel || '')}</span>
          <span class="top-video-time">${formatTime(v.totalSec, { compact: true })}</span>
        </div>`
            )
            .join('')
    );
  }
}

// --- Init ---

function resetStats() {
  usageTime = videoTime = shortsTime = sessionTime = 0;
  videosWatched = 0;
  detailedStats = {};
  dailyStats = {};
  lastUpdate = Date.now();
  GM_setValue(STORAGE.USAGE, 0);
  GM_setValue(STORAGE.VIDEO, 0);
  GM_setValue(STORAGE.SHORTS, 0);
  GM_setValue(STORAGE.DETAIL, '{}');
  GM_setValue(STORAGE.DAILY, '{}');
  GM_setValue(STORAGE.SESSION, Date.now());
  updateUI();
}

export function initTimeStats() {
  loadStats();
  lastUpdate = Date.now();
  GM_setValue(STORAGE.SESSION, Date.now());

  if (!__ytToolsRuntime.modularStatsIntervalId) {
    __ytToolsRuntime.modularStatsIntervalId = true;
    __ytToolsRuntime.statsIntervalId = 'modular'; // block legacy interval
    let __lastSave = 0;
    let __lastVid = null;
    let __title = '';
    let __channel = '';

    __ytToolsRuntime.modularStatsIntervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdate) / 1000;
      lastUpdate = now;
      if (document.visibilityState !== 'visible') return;
      if (delta <= 0 || delta > 10 || delta > 3600) return;

      usageTime += delta;
      sessionTime += delta;

      const vid = document.querySelector('video.video-stream') || document.querySelector('video');
      if (vid && !vid.paused && !vid.ended && vid.readyState > 1) {
        if (location.pathname.startsWith('/shorts')) shortsTime += delta;
        else videoTime += delta;

        const videoId = getCurrentVideoId();
        if (videoId) {
          if (videoId !== __lastVid) {
            __lastVid = videoId;
            try {
              __title =
                document.querySelector('h1 yt-formatted-string')?.textContent?.trim() ||
                document.title.replace(/\s*-\s*YouTube\s*$/i, '').trim() ||
                '';
              __channel =
                document
                  .querySelector('#owner ytd-channel-name a, ytd-channel-name a')
                  ?.textContent?.trim() ||
                document
                  .querySelector('ytd-video-owner-renderer a.yt-simple-endpoint')
                  ?.textContent?.trim() ||
                '';
            } catch {
              __title = '';
              __channel = '';
            }
          }
          trackVideoWatch(videoId, __title, __channel, delta);
        }
      }

      if (now - __lastSave >= 30000) {
        __lastSave = now;
        saveStats();
      }
      updateUI();
    }, 1000);

    window.addEventListener('pagehide', saveStats, { capture: true });
  }

  document.querySelectorAll('[id="resetStats"]').forEach(resetBtn => {
    if (resetBtn.dataset.ytToolsTimeStatsBound) return;
    resetBtn.dataset.ytToolsTimeStatsBound = '1';
    resetBtn.addEventListener('click', resetStats);
  });

  // Export button
  document.querySelectorAll('[id="exportStats"]').forEach(exportBtn => {
    if (exportBtn.dataset.ytExportBound) return;
    exportBtn.dataset.ytExportBound = '1';
    exportBtn.addEventListener('click', exportStats);
  });

  updateUI();
}
