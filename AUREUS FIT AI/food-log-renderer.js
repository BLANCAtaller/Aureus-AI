document.addEventListener('DOMContentLoaded', () => {
    // Translation Helper
    const tr = (key, def) => (window.Locales && window.Locales.getTranslation(key)) || def;

    // --- Data Management (History Aware) ---
    const DB_VERSION = "8.8"; // Sync with food-db-renderer.js - Batch 4
    let savedVersion = localStorage.getItem(getUserKey('aureus_db_version'));
    if (savedVersion !== DB_VERSION) {
        if (typeof foodDatabase !== 'undefined') {
            const currentDb = window.getAureusFoodDB ? window.getAureusFoodDB() : foodDatabase;
            if (window.saveAureusFoodDB) window.saveAureusFoodDB(currentDb);
            localStorage.setItem(getUserKey('aureus_db_version'), DB_VERSION);
            console.log("Database updated and optimized to version", DB_VERSION);
        }
    }

    // Sync Listeners
    window.addEventListener('storage', (e) => {
        if (e.key === 'aureus_targets_updated' ||
            e.key === getUserKey('aureus_user_settings') ||
            (typeof getStorageKey === 'function' && e.key === getStorageKey(currentDate))) {
            // Reload current date to fetch new targets/data
            loadLogForDate(currentDate);
        }
    });
    window.addEventListener('settings-saved', () => {
        loadLogForDate(currentDate);
    });

    document.addEventListener('language-changed', () => {
        loadLogForDate(currentDate);
        renderFavorites(); // Update empty state if needed

        // Update Modal Title if Open
        const modal = document.getElementById('quickAddModal');
        const modalTitle = document.getElementById('modalTitle');
        if (modal && !modal.classList.contains('hidden') && currentTargetMeal) {
            const mealLabel = Locales.getTranslation('dashboard.' + currentTargetMeal);
            if (mealLabel && modalTitle) {
                modalTitle.innerText = `${Locales.getTranslation('food_log.add')} ${mealLabel.toUpperCase()}`;
            }
        }
    });

    const STORAGE_KEY_PREFIX = 'aureus_log_'; // Store as aureus_log_YYYY-MM-DD
    let currentDate = new Date(); // Start at today

    let logData = null; // Current loaded data

    const DEFAULT_TARGETS = {
        calories: 2000,
        fat: 150,
        prot: 95,
        carb: 45
    };

    const DEFAULT_MEALS = {
        breakfast: { time: "08:30 AM", items: [] },
        lunch: { time: "12:45 PM", items: [] },
        dinner: { time: "07:00 PM", items: [] },
        snacks: { time: "--:--", items: [] }
    };

    // DOM Elements - Date Nav
    const btnPrevDate = document.getElementById('btnPrevDate');
    const btnNextDate = document.getElementById('btnNextDate');
    const dateSelectorLabel = document.getElementById('dateSelectorLabel');
    const displayDateEl = document.getElementById('currentDateDisplay'); // The one in the card header

    // --- Navigation Listeners ---
    if (btnPrevDate && btnNextDate) {
        btnPrevDate.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            loadLogForDate(currentDate);
        });

        btnNextDate.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            loadLogForDate(currentDate);
        });
    }

    // --- Quick Add Modal Logic ---
    let currentTargetMeal = null;



    const modal = document.getElementById('quickAddModal');
    const modalTitle = document.getElementById('modalTitle');
    const closeBtn = document.getElementById('closeModalBtn');
    const tabBtns = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const favoritesList = document.getElementById('favoritesList');
    const addManualBtn = document.getElementById('addManualBtn');

    // Tab switching functionality
    // Tab switching functionality
    function switchTab(tabName) {
        console.log('switchTab called with:', tabName);

        // Re-query elements to ensure we have the latest DOM state
        const refreshTabBtns = document.querySelectorAll('.tab-item');
        const refreshTabContents = document.querySelectorAll('.tab-content');

        // Remove active from all tabs
        refreshTabBtns.forEach(btn => btn.classList.remove('active'));
        refreshTabContents.forEach(content => content.classList.remove('active'));

        // Activate selected tab button
        const selectedBtn = document.querySelector(`.tab-item[data-tab="${tabName}"]`);
        if (selectedBtn) selectedBtn.classList.add('active');

        // Handle special case for aiscan -> ID "tabAIScan"
        let contentId;
        if (tabName === 'aiscan') {
            contentId = 'tabAIScan';
        } else {
            contentId = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        }

        const selectedContent = document.getElementById(contentId);

        if (selectedContent) {
            selectedContent.classList.add('active');
            console.log(`Activated content: ${contentId}`);
        } else {
            console.error('Content not found for ID:', contentId);
        }

        // Add class to modal-body when AI Scan is active (for CSS hooks)
        const modalBody = document.querySelector('#quickAddModal .modal-body');
        if (modalBody) {
            if (tabName === 'aiscan') {
                modalBody.classList.add('ai-scan-active');
            } else {
                modalBody.classList.remove('ai-scan-active');
            }
        }

        // Explicitly handle Search Bar Visibility (for legacy code compatibility)
        const searchContainer = document.querySelector('#quickAddModal .favorites-search-container');
        if (searchContainer) {
            searchContainer.style.display = (tabName === 'favorites') ? 'block' : 'none';
        }
    }

    // --- Persistence ---


    // Add event listeners to tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Handle Favorites Search
    const favSearchInput = document.querySelector('.favorites-search-input');
    if (favSearchInput) {
        favSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.fav-item-row'); // Updated selector
            items.forEach(item => {
                const text = item.innerText.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }

    // Close modal on close button click
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close modal on outside click
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (addManualBtn) addManualBtn.addEventListener('click', addManualItem);

    // --- GL Limit Edit Listener (Moved to Init for stability) ---
    const btnEditGL = document.getElementById('btnEditGL');
    if (btnEditGL) {
        btnEditGL.onclick = () => {
            const currentLimit = localStorage.getItem('aureus_gl_limit') || "100";
            const newLimit = prompt("Enter Daily Glycemic Load Limit:", currentLimit);
            if (newLimit && !isNaN(parseInt(newLimit))) {
                localStorage.setItem('aureus_gl_limit', parseInt(newLimit));
                updateGlycemicGauge(); // Refresh immediately
            }
        };
    }

    // --- Functions ---

    function getStorageKey(date) {
        // Format: YYYY-MM-DD
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');

        // Manual Namespacing Fix
        let profileId = '';
        try {
            const user = JSON.parse(localStorage.getItem('aureus_active_user'));
            if (user && user.id) {
                profileId = user.id + '_';
            }
        } catch (e) { }

        // We use getUserKey to handle multi-user scenarios if implemented, 
        // but we prepend profileId to the date-key ourselves to be 100% sure.
        return getUserKey(`${STORAGE_KEY_PREFIX}${profileId}${y}-${m}-${d}`);
    }

    async function loadLogForDate(date) {
        const key = getStorageKey(date);
        const stored = localStorage.getItem(key);

        console.log(`Loading log for ${key}...`);

        if (stored) {
            try {
                logData = JSON.parse(stored);
                // FEATURE: Always update targets from Global Settings to ensure sync
                // as per user request: "SI ESTE CAMBIA TODOS LOS LIMITES CAMBIAN"
                const globalSettingsStored = localStorage.getItem(getUserKey('aureus_user_settings'));
                if (globalSettingsStored) {
                    const settings = JSON.parse(globalSettingsStored);
                    if (settings.targets) {
                        logData.targets = { ...settings.targets };
                    }
                }
            } catch (e) {
                console.error("Error parsing stored log data", e);
                logData = null; // Trigger default init
            }
        } else {
            logData = null;
        }

        if (!logData) {
            // Create new entry for this date
            // Start with global settings if available
            let initialTargets = { ...DEFAULT_TARGETS };
            const globalSettingsStored = localStorage.getItem(getUserKey('aureus_user_settings'));
            if (globalSettingsStored) {
                try {
                    const settings = JSON.parse(globalSettingsStored);
                    if (settings.targets) {
                        initialTargets = { ...settings.targets };
                    }
                } catch (e) { console.error("Error loading global settings for log", e); }
            }

            logData = {
                date: date.toLocaleDateString(),
                meals: JSON.parse(JSON.stringify(DEFAULT_MEALS)), // Deep copy default
                targets: initialTargets
            };

            // Migration Logic
            const isToday = date.toDateString() === new Date().toDateString();
            if (isToday) {
                const oldData = localStorage.getItem(getUserKey('aureus_daily_log_v2'));
                if (oldData) {
                    try {
                        const parsedOld = JSON.parse(oldData);
                        if (parsedOld.meals) {
                            console.log("Migrating legacy data to new history format...");
                            // We should merge into structure rather than replace to be safe
                            // But for now, let's just use it if it looks valid
                            logData = parsedOld;
                            logData.date = date.toLocaleDateString();
                            saveLog();
                        }
                    } catch (e) {
                        console.error("Failed to migrate old data", e);
                    }
                }
            }
        }

        // --- NEW: Pull from Supabase for Granular Data ---
        if (window.loadGranularNutritionFromSupabase) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            try {
                const supabaseData = await window.loadGranularNutritionFromSupabase(dateStr);
                if (supabaseData) {
                    console.log("[Sync] Supabase data loaded:", supabaseData);
                    // Merge Supabase data into logData
                    if (supabaseData.hydration) {
                        logData.hydration = { ...logData.hydration, ...supabaseData.hydration };
                    }
                    if (supabaseData.meals) {
                        // If we have items in Supabase, we should probably prefer them 
                        // or merge them if local is empty. 
                        // For a "Sync" experience, Supabase is usually the source of truth if we are online.
                        // However, to avoid flashing, we only update if local was empty or if we want full sync.
                        if (!stored || Object.keys(supabaseData.meals).length > 0) {
                            logData.meals = { ...logData.meals, ...supabaseData.meals };
                        }
                    }

                    // Re-render after Supabase load
                    renderLog();
                    updateStats();
                }
            } catch (err) {
                console.error("Error fetching Supabase data during load:", err);
            }
        }

        // Ensure hydration object exists
        if (!logData.hydration) {
            logData.hydration = { current: 0, goal: 2500 };
        }

        updateDateDisplay(date);
        sanitizeLogData();
        renderLog();
        updateStats();
        renderWeeklyHistory();
        if (typeof renderGlucoseHistory === 'function') renderGlucoseHistory();
        if (typeof updateFoodLogHydrationUI === 'function') updateFoodLogHydrationUI();
    }

    function sanitizeLogData() {
        if (!logData) {
            logData = {
                date: new Date().toLocaleDateString(),
                meals: JSON.parse(JSON.stringify(DEFAULT_MEALS)),
                targets: { ...DEFAULT_TARGETS }
            };
        }

        // Ensure meals object exists
        if (!logData.meals) logData.meals = JSON.parse(JSON.stringify(DEFAULT_MEALS));

        // Ensure all required meal keys exist
        const requiredMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
        requiredMeals.forEach(key => {
            if (!logData.meals[key]) {
                logData.meals[key] = { time: "--:--", items: [] };
            }
            // Ensure items array exists
            if (!logData.meals[key].items) {
                logData.meals[key].items = [];
            }
        });

        // Ensure glucose array exists
        if (!logData.glucose) logData.glucose = [];

        // Ensure targets exist
        if (!logData.targets) logData.targets = { ...DEFAULT_TARGETS };

        // Ensure hydration object exists
        if (!logData.hydration) logData.hydration = { current: 0, goal: 2500 };
    }

    function saveLog() {
        const key = getStorageKey(currentDate);
        console.log(`Saving log to ${key}...`);
        try {
            if (logData) {
                localStorage.setItem(key, JSON.stringify(logData));

                // Trigger sync helper if available
                if (window.syncLogToSupabase) {
                    const y = currentDate.getFullYear();
                    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const d = String(currentDate.getDate()).padStart(2, '0');
                    const dateStr = `${y}-${m}-${d}`;
                    window.syncLogToSupabase(dateStr, logData);
                }

                // Update UI safely
                if (typeof renderLog === 'function') renderLog();
                if (typeof updateStats === 'function') updateStats();
                if (typeof renderWeeklyHistory === 'function') renderWeeklyHistory();
                // Ensure glucose history matches (though it has its own render logic)
                if (typeof renderGlucoseHistory === 'function') renderGlucoseHistory();
                if (typeof updateFoodLogHydrationUI === 'function') updateFoodLogHydrationUI();
            }
        } catch (e) {
            console.error("Failed to save log to localStorage", e);
            alert("Storage error: Could not save your data!");
        }
    }

    function updateDateDisplay(date) {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        const formattedDate = `${d}/${m}/${y}`;

        if (dateSelectorLabel) {
            dateSelectorLabel.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formattedDate}`;
        }

        if (displayDateEl) {
            const fullOpt = { weekday: 'long', month: 'long', day: 'numeric' };
            displayDateEl.innerText = date.toLocaleDateString('en-US', fullOpt);
        }
    }

    // Navigation elements are already defined above...

    // --- DOM Elements ---
    const logTimeline = document.querySelector('.log-timeline');
    const caloriesRemainingEl = document.querySelector('.cals-val .big');
    const caloriesBar = document.querySelector('.mini-progress .bar-fill');

    // Stats Elements
    const ringFat = document.querySelector('.ring-container.yellow');
    const valFat = ringFat ? ringFat.nextElementSibling.querySelector('.val') : null;

    const ringProt = document.querySelector('.ring-container.blue');
    const valProt = ringProt ? ringProt.nextElementSibling.querySelector('.val') : null;

    const ringCarb = document.querySelector('.ring-container.pink');
    const valCarb = ringCarb ? ringCarb.nextElementSibling.querySelector('.val') : null;

    const uricCard = document.querySelector('.uric-risk-card');
    const riskMarker = uricCard ? uricCard.querySelector('.gauge-marker') : null;
    const riskValue = uricCard ? uricCard.querySelector('.risk-value-center') : null;



    // --- Rendering ---



    function renderLog() {
        if (!logTimeline) {
            console.error("Log timeline element not found!");
            return;
        }

        logTimeline.innerHTML = '';

        const mealOrder = [
            { key: 'breakfast', label: Locales.getTranslation('dashboard.breakfast'), color: 'yellow' },
            { key: 'lunch', label: Locales.getTranslation('dashboard.lunch'), color: 'green' },
            { key: 'dinner', label: Locales.getTranslation('dashboard.dinner'), color: 'gray' },
            { key: 'snacks', label: Locales.getTranslation('dashboard.snack'), color: 'purple' }
        ];

        try {
            mealOrder.forEach(meal => {
                const data = logData.meals[meal.key];
                const hasItems = data && data.items && data.items.length > 0;

                const group = document.createElement('div');
                group.className = 'log-group';

                const timeStr = (data && data.time) ? data.time : '--:--';

                // Meal Header
                let headerHtml = `
                    <div class="group-header">
                        <span class="dot ${meal.color}"></span>
                        <div class="meal-title-row">
                            <span class="meal-name">${meal.label.toUpperCase()}</span>
                            ${hasItems ? `<span class="meal-time">${timeStr}</span>` : ''}
                        </div>
                    </div>
                `;

                // Meal Summary
                const items = hasItems ? data.items : [];
                const totals = calculateMealTotals(items);
                const mealGL = totals.gl; // Uses precise sum of item GLs
                const glRisk = mealGL > 20 ? 'high' : 'low';
                const glIcon = mealGL > 20 ? '<i class="fa-solid fa-triangle-exclamation"></i> ' : '';
                const glColor = mealGL > 20 ? '#EF4444' : '#10B981';
                const glUnit = 'GL';

                let summaryHtml = `
                    <div class="meal-summary-row" style="padding-left: 22px; margin-bottom: 12px; font-size: 11px; display: flex; gap: 8px; color: var(--text-gray);">
                        <span class="val-cal" style="color: var(--primary-lime); font-weight: 600;">${Math.round(totals.cals)} kcal</span> •
                        <span class="val-purine">${Math.round(totals.purine)} mg Purines</span> •
                        <span class="val-carb">${Math.round(totals.carb)}g ${Locales.getTranslation('food_log.net_carbs')}</span> •
                        <span class="val-gl" style="color: ${glColor}; ${mealGL > 20 ? 'font-weight: 600;' : ''}">${glIcon}${Math.round(mealGL)}${glUnit}</span> •
                        <span class="val-gf">${Math.round(totals.carb > 0 ? (totals.gl * 100) / totals.carb : 0)}CG ${Locales.getTranslation('food_log.glycemic_factor')}</span>
                    </div>
                `;

                let itemsHtml = '';
                if (hasItems) {
                    itemsHtml = `<div class="log-items-container filled">`;
                    items.forEach((item, index) => {
                        const displayCals = item.cals || item.cal || 0;
                        const highPurine = item.highPurine || (item.purines > 150) || (item.purine > 150);
                        const warningClass = highPurine ? 'warning' : '';
                        const warningIcon = highPurine ? ' <i class="fa-solid fa-triangle-exclamation"></i>' : '';

                        itemsHtml += `
                            <div class="log-item">
                                <div class="log-item-details">
                                    <span class="item-name ${warningClass}">${item.name}${warningIcon}</span>
                                    ${item.sub ? `<span class="item-sub">${item.sub}</span>` : ''}
                                </div>
                                 <div style="display:flex; align-items:center; gap:10px;">
                                    <span class="item-cals">${displayCals}</span>
                                    <i class="fa-solid fa-trash-can btn-delete-item" data-meal="${meal.key}" data-index="${index}" style="font-size:14px; cursor:pointer; color:#EF4444; opacity:1; visibility:visible; display:inline-block; transition:0.2s"></i>
                                 </div>
                            </div>
                        `;
                    });

                    // Add Button at the bottom of the card for populated meals
                    itemsHtml += `
                        <div class="log-card-footer btn-add-meal-dynamic" data-meal="${meal.key}" style="cursor: pointer; border-top: 1px solid rgba(255, 255, 255, 0.05); padding: 12px; text-align: center; transition: all 0.2s;"> 
                            <span style="font-size: 12px; font-weight: 700; color: var(--primary-lime); display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="fa-solid fa-plus"></i> ${Locales.getTranslation('food_log.add_upper')} ${meal.label.toUpperCase()}
                            </span>
                        </div>
                    `;
                    itemsHtml += `</div>`;
                } else {
                    const mealName = meal.label ? meal.label.toUpperCase() : meal.key.toUpperCase();
                    itemsHtml = `
                        <div class="log-items-container" style="background:transparent; border:none; padding:0;">
                            <button class="empty-state-box btn-add-meal-dynamic" data-meal="${meal.key}" style="width:100%; text-align:left; background:transparent; border: 1px dashed rgba(255,255,255,0.1); cursor:pointer;">
                                <span class="empty-text">${Locales.getTranslation('food_log.nothing_logged')}</span>
                                <span class="add-text">${Locales.getTranslation('food_log.add_upper')} ${mealName}</span>
                            </button>
                        </div>
                    `;
                }

                group.innerHTML = headerHtml + summaryHtml + itemsHtml;
                logTimeline.appendChild(group);
            });
        } catch (e) {
            console.error("Error rendering log timeline", e);
            logTimeline.innerHTML = `<div style="color:red; padding:20px;">Error rendering log: ${e.message}</div>`;
        }

        attachEventListeners();
    }

    function calculateMealTotals(items) {
        if (!items) return { cals: 0, purine: 0, carb: 0, gl: 0 };
        return items.reduce((acc, item) => {
            acc.cals += (item.cals || item.cal || 0);
            acc.purine += (item.purine || item.purines || 0);

            // Assume stored 'carb' is Net Carbs (consistent with Manual Entry)
            const iCarb = (item.carb || item.carbs || 0);
            acc.carb += iCarb;

            // GL Calculation
            let iGL = 0;
            if (item.gl !== undefined && item.gl !== null) {
                iGL = parseFloat(item.gl);
            } else {
                // Fallback: Calculate from GI * NetCarbs
                const iGI = item.gi || 55;
                iGL = (iGI * iCarb) / 100;
            }
            acc.gl += iGL;

            return acc;
        }, { cals: 0, purine: 0, carb: 0, gl: 0 });
    }

    function updateStats() {
        if (!logData || !logData.meals) return;

        let totalCals = 0;
        let totalPurine = 0;
        let totalCarb = 0;
        let totalFat = 0;
        let totalProt = 0;

        try {
            Object.values(logData.meals).forEach(meal => {
                if (meal.items) {
                    meal.items.forEach(item => {
                        const cals = item.cals || item.cal || 0;
                        totalCals += cals;
                        totalPurine += (item.purine || item.purines || 0);
                        totalCarb += (item.carb || 0);
                        totalFat += (item.fat || 0);
                        totalProt += (item.prot || 0);
                    });
                }
            });

            // Update Calories
            if (caloriesRemainingEl) {
                const remaining = logData.targets.calories - totalCals;
                caloriesRemainingEl.innerText = remaining > 0 ? remaining : 0;
            }
            if (caloriesBar) {
                const pct = Math.min((totalCals / logData.targets.calories) * 100, 100);
                caloriesBar.style.width = `${pct}%`;
            }

            // Update Glycemic Factor
            updateGlycemicGauge();

            // Update Glucose Section
            renderGlucoseHistory();

            // Update Large Progress Ring
            const consumedValEl = document.getElementById('totalConsumedVal');
            const progressCircle = document.getElementById('consumedProgressCircle');
            const totalConsumedCard = document.querySelector('.total-consumed-card'); // Get the card element

            if (consumedValEl) {
                consumedValEl.innerText = totalCals.toLocaleString('en-US');
            }
            if (progressCircle) {
                const radius = progressCircle.r.baseVal.value;
                const circumference = 2 * Math.PI * radius;
                const pct = Math.min(totalCals / logData.targets.calories, 2); // Allow up to 200% for visual feedback
                const offset = circumference - (pct * circumference);
                progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
                progressCircle.style.strokeDashoffset = offset;

                // Visual Feedback: Red if over limit
                const surplusEl = document.getElementById('calorieSurplusDisplay');
                if (totalCals > logData.targets.calories) {
                    progressCircle.style.stroke = 'var(--accent-red)';
                    progressCircle.style.filter = 'drop-shadow(0 0 8px var(--accent-red))';

                    // Add pulsing animation to card
                    if (totalConsumedCard) {
                        totalConsumedCard.classList.add('calorie-limit-exceeded');
                    }

                    if (surplusEl) {
                        const surplus = Math.round(totalCals - logData.targets.calories);
                        surplusEl.innerText = `+${surplus.toLocaleString('en-US')}`;
                        surplusEl.style.display = 'block';
                    }
                } else {
                    progressCircle.style.stroke = ''; // Reset
                    progressCircle.style.filter = ''; // Reset

                    // Remove pulsing animation from card
                    if (totalConsumedCard) {
                        totalConsumedCard.classList.remove('calorie-limit-exceeded');
                    }

                    if (surplusEl) surplusEl.style.display = 'none';
                }
            }

            // Update Rings
            if (ringFat && valFat) updateRing(ringFat, valFat, totalFat, logData.targets.fat, 'g');
            if (ringProt && valProt) updateRing(ringProt, valProt, totalProt, logData.targets.prot, 'g');
            if (ringCarb && valCarb) updateRing(ringCarb, valCarb, totalCarb, logData.targets.carb, 'g');

            // Update Risk
            if (riskMarker && riskValue) updateRiskGauge(totalPurine);

            // New: Update Macro Targets Chart
            renderMacroTargetsChart();

        } catch (e) {
            console.error("Error updating stats", e);
        }
    }

    // Stub for missing chart function to prevent crashes
    function renderMacroTargetsChart() {
        console.log("renderMacroTargetsChart called (stub)");
        // TODO: Implement actual chart rendering if needed
    }

    function updateRing(ringEl, valEl, current, target, unit) {
        const pct = Math.round((current / target) * 100);
        ringEl.style.setProperty('--p', pct);
        ringEl.querySelector('span').innerText = `${pct}% `;
        valEl.innerText = `${Math.round(current).toLocaleString('en-US')}${unit} `;

        // Visual Feedback: Red if over limit
        if (current > target) {
            ringEl.style.setProperty('--c', 'var(--accent-red)');
            // Also color the percentage text if possible, but strict ring logic usually uses --c
            ringEl.querySelector('span').style.color = 'var(--accent-red)';
        } else {
            ringEl.style.removeProperty('--c');
            ringEl.querySelector('span').style.color = '';
        }
    }

    function updateRiskGauge(purine) {
        const maxSafe = 800;
        // Cap at 100% for the marker position, but logic can handle higher values
        const pct = Math.min((purine / maxSafe) * 100, 100);

        if (riskMarker) riskMarker.style.left = `${pct}%`;
        if (riskValue) riskValue.innerText = `${Math.round(purine).toLocaleString('en-US')}mg Purines`;

        // Warning Box Elements
        const warningBox = document.querySelector('.risk-warning-box');
        const warningText = document.querySelector('.risk-warning-box .warning-text');

        if (purine > 800) {
            // CRITICAL
            if (warningBox) {
                warningBox.style.display = 'flex';
                warningBox.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                warningBox.style.background = 'rgba(239, 68, 68, 0.15)';
            }
            if (warningText) {
                warningText.innerHTML = `<strong>CRITICAL:</strong> Daily limit exceeded. Avoid high-purine foods immediately.`;
            }

        } else if (purine > 650) {
            // HIGH RISK
            if (warningBox) {
                warningBox.style.display = 'flex';
                warningBox.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                warningBox.style.background = 'rgba(239, 68, 68, 0.08)';
            }
            if (warningText) {
                warningText.innerHTML = `<strong>Warning:</strong> Approaching daily limit. Consider swapping red meat for eggs or tofu.`;
            }

        } else if (purine > 400) {
            // MODERATE
            if (warningBox) {
                warningBox.style.display = 'flex';
                warningBox.style.borderColor = 'rgba(245, 158, 11, 0.25)';
                warningBox.style.background = 'rgba(245, 158, 11, 0.08)';
            }
            if (warningText) {
                warningText.innerHTML = `<strong>Caution:</strong> Purine levels are moderate. Stay hydrated.`;
                // Determine icon color if needed, typically handled by CSS but can force here if specific icon is used
                const icon = warningBox.querySelector('.warning-icon');
                if (icon) icon.style.color = '#F59E0B';
                warningText.style.color = '#F59E0B';
            }

        } else {
            // LOW
            // Hide warning box for low risk
            if (warningBox) {
                warningBox.style.display = 'none';
            }
        }
    }

    // --- Glycemic Factor Logic ---
    function updateGlycemicGauge() {
        if (!logData || !logData.meals) return;

        let totalFactorSum = 0;

        Object.values(logData.meals).forEach(meal => {
            const items = meal.items || [];
            // Calculate Meal Totals first to get accurate GL and Carb sums
            const mealTotals = calculateMealTotals(items);

            // Calculate Meal Factor (Average GI) matching the header logic
            const mealFactor = mealTotals.carb > 0 ? (mealTotals.gl * 100) / mealTotals.carb : 0;

            // Sum up the meal factors for the daily total
            totalFactorSum += mealFactor;
        });

        const glBadge = document.getElementById('glBadgeDisplay');
        const glValue = document.getElementById('glValueDisplay');
        const glMarker = document.getElementById('glGaugeMarker') || document.querySelector('#glycemicGaugeWrapper .gauge-marker');
        const msgBox = document.getElementById('glDynamicMessage');

        let riskLabel = "Low";
        let riskColor = "#4ADE80";
        let msg = "Excellent glycemic control.";
        let icon = "fa-check-circle";

        // Thresholds for the Daily Sum of Factors (Estimated based on user data)
        if (totalFactorSum > 150) {
            riskLabel = "High";
            riskColor = "#EF4444";
            msg = "Total Glycemic Load High.";
            icon = "fa-triangle-exclamation";
        } else if (totalFactorSum > 100) {
            riskLabel = "Medium";
            riskColor = "#FACC15";
            msg = "Total Glycemic Load Moderate.";
            icon = "fa-circle-info";
        }

        if (totalFactorSum > 0.1) {
            if (glBadge) glBadge.style.display = 'inline-block';
        }

        if (glValue) {
            glValue.innerHTML = `${Math.round(totalFactorSum)} <small style="font-size: 14px; opacity: 0.6;">CG</small>`;
        }

        if (glBadge) {
            glBadge.innerHTML = `<i class="fa-solid ${icon}"></i> ${riskLabel}`;
            glBadge.style.background = `${riskColor}20`;
            glBadge.style.color = riskColor;
            glBadge.style.borderColor = `${riskColor}30`;
        }

        if (glMarker) {
            const pct = Math.min((totalFactorSum / 200) * 100, 100);
            glMarker.style.left = `${pct}%`;
            const innerMarker = glMarker.querySelector('div');
            if (innerMarker) innerMarker.style.background = riskColor;
        }

        if (msgBox) {
            // Ensure we use flex for visibility if it was hidden
            if (totalFactorSum > 0) {
                msgBox.style.display = 'flex';
            }
            msgBox.innerHTML = `<i class="fa-solid ${icon}" style="font-size: 14px; color: ${riskColor};"></i> <span style="margin-left:8px">${msg}</span>`;
            msgBox.style.color = (totalFactorSum > 150) ? "#FECACA" : (totalFactorSum > 100 ? "#FEF3C7" : "#D1FAE5");
        }

        // Update Limits Pill Badge
        const storedGlLimit = localStorage.getItem('aureus_gl_limit');
        const dailyGlLimit = storedGlLimit ? parseInt(storedGlLimit) : 100;

        const glValuePill = document.getElementById('glValuePill');
        if (glValuePill) {
            glValuePill.innerText = `${Math.round(totalFactorSum)} / ${dailyGlLimit}`;
        }
    }

    // --- Manual GL Logic for Modal ---
    function updateManualGL() {
        const giInput = document.getElementById('manualGI');
        const glValue = document.getElementById('manualGLValueDisplay');
        const glFill = document.getElementById('manualGLGaugeFill');
        const glRisk = document.getElementById('manualGLRiskLabel');

        if (!giInput || !glValue || !glFill || !glRisk) return;

        const gi = parseFloat(giInput.value) || 0;
        const carbInput = document.getElementById('manualCarbs');
        const fiberInput = document.getElementById('manualFiber');
        const carbs = carbInput ? (parseFloat(carbInput.value) || 0) : 0;
        const fiber = fiberInput ? (parseFloat(fiberInput.value) || 0) : 0;
        const netCarbs = Math.max(0, carbs - fiber);

        const gl = (gi * netCarbs) / 100;

        glValue.innerHTML = `${Math.round(gl)}<small style="font-size: 10px; margin-left: 2px; opacity: 0.5;">GL</small>`;
        const pct = Math.min((gl / 30) * 100, 100);
        glFill.style.width = `${pct}%`;

        if (gl > 20) {
            glRisk.innerText = "Alta";
            glRisk.style.color = "#EF4444";
            glFill.style.background = "#EF4444";
        } else if (gl > 10) {
            glRisk.innerText = "Media";
            glRisk.style.color = "#FACC15";
            glFill.style.background = "#FACC15";
        } else {
            glRisk.innerText = "Baja";
            glRisk.style.color = "#34D399";
            glFill.style.background = "#34D399";
        }
    }

    // Attach listeners for real-time manual updates
    document.addEventListener('input', (e) => {
        if (e.target.id === 'manualGI' || e.target.id === 'manualCarbs' || e.target.id === 'manualFiber') {
            updateManualGL();
        }
    });

    function attachEventListeners() {
        // Edit GL Limit
        const btnEditGL = document.getElementById('btnEditGL');
        if (btnEditGL) {
            btnEditGL.onclick = () => {
                const currentLimit = localStorage.getItem('aureus_gl_limit') || "100";
                const newLimit = prompt("Enter Daily Glycemic Load Limit:", currentLimit);
                if (newLimit && !isNaN(parseInt(newLimit))) {
                    localStorage.setItem('aureus_gl_limit', parseInt(newLimit));
                    updateGlycemicGauge(); // Refresh immediately
                }
            };
        }

        // Delete buttons
        document.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.onclick = (e) => {
                const meal = e.currentTarget.dataset.meal;
                const idx = e.currentTarget.dataset.index;
                if (logData.meals[meal] && logData.meals[meal].items) {
                    const itemToDelete = logData.meals[meal].items[idx];
                    if (itemToDelete && itemToDelete.id && window.deleteGranularMealEntry) {
                        window.deleteGranularMealEntry(itemToDelete.id);
                    }
                    logData.meals[meal].items.splice(idx, 1);
                    saveLog();
                }
            };
        });

        // Add buttons (Delegation or specific assignment)
        const addButtons = document.querySelectorAll('.btn-add-meal-dynamic');
        addButtons.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const mealKey = target.dataset.meal;

                // Fallback for label
                let mealLabel = mealKey.toUpperCase();
                const nameEl = target.querySelector('.add-text');
                if (nameEl) {
                    mealLabel = nameEl.innerText;
                } else {
                    // Check for raw text in span if it's the footer button
                    const span = target.querySelector('span');
                    if (span) mealLabel = span.innerText.replace('Add ', '').trim();
                }

                openQuickAddModal(mealKey, mealLabel);
            };
        });
    }

    // --- QUICK ADD MODAL INTERACTION ---

    function openQuickAddModal(mealKey, mealLabel) {
        if (!modal) {
            console.error("Modal not found in DOM");
            return;
        }
        currentTargetMeal = mealKey;
        const displayLabel = mealLabel.replace('Add ', '').replace('ADD ', '').replace(Locales.getTranslation('food_log.add') + ' ', '');
        if (modalTitle) modalTitle.innerText = `${Locales.getTranslation('food_log.add')} ${displayLabel}`;

        renderFavorites();
        resetManualForm();

        // Reset Tabs
        if (tabBtns.length > 0) tabBtns[0].click();

        modal.classList.remove('hidden');
        // Force display flex if class hidden style is not working
        modal.style.display = 'flex';
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        currentTargetMeal = null;
        if (typeof resetManualForm === 'function') resetManualForm();
        if (document.getElementById('manualIngMiniModal')) {
            document.getElementById('manualIngMiniModal').classList.add('hidden');
        }
    }

    function renderFavorites(searchTerm = '') {
        if (!favoritesList) return;

        // Sync search input if it exists
        const searchInput = document.querySelector('.favorites-search-input');
        if (searchInput && searchTerm) {
            searchInput.value = searchTerm;
        }

        favoritesList.innerHTML = '';

        // Try to get dynamic DB from localStorage first
        // Use optimized DB loader to merge static + custom data
        let currentDb = window.getAureusFoodDB ? window.getAureusFoodDB() : ((typeof foodDatabase !== 'undefined') ? foodDatabase : []);

        let favorites = currentDb.filter(item => item.favourite === true);

        if (searchTerm) {
            favorites = favorites.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                (item.category && item.category.toLowerCase().includes(searchTerm))
            );
        }

        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:var(--text-gray);">
                    <i class="fa-regular fa-star" style="font-size:32px; margin-bottom:12px; opacity:0.3;"></i>
                    <p style="font-size:14px;">${searchTerm ? Locales.getTranslation('food_log.no_matches') : Locales.getTranslation('food_log.no_favorites')}</p>
                </div>
            `;
            return;
        }

        const categoryIcons = {
            'Meats': 'fa-drumstick-bite',
            'Seafood': 'fa-fish',
            'Veggie': 'fa-leaf',
            'Fast Food': 'fa-burger',
            'Drinks': 'fa-glass-water',
            'Others': 'fa-utensils'
        };

        favorites.forEach(item => {
            const icon = item.icon || categoryIcons[item.category] || 'fa-utensils';
            const status = item.status || 'safe';

            const card = document.createElement('div');
            card.className = 'fav-item-row';
            card.innerHTML = `
                <div class="fav-icon-wrapper">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="fav-info">
                    <div class="fav-name-row">
                        <span class="fav-name">${item.name}</span>
                        <span class="status-dot ${status}" title="${status.toUpperCase()}"></span>
                    </div>
                    <div class="fav-chips-row">
                        <span class="macro-chip cal">${item.cal || item.cals || 0} kcal</span>
                        <span class="macro-chip p">${item.prot}p</span>
                        <span class="macro-chip f">${item.fat}f</span>
                        <span class="macro-chip c">${item.carb}c</span>
                    </div>
                </div>
                <button class="btn-add-fav" title="Add to Log">
                    <i class="fa-solid fa-plus"></i>
                </button>
            `;

            card.querySelector('.btn-add-fav').addEventListener('click', () => {
                addItemToLog(item);
            });

            favoritesList.appendChild(card);
        });
    }

    // ===== MANUAL ENTRY INGREDIENTS LOGIC =====
    let manualIngredients = [];
    let editingManualIngIdx = -1;

    // --- UI Helpers ---
    const btnToggleGlucose = document.getElementById('btnToggleGlucoseInput');
    if (btnToggleGlucose) {
        // --- Glucose Input is now handled later in the file via addEventListener ---

    }

    function renderManualIngredients() {
        const grid = document.getElementById('manualIngredientsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        manualIngredients.forEach((ing, index) => {
            const card = document.createElement('div');
            card.className = 'ingredient-card-edit';
            card.innerHTML = `
                <span class="ing-name">${ing.name}</span>
                <span class="ing-amount">${ing.amount || ''}</span>
            `;
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                openManualIngModal(index);
            });
            grid.appendChild(card);
        });
    }

    function openManualIngModal(index) {
        editingManualIngIdx = index;
        const miniModal = document.getElementById('manualIngMiniModal');
        const titleEl = document.getElementById('manualIngModalTitle');
        const nameInput = document.getElementById('manualIngEditName');
        const amountInput = document.getElementById('manualIngEditAmount');
        const deleteBtn = document.getElementById('btnDeleteManualIng');

        if (index === -1) {
            titleEl.innerText = 'Añadir Ingrediente';
            nameInput.value = '';
            amountInput.value = '';
            deleteBtn.style.display = 'none';
        } else {
            titleEl.innerText = 'Editar Ingrediente';
            nameInput.value = manualIngredients[index].name || '';
            amountInput.value = manualIngredients[index].amount || '';
            deleteBtn.style.display = 'flex';
        }

        miniModal.classList.remove('hidden');
        nameInput.focus();
    }

    function closeManualIngModal() {
        document.getElementById('manualIngMiniModal')?.classList.add('hidden');
        editingManualIngIdx = -1;
    }

    // Manual Ingredients Event Listeners
    document.getElementById('btnAddManualIng')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openManualIngModal(-1);
    });

    document.getElementById('closeManualIngModal')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeManualIngModal();
    });

    document.getElementById('btnSaveManualIng')?.addEventListener('click', (e) => {
        e.preventDefault();
        const name = document.getElementById('manualIngEditName').value.trim();
        const amount = document.getElementById('manualIngEditAmount').value.trim();

        if (!name) {
            alert('Por favor ingresa un nombre para el ingrediente');
            return;
        }

        if (editingManualIngIdx === -1) {
            manualIngredients.push({ name, amount });
        } else {
            manualIngredients[editingManualIngIdx] = { name, amount };
        }

        renderManualIngredients();
        closeManualIngModal();
    });

    document.getElementById('btnDeleteManualIng')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (editingManualIngIdx > -1) {
            manualIngredients.splice(editingManualIngIdx, 1);
            renderManualIngredients();
            closeManualIngModal();
        }
    });

    document.getElementById('manualIngMiniModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'manualIngMiniModal') {
            closeManualIngModal();
        }
    });

    function addManualItem() {
        const nameEl = document.getElementById('manualName');
        const name = nameEl ? nameEl.value.trim() : '';

        const cals = parseInt(document.getElementById('manualCals')?.value) || 0;
        const purine = parseInt(document.getElementById('manualPurines')?.value) || 0;
        const carb = parseInt(document.getElementById('manualCarbs')?.value) || 0;
        const fat = parseInt(document.getElementById('manualFat')?.value) || 0;
        const prot = parseInt(document.getElementById('manualProtein')?.value) || 0;
        const saveToDb = document.getElementById('chkSaveToDb')?.checked;

        const fiber = parseInt(document.getElementById('manualFiber')?.value) || 0;
        const gi = parseInt(document.getElementById('manualGI')?.value) || 0;

        // Manual Input is Net Carbs
        const gl = (gi * carb) / 100;

        if (!name) {
            alert('Please enter a food name');
            return;
        }

        const item = {
            name: name,
            cals: cals,
            purine: purine,
            carb: carb,
            fat: fat,
            prot: prot,
            highPurine: purine > 150,
            ingredients: manualIngredients.length > 0 ? [...manualIngredients] : undefined,
            gi: gi,
            fiber: fiber,
            gl: gl
        };

        // If checked, save permanently to the database
        if (saveToDb) {
            saveItemToGlobalDb(item);
        }

        addItemToLog(item);
    }

    function saveItemToGlobalDb(item) {
        let db = window.getAureusFoodDB ? window.getAureusFoodDB() : [];
        if (db.length === 0) {
            const stored = localStorage.getItem(getUserKey('aureus_food_db'));
            if (stored) {
                try { db = JSON.parse(stored); } catch (e) { }
            }
        }

        // Prepare for DB schema (uses 'cal' and 'purines' instead of 'cals' and 'purine')
        const dbItem = {
            name: item.name,
            category: "Others",
            cal: item.cals,
            purines: item.purine,
            carb: item.carb,
            fat: item.fat,
            prot: item.prot,
            status: item.purine > 150 ? "danger" : (item.purine > 50 ? "caution" : "safe"),
            tip: "Agregado manualmente por el usuario.",
            favourite: true,
            ingredients: item.ingredients || [],
            gi: item.gi || 0
        };

        db.push(dbItem);
        if (window.saveAureusFoodDB) {
            window.saveAureusFoodDB(db);
        } else {
            localStorage.setItem(getUserKey('aureus_food_db'), JSON.stringify(db));
        }
        console.log("Item saved permanently to global database.");

        // Notify other tabs if needed (though they usually listen to storage event)
        localStorage.setItem(getUserKey('aureus_db_version_update_manual'), Date.now());
    }



    function resetManualForm() {
        if (document.getElementById('manualName')) document.getElementById('manualName').value = '';
        if (document.getElementById('manualCals')) document.getElementById('manualCals').value = '';
        if (document.getElementById('manualPurines')) document.getElementById('manualPurines').value = '';
        if (document.getElementById('manualCarbs')) document.getElementById('manualCarbs').value = '';
        if (document.getElementById('manualFat')) document.getElementById('manualFat').value = '';
        if (document.getElementById('manualProtein')) document.getElementById('manualProtein').value = '';
        if (document.getElementById('manualGI')) document.getElementById('manualGI').value = '';
        if (document.getElementById('chkSaveToDb')) document.getElementById('chkSaveToDb').checked = false;
        // Reset manual ingredients
        manualIngredients = [];
        renderManualIngredients();
        updateManualMiniGLGauge();
    }

    function updateManualMiniGLGauge() {
        const carb = parseInt(document.getElementById('manualCarbs')?.value) || 0;
        const gi = parseInt(document.getElementById('manualGI')?.value) || 0;

        const glValue = Math.round((carb * gi) / 100);

        const glDisplay = document.getElementById('manualGLValueDisplay');
        const fill = document.getElementById('manualGLGaugeFill');
        const label = document.getElementById('manualGLRiskLabel');

        if (glDisplay) glDisplay.innerText = glValue;

        // Visual ranges
        // Low: 0-10 (Green)
        // Mod: 11-19 (Yellow)
        // High: 20+ (Red)

        let widthPct = 0;
        let color = '#10B981'; // Green
        let riskText = 'Low';

        if (glValue > 0) {
            // Scale: let's say max visual GL is ~40 for 100% width
            widthPct = Math.min((glValue / 40) * 100, 100);
        }

        if (glValue >= 20) {
            color = '#EF4444'; // Red
            riskText = 'High';
        } else if (glValue >= 11) {
            color = '#F59E0B'; // Yellow
            riskText = 'Moderate';
        }

        if (fill) {
            fill.style.width = `${widthPct}%`;
            fill.style.backgroundColor = color;
        }

        if (label) {
            label.innerText = riskText;
            label.style.color = color;
        }
    }

    // Attach listeners for Manual Entry live GL updates
    // This should be done once on load or when modal opens
    // We'll attach purely by ID check to be safe
    function attachManualGLListeners() {
        const c = document.getElementById('manualCarbs');
        const g = document.getElementById('manualGI');
        if (c) c.addEventListener('input', updateManualMiniGLGauge);
        if (g) g.addEventListener('input', updateManualMiniGLGauge);
    }





    // Call this once to ensure connected
    attachManualGLListeners();



    // --- Blood Glucose Logic ---
    const btnSaveGlucose = document.getElementById('btnSaveGlucose');
    if (btnSaveGlucose) {
        if (btnSaveGlucose) {
            // Remove old onclick if any
            btnSaveGlucose.onclick = null;

            btnSaveGlucose.addEventListener('click', (e) => {
                e.preventDefault();
                console.group('=== Glucose Save Operation ===');
                const valInput = document.getElementById('glucoseValueInput');
                const contextInput = document.getElementById('glucoseContextInput');
                const detailsInput = document.getElementById('glucoseDetailsInput');
                const timeInput = document.getElementById('glucoseTimeInput');

                if (!valInput) {
                    console.error("Critical: Input elements missing in DOM");
                    console.groupEnd();
                    return;
                }

                let value = parseInt(valInput.value);
                let context = contextInput ? contextInput.value : 'general';
                let details = detailsInput ? detailsInput.value : '';
                let entryTime = timeInput ? timeInput.value : ''; // "HH:MM"

                console.log('Input Value:', value);
                console.log('Context:', context);
                console.log('Details:', details);
                console.log('Time:', entryTime);

                if (!value || isNaN(value)) {
                    alert('Por favor ingrese un valor de glucosa válido.');
                    console.warn('Save aborted: Invalid value');
                    console.groupEnd();
                    return;
                }

                // Safety Limits
                if (value < 20 || value > 600) {
                    alert("Por seguridad, el sistema bloquea entradas menores a 20 mg/dL o mayores a 600 mg/dL. Verifique su medición.");
                    console.warn('Save aborted: Out of safety limits');
                    console.groupEnd();
                    return;
                }

                if (!context) {
                    alert('Por favor seleccione el contexto (Ayunas o Post-prandial).');
                    console.warn('Save aborted: No context');
                    console.groupEnd();
                    return;
                }

                // Health Alerts
                let alertMsg = "";
                if (value < 70) {
                    alertMsg = "ALERTA: Posible Hipoglucemia (<70 mg/dL). Consuma carbohidratos de acción rápida y contacte a su médico si persisten los síntomas.";
                } else if (value > 250) {
                    alertMsg = "ALERTA: Hiperglucemia grave (>250 mg/dL). Contacte a su médico inmediatamente.";
                }

                if (alertMsg) {
                    alert(alertMsg); // Just warn, don't block
                    console.log('User warned about health alert.');
                    /*
                    if (!confirm(alertMsg + "\n\n¿Guardar de todos modos?")) {
                        console.log('Save cancelled by user due to health alert.');
                        console.groupEnd();
                        return;
                    }
                    */
                }

                if (!logData) {
                    console.warn("logData was null on glucose save, initializing...");
                    sanitizeLogData();
                }
                if (!logData.glucose) logData.glucose = [];

                const newEntry = {
                    value: value,
                    context: context,
                    details: details,
                    time: entryTime || new Date().toTimeString().slice(0, 5),
                    timestamp: Date.now()
                };

                console.log('Saving Entry:', newEntry);
                logData.glucose.push(newEntry);

                try {
                    saveLog();
                    console.log('saveLog() called successfully.');

                    // Clear inputs correctly
                    valInput.value = '';
                    if (detailsInput) detailsInput.value = '';
                    if (contextInput) contextInput.value = 'general';
                    if (timeInput) {
                        const now = new Date();
                        timeInput.value = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                    }

                    console.log("Glucose saved successfully.");
                    alert("✅ Glucosa guardada correctamente.");

                    // Explicitly render to be sure (saveLog calls it but we want to be safe)
                    setTimeout(() => renderGlucoseHistory(), 50);

                } catch (error) {
                    console.error('Error during glucose save operation:', error);
                    alert("Hubo un error al guardar: " + error.message);
                }

                console.groupEnd();
            });
        }
    }

    // Make renderGlucoseHistory available globally
    function renderGlucoseHistory() {
        const listContainer = document.getElementById('glucoseDailyList');
        const chartContainer = document.getElementById('glucoseMiniChartContainer');

        // Ensure data exists
        if (!logData) return;
        if (!logData.glucose) logData.glucose = [];

        const readings = logData.glucose;

        // 1. Render List
        if (listContainer) {
            listContainer.innerHTML = '';
        } else {
            console.warn("renderGlucoseHistory: 'glucoseDailyList' element not found in DOM.");
            return;
        }

        if (listContainer) {

            if (readings.length === 0) {
                const noReadingsText = typeof Locales !== 'undefined' ? Locales.getTranslation('food_log.no_readings') : 'No readings today';
                listContainer.innerHTML = `<div style="color:rgba(255,255,255,0.3); font-size:12px; text-align:center; padding:10px;">${noReadingsText}</div>`;
            } else {
                // Sort by timestamp desc for list (newest first)
                const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);

                sorted.forEach((item) => {
                    const el = document.createElement('div');
                    el.className = 'glucose-history-item';
                    el.style.display = 'flex';
                    el.style.justifyContent = 'space-between';
                    el.style.alignItems = 'center';
                    el.style.padding = '8px 12px';
                    el.style.background = 'rgba(255,255,255,0.03)';
                    el.style.marginBottom = '6px';
                    el.style.borderRadius = '8px';
                    el.style.border = '1px solid rgba(255,255,255,0.05)';

                    let contextLabel = 'General';
                    if (item.context === 'fasting') contextLabel = 'Ayunas'; // Localized fixed
                    if (item.context === 'post_prandial') contextLabel = 'Post-Comida';

                    // Status Color
                    let valColor = '#fff';
                    if (item.value < 70 || item.value > 180) valColor = '#F59E0B'; // Warn color
                    if (item.value > 250) valColor = '#EF4444'; // Danger color

                    el.innerHTML = `
                        <div style="display:flex; flex-direction:column;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-weight:700; font-size:15px; color:${valColor};">${item.value}</span>
                                <span style="font-size:11px; color:#a1a1aa;">mg/dL</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                                <span style="font-size:11px; color:rgba(255,255,255,0.5);">${item.time}</span>
                                <span style="font-size:10px; color:#52525b;">•</span>
                                <span style="font-size:11px; color:#3B82F6;">${contextLabel}</span>
                            </div>
                            ${item.details ? `<div style="font-size:11px; color:#71717a; margin-top:2px; font-style:italic;">"${item.details}"</div>` : ''}
                        </div>
                        <button class="btn-delete-glucose" 
                                onclick="console.log('Click deleting:', ${item.timestamp}); window.deleteGlucose('${item.timestamp}')"
                                style="background:rgba(255,255,255,0.05); border:none; color:#71717a; cursor:pointer; width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition: all 0.2s;" 
                                onmouseover="this.style.color='#ef4444'" 
                                onmouseout="this.style.color='#71717a'">
                            <i class="fa-solid fa-trash" style="font-size:16px; pointer-events: none;"></i>
                        </button>
                    `;
                    listContainer.appendChild(el);

                    // No need for separate addEventListener since we used inline onclick
                });
            }
        }

        // 2. Render Sparkline Chart (SVG)
        if (chartContainer) {
            chartContainer.innerHTML = ''; // Clear prev
            if (readings.length > 1) {
                // Ensure dimensions
                const width = chartContainer.offsetWidth || 300;
                const height = chartContainer.offsetHeight || 80; // Increased default height

                // SVG Draw Area Tuning
                // Increased Top padding to 20 to fit labels
                const paddingLeft = 10;
                const paddingRight = 10;
                const paddingTop = 20;
                const paddingBottom = 5;

                // Sort by time ASCENDING for chart
                const chartReadings = [...readings].sort((a, b) => a.timestamp - b.timestamp);

                // Min/Max for Y axis
                const vals = chartReadings.map(r => r.value);
                const minVal = Math.min(...vals) * 0.9;
                const maxVal = Math.max(...vals) * 1.1;
                const range = maxVal - minVal || 1;

                // Time to X axis (minutes from 00:00)
                const getMinutes = (tStr) => {
                    if (!tStr) return 0;
                    const parts = tStr.split(':');
                    const h = parseInt(parts[0]) || 0;
                    const m = parseInt(parts[1]) || 0;
                    return h * 60 + m;
                };

                const times = chartReadings.map(r => getMinutes(r.time));
                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);
                const timeRange = maxTime - minTime || 1;

                // Helper to get X/Y
                const getX = (item, i) => {
                    if (timeRange === 0) {
                        return (i / (chartReadings.length - 1)) * (width - paddingLeft - paddingRight) + paddingLeft;
                    } else {
                        return ((getMinutes(item.time) - minTime) / timeRange) * (width - paddingLeft - paddingRight) + paddingLeft;
                    }
                };

                const getY = (item) => {
                    return height - paddingBottom - (((item.value - minVal) / range) * (height - paddingTop - paddingBottom));
                }

                let points = chartReadings.map((r, i) => {
                    return `${getX(r, i)},${getY(r)} `;
                }).join(' ');

                chartContainer.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#4ADE80" stop-opacity="0.2"/>
                                <stop offset="100%" stop-color="#4ADE80" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <path d="M ${points}" fill="none" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
                        <path d="M ${points} L ${width - paddingRight},${height - paddingBottom} L ${paddingLeft},${height - paddingBottom} Z" fill="url(#chartGrad)" stroke="none"/>
                        
                        <!-- Dots & Labels -->
                        ${chartReadings.map((r, i) => {
                    const x = getX(r, i);
                    const y = getY(r);
                    // Label Y position (above the dot)
                    const labelY = Math.max(y - 8, 10); // Clamp to avoid clipping top
                    return `
                                <circle cx="${x}" cy="${y}" r="3" fill="#4ADE80" />
                                <text x="${x}" y="${labelY}" 
                                      text-anchor="middle" 
                                      fill="rgba(255,255,255,0.6)" 
                                      font-size="10" 
                                      font-family="Outfit, sans-serif" 
                                      font-weight="500">${r.time}</text>
                            `;
                }).join('')}
                    </svg>
                `;
            } else {
                chartContainer.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:rgba(255,255,255,0.2); font-size:11px;">Mínimo 2 registros para gráfico</div>';
            }
        }
    }
    window.renderGlucoseHistory = renderGlucoseHistory;

    function deleteGlucose(timestamp) {
        if (!logData || !logData.glucose) return;

        console.log("Attempting to delete glucose with timestamp:", timestamp);
        // Ensure numeric comparison if possible
        const targetTs = parseInt(timestamp);
        const idx = logData.glucose.findIndex(g => g.timestamp == timestamp || g.timestamp === targetTs);

        if (idx > -1) {
            // REMOVED CONFIRMATION TO FIX USER ISSUE
            logData.glucose.splice(idx, 1);
            saveLog();
            console.log("Glucose entry deleted (immediate).");
            renderGlucoseHistory();
        } else {
            console.error("Glucose entry not found for timestamp:", timestamp);
            alert("No se encontró el registro para eliminar.");
        }
    }
    window.deleteGlucose = deleteGlucose;

    // Auto-populate time when opening toggle
    const btnToggle = document.getElementById('btnToggleGlucoseInput');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const section = document.getElementById('glucoseInputSection');
            const timeInput = document.getElementById('glucoseTimeInput');
            const valInput = document.getElementById('glucoseValueInput'); // Focus target

            if (section) {
                const isHidden = section.style.display === 'none' || section.style.display === '';
                section.style.display = isHidden ? 'block' : 'none';

                if (isHidden) {
                    // Just opened: set time and focus
                    if (timeInput) {
                        const now = new Date();
                        timeInput.value = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                    }
                    if (valInput) valInput.focus();
                }
            }
        });
    }



    function renderWeeklyHistory() {
        // Redesigned for Macros Breakdown (Stacked Bars)
        const container = document.getElementById('macrosChartContainer') || document.querySelector('.weekly-chart-container');
        if (!container) return;

        const currentLang = (window.Locales && window.Locales.currentLang === 'es') ? 'es-ES' :
            (window.Locales && window.Locales.currentLang === 'fr') ? 'fr-FR' : 'en-US';

        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'flex-end';
        container.style.padding = '0 10px';
        container.style.height = '180px';
        container.style.gap = '0';

        const anchorDate = new Date(currentDate);
        const last7Days = [];

        // Generate selected week
        for (let i = 6; i >= 0; i--) {
            const d = new Date(anchorDate);
            d.setDate(anchorDate.getDate() - i);
            last7Days.push(d);
        }

        // Fixed max scale for visual height (e.g. 2500 kcal for full bar height relative scaling)
        const MAX_Y = 2500;

        last7Days.forEach(date => {
            const key = getStorageKey(date);
            const stored = localStorage.getItem(key);

            let dFat = 0, dProt = 0, dCarb = 0, dCals = 0;
            let dGlucoseTotal = 0, dGlucoseCount = 0;
            let glucoseReadings = []; // Store individual readings

            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    if (data.meals) {
                        Object.values(data.meals).forEach(meal => {
                            if (meal.items) {
                                meal.items.forEach(item => {
                                    dFat += (item.fat || 0);
                                    dProt += (item.prot || 0);
                                    dCarb += (item.carb || 0);
                                    dCals += (item.cals || item.cal || 0);
                                });
                            }
                        });
                    }
                    if (data.glucose && data.glucose.length > 0) {
                        data.glucose.forEach(g => {
                            if (g.value) {
                                dGlucoseTotal += parseFloat(g.value);
                                dGlucoseCount++;
                                // Store individual reading
                                glucoseReadings.push({
                                    value: g.value,
                                    time: g.time || '--:--',
                                    context: g.context || 'general',
                                    details: g.details || ''
                                });
                            }
                        });
                        // Sort by time descending (newest first)
                        glucoseReadings.sort((a, b) => {
                            const timeA = a.time.replace(':', '');
                            const timeB = b.time.replace(':', '');
                            return parseInt(timeB) - parseInt(timeA);
                        });
                    }
                } catch (e) { }
            }

            const avgGlucose = dGlucoseCount > 0 ? (dGlucoseTotal / dGlucoseCount) : null;

            // Convert to Cals for height contribution
            const cFat = dFat * 9;
            const cProt = dProt * 4;
            const cCarb = dCarb * 4;

            // Percentages of MAX_Y for height
            const pctFat = Math.min((cFat / MAX_Y) * 100, 100);
            const pctProt = Math.min((cProt / MAX_Y) * 100, 100);
            const pctCarb = Math.min((cCarb / MAX_Y) * 100, 100);

            const isSelected = date.toDateString() === anchorDate.toDateString();
            const dayName = date.toLocaleDateString(currentLang || 'en-US', { weekday: 'short' });

            // Determine if over limit
            // Use stored target if available, else current logData target, else default
            let dayTarget = 2000;
            if (stored) {
                try {
                    const dObj = JSON.parse(stored);
                    if (dObj.targets && dObj.targets.calories) dayTarget = dObj.targets.calories;
                    else if (typeof logData !== 'undefined' && logData.targets) dayTarget = logData.targets.calories;
                } catch (e) { }
            } else if (typeof logData !== 'undefined' && logData.targets) {
                dayTarget = logData.targets.calories;
            }

            const isExceeded = dCals > dayTarget;

            const group = document.createElement('div');
            group.className = 'macro-bar-group';
            group.style.display = 'flex';
            group.style.flexDirection = 'column';
            group.style.alignItems = 'center';
            group.style.gap = '10px';
            group.style.flex = '1';
            group.style.cursor = 'pointer';

            // Stacked Bar
            // Added isExceeded check to class
            group.innerHTML = `
                <div class="stacked-bar-wrapper ${isExceeded ? 'calorie-limit-exceeded' : ''}" style="
                    width: 42px;
                    height: 140px; 
                    background: rgba(255,255,255,0.03); 
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 21px; 
                    position: relative; 
                    overflow: hidden; 
                    display: flex; 
                    flex-direction: column-reverse;
                    align-items: center;
                    gap: 1px; 
                    ${isSelected && !isExceeded ? 'box-shadow: 0 0 0 1px #fff, 0 0 15px rgba(250, 204, 21, 0.2); border-color: #fff;' : ''}
                    transition: all 0.3s ease;
                ">
                    <!-- Fat (Bottom) -->
                    <div class="seg-fat" style="
                        width: 100%; 
                        height: 0%; 
                        background: #FFD740; 
                        transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                        min-height: 2px;
                    " data-h="${pctFat}%"></div>
                    
                    <!-- Prot (Middle) -->
                    <div class="seg-prot" style="
                        width: 100%; 
                        height: 0%; 
                        background: #448AFF; 
                        transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s;
                        min-height: 2px;
                    " data-h="${pctProt}%"></div>
                    
                    <!-- Carb (Top) -->
                    <div class="seg-carb" style="
                        width: 100%; 
                        height: 0%; 
                        background: #FF4081; 
                        transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s;
                        border-radius: 2px 2px 0 0;
                        min-height: 2px;
                    " data-h="${pctCarb}%"></div>
                </div>
                <span style="font-size: 11px; letter-spacing: 0.5px; color: ${isSelected ? '#fff' : '#52525b'}; font-weight: ${isSelected ? '700' : '600'}; text-transform: uppercase;">${dayName}</span>
            `;

            container.appendChild(group);

            // Interaction
            const showTooltip = () => {
                const tooltip = getMacroTooltip();
                const rect = group.getBoundingClientRect();

                // Build glucose readings HTML
                let glucoseHtml = '';
                if (glucoseReadings.length > 0) {
                    glucoseHtml = `
                        <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:10px; color:#71717a; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">${tr('food_log.glucose', 'Glucose')} (${glucoseReadings.length})</div>
                            ${glucoseReadings.slice(0, 5).map(g => {
                        let contextLabel = 'General';
                        if (g.context === 'fasting') contextLabel = 'Ayunas';
                        if (g.context === 'post_prandial') contextLabel = 'Post-Comida';

                        return `
                                    <div style="display:flex; align-items:flex-start; gap:8px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.03);">
                                        <div style="display:flex; flex-direction:column;">
                                            <span style="font-weight:700; font-size:14px; color:#4ADE80;">${g.value}</span>
                                            <span style="font-size:9px; color:#71717a;">mg/dL</span>
                                        </div>
                                        <div style="display:flex; flex-direction:column; flex:1;">
                                            <div style="display:flex; align-items:center; gap:4px;">
                                                <span style="font-size:10px; color:rgba(255,255,255,0.5);">${g.time}</span>
                                                <span style="color:#3f3f46;">•</span>
                                                <span style="font-size:10px; color:#3B82F6;">${contextLabel}</span>
                                            </div>
                                            ${g.details ? `<span style="font-size:9px; color:#52525b; font-style:italic;">"${g.details}"</span>` : ''}
                                        </div>
                                    </div>
                                `;
                    }).join('')}
                            ${glucoseReadings.length > 5 ? `<div style="font-size:9px; color:#52525b; text-align:center; margin-top:4px;">+${glucoseReadings.length - 5} más...</div>` : ''}
                        </div>
                    `;
                } else {
                    glucoseHtml = `
                        <div style="display:flex; justify-content:space-between; color:#a1a1aa; gap:16px; margin-top:4px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.05);">
                            <span>${tr('food_log.glucose', 'Glucose')}</span>
                            <span style="color:#52525b; font-weight:600;">--</span>
                        </div>
                    `;
                }

                tooltip.innerHTML = `
                    <div style="font-weight:700; margin-bottom:6px; color:#fff; border-bottom:1px solid #333; padding-bottom:4px;">${date.toLocaleDateString(currentLang || 'en-US', { month: 'short', day: 'numeric', weekday: 'long' })}</div>
                    <div style="display:flex; justify-content:space-between; color:#a1a1aa; gap:16px;"><span>KCAL</span> <span style="color:#fff; font-weight:600;">${Math.round(dCals).toLocaleString('en-US')}</span></div>
                    <div style="display:flex; justify-content:space-between; color:#a1a1aa; gap:16px;"><span>${tr('dashboard.carbs', 'Carbs')}</span> <span style="color:#FF4081; font-weight:600;">${Math.round(dCarb).toLocaleString('en-US')}g</span></div>
                    <div style="display:flex; justify-content:space-between; color:#a1a1aa; gap:16px;"><span>${tr('dashboard.protein', 'Prot')}</span> <span style="color:#448AFF; font-weight:600;">${Math.round(dProt).toLocaleString('en-US')}g</span></div>
                    <div style="display:flex; justify-content:space-between; color:#a1a1aa; gap:16px;"><span>${tr('dashboard.fat', 'Fat')}</span> <span style="color:#FFD740; font-weight:600;">${Math.round(dFat).toLocaleString('en-US')}g</span></div>
                    ${glucoseHtml}
                `;

                tooltip.style.display = 'block';
                const leftPos = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                const topPos = rect.top - tooltip.offsetHeight - 8;

                tooltip.style.left = `${leftPos}px`;
                tooltip.style.top = `${topPos}px`;
            };

            const hideTooltip = () => {
                const tooltip = getMacroTooltip();
                tooltip.style.display = 'none';
            };

            group.onclick = () => {
                currentDate = new Date(date);
                loadLogForDate(currentDate);
            };

            group.addEventListener('mouseenter', showTooltip);
            group.addEventListener('mouseleave', hideTooltip);

            // Animate
            setTimeout(() => {
                const f = group.querySelector('.seg-fat');
                const p = group.querySelector('.seg-prot');
                const c = group.querySelector('.seg-carb');
                if (f) f.style.height = f.dataset.h;
                if (p) p.style.height = p.dataset.h;
                if (c) c.style.height = c.dataset.h;
            }, 100);
        });
    }

    function getMacroTooltip() {
        let t = document.getElementById('macro-chart-tooltip');
        if (!t) {
            t = document.createElement('div');
            t.id = 'macro-chart-tooltip';
            t.style.position = 'fixed';
            t.style.zIndex = '9999';
            t.style.background = '#18181b';
            t.style.border = '1px solid #3f3f46';
            t.style.borderRadius = '8px';
            t.style.padding = '12px';
            t.style.pointerEvents = 'none';
            t.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
            t.style.fontFamily = 'Inter, sans-serif';
            t.style.fontSize = '12px';
            t.style.lineHeight = '1.6';
            t.style.minWidth = '140px';
            document.body.appendChild(t);
        }
        return t;
    }

    function addItemToLog(item) {
        if (!currentTargetMeal) return;

        console.log(`Adding item to ${currentTargetMeal}: `, item);

        const newItem = {
            id: item.id || crypto.randomUUID(),
            ...item,
            cals: item.cals || item.cal || 0,
            purine: (item.purine !== undefined) ? item.purine : (item.purines || 0),
            carb: item.carb || item.carbs || 0,
            fat: item.fat || 0,
            prot: item.prot || item.protein || 0,
            highPurine: item.highPurine !== undefined ? item.highPurine : ((item.purines || item.purine || 0) > 150)
        };

        if (logData && logData.meals && logData.meals[currentTargetMeal]) {
            logData.meals[currentTargetMeal].items.push(newItem);
            saveLog();
            closeModal();
            console.log("Item added and log saved.");

            // Refresh chart
            renderWeeklyHistory();
        } else {
            console.error("Could not add item, invalid logData structure");
        }
    }

    // Initial render
    seedMockHistory();
    loadLogForDate(currentDate);

    function seedMockHistory() {
        // Only run if flag not set? Or just run. User asked for it.
        // We will inject data for Dec 14-20, 2025.
        const mockDays = [
            { day: 14, cals: 1850 }, // Sun
            { day: 15, cals: 2100 }, // Mon
            { day: 16, cals: 1950 }, // Tue
            { day: 17, cals: 2250 }, // Wed
            { day: 18, cals: 1700 }, // Thu
            { day: 19, cals: 2400 }, // Fri
            { day: 20, cals: 1900 }  // Sat
        ];

        mockDays.forEach(md => {
            const dateStr = `2025 - 12 - ${md.day} `;
            const key = getUserKey(`aureus_log_${dateStr} `);

            // Skip if user already has data for this date
            if (localStorage.getItem(key)) return;

            const totalCals = md.cals;
            // Random noise 0.9 - 1.1
            const r = () => 0.9 + Math.random() * 0.2;

            // Varied macros proportional to Calories
            const pCals = totalCals * 0.25 * r();
            const fCals = totalCals * 0.35 * r();
            const cCals = totalCals * 0.40 * r();

            const pGrams = Math.floor(pCals / 4);
            const fGrams = Math.floor(fCals / 9);
            const cGrams = Math.floor(cCals / 4);

            const split = (val) => [Math.floor(val * 0.3), Math.floor(val * 0.4), Math.floor(val * 0.3)];

            const pS = split(pGrams);
            const fS = split(fGrams);
            const cS = split(cGrams);
            const calS = split(totalCals);

            const mockLog = {
                date: `${md.day} /12/2025`,
                meals: {
                    breakfast: {
                        time: "08:30 AM",
                        items: [{ name: "Balanced Breakfast", cals: calS[0], prot: pS[0], carb: cS[0], fat: fS[0] }]
                    },
                    lunch: {
                        time: "01:00 PM",
                        items: [{ name: "Power Lunch", cals: calS[1], prot: pS[1], carb: cS[1], fat: fS[1] }]
                    },
                    dinner: {
                        time: "07:30 PM",
                        items: [{ name: "Recovery Dinner", cals: calS[2], prot: pS[2], carb: cS[2], fat: fS[2] }]
                    },
                    snacks: { time: "--:--", items: [] }
                },
                targets: { calories: 2000, fat: 150, prot: 150, carb: 100 }
            };

            localStorage.setItem(key, JSON.stringify(mockLog));
        });
        console.log("Mock history re-seeded with varied macros.");
    }

    // Sync from other page
    window.addEventListener('storage', (e) => {
        if (e.key === getUserKey('aureus_user_settings') ||
            (e.key && e.key.includes('_aureus_log_')) ||
            e.key === getUserKey('aureus_targets_updated') ||
            e.key === 'aureus_active_user') {
            loadLogForDate(currentDate);
        }
    });

    // --- Global Save Button Integration ---
    // Listen for the global save event from the header's "SAVE CHANGES" button
    document.addEventListener('aureus-global-save', (e) => {
        console.log('Global save event received in Food Logger');

        // Force save current log data to localStorage
        if (logData) {
            saveLog();
            console.log('Food log saved via global save button');
        }

        // Note: Supabase sync is now handled centrally by syncAllDataToSupabase() in global-sync.js
        // The legacy syncToSupabase() function using 'food_logs' table is deprecated
    });

    // Optional Supabase sync function
    async function syncToSupabase() {
        if (!window.aureusSupabase || !logData) return;

        try {
            const dateKey = getStorageKey(currentDate);
            const userId = window.getActiveUser();

            console.log('Syncing to Supabase...', { userId, dateKey });

            const { data, error } = await window.aureusSupabase.client
                .from('food_logs')
                .upsert({
                    user_id: userId,
                    date_key: dateKey,
                    log_data: logData,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            console.log('Food log synced to Supabase successfully');
        } catch (err) {
            console.error('Supabase sync failed:', err);
            // Fail silently - data is still saved to localStorage
        }
    }

    // ===== AI FOOD SCANNER =====
    const btnAIScan = document.getElementById('btnAIScan');
    const btnTakePhoto = document.getElementById('btnTakePhoto');
    const btnUploadPhoto = document.getElementById('btnUploadPhoto');
    const photoInput = document.getElementById('photoInput');
    const imagePreview = document.getElementById('imagePreview');
    const btnAddScannedFood = document.getElementById('aiAddBtn');
    const btnScanAgain = document.getElementById('btnScanAgain');

    let scannedFoodData = null;

    async function openAIScanModal() {
        console.log('openAIScanModal: Checking auth...');

        // Removed Exposed API Key Check
        // Verification happens at Edge Function level

        console.log('openAIScanModal: Opening Quick Add modal...');
        // Open Quick Add modal and switch to AI Scan tab
        openQuickAddModal('breakfast', 'BREAKFAST');

        console.log('openAIScanModal: Switching to aiscan tab...');
        switchTab('aiscan');

        console.log('openAIScanModal: Resetting scan modal...');
        resetScanModal();

        console.log('openAIScanModal: Complete!');
    }


    function resetScanModal() {
        document.querySelectorAll('.scan-section').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        const inputSection = document.getElementById('scanInputSection');
        if (inputSection) {
            inputSection.classList.add('active');
            inputSection.classList.remove('hidden');
        }

        if (imagePreview) {
            imagePreview.classList.add('hidden'); // This will use the new global .hidden class
            imagePreview.innerHTML = '';
        }
        scannedFoodData = null;
    }

    async function processImageWithAI(imageFile) {
        // Switch to processing
        document.querySelectorAll('.scan-section').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        const processingSection = document.getElementById('scanProcessingSection');
        if (processingSection) {
            processingSection.classList.add('active');
            processingSection.classList.remove('hidden');
        }

        try {
            // Convert image to base64
            const base64Image = await fileToBase64(imageFile);

            // Call Gemini Vision API
            const result = await analyzeFood(base64Image);

            // Show results
            displayScanResults(result);
        } catch (error) {
            console.error('AI scan error:', error);
            alert('❌ Error al analizar la imagen: ' + error.message);
            resetScanModal();
        }
    }

    // List of Gemini models to try (in order of preference)
    const GEMINI_MODELS = [
        'gemini-1.5-flash',          // Stable Flash (Best default)
        'gemini-1.5-flash-8b',       // High-speed/low-cost
        'gemini-1.5-pro',            // Stable Pro
        'gemini-2.0-flash-exp',      // Experimental (moved to end due to rate limits)
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest'
    ];

    console.log('✅ AI System v4 Loaded: Models updated');

    // Helper: Delay function
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Helper: Fetch with exponential backoff for 429 errors
    async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
        try {
            const response = await fetch(url, options);

            // If Rate Limited (429), retry
            if (response.status === 429 && retries > 0) {
                console.warn(`⚠️ Rate limited(429).Retrying in ${backoff}ms...`);
                await delay(backoff);
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }

            // If 503 (Service Unavailable), also retry
            if (response.status === 503 && retries > 0) {
                console.warn(`⚠️ Service unavailable(503).Retrying in ${backoff}ms...`);
                await delay(backoff);
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }

            return response;
        } catch (error) {
            if (retries > 0) {
                console.warn(`⚠️ Network error.Retrying in ${backoff}ms...`, error);
                await delay(backoff);
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    // Helper: Fetch available models dynamically
    // Simplified since we are using Proxy - we stick to known models or assume the proxy handles it.
    async function fetchAvailableModels() {
        return GEMINI_MODELS;
    }

    async function analyzeFood(base64Image) {
        // Check authentication state instead of API Key
        // API Key is now managed by Supabase Edge Function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('⚠️ Debes iniciar sesión para usar el escáner AI.');
            return;
        }

        const prompt = `Analiza esta imagen de comida y extrae la información nutricional estimada para una porción típica. 

Responde SOLO en formato JSON sin markdown, sin bloques de código, solo el objeto JSON puro:
{
  "name": "nombre del plato en español",
  "calories": número de calorías (solo el número),
  "purines": miligramos de purinas (usa 0 si no sabes, o estima basado en ingredientes),
  "carbs": gramos de carbohidratos netos (solo el número),
  "fat": gramos de grasa (solo el número),
  "protein": número de proteína (solo el número),
  "gi": índice glucémico estimado (solo el número, 0-100),
  "fiber": gramos de fibra (solo el número),
  "confidence": "high/medium/low",
  "portionSize": "descripción breve del tamaño de porción",
  "ingredients": [
    {"name": "nombre del ingrediente", "amount": "ej: 100g o 2 piezas"}
  ]
}

IMPORTANTE: 
- Responde SOLO el JSON, sin texto adicional
- Todos los números deben ser enteros sin unidades
- Si ves carne roja, mariscos o vísceras, estima purinas altas (150-200mg)
- Si es pollo/pescado blanco, purinas medias (50-100mg)
- Si son vegetales/frutas, purinas bajas (0-30mg)`;

        let lastError = null;
        const availableModels = await fetchAvailableModels();

        // 2. Try each model until one works
        for (const model of availableModels) {
            try {
                console.log(`🤖 Trying model (via Edge Function): ${model}...`);

                // Call Supabase Edge Function
                const { data, error } = await supabase.functions.invoke('ai-proxy', {
                    body: {
                        model: model,
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: 'image/jpeg',
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    }
                });

                if (error) throw new Error(error.message || 'Error invoking Edge Function');

                if (!data || !data.candidates || !data.candidates[0]) {
                    console.warn(`Model ${model} returned invalid data`, data);
                    throw new Error('Invalid AI response structure');
                }

                const resultText = data.candidates[0].content.parts[0].text;
                // Clean markdown if present
                const cleanJson = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;

                try {
                    const parsed = JSON.parse(cleanJson);
                    console.log(`✅ Success with model: ${model}`);
                    return {
                        name: parsed.name,
                        calories: parseInt(parsed.calories) || 0,
                        purines: parseInt(parsed.purines) || 0,
                        carbs: parseInt(parsed.carbs) || 0,
                        fat: parseInt(parsed.fat) || 0,
                        protein: parseInt(parsed.protein) || 0,
                        gi: parseInt(parsed.gi) || 0,
                        fiber: parseInt(parsed.fiber) || 0,
                        confidence: parsed.confidence || 'medium',
                        portionSize: parsed.portionSize || 'Porción estándar',
                        ingredients: parsed.ingredients || []
                    };
                } catch (pe) {
                    console.warn("JSON parse error", pe, cleanJson);
                    throw pe;
                }

            } catch (err) {
                console.warn(`❌ Model ${model} failed:`, err);
                lastError = err;
                // Continue to next model
            }
        }

        throw lastError || new Error('Todos los modelos de IA están saturados. Por favor intenta en unos minutos.');
    }

    let currentQuantity = 1;
    let baseCalories = 0;

    function displayScanResults(data) {
        scannedFoodData = data;
        currentQuantity = 1;
        baseCalories = data.calories;

        document.querySelectorAll('.scan-section').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        const resultsSection = document.getElementById('scanResultsSection');
        if (resultsSection) {
            resultsSection.classList.add('active');
            resultsSection.classList.remove('hidden');
            resultsSection.style.display = 'block';
        }

        // Helper for confidence color
        const getConfColor = (level) => {
            if (level === 'high') return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
            if (level === 'low') return { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' };
            return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' };
        };
        const confColors = getConfColor(data.confidence || 'medium');

        // REFACTOR: Use Manual Entry "Pod" Layout
        if (resultsSection) {
            resultsSection.innerHTML = `
                <div class="scan-results" style="max-height: 60vh; overflow-y: auto; padding: 0 30px; box-sizing: border-box; width: 100%;">
                    <!-- Top Summary: Image & Name -->
                    <div class="result-summary-card" style="margin-bottom: 25px; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                        <div id="scanResultImageThumb" class="result-thumb" style="width: 80px; height: 80px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>
                        <div class="result-info" style="width: 100%; display: flex; flex-direction: column; justify-content: center;">
                             <div class="manual-form-grid" style="padding:0; display:flex; flex-direction:column; gap: 8px;">
                                 <div class="form-group full-width food-name-pod">
                                    <label data-i18n="food_log.food_name" style="margin-left: 4px; font-size: 11px; opacity: 0.5;">Food Name</label>
                                    <div class="input-wrapper">
                                        <i class="fa-solid fa-bowl-food input-icon"></i>
                                        <input type="text" id="scanFoodName" class="premium-input" value="${data.name}" style="padding-left: 54px !important;">
                                    </div>
                                </div>
                            </div>
                             <div class="confidence-wrapper" style="margin-top:12px; display:flex; align-items:center; gap:10px;">
                                 <span style="font-size:11px; color:rgba(255,255,255,0.3); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Confidence</span>
                                 <span class="confidence-badge" id="confidenceBadge" style="background:${confColors.bg}; color:${confColors.text}; margin:0; padding: 4px 12px; border-radius:8px; font-size:11px; font-weight:800; letter-spacing:0.5px; border:1px solid ${confColors.text}20;">${(data.confidence || 'medium').toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Macro Pods Grid -->
                    <div class="manual-form-grid" style="padding: 0 0 25px 0; gap: 12px;">
                         <!-- Calories (Full Width) -->
                         <div class="form-group calories-pod">
                            <label data-i18n="food_log.calories">Calories</label>
                            <div class="input-wrapper">
                                <i class="fa-solid fa-fire input-icon" style="color:#F97316;"></i>
                                <input type="number" id="scanCalorieInput" class="premium-input" value="${data.calories}" style="padding-left: 54px !important;">
                                <span class="unit-label">kcal</span>
                            </div>
                        </div>



                        <!-- Carbs -->
                        <div class="form-group carbs-pod">
                            <label data-i18n="dashboard.net_carbs">Net Carbs</label>
                            <div class="input-wrapper">
                                <i class="fa-solid fa-wheat-awn input-icon" style="color:#f472b6;"></i>
                                <input type="number" id="scanCarbsInput" class="premium-input" value="${Number(data.carbs) || 0}" style="padding-left: 54px !important;">
                                <span class="unit-label">g</span>
                            </div>
                        </div>

                         <!-- Fat -->
                        <div class="form-group fat-pod">
                            <label data-i18n="dashboard.fat">Fat</label>
                            <div class="input-wrapper">
                                <i class="fa-solid fa-droplet input-icon" style="color:#A855F7;"></i>
                                <input type="number" id="scanFatInput" class="premium-input" value="${data.fat || 0}" style="padding-left: 54px !important;">
                                <span class="unit-label">g</span>
                            </div>
                        </div>

                         <!-- Protein -->
                        <div class="form-group protein-pod">
                            <label data-i18n="dashboard.protein">Protein</label>
                            <div class="input-wrapper">
                                <i class="fa-solid fa-dumbbell input-icon" style="color:#22C55E;"></i>
                                <input type="number" id="scanProteinInput" class="premium-input" value="${Number(data.protein) || 0}" style="padding-left: 54px !important;">
                                <span class="unit-label">g</span>
                            </div>
                        </div>

                         <!-- Purines -->
                        <div class="form-group purines-pod">
                            <label data-i18n="food_log.purines">Purines</label>
                            <div class="input-wrapper">
                                <i class="fa-solid fa-flask input-icon" style="color:#EF4444;"></i>
                                <input type="number" id="scanPurinesInput" class="premium-input" value="${data.purines || 0}" style="padding-left: 54px !important;">
                                <span class="unit-label">mg</span>
                            </div>
                        </div>

                         <!-- Fiber (for GL calculation) -->
                        <div class="form-group fiber-pod">
                            <label data-i18n="dashboard.fiber">Fiber</label>
                            <div class="input-wrapper">
                                <i class="fa-solid fa-leaf input-icon" style="color:#4ADE80;"></i>
                                <input type="number" id="scanFiberInput" class="premium-input" value="${Number(data.fiber) || 0}" style="padding-left: 54px !important;">
                                <span class="unit-label">g</span>
                            </div>
                        </div>

                        <!-- Glycemic Factor Manual Entry Redesigned (AI Scan Version) -->
                        <div class="form-group full-width glycemic-editor-container" style="grid-column: 1 / -1; margin-top: 10px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <label class="section-label" style="margin-bottom: 0; font-weight: 700; font-size: 11px; color: #a1a1aa; letter-spacing: 0.08em; text-transform: uppercase;">Factor Glucémico</label>
                                <span id="scanGLValueDisplay" style="font-weight: 800; font-size: 18px; color: #fff; letter-spacing: -0.02em;">0<small style="font-size: 10px; margin-left: 2px; opacity: 0.5;">CG</small></span>
                            </div>

                            <div style="display: flex; gap: 20px; align-items: center;">
                                <div style="width: 100px;">
                                    <label style="font-size: 10px; margin-bottom: 8px; display: block; color: #71717a; font-weight: 600; text-transform: uppercase;">Índice (IG)</label>
                                    <input type="number" id="scanGIInput" class="premium-input-mini" value="${data.gi || 0}" style="text-align: center; font-weight: 700; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; padding: 8px; width: 100%;">
                                </div>

                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <span id="scanGLRiskLabel" style="font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.02em;">Baja</span>
                                        <div style="font-size: 9px; color: #52525b; font-weight: 600; display: flex; gap: 6px;">
                                            <span>0-10</span><span>11-19</span><span>20+</span>
                                        </div>
                                    </div>
                                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; position: relative; overflow: hidden;">
                                        <div id="scanGLGaugeFill" style="width: 0%; height: 100%; background: #34d399; border-radius: 10px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(52, 211, 153, 0.3);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ingredients Section -->
                    <div class="ingredients-section" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                        <h5 style="font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Ingredientes</h5>
                        <div id="ingredientsGrid" class="ingredients-grid">
                            <!-- Helper text or skeleton -->
                        </div>
                    </div>

                    <!-- Actions Footer -->
                    <div class="result-actions" style="margin-top:25px; padding-bottom: 20px;">
                        <div class="save-favorite-option" style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 12px;">
                            <input type="checkbox" id="chkSaveScannedAsFavorite" checked style="width: 18px; height: 18px; accent-color: #D4FC79;">
                            <label for="chkSaveScannedAsFavorite" style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); cursor: pointer;">
                                <i class="fa-solid fa-star" style="color: #FACC15; margin-right: 5px;"></i>
                                Guardar en favoritos
                            </label>
                        </div>

                        <div style="display: flex; gap: 12px;">
                            <button class="btn-secondary-action" id="rescanBtn" data-i18n="food_log.scan_again">Rescan</button>
                            <button class="btn-primary-action" id="aiAddBtn" data-i18n="food_log.add_item" style="margin-top:0;">Add Meal</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Update Thumbnail
        const thumb = document.getElementById('scanResultImageThumb');
        const photoInput = document.getElementById('photoInput');
        if (thumb && photoInput && photoInput.files && photoInput.files[0]) {
            const url = URL.createObjectURL(photoInput.files[0]);
            thumb.style.backgroundImage = `url(${url})`;
        }

        renderIngredientsGrid();

        // Initial GL update for scan
        updateScanGL();
    }

    function updateScanGL() {
        const giInput = document.getElementById('scanGIInput');
        const carbInput = document.getElementById('scanCarbsInput');
        const fiberInput = document.getElementById('scanFiberInput');
        const glValue = document.getElementById('scanGLValueDisplay');
        const glFill = document.getElementById('scanGLGaugeFill');
        const glRisk = document.getElementById('scanGLRiskLabel');

        if (!giInput || !glValue || !glFill || !glRisk) return;

        const gi = parseFloat(giInput.value) || 0;
        const carbs = carbInput ? (parseFloat(carbInput.value) || 0) : 0;
        const fiber = fiberInput ? (parseFloat(fiberInput.value) || 0) : 0;
        const netCarbs = Math.max(0, carbs - fiber);

        const gl = (gi * netCarbs) / 100;

        // Update UI
        glValue.innerHTML = `${Math.round(gl)}<small style="font-size: 10px; margin-left: 2px; opacity: 0.5;">CG</small>`;

        const pct = Math.min((gl / 30) * 100, 100);
        glFill.style.width = `${pct}%`;

        if (gl > 20) {
            glRisk.innerText = "Alta";
            glRisk.style.color = "#EF4444";
            glFill.style.background = "#EF4444";
        } else if (gl > 10) {
            glRisk.innerText = "Media";
            glRisk.style.color = "#FACC15";
            glFill.style.background = "#FACC15";
        } else {
            glRisk.innerText = "Baja";
            glRisk.style.color = "#34D399";
            glFill.style.background = "#34D399";
        }
    }

    // --- INTERACTIVE INGREDIENTS LOGIC ---
    let editingIngredientIndex = -1;

    function renderIngredientsGrid() {
        const grid = document.getElementById('ingredientsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const ingredients = scannedFoodData.ingredients || [];

        // Render ingredient cards
        ingredients.forEach((ing, index) => {
            const card = document.createElement('div');
            card.className = 'ingredient-card';
            card.style.cursor = 'pointer'; // Make it clear it's clickable

            // Add click handler for editing
            card.onclick = () => openIngredientEdit(index);

            card.innerHTML = `
                <span class="ing-name">${ing.name}</span>
                <span class="ing-amount">${ing.amount || ''}</span>
            `;
            grid.appendChild(card);
        });

        // Add "Add Ingredient" card
        const addCard = document.createElement('div');
        addCard.className = 'ingredient-card add-ingredient-card';
        addCard.onclick = openIngredientSearch;
        addCard.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            <span class="ing-name">Añadir</span>
        `;
        grid.appendChild(addCard);
    }

    function openIngredientSearch() {
        const modal = document.getElementById('ingredientSearchModal');
        if (modal) {
            modal.classList.remove('hidden');
            const input = document.getElementById('ingredientSearchInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            const results = document.getElementById('ingredientSearchResults');
            if (results) results.innerHTML = '';
        }
    }

    function closeIngredientSearch() {
        document.getElementById('ingredientSearchModal')?.classList.add('hidden');
    }

    function openIngredientEdit(index) {
        editingIngredientIndex = index;
        const ing = scannedFoodData.ingredients[index];
        document.getElementById('editIngName').value = ing.name;
        document.getElementById('editIngAmount').value = ing.amount || '';
        document.getElementById('ingredientEditModal')?.classList.remove('hidden');
    }

    function closeIngredientEdit() {
        document.getElementById('ingredientEditModal')?.classList.add('hidden');
        editingIngredientIndex = -1;
    }

    // --- Search Logic ---
    const searchInput = document.getElementById('ingredientSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const resultsContainer = document.getElementById('ingredientSearchResults');
            resultsContainer.innerHTML = '';

            if (term.length < 2) return;

            // Search in foodDatabase (global)
            let matches = [];
            if (typeof foodDatabase !== 'undefined') {
                matches = Object.values(foodDatabase).filter(f =>
                    f.name.toLowerCase().includes(term)
                ).slice(0, 8);
            }

            matches.forEach(food => {
                const item = document.createElement('div');
                item.className = 'mini-result-item';
                item.innerHTML = `
                    <div class="mini-result-icon">${food.icon || '🍽️'}</div>
                    <div class="mini-result-info">
                        <h4>${food.name}</h4>
                    </div>
                `;
                item.onclick = () => selectIngredientToAdd(food);
                resultsContainer.appendChild(item);
            });

            if (matches.length === 0) {
                resultsContainer.innerHTML = '<div style="padding:10px; color:#aaa; font-size:12px; text-align:center;">No se encontraron resultados</div>';
            }
        });
    }

    function selectIngredientToAdd(food) {
        if (!scannedFoodData.ingredients) scannedFoodData.ingredients = [];
        scannedFoodData.ingredients.push({
            name: food.name,
            amount: food.amount || "1 porción"
        });
        renderIngredientsGrid();
        closeIngredientSearch();
    }

    // --- Edit Modal Actions ---
    const btnSaveIng = document.getElementById('btnSaveIngredient');
    if (btnSaveIng) {
        btnSaveIng.addEventListener('click', () => {
            if (editingIngredientIndex > -1 && scannedFoodData.ingredients) {
                const newAmount = document.getElementById('editIngAmount').value;
                scannedFoodData.ingredients[editingIngredientIndex].amount = newAmount;
                renderIngredientsGrid();
                closeIngredientEdit();
            }
        });
    }

    const btnDeleteIng = document.getElementById('btnDeleteIngredient');
    if (btnDeleteIng) {
        btnDeleteIng.addEventListener('click', () => {
            if (editingIngredientIndex > -1 && scannedFoodData.ingredients) {
                scannedFoodData.ingredients.splice(editingIngredientIndex, 1);
                renderIngredientsGrid();
                closeIngredientEdit();
            }
        });
    }

    // --- Manual Add Logic ---
    document.getElementById('btnAddManualIngredient')?.addEventListener('click', () => {
        const name = document.getElementById('manualIngName').value;
        const amount = document.getElementById('manualIngAmount').value;

        if (name && amount) {
            selectIngredientToAdd({ name: name, amount: amount });

            // Clear inputs
            document.getElementById('manualIngName').value = '';
            document.getElementById('manualIngAmount').value = '';
        }
    });

    // --- Modal Close Listeners ---
    document.getElementById('closeIngredientSearchBtn')?.addEventListener('click', closeIngredientSearch);
    document.getElementById('cancelIngredientSearch')?.addEventListener('click', closeIngredientSearch);
    document.getElementById('closeIngredientEditBtn')?.addEventListener('click', closeIngredientEdit);

    // Set up Adjustment listeners once (when the script loads)
    function initAdjustmentControls() {
        const btnMinus = document.getElementById('btnDecreaseQty');
        const btnPlus = document.getElementById('btnIncreaseQty');
        const qtyEl = document.getElementById('scanQuantity');
        const calInput = document.getElementById('scanCalorieInput');

        if (btnMinus) {
            btnMinus.onclick = () => {
                // User requirement: This button should decrease calories by 10
                if (calInput) {
                    let val = parseInt(calInput.value) || 0;
                    val = Math.max(0, val - 10);
                    calInput.value = val;
                }
            };
        }
        if (btnPlus) {
            btnPlus.onclick = () => {
                // User requirement: This button should increase calories by 10
                if (calInput) {
                    let val = parseInt(calInput.value) || 0;
                    val += 10;
                    calInput.value = val;
                }
            };
        }

        // Real-time GL updates for AI Scan
        const carbInput = document.getElementById('scanCarbsInput');
        const fiberInput = document.getElementById('scanFiberInput');
        const giInput = document.getElementById('scanGIInput');

        if (carbInput) carbInput.oninput = updateScanGL;
        if (fiberInput) fiberInput.oninput = updateScanGL;
        if (giInput) giInput.oninput = updateScanGL;
    }

    // Call init (this assumes it's within the scope where these IDs exist)
    setTimeout(initAdjustmentControls, 500);

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Event Listeners
    // No longer using btnAIScan in current layout, but keeping logic for future triggers
    /*
    if (btnAIScan) {
        btnAIScan.addEventListener('click', () => {
            openAIScanModal();
        });
    }
    */


    if (btnTakePhoto) {
        btnTakePhoto.addEventListener('click', () => {
            photoInput.setAttribute('capture', 'environment');
            photoInput.click();
        });
    }

    if (btnUploadPhoto) {
        btnUploadPhoto.addEventListener('click', () => {
            photoInput.removeAttribute('capture');
            photoInput.click();
        });
    }

    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Show preview
                const url = URL.createObjectURL(file);
                imagePreview.innerHTML = `<img src="${url}" alt="Food preview" style="width: 100%; border-radius: 12px;">`;
                imagePreview.classList.remove('hidden');

                // Process with AI
                setTimeout(() => processImageWithAI(file), 500);
            }
        });
    }

    // --- Delegated Listener for Dynamic AI Scan Buttons ---
    const resultsSection = document.getElementById('scanResultsSection');
    if (resultsSection) {
        resultsSection.addEventListener('click', (e) => {
            // Add Meal Button
            const addBtn = e.target.closest('#aiAddBtn');
            if (addBtn && scannedFoodData) {
                // Read from Inputs if they exist (Premium UI), otherwise fall back to data
                const nameInput = document.getElementById('scanFoodName');
                const calInput = document.getElementById('scanCalorieInput');
                const purInput = document.getElementById('scanPurinesInput');
                const carbInput = document.getElementById('scanCarbsInput');
                const fatInput = document.getElementById('scanFatInput');
                const protInput = document.getElementById('scanProteinInput');

                const finalName = nameInput ? nameInput.value : scannedFoodData.name;
                const finalCals = calInput ? (parseInt(calInput.value) || 0) : scannedFoodData.calories;
                const finalPurines = purInput ? (parseInt(purInput.value) || 0) : scannedFoodData.purines;
                const finalCarbs = carbInput ? (parseInt(carbInput.value) || 0) : scannedFoodData.carbs;
                const finalFat = fatInput ? (parseInt(fatInput.value) || 0) : scannedFoodData.fat;
                const finalProt = protInput ? (parseInt(protInput.value) || 0) : scannedFoodData.protein;
                const finalGI = document.getElementById('scanGIInput') ? (parseInt(document.getElementById('scanGIInput').value) || 0) : scannedFoodData.gi;
                const finalFiber = document.getElementById('scanFiberInput') ? (parseInt(document.getElementById('scanFiberInput').value) || 0) : scannedFoodData.fiber;

                // AI returns Total Carbs. We store Net Carbs.
                const netCarbs = Math.max(0, finalCarbs - finalFiber);
                const finalGL = (finalGI * netCarbs) / 100;

                const item = {
                    name: finalName,
                    cals: finalCals,
                    purine: finalPurines,
                    carb: netCarbs, // Store as Net Carbs
                    fat: finalFat,
                    prot: finalProt,
                    gi: finalGI,
                    fiber: finalFiber,
                    gl: finalGL,
                    qty: 1
                };

                // Check favorite
                const saveAsFavorite = document.getElementById('chkSaveScannedAsFavorite')?.checked;

                if (saveAsFavorite) {
                    const dbItem = {
                        name: item.name,
                        category: "AI Scanned",
                        cal: item.cals,
                        purines: item.purine,
                        carb: item.carb,
                        fat: item.fat,
                        prot: item.prot,
                        status: item.purine > 150 ? "danger" : (item.purine > 50 ? "caution" : "safe"),
                        tip: `Escaneado con IA`,
                        favourite: true,
                        icon: "fa-camera",
                        ingredients: scannedFoodData.ingredients || []
                    };

                    let db = window.getAureusFoodDB ? window.getAureusFoodDB() : [];
                    if (db.length === 0) {
                        const stored = localStorage.getItem(getUserKey('aureus_food_db'));
                        if (stored) {
                            try { db = JSON.parse(stored); } catch (e) { }
                        }
                    }

                    const exists = db.find(f => f.name.toLowerCase() === item.name.toLowerCase());
                    if (!exists) {
                        db.push(dbItem);
                        if (window.saveAureusFoodDB) {
                            window.saveAureusFoodDB(db);
                        } else {
                            localStorage.setItem(getUserKey('aureus_food_db'), JSON.stringify(db));
                        }
                        console.log('✅ Food saved to favorites database');
                    }
                }

                addItemToLog(item);
            }

            // Rescan Button
            const rescanBtn = e.target.closest('#rescanBtn');
            if (rescanBtn) {
                resetScanModal();
            }
        });
    }


    // --- New Premium Macro Chart Logic (Syncs with Settings) ---
    function renderMacroTargetsChart() {

        // 1. Get Targets from current log (historical aware)
        const savedTargets = (logData && logData.targets) ? logData.targets : { calories: 2000, fat: 0, prot: 0, carb: 0 };

        // 2. Get Global Settings for Context (Goal Name, Deficit, Ratios)
        let settings = {};
        try {
            settings = JSON.parse(localStorage.getItem(getUserKey('aureus_user_settings')) || '{}');
        } catch (e) { console.error(e); }

        const deficit = settings.goalDeficit || 0;

        // 3. Update Text Elements
        const elTargetCals = document.getElementById('targetCalsDisplay');
        if (elTargetCals) elTargetCals.innerText = Math.round(savedTargets.calories).toLocaleString('en-US');

        const elFatPct = document.getElementById('targetFatPct');
        const elProtPct = document.getElementById('targetProtPct');
        const elCarbPct = document.getElementById('targetCarbPct');

        // Calculated percentages based on Saved Grams for accuracy
        const fatCals = savedTargets.fat * 9;
        const protCals = savedTargets.prot * 4;
        const carbCals = savedTargets.carb * 4;
        const totalCalcCals = fatCals + protCals + carbCals;
        const safeTotal = totalCalcCals || 1;

        if (elFatPct) elFatPct.innerText = Math.round((fatCals / safeTotal) * 100) + '%';
        if (elProtPct) elProtPct.innerText = Math.round((protCals / safeTotal) * 100) + '%';
        if (elCarbPct) elCarbPct.innerText = Math.round((carbCals / safeTotal) * 100) + '%';

        const elFatGrams = document.getElementById('targetFatGrams');
        const elProtGrams = document.getElementById('targetProtGrams');
        const elCarbGrams = document.getElementById('targetCarbGrams');

        if (elFatGrams) elFatGrams.innerText = Math.round(savedTargets.fat) + 'g';
        if (elProtGrams) elProtGrams.innerText = Math.round(savedTargets.prot) + 'g';
        if (elCarbGrams) elCarbGrams.innerText = Math.round(savedTargets.carb) + 'g';

        // 4. Update Footer Goal Text
        const elGoalTitle = document.getElementById('targetGoalTitle');
        const elGoalSub = document.getElementById('targetGoalSub');

        if (elGoalTitle && elGoalSub) {
            let goalName = "MAINTENANCE";
            if (deficit > 50) {
                elGoalTitle.innerText = "GOAL: FAT LOSS";
                elGoalSub.innerText = `-${deficit.toLocaleString('en-US')}kcal daily deficit`;
                goalName = "Fat Loss";
            } else if (deficit < -50) {
                elGoalTitle.innerText = "GOAL: MUSCLE GAIN";
                elGoalSub.innerText = `+${Math.abs(deficit).toLocaleString('en-US')}kcal surplus`;
                goalName = "Muscle Gain";
            } else {
                elGoalTitle.innerText = "GOAL: MAINTENANCE";
                elGoalSub.innerText = "0kcal daily deficit";
                goalName = "Maintenance";
            }

            // Sync Top Card Label
            const elDailyGoalLabel = document.getElementById('dailyGoalLabel');
            if (elDailyGoalLabel) {
                elDailyGoalLabel.innerText = `Target: ${goalName}`;
                elDailyGoalLabel.onclick = () => {
                    if (window.openGoalModal) window.openGoalModal();
                };
            }

            // Make Footer Box Clickable
            const elGoalFooter = document.getElementById('goalFooterBox');
            if (elGoalFooter) {
                elGoalFooter.onclick = () => {
                    if (window.openGoalModal) window.openGoalModal();
                };
            }
        }

        // 5. Update Chart
        const ctx = document.getElementById('foodLogMacroChart');
        if (!ctx) return;

        if (window.foodLogMacroChart instanceof Chart) {
            window.foodLogMacroChart.data.datasets[0].data = [fatCals, protCals, carbCals];
            window.foodLogMacroChart.update();
        } else {

            LazyLoader.load('chartjs').then(() => {
                if (window.foodLogMacroChart instanceof Chart) return;

                window.foodLogMacroChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [fatCals, protCals, carbCals],
                            backgroundColor: ['#FACC15', '#3B82F6', '#EC4899'],
                            borderWidth: 0,
                            cutout: '80%',
                            borderRadius: 30, // Smooth rounded ends
                            spacing: 0,
                            offset: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { enabled: false } },
                        cutout: '80%'
                    }
                });
            }).catch(e => console.error("Chart.js load error", e));
        }
    }

    // --- Keyboard Shortcuts for Quick Add Modal ---
    document.addEventListener('keydown', (e) => {
        // Only trigger if modal is visible
        const modal = document.getElementById('quickAddModal');
        if (!modal || modal.classList.contains('hidden') || modal.style.display === 'none') return;

        // Esc: Close Modal
        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        // Ctrl Shortcuts
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'enter':
                    e.preventDefault();
                    // Handle "Add" based on active tab
                    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
                    if (activeTab === 'manual') {
                        addManualItem();
                    } else if (activeTab === 'aiscan') {
                        // Check if we are in results view
                        const resultsSection = document.getElementById('scanResultsSection');
                        if (resultsSection && !resultsSection.classList.contains('hidden')) {
                            const btnSubmit = document.getElementById('btnAddScannedFood');
                            if (btnSubmit) btnSubmit.click();
                        }
                    }
                    break;

                case 't':
                    e.preventDefault();
                    // Cycle Tabs: Favorites -> Manual -> AI Scan
                    const tabs = ['favorites', 'manual', 'aiscan'];
                    const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'favorites';
                    const nextIdx = (tabs.indexOf(currentTab) + 1) % tabs.length;
                    switchTab(tabs[nextIdx]);
                    break;

                case 'r':
                    // Scan Again / Reset
                    const activeTabR = document.querySelector('.tab-btn.active')?.dataset.tab;
                    if (activeTabR === 'aiscan') {
                        e.preventDefault();
                        if (typeof resetScanModal === 'function') resetScanModal();
                    }
                    break;

                case 'f':
                    // Toggle Save to Favorites
                    e.preventDefault();
                    const activeTabF = document.querySelector('.tab-btn.active')?.dataset.tab;
                    if (activeTabF === 'manual') {
                        const chk = document.getElementById('chkSaveToDb');
                        if (chk) chk.checked = !chk.checked;
                    } else if (activeTabF === 'aiscan') {
                        const chk = document.getElementById('chkSaveScannedAsFavorite');
                        if (chk) chk.checked = !chk.checked;
                    }
                    break;
            }
        }
    });

    // Unified Glucose logic (Consolidated above)


    // --- Daily Report Feature (Premium Design V2) ---
    // --- Daily Report Feature (Premium Design V2) ---
    // Use delegation to ensure it works even if header is re-rendered
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btnDailyReport');
        if (btn) {
            console.log("Daily Report Button Clicked");
            e.preventDefault(); // Prevent default if it's a link or form submit
            generateDailyReport();
        }
    });

    async function generateDailyReport() {
        if (!window.jspdf || !window.Chart) {
            alert("PDF or Chart libraries not loaded. Please refresh.");
            return;
        }

        // Current Language for Dates/Numbers
        const currentLang = (window.Locales && window.Locales.currentLang === 'es') ? 'es-ES' :
            (window.Locales && window.Locales.currentLang === 'fr') ? 'fr-FR' : 'en-US';

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = 20;

        // --- Brand Colors ---
        const C_BG = [18, 18, 18];    // #121212
        const C_CARD = [28, 28, 30];  // #1c1c1e
        const C_TEXT_MAIN = [255, 255, 255];
        const C_TEXT_MUTED = [161, 161, 170];
        const C_ACCENT = [212, 244, 88]; // #D4F458 (Lime)
        const C_ACCENT_DIM = [54, 61, 28]; // Darker Lime
        const C_DANGER = [239, 68, 68];
        const C_WARN = [245, 158, 11];
        const C_SUCCESS = [16, 185, 129];

        // --- Helper: Draw Arc ---
        // Approximates an arc using small line segments
        const loadImage = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => resolve(img);
                img.onerror = (err) => {
                    console.error(`PDF Image Load Error for ${url.substring(0, 50)}...`, err);
                    resolve(null);
                };

                const isLocal = window.location.protocol === 'file:';
                const isDataUri = url.startsWith('data:');
                const fetchUrl = (isLocal || isDataUri) ? url : `${url}?t=${new Date().getTime()}`;

                img.src = fetchUrl;
            });
        };

        const drawArc = (x, y, radius, startAngle, endAngle, color, lineWidth) => {
            doc.setDrawColor(...color);
            doc.setLineWidth(lineWidth);

            const step = 2; // degrees
            const startRad = (startAngle - 90) * (Math.PI / 180); // -90 to start at top
            const endRad = (endAngle - 90) * (Math.PI / 180);

            let lastX = x + (radius * Math.cos(startRad));
            let lastY = y + (radius * Math.sin(startRad));

            for (let ang = startAngle + step; ang <= endAngle; ang += step) {
                const rad = (ang - 90) * (Math.PI / 180);
                const nextX = x + (radius * Math.cos(rad));
                const nextY = y + (radius * Math.sin(rad));
                doc.line(lastX, lastY, nextX, nextY);
                lastX = nextX;
                lastY = nextY;
            }
        };

        const drawCard = (y, h) => {
            doc.setFillColor(...C_CARD);
            doc.roundedRect(margin, y, pageWidth - (margin * 2), h, 4, 4, 'F');
        };

        const rightText = (text, y, xOffset = margin, size = 10, color = C_TEXT_MUTED) => {
            doc.setFontSize(size);
            doc.setTextColor(...color);
            const textWidth = doc.getTextWidth(text);
            doc.text(text, pageWidth - xOffset - textWidth, y);
        };

        const addPageIfNeeded = (heightToAdd) => {
            if (yPos + heightToAdd > pageHeight - margin) {
                doc.addPage();
                doc.setFillColor(...C_BG);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
                yPos = 20;
            }
        };

        // 1. SETUP PAGE
        doc.setFillColor(...C_BG);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // 2. HEADER
        try {
            const logo = AUREUS_LOGO_BASE64 ? await loadImage(AUREUS_LOGO_BASE64) : null;
            const logoSize = 18; // Slightly larger for report presence
            const dividerGap = 4;
            const textGap = 5;

            if (logo) {
                // 1. Logo (Left)
                doc.addImage(logo, 'PNG', margin, yPos - 8, logoSize, logoSize);

                // 2. Vertical Divider Bar
                const dividerX = margin + logoSize + dividerGap;
                doc.setFillColor(...C_ACCENT);
                doc.rect(dividerX, yPos - 8, 1.5, logoSize, 'F');

                // 3. Brand Text (Right of Divider)
                const textBaseX = dividerX + textGap;

                // Main Title: AUREUS FIT AI
                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.setTextColor(...C_TEXT_MAIN);
                doc.text("AUREUS", textBaseX, yPos + 3);
                const aW = doc.getTextWidth("AUREUS ");
                doc.setTextColor(...C_ACCENT);
                doc.text("FIT AI", textBaseX + aW, yPos + 3);

                // Subtitle
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...C_TEXT_MUTED);
                doc.text(tr('food_log.pdf_daily_report.title', "DAILY NUTRITION REPORT"), textBaseX, yPos + 9);
            } else {
                throw new Error("Logo image not loaded");
            }
        } catch (e) {
            console.warn("Logo load failed (CORS/File Protocol), using fallback text.", e);
            // Fallback: Vertical bar then text
            doc.setFillColor(...C_ACCENT);
            doc.rect(margin, yPos - 5, 2, 14, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(...C_TEXT_MAIN);
            doc.text("AUREUS", margin + 6, yPos + 3);
            const aW = doc.getTextWidth("AUREUS ");
            doc.setTextColor(...C_ACCENT);
            doc.text("FIT AI", margin + 6 + aW, yPos + 3);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...C_TEXT_MUTED);
            doc.text(tr('food_log.pdf_daily_report.title', "DAILY NUTRITION REPORT"), margin + 6, yPos + 9);
        }

        doc.setFontSize(10);
        doc.setTextColor(...C_TEXT_MUTED);
        const dateStr = currentDate.toLocaleDateString(currentLang, { weekday: 'short', month: 'long', day: 'numeric' }).toUpperCase();
        rightText(dateStr, yPos + 3);

        yPos += 25;

        // --- DATA PREP ---
        let tCals = 0, tProt = 0, tFat = 0, tCarb = 0, tPurines = 0, tGL = 0;
        if (logData && logData.meals) {
            if (logData && logData.meals) {
                Object.values(logData.meals).forEach(meal => {
                    let mCarb = 0;
                    let mGL = 0;

                    // 1. Calculate Meal Totals first
                    meal.items.forEach(item => {
                        tCals += item.cals || 0;
                        tProt += item.prot || 0;
                        tFat += item.fat || 0;
                        tPurines += item.purine || 0;

                        const iCarb = item.carb || 0;
                        tCarb += iCarb; // Add to daily total
                        mCarb += iCarb; // Add to meal total

                        // Robust GL Calculation
                        let iGL = 0;
                        if (item.gl !== undefined && item.gl !== null) {
                            iGL = item.gl;
                        } else {
                            // Match dashboard fallback (55)
                            const iGI = item.gi || 55;
                            iGL = (iGI * iCarb) / 100;
                        }
                        mGL += iGL;
                    });

                    // 2. Calculate Meal Factor (Average GI) for this meal
                    // Dashboard Logic: mealFactor = (mGL * 100) / mCarb
                    const mealFactor = mCarb > 0 ? (mGL * 100) / mCarb : 0;

                    // 3. Add to Daily Total (which is displayed as "Total GL" on dashboard)
                    tGL += mealFactor;
                });
            }
        }
        const targets = (logData && logData.targets) ? logData.targets : DEFAULT_TARGETS;
        const targetCals = targets.calories || 2000;

        // --- HYDRATION DATA ---
        const hydro = (logData && logData.hydration) ? logData.hydration : { current: 0, goal: 2500 };
        const hydroCurrent = hydro.current || 0;
        const hydroGoal = hydro.goal || 2500;

        // --- GLUCOSE DATA (Daily Avg) ---
        let tGlucoseAvg = 0;
        let tGlucoseCount = 0;
        if (logData.glucose && logData.glucose.length > 0) {
            let sum = 0;
            logData.glucose.forEach(g => {
                if (g.value) {
                    sum += parseFloat(g.value);
                    tGlucoseCount++;
                }
            });
            if (tGlucoseCount > 0) tGlucoseAvg = sum / tGlucoseCount;
        }

        // 1. EXECUTIVE SUMMARY (V5 Premium - Grid + Chart)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(tr('food_log.pdf_daily_report.exec_summary_title', "1. Resumen Ejecutivo"), margin, yPos);
        yPos += 5; // Reduced from 6

        doc.setFontSize(9); // Smaller subtitle
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(tr('food_log.pdf_daily_report.exec_summary_subtitle', "Un vistazo rápido al cumplimiento de objetivos del día."), margin, yPos);
        yPos += 8; // Reduced from 10

        const summaryItems = [
            { label: tr('food_log.pdf_daily_report.labels.calories', "CALORÍAS"), current: tCals, target: targetCals, unit: "kcal" },
            { label: tr('food_log.pdf_daily_report.labels.protein', "PROTEÍNA"), current: tProt, target: targets.prot, unit: "g" },
            { label: tr('food_log.pdf_daily_report.labels.carbs', "CARBOHIDRATOS"), current: tCarb, target: targets.carb, unit: "g" },
            { label: tr('food_log.pdf_daily_report.labels.fats', "GRASAS"), current: tFat, target: targets.fat, unit: "g" },
            { label: tr('food_log.pdf_daily_report.labels.water', "AGUA"), current: hydroCurrent, target: hydroGoal, unit: "ml" }
        ];

        // Add Glucose if readings exist
        if (tGlucoseCount > 0) {
            summaryItems.push({
                label: tr('food_log.glucose', "Glucosa").toUpperCase(),
                current: tGlucoseAvg,
                target: 100, // Dummy target for progress bar if needed, or we'll hide it
                unit: "mg/dL",
                isGlucose: true
            });
        }

        const cardW = (pageWidth - (margin * 2) - 10) / 2;
        const cardH = 24; // Reduced from 30 to save space
        let startX = margin;
        let startY = yPos;

        let rowCount = 0; // Track rows to adjust yPos dynamically

        summaryItems.forEach((item, idx) => {
            const x = startX + (idx % 2) * (cardW + 10);
            const currentRow = Math.floor(idx / 2);
            const y = startY + currentRow * (cardH + 4); // Reduced gap from 6 to 4
            rowCount = Math.max(rowCount, currentRow + 1);

            // Card Background
            doc.setFillColor(...C_CARD);
            doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');

            // Label
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...C_TEXT_MUTED);
            doc.text(item.label, x + 6, y + 7); // tighter padding

            // Main Value
            doc.setFontSize(11); // Slightly smaller
            doc.setTextColor(...C_TEXT_MAIN);
            const dispVal = Math.round(item.current).toLocaleString('en-US');
            doc.text(`${dispVal}`, x + 6, y + 14);
            const valW = doc.getTextWidth(`${dispVal}`);
            doc.setFontSize(7);
            doc.setTextColor(...C_TEXT_MUTED);
            doc.setFont("helvetica", "normal");
            doc.text(item.unit, x + 6 + valW + 2, y + 14);

            // Target Reference
            doc.setFontSize(6);
            const metaLabel = tr('food_log.pdf_daily_report.labels.target', "Meta");
            if (item.isGlucose) {
                const avgLabel = tr('food_log.pdf_daily_report.daily_avgs', "Promedio");
                doc.text(`${avgLabel}: ${Math.round(item.current)} ${item.unit}`, x + 6, y + 19);
            } else {
                doc.text(`${metaLabel}: ${Math.round(item.target).toLocaleString('en-US')}${item.unit}`, x + 6, y + 19);
            }

            // Status Badge
            let statusText = tr('food_log.pdf_daily_report.labels.optimal', "ÓPTIMO");
            let statusColor = C_SUCCESS;
            const pct = (item.current / item.target) * 100;

            const lblCals = tr('food_log.pdf_daily_report.labels.calories', "CALORÍAS");
            const lblProt = tr('food_log.pdf_daily_report.labels.protein', "PROTEÍNA");
            const lblWater = tr('food_log.pdf_daily_report.labels.water', "AGUA");

            if (item.label === lblCals) {
                if (item.current > item.target) { statusText = tr('food_log.pdf_daily_report.labels.exceeded', "EXCEDIDO"); statusColor = C_DANGER; }
                else if (item.current < item.target * 0.8) { statusText = tr('food_log.pdf_daily_report.labels.deficit', "DÉFICIT"); statusColor = C_ACCENT; }
            } else if (item.label === lblProt) {
                if (item.current < item.target * 0.8) { statusText = tr('food_log.pdf_daily_report.labels.low', "BAJO"); statusColor = C_WARN; }
            } else if (item.label === lblWater) {
                if (item.current < item.target * 0.8) { statusText = tr('food_log.pdf_daily_report.labels.low', "BAJO"); statusColor = C_WARN; }
            } else if (item.isGlucose) {
                if (item.current < 70) { statusText = tr('food_log.pdf_daily_report.labels.low', "BAJO"); statusColor = C_DANGER; }
                else if (item.current > 140) { statusText = tr('food_log.pdf_daily_report.labels.high', "ALTO"); statusColor = C_WARN; }
            } else {
                if (item.current > item.target) { statusText = tr('food_log.pdf_daily_report.labels.high', "ALTO"); statusColor = C_WARN; }
            }

            const badgeW = doc.getTextWidth(statusText) + 5;
            doc.setFillColor(...statusColor);
            doc.roundedRect(x + cardW - badgeW - 6, y + 6, badgeW, 5, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(5.5);
            doc.setFont("helvetica", "bold");
            doc.text(statusText, x + cardW - badgeW - 3.5, y + 9.5);

            // Mini Progress Bar
            const barW = cardW - 12;
            const barH = 2; // Thinner
            const barY = y + 21;

            // Track BG
            doc.setFillColor(50, 50, 55);
            doc.roundedRect(x + 6, barY, barW, barH, 1, 1, 'F');

            // Progress
            let fillW = Math.min(Math.max((item.current / item.target) * barW, 2), barW);
            if (item.isGlucose) {
                // Glucose progress bar: show relative to 200mg/dL for scale
                fillW = Math.min(Math.max((item.current / 200) * barW, 2), barW);
            }
            doc.setFillColor(...statusColor);
            doc.roundedRect(x + 6, barY, fillW, barH, 1, 1, 'F');
        });

        yPos = startY + (rowCount * (cardH + 4)) + 5; // Reduced gap

        // --- ADD COMPARISON RADAR CHART ---
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(tr('food_log.pdf_daily_report.nutritional_balance_title', "BALANCE NUTRICIONAL (CONSUMO VS. META %)"), margin, yPos);
        yPos += 6;

        try {
            // Normalize values to 100% of target for a clear comparison
            const purineTarget = 400; // Standard daily target for low purine
            const chartData = {
                labels: [
                    tr('food_log.calories', 'Calories'),
                    tr('dashboard.protein', 'Protein'),
                    tr('dashboard.carbs', 'Carbs'),
                    tr('dashboard.fat', 'Fat'),
                    tr('food_log.purines', 'Purines')
                ],
                actual: [
                    Math.min((tCals / targetCals) * 100, 150),
                    Math.min((tProt / targets.prot) * 100, 150),
                    Math.min((tCarb / targets.carb) * 100, 150),
                    Math.min((tFat / targets.fat) * 100, 150),
                    Math.min((tPurines / purineTarget) * 100, 150)
                ]
            };

            const chartImg = await new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 600;
                const ctx = canvas.getContext('2d');

                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: chartData.labels,
                        datasets: [
                            {
                                label: tr('food_log.pdf_daily_report.labels.target', 'Meta') + ' (100%)',
                                data: [100, 100, 100, 100, 100],
                                fill: true,
                                backgroundColor: 'rgba(161, 161, 170, 0.1)',
                                borderColor: 'rgba(161, 161, 170, 0.4)',
                                borderWidth: 1,
                                pointRadius: 0
                            },
                            {
                                label: tr('dashboard.consumed', 'Consumed'),
                                data: chartData.actual,
                                fill: true,
                                backgroundColor: 'rgba(212, 244, 88, 0.35)',
                                borderColor: '#D4F458',
                                borderWidth: 2,
                                pointBackgroundColor: '#D4F458',
                                pointBorderColor: '#fff',
                                pointRadius: 3
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        animation: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            r: {
                                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                pointLabels: {
                                    color: '#ffffff',
                                    font: { size: 24, weight: 'bold' } // Increased to 200% (was 12)
                                },
                                ticks: { display: false },
                                min: 0,
                                max: 150,
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Small delay to ensure render is complete
                setTimeout(() => {
                    resolve(canvas.toDataURL('image/png', 1.0));
                }, 100);
            });

            if (chartImg) {
                const chartSize = 75; // Reduced from 80 to fit
                const chartX = (pageWidth - chartSize) / 2;

                // Ensure chart fits on page
                doc.addImage(chartImg, 'PNG', chartX, yPos, chartSize, chartSize);
                yPos += chartSize;

                yPos += 4; // Increased buffer after chart labels
                // --- Legend ---
                const centerX = pageWidth / 2;
                doc.setFontSize(7);
                doc.setFont("helvetica", "normal");
                // Muted Meta (Gray)
                doc.setFillColor(161, 161, 170);
                doc.rect(centerX - 55, yPos, 2.5, 2.5, 'F');
                doc.setTextColor(161, 161, 170);
                doc.text(tr('food_log.pdf_daily_report.labels.target', 'Meta') + " (100%)", centerX - 51, yPos + 2);
                // Actual (Lime)
                doc.setFillColor(...C_ACCENT);
                doc.rect(centerX + 20, yPos, 2.5, 2.5, 'F');
                doc.setTextColor(...C_TEXT_MAIN);
                doc.text(tr('dashboard.consumed', 'Consumed'), centerX + 24, yPos + 2);

                yPos += 6; // Increased gap before guide box

                // --- Interpretation Guide ---
                doc.setFillColor(...C_CARD);
                const guideW = pageWidth - (margin * 2);
                const guideH = 12; // Reduced height
                doc.roundedRect(margin, yPos, guideW, guideH, 2, 2, 'F');

                doc.setFontSize(7); // Smaller title
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...C_ACCENT);
                doc.text(tr('food_log.pdf_daily_report.reading_guide_title', "GUÍA DE LECTURA:"), margin + 4, yPos + 4);

                doc.setFontSize(6.5); // Smaller text
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...C_TEXT_MUTED);
                const guideLines = [
                    tr('food_log.pdf_daily_report.reading_guide_1', "• El área gris representa tu objetivo ideal (100%)."),
                    tr('food_log.pdf_daily_report.reading_guide_2', "• Si el área verde está dentro de la gris, estás cumpliendo el objetivo."),
                    tr('food_log.pdf_daily_report.reading_guide_3', "• Si el área verde sobresale, indica un exceso en ese nutriente específico.")
                ];
                guideLines.forEach((line, idx) => {
                    doc.text(line, margin + 4, yPos + 7 + (idx * 2.2));
                });

                yPos += guideH + 4;
            }
        } catch (chartErr) {
            console.error("Failed to render PDF radar chart:", chartErr);
            yPos += 10;
        }

        // Keto Alert
        if (tCarb > 50) {
            // Ensure Keto alert stays on same page if possible, or force new page if totally out of space
            // But user wants it on Page 1. We've saved space above.

            // Keto Alert (Compact)
            const kH = 12;
            doc.setFillColor(28, 28, 30, 0);
            doc.setDrawColor(239, 68, 68);
            doc.roundedRect(margin, yPos, pageWidth - (margin * 2), kH, 2, 2, 'FD');

            doc.setFontSize(9); // Smaller title
            doc.setTextColor(239, 68, 68);
            doc.setFont("helvetica", "bold");
            const ketoTitle = tr('food_log.pdf_daily_report.keto_alert_title', "[!] ALERTA KETO: {val}g Carbos Netos");
            doc.text(ketoTitle.replace('{val}', Math.round(tCarb)), margin + 5, yPos + 4.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7); // Smaller desc
            doc.text(tr('food_log.pdf_daily_report.keto_alert_desc', "El consumo excede el límite sugerido para Cetosis. Se recomienda actividad física ligera."), margin + 5, yPos + 9);
            yPos += kH + 5;
        }

        // 2. FOOD LIST (Detail) - MOVED UP
        addPageIfNeeded(20);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(tr('food_log.pdf_daily_report.food_list_title', "2. Registro de Alimentos (Detalle)"), margin, yPos);
        yPos += 8;

        const tableBody = [];
        if (logData && logData.meals) {
            ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(type => {
                const meal = logData.meals[type];
                if (meal.items.length > 0) {
                    // Calculate Meal Totals
                    const stats = meal.items.reduce((acc, item) => {
                        acc.cals += (item.cals || item.cal || 0);
                        acc.purine += (item.purine || item.purines || 0);
                        const iCarb = (item.carb || item.carbs || 0);
                        acc.carb += iCarb;
                        acc.prot += (item.prot || 0);
                        acc.fat += (item.fat || 0);

                        // GL Calc
                        let iGL = 0;
                        if (item.gl !== undefined && item.gl !== null) {
                            iGL = parseFloat(item.gl);
                        } else {
                            const iGI = item.gi || 55;
                            iGL = (iGI * iCarb) / 100;
                        }
                        acc.gl += iGL;

                        return acc;
                    }, { cals: 0, purine: 0, carb: 0, prot: 0, fat: 0, gl: 0 });

                    // Header String
                    let sectionTitle = type.toUpperCase();
                    if (typeof Locales !== 'undefined') {
                        const loc = Locales.getTranslation('dashboard.' + type);
                        if (loc) sectionTitle = loc.toUpperCase();
                    }

                    const rowStyle = { fontStyle: 'bold', textColor: C_ACCENT, fillColor: [35, 35, 38] };

                    tableBody.push([
                        { content: `${sectionTitle}   \u2022   ${Math.round(stats.gl)} GL`, styles: { halign: 'left', ...rowStyle } },
                        { content: Math.round(stats.cals).toLocaleString('en-US') + ' kcal', styles: { halign: 'center', ...rowStyle } },
                        { content: Math.round(stats.purine).toLocaleString('en-US'), styles: { halign: 'center', ...rowStyle } },
                        { content: Math.round(stats.carb).toLocaleString('en-US') + 'g', styles: { halign: 'center', ...rowStyle } },
                        { content: Math.round(stats.prot).toLocaleString('en-US') + 'g', styles: { halign: 'center', ...rowStyle } },
                        { content: Math.round(stats.fat).toLocaleString('en-US') + 'g', styles: { halign: 'center', ...rowStyle } }
                    ]);

                    meal.items.forEach(item => {
                        tableBody.push([
                            item.name,
                            Math.round(item.cals).toLocaleString('en-US'),
                            Math.round(item.purine).toLocaleString('en-US'),
                            Math.round(item.carb) + 'g',
                            Math.round(item.prot) + 'g',
                            Math.round(item.fat) + 'g'
                        ]);
                    });
                }
            });
        }

        if (tableBody.length > 0) {
            // GRAND TOTAL ROW (Premium Style)
            const totalStyle = { fontStyle: 'bold', textColor: C_ACCENT, fillColor: [25, 25, 27] };
            tableBody.push([
                { content: tr('food_log.pdf_daily_report.total_daily', "TOTAL DAILY"), styles: { halign: 'left', ...totalStyle } },
                { content: Math.round(tCals).toLocaleString('en-US') + ' kcal', styles: { halign: 'center', ...totalStyle } },
                { content: Math.round(tPurines).toLocaleString('en-US'), styles: { halign: 'center', ...totalStyle } },
                { content: Math.round(tCarb).toLocaleString('en-US') + 'g', styles: { halign: 'center', ...totalStyle } },
                { content: Math.round(tProt).toLocaleString('en-US') + 'g', styles: { halign: 'center', ...totalStyle } },
                { content: Math.round(tFat).toLocaleString('en-US') + 'g', styles: { halign: 'center', ...totalStyle } }
            ]);

            doc.autoTable({
                startY: yPos,
                head: [[
                    tr('food_log.pdf_daily_report.table_headers.item', 'ITEM'),
                    tr('food_log.pdf_daily_report.table_headers.kcal', 'KCAL'),
                    tr('food_log.pdf_daily_report.table_headers.purine', 'PURINE'),
                    tr('food_log.pdf_daily_report.table_headers.carb', 'CARB'),
                    tr('food_log.pdf_daily_report.table_headers.prot', 'PROT'),
                    tr('food_log.pdf_daily_report.table_headers.fat', 'FAT')
                ]],
                body: tableBody,
                theme: 'plain',
                styles: {
                    fillColor: C_BG,
                    textColor: C_TEXT_MAIN,
                    fontSize: 8,
                    cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
                    lineColor: [40, 40, 40],
                    lineWidth: { bottom: 0.1 },
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: C_CARD,
                    textColor: C_ACCENT,
                    fontStyle: 'bold',
                    fontSize: 8,
                    halign: 'center',
                    lineWidth: 0
                },
                columnStyles: {
                    0: { halign: 'left', cellWidth: 'auto' },
                    1: { halign: 'center', cellWidth: 15 },
                    2: { halign: 'center', cellWidth: 15 },
                    3: { halign: 'center', cellWidth: 15 },
                    4: { halign: 'center', cellWidth: 15 },
                    5: { halign: 'center', cellWidth: 15 }
                },
                alternateRowStyles: {
                    fillColor: [20, 20, 22]
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                    yPos = data.cursor.y;
                }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // 3. HEALTH & RISK ANALYSIS (V4 Enhanced - Vertical Stack)
        // 3. HEALTH & RISK ANALYSIS (V4 Enhanced - Vertical Stack)
        doc.addPage();
        doc.setFillColor(...C_BG);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(tr('food_log.pdf_daily_report.health_risks_title', "3. Análisis de Salud y Riesgos"), margin, yPos);
        yPos += 8;

        // Container Width
        const fullCardW = pageWidth - (margin * 2);

        // --- URIC ACID CARD (Top) ---
        doc.setFillColor(...C_CARD);
        doc.roundedRect(margin, yPos, fullCardW, 35, 3, 3, 'F');

        const riskHigh = tr('food_log.pdf_daily_report.risk_level.high', "ALTO");
        const riskMod = tr('food_log.pdf_daily_report.risk_level.moderate', "MODERADO");
        const riskLow = tr('food_log.pdf_daily_report.risk_level.low', "BAJO");
        const uaRisk = tPurines > 400 ? riskHigh : (tPurines > 200 ? riskMod : riskLow);
        const uaColor = tPurines > 400 ? C_DANGER : (tPurines > 200 ? C_WARN : C_SUCCESS);

        // Title
        doc.setFontSize(11);
        doc.setTextColor(...C_TEXT_MAIN);
        doc.setFont("helvetica", "bold");
        doc.text(tr('food_log.pdf_daily_report.uric_acid_title', "URIC ACID RISK"), margin + 15, yPos + 12);

        // Value
        doc.setFontSize(18);
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(`${Math.round(tPurines)} mg`, margin + 15, yPos + 25);

        // Risk Text
        doc.setFontSize(12);
        doc.setTextColor(...uaColor);
        doc.text(`${tr('food_log.pdf_daily_report.risk_label', "RIESGO")} ${uaRisk}`, margin + fullCardW - 15, yPos + 12, { align: 'right' });

        // Recommendation (Inline)
        doc.setFontSize(9);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.setFont("helvetica", "normal");
        const uaRecShort = tPurines > 200 ?
            tr('food_log.pdf_daily_report.uric_acid_rec_high', "Hidratación sugerida: +3L agua.") :
            tr('food_log.pdf_daily_report.uric_acid_rec_ok', "Niveles seguros.");
        doc.text(uaRecShort, margin + fullCardW - 15, yPos + 25, { align: 'right' });

        yPos += 42; // Space after UA card

        // --- GLYCEMIC LOAD CARD (Bottom) ---
        // Taller card for the visual bar
        doc.setFillColor(...C_CARD);
        doc.roundedRect(margin, yPos, fullCardW, 60, 4, 4, 'F');

        // Header
        doc.setFontSize(11);
        doc.setTextColor(...C_TEXT_MAIN);
        doc.setFont("helvetica", "bold");
        doc.text(tr('food_log.pdf_daily_report.gl_title', "GLYCEMIC LOAD"), margin + 15, yPos + 12);

        // Risk Badge (Text only)
        // Create explicit risk constants again if scope issue, or reuse if defined above
        const glRisk = tGL > 100 ? tr('food_log.pdf_daily_report.risk_level.high', "HIGH") : (tGL > 50 ? tr('food_log.pdf_daily_report.risk_level.moderate', "MODERATE") : tr('food_log.pdf_daily_report.risk_level.low', "LOW"));
        const glRiskColor = tGL > 100 ? [239, 68, 68] : (tGL > 50 ? [245, 158, 11] : [16, 185, 129]);

        doc.setFontSize(10);
        doc.setTextColor(...glRiskColor);
        doc.text(`${tr('food_log.pdf_daily_report.risk_label', "RISK")} ${glRisk}`, margin + fullCardW - 15, yPos + 12, { align: 'right' });

        // Gradient Bar (Wide)
        const barY = yPos + 22;
        const barX = margin + 15;
        const barW = fullCardW - 30;
        const segW = barW / 4;

        doc.setFillColor(16, 185, 129); // Green
        doc.rect(barX, barY, segW, 6, 'F');
        doc.setFillColor(210, 220, 50); // Yellow
        doc.rect(barX + segW, barY, segW, 6, 'F');
        doc.setFillColor(245, 158, 11); // Orange
        doc.rect(barX + (segW * 2), barY, segW, 6, 'F');
        doc.setFillColor(239, 68, 68); // Red
        doc.rect(barX + (segW * 3), barY, segW, 6, 'F');

        // Indicator Marker
        const maxScaleGL = 200;
        const indX = barX + Math.min((tGL / maxScaleGL) * barW, barW);
        doc.setFillColor(255, 255, 255);
        doc.triangle(indX, barY - 2, indX - 3, barY - 5, indX + 3, barY - 5, 'F');

        // Value & Label
        doc.setFontSize(24); // Larger value
        doc.setTextColor(...C_TEXT_MAIN);
        doc.setFont("helvetica", "bold");
        const valText = `${Math.round(tGL)}`;
        const valWidth = doc.getTextWidth(valText);
        doc.text(valText, margin + 15, yPos + 48);

        doc.setFontSize(10);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.setFont("helvetica", "normal");
        const glLabelX = margin + 15 + valWidth + 4; // Use width from size 24
        doc.text(tr('food_log.pdf_daily_report.gl_label', "GL (Glycemic Load)"), glLabelX, yPos + 48);

        yPos += 70;

        // Main Recommendations Text (Combined)
        doc.setFontSize(9);
        doc.setTextColor(...C_TEXT_MAIN);
        doc.setFont("helvetica", "normal");
        const glRec = tGL > 100 ?
            tr('food_log.pdf_daily_report.gl_rec_high', "• GL Alto: Se sugiere caminar 10min post-comida para reducir pico glucémico.") :
            tr('food_log.pdf_daily_report.gl_rec_ok', "• GL Óptimo: Mantener consumo de carbohidratos complejos.");
        doc.text(glRec, margin, yPos);
        yPos += 12;

        // --- GLUCOSE READINGS (Part of Section 2) ---
        if (logData.glucose && logData.glucose.length > 0) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...C_TEXT_MAIN);
            doc.text(tr('food_log.pdf_daily_report.glucose_title', "Lecturas de Glucosa"), margin, yPos);
            yPos += 8;

            logData.glucose.forEach(g => {
                const noteText = g.details || g.notes || g.note || g.comment || g.comments || "";
                const cardHeight = noteText ? 26 : 18;
                addPageIfNeeded(cardHeight + 5);

                doc.setFillColor(...C_CARD);
                doc.roundedRect(margin, yPos, pageWidth - (margin * 2), cardHeight, 4, 4, 'F');

                doc.setFontSize(14);
                doc.setTextColor(...C_TEXT_MAIN);
                doc.setFont("helvetica", "bold");
                doc.text(`${g.value}`, margin + 10, yPos + 10);

                const valWidth = doc.getTextWidth(`${g.value}`);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...C_TEXT_MUTED);
                doc.text("mg/dL", margin + 10 + valWidth + 2, yPos + 10);

                const measureTime = g.time || "--:--";
                const measureTag = (g.context || g.tag) ? `• ${g.context || g.tag}` : "";
                doc.setFontSize(9);
                doc.setTextColor(...C_TEXT_MUTED);
                doc.text(`${measureTime}  ${measureTag}`, margin + 10, yPos + 16);

                if (noteText) {
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(...[200, 200, 200]);
                    doc.text(`"${noteText}"`, margin + 10, yPos + 22);
                }
                yPos += (cardHeight + 4);
            });
            yPos += 4;
        } else {
            doc.setFontSize(10);
            doc.setTextColor(...C_TEXT_MUTED);
            doc.text(tr('food_log.pdf_daily_report.glucose_empty', "No hay lecturas de glucosa registradas."), margin, yPos);
            yPos += 8;
        }

        yPos += 5;

        // 3. WEEKLY TREND TEXT (V5 - Real Analysis) - FORCED NEW PAGE
        doc.addPage();
        doc.setFillColor(...C_BG);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(tr('food_log.pdf_daily_report.weekly_trends_title', "4. Tendencia Semanal (Últimos 7 días)"), margin, yPos);
        yPos += 8;

        // --- Weekly Data Processing ---
        let weeklyCals = [];
        let weeklyProt = [];
        let weeklyCarb = [];
        let weeklyFat = [];
        let adherenceDays = 0;
        const anchorDate = new Date(currentDate);

        for (let i = 6; i >= 0; i--) {
            const d = new Date(anchorDate);
            d.setDate(anchorDate.getDate() - i);
            const key = getStorageKey(d);
            const stored = localStorage.getItem(key);

            let dCals = 0, dProt = 0, dCarb = 0, dFat = 0;
            let dGlucoseTotal = 0, dGlucoseCount = 0;
            let dTargets = DEFAULT_TARGETS;

            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    dTargets = data.targets || DEFAULT_TARGETS;
                    if (data.meals) {
                        Object.values(data.meals).forEach(meal => {
                            if (meal.items) {
                                meal.items.forEach(item => {
                                    dCals += (item.cals || 0);
                                    dProt += (item.prot || 0);
                                    dCarb += (item.carb || 0);
                                    dFat += (item.fat || 0);
                                });
                            }
                        });
                    }
                    if (data.glucose && data.glucose.length > 0) {
                        data.glucose.forEach(g => {
                            if (g.value) {
                                dGlucoseTotal += parseFloat(g.value);
                                dGlucoseCount++;
                            }
                        });
                    }
                } catch (e) { }
            }

            weeklyCals.push({ val: dCals, date: d });
            weeklyProt.push({ val: dProt, date: d });
            weeklyCarb.push({ val: dCarb, date: d });
            weeklyFat.push({ val: dFat, date: d });

            // Store full daily stats for detailed breakdown
            if (!weeklyHistory) var weeklyHistory = [];
            weeklyHistory.push({
                date: d,
                cals: dCals,
                prot: dProt,
                carb: dCarb,
                fat: dFat,
                avgGlucose: dGlucoseCount > 0 ? (dGlucoseTotal / dGlucoseCount) : null
            });

            // Adherence: Roughly met calories (within 10%) and reached protein
            const calMatch = dCals > 0 && Math.abs(dCals - dTargets.calories) < (dTargets.calories * 0.15);
            const protMatch = dProt >= dTargets.prot * 0.9;
            if (calMatch || protMatch) adherenceDays++;
        }

        const avgCals = weeklyCals.reduce((a, b) => a + b.val, 0) / 7;
        const avgProt = weeklyProt.reduce((a, b) => a + b.val, 0) / 7;
        const maxCalObj = weeklyCals.reduce((max, obj) => obj.val > max.val ? obj : max, weeklyCals[0]);
        const maxProtObj = weeklyProt.reduce((max, obj) => obj.val > max.val ? obj : max, weeklyProt[0]);
        const adherenceScore = Math.round((adherenceDays / 7) * 100);

        // Summary moved to bottom of section as requested

        yPos += 10;

        // --- ADD PREMIUM MACRO BREAKDOWN CHART ---
        const chartW = pageWidth - (margin * 2);
        const chartH = 88; // Increased height to prevent Frame Mask overlap with header
        addPageIfNeeded(chartH + 10);

        // Chart Card Background
        doc.setFillColor(...C_CARD);
        doc.roundedRect(margin, yPos, chartW, chartH, 4, 4, 'F');

        // Header
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(tr('food_log.pdf_daily_report.macro_breakdown_title', "Macro Breakdown"), margin + 30, yPos + 10);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(tr('food_log.pdf_daily_report.net_carbs_limit', "Net Carbs limit: {val}g/day").replace('{val}', targets.carb), margin + 30, yPos + 15);

        // Icon (Pie style like image - Redesigned V2)
        doc.setFillColor(32, 32, 35);
        doc.circle(margin + 15, yPos + 11, 6, 'F');
        doc.setFillColor(...C_ACCENT);
        doc.circle(margin + 15, yPos + 11, 4, 'F');
        doc.setFillColor(32, 32, 35);
        doc.rect(margin + 15, yPos + 11, 5, 5, 'F'); // Cutout slice

        // Legend
        const legX = margin + chartW - 95; // Shifted left to prevent overflow
        const legY = yPos + 10;
        doc.setFontSize(8);

        doc.setFillColor(255, 64, 129); // Carbs: Pink
        doc.circle(legX, legY - 1, 1.8, 'F');
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(tr('food_log.pdf_daily_report.labels.carbs', "Net Carbs"), legX + 5, legY);

        doc.setFillColor(68, 138, 255); // Protein: Blue
        doc.circle(legX + 35, legY - 1, 1.8, 'F');
        doc.text(tr('food_log.pdf_daily_report.labels.protein', "Protein"), legX + 40, legY);

        doc.setFillColor(255, 215, 64); // Fat: Yellow
        doc.circle(legX + 65, legY - 1, 1.8, 'F'); // Filled circle for consistent look
        doc.text(tr('food_log.pdf_daily_report.labels.fats', "Fat"), legX + 70, legY);

        // Draw Bars (V3 Design: Taller, Narrower, Proportional)
        const barAreaW = chartW - 20;
        const wBarW = 14; // Narrower bars per Image 2
        const wBarSpace = (barAreaW - (wBarW * 7)) / 6;
        const wBarBaseY = yPos + chartH - 12;
        const maxBarH = 48; // Taller bars

        // Target Max Scale (Image 2 shows bars that don't always reach the top)
        // We'll scale based on the target calories to show "volume"
        const maxExpectedMacros = (targets.calories / 4); // Rough estimate for scaling

        weeklyCals.forEach((c, idx) => {
            const bx = margin + 10 + idx * (wBarW + wBarSpace);
            const dayLabel = c.date.toLocaleDateString(currentLang, { weekday: 'short' }).toUpperCase();
            const isToday = c.date.toDateString() === currentDate.toDateString();

            // Day Label (Bottom)
            doc.setFontSize(8);
            doc.setFont("helvetica", isToday ? "bold" : "normal");
            doc.setTextColor(isToday ? 255 : 100, isToday ? 255 : 100, isToday ? 255 : 100);
            const labelW = doc.getTextWidth(dayLabel);
            doc.text(dayLabel, bx + (wBarW - labelW) / 2, wBarBaseY + 8);

            // Capsule Base / Background
            const capsuleR = wBarW / 2;
            doc.setFillColor(38, 38, 40); // Lighter gray to be clearly visible against Card [28,28,30]
            doc.roundedRect(bx, wBarBaseY - maxBarH, wBarW, maxBarH, capsuleR, capsuleR, 'F');

            // --- SEGMENT CALCULATIONS (V3: Proportional to target) ---
            const carbs = weeklyCarb[idx].val;
            const prot = weeklyProt[idx].val;
            const fat = weeklyFat[idx].val;

            // Total Macros for this day
            const dayTotal = carbs + prot + fat;

            // Scale based on target calories (Image 2 behavior)
            // If the day is low in food, the bar should be short
            const totalTarget = (targets.calories / 7); // Heuristic scale
            const scale = maxBarH / Math.max(dayTotal, totalTarget * 1.5);

            const hC = carbs * scale;
            const hP = prot * scale;
            const hF = fat * scale;
            const actualBarH = hC + hP + hF;

            let curY = wBarBaseY;

            // 1. FAT (Bottom) -> Yellow
            if (hF > 0.5) {
                doc.setFillColor(255, 215, 64);
                doc.rect(bx, curY - hF, wBarW, hF, 'F');
                curY -= hF;
            }

            // 2. PROTEIN (Middle) -> Blue
            if (hP > 0.5) {
                doc.setFillColor(68, 138, 255);
                doc.rect(bx, curY - hP, wBarW, hP, 'F');
                curY -= hP;
            }

            // 3. CARBS (Top) -> Pink
            if (hC > 0.5) {
                doc.setFillColor(255, 64, 129);
                doc.rect(bx, curY - hC, wBarW, hC, 'F');
            }

            // --- V5 FRAME MASK STRATEGY ---
            const r = capsuleR;

            // 1. Draw "Top Cap" Circle -> REMOVED because Frame Mask handles rounding 
            // and this circle was causing z-index bleeding (yellow overlapping other layers).

            // 2. Draw Frame Mask (The Porthole)
            // Draws a thick border around the capsule shape using the Card Background color.
            const frameStroke = 5; // Reduced further to prevent bleed
            const offset = frameStroke / 2;

            doc.setDrawColor(...C_CARD);
            doc.setLineWidth(frameStroke);
            doc.roundedRect(
                bx - offset,
                wBarBaseY - maxBarH - offset,
                wBarW + frameStroke,
                maxBarH + frameStroke,
                capsuleR + offset,
                capsuleR + offset,
                'S'
            );



            // Today Highlight (Premium Glow)
            if (isToday) {
                doc.setDrawColor(255, 255, 255);
                doc.setLineWidth(0.6);
                doc.roundedRect(bx - 0.5, wBarBaseY - maxBarH - 0.5, wBarW + 1, maxBarH + 1, capsuleR + 0.5, capsuleR + 0.5, 'D');
            }
        });

        yPos += chartH + 15;

        // --- Weekly Daily Breakdown Cards (Grid Layout) ---
        // Replacing the text summary with 7 mini-cards as requested.
        // Layout: 4 cards on first row, 3 cards on second row.

        yPos += 5; // spacing after chart

        const gridGap = 4;
        const dCardW = (pageWidth - (margin * 2) - (gridGap * 3)) / 4;
        const dCardH = 38; // Increased height to fit Glucose

        // Ensure weeklyHistory is sorted by date ascending for the grid (Mon->Sun or Past->Today)
        // The loop populated it from 6 days ago (i=6) to today (i=0) in order? 
        // Loop was: for (let i = 6; i >= 0; i--), date = anchor - i.
        // So i=6 is 6 days ago. It pushed sequentially. So `weeklyHistory[0]` is 6 days ago, `[6]` is today.

        // We want to verify order. pushing:
        // i=6 (oldest) -> push -> index 0
        // i=0 (today) -> push -> index 6
        // So it is already oldest -> newest. Perfect for visualization.

        let dStartX = margin;
        let dStartY = yPos;

        weeklyHistory.forEach((dayStat, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);

            const dx = dStartX + col * (dCardW + gridGap);
            const dy = dStartY + row * (dCardH + gridGap);

            // Card Bg (Darker)
            doc.setFillColor(35, 35, 40);
            doc.roundedRect(dx, dy, dCardW, dCardH, 2, 2, 'F');

            // Date Header
            let dateStr = dayStat.date.toLocaleDateString(currentLang, { weekday: 'long', day: 'numeric', month: 'short' });
            dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1); // Capitalize first letter
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text(dateStr, dx + 4, dy + 8);

            // Divider Line
            doc.setDrawColor(60, 60, 70);
            doc.setLineWidth(0.1);
            doc.line(dx + 4, dy + 11, dx + dCardW - 4, dy + 11);

            // Macros Layout
            doc.setFontSize(7);
            const labelX = dx + 4;
            const valX = dx + dCardW - 4;
            let currentY = dy + 17;
            const lineH = 4.5;

            // KCAL
            doc.setTextColor(160, 160, 170); // Label Color
            doc.setFont("helvetica", "normal");
            doc.text("KCAL", labelX, currentY); // Keep KCAL as universal
            doc.setTextColor(255, 255, 255); // Value Color
            doc.setFont("helvetica", "bold");
            doc.text(`${Math.round(dayStat.cals).toLocaleString('en-US')}`, valX, currentY, { align: 'right' });
            currentY += lineH;

            // Net Carbs (Highlighted)
            doc.setTextColor(160, 160, 170);
            doc.setFont("helvetica", "normal");
            // Net Carbs (Highlighted)
            doc.setTextColor(160, 160, 170);
            doc.setFont("helvetica", "normal");
            // Use Short Label from Table Headers to save space
            const carbLbl = tr('food_log.pdf_daily_report.table_headers.carb', "Carb");
            doc.text(carbLbl.charAt(0).toUpperCase() + carbLbl.slice(1).toLowerCase(), labelX, currentY);
            doc.setTextColor(...C_ACCENT); // Yellow/Accent Color
            doc.setFont("helvetica", "bold");
            doc.text(`${Math.round(dayStat.carb).toLocaleString('en-US')}g`, valX, currentY, { align: 'right' });
            currentY += lineH;

            // Protein
            doc.setTextColor(160, 160, 170);
            doc.setFont("helvetica", "normal");
            const protLbl = tr('food_log.pdf_daily_report.table_headers.prot', "Prot");
            doc.text(protLbl.charAt(0).toUpperCase() + protLbl.slice(1).toLowerCase(), labelX, currentY);
            doc.setTextColor(180, 180, 190); // Slightly muted white
            doc.setFont("helvetica", "bold");
            doc.text(`${Math.round(dayStat.prot).toLocaleString('en-US')}g`, valX, currentY, { align: 'right' });
            currentY += lineH;

            doc.setTextColor(160, 160, 170);
            doc.setFont("helvetica", "normal");
            const fatLbl = tr('food_log.pdf_daily_report.table_headers.fat', "Fat");
            doc.text(fatLbl.charAt(0).toUpperCase() + fatLbl.slice(1).toLowerCase(), labelX, currentY);
            doc.setTextColor(180, 180, 190);
            doc.setFont("helvetica", "bold");
            doc.text(`${Math.round(dayStat.fat).toLocaleString('en-US')}g`, valX, currentY, { align: 'right' });
            currentY += lineH;

            // Glucose (New Row)
            if (dayStat.avgGlucose !== null) {
                doc.setTextColor(160, 160, 170);
                doc.setFont("helvetica", "normal");
                const glucLbl = tr('food_log.glucose', "Glucose");
                doc.text(glucLbl.charAt(0).toUpperCase() + glucLbl.slice(1).toLowerCase(), labelX, currentY);
                doc.setTextColor(200, 200, 210);
                doc.setFont("helvetica", "bold");
                doc.text(`${Math.round(dayStat.avgGlucose).toLocaleString('en-US')}`, valX, currentY, { align: 'right' });
            } else {
                doc.setTextColor(80, 80, 90);
                doc.setFont("helvetica", "normal");
                const glucLbl = tr('food_log.glucose', "Glucose");
                doc.text(glucLbl.charAt(0).toUpperCase() + glucLbl.slice(1).toLowerCase(), labelX, currentY);
                doc.text("--", valX, currentY, { align: 'right' });
            }
        });

        yPos = dStartY + (2 * (dCardH + gridGap)) + 5; // Update yPos for footer spacing



        // FOOTER
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(60, 60, 60);
            doc.text(`AUREUS FIT AI - ${tr('food_log.pdf_daily_report.footer_page', "PAGE").toUpperCase()} ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }

        // Output with Timestamped Filename
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const filename = `Aureus_Report_${year}_${month}_${day}.pdf`;

        // Explicit Blob download method to ensure filename and extension are correct
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // --- Init ---
    seedMockHistory();
    loadLogForDate(currentDate);
    initFoodLogHydration();

    // --- Hydration Logic ---
    function initFoodLogHydration() {
        // Ensure hydration data is initialized in logData
        if (!logData.hydration) {
            logData.hydration = { current: 0, goal: 2500 }; // Default goal 2.5L
        }

        // Load user settings for hydration goal if available
        const globalSettingsStored = localStorage.getItem(getUserKey('aureus_user_settings'));
        if (globalSettingsStored) {
            try {
                const settings = JSON.parse(globalSettingsStored);
                if (settings.hydrationGoal) {
                    logData.hydration.goal = settings.hydrationGoal;
                }
            } catch (e) {
                console.error("Error loading global settings for hydration goal", e);
            }
        }

        // Initial UI Update
        updateFoodLogHydrationUI();

        // Modal Elements
        const hydroModal = document.getElementById('hydrationModal');
        const card = document.getElementById('foodLogHydrationCard');
        const closeBtn = document.getElementById('closeHydroModal');

        // Open Modal (ignoring clicks on buttons inside card)
        if (card) {
            card.addEventListener('click', (e) => {
                // validation to prevent double firing if clicking buttons inside
                if (e.target.closest('button')) return;
                updateModalUI();
                if (hydroModal) hydroModal.classList.remove('hidden');
            });
        }

        // Close Modal
        if (closeBtn && hydroModal) {
            closeBtn.addEventListener('click', () => {
                hydroModal.classList.add('hidden');
            });
        }

        // Close on background click
        if (hydroModal) {
            hydroModal.addEventListener('click', (e) => {
                if (e.target === hydroModal) {
                    hydroModal.classList.add('hidden');
                }
            });
        }

        // Modal Action Buttons
        const setupBtn = (id, action) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', action);
        };

        setupBtn('btnAdd250', () => addWater(250));
        setupBtn('btnRemove250', () => removeWater(250));
        setupBtn('btnAdd500', () => addWater(500));
        setupBtn('btnRemove500', () => removeWater(500));

        setupBtn('btnAddCustomWater', () => {
            const input = document.getElementById('customWaterInput');
            if (input && input.value) {
                addWater(parseInt(input.value));
                input.value = '';
            }
        });

        setupBtn('btnSetGoal', () => {
            const input = document.getElementById('customGoalInput');
            if (input && input.value) {
                setHydrationGoal(parseInt(input.value));
            }
        });

        setupBtn('btnResetWater', () => {
            if (confirm(Locales.getTranslation('food_log.reset_confirm') || "Reset today's water log?")) {
                setWater(0);
            }
        });
    }

    // Expose Global Helper for direct inline onclicks
    window.GlobalHydration = {
        addWater: (amount) => addWater(amount)
    };

    window.editGLLimit = function () {
        const currentLimit = localStorage.getItem('aureus_gl_limit') || "100";
        const newLimit = prompt("Enter Daily Glycemic Load Limit:", currentLimit);
        if (newLimit && !isNaN(parseInt(newLimit))) {
            localStorage.setItem('aureus_gl_limit', parseInt(newLimit));
            // We need to access the local updateGlycemicGauge. 
            // Since it's inside closure, we might need to expose it or reload. 
            // ideally we expose it, but for now a simple fix:
            if (typeof updateGlycemicGauge === 'function') {
                updateGlycemicGauge();
            } else {
                // Fallback if locally scoped and not exposed? 
                // Actually we are inside the closure here if we define it here.
                // But wait, window.editGLLimit is defined inside the closure too in this file?
                // Yes, line 1 starts with DOMContentLoaded. 
                // So if we define window.editGLLimit HERE, it has access to updateGlycemicGauge closure!
                updateGlycemicGauge();
            }
        }
    };

    function updateFoodLogHydrationUI() {
        if (!logData || !logData.hydration) return;

        const hydroCurrent = logData.hydration ? logData.hydration.current : 0;
        const hydroGoal = logData.hydration ? logData.hydration.goal : 2500;

        // 1. Update Card Display
        const valDisplay = document.getElementById('logWaterValDisplay');
        if (valDisplay) valDisplay.innerHTML = `${hydroCurrent} <small style="font-size: 14px; color: #a1a1aa;">ml</small>`;

        const logWaterFill = document.getElementById('logWaterFill');
        const logWaterLabel = document.getElementById('logWaterLabel');

        if (logWaterFill) {
            const pct = Math.min((hydroCurrent / hydroGoal) * 100, 100);
            logWaterFill.style.height = `${pct}%`;

            // Text color contrast adjustment
            if (pct > 50) {
                if (logWaterLabel) logWaterLabel.style.color = '#fff';
            } else {
                if (logWaterLabel) logWaterLabel.style.color = '#fff'; // Always white on dark bg usually, but check contrast logic if needed
            }
        }

        if (logWaterLabel) {
            const pct = Math.round((hydroCurrent / hydroGoal) * 100);
            logWaterLabel.innerText = `${pct}% Goal`;
        }

        // 2. Update Modal UI if open
        updateModalUI();
    }

    function updateModalUI() {
        if (!logData || !logData.hydration) return;
        const current = logData.hydration.current;
        const goal = logData.hydration.goal;

        const modalVal = document.getElementById('hydroModalValue');
        const modalGoal = document.getElementById('hydroModalGoal');

        if (modalVal) modalVal.innerText = current.toLocaleString('en-US');
        if (modalGoal) modalGoal.innerText = goal.toLocaleString('en-US');
    }

    function addWater(amountMl) {
        if (!logData) return;
        if (!logData.hydration) logData.hydration = { current: 0, goal: 2500 };

        logData.hydration.current += amountMl;
        saveLog();
        updateFoodLogHydrationUI();
    }

    function removeWater(amountMl) {
        if (!logData || !logData.hydration) return;
        logData.hydration.current = Math.max(0, logData.hydration.current - amountMl);
        saveLog();
        updateFoodLogHydrationUI();
    }

    function setWater(amountMl) {
        if (!logData || !logData.hydration) return;
        logData.hydration.current = amountMl;
        saveLog();
        updateFoodLogHydrationUI();
    }

    function setHydrationGoal(newGoal) {
        if (!logData || !logData.hydration) return;
        logData.hydration.goal = newGoal;
        saveLog();
        updateFoodLogHydrationUI();

        // Also save to global settings so it persists across days
        try {
            const globalSettingsStored = localStorage.getItem(getUserKey('aureus_user_settings'));
            let settings = globalSettingsStored ? JSON.parse(globalSettingsStored) : {};
            settings.hydrationGoal = newGoal;
            localStorage.setItem(getUserKey('aureus_user_settings'), JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save global hydration goal", e);
        }

        alert(Locales.getTranslation('food_log.goal_updated') || "Goal updated!");
    }
});
