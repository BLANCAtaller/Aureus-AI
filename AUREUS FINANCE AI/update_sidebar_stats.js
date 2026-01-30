/**
 * update_sidebar_stats.js
 * 
 * Updates the Quick Stats cards (Balance, Income, Expenses) in the Dashboard
 * and Sidebar based on real data from appState.transactions.
 */

window.updateSidebarStats = function () {
    console.log("📊 Updating Sidebar/Dashboard Stats...");

    // Retry mechanism to wait for appState
    if ((!window.appState || !window.appState.profile || !window.appState.transactions) && (window.retryCount = (window.retryCount || 0)) < 10) {
        console.warn(`⚠️ AppState not ready. Retrying (${window.retryCount + 1}/10)...`);
        window.retryCount++;
        setTimeout(window.updateSidebarStats, 500);
        return;
    }

    if (!window.appState || !window.appState.transactions) {
        console.error("❌ Failed to load AppState for Stats.");
        return;
    }

    const txns = window.appState.transactions;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // --- 1. TOTAL BALANCE (Unified with Wallet Logic) ---
    let totalBalance = 0;

    // A. Core Accounts (Wallet)
    if (window.appState.balanceAccounts) {
        totalBalance += (window.appState.balanceAccounts.pocket || 0) +
            (window.appState.balanceAccounts.bank || 0) +
            (window.appState.balanceAccounts.credit || 0) +
            (window.appState.balanceAccounts.loan || 0);
    } else if (window.appState.profile && window.appState.profile.balance !== undefined) {
        const rawIB = window.appState.profile.balance;
        totalBalance += typeof rawIB === 'string' ? parseFloat(rawIB.replace(/[^0-9.-]/g, '')) : parseFloat(rawIB);
    }

    // B. Include Non-Core Portfolio Assets
    if (window.appState.portfolio) {
        window.appState.portfolio.forEach(p => {
            if (p.subtype !== 'core') {
                totalBalance += (parseFloat(p.amount) || 0);
            }
        });
    }

    // --- 2. INCOME & EXPENSES (Current Year) ---
    let totalIncomeYTD = 0;
    let totalExpenseYTD = 0;

    let incomeCurrentMonth = 0;
    let expenseCurrentMonth = 0;
    let incomePrevMonth = 0;
    let expensePrevMonth = 0;

    // Previous month logic (handles Jan -> Dec previous year)
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    txns.forEach(t => {
        const amount = parseFloat(t.amount);
        const date = new Date(t.dateIso || t.date);
        const tYear = date.getFullYear();
        const tMonth = date.getMonth();

        // 2. Year to Date (Current Year)
        if (tYear === currentYear) {
            if (t.type === 'income') totalIncomeYTD += amount;
            else if (t.type === 'expense') totalExpenseYTD += amount;

            // Current Monthly Metrics
            if (tMonth === currentMonth) {
                if (t.type === 'income') incomeCurrentMonth += amount;
                else if (t.type === 'expense') expenseCurrentMonth += amount;
            }
        }

        // Previous Monthly Metrics (can span years)
        if (tYear === prevYear && tMonth === prevMonth) {
            if (t.type === 'income') incomePrevMonth += amount;
            else if (t.type === 'expense') expensePrevMonth += amount;
        }
    });

    // --- 3. CALCULATE GROWTH ---
    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const incomeGrowth = calculateGrowth(incomeCurrentMonth, incomePrevMonth);
    const expenseGrowth = calculateGrowth(expenseCurrentMonth, expensePrevMonth);

    // --- 4. FORMATTING ---
    const fmt = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

    // --- 5. UPDATE DOM ---
    const balanceEl = document.getElementById('dash-balance');
    const incomeEl = document.getElementById('dash-income');
    const expenseEl = document.getElementById('dash-expense');
    const sidebarBalance = document.getElementById('sidebar-balance-display');

    if (balanceEl) balanceEl.innerText = fmt(totalBalance);
    if (sidebarBalance) sidebarBalance.innerText = fmt(totalBalance);

    if (incomeEl) {
        incomeEl.innerText = fmt(totalIncomeYTD);
        const container = incomeEl.nextElementSibling;
        if (container) {
            const growthVal = Math.round(incomeGrowth);
            const sign = growthVal >= 0 ? '+' : '';
            const isPositive = growthVal >= 0;
            const colorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';
            container.className = `inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 border-emerald-500/10' : 'bg-rose-500/10 border-rose-500/10'} border`;
            const text = container.querySelector('span');
            if (text) {
                text.className = `text-[9px] font-bold ${colorClass}`;
                text.innerText = `${sign}${growthVal}% VS. MES ANTERIOR`;
            }
            const icon = container.querySelector('svg');
            if (icon) icon.setAttribute('class', `w-3 h-3 ${colorClass}`);
        }
    }

    if (expenseEl) {
        expenseEl.innerText = fmt(totalExpenseYTD);
        const container = expenseEl.nextElementSibling;
        if (container) {
            const growthVal = Math.round(expenseGrowth);
            const sign = growthVal >= 0 ? '+' : '';
            const isBad = growthVal > 0;
            const colorClass = isBad ? 'text-rose-500' : 'text-emerald-500';
            const bgClass = isBad ? 'bg-rose-500/10 border-rose-500/10' : 'bg-emerald-500/10 border-emerald-500/10';
            container.className = `inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${bgClass} border`;
            const text = container.querySelector('span');
            if (text) {
                text.className = `text-[9px] font-bold ${colorClass}`;
                text.innerText = `${sign}${growthVal}% VS. MES ANTERIOR`;
            }
            const icon = container.querySelector('svg');
            if (icon) icon.setAttribute('class', `w-3 h-3 ${colorClass}`);
        }
    }
};

// Auto-run
if (document.readyState === 'complete') window.updateSidebarStats();
else window.addEventListener('load', window.updateSidebarStats);
