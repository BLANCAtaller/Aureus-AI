document.addEventListener('DOMContentLoaded', () => {
    // Check for "Select Mode" (Adding to Log)
    const params = new URLSearchParams(window.location.search);
    const selectMode = params.get('mode') === 'select';
    const targetMeal = params.get('meal');

    const foodGrid = document.querySelector('.food-db-grid');
    const searchInput = document.getElementById('foodSearch');

    // Visual Feedback for Select Mode
    if (selectMode && targetMeal) {
        const headerTitle = document.querySelector('.greeting-container h1');
        const headerSubtitle = document.querySelector('.greeting-container .date-subtitle');

        // Localize "Adding to [Meal]"
        const mealName = Locales.getTranslation(`dashboard.${targetMeal}`) || targetMeal; // fallback
        const prefix = Locales.getTranslation('food_db.select_mode.title');

        if (headerTitle) headerTitle.innerText = `${prefix} ${mealName.charAt(0).toUpperCase() + mealName.slice(1)}`;
        if (headerSubtitle) headerSubtitle.innerText = Locales.getTranslation('food_db.select_mode.subtitle');

        // Hide "New Food" button to focus on selection
        const btnNew = document.getElementById('btnAddFood');
        if (btnNew) {
            btnNew.innerHTML = `<i class="fa-solid fa-xmark"></i> ${Locales.getTranslation('food_db.select_mode.cancel')}`;
            btnNew.className = "btn-header-dark";
            btnNew.style.display = 'flex';
            btnNew.onclick = () => window.location.href = 'food-log.html';
        }
    }

    const filterPills = document.querySelectorAll('.filter-pill-modern');
    const loadMoreBtn = document.querySelector('.btn-load-more');
    const btnAddFood = document.getElementById('btnAddFood');

    // Modal Elements
    const modal = document.getElementById('foodEditorModal');
    const editForm = document.getElementById('foodEditorForm');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('btnCancelEdit');
    const iconDisplay = document.getElementById('iconDisplay');
    const btnChangeIcon = document.getElementById('btnChangeIcon');
    const iconPicker = document.getElementById('iconPicker');

    // Exit early or skip modal logic if essential elements are missing (e.g., on Meal Planner page)
    const hasModal = !!(modal && editForm);

    // New Favorites Elements
    const favoritesGrid = document.getElementById('favoritesGrid');
    const favoritesSection = document.getElementById('favoritesSection');
    const btnManageFavs = document.getElementById('btnManageFavs');
    const btnFilterFavs = document.getElementById('btnFilterFavs');

    // Initialize Data from LocalStorage or Fallback to Static Data
    // Initialize Data using optimized loader
    const DB_VERSION = "8.8";
    let savedVersion = localStorage.getItem(getUserKey('aureus_db_version'));
    let db = window.getAureusFoodDB ? window.getAureusFoodDB() : JSON.parse(localStorage.getItem(getUserKey('aureus_food_db')));

    // If version mismatch or no DB, perform a safe merge and optimize storage
    if (!db || savedVersion !== DB_VERSION) {
        if (!db) {
            db = [...foodDatabase];
        } else {
            // MERGE & SYNC LOGIC
            const localNamesMap = new Map();
            db.forEach((item, idx) => localNamesMap.set(item.name.toLowerCase().trim(), idx));

            foodDatabase.forEach(sourceItem => {
                const normalizedName = sourceItem.name.toLowerCase().trim();
                if (!localNamesMap.has(normalizedName)) {
                    // New item: Add it
                    console.log(`Merging new system item: ${sourceItem.name}`);
                    db.push(sourceItem);
                } else {
                    // Existing item: Sync missing fields
                    const idx = localNamesMap.get(normalizedName);

                    // Always sync icon if provided in source
                    if (sourceItem.icon) {
                        db[idx].icon = sourceItem.icon;
                    }

                    // Sync ingredients if source has them and local doesn't
                    if (sourceItem.ingredients && sourceItem.ingredients.length > 0) {
                        if (!db[idx].ingredients || db[idx].ingredients.length === 0) {
                            console.log(`Syncing ingredients for: ${sourceItem.name}`);
                            db[idx].ingredients = [...sourceItem.ingredients];
                        }
                    }

                    // Always sync gi (Glycemic Index) from source if available
                    if (sourceItem.gi !== undefined && sourceItem.gi !== null) {
                        db[idx].gi = sourceItem.gi;
                    }

                    // If source now has NO image but has an icon, and local has an image,
                    // we might want to respect the system change if it's a system item.
                    // For now, let's just Sync image if provided and missing locally.
                    // ALWAYS sync image if source has one, to fix missing images issue
                    if (sourceItem.image) {
                        db[idx].image = sourceItem.image;
                    } else if (db[idx].image && !sourceItem.image && sourceItem.icon) {
                        // System removed image in favor of icon
                        console.log(`Removing image in favor of icon for: ${sourceItem.name}`);
                        delete db[idx].image;
                    }
                }
            });
        }
        localStorage.setItem(getUserKey('aureus_db_version'), DB_VERSION);
        if (window.saveAureusFoodDB) {
            window.saveAureusFoodDB(db);
        } else {
            localStorage.setItem(getUserKey('aureus_food_db'), JSON.stringify(db));
        }
    }

    let selectedIcon = "fa-utensils";
    let currentIngredients = []; // For ingredients editor
    let editingIngredientIndex = -1;
    let currentEditingItem = null; // Track item for 'Add to Log'

    function saveToStorage() {
        if (window.saveAureusFoodDB) {
            window.saveAureusFoodDB(db);
        } else {
            localStorage.setItem(getUserKey('aureus_food_db'), JSON.stringify(db));
        }
    }

    function renderFoodItems(items) {
        if (!foodGrid) return;
        foodGrid.innerHTML = '';

        const purinesLabel = Locales.getTranslation('food_db.editor.purines_label') || "Purines";
        const carbsLabel = Locales.getTranslation('food_db.editor.carbs_label') || "Carbs";

        items.forEach((item) => {
            // Find the true index in the main 'db' array
            const trueIndex = db.indexOf(item);

            const card = document.createElement('div');
            card.className = 'db-food-card';

            // Localize status label
            // item.status is 'safe', 'caution', 'avoid'
            const statusKey = `food_db.filters.${item.status}`;
            const statusLabel = (Locales.getTranslation(statusKey) || item.status).toUpperCase();

            // Handle Icon vs Image
            let visualElement = '';
            if (item.image) {
                // Fallback to icon if image fails
                const iconFallback = item.icon ? item.icon : 'fa-utensils';
                visualElement = `<img src="${item.image}" alt="${item.name}" class="db-card-custom-img" onerror="this.onerror=null; this.outerHTML='<i class=\\'fa-solid ${iconFallback}\\'></i>'">`;
            } else {
                const iconClass = item.icon ? item.icon : 'fa-utensils';
                visualElement = `<i class="fa-solid ${iconClass}"></i>`;
            }

            // Handle Favorite State
            const isFav = item.favourite === true;
            const bookmarkIcon = isFav ? 'fa-solid' : 'fa-regular';
            const bookmarkActive = isFav ? 'active' : '';

            // Nutritional Fallbacks to prevent null display
            const pValue = (item.purines !== undefined) ? item.purines : (item.purine || 0);
            const cValue = (item.carb !== undefined) ? item.carb : (item.carbs || 0);

            // Selection UI
            let selectActionHtml = '';
            if (selectMode) {
                const addText = Locales.getTranslation('food_db.select_mode.add_to_log') || "Add to Log";
                selectActionHtml = `
                    <div class="db-select-badge">
                        <i class="fa-solid fa-plus-circle"></i>
                        <span>${addText}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="db-card-image">
                    ${visualElement}
                    <span class="status-badge ${item.status}">● ${statusLabel}</span>
                    ${selectActionHtml}
                </div>
                <div class="db-card-content">
                    <div class="db-card-header">
                        <h3>${item.name}</h3>
                        <i class="${bookmarkIcon} fa-bookmark bookmark-btn ${bookmarkActive}"></i>
                    </div>
                    <p class="db-category">${item.category}</p>
                    
                    <div class="db-stats-capsule">
                        <div class="db-stat-group">
                            <span class="stat-label">${purinesLabel}</span>
                            <span class="stat-value purine">${pValue.toLocaleString('en-US')}mg <small>/100g</small></span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="db-stat-group">
                            <span class="stat-label">${carbsLabel}</span>
                            <span class="stat-value carb">${cValue.toLocaleString('en-US')}g <small>/100g</small></span>
                        </div>
                    </div>

                    <!-- Mini GL Gauge in Grid -->
                    <div class="grid-mini-gl">
                        <div class="mini-gl-header">
                            <span class="mini-gl-label">GL</span>
                            <span class="mini-gl-value">${Math.round((cValue * (item.gi || 0)) / 100).toLocaleString('en-US')}</span>
                        </div>
                        <div class="mini-gl-track">
                            <div class="mini-gl-fill ${((cValue * (item.gi || 0)) / 100) > 19 ? 'bg-gl-high' : (((cValue * (item.gi || 0)) / 100) > 10 ? 'bg-gl-mid' : 'bg-gl-low')}" 
                                 style="width: ${Math.min(((cValue * (item.gi || 0)) / 100) / 30 * 100, 100)}%"></div>
                        </div>
                    </div>

                    <div class="db-tip-section">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <p>${item.tip}</p>
                    </div>
                </div>
            `;

            // Click to edit OR Select
            card.addEventListener('click', (e) => {
                // Don't open editor if we click the bookmark
                if (!e.target.classList.contains('bookmark-btn')) {
                    if (selectMode && targetMeal) {
                        addToLog(item, targetMeal);
                    } else {
                        openEditor(item, trueIndex);
                    }
                }
            });

            // Bookmark Toggle
            const bBtn = card.querySelector('.bookmark-btn');
            bBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavourite(item);
            });

            foodGrid.appendChild(card);
        });
    }

    function toggleFavourite(item) {
        item.favourite = !item.favourite;
        saveToStorage();
        renderFavorites();
        applyFilters();
    }

    function renderFavorites() {
        if (!favoritesGrid) return;

        const favs = db.filter(item => item.favourite === true);

        if (favs.length === 0) {
            favoritesSection.classList.add('hidden');
            return;
        }

        favoritesSection.classList.remove('hidden');
        favoritesGrid.innerHTML = '';

        favs.forEach(item => {
            const favCard = document.createElement('div');
            favCard.className = 'fav-food-card';

            let favVisual = '';
            if (item.image) {
                const iconFallback = item.icon ? item.icon : 'fa-utensils';
                favVisual = `<img src="${item.image}" alt="${item.name}" class="fav-custom-img" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fa-solid ${iconFallback}\\'></i>'">`;
            } else {
                const iconClass = item.icon ? item.icon : 'fa-utensils';
                favVisual = `<i class="fa-solid ${iconClass}"></i>`;
            }

            favCard.innerHTML = `
                <div class="fav-food-icon">
                    ${favVisual}
                </div>
                <h4>${item.name}</h4>
            `;

            favCard.addEventListener('click', () => {
                const trueIndex = db.indexOf(item);
                openEditor(item, trueIndex);
            });

            favoritesGrid.appendChild(favCard);
        });
    }

    // Modal Logic
    function openEditor(item, index) {
        currentEditingItem = item; // Store for Add to Log
        document.getElementById('editIndex').value = index;
        // Show delete button when editing existing item
        const btnDelete = document.getElementById('btnDeleteFood');
        if (btnDelete) btnDelete.classList.remove('hidden');

        document.getElementById('editName').value = item.name;
        document.getElementById('editCategory').value = item.category;
        document.getElementById('editPurines').value = item.purines;
        document.getElementById('editCarbs').value = item.carb;
        document.getElementById('editProt').value = item.prot;
        document.getElementById('editFat').value = item.fat;
        document.getElementById('editCal').value = item.cal;
        document.getElementById('editStatus').value = item.status;
        document.getElementById('editTip').value = item.tip;
        document.getElementById('editCal').value = item.cal;
        document.getElementById('editStatus').value = item.status;
        document.getElementById('editTip').value = item.tip;
        document.getElementById('editImage').value = item.image || "";
        // Glycemic Factor
        document.getElementById('editGI').value = item.gi || 0;
        updateMiniGLGauge(); // Initial calculation

        selectedIcon = item.icon || "fa-utensils";
        updateModalIcon(selectedIcon, item.image);

        // Load ingredients - if item has none, try to sync from foodDatabase
        if (item.ingredients && item.ingredients.length > 0) {
            currentIngredients = [...item.ingredients];
        } else {
            // Try to find ingredients from source database
            currentIngredients = [];
            const normalizedName = item.name.toLowerCase().trim();
            const sourceItem = foodDatabase.find(f => f.name.toLowerCase().trim() === normalizedName);
            if (sourceItem && sourceItem.ingredients && sourceItem.ingredients.length > 0) {
                currentIngredients = [...sourceItem.ingredients];
                // Also sync ingredients to the item for future use
                item.ingredients = [...sourceItem.ingredients];
            }
        }
        renderIngredientsEditor();

        document.querySelector('.modal-header h2').innerText = Locales.getTranslation('food_db.editor.title');

        // Inject "Add to Log" button if not present
        const footer = document.querySelector('.modal-footer');
        if (!document.getElementById('btnAddLogFromEditor')) {
            const addLogBtn = document.createElement('button');
            addLogBtn.type = "button";
            addLogBtn.id = "btnAddLogFromEditor";
            addLogBtn.className = "btn-add-to-log-premium";
            addLogBtn.innerHTML = '<i class="fa-solid fa-plus"></i> <span>' + (Locales.getTranslation('food_db.select_mode.add_to_log') || "Añadir al Registro") + '</span>';

            // Insert after delete button (if exists) or prepend
            const delBtn = document.getElementById('btnDeleteFood');
            if (delBtn) {
                delBtn.insertAdjacentElement('afterend', addLogBtn);
            } else {
                footer.prepend(addLogBtn);
            }

            addLogBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentEditingItem) {
                    openMealSelector(currentEditingItem);
                }
            });
        }

        // Show/Hide Add Log button based on context (only for existing items)
        const addLogBtn = document.getElementById('btnAddLogFromEditor');
        if (addLogBtn) {
            if (index !== "" && index !== undefined && index !== null) {
                addLogBtn.style.display = 'inline-flex';
            } else {
                addLogBtn.style.display = 'none';
            }
        }

        modal.classList.remove('hidden');
    }

    // Expose for Meal Planner
    window.openEditor = openEditor;

    function openAddModal() {
        document.getElementById('editIndex').value = "";
        // Hide delete button for new items
        const btnDelete = document.getElementById('btnDeleteFood');
        if (btnDelete) btnDelete.classList.add('hidden');

        document.getElementById('editName').value = "";
        document.getElementById('editImage').value = "";
        document.getElementById('editPurines').value = "0";
        document.getElementById('editCarbs').value = "0";
        document.getElementById('editProt').value = "0";
        document.getElementById('editFat').value = "0";
        document.getElementById('editCal').value = "0";
        document.getElementById('editStatus').value = "safe";
        document.getElementById('editStatus').value = "safe";
        document.getElementById('editTip').value = "";

        // Reset GI
        document.getElementById('editGI').value = "";
        updateMiniGLGauge(); // Reset gauge

        selectedIcon = "fa-utensils";
        updateModalIcon(selectedIcon, "");

        // Reset ingredients
        currentIngredients = [];
        renderIngredientsEditor();

        // Use new food button text as title or similar
        document.querySelector('.modal-header h2').innerText = Locales.getTranslation('food_db.editor.title') || 'Nuevo Alimento';
        // Or if we want distinguishing text "New Food"?
        // food_db.header.new_food_btn is "New Food" / "Nuevo Alimento".
        // Let's use simple Editor Title for consistency, or "New Food". 
        // Existing behavior was "Nuevo Alimento" vs "Editar Alimento".
        // Use translation logic
        // But I don't see "New Food" modal title key.
        // I'll stick to 'New Food' translation if index is empty?
        // Let's use 'food_db.header.new_food_btn' for create mode.
        document.querySelector('.modal-header h2').innerText = Locales.getTranslation('food_db.header.new_food_btn');

        modal.classList.remove('hidden');
    }

    function updateModalIcon(iconClass, imageUrl) {
        if (imageUrl) {
            iconDisplay.innerHTML = `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
        } else {
            iconDisplay.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        }
        selectedIcon = iconClass;
        iconPicker.classList.add('hidden');
    }

    // Live update of icon display when typing URL
    document.getElementById('editImage').addEventListener('input', (e) => {
        updateModalIcon(selectedIcon, e.target.value);
    });

    // Icon Picker logic
    const iconSearch = document.getElementById('iconSearchInput');
    const pickerGrid = document.getElementById('iconPickerGrid');
    const pickerIcons = document.querySelectorAll('#iconPickerGrid i');

    if (btnChangeIcon && iconPicker) {
        btnChangeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            iconPicker.classList.toggle('hidden');
        });
    }

    if (iconSearch) {
        iconSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            pickerIcons.forEach(icon => {
                const iconName = icon.dataset.icon.toLowerCase();
                const title = icon.getAttribute('title') ? icon.getAttribute('title').toLowerCase() : "";
                if (iconName.includes(term) || title.includes(term)) {
                    icon.style.display = 'flex';
                } else {
                    icon.style.display = 'none';
                }
            });
        });
    }

    pickerIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // Clear image URL if an icon is selected from picker
            document.getElementById('editImage').value = "";
            selectedIcon = icon.dataset.icon;
            updateModalIcon(selectedIcon, "");
            iconPicker.classList.add('hidden');

            // Highlight selected icon
            pickerIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
    });

    // Close modal
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (modal) modal.classList.add('hidden');
            });
        }
    });

    // Save changes
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = document.getElementById('editIndex').value;

            // Update data in the main array
            const foodData = {
                name: document.getElementById('editName').value,
                category: document.getElementById('editCategory').value,
                purines: parseInt(document.getElementById('editPurines').value) || 0,
                carb: parseFloat(document.getElementById('editCarbs').value) || 0,
                prot: parseFloat(document.getElementById('editProt').value) || 0,
                fat: parseFloat(document.getElementById('editFat').value) || 0,
                cal: parseInt(document.getElementById('editCal').value) || 0,
                status: document.getElementById('editStatus').value,
                tip: document.getElementById('editTip').value,
                image: document.getElementById('editImage').value,
                icon: selectedIcon,
                gi: parseInt(document.getElementById('editGI').value) || 0, // Save GI
                ingredients: currentIngredients.length > 0 ? [...currentIngredients] : undefined
            };

            if (index === "") {
                db.unshift(foodData);
            } else {
                db[index] = {
                    ...db[index],
                    ...foodData
                };
            }

            saveToStorage();
            if (modal) modal.classList.add('hidden');
            applyFilters();
        });
    }

    // ==========================================
    // GLYCEMIC FACTOR LOGIC (Mini Gauge)
    // ==========================================
    const editGI = document.getElementById('editGI');
    const editCarbs = document.getElementById('editCarbs');

    function updateMiniGLGauge() {
        // Calculate GL
        const carbs = parseFloat(editCarbs.value) || 0;
        const gi = parseInt(editGI.value) || 0;
        const gl = Math.round((carbs * gi) / 100);

        // Update Text
        const glDisplay = document.getElementById('glValueDisplay');
        const glRiskLabel = document.getElementById('glRiskLabel');
        const glFill = document.getElementById('glGaugeFill');

        if (glDisplay) glDisplay.innerText = gl;

        // Determine Scale & Color
        // Scale Mapping: 0-20+ mapped to 0-100% width
        // Let's say max is 30 for visual fullness
        let percentage = (gl / 30) * 100;
        if (percentage > 100) percentage = 100;

        if (glFill) glFill.style.width = `${percentage}%`;

        // Risk Logic
        // Low: 0-10, Medium: 11-19, High: 20+
        if (gl <= 10) {
            if (glRiskLabel) {
                glRiskLabel.innerText = Locales.getTranslation('food_log.gl_low') || "Low";
                glRiskLabel.className = "gl-risk-label gl-low";
            }
            if (glFill) glFill.className = "mini-gauge-fill bg-gl-low";
        } else if (gl <= 19) {
            if (glRiskLabel) {
                glRiskLabel.innerText = Locales.getTranslation('food_log.gl_moderate') || "Moderate";
                glRiskLabel.className = "gl-risk-label gl-mid";
            }
            if (glFill) glFill.className = "mini-gauge-fill bg-gl-mid";
        } else {
            if (glRiskLabel) {
                glRiskLabel.innerText = Locales.getTranslation('food_log.gl_high') || "High";
                glRiskLabel.className = "gl-risk-label gl-high";
            }
            if (glFill) glFill.className = "mini-gauge-fill bg-gl-high";
        }
    }

    if (editGI) editGI.addEventListener('input', updateMiniGLGauge);
    if (editCarbs) editCarbs.addEventListener('input', updateMiniGLGauge);


    // Delete persistence logic
    const deleteBtn = document.createElement('button');
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete-modern hidden";
    deleteBtn.id = "btnDeleteFood";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    document.querySelector('.modal-footer').prepend(deleteBtn);

    deleteBtn.addEventListener('click', () => {
        const index = document.getElementById('editIndex').value;
        if (index !== "" && confirm(Locales.getTranslation('food_db.alerts.delete_confirm'))) {
            db.splice(index, 1);
            saveToStorage();
            modal.classList.add('hidden');
            applyFilters();
        }
    });

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        // Use data-filter instead of innerText for localization stability
        const activePill = document.querySelector('.filter-pill-modern.active');
        const activeFilter = activePill ? activePill.dataset.filter : 'All';

        let filtered = db.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm);

            let matchesFilter = true;
            if (activeFilter === 'Safe') matchesFilter = (item.status === 'safe');
            else if (activeFilter === 'Caution') matchesFilter = (item.status === 'caution');
            else if (activeFilter === 'Avoid') matchesFilter = (item.status === 'avoid');
            else if (activeFilter === 'Meats') matchesFilter = (item.category === 'Meats' || item.category === 'Poultry');
            else if (activeFilter === 'Seafood') matchesFilter = (item.category === 'Seafood');
            else if (activeFilter === 'Veggies') matchesFilter = (item.category === 'Veggies');
            else if (activeFilter === 'Drinks') matchesFilter = (item.category === 'Drinks');
            else if (activeFilter.includes('Favorites')) matchesFilter = (item.favourite === true);

            return matchesSearch && matchesFilter;
        });

        renderFoodItems(filtered);
    }

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            applyFilters();
        });
    });

    if (btnAddFood) {
        btnAddFood.addEventListener('click', openAddModal);
    }

    // Manage/Filter Favorites
    if (btnManageFavs && btnFilterFavs) {
        btnManageFavs.addEventListener('click', () => {
            btnFilterFavs.click();
            // Scroll to grid
            foodGrid.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ===== INGREDIENTS EDITOR LOGIC =====
    function renderIngredientsEditor() {
        const grid = document.getElementById('editIngredientsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        currentIngredients.forEach((ing, index) => {
            const card = document.createElement('div');
            card.className = 'ingredient-card'; // Updated class
            card.innerHTML = `
                <div class="ing-info">
                    <span class="ing-name">${ing.name}</span>
                    <span class="ing-amount">${ing.amount || ''}</span>
                </div>
                <div class="ing-actions">
                    <button type="button" class="btn-icon-action delete" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            // Edit on card click
            card.addEventListener('click', (e) => {
                // Ignore if clicking actions
                if (e.target.closest('.ing-actions')) return;
                e.stopPropagation();
                openIngredientMiniModal(index);
            });

            // Delete action
            const deleteBtn = card.querySelector('.delete');
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(Locales.getTranslation('food_db.alerts.delete_ingredient_confirm'))) {
                    currentIngredients.splice(index, 1);
                    renderIngredientsEditor();
                }
            });

            grid.appendChild(card);
        });
    }

    function openIngredientMiniModal(index) {
        editingIngredientIndex = index;
        const miniModal = document.getElementById('ingredientMiniModal');
        const titleEl = document.getElementById('miniModalTitle');
        const nameInput = document.getElementById('ingEditName');
        const amountInput = document.getElementById('ingEditAmount');
        const deleteBtn = document.getElementById('btnDeleteIng');

        if (index === -1) {
            // Adding new ingredient
            // Localize 'Add Ingredient' -> Reuse 'food_db.editor.add_ingredient' key if text matches, 
            // or use a new key. 'Añadir Ingrediente' matches.
            titleEl.innerText = Locales.getTranslation('food_db.editor.add_ingredient');
            nameInput.value = '';
            amountInput.value = '';
            deleteBtn.style.display = 'none';
        } else {
            // Editing existing
            titleEl.innerText = Locales.getTranslation('food_db.ingredient_modal.title');
            nameInput.value = currentIngredients[index].name || '';
            amountInput.value = currentIngredients[index].amount || '';
            deleteBtn.style.display = 'flex';
        }

        miniModal.classList.remove('hidden');
        nameInput.focus();
    }

    function closeIngredientMiniModal() {
        document.getElementById('ingredientMiniModal')?.classList.add('hidden');
        editingIngredientIndex = -1;
    }

    // Add Ingredient Button
    const btnAddIng = document.getElementById('btnAddIngredient');
    if (btnAddIng) {
        btnAddIng.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openIngredientMiniModal(-1);
        });
    }

    // Close Mini Modal
    const closeMiniBtn = document.getElementById('closeMiniModal');
    if (closeMiniBtn) {
        closeMiniBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeIngredientMiniModal();
        });
    }

    // Save Ingredient
    const btnSaveIng = document.getElementById('btnSaveIng');
    if (btnSaveIng) {
        btnSaveIng.addEventListener('click', (e) => {
            e.preventDefault();
            const name = document.getElementById('ingEditName').value.trim();
            const amount = document.getElementById('ingEditAmount').value.trim();

            if (!name) {
                alert(Locales.getTranslation('food_db.alerts.enter_ingredient_name'));
                return;
            }

            if (editingIngredientIndex === -1) {
                // Add new
                currentIngredients.push({ name, amount });
            } else {
                // Update existing
                currentIngredients[editingIngredientIndex] = { name, amount };
            }

            renderIngredientsEditor();
            closeIngredientMiniModal();
        });
    }

    // Delete Ingredient
    const btnDelIng = document.getElementById('btnDeleteIng');
    if (btnDelIng) {
        btnDelIng.addEventListener('click', (e) => {
            e.preventDefault();
            if (editingIngredientIndex > -1) {
                currentIngredients.splice(editingIngredientIndex, 1);
                renderIngredientsEditor();
                closeIngredientMiniModal();
            }
        });
    }

    // Close mini modal when clicking outside
    document.getElementById('ingredientMiniModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'ingredientMiniModal') {
            closeIngredientMiniModal();
        }
    });

    // Initial render
    renderFoodItems(db);
    renderFavorites();

    function addToLog(item, mealKey) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const LOG_KEY = getUserKey(`aureus_log_${y}-${m}-${d}`);

        let logData = JSON.parse(localStorage.getItem(LOG_KEY));

        if (!logData) {
            logData = {
                date: now.toLocaleDateString(),
                meals: {
                    breakfast: { time: "08:30 AM", items: [] },
                    lunch: { time: "12:30 PM", items: [] },
                    dinner: { time: "07:00 PM", items: [] },
                    snacks: { time: "--:--", items: [] }
                },
                targets: { calories: 2000, fat: 150, prot: 95, carb: 45 }
            };
        }

        const newItem = {
            name: item.name,
            sub: item.category,
            cals: item.cals || item.cal || 0,
            purine: (item.purine !== undefined) ? item.purine : (item.purines || 0),
            carb: item.carb || item.carbs || 0,
            fat: item.fat || 0,
            prot: item.prot || item.protein || 0,
            prot: item.prot || item.protein || 0,
            gi: item.gi || 0, // Pass GI to log
            highPurine: ((item.purines || item.purine || 0) > 100)
        };

        if (logData.meals[mealKey]) {
            logData.meals[mealKey].items.push(newItem);
            localStorage.setItem(LOG_KEY, JSON.stringify(logData));
            window.location.href = 'food-log.html';
        } else {
            console.error("Invalid meal key:", mealKey);
            alert(Locales.getTranslation('food_db.alerts.error_invalid_meal'));
        }
    }

    // Listen for Language Changes to update Dynamic Content
    document.addEventListener('language-changed', (e) => {
        // Re-render food grid to update dynamically generated cards (status labels, stats)
        applyFilters();

        // Re-render favorites
        renderFavorites();

        // Update Select Mode Header if active
        if (selectMode && targetMeal) {
            const headerTitle = document.querySelector('.greeting-container h1');
            const headerSubtitle = document.querySelector('.greeting-container .date-subtitle');

            const mealName = Locales.getTranslation(`dashboard.${targetMeal}`) || targetMeal;
            const prefix = Locales.getTranslation('food_db.select_mode.title');

            if (headerTitle) headerTitle.innerText = `${prefix} ${mealName.charAt(0).toUpperCase() + mealName.slice(1)}`;
            if (headerSubtitle) headerSubtitle.innerText = Locales.getTranslation('food_db.select_mode.subtitle');

            const btnNew = document.getElementById('btnAddFood');
            if (btnNew) {
                // Keep icon, update text
                btnNew.innerHTML = `<i class="fa-solid fa-xmark"></i> ${Locales.getTranslation('food_db.select_mode.cancel')}`;
            }
        }
    });
});
