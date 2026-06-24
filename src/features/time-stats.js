import { $id } from '../utils/dom.js';
import { setHTML } from '../utils/trusted-types.js';
import { __ytToolsRuntime } from '../utils/runtime.js';
import { getCurrentVideoId, escapeHtml } from '../utils/helpers.js';
import { gmRawGet, gmRawSet } from '../utils/storage.js';
import { STORAGE_KEYS } from '../config/storage-keys.js';

const isMusic = location.hostname === 'music.youtube.com';

const STORAGE = {
  USAGE: STORAGE_KEYS.TOTAL_USAGE,
  VIDEO: isMusic ? STORAGE_KEYS.YTM_LISTEN_TIME : STORAGE_KEYS.VIDEO_TIME,
  SHORTS: STORAGE_KEYS.SHORTS_TIME,
  DETAIL: isMusic ? STORAGE_KEYS.YTM_DETAILED_STATS : STORAGE_KEYS.DETAILED_STATS,
  DAILY: isMusic ? STORAGE_KEYS.YTM_DAILY_STATS : STORAGE_KEYS.DAILY_STATS,
  SESSION: isMusic ? STORAGE_KEYS.YTM_SESSION_START : STORAGE_KEYS.SESSION_START,
};

let usageTime = 0;
let videoTime = 0;
let shortsTime = 0;
let sessionTime = 0;
let videosWatched = 0;
let lastUpdate = Date.now();

let detailedStats = {};
let dailyStats = {};

const domCache = {};

function loadStats() {
  Object.keys(domCache).forEach(k => delete domCache[k]);
  usageTime = Number(gmRawGet(STORAGE.USAGE, 0)) || 0;
  videoTime = Number(gmRawGet(STORAGE.VIDEO, 0)) || 0;
  shortsTime = Number(gmRawGet(STORAGE.SHORTS, 0)) || 0;
  try {
    detailedStats = JSON.parse(gmRawGet(STORAGE.DETAIL, '{}'));
  } catch {
    detailedStats = {};
  }
  try {
    dailyStats = JSON.parse(gmRawGet(STORAGE.DAILY, '{}'));
  } catch {
    dailyStats = {};
  }
  videosWatched = Object.keys(detailedStats).length;

  const sessionStart = Number(gmRawGet(STORAGE.SESSION, 0));
  const now = Date.now();
  if (now - sessionStart > 3600000) {
    sessionTime = 0;
    gmRawSet(STORAGE.SESSION, now);
  } else {
    sessionTime = (now - sessionStart) / 1000;
  }
}

function saveStats() {
  gmRawSet(STORAGE.USAGE, usageTime);
  gmRawSet(STORAGE.VIDEO, videoTime);
  gmRawSet(STORAGE.SHORTS, shortsTime);
  try {
    gmRawSet(STORAGE.DETAIL, JSON.stringify(detailedStats));
  } catch {}
  try {
    gmRawSet(STORAGE.DAILY, JSON.stringify(dailyStats));
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

function getStreak() {
  const days = Object.keys(dailyStats)
    .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
    .sort()
    .reverse();
  let streak = 0;
  // start from today, check consecutive days backwards
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (days[i] === expected) streak++;
    else break;
  }
  // if no data for today but yesterday has data, streak starts yesterday
  if (streak === 0 && days.length > 0) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (days[0] === yesterday) streak = 1;
  }
  return streak;
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

export function formatTime(seconds, { compact = false, smart = true } = {}) {
  if (isNaN(seconds) || seconds < 0) return compact ? '0s' : '0s';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (compact || smart) {
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (sec > 0 || parts.length === 0) parts.push(`${sec}s`);
    return parts.join(' ');
  }
  return `${h}h ${m}m ${sec}s`;
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

let _prevHash = '';

export function updateUI() {
  const today = getTodayStats();
  const week = getWeekData();
  const longest = getLongestVideo();
  const avg = getAvgWatchTime();
  const streak = getStreak();

  const _hash = [
    usageTime,
    videoTime,
    shortsTime,
    sessionTime,
    today.totalSec,
    videosWatched,
    avg,
    streak,
    longest?.videoId ?? '',
    longest?.title ?? '',
    longest?.totalSec ?? '',
    ...week.map(d => `${d.sec}:${d.pct}`),
    ...getTopVideos(10).map(v => `${v.videoId}:${v.title}:${v.channel}:${v.totalSec}`),
    isMusic,
  ].join('|');
  if (_hash === _prevHash) return;
  _prevHash = _hash;

  const eachById = (id, fn) => {
    if (!domCache[id]) {
      domCache[id] = Array.from(document.querySelectorAll(`[id="${id}"]`));
    }
    domCache[id].forEach(fn);
  };
  const set = (id, val) => {
    eachById(id, el => {
      if (el.textContent !== val) el.textContent = val;
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
  set('longest-time', longest ? formatTime(longest.totalSec) : '-');
  set('most-label', isMusic ? 'Most Played' : 'Most Watched');
  set('streak-count', String(streak));
  set('streak-label', streak > 0 ? (streak === 1 ? 'Today' : `${streak} Day Streak`) : 'No Streak');

  const maxTime = 86400;
  const bar = (id, v) => {
    eachById(id, el => {
      const _w = `${Math.min(100, (v / maxTime) * 100)}%`;
      if (el.style.width !== _w) el.style.width = _w;
    });
  };
  bar('usage-bar', usageTime);
  bar('video-bar', videoTime);
  bar('shorts-bar', shortsTime);
  bar('session-bar', sessionTime);
  bar('today-bar', today.totalSec);

  // Weekly chart
  const chart = domCache._weeklyChart || (domCache._weeklyChart = $id('weekly-chart'));
  if (chart) {
    const todayKey = new Date().toISOString().slice(0, 10);
    setHTML(
      chart,
      week
        .map(d => {
          const h = d.sec > 0 ? formatTime(d.sec) : '';
          const isToday = d.key === todayKey;
          return `<div class="week-bar-wrapper${isToday ? ' is-today' : ''}"><div class="week-label">${isToday ? 'Today' : d.label}</div><div class="week-bar-track"><div class="week-bar-fill" style="height:${d.pct}%"></div></div><div class="week-bar-val">${h}</div></div>`;
        })
        .join('')
    );
  }
  const topList = domCache._topVideosList || (domCache._topVideosList = $id('top-videos-list'));
  if (topList) {
    const top = getTopVideos(10);
    setHTML(
      topList,
      top.length === 0
        ? '<div class="stat-empty">Watch some videos first</div>'
        : top
            .map(
              (v, i) =>
                `<a class="top-video-row" href="/watch?v=${encodeURIComponent(v.videoId)}" target="_blank">
          <span class="top-video-rank">#${i + 1}</span>
          <span class="top-video-title" title="${escapeHtml(v.title || v.videoId)}">${escapeHtml(v.title || v.videoId)}</span>
          <span class="top-video-chan">${escapeHtml(v.channel || '')}</span>
          <span class="top-video-time">${formatTime(v.totalSec)}</span>
        </a>`
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
  gmRawSet(STORAGE.USAGE, 0);
  gmRawSet(STORAGE.VIDEO, 0);
  gmRawSet(STORAGE.SHORTS, 0);
  gmRawSet(STORAGE.DETAIL, '{}');
  gmRawSet(STORAGE.DAILY, '{}');
  gmRawSet(STORAGE.SESSION, Date.now());
  updateUI();
}

export function initTimeStats() {
  loadStats();
  lastUpdate = Date.now();
  gmRawSet(STORAGE.SESSION, Date.now());

  if (!__ytToolsRuntime.modularStatsIntervalId) {
    __ytToolsRuntime.modularStatsIntervalId = true;
    __ytToolsRuntime.statsIntervalId = 'modular'; // block legacy interval
    let __lastSave = 0;
    let __lastVid = null;
    let __title = '';
    let __channel = '';
    let __cachedVideo = null;
    let __lastVideoCheck = 0;

    __ytToolsRuntime.modularStatsIntervalId = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdate) / 1000;
      lastUpdate = now;
      if (document.visibilityState !== 'visible') return;
      if (delta <= 0 || delta > 10 || delta > 3600) return;

      usageTime += delta;
      sessionTime += delta;

      // Cache video element and only re-query every 5 seconds
      if (!__cachedVideo || now - __lastVideoCheck > 5000) {
        __cachedVideo =
          document.querySelector('video.video-stream') || document.querySelector('video');
        __lastVideoCheck = now;
      }

      const vid = __cachedVideo;
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
