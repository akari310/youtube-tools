// API Endpoints
export const apiDislikes = 'https://returnyoutubedislikeapi.com/Votes?videoId=';
export const apiGoogleTranslate = 'https://translate.googleapis.com/translate_a/t';
export const urlSharedCode =
  'https://greasyfork.org/es/scripts/460680-youtube-tools-all-in-one-local-download-mp3-mp4-higt-quality-return-dislikes-and-more';
export const API_URL_AUDIO_VIDEO =
  'https://p.savenow.to/ajax/download.php?copyright=0&allow_extended_duration=1&';
const DEFAULT_API_KEY = 'dfcb6d76f2f6a9894gjkege8a4ab232222';

export function getApiKey() {
  try {
    const custom = unsafeWindow.localStorage.getItem('yt_tools_ytToolsApiKeyMDCM');
    if (custom) return custom;
  } catch {}
  try {
    const custom = GM_getValue('ytToolsApiKeyMDCM', '');
    return custom && custom.length > 0 ? custom : DEFAULT_API_KEY;
  } catch {
    return DEFAULT_API_KEY;
  }
}

// Download API fallbacks
export const DOWNLOAD_API_FALLBACK_BASES = ['https://p.savenow.to', 'https://p.lbserver.xyz'];

// Alternative provider fallback
export const DUBS_START_ENDPOINT = 'https://dubs.io/wp-json/tools/v1/download-video';
export const DUBS_STATUS_ENDPOINT = 'https://dubs.io/wp-json/tools/v1/status-video';

// Languages for translate
export const languagesTranslate = {
  vi: 'Vietnamese',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  ko: 'Korean',
  'zh-CN': 'Chinese (Simplified)',
  ru: 'Russian',
  de: 'German',
  pt: 'Portuguese',
  'zh-TW': 'Chinese (Traditional)',
  it: 'Italian',
};

// Wave visualizer constants
export const PROCESSED_FLAG = 'wave_visualizer_processed';
export const SMOOTHING_FACTOR = 0.05;
export const CANVAS_HEIGHT = 240;
export const SCALE = CANVAS_HEIGHT / 90;

// Note: Storage keys have been moved to src/config/storage-keys.js
// Import from there instead of defining here
