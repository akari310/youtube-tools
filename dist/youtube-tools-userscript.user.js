// ==UserScript==
// @name         Youtube Tools All in one local download mp3 mp4 HIGT QUALITY return dislikes and more
// @namespace    npm/vite-plugin-monkey
// @version      2.4.4.2
// @author       DeveloperMDCM
// @description  Công cụ Youtube Tất cả trong một cục bộ Tải xuống mp4, MP3 - HIGH QUALITY return dislikes and more
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @homepage     https://github.com/DeveloperMDCM/
// @source       https://github.com/DeveloperMDCM/youtube-tools
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @match        *://music.youtube.com/*
// @match        *://*.music.youtube.com/*
// @require      https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/js/iziToast.min.js
// @connect      *
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
	var s$1 = new Set();
	var _css = async (t) => {
		if (s$1.has(t)) return;
		s$1.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	var $e = (el) => document.querySelector(el);
	var $id = (el) => document.getElementById(el);
	var $m = (el) => document.querySelectorAll(el);
	var $cl = (el) => document.createElement(el);
	var $sp = (el, pty) => document.documentElement.style.setProperty(el, pty);
	var $ap = (el) => document.body.appendChild(el);
	function pageWindow() {
		try {
			if (typeof unsafeWindow !== "undefined" && unsafeWindow) return unsafeWindow;
		} catch {}
		return window;
	}
	function pageDocument() {
		return pageWindow().document;
	}
	var isYTMusic$1 = location.hostname === "music.youtube.com";
	document.location.href;
	function checkDarkModeActive$1() {
		const htmlElement = document.documentElement;
		const isDarkModeYT = htmlElement.hasAttribute("dark") || htmlElement.getAttribute("style")?.includes("color-scheme: dark");
		const isDarkModeYTM = document.querySelector("ytmusic-app")?.hasAttribute("dark");
		return !!(isDarkModeYT || isDarkModeYTM);
	}
	var STORAGE_KEYS = {
		BOOKMARKS: "ytBookmarksMDCM",
		CONTINUE_WATCHING: "ytContinueWatchingMDCM",
		SHORTS_CHANNEL_CACHE: "ytShortsChannelCacheMDCM",
		LIKES_DISLIKES_CACHE: "ytLikesDislikesCacheMDCM",
		VERSION_CHECK_LAST: "ytVersionCheckLastMDCM",
		SETTINGS_YT: "ytSettingsMDCM",
		SETTINGS_YTM: "ytmSettingsMDCM",
		DOWNLOAD_AUDIO_FORMAT: "ytDownloadAudioFormatMDCM",
		DOWNLOAD_VIDEO_QUALITY: "ytDownloadVideoQualityMDCM",
		TOTAL_USAGE: "YT_TOTAL_USAGE",
		VIDEO_TIME: "YT_VIDEO_TIME",
		SHORTS_TIME: "YT_SHORTS_TIME",
		DETAILED_STATS: "YT_DETAILED_STATS",
		DAILY_STATS: "YT_DAILY_STATS",
		SESSION_START: "YT_SESSION_START",
		YTM_LISTEN_TIME: "YTM_LISTEN_TIME",
		YTM_DETAILED_STATS: "YTM_DETAILED_STATS",
		YTM_DAILY_STATS: "YTM_DAILY_STATS",
		YTM_SESSION_START: "YTM_SESSION_START",
		CUSTOM_THEMES: "yt-tools-custom-themes"
	};
	var UPDATE_META_URL = "https://update.greasyfork.org/scripts/460680/Youtube%20Tools%20All%20in%20one%20local%20download%20mp3%20mp4%20HIGT%20QUALITY%20return%20dislikes%20and%20more.meta.js";
	var CACHE_TTL = {
		SHORTS_CHANNEL: 10080 * 60 * 1e3,
		LIKES_DISLIKES: 10080 * 60 * 1e3,
		DISLIKES_IN_MEMORY: 600 * 1e3
	};
	var CACHE_LIMITS = {
		PERSISTED_MAX_ENTRIES: 500,
		CONTINUE_WATCHING_MAX_ENTRIES: 200
	};
	function gmRawGet(key, defaultValue) {
		if (typeof GM_getValue !== "undefined") return GM_getValue(key, defaultValue);
		try {
			const raw = unsafeWindow.localStorage.getItem("yt_tools_" + key);
			return raw !== null ? raw : defaultValue;
		} catch {
			return defaultValue;
		}
	}
	function gmRawSet(key, value) {
		if (typeof GM_setValue !== "undefined") {
			GM_setValue(key, value);
			return;
		}
		try {
			unsafeWindow.localStorage.setItem("yt_tools_" + key, value);
		} catch {}
	}
	function readJsonGM(key, defaultValue = null) {
		try {
			const raw = gmRawGet(key, null);
			if (raw === null || raw === void 0) return defaultValue;
			return JSON.parse(String(raw));
		} catch {
			return defaultValue;
		}
	}
	function writeJsonGM(key, value) {
		try {
			gmRawSet(key, JSON.stringify(value));
		} catch {}
	}
	function getShortsChannelFromPersistedCache(videoId) {
		try {
			const entry = readJsonGM(STORAGE_KEYS.SHORTS_CHANNEL_CACHE, {})?.[videoId];
			if (!entry || typeof entry.channelName !== "string") return null;
			if (Date.now() - (Number(entry.ts) || 0) > CACHE_TTL.SHORTS_CHANNEL) return null;
			return entry.channelName;
		} catch {
			return null;
		}
	}
	function setShortsChannelToPersistedCache(videoId, channelName) {
		if (!videoId || typeof channelName !== "string") return;
		try {
			const map = readJsonGM(STORAGE_KEYS.SHORTS_CHANNEL_CACHE, {});
			map[videoId] = {
				channelName,
				ts: Date.now()
			};
			const entries = Object.entries(map).sort((a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0));
			const pruned = Object.fromEntries(entries.slice(0, CACHE_LIMITS.PERSISTED_MAX_ENTRIES));
			writeJsonGM(STORAGE_KEYS.SHORTS_CHANNEL_CACHE, pruned);
		} catch {}
	}
	function getLikesDislikesFromPersistedCache(videoId) {
		try {
			const entry = readJsonGM(STORAGE_KEYS.LIKES_DISLIKES_CACHE, {})?.[videoId];
			if (!entry) return null;
			if (Date.now() - (Number(entry.ts) || 0) > CACHE_TTL.LIKES_DISLIKES) return null;
			const dislikes = Number(entry.dislikes);
			const likes = Number(entry.likes);
			const viewCount = Number(entry.viewCount);
			const rating = Number(entry.rating);
			return {
				likes: Number.isFinite(likes) ? likes : null,
				dislikes: Number.isFinite(dislikes) ? dislikes : null,
				viewCount: Number.isFinite(viewCount) ? viewCount : null,
				rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null
			};
		} catch {
			return null;
		}
	}
	function setLikesDislikesToPersistedCache(videoId, data) {
		if (!videoId || !data || typeof data !== "object") return;
		try {
			const map = readJsonGM(STORAGE_KEYS.LIKES_DISLIKES_CACHE, {});
			map[videoId] = {
				likes: data.likes ?? null,
				dislikes: data.dislikes ?? null,
				viewCount: data.viewCount ?? null,
				rating: data.rating ?? null,
				ts: Date.now()
			};
			const entries = Object.entries(map).sort((a, b) => (Number(b[1]?.ts) || 0) - (Number(a[1]?.ts) || 0));
			const pruned = Object.fromEntries(entries.slice(0, CACHE_LIMITS.PERSISTED_MAX_ENTRIES));
			writeJsonGM(STORAGE_KEYS.LIKES_DISLIKES_CACHE, pruned);
		} catch {}
	}
	var __ytToolsRuntime = {
		dynamicStyleEl: null,
		dynamicCssLast: "",
		settingsLoaded: false,
		bookmarkClickHandlerInitialized: false,
		bookmarksPanelOpen: false,
		nonstopPlayback: { enabled: false },
		audioOnly: { enabled: false },
		continueWatching: {
			enabled: false,
			map: null,
			flushT: null,
			boundVideo: null,
			boundVideoId: null,
			lastSaveAt: 0,
			lastSavedTime: -1,
			lastKnownVideoId: null,
			navHandlerInitialized: false,
			panelOpen: false,
			clickHandlerInitialized: false,
			pagehideHandlerInitialized: false,
			handlers: null
		},
		shortsChannelName: {
			enabled: false,
			observer: null,
			io: null,
			scanT: null,
			cache: new Map(),
			inflight: new Map()
		},
		dislikesCache: {
			videoId: null,
			dislikes: null,
			likes: null,
			viewCount: null,
			rating: null,
			ts: 0
		},
		downloadClickHandlerInitialized: false,
		shortsObserver: null,
		shortsReelButtonsInitialized: false,
		statsObserver: null,
		statsIntervalId: null,
		modularStatsIntervalId: null,
		lockupCachedStatsObserver: null,
		lockupCachedStatsObserveTarget: null,
		lockupCachedStatsIntervalId: null,
		updateShortsViewsButton: function() {},
		updateShortsRatingButton: function() {}
	};
	if (typeof window !== "undefined") {
		window.__ytToolsRuntime = __ytToolsRuntime;
		window.__YT_TOOLS_RUNTIME_MDCM__ = __ytToolsRuntime;
		window.setDynamicCss = setDynamicCss;
		window.scheduleApplySettings = scheduleApplySettings;
	}
	function setDynamicCss(cssText = "") {
		if (!__ytToolsRuntime.dynamicStyleEl) {
			const style = document.createElement("style");
			style.id = "yt-tools-mdcm-dynamic-style";
			document.head.appendChild(style);
			__ytToolsRuntime.dynamicStyleEl = style;
		}
		if (__ytToolsRuntime.dynamicCssLast === cssText) return;
		__ytToolsRuntime.dynamicCssLast = cssText;
		__ytToolsRuntime.dynamicStyleEl.textContent = cssText;
	}
	var scheduleApplySettings = (() => {
		let t = null;
		return (applySettingsFn) => {
			if (!__ytToolsRuntime.settingsLoaded) return;
			if (t) clearTimeout(t);
			t = setTimeout(() => {
				if (typeof applySettingsFn === "function") applySettingsFn();
			}, 100);
		};
	})();
	function Notify(type = "info", message = "", title = "") {
		const defaultTitles = {
			success: "Success",
			error: "Error",
			info: "Information",
			warning: "Warning"
		};
		if (isYTMusic$1 || window.trustedTypes && window.trustedTypes.defaultPolicy === null) {
			let toast = document.getElementById("yt-tools-custom-toast");
			if (!toast) {
				toast = document.createElement("div");
				toast.id = "yt-tools-custom-toast";
				toast.style.cssText = "position:fixed;bottom:20px;left:20px;background:rgba(30,30,30,0.9);color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);border-left:4px solid #ff0000;transition:opacity 0.3s;opacity:0;pointer-events:none;";
				document.body.appendChild(toast);
			}
			toast.textContent = (title || defaultTitles[type] || "Notification") + ": " + message;
			if (type === "success") toast.style.borderLeftColor = "#22c55e";
			else if (type === "error") toast.style.borderLeftColor = "#ef4444";
			else if (type === "warning") toast.style.borderLeftColor = "#f59e0b";
			else toast.style.borderLeftColor = "#3b82f6";
			toast.style.opacity = "1";
			if (toast._timer) clearTimeout(toast._timer);
			toast._timer = setTimeout(() => {
				toast.style.opacity = "0";
			}, 3e3);
			return;
		}
		if (typeof iziToast !== "undefined") iziToast[type]({
			title: title || defaultTitles[type],
			message,
			position: "bottomLeft"
		});
	}
	function paramsVideoURL() {
		return new URLSearchParams(window.location.search).get("v");
	}
	function getCurrentVideoId$1() {
		try {
			if (location.pathname.startsWith("/shorts/")) return location.pathname.split("/").filter(Boolean)[1] || null;
			if (location.href.includes("youtube.com/watch")) return paramsVideoURL();
			return null;
		} catch {
			return null;
		}
	}
	function escapeHtml(s) {
		return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
	}
	function FormatterNumber(num, digits) {
		const lookup = [
			{
				value: 1,
				symbol: ""
			},
			{
				value: 1e3,
				symbol: " K"
			},
			{
				value: 1e6,
				symbol: " M"
			}
		];
		const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
		const item = lookup.slice().reverse().find((item) => num >= item.value);
		return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
	}
	function formatTimeShort(sec) {
		const s = Math.max(0, Math.floor(Number(sec) || 0));
		const h = Math.floor(s / 3600);
		const m = Math.floor(s % 3600 / 60);
		const r = s % 60;
		return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
	}
	function isVersionNewer(latestStr, currentStr) {
		if (!latestStr || !currentStr) return false;
		const parse = (s) => String(s).trim().split(".").map((n) => parseInt(n, 10) || 0);
		const a = parse(latestStr);
		const b = parse(currentStr);
		const len = Math.max(a.length, b.length);
		for (let i = 0; i < len; i++) {
			const x = a[i] || 0;
			const y = b[i] || 0;
			if (x > y) return true;
			if (x < y) return false;
		}
		return false;
	}
	async function checkNewVersion() {
		try {
			const last = Number(gmRawGet(STORAGE_KEYS.VERSION_CHECK_LAST, 0));
			if (Date.now() - last < 864e5) return;
			gmRawSet(STORAGE_KEYS.VERSION_CHECK_LAST, Date.now());
			const res = await fetch(UPDATE_META_URL, { cache: "no-store" });
			if (!res.ok) return;
			const m = (await res.text()).match(/@version\s+([\d.]+)/);
			if (!m) return;
			const latestVer = m[1].trim();
			const currentVer = typeof GM_info !== "undefined" && GM_info.script && GM_info.script.version ? String(GM_info.script.version).trim() : "";
			if (!currentVer || !isVersionNewer(latestVer, currentVer)) return;
			const updateUrl = "https://update.greasyfork.org/scripts/460680/Youtube%20Tools%20All%20in%20one%20local%20download%20mp3%20mp4%20HIGT%20QUALITY%20return%20dislikes%20and%20more.user.js";
			if (typeof iziToast !== "undefined") iziToast.show({
				title: "New Update",
				message: "A new version YoutubeTools is available.",
				buttons: [[
					"<button>View Now</button>",
					function(instance, toast) {
						window.open(updateUrl, "_blank");
						instance.hide({ transitionOut: "fadeOut" }, toast, "button");
					},
					true
				]]
			});
		} catch (e) {
			console.warn("[YT Tools] Version check error:", e);
		}
	}
	function isWatchPage$2() {
		return window.location.href.includes("youtube.com/watch");
	}
	function getMainVideoEl$1() {
		return document.querySelector("#movie_player video.video-stream.html5-main-video") || document.querySelector("ytd-player video.video-stream.html5-main-video") || document.querySelector("video.video-stream.html5-main-video") || document.querySelector("video");
	}
	var metaCache = new Map();
	function getCurrentVideoMeta$1() {
		try {
			const videoId = getCurrentVideoId$1();
			if (videoId && metaCache.has(videoId)) return metaCache.get(videoId);
			const domTitle = $e("ytd-watch-metadata h1 yt-formatted-string")?.textContent?.trim() || $e("h1.ytd-watch-metadata yt-formatted-string")?.textContent?.trim() || "";
			const domAuthor = $e("#owner ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a, #text-container.ytd-channel-name a")?.textContent?.trim() || $e("#owner a[href^=\"/@\"], #owner a[href^=\"/channel/\"]")?.textContent?.trim() || "";
			const titleFromDom = (domTitle || document.title || "").replace(/\s*-\s*YouTube\s*$/i, "").trim();
			const authorFromDom = (domAuthor || "").trim();
			const vd = ((typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window)?.ytInitialPlayerResponse || window.ytInitialPlayerResponse)?.videoDetails || null;
			const title = (titleFromDom || vd?.title || document.title || "").replace(/\s*-\s*YouTube\s*$/i, "").trim();
			const author = (authorFromDom || vd?.author || "").trim();
			const thumbs = vd?.thumbnail?.thumbnails;
			const result = {
				title,
				author,
				thumb: Array.isArray(thumbs) ? thumbs[thumbs.length - 1]?.url || "" : ""
			};
			if (videoId) {
				metaCache.set(videoId, result);
				if (metaCache.size > 200) {
					const iter = metaCache.keys();
					let del = metaCache.size - 200;
					while (del-- > 0) metaCache.delete(iter.next().value);
				}
			}
			return result;
		} catch {
			return {
				title: "",
				author: "",
				thumb: ""
			};
		}
	}
	function ensureContinueWatchingMapLoaded() {
		const rt = __ytToolsRuntime.continueWatching;
		if (!rt.map) rt.map = readJsonGM(STORAGE_KEYS.CONTINUE_WATCHING, {});
		if (typeof rt.map !== "object" || !rt.map) rt.map = {};
		return rt.map;
	}
	function pruneContinueWatchingMap(map, maxEntries = 200) {
		try {
			const entries = Object.entries(map || {}).filter(([, v]) => v && typeof v === "object");
			entries.sort((a, b) => (Number(b[1].updatedAt) || 0) - (Number(a[1].updatedAt) || 0));
			const keep = entries.slice(0, maxEntries);
			const next = {};
			for (const [k, v] of keep) next[k] = v;
			return next;
		} catch {
			return map || {};
		}
	}
	function scheduleContinueWatchingFlush() {
		const rt = __ytToolsRuntime.continueWatching;
		clearTimeout(rt.flushT);
		rt.flushT = setTimeout(() => {
			try {
				if (!rt.map) return;
				rt.map = pruneContinueWatchingMap(rt.map, 200);
				writeJsonGM(STORAGE_KEYS.CONTINUE_WATCHING, rt.map);
			} catch {}
		}, 800);
	}
	function clearContinueWatchingForVideo(videoId) {
		if (!videoId) return;
		const rt = __ytToolsRuntime.continueWatching;
		const map = ensureContinueWatchingMapLoaded();
		if (map && Object.prototype.hasOwnProperty.call(map, videoId)) {
			delete map[videoId];
			rt.map = map;
			scheduleContinueWatchingFlush();
		}
	}
	function setContinueWatchingForVideo(videoId, seconds, durationSec) {
		if (!videoId) return;
		const rt = __ytToolsRuntime.continueWatching;
		const map = ensureContinueWatchingMapLoaded();
		const t = Math.max(0, Math.floor(Number(seconds) || 0));
		const d = Math.max(0, Math.floor(Number(durationSec) || 0));
		const prev = map[videoId] && typeof map[videoId] === "object" ? map[videoId] : {};
		const meta = getCurrentVideoMeta$1();
		map[videoId] = {
			t,
			d,
			updatedAt: Date.now(),
			title: meta.title || prev.title || "",
			author: meta.author || prev.author || "",
			thumb: meta.thumb || prev.thumb || ""
		};
		rt.map = map;
		scheduleContinueWatchingFlush();
	}
	function getContinueWatchingTime(videoId) {
		if (!videoId) return null;
		const entry = ensureContinueWatchingMapLoaded()?.[videoId];
		const t = Number(entry?.t);
		return Number.isFinite(t) ? t : null;
	}
	function updateContinueWatchingButton() {
		if (!!!__ytToolsRuntime.continueWatching.enabled || !isWatchPage$2()) return;
		const videoId = getCurrentVideoId$1();
		if (!videoId) return;
		const v = getMainVideoEl$1();
		const t = getContinueWatchingTime(videoId);
		const dur = Number(v?.duration);
		const hasDur = Number.isFinite(dur) && dur > 0;
		if (!t || t < 5) return;
		if (hasDur && t >= dur - 5) {
			clearContinueWatchingForVideo(videoId);
			return;
		}
	}
	function tryAutoResume(videoEl, videoId) {
		if (!__ytToolsRuntime.continueWatching.enabled) return;
		const t = getContinueWatchingTime(videoId);
		if (!t || t < 5) return;
		const dur = Number(videoEl?.duration);
		if (Number.isFinite(dur) && dur > 0) {
			if (t >= dur - 5) {
				clearContinueWatchingForVideo(videoId);
				return;
			}
		}
		if (new URLSearchParams(window.location.search).get("t")) return;
		if (Math.abs((videoEl?.currentTime || 0) - t) > 3) {
			videoEl.currentTime = t;
			try {
				Notify("info", `Resumed at ${formatTimeShort(t)}`);
			} catch {}
		}
	}
	function cssEscapeLite(s) {
		const str = String(s || "");
		if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(str);
		return str.replace(/["\\]/g, "\\$&");
	}
	function navigateToWatchSpa(videoId, seconds) {
		const t = Number(seconds);
		const url = `/watch?v=${encodeURIComponent(videoId)}${Number.isFinite(t) ? `&t=${Math.max(0, Math.floor(t))}s` : ""}`;
		try {
			const a = document.createElement("a");
			a.href = url;
			a.target = "_self";
			a.rel = "noopener";
			a.style.display = "none";
			document.body.appendChild(a);
			a.click();
			a.remove();
			return;
		} catch {}
		location.href = url;
	}
	function updateContinueWatchingHistoryUi() {
		const rt = __ytToolsRuntime.continueWatching;
		const btn = $id("yt-cw-history-toggle");
		const panel = $id("yt-continue-watching-panel");
		if (!btn || !panel) return;
		if (!!!rt.enabled || !isWatchPage$2()) {
			btn.style.display = "none";
			panel.style.display = "none";
			return;
		}
		btn.style.display = "inline-flex";
		panel.style.display = rt.panelOpen ? "block" : "none";
	}
	function updateContinueWatchingPanelRow(videoId) {
		try {
			const rt = __ytToolsRuntime.continueWatching;
			if (!rt.enabled || !rt.panelOpen || !isWatchPage$2()) return false;
			const panel = $id("yt-continue-watching-panel");
			if (!panel) return false;
			const key = cssEscapeLite(videoId);
			const row = panel.querySelector(`.yt-cw-item[data-video-id="${key}"]`);
			if (!row) return false;
			const entry = ensureContinueWatchingMapLoaded()?.[videoId];
			const t = Number(entry?.t);
			if (!Number.isFinite(t)) return false;
			const meta = row.querySelector(".yt-cw-meta");
			if (!meta) return false;
			const author = String(entry?.author || "").trim();
			meta.textContent = `${formatTimeShort(t)}${author ? ` • ${author}` : ""}`;
			return true;
		} catch {
			return false;
		}
	}
	function renderContinueWatchingPanel() {
		const panel = $id("yt-continue-watching-panel");
		if (!panel) return;
		const rt = __ytToolsRuntime.continueWatching;
		if (!rt.enabled || !rt.panelOpen || !isWatchPage$2()) {
			panel.style.display = "none";
			return;
		}
		const map = pruneContinueWatchingMap(ensureContinueWatchingMapLoaded(), 200);
		rt.map = map;
		const currentVid = getCurrentVideoId$1();
		const entries = Object.entries(map).map(([videoId, v]) => ({
			videoId,
			...v
		})).filter((e) => e.videoId && Number.isFinite(Number(e.t)) && Number(e.t) >= 5).sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0)).slice(0, 25);
		panel.replaceChildren();
		const header = document.createElement("div");
		header.className = "yt-cw-header";
		const hTitle = document.createElement("div");
		hTitle.className = "yt-cw-header-title";
		hTitle.textContent = "Continue watching";
		const clearAll = document.createElement("button");
		clearAll.type = "button";
		clearAll.className = "yt-cw-clear";
		clearAll.textContent = "Clear";
		clearAll.dataset.cwAction = "clearAll";
		header.appendChild(hTitle);
		header.appendChild(clearAll);
		panel.appendChild(header);
		if (!entries.length) {
			const empty = document.createElement("div");
			empty.className = "yt-cw-empty";
			empty.textContent = "No history yet. Watch a bit, then reopen any video.";
			panel.appendChild(empty);
			return;
		}
		for (const e of entries) {
			const item = document.createElement("div");
			item.className = "yt-cw-item";
			item.dataset.videoId = e.videoId;
			const thumbWrap = document.createElement("div");
			thumbWrap.className = "yt-cw-thumb-wrap";
			const img = document.createElement("img");
			img.className = "yt-cw-thumb";
			img.loading = "lazy";
			img.decoding = "async";
			img.alt = "";
			img.src = (e.thumb || "").trim() || `https://i.ytimg.com/vi/${encodeURIComponent(e.videoId)}/hqdefault.jpg`;
			thumbWrap.appendChild(img);
			const info = document.createElement("div");
			info.className = "yt-cw-info";
			const title = document.createElement("div");
			title.className = "yt-cw-title";
			const safeTitle = (e.title || "").trim();
			title.textContent = safeTitle ? safeTitle : e.videoId;
			const meta = document.createElement("div");
			meta.className = "yt-cw-meta";
			const author = (e.author || "").trim();
			meta.textContent = `${formatTimeShort(e.t)}${author ? ` • ${author}` : ""}`;
			info.appendChild(title);
			info.appendChild(meta);
			const actions = document.createElement("div");
			actions.className = "yt-cw-actions";
			const tSec = Math.max(0, Math.floor(Number(e.t) || 0));
			let go = null;
			if (currentVid && currentVid === e.videoId) {
				const seek = document.createElement("button");
				seek.type = "button";
				seek.className = "yt-cw-go";
				seek.textContent = "Resume";
				seek.dataset.cwAction = "seek";
				seek.dataset.t = String(tSec);
				go = seek;
			} else {
				const navBtn = document.createElement("button");
				navBtn.type = "button";
				navBtn.className = "yt-cw-go";
				navBtn.textContent = "Resume";
				navBtn.dataset.cwAction = "navigate";
				navBtn.dataset.videoId = e.videoId;
				navBtn.dataset.t = String(tSec);
				go = navBtn;
			}
			const del = document.createElement("button");
			del.type = "button";
			del.className = "yt-cw-del";
			del.textContent = "x";
			del.title = "Delete";
			del.dataset.cwAction = "del";
			del.dataset.videoId = e.videoId;
			actions.appendChild(go);
			actions.appendChild(del);
			item.appendChild(thumbWrap);
			item.appendChild(info);
			item.appendChild(actions);
			panel.appendChild(item);
		}
	}
	function setupContinueWatchingFeature(enabled) {
		const rt = __ytToolsRuntime.continueWatching;
		rt.enabled = !!enabled;
		if (!rt.navHandlerInitialized) {
			rt.navHandlerInitialized = true;
			const refreshCwUi = () => {
				updateContinueWatchingButton();
				updateContinueWatchingHistoryUi();
				if (rt.panelOpen) renderContinueWatchingPanel();
			};
			const onNav = () => {
				try {
					const vid = getCurrentVideoId$1();
					if (rt.lastKnownVideoId !== vid) {
						rt.lastKnownVideoId = vid;
						rt.lastSaveAt = 0;
						rt.lastSavedTime = -1;
						rt.boundVideoId = vid;
					}
					refreshCwUi();
					setTimeout(refreshCwUi, 600);
					setTimeout(refreshCwUi, 1500);
				} catch (e) {
					console.warn("[YT Tools] Continue watching nav handler error:", e);
				}
			};
			window.addEventListener("yt-navigate-finish", onNav, true);
			window.addEventListener("popstate", onNav, true);
			window.addEventListener("hashchange", onNav, true);
		}
		if (!rt.clickHandlerInitialized) {
			rt.clickHandlerInitialized = true;
			document.addEventListener("click", (e) => {
				const target = e.target;
				if (!(target instanceof Element)) return;
				const historyBtn = target.closest("#yt-cw-history-toggle");
				const cwActionBtn = target.closest("[data-cw-action]");
				if (historyBtn) {
					e.preventDefault();
					e.stopPropagation();
					rt.panelOpen = !rt.panelOpen;
					updateContinueWatchingHistoryUi();
					if (rt.panelOpen) renderContinueWatchingPanel();
					return;
				}
				if (cwActionBtn) {
					const action = cwActionBtn.getAttribute("data-cw-action");
					if (!action) return;
					e.preventDefault();
					e.stopPropagation();
					if (action === "clearAll") {
						rt.map = {};
						writeJsonGM(STORAGE_KEYS.CONTINUE_WATCHING, {});
						renderContinueWatchingPanel();
						updateContinueWatchingButton();
						try {
							Notify("success", "History cleared");
						} catch (e2) {
							console.warn("[YT Tools] Notify error:", e2);
						}
						return;
					}
					if (action === "del") {
						const vid = cwActionBtn.getAttribute("data-video-id") || "";
						if (vid) clearContinueWatchingForVideo(vid);
						renderContinueWatchingPanel();
						updateContinueWatchingButton();
						return;
					}
					if (action === "seek") {
						const t = Number(cwActionBtn.getAttribute("data-t"));
						const v = getMainVideoEl$1();
						if (!v || !Number.isFinite(t)) return;
						v.currentTime = Math.max(0, t);
						v.play?.().catch(() => {});
						try {
							Notify("success", `Resume: ${formatTimeShort(t)}`);
						} catch (e2) {
							console.warn("[YT Tools] Notify error:", e2);
						}
						updateContinueWatchingButton();
						return;
					}
					if (action === "navigate") {
						const vid = cwActionBtn.getAttribute("data-video-id") || "";
						const t = Number(cwActionBtn.getAttribute("data-t"));
						if (!vid) return;
						navigateToWatchSpa(vid, t);
						return;
					}
				}
			}, true);
		}
		if (!rt.pagehideHandlerInitialized) {
			rt.pagehideHandlerInitialized = true;
			window.addEventListener("pagehide", () => {
				try {
					if (!rt.enabled) return;
					if (!isWatchPage$2()) return;
					const vid = getCurrentVideoId$1();
					const v = getMainVideoEl$1();
					if (!vid || !v) return;
					const t = Number(v.currentTime);
					const d = Number(v.duration);
					if (Number.isFinite(t) && t >= 5) setContinueWatchingForVideo(vid, t, d);
					if (rt.flushT) {
						clearTimeout(rt.flushT);
						rt.flushT = null;
					}
					if (rt.map) writeJsonGM(STORAGE_KEYS.CONTINUE_WATCHING, pruneContinueWatchingMap(rt.map, 200));
				} catch (e) {
					console.warn("[YT Tools] Continue watching error:", e);
				}
			}, { capture: true });
		}
		const historyBtn = $id("yt-cw-history-toggle");
		const panel = $id("yt-continue-watching-panel");
		if (historyBtn && !rt.enabled) historyBtn.style.display = "none";
		if (panel && !rt.enabled) panel.style.display = "none";
		if (!rt.enabled || !isWatchPage$2()) {
			try {
				if (rt.boundVideo && rt.handlers) {
					rt.boundVideo.removeEventListener("timeupdate", rt.handlers.timeupdate);
					rt.boundVideo.removeEventListener("pause", rt.handlers.pause);
					rt.boundVideo.removeEventListener("ended", rt.handlers.ended);
					rt.boundVideo.removeEventListener("loadedmetadata", rt.handlers.loadedmetadata);
					rt.boundVideo.removeEventListener("seeked", rt.handlers.seeked);
				}
			} catch (e) {
				console.warn("[YT Tools] Continue watching error:", e);
			}
			rt.boundVideo = null;
			rt.boundVideoId = null;
			rt.handlers = null;
			updateContinueWatchingButton();
			updateContinueWatchingHistoryUi();
			return;
		}
		const v = getMainVideoEl$1();
		const videoId = getCurrentVideoId$1();
		if (!v || !videoId) {
			updateContinueWatchingButton();
			updateContinueWatchingHistoryUi();
			return;
		}
		if (rt.boundVideoId !== videoId) {
			rt.boundVideoId = videoId;
			rt.lastSaveAt = 0;
			rt.lastSavedTime = -1;
		}
		if (rt.boundVideo && rt.boundVideo !== v && rt.handlers) {
			try {
				rt.boundVideo.removeEventListener("timeupdate", rt.handlers.timeupdate);
				rt.boundVideo.removeEventListener("pause", rt.handlers.pause);
				rt.boundVideo.removeEventListener("ended", rt.handlers.ended);
				rt.boundVideo.removeEventListener("loadedmetadata", rt.handlers.loadedmetadata);
				rt.boundVideo.removeEventListener("seeked", rt.handlers.seeked);
			} catch (e) {
				console.warn("[YT Tools] Continue watching error:", e);
			}
			rt.boundVideo = null;
			rt.boundVideoId = null;
			rt.handlers = null;
		}
		rt.boundVideo = v;
		rt.boundVideoId = videoId;
		if (!rt.handlers) {
			rt.handlers = {
				timeupdate: () => {
					try {
						if (!rt.enabled) return;
						const vid = getCurrentVideoId$1();
						if (!vid) return;
						const now = Date.now();
						if (now - rt.lastSaveAt < 5e3) return;
						if (v.paused) return;
						const t = Number(v.currentTime);
						const d = Number(v.duration);
						if (!Number.isFinite(t)) return;
						if (Math.abs(t - rt.lastSavedTime) < 2) return;
						rt.lastSaveAt = now;
						rt.lastSavedTime = t;
						if (t < 5) return;
						setContinueWatchingForVideo(vid, t, d);
						updateContinueWatchingButton();
						if (rt.panelOpen) {
							if (!updateContinueWatchingPanelRow(vid)) renderContinueWatchingPanel();
						}
					} catch (e) {
						console.warn("[YT Tools] Continue watching error:", e);
					}
				},
				pause: () => {
					try {
						if (!rt.enabled) return;
						const vid = getCurrentVideoId$1();
						if (!vid) return;
						const t = Number(v.currentTime);
						const d = Number(v.duration);
						if (!Number.isFinite(t)) return;
						if (t < 5) clearContinueWatchingForVideo(vid);
						else setContinueWatchingForVideo(vid, t, d);
						updateContinueWatchingButton();
						if (rt.panelOpen) {
							if (!updateContinueWatchingPanelRow(vid)) renderContinueWatchingPanel();
						}
					} catch (e) {
						console.warn("[YT Tools] Continue watching error:", e);
					}
				},
				ended: () => {
					try {
						const vid = getCurrentVideoId$1();
						if (vid) clearContinueWatchingForVideo(vid);
						updateContinueWatchingButton();
						if (rt.panelOpen) renderContinueWatchingPanel();
					} catch (e) {
						console.warn("[YT Tools] Continue watching error:", e);
					}
				},
				loadedmetadata: () => {
					updateContinueWatchingButton();
					if (rt.panelOpen) renderContinueWatchingPanel();
					tryAutoResume(v, videoId);
				},
				seeked: () => {
					updateContinueWatchingButton();
					const vid = getCurrentVideoId$1();
					if (rt.panelOpen && vid) updateContinueWatchingPanelRow(vid);
				}
			};
			v.addEventListener("timeupdate", rt.handlers.timeupdate, { passive: true });
			v.addEventListener("pause", rt.handlers.pause, { passive: true });
			v.addEventListener("ended", rt.handlers.ended, { passive: true });
			v.addEventListener("loadedmetadata", rt.handlers.loadedmetadata, { passive: true });
			v.addEventListener("seeked", rt.handlers.seeked, { passive: true });
		}
		updateContinueWatchingButton();
		updateContinueWatchingHistoryUi();
		if (!document.querySelector(".yt-tools-container")) {
			const onReady = () => {
				window.removeEventListener("yt-tools-toolbar-ready", onReady);
				updateContinueWatchingButton();
				updateContinueWatchingHistoryUi();
				if (rt.panelOpen) renderContinueWatchingPanel();
			};
			window.addEventListener("yt-tools-toolbar-ready", onReady);
		}
	}
	var apiDislikes = "https://returnyoutubedislikeapi.com/Votes?videoId=";
	var apiGoogleTranslate = "https://translate.googleapis.com/translate_a/t";
	var DUBS_START_ENDPOINT = "https://dubs.io/wp-json/tools/v1/download-video";
	var DUBS_STATUS_ENDPOINT = "https://dubs.io/wp-json/tools/v1/status-video";
	var PROCESSED_FLAG = "wave_visualizer_processed";
	var SMOOTHING_FACTOR = .05;
	function normalizeYouTubeURL(rawURL) {
		try {
			const u = new URL(rawURL);
			let videoId = u.searchParams.get("v");
			if (!videoId && u.hostname === "youtu.be") videoId = u.pathname.slice(1);
			if (!videoId) return rawURL;
			return `https://www.youtube.com/watch?v=${videoId}`;
		} catch {
			return rawURL;
		}
	}
	var AUDIO_FORMATS = new Set([
		"best",
		"mp3",
		"ogg",
		"opus",
		"webm",
		"wav"
	]);
	var isAudioFormat = (f) => AUDIO_FORMATS.has(String(f).toLowerCase());
	function toCobaltAudioFormat(f) {
		if (f === "mp3" || f === "ogg" || f === "opus" || f === "wav") return f;
		return "best";
	}
	function toCobaltVideoQuality(quality) {
		if (quality === "4k") return "2160";
		if (quality === "8k") return "4320";
		if (/^\d+$/.test(String(quality))) return String(quality);
		return "max";
	}
	var FORMAT_LABELS = {
		best: "Original audio",
		mp3: "MP3 320 kbps",
		ogg: "OGG",
		opus: "OPUS",
		webm: "WEBM",
		wav: "WAV",
		144: "144p",
		240: "240p",
		360: "360p",
		480: "480p",
		720: "720p HD",
		1080: "1080p Full HD",
		1440: "1440p 2K",
		"4k": "2160p 4K",
		"8k": "4320p 8K"
	};
	var MIME_EXTENSIONS = {
		"audio/mpeg": "mp3",
		"audio/mp3": "mp3",
		"audio/mp4": "m4a",
		"audio/aac": "aac",
		"audio/ogg": "ogg",
		"audio/opus": "opus",
		"audio/wav": "wav",
		"audio/webm": "webm",
		"video/mp4": "mp4",
		"video/webm": "webm"
	};
	function getFormatLabel(format) {
		return FORMAT_LABELS[String(format).toLowerCase()] || String(format).toUpperCase();
	}
	function sanitizeFilename(value) {
		return String(value || "youtube-download").split("").filter((char) => {
			const code = char.charCodeAt(0);
			return code >= 32 && code !== 127;
		}).join("").replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, " ").trim().slice(0, 140) || "youtube-download";
	}
	function getCurrentVideoTitle() {
		return document.querySelector("h1 yt-formatted-string")?.textContent?.trim() || document.querySelector("ytmusic-player-bar .title")?.textContent?.trim() || document.title.replace(/\s*-\s*YouTube(?: Music)?\s*$/i, "").trim() || "youtube-download";
	}
	function getResponseHeader(headers, name) {
		return String(headers || "").match(new RegExp(`^${name}:\\s*(.+)$`, "im"))?.[1]?.trim() || "";
	}
	function getFilenameFromDisposition(headers) {
		const disposition = getResponseHeader(headers, "content-disposition");
		if (!disposition) return "";
		const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
		if (encoded) try {
			return decodeURIComponent(encoded);
		} catch {}
		return disposition.match(/filename="?([^";]+)"?/i)?.[1] || "";
	}
	function getExtensionFromDownload(downloadUrl, blob, format, type, headers) {
		const dispositionExt = getFilenameFromDisposition(headers).match(/\.([a-z0-9]+)$/i)?.[1];
		if (dispositionExt) return dispositionExt.toLowerCase();
		const contentType = getResponseHeader(headers, "content-type") || blob?.type;
		const mimeExt = MIME_EXTENSIONS[String(contentType).split(";")[0].toLowerCase()];
		if (mimeExt) return mimeExt;
		try {
			const pathExt = new URL(downloadUrl).pathname.match(/\.([a-z0-9]+)$/i)?.[1];
			if (pathExt) return pathExt.toLowerCase();
		} catch {}
		if (format === "best") return type === "audio" ? "m4a" : "mp4";
		if (format === "webm") return "webm";
		return type === "audio" ? format : "mp4";
	}
	function buildDownloadFilename(downloadUrl, blob, format, type, headers) {
		const dispositionName = getFilenameFromDisposition(headers);
		if (dispositionName) return sanitizeFilename(dispositionName);
		const ext = getExtensionFromDownload(downloadUrl, blob, format, type, headers);
		const prefix = type === "audio" ? "audio" : "video";
		return `${sanitizeFilename(getCurrentVideoTitle())}-${prefix}.${ext}`;
	}
	function clearDownloadPoll(container) {
		if (container.__ytDownloadPoll) {
			clearTimeout(container.__ytDownloadPoll);
			container.__ytDownloadPoll = null;
		}
	}
	function abortActiveDownload(container) {
		clearDownloadPoll(container);
		container.__ytDownloadToken = Symbol("cancelled-download");
		if (container.__ytDownloadRequests) {
			container.__ytDownloadRequests.forEach((req) => {
				try {
					req.abort?.();
				} catch {}
			});
			container.__ytDownloadRequests.clear();
		}
	}
	var COBALT_APIS_FALLBACK = [
		"https://cobaltapi.kittycat.boo/",
		"https://cobaltapi.cjs.nz/",
		"https://api.cobalt.blackcat.sweeux.org/",
		"https://dog.kittycat.boo/",
		"https://rue-cobalt.xenon.zone/"
	];
	function fetchWorkingCobaltApis() {
		return new Promise((resolve) => {
			const key = window.location.hostname.includes("music.youtube.com") ? "youtube-music" : "youtube";
			const t = setTimeout(() => {
				console.warn("[YT Tools] Timeout fetching working Cobalt APIs, using fallback list");
				resolve(COBALT_APIS_FALLBACK);
			}, 4e3);
			GM_xmlhttpRequest({
				method: "GET",
				url: "https://cobalt.directory/api/working?type=api",
				responseType: "json",
				onload: function(res) {
					clearTimeout(t);
					try {
						const data = typeof res.response === "string" ? JSON.parse(res.response) : res.response || JSON.parse(res.responseText);
						if (data && data.data) {
							let list = data.data[key] || data.data["youtube"] || [];
							if (list.length > 0) {
								list = list.map((url) => url.endsWith("/") ? url : url + "/");
								resolve(Array.from(new Set([...list, ...COBALT_APIS_FALLBACK])));
								return;
							}
						}
					} catch (e) {
						console.warn("[YT Tools] Error parsing Cobalt directory response:", e);
					}
					resolve(COBALT_APIS_FALLBACK);
				},
				onerror: function() {
					clearTimeout(t);
					resolve(COBALT_APIS_FALLBACK);
				},
				onabort: function() {
					clearTimeout(t);
					resolve(COBALT_APIS_FALLBACK);
				}
			});
		});
	}
	async function startDownloadVideoOrAudio(format, container) {
		format = String(format || "").toLowerCase();
		const videoURL = normalizeYouTubeURL(window.location.href);
		const isAudio = (container.dataset.type || (isAudioFormat(format) ? "audio" : "video")) === "audio" || isAudioFormat(format);
		if (container.dataset.downloading === "true") return;
		abortActiveDownload(container);
		const downloadToken = Symbol("yt-download");
		container.__ytDownloadToken = downloadToken;
		container.__ytDownloadRequests = new Set();
		const isCurrentDownload = () => container.__ytDownloadToken === downloadToken;
		const trackRequest = (req) => {
			if (req?.abort) container.__ytDownloadRequests.add(req);
			return req;
		};
		const untrackRequest = (req) => {
			if (req?.abort) container.__ytDownloadRequests?.delete(req);
		};
		const downloadBtn = container.querySelector(".download-btn");
		const retryBtn = container.querySelector(".retry-btn");
		const progressRetryBtn = container.querySelector(".progress-retry-btn");
		const downloadAgainBtn = container.querySelector(".download-again-btn");
		const progressContainer = container.querySelector(".progress-container");
		const progressFill = container.querySelector(".progress-fill");
		const progressText = container.querySelector(".progress-text");
		const downloadText = container.querySelector(".download-text");
		const downloadQuality = container.querySelector(".download-quality");
		const providerText = container.querySelector(".download-provider");
		container.dataset.downloading = "true";
		container.dataset.type = isAudio ? "audio" : "video";
		container.dataset.quality = format;
		container.dataset.urlOpened = "false";
		container.dataset.lastDownloadUrl = "";
		const typeClass = isAudio ? "audio" : "video";
		container.classList.remove("audio", "video", "completed", "error", "is-downloading");
		container.classList.add(typeClass, "is-downloading");
		let statusText = container.querySelector(".download-status-text");
		if (!statusText) {
			statusText = document.createElement("div");
			statusText.className = "download-status-text status-dot";
			container.appendChild(statusText);
		}
		if (downloadBtn) downloadBtn.style.display = "none";
		if (retryBtn) retryBtn.style.display = "none";
		if (progressRetryBtn) progressRetryBtn.style.display = "block";
		if (downloadAgainBtn) downloadAgainBtn.style.display = "none";
		if (progressContainer) progressContainer.style.display = "flex";
		if (downloadText) downloadText.textContent = isAudio ? "Đang chuẩn bị tải nhạc" : "Đang chuẩn bị tải video";
		if (downloadQuality) downloadQuality.textContent = getFormatLabel(format);
		if (providerText) providerText.textContent = "Provider: auto";
		if (progressFill) {
			progressFill.style.width = "0%";
			progressFill.classList.add("indeterminate");
		}
		if (progressText) progressText.textContent = "0%";
		if (statusText) {
			statusText.textContent = "Đang kết nối máy chủ tải...";
			statusText.className = "download-status-text status-dot";
		}
		const updateProgress = (pct, statusMsg) => {
			if (!isCurrentDownload()) return;
			const safePct = Math.max(0, Math.min(Number(pct) || 0, 100));
			if (progressFill) {
				if (safePct > 0) progressFill.classList.remove("indeterminate");
				progressFill.style.width = `${safePct}%`;
			}
			if (progressText) progressText.textContent = `${Math.round(safePct)}%`;
			if (statusText && statusMsg) statusText.textContent = statusMsg;
		};
		const setProvider = (provider) => {
			if (providerText) providerText.textContent = `Provider: ${provider}`;
		};
		const fetchJsonWithTimeout = (url, timeoutMs = 2e4) => {
			return new Promise((resolve, reject) => {
				let aborted = false;
				let req = null;
				const t = setTimeout(() => {
					aborted = true;
					untrackRequest(req);
					reject(new Error("Timeout"));
					if (req && req.abort) req.abort();
				}, timeoutMs);
				req = trackRequest(GM_xmlhttpRequest({
					method: "GET",
					url,
					responseType: "json",
					onload: function(res) {
						if (aborted) return;
						clearTimeout(t);
						untrackRequest(req);
						if (res.status !== 200) {
							reject(new Error(`HTTP ${res.status}`));
							return;
						}
						let data = res.response;
						if (typeof data === "string") try {
							data = JSON.parse(data);
						} catch {}
						resolve(data);
					},
					onerror: function() {
						if (aborted) return;
						clearTimeout(t);
						untrackRequest(req);
						reject(new Error("Failed to fetch"));
					},
					onabort: function() {
						if (aborted) return;
						clearTimeout(t);
						untrackRequest(req);
						reject(new Error("Aborted"));
					}
				}));
			});
		};
		const setErrorState = (message) => {
			if (!isCurrentDownload()) return;
			if (retryBtn) retryBtn.style.display = "block";
			if (downloadBtn) downloadBtn.style.display = "none";
			if (progressContainer) progressContainer.style.display = "none";
			if (progressRetryBtn) progressRetryBtn.style.display = "none";
			if (downloadAgainBtn) downloadAgainBtn.style.display = "none";
			container.classList.remove("completed", "video", "audio", "is-downloading");
			container.classList.add("error");
			container.dataset.downloading = "false";
			container.dataset.urlOpened = "false";
			container.dataset.lastDownloadUrl = "";
			if (downloadText) downloadText.textContent = isAudio ? "Tải nhạc chưa thành công" : "Tải video chưa thành công";
			if (statusText) {
				statusText.className = "download-status-text";
				statusText.textContent = message || "Máy chủ tải đang quá tải. Hãy thử lại.";
			}
			if (message) Notify("error", message);
		};
		const markCompleteAndOpen = (downloadUrl) => {
			if (!isCurrentDownload()) return;
			if (!downloadUrl) {
				setErrorState();
				return;
			}
			container.dataset.lastDownloadUrl = String(downloadUrl);
			if (container.dataset.urlOpened === "true") return;
			container.dataset.urlOpened = "true";
			container.classList.add("completed");
			container.classList.remove("video", "audio", "error", "is-downloading");
			if (downloadText) downloadText.textContent = "Đã tạo link tải";
			if (progressFill) {
				progressFill.classList.remove("indeterminate");
				progressFill.style.width = "100%";
			}
			if (progressText) progressText.textContent = "100%";
			if (progressRetryBtn) progressRetryBtn.style.display = "none";
			if (downloadAgainBtn) downloadAgainBtn.style.display = "flex";
			if (statusText) {
				statusText.className = "download-status-text";
				statusText.textContent = "File sẵn sàng. Đang tải về máy...";
			}
			container.dataset.downloading = "false";
			Notify("success", isAudio ? "Đã bắt đầu tải nhạc!" : "Đã bắt đầu tải video!");
			try {
				let blobReq = null;
				blobReq = trackRequest(GM_xmlhttpRequest({
					method: "GET",
					url: downloadUrl,
					responseType: "blob",
					onload: function(res) {
						untrackRequest(blobReq);
						if (!isCurrentDownload()) return;
						const responseBlob = res.response;
						if (res.status !== 200 || !responseBlob) {
							console.warn("[YT Tools] Blob download returned non-200 status, falling back to direct download link");
							window.open(downloadUrl, "_blank");
							if (downloadText) downloadText.textContent = "Mở link tải trực tiếp";
							if (statusText) statusText.textContent = "Đang tải qua trình duyệt...";
							container.dataset.downloading = "false";
							return;
						}
						if (responseBlob.size < 5e4) {
							console.warn("[YT Tools] Blob size too small, probably error page. Falling back to direct download link");
							window.open(downloadUrl, "_blank");
							if (downloadText) downloadText.textContent = "Mở link tải trực tiếp";
							if (statusText) statusText.textContent = "Đang tải qua trình duyệt...";
							container.dataset.downloading = "false";
							return;
						}
						const filename = buildDownloadFilename(downloadUrl, responseBlob, format, typeClass, res.responseHeaders);
						const url = URL.createObjectURL(responseBlob);
						const a = document.createElement("a");
						a.href = url;
						a.download = filename;
						a.style.display = "none";
						document.body.appendChild(a);
						a.click();
						a.remove();
						setTimeout(() => URL.revokeObjectURL(url), 6e4);
						if (downloadText) downloadText.textContent = "Tải xong";
						if (statusText) statusText.textContent = "Đã lưu file vào trình duyệt.";
					},
					onerror: function() {
						untrackRequest(blobReq);
						if (!isCurrentDownload()) return;
						console.warn("[YT Tools] Blob download failed, falling back to direct download link");
						window.open(downloadUrl, "_blank");
						if (downloadText) downloadText.textContent = "Mở link tải trực tiếp";
						if (statusText) statusText.textContent = "Đang tải qua trình duyệt...";
						container.dataset.downloading = "false";
					}
				}));
			} catch (e) {
				console.warn("[YT Tools] Could not trigger download:", e);
				window.open(downloadUrl, "_blank");
			}
		};
		const tryDubsProvider = async () => {
			const videoId = paramsVideoURL();
			if (!videoId) throw new Error("Missing videoId");
			const dubsFormat = isAudio && (format === "best" || format === "webm") ? "mp3" : format;
			const startUrl = new URL(DUBS_START_ENDPOINT);
			startUrl.searchParams.set("id", videoId);
			startUrl.searchParams.set("format", String(dubsFormat));
			setProvider("Dubs");
			updateProgress(12, "Dubs đang tạo link dự phòng...");
			const startData = await fetchJsonWithTimeout(startUrl.toString(), 25e3);
			if (!startData?.success || !startData?.progressId) throw new Error("Dubs provider did not return success/progressId");
			const statusUrl = new URL(DUBS_STATUS_ENDPOINT);
			statusUrl.searchParams.set("id", startData.progressId);
			let dubsFailCount = 0;
			let dubsDelay = 2e3;
			const pollDubs = async () => {
				if (!isCurrentDownload()) return;
				try {
					const st = await fetchJsonWithTimeout(statusUrl.toString(), 2e4);
					dubsFailCount = 0;
					dubsDelay = 2e3;
					const rawProgress = Number(st?.progress) || 0;
					const progress = Math.max(15, Math.min(rawProgress / 10, 96));
					updateProgress(progress, progress < 40 ? "Dubs đang xử lý..." : "Dubs đang chuẩn bị file...");
					if (st?.finished && st?.downloadUrl) {
						clearDownloadPoll(container);
						container.__ytDownloadPoll = null;
						markCompleteAndOpen(st.downloadUrl);
						return;
					}
				} catch (e) {
					dubsFailCount++;
					if (dubsFailCount >= 5) {
						console.error("[YT Tools] Dubs polling failed after 5 retries:", e);
						clearDownloadPoll(container);
						setErrorState("Download failed - server error. Please retry.");
						return;
					}
					console.warn(`[YT Tools] Dubs poll error (${dubsFailCount}/5):`, e);
					updateProgress(35, `Dubs chưa phản hồi, thử lại lần ${dubsFailCount}/5...`);
					dubsDelay = Math.min(dubsDelay * 2, 16e3);
				}
				container.__ytDownloadPoll = setTimeout(pollDubs, dubsDelay);
			};
			container.__ytDownloadPoll = setTimeout(pollDubs, dubsDelay);
		};
		const tryCobaltProvider = (cobaltApis) => {
			return new Promise((resolve, reject) => {
				const body = {
					url: videoURL,
					downloadMode: isAudio ? "audio" : "auto",
					videoQuality: toCobaltVideoQuality(format),
					filenameStyle: "pretty"
				};
				if (isAudio) {
					body.audioFormat = toCobaltAudioFormat(format);
					body.audioBitrate = "320";
				}
				let attempt = 0;
				const makeRequest = () => {
					if (!isCurrentDownload()) return;
					if (attempt >= cobaltApis.length) {
						reject(new Error("All Cobalt APIs failed"));
						return;
					}
					const api = cobaltApis[attempt];
					setProvider(`Cobalt ${attempt + 1}/${cobaltApis.length}`);
					updateProgress(Math.min(8 + attempt * 4, 55), `Đang thử Cobalt ${attempt + 1}/${cobaltApis.length}...`);
					let reqAborted = false;
					let req = null;
					const timeoutId = setTimeout(() => {
						reqAborted = true;
						untrackRequest(req);
						try {
							req?.abort?.();
						} catch {}
						attempt++;
						makeRequest();
					}, 1e4);
					req = trackRequest(GM_xmlhttpRequest({
						method: "POST",
						url: api,
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json"
						},
						data: JSON.stringify(body),
						onload: function(res) {
							if (reqAborted) return;
							clearTimeout(timeoutId);
							untrackRequest(req);
							if (res.status !== 200) {
								console.warn(`[YT Tools] Cobalt API ${api} returned status ${res.status}`);
								attempt++;
								makeRequest();
								return;
							}
							let data;
							try {
								data = typeof res.response === "string" ? JSON.parse(res.response) : res.response || JSON.parse(res.responseText);
							} catch {
								attempt++;
								makeRequest();
								return;
							}
							if (data.status === "error") {
								console.warn(`[YT Tools] Cobalt (${api}) error:`, data.error?.code || data.text);
								attempt++;
								makeRequest();
							} else if (data.status === "picker" && Array.isArray(data.picker) && data.picker.length) {
								const pick = isAudio ? data.picker.find((p) => p.type === "audio") || data.picker[0] : data.picker[0];
								if (pick?.url) resolve({
									success: true,
									download_url: pick.url,
									provider: "Cobalt"
								});
								else {
									attempt++;
									makeRequest();
								}
							} else if (data.url) resolve({
								success: true,
								download_url: data.url,
								provider: "Cobalt"
							});
							else {
								attempt++;
								makeRequest();
							}
						},
						onerror: function() {
							if (reqAborted) return;
							clearTimeout(timeoutId);
							untrackRequest(req);
							attempt++;
							makeRequest();
						}
					}));
				};
				makeRequest();
			});
		};
		try {
			let started = null;
			let lastErr = null;
			try {
				updateProgress(2, "Đang tìm máy chủ Cobalt còn hoạt động...");
				const cobaltApis = await fetchWorkingCobaltApis();
				updateProgress(5, `Tìm thấy ${cobaltApis.length} máy chủ, đang chọn máy chủ nhanh nhất...`);
				started = await tryCobaltProvider(cobaltApis);
			} catch (e) {
				console.warn("[YT Tools] Cobalt failed:", e);
				lastErr = e;
			}
			if (started?.success && started?.download_url) {
				setProvider(started.provider || "Cobalt");
				markCompleteAndOpen(started.download_url);
				return;
			}
			console.warn("[YT Tools] Cobalt failed, trying dubs.io", lastErr);
			updateProgress(10, "Cobalt bận, chuyển sang máy chủ dự phòng...");
			await tryDubsProvider();
		} catch (error) {
			setErrorState("Tất cả máy chủ tải đang quá tải. Vui lòng thử lại sau!");
			console.error("[YT Tools] Download error:", error);
		}
	}
	function setupDownloadClickHandler() {
		if (__ytToolsRuntime.downloadClickHandlerInitialized) return;
		__ytToolsRuntime.downloadClickHandlerInitialized = true;
		document.addEventListener("click", (e) => {
			const target = e.target;
			if (!(target instanceof Element)) return;
			const clicked = target.closest(".download-btn") || target.closest(".retry-btn") || target.closest(".progress-retry-btn") || target.closest(".download-again-btn");
			if (!clicked) return;
			e.preventDefault();
			const container = clicked.closest(".download-container");
			if (!container) return;
			let quality = container.dataset.quality;
			let type = container.dataset.type;
			if (!quality) {
				const parent = container.parentElement;
				if (parent) {
					const sel = parent.querySelector("select");
					if (sel && sel.value) quality = sel.value;
				}
			}
			if (!type) type = container.classList.contains("ocultarframeaudio") ? "audio" : "video";
			if (clicked.classList.contains("download-again-btn")) {
				const url = container.dataset.lastDownloadUrl;
				if (url) try {
					const a = document.createElement("a");
					a.href = url;
					a.target = "_blank";
					a.rel = "noopener noreferrer";
					a.style.display = "none";
					document.body.appendChild(a);
					a.click();
					a.remove();
				} catch (e) {
					console.warn("[YT Tools] Could not reopen download:", e);
					window.open(url);
				}
				return;
			}
			if (!quality) {
				Notify("warning", `Vui lòng chọn ${type === "audio" ? "định dạng nhạc" : "chất lượng video"} trước.`);
				return;
			}
			if (!type) return;
			if (clicked.classList.contains("progress-retry-btn")) {
				abortActiveDownload(container);
				container.dataset.downloading = "false";
				container.dataset.urlOpened = "false";
				container.dataset.lastDownloadUrl = "";
				const againBtn = container.querySelector(".download-again-btn");
				if (againBtn) againBtn.style.display = "none";
			}
			startDownloadVideoOrAudio(quality, container);
		});
	}
	function initDownloadFeature() {
		const downloadBtn = $id("downloadBtn");
		if (!downloadBtn || downloadBtn.dataset.ytDownloadBound) return;
		downloadBtn.dataset.ytDownloadBound = "1";
		downloadBtn.addEventListener("click", () => {
			const format = $id("downloadFormat")?.value || "mp4";
			const quality = $id("downloadQuality")?.value || "best";
			const statusEl = $id("downloadStatus");
			if (statusEl) statusEl.textContent = "Starting download...";
			const tmpContainer = $id("download-status") || $id("download-status-mp3");
			if (tmpContainer) {
				tmpContainer.dataset.quality = quality;
				tmpContainer.dataset.type = isAudioFormat(format) ? "audio" : "video";
				startDownloadVideoOrAudio(quality, tmpContainer);
			}
		});
	}
	var policyInst = null;
	function getTT() {
		try {
			return typeof unsafeWindow !== "undefined" ? unsafeWindow.trustedTypes : window.trustedTypes;
		} catch {
			return null;
		}
	}
	function initPolicy() {
		if (policyInst) return policyInst;
		const tt = getTT();
		if (!tt) {
			policyInst = null;
			return null;
		}
		for (const name of [
			"yt-tools-mdcm",
			"default",
			"youtube-tools",
			"script-policy"
		]) try {
			policyInst = tt.createPolicy(name, { createHTML: (s) => s });
			if (policyInst) return policyInst;
		} catch {}
		policyInst = tt.defaultPolicy || null;
		return policyInst;
	}
	var policy = initPolicy();
	function safeHTML(str) {
		const p = policy || initPolicy();
		if (p && typeof p.createHTML === "function") try {
			return p.createHTML(str);
		} catch {
			return str;
		}
		return str;
	}
	function setHTML(el, html) {
		if (!el) return;
		const trusted = safeHTML(html);
		try {
			el.innerHTML = trusted;
		} catch {
			el.textContent = "";
			const range = document.createRange();
			range.selectNodeContents(el);
			try {
				const frag = range.createContextualFragment(html);
				el.appendChild(frag);
			} catch {
				el.textContent = html.replace(/<[^>]*>/g, "");
			}
		}
	}
	var isMusic = location.hostname === "music.youtube.com";
	var STORAGE = {
		USAGE: STORAGE_KEYS.TOTAL_USAGE,
		VIDEO: isMusic ? STORAGE_KEYS.YTM_LISTEN_TIME : STORAGE_KEYS.VIDEO_TIME,
		SHORTS: STORAGE_KEYS.SHORTS_TIME,
		DETAIL: isMusic ? STORAGE_KEYS.YTM_DETAILED_STATS : STORAGE_KEYS.DETAILED_STATS,
		DAILY: isMusic ? STORAGE_KEYS.YTM_DAILY_STATS : STORAGE_KEYS.DAILY_STATS,
		SESSION: isMusic ? STORAGE_KEYS.YTM_SESSION_START : STORAGE_KEYS.SESSION_START
	};
	var usageTime = 0;
	var videoTime = 0;
	var shortsTime = 0;
	var sessionTime = 0;
	var videosWatched = 0;
	var lastUpdate = Date.now();
	var detailedStats = {};
	var dailyStats = {};
	var domCache = {};
	function loadStats() {
		Object.keys(domCache).forEach((k) => delete domCache[k]);
		usageTime = Number(gmRawGet(STORAGE.USAGE, 0)) || 0;
		videoTime = Number(gmRawGet(STORAGE.VIDEO, 0)) || 0;
		shortsTime = Number(gmRawGet(STORAGE.SHORTS, 0)) || 0;
		try {
			detailedStats = JSON.parse(gmRawGet(STORAGE.DETAIL, "{}"));
		} catch {
			detailedStats = {};
		}
		try {
			dailyStats = JSON.parse(gmRawGet(STORAGE.DAILY, "{}"));
		} catch {
			dailyStats = {};
		}
		videosWatched = Object.keys(detailedStats).length;
		const sessionStart = Number(gmRawGet(STORAGE.SESSION, 0));
		const now = Date.now();
		if (now - sessionStart > 36e5) {
			sessionTime = 0;
			gmRawSet(STORAGE.SESSION, now);
		} else sessionTime = (now - sessionStart) / 1e3;
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
		if (!detailedStats[key]) detailedStats[key] = {
			title: "",
			channel: "",
			totalSec: 0,
			firstWatched: now,
			lastWatched: now,
			count: 0
		};
		const e = detailedStats[key];
		e.totalSec += deltaSec;
		e.lastWatched = now;
		e.count++;
		if (title) e.title = String(title).substring(0, 200);
		if (channel) e.channel = String(channel).substring(0, 100);
		const day = new Date(now).toISOString().slice(0, 10);
		if (!dailyStats[day]) dailyStats[day] = {
			videoSec: 0,
			shortsSec: 0,
			totalSec: 0
		};
		dailyStats[day].totalSec += deltaSec;
		if (location.pathname.startsWith("/shorts")) dailyStats[day].shortsSec += deltaSec;
		else dailyStats[day].videoSec += deltaSec;
		videosWatched = Object.keys(detailedStats).length;
	}
	function getTodayStats() {
		const day = new Date().toISOString().slice(0, 10);
		return dailyStats[day] || {
			videoSec: 0,
			shortsSec: 0,
			totalSec: 0
		};
	}
	function getWeekData() {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date(Date.now() - i * 864e5);
			const key = d.toISOString().slice(0, 10);
			days.push({
				label: d.toLocaleDateString("en", { weekday: "short" }),
				key,
				sec: dailyStats[key]?.totalSec || 0
			});
		}
		const max = Math.max(1, ...days.map((d) => d.sec));
		return days.map((d) => ({
			...d,
			pct: d.sec / max * 100
		}));
	}
	function getTopVideos(limit = 10) {
		return Object.entries(detailedStats).map(([id, d]) => ({
			videoId: id,
			...d
		})).sort((a, b) => b.totalSec - a.totalSec).slice(0, limit);
	}
	function getStreak() {
		const days = Object.keys(dailyStats).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().reverse();
		let streak = 0;
		for (let i = 0; i < days.length; i++) {
			const expected = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
			if (days[i] === expected) streak++;
			else break;
		}
		if (streak === 0 && days.length > 0) {
			const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
			if (days[0] === yesterday) streak = 1;
		}
		return streak;
	}
	function getLongestVideo() {
		return getTopVideos(1)[0] || null;
	}
	function getAvgWatchTime() {
		const entries = Object.values(detailedStats);
		if (!entries.length) return 0;
		return entries.reduce((s, e) => s + e.totalSec, 0) / entries.length;
	}
	function formatTime(seconds, { compact = false, smart = true } = {}) {
		if (isNaN(seconds) || seconds < 0) return compact ? "0s" : "0s";
		const s = Math.floor(seconds);
		const h = Math.floor(s / 3600);
		const m = Math.floor(s % 3600 / 60);
		const sec = s % 60;
		if (compact || smart) {
			const parts = [];
			if (h > 0) parts.push(`${h}h`);
			if (m > 0) parts.push(`${m}m`);
			if (sec > 0 || parts.length === 0) parts.push(`${sec}s`);
			return parts.join(" ");
		}
		return `${h}h ${m}m ${sec}s`;
	}
	function exportStats() {
		const text = [
			`Total: ${formatTime(usageTime)}`,
			`${isMusic ? "Listen" : "Video"}: ${formatTime(videoTime)}${isMusic ? "" : " | Shorts: " + formatTime(shortsTime)}`,
			`${isMusic ? "Tracks" : "Videos"} watched: ${videosWatched}`,
			"",
			isMusic ? "Top Tracks:" : "Top Videos:",
			...getTopVideos(10).map((v, i) => `  #${i + 1} ${v.title || v.videoId} (${v.channel || "?"}) - ${formatTime(v.totalSec, { compact: true })}`)
		].join("\n");
		try {
			navigator.clipboard.writeText(text);
		} catch {
			prompt("Copy stats:", text);
		}
	}
	var _prevHash = "";
	function updateUI() {
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
			longest?.videoId ?? "",
			longest?.title ?? "",
			longest?.totalSec ?? "",
			...week.map((d) => `${d.sec}:${d.pct}`),
			...getTopVideos(10).map((v) => `${v.videoId}:${v.title}:${v.channel}:${v.totalSec}`),
			isMusic
		].join("|");
		if (_hash === _prevHash) return;
		_prevHash = _hash;
		const eachById = (id, fn) => {
			if (!domCache[id]) domCache[id] = Array.from(document.querySelectorAll(`[id="${id}"]`));
			domCache[id].forEach(fn);
		};
		const set = (id, val) => {
			eachById(id, (el) => {
				if (el.textContent !== val) el.textContent = val;
			});
		};
		set("total-time", formatTime(usageTime));
		set("video-time", formatTime(videoTime));
		set("video-label", isMusic ? "Listen Time" : "Video Watch Time");
		set("shorts-time", formatTime(shortsTime));
		if (isMusic) {
			set("shorts-label", "");
			const shortsCard = document.querySelector("#shorts-time")?.closest(".stat-card");
			if (shortsCard) shortsCard.style.display = "none";
		}
		set("session-time", formatTime(sessionTime));
		set("today-time", formatTime(today.totalSec));
		set("videos-count", String(videosWatched));
		set("avg-time", formatTime(avg, { compact: true }));
		set("longest-title", longest ? escapeHtml(longest.title || longest.videoId) : "-");
		set("longest-time", longest ? formatTime(longest.totalSec) : "-");
		set("most-label", isMusic ? "Most Played" : "Most Watched");
		set("streak-count", String(streak));
		set("streak-label", streak > 0 ? streak === 1 ? "Today" : `${streak} Day Streak` : "No Streak");
		const maxTime = 86400;
		const bar = (id, v) => {
			eachById(id, (el) => {
				const _w = `${Math.min(100, v / maxTime * 100)}%`;
				if (el.style.width !== _w) el.style.width = _w;
			});
		};
		bar("usage-bar", usageTime);
		bar("video-bar", videoTime);
		bar("shorts-bar", shortsTime);
		bar("session-bar", sessionTime);
		bar("today-bar", today.totalSec);
		const chart = domCache._weeklyChart || (domCache._weeklyChart = $id("weekly-chart"));
		if (chart) {
			const todayKey = new Date().toISOString().slice(0, 10);
			setHTML(chart, week.map((d) => {
				const h = d.sec > 0 ? formatTime(d.sec) : "";
				const isToday = d.key === todayKey;
				return `<div class="week-bar-wrapper${isToday ? " is-today" : ""}"><div class="week-label">${isToday ? "Today" : d.label}</div><div class="week-bar-track"><div class="week-bar-fill" style="height:${d.pct}%"></div></div><div class="week-bar-val">${h}</div></div>`;
			}).join(""));
		}
		const topList = domCache._topVideosList || (domCache._topVideosList = $id("top-videos-list"));
		if (topList) {
			const top = getTopVideos(10);
			setHTML(topList, top.length === 0 ? "<div class=\"stat-empty\">Watch some videos first</div>" : top.map((v, i) => `<a class="top-video-row" href="/watch?v=${encodeURIComponent(v.videoId)}" target="_blank">
          <span class="top-video-rank">#${i + 1}</span>
          <span class="top-video-title" title="${escapeHtml(v.title || v.videoId)}">${escapeHtml(v.title || v.videoId)}</span>
          <span class="top-video-chan">${escapeHtml(v.channel || "")}</span>
          <span class="top-video-time">${formatTime(v.totalSec)}</span>
        </a>`).join(""));
		}
	}
	function resetStats() {
		usageTime = videoTime = shortsTime = sessionTime = 0;
		videosWatched = 0;
		detailedStats = {};
		dailyStats = {};
		lastUpdate = Date.now();
		gmRawSet(STORAGE.USAGE, 0);
		gmRawSet(STORAGE.VIDEO, 0);
		gmRawSet(STORAGE.SHORTS, 0);
		gmRawSet(STORAGE.DETAIL, "{}");
		gmRawSet(STORAGE.DAILY, "{}");
		gmRawSet(STORAGE.SESSION, Date.now());
		updateUI();
	}
	function initTimeStats() {
		loadStats();
		lastUpdate = Date.now();
		gmRawSet(STORAGE.SESSION, Date.now());
		if (!__ytToolsRuntime.modularStatsIntervalId) {
			__ytToolsRuntime.modularStatsIntervalId = true;
			__ytToolsRuntime.statsIntervalId = "modular";
			let __lastSave = 0;
			let __lastVid = null;
			let __title = "";
			let __channel = "";
			let __cachedVideo = null;
			let __lastVideoCheck = 0;
			__ytToolsRuntime.modularStatsIntervalId = setInterval(() => {
				const now = Date.now();
				const delta = (now - lastUpdate) / 1e3;
				lastUpdate = now;
				if (document.visibilityState !== "visible") return;
				if (delta <= 0 || delta > 10 || delta > 3600) return;
				usageTime += delta;
				sessionTime += delta;
				if (!__cachedVideo || now - __lastVideoCheck > 5e3) {
					__cachedVideo = document.querySelector("video.video-stream") || document.querySelector("video");
					__lastVideoCheck = now;
				}
				const vid = __cachedVideo;
				if (vid && !vid.paused && !vid.ended && vid.readyState > 1) {
					if (location.pathname.startsWith("/shorts")) shortsTime += delta;
					else videoTime += delta;
					const videoId = getCurrentVideoId$1();
					if (videoId) {
						if (videoId !== __lastVid) {
							__lastVid = videoId;
							try {
								__title = document.querySelector("h1 yt-formatted-string")?.textContent?.trim() || document.title.replace(/\s*-\s*YouTube\s*$/i, "").trim() || "";
								__channel = document.querySelector("#owner ytd-channel-name a, ytd-channel-name a")?.textContent?.trim() || document.querySelector("ytd-video-owner-renderer a.yt-simple-endpoint")?.textContent?.trim() || "";
							} catch {
								__title = "";
								__channel = "";
							}
						}
						trackVideoWatch(videoId, __title, __channel, delta);
					}
				}
				if (now - __lastSave >= 3e4) {
					__lastSave = now;
					saveStats();
				}
				updateUI();
			}, 1e3);
			window.addEventListener("pagehide", saveStats, { capture: true });
		}
		document.querySelectorAll("[id=\"resetStats\"]").forEach((resetBtn) => {
			if (resetBtn.dataset.ytToolsTimeStatsBound) return;
			resetBtn.dataset.ytToolsTimeStatsBound = "1";
			resetBtn.addEventListener("click", resetStats);
		});
		document.querySelectorAll("[id=\"exportStats\"]").forEach((exportBtn) => {
			if (exportBtn.dataset.ytExportBound) return;
			exportBtn.dataset.ytExportBound = "1";
			exportBtn.addEventListener("click", exportStats);
		});
		updateUI();
	}
	var SETTINGS_KEY = isYTMusic$1 ? STORAGE_KEYS.SETTINGS_YTM : STORAGE_KEYS.SETTINGS_YT;
	var DEFAULT_SETTINGS = {
		themes: false,
		theme: "0",
		themeCustom: false,
		bgColorPicker: "#1a1a1a",
		primaryColorPicker: "#ffffff",
		secondaryColorPicker: "#9e9e9e",
		headerColorPicker: "#252525",
		iconsColorPicker: "#ff0000",
		menuColorPicker: "#1a1a1a",
		lineColorPicker: "#ff0000",
		timeColorPicker: "#ffffff",
		progressbarColorPicker: "#ff0000",
		backgroundImage: "",
		ambientMode: false,
		cinematicLighting: false,
		ambientMode_continuouslyMonitor: false,
		nonstopPlayback: false,
		nonstopPlaybackMode: "1",
		audioOnly: false,
		audioOnlyMode: "0",
		audioOnlyTab: "0",
		playerSize: "100",
		selectVideoQuality: "0",
		videoQuality: "hd2160",
		hideComments: false,
		hideNavbar: false,
		hideSidebar: false,
		reverseMode: false,
		disableAutoplay: false,
		disableSubtitles: false,
		continueWatching: false,
		bookmarks: true,
		likeDislike: true,
		likeDislikeBar: true,
		dislikes: false,
		translateComments: true,
		waveVisualizer: true,
		waveVisualizerSelected: "dinamica",
		shortsChannelName: true,
		lockupStats: true,
		languagesComments: "vi",
		translateTarget: "en",
		shortsViews: true,
		shortsRating: true,
		shortsClassic: true,
		download: true,
		copyDescription: true,
		menuFontSize: "14"
	};
	function loadSettings() {
		try {
			const saved = gmRawGet(SETTINGS_KEY, "{}");
			const settings = {
				...DEFAULT_SETTINGS,
				...JSON.parse(saved)
			};
			__ytToolsRuntime.settingsLoaded = true;
			return settings;
		} catch {
			__ytToolsRuntime.settingsLoaded = true;
			return { ...DEFAULT_SETTINGS };
		}
	}
	function saveSettings(settings) {
		try {
			gmRawSet(SETTINGS_KEY, JSON.stringify(settings));
		} catch (e) {
			console.warn("[YT Tools] Failed to save settings:", e);
		}
	}
	function parseCountText(text) {
		if (!text) return null;
		const s0 = String(text).trim().toLowerCase();
		if (!s0) return null;
		let mult = 1;
		let s = s0.replace(/\s+/g, "");
		const hl = new URLSearchParams(location.search).get("hl") || "";
		if (s.includes("mil")) {
			mult = 1e3;
			s = s.replace("mil", "");
		} else if (s.includes("nghìn") || s.includes("nghin") || s.includes("ngàn") || s.includes("ngan")) {
			mult = 1e3;
			s = s.replace(/nghìn|nghin|ngàn|ngan/g, "");
		} else if (/[\d.,]n$/i.test(s)) {
			mult = 1e3;
			s = s.replace(/n$/i, "");
		} else if (s.includes("triệu") || s.includes("trieu")) {
			mult = 1e6;
			s = s.replace(/triệu|trieu/g, "");
		} else if (/[\d.,]tr$/i.test(s)) {
			mult = 1e6;
			s = s.replace(/tr$/i, "");
		} else if (s.includes("k")) {
			mult = 1e3;
			s = s.replace("k", "");
		} else if (s.includes("m")) {
			mult = 1e6;
			s = s.replace("m", "");
		}
		s = s.replace(/[^\d.,]/g, "");
		if (!s) return null;
		const isDotThousandsLocale = [
			"de",
			"es",
			"pt",
			"id",
			"tr",
			"nl",
			"it",
			"pl",
			"cs",
			"da",
			"fi",
			"nb",
			"sv",
			"el",
			"hu",
			"ro",
			"sk",
			"sl",
			"hr",
			"bg",
			"uk",
			"ru",
			"ar",
			"vi"
		].some((l) => hl.startsWith(l));
		const lastDot = s.lastIndexOf(".");
		const lastComma = s.lastIndexOf(",");
		let nStr = s;
		if (lastDot !== -1 && lastComma !== -1) {
			const dec = Math.max(lastDot, lastComma);
			nStr = `${s.slice(0, dec).replace(/[.,]/g, "")}.${s.slice(dec + 1)}`;
		} else if (lastComma !== -1) {
			const afterComma = s.slice(lastComma + 1);
			if (isDotThousandsLocale) nStr = s.replace(",", ".");
			else if (afterComma.length === 3 && s.indexOf(",") === lastComma) nStr = s.replace(",", "");
			else nStr = s.replace(",", ".");
		} else if (lastDot !== -1) {
			const afterDot = s.slice(lastDot + 1);
			if ((s.match(/\./g) || []).length > 1) nStr = s.replace(/\./g, "");
			else if (isDotThousandsLocale && afterDot.length === 3) nStr = s.replace(".", "");
			else if (afterDot.length === 3 && mult > 1) nStr = s.replace(".", "");
		}
		const num = Number.parseFloat(nStr);
		if (!Number.isFinite(num)) return null;
		return Math.round(num * mult);
	}
	function getLikesFromDom() {
		const likeBtn = $e("#top-level-buttons-computed like-button-view-model button-view-model button") || $e("like-button-view-model button") || $e("button[aria-label*=\"like\" i]") || $e("ytd-menu-renderer like-button-view-model button");
		if (!likeBtn) return null;
		const btnText = likeBtn.textContent;
		if (btnText) {
			const parsed = parseCountText(btnText);
			if (parsed != null) return parsed;
		}
		const m = (likeBtn.getAttribute("aria-label") || "").match(/([\d.,]+)/);
		if (m) {
			const parsed = parseCountText(m[1]);
			if (parsed != null) return parsed;
		}
		return null;
	}
	function ensureBarExists() {
		let bar = $e("#yt-like-dislike-bar-mdcm");
		if (bar && !document.contains(bar)) {
			console.log("[YT Tools] Bar detached, re-attaching...");
			bar.remove();
			bar = null;
		}
		if (bar) return bar;
		bar = document.createElement("div");
		bar.id = "yt-like-dislike-bar-mdcm";
		bar.style.cssText = `
    display: flex;
    height: 8px;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin: 12px 0;
    position: relative;
    z-index: 1000;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  `;
		setHTML(bar, `
    <div class="like" style="width: 50%; height: 100%; background: #3ea6ff; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
    <div class="dislike" style="width: 50%; height: 100%; background: #ff4e45; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
  `);
		const targets = [
			$e("ytd-watch-metadata #above-the-fold"),
			$e("ytd-watch-metadata #actions"),
			$id("button_copy_description"),
			$e("#top-level-buttons-computed")
		];
		for (const target of targets) if (target) {
			console.log("[YT Tools] Appending bar to:", target.id || target.tagName);
			if (target.id === "above-the-fold") target.insertAdjacentElement("afterbegin", bar);
			else target.appendChild(bar);
			return bar;
		}
		return null;
	}
	function updateLikeDislikeBar(likes, dislikes) {
		const l = Number(likes);
		const d = Number(dislikes);
		if (!Number.isFinite(l) || !Number.isFinite(d)) return;
		const bar = ensureBarExists();
		if (!bar) return;
		const total = l + d;
		const likePercent = total > 0 ? Math.max(0, Math.min(100, l / total * 100)) : 50;
		bar.style.display = "flex";
		const likePart = bar.querySelector(".like");
		const dislikePart = bar.querySelector(".dislike");
		if (likePart) likePart.style.width = `${likePercent}%`;
		if (dislikePart) dislikePart.style.width = `${100 - likePercent}%`;
		bar.title = `Likes: ${l.toLocaleString()} | Dislikes: ${d.toLocaleString()}`;
	}
	async function ensureDislikesForCurrentVideo() {
		const videoId = getCurrentVideoId$1();
		if (!videoId) return null;
		const now = Date.now();
		if (__ytToolsRuntime.dislikesCache.videoId === videoId && __ytToolsRuntime.dislikesCache.dislikes != null && now - __ytToolsRuntime.dislikesCache.ts < 600 * 1e3) return __ytToolsRuntime.dislikesCache.dislikes;
		const persisted = getLikesDislikesFromPersistedCache(videoId);
		if (persisted && persisted.dislikes != null) {
			__ytToolsRuntime.dislikesCache = {
				videoId,
				dislikes: persisted.dislikes,
				likes: persisted.likes ?? null,
				viewCount: persisted.viewCount ?? null,
				rating: persisted.rating ?? null,
				ts: now
			};
			return persisted.dislikes;
		}
		try {
			const data = await (await fetch(`${apiDislikes}${videoId}`)).json();
			const dislikes = Number(data?.dislikes);
			const viewCount = Number(data?.viewCount);
			const rating = Number(data?.rating);
			if (Number.isFinite(dislikes)) {
				const likes = getLikesFromDom();
				__ytToolsRuntime.dislikesCache = {
					videoId,
					dislikes,
					likes: likes ?? null,
					viewCount: Number.isFinite(viewCount) ? viewCount : null,
					rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
					ts: now
				};
				setLikesDislikesToPersistedCache(videoId, {
					likes: likes != null ? likes : void 0,
					dislikes,
					viewCount: Number.isFinite(viewCount) ? viewCount : void 0,
					rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : void 0
				});
				return dislikes;
			}
		} catch (e) {
			console.warn("[YT Tools] Dislike fetch error:", e);
		}
		return null;
	}
	function scheduleLikeBarUpdate(settings, attempts = 15) {
		if (!settings?.likeDislikeBar) return;
		let i = 0;
		const tryUpdate = async () => {
			if (i >= attempts) return;
			i++;
			const likes = getLikesFromDom();
			const dislikes = await ensureDislikesForCurrentVideo();
			console.log(`[YT Tools] Try update bar #${i}: likes=${likes}, dislikes=${dislikes}`);
			if (likes != null && dislikes != null) {
				updateLikeDislikeBar(likes, dislikes);
				return;
			}
			setTimeout(tryUpdate, 1e3);
		};
		setTimeout(tryUpdate, 500);
	}
	async function videoDislike() {
		if (!getCurrentVideoId$1() || !window.location.href.includes("youtube.com/watch")) return;
		if (isYTMusic$1) return;
		const data = await ensureDislikesForCurrentVideo();
		if (!data) return;
		const dislikes = typeof data === "object" ? data.dislikes : data;
		const dislikes_btn = $e("#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > dislike-button-view-model > toggle-button-view-model > button-view-model > button") || $e("dislike-button-view-model button");
		if (dislikes_btn != null) {
			const settings = loadSettings();
			let textContent = dislikes_btn.querySelector(".yt-tools-dislike-count");
			if (!textContent) {
				textContent = document.createElement("div");
				textContent.className = "ytSpecButtonShapeNextButtonTextContent yt-tools-dislike-count";
				const iconDiv = dislikes_btn.querySelector(".ytSpecButtonShapeNextIcon");
				if (iconDiv) {
					iconDiv.insertAdjacentElement("afterend", textContent);
					dislikes_btn.classList.add("ytSpecButtonShapeNextIconLeading");
					dislikes_btn.classList.remove("ytSpecButtonShapeNextIconButton");
				} else dislikes_btn.appendChild(textContent);
			}
			if (settings.dislikes) {
				textContent.textContent = FormatterNumber(dislikes, 0);
				textContent.style.display = "block";
				textContent.style.marginLeft = "6px";
			} else textContent.style.display = "none";
			const likes_btn = $e("#top-level-buttons-computed like-button-view-model button-view-model button") || $e("like-button-view-model button") || $e("segmented-like-dislike-button-view-model like-button-view-model button");
			dislikes_btn.dataset.initialState = dislikes_btn.getAttribute("aria-pressed") === "true";
			dislikes_btn.dataset.originalCount = dislikes;
			if (likes_btn) {
				likes_btn.dataset.initialState = likes_btn.getAttribute("aria-pressed") === "true";
				likes_btn.dataset.originalCount = typeof data === "object" ? data.likes || getLikesFromDom() : getLikesFromDom();
			}
			const updateCount = () => {
				const currentVideoId = getCurrentVideoId$1();
				const currentSettings = loadSettings();
				const isDislikePressed = dislikes_btn.getAttribute("aria-pressed") === "true";
				const wasDislikePressed = dislikes_btn.dataset.initialState === "true";
				const originalDislikes = Number(dislikes_btn.dataset.originalCount);
				let dislikeOffset = 0;
				if (!wasDislikePressed && isDislikePressed) dislikeOffset = 1;
				else if (wasDislikePressed && !isDislikePressed) dislikeOffset = -1;
				const newDislikes = Math.max(0, originalDislikes + dislikeOffset);
				let newLikes = (typeof data === "object" ? data.likes : null) || getLikesFromDom() || 0;
				if (likes_btn) {
					const isLikePressed = likes_btn.getAttribute("aria-pressed") === "true";
					const wasLikePressed = likes_btn.dataset.initialState === "true";
					const originalLikes = Number(likes_btn.dataset.originalCount);
					let likeOffset = 0;
					if (!wasLikePressed && isLikePressed) likeOffset = 1;
					else if (wasLikePressed && !isLikePressed) likeOffset = -1;
					newLikes = Math.max(0, originalLikes + likeOffset);
				}
				if (__ytToolsRuntime.dislikesCache.videoId === currentVideoId) {
					__ytToolsRuntime.dislikesCache.dislikes = newDislikes;
					__ytToolsRuntime.dislikesCache.likes = newLikes;
					setLikesDislikesToPersistedCache(currentVideoId, {
						likes: newLikes,
						dislikes: newDislikes,
						viewCount: __ytToolsRuntime.dislikesCache.viewCount,
						rating: __ytToolsRuntime.dislikesCache.rating
					});
				}
				if (currentSettings.dislikes && textContent) textContent.textContent = FormatterNumber(newDislikes, 0);
				if (currentSettings.likeDislikeBar) updateLikeDislikeBar(newLikes, newDislikes);
			};
			if (!dislikes_btn.dataset.listenerAttached) {
				dislikes_btn.addEventListener("click", () => setTimeout(updateCount, 100));
				if (likes_btn) likes_btn.addEventListener("click", () => setTimeout(updateCount, 100));
				dislikes_btn.dataset.listenerAttached = "true";
			}
			if (settings.likeDislikeBar) updateLikeDislikeBar(likes_btn ? Number(likes_btn.dataset.originalCount) : 0, Number(dislikes_btn.dataset.originalCount));
		}
	}
	async function shortDislike() {
		const validoVentanaShort = $m("#button-bar > reel-action-bar-view-model > dislike-button-view-model > toggle-button-view-model > button-view-model > label > div > span");
		if (validoVentanaShort.length > 0 && document.location.href.includes("/shorts/")) {
			const videoId = getCurrentVideoId$1();
			if (!videoId) return;
			const data = await ensureDislikesForCurrentVideo();
			const dislikes = typeof data === "object" ? data.dislikes : data;
			if (dislikes != null) for (let i = 0; i < validoVentanaShort.length; i++) validoVentanaShort[i].textContent = `${FormatterNumber(dislikes, 0)}`;
			const persisted = getLikesDislikesFromPersistedCache(videoId);
			if (persisted) {
				if (persisted.viewCount != null) __ytToolsRuntime.updateShortsViewsButton(videoId, persisted.viewCount);
				if (persisted.rating != null) __ytToolsRuntime.updateShortsRatingButton(videoId, persisted.rating);
			}
		}
	}
	__ytToolsRuntime.triggerShortsDislike = shortDislike;
	function applyLikeDislikeBarIfEnabled(settings) {
		console.log("[YT Tools] applyLikeDislikeBarIfEnabled called, settings:", settings?.likeDislikeBar);
		const enabled = !!settings?.likeDislikeBar;
		const bar = $e("#yt-like-dislike-bar-mdcm");
		if (bar) bar.style.display = enabled ? "flex" : "none";
		if (enabled) scheduleLikeBarUpdate(settings, 6);
	}
	function applyDislikeDisplayIfEnabled(settings) {
		if (!settings?.dislikes) return;
		if (isYTMusic$1) return;
		setTimeout(async () => {
			await videoDislike();
			await shortDislike();
		}, 1500);
	}
	if (typeof window !== "undefined") {
		let _navHandlerActive = false;
		window.addEventListener("yt-navigate-finish", () => {
			if (isYTMusic$1) return;
			try {
				const settings = loadSettings();
				if (!(settings?.likeDislikeBar || settings?.dislikes)) {
					if (_navHandlerActive) _navHandlerActive = false;
					return;
				}
				if (!_navHandlerActive) _navHandlerActive = true;
				if (settings.likeDislikeBar) scheduleLikeBarUpdate(settings, 4);
				if (settings.dislikes) setTimeout(async () => {
					await videoDislike();
					await shortDislike();
				}, 1500);
			} catch (e) {
				console.warn("[YT Tools] Like/dislike nav handler error:", e);
			}
		});
	}
	function getBookmarksForVideo(videoId) {
		const all = readJsonGM(STORAGE_KEYS.BOOKMARKS, {});
		return {
			all,
			list: Array.isArray(all[videoId]) ? all[videoId] : []
		};
	}
	function saveBookmark(videoId, seconds, label) {
		const { all, list } = getBookmarksForVideo(videoId);
		const t = Math.max(0, Math.floor(Number(seconds) || 0));
		const exists = list.some((b) => b && b.t === t);
		const item = {
			t,
			label: (label || formatTimeShort(t)).trim(),
			createdAt: Date.now()
		};
		const nextList = exists ? list.map((b) => b.t === t ? item : b) : [...list, item];
		nextList.sort((a, b) => a.t - b.t);
		all[videoId] = nextList;
		writeJsonGM(STORAGE_KEYS.BOOKMARKS, all);
	}
	function deleteBookmark(videoId, seconds) {
		const { all, list } = getBookmarksForVideo(videoId);
		const t = Math.max(0, Math.floor(Number(seconds) || 0));
		all[videoId] = list.filter((b) => b && b.t !== t);
		writeJsonGM(STORAGE_KEYS.BOOKMARKS, all);
	}
	function renderBookmarksPanel(videoId) {
		const panel = $id("yt-bookmarks-panel");
		if (!panel) return;
		const { list } = getBookmarksForVideo(videoId);
		if (!list.length) {
			setHTML(panel, `<div class="yt-bm-empty">No bookmarks yet. Click ★ to save one.</div>`);
			return;
		}
		setHTML(panel, list.map((b) => {
			const time = formatTimeShort(b.t);
			const safeLabel = escapeHtml(b.label || time);
			return `
        <div class="yt-bm-item">
          <button type="button" class="yt-bm-go" data-action="go" data-t="${b.t}" title="Go to ${time}">${time}</button>
          <div class="yt-bm-label" title="${safeLabel}">${safeLabel}</div>
          <button type="button" class="yt-bm-del" data-action="del" data-t="${b.t}" title="Delete">✕</button>
        </div>
      `;
		}).join(""));
	}
	function applyBookmarksIfEnabled(settings) {
		const addBtn = $id("yt-bookmark-add");
		const toggleBtn = $id("yt-bookmark-toggle");
		const panel = $id("yt-bookmarks-panel");
		if (!addBtn || !toggleBtn || !panel) return;
		const enabled = !!settings?.bookmarks;
		addBtn.style.display = enabled ? "inline-flex" : "none";
		toggleBtn.style.display = enabled ? "inline-flex" : "none";
		panel.style.display = enabled && __ytToolsRuntime.bookmarksPanelOpen ? "block" : "none";
		if (!enabled) return;
		const videoId = getCurrentVideoId$1();
		if (!videoId) return;
		renderBookmarksPanel(videoId);
		if (__ytToolsRuntime.bookmarkClickHandlerInitialized) return;
		__ytToolsRuntime.bookmarkClickHandlerInitialized = true;
		document.addEventListener("click", (e) => {
			const target = e.target;
			if (!(target instanceof Element)) return;
			const add = target.closest("#yt-bookmark-add");
			const tog = target.closest("#yt-bookmark-toggle");
			const actionBtn = target.closest("[data-action][data-t]");
			if (add) {
				e.preventDefault();
				e.stopPropagation();
				const v = $e("video");
				const vid = getCurrentVideoId$1();
				if (!v || !vid) return;
				const t = Math.floor(v.currentTime || 0);
				const defaultLabel = formatTimeShort(t);
				saveBookmark(vid, t, prompt("Bookmark name (optional):", defaultLabel) || defaultLabel);
				__ytToolsRuntime.bookmarksPanelOpen = true;
				panel.style.display = "block";
				renderBookmarksPanel(vid);
				Notify("success", `Bookmark saved at ${defaultLabel}`);
				return;
			}
			if (tog) {
				e.preventDefault();
				e.stopPropagation();
				__ytToolsRuntime.bookmarksPanelOpen = !__ytToolsRuntime.bookmarksPanelOpen;
				panel.style.display = __ytToolsRuntime.bookmarksPanelOpen ? "block" : "none";
				const vid = getCurrentVideoId$1();
				if (vid && __ytToolsRuntime.bookmarksPanelOpen) renderBookmarksPanel(vid);
				return;
			}
			if (actionBtn) {
				e.preventDefault();
				e.stopPropagation();
				const action = actionBtn.getAttribute("data-action");
				const t = Number(actionBtn.getAttribute("data-t"));
				const v = $e("video");
				const vid = getCurrentVideoId$1();
				if (!v || !vid) return;
				if (action === "go") {
					v.currentTime = Math.max(0, t || 0);
					v.play?.().catch(() => {});
				} else if (action === "del") {
					deleteBookmark(vid, t);
					renderBookmarksPanel(vid);
				}
			}
		});
	}
	function debounce(func, wait = 300) {
		let timeoutId = null;
		let lastArgs = null;
		let lastThis = null;
		return function(...args) {
			lastArgs = args;
			lastThis = this;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				func.apply(lastThis, lastArgs);
			}, wait);
		};
	}
	var CleanupManager = class {
		constructor() {
			this.observers = new Set();
			this.intervals = new Set();
			this.timeouts = new Set();
			this.eventListeners = [];
			this.audioContexts = new Set();
			this.callbacks = new Set();
		}
		trackObserver(observer) {
			if (!observer) return null;
			this.observers.add(observer);
			return observer;
		}
		untrackObserver(observer) {
			if (observer) {
				try {
					observer.disconnect();
				} catch (e) {
					console.warn("[CleanupManager] Observer disconnect error:", e);
				}
				this.observers.delete(observer);
			}
		}
		trackInterval(intervalId) {
			if (!intervalId) return null;
			this.intervals.add(intervalId);
			return intervalId;
		}
		untrackInterval(intervalId) {
			if (intervalId) {
				clearInterval(intervalId);
				this.intervals.delete(intervalId);
			}
		}
		trackTimeout(timeoutId) {
			if (!timeoutId) return null;
			this.timeouts.add(timeoutId);
			return timeoutId;
		}
		untrackTimeout(timeoutId) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				this.timeouts.delete(timeoutId);
			}
		}
		trackEventListener(target, type, listener, options) {
			if (!target || !type || !listener) return null;
			this.eventListeners.push({
				target,
				type,
				listener,
				options
			});
			target.addEventListener(type, listener, options);
			return {
				target,
				type,
				listener,
				options
			};
		}
		untrackEventListener(target, type, listener, options) {
			if (!target || !type || !listener) return;
			try {
				target.removeEventListener(type, listener, options);
			} catch (e) {
				console.warn("[CleanupManager] Event listener removal error:", e);
			}
			this.eventListeners = this.eventListeners.filter((el) => !(el.target === target && el.type === type && el.listener === listener));
		}
		trackAudioContext(audioCtx) {
			if (!audioCtx) return null;
			this.audioContexts.add(audioCtx);
			return audioCtx;
		}
		untrackAudioContext(audioCtx) {
			if (audioCtx && audioCtx.state !== "closed") {
				try {
					audioCtx.close();
				} catch (e) {
					console.warn("[CleanupManager] AudioContext close error:", e);
				}
				this.audioContexts.delete(audioCtx);
			}
		}
		registerCleanup(callback) {
			if (typeof callback !== "function") return null;
			this.callbacks.add(callback);
			return callback;
		}
		unregisterCleanup(callback) {
			this.callbacks.delete(callback);
		}
		cleanupAll() {
			console.log("[CleanupManager] Cleaning up all resources...");
			this.observers.forEach((observer) => {
				try {
					observer.disconnect();
				} catch (e) {
					console.warn("[CleanupManager] Observer cleanup error:", e);
				}
			});
			this.observers.clear();
			this.intervals.forEach((intervalId) => {
				clearInterval(intervalId);
			});
			this.intervals.clear();
			this.timeouts.forEach((timeoutId) => {
				clearTimeout(timeoutId);
			});
			this.timeouts.clear();
			this.eventListeners.forEach(({ target, type, listener, options }) => {
				try {
					target.removeEventListener(type, listener, options);
				} catch (e) {
					console.warn("[CleanupManager] Event listener cleanup error:", e);
				}
			});
			this.eventListeners = [];
			this.audioContexts.forEach((audioCtx) => {
				if (audioCtx.state !== "closed") try {
					audioCtx.close();
				} catch (e) {
					console.warn("[CleanupManager] AudioContext cleanup error:", e);
				}
			});
			this.audioContexts.clear();
			this.callbacks.forEach((callback) => {
				try {
					callback();
				} catch (e) {
					console.warn("[CleanupManager] Custom cleanup callback error:", e);
				}
			});
			this.callbacks.clear();
			console.log("[CleanupManager] Cleanup complete");
		}
	};
	var globalCleanupManager = new CleanupManager();
	if (typeof window !== "undefined") {
		window.addEventListener("beforeunload", () => {
			globalCleanupManager.cleanupAll();
		});
		window.addEventListener("pagehide", () => {
			globalCleanupManager.cleanupAll();
		});
		window.addEventListener("yt-navigate-finish", () => {
			globalCleanupManager.observers.forEach((observer) => {
				try {
					observer.disconnect();
				} catch {}
			});
			globalCleanupManager.observers.clear();
			globalCleanupManager.intervals.forEach((intervalId) => {
				clearInterval(intervalId);
			});
			globalCleanupManager.intervals.clear();
			globalCleanupManager.timeouts.forEach((timeoutId) => {
				clearTimeout(timeoutId);
			});
			globalCleanupManager.timeouts.clear();
		});
	}
	function trackObserver(observer) {
		return globalCleanupManager.trackObserver(observer);
	}
	function untrackObserver(observer) {
		globalCleanupManager.untrackObserver(observer);
	}
	function trackInterval(intervalId) {
		return globalCleanupManager.trackInterval(intervalId);
	}
	function untrackInterval(intervalId) {
		globalCleanupManager.untrackInterval(intervalId);
	}
	function trackTimeout(timeoutId) {
		return globalCleanupManager.trackTimeout(timeoutId);
	}
	function untrackTimeout(timeoutId) {
		globalCleanupManager.untrackTimeout(timeoutId);
	}
	function trackEventListener(target, type, listener, options) {
		return globalCleanupManager.trackEventListener(target, type, listener, options);
	}
	function untrackEventListener(target, type, listener, options) {
		globalCleanupManager.untrackEventListener(target, type, listener, options);
	}
	function getVideoIdFromLockup(lockup) {
		const a = lockup.querySelector("a[href*=\"watch?v=\"]");
		if (a) {
			const m = (a.getAttribute("href") || "").match(/[?&]v=([^&]+)/);
			if (m) return m[1];
		}
		const el = lockup.querySelector("[class*=\"content-id-\"]");
		if (el) {
			const m = el.className.match(/content-id-([A-Za-z0-9_-]+)/);
			if (m) return m[1];
		}
		return null;
	}
	var svgIconCache = new Map();
	function createSvgIconFromString(svgString, sizePx) {
		const cacheKey = `${svgString}:${sizePx}`;
		if (svgIconCache.has(cacheKey)) return svgIconCache.get(cacheKey).cloneNode(true);
		const div = document.createElement("div");
		setHTML(div, svgString.trim());
		const svg = div.firstElementChild;
		if (!svg) return null;
		svg.setAttribute("width", String(sizePx || 14));
		svg.setAttribute("height", String(sizePx || 14));
		svg.style.display = "inline-block";
		svg.style.verticalAlign = "middle";
		svg.style.marginRight = "2px";
		svgIconCache.set(cacheKey, svg.cloneNode(true));
		return svg;
	}
	var LOCKUP_RATING_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"icon icon-tabler icons-tabler-outline icon-tabler-star\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245\" /></svg>";
	var LOCKUP_LIKE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"icon icon-tabler icons-tabler-outline icon-tabler-thumb-up\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3\" /></svg>";
	var LOCKUP_DISLIKE_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"icon icon-tabler icons-tabler-outline icon-tabler-thumb-down\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3\" /></svg>";
	function injectLockupCachedStats() {
		if (!window.location.href.includes("youtube.com")) return;
		document.querySelectorAll("yt-lockup-view-model").forEach((lockup) => {
			if (lockup.hasAttribute("data-yt-tools-lockup-stats")) return;
			const videoId = getVideoIdFromLockup(lockup);
			if (!videoId) return;
			const cached = getLikesDislikesFromPersistedCache(videoId);
			if (!cached) return;
			const hasRating = cached.rating != null;
			const hasLikes = cached.likes != null;
			const hasDislikes = cached.dislikes != null;
			if (!hasRating && !hasLikes && !hasDislikes) return;
			const meta = lockup.querySelector("yt-content-metadata-view-model");
			if (!meta) return;
			const row = document.createElement("div");
			row.className = "yt-content-metadata-view-model__metadata-row";
			row.setAttribute("data-yt-tools-lockup-stats-row", "1");
			const wrap = document.createElement("span");
			wrap.className = "yt-core-attributed-string yt-content-metadata-view-model__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color";
			wrap.setAttribute("dir", "auto");
			wrap.setAttribute("role", "text");
			const sep = () => document.createTextNode(" · ");
			if (hasRating) {
				const ratingIcon = createSvgIconFromString(LOCKUP_RATING_SVG, 14);
				if (ratingIcon) wrap.appendChild(ratingIcon);
				wrap.appendChild(document.createTextNode(" " + cached.rating.toFixed(1)));
				if (hasLikes || hasDislikes) wrap.appendChild(sep());
			}
			if (hasLikes) {
				const likeIcon = createSvgIconFromString(LOCKUP_LIKE_SVG, 14);
				if (likeIcon) wrap.appendChild(likeIcon);
				wrap.appendChild(document.createTextNode(" " + FormatterNumber(cached.likes, 0)));
				if (hasDislikes) wrap.appendChild(sep());
			}
			if (hasDislikes) {
				const dislikeIcon = createSvgIconFromString(LOCKUP_DISLIKE_SVG, 14);
				if (dislikeIcon) wrap.appendChild(dislikeIcon);
				wrap.appendChild(document.createTextNode(" " + FormatterNumber(cached.dislikes, 0)));
			}
			row.appendChild(wrap);
			meta.appendChild(row);
			lockup.setAttribute("data-yt-tools-lockup-stats", videoId);
		});
	}
	function getVideoIdFromShortsLockup(item) {
		if (item.dataset.ytToolsShortsVideoId) return item.dataset.ytToolsShortsVideoId;
		const a = item.querySelector("a[href^=\"/shorts/\"]");
		if (!a) return null;
		const m = (a.getAttribute("href") || "").match(/\/shorts\/([^/?]+)/);
		return m ? m[1] : null;
	}
	function injectShortsLockupCachedStats() {
		if (!window.location.href.includes("youtube.com")) return;
		document.querySelectorAll("ytm-shorts-lockup-view-model").forEach((item) => {
			if (item.hasAttribute("data-yt-tools-shorts-stats")) return;
			const videoId = getVideoIdFromShortsLockup(item);
			if (!videoId) return;
			const cached = getLikesDislikesFromPersistedCache(videoId);
			if (!cached) return;
			const hasLikes = cached.likes != null;
			const hasDislikes = cached.dislikes != null;
			if (!hasLikes && !hasDislikes) return;
			const subhead = item.querySelector(".ShortsLockupViewModelHostOutsideMetadataSubhead, .shortsLockupViewModelHostOutsideMetadataSubhead, .ShortsLockupViewModelHostMetadataSubhead, .shortsLockupViewModelHostMetadataSubhead");
			if (!subhead || !subhead.parentElement) return;
			const wrap = document.createElement("span");
			wrap.className = "yt-core-attributed-string yt-content-metadata-view-model__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color yt-tools-shorts-stats-row";
			wrap.setAttribute("dir", "auto");
			wrap.setAttribute("role", "text");
			wrap.setAttribute("style", "color: #aaa !important;");
			const sep = () => document.createTextNode(" · ");
			if (hasLikes) {
				const likeIcon = createSvgIconFromString(LOCKUP_LIKE_SVG, 12);
				if (likeIcon) {
					likeIcon.style.setProperty("color", "#aaa", "important");
					wrap.appendChild(likeIcon);
				}
				wrap.appendChild(document.createTextNode(" " + FormatterNumber(cached.likes, 0)));
				if (hasDislikes) wrap.appendChild(sep());
			}
			if (hasDislikes) {
				const dislikeIcon = createSvgIconFromString(LOCKUP_DISLIKE_SVG, 12);
				if (dislikeIcon) {
					dislikeIcon.style.setProperty("color", "#aaa", "important");
					wrap.appendChild(dislikeIcon);
				}
				wrap.appendChild(document.createTextNode(" " + FormatterNumber(cached.dislikes, 0)));
			}
			const row = document.createElement("div");
			row.className = "yt-tools-shorts-stats-wrap";
			row.setAttribute("style", "color: #aaa !important;");
			row.appendChild(wrap);
			subhead.parentElement.appendChild(row);
			item.setAttribute("data-yt-tools-shorts-stats", videoId);
		});
	}
	function hasUnprocessedLockups() {
		const normal = document.querySelectorAll("yt-lockup-view-model:not([data-yt-tools-lockup-stats])").length > 0;
		const shorts = document.querySelectorAll("ytm-shorts-lockup-view-model:not([data-yt-tools-shorts-stats])").length > 0;
		return normal || shorts;
	}
	function createLockupStatsObserver(target) {
		const debouncedInject = debounce(() => {
			if (!window.location.href.includes("youtube.com")) return;
			injectLockupCachedStats();
			injectShortsLockupCachedStats();
		}, 280);
		const catchUpInject = debounce(() => {
			if (!window.location.href.includes("youtube.com")) return;
			if (!hasUnprocessedLockups()) return;
			injectLockupCachedStats();
			injectShortsLockupCachedStats();
		}, 1200);
		const obs = trackObserver(new MutationObserver(() => {
			debouncedInject();
			catchUpInject();
		}));
		obs.observe(target, {
			childList: true,
			subtree: true
		});
		return obs;
	}
	function setupLockupCachedStats(enabled) {
		if (!enabled) {
			if (__ytToolsRuntime.lockupCachedStatsObserver) {
				untrackObserver(__ytToolsRuntime.lockupCachedStatsObserver);
				__ytToolsRuntime.lockupCachedStatsObserver = null;
			}
			if (__ytToolsRuntime.lockupCachedStatsIntervalId) {
				clearInterval(__ytToolsRuntime.lockupCachedStatsIntervalId);
				__ytToolsRuntime.lockupCachedStatsIntervalId = null;
			}
			document.querySelectorAll("[data-yt-tools-lockup-stats-row]").forEach((el) => el.remove());
			document.querySelectorAll("[data-yt-tools-lockup-stats]").forEach((el) => {
				el.removeAttribute("data-yt-tools-lockup-stats");
			});
			document.querySelectorAll(".yt-tools-shorts-stats-wrap").forEach((el) => el.remove());
			document.querySelectorAll("[data-yt-tools-shorts-stats]").forEach((el) => {
				el.removeAttribute("data-yt-tools-shorts-stats");
			});
			return;
		}
		if (!window.location.href.includes("youtube.com")) return;
		injectLockupCachedStats();
		injectShortsLockupCachedStats();
		const secondary = document.getElementById("secondary") || document.querySelector("ytd-watch-next-secondary-results-renderer");
		const observeTarget = secondary && secondary.parentNode ? secondary : document.body;
		if (__ytToolsRuntime.lockupCachedStatsObserver) {
			if (observeTarget !== __ytToolsRuntime.lockupCachedStatsObserveTarget) {
				untrackObserver(__ytToolsRuntime.lockupCachedStatsObserver);
				__ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(observeTarget);
				__ytToolsRuntime.lockupCachedStatsObserveTarget = observeTarget;
			}
			return;
		}
		__ytToolsRuntime.lockupCachedStatsObserver = createLockupStatsObserver(observeTarget);
		__ytToolsRuntime.lockupCachedStatsObserveTarget = observeTarget;
	}
	var FetchQueue = class {
		constructor(maxConcurrent = 3) {
			this.max = maxConcurrent;
			this.running = 0;
			this.queue = [];
		}
		async enqueue(fn) {
			while (this.running >= this.max) await new Promise((r) => this.queue.push(r));
			this.running++;
			try {
				return await fn();
			} finally {
				this.running--;
				const next = this.queue.shift();
				if (next) next();
			}
		}
	};
	function setupShortsChannelNameFeature(enabled) {
		__ytToolsRuntime.shortsChannelName.enabled = !!enabled;
		document.documentElement.dataset.mdcmShortsChannelName = enabled ? "1" : "0";
		if (!enabled) {
			try {
				if (__ytToolsRuntime.shortsChannelName.observer) untrackObserver(__ytToolsRuntime.shortsChannelName.observer);
			} catch {}
			try {
				if (__ytToolsRuntime.shortsChannelName.io) untrackObserver(__ytToolsRuntime.shortsChannelName.io);
			} catch {}
			__ytToolsRuntime.shortsChannelName.observer = null;
			__ytToolsRuntime.shortsChannelName.io = null;
			clearTimeout(__ytToolsRuntime.shortsChannelName.scanT);
			__ytToolsRuntime.shortsChannelName.scanT = null;
			return;
		}
		const rt = __ytToolsRuntime.shortsChannelName;
		const getShortsVideoIdFromItem = (item) => {
			return (item.querySelector("a[href^=\"/shorts/\"]")?.getAttribute("href") || "").match(/\/shorts\/([^/?]+)/)?.[1] || null;
		};
		const findSubhead = (item) => {
			return item.querySelector(".ShortsLockupViewModelHostOutsideMetadataSubhead, .shortsLockupViewModelHostOutsideMetadataSubhead, .ShortsLockupViewModelHostMetadataSubhead, .shortsLockupViewModelHostMetadataSubhead");
		};
		const ensureLabel = (subhead) => {
			const parent = subhead?.parentElement;
			if (!parent) return null;
			let el = parent.querySelector(".yt-tools-shorts-channel-name");
			if (!el) {
				el = document.createElement("div");
				el.className = "yt-tools-shorts-channel-name";
				el.style.fontSize = "12px";
				el.style.color = "#aaa";
				el.style.marginTop = "2px";
				el.textContent = "";
				parent.insertBefore(el, subhead);
			}
			return el;
		};
		const tryExtractChannelNameFromDom = (item) => {
			const a = item.querySelector("a[href^=\"/@\"], a[href^=\"/channel/\"]");
			return (a?.textContent || a?.getAttribute("title") || "").trim() || null;
		};
		const MAX_CONCURRENT_FETCHES = 3;
		if (!rt.fetchQueue) rt.fetchQueue = new FetchQueue(MAX_CONCURRENT_FETCHES);
		const fetchChannelNameFromWatch = (videoId) => {
			return rt.fetchQueue.enqueue(async () => {
				if (rt.cache.has(videoId)) return rt.cache.get(videoId);
				let res = null;
				try {
					res = await fetch(`/watch?v=${videoId}`, {
						method: "GET",
						credentials: "same-origin",
						cache: "force-cache"
					});
				} catch {
					return "";
				}
				if (!res?.ok) return "";
				const html = await res.text();
				const idx = html.indexOf("itemprop=\"author\"");
				if (idx < 0) return "";
				const start = html.lastIndexOf("<span", idx);
				const end = html.indexOf("</span>", idx);
				if (start < 0 || end < 0) return "";
				const chunk = html.slice(start, end + 7);
				return (new DOMParser().parseFromString(chunk, "text/html").querySelector("link[itemprop=\"name\"]")?.getAttribute("content") || "").trim();
			});
		};
		const getChannelName = (videoId, item) => {
			const cached = rt.cache.get(videoId);
			if (cached) return Promise.resolve(cached);
			const persisted = getShortsChannelFromPersistedCache(videoId);
			if (persisted) {
				rt.cache.set(videoId, persisted);
				return Promise.resolve(persisted);
			}
			const domName = tryExtractChannelNameFromDom(item);
			if (domName) {
				rt.cache.set(videoId, domName);
				setShortsChannelToPersistedCache(videoId, domName);
				return Promise.resolve(domName);
			}
			const inflight = rt.inflight.get(videoId);
			if (inflight) return inflight;
			const p = fetchChannelNameFromWatch(videoId).then((name) => {
				const finalName = (name || "").trim();
				if (finalName) {
					rt.cache.set(videoId, finalName);
					setShortsChannelToPersistedCache(videoId, finalName);
				}
				return finalName;
			}).finally(() => rt.inflight.delete(videoId));
			rt.inflight.set(videoId, p);
			return p;
		};
		const processItem = (item) => {
			if (!(item instanceof Element)) return;
			if (item.dataset.ytToolsShortsChannelProcessed === "1") return;
			const subhead = findSubhead(item);
			if (!subhead) return;
			const videoId = getShortsVideoIdFromItem(item);
			if (!videoId) return;
			item.dataset.ytToolsShortsChannelProcessed = "1";
			item.dataset.ytToolsShortsVideoId = videoId;
			const label = ensureLabel(subhead);
			if (!label) return;
			label.textContent = "";
			if (rt.io) rt.io.observe(item);
		};
		if (!rt.io) rt.io = trackObserver(new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const item = entry.target;
				const videoId = item?.dataset?.ytToolsShortsVideoId;
				const label = findSubhead(item)?.parentElement?.querySelector(".yt-tools-shorts-channel-name");
				if (!videoId || !label) {
					rt.io.unobserve(item);
					continue;
				}
				getChannelName(videoId, item).then((name) => {
					if (name) label.textContent = name;
				}).finally(() => rt.io.unobserve(item));
			}
		}, { threshold: .15 }));
		const scan = () => {
			clearTimeout(rt.scanT);
			rt.scanT = setTimeout(() => {
				document.querySelectorAll("ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2").forEach(processItem);
			}, 120);
		};
		if (!rt.observer) {
			rt.observer = trackObserver(new MutationObserver(scan));
			const observeTarget = document.querySelector("#page-manager") || document.body;
			rt.observer.observe(observeTarget, {
				childList: true,
				subtree: true
			});
		}
		scan();
	}
	var languagesTranslate$1 = {
		vi: "Vietnamese",
		en: "English",
		es: "Spanish",
		fr: "French",
		ja: "Japanese",
		ko: "Korean",
		"zh-CN": "Chinese (Simplified)"
	};
	var translatorEventBound = false;
	var translatorClickHandler = null;
	function traductor() {
		const texts = document.querySelectorAll("#content-text:not([data-translated])");
		if (texts.length === 0) return;
		const languages = languagesTranslate$1;
		const idiomaDestino = $id("select-languages-comments-select")?.value || "en";
		const optionsHTML = Object.entries(languages).map(([code, name]) => `<option value="${code}" ${code === idiomaDestino ? "selected" : ""}>${name}</option>`).join("");
		texts.forEach((texto) => {
			texto.setAttribute("data-translated", "true");
			const controlsHTML = `
      <div class="traductor-container">
        <button class="buttons-tranlate" data-action="translate-comment"> Translate <i class="fa-solid fa-language"></i></button>
        <select class="select-traductor">
        ${optionsHTML}
        </select>
      </div>
    `;
			texto.insertAdjacentHTML("afterend", safeHTML(controlsHTML));
		});
		if (!translatorEventBound) {
			translatorEventBound = true;
			translatorClickHandler = (e) => {
				const btn = e.target.closest(".buttons-tranlate[data-action=\"translate-comment\"]");
				if (!btn) return;
				const container = btn.closest(".traductor-container");
				if (!container) return;
				const selectLang = container.querySelector(".select-traductor");
				const textNode = container.previousElementSibling;
				if (!textNode || !selectLang) return;
				const urlLista = `?client=dict-chrome-ex&sl=auto&tl=${selectLang.value}&q=` + encodeURIComponent(textNode.textContent);
				setHTML(btn, "Translating... <i class=\"fa-solid fa-spinner fa-spin\"></i>");
				if (typeof GM_xmlhttpRequest !== "undefined") GM_xmlhttpRequest({
					method: "GET",
					url: apiGoogleTranslate + urlLista,
					onload: (res) => {
						try {
							textNode.textContent = JSON.parse(res.responseText)[0][0];
							btn.textContent = "Translated";
						} catch {
							btn.textContent = "Error";
						}
					},
					onerror: () => {
						btn.textContent = "Error";
					}
				});
				else fetch(apiGoogleTranslate + urlLista).then((response) => response.json()).then((datos) => {
					textNode.textContent = datos[0][0];
					btn.textContent = "Translated";
				}).catch((err) => {
					console.error("Error en la traducción:", err);
					btn.textContent = "Error";
				});
			};
			trackEventListener(document, "click", translatorClickHandler);
		}
	}
	function limpiarHTML(selector) {
		$m(selector).forEach((button) => button.remove());
	}
	function cleanupTranslateComments() {
		if (translatorClickHandler) {
			untrackEventListener(document, "click", translatorClickHandler);
			translatorClickHandler = null;
		}
		translatorEventBound = false;
		limpiarHTML(".traductor-container");
		document.querySelectorAll("#content-text[data-translated]").forEach((el) => {
			el.removeAttribute("data-translated");
		});
		if (_commentIO$1) {
			try {
				untrackObserver(_commentIO$1);
			} catch {}
			_commentIO$1 = null;
		}
		if (_commentMO$1) {
			try {
				untrackObserver(_commentMO$1);
			} catch {}
			_commentMO$1 = null;
		}
	}
	var _commentIO$1 = null;
	var _commentMO$1 = null;
	function initSmartCommentObserver() {
		const commentsContainer = document.querySelector("#comments");
		if (!commentsContainer) return;
		if (_commentIO$1) {
			try {
				untrackObserver(_commentIO$1);
			} catch {}
			_commentIO$1 = null;
		}
		if (_commentMO$1) {
			try {
				untrackObserver(_commentMO$1);
			} catch {}
			_commentMO$1 = null;
		}
		_commentIO$1 = trackObserver(new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				_commentMO$1 = trackObserver(new MutationObserver((mutations) => {
					let shouldUpdate = false;
					for (const m of mutations) if (m.addedNodes.length > 0) {
						shouldUpdate = true;
						break;
					}
					if (shouldUpdate) window.requestAnimationFrame(() => {
						traductor();
					});
				}));
				const commentContents = document.querySelector("ytd-comments #contents");
				if (commentContents) _commentMO$1.observe(commentContents, {
					childList: true,
					subtree: true
				});
				untrackObserver(_commentIO$1);
			}
		}));
		_commentIO$1.observe(commentsContainer);
	}
	function initTranslateComments(settings) {
		if (!settings?.translateComments) {
			cleanupTranslateComments();
			return;
		}
		cleanupTranslateComments();
		if (!window.location.hostname.includes("music.youtube.com")) setTimeout(initSmartCommentObserver, 1500);
		traductor();
	}
	var DEFAULT_SIZE = 100;
	function getVideoEl() {
		return $e("video") || $e("#movie_player video");
	}
	function applyPlayerSize(size) {
		const video = getVideoEl();
		if (!video) return;
		const pct = Math.max(50, Math.min(150, Number(size) || DEFAULT_SIZE));
		video.style.transform = `scale(${pct / 100})`;
		video.style.transformOrigin = "center center";
	}
	function initPlayerSize(settings) {
		if (settings?.playerSize) applyPlayerSize(settings.playerSize);
		if (!__ytToolsRuntime.playerSizeNavBound) {
			__ytToolsRuntime.playerSizeNavBound = true;
			window.addEventListener("yt-navigate-finish", () => {
				try {
					const s = readJsonGM(STORAGE_KEYS.SETTINGS_YT, {});
					if (s?.playerSize) applyPlayerSize(s.playerSize);
				} catch {}
			});
		}
	}
	function hideComments(enabled) {
		const comments = document.querySelector("#comments");
		if (comments) comments.style.display = enabled ? "none" : "block";
	}
	function hideSidebar(enabled) {
		const secondary = document.querySelector("#secondary #secondary-inner") || document.querySelector("#secondary");
		if (secondary) secondary.style.display = enabled ? "none" : "";
	}
	function hideNavbar(enabled) {
		const masthead = document.querySelector("ytd-masthead") || document.querySelector("#masthead") || document.querySelector("#masthead-container") || document.querySelector("header") || document.querySelector("ytd-app");
		if (masthead) if (enabled) masthead.style.display = "none";
		else masthead.style.display = "";
		const ytmHeader = document.querySelector("ytm-top-bar") || document.querySelector(".header.ytmusic-app") || document.querySelector("ytmusic-top-bar");
		if (ytmHeader) if (enabled) ytmHeader.style.display = "none";
		else ytmHeader.style.display = "";
	}
	var REVERSE_ID = "yt-tools-reverse-style";
	var REVERSE_CSS = "#columns.style-scope.ytd-watch-flexy { flex-direction: row-reverse !important; padding-left: 20px !important; }";
	function getOrCreateStyle() {
		let el = document.getElementById(REVERSE_ID);
		if (!el) {
			el = document.createElement("style");
			el.id = REVERSE_ID;
			document.head.appendChild(el);
		}
		return el;
	}
	function reverseMode(enabled) {
		const el = getOrCreateStyle();
		el.textContent = enabled ? REVERSE_CSS : "";
	}
	function disableSubtitles(enabled) {
		if (!enabled) return;
		const btn = document.querySelector(".ytp-subtitles-button[aria-pressed=\"true\"]");
		if (btn) btn.click();
	}
	function applyNonstopPlayback(enabled) {
		const rt = __ytToolsRuntime.nonstopPlayback;
		if (enabled && rt.enabled) return;
		if (!enabled && !rt.enabled) return;
		if (enabled) {
			rt.enabled = true;
			rt.hiddenDescriptor = Object.getOwnPropertyDescriptor(document, "hidden") || null;
			rt.visibilityStateDescriptor = Object.getOwnPropertyDescriptor(document, "visibilityState") || null;
			try {
				Object.defineProperties(document, {
					hidden: {
						configurable: true,
						get: () => false
					},
					visibilityState: {
						configurable: true,
						get: () => "visible"
					}
				});
			} catch (e) {
				console.warn("[YT Tools] Could not override visibility state:", e);
			}
			rt.blockVisibilityEvent = (event) => {
				event.stopImmediatePropagation();
			};
			document.addEventListener("visibilitychange", rt.blockVisibilityEvent, true);
			window.addEventListener("visibilitychange", rt.blockVisibilityEvent, true);
			const refreshActivity = () => {
				try {
					const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
					if ("_lact" in pageWindow) pageWindow._lact = Date.now();
				} catch {}
			};
			refreshActivity();
			rt.keepAliveTimer = trackInterval(setInterval(refreshActivity, 6e4));
			return;
		}
		rt.enabled = false;
		if (rt.blockVisibilityEvent) {
			document.removeEventListener("visibilitychange", rt.blockVisibilityEvent, true);
			window.removeEventListener("visibilitychange", rt.blockVisibilityEvent, true);
			rt.blockVisibilityEvent = null;
		}
		if (rt.keepAliveTimer) {
			untrackInterval(rt.keepAliveTimer);
			rt.keepAliveTimer = null;
		}
		try {
			if (rt.hiddenDescriptor) Object.defineProperty(document, "hidden", rt.hiddenDescriptor);
			else delete document.hidden;
			if (rt.visibilityStateDescriptor) Object.defineProperty(document, "visibilityState", rt.visibilityStateDescriptor);
			else delete document.visibilityState;
		} catch {}
		rt.hiddenDescriptor = null;
		rt.visibilityStateDescriptor = null;
	}
	var AUDIO_ONLY_TAB_OVERRIDE_KEY = "ytToolsAudioOnlyTabOverrideMDCM";
	function getAudioOnlyTabOverride() {
		const value = window.sessionStorage.getItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
		if (value === "true") return true;
		if (value === "false") return false;
		return null;
	}
	function setAudioOnlyTabOverride(enabled, defaultEnabled) {
		if (!!enabled === !!defaultEnabled) {
			window.sessionStorage.removeItem(AUDIO_ONLY_TAB_OVERRIDE_KEY);
			return;
		}
		window.sessionStorage.setItem(AUDIO_ONLY_TAB_OVERRIDE_KEY, enabled ? "true" : "false");
	}
	function getEffectiveAudioOnly(settings) {
		const override = getAudioOnlyTabOverride();
		return override === null ? !!settings?.audioOnly : override;
	}
	function getActiveAudioOnlyVideo() {
		const videos = Array.from(document.querySelectorAll("video"));
		if (isYTMusic$1) return videos[0] || null;
		return videos.find((video) => {
			const rect = video.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0;
		}) || videos[0] || null;
	}
	async function getAudioOnlyThumbnailUrl() {
		try {
			const moviePlayer = document.getElementById("movie_player");
			if (moviePlayer && typeof moviePlayer.getVideoData === "function") {
				const data = moviePlayer.getVideoData();
				if (data?.video_id) return `https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg`;
			}
		} catch {}
		const videoId = new URLSearchParams(window.location.search).get("v");
		if (!videoId) return "";
		return `https://${isYTMusic$1 ? "i1.ytimg.com" : "img.youtube.com"}/vi/${videoId}/hqdefault.jpg`;
	}
	function setAudioOnlyBackground(url) {
		let style = $id("yt-tools-audio-only-style");
		if (!style) {
			style = document.createElement("style");
			style.id = "yt-tools-audio-only-style";
			document.documentElement.appendChild(style);
		}
		style.textContent = url ? `.yt-tools-audio-only-player{background-image:url("${url}")!important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important;}` : "";
	}
	async function applyAudioOnlyMode(enabled) {
		const rt = __ytToolsRuntime.audioOnly;
		rt.enabled = !!enabled;
		document.body.classList.toggle("yt-tools-audio-only-active", rt.enabled);
		if (rt.refreshTimer) {
			untrackInterval(rt.refreshTimer);
			rt.refreshTimer = null;
		}
		if (!rt.enabled) {
			rt.lastArtUrl = "";
			rt.lastVideoEl = null;
			rt.lastPlayerEl = null;
			setAudioOnlyBackground("");
			document.querySelectorAll(".yt-tools-audio-only-video").forEach((el) => el.classList.remove("yt-tools-audio-only-video"));
			document.querySelectorAll(".yt-tools-audio-only-player").forEach((el) => el.classList.remove("yt-tools-audio-only-player"));
			return;
		}
		const video = getActiveAudioOnlyVideo();
		const player = video?.parentNode?.parentNode || video?.parentElement || null;
		if (video !== rt.lastVideoEl || player !== rt.lastPlayerEl) {
			document.querySelectorAll(".yt-tools-audio-only-video").forEach((el) => el.classList.remove("yt-tools-audio-only-video"));
			document.querySelectorAll(".yt-tools-audio-only-player").forEach((el) => el.classList.remove("yt-tools-audio-only-player"));
			if (video) video.classList.add("yt-tools-audio-only-video");
			if (player) player.classList.add("yt-tools-audio-only-player");
			rt.lastVideoEl = video;
			rt.lastPlayerEl = player;
		}
		const artUrl = await getAudioOnlyThumbnailUrl();
		if (artUrl && artUrl !== rt.lastArtUrl) {
			rt.lastArtUrl = artUrl;
			setAudioOnlyBackground(artUrl);
		}
		rt.refreshTimer = trackInterval(setInterval(() => {
			if (document.visibilityState !== "visible") return;
			applyAudioOnlyMode(getEffectiveAudioOnly(readJsonGM(SETTINGS_KEY, {})));
		}, 3e3));
	}
	var isYTMusic = location.hostname === "music.youtube.com";
	function isWatchPage$1() {
		return window.location.href.includes("youtube.com/watch");
	}
	function isCinematicActive() {
		const cinematicDiv = document.getElementById("cinematics");
		if (!cinematicDiv) return false;
		const hasContent = cinematicDiv.innerHTML.trim() !== "";
		const hasCanvas = cinematicDiv.querySelector("canvas") !== null;
		const hasChildren = cinematicDiv.children.length > 0;
		const hasCinematicElements = cinematicDiv.querySelector("div[style*=\"position: fixed\"]") !== null;
		return hasContent || hasCanvas || hasChildren || hasCinematicElements;
	}
	function toggleCinematicLighting() {
		const settingsButton = $e(".ytp-button.ytp-settings-button");
		if (!settingsButton) {
			console.log("[YT Tools] Settings button not found");
			return;
		}
		settingsButton.click();
		const cinematicKeywords = [
			"cinematic",
			"lighting",
			"cinema",
			"ambient",
			"chế độ điện ảnh",
			"điện ảnh",
			"atmosph",
			"ambiante",
			"cinéma",
			"アンビエント",
			"시네마틱",
			"ánh sáng điện ảnh"
		];
		const findAndClickCinematic = () => {
			const menuItems = $m(".ytp-menuitem");
			if (!menuItems || menuItems.length === 0) return false;
			for (const item of menuItems) if (item.querySelector(".ytp-menuitem-toggle-checkbox")) {
				console.log("[YT Tools] Found cinematic/ambient toggle item (by checkbox)");
				item.click();
				return true;
			}
			for (const item of menuItems) {
				const text = (item.textContent || "").toLowerCase();
				for (const kw of cinematicKeywords) if (text.includes(kw)) {
					console.log("[YT Tools] Found cinematic option by keyword:", kw);
					item.click();
					return true;
				}
			}
			for (const item of menuItems) {
				const icon = item.querySelector(".ytp-menuitem-icon svg path");
				if (icon) {
					const d = icon.getAttribute("d") || "";
					if (d.includes("M21 7v10H3V7") || d.includes("M12 2C6.48 2 2 6.48 2 12") || d.includes("M12 .5C11.73 .5 11.48 .60 11.29 .79")) {
						console.log("[YT Tools] Found cinematic option by SVG path");
						item.click();
						return true;
					}
				}
			}
			return false;
		};
		const closeMenu = () => {
			if ($e(".ytp-settings-menu")) document.body.click();
		};
		let attempts = 0;
		const maxAttempts = 20;
		const pollInterval = trackInterval(setInterval(() => {
			attempts++;
			if (findAndClickCinematic()) {
				untrackInterval(pollInterval);
				trackTimeout(setTimeout(closeMenu, 150));
				return;
			}
			if (attempts >= maxAttempts) {
				untrackInterval(pollInterval);
				console.warn("[YT Tools] Could not find cinematic/ambient toggle after", maxAttempts, "attempts");
				closeMenu();
			}
		}, 200));
	}
	function applyCinematicLighting(settings) {
		if (!isWatchPage$1() || isYTMusic) return;
		const isCurrentlyActive = isCinematicActive();
		const desiredActive = !!settings.cinematicLighting;
		if (desiredActive !== isCurrentlyActive) {
			console.log(`[YT Tools] Syncing Cinematic Lighting: Current=${isCurrentlyActive}, Desired=${desiredActive}`);
			toggleCinematicLighting();
		}
		const cinematica = $e("#cinematics > div");
		if (cinematica != void 0) cinematica.style.cssText = "position: fixed; inset: 0px; pointer-events: none; transform: scale(1.5, 2)";
	}
	function downloadThumbnail() {
		const cinematica = $e("#cinematics > div");
		const videoFull = $e("#movie_player");
		if (cinematica != void 0 || videoFull != void 0) {
			const enlace = new URLSearchParams(window.location.search).get("v");
			const imageUrl = `https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`;
			fetch(imageUrl).then((response) => {
				if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
				return response.blob();
			}).then((blob) => {
				if (blob.size / 1024 >= 20) {
					window.open(`https://i.ytimg.com/vi/${enlace}/maxresdefault.jpg`, "popUpWindow", "height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes");
					const imageUrlObject = URL.createObjectURL(blob);
					const enlaceDescarga = document.createElement("a");
					enlaceDescarga.href = imageUrlObject;
					enlaceDescarga.download = `${isYTMusic ? $e("ytmusic-player-bar .title")?.textContent?.trim() || "YouTube Music" : $e("h1.style-scope.ytd-watch-metadata")?.innerText || "video"}_maxresdefault.jpg`;
					enlaceDescarga.click();
					URL.revokeObjectURL(imageUrlObject);
				} else console.log("La imagen no excede los 20 KB. No se descargará.");
			}).catch((error) => {
				alert("No found image");
				console.error("Error al obtener la imagen:", error);
			});
		}
	}
	function setupThumbnailDownloadButton() {
		let btnImagen = $e("#yt-thumbnail-download-btn");
		if (!btnImagen) {
			btnImagen = document.createElement("button");
			btnImagen.id = "yt-thumbnail-download-btn";
			setHTML(btnImagen, "<i class=\"fas fa-image\"></i>");
			btnImagen.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 6px;
      border-radius: 50%;
      cursor: pointer;
      margin: 4px;
      font-size: 14px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    `;
			btnImagen.onmouseover = () => {
				btnImagen.style.background = "rgba(255, 255, 255, 0.2)";
			};
			btnImagen.onmouseout = () => {
				btnImagen.style.background = "rgba(255, 255, 255, 0.1)";
			};
			const actionsContainer = $e("#actions.ytd-watch-metadata") || $e("#menu-container") || $e(".ytp-right-controls");
			if (actionsContainer) actionsContainer.appendChild(btnImagen);
		}
		if (btnImagen != void 0) btnImagen.onclick = downloadThumbnail;
	}
	function setupAvatarDownload(enabled) {
		if (!enabled) {
			document.querySelectorAll(".yt-image-avatar-download").forEach((el) => el.remove());
			return;
		}
		$m("#author-thumbnail-button #img.style-scope.yt-img-shadow").forEach((img) => {
			if (img.parentElement.querySelector(".yt-image-avatar-download")) return;
			const button = $cl("button");
			setHTML(button, "<i class=\"fa fa-download\"></i>");
			button.classList.add("yt-image-avatar-download");
			button.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s;
    `;
			img.parentElement.style.position = "relative";
			img.parentElement.appendChild(button);
			img.parentElement.addEventListener("mouseenter", () => {
				button.style.opacity = "1";
			});
			img.parentElement.addEventListener("mouseleave", () => {
				button.style.opacity = "0";
			});
			button.onclick = async function(e) {
				e.preventDefault();
				e.stopPropagation();
				try {
					const imageUrl = img.src.split("=")[0];
					const blob = await (await fetch(imageUrl)).blob();
					const blobUrl = URL.createObjectURL(blob);
					const nameElement = img.closest("ytd-comment-thread-renderer, ytd-comment-renderer")?.querySelector("#author-text");
					let authorName = nameElement ? nameElement.textContent.trim() : "avatar";
					authorName = authorName.replace(/[/\\:*?"<>|]/g, "");
					const link = $cl("a");
					link.href = blobUrl;
					link.download = `${authorName}_avatar.jpg`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					setTimeout(() => URL.revokeObjectURL(blobUrl), 1e3);
				} catch (error) {
					console.error("[YT Tools] Error downloading avatar:", error);
				}
			};
		});
	}
	var state = {
		currentVideo: null,
		waveStyle: "dinamica",
		audioCtx: null,
		analyser: null,
		source: null,
		animationId: null,
		canvas: null,
		ctx: null,
		controlPanel: null,
		bufferLength: 0,
		dataArray: null,
		smoothedData: [],
		isSetup: false
	};
	var getState = () => state;
	var setWaveStyle = (v) => {
		state.waveStyle = v;
	};
	var setCurrentVideo = (v) => {
		state.currentVideo = v;
	};
	var setAudioCtx = (v) => {
		state.audioCtx = v;
	};
	var setAnalyser = (v) => {
		state.analyser = v;
	};
	var setSource = (v) => {
		state.source = v;
	};
	var setAnimationId = (v) => {
		state.animationId = v;
	};
	var setCanvas = (v) => {
		state.canvas = v;
	};
	var setCtx = (v) => {
		state.ctx = v;
	};
	var setBufferLength = (v) => {
		state.bufferLength = v;
	};
	var setDataArray = (v) => {
		state.dataArray = v;
	};
	var setSmoothedData = (v) => {
		state.smoothedData = v;
	};
	var setIsSetup = (v) => {
		state.isSetup = v;
	};
	var PW = pageWindow;
	var PD = pageDocument;
	var s = getState();
	var cachedWaveAccent = "#06b6d4";
	function getThemeCSS(varName, fallback = "") {
		try {
			return PW().getComputedStyle(PD().documentElement).getPropertyValue(varName).trim() || fallback;
		} catch {
			return fallback;
		}
	}
	function refreshWaveThemeColor() {
		cachedWaveAccent = getThemeCSS("--yt-tools-wave-color", "#06b6d4");
	}
	function waveThemeColors() {
		return {
			accent: cachedWaveAccent,
			glow: cachedWaveAccent + "66",
			soft: cachedWaveAccent + "22"
		};
	}
	var WAVE_FAIL_RETRY_MS = 4e3;
	var WAVE_MIN_HEIGHT = 84;
	var WAVE_SENSITIVITY = 2.15;
	var videoObserver = null;
	var observerDebounce = null;
	var frequencyData = null;
	var waveSettingsSnapshot = null;
	var waveUnlockHandlers = [];
	var waveRetryTimer = null;
	function ensureWaveMutationObserver() {
		if (!waveSettingsSnapshot?.waveVisualizer || videoObserver) return;
		videoObserver = trackObserver(new MutationObserver(() => {
			clearTimeout(observerDebounce);
			observerDebounce = setTimeout(() => checkForVideo(), 200);
		}));
		const target = PD().querySelector("#movie_player") || PD().querySelector("ytmusic-player-bar") || PD().querySelector("#player-bar") || PD().body;
		videoObserver.observe(target, {
			childList: true,
			subtree: true
		});
	}
	function checkForVideo() {
		if (!waveSettingsSnapshot?.waveVisualizer) {
			cleanupWaveVisualizer(true);
			return;
		}
		const href = PW().location.href;
		const video = PD().querySelector("video");
		const miniPlayer = PD().querySelector(".ytp-miniplayer-ui");
		const urlMatchesPlayer = href.includes("/watch") || href.includes("/shorts/") || href.includes("youtu.be/") || /youtube\.com\/live\//.test(href);
		if (!(video && (urlMatchesPlayer || isYTMusic$1) || !!miniPlayer) || !video) {
			cleanupWaveVisualizer(false);
			ensureWaveMutationObserver();
			return;
		}
		if (video !== s.currentVideo || !s.isSetup) {
			cleanupWaveVisualizer(false);
			setupWaveForVideo(video);
			if (!s.isSetup) waveRetryTimer = trackTimeout(setTimeout(() => {
				waveRetryTimer = null;
				checkForVideo();
			}, WAVE_FAIL_RETRY_MS));
		} else if (!video.paused) showCanvas();
		ensureWaveMutationObserver();
	}
	var waveUnloadHandlers = null;
	function bindWaveVisualizerUnload() {
		if (waveUnloadHandlers) return;
		const onUnload = () => cleanupWaveVisualizer(true);
		const onNav = () => cleanupWaveVisualizer(false);
		const onVisibilityChange = () => {
			if (PD().visibilityState === "visible" && s.currentVideo && !s.currentVideo.paused) showCanvas();
			else hideCanvas();
		};
		PW().addEventListener("beforeunload", onUnload);
		PW().addEventListener("pagehide", onUnload);
		PW().addEventListener("yt-navigate-finish", onNav);
		PD().addEventListener("visibilitychange", onVisibilityChange);
		waveUnloadHandlers = {
			onUnload,
			onNav,
			onVisibilityChange
		};
	}
	function unbindWaveVisualizerUnload() {
		if (!waveUnloadHandlers) return;
		const { onUnload, onNav, onVisibilityChange } = waveUnloadHandlers;
		PW().removeEventListener("beforeunload", onUnload);
		PW().removeEventListener("pagehide", onUnload);
		PW().removeEventListener("yt-navigate-finish", onNav);
		PD().removeEventListener("visibilitychange", onVisibilityChange);
		waveUnloadHandlers = null;
	}
	function createWaveSource(audioCtx, video) {
		try {
			return audioCtx.createMediaElementSource(video);
		} catch {
			if (video.captureStream) try {
				return audioCtx.createMediaStreamSource(video.captureStream());
			} catch {}
			console.warn("[WaveViz] Cannot create audio source — video already connected and captureStream unavailable.");
			return null;
		}
	}
	function updateCanvasSize() {
		if (s.canvas) {
			const dpr = Math.min(PW().devicePixelRatio || 1, 2);
			const width = Math.max(1, Math.floor(PW().innerWidth));
			const height = Math.max(WAVE_MIN_HEIGHT, Math.min(240 * .46, Math.floor(PW().innerHeight * .13)));
			s.canvas.style.bottom = "0";
			s.canvas.style.width = `${width}px`;
			s.canvas.style.height = `${height}px`;
			s.canvas.width = Math.floor(width * dpr);
			s.canvas.height = Math.floor(height * dpr);
		}
	}
	function resetAudioState() {
		teardownSource();
		setCurrentVideo(null);
	}
	function cleanupWaveVisualizer(isUnload = false) {
		resetAudioState();
		if (waveRetryTimer) {
			untrackTimeout(waveRetryTimer);
			waveRetryTimer = null;
		}
		if (isUnload) {
			if (s.audioCtx && s.audioCtx.state !== "closed") try {
				s.audioCtx.close();
			} catch {}
			setAudioCtx(null);
			PD().querySelectorAll("video").forEach((v) => {
				delete v.__ytToolsAudioSource;
			});
			unbindWaveVisualizerUnload();
			removeUnlockHandlers();
		}
		PW().__ytModularWaveActive = false;
		if (s.canvas && s.canvas.parentNode) s.canvas.parentNode.removeChild(s.canvas);
		setCanvas(null);
		setCtx(null);
		frequencyData = null;
		PD().querySelectorAll("video").forEach((v) => {
			v.removeEventListener("play", showCanvas);
			v.removeEventListener("pause", hideCanvas);
			v.removeEventListener("ended", hideCanvas);
			delete v._ytWaveFail;
			delete v._ytWaveRetryAfter;
			delete v[PROCESSED_FLAG];
		});
		PW().removeEventListener("resize", updateCanvasSize);
		if (videoObserver) {
			untrackObserver(videoObserver);
			videoObserver = null;
		}
		clearTimeout(observerDebounce);
		observerDebounce = null;
	}
	function hideCanvas() {
		const canvas = PD().getElementById("wave-visualizer-canvas");
		if (canvas) canvas.style.opacity = "0";
		if (s.animationId) {
			PW().cancelAnimationFrame(s.animationId);
			setAnimationId(null);
		}
	}
	function showCanvas() {
		if (s.audioCtx && s.audioCtx.state === "suspended") s.audioCtx.resume().catch(() => {});
		const canvas = PD().getElementById("wave-visualizer-canvas");
		if (canvas) {
			canvas.style.bottom = "0";
			canvas.style.opacity = "1";
		}
		if (s.isSetup && !s.animationId) draw();
	}
	function teardownSource() {
		if (s.source) {
			try {
				s.source.disconnect();
				if (s.audioCtx && s.audioCtx.state !== "closed") s.source.connect(s.audioCtx.destination);
			} catch {}
			setSource(null);
		}
		if (s.analyser) {
			try {
				s.analyser.disconnect();
			} catch {}
			setAnalyser(null);
		}
		if (s.animationId) {
			PW().cancelAnimationFrame(s.animationId);
			setAnimationId(null);
		}
		const video = s.currentVideo;
		if (video) {
			video.removeEventListener("play", showCanvas);
			video.removeEventListener("pause", hideCanvas);
			video.removeEventListener("ended", hideCanvas);
		}
		setIsSetup(false);
	}
	function setupWaveForVideo(video) {
		if (!video || video["wave_visualizer_processed"]) return;
		if (video._ytWaveRetryAfter && Date.now() < video._ytWaveRetryAfter) return;
		teardownSource();
		setCurrentVideo(video);
		createVisualizerOverlay();
		try {
			if (!s.audioCtx || s.audioCtx.state === "closed") setAudioCtx(new ((PW()).AudioContext || (PW()).webkitAudioContext)());
			else if (s.audioCtx.state === "suspended") s.audioCtx.resume().catch(() => {});
			const analyser = s.audioCtx.createAnalyser();
			analyser.fftSize = 2048;
			analyser.smoothingTimeConstant = .85;
			const len = analyser.fftSize;
			setBufferLength(len);
			setDataArray(new Uint8Array(len));
			setSmoothedData(new Array(len).fill(128));
			frequencyData = new Uint8Array(analyser.frequencyBinCount);
			let sourceNode;
			if (video.__ytToolsAudioSource && video.__ytToolsAudioSource.context === s.audioCtx) {
				sourceNode = video.__ytToolsAudioSource;
				try {
					sourceNode.disconnect();
				} catch {}
			} else {
				sourceNode = createWaveSource(s.audioCtx, video);
				if (sourceNode) video.__ytToolsAudioSource = sourceNode;
			}
			if (!sourceNode) {
				console.error("[WaveViz] Failed to create audio source - YouTube may have already connected video to AudioContext");
				video._ytWaveFail = true;
				video._ytWaveRetryAfter = Date.now() + WAVE_FAIL_RETRY_MS;
				if (s.canvas) {
					s.canvas.style.opacity = "0.3";
					const { w } = prepareCanvasFrame();
					s.ctx.fillStyle = cachedWaveAccent + "40";
					s.ctx.fillText("Wave visualizer: Audio source unavailable", 20, 30);
					s.ctx.fillRect(20, 38, Math.min(320, w - 40), 2);
				}
				return;
			}
			delete video._ytWaveRetryAfter;
			video[PROCESSED_FLAG] = true;
			sourceNode.connect(analyser);
			analyser.connect(s.audioCtx.destination);
			setAnalyser(analyser);
			setSource(sourceNode);
			video.removeEventListener("play", showCanvas);
			video.removeEventListener("pause", hideCanvas);
			video.removeEventListener("ended", hideCanvas);
			video.addEventListener("play", showCanvas);
			video.addEventListener("pause", hideCanvas);
			video.addEventListener("ended", hideCanvas);
			if (!video.paused && !video.ended) showCanvas();
			PW().removeEventListener("resize", updateCanvasSize);
			PW().addEventListener("resize", updateCanvasSize);
			setIsSetup(true);
			draw();
		} catch (e) {
			console.warn("Wave visualizer setup failed:", e);
			video._ytWaveFail = true;
			cleanupWaveVisualizer();
		}
	}
	function createVisualizerOverlay() {
		const existing = PD().querySelector("#wave-visualizer-canvas");
		const canvasStyle = "position:fixed;bottom:0;left:0;width:100%;pointer-events:none;z-index:1;opacity:0;background:transparent;transition:opacity 0.35s ease;";
		if (existing) {
			existing.style.cssText = canvasStyle;
			setCanvas(existing);
			setCtx(existing.getContext("2d"));
			updateCanvasSize();
			return;
		}
		const newCanvas = PD().createElement("canvas");
		newCanvas.id = "wave-visualizer-canvas";
		newCanvas.style.cssText = canvasStyle;
		PD().body.appendChild(newCanvas);
		setCanvas(newCanvas);
		setCtx(newCanvas.getContext("2d"));
		updateCanvasSize();
	}
	function getCanvasDrawMetrics() {
		const dpr = Math.min(PW().devicePixelRatio || 1, 2);
		return {
			dpr,
			w: s.canvas.width / dpr,
			h: s.canvas.height / dpr
		};
	}
	function prepareCanvasFrame() {
		const { dpr, w, h } = getCanvasDrawMetrics();
		s.ctx.setTransform(1, 0, 0, 1, 0, 0);
		s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
		s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		return {
			w,
			h
		};
	}
	function drawAmbientFloor(w, h, colors) {
		const floor = s.ctx.createLinearGradient(0, h * .2, 0, h);
		floor.addColorStop(0, "rgba(0,0,0,0)");
		floor.addColorStop(.6, colors.soft);
		floor.addColorStop(1, "rgba(0,0,0,0.34)");
		s.ctx.fillStyle = floor;
		s.ctx.fillRect(0, 0, w, h);
	}
	function waveY(index, centerY, amplitudeRange) {
		return centerY + Math.max(-1, Math.min(1, (s.smoothedData[index] - 128) / 128 * WAVE_SENSITIVITY)) * amplitudeRange;
	}
	function draw() {
		if (!s.isSetup || !s.analyser || !s.ctx || !s.canvas) {
			setAnimationId(null);
			return;
		}
		if (PD().visibilityState !== "visible" || parseFloat(s.canvas.style.opacity) <= 0) {
			setAnimationId(null);
			return;
		}
		s.analyser.getByteTimeDomainData(s.dataArray);
		if (frequencyData) s.analyser.getByteFrequencyData(frequencyData);
		for (let i = 0; i < s.bufferLength; i++) s.smoothedData[i] += SMOOTHING_FACTOR * (s.dataArray[i] - s.smoothedData[i]);
		const { w, h } = prepareCanvasFrame();
		const sliceWidth = w / s.bufferLength;
		const style = s.waveStyle || "dinamica";
		const colors = waveThemeColors();
		const { accent, glow } = colors;
		const centerY = h * .48;
		const amplitudeRange = h * .46;
		drawAmbientFloor(w, h, colors);
		s.ctx.lineCap = "round";
		s.ctx.lineJoin = "round";
		s.ctx.shadowBlur = 14;
		s.ctx.shadowColor = glow;
		let x = 0;
		switch (style) {
			case "linea":
				s.ctx.lineWidth = 2.4;
				s.ctx.strokeStyle = accent;
				s.ctx.beginPath();
				x = 0;
				for (let i = 0; i < s.bufferLength; i++) {
					const y = waveY(i, centerY, amplitudeRange);
					if (i === 0) s.ctx.moveTo(x, y);
					else s.ctx.lineTo(x, y);
					x += sliceWidth;
				}
				s.ctx.stroke();
				break;
			case "barras":
				if (!frequencyData) break;
				x = 0;
				{
					const bars = 96;
					const gap = 3;
					const barWidth = Math.max(2, w / bars - gap);
					for (let i = 0; i < bars; i++) {
						const bucket = Math.floor(i / bars * frequencyData.length * .72);
						const value = Math.min(1, (frequencyData[bucket] || 0) / 255 * WAVE_SENSITIVITY);
						const barHeight = Math.max(3, value * h * .58);
						const gradient = s.ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
						gradient.addColorStop(0, accent + "cc");
						gradient.addColorStop(1, accent + "33");
						s.ctx.fillStyle = gradient;
						s.ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
						x += barWidth + gap;
					}
				}
				break;
			case "curva":
				s.ctx.lineWidth = 2.6;
				s.ctx.strokeStyle = accent;
				s.ctx.beginPath();
				s.ctx.moveTo(0, waveY(0, centerY, amplitudeRange));
				for (let i = 0; i < s.bufferLength - 1; i++) {
					const x0 = i * sliceWidth;
					const x1 = (i + 1) * sliceWidth;
					const y0 = waveY(i, centerY, amplitudeRange);
					const y1 = waveY(i + 1, centerY, amplitudeRange);
					const cp1x = x0 + sliceWidth / 3;
					const cp1y = y0;
					const cp2x = x1 - sliceWidth / 3;
					const cp2y = y1;
					s.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
				}
				s.ctx.stroke();
				break;
			case "picos":
				s.ctx.fillStyle = accent;
				if (!frequencyData) break;
				for (let i = 0; i < 110; i++) {
					const bucket = Math.floor(i / 110 * frequencyData.length * .75);
					const value = Math.min(1, (frequencyData[bucket] || 0) / 255 * WAVE_SENSITIVITY);
					const dotX = i / 109 * w;
					const dotY = centerY - value * h * .38;
					const radius = 1.2 + value * 3.2;
					s.ctx.beginPath();
					s.ctx.arc(dotX, dotY, radius, 0, Math.PI * 2);
					s.ctx.fill();
				}
				break;
			case "solida":
				s.ctx.beginPath();
				x = 0;
				s.ctx.moveTo(0, centerY);
				for (let i = 0; i < s.bufferLength; i++) {
					s.ctx.lineTo(x, waveY(i, centerY, amplitudeRange));
					x += sliceWidth;
				}
				s.ctx.lineTo(w, h);
				s.ctx.lineTo(0, h);
				s.ctx.closePath();
				s.ctx.fillStyle = accent + "4d";
				s.ctx.fill();
				break;
			case "dinamica": {
				const gradient = s.ctx.createLinearGradient(0, 0, w, 0);
				gradient.addColorStop(0, accent + "44");
				gradient.addColorStop(.35, accent);
				gradient.addColorStop(.65, "#ffffffcc");
				gradient.addColorStop(1, accent + "55");
				s.ctx.lineWidth = 3.2;
				s.ctx.strokeStyle = gradient;
				s.ctx.beginPath();
				x = 0;
				for (let i = 0; i < s.bufferLength; i++) {
					const y = waveY(i, centerY, amplitudeRange);
					if (i === 0) s.ctx.moveTo(x, y);
					else s.ctx.lineTo(x, y);
					x += sliceWidth;
				}
				s.ctx.stroke();
				const fill = s.ctx.createLinearGradient(0, centerY - amplitudeRange, 0, h);
				fill.addColorStop(0, accent + "22");
				fill.addColorStop(.55, accent + "10");
				fill.addColorStop(1, "rgba(0,0,0,0)");
				s.ctx.lineTo(w, h);
				s.ctx.lineTo(0, h);
				s.ctx.closePath();
				s.ctx.fillStyle = fill;
				s.ctx.fill();
				break;
			}
			case "montana":
				s.ctx.beginPath();
				x = 0;
				s.ctx.moveTo(0, h);
				for (let i = 0; i < s.bufferLength; i++) {
					const y = waveY(i, centerY, amplitudeRange * .9);
					s.ctx.lineTo(x, y);
					x += sliceWidth;
				}
				s.ctx.lineTo(w, h);
				s.ctx.closePath();
				s.ctx.fillStyle = accent + "66";
				s.ctx.fill();
				break;
		}
		setAnimationId(PW().requestAnimationFrame(draw));
	}
	function onWaveStyleChange(value, saveSettingsFn) {
		setWaveStyle(value);
		const selectAppend = PD().getElementById("select-wave-visualizer-select");
		if (selectAppend) selectAppend.value = value;
		if (typeof saveSettingsFn === "function") saveSettingsFn();
	}
	function initWaveVisualizer(settings) {
		bindWaveVisualizerUnload();
		waveSettingsSnapshot = settings;
		if (!settings?.waveVisualizer) {
			cleanupWaveVisualizer();
			waveSettingsSnapshot = null;
			return;
		}
		refreshWaveThemeColor();
		PW().__ytModularWaveActive = true;
		if (settings.waveVisualizerSelected) setWaveStyle(settings.waveVisualizerSelected);
		const unlock = () => {
			if (s.audioCtx && s.audioCtx.state === "suspended") s.audioCtx.resume().then(() => {
				PD().querySelectorAll("video").forEach((v) => {
					delete v[PROCESSED_FLAG];
					delete v._ytWaveRetryAfter;
				});
				checkForVideo();
			}).catch(() => {});
		};
		removeUnlockHandlers();
		[
			"mousedown",
			"keydown",
			"touchstart"
		].forEach((type) => {
			PD().addEventListener(type, unlock, { once: true });
			waveUnlockHandlers.push({
				el: PD(),
				type,
				handler: unlock
			});
		});
		checkForVideo();
		let retryCount = 0;
		const maxRetries = isYTMusic$1 ? 30 : 10;
		function retryCheck() {
			if (s.isSetup || retryCount >= maxRetries) return;
			retryCount++;
			waveRetryTimer = trackTimeout(setTimeout(() => {
				waveRetryTimer = null;
				checkForVideo();
				retryCheck();
			}, 2e3));
		}
		retryCheck();
	}
	function removeUnlockHandlers() {
		waveUnlockHandlers.forEach(({ el, type, handler }) => {
			try {
				el.removeEventListener(type, handler);
			} catch {}
		});
		waveUnlockHandlers = [];
	}
	(function injectStyles() {
		const id = "yt-tools-short-btn-style";
		if (document.getElementById(id)) return;
		const style = document.createElement("style");
		style.id = id;
		style.textContent = `
    .yt-tools-short-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 40px !important;
      height: 40px !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
    }
    .yt-tools-short-btn:hover {
      background: rgba(255, 255, 255, 0.2) !important;
    }
    .yt-tools-short-btn svg {
      width: 24px !important;
      height: 24px !important;
      display: block !important;
    }
  `;
		document.head.appendChild(style);
	})();
	var eyeIconSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /><path d=\"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6\" /></svg>";
	var classicIconSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9\" /><path d=\"M16 3l-4 4l-4 -4\" /></svg>";
	var starIconSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\"><path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/></svg>";
	var redirectToClassic = () => {
		const classicUrl = `https://www.youtube.com/watch?v=${window.location.pathname.split("/").pop()}`;
		window.open(classicUrl, "_blank");
		const vid = $e("video.video-stream.html5-main-video");
		if (vid) vid.pause();
	};
	function createReelBarButton(opts) {
		const wrap = document.createElement("div");
		wrap.className = "button-view-model ytSpecButtonViewModelHost";
		if (opts.dataAttr) wrap.setAttribute(opts.dataAttr, "1");
		const label = document.createElement("label");
		label.className = "yt-spec-button-shape-with-label ytSpecButtonShapeWithLabelHost";
		const button = document.createElement("button");
		button.type = "button";
		button.className = "yt-tools-short-btn";
		button.title = opts.title || "";
		button.setAttribute("aria-label", opts.ariaLabel || "");
		const iconDiv = document.createElement("div");
		iconDiv.className = "yt-spec-button-shape-next__icon";
		iconDiv.setAttribute("aria-hidden", "true");
		const iconSpan = document.createElement("span");
		iconSpan.className = "yt-icon-shape ytSpecIconShapeHost";
		if (opts.iconSvg) try {
			const tempDiv = document.createElement("div");
			setHTML(tempDiv, opts.iconSvg);
			while (tempDiv.firstChild) iconSpan.appendChild(tempDiv.firstChild);
		} catch (e) {
			console.warn("[YT Tools] SVG parse error:", e);
		}
		iconDiv.appendChild(iconSpan);
		button.appendChild(iconDiv);
		const labelDiv = document.createElement("div");
		labelDiv.className = "yt-spec-button-shape-with-label__label";
		labelDiv.setAttribute("aria-hidden", "false");
		const labelSpan = document.createElement("span");
		labelSpan.className = "yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--text-alignment-center";
		labelSpan.setAttribute("role", "text");
		labelSpan.textContent = opts.labelText || "";
		labelDiv.appendChild(labelSpan);
		label.appendChild(button);
		label.appendChild(labelDiv);
		wrap.appendChild(label);
		if (opts.onclick) button.addEventListener("click", opts.onclick);
		return wrap;
	}
	function updateShortsViewsButton(videoId, viewCount) {
		const bar = $e("reel-action-bar-view-model");
		if (!bar) return;
		const viewsWrap = bar.querySelector("[data-yt-tools-shorts-views]");
		if (!viewsWrap) return;
		const labelSpan = viewsWrap.querySelector(".yt-spec-button-shape-with-label__label span, [role=\"text\"]");
		if (!labelSpan) return;
		labelSpan.textContent = Number.isFinite(viewCount) && viewCount >= 0 ? FormatterNumber(viewCount, 0) : "—";
	}
	function updateShortsRatingButton(videoId, rating) {
		const bar = $e("reel-action-bar-view-model");
		if (!bar) return;
		const ratingWrap = bar.querySelector("[data-yt-tools-shorts-rating]");
		if (!ratingWrap) return;
		const labelSpan = ratingWrap.querySelector(".yt-spec-button-shape-with-label__label span, [role=\"text\"]");
		if (!labelSpan) return;
		labelSpan.textContent = Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating.toFixed(1) : "—";
	}
	function insertReelBarButtons() {
		if (isYTMusic$1) return;
		const isShortsPage = document.location.pathname.startsWith("/shorts");
		const bar = $e("reel-action-bar-view-model");
		if (!isShortsPage || !bar) {
			document.querySelectorAll("[data-yt-tools-shorts-classic], [data-yt-tools-shorts-views], [data-yt-tools-shorts-rating]").forEach((el) => el.remove());
			return;
		}
		if (bar.querySelector("[data-yt-tools-shorts-classic]")) return;
		const classicBtn = createReelBarButton({
			dataAttr: "data-yt-tools-shorts-classic",
			title: "Classic mode",
			ariaLabel: "Classic mode",
			iconSvg: classicIconSvg,
			labelText: "",
			onclick: redirectToClassic
		});
		const viewsBtn = createReelBarButton({
			dataAttr: "data-yt-tools-shorts-views",
			title: "Views",
			ariaLabel: "Views",
			iconSvg: eyeIconSvg,
			labelText: "—",
			onclick: function() {}
		});
		const ratingBtn = createReelBarButton({
			dataAttr: "data-yt-tools-shorts-rating",
			title: "Rating (likes/dislikes)",
			ariaLabel: "Rating",
			iconSvg: starIconSvg,
			labelText: "—",
			onclick: function() {}
		});
		bar.insertBefore(ratingBtn, bar.firstChild);
		bar.insertBefore(viewsBtn, bar.firstChild);
		bar.insertBefore(classicBtn, bar.firstChild);
		const videoId = document.location.pathname.split("/").filter(Boolean)[1];
		if (videoId) {
			const persisted = getLikesDislikesFromPersistedCache(videoId);
			if (persisted?.viewCount != null) updateShortsViewsButton(videoId, persisted.viewCount);
			if (persisted?.rating != null) updateShortsRatingButton(videoId, persisted.rating);
		}
		__ytToolsRuntime.updateShortsViewsButton = updateShortsViewsButton;
		__ytToolsRuntime.updateShortsRatingButton = updateShortsRatingButton;
	}
	function fetchShortsData() {
		const videoId = document.location.pathname.split("/").filter(Boolean)[1];
		if (!videoId) return;
		const cached = getLikesDislikesFromPersistedCache(videoId);
		if (cached?.viewCount != null && cached?.rating != null) {
			if (Number.isFinite(cached.viewCount)) updateShortsViewsButton(videoId, cached.viewCount);
			if (Number.isFinite(cached.rating) && cached.rating >= 0 && cached.rating <= 5) updateShortsRatingButton(videoId, cached.rating);
			return;
		}
		fetch(`${apiDislikes}${videoId}`).then((r) => r.json()).then((data) => {
			if (document.location.pathname.split("/").filter(Boolean)[1] !== videoId) return;
			const viewCount = Number(data?.viewCount);
			const rating = Number(data?.rating);
			if (Number.isFinite(viewCount)) updateShortsViewsButton(videoId, viewCount);
			if (Number.isFinite(rating) && rating >= 0 && rating <= 5) updateShortsRatingButton(videoId, rating);
		}).catch(() => {});
	}
	function initShortsReelButtons() {
		if (isYTMusic$1) return;
		if (__ytToolsRuntime.shortsReelButtonsInitialized) return;
		__ytToolsRuntime.shortsReelButtonsInitialized = true;
		let lastShortId = null;
		function onShortChange() {
			if (!window.location.pathname.startsWith("/shorts")) {
				lastShortId = null;
				return;
			}
			const videoId = window.location.pathname.split("/").filter(Boolean)[1];
			if (!videoId || videoId === lastShortId) return;
			lastShortId = videoId;
			setTimeout(() => {
				insertReelBarButtons();
				fetchShortsData();
			}, 300);
		}
		if (window.location.pathname.startsWith("/shorts")) onShortChange();
		document.addEventListener("yt-page-data-updated", onShortChange);
		document.addEventListener("yt-navigate-finish", onShortChange);
		window.addEventListener("popstate", onShortChange);
	}
	function initDownloadDescription(enabled = true) {
		if (isYTMusic$1) return;
		if (!window.location.href.includes("youtube.com/watch")) return;
		const existing = $e("#button_copy_description");
		if (!enabled) {
			if (existing) existing.remove();
			return;
		}
		if (existing && document.contains(existing)) return;
		if (existing) existing.remove();
		const containerDescription = $e("ytd-watch-metadata #bottom-row") || $e("#bottom-row.ytd-watch-metadata") || $e("ytd-description-renderer") || $e("#description.ytd-watch-metadata") || $e("#top-row.ytd-watch-metadata");
		if (!containerDescription) return;
		const wrapper = document.createElement("div");
		wrapper.id = "button_copy_description";
		wrapper.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-top: 10px; width: 100%;";
		const btn = document.createElement("button");
		btn.id = "copy-description";
		btn.title = "Copy description";
		btn.className = "botones_div";
		btn.type = "button";
		btn.style.cursor = "pointer";
		const icon = document.createElement("i");
		icon.style.fontSize = "20px";
		icon.className = "fa-solid fa-copy";
		btn.appendChild(icon);
		wrapper.appendChild(btn);
		containerDescription.insertAdjacentElement("beforebegin", wrapper);
		btn.addEventListener("click", () => {
			const ldJson = [...$m("script[type=\"application/ld+json\"]")];
			for (const script of ldJson) try {
				const data = JSON.parse(script.innerText);
				if (data["@type"] === "VideoObject") {
					const description = `📅 Date published: ${data.uploadDate || "N/A"}\nAuthor: ${data.author || "N/A"}\n🎬 Name video: ${data.name || "N/A"}\n🖼️ Thumbnail: ${Array.isArray(data.thumbnailUrl) ? data.thumbnailUrl.join(", ") : data.thumbnailUrl || "N/A"}\n📝 Description: ${data.description || "N/A"}\n\n\n🎭 Category: ${data.genre || "N/A"}\n`;
					navigator.clipboard.writeText(description);
					Notify("success", "Description copied");
				}
			} catch {
				Notify("error", "Error parsing JSON-LD");
			}
		});
	}
	var _commentIO = null;
	var _commentMO = null;
	function initCommentObserver(settings) {
		if (isYTMusic$1) return;
		const commentsContainer = document.querySelector("#comments");
		if (!commentsContainer) return;
		if (_commentIO) {
			try {
				untrackObserver(_commentIO);
			} catch {}
			_commentIO = null;
		}
		if (_commentMO) {
			try {
				untrackObserver(_commentMO);
			} catch {}
			_commentMO = null;
		}
		_commentIO = trackObserver(new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				const dispatchCommentsUpdated = debounce(() => {
					document.dispatchEvent(new CustomEvent("yt-tools-comments-updated", { detail: { settings } }));
				}, 500);
				_commentMO = trackObserver(new MutationObserver((mutations) => {
					let shouldUpdate = false;
					for (const m of mutations) if (m.addedNodes.length > 0) {
						shouldUpdate = true;
						break;
					}
					if (shouldUpdate) window.requestAnimationFrame(() => {
						dispatchCommentsUpdated();
					});
				}));
				const commentContents = document.querySelector("ytd-comments #contents");
				if (commentContents) _commentMO.observe(commentContents, {
					childList: true,
					subtree: true
				});
				untrackObserver(_commentIO);
			}
		}));
		_commentIO.observe(commentsContainer);
	}
	function setupCommentNavListener(settings) {
		if (isYTMusic$1) return;
		setTimeout(() => initCommentObserver(settings), 1500);
	}
	var ytmAmbientMode = {
		active: false,
		_initialized: false,
		glowEl: null,
		styleEl: null,
		dividerEl: null,
		videoEl: null,
		_lastSrc: "",
		_pollId: null,
		_trackerId: null,
		_getArtUrl() {
			try {
				const mp = document.getElementById("movie_player");
				if (mp && typeof mp.getVideoData === "function") {
					const vData = mp.getVideoData();
					if (vData && vData.video_id) return `https://i.ytimg.com/vi/${vData.video_id}/sddefault.jpg`;
				}
			} catch {}
			for (const sel of [
				"#song-image yt-img-shadow img",
				"#song-image img",
				"ytmusic-player-page #thumbnail img",
				"#player-page .thumbnail img",
				"ytmusic-player-bar .image img",
				"ytmusic-player-bar img"
			]) {
				const img = document.querySelector(sel);
				if (img && img.src && img.src.startsWith("http")) return img.src.replace(/=w\d+-h\d+/, "=w640-h640").replace(/=s\d+/, "=s640");
			}
			const video = $e("video");
			if (video && video.poster) return video.poster;
			return null;
		},
		_ensureInit() {
			if (this._initialized) return;
			this._initialized = true;
			this.glowEl = document.createElement("div");
			this.glowEl.id = "ytm-ambient-glow";
			document.body.appendChild(this.glowEl);
			this.dividerEl = document.createElement("div");
			this.dividerEl.id = "ytm-custom-divider";
			document.body.appendChild(this.dividerEl);
			this.styleEl = document.createElement("style");
			this.styleEl.id = "ytm-ambient-style";
			this.styleEl.textContent = `
      #ytm-ambient-glow {
        position: fixed;
        top: -200px; left: -200px;
        width: calc(100vw + 400px);
        height: calc(100vh + 400px);
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        filter: blur(140px) saturate(2.2) brightness(0.9);
        transition: opacity 1.2s ease;
      }
      #ytm-ambient-glow.active {
        opacity: 0.7;
      }
      #ytm-custom-divider {
        position: fixed;
        width: 1px;
        background: rgba(255, 255, 255, 0.15);
        pointer-events: none;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      body.ytm-ambient-active #ytm-custom-divider.active {
        opacity: 1;
      }
      body.ytm-ambient-active ytmusic-app,
      body.ytm-ambient-active ytmusic-app-layout,
      body.ytm-ambient-active #layout {
        background-color: transparent !important;
        background: transparent !important;
        transition: background-color 0.6s ease;
      }
      body.ytm-ambient-active ytmusic-player-page,
      body.ytm-ambient-active #player-page,
      body.ytm-ambient-active ytmusic-player-page #main-panel,
      body.ytm-ambient-active .background-gradient {
        background-color: transparent !important;
        background: transparent !important;
        background-image: none !important;
      }
      /* Nav bar — glassmorphic so it stays readable over ambient glow */
      body.ytm-ambient-active #nav-bar-background {
        background: transparent !important;
      }
      body.ytm-ambient-active ytmusic-nav-bar {
        background: rgba(0, 0, 0, 0.35) !important;
        backdrop-filter: blur(20px) saturate(1.3) !important;
        -webkit-backdrop-filter: blur(20px) saturate(1.3) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      /* Player bar — glassmorphic */
      body.ytm-ambient-active #player-bar-background {
        background: transparent !important;
      }
      body.ytm-ambient-active ytmusic-player-bar {
        background: rgba(0, 0, 0, 0.4) !important;
        backdrop-filter: blur(24px) saturate(1.4) !important;
        -webkit-backdrop-filter: blur(24px) saturate(1.4) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      /* Sidebar — glassmorphic */
      body.ytm-ambient-active tp-yt-app-drawer,
      body.ytm-ambient-active tp-yt-app-drawer #contentContainer {
        background: rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(18px) saturate(1.2) !important;
        -webkit-backdrop-filter: blur(18px) saturate(1.2) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
        box-shadow: none !important;
      }
      body.ytm-ambient-active #guide-wrapper,
      body.ytm-ambient-active #guide-content,
      body.ytm-ambient-active ytmusic-guide-renderer {
        background: rgba(0, 0, 0, 0.25) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        box-shadow: none !important;
      }
      body.ytm-ambient-active #mini-guide-background,
      body.ytm-ambient-active #mini-guide {
        background: rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
      }
      body.ytm-ambient-active ytmusic-browse-response {
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
			document.head.appendChild(this.styleEl);
		},
		show() {
			if (!isYTMusic$1) return;
			if (this.active) return;
			if (!window.location.href.includes("/watch")) return;
			this._ensureInit();
			this.active = true;
			this.videoEl = document.querySelector("video");
			if (this.glowEl) {
				this.glowEl.classList.add("active");
				document.body.classList.add("ytm-ambient-active");
			}
			this._updateArt();
			this._startPoll();
			this._startTracker();
			if (this.videoEl) {
				this.videoEl.removeEventListener("play", this._onPlay);
				this.videoEl.addEventListener("play", this._onPlay);
			}
		},
		hide() {
			this.active = false;
			if (this._pollId) {
				untrackInterval(this._pollId);
				this._pollId = null;
			}
			if (this._trackerId) {
				cancelAnimationFrame(this._trackerId);
				this._trackerId = null;
			}
			if (this.glowEl) {
				this.glowEl.classList.remove("active");
				document.body.classList.remove("ytm-ambient-active");
			}
			if (this.dividerEl) this.dividerEl.classList.remove("active");
			if (this.videoEl) {
				this.videoEl.removeEventListener("play", this._onPlay);
				this.videoEl = null;
			}
		},
		destroy() {
			this.hide();
			this._lastSrc = "";
			this._initialized = false;
			if (this.glowEl?.parentNode) this.glowEl.parentNode.removeChild(this.glowEl);
			this.glowEl = null;
			if (this.dividerEl?.parentNode) this.dividerEl.parentNode.removeChild(this.dividerEl);
			this.dividerEl = null;
			if (this.styleEl?.parentNode) this.styleEl.parentNode.removeChild(this.styleEl);
			this.styleEl = null;
		},
		_startTracker() {
			if (this._trackerId) cancelAnimationFrame(this._trackerId);
			const self = this;
			let lastTop = 0, lastHeight = 0, lastLeft = 0;
			let frameCount = 0;
			let nav, player, drawer, wrapper;
			let cacheValid = false;
			function track() {
				if (!self.active) {
					self._trackerId = null;
					return;
				}
				frameCount++;
				if (frameCount % 15 !== 0) {
					self._trackerId = requestAnimationFrame(track);
					return;
				}
				if (!cacheValid || frameCount % 60 === 0) {
					nav = document.querySelector("ytmusic-nav-bar");
					player = document.querySelector("ytmusic-player-bar");
					drawer = document.querySelector("tp-yt-app-drawer");
					wrapper = document.querySelector("#guide-wrapper") || document.querySelector("#mini-guide-background");
					cacheValid = !!(nav && player && drawer && wrapper);
				}
				if (cacheValid && self.dividerEl) {
					const navRect = nav.getBoundingClientRect();
					const playerRect = player.getBoundingClientRect();
					let leftPos = wrapper.getBoundingClientRect().right;
					if (leftPos <= 0 || !leftPos) leftPos = drawer.hasAttribute("opened") ? 240 : 72;
					const top = navRect.bottom;
					const height = playerRect.top - navRect.bottom;
					if (top !== lastTop || height !== lastHeight || leftPos !== lastLeft) {
						lastTop = top;
						lastHeight = height;
						lastLeft = leftPos;
						self.dividerEl.style.top = top + "px";
						self.dividerEl.style.height = height + "px";
						self.dividerEl.style.left = leftPos + "px";
						self.dividerEl.classList.add("active");
					}
				}
				self._trackerId = requestAnimationFrame(track);
			}
			this._trackerId = requestAnimationFrame(track);
		},
		setup() {
			this.show();
		},
		cleanup() {
			this.hide();
		},
		_updateArt() {
			const url = this._getArtUrl();
			if (url && url !== this._lastSrc) {
				this._lastSrc = url;
				if (this.glowEl) this.glowEl.style.backgroundImage = `url("${url}")`;
			}
		},
		_startPoll() {
			if (this._pollId) untrackInterval(this._pollId);
			const self = this;
			this._pollId = trackInterval(setInterval(() => {
				if (!self.active) {
					untrackInterval(self._pollId);
					self._pollId = null;
					return;
				}
				if (!window.location.href.includes("/watch")) {
					self.hide();
					return;
				}
				self._updateArt();
			}, 3e3));
		},
		_onPlay: function() {
			if (!window.location.href.includes("/watch")) return;
			const g = document.getElementById("ytm-ambient-glow");
			if (g) {
				g.classList.add("active");
				document.body.classList.add("ytm-ambient-active");
			}
			ytmAmbientMode._updateArt();
		}
	};
	function startAmbientWatcher() {
		if (!isYTMusic$1) return;
		let _ambientWatcherId = null;
		function start() {
			if (_ambientWatcherId) return;
			_ambientWatcherId = trackInterval(setInterval(() => {
				if (document.visibilityState !== "visible") return;
				const s = readJsonGM(SETTINGS_KEY, {});
				const onWatch = window.location.href.includes("/watch");
				if (!s.cinematicLighting) {
					if (ytmAmbientMode.active) ytmAmbientMode.hide();
					return;
				}
				if (onWatch && !ytmAmbientMode.active) ytmAmbientMode.show();
				else if (!onWatch && ytmAmbientMode.active) ytmAmbientMode.hide();
			}, 3e3));
		}
		trackTimeout(setTimeout(start, 3e3));
		document.addEventListener("yt-page-data-updated", () => {
			if (!readJsonGM(SETTINGS_KEY, {}).cinematicLighting) return;
			if (window.location.href.includes("/watch")) if (!ytmAmbientMode.active) ytmAmbientMode.show();
			else ytmAmbientMode._updateArt();
			else if (ytmAmbientMode.active) ytmAmbientMode.hide();
		});
	}
	var THEMES = [
		{
			name: "Default / Reload",
			gradient: "",
			textColor: "",
			raised: "",
			btnTranslate: "",
			CurrentProgressVideo: "",
			videoDuration: "",
			colorIcons: "",
			textLogo: "",
			glassBg: "",
			glassBlur: "",
			waveColor: "#06b6d4"
		},
		{
			name: "Midnight Blue",
			gradient: "linear-gradient(135deg, #0f172a, #1e3a5f)",
			textColor: "#e2e8f0",
			raised: "rgba(15, 23, 42, 0.45)",
			btnTranslate: "#3b82f6",
			CurrentProgressVideo: "#60a5fa",
			videoDuration: "#94a3b8",
			colorIcons: "#93c5fd",
			textLogo: "#f8fafc",
			glassBg: "rgba(15, 23, 42, 0.55)",
			glassBlur: "18px",
			waveColor: "#60a5fa"
		},
		{
			name: "Emerald Forest",
			gradient: "linear-gradient(135deg, #064e3b, #065f46)",
			textColor: "#d1fae5",
			raised: "rgba(6, 78, 59, 0.45)",
			btnTranslate: "#10b981",
			CurrentProgressVideo: "#34d399",
			videoDuration: "#6ee7b7",
			colorIcons: "#a7f3d0",
			textLogo: "#ecfdf5",
			glassBg: "rgba(6, 78, 59, 0.55)",
			glassBlur: "18px",
			waveColor: "#6ee7b7"
		},
		{
			name: "Sunset Amber",
			gradient: "linear-gradient(135deg, #451a03, #78350f)",
			textColor: "#fef3c7",
			raised: "rgba(69, 26, 3, 0.45)",
			btnTranslate: "#f59e0b",
			CurrentProgressVideo: "#fbbf24",
			videoDuration: "#fde68a",
			colorIcons: "#fcd34d",
			textLogo: "#fffbeb",
			glassBg: "rgba(69, 26, 3, 0.55)",
			glassBlur: "18px",
			waveColor: "#fbbf24"
		},
		{
			name: "Royal Violet",
			gradient: "linear-gradient(135deg, #2e1065, #4c1d95)",
			textColor: "#ede9fe",
			raised: "rgba(46, 16, 101, 0.45)",
			btnTranslate: "#8b5cf6",
			CurrentProgressVideo: "#a78bfa",
			videoDuration: "#c4b5fd",
			colorIcons: "#c4b5fd",
			textLogo: "#faf5ff",
			glassBg: "rgba(46, 16, 101, 0.55)",
			glassBlur: "18px",
			waveColor: "#c4b5fd"
		},
		{
			name: "Rose Bloom",
			gradient: "linear-gradient(135deg, #881337, #9d174d)",
			textColor: "#fce7f3",
			raised: "rgba(136, 19, 55, 0.45)",
			btnTranslate: "#ec4899",
			CurrentProgressVideo: "#f472b6",
			videoDuration: "#f9a8d4",
			colorIcons: "#fbcfe8",
			textLogo: "#fdf2f8",
			glassBg: "rgba(136, 19, 55, 0.55)",
			glassBlur: "18px",
			waveColor: "#f9a8d4"
		},
		{
			name: "Crimson Dark",
			gradient: "linear-gradient(135deg, #1a0000, #450a0a)",
			textColor: "#fecaca",
			raised: "rgba(69, 10, 10, 0.45)",
			btnTranslate: "#ef4444",
			CurrentProgressVideo: "#f87171",
			videoDuration: "#fca5a5",
			colorIcons: "#fecaca",
			textLogo: "#fef2f2",
			glassBg: "rgba(69, 10, 10, 0.55)",
			glassBlur: "18px",
			waveColor: "#f87171"
		},
		{
			name: "Ocean Depth",
			gradient: "linear-gradient(135deg, #0c4a6e, #0891b2)",
			textColor: "#cffafe",
			raised: "rgba(12, 74, 110, 0.45)",
			btnTranslate: "#06b6d4",
			CurrentProgressVideo: "#22d3ee",
			videoDuration: "#67e8f9",
			colorIcons: "#a5f3fc",
			textLogo: "#ecfeff",
			glassBg: "rgba(12, 74, 110, 0.55)",
			glassBlur: "18px",
			waveColor: "#67e8f9"
		},
		{
			name: "Neon Glow",
			gradient: "linear-gradient(135deg, #4a00e0, #8b5cf6)",
			textColor: "#f5f3ff",
			raised: "rgba(74, 0, 224, 0.45)",
			btnTranslate: "#a78bfa",
			CurrentProgressVideo: "#c084fc",
			videoDuration: "#d8b4fe",
			colorIcons: "#e9d5ff",
			textLogo: "#faf5ff",
			glassBg: "rgba(74, 0, 224, 0.55)",
			glassBlur: "18px",
			waveColor: "#e9d5ff"
		},
		{
			name: "Azure Mist",
			gradient: "linear-gradient(135deg, #1e3a8a, #2563eb)",
			textColor: "#dbeafe",
			raised: "rgba(30, 58, 138, 0.45)",
			btnTranslate: "#3b82f6",
			CurrentProgressVideo: "#60a5fa",
			videoDuration: "#93c5fd",
			colorIcons: "#bfdbfe",
			textLogo: "#eff6ff",
			glassBg: "rgba(30, 58, 138, 0.55)",
			glassBlur: "18px",
			waveColor: "#93c5fd"
		},
		{
			name: "Golden Hour",
			gradient: "linear-gradient(135deg, #713f12, #a16207)",
			textColor: "#fef9c3",
			raised: "rgba(113, 63, 18, 0.45)",
			btnTranslate: "#eab308",
			CurrentProgressVideo: "#facc15",
			videoDuration: "#fde047",
			colorIcons: "#fef08a",
			textLogo: "#fefce8",
			glassBg: "rgba(113, 63, 18, 0.55)",
			glassBlur: "18px",
			waveColor: "#fde047"
		},
		{
			name: "Slate Graphite",
			gradient: "linear-gradient(135deg, #1e293b, #334155)",
			textColor: "#e2e8f0",
			raised: "rgba(30, 41, 59, 0.45)",
			btnTranslate: "#64748b",
			CurrentProgressVideo: "#94a3b8",
			videoDuration: "#cbd5e1",
			colorIcons: "#cbd5e1",
			textLogo: "#f8fafc",
			glassBg: "rgba(30, 41, 59, 0.55)",
			glassBlur: "18px",
			waveColor: "#94a3b8"
		},
		{
			name: "Plum Velvet",
			gradient: "linear-gradient(135deg, #3b0764, #581c87)",
			textColor: "#f3e8ff",
			raised: "rgba(59, 7, 100, 0.45)",
			btnTranslate: "#a855f7",
			CurrentProgressVideo: "#c084fc",
			videoDuration: "#d8b4fe",
			colorIcons: "#e9d5ff",
			textLogo: "#faf5ff",
			glassBg: "rgba(59, 7, 100, 0.55)",
			glassBlur: "18px",
			waveColor: "#e9d5ff"
		},
		{
			name: "Teal Mint",
			gradient: "linear-gradient(135deg, #115e59, #0d9488)",
			textColor: "#ccfbf1",
			raised: "rgba(17, 94, 89, 0.45)",
			btnTranslate: "#14b8a6",
			CurrentProgressVideo: "#2dd4bf",
			videoDuration: "#5eead4",
			colorIcons: "#99f6e4",
			textLogo: "#f0fdfa",
			glassBg: "rgba(17, 94, 89, 0.55)",
			glassBlur: "18px",
			waveColor: "#5eead4"
		},
		{
			name: "Monochrome",
			gradient: "linear-gradient(135deg, #0a0a0a, #171717)",
			textColor: "#d4d4d4",
			raised: "rgba(10, 10, 10, 0.45)",
			btnTranslate: "#737373",
			CurrentProgressVideo: "#a3a3a3",
			videoDuration: "#d4d4d4",
			colorIcons: "#e5e5e5",
			textLogo: "#fafafa",
			glassBg: "rgba(10, 10, 10, 0.55)",
			glassBlur: "18px",
			waveColor: "#a3a3a3"
		}
	];
	var themeOptionsHTML = THEMES.map((theme, index) => `
    <label>
      <div class="theme-option">
      <div class="theme-preview" style="background: ${theme.gradient};"></div>
      <input type="radio" name="theme" value="${index}" ${index === 0 ? "checked" : ""}>
          <span style="${theme.name === "Default / Reload" ? "color: red; " : ""}" class="theme-name">${theme.name}</span>
          </div>
    </label>
`).join("");
	var languageOptionsHTML = Object.entries({
		en: "English",
		es: "Spanish",
		"zh-CN": "Chinese (Simplified)",
		"zh-TW": "Chinese (Traditional)",
		hi: "Hindi",
		ar: "Arabic",
		pt: "Portuguese",
		bn: "Bengali",
		ru: "Russian",
		ja: "Japanese",
		pa: "Punjabi",
		de: "German",
		jv: "Javanese",
		vi: "Vietnamese",
		ko: "Korean",
		fr: "French",
		tr: "Turkish",
		it: "Italian",
		te: "Telugu",
		mr: "Marathi"
	}).map(([code, name]) => `<option value="${code}">${name}</option>`).join("");
	function buildGeneralTab(isYTMusic, languageOptionsHTML) {
		return `
      <div id="general" class="tab-content active">
        <div class="options-mdcm">
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="hide-comments-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-comment-slash"></i>Hide Comments</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="hide-comments-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="hide-sidebar-toggle">
              <span class="toggle-label-text"><i class="fa-solid fa-sidebar"></i>Hide Sidebar</span>
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="hide-sidebar-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="autoplay-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-circle-pause"></i>Disable Autoplay</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="autoplay-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="dislikes-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-thumbs-down"></i>Show Dislikes</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="dislikes-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="like-dislike-bar-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-chart-simple"></i>Like vs Dislike bar</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="like-dislike-bar-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="bookmarks-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-bookmark"></i>Bookmarks (timestamps)</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="bookmarks-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="continue-watching-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-forward"></i>Continue watching</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="continue-watching-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="shorts-channel-name-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-user"></i>Shorts: show channel name</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="shorts-channel-name-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="copy-description-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-copy"></i>Copy description button</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="copy-description-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="nonstop-playback-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-infinity"></i>Nonstop playback</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="nonstop-playback-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          ${isYTMusic ? `
        <label>
          <div class="toggle-row" data-for="audio-only-toggle">
            <span class="toggle-label-text"><i class="fa-solid fa-headphones"></i>Audio-only mode</span>
            <label class="toggle-switch-mdcm">
              <input type="checkbox" class="checkbox-mdcm" id="audio-only-toggle">
              <span class="toggle-slider-mdcm"></span>
            </label>
          </div>
        </label>
        <label>
          <div class="toggle-row" data-for="audio-only-tab-toggle">
            <span class="toggle-label-text"><i class="fa-solid fa-headphones-simple"></i>Audio-only this tab</span>
            <label class="toggle-switch-mdcm">
              <input type="checkbox" class="checkbox-mdcm" id="audio-only-tab-toggle">
              <span class="toggle-slider-mdcm"></span>
            </label>
          </div>
        </label>
        ` : ""}
          <label>
            <div class="toggle-row" data-for="themes-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-palette"></i>Active Themes</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="themes-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="translation-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-language"></i>Translate comments</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="translation-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="avatars-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-image"></i>Download avatars</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="avatars-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="reverse-mode-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-arrow-right-arrow-left"></i>Reverse mode</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="reverse-mode-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="cinematic-lighting-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-gear"></i>${isYTMusic ? "Ambient Mode" : "Cinematic Mode"}</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="cinematic-lighting-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <label>
            <div class="toggle-row" data-for="wave-visualizer-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-wave-square"></i>Wave visualizer Beta</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" checked id="wave-visualizer-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>
          <div class="quality-selector-mdcm" style="grid-column: span 2;">
            <div class="select-wrapper-mdcm">
              <label
                >Background Glass Style:
                <select class="tab-button-active" id="side-panel-style-select">
                  <option value="blur">Blur</option>
                  <option value="liquid">Liquid Glass</option>
                  <option value="transparent">Transparent</option>
                </select>
              </label>
            </div>
          </div>
          <label ${isYTMusic ? "style=\"display:none\"" : ""}>
            <div class="toggle-row" data-for="sync-cinematic-toggle">
              <span class="toggle-label-text"
                ><i class="fa-solid fa-gear"></i>Sync Ambient Mode YT</span
              >
              <label class="toggle-switch-mdcm">
                <input type="checkbox" class="checkbox-mdcm" id="sync-cinematic-toggle" />
                <span class="toggle-slider-mdcm"></span>
              </label>
            </div>
          </label>

          <div class="quality-selector-mdcm" style="grid-column: span 2;">
            <div class="select-wrapper-mdcm">
              <label
                >Effect wave visualizer:
                <select class="tab-button-active" id="select-wave-visualizer-select">
                  <option value="linea">Line smooth</option>
                  <option value="barras">Vertical bars</option>
                  <option value="curva">Curved</option>
                  <option value="picos">Smooth peaks</option>
                  <option value="solida">Solid wave</option>
                  <option value="dinamica">Dynamic wave</option>
                  <option value="montana">Smooth mountain</option>
                </select>
              </label>
            </div>
          </div>
          <div
            class="quality-selector-mdcm"
            style="grid-column: span 2;${isYTMusic ? " display:none;" : ""}"
          >
            <div class="select-wrapper-mdcm">
              <label
                >Default video player quality:
                <select class="tab-button-active" id="select-video-qualitys-select">
                  <option value="user">User Default</option>
                  <option value="">Auto</option>
                  <option value="144">144</option>
                  <option value="240">240</option>
                  <option value="360">360</option>
                  <option value="480">480</option>
                  <option value="720">720</option>
                  <option value="1080">1080</option>
                  <option value="1440">1440</option>
                  <option value="2160">2160</option>
                  <option value="4320">4320</option>
                </select>
              </label>
            </div>
          </div>
          <div
            class="quality-selector-mdcm"
            style="grid-column: span 2;${isYTMusic ? " display:none;" : ""}"
          >
            <div class="select-wrapper-mdcm">
              <label
                >Language for translate comments:
                <select class="tab-button-active" id="select-languages-comments-select">
                  ${languageOptionsHTML}
                </select>
              </label>
            </div>
          </div>
          <div class="slider-container-mdcm" style="grid-column: span 2;">
            <label>Video Player Size: <span id="player-size-value">100</span>%</label>
            <input
              type="range"
              id="player-size-slider"
              class="slider-mdcm"
              min="50"
              max="150"
              value="100"
            />
            <button class="reset-btn-mdcm" id="reset-player-size">Reset video size</button>
          </div>
        </div>
      </div>`;
	}
	function buildThemesTab(isDarkModeActive, themeOptionsHTML) {
		return `
      <div id="themes" class="tab-content">
        <div id="background-image-container" class="background-image-container">
          <h4>Background Image</h4>
          <input
            type="file"
            id="background_image"
            accept="image/png, image/jpeg"
            style="display:none;"
          />
          <div id="background-image-preview" class="background-image-preview">
            <span class="background-image-overlay">
              <i class="fa fa-camera"></i>
              <span class="background-image-text">Select image</span>
            </span>
            <button
              id="remove-background-image"
              class="remove-background-image"
              title="Quitar fondo"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="themes-hidden">
          <div class="options-mdcm" style="margin-bottom: 10px;">
            <div>
              <h4>Choose a Theme</h4>
              <p>Disable Mode Cinematic on General</p>
              ${isDarkModeActive === "dark" ? "" : "<p style=\"color: red; margin: 10px 0;font-size: 11px;\">Activate dark mode to use this option</p>"}
            </div>
          </div>
          <div class="options-mdcm">
            <label>
              <div class="theme-option option-mdcm">
                <input type="radio" class="radio-mdcm" name="theme" value="custom" checked />
                <span class="theme-name">Custom</span>
              </div>
            </label>
            <label>
              <div class="theme-option option-mdcm theme-selected-normal">
                <input type="radio" class="radio-mdcm" name="theme" value="normal" />
                <span class="theme-name">Selected Themes</span>
              </div>
            </label>
          </div>
          <div class="themes-options">
            <div class="options-mdcm">${themeOptionsHTML}</div>
          </div>
          <div class="theme-custom-options">
            <div class="options-mdcm">
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Progressbar Video:</label
                  ><input
                    type="color"
                    id="progressbar-color-picker"
                    class="color-picker-mdcm"
                    value="#ff0000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Background Color:</label
                  ><input
                    type="color"
                    id="bg-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Primary Color:</label
                  ><input
                    type="color"
                    id="primary-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Secondary Color:</label
                  ><input
                    type="color"
                    id="secondary-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Header Color:</label
                  ><input
                    type="color"
                    id="header-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Icons Color:</label
                  ><input
                    type="color"
                    id="icons-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Menu Color:</label
                  ><input
                    type="color"
                    id="menu-color-picker"
                    class="color-picker-mdcm"
                    value="#000000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Line Color Preview:</label
                  ><input
                    type="color"
                    id="line-color-picker"
                    class="color-picker-mdcm"
                    value="#ff0000"
                  />
                </div>
              </div>
              <div class="option-mdcm">
                <div class="card-items-end">
                  <label>Time Color Preview:</label
                  ><input
                    type="color"
                    id="time-color-picker"
                    class="color-picker-mdcm"
                    value="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
	}
	function buildStatsTab() {
		return `
      <div id="stats" class="tab-content">
        <div class="stats-container" role="group" aria-label="Watch statistics">
          <div class="stat-card stat-card-wide">
            <div class="stat-card-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Total Usage Time</span>
              <span class="stat-value" id="total-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="usage-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#6366f1;--stat-bg:rgba(99,102,241,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">This Session</span>
              <span class="stat-value" id="session-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="session-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#22c55e;--stat-bg:rgba(34,197,94,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-play"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="video-label">Video Watch Time</span>
              <span class="stat-value" id="video-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="video-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#f59e0b;--stat-bg:rgba(245,158,11,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="shorts-label">Shorts Watch Time</span>
              <span class="stat-value" id="shorts-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="shorts-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#ec4899;--stat-bg:rgba(236,72,153,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Today</span>
              <span class="stat-value" id="today-time">0h 0m 0s</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" id="today-bar" style="width:0%"></div>
              </div>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#0ea5e9;--stat-bg:rgba(14,165,233,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-film"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Videos Watched</span>
              <span class="stat-value" id="videos-count">0</span>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#a855f7;--stat-bg:rgba(168,85,247,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-stopwatch"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label">Avg Watch Time</span>
              <span class="stat-value" id="avg-time">-</span>
            </div>
          </div>

          <div class="stat-card" style="--stat-accent:#fb923c;--stat-bg:rgba(251,146,60,0.14);">
            <div class="stat-card-icon">
              <i class="fas fa-fire"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="streak-label">No Streak</span>
              <span class="stat-value" id="streak-count">0</span>
            </div>
          </div>

          <div
            class="stat-card stat-card-wide"
            style="--stat-accent:#f97316;--stat-bg:rgba(249,115,22,0.14);"
          >
            <div class="stat-card-icon">
              <i class="fas fa-crown"></i>
            </div>
            <div class="stat-card-body">
              <span class="stat-label" id="most-label">Most Watched</span>
              <span class="stat-value stat-title" id="longest-title">-</span>
              <span class="stat-label stat-meta" id="longest-time">-</span>
            </div>
          </div>
        </div>

        <div class="section-header"><i class="fas fa-chart-column"></i> Weekly</div>
        <div id="weekly-chart"></div>

        <div class="section-header"><i class="fas fa-trophy"></i> Top Videos</div>
        <div id="top-videos-list"></div>

        <div class="panel-actions">
          <button
            id="exportStats"
            class="btn-mdcm btn-secondary"
            aria-label="Export statistics to clipboard"
          >
            <i class="fas fa-copy"></i> Export
          </button>
          <button
            id="resetStats"
            class="btn-mdcm btn-secondary danger"
            aria-label="Reset all statistics"
          >
            <i class="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>`;
	}
	function buildHeaderTab() {
		return `
      <div id="headers" class="tab-content">
        <div class="video-info-panel-mdcm" id="yt-video-info-panel">
          <div class="video-info-empty-mdcm" id="video-info-empty">
            Open a video to see live information here.
          </div>
          <div class="video-info-content-mdcm" id="video-info-content" style="display:none;">
            <div class="video-info-hero-mdcm">
              <img class="video-info-thumb-mdcm" id="video-info-thumb" alt="Video thumbnail" />
              <div>
                <h3 class="video-info-title-mdcm" id="video-info-title">-</h3>
                <p class="video-info-channel-mdcm" id="video-info-channel">-</p>
              </div>
            </div>
            <div class="video-info-grid-mdcm">
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Video ID</span
                ><span class="video-info-value-mdcm" id="video-info-id">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Status</span
                ><span class="video-info-value-mdcm" id="video-info-state">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Time</span
                ><span class="video-info-value-mdcm" id="video-info-time">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Quality</span
                ><span class="video-info-value-mdcm" id="video-info-quality">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Views</span
                ><span class="video-info-value-mdcm" id="video-info-views">-</span>
              </div>
              <div class="video-info-item-mdcm">
                <span class="video-info-label-mdcm">Published</span
                ><span class="video-info-value-mdcm" id="video-info-published">-</span>
              </div>
              <div class="video-info-progress-mdcm">
                <div class="video-info-progress-fill-mdcm" id="video-info-progress"></div>
              </div>
            </div>
            <div class="video-info-actions-mdcm">
              <button class="video-info-copy-mdcm" type="button" data-video-copy="url">
                <i class="fa-solid fa-link"></i> URL
              </button>
              <button class="video-info-copy-mdcm" type="button" data-video-copy="title">
                <i class="fa-solid fa-heading"></i> Title
              </button>
              <button class="video-info-copy-mdcm" type="button" data-video-copy="json">
                <i class="fa-solid fa-code"></i> JSON
              </button>
            </div>
          </div>
        </div>
      </div>`;
	}
	function buildMenuSettingsTab() {
		return `
      <div id="menu-settings" class="tab-content">
        <div class="options-mdcm"><h4 style="margin: 10px 0">Menu Appearance</h4></div>
        <div class="options-settings-mdcm">
          <div class="option-settings-mdcm">
            <label>Backgrounds:</label>
            <div class="color-boxes" id="bg-color-options">
              <div
                class="color-box"
                data-type="bg"
                data-value="#252525"
                style="background-color: #252525;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#1e1e1e"
                style="background-color: #1e1e1e;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#3a3a3a"
                style="background-color: #3a3a3a;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#4a4a4a"
                style="background-color: #4a4a4a;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#000000"
                style="background-color: #000000;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#00000000"
                style="background-color: transparent;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#2d2d2d"
                style="background-color: #2d2d2d;"
              ></div>
              <div
                class="color-box"
                data-type="bg"
                data-value="#444"
                style="background-color: #444;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Accent Colors:</label>
            <div class="color-boxes" id="bg-accent-color-options">
              <div
                class="color-box"
                data-type="accent"
                data-value="#ff0000"
                style="background-color: #ff0000;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#000000"
                style="background-color: #000000;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#009c37"
                style="background-color: #009c37;"
              ></div>
              <div
                class="color-box"
                data-type="accent"
                data-value="#0c02a0"
                style="background-color: #0c02a0;"
              ></div>
            </div>
          </div>
          <div class="option-settings-mdcm">
            <label>Titles Colors:</label>
            <div class="color-boxes" id="text-color-options">
              <div
                class="color-box"
                data-type="color"
                data-value="#ffffff"
                style="background-color: #ffffff;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#cccccc"
                style="background-color: #cccccc;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#b3b3b3"
                style="background-color: #b3b3b3;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#00ffff"
                style="background-color: #00ffff;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#00ff00"
                style="background-color: #00ff00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ffff00"
                style="background-color: #ffff00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ffcc00"
                style="background-color: #ffcc00;"
              ></div>
              <div
                class="color-box"
                data-type="color"
                data-value="#ff66cc"
                style="background-color: #ff66cc;"
              ></div>
            </div>
          </div>
        </div>
      </div>`;
	}
	var html = String.raw;
	function checkDarkModeActive() {
		if (isYTMusic$1) return "dark";
		const prefCookie = document.cookie.split("; ").find((c) => c.startsWith("PREF="));
		if (!prefCookie) return "light";
		const f6Value = new URLSearchParams(prefCookie.substring(5)).get("f6");
		return [
			"400",
			"4000000",
			"40000400",
			"40000000"
		].includes(f6Value) ? "dark" : "light";
	}
	function createSettingsPanel() {
		const panel = $cl("div");
		panel.id = "yt-enhancement-panel";
		panel.style.display = "none";
		const panelOverlay = $cl("div");
		panelOverlay.id = "panel-overlay";
		panelOverlay.style.display = "none";
		$ap(panelOverlay);
		const isDarkModeActive = checkDarkModeActive();
		const urlSharedCode = encodeURIComponent("https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js");
		let version = "2.4.4.2";
		try {
			if (typeof GM_info !== "undefined") version = GM_info.script.version;
		} catch {}
		setHTML(panel, html`
    <div class="container-mdcm">
      <div class="header-mdcm">
        <h1><i class="fa-brands fa-youtube"></i> YouTube Tools</h1>
        <div class="icons-mdcm">
          <a
            href="https://update.greasyfork.org/scripts/576162/YouTube%20Ultimate%20Tools.user.js"
            target="_blank"
          >
            <button class="icon-btn-mdcm"><i class="fa-solid fa-arrows-rotate"></i></button>
          </a>
          <a href="https://github.com/akari310" target="_blank">
            <button class="icon-btn-mdcm"><i class="fa-brands fa-github"></i></button>
          </a>
          <button class="icon-btn-mdcm" id="shareBtn-mdcm">
            <i class="fa-solid fa-share-alt"></i>
          </button>
          <button class="icon-btn-mdcm" id="importExportBtn">
            <i class="fa-solid fa-file-import"></i>
          </button>
          <button id="menu-settings-icon" class="icon-btn-mdcm tab-mdcm" data-tab="menu-settings">
            <i class="fa-solid fa-gear"></i>
          </button>
          <button class="icon-btn-mdcm close_menu_settings">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div class="tabs-mdcm">
        <button class="tab-mdcm active" data-tab="general">
          <i class="fa-solid fa-shield-halved"></i> General
        </button>
        <button class="tab-mdcm" data-tab="themes">
          <i class="fa-solid fa-palette"></i> Themes
        </button>
        <button class="tab-mdcm" data-tab="stats">
          <i class="fa-solid fa-square-poll-vertical"></i> Stats
        </button>
        <button class="tab-mdcm" data-tab="headers">
          <i class="fa-regular fa-newspaper"></i> Header
        </button>
      </div>

      ${buildGeneralTab(isYTMusic$1, languageOptionsHTML)}
      ${buildThemesTab(isDarkModeActive, themeOptionsHTML)} ${buildStatsTab()} ${buildHeaderTab()}
      ${buildMenuSettingsTab()}

      <div id="importExportArea">
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"
        >
          <h3>Import / Export Settings</h3>
          <button class="icon-btn-mdcm" id="closeImportExportBtn">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <textarea id="config-data" placeholder="Paste configuration here to import"></textarea>
        <div class="action-buttons-mdcm">
          <button id="export-config" class="action-btn-mdcm">Export</button>
          <button id="import-config" class="action-btn-mdcm">Import</button>
        </div>
      </div>

      <div id="shareDropdown">
        <a
          href="https://www.facebook.com/sharer/sharer.php?u=${urlSharedCode}"
          target="_blank"
          data-network="facebook"
          class="share-link"
          ><i class="fa-brands fa-facebook"></i> Facebook</a
        ><br />
        <a
          href="https://twitter.com/intent/tweet?url=${urlSharedCode}"
          target="_blank"
          data-network="twitter"
          class="share-link"
          ><i class="fa-brands fa-twitter"></i> Twitter</a
        ><br />
        <a
          href="https://api.whatsapp.com/send?text=${urlSharedCode}"
          target="_blank"
          data-network="whatsapp"
          class="share-link"
          ><i class="fa-brands fa-whatsapp"></i> WhatsApp</a
        ><br />
        <a
          href="https://www.linkedin.com/sharing/share-offsite/?url=${urlSharedCode}"
          target="_blank"
          data-network="linkedin"
          class="share-link"
          ><i class="fa-brands fa-linkedin"></i> LinkedIn</a
        ><br />
      </div>
    </div>
    <div class="actions-mdcm">
      <div class="developer-mdcm">
        <div
          style="font-size: 11px; opacity: 0.9; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; line-height: 1.6;"
        >
          Developed by
          <a
            href="https://github.com/akari310"
            target="_blank"
            style="color: #ff4444; text-decoration: none;"
            ><i class="fa-brands fa-github"></i> Akari</a
          >. Base by
          <a
            href="https://github.com/DeveloperMDCM"
            target="_blank"
            style="color: #00aaff; text-decoration: none;"
            ><i class="fa-brands fa-github"></i> MDCM</a
          >.
        </div>
      </div>
      <span style="color: #fff">v${version}</span>
    </div>
  `);
		$ap(panel);
		return {
			panel,
			panelOverlay
		};
	}
	function createSvgIcon(pathsData, size) {
		const sz = size || 24;
		const svgNS = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(svgNS, "svg");
		svg.setAttribute("width", String(sz));
		svg.setAttribute("height", String(sz));
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("stroke-width", "2");
		svg.setAttribute("stroke", "currentColor");
		svg.setAttribute("fill", "none");
		svg.setAttribute("stroke-linecap", "round");
		svg.setAttribute("stroke-linejoin", "round");
		pathsData.forEach((d) => {
			const p = document.createElementNS(svgNS, "path");
			p.setAttribute("d", d);
			if (d === "M0 0h24v24H0z") p.setAttribute("fill", "none");
			svg.appendChild(p);
		});
		return svg;
	}
	function makeToolBtn(title, id, className, paths) {
		const btn = document.createElement("button");
		btn.title = title;
		btn.type = "button";
		if (id) btn.id = id;
		btn.className = (className ? className + " " : "") + "botones_div";
		btn.appendChild(createSvgIcon(paths));
		return btn;
	}
	function buildDownloadContainer(id, type) {
		const container = document.createElement("div");
		container.id = id;
		container.className = `download-container ${type === "audio" ? "ocultarframeaudio" : "ocultarframe"}`;
		container.dataset.type = type;
		const progRetryBtn = document.createElement("button");
		progRetryBtn.type = "button";
		progRetryBtn.className = "progress-retry-btn";
		progRetryBtn.title = "Hủy và thử lại";
		progRetryBtn.style.display = "none";
		progRetryBtn.textContent = "↻";
		const dlAgainBtn = document.createElement("button");
		dlAgainBtn.type = "button";
		dlAgainBtn.className = "download-again-btn";
		dlAgainBtn.title = "Mở lại link tải";
		dlAgainBtn.style.display = "none";
		dlAgainBtn.textContent = "⬇";
		const dlInfo = document.createElement("div");
		dlInfo.className = "download-info";
		const dlKind = document.createElement("span");
		dlKind.className = "download-kind";
		dlKind.textContent = type === "audio" ? "AUDIO" : "VIDEO";
		const dlCopy = document.createElement("div");
		dlCopy.className = "download-copy";
		const dlText = document.createElement("span");
		dlText.className = "download-text";
		dlText.textContent = type === "audio" ? "Tải nhạc từ video này" : "Tải video này";
		const dlProvider = document.createElement("span");
		dlProvider.className = "download-provider";
		dlProvider.textContent = "Provider: auto";
		const dlQuality = document.createElement("span");
		dlQuality.className = "download-quality";
		dlQuality.textContent = "Chưa chọn";
		dlCopy.appendChild(dlText);
		dlCopy.appendChild(dlProvider);
		dlInfo.appendChild(dlKind);
		dlInfo.appendChild(dlCopy);
		dlInfo.appendChild(dlQuality);
		const dlActions = document.createElement("div");
		dlActions.className = "download-actions";
		const dlBtn = document.createElement("button");
		dlBtn.type = "button";
		dlBtn.className = `download-btn ${type}-btn`;
		dlBtn.textContent = type === "audio" ? "Tải nhạc" : "Tải video";
		const retryBtn = document.createElement("button");
		retryBtn.type = "button";
		retryBtn.className = "retry-btn";
		retryBtn.style.display = "none";
		retryBtn.textContent = "Thử lại";
		dlActions.appendChild(dlBtn);
		dlActions.appendChild(retryBtn);
		const progressC = document.createElement("div");
		progressC.className = "progress-container";
		progressC.style.display = "none";
		const progressBar = document.createElement("div");
		progressBar.className = "progress-bar";
		const progressFill = document.createElement("div");
		progressFill.className = "progress-fill";
		progressBar.appendChild(progressFill);
		const progressText = document.createElement("span");
		progressText.className = "progress-text";
		progressText.textContent = "0%";
		progressC.appendChild(progressBar);
		progressC.appendChild(progressText);
		const statusText = document.createElement("div");
		statusText.className = "download-status-text";
		statusText.textContent = "";
		container.appendChild(progRetryBtn);
		container.appendChild(dlAgainBtn);
		container.appendChild(dlInfo);
		container.appendChild(dlActions);
		container.appendChild(progressC);
		container.appendChild(statusText);
		return container;
	}
	var validoBotones = true;
	function buildToolbar() {
		const main = document.createElement("main");
		main.className = "yt-tools-container";
		const container = document.createElement("div");
		container.className = "yt-tools-inner-container";
		const form = document.createElement("form");
		form.className = "yt-tools-form";
		const btnsDiv = document.createElement("div");
		btnsDiv.className = "containerButtons";
		btnsDiv.appendChild(makeToolBtn("Image video", "imagen", "", [
			"M0 0h24v24H0z",
			"M15 8h.01",
			"M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5",
			"M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4",
			"M14 14l1 -1c.653 -.629 1.413 -.815 2.13 -.559",
			"M19 16v6",
			"M22 19l-3 3l-3 -3"
		]));
		if (!isYTMusic$1) btnsDiv.appendChild(makeToolBtn("Repeat video", "repeatvideo", "", [
			"M0 0h24v24H0z",
			"M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3",
			"M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"
		]));
		if (!isYTMusic$1) {
			const addBmBtn = makeToolBtn("Add bookmark", "yt-bookmark-add", "", [
				"M0 0h24v24H0z",
				"M7 4h10a2 2 0 0 1 2 2v14l-7 -4l-7 4v-14a2 2 0 0 1 2 -2z",
				"M12 7v6",
				"M9 10h6"
			]);
			addBmBtn.style.display = "none";
			btnsDiv.appendChild(addBmBtn);
			const toggleBmBtn = makeToolBtn("Show bookmarks", "yt-bookmark-toggle", "", [
				"M0 0h24v24H0z",
				"M9 6h11",
				"M9 12h11",
				"M9 18h11",
				"M5 6h.01",
				"M5 12h.01",
				"M5 18h.01"
			]);
			toggleBmBtn.style.display = "none";
			btnsDiv.appendChild(toggleBmBtn);
			const historyBtn = makeToolBtn("History", "yt-cw-history-toggle", "", [
				"M0 0h24v24H0z",
				"M12 8v4l3 3",
				"M3 12a9 9 0 1 0 3 -6.7",
				"M3 4v4h4"
			]);
			historyBtn.style.display = "none";
			btnsDiv.appendChild(historyBtn);
		}
		btnsDiv.appendChild(makeToolBtn("MP4", null, "btn1", [
			"M0 0h24v24H0z",
			"M14 3v4a1 1 0 0 0 1 1h4",
			"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",
			"M12 17v-6",
			"M9.5 14.5l2.5 2.5l2.5 -2.5"
		]));
		btnsDiv.appendChild(makeToolBtn("MP3", null, "btn2", [
			"M0 0h24v24H0z",
			"M14 3v4a1 1 0 0 0 1 1h4",
			"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",
			"M11 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
			"M12 16l0 -5l2 1"
		]));
		btnsDiv.appendChild(makeToolBtn("Picture to picture", null, "video_picture_to_picture", [
			"M0 0h24v24H0z",
			"M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4",
			"M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z"
		]));
		btnsDiv.appendChild(makeToolBtn("Screenshot video", null, "screenshot_video", [
			"M0 0h24v24H0z",
			"M15 8h.01",
			"M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644",
			"M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644",
			"M4 8v-2a2 2 0 0 1 2 -2h2",
			"M4 16v2a2 2 0 0 0 2 2h2",
			"M16 4h2a2 2 0 0 1 2 2v2",
			"M16 20h2a2 2 0 0 0 2 -2v-2"
		]));
		form.appendChild(btnsDiv);
		if (!isYTMusic$1) {
			const bookmarksPanel = document.createElement("div");
			bookmarksPanel.id = "yt-bookmarks-panel";
			bookmarksPanel.className = "yt-bookmarks-panel";
			bookmarksPanel.style.display = "none";
			form.appendChild(bookmarksPanel);
			const historyPanel = document.createElement("div");
			historyPanel.id = "yt-continue-watching-panel";
			historyPanel.className = "yt-continue-watching-panel";
			historyPanel.style.display = "none";
			form.appendChild(historyPanel);
		}
		const syncDownloadChoice = (select, dlContainer) => {
			const value = select.value;
			dlContainer.dataset.quality = value;
			const quality = dlContainer.querySelector(".download-quality");
			if (quality) quality.textContent = value ? {
				mp3: "MP3 320",
				best: "Original",
				opus: "OPUS",
				ogg: "OGG",
				wav: "WAV",
				webm: "WEBM",
				"4k": "4K",
				"8k": "8K"
			}[value] || select.selectedOptions[0]?.textContent || value : "Chưa chọn";
		};
		const applySavedSelectValue = (select, storageKey, fallbackValue = "") => {
			const savedValue = String(gmRawGet(storageKey, fallbackValue) || fallbackValue);
			if (Array.from(select.options).some((option) => option.value === savedValue)) select.value = savedValue;
			else if (fallbackValue) select.value = fallbackValue;
		};
		const saveSelectValue = (select, storageKey) => {
			if (select.value) gmRawSet(storageKey, select.value);
		};
		const videoForm = document.createElement("form");
		videoForm.className = "formulariodescarga ocultarframe";
		const videoSelectDiv = document.createElement("div");
		videoSelectDiv.className = "containerall";
		const videoSelect = document.createElement("select");
		videoSelect.className = "selectcalidades";
		videoSelect.required = true;
		[
			[
				"",
				"Chọn chất lượng video",
				true
			],
			["144", "144p MP4"],
			["240", "240p MP4"],
			["360", "360p MP4"],
			["480", "480p MP4"],
			["720", "720p HD MP4"],
			["1080", "1080p Full HD MP4"],
			["1440", "1440p 2K WEBM"],
			["4k", "2160p 4K WEBM"],
			["8k", "4320p 8K WEBM"]
		].forEach(([val, text, dis]) => {
			const opt = document.createElement("option");
			opt.value = val;
			opt.textContent = text;
			if (dis) {
				opt.selected = true;
				opt.disabled = true;
			}
			videoSelect.appendChild(opt);
		});
		videoSelectDiv.appendChild(videoSelect);
		const dlVideoContainer = buildDownloadContainer("descargando", "video");
		applySavedSelectValue(videoSelect, STORAGE_KEYS.DOWNLOAD_VIDEO_QUALITY);
		videoSelect.addEventListener("change", () => {
			syncDownloadChoice(videoSelect, dlVideoContainer);
			saveSelectValue(videoSelect, STORAGE_KEYS.DOWNLOAD_VIDEO_QUALITY);
		});
		syncDownloadChoice(videoSelect, dlVideoContainer);
		videoSelectDiv.appendChild(dlVideoContainer);
		videoForm.appendChild(videoSelectDiv);
		const audioForm = document.createElement("form");
		audioForm.className = "formulariodescargaaudio ocultarframeaudio";
		const audioSelectDiv = document.createElement("div");
		audioSelectDiv.className = "containerall";
		const audioSelect = document.createElement("select");
		audioSelect.className = "selectcalidadesaudio";
		audioSelect.required = true;
		[
			[
				"",
				"Chọn định dạng nhạc",
				true
			],
			["mp3", "MP3 320 kbps (khuyên dùng)"],
			["best", "Original audio (giữ codec gốc)"],
			["opus", "OPUS chất lượng cao"],
			["ogg", "OGG chất lượng cao"],
			["wav", "WAV không nén"],
			["webm", "WEBM nguồn YouTube"]
		].forEach(([val, text, dis]) => {
			const opt = document.createElement("option");
			opt.value = val;
			opt.textContent = text;
			if (dis) {
				opt.selected = true;
				opt.disabled = true;
			}
			audioSelect.appendChild(opt);
		});
		applySavedSelectValue(audioSelect, STORAGE_KEYS.DOWNLOAD_AUDIO_FORMAT, "mp3");
		audioSelectDiv.appendChild(audioSelect);
		const dlAudioContainer = buildDownloadContainer("descargandomp3", "audio");
		audioSelect.addEventListener("change", () => {
			syncDownloadChoice(audioSelect, dlAudioContainer);
			saveSelectValue(audioSelect, STORAGE_KEYS.DOWNLOAD_AUDIO_FORMAT);
		});
		syncDownloadChoice(audioSelect, dlAudioContainer);
		audioSelectDiv.appendChild(dlAudioContainer);
		audioForm.appendChild(audioSelectDiv);
		const collapsible = document.createElement("div");
		collapsible.className = "content_collapsible_colors";
		collapsible.style.marginTop = "2px";
		collapsible.appendChild(videoForm);
		collapsible.appendChild(audioForm);
		container.appendChild(form);
		container.appendChild(collapsible);
		main.appendChild(container);
		const btn1 = main.querySelector(".btn1");
		const btn2 = main.querySelector(".btn2");
		if (btn1) btn1.addEventListener("click", () => {
			videoForm.classList.toggle("ocultarframe");
			audioForm.classList.add("ocultarframeaudio");
		});
		if (btn2) btn2.addEventListener("click", () => {
			audioForm.classList.toggle("ocultarframeaudio");
			videoForm.classList.add("ocultarframe");
		});
		const pipBtn = main.querySelector(".video_picture_to_picture");
		if (pipBtn) pipBtn.addEventListener("click", () => {
			const video = document.querySelector("video");
			if (!video) {
				console.warn("[YT Tools] No video element found for PiP");
				return;
			}
			try {
				if (document.pictureInPictureElement) document.exitPictureInPicture();
				else if (document.pictureInPictureEnabled) video.requestPictureInPicture();
			} catch (e) {
				console.warn("[YT Tools] PiP failed:", e);
			}
		});
		const imgBtn = main.querySelector("#imagen");
		if (imgBtn) imgBtn.addEventListener("click", () => {
			const videoId = new URLSearchParams(window.location.search).get("v");
			if (!videoId) {
				console.warn("[YT Tools] No video ID found for thumbnail");
				return;
			}
			const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
			try {
				const a = document.createElement("a");
				a.href = url;
				a.target = "_blank";
				a.download = `${videoId}.jpg`;
				a.rel = "noopener noreferrer";
				a.style.display = "none";
				document.body.appendChild(a);
				a.click();
				a.remove();
			} catch (e) {
				console.warn("[YT Tools] Thumbnail download failed:", e);
				window.open(url);
			}
		});
		const repeatBtn = main.querySelector("#repeatvideo");
		if (repeatBtn) repeatBtn.addEventListener("click", (e) => {
			e.preventDefault();
			const video = document.querySelector("video");
			if (!video) {
				Notify("warning", "No video element found");
				return;
			}
			video.loop = !video.loop;
			repeatBtn.style.color = video.loop ? "var(--yt-spec-static-brand-red, #ff0000)" : "";
			Notify("info", video.loop ? "Repeat ON" : "Repeat OFF");
		});
		const screenshotBtn = main.querySelector(".screenshot_video");
		if (screenshotBtn) screenshotBtn.addEventListener("click", () => {
			const video = document.querySelector("video");
			if (!video) {
				console.warn("[YT Tools] No video element found for screenshot");
				return;
			}
			try {
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `screenshot-${Date.now()}.png`;
					a.style.display = "none";
					document.body.appendChild(a);
					a.click();
					a.remove();
					URL.revokeObjectURL(url);
				}, "image/png");
			} catch (e) {
				console.warn("[YT Tools] Screenshot failed:", e);
			}
		});
		return main;
	}
	function renderizarButtons() {
		const existing = document.querySelector(".yt-tools-container");
		if (existing) {
			if (isYTMusic$1) {
				if (existing.closest("#side-panel")) return;
			} else {
				const anchor = document.querySelector(".style-scope.ytd-watch-metadata");
				if (anchor && existing.parentNode === anchor.parentNode) return;
			}
			try {
				existing.remove();
			} catch {}
		}
		if (isYTMusic$1) {
			const sidePanel = document.querySelector("#player-page #side-panel");
			const addButton = sidePanel && sidePanel.querySelector(".tab-header-container") || document.querySelector("#tab-renderer");
			if (!addButton && validoBotones) {
				if (!renderizarButtons._ytmRetries) renderizarButtons._ytmRetries = 0;
				if (renderizarButtons._ytmRetries < 30) {
					renderizarButtons._ytmRetries++;
					setTimeout(renderizarButtons, 500);
				}
				return;
			}
			renderizarButtons._ytmRetries = 0;
			if (addButton && validoBotones) {
				validoBotones = false;
				const sp = document.querySelector("ytmusic-player-page #side-panel");
				if (sp) {
					let sideWrapper = $id("ytm-side-panel-wrapper");
					if (!sideWrapper) {
						sideWrapper = document.createElement("div");
						sideWrapper.id = "ytm-side-panel-wrapper";
						sp.insertBefore(sideWrapper, addButton);
					}
					const toolbar = buildToolbar();
					sideWrapper.appendChild(toolbar);
					const line = document.createElement("div");
					setTimeout(() => {
						try {
							window.dispatchEvent(new CustomEvent("yt-tools-toolbar-ready"));
						} catch {}
					}, 0);
					line.className = "ytm-side-panel-divider";
					sideWrapper.appendChild(line);
					sideWrapper.appendChild(addButton);
				}
			}
		} else {
			const addButton = document.querySelector(".style-scope .ytd-watch-metadata");
			const addButton2 = document.querySelector("#contents");
			if (!addButton) {
				if (!renderizarButtons._ytRetries) renderizarButtons._ytRetries = 0;
				if (renderizarButtons._ytRetries < 30) {
					renderizarButtons._ytRetries++;
					setTimeout(renderizarButtons, 500);
				}
				return;
			}
			renderizarButtons._ytRetries = 0;
			if (addButton) {
				if (addButton.offsetParent !== null || addButton2) {
					const toolbar = buildToolbar();
					addButton.parentNode.insertBefore(toolbar, addButton);
					setTimeout(() => {
						try {
							window.dispatchEvent(new CustomEvent("yt-tools-toolbar-ready"));
						} catch {}
					}, 0);
				}
			}
		}
	}
	function applyPageBackground(url, themeColor = null) {
		const selector = isYTMusic$1 ? "body, ytmusic-app" : "ytd-app, body";
		const styleId = "yt-tools-page-background";
		let styleEl = $id(styleId);
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		if (url) styleEl.textContent = `
${selector} {
  background: transparent !important;
  background-color: transparent !important;
}

/* Layer 1: Blurred Background Image */
body::before {
  content: "" !important;
  position: fixed !important;
  top: -10px !important;
  left: -10px !important;
  width: calc(100% + 20px) !important;
  height: calc(100% + 20px) !important;
  background-image: url("${url}") !important;
  background-size: cover !important;
  background-position: center !important;
  background-attachment: fixed !important;
  background-repeat: no-repeat !important;
  filter: blur(8px) brightness(0.8) !important;
  z-index: -3 !important;
  pointer-events: none !important;
}

/* Layer 2: Theme Overlay (Semi-transparent) */
body::after {
  content: "" !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: ${themeColor || "rgba(0,0,0,0.5)"} !important;
  opacity: ${themeColor ? "0.4" : "0.6"} !important;
  z-index: -2 !important;
  pointer-events: none !important;
}

${isYTMusic$1 ? `
/* YTM: Elevate content above blur layers */
ytmusic-app {
  /* Removed z-index to prevent stacking context trap for dialogs */
  position: relative !important;
}
` : ""}

${!isYTMusic$1 ? `
/* YouTube: Navbar transparency */
#masthead-container.ytd-app,
#background.ytd-masthead,
#masthead-positioner,
ytd-masthead,
#header.ytd-app,
#top-chips.ytd-app,
ytd-topbar-masthead-renderer,
#masthead-container.ytd-app #background,
#masthead-positioner.ytd-app {
  background: transparent !important;
  background-color: transparent !important;
}

/* YouTube: Sidebar transparency */
#guide.ytd-app,
#guide-inner.ytd-app,
ytd-guide-renderer,
#guide-content.ytd-app,
#guide-wrapper.ytd-app,
#secondary.ytd-watch-flexy,
#secondary-inner.ytd-watch-flexy,
ytd-watch-flexy #secondary,
ytd-watch-flexy #secondary-inner,
#related.ytd-watch-flexy,
#secondary.ytd-watch-flexy #related {
  background: transparent !important;
  background-color: transparent !important;
}
` : ""}

#content.ytmusic-app,
#page-manager.ytd-app,
#columns.ytd-watch-flexy,
ytd-browse,
ytmusic-browse-response,
ytmusic-section-list-renderer,
ytmusic-shelf-renderer,
ytmusic-grid-renderer,
ytmusic-player-page,
ytmusic-app-layout,
ytmusic-guide-renderer,
tp-yt-app-drawer,
tp-yt-app-drawer #contentContainer,
tp-yt-app-drawer #contentContainer.tp-yt-app-drawer,
#mini-guide,
#mini-guide-renderer,
#guide-wrapper,
#guide-content,
#guide-spacer,
#guide-renderer,
#sections.ytmusic-guide-renderer,
ytmusic-guide-section-renderer,
ytmusic-guide-entry-renderer,
tp-yt-paper-item.ytmusic-guide-entry-renderer,
#items.ytmusic-guide-section-renderer,
#divider.ytmusic-guide-section-renderer,
ytmusic-app-layout.content-scrolled,
ytmusic-app-layout #background,
ytmusic-app-layout #guide-background,
ytmusic-app-layout #player-bar-background,
ytmusic-app-layout #nav-bar-background,
#contents.ytmusic-section-list-renderer,
#header.ytmusic-browse-response,
#guide-wrapper.ytmusic-guide-renderer,
ytmusic-responsive-header-renderer,
.background-gradient.ytmusic-browse-response,
#content-wrapper.ytmusic-browse-response,
ytmusic-carousel-shelf-renderer,
.ytmusic-shelf,
ytmusic-chip-cloud-renderer,
ytmusic-carousel-shelf-basic-header-renderer,
ytmusic-header-renderer,
ytmusic-tabbed-browse-renderer,
ytmusic-detail-header-renderer,
ytmusic-item-section-renderer,
ytmusic-immersive-header-renderer,
ytmusic-card-shelf-renderer {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  --ytmusic-background: transparent !important;
  --ytmusic-general-background: transparent !important;
  --ytmusic-guide-background: transparent !important;
  --iron-drawer-background-color: transparent !important;
  --yt-spec-general-background-a: transparent !important;
  --yt-spec-general-background-b: transparent !important;
  --yt-spec-general-background-c: transparent !important;
  --yt-spec-menu-background: transparent !important;
}

${isYTMusic$1 ? `
/* YTM Nav Bar: transparent at top, dark blurred when scrolled */
body.ytm-style-transparent #nav-bar-background.ytmusic-app-layout,
body.ytm-ambient-active #nav-bar-background.ytmusic-app-layout {
  background: transparent !important;
  transition: background 0.3s ease, backdrop-filter 0.3s ease !important;
}

body.ytm-style-transparent ytmusic-nav-bar,
body.ytm-ambient-active ytmusic-nav-bar,
body.ytm-style-transparent #nav-bar-divider,
body.ytm-ambient-active #nav-bar-divider {
  background: transparent !important;
  border: none !important;
  transition: background 0.3s ease !important;
}

body.ytm-style-transparent ytmusic-nav-bar.scrolled,
body.ytm-ambient-active ytmusic-nav-bar.scrolled,
body.ytm-style-transparent #nav-bar-background.scrolled,
body.ytm-ambient-active #nav-bar-background.scrolled,
body.ytm-style-transparent ytmusic-nav-bar[opened],
body.ytm-ambient-active ytmusic-nav-bar[opened],
body.ytm-style-transparent[player-page-open] ytmusic-nav-bar,
body.ytm-ambient-active[player-page-open] ytmusic-nav-bar,
body.ytm-style-transparent[player-page-open] #nav-bar-background,
body.ytm-ambient-active[player-page-open] #nav-bar-background {
  background: rgba(10, 10, 10, 0.4) !important;
  backdrop-filter: blur(25px) !important;
  -webkit-backdrop-filter: blur(25px) !important;
}

body.ytm-ambient-active[player-page-open] ytmusic-nav-bar,
body.ytm-ambient-active[player-page-open] #nav-bar-background {
  background: transparent !important;
}

/* YTM Player Bar: semi-transparent with blur - respect ambient */
body.ytm-style-transparent ytmusic-player-bar,
body.ytm-ambient-active ytmusic-player-bar {
  background: rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(30px) !important;
  -webkit-backdrop-filter: blur(30px) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

body.ytm-ambient-active ytmusic-player-bar {
  background: transparent !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* YTM Sidebar (Expanded & Collapsed): Glass with separator line - respect ambient */
body.ytm-style-transparent ytmusic-guide-renderer,
body.ytm-style-transparent #guide-renderer,
body.ytm-style-transparent tp-yt-app-drawer #contentContainer,
body.ytm-style-transparent #mini-guide,
body.ytm-style-transparent #mini-guide-renderer,
body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
body.ytm-ambient-active #mini-guide,
body.ytm-ambient-active #mini-guide-renderer {
  background: rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(25px) !important;
  -webkit-backdrop-filter: blur(25px) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

body.ytm-ambient-active ytmusic-guide-renderer,
body.ytm-ambient-active #guide-renderer {
  background: transparent !important;
}

body.ytm-ambient-active tp-yt-app-drawer #contentContainer,
body.ytm-ambient-active #mini-guide,
body.ytm-ambient-active #mini-guide-renderer {
  background: transparent !important;
}

/* Standardized YTM Glass Buttons (Edit, Menu, Play, etc.) */
body.ytm-style-transparent button.ytSpecButtonShapeNextHost,
body.ytm-style-transparent yt-button-shape button,
body.ytm-style-transparent .history-button #button,
body.ytm-ambient-active button.ytSpecButtonShapeNextHost,
body.ytm-ambient-active yt-button-shape button,
body.ytm-ambient-active .history-button #button {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  color: #fff !important;
}

/* Clean Guide Button */
yt-icon-button#guide-button,
yt-icon-button#guide-button *,
#guide-button,
#guide-button #button,
#guide-button #interaction,
#guide-button yt-icon,
#guide-button .yt-interaction,
#guide-button .stroke.yt-interaction,
#guide-button .fill.yt-interaction {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
  --yt-spec-touch-response: transparent !important;
  --yt-spec-touch-response-inverse: transparent !important;
  --yt-sys-color-baseline--touch-response-inverse: transparent !important;
}

/* Play button specific fixes */
ytmusic-play-button-renderer {
  background: transparent !important;
  --ytmusic-play-button-background-color: transparent !important;
  --ytmusic-play-button-active-background-color: rgba(255, 255, 255, 0.25) !important;
}

ytmusic-play-button-renderer .content-wrapper {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  border-radius: 50% !important;
  box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
}

ytmusic-play-button-renderer:hover .content-wrapper {
  background: rgba(255, 255, 255, 0.3) !important;
}

ytmusic-play-button-renderer yt-icon,
ytmusic-play-button-renderer #icon,
ytmusic-play-button-renderer .icon,
ytmusic-play-button-renderer .icon.ytmusic-play-button-renderer,
ytmusic-play-button-renderer yt-icon.ytmusic-play-button-renderer {
  background: transparent !important;
  background-color: transparent !important;
  color: #fff !important;
  --ytmusic-play-button-icon-color: #fff !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Ensure SVGs inside are visible */
ytmusic-play-button-renderer svg {
  fill: #fff !important;
}
` : ""}

/* Engagement panels: Solid on regular YT, but NOT on Shorts */
ytd-watch-flexy ytd-engagement-panel-section-list-renderer,
ytd-watch-flexy ytd-engagement-panel-section-list-renderer #content,
ytd-watch-flexy ytd-engagement-panel-section-list-renderer #header,
ytd-watch-flexy ytd-engagement-panel-title-header-renderer,
ytd-watch-flexy ytd-engagement-panel-title-header-renderer #header,
ytd-watch-flexy ytd-section-list-renderer[engagement-panel] {
  background: #212121 !important;
  background-color: #212121 !important;
}

/* Nuclear transparency for Shorts engagement panels to reveal theme background */
ytd-shorts #shorts-panel-container,
ytd-shorts #anchored-panel,
ytd-shorts ytd-engagement-panel-section-list-renderer,
ytd-shorts ytd-engagement-panel-section-list-renderer #content,
ytd-shorts ytd-engagement-panel-section-list-renderer #header,
/* Highly specific YouTube selectors identified during debugging */
ytd-shorts ytd-engagement-panel-section-list-renderer[match-content-theme] #content,
ytd-shorts ytd-engagement-panel-section-list-renderer[match-content-theme] #content.ytd-engagement-panel-section-list-renderer,
ytd-shorts ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] #content,
ytd-shorts ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] #header,
ytd-shorts ytd-engagement-panel-title-header-renderer,
ytd-shorts ytd-engagement-panel-title-header-renderer #header,
ytd-shorts ytd-comments-header-renderer,
ytd-shorts ytd-comment-thread-renderer,
ytd-shorts ytd-comment-view-model,
ytd-shorts ytd-item-section-renderer,
ytd-shorts #sections.ytd-item-section-renderer,
ytd-shorts #contents.ytd-item-section-renderer,
ytd-shorts ytd-comment-simplebox-renderer {
  background: transparent !important;
  background-color: transparent !important;
}

/* Search button - restore default YT gray */
ytd-searchbox #search-icon-legacy,
button.ytSearchboxComponentSearchButton,
button.ytSearchboxComponentSearchButtonDark {
  background-color: #222222 !important;
  border: none !important;
}

/* Voice search button - add blur backdrop for visibility */
#voice-search-button .ytSpecButtonShapeNextHost,
#voice-search-button button {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 50% !important;
}

/* Hide YTM native background elements when custom background is set */
body:not(.ytm-ambient-active) #mini-guide-background,
ytmusic-browse-response #background.immersive-background,
ytmusic-fullbleed-thumbnail-renderer[is-background],
ytmusic-player-page #background.immersive-background,
#background.ytmusic-browse-response {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* Hide Shorts cinematic black blocks */
#cinematic-container.ytd-reel-video-renderer,
#shorts-cinematic-container,
#cinematic-shorts-scrim.ytd-shorts {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

/* Remove dark gradient overlays from Shorts */
.overlay.ytd-reel-video-renderer,
ytd-reel-player-overlay-renderer,
ytd-reel-player-overlay-renderer #overlay,
.overlay-container.ytd-reel-player-overlay-renderer {
  background: transparent !important;
  background-image: none !important;
}
`;
		else styleEl.textContent = "";
	}
	function removePageBackground() {
		const styleEl = $id("yt-tools-page-background");
		if (styleEl) styleEl.textContent = "";
	}
	var selectedBgColor = "#252525";
	var selectedTextColor = "#ffffff";
	var selectedBgAccentColor = "#ff0000";
	function syncAudioOnlyTabCheckbox() {
		const tabToggle = $id("audio-only-tab-toggle");
		if (!tabToggle) return;
		const override = window.sessionStorage.getItem("ytToolsAudioOnlyTabOverrideMDCM");
		if (override === null) tabToggle.checked = !!readJsonGM(SETTINGS_KEY, {})?.audioOnly;
		else tabToggle.checked = override === "true";
	}
	function saveSettingsFromDOM() {
		const s = {
			...readJsonGM(SETTINGS_KEY, {}),
			theme: $e("input[name=\"theme\"]:checked")?.value || "0",
			bgColorPicker: $id("bg-color-picker")?.value || "#000000",
			progressbarColorPicker: $id("progressbar-color-picker")?.value || "#ff0000",
			primaryColorPicker: $id("primary-color-picker")?.value || "#ffffff",
			secondaryColorPicker: $id("secondary-color-picker")?.value || "#ffffff",
			headerColorPicker: $id("header-color-picker")?.value || "#000",
			iconsColorPicker: $id("icons-color-picker")?.value || "#ffffff",
			menuColorPicker: $id("menu-color-picker")?.value || "#000",
			lineColorPicker: $id("line-color-picker")?.value || "#ff0000",
			timeColorPicker: $id("time-color-picker")?.value || "#ffffff",
			dislikes: $id("dislikes-toggle")?.checked || false,
			likeDislikeBar: $id("like-dislike-bar-toggle")?.checked || false,
			bookmarks: $id("bookmarks-toggle")?.checked || false,
			continueWatching: $id("continue-watching-toggle")?.checked || false,
			shortsChannelName: $id("shorts-channel-name-toggle")?.checked || false,
			copyDescription: $id("copy-description-toggle") ? $id("copy-description-toggle").checked : true,
			nonstopPlayback: $id("nonstop-playback-toggle") ? $id("nonstop-playback-toggle").checked : false,
			audioOnly: $id("audio-only-toggle") ? $id("audio-only-toggle").checked : false,
			themes: $id("themes-toggle")?.checked || false,
			translateComments: $id("translation-toggle")?.checked || false,
			avatars: $id("avatars-toggle")?.checked || false,
			reverseMode: $id("reverse-mode-toggle")?.checked || false,
			waveVisualizer: $id("wave-visualizer-toggle")?.checked || false,
			waveVisualizerSelected: $id("select-wave-visualizer-select")?.value || "dinamica",
			hideComments: $id("hide-comments-toggle")?.checked || false,
			hideSidebar: $id("hide-sidebar-toggle")?.checked || false,
			disableAutoplay: $id("autoplay-toggle")?.checked || false,
			cinematicLighting: $id("cinematic-lighting-toggle")?.checked || false,
			syncCinematic: $id("sync-cinematic-toggle")?.checked || false,
			sidePanelStyle: $id("side-panel-style-select")?.value || "blur",
			playerSize: $id("player-size-slider")?.value || 100,
			selectVideoQuality: $id("select-video-qualitys-select")?.value || "user",
			languagesComments: $id("select-languages-comments-select")?.value || "vi",
			menu_akari: {
				bg: selectedBgColor,
				color: selectedTextColor,
				accent: selectedBgAccentColor
			}
		};
		gmRawSet(SETTINGS_KEY, JSON.stringify(s));
	}
	function getMenuColors() {
		return {
			bg: selectedBgColor,
			text: selectedTextColor,
			accent: selectedBgAccentColor
		};
	}
	function setMenuColor(type, value) {
		if (type === "bg") selectedBgColor = value;
		else if (type === "color") selectedTextColor = value;
		else if (type === "accent") selectedBgAccentColor = value;
	}
	function isWatchPage() {
		return window.location.href.includes("youtube.com/watch");
	}
	function applyYTMThemeVars(bgColor, textColor, secondaryText, menuBg, iconColor, raisedBg, progressColor, progressSecondary) {
		const hasBgImage = !!readJsonGM(SETTINGS_KEY, {}).backgroundImage;
		const bgT = hasBgImage ? "transparent" : bgColor;
		const menuBgT = hasBgImage ? "transparent" : menuBg || bgColor;
		const raisedT = hasBgImage ? "rgba(255,255,255,0.06)" : raisedBg || bgColor;
		const navT = hasBgImage ? "rgba(0,0,0,0.4)" : bgColor;
		$sp("--ytmusic-general-background", bgT);
		$sp("--ytmusic-background", bgT);
		$sp("--ytmusic-color-white1", textColor);
		$sp("--ytmusic-color-white2", secondaryText || textColor);
		$sp("--ytmusic-color-white3", secondaryText || textColor);
		$sp("--ytmusic-color-white4", secondaryText || textColor);
		$sp("--ytmusic-player-bar-background", raisedT);
		$sp("--ytmusic-nav-bar-background", navT);
		$sp("--ytmusic-search-background", menuBgT);
		$sp("--yt-spec-general-background-a", bgT);
		$sp("--yt-spec-general-background-b", bgT);
		$sp("--yt-spec-general-background-c", bgT);
		if (progressColor) {
			$sp("--paper-slider-active-color", progressColor);
			$sp("--paper-slider-knob-color", progressColor);
			$sp("--paper-progress-active-color", progressColor);
		}
		if (progressSecondary) {
			$sp("--paper-slider-secondary-color", progressSecondary);
			$sp("--paper-progress-secondary-color", progressSecondary);
		}
	}
	function initYTMHeaderScroll() {
		if (!isYTMusic$1 || window.__ytToolsYTMScrollInit) return;
		window.__ytToolsYTMScrollInit = true;
		const layoutEl = document.querySelector("#layout");
		if (!layoutEl) return;
		layoutEl.addEventListener("scroll", () => {
			const nav = document.querySelector("ytmusic-nav-bar");
			if (nav) if (layoutEl.scrollTop > 10) nav.classList.add("scrolled");
			else nav.classList.remove("scrolled");
		}, { passive: true });
	}
	function applySettings() {
		const f1 = $e(".formulariodescarga");
		const f2 = $e(".formulariodescargaaudio");
		if (f1) f1.classList.add("ocultarframe");
		if (f2) f2.classList.add("ocultarframeaudio");
		const settings = {
			theme: $e("input[name=\"theme\"]:checked")?.value || "0",
			bgColorPicker: $id("bg-color-picker")?.value || "#000000",
			progressbarColorPicker: $id("progressbar-color-picker")?.value || "#ff0000",
			primaryColorPicker: $id("primary-color-picker")?.value || "#ffffff",
			secondaryColorPicker: $id("secondary-color-picker")?.value || "#ffffff",
			headerColorPicker: $id("header-color-picker")?.value || "#000",
			iconsColorPicker: $id("icons-color-picker")?.value || "#ffffff",
			menuColorPicker: $id("menu-color-picker")?.value || "#000",
			lineColorPicker: $id("line-color-picker")?.value || "#ff0000",
			timeColorPicker: $id("time-color-picker")?.value || "#ffffff",
			dislikes: $id("dislikes-toggle")?.checked || false,
			likeDislikeBar: $id("like-dislike-bar-toggle")?.checked || false,
			bookmarks: $id("bookmarks-toggle")?.checked || false,
			continueWatching: $id("continue-watching-toggle")?.checked || false,
			shortsChannelName: $id("shorts-channel-name-toggle")?.checked || false,
			nonstopPlayback: $id("nonstop-playback-toggle")?.checked ?? false,
			audioOnly: $id("audio-only-toggle")?.checked || false,
			themes: $id("themes-toggle")?.checked || false,
			translateComments: $id("translation-toggle")?.checked || false,
			avatars: $id("avatars-toggle")?.checked || false,
			reverseMode: $id("reverse-mode-toggle")?.checked || false,
			waveVisualizer: $id("wave-visualizer-toggle")?.checked || false,
			hideComments: $id("hide-comments-toggle")?.checked || false,
			hideSidebar: $id("hide-sidebar-toggle")?.checked || false,
			disableAutoplay: $id("autoplay-toggle")?.checked || false,
			cinematicLighting: $id("cinematic-lighting-toggle")?.checked || false,
			syncCinematic: $id("sync-cinematic-toggle")?.checked || false,
			sidePanelStyle: $id("side-panel-style-select")?.value || "blur",
			playerSize: $id("player-size-slider")?.value || 100,
			selectVideoQuality: $id("select-video-qualitys-select")?.value || "user",
			menu_developermdcm: {
				bg: getMenuColors().bg,
				color: getMenuColors().text,
				accent: getMenuColors().accent
			}
		};
		const stored = readJsonGM(SETTINGS_KEY, {});
		if (stored.backgroundImage) settings.backgroundImage = stored.backgroundImage;
		settings.lockupStats = stored.lockupStats ?? true;
		$sp("--yt-enhance-menu-bg", getMenuColors().bg);
		$sp("--yt-enhance-menu-text", getMenuColors().text);
		$sp("--yt-enhance-menu-accent", getMenuColors().accent);
		renderizarButtons();
		applyNonstopPlayback(settings.nonstopPlayback);
		syncAudioOnlyTabCheckbox();
		applyAudioOnlyMode(getEffectiveAudioOnly(settings));
		if (isYTMusic$1) {
			document.body.classList.remove("ytm-style-blur", "ytm-style-liquid", "ytm-style-transparent");
			document.body.classList.add(`ytm-style-${settings.sidePanelStyle || "blur"}`);
		} else {
			document.body.classList.remove("yt-style-blur", "yt-style-liquid", "yt-style-transparent");
			document.body.classList.add(`yt-style-${settings.sidePanelStyle || "blur"}`);
		}
		if (!isYTMusic$1) {
			const cs = $id("comments");
			if (cs) cs.style.display = settings.hideComments ? "none" : "block";
		}
		const ts = $e(".themes-hidden");
		if (ts) ts.style.display = settings.themes ? "block" : "none";
		if (!isYTMusic$1) {
			const ss = $e("#secondary > #secondary-inner");
			if (ss) {
				ss.classList.add("side-moi");
				ss.style.display = settings.hideSidebar ? "none" : "block";
			}
		}
		if (!isYTMusic$1) {
			const at = $e(".ytp-autonav-toggle-button");
			if (at) {
				const on = at.getAttribute("aria-checked") === "true";
				if (settings.disableAutoplay && on) at.click();
				else if (!settings.disableAutoplay && !on) at.click();
			}
		}
		if (isYTMusic$1) if (settings.cinematicLighting && isWatchPage()) setTimeout(() => ytmAmbientMode.setup(), 800);
		else ytmAmbientMode.cleanup();
		const video = $e("video");
		if (video) {
			const pct = Math.max(50, Math.min(150, Number(settings.playerSize) || 100));
			video.style.transform = `scale(${pct / 100})`;
			video.style.transformOrigin = "center center";
		}
		const isDarkMode = checkDarkModeActive$1() ? "dark" : "light";
		const selectedTheme = THEMES[settings.theme] || THEMES[0] || {};
		const isThemeCustom = $e("input[name=\"theme\"][value=\"custom\"]")?.checked;
		const dynamicCssArray = [];
		const addCss = (css) => {
			if (css) dynamicCssArray.push(css);
		};
		const themeCustomOpts = $e(".theme-custom-options");
		const themeNormal = $e(".theme-selected-normal");
		const to = $e(".themes-options");
		const themesHidden = $e(".themes-hidden");
		if (themesHidden) themesHidden.style.display = settings.themes ? "block" : "none";
		if (isThemeCustom) {
			if (themeNormal) themeNormal.style.display = "flex";
			if (themeCustomOpts) themeCustomOpts.style.display = "flex";
			if (to) to.style.display = "none";
		} else {
			if (themeNormal) themeNormal.style.display = "none";
			if (themeCustomOpts) themeCustomOpts.style.display = "none";
			if (to) to.style.display = "block";
		}
		document.body.classList.add("transition-theme");
		setTimeout(() => document.body.classList.remove("transition-theme"), 400);
		if (settings.themes && isDarkMode === "dark" && !isThemeCustom) {
			$sp("--yt-spec-base-background", selectedTheme.gradient);
			$sp("--yt-spec-text-primary", selectedTheme.textColor);
			$sp("--yt-spec-text-secondary", selectedTheme.textColor);
			$sp("--yt-spec-menu-background", selectedTheme.gradient);
			$sp("--yt-spec-icon-inactive", selectedTheme.textColor);
			$sp("--yt-spec-raised-background", selectedTheme.raised);
			$sp("--yt-spec-static-brand-red", selectedTheme.CurrentProgressVideo);
			$sp("--yt-spec-brand-icon-active", selectedTheme.textColor);
			$sp("--yt-spec-brand-icon-inactive", selectedTheme.textColor + "80");
			$sp("--yt-spec-icon-active-other", selectedTheme.textColor);
			addCss(`#background.ytd-masthead { background: ${selectedTheme.gradient} !important; }`);
			addCss(`.ytp-swatch-background-color { background: ${selectedTheme.gradient} !important; }`);
			addCss(`.botones_div { background-color: transparent; border: none; color: #999 !important; user-select: none; }`);
			addCss(`ytd-shorts[is-shorts] #cinematics { display: none !important; }`);
			if (isYTMusic$1) {
				let sliderColor = selectedTheme.CurrentProgressVideo;
				const colors = selectedTheme.gradient?.match(/#[0-9a-fA-F]{3,6}/g);
				if (colors?.length) sliderColor = colors[colors.length - 1];
				applyYTMThemeVars(selectedTheme.gradient, selectedTheme.textColor, selectedTheme.textColor, selectedTheme.gradient, selectedTheme.colorIcons, selectedTheme.raised, sliderColor, sliderColor + "80");
				initYTMHeaderScroll();
			}
		} else if (settings.themes && isDarkMode === "dark" && isThemeCustom) {
			$sp("--yt-spec-base-background", settings.bgColorPicker);
			$sp("--yt-spec-text-primary", settings.primaryColorPicker);
			$sp("--yt-spec-text-secondary", settings.secondaryColorPicker);
			$sp("--yt-spec-menu-background", settings.menuColorPicker);
			$sp("--yt-spec-icon-inactive", settings.iconsColorPicker);
			$sp("--yt-spec-raised-background", settings.headerColorPicker);
			$sp("--yt-spec-static-brand-red", settings.lineColorPicker);
			$sp("--yt-spec-brand-icon-active", settings.primaryColorPicker);
			$sp("--yt-spec-brand-icon-inactive", settings.secondaryColorPicker);
			$sp("--yt-spec-icon-active-other", settings.iconsColorPicker);
			$sp("--ytd-searchbox-background", settings.menuColorPicker);
			$sp("--ytd-searchbox-text-color", settings.primaryColorPicker);
			$sp("--ytd-searchbox-border-color", settings.primaryColorPicker + "30");
			addCss(`.ytp-swatch-background-color { background: ${settings.progressbarColorPicker} !important; }`);
			addCss(`.botones_div { background-color: transparent; border: none; color: ${settings.iconsColorPicker} !important; user-select: none; }`);
			addCss(`ytd-shorts[is-shorts] #cinematics { display: none !important; }`);
			if (isYTMusic$1) {
				applyYTMThemeVars(settings.bgColorPicker, settings.primaryColorPicker, settings.secondaryColorPicker, settings.menuColorPicker, settings.iconsColorPicker, settings.headerColorPicker, settings.progressbarColorPicker, settings.progressbarColorPicker + "80");
				initYTMHeaderScroll();
			}
		} else if (!settings.themes) {
			[
				"--yt-spec-base-background",
				"--yt-spec-text-primary",
				"--yt-spec-text-secondary",
				"--yt-spec-menu-background",
				"--yt-spec-icon-inactive",
				"--yt-spec-raised-background",
				"--yt-spec-static-brand-red",
				"--yt-spec-static-brand-white",
				"--yt-spec-brand-icon-active",
				"--yt-spec-brand-icon-inactive",
				"--yt-spec-icon-active-other",
				"--ytd-searchbox-background",
				"--ytd-searchbox-text-color",
				"--ytd-searchbox-border-color",
				"--yt-enhance-menu-bg",
				"--yt-enhance-menu-text",
				"--yt-enhance-menu-accent"
			].forEach((p) => document.documentElement.style.removeProperty(p));
			addCss(`.botones_div { background-color: transparent; border: none; color: #ccc !important; user-select: none; }`);
			removePageBackground();
		}
		if (!isYTMusic$1) {
			if (settings.reverseMode) addCss(`#columns.style-scope.ytd-watch-flexy { flex-direction: row-reverse !important; padding-left: 20px !important; }`);
			if (settings.hideSidebar) addCss(`#secondary.style-scope.ytd-watch-flexy { display: none !important; }`);
		}
		addCss(`#icon-menu-settings { color: ${settings.iconsColorPicker || "#fff"} !important; }`);
		let waveColor = "#06b6d4";
		if (settings.themes && isDarkMode === "dark") {
			if (isThemeCustom) waveColor = settings.progressbarColorPicker || "#06b6d4";
			else if (selectedTheme) waveColor = selectedTheme.waveColor || "#06b6d4";
		}
		$sp("--yt-tools-wave-color", waveColor);
		if (settings.backgroundImage) {
			console.log("[YT Tools] Applying custom page background:", isYTMusic$1 ? "YouTube Music" : "YouTube");
			const themeColor = settings.themes && isDarkMode === "dark" && !isThemeCustom ? selectedTheme.gradient : null;
			applyPageBackground(settings.backgroundImage, themeColor);
		} else removePageBackground();
		applyAdvancedThemeCSS(selectedTheme, settings, addCss);
		if (!isYTMusic$1 && settings.themes && isDarkMode === "dark") {
			const sidebarBg = isThemeCustom ? settings.headerColorPicker || settings.bgColorPicker : selectedTheme.glassBg || selectedTheme.gradient;
			const sidebarBlur = isThemeCustom ? "24px" : selectedTheme.glassBlur || "24px";
			addCss(`
      ytd-guide-renderer,
      ytd-guide-renderer #guide-content,
      ytd-guide-renderer #guide-wrapper,
      ytd-guide-renderer #guide-inner-content,
      ytd-guide-renderer #sections,
      ytd-guide-renderer ytd-guide-section-renderer,
      ytd-guide-renderer #items,
      ytd-mini-guide-renderer,
      ytd-app > #header,
      ytd-app > #header ytd-topbar-logo-renderer,
      #secondary-inner {
        background: linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.75)), ${sidebarBg} !important;
        backdrop-filter: blur(${sidebarBlur}) saturate(1.2) !important;
        -webkit-backdrop-filter: blur(${sidebarBlur}) saturate(1.2) !important;
      }
      ytd-guide-entry-renderer,
      ytd-guide-collapsible-entry-renderer,
      ytd-guide-section-renderer #header {
        background: transparent !important;
      }
      ytd-guide-renderer #sections,
      ytd-guide-renderer #guide-inner-content {
        scrollbar-width: thin !important;
        overflow-y: overlay !important;
      }
    `);
		}
		setDynamicCss(dynamicCssArray.join("\n"));
		applyBookmarksIfEnabled(settings);
		setupContinueWatchingFeature(settings.continueWatching);
		if (!isYTMusic$1) {
			setupShortsChannelNameFeature(settings.shortsChannelName);
			setupLockupCachedStats(settings.lockupStats ?? stored.lockupStats ?? true);
		}
	}
	function applyAdvancedThemeCSS(selectedTheme, settings, addCss) {
		const hasBgImage = !!settings.backgroundImage;
		const isDarkMode = checkDarkModeActive$1() ? "dark" : "light";
		const hasCustomTheme = settings.themeCustom || $e("input[name=\"theme\"][value=\"custom\"]")?.checked;
		const shouldApplyTheme = settings.themes && isDarkMode === "dark";
		if (!isYTMusic$1) {
			if (hasBgImage) addCss(`
        ytd-app,
        #content.ytd-app,
        #page-manager.ytd-app,
        ytd-browse,
        ytd-watch-flexy,
        ytd-two-column-browse-results-renderer,
        #primary.ytd-two-column-browse-results-renderer,
        #secondary.ytd-two-column-browse-results-renderer,
        ytd-rich-grid-renderer,
        #contents.ytd-rich-grid-renderer,
        ytd-item-section-renderer,
        ytd-comments-header-renderer,
        ytd-comment-simplebox-renderer,
        ytd-comment-thread-renderer,
        ytd-comment-renderer,
        #header.ytd-item-section-renderer,
        #body.ytd-comment-renderer,
        #author-thumbnail.ytd-comment-simplebox-renderer,
        #cinematic-shorts-scrim.ytd-shorts,
        ytd-comment-view-model,
        ytd-comment-engagement-bar,
        ytd-comment-replies-renderer,
        #anchored-panel.ytd-shorts,
        #cinematic-container.ytd-reel-video-renderer,
        #shorts-cinematic-container,
        .short-video-container.ytd-reel-video-renderer,
        ytd-reel-video-renderer,
        .navigation-container.ytd-shorts,
        .navigation-button.ytd-shorts {
          background: transparent !important;
        }
      `);
			addCss(`
      /* Completely hide the cinematic glow in shorts if it's causing black blocks */
      #cinematic-container.ytd-reel-video-renderer,
      #shorts-cinematic-container,
      #cinematic-shorts-scrim.ytd-shorts {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }

      /* Revert chip bar to near-native but themed */
      #header.ytd-rich-grid-renderer,
      ytd-feed-filter-chip-bar-renderer,
      #chips-wrapper.ytd-feed-filter-chip-bar-renderer {
        background: transparent !important;
      }

      /* Improve Shorts Navigation: Center 'Next' button if it's the first Short */
      ytd-shorts[is-watch-while-mode] .navigation-container.ytd-shorts,
      .navigation-container.ytd-shorts {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 12px !important;
        height: 100% !important;
        top: 0 !important;
        bottom: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      .navigation-button.ytd-shorts {
        margin: 0 !important;
      }
      /* Ensure hidden buttons don't take up space in the flex container */
      #navigation-button-up[aria-hidden="true"],
      #navigation-button-up[aria-hidden=""],
      #navigation-button-up[hidden],
      #navigation-button-down[aria-hidden="true"],
      #navigation-button-down[aria-hidden=""],
      #navigation-button-down[hidden] {
        display: none !important;
      }
    `);
			const ytGradient = hasCustomTheme ? settings.bgColorPicker || "#0f0f0f" : selectedTheme.gradient || "";
			if (shouldApplyTheme && ytGradient) addCss(`
        /* Use theme colors on major components without breaking layout */
        #masthead-container.ytd-app,
        #background.ytd-masthead,
        ytd-masthead,
        #container.ytd-masthead,
        #masthead-container.ytd-app #masthead.ytd-masthead {
          background: ${ytGradient} !important;
        }

        /* Sidebar & Guide handled in main applySettings */

        /* Restore the 'frosted-glass' look but with the theme gradient */
        #frosted-glass.ytd-app {
          background: ${ytGradient} !important;
          opacity: 0.8 !important;
        }

        ytd-engagement-panel-section-list-renderer { 
          background: ${ytGradient} !important; 
          backdrop-filter: blur(12px) !important; 
        }
        ytd-engagement-panel-title-header-renderer[shorts-panel] #header.ytd-engagement-panel-title-header-renderer {
          background: ${ytGradient}  !important;
        }
      `);
			const ytAccent = hasCustomTheme ? settings.lineColorPicker || "#ff0000" : selectedTheme.btnTranslate || selectedTheme.accent || "rgba(255,255,255,0.1)";
			const ytTextColor = hasCustomTheme ? settings.primaryColorPicker || "#fff" : selectedTheme.textColor || "#fff";
			const ytIconColor = hasCustomTheme ? settings.iconsColorPicker || "#fff" : selectedTheme.colorIcons || selectedTheme.textColor || "#fff";
			const ytVideoDuration = hasCustomTheme ? settings.timeColorPicker || "#fff" : selectedTheme.videoDuration || selectedTheme.primary || "#fff";
			if (shouldApplyTheme) addCss(`
        .buttons-tranlate {
          background: ${ytAccent} !important;
        }
        .badge-shape-wiz--thumbnail-default {
          color: ${ytVideoDuration} !important;
          background: ${ytGradient || "rgba(0,0,0,0.6)"} !important;
        }
        #logo-icon {
          color: ${ytTextColor} !important;
        }
        .yt-spec-button-shape-next--overlay.yt-spec-button-shape-next--text {
          color: ${ytIconColor} !important;
        }
        .ytd-topbar-menu-button-renderer #button.ytd-topbar-menu-button-renderer {
          color: ${ytIconColor} !important;
        }
        .yt-spec-icon-badge-shape--style-overlay .yt-spec-icon-badge-shape__icon {
          color: ${ytIconColor} !important;
        }
        .ytp-svg-fill {
          fill: ${ytIconColor} !important;
        }
        #ytp-id-30,#ytp-id-17,#ytp-id-19,#ytp-id-20{
          fill: ${ytIconColor} !important;
        }
      `);
			console.log("[YT Tools] Advanced YouTube CSS applied");
		}
		if (isYTMusic$1) {
			const ytmSliderSolidColor = selectedTheme.progress || selectedTheme.accent || selectedTheme.CurrentProgressVideo || "#ff0000";
			const ytmBgGradient = hasCustomTheme ? settings.bgColorPicker || "#030303" : selectedTheme.gradient || "#030303";
			const ytmGlassBg = hasCustomTheme ? settings.headerColorPicker || settings.bgColorPicker || "#030303" : selectedTheme.glassBg || selectedTheme.gradient || "#030303";
			const ytmGlassBlur = hasCustomTheme ? "24px" : selectedTheme.glassBlur || "24px";
			const bgOrGradient = shouldApplyTheme ? ytmBgGradient : hasBgImage ? "transparent" : "#030303";
			addCss(`
      html, body, ytmusic-app {
        background-color: ${hasBgImage ? "transparent" : "#030303"} !important;
        background-image: ${hasBgImage ? "none" : bgOrGradient} !important;
        background-size: cover !important;
        background-position: center !important;
        background-attachment: fixed !important;
      }
      ytmusic-player-bar {
        background: ${hasBgImage ? "transparent" : bgOrGradient} !important;
        ${hasBgImage && shouldApplyTheme ? "backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;" : ""}
      }
      ytmusic-nav-bar {
        background: ${shouldApplyTheme ? ytmBgGradient : "transparent"} !important;
        ${hasBgImage && shouldApplyTheme ? "backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;" : ""}
        transition: background 0.4s ease-in-out !important;
      }
      ytmusic-search-box #input-box { background: ${shouldApplyTheme ? ytmBgGradient : "transparent"} !important; }
      
      ytmusic-browse-response,
      ytmusic-header-renderer,
      ytmusic-tabbed-browse-renderer,
      ytmusic-detail-header-renderer,
      ytmusic-section-list-renderer,
      ytmusic-carousel-shelf-renderer,
      ytmusic-grid-renderer,
      ytmusic-item-section-renderer,
      #content.ytmusic-app,
      #shorts-container, ytd-shorts, #shorts-inner-container, ytd-reel-player-overlay, #overlay.ytd-reel-video-renderer, ytmusic-app-layout, ytmusic-browse-response #background, ytmusic-browse-response .background, ytmusic-app-layout #background, ytmusic-immersive-header-renderer, ytmusic-card-shelf-renderer, ytmusic-chip-cloud-chip-renderer, ytmusic-chip-cloud-renderer, ytmusic-player-page, ytmusic-player-page #background { background: transparent !important; }

      /* Neutralize default YTM gradients */
      ytmusic-browse-response #background,
      ytmusic-header-renderer #background,
      ytmusic-tabbed-browse-renderer #background,
      ytmusic-player-page #background,
      ytmusic-player-page .background,
      .background-gradient.ytmusic-browse-response,
      #background.style-scope.ytmusic-browse-response,
      #header.style-scope.ytmusic-browse-response,
      ytmusic-browse-response [id="background"],
      ytmusic-header-renderer [id="background"], #guide-spacer {
        background: transparent !important;
        background-image: none !important;
      }
      /* Only hide the immersive background if we have a custom background image */
      ${hasBgImage ? ".immersive-background, ytmusic-fullbleed-thumbnail-renderer[is-background] { display: none !important; }" : ""}

      #layout { background: transparent !important; }
      .content.ytmusic-player-page { background: transparent !important; }
    `);
			if (shouldApplyTheme) addCss(`
        ytmusic-player-bar .title, ytmusic-player-bar .byline {
          color: ${selectedTheme.textColor || "inherit"} !important;
        }
        .ytmusic-player-bar .yt-spec-icon-shape, .ytmusic-player-bar svg {
          color: ${selectedTheme.colorIcons || selectedTheme.textColor || "inherit"} !important;
          fill: ${selectedTheme.colorIcons || selectedTheme.textColor || "inherit"} !important;
        }
        #progress-bar {
          --paper-slider-active-color: ${ytmSliderSolidColor} !important;
          --paper-slider-knob-color: ${ytmSliderSolidColor} !important;
          --paper-slider-secondary-color: ${ytmSliderSolidColor}80 !important;
          --paper-slider-container-color: rgba(255, 255, 255, 0.15) !important;
        }

        /* Sidebar & Guide - Apply theme gradient with glass effect */
        tp-yt-app-drawer,
        tp-yt-app-drawer #contentContainer,
        #guide-wrapper.ytmusic-app-layout,
        #guide-content,
        #guide-spacer,
        ytmusic-guide-renderer,
        #mini-guide-background,
        #mini-guide,
        #mini-guide-renderer,
        body.ytm-ambient-active #mini-guide-renderer {
          background: linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.75)), ${ytmGlassBg} !important;
          backdrop-filter: blur(${ytmGlassBlur}) saturate(1.2) !important;
          -webkit-backdrop-filter: blur(${ytmGlassBlur}) saturate(1.2) !important;
        }

        /* Nested guide elements transparent to avoid stacking */
        #guide-wrapper.ytmusic-app-layout #items,
        ytmusic-guide-section-renderer #items,
        ytmusic-guide-section-renderer[is-collapsed],
        ytmusic-guide-entry-renderer,
        tp-yt-paper-item.ytmusic-guide-entry-renderer {
          background: transparent !important;
        }
      `);
			console.log("[YT Tools] Advanced YouTube Music CSS applied");
		}
	}
	function loadSettingsToDOM() {
		const settings = readJsonGM(SETTINGS_KEY, {});
		__ytToolsRuntime.settingsLoaded = true;
		if (settings.theme) {
			const radio = $e(`input[name="theme"][value="${settings.theme}"]`);
			if (radio) radio.checked = true;
		}
		const menuData = settings.menu_akari || settings.menu_developermdcm || {
			bg: "#252525",
			color: "#ffffff",
			accent: "#ff0000"
		};
		const setVal = (id, val) => {
			const el = $id(id);
			if (el) el.value = val;
		};
		const setChk = (id, val) => {
			const el = $id(id);
			if (el) el.checked = val;
		};
		setVal("bg-color-picker", settings.bgColorPicker || "#000000");
		setVal("progressbar-color-picker", settings.progressbarColorPicker || "#ff0000");
		setVal("primary-color-picker", settings.primaryColorPicker || "#ffffff");
		setVal("secondary-color-picker", settings.secondaryColorPicker || "#ffffff");
		setVal("header-color-picker", settings.headerColorPicker || "#000");
		setVal("icons-color-picker", settings.iconsColorPicker || "#ffffff");
		setVal("menu-color-picker", settings.menuColorPicker || "#000");
		setVal("line-color-picker", settings.lineColorPicker || "#ff0000");
		setVal("time-color-picker", settings.timeColorPicker || "#ffffff");
		setChk("dislikes-toggle", settings.dislikes || false);
		setChk("like-dislike-bar-toggle", settings.likeDislikeBar || false);
		setChk("bookmarks-toggle", settings.bookmarks || false);
		setChk("continue-watching-toggle", settings.continueWatching || false);
		setChk("shorts-channel-name-toggle", settings.shortsChannelName || false);
		if ($id("nonstop-playback-toggle")) $id("nonstop-playback-toggle").checked = settings.nonstopPlayback !== false;
		if ($id("audio-only-toggle")) $id("audio-only-toggle").checked = settings.audioOnly || false;
		setChk("copy-description-toggle", settings.copyDescription !== false);
		syncAudioOnlyTabCheckbox();
		setChk("themes-toggle", settings.themes || false);
		const themesMenuSection = $e(".themes-hidden");
		if (themesMenuSection) themesMenuSection.style.display = settings.themes ? "block" : "none";
		setChk("translation-toggle", settings.translateComments || false);
		setChk("avatars-toggle", settings.avatars || false);
		setChk("reverse-mode-toggle", settings.reverseMode || false);
		setChk("wave-visualizer-toggle", settings.waveVisualizer || false);
		setVal("select-wave-visualizer-select", settings.waveVisualizerSelected || "dinamica");
		setChk("hide-comments-toggle", settings.hideComments || false);
		setChk("hide-sidebar-toggle", settings.hideSidebar || false);
		setChk("autoplay-toggle", settings.disableAutoplay || false);
		setChk("cinematic-lighting-toggle", settings.cinematicLighting || false);
		if ($id("sync-cinematic-toggle")) $id("sync-cinematic-toggle").checked = settings.syncCinematic || false;
		if ($id("side-panel-style-select")) $id("side-panel-style-select").value = settings.sidePanelStyle || "blur";
		setVal("player-size-slider", settings.playerSize || 100);
		setVal("select-video-qualitys-select", settings.selectVideoQuality || "user");
		setVal("select-languages-comments-select", settings.languagesComments || "en");
		setMenuColor("bg", menuData.bg);
		setMenuColor("color", menuData.color);
		setMenuColor("accent", menuData.accent);
		$m("#bg-color-options .color-box").forEach((el) => el.classList.toggle("selected", el.dataset.value === selectedBgColor));
		$m("#text-color-options .color-box").forEach((el) => el.classList.toggle("selected", el.dataset.value === selectedTextColor));
		$m("#bg-accent-color-options .color-box").forEach((el) => el.classList.toggle("selected", el.dataset.value === selectedBgAccentColor));
		$sp("--yt-enhance-menu-bg", selectedBgColor);
		$sp("--yt-enhance-menu-text", selectedTextColor);
		$sp("--yt-enhance-menu-accent", selectedBgAccentColor);
		const sizeLabel = $id("player-size-value");
		if (sizeLabel) sizeLabel.textContent = $id("player-size-slider")?.value || "100";
		const preview = $id("background-image-preview");
		if (preview && settings.backgroundImage) {
			preview.style.backgroundImage = `url(${settings.backgroundImage})`;
			preview.classList.add("has-image");
		}
	}
	function getMainVideoEl() {
		return $e("video.video-stream.html5-main-video") || $e("video");
	}
	function getCurrentVideoMeta() {
		try {
			const player = $id("movie_player");
			if (player && typeof player.getVideoData === "function") {
				const d = player.getVideoData();
				return {
					title: d?.title || "",
					author: d?.author || "",
					thumb: d?.video_id ? `https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg` : ""
				};
			}
		} catch {}
		return {
			title: "",
			author: "",
			thumb: ""
		};
	}
	function getCurrentVideoId() {
		try {
			if (location.pathname.startsWith("/shorts/")) return location.pathname.split("/").filter(Boolean)[1] || null;
			if (location.href.includes("youtube.com/watch")) return new URLSearchParams(window.location.search).get("v");
		} catch {}
		return null;
	}
	function getVideoInfoPlayerResponse() {
		try {
			return (typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window)?.ytInitialPlayerResponse || window.ytInitialPlayerResponse || null;
		} catch {
			return null;
		}
	}
	function getVideoInfoSnapshot() {
		const video = getMainVideoEl();
		const meta = getCurrentVideoMeta();
		const videoId = getCurrentVideoId();
		const pr = getVideoInfoPlayerResponse();
		const vd = pr?.videoDetails || {};
		const micro = pr?.microformat?.playerMicroformatRenderer || {};
		const moviePlayer = $id("movie_player");
		let quality = "-";
		let availableQuality = "";
		try {
			if (moviePlayer && typeof moviePlayer.getPlaybackQuality === "function") quality = moviePlayer.getPlaybackQuality() || "-";
			else if (video?.videoHeight) quality = `${video.videoHeight}p`;
			if (moviePlayer && typeof moviePlayer.getAvailableQualityLevels === "function") {
				const levels = moviePlayer.getAvailableQualityLevels();
				if (Array.isArray(levels) && levels.length) availableQuality = levels.join(", ");
			}
		} catch {}
		const duration = Number(video?.duration || vd.lengthSeconds || 0);
		const currentTime = Number(video?.currentTime || 0);
		const progress = duration > 0 ? Math.max(0, Math.min(100, currentTime / duration * 100)) : 0;
		const title = (meta.title || vd.title || "").trim();
		const author = (meta.author || vd.author || "").trim();
		const thumb = meta.thumb || vd.thumbnail?.thumbnails?.slice?.(-1)?.[0]?.url || "";
		const viewCount = Number(vd.viewCount || micro.viewCount || 0);
		let state = "No video";
		if (video) if (video.ended) state = "Ended";
		else if (video.paused) state = "Paused";
		else state = "Playing";
		const playbackRate = Number(video?.playbackRate || 1);
		const volume = Number.isFinite(video?.volume) ? Math.round(video.volume * 100) : null;
		const url = videoId ? `${location.origin}/watch?v=${encodeURIComponent(videoId)}` : location.href;
		return {
			videoId: videoId || "",
			title,
			author,
			thumb,
			url,
			state,
			currentTime,
			duration,
			progress,
			quality,
			availableQuality,
			playbackRate,
			volume,
			views: Number.isFinite(viewCount) && viewCount > 0 ? viewCount : null,
			published: micro.publishDate || micro.uploadDate || "",
			isLive: !!vd.isLiveContent
		};
	}
	function setVideoInfoText(id, value) {
		const el = $id(id);
		if (el) el.textContent = value || "-";
	}
	function formatVideoInfoTime(seconds) {
		if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
		const s = Math.floor(seconds);
		const h = Math.floor(s / 3600);
		const m = Math.floor(s % 3600 / 60);
		const sec = s % 60;
		return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
	}
	function updateVideoInfoPanel() {
		if (!$id("yt-video-info-panel")) return;
		const info = getVideoInfoSnapshot();
		const hasVideo = !!(info.videoId || info.title);
		const empty = $id("video-info-empty");
		const content = $id("video-info-content");
		if (empty) empty.style.display = hasVideo ? "none" : "block";
		if (content) content.style.display = hasVideo ? "block" : "none";
		if (!hasVideo) return;
		const thumb = $id("video-info-thumb");
		if (thumb) if (info.thumb) {
			thumb.src = info.thumb;
			thumb.style.display = "block";
		} else {
			thumb.removeAttribute("src");
			thumb.style.display = "none";
		}
		setVideoInfoText("video-info-title", info.title || document.title.replace(/\s*-\s*YouTube\s*$/i, ""));
		setVideoInfoText("video-info-channel", info.author || (info.isLive ? "Live stream" : "Unknown channel"));
		setVideoInfoText("video-info-id", info.videoId || "-");
		setVideoInfoText("video-info-state", `${info.state}${info.playbackRate && info.playbackRate !== 1 ? ` • ${info.playbackRate}x` : ""}${info.volume != null ? ` • ${info.volume}%` : ""}`);
		setVideoInfoText("video-info-time", info.duration > 0 ? `${formatVideoInfoTime(info.currentTime)} / ${formatVideoInfoTime(info.duration)}` : formatVideoInfoTime(info.currentTime));
		setVideoInfoText("video-info-quality", info.availableQuality ? `${info.quality} (${info.availableQuality})` : info.quality);
		setVideoInfoText("video-info-views", info.views != null ? info.views.toLocaleString() : "-");
		setVideoInfoText("video-info-published", info.published || "-");
		const progress = $id("video-info-progress");
		if (progress) progress.style.width = `${info.progress}%`;
	}
	function persistApplyAndNotifyFeatures() {
		saveSettingsFromDOM();
		applySettings();
		document.dispatchEvent(new CustomEvent("yt-tools-settings-changed", { detail: loadSettings() }));
	}
	function setupSettingsPanelEvents(panelDOM) {
		if (!panelDOM) return;
		const closeBtn = panelDOM.querySelector(".close_menu_settings");
		if (closeBtn) closeBtn.addEventListener("click", () => {
			const event = new CustomEvent("yt-tools-toggle-menu");
			window.dispatchEvent(event);
		});
		const tabButtons = panelDOM.querySelectorAll(".tab-mdcm");
		const tabContents = panelDOM.querySelectorAll(".tab-content");
		tabButtons.forEach((button) => {
			button.addEventListener("click", () => {
				if (button.id === "menu-settings-icon") return;
				const tabName = button.getAttribute("data-tab");
				tabButtons.forEach((btn) => btn.classList.remove("active"));
				tabContents.forEach((content) => content.classList.remove("active"));
				button.classList.add("active");
				const tabTarget = panelDOM.querySelector(`#${tabName}`);
				if (tabTarget) tabTarget.classList.add("active");
				if (tabName === "headers" && typeof updateVideoInfoPanel === "function") updateVideoInfoPanel();
			});
		});
		const settingsIconTab = panelDOM.querySelector("#menu-settings-icon");
		if (settingsIconTab) settingsIconTab.addEventListener("click", () => {
			const tabName = settingsIconTab.getAttribute("data-tab");
			tabButtons.forEach((btn) => btn.classList.remove("active"));
			tabContents.forEach((content) => content.classList.remove("active"));
			settingsIconTab.classList.add("active");
			const tabTarget = panelDOM.querySelector(`#${tabName}`);
			if (tabTarget) tabTarget.classList.add("active");
		});
		panelDOM.querySelectorAll("input, select").forEach((input) => {
			input.addEventListener("change", () => {
				if (input.id === "select-wave-visualizer-select") {
					onWaveStyleChange(input.value, saveSettingsFromDOM);
					return;
				}
				if (input.id === "audio-only-tab-toggle") {
					const enabled = input.checked;
					const globalToggle = $id("audio-only-toggle");
					const globalEnabled = globalToggle ? globalToggle.checked : false;
					try {
						setAudioOnlyTabOverride(enabled, globalEnabled);
						applyAudioOnlyMode(enabled);
					} catch (e) {
						console.warn("[YT Tools] Failed to apply audio-only tab override:", e);
					}
					return;
				}
				persistApplyAndNotifyFeatures();
			});
		});
		panelDOM.querySelectorAll(".color-box").forEach((box) => {
			box.addEventListener("click", () => {
				const type = box.dataset.type;
				const value = box.dataset.value;
				if (type === "bg") {
					setMenuColor("bg", value);
					$sp("--yt-enhance-menu-bg", value);
					panelDOM.querySelectorAll("#bg-color-options .color-box").forEach((el) => el.classList.remove("selected"));
					box.classList.add("selected");
				} else if (type === "color") {
					setMenuColor("color", value);
					$sp("--yt-enhance-menu-text", value);
					panelDOM.querySelectorAll("#text-color-options .color-box").forEach((el) => el.classList.remove("selected"));
					box.classList.add("selected");
				} else if (type === "accent") {
					setMenuColor("accent", value);
					$sp("--yt-enhance-menu-accent", value);
					panelDOM.querySelectorAll("#bg-accent-color-options .color-box").forEach((el) => el.classList.remove("selected"));
					box.classList.add("selected");
				}
				saveSettingsFromDOM();
			});
		});
		const playerSizeSlider = panelDOM.querySelector("#player-size-slider");
		const playerSizeValue = panelDOM.querySelector("#player-size-value");
		const resetPlayerSize = panelDOM.querySelector("#reset-player-size");
		if (playerSizeSlider && playerSizeValue) playerSizeSlider.addEventListener("input", () => {
			playerSizeValue.textContent = playerSizeSlider.value;
			persistApplyAndNotifyFeatures();
		});
		if (resetPlayerSize && playerSizeSlider && playerSizeValue) resetPlayerSize.addEventListener("click", (e) => {
			e.preventDefault();
			playerSizeSlider.value = 100;
			playerSizeValue.textContent = "100";
			persistApplyAndNotifyFeatures();
		});
		const shareBtn = panelDOM.querySelector("#shareBtn-mdcm");
		const importExportBtn = panelDOM.querySelector("#importExportBtn");
		const closeImportExportBtn = panelDOM.querySelector("#closeImportExportBtn");
		if (shareBtn) shareBtn.addEventListener("click", (event) => {
			event.stopPropagation();
			const dropdown = panelDOM.querySelector("#shareDropdown");
			if (dropdown) dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
		});
		if (importExportBtn) importExportBtn.addEventListener("click", () => {
			const importExportArea = panelDOM.querySelector("#importExportArea");
			if (importExportArea) importExportArea.classList.toggle("active");
		});
		if (closeImportExportBtn) closeImportExportBtn.addEventListener("click", () => {
			const importExportArea = panelDOM.querySelector("#importExportArea");
			if (importExportArea) importExportArea.classList.remove("active");
		});
		const backgroundImagePreview = panelDOM.querySelector("#background-image-preview");
		const backgroundImageInput = panelDOM.querySelector("#background_image");
		const removeBackgroundImageBtn = panelDOM.querySelector("#remove-background-image");
		if (backgroundImagePreview && backgroundImageInput) {
			const settings = loadSettings();
			if (settings.backgroundImage) {
				backgroundImagePreview.style.backgroundImage = `url(${settings.backgroundImage})`;
				backgroundImagePreview.classList.add("has-image");
			}
			backgroundImagePreview.addEventListener("click", () => {
				backgroundImageInput.click();
			});
			backgroundImageInput.addEventListener("change", (e) => {
				const file = e.target.files[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = (event) => {
						const imageUrl = event.target.result;
						backgroundImagePreview.style.backgroundImage = `url(${imageUrl})`;
						backgroundImagePreview.classList.add("has-image");
						const settings = loadSettings();
						settings.backgroundImage = imageUrl;
						gmRawSet(SETTINGS_KEY, JSON.stringify(settings));
						applySettings();
					};
					reader.readAsDataURL(file);
				}
			});
		}
		if (removeBackgroundImageBtn) removeBackgroundImageBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			backgroundImagePreview.style.backgroundImage = "";
			backgroundImagePreview.classList.remove("has-image");
			backgroundImageInput.value = "";
			const settings = loadSettings();
			delete settings.backgroundImage;
			console.log("[YT Tools] Removing backgroundImage with key:", SETTINGS_KEY);
			gmRawSet(SETTINGS_KEY, JSON.stringify(settings));
			applySettings();
		});
	}
	var THEME_PRESETS = {
		minimal: {
			name: "Minimal Light",
			colors: {
				background: "#ffffff",
				primary: "#000000",
				secondary: "#666666",
				header: "#f5f5f5",
				icons: "#333333",
				menu: "#ffffff",
				accent: "#007bff",
				progress: "#007bff"
			}
		},
		minimalDark: {
			name: "Minimal Dark",
			colors: {
				background: "#1a1a1a",
				primary: "#ffffff",
				secondary: "#cccccc",
				header: "#2d2d2d",
				icons: "#ffffff",
				menu: "#2d2d2d",
				accent: "#0066cc",
				progress: "#0066cc"
			}
		},
		ocean: {
			name: "Ocean Blue",
			colors: {
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				primary: "#ffffff",
				secondary: "#e8f4fd",
				header: "rgba(255,255,255,0.1)",
				icons: "#ffffff",
				menu: "rgba(255,255,255,0.1)",
				accent: "#4fc3f7",
				progress: "#29b6f6"
			}
		},
		sunset: {
			name: "Sunset Orange",
			colors: {
				background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
				primary: "#ffffff",
				secondary: "#fff3e0",
				header: "rgba(255,255,255,0.1)",
				icons: "#ffffff",
				menu: "rgba(255,255,255,0.1)",
				accent: "#ff6b6b",
				progress: "#ff5252"
			}
		},
		forest: {
			name: "Forest Green",
			colors: {
				background: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
				primary: "#ffffff",
				secondary: "#e8f5e8",
				header: "rgba(255,255,255,0.1)",
				icons: "#ffffff",
				menu: "rgba(255,255,255,0.1)",
				accent: "#66bb6a",
				progress: "#4caf50"
			}
		},
		corporate: {
			name: "Corporate Blue",
			colors: {
				background: "#f8f9fa",
				primary: "#1a73e8",
				secondary: "#5f6368",
				header: "#ffffff",
				icons: "#1a73e8",
				menu: "#ffffff",
				accent: "#1a73e8",
				progress: "#1a73e8"
			}
		},
		darkPro: {
			name: "Dark Professional",
			colors: {
				background: "#0d1117",
				primary: "#c9d1d9",
				secondary: "#8b949e",
				header: "#161b22",
				icons: "#58a6ff",
				menu: "#161b22",
				accent: "#58a6ff",
				progress: "#58a6ff"
			}
		},
		neon: {
			name: "Neon Gaming",
			colors: {
				background: "#0a0a0a",
				primary: "#00ff41",
				secondary: "#00cc33",
				header: "#1a1a1a",
				icons: "#00ff41",
				menu: "#1a1a1a",
				accent: "#ff0080",
				progress: "#00ff41"
			}
		},
		cyberpunk: {
			name: "Cyberpunk",
			colors: {
				background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
				primary: "#ff00ff",
				secondary: "#00ffff",
				header: "rgba(255,0,255,0.1)",
				icons: "#ff00ff",
				menu: "rgba(255,0,255,0.1)",
				accent: "#ffff00",
				progress: "#ff00ff"
			}
		},
		aurora: {
			name: "Aurora Borealis",
			colors: {
				background: "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)",
				primary: "#1a1a1a",
				secondary: "#ffffff",
				header: "rgba(255,255,255,0.15)",
				icons: "#1a1a1a",
				menu: "rgba(255,255,255,0.15)",
				accent: "#00ff88",
				progress: "#00ccff"
			}
		},
		midnight: {
			name: "Midnight Purple",
			colors: {
				background: "linear-gradient(135deg, #2e1a47 0%, #4a148c 100%)",
				primary: "#ffffff",
				secondary: "#e1bee7",
				header: "rgba(255,255,255,0.1)",
				icons: "#ffffff",
				menu: "rgba(255,255,255,0.1)",
				accent: "#9c27b0",
				progress: "#7b1fa2"
			}
		},
		spring: {
			name: "Spring Blossom",
			colors: {
				background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
				primary: "#2e7d32",
				secondary: "#81c784",
				header: "rgba(255,255,255,0.9)",
				icons: "#2e7d32",
				menu: "rgba(255,255,255,0.9)",
				accent: "#ff6f00",
				progress: "#4caf50"
			}
		},
		autumn: {
			name: "Autumn Harvest",
			colors: {
				background: "linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%)",
				primary: "#ffffff",
				secondary: "#ffe0b2",
				header: "rgba(255,255,255,0.1)",
				icons: "#ffffff",
				menu: "rgba(255,255,255,0.1)",
				accent: "#ff6f00",
				progress: "#ff9800"
			}
		},
		galaxy: {
			name: "Galaxy Premium",
			colors: {
				background: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
				primary: "#ffffff",
				secondary: "#64b5f6",
				header: "rgba(255,255,255,0.05)",
				icons: "#ffffff",
				menu: "rgba(255,255,255,0.05)",
				accent: "#ffd700",
				progress: "#00bcd4",
				animation: true
			}
		},
		crystal: {
			name: "Crystal Glass",
			colors: {
				background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
				primary: "#333333",
				secondary: "#666666",
				header: "rgba(255,255,255,0.8)",
				icons: "#333333",
				menu: "rgba(255,255,255,0.8)",
				accent: "#2196f3",
				progress: "#1976d2",
				glass: true
			}
		},
		neonGenesis: {
			name: "Neon Genesis",
			colors: {
				background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
				primary: "#ff2a5f",
				secondary: "#00e5ff",
				header: "rgba(0, 0, 0, 0.5)",
				icons: "#ff2a5f",
				menu: "rgba(0, 0, 0, 0.4)",
				accent: "#00e5ff",
				progress: "#ff2a5f",
				glass: true,
				animation: true
			}
		},
		darkGlass: {
			name: "Dark Glass",
			colors: {
				background: "rgba(10, 10, 10, 0.85)",
				primary: "#ffffff",
				secondary: "#888888",
				header: "rgba(20, 20, 20, 0.6)",
				icons: "#ffffff",
				menu: "rgba(15, 15, 15, 0.5)",
				accent: "#444444",
				progress: "#ffffff",
				glass: true
			}
		},
		holographic: {
			name: "Holographic",
			colors: {
				background: "linear-gradient(135deg, rgba(255,107,107,0.8), rgba(85,98,112,0.8), rgba(78,205,196,0.8))",
				primary: "#ffffff",
				secondary: "#f0f0f0",
				header: "rgba(255, 255, 255, 0.1)",
				icons: "#ffffff",
				menu: "rgba(255, 255, 255, 0.15)",
				accent: "#ff6b6b",
				progress: "#4ecdc4",
				glass: true,
				animation: true
			}
		}
	};
	function getThemePreset(name) {
		return THEME_PRESETS[name] || THEME_PRESETS.minimal;
	}
	function getAllThemePresets() {
		return Object.keys(THEME_PRESETS).map((key) => ({
			key,
			...THEME_PRESETS[key]
		}));
	}
	var ThemeManager = class {
		constructor() {
			this.currentTheme = null;
			this.customThemes = new Map();
			this.isPreviewMode = false;
		}
		applyThemePreset(presetName, preview = false) {
			const preset = getThemePreset(presetName);
			if (!preset) return false;
			const settings = loadSettings();
			Object.entries(preset.colors).forEach(([key, value]) => {
				const settingKey = this.mapColorToSetting(key);
				if (settingKey) settings[settingKey] = value;
			});
			settings.themes = true;
			settings.themeCustom = true;
			if (!preview) {
				saveSettings(settings);
				this.currentTheme = presetName;
				this.applySettings();
			} else {
				this.isPreviewMode = true;
				this.previewTheme(preset.colors);
			}
			return true;
		}
		previewTheme(colors) {
			const root = document.documentElement;
			Object.entries(colors).forEach(([key, value]) => {
				const cssVar = this.mapColorToCSSVar(key);
				if (cssVar) if (key === "background" && value.includes("gradient")) root.style.setProperty(cssVar, value);
				else root.style.setProperty(cssVar, value);
			});
		}
		stopPreview() {
			if (!this.isPreviewMode) return;
			this.isPreviewMode = false;
			this.applySettings();
		}
		saveCustomTheme(name, description = "") {
			const settings = loadSettings();
			const customTheme = {
				name,
				description,
				colors: this.extractColorsFromSettings(settings),
				createdAt: new Date().toISOString()
			};
			this.customThemes.set(name, customTheme);
			this.saveCustomThemes();
			return customTheme;
		}
		deleteCustomTheme(name) {
			if (this.customThemes.has(name)) {
				this.customThemes.delete(name);
				this.saveCustomThemes();
				return true;
			}
			return false;
		}
		getAllThemes() {
			const presets = getAllThemePresets();
			const custom = Array.from(this.customThemes.entries()).map(([key, theme]) => ({
				key,
				...theme,
				isCustom: true
			}));
			return [...presets, ...custom];
		}
		exportTheme(themeName) {
			const theme = this.getTheme(themeName);
			if (!theme) return null;
			return {
				name: theme.name,
				description: theme.description || "",
				colors: theme.colors,
				version: "1.0",
				exportedAt: new Date().toISOString()
			};
		}
		importTheme(themeData) {
			try {
				const { name, description, colors } = themeData;
				if (!name || !colors) throw new Error("Invalid theme data");
				const customTheme = {
					name,
					description: description || "",
					colors,
					createdAt: new Date().toISOString(),
					imported: true
				};
				this.customThemes.set(name, customTheme);
				this.saveCustomThemes();
				return customTheme;
			} catch (error) {
				console.error("[YT Tools] Failed to import theme:", error);
				return null;
			}
		}
		getTheme(name) {
			if (this.customThemes.has(name)) return {
				key: name,
				...this.customThemes.get(name),
				isCustom: true
			};
			const preset = getThemePreset(name);
			if (preset) return {
				key: name,
				...preset,
				isCustom: false
			};
			return null;
		}
		applyRandomTheme() {
			const themes = this.getAllThemes();
			const randomTheme = themes[Math.floor(Math.random() * themes.length)];
			return this.applyThemePreset(randomTheme.key);
		}
		mapColorToSetting(colorKey) {
			return {
				background: "bgColorPicker",
				primary: "primaryColorPicker",
				secondary: "secondaryColorPicker",
				header: "headerColorPicker",
				icons: "iconsColorPicker",
				menu: "menuColorPicker",
				accent: "lineColorPicker",
				progress: "progressbarColorPicker"
			}[colorKey];
		}
		mapColorToCSSVar(colorKey) {
			return {
				background: "--yt-spec-base-background",
				primary: "--yt-spec-text-primary",
				secondary: "--yt-spec-text-secondary",
				header: "--yt-spec-raised-background",
				icons: "--yt-spec-icon-inactive",
				menu: "--yt-spec-menu-background",
				accent: "--yt-spec-static-brand-red",
				progress: "--yt-spec-static-brand-white"
			}[colorKey];
		}
		extractColorsFromSettings(settings) {
			return {
				background: settings.bgColorPicker,
				primary: settings.primaryColorPicker,
				secondary: settings.secondaryColorPicker,
				header: settings.headerColorPicker,
				icons: settings.iconsColorPicker,
				menu: settings.menuColorPicker,
				accent: settings.lineColorPicker,
				progress: settings.progressbarColorPicker
			};
		}
		saveCustomThemes() {
			const themesArray = Array.from(this.customThemes.entries());
			localStorage.setItem("yt-tools-custom-themes", JSON.stringify(themesArray));
		}
		loadCustomThemes() {
			try {
				const saved = localStorage.getItem("yt-tools-custom-themes");
				if (saved) {
					const themesArray = JSON.parse(saved);
					this.customThemes = new Map(themesArray);
				}
			} catch (error) {
				console.warn("[YT Tools] Failed to load custom themes:", error);
			}
		}
		applySettings() {
			document.dispatchEvent(new CustomEvent("yt-tools-settings-changed", { detail: loadSettings() }));
		}
	};
	var themeManager = new ThemeManager();
	themeManager.loadCustomThemes();
	var animationEnabled = false;
	var ANIMATION_STYLES = `
  .yt-theme-transition-overlay {
    mix-blend-mode: screen;
    pointer-events: none;
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 var(--pulse-color, #007bff); }
    50% { box-shadow: 0 0 0 10px var(--pulse-color, #007bff); }
    100% { box-shadow: 0 0 0 0 var(--pulse-color, #007bff); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .yt-theme-shimmer {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.1),
      transparent
    );
    background-size: 200% 100%;
  }
  
  .yt-theme-animate-in {
    animation: slideIn 0.3s ease-out;
  }
  
  .yt-theme-animate-out {
    animation: slideOut 0.3s ease-in;
  }
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-20px); opacity: 0; }
  }
`;
	function initThemeAnimations(enabled = true) {
		animationEnabled = enabled;
		if (enabled && !document.getElementById("yt-theme-animations")) {
			const style = document.createElement("style");
			style.id = "yt-theme-animations";
			style.textContent = ANIMATION_STYLES;
			document.head.appendChild(style);
			console.log("[YT Tools] Theme animations enabled");
		} else if (!enabled) {
			removeAnimationStyles();
			console.log("[YT Tools] Theme animations disabled");
		}
	}
	function removeAnimationStyles() {
		const style = document.getElementById("yt-theme-animations");
		if (style) document.head.removeChild(style);
	}
	function toggleThemeAnimations() {
		initThemeAnimations(!animationEnabled);
		return animationEnabled;
	}
	var customTheme = {
		name: "Custom Theme",
		colors: {
			background: "#ffffff",
			primary: "#000000",
			secondary: "#666666",
			header: "#f5f5f5",
			icons: "#333333",
			menu: "#ffffff",
			accent: "#007bff",
			progress: "#007bff"
		},
		custom: true
	};
	function applyCustomTheme(themeData) {
		if (!themeData || !themeData.colors) {
			console.warn("[YT Tools] Invalid custom theme data");
			return false;
		}
		const validatedColors = validateThemeColors(themeData.colors);
		customTheme = {
			name: themeData.name || "Custom Theme",
			colors: validatedColors,
			custom: true,
			...themeData.properties
		};
		applySettings({
			...loadSettings(),
			selectedTheme: "custom",
			customTheme
		});
		saveToCustomHistory(customTheme);
		console.log("[YT Tools] Custom theme applied:", customTheme.name);
		return true;
	}
	function saveToCustomHistory(theme) {
		const history = getCustomHistory();
		const newEntry = {
			...theme,
			applied: Date.now()
		};
		history.unshift(newEntry);
		const limited = history.slice(0, 10);
		localStorage.setItem("yt-custom-theme-history", JSON.stringify(limited));
	}
	function getCustomHistory() {
		try {
			const stored = localStorage.getItem("yt-custom-theme-history");
			return stored ? JSON.parse(stored) : [];
		} catch (e) {
			console.warn("[YT Tools] Failed to load custom history:", e);
			return [];
		}
	}
	var colorValidationCache = new Map();
	function validateThemeColors(colors) {
		const cacheKey = JSON.stringify(colors);
		if (colorValidationCache.has(cacheKey)) return colorValidationCache.get(cacheKey);
		const validated = {};
		[
			"background",
			"primary",
			"secondary",
			"header",
			"icons",
			"menu",
			"accent",
			"progress"
		].forEach((colorKey) => {
			const color = colors[colorKey];
			if (color && isValidColor(color)) validated[colorKey] = color;
			else {
				console.warn(`[YT Tools] Invalid color for ${colorKey}:`, color);
				validated[colorKey] = getDefaultColor(colorKey);
			}
		});
		colorValidationCache.set(cacheKey, validated);
		return validated;
	}
	function isValidColor(color) {
		return [
			/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
			/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)\s*\)$/,
			/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)\s*\)$/,
			/^linear-gradient\(/,
			/^radial-gradient\(/
		].some((pattern) => pattern.test(color));
	}
	function getDefaultColor(colorKey) {
		return {
			background: "#ffffff",
			primary: "#000000",
			secondary: "#666666",
			header: "#f5f5f5",
			icons: "#333333",
			menu: "#ffffff",
			accent: "#007bff",
			progress: "#007bff"
		}[colorKey] || "#000000";
	}
	function adjustColorBrightness(color, amount = .2) {
		if (!color || !isValidColor(color)) return color;
		if (color.startsWith("#")) {
			const hex = color.replace("#", "");
			const num = parseInt(hex, 16);
			const r = Math.min(255, (num >> 16 & 255) + amount * 255);
			const g = Math.min(255, (num >> 8 & 255) + amount * 255);
			const b = Math.min(255, (num & 255) + amount * 255);
			return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
		}
		return color;
	}
	function createThemeSelector() {
		const container = document.createElement("div");
		container.className = "theme-selector-container";
		setHTML(container, `
    <div class="theme-selector-header">
      <h4>Theme Gallery</h4>
      <div class="theme-selector-actions">
        <button id="random-theme-btn" class="btn-random" title="Apply Random Theme">
          <i class="fas fa-random"></i>
        </button>
        <button id="export-theme-btn" class="btn-export" title="Export Current Theme">
          <i class="fas fa-download"></i>
        </button>
        <button id="import-theme-btn" class="btn-import" title="Import Theme">
          <i class="fas fa-upload"></i>
        </button>
        <button id="animations-toggle-btn" class="btn-animations" title="Toggle Animations">
          <i class="fas fa-magic"></i>
        </button>
      </div>
    </div>
    
    <div class="theme-filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="minimal">Minimal</button>
      <button class="filter-btn" data-filter="vibrant">Vibrant</button>
      <button class="filter-btn" data-filter="professional">Professional</button>
      <button class="filter-btn" data-filter="gaming">Gaming</button>
      <button class="filter-btn" data-filter="modern">Modern</button>
      <button class="filter-btn" data-filter="seasonal">Seasonal</button>
      <button class="filter-btn" data-filter="premium">Premium</button>
    </div>
    
    <div class="theme-grid" id="theme-grid">
      ${themeManager.getAllThemes().map((theme) => createThemeCard(theme)).join("")}
    </div>
    
    <div class="theme-custom-actions">
      <button id="save-custom-theme-btn" class="btn-save">
        <i class="fas fa-save"></i> Save Current as Custom Theme
      </button>
      <button id="color-picker-btn" class="btn-color" title="Color Picker">
        <i class="fas fa-palette"></i> Advanced Color Picker
      </button>
    </div>
    
    <div class="theme-customizer" id="theme-customizer" style="display: none;">
      <h5>Advanced Customizer</h5>
      <div class="customizer-grid">
        <div class="color-input-group">
          <label>Background</label>
          <input type="color" id="bg-color-input" class="color-input">
          <button class="gradient-btn" id="bg-gradient-btn">Gradient</button>
        </div>
        <div class="color-input-group">
          <label>Primary</label>
          <input type="color" id="primary-color-input" class="color-input">
        </div>
        <div class="color-input-group">
          <label>Secondary</label>
          <input type="color" id="secondary-color-input" class="color-input">
        </div>
        <div class="color-input-group">
          <label>Accent</label>
          <input type="color" id="accent-color-input" class="color-input">
        </div>
        <div class="color-input-group">
          <label>Progress</label>
          <input type="color" id="progress-color-input" class="color-input">
        </div>
      </div>
      <div class="customizer-actions">
        <button id="apply-custom-btn" class="btn-apply">Apply Custom</button>
        <button id="reset-custom-btn" class="btn-reset">Reset</button>
      </div>
    </div>
    
    <input type="file" id="theme-import-input" accept=".json" style="display: none;">
  `);
		setupEventListeners(container);
		return container;
	}
	function createThemeCard(theme) {
		const isCustom = theme.isCustom || false;
		const previewColors = getPreviewColors(theme.colors);
		return `
    <div class="theme-card ${isCustom ? "custom" : "preset"}" data-theme="${theme.key}">
      <div class="theme-preview" style="${previewColors}">
        <div class="theme-preview-header"></div>
        <div class="theme-preview-content">
          <div class="theme-preview-text"></div>
          <div class="theme-preview-button"></div>
        </div>
      </div>
      <div class="theme-info">
        <div class="theme-name">${theme.name}</div>
        ${isCustom ? "<div class=\"theme-badge\">Custom</div>" : ""}
        ${theme.description ? `<div class="theme-description">${theme.description}</div>` : ""}
      </div>
      <div class="theme-actions">
        <button class="btn-apply" data-theme="${theme.key}">Apply</button>
        <button class="btn-preview" data-theme="${theme.key}">Preview</button>
        ${isCustom ? `<button class="btn-delete" data-theme="${theme.key}">Delete</button>` : ""}
      </div>
    </div>
  `;
	}
	function getPreviewColors(colors) {
		const bg = colors.background || "#ffffff";
		const primary = colors.primary || "#000000";
		return `
    background: ${bg.includes("gradient") ? bg : bg};
    color: ${primary};
  `;
	}
	function setupEventListeners(container) {
		const themeGrid = container.querySelector("#theme-grid");
		const customizer = container.querySelector("#theme-customizer");
		const colorPickerBtn = container.querySelector("#color-picker-btn");
		const animationsToggle = container.querySelector("#animations-toggle-btn");
		const filterButtons = container.querySelectorAll(".filter-btn");
		filterButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				filterButtons.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
				filterThemes(btn.dataset.filter);
			});
		});
		colorPickerBtn.addEventListener("click", () => {
			customizer.style.display = customizer.style.display === "none" ? "block" : "none";
			populateCustomizer();
		});
		animationsToggle.addEventListener("click", () => {
			const isAnimated = (() => {
				let v = false;
				try {
					v = toggleThemeAnimations();
				} catch {
					v = false;
				}
				return v;
			})();
			animationsToggle.classList.toggle("active", isAnimated);
			Notify(isAnimated ? "success" : "info", isAnimated ? "Animations enabled" : "Animations disabled", "Theme Animations");
		});
		themeGrid.addEventListener("click", (e) => {
			const themeKey = e.target.dataset.theme;
			if (!themeKey) return;
			if (e.target.classList.contains("btn-apply")) {
				themeManager.applyThemePreset(themeKey);
				showNotification("Theme applied successfully!", "success");
			} else if (e.target.classList.contains("btn-preview")) {
				themeManager.applyThemePreset(themeKey, true);
				showNotification("Preview mode - click outside to exit", "info");
				setTimeout(() => {
					document.addEventListener("click", function exitPreview(e) {
						if (!container.contains(e.target)) {
							themeManager.stopPreview();
							document.removeEventListener("click", exitPreview);
						}
					});
				}, 100);
			} else if (e.target.classList.contains("btn-delete")) {
				if (confirm(`Delete theme "${themeKey}"?`)) {
					themeManager.deleteCustomTheme(themeKey);
					refreshThemeGrid(container);
					showNotification("Theme deleted", "success");
				}
			}
		});
		const randomBtn = container.querySelector("#random-theme-btn");
		const exportBtn = container.querySelector("#export-theme-btn");
		const importBtn = container.querySelector("#import-theme-btn");
		const importInput = container.querySelector("#theme-import-input");
		const saveCustomBtn = container.querySelector("#save-custom-theme-btn");
		randomBtn?.addEventListener("click", () => {
			themeManager.applyRandomTheme();
			showNotification("Random theme applied!", "success");
		});
		exportBtn?.addEventListener("click", () => {
			const themeName = prompt("Enter theme name:", "My Custom Theme");
			if (themeName) {
				themeManager.saveCustomTheme(themeName);
				const exportData = themeManager.exportTheme(themeName);
				const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${themeName.replace(/\s+/g, "_")}.json`;
				a.click();
				URL.revokeObjectURL(url);
				showNotification("Theme exported!", "success");
			}
		});
		importBtn?.addEventListener("click", () => {
			importInput.click();
		});
		importInput?.addEventListener("change", (e) => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						const themeData = JSON.parse(event.target.result);
						const theme = themeManager.importTheme(themeData);
						if (theme) {
							refreshThemeGrid(container);
							showNotification(`Theme "${theme.name}" imported!`, "success");
						}
					} catch {
						showNotification("Failed to import theme file", "error");
					}
				};
				reader.readAsText(file);
			}
		});
		saveCustomBtn?.addEventListener("click", () => {
			const themeName = prompt("Enter custom theme name:");
			if (themeName) {
				themeManager.saveCustomTheme(themeName);
				refreshThemeGrid(container);
				showNotification("Custom theme saved!", "success");
			}
		});
	}
	function refreshThemeGrid(container) {
		setHTML(container.querySelector("#theme-grid"), themeManager.getAllThemes().map((theme) => createThemeCard(theme)).join(""));
	}
	function showNotification(message, type = "info") {
		Notify(type, message);
	}
	var filteredThemesCache = new Map();
	function filterThemes(filter) {
		if (filteredThemesCache.has(filter)) {
			applyFilteredThemes(filteredThemesCache.get(filter));
			return;
		}
		const themeCards = document.querySelectorAll(".theme-card");
		const visibleThemes = [];
		themeCards.forEach((card) => {
			const themeKey = card.dataset.theme;
			const theme = themeManager.getTheme(themeKey);
			if (filter === "all") {
				card.style.display = "block";
				visibleThemes.push(theme);
			} else {
				const shouldShow = isThemeInCategory(theme, filter);
				card.style.display = shouldShow ? "block" : "none";
				if (shouldShow) visibleThemes.push(theme);
			}
		});
		filteredThemesCache.set(filter, visibleThemes);
		applyFilteredThemes(visibleThemes);
	}
	function applyFilteredThemes(themes) {
		const fragment = document.createDocumentFragment();
		themes.forEach((theme) => {
			const card = document.querySelector(`[data-theme="${theme.key}"]`);
			if (card) {
				card.style.display = "block";
				card.style.opacity = "1";
			}
		});
		if (fragment.children.length > 0) {
			const container = document.querySelector("#theme-grid");
			if (container) requestAnimationFrame(() => {
				setHTML(container, "");
				container.appendChild(fragment);
			});
		}
	}
	function isThemeInCategory(theme, category) {
		const key = theme.key || "";
		return key.includes(category) || category === "minimal" && (key.includes("minimal") || key.includes("light") || key.includes("dark")) || category === "vibrant" && (key.includes("ocean") || key.includes("sunset") || key.includes("forest")) || category === "professional" && (key.includes("corporate") || key.includes("pro")) || category === "gaming" && (key.includes("neon") || key.includes("cyberpunk")) || category === "modern" && (key.includes("aurora") || key.includes("midnight")) || category === "seasonal" && (key.includes("spring") || key.includes("autumn")) || category === "premium" && (key.includes("galaxy") || key.includes("crystal"));
	}
	function populateCustomizer() {
		const colors = loadSettings().customTheme?.colors || {};
		const bgInput = document.getElementById("bg-color-input");
		const primaryInput = document.getElementById("primary-color-input");
		const secondaryInput = document.getElementById("secondary-color-input");
		const accentInput = document.getElementById("accent-color-input");
		const progressInput = document.getElementById("progress-color-input");
		if (bgInput) bgInput.value = colors.background || "#ffffff";
		if (primaryInput) primaryInput.value = colors.primary || "#000000";
		if (secondaryInput) secondaryInput.value = colors.secondary || "#666666";
		if (accentInput) accentInput.value = colors.accent || "#007bff";
		if (progressInput) progressInput.value = colors.progress || "#007bff";
		setupCustomizerListeners();
	}
	function setupCustomizerListeners() {
		const applyBtn = document.getElementById("apply-custom-btn");
		const resetBtn = document.getElementById("reset-custom-btn");
		const bgGradientBtn = document.getElementById("bg-gradient-btn");
		applyBtn?.addEventListener("click", () => {
			applyCustomTheme({
				name: "Custom Theme",
				colors: {
					background: document.getElementById("bg-color-input").value,
					primary: document.getElementById("primary-color-input").value,
					secondary: document.getElementById("secondary-color-input").value,
					accent: document.getElementById("accent-color-input").value,
					progress: document.getElementById("progress-color-input").value
				},
				custom: true
			});
			showNotification("Custom theme applied!", "success");
		});
		resetBtn?.addEventListener("click", () => {
			const defaults = {
				background: "#ffffff",
				primary: "#000000",
				secondary: "#666666",
				accent: "#007bff",
				progress: "#007bff"
			};
			Object.keys(defaults).forEach((key) => {
				const input = document.getElementById(`${key.replace("background", "bg")}-color-input`);
				if (input) input.value = defaults[key];
			});
			showNotification("Colors reset to defaults", "info");
		});
		bgGradientBtn?.addEventListener("click", () => {
			const gradient = `linear-gradient(135deg, 
      ${document.getElementById("bg-color-input").value} 0%, 
      ${adjustColorBrightness(document.getElementById("bg-color-input").value, -.3)} 100%)`;
			document.getElementById("bg-color-input").value = gradient;
			showNotification("Gradient background created!", "success");
		});
	}
	function initThemeSelector() {
		const settingsPanel = document.querySelector(".settings-panel");
		if (!settingsPanel) return;
		const themesTab = settingsPanel.querySelector("#themes");
		if (!themesTab) return;
		const bgImageContainer = themesTab.querySelector("#background-image-container");
		const themeSelector = createThemeSelector();
		if (bgImageContainer) bgImageContainer.parentNode.insertBefore(themeSelector, bgImageContainer.nextSibling);
		else themesTab.appendChild(themeSelector);
		initThemeAnimations(true);
	}
	var headerObserver = null;
	var openMenu = false;
	var panelEl = null;
	var panelOverlayEl = null;
	function bindPanelElements(panel, overlay) {
		panelEl = panel;
		panelOverlayEl = overlay;
	}
	function toggleMenu() {
		openMenu = !openMenu;
		if (panelEl) panelEl.style.display = openMenu ? "block" : "none";
		if (panelOverlayEl) panelOverlayEl.style.display = openMenu ? "block" : "none";
		if (openMenu) document.dispatchEvent(new CustomEvent("yt-tools-menu-opened"));
	}
	function setupHeaderObserver() {
		if (headerObserver) return;
		const target = $e("#masthead-container") || $e("ytd-masthead") || document.body;
		headerObserver = trackObserver(new MutationObserver(debounce(() => {
			const icon = $id("icon-menu-settings");
			if (!icon || !document.body.contains(icon)) addIcon();
		}, 250)));
		headerObserver.observe(target, {
			childList: true,
			subtree: true
		});
	}
	function addIcon() {
		const existing = $id("icon-menu-settings");
		if (existing && document.body.contains(existing)) return;
		if (existing) existing.closest("#toggle-button")?.remove();
		let anchor;
		if (isYTMusic$1) anchor = $e("#right-content");
		else anchor = $e("ytd-topbar-menu-button-renderer") || $e("#buttons") || $e("#end");
		if (!anchor) return;
		const toggleButton = $cl("div");
		toggleButton.id = "toggle-button";
		toggleButton.style.display = "flex";
		toggleButton.style.alignItems = "center";
		toggleButton.style.justifyContent = "center";
		toggleButton.style.cursor = "pointer";
		toggleButton.style.marginRight = "8px";
		const icon = $cl("i");
		icon.id = "icon-menu-settings";
		icon.classList.add("fa-solid", "fa-gear");
		icon.style.fontSize = "20px";
		icon.style.color = "var(--yt-spec-text-primary, var(--yt-spec-icon-inactive, #f2f2f2))";
		toggleButton.appendChild(icon);
		if (isYTMusic$1) anchor.insertBefore(toggleButton, anchor.firstChild);
		else anchor.parentElement.insertBefore(toggleButton, anchor);
		toggleButton.addEventListener("click", (e) => {
			e.stopPropagation();
			toggleMenu();
		});
		setupHeaderObserver();
	}
	function initGearIcon(panel, overlay) {
		if (!overlay) {
			overlay = $cl("div");
			overlay.id = "panel-overlay";
			document.body.appendChild(overlay);
		}
		bindPanelElements(panel, overlay);
		overlay.addEventListener("click", () => {
			if (openMenu) toggleMenu();
		});
		addIcon();
		const closeBtn = panel.querySelector(".close_menu_settings");
		if (closeBtn) closeBtn.addEventListener("click", () => toggleMenu());
	}
	_css("@import \"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css\";@import \"https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/css/iziToast.min.css\";@import \"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap\";@import \"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css\";@import \"https://cdn.jsdelivr.net/npm/izitoast@1.4.0/dist/css/iziToast.min.css\";@import \"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap\";:root{--primary-custom:#ff2a5f!important;--bg-dark-custom:#121212!important;--bg-card-custom:#1e1e1e73!important;--text-custom:#fff!important;--text-custom-secondary:#a0aab2!important;--accent-custom:#ff477e!important}.yt-tools-app-container,.container-mdcm,#yt-enhancement-panel *{box-sizing:border-box}.container-mdcm img,.video-info-panel-mdcm img{max-width:100%;display:block}.container-mdcm button,.yt-tools-btn{font:inherit;cursor:pointer}@keyframes fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}#panel-overlay{z-index:9998;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);background:#0000004d;width:100vw;height:100vh;display:none;position:fixed;top:0;left:0}#yt-enhancement-panel{z-index:9999!important}#below.ytd-watch-flexy{margin-top:12px!important;padding-left:16px!important;padding-right:16px!important;overflow:hidden!important}body .container-mdcm{color:var(--yt-enhance-menu-text,var(--text-custom));font-family:Plus Jakarta Sans,Inter,-apple-system,sans-serif}#toggle-button:hover{background-color:#ffffff1a;border-radius:50%;opacity:1!important}.container-mdcm{-webkit-backdrop-filter:blur(12px)saturate(120%);border:1px solid #ffffff1f;border-radius:20px 20px 0 0;flex-direction:column;width:420px;max-width:420px;height:auto;max-height:80vh;display:flex;overflow:hidden auto;box-shadow:0 8px 32px #0006,inset 0 1px 1px #ffffff26;background:#161616b3!important}#shareDropdown{background-color:var(--yt-enhance-menu-bg,#252525);z-index:11;border-radius:6px;padding:10px;display:none;position:absolute;top:50px;right:100px;box-shadow:0 4px 12px #0003}#shareDropdown a{color:var(--text-custom);font-size:14px;line-height:2;text-decoration:none}#shareDropdown a:hover{color:var(--primary-custom)}.header-mdcm{z-index:10;background-color:#161616f2;border-bottom:1px solid #ffffff1a;border-radius:20px 20px 0 0;justify-content:space-between;align-items:center;padding:12px 16px;display:flex;position:sticky;top:0}.header-mdcm h1{align-items:center;gap:8px;margin:0;font-size:16px;font-weight:600;display:flex}.header-mdcm i{color:var(--primary-custom)}.icons-mdcm{gap:4px;display:flex}.icons-mdcm i{color:var(--yt-enhance-menu-accent,var(--text-custom))}.icon-btn-mdcm{color:var(--text-custom);cursor:pointer;background:#ffffff1a;border:none;border-radius:6px;width:28px;height:28px;transition:all .3s}.icon-btn-mdcm:hover{background:#fff3;transform:translateY(-2px)}.icon-btn-mdcm i{color:var(--text-custom);outline:none;text-decoration:none}.tabs-mdcm{z-index:10;-ms-overflow-style:none;background-color:#161616f2;border-bottom:1px solid #ffffff0d;gap:8px;margin:0;padding:10px 12px;display:flex;position:sticky;top:52px}.tabs-mdcm::-webkit-scrollbar{background-color:#0000;height:0}.tabs-mdcm:hover::-webkit-scrollbar{height:6px}.tabs-mdcm::-webkit-scrollbar-thumb{background-color:#ff000080;border-radius:3px}.tabs-mdcm::-webkit-scrollbar-track{background-color:#0000}.tab-mdcm{cursor:pointer;color:var(--text-custom-secondary);white-space:nowrap;background:#ffffff0d;border:none;border-radius:6px;flex:1 0;justify-content:center;align-items:center;gap:6px;padding:6px 10px;font-size:12px;transition:all .3s;display:flex}.tab-mdcm svg{fill:currentColor;width:14px;height:14px}.tab-mdcm.active{color:#fff;box-shadow:0 4px 16px color-mix(in srgb, var(--yt-enhance-menu-accent,var(--primary-custom)) 40%, transparent);font-weight:600;background:var(--yt-enhance-menu-accent,var(--primary-custom))!important}.tab-mdcm:hover:not(.active){background:#ffffff1f;transform:translateY(-2px);box-shadow:0 4px 12px #00000026}.options-mdcm{scrollbar-width:thin;scrollbar-color:var(--primary-custom) var(--bg-dark-custom);flex:1;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;max-height:300px;padding:0 16px;display:grid;overflow-y:auto}.options-settings-mdcm{scrollbar-width:thin;scrollbar-color:var(--primary-custom) var(--bg-dark-custom);flex:1;gap:8px;max-height:300px;padding:0 16px;display:grid;overflow-y:auto}.card-items-end{justify-content:space-between;align-items:center;width:175px;display:flex}.radio-mdcm{width:14px;height:14px;accent-color:var(--primary-custom)}.color-picker-mdcm{cursor:pointer;background:#ffffff1a;border:1px solid #fff3;border-radius:4px;width:50px;height:24px;transition:all .3s}.color-picker-mdcm:hover{background:#fff3}.options-mdcm::-webkit-scrollbar{width:6px}.options-settings-mdcm::-webkit-scrollbar{width:6px}.options-mdcm::-webkit-scrollbar-track{background:var(--bg-dark-custom);border-radius:3px}.options-settings-mdcm::-webkit-scrollbar-track{background:var(--bg-dark-custom);border-radius:3px}.options-mdcm::-webkit-scrollbar-thumb{background:var(--primary-custom);border-radius:3px}.options-settings-mdcm::-webkit-scrollbar-thumb{background:var(--primary-custom);border-radius:3px}.options-mdcm::-webkit-scrollbar-thumb:hover{background:var(--accent-custom)}.options-settings-mdcm::-webkit-scrollbar-thumb:hover{background:var(--accent-custom)}.options-mdcm:after,.options-settings-mdcm:after{content:\"\";display:block}.option-mdcm{color:var(--text-custom);background:#ffffff0d;border:1px solid #ffffff0d;border-radius:6px;grid-template-columns:auto 1fr;align-items:center;gap:6px;margin-bottom:0;padding:5px;transition:all .3s;display:grid}.option-mdcm:hover{background:#ffffff14;border-color:#ffffff1a}.option-settings-mdcm{background:#ffffff0d;border:1px solid #ffffff0d;border-radius:6px;justify-content:space-between;align-items:center;gap:6px;margin-bottom:0;padding:6px;transition:all .3s;display:flex}.option-settings-mdcm:hover{background:#ffffff14;border-color:#ffffff1a}.tab-content{display:none}.tab-content.active{margin-bottom:10px;display:block}.checkbox-mdcm{width:14px;height:14px;accent-color:var(--yt-enhance-menu-accent,var(--primary-custom))!important}.yt-tools-audio-only-player{background-color:#000!important;background-position:50%!important;background-repeat:no-repeat!important;background-size:cover!important}.yt-tools-audio-only-video{opacity:0!important}label{color:var(--text-custom);font-size:12px}.slider-container-mdcm{background:#ffffff0d;border-radius:6px;padding:10px}.slider-mdcm{width:100%;height:3px;margin:10px 0;accent-color:var(--yt-enhance-menu-accent,var(--primary-custom))!important}.reset-btn-mdcm{color:var(--text-custom);cursor:pointer;background:#ffffff1a;border:1px solid #fff3;border-radius:4px;padding:5px 10px;font-size:11px;transition:all .3s}.reset-btn-mdcm:hover{background:#fff3}.quality-selector-mdcm select{color:var(--text-custom);appearance:none;cursor:pointer;border:1px solid #fff3;border-radius:4px;outline:none;width:fit-content;padding:3px;font-size:11px;position:relative;background:var(--yt-enhance-menu-accent,var(--primary-custom))!important}.quality-selector-mdcm{background:#ffffff0d;border-radius:6px;padding:10px}.select-wrapper-mdcm{display:inline-block;position:relative}.select-wrapper-mdcm select{-webkit-appearance:auto;-moz-appearance:auto}.container-mdcm .options-mdcm{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-height:340px;padding:2px 14px 10px}.container-mdcm .options-mdcm>label{min-width:0;display:block}.container-mdcm .toggle-row{background:#ffffff0a;border:1px solid #ffffff0f;border-radius:12px;justify-content:space-between;align-items:center;gap:10px;min-height:48px;padding:10px 11px;transition:all .3s cubic-bezier(.34,1.56,.64,1);display:flex}.container-mdcm .toggle-row:hover{background:#ffffff17;border-color:#ffffff26;transform:translateY(-2px);box-shadow:0 6px 16px #00000026}.container-mdcm .toggle-label-text{min-width:0;color:var(--yt-enhance-menu-text,var(--text-custom));align-items:center;gap:8px;font-size:12px;font-weight:600;line-height:1.25;display:flex}.container-mdcm .toggle-label-text i{width:16px;color:var(--yt-enhance-menu-accent,var(--primary-custom));text-align:center;font-size:13px}.container-mdcm .toggle-switch-mdcm{flex:none;width:38px;height:22px;margin:0;display:inline-flex;position:relative}.container-mdcm .checkbox-mdcm{opacity:0;width:0;height:0;position:absolute}.container-mdcm .toggle-slider-mdcm{cursor:pointer;background:#ffffff1f;border:1px solid #ffffff1a;border-radius:999px;transition:all .4s cubic-bezier(.34,1.56,.64,1);position:absolute;inset:0}.container-mdcm .toggle-slider-mdcm:before{content:\"\";background:#fff;border-radius:50%;width:16px;height:16px;transition:all .4s cubic-bezier(.34,1.56,.64,1);position:absolute;top:2px;left:2px;box-shadow:0 2px 5px #0000004d}.container-mdcm .checkbox-mdcm:checked+.toggle-slider-mdcm{background:var(--yt-enhance-menu-accent,var(--primary-custom));border-color:var(--yt-enhance-menu-accent,var(--primary-custom));box-shadow:0 0 12px color-mix(in srgb, var(--yt-enhance-menu-accent,var(--primary-custom)) 50%, transparent)}.container-mdcm .checkbox-mdcm:checked+.toggle-slider-mdcm:before{transform:translate(16px);box-shadow:-2px 2px 5px #0003}.container-mdcm .quality-selector-mdcm,.container-mdcm .slider-container-mdcm{background:#ffffff0e;border:1px solid #ffffff13;border-radius:10px;padding:11px}.container-mdcm .select-wrapper-mdcm,.container-mdcm .select-wrapper-mdcm label{flex-direction:column;gap:7px;width:100%;min-width:0;font-size:12px;font-weight:600;display:flex}.container-mdcm .quality-selector-mdcm select{width:100%;min-height:34px;color:var(--yt-enhance-menu-text,var(--text-custom));border:1px solid #ffffff24;border-radius:8px;padding:7px 9px;font-size:12px;background:#0000003d!important}.container-mdcm .quality-selector-mdcm select:focus,.container-mdcm .slider-mdcm:focus{outline:2px solid color-mix(in srgb, var(--yt-enhance-menu-accent,var(--primary-custom)) 55%, transparent);outline-offset:2px}.container-mdcm .slider-container-mdcm label{justify-content:space-between;align-items:center;gap:8px;font-weight:600;display:flex}.container-mdcm .reset-btn-mdcm{border-radius:8px;width:100%;min-height:32px;font-weight:600}.actions-mdcm{-webkit-backdrop-filter:blur(16px);box-sizing:border-box;border-bottom:1px solid #ffffff1a;border-radius:0 0 16px 16px;justify-content:space-between;align-items:center;gap:6px;width:100%;padding:12px 16px;display:flex;position:sticky;top:0;background:#1e1e1e99!important}.action-buttons-mdcm{gap:6px;display:flex}.action-btn-mdcm{background:var(--yt-enhance-menu-accent,var(--primary-custom));color:#fff;cursor:pointer;box-shadow:0 4px 12px color-mix(in srgb, var(--yt-enhance-menu-accent,var(--primary-custom)) 40%, transparent);border:1px solid #ffffff1a;border-radius:8px;flex:1;justify-content:center;align-items:center;gap:6px;padding:8px;font-size:13px;font-weight:600;transition:all .3s cubic-bezier(.34,1.56,.64,1);display:flex}.action-btn-mdcm:hover{box-shadow:0 8px 20px color-mix(in srgb, var(--yt-enhance-menu-accent,var(--primary-custom)) 60%, transparent);filter:brightness(1.1);transform:translateY(-3px)}textarea.textarea-mdcm{width:100%;height:50px;color:var(--text-custom);resize:none;background:#ffffff0d;border:1px solid #ffffff1a;border-radius:6px;margin-top:10px;margin-bottom:12px;padding:8px;font-size:11px;transition:all .3s}textarea.textarea-mdcm:focus{border-color:var(--primary-custom);background:#ffffff14;outline:none}.container-mdcm{animation:.3s ease-out fadeIn}.developer-mdcm{color:var(--text-custom-secondary);font-size:10px}.developer-mdcm a{color:var(--primary-custom);text-decoration:none}#importExportArea{background-color:var(--yt-enhance-menu-bg,#252525);border-radius:16px;margin:0;padding:16px;display:none;box-shadow:0 4px 12px #0003}#importExportArea.active{margin-top:10px;display:block}#importExportArea textarea{width:370px;height:20px;color:var(--text-custom);resize:vertical;background-color:#ffffff0d;border:1px solid #fff3;border-radius:6px;margin-bottom:10px;padding:8px;font-size:12px}#importExportArea .action-buttons-mdcm{justify-content:space-between;gap:10px;display:flex}#importExportArea .action-btn-mdcm{background-color:var(--primary-custom);color:var(--text-custom);cursor:pointer;border:none;border-radius:6px;flex:1;padding:10px 16px;font-size:14px;font-weight:500;transition:background-color .3s}#importExportArea .action-btn-mdcm:hover{background-color:var(--accent-custom)}.yt-tools-container{box-sizing:border-box!important;justify-content:center!important;width:100%!important;margin:12px 0!important;padding:0 20px!important;display:flex!important}.yt-tools-inner-container{flex-direction:column!important;align-items:center!important;width:100%!important;display:flex!important}.yt-tools-form{flex-direction:column!important;justify-content:center!important;align-items:center!important;gap:2px!important;width:100%!important;display:flex!important}.selectcalidades,.selectcalidadesaudio{position:relative;overflow:hidden;-webkit-user-select:none!important;user-select:none!important;color:#fff!important;cursor:pointer!important;appearance:none!important;text-align:center!important;text-align-last:center!important;background:#1e1e1ed9 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") right 14px center/12px no-repeat!important;border:1px solid #ffffff14!important;border-radius:9999px!important;outline:none!important;min-width:240px!important;max-width:320px!important;height:36px!important;margin:0 auto!important;padding:0 36px 0 16px!important;font-family:Inter,-apple-system,sans-serif!important;font-size:13px!important;font-weight:600!important;line-height:36px!important;transition:border-color .2s,background .2s,box-shadow .2s!important;display:block!important;box-shadow:0 2px 8px #00000040!important}.selectcalidades:hover,.selectcalidadesaudio:hover{background-color:#2d2d2de6!important;border-color:#f009!important;box-shadow:0 4px 12px #ff00001a!important}.selectcalidades option,.selectcalidadesaudio option{color:#fff!important;text-align:center!important;background:#1e1e1e!important;padding:12px!important}.formulariodescarga,.formulariodescargaaudio{justify-content:center!important;align-items:center!important;width:100%!important;margin:0!important}.containerall{flex-direction:column!important;align-items:center!important;gap:2px!important;width:100%!important;display:flex!important}#yt-enhancement-panel{z-index:9999;position:fixed;top:60px;right:20px}.color-picker{background:0 0;border:none;width:100%;margin:0;padding:0}.slider{width:100%}#toggle-panel{z-index:10000;color:#fff;cursor:pointer;border:none;border-radius:100px;justify-content:center;width:43px;padding:5px;transition:all .5s;display:flex}#icon-menu-settings{width:24px;height:24px;color:var(--yt-spec-icon-inactive,var(--yt-spec-text-primary,#f2f2f2));cursor:pointer;-webkit-user-select:none;user-select:none;filter:drop-shadow(2px 4px 6px #000);justify-content:center;align-items:center;padding:7px;font-size:20px;display:flex}.theme-option{margin-bottom:15px}.theme-option label{align-items:center;display:flex}.theme-option{cursor:pointer;border-radius:4px;width:auto;margin-bottom:10px;padding:10px;position:relative}.theme-preview{z-index:1;border:1px solid #000;border-radius:10px;position:absolute;inset:0}.theme-option input[type=radio]{z-index:2;cursor:pointer;margin-right:10px;position:relative}.theme-name{z-index:2;color:#fff;font-size:15px;position:relative}.theme-option label{z-index:2;align-items:center;width:100%;display:flex;position:relative}.container-mdcm ::-webkit-scrollbar{width:4px;height:10px}.container-mdcm ::-webkit-scrollbar-track{background:#d5d5d5}.container-mdcm ::-webkit-scrollbar-thumb{background:#000}.color-boxes{gap:8px;display:flex}.color-box{cursor:pointer;border:1px solid #ddd9;border-radius:4px;width:20px;height:20px}.color-box.selected{border:2px solid var(--primary-custom);filter:drop-shadow(0 1px 6px red)}.containerButtons{flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;display:flex}.containerButtons>button:hover{cursor:pointer}.video-info-panel-mdcm{background:#ffffff0e;border:1px solid #ffffff14;border-radius:12px;margin:0 14px 12px;padding:14px}.video-info-empty-mdcm{text-align:center;color:var(--text-custom-secondary);padding:18px 10px;font-size:12px;line-height:1.45}.video-info-hero-mdcm{grid-template-columns:112px minmax(0,1fr);align-items:center;gap:12px;margin-bottom:12px;display:grid}.video-info-thumb-mdcm{aspect-ratio:16/9;object-fit:cover;background:#ffffff14;border:1px solid #ffffff14;border-radius:8px;width:112px}.video-info-title-mdcm{color:var(--yt-enhance-menu-text,var(--text-custom));-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0 0 6px;font-size:14px;font-weight:700;line-height:1.3;display:-webkit-box;overflow:hidden}.video-info-channel-mdcm{color:var(--text-custom-secondary);white-space:nowrap;text-overflow:ellipsis;margin:0;font-size:12px;line-height:1.35;overflow:hidden}.video-info-grid-mdcm{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;display:grid}.video-info-item-mdcm{background:#0000002e;border:1px solid #ffffff12;border-radius:9px;min-width:0;padding:9px 10px}.video-info-label-mdcm{color:var(--text-custom-secondary);letter-spacing:.04em;text-transform:uppercase;margin-bottom:4px;font-size:10px;font-weight:700;display:block}.video-info-value-mdcm{color:var(--yt-enhance-menu-text,var(--text-custom));white-space:nowrap;text-overflow:ellipsis;font-size:12px;font-weight:600;line-height:1.25;display:block;overflow:hidden}.video-info-progress-mdcm{background:#ffffff1f;border-radius:999px;grid-column:1/-1;height:5px;overflow:hidden}.video-info-progress-fill-mdcm{background:var(--yt-enhance-menu-accent,var(--primary-custom));border-radius:inherit;width:0;height:100%;transition:width .2s}.video-info-actions-mdcm{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px;display:grid}.video-info-copy-mdcm{min-height:32px;color:var(--yt-enhance-menu-text,var(--text-custom));cursor:pointer;background:#ffffff14;border:1px solid #ffffff1f;border-radius:8px;font-size:11px;font-weight:700;transition:background .16s,border-color .16s}.video-info-copy-mdcm:hover{background:var(--yt-enhance-menu-accent,var(--primary-custom));border-color:var(--yt-enhance-menu-accent,var(--primary-custom))}@media (width<=520px){.container-mdcm{width:calc(100vw - 24px);max-width:calc(100vw - 24px)}.container-mdcm .options-mdcm,.video-info-hero-mdcm,.video-info-grid-mdcm,.video-info-actions-mdcm{grid-template-columns:1fr}.video-info-thumb-mdcm{width:100%}}ytd-watch-metadata .yt-tools-inner-container{gap:10px!important}ytd-watch-metadata .containerall{gap:0!important;padding-bottom:0!important}ytd-watch-metadata .yt-tools-container{margin-bottom:-8px!important}ytd-watch-metadata .content_collapsible_colors{margin-top:0!important}ytd-watch-metadata .download-container{position:relative;overflow:hidden;border-radius:12px!important;flex-direction:column!important;width:90%!important;max-width:450px!important;margin:10px auto!important;padding:14px!important;display:flex!important}#yt-stats{color:#fff;background:#1a1a1a;border-radius:10px;width:320px;padding:15px;font-family:Arial,sans-serif;display:none;position:fixed;top:60px;right:20px;box-shadow:0 4px 12px #0006}#yt-stats-toggle{color:#fff;cursor:pointer;border-radius:5px;padding:12px 20px;font-size:12px}.stat-row{margin:15px 0}.progress{background:#333;border-radius:3px;height:6px;margin:8px 0;overflow:hidden}.progress-bar{height:100%;transition:width .3s}.total-bar{background:#4af!important}.video-bar{background:#0f8!important}.shorts-bar{background:#f44!important}#cinematics{height:100vh;width:90vw!important;position:absolute!important}#cinematics div{pointer-events:none;position:fixed;inset:0;transform:scale(1.5,2)}#cinematics>div>div>canvas:first-child,#cinematics>div>div>canvas:nth-child(2){height:100vh;width:90vw!important;position:absolute!important}ytd-watch-flexy[cinematic-container-initialized] #primary-inner{flex-direction:column;align-items:center;display:flex}ytd-watch-flexy[cinematic-container-initialized] .yt-tools-container{width:100%;max-width:var(--ytd-watch-flexy-max-player-width,1280px)}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist{-webkit-backdrop-filter:blur(20px)saturate(140%)!important;background:#1414149e!important;border:1px solid #ffffff14!important;border-radius:16px!important;overflow:hidden!important;box-shadow:0 4px 16px #00000061!important}body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist{-webkit-backdrop-filter:blur(24px)saturate(180%)!important;background:#19191973!important;border:1px solid #ffffff26!important;border-top-color:#ffffff40!important;border-radius:16px!important;overflow:hidden!important;box-shadow:0 8px 32px #0006,inset 0 1px 1px #ffffff1a!important}body.yt-style-transparent ytd-watch-flexy ytd-playlist-panel-renderer#playlist{-webkit-backdrop-filter:none!important;box-shadow:none!important;background:0 0!important;border:none!important}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist>#container,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist>#container,body.yt-style-transparent ytd-watch-flexy ytd-playlist-panel-renderer#playlist>#container,body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist #items,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist #items,body.yt-style-transparent ytd-watch-flexy ytd-playlist-panel-renderer#playlist #items{background:0 0!important}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist .header,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist .header{background:#ffffff0a!important;border-bottom:1px solid #ffffff14!important}body.yt-style-transparent ytd-watch-flexy ytd-playlist-panel-renderer#playlist .header{background:0 0!important;border-bottom:none!important}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist ytd-playlist-panel-video-renderer,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist ytd-playlist-panel-video-renderer{background:0 0!important}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist ytd-playlist-panel-video-renderer:hover #container,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist ytd-playlist-panel-video-renderer:hover #container{background:#ffffff14!important}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist ytd-thumbnail,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist ytd-thumbnail{border-radius:8px!important;overflow:hidden!important}body.yt-style-blur ytd-watch-flexy ytd-playlist-panel-renderer#playlist #meta,body.yt-style-liquid ytd-watch-flexy ytd-playlist-panel-renderer#playlist #meta,body.yt-style-transparent ytd-watch-flexy ytd-playlist-panel-renderer#playlist #meta{min-width:0!important}.yt-bookmarks-panel{background:#ffffff0f;border:1px solid #ffffff1f;border-radius:10px;margin-top:10px;padding:8px}.yt-bm-empty{color:var(--text-custom-secondary);font-size:12px}.yt-bm-item{border-radius:8px;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:6px;display:grid}.yt-bm-item:hover{background:#ffffff0f}.yt-bm-go{color:#fff;cursor:pointer;white-space:nowrap;background:#22c55e33;border:none;border-radius:6px;padding:4px 8px;font-size:12px}.yt-bm-label{color:var(--text-custom);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.yt-bm-del{color:#fff;cursor:pointer;background:#ef444433;border:none;border-radius:6px;padding:4px 8px;font-size:12px}.yt-continue-watching-panel{background:#ffffff0f;border:1px solid #ffffff1f;border-radius:10px;max-height:400px;margin-top:10px;padding:8px;overflow-y:auto}.yt-cw-header{justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;display:flex}.yt-cw-header-title{color:var(--text-custom,#fff);font-size:12px;font-weight:600}.yt-cw-clear{color:#fff;cursor:pointer;background:#ef44442e;border:none;border-radius:6px;padding:4px 8px;font-size:12px}.yt-cw-empty{color:var(--text-custom-secondary,#aaa);font-size:12px}.yt-cw-item{border-radius:10px;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;padding:8px;display:grid}.yt-cw-item:hover{background:#ffffff0f}.yt-cw-thumb-wrap{background:#ffffff14;border-radius:8px;flex:none;width:72px;height:40px;overflow:hidden}.yt-cw-thumb{object-fit:cover;width:100%;height:100%;display:block}.yt-cw-title{color:var(--text-custom,#fff);text-overflow:ellipsis;white-space:nowrap;max-width:520px;font-size:12px;font-weight:600;overflow:hidden}.yt-cw-meta{color:var(--text-custom-secondary,#aaa);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.yt-cw-actions{align-items:center;gap:8px;display:flex}.yt-cw-go{color:#fff;cursor:pointer;white-space:nowrap;background:#22c55e33;border:none;border-radius:6px;padding:4px 8px;font-size:12px}.yt-cw-del{color:#fff;cursor:pointer;background:#ef444433;border:none;border-radius:6px;padding:4px 8px;font-size:12px}body{margin:0;padding:0;overflow:hidden scroll}.style-scope.ytd-comments{height:auto;overflow:hidden auto}ytd-comment-view-model[is-reply] #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model,ytd-comment-view-model[is-creator-reply] #author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model{border-radius:50%;width:40px;height:40px}#author-thumbnail img.yt-img-shadow{border-radius:50%!important}#author-thumbnail.ytd-comment-view-model yt-img-shadow.ytd-comment-view-model{border-radius:50%;width:40px;height:40px;overflow:visible}ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer{--ytd-item-section-item-margin:8px;height:auto;overflow:hidden auto}.right-section.ytcp-header{flex:1;justify-content:end;align-items:center;gap:45px;display:flex}#meta.ytd-playlist-panel-video-renderer{flex-direction:column-reverse;flex:1e-9px;min-width:0;padding:0 8px;display:flex}.buttons-tranlate,.select-traductor{background:#000;border:none;border-radius:10px;width:70px;margin-left:10px;padding:3px 0;font-size:10px;color:#fbf4f4!important}.buttons-tranlate:hover{cursor:pointer;background-color:#6b6b6b}button.botones_div{margin:0;padding:0}button.botones_div:hover{cursor:pointer;color:#6b6b6b!important}.tab-button:hover{cursor:pointer;color:#fff!important;background-color:#ec3203!important}.traductor-container{align-items:center;gap:8px;margin-top:4px;display:inline-block}#eyes{opacity:0;width:24px;height:24px;position:absolute;left:0}.containerButtons{flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:6px!important;width:100%!important;padding:6px 0!important;display:flex!important}.containerButtons>button.botones_div{cursor:pointer!important;color:var(--yt-spec-text-secondary,#aaa)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:#ffffff14!important;border:none!important;border-radius:9999px!important;justify-content:center!important;align-items:center!important;margin:0!important;padding:8px 12px!important;transition:background .2s,color .2s,transform .15s!important;display:flex!important}.containerButtons>button.botones_div:hover{color:var(--yt-spec-text-primary,#fff)!important;background:#ffffff26!important;transform:scale(1.05)!important}.containerButtons>button.botones_div:active{transform:scale(.95)!important}.containerButtons>button.botones_div svg{width:18px!important;height:18px!important}.download-container{--download-accent:#8b949e;--download-accent-soft:#8b949e24;--download-accent-strong:#8b949e52;-webkit-backdrop-filter:blur(8px);background:#181a1de6;border:1px solid #ffffff14;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;box-shadow:0 8px 18px #0003,inset 0 1px #ffffff0d;border-radius:12px!important;flex-direction:column!important;width:90%!important;max-width:450px!important;margin:8px auto!important;padding:12px!important;display:flex!important}.download-container:before{content:\"\";background:linear-gradient(90deg, var(--download-accent) 0 3px, transparent 3px), radial-gradient(circle at 16% 0%, var(--download-accent-soft), transparent 38%);pointer-events:none;border-radius:12px;position:absolute;inset:0}.download-container.video{--download-accent:#ef4444;--download-accent-soft:#ef444424;--download-accent-strong:#ef444457;color:#fff}.download-container.audio{--download-accent:#22c55e;--download-accent-soft:#22c55e24;--download-accent-strong:#22c55e57;color:#fff}.download-info{z-index:1;justify-content:flex-start;align-items:center;gap:10px;min-width:0;margin-bottom:10px;padding-left:0;padding-right:34px;display:flex;position:relative}.download-kind{background:var(--download-accent-soft);border:1px solid var(--download-accent-strong);color:#f8fafc;text-align:center;border-radius:7px;flex:none;min-width:42px;padding:4px 8px;font-size:10px;font-weight:800;line-height:1}.download-copy{flex-direction:column;flex:auto;gap:3px;min-width:0;display:flex}.download-text{letter-spacing:0;text-shadow:0 1px 2px #0003;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:700;overflow:hidden}.download-provider{opacity:.64;font-size:11px;line-height:1.2}.download-quality{opacity:.78;text-overflow:ellipsis;white-space:nowrap;background:#ffffff14;border:1px solid #ffffff14;border-radius:7px;flex:0 auto;max-width:40%;padding:4px 7px;font-size:11px;overflow:hidden}.progress-container{z-index:1;align-items:center;gap:12px;margin:4px 0 0;display:flex;position:relative}.progress-bar{background:#ffffff1f;border-radius:99px;flex:1;height:6px;overflow:hidden;box-shadow:inset 0 1px 3px #0000001a}.progress-fill{background:linear-gradient(90deg, var(--download-accent), #d9f99d);width:0%;height:100%;box-shadow:0 0 10px var(--download-accent-strong);border-radius:99px;transition:width .5s cubic-bezier(.34,1.56,.64,1);position:relative}.progress-fill.indeterminate{animation:1.5s ease-in-out infinite progress-pulse;width:30%!important}.progress-fill.indeterminate:after{animation:.8s ease-in-out infinite shimmer-dl}@keyframes progress-pulse{0%{opacity:.6;transform:scaleX(.6)}50%{opacity:1;transform:scaleX(1)}to{opacity:.6;transform:scaleX(.6)}}.progress-fill:after{content:\"\";background:linear-gradient(90deg,#0000,#fff9,#0000);animation:1.2s ease-in-out infinite shimmer-dl;position:absolute;inset:0}@keyframes shimmer-dl{0%{transform:translate(-100%)}to{transform:translate(100%)}}.download-container .download-status-text{opacity:.82;text-align:left;color:#ffffffd1;overflow-wrap:anywhere;z-index:1;background:#ffffff0e;border:1px solid #ffffff0f;border-radius:8px;margin-top:10px;padding:8px 10px;font-size:12px;font-weight:500;line-height:1.35;transition:opacity .3s;display:none;position:relative}.download-container.is-downloading .download-status-text,.download-container.completed .download-status-text,.download-container.error .download-status-text{display:block}.download-container .download-status-text.status-dot:before{content:\"\";background:var(--download-accent);vertical-align:middle;border-radius:50%;width:6px;height:6px;margin-right:6px;animation:1.2s ease-in-out infinite status-dot-blink;display:inline-block}@keyframes status-dot-blink{0%,to{opacity:1}50%{opacity:.3}}.progress-text{text-align:right;font-variant-numeric:tabular-nums;color:#ffffffe6;min-width:36px;font-size:13px;font-weight:700}.download-footer{opacity:.7;text-align:center;padding:4px 0;font-size:11px}.download-footer a{color:#fff;text-decoration:none}.download-container.completed{--download-accent:#22c55e;--download-accent-soft:#22c55e21;--download-accent-strong:#22c55e52;background:#161c19f0!important;border-color:#22c55e33!important;box-shadow:0 8px 20px #00000038,inset 0 1px #ffffff0d!important}.download-container.completed .download-text{color:#dcfce7;font-weight:800}.download-container.completed .download-status-text{color:#dcfce7e6;background:#22c55e14;border-color:#22c55e29}.download-container.completed .progress-fill:after{animation:none}.download-container.completed .status-dot:before{background:#22c55e!important;animation:none!important}#yt-like-dislike-bar-mdcm{background:#ffffff1f;border-radius:999px;max-width:305px;height:6px;margin-top:6px;overflow:hidden}#yt-like-dislike-bar-mdcm .like{float:left;height:100%;background:#22c55e!important}#yt-like-dislike-bar-mdcm .dislike{float:left;height:100%;background:#ef4444!important}.progress-retry-btn{color:#fff;cursor:pointer;z-index:2;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);background:#ffffff26;border:none;border-radius:8px;justify-content:center;align-items:center;width:28px;height:28px;font-size:14px;transition:all .25s;display:flex;position:absolute;top:8px;right:8px}.progress-retry-btn:hover{background:#ffffff3d;transform:scale(1.15)rotate(180deg)}.download-again-btn{background:var(--download-accent-soft);border:none;border:1px solid var(--download-accent-strong);color:#fff;cursor:pointer;z-index:2;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border-radius:8px;justify-content:center;align-items:center;width:28px;height:28px;font-size:14px;transition:all .25s;display:flex;position:absolute;top:8px;right:8px}.download-again-btn:hover{background:var(--download-accent-strong);transform:scale(1.15);box-shadow:0 0 20px #22c55e4d}.download-container{position:relative}.download-actions{z-index:1;gap:8px;margin:4px 0 0;display:flex;position:relative}.download-btn{cursor:pointer;color:#fff;letter-spacing:0;text-transform:none;border:1px solid #ffffff26;border-radius:9999px;flex:1;min-height:36px;padding:8px 14px;font-size:13px;font-weight:750;transition:all .25s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden}.download-btn:after{content:\"\";opacity:0;background:#ffffff1a;width:200%;height:200%;transition:all .3s;position:absolute;top:-50%;left:-50%;transform:rotate(45deg)}.download-btn.video-btn{background:linear-gradient(135deg,#ef4444,#b91c1c);box-shadow:0 2px 10px #dc262642}.download-btn.audio-btn{background:linear-gradient(135deg,#20c997,#0f8f6e);box-shadow:0 2px 10px #10b9813d}.download-btn:hover{border-color:#ffffff4d;transform:translateY(-2px);box-shadow:0 6px 20px #00000059}.download-btn:hover:after{opacity:1;transform:rotate(45deg)translateY(-20px)}.download-btn:active{transform:translateY(0)}.download-info{padding-left:0!important}.download-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;transform:none}.retry-btn{cursor:pointer;color:#fff;letter-spacing:0;text-transform:none;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:9999px;flex:1;min-height:34px;padding:8px 16px;font-size:13px;font-weight:600;transition:all .25s;box-shadow:0 2px 10px #d977064d}.retry-btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px #00000040}.retry-btn:active{transform:translateY(0)}.containerall{flex-direction:column;justify-content:center;align-items:center;max-width:800px;margin:auto;padding-bottom:16px;display:flex}.container .botoncalidades{width:24.6%;margin:3px 2px}.botoncalidades:first-child{background-color:#0af}.botoncalidades:last-child{background-color:red;width:100px}.selectcalidades,.botoncalidades,.selectcalidadesaudio{color:#f6f7f9;text-align:center;background:#ffffff14;border:1px solid #ffffff1a;border-radius:10px;outline:none;width:min(82%,400px);min-height:36px;margin:6px 2px 8px;padding:0 34px 0 14px;font-size:13px;font-weight:600}.botoncalidades{color:#fff;background-color:#049c16;border:0 solid #000;border-radius:10px;width:70px;height:30px;margin:2px;font-size:20px}.botoncalidades:hover,.bntcontainer:hover{cursor:pointer}.ocultarframe,.ocultarframeaudio{display:none}.checked_updates{cursor:pointer}#export-config,#import-config{color:#fff;border:none;justify-content:center;align-items:center;gap:10px;width:100%;padding:5px;display:flex;background-color:var(--yt-enhance-menu-accent,var(--primary-custom))!important}#export-config:hover,#import-config:hover{color:#fff;cursor:pointer;background-color:red}html:not([data-mdcm-shorts-channel-name=\"1\"]) .yt-tools-shorts-channel-name{display:none!important}.yt-tools-shorts-channel-name{color:var(--yt-spec-text-secondary,#aaa);text-overflow:ellipsis;white-space:nowrap;max-width:100%;margin-bottom:2px;font-size:12px;line-height:1.2;overflow:hidden}.yt-tools-shorts-stats-wrap{color:var(--yt-spec-text-secondary,#aaa);margin-top:4px;font-size:11px;line-height:1.2}.yt-tools-shorts-stats-wrap .yt-tools-shorts-stats-row{flex-wrap:wrap;align-items:center;gap:2px;display:inline-flex}ytd-shorts reel-action-bar-view-model .yt-spec-button-shape-with-label,ytd-reel-video-renderer reel-action-bar-view-model .yt-spec-button-shape-with-label,reel-action-bar-view-model .yt-spec-button-shape-with-label{flex-direction:column!important;align-items:center!important;gap:4px!important;width:58px!important;min-width:58px!important;max-width:58px!important;display:flex!important}ytd-shorts reel-action-bar-view-model .yt-spec-button-shape-next--icon-button,ytd-reel-video-renderer reel-action-bar-view-model .yt-spec-button-shape-next--icon-button,reel-action-bar-view-model .yt-spec-button-shape-next--icon-button{flex:0 0 48px!important;justify-content:center!important;align-items:center!important;width:48px!important;min-width:48px!important;max-width:48px!important;height:48px!important;min-height:48px!important;max-height:48px!important;padding:0!important;display:inline-flex!important}ytd-shorts reel-action-bar-view-model .yt-spec-button-shape-next__icon,ytd-reel-video-renderer reel-action-bar-view-model .yt-spec-button-shape-next__icon,reel-action-bar-view-model .yt-spec-button-shape-next__icon,ytd-shorts reel-action-bar-view-model .yt-icon-shape,ytd-reel-video-renderer reel-action-bar-view-model .yt-icon-shape,reel-action-bar-view-model .yt-icon-shape{justify-content:center!important;align-items:center!important;width:24px!important;min-width:24px!important;height:24px!important;min-height:24px!important;display:inline-flex!important}ytd-shorts reel-action-bar-view-model .yt-spec-button-shape-with-label__label,ytd-reel-video-renderer reel-action-bar-view-model .yt-spec-button-shape-with-label__label,reel-action-bar-view-model .yt-spec-button-shape-with-label__label{text-align:center!important;width:58px!important;min-width:58px!important;max-width:58px!important;margin-top:0!important;overflow:hidden!important}ytd-shorts reel-action-bar-view-model .yt-spec-button-shape-with-label__label span,ytd-reel-video-renderer reel-action-bar-view-model .yt-spec-button-shape-with-label__label span,reel-action-bar-view-model .yt-spec-button-shape-with-label__label span,ytd-shorts reel-action-bar-view-model [role=text],ytd-reel-video-renderer reel-action-bar-view-model [role=text],reel-action-bar-view-model [role=text]{white-space:nowrap!important;text-overflow:ellipsis!important;text-align:center!important;max-width:58px!important;font-size:12px!important;font-weight:600!important;line-height:16px!important;display:block!important;overflow:hidden!important}ytd-shorts reel-action-bar-view-model [data-yt-tools-shorts-views] [role=text],ytd-shorts reel-action-bar-view-model [data-yt-tools-shorts-rating] [role=text],reel-action-bar-view-model [data-yt-tools-shorts-views] [role=text],reel-action-bar-view-model [data-yt-tools-shorts-rating] [role=text]{font-size:11px!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop{transform-origin:bottom!important;align-items:center!important;gap:8px!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytSpecButtonShapeWithLabelHost{flex-direction:column!important;align-items:center!important;gap:3px!important;width:52px!important;min-width:52px!important;max-width:52px!important;display:flex!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytSpecButtonShapeNextIconButton{flex:0 0 44px!important;width:44px!important;min-width:44px!important;max-width:44px!important;height:44px!important;min-height:44px!important;max-height:44px!important;padding:0!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytSpecButtonShapeNextIcon,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytIconWrapperHost,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytSpecIconShapeHost,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop yt-icon{width:23px!important;min-width:23px!important;height:23px!important;min-height:23px!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytSpecButtonShapeWithLabelLabel,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .yt-spec-button-shape-with-label__label{text-align:center!important;width:52px!important;min-width:52px!important;max-width:52px!important;margin-top:0!important;overflow:hidden!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .ytAttributedStringHost,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop .yt-spec-button-shape-with-label__label span,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [role=text]{white-space:nowrap!important;text-overflow:ellipsis!important;text-align:center!important;max-width:52px!important;font-size:11px!important;font-weight:600!important;line-height:14px!important;display:block!important;overflow:hidden!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-classic] .yt-spec-button-shape-with-label__label,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-classic] .ytSpecButtonShapeWithLabelLabel{display:none!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-classic] .ytSpecButtonShapeWithLabelHost,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-views] .ytSpecButtonShapeWithLabelHost,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-rating] .ytSpecButtonShapeWithLabelHost,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-classic] .yt-spec-button-shape-with-label,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-views] .yt-spec-button-shape-with-label,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-rating] .yt-spec-button-shape-with-label{width:48px!important;min-width:48px!important;max-width:48px!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-classic] .ytSpecButtonShapeNextIconButton,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-views] .ytSpecButtonShapeNextIconButton,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-rating] .ytSpecButtonShapeNextIconButton,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-classic] .yt-spec-button-shape-next--icon-button,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-views] .yt-spec-button-shape-next--icon-button,reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop [data-yt-tools-shorts-rating] .yt-spec-button-shape-next--icon-button{flex-basis:40px!important;width:40px!important;min-width:40px!important;max-width:40px!important;height:40px!important;min-height:40px!important;max-height:40px!important}reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop pivot-button-view-model a{width:44px!important;min-width:44px!important;max-width:44px!important;height:44px!important;min-height:44px!important;max-height:44px!important}@media (height<=780px){reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop{transform:scale(.92)!important}}@media (height<=700px){reel-action-bar-view-model.ytwReelActionBarViewModelHostDesktop{transform:scale(.86)!important}}.yt-image-avatar-download{z-index:1000;filter:drop-shadow(1px 0 6px red);color:var(--ytcp-text-primary);cursor:pointer;background:0 0;border:none;position:absolute;bottom:-10px;right:-14px}.custom-classic-btn{width:48px;height:48px;color:var(--yt-spec-icon-inactive);cursor:pointer;background-color:#ffffff1a;border:none;border-radius:50%;justify-content:center;align-items:center;margin:0 8px;font-size:24px;display:flex}.custom-classic-btn:hover{background-color:#fff3}:root{--ytp-accent:#ff2b2b;--ytp-accent-soft:#ff2b2b29;--ytp-bg:#111;--ytp-bg-elevated:#181818;--ytp-bg-raised:#202020;--ytp-border:#ffffff1a;--ytp-border-strong:#ffffff29;--ytp-text:#fffffff0;--ytp-text-muted:#ffffff9e;--ytp-text-faint:#ffffff61;--ytp-shadow:0 18px 48px #00000080;--ytp-header-bg:#141414;--stat-accent:var(--ytp-accent);--stat-bg:var(--ytp-accent-soft)}.stats-container{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 16px 14px;display:grid}.stat-card{background:var(--ytp-bg-elevated);border:1px solid var(--ytp-border);border-radius:8px;align-items:center;gap:10px;min-width:0;min-height:86px;padding:12px;transition:background .16s,border-color .16s;display:flex}.stat-card:hover{border-color:var(--ytp-border-strong);background:#1d1d1d}.stat-card-wide{grid-column:1/-1}.stat-card-icon{width:38px;height:38px;color:var(--stat-accent);background:var(--stat-bg);border-radius:8px;flex:none;justify-content:center;align-items:center;display:flex}.stat-card-icon i{font-size:15px}.stat-card-body{flex:1;min-width:0}.stat-label{max-width:100%;color:var(--ytp-text-muted);letter-spacing:.04em;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;font-size:10px;font-weight:700;line-height:1.2;display:block;overflow:hidden}.stat-value{max-width:100%;color:var(--ytp-text);text-overflow:ellipsis;white-space:nowrap;margin:3px 0 7px;font-size:15px;font-weight:700;line-height:1.25;display:block;overflow:hidden}.stat-title{font-size:13px}.stat-meta{color:var(--ytp-text-faint);text-transform:none;font-size:10px}.stat-bar{background:#ffffff14;border-radius:4px;height:4px;overflow:hidden}.stat-bar-fill{background:var(--stat-accent);border-radius:inherit;height:100%;transition:width .28s}.section-header{color:var(--ytp-text);letter-spacing:.04em;text-transform:uppercase;align-items:center;gap:8px;margin:16px 16px 8px;font-size:12px;font-weight:700;line-height:1.2;display:flex}.section-header i{color:var(--ytp-accent);font-size:12px}#weekly-chart{background:var(--ytp-bg-elevated);border:1px solid var(--ytp-border);border-radius:8px;align-items:flex-end;gap:5px;height:106px;margin:0 16px;padding:10px 8px 8px;display:flex}.week-bar-wrapper{flex-direction:column;flex:1;align-items:center;gap:3px;min-width:0;height:100%;display:flex}.week-label{color:var(--ytp-text-faint);font-size:9px;line-height:1}.week-bar-track{background:#ffffff0f;border-radius:5px;flex:1;align-items:flex-end;width:100%;min-height:42px;display:flex}.week-bar-fill{border-radius:inherit;background:#0ea5e9;width:100%;min-height:2px;transition:height .24s}.is-today .week-bar-fill{background:linear-gradient(#0ea5e9 0%,#38bdf8 100%);box-shadow:0 0 8px #0ea5e980}.is-today .week-label{color:#38bdf8;font-weight:700}.week-bar-val{max-width:100%;min-height:12px;color:var(--ytp-text-faint);text-align:center;text-overflow:ellipsis;white-space:nowrap;font-size:8px;line-height:1.1;overflow:hidden}#top-videos-list{background:var(--ytp-bg-elevated);border:1px solid var(--ytp-border);border-radius:8px;max-height:210px;margin:0 16px;padding:4px 12px;overflow-y:auto}.top-video-row{border-bottom:1px solid #ffffff0f;border-radius:4px;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 4px;text-decoration:none;transition:background .12s;display:grid}.top-video-row:hover{background:#ffffff0a}.top-video-row:last-child{border-bottom:0}.top-video-rank{color:var(--ytp-text-faint);text-align:center;font-size:11px;font-weight:700}.top-video-title,.top-video-chan,.top-video-time{text-overflow:ellipsis;white-space:nowrap;line-height:1.25;overflow:hidden}.top-video-title{color:var(--ytp-text);font-size:12px;font-weight:500}.top-video-chan{color:var(--ytp-text-faint);font-size:10px}.top-video-time{color:var(--ytp-text-muted);font-variant-numeric:tabular-nums;font-size:12px}.stat-empty{color:var(--ytp-text-faint);text-align:center;padding:14px 8px;font-size:12px}.panel-actions{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 16px 0;display:grid}.btn-mdcm{color:#fff;background:var(--ytp-accent);cursor:pointer;letter-spacing:0;border:1px solid #0000;border-radius:8px;justify-content:center;align-items:center;gap:8px;min-height:38px;padding:9px 12px;font-size:13px;font-weight:700;transition:background .16s,border-color .16s,color .16s;display:inline-flex}.btn-mdcm:hover{background:#ff4040}.btn-secondary{color:var(--ytp-text);background:var(--ytp-bg-raised);border-color:var(--ytp-border)}.btn-secondary:hover{border-color:var(--ytp-border-strong);background:#292929}.btn-secondary.danger:hover{color:#fff;background:#b91c1c;border-color:#b91c1c}.stat-card[style*=fb923c] .stat-card-icon i{animation:2s ease-in-out infinite streak-pulse}@keyframes streak-pulse{0%,to{transform:scale(1)}50%{transform:scale(1.15)}}.yt-tools-audio-only-video,.yt-tools-audio-only-active #movie_player video{visibility:hidden!important}.yt-tools-audio-only-player{background:#000!important}:root{--yt-search-text-color:#eee;--yt-search-placeholder-color:#999}body.yt-style-blur{--yt-glass-blur:20px;--yt-glass-saturate:1;--yt-glass-bg-masthead:#0f0f0f8c;--yt-glass-bg-sidebar:#0f0f0f80;--yt-glass-bg-guide:#0f0f0f73;--yt-glass-bg-search:#0f0f0f66;--yt-glass-bg-miniguide:#0f0f0f73;--yt-glass-bg-watch:#0f0f0f59;--yt-glass-blur-guide:14px;--yt-glass-blur-search:12px;--yt-glass-blur-sidebar:16px;--yt-glass-border:#ffffff14;--yt-glass-border-top:transparent;--yt-glass-shadow:none;--yt-glass-inset:none;background-color:#0f0f0f!important}body.yt-style-liquid{--yt-glass-blur:24px;--yt-glass-saturate:1.8;--yt-glass-bg-masthead:#14141466;--yt-glass-bg-sidebar:#19191959;--yt-glass-bg-guide:#12121259;--yt-glass-bg-search:#1212124d;--yt-glass-bg-miniguide:#12121259;--yt-glass-bg-watch:#1414144d;--yt-glass-blur-guide:20px;--yt-glass-blur-search:20px;--yt-glass-blur-sidebar:24px;--yt-glass-border:#ffffff1f;--yt-glass-border-top:#fff3;--yt-glass-shadow:0 8px 32px 0 #0006;--yt-glass-inset:inset 0 1px 1px #ffffff1a;background-color:#0f0f0f!important}body.yt-style-transparent{--yt-glass-blur:0px;--yt-glass-saturate:1;--yt-glass-bg-masthead:transparent;--yt-glass-bg-sidebar:transparent;--yt-glass-bg-guide:transparent;--yt-glass-bg-search:transparent;--yt-glass-bg-miniguide:transparent;--yt-glass-bg-watch:transparent;--yt-glass-blur-guide:0px;--yt-glass-blur-search:0px;--yt-glass-blur-sidebar:0px;--yt-glass-border:transparent;--yt-glass-border-top:transparent;--yt-glass-shadow:none;--yt-glass-inset:none}body:not(.ytd-dark-theme):not([dark]) .yt-style-blur,body:not(.ytd-dark-theme):not([dark]) .yt-style-liquid,html:not([dark]) body.yt-style-blur,html:not([dark]) body.yt-style-liquid{--yt-glass-bg-masthead:#fff9;--yt-glass-bg-sidebar:#ffffff8c;--yt-glass-bg-guide:#ffffff80;--yt-glass-bg-search:#ffffff73;--yt-glass-bg-miniguide:#ffffff80;--yt-glass-bg-watch:#f8f8f866;--yt-glass-border:#00000014;--yt-glass-shadow:0 4px 16px #0000000a;--yt-search-text-color:#111;--yt-search-placeholder-color:#666}body.yt-style-blur ytd-masthead,body.yt-style-blur #masthead-container,body.yt-style-liquid ytd-masthead,body.yt-style-liquid #masthead-container,body.yt-style-transparent ytd-masthead,body.yt-style-transparent #masthead-container{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s,border-color .6s;background:var(--yt-glass-bg-masthead)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur)) saturate(var(--yt-glass-saturate))!important;border-bottom:1px solid var(--yt-glass-border)!important;border-top:1px solid var(--yt-glass-border-top)!important;box-shadow:var(--yt-glass-shadow)!important}body.yt-style-blur ytd-masthead.scrolled,body.yt-style-liquid ytd-masthead.scrolled{-webkit-backdrop-filter:blur(28px) saturate(var(--yt-glass-saturate))!important;background:#0f0f0fd9!important;border-bottom-color:#ffffff1f!important;box-shadow:0 2px 20px #00000080!important}body.yt-style-blur #page-manager,body.yt-style-blur ytd-watch-flexy,body.yt-style-blur ytd-browse,body.yt-style-liquid #page-manager,body.yt-style-liquid ytd-watch-flexy,body.yt-style-liquid ytd-browse,body.yt-style-transparent #page-manager,body.yt-style-transparent ytd-watch-flexy,body.yt-style-transparent ytd-browse,body.yt-style-blur #columns,body.yt-style-blur #primary,body.yt-style-blur #secondary,body.yt-style-liquid #columns,body.yt-style-liquid #primary,body.yt-style-liquid #secondary,body.yt-style-transparent #columns,body.yt-style-transparent #primary,body.yt-style-transparent #secondary{background:0 0!important}body.yt-style-blur #secondary-inner,body.yt-style-liquid #secondary-inner,body.yt-style-transparent #secondary-inner{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s;background:var(--yt-glass-bg-sidebar)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-sidebar)) saturate(var(--yt-glass-saturate))!important;box-shadow:var(--yt-glass-shadow), var(--yt-glass-inset)!important}body.yt-style-blur ytd-guide-renderer,body.yt-style-liquid ytd-guide-renderer,body.yt-style-transparent ytd-guide-renderer{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s;background:var(--yt-glass-bg-guide)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-guide)) saturate(var(--yt-glass-saturate))!important}body.yt-style-blur #guide-content,body.yt-style-blur #guide-wrapper,body.yt-style-liquid #guide-content,body.yt-style-liquid #guide-wrapper,body.yt-style-transparent #guide-content,body.yt-style-transparent #guide-wrapper{background:0 0!important}body.yt-style-blur ytd-mini-guide-renderer,body.yt-style-blur #mini-guide,body.yt-style-liquid ytd-mini-guide-renderer,body.yt-style-liquid #mini-guide,body.yt-style-transparent ytd-mini-guide-renderer,body.yt-style-transparent #mini-guide{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s;background:var(--yt-glass-bg-miniguide)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-guide)) saturate(var(--yt-glass-saturate))!important}body.yt-style-blur ytd-searchbox #search-form,body.yt-style-blur #search-form,body.yt-style-liquid ytd-searchbox #search-form,body.yt-style-liquid #search-form,body.yt-style-transparent ytd-searchbox #search-form,body.yt-style-transparent #search-form{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s,border-color .6s;background:var(--yt-glass-bg-search)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-search)) saturate(var(--yt-glass-saturate))!important;border:1px solid var(--yt-glass-border)!important;border-top:1px solid var(--yt-glass-border-top)!important;box-shadow:var(--yt-glass-shadow)!important;border-radius:24px!important}body.yt-style-blur yt-searchbox .ytSearchboxComponentInputBox,body.yt-style-liquid yt-searchbox .ytSearchboxComponentInputBox,body.yt-style-transparent yt-searchbox .ytSearchboxComponentInputBox{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s,border-color .6s;background:var(--yt-glass-bg-search)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-search)) saturate(var(--yt-glass-saturate))!important;border:1px solid var(--yt-glass-border)!important;border-top:1px solid var(--yt-glass-border-top)!important;box-shadow:var(--yt-glass-shadow)!important;border-right:none!important;border-radius:24px 0 0 24px!important}body.yt-style-blur ytd-searchbox #container,body.yt-style-blur #container.ytd-searchbox,body.yt-style-blur yt-searchbox .ytSearchboxComponentInputContainer,body.yt-style-liquid ytd-searchbox #container,body.yt-style-liquid #container.ytd-searchbox,body.yt-style-liquid yt-searchbox .ytSearchboxComponentInputContainer,body.yt-style-transparent ytd-searchbox #container,body.yt-style-transparent #container.ytd-searchbox,body.yt-style-transparent yt-searchbox .ytSearchboxComponentInputContainer{background:0 0!important}body.yt-style-blur ytd-searchbox #search-form:focus-within,body.yt-style-blur ytd-searchbox #search-form:hover,body.yt-style-blur yt-searchbox .ytSearchboxComponentInputBox:focus-within,body.yt-style-blur yt-searchbox .ytSearchboxComponentInputBox:hover,body.yt-style-liquid ytd-searchbox #search-form:focus-within,body.yt-style-liquid ytd-searchbox #search-form:hover,body.yt-style-liquid yt-searchbox .ytSearchboxComponentInputBox:focus-within,body.yt-style-liquid yt-searchbox .ytSearchboxComponentInputBox:hover{box-shadow:0 0 20px #ffffff0f, var(--yt-glass-shadow)!important;background:#1919198c!important;border-color:#fff3!important}body.yt-style-blur yt-searchbox .ytSearchboxComponentSearchButton,body.yt-style-liquid yt-searchbox .ytSearchboxComponentSearchButton,body.yt-style-transparent yt-searchbox .ytSearchboxComponentSearchButton{transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s,border-color .6s;background:var(--yt-glass-bg-search)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-search)) saturate(var(--yt-glass-saturate))!important;border:1px solid var(--yt-glass-border)!important;color:var(--yt-search-text-color,#eee)!important;border-left:none!important;border-radius:0 24px 24px 0!important;margin-left:-1px!important}body.yt-style-blur yt-searchbox .ytSearchboxComponentSearchButton:hover,body.yt-style-liquid yt-searchbox .ytSearchboxComponentSearchButton:hover,body.yt-style-transparent yt-searchbox .ytSearchboxComponentSearchButton:hover{background:#1919198c!important;border-color:#fff3!important}body.yt-style-blur yt-searchbox .ytSearchboxComponentInput,body.yt-style-liquid yt-searchbox .ytSearchboxComponentInput,body.yt-style-transparent yt-searchbox .ytSearchboxComponentInput{color:var(--yt-search-text-color,#eee)!important}body.yt-style-blur yt-searchbox .ytSearchboxComponentInput::placeholder,body.yt-style-liquid yt-searchbox .ytSearchboxComponentInput::placeholder,body.yt-style-transparent yt-searchbox .ytSearchboxComponentInput::placeholder{color:var(--yt-search-placeholder-color,#999)!important;opacity:.8!important}body.yt-style-blur #chips-wrapper,body.yt-style-blur ytd-feed-filter-chip-bar-renderer,body.yt-style-liquid #chips-wrapper,body.yt-style-liquid ytd-feed-filter-chip-bar-renderer,body.yt-style-transparent #chips-wrapper,body.yt-style-transparent ytd-feed-filter-chip-bar-renderer{background:0 0!important;border:none!important}body.yt-style-blur yt-chip-cloud-chip-renderer,body.yt-style-liquid yt-chip-cloud-chip-renderer{background:var(--yt-glass-bg-search)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-search)) saturate(var(--yt-glass-saturate))!important;border:1px solid var(--yt-glass-border)!important;box-shadow:var(--yt-glass-shadow)!important;color:var(--yt-search-text-color,#eee)!important;border-radius:8px!important;transition:all .3s!important}body.yt-style-blur yt-chip-cloud-chip-renderer>#chip-container,body.yt-style-liquid yt-chip-cloud-chip-renderer>#chip-container{background:0 0!important;border:none!important}body.yt-style-blur yt-chip-cloud-chip-renderer[selected],body.yt-style-liquid yt-chip-cloud-chip-renderer[selected]{color:#fff!important;background:#fff3!important;border-color:#fff6!important}body.yt-style-blur yt-chip-cloud-chip-renderer:hover,body.yt-style-liquid yt-chip-cloud-chip-renderer:hover{background:#ffffff26!important}body:not(.ytd-dark-theme):not([dark]) yt-chip-cloud-chip-renderer[selected]{color:#fff!important;background:#000c!important}body:not(.ytd-dark-theme):not([dark]) yt-chip-cloud-chip-renderer:hover{background:#0000001a!important}body.yt-style-blur #left-arrow.ytd-feed-filter-chip-bar-renderer,body.yt-style-blur #right-arrow.ytd-feed-filter-chip-bar-renderer,body.yt-style-liquid #left-arrow.ytd-feed-filter-chip-bar-renderer,body.yt-style-liquid #right-arrow.ytd-feed-filter-chip-bar-renderer,body.yt-style-blur #left-arrow.ytd-feed-filter-chip-bar-renderer:after,body.yt-style-blur #right-arrow.ytd-feed-filter-chip-bar-renderer:before,body.yt-style-liquid #left-arrow.ytd-feed-filter-chip-bar-renderer:after,body.yt-style-liquid #right-arrow.ytd-feed-filter-chip-bar-renderer:before,body.yt-style-blur ytd-rich-grid-renderer,body.yt-style-blur #contents.ytd-rich-grid-renderer,body.yt-style-liquid ytd-rich-grid-renderer,body.yt-style-liquid #contents.ytd-rich-grid-renderer,body.yt-style-transparent ytd-rich-grid-renderer,body.yt-style-transparent #contents.ytd-rich-grid-renderer{background:0 0!important}body.yt-style-blur ytd-watch-flexy #primary-inner,body.yt-style-liquid ytd-watch-flexy #primary-inner,body.yt-style-transparent ytd-watch-flexy #primary-inner,body.yt-style-blur ytd-watch-flexy #below,body.yt-style-liquid ytd-watch-flexy #below,body.yt-style-transparent ytd-watch-flexy #below{will-change:backdrop-filter;transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s;background:var(--yt-glass-bg-watch)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-sidebar)) saturate(var(--yt-glass-saturate))!important;border-radius:12px!important}body.yt-style-blur ytd-engagement-panel-section-list-renderer,body.yt-style-liquid ytd-engagement-panel-section-list-renderer,body.yt-style-transparent ytd-engagement-panel-section-list-renderer{transition:-webkit-backdrop-filter .6s,backdrop-filter .6s,background .6s,border-color .6s;background:var(--yt-glass-bg-sidebar)!important;-webkit-backdrop-filter:blur(var(--yt-glass-blur-sidebar)) saturate(var(--yt-glass-saturate))!important;border:1px solid var(--yt-glass-border)!important;box-shadow:var(--yt-glass-shadow)!important;border-radius:12px!important}body.transition-theme *,body.transition-theme :before,body.transition-theme :after{transition:background .4s,background-color .4s,color .4s,border-color .4s,box-shadow .4s!important}body.yt-style-transparent ytd-masthead,body.yt-style-transparent #secondary-inner,body.yt-style-transparent ytd-guide-renderer,body.yt-style-transparent ytd-searchbox #search-form,body.yt-style-transparent yt-searchbox .ytSearchboxComponentInputBox,body.yt-style-transparent yt-searchbox .ytSearchboxComponentSearchButton,body.yt-style-transparent ytd-watch-flexy #primary-inner,body.yt-style-transparent ytd-watch-flexy #below{will-change:auto!important}#ytm-side-panel-wrapper{box-sizing:border-box!important;border-radius:16px!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;width:100%!important;margin:0 0 12px!important;padding:4px 0!important;display:flex!important;overflow:hidden!important}ytmusic-player-page #side-panel{box-shadow:none!important;background:0 0!important;border:none!important;margin-bottom:24px!important;margin-left:16px!important;padding:0!important}.ytm-side-panel-divider{background:#ffffff1a;width:92%;height:1px;margin:4px 0}body.ytm-style-blur #ytm-side-panel-wrapper,body.ytm-style-blur ytmusic-player-page #side-panel ytmusic-tab-renderer{-webkit-backdrop-filter:blur(20px)!important;background:#14141499!important;border:1px solid #ffffff14!important;border-radius:16px!important;box-shadow:0 4px 16px #0006!important}body.ytm-style-liquid #ytm-side-panel-wrapper,body.ytm-style-liquid ytmusic-player-page #side-panel ytmusic-tab-renderer{-webkit-backdrop-filter:blur(24px)saturate(180%)!important;background:#19191973!important;border:1px solid #ffffff26!important;border-top-color:#ffffff40!important;border-radius:16px!important;box-shadow:0 8px 32px #0006,inset 0 1px 1px #ffffff1a!important}body.ytm-style-transparent #ytm-side-panel-wrapper,body.ytm-style-transparent ytmusic-player-page #side-panel ytmusic-tab-renderer{-webkit-backdrop-filter:none!important;box-shadow:none!important;background:0 0!important;border:none!important}body[class*=ytm-style-] .yt-tools-container,body[class*=ytm-style-] #side-panel ytmusic-tab-renderer,body[class*=ytm-style-] ytmusic-search-box,body[class*=ytm-style-] #side-panel>.tab-header-container,body[class*=ytm-style-] tp-yt-paper-tabs.tab-header-container,body[class*=ytm-style-] #tabsContainer.tp-yt-paper-tabs,body[class*=ytm-style-] tp-yt-paper-tab.tab-header,body[class*=ytm-style-] .tab-content.tp-yt-paper-tab{-webkit-backdrop-filter:none!important;box-shadow:none!important;background:0 0!important;border:none!important;margin:0!important}.yt-tools-container{justify-content:center!important;align-items:center!important;width:100%!important;padding:0!important;display:flex!important}.tab-header-container{justify-content:center!important;align-items:center!important;width:100%!important;padding:4px 0!important;display:flex!important}ytmusic-app #side-panel{box-sizing:border-box;padding:8px 12px}ytmusic-app #side-panel ytmusic-queue-header-renderer .container-name{padding:0 8px}ytmusic-app #side-panel ytmusic-player-queue-item .song-info{padding-right:4px}ytmusic-app #side-panel ytmusic-tab-renderer{box-sizing:border-box!important;border-radius:16px!important;width:100%!important;margin-bottom:12px!important;padding:12px 0 12px 12px!important;overflow:hidden auto!important}ytmusic-app ytmusic-search-box{border-radius:16px!important}html[dark] ytmusic-app ytmusic-search-box #input-box,ytmusic-app ytmusic-search-box #input-box{background:0 0!important}ytmusic-app #side-panel>.tab-header-container{padding:4px 8px;box-sizing:border-box!important;border-radius:16px!important;width:100%!important;margin:0 0 8px!important;overflow:hidden!important}ytmusic-app .containerButtons{flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:8px!important;padding:8px 0!important;display:flex!important}ytmusic-app .botones_div{color:var(--yt-spec-text-secondary,#aaa)!important;background:#ffffff14!important;border:none!important;border-radius:50%!important;justify-content:center!important;align-items:center!important;width:36px!important;height:36px!important;padding:0!important;line-height:1!important;transition:all .2s!important;display:flex!important}ytmusic-app .botones_div svg{width:18px!important;height:18px!important}ytmusic-app .botones_div:hover{transform:scale(1.05);color:var(--yt-spec-text-primary,#fff)!important;background:#ffffff26!important}ytmusic-player-page #side-panel select,ytmusic-player-page #side-panel select option{color:#fff!important;background:#282828!important;border:1px solid #ffffff1a!important}ytmusic-app .selectcalidades,ytmusic-app .selectcalidadesaudio{color:#fff!important;cursor:pointer!important;appearance:none!important;text-align:center!important;text-align-last:center!important;background:#ffffff12 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\") right 14px center/12px no-repeat!important;border:1px solid #ffffff1a!important;border-radius:12px!important;outline:none!important;width:min(82%,400px)!important;height:36px!important;padding:0 32px 0 16px!important;font-size:13px!important;font-weight:500!important;line-height:36px!important;transition:border-color .2s,background .2s!important}ytmusic-app .selectcalidades:hover,ytmusic-app .selectcalidadesaudio:hover{background:#ffffff26!important;border-color:#fff3!important}ytmusic-app .download-container{overflow:hidden;border-radius:12px!important;width:calc(100% - 20px)!important;margin:0 10px 8px!important;padding:12px!important;position:relative!important}ytmusic-app .content_collapsible_colors{margin-top:8px!important}.ytm-side-panel-divider{border-bottom:1px solid #ffffff1a;width:100%;height:0;margin:0!important}ytmusic-app .containerall{padding-bottom:8px!important}ytmusic-app #toggle-button{cursor:pointer;justify-content:center;align-items:center;margin-right:4px;padding:8px;display:flex}ytmusic-app #icon-menu-settings{color:#fff;font-size:20px;transition:transform .3s}ytmusic-app #icon-menu-settings:hover{color:#f44;transform:rotate(90deg)}:root{--ytm-glass-bg:#0f0f0f33;--ytm-glass-bg-scrolled:#0f0f0f73;--ytm-glass-blur:18px}body.ytm-style-blur{--yt-glass-blur-sidebar:20px;--yt-glass-saturate:1;--yt-glass-bg-sidebar:#14141499;--yt-glass-border:#ffffff14}body.ytm-style-liquid{--yt-glass-blur-sidebar:24px;--yt-glass-saturate:1.8;--yt-glass-bg-sidebar:#19191973;--yt-glass-border:#ffffff26;--yt-glass-border-top:#ffffff40}ytmusic-nav-bar{background-color:var(--ytm-glass-bg)!important;-webkit-backdrop-filter:blur(var(--ytm-glass-blur)) saturate(1.2)!important;border-bottom:1px solid #ffffff14!important;transition:background-color .3s,-webkit-backdrop-filter .3s,backdrop-filter .3s!important}ytmusic-nav-bar.scrolled{background-color:var(--ytm-glass-bg-scrolled)!important;-webkit-backdrop-filter:blur(calc(var(--ytm-glass-blur) + 6px)) saturate(1.3)!important;box-shadow:0 2px 15px #0000004d!important}#nav-bar-background{background:0 0!important}#nav-bar-divider{border-bottom:1px solid #ffffff1a!important}ytmusic-app-layout{background:var(--ytmusic-background,#030303)!important}ytmusic-guide-renderer,tp-yt-app-drawer{-webkit-backdrop-filter:blur(15px)!important;background-color:#0003!important;border-right:1px solid #ffffff0d!important}ytmusic-fullbleed-thumbnail-renderer[is-background],.immersive-background{opacity:.35!important;filter:blur(25px)saturate(1.2)brightness(.8)!important;display:block!important}ytmusic-player-bar{-webkit-backdrop-filter:blur(20px)saturate(1.2)!important;background-color:#0a0a0c73!important;border-top:1px solid #ffffff14!important;box-shadow:0 -8px 25px #0003!important}ytmusic-player-page>.yt-icon-shape,ytmusic-player-page>.ytSpecIconShapeHost{display:none!important}ytmusic-player-page .yt-icon-shape.ytSpecIconShapeHost:not([slot]):not([class*=thumbnail]):not([class*=play]){opacity:0!important;pointer-events:none!important;display:none!important}body>.yt-icon-shape,ytmusic-app>.yt-icon-shape,#player-page>.yt-icon-shape{display:none!important}ytmusic-two-row-item-renderer:not(:hover) ytmusic-item-thumbnail-overlay-renderer[play-button-state=default]{opacity:0!important;visibility:hidden!important}.theme-selector-container{-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);background:#ffffff0d;border:1px solid #ffffff1a;border-radius:12px;margin:20px 0;padding:20px}.theme-selector-header{justify-content:space-between;align-items:center;margin-bottom:20px;display:flex}.theme-selector-header h4{color:var(--yt-spec-text-primary,#fff);margin:0;font-size:18px;font-weight:600}.theme-selector-actions{gap:8px;display:flex}.theme-selector-actions button{width:36px;height:36px;color:var(--yt-spec-text-primary,#fff);cursor:pointer;background:#ffffff1a;border:none;border-radius:8px;justify-content:center;align-items:center;transition:all .2s;display:flex}.theme-selector-actions button:hover{background:#fff3;transform:translateY(-1px)}.theme-selector-actions button.active{background:var(--yt-spec-accent,#007bff);color:#fff}.theme-filters{flex-wrap:wrap;gap:8px;margin-bottom:20px;display:flex}.filter-btn{color:var(--yt-spec-text-primary,#fff);cursor:pointer;background:#ffffff1a;border:1px solid #fff3;border-radius:20px;padding:8px 16px;font-size:12px;transition:all .2s}.filter-btn:hover{background:#fff3;border-color:#ffffff4d}.filter-btn.active{background:var(--yt-spec-accent,#007bff);border-color:var(--yt-spec-accent,#007bff);color:#fff}.theme-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:20px;display:grid}.theme-card{background:#ffffff0d;border-radius:12px;transition:all .3s;animation:.3s ease-out slideIn;overflow:hidden}.theme-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px #000}.theme-preview{border-radius:8px 8px 0 0;height:80px;position:relative;overflow:hidden}.theme-preview-header{background:#0000001a;border-radius:4px 4px 0 0;height:24px;margin:8px}.theme-preview-content{align-items:center;gap:8px;padding:8px;display:flex}.theme-preview-text{background:currentColor;border-radius:2px;width:40px;height:8px}.theme-preview-button{background:var(--yt-spec-accent,#007bff);border-radius:4px;width:24px;height:16px}.theme-badge{background:var(--yt-spec-accent,#007bff);color:#fff;border-radius:10px;margin-bottom:4px;padding:2px 6px;font-size:10px;font-weight:500;display:inline-block}.theme-description{color:var(--yt-spec-text-secondary,#ccc);font-size:12px;line-height:1.3}.btn-preview{color:var(--yt-spec-text-primary,#fff);background:#ffffff1a;border:1px solid #fff3}.theme-custom-actions{border-top:1px solid #ffffff1a;gap:12px;margin-top:20px;padding-top:20px;display:flex}.btn-save,.btn-color{cursor:pointer;border:none;border-radius:8px;padding:10px 16px;font-weight:500;transition:all .2s}.btn-save{background:var(--yt-spec-success,#28a745);color:#fff}.btn-color{background:var(--yt-spec-info,#17a2b8);color:#fff}.btn-save:hover,.btn-color:hover{transform:translateY(-1px);box-shadow:0 4px 12px #000}.theme-customizer{background:#0000004d;border-radius:12px;margin-top:20px;padding:20px}.theme-customizer h5{color:var(--yt-spec-text-primary,#fff);margin:0 0 16px;font-weight:600}.customizer-grid{grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;display:grid}.color-input-group{flex-direction:column;gap:8px;display:flex}.color-input-group label{color:var(--yt-spec-text-secondary,#ccc);font-size:12px;font-weight:500}.color-input{width:100%;height:40px;color:var(--yt-spec-text-primary,#fff);background:#ffffff1a;border:1px solid #fff3;border-radius:6px;font-size:14px;transition:all .2s}.color-input:focus{border-color:var(--yt-spec-accent,#007bff);outline:none;box-shadow:0 0 0 3px #007bff33}.gradient-btn{color:var(--yt-spec-text-primary,#fff);cursor:pointer;background:#ffffff1a;border:1px solid #fff3;border-radius:6px;margin-top:8px;padding:6px 12px;font-size:12px;transition:all .2s}.gradient-btn:hover{background:#fff3}.customizer-actions{gap:12px;margin-top:20px;display:flex}.btn-apply,.btn-reset{cursor:pointer;border:none;border-radius:6px;flex:1;padding:10px 16px;font-weight:500;transition:all .2s}.btn-reset{color:var(--yt-spec-text-primary,#fff);background:#ffffff1a;border:1px solid #fff3}.btn-apply:hover,.btn-reset:hover{transform:translateY(-1px);box-shadow:0 4px 12px #000}.theme-card{cursor:pointer;border:1px solid #ffffff1a;transition:all .3s;overflow:hidden}.theme-card:hover{border-color:#fff3;transform:translateY(-2px);box-shadow:0 8px 25px #0000004d}.theme-card.custom{border-color:#4caf5080}.theme-preview{height:80px;position:relative;overflow:hidden}.theme-preview-header{background:#0000001a;height:24px;position:absolute;top:0;left:0;right:0}.theme-preview-content{flex-direction:column;gap:4px;padding:8px;display:flex;position:absolute;inset:24px 0 0}.theme-preview-text{opacity:.7;background:currentColor;border-radius:2px;height:8px}.theme-preview-button{background:var(--yt-spec-static-brand-red,red);border-radius:4px;width:40px;height:20px;margin-top:auto}.theme-info{padding:12px}.theme-name{color:var(--yt-spec-text-primary,#fff);margin-bottom:4px;font-weight:600}.theme-badge{color:#4caf50;background:#4caf5033;border-radius:4px;margin-bottom:4px;padding:2px 6px;font-size:11px;font-weight:500;display:inline-block}.theme-description{color:var(--yt-spec-text-secondary,#ccc);opacity:.8;font-size:12px}.theme-actions{gap:8px;padding:0 12px 12px;display:flex}.theme-actions button{cursor:pointer;border:none;border-radius:6px;flex:1;padding:6px 12px;font-size:12px;font-weight:500;transition:all .2s}.btn-apply{background:var(--yt-spec-static-brand-red,red);color:#fff}.btn-apply:hover{background:#e63900}.btn-preview{color:var(--yt-spec-text-primary,#fff);background:#ffffff1a}.btn-preview:hover{background:#fff3}.btn-delete{color:#fff;background:#f44336cc}.btn-delete:hover{background:#d32f2f}.theme-custom-actions{justify-content:center;display:flex}.btn-save{color:#fff;cursor:pointer;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none;border-radius:8px;align-items:center;gap:8px;padding:10px 20px;font-weight:500;transition:all .2s;display:flex}.btn-save:hover{transform:translateY(-1px);box-shadow:0 4px 12px #667eea66}@media (width<=768px){.theme-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.theme-selector-header{flex-direction:column;align-items:flex-start;gap:12px}.theme-selector-actions{justify-content:flex-end;align-self:stretch}}@media (prefers-color-scheme:dark){.theme-selector-container{background:#0000004d;border-color:#ffffff0d}.theme-card{background:#0003;border-color:#ffffff0d}}.background-image-container{flex-direction:column;align-items:center;gap:8px;margin:10px 0;display:flex}.background-image-preview{cursor:pointer;background-position:50%;background-size:cover;border:2px solid #444;border-radius:10px;justify-content:center;align-items:center;width:160px;height:90px;transition:box-shadow .2s;display:flex;position:relative;overflow:hidden;box-shadow:0 2px 8px #00000014}.background-image-preview:hover .background-image-overlay{opacity:1}.background-image-overlay{color:#fff;opacity:0;pointer-events:none;background:#00000059;flex-direction:column;justify-content:center;align-items:center;font-size:18px;transition:opacity .2s;display:flex;position:absolute;inset:0}.background-image-overlay i{margin-bottom:4px;font-size:28px}.background-image-preview:hover .background-image-overlay,.background-image-preview:focus .background-image-overlay{opacity:1}.background-image-text{text-shadow:0 1px 4px #000;font-size:13px;font-weight:500}.remove-background-image{color:#fff;cursor:pointer;z-index:2;background:#e74c3c;border:none;border-radius:50%;justify-content:center;align-items:center;width:26px;height:26px;padding:0;font-size:18px;line-height:1;transition:background .2s;display:none;position:absolute;top:6px;right:6px;box-shadow:0 2px 8px #00000026}.remove-background-image:hover{background:#c0392b}.background-image-preview.has-image .remove-background-image{display:flex}ytd-feed-filter-chip-bar-renderer[not-sticky] #chips-wrapper.ytd-feed-filter-chip-bar-renderer{padding:10px}.text-description-download{text-align:center;margin-top:10px;font-size:12px}");
	function initSettingsPanel() {
		const { panel, panelOverlay } = createSettingsPanel();
		if (panel && panelOverlay) {
			document.body.appendChild(panelOverlay);
			document.body.appendChild(panel);
			setupSettingsPanelEvents(panel);
			initGearIcon(panel, panelOverlay);
			setTimeout(() => {
				initThemeSelector();
			}, 100);
			setTimeout(() => {
				loadSettingsToDOM();
				applySettings();
			}, 100);
		}
	}
	(function() {
		"use strict";
		const settings = loadSettings();
		__ytToolsRuntime.settingsLoaded = true;
		try {
			initSettingsPanel();
			console.log("[YT Tools] Modular panel created");
		} catch (e) {
			console.error("[YT Tools] Failed to create panel:", e);
		}
		initTimeStats();
		setupDownloadClickHandler();
		const getFeatureList = (s) => [
			[initDownloadDescription, s.copyDescription],
			[setupContinueWatchingFeature, s.continueWatching],
			[applyLikeDislikeBarIfEnabled, s],
			[applyDislikeDisplayIfEnabled, s],
			[applyBookmarksIfEnabled, s],
			[setupShortsChannelNameFeature, s.shortsChannelName],
			[setupLockupCachedStats, s.lockupStats],
			[initTranslateComments, s],
			[initPlayerSize, s],
			[hideComments, s.hideComments],
			[hideSidebar, s.hideSidebar],
			[hideNavbar, s.hideNavbar],
			[reverseMode, s.reverseMode],
			[disableSubtitles, s.disableSubtitles],
			[applyNonstopPlayback, s.nonstopPlayback],
			[applyAudioOnlyMode, getEffectiveAudioOnly(s)],
			[applyCinematicLighting, s],
			[setupThumbnailDownloadButton, null],
			[setupAvatarDownload, s.avatars],
			[initWaveVisualizer, s],
			[initShortsReelButtons, null],
			[setupCommentNavListener, s],
			[startAmbientWatcher, null]
		];
		function runFeatures(s) {
			for (const [fn, arg] of getFeatureList(s)) try {
				fn(arg);
			} catch (e) {
				console.warn("[YT Tools] Feature init error:", e);
			}
		}
		applySettings(settings);
		runFeatures(settings);
		initDownloadFeature();
		updateUI();
		setTimeout(checkNewVersion, 3e3);
		function reinitAll(s) {
			try {
				applySettings(s);
			} catch {}
			runFeatures(s);
			try {
				initDownloadFeature();
				updateUI();
			} catch (e) {
				console.warn("[YT Tools] Download init error:", e);
			}
		}
		document.addEventListener("yt-navigate-finish", () => reinitAll(loadSettings()));
		document.addEventListener("yt-tools-settings-changed", (e) => reinitAll(e.detail));
		console.log("%cYoutube Tools Extension%c\n%cRun %c(v2.4.4.2)\nBy: DeveloperMDCM.", "color: #F00; font-size: 24px; font-family: sans-serif;", "", "font-size: 14px; font-family: monospace;", "color: #00aaff; font-size: 16px; font-family: sans-serif;");
	})();
})();
