/**
 * AUREUS AI - State Manager
 * Handles multi-user support via LocalStorage by using dynamic keys based on the logged-in user.
 * This overrides any legacy global saveState/loadState functions.
 */

window.getCurrentUserKey = function () {
    // 0. CHECK HUB SELECTION (Priority from dashboard-select.html)
    const hubUserJson = localStorage.getItem('aureus_active_user');
    if (hubUserJson) {
        try {
            const u = JSON.parse(hubUserJson);
            // Use ID if available (new standard), otherwise Name
            const identifier = u.id || u.name || 'UnknownProfile';
            return `finance_app_state_${identifier}`;
        } catch (e) { console.error("Error parsing hub user", e); }
    }

    // 1. Try to get the specific user ID set by AuthService (Legacy)
    const userEmail = localStorage.getItem('aureus_current_user_email');
    const customUser = localStorage.getItem('aureus_custom_user');

    if (userEmail) {
        return `finance_app_state_${userEmail}`; // e.g. finance_app_state_john@gmail.com
    } else if (customUser) {
        return `finance_app_state_${customUser}`; // e.g. finance_app_state_Admin
    }

    // Fallback for legacy/logged-out state
    // Fallback for legacy/logged-out state
    return 'finance_app_state';
};

// --- HELPER FUNCTIONS FOR USER 1 / USER 2 MAPPING ---

function getProfileInfo() {
    let user = null;
    try {
        const stored = localStorage.getItem('aureus_active_user');
        if (stored) user = JSON.parse(stored);
    } catch (e) { }

    if (!user || !user.id) return null;
    return { id: user.id, name: user.name || 'User' };
}

async function resolveRealProfile(localProfile) {
    if (!window.supabaseClient) return null;

    // If it's already a UUID, use it directly
    if (localProfile.id.includes('-') && localProfile.id.length > 20) {
        return { ...localProfile };
    }

    // Otherwise, fetch authenticated user UUID
    const { data } = await window.supabaseClient.auth.getSession();
    if (!data || !data.session || !data.session.user) {
        console.warn("⚠️ No authenticated Supabase session found for ID mapping.");
        return null;
    }

    const baseId = data.session.user.id;
    let realId = baseId;

    // Map 'user2' to a derived VALID UUID
    if (localProfile.id === 'user2') {
        const parts = baseId.split('-');
        if (parts.length === 5) {
            // Replace last segment (Node ID) with 12 '2's
            parts[4] = '222222222222';
            realId = parts.join('-');
        }
    }
    // 'user1' (or anything else) maps to baseId

    return {
        ...localProfile,
        id: realId,
        original_id: localProfile.id
    };
}

// Override Global Save Function
window.saveState = function () {
    if (typeof window.appState === 'undefined') return;

    const key = window.getCurrentUserKey();

    // Update Timestamp for Sync Resolution
    window.appState.last_modified = Date.now();

    // 1. Try Local Save
    try {
        localStorage.setItem(key, JSON.stringify(window.appState));
    } catch (e) {
        console.error("Local Save Failed (Quota?):", e);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true, position: 'bottom-end', icon: 'warning',
                title: 'Alerta de Memoria Local',
                text: 'No se pudo guardar en el dispositivo. Intentando subir a la nube...',
                timer: 4000, background: '#1e293b', color: '#fff'
            });
        }
    }

    // 2. Sync to Supabase (cloud) using SyncCore debounce
    try {
        if (window.SyncCore) {
            window.SyncCore.debouncedSync(window.syncToSupabase);
        } else {
            window.syncToSupabase();
        }
    } catch (e) {
        console.error("Auto-Sync trigger failed:", e);
    }
};

// EXPLICIT SAVE BUTTON HANDLER (PC "Guardar" Button)
window.universalSave = async function () {
    console.log("💾 Universal Save Triggered");

    // 1. Show processing toast
    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#0B0D14', color: '#fff'
    });
    Toast.fire({ icon: 'info', title: 'Guardando...', text: 'Subiendo a la nube' });

    // 2. Perform Save (Updates local timestamp and storage)
    window.saveState();

    // 3. Force Sync Push with explicit feedback
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;
    if (user) {
        try {
            await window.syncToSupabase();

            // Success Feedback
            Toast.fire({
                icon: 'success',
                title: '¡Sincronizado!',
                text: `Nube actualizada (${(window.appState.transactions || []).length} TXs)`
            });

            // Update diagnostic UI if it exists
            if (typeof updateSyncDiagnosticUI === 'function') updateSyncDiagnosticUI();
        } catch (e) {
            console.error("Cloud Save Failed:", e);
            Toast.fire({ icon: 'error', title: 'Error de Nube', text: 'Se guardó en PC, pero no se pudo subir. Revisa tu conexión.' });
        }
    } else {
        Toast.fire({ icon: 'warning', title: 'Solo Local', text: 'Inicia sesión para subir a la nube.' });
    }
};

// Sync state to Supabase (cloud) - Granular Version with SyncCore Integration
window.syncGranularToSupabase = async function () {
    if (window.location.protocol === 'file:') return;

    // Check if offline - queue the operation
    if (window.SyncCore && !window.SyncCore.isOnline()) {
        console.log("📴 Offline - Queueing granular sync...");
        window.SyncCore.queueOperation({ type: 'granular_sync', timestamp: Date.now() });
        return;
    }

    const localProfile = getProfileInfo();
    // Default to session user if no local profile, but try to resolve first
    let profileId = user.id;

    if (localProfile) {
        const resolved = await resolveRealProfile(localProfile);
        if (resolved) {
            profileId = resolved.id;
            console.log(`[Finance Sync] Using resolved profile: ${resolved.original_id} -> ${profileId}`);
        }
    }

    // Update SyncCore status
    if (window.SyncCore) window.SyncCore.setStatus(window.SyncCore.SyncStatus.SYNCING, 'Syncing finance data...');

    try {
        // --- LEGACY CLEANUP ---
        if (window.appState) {
            if (window.appState.goals) delete window.appState.goals;
            if (window.appState.customAssets) delete window.appState.customAssets;
            if (window.appState.remindersLegacy) delete window.appState.remindersLegacy;
        }

        console.log("🟢 Starting Granular Sync to Supabase...");

        // 1. Sync Budgets
        if (window.appState.budget) {
            const budgets = [];

            // Use window.calendarDate if available to sync for the viewed month
            const syncDate = window.calendarDate || new Date();
            const monthYear = syncDate.toISOString().slice(0, 7) + "-01"; // YYYY-MM-01

            // Overall Budget
            if (window.appState.budget.limit) {
                budgets.push({
                    profile_id: profileId,
                    category: 'Overall',
                    amount: parseFloat(window.appState.budget.limit) || 0,
                    month_year: monthYear
                });
            }

            // Category Budgets
            Object.entries(window.appState.budget).forEach(([cat, limit]) => {
                if (cat === 'limit' || cat === 'total') return;
                budgets.push({
                    profile_id: profileId,
                    category: cat,
                    amount: parseFloat(limit) || 0,
                    month_year: monthYear
                });
            });

            if (budgets.length > 0) {
                const { error: bError } = await window.supabaseClient
                    .from('finance_budgets')
                    .upsert(budgets, { onConflict: 'profile_id, category, month_year' });
                if (bError) console.error("❌ Budget Sync Error:", bError);
            }
        }

        // 2. Sync Transactions
        if (window.appState.transactions && window.appState.transactions.length > 0) {
            const txns = window.appState.transactions.slice(0, 500).map(t => {
                // IMPORTANT: PostgREST upsert with mixed objects (some with ID, some without) 
                // can cause "null value in column id" errors. We must ensure ALL have IDs.
                let txnId = t.id;
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(txnId);

                if (!isUuid) {
                    txnId = crypto.randomUUID();
                    // Update the local state object so we don't keep generating new IDs for the same transaction
                    t.id = txnId;
                }

                return {
                    id: txnId,
                    profile_id: profileId,
                    amount: parseFloat(t.amount) || 0,
                    type: t.type === 'income' ? 'income' : 'expense',
                    category: t.category || 'Other',
                    description: t.name || t.description || '',
                    date: t.dateIso ? t.dateIso.split('T')[0] : (t.date || new Date().toISOString().split('T')[0])
                };
            });

            const { error: tError } = await window.supabaseClient
                .from('finance_transactions')
                .upsert(txns);

            if (tError) console.error("❌ Transaction Sync Error:", tError);
            else {
                // If we updated local IDs, save the state back to localStorage
                window.saveState();
            }
        }

        // 3. Sync Accounts
        if (window.appState.balanceAccounts) {
            const accounts = Object.entries(window.appState.balanceAccounts).map(([name, balance]) => ({
                profile_id: profileId,
                name: name,
                balance: parseFloat(balance) || 0
            }));

            if (accounts.length > 0) {
                const { error: aError } = await window.supabaseClient
                    .from('finance_accounts')
                    .upsert(accounts, { onConflict: 'profile_id, name' });
                if (aError) console.error("❌ Account Sync Error:", aError);
            }
        }

        // 4. Sync Portfolio (Assets & Goals)
        if (window.appState.portfolio && window.appState.portfolio.length >= 0) {
            const portfolio = window.appState.portfolio.map(item => {
                if (!item.id || !item.id.includes('-')) {
                    item.id = crypto.randomUUID();
                }

                // Normalization for DB Constraints: type must be 'asset' or 'goal'
                let finalType = (item.type || 'asset').toLowerCase();
                let finalSubtype = item.subtype || item.type || 'user';

                if (finalType !== 'asset' && finalType !== 'goal') {
                    // If local type is 'Stocks', move it to subtype and set type to 'asset'
                    finalSubtype = item.type;
                    finalType = 'asset';
                }

                return {
                    id: item.id,
                    profile_id: profileId,
                    type: finalType,
                    subtype: finalSubtype,
                    key: item.key || null,
                    name: item.name,
                    icon: item.icon,
                    amount: parseFloat(item.amount) || 0,
                    target: parseFloat(item.target) || 0,
                    theme: item.theme || 'emerald',
                    last_updated: item.lastUpdated || new Date().toISOString()
                };
            });

            const { error: pError } = await window.supabaseClient
                .from('finance_portfolio')
                .upsert(portfolio);
            if (pError) console.error("❌ Portfolio Sync Error:", pError);

            // Sync Portfolio History
            const history = [];
            window.appState.portfolio.forEach(item => {
                if (item.history && Array.isArray(item.history)) {
                    item.history.forEach(h => {
                        history.push({
                            id: h.id || crypto.randomUUID(),
                            profile_id: profileId,
                            portfolio_id: item.id,
                            date: h.date,
                            amount: parseFloat(h.amount) || 0,
                            type: h.type || 'in',
                            note: h.note || ''
                        });
                    });
                }
            });

            if (history.length > 0) {
                const { error: phError } = await window.supabaseClient
                    .from('finance_portfolio_history')
                    .upsert(history);
                if (phError) console.error("❌ Portfolio History Sync Error:", phError);
            }
        }

        // 5. Sync Debts
        if (window.appState.debts && window.appState.debts.length >= 0) {
            const debts = window.appState.debts.map(d => ({
                id: d.id,
                id: d.id,
                profile_id: profileId,
                name: d.name,
                total: parseFloat(d.total) || 0,
                current_paid: parseFloat(d.current_paid) || 0,
                interest: parseFloat(d.interest) || 0,
                monthly_payment: parseFloat(d.monthly_payment) || 0,
                next_payment_date: d.next_payment_date || null,
                icon: d.icon || 'credit-card',
                last_updated: new Date().toISOString()
            }));

            const { error: dError } = await window.supabaseClient
                .from('finance_debts')
                .upsert(debts);
            if (dError) console.error("❌ Debt Sync Error:", dError);

            // Sync Debt History
            const debtHistory = [];
            window.appState.debts.forEach(d => {
                if (d.history && Array.isArray(d.history)) {
                    d.history.forEach(h => {
                        debtHistory.push({
                            id: h.id || crypto.randomUUID(),
                            profile_id: profileId,
                            debt_id: d.id,
                            date: h.date,
                            amount: parseFloat(h.amount) || 0,
                            note: h.note || ''
                        });
                    });
                }
            });

            if (debtHistory.length > 0) {
                const { error: dhError } = await window.supabaseClient
                    .from('finance_debts_history')
                    .upsert(debtHistory);
                if (dhError) console.error("❌ Debt History Sync Error:", dhError);
            }
        }

        // 6. Sync Reminders
        if (window.appState.reminders && window.appState.reminders.length >= 0) {
            const reminders = window.appState.reminders.map(r => ({
                id: r.id,
                id: r.id,
                profile_id: profileId,
                title: r.title,
                amount: parseFloat(r.amount) || 0,
                day: parseInt(r.day) || 1,
                type: r.type || 'expense'
            }));

            const { error: rError } = await window.supabaseClient
                .from('finance_reminders')
                .upsert(reminders);
            if (rError) console.error("❌ Reminder Sync Error:", rError);
        }

        // 7. Sync Profile
        if (window.appState.profile) {
            const profile = {
                id: profileId,
                full_name: window.appState.profile.name,
                avatar_url: window.appState.profile.image,
                email: user.email,
                updated_at: new Date().toISOString()
            };
            const { error: profError } = await window.supabaseClient
                .from('users')
                .upsert(profile);
            if (profError) console.error("❌ Profile Sync Error:", profError);
        }

        // 8. Sync Settings
        if (window.appState.settings) {
            const settings = {
                profile_id: profileId,
                primary_color: window.appState.settings.primaryColor,
                accent_color: window.appState.settings.accentColor,
                border_fx: window.appState.settings.borderFX,
                radius: window.appState.settings.radius,
                blur: parseInt(window.appState.settings.blur) || 0,
                language: window.appState.settings.language,
                currency: window.appState.settings.currency,
                wallpaper_type: window.appState.settings.wallpaperType,
                wallpaper_value: window.appState.settings.wallpaperValue,
                updated_at: new Date().toISOString()
            };
            const { error: settError } = await window.supabaseClient
                .from('finance_settings')
                .upsert(settings);
            if (settError) console.error("❌ Settings Sync Error:", settError);
        }

        console.log("☁️ Granular Sync Completed");

        // Update SyncCore status to success
        if (window.SyncCore) window.SyncCore.setStatus(window.SyncCore.SyncStatus.SUCCESS, 'Finance data synced');

    } catch (e) {
        console.warn("❌ Granular sync failed:", e);

        // Update SyncCore status to error and optionally queue for retry
        if (window.SyncCore) {
            window.SyncCore.setStatus(window.SyncCore.SyncStatus.ERROR, 'Sync failed');
            window.SyncCore.queueOperation({ type: 'granular_sync', timestamp: Date.now() });
        }
    }
};

window.deleteGranularPortfolioItem = async function (id) {
    if (!window.supabaseClient) return;
    try {
        await window.supabaseClient.from('finance_portfolio_history').delete().eq('portfolio_id', id);
        const { error } = await window.supabaseClient.from('finance_portfolio').delete().eq('id', id);
        if (error) console.error("❌ Portfolio Delete Error:", error);
    } catch (e) { console.error("❌ Portfolio Delete Exception:", e); }
};

window.deleteGranularDebt = async function (id) {
    if (!window.supabaseClient) return;
    try {
        await window.supabaseClient.from('finance_debts_history').delete().eq('debt_id', id);
        const { error } = await window.supabaseClient.from('finance_debts').delete().eq('id', id);
        if (error) console.error("❌ Debt Delete Error:", error);
    } catch (e) { console.error("❌ Debt Delete Exception:", e); }
};

window.deleteGranularReminder = async function (id) {
    if (!window.supabaseClient) return;
    try {
        const { error } = await window.supabaseClient.from('finance_reminders').delete().eq('id', id);
        if (error) console.error("❌ Reminder Delete Error:", error);
    } catch (e) { console.error("❌ Reminder Delete Exception:", e); }
};

window.loadGranularFromSupabase = async function () {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    // Resolve Profile ID
    const localProfile = getProfileInfo();
    let profileId = user.id;

    if (localProfile) {
        const resolved = await resolveRealProfile(localProfile);
        if (resolved) {
            profileId = resolved.id;
        }
    }

    try {
        console.log(`📥 Loading Granular data from Supabase for ID: ${profileId}...`);

        const [budgetsRes, txnsRes, accountsRes, portfolioRes, portfolioHistRes, debtsRes, debtsHistRes, remindersRes, profileRes, settingsRes] = await Promise.all([
            window.supabaseClient.from('finance_budgets').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('finance_transactions').select('*').eq('profile_id', profileId).order('date', { ascending: false }).limit(200),
            window.supabaseClient.from('finance_accounts').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('finance_portfolio').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('finance_portfolio_history').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('finance_debts').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('finance_debts_history').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('finance_reminders').select('*').eq('profile_id', profileId),
            window.supabaseClient.from('users').select('*').eq('id', profileId).maybeSingle(),
            window.supabaseClient.from('finance_settings').select('*').eq('profile_id', profileId).maybeSingle()
        ]);

        if (budgetsRes.error) throw budgetsRes.error;
        if (txnsRes.error) throw txnsRes.error;
        if (accountsRes.error) throw accountsRes.error;
        if (portfolioRes.error) throw portfolioRes.error;
        if (portfolioHistRes.error) throw portfolioHistRes.error;
        if (debtsRes.error) throw debtsRes.error;
        if (debtsHistRes.error) throw debtsHistRes.error;
        if (remindersRes.error) throw remindersRes.error;

        const reconstructedState = {
            budget: {},
            transactions: [],
            balanceAccounts: {},
            portfolio: [],
            debts: [],
            reminders: [],
            profile: null,
            settings: null
        };

        budgetsRes.data.forEach(b => {
            if (b.category === 'Overall') {
                reconstructedState.budget.limit = b.amount;
            } else {
                reconstructedState.budget[b.category] = b.amount;
            }
        });

        reconstructedState.transactions = txnsRes.data.map(t => ({
            id: t.id,
            amount: t.amount,
            category: t.category,
            name: t.description,
            date: t.date,
            dateIso: new Date(t.date).toISOString(),
            type: t.type
        }));

        accountsRes.data.forEach(acc => {
            reconstructedState.balanceAccounts[acc.name] = acc.balance;
        });

        // Reconstruct Portfolio
        if (portfolioRes.data) {
            reconstructedState.portfolio = portfolioRes.data.map(item => ({
                id: item.id,
                type: item.type,
                subtype: item.subtype,
                key: item.key,
                name: item.name,
                icon: item.icon,
                amount: item.amount,
                target: item.target,
                theme: item.theme,
                lastUpdated: item.last_updated,
                history: portfolioHistRes.data
                    .filter(h => h.portfolio_id === item.id)
                    .map(h => ({
                        id: h.id,
                        date: h.date,
                        amount: h.amount,
                        type: h.type,
                        note: h.note
                    }))
            }));
        }

        // Reconstruct Debts
        if (debtsRes.data) {
            reconstructedState.debts = debtsRes.data.map(d => ({
                id: d.id,
                name: d.name,
                total: d.total,
                current_paid: d.current_paid,
                interest: d.interest,
                monthly_payment: d.monthly_payment,
                next_payment_date: d.next_payment_date,
                icon: d.icon,
                history: debtsHistRes.data
                    .filter(h => h.debt_id === d.id)
                    .map(h => ({
                        id: h.id,
                        date: h.date,
                        amount: h.amount,
                        note: h.note
                    }))
            }));
        }

        // Reconstruct Reminders
        if (remindersRes.data) {
            reconstructedState.reminders = remindersRes.data.map(r => ({
                id: r.id,
                title: r.title,
                amount: r.amount,
                day: r.day,
                type: r.type
            }));
        }

        // Reconstruct Profile
        if (profileRes.data) {
            reconstructedState.profile = {
                name: profileRes.data.full_name,
                image: profileRes.data.avatar_url,
                balance: window.appState?.profile?.balance || 0
            };
        }

        // Reconstruct Settings
        if (settingsRes.data) {
            reconstructedState.settings = {
                primaryColor: settingsRes.data.primary_color,
                accentColor: settingsRes.data.accent_color,
                borderFX: settingsRes.data.border_fx,
                radius: settingsRes.data.radius,
                blur: settingsRes.data.blur,
                language: settingsRes.data.language,
                currency: settingsRes.data.currency,
                wallpaperType: settingsRes.data.wallpaper_type,
                wallpaperValue: settingsRes.data.wallpaper_value
            };
        }

        return reconstructedState;

    } catch (e) {
        console.error("❌ Granular load failed:", e);
        return null;
    }
};

window.deleteGranularTransaction = async function (transactionId) {
    if (window.location.protocol === 'file:') return;
    if (!transactionId || typeof transactionId !== 'string' || !transactionId.includes('-')) {
        console.warn("⏭️ Skip DB delete: Not a valid UUID id", transactionId);
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('finance_transactions')
            .delete()
            .eq('id', transactionId);

        if (error) throw error;
        console.log("🗑️ Granular Transaction Deleted from Supabase:", transactionId);
    } catch (e) {
        console.error("❌ Granular Delete Failed:", e);
    }
};

// Sync state to Supabase (cloud) - Legacy Blob Version
window.syncToSupabase = async function () {
    if (window.location.protocol === 'file:') return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;
    if (!user || !window.appState) return;

    window.syncGranularToSupabase();

    try {
        const profileSuffix = window.getCurrentUserKey().replace('finance_app_state_', '') || 'default';
        const docId = `${user.id}_${profileSuffix}`;

        const { error } = await window.supabaseClient
            .from('user_data')
            .upsert({
                id: docId,
                app_data: window.appState,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;
        console.log("☁️ Synced to Supabase (Blob) for:", user.email);
    } catch (e) {
        console.warn("❌ Supabase sync (Blob) failed:", e);
    }
};

// Real-time Subscription
window.subscribeToSupabase = async function (user) {
    if (!user) return;
    if (window.location.protocol === 'file:') return;

    if (window.supabaseSubscription) {
        window.supabaseSubscription.unsubscribe();
    }

    // Resolve Profile ID for subscriptions
    const localProfile = getProfileInfo();
    let profileId = user.id;
    if (localProfile) {
        const resolved = await resolveRealProfile(localProfile);
        if (resolved) profileId = resolved.id;
    }

    console.log(`📡 Subscribing to Cloud Changes for: ${user.email} (Profile ID: ${profileId})`);

    const profileSuffix = window.getCurrentUserKey().replace('finance_app_state_', '') || 'default';
    const docId = `${user.id}_${profileSuffix}`;

    window.supabaseSubscription = window.supabaseClient
        .channel('user_data_changes')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_data',
            filter: `id=eq.${docId}`
        }, payload => {
            const remoteData = payload.new;
            if (!remoteData || !remoteData.app_data) return;

            const newCloudState = remoteData.app_data;
            const localTime = window.appState?.last_modified || 0;
            const cloudTime = newCloudState.last_modified || 0;

            if (localTime >= cloudTime) return;

            console.log("⚡ Cloud Update Received (Supabase)!");
            const key = window.getCurrentUserKey();
            window.appState = newCloudState;
            localStorage.setItem(key, JSON.stringify(newCloudState));
            window.refreshAllFinanceUI();

            Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'info', title: 'Syncing...', text: 'Datos actualizados desde la nube'
            });
        })
        .subscribe();

    // Granular Listeners
    const granularChannel = window.supabaseClient.channel('granular_changes');
    ['finance_budgets', 'finance_transactions', 'finance_accounts', 'finance_portfolio', 'finance_portfolio_history', 'finance_debts', 'finance_debts_history', 'finance_reminders', 'user_profiles', 'finance_settings'].forEach(table => {
        granularChannel.on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: table,
            filter: (table === 'user_profiles' || table === 'users') ? `id=eq.${profileId}` : `profile_id=eq.${profileId}`
        }, async payload => {
            console.log(`⚡ Granular Change in ${table}:`, payload.eventType);
            // Debounce reload to avoid stampede
            if (window.granularReloadTimeout) clearTimeout(window.granularReloadTimeout);
            window.granularReloadTimeout = setTimeout(async () => {
                const granularData = await window.loadGranularFromSupabase();
                if (granularData) {
                    if (granularData.budget) window.appState.budget = { ...window.appState.budget, ...granularData.budget };
                    if (granularData.transactions) window.appState.transactions = granularData.transactions;
                    if (granularData.balanceAccounts) window.appState.balanceAccounts = { ...window.appState.balanceAccounts, ...granularData.balanceAccounts };
                    if (granularData.portfolio) window.appState.portfolio = granularData.portfolio;
                    if (granularData.debts) window.appState.debts = granularData.debts;
                    if (granularData.reminders) window.appState.reminders = granularData.reminders;
                    if (granularData.profile) window.appState.profile = { ...window.appState.profile, ...granularData.profile };
                    if (granularData.settings) {
                        window.appState.settings = { ...window.appState.settings, ...granularData.settings };
                        // Apply wallpaper if set
                        if (granularData.settings.wallpaperType && typeof window.setWallpaper === 'function') {
                            window.setWallpaper(granularData.settings.wallpaperType, granularData.settings.wallpaperValue);
                        }
                    }
                    window.refreshAllFinanceUI();

                    // Special handling for theme/lang refresh
                    if (table === 'finance_settings' || table === 'user_profiles' || table === 'users') {
                        if (window.themeManager) window.themeManager.loadSettings();
                        if (window.applyTranslations) window.applyTranslations();
                    }
                }
            }, 500);
        });
    });
    granularChannel.subscribe();
};

window.refreshAllFinanceUI = function () {
    const refreshFunctions = [
        'renderMegaDashboard',
        'renderMergedDashboard',
        'updateSidebarStats',
        'updateMonthlyTotals',
        'renderWalletHistory',
        'renderBudgetTab',
        'renderBudgetTabAnalytics'
    ];
    refreshFunctions.forEach(fn => {
        if (typeof window[fn] === 'function') {
            try { window[fn](); } catch (e) { console.error(`Error refreshing ${fn}:`, e); }
        }
    });
};

// Load state from Supabase (cloud) - Now with Granular Support
window.loadFromSupabase = async function () {
    if (window.location.protocol === 'file:') return null;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    try {
        window.subscribeToSupabase(user);
    } catch (e) { console.warn("Subscribe failed:", e); }

    try {
        const profileSuffix = window.getCurrentUserKey().replace('finance_app_state_', '') || 'default';
        const docId = `${user.id}_${profileSuffix}`;

        console.log(`☁️ Loading from Supabase doc: ${docId}`);

        // 1. Fetch Legacy Blob
        const { data: blobData, error: blobError } = await window.supabaseClient
            .from('user_data')
            .select('app_data')
            .eq('id', docId)
            .maybeSingle();

        // 2. Fetch Granular Data
        const granularData = await window.loadGranularFromSupabase();

        let finalState = null;

        if (blobData && blobData.app_data) {
            finalState = blobData.app_data;
            console.log("☁️ Legacy Blob loaded.");
        }

        if (granularData) {
            if (!finalState) finalState = { ...window.appState };

            if (granularData.budget) {
                finalState.budget = { ...finalState.budget, ...granularData.budget };
            }
            if (granularData.transactions && granularData.transactions.length > 0) {
                finalState.transactions = granularData.transactions;
            }
            if (granularData.balanceAccounts) {
                finalState.balanceAccounts = { ...finalState.balanceAccounts, ...granularData.balanceAccounts };
            }
            if (granularData.portfolio && granularData.portfolio.length > 0) {
                finalState.portfolio = granularData.portfolio;
            }
            if (granularData.debts && granularData.debts.length > 0) {
                finalState.debts = granularData.debts;
            }
            if (granularData.reminders && granularData.reminders.length > 0) {
                finalState.reminders = granularData.reminders;
            }
            if (granularData.profile) {
                finalState.profile = { ...finalState.profile, ...granularData.profile };
            }
            if (granularData.settings) {
                finalState.settings = { ...finalState.settings, ...granularData.settings };
            }
            console.log("☁️ Granular data merged.");
        }

        if (finalState) return finalState;

    } catch (e) {
        console.warn("❌ Supabase load failed:", e);
    }
    return null;
};

// Override Global Load Function
window.loadState = function () {
    const key = window.getCurrentUserKey();
    console.log(`📂 Loading Data for: ${key}`);

    const raw = localStorage.getItem(key);

    if (raw) {
        try {
            window.appState = JSON.parse(raw);
            if (!window.appState.reminders) {
                window.appState.reminders = [
                    { id: 'rem_1', title: 'Renta Mensual', amount: 3500, day: 3, type: 'expense' }
                ];
            }
        } catch (e) {
            console.error("State load error", e);
            resetState();
        }
    } else {
        const legacy = localStorage.getItem('developMeApp_v1');
        if (legacy) {
            console.log("📦 Legacy Data Detected. Migrating...");
            try {
                window.appState = JSON.parse(legacy);
                localStorage.setItem(key, legacy);
            } catch (e) {
                resetState();
            }
        } else {
            resetState();
        }
    }

    // Hydrate UI
    window.refreshAllFinanceUI();
};

window.loadStateWithCloudSync = async function () {
    const key = window.getCurrentUserKey();
    console.log(`☁️ Loading Data with Cloud Sync for: ${key}`);

    // Wait for SweetAlert to be available before showing loading dialog
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Sincronizando...',
            text: 'Descargando tus datos de la nube',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
            background: '#0B0D14', color: '#fff'
        });
    } else {
        console.log('⏳ Syncing from cloud (Swal not yet loaded)...');
    }

    const cloudState = await window.loadFromSupabase();
    const localRaw = localStorage.getItem(key);
    let localState = localRaw ? JSON.parse(localRaw) : null;

    if (window.appState && window.appState.last_modified) {
        const diskTime = localState ? (localState.last_modified || 0) : 0;
        if (window.appState.last_modified > diskTime) localState = window.appState;
    }
    if (!localState && window.appState) localState = window.appState;

    if (cloudState) {
        const cloudTime = cloudState.last_modified || 0;
        const localTime = localState ? (localState.last_modified || 0) : 0;

        if (cloudTime > localTime || (localState && !localState.transactions)) {
            window.appState = cloudState;
            localStorage.setItem(key, JSON.stringify(cloudState));
        } else {
            window.appState = localState;
            window.syncToSupabase();
        }
    } else if (localState) {
        window.appState = localState;
        window.syncToSupabase();
    } else {
        resetState();
    }

    if (typeof Swal !== 'undefined') Swal.close();
    window.refreshAllFinanceUI();
};

window.forceFactoryResetForProfile = async function () {
    const key = window.getCurrentUserKey();
    Swal.fire({
        title: '¿Reiniciar Perfil?',
        text: `Esto borrará TODOS los datos locales de: ${key}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, Borrar Todo',
        background: '#0B0D14', color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem(key);
            window.appState = null;
            window.location.reload();
        }
    });
};

window.forceCloudPull = async function () {
    const key = window.getCurrentUserKey();
    Swal.fire({
        title: 'Forzando Sincronización',
        text: 'Bajando datos de la nube...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: '#0B0D14', color: '#fff'
    });

    const cloudState = await window.loadFromSupabase();
    if (cloudState) {
        window.appState = cloudState;
        localStorage.setItem(key, JSON.stringify(cloudState));
        Swal.fire({ icon: 'success', title: 'Sincronizado' }).then(() => window.location.reload());
    } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontraron datos.' });
    }
};

window.exportData = function () {
    try {
        if (!window.appState) return Swal.fire('Error', 'No data to export', 'error');

        LazyLoader.load('xlsx').then(() => {
            const wb = XLSX.utils.book_new();

            // 1. Transactions Sheet
            const txns = window.appState.transactions || [];
            const wsTxns = XLSX.utils.json_to_sheet(txns);
            XLSX.utils.book_append_sheet(wb, wsTxns, "MOVIMIENTOS");

            // 2. Budget Sheet
            const budgetData = Object.entries(window.appState.budget || {}).map(([cat, limit]) => ({ Categoria: cat, Limite: limit }));
            const wsBudget = XLSX.utils.json_to_sheet(budgetData);
            XLSX.utils.book_append_sheet(wb, wsBudget, "PRESUPUESTO");

            // 3. Portfolio Sheet
            const portfolio = (window.appState.portfolio || []).map(p => ({ Name: p.name, Type: p.type, Amount: p.amount, Target: p.target }));
            const wsPortfolio = XLSX.utils.json_to_sheet(portfolio);
            XLSX.utils.book_append_sheet(wb, wsPortfolio, "PORTAFOLIO");

            XLSX.writeFile(wb, `AUREUS_FULL_EXPORT_${new Date().toISOString().slice(0, 10)}.xlsx`);

            Swal.fire({
                icon: 'success',
                title: 'Exportación Exitosa',
                text: 'Datos financieros consolidados en Excel.',
                background: '#0B0D14', color: '#fff'
            });
        }).catch(err => {
            console.error("Failed to load XLSX", err);
            Swal.fire('Error', 'Biblioteca Excel no disponible', 'error');
        });
    } catch (e) {
        Swal.fire('Error', e.message, 'error');
    }
};

window.importData = function (inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    Swal.fire({
        title: 'Importando...',
        text: 'Analizando arquitectura de datos',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: '#0B0D14', color: '#fff'
    });

    LazyLoader.load('xlsx').then(() => {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sn = workbook.SheetNames[0]; // Assuming transactions are on first sheet
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[sn]);

                // For now, we only restore transactions from Excel as other fields are more complex to map back
                window.appState.transactions = json;
                window.saveState();

                Swal.fire({
                    icon: 'success',
                    title: 'Importación Finalizada',
                    text: 'Se han restaurado los movimientos.',
                    background: '#0B0D14', color: '#fff'
                }).then(() => window.location.reload());
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Fallo en el procesado del archivo', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }).catch(err => {
        console.error("Failed to load XLSX", err);
        Swal.fire('Error', 'Fallo al cargar biblioteca Excel', 'error');
    });
};
function resetState() {
    window.appState = {
        transactions: [],
        budget: {},
        profile: { name: 'Usuario', balance: 0, image: '' },
        goals: [],
        portfolio: [],
        debts: [],
        balanceAccounts: { pocket: 0, bank: 0 },
        reminders: [],
        ui: { theme: 'dark' }
    };
}

window.simulateDemoData = function (monthsBack = 6) {
    resetState();
    const now = new Date();

    // Core setup
    window.appState.profile = { name: 'Aureus Elite User', balance: 15420.50, image: '' };
    window.appState.balanceAccounts = {
        "Efectivo": 1200,
        "Banco Principal": 8500,
        "Inversiones": 5720.50
    };

    window.appState.budget = {
        limit: 4500,
        "Alimentación": 800,
        "Transporte": 300,
        "Entretenimiento": 500,
        "Servicios": 600,
        "Personal": 400
    };

    const categories = {
        expense: ["Alimentación", "Transporte", "Entretenimiento", "Servicios", "Personal", "Compras", "Salud"],
        income: ["Salario Principal", "Ventas Freelance", "Dividendos", "Renta Extra"]
    };

    // Generate high-quality transactions
    for (let m = 0; m < monthsBack; m++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

        // 1. Monthly Salaries (Fixed)
        window.appState.transactions.push({
            id: crypto.randomUUID(),
            amount: 3500,
            category: "Salario Principal",
            name: "Salario Corporativo Aureus",
            type: "income",
            dateIso: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString(),
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString().split('T')[0]
        });

        // 2. Random Expenses (Variable)
        for (let i = 0; i < 15; i++) {
            const day = Math.floor(Math.random() * 28) + 1;
            const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
            const cat = categories.expense[Math.floor(Math.random() * categories.expense.length)];

            window.appState.transactions.push({
                id: crypto.randomUUID(),
                amount: (15 + Math.random() * 250).toFixed(2),
                category: cat,
                name: `Gasto Operativo ${cat} #${i + 1}`,
                type: "expense",
                dateIso: date.toISOString(),
                date: date.toISOString().split('T')[0]
            });
        }
    }

    // Portfolio
    window.appState.portfolio = [
        { id: crypto.randomUUID(), name: 'S&P 500 ETF', type: 'asset', subtype: 'Stocks', amount: 4500, target: 10000, icon: 'trending-up' },
        { id: crypto.randomUUID(), name: 'Ethereum Node', type: 'asset', subtype: 'Crypto', amount: 1220.50, target: 5000, icon: 'zap' }
    ];

    window.saveState();

    Swal.fire({
        icon: 'success',
        title: 'Simulación Elite Activa',
        text: 'Se han generado 6 meses de historial financiero avanzado.',
        background: '#0B0D14', color: '#fff',
        timer: 3000
    }).then(() => window.location.reload());
};

window.exportClipboard = function () {
    const dataStr = JSON.stringify(window.appState);
    navigator.clipboard.writeText(dataStr).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Código Copiado',
            text: 'El respaldo en texto ha sido copiado al portapapeles.',
            background: '#0B0D14', color: '#fff'
        });
    });
};

window.importClipboard = async function () {
    const { value: text } = await Swal.fire({
        title: 'Pegar Respaldo',
        input: 'textarea',
        inputPlaceholder: 'Pega el código JSON aquí...',
        showCancelButton: true,
        background: '#0B0D14', color: '#fff'
    });

    if (text) {
        try {
            const data = JSON.parse(text);
            if (data && typeof data === 'object') {
                window.appState = data;
                window.saveState();
                window.location.reload();
            } else {
                throw new Error("Estructura inválida");
            }
        } catch (e) {
            Swal.fire('Error', 'El código no es un respaldo Aureus válido.', 'error');
        }
    }
};

window.clearAllData = function () {
    Swal.fire({
        title: '¿BORRADO TOTAL?',
        text: "Esto eliminará todos tus datos locales de forma permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Sí, Borrar Todo',
        background: '#0B0D14', color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            const key = window.getCurrentUserKey();
            localStorage.removeItem(key);
            window.location.reload();
        }
    });
};

if (document.readyState !== 'loading') window.loadState();
else document.addEventListener('DOMContentLoaded', () => window.loadState());

// Initialize SyncCore with custom operation executor for Finance
if (window.SyncCore) {
    window.SyncCore.init();

    // Register custom operation executor for granular sync
    window.SyncCore.registerExecutor('granular_sync', async () => {
        console.log('🔄 Executing queued granular sync...');
        await window.syncGranularToSupabase();
    });

    // Cross-Tab Sync Listener
    window.SyncCore.initCrossTabSync((key, newState) => {
        const currentUserKey = window.getCurrentUserKey();
        if (key === currentUserKey) {
            console.log('🔄 Cross-tab update detected. Reloading state...');
            window.appState = newState;

            // Re-render Dashboard if available
            if (typeof window.renderDashboard === 'function') {
                window.renderDashboard();
            } else {
                console.warn("renderDashboard not found, reloading page...");
                window.location.reload();
            }
        }
    });

    console.log("✅ State Manager Active (with SyncCore)");
} else {
    console.log("✅ State Manager Active");
}
