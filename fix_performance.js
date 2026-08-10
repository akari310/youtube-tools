const fs = require('fs');
let urlJs = fs.readFileSync('src/utils/url.js', 'utf8');

// Optimization 1: Stop requestAnimationFrame if hidden
const drawOld = \        function draw() {
            animationId = requestAnimationFrame(draw);

            if (parseFloat(canvas.style.opacity) <= 0) return;
\;
const drawNew = \        function draw() {
            if (parseFloat(canvas.style.opacity) <= 0) {
                animationId = null;
                return;
            }
            animationId = requestAnimationFrame(draw);
\;
urlJs = urlJs.replace(drawOld, drawNew);

// Optimization 2: Step for linea, solida, curva to reduce CPU
// For 'linea'
const lineaOld = \                    for (let i = 0; i < bufferLength; i++) {\;
const lineaNew = \                    const step = Math.max(1, Math.floor(bufferLength / 256));
                    for (let i = 0; i < bufferLength; i += step) {\;
urlJs = urlJs.replace(lineaOld, lineaNew);

// For 'curva'
const curvaOld = \                    for (let i = 0; i < bufferLength - 1; i++) {
                        let x0 = i * sliceWidth;
                        let x1 = (i + 1) * sliceWidth;
                        let y0 = Math.max(0, smoothedData[i] - 128) * scale;
                        let y1 = Math.max(0, smoothedData[i + 1] - 128) * scale;
                        let cp1x = x0 + sliceWidth / 3;
                        let cp1y = y0;
                        let cp2x = x1 - sliceWidth / 3;
                        let cp2y = y1;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
                    }\;
const curvaNew = \                    const step = Math.max(1, Math.floor(bufferLength / 128));
                    for (let i = 0; i < bufferLength - step; i += step) {
                        let x0 = i * sliceWidth;
                        let x1 = (i + step) * sliceWidth;
                        let y0 = Math.max(0, smoothedData[i] - 128) * scale;
                        let y1 = Math.max(0, smoothedData[i + step] - 128) * scale;
                        let cp1x = x0 + (x1 - x0) / 3;
                        let cp1y = y0;
                        let cp2x = x1 - (x1 - x0) / 3;
                        let cp2y = y1;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
                    }\;
urlJs = urlJs.replace(curvaOld, curvaNew);

// For 'solida'
const solidaOld = \                    for (let i = 0; i < bufferLength; i++) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        ctx.lineTo(x, amplitude);
                        x += sliceWidth;
                    }\;
const solidaNew = \                    const stepSol = Math.max(1, Math.floor(bufferLength / 256));
                    for (let i = 0; i < bufferLength; i += stepSol) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        ctx.lineTo(x, amplitude);
                        x += sliceWidth * stepSol;
                    }\;
urlJs = urlJs.replace(solidaOld, solidaNew);

// For 'dinamica'
const dinamicaOld = \                    for (let i = 0; i < bufferLength; i++) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        if (i === 0) ctx.moveTo(x, amplitude);
                        else ctx.lineTo(x, amplitude);
                        x += sliceWidth;
                    }\;
const dinamicaNew = \                    const stepDin = Math.max(1, Math.floor(bufferLength / 256));
                    for (let i = 0; i < bufferLength; i += stepDin) {
                        let amplitude = Math.max(0, smoothedData[i] - 128) * scale;
                        if (i === 0) ctx.moveTo(x, amplitude);
                        else ctx.lineTo(x, amplitude);
                        x += sliceWidth * stepDin;
                    }\;
urlJs = urlJs.replace(dinamicaOld, dinamicaNew);

// For 'montana'
const montanaOld = \                    for (let i = 0; i < bufferLength; i++) {
                        let amp = (smoothedData[i] - 128) * scale * 0.8;
                        ctx.lineTo(x, amp);
                        x += sliceWidth;
                    }\;
const montanaNew = \                    const stepMon = Math.max(1, Math.floor(bufferLength / 256));
                    for (let i = 0; i < bufferLength; i += stepMon) {
                        let amp = (smoothedData[i] - 128) * scale * 0.8;
                        ctx.lineTo(x, amp);
                        x += sliceWidth * stepMon;
                    }\;
urlJs = urlJs.replace(montanaOld, montanaNew);

fs.writeFileSync('src/utils/url.js', urlJs);

let buttonsJs = fs.readFileSync('src/ui/buttons.js', 'utf8');

// Modify showCanvas to restart loop if it was stopped
const showOld = \    function showCanvas() {
        const canvas = \\('wave-visualizer-canvas');
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (canvas) {
            canvas.style.opacity = '1';
            if (controlPanel) controlPanel.style.opacity = '1';
        }
    }\;
const showNew = \    function showCanvas() {
        const canvas = \\('wave-visualizer-canvas');
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (canvas) {
            canvas.style.opacity = '1';
            if (controlPanel) controlPanel.style.opacity = '1';
            // Restart drawing loop if it stopped
            if (!animationId && typeof draw === 'function') {
                draw();
            }
        }
    }\;
buttonsJs = buttonsJs.replace(showOld, showNew);

fs.writeFileSync('src/ui/buttons.js', buttonsJs);

console.log('Fixed performance!');
