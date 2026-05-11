const scheduleApplySettings = (() => {
        let t = null;
        return () => {
            // Prevent overwriting saved config with defaults before loadSettings finishes.
            if (!__ytToolsRuntime.settingsLoaded) return;
            clearTimeout(t);
            t = setTimeout(() => {
                try {
                    applySettings();
                } catch (err) {
                    console.error('applySettings error:', err);
                }
            }, 120);
        };
    })();

    