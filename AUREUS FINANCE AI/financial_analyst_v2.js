/**
 * AUREUS AI - Financial Analyst Module
 * Generates intelligent PDF reports based on financial data.
 * V9: VECTOR LOGO ENGINE - Draws the complex "Flower of Life" logo programmatically if image fails.
 */

window.generateFinancialReportPDF = async function () {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Librería jsPDF no detectada.' });
            return;
        }

        Swal.fire({
            title: 'Generando Reporte Elite',
            text: 'Arquitectando visión financiera...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
            background: '#0B0D14',
            color: '#fff'
        });

        // --- COLORS & STYLES ---
        const theme = {
            primary: [11, 13, 20],    // Deepest Navy
            accent: [129, 140, 248],  // Indigo / Periwinkle
            gold: [212, 175, 55],     // Aureus Gold
            danger: [239, 68, 68],    // Red
            success: [34, 197, 94],   // Emerald
            slate: [71, 85, 105],     // Slate 600
            light: [248, 250, 252],   // Slate 50
            sidebar: [17, 24, 39]     // Dark Gray 900
        };

        const doc = new window.jspdf.jsPDF();
        const pgW = doc.internal.pageSize.getWidth();
        const pgH = doc.internal.pageSize.getHeight();
        const m = 20;

        // --- HELPER FUNCTIONS ---
        const drawHLine = (y, color = theme.accent, width = 0.2) => {
            doc.setDrawColor(...color);
            doc.setLineWidth(width);
            doc.line(m, y, pgW - m, y);
        };

        const drawGlassBox = (x, y, w, h, fill = [255, 255, 255]) => {
            doc.setFillColor(...fill);
            doc.setDrawColor(230, 230, 230);
            doc.roundedRect(x, y, w, h, 2, 2, 'FD');
        };

        const drawVectorLogo = (cx, cy, radius) => {
            doc.setDrawColor(...theme.gold);
            doc.setLineWidth(0.5);
            doc.circle(cx, cy, radius, 'S');
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60) * (Math.PI / 180);
                const x = cx + (Math.cos(angle) * (radius * 0.7));
                const y = cy + (Math.sin(angle) * (radius * 0.7));
                doc.circle(x, y, radius * 0.7, 'S');
            }
        };

        // --- DATA PREP ---
        const state = window.appState || {};
        const allTrans = (state.transactions || []).sort((a, b) => new Date(b.dateIso || b.date) - new Date(a.dateIso || a.date));
        const now = new Date();
        const curMonthTrans = allTrans.filter(t => {
            const d = new Date(t.dateIso || t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const mIn = curMonthTrans.filter(t => t.type === 'income').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
        const mOut = curMonthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
        const mNet = mIn - mOut;

        // ================= PAGE 1: EXECUTIVE SUMMARY =================

        // Dark Background Header
        doc.setFillColor(...theme.primary);
        doc.rect(0, 0, pgW, 80, 'F');

        // Gold Border Accent
        doc.setDrawColor(...theme.gold);
        doc.setLineWidth(0.5);
        doc.line(0, 80, pgW, 80);

        // Logo & Branding
        drawVectorLogo(m + 10, 35, 12);
        doc.setTextColor(...theme.light);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.text("AUREUS", m + 28, 40);
        doc.setTextColor(...theme.accent);
        doc.text("AI", m + 28 + doc.getTextWidth("AUREUS ") - 2, 40);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("UNIVERSAL FINANCE OPERATING SYSTEM", m + 28, 48);

        // Report Info
        doc.setTextColor(...theme.light);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("REPORT TYPE:", pgW - m - 60, 35);
        doc.text("DATE GENERATED:", pgW - m - 60, 42);
        doc.text("ID:", pgW - m - 60, 49);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...theme.accent);
        doc.text("EXECUTIVE PERFORMANCE", pgW - m - 30, 35, { align: 'right' });
        doc.text(now.toLocaleDateString(), pgW - m - 30, 42, { align: 'right' });
        doc.text(Math.random().toString(36).substr(2, 9).toUpperCase(), pgW - m - 30, 49, { align: 'right' });

        // Hero KPI Grid
        let y = 100;
        doc.setTextColor(...theme.primary);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("I. EXECUTIVE OVERVIEW", m, y);
        y += 10;
        drawHLine(y, theme.accent, 0.5);
        y += 15;

        // KPI Boxes
        const boxW = (pgW - (m * 2) - 10) / 3;
        const boxH = 35;

        // Incomes
        drawGlassBox(m, y, boxW, boxH);
        doc.setFontSize(8); doc.setTextColor(...theme.slate); doc.text("MONTHLY INCOME", m + 5, y + 10);
        doc.setFontSize(14); doc.setTextColor(...theme.success); doc.text(window.formatCurrency(mIn), m + 5, y + 25);

        // Expenses
        drawGlassBox(m + boxW + 5, y, boxW, boxH);
        doc.setFontSize(8); doc.setTextColor(...theme.slate); doc.text("MONTHLY EXPENSES", m + boxW + 10, y + 10);
        doc.setFontSize(14); doc.setTextColor(...theme.danger); doc.text(window.formatCurrency(mOut), m + boxW + 10, y + 25);

        // Net
        drawGlassBox(m + (boxW * 2) + 10, y, boxW, boxH);
        doc.setFontSize(8); doc.setTextColor(...theme.slate); doc.text("NET CASH FLOW", m + (boxW * 2) + 15, y + 10);
        doc.setFontSize(14); doc.setTextColor(mNet >= 0 ? theme.accent[0] : theme.danger[0], mNet >= 0 ? theme.accent[1] : theme.danger[1], mNet >= 0 ? theme.accent[2] : theme.danger[2]);
        doc.text(window.formatCurrency(mNet), m + (boxW * 2) + 15, y + 25);

        y += 50;

        // Visual Assessment Section
        doc.setTextColor(...theme.primary);
        doc.setFontSize(12);
        doc.text("FINANCIAL HEALTH INDICATORS", m, y);
        y += 8;

        // Performance Bar
        const barW = pgW - (m * 2);
        const barH = 12;
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(m, y, barW, barH, 2, 2, 'F');

        const efficiency = mIn > 0 ? (mNet / mIn) : 0;
        const fillW = Math.max(0, Math.min(barW, barW * (0.5 + efficiency))); // Centered at 50%
        doc.setFillColor(efficiency >= 0 ? theme.success[0] : theme.danger[0], efficiency >= 0 ? theme.success[1] : theme.danger[1], efficiency >= 0 ? theme.success[2] : theme.danger[2]);
        doc.roundedRect(m, y, fillW, barH, 2, 2, 'F');

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text("CRITICAL DEFICIT", m, y + 18);
        doc.text("EQUILIBRIUM", pgW / 2, y + 18, { align: 'center' });
        doc.text("WEALTH ACCELERATION", pgW - m, y + 18, { align: 'right' });

        y += 35;

        // AI Insights
        drawGlassBox(m, y, pgW - (m * 2), 45, [249, 250, 251]);
        doc.setFontSize(10);
        doc.setTextColor(...theme.primary);
        doc.setFont("helvetica", "bold");
        doc.text("AUREUS AI - STRATEGIC ASSESSMENT", m + 10, y + 12);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...theme.slate);

        let insight = "";
        if (mNet > 0) {
            insight = `Your portfolio shows a positive efficiency of ${(efficiency * 100).toFixed(1)}%. Current surplus of ${window.formatCurrency(mNet)} is ready for capital deployment. Recommendation: Allocate 40% to high-liquidity assets and 60% to growth ventures.`;
        } else {
            insight = `Monthly delta is negative. Your burn rate suggests a resource drainage of ${window.formatCurrency(Math.abs(mNet))}. Action required: Immediate audit of variable expenses and subscription rationalization recommended within 72 hours.`;
        }

        const lines = doc.splitTextToSize(insight, pgW - (m * 2) - 20);
        doc.text(lines, m + 10, y + 22);

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text("CONFIDENTIAL - AUREUS FINANCE ELITE REPORT", pgW / 2, pgH - 10, { align: 'center' });

        // ================= PAGE 2: TACTICAL BREAKDOWN =================
        doc.addPage();

        y = 30;
        doc.setTextColor(...theme.primary);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("II. TACTICAL ANALYSIS", m, y);
        y += 8;
        drawHLine(y, theme.accent, 0.5);
        y += 15;

        // Expense Mix
        doc.setFontSize(12);
        doc.text("CATEGORY DISTRIBUTION", m, y);
        y += 10;

        const cats = {};
        curMonthTrans.filter(t => t.type === 'expense').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + Math.abs(parseFloat(t.amount));
        });
        const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);

        // Table Header
        doc.setFillColor(...theme.primary);
        doc.rect(m, y, pgW - (m * 2), 8, 'F');
        doc.setTextColor(...theme.light);
        doc.setFontSize(8);
        doc.text("CLASSIFICATION", m + 5, y + 5);
        doc.text("TOTAL DISBURSED", m + 100, y + 5);
        doc.text("MIX %", m + 150, y + 5);

        y += 14;
        doc.setTextColor(...theme.slate);
        sortedCats.slice(0, 12).forEach(([name, val], i) => {
            if (y > pgH - 40) { doc.addPage(); y = 30; }
            doc.setFont("helvetica", "bold");
            doc.text(name.toUpperCase(), m + 5, y);
            doc.setFont("helvetica", "normal");
            doc.text(window.formatCurrency(val), m + 100, y);
            const pct = mOut > 0 ? ((val / mOut) * 100).toFixed(1) : "0.0";
            doc.text(`${pct}%`, m + 150, y);

            // Tiny bar
            doc.setFillColor(240, 240, 240);
            doc.rect(m + 165, y - 2, 20, 2, 'F');
            doc.setFillColor(...theme.accent);
            doc.rect(m + 165, y - 2, 20 * (parseFloat(pct) / 100), 2, 'F');

            y += 8;
        });

        y += 15;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...theme.primary);
        doc.text("WEEKLY VELOCITY", m, y);
        y += 10;

        const weeks = {};
        curMonthTrans.forEach(t => {
            const d = new Date(t.dateIso || t.date);
            const w = `W${Math.ceil(d.getDate() / 7)}`;
            if (!weeks[w]) weeks[w] = { i: 0, o: 0 };
            if (t.type === 'income') weeks[w].i += parseFloat(t.amount); else weeks[w].o += parseFloat(t.amount);
        });

        // Weekly Table
        doc.setFillColor(245, 245, 250);
        doc.rect(m, y, pgW - (m * 2), 7, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...theme.primary);
        doc.text("PERIOD", m + 5, y + 4.5);
        doc.text("INFLOW", m + 50, y + 4.5);
        doc.text("OUTFLOW", m + 100, y + 4.5);
        doc.text("NET DELTA", m + 150, y + 4.5);

        y += 12;
        Object.entries(weeks).sort().forEach(([w, data]) => {
            doc.setFont("helvetica", "bold");
            doc.text(w, m + 5, y);
            doc.setFont("helvetica", "normal");
            doc.text(window.formatCurrency(data.i), m + 50, y);
            doc.text(window.formatCurrency(data.o), m + 100, y);
            const wNet = data.i - data.o;
            doc.setTextColor(wNet >= 0 ? theme.success[0] : theme.danger[0], wNet >= 0 ? theme.success[1] : theme.danger[1], wNet >= 0 ? theme.success[2] : theme.danger[2]);
            doc.text(window.formatCurrency(wNet), m + 150, y);
            doc.setTextColor(...theme.slate);
            y += 8;
        });

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text("AUREUS FINANCE OS | TACTICAL DATA LAYER | PAGE 2", pgW / 2, pgH - 10, { align: 'center' });

        // ================= PAGE 3: ASSET & LIABILITY =================
        doc.addPage();
        y = 30;
        doc.setTextColor(...theme.primary);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("III. CAPITAL STRUCTURE", m, y);
        y += 8;
        drawHLine(y, theme.accent, 0.5);
        y += 15;

        // Balance Accounts
        doc.setFontSize(12);
        doc.text("LIQUIDITY HUBS", m, y);
        y += 10;

        const accounts = Object.entries(state.balanceAccounts || {});
        accounts.forEach(([acc, bal]) => {
            drawGlassBox(m, y, 40, 20);
            doc.setFontSize(7); doc.setTextColor(...theme.slate); doc.text(acc.toUpperCase(), m + 5, y + 7);
            doc.setFontSize(10); doc.setTextColor(...theme.primary); doc.text(window.formatCurrency(bal), m + 5, y + 15);
            y += 25;
            if (y > pgH - 60) { doc.addPage(); y = 30; }
        });

        // Final Stamp
        y = pgH - 50;
        doc.setFillColor(...theme.primary);
        doc.rect(m, y, pgW - (m * 2), 30, 'F');
        doc.setTextColor(...theme.gold);
        doc.setFontSize(10);
        doc.text("ULTIMATE MANDATE:", m + 10, y + 10);
        doc.setTextColor(...theme.light);
        doc.setFontSize(8);
        doc.text("Protect capital. Seek asymmetric growth. Minimize waste. Build the future.", m + 10, y + 20);

        // Digital Signature placeholder
        doc.setDrawColor(...theme.gold);
        doc.line(pgW - m - 40, y + 20, pgW - m - 10, y + 20);
        doc.setFontSize(6);
        doc.text("AUREUS SYSTEM AUTH", pgW - m - 40, y + 24);

        // Final Save
        const fileName = `AUREUS_REPORT_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}.pdf`;
        doc.save(fileName);

        Swal.fire({
            icon: 'success',
            title: 'Reporte Generado',
            text: `El documento eliseo ${fileName} ha sido exportado.`,
            background: '#0B0D14',
            color: '#fff',
            timer: 4000
        });

    } catch (e) {
        console.error("PDF Elite Error:", e);
        Swal.fire({ icon: 'error', title: 'Critical Failure', text: e.message });
    }
};

window.renderProjectionsTable = function () {
    const tableBody = document.getElementById('projections-table-body');
    if (!tableBody) return;

    const state = window.appState || {};
    const transactions = state.transactions || [];
    const expenseCategories = typeof getBudgetCategoryDefinitions === 'function' ? getBudgetCategoryDefinitions() : [];
    const incomeCategories = typeof getIncomeCategoryDefinitions === 'function' ? getIncomeCategoryDefinitions() : [];

    // Get last 4 months info
    const now = new Date();
    const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const displayMonths = [];
    for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        displayMonths.push({
            month: d.getMonth(),
            year: d.getFullYear(),
            label: monthsNames[d.getMonth()]
        });
    }

    // Update Header
    const tableElement = tableBody.closest('table');
    const headerRow = tableElement ? tableElement.querySelector('thead tr') : null;
    if (headerRow) {
        const headers = headerRow.querySelectorAll('th');
        displayMonths.forEach((m, idx) => {
            if (headers[idx + 1]) headers[idx + 1].innerText = m.label;
        });
    }

    // Helper for calculations
    const getMonthlyData = (categories) => {
        return categories.map(cat => {
            const monthlySpent = displayMonths.map(m => {
                return transactions
                    .filter(t => {
                        let raw = t.dateIso || t.date;
                        if (!raw && t.id && !isNaN(new Date(t.id).getTime())) raw = t.id;
                        const d = new Date(raw || new Date());
                        return t.category === cat.id &&
                            d.getMonth() === m.month &&
                            d.getFullYear() === m.year;
                    })
                    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
            });
            return { ...cat, monthlySpent };
        });
    };

    const incomeData = getMonthlyData(incomeCategories);
    const expenseData = getMonthlyData(expenseCategories);

    // Calculate Net Margin
    const netMargin = displayMonths.map((_, idx) => {
        const totalIncome = incomeData.reduce((sum, cat) => sum + cat.monthlySpent[idx], 0);
        const totalExpense = expenseData.reduce((sum, cat) => sum + cat.monthlySpent[idx], 0);
        return totalIncome - totalExpense;
    });

    const formatRow = (row, isHeader = false) => {
        if (isHeader) {
            return `
                <tr class="bg-white/[0.03]">
                    <td colspan="5" class="py-4 px-4 text-xs font-black text-white uppercase tracking-[0.15em] border-y border-white/5 bg-gradient-to-r from-white/[0.05] to-transparent">
                        ${row.name.toUpperCase()}
                    </td>
                </tr>
            `;
        }

        const cells = row.monthlySpent.map((val, idx) => {
            const isCurrent = idx === 3;
            const colorClass = isCurrent ? 'text-white font-bold' : 'text-slate-500';
            const fmtVal = window.formatCurrency(val);
            return `<td class="py-2.5 text-center ${colorClass} font-mono text-xs border-b border-white/[0.02]">${fmtVal}</td>`;
        }).join('');

        return `
            <tr class="group/tr transition-all duration-300 hover:bg-white/5 last:border-0 relative">
                <td class="py-2.5 px-3 flex items-center gap-3 border-b border-white/[0.02] group-hover:border-transparent">
                    <div class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center transition-colors group-hover:bg-indigo-500/20">
                        <i data-lucide="${row.icon}" class="w-4 h-4 ${row.color || 'text-slate-400'} transition-colors group-hover:text-indigo-400"></i>
                    </div>
                    <span class="text-slate-300 font-bold text-xs truncate max-w-[120px] group-hover:text-white transition-colors">${row.name}</span>
                </td>
                ${cells}
            </tr>
        `;
    };

    let finalHtml = '';

    // 1. Income Section
    finalHtml += formatRow({ name: 'Ingresos' }, true);
    finalHtml += incomeData.map(row => formatRow(row)).join('');

    // 2. Expense Section
    finalHtml += formatRow({ name: 'Gastos' }, true);
    finalHtml += expenseData.map(row => formatRow(row)).join('');

    // 3. Footer Margen Neto
    const marginCells = netMargin.map((val, idx) => {
        const isCurrent = idx === 3;
        const colorClass = val >= 0 ? 'text-emerald-400' : 'text-rose-400';
        const fmtVal = window.formatCurrency(val);
        return `<td class="py-4 text-center ${colorClass} font-black font-mono text-base">${fmtVal}</td>`;
    }).join('');

    finalHtml += `
        <tr class="bg-indigo-500/5 group/tr transition-all duration-300">
            <td class="py-4 px-2">
                <span class="text-indigo-400 font-black text-sm uppercase tracking-widest pl-2">Margen Neto</span>
            </td>
            ${marginCells}
        </tr>
    `;

    tableBody.innerHTML = finalHtml;

    // Render Charts
    const renderDonutChart = (containerId, data) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const currentData = data
            .map(c => ({ name: c.name, value: c.monthlySpent[3] }))
            .filter(c => c.value > 0);

        if (currentData.length === 0) {
            container.innerHTML = '<div class="text-slate-600 italic text-xs py-20">Sin movimientos registrados</div>';
            return;
        }

        const options = {
            series: currentData.map(d => d.value),
            chart: {
                type: 'donut',
                height: 280,
                animations: { enabled: true, speed: 800 },
                background: 'transparent'
            },
            labels: currentData.map(d => d.name),
            colors: ['#FFD700', '#10B981', '#6366F1', '#F43F5E', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'],
            stroke: { show: false },
            dataLabels: { enabled: false },
            legend: {
                position: 'bottom',
                fontFamily: 'inherit',
                fontSize: '10px',
                fontWeight: 700,
                labels: { colors: '#64748B' },
                itemMargin: { horizontal: 5, vertical: 5 },
                markers: { radius: 4, width: 8, height: 8 }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '80%',
                        labels: {
                            show: true,
                            name: { show: true, fontSize: '10px', fontWeight: 900, color: '#64748B', offsetY: -5 },
                            value: {
                                show: true,
                                fontSize: '20px',
                                fontWeight: 900,
                                color: '#FFFFFF',
                                offsetY: 5,
                                formatter: val => window.formatCurrency(val)
                            },
                            total: {
                                show: true,
                                label: 'TOTAL',
                                color: '#64748B',
                                fontSize: '10px',
                                fontWeight: 900,
                                formatter: w => window.formatCurrency(w.globals.seriesTotals.reduce((a, b) => a + b, 0))
                            }
                        }
                    }
                }
            },
            tooltip: { enabled: true, theme: 'dark' }
        };

        container.innerHTML = '';
        const chart = new ApexCharts(container, options);
        chart.render();
    };

    renderDonutChart('income-projection-chart', incomeData);
    renderDonutChart('expense-projection-chart', expenseData);

    if (window.lucide) window.lucide.createIcons();
};
