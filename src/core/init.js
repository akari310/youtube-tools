(function () {
    'use strict';
    let currentUrl = document.location.href;
    const isYTMusic = location.hostname === 'music.youtube.com';
    const SETTINGS_KEY = isYTMusic ? 'ytmSettingsMDCM' : 'ytSettingsMDCM';
    const $e = (el) => document.querySelector(el); // any element
    const $id = (el) => document.getElementById(el); // element by id
    const $m = (el) => document.querySelectorAll(el); // multiple all elements
    const $cl = (el) => document.createElement(el); // create element
    const $sp = (el, pty) => document.documentElement.style.setProperty(el, pty); // set property variable css
    const $ap = (el) => document.body.appendChild(el); // append element
    const apiDislikes = "https://returnyoutubedislikeapi.com/Votes?videoId="; // Api dislikes
    const apiGoogleTranslate = "https://translate.googleapis.com/translate_a/t"; // Api google translate
    let selectedBgColor = "#252525"; // Background color menu default
    let selectedTextColor = "#ffffff"; // Text color menu default
    let selectedBgAccentColor = "#ff0000"; // Accent color menu default
    const urlSharedCode = "https://greasyfork.org/scripts/576162-youtube-ultimate-tools";
    const API_URL_AUDIO_VIDEO = "https://p.savenow.to/ajax/download.php?copyright=0&allow_extended_duration=1&" // API URL AUDIO VIDEO
    const API_KEY_DEVELOPERMDCM = 'dfcb6d76f2f6a9894gjkege8a4ab232222'; // API KEY FOR DOWNLOAD AUDIO VIDEO
    // Download API fallbacks (region/session issues)
    const DOWNLOAD_API_FALLBACK_BASES = [
        "https://p.savenow.to",
        "https://p.lbserver.xyz",
    ];
    // Alternative provider fallback
    const DUBS_START_ENDPOINT = "https://dubs.io/wp-json/tools/v1/download-video";
    const DUBS_STATUS_ENDPOINT = "https://dubs.io/wp-json/tools/v1/status-video";

    // for translate comments video
    const languagesTranslate = {
        "vi": "Vietnamese",
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "ja": "Japanese",
        "zh-CN": "Chinese (Simplified)",
        "ko": "Korean",
        "ru": "Russian",
        "de": "German",
        "pt": "Portuguese",
        "zh-TW": "Chinese (Traditional)",
        "it": "Italian"
    };


    // var for wave
    let currentVideo = null;

    let waveStyle = 'dinamica';
    let audioCtx = null;
    let analyser = null;
    let source = null;
    let animationId = null;
    let canvas = null;
    let ctx = null;
    let controlPanel = null;
    let bufferLength = 0;
    let dataArray = null;
    let smoothedData = [];
    let isSetup = false;
    const smoothingFactor = 0.05;
    const canvasHeight = 240;
    const scale = canvasHeight / 90;

    const PROCESSED_FLAG = 'wave_visualizer_processed';


