const GOAL_PROFILES = [
    {
        icon: '🔥', title: 'Pérdida de Peso (Keto)',
        desc: 'Quema de grasa eficiente. Mantiene saciedad.',
        deficit: 500, ratio: { fat: 0.70, protein: 0.25, carb: 0.05 },
        macrosStr: '70% FAT • 25% PROT • 5% CARB'
    },
    {
        icon: '🥗', title: 'Pérdida de Peso (Balanceada)',
        desc: 'Bajar de peso con dieta variada.',
        deficit: 500, ratio: { fat: 0.35, protein: 0.30, carb: 0.35 },
        macrosStr: '35% FAT • 30% PROT • 35% CARB'
    },
    {
        icon: '⚖️', title: 'Mantenimiento (Keto/Actual)',
        desc: 'Mantener peso y energía estable.',
        deficit: 0, ratio: { fat: 0.70, protein: 0.25, carb: 0.05 },
        macrosStr: '70% FAT • 25% PROT • 5% CARB'
    },
    {
        icon: '💪', title: 'Aumento Masa Muscular',
        desc: 'Volumen limpio, minimizando grasa.',
        deficit: -300, ratio: { fat: 0.30, protein: 0.30, carb: 0.40 },
        macrosStr: '30% FAT • 30% PROT • 40% CARB'
    },
    {
        icon: '⚡', title: 'Rendimiento Deportivo',
        desc: 'Maximizar depósitos de glucógeno.',
        deficit: 0, ratio: { fat: 0.20, protein: 0.25, carb: 0.55 },
        macrosStr: '20% FAT • 25% PROT • 55% CARB'
    },
    {
        icon: '🔄', title: 'Recomposición Corporal',
        desc: 'Perder grasa y ganar músculo a la vez.',
        deficit: 0, ratio: { fat: 0.30, protein: 0.40, carb: 0.30 },
        macrosStr: '30% FAT • 40% PROT • 30% CARB'
    }
];

// Helper to get the correct user key, relying on global-sync.js if available
function getSettingsKey() {
    if (window.getUserKey) {
        return window.getUserKey('aureus_user_settings');
    }
    // Fallback if global-sync.js isn't loaded (though it should be)
    const active = localStorage.getItem('aureus_active_user');
    const user = active ? JSON.parse(active).name : 'Guest';
    return `${user}_aureus_user_settings`;
}

// Load settings on init
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial UI Update
    updateGoalDisplay();

    // 2. Event Delegation for Goal Footer Boxes (Robust for Dynamic Content)
    document.addEventListener('click', (e) => {
        // Check if the clicked element or any of its parents match the goal box selector
        const goalBox = e.target.closest('#goalFooterBox, .goal-footer-box');

        if (goalBox) {
            // Optional: Visual feedback or valid check specific to the element
            openGoalModal();
        }
    });

    // 3. Ensure cursor pointer style (for static elements)
    const goalBoxes = document.querySelectorAll('#goalFooterBox, .goal-footer-box');
    goalBoxes.forEach(box => box.style.cursor = 'pointer');
});

function openGoalModal() {
    // Verify currently active settings
    const storedSettings = localStorage.getItem(getSettingsKey());
    let currentDeficit = 500;
    let currentRatios = { fat: 0.70, protein: 0.25, carb: 0.05 };

    if (storedSettings) {
        const s = JSON.parse(storedSettings);
        if (s.targets) {
            // We need to infer the deficit if not explicitly stored, 
            // but 'deficit' is not usually stored in targets object directly in this app's schema.
            // However, settings-renderer.js usually calculates it.
            // For simpler logic here, we'll try to find a matching profile or default.

            // Actually, let's try to get it from window global if available (from settings-renderer)
            // or just defaulting. 
            // Ideally we should store the 'goalProfileIndex' or 'goalDeficit' in settings.
            // For now, valid ratios are keys.
            currentRatios = s.targets.ratios || currentRatios;
        }
    }

    const existing = document.querySelector('.goal-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'goal-modal-overlay';

    const isRatioEq = (r1, r2) => r1 && r2 && r1.fat === r2.fat && r1.protein === r2.protein && r1.carb === r2.carb;

    let htmlOptions = GOAL_PROFILES.map((p, index) => {
        // Robust active check:
        // 1. Try matching by stored goal identifier (title)
        // 2. Fallback to matching ratios AND deficit
        let isActive = false;
        if (storedSettings) {
            const s = JSON.parse(storedSettings);
            if (s.targets && s.targets.goalTitle) {
                isActive = s.targets.goalTitle === p.title;
            } else {
                // Fallback
                const currentDef = s.targets?.deficit ?? 500; // heuristic default
                isActive = isRatioEq(p.ratio, currentRatios) && (p.deficit === currentDef);
                // If deficit wasn't stored, we might still have double select, but title storage fixes this for future.
                // Let's rely on ratio if title is missing, but maybe we can be smarter?
                // For now, title storage is the real fix.
                if (!s.targets.goalTitle) {
                    isActive = isRatioEq(p.ratio, currentRatios);
                }
            }
        }

        return `
        <div class="goal-option-btn rich ${isActive ? 'active' : ''}" data-index="${index}">
            <div class="opt-left">
                <div class="opt-title">${p.icon} ${p.title}</div>
                <div class="opt-desc">${p.desc}</div>
                <div class="opt-macros">${p.macrosStr}</div>
            </div>
            <div class="opt-right">
                <span class="val-tag">${p.deficit === 0 ? 'MAINTENANCE' : (p.deficit > 0 ? `-${p.deficit}` : `+${Math.abs(p.deficit)}`)}</span>
            </div>
        </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div class="goal-modal wide">
            <h2>Selecciona tu Objetivo</h2>
            <p>Elige un perfil macro para adaptar tus metas.</p>
            <div class="goal-options-scroll">
                ${htmlOptions}
            </div>
            <button class="goal-close" id="btnCloseGoal">Cancelar</button>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Attach Listeners
    overlay.querySelectorAll('.goal-option-btn[data-index]').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            const p = GOAL_PROFILES[index];
            setGoal(p);
        });
    });

    const closeBtn = overlay.querySelector('#btnCloseGoal');
    if (closeBtn) closeBtn.addEventListener('click', closeGoalModal);
}

function closeGoalModal() {
    const overlay = document.querySelector('.goal-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function setGoal(profile) {
    try {
        console.log("Setting Goal:", profile.title);

        // 1. Get Current Settings to recalc targets
        // 1. Get Settings (or use Defaults)
        const stored = localStorage.getItem(getSettingsKey());
        let settings;

        if (stored) {
            settings = JSON.parse(stored);
        } else {
            // Initialize Defaults if no settings exist
            settings = {
                age: 34,
                gender: 'male',
                height: 178,
                weight: 82.5,
                activity: 1.55,
                protocol: 'standard',
                ifProtocol: '16:8',
                goalDeficit: 0,
                macroRatios: { fat: 0.70, protein: 0.25, carb: 0.05 },
                appearance: { accent: 'aureus', theme: 'dark', glass: true, radius: 16, font: 'Outfit' },
                targets: {}
            };
        }

        // 2. Calculate TDEE dynamically (Robust)
        const age = settings.age || 34;
        const gender = settings.gender || 'male';
        const height = settings.height || 178;
        const weight = settings.weight || 82.5;
        const activity = settings.activity || 1.55;

        const bmr = (gender === 'male')
            ? (10 * weight) + (6.25 * height) - (5 * age) + 5
            : (10 * weight) + (6.25 * height) - (5 * age) - 161;

        const tdee = bmr * activity;

        // 3. Calculate New Target Calories
        const targetCals = tdee - profile.deficit;

        // 4. Update Targets object
        settings.targets = {
            goalTitle: profile.title, // Store key for identification
            calories: Math.round(targetCals),
            deficit: profile.deficit,
            ratios: profile.ratio,
            // Calculate grams (Corrected keys: 'prot', 'fat', 'carb' to match renderer)
            prot: Math.round((targetCals * profile.ratio.protein) / 4),
            fat: Math.round((targetCals * profile.ratio.fat) / 9),
            carb: Math.round((targetCals * profile.ratio.carb) / 4)
        };

        // 5. Save back
        localStorage.setItem(getSettingsKey(), JSON.stringify(settings));

        // 6. Also update today's log if it exists (Sync Logic)
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        let logKey = `aureus_log_${year}-${month}-${day}`;
        if (window.getUserKey) {
            logKey = window.getUserKey(logKey);
        } else {
            // Fallback
            const active = localStorage.getItem('aureus_active_user');
            const user = active ? JSON.parse(active).name : 'Guest';
            logKey = `${user}_${logKey}`;
        }

        const logStored = localStorage.getItem(logKey);
        if (logStored) {
            let logData = JSON.parse(logStored);
            logData.targets = { ...settings.targets };
            localStorage.setItem(logKey, JSON.stringify(logData));
        }

        // 7. Dispatch Events for UI updates
        window.dispatchEvent(new CustomEvent('settings-saved')); // For script.js
        window.dispatchEvent(new Event('storage')); // For cross-tab/component sync

        // 8. Update Local UI immediately
        updateGoalDisplay(profile);
        closeGoalModal();

        // Optional: Toast
        // showToast("Objetivo actualizado: " + profile.title); 

    } catch (e) {
        console.error("Error setting goal:", e);
        alert("Error updating goal: " + e.message);
    }
}

function updateGoalDisplay(profileOverride = null) {
    // Attempt to find the display elements
    const titleEls = document.querySelectorAll('.goal-title');
    const subEls = document.querySelectorAll('.goal-sub');

    if (titleEls.length === 0) return;

    let profile = profileOverride;

    if (!profile) {
        // Infer from settings
        const stored = localStorage.getItem(getSettingsKey());
        if (stored) {
            const s = JSON.parse(stored);
            if (s.targets && s.targets.ratios) {
                // Find matching profile
                const isRatioEq = (r1, r2) => r1 && r2 && r1.fat === r2.fat && r1.protein === r2.protein && r1.carb === r2.carb;
                profile = GOAL_PROFILES.find(p => isRatioEq(p.ratio, s.targets.ratios));

                // If we found a profile, we also check deficit if possible, or just assume the profile's default
                // Since we don't store deficit explicitly, ratio match is best guess.
            }
        }
    }

    if (profile) {
        titleEls.forEach(el => el.textContent = `GOAL: ${profile.title.toUpperCase().split(' (')[0]}`); // Simplify title
        subEls.forEach(el => {
            const defText = profile.deficit === 0 ? 'Maintenance' : (profile.deficit > 0 ? `-${profile.deficit}kcal deficit` : `+${Math.abs(profile.deficit)}kcal surplus`);
            el.textContent = defText;
        });
    }
}
