// Simplified WebGL Ambilight for YouTube and YouTube Music
// Inspired by and credits to WesselKroos:
// https://github.com/WesselKroos/youtube-ambilight (Ambient light for YouTube)

class YTAmbilightWebGL {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationId = null;
        this.checkInterval = null;
        this.isActive = false;
        
        // State
        this.isAudioOnly = false;
        this.currentThumbUrl = '';
        this.thumbImage = null;
        this.thumbLoaded = false;
        this.thumbDrawn = false;
        
        // Shader locations
        this.positionLocation = null;
        this.texCoordLocation = null;
        this.textureLocation = null;
        
        // Settings
        this.opacity = 0.8;
    }

    setup(videoElement) {
        if (!videoElement) return;
        this.video = videoElement;
        
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'ytm-ambilight-webgl-canvas';
            
            // Hardware acceleration hints
            this.canvas.style.willChange = 'transform, opacity';
            this.canvas.style.transform = 'translateZ(0)';
            
            this.canvas.style.position = 'fixed';
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '0';
            this.canvas.style.opacity = this.opacity;
            // Additional CSS blur to smooth out the WebGL downsampling
            this.canvas.style.filter = 'blur(40px) saturate(150%)'; 
            
            // For YTM, insert it behind everything
            const player = document.querySelector('ytmusic-player');
            if (player) {
                this.canvas.style.zIndex = '0';
                const app = document.querySelector('ytmusic-app') || document.body;
                app.insertBefore(this.canvas, app.firstChild);
                
                if (!document.getElementById('ambilight-ytm-transparent-fix')) {
                    const style = document.createElement('style');
                    style.id = 'ambilight-ytm-transparent-fix';
                    style.textContent = `
                        ytmusic-player,
                        ytmusic-player #song-video,
                        ytmusic-player .html5-video-player,
                        ytmusic-player .html5-video-container,
                        ytmusic-player #song-image,
                        ytmusic-player-page,
                        ytmusic-player-page #background,
                        ytmusic-player-page .background,
                        ytmusic-app-layout,
                        ytmusic-app-layout > [id="background"] {
                            background: transparent !important;
                            background-color: transparent !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
            } else {
                // Regular YT - we use a 300% absolute canvas inside the video player.
                // This gives WebGL physical space to draw the light rays outside the video,
                // while preventing layout breakage because it's safely inside the player container.
                this.isRegularYT = true;
                const container = document.querySelector('.html5-video-player') || document.querySelector('#ytd-player');
                
                this.canvas.style.position = 'absolute';
                this.canvas.style.width = '300%';
                this.canvas.style.height = '300%';
                this.canvas.style.left = '-100%';
                this.canvas.style.top = '-100%';
                this.canvas.style.zIndex = ''; // Let DOM order dictate z-index
                this.canvas.style.pointerEvents = 'none';
                
                if (container) {
                    container.insertBefore(this.canvas, container.firstChild);
                    
                    // CRITICAL: YouTube restricts player containers with overflow:hidden.
                    // To let the fixed canvas bleed out, we MUST override overflow on all parents!
                    if (!document.getElementById('ambilight-yt-overflow-fix')) {
                        const style = document.createElement('style');
                        style.id = 'ambilight-yt-overflow-fix';
                        style.textContent = `
                            ytd-watch-flexy #player-container-outer,
                            ytd-watch-flexy #player-container-inner,
                            ytd-watch-flexy #player-container,
                            ytd-watch-flexy #full-bleed-container,
                            ytd-watch-flexy #player-full-bleed-container,
                            ytd-watch-flexy,
                            #ytd-player,
                            .html5-video-player {
                                overflow: visible !important;
                                clip-path: none !important;
                                background-color: transparent !important;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                } else {
                    const ytdApp = document.querySelector('ytd-app') || document.body;
                    ytdApp.insertBefore(this.canvas, ytdApp.firstChild);
                }
            }
        }

        this.initWebGL();
        this.start();
        
        this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
        this.resizeObserver.observe(this.video);
        this.resizeCanvas();
    }

    initWebGL() {
        // Enable alpha blending to prevent black shadows
        this.gl = this.canvas.getContext('webgl', { 
            preserveDrawingBuffer: true,
            antialias: false,
            depth: false,
            alpha: true,
            premultipliedAlpha: false
        });
        
        if (!this.gl) {
            console.error('WebGL not supported for Ambilight');
            return;
        }

        const gl = this.gl;

        const vsSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_screenCoord;
            void main() {
                gl_Position = vec4(a_position, 0, 1);
                // a_texCoord is already DOM-aligned (0,0 at Top-Left)
                v_screenCoord = a_texCoord;
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform sampler2D u_image;
            uniform float u_brightness;
            uniform float u_contrast;
            uniform float u_saturation;
            uniform float u_cropX;
            uniform float u_cropY;
            uniform vec4 u_videoRect;
            uniform float u_spread;
            varying vec2 v_screenCoord;
            
            vec3 adjustSaturation(vec3 color, float value) {
                const vec3 luminosityWeighting = vec3(0.2126, 0.7152, 0.0722);
                float grayscale = dot(color, luminosityWeighting);
                return mix(vec3(grayscale), color, value);
            }
            
            vec3 adjustContrast(vec3 color, float value) {
                return 0.5 + value * (color - 0.5);
            }
            
            void main() {
                // Map screen coordinates to video texture coordinates
                // Since the canvas is 300% size and centered, the video is in the middle 1/3
                vec2 videoPos = (v_screenCoord - u_videoRect.xy) / (u_videoRect.zw - u_videoRect.xy);
                
                // Crop black bars
                videoPos.x = u_cropX + videoPos.x * (1.0 - 2.0 * u_cropX);
                videoPos.y = u_cropY + videoPos.y * (1.0 - 2.0 * u_cropY);
                
                vec2 center = vec2(0.5, 0.5);
                vec2 dir = videoPos - center;
                
                // Raycast to find the intersection with the video bounding box [0, 1]
                vec2 absDir = abs(dir);
                float k = min(0.5 / max(absDir.x, 0.00001), 0.5 / max(absDir.y, 0.00001));
                
                // If k >= 1.0, the pixel is INSIDE the video bounds.
                // Draw the actual video pixel here! This prevents any black holes or shadows
                // if the video is faded, and prevents CSS blur from pulling in black edges!
                if (k >= 1.0) {
                    vec4 centerColor = texture2D(u_image, videoPos);
                    
                    // Apply brightness/contrast to center as well so it matches the glow
                    vec3 rgb = centerColor.rgb;
                    rgb = adjustContrast(rgb, u_contrast);
                    rgb = adjustSaturation(rgb, u_saturation);
                    rgb = rgb * u_brightness;
                    
                    gl_FragColor = vec4(rgb, 1.0);
                    return;
                }
                
                // Pixel is OUTSIDE the video.
                // Find the exact point on the edge of the video.
                vec2 edgePos = center + dir * k;
                
                // PURE RADIAL EDGE EXTRAPOLATION
                // Sample exactly 0.5% inside the video edge (approx 10-20px) to avoid 1px black borders.
                // By taking just this pixel, we create razor-sharp God Rays shooting outwards!
                vec2 samplePos = mix(edgePos, center, 0.005);
                vec4 finalColor = texture2D(u_image, samplePos);
                
                // Fade the light rays based on distance from the edge
                float distFromEdge = length(videoPos - edgePos);
                
                // We want a default spread (u_spread = 0) to still stretch 30% of the video size outwards!
                // If u_spread goes up to 2.0 (200%), it stretches up to 150% of the video size outwards.
                float maxDist = 0.3 + u_spread * 0.6;
                float falloff = 1.0 / maxDist;
                
                float alpha = max(0.0, 1.0 - (distFromEdge * falloff));
                
                // Apply Settings
                vec3 rgb = finalColor.rgb;
                rgb = adjustContrast(rgb, u_contrast);
                rgb = adjustSaturation(rgb, u_saturation);
                rgb = rgb * u_brightness;
                
                gl_FragColor = vec4(rgb, alpha);
            }
        `;

        const vertexShader = this.createShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fsSource);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(this.program));
            return;
        }

        this.positionLocation = gl.getAttribLocation(this.program, "a_position");
        this.texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
        this.textureLocation = gl.getUniformLocation(this.program, "u_image");
        this.brightnessLoc = gl.getUniformLocation(this.program, "u_brightness");
        this.contrastLoc = gl.getUniformLocation(this.program, "u_contrast");
        this.saturationLoc = gl.getUniformLocation(this.program, "u_saturation");
        this.cropXLoc = gl.getUniformLocation(this.program, "u_cropX");
        this.cropYLoc = gl.getUniformLocation(this.program, "u_cropY");
        this.videoRectLoc = gl.getUniformLocation(this.program, "u_videoRect");
        this.spreadLoc = gl.getUniformLocation(this.program, "u_spread");

        // Quad for the whole screen
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        ]), gl.STATIC_DRAW);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        
        // Edge size logic - instead of sampling the entire video frame, we only sample the outer edges (or spread the frame).
        // For simplicity in the lightweight model, we will use texture coordinates to "zoom" into the frame 
        // to ignore the center, or we just draw the frame. We will implement "edge size" via UV scaling later.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  1.0,  1.0,  1.0,  0.0,  0.0,
            0.0,  0.0,  1.0,  1.0,  1.0,  0.0,
        ]), gl.STATIC_DRAW);

        this.positionBuffer = positionBuffer;
        this.texCoordBuffer = texCoordBuffer;
        
        // Create Texture
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    resizeCanvas() {
        if (!this.canvas || !this.video) return;
        
        let rect = this.video.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        // Since we are not using CSS Blur by default anymore, we need HIGH resolution
        // to render crisp, sharp God Rays without pixelation.
        const scale = 0.5; // Render at 50% of actual physical size for performance
        let targetWidth, targetHeight;
        
        if (this.isRegularYT) {
            targetWidth = Math.floor(rect.width * 3 * scale);
            targetHeight = Math.floor(rect.height * 3 * scale);
        } else {
            targetWidth = Math.floor(window.innerWidth * scale);
            targetHeight = Math.floor(window.innerHeight * scale);
        }
        
        // Cap max resolution to prevent lag on 4K/8K screens
        if (targetWidth > 1920) {
            targetHeight = Math.floor(targetHeight * (1920 / targetWidth));
            targetWidth = 1920;
        }
        
        if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
            this.canvas.width = targetWidth;
            this.canvas.height = targetHeight;
            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                this.thumbDrawn = false;
            }
        }
    }

    getThumbUrl() {
        try {
            const mp = document.getElementById('movie_player');
            if (mp && typeof mp.getVideoData === 'function') {
                const vData = mp.getVideoData();
                if (vData && vData.video_id) {
                    return `https://i.ytimg.com/vi/${vData.video_id}/sddefault.jpg`;
                }
            }
        } catch (e) { }

        const selectors = [
            '#song-image yt-img-shadow img', '#song-image img',
            'ytmusic-player-page #thumbnail img', 'ytmusic-player-bar .image img'
        ];
        for (const sel of selectors) {
            const img = document.querySelector(sel);
            if (img && img.src && img.src.startsWith('http')) {
                return img.src;
            }
        }
        return null;
    }

    // 1Hz Polling to avoid doing expensive DOM checks inside requestAnimationFrame
    updateTrackState() {
        if (!this.isActive || !this.video) return;
        
        let audioOnly = false;
        if (this.video.videoWidth === 0) {
            audioOnly = true;
        } else {
            // Expensive check only once per second
            const songImage = document.querySelector('#song-image');
            if (songImage && songImage.offsetWidth > 0 && this.video.offsetWidth === 0) {
                audioOnly = true;
            }
        }
        
        this.isAudioOnly = audioOnly;

        let ambiEnabled = true;
        try {
            if (typeof GM_getValue !== 'undefined' && typeof SETTINGS_KEY !== 'undefined') {
                const settings = JSON.parse(GM_getValue(SETTINGS_KEY, '{}'));
                if (settings.syncCinematic !== undefined) {
                    ambiEnabled = settings.syncCinematic;
                }
            }
        } catch (e) {}

        if (!ambiEnabled) {
            // Ambilight disabled
            if (this.canvas) this.canvas.style.display = 'none';
        } else {
            if (this.canvas) this.canvas.style.display = 'block';
        }
    }

    updateCanvasStyles() {
        if (!this.canvas) return;
        
        // Changed default blur to 0 so the user can see the sharp rays by default
        let blur = 0;
        let spread = 1.0;
        let opacity = 0.8;
        let edgeFade = 0;
        
        try {
            if (typeof GM_getValue !== 'undefined') {
                const settings = JSON.parse(GM_getValue('ytSettingsMDCM', '{}'));
                this.cachedSettings = settings; // Cache for shader loop
                
                if (settings.ambiBlur !== undefined) blur = settings.ambiBlur;
                if (settings.ambiSpread !== undefined) spread = 1.0 + (settings.ambiSpread / 100);
                if (settings.ambiOpacity !== undefined) opacity = settings.ambiOpacity / 100;
                if (settings.ambiEdgeFade !== undefined) edgeFade = settings.ambiEdgeFade;
            }
        } catch (e) {}

        this.canvas.style.opacity = opacity;
        this.canvas.style.filter = `blur(${blur}px) saturate(150%)`;
        this.canvas.style.transform = `translateZ(0)`;

        const targets = [];
        if (this.video) targets.push(this.video);
        
        // Add YTM image element to targets for edge fade on audio-only tracks
        const ytmImg = document.querySelector('#song-image img#img') || document.querySelector('ytmusic-player-page img');
        if (ytmImg) targets.push(ytmImg);

        targets.forEach(target => {
            if (edgeFade > 0) {
                const f = edgeFade; // 0 to 50
                const mask = `linear-gradient(to right, transparent 0%, black ${f}%, black ${100 - f}%, transparent 100%), linear-gradient(to bottom, transparent 0%, black ${f}%, black ${100 - f}%, transparent 100%)`;
                target.style.maskImage = mask;
                target.style.webkitMaskImage = mask;
                target.style.maskComposite = 'intersect';
                target.style.webkitMaskComposite = 'source-in';
            } else {
                target.style.maskImage = 'none';
                target.style.webkitMaskImage = 'none';
            }
        });
    }

    uploadAndDraw(textureSource, isImage = false, rectElement = null) {
        // Update video rect (used for YTM fixed canvas mode only)
        const sourceForRect = rectElement || textureSource;
        if (sourceForRect) {
            const videoRect = sourceForRect.getBoundingClientRect();
            const winW = window.innerWidth || 1;
            const winH = window.innerHeight || 1;
            
            const vw = isImage ? (textureSource.naturalWidth || 1) : (textureSource.videoWidth || 1);
            const vh = isImage ? (textureSource.naturalHeight || 1) : (textureSource.videoHeight || 1);
            const videoAspect = vw / vh;
            const rectAspect = (videoRect.width || 1) / (videoRect.height || 1);
            
            let contentRelLeft, contentRelTop, contentRelRight, contentRelBottom;
            
            if (videoAspect > rectAspect) {
                // Letterbox
                const contentHeight = videoRect.width / videoAspect;
                const offsetY = (videoRect.height - contentHeight) / 2;
                contentRelLeft = 0;
                contentRelTop = offsetY / videoRect.height;
                contentRelRight = 1;
                contentRelBottom = (offsetY + contentHeight) / videoRect.height;
            } else {
                // Pillarbox
                const contentWidth = videoRect.height * videoAspect;
                const offsetX = (videoRect.width - contentWidth) / 2;
                contentRelLeft = offsetX / videoRect.width;
                contentRelTop = 0;
                contentRelRight = (offsetX + contentWidth) / videoRect.width;
                contentRelBottom = 1;
            }
            
            // Map video content coords to window coords
            const contentAbsLeft = videoRect.left + contentRelLeft * videoRect.width;
            const contentAbsTop = videoRect.top + contentRelTop * videoRect.height;
            const contentAbsRight = videoRect.left + contentRelRight * videoRect.width;
            const contentAbsBottom = videoRect.top + contentRelBottom * videoRect.height;
            
            this.currentVideoRect = [
                contentAbsLeft / winW,
                contentAbsTop / winH,
                contentAbsRight / winW,
                contentAbsBottom / winH
            ];
        } else {
            this.currentVideoRect = [0.25, 0.25, 0.75, 0.75]; // fallback
        }

        // Also update styles periodically to refresh cached settings
        if (!this.cachedSettings || Math.random() < 0.05) {
            this.updateCanvasStyles(); // update every ~20 frames
        }
        
        const gl = this.gl;
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        
        try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSource);
            gl.uniform1i(this.textureLocation, 0);
            
            // Get settings (we'll fetch from GM_getValue, or use defaults)
            let brightness = 1.0;
            let contrast = 1.0;
            let saturation = 1.0;
            let cropX = 0.0;
            let cropY = 0.0;
            
            let spread = 1.0;
            
            if (this.cachedSettings) {
                const settings = this.cachedSettings;
                if (settings.ambiBrightness !== undefined) brightness = settings.ambiBrightness / 100;
                if (settings.ambiContrast !== undefined) contrast = settings.ambiContrast / 100;
                if (settings.ambiSaturation !== undefined) saturation = settings.ambiSaturation / 100;
                if (settings.ambiCropX !== undefined) cropX = settings.ambiCropX / 100;
                if (settings.ambiCropY !== undefined) cropY = settings.ambiCropY / 100;
                if (settings.ambiSpread !== undefined) spread = 1.0 + (settings.ambiSpread / 100);
            }

            gl.uniform1f(this.brightnessLoc, brightness);
            gl.uniform1f(this.contrastLoc, contrast);
            gl.uniform1f(this.saturationLoc, saturation);
            gl.uniform1f(this.cropXLoc, cropX);
            gl.uniform1f(this.cropYLoc, cropY);
            gl.uniform1f(this.spreadLoc, spread);
            
            if (this.currentVideoRect) {
                if (this.isRegularYT) {
                    // The canvas is 300% of the container, centered.
                    // In canvas texture coords (0..1), the container occupies (1/3..2/3).
                    // But the ACTUAL video content may not fill the entire container
                    // because YouTube uses object-fit:contain on <video>.
                    // We must compute where the rendered content sits.
                    
                    const container = document.querySelector('.html5-video-player') || this.video.parentElement;
                    const containerRect = container.getBoundingClientRect();
                    const cw = containerRect.width || 1;
                    const ch = containerRect.height || 1;
                    
                    const vw = this.video.videoWidth || 1;
                    const vh = this.video.videoHeight || 1;
                    const videoAspect = vw / vh;
                    const containerAspect = cw / ch;
                    
                    let contentRelLeft, contentRelTop, contentRelRight, contentRelBottom;
                    
                    if (videoAspect > containerAspect) {
                        // Video is wider than container → letterbox (black bars top/bottom)
                        const contentHeight = cw / videoAspect;
                        const offsetY = (ch - contentHeight) / 2;
                        contentRelLeft = 0;
                        contentRelTop = offsetY / ch;
                        contentRelRight = 1;
                        contentRelBottom = (offsetY + contentHeight) / ch;
                    } else {
                        // Video is taller/squarer than container → pillarbox (black bars left/right)
                        const contentWidth = ch * videoAspect;
                        const offsetX = (cw - contentWidth) / 2;
                        contentRelLeft = offsetX / cw;
                        contentRelTop = 0;
                        contentRelRight = (offsetX + contentWidth) / cw;
                        contentRelBottom = 1;
                    }
                    
                    // Map from container-relative (0..1) to canvas-relative (0..1)
                    // Container occupies the middle 1/3 of the 300% canvas
                    const canvasLeft = (1/3) + contentRelLeft * (1/3);
                    const canvasTop = (1/3) + contentRelTop * (1/3);
                    const canvasRight = (1/3) + contentRelRight * (1/3);
                    const canvasBottom = (1/3) + contentRelBottom * (1/3);
                    
                    gl.uniform4f(this.videoRectLoc, canvasLeft, canvasTop, canvasRight, canvasBottom);
                } else {
                    // For fixed canvas (like YTM), we use the actual viewport rect
                    gl.uniform4f(this.videoRectLoc, this.currentVideoRect[0], this.currentVideoRect[1], this.currentVideoRect[2], this.currentVideoRect[3]);
                }
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        } catch (e) {
            // Ignore cross-origin or empty source errors gracefully
        }
    }

    draw() {
        if (!this.isActive || !this.gl || !this.video) return;
        
        const now = performance.now();
        // 30fps for video, 10fps check rate for audio-only (saves CPU loops)
        const delay = this.isAudioOnly ? 100 : 33;
        
        if (now - this.lastDraw < delay) {
            this.animationId = requestAnimationFrame(() => this.draw());
            return;
        }
        this.lastDraw = now;

        if (this.isAudioOnly) {
            const thumbImg = document.querySelector('#song-image img#img') || document.querySelector('ytmusic-player-page img');
            if (thumbImg && thumbImg.src && document.visibilityState === 'visible') {
                if (!this.cachedThumbImg || this.cachedThumbUrl !== thumbImg.src) {
                    this.cachedThumbImg = new Image();
                    this.cachedThumbImg.crossOrigin = 'anonymous';
                    this.cachedThumbImg.src = thumbImg.src;
                    this.cachedThumbUrl = thumbImg.src;
                }
                if (this.cachedThumbImg.complete && this.cachedThumbImg.naturalWidth > 0) {
                    this.uploadAndDraw(this.cachedThumbImg, true, thumbImg);
                }
            }
        } else {
            if (!this.video.paused && !this.video.ended && document.visibilityState === 'visible') {
                this.uploadAndDraw(this.video, false);
            }
        }

        this.animationId = requestAnimationFrame(() => this.draw());
    }

    start() {
        this.isActive = true;
        this.lastDraw = 0;
        this.currentThumbUrl = '';
        this.thumbLoaded = false;
        this.thumbDrawn = false;
        this.canvas.style.display = 'block';
        
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.checkInterval = setInterval(() => this.updateTrackState(), 1000);
        this.updateTrackState(); // Initial check
        
        this.draw();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
    }

    cleanup() {
        this.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        const overflowFix = document.getElementById('ambilight-yt-overflow-fix');
        if (overflowFix) {
            overflowFix.remove();
        }
        if (this.gl) {
            this.gl.deleteTexture(this.texture);
            this.gl.deleteBuffer(this.positionBuffer);
            this.gl.deleteBuffer(this.texCoordBuffer);
            this.gl.deleteProgram(this.program);
        }
        this.canvas = null;
        this.gl = null;
    }
}

window.ytmAmbilightWebGL = new YTAmbilightWebGL();
