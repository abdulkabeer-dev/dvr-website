/* ============================================================
   SREE DVR BROADBAND - FIREBASE CONFIGURATION CONNECTOR
   ============================================================ */

// Global instances
export let firebaseApp = null;
export let auth = null;
export let db = null;
export let storage = null;
export let isFirebaseReady = false;

// Integrated Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCXa_04vXbgmjUBT1CLEQiqhFAU81qB8fU",
  authDomain: "dvr-website-cfcb9.firebaseapp.com",
  projectId: "dvr-website-cfcb9",
  storageBucket: "dvr-website-cfcb9.firebasestorage.app",
  messagingSenderId: "1092531190561",
  appId: "1:1092531190561:web:581381b563aa12e9065c60",
  measurementId: "G-FCCRNRSN85"
};

// Initialize Firebase
export function initializeFirebase() {
    try {
        if (window.firebase) {
            if (window.firebase.apps.length === 0) {
                firebaseApp = window.firebase.initializeApp(FIREBASE_CONFIG);
            } else {
                firebaseApp = window.firebase.app();
            }
            auth = window.firebase.auth();
            db = window.firebase.firestore();
            if (typeof window.firebase.storage === "function") {
                storage = window.firebase.storage();
            }
            isFirebaseReady = true;
            console.log("🔥 Firebase successfully initialized from integrated configurations.");
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

// Auto-initialize on load if scripts are ready
if (window.firebase) {
    initializeFirebase();
}
