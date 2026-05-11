function setDynamicCss(cssText = '') {
        if (!__ytToolsRuntime.dynamicStyleEl) {
            const style = document.createElement('style');
            style.id = 'yt-tools-mdcm-dynamic-style';
            document.head.appendChild(style);
            __ytToolsRuntime.dynamicStyleEl = style;
        }
        if (__ytToolsRuntime.dynamicCssLast === cssText) return;
        __ytToolsRuntime.dynamicCssLast = cssText;
        __ytToolsRuntime.dynamicStyleEl.textContent = cssText;
    }

    