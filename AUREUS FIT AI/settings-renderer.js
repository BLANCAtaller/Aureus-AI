/**
 * Settings Renderer - Handles Profile & Metabolic Logic
 * Calculations for BMR, TDEE, and Macros
 */

document.addEventListener('DOMContentLoaded', () => {
    initSettings();
});

function initSettings() {
    // 1. DOM Elements
    const elements = {
        inputs: {
            age: document.getElementById('inputAge'),
            gender: document.getElementById('inputGender'),
            height: document.getElementById('inputHeight'),
            weight: document.getElementById('inputWeight'),
            activity: document.getElementById('activitySlider')
        },
        displays: {
            activityLabel: document.getElementById('activityValueDisplay'),
            bmr: document.getElementById('bmrValue'),
            tdee: document.getElementById('tdeeValue'),
            targetCals: document.getElementById('targetCalsDisplay'),
            targetFat: document.getElementById('targetFatGrams'),
            targetProt: document.getElementById('targetProtGrams'),
            targetCarb: document.getElementById('targetCarbGrams'),
            safetyBmr: document.getElementById('safetyBmr')
        },
        buttons: {
            save: document.getElementById('globalSaveBtn'),
            bottomSave: document.getElementById('bottomSaveBtn')
        },
        chips: {
            ifItems: document.querySelectorAll('.if-item'),
            colorOrbs: document.querySelectorAll('.color-orb'),
            themeCards: document.querySelectorAll('.theme-card'),
            fontChips: document.querySelectorAll('.font-chip')
        },
        appearance: {
            glassToggle: document.getElementById('checkGlass'),
            radiusSlider: document.getElementById('radiusSlider'),
            radiusVal: document.getElementById('radiusVal')
        },
    };

    // 2. State
    let currentSettings = loadSettings();
    window.currentGoalDeficit = currentSettings.goalDeficit || 0;
    window.currentMacroRatios = currentSettings.macroRatios || { fat: 0.70, protein: 0.25, carb: 0.05 };

    // 3. Initial UI Sync
    syncUIWithSettings(elements, currentSettings);
    updateCalculations(elements);

    // --- Manual Goal Setting Interaction ---
    const goalFooter = document.querySelector('.goal-footer-box');
    if (goalFooter) {
        goalFooter.style.cursor = 'pointer';
        goalFooter.title = "Click to change Goal";
        goalFooter.addEventListener('click', () => {
            openGoalModal();
        });
    }

    // 4. Event Listeners
    document.addEventListener('aureus-global-save', (e) => {
        // Trigger existing save logic
        gatherSettings(elements);
        // Optionally prevent the default toast if this page handles its own
        // e.preventDefault(); 
    });

    // --- IF Protocol selection ---
    elements.chips.ifItems.forEach(item => {
        item.addEventListener('click', () => {
            elements.chips.ifItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Auto-save logic
            const newSettings = gatherSettings(elements);
            saveSettings(newSettings);
            showToast(`Ayuno ${item.dataset.if} seleccionado.`);
        });
    });

    // --- Language selection ---
    const langChips = document.querySelectorAll('.lang-chip');
    langChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const lang = chip.dataset.lang;
            if (window.Locales) window.Locales.setLanguage(lang);

            // Visual Update
            langChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            showToast(`Language set to ${lang.toUpperCase()}`);
        });
    });

    // Initialize Active Language Chip
    if (window.Locales && typeof window.Locales.getCurrentLanguage === 'function') {
        const currentLang = window.Locales.getCurrentLanguage();
        langChips.forEach(chip => {
            if (chip.dataset.lang === currentLang) chip.classList.add('active');
            else chip.classList.remove('active');
        });
    }

    // Macro Targets Card Click to open Goal Modal
    const macroCard = document.querySelector('.macros-card-premium');
    if (macroCard) {
        macroCard.style.cursor = 'pointer';
        macroCard.addEventListener('click', (e) => {
            // Avoid triggering if clicking child buttons if we add them later
            if (e.target.closest('.legend-row')) return;
            openGoalModal();
        });
    }

    // Color Orb Selection
    elements.chips.colorOrbs.forEach(orb => {
        orb.addEventListener('click', () => {
            elements.chips.colorOrbs.forEach(o => o.classList.remove('active'));
            orb.classList.add('active');
            // Permanent live preview for current session
            document.body.dataset.accent = orb.dataset.color;

            // Auto-save to broadcast change globally
            const newSettings = gatherSettings(elements);
            saveSettings(newSettings);
            window.dispatchEvent(new CustomEvent('settings-saved'));
        });
    });

    // Theme Card Selection
    elements.chips.themeCards.forEach(card => {
        card.addEventListener('click', () => {
            elements.chips.themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            document.body.dataset.theme = card.dataset.theme;
        });
    });

    // Font selection
    elements.chips.fontChips.forEach(chip => {
        chip.addEventListener('click', () => {
            elements.chips.fontChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            document.body.dataset.font = chip.dataset.font;
        });
    });

    // Glass toggle
    if (elements.appearance.glassToggle) {
        elements.appearance.glassToggle.addEventListener('change', (e) => {
            document.body.dataset.glass = e.target.checked;
        });
    }

    // Radius slider
    if (elements.appearance.radiusSlider) {
        elements.appearance.radiusSlider.addEventListener('input', (e) => {
            const val = e.target.value + 'px';
            if (elements.appearance.radiusVal) elements.appearance.radiusVal.innerText = val;
            document.body.style.setProperty('--app-radius', val);
        });
    }

    // Radius slider
    if (elements.appearance.radiusSlider) {
        elements.appearance.radiusSlider.addEventListener('input', (e) => {
            const val = e.target.value + 'px';
            if (elements.appearance.radiusVal) elements.appearance.radiusVal.innerText = val;
            document.body.style.setProperty('--app-radius', val);
        });
    }

    // Save logic
    const handleSave = () => {
        const newSettings = gatherSettings(elements);
        saveSettings(newSettings);
        showToast("Settings saved successfully!");

        // Sync with today's log targets
        syncLogTargets(newSettings);

        // Broadcast event for same-window updates
        window.dispatchEvent(new CustomEvent('settings-saved'));
    };

    if (elements.buttons.save) {
        elements.buttons.save.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            handleSave();
        });
    }
    if (elements.buttons.bottomSave) {
        elements.buttons.bottomSave.addEventListener('click', (e) => {
            e.preventDefault();
            handleSave();
        });
    }




    // Activity Slider Label Update
    elements.inputs.activity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        let label = "Moderate (x1.55)";
        if (val <= 1.2) label = "Sedentary (x1.2)";
        else if (val <= 1.375) label = "Light (x1.375)";
        else if (val <= 1.55) label = "Moderate (x1.55)";
        else if (val <= 1.725) label = "Active (x1.725)";
        else label = "Athlete (x1.9)";
        elements.displays.activityLabel.innerText = label;
    });
}

// --- Logic Functions ---

function loadSettings() {
    const defaultSettings = {
        age: 34,
        gender: 'male',
        height: 178,
        weight: 82.5,
        activity: 1.55,
        protocol: 'standard',
        ifProtocol: '16:8',
        goalDeficit: 0, // 0 = Maintenance
        macroRatios: { fat: 0.70, protein: 0.25, carb: 0.05 },
        appearance: {
            accent: 'aureus',
            theme: 'dark',
            glass: true,
            radius: 16,
            font: 'Outfit'
        },
    };
    const stored = localStorage.getItem(getUserKey('aureus_user_settings'));

    // If local data exists, use it
    if (stored) {
        return JSON.parse(stored);
    }

    // Try to load from Supabase in background
    loadSettingsFromSupabase();

    return defaultSettings;
}

/**
 * Load settings from Supabase and hydrate localStorage
 */
async function loadSettingsFromSupabase() {
    try {
        if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
            return;
        }

        const { data: session } = await window.supabaseClient.auth.getSession();
        if (!session?.session?.user?.id) {
            return;
        }

        const userId = session.session.user.id;
        const recordId = `${userId}_profiles`;

        const { data, error } = await window.supabaseClient
            .from('user_data')
            .select('app_data')
            .eq('id', recordId)
            .maybeSingle();

        if (error || !data) {
            console.log('[Settings] No cloud data found');
            return;
        }

        const appData = data.app_data;
        if (appData?.metabolicProfile) {
            // Hydrate localStorage with cloud data
            const settings = {
                age: appData.metabolicProfile.age,
                gender: appData.metabolicProfile.gender,
                height: appData.metabolicProfile.height,
                weight: appData.metabolicProfile.weight,
                activity: appData.metabolicProfile.activity,
                protocol: appData.metabolicProfile.protocol,
                ifProtocol: appData.metabolicProfile.ifProtocol,
                goalDeficit: appData.metabolicProfile.goalDeficit,
                purineLimit: appData.metabolicProfile.purineLimit,
                macros: appData.metabolicProfile.macros,
                identity: appData.identity
            };

            localStorage.setItem(getUserKey('aureus_user_settings'), JSON.stringify(settings));
            console.log('✅ Settings loaded from Supabase');

            // Reload page to apply settings
            setTimeout(() => window.location.reload(), 500);
        }
    } catch (err) {
        console.error('[Settings] Error loading from Supabase:', err);
    }
}

function migrateUserData(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    console.log(`[Migration] Moving data from '${oldName}' to '${newName}'...`);

    // 1. Identify and Move LocalStorage Keys
    const prefix = `${oldName}_`;
    const keysToMigrate = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
            keysToMigrate.push(key);
        }
    }

    keysToMigrate.forEach(oldKey => {
        const suffix = oldKey.substring(prefix.length);
        const newKey = `${newName}_${suffix}`;
        // Only migrate if destination doesn't exist (safety check)
        if (!localStorage.getItem(newKey)) {
            const val = localStorage.getItem(oldKey);
            localStorage.setItem(newKey, val);
            localStorage.removeItem(oldKey);
        }
    });

    // 2. Update Custom Users List (Rename the entry)
    const customUsersJson = localStorage.getItem('aureus_custom_users');
    if (customUsersJson) {
        try {
            const users = JSON.parse(customUsersJson);
            const targetUser = users.find(u => u.name === oldName);
            if (targetUser) {
                targetUser.name = newName;
                localStorage.setItem('aureus_custom_users', JSON.stringify(users));
            }
        } catch (e) {
            console.error("Error migrating custom users list:", e);
        }
    }
}

function saveSettings(settings) {
    // --- MIGRATION CHECK ---
    const currentActiveJson = localStorage.getItem('aureus_active_user');
    let currentName = 'Usuario';

    // Get current user name as fallback
    if (currentActiveJson) {
        try {
            const activeUser = JSON.parse(currentActiveJson);
            currentName = activeUser.name || 'Usuario';
        } catch (e) { }
    }

    // Use settings username OR current name (never fallback to generic 'Usuario' if we have a real name)
    const newName = settings.identity?.username || currentName;
    let needsMigration = false;
    let oldName = null;

    if (currentActiveJson) {
        const activeUser = JSON.parse(currentActiveJson);
        if (activeUser.name && activeUser.name !== newName) {
            needsMigration = true;
            oldName = activeUser.name;
        }
    }

    // 3. Persist avatar during migration if not changing it
    // If we are migrating, we want to keep the OLD avatar if the user didn't upload a new one.
    // Currently 'settings.identity.avatar' is null if not uploaded/base64.
    // const currentActiveJson = localStorage.getItem('aureus_active_user'); // Already declared
    let effectiveAvatar = settings.identity?.avatar;

    if (!effectiveAvatar && needsMigration && currentActiveJson) {
        try {
            const u = JSON.parse(currentActiveJson);
            // If the old user had a custom avatar/valid avatar, keep it for the new name
            if (u.avatar) effectiveAvatar = u.avatar;
        } catch (e) { }
    }

    if (needsMigration && oldName) {
        try {
            migrateUserData(oldName, newName);

            // Update Active User to new name immediately
            const u = JSON.parse(currentActiveJson);
            u.name = newName;
            if (effectiveAvatar) u.avatar = effectiveAvatar; // Ensure avatar carries over
            localStorage.setItem('aureus_active_user', JSON.stringify(u));
        } catch (err) {
            console.error("Migration Error:", err);
            alert("Error saving name change: " + err.message);
            return; // Stop save to prevent data corruption
        }
    }

    // Fix: Ensure settings object has the correct avatar before saving to user_settings
    if (effectiveAvatar) {
        if (!settings.identity) settings.identity = {};
        settings.identity.avatar = effectiveAvatar;
    }

    // --- STANDARD SAVE ---
    // Now that active user is updated (if needed), this saves to the CORRECT key (new name)
    localStorage.setItem(getUserKey('aureus_user_settings'), JSON.stringify(settings));

    // --- GLOBAL SYNC: Update Active User & Sidebar ---
    try {
        const username = newName; // Already resolved
        const avatar = settings.identity?.avatar;

        // Prepare final avatar path
        let finalAvatar = avatar;
        if (!finalAvatar) {
            finalAvatar = 'images/users/item_profile.webp';
        }

        // 1. Update localStorage 'aureus_active_user' (Avatar check)
        const currentActive = localStorage.getItem('aureus_active_user');
        if (currentActive) {
            const u = JSON.parse(currentActive);
            u.avatar = finalAvatar;
            // Name already updated above if migration occurred, but ensure it matches
            u.name = username;
            localStorage.setItem('aureus_active_user', JSON.stringify(u));
        }

        // 2. Update Custom Users List (Avatar Sync)
        // Note: Name was already updated in migrateUserData if that ran.
        const customUsersJson = localStorage.getItem('aureus_custom_users');
        if (customUsersJson) {
            let users = JSON.parse(customUsersJson);
            const userIdx = users.findIndex(u => u.name === username);

            if (userIdx >= 0) {
                users[userIdx].avatar = finalAvatar;
                localStorage.setItem('aureus_custom_users', JSON.stringify(users));
            } else {
                // If user not found (rare, maybe first edit), add them? 
                // Currently global-sync handles adding, but we can ensure consistency here.
                // For now, assume global-sync handles creation.
            }
        }

        // 3. Live DOM Update (Sidebar)
        const sidebarAvatar = document.getElementById('currentAvatar');
        const sidebarName = document.getElementById('currentUserName');
        const drawerAvatar = document.getElementById('drawerAvatar');
        const drawerName = document.getElementById('drawerUserName');

        if (sidebarAvatar) {
            if (username === 'Jesus Rodriguez') sidebarAvatar.src = normalizeAvatarPath('images/users/BlindSnk.webp');
            else if (username === 'Gio') sidebarAvatar.src = normalizeAvatarPath('images/users/gio_profile.webp');
            else sidebarAvatar.src = normalizeAvatarPath(finalAvatar);
        }
        if (sidebarName) sidebarName.innerText = username;
        if (drawerAvatar) {
            if (username === 'Jesus Rodriguez') drawerAvatar.src = normalizeAvatarPath('images/users/BlindSnk.webp');
            else if (username === 'Gio') drawerAvatar.src = normalizeAvatarPath('images/users/gio_profile.webp');
            else drawerAvatar.src = normalizeAvatarPath(finalAvatar);
        }
        if (drawerName) drawerName.innerText = username;

        // 4. Force Reload if Migration Occurred (to refresh all data)
        if (needsMigration) {
            setTimeout(() => window.location.reload(), 500);
        }

        // 5. SUPABASE SYNC: Save settings to cloud
        syncSettingsToSupabase(settings, username, finalAvatar);

    } catch (e) {
        console.error("Error syncing global user profile:", e);
    }
}

/**
 * Sync settings to Supabase user_data table
 */
async function syncSettingsToSupabase(settings, username, avatar) {
    try {
        // Check if Supabase is available
        if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
            console.warn('[Settings] Supabase client not available, skipping cloud sync');
            return;
        }

        const { data: session } = await window.supabaseClient.auth.getSession();
        if (!session?.session?.user?.id) {
            console.warn('[Settings] No active session, skipping cloud sync');
            return;
        }

        const userId = session.session.user.id;
        const recordId = `${userId}_profiles`;

        // Prepare data for Supabase
        const appData = {
            displayName: username,
            photoURL: avatar,
            status: 'Activo',
            metabolicProfile: {
                age: settings.age,
                gender: settings.gender,
                height: settings.height,
                weight: settings.weight,
                activity: settings.activity,
                protocol: settings.protocol,
                ifProtocol: settings.ifProtocol,
                goalDeficit: settings.goalDeficit,
                purineLimit: settings.purineLimit,
                macros: settings.macros
            },
            identity: settings.identity,
            activeProfile: localStorage.getItem('aureus_active_user') ? JSON.parse(localStorage.getItem('aureus_active_user')).name : 'Guest'
        };

        // Upsert to user_data table
        const { error } = await window.supabaseClient
            .from('user_data')
            .upsert({
                id: recordId,
                app_data: appData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error('[Settings] Supabase sync error:', error);
        } else {
            console.log('✅ Settings synced to Supabase');
        }
    } catch (err) {
        console.error('[Settings] Error syncing to Supabase:', err);
    }
}

function gatherSettings(elements) {
    const age = parseInt(elements.inputs.age.value) || 34;
    const gender = elements.inputs.gender.value;
    const height = parseFloat(elements.inputs.height.value) || 178;
    const weight = parseFloat(elements.inputs.weight.value) || 82.5;
    const activity = parseFloat(elements.inputs.activity.value) || 1.55;

    // Recalculate targets for storage
    let bmr = (gender === 'male')
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    const tdee = bmr * activity;
    // Maintenance (as requested)
    const targetCals = Math.round(tdee);

    return {
        age,
        gender,
        height,
        weight,
        activity,
        protocol: document.querySelector('.protocol-chip.active')?.dataset.protocol || 'standard',
        ifProtocol: document.querySelector('.if-item.active')?.dataset.if || '16:8',
        goalDeficit: window.currentGoalDeficit || 0,
        purineLimit: (() => {
            const s = localStorage.getItem(getUserKey('aureus_user_settings'));
            return s ? (JSON.parse(s).purineLimit || 800) : 800;
        })(),
        macroRatios: window.currentMacroRatios || { fat: 0.70, protein: 0.25, carb: 0.05 },
        appearance: {
            accent: document.querySelector('.color-orb.active')?.dataset.color || 'aureus',
            theme: document.querySelector('.theme-card.active')?.dataset.theme || 'dark',
            glass: elements.appearance.glassToggle?.checked || false,
            radius: parseInt(elements.appearance.radiusSlider?.value) || 16,
            font: document.querySelector('.font-chip.active')?.dataset.font || 'Outfit'
        },
        // New: Saved calculated targets
        targets: {
            calories: Math.round(tdee - (window.currentGoalDeficit || 0)),
            fat: Math.round(((tdee - (window.currentGoalDeficit || 0)) * (window.currentMacroRatios?.fat || 0.70)) / 9),
            prot: Math.round(((tdee - (window.currentGoalDeficit || 0)) * (window.currentMacroRatios?.protein || 0.25)) / 4),
            carb: Math.round(((tdee - (window.currentGoalDeficit || 0)) * (window.currentMacroRatios?.carb || 0.05)) / 4)
        }
    };
}

function syncUIWithSettings(elements, settings) {
    elements.inputs.age.value = settings.age;
    elements.inputs.gender.value = settings.gender;
    elements.inputs.height.value = settings.height;
    elements.inputs.weight.value = settings.weight;
    elements.inputs.activity.value = settings.activity;

    // Trigger activity label update
    elements.inputs.activity.dispatchEvent(new Event('input'));

    // Chips
    if (elements.chips.protocols) {
        elements.chips.protocols.forEach(c => {
            if (c.dataset.protocol === settings.protocol) c.classList.add('active');
            else c.classList.remove('active');
        });
    }


    elements.chips.ifItems.forEach(i => {
        if (i.dataset.if === settings.ifProtocol) i.classList.add('active');
        else i.classList.remove('active');
    });

    // Appearance Sync
    const appearance = settings.appearance || { accent: 'aureus', theme: 'dark' };

    elements.chips.colorOrbs.forEach(orb => {
        if (orb.dataset.color === appearance.accent) orb.classList.add('active');
        else orb.classList.remove('active');
    });

    elements.chips.themeCards.forEach(card => {
        if (card.dataset.theme === appearance.theme) card.classList.add('active');
        else card.classList.remove('active');
    });

    elements.chips.fontChips.forEach(chip => {
        if (chip.dataset.font === (appearance.font || 'Outfit')) chip.classList.add('active');
        else chip.classList.remove('active');
    });

    if (elements.appearance.glassToggle) {
        elements.appearance.glassToggle.checked = appearance.glass !== false;
    }

    if (elements.appearance.radiusSlider) {
        const r = appearance.radius || 16;
        elements.appearance.radiusSlider.value = r;
        if (elements.appearance.radiusVal) elements.appearance.radiusVal.innerText = r + 'px';
        document.body.style.setProperty('--app-radius', r + 'px');
    }

    // Apply to body immediately on settings load
    document.body.dataset.accent = appearance.accent;
    document.body.dataset.theme = appearance.theme;
    document.body.dataset.glass = appearance.glass !== false;
    document.body.dataset.font = appearance.font || 'Outfit';

}

function updateCalculations(elements) {
    const age = parseInt(elements.inputs.age.value) || 0;
    const gender = elements.inputs.gender.value;
    const height = parseFloat(elements.inputs.height.value) || 0;
    const weight = parseFloat(elements.inputs.weight.value) || 0;
    const activity = parseFloat(elements.inputs.activity.value) || 1.2;

    // 1. BMR (Mifflin-St Jeor)
    let bmr = 0;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // 2. TDEE
    const tdee = bmr * activity;

    // 3. Target (TDEE - Deficit)
    const targetCals = tdee - (window.currentGoalDeficit || 0);

    // 4. Update Displays
    elements.displays.bmr.innerText = Math.round(bmr).toLocaleString('en-US');
    elements.displays.tdee.innerText = Math.round(tdee).toLocaleString('en-US');
    elements.displays.targetCals.innerText = Math.round(targetCals).toLocaleString('en-US');
    elements.displays.safetyBmr.innerText = Math.round(bmr).toLocaleString('en-US');

    // 5. Update Macros (Dynamic Ratios)
    const ratios = window.currentMacroRatios || { fat: 0.70, protein: 0.25, carb: 0.05 };

    const fatTarget = (targetCals * ratios.fat) / 9;
    const protTarget = (targetCals * ratios.protein) / 4;
    const carbTarget = (targetCals * ratios.carb) / 4;

    elements.displays.targetFat.innerText = `${Math.round(fatTarget)}g`;
    elements.displays.targetProt.innerText = `${Math.round(protTarget)}g`;
    elements.displays.targetCarb.innerText = `${Math.round(carbTarget)}g`;

    // Update Percentage Labels in Legend
    document.querySelector('.legend-item .pct.lime-text').innerText = `${Math.round(ratios.fat * 100)}%`;
    document.querySelector('.legend-item .pct.grey-text').innerText = `${Math.round(ratios.protein * 100)}%`;
    document.querySelector('.legend-item .pct.dark-text').innerText = `${Math.round(ratios.carb * 100)}%`;

    // 6. Update Goal Footer
    const footerTitle = document.querySelector('.goal-title');
    const footerSub = document.querySelector('.goal-sub');
    if (footerTitle && footerSub) {
        const deficit = Math.round(tdee - targetCals);
        if (deficit > 50) {
            footerTitle.innerText = "GOAL: FAT LOSS";
            footerSub.innerText = `-${deficit.toLocaleString('en-US')}kcal daily deficit`;
        } else if (deficit < -50) {
            footerTitle.innerText = "GOAL: MUSCLE GAIN";
            footerSub.innerText = `+${Math.abs(deficit).toLocaleString('en-US')}kcal surplus`;
        } else {
            footerTitle.innerText = "GOAL: MAINTENANCE";
            footerSub.innerText = "0kcal daily deficit";
        }
    }

    // 7. Update Chart & BMI
    updateChart(fatTarget * 9, protTarget * 4, carbTarget * 4, targetCals);
    updateBMI(weight, height);
}

// --- BMI Logic ---
// --- BMI Logic ---
function updateBMI(weight, height) {
    const bmiCanvas = document.getElementById('bmiChart');
    const displayVal = document.getElementById('bmiValueDisplay');
    const displayCat = document.getElementById('bmiCategoryDisplay');
    const displayHeight = document.getElementById('bmiHeightDisplay');
    const displayWeight = document.getElementById('bmiWeightDisplay');

    if (!bmiCanvas || !displayVal) return;

    let isValid = (height > 0 && weight > 0);
    let bmi = 0;

    if (!isValid) {
        displayVal.innerText = "--";
        displayCat.innerText = "--";
        displayCat.className = "bmi-category"; // reset color
        displayHeight.innerText = "--";
        displayWeight.innerText = "--";
    } else {
        // Conversion: height is in cm
        const heightM = height / 100;
        bmi = weight / (heightM * heightM);

        // Update Text
        displayVal.innerText = bmi.toFixed(1);
        displayHeight.innerText = height;
        displayWeight.innerText = weight;

        let category = "";
        let colorClass = "";

        if (bmi < 18.5) {
            category = "UNDERWEIGHT";
            colorClass = "under";
        } else if (bmi < 25) {
            category = "NORMAL WEIGHT";
            colorClass = "normal";
        } else if (bmi < 30) {
            category = "OVERWEIGHT";
            colorClass = "over";
        } else {
            category = "OBESITY";
            colorClass = "obese";
        }

        displayCat.innerText = category;
        displayCat.className = `bmi-category ${colorClass}`;
    }

    // Always draw chart (grid + zones), pass 0s if invalid to skip dot drawing
    drawBMIChart(bmiCanvas, isValid ? bmi : 0, isValid ? weight : 0, isValid ? height : 0);
}

function drawBMIChart(canvas, userBMI, userWeight, userHeight) {
    const ctx = canvas.getContext('2d');

    // 0. High DPI Scaling (Force min 2x for ultra sharpness)
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    // Fallbacks if element is hidden/detached
    const wRaw = rect.width || canvas.clientWidth || 500;
    const hRaw = rect.height || canvas.clientHeight || 300;

    // Set actual backing store size (scaled)
    canvas.width = wRaw * dpr;
    canvas.height = hRaw * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    // Smooth drawing
    ctx.imageSmoothingEnabled = true;

    // Logical dimensions
    const w = wRaw;
    const h = hRaw;

    // Clear (using logical size)
    ctx.clearRect(0, 0, w, h);

    // FIXED Wide Range as requested
    // Height: 120cm to 230cm
    // Weight: 30kg to 160kg (Covering very thin to very heavy)
    const minH = 120, maxH = 230;
    const minW = 30, maxW = 160;

    const x = (val) => ((val - minH) / (maxH - minH)) * w;
    const y = (val) => h - ((val - minW) / (maxW - minW)) * h;

    // 1. Draw Zones with Vibrant "Neon" Gradient
    const drawZone = (minBMI, maxBMI, colorStops, borderColor) => {
        // Gradient logic
        const grd = ctx.createLinearGradient(0, h, 0, 0);
        colorStops.forEach(stop => grd.addColorStop(stop.pos, stop.color));

        ctx.fillStyle = grd;
        ctx.beginPath();

        // Top Edge (maxBMI)
        for (let pH = minH; pH <= maxH; pH += 5) {
            let pW = (maxBMI === Infinity ? 999 : maxBMI) * (pH / 100) ** 2;
            ctx.lineTo(x(pH), y(pW));
        }

        // Connect to Bottom Edge
        let wAtMaxH_minBMI = (minBMI) * (maxH / 100) ** 2;
        ctx.lineTo(x(maxH), y(wAtMaxH_minBMI));

        // Bottom Edge (minBMI) - Reverse
        for (let pH = maxH; pH >= minH; pH -= 5) {
            let pW = minBMI * (pH / 100) ** 2;
            ctx.lineTo(x(pH), y(pW));
        }

        ctx.closePath();
        ctx.fill();

        // Top Border Glow Line (if specified)
        if (borderColor) {
            ctx.save();
            ctx.shadowColor = borderColor;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let pH = minH; pH <= maxH; pH += 5) {
                let pW = (maxBMI === Infinity ? 999 : maxBMI) * (pH / 100) ** 2;
                if (pH === minH) ctx.moveTo(x(pH), y(pW));
                else ctx.lineTo(x(pH), y(pW));
            }
            ctx.stroke();
            ctx.restore();
        }
    };

    // Refined Palette (Brighter, Neon)
    // Obese (>30) - Red Glow
    drawZone(30, 100, [
        { pos: 0, color: 'rgba(153, 27, 27, 0.4)' },
        { pos: 1, color: 'rgba(239, 68, 68, 0.6)' }
    ]);

    // Overweight (25-30) - Yellow/Gold Glow
    drawZone(25, 30, [
        { pos: 0, color: 'rgba(180, 83, 9, 0.4)' },
        { pos: 1, color: 'rgba(251, 191, 36, 0.6)' }
    ], '#F59E0B'); // Top Border Glow

    // Normal (18.5-25) - Green Glow
    drawZone(18.5, 25, [
        { pos: 0, color: 'rgba(6, 95, 70, 0.4)' },
        { pos: 1, color: 'rgba(16, 185, 129, 0.6)' }
    ], '#10B981');

    // Underweight (0-18.5) - Blue Glow
    drawZone(0, 18.5, [
        { pos: 0, color: 'rgba(30, 58, 138, 0.4)' },
        { pos: 1, color: 'rgba(59, 130, 246, 0.6)' }
    ], '#3B82F6');


    // 2. Grid & Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical
    for (let i = minH; i <= maxH; i += 10) {
        ctx.moveTo(x(i), 0);
        ctx.lineTo(x(i), h);
    }
    // Horizontal
    for (let i = minW; i <= maxW; i += 10) {
        ctx.moveTo(0, y(i));
        ctx.lineTo(w, y(i));
    }
    ctx.stroke();

    // 3. Labels
    ctx.fillStyle = '#E4E4E7';
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';

    // X Axis Labels (Numbers) - Moved UP significantly to allow space for Title below
    for (let i = minH; i <= maxH; i += 10) {
        ctx.fillText(i, x(i), h - 28);
    }

    // Y Axis Labels (Numbers)
    ctx.textAlign = 'left';
    for (let i = minW + 10; i < maxW; i += 10) {
        // Skip label if it's too close to the "Peso" title on top
        if (y(i) > 30) {
            ctx.fillText(i, 8, y(i) + 4);
        }
    }

    // Axis Titles (White, Bold)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 13px Inter';
    ctx.textAlign = 'right';
    // Move Altura Title to bottom right, safely below numbers
    ctx.fillText("Altura (cm) →", w - 10, h - 6);

    ctx.save();
    // Move Peso Title to avoid top-left corner numbers
    ctx.translate(15, 15);
    ctx.textAlign = 'left';
    ctx.fillText("Peso (kg)", 0, 0);
    ctx.restore();

    // 4. Legend (Top Left Overlay) - Moved RIGHT to 50 to separate from Y-axis #s
    const drawLegend = () => {
        const lx = 50, ly = 40;
        const lw = 100, lh = 75;

        // Box Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 6);
        ctx.fill();

        // Items
        const items = [
            { color: '#EF4444', label: 'Obesidad' },
            { color: '#FBBF24', label: 'Sobrepeso' },
            { color: '#10B981', label: 'Peso Normal' },
            { color: '#3B82F6', label: 'Bajo peso' }
        ];

        ctx.font = '500 10px Inter';
        ctx.textAlign = 'left';

        items.forEach((item, idx) => {
            const rowY = ly + 14 + (idx * 16);
            // Color Square
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.roundRect(lx + 8, rowY - 8, 8, 8, 2);
            ctx.fill();

            // Text
            ctx.fillStyle = '#fff';
            ctx.fillText(item.label, lx + 22, rowY);
        });
    };
    drawLegend();

    // 5. User Point (Super Bright White Orb)
    if (userHeight >= minH && userHeight <= maxH && userWeight >= minW && userWeight <= maxW) {
        const px = x(userHeight);
        const py = y(userWeight);

        // Strong Outer White Glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'white';

        // Core Dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Optional: Pulse Ring effect (Static for now)
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.stroke();
    }
}

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

// --- Goal Modal Logic ---
function openGoalModal() {
    const existing = document.querySelector('.goal-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'goal-modal-overlay';

    // Helper to check equality
    const currentDeficit = window.currentGoalDeficit || 0;
    const currentRatios = window.currentMacroRatios || { fat: 0.70, protein: 0.25, carb: 0.05 };
    const isRatioEq = (r1, r2) => r1 && r2 && r1.fat === r2.fat && r1.protein === r2.protein && r1.carb === r2.carb;

    let htmlOptions = GOAL_PROFILES.map((p, index) => {
        const isActive = (p.deficit === currentDeficit) && isRatioEq(p.ratio, currentRatios);
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

    htmlOptions += `
        <div class="goal-option-btn rich" id="btnCustomMacros">
            <div class="opt-left">
                <div class="opt-title">📊 Custom Macro Ratios</div>
                <div class="opt-desc">Define Your Own Fat, Protein, and Carb percentages.</div>
            </div>
            <div class="opt-right"><span class="val-tag">% % %</span></div>
        </div>
        <div class="goal-option-btn rich" id="btnCustomGoal">
            <div class="opt-left">
                <div class="opt-title">⚙️ Custom Deficit</div>
                <div class="opt-desc">Define tu propio déficit calórico manualmente.</div>
            </div>
            <div class="opt-right"><span class="val-tag">...</span></div>
        </div>
    `;

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
            setGoal(p.deficit, p.ratio);
        });
    });

    const customMacrosBtn = overlay.querySelector('#btnCustomMacros');
    if (customMacrosBtn) customMacrosBtn.addEventListener('click', () => setCustomMacros());

    const customBtn = overlay.querySelector('#btnCustomGoal');
    if (customBtn) customBtn.addEventListener('click', () => setCustomGoal());

    const closeBtn = overlay.querySelector('#btnCloseGoal');
    if (closeBtn) closeBtn.addEventListener('click', () => closeGoalModal());

    window.closeGoalModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    window.setGoal = (deficit, ratios) => {
        try {
            console.log("Setting goal:", deficit, ratios);
            window.currentGoalDeficit = deficit;
            if (ratios) window.currentMacroRatios = ratios;

            // Trigger update to UI (Calculations)
            const elements = {
                inputs: {
                    age: document.getElementById('inputAge'),
                    gender: document.getElementById('inputGender'),
                    height: document.getElementById('inputHeight'),
                    weight: document.getElementById('inputWeight'),
                    activity: document.getElementById('activitySlider')
                },
                displays: {
                    bmr: document.getElementById('bmrValue'),
                    tdee: document.getElementById('tdeeValue'),
                    targetCals: document.getElementById('targetCalsDisplay'),
                    targetFat: document.getElementById('targetFatGrams'),
                    targetProt: document.getElementById('targetProtGrams'),
                    targetCarb: document.getElementById('targetCarbGrams'),
                    safetyBmr: document.getElementById('safetyBmr')
                }
            };

            // Validate elements exist
            if (!elements.inputs.age) throw new Error("Settings inputs not found");

            updateCalculations(elements);

            // AUTO-SAVE LOGIC
            const fullElements = {
                inputs: elements.inputs,
                chips: {
                    protocols: document.querySelectorAll('.protocol-chip'),
                    ifItems: document.querySelectorAll('.if-item')
                },
                appearance: {
                    glassToggle: document.getElementById('checkGlass'),
                    radiusSlider: document.getElementById('radiusSlider'),
                    radiusVal: document.getElementById('radiusVal')
                }
            };

            const newSettings = gatherSettings(fullElements);
            saveSettings(newSettings);
            syncLogTargets(newSettings);
            window.dispatchEvent(new CustomEvent('settings-saved'));

            showToast("Objetivo guardado.");
            closeGoalModal();
        } catch (e) {
            console.error("Set Goal Error:", e);
            alert("Error saving goal: " + e.message);
        }
    };

    window.setCustomGoal = () => {
        const val = prompt("Ingresa el déficit calórico (positivo para perder, negativo para ganar):", window.currentGoalDeficit || "500");
        if (val !== null) {
            const num = parseInt(val);
            if (!isNaN(num)) setGoal(num, window.currentMacroRatios);
        }
    };

    window.setCustomMacros = () => {
        const current = window.currentMacroRatios || { fat: 0.70, protein: 0.25, carb: 0.05 };

        const fatStr = prompt("Fat % (e.g. 30):", (current.fat * 100).toFixed(0));
        if (fatStr === null) return;

        const protStr = prompt("Protein % (e.g. 40):", (current.protein * 100).toFixed(0));
        if (protStr === null) return;

        const carbStr = prompt("Carb % (e.g. 30):", (current.carb * 100).toFixed(0));
        if (carbStr === null) return;

        const f = parseInt(fatStr);
        const p = parseInt(protStr);
        const c = parseInt(carbStr);

        if (isNaN(f) || isNaN(p) || isNaN(c)) {
            alert("Please enter valid numbers.");
            return;
        }

        if ((f + p + c) !== 100) {
            alert(`The sum of percentages must be 100. Your current total is ${f + p + c}%.`);
            return;
        }

        const newRatios = {
            fat: f / 100,
            protein: p / 100,
            carb: c / 100
        };

        setGoal(window.currentGoalDeficit, newRatios);
    };
}

function updateChart(fatCals, protCals, carbCals, totalCals) {
    const ctx = document.getElementById('settingMacroChart');
    if (!ctx) return;

    const data = {
        datasets: [{
            data: [fatCals, protCals, carbCals],
            backgroundColor: ['#D4F458', '#71717a', '#27272a'],
            borderWidth: 0,
            cutout: '80%',
            borderRadius: 10
        }]
    };

    if (window.settingChart) {
        window.settingChart.data = data;
        window.settingChart.update();
    } else {
        LazyLoader.load('chartjs').then(() => {
            if (window.settingChart) return; // Prevent double init
            window.settingChart = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    cutout: '80%'
                }
            });
        }).catch(err => console.error("Chart.js load failed in settings", err));
    }
}

// Global Sync
function syncLogTargets(settings) {
    // Also save to today's log if it exists
    // FIX: Use Local Time to match script.js and food-log-renderer.js
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const logKey = getUserKey(`aureus_log_${year}-${month}-${day}`);

    // Read or init
    const stored = localStorage.getItem(logKey);
    let logData = stored ? JSON.parse(stored) : { meals: {}, targets: {} };

    // Apply new targets
    if (settings.targets) {
        logData.targets = { ...settings.targets };
    }

    localStorage.setItem(logKey, JSON.stringify(logData));
    localStorage.setItem(getUserKey('aureus_targets_updated'), Date.now());
    window.dispatchEvent(new Event('storage'));
}



