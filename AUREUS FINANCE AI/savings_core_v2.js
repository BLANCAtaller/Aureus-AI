// ... (Existing content of initSavingsData and renderSavingsTab remains unchanged) ...

// Helper to make functions global
window.editPortfolioItemDetails = editPortfolioItemDetails;
window.deletePortfolioHistory = deletePortfolioHistory;
window.promptPortfolioTransaction = promptPortfolioTransaction;
window.deletePortfolioItem = deletePortfolioItem;
window.editPortfolioHistory = editPortfolioHistory;
window.renderSavingsTab = renderSavingsTab;

// ... (Existing functions: initSavingsData, renderSavingsTab, createSavingsCard) ...

// ============================================
//      SAVINGS & DEBT CORE ENGINE (V2.2)
// ============================================

// PERSISTENCE HELPER
window.saveData = function () {
    // 1. Try Global Save (via StateManager)
    if (typeof window.saveState === 'function') {
        window.saveState();
    } else {
        // Fallback only if StateManager is missing
        console.warn("StateManager missing, saving to default key.");
        // We use the dynamic key if possible, otherwise legacy
        const key = typeof window.getCurrentUserKey === 'function' ? window.getCurrentUserKey() : 'developMeApp_v1';
        localStorage.setItem(key, JSON.stringify(window.appState));
    }
};

const saveData = window.saveData; // Local alias

// 1. Initialization and Data Migration
function initSavingsData() {
    // A. Initialize Portfolio if missing
    if (!appState.portfolio) {
        console.log("Initializing Unified Portfolio Structure...");
        appState.portfolio = [];

        // B. Migrate Core Assets (One-time from Legacy Balance)
        const coreAssets = [
            { key: 'pocket', name: 'Efectivo', icon: 'wallet', color: 'emerald' },
            { key: 'bank', name: 'Banco', icon: 'landmark', color: 'blue' },
            { key: 'loan', name: 'Ahorro', icon: 'piggy-bank', color: 'indigo' }
        ];

        coreAssets.forEach(core => {
            const currentAmt = appState.balanceAccounts ? (appState.balanceAccounts[core.key] || 0) : 0;
            appState.portfolio.push({
                id: crypto.randomUUID(),
                type: 'asset',
                subtype: 'core',
                key: core.key,
                name: core.name,
                icon: core.icon,
                amount: currentAmt,
                target: 0,
                theme: core.color,
                history: [
                    { id: crypto.randomUUID(), date: new Date().toISOString(), amount: currentAmt, type: 'in', note: 'Balance Inicial' }
                ],
                lastUpdated: new Date().toISOString()
            });
        });

        // C. Migrate Custom Assets (Legacy)
        if (appState.customAssets && Array.isArray(appState.customAssets)) {
            appState.customAssets.forEach((asset, idx) => {
                appState.portfolio.push({
                    id: crypto.randomUUID(),
                    type: 'asset',
                    subtype: 'custom',
                    name: asset.name || 'Activo',
                    icon: asset.icon || 'archive',
                    amount: asset.amount || 0,
                    target: asset.target || 0,
                    theme: 'pink',
                    history: [
                        { id: crypto.randomUUID(), date: new Date().toISOString(), amount: asset.amount || 0, type: 'in', note: 'Migración' }
                    ],
                    lastUpdated: new Date().toISOString()
                });
            });
        }

        // D. Migrate Goals
        if (appState.goals) {
            appState.goals.forEach((goal, idx) => {
                let theme = 'violet';
                if (goal.icon === 'car' || (goal.name && goal.name.toLowerCase().includes('car'))) theme = 'cyan';
                if (goal.icon === 'plane' || (goal.name && goal.name.toLowerCase().includes('viaje'))) theme = 'amber';

                appState.portfolio.push({
                    id: crypto.randomUUID(),
                    type: 'goal',
                    subtype: 'user',
                    name: goal.name || 'Meta',
                    icon: goal.icon || 'flag',
                    amount: goal.current || 0,
                    target: goal.target || 1000,
                    theme: theme,
                    history: [
                        { date: new Date().toISOString(), amount: goal.current || 0, type: 'in', note: 'Migración de Meta' }
                    ],
                    lastUpdated: new Date().toISOString()
                });
            });
        }
        saveData();
    } else {
        // FALLBACK: Ensure Core Assets exist even if portfolio exists
        const coreKeys = ['core-pocket', 'core-bank', 'core-loan'];
        const hasPocket = appState.portfolio.some(i => i.id === 'core-pocket' || i.key === 'pocket');

        if (!hasPocket) {
            const coreAssets = [
                { key: 'pocket', name: 'Efectivo', icon: 'wallet', color: 'emerald' },
                { key: 'bank', name: 'Banco', icon: 'landmark', color: 'blue' },
                { key: 'loan', name: 'Ahorro', icon: 'piggy-bank', color: 'indigo' }
            ];
            coreAssets.forEach(core => {
                if (!appState.portfolio.find(i => i.key === core.key)) {
                    const currentAmt = appState.balanceAccounts ? (appState.balanceAccounts[core.key] || 0) : 0;
                    appState.portfolio.push({
                        id: `core-${core.key}`,
                        type: 'asset',
                        subtype: 'core',
                        key: core.key,
                        name: core.name,
                        icon: core.icon,
                        amount: currentAmt,
                        target: 0,
                        theme: core.color,
                        history: [], // Reset history for safety
                        lastUpdated: new Date().toISOString()
                    });
                }
            });
        }
    }

    // Ensure Fallbacks
    if (!appState.debts) appState.debts = [];

    // Sync Legacy
    if (appState.portfolio) {
        appState.portfolio.filter(i => i.subtype === 'core').forEach(item => {
            if (appState.balanceAccounts) {
                appState.balanceAccounts[item.key] = item.amount;
            }
        });
    }
}

// 2. Main Render Function
function renderSavingsTab() {
    console.log("Rendering Savings Tab (v2.2 Horizontal Design)...");
    initSavingsData();

    const portfolio = appState.portfolio || [];

    // SELF-HEALING LEGACY RESTORED (Safely)
    // Ensures that the 'amount' matches the sum of 'history'
    portfolio.forEach(item => {
        if (Array.isArray(item.history) && item.history.length > 0) {
            const calculated = item.history.reduce((acc, h) => {
                const val = parseFloat(h.amount) || 0;
                return h.type === 'in' ? acc + val : acc - val;
            }, 0);

            // Fix discrepancies
            if (Math.abs(item.amount - calculated) > 0.01) {
                console.warn(`[Self-Healing] Syncing ${item.name} (${item.id}): ui=${item.amount} vs history=${calculated}`);
                item.amount = calculated;
            }
        }
    });
    const assets = portfolio.filter(i => i.type === 'asset');
    const goals = portfolio.filter(i => i.type === 'goal');

    // OPTION B: Calculated Global Net Worth (Consistent with Dashboard)
    // 1. Get Initial Balance
    let globalBalance = 0;
    if (window.appState && window.appState.profile && window.appState.profile.balance !== undefined) {
        const rawIB = window.appState.profile.balance;
        const val = typeof rawIB === 'string' ? parseFloat(rawIB.replace(/[^0-9.-]/g, '')) : parseFloat(rawIB);
        globalBalance += val || 0;
    }

    // 2. Add All Time Transactions
    if (window.appState && window.appState.transactions) {
        window.appState.transactions.forEach(t => {
            const amount = parseFloat(t.amount);
            if (t.type === 'income') globalBalance += amount;
            else if (t.type === 'expense') globalBalance -= amount;
        });
    }

    // Update Header Stats with Global Balance
    const nwEl = document.getElementById('savings-net-worth'); // Keep ID (Total Balance in HTML)
    if (nwEl) nwEl.innerText = formatCurrency(globalBalance);

    // Also update the header if it exists (usually hidden, but good for consistency)
    const nwHeaderEl = document.getElementById('savings-net-worth-header');
    if (nwHeaderEl) nwHeaderEl.innerText = formatCurrency(globalBalance);

    // 3. Render Liability Liquidation (Debts)
    const debtListEl = document.getElementById('savings-debt-list');
    if (debtListEl) {
        if (!appState.debts || appState.debts.length === 0) {
            debtListEl.innerHTML = `<div class="text-center text-slate-500 py-6 text-xs italic opacity-50">Sin deudas registradas</div>`;
        } else {
            debtListEl.innerHTML = appState.debts.map(d => {
                const remaining = d.total - d.current_paid;
                const pct = Math.min(100, Math.round((d.current_paid / d.total) * 100));
                return `
                 <div onclick="manageDebtItem(${d.id})" class="bg-[#161b22] rounded-2xl p-4 border border-white/5 relative overflow-hidden group cursor-pointer hover:border-red-500/30 transition shadow-lg mb-3">
                     <div class="flex justify-between items-center mb-2 relative z-10">
                         <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 transition-transform group-hover:scale-110 border border-red-500/10">
                                 <i data-lucide="${d.icon || 'credit-card'}" class="w-5 h-5"></i>
                             </div>
                             <div>
                                 <p class="text-white font-bold text-sm group-hover:text-red-400 transition">${d.name}</p>
                                 <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pasivo</p>
                             </div>
                         </div>
                         <div class="text-right">
                             <p class="text-white font-bold font-mono">${formatCurrency(remaining)}</p>
                             <p class="text-[10px] text-slate-500 uppercase tracking-wide">Pendiente</p>
                         </div>
                      </div>
                     <div class="w-full h-1.5 bg-[#0B0D14] rounded-full overflow-hidden mt-1 border border-white/5 relative">
                         <div class="absolute inset-0 bg-white/5"></div>
                         <div class="h-full bg-gradient-to-r from-red-600 to-red-400 w-0 transition-all duration-1000 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] relative" style="width: ${pct}%"></div>
                     </div>
                 </div>
                 `;
            }).join('');
        }
    } else {
        console.warn("DEBUG: 'savings-debt-list' not found.");
    }

    // 4. Render Active Portfolio (LIST STYLE)
    const gridEl = document.getElementById('savings-goals-grid');
    if (gridEl) {
        // Change grid to simple stack
        gridEl.className = 'space-y-3'; // Overriding the grid class from HTML

        let itemsHtml = '';

        if (portfolio.length === 0) {
            itemsHtml = `<div class="col-span-full text-center text-slate-500 py-10 opacity-50 border border-white/5 rounded-2xl p-8 bg-white/5">
                <i data-lucide="layers" class="w-12 h-12 mx-auto mb-4 text-slate-600"></i>
                <p>Portafolio Vacío. Añade un activo para comenzar.</p>
             </div>`;
        } else {
            // Sort: Core first, then custom
            const sorted = portfolio.sort((a, b) => {
                if (a.subtype === 'core' && b.subtype !== 'core') return -1;
                if (a.subtype !== 'core' && b.subtype === 'core') return 1;
                return 0;
            });

            sorted.forEach(item => {
                itemsHtml += createSavingsCard(item);
            });
        }

        // Add Button (Horizontal Style)
        itemsHtml += `
         <button onclick="addPortfolioItemModal()" class="w-full p-4 rounded-2xl bg-[#161b22] border border-white/5 border-dashed hover:bg-[#1a202c] hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 group flex items-center justify-center gap-3 relative overflow-hidden">
            <div class="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 text-slate-500 transition-all group-hover:rotate-90">
                <i data-lucide="plus" class="w-4 h-4"></i>
            </div>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-400 transition-colors relative z-10">Nuevo Activo</span>
         </button>
        `;

        gridEl.innerHTML = itemsHtml;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
        console.warn("DEBUG: 'savings-goals-grid' not found.");
    }
}

function createSavingsCard(item) {
    const themes = {
        emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/30', shadow: 'hover:shadow-emerald-500/20', bar: 'from-emerald-500 to-teal-400', iconBg: 'bg-emerald-500/10' },
        blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/30', shadow: 'hover:shadow-blue-500/20', bar: 'from-blue-500 to-cyan-400', iconBg: 'bg-blue-500/10' },
        indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/30', shadow: 'hover:shadow-indigo-500/20', bar: 'from-indigo-500 to-violet-400', iconBg: 'bg-indigo-500/10' },
        pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/30', shadow: 'hover:shadow-pink-500/20', bar: 'from-pink-500 to-rose-400', iconBg: 'bg-pink-500/10' },
        violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/30', shadow: 'hover:shadow-violet-500/20', bar: 'from-violet-500 to-fuchsia-400', iconBg: 'bg-violet-500/10' },
        amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/30', shadow: 'hover:shadow-amber-500/20', bar: 'from-amber-500 to-orange-400', iconBg: 'bg-amber-500/10' },
        cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'hover:border-cyan-500/50', shadow: 'hover:shadow-cyan-500/20', bar: 'from-cyan-500 to-sky-400', iconBg: 'bg-cyan-500/20' },
    };

    const t = themes[item.theme] || themes.emerald;

    // Progress Logic (Horizontal Bar at bottom)
    let progressHtml = '';
    if (item.target > 0) {
        const pct = Math.min(100, Math.round((item.amount / item.target) * 100));
        progressHtml = `
         <div class="w-full h-1.5 bg-[#0B0D14] rounded-full overflow-hidden mt-2 border border-white/5 relative">
             <div class="absolute inset-0 bg-white/5"></div>
             <div class="h-full bg-gradient-to-r ${t.bar} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000 relative" style="width: ${pct}%">
                 <div class="absolute right-0 top-0 bottom-0 w-0.5 bg-white/50"></div>
             </div>
         </div>
        `;
    } else {
        progressHtml = `
         <div class="w-full h-1.5 bg-[#0B0D14] rounded-full overflow-hidden mt-2 border border-white/5 relative opacity-30">
             <div class="h-full bg-slate-700 w-full"></div>
         </div>
        `;
    }

    return `
        <div onclick="managePortfolioItem('${item.id}')" class="bg-[#161b22] rounded-2xl p-4 border border-white/5 relative overflow-hidden group cursor-pointer ${t.border} transition shadow-lg mb-3">
             <!-- Ambient Glow -->
             <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full ${t.bg} blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>

             <div class="flex justify-between items-center relative z-10">
                 <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full ${t.iconBg} flex items-center justify-center ${t.text} transition-transform group-hover:scale-110 border border-white/5 shadow-inner">
                         <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                     </div>
                     <div>
                         <p class="text-white font-bold text-sm group-hover:text-slate-200 transition">${item.name}</p>
                         <p class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Activo</p>
                     </div>
                 </div>
                 <div class="text-right">
                     <p class="text-white font-bold font-mono text-base">${formatCurrency(item.amount)}</p>
                     <p class="text-[10px] text-slate-500 uppercase tracking-wide">Total</p>
                 </div>
             </div>
             ${progressHtml}
         </div>
    `;
}

// 3. Management Logic (Details Modal & History)
function managePortfolioItem(id) {
    const item = appState.portfolio.find(i => i.id === id);
    if (!item) return;

    const themes = {
        emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
        blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
        indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
        pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
        violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
        amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    };
    const t = themes[item.theme] || themes.emerald;

    // Generate History Rows
    const historyHtml = item.history.slice().reverse().map((h, idx) => {
        const originalIndex = item.history.length - 1 - idx;
        const isPositive = h.type === 'in';
        return `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-[#0B0D14] border border-white/5 hover:border-white/10 transition group/row mb-2">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} flex items-center justify-center">
                    <i data-lucide="${isPositive ? 'arrow-down-left' : 'arrow-up-right'}" class="w-5 h-5"></i>
                </div>
                <div class="text-left">
                    <p class="text-xs font-bold text-white">${h.note}</p>
                    <p class="text-[10px] text-slate-500 font-mono">${new Date(h.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'} font-mono mr-2">
                    ${isPositive ? '+' : '-'}${formatCurrency(h.amount)}
                </span>
                
                <!-- EDIT BTN -->
                <button onclick="editPortfolioHistory('${item.id}', ${originalIndex})" class="opacity-0 group-hover/row:opacity-100 p-2 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-500 transition">
                    <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>

                <!-- DELETE BTN -->
                <button onclick="deletePortfolioHistory('${item.id}', ${originalIndex})" class="opacity-0 group-hover/row:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');

    Swal.fire({
        background: '#0B0D14',
        color: '#fff',
        width: 550,
        showConfirmButton: false,
        padding: '2rem',
        customClass: { popup: 'rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden glass-panel' },
        html: `
            <!-- Header -->
            <div class="flex justify-between items-start mb-8 pl-1">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full ${t.bg} flex items-center justify-center ${t.text} border ${t.border}">
                        <i data-lucide="${item.icon}" class="w-8 h-8"></i>
                    </div>
                    <div class="text-left">
                        <div class="flex items-center gap-2">
                             <h2 class="text-3xl font-black text-white leading-none mb-1">${item.name}</h2>
                             <!-- EDIT BUTTON -->
                             <button onclick="editPortfolioItemDetails('${item.id}');" class="text-slate-600 hover:text-white transition p-1 rounded-full hover:bg-white/10">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                             </button>
                        </div>
                        <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                            ${item.target > 0 ? `Meta: ${formatCurrency(item.target)}` : 'Saldo Actual'}
                        </p>
                        <p class="text-4xl font-black text-white tracking-tighter mt-1">${formatCurrency(item.amount)}</p>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-4 mb-8">
                <button onclick="promptPortfolioTransaction('${item.id}', 'in')" 
                    class="group relative overflow-hidden rounded-[2rem] border border-emerald-500/30 hover:border-emerald-500/60 bg-[#161b22] hover:bg-emerald-500/5 transition-all duration-300 h-24 flex flex-col items-center justify-center">
                    <div class="w-10 h-10 rounded-full border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400">Depositar</span>
                </button>

                <button onclick="promptPortfolioTransaction('${item.id}', 'out')" 
                    class="group relative overflow-hidden rounded-[2rem] border border-red-500/30 hover:border-red-500/60 bg-[#161b22] hover:bg-red-500/5 transition-all duration-300 h-24 flex flex-col items-center justify-center">
                    <div class="w-10 h-10 rounded-full border border-red-500/50 flex items-center justify-center text-red-400 mb-2 group-hover:scale-110 transition-transform">
                        <i data-lucide="minus" class="w-5 h-5"></i>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-red-400">Retirar</span>
                </button>
            </div>

            <!-- History Section -->
            <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h4 class="text-sm font-bold text-white uppercase tracking-wider">Historial</h4>
                <span class="text-[10px] text-slate-500 font-mono">${item.history.length} transacciones</span>
            </div>

            <div class="max-h-[300px] overflow-y-auto pr-1 space-y-2 custom-scrollbar -mr-2 pr-2">
                ${historyHtml.length > 0 ? historyHtml : '<p class="text-center text-slate-600 text-xs italic py-8">Sin movimientos recientes</p>'}
            </div>
            
             ${item.subtype !== 'core' ? `
             <div class="mt-8 pt-4 border-t border-white/5 flex justify-center">
                <button onclick="deletePortfolioItem('${item.id}'); Swal.close()" class="text-xs text-red-500/50 hover:text-red-500 transition flex items-center gap-2 uppercase font-bold tracking-widest">
                    <i data-lucide="trash" class="w-4 h-4"></i> Eliminar Activo
                </button>
             </div>` : ''}
        `,
        didOpen: () => lucide.createIcons()
    });
}

// Helper to save changes (Defined externally to avoid scope issues)
window.savePortfolioEdit = function (id) {
    const item = appState.portfolio.find(i => i.id === id);
    if (!item) return;

    const newName = document.getElementById('swal-edit-name').value;
    const newTarget = parseFloat(document.getElementById('swal-edit-target').value) || 0;
    const newIcon = document.getElementById('swal-edit-icon').value;

    if (newName) item.name = newName;
    item.target = newTarget;
    item.icon = newIcon;
    item.lastUpdated = new Date().toISOString();

    saveData();
    renderSavingsTab();
    managePortfolioItem(id); // Re-open details modal
};

// Helper to cancel changes
window.cancelPortfolioEdit = function (id) {
    managePortfolioItem(id);
};

function editPortfolioItemDetails(id) {
    const item = appState.portfolio.find(i => i.id === id);
    if (!item) return;

    // Available Icons List
    const icons = [
        'wallet', 'piggy-bank', 'landmark', 'credit-card', 'banknote',
        'coins', 'dollar-sign', 'briefcase', 'building', 'home',
        'car', 'plane', 'gift', 'shopping-bag', 'smartphone',
        'monitor', 'cpu', 'gamepad-2', 'palette', 'camera', 'music',
        'book', 'graduation-cap', 'heart', 'stethoscope', 'activity'
    ];

    let iconGridHtml = '<div class="grid grid-cols-6 gap-2 mb-6 max-h-[160px] overflow-y-auto custom-scrollbar p-1">';
    icons.forEach(icon => {
        const isSelected = item.icon === icon ? 'ring-2 ring-emerald-500 bg-white/10' : 'bg-[#0B0D14] hover:bg-white/5 border border-white/5';
        iconGridHtml += `
            <div onclick="selectSwalIcon(this, '${icon}')" class="cursor-pointer rounded-xl p-3 flex items-center justify-center transition-all duration-300 ${isSelected} group icon-option hover:scale-105 hover:border-emerald-500/30" data-icon="${icon}">
                <i data-lucide="${icon}" class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors"></i>
            </div>
        `;
    });
    iconGridHtml += '</div><input type="hidden" id="swal-edit-icon" value="' + (item.icon || 'circle-dashed') + '">';

    // Global helper for selection
    window.selectSwalIcon = function (el, icon) {
        document.querySelectorAll('.icon-option').forEach(d => {
            d.classList.remove('ring-2', 'ring-emerald-500', 'bg-white/10');
            d.classList.add('bg-[#0B0D14]', 'border', 'border-white/5');
        });
        el.classList.remove('bg-[#0B0D14]', 'border', 'border-white/5');
        el.classList.add('ring-2', 'ring-emerald-500', 'bg-white/10');
        document.getElementById('swal-edit-icon').value = icon;
    };

    Swal.fire({
        background: '#161b22',
        color: '#fff',
        showConfirmButton: false,
        width: 500,
        padding: '0',
        customClass: { popup: 'rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden' },
        html: `
            <div class="p-8 pb-0 text-left">
                <h3 class="text-2xl font-black text-white mb-1">Editar Activo</h3>
                <p class="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Personaliza tu portafolio</p>
                
                <label class="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Seleccionar Icono</label>
                ${iconGridHtml}

                <div class="space-y-5">
                    <div class="group">
                        <label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">Nombre del Activo</label>
                        <input id="swal-edit-name" type="text" class="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-bold placeholder-slate-700" value="${item.name}" placeholder="Ej. Ahorros">
                    </div>
                    <div class="group">
                        <label class="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">Meta Financiera (Opcional)</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <input id="swal-edit-target" type="number" class="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 pl-8 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono font-bold placeholder-slate-700" value="${item.target || ''}" placeholder="0.00">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Custom Action Bar -->
            <div class="p-6 mt-4 flex items-center justify-end gap-3 bg-[#0B0D14]/50 border-t border-white/5 backdrop-blur-sm">
                <button onclick="cancelPortfolioEdit('${id}')" class="px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider">
                    Cancelar
                </button>
                <button onclick="savePortfolioEdit('${id}')" class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all uppercase tracking-wider flex items-center gap-2">
                    <i data-lucide="check" class="w-4 h-4"></i> Guardar Cambios
                </button>
            </div>
        `,
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    });
}

function promptPortfolioTransaction(id, type) {
    const isDeposit = type === 'in';
    Swal.fire({
        title: isDeposit ? 'Depositar' : 'Retirar',
        background: '#0B0D14',
        color: '#fff',
        html: `
            <div class="mb-4">
                <label class="block text-left text-xs mb-1 text-slate-400">Monto</label>
                <input id="swal-pf-amount" type="number" class="swal2-input bg-[#161b22] border-white/10 text-white focus:border-${isDeposit ? 'emerald' : 'red'}-500 text-center font-mono text-xl" placeholder="0.00">
            </div>
            <div>
                <label class="block text-left text-xs mb-1 text-slate-400">Nota (Opcional)</label>
                <input id="swal-pf-note" type="text" class="swal2-input bg-[#161b22] border-white/10 text-white placeholder-slate-600 text-sm" placeholder="${isDeposit ? 'Ahorro mensual' : 'Gasto imprevisto'}">
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: isDeposit ? '#10B981' : '#EF4444',
        cancelButtonColor: '#334155',
        confirmButtonText: isDeposit ? 'Confirmar Depósito' : 'Confirmar Retiro',
        width: 400,
        customClass: { popup: 'rounded-[2rem] border border-white/10' },
        preConfirm: () => {
            return {
                amount: document.getElementById('swal-pf-amount').value,
                note: document.getElementById('swal-pf-note').value
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            const amt = parseFloat(result.value.amount);
            if (!amt || amt <= 0) return;

            const item = appState.portfolio.find(i => i.id === id);
            if (item) {
                item.amount += (isDeposit ? amt : -amt);
                item.history.push({
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    amount: amt,
                    type: type, // 'in' or 'out'
                    note: result.value.note || (isDeposit ? 'Depósito' : 'Retiro')
                });
                item.lastUpdated = new Date().toISOString();

                // Sync legacy core
                if (item.subtype === 'core' && appState.balanceAccounts) {
                    appState.balanceAccounts[item.key] = item.amount;
                }

                saveData();
                renderSavingsTab();
                managePortfolioItem(id); // Re-open modal to update
            }
        } else {
            managePortfolioItem(id); // Go back
        }
    });
}

// Function to Edit History Items
function editPortfolioHistory(itemId, historyIndex) {
    const item = appState.portfolio.find(i => i.id === itemId);
    if (!item || !item.history[historyIndex]) return;

    const hist = item.history[historyIndex];

    Swal.fire({
        title: 'Editar Historial',
        background: '#0B0D14',
        color: '#fff',
        html: `
            <div class="mb-4">
                <label class="block text-left text-xs mb-1 text-slate-400">Monto</label>
                <input id="swal-hist-amount" type="number" class="swal2-input bg-[#161b22] border-white/10 text-white focus:border-blue-500 w-full" value="${hist.amount}">
            </div>
            <div>
                <label class="block text-left text-xs mb-1 text-slate-400">Nota</label>
                <input id="swal-hist-note" type="text" class="swal2-input bg-[#161b22] border-white/10 text-white focus:border-blue-500 w-full" value="${hist.note || ''}">
            </div>
            <div class="mt-2 text-xs text-slate-500">
                Tipo: <span class="${hist.type === 'in' ? 'text-emerald-400' : 'text-red-400'} font-bold uppercase">${hist.type === 'in' ? 'Entrada' : 'Salida'}</span>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Guardar',
        customClass: { popup: 'rounded-[2rem] border border-white/10' },
        preConfirm: () => {
            return {
                amount: parseFloat(document.getElementById('swal-hist-amount').value),
                note: document.getElementById('swal-hist-note').value
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            const newAmt = result.value.amount;
            if (!newAmt || newAmt <= 0) return;

            // Revert old amount from total
            if (hist.type === 'in') item.amount -= hist.amount;
            else item.amount += hist.amount;

            // Apply new amount
            if (hist.type === 'in') item.amount += newAmt;
            else item.amount -= newAmt;

            // Update history record
            hist.amount = newAmt;
            hist.note = result.value.note;

            // Sync legacy core if needed
            if (item.subtype === 'core' && appState.balanceAccounts) {
                appState.balanceAccounts[item.key] = item.amount;
            }

            saveData();
            renderSavingsTab();
            managePortfolioItem(itemId); // Refresh modal
        } else {
            managePortfolioItem(itemId); // Go back
        }
    });
}

function deletePortfolioHistory(itemId, historyIndex) {
    const item = appState.portfolio.find(i => i.id === itemId);
    if (!item || !item.history[historyIndex]) return;

    // Confirm deletion
    Swal.fire({
        title: '¿Borrar registro?',
        text: "El saldo se ajustará automáticamente.",
        icon: 'warning',
        background: '#0B0D14',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Sí, borrar',
        customClass: { popup: 'rounded-[2rem]' }
    }).then((result) => {
        if (result.isConfirmed) {
            // Revert balance change
            const h = item.history[historyIndex];
            if (h.type === 'in') item.amount -= h.amount;
            else item.amount += h.amount;

            // Remove entry
            item.history.splice(historyIndex, 1);

            // Sync legacy core
            if (item.subtype === 'core' && appState.balanceAccounts) {
                appState.balanceAccounts[item.key] = item.amount;
            }

            saveData();
            renderSavingsTab();
            managePortfolioItem(itemId); // Refresh modal
        } else {
            managePortfolioItem(itemId); // Go back if cancelled
        }
    });
}

function deletePortfolioItem(id) {
    Swal.fire({
        title: '¿Eliminar Activo?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        background: '#0B0D14',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'Sí, eliminar',
        customClass: { popup: 'rounded-[2rem]' }
    }).then((result) => {
        if (result.isConfirmed) {
            appState.portfolio = appState.portfolio.filter(i => i.id !== id);
            if (window.deleteGranularPortfolioItem) window.deleteGranularPortfolioItem(id);
            saveData();
            renderSavingsTab();
        }
    });
}

// Auto-Refresh if on active tab
document.addEventListener('DOMContentLoaded', () => {
    // Re-attach global functions ensuring they are available
    window.managePortfolioItem = managePortfolioItem;

    if (localStorage.getItem('activeTab') === 'savings') {
        setTimeout(renderSavingsTab, 100);
    }
});
