const testShader = () => {
    const center = [0.5, 0.5];
    for (let x = -1.0; x <= 2.0; x += 0.5) {
        for (let y = -1.0; y <= 2.0; y += 0.5) {
            const dir = [x - center[0], y - center[1]];
            const absDir = [Math.abs(dir[0]), Math.abs(dir[1])];
            const k = Math.min(0.5 / Math.max(absDir[0], 0.00001), 0.5 / Math.max(absDir[1], 0.00001));
            
            if (k >= 1.0) {
                console.log(`x=${x}, y=${y} -> INSIDE`);
            } else {
                const edgePos = [center[0] + dir[0] * k, center[1] + dir[1] * k];
                const samplePos = [
                    edgePos[0] * (1.0 - 0.005) + center[0] * 0.005,
                    edgePos[1] * (1.0 - 0.005) + center[1] * 0.005
                ];
                console.log(`x=${x}, y=${y} -> edge=(${edgePos[0].toFixed(2)}, ${edgePos[1].toFixed(2)}), sample=(${samplePos[0].toFixed(4)}, ${samplePos[1].toFixed(4)})`);
            }
        }
    }
};
testShader();
