function hideCanvas() {

        const canvas = $id('wave-visualizer-canvas');
        if (canvas) {
            canvas.style.opacity = '0';
            if (controlPanel) {
                controlPanel.style.opacity = '0';
            }
        }
    }

    function showCanvas() {
        const canvas = $id('wave-visualizer-canvas');
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (canvas) {
            canvas.style.opacity = '1';
            if (controlPanel) controlPanel.style.opacity = '1';
        }
    }


    