// Función para actualizar los totales mensuales en el Wallet
function updateMonthlyTotals() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let netBalance = 0;

    // Calcular totales del MES ACTUAL usando dateIso o date
    if (appState.transactions) {
        appState.transactions.forEach(t => {
            const txDate = new Date(t.dateIso || t.id || t.date);
            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                if (t.type === 'income') {
                    monthlyIncome += Math.abs(t.amount);
                } else if (t.type === 'expense') {
                    monthlyExpenses += Math.abs(t.amount);
                }
            }
        });
    }


    // Calcular balance neto desde balance accounts
    if (appState.balanceAccounts) {
        netBalance = (appState.balanceAccounts.pocket || 0) +
            (appState.balanceAccounts.bank || 0) +
            (appState.balanceAccounts.credit || 0) +
            (appState.balanceAccounts.loan || 0);
    }


    // Actualizar elementos del DOM
    const incomeEl = document.getElementById('monthly-income');
    const expensesEl = document.getElementById('monthly-expenses');
    const balanceEl = document.getElementById('w-net-balance');

    if (incomeEl) incomeEl.innerText = '$' + monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (expensesEl) expensesEl.innerText = '$' + monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (balanceEl) balanceEl.innerText = '$' + netBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Actualizar variaciones (vs mes anterior)
    updateMonthlyVariations(monthlyIncome, monthlyExpenses);

}


function updateMonthlyVariations(currentIncome, currentExpenses) {
    const now = new Date();
    const lastMonth = now.getMonth() - 1;
    const lastMonthYear = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const lastMonthIndex = lastMonth < 0 ? 11 : lastMonth;

    let lastMonthIncome = 0;
    let lastMonthExpenses = 0;

    if (appState.transactions) {
        appState.transactions.forEach(t => {
            const txDate = new Date(t.dateIso || t.id);
            if (txDate.getMonth() === lastMonthIndex && txDate.getFullYear() === lastMonthYear) {
                if (t.type === 'income') lastMonthIncome += t.amount;
                else if (t.type === 'expense') lastMonthExpenses += t.amount;
            }
        });
    }

    // Calcular porcentajes
    const incVariation = lastMonthIncome > 0 ? ((currentIncome - lastMonthIncome) / lastMonthIncome * 100) : 0;
    const expVariation = lastMonthExpenses > 0 ? ((currentExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;

    // Actualizar elementos
    const incVarEl = document.getElementById('inc-variation');
    const expVarEl = document.getElementById('exp-variation');

    if (incVarEl) {
        const icon = incVariation >= 0 ? 'trending-up' : 'trending-down';
        const color = incVariation >= 0 ? 'emerald' : 'red';
        incVarEl.className = `text-${color}-400 font-bold text-sm bg-${color}-500/10 px-2 py-0.5 rounded-lg border border-${color}-500/20 flex items-center gap-1`;
        incVarEl.innerHTML = `<i data-lucide="${icon}" class="w-3 h-3"></i> ${Math.abs(incVariation).toFixed(0)}%`;
    }

    if (expVarEl) {
        const icon = expVariation >= 0 ? 'trending-up' : 'trending-down';
        const color = expVariation >= 0 ? 'rose' : 'emerald';
        expVarEl.className = `text-${color}-400 font-bold text-sm bg-${color}-500/10 px-2 py-0.5 rounded-lg border border-${color}-500/20 flex items-center gap-1`;
        expVarEl.innerHTML = `<i data-lucide="${icon}" class="w-3 h-3"></i> ${Math.abs(expVariation).toFixed(0)}%`;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}
