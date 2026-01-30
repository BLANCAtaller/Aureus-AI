/**
 * AUREUS Admin Dashboard Logic
 * Handles admin authentication, data fetching, and user management actions.
 */

const AdminDashboard = {
    users: [],

    async init() {
        console.log("🛡️ Initializing Admin Dashboard...");

        // 1. Verify Admin Access
        const session = await this.checkSession();
        if (!session) return; // checkSession handles redirect

        // 2. Load User Profile
        this.loadAdminProfile(session.user);

        // 3. Fetch Data
        await this.fetchUsers();

        // 4. Setup Listeners
        this.setupEventListeners();

        // 5. Hide Loader
        document.getElementById('authOverlay').classList.add('hidden');
    },

    async checkSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (!session) {
            window.location.href = '../login.html';
            return null;
        }

        // Check if user is admin (using public.users table)
        const { data: userProfile, error } = await supabaseClient
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (error || !userProfile?.is_admin) {
            alert("⛔ Acceso Denegado: Esta cuenta no tiene privilegios de administrador.");
            window.location.href = '../index.html';
            return null;
        }

        return session;
    },

    loadAdminProfile(user) {
        document.getElementById('adminName').textContent = user.user_metadata.full_name || user.email;
        if (user.user_metadata.avatar_url) {
            document.getElementById('adminAvatar').src = user.user_metadata.avatar_url;
        }
    },

    async fetchUsers() {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            alert("Error cargando usuarios. Revisa la consola.");
            return;
        }

        this.users = data;
        this.renderTable(this.users);
        this.updateKPIs(this.users);
    },

    renderTable(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const daysRemaining = this.calculateDaysRemaining(user.trial_ends_at);
            const statusClass = this.getStatusClass(user.status, daysRemaining);
            const statusLabel = this.getStatusLabel(user.status, daysRemaining);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="user-cell">
                        <img src="${user.avatar_url || '../assets/images/users/item_profile.png'}" class="avatar-small">
                        <div class="user-info">
                            <span class="user-name">${user.full_name || 'Sin Nombre'}</span>
                            <span class="user-email">${user.email}</span>
                        </div>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>${new Date(user.trial_start_date).toLocaleDateString()}</td>
                <td>${new Date(user.trial_ends_at).toLocaleDateString()}</td>
                <td style="font-weight: 700; color: ${daysRemaining > 3 ? 'var(--success)' : 'var(--danger)'}">
                    ${daysRemaining > 0 ? daysRemaining + ' días' : 'Expirado'}
                </td>
                <td>
                    <button class="action-btn extend" title="Extender Prueba 7 días" onclick="AdminDashboard.extendTrial('${user.id}')">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </button>
                    <button class="action-btn ban" title="Desactivar Usuario" onclick="AdminDashboard.banUser('${user.id}')">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    updateKPIs(users) {
        document.getElementById('kpiTotalUsers').textContent = users.length;

        const active = users.filter(u => this.calculateDaysRemaining(u.trial_ends_at) > 0).length;
        document.getElementById('kpiActiveTrials').textContent = active;

        const expired = users.length - active;
        document.getElementById('kpiExpiredTrials').textContent = expired;
    },

    calculateDaysRemaining(dateString) {
        const end = new Date(dateString);
        const now = new Date();
        const diff = end - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    getStatusClass(status, days) {
        if (status === 'banned') return 'expired';
        if (days <= 0) return 'expired';
        if (status === 'active') return 'active';
        return 'trial';
    },

    getStatusLabel(status, days) {
        if (status === 'banned') return 'BANEADO';
        if (days <= 0) return 'EXPIRADO';
        if (status === 'active') return 'SUSCRITO';
        return 'PRUEBA GRATIS';
    },

    setupEventListeners() {
        // Search
        document.getElementById('userSearch').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this.users.filter(u =>
                (u.email && u.email.toLowerCase().includes(term)) ||
                (u.full_name && u.full_name.toLowerCase().includes(term))
            );
            this.renderTable(filtered);
        });

        // Logout
        document.getElementById('adminLogoutBtn').addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.href = '../login.html';
        });

        // Export CSV
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });
    },

    async extendTrial(userId) {
        if (!confirm("¿Extender prueba por 7 días?")) return;

        const { error } = await supabaseClient.rpc('extend_trial', {
            user_uuid: userId,
            extra_days: 7
        });

        // Note: Ideally we use an Edge Function or RLS update policy. 
        // For simplicity, we'll try a direct update first if RPC fails/doesn't exist.
        if (error) {
            // Fallback: Direct Update (requires Admin Policy)
            const user = this.users.find(u => u.id === userId);
            const currentEnd = new Date(user.trial_ends_at);
            currentEnd.setDate(currentEnd.getDate() + 7);

            const { error: updateError } = await supabaseClient
                .from('users')
                .update({ trial_ends_at: currentEnd.toISOString() })
                .eq('id', userId);

            if (updateError) {
                alert("Error actualizando: " + updateError.message);
                return;
            }
        }

        alert("✅ Prueba extendida correctamente.");
        this.fetchUsers(); // Refresh
    },

    exportToCSV() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Email,Nombre,Inicio Prueba,Fin Prueba,Estado\n";

        this.users.forEach(u => {
            const row = `${u.id},${u.email},${u.full_name},${u.trial_start_date},${u.trial_ends_at},${u.status}`;
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "aureus_users_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});
