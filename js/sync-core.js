/**
 * AUREUS AI - Unified Sync Core v1.0
 * Shared synchronization logic for Finance and FIT AI applications
 * 
 * This module provides:
 * - Unified Supabase connection handling
 * - Offline queue mechanism
 * - Retry logic with exponential backoff
 * - Sync status indicators
 * - Cross-tab synchronization
 */

window.SyncCore = (function () {
    'use strict';

    // ===== CONFIGURATION =====
    const CONFIG = {
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY_MS: 1000,
        SYNC_DEBOUNCE_MS: 500,
        OFFLINE_QUEUE_KEY: 'aureus_offline_queue',
        SYNC_STATUS_KEY: 'aureus_sync_status'
    };

    // ===== STATE =====
    let isOnline = navigator.onLine;
    let syncInProgress = false;
    let syncDebounceTimer = null;
    let offlineQueue = [];
    let statusListeners = [];
    let customExecutors = {};

    // ===== SYNC STATUS =====
    const SyncStatus = {
        IDLE: 'idle',
        SYNCING: 'syncing',
        SUCCESS: 'success',
        ERROR: 'error',
        OFFLINE: 'offline'
    };

    let currentStatus = SyncStatus.IDLE;

    function setStatus(status, message = '') {
        currentStatus = status;
        const statusData = { status, message, timestamp: Date.now() };

        // Notify all listeners
        statusListeners.forEach(cb => {
            try { cb(statusData); } catch (e) { console.error('Status listener error:', e); }
        });

        // Update UI indicator if exists
        updateStatusIndicator(statusData);
    }

    function onStatusChange(callback) {
        statusListeners.push(callback);
        return () => {
            statusListeners = statusListeners.filter(cb => cb !== callback);
        };
    }

    function updateStatusIndicator(statusData) {
        const indicator = document.getElementById('syncStatusIndicator');
        if (!indicator) return;

        const icons = {
            [SyncStatus.IDLE]: '☁️',
            [SyncStatus.SYNCING]: '🔄',
            [SyncStatus.SUCCESS]: '✅',
            [SyncStatus.ERROR]: '❌',
            [SyncStatus.OFFLINE]: '📴'
        };

        indicator.innerHTML = icons[statusData.status] || '☁️';
        indicator.title = statusData.message || statusData.status;
        indicator.dataset.status = statusData.status;
    }

    // ===== USER KEY MANAGEMENT =====
    function getCurrentUser() {
        const hubUserJson = localStorage.getItem('aureus_active_user');
        if (hubUserJson) {
            try {
                const u = JSON.parse(hubUserJson);
                return {
                    id: u.id || null,
                    name: u.name || 'Invitado',
                    email: u.email || null,
                    avatar: u.avatar || ''
                };
            } catch (e) {
                console.error("Error parsing hub user", e);
            }
        }
        return { id: null, name: 'Invitado', email: null, avatar: '' };
    }

    function getUserKey(namespace) {
        const user = getCurrentUser();
        const identifier = user.id || user.name || 'default';
        return `${namespace}_${identifier}`;
    }

    // ===== OFFLINE QUEUE =====
    function loadOfflineQueue() {
        try {
            const stored = localStorage.getItem(CONFIG.OFFLINE_QUEUE_KEY);
            offlineQueue = stored ? JSON.parse(stored) : [];
        } catch (e) {
            offlineQueue = [];
        }
        return offlineQueue;
    }

    function saveOfflineQueue() {
        try {
            localStorage.setItem(CONFIG.OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
        } catch (e) {
            console.error('Failed to save offline queue:', e);
        }
    }

    function queueOperation(operation) {
        offlineQueue.push({
            ...operation,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        });
        saveOfflineQueue();
        console.log('📦 Operation queued for later sync:', operation.type);
    }

    async function processOfflineQueue() {
        if (!isOnline || offlineQueue.length === 0) return;

        console.log(`🔄 Processing ${offlineQueue.length} queued operations...`);
        setStatus(SyncStatus.SYNCING, `Processing ${offlineQueue.length} queued items`);

        const failed = [];
        for (const op of offlineQueue) {
            try {
                await executeOperation(op);
                console.log('✅ Queued operation completed:', op.type);
            } catch (e) {
                console.error('❌ Failed queued operation:', op.type, e);
                failed.push(op);
            }
        }

        offlineQueue = failed;
        saveOfflineQueue();

        if (failed.length === 0) {
            setStatus(SyncStatus.SUCCESS, 'All queued items synced');
        } else {
            setStatus(SyncStatus.ERROR, `${failed.length} items failed to sync`);
        }
    }

    async function executeOperation(op) {
        const supabase = window.supabaseClient;
        if (!supabase) throw new Error('Supabase client not available');

        switch (op.type) {
            case 'upsert':
                const { error } = await supabase.from(op.table).upsert(op.data);
                if (error) throw error;
                break;
            case 'delete':
                const { error: delError } = await supabase.from(op.table).delete().eq('id', op.id);
                if (delError) throw delError;
                break;
            default:
                // Check for custom executor
                if (customExecutors[op.type]) {
                    await customExecutors[op.type](op);
                    break;
                }
                throw new Error(`Unknown operation type: ${op.type}`);
        }
    }

    // ===== RETRY LOGIC =====
    async function withRetry(fn, attempts = CONFIG.RETRY_ATTEMPTS) {
        let lastError;
        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            } catch (e) {
                lastError = e;
                console.warn(`Attempt ${i + 1}/${attempts} failed:`, e.message);
                if (i < attempts - 1) {
                    await new Promise(r => setTimeout(r, CONFIG.RETRY_DELAY_MS * Math.pow(2, i)));
                }
            }
        }
        throw lastError;
    }

    // ===== DEBOUNCED SYNC =====
    function debouncedSync(syncFn) {
        if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

        syncDebounceTimer = setTimeout(async () => {
            if (syncInProgress) return;
            syncInProgress = true;

            try {
                if (!isOnline) {
                    setStatus(SyncStatus.OFFLINE, 'Offline - queuing...');
                } else {
                    setStatus(SyncStatus.SYNCING, 'Syncing...');
                }

                await syncFn();
                setStatus(SyncStatus.SUCCESS, 'Synced');

            } catch (e) {
                console.error('Sync failed:', e);
                setStatus(SyncStatus.ERROR, e.message);
            } finally {
                syncInProgress = false;
            }
        }, CONFIG.SYNC_DEBOUNCE_MS);
    }

    // ===== NETWORK HANDLING =====
    function initNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('🌐 Back online');
            isOnline = true;
            setStatus(SyncStatus.IDLE, 'Online');
            processOfflineQueue();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Offline');
            isOnline = false;
            setStatus(SyncStatus.OFFLINE, 'Offline mode');
        });
    }

    // ===== SUPABASE HELPERS =====
    async function getSession() {
        const supabase = window.supabaseClient;
        if (!supabase) return null;

        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    async function getUser() {
        const session = await getSession();
        return session?.user || null;
    }

    async function isAuthenticated() {
        const user = await getUser();
        return !!user;
    }

    // ===== CROSS-TAB SYNC =====
    function initCrossTabSync(onSync) {
        window.addEventListener('storage', (e) => {
            if (e.key && (e.key.startsWith('aureus_') || e.key.startsWith('finance_app_state_')) && e.newValue !== null) {
                console.log('📡 Cross-tab change detected:', e.key);
                if (typeof onSync === 'function') {
                    let parsedValue = e.newValue;
                    try {
                        parsedValue = JSON.parse(e.newValue);
                    } catch (err) {
                        // Value is not JSON (e.g. a simple string like an email or name), use as is
                    }
                    onSync(e.key, parsedValue);
                }
            }
        });
    }

    // ===== INITIALIZATION =====
    function init() {
        loadOfflineQueue();
        initNetworkListeners();

        // Process queue on load if online
        if (isOnline && offlineQueue.length > 0) {
            setTimeout(processOfflineQueue, 2000);
        }

        console.log('✅ SyncCore initialized');
    }

    // ===== PUBLIC API =====
    return {
        // Configuration
        CONFIG,
        SyncStatus,

        // Status
        getStatus: () => currentStatus,
        setStatus,
        onStatusChange,

        // User
        getCurrentUser,
        getUserKey,
        getSession,
        getUser,
        isAuthenticated,

        // Sync
        debouncedSync,
        withRetry,

        // Offline
        queueOperation,
        processOfflineQueue,
        getOfflineQueue: () => [...offlineQueue],

        // Network
        isOnline: () => isOnline,

        // Cross-tab
        initCrossTabSync,

        // Custom Executors
        registerExecutor: (type, executor) => {
            if (typeof executor !== 'function') {
                console.error(`registerExecutor: executor for '${type}' must be a function`);
                return;
            }
            customExecutors[type] = executor;
            console.log(`🔧 SyncCore: Registered executor for '${type}'`);
        },

        // Init
        init
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState !== 'loading') {
    window.SyncCore.init();
} else {
    document.addEventListener('DOMContentLoaded', () => window.SyncCore.init());
}

console.log('📦 SyncCore module loaded');
