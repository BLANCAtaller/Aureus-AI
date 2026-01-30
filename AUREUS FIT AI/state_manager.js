/**
 * AUREUS FIT AI - State Manager & Granular Supabase Sync
 * Handles synchronization for nutrition_hydration and nutrition_meal_log tables.
 */

(function () {
    // Helper to get profile metadata safely
    function getProfileInfo() {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('aureus_active_user'));
        } catch (e) { }

        // Removed strict check for hyphen to allow 'user1' / 'user2'
        if (!user || !user.id) {
            return null;
        }

        return {
            id: user.id,
            name: user.name || 'user1'
        };
    }

    // Helper: Map local 'user1'/'user2' to real Supabase UUIDs
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
            id: realId
        };
    }

    /**
     * Syncs hydration and meal logs to Supabase granular tables.
     * @param {string} date - Date string in YYYY-MM-DD format.
     * @param {Object} logData - The daily log data structure.
     */
    async function syncGranularNutritionToSupabase(date, logData) {
        if (!window.supabaseClient) return;

        const localProfile = getProfileInfo();
        if (!localProfile) return;

        const profile = await resolveRealProfile(localProfile);
        if (!profile) return;

        console.log(`[Sync] Processing nutrition for ${date} (Profile: ${profile.name} / ID: ${profile.id})...`);

        try {
            // Prepare Data
            let hydrationData = null;
            if (logData.hydration) {
                hydrationData = {
                    profile_id: profile.id,
                    profile_name: profile.name,
                    date: date,
                    amount_ml: logData.hydration.current || 0,
                    goal_ml: logData.hydration.goal || 2500,
                    updated_at: new Date().toISOString()
                };
            }

            let mealEntries = [];
            if (logData.meals) {
                Object.entries(logData.meals).forEach(([mealType, meal]) => {
                    if (meal.items && Array.isArray(meal.items)) {
                        meal.items.forEach(item => {
                            mealEntries.push({
                                id: item.id || crypto.randomUUID(), // Ensure UUID
                                profile_id: profile.id,
                                profile_name: profile.name,
                                date: date,
                                meal_type: mealType,
                                food_name: item.name || 'Unknown Item',
                                calories: item.cals || item.cal || 0,
                                protein: item.prot || 0,
                                carbs: item.carb || 0,
                                fats: item.fat || 0,
                                purines: item.purine || item.purines || 0,
                                glycemic_index: item.gi || 0,
                                updated_at: new Date().toISOString()
                            });
                        });
                    }
                });
            }

            // Check Offline / Use SyncCore
            if (window.SyncCore && !window.SyncCore.isOnline()) {
                console.log("📴 Offline - Queueing nutrition sync...");

                if (hydrationData) {
                    window.SyncCore.queueOperation({
                        type: 'upsert',
                        table: 'nutrition_hydration',
                        data: hydrationData
                    });
                }

                if (mealEntries.length > 0) {
                    window.SyncCore.queueOperation({
                        type: 'upsert',
                        table: 'nutrition_meal_log',
                        data: mealEntries
                    });
                }

                window.SyncCore.setStatus(window.SyncCore.SyncStatus.OFFLINE, 'Nutrición guardada offline');
                return;
            }

            // Online Execution
            if (window.SyncCore) window.SyncCore.setStatus(window.SyncCore.SyncStatus.SYNCING, 'Sincronizando nutrición...');

            // 1. Sync Hydration
            if (hydrationData) {
                const { error: hydError } = await window.supabaseClient
                    .from('nutrition_hydration')
                    .upsert(hydrationData, { onConflict: 'profile_id, date, profile_name' });
                if (hydError) throw hydError;
            }

            // 2. Sync Meal Logs (Batch Upsert)
            if (mealEntries.length > 0) {
                const { error: mealError } = await window.supabaseClient
                    .from('nutrition_meal_log')
                    .upsert(mealEntries, { onConflict: 'id' });
                if (mealError) throw mealError;
            }

            if (window.SyncCore) window.SyncCore.setStatus(window.SyncCore.SyncStatus.SUCCESS, 'Nutrición actualizada');

        } catch (err) {
            console.error("Critical error in granular nutrition sync:", err);
            if (window.SyncCore) window.SyncCore.setStatus(window.SyncCore.SyncStatus.ERROR, 'Error sincronizando');
        }
    }

    /**
     * Loads nutrition data from Supabase granular tables for a specific date.
     * @param {string} date - Date string in YYYY-MM-DD format.
     * @returns {Object|null} - Merged log data or null.
     */
    async function loadGranularNutritionFromSupabase(date) {
        if (!window.supabaseClient) return null;

        const localProfile = getProfileInfo();
        if (!localProfile) return null;

        const profile = await resolveRealProfile(localProfile);
        if (!profile) return null;

        try {
            // Fetch Hydration
            const { data: hydData, error: hydError } = await window.supabaseClient
                .from('nutrition_hydration')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('profile_name', profile.name)
                .eq('date', date)
                .maybeSingle();

            // Fetch Meals
            const { data: mealData, error: mealError } = await window.supabaseClient
                .from('nutrition_meal_log')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('date', date);

            if (hydError || mealError) {
                console.error("Error loading granular nutrition:", hydError || mealError);
                return null;
            }

            const result = {
                hydration: hydData ? { current: hydData.amount_ml, goal: hydData.goal_ml } : null,
                meals: {}
            };

            if (mealData) {
                mealData.forEach(entry => {
                    if (!result.meals[entry.meal_type]) {
                        result.meals[entry.meal_type] = { items: [] };
                    }
                    result.meals[entry.meal_type].items.push({
                        id: entry.id,
                        name: entry.food_name,
                        cals: entry.calories,
                        prot: entry.protein,
                        carb: entry.carbs,
                        fat: entry.fats,
                        purine: entry.purines,
                        gi: entry.glycemic_index
                    });
                });
            }

            return result;
        } catch (err) {
            console.error("Error in loadGranularNutritionFromSupabase:", err);
            return null;
        }
    }

    /**
     * Loads nutrition data from Supabase granular tables for a range of dates.
     * @param {string} startDate - Start date (YYYY-MM-DD).
     * @param {string} endDate - End date (YYYY-MM-DD).
     * @returns {Object|null} - Map of date keys to log data or null.
     */
    async function loadHistoricalNutritionRangeFromSupabase(startDate, endDate) {
        if (!window.supabaseClient) return null;

        const localProfile = getProfileInfo();
        if (!localProfile) return null;

        const profile = await resolveRealProfile(localProfile);
        if (!profile) return null;

        try {
            console.log(`[Sync] Loading historical range: ${startDate} to ${endDate} for ${profile.name} (ID: ${profile.id})...`);

            // Fetch Hydration Range
            const { data: hydData, error: hydError } = await window.supabaseClient
                .from('nutrition_hydration')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('profile_name', profile.name)
                .gte('date', startDate)
                .lte('date', endDate);

            // Fetch Meals Range
            const { data: mealData, error: mealError } = await window.supabaseClient
                .from('nutrition_meal_log')
                .select('*')
                .eq('profile_id', profile.id)
                .eq('profile_name', profile.name)
                .gte('date', startDate)
                .lte('date', endDate);

            if (hydError || mealError) {
                console.error("Error loading historical range:", hydError || mealError);
                return null;
            }

            // Organize by date
            const result = {};

            // Initialize range map
            let current = new Date(startDate);
            const end = new Date(endDate);
            // Add a small buffer to avoid off-by-one errors with timezones if any
            while (current <= end) {
                const dateKey = current.toISOString().split('T')[0];
                result[dateKey] = {
                    hydration: null,
                    meals: {}
                };
                current.setDate(current.getDate() + 1);
            }

            if (hydData) {
                hydData.forEach(h => {
                    if (result[h.date]) {
                        result[h.date].hydration = { current: h.amount_ml, goal: h.goal_ml };
                    }
                });
            }

            if (mealData) {
                mealData.forEach(entry => {
                    if (result[entry.date]) {
                        if (!result[entry.date].meals[entry.meal_type]) {
                            result[entry.date].meals[entry.meal_type] = { items: [] };
                        }
                        result[entry.date].meals[entry.meal_type].items.push({
                            id: entry.id,
                            name: entry.food_name,
                            cals: entry.calories,
                            prot: entry.protein,
                            carb: entry.carbs,
                            fat: entry.fats,
                            purine: entry.purines,
                            gi: entry.glycemic_index
                        });
                    }
                });
            }

            return result;
        } catch (err) {
            console.error("Error in loadHistoricalNutritionRangeFromSupabase:", err);
            return null;
        }
    }


    /**
     * Refresh all relevant Nutrition UI components.
     */
    function refreshAllNutritionUI() {
        console.log("Refreshing Nutrition UI...");

        // 1. Refresh Macro Charts (script.js)
        if (typeof window.initMacroChart === 'function') {
            window.initMacroChart();
        }
        if (typeof window.initWeeklyMacroChart === 'function') {
            window.initWeeklyMacroChart();
        }

        // 2. Refresh Hydration Displays
        if (window.GlobalHydration && typeof window.GlobalHydration.loadState === 'function') {
            window.GlobalHydration.loadState();
        }

        // 3. Trigger custom event for specific renderers (like food-log-renderer.js)
        window.dispatchEvent(new CustomEvent('aureus-nutrition-refreshed'));
    }

    /**
     * Delete a specific meal entry from Supabase.
     */
    async function deleteGranularMealEntry(entryId) {
        if (!window.supabaseClient) return;

        // Check Offline
        if (window.SyncCore && !window.SyncCore.isOnline()) {
            window.SyncCore.queueOperation({
                type: 'delete',
                table: 'nutrition_meal_log',
                id: entryId
            });
            window.SyncCore.setStatus(window.SyncCore.SyncStatus.OFFLINE, 'Eliminación guardada offline');
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('nutrition_meal_log')
                .delete()
                .eq('id', entryId);

            if (error) console.error("Error deleting meal entry:", error);
        } catch (err) {
            console.error("Error in deleteGranularMealEntry:", err);
        }
    }

    // Export to window
    window.syncGranularNutritionToSupabase = syncGranularNutritionToSupabase;
    window.loadGranularNutritionFromSupabase = loadGranularNutritionFromSupabase;
    window.loadHistoricalNutritionRangeFromSupabase = loadHistoricalNutritionRangeFromSupabase;
    window.refreshAllNutritionUI = refreshAllNutritionUI;
    window.deleteGranularMealEntry = deleteGranularMealEntry;

    /**
     * BRIDGE: window.syncLogToSupabase
     * This replaces the missing definition called by legacy code.
     */
    window.syncLogToSupabase = async (date, logData) => {
        // First save to localStorage for offline access/speed
        const userKey = window.getUserKey ? window.getUserKey(`aureus_log_${date}`) : `aureus_log_${date}`;
        localStorage.setItem(userKey, JSON.stringify(logData));

        // Use SyncCore debounced sync
        if (window.SyncCore) {
            window.SyncCore.debouncedSync(() => syncGranularNutritionToSupabase(date, logData));
        } else {
            // Fallback
            await syncGranularNutritionToSupabase(date, logData);
        }
    };

    // Cross-Tab Sync Listener
    if (window.SyncCore) {
        window.SyncCore.initCrossTabSync((key, newState) => {
            if (key.startsWith('aureus_log_')) {
                console.log(`🔄 Cross-tab nutrition update: ${key}`);
                window.refreshAllNutritionUI();
            }
        });
    }

    /**
     * SEED DATA FOR VERIFICATION
     * Generates distinct historical data for User 1 vs User 2 to verify isolation.
     */
    window.seedNutritionHistory = async () => {
        const localProfile = getProfileInfo();
        if (!localProfile) {
            console.error("No active profile found.");
            return;
        }

        const profile = await resolveRealProfile(localProfile);
        if (!profile) return;

        console.log(`🌱 Seeding data for ${profile.name} (${profile.id})...`);

        const today = new Date();
        const isUser2 = localProfile.id === 'user2';

        // Configuration for distinct data
        const config = isUser2 ? {
            // User 2 (Gio): Vegetarian/Light
            baseCals: 1500,
            hydration: 3000,
            meals: {
                breakfast: { name: "Avena con Frutas (User 2)", cals: 350, prot: 10, carb: 60, fat: 5 },
                lunch: { name: "Ensalada Quinoa (User 2)", cals: 450, prot: 15, carb: 50, fat: 15 },
                dinner: { name: "Tofu Salteado (User 2)", cals: 300, prot: 20, carb: 10, fat: 10 }
            }
        } : {
            // User 1 (Default): High Protein
            baseCals: 2500,
            hydration: 2000,
            meals: {
                breakfast: { name: "Huevos y Tocino (User 1)", cals: 600, prot: 40, carb: 5, fat: 45 },
                lunch: { name: "Pollo y Arroz (User 1)", cals: 800, prot: 60, carb: 80, fat: 20 },
                dinner: { name: "Steak y Papas (User 1)", cals: 900, prot: 70, carb: 60, fat: 40 }
            }
        };

        // Generate for last 6 days
        for (let i = 0; i < 6; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dailyLog = {
                hydration: { current: config.hydration, goal: 2500 },
                meals: {
                    breakfast: { items: [{ ...config.meals.breakfast, id: crypto.randomUUID() }] },
                    lunch: { items: [{ ...config.meals.lunch, id: crypto.randomUUID() }] },
                    dinner: { items: [{ ...config.meals.dinner, id: crypto.randomUUID() }] }
                }
            };

            await syncGranularNutritionToSupabase(dateStr, dailyLog);
            console.log(`Saved ${dateStr} for ${profile.name}`);
        }

        console.log("✅ Seeding complete! Refresh to see data.");
        alert(`Seeded 6 days of data for ${profile.name}`);
        window.refreshAllNutritionUI();
    };

})();
