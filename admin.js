// Admin Panel JavaScript

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBKrq8w4A05FCWb2pdGZ_sGZi5wEqdMmxM",
    authDomain: "myapp-5-8bc43.firebaseapp.com",
    projectId: "myapp-5-8bc43",
    storageBucket: "myapp-5-8bc43.firebasestorage.app",
    messagingSenderId: "1096643150430",
    appId: "1:1096643150430:web:0295ed5bae989263266acf",
    measurementId: "G-XBPRHN715Z"
};

// Firebase Imports
import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    addDoc,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Firebase (check if already initialized)
let app, auth, db;
try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    // Defer error display until DOM is ready
    setTimeout(() => {
        showFirebaseInitError(error);
    }, 100);
}

function showFirebaseInitError(error) {
    const errorEl = document.getElementById('admin-login-error');
    if (errorEl) {
        errorEl.textContent = `Firebase initialization failed: ${error.message}. Please check your internet connection and Firebase configuration.`;
        errorEl.classList.add('show');
    }

    // Also show custom dialog for better visibility
    setTimeout(() => {
        if (window.showErrorDialog) {
            window.showErrorDialog(
                `Firebase initialization failed: ${error.message}. Please check your internet connection and Firebase configuration.`,
                'Firebase Initialization Error'
            );
        } else if (window.showDialog) {
            window.showDialog({
                type: 'error',
                title: 'Firebase Initialization Error',
                message: `Firebase initialization failed: ${error.message}. Please check your internet connection and Firebase configuration.`
            });
        }
    }, 100);
}

// Admin Configuration
const ADMIN_EMAIL = 'rixaski@gmail.com';

// State
let currentAdmin = null;
let clientsData = [];
let sessionsData = [];
let isRegisteringClient = false; // Flag to prevent auth state handler from logging out during registration
let adminPasswordStored = null; // Temporarily store admin password during registration (cleared after use)

// Global filter state

// Constituency-Island mapping - Use same structure as app.js
// This will be synchronized with app.js constituencyIslandData
let constituencyIslandMapping = {};

// Sync with app.js data when available
function syncConstituencyData() {
    if (window.constituencyIslandData) {
        constituencyIslandMapping = window.constituencyIslandData;
    }
}

// Initialize on load and when app.js data becomes available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncConstituencyData);
} else {
    syncConstituencyData();
}

// Also sync when window loads (in case app.js loads after admin.js)
window.addEventListener('load', syncConstituencyData);

// Fallback mapping (will be replaced when app.js loads)
const fallbackConstituencyMapping = {
    "A01 Hoarafushi Dhaaira": ["Hoarafushi", "Thuraakunu", "Uligan"],
    "A02 Ihavandhoo Dhaaira": ["Ihavandhoo", "Maarandhoo", "Molhadhoo"],
    "A03 Baarashu Dhaairaa": ["Baarah", "Muraidhoo", "Thakandhoo", "Utheemu"],
    "A04 Dhidhoo Dhaaira": ["Dhidhdhoo"],
    "A05 Kelaa Dhaaira": ["Filladhoo", "Kelaa", "Vashafaru"],
    "B01 Hanimaadhoo Dhaaira": ["Finey", "Hanimaadhoo", "Hirimaradhoo", "Naivaadhoo"],
    "B02 Nolhivaram Dhaaira": ["Kunburudhoo", "Maavaidhoo", "Nolhivaran", "Nolhivaranfaru"],
    "B03 Vaikaradhoo Dhaaira": ["Kurinbi", "Nellaidhoo", "Vaikaradhoo"],
    "B04 Kulhudhuffushi Uthuru Dhaaira": ["Kulhudhuffushi"],
    "B05 Kulhudhuffushi Dhekunu Dhaaira": ["Kulhudhuffushi"],
    "B06 Makunudhoo Dhaaira": ["Kumundhoo", "Makunudhoo", "Neykurendhoo"],
    "C01 Kanditheemu Dhaaira": ["Bilehfahi", "Feydhoo", "Goidhoo", "Kanditheemu", "Noomaraa"],
    "C02 Milandhoo Dhaaira": ["Feevah", "Milandhoo", "Narudhoo"],
    "C03 Komandoo Dhaaira": ["Foakaidhoo", "Komandoo", "Maroshi"],
    "C04 Funadhoo Dhaaira": ["Funadhoo", "Lhaimagu", "Maaungoodhoo"],
    "D01 Kendhikulhudhoo Dhaaira": ["Henbadhoo", "Kendhikulhudhoo", "Kudafari", "Maalhendhoo"],
    "D02 Manadhoo Dhaaira": ["Landhoo", "Maafaru", "Manadhoo"],
    "D03 Velidhoo Dhaaira": ["Fodhdhoo", "Lhohi", "Velidhoo"],
    "D04 Holhudhoo Dhaaira": ["Holhudhoo", "Magoodhoo", "Miladhoo"],
    "E01 Alifushi Dhaaira": ["Alifushi", "Angolhitheemu", "Rasgetheemu", "Vaadhoo"],
    "E02 Ungoofaaru Dhaaira": ["Hulhudhuffaaru", "Maakurathu", "Ungoofaaru"],
    "E03 Dhuvaafaru Dhaairaa": ["Dhuvaafaru"],
    "E04 Inguraidhoo Dhaaira": ["Fainu", "Inguraidhoo", "Innamaadhoo", "Kinolhas", "Rasmaadhoo"],
    "E05 Maduvvari Dhaaira": ["Maduvvari", "Meedhoo"],
    "F01 Thulhaadhoo Dhaaira": ["Fehendhoo", "Fulhadhoo", "Thulhaadhoo"],
    "F02 Eydhafushi Dhaaira": ["Eydhafushi", "Hithaadhoo", "Maalhos"],
    "F03 Kendhoo Dhaaira": ["Dharavandhoo", "Dhonfan", "Kamadhoo", "Kendhoo", "Kihaadhoo", "Kudarikilu"],
    "F04 Hithaadhoo Dhaaira": ["Hithaadhoo"],
    "G01 Hinnavaru Dhaaira": ["Hinnavaru"],
    "G02 Naifaru Dhaairaa": ["Naifaru"],
    "G03 Kurendhoo Dhaaira": ["Kurendhoo", "Olhuvelifushi"],
    "H01 Kaashidhoo Dhaaira": ["Gaafaru", "Kaashidhoo"],
    "H02 Thulusdhoo Dhaaira": ["Dhiffushi", "Hinmafushi", "Huraa", "Thulusdhoo"],
    "H03 Maafushi Dhaaira": ["Gulhi", "Guraidhoo", "Maafushi"],
    "H04 Huraa Dhaaira": ["Huraa"],
    "I01 Maamigili Dhaaira": ["Fenfushi", "Maamigili"],
    "I02 Mahibadhoo Dhaaira": ["Hangnaameedhoo", "Mahibadhoo"],
    "I03 Dhangethi Dhaaira": ["Dhangethi", "Dhigurah", "Mandhoo", "Omadhoo"],
    "J01 Felidhoo Dhaaira": ["Felidhoo", "Fulidhoo", "Thinadhoo"],
    "J02 Keyodhoo Dhaaira": ["Keyodhoo", "Rakeedhoo"],
    "K01 Dhiggaru Dhaaira": ["Dhiggaru", "Muli", "Raiymandhoo", "Veyvah"],
    "K02 Mulaku Dhaaira": ["Kolhufushi", "Mulah", "Naalaafushi"],
    "L01 Bileydhoo Dhaaira": ["Bilehdhoo", "Feeali"],
    "L02 Nilandhoo Dhaaira": ["Dharanboodhoo", "Nilandhoo"],
    "M01 Meedhoo Dhaaira": ["Meedhoo", "Bandidhoo", "Hulhudheli", "Rinbudhoo"],
    "M02 Kudahuvadhoo Dhaaira": ["Kudahuvadhoo", "Maaenboodhoo", "Vaani"],
    "N01 Vilufushi Dhaaira": ["Buruni", "Madifushi", "Vilufushi"],
    "N02 Thimarafushi Dhaaira": ["Thimarafushi", "Veymandoo"],
    "N03 Kinbidhoo Dhaaira": ["Hirilandhoo", "Kandoodhoo", "Kinbidhoo", "Vandhoo"],
    "N04 Guraidhoo Dhaairaa": ["Guraidhoo"],
    "O01 Isdhoo Dhaaira": ["Dhanbidhoo", "Isdhoo", "Kalaidhoo", "Maabaidhoo"],
    "O02 Gamu Dhaaira": ["Gan", "Mundoo"],
    "O03 Fonadhoo Dhaaira": ["Fonadhoo", "Gaadhoo", "Maamendhoo"],
    "O04 Maavashu Dhaaira": ["Hithadhoo", "Kunahandhoo", "Maavah"],
    "P01 Vilingili Dhaaira": ["Kolamaafushi", "Vilingili"],
    "P02 Dhandhoo Dhaaira": ["Dhaandhoo"],
    "P03 Gemanafushi Dhaaira": ["Dhevvadhoo", "Dhiyadhoo", "Gemanafushi", "Kanduhulhudhoo", "Kondey"],
    "P04 Kolamaafushi Dhaaira": ["Kolamaafushi"],
    "Q01 Thinadhoo Uthuru Dhaairaa": ["Thinadhoo"],
    "Q02 Thinadhoo Dhekunu Dhaairaa": ["Thinadhoo"],
    "Q03 Madaveli Dhaaira": ["Hoandedhdhoo", "Madaveli", "Nadellaa"],
    "Q04 Faresmaathodaa Dhaaira": ["Faresmaathodaa", "Fiyoaree", "Rathafandhoo"],
    "Q05 Gadhdhoo Dhaaira": ["Gadhdhoo"],
    "R01 Fuvahmulaku Uthuru Dhaairaa": ["Fuvahmulah"],
    "R02 Fuvahmulaku Medhu Dhaaira": ["Fuvahmulah"],
    "R03 Fuvahmulaku Dhekunu Dhaairaa": ["Fuvahmulah"],
    "S01 Hulhudhoo Dhaairaa": ["Hulhudhoo"],
    "S02 Feydhoo Dhekunu Dhaairaa": ["Feydhoo"],
    "S03 Maradhoo Dhaaira": ["Maradhoo"],
    "S04 Hithadhoo Uthuru Dhaairaa": ["Hithadhoo"],
    "S05 Hithadhoo Medhu Dhaaira": ["Hithadhoo"],
    "S06 Hithadhoo Dhekunu Dhaaira": ["Hithadhoo"],
    "S07 Addu Meedhoo Dhaaira": ["Addu Meedhoo"],
    "S08 Feydhoo Uthuru Dhaairaa": ["Feydhoo"],
    "T01 Hulhumale Dhekunu Dhaaira": ["Hulhumale"],
    "T02 Medhu Henveyru Dhaaira": ["Malé"],
    "T03 Henveyru Dhekunu Dhaaira": ["Malé"],
    "T04 Henveyru Uthuru Dhaaira": ["Malé"],
    "T05 Galolhu Uthuru Dhaaira": ["Malé"],
    "T06 Galolhu Dhekunu Dhaaira": ["Malé"],
    "T07 Mahchangoalhee Uthuru Dhaaira": ["Malé"],
    "T08 Mahchangoalhee Dhekunu Dhaaira": ["Malé"],
    "T09 Maafannu Uthuru Dhaaira": ["Malé"],
    "T10 Maafannu Hulhangu Dhaaira": ["Malé"],
    "T11 Maafannu Medhu Dhaaira": ["Malé"],
    "T12 Maafannu Dhekunu Dhaaira": ["Malé"],
    "T13 Villimale Dhaaira": ["Villimale"],
    "T14 Henveyru Hulhangu Dhaaira": ["Malé"],
    "T15 Mahchangoalhee Medhu Dhaaira": ["Malé"],
    "T16 Hulhumaale Medhu Dhaaira": ["Hulhumale"],
    "T17 Hulhumaale Uthuru Dhaaira": ["Hulhumale"],
    "U01 Mathiveri Dhaaira": ["Bodufolhudhoo", "Feridhoo", "Himandhoo", "Mathiveri"],
    "U02 Thoddoo Dhaaira": ["Rasdhoo", "Thoddoo", "Ukulhas"]
};

// Initialize with fallback, will be replaced when app.js loads
constituencyIslandMapping = fallbackConstituencyMapping;

// Helper functions for constituency-island relationship
function getAllConstituencies() {
    return Object.keys(constituencyIslandMapping).sort();
}

function getIslandsForConstituency(constituency) {
    if (!constituency) return [];
    return constituencyIslandMapping[constituency] || [];
}

function getConstituencyForIsland(island) {
    if (!island) return null;
    for (const [constituency, islands] of Object.entries(constituencyIslandMapping)) {
        if (islands.includes(island)) {
            return constituency;
        }
    }
    return null;
}

// Update admin online status
async function updateAdminPresence(isOnline) {
    try {
        const adminRef = doc(db, 'users', ADMIN_EMAIL);
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists()) {
            await updateDoc(adminRef, {
                isOnline: isOnline,
                lastSeen: serverTimestamp()
            });
        } else {
            // Create admin user document if it doesn't exist
            await setDoc(adminRef, {
                email: ADMIN_EMAIL,
                name: 'Support',
                isOnline: isOnline,
                lastSeen: serverTimestamp(),
                serialNumber: 'ADMIN'
            });
        }
        console.log(`[Admin Presence] Set admin online status to: ${isOnline}`);
    } catch (error) {
        console.error('Error updating admin presence:', error);
    }
}

// Utility Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // If showing admin dashboard, ensure modal buttons are attached
        if (screenId === 'admin-dashboard') {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                attachModalListeners();
            }, 100);
        }
    }
}

function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Firebase Error Code to User-Friendly Message Mapping
function getFirebaseErrorMessage(error) {
    // Handle string messages that might contain error codes
    let errorCode = null;
    let errorMessage = null;

    if (typeof error === 'string') {
        // Check if string contains an error code pattern
        const codeMatch = error.match(/(auth\/[\w-]+|storage\/[\w-]+|permission-denied|unavailable|unauthenticated)/);
        if (codeMatch) {
            errorCode = codeMatch[0];
        } else {
            // Return the string as-is if it doesn't match a code pattern
            return error;
        }
    } else if (error && typeof error === 'object') {
        errorCode = error.code;
        errorMessage = error.message;
    }

    if (!errorCode) {
        return errorMessage || 'An unexpected error occurred. Please try again.';
    }

    const errorMessages = {
        // Authentication Errors
        'auth/invalid-credential': 'The email or password you entered is incorrect. Please check your credentials and try again.',
        'auth/wrong-password': 'The password you entered is incorrect. Please try again.',
        'auth/user-not-found': 'No account found with this email address. Please check your email and try again.',
        'auth/invalid-email': 'The email address you entered is not valid. Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled. Please contact your administrator for assistance.',
        'auth/too-many-requests': 'Too many failed login attempts. Please wait a few minutes before trying again.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
        'auth/weak-password': 'The password you entered is too weak. Please use a stronger password (at least 6 characters).',
        'auth/email-already-in-use': 'An account with this email address already exists.',
        'auth/requires-recent-login': 'For security reasons, please log in again before changing your password.',
        'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
        'auth/internal-error': 'An internal error occurred. Please try again later.',
        'auth/user-token-expired': 'Your session has expired. Please log in again.',
        'auth/invalid-user-token': 'Your session is invalid. Please log in again.',
        'auth/api-key-not-valid': 'Firebase configuration error. Please contact your administrator.',

        // Firestore Errors
        'permission-denied': 'You do not have permission to perform this action. Please make sure you are logged in and that your account has the necessary permissions.',
        'unavailable': 'Service is temporarily unavailable. Please try again later.',
        'unauthenticated': 'You must be logged in to perform this action.',
        'cancelled': 'The operation was cancelled.',

        // Storage Errors
        'storage/unauthorized': 'You do not have permission to upload files. Please contact your administrator.',
        'storage/canceled': 'Upload was cancelled.',
        'storage/unknown': 'An unknown error occurred during upload. Please try again.',
        'storage/invalid-format': 'Invalid file format. Please check the file and try again.',
        'storage/object-not-found': 'The requested file was not found.',
    };

    return errorMessages[errorCode] || errorMessage || 'An unexpected error occurred. Please try again.';
}

function showError(message, elementId = null) {
    // Always hide loading when showing error
    showLoading(false);

    // Get user-friendly error message
    const friendlyMessage = getFirebaseErrorMessage(message);

    // Show inline error if element ID provided
    if (elementId) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = friendlyMessage;
            errorEl.classList.add('show');
            setTimeout(() => {
                errorEl.classList.remove('show');
            }, 5000);
            return;
        }
    }

    // Use dialog if available
    let dialogTitle = 'Error';
    if (message && typeof message === 'object' && message.code) {
        if (message.code.includes('auth/')) {
            dialogTitle = 'Authentication Error';
        } else if (message.code.includes('storage/')) {
            dialogTitle = 'Upload Error';
        } else if (message.code === 'permission-denied') {
            dialogTitle = 'Permission Error';
        }
    } else if (typeof message === 'string') {
        if (message.includes('auth/') || message.includes('invalid-credential')) {
            dialogTitle = 'Authentication Error';
        } else if (message.includes('storage/')) {
            dialogTitle = 'Upload Error';
        } else if (message.includes('permission-denied')) {
            dialogTitle = 'Permission Error';
        }
    }

    if (window.showErrorDialog) {
        window.showErrorDialog(friendlyMessage, dialogTitle);
    } else {
        alert(friendlyMessage);
    }
}

function showSuccess(message, title = 'Success') {
    // Always use the custom dialog system from dialog.js if available
    if (typeof window.showSuccess === 'function') {
        window.showSuccess(message, title);
    } else if (typeof window.showDialog === 'function') {
        // Fallback to showDialog if showSuccess not available
        window.showDialog({
            type: 'success',
            title: title,
            message: message
        });
    } else {
        // Last resort: use alert
        alert(`${title}\n\n${message}`);
    }
}

// Generate Random String
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate 4-digit Client Code
function generateClientCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Get Client Access Link
function getClientAccessLink(clientCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/index.html?code=${clientCode}`;
}

// Get User IP and Location (using free APIs)
async function getUserLocation() {
    try {
        // Get IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        // Get location from IP
        const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        const locationData = await locationResponse.json();

        return {
            ip: ip,
            city: locationData.city || 'Unknown',
            region: locationData.region || 'Unknown',
            country: locationData.country_name || 'Unknown',
            countryCode: locationData.country_code || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return {
            ip: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            countryCode: 'Unknown'
        };
    }
}

// Initialize Admin Panel
function initAdmin() {
    initializeIcons();
    setupEventListeners();
    checkAdminAuth();
}

// Check Admin Authentication
function checkAdminAuth() {
    let isProcessing = false;
    onAuthStateChanged(auth, async (user) => {
        // Prevent multiple simultaneous auth state changes
        if (isProcessing) {
            console.log('[checkAdminAuth] Auth state change already processing, skipping...');
            return;
        }

        isProcessing = true;
        console.log('[checkAdminAuth] Auth state changed, user:', user ? user.email : 'null');

        try {
            if (user) {
                // Check if admin
                if (user.email === ADMIN_EMAIL) {
                    console.log('[checkAdminAuth] Admin authenticated, showing dashboard');
                    currentAdmin = user;

                    // Set admin as online
                    updateAdminPresence(true).catch(err => {
                        console.error('Error setting admin online:', err);
                    });

                    // Try to load password from storage if not already in memory
                    // Check localStorage first (persists across sessions), then sessionStorage
                    if (!adminPasswordStored) {
                        try {
                            // Try localStorage first (more persistent)
                            let storedPassword = localStorage.getItem('adminPasswordTemp');
                            if (storedPassword) {
                                adminPasswordStored = storedPassword;
                                console.log('[checkAdminAuth] Admin password loaded from localStorage');
                                // Also store in sessionStorage for consistency
                                try {
                                    sessionStorage.setItem('adminPasswordTemp', storedPassword);
                                } catch (e) {
                                    // Ignore if sessionStorage fails
                                }
                            } else {
                                // Fallback to sessionStorage
                                storedPassword = sessionStorage.getItem('adminPasswordTemp');
                                if (storedPassword) {
                                    adminPasswordStored = storedPassword;
                                    console.log('[checkAdminAuth] Admin password loaded from sessionStorage');
                                    // Also store in localStorage for persistence
                                    try {
                                        localStorage.setItem('adminPasswordTemp', storedPassword);
                                    } catch (e) {
                                        // Ignore if localStorage fails
                                    }
                                } else {
                                    console.warn('[checkAdminAuth] Admin password not found in storage. Password will be required when registering clients.');
                                }
                            }
                        } catch (storageError) {
                            console.warn('[checkAdminAuth] Could not read password from storage:', storageError);
                        }
                    }

                    const nameDisplay = document.getElementById('admin-name-display');
                    if (nameDisplay) {
                        nameDisplay.textContent = user.email;
                    }

                    // Update mobile profile dropdown email
                    const profileEmail = document.getElementById('admin-profile-email');
                    if (profileEmail) {
                        profileEmail.textContent = user.email;
                    }
                    showScreen('admin-dashboard');
                    // Wait a bit for screen to show, then load dashboard
                    setTimeout(() => {
                        loadDashboard();
                    }, 100);
                } else {
                    // Not admin - check if we're in the middle of registering a client
                    if (isRegisteringClient) {
                        console.log('[checkAdminAuth] Non-admin user detected during client registration, ignoring auth state change');
                        // Don't sign out - we'll restore admin session in registerNewClient
                        return;
                    }

                    // Not admin - sign out and show login
                    console.log('[checkAdminAuth] Non-admin user detected, signing out');
                    // Only sign out if we're on the admin panel
                    const currentScreen = document.querySelector('.screen.active');
                    if (currentScreen && currentScreen.id === 'admin-dashboard') {
                        await signOut(auth);
                        showScreen('admin-login-screen');
                        const errorEl = document.getElementById('admin-login-error');
                        if (errorEl) {
                            errorEl.textContent = 'Only admin can access this panel. Please login with admin credentials.';
                            errorEl.classList.add('show');
                        }
                    }
                }
            } else {
                // No user authenticated - set admin as offline
                updateAdminPresence(false).catch(err => {
                    console.error('Error setting admin offline:', err);
                });

                // No user authenticated
                if (isRegisteringClient) {
                    console.log('[checkAdminAuth] No user during client registration, waiting for admin restore...');
                    // Don't show login screen during registration - we'll handle it after
                    return;
                }
                console.log('[checkAdminAuth] No user authenticated, showing login screen');
                showScreen('admin-login-screen');
            }
        } catch (error) {
            console.error('[checkAdminAuth] Error in auth state handler:', error);
        } finally {
            // Reset processing flag after a short delay
            setTimeout(() => {
                isProcessing = false;
            }, 1000);
        }
    }, (error) => {
        console.error('[checkAdminAuth] Auth state error:', error);
    });
};

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Admin Login
    const adminLoginForm = document.getElementById('admin-login-form');
    console.log('Login form found:', adminLoginForm ? 'Yes' : 'No');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Login form submitted');
            await handleAdminLogin();
        });

        // Also handle enter key on inputs
        const emailInput = document.getElementById('admin-email');
        const passwordInput = document.getElementById('admin-password');

        if (emailInput) {
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (passwordInput) {
                        passwordInput.focus();
                    }
                }
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    adminLoginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    } else {
        console.error('Admin login form not found!');
    }

    // Profile Dropdown Toggle (Mobile)
    const profileToggle = document.getElementById('admin-profile-toggle');
    const profileDropdown = document.getElementById('admin-profile-dropdown-menu');

    if (profileToggle && profileDropdown) {
        // Toggle dropdown on click
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && profileDropdown.classList.contains('active')) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // Admin Logout (Desktop and Mobile)
    const logoutBtn = document.getElementById('admin-logout-btn');
    const logoutMobileBtn = document.getElementById('admin-logout-mobile');

    const handleLogout = async () => {
        // Close profile dropdown if open
        if (profileDropdown) {
            profileDropdown.classList.remove('active');
        }

        // Set admin as offline
        updateAdminPresence(false).catch(err => {
            console.error('Error setting admin offline:', err);
        });

        // Clear stored password on logout
        adminPasswordStored = null;
        try {
            // Clear from both localStorage and sessionStorage
            localStorage.removeItem('adminPasswordTemp');
            sessionStorage.removeItem('adminPasswordTemp');
        } catch (storageError) {
            console.warn('Could not clear password from storage:', storageError);
        }
        await signOut(auth);
        showScreen('admin-login-screen');
    };

    // Attach logout handler to both desktop and mobile buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (logoutMobileBtn) {
        logoutMobileBtn.addEventListener('click', handleLogout);
    }

    // Navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Attach modal listeners (can be called multiple times safely)
    attachModalListeners();
}

// Function to attach modal button listeners
function attachModalListeners() {
    // Add License Modal
    const addLicenseBtn = document.getElementById('add-license-btn');
    const closeLicenseModal = document.getElementById('close-license-modal');
    const cancelLicense = document.getElementById('cancel-license');
    const addLicenseModal = document.getElementById('add-license-modal');

    if (addLicenseBtn && addLicenseModal) {
        // Remove existing listener if any (to prevent duplicates)
        const newAddLicenseBtn = addLicenseBtn.cloneNode(true);
        addLicenseBtn.parentNode.replaceChild(newAddLicenseBtn, addLicenseBtn);

        newAddLicenseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[attachModalListeners] Opening license modal');
            // Clear error message when opening modal
            const errorEl = document.getElementById('license-error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            // Reset form
            const form = document.getElementById('generate-license-form');
            if (form) {
                form.reset();
            }
            addLicenseModal.classList.add('active');
            console.log('[attachModalListeners] License modal active class added');
        });
    } else {
        console.warn('[attachModalListeners] License modal elements not found:', {
            addLicenseBtn: !!addLicenseBtn,
            addLicenseModal: !!addLicenseModal
        });
    }

    if (closeLicenseModal && addLicenseModal) {
        closeLicenseModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addLicenseModal.classList.remove('active');
        });
    }

    if (cancelLicense && addLicenseModal) {
        cancelLicense.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addLicenseModal.classList.remove('active');
        });
    }

    // Add Client Modal
    const addClientBtn = document.getElementById('add-client-btn');
    const closeClientModal = document.getElementById('close-client-modal');
    const cancelClientRegister = document.getElementById('cancel-client-register');
    const addClientModal = document.getElementById('add-client-modal');

    if (addClientBtn && addClientModal) {
        // Remove existing listener if any (to prevent duplicates)
        const newAddClientBtn = addClientBtn.cloneNode(true);
        addClientBtn.parentNode.replaceChild(newAddClientBtn, addClientBtn);

        newAddClientBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[attachModalListeners] Opening client modal');
            // Clear error message when opening modal
            const errorEl = document.getElementById('client-register-error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }
            // Reset form
            const form = document.getElementById('register-client-form');
            if (form) {
                form.reset();
            }
            addClientModal.classList.add('active');
            console.log('[attachModalListeners] Client modal active class added');
        });
    } else {
        console.warn('[attachModalListeners] Client modal elements not found:', {
            addClientBtn: !!addClientBtn,
            addClientModal: !!addClientModal
        });
    }

    if (closeClientModal && addClientModal) {
        closeClientModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addClientModal.classList.remove('active');
        });
    }

    if (cancelClientRegister && addClientModal) {
        cancelClientRegister.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addClientModal.classList.remove('active');
        });
    }

    // Generate Password Button
    const generatePasswordBtn = document.getElementById('generate-password-btn');
    if (generatePasswordBtn) {
        generatePasswordBtn.addEventListener('click', () => {
            document.getElementById('client-temp-password').value = generateRandomString(12);
        });
    }

    // Generate Serial Button
    const generateSerialBtn = document.getElementById('generate-serial-btn');
    if (generateSerialBtn) {
        generateSerialBtn.addEventListener('click', () => {
            document.getElementById('license-serial').value = `LIC-${generateRandomString(8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        });
    }

    // Register Client Form
    const registerClientForm = document.getElementById('register-client-form');
    if (registerClientForm) {
        registerClientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await registerNewClient();
        });
    }

    // Generate License Form
    const generateLicenseForm = document.getElementById('generate-license-form');
    if (generateLicenseForm) {
        generateLicenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await generateLicense();
        });
    }

    // Send Notification Form
    const sendNotificationForm = document.getElementById('send-notification-form');
    if (sendNotificationForm) {
        sendNotificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await sendNotification();
        });
    }

    // Notification Recipient Change
    const notificationRecipient = document.getElementById('notification-recipient');
    if (notificationRecipient) {
        notificationRecipient.addEventListener('change', (e) => {
            const specificGroup = document.getElementById('specific-client-group');
            if (e.target.value === 'specific') {
                specificGroup.style.display = 'block';
            } else {
                specificGroup.style.display = 'none';
            }
        });
    }

    // Refresh Sessions
    const refreshSessionsBtn = document.getElementById('refresh-sessions-btn');
    if (refreshSessionsBtn) {
        refreshSessionsBtn.addEventListener('click', () => {
            loadSessions();
        });
    }
}

// Handle Admin Login
async function handleAdminLogin() {
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const errorEl = document.getElementById('admin-login-error');

    if (!emailInput || !passwordInput) {
        console.error('Login form elements not found');
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous errors
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }

    showLoading(true);

    // Validate email format
    if (!email || !email.includes('@')) {
        showError('Please enter a valid email address.', 'admin-login-error');
        return;
    }

    // Check if admin email
    if (email !== ADMIN_EMAIL) {
        showError('Unauthorized. Only admin can access this panel. Admin email must be: ' + ADMIN_EMAIL, 'admin-login-error');
        return;
    }

    if (!password) {
        showError('Please enter your password.', 'admin-login-error');
        return;
    }

    try {
        console.log('Attempting admin login for:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful, user:', userCredential.user);

        currentAdmin = userCredential.user;

        // Verify it's the admin email (double check)
        if (userCredential.user.email !== ADMIN_EMAIL) {
            console.warn('Email mismatch after login');
            await signOut(auth);
            showError('Unauthorized. Only admin can access this panel.', 'admin-login-error');
            return;
        }

        // Store password temporarily for client registration (will be cleared after use)
        // This is needed to restore admin session after creating client users
        // Store in both memory and sessionStorage for persistence across page refreshes
        adminPasswordStored = password;
        try {
            // Store in both localStorage (persists) and sessionStorage (for compatibility)
            localStorage.setItem('adminPasswordTemp', password);
            sessionStorage.setItem('adminPasswordTemp', password);
            console.log('[handleAdminLogin] Admin password stored in localStorage and sessionStorage for session restoration');
        } catch (storageError) {
            console.warn('[handleAdminLogin] Could not store password in storage:', storageError);
            // Continue anyway - memory storage is still available
        }

        // Track admin login session (non-blocking)
        trackSession(email, 'admin', true).catch(trackError => {
            console.error('Error tracking session (non-critical):', trackError);
        });

        showSuccess('Admin login successful! Redirecting to dashboard...');

        // Small delay to show success message, then dashboard will show via auth state change
        setTimeout(() => {
            // Auth state change handler will show dashboard
        }, 500);

    } catch (error) {
        console.error('Admin login error details:', {
            code: error.code,
            message: error.message,
            email: email
        });

        // Use centralized error message function
        let errorMessage = getFirebaseErrorMessage(error);

        // Add specific context for admin login errors
        if (error.code === 'auth/user-not-found') {
            errorMessage = `Admin account not found. Please create the admin account (${ADMIN_EMAIL}) in Firebase Authentication console first.\n\nTo create the admin account:\n1. Go to Firebase Console\n2. Navigate to Authentication → Users\n3. Click "Add user"\n4. Enter email: ${ADMIN_EMAIL}\n5. Set a password`;
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = `Invalid email or password. Please verify:\n- Email: ${ADMIN_EMAIL}\n- Password matches what you set in Firebase Authentication`;
        }

        showError(error, 'admin-login-error');
    }
}

// Switch Section
function switchSection(section) {
    // Update nav active state
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Show section
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) {
        sectionEl.classList.add('active');
    }

    // Load section data
    if (section === 'clients') {
        loadClients();
    } else if (section === 'sessions') {
        loadSessions();
    } else if (section === 'records') {
        loadRecords();
    }
}

// Load Dashboard
async function loadDashboard() {
    await loadClients();
    updateStats();
}

// Load Clients
async function loadClients() {
    showLoading(true);
    try {
        const clientsQuery = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(clientsQuery);
        clientsData = [];

        snapshot.forEach(doc => {
            clientsData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderClientsTable();
        updateStats();
    } catch (error) {
        console.error('Error loading clients:', error);
        showError('Failed to load clients. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Render Clients Table
// Pagination state for clients table
let clientsCurrentPage = 1;
const clientsRecordsPerPage = 10;

function renderClientsTable() {
    const tbody = document.getElementById('clients-table-body');
    const searchInput = document.getElementById('client-search');
    const filterInput = document.getElementById('status-filter');


    const searchTerm = (searchInput && searchInput.value) ? searchInput.value.toLowerCase() : '';
    const statusFilter = (filterInput && filterInput.value) ? filterInput.value : 'all';

    let filteredClients = clientsData.filter(client => {
        const matchesSearch = !searchTerm ||
            (client.name && client.name.toLowerCase().includes(searchTerm)) ||
            (client.email && client.email.toLowerCase().includes(searchTerm)) ||
            (client.clientCode && client.clientCode.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && client.isActive !== false) ||
            (statusFilter === 'suspended' && client.isActive === false) ||
            (statusFilter === 'pending' && !client.licenseActive);

        return matchesSearch && matchesStatus;
    });

    // Reset to first page when filtering/searching
    if (searchTerm || statusFilter !== 'all') {
        clientsCurrentPage = 1;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredClients.length / clientsRecordsPerPage);
    const startIndex = (clientsCurrentPage - 1) * clientsRecordsPerPage;
    const endIndex = startIndex + clientsRecordsPerPage;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    if (filteredClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px; color: var(--text-light);">No clients found</td></tr>';
        renderPagination('clients-pagination', clientsCurrentPage, totalPages, (page) => {
            clientsCurrentPage = page;
            renderClientsTable();
        }, 0);
        return;
    }

    paginatedClients.forEach((client, index) => {
        const row = document.createElement('tr');
        const statusClass = client.isActive === false ? 'suspended' : (client.licenseActive ? 'active' : 'pending');
        const statusText = client.isActive === false ? 'Suspended' : (client.licenseActive ? 'Active' : 'Pending');

        // License code display logic
        const licenseCode = client.serialNumber || 'N/A';
        const licenseCodeId = `license-code-${client.id || index}`;
        const licenseToggleId = `license-toggle-${client.id || index}`;
        const displayCode = licenseCode === 'N/A' ? 'N/A' : (licenseCode.length > 4 ? licenseCode.substring(0, 4) + '••••' : licenseCode);
        const fullCode = licenseCode;
        const hasToggle = licenseCode !== 'N/A' && licenseCode.length > 4;

        row.innerHTML = `
            <td><strong>${client.clientCode || 'N/A'}</strong></td>
            <td>${client.name || 'N/A'}</td>
            <td>${client.email || 'N/A'}</td>
            <td>${client.constituency || 'N/A'}</td>
            <td>${client.island || 'N/A'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span id="${licenseCodeId}" style="font-family: monospace;">${displayCode}</span>
                    ${hasToggle ? `
                        <button id="${licenseToggleId}" 
                                class="btn-icon" 
                                style="padding: 4px 8px; min-width: auto; font-size: 12px;" 
                                data-full-code="${fullCode.replace(/"/g, '&quot;')}" 
                                data-masked-code="${displayCode.replace(/"/g, '&quot;')}"
                                onclick="toggleLicenseCode('${licenseCodeId}', '${licenseToggleId}')">
                            <span data-icon="eye"></span>
                        </button>
                    ` : ''}
                </div>
            </td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${client.createdAt ? new Date(client.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
            <td>${client.lastActive ? new Date(client.lastActive.toDate()).toLocaleDateString() : 'Never'}</td>
            <td>
                <div class="action-buttons">
                    ${client.isActive === false 
                        ? `<button class="btn-icon btn-activate" onclick="activateClient('${client.email}')">Activate</button>`
                        : `<button class="btn-icon btn-suspend" onclick="suspendClient('${client.email}')">Suspend</button>`
                    }
                    <button class="btn-icon btn-view" onclick="viewClientLink('${client.clientCode}')">View Link</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Render pagination
    renderPagination('clients-pagination', clientsCurrentPage, totalPages, (page) => {
        clientsCurrentPage = page;
        renderClientsTable();
    }, filteredClients.length);

    // Initialize icons for newly rendered elements
    if (typeof initializeIcons === 'function') {
        initializeIcons();
    }
}

// Toggle License Code Visibility
function toggleLicenseCode(codeElementId, toggleButtonId) {
    const codeElement = document.getElementById(codeElementId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!codeElement || !toggleButton) return;

    const fullCode = toggleButton.getAttribute('data-full-code');
    const maskedCode = toggleButton.getAttribute('data-masked-code');
    const isCurrentlyMasked = codeElement.textContent.includes('••••');

    if (isCurrentlyMasked) {
        // Show full code
        codeElement.textContent = fullCode;
        toggleButton.innerHTML = '<span data-icon="eye-off"></span>';
        toggleButton.setAttribute('title', 'Hide full code');
        // Re-initialize icon
        if (typeof initializeIcons === 'function') {
            initializeIcons();
        } else if (typeof icons !== 'undefined') {
            const iconSpan = toggleButton.querySelector('[data-icon]');
            if (iconSpan && icons['eye-off']) {
                iconSpan.innerHTML = icons['eye-off'];
            }
        }
    } else {
        // Show masked code
        codeElement.textContent = maskedCode;
        toggleButton.innerHTML = '<span data-icon="eye"></span>';
        toggleButton.setAttribute('title', 'Show full code');
        // Re-initialize icon
        if (typeof initializeIcons === 'function') {
            initializeIcons();
        } else if (typeof icons !== 'undefined') {
            const iconSpan = toggleButton.querySelector('[data-icon]');
            if (iconSpan && icons['eye']) {
                iconSpan.innerHTML = icons['eye'];
            }
        }
    }
}

// Expose toggleLicenseCode to global scope for inline onclick handlers
window.toggleLicenseCode = toggleLicenseCode;

// Update Stats
function updateStats() {
    const totalClients = clientsData.length;
    const activeLicenses = clientsData.filter(c => c.licenseActive && c.isActive !== false).length;
    const suspended = clientsData.filter(c => c.isActive === false).length;
    const currentSessions = sessionsData.length;

    document.getElementById('total-clients').textContent = totalClients;
    document.getElementById('active-licenses').textContent = activeLicenses;
    document.getElementById('suspended-clients').textContent = suspended;
    document.getElementById('current-sessions').textContent = currentSessions;
}

// Register New Client
async function registerNewClient() {
    console.log('[registerNewClient] Starting client registration...');
    showLoading(true);

    // Check if we have admin password stored (needed to restore session after creating client user)
    // First, try to load from storage if not in memory
    if (!adminPasswordStored) {
        try {
            // Try localStorage first (more persistent)
            let storedPassword = localStorage.getItem('adminPasswordTemp');
            if (!storedPassword) {
                // Fallback to sessionStorage
                storedPassword = sessionStorage.getItem('adminPasswordTemp');
            }
            if (storedPassword) {
                adminPasswordStored = storedPassword;
                console.log('[registerNewClient] Admin password loaded from storage');
            }
        } catch (storageError) {
            console.warn('[registerNewClient] Could not read password from storage:', storageError);
        }
    }

    // If still not found, check if admin is already authenticated
    // If admin is authenticated, we can proceed without stored password
    // (the session will remain after client creation)
    if (!adminPasswordStored) {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email === ADMIN_EMAIL) {
            console.log('[registerNewClient] Admin is already authenticated. Password not required for session restoration.');
            // Continue without password - admin session should persist
        } else {
            showLoading(false);
            const errorMessage = 'Admin password not stored. This is needed to restore your session after creating a client.\n\n' +
                'Please logout and login again to store your password, then try registering the client.\n\n' +
                'Steps:\n' +
                '1. Click "Logout" button\n' +
                '2. Login again with your admin credentials\n' +
                '3. Try registering the client again';

            showError(errorMessage, 'client-register-error');

            // Also show in dialog for better visibility
            if (window.showErrorDialog) {
                setTimeout(() => {
                    window.showErrorDialog(
                        'Admin password not stored. Please logout and login again, then try registering the client.',
                        'Password Not Available'
                    );
                }, 300);
            }
            return;
        }
    }

    // Verify we have admin session
    const adminEmailBeforeRegistration = currentAdmin ? currentAdmin.email : null;
    if (!adminEmailBeforeRegistration || adminEmailBeforeRegistration !== ADMIN_EMAIL) {
        showLoading(false);
        showError('Admin session not found. Please login again.', 'client-register-error');
        return;
    }

    // Set flag to prevent auth state handler from logging out during registration
    isRegisteringClient = true;
    console.log('[registerNewClient] Registration flag set. Admin session will be restored after client creation.');

    // Create timeout promise to prevent indefinite hanging
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Registration timeout: Operation took too long (30 seconds). Please check your internet connection and try again.'));
        }, 30000); // 30 second timeout
    });

    try {
        // Validate prerequisites
        console.log('[registerNewClient] Validating prerequisites...');
        if (!db) {
            throw new Error('Firestore database not initialized. Please refresh the page.');
        }
        if (!auth) {
            throw new Error('Firebase Auth not initialized. Please refresh the page.');
        }
        if (!currentAdmin || !currentAdmin.email) {
            throw new Error('Admin session not found. Please login again.');
        }
        console.log('[registerNewClient] Prerequisites validated ✓');

        // Get form values
        console.log('[registerNewClient] Reading form values...');
        const nameInput = document.getElementById('client-name');
        const emailInput = document.getElementById('client-email-register');
        const clientCodeInput = document.getElementById('client-code-register');
        const tempPasswordInput = document.getElementById('client-temp-password');
        const constituencyInput = document.getElementById('client-constituency-register');
        const islandInput = document.getElementById('client-island-register');

        if (!nameInput || !emailInput || !clientCodeInput || !tempPasswordInput || !constituencyInput || !islandInput) {
            throw new Error('Form fields not found. Please refresh the page.');
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const clientCode = clientCodeInput.value.trim();
        const tempPassword = tempPasswordInput.value.trim();
        const constituency = constituencyInput.value.trim();
        const island = islandInput.value.trim();

        console.log('[registerNewClient] Form values:', {
            name,
            email,
            clientCode,
            passwordSet: !!tempPassword
        });

        // Validate client code
        if (!clientCode || clientCode.length !== 4 || !/^\d{4}$/.test(clientCode)) {
            showError('Client code must be exactly 4 digits', 'client-register-error');
            return;
        }

        // Validate temporary password
        if (!tempPassword) {
            showError('Please generate a temporary password', 'client-register-error');
            return;
        }

        // Validate email
        if (!email || !email.includes('@')) {
            showError('Please enter a valid email address', 'client-register-error');
            return;
        }

        // Validate name
        if (!name) {
            showError('Please enter a client name', 'client-register-error');
            return;
        }

        // Validate constituency
        if (!constituency) {
            showError('Please select a constituency', 'client-register-error');
            return;
        }

        // Validate island
        if (!island) {
            showError('Please select an island', 'client-register-error');
            return;
        }

        // Validate island belongs to selected constituency
        const constituencyIslands = getIslandsForConstituency(constituency);
        if (!constituencyIslands.includes(island)) {
            showError(`Selected island "${island}" does not belong to constituency "${constituency}". Please select a valid island.`, 'client-register-error');
            return;
        }

        console.log('[registerNewClient] Form validation passed ✓');

        // Wrap main registration logic in Promise.race with timeout
        const registrationPromise = (async () => {
            try {
                // Step 1: Check if email already exists (using direct document access - much faster)
                console.log('[registerNewClient] Step 1: Checking if email already exists...');
                try {
                    const existingClientDoc = await getDoc(doc(db, 'clients', email));
                    if (existingClientDoc.exists()) {
                        throw new Error('Email already registered in the system. Please use a different email.');
                    }
                    console.log('[registerNewClient] Step 1: Email available ✓');
                } catch (checkError) {
                    if (checkError.message.includes('already registered')) {
                        throw checkError;
                    }
                    // Re-throw other errors
                    throw checkError;
                }

                // Step 2: Check if client code already exists (with timeout and error handling)
                console.log('[registerNewClient] Step 2: Checking if client code exists...');
                try {
                    // Use a shorter timeout for this query
                    const codeQuery = query(collection(db, 'clients'), where('clientCode', '==', clientCode));
                    const queryPromise = getDocs(codeQuery);
                    const queryTimeout = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('QUERY_TIMEOUT')), 8000); // 8 second timeout
                    });

                    const codeSnapshot = await Promise.race([queryPromise, queryTimeout]);

                    if (!codeSnapshot.empty) {
                        throw new Error('Client code already exists. Please use a different code.');
                    }
                    console.log('[registerNewClient] Step 2: Client code available ✓');
                } catch (queryError) {
                    if (queryError.message === 'QUERY_TIMEOUT' || queryError.code === 'deadline-exceeded') {
                        console.warn('[registerNewClient] Step 2: Client code query timed out or needs index.');
                        console.warn('[registerNewClient] This may require a Firestore index. Continuing registration...');
                        console.warn('[registerNewClient] If client code is duplicate, it will be caught during document creation.');
                        // Continue - Firestore will prevent duplicate document IDs anyway
                    } else if (queryError.code === 'failed-precondition') {
                        console.warn('[registerNewClient] Step 2: Firestore index required for client code query.');
                        console.warn('[registerNewClient] Create the index when prompted in Firebase Console, or continue without duplicate check.');
                        // Continue - we'll rely on Firestore constraints
                    } else if (queryError.message.includes('already exists')) {
                        throw queryError;
                    } else {
                        console.warn('[registerNewClient] Step 2: Error checking client code:', queryError);
                        // Continue anyway - duplicate checks aren't critical since we use unique email as doc ID
                    }
                }

                // Step 3: Create Firebase Auth user
                console.log('[registerNewClient] Step 3: Creating Firebase Auth user...');
                console.log('[registerNewClient] Note: This will temporarily change auth state. Flag set to prevent logout.');
                let authUser = null;
                try {
                    // Creating a user will automatically sign in as that user
                    // The flag isRegisteringClient prevents the auth state handler from logging out
                    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
                    authUser = userCredential.user;
                    console.log('[registerNewClient] Step 3: Firebase Auth user created ✓', {
                        uid: authUser.uid,
                        email: authUser.email
                    });
                    console.log('[registerNewClient] Current auth user is now client, but logout is prevented by flag');
                } catch (authError) {
                    console.error('[registerNewClient] Step 3: Auth error:', authError);
                    if (authError.code === 'auth/email-already-in-use') {
                        throw new Error(
                            `This email is already registered in Firebase Authentication.\n\n` +
                            `To fix this:\n` +
                            `1. Check Firebase Console → Authentication → Users for this email\n` +
                            `2. Delete the user from Authentication if they weren't properly registered\n` +
                            `3. Or use a different email address\n\n` +
                            `Email: ${email}`
                        );
                    }
                    throw authError;
                }

                // Immediately sign out the client user and restore admin session
                console.log('[registerNewClient] Signing out client user and restoring admin session...');
                try {
                    await signOut(auth);
                    console.log('[registerNewClient] Client user signed out ✓');

                    // Restore admin session if we have password stored
                    // Also check if admin is already authenticated (shouldn't happen, but just in case)
                    const currentAuthUser = auth.currentUser;
                    if (currentAuthUser && currentAuthUser.email === ADMIN_EMAIL) {
                        console.log('[registerNewClient] Admin is already authenticated, no need to restore session');
                        currentAdmin = currentAuthUser;
                    } else if (adminPasswordStored && adminEmailBeforeRegistration === ADMIN_EMAIL) {
                        console.log('[registerNewClient] Restoring admin session...');
                        try {
                            const adminCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, adminPasswordStored);
                            currentAdmin = adminCredential.user;
                            console.log('[registerNewClient] Admin session restored ✓', {
                                email: currentAdmin.email,
                                uid: currentAdmin.uid
                            });

                            // Wait for auth state to fully propagate and token to refresh
                            console.log('[registerNewClient] Waiting for auth token to refresh...');
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Increased wait time

                            // Verify we're actually logged in as admin
                            const currentAuthUser = auth.currentUser;
                            if (!currentAuthUser || currentAuthUser.email !== ADMIN_EMAIL) {
                                throw new Error('Admin session not properly restored. Please try again.');
                            }

                            // Get fresh auth token to ensure Firestore recognizes admin
                            try {
                                const idToken = await currentAuthUser.getIdToken(true); // Force refresh
                                console.log('[registerNewClient] Admin auth token refreshed ✓');
                            } catch (tokenError) {
                                console.warn('[registerNewClient] Token refresh warning:', tokenError);
                                // Continue anyway - token might still work
                            }

                            // Double-check auth state after token refresh
                            const finalAuthCheck = auth.currentUser;
                            if (!finalAuthCheck || finalAuthCheck.email !== ADMIN_EMAIL) {
                                throw new Error('Admin session verification failed after token refresh.');
                            }
                            console.log('[registerNewClient] Admin session fully verified ✓');
                        } catch (restoreError) {
                            console.error('[registerNewClient] Error restoring admin session:', restoreError);
                            throw new Error(
                                'Failed to restore admin session after creating client.\n\n' +
                                'The client user was created but admin session could not be restored.\n' +
                                'You may need to login again manually.'
                            );
                        }
                    } else {
                        // This shouldn't happen if we checked earlier, but handle it anyway
                        console.error('[registerNewClient] Cannot restore admin session - password not available');
                        console.error('[registerNewClient] This is unexpected - password should have been checked earlier');
                        throw new Error(
                            'Admin password not available. Cannot restore admin session.\n\n' +
                            'Please logout and login again to store your password, then try again.'
                        );
                    }
                } catch (signOutError) {
                    console.error('[registerNewClient] Error in sign out/restore process:', signOutError);
                    throw signOutError;
                }

                // Step 4: Verify admin session before proceeding with Firestore writes
                console.log('[registerNewClient] Step 4: Verifying admin session before Firestore writes...');
                const currentAuthUser = auth.currentUser;
                if (!currentAuthUser || currentAuthUser.email !== ADMIN_EMAIL) {
                    throw new Error(
                        'Admin session verification failed. Cannot proceed with client registration.\n\n' +
                        'Current user: ' + (currentAuthUser ? currentAuthUser.email : 'none') + '\n' +
                        'Expected: ' + ADMIN_EMAIL
                    );
                }
                console.log('[registerNewClient] Step 4: Admin session verified ✓');

                // Step 5: Create client document in Firestore
                console.log('[registerNewClient] Step 5: Creating client document in Firestore...');
                const clientData = {
                    name,
                    email,
                    clientCode,
                    constituency,
                    island,
                    tempPassword,
                    createdAt: serverTimestamp(),
                    isActive: true,
                    licenseActive: false,
                    serialNumber: null,
                    createdBy: ADMIN_EMAIL // Use ADMIN_EMAIL directly instead of currentAdmin.email
                };

                try {
                    await setDoc(doc(db, 'clients', email), clientData);
                    console.log('[registerNewClient] Step 5: Client document created ✓');
                } catch (firestoreError) {
                    console.error('[registerNewClient] Step 5: Firestore error creating client:', firestoreError);
                    // Note: Cannot delete auth user from client-side, admin needs to do it manually in Firebase Console
                    if (authUser) {
                        console.warn('[registerNewClient] Auth user created but client document failed. Auth user UID:', authUser.uid);
                        console.warn('[registerNewClient] Manual cleanup required: Delete auth user from Firebase Console if needed.');
                    }
                    if (firestoreError.code === 'permission-denied') {
                        // Get current auth state for debugging
                        const currentAuth = auth.currentUser;
                        const authEmail = currentAuth ? currentAuth.email : 'none';
                        const authUid = currentAuth ? currentAuth.uid : 'none';

                        console.error('[registerNewClient] Permission denied details:', {
                            currentAuthEmail: authEmail,
                            expectedEmail: ADMIN_EMAIL,
                            currentAuthUid: authUid,
                            isRegisteringClient: isRegisteringClient
                        });

                        throw new Error(
                            'Permission denied: Cannot write to Firestore.\n\n' +
                            'Debug info:\n' +
                            '- Current auth email: ' + authEmail + '\n' +
                            '- Expected admin email: ' + ADMIN_EMAIL + '\n' +
                            '- Auth status: ' + (currentAuth ? 'logged in' : 'not logged in') + '\n\n' +
                            'Possible causes:\n' +
                            '1. Admin session was not properly restored\n' +
                            '2. Firebase security rules not updated in Firebase Console\n' +
                            '3. Firestore rules need to be republished\n\n' +
                            'Please check:\n' +
                            '1. Go to Firebase Console → Firestore Database → Rules\n' +
                            '2. Copy rules from firestore.rules file and publish\n' +
                            '3. Wait 1-2 minutes for rules to propagate\n' +
                            '4. Try again'
                        );
                    }
                    throw firestoreError;
                }

                // Step 7: Create user document for client login
                console.log('[registerNewClient] Step 7: Creating user document in Firestore...');
                try {
                    await setDoc(doc(db, 'users', email), {
                        email,
                        passwordChanged: false,
                        clientCode,
                        isActive: true
                    });
                    console.log('[registerNewClient] Step 7: User document created ✓');
                } catch (firestoreError) {
                    console.error('[registerNewClient] Step 7: Firestore error creating user:', firestoreError);
                    // Clean up: delete client document
                    try {
                        await deleteDoc(doc(db, 'clients', email));
                        console.log('[registerNewClient] Cleaned up client document');
                    } catch (cleanupError) {
                        console.error('[registerNewClient] Error cleaning up client document:', cleanupError);
                    }
                    // Note: Cannot delete auth user from client-side, admin needs to do it manually in Firebase Console
                    if (authUser) {
                        console.warn('[registerNewClient] Manual cleanup required: Delete auth user (UID: ' + authUser.uid + ') from Firebase Console if needed.');
                    }
                    if (firestoreError.code === 'permission-denied') {
                        throw new Error(
                            'Permission denied: Cannot write to Firestore.\n\n' +
                            'Please check:\n' +
                            '1. Firebase security rules allow admin writes to /users collection\n' +
                            '2. You are logged in as admin\n' +
                            '3. Firestore is properly initialized'
                        );
                    }
                    throw firestoreError;
                }

                console.log('[registerNewClient] All steps completed successfully ✓');

                // Step 6: Sign out the client user (we created them but shouldn't be logged in as them)
                console.log('[registerNewClient] Step 6: Signing out client user to restore admin session...');
                try {
                    // Check if we're currently signed in as the client
                    const currentAuthUser = auth.currentUser;
                    if (currentAuthUser && currentAuthUser.email === email) {
                        await signOut(auth);
                        console.log('[registerNewClient] Step 6: Client user signed out ✓');
                        // Auth state will change to null, but our flag prevents showing login screen
                    } else {
                        console.log('[registerNewClient] Step 6: Not signed in as client, skipping sign out');
                    }
                } catch (signOutError) {
                    console.error('[registerNewClient] Step 6: Error signing out client user:', signOutError);
                    // Continue anyway - admin session will need manual restoration if needed
                }

                // Step 7: Log action (non-blocking)
                logAdminAction('client_registered', `Registered client: ${name} (${email})`, {
                    clientCode,
                    email
                }).catch(err => console.error('[registerNewClient] Error logging action:', err));

                // Clear the registration flag and stored password - auth state handler can now function normally
                isRegisteringClient = false;
                // Note: We keep the password stored in case admin wants to register another client
                // Password will be cleared only on logout
                console.log('[registerNewClient] Registration flag cleared ✓');

                // Success: Hide loading, reset form, close modal, show success message
                showLoading(false);

                console.log('[registerNewClient] Client registered successfully:', {
                    name,
                    email,
                    clientCode
                });

                // Reset form
                document.getElementById('register-client-form').reset();

                // Close modal
                const modal = document.getElementById('add-client-modal');
                if (modal) {
                    modal.classList.remove('active');
                }

                // Prepare success message
                const successMessage = `Client "${name}" has been registered successfully!\n\nEmail: ${email}\nClient Code: ${clientCode}\n\nA temporary password has been generated.`;

                // Wait for modal to close, then show success message
                setTimeout(() => {
                    console.log('[registerNewClient] Showing success message...');
                    let successShown = false;

                    if (typeof window.showSuccess === 'function') {
                        try {
                            window.showSuccess(successMessage, 'Client Registered Successfully');
                            successShown = true;
                        } catch (err) {
                            console.error('[registerNewClient] Error calling window.showSuccess:', err);
                        }
                    }

                    if (!successShown && typeof window.showDialog === 'function') {
                        try {
                            window.showDialog({
                                type: 'success',
                                title: 'Client Registered Successfully',
                                message: successMessage
                            });
                            successShown = true;
                        } catch (err) {
                            console.error('[registerNewClient] Error calling window.showDialog:', err);
                        }
                    }

                    if (!successShown) {
                        console.warn('[registerNewClient] Dialog functions not available, using alert fallback');
                        alert(`SUCCESS!\n\n${successMessage}`);
                    }

                    // Reload clients list (non-blocking)
                    setTimeout(() => {
                        loadClients().catch(loadError => {
                            console.error('[registerNewClient] Error reloading clients list:', loadError);
                        });
                    }, 1000);
                }, 600);

            } catch (error) {
                console.error('[registerNewClient] Registration error:', error);
                throw error;
            }
        })();

        // Race registration against timeout
        await Promise.race([registrationPromise, timeoutPromise]);

    } catch (error) {
        console.error('[registerNewClient] Fatal error:', error);

        // Always clear the registration flag on error (keep password for retry)
        isRegisteringClient = false;
        // Note: Keep password stored so admin can retry without logging out
        console.log('[registerNewClient] Registration flag cleared due to error ✓');

        showLoading(false);

        let errorMessage = 'Failed to register client. Please try again.';
        let errorTitle = 'Registration Error';

        // Handle specific error types
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = `This email address is already registered in Firebase Authentication.\n\n` +
                `Possible solutions:\n` +
                `1. Check Firebase Console → Authentication → Users to see if this email exists\n` +
                `2. If the user was partially created, delete it from Authentication and try again\n` +
                `3. Use a different email address\n\n` +
                `Email: ${email}`;
            errorTitle = 'Email Already Registered';
        } else {
            // Use centralized error message function for all other errors
            errorMessage = getFirebaseErrorMessage(error);
            if (error.code === 'permission-denied') {
                errorTitle = 'Permission Denied';
            } else if (error.code && error.code.includes('auth/')) {
                errorTitle = 'Authentication Error';
            } else if (error.message && error.message.includes('timeout')) {
                errorTitle = 'Registration Timeout';
            }
        }

        // Show error using centralized function
        showError(error, 'client-register-error');
    } finally {
        // Always ensure loading is cleared and flag is reset
        console.log('[registerNewClient] Finally: Ensuring loading is cleared and flag is reset');
        isRegisteringClient = false;
        // Note: Keep password stored for future registrations (cleared on logout only)
        showLoading(false);
    }
}

// Generate License
async function generateLicense() {
    showLoading(true);
    const clientCode = document.getElementById('license-client-code').value;
    const email = document.getElementById('license-email').value;
    const serialNumber = document.getElementById('license-serial').value;
    const expiryDate = document.getElementById('license-expiry').value;

    if (clientCode.length !== 4 || !/^\d{4}$/.test(clientCode)) {
        const errorEl = document.getElementById('license-error');
        if (errorEl) {
            errorEl.textContent = 'Client code must be exactly 4 digits';
            errorEl.classList.add('show');
        }
        showLoading(false);
        return;
    }

    if (!serialNumber) {
        const errorEl = document.getElementById('license-error');
        if (errorEl) {
            errorEl.textContent = 'Please generate a serial number';
            errorEl.classList.add('show');
        }
        showLoading(false);
        return;
    }

    try {
        // Find client by code or email
        let clientDoc;
        const codeQuery = query(collection(db, 'clients'), where('clientCode', '==', clientCode));
        const codeSnapshot = await getDocs(codeQuery);

        if (!codeSnapshot.empty) {
            clientDoc = codeSnapshot.docs[0];
        } else {
            clientDoc = await getDoc(doc(db, 'clients', email));
        }

        if (!clientDoc.exists()) {
            const errorEl = document.getElementById('license-error');
            if (errorEl) {
                errorEl.textContent = 'Client not found. Please check the client code or email.';
                errorEl.classList.add('show');
            }
            showLoading(false);
            return;
        }

        const clientData = clientDoc.data();
        const clientEmail = clientDoc.id;

        // Update client with license
        await updateDoc(doc(db, 'clients', clientEmail), {
            serialNumber,
            licenseActive: true,
            licenseExpiry: expiryDate ? new Date(expiryDate) : null,
            licenseGeneratedAt: serverTimestamp(),
            licenseGeneratedBy: currentAdmin.email
        });

        // Update user document
        await updateDoc(doc(db, 'users', clientEmail), {
            serialNumber
        });

        // Log action
        await logAdminAction('license_generated', `Generated license for client: ${clientEmail}`, {
            clientCode,
            serialNumber
        });

        // Create client access link
        const accessLink = getClientAccessLink(clientCode);

        // Reset form
        document.getElementById('generate-license-form').reset();

        // Close modal
        const modal = document.getElementById('add-license-modal');
        if (modal) {
            modal.classList.remove('active');
        }

        // Show success message
        const successMessage = `License generated successfully!\n\nClient Access Link:\n${accessLink}\n\nCopy this link and share it with the client.`;

        if (window.showSuccess) {
            window.showSuccess(successMessage, 'License Generated');
        } else if (window.showAlert) {
            window.showAlert(successMessage, 'License Generated');
        } else {
            alert(`SUCCESS!\n\n${successMessage}`);
        }

        // Reload clients list
        await loadClients();
    } catch (error) {
        console.error('Error generating license:', error);
        const errorEl = document.getElementById('license-error');
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to generate license. Please try again.';
            errorEl.classList.add('show');
            setTimeout(() => {
                errorEl.classList.remove('show');
            }, 10000);
        }
        if (window.showErrorDialog) {
            window.showErrorDialog(error.message || 'Failed to generate license. Please try again.', 'License Generation Error');
        }
    } finally {
        showLoading(false);
    }
}

// Suspend Client
async function suspendClient(clientEmail) {
    // Use custom confirm dialog
    const confirmed = await new Promise((resolve) => {
        if (window.showDialog) {
            window.showDialog({
                type: 'confirm',
                title: 'Suspend Client',
                message: 'Are you sure you want to suspend this client?',
                confirmText: 'Yes, Suspend',
                cancelText: 'Cancel',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        } else {
            resolve(confirm('Are you sure you want to suspend this client?'));
        }
    });
    if (!confirmed) return;

    showLoading(true);
    try {
        await updateDoc(doc(db, 'clients', clientEmail), {
            isActive: false,
            suspendedAt: serverTimestamp(),
            suspendedBy: currentAdmin.email
        });

        await updateDoc(doc(db, 'users', clientEmail), {
            isActive: false
        });

        await logAdminAction('client_suspended', `Suspended client: ${clientEmail}`, {
            email: clientEmail
        });

        showSuccess('Client suspended successfully');
        await loadClients();
    } catch (error) {
        console.error('Error suspending client:', error);
        showError('Failed to suspend client. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Activate Client
async function activateClient(clientEmail) {
    showLoading(true);
    try {
        await updateDoc(doc(db, 'clients', clientEmail), {
            isActive: true,
            activatedAt: serverTimestamp(),
            activatedBy: currentAdmin.email
        });

        await updateDoc(doc(db, 'users', clientEmail), {
            isActive: true
        });

        await logAdminAction('client_activated', `Activated client: ${clientEmail}`, {
            email: clientEmail
        });

        showSuccess('Client activated successfully');
        await loadClients();
    } catch (error) {
        console.error('Error activating client:', error);
        showError('Failed to activate client. Please try again.');
    } finally {
        showLoading(false);
    }
}

// View Client Link
async function viewClientLink(clientCode) {
    const link = getClientAccessLink(clientCode);

    // Fetch client data to get temporary password
    let tempPassword = 'N/A';
    let clientEmail = null;

    try {
        const codeQuery = query(collection(db, 'clients'), where('clientCode', '==', clientCode));
        const snapshot = await getDocs(codeQuery);

        if (!snapshot.empty) {
            const clientData = snapshot.docs[0].data();
            tempPassword = clientData.tempPassword || 'Not available';
            clientEmail = clientData.email || snapshot.docs[0].id;
        }
    } catch (error) {
        console.error('Error fetching client data:', error);
    }

    // Use custom dialog to show link and temporary password with copy functionality
    if (window.showDialog) {
        window.showDialog({
            type: 'info',
            title: 'Client Access Information',
            message: `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Client Access Link -->
                    <div>
                        <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-light); font-weight: 500;">Share this link with your client:</p>
                        <div style="display: flex; align-items: center; gap: 8px; background: var(--light-color); padding: 12px 16px; border-radius: 8px; border: 2px solid var(--border-color);">
                            <input type="text" id="client-link-input" readonly value="${link}" style="flex: 1; border: none; background: transparent; font-size: 13px; font-family: 'Monaco', 'Courier New', monospace; color: var(--text-color); outline: none; cursor: text; user-select: all;" onclick="this.select();">
                            <button id="quick-copy-link-btn" style="padding: 8px 14px; background: var(--primary-color); color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap;" onmouseover="this.style.background='var(--primary-dark)'" onmouseout="this.style.background='var(--primary-color)'">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy
                            </button>
                        </div>
                    </div>
                    
                    <!-- Temporary Password -->
                    <div>
                        <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-light); font-weight: 500;">Temporary Password:</p>
                        <div style="display: flex; align-items: center; gap: 8px; background: var(--light-color); padding: 12px 16px; border-radius: 8px; border: 2px solid var(--border-color);">
                            <input type="password" id="client-password-input" readonly value="${tempPassword}" style="flex: 1; border: none; background: transparent; font-size: 13px; font-family: 'Monaco', 'Courier New', monospace; color: var(--text-color); outline: none; cursor: text; user-select: all; letter-spacing: 2px;" onclick="this.select();">
                            <button id="toggle-password-visibility" style="padding: 8px 12px; background: transparent; color: var(--text-light); border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='var(--border-light)'" onmouseout="this.style.background='transparent'">
                                <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg id="eye-off-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                            <button id="quick-copy-password-btn" style="padding: 8px 14px; background: var(--primary-color); color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap;" onmouseover="this.style.background='var(--primary-dark)'" onmouseout="this.style.background='var(--primary-color)'">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy
                            </button>
                        </div>
                        ${clientEmail ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: var(--text-light);">Email: <strong>${clientEmail}</strong></p>` : ''}
                    </div>
                </div>
            `,
            allowHTML: true,
            confirmText: 'Copy All',
            showCancel: true,
            cancelText: 'Close',
            onConfirm: () => {
                copyAllClientInfo(link, tempPassword, clientEmail);
            }
        });

        // Setup event listeners after dialog is shown
        setTimeout(() => {
            // Copy link button
            const quickCopyLinkBtn = document.getElementById('quick-copy-link-btn');
            if (quickCopyLinkBtn) {
                quickCopyLinkBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyClientLink(link);
                });
            }

            // Copy password button
            const quickCopyPasswordBtn = document.getElementById('quick-copy-password-btn');
            if (quickCopyPasswordBtn) {
                quickCopyPasswordBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyClientPassword(tempPassword);
                });
            }

            // Toggle password visibility
            const togglePasswordBtn = document.getElementById('toggle-password-visibility');
            const passwordInput = document.getElementById('client-password-input');
            const eyeIcon = document.getElementById('eye-icon');
            const eyeOffIcon = document.getElementById('eye-off-icon');

            if (togglePasswordBtn && passwordInput) {
                let isVisible = false;
                togglePasswordBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isVisible = !isVisible;

                    if (isVisible) {
                        passwordInput.type = 'text';
                        passwordInput.style.letterSpacing = '1px';
                        eyeIcon.style.display = 'none';
                        eyeOffIcon.style.display = 'inline-block';
                    } else {
                        passwordInput.type = 'password';
                        passwordInput.style.letterSpacing = '2px';
                        eyeIcon.style.display = 'inline-block';
                        eyeOffIcon.style.display = 'none';
                    }
                });
            }

            // Auto-select text when inputs are focused/clicked
            const linkInput = document.getElementById('client-link-input');
            if (linkInput) {
                linkInput.addEventListener('focus', function() {
                    this.select();
                });
                linkInput.addEventListener('click', function() {
                    this.select();
                });
            }

            if (passwordInput) {
                passwordInput.addEventListener('focus', function() {
                    this.select();
                });
                passwordInput.addEventListener('click', function() {
                    this.select();
                });
            }
        }, 100);
    } else if (window.showAlert) {
        window.showAlert(`Client Access Link:\n\n${link}\n\nTemporary Password: ${tempPassword}\n\nCopy this information and share it with the client.`, 'Client Access Information');
    } else {
        prompt('Client Access Information (Copy this):', `Link: ${link}\nPassword: ${tempPassword}`);
    }
}

// Helper function to copy client link
function copyClientLink(link) {
    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
        if (window.showSuccess) {
            window.showSuccess('Link copied to clipboard!', 'Copied');
        }
        // Update button text temporarily
        const quickCopyBtn = document.getElementById('quick-copy-link-btn');
        if (quickCopyBtn) {
            const originalText = quickCopyBtn.innerHTML;
            quickCopyBtn.innerHTML = '✓ Copied!';
            quickCopyBtn.style.background = 'var(--success-color)';
            setTimeout(() => {
                quickCopyBtn.innerHTML = originalText;
                quickCopyBtn.style.background = 'var(--primary-color)';
            }, 2000);
        }
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            if (window.showSuccess) {
                window.showSuccess('Link copied to clipboard!', 'Copied');
            }
            document.body.removeChild(textarea);
        } catch (err) {
            document.body.removeChild(textarea);
            if (window.showErrorDialog) {
                window.showErrorDialog('Failed to copy link. Please select and copy it manually.', 'Copy Failed');
            }
        }
    });
}

// Helper function to copy client password
function copyClientPassword(password) {
    if (!password || password === 'N/A' || password === 'Not available') {
        if (window.showErrorDialog) {
            window.showErrorDialog('Temporary password is not available for this client.', 'Password Not Available');
        }
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(password).then(() => {
        if (window.showSuccess) {
            window.showSuccess('Password copied to clipboard!', 'Copied');
        }
        // Update button text temporarily
        const quickCopyBtn = document.getElementById('quick-copy-password-btn');
        if (quickCopyBtn) {
            const originalText = quickCopyBtn.innerHTML;
            quickCopyBtn.innerHTML = '✓ Copied!';
            quickCopyBtn.style.background = 'var(--success-color)';
            setTimeout(() => {
                quickCopyBtn.innerHTML = originalText;
                quickCopyBtn.style.background = 'var(--primary-color)';
            }, 2000);
        }
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = password;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            if (window.showSuccess) {
                window.showSuccess('Password copied to clipboard!', 'Copied');
            }
            document.body.removeChild(textarea);
        } catch (err) {
            document.body.removeChild(textarea);
            if (window.showErrorDialog) {
                window.showErrorDialog('Failed to copy password. Please select and copy it manually.', 'Copy Failed');
            }
        }
    });
}

// Helper function to copy all client info (link and password)
function copyAllClientInfo(link, password, email) {
    if (!password || password === 'N/A' || password === 'Not available') {
        // Only copy link if password not available
        copyClientLink(link);
        return;
    }

    const info = `Client Access Link:\n${link}\n\nEmail: ${email || 'N/A'}\nTemporary Password: ${password}\n\nShare this information with your client.`;

    // Copy to clipboard
    navigator.clipboard.writeText(info).then(() => {
        if (window.showSuccess) {
            window.showSuccess('All information copied to clipboard!', 'Copied');
        }
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = info;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            if (window.showSuccess) {
                window.showSuccess('All information copied to clipboard!', 'Copied');
            }
            document.body.removeChild(textarea);
        } catch (err) {
            document.body.removeChild(textarea);
            if (window.showErrorDialog) {
                window.showErrorDialog('Failed to copy information. Please copy it manually.', 'Copy Failed');
            }
        }
    });
}

// Load Sessions
async function loadSessions() {
    showLoading(true);
    try {
        // Try query with both conditions first, fallback if index missing
        let snapshot;
        try {
            const sessionsQuery = query(
                collection(db, 'sessions'),
                where('isActive', '==', true),
                orderBy('lastActivity', 'desc')
            );
            snapshot = await getDocs(sessionsQuery);
        } catch (queryError) {
            // If composite index missing, query by isActive only and sort client-side
            if (queryError.code === 'failed-precondition' && queryError.message && queryError.message.includes('index')) {
                console.warn('Sessions composite index missing, using fallback query');
                const fallbackQuery = query(
                    collection(db, 'sessions'),
                    where('isActive', '==', true)
                );
                snapshot = await getDocs(fallbackQuery);

                // Sort by lastActivity in JavaScript
                const docs = snapshot.docs.sort((a, b) => {
                    const aData = a.data();
                    const bData = b.data();
                    // Handle both Timestamp objects and missing fields
                    const aTime = aData.lastActivity ? (aData.lastActivity.toMillis ? aData.lastActivity.toMillis() : (aData.lastActivity.seconds * 1000)) : 0;
                    const bTime = bData.lastActivity ? (bData.lastActivity.toMillis ? bData.lastActivity.toMillis() : (bData.lastActivity.seconds * 1000)) : 0;
                    return bTime - aTime; // Descending order
                });

                // Create a new snapshot-like object
                snapshot = {
                    docs: docs,
                    empty: docs.length === 0,
                    forEach: function(callback) {
                        docs.forEach(callback);
                    }
                };
            } else {
                throw queryError;
            }
        }

        sessionsData = [];
        sessionsCurrentPage = 1; // Reset to first page when sessions are reloaded

        snapshot.forEach(doc => {
            sessionsData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderSessionsTable();
        updateStats();
    } catch (error) {
        console.error('Error loading sessions:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        // Show more detailed error message
        let errorMsg = 'Failed to load sessions. ';
        if (error.code === 'permission-denied') {
            errorMsg += 'Permission denied. Please ensure you are logged in as admin (rixaski@gmail.com).';
            console.error('Admin check:', {
                currentUser: auth.currentUser.email,
                expectedAdmin: ADMIN_EMAIL,
                isAdmin: auth.currentUser.email === ADMIN_EMAIL
            });
        } else if (error.code === 'failed-precondition') {
            errorMsg += 'Index required. Check browser console for index creation link.';
            if (error.message && error.message.includes('index')) {
                const indexMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
                if (indexMatch) {
                    console.log('Index creation link:', indexMatch[0]);
                }
            }
        } else {
            errorMsg += `Error: ${error.message || 'Unknown error'}`;
        }
        showError(errorMsg);
    } finally {
        showLoading(false);
    }
}

// Render Sessions Table
// Pagination state for sessions table
let sessionsCurrentPage = 1;
const sessionsRecordsPerPage = 10;

function renderSessionsTable() {
    const tbody = document.getElementById('sessions-table-body');
    tbody.innerHTML = '';

    if (sessionsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">No active sessions</td></tr>';
        renderPagination('sessions-pagination', sessionsCurrentPage, 0, (page) => {
            sessionsCurrentPage = page;
            renderSessionsTable();
        }, 0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(sessionsData.length / sessionsRecordsPerPage);
    const startIndex = (sessionsCurrentPage - 1) * sessionsRecordsPerPage;
    const endIndex = startIndex + sessionsRecordsPerPage;
    const paginatedSessions = sessionsData.slice(startIndex, endIndex);

    paginatedSessions.forEach(session => {
        const row = document.createElement('tr');
        const location = session.location ?
            `${session.location.city || 'Unknown'}, ${session.location.country || 'Unknown'}` :
            'Unknown';

        row.innerHTML = `
            <td><strong>${session.clientCode || 'N/A'}</strong></td>
            <td>${session.email || 'N/A'}</td>
            <td>${session.ipAddress || 'Unknown'}</td>
            <td>${location}</td>
            <td>${session.userAgent || 'Unknown'}</td>
            <td>${session.loginTime ? new Date(session.loginTime.toDate()).toLocaleString() : 'N/A'}</td>
            <td>${session.lastActivity ? new Date(session.lastActivity.toDate()).toLocaleString() : 'N/A'}</td>
            <td>
                <button class="btn-icon btn-view" onclick="endSession('${session.id}')">End Session</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Render pagination
    renderPagination('sessions-pagination', sessionsCurrentPage, totalPages, (page) => {
        sessionsCurrentPage = page;
        renderSessionsTable();
    }, sessionsData.length);
}

// Track Session
async function trackSession(email, type = 'client', isLogin = false) {
    try {
        const location = await getUserLocation();
        const userAgent = navigator.userAgent;

        const sessionData = {
            email,
            type,
            ipAddress: location.ip,
            location: {
                city: location.city,
                region: location.region,
                country: location.country,
                countryCode: location.countryCode
            },
            userAgent,
            isActive: true,
            loginTime: isLogin ? serverTimestamp() : null,
            lastActivity: serverTimestamp()
        };

        // Get client code if it's a client session
        if (type === 'client') {
            const clientDoc = await getDoc(doc(db, 'clients', email));
            if (clientDoc.exists()) {
                sessionData.clientCode = clientDoc.data().clientCode;
            }
        }

        // Check if session exists
        const sessionsQuery = query(collection(db, 'sessions'), where('email', '==', email), where('isActive', '==', true));
        const snapshot = await getDocs(sessionsQuery);

        if (!snapshot.empty) {
            // Update existing session
            await updateDoc(snapshot.docs[0].ref, {
                ...sessionData,
                loginTime: snapshot.docs[0].data().loginTime || (isLogin ? serverTimestamp() : null)
            });
        } else {
            // Create new session
            await addDoc(collection(db, 'sessions'), sessionData);
        }
    } catch (error) {
        console.error('Error tracking session:', error);
    }
}

// End Session
async function endSession(sessionId) {
    // Use custom confirm dialog
    const confirmed = await new Promise((resolve) => {
        if (window.showDialog) {
            window.showDialog({
                type: 'confirm',
                title: 'End Session',
                message: 'Are you sure you want to end this session?',
                confirmText: 'Yes, End Session',
                cancelText: 'Cancel',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        } else {
            resolve(confirm('Are you sure you want to end this session?'));
        }
    });
    if (!confirmed) return;

    showLoading(true);
    try {
        await updateDoc(doc(db, 'sessions', sessionId), {
            isActive: false,
            endedAt: serverTimestamp()
        });

        await logAdminAction('session_ended', `Ended session: ${sessionId}`, {
            sessionId
        });

        showSuccess('Session ended successfully');
        await loadSessions();
    } catch (error) {
        console.error('Error ending session:', error);
        showError('Failed to end session. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Send Notification
async function sendNotification() {
    showLoading(true);
    const recipient = document.getElementById('notification-recipient').value;
    const clientCode = document.getElementById('notification-client-code').value;
    const title = document.getElementById('notification-title').value.trim();
    const message = document.getElementById('notification-message').value.trim();

    // Validate inputs
    if (!title || !message) {
        showError('Please provide both title and message');
        showLoading(false);
        return;
    }

    if (recipient === 'specific' && (!clientCode || clientCode.length !== 4)) {
        showError('Please enter a valid 4-digit client code');
        showLoading(false);
        return;
    }

    try {
        let targetUsers = [];

        if (recipient === 'all') {
            // Get all licensed users (users with serialNumber and campaignSet)
            const usersQuery = query(
                collection(db, 'users'),
                where('serialNumber', '!=', null)
            );
            const snapshot = await getDocs(usersQuery);

            snapshot.forEach(doc => {
                const userData = doc.data();
                // Only include users who have completed campaign setup
                if (userData.serialNumber && userData.campaignSet) {
                    targetUsers.push({
                        email: doc.id,
                        serialNumber: userData.serialNumber,
                        clientCode: userData.clientCode || null,
                        campaignName: userData.campaignName || null
                    });
                }
            });
        } else {
            // Find user by client code
            // First try to find in clients collection
            const clientsQuery = query(collection(db, 'clients'), where('clientCode', '==', clientCode));
            const clientsSnapshot = await getDocs(clientsQuery);

            if (!clientsSnapshot.empty) {
                const clientData = clientsSnapshot.docs[0].data();
                const clientEmail = clientsSnapshot.docs[0].id;

                // Check if user exists in users collection
                const userRef = doc(db, 'users', clientEmail);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists() && userDoc.data().serialNumber && userDoc.data().campaignSet) {
                    targetUsers.push({
                        email: clientEmail,
                        serialNumber: userDoc.data().serialNumber,
                        clientCode: clientCode,
                        campaignName: userDoc.data().campaignName || null
                    });
                } else {
                    // If user doesn't exist in users collection, use client data
                    targetUsers.push({
                        email: clientEmail,
                        serialNumber: clientData.serialNumber || null,
                        clientCode: clientCode,
                        campaignName: clientData.campaignName || null
                    });
                }
            } else {
                // If not found in clients, try to find by serialNumber in users
                const usersQuery = query(collection(db, 'users'), where('serialNumber', '==', clientCode));
                const usersSnapshot = await getDocs(usersQuery);

                if (!usersSnapshot.empty) {
                    const userData = usersSnapshot.docs[0].data();
                    if (userData.campaignSet) {
                        targetUsers.push({
                            email: usersSnapshot.docs[0].id,
                            serialNumber: userData.serialNumber,
                            clientCode: userData.clientCode || null,
                            campaignName: userData.campaignName || null
                        });
                    }
                }
            }
        }

        if (targetUsers.length === 0) {
            showError('No licensed users found to send notification to');
            showLoading(false);
            return;
        }

        // Create notifications
        const notificationPromises = [];
        for (const user of targetUsers) {
            const notificationData = {
                recipientEmail: user.email,
                recipientCode: user.clientCode || user.serialNumber || null,
                title,
                message,
                read: false,
                createdAt: serverTimestamp(),
                sentBy: currentAdmin.email,
                type: 'admin_notification'
            };

            notificationPromises.push(addDoc(collection(db, 'notifications'), notificationData));
        }

        // Wait for all notifications to be created
        await Promise.all(notificationPromises);

        await logAdminAction('notification_sent', `Sent notification to ${targetUsers.length} user(s)`, {
            recipient,
            count: targetUsers.length,
            title: title.substring(0, 50) // Log first 50 chars of title
        });

        showSuccess(`Notification sent to ${targetUsers.length} user(s) successfully!`);
        document.getElementById('send-notification-form').reset();
    } catch (error) {
        console.error('Error sending notification:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        let errorMessage = 'Failed to send notification. Please try again.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. Please check Firestore rules for notifications collection.';
        } else if (error.message) {
            errorMessage = `Failed to send notification: ${error.message}`;
        }

        showError(errorMessage);
    } finally {
        showLoading(false);
    }
}

// Load Records
async function loadRecords() {
    showLoading(true);
    try {
        const recordsQuery = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(recordsQuery);
        const records = [];

        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });

        recordsCurrentPage = 1; // Reset to first page when records are loaded
        renderRecordsTable(records);
    } catch (error) {
        console.error('Error loading records:', error);
        showError('Failed to load records. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Render Records Table
// Pagination state for records table
let recordsCurrentPage = 1;
const recordsRecordsPerPage = 10;

function renderRecordsTable(records) {
    const tbody = document.getElementById('records-table-body');
    tbody.innerHTML = '';

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">No records found</td></tr>';
        renderPagination('records-pagination', recordsCurrentPage, 0, (page) => {
            recordsCurrentPage = page;
            renderRecordsTable(records);
        }, 0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(records.length / recordsRecordsPerPage);
    const startIndex = (recordsCurrentPage - 1) * recordsRecordsPerPage;
    const endIndex = startIndex + recordsRecordsPerPage;
    const paginatedRecords = records.slice(startIndex, endIndex);

    paginatedRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.timestamp ? new Date(record.timestamp.toDate()).toLocaleString() : 'N/A'}</td>
            <td>${(record.details && record.details.clientCode) || 'N/A'}</td>
            <td>${record.action || 'N/A'}</td>
            <td>${record.description || 'N/A'}</td>
            <td>${record.adminEmail || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });

    // Render pagination
    renderPagination('records-pagination', recordsCurrentPage, totalPages, (page) => {
        recordsCurrentPage = page;
        renderRecordsTable(records);
    }, records.length);
}

// Log Admin Action
async function logAdminAction(action, description, details = {}) {
    try {
        await addDoc(collection(db, 'adminLogs'), {
            action,
            description,
            details,
            adminEmail: currentAdmin.email,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging admin action:', error);
    }
}

// Initialize Icons
function initializeIcons() {
    if (typeof icons === 'undefined') return;
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        if (icons[iconName]) {
            el.innerHTML = icons[iconName];
        }
    });
}

// Pagination Renderer Function
function renderPagination(containerId, currentPage, totalPages, onPageChange, totalRecords = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'admin-pagination-btn';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    });
    container.appendChild(prevBtn);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'admin-pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => onPageChange(1));
        container.appendChild(firstBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            ellipsis.style.color = 'var(--text-light)';
            container.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'admin-pagination-btn';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => onPageChange(i));
        container.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            ellipsis.style.color = 'var(--text-light)';
            container.appendChild(ellipsis);
        }

        const lastBtn = document.createElement('button');
        lastBtn.className = 'admin-pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => onPageChange(totalPages));
        container.appendChild(lastBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'admin-pagination-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    });
    container.appendChild(nextBtn);

    // Page info
    const info = document.createElement('span');
    info.className = 'admin-pagination-info';
    if (totalPages > 0) {
        const recordsPerPage = 10;
        const startRecord = (currentPage - 1) * recordsPerPage + 1;
        const endRecord = Math.min(currentPage * recordsPerPage, totalRecords || (totalPages * recordsPerPage));
        const total = totalRecords || (totalPages * recordsPerPage);
        info.textContent = `Showing ${startRecord}-${endRecord} of ${total}`;
    } else {
        info.textContent = 'No records';
    }
    container.appendChild(info);
}

// Make functions globally available
window.suspendClient = suspendClient;
window.activateClient = activateClient;
window.viewClientLink = viewClientLink;
window.endSession = endSession;

// Search and Filter Listeners
// Populate Constituency and Island Dropdowns
function populateConstituencyDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const constituencies = getAllConstituencies();
    constituencies.forEach(constituency => {
        const option = document.createElement('option');
        option.value = constituency;
        option.textContent = constituency;
        select.appendChild(option);
    });
}

function populateIslandDropdown(selectId, constituency = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options except the first one
    const firstOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (firstOption) {
        select.appendChild(firstOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = constituency ? 'Select Island' : 'All Islands';
        select.appendChild(defaultOption);
    }

    let islands = [];
    if (constituency) {
        islands = getIslandsForConstituency(constituency);
    } else {
        // Get all unique islands
        const allIslands = new Set();
        Object.values(constituencyIslandMapping).forEach(islandList => {
            islandList.forEach(island => allIslands.add(island));
        });
        islands = Array.from(allIslands).sort();
    }

    islands.forEach(island => {
        const option = document.createElement('option');
        option.value = island;
        option.textContent = island;
        select.appendChild(option);
    });
}

// Initialize Filters
function initializeFilters() {
    // Populate client registration form dropdowns
    populateConstituencyDropdown('client-constituency-register');
    populateIslandDropdown('client-island-register');

    // Handle constituency change in registration form
    const constituencySelect = document.getElementById('client-constituency-register');
    if (constituencySelect) {
        constituencySelect.addEventListener('change', (e) => {
            const constituency = e.target.value;
            populateIslandDropdown('client-island-register', constituency);
        });
    }
            const islandFilterEl = document.getElementById('global-island-filter');
            if (constituencyFilterEl) constituencyFilterEl.value = '';
            if (islandFilterEl) islandFilterEl.value = '';
            globalConstituencyFilter = '';
            globalIslandFilter = '';
            updateFilterVisibility();
            renderClientsTable();
        });
    }
}

function updateFilterVisibility() {
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
        if (globalConstituencyFilter || globalIslandFilter) {
            clearFiltersBtn.style.display = 'block';
        } else {
            clearFiltersBtn.style.display = 'none';
        }
    }
}

// Creative Location Display moved to app.js

document.addEventListener('DOMContentLoaded', () => {

    const clientSearch = document.getElementById('client-search');
    const statusFilter = document.getElementById('status-filter');

    if (clientSearch) {
        clientSearch.addEventListener('input', renderClientsTable);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', renderClientsTable);
    }

    // Initialize filters (admin panel)
    initializeFilters();
});

// Initialize on load
function startAdminPanel() {
    console.log('Starting admin panel initialization...');
    try {
        initAdmin();

        // Set admin offline when page is closed/unloaded
        window.addEventListener('beforeunload', async () => {
            try {
                await updateAdminPresence(false);
            } catch (error) {
                console.error('Error setting admin offline on page unload:', error);
            }
        });
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        const errorEl = document.getElementById('admin-login-error');
        if (errorEl) {
            errorEl.textContent = 'Error initializing admin panel. Please refresh the page. Error: ' + error.message;
            errorEl.classList.add('show');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAdminPanel);
} else {
    startAdminPanel();
}