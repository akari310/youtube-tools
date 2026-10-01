const fs = require('fs');
const { createCanvas } = require('canvas');

const width = 300;
const height = 300;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Simulate video: 100x100 white square in the middle (100, 100) to (200, 200)
// Rest is black
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        let r=0, g=0, b=0;
        
        // videoPos mapping: [0, 300] -> [-1, 2]
        let videoPosX = (x / width) * 3.0 - 1.0;
        let videoPosY = (y / height) * 3.0 - 1.0;
        
        let center = [0.5, 0.5];
        let dir = [videoPosX - center[0], videoPosY - center[1]];
        let absDir = [Math.abs(dir[0]), Math.abs(dir[1])];
        
        let k = Math.min(0.5 / Math.max(absDir[0], 0.00001), 0.5 / Math.max(absDir[1], 0.00001));
        
        if (k >= 1.0) {
            // Inside video (should be exactly 100..200)
            if (videoPosX >= 0.0 && videoPosX <= 1.0 && videoPosY >= 0.0 && videoPosY <= 1.0) {
                // If we simulate the texture having a white border and gray center to see tiling
                if (videoPosX < 0.1 || videoPosX > 0.9 || videoPosY < 0.1 || videoPosY > 0.9) {
                    r=255; g=0; b=0; // Red border
                } else {
                    r=255; g=255; b=255; // White center
                }
            } else {
                // This shouldn't happen if k >= 1 is true
                r=0; g=0; b=255; // Blue if it somehow thinks it's inside but it's not
            }
        } else {
            let edgePos = [center[0] + dir[0] * k, center[1] + dir[1] * k];
            let samplePos = [
                edgePos[0] * (1.0 - 0.005) + center[0] * 0.005,
                edgePos[1] * (1.0 - 0.005) + center[1] * 0.005
            ];
            
            // Sample texture at samplePos
            // If samplePos tiles, we will see red borders repeating!
            let tx = samplePos[0];
            let ty = samplePos[1];
            
            // Replicate CLAMP_TO_EDGE
            tx = Math.max(0, Math.min(1, tx));
            ty = Math.max(0, Math.min(1, ty));
            
            if (tx < 0.1 || tx > 0.9 || ty < 0.1 || ty > 0.9) {
                r=255; g=0; b=0; // Red border
            } else {
                r=255; g=255; b=255; // White center
            }
            
            // Dim it based on distance
            let dist = Math.sqrt(Math.pow(videoPosX - edgePos[0], 2) + Math.pow(videoPosY - edgePos[1], 2));
            let maxDist = 0.3;
            let alpha = Math.max(0.0, 1.0 - (dist / maxDist));
            r *= alpha; g *= alpha; b *= alpha;
        }
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('shader_test.png', buffer);
console.log('Saved shader_test.png');
