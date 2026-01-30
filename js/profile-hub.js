/**
 * AUREUS Profile Hub - Unified Component v1.1
 * Centralized User Switcher & App Hub with Multi-Trigger Support
 */

window.ProfileHub = (function () {
    'use strict';

    let config = {
        currentApp: 'fit', // 'fit' or 'finance'
        userBtnId: 'userProfileBtn'
    };

    function init(options = {}) {
        Object.assign(config, options);
        console.log('🚀 ProfileHub: Initializing for', config.currentApp);

        // 1. Inject CSS and Icons
        if (!document.querySelector('link[href*="profile-hub.css"]')) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '../css/profile-hub.css';
            document.head.appendChild(cssLink);
        }

        // 1b. Inject FontAwesome if missing (required for icons)
        if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="all.min.css"]')) {
            console.log('📦 ProfileHub: Injecting FontAwesome dependencies');
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }

        // 2. Wait for DOM to be ready
        if (document.readyState !== 'loading') {
            setup();
        } else {
            document.addEventListener('DOMContentLoaded', setup);
        }
    }

    function setup() {
        // Collect all potential triggers
        const triggerIds = [config.userBtnId, 'drawerUserProfileBtn', 'mobileUserProfileBtn'];
        const triggers = triggerIds
            .map(id => document.getElementById(id))
            .filter(el => el !== null);

        if (triggers.length === 0) {
            console.warn('⚠️ ProfileHub: No trigger buttons found');
            return;
        }

        // 3. Ensure Popover exists (hidden initially)
        if (!document.getElementById('aureusProfileHub')) {
            injectHTML(document.body); // Hidden by default
        }

        // 4. Set Listeners
        triggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                // If it's a mobile drawer button, we might need special handling
                if (btn.id === 'drawerUserProfileBtn' && window.closeMobileMenu) {
                    // window.closeMobileMenu(); // Optional: close menu first?
                }

                handleTriggerClick(btn);
            });
        });

        document.addEventListener('click', (e) => {
            const popover = document.getElementById('aureusProfileHub');
            if (popover && popover.classList.contains('active')) {
                if (!popover.contains(e.target)) {
                    popover.classList.remove('active');
                }
            }
        });

        // 5. Initial Render
        render();
    }

    function handleTriggerClick(btn) {
        const popover = document.getElementById('aureusProfileHub');
        if (!popover) return;

        const isActive = popover.classList.contains('active');

        // If clicking the same button and it's active, close it
        const lastTriggerId = popover.getAttribute('data-last-trigger');
        const isSameTrigger = lastTriggerId === btn.id;

        if (isActive && isSameTrigger) {
            popover.classList.remove('active');
            return;
        }

        // Position the popover
        updatePosition(btn, popover);

        // Show it
        popover.classList.add('active');
        popover.setAttribute('data-last-trigger', btn.id);
        render(); // Refresh content
    }

    function updatePosition(btn, popover) {
        const rect = btn.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Center on mobile (CSS handles most of this, but we'll reset inline styles)
            popover.style.top = '';
            popover.style.left = '';
            popover.style.bottom = '';
            return;
        }

        // Desktop: Position above the button
        const popoverHeight = popover.offsetHeight || 450; // Estimate if not visible
        const popoverWidth = 280;

        let top = rect.top - popoverHeight - 12;
        let left = rect.left;

        // Boundary checks
        if (top < 10) {
            // If it would go off top, show it to the side or below
            top = rect.bottom + 12;
        }

        // Ensure it doesn't go off right
        if (left + popoverWidth > window.innerWidth) {
            left = window.innerWidth - popoverWidth - 20;
        }

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        popover.style.bottom = 'auto'; // Reset any bottom constraint
    }

    function injectHTML(container) {
        if (document.getElementById('aureusProfileHub')) return;

        const html = `
            <div class="profile-hub-popover ${config.currentApp === 'finance' ? 'finance-mode' : ''}" id="aureusProfileHub">
                <div class="ph-section-title">AUREUS Ecosystem</div>
                <div class="ph-app-list">
                    <div class="ph-app-item ${config.currentApp === 'fit' ? 'active' : ''}" onclick="window.location.href='../AUREUS FIT AI/index.html'">
                        <img src="../AUREUS FIT AI/images/logo.webp" class="ph-app-icon" alt="Fit">
                        <span class="ph-app-name">Nutrition AI</span>
                        ${config.currentApp === 'fit' ? '<i class="fa-solid fa-check ph-check-icon"></i>' : ''}
                    </div>
                    <div class="ph-app-item ${config.currentApp === 'finance' ? 'active' : ''}" onclick="window.location.href='../AUREUS FINANCE AI/index.html'">
                        <img src="../AUREUS FINANCE AI/assets/logo.svg" class="ph-app-icon" alt="Finance">
                        <span class="ph-app-name">Finance OS</span>
                        ${config.currentApp === 'finance' ? '<i class="fa-solid fa-check ph-check-icon"></i>' : ''}
                    </div>
                </div>

                <div class="ph-divider"></div>

                <div class="ph-section-title">Cambiar Usuario</div>
                <div class="ph-user-list" id="phUserList">
                    <!-- Profiles injected here -->
                </div>

                <div class="ph-divider"></div>

                <div class="ph-action-list">
                    <div class="ph-action-item" onclick="ProfileHub.openSettings()">
                        <div class="ph-action-icon"><i class="fa-solid fa-gear"></i></div>
                        <span>Ajustes</span>
                    </div>
                    <div class="ph-action-item logout" onclick="ProfileHub.logout()">
                        <div class="ph-action-icon"><i class="fa-solid fa-right-from-bracket"></i></div>
                        <span>Cerrar Sesión</span>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = html;
        container.appendChild(div.firstElementChild);
    }

    function toggle() {
        const triggers = [config.userBtnId, 'drawerUserProfileBtn', 'mobileUserProfileBtn']
            .map(id => document.getElementById(id))
            .filter(el => el !== null);

        if (triggers.length > 0) {
            handleTriggerClick(triggers[0]);
        }
    }

    function render() {
        // 1. Get Active User
        let activeUser = null;
        if (window.SyncCore) {
            activeUser = window.SyncCore.getCurrentUser();
        } else {
            const stored = localStorage.getItem('aureus_active_user');
            if (stored) activeUser = JSON.parse(stored);
        }

        // 2. Load and Render Profiles
        const userListEl = document.getElementById('phUserList');
        if (userListEl) {
            const profiles = ['user1', 'user2'];
            let html = '';

            profiles.forEach(id => {
                const name = localStorage.getItem(`aureus_name_${id}`) || (id === 'user1' ? 'Jesus Rodriguez' : 'Gio');

                let avatarFile = '';
                if (id === 'user1') avatarFile = 'BlindSnk.webp';
                else if (id === 'user2') avatarFile = 'gio_profile.webp';
                else avatarFile = 'item_profile.webp'; // Default fallback for unexpected IDs

                const avatarPath = '../AUREUS FIT AI/images/users/' + avatarFile;
                const isActive = activeUser && activeUser.id === id;

                html += `
                    <div class="ph-app-item ${isActive ? 'active' : ''}" onclick="ProfileHub.switchUser('${id}')">
                        <img src="${avatarPath}" class="ph-avatar-mini" alt="${name}">
                        <span class="ph-app-name" style="font-size: 13px;">${name}</span>
                        ${isActive ? '<i class="fa-solid fa-check ph-check-icon" style="font-size: 10px;"></i>' : ''}
                    </div>
                `;
            });
            userListEl.innerHTML = html;
        }

        if (!activeUser) return;

        // Update all visible profile sections
        const sidebarNames = document.querySelectorAll('#currentUserName, #drawerUserName');
        const sidebarAvatars = document.querySelectorAll('#currentAvatar, #drawerAvatar');

        sidebarNames.forEach(el => el.textContent = activeUser.name || 'AUREUS User');

        sidebarAvatars.forEach(el => {
            // Force correct avatars for standard users regardless of what's in sync/localStorage
            let avatarPath = '';
            if (activeUser.id === 'user1') avatarPath = 'images/users/BlindSnk.webp';
            else if (activeUser.id === 'user2') avatarPath = 'images/users/gio_profile.webp';
            else avatarPath = activeUser.avatar || 'images/users/item_profile.webp';

            // Normalize path to always point to AUREUS FIT AI relative to current location
            // If in Finance AI or other subdir: ../AUREUS FIT AI/images/users/...
            // The logic below ensures it finds the right base path
            const baseFolder = window.location.pathname.includes('AUREUS FIT AI') ? '' : '../AUREUS FIT AI/';

            // Strip any leading assets/ or ../ if present to normalize
            let cleanAvatarPath = avatarPath.replace(/^(..\/)+/g, '') // Remove existing ../ segments
                .replace('assets/images/users/', 'images/users/')
                .replace('AUREUS FIT AI/', ''); // Remove redundant folder names

            if (!cleanAvatarPath.startsWith('http') && !cleanAvatarPath.startsWith('data:')) {
                // Ensure it starts with images/
                if (!cleanAvatarPath.startsWith('images/')) {
                    cleanAvatarPath = 'images/users/' + cleanAvatarPath;
                }
                cleanAvatarPath = baseFolder + cleanAvatarPath;
            }

            el.src = cleanAvatarPath;
            el.setAttribute('data-fixed-avatar', 'true'); // Flag to prevent other scripts from overwriting
        });

        // 3. Hide 'Pro Member' or similar status labels
        const statusLabels = document.querySelectorAll('.user-role, .d-role, .user-status, .footer-user-badge, .footer-badge');
        statusLabels.forEach(el => el.style.display = 'none');
    }

    function switchUser(userId) {
        let avatarFile = '';
        if (userId === 'user1') avatarFile = 'BlindSnk.webp';
        else if (userId === 'user2') avatarFile = 'gio_profile.webp';
        else avatarFile = 'item_profile.webp';

        const userProfile = {
            id: userId,
            name: localStorage.getItem(`aureus_name_${userId}`) || (userId === 'user1' ? 'Jesus Rodriguez' : 'Gio'),
            avatar: '../AUREUS FIT AI/images/users/' + avatarFile,
            status: 'Activo',
            color: userId === 'user1' ? '#D4F458' : '#6366f1'
        };

        localStorage.setItem('aureus_active_user', JSON.stringify(userProfile));
        render();
        window.location.reload();
    }

    function logout() {
        localStorage.removeItem('aureus_active_user');
        if (window.AuthService && window.AuthService.logout) {
            window.AuthService.logout();
        } else if (window.logout) {
            window.logout();
        } else {
            window.location.href = '../login.html';
        }
    }

    return {
        init,
        toggle,
        render,
        switchUser,
        logout,
        openSettings: function () {
            if (config.currentApp === 'finance') {
                if (window.switchTab) {
                    window.switchTab('settings');
                } else {
                    console.error('❌ ProfileHub: switchTab not found in Finance OS');
                    window.location.href = 'settings.html';
                }
            } else {
                window.location.href = 'settings.html';
            }
            // Close popover
            const popover = document.getElementById('aureusProfileHub');
            if (popover) popover.classList.remove('active');
        }
    };
})();
