const fs = require('fs');

let code = fs.readFileSync('src/utils/downloader.js', 'utf8');

const oldFetchArrayBuffer = \
                    try {
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), timeoutMs);
                        const response = await fetch(url, { signal: controller.signal });
                        clearTimeout(id);
                        if (response.ok) {
                            const buffer = await response.arrayBuffer();
                            resolve(buffer);
                            return;
                        } else if (response.status >= 500 && retriesLeft > 0) {
                            console.warn(\\\etch HTTP \\\ for \\\, retrying...\\\);
                            setTimeout(() => attempt(retriesLeft - 1), 2000);
                            return;
                        }
                    } catch (err) {\;

const newFetchArrayBuffer = \
                    try {
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), timeoutMs);
                        let response;
                        try {
                            response = await fetch(url, { signal: controller.signal });
                        } catch (err) {
                            clearTimeout(id);
                            throw err;
                        }
                        if (response.ok) {
                            const buffer = await response.arrayBuffer();
                            clearTimeout(id);
                            resolve(buffer);
                            return;
                        }
                        clearTimeout(id);
                        if (response.status >= 500 && retriesLeft > 0) {
                            console.warn(\\\etch HTTP \\\ for \\\, retrying...\\\);
                            setTimeout(() => attempt(retriesLeft - 1), 2000);
                            return;
                        }
                    } catch (err) {\;

if (code.includes(oldFetchArrayBuffer)) {
    code = code.replace(oldFetchArrayBuffer, newFetchArrayBuffer);
    fs.writeFileSync('src/utils/downloader.js', code);
    console.log('Fixed fetchArrayBuffer!');
} else {
    console.log('Could not find oldFetchArrayBuffer!');
}

