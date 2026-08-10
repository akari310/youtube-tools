const fs = require('fs');
let code = fs.readFileSync('src/utils/downloader.js', 'utf8');

// 1. Refactor markCompleteAndOpen to throw instead of catching
const markOld = \        const markCompleteAndOpen = async (downloadUrl) => {
            if (format === 'mp3' || format === 'm4a') {
                try {
                    await downloadWithTags(downloadUrl, container, format);
                } catch (err) {
                    console.error('Metadata tagging failed:', err);
                    setErrorState();
                }
            } else {\;
const markNew = \        const markCompleteAndOpen = async (downloadUrl) => {
            if (format === 'mp3' || format === 'm4a') {
                await downloadWithTags(downloadUrl, container, format);
            } else {\;
code = code.replace(markOld, markNew);

// 2. Remove try/catch inside startDownloadVideoOrAudio and replace with the new loop
const mainLoopRegex = /const pollProgressUrl = \(progressURL\) => \{[\s\S]*?console\.error\('? Error starting download:', error\);\n\s*\}/;

const mainLoopNew = \
        const pollProgressUrl = (progressURL) => {
            return new Promise((resolve, reject) => {
                container.__ytDownloadPoll = setInterval(async () => {
                    try {
                        const progressData = await fetchJsonWithTimeout(progressURL, 15000);
                        const progress = Math.min((Number(progressData.progress) || 0) / 10, 100);
                        progressFill.style.width = \\\\\\%\\\;
                        progressText.textContent = \\\\\\%\\\;

                        if (Number(progressData.progress) >= 1000 && progressData.download_url) {
                            clearInterval(container.__ytDownloadPoll);
                            container.__ytDownloadPoll = null;
                            resolve(progressData.download_url);
                        }
                    } catch (e) {
                        console.error('Error in progress:', e);
                        clearInterval(container.__ytDownloadPoll);
                        container.__ytDownloadPoll = null;
                        reject(e);
                    }
                }, 3000);
            });
        };

        const trySaveNowProvider = async (baseUrl) => {
            const url = new URL('/ajax/download.php', baseUrl);
            url.searchParams.set('copyright', '0');
            url.searchParams.set('allow_extended_duration', '1');
            url.searchParams.set('format', String(format));
            url.searchParams.set('url', videoURL);
            url.searchParams.set('api', API_KEY_DEVELOPERMDCM);
            const data = await fetchJsonWithTimeout(url.toString(), 25000);
            if (!data?.success || !data?.progress_url) {
                throw new Error('SaveNow provider did not return success/progress_url');
            }
            return data;
        };

        const tryDubsProvider = async () => {
            const videoId = paramsVideoURL();
            if (!videoId) throw new Error('Missing videoId');

            const startUrl = new URL(DUBS_START_ENDPOINT);
            startUrl.searchParams.set('id', videoId);
            startUrl.searchParams.set('format', String(format));

            const startData = await fetchJsonWithTimeout(startUrl.toString(), 25000);
            if (!startData?.success || !startData?.progressId) {
                throw new Error('Dubs provider did not return success/progressId');
            }

            const statusUrl = new URL(DUBS_STATUS_ENDPOINT);
            statusUrl.searchParams.set('id', startData.progressId);

            return new Promise((resolve, reject) => {
                container.__ytDownloadPoll = setInterval(async () => {
                    try {
                        const st = await fetchJsonWithTimeout(statusUrl.toString(), 20000);
                        const rawProgress = Number(st?.progress) || 0;
                        const progress = Math.min(rawProgress / 10, 100);
                        progressFill.style.width = \\\\\\%\\\;
                        progressText.textContent = \\\\\\%\\\;

                        if (st?.finished && st?.downloadUrl) {
                            clearInterval(container.__ytDownloadPoll);
                            container.__ytDownloadPoll = null;
                            resolve(st.downloadUrl);
                        }
                    } catch (e) {
                        console.error('? Error polling dubs status:', e);
                        clearInterval(container.__ytDownloadPoll);
                        container.__ytDownloadPoll = null;
                        reject(e);
                    }
                }, 3000);
            });
        };

        const doDownloadProcess = async () => {
            for (const base of DOWNLOAD_API_FALLBACK_BASES) {
                try {
                    const started = await trySaveNowProvider(base);
                    if (started?.success && started?.progress_url) {
                        const downloadUrl = await pollProgressUrl(started.progress_url);
                        await markCompleteAndOpen(downloadUrl);
                        return;
                    }
                } catch (e) {
                    console.warn(\\\Provider \\\ failed:\\\, e);
                }
            }

            console.warn('All SaveNow providers failed, falling back to dubs.io');
            const dubsUrl = await tryDubsProvider();
            await markCompleteAndOpen(dubsUrl);
        };

        try {
            await doDownloadProcess();
        } catch (error) {
            setErrorState();
            console.error('? Error starting download:', error);
        }\;

code = code.replace(mainLoopRegex, mainLoopNew);

fs.writeFileSync('src/utils/downloader.js', code);
console.log('Refactored fallback logic successfully');
