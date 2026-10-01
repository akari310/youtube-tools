    function Notify(type = 'info', message = '', title = '') {
        const defaultTitles = {
            success: 'Success',
            error: 'Error',
            info: 'Information',
            warning: 'Warning',
        };

        if (isYTMusic || (window.trustedTypes && window.trustedTypes.defaultPolicy === null)) {
            // Avoid iziToast due to innerHTML TrustedTypes violation on strict environments
            let toast = document.getElementById('yt-tools-custom-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'yt-tools-custom-toast';
                toast.style.cssText = 'position:fixed;bottom:20px;left:20px;background:rgba(30,30,30,0.9);color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);border-left:4px solid #ff0000;transition:opacity 0.3s;opacity:0;pointer-events:none;';
                document.body.appendChild(toast);
            }
            toast.textContent = (title || defaultTitles[type] || 'Notification') + ': ' + message;
            if (type === 'success') toast.style.borderLeftColor = '#22c55e';
            else if (type === 'error') toast.style.borderLeftColor = '#ef4444';
            else if (type === 'warning') toast.style.borderLeftColor = '#f59e0b';
            else toast.style.borderLeftColor = '#3b82f6';

            toast.style.opacity = '1';
            if (toast._timer) clearTimeout(toast._timer);
            toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
            return;
        }

        try {
            iziToast[type]({
                title: title || defaultTitles[type] || 'Notification',
                message: message,
                position: 'bottomLeft',
            });
        } catch (e) {
            console.warn('[yt-tools] iziToast failed:', e);
        }
    }

    // Helper: create SVG icon using DOM API (no innerHTML needed)
    function createSvgIcon(pathsData, size) {
        const sz = size || 24;
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', String(sz));
        svg.setAttribute('height', String(sz));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        pathsData.forEach(d => {
            const p = document.createElementNS(svgNS, 'path');
            p.setAttribute('d', d);
            if (d === 'M0 0h24v24H0z') p.setAttribute('fill', 'none');
            svg.appendChild(p);
        });
        return svg;
    }

    // Helper: create a toolbar button with SVG icon
    function makeToolBtn(title, id, className, paths) {
        const btn = document.createElement('button');
        btn.title = title;
        btn.type = 'button';
        if (id) btn.id = id;
        btn.className = (className ? className + ' ' : '') + 'botones_div';
        btn.appendChild(createSvgIcon(paths));
        return btn;
    }

