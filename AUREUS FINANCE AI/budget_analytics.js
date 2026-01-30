(function () {
    console.log("🚀 Initializing Budget Analytics...");

    window.renderBudgetTabAnalytics = function () {
        if (!window.appState || !window.appState.transactions) {
            console.warn("⚠️ AppState or Transactions not ready for Budget Analytics.");
            return;
        }

        const now = window.calendarDate || new Date();
        const realToday = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const isCurrentMonth = (currentMonth === realToday.getMonth() && currentYear === realToday.getFullYear());

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = isCurrentMonth ? realToday.getDate() : daysInMonth;
        const daysRemaining = isCurrentMonth ? (daysInMonth - realToday.getDate()) : 0;

        // 1. Calculate Total Budget
        let budgetTotal = 5000; // Default fallback

        // Strategy A: DOM Consistency (Match the bottom card)
        const uiBudgetEl = document.getElementById('b-total-limit');
        if (uiBudgetEl) {
            const txt = uiBudgetEl.innerText.replace(/[^0-9.-]+/g, "");
            const val = parseFloat(txt);
            if (!isNaN(val) && val > 0) budgetTotal = val;
        }

        // Strategy B: AppState (Only if UI element not ready/valid)
        else if (window.appState && window.appState.budget) {
            const b = window.appState.budget;
            if (typeof b === 'number') {
                budgetTotal = b;
            } else if (typeof b === 'object') {
                // Priority: 'Overall' or 'limit' or 'total'
                if (b.Overall !== undefined) budgetTotal = parseFloat(b.Overall);
                else if (b.limit !== undefined) budgetTotal = parseFloat(b.limit);
                else if (b.total !== undefined) budgetTotal = parseFloat(b.total);
                else {
                    // Sum of all categories if no specific total is found
                    budgetTotal = Object.entries(b).reduce((sum, [cat, val]) => {
                        if (cat === 'Overall' || cat === 'limit' || cat === 'total') return sum;
                        return sum + (parseFloat(val) || 0);
                    }, 0);
                }
            }
        }

        // 2. Filter Current Month Expenses (No exclusions as requested)
        const expenses = window.appState.transactions.filter(t => {
            // Use ISO date if available for reliability
            const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date);
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // 3. Prepare Chart Data (Burn-up / Accumulated)
        const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        // Ideal Pace: Linear INCREASE from 0 to budgetTotal
        // Day 1 = (Total / Days) * 1
        const idealData = labels.map(day => {
            return Number(((budgetTotal / daysInMonth) * day).toFixed(2));
        });

        // Actual Spend: Cumulative
        const dailySpend = new Array(daysInMonth + 1).fill(0);
        expenses.forEach(t => {
            const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date);
            const day = d.getDate();
            dailySpend[day] += Math.abs(t.amount);
        });

        let cumulative = 0;
        const actualData = [];
        // Only plot up to today
        for (let i = 1; i <= currentDay; i++) {
            cumulative += dailySpend[i];
            actualData.push(Number(cumulative.toFixed(2)));
        }

        // Calculate Status for Coloring
        const currentActual = actualData[actualData.length - 1] || 0;
        const currentIdeal = idealData[currentDay - 1] || 0;
        const isOverBudget = currentActual > currentIdeal;

        // --- RENDER BURNDOWN (BURN-UP) CHART ---
        const burndownCtx = document.getElementById('budget-tab-burndown-chart');
        if (burndownCtx) {
            const options = {
                series: [
                    { name: 'Límite Ideal', type: 'line', data: idealData },
                    { name: 'Gasto Acumulado', type: 'area', data: actualData }
                ],
                chart: {
                    type: 'line',
                    height: '100%',
                    toolbar: { show: false },
                    background: 'transparent',
                    animations: { enabled: false } // Keep false for burndown to avoid heavy repaints
                },
                colors: ['#475569', isOverBudget ? '#ff3333' : '#6366f1'],
                stroke: { width: [2, 4], dashArray: [5, 0], curve: 'monotoneCubic' },
                fill: {
                    type: 'solid',
                    opacity: [1, 0.3]
                },
                xaxis: {
                    categories: labels,
                    axisBorder: { show: false }, axisTicks: { show: false },
                    labels: {
                        offsetY: -15,
                        style: { colors: '#64748b', fontSize: '10px', fontFamily: 'Inter' }
                    }
                },
                yaxis: { show: false },
                grid: { show: false, padding: { top: 0, bottom: 20 } },
                legend: { show: false, position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
                tooltip: {
                    theme: 'dark',
                    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                        const ideal = series[0][dataPointIndex];
                        const actual = series[1][dataPointIndex];

                        // Robust Date Calculation
                        // We use the day number from the label and the captured currentMonth/Year
                        const dayNum = parseInt(w.globals.labels[dataPointIndex]);
                        const dateObj = new Date(currentYear, currentMonth, dayNum);

                        const monthNames = [
                            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                        ];

                        // Format: "6 de Diciembre"
                        const dateHeader = `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`;

                        const fmt = (val) => window.formatCurrency ? window.formatCurrency(val) : '$' + val.toFixed(2);

                        // Internal Focus Map for Tooltip Calculation
                        const tMap = {
                            'Housing': 'Needs', 'Groceries': 'Needs', 'Transport': 'Needs', 'Health': 'Needs', 'Education': 'Needs', 'Utilities': 'Needs', 'Gas': 'Needs',
                            'Food': 'Wants', 'Shopping': 'Wants', 'Entertainment': 'Wants', 'Travel': 'Wants', 'Personal': 'Wants', 'Love': 'Wants', 'Others': 'Wants',
                            'Savings': 'Saving', 'Emergency Fund': 'Saving',
                            'Investment': 'Investment', 'Stocks': 'Investment', 'Crypto': 'Investment',
                            'Waste': 'Waste', 'Alcohol': 'Waste', 'Gambling': 'Waste', 'Beer': 'Waste', 'Junk Food': 'Waste'
                        };

                        // Calculate Breakdown for Cumulative "Real" (up to this day)
                        const breakdown = { 'Needs': 0, 'Wants': 0, 'Saving': 0, 'Investment': 0, 'Waste': 0 };
                        if (actual > 0 && typeof expenses !== 'undefined') {
                            expenses.forEach(t => {
                                // Filter: Date <= selected Day
                                const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date);
                                if (d.getDate() <= dayNum) {
                                    const cat = t.category || 'Wants';
                                    let focus = tMap[cat] || 'Wants';
                                    const desc = (t.description || '').toLowerCase();
                                    if (desc.includes('uber') || desc.includes('taxi')) focus = 'Wants';

                                    // Normalize
                                    if (focus === 'Invest') focus = 'Investment';

                                    // Add to breakdown
                                    if (breakdown[focus] !== undefined) {
                                        breakdown[focus] += Math.abs(t.amount);
                                    }
                                }
                            });
                        }

                        let html = `
                             <div class="px-3 py-3 bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl min-w-[200px]">
                                 <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                     <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${dateHeader}</h4>
                                     <span class="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Acumulado</span>
                                 </div>
                                 <div class="space-y-1">
                                     <div class="flex items-center justify-between gap-6">
                                         <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span><span class="text-[10px] font-bold text-slate-400 uppercase">Ideal</span></div>
                                         <span class="text-xs font-mono font-bold text-slate-500 maskable">${fmt(ideal)}</span>
                                     </div>`;

                        if (actual !== undefined && actual !== null) {
                            const diff = actual - ideal;
                            const isOver = diff > 0;
                            html += `
                                     <div class="flex items-center justify-between gap-6">
                                         <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"></div><span class="text-[10px] font-bold text-white uppercase">Real</span></div>
                                         <span class="text-xs font-mono font-bold text-white maskable">${fmt(actual)}</span>
                                     </div>
                                     
                                     <!-- Breakdown Bars -->
                                     <div class="my-2 pt-2 border-t border-white/5 space-y-1.5">
                            `;

                            // Generate Breakdown Bars
                            const cats = ['Needs', 'Wants', 'Saving', 'Investment', 'Waste'];
                            let hasBreakdown = false;

                            cats.forEach(c => {
                                const val = breakdown[c];
                                if (val > 0) {
                                    hasBreakdown = true;
                                    const pct = Math.round((val / actual) * 100);

                                    let color = 'text-slate-500'; let bg = 'bg-slate-500';
                                    if (c === 'Needs') { color = 'text-indigo-400'; bg = 'bg-indigo-500'; }
                                    if (c === 'Wants') { color = 'text-pink-400'; bg = 'bg-pink-500'; }
                                    if (c === 'Saving') { color = 'text-emerald-400'; bg = 'bg-emerald-500'; }
                                    if (c === 'Investment') { color = 'text-amber-400'; bg = 'bg-amber-500'; }
                                    if (c === 'Waste') { color = 'text-red-400'; bg = 'bg-red-500'; }

                                    html += `
                                    <div class="flex items-center justify-between gap-3">
                                        <div class="flex items-center gap-1.5 w-16">
                                            <div class="w-0.5 h-2 rounded-full ${bg}"></div>
                                            <span class="text-[9px] font-bold ${color} uppercase truncate">${c}</span>
                                        </div>
                                        <div class="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div class="h-full ${bg} opacity-80" style="width: ${pct}%"></div>
                                        </div>
                                        <div class="w-8 text-right">
                                            <span class="text-[9px] font-mono text-slate-400">${pct}%</span>
                                        </div>
                                    </div>`;
                                }
                            });

                            if (!hasBreakdown) {
                                html += `<div class="text-[9px] text-slate-600 italic text-center py-1">No details</div>`;
                            }

                            html += `</div>`; // End breakdown container

                            html += `
                                     <div class="flex items-center justify-between gap-6 pt-2 border-t border-white/5">
                                         <span class="text-[10px] text-slate-500 uppercase font-bold">Diferencia</span>
                                         <span class="text-xs font-mono font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'} maskable">${diff > 0 ? '+' : ''}${fmt(diff)}</span>
                                     </div>`;
                        }
                        html += `</div></div>`;
                        return html;
                    }
                }
            };

            if (window._burndownChart) {
                window._burndownChart.updateOptions({
                    colors: ['#475569', isOverBudget ? '#ff3333' : '#6366f1'],
                    fill: { type: 'solid', opacity: [1, 0.3] }
                });
                window._burndownChart.updateSeries([
                    { name: 'Límite Ideal', data: idealData },
                    { name: 'Gasto Acumulado', data: actualData }
                ]);
            } else {
                burndownCtx.innerHTML = '';
                window._burndownChart = new ApexCharts(burndownCtx, options);
                window._burndownChart.render();
            }

            // Render Badge (Keeping existing badge logic)
            const badge = document.getElementById('budget-tab-burndown-badge');
            if (badge) {
                badge.innerText = isOverBudget ? 'OVER LIMIT' : 'ON TRACK';
                badge.className = `text-[10px] font-black uppercase tracking-[0.15em] font-sans ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`;
                const badgeContainer = badge.parentElement;
                if (badgeContainer) {
                    badgeContainer.className = `flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.15)] group transition-all duration-300 ${isOverBudget ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`;
                    const dot = badgeContainer.querySelector('span.rounded-full:not(.animate-ping)');
                    const ping = badgeContainer.querySelector('span.animate-ping');
                    if (dot) dot.className = `relative inline-flex rounded-full h-2 w-2 shadow-[0_0_8px_rgba(0,0,0,0.8)] ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`;
                    if (ping) ping.className = `animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOverBudget ? 'bg-rose-400' : 'bg-emerald-400'}`;
                }
            }
        }

        // --- FORECAST WIDGET & HEALTH SCORE (Skipping internal logic updates for brevity, they are fine) ---
        // ... (existing code for calculation) ...

        // --- 4. HEALTH CHART & AVAILABLE BALANCE ---
        // Unified rendering for both Dashboard and Budget tab
        const dashboardHealthEl = document.getElementById('dashboardHealthChart');
        const budgetHealthEl = document.getElementById('budgetHealthChart');
        const remainingEl = document.getElementById('b-total-remaining');
        let healthScore = 100;

        // Calculate Remaining
        const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const remaining = Math.max(0, budgetTotal - totalSpent);

        // Update ALL remaining balance elements (Dashboard and Budget tab)
        const allRemainingEls = document.querySelectorAll('#b-total-remaining');
        allRemainingEls.forEach(el => {
            const fmt = window.formatCurrency || ((v) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
            el.innerText = fmt(remaining);
            el.className = `text-3xl font-black tracking-tighter drop-shadow-lg transition-colors ${remaining < (budgetTotal * 0.2) ? 'text-rose-400' : 'text-white'}`;
            // Fix text color for light mode if not red
            if (remaining >= (budgetTotal * 0.2) && !document.documentElement.classList.contains('dark')) {
                el.classList.remove('text-white');
                el.style.color = '#0f172a';
            }
        });

        // Calculate Health Score as Remaining Budget % (Fuel Gauge)
        if (budgetTotal > 0) {
            healthScore = Math.round((remaining / budgetTotal) * 100);
        } else {
            healthScore = totalSpent > 0 ? 0 : 100;
        }
        healthScore = Math.max(0, Math.min(100, healthScore));

        // Dynamic Color
        const healthColor = healthScore < 25 ? '#ef4444' : (healthScore < 50 ? '#f59e0b' : '#6366f1');

        // Theme Support
        const theme = window.getThemeColors ? window.getThemeColors() : { textBold: '#fff', grid: 'rgba(255,255,255,0.05)' };
        const isDark = document.documentElement.classList.contains('dark');
        const trackColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

        // Shared chart options generator
        const createHealthOptions = (chartHeight = 280) => ({
            series: [healthScore],
            chart: {
                type: 'radialBar',
                height: chartHeight,
                offsetY: -20,
                sparkline: { enabled: true },
                fontFamily: 'Instrument Sans, sans-serif',
                animations: { enabled: true, easing: 'easeinout', speed: 800, animateGradually: { enabled: true, delay: 150 }, dynamicAnimation: { enabled: true, speed: 350 } }
            },
            plotOptions: {
                radialBar: {
                    startAngle: -90,
                    endAngle: 90,
                    track: {
                        background: trackColor,
                        strokeWidth: '100%',
                        margin: 0,
                    },
                    dataLabels: {
                        name: { show: false },
                        value: {
                            offsetY: -2,
                            fontSize: '42px',
                            fontWeight: '800',
                            color: theme.textBold,
                            fontFamily: 'Instrument Sans, sans-serif',
                            formatter: function (val) { return val + "%"; }
                        }
                    },
                    hollow: { size: '65%' }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'horizontal',
                    gradientToColors: [healthColor === '#6366f1' ? '#a855f7' : healthColor],
                    stops: [0, 100]
                }
            },
            colors: [healthColor],
            stroke: { lineCap: 'round' },
        });

        // Helper function to render or update a health chart
        const renderHealthChart = (container, chartKey, chartHeight = 280) => {
            if (!container) return false;

            const isVisible = container.offsetParent !== null && container.clientHeight > 0;
            if (!isVisible) return false;

            const options = createHealthOptions(chartHeight);

            if (window[chartKey]) {
                try {
                    window[chartKey].updateSeries([healthScore]);
                    window[chartKey].updateOptions({
                        colors: [healthColor],
                        fill: { gradient: { gradientToColors: [healthColor === '#6366f1' ? '#a855f7' : healthColor] } },
                        plotOptions: { radialBar: { dataLabels: { value: { color: theme.textBold } }, track: { background: trackColor } } }
                    });
                } catch (e) {
                    console.warn('Error updating chart:', e);
                }
            } else {
                container.innerHTML = '';
                window[chartKey] = new ApexCharts(container, options);
                window[chartKey].render();
            }
            return true;
        };

        // Render Dashboard Health Chart
        renderHealthChart(dashboardHealthEl, '_dashboardHealthChart', 280);

        // Render Budget Tab Health Chart (or save pending data)
        const budgetChartRendered = renderHealthChart(budgetHealthEl, '_budgetHealthChart', 240);

        if (!budgetChartRendered && budgetHealthEl) {
            // Budget tab is not visible, save data for later rendering
            window.pendingHealthChartData = {
                gaugeVal: healthScore, // Map healthScore to gaugeVal
                healthScore,
                finalStartColor: healthColor,
                finalEndColor: healthColor === '#6366f1' ? '#a855f7' : healthColor,
                options: createHealthOptions(240), // ADDED: Pre-generate options
                healthColor,
                theme,
                trackColor,
                remaining,
                budgetTotal
            };
        } else if (budgetChartRendered) {
            // Clear pending data since chart was rendered
            window.pendingHealthChartData = null;
        }


        // --- 5. FOCUS BREAKDOWN STATS (Distribución del Gasto) ---
        // Ids: bar-focus-[needs, wants, saving, investment, waste]
        //      val-focus-[needs, wants, saving, investment, waste]

        const focusMap = {
            'Housing': 'Needs', 'Groceries': 'Needs', 'Transport': 'Needs', 'Health': 'Needs', 'Education': 'Needs', 'Utilities': 'Needs', 'Gas': 'Needs',
            'Food': 'Wants', 'Shopping': 'Wants', 'Entertainment': 'Wants', 'Travel': 'Wants', 'Personal': 'Wants', 'Love': 'Wants', 'Others': 'Wants',
            'Savings': 'Saving', 'Emergency Fund': 'Saving',
            'Investment': 'Investment', 'Stocks': 'Investment', 'Crypto': 'Investment',
            'Waste': 'Waste', 'Alcohol': 'Waste', 'Gambling': 'Waste', 'Beer': 'Waste', 'Junk Food': 'Waste'
        };
        const focusTotals = { 'Needs': 0, 'Wants': 0, 'Saving': 0, 'Investment': 0, 'Waste': 0 };

        expenses.forEach(t => {
            const cat = t.category || 'Wants';
            // Prioritize manual tag, then map, then default
            let focus = t.budgetFocus || focusMap[cat] || 'Wants';

            // Manual overrides from description (legacy support, lower priority than explicit tag?)
            // If explicit tag exists (budgetFocus), skip this.
            if (!t.budgetFocus) {
                const desc = (t.description || '').toLowerCase();
                if (desc.includes('uber') || desc.includes('taxi')) focus = 'Wants';
            }

            // Normalize
            if (focus === 'Invest') focus = 'Investment';
            if (focus === 'Save') focus = 'Saving';

            if (focusTotals[focus] !== undefined) {
                focusTotals[focus] += Math.abs(t.amount);
            }
        });

        // Calculate Totals for %
        // Note: We use 'totalSpent' as denominator, or budgetTotal? usually totalSpent for distribution.
        const distribBase = totalSpent > 0 ? totalSpent : 1;

        Object.keys(focusTotals).forEach(key => {
            const domKey = key.toLowerCase(); // needs, wants, saving, investment, waste
            const val = focusTotals[key];
            const pct = Math.round((val / distribBase) * 100);

            const barEl = document.getElementById(`bar-focus-${domKey}`);
            const valEl = document.getElementById(`val-focus-${domKey}`);

            if (barEl) barEl.style.width = `${pct}%`;
            if (valEl) valEl.innerText = `${pct}%`;
        });

        // --- 6. TOP OFFENDERS list (Top 5 Expenses by Category) ---
        const offendersList = document.getElementById('wallet-offenders-list');
        if (offendersList) {
            // Group Expenses by Category
            const categorySpend = {};
            expenses.forEach(t => {
                const cat = t.category || 'Otros';
                if (cat === 'Manual Adjustment') return; // Exclude Manual Adjustment
                if (!categorySpend[cat]) categorySpend[cat] = 0;
                categorySpend[cat] += Math.abs(t.amount); // Ensure positive
            });

            // Convert to Array and Sort Descending
            const sortedOffenders = Object.entries(categorySpend)
                .map(([cat, total]) => ({ cat, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5); // Take Top 5

            if (sortedOffenders.length === 0) {
                offendersList.innerHTML = '<div class="text-center text-slate-500 text-xs py-8 italic">No expenses yet this month!</div>';
            } else {
                offendersList.innerHTML = sortedOffenders.map((item, index) => {
                    // Check Budget Limit for this Category
                    const budgetLimit = (window.appState.budget && window.appState.budget[item.cat]) ? parseFloat(window.appState.budget[item.cat]) : 0;
                    const hasLimit = budgetLimit > 0;
                    const remaining = hasLimit ? budgetLimit - item.total : 0;
                    const isOver = hasLimit && remaining < 0;
                    const format = window.formatCurrency || ((v) => '$' + v.toFixed(2));

                    // Calculated values
                    const percentUsed = hasLimit ? Math.min((item.total / budgetLimit) * 100, 100) : 0;

                    // Styling logic
                    const statusColor = isOver ? 'text-red-400' : 'text-emerald-400';
                    const barColor = isOver ? 'bg-red-500' : 'bg-emerald-500';

                    // Text Labels
                    let statusText = 'No limit set';
                    if (hasLimit) {
                        statusText = isOver
                            ? `Over by ${format(Math.abs(remaining))}`
                            : `${format(remaining)} left`;
                    }
                    const percentText = hasLimit ? `${Math.round((item.total / budgetLimit) * 100)}%` : 'N/A';

                    return `
                        <div class="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition group relative overflow-hidden">
                            <!-- Background Hue (Subtle) -->
                             ${isOver ? '<div class="absolute inset-0 bg-red-500/5 pointer-events-none"></div>' : ''}

                            <div class="relative z-10">
                                <!-- Row 1: Header -->
                                <div class="flex justify-between items-center mb-2">
                                    <div class="flex items-center gap-2">
                                        <!-- Rank Badge -->
                                        <div class="w-5 h-5 rounded-full bg-dark-900 border border-white/10 flex items-center justify-center text-[9px] font-bold text-slate-400">
                                            ${index + 1}
                                        </div>
                                        <!-- Name -->
                                        <span class="text-xs font-bold text-white tracking-wide">${item.cat}</span>
                                    </div>
                                    <span class="text-xs font-black text-white font-mono maskable">${format(item.total)}</span>
                                </div>

                                <!-- Row 2: Progress Bar -->
                                <div class="h-1.5 w-full bg-dark-900 rounded-full overflow-hidden shadow-inner">
                                    <div class="h-full ${hasLimit ? barColor : 'bg-slate-700'} rounded-full transition-all duration-500" style="width: ${hasLimit ? percentUsed + '%' : '0%'}"></div>
                                </div>

                                <!-- Row 3: Footer Stats -->
                                <div class="flex justify-between items-center mt-1.5 px-0.5">
                                    <span class="text-[9px] font-bold uppercase tracking-wider ${hasLimit ? statusColor : 'text-slate-500'}">
                                        ${statusText}
                                    </span>
                                    <span class="text-[9px] font-bold text-slate-500">
                                        ${percentText}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    };

    // Polling & Hooks
    setTimeout(window.renderBudgetTabAnalytics, 500);
    setInterval(window.renderBudgetTabAnalytics, 5000);

    // Attempt to hook global render
    const originalRender = window.renderBudgetTab;
    if (originalRender) {
        window.renderBudgetTab = function () {
            originalRender();
            setTimeout(window.renderBudgetTabAnalytics, 100);
        }
    } else {
        // Fallback: If no original render exists, use our analytics one as the main one
        window.renderBudgetTab = window.renderBudgetTabAnalytics;
    }
})();

// --- DASHBOARD CALENDAR LOGIC (Added) ---
(function () {
    let currentDashDate = new Date();

    window.changeDashboardMonth = function (delta) {
        currentDashDate.setMonth(currentDashDate.getMonth() + delta);
        if (typeof renderDashboardCalendar === 'function') renderDashboardCalendar();
    };

    window.renderDashboardCalendar = function () {
        // Elements
        const titleEl = document.getElementById('dash-cal-month-title');
        const gridEl = document.getElementById('dash-cal-grid');
        // Support both IDs
        const currentEl = document.getElementById('dash-cal-current-date') || document.getElementById('dash-cal-current-date-short');

        if (!titleEl || !gridEl) return;

        const year = currentDashDate.getFullYear();
        const month = currentDashDate.getMonth();
        const today = new Date();

        // Title: "Diciembre de 2025" (Capitalized)
        let monthName = currentDashDate.toLocaleString('es-ES', { month: 'long' });
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        titleEl.innerText = `${monthName} de ${year}`;

        if (currentEl) {
            let fullDate = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            fullDate = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);
            currentEl.innerText = fullDate;
        }

        // Logic
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';

        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            html += `<div></div>`;
        }

        // Transactions Map (Simple Daily Aggregation)
        const dailyData = {};
        if (window.appState && window.appState.transactions) {
            window.appState.transactions.forEach(t => {
                // Try to parse flexible date formats
                let d = null;
                if (t.dateIso) d = new Date(t.dateIso);
                else if (t.id && !isNaN(new Date(t.id).getTime())) d = new Date(t.id);
                else d = new Date(t.date);

                if (d && !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year) {
                    const day = d.getDate();
                    if (!dailyData[day]) dailyData[day] = { expense: 0, income: 0, hasTx: false };

                    if (t.type === 'expense') {
                        dailyData[day].expense += Math.abs(t.amount);
                    } else if (t.type === 'income') {
                        dailyData[day].income += Math.abs(t.amount);
                        dailyData[day].hasTx = true;
                    } else {
                        dailyData[day].hasTx = true;
                    }
                }
            });
        }

        // Render Days
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const dayData = dailyData[d] || { expense: 0, income: 0, hasTx: false };
            const spend = dayData.expense;
            const income = dayData.income;
            const hasTx = dayData.hasTx;

            let dot = '<span class="w-1 h-1 rounded-full bg-slate-800"></span>'; // Default empty

            // Colors matching the legend
            if (spend > 150) {
                dot = '<span class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>';
            } else if (spend > 50) {
                dot = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"></span>';
            } else if (spend > 0 || hasTx || income > 0) {
                dot = '<span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"></span>';
            }

            const isFuture = (year > today.getFullYear()) || (year === today.getFullYear() && month > today.getMonth()) ||
                (year === today.getFullYear() && month === today.getMonth() && d > today.getDate());

            // Reminders Logic
            if (window.appState && !window.appState.reminders) {
                window.appState.reminders = [];
            }
            const dayReminders = (window.appState && window.appState.reminders ? window.appState.reminders : []).filter(r => r.day === d);
            let finalDotHtml = !isFuture ? dot : '<span class="w-1.5 h-1.5"></span>';

            if (dayReminders.length > 0) {
                const remDot = '<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"></span>';
                if (dot.includes('bg-slate-800') || isFuture) {
                    finalDotHtml = remDot; // Just reminder
                } else {
                    finalDotHtml = `<div class="flex gap-1 items-center">${dot}${remDot}</div>`; // Both
                }
            }

            let dayClass = "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-slate-400 transition-all duration-300 relative z-10";

            if (isToday) {
                dayClass = "w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center text-[10px] scale-110 ring-2 ring-indigo-500/20";
            } else if (!isFuture) {
                dayClass += " hover:bg-white/10 hover:text-white hover:scale-110 group-hover:bg-white/5";
            } else {
                dayClass += " opacity-30 cursor-default";
            }
            // Allow hover on future if it has reminders
            if (isFuture && dayReminders.length > 0) {
                dayClass = dayClass.replace("opacity-30 cursor-default", "hover:bg-white/10 hover:text-white cursor-pointer opacity-70");
            }

            // Date Formatting for Tooltip
            const dateObj = new Date(year, month, d);
            const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
            const dayNameCap = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            const dateHeader = `${dayNameCap} ${d}`;

            // Tooltip Positioning Logic
            const dayOfWeek = (firstDay + d - 1) % 7; // 0=Sun, 6=Sat
            let tooltipPos = "left-1/2 -translate-x-1/2"; // Default Center
            let arrowPos = "left-1/2 -translate-x-1/2";

            // Horizontal Logic
            let xClass = "left-1/2 -translate-x-1/2";
            let arrowXClass = "left-1/2 -translate-x-1/2";
            if (dayOfWeek === 0) { xClass = "left-0 translate-x-0"; arrowXClass = "left-3"; }
            else if (dayOfWeek === 6) { xClass = "right-0 translate-x-0"; arrowXClass = "right-3"; }

            // Vertical Logic (Flip if top 2 rows)
            const rowIndex = Math.floor((firstDay + d - 1) / 7);
            let yClass = "bottom-full mb-3";
            let arrowYClass = "-bottom-1 border-r border-b";

            if (rowIndex < 2) {
                yClass = "top-full mt-3";
                arrowYClass = "-top-1 border-l border-t";
            }

            const showTooltip = spend > 0 || income > 0 || dayReminders.length > 0;
            const tooltipContent = `
                <div class="absolute ${yClass} ${xClass} hidden group-hover:block z-50 min-w-[160px] max-w-[220px]">
                    <div class="bg-[#1a1c23] border border-white/10 rounded-xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
                        <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                            <span class="text-xs font-bold text-slate-300 uppercase">${dateHeader}</span>
                        </div>
                        <div class="flex flex-col gap-2">
                             ${dayReminders.length > 0 ? `
                            <div class="pb-2 mb-2 border-b border-white/5 space-y-1">
                                <span class="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">Recordatorios</span>
                                ${dayReminders.map(r => `
                                <div onclick="window.editMonthlyReminder('${r.id}')" class="flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 p-1 rounded transition group/item">
                                    <span class="text-[10px] text-slate-300 group-hover/item:text-white transition-colors underline decoration-dotted decoration-cyan-500/50">${r.title}</span>
                                    <span class="text-[10px] font-mono font-bold text-white">${window.formatCurrency(r.amount)}</span>
                                </div>
                                `).join('')}
                            </div>` : ''}

                            ${income > 0 ? `
                            <div class="flex items-center justify-between gap-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></div>
                                    <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ingresos</span>
                                </div>
                                <span class="text-xs font-mono font-bold text-white">${window.formatCurrency(income)}</span>
                            </div>` : ''}
                            ${spend > 0 ? `
                            <div class="flex items-center justify-between gap-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></div>
                                    <span class="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Gastos</span>
                                </div>
                                <span class="text-xs font-mono font-bold text-white">${window.formatCurrency(spend)}</span>
                            </div>` : ''}
                        </div>
                         <!-- Arrow -->
                        <div class="absolute ${arrowYClass} ${arrowXClass} w-2 h-2 bg-[#1a1c23] border-white/10 rotate-45"></div>
                    </div>
                </div>
            `;

            html += `
            <div class="flex flex-col items-center gap-0.5 py-0.5 relative group cursor-pointer">
                <div class="${dayClass}">
                    ${d}
                </div>
                ${finalDotHtml}
                ${showTooltip ? tooltipContent : ''}
            </div>
            `;
        }
        gridEl.innerHTML = html;
    };

    // Init & refresh
    setTimeout(() => {
        if (window.renderDashboardCalendar) window.renderDashboardCalendar();
        if (window.renderComparativaMensual) window.renderComparativaMensual();
    }, 1000);
    setInterval(() => {
        if (window.renderDashboardCalendar) window.renderDashboardCalendar();
        if (window.renderComparativaMensual) window.renderComparativaMensual();
    }, 5000);
})();

// --- NEW: INCOME VS EXPENSES CHART (Replaces Comparativa Mensual) ---
// Global function to be called by HTML buttons
window.renderIncomeExpenseChart = function (range) {
    // 1. Resolve Range (Argument -> State -> Default '1M')
    if (range) {
        window.currentChartRange = range; // User explicit click or specific call
    } else {
        range = window.currentChartRange || '1M'; // Auto-refresh fallback
    }

    const el = document.getElementById('budgetComparisonChart');
    if (!el) return;

    // UPDATE BUTTON STATES
    const btns = document.querySelectorAll(`button[onclick^="renderIncomeExpenseChart"]`);
    btns.forEach(b => {
        b.className = "px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-white rounded-md transition-colors";
        if (b.innerText === range) {
            b.className = "px-3 py-1 text-[10px] font-bold text-white bg-white/10 rounded-md shadow-sm transition-colors";
        }
    });

    // 1. CALCULATE DATE RANGE
    const now = new Date();
    let startDate = new Date();
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    let type = 'area'; // Default
    let granularity = 'day';

    if (range === '1S') { // 1 Week
        startDate.setDate(now.getDate() - 6);
        granularity = 'day';
    } else if (range === '2S') { // 2 Weeks (Half Month)
        startDate.setDate(now.getDate() - 14);
        granularity = 'day';
    } else if (range === '1M') { // 1 Month
        startDate.setDate(now.getDate() - 29);
        granularity = 'day';
    } else if (range === '3M') { // 3 Months
        startDate.setMonth(now.getMonth() - 2);
        startDate.setDate(1); // Start of month
        granularity = 'month';
    } else if (range === '1A') { // 1 Year
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setDate(1);
        granularity = 'month';
    }

    startDate.setHours(0, 0, 0, 0);

    // 2. PREPARE DATA CONTAINERS
    // Generate all buckets (days or months) between startDate and now
    const buckets = [];
    let currentIter = new Date(startDate);
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    while (currentIter <= now) {
        let key, label;
        if (granularity === 'day') {
            key = currentIter.toISOString().split('T')[0]; // YYYY-MM-DD
            label = `${currentIter.getDate()} ${monthNames[currentIter.getMonth()]}`;
        } else {
            key = `${currentIter.getFullYear()}-${currentIter.getMonth()}`; // YYYY-MM
            label = `${monthNames[currentIter.getMonth()]} ${currentIter.getFullYear().toString().substr(2)}`;
        }
        buckets.push({ key, label, income: 0, expense: 0, date: new Date(currentIter) });

        // Increment
        if (granularity === 'day') currentIter.setDate(currentIter.getDate() + 1);
        else currentIter.setMonth(currentIter.getMonth() + 1);
    }

    // 3. FILL DATA FROM TRANSACTIONS
    if (window.appState && window.appState.transactions) {
        window.appState.transactions.forEach(t => {
            const d = new Date(t.dateIso || t.id || t.date);
            if (d < startDate) return;

            // Generate Key
            let key;
            if (granularity === 'day') key = d.toISOString().split('T')[0];
            else key = `${d.getFullYear()}-${d.getMonth()}`;

            // Find bucket
            const bucket = buckets.find(b => b.key === key);
            if (bucket) {
                const amt = Math.abs(parseFloat(t.amount) || 0);
                if (t.type === 'income') bucket.income += amt;
                else if (t.type === 'expense') bucket.expense += amt;
            }
        });
    }

    // 4. CALCULATE SUMS
    let totalIncome = buckets.reduce((sum, b) => sum + b.income, 0);
    const totalExpense = buckets.reduce((sum, b) => sum + b.expense, 0);

    // 4.5 BUDGET OVERRIDE (User Request: Show Budget Goal in Dashboard)
    // Use the Target Budget for 'Ingresos' to provide a fixed benchmark for comparison
    let monthlyBudgetGoal = 11000;
    if (window.appState && window.appState.budget && window.appState.budget.limit) {
        monthlyBudgetGoal = window.appState.budget.limit;
    }

    if (range === '1S') totalIncome = monthlyBudgetGoal / 4.33;
    else if (range === '2S') totalIncome = monthlyBudgetGoal / 2.16;
    else if (range === '1M') totalIncome = monthlyBudgetGoal;
    else if (range === '3M') totalIncome = monthlyBudgetGoal * 3;

    // 5. CHART OPTIONS (Horizontal Bar Style per Image 1)
    const theme = window.getThemeColors ? window.getThemeColors() : { text: '#94a3b8', grid: 'rgba(255,255,255,0.05)', tooltipBg: '#0f172a', tooltipText: '#fff' };

    // Fix Spacing
    if (el.previousElementSibling && el.previousElementSibling.classList.contains('mb-6')) {
        el.previousElementSibling.classList.replace('mb-6', 'mb-1');
    }

    const options = {
        series: [{
            data: [
                { x: 'INGRESOS', y: totalIncome, fillColor: '#10b981' },
                { x: 'GASTOS', y: totalExpense, fillColor: '#f43f5e' }
            ]
        }],
        chart: {
            type: 'bar',
            height: 140,
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '40%',
                borderRadius: 8,
                distributed: true,
                dataLabels: { position: 'top' }
            }
        },
        colors: ['#10b981', '#f43f5e'],
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#fff'],
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900
            },
            formatter: function (val, opt) {
                return window.formatCurrency(val);
            },
            offsetX: 0
        },
        xaxis: {
            categories: ['INGRESOS', 'GASTOS'],
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#64748b',
                    fontSize: '10px',
                    fontWeight: 800,
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        grid: { show: false },
        legend: { show: false },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val) {
                    return window.formatCurrency(val);
                }
            }
        }
    };

    el.innerHTML = '';
    const chart = new ApexCharts(el, options);
    chart.render();
};

// Compatibility Alias (keeps the old name for auto-initializers)
window.renderComparativaMensual = function () {
    window.renderIncomeExpenseChart(); // Uses stored range or defaults to 1M
};

// Initial Auto-Render
(function () {
    setTimeout(() => {
        if (window.renderIncomeExpenseChart) window.renderIncomeExpenseChart(); // Uses stored range or defaults to 1M
    }, 5000); // 5 sec delay to ensure transactions loaded
})();


// --- BUDGET CALENDAR LOGIC (Mirrors Dashboard Calendar) ---
(function () {
    let currentBudgetMonthDate = new Date();

    window.changeBudgetMonth = function (delta) {
        currentBudgetMonthDate.setMonth(currentBudgetMonthDate.getMonth() + delta);
        if (typeof renderBudgetCalendar === 'function') renderBudgetCalendar();
    };

    window.renderBudgetCalendar = function () {
        // Target specific BUDGET tab elements
        const titleEl = document.getElementById('budget-cal-month-title');
        const gridEl = document.getElementById('budget-cal-grid');
        const currentEl = document.getElementById('budget-cal-current-date');

        if (!titleEl || !gridEl) return;

        const year = currentBudgetMonthDate.getFullYear();
        const month = currentBudgetMonthDate.getMonth();
        const today = new Date();

        // Title: "Diciembre De 2025"
        let monthName = currentBudgetMonthDate.toLocaleString('es-ES', { month: 'long' });
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        titleEl.innerText = `${monthName} De ${year}`;

        // Current Date Display
        if (currentEl) {
            let fullDate = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            fullDate = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);
            currentEl.innerText = fullDate;
        }

        // 1. Calculate Calendar Days
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();



        // --- Reminders Integration ---
        const reminders = window.appState.reminders || [];

        // (Button moved to static HTML in index.html footer as per user request)

        // 2. Aggregate Data
        const dailyData = {};
        if (window.appState && window.appState.transactions) {
            window.appState.transactions.forEach(t => {
                const d = new Date(t.dateIso || t.date);
                if (d.getMonth() === month && d.getFullYear() === year) {
                    const day = d.getDate();
                    if (!dailyData[day]) dailyData[day] = { expense: 0, income: 0, count: 0 };
                    if (t.type === 'expense') dailyData[day].expense += Math.abs(t.amount);
                    else if (t.type === 'income') dailyData[day].income += Math.abs(t.amount);
                    dailyData[day].count++;
                }
            });
        }

        let html = '';

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            html += `<div></div>`; // Empty grid cell
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const data = dailyData[d] || { expense: 0, income: 0, count: 0 };
            const { expense, income } = data;

            // Check Reminders for this day
            // Reminders recur every month, so we match based on 'day' field
            const dayReminders = reminders.filter(r => r.day === d);
            const hasReminders = dayReminders.length > 0;

            // Cell Content Logic
            const isFuture = (new Date(year, month, d) > today);
            const showData = !isFuture && (expense > 0 || income > 0);

            // Layout: Box with metrics
            let cellClass = "min-h-[70px] rounded-xl flex flex-col items-start justify-start p-2 transition-all duration-300 relative border border-transparent group"; // Added group for hover

            if (isToday) {
                cellClass += " bg-white/5 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]";
            } else if (showData || hasReminders) {
                // Reminders also trigger "active" look but maybe different style?
                // Let's keep dark style but maybe add a border if reminder exists?
                cellClass += " bg-[#13151b] border-white/5 hover:bg-[#1a1d26]";
            } else {
                cellClass += " text-slate-600 opacity-60";
            }

            // Day Number Style
            let dayNumClass = "text-[10px] font-bold mb-1.5 flex justify-between w-full";
            let dayContent = `<span>${d}</span>`;

            // Indicator for Reminder
            if (hasReminders) {
                dayContent += `<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse"></span>`;
            }

            if (isToday) dayNumClass += " text-indigo-400";
            else if (showData || hasReminders) dayNumClass += " text-slate-400";
            else dayNumClass += " text-slate-700";

            /* Inline Data Block */
            let dataHtml = '';

            // 1. Transaction Data
            if (showData) {
                if (income > 0) {
                    dataHtml += `
                        <div class="w-full mt-0.5">
                            <span class="hidden lg:inline text-[9px] font-bold text-emerald-500 uppercase mr-1">In</span>
                            <span class="text-[9px] font-mono font-bold text-emerald-400 lg:text-slate-200 block lg:inline truncate">${window.formatCurrency(income)}</span>
                        </div>`;
                }
                if (expense > 0) {
                    dataHtml += `
                        <div class="w-full mt-0.5">
                            <span class="hidden lg:inline text-[9px] font-bold text-rose-500 uppercase mr-1">Out</span>
                            <span class="text-[9px] font-mono font-bold text-rose-400 lg:text-slate-200 block lg:inline truncate">${window.formatCurrency(expense)}</span>
                        </div>`;
                }
            }

            // 2. Reminder Data (Visual Text in Cell OR Tooltip)
            // Showing first reminder title if space allows, or just a generic label
            if (hasReminders) {
                dayReminders.forEach(r => {
                    dataHtml += `
                        <div onclick="window.editMonthlyReminder('${r.id}')" class="w-full mt-1 pt-1 border-t border-white/5 cursor-pointer hover:bg-white/5 transition rounded px-1 group/rem">
                            <p class="text-[8px] font-bold text-cyan-400 uppercase truncate leading-tight group-hover/rem:text-cyan-300 underline decoration-dotted decoration-cyan-500/30">${r.title}</p>
                            <p class="text-[8px] font-mono text-cyan-500/80 group-hover/rem:text-cyan-400">${window.formatCurrency(r.amount)}</p>
                        </div>
                    `;
                });
            }

            // Tooltip construction (using title attribute for native, or custom if needed)
            // For now, simple cell visual is enough based on request.

            html += `
             <div class="${cellClass}">
                 <div class="${dayNumClass}">${dayContent}</div>
                 ${dataHtml}
             </div>
             `;
        }
        gridEl.innerHTML = html;
    };

    // --- NEW: Add Monthly Reminder Modal ---
    window.addMonthlyReminder = function () {
        Swal.fire({
            title: 'Nuevo Recordatorio Mensual',
            html: `
                <div class="space-y-4 text-left">
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Título</label>
                        <input id="swal-rem-title" class="w-full bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition" placeholder="Ej. Renta, Netflix...">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Monto</label>
                            <input id="swal-rem-amount" type="number" class="w-full bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition" placeholder="0.00">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Día del Mes</label>
                            <input id="swal-rem-day" type="number" min="1" max="31" class="w-full bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition" placeholder="1-31">
                        </div>
                    </div>
                </div>
            `,
            background: '#161b22',
            color: '#fff',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            confirmButtonColor: '#6366f1',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#0f111a',
            preConfirm: () => {
                const title = document.getElementById('swal-rem-title').value;
                const amount = parseFloat(document.getElementById('swal-rem-amount').value);
                const day = parseInt(document.getElementById('swal-rem-day').value);

                if (!title || isNaN(amount) || isNaN(day) || day < 1 || day > 31) {
                    Swal.showValidationMessage('Por favor completa todos los campos válidos');
                    return false;
                }
                return { title, amount, day };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { title, amount, day } = result.value;
                if (!window.appState.reminders) window.appState.reminders = [];

                window.appState.reminders.push({
                    id: crypto.randomUUID(),
                    title,
                    amount,
                    day,
                    type: 'expense' // default
                });

                saveState();
                renderBudgetCalendar();

                Swal.fire({
                    icon: 'success',
                    title: 'Recordatorio Agregado',
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
                    background: '#1e293b', color: '#fff'
                });
            }
        });
    };

    // --- NEW: Edit/Delete Monthly Reminder ---
    window.editMonthlyReminder = function (id) {
        // Prevent event bubbling if clicked from a cell
        if (window.event) window.event.preventDefault();
        if (window.event) window.event.stopPropagation();

        const reminders = window.appState.reminders || [];
        const reminder = reminders.find(r => r.id === id);
        if (!reminder) return;

        Swal.fire({
            title: 'Editar Recordatorio',
            html: `
                <div class="space-y-4 text-left">
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Título</label>
                        <input id="swal-edit-title" value="${reminder.title}" class="w-full bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Monto</label>
                            <input id="swal-edit-amount" type="number" value="${reminder.amount}" class="w-full bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Día del Mes</label>
                            <input id="swal-edit-day" type="number" min="1" max="31" value="${reminder.day}" class="w-full bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition">
                        </div>
                    </div>
                </div>
            `,
            background: '#161b22',
            color: '#fff',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            confirmButtonColor: '#6366f1',
            denyButtonText: 'Eliminar',
            denyButtonColor: '#f43f5e',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#0f111a',
            preConfirm: () => {
                const title = document.getElementById('swal-edit-title').value;
                const amount = parseFloat(document.getElementById('swal-edit-amount').value);
                const day = parseInt(document.getElementById('swal-edit-day').value);

                if (!title || isNaN(amount) || isNaN(day) || day < 1 || day > 31) {
                    Swal.showValidationMessage('Datos inválidos');
                    return false;
                }
                return { title, amount, day };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Update
                reminder.title = result.value.title;
                reminder.amount = result.value.amount;
                reminder.day = result.value.day;
                saveState();
                renderBudgetCalendar();
                if (typeof renderDashboardCalendar === 'function') renderDashboardCalendar();

                Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500,
                    background: '#1e293b', color: '#fff'
                });

            } else if (result.isDenied) {
                // Delete
                if (window.deleteGranularReminder) window.deleteGranularReminder(id);
                window.appState.reminders = window.appState.reminders.filter(r => r.id !== id);
                saveState();
                renderBudgetCalendar();
                if (typeof renderDashboardCalendar === 'function') renderDashboardCalendar();

                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500,
                    background: '#1e293b', color: '#fff'
                });
            }
        });
    };

    // Auto-init
    setTimeout(() => {
        if (window.renderBudgetCalendar) window.renderBudgetCalendar();
    }, 1000);
    setInterval(() => {
        if (window.renderBudgetCalendar) window.renderBudgetCalendar();
    }, 5000);
})();

/* --- DASHBOARD BURNDOWN CHART (Refined with Focus Breakdown) --- */
(function () {
    window.renderDashboardBurndown = function () {
        const el = document.getElementById('d2-burndown-chart');
        if (!el) return;

        if (!window.appState || !window.appState.transactions) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();

        // 1. Budget Total
        // 1. Budget Total
        let budgetTotal = 5000;
        if (window.appState.budget) {
            // FIX: Prioritize 'limit' which matches the Modal's "Total Mensual"
            if (window.appState.budget.limit) {
                budgetTotal = parseFloat(window.appState.budget.limit) || 0;
            }
            else if (typeof window.appState.budget === 'number') budgetTotal = window.appState.budget;
            else if (window.appState.budget.total) budgetTotal = window.appState.budget.total;
            else if (typeof window.appState.budget === 'object') {
                // Fallback (Risk of double counting if 'limit' counts as a value, but the first check prevents that)
                budgetTotal = Object.values(window.appState.budget).reduce((a, b) => a + (parseFloat(b) || 0), 0);
            }
        }

        // 2. Expenses - CURRENT MONTH only (consistent with other calculations)
        const expenses = window.appState.transactions.filter(t => {
            const d = new Date(t.dateIso || t.id || t.date);
            return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // 3. Data
        let labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        let idealData = labels.map(day => Number(((budgetTotal / daysInMonth) * day).toFixed(2)));

        const dailySpend = new Array(daysInMonth + 1).fill(0);
        expenses.forEach(t => {
            const d = new Date(t.dateIso || t.id || t.date);
            dailySpend[d.getDate()] += Math.abs(t.amount);
        });
        // Calculate cumulative up to currentDay for chart line
        let cumulative = 0;
        let actualData = [];
        for (let i = 1; i <= currentDay; i++) {
            cumulative += dailySpend[i];
            actualData.push(Number(cumulative.toFixed(2)));
        }

        // --- RANGE LOGIC (2S support) ---
        // Defaults to '1M'. Buttons should call window.setBurndownRange('2S')
        const range = window.dashboardBurndownRange || '1M';
        if (range === '2S') {
            const windowSize = 14;
            // Show last 14 days of DATA availability (or up to today + some forecast?)
            // Usually Burndown shows the whole month. '2S' might mean zooming into the *current* 2 weeks.
            // Let's implement: Show the 14 days ending at 'currentDay' (plus maybe a few future days for context if needed?)
            // Or just a slice around today. 
            // Simple approach: [currentDay - 13, currentDay]

            let startIdx = Math.max(0, currentDay - windowSize);
            let endIdx = Math.min(daysInMonth, currentDay + 2); // Show a bit of future/context

            // Adjust to ensure we have at least 'windowSize' points if possible
            if (endIdx - startIdx < windowSize) {
                startIdx = Math.max(0, endIdx - windowSize);
            }

            labels = labels.slice(startIdx, endIdx);
            idealData = idealData.slice(startIdx, endIdx);

            // Safe slice for actualData
            const actualEnd = Math.min(actualData.length, endIdx);
            // We need to match the slice. actualData might be shorter than idealData (only up to today)
            // If startIdx is beyond actualData length, we show minimal
            actualData = actualData.slice(startIdx, actualEnd);
        }


        // Total spent = sum of all expenses in the month (for comparison)
        const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const isOverBudget = totalSpent > budgetTotal;

        // 4. Options
        const options = {
            series: [
                { name: 'Límite Ideal', type: 'line', data: idealData },
                { name: 'Gasto Acumulado', type: 'area', data: actualData }
            ],
            chart: {
                type: 'line',
                height: '100%',
                toolbar: { show: false },
                background: 'transparent',
                animations: {
                    enabled: true, // FIXED: Enabled Animations
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: { enabled: true, delay: 150 },
                    dynamicAnimation: { enabled: true, speed: 350 }
                }
            },
            colors: ['#475569', isOverBudget ? '#f43f5e' : '#6366f1'],
            stroke: { width: [2, 4], dashArray: [5, 0], curve: 'monotoneCubic' },
            fill: {
                type: ['solid', 'gradient'],
                gradient: {
                    shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 100],
                    colorStops: isOverBudget ?
                        [{ offset: 0, color: '#f43f5e', opacity: 0.4 }, { offset: 100, color: '#f43f5e', opacity: 0 }] :
                        [{ offset: 0, color: '#6366f1', opacity: 0.4 }, { offset: 100, color: '#6366f1', opacity: 0 }]
                }
            },
            xaxis: {
                categories: labels,
                axisBorder: { show: false }, axisTicks: { show: false },
                labels: { offsetY: -5, style: { colors: '#64748b', fontSize: '10px' } }
            },
            yaxis: { show: false },
            grid: { show: false, padding: { top: 0, bottom: 0, left: 10, right: 10 } },
            legend: { show: false },
            tooltip: {
                theme: 'dark',
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    const ideal = series[0][dataPointIndex];
                    const actual = series[1][dataPointIndex];

                    // DATE FIX for 2S View (since dataPointIndex is relative to slice)
                    // We grab the label value (Day Number) directly
                    const dayVal = w.globals.labels[dataPointIndex];
                    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    const dateHeader = `${dayVal} de ${monthNames[currentMonth]}`;

                    const fmt = (val) => window.formatCurrency ? window.formatCurrency(val) : '$' + val.toFixed(2);

                    const tMap = {
                        'Housing': 'Needs', 'Groceries': 'Needs', 'Transport': 'Needs', 'Health': 'Needs', 'Education': 'Needs', 'Utilities': 'Needs', 'Gas': 'Needs',
                        'Food': 'Wants', 'Shopping': 'Wants', 'Entertainment': 'Wants', 'Travel': 'Wants', 'Personal': 'Wants', 'Love': 'Wants', 'Others': 'Wants',
                        'Savings': 'Saving', 'Emergency Fund': 'Saving',
                        'Investment': 'Investment', 'Stocks': 'Investment', 'Crypto': 'Investment',
                        'Waste': 'Waste', 'Alcohol': 'Waste', 'Gambling': 'Waste', 'Beer': 'Waste', 'Junk Food': 'Waste'
                    };

                    const breakdown = { 'Needs': 0, 'Wants': 0, 'Saving': 0, 'Investment': 0, 'Waste': 0 };
                    if (actual > 0 && typeof expenses !== 'undefined') {
                        expenses.forEach(t => {
                            const d = t.dateIso ? new Date(t.dateIso) : new Date(t.date);
                            // Compare with specific day from label
                            if (d.getDate() <= parseInt(dayVal)) {
                                const cat = t.category || 'Wants';
                                let focus = tMap[cat] || 'Wants';
                                const desc = (t.description || '').toLowerCase();
                                if (desc.includes('uber') || desc.includes('taxi')) focus = 'Wants';
                                if (focus === 'Invest') focus = 'Investment';
                                if (breakdown[focus] !== undefined) breakdown[focus] += Math.abs(t.amount);
                            }
                        });
                    }

                    let html = `
                         <div class="px-3 py-3 bg-[#0f111a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl min-w-[200px]">
                             <div class="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                 <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${dateHeader}</h4>
                                 <span class="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Acumulado</span>
                             </div>
                             <div class="space-y-1">
                                 <div class="flex items-center justify-between gap-6">
                                     <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span><span class="text-[10px] font-bold text-slate-400 uppercase">Ideal</span></div>
                                     <span class="text-xs font-mono font-bold text-slate-500 maskable">${fmt(ideal)}</span>
                                 </div>`;

                    if (actual !== undefined && actual !== null) {
                        const diff = actual - ideal;
                        const isOver = diff > 0;
                        html += `
                                 <div class="flex items-center justify-between gap-6">
                                     <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"></div><span class="text-[10px] font-bold text-white uppercase">Real</span></div>
                                     <span class="text-xs font-mono font-bold text-white maskable">${fmt(actual)}</span>
                                 </div>
                                 <div class="my-2 pt-2 border-t border-white/5 space-y-1.5">`;

                        const cats = ['Needs', 'Wants', 'Saving', 'Investment', 'Waste'];
                        let hasBreakdown = false;
                        cats.forEach(c => {
                            const val = breakdown[c];
                            if (val > 0) {
                                hasBreakdown = true;
                                const pct = Math.round((val / actual) * 100);
                                let color = 'text-slate-500'; let bg = 'bg-slate-500';
                                if (c === 'Needs') { color = 'text-indigo-400'; bg = 'bg-indigo-500'; }
                                if (c === 'Wants') { color = 'text-pink-400'; bg = 'bg-pink-500'; }
                                if (c === 'Saving') { color = 'text-emerald-400'; bg = 'bg-emerald-500'; }
                                if (c === 'Investment') { color = 'text-amber-400'; bg = 'bg-amber-500'; }
                                if (c === 'Waste') { color = 'text-red-400'; bg = 'bg-red-500'; }
                                html += `
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex items-center gap-1.5 w-16">
                                        <div class="w-0.5 h-2 rounded-full ${bg}"></div>
                                        <span class="text-[9px] font-bold ${color} uppercase truncate">${c}</span>
                                    </div>
                                    <div class="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div class="h-full ${bg} opacity-80" style="width: ${pct}%"></div>
                                    </div>
                                    <div class="w-8 text-right">
                                        <span class="text-[9px] font-mono text-slate-400">${pct}%</span>
                                    </div>
                                </div>`;
                            }
                        });
                        if (!hasBreakdown) html += `<div class="text-[9px] text-slate-600 italic text-center py-1">No details</div>`;
                        html += `</div>
                                 <div class="flex items-center justify-between gap-6 pt-2 border-t border-white/5">
                                     <span class="text-[10px] text-slate-500 uppercase font-bold">Diferencia</span>
                                     <span class="text-xs font-mono font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'} maskable">${diff > 0 ? '+' : ''}${fmt(diff)}</span>
                                 </div>`; // Fixed potential double sign
                    }
                    html += `</div></div>`;
                    return html;
                }
            }
        };

        if (window._d2BurndownChart) {
            window._d2BurndownChart.updateOptions(options);
        } else {
            el.innerHTML = '';
            window._d2BurndownChart = new ApexCharts(el, options);
            window._d2BurndownChart.render();
        }

        // Refine Pace Badge
        const paceEl = document.getElementById('d2-burndown-badge-text');
        if (paceEl) {
            paceEl.innerText = isOverBudget ? 'OVER PACE' : 'ON TRACK';
            paceEl.className = isOverBudget ? 'text-[9px] font-bold text-rose-400 uppercase' : 'text-[9px] font-bold text-emerald-400 uppercase';
            if (paceEl.parentElement) {
                paceEl.parentElement.className = `flex items-center gap-2 px-2 py-1 rounded-full border ${isOverBudget ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`;
            }
        }
    };

    // Global setter for range
    window.setBurndownRange = function (range) {
        window.dashboardBurndownRange = range;
        renderDashboardBurndown();
    };

    setTimeout(window.renderDashboardBurndown, 1000);
    setInterval(window.renderDashboardBurndown, 5000);
})();
