    // ------------------------------
    // Feature: Like vs Dislike bar

    // ------------------------------
    function parseCountText(text) {
        if (!text) return null;
        const s0 = String(text).trim().toLowerCase();
        if (!s0) return null;
        let mult = 1;
        let s = s0.replace(/\s+/g, '');
        if (s.includes('mil')) {
            mult = 1000;
            s = s.replace('mil', '');
        } else if (s.includes('k')) {
            mult = 1000;
            s = s.replace('k', '');
        } else if (s.includes('m')) {
            mult = 1000000;
            s = s.replace('m', '');
        }
        // normalize decimal separators
        s = s.replace(/[^\d.,]/g, '');
        if (!s) return null;
        // If both separators exist, assume last is decimal
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        let nStr = s;
        if (lastDot !== -1 && lastComma !== -1) {
            const dec = Math.max(lastDot, lastComma);
            const intPart = s.slice(0, dec).replace(/[.,]/g, '');
            const decPart = s.slice(dec + 1);
            nStr = `${intPart}.${decPart}`;
        } else {
            // Use dot as decimal
            nStr = s.replace(',', '.');
        }
        const num = Number.parseFloat(nStr);
        if (!Number.isFinite(num)) return null;
        return Math.round(num * mult);
    }

    async function ensureDislikesForCurrentVideo() {
        const videoId = getCurrentVideoId();
        if (!videoId) return null;
        const now = Date.now();
        if (__ytToolsRuntime.dislikesCache.videoId === videoId && __ytToolsRuntime.dislikesCache.dislikes != null && (now - __ytToolsRuntime.dislikesCache.ts) < 10 * 60 * 1000) {
            return __ytToolsRuntime.dislikesCache;
        }
        const persisted = getLikesDislikesFromPersistedCache(videoId);
        if (persisted && persisted.dislikes != null) {
            __ytToolsRuntime.dislikesCache = {
                videoId,
                likes: persisted.likes,
                dislikes: persisted.dislikes,
                viewCount: persisted.viewCount,
                rating: persisted.rating,
                ts: now
            };
            return __ytToolsRuntime.dislikesCache;
        }
        try {
            const res = await fetch(`${apiDislikes}${videoId}`);
            const data = await res.json();
            const dislikes = Number(data?.dislikes);
            const likes = Number(data?.likes);
            const viewCount = Number(data?.viewCount);
            const rating = Number(data?.rating);
            const now = Date.now();

            if (Number.isFinite(dislikes)) {
                __ytToolsRuntime.dislikesCache = {
                    videoId,
                    likes: Number.isFinite(likes) ? likes : getLikesFromDom(),
                    dislikes,
                    viewCount,
                    rating,
                    ts: now
                };
                setLikesDislikesToPersistedCache(
                    videoId,
                    __ytToolsRuntime.dislikesCache.likes,
                    dislikes,
                    Number.isFinite(viewCount) ? viewCount : undefined,
                    (Number.isFinite(rating) && rating >= 0 && rating <= 5) ? rating : undefined
                );
                return __ytToolsRuntime.dislikesCache;
            }
        } catch (e) {
            console.error('[YT Tools] Error fetching dislikes:', e);
        }
        return null;
    }
