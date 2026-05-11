function paramsVideoURL() {
        const parametrosURL = new URLSearchParams(window.location.search);
        return parametrosURL.get('v');
    }

    function isWatchPage() {
        return window.location.href.includes('youtube.com/watch');
    }

    function checkDarkModeActive() {
        const htmlElement = document.documentElement;
        const isDarkModeYT = htmlElement.hasAttribute('dark') || htmlElement.getAttribute('style')?.includes('color-scheme: dark');
        const isDarkModeYTM = document.querySelector('ytmusic-app')?.hasAttribute('dark');
        return !!(isDarkModeYT || isDarkModeYTM);
    }

    function FormatterNumber(num, digits) {
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }
