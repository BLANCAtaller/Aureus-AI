
/**
 * User Selection Logic for AUREUS FIT AI
 */

// Function to handle user selection
// Function to handle user selection
function selectUser(userId) {
    let userProfile = {
        id: userId,
        name: 'User',
        avatar: '',
        status: '',
        color: ''
    };

    switch (userId) {
        case 'user1':
            userProfile.name = localStorage.getItem('aureus_name_user1') || 'Invitado';
            // Hybrid Sync: Allow custom data
            // localStorage.setItem('aureus_name_user1', 'Invitado'); // REMOVED strict lock

            userProfile.status = localStorage.getItem('aureus_status_user1') || 'Activo hace 2h';
            userProfile.color = localStorage.getItem('aureus_color_user1') || '#D4F458';
            userProfile.avatar = 'assets/images/users/item_profile.png';
            break;

        case 'user2':
            userProfile.name = localStorage.getItem('aureus_name_user2') || 'Usuario 2';
            userProfile.status = localStorage.getItem('aureus_status_user2') || 'Nuevo';
            userProfile.color = localStorage.getItem('aureus_color_user2') || '#3B82F6';
            userProfile.avatar = 'assets/images/users/item_profile.png';
            break;

        default:
            userProfile.name = 'Guest';
            userProfile.avatar = 'assets/images/users/item_profile.png';
    }

    try {
        localStorage.setItem('aureus_active_user', JSON.stringify(userProfile));
    } catch (e) {
        console.error("Storage Error:", e);
    }

    window.location.href = 'dashboard-select.html';
}

// --- MANAGE MODE LOGIC ---
let isManaging = false;

function toggleManageMode() {
    isManaging = !isManaging;
    const container = document.querySelector('.selection-container');
    const btn = document.querySelector('.manage-btn');

    if (isManaging) {
        container.classList.add('managing');
        if (btn) {
            btn.textContent = 'Listo';
            btn.style.backgroundColor = 'var(--primary-lime)';
            btn.style.color = '#000';
            btn.style.borderColor = 'var(--primary-lime)';
        }
    } else {
        container.classList.remove('managing');
        if (btn) {
            btn.textContent = 'Administrar Perfiles';
            btn.style.backgroundColor = ''; // Reset to CSS default
            btn.style.color = '';
            btn.style.borderColor = '';
        }
    }
}

function handleProfileInteract(userId, event) {
    // If clicked from specific child elements that have their own handlers (like camera icon),
    // they should stopPropagation. If not, we can check target here if needed.

    if (isManaging) {
        openEditModal(userId);
    } else {
        selectUser(userId);
    }
}

// --- CLOUD SYNC: Load profiles from Supabase on page load ---
async function loadProfilesFromCloud() {
    try {
        // Wait for Supabase to be ready
        if (!window.supabaseClient) {
            console.warn('Supabase client not ready, skipping cloud load');
            return;
        }

        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            console.log('No authenticated user, using local data only');
            return;
        }

        const { data, error } = await window.supabaseClient
            .from('user_data')
            .select('app_data')
            .eq('id', `${user.id}_profiles`)
            .single();

        if (error || !data?.app_data?.profiles) {
            console.log('No cloud profile data found');
            return;
        }

        const profiles = data.app_data.profiles;

        // Restore user1 profile
        if (profiles.user1) {
            if (profiles.user1.name) localStorage.setItem('aureus_name_user1', profiles.user1.name);
            if (profiles.user1.status) localStorage.setItem('aureus_status_user1', profiles.user1.status);
            if (profiles.user1.color) localStorage.setItem('aureus_color_user1', profiles.user1.color);
            if (profiles.user1.avatar) localStorage.setItem('aureus_img_user1', profiles.user1.avatar);
        }

        // Restore user2 profile
        if (profiles.user2) {
            if (profiles.user2.name) localStorage.setItem('aureus_name_user2', profiles.user2.name);
            if (profiles.user2.status) localStorage.setItem('aureus_status_user2', profiles.user2.status);
            if (profiles.user2.color) localStorage.setItem('aureus_color_user2', profiles.user2.color);
            if (profiles.user2.avatar) localStorage.setItem('aureus_img_user2', profiles.user2.avatar);
        }

        console.log('✅ Perfiles restaurados desde la nube');
    } catch (e) {
        console.error('Error cargando perfiles desde la nube:', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // First, try to load profiles from cloud (Supabase)
    await loadProfilesFromCloud();

    // Then render profiles from localStorage
    loadProfileData('user1');
    loadProfileData('user2');
});

function loadProfileData(userId) {
    const name = localStorage.getItem(`aureus_name_${userId}`);
    const status = localStorage.getItem(`aureus_status_${userId}`);
    const color = localStorage.getItem(`aureus_color_${userId}`);
    const img = localStorage.getItem(`aureus_img_${userId}`);

    if (name) document.getElementById(`name-${userId}`).innerText = name;
    if (status) document.getElementById(`status-text-${userId}`).innerText = status;

    if (color) {
        document.getElementById(`color-${userId}`).value = color;
        // Update indicator
        const indicator = document.getElementById(`indicator-${userId}`);
        if (indicator) {
            indicator.style.backgroundColor = color;
            indicator.style.boxShadow = `0 0 8px ${color}`;
        }

        // Update avatar border if desired (optional)
        const imgEl = document.getElementById(`img-${userId}`);
        if (imgEl) {
            imgEl.style.borderColor = color;
            // Add hover effect style dynamically if needed, or rely on CSS vars
        }
    }

    if (img) {
        document.getElementById(`img-${userId}`).src = img;
    }
}


/* --- EDIT MODAL LOGIC --- */

let currentEditUser = null;

function openEditModal(userId) {
    currentEditUser = userId;
    const modal = document.getElementById('editProfileModal');

    // Load current values into inputs
    const name = document.getElementById(`name-${userId}`).innerText;
    const statusFull = document.getElementById(`status-text-${userId}`).innerText;
    const color = document.getElementById(`color-${userId}`).value;
    const img = document.getElementById(`img-${userId}`).src;

    document.getElementById('edit-name-input').value = name;
    document.getElementById('edit-status-input').value = statusFull;
    document.getElementById('edit-color-input').value = color;
    document.getElementById('edit-avatar-img').src = img;

    // Set active color
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('active');
        // Simple check for color match (hex vs rgb might differ, but assuming hex from picker)
        // For robustness, we just reset and let user pick or if it matches exactly
        if (opt.getAttribute('style').includes(color)) {
            opt.classList.add('active');
        }
    });

    modal.classList.add('active');
}

function closeEditModal() {
    document.getElementById('editProfileModal').classList.remove('active');
    currentEditUser = null;
}

function selectColor(color, element) {
    document.getElementById('edit-color-input').value = color;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

function previewEditImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('edit-avatar-img').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function saveProfileChanges() {
    if (!currentEditUser) return;

    const newName = document.getElementById('edit-name-input').value;
    const newStatus = document.getElementById('edit-status-input').value;
    const newColor = document.getElementById('edit-color-input').value;
    const newImgSrc = document.getElementById('edit-avatar-img').src;

    // 1. Update UI for the Card immediately
    document.getElementById(`name-${currentEditUser}`).innerText = newName;
    document.getElementById(`status-text-${currentEditUser}`).innerText = newStatus;
    document.getElementById(`color-${currentEditUser}`).value = newColor;
    document.getElementById(`img-${currentEditUser}`).src = newImgSrc;

    // Update indicator color on Card
    const indicator = document.getElementById(`indicator-${currentEditUser}`);
    if (indicator) {
        indicator.style.backgroundColor = newColor;
        indicator.style.boxShadow = `0 0 8px ${newColor}`;
    }
    const imgEl = document.getElementById(`img-${currentEditUser}`);
    if (imgEl) {
        imgEl.style.borderColor = newColor;
    }

    // 2. Save to LocalStorage (Profile Data)
    localStorage.setItem(`aureus_name_${currentEditUser}`, newName);
    localStorage.setItem(`aureus_status_${currentEditUser}`, newStatus);
    localStorage.setItem(`aureus_color_${currentEditUser}`, newColor);
    localStorage.setItem(`aureus_img_${currentEditUser}`, newImgSrc);

    // 3. SYNC WITH ACTIVE SESSION
    // Check if the user we are editing is the one currently logged in (active)
    try {
        const storedUser = localStorage.getItem('aureus_active_user');
        if (storedUser) {
            let activeUser = JSON.parse(storedUser);

            // If the edited user ID matches the active user ID within the active session object
            // Note: simple match assuming 'id' property exists or mapping simplistic logic
            if (activeUser.id === currentEditUser) {

                // Update Active Session Object
                activeUser.name = newName;
                activeUser.status = newStatus;
                activeUser.color = newColor;
                activeUser.avatar = newImgSrc;
                localStorage.setItem('aureus_active_user', JSON.stringify(activeUser));

                // Update Header/Footer UI Elements Immediately
                const headerName = document.getElementById('headerName');
                const headerAvatar = document.getElementById('headerAvatar');
                const headerStatus = document.querySelector('.user-pill-status');
                const footerName = document.getElementById('footerName');
                const footerAvatar = document.getElementById('footerAvatar');

                if (headerName) headerName.innerText = newName;
                if (headerAvatar) {
                    headerAvatar.src = newImgSrc;
                    headerAvatar.style.borderColor = newColor;
                }
                if (headerStatus) {
                    headerStatus.style.backgroundColor = newColor;
                    headerStatus.style.boxShadow = `0 0 10px ${newColor}`;
                }

                if (footerName) footerName.innerText = newName;
                if (footerAvatar) {
                    if (!newImgSrc.includes('item_profile.png')) {
                        footerAvatar.innerHTML = `<img src="${newImgSrc}" style="width:100%;height:100%;border-radius:50%;object-fit:cover; border: 2px solid ${newColor}">`;
                    } else {
                        footerAvatar.style.border = `2px solid ${newColor}`;
                        footerAvatar.innerText = newName.charAt(0).toUpperCase();
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error syncing active session:", e);
    }

    // Auto-sync to cloud silently
    syncDataGlobally(true);

    closeEditModal();
}

function deleteProfile() {
    if (confirm('¿Estás seguro de eliminar este perfil? (Solo se resetearán los datos locales)')) {
        localStorage.removeItem(`aureus_name_${currentEditUser}`);
        localStorage.removeItem(`aureus_status_${currentEditUser}`);
        localStorage.removeItem(`aureus_color_${currentEditUser}`);
        localStorage.removeItem(`aureus_img_${currentEditUser}`);
        window.location.reload();
    }
}

// User Profile Popover Logic for Top Right (Shared)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate Main User Info from localStorage
    let activeUser = null;
    try {
        const storedUser = localStorage.getItem('aureus_active_user');
        if (storedUser) {
            activeUser = JSON.parse(storedUser);
        }
    } catch (err) {
        console.error("Error parsing user data:", err);
    }

    if (activeUser) {
        const displayName = activeUser.name || 'Usuario';
        const displayColor = activeUser.color || '#D4F458'; // Default Lime
        const initial = displayName.charAt(0).toUpperCase();

        // Header (Top Widget)
        const headerName = document.getElementById('headerName');
        const headerAvatar = document.getElementById('headerAvatar');
        const headerStatus = document.querySelector('.user-pill-status'); // The green dot

        if (headerName) headerName.innerText = displayName;
        if (headerAvatar && activeUser.avatar) {
            headerAvatar.src = activeUser.avatar;
            headerAvatar.style.borderColor = displayColor;
        }
        if (headerStatus) {
            headerStatus.style.backgroundColor = displayColor;
            headerStatus.style.boxShadow = `0 0 10px ${displayColor}`;
        }


        // Popover Footer
        const footerName = document.getElementById('footerName');
        const footerAvatar = document.getElementById('footerAvatar');

        if (footerName) footerName.innerText = displayName;
        if (footerAvatar) {
            // footerAvatar.innerText = initial;
            if (activeUser.avatar && !activeUser.avatar.includes('item_profile.png')) {
                footerAvatar.innerHTML = `<img src="${activeUser.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover; border: 2px solid ${displayColor}">`;
            } else {
                footerAvatar.style.border = `2px solid ${displayColor}`;
                footerAvatar.innerText = initial;
            }
        }
    }

    // 2. Toggle Popover
    const btn = document.getElementById('userProfileBtn');
    const popover = document.getElementById('userPopover');

    if (btn && popover) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !btn.contains(e.target)) {
                popover.classList.remove('active');
            }
        });
    }
});

async function handleLogoutMain() {
    localStorage.removeItem('aureus_active_user');
    const { error } = await window.supabaseClient.auth.signOut();
    if (error) {
        console.error('Sign Out Error', error);
    }
    window.location.href = 'login.html';
}

async function syncDataGlobally(silent = false) {
    const btn = document.querySelector('.sync-btn');
    let originalContent = '';

    if (btn && !silent) {
        originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando...';
    }

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            if (!silent) alert('Debes estar iniciado sesión para guardar en la nube.');
            if (btn && !silent) {
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
            return false;
        }

        // Collect all profiles (for now just user1, but expandable)
        const profiles = {
            user1: {
                name: localStorage.getItem('aureus_name_user1') || 'Invitado',
                status: localStorage.getItem('aureus_status_user1') || 'Activo hace 2h',
                color: localStorage.getItem('aureus_color_user1') || '#D4F458',
                avatar: localStorage.getItem('aureus_img_user1') || 'assets/images/users/item_profile.png'
            },
            user2: {
                name: localStorage.getItem('aureus_name_user2') || 'Usuario 2',
                status: localStorage.getItem('aureus_status_user2') || 'Nuevo',
                color: localStorage.getItem('aureus_color_user2') || '#3B82F6',
                avatar: localStorage.getItem('aureus_img_user2') || 'assets/images/users/item_profile.png'
            }
        };

        // Also sync the active selection for consistency
        const activeUserJson = localStorage.getItem('aureus_active_user');
        const activeUser = activeUserJson ? JSON.parse(activeUserJson) : null;

        // Upsert to user_data table in Supabase
        const { error } = await window.supabaseClient
            .from('user_data')
            .upsert({
                id: user.id + '_profiles', // Using a specific ID for global profile sync
                app_data: {
                    profiles: profiles,
                    activeProfile: activeUser ? activeUser.id : 'user1',
                    displayName: activeUser ? activeUser.name : profiles.user1.name,
                    photoURL: activeUser ? activeUser.avatar : profiles.user1.avatar
                },
                updated_at: new Date().toISOString()
            });

        if (error) throw error;

        console.log('✅ Global Sync Complete');
        return true;

    } catch (error) {
        console.error('❌ Sync Error:', error);
        if (!silent) alert('Error al sincronizar: ' + error.message);
        if (btn && !silent) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
        return false;
    }
}

// --- ENHANCED UI LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    setDynamicGreeting();
    initParticles();
    initTiltEffect();
});

function setDynamicGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greetingText');
    if (!greetingEl) return;

    let greeting = 'Bienvenido';
    if (hour >= 5 && hour < 12) greeting = 'Buenos días';
    else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';

    greetingEl.innerText = greeting;
}

function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 5 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${Math.random() * 10 + 10}s`;
        p.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(p);
    }
}

function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        });
    });
}
