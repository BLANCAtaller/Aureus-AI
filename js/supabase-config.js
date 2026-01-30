// Supabase Configuration for AUREUS AI
// This file initializes the Supabase client and exports it for use across the app.

const SUPABASE_URL = "https://rjeduxymrcgezztageos.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HG4nFF82NcUSYrNz8FLPJQ_VHI_2SAN";

// Initialize the Supabase client
const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for global use if needed, or use as a module
window.supabaseClient = supabaseClient;

console.log("🚀 AUREUS AI: Supabase Infrastructure Initialized");

/**
 * AUTH HELPERS (Supabase version)
 */
async function signInWithGoogleSupabase() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/dashboard-select.html'
        }
    });
    return { data, error };
}

async function signOutSupabase() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        localStorage.removeItem('aureus_active_user');
        window.location.href = 'login.html';
    }
    return { error };
}

async function getSupabaseUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}
