
(function () {
    // FOCUS DETAILS MODAL LOGIC

    // 1. Set Focus Goal (Budget for Needs)
    window.setFocusGoal = function () {
        const currentGoal = (window.appState.budget && window.appState.budget['Needs']) ? window.appState.budget['Needs'] : 0;

        Swal.fire({
            title: 'Set Budget for Needs',
            text: 'Enter the monthly limit for essential expenses.',
            input: 'number',
            inputValue: currentGoal,
            background: '#0B0D14',
            color: '#fff',
            customClass: { popup: 'rounded-[2rem] border border-white/10 shadow-2xl glass-panel' },
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#6366f1'
        }).then((result) => {
            if (result.isConfirmed) {
                if (!window.appState.budget || typeof window.appState.budget !== 'object') {
                    window.appState.budget = {}; // Ensure object structure
                }
                const val = parseFloat(result.value);
                window.appState.budget['Needs'] = val;

                // If budget was a single number before, migrate it to "Total" key to avoid data loss
                if (typeof window.appState.budget === 'number') {
                    const old = window.appState.budget;
                    window.appState.budget = { 'Total': old, 'Needs': val };
                }

                if (window.saveState) window.saveState();

                // Refresh UI
                if (document.getElementById('focus-modal-limit')) {
                    document.getElementById('focus-modal-limit').innerText = window.formatCurrency ? window.formatCurrency(val) : '$' + val;
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Goal Saved',
                    toast: true, position: 'top',
                    timer: 2000, showConfirmButton: false,
                    background: '#0B0D14', color: '#fff'
                });
            }
        });
    };

    // 2. Filter Wallet by Focus (Needs, Wants, etc.)
    window.filterWalletByFocus = function () {
        // Use global focus if available, or default to Needs if not set (fallback)
        const emphasis = window.currentDetailFocus || 'Needs';

        if (window.closeFocusModal) window.closeFocusModal();
        else if (document.getElementById('modal-focus-details')) document.getElementById('modal-focus-details').classList.add('hidden');

        // 1. Clear conflicting filters
        window.walletCategoryFilter = null;
        if (typeof window.selectCategoryFilter === 'function') {
            // Attempts to update UI if possible or just clear var
            // Actually, selectCategoryFilter calls render, so maybe just set var null
        }

        // 2. Reset Time to Month (Context of Modal is Monthly)
        // This updates the Time Buttons UI (Month/Week/Day)
        if (typeof window.filterTime === 'function') {
            window.filterTime('month');
        }

        // 3. Set Filter to Expense (Context is Spending)
        // This updates the Type Buttons UI (Income/Expense/All)
        if (typeof window.filterWallet === 'function') {
            window.filterWallet('expense');
        } else {
            window.walletFilter = 'expense';
        }

        // 4. Set Focus Filter
        // This updates the Focus Button UI & Label
        if (typeof window.filterFocus === 'function') {
            window.filterFocus(emphasis);
        } else {
            window.walletFocusFilter = emphasis;
            if (window.renderWalletHistory) window.renderWalletHistory();
        }

        // 5. Switch to Wallet
        if (window.switchTab) window.switchTab('wallet');

        // Show toast
        Swal.fire({
            toast: true,
            position: 'top',
            icon: 'info',
            title: `Viendo gastos: ${emphasis}`,
            text: 'Filtro aplicado: Mes Actual',
            timer: 2000,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#fff'
        });
    };

    // Helper to close modal (if not defined globally)
    // Only define if not already present to avoid conflicts
    if (!window.closeFocusModal) {
        window.closeFocusModal = function () {
            const el = document.getElementById('modal-focus-details');
            if (el) el.classList.add('hidden');
        }
    }

})();
