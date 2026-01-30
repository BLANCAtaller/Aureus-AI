// Firebase Configuration for AUREUS
// Shared across all apps (Finance OS, Nutrition AI, etc.)

var firebaseConfig = {
    apiKey: "AIzaSyDjWdE6aj2BYVHI8xMEFePshLInLxB1xcY",
    authDomain: "aureus-ai-finance-os.firebaseapp.com",
    projectId: "aureus-ai-finance-os",
    storageBucket: "aureus-ai-finance-os.firebasestorage.app",
    messagingSenderId: "696180081706",
    appId: "1:696180081706:web:d95b895432991a963e2f53",
    measurementId: "G-NV4LJWBTGG"
};

// Initialize Firebase (only once)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Auth instance
var auth = firebase.auth();

// Firestore instance
var db = firebase.firestore();

// Google Auth Provider
var googleProvider = new firebase.auth.GoogleAuthProvider();

// ============================================
// AUTH HELPER FUNCTIONS
// ============================================

/**
 * Sign in with email and password
 */
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Sign in with Google popup
 */
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Register new user with email and password
 */
async function registerWithEmail(email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 */
async function signOutUser() {
    try {
        await auth.signOut();
        // Clear any local storage data
        localStorage.removeItem('aureus_active_user');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get current user
 */
function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Check if user is logged in - redirects if not
 */
function requireAuth(redirectUrl = 'login.html') {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = redirectUrl;
        }
    });
}

/**
 * Redirect if already logged in
 */
function redirectIfLoggedIn(redirectUrl = 'dashboard-select.html') {
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = redirectUrl;
        }
    });
}
