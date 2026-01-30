/**
 * AUREUS AI - Authentication Service
 * Manages local session state and login/logout functionality.
 * Note: Uses LocalStorage for persistence. Not acceptable for high-security banking, but sufficient for local personal use.
 */

const AuthService = {
    SESSION_KEY: 'aureus_session_token',

    /**
     * Initializes the authentication system.
     */
    async init() {
        console.log("🔐 AuthService: Initializing Supabase Sync...");

        if (!window.supabaseClient) {
            console.error("❌ Supabase client not found. Ensure supabase-config.js is loaded.");
            return;
        }

        // 1. Listen for Supabase Auth Changes
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            const user = session?.user;

            if (user) {
                console.log("✅ Supabase Session Active:", user.email);

                const name = user.user_metadata?.full_name || localStorage.getItem('aureus_last_known_name') || user.email.split('@')[0];
                const avatar = user.user_metadata?.avatar_url || '../assets/images/users/item_profile.png';

                if (user.user_metadata?.full_name) {
                    localStorage.setItem('aureus_last_known_name', user.user_metadata.full_name);
                }

                // Prioritize 'aureus_active_user' from User Hub if it exists
                let activeProfile = {
                    name: name,
                    email: user.email,
                    avatar: avatar,
                    uid: user.id
                };

                const storedProfileJson = localStorage.getItem('aureus_active_user');
                let useStoredProfile = false;

                if (storedProfileJson) {
                    try {
                        const stored = JSON.parse(storedProfileJson);
                        if (stored.name && stored.name !== 'Guest') { // Basic validation
                            useStoredProfile = true;
                            activeProfile.name = stored.name;
                            activeProfile.avatar = stored.avatar || stored.image || activeProfile.avatar;
                            activeProfile.email = stored.email || activeProfile.email;
                            console.log("🛡️ Preserving Active Hub User:", activeProfile.name);
                        }
                    } catch (e) {
                        console.error("Error parsing stored profile:", e);
                    }
                }

                if (!useStoredProfile) {
                    // Keep aureus_active_user synced for other apps ONLY if we didn't load from it
                    localStorage.setItem('aureus_active_user', JSON.stringify({
                        name: activeProfile.name,
                        email: activeProfile.email,
                        avatar: activeProfile.avatar,
                        uid: activeProfile.uid
                    }));
                }

                // Ensure aureus_session_token exists for local auth checks
                if (!localStorage.getItem(this.SESSION_KEY)) {
                    localStorage.setItem(this.SESSION_KEY, 'valid_session_supabase_' + Date.now());
                }

                // Update UI immediately active profile (Local or Supabase)
                this.updateProfileUI(activeProfile.name, activeProfile.email, activeProfile.avatar);

                this.showApp();
                this.syncOnRestore();
            } else if (event === 'SIGNED_OUT' || !user) {
                console.log("🔒 No active Supabase session found.");
                // Redirect if not on login pages, but careful not to loop if we are just opening index.html
                // Check if we are inside the app attempting to work
                if (!window.location.href.includes('login.html') && !window.location.href.includes('index.html')) {
                    // For index.html (Main App), we require auth
                    // But we might be in offline mode? For now, we enforce login for cloud sync.
                    // We'll show the login view if not authenticated.
                    this.showLogin();
                } else if (event === 'SIGNED_OUT') {
                    // Force refresh or redirect to landing if signed out explicitly
                    window.location.href = '../login.html';
                }
            }
        });

        // 2. Listen for Cross-Tab Profile Changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'aureus_active_user' && e.newValue) {
                try {
                    const userData = JSON.parse(e.newValue);
                    console.log("🔄 Cross-tab profile sync detected (Finance OS):", userData.name);
                    this.updateProfileUI(userData.name, userData.email, userData.avatar);
                } catch (err) {
                    console.error("Error parsing profile sync data:", err);
                }
            }
        });
    },

    /**
     * Syncs data with cloud when restoring an existing session.
     */
    async syncOnRestore() {
        console.log("☁️ Session restored, checking Supabase client...");

        if (!window.supabaseClient) {
            console.warn("⚠️ Supabase client not available for sync");
            return;
        }

        console.log("☁️ Starting cloud sync (Legacy Firestore check disabled)...");

        if (typeof window.loadStateWithCloudSync === 'function') {
            await window.loadStateWithCloudSync();

            // Refresh UI after cloud sync
            if (typeof renderMergedDashboard === 'function') renderMergedDashboard();
            if (typeof renderWalletHistory === 'function') renderWalletHistory();
            if (typeof updateSidebarStats === 'function') updateSidebarStats();
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Refresh Profile UI
            // Refresh Profile UI - BUT respect the Local Hub User if it exists
            let profileName = window.appState.profile.name;
            let profileEmail = window.appState.profile.email;
            let profileImage = window.appState.profile.image;

            const storedHubUser = localStorage.getItem('aureus_active_user');
            if (storedHubUser) {
                try {
                    const hubUser = JSON.parse(storedHubUser);
                    if (hubUser.name && hubUser.name !== 'Guest') {
                        // console.log("🛡️ syncOnRestore: Enforcing Hub User:", hubUser.name);
                        profileName = hubUser.name;
                        profileImage = hubUser.avatar || hubUser.image || profileImage;
                        // Keep email from state if needed, or ignore it since we are hiding it
                    }
                } catch (e) {
                    console.error("Error parsing hub user in sync:", e);
                }
            }

            this.updateProfileUI(
                profileName,
                profileEmail,
                profileImage
            );

            console.log("✅ Cloud sync + UI complete on session restore");
        }
    },

    /**
     * Checks if the user is a "New User" (no profile).
     */
    isNewUser() {
        if (typeof appState !== 'undefined' && appState.profile && appState.profile.email) {
            return false;
        }
        const rawState = localStorage.getItem('finance_app_state');
        if (rawState) {
            try {
                const parsed = JSON.parse(rawState);
                if (parsed.profile && parsed.profile.email) return false;
            } catch (e) { console.error(e); }
        }
        return true;
    },

    /**
     * Authenticated Check
     */
    async isAuthenticated() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        return !!session;
    },

    /**
     * Logs in with Username/Password credentials via Supabase.
     */
    async loginWithCredentials() {
        const emailInput = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();

        if (!emailInput || !pass) {
            Swal.fire({ icon: 'warning', title: 'Faltan Datos', text: 'Ingresa usuario y contraseña.', background: '#0f1115', color: '#fff' });
            return;
        }

        let email = emailInput;
        if (!email.includes('@')) {
            email = email + "@aureus.app";
        }

        Swal.showLoading();

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: pass
            });

            if (error) throw error;
            Swal.close();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Acceso',
                text: 'Credenciales inválidas.',
                footer: error.message,
                background: '#0f1115',
                color: '#fff'
            });
        }
    },

    /**
     * Shows a modal to register a new local user via Supabase.
     */
    showRegister() {
        Swal.fire({
            title: '',
            html: `
                <div class="text-left">
                    <h2 class="text-2xl font-black text-white mb-1">Nueva Cuenta</h2>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">Regístrate en AUREUS</p>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Email</label>
                            <input id="reg-email" type="email" class="w-full bg-[#161b22] border border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-1 focus:ring-indigo-500" placeholder="tu@email.com">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Contraseña</label>
                            <input id="reg-pass" type="password" class="w-full bg-[#161b22] border border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-1 focus:ring-indigo-500" placeholder="••••••">
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Registrarse',
            cancelButtonText: 'Cancelar',
            background: '#0B0D14', color: '#fff',
            preConfirm: async () => {
                const e = document.getElementById('reg-email').value;
                const p = document.getElementById('reg-pass').value;
                if (!e || !p) {
                    Swal.showValidationMessage('Todos los campos son requeridos');
                    return false;
                }

                try {
                    const { data, error } = await window.supabaseClient.auth.signUp({
                        email: e,
                        password: p
                    });
                    if (error) throw error;
                    return data;
                } catch (error) {
                    Swal.showValidationMessage(error.message);
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ icon: 'success', title: '¡Bienvenido!', text: 'Cuenta creada exitosamente. Revisa tu email para verificar.', background: '#0f1115', color: '#fff', timer: 3000, showConfirmButton: false });
            }
        });
    },

    /**
     * Logs in with Google via Supabase.
     */
    async loginWithGoogle() {
        console.log("🔐 Starting Google Login (Supabase)...");
        try {
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });
            if (error) throw error;
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#0f1115', color: '#fff' });
        }
    },

    /**
     * Logs the user out.
     */
    logout() {
        Swal.fire({
            title: '¿Cerrar Sesión?',
            text: "Saldrás de tu cuenta.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, Salir',
            cancelButtonText: 'Cancelar',
            background: '#0f1115', color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await window.supabaseClient.auth.signOut();
                localStorage.removeItem(this.SESSION_KEY);
                window.location.href = '../login.html';
            }
        });
    },

    /**
     * DOM Manipulation to show the Login Screen and hide the App.
     */
    showLogin() {
        const loginView = document.getElementById('view-login');
        if (loginView) {
            loginView.classList.remove('hidden');
            loginView.classList.add('flex');
            setTimeout(() => {
                loginView.classList.remove('opacity-0');
                loginView.style.opacity = '1';
            }, 10);
        }
        document.body.style.overflow = 'hidden';
    },

    /**
     * Updates the Profile UI elements with user data.
     */
    updateProfileUI(name, email, photo) {
        const nameInput = document.getElementById('profile-name-input');
        const usernameInput = document.getElementById('profile-username-input');
        const profileImg = document.getElementById('profile-image');
        const sidebarName = document.getElementById('currentUserName');
        const sidebarAvatar = document.getElementById('currentAvatar');

        const userName = name || 'Guest';
        let userPhoto = photo;

        // Fix broken relative paths for legacy profiles
        if (userPhoto === 'item_profile.webp' || userPhoto === 'item_profile.png') {
            userPhoto = '../images/users/item_profile.webp';
        }
        // Default fallback if null/undefined
        if (!userPhoto) {
            userPhoto = '../images/users/item_profile.webp';
        }

        if (nameInput) nameInput.value = userName;
        if (usernameInput) usernameInput.value = userName;
        if (profileImg) profileImg.src = userPhoto;

        if (sidebarName) sidebarName.innerText = userName;
        if (sidebarAvatar) sidebarAvatar.src = userPhoto;

        const popoverName = document.getElementById('popoverUserName');
        if (popoverName) popoverName.innerText = userName;

        const sidebarEmail = document.getElementById('currentUserEmail');
        if (sidebarEmail) {
            sidebarEmail.innerText = email || ''; // Restore text but keep hidden if desired
            sidebarEmail.style.display = 'none'; // User requested to hide email
        }
    },

    /**
     * DOM Manipulation to show the App and hide the Login Screen.
     */
    showApp() {
        const loginView = document.getElementById('view-login');
        if (loginView) {
            loginView.style.transition = 'opacity 0.5s ease';
            loginView.style.opacity = '0';
            setTimeout(() => {
                loginView.classList.add('hidden');
                loginView.classList.remove('flex');
                loginView.style.opacity = '1';
            }, 500);
        }
        document.body.style.overflow = 'auto';
        if (typeof window.appState !== 'undefined' && window.appState.profile) {
            this.updateProfileUI(
                window.appState.profile.name,
                window.appState.profile.email,
                window.appState.profile.image
            );
        }
    }
};

// Expose AuthService globally
window.AuthService = AuthService;

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();
});
