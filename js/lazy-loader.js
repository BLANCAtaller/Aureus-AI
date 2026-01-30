class LazyLoader {
    static libraries = {
        chartjs: 'https://cdn.jsdelivr.net/npm/chart.js',
        apexcharts: 'https://cdn.jsdelivr.net/npm/apexcharts',
        jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        html2pdf: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
        xlsx: 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js',
        exceljs: 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
        sweetalert: 'https://cdn.jsdelivr.net/npm/sweetalert2@11',
        confetti: 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
        autotable: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
    };

    static loaded = new Set();
    static pending = new Map();

    /**
     * Load a library by key or custom URL
     * @param {string} key - Key from libraries object or direct URL
     * @returns {Promise}
     */
    static load(key) {
        return new Promise((resolve, reject) => {
            const url = this.libraries[key] || key;

            // If already loaded, resolve immediately
            if (this.loaded.has(url)) {
                return resolve();
            }

            // If currently loading, return the existing promise
            if (this.pending.has(url)) {
                return this.pending.get(url).then(resolve).catch(reject);
            }

            console.log(`[LazyLoader] Loading ${key}...`);

            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            const promise = new Promise((res, rej) => {
                script.onload = () => {
                    console.log(`[LazyLoader] ${key} loaded successfully.`);
                    this.loaded.add(url);
                    this.pending.delete(url);
                    res();
                };
                script.onerror = (err) => {
                    console.error(`[LazyLoader] Failed to load ${key}`, err);
                    this.pending.delete(url);
                    rej(err);
                };
            });

            this.pending.set(url, promise);
            document.head.appendChild(script);

            promise.then(resolve).catch(reject);
        });
    }

    /**
     * Load multiple libraries in parallel
     * @param {string[]} keys 
     */
    static loadAll(keys) {
        return Promise.all(keys.map(k => this.load(k)));
    }
}

// Global exposure
window.LazyLoader = LazyLoader;
