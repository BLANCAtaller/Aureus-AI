document.addEventListener('DOMContentLoaded', () => {
    // Inject Auth Styles
    if (!document.getElementById('auth-styles-link')) {
        const link = document.createElement('link');
        link.id = 'auth-styles-link';
        link.rel = 'stylesheet';
        link.href = 'auth-styles.css';
        document.head.appendChild(link);
    }

    migrateLegacyData(); // Migrate old data to default user
    fixAvatarPaths(); // Fix old avatar paths in localStorage
    applyGlobalAppearance();
    initGlobalSync();
    initGlobalUserSwitcher();
    initLockScreen(); // New Auth Entry Point

    // Initialize Real-time Subscriptions if Supabase is available
    if (window.subscribeToSupabase) {
        window.subscribeToSupabase();
    }
});

/**
 * Helper to normalize avatar paths across different sub-apps
 */
function normalizeAvatarPath(path) {
    if (!path) return 'images/users/item_profile.webp';
    if (path.startsWith('data:')) return path;

    // Hardened selection for standard users
    const currentUser = window.getActiveUser ? window.getActiveUser() : 'Guest';
    if (currentUser === 'Jesus Rodriguez' || (path && path.includes('BlindSnk'))) {
        path = 'images/users/BlindSnk.webp';
    } else if (currentUser === 'Gio' || (path && path.includes('gio_profile'))) {
        path = 'images/users/gio_profile.webp';
    }

    // Scrub Guest.png from path
    if (path && path.includes('Guest.png')) {
        path = 'images/users/item_profile.webp';
    }

    const isFitAI = decodeURIComponent(window.location.pathname).includes('AUREUS FIT AI');

    if (isFitAI) {
        // Fit AI has local 'images/' folder. If path starts with 'assets/images/', strip 'assets/' for local use
        if (path.startsWith('assets/images/')) {
            return path.replace('assets/', '');
        }
        // For other assets, go up to common root
        if (path.startsWith('assets/')) {
            return '../' + path;
        }
        return path;
    } else {
        // Root or Finance AI
        if (path.startsWith('images/')) {
            // Point to sibling AUREUS FIT AI folder where images live
            return '../AUREUS FIT AI/' + path;
        }
        return path;
    }
}

/**
 * Fix for broken avatar paths (404 error)
 * Updates 'images/item_profile.webp' -> 'images/users/item_profile.webp'
 */
function fixAvatarPaths() {
    try {
        // 1. Fix Active User
        const activeUserJson = localStorage.getItem('aureus_active_user');
        if (activeUserJson) {
            let user = JSON.parse(activeUserJson);
            if (user.avatar === 'images/item_profile.png' || user.avatar === 'images/item_profile.webp') {
                console.log('Fixing active user avatar path...');
                user.avatar = 'images/users/item_profile.webp';
                localStorage.setItem('aureus_active_user', JSON.stringify(user));
            }
            // 1.1 Legacy replacement cleanup
            if (user.avatar && user.avatar.includes('Guest.png')) {
                console.log('Replacing legacy guest avatar with default...');
                user.avatar = 'assets/images/users/item_profile.png';
                localStorage.setItem('aureus_active_user', JSON.stringify(user));
            }
        }

        // 2. Fix Custom Users List
        const customUsersJson = localStorage.getItem('aureus_custom_users');
        if (customUsersJson) {
            let users = JSON.parse(customUsersJson);
            let changed = false;
            users.forEach(u => {
                if (u.avatar === 'images/item_profile.png' || u.avatar === 'images/item_profile.webp') {
                    u.avatar = 'images/users/item_profile.webp';
                    changed = true;
                }
                if (u.avatar && u.avatar.includes('Guest.png')) {
                    u.avatar = 'assets/images/users/item_profile.png';
                    changed = true;
                }
            });
            if (changed) {
                console.log('Fixing custom users avatar paths...');
                localStorage.setItem('aureus_custom_users', JSON.stringify(users));
            }
        }
    } catch (e) {
        console.error("Error fixing avatar paths:", e);
    }
}

/**
 * Global User Key Utility
 * Returns a namespaced key for localStorage based on the current active user.
 */
window.getActiveUser = () => {
    const saved = localStorage.getItem('aureus_active_user');
    if (saved) {
        try {
            const u = JSON.parse(saved);
            return u.name || 'Guest';
        } catch (e) { }
    }
    return 'Guest';
};

/**
 * Returns a stable identifier for the active user (id if available, fallback to name)
 */
window.getActiveUserId = () => {
    const saved = localStorage.getItem('aureus_active_user');
    if (saved) {
        try {
            const u = JSON.parse(saved);
            return u.id || u.name || 'Guest';
        } catch (e) { }
    }
    return 'Guest';
};

window.getUserKey = (baseKey) => {
    const userId = window.getActiveUserId();
    // Special case for the active user key itself
    if (baseKey === 'aureus_active_user') return baseKey;
    if (baseKey === 'aureus_custom_users') return baseKey;
    return `${userId}_${baseKey}`;
};

/**
 * Migration: Assign profile IDs to existing users that don't have one
 * Maps names to user1/user2 based on known profile names
 */
(function migrateUserIds() {
    // Map known profile names to IDs
    const nameToIdMap = {
        'Jesus Rodriguez': 'user1',
        'Gio': 'user2',
        'Invitado': 'user1',
        'Usuario 2': 'user2'
    };

    // Migrate active user
    const savedUser = localStorage.getItem('aureus_active_user');
    if (savedUser) {
        try {
            const u = JSON.parse(savedUser);
            if (!u.id && u.name) {
                u.id = nameToIdMap[u.name] || 'user1';
                localStorage.setItem('aureus_active_user', JSON.stringify(u));
                console.log(`✅ Migrated active user "${u.name}" to id: ${u.id}`);
            }
        } catch (e) { }
    }

    // Migrate custom users list
    const customUsersKey = 'aureus_custom_users';
    const customUsers = localStorage.getItem(customUsersKey);
    if (customUsers) {
        try {
            const users = JSON.parse(customUsers);
            let migrated = false;
            users.forEach((u, idx) => {
                if (!u.id && u.name) {
                    u.id = nameToIdMap[u.name] || (idx === 0 ? 'user1' : 'user2');
                    migrated = true;
                    console.log(`✅ Migrated custom user "${u.name}" to id: ${u.id}`);
                }
            });
            if (migrated) {
                localStorage.setItem(customUsersKey, JSON.stringify(users));
            }
        } catch (e) { }
    }
})();

/**
 * Optimized DB Loader: Merges static food-data.js with user-specific modifications/custom items from localStorage.
 */
window.getAureusFoodDB = () => {
    // 1. Get static DB from memory
    let baseDb = (typeof foodDatabase !== 'undefined') ? JSON.parse(JSON.stringify(foodDatabase)) : [];

    // 2. Get Delta from LocalStorage (Custom items, modifications, favorites)
    const storageKey = window.getUserKey('aureus_food_db');
    const stored = localStorage.getItem(storageKey);
    if (!stored) return baseDb;

    try {
        const delta = JSON.parse(stored);
        if (!Array.isArray(delta)) return baseDb;

        // 3. Merge Delta into Base
        const baseMap = new Map();
        baseDb.forEach((item, idx) => baseMap.set(item.name.toLowerCase().trim(), idx));

        delta.forEach(item => {
            const name = item.name.toLowerCase().trim();
            if (baseMap.has(name)) {
                // Update existing item with user modifications (favourites, personalized macros, etc.)
                const idx = baseMap.get(name);
                baseDb[idx] = { ...baseDb[idx], ...item };
            } else {
                // Add completely new user-created items
                baseDb.push(item);
            }
        });

        return baseDb;
    } catch (e) {
        console.error("Error merging food DB delta:", e);
        return baseDb;
    }
};

/**
 * Optimized DB Saver: Only persists modifications, favorites, and custom items to localStorage.
 */
window.saveAureusFoodDB = (fullDb, customKey = null) => {
    const targetKey = customKey || window.getUserKey('aureus_food_db');

    if (typeof foodDatabase === 'undefined') {
        localStorage.setItem(targetKey, JSON.stringify(fullDb));
        return;
    }

    const systemItemsMap = new Map();
    foodDatabase.forEach(item => systemItemsMap.set(item.name.toLowerCase().trim(), item));

    const delta = fullDb.filter(item => {
        const name = item.name.toLowerCase().trim();
        const systemItem = systemItemsMap.get(name);

        if (!systemItem) return true; // Custom item, must save

        // Modified or Favorite, must save
        if (item.favourite) return true;
        if (item.custom) return true;

        // Structural check for modifications
        if (item.cal !== systemItem.cal || item.carb !== systemItem.carb ||
            item.prot !== systemItem.prot || item.fat !== systemItem.fat ||
            item.purines !== systemItem.purines || item.gi !== systemItem.gi ||
            item.status !== systemItem.status || item.icon !== systemItem.icon ||
            item.image !== systemItem.image) {
            return true;
        }

        return false;
    });

    try {
        localStorage.setItem(targetKey, JSON.stringify(delta));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn("Storage Quota Exceeded! Attempting emergency favorite-only save.");
            const ultraDelta = delta.filter(i => i.favourite);
            localStorage.setItem(targetKey, JSON.stringify(ultraDelta));
        } else {
            console.error("Failed to save food DB:", e);
        }
    }
};

window.logout = () => {
    console.log("Logging out...");

    // 1. Clear Local Session
    localStorage.removeItem('aureus_active_user');

    // 2. Define Redirect Target (Handle root vs subdir)
    // If we are deep in AUREUS FIT AI/, we need to go up.
    // If we are at root (unlikely for this file), we go straight to file.
    let targetUrl = '../login.html';

    // Simple check: if current path doesn't have 'AUREUS FIT AI', maybe we are at root?
    // But usually this script is used by apps inside the folder. 
    // We'll trust the relative path for now or check document location.
    if (window.location.pathname.endsWith('dashboard-select.html') || window.location.pathname.endsWith('user-selection.html')) {
        targetUrl = 'login.html'; // We are already at root
    }

    // 3. Sign Out of Supabase
    if (window.supabaseClient) {
        window.supabaseClient.auth.signOut().then(() => {
            console.log("✅ Supabase Signed Out");
            window.location.href = targetUrl;
        }).catch((error) => {
            console.error("Supabase Sign Out Error:", error);
            window.location.href = targetUrl;
        });
    } else {
        // Fallback if Auth not loaded
        console.warn("⚠️ Supabase Client not found, forcing local logout.");
        window.location.href = targetUrl;
    }
};

/**
 * Migration Utility
 * Moves old data (un-namespaced) to the default user 'Guest'
 */
function migrateLegacyData() {
    // Determine the target user (ID is preferred for stability, name as fallback)
    const targetUser = window.getActiveUserId ? window.getActiveUserId() : 'Guest';

    const keysToMigrate = [
        'aureus_user_settings',
        'aureus_hydration',
        'aureus_fasting_state',
        'aureus_weekly_plan',
        'aureus_plan_templates',
        'aureus_food_db',
        'aureus_db_version',
        'aureus_gl_limit'
    ];

    console.log(`🚀 Migrating legacy data to profile: ${targetUser}`);

    // 1. Specific Keys
    keysToMigrate.forEach(key => {
        const oldVal = localStorage.getItem(key);
        const newKey = `${targetUser}_${key}`;
        if (oldVal !== null) {
            // Only migrate if the new namespaced key doesn't have data yet
            if (localStorage.getItem(newKey) === null) {
                console.log(`Migrating ${key} to ${newKey}`);
                localStorage.setItem(newKey, oldVal);
            }
            // Proactively remove legacy key to free space
            localStorage.removeItem(key);
        }
    });

    // 2. Dynamic Log Keys (aureus_log_YYYY-MM-DD)
    const logsToMove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aureus_log_') && !key.includes('_aureus_log_')) {
            logsToMove.push(key);
        }
    }

    logsToMove.forEach(key => {
        const oldVal = localStorage.getItem(key);
        const newKey = `${targetUser}_${key}`;
        if (localStorage.getItem(newKey) === null) {
            console.log(`Migrating log ${key} to ${newKey}`);
            localStorage.setItem(newKey, oldVal);
        }
        localStorage.removeItem(key);
    });

    // 3. Final Storage Sanitization (Delta convert old full DBs)
    cleanupAureusStorage();

    // 4. Remediation: If we accidentally moved data to 'Guest' while a user was active
    remediateGuestMigration();
}

/**
 * Remediation Utility
 * If a user is logged in but their data was accidentally migrated to 'Guest',
 * this moves it back to their correctly namespaced profile.
 */
function remediateGuestMigration() {
    const activeUser = getActiveUserId();
    if (activeUser === 'Guest') return;

    const keysToCheck = [
        'aureus_user_settings',
        'aureus_hydration',
        'aureus_fasting_state',
        'aureus_weekly_plan',
        'aureus_plan_templates',
        'aureus_food_db',
        'aureus_db_version',
        'aureus_gl_limit'
    ];

    console.log(`🔍 Checking for misplaced data for ${activeUser}...`);

    keysToCheck.forEach(key => {
        const guestKey = `Guest_${key}`;
        const userKey = `${activeUser}_${key}`;
        const guestVal = localStorage.getItem(guestKey);

        if (guestVal && localStorage.getItem(userKey) === null) {
            console.log(`♻️ Restoring misplaced Guest data to user: ${userKey}`);
            localStorage.setItem(userKey, guestVal);
            // Optionally remove Guest data if it was clearly part of the accidental migration
            // localStorage.removeItem(guestKey);
        }
    });

    // Remediate Logs
    const guestLogs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('Guest_aureus_log_')) {
            guestLogs.push(key);
        }
    }

    guestLogs.forEach(gKey => {
        const userLogKey = gKey.replace('Guest_', `${activeUser}_`);
        if (localStorage.getItem(userLogKey) === null) {
            console.log(`♻️ Restoring misplaced log: ${userLogKey}`);
            localStorage.setItem(userLogKey, localStorage.getItem(gKey));
        }
    });
}

/**
 * Proactive Storage Sanitizer: Converts full DB clones to deltas and clears orphaned data.
 */
function cleanupAureusStorage() {
    console.log("🧹 Running AUREUS Storage Sanitizer...");
    const keysToRemove = [];
    const dbKeysToCheck = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Collect orphaned or legacy un-namespaced keys
        // Whitelist essential session/auth keys to prevent accidental logouts or config loss
        const whitelist = [
            'aureus_active_user',
            'aureus_custom_users',
            'aureus_current_user_email',
            'aureus_current_user_id',
            'aureus_user_identity',
            'aureus_is_sync_enabled',
            'aureus_last_sync',
            'aureus_user_role',
            'aureus_trial_start',
            'aureus_auth_token',
            'aureus_appearance'
        ];

        if (key.startsWith('aureus_') && !whitelist.includes(key)) {
            // Additional safety: don't delete if it's already properly namespaced in this user session
            const currentUserId = window.getActiveUserId ? window.getActiveUserId() : 'Guest';
            if (key.startsWith(`${currentUserId}_`)) continue;

            keysToRemove.push(key);
            continue;
        }

        if (key.endsWith('_aureus_food_db')) {
            dbKeysToCheck.push(key);
        }
    }

    // Remove duplicates/orphans
    keysToRemove.forEach(k => {
        console.log(`Removing legacy key: ${k}`);
        localStorage.removeItem(k);
    });

    // Delta-ify large Food DBs (Legacy users might still have full 5MB clones)
    dbKeysToCheck.forEach(key => {
        try {
            const val = localStorage.getItem(key);
            if (!val) return;
            const db = JSON.parse(val);
            if (Array.isArray(db) && db.length > 300) {
                console.log(`Optimizing large DB entry: ${key}`);
                if (window.saveAureusFoodDB) {
                    window.saveAureusFoodDB(db, key);
                }
            }
        } catch (e) {
            console.warn(`Failed to sanitize DB key ${key}:`, e);
        }
    });
}

/**
 * Global Switch User Function
 * Must be defined globally before initGlobalUserSwitcher
 */
window.switchUser = (userId, userName, userAvatar, isInitial = false) => {
    // Check if there's actually an active user in localStorage
    const savedUser = localStorage.getItem('aureus_active_user');
    const hasActiveUser = savedUser !== null;

    // Only return early if:
    // 1. There IS an active user session
    // 2. It's not the initial load
    // 3. User is clicking the same user they're already logged in as
    if (hasActiveUser && !isInitial && savedUser) {
        try {
            const currentUserObj = JSON.parse(savedUser);
            if (currentUserObj.name === userName) {
                return; // Same user, do nothing
            }
        } catch (e) {
            console.error("Error parsing saved user:", e);
        }
    }

    // Update UI elements if they exist
    const currentUserNameEl = document.getElementById('currentUserName');
    const currentAvatarEl = document.getElementById('currentAvatar');
    const drawerUserNameEl = document.getElementById('drawerUserName');
    const drawerAvatarEl = document.getElementById('drawerAvatar');
    const greetingNameEl = document.querySelector('.greeting-container h1');
    const userOptions = document.querySelectorAll('.user-option');

    // New Profile UI Elements in Popover
    const popoverNameEl = document.getElementById('popoverName');
    const popoverAvatarEl = document.getElementById('popoverAvatar');

    const normalizedAvatar = normalizeAvatarPath(userAvatar);

    if (currentUserNameEl) currentUserNameEl.innerText = userName;

    // Hardened selection for standard users in FIT AI
    let finalAvatar = normalizedAvatar;
    if (userName === 'Jesus Rodriguez') {
        finalAvatar = 'images/users/BlindSnk.webp';
    } else if (userName === 'Gio') {
        finalAvatar = 'images/users/gio_profile.webp';
    }

    if (currentAvatarEl) currentAvatarEl.src = finalAvatar;
    if (drawerUserNameEl) drawerUserNameEl.innerText = userName;
    if (drawerAvatarEl) drawerAvatarEl.src = finalAvatar;

    // Update Popover Footer
    if (popoverNameEl) popoverNameEl.innerText = userName;
    if (popoverAvatarEl) popoverAvatarEl.src = normalizedAvatar;

    if (greetingNameEl) {
        const spanName = document.getElementById('greetingUserName');
        if (spanName) {
            spanName.innerText = userName;
        } else if (greetingNameEl.innerText.toLowerCase().includes('hello') || greetingNameEl.innerText.toLowerCase().includes('¡hola')) {
            // Fallback: update innerHTML but try to preserve dot
            greetingNameEl.innerHTML = `Hello, ${userName} <span class="dot">.</span>`;
        }
    }

    // Update Popover Active State
    userOptions.forEach(opt => {
        opt.classList.remove('current');
        const check = opt.querySelector('.fa-check');
        if (check) check.remove();

        if (opt.dataset.user === userName) {
            opt.classList.add('current');
            const checkIcon = document.createElement('i');
            checkIcon.className = "fa-solid fa-check";
            checkIcon.style.cssText = "margin-left: auto; color: var(--primary-lime);";
            opt.appendChild(checkIcon);
        }
    });

    // Save current user to localStorage
    if (!isInitial) {
        localStorage.setItem('aureus_active_user', JSON.stringify({ id: userId, name: userName, avatar: userAvatar }));

        // Reload the page to ensure all data for the new user is loaded
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
};

function initGlobalUserSwitcher() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const drawerUserProfileBtn = document.getElementById('drawerUserProfileBtn');
    const userSwitcherPopover = document.getElementById('userSwitcherPopover');
    const userOptions = document.querySelectorAll('.user-option');
    const currentUserNameEl = document.getElementById('currentUserName');
    const currentAvatarEl = document.getElementById('currentAvatar');
    const greetingNameEl = document.querySelector('.greeting-container h1');

    if ((userProfileBtn || drawerUserProfileBtn) && userSwitcherPopover) {
        // --- DYNAMIC USERS LOGIC ---
        const CUSTOM_USERS_KEY = 'aureus_custom_users';
        // const addUserBtn = userSwitcherPopover.querySelector('.add-user-option');
        const popoverDivider = userSwitcherPopover.querySelector('.popover-divider');

        function loadCustomUsers() {
            const stored = localStorage.getItem(CUSTOM_USERS_KEY);
            return stored ? JSON.parse(stored) : [];
        }

        function saveCustomUser(id, name, avatar) {
            const users = loadCustomUsers();
            if (!users.find(u => u.id === id)) {
                users.push({ id, name, avatar });
                localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
                return true;
            }
            return false;
        }

        function renderCustomUsers() {
            // Remove existing dynamic ones (if any) to avoid duplicates on multi-init
            userSwitcherPopover.querySelectorAll('.user-option.dynamic').forEach(el => el.remove());

            const customUsers = loadCustomUsers();
            const currentUser = getActiveUser();

            customUsers.forEach(u => {
                // Show all profiles, don't filter by current user
                // if (u.name !== currentUser) return;

                const opt = document.createElement('div');
                opt.className = 'user-option dynamic';
                opt.dataset.user = u.name;
                opt.dataset.avatar = u.avatar;
                opt.innerHTML = `
                    <img src="${u.avatar}" alt="${u.name}">
                    <span class="name">${u.name}</span>
                    <i class="fa-solid fa-trash-can btn-remove-user" style="margin-left: auto; opacity: 0.3; font-size: 11px; padding: 5px;"></i>
                `;

                // Switch User Listener
                opt.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-remove-user')) return;
                    e.stopPropagation();
                    switchUser(u.id, u.name, u.avatar);
                    userSwitcherPopover.classList.remove('active');
                });

                // Remove User Listener
                const removeBtn = opt.querySelector('.btn-remove-user');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`¿Estás seguro de que quieres eliminar la cuenta de ${u.name}?`)) {
                        removeUser(u.name);
                    }
                });

                if (popoverDivider) {
                    userSwitcherPopover.insertBefore(opt, popoverDivider);
                }
            });

            // Re-sync the 'current' checkmark
            const activeSessionUser = getActiveUser();
            userSwitcherPopover.querySelectorAll('.user-option').forEach(opt => {
                opt.classList.remove('current');
                const check = opt.querySelector('.fa-check');
                if (check) check.remove();

                if (opt.dataset.user === activeSessionUser) {
                    opt.classList.add('current');
                    const checkIcon = document.createElement('i');
                    checkIcon.className = "fa-solid fa-check";
                    checkIcon.style.cssText = "margin-left: auto; color: var(--primary-lime);";
                    opt.appendChild(checkIcon);
                }
            });
        }

        /* 
        if (addUserBtn) {
            addUserBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userSwitcherPopover.classList.remove('active');
                // Trigger the Lock Screen's Create User flow by logging out
                if (confirm("Para agregar una cuenta nueva desde cero, cerraremos la sesión actual. ¿Continuar?")) {
                    logout();
                }
            });
        }
        */

        // Add Logout Option to Popover if it doesn't exist
        if (!userSwitcherPopover.querySelector('.logout-option')) {
            const logoutOpt = document.createElement('div');
            logoutOpt.className = 'add-user-option logout-option';
            logoutOpt.style.color = '#EF4444';
            logoutOpt.innerHTML = `
                <i class="fa-solid fa-right-from-bracket" style="background: rgba(239, 68, 68, 0.1); color: #EF4444;"></i>
                <span>Cerrar sesión</span>
            `;
            logoutOpt.addEventListener('click', (e) => {
                e.stopPropagation();
                logout();
            });
            userSwitcherPopover.appendChild(logoutOpt);
        }

        // Initial filter for hardcoded users (Only show the active one in the sidebar)
        const initialActive = getActiveUser();
        userSwitcherPopover.querySelectorAll('.user-option:not(.dynamic)').forEach(opt => {
            if (opt.dataset.user !== initialActive) {
                opt.style.display = 'none';
            } else {
                opt.style.display = 'flex';
                opt.classList.add('current');
                if (!opt.querySelector('.fa-check')) {
                    const checkIcon = document.createElement('i');
                    checkIcon.className = "fa-solid fa-check";
                    checkIcon.style.cssText = "margin-left: auto; color: var(--primary-lime);";
                    opt.appendChild(checkIcon);
                }
            }
        });

        renderCustomUsers();
        // --- END DYNAMIC USERS ---

        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userSwitcherPopover.classList.toggle('active');
            });
        }

        if (drawerUserProfileBtn) {
            drawerUserProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userSwitcherPopover.classList.toggle('active');
            });
        }

        document.addEventListener('click', () => {
            userSwitcherPopover.classList.remove('active');
        });

        // Static options (the ones hardcoded in HTML)
        const staticOptions = userSwitcherPopover.querySelectorAll('.user-option:not(.dynamic)');
        staticOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const userName = option.dataset.user;
                const userAvatar = option.dataset.avatar;
                switchUser(option.dataset.userId || 'user1', userName, userAvatar);
                userSwitcherPopover.classList.remove('active');
            });
        });

        // Load saved user (Don't reload here as it's the initial load)
        const savedUser = localStorage.getItem('aureus_active_user');
        if (savedUser) {
            try {
                const u = JSON.parse(savedUser);
                switchUser(u.id || 'user1', u.name, u.avatar, true);
            } catch (e) { }
        }

        // Listen for changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'aureus_active_user') {
                window.location.reload();
            }
            if (e.key === CUSTOM_USERS_KEY) {
                renderCustomUsers();
            }
        });
    }
}

function applyGlobalAppearance() {
    const stored = localStorage.getItem(getUserKey('aureus_user_settings'));
    if (stored) {
        try {
            const settings = JSON.parse(stored);
            if (settings.appearance) {
                const app = settings.appearance;
                document.body.dataset.accent = app.accent || 'aureus';
                document.body.dataset.theme = app.theme || 'dark';
                document.body.dataset.glass = app.glass !== false;
                document.body.dataset.font = app.font || 'Outfit';

                if (app.radius !== undefined) {
                    document.body.style.setProperty('--app-radius', app.radius + 'px');
                }
            }
        } catch (e) {
            console.error("Error applying appearance", e);
        }
    } else {
        // Defaults
        document.body.dataset.accent = 'aureus';
        document.body.dataset.theme = 'dark';
        document.body.dataset.glass = 'true';
        document.body.dataset.font = 'Outfit';
        document.body.style.setProperty('--app-radius', '16px');
    }
}

function initGlobalSync() {
    const globalSaveBtn = document.getElementById('globalSaveBtn');

    // Always listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === getUserKey('aureus_user_settings')) {
            applyGlobalAppearance();
        }
    });

    if (!globalSaveBtn) return;

    globalSaveBtn.addEventListener('click', (e) => {
        const saveEvent = new CustomEvent('aureus-global-save', {
            detail: { timestamp: new Date() },
            bubbles: true,
            cancelable: true
        });

        const wasCancelled = !document.dispatchEvent(saveEvent);

        if (!wasCancelled) {
            handleStandardSaveFeedback(globalSaveBtn);
        }
    });
}

function handleStandardSaveFeedback(btn) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> SAVING...`;
    btn.disabled = true;
    btn.style.opacity = '0.8';

    // Save to localStorage immediately, then sync to Supabase
    setTimeout(async () => {
        btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> SYNCING...`;

        // Call the centralized Supabase sync
        const syncSuccess = await syncAllDataToSupabase();

        if (syncSuccess) {
            btn.innerHTML = `<i class="fa-solid fa-check"></i> SAVED`;
            btn.classList.add('saved-success');
            showToast("✅ Data synced to cloud");
        } else {
            btn.innerHTML = `<i class="fa-solid fa-check"></i> SAVED`;
            btn.classList.add('saved-success');
            showToast("Data saved locally (cloud sync pending)");
        }

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.classList.remove('saved-success');
        }, 2000);
    }, 300);
}

function showToast(msg) {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Animate out
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
/**
 * LOCK SCREEN / AUTH ARCHITECTURE
 */
function initLockScreen() {
    console.log("🔐 FIT AI: Initializing Supabase Sync...");

    // 1. Listen for Supabase Auth Changes
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            const user = session?.user;
            if (user) {
                console.log("✅ Supabase Session Active:", user.email);

                const userData = {
                    id: user.id, // CRITICAL: Store the actual Supabase UUID
                    name: user.user_metadata?.full_name || localStorage.getItem('aureus_last_known_name') || user.email.split('@')[0],
                    email: user.email,
                    avatar: user.user_metadata?.avatar_url || 'assets/images/users/item_profile.png'
                };

                // Store last known name to avoid flickering to email
                if (user.user_metadata?.full_name) {
                    localStorage.setItem('aureus_last_known_name', user.user_metadata.full_name);
                }

                // Sync active user mapping - Preserve current profile name if it exists
                const existing = localStorage.getItem('aureus_active_user');
                let localNameOverride = null;

                if (existing) {
                    try {
                        const e = JSON.parse(existing);
                        // If the existing name is not just the email prefix, it's a valid local override
                        if (e.name && e.name !== user.email.split('@')[0]) {
                            localNameOverride = e.name;
                            userData.name = e.name;
                        }
                        if (e.avatar) userData.avatar = e.avatar;
                    } catch (err) { }
                }

                // HYBRID SYNC FALLBACK: If name is still email prefix, check user-selector local storage
                if (!localNameOverride || userData.name === user.email.split('@')[0]) {
                    // Try user1 (Perfil 1) first as it's the primary legacy profile
                    const user1Name = localStorage.getItem('aureus_name_user1');
                    if (user1Name && user1Name !== 'Invitado' && user1Name !== 'User') {
                        userData.name = user1Name;
                    } else {
                        // Check for any stored "last known name"
                        const lastKnownName = localStorage.getItem('aureus_last_known_name');
                        if (lastKnownName) userData.name = lastKnownName;
                    }
                }

                localStorage.setItem('aureus_active_user', JSON.stringify(userData));

                // Update UI immediately
                if (typeof syncSidebarProfile === 'function') {
                    syncSidebarProfile(userData.name, userData.avatar);
                }

                // If lock screen exists, remove it
                const existingLock = document.getElementById('aureusLockScreen');
                if (existingLock) {
                    existingLock.style.opacity = '0';
                    setTimeout(() => existingLock.remove(), 500);
                }

                // Load user data from Supabase (if localStorage is missing data)
                loadAllDataFromSupabase();
            } else if (event === 'SIGNED_OUT') {
                console.log("🔒 No active Supabase session found. Redirecting to login...");
                window.location.href = '../login.html';
            }
        });
    } else {
        console.error("❌ Supabase client NOT found in global-sync.js");
    }

    // 2. Listen for Cross-Tab Profile Changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'aureus_active_user' && e.newValue) {
            try {
                const userData = JSON.parse(e.newValue);
                console.log("🔄 Cross-tab profile sync detected:", userData.name);
                syncSidebarProfile(userData.name, userData.avatar);
            } catch (err) {
                console.error("Error parsing profile sync data:", err);
            }
        }
    });

    const activeUser = localStorage.getItem('aureus_active_user');
    // If user is already active in local storage, we wait for Supabase to confirm (async)
    if (activeUser) return;

    lockScreen.innerHTML = `
        <div class="auth-card">
            <img src="images/logo.webp" alt="AUREUS" class="auth-logo">
            <h1 class="auth-title">AUREUS</h1>
            <p class="auth-subtitle">Clinical Nutrition & Fit OS</p>
            
            <div class="auth-accounts" id="authAccountGrid">
                <!-- User accounts will be injected here -->
            </div>

            <div class="auth-actions" style="margin-top: 20px; opacity: 0.6;">
                <p class="auth-subtitle" style="font-size: 0.8rem;">Session managed by Supabase</p>
            </div>
            
        </div>
    `;

    document.body.appendChild(lockScreen);

    // Hide app container to prevent interaction
    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.display = 'none';

    renderLockAccounts();


}

function renderLockAccounts() {
    const grid = document.getElementById('authAccountGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Core built-in users
    const coreUsers = [
        // No hardcoded users here, depend on Hub
    ];

    const customUsers = loadCustomUsers();
    const allUsers = [...coreUsers, ...customUsers];

    allUsers.forEach(u => {
        const item = document.createElement('div');
        item.className = 'auth-account-item';
        item.innerHTML = `
            <div class="auth-avatar-wrapper">
                <img src="${u.avatar}" alt="${u.name}">
            </div>
            <div class="auth-account-name">${u.name}</div>
        `;
        item.addEventListener('click', () => {
            if (window.switchUser) {
                window.switchUser(u.id, u.name, u.avatar);
            } else {
                console.error("switchUser function not found!");
            }
        });
        grid.appendChild(item);
    });
}

// --- GLOBAL HYDRATION SYSTEM (New v7.4 - Supabase Aware) ---
window.GlobalHydration = {
    state: {
        total: 0,
        goal: 2500,
        lastUpdatedDate: null
    },

    async init() {
        // 1. Initial Load from Supabase (Granular)
        const todayStr = this.getTodayStr();
        const cloudData = window.loadGranularNutritionFromSupabase ? await window.loadGranularNutritionFromSupabase(todayStr) : null;

        if (cloudData && cloudData.hydration) {
            console.log("[Hydration] Loaded from Supabase:", cloudData.hydration);
            this.state = {
                total: cloudData.hydration.current || 0,
                goal: cloudData.hydration.goal || 2500,
                lastUpdatedDate: todayStr
            };
            this.saveToLocal(); // Cache locally
        } else {
            this.loadFromLocal();
        }

        // 2. Listen for updates from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === getUserKey('aureus_hydration')) {
                this.loadFromLocal();
                this.notifyListeners();
            }
        });
    },

    getTodayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    loadFromLocal() {
        const key = getUserKey('aureus_hydration');
        const saved = localStorage.getItem(key);
        const todayStr = this.getTodayStr();

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // DAILY RESET CHECK (Only reset total if date changed)
                const lastDate = parsed.lastUpdatedDate;
                if (lastDate && lastDate !== todayStr) {
                    this.state = {
                        total: 0,
                        goal: parsed.goal || 2500,
                        lastUpdatedDate: todayStr
                    };
                    this.saveToLocal();
                } else {
                    this.state = parsed;
                }
            } catch (e) {
                console.error("Error parsing hydration state", e);
                this.resetDefaults();
            }
        } else {
            this.resetDefaults();
        }
    },

    resetDefaults() {
        this.state = {
            total: 0,
            goal: 2500,
            lastUpdatedDate: this.getTodayStr()
        };
        this.saveToLocal();
    },

    saveToLocal() {
        localStorage.setItem(getUserKey('aureus_hydration'), JSON.stringify(this.state));
        this.notifyListeners();
    },

    async saveToCloud() {
        if (window.syncGranularNutritionToSupabase) {
            const date = this.getTodayStr();
            // Sync current state to Supabase
            await window.syncGranularNutritionToSupabase(date, { hydration: this.state });
        }
    },

    async addWater(amount) {
        this.state.total += amount;
        this.saveToLocal();
        await this.saveToCloud();
    },

    async setGoal(newGoal) {
        this.state.goal = newGoal;
        this.saveToLocal();
        await this.saveToCloud();
    },

    notifyListeners() {
        window.dispatchEvent(new CustomEvent('aureus-hydration-changed', {
            detail: this.state
        }));
    }
};

/**
 * Real-time Nutrition Subscriptions
 */
window.subscribeToSupabase = async () => {
    if (!window.supabaseClient) return;

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;

    console.log("📡 Subscribing to Nutrition updates for:", user.id);

    // 1. Subscribe to Hydration changes
    const hydChannel = window.supabaseClient
        .channel('hyd_changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'nutrition_hydration',
            filter: `profile_id=eq.${user.id}`
        }, (payload) => {
            console.log("💧 Hydration update detected:", payload);
            if (window.refreshAllNutritionUI) window.refreshAllNutritionUI();
        })
        .subscribe();

    // 2. Subscribe to Meal Log changes
    const mealChannel = window.supabaseClient
        .channel('meal_changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'nutrition_meal_log',
            filter: `profile_id=eq.${user.id}`
        }, (payload) => {
            console.log("🍲 Meal log update detected:", payload);
            if (window.refreshAllNutritionUI) window.refreshAllNutritionUI();
        })
        .subscribe();
};

// Auto-init removed (using immediate init at end of file)

// Global hook for Google Login
window.handleGoogleLogin = (response) => {
    // Decodificar JWT si es necesario
    console.log("Google Login Response:", response);
    // Simulación:
    const name = "Google User";
    const avatar = "images/users/item_profile.webp";
    saveCustomUser('user1', name, avatar);
    switchUser('user1', name, avatar);
};

// Utility to save custom user (re-using from switcher but making it global)
function loadCustomUsers() {
    const stored = localStorage.getItem('aureus_custom_users');
    return stored ? JSON.parse(stored) : [];
}

function saveCustomUser(id, name, avatar) {
    const users = loadCustomUsers();
    if (!users.find(u => u.id === id)) {
        users.push({ id, name, avatar });
        localStorage.setItem('aureus_custom_users', JSON.stringify(users));
        return true;
    }
    return false;
}

function removeUser(name) {
    let users = loadCustomUsers();
    users = users.filter(u => u.name !== name);
    localStorage.setItem('aureus_custom_users', JSON.stringify(users));

    // If the removed user was the active one, logout
    const active = getActiveUser();
    if (active === name) {
        logout();
    } else {
        window.location.reload();
    }
}

// MOBILE NAVIGATION LOGIC (Global)
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
});

function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');

    if (!mobileMenuBtn || !mobileNavDrawer || !mobileNavOverlay || !drawerCloseBtn) return;

    function openDrawer() {
        mobileNavDrawer.classList.add('open');
        mobileNavOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeDrawer() {
        mobileNavDrawer.classList.remove('open');
        mobileNavOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
    });

    drawerCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
    });

    mobileNavOverlay.addEventListener('click', () => {
        closeDrawer();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNavDrawer.classList.contains('open')) {
            closeDrawer();
        }
    });
}
// Initialize GlobalHydration immediately to fetch state before UI renders
if (window.GlobalHydration) {
    window.GlobalHydration.init();
}


/**
 * Universal Profile UI Sync
 * Updates sidebar, drawer, and greetings across the app.
 */
function syncSidebarProfile(name, avatar) {
    const selectors = {
        currentAvatar: document.getElementById('currentAvatar'),
        drawerUserName: document.getElementById('drawerUserName'),
        drawerAvatar: document.getElementById('drawerAvatar'),
        greetingName: document.getElementById('greetingUserName'),
        popoverUserName: document.getElementById('popoverUserName'),
        // New Elements
        popoverName: document.getElementById('popoverName'),
        popoverAvatar: document.getElementById('popoverAvatar')
    };

    if (selectors.currentUserName) selectors.currentUserName.innerText = name || 'Invitado';
    if (selectors.popoverUserName) selectors.popoverUserName.innerText = name || 'Usuario';

    // Update Popover Footer
    if (selectors.popoverName) selectors.popoverName.innerText = name || 'Usuario';

    const normalizedAvatar = normalizeAvatarPath(avatar);

    if (selectors.currentAvatar) {
        // Ensure standard users always get their photos, ignoring potentially stale 'avatar' param
        if (name === 'Jesus Rodriguez') {
            selectors.currentAvatar.src = normalizeAvatarPath('images/users/BlindSnk.webp');
        } else if (name === 'Gio') {
            selectors.currentAvatar.src = normalizeAvatarPath('images/users/gio_profile.webp');
        } else {
            selectors.currentAvatar.src = normalizedAvatar;
        }
    }

    if (selectors.popoverAvatar) {
        if (name === 'Jesus Rodriguez') {
            selectors.popoverAvatar.src = normalizeAvatarPath('images/users/BlindSnk.webp');
        } else if (name === 'Gio') {
            selectors.popoverAvatar.src = normalizeAvatarPath('images/users/gio_profile.webp');
        } else {
            selectors.popoverAvatar.src = normalizedAvatar;
        }
    }

    if (selectors.drawerUserName) selectors.drawerUserName.innerText = name || 'Invitado';
    if (selectors.drawerAvatar) {
        if (name === 'Jesus Rodriguez') {
            selectors.drawerAvatar.src = normalizeAvatarPath('images/users/BlindSnk.webp');
        } else if (name === 'Gio') {
            selectors.drawerAvatar.src = normalizeAvatarPath('images/users/gio_profile.webp');
        } else {
            selectors.drawerAvatar.src = normalizedAvatar;
        }
    }

    if (selectors.greetingName) {
        selectors.greetingName.innerText = name || 'Guest';
    }
}

/**
 * CENTRALIZED SUPABASE SYNC
 * Call this function from any save button to sync all user data to Supabase
 */
async function syncAllDataToSupabase(dataType = 'all') {
    try {
        // Check if Supabase is available
        if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
            console.warn('[Sync] Supabase client not available');
            return false;
        }

        const { data: session } = await window.supabaseClient.auth.getSession();
        if (!session?.session?.user?.id) {
            console.warn('[Sync] No active session');
            return false;
        }

        const userId = session.session.user.id;
        const activeUser = localStorage.getItem('aureus_active_user');
        const activeUserObj = activeUser ? JSON.parse(activeUser) : null;
        const userName = activeUserObj ? activeUserObj.name : 'user1';

        // Collect all user data from localStorage
        const syncData = {};

        // Settings/Profile
        const settingsKey = `${userName}_aureus_user_settings`;
        const settings = localStorage.getItem(settingsKey);
        if (settings) syncData.settings = JSON.parse(settings);

        // Food Log (today)
        const today = new Date().toISOString().split('T')[0];
        const foodLogKey = `${userName}_aureus_food_log_${today}`;
        const foodLog = localStorage.getItem(foodLogKey);
        if (foodLog) syncData.foodLog = JSON.parse(foodLog);

        // Hydration
        const hydrationKey = `${userName}_aureus_hydration`;
        const hydration = localStorage.getItem(hydrationKey);
        if (hydration) syncData.hydration = JSON.parse(hydration);

        // Weekly Plan
        const weeklyPlanKey = `${userName}_aureus_weekly_plan`;
        const weeklyPlan = localStorage.getItem(weeklyPlanKey);
        if (weeklyPlan) syncData.weeklyPlan = JSON.parse(weeklyPlan);

        // Fasting State
        const fastingKey = `${userName}_aureus_fasting_state`;
        const fasting = localStorage.getItem(fastingKey);
        if (fasting) syncData.fastingState = JSON.parse(fasting);

        // Plan Templates
        const templatesKey = `${userName}_aureus_plan_templates`;
        const templates = localStorage.getItem(templatesKey);
        if (templates) syncData.planTemplates = JSON.parse(templates);

        // Food Database (custom foods)
        const foodDbKey = `${userName}_aureus_food_db`;
        const foodDb = localStorage.getItem(foodDbKey);
        if (foodDb) syncData.customFoods = JSON.parse(foodDb);

        // Glycemic Load Limit (global setting)
        const glLimit = localStorage.getItem('aureus_gl_limit');
        if (glLimit) syncData.glLimit = parseInt(glLimit);

        // Active user profile
        if (activeUser) {
            const u = JSON.parse(activeUser);
            syncData.profile = {
                displayName: u.name,
                photoURL: u.avatar,
                status: 'Activo'
            };
        }

        // Upsert to Supabase - Profile Specific Record
        const recordId = `${userId}_${userName}_fitai_data`;
        const { error } = await window.supabaseClient
            .from('user_data')
            .upsert({
                id: recordId,
                app_data: syncData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error('[Sync] Supabase error:', error);
            return false;
        }

        console.log('✅ All FIT AI data synced to Supabase');
        return true;
    } catch (err) {
        console.error('[Sync] Error:', err);
        return false;
    }
}

/**
 * Load all data from Supabase to localStorage
 */
async function loadAllDataFromSupabase() {
    try {
        if (typeof window.supabaseClient === 'undefined' || !window.supabaseClient) {
            return false;
        }

        const { data: session } = await window.supabaseClient.auth.getSession();
        if (!session?.session?.user?.id) {
            return false;
        }

        const userId = session.session.user.id;
        const activeUser = localStorage.getItem('aureus_active_user');
        const userName = activeUser ? JSON.parse(activeUser).name : 'user1';
        const recordId = `${userId}_${userName}_fitai_data`;

        const { data, error } = await window.supabaseClient
            .from('user_data')
            .select('app_data')
            .eq('id', recordId)
            .maybeSingle();

        if (error || !data?.app_data) {
            console.log('[Sync] No cloud data found');
            return false;
        }

        const appData = data.app_data;


        // Hydrate localStorage with cloud data
        const safeSetItem = (key, val) => {
            try {
                const stringVal = typeof val === 'string' ? val : JSON.stringify(val);
                localStorage.setItem(key, stringVal);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.error(`[Sync] QuotaExceededError for ${key}. Storage is full.`);
                    // Emergency: clear legacy data and retry once
                    if (window.cleanupAureusStorage) window.cleanupAureusStorage();
                    try {
                        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
                    } catch (retryErr) {
                        console.warn(`[Sync] Critical failure: Could not save ${key} even after cleanup.`);
                    }
                } else {
                    console.error(`[Sync] Error saving ${key}:`, e);
                }
            }
        };

        if (appData.settings) {
            safeSetItem(`${userName}_aureus_user_settings`, appData.settings);
        }
        if (appData.hydration) {
            safeSetItem(`${userName}_aureus_hydration`, appData.hydration);
        }
        if (appData.weeklyPlan) {
            safeSetItem(`${userName}_aureus_weekly_plan`, appData.weeklyPlan);
        }
        if (appData.fastingState) {
            safeSetItem(`${userName}_aureus_fasting_state`, appData.fastingState);
        }
        if (appData.planTemplates) {
            safeSetItem(`${userName}_aureus_plan_templates`, appData.planTemplates);
        }
        if (appData.customFoods) {
            const foodDbKey = `${userName}_aureus_food_db`;
            if (window.saveAureusFoodDB) {
                // saveAureusFoodDB already has QuotaExceededError handling
                window.saveAureusFoodDB(appData.customFoods, foodDbKey);
            } else {
                safeSetItem(foodDbKey, appData.customFoods);
            }
        }
        if (appData.glLimit) {
            safeSetItem('aureus_gl_limit', appData.glLimit.toString());
        }

        console.log('✅ All FIT AI data loaded from Supabase');
        return true;
    } catch (err) {
        console.error('[Sync] Load error:', err);
        return false;
    }
}

// Expose functions globally
window.syncAllDataToSupabase = syncAllDataToSupabase;
window.loadAllDataFromSupabase = loadAllDataFromSupabase;
