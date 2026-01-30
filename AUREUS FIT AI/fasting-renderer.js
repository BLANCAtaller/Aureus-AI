document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    let fastingState = {
        isFasting: false,
        startTime: null,
        targetHours: 16,
        endTime: null,
        weeklyGoal: 112 // Default to 16h * 7 days
    };

    // --- Hydration Management (Synced with Daily Log) ---
    const STORAGE_KEY_PREFIX = 'aureus_log_';

    function getTodayKey() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const base = `aureus_log_${y}-${m}-${d}`;
        return (typeof getUserKey === 'function') ? getUserKey(base) : `Guest_${base}`;
    }

    function getDailyLog() {
        try {
            const stored = localStorage.getItem(getTodayKey());
            return stored ? JSON.parse(stored) : null;
        } catch (e) { return null; }
    }

    function saveDailyLog(data) {
        localStorage.setItem(getTodayKey(), JSON.stringify(data));
        // Dispatch event for other listeners
        window.dispatchEvent(new CustomEvent('aureus-hydration-changed'));
    }

    // Hydration State
    let hydrationState = { current: 0, goal: 2500 };

    function initHydration() {
        const log = getDailyLog();
        if (log && log.hydration) {
            hydrationState = log.hydration;
        } else {
            const globalSettingsStored = localStorage.getItem(getUserKey('aureus_user_settings'));
            if (globalSettingsStored) {
                try {
                    const settings = JSON.parse(globalSettingsStored);
                    if (settings.hydrationGoal) hydrationState.goal = settings.hydrationGoal;
                } catch (e) { }
            }
        }
        updateHydrationUI();
        updateModalUI();
        setupHydrationListeners();
    }

    function syncHydration(amount) {
        let log = getDailyLog();
        if (!log) {
            log = {
                date: new Date().toLocaleDateString(),
                meals: { breakfast: { items: [] }, lunch: { items: [] }, dinner: { items: [] }, snacks: { items: [] } },
                hydration: { current: 0, goal: 2500 }
            };
        }

        if (!log.hydration) log.hydration = { current: 0, goal: 2500 };

        log.hydration.current += amount;
        if (log.hydration.current < 0) log.hydration.current = 0;

        hydrationState = log.hydration;
        saveDailyLog(log);
        updateHydrationUI();
        updateModalUI();
    }

    function setHydrationGoal(newGoal) {
        let log = getDailyLog();
        if (!log) {
            log = {
                date: new Date().toLocaleDateString(),
                meals: { breakfast: { items: [] }, lunch: { items: [] }, dinner: { items: [] }, snacks: { items: [] } },
                hydration: { current: 0, goal: newGoal }
            };
        } else {
            if (!log.hydration) log.hydration = { current: 0, goal: newGoal };
            log.hydration.goal = newGoal;
        }

        hydrationState = log.hydration;
        saveDailyLog(log);
        updateHydrationUI();
        updateModalUI();

        // Also save to global settings
        try {
            const globalSettingsStored = localStorage.getItem(getUserKey('aureus_user_settings'));
            let settings = globalSettingsStored ? JSON.parse(globalSettingsStored) : {};
            settings.hydrationGoal = newGoal;
            localStorage.setItem(getUserKey('aureus_user_settings'), JSON.stringify(settings));
        } catch (e) { }
    }

    function updateHydrationUI() {
        // Fasting Timer Card
        const valDisplay = document.getElementById('fastingWaterValDisplay');
        const fill = document.getElementById('fastingWaterFill');
        const label = document.getElementById('fastingWaterLabel');

        if (valDisplay) valDisplay.innerHTML = `${hydrationState.current} <small>ml</small>`;

        if (fill) {
            const pct = Math.min((hydrationState.current / hydrationState.goal) * 100, 100);
            fill.style.height = `${pct}%`;
        }
        if (label) {
            const pct = Math.round((hydrationState.current / hydrationState.goal) * 100);
            label.innerText = `${pct}% Goal`;
        }
    }

    function updateModalUI() {
        const modalVal = document.getElementById('hydroModalValue');
        const modalGoal = document.getElementById('hydroModalGoal');

        if (modalVal) modalVal.innerText = hydrationState.current.toLocaleString('en-US');
        if (modalGoal) modalGoal.innerText = hydrationState.goal.toLocaleString('en-US');
    }

    function setupHydrationListeners() {
        const hydroModal = document.getElementById('hydrationModal');
        const card = document.getElementById('fastingHydrationCard');
        const closeBtn = document.getElementById('closeHydroModal');

        if (card) {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                if (hydroModal) hydroModal.classList.remove('hidden');
                updateModalUI();
            });
        }

        if (closeBtn && hydroModal) {
            closeBtn.addEventListener('click', () => {
                hydroModal.classList.add('hidden');
            });
        }
        if (hydroModal) {
            hydroModal.addEventListener('click', (e) => {
                if (e.target === hydroModal) {
                    hydroModal.classList.add('hidden');
                }
            });
        }

        const btnAddCustom = document.getElementById('btnAddCustomWater');
        if (btnAddCustom) {
            btnAddCustom.addEventListener('click', () => {
                const input = document.getElementById('customWaterInput');
                if (input && input.value) {
                    syncHydration(parseInt(input.value));
                    input.value = '';
                }
            });
        }

        const btnSetGoal = document.getElementById('btnSetGoal');
        if (btnSetGoal) {
            btnSetGoal.addEventListener('click', () => {
                const input = document.getElementById('customGoalInput');
                if (input && input.value) {
                    setHydrationGoal(parseInt(input.value));
                }
            });
        }

        const btnReset = document.getElementById('btnResetWater');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                // Use translation if possible, else default
                const msg = (window.Locales && window.Locales.getTranslation('food_log.reset_confirm')) || "Reset today's water log?";
                if (confirm(msg)) {
                    syncHydration(-hydrationState.current);
                }
            });
        }
    }

    // Expose Global Manager
    window.GlobalHydration = {
        state: { get total() { return hydrationState.current; }, get goal() { return hydrationState.goal; } },
        addWater: (amount) => syncHydration(amount),
        setGoal: (goal) => setHydrationGoal(goal),
        init: () => initHydration()
    };

    // Init Logic
    // We delay init slightly to ensure DOM is ready if script runs early, 
    // although this script is defer/at end of body usually.
    initHydration();

    // History Editing State
    let currentSummaryDate = null;
    let currentSummaryEntry = null;
    let isEditingHistory = false;

    // --- Elements ---
    // --- Elements ---
    const timerDigits = document.getElementById('timerDigits');
    const badgeText = document.getElementById('badgeText'); // Replaces timerStatusText
    const btnStartFast = document.getElementById('btnStartFast'); // Main Action Button

    // Circular Timer Elements
    const ringProgress = document.getElementById('ringProgress');
    const knobContainer = document.getElementById('knobContainer');
    const progressPercentDisplay = document.getElementById('progressPercentDisplay');
    const targetTimeDisplay = document.getElementById('targetTimeDisplay');

    const tabs = document.querySelectorAll('.timer-tab-btn');

    // Header Status (Optional if present)
    const statusPillText = document.getElementById('headerStatusText');
    const headerGoalText = document.getElementById('headerGoalText');

    // Hydration
    const waterFill = document.querySelector('.water-rect-fill');
    const waterLabel = document.querySelector('.water-rect-text');
    const waterValDisplay = document.querySelector('.header-right-val');

    // Metabolic Timeline Elements
    const timelineFill = document.querySelector('.timeline-progress-bar'); // Updated class
    const phasePoints = document.querySelectorAll('.timeline-point'); // Updated class

    // Timer Edit Modal Selectors
    const btnAdjust = document.getElementById('btnAdjust');
    const timerEditModal = document.getElementById('timerEditModal');
    const closeTimerEditModal = document.getElementById('closeTimerEditModal');
    const editStartTimeInput = document.getElementById('editStartTimeInput');
    const editEndTimeInput = document.getElementById('editEndTimeInput');
    const editEndTimeGroup = document.getElementById('editEndTimeGroup');
    const editGoalInput = document.getElementById('editGoalInput');
    const btnSaveTimerEdit = document.getElementById('btnSaveTimerEdit');

    const btnEditHistory = document.getElementById('btnEditHistory');
    const btnDeleteHistory = document.getElementById('btnDeleteHistory');

    // --- Phase Descriptions ---
    // --- Phase Descriptions (Rich Content) ---
    const phaseData = {
        'Start': {
            nameKey: 'fasting.phase_start',
            time: '0h - 4h',
            icon: 'fa-play',
            markerClass: 'phase-start',
            descKey: 'fasting.phases.start.desc',
            benefitsKey: 'fasting.phases.start.benefits',
            tipKey: 'fasting.phases.start.tip'
        },
        'Sugar Drop': {
            nameKey: 'fasting.phase_sugar_drop',
            time: '4h - 12h',
            icon: 'fa-cube',
            markerClass: 'phase-sugar',
            descKey: 'fasting.phases.sugar_drop.desc',
            benefitsKey: 'fasting.phases.sugar_drop.benefits',
            tipKey: 'fasting.phases.sugar_drop.tip'
        },
        'Ketosis': {
            nameKey: 'fasting.phase_ketosis',
            time: '12h - 16h',
            icon: 'fa-bolt',
            markerClass: 'phase-ketosis',
            descKey: 'fasting.phases.ketosis.desc',
            benefitsKey: 'fasting.phases.ketosis.benefits',
            tipKey: 'fasting.phases.ketosis.tip'
        },
        'Autophagy': {
            nameKey: 'fasting.phase_autophagy',
            time: '16h - 24h',
            icon: 'fa-recycle',
            markerClass: 'phase-autophagy',
            descKey: 'fasting.phases.autophagy.desc',
            benefitsKey: 'fasting.phases.autophagy.benefits',
            tipKey: 'fasting.phases.autophagy.tip'
        },
        'Deep Clean': {
            nameKey: 'fasting.phase_deep_clean',
            time: '24h+',
            icon: 'fa-wand-magic-sparkles',
            markerClass: 'phase-deep',
            descKey: 'fasting.phases.deep_clean.desc',
            benefitsKey: 'fasting.phases.deep_clean.benefits',
            tipKey: 'fasting.phases.deep_clean.tip'
        }
    };

    // --- Metabolic Phase Tooltip Logic ---
    let activeTooltip = null;

    const createTooltip = () => {
        // Remove existing if any (cleanup)
        const existing = document.querySelector('.phase-tooltip');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.className = 'phase-tooltip'; // Use the premium class
        document.body.appendChild(el);
        return el;
    };

    const tooltip = createTooltip();

    const phaseKeys = ['Start', 'Sugar Drop', 'Ketosis', 'Autophagy', 'Deep Clean'];

    phasePoints.forEach((point, index) => {
        point.addEventListener('mouseenter', (e) => {
            // Use index to identify phase instead of dependent DOM text
            const phaseKey = phaseKeys[index];
            const data = phaseData[phaseKey];

            if (data) {
                // Resolve translations
                const tName = window.Locales.getTranslation(data.nameKey);
                const tDesc = window.Locales.getTranslation(data.descKey);
                const tTip = window.Locales.getTranslation(data.tipKey);
                const benefits = window.Locales.getTranslation(data.benefitsKey) || [];
                const benefitsHtml = benefits.map(b => `<li>${b}</li>`).join('');

                const keyBenefitsLabel = window.Locales.getTranslation('fasting.key_benefits') || "Key Benefits";
                const proTipLabel = window.Locales.getTranslation('fasting.pro_tip') || "Pro Tip";

                tooltip.innerHTML = `
                    <div class="tooltip-close-btn"><i class="fa-solid fa-xmark"></i></div>
                    
                    <div class="tooltip-header">
                        <div class="tooltip-icon ${data.markerClass}">
                            <i class="fa-solid ${data.icon}"></i>
                        </div>
                        <div class="tooltip-title-group">
                            <h3>${tName}</h3>
                            <div class="tooltip-time-range">${data.time}</div>
                        </div>
                    </div>

                    <div class="tooltip-description">
                        ${tDesc}
                    </div>

                    <div class="tooltip-benefits">
                        <h4>${keyBenefitsLabel}</h4>
                        <ul>
                            ${benefitsHtml}
                        </ul>
                    </div>

                    <div class="tooltip-tip">
                        <i class="fa-solid fa-lightbulb tooltip-tip-icon"></i>
                        <span class="tooltip-tip-text"><strong>${proTipLabel}:</strong> ${tTip}</span>
                    </div>
                `;

                // Add visible class FIRST to measure height accurately
                tooltip.classList.add('visible');

                // Basic positioning logic
                const rect = point.getBoundingClientRect();
                const tooltipHeight = tooltip.offsetHeight || 300;
                const tooltipWidth = tooltip.offsetWidth || 320;

                // Center horizontally
                let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

                // Position above, flip if too close to top
                let top = rect.top - tooltipHeight - 20;
                if (top < 20) {
                    top = rect.bottom + 20; // Flip to below
                }

                // Boundary checks
                if (left < 20) left = 20;
                if (left + tooltipWidth > window.innerWidth - 20) left = window.innerWidth - tooltipWidth - 20;

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;

                // Close button listener
                const closeBtn = tooltip.querySelector('.tooltip-close-btn');
                if (closeBtn) {
                    closeBtn.onclick = (e) => {
                        e.stopPropagation();
                        tooltip.classList.remove('visible');
                    };
                }
            }
        });

        point.addEventListener('mouseleave', (e) => {
            // Optional: Delay hide to allow moving mouse into tooltip if interactive
            setTimeout(() => {
                if (!tooltip.matches(':hover')) {
                    tooltip.classList.remove('visible');
                }
            }, 100);
        });
    });

    // Add listener to tooltip itself to stay open on hover
    tooltip.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });

    if (btnStartFast) {
        btnStartFast.addEventListener('click', () => {
            if (fastingState.isFasting) {
                endFast();
            } else {
                openPlanModal();
            }
        });
    }

    // --- Fasting Plan Modal Logic ---
    const planModal = document.getElementById('fastingPlanModal');
    const closePlanModalBtn = document.getElementById('closePlanModal');

    window.openPlanModal = () => {
        if (planModal) planModal.classList.remove('hidden');
    };

    if (closePlanModalBtn) {
        closePlanModalBtn.addEventListener('click', () => {
            if (planModal) planModal.classList.add('hidden');
        });
    }

    // Global function for onclick in the HTML
    window.selectPlan = (hours) => {
        // Set goal
        fastingState.targetHours = hours;

        // Update headers to reflect choice immediately (optional)
        const headerGoal = document.getElementById('headerGoalText');
        if (headerGoal) headerGoal.innerText = `Goal: ${hours}h TRF`;
        if (headerGoalText) headerGoalText.textContent = `Goal: ${hours}h Fast`; // consistency with var name

        // Start the fast
        startFast();

        // Close modal
        if (planModal) planModal.classList.add('hidden');
    };

    // Make addWater global for direct calls (if we add buttons back, currently removed in simplified UI but good to keep logic)
    // Make addWater global for direct calls
    window.addWater = (amount) => {
        if (window.GlobalHydration) {
            window.GlobalHydration.addWater(amount);
        }
    };

    // Listen for global changes
    window.addEventListener('aureus-hydration-changed', () => {
        updateHydrationUI();
        if (typeof updateModalUI === 'function') updateModalUI();
    });


    // --- Core Logic ---

    function startFast() {
        fastingState.isFasting = true;
        fastingState.startTime = new Date().getTime();
        // Calculate End Time
        fastingState.endTime = fastingState.startTime + (fastingState.targetHours * 60 * 60 * 1000);

        saveState();
        updateUIActiveState(true);
        tick();
    }

    function endFast() {
        if (fastingState.startTime) {
            const now = new Date().getTime();
            const duration = now - fastingState.startTime;
            // Only save if duration is meaningful (e.g. > 1 min? For testing maybe any)
            if (duration > 60 * 1000) {
                saveFastToHistory(duration);
            }
        }

        fastingState.isFasting = false;
        fastingState.startTime = null;
        fastingState.endTime = null;
        saveState();
        resetUI();
    }

    function updateUIActiveState(isActive) {
        if (isActive) {
            btnStartFast.innerHTML = window.Locales.getTranslation('fasting.end_fast');
            btnStartFast.classList.remove('btn-pill-white');
            btnStartFast.classList.add('btn-pill-dark'); // Darken it to indicate 'Stop' or secondary action
            // Or keep it white but change text. Let's invert it for 'Stop'
            btnStartFast.style.backgroundColor = '#ff4444';
            btnStartFast.style.color = '#fff';

            if (statusPillText) statusPillText.innerText = window.Locales.getTranslation('fasting.status_fasting_active');
            if (statusPillText) statusPillText.style.color = 'var(--primary-lime)'; // Lime
        } else {
            btnStartFast.innerHTML = window.Locales.getTranslation('fasting.start_fast');
            btnStartFast.classList.add('btn-pill-white');
            btnStartFast.classList.remove('btn-pill-dark');
            btnStartFast.style.backgroundColor = '';
            btnStartFast.style.color = '';

            if (statusPillText) statusPillText.innerText = window.Locales.getTranslation('fasting.status_not_fasting');
            if (statusPillText) statusPillText.style.color = '#fff';

            if (badgeText) badgeText.innerText = window.Locales.getTranslation('fasting.ready');
        }

        if (isActive && badgeText) {
            badgeText.innerText = window.Locales.getTranslation('fasting.active'); // Or dynamic based on phase
        }
    }

    function tick() {
        if (!fastingState.isFasting) return;

        const now = new Date().getTime();
        const elapsed = now - fastingState.startTime;
        const totalDuration = fastingState.targetHours * 60 * 60 * 1000;

        let progress = (elapsed / totalDuration) * 100;

        // Visuals
        updateTimerDisplay(elapsed, totalDuration);
        // Visuals
        updateTimerDisplay(elapsed, totalDuration);
        updateTimeline(elapsed / (1000 * 60 * 60)); // Hours elapsed
    }

    function updateTimerDisplay(elapsedMs, totalMs) {
        if (!fastingState.isFasting && !fastingState.startTime) {
            // Ready State
            if (timerDigits) timerDigits.innerText = `${fastingState.targetHours}:00:00`;
            if (badgeText) badgeText.innerText = window.Locales.getTranslation('fasting.ready');

            // Show preview target if not fasting
            if (targetTimeDisplay) {
                const previewEndDate = new Date();
                previewEndDate.setTime(previewEndDate.getTime() + (fastingState.targetHours * 3600 * 1000));
                const endHours = previewEndDate.getHours().toString().padStart(2, '0');
                const endMins = previewEndDate.getMinutes().toString().padStart(2, '0');
                targetTimeDisplay.innerText = `${window.Locales.getTranslation('fasting.target')}: ${endHours}:${endMins}`;
            }

            if (progressPercentDisplay) progressPercentDisplay.innerText = "0%";

            // Reset Ring
            if (ringProgress) {
                ringProgress.style.strokeDashoffset = 848; // Empty
            }
            if (knobContainer) {
                knobContainer.style.transform = `rotate(0deg)`;
            }
            return;
        }

        // Format Elapsed Time HH:MM:SS
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');

        if (timerDigits) timerDigits.innerText = `${hours}:${minutes}:${seconds}`;

        // Update Circular Progress
        let pct = (elapsedMs / totalMs) * 100;
        let drawPct = pct > 100 ? 100 : pct;
        if (drawPct < 0) drawPct = 0;

        const circleCircumference = 848; // 2 * pi * 135
        const dashOffset = circleCircumference - (circleCircumference * drawPct / 100);

        if (ringProgress) {
            ringProgress.style.strokeDashoffset = dashOffset;
        }

        if (knobContainer) {
            knobContainer.style.transform = `rotate(${360 * (drawPct / 100)}deg)`;
        }

        if (progressPercentDisplay) {
            progressPercentDisplay.innerText = `${Math.floor(pct)}%`;
        }

        // Target Time Display
        if (fastingState.endTime && targetTimeDisplay) {
            const endDate = new Date(fastingState.endTime);
            const endHours = endDate.getHours().toString().padStart(2, '0');
            const endMins = endDate.getMinutes().toString().padStart(2, '0');
            targetTimeDisplay.innerText = `${window.Locales.getTranslation('fasting.target')}: ${endHours}:${endMins}`;
        }

        // Determine Phase & Update Badge
        const elapsedHours = totalSeconds / 3600;
        let phaseKey = "fasting_active"; // Default fallback key if no phase matches? Or generic
        let phaseName = window.Locales.getTranslation('fasting.status_fasting_active');
        let phaseIcon = "fa-play";

        if (elapsedHours >= 24) {
            phaseKey = 'deep_clean';
            phaseIcon = "fa-wand-magic-sparkles";
        } else if (elapsedHours >= 16) {
            phaseKey = 'autophagy';
            phaseIcon = "fa-recycle";
        } else if (elapsedHours >= 12) {
            phaseKey = 'ketosis';
            phaseIcon = "fa-bolt";
        } else if (elapsedHours >= 4) {
            phaseKey = 'sugar_drop';
            phaseIcon = "fa-cube";
        }

        if (phaseKey !== "fasting_active") {
            phaseName = window.Locales.getTranslation(`fasting.phase_${phaseKey}`).toUpperCase();
        } else {
            phaseName = window.Locales.getTranslation('fasting.status_fasting_active').toUpperCase();
        }

        // However, the original code had "KETOSIS ACTIVE" etc.
        // It seems it wants PHASE + " ACTIVE".
        // Let's assume we want "KETOSIS ACTIVE" for ketosis.
        // I have keys for phases: phase_ketosis="Ketosis"
        // I have key for active: active="ACTIVE"

        let displayPhaseName = phaseName;
        // If it was one of the phases, likely we want just the name capitalized.

        if (badgeText) {
            const activeSuffix = window.Locales.getTranslation('fasting.active').toUpperCase();
            if (displayPhaseName.includes(activeSuffix)) {
                badgeText.innerText = displayPhaseName;
            } else {
                badgeText.innerText = `${displayPhaseName} ${activeSuffix}`;
            }
            // Update icon
            const badgeIcon = badgeText.parentElement.querySelector('i');
            if (badgeIcon) {
                badgeIcon.className = `fa-solid ${phaseIcon}`;
            }
        }
    }

    function resetUI() {
        updateUIActiveState(false);
        updateTimerDisplay(0, 100); // Drives reset via updateTimerDisplay
        updateTimeline(0);
        updateHydrationUI();
    }

    function updateTimeline(elapsedHours) {
        // Logic: 0-4h, 4-12h, 12-16h...
        // Map 24h to 100% width
        let widthPct = (elapsedHours / 24) * 100;
        if (widthPct > 100) widthPct = 100;

        if (timelineFill) {
            // Use requestAnimationFrame or a small timeout to ensure transition triggers
            requestAnimationFrame(() => {
                timelineFill.style.width = `${widthPct}%`;
            });
        }

        // Update Points
        const milestones = [
            { hour: 0, el: phasePoints[0], name: 'Start' },
            { hour: 4, el: phasePoints[1], name: 'Sugar Drop' },
            { hour: 12, el: phasePoints[2], name: 'Ketosis' },
            { hour: 16, el: phasePoints[3], name: 'Autophagy' },
            { hour: 24, el: phasePoints[4], name: 'Deep Clean' }
        ];

        let currentPhaseIndex = -1;

        milestones.forEach((m, idx) => {
            // Logic: if elapsed >= m.hour, it is "active" (passed)
            if (elapsedHours >= m.hour) {
                m.el.classList.add('active'); // CSS checks .timeline-point.active
                currentPhaseIndex = idx;
            } else {
                m.el.classList.remove('active');
            }
            m.el.classList.remove('current'); // Clean current

            // Clean inline label color from previous ticks
            const label = m.el.querySelector('.timeline-label');
            if (label) label.style.color = '';
        });

        if (currentPhaseIndex >= 0) {
            const activeM = milestones[currentPhaseIndex];
            activeM.el.classList.add('current');

            // Header Badge Update (New Selector)
            const currentPhaseBadge = document.getElementById('currentPhaseBadge');
            // activeM.name corresponds to the key in phaseData, e.g. 'Start'
            if (currentPhaseBadge && phaseData[activeM.name]) {
                currentPhaseBadge.innerText = window.Locales.getTranslation(phaseData[activeM.name].nameKey);
            }

            // Fallback for old selector if mixed
            const oldBadge = document.querySelector('.metabolic-card .status-pill-track span');
            if (oldBadge && phaseData[activeM.name]) {
                oldBadge.innerText = window.Locales.getTranslation(phaseData[activeM.name].nameKey);
            }

            // Note: We rely on CSS .timeline-point.current .p-lbl for color now.
        } else {
            // Reset if no phase (e.g. 0h but start is 0, so usually always start)
            const currentPhaseBadge = document.getElementById('currentPhaseBadge');
            if (currentPhaseBadge) currentPhaseBadge.innerText = window.Locales.getTranslation('fasting.status_not_fasting'); // Or 'Not Started' -> I don't have a not_started key aside from not_fasting? Actually "Not Started" vs "Not Fasting". 
            // I'll use "Not Fasting" for consistency or add a key. "Not Fasting" is fine.
        }
    }

    function updateHydrationUI() {
        if (!window.GlobalHydration) return;
        const state = window.GlobalHydration.state; // This likely doesn't exist either if I didn't verify GlobalHydration structure

        // Let's verify what window.GlobalHydration actually exposes.
        // In Step 540, I defined it as:
        // window.GlobalHydration = {
        //    addWater: (amount) => syncHydration(amount),
        //    setGoal: (goal) => setHydrationGoal(goal),
        //    init: () => initHydration()
        // };
        // It does NOT expose 'state'.

        // I need to use the internal hydrationState variable which is available in this scope.

        const valDisplay = document.getElementById('fastingWaterValDisplay');
        const fill = document.getElementById('fastingWaterFill');
        const label = document.getElementById('fastingWaterLabel');

        if (valDisplay) valDisplay.innerHTML = `${hydrationState.current.toLocaleString('en-US')} <small style="font-size:14px; font-weight:400; color:#888;">ml</small>`;

        const pct = Math.min((hydrationState.current / hydrationState.goal) * 100, 100);
        if (fill) fill.style.height = `${pct}%`;
        if (label) label.innerText = `${Math.round(pct)}% ${window.Locales.getTranslation('fasting.hydration.hydration_goal') || 'Goal'}`;
    }

    // --- Persistence ---
    function saveState() {
        localStorage.setItem(getUserKey('aureus_fasting_state'), JSON.stringify(fastingState));
    }

    function loadState() {
        const savedFasting = JSON.parse(localStorage.getItem(getUserKey('aureus_fasting_state')));
        if (savedFasting) fastingState = savedFasting;
    }

    // --- Hydration Modal Logic ---
    const hydrationCard = document.querySelector('.card-premium-dark'); // The hydration card
    const hydroModal = document.getElementById('hydrationModal');
    const closeHydroModalBtn = document.getElementById('closeHydroModal');
    const hydroModalValue = document.getElementById('hydroModalValue');
    const hydroModalGoal = document.getElementById('hydroModalGoal');

    // Inputs
    const customWaterInput = document.getElementById('customWaterInput');
    const btnAddCustomWater = document.getElementById('btnAddCustomWater');
    const customGoalInput = document.getElementById('customGoalInput');
    const btnSetGoal = document.getElementById('btnSetGoal');
    const btnResetWater = document.getElementById('btnResetWater');

    // --- Timer Edit Modal Logic ---
    if (btnAdjust) {
        btnAdjust.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent modal bubble if nested
            isEditingHistory = false;
            openTimerEditModal();
        });
    }

    if (closeTimerEditModal) {
        closeTimerEditModal.addEventListener('click', () => {
            timerEditModal.classList.add('hidden');
        });
    }

    if (btnSaveTimerEdit) {
        btnSaveTimerEdit.addEventListener('click', () => {
            saveTimerEdit();
            timerEditModal.classList.add('hidden');
        });
    }

    // Quick Shift logic for buttons in Edit Modal
    window.shiftStartTime = (hours) => {
        if (!editStartTimeInput) return;

        let currentDateVal = new Date();
        if (editStartTimeInput.value) {
            currentDateVal = new Date(editStartTimeInput.value);
        }

        // Add hours
        currentDateVal.setTime(currentDateVal.getTime() + (hours * 3600 * 1000));

        // Update input
        // Adjust for timezone to keep local string correct
        const isoLocal = new Date(currentDateVal.getTime() - (currentDateVal.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        editStartTimeInput.value = isoLocal;
    };

    function openTimerEditModal() {
        if (!timerEditModal) return;

        if (isEditingHistory && currentSummaryEntry) {
            if (editEndTimeGroup) editEndTimeGroup.style.display = 'block';

            // Populate with history data
            if (editStartTimeInput) {
                const start = new Date(currentSummaryEntry.startTime);
                const offset = start.getTimezoneOffset() * 60000;
                const localISOTime = new Date(start.getTime() - offset).toISOString().slice(0, 16);
                editStartTimeInput.value = localISOTime;
            }
            if (editEndTimeInput) {
                const end = new Date(currentSummaryEntry.endTime);
                const offset = end.getTimezoneOffset() * 60000;
                const localISOTime = new Date(end.getTime() - offset).toISOString().slice(0, 16);
                editEndTimeInput.value = localISOTime;
            }
            if (editGoalInput) editGoalInput.value = currentSummaryEntry.targetHours || 16;
        } else {
            if (editEndTimeGroup) editEndTimeGroup.style.display = 'none';

            // Populate with current active state
            if (editStartTimeInput && fastingState.startTime) {
                const start = new Date(fastingState.startTime);
                const offset = start.getTimezoneOffset() * 60000;
                const localISOTime = new Date(start.getTime() - offset).toISOString().slice(0, 16);
                editStartTimeInput.value = localISOTime;
            } else {
                const now = new Date();
                const offset = now.getTimezoneOffset() * 60000;
                editStartTimeInput.value = new Date(now.getTime() - offset).toISOString().slice(0, 16);
            }
            if (editGoalInput) editGoalInput.value = fastingState.targetHours;
        }

        timerEditModal.classList.remove('hidden');
    }

    function saveTimerEdit() {
        const newStartVal = editStartTimeInput.value;
        const newEndVal = editEndTimeInput ? editEndTimeInput.value : null;
        const newGoal = parseInt(editGoalInput.value);

        if (isEditingHistory && currentSummaryDate) {
            // Save to history
            const history = getHistory();
            const entryIndex = history.findIndex(h => h.date === currentSummaryDate);
            if (entryIndex >= 0) {
                if (newStartVal) history[entryIndex].startTime = new Date(newStartVal).getTime();
                if (newEndVal) history[entryIndex].endTime = new Date(newEndVal).getTime();
                if (!isNaN(newGoal)) history[entryIndex].targetHours = newGoal;

                // Recalculate duration
                if (history[entryIndex].startTime && history[entryIndex].endTime) {
                    history[entryIndex].duration = history[entryIndex].endTime - history[entryIndex].startTime;
                }

                localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                renderHistoryCalendar();
                updateMetabolicCard();
            }
        } else {
            // Save to active state
            if (newStartVal) {
                if (!fastingState.isFasting) {
                    fastingState.isFasting = true;
                    const btn = document.getElementById('btnStartFast');
                    if (btn) btn.innerText = window.Locales.getTranslation('fasting.timer.end_fast');
                }
                fastingState.startTime = new Date(newStartVal).getTime();
            }

            if (!isNaN(newGoal) && newGoal > 0) {
                fastingState.targetHours = newGoal;
                const hGoal = document.getElementById('headerGoalText');
                if (hGoal) hGoal.innerText = `${window.Locales.getTranslation('fasting.header.goal_label')}: ${newGoal}h TRF`;
            }

            saveState();
            tick();
        }
    }

    // --- Hydration Modal Logic ---
    // Open Modal
    if (hydrationCard) {
        hydrationCard.addEventListener('click', (e) => {
            // If user clicked one of the pill buttons, don't open modal
            if (e.target.closest('.btn-water-pill')) return;

            openHydrationModal();
        });
    }

    function openHydrationModal() {
        if (!hydroModal) return;
        hydroModal.classList.remove('hidden');
        updateModalUI();
    }

    function closeHydrationModal() {
        if (!hydroModal) return;
        hydroModal.classList.add('hidden');
    }

    if (closeHydroModalBtn) {
        closeHydroModalBtn.addEventListener('click', closeHydrationModal);
    }

    // Close on backdrop
    if (hydroModal) {
        hydroModal.addEventListener('click', (e) => {
            if (e.target === hydroModal) closeHydrationModal();
        });
    }

    function updateModalUI() {
        if (!window.GlobalHydration) return;
        // Use internal scope hydrationState

        const valEl = document.getElementById('hydroModalValue');
        const goalEl = document.getElementById('hydroModalGoal');

        if (valEl) valEl.innerText = hydrationState.current.toLocaleString('en-US');
        if (goalEl) goalEl.innerText = hydrationState.goal.toLocaleString('en-US');

        const customGoalIn = document.getElementById('customGoalInput');
        if (customGoalIn) customGoalIn.value = hydrationState.goal;
    }

    // Custom Actions in Modal
    window.adjustWater = (amount) => {
        if (!window.GlobalHydration) return;
        const state = window.GlobalHydration.state;
        // Check for negative
        if (state.total + amount < 0) {
            // Set to 0 if subtraction would go below 0, via logic handled by GlobalHydration usually, 
            // but since addWater is simple, we might need a set method or just add negative.
            // Let's just add it, GlobalHydration will handle persistence. 
            // Better: Check here to prevent negative UI.
            window.GlobalHydration.addWater(-state.total); // Reset to 0
        } else {
            window.GlobalHydration.addWater(amount);
        }
        updateHydrationUI();
        updateModalUI();
    };

    if (btnAddCustomWater) {
        btnAddCustomWater.addEventListener('click', () => {
            const val = parseInt(customWaterInput.value);
            if (!isNaN(val) && val > 0) {
                adjustWater(val);
                customWaterInput.value = '';
            }
        });
    }

    if (btnSetGoal) {
        btnSetGoal.addEventListener('click', () => {
            const val = parseInt(customGoalInput.value);
            if (!isNaN(val) && val > 0) {
                if (window.GlobalHydration) {
                    window.GlobalHydration.setGoal(val);
                    updateHydrationUI();
                    updateModalUI();
                    alert(window.Locales.getTranslation('fasting.hydration.goal_updated'));
                }
            }
        });
    }

    if (btnResetWater) {
        btnResetWater.addEventListener('click', () => {
            if (confirm(window.Locales.getTranslation('fasting.hydration.reset_confirm'))) {
                if (window.GlobalHydration) {
                    // Reset manually by adding negative total
                    window.GlobalHydration.state.total = 0;
                    window.GlobalHydration.saveState();
                    updateHydrationUI();
                    updateModalUI();
                }
            }
        });
    }

    // --- Chart Tooltip Logic (New) ---
    const chartContainer = document.getElementById('fastingWeeklyChart');
    if (chartContainer) {
        const cols = chartContainer.querySelectorAll('.chart-col');

        const getTooltip = () => {
            let t = document.getElementById('fast-chart-tooltip');
            if (!t) {
                t = document.createElement('div');
                t.id = 'fast-chart-tooltip';
                t.style.position = 'fixed';
                t.style.zIndex = '9999';
                t.style.background = '#18181b';
                t.style.border = '1px solid #3f3f46';
                t.style.borderRadius = '8px';
                t.style.padding = '10px 14px';
                t.style.pointerEvents = 'none';
                t.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
                t.style.fontFamily = 'Inter, sans-serif';
                t.style.fontSize = '12px';
                t.style.color = '#fff';
                t.style.minWidth = '100px';
                t.style.textAlign = 'center';
                document.body.appendChild(t);
            }
            return t;
        };

        cols.forEach(col => {
            const show = () => {
                const day = col.getAttribute('data-day');
                const hours = col.getAttribute('data-hours');
                const t = getTooltip();

                t.innerHTML = `
                    <div style="font-weight:700; color:#fff; margin-bottom:4px; border-bottom:1px solid #333; padding-bottom:4px;">${day}</div>
                    <div style="color:#a1a1aa;">Fasted <span style="color:#FACC15; font-weight:700; font-size:13px;">${hours}h</span></div>
                `;

                const rect = col.getBoundingClientRect();
                t.style.display = 'block';
                // Center tooltip above bar
                const leftPos = rect.left + (rect.width / 2) - (t.offsetWidth / 2);
                const topPos = rect.top - t.offsetHeight - 10;

                t.style.left = `${leftPos}px`;
                t.style.top = `${topPos}px`;

                // Visual feedback
                const bar = col.querySelector('div');
                if (bar) {
                    bar.style.transform = 'scaleY(1.05)';
                    bar.style.filter = 'brightness(1.3)';
                }
            };

            const hide = () => {
                const t = getTooltip();
                t.style.display = 'none';
                // Reset visual feedback
                const bar = col.querySelector('div');
                if (bar) {
                    bar.style.transform = 'scaleY(1)';
                    bar.style.filter = 'none';
                }
            };

            col.addEventListener('mouseenter', show);
            col.addEventListener('mouseleave', hide);
            col.addEventListener('touchstart', show); // Mobile
        });

        // --- Insights Calculation (New) ---
        function updateWeeklyInsights() {
            const cols = document.querySelectorAll('#fastingWeeklyChart .chart-col');
            let totalDeepHours = 0;
            let totalHours = 0;
            let count = 0;

            cols.forEach(col => {
                const h = parseFloat(col.getAttribute('data-hours') || 0);
                totalHours += h;
                count++;
                // Deep Ketosis usually starts after 12h
                if (h > 12) {
                    totalDeepHours += (h - 12);
                }
            });

            const avgH = totalHours / (count || 1);

            // 1. Deep Ketosis total
            const elDeep = document.getElementById('deepKetosisVal');
            if (elDeep) {
                elDeep.innerHTML = `${Math.round(totalDeepHours * 10) / 10} hours`;
            }

            // 2. AVG Ketones
            const elKetones = document.getElementById('avgKetonesVal');
            if (elKetones) {
                const val = 1.0 + (totalDeepHours / 30);
                elKetones.innerHTML = val.toFixed(1);
            }

            // 3. GKI Index
            const elGKI = document.getElementById('gkiIndexVal');
            if (elGKI) {
                const val = Math.max(25, Math.round(110 - totalDeepHours));
                elGKI.innerHTML = val;
            }
        }

        // Call initially
        setTimeout(updateWeeklyInsights, 100); // Slight delay to ensure DOM is ready

    }

    // Sync from other page (Dashboard)
    window.addEventListener('storage', (e) => {
        if (e.key === getUserKey('aureus_fasting_state')) {
            loadState();
            if (fastingState.isFasting) {
                updateUIActiveState(true);
                tick();
            } else {
                resetUI();
            }
        }
        if (e.key === getUserKey('aureus_hydration')) {
            loadState();
            updateHydrationUI();
        }
    });

    // --- Yearly Fasting History (Heatmap) Logic ---

    // Constants
    const HISTORY_KEY = getUserKey('aureus_fasting_history');

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveFastToHistory(durationMs) {
        const history = getHistory();
        const now = new Date();
        const todayStr = formatLocalDate(now);

        // Check if entry for today exists
        const existingIndex = history.findIndex(h => h.date === todayStr);

        const entryData = {
            date: todayStr,
            duration: durationMs,
            completed: true,
            startTime: fastingState.startTime,
            endTime: now.getTime(),
            targetHours: fastingState.targetHours
        };

        if (existingIndex >= 0) {
            // Update existing (merge durations and keep latest times)
            history[existingIndex].duration += durationMs;
            history[existingIndex].endTime = entryData.endTime;
            history[existingIndex].completed = true;
        } else {
            history.push(entryData);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistoryCalendar();
        updateMetabolicCard(); // Refresh metabolic data
    }

    let currentViewDate = new Date();

    function renderHistoryCalendar() {
        const grid = document.getElementById('historyCalendarGrid');
        const monthYearLabel = document.getElementById('currentMonthYear');
        if (!grid || !monthYearLabel) return;

        const history = getHistory();
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();

        // Month Names for Label
        // Month Names for Label
        // Use browser's locale aware formatting
        const lang = localStorage.getItem('app_language') || 'en'; // LocalizationManager might handle this better, but this works
        // Better: window.Locales.getTranslation('languages.en') ... no.
        // Just use toLocaleString
        const monthName = new Date(year, month).toLocaleString(lang, { month: 'long' });
        // Capitalize first letter if needed (some languages don't)
        const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        monthYearLabel.innerText = `${capMonth} ${year}`;

        // Get first day of month and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Monday start adjustment (JS 0=Sun, 1=Mon... We want 1-7 basically)
        let startDayIndex = firstDay.getDay(); // 0-6
        startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1; // Mon=0 ... Sun=6

        grid.innerHTML = '';

        // Fill empty slots before 1st of month
        for (let i = 0; i < startDayIndex; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            grid.appendChild(empty);
        }

        let monthlyTotalMs = 0;
        let daysWithFasts = 0;
        const todayStr = formatLocalDate(new Date());

        // Fill days of month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = formatLocalDate(dateObj);
            const entry = history.find(h => h.date === dateStr);

            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.style.cursor = 'pointer';
            if (dateStr === todayStr) dayEl.classList.add('today');

            const dayNum = document.createElement('span');
            dayNum.className = 'day-num';
            dayNum.innerText = d;
            dayEl.appendChild(dayNum);

            const indicator = document.createElement('div');
            indicator.className = 'status-indicator';
            dayEl.appendChild(indicator);

            if (entry && entry.duration > 0) {
                dayEl.classList.add('completed');
                monthlyTotalMs += entry.duration;
                daysWithFasts++;

                // Tooltip info
                const hours = (entry.duration / (1000 * 60 * 60)).toFixed(1);
                dayEl.title = `${hours}h ${window.Locales.getTranslation('fasting.fasted')}`;
            }

            // Click listener for Daily Summary
            dayEl.onclick = () => showDailySummary(dateStr, entry);

            grid.appendChild(dayEl);
        }

        // Update Stats
        const hoursEl = document.getElementById('monthlyTotalHours');
        const daysEl = document.getElementById('monthlyCompletedDays');
        const streakEl = document.getElementById('monthlyBestStreak');

        if (hoursEl) hoursEl.innerText = `${Math.floor(monthlyTotalMs / (1000 * 60 * 60))}h`;
        if (daysEl) daysEl.innerText = daysWithFasts;
        if (streakEl) streakEl.innerText = calculateStreak(history);
    }

    function showDailySummary(dateStr, entry) {
        currentSummaryDate = dateStr;
        currentSummaryEntry = entry;

        const modal = document.getElementById('dailySummaryModal');
        const dateEl = document.getElementById('summaryModalDate');
        const totalTimeEl = document.getElementById('summaryTotalTime');
        const startEl = document.getElementById('summaryStartTime');
        const endEl = document.getElementById('summaryEndTime');
        const ketosisEl = document.getElementById('summaryDeepKetosis');
        const targetEl = document.getElementById('summaryTargetGoal');
        const insightEl = document.getElementById('summaryInsightText');
        const actionsRow = document.querySelector('.summary-actions-row');

        if (!modal) return;

        // Reset Date Display
        const parsedDate = new Date(dateStr + 'T12:00:00');
        dateEl.innerText = parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        if (!entry || !entry.duration) {
            if (actionsRow) actionsRow.style.display = 'none';
            totalTimeEl.innerText = "0h 0m";
            startEl.innerText = "--:--";
            endEl.innerText = "--:--";
            ketosisEl.innerText = "0h";
            targetEl.innerText = "16h";
            insightEl.innerText = window.Locales.getTranslation('fasting.insights.summary_none');
        } else {
            if (actionsRow) actionsRow.style.display = 'flex';
            const hours = Math.floor(entry.duration / (1000 * 60 * 60));
            const mins = Math.round((entry.duration % (1000 * 60 * 60)) / (1000 * 60));
            totalTimeEl.innerText = `${hours}h ${mins}m`;

            // Times
            startEl.innerText = entry.startTime ? new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
            endEl.innerText = entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
            targetEl.innerText = entry.targetHours ? `${entry.targetHours}h` : "16h";

            // Ketosis approx
            const h = entry.duration / (1000 * 60 * 60);
            const deep = h > 12 ? (h - 12).toFixed(1) : 0;
            ketosisEl.innerText = `${deep}h`;

            // Insights
            const target = entry.targetHours || 16;
            if (h >= target) {
                insightEl.innerText = window.Locales.getTranslation('fasting.insights.summary_exceeded');
            } else if (h >= 12) {
                insightEl.innerText = window.Locales.getTranslation('fasting.insights.summary_close');
            } else {
                insightEl.innerText = window.Locales.getTranslation('fasting.insights.summary_start');
            }
        }

        modal.classList.remove('hidden');
    }

    function initSummaryModal() {
        const modal = document.getElementById('dailySummaryModal');
        const closeBtn = document.getElementById('closeSummaryModal');
        const doneBtn = document.getElementById('closeSummaryBtn');

        if (!modal) return;

        [closeBtn, doneBtn].forEach(btn => {
            if (btn) btn.onclick = () => modal.classList.add('hidden');
        });

        if (btnDeleteHistory) {
            btnDeleteHistory.onclick = () => handleDeleteHistory();
        }
        if (btnEditHistory) {
            btnEditHistory.onclick = () => handleEditHistory();
        }

        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        };
    }

    function handleDeleteHistory() {
        if (!currentSummaryDate) return;
        if (!confirm("Are you sure you want to delete this fasting entry?")) return;

        const history = getHistory();
        const newHistory = history.filter(h => h.date !== currentSummaryDate);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

        // Refresh UI
        renderHistoryCalendar();
        updateMetabolicCard();

        const modal = document.getElementById('dailySummaryModal');
        if (modal) modal.classList.add('hidden');
    }

    function handleEditHistory() {
        if (!currentSummaryEntry) return;
        isEditingHistory = true;
        openTimerEditModal();

        // Hide summary modal
        const modal = document.getElementById('dailySummaryModal');
        if (modal) modal.classList.add('hidden');
    }

    function calculateStreak(history) {
        if (!history || history.length === 0) return 0;
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        let current = new Date();
        current.setHours(0, 0, 0, 0);

        for (let i = 0; i < sorted.length; i++) {
            const entryDate = new Date(sorted[i].date);
            entryDate.setHours(0, 0, 0, 0);

            // Allow for "today" still in progress or missed yesterday
            const diff = (current - entryDate) / (1000 * 60 * 60 * 24);

            if (diff <= 1) {
                streak++;
                current = entryDate;
            } else {
                break;
            }
        }
        return streak;
    }

    // Expose helpers globally if needed or just use internally
    window.changeMonth = (offset) => {
        currentViewDate.setMonth(currentViewDate.getMonth() + offset);
        renderHistoryCalendar();
    };

    // Nav Listeners
    const btnPrev = document.getElementById('prevMonth');
    const btnNext = document.getElementById('nextMonth');
    if (btnPrev) btnPrev.onclick = () => changeMonth(-1);
    if (btnNext) btnNext.onclick = () => changeMonth(1);

    // --- Metabolic Flexibility Logic (Linked to History) ---
    function updateMetabolicCard() {
        const deepKetosisEl = document.getElementById('deepKetosisVal');
        const sparklineGrid = document.getElementById('ketosisSparkline');
        const scoreEl = document.getElementById('metabolicScore');
        const fatBurnEl = document.getElementById('fatBurnTime');
        const changeEl = document.getElementById('weeklyChange');
        const insightTextEl = document.getElementById('metabolicInsightText');
        const statusEl = document.getElementById('metabolicStatus');

        if (!deepKetosisEl || !sparklineGrid) return;

        const history = getHistory();
        const today = new Date();

        // Helper: Get range for a specific week
        function getWeekData(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
            const start = new Date(d.setDate(diff));
            start.setHours(0, 0, 0, 0);

            let weeklyDeepHours = 0;
            let weeklyTotalFastingHours = 0;
            const dailyFasting = [];

            for (let i = 0; i < 7; i++) {
                const current = new Date(start);
                current.setDate(start.getDate() + i);
                const dateStr = formatLocalDate(current);
                const entry = history.find(h => h.date === dateStr);

                let dayFasting = 0;
                if (entry && entry.duration) {
                    const h = entry.duration / (1000 * 60 * 60);
                    dayFasting = h;
                    weeklyTotalFastingHours += h;
                    if (h > 12) {
                        weeklyDeepHours += (h - 12);
                    }
                }
                dailyFasting.push(dayFasting);
            }
            return { totalDeep: weeklyDeepHours, totalFasting: weeklyTotalFastingHours, daily: dailyFasting };
        }

        const currentWeek = getWeekData(today);

        // Previous Week Calculation
        const lastWeekDate = new Date();
        lastWeekDate.setDate(today.getDate() - 7);
        const lastWeek = getWeekData(lastWeekDate);

        // Update Main Val
        deepKetosisEl.innerText = `${Math.round(currentWeek.totalDeep)} hours`;

        // Render Sparkline
        let sparkHtml = '';
        const maxVal = Math.max(...currentWeek.daily, 4); // Min 4h for scale
        currentWeek.daily.forEach(val => {
            const height = (val / maxVal) * 100;
            sparkHtml += `<div class="s-bar" style="height: ${Math.max(height, 5)}%" title="${val.toFixed(1)}h"></div>`;
        });
        sparklineGrid.innerHTML = sparkHtml;

        // Update Stats Grid
        if (fatBurnEl) fatBurnEl.innerText = `${Math.round(currentWeek.totalDeep)}h`;

        // Update Weekly Goal Display
        const weeklyGoalDisplay = document.getElementById('weeklyGoalDisplay');
        if (weeklyGoalDisplay) weeklyGoalDisplay.innerText = `${fastingState.weeklyGoal}h`;

        // Metabolic Score (0-100) based on fasting hours vs custom weekly goal
        const score = Math.min(Math.round((currentWeek.totalFasting / (fastingState.weeklyGoal || 1)) * 100), 100);
        if (scoreEl) scoreEl.innerText = `${score}/100`;

        // Weekly Change
        if (changeEl) {
            const diff = currentWeek.totalDeep - lastWeek.totalDeep;
            const sign = diff >= 0 ? '+' : '';
            let pct = 0;
            if (lastWeek.totalDeep > 0) {
                pct = Math.round((diff / lastWeek.totalDeep) * 100);
            } else if (diff > 0) {
                pct = 100;
            }
            changeEl.innerText = `${sign}${pct}%`;
            changeEl.className = diff >= 0 ? 'm-stat-value text-green' : 'm-stat-value text-red';
        }

        // Dynamic Status & Insights
        if (statusEl) {
            if (score >= 90) statusEl.innerText = 'Optimal';
            else if (score >= 70) statusEl.innerText = 'Good';
            else statusEl.innerText = 'Developing';
        }

        if (insightTextEl) {
            if (currentWeek.totalDeep > lastWeek.totalDeep) {
                insightTextEl.innerText = "Excellent improvement! Your body is becoming more efficient at accessing stored fat during deeper fasting windows.";
            } else if (currentWeek.totalDeep > 0) {
                insightTextEl.innerText = "Consistent ketosis levels. Maintaining these windows promotes cellular repair and stable blood glucose levels.";
            } else {
                insightTextEl.innerText = "Focus on reaching the 12h-16h mark to unlock deep ketosis benefits like improved mental clarity and fat adaptation.";
            }
        }
    }

    // Helper to get curr week (Re-adding/Keeping logic)
    function getCurrentWeekDates() {
        const curr = new Date();
        const currentDay = curr.getDay();
        const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(curr);
        monday.setDate(curr.getDate() + diffToMon);
        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            week.push(d.toISOString().split('T')[0]);
        }
        return week;
    }

    // Call render initially
    renderHistoryCalendar();
    updateMetabolicCard();

    // Check for save on endFast is already using internal logic.
    // We just ensure saveFastToHistory calls renderYearlyHistory (Done above).

    /* --- INIT --- */
    loadState();
    // Initialize UI based on loaded state
    updateUIActiveState(fastingState.isFasting);
    if (fastingState.isFasting) {
        tick();
    }
    setInterval(tick, 1000);

    /* MOBILE MENU LOGIC moved to global-sync.js */

    // --- Shared Helpers ---
    function formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    initSummaryModal();

    // --- Weekly Goal Modal Logic ---
    const weeklyGoalModal = document.getElementById('weeklyGoalModal');
    const closeWeeklyGoalModalBtn = document.getElementById('closeWeeklyGoalModal');
    const btnEditWeeklyGoal = document.getElementById('btnEditWeeklyGoal');
    const weeklyGoalInput = document.getElementById('weeklyGoalInput');
    const btnSaveWeeklyGoal = document.getElementById('btnSaveWeeklyGoal');

    function openWeeklyGoalModal() {
        if (!weeklyGoalModal) return;
        if (weeklyGoalInput) weeklyGoalInput.value = fastingState.weeklyGoal || 112;
        weeklyGoalModal.classList.remove('hidden');
    }

    function closeWeeklyGoalModal() {
        if (weeklyGoalModal) weeklyGoalModal.classList.add('hidden');
    }

    if (btnEditWeeklyGoal) {
        btnEditWeeklyGoal.addEventListener('click', openWeeklyGoalModal);
    }

    if (closeWeeklyGoalModalBtn) {
        closeWeeklyGoalModalBtn.addEventListener('click', closeWeeklyGoalModal);
    }

    if (btnSaveWeeklyGoal) {
        btnSaveWeeklyGoal.addEventListener('click', () => {
            const newGoal = parseInt(weeklyGoalInput.value);
            if (!isNaN(newGoal) && newGoal > 0) {
                fastingState.weeklyGoal = newGoal;
                saveState();
                updateMetabolicCard();
                closeWeeklyGoalModal();
            } else {
                alert("Please enter a valid number of hours.");
            }
        });
    }

    // Close on backdrop
    if (weeklyGoalModal) {
        weeklyGoalModal.addEventListener('click', (e) => {
            if (e.target === weeklyGoalModal) closeWeeklyGoalModal();
        });
    }

    // --- Ketones Info Modal Logic ---
    const ketonesInfoModal = document.getElementById('ketonesInfoModal');
    const btnKetonesInfo = document.getElementById('btnKetonesInfo');
    const closeKetonesInfoModalBtn = document.getElementById('closeKetonesInfoModal');
    const btnGotItKetones = document.getElementById('btnGotItKetones');

    function openKetonesInfoModal() {
        if (ketonesInfoModal) ketonesInfoModal.classList.remove('hidden');
    }

    function closeKetonesInfoModal() {
        if (ketonesInfoModal) ketonesInfoModal.classList.add('hidden');
    }

    if (btnKetonesInfo) {
        btnKetonesInfo.addEventListener('click', openKetonesInfoModal);
    }

    if (closeKetonesInfoModalBtn) {
        closeKetonesInfoModalBtn.addEventListener('click', closeKetonesInfoModal);
    }

    if (btnGotItKetones) {
        btnGotItKetones.addEventListener('click', closeKetonesInfoModal);
    }

    if (ketonesInfoModal) {
        ketonesInfoModal.addEventListener('click', (e) => {
            if (e.target === ketonesInfoModal) closeKetonesInfoModal();
        });
    }

    // --- Language Change Listener ---
    document.addEventListener('language-changed', () => {
        // Re-render UI components that utilize localized strings

        // 1. Timer Display & Active State
        if (fastingState.isFasting) {
            updateUIActiveState(true);
            const now = new Date().getTime();
            const elapsed = now - fastingState.startTime;
            const totalDuration = fastingState.targetHours * 60 * 60 * 1000;
            updateTimerDisplay(elapsed, totalDuration);
            // Also update timeline
            updateTimeline(elapsed / (1000 * 60 * 60));
        } else {
            resetUI();
        }

        // 2. Hydration
        updateHydrationUI();
        updateModalUI();

        // 3. Modals and other staticish things
        const hGoal = document.getElementById('headerGoalText');
        if (hGoal && fastingState.targetHours) {
            hGoal.innerText = `${window.Locales.getTranslation('fasting.header.goal_label')}: ${fastingState.targetHours}h TRF`;
        }

        // 4. History Calendar (Month names)
        renderHistoryCalendar();
    });

    // Expose Global Helper for direct inline onclicks
    window.GlobalHydration = {
        addWater: (amount) => syncHydration(amount),
        setGoal: (goal) => setHydrationGoal(goal),
        init: () => initHydration()
    };

    // Listen for global hydration changes to update UI in real-time
    if (window.GlobalHydration) {
        window.GlobalHydration.init(); // Ensure it's ready
        updateHydrationUI();
        updateModalUI();
    }
    window.addEventListener('aureus-hydration-changed', () => {
        updateHydrationUI();
        updateModalUI();
    });

});
