
const DashUtils = {
    getUserKey: function (baseKey) {
        if (window.getUserKey) return window.getUserKey(baseKey);
        // Fallback to active user if available, else Usuario
        const saved = localStorage.getItem('aureus_active_user');
        let userPrefix = 'Usuario';
        if (saved) {
            try {
                const u = JSON.parse(saved);
                // Use ID for stability (renaming profile shouldn't lose data), fallback to name
                userPrefix = u.id || u.name || 'Usuario';
            } catch (e) { }
        }
        return `${userPrefix}_${baseKey}`;
    }
};

// --- Hydration Feature (Synced) ---
// --- Hydration Feature (Synced) ---
function initDashboardHydration() {
    const card = document.getElementById('hydrationCard');
    if (card) card.classList.remove('hidden');

    const btnAdd = document.getElementById('btnAddWater');
    const dropletsRow = document.getElementById('waterDropletsRow');
    const volumeDisplay = document.getElementById('waterVolumeDisplay');

    // Uses global DashUtils

    const getTodayKey = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return DashUtils.getUserKey(`aureus_log_${y}-${m}-${d}`);
    };

    const loadData = () => {
        const stored = localStorage.getItem(getTodayKey());
        if (stored) return JSON.parse(stored);
        return {
            meals: {},
            hydration: { current: 0, goal: 2500 } // Default goal in ml
        };
    };

    const saveData = (data) => {
        localStorage.setItem(getTodayKey(), JSON.stringify(data));

        // Sync to Supabase if available
        if (window.syncLogToSupabase) {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            window.syncLogToSupabase(dateStr, data);
        }

        updateUI(data.hydration);
        // Dispatch event for Fasting Timer to pick up
        window.dispatchEvent(new CustomEvent('aureus-hydration-changed'));
    };

    const updateUI = (hydration) => {
        if (!hydration) hydration = { current: 0, goal: 2500 };

        const currentMl = hydration.current || 0;
        const goalMl = hydration.goal || 2500;

        // Update Text Stats
        if (volumeDisplay) {
            volumeDisplay.innerText = `${currentMl.toLocaleString('en-US')} / ${goalMl.toLocaleString('en-US')}ml`;
        }

        // Render Droplets
        // 1 Droplet = 250ml approximately? 
        // Or simply map goal to N droplets. Let's say 1 droplet per 250ml chunk.
        const chunk = 250;
        const targetCups = Math.ceil(goalMl / chunk) || 10;
        const filledCups = Math.floor(currentMl / chunk);

        if (dropletsRow) {
            dropletsRow.innerHTML = '';
            // Render fixed number of droplets based on goal, or just a row of them?
            // Image 2 shows about 7-8 droplets.
            // Let's render 'targetCups' number of droplets.

            for (let i = 0; i < targetCups; i++) {
                const drop = document.createElement('i');
                drop.className = 'fa-solid fa-droplet droplet-icon';

                if (i < filledCups) {
                    drop.classList.add('filled');
                } else {
                    drop.classList.add('empty');
                }

                dropletsRow.appendChild(drop);
            }
        }
    };

    // Actions
    if (btnAdd) btnAdd.onclick = () => {
        const data = loadData();
        if (!data.hydration) data.hydration = { current: 0, goal: 2500 };
        data.hydration.current += 250;
        saveData(data);
    };

    // Listen for changes from other components (Fasting Timer)
    window.addEventListener('aureus-hydration-changed', () => {
        const data = loadData();
        updateUI(data.hydration);
    });

    // Initial Load
    const data = loadData();
    updateUI(data.hydration);
}

document.addEventListener('DOMContentLoaded', function () {
    // initialize Charts
    // initialize Charts

    if (typeof initFastingTimer === 'function') {
        try { initFastingTimer(); } catch (e) { console.error("Fasting Widget Error", e); }
    }

    try {
        initMacroChart();
    } catch (e) {
        console.error("Error initializing macro chart:", e);
    }

    // 3. Listen for changes locally
    window.addEventListener('storage', (e) => {
        if (e.key === DashUtils.getUserKey('aureus_log_' + getTodayStr()) || e.key === DashUtils.getUserKey('aureus_user_settings') || e.key === 'aureus_targets_updated') {
            initMacroChart();
        }

    });

    window.addEventListener('settings-saved', () => {
        initMacroChart();
    });

    // Purine Edit Button
    const btnEditPurine = document.getElementById('btnEditPurine');
    if (btnEditPurine) {
        btnEditPurine.addEventListener('click', () => {
            const stored = localStorage.getItem(DashUtils.getUserKey('aureus_user_settings'));
            let currentLimit = 800;
            if (stored) {
                try {
                    const s = JSON.parse(stored);
                    if (s.purineLimit) currentLimit = s.purineLimit;
                } catch (e) { }
            }

            const val = prompt("Define Purine Limit (mg/day):", currentLimit);
            if (val !== null) {
                const num = parseInt(val);
                if (!isNaN(num) && num > 0) {
                    let settings = stored ? JSON.parse(stored) : {};
                    settings.purineLimit = num;
                    localStorage.setItem(DashUtils.getUserKey('aureus_user_settings'), JSON.stringify(settings));
                    initMacroChart();
                }
            }
        });
    }

    // Quick Add Meal Listeners - Handled by quick-add-dashboard.js
    // Quick Add Meal Listeners - Handled by quick-add-dashboard.js
    if (typeof initDashboardHydration === 'function') {
        try { initDashboardHydration(); } catch (e) { console.error("Hydration Init Error", e); }
    }

    // Steps Feature
    if (typeof initDashboardSteps === 'function') {
        try { initDashboardSteps(); } catch (e) { console.error("Steps Init Error", e); }
    }
});

function initDashboardSteps() {
    // Elements
    const displayVal = document.getElementById('stepsValueDisplay');
    const displayProgText = document.getElementById('stepsProgressText');
    const progBar = document.getElementById('stepsProgressBar');
    const msg = document.getElementById('stepsMessage');
    const btnUpdate = document.getElementById('btnUpdateSteps');

    const getTodayKey = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return DashUtils.getUserKey(`aureus_steps_${y}-${m}-${d}`);
    };

    const loadData = () => {
        const stored = localStorage.getItem(getTodayKey());
        if (stored) return JSON.parse(stored);
        return { current: 0, goal: 5000 };
    };

    const saveData = (data) => {
        localStorage.setItem(getTodayKey(), JSON.stringify(data));
        updateUI(data);
    };

    const updateUI = (data) => {
        const current = data.current || 0;
        const goal = data.goal || 5000;

        // Value
        if (displayVal) displayVal.innerText = current.toLocaleString('en-US');

        // Progress Text
        if (displayProgText) displayProgText.innerText = `${current.toLocaleString('en-US')} / ${goal.toLocaleString('en-US')}`;

        // Progress Bar
        const pct = Math.min(100, (current / goal) * 100);
        if (progBar) {
            progBar.style.width = `${pct}%`;
        }

        // Calorie Display
        const calDisplay = document.getElementById('stepsCalDisplay');
        if (calDisplay) {
            // 500 kcal per 10,000 steps => 0.05 kcal per step
            const burned = Math.round(current * 0.05);
            calDisplay.innerText = `${burned} kcal`;
        }

        // Message
        if (msg) {
            if (current >= goal) {
                msg.innerText = "Goal Reached! Amazing work!";
                msg.style.color = "#22D3EE";
            } else if (current >= goal * 0.5) {
                msg.innerText = "Halfway there, keep going!";
                msg.style.color = "rgba(255,255,255,0.7)";
            } else {
                msg.innerText = "Keep moving!";
                msg.style.color = "rgba(255,255,255,0.5)";
            }
        }
    };

    if (btnUpdate) {
        btnUpdate.onclick = () => {
            const data = loadData();
            const modal = document.getElementById('stepsModal');
            const inputEl = document.getElementById('stepsInputVal');
            const goalInputEl = document.getElementById('stepsGoalInput');
            const saveBtn = document.getElementById('saveStepsBtn');
            const cancelBtn = document.getElementById('cancelStepsBtn');
            const closeBtn = document.getElementById('closeStepsModalBtn');

            if (modal && inputEl) {
                inputEl.value = data.current;
                if (goalInputEl) goalInputEl.value = data.goal || 5000;

                // Show modal
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                inputEl.focus();

                const closeModal = () => {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                };

                const saveSteps = () => {
                    const val = parseInt(inputEl.value);
                    const goalVal = goalInputEl ? parseInt(goalInputEl.value) : 5000;

                    if (!isNaN(val) && val >= 0) {
                        data.current = val;
                        if (!isNaN(goalVal) && goalVal > 0) {
                            data.goal = goalVal;
                        }
                        saveData(data);
                        closeModal();
                    } else {
                        alert("Please enter a valid number of steps.");
                    }
                };

                // Remove existing listeners
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                newSaveBtn.addEventListener('click', saveSteps);

                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                newCancelBtn.addEventListener('click', closeModal);

                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                newCloseBtn.addEventListener('click', closeModal);

                // Enter key support
                inputEl.onkeydown = (e) => {
                    if (e.key === 'Enter') saveSteps();
                    if (e.key === 'Escape') closeModal();
                };
                if (goalInputEl) {
                    goalInputEl.onkeydown = (e) => {
                        if (e.key === 'Enter') saveSteps();
                        if (e.key === 'Escape') closeModal();
                    };
                }
            }
        };
    }

    // Initial Load
    updateUI(loadData());
}



// Edit Purine Limit
const btnEditPurine = document.getElementById('btnEditPurine');
const purineModal = document.getElementById('purineModal');
const closePurineModalBtn = document.getElementById('closePurineModalBtn');
const cancelPurineBtn = document.getElementById('cancelPurineBtn');
const savePurineBtn = document.getElementById('savePurineBtn');
const purineInputVal = document.getElementById('purineInputVal');

if (btnEditPurine) {
    const closePurineModal = () => {
        if (purineModal) purineModal.classList.add('hidden');
    };

    const savePurineLimit = () => {
        if (!purineInputVal) return;
        const input = purineInputVal.value;
        const val = parseInt(input);
        if (!isNaN(val) && val > 0) {
            // Update settings using correct user key
            const userKey = DashUtils.getUserKey('aureus_user_settings');

            let settings = {};
            const stored = localStorage.getItem(userKey);
            if (stored) {
                try { settings = JSON.parse(stored); } catch (e) { }
            }
            settings.purineLimit = val;
            localStorage.setItem(userKey, JSON.stringify(settings));

            // Force refresh to apply changes
            location.reload();
        } else {
            alert(window.Locales ? window.Locales.getTranslation('valid_number') : "Please enter a valid number.");
        }
    };

    btnEditPurine.onclick = (e) => {
        if (e) e.stopPropagation();

        // Load current
        let currentLimit = 400;
        const userKey = DashUtils.getUserKey('aureus_user_settings');

        const stored = localStorage.getItem(userKey);
        if (stored) {
            try {
                const s = JSON.parse(stored);
                if (s.purineLimit) currentLimit = s.purineLimit;
            } catch (e) { }
        }

        if (purineInputVal) purineInputVal.value = currentLimit;
        if (purineModal) purineModal.classList.remove('hidden');
        if (purineInputVal) purineInputVal.focus();
    };

    if (closePurineModalBtn) closePurineModalBtn.onclick = closePurineModal;
    if (cancelPurineBtn) cancelPurineBtn.onclick = closePurineModal;
    if (savePurineBtn) savePurineBtn.onclick = savePurineLimit;

    // Enter key support
    if (purineInputVal) {
        purineInputVal.onkeydown = (e) => {
            if (e.key === 'Enter') savePurineLimit();
            if (e.key === 'Escape') closePurineModal();
        };
    }

    // click outside
    if (purineModal) {
        purineModal.onclick = (e) => {
            if (e.target === purineModal) closePurineModal();
        };
    }
}

function initMacroChart() {
    // 1. Fetch Data for Today
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const storageKey = DashUtils.getUserKey(`aureus_log_${y}-${m}-${d}`);

    let totalCals = 0;
    let totalFat = 0;
    let totalProt = 0;
    let totalCarb = 0;
    let totalPurine = 0;
    let totalGL = 0;

    let targetCals = 2000;
    let targetFat = 150;
    let targetProt = 95;
    let targetCarb = 45;
    let targetPurine = 800; // Standard max baseline

    // Try to load global settings first as baseline
    const globalSettingsStored = localStorage.getItem(DashUtils.getUserKey('aureus_user_settings'));
    if (globalSettingsStored) {
        try {
            const settings = JSON.parse(globalSettingsStored);
            if (settings.targets) {
                targetCals = settings.targets.calories || targetCals;
                targetFat = settings.targets.fat || targetFat;
                targetProt = settings.targets.prot || targetProt;
                targetCarb = settings.targets.carb || targetCarb;
            }
            // Load custom Purine Limit if exists
            if (settings.purineLimit) {
                targetPurine = settings.purineLimit;
            }
        } catch (e) { console.error("Error loading global settings", e); }
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
        try {
            const logData = JSON.parse(stored);
            if (logData.meals) {
                Object.values(logData.meals).forEach(meal => {
                    if (meal.items) {
                        meal.items.forEach(item => {
                            totalCals += (item.cals || item.cal || 0);
                            totalFat += (item.fat || 0);
                            totalProt += (item.prot || 0);
                            totalCarb += (item.carb || 0);
                            totalPurine += (item.purine || item.purines || 0);
                            // Calculate GL: (GI * Carbs) / 100
                            const itemGI = item.gi || 0;
                            const itemCarb = item.carb || 0;
                            totalGL += (itemGI * itemCarb) / 100;
                        });
                    }
                });
            }
            // FIX: Only use log targets if we DIDN'T load global settings.
            // This ensures live settings updates (e.g. changing goals) are reflected immediately
            // even if the log for today was created with old targets.
            if (!globalSettingsStored && logData.targets) {
                targetCals = logData.targets.calories || targetCals;
                targetFat = logData.targets.fat || targetFat;
                targetProt = logData.targets.prot || targetProt;
                targetCarb = logData.targets.carb || targetCarb;
            }
        } catch (e) {
            console.error("Error parsing log data for dashboard", e);
        }
    }

    // 2. Update UI Elements
    const totalConsumedDisplay = document.querySelector('.chart-center-text .value');
    if (totalConsumedDisplay) totalConsumedDisplay.innerText = totalCals.toLocaleString('en-US');



    // Update Mini Macro Row (Calorie Card Enhancement)
    const miniProt = document.getElementById('miniProtVal');
    const miniCarb = document.getElementById('miniCarbVal');
    const miniFat = document.getElementById('miniFatVal');

    if (miniProt) miniProt.innerText = `${Math.round(totalProt)}g`;
    if (miniCarb) miniCarb.innerText = `${Math.round(totalCarb)}g`;
    if (miniFat) miniFat.innerText = `${Math.round(totalFat)}g`;

    // Update Macro Targets Card Subtitle & Goal Display if exists
    const macroSubtitle = document.querySelector('.macro-card .subtitle');
    if (macroSubtitle) {
        macroSubtitle.innerText = `Targeting ${Math.round((targetFat * 9 / targetCals) * 100)}% Fat, ${Math.round((targetProt * 4 / targetCals) * 100)}% Protein, ${Math.round((targetCarb * 4 / targetCals) * 100)}% Carbs`;
    }



    // Update Purine Card
    const purinePill = document.getElementById('purineValuePill');
    if (purinePill) {
        purinePill.innerHTML = `${Math.round(totalPurine)}mg / ${targetPurine}mg`;
    }

    // Update Segments
    updatePurineSegments(totalPurine, targetPurine);

    // Update Net Carbs Card
    const carbConsumedValEl = document.getElementById('carbConsumedVal');
    const carbTargetValEl = document.getElementById('carbTargetVal');
    const carbStatusTextEl = document.getElementById('carbStatusText');
    const carbLeftTextEl = document.getElementById('carbLeftText');
    const carbProgBarEl = document.getElementById('carbProgBar');
    const carbBadgeEl = document.getElementById('carbBadge');
    // const carbImpactStatusEl = document.getElementById('carbImpactStatus'); // REMOVED
    // const carbImpactDotsEl = document.getElementById('carbImpactDots'); // REMOVED
    const dailyGLValueEl = document.getElementById('dailyGLValue');
    const dailyGLStatusEl = document.getElementById('dailyGLStatus');

    if (carbConsumedValEl) carbConsumedValEl.innerText = Math.round(totalCarb);
    if (carbTargetValEl) carbTargetValEl.innerText = `/ ${targetCarb}g`;

    // Logic for Carbs Status (Impact now handled by GL)
    const carbPulseDotEl = document.getElementById('carbPulseDot');

    if (carbStatusTextEl) {
        if (totalCarb <= targetCarb * 0.5) {
            carbStatusTextEl.innerText = "In deep ketosis";
            if (carbBadgeEl) carbBadgeEl.innerText = "DEEP KETOSIS";
            if (carbBadgeEl) carbBadgeEl.className = "badge-tag pink";
            if (carbPulseDotEl) carbPulseDotEl.className = "pulsing-dot pink";
        } else if (totalCarb <= targetCarb) {
            carbStatusTextEl.innerText = "In ketosis";
            if (carbBadgeEl) carbBadgeEl.innerText = "KETOSIS";
            if (carbBadgeEl) carbBadgeEl.className = "badge-tag pink";
            if (carbPulseDotEl) carbPulseDotEl.className = "pulsing-dot pink";
        } else {
            carbStatusTextEl.innerText = "Out of ketosis";
            if (carbBadgeEl) carbBadgeEl.innerText = "HIGH CARB";
            if (carbBadgeEl) carbBadgeEl.className = "badge-tag orange-bg";
            // Change dot to orange or red? 'orange-bg' badge implies orange theme.
            if (carbPulseDotEl) carbPulseDotEl.className = "pulsing-dot orange";
        }
    }

    if (carbLeftTextEl) {
        const left = targetCarb - totalCarb;
        carbLeftTextEl.innerText = left > 0 ? `${Math.round(left)}g left` : "Limit reached";
    }

    if (carbProgBarEl) {
        const rawPct = (totalCarb / (targetCarb || 1)) * 100;
        const widthPct = Math.min(100, rawPct);
        carbProgBarEl.style.width = `${widthPct}%`;

        if (rawPct > 100) {
            carbProgBarEl.style.backgroundColor = "var(--accent-orange)";
        } else {
            carbProgBarEl.style.backgroundColor = ""; // Reset to default (CSS calls it blue usually)
        }
    }

    // Logic for Glycemic Load (GL) - Premium Display
    const glStatusTextEl = document.getElementById('glStatusText');
    const glMeterEl = document.getElementById('glMeter');
    const glValuePillEl = document.getElementById('glValuePill');

    // Load custom GL Limit
    const storedGlLimit = localStorage.getItem('aureus_gl_limit');
    // Default to 100 if not set
    const dailyGlLimit = storedGlLimit ? parseInt(storedGlLimit) : 100;

    if (glStatusTextEl) {
        const roundedGL = Math.round(totalGL);

        // Update Value Pill
        if (glValuePillEl) glValuePillEl.innerText = `${roundedGL} / ${dailyGlLimit}`;

        // Get Meter Segments
        let segments = [];
        if (glMeterEl) segments = glMeterEl.querySelectorAll('.seg');
        // Reset all segments to dim
        segments.forEach(seg => seg.style.opacity = '0.2');

        // Reset Text Class
        glStatusTextEl.className = 'stat-value-big';

        // Scale thresholds based on limit? 
        // Original: <30 (Low), <80 (Mod), >80 (High) for 100 limit.
        // Ratio based logic: 
        // Low: < 30% of limit
        // Mod: < 80% of limit
        // High: > 80% of limit

        const lowThresh = dailyGlLimit * 0.3;
        const highThresh = dailyGlLimit * 0.8;

        if (roundedGL < lowThresh) {
            // Low
            glStatusTextEl.innerText = "Low";
            glStatusTextEl.classList.add('green-text');
            if (segments[0]) segments[0].style.opacity = '1';
        } else if (roundedGL < highThresh) {
            // Moderate
            glStatusTextEl.innerText = "Moderate";
            glStatusTextEl.classList.add('orange-text');
            if (segments[1]) segments[1].style.opacity = '1';
        } else {
            // High
            glStatusTextEl.innerText = "High";
            glStatusTextEl.classList.add('red-text');
            if (segments[2]) segments[2].style.opacity = '1';
        }
    }

    // Update Calories Remaining Card (First card on dashboard)
    const calRemValueEl = document.getElementById('calRemValue');
    const calConsumedTextEl = document.getElementById('calConsumedText');
    const calGoalTextEl = document.getElementById('calGoalText');
    const calProgBarEl = document.getElementById('calProgBar');

    if (calRemValueEl) calRemValueEl.innerText = Math.max(0, targetCals - totalCals).toLocaleString('en-US');
    if (calConsumedTextEl) calConsumedTextEl.innerText = `${totalCals.toLocaleString('en-US')} consumed`;
    if (calGoalTextEl) calGoalTextEl.innerText = `Goal: ${targetCals.toLocaleString('en-US')}`;

    if (calProgBarEl) {
        const calPct = (totalCals / targetCals) * 100;
        calProgBarEl.style.width = `${Math.min(100, calPct)}%`;

        if (calPct > 100) {
            calProgBarEl.style.backgroundColor = "var(--accent-red)";
            if (calConsumedTextEl) calConsumedTextEl.style.color = "var(--accent-red)";
        } else {
            calProgBarEl.style.backgroundColor = ""; // Default
            if (calConsumedTextEl) calConsumedTextEl.style.color = ""; // Default
        }
    }

    // Update Goal Badge
    const calGoalBadgeEl = document.getElementById('calGoalBadge');
    if (calGoalBadgeEl && globalSettingsStored) {
        try {
            const settings = JSON.parse(globalSettingsStored);
            const deficit = settings.goalDeficit || 0;
            if (deficit > 50) {
                calGoalBadgeEl.innerText = "FAT LOSS";
                calGoalBadgeEl.style.display = 'block';
                calGoalBadgeEl.className = "badge-tag orange-bg";
            } else if (deficit < -50) {
                calGoalBadgeEl.innerText = "MUSCLE GAIN";
                calGoalBadgeEl.style.display = 'block';
                calGoalBadgeEl.className = "badge-tag blue-bg";
            } else {
                calGoalBadgeEl.innerText = "MAINTENANCE";
                calGoalBadgeEl.style.display = 'block';
                calGoalBadgeEl.className = "badge-tag lime-bg";
            }
        } catch (e) { }
    }

    // Update Purine Intake Card
    const purineStatusTextEl = document.getElementById('purineStatusText');
    const purineValuePillEl = document.getElementById('purineValuePill');
    const purineMeterEl = document.getElementById('purineMeter');
    const purinePredictionTextEl = document.getElementById('purinePredictionText');

    if (purineValuePillEl) purineValuePillEl.innerText = `${Math.round(totalPurine)}mg / ${targetPurine}mg`;

    if (purineStatusTextEl) {
        // Calculate Percentages for Segments
        // Seg 1 (Green): 0 - 50% of Target
        // Seg 2 (Orange): 50% - 85% of Target (Window: 35%)
        // Seg 3 (Red): 85% - 100%+ of Target (Window: 15%+)

        const pct = (totalPurine / targetPurine) * 100;

        const segments = purineMeterEl ? purineMeterEl.querySelectorAll('.seg-fill') : [];
        if (segments.length >= 3) {
            // Segment 1 Logic (0-50%)
            // If pct >= 50, fill 100%. Else pct / 50 * 100
            const seg1Fill = Math.min(100, (pct / 50) * 100);
            segments[0].style.width = `${seg1Fill}%`;

            // Segment 2 Logic (50-85%) - Range is 35 units
            // If pct <= 50, fill 0%. If pct >= 85, fill 100%. 
            // Else (pct - 50) / 35 * 100
            let seg2Fill = 0;
            if (pct > 50) {
                seg2Fill = Math.min(100, ((pct - 50) / 35) * 100);
            }
            segments[1].style.width = `${seg2Fill}%`;

            // Segment 3 Logic (85%+)
            let seg3Fill = 0;
            if (pct > 85) {
                // Open ended, or cap at 100% of the segment? Let's cap at 100 for visual sanity
                seg3Fill = Math.min(100, ((pct - 85) / 15) * 100);
            }
            segments[2].style.width = `${seg3Fill}%`;
        }

        // Text Status Update
        if (pct > 85) {
            purineStatusTextEl.innerText = window.Locales ? window.Locales.getTranslation('dashboard.high') : "High";
            purineStatusTextEl.className = "stat-value-big red-text";
            if (purinePredictionTextEl) {
                purinePredictionTextEl.innerText = window.Locales ? window.Locales.getTranslation('dashboard.uric_prediction_high') : "Action Required: Immediate hydration and avoid high-purine foods.";
            }
        } else if (pct > 50) {
            purineStatusTextEl.innerText = window.Locales ? window.Locales.getTranslation('dashboard.moderate') : "Moderate";
            purineStatusTextEl.className = "stat-value-big orange-text";
            if (purinePredictionTextEl) {
                purinePredictionTextEl.innerText = window.Locales ? window.Locales.getTranslation('dashboard.uric_prediction_moderate') : "Recommendation: Increase hydration to help flush out uric acid.";
            }
        } else {
            purineStatusTextEl.innerText = window.Locales ? window.Locales.getTranslation('dashboard.low') : "Low";
            purineStatusTextEl.className = "stat-value-big green-text";
            if (purinePredictionTextEl) {
                purinePredictionTextEl.innerText = window.Locales ? window.Locales.getTranslation('dashboard.uric_prediction_low') : "Keep it up! Your purine intake is within the optimal range.";
            }
        }
    }

    // 3. Initialize Chart
    const macroChartEl = document.getElementById('macroChart');
    if (macroChartEl) {
        const ctx = macroChartEl.getContext('2d');

        // Calculate Percentages for Radar Axes
        // Cap at reasonable max for visual scaling, but actual data points can go higher
        const pctCals = Math.round((totalCals / (targetCals || 1)) * 100);
        const pctProt = Math.round((totalProt / (targetProt || 1)) * 100);
        const pctCarb = Math.round((totalCarb / (targetCarb || 1)) * 100);
        const pctFat = Math.round((totalFat / (targetFat || 1)) * 100);
        const pctPurine = Math.round((totalPurine / (targetPurine || 1)) * 100);

        // Specific colors for [Calories, Protein, Carbs, Fat, Purines] fetched from CSS variables
        const styles = getComputedStyle(document.documentElement);
        const colCal = styles.getPropertyValue('--macro-cal').trim() || '#00E676';
        const colProt = styles.getPropertyValue('--macro-prot').trim() || '#448AFF';
        const colCarb = styles.getPropertyValue('--macro-carb').trim() || '#FF4081';
        const colFat = styles.getPropertyValue('--macro-fat').trim() || '#FFD740';
        const colPurine = styles.getPropertyValue('--macro-purine').trim() || '#D500F9';

        const macroColors = [colCal, colProt, colCarb, colFat, colPurine];

        // UPDATE MACRO STATS FOOTER (Restored functionality)
        const macroCalEl = document.getElementById('macroCalVal');
        const macroFatEl = document.getElementById('macroFatVal');
        const macroProtEl = document.getElementById('macroProtVal');
        const macroCarbEl = document.getElementById('macroCarbVal');
        const macroPurineEl = document.getElementById('macroPurineVal');

        // Helper to format macro value with HTML for styling
        const formatMacroHtml = (consumed, target, unit = '') => {
            const isOver = consumed > target;
            const dangerClass = isOver ? 'val-danger' : '';
            const consumedFormatted = unit === '' ? consumed.toLocaleString('en-US') : Math.round(consumed);
            const targetFormatted = unit === '' ? Math.round(target).toLocaleString('en-US') : Math.round(target);

            return `
                <span class="macro-val-consumed ${dangerClass}">${consumedFormatted}</span>
                <span class="macro-val-sep">/</span>
                <span class="macro-val-target">${targetFormatted}${unit}</span>
            `;
        };

        if (macroCalEl) macroCalEl.innerHTML = formatMacroHtml(Math.round(totalCals), targetCals);
        if (macroFatEl) macroFatEl.innerHTML = formatMacroHtml(totalFat, targetFat, 'g');
        if (macroProtEl) macroProtEl.innerHTML = formatMacroHtml(totalProt, targetProt, 'g');
        if (macroCarbEl) macroCarbEl.innerHTML = formatMacroHtml(totalCarb, targetCarb, 'g');
        if (macroPurineEl) macroPurineEl.innerHTML = formatMacroHtml(totalPurine, targetPurine, 'mg');

        // Helper to get color for specific index
        const getPointColor = (context) => {
            const index = context.dataIndex;
            return macroColors[index] || '#FFFFFF';
        };

        const data = {
            labels: ['Calories', 'Protein', 'Carbs', 'Fat', 'Purines'],
            datasets: [
                {
                    label: 'Target (100%)',
                    data: [100, 100, 100, 100, 100],
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle fill
                    borderColor: 'rgba(255, 255, 255, 0.5)', // More visible border
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 0
                },
                {
                    label: 'consumed',
                    data: [pctCals, pctProt, pctCarb, pctFat, pctPurine],
                    backgroundColor: 'rgba(212, 244, 88, 0.55)', // Slightly more opaque
                    borderColor: '#D4F458',
                    borderWidth: 3, // Thicker border
                    pointBackgroundColor: macroColors, // Specific color per point
                    pointBorderColor: '#000',
                    pointBorderWidth: 1.5,
                    pointRadius: 6, // Larger points
                    pointHoverRadius: 8
                }
            ]
        };

        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 10 // Reduced padding
                },
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.12)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: (context) => {
                                const label = context.label;
                                if (label === 'Calories') return colCal;
                                if (label === 'Protein') return colProt;
                                if (label === 'Carbs') return colCarb;
                                if (label === 'Fat') return colFat;
                                if (label === 'Purines') return colPurine;
                                return '#9CA3AF';
                            },
                            font: {
                                size: 18, // Enlarged labels
                                family: "'Outfit', sans-serif",
                                weight: '800'
                            },
                            padding: 15 // More space for labels
                        },
                        ticks: {
                            display: false
                        },
                        min: 0,
                        suggestedMax: 110 // Give some breathing room
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hidden to let chart grow
                    },
                    tooltip: {
                        backgroundColor: 'rgba(24, 24, 27, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#D4F458',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true, // Show the point color in tooltip
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + context.raw + '%';
                            },
                            labelColor: function (context) {
                                return {
                                    borderColor: 'transparent',
                                    backgroundColor: macroColors[context.dataIndex] || '#D4F458'
                                };
                            }
                        }
                    }
                }
            }
        };

        // LAZY LOAD CHART.JS
        LazyLoader.load('chartjs').then(() => {
            // Destroy existing chart if it exists (for refreshes/syncs)
            if (window.myMacroChart) window.myMacroChart.destroy();
            window.myMacroChart = new Chart(ctx, config);
        });

        // --- Sync Listener ---
        if (!window.hasMacroSyncListener) {
            window.addEventListener('storage', (e) => {
                if (e.key === storageKey || (e.key && e.key.includes('_aureus_log_'))) {
                    initMacroChart();
                }
            });
            window.hasMacroSyncListener = true;
        }

        // --- Fasting Timer Logic ---
        if (!window.fastingTimerInitDone) {
            initFastingTimer();
            window.fastingTimerInitDone = true;
        }

        // Keep Weekly Trend in sync
        if (typeof initWeeklyMacroChart === 'function' && !window._isWeeklyChartUpdating) {
            window._isWeeklyChartUpdating = true;
            try {
                initWeeklyMacroChart();
            } finally {
                window._isWeeklyChartUpdating = false;
            }
        }
    }
}

// --- Hydration Feature (Synced) ---





function getTodayStr() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}



function updatePurineSegments(current, target) {
    const segments = document.querySelectorAll('.segmented-meter .seg-fill');
    if (segments.length < 3) return;

    // Reset
    segments.forEach(s => s.style.width = '0%');

    const pct = (current / (target || 1)) * 100;

    if (pct <= 33) {
        segments[0].style.width = `${(pct / 33) * 100}%`;
    } else if (pct <= 66) {
        segments[0].style.width = '100%';
        segments[1].style.width = `${((pct - 33) / 33) * 100}%`;
    } else {
        segments[0].style.width = '100%';
        segments[1].style.width = '100%';
        segments[2].style.width = `${Math.min(((pct - 66) / 34) * 100, 100)}%`;
    }
}



function initFastingTimer() {
    const timerDigits = document.getElementById('timerDigits');
    const badgeText = document.getElementById('badgeText');
    const ringProgress = document.getElementById('ringProgress');
    const knobContainer = document.getElementById('knobContainer');
    const targetTimeDisplay = document.getElementById('targetTimeDisplay');
    const progressPercentDisplay = document.getElementById('progressPercentDisplay');
    const dashboardPhaseBadge = document.getElementById('dashboardPhaseBadge'); // Likely removed in HTML updates, can ignore or check?

    const btnStart = document.getElementById('btnStartFast');
    const activeControls = document.getElementById('activeControls');
    const btnEnd = document.getElementById('btnEndFast');
    const btnAdjust = document.getElementById('btnAdjustFast'); // NEW

    // State
    let fastingState = {
        isFasting: false,
        startTime: null,
        targetHours: 16,
        endTime: null
    };

    let timerInterval;

    function loadState() {
        const saved = localStorage.getItem(DashUtils.getUserKey('aureus_fasting_state'));
        if (saved) {
            fastingState = JSON.parse(saved);
        }
    }

    function saveState() {
        localStorage.setItem(DashUtils.getUserKey('aureus_fasting_state'), JSON.stringify(fastingState));
    }

    function updateTimer() {
        if (!fastingState.isFasting || !fastingState.startTime) {
            // UI Reset / Ready State
            if (timerDigits) timerDigits.innerText = `${fastingState.targetHours}:00:00`;
            if (badgeText) badgeText.innerText = window.Locales.getTranslation('fasting.ready');
            if (targetTimeDisplay) {
                const previewEndDate = new Date();
                previewEndDate.setTime(previewEndDate.getTime() + (fastingState.targetHours * 3600 * 1000));
                const endHours = previewEndDate.getHours().toString().padStart(2, '0');
                const endMins = previewEndDate.getMinutes().toString().padStart(2, '0');
                targetTimeDisplay.innerText = `${window.Locales.getTranslation('fasting.target')}: ${endHours}:${endMins}`;
            }
            if (progressPercentDisplay) progressPercentDisplay.innerText = "0%";
            if (ringProgress) {
                ringProgress.style.strokeDasharray = "848";
                ringProgress.style.strokeDashoffset = "848";
            }
            if (knobContainer) knobContainer.style.transform = `rotate(0deg)`;

            btnStart.classList.remove('hidden');
            activeControls.classList.add('hidden');
            return;
        }

        const now = new Date().getTime();
        const elapsed = now - fastingState.startTime;
        const totalDuration = fastingState.targetHours * 3600 * 1000;

        // Format Elapsed
        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');

        if (timerDigits) timerDigits.innerText = `${hours}:${minutes}:${seconds}`;

        // Circular Progress
        let pct = (elapsed / totalDuration) * 100;
        let drawPct = pct > 100 ? 100 : pct;
        if (drawPct < 0) drawPct = 0;

        const circleCircumference = 848;
        const dashOffset = circleCircumference - (circleCircumference * drawPct / 100);

        if (ringProgress) {
            ringProgress.style.strokeDasharray = "848";
            ringProgress.style.strokeDashoffset = dashOffset;
        }
        if (knobContainer) knobContainer.style.transform = `rotate(${360 * (drawPct / 100)}deg)`;
        if (progressPercentDisplay) progressPercentDisplay.innerText = `${Math.floor(pct)}%`;

        if (fastingState.endTime && targetTimeDisplay) {
            const endDate = new Date(fastingState.endTime);
            const endHours = endDate.getHours().toString().padStart(2, '0');
            const endMins = endDate.getMinutes().toString().padStart(2, '0');
            targetTimeDisplay.innerText = `${window.Locales.getTranslation('fasting.target')}: ${endHours}:${endMins}`;
        }

        // Phase Check
        const elapsedHours = totalSeconds / 3600;
        let phaseName = "FASTING";
        let phaseIcon = "fa-play";

        if (elapsedHours >= 24) { phaseName = "DEEP CLEAN"; phaseIcon = "fa-wand-magic-sparkles"; }
        else if (elapsedHours >= 16) { phaseName = "AUTOPHAGY"; phaseIcon = "fa-recycle"; }
        else if (elapsedHours >= 12) { phaseName = "KETOSIS"; phaseIcon = "fa-bolt"; }
        else if (elapsedHours >= 4) { phaseName = "SUGAR DROP"; phaseIcon = "fa-cube"; }

        if (badgeText) {
            let localizedPhaseName = window.Locales.getTranslation('fasting.status_fasting_active');
            if (elapsedHours >= 24) localizedPhaseName = window.Locales.getTranslation('fasting.phase_deep_clean');
            else if (elapsedHours >= 16) localizedPhaseName = window.Locales.getTranslation('fasting.phase_autophagy');
            else if (elapsedHours >= 12) localizedPhaseName = window.Locales.getTranslation('fasting.phase_ketosis');
            else if (elapsedHours >= 4) localizedPhaseName = window.Locales.getTranslation('fasting.phase_sugar_drop');

            const activeSuffix = window.Locales.getTranslation('fasting.active').toUpperCase();
            const upperPhase = localizedPhaseName.toUpperCase();

            if (upperPhase.includes(activeSuffix)) {
                badgeText.innerText = upperPhase;
            } else {
                badgeText.innerText = `${upperPhase} ${activeSuffix}`;
            }

            const icon = badgeText.parentElement.querySelector('i');
            if (icon) icon.className = `fa-solid ${phaseIcon}`;
        }

        // Note: dashboardPhaseBadge removed from HTML, so this check is safe but redundant
        if (dashboardPhaseBadge) {
            dashboardPhaseBadge.innerText = `${fastingState.targetHours}:8 IF`;
        }

        // Toggle Buttons
        btnStart.classList.add('hidden');
        activeControls.classList.remove('hidden');
    }

    function startFast() {
        console.log("Start Fasting Clicked");
        fastingState.isFasting = true;
        fastingState.startTime = new Date().getTime();
        fastingState.endTime = fastingState.startTime + (fastingState.targetHours * 3600 * 1000);
        saveState();
        updateTimer();
    }

    function endFast() {
        console.log("End Fast Clicked");
        fastingState.isFasting = false;
        fastingState.startTime = null;
        fastingState.endTime = null;
        saveState();
        updateTimer();
    }

    function adjustFast() {
        // Simple prompt for now
        const val = prompt("Enter new target hours (e.g., 16, 18, 20):", fastingState.targetHours);
        if (val) {
            const h = parseInt(val);
            if (!isNaN(h) && h > 0) {
                fastingState.targetHours = h;
                if (fastingState.isFasting) {
                    // Update End Time
                    fastingState.endTime = fastingState.startTime + (h * 3600 * 1000);
                }
                saveState();
                updateTimer();
                updateTabsUI();
            }
        }
    }

    // -- NEW: Tab Handling --
    function setupTabs() {
        const tabs = document.querySelectorAll('.timer-tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const text = e.target.innerText; // "16:8 TRF", etc.
                const hours = parseInt(text.split(':')[0]);

                if (hours) {
                    fastingState.targetHours = hours;
                    if (fastingState.isFasting) {
                        fastingState.endTime = fastingState.startTime + (hours * 3600 * 1000);
                    }
                    saveState();
                    updateTimer();
                    updateTabsUI();
                }
            });
        });
    }

    function updateTabsUI() {
        const tabs = document.querySelectorAll('.timer-tab-btn');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            const text = tab.innerText;
            const hours = parseInt(text.split(':')[0]);
            if (hours === fastingState.targetHours) {
                tab.classList.add('active');
            }
        });
    }

    // Init
    loadState();
    setupTabs();
    updateTabsUI();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    // listeners
    if (btnStart) btnStart.addEventListener('click', startFast);
    if (btnEnd) btnEnd.addEventListener('click', endFast);
    if (btnAdjust) btnAdjust.addEventListener('click', adjustFast); // Updated Listener

    // Sync from other page
    window.addEventListener('storage', (e) => {
        if (e.key === DashUtils.getUserKey('aureus_fasting_state')) {
            loadState();
            updateTimer();
        }
        if (e.key === DashUtils.getUserKey('aureus_user_settings') || (e.key && e.key.includes('_aureus_log_')) || e.key === 'aureus_targets_updated') {
            initMacroChart();
        }
    });


}

// Global function for editing GL Limit (called from HTML)
// Global function for editing GL Limit (called from HTML)
window.editGLLimit = function () {
    const glModal = document.getElementById('glModal');
    const glInput = document.getElementById('glInputVal');
    const closeBtn = document.getElementById('closeGlModalBtn');
    const cancelBtn = document.getElementById('cancelGlBtn');
    const saveBtn = document.getElementById('saveGlBtn');

    if (!glModal || !glInput) {
        console.error("GL Modal elements not found");
        return;
    }

    // Pre-fill current value
    const currentLimit = localStorage.getItem('aureus_gl_limit') || "100";
    glInput.value = currentLimit;

    // Show Modal
    glModal.classList.remove('hidden');

    function closeModal() {
        glModal.classList.add('hidden');
    }

    // Attach Listeners
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    saveBtn.onclick = () => {
        const val = parseInt(glInput.value);
        if (val && !isNaN(val) && val > 0) {
            localStorage.setItem('aureus_gl_limit', val);
            closeModal();
            location.reload(); // Refresh to update UI
        } else {
            alert("Please enter a valid number");
        }
    };

    // Close on outside click
    glModal.onclick = (e) => {
        if (e.target === glModal) closeModal();
    };
};

// ========================================
// WEEKLY MACRO TREND CHART (AREA CHART)
// ========================================
let weeklyMacroChartInstance = null;

// Global storage for chart targets (accessible by toggle functions)
let chartTargets = {
    cals: 2000,
    carbs: 45,
    prot: 95,
    fat: 150
};

// Active filter limit line value (set when filtering by a single macro)
let activeLimitLine = null;
let activeChartRange = 7; // Default range
let showWeeklyLimits = true; // Toggle for 'Derings' (limit lines)

async function initWeeklyMacroChart(rangeInDays = null) {
    if (rangeInDays) activeChartRange = rangeInDays;

    const chartEl = document.getElementById('weeklyMacroChart');
    if (!chartEl) return;

    // --- Pre-Fetch Cloud Data Bridge ---
    const today = new Date();
    const startD = new Date(today);
    startD.setDate(today.getDate() - (activeChartRange - 1));
    const startStr = startD.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    // Check if any day in this range is missing in localStorage
    let anyMissing = false;
    for (let i = 0; i < activeChartRange; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = DashUtils.getUserKey(`aureus_log_${y}-${m}-${day}`);
        if (!localStorage.getItem(key)) {
            anyMissing = true;
            break;
        }
    }

    if (anyMissing && window.loadHistoricalNutritionRangeFromSupabase) {
        console.log(`[Sync] Detected missing local data for range ${startStr} to ${endStr}. Fetching from cloud...`);
        const historicalData = await window.loadHistoricalNutritionRangeFromSupabase(startStr, endStr);
        if (historicalData) {
            Object.entries(historicalData).forEach(([date, data]) => {
                const key = DashUtils.getUserKey(`aureus_log_${date}`);
                // Only save if it has actual data
                const hasData = data.hydration || (data.meals && Object.keys(data.meals).length > 0);
                if (hasData) {
                    // Update if missing OR if it's today (today is always dynamic)
                    if (!localStorage.getItem(key) || date === endStr) {
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                }
            });
        }
    }
    // --- End Bridge ---

    const ctx = chartEl.getContext('2d');

    // Destroy previous chart if exists
    if (weeklyMacroChartInstance) {
        weeklyMacroChartInstance.destroy();
    }

    // Get CSS variables for colors
    const styles = getComputedStyle(document.documentElement);
    const colCal = styles.getPropertyValue('--macro-cal').trim() || '#00E676';
    const colCarb = styles.getPropertyValue('--macro-carb').trim() || '#FF4081';
    const colProt = styles.getPropertyValue('--macro-prot').trim() || '#448AFF';
    const colFat = styles.getPropertyValue('--macro-fat').trim() || '#FFD740';
    const colPurine = styles.getPropertyValue('--macro-purine').trim() || '#D4F458';

    // Load targets from settings
    let targetCals = 2000, targetCarb = 45, targetProt = 95, targetFat = 150, targetPurine = 400;
    const globalSettingsStored = localStorage.getItem(DashUtils.getUserKey('aureus_user_settings'));
    if (globalSettingsStored) {
        try {
            const settings = JSON.parse(globalSettingsStored);
            if (settings.targets) {
                targetCals = settings.targets.calories || targetCals;
                targetCarb = settings.targets.carb || targetCarb;
                targetProt = settings.targets.prot || targetProt;
                targetFat = settings.targets.fat || targetFat;
                targetPurine = settings.targets.purine || targetPurine;
            }
        } catch (e) { }
    }

    // Store targets globally for toggle functions
    chartTargets = {
        cals: targetCals / 20, // Scaled like in the chart
        carbs: targetCarb,
        prot: targetProt,
        fat: targetFat,
        purine: targetPurine
    };

    // Get Data based on activeChartRange
    const days = [];
    const labels = [];
    const calsData = [], carbData = [], protData = [], fatData = [], purineData = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = activeChartRange - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = DashUtils.getUserKey(`aureus_log_${y}-${m}-${day}`);

        // Day label - Simplify for longer ranges
        let label = '';
        if (activeChartRange > 14) {
            label = `${day}/${m}`; // MM/DD only for monthly view
        } else {
            const dow = daysOfWeek[d.getDay()];
            label = `${dow} ${day}/${m}`;
        }
        labels.push(label);

        let dayCals = 0, dayCarb = 0, dayProt = 0, dayFat = 0, dayPurine = 0;

        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.meals) {
                    Object.values(data.meals).forEach(meal => {
                        if (meal.items) {
                            meal.items.forEach(item => {
                                dayCals += (item.cals || item.cal || 0);
                                dayCarb += (item.carb || 0);
                                dayProt += (item.prot || 0);
                                dayFat += (item.fat || 0);
                                dayPurine += (item.purine || item.purines || 0);
                            });
                        }
                    });
                }
            } catch (e) { }
        }

        calsData.push(Math.round(dayCals));
        carbData.push(Math.round(dayCarb));
        protData.push(Math.round(dayProt));
        fatData.push(Math.round(dayFat));
        purineData.push(Math.round(dayPurine));
    }

    // Update header stats
    const weeklyCalsStat = document.getElementById('weeklyCalsStat');
    const weeklyCarbsStat = document.getElementById('weeklyCarbsStat');
    const weeklyProtStat = document.getElementById('weeklyProtStat');
    const weeklyFatStat = document.getElementById('weeklyFatStat');

    const todayCals = calsData[calsData.length - 1] || 0;
    const todayCarbs = carbData[carbData.length - 1] || 0;
    const todayProt = protData[protData.length - 1] || 0;
    const todayFat = fatData[fatData.length - 1] || 0;
    const todayPurine = purineData[purineData.length - 1] || 0;

    if (weeklyCalsStat) weeklyCalsStat.innerText = `${todayCals.toLocaleString('en-US')} / ${targetCals.toLocaleString('en-US')}`;
    if (weeklyCarbsStat) weeklyCarbsStat.innerText = `${todayCarbs} / ${targetCarb}g`;
    if (weeklyProtStat) weeklyProtStat.innerText = `${todayProt} / ${targetProt}g`;
    if (weeklyFatStat) weeklyFatStat.innerText = `${todayFat} / ${targetFat}g`;
    const weeklyPurineStat = document.getElementById('weeklyPurineStat');
    if (weeklyPurineStat) weeklyPurineStat.innerText = `${todayPurine} / ${targetPurine}mg`;

    // Update week range label
    const weekRangeLabel = document.getElementById('weekRangeLabel');
    if (weekRangeLabel) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (activeChartRange - 1));
        const startStr = `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        const endStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

        // Dynamic label based on range
        let prefix = "Week";
        if (activeChartRange === 14) prefix = "Last 2 Weeks";
        if (activeChartRange === 30) prefix = "Last Month";

        weekRangeLabel.innerText = `${prefix} ${startStr} - ${endStr}`;
    }

    // Update Button UI
    document.querySelectorAll('.chart-range-selector .range-btn').forEach(btn => {
        const btnRange = parseInt(btn.dataset.range);
        if (btnRange === activeChartRange) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // --- Create Gradients ---
    const createGradient = (ctx, color) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, hexToRGBA(color, 0.4)); // Start slightly opaque
        gradient.addColorStop(1, hexToRGBA(color, 0.05)); // Fade to almost clear
        return gradient;
    };

    const gradCal = createGradient(ctx, colCal);
    const gradCarb = createGradient(ctx, colCarb);
    const gradProt = createGradient(ctx, colProt);
    const gradFat = createGradient(ctx, colFat);
    const gradPurine = createGradient(ctx, colPurine);

    // Custom Plugin to draw Floating Labels (Pills)
    const floatingLabelsPlugin = {
        id: 'floatingLabels',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            const datasets = chart.data.datasets;
            const chartArea = chart.chartArea;

            ctx.save();
            ctx.font = '600 11px "Inter", sans-serif'; // Tweak font weight
            ctx.textBaseline = 'middle';

            // 1. Collect all potential labels
            let labelObjects = [];

            datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (meta.hidden) return;

                const points = meta.data;
                const lastPoint = points[points.length - 1];
                if (!lastPoint) return;

                // Grab just the label part we want? Or full string. 
                // Full string: "Cals 2,400 / 2,500"
                const fullLabel = dataset.label;
                const textMetric = ctx.measureText(fullLabel);
                const width = textMetric.width + 18; // slightly wider padding
                const height = 26; // slightly taller

                labelObjects.push({
                    y: lastPoint.y,
                    x: lastPoint.x,
                    width: width,
                    height: height,
                    text: fullLabel,
                    color: dataset.borderColor,
                    originalY: lastPoint.y
                });
            });

            // 2. Sort by Y position (top to bottom)
            labelObjects.sort((a, b) => a.y - b.y);

            // 3. Resolve Collisions (Iterative Relaxation)
            const minGap = 6;
            const iterations = 5;

            for (let iter = 0; iter < iterations; iter++) {
                // Forward pass (push down)
                for (let i = 1; i < labelObjects.length; i++) {
                    const prev = labelObjects[i - 1];
                    const curr = labelObjects[i];

                    const prevBottom = prev.y + (prev.height / 2);
                    const currTop = curr.y - (curr.height / 2);

                    if (currTop < prevBottom + minGap) {
                        const overlap = (prevBottom + minGap) - currTop;
                        curr.y += overlap;
                    }
                }

                // Boundary check (Top)
                labelObjects.forEach(obj => {
                    if (obj.y - (obj.height / 2) < chartArea.top) {
                        obj.y = chartArea.top + (obj.height / 2);
                    }
                });

                // Backward pass (push up)
                for (let i = labelObjects.length - 2; i >= 0; i--) {
                    const next = labelObjects[i + 1];
                    const curr = labelObjects[i];

                    const nextTop = next.y - (next.height / 2);
                    const currBottom = curr.y + (curr.height / 2);

                    if (currBottom > nextTop - minGap) {
                        const overlap = currBottom - (nextTop - minGap);
                        curr.y -= overlap;
                    }
                }
            }

            // 4. Draw Labels
            labelObjects.forEach(obj => {
                const pillX = obj.x - obj.width - 12;
                const pillY = obj.y - (obj.height / 2);

                // Draw connecting line 
                // Use a curve or straight line. Straight is cleaner.
                ctx.beginPath();
                ctx.strokeStyle = hexToRGBA(obj.color, 0.4);
                ctx.lineWidth = 1;
                ctx.moveTo(obj.x - 4, obj.originalY);
                // Draw to edge of pill
                ctx.lineTo(pillX + obj.width, obj.y);
                ctx.stroke();

                // Draw Pill Background (Solid Dark)
                // Using a color matching the card bg to hide lines behind it
                ctx.fillStyle = '#101014';
                ctx.beginPath();
                ctx.roundRect(pillX, pillY, obj.width, obj.height, 13); // pill shape
                ctx.fill();

                // Border
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = obj.color;
                ctx.stroke();

                // Draw Text
                ctx.fillStyle = '#fff';
                ctx.fillText(obj.text, pillX + 9, pillY + (obj.height / 2) + 1); // +1 visual adjust
            });

            ctx.restore();
        }
    };

    // Custom Plugin to draw Limit Line when filtering by a single macro
    const limitLinePlugin = {
        id: 'limitLine',
        afterDraw: (chart) => {
            // Only draw if we have an active limit line set AND 'Derings' is on
            if (activeLimitLine === null || !showWeeklyLimits) return;

            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;

            // Get the Y position for the limit value
            const yPos = yScale.getPixelForValue(activeLimitLine.value);

            // Don't draw if outside chart area
            if (yPos < chartArea.top || yPos > chartArea.bottom) return;

            ctx.save();

            // Draw dashed limit line
            ctx.beginPath();
            ctx.setLineDash([8, 4]);
            ctx.strokeStyle = '#EF4444'; // Red color for limit
            ctx.lineWidth = 2;
            ctx.moveTo(chartArea.left, yPos);
            ctx.lineTo(chartArea.right, yPos);
            ctx.stroke();

            // Draw limit label
            const labelText = `Limit: ${activeLimitLine.label}`;
            ctx.font = '600 11px "Inter", sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';

            // Background for label
            const textWidth = ctx.measureText(labelText).width;
            const labelX = chartArea.right - 10;
            const labelY = yPos - 6;

            ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
            ctx.beginPath();
            ctx.roundRect(labelX - textWidth - 12, labelY - 16, textWidth + 16, 20, 4);
            ctx.fill();

            // Label text
            ctx.fillStyle = '#fff';
            ctx.fillText(labelText, labelX - 4, labelY);

            ctx.restore();
        }
    };


    // Create chart with stacked area design and Gradients
    weeklyMacroChartInstance = null;
    LazyLoader.load('chartjs').then(() => {
        weeklyMacroChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Cals ${todayCals.toLocaleString('en-US')} / ${targetCals.toLocaleString('en-US')}`,
                        data: calsData.map(v => v / 20), // Scale down for visual balance
                        borderColor: colCal,
                        backgroundColor: gradCal,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        order: 4
                    },
                    {
                        label: `Carbs ${carbData[carbData.length - 1]} / ${targetCarb}g`,
                        data: carbData,
                        borderColor: colCarb,
                        backgroundColor: gradCarb,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        order: 3
                    },
                    {
                        label: `Prot ${protData[protData.length - 1]} / ${targetProt}g`,
                        data: protData,
                        borderColor: colProt,
                        backgroundColor: gradProt,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        order: 2
                    },
                    {
                        label: `Fat ${fatData[fatData.length - 1]} / ${targetFat}g`,
                        data: fatData,
                        borderColor: colFat,
                        backgroundColor: gradFat,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        order: 1
                    },
                    {
                        label: `Purine ${purineData[purineData.length - 1]} / ${targetPurine}mg`,
                        data: purineData,
                        borderColor: colPurine,
                        backgroundColor: gradPurine,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        order: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false // Start HIDDEN, we use floating labels
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#aaa',
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label.split(' ')[0];
                                let value = context.parsed.y;
                                // Unscale calories for tooltip
                                if (label === 'Cals') value = value * 20;
                                return `${label}: ${Math.round(value)}`;
                            }
                        }
                    },

                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255,255,255,0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255,255,255,0.5)',
                            font: { size: 10 },
                            maxRotation: 0,
                            padding: 10
                        }
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255,255,255,0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            display: true,
                            color: 'rgba(255,255,255,0.3)',
                            font: { size: 9 },
                            callback: function (val, index) {
                                // Show generic quantity steps with max 2 decimals
                                if (index % 2 !== 0) return '';
                                // Round to avoid floating point precision issues
                                const rounded = Math.round(val * 100) / 100;
                                return Number.isInteger(rounded) ? rounded : rounded.toFixed(0);
                            }
                        },
                        border: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Quantities (Cals / g)',
                            color: 'rgba(255,255,255,0.3)',
                            font: { size: 10 }
                        }
                    }
                }
            },
            plugins: [limitLinePlugin]
        });


        // --- Chart Layer Persistence ---
        if (activeChartFilter) {
            const macroToIndex = { 'cals': 0, 'carbs': 1, 'prot': 2, 'fat': 3, 'purine': 4 };
            showOnlyChartLayer(macroToIndex[activeChartFilter], activeChartFilter);
            const qsItems = document.querySelectorAll('.macro-quick-stats .qs-item');
            updateQsItemStyles(qsItems, activeChartFilter);
        }

        // Derings (Limits) Toggle
        const deringsBtn = document.getElementById('btnToggleDerings');
        if (deringsBtn) {
            // Class 'active' means show
            showWeeklyLimits = deringsBtn.classList.contains('active');

            deringsBtn.addEventListener('click', () => {
                showWeeklyLimits = !showWeeklyLimits;
                deringsBtn.classList.toggle('active', showWeeklyLimits);
                if (weeklyMacroChartInstance) {
                    weeklyMacroChartInstance.update('none');
                }
            });
        }
    });
}



// Helper: Convert Hex color to RGBA
function hexToRGBA(hex, alpha) {
    if (!hex) return `rgba(128,128,128,${alpha})`;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// Chart Layer Toggle State
let activeChartFilter = null; // null = show all, 'cals' | 'carbs' | 'prot' | 'fat' = show only that one

// Setup click handlers for quick stat items to filter chart layers
function setupChartLayerToggle() {
    const qsItems = document.querySelectorAll('.macro-quick-stats .qs-item');
    if (!qsItems.length) return;

    // Dataset mapping: index in chart.data.datasets corresponds to macro type
    // 0 = Cals, 1 = Carbs, 2 = Prot, 3 = Fat
    const macroToIndex = {
        'cals': 0,
        'carbs': 1,
        'prot': 2,
        'fat': 3,
        'purine': 4
    };

    qsItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const clickedMacro = getMacroTypeFromItem(item);
            if (!clickedMacro) return;

            // Toggle logic: if clicking the active filter, deactivate (show all)
            // Otherwise, activate the clicked filter (show only that one)
            if (activeChartFilter === clickedMacro) {
                // Deactivate - show all layers
                activeChartFilter = null;
                showAllChartLayers();
                updateQsItemStyles(qsItems, null);
            } else {
                // Activate - show only clicked layer
                activeChartFilter = clickedMacro;
                showOnlyChartLayer(macroToIndex[clickedMacro], clickedMacro);
                updateQsItemStyles(qsItems, clickedMacro);
            }
        });
    });

    // Handle 'Derings' (Limit Lines) Toggle button
    const btnToggleDerings = document.getElementById('btnToggleDerings');
    if (btnToggleDerings) {
        btnToggleDerings.addEventListener('click', () => {
            showWeeklyLimits = !showWeeklyLimits;

            // UI state
            if (showWeeklyLimits) {
                btnToggleDerings.classList.add('active');
            } else {
                btnToggleDerings.classList.remove('active');
            }

            // Redraw chart to show/hide the limit line via plugin
            if (weeklyMacroChartInstance) {
                weeklyMacroChartInstance.update();
            }
        });
    }
}

// Get macro type from qs-item classes
function getMacroTypeFromItem(item) {
    if (item.classList.contains('cals')) return 'cals';
    if (item.classList.contains('carbs')) return 'carbs';
    if (item.classList.contains('prot')) return 'prot';
    if (item.classList.contains('fat')) return 'fat';
    if (item.classList.contains('purine')) return 'purine';
    return null;
}

// Show all chart layers
function showAllChartLayers() {
    if (!weeklyMacroChartInstance) return;

    // Clear the limit line when showing all layers
    activeLimitLine = null;

    // Reset Y-axis max to auto-calculate
    weeklyMacroChartInstance.options.scales.y.max = undefined;

    weeklyMacroChartInstance.data.datasets.forEach((dataset, index) => {
        weeklyMacroChartInstance.setDatasetVisibility(index, true);
    });
    weeklyMacroChartInstance.update('none'); // 'none' for instant update without animation
}

// Show only a specific chart layer
function showOnlyChartLayer(activeIndex, macroType) {
    if (!weeklyMacroChartInstance) return;

    // Set the limit line for the active macro
    const targetLabels = {
        'cals': `${Math.round(chartTargets.cals * 20).toLocaleString('en-US')} kcal`,
        'carbs': `${chartTargets.carbs}g`,
        'prot': `${chartTargets.prot}g`,
        'fat': `${chartTargets.fat}g`,
        'purine': `${chartTargets.purine}mg`
    };

    activeLimitLine = {
        value: chartTargets[macroType],
        label: targetLabels[macroType]
    };

    // Find the max data value for the active dataset
    const activeDataset = weeklyMacroChartInstance.data.datasets[activeIndex];
    const maxDataValue = Math.max(...activeDataset.data);
    const limitValue = chartTargets[macroType];

    // Set Y-axis max to include both the data and the limit line with 15% padding
    const yMax = Math.max(maxDataValue, limitValue) * 1.15;
    weeklyMacroChartInstance.options.scales.y.max = yMax;

    weeklyMacroChartInstance.data.datasets.forEach((dataset, index) => {
        const macroToIndex = { 'cals': 0, 'carbs': 1, 'prot': 2, 'fat': 3, 'purine': 4 };
        weeklyMacroChartInstance.setDatasetVisibility(index, index === activeIndex);
    });
    weeklyMacroChartInstance.update('none');
}

// Update qs-item visual styles based on active filter
function updateQsItemStyles(qsItems, activeMacro) {
    qsItems.forEach(item => {
        const itemMacro = getMacroTypeFromItem(item);
        item.classList.remove('active', 'dimmed');

        if (activeMacro === null) {
            // No filter active - remove all states
            // Items return to normal
        } else if (itemMacro === activeMacro) {
            // This is the active item
            item.classList.add('active');
        } else {
            // This is a non-active item
            item.classList.add('dimmed');
        }
    });
}

// Setup Chart Range Listeners
function setupChartRangeListeners() {
    const btns = document.querySelectorAll('.chart-range-selector .range-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const range = parseInt(btn.dataset.range);
            if (!isNaN(range)) {
                initWeeklyMacroChart(range);
            }
        });
    });
}

// Initialize Weekly Chart on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        if (typeof initWeeklyMacroChart === 'function') {
            try {
                initWeeklyMacroChart();
                setupChartRangeListeners();
                setupChartLayerToggle(); // Initialize listeners only ONCE
            } catch (e) { console.error("Weekly Macro Chart Error:", e); }
        }
    }, 500); // Delay to ensure main chart is loaded first
});
