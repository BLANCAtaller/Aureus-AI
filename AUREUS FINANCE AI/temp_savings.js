
// --- SAVINGS TAB LOGIC ---

function initSavingsData() {
    if (!appState.customAssets) appState.customAssets = [];
    // Ensure goals have deadlines and created dates if missing
    if (!appState.goals) appState.goals = [];
    appState.goals.forEach(g => {
        if (!g.deadline) g.deadline = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]; // End of year default
    });
}

function renderSavingsTab() {
    initSavingsData();

    // 1. Calculate Net Worth
    let totalAssets = 0;
    // Core Assets
    totalAssets += (appState.balanceAccounts.pocket || 0);
    totalAssets += (appState.balanceAccounts.bank || 0);
    totalAssets += (appState.balanceAccounts.credit || 0); // Credit is usually debt, but here treated as "account"? Wait, credit card debt should be negative or just available credit? In this app context, let's treat it as is or ignore. Usually "Credit" in balance breakdown is "Credit Card Debt" (negative) or "Limit"? 
    // Looking at wallet logic: It seems to be just a bucket. Let's sum pocket, bank, loan (savings). 
    // Actually "Savings" (formerly Loan) is definitely an asset.
    // Credit is debt. I should probably subtract it or ignore it for "Net Worth". 
    // Let's assume Net Worth = Liquid Assets (Pocket + Bank + Savings).
    totalAssets += (appState.balanceAccounts.loan || 0); // 'loan' is now 'ahorro' visually

    // Custom Assets
    appState.customAssets.forEach(a => totalAssets += a.amount);

    // Goals (Assuming they are separate 'jars')
    let totalGoals = 0;
    appState.goals.forEach(g => totalGoals += g.current);

    // Total Net Worth
    const netWorth = totalAssets + totalGoals;

    const elNetWorth = document.getElementById('savings-net-worth');
    if (elNetWorth) elNetWorth.innerText = formatCurrency(netWorth);

    // 2. Render Assets List
    const assetsListEl = document.getElementById('savings-assets-list');
    if (assetsListEl) {
        let html = '';

        // Core Map
        const coreMap = [
            { key: 'pocket', name: 'Efectivo', icon: 'wallet' },
            { key: 'bank', name: 'Banco', icon: 'landmark' },
            { key: 'loan', name: 'Ahorro', icon: 'piggy-bank' }
            // Exclude Credit for Asset List? Or include as liability? 
            // User asked for "Source of savings". Credit is not a source of savings.
        ];

        coreMap.forEach(item => {
            const amt = appState.balanceAccounts[item.key] || 0;
            html += createAssetCard(item.name, amt, item.icon, false);
        });

        // Custom Assets
        appState.customAssets.forEach((a, idx) => {
            html += createAssetCard(a.name, a.amount, a.icon || 'briefcase', true, idx);
        });

        assetsListEl.innerHTML = html;
    }

    // 3. Render Goals Grid
    const goalsGridEl = document.getElementById('savings-goals-grid');
    if (goalsGridEl) {
        goalsGridEl.innerHTML = appState.goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            // Days remaining
            const today = new Date();
            const deadline = new Date(g.deadline || new Date().getFullYear(), 11, 31);
            const diffTime = Math.abs(deadline - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isPassed = deadline < today;

            return `
                    <div class="bg-dark-800 rounded-3xl p-6 border border-white/5 relative group hover:border-white/10 transition-all shadow-xl flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 rounded-2xl ${g.bgClass || 'bg-indigo-500/10'} flex items-center justify-center border border-white/5">
                                    <i data-lucide="${g.icon || 'target'}" class="w-6 h-6 ${g.colorClass || 'text-indigo-400'}"></i>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta</span>
                                    <p class="text-white font-bold">${formatCurrency(g.target)}</p>
                                </div>
                            </div>
                            
                            <h3 class="text-xl font-bold text-white mb-1">${g.name}</h3>
                            <p class="text-xs text-slate-400 font-mono mb-6 flex items-center gap-2">
                                <i data-lucide="clock" class="w-3 h-3"></i>
                                ${isPassed ? 'Finalizado' : diffDays + ' días restantes'}
                            </p>

                            <!-- Progress -->
                            <div class="relative pt-2">
                                <div class="flex justify-between text-xs font-bold mb-1">
                                    <span class="text-white">${pct}%</span>
                                    <span class="text-slate-400">${formatCurrency(g.current)}</span>
                                </div>
                                <div class="h-3 w-full bg-dark-900 rounded-full overflow-hidden border border-white/5">
                                    <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 relative transition-all duration-1000" style="width: ${pct}%">
                                        <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onclick="depositToGoal(${g.id})" class="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm tracking-wide border border-white/5 hover:border-white/20 transition flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:border-indigo-500">
                            <i data-lucide="plus-circle" class="w-4 h-4 text-slate-400 group-hover:text-white transition"></i>
                            Abonar
                        </button>

                        ${pct >= 100 ? `
                        <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div class="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-3xl"></div>
                        </div>` : ''}
                    </div>
                    `;
        }).join('');
    }
    lucide.createIcons();
}

function createAssetCard(name, amount, icon, isCustom, idx) {
    return `
             <div class="flex items-center justify-between p-4 rounded-2xl bg-dark-800 border border-white/5 hover:border-white/10 transition group cursor-default">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center text-slate-400 group-hover:text-white transition shadow-inner">
                        <i data-lucide="${icon}" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">${name}</p>
                        <p class="text-white font-bold text-lg leading-tight tracking-tight">${formatCurrency(amount)}</p>
                    </div>
                </div>
                 ${isCustom ? `
                 <button onclick="deleteCustomAsset(${idx})" class="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                 </button>
                 ` : ''}
             </div>
             `;
}

function addSavingsAsset() {
    Swal.fire({
        title: 'Nuevo Activo',
        html: `
                    <input id="swal-asset-name" class="swal2-input bg-dark-900 text-white" placeholder="Nombre (ej. Caja Fuerte)">
                    <input id="swal-asset-amt" type="number" class="swal2-input bg-dark-900 text-white" placeholder="Monto Actual">
                `,
        background: '#1E293B', color: '#fff',
        confirmButtonText: 'Guardar', confirmButtonColor: '#10B981',
        showCancelButton: true, cancelButtonColor: '#64748b',
        preConfirm: () => {
            return [
                document.getElementById('swal-asset-name').value,
                document.getElementById('swal-asset-amt').value
            ]
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const [name, amt] = result.value;
            if (name && amt) {
                initSavingsData();
                appState.customAssets.push({ name: name, amount: parseFloat(amt), icon: 'archive' });
                saveState();
                renderSavingsTab();
                Swal.fire({ icon: 'success', title: 'Guardado', toast: true, position: 'top', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#fff' });
            }
        }
    });
}

function deleteCustomAsset(idx) {
    Swal.fire({
        title: '¿Eliminar?', icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sí',
        background: '#1E293B', color: '#fff'
    }).then((r) => {
        if (r.isConfirmed) {
            appState.customAssets.splice(idx, 1);
            saveState();
            renderSavingsTab();
        }
    });
}

function addSavingsGoal() {
    Swal.fire({
        title: 'Nueva Meta',
        html: `
                    <input id="swal-goal-name" class="swal2-input bg-dark-900 text-white placeholder-slate-500" placeholder="Nombre (ej. Viaje)">
                    <input id="swal-goal-target" type="number" class="swal2-input bg-dark-900 text-white placeholder-slate-500" placeholder="Meta ($)">
                    <label class="block text-left text-xs text-slate-400 mt-4 px-8">Fecha Límite</label>
                    <input id="swal-goal-date" type="date" class="swal2-input bg-dark-900 text-white mt-1">
                `,
        background: '#1E293B', color: '#fff',
        confirmButtonText: 'Crear Meta', confirmButtonColor: '#6366F1',
        showCancelButton: true, cancelButtonColor: '#64748b',
        preConfirm: () => {
            return [
                document.getElementById('swal-goal-name').value,
                document.getElementById('swal-goal-target').value,
                document.getElementById('swal-goal-date').value
            ]
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const [name, target, date] = result.value;
            if (name && target) {
                initSavingsData();
                const newId = Date.now();
                appState.goals.push({
                    id: newId,
                    name: name,
                    target: parseFloat(target),
                    current: 0,
                    deadline: date,
                    icon: 'flag',
                    bgClass: 'bg-indigo-500/20',
                    colorClass: 'text-indigo-400'
                });
                saveState();
                renderSavingsTab();
                Swal.fire({ icon: 'success', title: 'Meta Creada', toast: true, position: 'top', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#fff' });
            }
        }
    });
}

function depositToGoal(id) {
    const goal = appState.goals.find(g => g.id === id);
    if (!goal) return;

    Swal.fire({
        title: `Abonar a ${goal.name}`,
        input: 'number',
        inputPlaceholder: 'Monto a abonar',
        background: '#1E293B', color: '#fff',
        confirmButtonText: 'Abonar', confirmButtonColor: '#10B981',
        showCancelButton: true, cancelButtonColor: '#64748b'
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            const amount = parseFloat(result.value);
            goal.current += amount;
            saveState();
            renderSavingsTab();

            if (goal.current >= goal.target) {
                fireConfetti();
                Swal.fire({
                    title: '¡Felicidades!',
                    text: 'Has alcanzado tu meta.',
                    icon: 'success',
                    background: '#1E293B', color: '#fff',
                    confirmButtonText: 'Genial'
                });
            } else {
                Swal.fire({ icon: 'success', title: 'Abono Exitoso', toast: true, position: 'top', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#fff' });
            }
        }
    });
}

function fireConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#34D399', '#6366F1', '#F472B6']
        });
    }
}
