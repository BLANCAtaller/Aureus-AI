/**
 * Aureus OS - Theme Engine Core
 * Handles all color logic, state management, and UI synchronization.
 */

class ThemeManager {
    constructor() {
        // State
        this.state = {
            primary: '#6366F1',
            accent: '#A855F7',
            mode: 'dark',
            borderFX: 'none'
        };

        // DOM Elements Cache
        this.elements = {};

        // Presets
        this.presets = {
            'neon': { p: '#6366F1', a: '#A855F7' },
            'warm': { p: '#F97316', a: '#EF4444' },
            'ocean': { p: '#06B6D4', a: '#3B82F6' },
            'nature': { p: '#84CC16', a: '#10B981' },
            'monochrome': { p: '#CBD5E1', a: '#64748B' },
            'royal': { p: '#C026D3', a: '#7C3AED' },
            'sunset': { p: '#F59E0B', a: '#BE185D' }
        };

        // Bind methods
        this.init = this.init.bind(this);
        this.setColor = this.setColor.bind(this);
        this.applyPreset = this.applyPreset.bind(this);
        this.randomize = this.randomize.bind(this);
        this.setFX = this.setFX.bind(this);
    }

    init() {
        console.log('ThemeManager: Initializing...');
        this.cacheElements();
        this.attachListeners();
        this.loadState();
        this.updateUI(); // Initial sync
    }

    cacheElements() {
        this.elements = {
            // Inputs
            primaryInput: document.getElementById('tm-primary-input'),
            primaryPicker: document.getElementById('tm-primary-picker'),
            accentInput: document.getElementById('tm-accent-input'),
            accentPicker: document.getElementById('tm-accent-picker'),

            // Visuals
            previewGradient: document.getElementById('tm-preview-gradient'),
            previewBadgePrimary: document.getElementById('tm-badge-primary'),
            previewBadgeAccent: document.getElementById('tm-badge-accent'),

            // Global Branding (Sidebar, etc)
            sidebarIcon: document.getElementById('sidebar-app-icon'),
            sidebarText: document.getElementById('sidebar-app-text-gradient')
        };
    }

    attachListeners() {
        // Primary Input (Text)
        this.elements.primaryInput?.addEventListener('change', (e) => {
            this.setColor('primary', e.target.value);
        });

        // Primary Picker (Color)
        this.elements.primaryPicker?.addEventListener('input', (e) => {
            this.setColor('primary', e.target.value);
        });

        // Accent Input (Text)
        this.elements.accentInput?.addEventListener('change', (e) => {
            this.setColor('accent', e.target.value);
        });

        // Accent Picker (Color)
        this.elements.accentPicker?.addEventListener('input', (e) => {
            this.setColor('accent', e.target.value);
        });
    }

    loadState() {
        if (typeof appState !== 'undefined' && appState.settings) {
            if (appState.settings.primaryColor) this.state.primary = appState.settings.primaryColor;
            if (appState.settings.accentColor) this.state.accent = appState.settings.accentColor;
            if (appState.settings.borderFX) this.state.borderFX = appState.settings.borderFX;

            // Apply loaded state to DOM
            document.documentElement.style.setProperty('--color-primary', this.state.primary);
            document.documentElement.style.setProperty('--gradient-start', this.state.primary);
            document.documentElement.style.setProperty('--gradient-end', this.state.accent);
            document.documentElement.setAttribute('data-border-fx', this.state.borderFX);
        }
    }

    setColor(type, color) {
        // Validation
        if (!this.isValidHex(color)) return;

        // Normalize
        color = color.toUpperCase();

        // Update State
        this.state[type] = color;

        // Apply to CSS Variables immediately for instant feedback
        const varName = type === 'primary' ? '--color-primary' : '--gradient-end';
        document.documentElement.style.setProperty(varName, color);

        if (type === 'primary') {
            document.documentElement.style.setProperty('--gradient-start', color);
        }

        // Sync UI
        this.updateUI();

        // Save State
        this.persistState();
    }

    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.state.primary = preset.p;
            this.state.accent = preset.a;

            document.documentElement.style.setProperty('--color-primary', preset.p);
            document.documentElement.style.setProperty('--gradient-start', preset.p);
            document.documentElement.style.setProperty('--gradient-end', preset.a);

            this.updateUI();
            this.persistState();
        }
    }

    setFX(fxName) {
        this.state.borderFX = fxName;
        document.documentElement.setAttribute('data-border-fx', fxName);
        this.persistState();
    }

    randomize() {
        const keys = Object.keys(this.presets);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        this.applyPreset(randomKey);
    }

    updateUI() {
        const { primary, accent } = this.state;

        if (this.elements.primaryInput) this.elements.primaryInput.value = primary;
        if (this.elements.primaryPicker) this.elements.primaryPicker.value = primary;

        // Sync Indicators
        const indicatorP = document.getElementById('tm-indicator-primary');
        if (indicatorP) indicatorP.style.backgroundColor = primary;

        if (this.elements.accentInput) this.elements.accentInput.value = accent;
        if (this.elements.accentPicker) this.elements.accentPicker.value = accent;

        // Sync Indicators
        const indicatorA = document.getElementById('tm-indicator-accent');
        if (indicatorA) indicatorA.style.backgroundColor = accent;

        // Sync Preview Gradient
        if (this.elements.previewGradient) {
            this.elements.previewGradient.style.background = `linear-gradient(135deg, ${primary}, ${accent})`;
        }

        // Sync Badges
        if (this.elements.previewBadgePrimary) {
            this.elements.previewBadgePrimary.innerText = primary;
            this.elements.previewBadgePrimary.style.borderColor = primary;
            this.elements.previewBadgePrimary.style.color = primary;
        }
        if (this.elements.previewBadgeAccent) {
            this.elements.previewBadgeAccent.innerText = accent;
            this.elements.previewBadgeAccent.style.borderColor = accent;
            this.elements.previewBadgeAccent.style.color = accent;
        }

        // External/Global Sync
        this.syncGlobalElements();
    }

    syncGlobalElements() {
        // Sidebar Icon
        if (this.elements.sidebarIcon) {
            this.elements.sidebarIcon.style.backgroundImage = `linear-gradient(to top right, ${this.state.primary}, ${this.state.accent})`;
            this.elements.sidebarIcon.style.boxShadow = `0 0 35px ${this.state.primary}66`;
        }

        // Sidebar Text
        if (this.elements.sidebarText) {
            this.elements.sidebarText.style.backgroundImage = `linear-gradient(to right, ${this.state.primary}, ${this.state.accent})`;
        }
    }

    persistState() {
        if (typeof appState !== 'undefined') {
            appState.settings = appState.settings || {};
            appState.settings.primaryColor = this.state.primary;
            appState.settings.accentColor = this.state.accent;
            appState.settings.borderFX = this.state.borderFX;
            if (typeof saveState === 'function') saveState();
        }
    }

    isValidHex(color) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(color);
    }
}

// Global Instance
window.themeManager = new ThemeManager();

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager.init();
});

// Helper for HTML onClick bindings (Legacy compatibility layer)

// Helper for HTML onClick bindings (Legacy compatibility layer)
function setThemePreset(name) {
    window.themeManager.applyPreset(name);
}
function randomizeGradient() {
    window.themeManager.randomize();
}

// Appearance & Dynamics Helpers
function setAppRadius(mode) {
    const root = document.documentElement;
    const modes = {
        'sharp': '0px',
        'standard': '2px', // Approx 0.125rem
        'round': '0.75rem',
        'playful': '1.5rem'
    };
    const val = modes[mode] || '0.75rem';
    root.style.setProperty('--radius-base', val);

    // Save state if needed
    if (window.appState) {
        window.appState.settings = window.appState.settings || {};
        window.appState.settings.radius = mode;
        if (typeof saveState === 'function') saveState();
    }
}

function setAppBlur(val) {
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${val}px`);

    const label = document.getElementById('setting-blur-label');
    if (label) label.innerText = `${val}px`;

    if (window.appState) {
        window.appState.settings = window.appState.settings || {};
        window.appState.settings.blur = val;
        if (typeof saveState === 'function') saveState();
    }
}

function setAppDensity(val) {
    // 0 = Spacious (100% gap), 100 = Compact (0% gap modification)
    // We can map this to a --spacing-factor variable
    // 50 is default (1x)
    const factor = 1 - ((val - 50) / 100);
    document.documentElement.style.setProperty('--spacing-factor', factor);
    const label = document.getElementById('setting-density-label');
    if (label) label.innerText = `${val}%`;
}

// Typography Helpers
function setFontScale(val) {
    // 80% to 120%
    const pct = val / 100;
    document.documentElement.style.setProperty('--font-scale', pct);
    const label = document.getElementById('lbl-font-scale');
    if (label) label.innerText = `${val}%`;
}

function setFontSpacing(val) {
    // -1, 0, 1
    const spacingMap = { '-1': '-0.02em', '0': '0em', '1': '0.05em' };
    const tracking = spacingMap[val] || '0em';
    document.documentElement.style.setProperty('--font-tracking', tracking);

    // Update active button state
    const btns = document.querySelectorAll('[data-spacing-btn]');
    if (btns && btns.length > 0) {
        btns.forEach(btn => {
            if (btn && btn.dataset) {
                if (btn.dataset.value === val) {
                    btn.classList.add('bg-indigo-500', 'text-white', 'shadow-lg');
                    btn.classList.remove('bg-white/5', 'text-slate-400');
                } else {
                    btn.classList.remove('bg-indigo-500', 'text-white', 'shadow-lg');
                    btn.classList.add('bg-white/5', 'text-slate-400');
                }
            }
        });
    }
}

function toggleInterfaceMode(mode) {
    const isDark = mode === 'dark';

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Apply Global Overrides for Light Mode (since HTML has hardcoded dark colors)
    applyLightModeOverrides(!isDark);

    // Update active toggle state
    const darkBtn = document.getElementById('btn-mode-dark');
    const lightBtn = document.getElementById('btn-mode-light');
    const indicator = document.getElementById('mode-indicator');

    if (indicator && darkBtn && lightBtn) {
        if (isDark) {
            if (indicator.style) indicator.style.left = '4px';
            if (darkBtn.classList) darkBtn.classList.add('text-indigo-400');
            if (lightBtn.classList) lightBtn.classList.remove('text-indigo-400');
        } else {
            if (indicator.style) indicator.style.left = 'calc(50% + 4px)';
            if (lightBtn.classList) lightBtn.classList.add('text-indigo-400');
            if (darkBtn.classList) darkBtn.classList.remove('text-indigo-400');
        }
    }

    // Persist
    if (window.appState) {
        window.appState.settings = window.appState.settings || {};
        window.appState.settings.mode = mode;
        if (typeof saveState === 'function') saveState();
    }

    // Force Chart Update & UI Refresh
    // Re-trigger current tab render to update chart colors
    if (typeof window.switchTab === 'function') {
        const current = localStorage.getItem('currentTab') || 'dashboard';
        setTimeout(() => window.switchTab(current), 50);
    }
}

function applyLightModeOverrides(enable) {
    let style = document.getElementById('light-mode-patch');
    if (!style) {
        style = document.createElement('style');
        style.id = 'light-mode-patch';
        // We escape the brackets for the Tailwind arbitrary value classes
        style.innerHTML = `
            html:not(.dark) body { background-color: #f8fafc !important; color: #0f172a !important; background-image: none !important; }
            
            /* Main Containers to White */
            html:not(.dark) .bg-\\[\\#0B0D14\\], 
            html:not(.dark) .bg-\\[\\#1a1d2e\\],
            html:not(.dark) .bg-\\[\\#0f1115\\],
            html:not(.dark) .bg-\\[\\#161b22\\],
            html:not(.dark) .bg-dark-900,
            html:not(.dark) .bg-dark-800,
            html:not(.dark) .bg-dark-700
            { background-color: #ffffff !important; border-color: #e2e8f0 !important; color: #0f172a !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05) !important; }

            /* Secondary Containers to Light Gray */
            html:not(.dark) .bg-\\[\\#12141f\\]\\/50,
            html:not(.dark) .bg-\\[\\#12141f\\]\\/80,
            html:not(.dark) .bg-\\[\\#12141f\\]
            { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #334155 !important; }

            /* Text Overrides */
            html:not(.dark) .text-white { color: #0f172a !important; }
            html:not(.dark) .text-slate-200 { color: #1e293b !important; }
            html:not(.dark) .text-slate-300 { color: #334155 !important; }
            html:not(.dark) .text-slate-400 { color: #64748b !important; }
            html:not(.dark) .text-slate-500 { color: #64748b !important; }
            
            /* Border Overrides */
            html:not(.dark) .border-white\\/5 { border-color: #e2e8f0 !important; }
            html:not(.dark) .border-white\\/10 { border-color: #cbd5e1 !important; }
            html:not(.dark) .border-white\\/\\[0\\.08\\] { border-color: #e2e8f0 !important; }

            /* Input Fields */
            html:not(.dark) input, html:not(.dark) select, html:not(.dark) textarea {
                background-color: #ffffff !important;
                border-color: #cbd5e1 !important;
                color: #0f172a !important;
            }
        `;
        document.head.appendChild(style);
    }
    style.disabled = !enable;
}

