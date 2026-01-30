/**
 * Localization Utility for AUREUS AI
 * Handles Language and Currency preferences using DOM manipulation.
 */

// 1. Translation Dictionary
const translations = {
    es: {
        // Sidebar
        "sidebar-goal-count": "DESPERDICIO",
        "sidebar-wants-label": "DESEOS",
        "sidebar-monthly-spend": "GASTO MENSUAL",
        "sidebar-daily-spend": "GASTO DIARIO",
        "sidebar-transactions": "TRANSACCIONES",
        "nav-dashboard": "DASHBOARD",
        "nav-wallet": "BILLETERA",
        "nav-budget": "FINANZAS",
        "nav-savings": "AHORRO",
        "nav-settings": "AJUSTES",

        // Top Bar
        "btn-save": "GUARDAR",
        "btn-backup": "RESPALDO",

        // Dashboard Tab
        "dash-welcome-prefix": "Hola,",
        "dash-welcome-suffix": "¿Listo para tomar el control?",
        "dash-income": "Total Ingresos",
        "dash-expenses": "Total Gastos",
        "dash-balance": "Balance Total", // Replaces "Available Balance" or similar
        "dash-recent-viz": "Visualización Reciente",
        "dash-activity": "Actividad Reciente",
        "dash-quick-actions": "Acciones Rápidas",
        "btn-add-income": "Ingreso",
        "btn-add-expense": "Gasto",

        // Wallet Tab
        "wallet-title": "Billetera",
        "wallet-subtitle": "HISTORIAL DE MOVIMIENTOS",
        "wallet-search": "Buscar...",
        "wallet-filter-week": "Semana",
        "wallet-filter-day": "Día",
        "wallet-filter-all": "Todos",
        "wallet-filter-income": "Ingresos",
        "wallet-filter-expense": "Gastos",
        "wallet-filter-cat": "Cat.",
        "wallet-filter-focus": "Focus",
        "wallet-go-current": "Ir al Mes Actual",

        // Budget Tab
        "budget-title": "Finanzas",
        "budget-subtitle": "PRESUPUESTO Y CONTROL",
        "budget-burndown": "Burndown",
        "budget-health": "Salud Financiera",
        "budget-available": "Disponible",
        "budget-comparison": "Comparativa Mensual",
        "budget-limit": "Presupuesto",
        "budget-real": "Gasto Real",
        "budget-distribution": "Distribución del Gasto",
        "budget-categories": "Categorías",
        "budget-calendar": "Desglose Diario",
        "budget-calendar-today": "Hoy",

        // Savings Tab
        "savings-title": "Ahorro",
        "savings-subtitle": "OBJETIVOS Y PATRIMONIO",
        "savings-portfolio": "Portafolio Activo",
        "savings-total-value": "Valor Total",
        "savings-debt": "Liquidación de Deuda",
        "savings-destroy-debt": "DESTRUIR DEUDA",

        // Settings Tab
        "settings-title": "Ajustes",
        "settings-subtitle": "CONFIGURACIÓN DEL SISTEMA",
        "settings-profile-name": "Jesús Rodríguez", // Example
        "settings-profile-role": "Administrador",
        "settings-appearance": "Apariencia",
        "settings-theme": "Tema",
        "settings-wallpapers": "Fondos de Pantalla",
        "settings-preferences": "Preferencias del Sistema",
        "settings-localization": "Localización",
        "settings-currency": "Moneda de Visualización",
        "settings-language": "Idioma de la App",
        "settings-notifications": "Notificaciones",
        "settings-privacy": "Zona de Privacidad",
        "settings-reset": "Restablecer de Fábrica",
        "settings-reset-desc": "Borrar todos los datos",
        "settings-export": "Exportar Datos",
        "settings-export-desc": "Descargar Excel",

        // Misc
        "lbl-needs": "Necesidades",
        "lbl-wants": "Deseos",
        "lbl-savings": "Ahorro",
        "lbl-invest": "Inversión",
        "lbl-waste": "Desperdicio"
    },
    en: {
        // Sidebar
        "sidebar-goal-count": "WASTE",
        "sidebar-wants-label": "WANTS",
        "sidebar-monthly-spend": "MONTHLY SPEND",
        "sidebar-daily-spend": "DAILY SPEND",
        "sidebar-transactions": "TRANSACTIONS",
        "nav-dashboard": "DASHBOARD",
        "nav-wallet": "WALLET",
        "nav-budget": "FINANCE",
        "nav-savings": "SAVINGS",
        "nav-settings": "SETTINGS",

        // Top Bar
        "btn-save": "SAVE",
        "btn-backup": "BACKUP",

        // Dashboard Tab
        "dash-welcome-prefix": "Hello,",
        "dash-welcome-suffix": "Ready to take control?",
        "dash-income": "Total Income",
        "dash-expenses": "Total Expenses",
        "dash-balance": "Total Balance",
        "dash-recent-viz": "Recent Visualization",
        "dash-activity": "Recent Activity",
        "dash-quick-actions": "Quick Actions",
        "btn-add-income": "Income",
        "btn-add-expense": "Expense",

        // Wallet Tab
        "wallet-title": "Wallet",
        "wallet-subtitle": "TRANSACTION HISTORY",
        "wallet-search": "Search...",
        "wallet-filter-week": "Week",
        "wallet-filter-day": "Day",
        "wallet-filter-all": "All",
        "wallet-filter-income": "Income",
        "wallet-filter-expense": "Expense",
        "wallet-filter-cat": "Cat.",
        "wallet-filter-focus": "Focus",
        "wallet-go-current": "Go to Current Month",

        // Budget Tab
        "budget-title": "Finance",
        "budget-subtitle": "BUDGET & CONTROL",
        "budget-burndown": "Burndown",
        "budget-health": "Financial Health",
        "budget-available": "Available",
        "budget-comparison": "Monthly Comparison",
        "budget-limit": "Budget",
        "budget-real": "Actual Spend",
        "budget-distribution": "Spend Distribution",
        "budget-categories": "Categories",
        "budget-calendar": "Daily Breakdown",
        "budget-calendar-today": "Today",

        // Savings Tab
        "savings-title": "Savings",
        "savings-subtitle": "GOALS & WEALTH",
        "savings-portfolio": "Active Portfolio",
        "savings-total-value": "Total Value",
        "savings-debt": "Debt Liquidation",
        "savings-destroy-debt": "DESTROY DEBT",

        // Settings Tab
        "settings-title": "Settings",
        "settings-subtitle": "SYSTEM CONFIGURATION",
        "settings-profile-name": "Jesus Rodriguez",
        "settings-profile-role": "Administrator",
        "settings-appearance": "Appearance",
        "settings-theme": "Theme",
        "settings-wallpapers": "Wallpapers",
        "settings-preferences": "System Preferences",
        "settings-localization": "Localization",
        "settings-currency": "Display Currency",
        "settings-language": "App Language",
        "settings-notifications": "Notifications",
        "settings-privacy": "Privacy Zone",
        "settings-reset": "Factory Reset",
        "settings-reset-desc": "Clear all data",
        "settings-export": "Export Data",
        "settings-export-desc": "Download Excel",

        // Misc
        "lbl-needs": "Needs",
        "lbl-wants": "Wants",
        "lbl-savings": "Savings",
        "lbl-invest": "Investment",
        "lbl-waste": "Waste"
    }
};

/**
 * Mappings between Translation Keys and DOM Elements (Selectors)
 * Format: { key: 'selector' } or { key: { selector: '...', attr: 'innerText' } }
 */
// DOM Mappings Object Removed - Using direct mappings in applyLanguage function for better control


// 2. State & Functions
window.currentLanguage = localStorage.getItem('appLanguage') || 'es';
window.currentCurrency = localStorage.getItem('displayCurrency') || 'MXN';

window.setLanguageProfile = function (lang) {
    if (lang === window.currentLanguage) return;
    window.currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    applyLanguage(lang);

    // Sync to Cloud
    if (window.appState) {
        window.appState.settings = window.appState.settings || {};
        window.appState.settings.language = lang;
        if (typeof saveState === 'function') saveState();
    }

    // Optional: Refresh charts or other components that might have hardcoded strings
    if (typeof renderBudgetTab === 'function') setTimeout(renderBudgetTab, 100);
    if (typeof renderSettingsTab === 'function') setTimeout(renderSettingsTab, 100);
}

window.setCurrencyProfile = function (currency) {
    window.currentCurrency = currency;
    localStorage.setItem('displayCurrency', currency);

    // Sync to Cloud
    if (window.appState) {
        window.appState.settings = window.appState.settings || {};
        window.appState.settings.currency = currency;
        if (typeof saveState === 'function') saveState();
    }

    // Refresh Dashboards to apply currency formatting
    if (typeof renderMergedDashboard === 'function') renderMergedDashboard();
    if (typeof renderBudgetTab === 'function') renderBudgetTab();
    if (typeof renderSavingsTab === 'function') renderSavingsTab();
}

function applyLanguage(lang) {
    if (!translations || !lang) return;
    const t = translations[lang];
    if (!t) {
        console.warn(`Translation for language "${lang}" not found.`);
        return;
    }

    // A. Manual ID mappings (Fastest)
    // Sidebar
    setText('#nav-dashboard span', t['nav-dashboard']);
    setText('#nav-wallet span', t['nav-wallet']);
    setText('#nav-budget span', t['nav-budget']);
    setText('#nav-savings span', t['nav-savings']);
    setText('#nav-settings span', t['nav-settings']);

    setText('#sidebar-wants-label', t['sidebar-wants-label']);

    // Sidebar Stats (Traversing)
    const sidebarRing = document.querySelector('#sidebarRingChart');
    if (sidebarRing) {
        // The label is in the overlay div, 2nd span
        const overlay = sidebarRing.nextElementSibling;
        if (overlay) {
            const label = overlay.querySelectorAll('span')[1];
            if (label) label.innerText = t['sidebar-monthly-spend'];
        }
    }

    const sidebarToday = document.querySelector('#sidebar-today-stats');
    if (sidebarToday) {
        const labels = sidebarToday.querySelectorAll('p.text-\\[8px\\]');
        if (labels[0]) labels[0].innerText = t['sidebar-daily-spend'];
        if (labels[1]) labels[1].innerText = t['sidebar-transactions'];
    }

    // Top Bar
    const saveBtn = document.querySelector("button[onclick='universalSave()'] span");
    if (saveBtn) saveBtn.innerText = t['btn-save'];

    // Tab Headers (Generic approach for uniform headers)
    setTabHeader('view-wallet', t['wallet-title'], t['wallet-subtitle']);
    setTabHeader('view-budget', t['budget-title'], t['budget-subtitle']);
    setTabHeader('view-savings', t['savings-title'], t['savings-subtitle']);
    setTabHeader('view-settings', t['settings-title'], t['settings-subtitle']);

    // Wallet Specifics
    setAttr('#search-input', 'placeholder', t['wallet-search']);
    setText('#btn-time-week', t['wallet-filter-week']);
    setText('#btn-time-day', t['wallet-filter-day']);
    setText('#btn-type-all', t['wallet-filter-all']);
    setText('#btn-type-income', t['wallet-filter-income']);
    setText('#btn-type-expense', t['wallet-filter-expense']);
    setText('#lbl-filter-cat', t['wallet-filter-cat']);
    setText('#lbl-filter-focus', t['wallet-filter-focus']);

    const goCurrentBtn = document.querySelector("button[onclick='selectCurrentMonth()']");
    if (goCurrentBtn) {
        // preserve icon
        const icon = goCurrentBtn.querySelector('i');
        goCurrentBtn.innerHTML = '';
        if (icon) goCurrentBtn.appendChild(icon);
        goCurrentBtn.appendChild(document.createTextNode(' ' + t['wallet-go-current']));
    }

    // Budget Specifics
    // Burndown Badge
    setText('#d2-burndown-badge-text', 'PACE ANALYSIS'); // Keep english or translate? logic says translate

    // Health Widget
    const healthWidget = document.getElementById('budgetHealthChart')?.parentElement;
    if (healthWidget) {
        const h3 = healthWidget.querySelector('h3');
        if (h3) h3.innerText = t['budget-health'];
        const dispSpan = healthWidget.querySelector('span.uppercase.opacity-60');
        if (dispSpan) dispSpan.innerText = t['budget-available'];
    }

    // Comparison
    const compWidget = document.getElementById('budgetComparisonChart')?.parentElement;
    if (compWidget) {
        const h3 = compWidget.querySelector('h3');
        if (h3) h3.innerText = t['budget-comparison'];
        const labels = compWidget.querySelectorAll('span.text-\\[8px\\]');
        if (labels[0]) labels[0].innerText = t['budget-limit'];
        if (labels[1]) labels[1].innerText = t['budget-real'];
    }

    // Distribution
    const distWidget = document.querySelector("h3[onclick='updateBudgetFocusStats();']");
    if (distWidget && distWidget.childNodes && distWidget.childNodes.length > 0) {
        distWidget.childNodes[0].nodeValue = t['budget-distribution'] + " "; // preserve icon
    }

    // Categories Header
    const budgetList = document.querySelector("#budget-list");
    if (budgetList) {
        const catHeader = budgetList.previousElementSibling?.querySelector('h3');
        if (catHeader && catHeader.childNodes.length > 2 && catHeader.childNodes[2]) {
            catHeader.childNodes[2].nodeValue = " " + t['budget-categories'];
        }
    }

    // Calendar
    const calGrid = document.querySelector("#budget-cal-grid");
    if (calGrid) {
        const calContainer = calGrid.parentElement;
        if (calContainer) {
            const h3 = calContainer.querySelector('h3');
            if (h3 && h3.childNodes.length > 2 && h3.childNodes[2]) {
                // preserve icon
                // h3 structure: icon, text
                // Just updated text node
                h3.childNodes[2].nodeValue = "\n" + t['budget-calendar'] + "\n";
            }
            const todayBadge = document.querySelector("#budget-cal-current-date + span");
            if (todayBadge) todayBadge.innerText = t['budget-calendar-today'];
        }
    }


    // Settings Specifics
    // Loop through settings headers if needed...
}

// Helpers
function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el && text) el.innerText = text;
}

function setAttr(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
}

function setTabHeader(tabId, title, p) {
    const el = document.getElementById(tabId);
    if (!el) return;
    const h2 = el.querySelector('h2');
    if (h2) h2.innerText = title;
    const sub = el.querySelector('p.text-slate-500');
    if (sub) sub.innerText = p;
}

// Init on Load
document.addEventListener('DOMContentLoaded', () => {
    // Set inputs
    const langSelect = document.getElementById('setting-app-language');
    if (langSelect) langSelect.value = window.currentLanguage;

    const currSelect = document.getElementById('setting-display-currency');
    if (currSelect) currSelect.value = window.currentCurrency;

    // Apply
    if (window.currentLanguage !== 'es') {
        applyLanguage(window.currentLanguage);
    }
});
