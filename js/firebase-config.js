/* ============================================================
   SREE DVR BROADBAND - FIREBASE CONFIGURATION CONNECTOR
   ============================================================ */

// Key used to store Firebase credentials in localStorage
const LOCAL_STORAGE_KEY = "dvr_firebase_config";

// Global instances
export let firebaseApp = null;
export let auth = null;
export let db = null;
export let storage = null;
export let isFirebaseReady = false;

// Check if credentials exist and try to initialize Firebase
export function initializeFirebase(customConfig = null) {
    const config = customConfig || getStoredConfig();

    if (!config || !config.apiKey || !config.projectId) {
        console.warn("Firebase config not found or incomplete. Falling back to local seed data database.");
        isFirebaseReady = false;
        return false;
    }

    try {
        // Load Firebase SDK modularly from CDN inside the app (if not loaded via index scripts)
        // For standard Vanilla JS loading, we assume standard firebase scripts are included in index/admin.html
        if (window.firebase) {
            // Compat initialization for simpler CDN script inclusion
            if (window.firebase.apps.length === 0) {
                firebaseApp = window.firebase.initializeApp(config);
            } else {
                firebaseApp = window.firebase.app();
            }
            auth = window.firebase.auth();
            db = window.firebase.firestore();
            storage = window.firebase.storage();
            isFirebaseReady = true;
            console.log("🔥 Firebase successfully initialized from stored configurations.");
            return true;
        } else {
            console.error("Firebase SDK script not loaded on the window object.");
            isFirebaseReady = false;
            return false;
        }
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        isFirebaseReady = false;
        return false;
    }
}

// Retrieve config from localStorage
export function getStoredConfig() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Error reading stored Firebase config", e);
        return null;
    }
}

// Save config to localStorage
export function saveFirebaseConfig(config) {
    if (!config || typeof config !== "object") return false;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
        console.log("Firebase config saved successfully.");
        return true;
    } catch (e) {
        console.error("Error saving Firebase config", e);
        return false;
    }
}

// Clear config from localStorage
export function clearFirebaseConfig() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log("Firebase config cleared.");
        return true;
    } catch (e) {
        console.error("Error clearing Firebase config", e);
        return false;
    }
}

// Initialize on file load if scripts are ready
if (window.firebase) {
    initializeFirebase();
}
