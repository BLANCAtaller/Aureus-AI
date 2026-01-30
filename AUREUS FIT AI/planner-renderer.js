document.addEventListener('DOMContentLoaded', () => {

    // --- References ---
    const libraryList = document.getElementById('libraryList');
    const weeklyGridBody = document.getElementById('weeklyGridBody');
    const librarySearch = document.getElementById('librarySearch');
    const currentWeekNum = document.getElementById('currentWeekNum');
    const weekDateRange = document.getElementById('weekDateRange');
    const saveTemplateModal = document.getElementById('saveTemplateModal');
    const templateNameInput = document.getElementById('templateNameInput');
    const templateDescInput = document.getElementById('templateDescInput');

    // --- State ---
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    // Mock current date for "Next Week" planning
    let baseDate = new Date();
    // Adjust to Monday of current week
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day == 0 ? -6 : 1);
    let mondayDate = new Date(baseDate.setDate(diff));

    // --- Helper Functions for Dates ---
    function getDayName(dayKey) {
        return window.Locales.getTranslation(`meal_planner.days.${dayKey}`) || dayKey.toUpperCase();
    }

    function getDateForDay(dayKey) {
        const index = days.indexOf(dayKey);
        if (index === -1) return '';
        let d = new Date(mondayDate);
        d.setDate(mondayDate.getDate() + index);
        return d.getDate();
    }

    let weeklyPlan = JSON.parse(localStorage.getItem(getUserKey('aureus_weekly_plan'))) || {};

    // --- Initialization ---
    renderHeaderDates();
    renderLibrary();
    renderGridStructure();

    // Safety check for loadSavedPlan
    try {
        loadSavedPlan();
    } catch (e) {
        console.error("Error loading saved plan:", e);
    }

    // Ensure summaries update after load
    updateDailySummaries();

    // Render Targets
    renderMacroTargets();

    document.addEventListener('aureus-global-save', (e) => {
        // For the planner, we usually open the template modal or just save
        if (saveTemplateModal) {
            saveTemplateModal.classList.remove('hidden');
            templateNameInput.value = '';
            templateDescInput.value = '';
            templateNameInput.focus();
        }
    });



    // --- SEARCH & FILTER LISTENERS ---
    if (librarySearch) {
        librarySearch.addEventListener('input', (e) => {
            renderLibrary(e.target.value);
        });
    }

    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active from all
            filterPills.forEach(p => p.classList.remove('active'));
            // Add to clicked
            pill.classList.add('active');
            // Render
            renderLibrary(librarySearch.value);
        });
    });

    // --- Header Dates ---
    function renderHeaderDates() {
        // Mocking the visual "Oct 16 - Oct 22" matching the user request image, 
        // but normally this would be dynamic based on 'mondayDate'
        const options = { month: 'short', day: 'numeric' };

        // Loop through header cells to update dates
        const dayHeaders = document.querySelectorAll('.day-col-header');
        dayHeaders.forEach((el, index) => {
            let d = new Date(mondayDate);
            d.setDate(mondayDate.getDate() + index);

            const numEl = el.querySelector('.day-num');
            if (numEl) numEl.innerText = d.getDate();

            // Reset classes
            el.classList.remove('weekend');
            const nameEl = el.querySelector('.day-name');
            if (nameEl) {
                nameEl.classList.remove('active');
                // Localize Day Name
                const dayKey = days[index]; // 'mon', 'tue'...
                const localizedDay = window.Locales.getTranslation(`meal_planner.days.${dayKey}`);
                if (localizedDay) nameEl.innerText = localizedDay;
            }
            if (numEl) numEl.classList.remove('active');

            // Weekend highlight (Saturday is index 5, Sunday is index 6 since we start from Monday)
            if (index === 5 || index === 6) {
                el.classList.add('weekend');
            }

            // Highlight today
            const today = new Date();
            if (d.toDateString() === today.toDateString()) {
                if (nameEl) nameEl.classList.add('active');
                if (numEl) numEl.classList.add('active');
                el.classList.add('today');
            } else {
                el.classList.remove('today');
            }
        });

        // Update range text
        let sunday = new Date(mondayDate);
        sunday.setDate(mondayDate.getDate() + 6);
        // Use current language for date formatting
        const locale = window.Locales.currentLang === 'es' ? 'es-ES' : (window.Locales.currentLang === 'fr' ? 'fr-FR' : 'en-US');
        weekDateRange.innerText = `${mondayDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`;
    }

    // --- Render Library ---
    function renderLibrary(filterString = '') {
        libraryList.innerHTML = '';

        // Get active filter
        const activeTab = document.querySelector('.filter-pill.active');
        const activeFilter = activeTab ? activeTab.dataset.filter : 'all';

        // Initialize Data using optimized loader
        let db = window.getAureusFoodDB ? window.getAureusFoodDB() : JSON.parse(localStorage.getItem(getUserKey('aureus_food_db')));
        if (!db) {
            db = (typeof foodDatabase !== 'undefined') ? [...foodDatabase] : [];
        }
        let items = [...db];

        // Apply Category Filter

        if (activeFilter !== 'all') {
            if (activeFilter === 'favorites') {
                items = items.filter(f => f.favourite);
            } else {
                // Category Filter
                items = items.filter(f => f.category === activeFilter);
            }
        }

        // Apply Search Filter
        if (filterString) {
            items = items.filter(f => f.name.toLowerCase().includes(filterString.toLowerCase()));
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'lib-food-item';
            div.draggable = true; // Enable Drag
            div.dataset.food = JSON.stringify(item); // Store data for touch/click events if needed

            // Choose image or icon
            let media = '';
            if (item.image) {
                media = `<img src="${item.image}" class="lib-thumb">`;
            } else {
                media = `<div class="lib-icon-placeholder"><i class="fa-solid ${item.icon || 'fa-utensils'}"></i></div>`;
            }

            // Status color
            let statusClass = item.status || 'safe';

            div.innerHTML = `
                <i class="fa-solid fa-grip-vertical" style="color: #52525b; margin-right: 12px; cursor: grab;"></i>
                ${media}
                <div class="lib-info">
                    <div class="lib-name">${item.name}</div>
                    <div class="lib-meta">${item.purines || 0}mg Purines • ${item.carb || 0}g Carb</div>
                </div>
                <div class="lib-status-dot ${statusClass}" style="margin-left: auto;"></div>
            `;



            // Drag Event
            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'copy';
                div.classList.add('dragging');
            });

            div.addEventListener('dragend', () => {
                div.classList.remove('dragging');
            });

            // Click to Edit (New Feature)
            div.addEventListener('click', (e) => {
                // Determine index in global array
                const index = db.findIndex(f => f.id === item.id || f.name === item.name);
                if (index !== -1 && window.openEditor) {
                    window.openEditor(item, index);
                }
            });

            libraryList.appendChild(div);
        });
    }

    // --- Render Grid ---
    function renderGridStructure() {
        const meals = [
            { id: 'breakfast', label: window.Locales.getTranslation('dashboard.breakfast') || 'BREAKFAST', icon: 'fa-sun', color: '#facc15' }, // Yellow
            { id: 'lunch', label: window.Locales.getTranslation('dashboard.lunch') || 'LUNCH', icon: 'fa-stopwatch', color: '#fb923c' },   // Orange
            { id: 'dinner', label: window.Locales.getTranslation('dashboard.dinner') || 'DINNER', icon: 'fa-moon', color: '#818cf8' },      // Indigo
            { id: 'snack', label: window.Locales.getTranslation('dashboard.snack') || 'SNACK', icon: 'fa-apple-whole', color: '#4ade80' }, // Green
            { id: 'drinks', label: window.Locales.getTranslation('meal_planner.filters.drinks') || 'DRINKS', icon: 'fa-glass-water', color: '#22d3ee' } // Cyan
        ];

        weeklyGridBody.innerHTML = '';

        meals.forEach(meal => {
            const row = document.createElement('div');
            row.className = 'grid-row';

            // Row Label
            const labelCell = document.createElement('div');
            labelCell.className = 'grid-label-cell';
            labelCell.innerHTML = `
                <div class="meal-icon-circle"><i class="fa-solid ${meal.icon}" style="color: ${meal.color}; filter: drop-shadow(0 0 5px ${meal.color}40);"></i></div>
                <span class="meal-label-text">${meal.label}</span>
            `;
            row.appendChild(labelCell);

            // Day Cells
            days.forEach((day, index) => {
                const cell = document.createElement('div');
                cell.style.minWidth = '0'; // Allow shrinking
                cell.style.width = '100%'; // Fill grid column
                cell.className = 'grid-cell';
                cell.dataset.day = day;
                cell.dataset.meal = meal.id;
                cell.id = `cell-${day}-${meal.id}`; // Unique ID for easy lookup

                // Placeholder "Add" button
                cell.innerHTML = `<div class="add-cell-btn"><i class="fa-solid fa-plus"></i></div>`;

                // Drag Drop Logic
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Allow drop
                    cell.classList.add('drag-over');
                });

                cell.addEventListener('dragleave', () => {
                    cell.classList.remove('drag-over');
                });

                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    cell.classList.remove('drag-over');

                    const stored = e.dataTransfer.getData('text/plain');
                    const sourceDay = e.dataTransfer.getData('source_day');
                    const sourceMeal = e.dataTransfer.getData('source_meal');

                    if (stored) {
                        try {
                            const foodItem = JSON.parse(stored);

                            // Check if it's a move operation (same day/meal move could be blocked if desired, but we'll allow re-ordering intent visually)
                            if (sourceDay && sourceMeal) {
                                // If dropped in same cell, do nothing or handle reorder (we'll just return to prevent dupes if simple list)
                                if (sourceDay === cell.dataset.day && sourceMeal === cell.dataset.meal) return;

                                // Remove from old location
                                removeFromStorage(sourceDay, sourceMeal, foodItem.name);
                                const sourceCell = document.getElementById(`cell-${sourceDay}-${sourceMeal}`);
                                if (sourceCell) {
                                    // Remove the specific tag visually from source
                                    const tags = sourceCell.querySelectorAll('.plan-meal-tag');
                                    for (const t of tags) {
                                        if (t.querySelector('.tag-name').innerText === foodItem.name) {
                                            t.remove();
                                            break;
                                        }
                                    }
                                    // Restore placeholder if empty
                                    if (sourceCell.children.length === 0) {
                                        sourceCell.innerHTML = `<div class="add-cell-btn"><i class="fa-solid fa-plus"></i></div>`;
                                    }
                                }
                            }

                            addFoodToCell(cell, foodItem, true); // true = save to storage
                        } catch (e) { console.error("Drop error", e); }
                    }
                });

                // Click to add placeholder (Optional: could open modal)
                cell.addEventListener('click', (e) => {
                    if (e.target.closest('.add-cell-btn')) {
                        // Placeholder click interaction
                    }
                });

                row.appendChild(cell);
            });

            weeklyGridBody.appendChild(row);
        });
    }

    function addFoodToCell(cell, item, save = false) {
        // Clear cell if it has placeholder
        if (cell.querySelector('.add-cell-btn')) {
            cell.innerHTML = '';
        }

        const tag = document.createElement('div');
        tag.className = 'plan-meal-tag';
        tag.draggable = true; // Enable Drag for Move
        // Fade in
        tag.style.animation = 'fadeIn 0.3s ease';


        // Thumbnail logic
        let thumbHtml = '';
        if (item.image && item.image.length > 5) {
            thumbHtml = `<img src="${item.image}" class="plan-meal-thumb" data-full-src="${item.image}">`;
        }

        tag.innerHTML = `
            <div class="tag-content">
                ${thumbHtml}
                <span class="tag-dot" style="background:${item.status === 'safe' ? 'var(--primary-lime)' : (item.status === 'avoid' ? 'var(--accent-red)' : 'var(--accent-orange)')}"></span>
                <span class="tag-name">${item.name}</span>
            </div>
            <i class="fa-solid fa-xmark remove-btn"></i>
        `;

        // Drag Start (Move)
        tag.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(item));
            e.dataTransfer.setData('source_day', cell.dataset.day);
            e.dataTransfer.setData('source_meal', cell.dataset.meal);
            e.dataTransfer.effectAllowed = 'move';
            tag.classList.add('moving');
        });

        tag.addEventListener('dragend', () => {
            tag.classList.remove('moving');
        });

        // Remove listener (Specific X button)
        tag.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening edit modal

            // Visual Remove
            tag.remove();

            // Check if empty
            if (cell.children.length === 0) {
                cell.innerHTML = `<div class="add-cell-btn"><i class="fa-solid fa-plus"></i></div>`;
            }

            // Update Storage
            removeFromStorage(cell.dataset.day, cell.dataset.meal, item.name);
        });

        // Optional: Main tag click could show details
        tag.addEventListener('click', (e) => {
            // If clicked on thumbnail, don't open editor, open preview
            if (e.target.classList.contains('plan-meal-thumb')) {
                e.preventDefault();
                e.stopPropagation();
                const modal = document.getElementById('imagePreviewModal');
                const fullImg = document.getElementById('previewImageFull');

                // Get Source Robustly
                let src = e.target.dataset.fullSrc; // Try data attribute first
                if (!src) src = e.target.getAttribute('src'); // Then exact attribute
                if (!src) src = e.target.src; // Finally resolved URL

                if (modal && fullImg && src) {
                    console.log("Opening preview for:", src);
                    fullImg.src = src;
                    modal.classList.remove('hidden');
                    // Force display flex via inline style override if class hidden was relying on display none
                    modal.style.display = 'flex';
                } else {
                    console.warn("Could not open preview. Missing Modal, Image Element, or Source", { modal, fullImg, src });
                }
                return;
            }
            openEditModal(item, cell);
        });

        cell.appendChild(tag);

        if (save) {
            saveToStorage(cell.dataset.day, cell.dataset.meal, item);
        }
    }

    // --- Storage Logic ---
    function saveToStorage(day, mealType, item) {
        if (!weeklyPlan[day]) weeklyPlan[day] = {};
        if (!weeklyPlan[day][mealType]) weeklyPlan[day][mealType] = [];

        weeklyPlan[day][mealType].push(item);
        localStorage.setItem(getUserKey('aureus_weekly_plan'), JSON.stringify(weeklyPlan));
        updateDailySummaries();
    }

    function removeFromStorage(day, mealType, itemName) {
        if (weeklyPlan[day] && weeklyPlan[day][mealType]) {
            weeklyPlan[day][mealType] = weeklyPlan[day][mealType].filter(i => i.name !== itemName);
            localStorage.setItem(getUserKey('aureus_weekly_plan'), JSON.stringify(weeklyPlan));
            updateDailySummaries();
        }
    }

    function loadSavedPlan() {
        if (!weeklyPlan) return;

        // Iterate through days and meals
        for (const [day, meals] of Object.entries(weeklyPlan)) {
            for (const [mealType, items] of Object.entries(meals)) {
                const cellId = `cell-${day}-${mealType}`;
                const cell = document.getElementById(cellId);
                if (cell && items.length > 0) {
                    items.forEach(item => {
                        addFoodToCell(cell, item, false); // false = don't re-save
                    });
                }
            }
        }
    }

    // --- Daily Summaries ---
    function updateDailySummaries() {
        // Fetch Targets Logic (Duplicated for availability)
        let targets = { calories: 2000, prot: 125, fat: 155, carb: 25 };
        const saved = localStorage.getItem(getUserKey('aureus_user_settings'));
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.targets) targets = parsed.targets;
            } catch (e) { console.error(e); }
        }

        // Normalize Limits
        const limitCal = Number(targets.calories || targets.k || 2000);
        const limitProt = Number(targets.prot || targets.p || 125);
        const limitFat = Number(targets.fat || targets.f || 155);
        const limitCarb = Number(targets.carb || targets.c || 25);

        days.forEach(day => {
            let totalCal = 0;
            let totalPurines = 0;
            let totalFat = 0;
            let totalProt = 0;
            let totalCarb = 0;

            const dayPlan = weeklyPlan[day];
            if (dayPlan) {
                // Iterate breakfast, lunch, dinner
                Object.values(dayPlan).forEach(mealItems => {
                    mealItems.forEach(item => {
                        totalCal += Number(item.cal) || 0;
                        totalPurines += Number(item.purines) || 0;
                        totalFat += Number(item.fat) || 0;
                        totalProt += Number(item.prot) || 0;
                        totalCarb += Number(item.carb) || 0;
                    });
                });
            }

            const summaryEl = document.getElementById(`summary-${day}`);
            if (summaryEl) {
                // Check Limits and assign classes (using new .daily-macro-pill .warning override)
                const calStyle = totalCal > limitCal ? 'color: var(--accent-red); font-weight: 700;' : '';
                const protClass = totalProt > limitProt ? 'warning' : '';
                const fatClass = totalFat > limitFat ? 'warning' : '';
                const carbClass = totalCarb > limitCarb ? 'warning' : '';

                summaryEl.innerHTML = `
                    <div class="sum-day">${getDayName(day)}</div>
                    <div class="sum-date">${getDateForDay(day)}</div>
                    <div class="sum-cal" style="${calStyle}">${Math.round(totalCal).toLocaleString('en-US')} KCAL</div>
                    <div class="sum-pur">${Math.round(totalPurines).toLocaleString('en-US')}mg Purine</div>
                    
                    <div class="daily-summary-macros">
                        <div class="daily-macro-pill ${protClass}">
                            <i class="fa-solid fa-hourglass-half prot-icon"></i>
                            <span class="val">${Math.round(totalProt).toLocaleString('en-US')}</span>
                            <span class="label">prot</span>
                        </div>
                        <div class="daily-macro-pill ${fatClass}">
                            <i class="fa-solid fa-droplet fat-icon"></i>
                            <span class="val">${Math.round(totalFat).toLocaleString('en-US')}</span>
                            <span class="label">fat</span>
                        </div>
                        <div class="daily-macro-pill ${carbClass}">
                            <i class="fa-solid fa-wheat-awn carb-icon"></i>
                            <span class="val">${Math.round(totalCarb).toLocaleString('en-US')}</span>
                            <span class="label">carb</span>
                        </div>
                    </div>
                `;
            }
        });
    }

    // --- Edit Modal Logic (Updated for New Modal) ---
    const editModal = document.getElementById('foodEditorModal');
    const editForm = document.getElementById('foodEditorForm'); // Using form now!

    // Inputs in New Modal
    const editName = document.getElementById('editName');
    const editImage = document.getElementById('editImage');
    const editCategory = document.getElementById('editCategory');
    const editStatus = document.getElementById('editStatus');
    const editCal = document.getElementById('editCal');
    const editPurines = document.getElementById('editPurines');
    const editFat = document.getElementById('editFat');
    const editProt = document.getElementById('editProt');

    const editCarb = document.getElementById('editCarbs'); // Note: ID in HTML is editCarbs
    const editTip = document.getElementById('editTip');

    // Glycemic Inputs
    const editGI = document.getElementById('editGI');
    const displayGL = document.getElementById('displayGL');
    const glProgressBar = document.getElementById('glProgressBar');
    const glRiskLabel = document.getElementById('glRiskLabel');

    // Actions
    const btnCancel = document.querySelector('.close-modal'); // Standard close
    const btnDelete = document.getElementById('btnDeleteFood'); // Trash icon

    let currentEditItem = null;
    let currentEditCell = null;

    // Helper to open modal

    function openEditModal(item, cell) {
        // Hydrate item if missing details (e.g. from template)
        let fullItem = item;
        // Store original name key for safe deletion/renaming
        const originalNameKey = item.name;

        if ((!item.cal && item.name) || (!item.image && item.name)) {
            // Try to find in DB (Case insensitive & trimmed)
            const searchName = item.name.trim().toLowerCase();
            // 1. Exact match
            let dbMatch = foodDatabase.find(f => f.name.trim().toLowerCase() === searchName);
            // 2. Fuzzy match
            if (!dbMatch) {
                dbMatch = foodDatabase.find(f => {
                    const dbName = f.name.trim().toLowerCase();
                    return dbName.includes(searchName) || searchName.includes(dbName);
                });
            }

            if (dbMatch) {
                fullItem = {
                    ...item,
                    ...dbMatch,
                    cal: item.cal || dbMatch.cal,
                    prot: item.prot || dbMatch.prot,
                    carb: item.carb || dbMatch.carb,
                    fat: item.fat || dbMatch.fat,
                    gi: item.gi || dbMatch.gi,
                    image: item.image || dbMatch.image,
                    category: item.category || dbMatch.category
                };
            }
        }

        currentEditItem = fullItem;
        currentEditItem._originalKey = originalNameKey;
        currentEditCell = cell;

        // Use local selectors to ensure we find elements even if global consts failed
        const inpName = document.getElementById('editName');
        const inpImage = document.getElementById('editImage');
        const inpCategory = document.getElementById('editCategory');
        const inpStatus = document.getElementById('editStatus');
        const inpCal = document.getElementById('editCal');
        const inpPurines = document.getElementById('editPurines');
        const inpFat = document.getElementById('editFat');
        const inpProt = document.getElementById('editProt');
        const inpCarb = document.getElementById('editCarbs');
        const inpTip = document.getElementById('editTip');
        const inpGI = document.getElementById('editGI');

        // Populate fields
        if (inpName) inpName.value = fullItem.name || '';
        if (inpImage) inpImage.value = fullItem.image || '';
        if (inpCategory) inpCategory.value = fullItem.category || 'Others';
        if (inpStatus) inpStatus.value = fullItem.status || 'safe';

        if (inpCal) inpCal.value = fullItem.cal || 0;
        if (inpPurines) inpPurines.value = fullItem.purines || 0;
        if (inpFat) inpFat.value = fullItem.fat || 0;
        if (inpProt) inpProt.value = fullItem.prot || 0;
        if (inpCarb) inpCarb.value = fullItem.carb || 0;

        if (inpTip) inpTip.value = fullItem.tips || fullItem.tip || '';

        // GL Logic
        if (inpGI) {
            inpGI.value = fullItem.gi || 0;
            updateGLVisuals();

            // Auto-calc on change
            inpGI.oninput = updateGLVisuals;
            if (inpCarb) inpCarb.addEventListener('input', updateGLVisuals);
        }

        // --- INGREDIENTS LOGIC ---
        const ingGrid = document.getElementById('editIngredientsGrid');
        if (ingGrid) {
            ingGrid.innerHTML = ''; // clear existing
            const ingredients = fullItem.ingredients || [];
            ingredients.forEach(ing => {
                const pill = document.createElement('div');
                pill.className = 'ing-pill-edit';
                pill.style.cssText = "background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); padding:5px 10px; border-radius:15px; font-size:12px; display:flex; align-items:center; gap:5px;";
                pill.innerHTML = `
                    <span>${ing.name || ing}</span>
                    <span style="color:#a1a1aa; font-size:10px;">${ing.amount || ''}</span>
                    <i class="fa-solid fa-xmark remove-ing" style="cursor:pointer; margin-left:5px; color:#ef4444;"></i>
                `;

                // Remove logic
                pill.querySelector('.remove-ing').addEventListener('click', () => {
                    pill.remove();
                });

                ingGrid.appendChild(pill);
            });
        }

        // --- IMAGE PREVIEW LOGIC ---
        // If image URL exists, show it instead of icon
        const iconDisplay = document.getElementById('iconDisplay');
        if (iconDisplay) {
            if (fullItem.image && fullItem.image.length > 5) {
                // Show image
                iconDisplay.innerHTML = `<img src="${fullItem.image}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            } else {
                // Show default icon
                iconDisplay.innerHTML = '<i class="fa-solid fa-utensils"></i>';
            }
        }

        // Live Image Update
        if (inpImage && iconDisplay) {
            inpImage.addEventListener('input', () => {
                const url = inpImage.value.trim();
                if (url.length > 5) {
                    iconDisplay.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" onerror="this.parentNode.innerHTML='<i class=\\'fa-solid fa-utensils\\'></i>'">`;
                } else {
                    iconDisplay.innerHTML = '<i class="fa-solid fa-utensils"></i>';
                }
            });
        }

        // --- INGREDIENT MINI MODAL ---
        const btnAddIng = document.getElementById('btnAddIngredient');
        const miniModal = document.getElementById('ingredientMiniModal');
        const btnCloseMini = document.getElementById('closeIngModal');
        const btnSaveIng = document.getElementById('btnSaveIng');

        if (btnAddIng && miniModal) {
            btnAddIng.onclick = () => {
                document.getElementById('ingEditName').value = '';
                document.getElementById('ingEditAmount').value = '';
                miniModal.classList.remove('hidden');
            };
        }

        if (btnCloseMini && miniModal) {
            btnCloseMini.onclick = () => miniModal.classList.add('hidden');
        }

        if (btnSaveIng && miniModal && ingGrid) {
            btnSaveIng.onclick = () => {
                const name = document.getElementById('ingEditName').value.trim();
                const amt = document.getElementById('ingEditAmount').value.trim();
                if (!name) return;

                const pill = document.createElement('div');
                pill.className = 'ing-pill-edit';
                pill.style.cssText = "background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); padding:5px 10px; border-radius:15px; font-size:12px; display:flex; align-items:center; gap:5px;";
                pill.innerHTML = `
                    <span>${name}</span>
                    <span style="color:#a1a1aa; font-size:10px;">${amt}</span>
                    <i class="fa-solid fa-xmark remove-ing" style="cursor:pointer; margin-left:5px; color:#ef4444;"></i>
                `;

                pill.querySelector('.remove-ing').addEventListener('click', () => pill.remove());
                ingGrid.appendChild(pill);
                miniModal.classList.add('hidden');
            };
        }

        // --- BUTTONS WIRING ---
        // 1. Delete Button
        const btnDel = document.getElementById('btnDeleteFoodAction');
        if (btnDel) {
            btnDel.classList.remove('hidden');
            const newBtn = btnDel.cloneNode(true);
            btnDel.parentNode.replaceChild(newBtn, btnDel);

            newBtn.addEventListener('click', () => {
                const day = currentEditCell.dataset.day;
                const meal = currentEditCell.dataset.meal;

                removeFromStorage(day, meal, currentEditItem._originalKey || currentEditItem.name);

                const tags = currentEditCell.querySelectorAll('.plan-meal-tag');
                tags.forEach(t => {
                    if (t.innerText.includes(currentEditItem.name)) t.remove();
                });
                closeEditModal();
            });
        }

        // 2. Cancel Button
        const btnCan = document.getElementById('btnCancelEditFood');
        if (btnCan) {
            const newCan = btnCan.cloneNode(true);
            btnCan.parentNode.replaceChild(newCan, btnCan);
            newCan.onclick = (e) => { e.preventDefault(); closeEditModal(); };
        }

        // 3. Save Button
        const btnSave = document.getElementById('btnSaveEditFood');
        if (btnSave) {
            const newSave = btnSave.cloneNode(true);
            btnSave.parentNode.replaceChild(newSave, btnSave);
            newSave.onclick = (e) => {
                e.preventDefault();
                saveFoodChanges();
            };
        }

        if (editModal) editModal.classList.remove('hidden');
    }

    function updateGLVisuals() {
        const inpGI = document.getElementById('editGI');
        const inpCarb = document.getElementById('editCarbs');
        const dGL = document.getElementById('displayGL');
        const pBar = document.getElementById('glProgressBar');
        const rLabel = document.getElementById('glRiskLabel');

        if (!inpGI || !dGL || !inpCarb) return;

        const gi = parseFloat(inpGI.value) || 0;
        const carbs = parseFloat(inpCarb.value) || 0;
        const gl = (gi * carbs) / 100;

        dGL.innerText = Math.round(gl);

        // Visuals
        let risk = "Low Risk";
        let color = "#4ade80"; // Green
        let width = "33%";

        if (gl >= 10) {
            risk = "Medium Risk";
            color = "#facc15"; // Yellow
            width = "66%";
        }
        if (gl >= 20) {
            risk = "High GL Risk";
            color = "#ef4444"; // Red
            width = "100%";
        }

        if (rLabel) {
            rLabel.innerText = risk;
            rLabel.style.color = color;
        }
        if (pBar) {
            pBar.style.width = width;
            pBar.style.backgroundColor = color;
        }
    }

    function closeEditModal() {
        if (editModal) editModal.classList.add('hidden');
        currentEditItem = null;
        currentEditCell = null;
    }

    function saveFoodChanges() {
        const inpName = document.getElementById('editName');
        const inpCal = document.getElementById('editCal');
        const inpPurines = document.getElementById('editPurines');
        const inpFat = document.getElementById('editFat');
        const inpProt = document.getElementById('editProt');
        const inpCarb = document.getElementById('editCarbs');
        const inpGI = document.getElementById('editGI');
        const inpStatus = document.getElementById('editStatus');
        const inpCategory = document.getElementById('editCategory');
        const inpImage = document.getElementById('editImage');
        const inpTip = document.getElementById('editTip');

        const newItem = {
            ...currentEditItem,
            name: inpName ? inpName.value : currentEditItem.name,
            cal: inpCal ? parseFloat(inpCal.value) : 0,
            purines: inpPurines ? parseFloat(inpPurines.value) : 0,
            fat: inpFat ? parseFloat(inpFat.value) : 0,
            prot: inpProt ? parseFloat(inpProt.value) : 0,
            carb: inpCarb ? parseFloat(inpCarb.value) : 0,
            gi: inpGI ? parseFloat(inpGI.value) : 0,
            status: inpStatus ? inpStatus.value : 'safe',
            category: inpCategory ? inpCategory.value : 'Others',
            image: inpImage ? inpImage.value : '',
            tips: inpTip ? inpTip.value : '',
            ingredients: [] // Will populate below
        };

        // Scrape key ingredients from DOM pills
        const ingGrid = document.getElementById('editIngredientsGrid');
        if (ingGrid) {
            const pills = ingGrid.querySelectorAll('.ing-pill-edit');
            pills.forEach(p => {
                const spans = p.querySelectorAll('span');
                const name = spans[0] ? spans[0].innerText : '';
                const amt = spans[1] ? spans[1].innerText : '';
                if (name) {
                    newItem.ingredients.push({ name: name, amount: amt });
                }
            });
        }

        const day = currentEditCell.dataset.day;
        const meal = currentEditCell.dataset.meal;

        // Remove OLD item using original key, then add NEW item
        removeFromStorage(day, meal, currentEditItem._originalKey || currentEditItem.name);
        saveToStorage(day, meal, newItem);

        // Visual remove old tag
        const tags = currentEditCell.querySelectorAll('.plan-meal-tag');
        tags.forEach(t => {
            if (t.innerText.includes(currentEditItem.name) || (currentEditItem._originalKey && t.innerText.includes(currentEditItem._originalKey))) {
                t.remove();
            }
        });

        // Add new tag visually
        addFoodToCell(currentEditCell, newItem);
        closeEditModal();
    }

    // Attach Close Listeners
    if (btnCancel) btnCancel.onclick = (e) => { e.preventDefault(); closeEditModal(); };
    const closeIcon = editModal ? editModal.querySelector('.close-modal-icon') : null; // If explicit icon exists
    if (closeIcon) closeIcon.onclick = closeEditModal;

    // Save Logic (Form Submit)
    if (editForm) {
        // Remove old listeners to prevent stacking if any (though cleaner to use named function, anonymous ok here as run once)
        const newForm = editForm.cloneNode(true);
        editForm.parentNode.replaceChild(newForm, editForm);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentEditItem || !currentEditCell) return;

            // Update item values
            const newItem = { ...currentEditItem };
            if (editName) newItem.name = editName.value;
            if (editImage) newItem.image = editImage.value;
            if (editCategory) newItem.category = editCategory.value;
            if (editStatus) newItem.status = editStatus.value;

            if (editCal) newItem.cal = Number(editCal.value);
            if (editPurines) newItem.purines = Number(editPurines.value);
            if (editFat) newItem.fat = Number(editFat.value);
            if (editProt) newItem.prot = Number(editProt.value);
            if (editCarb) newItem.carb = Number(editCarb.value);

            if (editTip) { newItem.tips = editTip.value; newItem.tip = newItem.tips; }

            // Save GI
            if (editGI) newItem.gi = Number(editGI.value);

            // Update CSS/HTML in cell
            const tags = currentEditCell.querySelectorAll('.plan-meal-tag');
            for (const t of tags) {
                // Find tag by previous name
                if (t.innerText.includes(currentEditItem.name)) {
                    // Update Text Node directly? structure is <div class="tag-name">Name</div>
                    const nameSpan = t.querySelector('.tag-name');
                    if (nameSpan) nameSpan.innerText = newItem.name;
                    // Could update color etc.
                    break;
                }
            }

            // Update Storage
            updateItemInStorage(currentEditCell.dataset.day, currentEditCell.dataset.meal, currentEditItem.name, newItem);
            closeEditModal();
        });
    }

    // Delete Logic
    if (btnDelete) {
        btnDelete.onclick = (e) => { // Use onclick to override any previous
            e.preventDefault();
            if (!currentEditItem || !currentEditCell) return;

            if (confirm(`Delete ${currentEditItem.name}?`)) {
                // Visual Remove
                const tags = currentEditCell.querySelectorAll('.plan-meal-tag');
                for (const t of tags) {
                    if (t.innerText.includes(currentEditItem.name)) {
                        t.remove();
                        break;
                    }
                }
                if (currentEditCell.children.length === 0) {
                    currentEditCell.innerHTML = `<div class="add-cell-btn"><i class="fa-solid fa-plus"></i></div>`;
                    // Re-add click listener for empty cell?
                    // Better to just reload cell or use delegation for add-btn
                    const addBtn = currentEditCell.querySelector('.add-cell-btn');
                    if (addBtn) addBtn.onclick = () => openLibrary(currentEditCell.dataset.day, currentEditCell.dataset.meal);
                }

                // Storage Remove
                removeFromStorage(currentEditCell.dataset.day, currentEditCell.dataset.meal, currentEditItem.name);
                closeEditModal();
            }
        };
    }

    function updateItemInStorage(day, mealType, oldName, newItem) {
        if (weeklyPlan[day] && weeklyPlan[day][mealType]) {
            const index = weeklyPlan[day][mealType].findIndex(i => i.name === oldName);
            if (index !== -1) {
                weeklyPlan[day][mealType][index] = newItem;
                localStorage.setItem(getUserKey('aureus_weekly_plan'), JSON.stringify(weeklyPlan));
                updateDailySummaries();

                // Refresh Grid Cell completely to be safe
                const cell = document.getElementById(`cell-${day}-${mealType}`);
                if (cell) {
                    cell.innerHTML = '';
                    weeklyPlan[day][mealType].forEach(itm => addFoodToCell(cell, itm, false));
                    // Re-append add button if needed? usually handled by addFoodToCell logic? 
                    // No, addFoodToCell appends tags. We need to handle "empty state" or "add button" logic.
                    // The planner usually has an add button *always*? Or only if empty?
                    // Answer: The UI shows tags. If we click cell, it opens Library?
                    // Actually, looking at `renderGridStructure`, cells start empty with `.add-cell-btn`.
                    // `addFoodToCell` appends `.plan-meal-tag`.
                    // So we should append `add-cell-btn` if it's missing? Or is the planner designed to just click empty space?
                    // Let's assume standard behavior: Click empty space -> Library.
                }
            }
        }
    }


    // --- Search Listener ---
    librarySearch.addEventListener('input', (e) => {
        renderLibrary(e.target.value);
    });

    // --- Tab Listeners ---
    document.querySelectorAll('.filter-pill').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderLibrary(librarySearch.value);
        });
    });

    // Initial update
    updateDailySummaries();

    // --- TEMPLATE LOGIC (Added Feature) ---
    // 1. Open Modal handled by global-sync e.dispatchEvent(new CustomEvent('aureus-global-save'))
    // but we can still keep the old ID listener for backward compatibility if needed, 
    // although we changed the ID in HTML to globalSaveBtn.
    const globalBtn = document.getElementById('globalSaveBtn');
    if (globalBtn) {
        // global-sync.js already adds a click listener to this, 
        // we just listen for the custom event.
    }

    // Fix: Manage Button Listener
    const btnManageTemplates = document.querySelector('.btn-manage');
    if (btnManageTemplates) {
        btnManageTemplates.addEventListener('click', (e) => {
            e.preventDefault();
            // Reuse save template modal or create a new manager modal?
            // For now, let's open the save modal as a simple "Manager" entry point
            // Or better, toggle the list visibility if we had a collapsible design, 
            // but the design shows it as a link. Let's make it open the save modal 
            // so user can see list + save new one.
            if (saveTemplateModal) {
                saveTemplateModal.classList.remove('hidden');
                // Focus name to suggest saving, but list is also visible there?
                // Wait, the screenshot shows the list IN the sidebar.
                // So maybe "Manage" should open a dedicated full modal?
                // Let's use the saveTemplateModal for now as it contains the list logic?
                // Actually, looking at code, renderTemplates() renders to templateList sidebar div.
                // The "Manage" link likely intends to open a bigger view.
                // For now, let's map it to open the 'saveTemplateModal' which seems to double as a manager?
                // Checking HTML, saveTemplateModal has templateList inside? 
                // No, templateList is in sidebar (line 208 of HTML).
                // So "Saving" is one thing, "Managing" (Deleting/Loading) is already in sidebar.
                // "Manage" is likely redundant or should open a "Load Template" modal if sidebar is too small.
                // Let's make it open the Save Modal which is the only template-related modal we have.
                saveTemplateModal.classList.remove('hidden');
            }
        });
    }

    const confirmSaveTemplate = document.getElementById('confirmSaveTemplate');
    const templateList = document.getElementById('templateList');
    // const closeSaveModalBtns = document.querySelectorAll('.close-modal-save'); // Moved to unique selection to avoid conflict

    let savedTemplates = JSON.parse(localStorage.getItem(getUserKey('aureus_plan_templates'))) || [];

    // --- Seeding Templates (Pre-designed Plans) ---
    function seedTemplates() {
        // Incrementing version to v3 to force update existing users with the new varied templates
        const seedDone = localStorage.getItem(getUserKey('aureus_seed_templates_done_v8'));
        if (seedDone) return;

        // Find relevant foods from database
        const findFood = (name) => {
            const db = window.getAureusFoodDB ? window.getAureusFoodDB() : ((typeof foodDatabase !== 'undefined') ? foodDatabase : []);
            const food = db.find(f => f.name === name);
            if (!food) {
                console.warn(`Food not found for template seed: ${name}`);
                // Fallback safe object
                return { name, cal: 0, prot: 0, fat: 0, carb: 0, purines: 0, status: 'safe' };
            }
            return food;
        };

        // Hydrate SYSTEM_TEMPLATES with full food objects
        let defaultTemplates = [];
        if (typeof SYSTEM_TEMPLATES !== 'undefined') {
            defaultTemplates = SYSTEM_TEMPLATES.map(tmpl => {
                const hydratedPlan = {};
                if (tmpl.planData) {
                    Object.keys(tmpl.planData).forEach(day => {
                        hydratedPlan[day] = {};
                        Object.keys(tmpl.planData[day]).forEach(meal => {
                            if (Array.isArray(tmpl.planData[day][meal])) {
                                hydratedPlan[day][meal] = tmpl.planData[day][meal].map(item => findFood(item.name));
                            }
                        });
                    });
                }
                return {
                    ...tmpl,
                    planData: hydratedPlan
                };
            });
        }

        // Replace/Merge: 
        // Strategy for v7: CLEAN UP old system templates to remove duplicates.
        // We only keep templates that look like user created ones (numeric timestamp IDs)
        // or just hard reset if that's safer. Let's keep numeric IDs.
        let userTemplates = savedTemplates.filter(t => /^\d+$/.test(t.id));

        // Combine: System Templates (First in order) + User Templates
        let baseTemplates = [...defaultTemplates, ...userTemplates];

        try {
            localStorage.setItem(getUserKey('aureus_plan_templates'), JSON.stringify(baseTemplates));
            localStorage.setItem(getUserKey('aureus_seed_templates_done_v8'), 'true');
            savedTemplates = baseTemplates;
        } catch (e) {
            console.error("Failed to seed templates:", e);
        }
    }


    // Initialize Templates
    seedTemplates();
    renderTemplates();

    // 2. Close Modal
    // Re-select to ensure we get them
    document.querySelectorAll('.close-modal-save').forEach(btn => {
        btn.addEventListener('click', () => {
            if (saveTemplateModal) saveTemplateModal.classList.add('hidden');
        });
    });

    // 3. Save Logic
    if (confirmSaveTemplate) {
        confirmSaveTemplate.onclick = (e) => {
            e.preventDefault(); // Prevent form submission if in form

            // Re-fetch inputs to be safe
            const nameInput = document.getElementById('templateNameInput');
            const descInput = document.getElementById('templateDescInput');

            if (!nameInput) {
                console.error("Template name input not found");
                return;
            }

            const name = nameInput.value.trim();
            const desc = descInput ? descInput.value.trim() : '';

            if (!name) {
                alert("Por favor ingresa un nombre para la plantilla.");
                return;
            }

            try {
                // Ensure latest templates
                let currentTemplates = [];
                try {
                    currentTemplates = JSON.parse(localStorage.getItem(getUserKey('aureus_plan_templates'))) || [];
                } catch (err) {
                    currentTemplates = [];
                }

                // Check for existing
                const existingIndex = currentTemplates.findIndex(t => t.name.toLowerCase() === name.toLowerCase());

                if (existingIndex > -1) {
                    // OVERWRITE FLOW
                    if (confirm(`Una plantilla llamada "${name}" ya existe. ¿Deseas sobrescribirla?`)) {
                        currentTemplates[existingIndex].planData = JSON.parse(JSON.stringify(weeklyPlan));
                        currentTemplates[existingIndex].desc = desc || currentTemplates[existingIndex].desc;
                        currentTemplates[existingIndex].dateCreated = new Date().toISOString();

                        localStorage.setItem(getUserKey('aureus_plan_templates'), JSON.stringify(currentTemplates));

                        // Update local variable
                        savedTemplates = currentTemplates;
                        renderTemplates();

                        if (saveTemplateModal) saveTemplateModal.classList.add('hidden');
                        alert("¡Plantilla actualizada correctamente!");
                    }
                } else {
                    // CREATE NEW FLOW
                    const newTemplate = {
                        id: Date.now().toString(),
                        name: name,
                        desc: desc || `${new Date().toLocaleDateString()}`,
                        planData: JSON.parse(JSON.stringify(weeklyPlan)),
                        dateCreated: new Date().toISOString()
                    };

                    currentTemplates.push(newTemplate);
                    localStorage.setItem(getUserKey('aureus_plan_templates'), JSON.stringify(currentTemplates));

                    // Update local variable
                    savedTemplates = currentTemplates;
                    renderTemplates();

                    if (saveTemplateModal) saveTemplateModal.classList.add('hidden');
                    alert("¡Plantilla guardada con éxito!");
                }
            } catch (error) {
                console.error("Error saving template:", error);
                alert("Hubo un error al guardar la plantilla. Revisa la consola.");
            }
        };
    }

    // 4. Render Logic
    function renderTemplates() {
        // --- Sidebar List ---
        if (templateList) {
            templateList.innerHTML = '';
            if (savedTemplates.length === 0) {
                templateList.innerHTML = `<div style="text-align:center; color:#555; font-size:12px; padding:10px;">No saved templates yet</div>`;
            } else {
                savedTemplates.forEach(tmpl => {
                    const item = document.createElement('div');
                    item.className = 'template-item';
                    item.dataset.id = tmpl.id; // Store ID for deletion
                    const barColor = ['green', 'yellow', 'purple', 'blue'][Math.floor(Math.random() * 4)];

                    item.innerHTML = `
                        <div class="tmpl-left">
                            <div class="tmpl-bar ${barColor}"></div>
                            <div class="tmpl-info">
                                <div class="tmpl-name">${tmpl.name}</div>
                                <div class="tmpl-meta">${tmpl.desc}</div>
                            </div>
                        </div>
                        <div class="tmpl-actions">
                             <button class="btn-import-tmpl" title="Load Plan"><i class="fa-solid fa-download"></i></button>
                             <button class="btn-delete-tmpl" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                     `;


                    // Load Action (Instant as requested)
                    const btnImport = item.querySelector('.btn-import-tmpl');
                    if (btnImport) btnImport.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent bubbling

                        // User requested removal of double confirmations ("eliminaeso")
                        try {
                            if (tmpl.planData) {
                                weeklyPlan = JSON.parse(JSON.stringify(tmpl.planData));
                                localStorage.setItem(getUserKey('aureus_weekly_plan'), JSON.stringify(weeklyPlan));

                                // Refresh UI
                                renderGridStructure();
                                loadSavedPlan();
                                updateDailySummaries();

                                console.log(`Plan "${tmpl.name}" loaded successfully.`);
                                alert(`¡Plan "${tmpl.name}" cargado con éxito!`);
                            } else {
                                console.error("Template has no plan data.");
                                alert("Esta plantilla no tiene datos de plan guardados.");
                            }
                        } catch (err) {
                            console.error("Error loading template:", err);
                            alert("Error al cargar la plantilla: " + err.message);
                        }
                    });

                    // Delete Action handled by Global Delegation (see bottom of file)

                    templateList.appendChild(item);
                });
            }
        }

        // --- Modal List (Overwrite UI) ---
        const modalList = document.getElementById('modalTemplateList');
        if (modalList) {
            modalList.innerHTML = '';
            if (savedTemplates.length === 0) {
                modalList.innerHTML = `<div style="text-align:center; color:#555; font-size:12px; padding:10px;">No templates found. Save one below.</div>`;
            } else {
                savedTemplates.forEach(tmpl => {
                    const mItem = document.createElement('div');
                    mItem.className = 'modal-tmpl-card';
                    // Added Delete Button to Modal List
                    mItem.innerHTML = `
                        <div class="modal-tmpl-info">
                            <span class="modal-tmpl-name">${tmpl.name}</span>
                            <span class="modal-tmpl-desc">${tmpl.desc || ''}</span>
                        </div>
                        <button type="button" class="btn-delete-modal-item" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    `;

                    // Click to Autofill
                    mItem.addEventListener('click', (e) => {
                        // Ignore if delete button clicked
                        if (e.target.closest('.btn-delete-modal-item')) return;

                        document.getElementById('templateNameInput').value = tmpl.name;
                        const dInput = document.getElementById('templateDescInput');
                        if (dInput) dInput.value = tmpl.desc;
                    });

                    // Delete Action
                    const btnDel = mItem.querySelector('.btn-delete-modal-item');
                    if (btnDel) {
                        btnDel.onclick = (e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${tmpl.name}"?`)) {
                                savedTemplates = savedTemplates.filter(t => t.id !== tmpl.id);
                                localStorage.setItem(getUserKey('aureus_plan_templates'), JSON.stringify(savedTemplates));
                                renderTemplates(); // Re-render both lists
                            }
                        };
                    }

                    modalList.appendChild(mItem);
                });
            }
        }
    }

    // --- SHOPPING LIST LOGIC ---
    const btnShoppingList = document.getElementById('btnShoppingList');
    const shoppingListModal = document.getElementById('shoppingListModal');
    const shoppingListContainer = document.getElementById('shoppingListContainer');
    const closeShoppingBtns = document.querySelectorAll('.close-modal-shopping');
    const btnPrintShopping = document.getElementById('btnPrintShopping');

    if (btnShoppingList) {
        btnShoppingList.addEventListener('click', () => {
            generateShoppingList();
            shoppingListModal.classList.remove('hidden');
        });
    }

    closeShoppingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            shoppingListModal.classList.add('hidden');
        });
    });

    function generateShoppingList() {
        if (!shoppingListContainer) return;
        shoppingListContainer.innerHTML = '';

        const itemCounts = {};

        // Aggregate All Items
        Object.values(weeklyPlan).forEach(dayMeals => {
            Object.values(dayMeals).forEach(mealItems => {
                mealItems.forEach(item => {
                    if (itemCounts[item.name]) {
                        itemCounts[item.name].count++;
                    } else {
                        itemCounts[item.name] = {
                            count: 1,
                            category: item.category || 'Others'
                        };
                    }
                });
            });
        });

        // Group by Category
        const grouped = {};
        Object.entries(itemCounts).forEach(([name, data]) => {
            const cat = data.category;
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({ name, count: data.count });
        });

        const catOrder = ['Meats', 'Poultry', 'Seafood', 'Veggies', 'Fruits', 'Dairy', 'Nuts', 'Drinks', 'Fast Food', 'Others'];
        const sortedCats = Object.keys(grouped).sort((a, b) => {
            const idxA = catOrder.indexOf(a);
            const idxB = catOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        if (sortedCats.length === 0) {
            shoppingListContainer.innerHTML = `<div style="color:#666; text-align:center;">${window.Locales.getTranslation('meal_planner.pdf.no_meals') || 'No meals planned yet.'}</div>`;
            return;
        }

        sortedCats.forEach(cat => {
            const header = document.createElement('div');
            header.className = 'shopping-cat-header';
            // Try to localize category
            const filterKey = cat.toLowerCase().replace(' ', '_');
            const localizedCat = window.Locales.getTranslation(`meal_planner.filters.${filterKey}`);
            header.innerText = localizedCat || cat;

            shoppingListContainer.appendChild(header);

            // Sort alphabetical
            grouped[cat].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                const row = document.createElement('div');
                row.className = 'shopping-item-row';
                row.innerHTML = `
                    <label class="custom-checkbox">
                        <input type="checkbox">
                        <span class="checkmark"></span>
                    </label>
                    <span class="shop-name">${item.name}</span>
                    <span class="shop-count">x${item.count}</span>
                `;
                shoppingListContainer.appendChild(row);
            });
        });
    }

    if (btnPrintShopping) {
        btnPrintShopping.addEventListener('click', () => {
            let textToCopy = "AUREUS FIT AI - Shopping List\n";

            // Traverse DOM to preserve order
            Array.from(shoppingListContainer.children).forEach(child => {
                if (child.classList.contains('shopping-cat-header')) {
                    textToCopy += `\n[ ${child.innerText.toUpperCase()} ]\n`;
                } else if (child.classList.contains('shopping-item-row')) {
                    const name = child.querySelector('.shop-name').innerText;
                    const count = child.querySelector('.shop-count').innerText;
                    textToCopy += `- [ ] ${name} ${count}\n`;
                }
            });

            navigator.clipboard.writeText(textToCopy).then(() => {
                alert("Shopping list copied to clipboard!");
            });
        });
    }



    // --- PDF REPORT GENERATION ---
    const btnExportPDF = document.getElementById('btnExportPDF');
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', generatePDFReport);
    }

    async function generatePDFReport() {
        if (!window.jspdf || !window.jspdf.jsPDF || !window.Chart) {
            console.error("PDF Libraries (jsPDF/Chart.js) are not loaded yet.");
            return;
        }

        // RELOAD DATA: Ensure we have the latest plan from storage
        weeklyPlan = JSON.parse(localStorage.getItem(getUserKey('aureus_weekly_plan'))) || {};

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

        // --- BACKGROUND AUTOMATION ---
        // Override addPage to ensure every page (including autoTable ones) is black
        const originalAddPage = doc.addPage.bind(doc);
        doc.addPage = function () {
            const result = originalAddPage();
            this.setFillColor(...C_BG);
            this.rect(0, 0, pageWidth, pageHeight, 'F');
            return result;
        };

        // Initialize First Page Background
        doc.setFillColor(...C_BG);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // --- HELPERS ---
        const loadImage = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                // Only set crossOrigin if not loading from a local file to avoid CORS blocks
                if (window.location.protocol !== 'file:') {
                    img.crossOrigin = "Anonymous";
                }

                // Robust URL generation for local vs remote
                const isLocal = window.location.protocol === 'file:';
                const isDataUri = url && url.startsWith('data:');

                let fetchUrl = url;
                if (url && !isDataUri) {
                    try {
                        // FIX: Decode first to avoid double-encoding if already encoded
                        // Then encode to handle special characters like spaces
                        const decoded = decodeURI(url);
                        fetchUrl = encodeURI(decoded);
                    } catch (e) {
                        console.warn("URL encoding error, using raw:", url);
                        fetchUrl = url;
                    }

                    if (!isLocal) {
                        const separator = fetchUrl.includes('?') ? '&' : '?';
                        fetchUrl = `${fetchUrl}${separator}t=${Date.now()}`;
                    }
                }

                const timeout = setTimeout(() => {
                    console.warn(`Image load timeout inside planner-renderer for: ${url}`);
                    resolve(null);
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeout);
                    resolve(img);
                };
                img.onerror = (err) => {
                    clearTimeout(timeout);
                    console.warn(`[PDF] Image load error for: ${url} (fetched as: ${fetchUrl})`, err);
                    resolve(null);
                };
                img.src = fetchUrl;
            });
        };

        const createChartImage = async (type, data, options, width = 600, height = 300) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.style.display = "none";
            document.body.appendChild(canvas);

            const ctx = canvas.getContext("2d");

            // --- PREMIUM GRADIENT SUPPORT ---
            if (data.datasets && data.datasets[0] && data.datasets[0].backgroundColor === 'premium-gradient') {
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#D4F458'); // Lime
                gradient.addColorStop(1, 'rgba(212, 244, 88, 0.2)'); // Faded Lime
                data.datasets[0].backgroundColor = gradient;
            }

            // Dark Theme Styles for Chart
            const defaultOptions = {
                responsive: false,
                animation: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: {
                        labels: { color: '#FAFAFA', font: { family: 'Helvetica', size: 12 } }
                    },
                    // Subtle background line for context
                    tooltip: { enabled: false }
                },
                scales: {
                    x: {
                        display: false,
                        ticks: { color: '#A1A1AA' },
                        grid: { display: false }
                    },
                    y: {
                        display: false,
                        ticks: { color: '#A1A1AA' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [5, 5] }
                    }
                }
            };

            const chartObj = await LazyLoader.load('chartjs').then(() => {
                return new Chart(ctx, {
                    type: type,
                    data: data,
                    options: { ...defaultOptions, ...options }
                });
            });

            const imgData = canvas.toDataURL("image/png");
            chartObj.destroy();
            document.body.removeChild(canvas);
            return imgData;
        };

        // --- ASSETS LOADING ---
        // 1. Logo
        const logoImg = AUREUS_LOGO_BASE64 ? await loadImage(AUREUS_LOGO_BASE64) : null;

        // 2. data Prep for Charts
        let totalWkCal = 0, totalWkPur = 0, totalWkFat = 0, totalWkProt = 0, totalWkCarb = 0;
        const dailyCals = [];
        const dayLabelsFull = [];

        // Helper map
        const dayMap = {
            mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo"
        };
        const shortDays = { mon: "LB", tue: "MA", wed: "MI", thu: "JU", fri: "VI", sat: "SA", sun: "DO" };

        days.forEach(day => {
            let dCal = 0;
            const dayPlan = weeklyPlan[day];
            if (dayPlan) {
                Object.values(dayPlan).forEach(mealItems => {
                    mealItems.forEach(item => {
                        const c = Number(item.cal) || 0;
                        dCal += c;
                        totalWkCal += c;
                        totalWkPur += Number(item.purines) || 0;
                        totalWkFat += Number(item.fat) || 0;
                        totalWkProt += Number(item.prot) || 0;
                        totalWkCarb += Number(item.carb) || 0;
                    });
                });
            }
            dailyCals.push(Math.round(dCal));
            dayLabelsFull.push(dayMap[day].substring(0, 3)); // Short labels
        });

        // 3. Generate Charts
        // A) Macro Distribution (Pie/Doughnut)
        // Global Avgs
        const avgFat = Math.round(totalWkFat / 7);
        const avgProt = Math.round(totalWkProt / 7);
        const avgCarb = Math.round(totalWkCarb / 7);

        // Calculate percentages for macros
        const totalMacros = avgProt + avgCarb + avgFat;
        const protPctLabel = totalMacros > 0 ? Math.round((avgProt / totalMacros) * 100) : 0;
        const carbPctLabel = totalMacros > 0 ? Math.round((avgCarb / totalMacros) * 100) : 0;
        const fatPctLabel = totalMacros > 0 ? Math.round((avgFat / totalMacros) * 100) : 0;

        const macroChartUrl = await createChartImage("doughnut", {
            labels: [`Prot ${protPctLabel}%`, `Carb ${carbPctLabel}%`, `Grasa ${fatPctLabel}%`],
            datasets: [{
                data: [avgProt, avgCarb, avgFat],
                backgroundColor: ["#448AFF", "#FF4081", "#FFD740"], // Prot (Blue), Carb (Pink), Fat (Yellow)
                borderWidth: 0
            }]
        }, {
            plugins: {
                legend: {
                    display: true,
                    position: "right",
                    labels: {
                        color: '#FFFFFF',
                        boxWidth: 12,
                        font: { size: 11, weight: 'bold' },
                        padding: 12,
                        generateLabels: function (chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label} (${value.toLocaleString('en-US')}g)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        fontColor: '#FFFFFF',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                }
            },
            layout: { padding: 10 },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }, 300, 180);

        // B) Weekly Calorie Trend (Bar)
        const weeklyAvgCal = dailyCals.reduce((a, b) => a + b, 0) / (dailyCals.length || 1);
        const calChartUrl = await createChartImage("bar", {
            labels: dayLabelsFull,
            datasets: [
                {
                    label: "Calorías Diarias",
                    data: dailyCals,
                    backgroundColor: "premium-gradient",
                    borderRadius: 12,
                    barPercentage: 0.5,
                    categoryPercentage: 0.8,
                    order: 2
                },
                {
                    type: 'line',
                    label: "Promedio",
                    data: Array(dayLabelsFull.length).fill(weeklyAvgCal),
                    borderColor: 'rgba(255, 255, 255, 0.8)', // Increased opacity for visibility
                    borderDash: [5, 5],
                    borderWidth: 2, // Slightly thicker
                    pointStyle: 'rectRot', // Give it a shape for the legend
                    fill: false,
                    order: 1
                }
            ]
        }, {
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    align: "end",
                    labels: {
                        color: "#A1A1AA",
                        usePointStyle: true,
                        boxWidth: 8,
                        font: { size: 10, weight: '500' }
                    }
                }
            },
            scales: {
                y: {
                    display: false,
                    beginAtZero: true
                },
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: {
                        color: '#A1A1AA',
                        font: { size: 11, weight: '500' },
                        padding: 10
                    }
                }
            }
        }, 500, 250);


        // --- PDF GENERATION START ---

        // 1. PREMIUM HEADER
        try {
            // Background for whole page (re-ensure it's dark for each page start if needed, but here it's first page)
            doc.setFillColor(...C_BG);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Load logo: base64 first, then fallback
            const logoUrl = typeof AUREUS_LOGO_BASE64 !== 'undefined' ? AUREUS_LOGO_BASE64 : 'images/logo.webp';
            const logo = await loadImage(logoUrl);
            if (logo) {
                // Draw logo first
                doc.addImage(logo, 'PNG', margin, yPos - 8, 12, 12);

                // Draw Premium Accent Bar right next to logo
                doc.setFillColor(...C_ACCENT);
                doc.rect(margin + 13, yPos - 8, 2, 14, 'F');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.setTextColor(...C_TEXT_MAIN);
                doc.text("AUREUS FIT AI", margin + 18, yPos - 1);

                doc.setFontSize(8);
                doc.setTextColor(...C_ACCENT);
                doc.text(window.Locales.getTranslation('meal_planner.pdf.title').toUpperCase(), margin + 18, yPos + 4);
            } else {
                throw new Error("Logo image not loaded");
            }
        } catch (e) {
            console.warn("Logo load failed, using fallback header", e);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(...C_ACCENT);
            // Offset text to the right to avoid overlap with accent bar
            doc.text(window.Locales.getTranslation('meal_planner.pdf.title'), margin + 6, yPos + 4);
        }

        // Subtitle / Branding Right
        doc.setFontSize(9);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text("CLINICAL NUTRITION PLATFORM", pageWidth - margin, yPos + 4, { align: "right" });

        yPos += 20;

        // Date
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...C_TEXT_MUTED);
        const locale = window.Locales.currentLang === 'es' ? 'es-ES' : (window.Locales.currentLang === 'fr' ? 'fr-FR' : 'en-US');
        const dateStr = new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        doc.text(`${window.Locales.getTranslation('meal_planner.pdf.generated')}: ${dateStr}`, margin, yPos);
        yPos += 10;

        // Intro
        doc.setFontSize(11);
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.intro'), margin, yPos, { maxWidth: pageWidth - (margin * 2) });
        yPos += 15;

        // --- CHARTS SECTION ---
        // Row with 2 charts
        const chartY = yPos;
        // Chart 1: Macros
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...C_ACCENT);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.macro_dist'), margin, chartY);
        if (macroChartUrl) {
            doc.addImage(macroChartUrl, "PNG", margin, chartY + 5, 80, 50);
        }

        // Chart 2: Calories
        doc.text(window.Locales.getTranslation('meal_planner.pdf.cal_trend'), pageWidth / 2 + 10, chartY);
        if (calChartUrl) {
            doc.addImage(calChartUrl, "PNG", pageWidth / 2 + 10, chartY + 5, 80, 50);
        }

        yPos += 65; // Skip charts height

        // --- WEEKLY STATS TABLE ---
        const divisor = 7;
        const avgCal = Math.round(totalWkCal / divisor);
        const avgPur = Math.round(totalWkPur / divisor);

        const formatNum = (val) => Number(val).toLocaleString('en-US');

        doc.autoTable({
            startY: yPos,
            head: [[
                window.Locales.getTranslation('meal_planner.pdf.weekly_summary'),
                "Kcal",
                "Purine",
                window.Locales.getTranslation('dashboard.fat'),
                window.Locales.getTranslation('dashboard.protein'),
                window.Locales.getTranslation('dashboard.carbs')
            ]],
            body: [[
                window.Locales.getTranslation('meal_planner.pdf.daily_avgs'),
                formatNum(avgCal),
                formatNum(avgPur) + " mg",
                formatNum(avgFat) + " g",
                formatNum(avgProt) + " g",
                formatNum(avgCarb) + " g"
            ]],
            theme: "plain",
            headStyles: {
                fillColor: [30, 30, 30],
                textColor: C_ACCENT,
                fontStyle: "bold",
                fontSize: 10,
                cellPadding: 4,
                halign: 'center'
            },
            bodyStyles: {
                fillColor: C_BG,
                fontSize: 10,
                cellPadding: 5,
                textColor: C_TEXT_MAIN,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', fontStyle: 'bold' }
            },
            styles: {
                valign: "middle",
                lineColor: [60, 60, 60],
                lineWidth: 0.1
            },
            didParseCell: function (data) {
                if (data.section === 'head') {
                    data.cell.styles.borderBottomWidth = 1;
                    data.cell.styles.borderBottomColor = C_ACCENT;
                }
            }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // --- NEW: MEDICAL ANALYSIS & INSIGHTS ---
        doc.setFillColor(...C_ACCENT);
        doc.rect(margin, yPos, 4, 10, "F");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.medical_analysis'), margin + 8, yPos + 8);
        yPos += 18;

        // Analysis Box 1: Calorie & Macro Balance
        const cardWidth = (pageWidth - (margin * 2) - 10) / 2;
        const cardHeight = 35;

        // Card 1: Balance Energético
        doc.setFillColor(35, 35, 35);
        doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.energy_balance'), margin + 5, yPos + 8);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MAIN);
        const calStatus = avgCal < 1500 ?
            window.Locales.getTranslation('meal_planner.pdf.analysis.cal_low') :
            (avgCal > 2200 ? window.Locales.getTranslation('meal_planner.pdf.analysis.cal_high') : window.Locales.getTranslation('meal_planner.pdf.analysis.cal_optimal'));
        doc.text(calStatus, margin + 5, yPos + 15);

        doc.setTextColor(...C_TEXT_MUTED);
        const protPct = Math.round((avgProt * 4 / avgCal) * 100);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.prot_dist').replace('{val}', protPct), margin + 5, yPos + 22);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.stable_consumption'), margin + 5, yPos + 28);

        // Card 2: Perfil de Purinas (Clinical Focus)
        doc.setFillColor(35, 35, 35);
        doc.roundedRect(margin + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.purine_profile'), margin + cardWidth + 15, yPos + 8);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MAIN);
        const purineRisk = avgPur > 400 ? window.Locales.getTranslation('meal_planner.pdf.analysis.purine_risk_high') : window.Locales.getTranslation('meal_planner.pdf.analysis.purine_risk_safe');
        doc.text(purineRisk, margin + cardWidth + 15, yPos + 15);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.hydration_reason'), margin + cardWidth + 15, yPos + 22);
        // doc.text("Priorizar fuentes de proteína magra.", margin + cardWidth + 15, yPos + 28); // Removed to fit 

        yPos += cardHeight + 15;

        // Analysis Box 2: Lifestyle Recommendations (3 columns)
        const smallCardWidth = (pageWidth - (margin * 2) - 20) / 3;
        const smallCardHeight = 32;

        // Card L1: Hidratación
        doc.setFillColor(32, 32, 32);
        doc.roundedRect(margin, yPos, smallCardWidth, smallCardHeight, 2, 2, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.hydration'), margin + 4, yPos + 7);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.hydration_goal'), margin + 4, yPos + 14);
        doc.setTextColor(...C_TEXT_MUTED);
        // Wrapped text simulation
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.hydration_reason'), margin + 4, yPos + 21);

        // Card L2: Actividad
        doc.setFillColor(32, 32, 32);
        doc.roundedRect(margin + smallCardWidth + 10, yPos, smallCardWidth, smallCardHeight, 2, 2, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.activity'), margin + smallCardWidth + 14, yPos + 7);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.activity_freq'), margin + smallCardWidth + 14, yPos + 14);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.activity_desc'), margin + smallCardWidth + 14, yPos + 21);

        // Card L3: Descanso
        doc.setFillColor(32, 32, 32);
        doc.roundedRect(margin + (smallCardWidth * 2) + 20, yPos, smallCardWidth, smallCardHeight, 2, 2, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_ACCENT);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.rest'), margin + (smallCardWidth * 2) + 24, yPos + 7);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.rest_quality'), margin + (smallCardWidth * 2) + 24, yPos + 14);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.analysis.rest_desc'), margin + (smallCardWidth * 2) + 24, yPos + 21);

        yPos += smallCardHeight + 15;

        // --- DAILY PAGES SECTION ---
        doc.addPage();
        yPos = 30;

        doc.setFillColor(...C_ACCENT);
        doc.rect(margin, yPos - 10, 4, 12, "F");

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.detailed_plan'), margin + 8, yPos - 1);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(window.Locales.getTranslation('meal_planner.pdf.sections.chrono_dist'), margin + 8, yPos + 5);

        yPos += 20;

        const mealOrder = ["breakfast", "lunch", "dinner", "snack", "drinks"];
        // Localized Meal Labels
        const mealLabels = {
            "breakfast": window.Locales.getTranslation('dashboard.breakfast'),
            "lunch": window.Locales.getTranslation('dashboard.lunch'),
            "dinner": window.Locales.getTranslation('dashboard.dinner'),
            "snack": window.Locales.getTranslation('dashboard.snack'),
            "drinks": window.Locales.getTranslation('meal_planner.filters.drinks') || "Drinks"
        };

        for (let index = 0; index < days.length; index++) {
            const day = days[index];
            // Avoid split
            if (yPos > 240) {
                doc.addPage();
                // Background handled by overriden addPage
                yPos = 20;
            }

            const dayNameCap = window.Locales.getTranslation(`meal_planner.full_days.${day}`) || day;

            // Calculate Daily
            let dCal = 0, dPur = 0, dFat = 0, dProt = 0, dCarb = 0;
            const dPlan = weeklyPlan[day] || {};
            Object.values(dPlan).forEach(mItems => mItems.forEach(i => {
                dCal += Number(i.cal) || 0; dPur += Number(i.purines) || 0;
                dFat += Number(i.fat) || 0; dProt += Number(i.prot) || 0; dCarb += Number(i.carb) || 0;
            }));

            // Header Bar
            doc.setFillColor(...C_ACCENT);
            doc.rect(margin, yPos, 4, 14, "F");

            doc.setFillColor(28, 28, 30); // C_CARD equivalent
            doc.rect(margin + 4, yPos, pageWidth - (margin * 2) - 4, 14, "F");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...C_TEXT_MAIN);
            doc.text(dayNameCap, margin + 8, yPos + 9);

            // Right side stats
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...C_TEXT_MUTED);
            doc.text(`Kcal: ${Math.round(dCal).toLocaleString('en-US')}  |  Pur: ${Math.round(dPur).toLocaleString('en-US')}mg`, pageWidth - margin - 5, yPos + 9, { align: "right" });

            yPos += 18;

            // Prepare rows with images
            const dailyRows = [];
            const rowImages = []; // Store image data for each row

            for (const mType of mealOrder) {
                const items = dPlan[mType];
                if (items && items.length > 0) {
                    const itemText = items.map(i => "• " + i.name).join("\n");

                    // Calculate meal totals
                    let mealCal = 0, mealPur = 0;
                    items.forEach(i => {
                        mealCal += Number(i.cal) || 0;
                        mealPur += Number(i.purines) || 0;
                    });
                    const mealStats = `Kcal: ${Math.round(mealCal).toLocaleString('en-US')}\nPur: ${Math.round(mealPur).toLocaleString('en-US')}mg`;

                    // Load images for items in this meal
                    const mealImages = [];
                    for (const item of items) {
                        if (item.image) {
                            try {
                                const img = await loadImage(item.image);
                                if (img) {
                                    mealImages.push({ img, name: item.name });
                                }
                            } catch (e) {
                                console.warn(`Could not load image for ${item.name}`, e);
                            }
                        }
                    }

                    dailyRows.push([mealLabels[mType], "", itemText, mealStats]);
                    rowImages.push(mealImages);
                }
            }


            if (dailyRows.length > 0) {
                doc.autoTable({
                    startY: yPos,
                    body: dailyRows,
                    theme: "plain",
                    showHead: "never",
                    styles: { fillColor: C_BG, fontSize: 9, cellPadding: 3, valign: "middle", lineWidth: 0 },
                    columnStyles: {
                        0: { cellWidth: 22, fontStyle: "bold", textColor: C_ACCENT, valign: "middle", halign: "center" },
                        1: { cellWidth: 50, valign: "middle", minCellHeight: 28 }, // Image column
                        2: { textColor: C_TEXT_MAIN, valign: "middle" },
                        3: { cellWidth: 28, textColor: C_TEXT_MUTED, valign: "middle", halign: "center", fontSize: 8 } // Stats column
                    },
                    margin: { left: margin + 4, right: margin },
                    didDrawCell: function (data) {
                        // Draw images in column 1 (image column)
                        if (data.section === 'body' && data.column.index === 1) {
                            const rowIdx = data.row.index;
                            const images = rowImages[rowIdx];
                            if (images && images.length > 0) {
                                const imgSize = 24; // 300% larger (8 * 3 = 24mm)
                                const spacing = 3;
                                const maxImages = Math.min(images.length, 2); // Max 2 images now due to larger size

                                // Calculate total width of all images
                                const totalWidth = (maxImages * imgSize) + ((maxImages - 1) * spacing);

                                // Center horizontally in cell
                                const cellCenterX = data.cell.x + (data.cell.width / 2);
                                const startX = cellCenterX - (totalWidth / 2);

                                // Center vertically in cell
                                const cellCenterY = data.cell.y + (data.cell.height / 2);
                                const startY = cellCenterY - (imgSize / 2);

                                for (let i = 0; i < maxImages; i++) {
                                    try {
                                        doc.addImage(images[i].img, 'PNG',
                                            startX + (i * (imgSize + spacing)),
                                            startY,
                                            imgSize, imgSize);
                                    } catch (e) {
                                        console.warn('Could not add image to PDF', e);
                                    }
                                }
                            }
                        }
                    }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                doc.setFontSize(9);
                doc.setTextColor(...C_TEXT_MUTED);
                doc.text(window.Locales.getTranslation('meal_planner.pdf.no_meals'), margin + 8, yPos);
                yPos += 10;
            }
        }

        // --- SHOPPING LIST AT THE END ---
        doc.addPage();
        yPos = 20;

        // Header Section
        doc.setFillColor(...C_ACCENT);
        doc.rect(margin, yPos, 4, 12, "F");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C_TEXT_MAIN);
        doc.text(window.Locales.getTranslation('meal_planner.shopping_list').toUpperCase(), margin + 8, yPos + 9);

        doc.setFontSize(9);
        doc.setTextColor(...C_TEXT_MUTED);
        doc.text(window.Locales.getTranslation('meal_planner.modals.shopping_list_title'), pageWidth - margin, yPos + 9, { align: "right" });

        yPos += 20;

        // Collect and Aggregate Ingredients
        const ingredientMap = {};
        Object.entries(weeklyPlan).forEach(([day, dayMeals]) => {
            Object.entries(dayMeals).forEach(([mType, mealItems]) => {
                mealItems.forEach(item => {
                    let ings = item.ingredients;
                    if (!ings || ings.length === 0) {
                        const norm = item.name.toLowerCase().trim();
                        const source = (typeof foodDatabase !== 'undefined') ?
                            foodDatabase.find(f => f.name.toLowerCase().trim() === norm) : null;
                        if (source && source.ingredients) ings = source.ingredients;
                    }

                    if (ings && ings.length > 0) {
                        ings.forEach(ing => {
                            const name = ing.name.toLowerCase().trim();
                            if (!ingredientMap[name]) {
                                ingredientMap[name] = {
                                    name: ing.name,
                                    amounts: [],
                                    count: 0,
                                    sources: []
                                };
                            }
                            ingredientMap[name].count++;
                            if (ing.amount) ingredientMap[name].amounts.push(ing.amount);

                            // Track source
                            const sourceStr = {
                                day: window.Locales.getTranslation('meal_planner.days.' + day) || day.toUpperCase(),
                                meal: mealLabels[mType] || mType
                            };
                            // Avoid duplicate sources for same day/meal if already listed
                            const exists = ingredientMap[name].sources.find(s => s.day === sourceStr.day && s.meal === sourceStr.meal);
                            if (!exists) {
                                ingredientMap[name].sources.push(sourceStr);
                            }
                        });
                    } else {
                        const name = item.name.toLowerCase().trim();
                        if (!ingredientMap[name]) {
                            ingredientMap[name] = {
                                name: item.name,
                                amounts: [],
                                count: 0,
                                sources: []
                            };
                        }
                        ingredientMap[name].count++;
                        const sourceStr = {
                            day: window.Locales.getTranslation('meal_planner.days.' + day) || day.toUpperCase(),
                            meal: mealLabels[mType] || mType
                        };
                        const exists = ingredientMap[name].sources.find(s => s.day === sourceStr.day && s.meal === sourceStr.meal);
                        if (!exists) {
                            ingredientMap[name].sources.push(sourceStr);
                        }
                    }
                });
            });
        });

        const sortedIngredients = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name));
        const shoppingRows = [];

        // Custom aggregation helper (moved inside or kept global if needed, but local is safer for this rename)
        const formatIngAmount = (amounts) => {
            if (!amounts || amounts.length === 0) return '';
            const totals = {}; const others = [];
            amounts.forEach(amt => {
                const match = amt.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Záéíóúñ]+.*)$/i);
                if (match) {
                    const val = parseFloat(match[1]);
                    let unit = match[2].toLowerCase().trim();
                    if (unit.startsWith('g')) unit = 'g';
                    else if (unit.startsWith('ml')) unit = 'ml';
                    else if (unit.startsWith('pieza')) unit = 'piezas';
                    else if (unit.startsWith('cda')) unit = 'cdas';
                    else if (unit.startsWith('cdita')) unit = 'cditas';
                    else if (unit.startsWith('taza')) unit = 'tazas';
                    totals[unit] = (totals[unit] || 0) + val;
                } else if (!others.includes(amt)) others.push(amt);
            });
            const res = [];
            for (const [u, t] of Object.entries(totals)) {
                let du = u;
                if (u === 'piezas' && t === 1) du = 'pieza';
                else if (u === 'tazas' && t === 1) du = 'taza';
                else if (u === 'cdas' && t === 1) du = 'cda';
                else if (u === 'cditas' && t === 1) du = 'cdita';
                res.push(`${t % 1 === 0 ? t.toLocaleString('en-US') : t.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${du}`);
            }
            return [...res, ...others].join(', ');
        };

        sortedIngredients.forEach(ing => {
            const amt = formatIngAmount(ing.amounts);
            const countStr = (ing.count > 1 && !amt) ? ` (x${ing.count})` : '';

            // Format usage details: "LUN: Desayuno, Almuerzo | MAR: Cena"
            const groupedSources = {};
            ing.sources.forEach(s => {
                if (!groupedSources[s.day]) groupedSources[s.day] = [];
                groupedSources[s.day].push(s.meal);
            });
            const usageStr = Object.entries(groupedSources)
                .map(([d, meals]) => `${d}: ${meals.join(', ')}`)
                .join(' | ');

            // COLUMN 0: Checklist box + Name
            // COLUMN 1: Amount
            // COLUMN 2: Usage Detail
            shoppingRows.push([`[  ]  ${ing.name}${countStr}`, amt, usageStr]);
        });

        if (shoppingRows.length === 0) {
            shoppingRows.push(["No hay ingredientes registrados", "", ""]);
        }

        doc.autoTable({
            startY: yPos,
            head: [[
                window.Locales.getTranslation('meal_planner.pdf.ingredients').toUpperCase(),
                window.Locales.getTranslation('meal_planner.pdf.amount').toUpperCase(),
                "DÍA / COMIDA"
            ]],
            body: shoppingRows,
            theme: "plain",
            headStyles: {
                fillColor: [30, 30, 30],
                textColor: C_ACCENT,
                fontStyle: "bold",
                fontSize: 9,
                cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
                halign: 'left',
                valign: 'middle'
            },
            bodyStyles: {
                fillColor: C_BG,
                textColor: C_TEXT_MAIN,
                fontSize: 8.5,
                cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
                lineWidth: 0
            },
            columnStyles: {
                0: { cellWidth: 70, fontStyle: 'bold' },
                1: { cellWidth: 35, halign: 'center', textColor: C_TEXT_MUTED },
                2: { fontSize: 7.5, textColor: C_TEXT_MUTED, fontStyle: 'italic' }
            },
            margin: { left: margin, right: margin },
            didParseCell: function (data) {
                if (data.section === 'head' && data.column.index === 1) {
                    data.cell.styles.halign = 'center';
                }
            },
            didDrawCell: function (data) {
                if (data.section === 'head') {
                    // Frame the header with lime accent lines (Top and Bottom)
                    doc.setDrawColor(...C_ACCENT);
                    doc.setLineWidth(0.4);
                    // Top border
                    doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                    // Bottom border
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                }
            }
        });
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...C_TEXT_MUTED);
            const footerText = window.Locales.getTranslation('meal_planner.pdf.footer_text').replace('{0}', i).replace('{1}', pageCount);
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
        }

        // Output
        // Output with Timestamped Filename
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const filename = `Aureus_Plan_${year}_${month}_${day}.pdf`;
        doc.save(filename);
    }

    // --- Macro Targets ---
    function renderMacroTargets() {
        const container = document.getElementById('plannerMacroTargets');
        if (!container) return;

        const saved = localStorage.getItem(getUserKey('aureus_user_settings'));
        let targets = { calories: 2000, prot: 125, fat: 155, carb: 25 }; // Default keys updated

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.targets) targets = parsed.targets;
            } catch (e) {
                console.error("Error loading targets", e);
            }
        }

        container.innerHTML = `
            <div class="mt-label-group">
                <div class="mt-label">DAILY TARGETS</div>
                <button class="btn-macro-selector" id="btnOpenMacroSelector" title="Cambiar Objetivo">
                    <i class="fa-solid fa-bullseye"></i>
                </button>
            </div>
            <div class="mt-pill-container">
                <div class="mt-chip">
                    <i class="fa-solid fa-clock" style="color:#d4f458;"></i>
                    <span class="mt-val">${Math.round(targets.calories || targets.k || 2000).toLocaleString('en-US')}</span> <span class="mt-unit">${window.Locales.getTranslation('meal_planner.units.kcal')}</span>
                </div>
                <div class="mt-chip">
                    <i class="fa-solid fa-hourglass-half" style="color:#60a5fa;"></i>
                    <span class="mt-val">${Math.round(targets.prot || targets.p || 125)}</span> <span class="mt-unit">${window.Locales.getTranslation('meal_planner.units.prot')}</span>
                </div>
                 <div class="mt-chip">
                    <i class="fa-solid fa-droplet" style="color:#facc15;"></i>
                    <span class="mt-val">${Math.round(targets.fat || targets.f || 155)}</span> <span class="mt-unit">${window.Locales.getTranslation('meal_planner.units.fat')}</span>
                </div>
                 <div class="mt-chip">
                    <i class="fa-solid fa-wheat-awn" style="color:#f472b6;"></i>
                    <span class="mt-val">${Math.round(targets.carb || targets.c || 25)}</span> <span class="mt-unit">${window.Locales.getTranslation('meal_planner.units.carb')}</span>
                </div>
            </div>
        `;

        // Re-attach listener
        const btn = document.getElementById('btnOpenMacroSelector');
        if (btn) {
            btn.addEventListener('click', () => {
                const modal = document.getElementById('macroSelectorModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    // Sync active state from saved settings
                    const saved = localStorage.getItem(getUserKey('aureus_user_settings'));
                    if (saved) {
                        const settings = JSON.parse(saved);
                        const objective = settings.objective || 'maintenance';
                        const cards = modal.querySelectorAll('.objective-card');
                        cards.forEach(c => {
                            if (c.dataset.objective === objective) c.classList.add('active');
                            else c.classList.remove('active');
                        });
                    }
                }
            });
        }
    }


    // FIX: Override old handler if it exists
    const oldBtn = document.getElementById('confirmSaveTemplate');
    if (oldBtn) oldBtn.onclick = null;

    // 3. Save Logic (Event Delegation Version)
    // Using delegation ensure it works even if DOM is tricky
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'confirmSaveTemplate') {
            e.preventDefault();
            console.log("Save Template Clicked (Delegation)");

            // Re-fetch inputs to be safe
            const nameInput = document.getElementById('templateNameInput');
            const descInput = document.getElementById('templateDescInput');

            if (!nameInput) {
                console.error("Template name input not found");
                return;
            }

            const name = nameInput.value.trim();
            const desc = descInput ? descInput.value.trim() : '';

            if (!name) {
                alert(window.Locales.getTranslation('meal_planner.alerts.enter_template_name'));
                return;
            }

            try {
                // Ensure latest templates
                let currentTemplates = [];
                try {
                    currentTemplates = JSON.parse(localStorage.getItem(getUserKey('aureus_plan_templates'))) || [];
                } catch (err) {
                    currentTemplates = [];
                }

                // Check for existing
                const existingIndex = currentTemplates.findIndex(t => t.name.toLowerCase() === name.toLowerCase());

                // Helper to save and refresh
                const saveAndRefresh = (templates) => {
                    localStorage.setItem(getUserKey('aureus_plan_templates'), JSON.stringify(templates));
                    savedTemplates = templates;
                    renderTemplates();
                    const modal = document.getElementById('saveTemplateModal');
                    if (modal) modal.classList.add('hidden');
                };

                if (existingIndex > -1) {
                    if (confirm(window.Locales.getTranslation('meal_planner.alerts.overwrite_confirm').replace('{0}', name))) {
                        currentTemplates[existingIndex].planData = JSON.parse(JSON.stringify(weeklyPlan));
                        currentTemplates[existingIndex].desc = desc || currentTemplates[existingIndex].desc;
                        currentTemplates[existingIndex].dateCreated = new Date().toISOString();

                        saveAndRefresh(currentTemplates);
                        alert(window.Locales.getTranslation('meal_planner.alerts.template_updated'));
                    }
                } else {
                    const newTemplate = {
                        id: Date.now().toString(),
                        name: name,
                        desc: desc || `${new Date().toLocaleDateString()}`,
                        planData: JSON.parse(JSON.stringify(weeklyPlan)),
                        dateCreated: new Date().toISOString()
                    };

                    currentTemplates.push(newTemplate);
                    saveAndRefresh(currentTemplates);
                    alert(window.Locales.getTranslation('meal_planner.alerts.template_saved'));
                }
            } catch (error) {
                console.error("Error saving template:", error);
                alert(window.Locales.getTranslation('meal_planner.alerts.save_error') + error.message);
            }
        }
    });

    // 4. Sidebar Template Deletion Logic (Event Delegation)
    document.addEventListener('click', (e) => {
        // Find if we clicked on a delete button (or icon inside it)
        const btn = e.target.closest('.btn-delete-tmpl');
        if (btn) {
            e.preventDefault();
            e.stopPropagation(); // Stop it from opening the template

            const item = btn.closest('.template-item');
            if (!item) return;

            const nameEl = item.querySelector('.tmpl-name');
            if (!nameEl) return;

            const templateId = item.dataset.id;
            const templateName = nameEl.textContent.trim();

            if (!templateId) {
                console.warn("No Template ID found on item (legacy render?), attempting name match...");
                // Do not return, let logic below handle name fallback
            }

            // User requested removal of confirmation ("eliminaeso")
            // Deleting instantly without confirm dialog.
            try {
                const key = getUserKey('aureus_plan_templates');
                let current = [];
                try {
                    current = JSON.parse(localStorage.getItem(key)) || [];
                } catch (e) { current = []; }

                // Delete by ID (robust) or Name (fallback)
                const filtered = current.filter(t => (templateId && t.id === templateId) ? false : (t.name !== templateName));

                if (filtered.length < current.length) {
                    localStorage.setItem(key, JSON.stringify(filtered));
                    savedTemplates = filtered;
                    renderTemplates();
                    console.log(`Deleted template: ${templateName}`);
                } else {
                    console.warn(`Could not find template to delete: ${templateName} (ID: ${templateId})`);
                }
            } catch (err) {
                console.error("Critical error during sidebar deletion:", err);
            }
        }
    });

    // --- Language Change Listener ---
    document.addEventListener('language-changed', () => {
        // Re-render components that are dynamic
        renderHeaderDates();
        renderGridStructure();
        // Reload saved plan into new grid
        loadSavedPlan();
        updateDailySummaries();

        // Re-render Shopping List if open
        if (shoppingListModal && !shoppingListModal.classList.contains('hidden')) {
            generateShoppingList();
        }
    });

    // --- Image Preview Modal Logic ---
    const imgModal = document.getElementById('imagePreviewModal');
    // Use delegation or specific selector
    const closeImgFn = () => {
        if (imgModal) {
            imgModal.classList.add('hidden');
            imgModal.style.display = 'none'; // Ensure it hides
            const fullImg = document.getElementById('previewImageFull');
            if (fullImg) fullImg.src = '';
        }
    };

    const closeBtn = document.querySelector('.close-img-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeImgFn);

    if (imgModal) {
        imgModal.addEventListener('click', (e) => {
            if (e.target === imgModal) {
                closeImgFn();
            }
        });
    }

    // --- Macro Selector Modal Logic ---
    function initMacroSelector() {
        const modal = document.getElementById('macroSelectorModal');
        if (!modal) return;

        const cards = modal.querySelectorAll('.objective-card');
        const saveBtn = document.getElementById('btnSaveMacroObjective');
        const closeBtns = modal.querySelectorAll('.close-modal-macro');

        // 1. Card Selection
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });

        // 2. Close Modal
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        // 3. Save / Apply Targets
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const activeCard = modal.querySelector('.objective-card.active');
                if (!activeCard) return;

                const objectiveId = activeCard.dataset.objective;
                const ratioFat = parseFloat(activeCard.dataset.ratioFat);
                const ratioProt = parseFloat(activeCard.dataset.ratioProt);
                const ratioCarb = parseFloat(activeCard.dataset.ratioCarb);
                const offset = parseInt(activeCard.dataset.offset) || 0;

                const ratios = { fat: ratioFat, protein: ratioProt, carb: ratioCarb };

                // Fetch current settings
                const saved = localStorage.getItem(getUserKey('aureus_user_settings'));
                if (!saved) {
                    alert('Por favor, configure su perfil metabólico en ajustes primero.');
                    return;
                }

                try {
                    const settings = JSON.parse(saved);

                    // Recalculate Targets
                    const { weight, height, age, gender, activity } = settings;

                    if (!weight || !height || !age) {
                        alert('Faltan datos metabólicos para recalcular los objetivos.');
                        return;
                    }

                    let bmr = (gender === 'male')
                        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
                        : (10 * weight) + (6.25 * height) - (5 * age) - 161;

                    const tdee = bmr * (activity || 1.2);

                    // apply offset (Weight Loss: -500, Muscle Gain: +300 etc)
                    const targetCals = Math.round(tdee + offset);

                    settings.targets = {
                        calories: targetCals,
                        fat: Math.round((targetCals * ratios.fat) / 9),
                        prot: Math.round((targetCals * ratios.protein) / 4),
                        carb: Math.round((targetCals * ratios.carb) / 4)
                    };

                    settings.objective = objectiveId;
                    settings.macroRatios = ratios;
                    settings.goalDeficit = -offset; // Backwards compatible with legacy logic if any

                    // Save
                    localStorage.setItem(getUserKey('aureus_user_settings'), JSON.stringify(settings));

                    // Update UI
                    renderMacroTargets();
                    if (typeof updateDailySummaries === 'function') updateDailySummaries();

                    // Close & Toast
                    modal.classList.add('hidden');
                    if (typeof showToast === 'function') {
                        showToast(`Objetivo aplicado: ${activeCard.querySelector('.obj-title').innerText}`);
                    }

                    window.dispatchEvent(new CustomEvent('settings-saved'));

                } catch (e) {
                    console.error("Error applying macro objective:", e);
                }
            });
        }
    }

    // Call init
    initMacroSelector();

});

