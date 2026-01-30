// --- EXISTING DISSECTION CHART (Chart.js) ---
let dissectionChartInstance = null;
window.aureusChartInstances = {};

window.getThemeColors = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        text: isDark ? '#94a3b8' : '#475569',
        textBold: isDark ? '#fff' : '#0f172a',
        grid: isDark ? '#1e293b' : '#e2e8f0',
        border: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        tooltipBg: isDark ? '#0f172a' : '#ffffff',
        tooltipText: isDark ? '#fff' : '#0f172a',
        tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    };
};

function renderDissectionChartJS(labels, data1, data2) {
    LazyLoader.load('chartjs').then(() => {
        _renderDissectionChartJSInternal(labels, data1, data2);
    });
}

function _renderDissectionChartJSInternal(labels, data1, data2) {
    const ctx = document.getElementById('dissectionCanvas');
    if (!ctx) return;
    if (dissectionChartInstance) dissectionChartInstance.destroy();

    const incomeGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    incomeGradient.addColorStop(0, '#00f2ff');
    incomeGradient.addColorStop(1, '#0047ab');

    const expenseGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    expenseGradient.addColorStop(0, '#ff00ff');
    expenseGradient.addColorStop(1, '#800080');

    const months = labels || ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const incomeData = data1 || Array.from({ length: 12 }, () => Math.floor(Math.random() * (5000 - 2000) + 2000));
    const expenseData = data2 || incomeData.map(inc => Math.floor(inc * (Math.random() * (0.9 - 0.4) + 0.4)));

    dissectionChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomeData,
                    backgroundColor: incomeGradient,
                    borderColor: '#00f2ff',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                },
                {
                    label: 'Egresos',
                    data: expenseData,
                    backgroundColor: expenseGradient,
                    borderColor: '#ff00ff',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e) => {
                const points = dissectionChartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                if (points.length) {
                    const randomCount = Math.floor(Math.random() * 10) + 1;
                    if (typeof updateSidebarGoalCount === 'function') {
                        updateSidebarGoalCount(randomCount);
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#0f172a',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += window.formatCurrency ? window.formatCurrency(context.parsed.y) : context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8' }, border: { display: false } },
                y: { display: false }
            }
        }
    });

}

// --- MEGA DASHBOARD RENDERER ---
// --- MEGA DASHBOARD RENDERER ---
function renderMegaDashboard(megaData) {
    if (!megaData) {
        renderNetWorthChart(null, null, null, null);
        renderComparisonChart(null, null, null);
        renderDissectionChartJS(null, null, null);
        renderAIForecastChart(null, null, null);
        return;
    }

    // Get Preferences or Defaults
    const prefs = (megaData && megaData.chartPrefs) || (window.appState && window.appState.chartPreferences) || {};
    const nwRange = prefs.netWorth || 12; // Default 1Y (12 months)
    const compRange = prefs.comparison || '3M'; // Default 3M

    renderNetWorthChart(megaData.months, megaData.netWorth || [], megaData.income || [], megaData.expenses || [], nwRange);
    renderComparisonChart(null, null, null, compRange);
    renderDissectionChartJS(megaData.monthsShort, megaData.income || [], megaData.expenses || []);
    renderAIForecastChart(megaData.months, megaData.history || [], megaData.forecast || []);

    // Sync Button States (Visuals only) if functions exist
    setTimeout(() => {
        try {
            // Net Worth Buttons
            const nwBtns = document.querySelectorAll('.nw-range-btn');
            nwBtns.forEach(b => {
                b.classList.remove('text-white', 'bg-indigo-500');
                b.classList.add('text-slate-500');
                // Check if button matches range
                if ((typeof nwRange === 'number' && b.innerText === (nwRange === 12 ? '1Y' : (nwRange === 6 ? '6M' : (nwRange === 3 ? '3M' : '?')))) ||
                    (typeof nwRange === 'string' && b.innerText === nwRange)) {
                    b.classList.remove('text-slate-500');
                    b.classList.add('text-white', 'bg-indigo-500');
                }
            });

            // Comparison Buttons
            const compBtns = document.querySelectorAll('.comp-range-btn');
            compBtns.forEach(b => {
                b.classList.remove('text-white', 'bg-indigo-500');
                b.classList.add('text-slate-500');
                if (b.innerText === compRange) {
                    b.classList.remove('text-slate-500');
                    b.classList.add('text-white', 'bg-indigo-500');
                }
            });
        } catch (e) { }
    }, 100);
}

// 1. Net Worth (Area)
// 1. Net Worth (Area)
// 1. Net Worth (Area) - Real Data Logic
function renderNetWorthChart(labels, data, incomeData, expenseData, monthsToDisplay = 12) {
    LazyLoader.load('apexcharts').then(() => {
        _renderNetWorthChartInternal(labels, data, incomeData, expenseData, monthsToDisplay);
    });
}

function _renderNetWorthChartInternal(labels, data, incomeData, expenseData, monthsToDisplay) {
    console.log("renderNetWorthChart CALLED - Calculating Real Data");
    const el = document.getElementById('netWorthChart');
    if (!el) return;
    el.innerHTML = '';

    // 1. Determine Current Balance (Anchor)
    // 1. Determine Current Balance (Anchor) - STRICT MATCH WITH WALLET LOGIC
    // This ensures the chart ends at the exact same value as the 'Total Balance' card.
    let currentBalance = 10000; // Default fallback matching renderWalletHistory

    // A. Start with Initial/Profile Balance
    if (window.appState && window.appState.profile && window.appState.profile.balance !== undefined) {
        const rawIB = window.appState.profile.balance;
        currentBalance = typeof rawIB === 'string' ? parseFloat(rawIB.replace(/[^0-9.-]/g, '')) : parseFloat(rawIB);
    }

    // B. Add All Transactions (To get Real-Time Global Balance)
    if (window.appState && window.appState.transactions) {
        window.appState.transactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            if (t.type === 'income') currentBalance += amount;
            else if (t.type === 'expense') currentBalance -= amount;
        });
    }



    // 1.1 Include Private Portfolio Assets (Non-Core) in Starting Balance
    if (window.appState && window.appState.portfolio) {
        window.appState.portfolio.forEach(p => {
            // 'core' assets are already counted in balanceAccounts above
            if (p.subtype !== 'core') {
                currentBalance += (parseFloat(p.amount) || 0);
            }
        });
    }

    // 2. Process Transactions for History (Rewind Strategy)
    // We start from NOW and calculate backwards to get the end-of-month balance for previous months.
    const monthData = new Array(12).fill(0);
    const monthsLabels = [];

    const now = new Date();
    // Generate last 12 months labels
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        // Spanish Short Month
        const m = d.toLocaleString('es-ES', { month: 'short' });
        monthsLabels.push(m.charAt(0).toUpperCase() + m.slice(1));
    }

    // Group Transactions by MonthKey (YYYY-MM)
    const txByMonth = {};
    if (window.appState && window.appState.transactions) {
        window.appState.transactions.forEach(t => {
            const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date || t.id);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${d.getMonth()}`; // e.g., 2025-11

            if (!txByMonth[key]) txByMonth[key] = 0; // Net Change
            if (t.type === 'income') txByMonth[key] += (parseFloat(t.amount) || 0);
            else txByMonth[key] -= (parseFloat(t.amount) || 0);
        });

        // 2.1 Merge Portfolio History (Savings/Goals Actions)
        // This ensures that manual additions to savings/goals are reflected in the Net Worth history
        if (window.appState.portfolio) {
            window.appState.portfolio.forEach(p => {
                if (Array.isArray(p.history)) {
                    p.history.forEach(h => {
                        const d = new Date(h.date);
                        if (isNaN(d.getTime())) return;
                        const key = `${d.getFullYear()}-${d.getMonth()}`;

                        if (!txByMonth[key]) txByMonth[key] = 0;

                        // Determine 'rewind' impact
                        const amt = parseFloat(h.amount) || 0;
                        if (h.type === 'in') txByMonth[key] += amt;
                        else txByMonth[key] -= amt;
                    });
                }
            });
        }
    }

    // 3. Calculate Historical Balances
    // We assume 'currentBalance' is the balance at the END of the current month (now).
    // Loop backwards: Balance(PrevMonth) = Balance(ThisMonth) - NetChange(ThisMonth)

    // 3. Calculate Historical Balances based on Range Type
    // If range is a number (12, 6, 3), use Monthly Logic (Existing)
    // If range is a string ('1M', '2W'), use Daily Logic (New)

    let sData = [];
    let xLabels = [];

    if (typeof monthsToDisplay === 'number') {
        // --- MONTHLY LOGIC (EXISTING) ---
        const calculatedHistory = [];
        let runningBalance = currentBalance;
        const CALC_RANGE = 12;

        for (let i = 0; i < CALC_RANGE; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            calculatedHistory.unshift(runningBalance);
            const netChange = txByMonth[key] || 0;
            runningBalance = runningBalance - netChange;
        }

        // Generate labels if not passed
        const mLabels = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.toLocaleString('es-ES', { month: 'short' });
            mLabels.push(m.charAt(0).toUpperCase() + m.slice(1));
        }

        sData = calculatedHistory.slice(-monthsToDisplay);
        xLabels = mLabels.slice(-monthsToDisplay);

    } else {
        // --- DAILY LOGIC (NEW: 1M / 2W) ---
        // 1. Determine days count
        const daysCount = (monthsToDisplay === '1M') ? 30 : 14;

        // 2. Prepare Transaction Map by Day (YYYY-MM-DD)
        const txByDay = {};
        if (window.appState && window.appState.transactions) {
            window.appState.transactions.forEach(t => {
                const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date || t.id);
                if (isNaN(d.getTime())) return;
                // Standardize to midnight for key
                d.setHours(0, 0, 0, 0);
                const key = d.toISOString().split('T')[0]; // YYYY-MM-DD

                if (!txByDay[key]) txByDay[key] = 0;
                const amt = parseFloat(t.amount) || 0;
                if (t.type === 'income') txByDay[key] += amt;
                else txByDay[key] -= amt;
            });
            // (Optional: Portfolio history logic could be added here too for daily precision)
        }

        // 3. Calculate backwards from today
        let runningDailyBal = currentBalance;
        const dailyHistory = [];
        const dailyLabels = [];

        // Loop 0 .. daysCount-1
        // i=0 is Today.
        for (let i = 0; i < daysCount; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const key = d.toISOString().split('T')[0];

            dailyHistory.unshift(runningDailyBal); // Snapshot end of day i

            // Label
            const dayStr = d.getDate();
            const monthShortNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const monthStr = monthShortNames[d.getMonth()];
            dailyLabels.unshift(`${dayStr} ${monthStr}`);

            // Calc previous day end balance = TodayEnd - TodayNet
            const netChange = txByDay[key] || 0;
            runningDailyBal = runningDailyBal - netChange;
        }
        sData = dailyHistory;
        xLabels = dailyLabels;
    }

    console.log("Calculated Net Worth History:", sData);

    const theme = getThemeColors();

    const options = {
        series: [{ name: 'Patrimonio', data: sData }],
        chart: {
            type: 'area',
            height: '100%',
            fontFamily: 'Instrument Sans, sans-serif',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        colors: ['#6366f1'], // Indigo primary
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0.05,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: '#6366f1', opacity: 0.4 },
                    { offset: 100, color: '#6366f1', opacity: 0.0 }
                ]
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3, colors: ['#818cf8'] },
        markers: {
            size: 0,
            colors: ['#fff'],
            strokeColors: '#6366f1',
            strokeWidth: 2,
            hover: { size: 6 }
        },
        noData: {
            text: 'Cargando datos...',
            align: 'center',
            verticalAlign: 'middle',
            style: { color: theme.text, fontSize: '14px' }
        },
        xaxis: {
            categories: xLabels,
            labels: {
                show: true,
                style: { colors: theme.text, fontSize: '11px', fontFamily: 'Instrument Sans, sans-serif' },
                offsetY: 0
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false }
        },
        yaxis: {
            show: true,
            tickAmount: 5,
            labels: {
                style: { colors: theme.text, fontSize: '10px' },
                formatter: (val) => { return window.formatCurrency ? window.formatCurrency(val) : '$' + Math.round(val).toLocaleString('en-US') }
            }
        },
        grid: {
            show: true,
            borderColor: theme.grid,
            strokeDashArray: 4,
            padding: { left: 20, right: 10, bottom: 40, top: 0 }
        },
        tooltip: {
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            x: { show: false },
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const val = series[seriesIndex][dataPointIndex];

                const monthNames = [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];

                const now = new Date();
                const dataLength = series[0].length;
                const index = dataPointIndex; // 0 is oldest, length-1 is newest (Today)

                // ROBUST LOGIC: Determine if this is Monthly or Daily data based on count
                // Monthly view usually has 12 points (1Y) or 6 (6M), 3 (3M).
                // Daily view has 30 (1M) or 14 (2W).
                const isMonthlyView = dataLength <= 12;

                if (isMonthlyView) {
                    // --- MONTHLY LOGIC ---
                    // Calculate target month index backwards from Now
                    // If index is last (dataLength-1), it is Current Month.
                    // If index is 0, it is (dataLength-1) months ago.

                    const monthsAgo = (dataLength - 1) - index;
                    let targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);

                    displayLabel = monthNames[targetDate.getMonth()] + " " + targetDate.getFullYear();

                } else {
                    // --- DAILY LOGIC ---
                    // Calculate target day backwards from Now
                    // If index is last (dataLength-1), it is Today.
                    // If index is 0, it is (dataLength-1) days ago.

                    const daysAgo = (dataLength - 1) - index;
                    let targetDate = new Date();
                    targetDate.setDate(now.getDate() - daysAgo);

                    displayLabel = `${targetDate.getDate()} de ${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
                }

                const fmtVal = window.formatCurrency ? window.formatCurrency(val) : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

                // Dynamic Tooltip
                const bg = theme.tooltipBg;
                const txt = theme.tooltipText;
                const brd = theme.tooltipBorder;

                return `
                    <div class="px-4 py-3 border rounded-xl shadow-2xl backdrop-blur-md" style="background-color: ${bg}; border-color: ${brd}; color: ${txt}">
                        <div class="text-[10px] font-bold uppercase tracking-wider mb-1 text-center" style="color: ${theme.text}">${displayLabel}</div>
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                            <span class="text-sm font-black tracking-tight" style="color: ${txt}">${fmtVal}</span>
                        </div>
                    </div>
                `;
            }
        }
    };
    try {
        const chart = new ApexCharts(el, options);
        chart.render();
    } catch (e) {
        console.error("ApexCharts Render Error:", e);
    }
}

// 2. Comparison (Line)
// 2. Comparison (Line) - Real Data Logic
// 2. Comparison (Line)
// 2. Comparison (Line) - Real Data Logic
// --- PROJECTION VIEW LOGIC ---
let projectionViewMode = 'future'; // 'past', 'actual', 'budget'
let projectionActiveMonthIdx = 0; // 0, 1, or 2
let projectionGrowthRate = 0.02; // Default 2%

window.setProjectionView = (mode) => {
    projectionViewMode = mode;
    projectionActiveMonthIdx = 0; // Reset to first column on mode change
    renderProjectionsV2();
};

window.setProjectionMonth = (idx) => {
    projectionActiveMonthIdx = idx;
    renderProjectionsV2();
};

window.setProjectionGrowthRate = (val) => {
    projectionGrowthRate = parseFloat(val) / 100;
    document.getElementById('growth-rate-val').innerText = val + '%';
    renderProjectionsV2();
};

// --- HELPER: Get Historical Data ---
const getHistory = (categoryId, monthOffset, isIncome) => {
    if (!window.appState || !window.appState.transactions) return 0;
    const now = new Date();
    // monthOffset = 0 -> This month, 1 -> Last month, etc.
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    const type = isIncome ? 'income' : 'expense';

    return window.appState.transactions
        .filter(t => {
            const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date || t.id);
            if (isNaN(d.getTime())) return false;

            const matchesCategory = (t.categoryId === categoryId || t.category === categoryId);
            const matchesType = t.type === type;
            const matchesDate = d.getMonth() === targetMonth && d.getFullYear() === targetYear;

            return matchesCategory && matchesType && matchesDate;
        })
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
};

const getActual = (catId, isIncome) => getHistory(catId, 0, isIncome);

window.exportProjectionToPDF = () => {
    // 1. Load SweetAlert first for interaction
    LazyLoader.load('sweetalert').then(() => {
        console.log("AUREUS PDF: Starting Deep Export...");

        // Show processing indicator
        Swal.fire({
            title: 'AUREUS ENGINE',
            text: 'Generando Reporte de Inteligencia Financiera...',
            allowOutsideClick: false,
            background: '#0B0D14',
            color: '#fff',
            didOpen: () => {
                Swal.showLoading();
                // 2. Load heavy export libs in background
                LazyLoader.loadAll(['jspdf', 'html2pdf']).then(() => {
                    setTimeout(processExport, 500);
                });
            }
        });
    });


    async function processExport() {
        try {
            // 1. GATHER DATA (DIRECT ACCESS)
            const income = BUDGET_CATEGORIES.filter(c => c.isIncome).map(c => ({
                name: c.name,
                val: getHistory(c.id, 0, true) || currentBudget[c.id] || 0
            })).sort((a, b) => b.val - a.val);

            const expenses = BUDGET_CATEGORIES.filter(c => !c.isIncome && c.id !== 'savings_goal').map(c => ({
                name: c.name,
                val: getHistory(c.id, 0, false) || currentBudget[c.id] || 0
            })).sort((a, b) => b.val - a.val);

            const totalInc = income.reduce((s, x) => s + x.val, 0);
            const totalExp = expenses.reduce((s, x) => s + x.val, 0);
            const net = totalInc - totalExp;

            // 2. CREATE STYLED REPORT CONTENT
            const container = document.createElement('div');
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 800px;
                padding: 40px;
                background: #000;
                color: #fff;
                font-family: 'Inter', sans-serif;
                z-index: -9999;
                visibility: visible;
                opacity: 1;
            `;

            container.innerHTML = `
                <div style="border: 2px solid #D4FF00; padding: 30px; border-radius: 20px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
                        <div>
                            <h1 style="margin:0; font-size: 28px; letter-spacing: -1px;">AUREUS <span style="color:#D4FF00">FINANCE</span></h1>
                            <p style="margin:0; font-size: 10px; color:#666; letter-spacing: 2px;">STRATEGIC DISCLOSURE | ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div style="text-align: right">
                            <h2 style="margin:0; color:#D4FF00; font-size: 24px;">${window.formatCurrency(net)}</h2>
                            <p style="margin:0; font-size: 10px; color:#666">NET MARGIN</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                        <div style="background: #111; padding: 20px; border-radius: 12px;">
                            <h3 style="color:#34D399; font-size: 12px; margin-bottom: 15px;">INGRESOS</h3>
                            ${income.slice(0, 8).map(i => `
                                <div style="display:flex; justify-content:space-between; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #222; padding-bottom: 4px;">
                                    <span style="color:#888">${i.name}</span>
                                    <span style="font-weight:bold">${window.formatCurrency(i.val)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="background: #111; padding: 20px; border-radius: 12px;">
                            <h3 style="color:#FB7185; font-size: 12px; margin-bottom: 15px;">GASTOS DESTACADOS</h3>
                            ${expenses.slice(0, 8).map(e => `
                                <div style="display:flex; justify-content:space-between; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #222; padding-bottom: 4px;">
                                    <span style="color:#888">${e.name}</span>
                                    <span style="font-weight:bold">${window.formatCurrency(e.val)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 50px; border-top: 1px solid #333; pt: 20px;">
                        <p style="font-size: 9px; color: #444; letter-spacing: 5px;">AUREUS AI GENERATED REPORT • NO SIGNATURE REQUIRED</p>
                    </div>
                </div>
            `;

            document.body.appendChild(container);

            // 3. CAPTURE & SAVE
            const opt = {
                margin: 0,
                filename: `Aureus_Report_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#000000',
                    allowTaint: true,
                    logging: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Delay for font rendering
            await new Promise(r => setTimeout(r, 1500));

            await html2pdf().set(opt).from(container).save();

            // 4. CLEANUP
            document.body.removeChild(container);
            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'REPORTE LISTO',
                background: '#0B0D14',
                color: '#fff',
                timer: 2000
            });

        } catch (e) {
            console.error("PDF ERROR:", e);
            Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: 'Error generando PDF: ' + e.message,
                background: '#0B0D14',
                color: '#fff'
            });
        }
    }
};

// Redundant initialization removed - consolidated at bottom

function renderComparisonChart(labels, dataInc, dataExp, range = '3M') {
    LazyLoader.load('apexcharts').then(() => {
        _renderComparisonChartInternal(labels, dataInc, dataExp, range);
    });
}

function _renderComparisonChartInternal(labels, dataInc, dataExp, range) {
    const el = document.getElementById('comparisonChart');
    if (!el) return;
    el.innerHTML = '';

    let xLabels = labels;
    let dInc = dataInc;
    let dExp = dataExp;

    // Calculate Data if missing or if range switching (implied by null args from buttons)
    if (!dInc || !dExp) {
        console.log(`renderComparisonChart: Calculating Real Data for range ${range}...`);
        xLabels = [];
        dInc = [];
        dExp = [];

        const now = new Date();
        const txs = window.appState && window.appState.transactions ? window.appState.transactions : [];

        if (range === '3M' || range === '6M' || range === '1Y') {
            // Monthly Aggregation
            let monthsToCalc = 3;
            if (range === '6M') monthsToCalc = 6;
            if (range === '1Y') monthsToCalc = 12;

            for (let i = monthsToCalc - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                // Label (Short for Axis)
                const m = d.toLocaleString('es-ES', { month: 'short' });
                xLabels.push(m.charAt(0).toUpperCase() + m.slice(1));

                // Data
                let inc = 0, exp = 0;
                txs.forEach(t => {
                    const td = t.dateIso ? new Date(t.dateIso) : new Date(t.date || t.id);
                    if (td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()) {
                        if (t.type === 'income') inc += Math.abs(t.amount || 0);
                        if (t.type === 'expense') exp += Math.abs(t.amount || 0);
                    }
                });
                dInc.push(inc);
                dExp.push(exp);
            }
        } else {
            // Daily Aggregation (1M = 30 days, 2W = 14 days)
            const daysByIdx = (range === '1M') ? 30 : 14;

            for (let i = daysByIdx - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0); // normalize

                const dayStr = d.getDate();
                const monthShortNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                const monthStr = monthShortNames[d.getMonth()];
                xLabels.push(`${dayStr} ${monthStr}`);

                let inc = 0, exp = 0;
                txs.forEach(t => {
                    const td = t.dateIso ? new Date(t.dateIso) : new Date(t.date || t.id);
                    td.setHours(0, 0, 0, 0);
                    if (td.getTime() === d.getTime()) {
                        if (t.type === 'income') inc += Math.abs(t.amount || 0);
                        if (t.type === 'expense') exp += Math.abs(t.amount || 0);
                    }
                });
                dInc.push(inc);
                dExp.push(exp);
            }
        }
    }

    // Determine Y-Axis Range to avoid "flat line" look if data is 0
    // If all data is 0, set a confusing range? No, ApexCharts handles 0 fine.
    // The issue with the "drop" was likely the dummy data shape.

    const theme = getThemeColors();

    const options = {
        series: [
            { name: 'Ingresos', data: dInc },
            { name: 'Gastos', data: dExp }
        ],
        chart: {
            type: 'area',
            height: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        markers: { size: 0, hover: { size: 5 } },
        noData: {
            text: 'Sin actividad...',
            style: { color: theme.text, fontSize: '12px' }
        },
        colors: ['#10b981', '#f43f5e'],
        stroke: { width: [2, 2], curve: 'monotoneCubic' },
        dataLabels: { enabled: false },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.25,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        xaxis: {
            categories: xLabels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { show: false },
            tooltip: { enabled: false }
        },
        yaxis: { show: false },
        grid: {
            show: true,
            borderColor: theme.border,
            strokeDashArray: 3,
            padding: { top: 10, bottom: 0, left: 10, right: 10 }
        },
        legend: { show: false },
        tooltip: {
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            y: {
                formatter: function (val) {
                    return window.formatCurrency ? window.formatCurrency(val) : val;
                }
            }
        },
        theme: {
            mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        }
    };

    new ApexCharts(el, options).render();
}

// 4. AI Forecast Chart (Restored)
function renderAIForecastChart(labels, historyData, forecastData) {
    LazyLoader.load('apexcharts').then(() => {
        _renderAIForecastChartInternal(labels, historyData, forecastData);
    });
}

function _renderAIForecastChartInternal(labels, historyData, forecastData) {
    const el = document.getElementById('aiForecastChart');
    if (!el) return;
    el.innerHTML = '';

    // Default dummy data if null
    const cats = labels || ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const hData = historyData || [2100, 2300, 2050, 2400, 2200, 2500];

    // Make forecast data strictly consecutive
    // If history length is 6, forecast starts at 5 (overlap)
    let fData = [];
    if (!forecastData) {
        fData = [null, null, null, null, null, 2500, 2700, 2900, 2800, 3100, 3300];
    } else {
        fData = forecastData;
    }

    const theme = getThemeColors();

    const options = {
        series: [
            { name: 'Histórico', data: hData },
            { name: 'Proyección IA', data: fData }
        ],
        chart: { type: 'area', height: '100%', toolbar: { show: false }, background: 'transparent' },
        colors: ['#94a3b8', '#8b5cf6'], // Slate & Violet
        fill: {
            type: ['solid', 'gradient'],
            gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
        },
        stroke: { width: [2, 3], dashArray: [0, 5], curve: 'smooth' },
        dataLabels: { enabled: false },
        xaxis: {
            categories: cats,
            axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: theme.text } }
        },
        yaxis: { show: false },
        grid: { show: false, padding: { bottom: 35, left: 10, right: 10 } },
        tooltip: { theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' },
        legend: { position: 'top', horizontalAlign: 'right', labels: { colors: theme.text } }
    };
    new ApexCharts(el, options).render();
}

function renderChart(selector, options) {
    LazyLoader.load('apexcharts').then(() => {
        const el = document.querySelector(selector);
        if (el) {
            el.innerHTML = '';
            new ApexCharts(el, options).render();
        }
    });
}

function generateData(count, { min, max }) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
// --- 5. DYNAMIC BUDGET SYSTEM ---

// Default Categories & Icons
const BUDGET_CATEGORIES = [
    // --- INGRESOS (Income) ---
    { id: 'Salary', name: 'Salario', icon: 'banknote', color: 'text-emerald-400', isIncome: true, default: 11000 },
    { id: 'Freelance', name: 'Freelance', icon: 'laptop', color: 'text-sky-400', isIncome: true, default: 0 },
    { id: 'Investments', name: 'Inversiones', icon: 'trending-up', color: 'text-indigo-400', isIncome: true, default: 0 },
    { id: 'Gift', name: 'Regalo', icon: 'gift', color: 'text-pink-400', isIncome: true, default: 0 },
    { id: 'Bonus', name: 'Bono', icon: 'medal', color: 'text-yellow-400', isIncome: true, default: 0 },
    { id: 'Refund', name: 'Reembolso', icon: 'receipt', color: 'text-teal-400', isIncome: true, default: 0 },
    { id: 'Passive Income', name: 'Pasivos', icon: 'refresh-cw', color: 'text-blue-400', isIncome: true, default: 0 },
    { id: 'Other', name: 'Otros Ingresos', icon: 'plus-circle', color: 'text-slate-400', isIncome: true, default: 0 },

    // --- GASTOS (Expenses) ---
    { id: 'Food', name: 'Comida', icon: 'utensils', color: 'text-orange-400', default: 400 },
    { id: 'Groceries', name: 'Súper', icon: 'shopping-cart', color: 'text-emerald-400', default: 600 },
    { id: 'Home', name: 'Casa', icon: 'home', color: 'text-indigo-400', default: 1200 },
    { id: 'Transport', name: 'Transp.', icon: 'bus', color: 'text-cyan-400', default: 300 },
    { id: 'Ent', name: 'Ocio', icon: 'clapperboard', color: 'text-purple-400', default: 400 },
    { id: 'Shop', name: 'Compras', icon: 'shopping-bag', color: 'text-pink-400', default: 500 },
    { id: 'Health', name: 'Salud', icon: 'heart', color: 'text-red-400', default: 200 },
    { id: 'Util', name: 'Servicios', icon: 'wifi', color: 'text-blue-400', default: 250 },
    { id: 'Edu', name: 'Educación', icon: 'graduation-cap', color: 'text-sky-400', default: 300 },
    { id: 'Travel', name: 'Viajes', icon: 'plane', color: 'text-teal-400', default: 500 },
    { id: 'Beer', name: 'Alcohol', icon: 'glass-water', color: 'text-yellow-500', default: 150 },
    { id: 'Junk Food', name: 'Chatarra', icon: 'pizza', color: 'text-red-500', default: 100 },
    { id: 'Organic', name: 'Organic', icon: 'leaf', color: 'text-green-400', default: 100 },
    { id: 'Love', name: 'Pareja', icon: 'heart', color: 'text-rose-400', default: 200 },
    { id: 'Gas', name: 'Gasolina', icon: 'fuel', color: 'text-amber-400', default: 800 },
    { id: 'Other', name: 'Otros Gastos', icon: 'more-horizontal', color: 'text-slate-400', default: 5000 },

    // --- PATRIMONIO / AHORRO ---
    { id: 'savings_goal', name: 'Ahorro Meta', icon: 'target', color: 'text-indigo-300', default: 2500 }
];

// State Manager
let currentBudget = {};

// 5.3 Render New Analytics Charts (Dashboard Expansion)
function renderAnalyticsCharts() {
    // A. Budget Distribution (Donut)
    // Simulated Data: 50% Fixed, 30% Operating, 20% Savings
    if (document.querySelector("#chart-budget-dist")) {
        // Dynamic Calculation
        let fixedSum = (currentBudget['Home'] || 0) + (currentBudget['Util'] || 0);
        let savingsSum = currentBudget['savings_goal'] || 0;

        let totalExpenseSum = 0;
        BUDGET_CATEGORIES.forEach(c => {
            if (!c.isIncome) totalExpenseSum += (currentBudget[c.id] || 0);
        });

        let operatingSum = totalExpenseSum - fixedSum - savingsSum;

        window.aureusChartInstances['budgetDist'] = new ApexCharts(document.querySelector("#chart-budget-dist"), {
            series: [fixedSum, operatingSum, savingsSum],
            labels: ['Fijos', 'Operativos', 'Ahorro'],
            chart: {
                type: 'donut',
                height: 240,
                fontFamily: 'Outfit, sans-serif',
                background: 'transparent'
            },
            colors: ['#6366f1', '#10b981', '#f59e0b'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            name: { color: '#94a3b8' },
                            value: {
                                color: '#ffffff',
                                fontWeight: 700,
                                formatter: function (val) { return "$" + val.toLocaleString() }
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#94a3b8',
                                formatter: function (w) {
                                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    return "$" + (total / 1000).toFixed(1) + "k"
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: { enabled: false },
            legend: {
                position: 'bottom',
                labels: { colors: '#94a3b8' },
                markers: { radius: 12 }
            },
            stroke: { show: false }
        });
        window.aureusChartInstances['budgetDist'].render();
    }

    // B. Performance vs Target (Bar)
    if (document.querySelector("#chart-performance")) {
        window.aureusChartInstances['performance'] = new ApexCharts(document.querySelector("#chart-performance"), {
            series: [{
                name: 'Real',
                data: [4200, 5100, 3800, 4900, 5200, 6100]
            }, {
                name: 'Meta',
                data: [4000, 4800, 4000, 4800, 5000, 6000]
            }],
            chart: {
                type: 'bar',
                height: 250,
                toolbar: { show: false },
                background: 'transparent',
                fontFamily: 'Outfit, sans-serif'
            },
            colors: ['#10b981', '#334155'],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4
                },
            },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: ['transparent'] },
            xaxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                labels: { style: { colors: '#64748b' } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: { style: { colors: '#64748b' }, formatter: (value) => { return "$" + (value / 1000) + "k" } }
            },
            fill: { opacity: 1 },
            tooltip: {
                theme: 'dark',
                y: { formatter: function (val) { return "$ " + val } }
            },
            legend: { labels: { colors: '#94a3b8' } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' }
        });
        window.aureusChartInstances['performance'].render();
    }
}

// Initialize or Load Budget
window.initBudget = function () {
    // Priority 1: Global appState (Source of Truth)
    if (window.appState && window.appState.budget) {
        if (typeof window.appState.budget === 'object') {
            currentBudget = { ...window.appState.budget };
        }
    }
    // Priority 2: Local storage fallback
    else {
        const saved = localStorage.getItem('aureus_budget_v1');
        if (saved) {
            currentBudget = JSON.parse(saved);
        }
    }

    // Ensure defaults for any missing categories
    BUDGET_CATEGORIES.forEach(c => {
        if (currentBudget[c.id] === undefined) {
            currentBudget[c.id] = c.default;
        }
    });

    renderProjectionsV2();
    renderTrendSparklines();
}

// 5.2 Render Trend Sparklines (Option B)
function renderTrendSparklines() {
    const commonOptions = {
        chart: {
            type: 'area',
            height: 50,
            sparkline: { enabled: true },
            animations: { enabled: true }
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: { opacity: 0.3 },
        tooltip: {
            theme: 'dark',
            fixed: { enabled: false },
            x: { show: false },
            y: { title: { formatter: () => '' } },
            marker: { show: false }
        }
    };

    // Simulated 6-Month Data
    const incomes = [12500, 13200, 11800, 14500, 13900, 14250];
    const expenses = [9200, 9800, 8500, 10200, 9500, 9840];
    const margins = incomes.map((inc, i) => inc - expenses[i]);

    // 1. Income Sparkline
    if (document.querySelector("#spark1")) {
        new ApexCharts(document.querySelector("#spark1"), {
            ...commonOptions,
            series: [{ data: incomes }],
            colors: ['#10B981'], // Emerald
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
            }
        }).render();
    }

    // 2. Expense Sparkline
    if (document.querySelector("#spark2")) {
        new ApexCharts(document.querySelector("#spark2"), {
            ...commonOptions,
            series: [{ data: expenses }],
            colors: ['#6366f1'], // Indigo
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
            }
        }).render();
    }

    // 3. Margin Sparkline
    if (document.querySelector("#spark3")) {
        new ApexCharts(document.querySelector("#spark3"), {
            ...commonOptions,
            series: [{ data: margins }],
            colors: ['#EAB308'], // Yellow
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
            }
        }).render();
    }
}

// 5.1 Render Table (The "Financial Table" Request) - REDESIGNED
function renderProjectionsV2() {
    const container = document.getElementById('projections-table-container');
    if (!container) return;

    // Using global getActual and getHistory helpers

    const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');

    let totalDisplayIncome = 0;
    let totalDisplayExpense = 0;
    let totalBudgetIncome = 0;
    let totalBudgetExpense = 0;
    let totalRealIncome = 0;
    let totalRealExpense = 0;

    // Calculate All Totals once
    BUDGET_CATEGORIES.forEach(cat => {
        const budgetVal = currentBudget[cat.id] || 0;
        const actualVal = getActual(cat.id, cat.isIncome);
        let val = 0;

        // 1. Accumulate Global Trackers
        if (cat.isIncome) {
            totalBudgetIncome += budgetVal;
            totalRealIncome += actualVal;
        } else if (cat.id !== 'savings_goal') {
            totalBudgetExpense += budgetVal;
            totalRealExpense += actualVal;
        }

        // 2. Calculate values for the currently selected display column
        if (projectionViewMode === 'budget') {
            if (projectionActiveMonthIdx === 0) val = budgetVal;
            else if (projectionActiveMonthIdx === 1) val = actualVal;
            else if (projectionActiveMonthIdx === 2) val = actualVal - budgetVal;
            else val = budgetVal;
        } else {
            // Past / Future Logic
            const m0 = getHistory(cat.id, projectionViewMode === 'past' ? 2 : 0, cat.isIncome);
            const h1 = getHistory(cat.id, 1, cat.isIncome);
            const baseline = Math.max(m0, h1, budgetVal);

            const m1_val = m0;
            const m2_val = projectionViewMode === 'past' ? getHistory(cat.id, 1, cat.isIncome) : baseline * (1 + projectionGrowthRate);
            const m3_val = projectionViewMode === 'past' ? getHistory(cat.id, 0, cat.isIncome) : baseline * Math.pow(1 + projectionGrowthRate, 2);

            if (projectionActiveMonthIdx === 0) val = m1_val;
            else if (projectionActiveMonthIdx === 1) val = m2_val;
            else if (projectionActiveMonthIdx === 2) val = m3_val;
            else val = m1_val + m2_val + m3_val;
        }

        if (cat.isIncome) {
            totalDisplayIncome += val;
        } else if (cat.id !== 'savings_goal') {
            totalDisplayExpense += val;
        }
    });

    const marginActual = totalDisplayIncome - totalDisplayExpense;

    // UI Helpers for Summary Card
    const isBudgetDifMode = (projectionViewMode === 'budget' && projectionActiveMonthIdx === 2);

    // --- HTML GENERATION ---
    // Dynamic Date Calculation
    // Dynamic Date Calculation
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonthIdx = new Date().getMonth();

    // Future Months (for Actual/Budget)
    const nextMonths = [
        monthNames[currentMonthIdx % 12],
        monthNames[(currentMonthIdx + 1) % 12],
        monthNames[(currentMonthIdx + 2) % 12]
    ];

    // Past Months (for Pasado)
    // Javascript modulus with negative numbers can be tricky, so add 12 before modding
    const prevMonths = [
        monthNames[(currentMonthIdx - 2 + 12) % 12],
        monthNames[(currentMonthIdx - 1 + 12) % 12],
        monthNames[currentMonthIdx % 12]
    ];

    const budgetMonths = ['Presp.', 'Real', 'Dif.'];
    const headerLabels = (projectionViewMode === 'budget') ? budgetMonths : ((projectionViewMode === 'past') ? prevMonths : nextMonths);

    // Two-Column Layout (Desktop)
    let html = `
    <div id="projections-container" class="glass-panel rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative">
        <!-- Background Ambient Glow -->
        <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <!-- Header & Tabs (Design V2) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 pt-8 pb-6 border-b border-white/5 bg-white/[0.01] relative z-10">
            <div>
                <h3 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <i data-lucide="table-2" class="w-5 h-5"></i>
                    </span>
                    Proyecciones Financieras
                </h3>
                <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 pl-14 flex items-center gap-2">
                    Vista Detallada & Análisis 
                    <span class="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] border border-indigo-500/20">V2.0</span>
                    ${projectionViewMode === 'future' ? `
                    <span class="flex items-center gap-2 ml-4 px-3 py-1 bg-sky-500/5 rounded-full border border-sky-400/20 group/info cursor-help shadow-inner transition-all hover:bg-sky-500/10">
                        <i data-lucide="info" class="w-3 h-3 text-sky-400"></i>
                        <span class="text-[9px] text-sky-400/80 font-medium">Lógica: Máx(Actual, Historial, Presupuesto) + Crecimiento Estimado</span>
                    </span>
                    ` : ''}
                </p>
            </div>

            <!-- Controls: Tabs + Actions -->
            <div class="flex items-center gap-3">
                <button onclick="window.exportProjectionsToExcel()" class="group relative px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center gap-2 shadow-lg shadow-black/20">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4 transition-transform group-hover:scale-110"></i>
                    <span class="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Excel</span>
                </button>
                <div class="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

                <!-- Tabs -->
                <div class="flex items-center gap-1 bg-[#0B0D14]/80 p-1 rounded-xl border border-white/10 shadow-inner">
                    <button class="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${projectionViewMode === 'past' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:text-white hover:bg-white/5'}" onclick="window.setProjectionView('past')">Pasado</button>
                    <button class="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${projectionViewMode === 'future' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-white hover:bg-white/5'}" onclick="window.setProjectionView('future')">Proyección</button>
                    <button class="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${projectionViewMode === 'budget' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'text-slate-500 hover:text-white hover:bg-white/5'}" onclick="window.setProjectionView('budget')">Presupuesto</button>
                </div>
            </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-12 relative z-10">
            
            <!-- LEFT COLUMN: TABLE (Span 8) -->
            <div class="xl:col-span-8 border-r border-white/5 bg-black/20 p-6 min-h-[500px]">
                
                 <!-- Table Header -->
                 <div class="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 rounded-xl mb-4 border border-white/5 relative overflow-hidden">
                     <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50"></div>
                     <div class="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</div>
                     
                     ${projectionViewMode === 'budget' ? `
                        <div class="col-span-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Presp.</div>
                        <div class="col-span-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Real</div>
                        <div class="col-span-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">Dif.</div>
                     ` : `
                        <div class="col-span-2 text-center flex flex-col gap-0.5 cursor-pointer hover:bg-white/5 rounded-lg transition-all ${projectionActiveMonthIdx === 0 ? 'bg-indigo-500/10 scale-105 border border-indigo-500/20' : ''}" onclick="window.setProjectionMonth(0)">
                            <span class="text-[8px] font-black tracking-widest ${projectionViewMode === 'future' ? 'text-emerald-500/80' : 'text-slate-600'}">${projectionViewMode === 'future' ? 'REAL' : ''}</span>
                            <span class="text-[10px] font-black uppercase tracking-wider ${projectionActiveMonthIdx === 0 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}">${headerLabels[0]}</span>
                        </div>
                        <div class="col-span-2 text-center flex flex-col gap-0.5 cursor-pointer hover:bg-white/5 rounded-lg transition-all ${projectionActiveMonthIdx === 1 ? 'bg-indigo-500/10 scale-105 border border-indigo-500/20' : ''}" onclick="window.setProjectionMonth(1)">
                            <span class="text-[8px] font-black tracking-widest ${projectionViewMode === 'future' ? 'text-sky-400/80' : 'text-slate-600'}">${projectionViewMode === 'future' ? 'PROYECCIÓN' : ''}</span>
                            <span class="text-[10px] font-black uppercase tracking-wider ${projectionActiveMonthIdx === 1 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}">${headerLabels[1]}</span>
                        </div>
                            <div class="col-span-2 text-center flex flex-col gap-0.5 cursor-pointer hover:bg-white/5 rounded-lg transition-all ${projectionActiveMonthIdx === 2 ? 'bg-indigo-500/10 scale-105 border border-indigo-500/20' : ''}" onclick="window.setProjectionMonth(2)">
                                <span class="text-[8px] font-black tracking-widest ${projectionViewMode === 'future' ? 'text-sky-400/80' : 'text-slate-600'}">${projectionViewMode === 'future' ? 'PROYECCIÓN' : ''}</span>
                                <span class="text-[10px] font-black uppercase tracking-wider ${projectionActiveMonthIdx === 2 ? 'text-indigo-400 font-extrabold' : 'text-slate-500'}">${headerLabels[2]}</span>
                            </div>
                            <div class="col-span-2 text-center flex flex-col gap-0.5 cursor-pointer hover:bg-white/5 rounded-lg transition-all ${projectionActiveMonthIdx === 3 ? 'bg-indigo-500/10 scale-105 border border-indigo-500/20' : ''}" onclick="window.setProjectionMonth(3)">
                                <span class="text-[8px] font-black tracking-widest text-slate-600">${projectionViewMode === 'future' ? 'ACUMULADO' : ''}</span>
                                <span class="text-[10px] font-black uppercase tracking-wider ${projectionActiveMonthIdx === 3 ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}">Total</span>
                            </div>
                     `}
                 </div>

                 <!-- Scrollable Rows -->
                 <div class="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                     ${generateTableRows()}
                 </div>

            </div>

            <!-- RIGHT COLUMN: CHARTS & SUMMARY (Span 4) -->
            <div class="xl:col-span-4 p-6 flex flex-col gap-4 bg-[#0f1115]/50">
                
                <!-- Summary Card -->
                <div class="rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                    <div class="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition"><i data-lucide="wallet" class="w-12 h-12 text-indigo-400"></i></div>
                    <p class="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2 text-center">
                        ${projectionViewMode === 'budget'
            ? (projectionActiveMonthIdx === 0 ? 'Presp. Total Gastos' : (projectionActiveMonthIdx === 1 ? 'Total Gastos Reales' : 'Diferencia (Ahorro)'))
            : `Margen Neto Estimado - ${headerLabels[projectionActiveMonthIdx] || ''}`}
                    </p>
                    <h2 class="text-4xl font-black text-white tracking-tighter drop-shadow-lg text-center mb-4">
                        ${projectionViewMode === 'budget'
            ? (projectionActiveMonthIdx === 0 ? fmt(totalBudgetExpense) : (projectionActiveMonthIdx === 1 ? fmt(totalRealExpense) : fmt(totalBudgetExpense - totalRealExpense)))
            : fmt(marginActual)}
                    </h2>
                    
                    <!-- Breakdown & Progress -->
                    <div class="space-y-3 relative z-10">
                        <div class="flex justify-between items-end border-t border-white/5 pt-3">
                            <div>
                                <p class="text-[8px] uppercase font-black ${projectionViewMode === 'budget' ? 'text-indigo-400' : 'text-emerald-400'}/80 mb-0.5 tracking-widest">${projectionViewMode === 'budget' ? 'Presp. Gastos' : 'Ingresos'}</p>
                                <p class="text-xs font-black text-white">${projectionViewMode === 'budget' ? fmt(totalBudgetExpense) : fmt(totalDisplayIncome)}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[8px] uppercase font-black ${projectionViewMode === 'budget' ? 'text-rose-400' : 'text-rose-400'}/80 mb-0.5 tracking-widest">${projectionViewMode === 'budget' ? 'Gastos Reales' : 'Gastos'}</p>
                                <p class="text-xs font-black text-white">${projectionViewMode === 'budget' ? fmt(totalRealExpense) : fmt(totalDisplayExpense)}</p>
                            </div>
                        </div>

                        <div class="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                 style="width: ${projectionViewMode === 'budget'
            ? (totalBudgetExpense > 0 ? Math.min(100, (totalRealExpense / totalBudgetExpense) * 100) : 0)
            : (totalDisplayIncome > 0 ? Math.max(0, Math.min(100, (marginActual / totalDisplayIncome) * 100)) : 0)}%"></div>
                        </div>
                    </div>

                    <!-- Month Toggle (Unified Control) -->
                    <div class="mt-5 flex items-center justify-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner relative z-10">
                        ${headerLabels.map((label, i) => `
                            <button onclick="window.setProjectionMonth(${i})" 
                                class="flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${projectionActiveMonthIdx === i ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}">
                                ${label}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Projection Slider (Only in Future Mode) -->
                    ${projectionViewMode === 'future' ? `
                        <div class="mt-3 bg-white/5 rounded-lg p-2 border border-white/10">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-[9px] text-indigo-300 font-bold uppercase">Crecimiento Est.</label>
                                <span id="growth-rate-val" class="text-[9px] font-black text-white bg-indigo-500/20 px-1.5 rounded">${Math.round(projectionGrowthRate * 100)}%</span>
                            </div>
                            <input type="range" min="-20" max="20" step="1" value="${Math.round(projectionGrowthRate * 100)}" 
                                oninput="window.setProjectionGrowthRate(this.value)"
                                class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500">
                        </div>
                    ` : ''}
                </div>

                ${projectionViewMode !== 'budget' ? `
                <!-- Income Chart -->
                <div class="bg-white/[0.02] rounded-2xl border border-white/5 p-4 flex flex-col relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                        <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        
                        <div class="flex items-center justify-between mb-2 relative z-10 px-2 text-center">
                             <div class="flex items-center gap-2 mx-auto">
                                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuentes de Ingreso</h4>
                                <span class="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">V2</span>
                             </div>
                        </div>

                        <div class="flex items-center gap-4 relative z-10">
                            <!-- Chart -->
                            <div class="relative w-[140px] h-[140px] flex-shrink-0">
                                <div id="proj-income-chart" class="w-full h-full"></div>
                                <!-- Center Label -->
                                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div class="text-center">
                                        <span class="text-[9px] text-slate-500 font-bold block mb-0.5 uppercase">${headerLabels[projectionActiveMonthIdx] || 'TOTAL'}</span>
                                        <span class="text-xs font-black text-white bg-[#0f1115]/80 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-xl">${isBudgetDifMode ? fmt(totalRealIncome) : fmt(totalDisplayIncome)}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Custom Legend / Breakdown -->
                            <div id="proj-income-breakdown" class="flex-1 space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                                <!-- Injected via JS -->
                            </div>
                        </div>
                    </div>
                ` : ''}

                    <!-- Expense Chart -->
                    <div class="bg-white/[0.02] rounded-2xl border border-white/5 p-4 flex flex-col relative overflow-hidden group hover:border-rose-500/20 transition-all">
                         <div class="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>

                        <div class="flex items-center justify-between mb-2 relative z-10 px-2 text-center">
                             <div class="flex items-center gap-2 mx-auto">
                                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distribución de Gastos</h4>
                                <span class="text-[9px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">V2</span>
                             </div>
                        </div>

                        <div class="flex items-center gap-4 relative z-10">
                            <!-- Chart -->
                            <div class="relative w-[140px] h-[140px] flex-shrink-0">
                                <div id="proj-expense-chart" class="w-full h-full"></div>
                                 <!-- Center Label -->
                                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div class="text-center">
                                        <span class="text-[9px] text-slate-500 font-bold block mb-0.5 uppercase">${headerLabels[projectionActiveMonthIdx] || 'TOTAL'}</span>
                                        <span class="text-xs font-black text-white bg-[#0f1115]/80 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-xl">${isBudgetDifMode ? fmt(totalRealExpense) : fmt(totalDisplayExpense)}</span>
                                    </div>
                                </div>
                            </div>
                             <!-- Custom Legend / Breakdown -->
                            <div id="proj-expense-breakdown" class="flex-1 space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                                <!-- Injected via JS -->
                            </div>
                        </div>
                    </div>
 
             </div>
        </div>
    </div>
    `;

    function generateTableRows() {
        const incomeCats = BUDGET_CATEGORIES.filter(c => c.isIncome);
        const expenseCats = BUDGET_CATEGORIES.filter(c => !c.isIncome && c.id !== 'savings_goal');


        let rowHtml = '';

        const renderSection = (title, items, type) => {
            const typeColor = type === 'income' ? 'text-emerald-400' : 'text-rose-400';

            // Totals Accumulator
            let tM1 = 0, tM2 = 0, tM3 = 0, tTotal = 0;

            rowHtml += `
            <div class="flex items-center justify-between px-3 py-2 mt-4 mb-2 border-b border-white/5">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] ${typeColor}">${title}</span>
                <span class="text-[9px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded">${items.length} Items</span>
            </div>`;

            items.forEach(cat => {
                const budget = currentBudget[cat.id] || 0;
                let m1 = 0, m2 = 0, m3 = 0, rowTotal = 0;

                // --- LOGIC PER MODE ---
                if (projectionViewMode === 'past') {
                    // Real History: M-2, M-1, M_Current
                    m1 = getHistory(cat.id, 2, cat.isIncome);
                    m2 = getHistory(cat.id, 1, cat.isIncome);
                    m3 = getHistory(cat.id, 0, cat.isIncome);
                    rowTotal = m1 + m2 + m3;
                } else if (projectionViewMode === 'future') {
                    // Smart Projection: JAN(Real) + FEB(Forecast) + MAR(Forecast)
                    m1 = getHistory(cat.id, 0, cat.isIncome); // Current Month Real
                    const h1 = getHistory(cat.id, 1, cat.isIncome); // Previous Month

                    // Smarter Baseline: Prioritize Real Actuals (Trend) over Budget
                    // This prevents unexpected jumps if Budget is much higher/lower than reality
                    const baseline = m1 > 0 ? m1 : (h1 > 0 ? h1 : budget);

                    m2 = baseline * (1 + projectionGrowthRate); // Next Month: Baseline + Rate
                    m3 = baseline * Math.pow(1 + projectionGrowthRate, 2); // Month After: Baseline + Rate^2
                    rowTotal = m1 + m2 + m3;
                } else {
                    // Budget View Logic (Handled internally in template below)
                    // But we calculate defaults for accumulation if needed
                }

                if (projectionViewMode !== 'budget') {
                    tM1 += m1; tM2 += m2; tM3 += m3; tTotal += rowTotal;

                    // Render Row (Past/Future)
                    const valColor = type === 'income' ? 'text-emerald-100' : 'text-slate-200';
                    rowHtml += `
                     <div class="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 group items-center">
                        <div class="col-span-4 flex items-center gap-3 overflow-hidden">
                            <div class="w-8 h-8 rounded-lg bg-[#151921] flex items-center justify-center border border-white/5 group-hover:border-${type === 'income' ? 'emerald' : 'rose'}-500/30 transition shadow-inner">
                                <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 ${cat.color} opacity-80 group-hover:opacity-100 transition"></i>
                            </div>
                            <span class="text-[11px] font-bold ${type === 'income' ? 'text-indigo-200' : 'text-rose-200'} group-hover:text-white truncate transition shadow-black drop-shadow-sm">${cat.name}</span>
                        </div>
                        <div class="col-span-2 text-center font-mono text-xs ${projectionActiveMonthIdx === 0 ? 'text-indigo-400 font-extrabold scale-110 shadow-indigo-500/20' : 'text-slate-500 opacity-60'} transition-all">${fmt(m1)}</div>
                        <div class="col-span-2 text-center font-mono text-xs ${projectionActiveMonthIdx === 1 ? 'text-indigo-400 font-extrabold scale-110 shadow-indigo-500/20' : (projectionViewMode === 'future' ? 'text-sky-400 italic font-medium' : 'text-slate-500 opacity-80')} transition-all">${fmt(m2)}</div>
                        <div class="col-span-2 text-center font-mono text-xs ${projectionActiveMonthIdx === 2 ? 'text-indigo-400 font-extrabold scale-110 shadow-indigo-500/20' : (projectionViewMode === 'future' ? 'text-sky-400 italic font-medium' : 'text-white font-bold')} transition-all">${fmt(m3)}</div>
                        <div class="col-span-2 text-center font-mono text-xs text-${type === 'income' ? 'emerald' : 'rose'}-400 font-bold">${fmt(rowTotal)}</div>
                    </div>`;
                } else {

                    // Budget View (Presupuesto)
                    const actual = getHistory(cat.id, 0); // Use Real Data (0 = current month)
                    tM1 += budget;     // Accumulate Total Budget
                    tTotal += actual;  // Accumulate Total Actual

                    const diff = actual - budget;
                    const diffColor = diff > 0 ? (type === 'income' ? 'text-emerald-400' : 'text-red-400') : (type === 'income' ? 'text-red-400' : 'text-emerald-400');
                    const diffSign = diff > 0 ? '+' : '';

                    rowHtml += `
                    <div class="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 group items-center">
                        <div class="col-span-4 flex items-center gap-3 overflow-hidden">
                            <div class="w-8 h-8 rounded-lg bg-[#151921] flex items-center justify-center border border-white/5 group-hover:border-${type === 'income' ? 'emerald' : 'rose'}-500/30 transition shadow-inner">
                                <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 ${cat.color} opacity-80 group-hover:opacity-100 transition"></i>
                            </div>
                            <span class="text-[11px] font-bold ${type === 'income' ? 'text-indigo-200' : 'text-rose-200'} group-hover:text-white truncate transition shadow-black drop-shadow-sm">${cat.name}</span>
                        </div>
                        <div class="col-span-2 text-center font-mono text-xs text-slate-500 font-medium">${fmt(budget)}</div>
                        <div class="col-span-3 flex flex-col items-center justify-center font-mono text-xs font-bold text-white relative group/progress">
                            <span class="z-10">${fmt(actual)}</span>
                            <div class="w-16 h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-1.5 border border-white/5 relative shadow-inner">
                                <div class="h-full transition-all duration-700 ease-out ${type === 'income'
                            ? (actual >= budget ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-emerald-600/20')
                            : (actual > budget ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]' : 'bg-indigo-500/40')
                        }" style="width: ${Math.min(100, (budget > 0 ? (actual / budget) : 0) * 100)}%"></div>
                            </div>
                        </div>
                        <div class="col-span-3 text-center font-mono text-xs font-bold ${diffColor}">${diffSign}${fmt(diff)}</div>
                    </div>`;
                }
            });

            // Render Total Row (Universal)
            if (true) { // Enabled for all views including Budget
                if (projectionViewMode === 'budget') {
                    const diffTotal = tTotal - tM1;
                    const diffColorTotal = diffTotal > 0 ? (type === 'income' ? 'text-emerald-400' : 'text-red-400') : (type === 'income' ? 'text-red-400' : 'text-emerald-400');

                    rowHtml += `
                    <div class="grid grid-cols-12 gap-4 px-4 py-3 mt-1 bg-white/[0.02] border-t border-dashed border-white/10 rounded-b-xl">
                        <div class="col-span-4 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-end pr-4">Total ${title}</div>
                        <div class="col-span-2 text-center font-mono text-xs font-bold text-white">${fmt(tM1)}</div>
                        <div class="col-span-3 text-center font-mono text-xs font-black text-white shadow-purple-500/50">${fmt(tTotal)}</div>
                        <div class="col-span-3 text-center font-mono text-xs font-bold ${diffColorTotal}">${diffTotal > 0 ? '+' : ''}${fmt(diffTotal)}</div>
                    </div>
                    `;
                } else {
                    rowHtml += `
                    <div class="grid grid-cols-12 gap-4 px-4 py-3 mt-1 bg-white/[0.02] border-t border-dashed border-white/10 rounded-b-xl">
                        <div class="col-span-4 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-end pr-4">Total ${title}</div>
                        <div class="col-span-2 text-center font-mono text-xs font-bold text-white">${fmt(tM1)}</div>
                        <div class="col-span-2 text-center font-mono text-xs font-bold text-white">${fmt(tM2)}</div>
                        <div class="col-span-2 text-center font-mono text-xs font-bold text-white">${fmt(tM3)}</div>
                        <div class="col-span-2 text-center font-mono text-xs font-black ${type === 'income' ? 'text-emerald-400' : 'text-rose-400'}">${fmt(tTotal)}</div>
                    </div>
                    `;
                }
            }
        };


        if (projectionViewMode !== 'budget') {
            renderSection('Ingresos', incomeCats, 'income');
        }
        renderSection('Gastos', expenseCats, 'expense');

        return rowHtml;
    }

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // --- RENDER CHARTS ---
    setTimeout(() => {
        // Helper to Render Breakdown List
        const renderBreakdown = (containerId, items, total, colors) => {
            const el = document.getElementById(containerId);
            if (!el) return;

            el.innerHTML = items.map((item, i) => {
                const val = item.value;
                const pct = ((val / total) * 100).toFixed(1);
                const color = colors[i % colors.length];

                return `
                <div class="flex flex-col gap-1 p-2 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/5 group">
                    <div class="flex justify-between items-center text-[10px]">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style="color:${color}; background-color:${color}"></span>
                            <span class="text-slate-300 font-bold truncate group-hover:text-white transition">${item.name}</span>
                        </div>
                        <span class="font-mono font-bold text-slate-400 group-hover:text-white transition">${fmt(val)}</span>
                    </div>
                    <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div class="h-full rounded-full" style="width: ${pct}%; background-color: ${color}"></div>
                    </div>
                </div>
                `;
            }).join('');
        };

        const donutOptions = (series, labels, colors) => ({
            series: series,
            labels: labels,
            chart: {
                type: 'donut',
                height: 160,
                fontFamily: 'Instrument Sans',
                background: 'transparent',
                animations: { enabled: true, dynamicAnimation: { enabled: true, speed: 800 } }
            },
            colors: colors,
            stroke: { width: 0 },
            plotOptions: {
                pie: {
                    donut: {
                        size: '80%', // Thinner ring
                        labels: { show: false }
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'diagonal1',
                    shadeIntensity: 0.5,
                    gradientToColors: colors.map(c => '#ffffff'), // Subtle shine
                    inverseColors: true,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100]
                }
            },
            dataLabels: { enabled: false },
            legend: { show: false },
            tooltip: {
                theme: 'dark',
                custom: function ({ series, seriesIndex, w }) {
                    const label = w.globals.labels[seriesIndex];
                    const val = series[seriesIndex];
                    const color = w.globals.colors[seriesIndex];
                    return `
                    <div class="px-3 py-2 bg-[#0f1115] border border-white/10 rounded-lg shadow-xl backdrop-blur-md">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${label}</span>
                        </div>
                        <div class="text-sm font-black text-white">${fmt(val)}</div>
                    </div>
                    `;
                }
            }
        });

        // Income Donut - Using Calculated Values for Selected Month
        const incomeCats = BUDGET_CATEGORIES.filter(c => c.isIncome);
        const incomeSeries = incomeCats.map(cat => {
            const budgetVal = currentBudget[cat.id] || 0;
            const m0 = getHistory(cat.id, projectionViewMode === 'past' ? 2 : 0, cat.isIncome);
            const h1 = getHistory(cat.id, 1, cat.isIncome);
            const baseline = Math.max(m0 > 0 ? m0 : (h1 > 0 ? h1 : budgetVal), 0);

            if (projectionViewMode === 'budget') {
                const actualVal = getActual(cat.id, true);
                if (projectionActiveMonthIdx === 0) return budgetVal;
                if (projectionActiveMonthIdx === 1) return actualVal;
                if (projectionActiveMonthIdx === 2) return actualVal;
                return budgetVal;
            }

            const m1_val = m0;
            const m2_val = projectionViewMode === 'past' ? getHistory(cat.id, 1, cat.isIncome) : baseline * (1 + projectionGrowthRate);
            const m3_val = projectionViewMode === 'past' ? getHistory(cat.id, 0, cat.isIncome) : baseline * Math.pow(1 + projectionGrowthRate, 2);

            if (projectionActiveMonthIdx === 0) return m1_val;
            if (projectionActiveMonthIdx === 1) return m2_val;
            if (projectionActiveMonthIdx === 2) return m3_val;
            return m1_val + m2_val + m3_val;
        });
        const incomeLabels = incomeCats.map(c => c.name);

        // Map Tailwind color classes to hex for charts
        const colorMap = {
            'text-emerald-400': '#34d399',
            'text-sky-400': '#38bdf8',
            'text-indigo-400': '#818cf8',
            'text-pink-400': '#f472b6',
            'text-yellow-400': '#fbbf24',
            'text-teal-400': '#2dd4bf',
            'text-blue-400': '#60a5fa',
            'text-slate-400': '#94a3b8',
            'text-orange-400': '#fb923c',
            'text-purple-400': '#c084fc',
            'text-red-400': '#f87171',
            'text-cyan-400': '#22d3ee',
            'text-amber-400': '#fbbf24',
            'text-red-500': '#ef4444',
            'text-yellow-500': '#eab308'
        };

        const incomeColors = incomeCats.map(c => colorMap[c.color] || '#6366f1');

        if (document.querySelector("#proj-income-chart")) {
            window.aureusChartInstances['projIncome'] = new ApexCharts(document.querySelector("#proj-income-chart"),
                donutOptions(incomeSeries, incomeLabels, incomeColors)
            );
            window.aureusChartInstances['projIncome'].render();

            // Build breakdown items
            const breakdownItems = incomeCats.map((c, i) => ({
                name: c.name,
                value: incomeSeries[i]
            })).sort((a, b) => b.value - a.value);

            renderBreakdown('proj-income-breakdown', breakdownItems, isBudgetDifMode ? totalRealIncome : totalDisplayIncome, incomeColors);
        }

        // Expense Donut - Using Calculated Values for Selected Month
        const expenseCats = BUDGET_CATEGORIES.filter(c => !c.isIncome && c.id !== 'savings_goal');
        const expenseValues = expenseCats.map(cat => {
            const budgetVal = currentBudget[cat.id] || 0;
            const m0 = getHistory(cat.id, projectionViewMode === 'past' ? 2 : 0, cat.isIncome);
            const h1 = getHistory(cat.id, 1, cat.isIncome);
            const baseline = Math.max(m0 > 0 ? m0 : (h1 > 0 ? h1 : budgetVal), 0);

            if (projectionViewMode === 'budget') {
                const actualVal = getActual(cat.id, false);
                if (projectionActiveMonthIdx === 0) return budgetVal;
                if (projectionActiveMonthIdx === 1) return actualVal;
                if (projectionActiveMonthIdx === 2) return actualVal;
                return budgetVal;
            }

            const m1_val = m0;
            const m2_val = projectionViewMode === 'past' ? getHistory(cat.id, 1, cat.isIncome) : baseline * (1 + projectionGrowthRate);
            const m3_val = projectionViewMode === 'past' ? getHistory(cat.id, 0, cat.isIncome) : baseline * Math.pow(1 + projectionGrowthRate, 2);

            if (projectionActiveMonthIdx === 0) return m1_val;
            if (projectionActiveMonthIdx === 1) return m2_val;
            if (projectionActiveMonthIdx === 2) return m3_val;
            return m1_val + m2_val + m3_val;
        });

        // take top 5 expenses for chart
        const sortedIndices = expenseValues.map((v, i) => i).sort((a, b) => expenseValues[b] - expenseValues[a]);
        const top5Indices = sortedIndices.slice(0, 5);

        let expenseSeries = top5Indices.map(i => expenseValues[i]);
        let expenseLabels = top5Indices.map(i => expenseCats[i].name);
        let expenseColors = top5Indices.map(i => colorMap[expenseCats[i].color] || '#f472b6');

        if (expenseCats.length > 5) {
            const otherVal = sortedIndices.slice(5).reduce((acc, i) => acc + expenseValues[i], 0);
            if (otherVal > 0) {
                expenseSeries.push(otherVal);
                expenseLabels.push('Otros');
                expenseColors.push('#94a3b8');
            }
        }

        if (document.querySelector("#proj-expense-chart")) {
            window.aureusChartInstances['projExpense'] = new ApexCharts(document.querySelector("#proj-expense-chart"),
                donutOptions(expenseSeries, expenseLabels, expenseColors)
            );
            window.aureusChartInstances['projExpense'].render();

            // Build breakdown items
            const breakdownItems = expenseLabels.map((name, i) => ({
                name: name,
                value: expenseSeries[i]
            })).sort((a, b) => b.value - a.value);

            renderBreakdown('proj-expense-breakdown', breakdownItems, isBudgetDifMode ? totalRealExpense : totalDisplayExpense, expenseColors);
        }

        renderAnalyticsCharts();
    }, 100);
}


// 5.2 Modal Functions
window.openBudgetModal = () => {
    const modal = document.getElementById('budget-modal');
    const grid = document.getElementById('budget-modal-grid');
    if (!modal || !grid) return;

    // Populate Grid
    grid.innerHTML = BUDGET_CATEGORIES.map(cat => `
        <div class="bg-[#0f1115] p-4 rounded-2xl border border-white/5 flex items-center justify-between group focus-within:border-indigo-500/50 focus-within:bg-indigo-500/5 transition-all">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#161b22] flex items-center justify-center ${cat.color} border border-white/5">
                    <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">${cat.name}</p>
                    <div class="flex items-center gap-1 text-white font-mono text-sm">
                        <span class="text-slate-500">$</span>
                        <input type="number" 
                            id="input-budget-${cat.id}" 
                            value="${currentBudget[cat.id]}" 
                            class="bg-transparent border-none outline-none w-24 p-0 font-bold focus:ring-0 placeholder-slate-700" 
                            oninput="updateModalTotal()">
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    updateModalTotal();

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
};

window.closeBudgetModal = () => {
    document.getElementById('budget-modal').classList.add('hidden');
};

window.updateModalTotal = () => {
    let total = 0;
    BUDGET_CATEGORIES.forEach(cat => {
        const val = parseFloat(document.getElementById(`input-budget-${cat.id}`).value) || 0;
        // Logic: Total usually refers to Expenses Budget Sum for the month
        if (!cat.isIncome && cat.id !== 'savings_goal') {
            total += val;
        }
    });
    document.getElementById('budget-modal-total').innerText = '$' + total.toLocaleString('en-US');
};

window.saveBudgetChanges = () => {
    BUDGET_CATEGORIES.forEach(cat => {
        const val = parseFloat(document.getElementById(`input-budget-${cat.id}`).value) || 0;
        currentBudget[cat.id] = val;
    });

    localStorage.setItem('aureus_budget_v1', JSON.stringify(currentBudget));
    renderProjectionsV2(); // Refresh table with new budget numbers
    closeBudgetModal();

    // Optional: Show Success notification/toast
};

// --- INITIALIZATION ---
// --- INITIALIZATION ---
const initAureusCharts = () => {
    console.log("AUREUS: Initializing Engine...");

    // Always init data/budget logic immediately
    if (typeof window.initBudget === 'function') window.initBudget();

    // Defer visual rendering until charting library is ready
    if (typeof LazyLoader !== 'undefined') {
        LazyLoader.loadAll(['apexcharts']).then(() => {
            renderProjectionsV2();
            renderTrendSparklines();
            renderAnalyticsCharts();
        });
    } else {
        // Fallback for legacy/error states
        setTimeout(() => {
            renderProjectionsV2();
            if (typeof ApexCharts !== 'undefined') {
                renderTrendSparklines();
                renderAnalyticsCharts();
            }
        }, 150);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAureusCharts);
} else {
    initAureusCharts();
}


window.exportProjectionsToExcel = () => {
    console.log("AUREUS EXCEL: Starting Multi-Tab Export...");

    Swal.fire({
        title: 'AUREUS ENGINE',
        text: 'Generando Reporte Multidimensional...',
        allowOutsideClick: false,
        background: '#0B0D14',
        color: '#fff',
        didOpen: () => {
            Swal.showLoading();
            setTimeout(executeExport, 500);
        }
    });

    async function executeExport() {
        try {
            const now = new Date();
            const workbook = new ExcelJS.Workbook();
            workbook.calcProperties.fullCalcOnLoad = true;

            // --- LOGO FETCH (ONCE) ---
            let logoBuffer = null;
            try {
                const response = await fetch('assets/logo.png');
                if (response.ok) {
                    logoBuffer = await response.arrayBuffer();
                }
            } catch (err) {
                console.warn("Logo fetch error:", err);
            }

            // --- CHART GENERATOR HELPER ---
            async function generateExcelChartImage(labels, data1, data2 = null, type = 'line', title = 'CHART') {
                return new Promise((resolve) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = type === 'line' ? 1200 : 600;
                    canvas.height = type === 'line' ? 700 : 500;
                    canvas.style.display = 'none';
                    document.body.appendChild(canvas);
                    const ctx = canvas.getContext('2d');

                    const chartConfig = {
                        type: type,
                        data: {
                            labels: labels,
                            datasets: type === 'line' ? [
                                {
                                    label: 'PRESUPUESTO GASTOS',
                                    data: data1,
                                    borderColor: '#94A3B8',
                                    borderWidth: 3,
                                    pointRadius: 4,
                                    pointBackgroundColor: '#94A3B8',
                                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                    fill: true,
                                    tension: 0.3
                                },
                                {
                                    label: 'REAL (ACTUAL)',
                                    data: data2,
                                    borderColor: '#D4AF37',
                                    borderWidth: 4,
                                    pointRadius: 6,
                                    pointBackgroundColor: '#D4AF37',
                                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                    fill: true,
                                    tension: 0.3
                                }
                            ] : [
                                {
                                    data: data1,
                                    backgroundColor: [
                                        '#D4AF37', '#94A3B8', '#1E293B', '#334155',
                                        '#475569', '#64748B', '#0F172A', '#D97706',
                                        '#B45309', '#78350F', '#451A03', '#F59E0B'
                                    ],
                                    borderWidth: 2,
                                    borderColor: '#0B0D14'
                                }
                            ]
                        },
                        options: {
                            responsive: false,
                            devicePixelRatio: 2,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                    labels: {
                                        color: '#FFFFFF',
                                        font: { family: 'Outfit', size: type === 'line' ? 16 : 10, weight: 'bold' },
                                        padding: 15
                                    }
                                },
                                title: {
                                    display: true,
                                    text: title,
                                    color: '#D4AF37',
                                    font: { family: 'Outfit', size: type === 'line' ? 24 : 18, weight: 'bold' },
                                    padding: { top: 10, bottom: 10 }
                                }
                            },
                            layout: { padding: 20 }
                        },
                        plugins: [{
                            id: 'background',
                            beforeDraw: (chart) => {
                                const { ctx } = chart;
                                ctx.save();
                                ctx.fillStyle = '#0B0D14';
                                ctx.fillRect(0, 0, chart.width, chart.height);
                                ctx.restore();
                            }
                        }]
                    };

                    if (type === 'line') {
                        chartConfig.options.scales = {
                            x: {
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#94A3B8', font: { family: 'Outfit', size: 12 } }
                            },
                            y: {
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: {
                                    color: '#94A3B8',
                                    font: { family: 'Outfit', size: 12 },
                                    callback: (value) => '$' + value.toLocaleString()
                                }
                            }
                        };
                    } else if (type === 'doughnut') {
                        chartConfig.options.cutout = '60%';
                    }

                    new Chart(ctx, chartConfig);

                    // Wait for render
                    setTimeout(() => {
                        const base64 = canvas.toDataURL('image/png');
                        document.body.removeChild(canvas);
                        resolve(base64.split(',')[1]); // Return base64 content
                    }, 500);
                });
            }

            // --- REUSABLE SHEET GENERATOR ---
            const generateSheet = async (mode, sheetName) => {
                const worksheet = workbook.addWorksheet(sheetName, {
                    views: [{ showGridLines: false }]
                });

                const BG_COLOR = "0B0D14";
                const ACCENT_COLOR = "D4AF37";
                const roundVal = (v) => Math.round((parseFloat(v) || 0) * 100) / 100;

                // --- LOGO INTEGRATION ---
                if (logoBuffer) {
                    const logoId = workbook.addImage({
                        buffer: logoBuffer,
                        extension: 'png',
                    });
                    // Place logo centered above title
                    worksheet.addImage(logoId, {
                        tl: { col: 1.5, row: 1.5 },
                        ext: { width: 60, height: 60 }
                    });
                }

                // V5 Column Widths
                worksheet.getColumn(1).width = 2; // Margin
                worksheet.getColumn(2).width = 40; // Categories
                for (let i = 3; i <= 20; i++) worksheet.getColumn(i).width = 20; // Data columns

                // --- DYNAMIC PAST MONTH DETECTION ---
                let pastMonths = [];
                const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

                // Helper to get current global time if needed, but 'now' is passed or available from outer scope
                // Reuse 'now' from outer scope to ensure consistency

                const currentYearMonthVal = now.getFullYear() * 12 + now.getMonth();

                if (mode === 'past' && window.appState && window.appState.transactions) {
                    const uniqueMonths = new Set();
                    window.appState.transactions.forEach(t => {
                        const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date || t.id);
                        if (!isNaN(d.getTime())) {
                            const val = d.getFullYear() * 12 + d.getMonth();
                            uniqueMonths.add(val);
                        }
                    });

                    const sortedVals = Array.from(uniqueMonths).sort((a, b) => a - b);
                    pastMonths = sortedVals.map(v => {
                        const year = Math.floor(v / 12);
                        const month = v % 12;
                        return {
                            name: `${monthNames[month]} ${year}`,
                            offset: currentYearMonthVal - v,
                            key: v
                        };
                    });
                }

                // --- HEADERS DATA ---
                let headersList = ['CONCEPTOS / CATEGORÍA'];
                const currentMonthIdx = now.getMonth();

                if (mode === 'budget') {
                    headersList.push('PRESUPUESTO', 'REAL (ACTUAL)', 'DIFERENCIA');
                } else if (mode === 'past') {
                    if (pastMonths.length > 0) {
                        pastMonths.forEach(m => headersList.push(m.name));
                    } else {
                        // Fallback to last 3 months if no data
                        headersList.push(
                            monthNames[(currentMonthIdx - 2 + 12) % 12],
                            monthNames[(currentMonthIdx - 1 + 12) % 12],
                            monthNames[currentMonthIdx]
                        );
                    }
                    headersList.push('TOTAL HISTÓRICO');
                } else {
                    headersList.push((monthNames[currentMonthIdx] + ' (REAL)'));
                    for (let i = 1; i <= 5; i++) {
                        headersList.push((monthNames[(currentMonthIdx + i) % 12] + ' (EST.)'));
                    }
                    headersList.push('PROYECCIÓN TOTAL');
                }

                const totalCols = headersList.length;
                let lastTableCol = 1 + totalCols;
                // If budget mode, we only want 4 columns total (A=blank, B=Category, C=Budget, D=Actual, E=Diff)
                // lastTableCol = 1 + 4 = 5.
                // If other modes, it might be more. 
                // We'll keep lastTableCol dynamic but ensure Dash doesn't force it to 9 if not needed.
                if (mode !== 'budget' && lastTableCol < 9) lastTableCol = 9;

                // Setup Column Widths
                worksheet.getColumn(1).width = 8;
                worksheet.getColumn(2).width = 45;
                for (let i = 3; i <= lastTableCol; i++) {
                    worksheet.getColumn(i).width = 24;
                }

                // --- THEME BACKGROUND (Initial fill) ---
                for (let r = 1; r <= 150; r++) {
                    const row = worksheet.getRow(r);
                    for (let c = 1; c <= 26; c++) {
                        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BG_COLOR } };
                    }
                }

                // --- BRANDING SECTION ---
                const brandRow = worksheet.getRow(4);
                brandRow.height = 40;
                const brandCell = brandRow.getCell(2);
                brandCell.value = "AUREUS";
                brandCell.font = { name: 'Outfit', bold: true, size: 36, color: { argb: 'FF' + ACCENT_COLOR } };
                brandCell.alignment = { horizontal: 'center', vertical: 'middle' };
                worksheet.mergeCells(4, 2, 4, lastTableCol);

                const titleRow = worksheet.getRow(5);
                titleRow.height = 25;
                const titleCell = titleRow.getCell(2);
                titleCell.value = "FINANCE AI ENGINE";
                titleCell.font = { name: 'Outfit', bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
                titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                worksheet.mergeCells(5, 2, 5, lastTableCol);

                // --- EXECUTIVE DASHBOARD ---
                const dashRowIdx = 8;
                const dashRow = worksheet.getRow(dashRowIdx);
                dashRow.height = 45;

                let totalIncomeCellAddr = null;
                let totalExpenseCellAddr = null;
                let totalExpenseBudgetAddr = null;
                let totalIncomeValue = 0;
                let totalExpenseValue = 0;
                let totalExpenseBudgetValue = 0;

                const addMetric = (colStart, colEnd, label, value, color, isPercent = false) => {
                    const lRow = worksheet.getRow(dashRowIdx - 1);
                    const lCell = lRow.getCell(colStart);
                    lCell.value = label;
                    lCell.font = { name: 'Outfit', color: { argb: 'FF94A3B8' }, size: 9 };
                    lCell.alignment = { horizontal: 'center', vertical: 'bottom' };
                    worksheet.mergeCells(dashRowIdx - 1, colStart, dashRowIdx - 1, colEnd);

                    const vCell = dashRow.getCell(colStart);
                    vCell.value = value;
                    vCell.numFmt = isPercent ? '0.0"%"' : '"$"#,##0.00';
                    vCell.font = { name: 'Outfit', bold: true, size: 14, color: { argb: 'FF' + ACCENT_COLOR } };
                    vCell.alignment = { horizontal: 'center', vertical: 'middle' };
                    vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
                    vCell.border = {
                        top: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } },
                        bottom: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } },
                        left: { style: 'thin', color: { argb: 'FF1E293B' } },
                        right: { style: 'thin', color: { argb: 'FF1E293B' } }
                    };
                    worksheet.mergeCells(dashRowIdx, colStart, dashRowIdx, colEnd);
                };

                let currentRowIdx = 10;

                // --- USABILITY ---
                worksheet.views = [{ showGridLines: false }];

                const iconMap = {
                    'banknote': '💵', 'laptop': '💻', 'trending-up': '📈', 'gift': '🎁',
                    'medal': '🥇', 'receipt': '🧾', 'refresh-cw': '🔄', 'plus-circle': '➕',
                    'utensils': '🍴', 'shopping-cart': '🛒', 'home': '🏠', 'bus': '🚌',
                    'clapperboard': '🎬', 'shopping-bag': '🛍️', 'heart': '❤️', 'wifi': '📶',
                    'graduation-cap': '🎓', 'plane': '✈️', 'glass-water': '🥃', 'pizza': '🍕',
                    'leaf': '🍃', 'fuel': '⛽', 'more-horizontal': '⋯', 'target': '🎯'
                };

                const colorMap = {
                    'text-emerald-400': 'FF34D399', 'text-sky-400': 'FF38BDF8', 'text-indigo-400': 'FF818CF8',
                    'text-pink-400': 'FFF472B6', 'text-yellow-400': 'FFFACC15', 'text-teal-400': 'FF2DD4BF',
                    'text-blue-400': 'FF60A5FA', 'text-slate-400': 'FF94A3B8', 'text-orange-400': 'FFFB923C',
                    'text-purple-400': 'FFC084FC', 'text-red-400': 'FFF87171', 'text-cyan-400': 'FF22D3EE',
                    'text-amber-400': 'FFFBBF24', 'text-rose-400': 'FFFB7185', 'text-green-400': 'FF4ADE80',
                    'text-yellow-500': 'FFEAB308', 'text-indigo-300': 'FFA5B4FC'
                };

                const addDataSection = (sectionTitle, categories, isIncome, showHeader = true) => {
                    if (showHeader) {
                        const headerRow = worksheet.getRow(currentRowIdx);
                        headerRow.height = 40;
                        headersList.forEach((h, i) => {
                            const cell = headerRow.getCell(i + 2);
                            cell.value = h;
                            cell.font = { name: 'Outfit', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                            const headerBorderColor = 'FF' + ACCENT_COLOR;
                            cell.border = {
                                top: { style: 'thin', color: { argb: headerBorderColor } },
                                left: { style: 'thin', color: { argb: headerBorderColor } },
                                bottom: { style: 'thin', color: { argb: headerBorderColor } },
                                right: { style: 'thin', color: { argb: headerBorderColor } }
                            };
                            if (h.includes('TOTAL') || h.includes('DIFERENCIA') || h.includes('HISTÓRICO')) {
                                cell.font.color = { argb: 'FF' + ACCENT_COLOR };
                                cell.font.bold = true;
                            }
                        });
                        currentRowIdx++;
                    }

                    const sectionRow = worksheet.getRow(currentRowIdx);
                    sectionRow.height = 32;
                    const sCell = sectionRow.getCell(2);
                    sCell.value = sectionTitle;
                    sCell.font = { name: 'Outfit', bold: true, size: 14, color: { argb: 'FF' + ACCENT_COLOR } };
                    sCell.alignment = { horizontal: 'center', vertical: 'middle' };
                    const secBg = 'FF000000';

                    for (let i = 2; i <= lastTableCol; i++) {
                        const c = sectionRow.getCell(i);
                        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: secBg } };
                        c.border = {
                            top: { style: 'thin', color: { argb: 'FF' + ACCENT_COLOR } },
                            bottom: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } }
                        };
                    }
                    worksheet.mergeCells(currentRowIdx, 2, currentRowIdx, lastTableCol);
                    currentRowIdx++;

                    let sectionTotals = new Array(totalCols - 1).fill(0);
                    let totalAccum = 0;

                    categories.forEach((cat, catIdx) => {
                        const row = worksheet.getRow(currentRowIdx);
                        row.height = 28;
                        const isEven = catIdx % 2 === 0;
                        const rowBg = isEven ? 'FF0F172A' : 'FF111827';
                        const customHex = colorMap[cat.color] || 'FFE2E8F0';
                        const emoji = iconMap[cat.icon] || '•';

                        const nameCell = row.getCell(2);
                        nameCell.value = `${emoji} ${cat.name}`;
                        nameCell.font = { name: 'Outfit', color: { argb: customHex }, size: 12 };
                        nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
                        nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
                        nameCell.border = {
                            bottom: { style: 'thin', color: { argb: 'FF' + ACCENT_COLOR } },
                            right: { style: 'thin', color: { argb: 'FF' + ACCENT_COLOR } }
                        };

                        const styleCell = (cell, val, color = ('FF' + ACCENT_COLOR), bold = false) => {
                            if (typeof val === 'object' && val.formula) {
                                cell.value = val;
                            } else {
                                cell.value = (val === 0 || val === '0') ? 0 : val;
                            }
                            cell.numFmt = '"$"#,##0.00';
                            cell.font = { name: 'Outfit', color: { argb: color }, bold: bold, size: 10 };
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                            cell.border = {
                                bottom: { style: 'thin', color: { argb: 'FF' + ACCENT_COLOR } },
                                right: { style: 'thin', color: { argb: 'FF' + ACCENT_COLOR } }
                            };
                        };

                        if (mode === 'budget') {
                            const budget = roundVal(currentBudget[cat.id] || 0);
                            const actualBuffer = roundVal(getHistory(cat.id, 0, isIncome) || 0);
                            styleCell(row.getCell(3), budget);
                            styleCell(row.getCell(4), actualBuffer, isIncome ? 'FF34D399' : 'FFFB7185', true);

                            const bAddr = row.getCell(3).address;
                            const aAddr = row.getCell(4).address;
                            const diffFormula = isIncome ? `${aAddr}-${bAddr}` : `${bAddr}-${aAddr}`;

                            const diffCell = row.getCell(5);
                            styleCell(diffCell, { formula: diffFormula, result: actualBuffer - budget }, 'FF34D399', true);
                            diffCell.numFmt = '"$"#,##0.00';
                        } else if (mode === 'past') {
                            let rowSum = 0;
                            if (pastMonths.length > 0) {
                                pastMonths.forEach((m, mIdx) => {
                                    const val = roundVal(getHistory(cat.id, m.offset, isIncome) || 0);
                                    styleCell(row.getCell(mIdx + 3), val, isIncome ? 'FF34D399' : 'FFFB7185');
                                });
                                const startCol = 3;
                                const endCol = lastTableCol - 1;
                                const rName = row.number;
                                const rowFormula = `SUM(${worksheet.getRow(rName).getCell(startCol).address}:${worksheet.getRow(rName).getCell(endCol).address})`;
                                styleCell(row.getCell(lastTableCol), { formula: rowFormula, result: 0 }, 'FFAAAAAA', true);
                            } else {
                                const c1 = roundVal(getHistory(cat.id, 2, isIncome) || 0);
                                const c2 = roundVal(getHistory(cat.id, 1, isIncome) || 0);
                                const c3 = roundVal(getHistory(cat.id, 0, isIncome) || 0);
                                const sum = c1 + c2 + c3;
                                styleCell(row.getCell(3), c1); styleCell(row.getCell(4), c2); styleCell(row.getCell(5), c3);
                                styleCell(row.getCell(6), sum, 'FFFFFFFF', true);
                            }
                        } else {
                            const budget = roundVal(currentBudget[cat.id] || 0);
                            const cReal = roundVal(getHistory(cat.id, 0, isIncome) || 0);
                            const h1 = roundVal(getHistory(cat.id, 1, isIncome) || 0);
                            const baseline = cReal > 0 ? cReal : (h1 > 0 ? h1 : budget);

                            styleCell(row.getCell(3), cReal, isIncome ? 'FF34D399' : 'FFFB7185', true);
                            sectionTotals[0] += cReal;
                            let rowSum = cReal;

                            for (let i = 1; i <= 5; i++) {
                                const estVal = roundVal(baseline * Math.pow(1 + projectionGrowthRate, i));
                                styleCell(row.getCell(i + 3), estVal);
                            }
                            const rName = row.number;
                            const rowFormula = `SUM(${worksheet.getRow(rName).getCell(3).address}:${worksheet.getRow(rName).getCell(8).address})`;
                            styleCell(row.getCell(9), { formula: rowFormula, result: 0 }, 'FF' + ACCENT_COLOR, true);
                        }
                        currentRowIdx++;
                    });

                    const tRow = worksheet.getRow(currentRowIdx);
                    tRow.height = 35;
                    const labelCell = tRow.getCell(2);
                    labelCell.value = `TOTAL ${sectionTitle}`;
                    labelCell.font = { name: 'Outfit', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                    labelCell.alignment = { horizontal: 'center', vertical: 'middle' };

                    for (let i = 2; i <= lastTableCol; i++) {
                        const cell = tRow.getCell(i);
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
                        cell.border = { top: { style: 'double', color: { argb: 'FF' + ACCENT_COLOR } } };
                    }

                    const styleTotalValue = (cell, val, color = 'FFFFFFFF') => {
                        cell.value = val;
                        cell.numFmt = '"$"#,##0.00';
                        cell.font = { name: 'Outfit', bold: true, color: { argb: color }, size: 11 };
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    };

                    const startDataRow = currentRowIdx - categories.length;
                    const endDataRow = currentRowIdx - 1;
                    let targetTotalColIndex = (mode === 'budget') ? 4 : lastTableCol;

                    for (let col = 3; col <= lastTableCol; col++) {
                        let colSum = 0;
                        categories.forEach(cat => {
                            if (mode === 'budget') {
                                if (col === 3) colSum += roundVal(currentBudget[cat.id] || 0);
                                else if (col === 4) colSum += roundVal(getHistory(cat.id, 0, isIncome) || 0);
                                else if (col === 5) colSum += (isIncome ? (roundVal(getHistory(cat.id, 0, isIncome) || 0) - roundVal(currentBudget[cat.id] || 0)) : (roundVal(currentBudget[cat.id] || 0) - roundVal(getHistory(cat.id, 0, isIncome) || 0)));
                            } else if (mode === 'past') {
                                if (pastMonths.length > 0) {
                                    if (col < lastTableCol) colSum += roundVal(getHistory(cat.id, pastMonths[col - 3].offset, isIncome) || 0);
                                    else {
                                        pastMonths.forEach(m => colSum += roundVal(getHistory(cat.id, m.offset, isIncome) || 0));
                                    }
                                }
                            } else { // projection
                                if (col === 3) colSum += roundVal(getHistory(cat.id, 0, isIncome) || 0);
                                else if (col <= 8) {
                                    const baseline = roundVal(getHistory(cat.id, 0, isIncome) || 0) || roundVal(getHistory(cat.id, 1, isIncome) || 0) || roundVal(currentBudget[cat.id] || 0);
                                    colSum += roundVal(baseline * Math.pow(1 + projectionGrowthRate, col - 3));
                                } else if (col === 9) {
                                    const baseline = roundVal(getHistory(cat.id, 0, isIncome) || 0) || roundVal(getHistory(cat.id, 1, isIncome) || 0) || roundVal(currentBudget[cat.id] || 0);
                                    for (let i = 0; i <= 5; i++) colSum += roundVal(baseline * Math.pow(1 + projectionGrowthRate, i));
                                }
                            }
                        });

                        const colLet = worksheet.getColumn(col).letter;
                        const sumFormula = `SUM(${colLet}${startDataRow}:${colLet}${endDataRow})`;
                        const tCell = tRow.getCell(col);
                        tCell.value = { formula: sumFormula, result: colSum };
                        tCell.numFmt = '"$"#,##0.00';
                        tCell.font = { name: 'Outfit', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                        tCell.alignment = { horizontal: 'center', vertical: 'middle' };

                        if (col === targetTotalColIndex) {
                            if (isIncome) totalIncomeValue = colSum;
                            else totalExpenseValue = colSum;
                        }
                        if (mode === 'budget' && col === 3 && !isIncome) totalExpenseBudgetValue = colSum;
                    }

                    if (mode === 'budget') {
                        // Formula for difference total
                        const bTotalAddr = tRow.getCell(3).address;
                        const aTotalAddr = tRow.getCell(4).address;
                        const diffFormula = isIncome ? `${aTotalAddr}-${bTotalAddr}` : `${bTotalAddr}-${aTotalAddr}`;
                        const bTotalVal = !isIncome ? totalExpenseBudgetValue : 0; // We'll calculate it better
                        let diffSum = 0;
                        categories.forEach(cat => {
                            const b = roundVal(currentBudget[cat.id] || 0);
                            const a = roundVal(getHistory(cat.id, 0, isIncome) || 0);
                            diffSum += isIncome ? (a - b) : (b - a);
                        });

                        tRow.getCell(5).value = { formula: diffFormula, result: diffSum };
                        // We reset lastTableCol specifically for budget to avoid trailing zeros
                        lastTableCol = 5;
                        targetTotalColIndex = 4; // Dashboard points to Actual for budget
                    }

                    if (isIncome) totalIncomeCellAddr = tRow.getCell(targetTotalColIndex).address;
                    else {
                        totalExpenseCellAddr = tRow.getCell(targetTotalColIndex).address;
                        if (mode === 'budget') {
                            totalExpenseBudgetAddr = tRow.getCell(3).address;
                        }
                    }
                    currentRowIdx += 3;
                };

                const incomeCats = BUDGET_CATEGORIES.filter(c => c.isIncome);
                const expenseCats = BUDGET_CATEGORIES.filter(c => !c.isIncome && c.id !== 'savings_goal');

                if (mode !== 'budget') {
                    addDataSection('INGRESOS', incomeCats, true, true);
                    addDataSection('GASTOS', expenseCats, false, false);
                } else {
                    addDataSection('GASTOS', expenseCats, false, true);
                }

                // --- UPDATE DASHBOARD WITH FORMULAS ---
                const metric1Addr = mode === 'budget' ? totalExpenseBudgetAddr : totalIncomeCellAddr;
                const metric2Addr = totalExpenseCellAddr;
                const metric1Val = mode === 'budget' ? totalExpenseBudgetValue : totalIncomeValue;
                const metric2Val = totalExpenseValue;

                const applyFormulaMetric = (colStart, colEnd, label, formula, numericResult, noteContent, isPercent = false) => {
                    const lRow = worksheet.getRow(dashRowIdx - 1);
                    const lCell = lRow.getCell(colStart);
                    lCell.value = label;
                    lCell.font = { name: 'Outfit', color: { argb: 'FF94A3B8' }, size: 9 };
                    lCell.alignment = { horizontal: 'center', vertical: 'bottom' };
                    worksheet.mergeCells(dashRowIdx - 1, colStart, dashRowIdx - 1, colEnd);

                    const vCell = worksheet.getRow(dashRowIdx).getCell(colStart);
                    vCell.value = { formula: formula, result: numericResult };
                    vCell.numFmt = isPercent ? '0%' : '"$"#,##0.00';
                    vCell.font = { name: 'Outfit', bold: true, size: 14, color: { argb: 'FF' + ACCENT_COLOR } };
                    vCell.alignment = { horizontal: 'center', vertical: 'middle' };
                    vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
                    if (noteContent) vCell.note = noteContent;

                    vCell.border = {
                        top: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } },
                        bottom: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } },
                        left: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } },
                        right: { style: 'medium', color: { argb: 'FF' + ACCENT_COLOR } }
                    };
                    worksheet.mergeCells(dashRowIdx, colStart, dashRowIdx, colEnd);
                };

                if (mode === 'budget') {
                    applyFormulaMetric(2, 4, "PRESUPUESTO GASTOS", metric1Addr, metric1Val, "Descripción: Suma total de lo presupuestado para gastos.");
                    applyFormulaMetric(5, 7, "GASTOS REALES", metric2Addr, metric2Val, "Descripción: Suma total de los gastos reales realizados.");
                    applyFormulaMetric(8, 10, "DIFERENCIA (±)", `${metric1Addr}-${metric2Addr}`, metric1Val - metric2Val, "Descripción: Diferencia entre presupuesto y gasto real. Positivo significa ahorro.");
                    const compliance = metric1Val !== 0 ? (metric2Val / metric1Val) : 0;
                    applyFormulaMetric(11, 13, "% CUMPLIMIENTO", `IF(${metric1Addr}<>0, ${metric2Addr}/${metric1Addr}, 0)`, compliance, "Descripción: Porcentaje de ejecución del presupuesto.", true);
                } else {
                    applyFormulaMetric(2, 3, "TOTAL INGRESOS", metric1Addr, metric1Val, "Descripción: Suma total de todos los ingresos.\n\nRecomendación: Busca diversificar tus fuentes de ingreso para mayor estabilidad.");
                    applyFormulaMetric(4, 5, "TOTAL GASTOS", metric2Addr, metric2Val, "Descripción: Suma total de todos los gastos.\n\nRecomendación: Revisa tus gastos recurrentes y elimina suscripciones innecesarias.");
                    applyFormulaMetric(6, 7, "BALANCE NETO", `${metric1Addr}-${metric2Addr}`, metric1Val - metric2Val, "Descripción: Dinero restante después de gastos.\n\nRecomendación: Mantén este valor positivo y destina el excedente a inversiones.");
                    const savingsRate = metric1Val !== 0 ? (metric1Val - metric2Val) / metric1Val : 0;
                    applyFormulaMetric(8, Math.max(9, lastTableCol), "TASA AHORRO", `IF(${metric1Addr}<>0, (${metric1Addr}-${metric2Addr})/${metric1Addr}, 0)`, savingsRate, "Descripción: Porcentaje del ingreso que se ahorra.\n\nRecomendación: Intenta mantener una tasa superior al 20% para salud financiera.", true);
                }

                // --- SAVINGS ANALYSIS SECTION ---
                if (mode !== 'budget' && totalIncomeCellAddr && totalExpenseCellAddr) {
                    const saStartCol = lastTableCol + 2;
                    const saEndCol = saStartCol + 3;

                    const saTitleRow = worksheet.getRow(dashRowIdx - 1);
                    const saTitleCell = saTitleRow.getCell(saStartCol);
                    saTitleCell.value = "ANÁLISIS DE AHORRO";
                    saTitleCell.font = { name: 'Outfit', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
                    saTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
                    saTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                    worksheet.mergeCells(dashRowIdx - 1, saStartCol, dashRowIdx - 1, saEndCol);

                    const addAnalysisRow = (rIdx, label, formula) => {
                        const r = worksheet.getRow(rIdx);
                        const lCell = r.getCell(saStartCol);
                        lCell.value = label;
                        lCell.font = { name: 'Outfit', color: { argb: 'FF94A3B8' }, size: 10 };
                        lCell.alignment = { horizontal: 'left', vertical: 'middle' };
                        worksheet.mergeCells(rIdx, saStartCol, rIdx, saStartCol + 1);

                        const vCell = r.getCell(saStartCol + 2);
                        vCell.value = { formula: formula };
                        vCell.numFmt = '"$"#,##0.00';
                        vCell.font = { name: 'Outfit', bold: true, color: { argb: 'FF' + ACCENT_COLOR } };
                        vCell.alignment = { horizontal: 'right', vertical: 'middle' };
                        worksheet.mergeCells(rIdx, saStartCol + 2, rIdx, saEndCol);

                        for (let c = saStartCol; c <= saEndCol; c++) {
                            const cell = r.getCell(c);
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
                            cell.border = { bottom: { style: 'thin', color: { argb: 'FF' + ACCENT_COLOR } } };
                        }
                    };

                    const netBalanceFormula = `(${totalIncomeCellAddr}-${totalExpenseCellAddr})`;
                    addAnalysisRow(dashRowIdx, "Proyección Anual", `${netBalanceFormula}*12`);
                    addAnalysisRow(dashRowIdx + 1, "Meta Ahorro (20%)", `${totalIncomeCellAddr}*0.20`);
                    addAnalysisRow(dashRowIdx + 2, "Brecha vs Meta", `(${totalIncomeCellAddr}*0.20) - ${netBalanceFormula}`);
                    addAnalysisRow(dashRowIdx + 3, "Proyección 5 Años", `${netBalanceFormula}*60`);
                }

                // --- CHART INTEGRATION (MULTI-TAB) ---
                try {
                    const chartLabels = expenseCats.map(c => c.name);
                    const expenseData = expenseCats.map(c => {
                        if (mode === 'budget' || mode === 'past') return roundVal(getHistory(c.id, 0, false) || 0);
                        // For projection, use same baseline logic as the table
                        const budget = roundVal(currentBudget[c.id] || 0);
                        const cReal = roundVal(getHistory(c.id, 0, false) || 0);
                        const h1 = roundVal(getHistory(c.id, 1, false) || 0);
                        const baseline = cReal > 0 ? cReal : (h1 > 0 ? h1 : budget);
                        return roundVal(baseline * (1 + (window.appState?.projectionGrowthRate || 0.02)));
                    });

                    // 1. Doughnut Chart
                    if (mode === 'budget') {
                        // Keeping only Real Distribution to match "Imagen 1" simplifies the look
                        const d2Base64 = await generateExcelChartImage(chartLabels, expenseData, null, 'doughnut', 'DISTRIBUCIÓN GASTO REAL');
                        const d2Id = workbook.addImage({ base64: d2Base64, extension: 'png' });
                        worksheet.addImage(d2Id, {
                            tl: { col: 15, row: dashRowIdx - 1 },
                            ext: { width: 440, height: 350 }
                        });
                    } else {
                        const distTitle = mode === 'past' ? 'DISTRIBUCIÓN GASTOS (PASADO)' : 'DISTRIBUCIÓN GASTOS (PROYECTADOS)';
                        const dBase64 = await generateExcelChartImage(chartLabels, expenseData, null, 'doughnut', distTitle);
                        const dId = workbook.addImage({ base64: dBase64, extension: 'png' });
                        worksheet.addImage(dId, {
                            tl: { col: lastTableCol + 8, row: dashRowIdx - 1 },
                            ext: { width: 440, height: 350 }
                        });
                    }

                    // 2. Line Comparison Chart (Moved Down Significantly)
                    if (mode === 'budget') {
                        const budgetValues = expenseCats.map(c => roundVal(currentBudget[c.id] || 0));
                        const lBase64 = await generateExcelChartImage(chartLabels, budgetValues, expenseData, 'line', 'COMPARATIVA: PRESUPUESTO VS REAL');
                        const lId = workbook.addImage({ base64: lBase64, extension: 'png' });
                        worksheet.addImage(lId, {
                            tl: { col: 2, row: dashRowIdx + 25 },
                            ext: { width: 1000, height: 500 }
                        });
                    }
                } catch (err) {
                    console.error("Excel Chart Generation Error:", err);
                }

                currentRowIdx += 2;

                // Final Background fill (extended to cover charts)
                for (let r = 1; r <= dashRowIdx + 50; r++) {
                    const row = worksheet.getRow(r);
                    for (let c = 1; c <= 30; c++) if (!row.getCell(c).fill) row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BG_COLOR } };
                }

                // --- DISCLAILER FOOTER ---
                const footerRowIdx = currentRowIdx + 2;
                const footerRow = worksheet.getRow(footerRowIdx);
                const footerCell = footerRow.getCell(2);
                footerCell.value = "NOTA: Este reporte ha sido generado por AUREUS FINANCE AI. Las proyecciones son estimaciones basadas en algoritmos predictivos.";
                footerCell.font = { name: 'Outfit', italic: true, color: { argb: 'FF64748B' }, size: 9 };
                footerCell.alignment = { horizontal: 'center' };
                worksheet.mergeCells(footerRowIdx, 2, footerRowIdx, lastTableCol);
            };

            // --- GENERATE ALL 3 SHEETS ---
            await generateSheet('past', 'Pasado');
            await generateSheet('projection', 'Proyección');
            await generateSheet('budget', 'Presupuesto');

            // --- DOWNLOAD ---
            const buffer = await workbook.xlsx.writeBuffer();
            const fileName = `Aureus_Master_Report_${now.toISOString().slice(0, 10)}.xlsx`;

            // Native browser download replacement for saveAs
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);

            Swal.close();
            Swal.fire({
                icon: 'success', title: 'REPORTE COMPLETADO',
                text: 'Se exportaron las pestañas: Pasado, Proyección y Presupuesto.',
                background: '#0B0D14', color: '#fff', timer: 3000, showConfirmButton: false
            });

        } catch (e) {
            console.error("EXCEL EXPORT ERROR:", e);
            Swal.fire({
                icon: 'error', title: 'Error de Exportación',
                text: 'Falló la generación del reporte: ' + e.message,
                background: '#0B0D14', color: '#fff'
            });
        }
    }
};

