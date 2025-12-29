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
    updatePassword,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    initializeFirestore,
    getFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Initialize Firebase (check if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set authentication persistence to LOCAL (persists across browser sessions)
// This ensures users stay logged in even after page refresh or browser restart
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Error setting auth persistence:', error);
});

// Initialize Firestore with persistent local cache
// Using the new FirestoreSettings.cache approach (replaces deprecated enableIndexedDbPersistence)
// This allows the app to read from local cache immediately while syncing with server
let db;
try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            // Support multiple tabs sharing the same cache
            tabManager: persistentMultipleTabManager()
        })
    });
    console.log('[Firestore] Initialized with persistent local cache ✓');
} catch (err) {
    console.warn('[Firestore] Error initializing with cache, trying without cache:', err);
    // Fallback: Initialize Firestore without persistent cache if it fails
    try {
        db = initializeFirestore(app);
        console.log('[Firestore] Initialized without persistent cache (fallback) ✓');
    } catch (fallbackErr) {
        console.warn('[Firestore] Error initializing without cache, using getFirestore:', fallbackErr);
        // Last resort: Use simple getFirestore (most reliable)
        try {
            db = getFirestore(app);
            console.log('[Firestore] Initialized using getFirestore (simple) ✓');
        } catch (simpleErr) {
            console.error('[Firestore] All initialization methods failed:', simpleErr);
            console.error('[Firestore] Error details:', {
                message: simpleErr.message,
                stack: simpleErr.stack,
                appInitialized: !!app,
                appName: app.name
            });
            // Set db to null - ensureDbInitialized will handle re-initialization
            db = null;
        }
    }
}

// Log initialization result
if (db) {
    console.log('[Firestore] Database instance created successfully');
} else {
    console.warn('[Firestore] Database instance is null - will attempt re-initialization when needed');
}

// Polyfill for requestIdleCallback (for browsers that don't support it)
if (!window.requestIdleCallback) {
    window.requestIdleCallback = function(callback, options) {
        const timeout = options && options.timeout ? options.timeout : 1000;
        const start = performance.now();
        return setTimeout(() => {
            callback({
                didTimeout: false,
                timeRemaining: () => Math.max(0, timeout - (performance.now() - start))
            });
        }, 1);
    };
}

if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function(id) {
        clearTimeout(id);
    };
}

const storage = getStorage(app);
window.storage = storage; // Make storage globally available

// Ensure Firestore Database is Initialized
// Firestore initialization is synchronous - this function just ensures db exists
async function ensureDbInitialized() {
    // Check if Firebase app is initialized
    if (!app) {
        console.error('[ensureDbInitialized] Firebase app is not initialized');
        const error = new Error(
            'Firebase application is not initialized. Please refresh the page.\n\n' +
            'If the problem persists, contact your administrator.'
        );
        throw error;
    }

    // If db is already initialized, return immediately
    if (db) {
        console.log('[ensureDbInitialized] Database already initialized ✓');
        return db;
    }

    console.log('[ensureDbInitialized] Database not initialized, attempting initialization...');
    console.log('[ensureDbInitialized] Firebase app state:', app ? 'initialized' : 'not initialized');

    // Try to initialize Firestore - these functions are synchronous and should not throw
    try {
        // Try simple initialization first (most reliable)
        db = getFirestore(app);
        if (db) {
            window.db = db;
            console.log('[ensureDbInitialized] Firestore initialized using getFirestore ✓');
            console.log('[ensureDbInitialized] Database instance:', typeof db, db);
            return db;
        } else {
            throw new Error('getFirestore returned null/undefined');
        }
    } catch (simpleInitError) {
        console.warn('[ensureDbInitialized] getFirestore failed:', simpleInitError);
        try {
            // Fallback: try basic initialization
            db = initializeFirestore(app);
            if (db) {
                window.db = db;
                console.log('[ensureDbInitialized] Firestore initialized (basic) ✓');
                console.log('[ensureDbInitialized] Database instance:', typeof db, db);
                return db;
            } else {
                throw new Error('initializeFirestore returned null/undefined');
            }
        } catch (basicError) {
            console.error('[ensureDbInitialized] All initialization methods failed:', basicError);
            console.error('[ensureDbInitialized] Error details:', {
                message: basicError.message,
                stack: basicError.stack,
                app: app ? 'exists' : 'missing',
                appName: app.name
            });

            const error = new Error(
                'Firestore database failed to initialize. This may be due to:\n\n' +
                '1. Network connectivity issues\n' +
                '2. Firebase configuration problems\n' +
                '3. Browser compatibility issues\n\n' +
                'Please refresh the page and try again. If the problem persists, contact your administrator.'
            );
            throw error;
        }
    }
}

// Export for messenger
export {
    db,
    auth
};

// Constituency-Island Mapping (Dhaaira structure) - Complete list from provided data
// Format: "CODE CONSTITUENCY NAME": [array of islands]
const constituencyIslandData = {
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

// Get all constituencies (all unique codes, no deduplication needed as each code is unique)
function getAllConstituencies() {
    const constituencies = Object.keys(constituencyIslandData);
    
    // Sort by code (alphanumeric)
    return constituencies.sort((a, b) => {
        const codeA = a.match(/^([A-Z0-9]+)/)?.[1] || '';
        const codeB = b.match(/^([A-Z0-9]+)/)?.[1] || '';
        if (codeA !== codeB) {
            // Compare codes alphabetically/numerically
            return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.localeCompare(b);
    });
}

// Get islands for a specific constituency
function getIslandsForConstituency(constituency) {
    if (!constituency) return [];
    return constituencyIslandData[constituency] || [];
}

// Get constituency for a specific island
function getConstituencyForIsland(island) {
    if (!island) return null;
    for (const [constituency, islands] of Object.entries(constituencyIslandData)) {
        if (islands.includes(island)) {
            return constituency;
        }
    }
    return null;
}

// Maldives Data (keeping for backward compatibility where needed)
const maldivesData = {
    atolls: [{
            name: "Haa Alifu",
            code: "HA"
        },
        {
            name: "Haa Dhaalu",
            code: "HDh"
        },
        {
            name: "Shaviyani",
            code: "Sh"
        },
        {
            name: "Noonu",
            code: "N"
        },
        {
            name: "Raa",
            code: "R"
        },
        {
            name: "Baa",
            code: "B"
        },
        {
            name: "Lhaviyani",
            code: "Lh"
        },
        {
            name: "Kaafu",
            code: "K"
        },
        {
            name: "Alifu Alifu",
            code: "AA"
        },
        {
            name: "Alifu Dhaalu",
            code: "ADh"
        },
        {
            name: "Vaavu",
            code: "V"
        },
        {
            name: "Meemu",
            code: "M"
        },
        {
            name: "Faafu",
            code: "F"
        },
        {
            name: "Dhaalu",
            code: "Dh"
        },
        {
            name: "Thaa",
            code: "Th"
        },
        {
            name: "Laamu",
            code: "L"
        },
        {
            name: "Gaafu Alifu",
            code: "GA"
        },
        {
            name: "Gaafu Dhaalu",
            code: "GDh"
        },
        {
            name: "Gnaviyani",
            code: "Gn"
        },
        {
            name: "Seenu",
            code: "S"
        },
        {
            name: "Malé",
            code: "MLE"
        }
    ],
    constituencies: [
        // A Atoll
        "A01 Hoarafushi Dhaaira",
        "A02 Ihavandhoo Dhaaira",
        "A03 Baarashu Dhaairaa",
        "A04 Dhidhoo Dhaaira",
        "A05 Kelaa Dhaaira",
        // B Atoll
        "B01 Hanimaadhoo Dhaaira",
        "B02 Nolhivaram Dhaaira",
        "B03 Vaikaradhoo Dhaaira",
        "B04 Kulhudhuffushi Uthuru Dhaaira",
        "B05 Kulhudhuffushi Dhekunu Dhaaira",
        "B06 Makunudhoo Dhaaira",
        // C Atoll
        "C01 Kanditheemu Dhaaira",
        "C02 Milandhoo Dhaaira",
        "C03 Komandoo Dhaaira",
        "C04 Funadhoo Dhaaira",
        // D Atoll
        "D01 Kendhikulhudhoo Dhaaira",
        "D02 Manadhoo Dhaaira",
        "D03 Velidhoo Dhaaira",
        "D04 Holhudhoo Dhaaira",
        // E Atoll
        "E01 Alifushi Dhaaira",
        "E02 Ungoofaaru Dhaaira",
        "E03 Dhuvaafaru Dhaairaa",
        "E04 Inguraidhoo Dhaaira",
        "E05 Maduvvari Dhaaira",
        // F Atoll
        "F01 Thulhaadhoo Dhaaira",
        "F02 Eydhafushi Dhaaira",
        "F03 Kendhoo Dhaaira",
        "F04 Hithaadhoo Dhaaira",
        // G Atoll
        "G01 Hinnavaru Dhaaira",
        "G02 Naifaru Dhaairaa",
        "G03 Kurendhoo Dhaaira",
        // H Atoll
        "H01 Kaashidhoo Dhaaira",
        "H02 Thulusdhoo Dhaaira",
        "H03 Maafushi Dhaaira",
        "H04 Huraa Dhaaira",
        // I Atoll
        "I01 Maamigili Dhaaira",
        "I02 Mahibadhoo Dhaaira",
        "I03 Dhangethi Dhaaira",
        // J Atoll
        "J01 Felidhoo Dhaaira",
        "J02 Keyodhoo Dhaaira",
        // K Atoll
        "K01 Dhiggaru Dhaaira",
        "K02 Mulaku Dhaaira",
        // L Atoll
        "L01 Bileydhoo Dhaaira",
        "L02 Nilandhoo Dhaaira",
        // M Atoll
        "M01 Meedhoo Dhaaira",
        "M02 Kudahuvadhoo Dhaaira",
        // N Atoll
        "N01 Vilufushi Dhaaira",
        "N02 Thimarafushi Dhaaira",
        "N03 Kinbidhoo Dhaaira",
        "N04 Guraidhoo Dhaairaa",
        // O Atoll
        "O01 Isdhoo Dhaaira",
        "O02 Gamu Dhaaira",
        "O03 Fonadhoo Dhaaira",
        "O04 Maavashu Dhaaira",
        // P Atoll
        "P01 Vilingili Dhaaira",
        "P02 Dhandhoo Dhaaira",
        "P03 Gemanafushi Dhaaira",
        "P04 Kolamaafushi Dhaaira",
        // Q Atoll
        "Q01 Thinadhoo Uthuru Dhaairaa",
        "Q02 Thinadhoo Dhekunu Dhaairaa",
        "Q03 Madaveli Dhaaira",
        "Q04 Faresmaathodaa Dhaaira",
        "Q05 Gadhdhoo Dhaaira",
        // R Atoll
        "R01 Fuvahmulaku Uthuru Dhaairaa",
        "R02 Fuvahmulaku Medhu Dhaaira",
        "R03 Fuvahmulaku Dhekunu Dhaairaa",
        // S Atoll (Addu City)
        "S01 Hulhudhoo Dhaairaa",
        "S02 Feydhoo Dhekunu Dhaairaa",
        "S03 Maradhoo Dhaaira",
        "S04 Hithadhoo Uthuru Dhaairaa",
        "S05 Hithadhoo Medhu Dhaaira",
        "S06 Hithadhoo Dhekunu Dhaaira",
        "S07 Addu Meedhoo Dhaaira",
        "S08 Feydhoo Uthuru Dhaairaa",
        // T Atoll (Malé City / Hulhumalé / Villimalé)
        "T01 Hulhumale Dhekunu Dhaaira",
        "T02 Medhu Henveyru Dhaaira",
        "T03 Henveyru Dhekunu Dhaaira",
        "T04 Henveyru Uthuru Dhaaira",
        "T05 Galolhu Uthuru Dhaaira",
        "T06 Galolhu Dhekunu Dhaaira",
        "T07 Mahchangoalhee Uthuru Dhaaira",
        "T08 Mahchangoalhee Dhekunu Dhaaira",
        "T09 Maafannu Uthuru Dhaaira",
        "T10 Maafannu Hulhangu Dhaaira",
        "T11 Maafannu Medhu Dhaaira",
        "T12 Maafannu Dhekunu Dhaaira",
        "T13 Villimale Dhaaira",
        "T14 Henveyru Hulhangu Dhaaira",
        "T15 Mahchangoalhee Medhu Dhaaira",
        "T16 Hulhumaale Medhu Dhaaira",
        "T17 Hulhumaale Uthuru Dhaaira",
        // U Atoll
        "U01 Mathiveri Dhaaira",
        "U02 Thoddoo Dhaaira"
    ],
    islands: {
        "Haa Alifu": ["Dhiddhoo", "Hoarafushi", "Ihavandhoo", "Kelaa", "Muraidhoo", "Thuraakunu"],
        "Haa Dhaalu": ["Kulhudhuffushi", "Kumundhoo", "Kunburudhoo", "Makunudhoo", "Naivaadhoo", "Neykurendhoo", "Nolhivaram", "Nolhivaranfaru"],
        "Shaviyani": ["Kanditheemu", "Komandoo", "Lhaimagu", "Maaungoodhoo", "Milandhoo", "Noomaraa"],
        "Noonu": ["Holhudhoo", "Kendhikolhudhoo", "Kudafaree", "Landhoo", "Lhohi", "Maafaru", "Maalhendhoo", "Magoodhoo", "Manadhoo", "Miladhoo", "Velidhoo"],
        "Raa": ["Alifushi", "Angolhitheemu", "Dhuvaafaru", "Fainu", "Hulhudhuffaaru", "Inguraidhoo", "Innamaadhoo", "Kandholhudhoo", "Kinolhas", "Maakurathu", "Maduvvari", "Meedhoo", "Rasgetheemu", "Rasmaadhoo", "Ungoofaaru", "Vaadhoo"],
        "Baa": ["Dharavandhoo", "Eydhafushi", "Fehendhoo", "Fulhadhoo", "Goidhoo", "Hithaadhoo", "Kamadhoo", "Kendhoo", "Kihaadhoo", "Kudarikilu", "Maalhos", "Thulhaadhoo"],
        "Lhaviyani": ["Hinnavaru", "Kurendhoo", "Maafilaafushi", "Naifaru", "Olhuvelifushi"],
        "Kaafu": ["Dhiffushi", "Gaafaru", "Gulhi", "Guraidhoo", "Himmafushi", "Huraa", "Kaashidhoo", "Maafushi", "Thulusdhoo"],
        "Alifu Alifu": ["Bodufolhudhoo", "Dhigurah", "Dhigufinolhu", "Dhigurah", "Fehendhoo", "Himandhoo", "Huraa", "Maalhos", "Mathiveri", "Rasdhoo", "Thoddoo", "Thulhaadhoo"],
        "Alifu Dhaalu": ["Dhigurah", "Dhigufinolhu", "Fenfushi", "Himandhoo", "Huraa", "Kunburudhoo", "Maafushi", "Nilandhoo", "Thoddoo"],
        "Vaavu": ["Felidhoo", "Fulidhoo", "Thinadhoo"],
        "Meemu": ["Dhiggaru", "Kolhufushi", "Mulah", "Muli", "Naalaafushi", "Raimmandhoo", "Veyvah"],
        "Faafu": ["Bilehdhoo", "Dheburi", "Dhiggaru", "Feeali", "Himandhoo", "Hulhudhoo", "Magoodhoo", "Nilandhoo"],
        "Dhaalu": ["Bandidhoo", "Gemendhoo", "Hulhudheli", "Kudahuvadhoo", "Rinbudhoo", "Vaanee", "Veymandoo"],
        "Thaa": ["Dhiyamigili", "Dhiggaru", "Dhiyamigili", "Guraidhoo", "Hirilandhoo", "Kandoodhoo", "Kinbidhoo", "Madifushi", "Omadhoo", "Thimarafushi", "Vandhoo", "Veymandoo"],
        "Laamu": ["Dhanbidhoo", "Fonadhoo", "Gan", "Hithadhoo", "Isdhoo", "Kalaidhoo", "Kunahandhoo", "Maamendhoo", "Maavah", "Mundoo"],
        "Gaafu Alifu": ["Dhevvadhoo", "Dhiyamigili", "Dhiggaru", "Fares-Maathodaa", "Fiyoari", "Gadhdhoo", "Hoandeddhoo", "Kandoodhoo", "Maamendhoo", "Nilandhoo", "Vilingili"],
        "Gaafu Dhaalu": ["Fares-Maathodaa", "Fiyoari", "Gadhdhoo", "Hoadedhdhoo", "Hoandeddhoo", "Kandoodhoo", "Maamendhoo", "Nilandhoo", "Rathafandhoo", "Thinadhoo"],
        "Gnaviyani": ["Fuvahmulah"],
        "Seenu": ["Hithadhoo", "Hulhudhoo", "Maradhoo", "Maradhoo-Feydhoo", "Meedhoo", "Hulhudhoo-Feydhoo"],
        "Malé": ["Malé", "Vilimalé", "Hulhumalé"]
    }
};

// State Management
let currentUser = null;
let userEmail = null;
let campaignData = null;
let userSerialNumber = null;

// Make variables globally accessible for pages.js and messenger.js
window.userEmail = userEmail;
window.campaignData = campaignData;
window.db = db;
window.auth = auth;
window.maldivesData = maldivesData;
window.constituencyIslandData = constituencyIslandData;
window.getAllConstituencies = getAllConstituencies;
window.getIslandsForConstituency = getIslandsForConstituency;
window.getConstituencyForIsland = getConstituencyForIsland;

// Utility Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('[showScreen] Showing screen:', screenId);

        // Preserve client code in URL when switching screens
        const clientCode = sessionStorage.getItem('clientCode') || new URLSearchParams(window.location.search).get('code');
        if (clientCode && !window.location.search.includes(`code=${clientCode}`)) {
            const url = new URL(window.location);
            url.searchParams.set('code', clientCode);
            window.history.replaceState({}, '', url);
            console.log('[showScreen] Preserved client code in URL:', clientCode);
        }
    }
}

let loadingProgressInterval = null;
let currentProgress = 0;

// Page Loading Tracker
let pageLoadingTracker = {
    pages: new Set(),
    loadedPages: new Set(),
    isLoading: false,
    onAllPagesLoaded: null
};

function trackPageLoad(pageName) {
    if (!pageLoadingTracker.isLoading) return;
    pageLoadingTracker.loadedPages.add(pageName);
    console.log(`[Page Tracker] Page loaded: ${pageName} (${pageLoadingTracker.loadedPages.size}/${pageLoadingTracker.pages.size})`);

    // Check if all pages are loaded
    if (pageLoadingTracker.loadedPages.size >= pageLoadingTracker.pages.size) {
        console.log('[Page Tracker] All pages loaded!');
        if (pageLoadingTracker.onAllPagesLoaded) {
            pageLoadingTracker.onAllPagesLoaded();
        }
    }
}

function startPageTracking(pages, onComplete) {
    pageLoadingTracker.pages = new Set(pages);
    pageLoadingTracker.loadedPages = new Set();
    pageLoadingTracker.isLoading = true;
    pageLoadingTracker.onAllPagesLoaded = onComplete;
    console.log(`[Page Tracker] Started tracking ${pages.length} pages:`, pages);
}

function stopPageTracking() {
    pageLoadingTracker.isLoading = false;
    pageLoadingTracker.pages.clear();
    pageLoadingTracker.loadedPages.clear();
    pageLoadingTracker.onAllPagesLoaded = null;
}

function showLoading(show = true, options = {}) {
    // Try both loading-overlay (main app) and loading-screen (agent portal)
    const overlay = document.getElementById('loading-overlay') || document.getElementById('loading-screen');
    const titleEl = document.getElementById('loading-title');
    const subtitleEl = document.getElementById('loading-subtitle');
    const percentageEl = document.getElementById('loading-percentage');
    const progressBar = document.getElementById('loading-progress-bar');
    const workspaceScreen = document.getElementById('workspace-screen');

    if (!overlay) {
        // This is expected in some pages - no error needed
        return;
    }

    if (show) {
        // Add blur to workspace screen
        if (workspaceScreen) {
            workspaceScreen.classList.add('loading-blur');
        }

        // Update animated background text with campaign name
        const bgText1 = document.getElementById('loading-bg-text-1');
        const bgText2 = document.getElementById('loading-bg-text-2');
        const bgText3 = document.getElementById('loading-bg-text-3');

        // Get campaign name from window.campaignData or use default
        const campaignName = (window.campaignData && window.campaignData.campaignName) ?
            window.campaignData.campaignName.toUpperCase() :
            'CAMPAIGN';

        if (bgText1) bgText1.textContent = campaignName;
        if (bgText2) bgText2.textContent = campaignName;
        if (bgText3) bgText3.textContent = campaignName;

        // Reset progress
        currentProgress = options.percent || 0;

        // Set custom text if provided
        if (options.title && titleEl) {
            titleEl.textContent = options.title;
        } else if (titleEl) {
            titleEl.textContent = 'Getting Your Campaign Ready';
        }

        // Only show subtitle if explicitly provided
        if (options.subtitle && subtitleEl) {
            subtitleEl.textContent = options.subtitle;
            subtitleEl.style.display = 'block';
        } else if (subtitleEl) {
            subtitleEl.textContent = '';
            subtitleEl.style.display = 'none';
        }

        // Update percentage display
        if (percentageEl) {
            percentageEl.textContent = `${currentProgress}%`;
        }

        // Update progress bar
        if (progressBar) {
            progressBar.style.width = `${currentProgress}%`;
        }

        overlay.style.display = 'flex';
        if (overlay.classList) {
            overlay.classList.add('active');
        }
    } else {
        // Remove blur from workspace screen
        if (workspaceScreen) {
            workspaceScreen.classList.remove('loading-blur');
        }

        // Hide overlay immediately
        overlay.style.display = 'none';
        if (overlay.classList) {
            overlay.classList.remove('active');
        }

        // Clear subtitle
        if (subtitleEl) {
            subtitleEl.textContent = '';
            subtitleEl.style.display = 'none';
        }

        // Clear progress interval
        if (loadingProgressInterval) {
            clearInterval(loadingProgressInterval);
            loadingProgressInterval = null;
        }

        // Reset progress
        currentProgress = 0;
        if (percentageEl) {
            percentageEl.textContent = '0%';
        }
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }
}

// Generate campaign logo from initials
function generateCampaignLogo(campaignName) {
    if (!campaignName) return '';

    // Extract initials from campaign name
    const words = campaignName.trim().split(/\s+/);
    let initials = '';

    if (words.length >= 2) {
        // Take first letter of first two words
        initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
        // Take first two letters of single word
        initials = words[0].substring(0, 2).toUpperCase();
    }

    // Generate a color based on campaign name (consistent color for same name)
    const colors = [
        ['#6fc1da', '#8dd4e8'], // Primary gradient
        ['#0891b2', '#06b6d4'], // Cyan gradient
        ['#059669', '#10b981'], // Green gradient
        ['#dc2626', '#ef4444'], // Red gradient
        ['#d97706', '#f59e0b'], // Orange gradient
        ['#7c2d12', '#92400e'], // Brown gradient
    ];

    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < campaignName.length; i++) {
        hash = campaignName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorPair = colors[Math.abs(hash) % colors.length];

    // Create SVG logo
    const svg = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGradient${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" rx="20" fill="url(#logoGradient${Math.abs(hash)})"/>
            <text x="100" y="120" font-family="Poppins, Arial, sans-serif" font-size="72" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
        </svg>
    `;

    // Convert SVG to data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Update loading progress percentage
function updateLoadingProgress(percent, subtitle = null) {
    const percentageEl = document.getElementById('loading-percentage');
    const progressBar = document.getElementById('loading-progress-bar');
    const subtitleEl = document.getElementById('loading-subtitle');

    // Ensure percent is between 0 and 100
    percent = Math.max(0, Math.min(100, percent));
    currentProgress = percent;

    if (percentageEl) {
        percentageEl.textContent = `${percent}%`;
    }

    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }

    if (subtitle && subtitleEl) {
        subtitleEl.textContent = subtitle;
        subtitleEl.style.display = 'block';
    } else if (subtitleEl && !subtitle) {
        subtitleEl.style.display = 'none';
    }
}

// Progress tracking for application update (simplified - no longer tracking individual components)

// Track fact rotation interval
let factRotationInterval = null;

// Update individual component progress
function updateComponentProgress(component, percent) {
    // This function is kept for compatibility but no longer updates individual progress bars
    // Individual component progress bars have been removed from the loading screen
    // Progress is now shown only via the main loading percentage and progress bar

    // Update subtitle with random fact periodically
    const subtitleEl = document.getElementById('loading-subtitle');
    if (subtitleEl) {
        // Update fact periodically while loading
        const shouldUpdateFact = Math.random() < 0.1; // 10% chance each call
        if (shouldUpdateFact) {
            subtitleEl.textContent = getRandomMaldivianPoliticsFact();
            subtitleEl.style.display = 'block';
        }
    }
}

// Make it globally available
window.updateComponentProgress = updateComponentProgress;

// Random facts about Maldivian politics
const maldivianPoliticsFacts = [
    'The Maldives became a republic in 1968, ending 853 years of sultanate rule.',
    'The People\'s Majlis is the unicameral legislative body of the Maldives with 87 members.',
    'Maldives has a multi-party political system with several active political parties.',
    'The first democratic multi-party presidential election was held in 2008.',
    'Maldivian politics is characterized by coalition governments and shifting alliances.',
    'Local councils (WDC) play a crucial role in grassroots governance and development.',
    'The Maldives has 20 administrative atolls and one city (Malé) for governance purposes.',
    'Campaign management is essential for effective voter outreach across the scattered islands.',
    'Political participation in the Maldives has increased significantly since 2008.',
    'The Maldives uses a two-round voting system for presidential elections.',
    'Voter engagement strategies must account for the archipelago\'s geographic challenges.',
    'Campaign logistics require coordination across multiple atolls and islands.',
    'Local council elections focus on community development and service delivery.',
    'The Maldives has made significant progress in democratic institutions since 2008.',
    'Political campaigns often use island-to-island outreach strategies.',
    'The election commission ensures fair and transparent electoral processes.',
    'Community involvement is key to successful political campaigns in the Maldives.',
    'Youth participation in politics has been growing in recent elections.',
    'Technology is increasingly important for campaign management and voter communication.',
    'The Maldives has a vibrant civil society that influences political discourse.'
];

// Get a random Maldivian politics fact
function getRandomMaldivianPoliticsFact() {
    const randomIndex = Math.floor(Math.random() * maldivianPoliticsFacts.length);
    return maldivianPoliticsFacts[randomIndex];
}

// Make it globally available
window.getRandomMaldivianPoliticsFact = getRandomMaldivianPoliticsFact;



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

        // Firestore Errors
        'permission-denied': 'You do not have permission to perform this action. Please make sure you are logged in and that your account has the necessary permissions. If the problem persists, please contact your administrator.',
        'unavailable': 'Service is temporarily unavailable. Please try again later.',
        'unauthenticated': 'You must be logged in to perform this action.',
        'cancelled': 'The operation was cancelled.',
        'deadline-exceeded': 'The operation took too long. Please try again.',
        'not-found': 'The requested resource was not found.',
        'already-exists': 'This resource already exists.',
        'resource-exhausted': 'Service is temporarily unavailable due to high demand. Please try again later.',
        'failed-precondition': 'The operation failed due to a precondition. Please try again.',
        'aborted': 'The operation was aborted. Please try again.',
        'out-of-range': 'The operation is out of range. Please check your input.',
        'unimplemented': 'This operation is not yet implemented.',
        'data-loss': 'Data loss occurred. Please contact support.',

        // Storage Errors
        'storage/unauthorized': 'You do not have permission to upload files. Please contact your administrator.',
        'storage/canceled': 'File upload was canceled.',
        'storage/unknown': 'An unknown error occurred while uploading the file.',
        'storage/invalid-format': 'Invalid file format. Please select a valid file.',
        'storage/quota-exceeded': 'Storage quota exceeded. Please contact your administrator.',
        'storage/object-not-found': 'The file you are trying to access was not found.',
        'storage/bucket-not-found': 'Storage bucket not found. Please contact support.',
        'storage/project-not-found': 'Storage project not found. Please contact support.'
    };

    return errorMessages[errorCode] || errorMessage || 'An unexpected error occurred. Please try again.';
}

function showError(elementId, message, useDialog = false) {
    // Get user-friendly error message first
    const friendlyMessage = getFirebaseErrorMessage(message);

    // Check if we should use dialog
    let shouldUseDialog = useDialog;
    let dialogTitle = 'Error';

    // Detect Firebase errors
    if (!shouldUseDialog && window.showErrorDialog) {
        if (message && typeof message === 'object' && message.code) {
            shouldUseDialog = true;
            if (message.code.includes('auth/')) {
                dialogTitle = 'Authentication Error';
            } else if (message.code.includes('storage/')) {
                dialogTitle = 'Upload Error';
            } else if (message.code === 'permission-denied') {
                dialogTitle = 'Permission Error';
            } else {
                dialogTitle = 'Error';
            }
        } else if (typeof message === 'string') {
            const isFirebaseError = message.includes('auth/') ||
                message.includes('invalid-credential') ||
                message.includes('Firebase') ||
                message.includes('storage/') ||
                message.includes('permission-denied');
            if (isFirebaseError) {
                shouldUseDialog = true;
                if (message.includes('auth/') || message.includes('invalid-credential')) {
                    dialogTitle = 'Authentication Error';
                } else if (message.includes('storage/')) {
                    dialogTitle = 'Upload Error';
                } else if (message.includes('permission-denied')) {
                    dialogTitle = 'Permission Error';
                }
            }
        }
    }

    // If useDialog is true or we detect a Firebase error, show custom dialog
    if (shouldUseDialog && window.showErrorDialog) {
        window.showErrorDialog(friendlyMessage, dialogTitle);
        return;
    }

    // Fallback to inline error message
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = friendlyMessage;
        errorEl.classList.add('show');
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
}

function showSuccessMessage(message, title = 'Success') {
    if (window.showSuccess) {
        window.showSuccess(message, title);
    } else {
        // Fallback: create temporary success message element
        const successEl = document.createElement('div');
        successEl.className = 'error-message';
        successEl.style.background = 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)';
        successEl.style.borderLeftColor = 'var(--success-color)';
        successEl.style.color = 'var(--success-color)';
        successEl.textContent = message;
        document.body.appendChild(successEl);
        successEl.classList.add('show');
        setTimeout(() => {
            successEl.classList.remove('show');
            setTimeout(() => successEl.remove(), 300);
        }, 3000);
    }
}

// Make showSuccessMessage globally available
window.showSuccessMessage = showSuccessMessage;

// Validate Client Code from URL
async function validateClientCode(code) {
    try {
        console.log('[validateClientCode] Validating code:', code, 'Type:', typeof code);

        // Ensure Firestore database is initialized before attempting queries
        // Try to initialize if needed, but proceed even if it fails (queries will handle errors)
        let firestoreDb = db;
        try {
            firestoreDb = await ensureDbInitialized();
            console.log('[validateClientCode] Database initialized, proceeding with validation');
        } catch (dbError) {
            console.warn('[validateClientCode] Database initialization issue, using existing db:', dbError);
            // Use existing db if available, otherwise queries will fail with proper error messages
            firestoreDb = db;
        }

        // Check if we have a valid database instance before proceeding
        if (!firestoreDb) {
            console.error('[validateClientCode] No database instance available');
            const error = new Error('Database connection failed. Please check your internet connection and refresh the page.\n\nIf the problem persists, contact your administrator.');
            console.error('[validateClientCode] Cannot proceed without database:', error);
            // Throw error to be caught by outer try-catch
            throw error;
        }

        // Ensure code is a string for comparison
        const codeStr = String(code).trim();
        console.log('[validateClientCode] Code as string:', codeStr);

        // Normalize code - remove leading zeros for comparison
        const normalizedCode = codeStr.replace(/^0+/, '') || '0';
        const normalizedCodePadded = normalizedCode.padStart(4, '0');

        // Try querying as string first (most common)
        let clientsQuery = query(collection(firestoreDb, 'clients'), where('clientCode', '==', codeStr));
        let snapshot = await getDocs(clientsQuery);

        console.log('[validateClientCode] Query result (as string) - found documents:', snapshot.size);

        // If no results, try as number (in case it was stored as number)
        if (snapshot.empty) {
            const codeNum = parseInt(codeStr, 10);
            if (!isNaN(codeNum)) {
                console.log('[validateClientCode] Trying as number:', codeNum);
                clientsQuery = query(collection(firestoreDb, 'clients'), where('clientCode', '==', codeNum));
                snapshot = await getDocs(clientsQuery);
                console.log('[validateClientCode] Query result (as number) - found documents:', snapshot.size);
            }
        }

        // If still no results, try normalized/padded version
        if (snapshot.empty && normalizedCodePadded !== codeStr) {
            console.log('[validateClientCode] Trying normalized code:', normalizedCodePadded);
            clientsQuery = query(collection(firestoreDb, 'clients'), where('clientCode', '==', normalizedCodePadded));
            snapshot = await getDocs(clientsQuery);
            console.log('[validateClientCode] Query result (normalized) - found documents:', snapshot.size);
        }

        // If still no results, fetch all clients and search manually (fallback)
        if (snapshot.empty) {
            console.log('[validateClientCode] No direct match found, fetching all clients for manual search...');
            try {
                const allClients = await getDocs(collection(firestoreDb, 'clients'));
                console.log('[validateClientCode] Total clients in database:', allClients.size);

                for (const docSnap of allClients.docs) {
                    const clientData = docSnap.data();
                    const storedCode = clientData.clientCode;
                    const storedCodeStr = String(storedCode || '').trim();

                    console.log('[validateClientCode] Checking client:', docSnap.id, 'Code:', storedCode, 'Type:', typeof storedCode);

                    // Try various comparison methods
                    if (storedCodeStr === codeStr ||
                        storedCodeStr === normalizedCodePadded ||
                        String(parseInt(storedCodeStr, 10)).padStart(4, '0') === normalizedCodePadded ||
                        String(parseInt(codeStr, 10)).padStart(4, '0') === storedCodeStr.padStart(4, '0')) {
                        console.log('[validateClientCode] Found matching client via manual search:', docSnap.id);

                        // Check if client is active
                        if (clientData.isActive === false) {
                            console.warn('[validateClientCode] Client account is suspended');
                            return false;
                        }

                        // Store validated code
                        localStorage.setItem('clientCode', codeStr);
                        sessionStorage.setItem('clientCode', codeStr);
                        sessionStorage.setItem('clientEmail', docSnap.id);
                        console.log('[validateClientCode] Code validated successfully ✓');
                        return true;
                    }
                }
            } catch (debugError) {
                console.error('[validateClientCode] Error fetching all clients for debug:', debugError);
                // If this is a database connection error, provide helpful message
                if (debugError.message && debugError.message.includes('Expected first argument to collection()')) {
                    console.error('[validateClientCode] Database instance is invalid - Firestore not properly initialized');
                }
            }
        }

        if (!snapshot.empty) {
            const clientDoc = snapshot.docs[0];
            const clientData = clientDoc.data();
            console.log('[validateClientCode] Client document found:', {
                email: clientDoc.id,
                clientCode: clientData.clientCode,
                clientCodeType: typeof clientData.clientCode,
                isActive: clientData.isActive
            });

            // Check if client is active
            if (clientData.isActive === false) {
                console.warn('[validateClientCode] Client account is suspended');
                return false;
            }

            // Compare both as strings to handle type mismatches
            const storedCode = String(clientData.clientCode || '').trim();
            if (storedCode === codeStr ||
                storedCode === normalizedCodePadded ||
                storedCode.padStart(4, '0') === normalizedCodePadded) {
                // Store client code in both localStorage (persists) and sessionStorage for validation
                localStorage.setItem('clientCode', codeStr);
                sessionStorage.setItem('clientCode', codeStr);
                sessionStorage.setItem('clientEmail', clientDoc.id);
                console.log('[validateClientCode] Code validated successfully ✓');
                return true;
            } else {
                console.warn('[validateClientCode] Code mismatch:', {
                    provided: codeStr,
                    stored: storedCode,
                    normalized: normalizedCodePadded
                });
            }
        } else {
            console.log('[validateClientCode] No client found with code:', codeStr);
        }

        return false;
    } catch (error) {
        console.error('[validateClientCode] Error validating client code:', error);
        console.error('[validateClientCode] Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        // Handle specific error types with user-friendly messages
        if (error.message && error.message.includes('Expected first argument to collection()')) {
            console.error('[validateClientCode] Database not initialized - Firestore connection error');
            if (window.showErrorDialog) {
                window.showErrorDialog(
                    'Database connection error. Please refresh the page and try again.\n\n' +
                    'If the problem persists, check your internet connection or contact your administrator.',
                    'Database Error'
                );
            }
            return false;
        }

        // If it's a permission error, show a more helpful message
        if (error.code === 'permission-denied') {
            console.error('[validateClientCode] Permission denied - check Firestore security rules');
            if (window.showErrorDialog) {
                window.showErrorDialog(
                    'Access denied. Please contact your administrator to verify your access permissions.',
                    'Permission Denied'
                );
            }
            return false;
        }

        // Generic error handling
        if (window.showErrorDialog && error.message && !error.message.includes('Database connection')) {
            // Don't show duplicate error dialogs for database errors already shown above
            window.showErrorDialog(
                `Error validating access code: ${error.message}\n\nPlease try again or contact your administrator.`,
                'Validation Error'
            );
        }

        return false;
    }
}

// Check URL for client code parameter
async function checkClientCodeAccess() {
    // Ensure database is initialized before checking client code
    // Don't block if initialization fails - let queries handle their own errors
    try {
        await ensureDbInitialized();
        console.log('[checkClientCodeAccess] Database ready, proceeding with code validation');
    } catch (dbError) {
        console.error('[checkClientCodeAccess] Database initialization issue:', dbError);
        // Don't block - try to proceed anyway, queries will handle errors
        // This allows offline functionality and handles network issues gracefully
        if (!db) {
            console.warn('[checkClientCodeAccess] Database not initialized, but proceeding anyway');
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const clientCode = urlParams.get('code');

    // First, check if code is in URL
    if (clientCode && clientCode.length === 4 && /^\d{4}$/.test(clientCode)) {
        console.log('[checkClientCodeAccess] Code found in URL:', clientCode);
        const isValid = await validateClientCode(clientCode);
        if (!isValid) {
            console.log('[checkClientCodeAccess] Code is invalid - code provided:', clientCode);

            // Provide more helpful error message
            let errorMessage = 'Invalid client access code. Please use the link provided by your administrator.\n\n';
            errorMessage += `Code attempted: ${clientCode}\n\n`;
            errorMessage += 'If you believe this code is correct, please:\n';
            errorMessage += '1. Verify the link was copied completely\n';
            errorMessage += '2. Contact your administrator for a new access link';

            // Always use custom error dialog (dialog.js is loaded before app.js)
            if (window.showErrorDialog) {
                window.showErrorDialog(errorMessage, 'Access Denied');
            } else {
                // Fallback only if dialog system hasn't loaded yet - wait and retry
                setTimeout(() => {
                    if (window.showErrorDialog) {
                        window.showErrorDialog(errorMessage, 'Access Denied');
                    } else {
                        // Last resort fallback
                        if (window.showDialog) {
                            window.showDialog({
                                type: 'error',
                                title: 'Access Denied',
                                message: errorMessage
                            });
                        }
                    }
                }, 500);
            }
            // Don't redirect - just return false so user can see the error
            // The code will remain in URL for retry
            return false;
        }
        console.log('[checkClientCodeAccess] Code is valid, storing in localStorage and sessionStorage');

        // Store in both localStorage (persists across sessions) and sessionStorage
        localStorage.setItem('clientCode', clientCode);
        sessionStorage.setItem('clientCode', clientCode);

        // Preserve code in URL by updating history without reloading
        if (window.location.search !== `?code=${clientCode}`) {
            const newUrl = `${window.location.pathname}?code=${clientCode}`;
            window.history.replaceState({}, '', newUrl);
        }

        return true;
    } else {
        // No code in URL - check if already validated and stored (check localStorage first, then sessionStorage)
        const storedCode = localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');
        if (storedCode) {
            console.log('[checkClientCodeAccess] No code in URL, but found in storage:', storedCode);
            // Validate the stored code
            const isValid = await validateClientCode(storedCode);
            if (isValid) {
                // Restore code to URL if it's not there
                if (!window.location.search.includes('code=')) {
                    const newUrl = `${window.location.pathname}?code=${storedCode}`;
                    window.history.replaceState({}, '', newUrl);
                    console.log('[checkClientCodeAccess] Restored code to URL');
                }
                // Ensure it's in both storages
                localStorage.setItem('clientCode', storedCode);
                sessionStorage.setItem('clientCode', storedCode);
                return true;
            } else {
                // Stored code is invalid - remove it
                localStorage.removeItem('clientCode');
                sessionStorage.removeItem('clientCode');
                console.log('[checkClientCodeAccess] Stored code is invalid, removed from storage');
            }
        } else {
            console.log('[checkClientCodeAccess] No code in URL or storage');
        }

        // No code and not validated - this is expected for first-time access
        // Don't show error immediately, allow user to try to login
        // The login form will handle showing appropriate errors
        return true; // Return true to allow access, but client code validation will happen during login
    }
}

// Track Session with Location and IP
async function trackClientSession(email, clientCode) {
    try {
        // Ensure user is authenticated before tracking session
        if (!auth.currentUser) {
            console.warn('Cannot track session: User not authenticated');
            return;
        }

        // Use authenticated user's email, not the passed parameter
        const authenticatedEmail = auth.currentUser.email;
        if (!authenticatedEmail) {
            console.warn('Cannot track session: No email in auth token');
            return;
        }

        // Get location and IP
        let location = {
            ip: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            countryCode: 'Unknown'
        };
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            location.ip = ipData.ip;

            const locResponse = await fetch(`https://ipapi.co/${location.ip}/json/`);
            const locData = await locResponse.json();
            location.city = locData.city || 'Unknown';
            location.region = locData.region || 'Unknown';
            location.country = locData.country_name || 'Unknown';
            location.countryCode = locData.country_code || 'Unknown';
        } catch (error) {
            console.error('Error getting location:', error);
        }

        const sessionData = {
            email: authenticatedEmail, // Always use authenticated email
            clientCode,
            type: 'client',
            ipAddress: location.ip,
            location: {
                city: location.city,
                region: location.region,
                country: location.country,
                countryCode: location.countryCode
            },
            userAgent: navigator.userAgent,
            isActive: true,
            loginTime: serverTimestamp(),
            lastActivity: serverTimestamp()
        };

        // Check if active session exists
        // Try query with both conditions first, fallback to email-only if index missing
        let snapshot;
        try {
            const sessionsQuery = query(collection(db, 'sessions'), where('email', '==', authenticatedEmail), where('isActive', '==', true));
            snapshot = await getDocs(sessionsQuery);
        } catch (queryError) {
            // If composite index missing, query by email only and filter in JavaScript
            if (queryError.code === 'failed-precondition' && queryError.message && queryError.message.includes('index')) {
                console.warn('Sessions composite index missing, using email-only query');
                const fallbackQuery = query(collection(db, 'sessions'), where('email', '==', authenticatedEmail));
                snapshot = await getDocs(fallbackQuery);
                // Filter for active sessions in JavaScript
                snapshot = {
                    ...snapshot,
                    docs: snapshot.docs.filter(doc => doc.data().isActive === true),
                    empty: snapshot.docs.filter(doc => doc.data().isActive === true).length === 0
                };
            } else {
                throw queryError;
            }
        }

        if (!snapshot.empty) {
            // Update existing session
            try {
                // Verify the session belongs to the authenticated user
                const existingSessionData = snapshot.docs[0].data();
                if (existingSessionData.email !== authenticatedEmail) {
                    console.warn('Session email mismatch, skipping update');
                    return;
                }
                await updateDoc(snapshot.docs[0].ref, {
                    lastActivity: serverTimestamp(),
                    isActive: true
                });
            } catch (updateError) {
                if (updateError.code === 'permission-denied') {
                    console.warn('Session update permission denied - this is non-critical');
                } else {
                    throw updateError;
                }
            }
        } else {
            // Create new session
            try {
                // sessionData already has authenticatedEmail, so we can use it directly
                // Double-check that email matches authenticated user
                if (sessionData.email !== authenticatedEmail) {
                    console.warn('Email mismatch detected, correcting...');
                    sessionData.email = authenticatedEmail;
                }

                await addDoc(collection(db, 'sessions'), sessionData);
            } catch (createError) {
                if (createError.code === 'permission-denied') {
                    console.warn('Session creation permission denied - this is non-critical');
                    // Log for debugging
                    console.warn('Session creation details:', {
                        passedEmail: email,
                        authEmail: authenticatedEmail,
                        sessionDataEmail: sessionData.email,
                        currentUser: auth.currentUser ? 'exists' : 'null',
                        authTokenEmail: auth.currentUser.email
                    });
                } else {
                    throw createError;
                }
            }
        }

        // Update client lastActive
        try {
            // Try to update client lastActive, but don't fail if permission denied
            await updateDoc(doc(db, 'clients', email), {
                lastActive: serverTimestamp()
            });
        } catch (error) {
            // Silently handle permission errors for lastActive updates
            if (error.code !== 'permission-denied') {
                console.error('Error updating client lastActive:', error);
            }
        }
    } catch (error) {
        // Handle permission errors gracefully - session tracking is not critical
        if (error.code === 'permission-denied') {
            console.warn('Session tracking permission denied - this is non-critical');
        } else {
            console.error('Error tracking session:', error);
        }
    }
}

// Update session activity periodically
function startSessionActivityTracking(email) {
    setInterval(async () => {
        try {
            const sessionsQuery = query(collection(db, 'sessions'), where('email', '==', email), where('isActive', '==', true));
            const snapshot = await getDocs(sessionsQuery);
            if (!snapshot.empty) {
                await updateDoc(snapshot.docs[0].ref, {
                    lastActivity: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error updating session activity:', error);
        }
    }, 60000); // Update every minute
}

// Populate Maldives Data
function populateAtolls() {
    const atollSelect = document.getElementById('atoll');
    if (!atollSelect) {
        console.warn('Atoll select element not found, skipping population');
        return;
    }
    if (!maldivesData || !maldivesData.atolls || !Array.isArray(maldivesData.atolls)) {
        console.warn('Maldives data or atolls array not available, skipping population');
        return;
    }
    maldivesData.atolls.forEach(atoll => {
        const option = document.createElement('option');
        option.value = atoll.name;
        option.textContent = atoll.name;
        atollSelect.appendChild(option);
    });
}

function populateConstituencies() {
    const constituencySelect = document.getElementById('constituency');
    if (!constituencySelect) {
        console.warn('Constituency select element not found, skipping population');
        return;
    }
    
    // Clear existing options except the first one
    const firstOption = constituencySelect.querySelector('option[value=""]');
    constituencySelect.innerHTML = '';
    if (firstOption) {
        constituencySelect.appendChild(firstOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Constituency';
        constituencySelect.appendChild(defaultOption);
    }
    
    // Get unique constituencies
    const constituencies = getAllConstituencies();
    constituencies.forEach(constituency => {
        const option = document.createElement('option');
        option.value = constituency;
        option.textContent = constituency;
        constituencySelect.appendChild(option);
    });
    
    // Add event listener to populate islands when constituency changes
    constituencySelect.addEventListener('change', function() {
        const selectedConstituency = this.value;
        populateIslands(selectedConstituency);
    });
}

function populateIslands(constituency) {
    const islandSelect = document.getElementById('island');
    if (!islandSelect) {
        console.warn('Island select element not found, skipping population');
        return;
    }
    
    // Clear existing options
    islandSelect.innerHTML = '<option value="">Select Island</option>';

    if (constituency && constituencyIslandData[constituency]) {
        const islands = getIslandsForConstituency(constituency);
        islands.forEach(island => {
            const option = document.createElement('option');
            option.value = island;
            option.textContent = island;
            islandSelect.appendChild(option);
        });
    }
}

// Initialize when DOM is ready
function initializeApplicationData() {
    // Initialize Data
    populateConstituencies();

    // Event Listeners for Island Selection (handled in populateConstituencies function)
    // Constituency change listener is set up in populateConstituencies()
    
    // Initialize header filters if available (main application)
    if (typeof window.initializeHeaderFilters === 'function') {
        window.initializeHeaderFilters();
    }

    // Logo Preview
    const logoInput = document.getElementById('campaign-logo');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('logo-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Logo Preview">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplicationData);
} else {
    initializeApplicationData();
}

// Initialize event listeners when DOM is ready
// Attach onboarding form listener (extracted to reusable function)
function attachOnboardingFormListener(form) {
    if (!form) return;

    console.log('[attachOnboardingFormListener] Attaching listener to form');
    form.setAttribute('data-listener-attached', 'true');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[onboarding-login-form] Form submitted');

        showLoading(true);

        const email = document.getElementById('onboarding-email').value;
        const password = document.getElementById('onboarding-password').value;
        console.log('[onboarding-login-form] Email:', email, 'Password:', password ? '***' : 'empty');

        if (!email || !password) {
            showError('onboarding-login-error', 'Please enter both email and password', false);
            showLoading(false);
            return;
        }

        // Validate client code access first
        console.log('[onboarding-login-form] Checking client code access...');
        const hasAccess = await checkClientCodeAccess();
        console.log('[onboarding-login-form] Client code access:', hasAccess);
        if (!hasAccess) {
            console.log('[onboarding-login-form] Client code access denied');
            showLoading(false);
            return;
        }

        // Firebase authentication
        try {
            await signInWithEmailAndPassword(auth, email, password);
            userEmail = email;
            window.userEmail = email;
            currentUser = auth.currentUser;

            // Check client status
            const clientDoc = await getDoc(doc(db, 'clients', email));
            if (clientDoc.exists()) {
                const clientData = clientDoc.data();
                if (clientData.isActive === false) {
                    await signOut(auth);
                    showError('onboarding-login-error', 'Your account has been suspended. Please contact your administrator.', true);
                    showLoading(false);
                    return;
                }
            }

            // Check if user needs to change password
            const userDoc = await getDoc(doc(db, 'users', email));
            const clientCode = sessionStorage.getItem('clientCode');

            // Track session
            if (clientCode) {
                await trackClientSession(email, clientCode);
                startSessionActivityTracking(email);
            }

            if (!userDoc.exists() || !userDoc.data().passwordChanged) {
                showScreen('password-change-screen');
            } else if (!userDoc.data().serialNumber) {
                document.getElementById('licensing-email').value = email;
                userSerialNumber = null;
                showScreen('licensing-screen');
            } else if (!userDoc.data().campaignSet) {
                userSerialNumber = userDoc.data().serialNumber;
                showScreen('campaign-setup-screen');
            } else {
                userSerialNumber = userDoc.data().serialNumber;
                await loadWorkspace(userDoc.data());
            }
        } catch (error) {
            console.error('[onboarding-login-form] Error:', error);
            // Use custom dialog for Firebase authentication errors
            showError('onboarding-login-error', error, true);
        } finally {
            showLoading(false);
        }
    });

    // Also add click listener to the submit button as backup
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', (e) => {
            console.log('[onboarding-login-form] Submit button clicked directly');
            // Don't prevent default - let form submit handle it
            // But if form submit doesn't fire, manually trigger it
            setTimeout(() => {
                if (form && !form.checkValidity()) {
                    form.reportValidity();
                } else if (form) {
                    form.dispatchEvent(new Event('submit', {
                        bubbles: true,
                        cancelable: true
                    }));
                }
            }, 0);
        });
    }

    console.log('[attachOnboardingFormListener] Listener attached successfully');
}

function initializeEventListeners() {
    // Onboarding Login Form (First-time setup with temporary password)
    const onboardingLoginForm = document.getElementById('onboarding-login-form');
    console.log('[initializeEventListeners] Onboarding login form found:', onboardingLoginForm ? 'Yes' : 'No');
    if (onboardingLoginForm) {
        attachOnboardingFormListener(onboardingLoginForm);
    } else {
        // This is expected in agent.html - no error needed
        console.log('[initializeEventListeners] Onboarding login form not found (expected in agent portal)');
    }

    // Regular Client Login Form (For returning clients with their password)
    const clientLoginForm = document.getElementById('client-login-form');
    if (clientLoginForm) {
        clientLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(true);

            const email = document.getElementById('client-login-email').value;
            const password = document.getElementById('client-login-password').value;

            // Validate client code access first
            const hasAccess = await checkClientCodeAccess();
            if (!hasAccess) {
                showLoading(false);
                return;
            }

            // Firebase authentication
            try {
                await signInWithEmailAndPassword(auth, email, password);
                userEmail = email;
                window.userEmail = email;
                currentUser = auth.currentUser;

                // Check client status
                const clientDoc = await getDoc(doc(db, 'clients', email));
                if (clientDoc.exists()) {
                    const clientData = clientDoc.data();
                    if (clientData.isActive === false) {
                        await signOut(auth);
                        showError('client-login-error', 'Your account has been suspended. Please contact your administrator.', true);
                        showLoading(false);
                        return;
                    }
                }

                // Get user document
                const userDoc = await getDoc(doc(db, 'users', email));
                const clientCode = localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');

                // Track session
                if (clientCode) {
                    await trackClientSession(email, clientCode);
                    startSessionActivityTracking(email);
                }

                // Check if onboarding is incomplete - redirect to onboarding flow
                if (!userDoc.exists() || !userDoc.data().passwordChanged) {
                    await signOut(auth);
                    showError('client-login-error', 'Onboarding incomplete. Please use the initial setup login.', true);
                    showLoading(false);
                    // Switch to setup tab
                    setTimeout(() => {
                        const setupTab = document.getElementById('tab-setup');
                        if (setupTab) {
                            setupTab.click();
                            const onboardingEmail = document.getElementById('onboarding-email');
                            if (onboardingEmail) {
                                onboardingEmail.value = email;
                            }
                        }
                    }, 2000);
                    return;
                } else if (!userDoc.data().serialNumber || !userDoc.data().campaignSet) {
                    // Onboarding incomplete - redirect to appropriate step
                    if (!userDoc.data().serialNumber) {
                        document.getElementById('licensing-email').value = email;
                        userSerialNumber = null;
                        showScreen('licensing-screen');
                    } else if (!userDoc.data().campaignSet) {
                        userSerialNumber = userDoc.data().serialNumber;
                        showScreen('campaign-setup-screen');
                    }
                } else {
                    // Onboarding complete - load workspace
                    userSerialNumber = userDoc.data().serialNumber;
                    await loadWorkspace(userDoc.data());
                }
            } catch (error) {
                console.error('Client login error:', error);
                // Use custom dialog for Firebase authentication errors
                showError('client-login-error', error, true);
            } finally {
                showLoading(false);
            }
        });
    }

    // Login Tab Switching
    const loginTabs = document.querySelectorAll('.login-tab');
    loginTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Remove active class from all tabs
            loginTabs.forEach(t => t.classList.remove('active'));

            // Hide all tab contents (remove active class and force hide with inline style)
            document.querySelectorAll('.login-tab-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Add active class to clicked tab and show corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`tab-content-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }

            // Ensure setup form is always hidden unless explicitly shown via link
            const setupContent = document.getElementById('tab-content-setup');
            if (setupContent && targetTab !== 'setup') {
                setupContent.style.display = 'none';
                setupContent.classList.remove('active');
            }
        });
    });

    // Switch to onboarding login link (shows onboarding form, hides client login)
    const switchToOnboarding = document.getElementById('switch-to-onboarding');
    if (switchToOnboarding) {
        switchToOnboarding.addEventListener('click', (e) => {
            e.preventDefault();
            // Get email from client login form if available
            const email = document.getElementById('client-login-email').value;

            // Hide client login form and show onboarding form
            const clientContent = document.getElementById('tab-content-client');
            const setupContent = document.getElementById('tab-content-setup');

            if (clientContent && setupContent) {
                clientContent.classList.remove('active');
                clientContent.style.display = 'none';

                setupContent.classList.add('active');
                setupContent.style.display = 'block';

                // Pre-fill email if available
                if (email && document.getElementById('onboarding-email')) {
                    document.getElementById('onboarding-email').value = email;
                }
            }
        });
    }
    // Switch back to client login from onboarding
    const switchToClientLogin = document.getElementById('switch-to-client-login');
    if (switchToClientLogin) {
        switchToClientLogin.addEventListener('click', (e) => {
            e.preventDefault();
            // Get email from onboarding form if available
            const email = document.getElementById('onboarding-email').value;

            // Hide onboarding form and show client login form
            const clientContent = document.getElementById('tab-content-client');
            const setupContent = document.getElementById('tab-content-setup');

            if (clientContent && setupContent) {
                setupContent.classList.remove('active');
                setupContent.style.display = 'none';

                clientContent.classList.add('active');
                clientContent.style.display = 'block';

                // Pre-fill email if available
                if (email && document.getElementById('client-login-email')) {
                    document.getElementById('client-login-email').value = email;
                }
            }
        });
    }

    // Admin Login Form Handler (unified login screen)
    const adminLoginFormUnified = document.getElementById('admin-login-form-unified');
    if (adminLoginFormUnified) {
        adminLoginFormUnified.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email-unified').value.trim();
            const password = document.getElementById('admin-password-unified').value;
            const errorEl = document.getElementById('admin-login-error-unified');

            // Clear previous errors
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('show');
            }

            // Validate
            if (!email || !email.includes('@')) {
                if (errorEl) {
                    errorEl.textContent = 'Please enter a valid email address.';
                    errorEl.classList.add('show');
                }
                return;
            }

            if (email !== 'rixaski@gmail.com') {
                if (errorEl) {
                    errorEl.textContent = 'Unauthorized. Only admin can access this panel.';
                    errorEl.classList.add('show');
                }
                return;
            }

            if (!password) {
                if (errorEl) {
                    errorEl.textContent = 'Please enter your password.';
                    errorEl.classList.add('show');
                }
                return;
            }

            showLoading(true);

            try {
                const {
                    signInWithEmailAndPassword
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
                await signInWithEmailAndPassword(auth, email, password);
                // Redirect to admin panel
                window.location.href = 'admin.html';
            } catch (error) {
                console.error('Admin login error:', error);
                showLoading(false);
                if (errorEl) {
                    errorEl.textContent = error.message || 'Login failed. Please check your credentials.';
                    errorEl.classList.add('show');
                }
            }
        });
    }

    // Password Change Form
    const passwordChangeForm = document.getElementById('password-change-form');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(true);

            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                showError('password-error', 'Passwords do not match');
                showLoading(false);
                return;
            }

            if (newPassword.length < 6) {
                showError('password-error', 'Password must be at least 6 characters');
                showLoading(false);
                return;
            }

            try {
                // Update password in Firebase
                await updatePassword(currentUser, newPassword);
                await setDoc(doc(db, 'users', userEmail), {
                    passwordChanged: true,
                    email: userEmail
                }, {
                    merge: true
                });

                // Show success message
                if (window.showSuccessMessage) {
                    window.showSuccessMessage('Password changed successfully!', 'Password Updated');
                }

                document.getElementById('licensing-email').value = userEmail;
                userSerialNumber = null;
                showScreen('licensing-screen');
            } catch (error) {
                console.error('Password change error:', error);
                // Use custom dialog for Firebase errors
                showError('password-error', error, true);
            } finally {
                showLoading(false);
            }
        });
    }

    // Licensing Form
    const licensingForm = document.getElementById('licensing-form');
    if (licensingForm) {
        licensingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(true);

            const serialNumber = document.getElementById('serial-number').value.trim();

            if (!serialNumber) {
                showError('licensing-error', 'Please enter a serial number', false);
                showLoading(false);
                return;
            }

            try {
                console.log('[licensing-form] Validating serial number:', serialNumber);

                // Get client document to check if serial number is assigned to this client
                const clientDoc = await getDoc(doc(db, 'clients', userEmail));
                if (!clientDoc.exists()) {
                    showError('licensing-error', 'Client account not found. Please contact your administrator.', true);
                    showLoading(false);
                    return;
                }

                const clientData = clientDoc.data();
                console.log('[licensing-form] Client data:', clientData);

                // Check if serial number matches what admin assigned to this client
                if (!clientData.serialNumber) {
                    showError('licensing-error', 'No license has been generated for your account yet. Please contact your administrator to generate a license.', true);
                    showLoading(false);
                    return;
                }

                if (clientData.serialNumber !== serialNumber) {
                    showError('licensing-error', 'Invalid serial number. Please check the serial number provided by your administrator.', true);
                    showLoading(false);
                    return;
                }

                // Check if license is active
                if (clientData.licenseActive === false || clientData.isActive === false) {
                    showError('licensing-error', 'Your license is inactive. Please contact your administrator.', true);
                    showLoading(false);
                    return;
                }

                // Check if license is expired
                if (clientData.licenseExpiry) {
                    const expiryDate = clientData.licenseExpiry.toDate ? clientData.licenseExpiry.toDate() : new Date(clientData.licenseExpiry);
                    if (expiryDate < new Date()) {
                        showError('licensing-error', 'Your license has expired. Please contact your administrator for a new license.', true);
                        showLoading(false);
                        return;
                    }
                }

                // Verify client code matches
                const clientCode = localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');
                if (clientData.clientCode && clientData.clientCode !== clientCode) {
                    showError('licensing-error', 'Client code mismatch. Please use the correct access link.', true);
                    showLoading(false);
                    return;
                }

                // Save serial number to user document (this marks license as registered by user)
                await setDoc(doc(db, 'users', userEmail), {
                    serialNumber: serialNumber,
                    email: userEmail,
                    licenseRegisteredAt: serverTimestamp()
                }, {
                    merge: true
                });

                console.log('[licensing-form] License validated and registered successfully ✓');

                console.log('[licensing-form] License registered successfully ✓');

                // Show success message
                if (window.showSuccessMessage) {
                    window.showSuccessMessage('Serial number registered successfully! Your license has been activated.', 'License Activated');
                }

                userSerialNumber = serialNumber;

                // Wait a moment for success message to show, then proceed
                setTimeout(() => {
                    showScreen('campaign-setup-screen');
                    showLoading(false);
                }, 1500);
            } catch (error) {
                console.error('[licensing-form] Licensing error:', error);
                // Use custom dialog for Firebase errors
                showError('licensing-error', error, true);
                showLoading(false);
            }
        });
    }

    // Campaign Setup Form
    const campaignSetupForm = document.getElementById('campaign-setup-form');
    if (campaignSetupForm) {
        campaignSetupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            console.log('[campaign-setup-form] Form submitted');

            const campaignType = document.getElementById('campaign-type').value;
            const campaignName = document.getElementById('campaign-name').value;
            const constituency = document.getElementById('constituency').value;
            const island = document.getElementById('island').value;

            // Validate required fields first (before showing loading)
            if (!campaignType || !campaignName || !constituency || !island) {
                showError('campaign-error', 'Please fill in all required fields (Campaign Type, Name, Constituency, and Island)', false);
                return;
            }
            
            // Validate island belongs to selected constituency
            if (window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
                const constituencyIslands = window.getIslandsForConstituency(constituency);
                if (!constituencyIslands.includes(island)) {
                    showError('campaign-error', `Selected island "${island}" does not belong to constituency "${constituency}". Please select a valid island.`, false);
                    return;
                }
            }

            try {
                // Verify userEmail is set
                if (!userEmail) {
                    console.error('[campaign-setup-form] userEmail is not set!');
                    showError('campaign-error', 'User session expired. Please login again.', true);
                    return;
                }

                // Verify userSerialNumber is set
                if (!userSerialNumber) {
                    console.error('[campaign-setup-form] userSerialNumber is not set!');
                    showError('campaign-error', 'License not registered. Please complete license registration first.', true);
                    return;
                }

                console.log('[campaign-setup-form] Starting campaign setup...');
                console.log('[campaign-setup-form] User email:', userEmail);
                console.log('[campaign-setup-form] Serial number:', userSerialNumber);
                console.log('[campaign-setup-form] Campaign data:', {
                    type: campaignType,
                    name: campaignName,
                    constituency,
                    island
                });

                // Show custom loading with campaign-specific text and initial progress
                showLoading(true, {
                    title: 'Getting Your Campaign Ready',
                    percent: 5
                });

                // Update loading text and progress
                updateLoadingProgress(10, 'Validating campaign data...');

                console.log('[campaign-setup-form] Step 1: Validation complete ✓');

                // Generate logo from campaign name initials
                console.log('[campaign-setup-form] Step 2: Generating campaign logo...');
                updateLoadingProgress(30, 'Updating campaign logo...');

                // Generate SVG logo from campaign name initials
                const logoURL = generateCampaignLogo(campaignName);
                console.log('[campaign-setup-form] Step 2: Campaign logo generated ✓');
                updateLoadingProgress(50, 'Campaign logo generated successfully');

                campaignData = {
                    campaignType,
                    campaignName,
                    campaignLogo: logoURL,
                    constituency,
                    island,
                    email: userEmail,
                    serialNumber: userSerialNumber,
                    setupCompletedAt: serverTimestamp()
                };

                console.log('[campaign-setup-form] Step 3: Saving campaign data to Firestore...');
                updateLoadingProgress(60, 'Saving campaign configuration...');

                // Save to users document
                console.log('[campaign-setup-form] Saving to users collection...');
                try {
                    await setDoc(doc(db, 'users', userEmail), {
                        campaignSet: true,
                        ...campaignData
                    }, {
                        merge: true
                    });
                    updateLoadingProgress(75, 'User data saved successfully');
                    console.log('[campaign-setup-form] Users document saved ✓');
                } catch (userSaveError) {
                    console.error('[campaign-setup-form] Error saving to users:', userSaveError);
                    throw new Error('Failed to save user data: ' + (userSaveError.message || 'Unknown error'));
                }

                // Also save to clients document for admin access
                console.log('[campaign-setup-form] Saving to clients collection...');
                try {
                    await setDoc(doc(db, 'clients', userEmail), {
                        campaignType,
                        campaignName,
                        campaignLogo: logoURL,
                        constituency,
                        island,
                        campaignSet: true,
                        campaignSetupAt: serverTimestamp()
                    }, {
                        merge: true
                    });
                    updateLoadingProgress(90, 'Client data saved successfully');
                    console.log('[campaign-setup-form] Clients document saved ✓');
                } catch (clientSaveError) {
                    console.error('[campaign-setup-form] Error saving to clients:', clientSaveError);
                    throw new Error('Failed to save client data: ' + (clientSaveError.message || 'Unknown error'));
                }

                updateLoadingProgress(95, 'Finalizing setup...');

                console.log('[campaign-setup-form] Step 4: Campaign setup completed successfully ✓');
                updateLoadingProgress(100, 'Setup completed! Redirecting...');

                // Small delay to show 100%, then load workspace immediately
                setTimeout(async () => {
                    console.log('[campaign-setup-form] Loading workspace...');
                    try {
                        // Close loading screen first
                        showLoading(false);
                        // Small delay to ensure loading screen closes
                        await new Promise(resolve => setTimeout(resolve, 100));
                        // Load workspace
                        await loadWorkspace(campaignData);
                        console.log('[campaign-setup-form] Workspace loaded successfully ✓');

                        // Show success message after workspace loads
                        if (window.showSuccessMessage) {
                            setTimeout(() => {
                                window.showSuccessMessage('Campaign setup completed successfully!', 'Campaign Ready');
                            }, 500);
                        }
                    } catch (workspaceError) {
                        console.error('[campaign-setup-form] Error loading workspace:', workspaceError);
                        console.error('[campaign-setup-form] Workspace error details:', {
                            message: workspaceError.message,
                            stack: workspaceError.stack
                        });
                        showError('campaign-error', 'Campaign saved but failed to load workspace. Please refresh the page.', true);
                    }
                }, 800);
            } catch (error) {
                console.error('[campaign-setup-form] Campaign setup error:', error);
                console.error('[campaign-setup-form] Error details:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
                // Use custom dialog for Firebase errors
                showError('campaign-error', error, true);
                showLoading(false);
            }
        });
    }
}

// Load Workspace
async function loadWorkspace(data) {
    try {
        console.log('[loadWorkspace] Starting workspace load...', data);

        // Don't close loading screen here - let it show progress updates

        campaignData = data;

        // Check if accessed via call link (without code - will prompt for code)
        const urlParams = new URLSearchParams(window.location.search);
        const callLinkId = urlParams.get('callLink');

        console.log('[loadWorkspace] Checking for call link, callLinkId:', callLinkId);

        if (callLinkId) {
            console.log('[loadWorkspace] Call link detected, prompting for access code');
            // Wait a bit for modal system to be ready
            setTimeout(async () => {
                await promptCallLinkAccessCode(callLinkId);
            }, 500);
        }

        // Update global references for pages.js and messenger.js
        window.campaignData = campaignData;
        window.userEmail = userEmail;

        // Update Zero Day menu visibility
        if (typeof updateZeroDayMenuVisibility === 'function' && data.zeroDayEnabled !== undefined) {
            updateZeroDayMenuVisibility(data.zeroDayEnabled === true);
        }

        // Switch to workspace screen IMMEDIATELY - show UI first
        showScreen('workspace-screen');

        // Initialize profile dropdown immediately when workspace is shown
        setTimeout(() => {
            if (typeof initializeProfileDropdown === 'function') {
                const initialized = initializeProfileDropdown();
                if (!initialized) {
                    // Retry if initialization failed
                    setTimeout(() => initializeProfileDropdown(), 300);
                }
            }
            // Initialize location display
            if (typeof window.initializeLocationDisplay === 'function') {
                const locationInitialized = window.initializeLocationDisplay();
                if (!locationInitialized) {
                    // Retry if initialization failed (elements might not be ready yet)
                    setTimeout(() => {
                        if (typeof window.initializeLocationDisplay === 'function') {
                            window.initializeLocationDisplay();
                        }
                    }, 300);
                }
            }
        }, 100);

        // Setup notification handlers when workspace is shown (elements should exist now)
        // Load notifications when workspace screen is shown
        if (typeof window.loadNotifications === 'function') {
            console.log('[App] Loading notifications after workspace screen shown...');
            setTimeout(() => {
                window.loadNotifications();
            }, 500); // Small delay to ensure DOM is ready
        }
        setTimeout(() => {
            if (typeof window.setupNotificationHandlers === 'function') {
                window.setupNotificationHandlers();
                console.log('[loadWorkspace] Notification handlers re-initialized');
            }
        }, 200);

        // Update sidebar IMMEDIATELY (progressive rendering)
        try {
            const campaignNameEl = document.getElementById('sidebar-campaign-name');
            const islandNameEl = document.getElementById('sidebar-island-name');
            const logoEl = document.getElementById('sidebar-campaign-logo');
            const profileNameEl = document.getElementById('profile-name');

            if (campaignNameEl) {
                campaignNameEl.textContent = data.campaignName || 'Campaign Name';
            }
            if (islandNameEl) {
                islandNameEl.textContent = data.constituency || 'Constituency';
            }
            if (data.campaignLogo && logoEl) {
                // Check if it's a data URL (SVG) or regular URL
                if (data.campaignLogo.startsWith('data:image/svg+xml')) {
                    logoEl.innerHTML = `<img src="${data.campaignLogo}" alt="Campaign Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`;
                } else {
                    logoEl.innerHTML = `<img src="${data.campaignLogo}" alt="Campaign Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`;
                }
            } else if (data.campaignName && logoEl) {
                // Generate logo from campaign name if no logo exists
                const logoURL = generateCampaignLogo(data.campaignName);
                logoEl.innerHTML = `<img src="${logoURL}" alt="Campaign Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`;
            }
            // Update profile display with user data
            if (typeof updateProfileDisplay === 'function') {
                updateProfileDisplay({
                    email: data.email || userEmail,
                    campaignName: data.campaignName
                });
            }
        } catch (updateError) {
            console.error('[loadWorkspace] Error updating sidebar:', updateError);
        }

        // Initialize icons IMMEDIATELY
        if (typeof initIcons === 'function') {
            initIcons();
        }

        // Re-initialize workspace navigation to ensure event listeners are attached
        // This is important because nav-items might not exist when initializeWorkspace() was first called
        if (typeof initializeWorkspace === 'function') {
            initializeWorkspace();
        }

        // Set dashboard nav as active IMMEDIATELY
        const dashboardNav = document.querySelector('[data-section="dashboard"]');
        if (dashboardNav) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            dashboardNav.classList.add('active');
            if (typeof updateBreadcrumb === 'function') {
                updateBreadcrumb('dashboard');
            }
        }

        // Setup real-time listeners for automatic sync (immediately)
        if (window.setupAllRealtimeListeners && !window.realtimeListenersInitialized) {
            // Try immediately, then retry if needed
            const setupListeners = () => {
                if (window.db && window.userEmail && window.auth && window.auth.currentUser) {
                    console.log('[Real-time Sync] Initializing listeners...');
                    window.setupAllRealtimeListeners();
                    window.realtimeListenersInitialized = true;
                    return true;
                }
                return false;
            };

            if (!setupListeners()) {
                // Retry after short delay if not ready
                setTimeout(() => {
                    if (!window.realtimeListenersInitialized) {
                        setupListeners();
                    }
                }, 500);
            }
        }

        // Start page loading tracking for critical pages that load data on initialization
        const criticalPages = ['dashboard', 'voters'];
        const allPages = ['dashboard', 'voters', 'candidates', 'events', 'calls', 'pledges', 'agents', 'analytics', 'settings'];

        startPageTracking(allPages, () => {
            // All pages loaded - hide loading screen
            console.log('[loadWorkspace] All pages loaded successfully ✓');
            const subtitleEl = document.getElementById('loading-subtitle');
            if (subtitleEl) {
                subtitleEl.textContent = 'Application ready!';
            }
            setTimeout(() => {
                showLoading(false);
                stopPageTracking();
            }, 500); // Small delay to show completion
        });

        // Load dashboard content IMMEDIATELY (will use cache if available)
        if (typeof loadPageContent === 'function') {
            loadPageContent('dashboard');
        }

        // Load critical data with progress tracking
        try {
            // Load notifications in background (non-blocking)
            if (typeof loadNotifications === 'function') {
                loadNotifications();
            }

            // Load dashboard data and track it
            if (typeof loadDashboardData === 'function') {
                updateLoadingProgress(30, 'Loading dashboard data...');
                try {
                    await loadDashboardData(true);
                    trackPageLoad('dashboard');
                    console.log('[loadWorkspace] Dashboard data loaded ✓');
                } catch (error) {
                    console.error('[loadWorkspace] Error loading dashboard data:', error);
                    trackPageLoad('dashboard'); // Track even on error to prevent hanging
                }
            } else {
                trackPageLoad('dashboard');
            }

            // Load voter data and track it
            if (typeof loadVotersData === 'function') {
                updateLoadingProgress(50, 'Loading voter data...');
                try {
                    await loadVotersData(true);
                    trackPageLoad('voters');
                    console.log('[loadWorkspace] Voter data loaded ✓');
                } catch (error) {
                    console.error('[loadWorkspace] Error loading voter data:', error);
                    trackPageLoad('voters'); // Track even on error to prevent hanging
                }
            } else {
                trackPageLoad('voters');
            }

            // Mark other pages as ready (they load on-demand when navigated to)
            // Give a small delay to ensure initial pages are rendered
            updateLoadingProgress(80, 'Preparing application...');
            setTimeout(() => {
                ['candidates', 'events', 'calls', 'pledges', 'agents', 'analytics', 'settings'].forEach(page => {
                    trackPageLoad(page);
                });
                console.log('[loadWorkspace] All pages marked as ready ✓');
            }, 1500); // Give time for initial pages to render

            console.log('[loadWorkspace] Initial data loading completed ✓');
        } catch (preloadError) {
            console.error('[loadWorkspace] Error loading data:', preloadError);
            // Track all pages as loaded even on error to prevent hanging
            allPages.forEach(page => trackPageLoad(page));
        }

        console.log('[loadWorkspace] Workspace initialized successfully ✓');
    } catch (error) {
        console.error('[loadWorkspace] Fatal error:', error);
        showLoading(false);
        throw error;
    }
}

// Creative Location Display in Header
function initializeLocationDisplay() {
    const locationDropdown = document.getElementById('location-dropdown');
    const locationDropdownContent = document.getElementById('location-dropdown-content');
    const locationDisplayWrapper = document.getElementById('location-display-wrapper');
    const locationContainer = document.getElementById('location-display-container');

    if (!locationDropdown || !locationDropdownContent || !locationContainer) {
        console.log('[initializeLocationDisplay] Elements not found, skipping initialization');
        return false;
    }

    function populateDropdown() {
        // Get campaign constituency from campaignData
        const campaignConstituency = (window.campaignData && window.campaignData.constituency) ? window.campaignData.constituency : '';
        
        if (!campaignConstituency) {
            locationDropdownContent.innerHTML = '<div style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px;">No constituency set</div>';
            return;
        }

        // Get current filter state
        const filterState = window.GlobalFilter ? window.GlobalFilter.getState() : { type: null, value: null };
        const isConstituencySelected = filterState.type === 'constituency' && filterState.value === campaignConstituency;
        const selectedIsland = filterState.type === 'island' ? filterState.value : null;

        // Get islands for this constituency only
        const constituencyIslands = getIslandsForConstituency(campaignConstituency);
        const sortedIslands = constituencyIslands ? [...constituencyIslands].sort() : [];

        let dropdownHTML = '';

        // Clear filter option
        dropdownHTML += `
            <div class="filter-option" data-filter-type="clear" style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                <div style="font-size: 11px; color: ${filterState.type === null ? '#6fc1da' : '#6b7280'}; font-weight: ${filterState.type === null ? '600' : '500'}; display: flex; align-items: center; gap: 6px;">
                    ${filterState.type === null ? '<span style="color: #6fc1da;">●</span>' : ''}
                    <span>Show All</span>
                </div>
            </div>
        `;

        // Constituency item (clickable)
        dropdownHTML += `
            <div class="filter-option" data-filter-type="constituency" data-filter-value="${campaignConstituency.replace(/"/g, '&quot;')}" style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Constituency</div>
                <div style="font-size: 12px; color: ${isConstituencySelected ? '#6fc1da' : '#374151'}; font-weight: ${isConstituencySelected ? '600' : '500'}; display: flex; align-items: center; gap: 6px;">
                    ${isConstituencySelected ? '<span style="color: #6fc1da;">●</span>' : ''}
                    <span>${campaignConstituency}</span>
                </div>
            </div>
        `;

        // Islands section
        if (sortedIslands.length > 0) {
            dropdownHTML += `
                <div style="padding: 8px 12px;">
                    <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 6px;">Islands (${sortedIslands.length})</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
            `;

            sortedIslands.forEach(island => {
                const isSelected = selectedIsland === island;
                dropdownHTML += `
                    <div class="filter-option" data-filter-type="island" data-filter-value="${island.replace(/"/g, '&quot;')}" style="padding: 6px 8px; font-size: 12px; color: ${isSelected ? '#6fc1da' : '#374151'}; font-weight: ${isSelected ? '600' : '500'}; border-radius: 4px; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
                        ${isSelected ? '<span style="color: #6fc1da;">●</span>' : ''}
                        <span>${island}</span>
                    </div>
                `;
            });

            dropdownHTML += '</div></div>';
        } else {
            dropdownHTML += `
                <div style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px;">
                    No islands found
                </div>
            `;
        }

        locationDropdownContent.innerHTML = dropdownHTML;

        // Attach click handlers to filter options
        locationDropdownContent.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', function() {
                const filterType = this.getAttribute('data-filter-type');
                const filterValue = this.getAttribute('data-filter-value');

                if (filterType === 'clear') {
                    if (window.GlobalFilter) {
                        window.GlobalFilter.clearFilter();
                    }
                } else if (filterType && filterValue && window.GlobalFilter) {
                    window.GlobalFilter.setFilter(filterType, filterValue);
                }

                // Close dropdown
                locationDropdown.style.display = 'none';
                const chevron = document.getElementById('location-chevron');
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    // Update header display
    function updateLocationDisplay() {
        const locationValues = document.getElementById('location-values');
        const filterState = window.GlobalFilter ? window.GlobalFilter.getState() : { type: null, value: null };

        if (locationValues) {
            if (filterState.type === 'constituency' && filterState.value) {
                const constituencyIslands = getIslandsForConstituency(filterState.value);
                const islandCount = constituencyIslands ? constituencyIslands.length : 0;
                locationValues.textContent = `${filterState.value} • ${islandCount}`;
                locationValues.style.color = '#6fc1da';
                locationValues.style.fontWeight = '600';
            } else if (filterState.type === 'island' && filterState.value) {
                locationValues.textContent = filterState.value;
                locationValues.style.color = '#6fc1da';
                locationValues.style.fontWeight = '600';
            } else {
                const campaignConstituency = (window.campaignData && window.campaignData.constituency) ? window.campaignData.constituency : '';
                if (campaignConstituency) {
                    const constituencyIslands = getIslandsForConstituency(campaignConstituency);
                    if (constituencyIslands && constituencyIslands.length > 0) {
                        locationValues.textContent = `${campaignConstituency} • ${constituencyIslands.length}`;
                    } else {
                        locationValues.textContent = campaignConstituency;
                    }
                } else {
                    locationValues.textContent = 'Select';
                }
                locationValues.style.color = '#374151';
                locationValues.style.fontWeight = '500';
            }
        }
    }

    // Subscribe to global filter changes
    if (window.GlobalFilter) {
        window.GlobalFilter.subscribe(function(newState, previousState) {
            updateLocationDisplay();
            populateDropdown();
            
            // Trigger data refresh across all pages
            refreshAllData();
        });
    }

    // Toggle dropdown function
    function toggleDropdown() {
        const isOpen = locationDropdown.style.display !== 'none';
        locationDropdown.style.display = isOpen ? 'none' : 'block';
        const chevron = document.getElementById('location-chevron');
        if (chevron) {
            chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        if (!isOpen) {
            populateDropdown();
        }
    }

    // Click handler on container
    locationContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (locationDisplayWrapper && 
            !locationDisplayWrapper.contains(e.target)) {
            locationDropdown.style.display = 'none';
            const chevron = document.getElementById('location-chevron');
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        }
    });

    // Function to refresh all data when filter changes
    function refreshAllData() {
        console.log('[GlobalFilter] Refreshing all data after filter change...');
        
        // First, try to re-render cached data immediately for instant feedback
        // Use requestAnimationFrame for smooth instant update
        requestAnimationFrame(() => {
            // Immediately re-render cached data with new filter (instant update)
            if (typeof window.renderCachedVotersData === 'function') {
                try {
                    window.renderCachedVotersData();
                } catch (error) {
                    console.warn('[GlobalFilter] Error rendering cached voters data:', error);
                }
            }
            if (typeof window.renderCachedCallsData === 'function') {
                try {
                    window.renderCachedCallsData();
                } catch (error) {
                    console.warn('[GlobalFilter] Error rendering cached calls data:', error);
                }
            }
            if (typeof window.renderCachedPledgesData === 'function') {
                try {
                    window.renderCachedPledgesData();
                } catch (error) {
                    console.warn('[GlobalFilter] Error rendering cached pledges data:', error);
                }
            }
            if (typeof window.renderCachedCandidatesData === 'function') {
                try {
                    window.renderCachedCandidatesData();
                } catch (error) {
                    console.warn('[GlobalFilter] Error rendering cached candidates data:', error);
                }
            }
            if (typeof window.renderCachedEventsData === 'function') {
                try {
                    window.renderCachedEventsData();
                } catch (error) {
                    console.warn('[GlobalFilter] Error rendering cached events data:', error);
                }
            }
            if (typeof window.renderCachedAgentsData === 'function') {
                try {
                    window.renderCachedAgentsData();
                } catch (error) {
                    console.warn('[GlobalFilter] Error rendering cached agents data:', error);
                }
            }
        });
        
        // Refresh analytics if analytics page is visible
        setTimeout(() => {
            const currentSection = window.currentSection || '';
            if (currentSection === 'analytics' && typeof window.loadAnalyticsData === 'function') {
                console.log('[GlobalFilter] Refreshing analytics data...');
                window.loadAnalyticsData();
            }
        }, 100);
        
        // Clear all caches to force fresh data load in background
        if (typeof window.clearCache === 'function') {
            window.clearCache('voters');
            window.clearCache('calls');
            window.clearCache('pledges');
            window.clearCache('events');
            window.clearCache('candidates');
            window.clearCache('agents');
            window.clearCache('activities');
        } else if (typeof clearAllCaches === 'function') {
            clearAllCaches();
        }
        
        // Clear voter data cache if it exists
        if (window.voterDataCache) {
            // Don't clear data, just mark as needing refresh so cached render works
            // window.voterDataCache.data = null;
            // window.voterDataCache.timestamp = null;
        }
        
        // Immediately refresh data for the current page, then refresh others
        // This ensures instant updates when filter changes
        const currentSection = window.currentSection ? (typeof window.currentSection === 'function' ? window.currentSection() : window.currentSection) : null;
        
        // Also check if table elements exist as fallback
        const isVotersPage = currentSection === 'voters' || document.getElementById('voters-table-body') !== null;
        const isCallsPage = currentSection === 'calls' || document.getElementById('calls-table-body') !== null;
        const isPledgesPage = currentSection === 'pledges' || document.getElementById('pledges-table-body') !== null;
        const isEventsPage = currentSection === 'events' || document.getElementById('events-table-body') !== null;
        const isCandidatesPage = currentSection === 'candidates' || document.getElementById('candidates-table-body') !== null;
        const isAgentsPage = currentSection === 'agents' || document.getElementById('agents-table-body') !== null;
        const isAnalyticsPage = currentSection === 'analytics' || document.getElementById('analytics-stats-section') !== null;
        
        // Immediately refresh the currently visible section
        if (isVotersPage && typeof loadVotersData === 'function') {
            loadVotersData(true);
        } else if (isCallsPage && typeof loadCallsData === 'function') {
            loadCallsData(true);
        } else if (isPledgesPage && typeof loadPledgesData === 'function') {
            loadPledgesData(true);
        } else if (isEventsPage && typeof loadEventsData === 'function') {
            loadEventsData(true);
        } else if (isCandidatesPage && typeof loadCandidatesData === 'function') {
            loadCandidatesData(true);
        } else if (isAgentsPage && typeof loadAgentsData === 'function') {
            loadAgentsData(true);
        } else if (isAnalyticsPage && typeof loadAnalyticsData === 'function') {
            loadAnalyticsData();
        }
        
        // Use requestAnimationFrame for smooth updates of other sections
        requestAnimationFrame(() => {
            // Refresh dashboard data (includes statistics) - this updates all stat boxes
            if (typeof loadDashboardData === 'function') {
                loadDashboardData(true);
            }
            
            // Refresh all table data regardless of current page
            // This ensures all tables are updated when filter changes
            const refreshFunctions = [
                { name: 'loadVotersData', func: loadVotersData },
                { name: 'loadCallsData', func: loadCallsData },
                { name: 'loadPledgesData', func: loadPledgesData },
                { name: 'loadEventsData', func: loadEventsData },
                { name: 'loadCandidatesData', func: loadCandidatesData },
                { name: 'loadAgentsData', func: loadAgentsData }
            ];
            
            // Refresh all tables with slight delays for smooth rendering
            refreshFunctions.forEach((item, index) => {
                if (typeof item.func === 'function') {
                    // Skip if already refreshed above
                    if (isVotersPage && item.name === 'loadVotersData') return;
                    if (isCallsPage && item.name === 'loadCallsData') return;
                    if (isPledgesPage && item.name === 'loadPledgesData') return;
                    if (isEventsPage && item.name === 'loadEventsData') return;
                    if (isCandidatesPage && item.name === 'loadCandidatesData') return;
                    if (isAgentsPage && item.name === 'loadAgentsData') return;
                    
                    setTimeout(() => {
                        item.func(true); // Force refresh
                    }, index * 50); // Stagger updates for smoothness
                }
            });
            
            // Refresh activities
            if (typeof loadRecentActivities === 'function') {
                setTimeout(() => {
                    loadRecentActivities(true);
                }, refreshFunctions.length * 50);
            }
            
            // Refresh analytics if on analytics page
            if (currentSection === 'analytics' && typeof loadAnalyticsData === 'function') {
                setTimeout(() => {
                    loadAnalyticsData();
                }, (refreshFunctions.length + 1) * 50);
            }
        });
    }

    // Initial population
    populateDropdown();
    updateLocationDisplay();

    // Update when campaign data changes
    if (!window.campaignData || !window.campaignData.constituency) {
        const checkCampaignData = setInterval(() => {
            if (window.campaignData && window.campaignData.constituency) {
                updateLocationDisplay();
                populateDropdown();
                clearInterval(checkCampaignData);
            }
        }, 100);
        setTimeout(() => clearInterval(checkCampaignData), 5000);
    }

    return true;
}

window.initializeLocationDisplay = initializeLocationDisplay;

// Update breadcrumb function - Home link removed, replaced with location filter
function updateBreadcrumb(currentSection) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
        // Home link removed - location filter is now in header
        breadcrumb.innerHTML = '';
    }
}

// Make updateBreadcrumb globally available
window.updateBreadcrumb = updateBreadcrumb;

// Initialize workspace functionality
function initializeWorkspace() {
    // Home breadcrumb link removed - location filter is now in header

    // Workspace Navigation - Use event delegation to handle dynamically added nav items
    // Remove existing listener if any (to prevent duplicates)
    const navContainer = document.querySelector('.sidebar-nav') || document.querySelector('.nav');
    if (navContainer) {
        // Remove old listener if it exists
        if (navContainer._navClickHandler) {
            navContainer.removeEventListener('click', navContainer._navClickHandler);
        }

        // Create new handler
        navContainer._navClickHandler = (e) => {
            const navItem = e.target.closest('.nav-item');
            if (!navItem) return;

            e.preventDefault();

            // Update active nav (both sidebar and mobile)
            document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(nav => nav.classList.remove('active'));
            navItem.classList.add('active');

            // Also update corresponding mobile nav item
            const section = navItem.dataset.section;
            if (section) {
                const mobileNavItem = document.querySelector(`.mobile-nav-item[data-section="${section}"]`);
                if (mobileNavItem) {
                    mobileNavItem.classList.add('active');
                }
            }

            // Get section ID
            if (!section) return;

            // Update breadcrumb
            if (typeof updateBreadcrumb === 'function') {
                updateBreadcrumb(section);
            }

            // Load page content
            if (typeof loadPageContent === 'function') {
                loadPageContent(section);
            }
        };

        // Attach listener
        navContainer.addEventListener('click', navContainer._navClickHandler);
    }

    // Initialize Mobile Bottom Navigation
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    if (mobileBottomNav) {
        // Update visibility based on settings
        if (typeof window.updateMobileBottomNavVisibility === 'function') {
            window.updateMobileBottomNavVisibility();
        }

        // Listen for window resize to update visibility
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (typeof window.updateMobileBottomNavVisibility === 'function') {
                    window.updateMobileBottomNavVisibility();
                }
            }, 250);
        });

        // Handle navigation item clicks
        mobileBottomNav.addEventListener('click', (e) => {
            const mobileNavItem = e.target.closest('.mobile-nav-item');
            if (!mobileNavItem) return;

            // Skip if it's the More button
            if (mobileNavItem.classList.contains('mobile-nav-more')) {
                return;
            }

            e.preventDefault();

            const section = mobileNavItem.dataset.section;
            if (!section) return;

            // Update active nav (both sidebar and mobile)
            document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(nav => nav.classList.remove('active'));
            mobileNavItem.classList.add('active');

            // Also update corresponding sidebar nav item
            const sidebarNavItem = document.querySelector(`.nav-item[data-section="${section}"]`);
            if (sidebarNavItem) {
                sidebarNavItem.classList.add('active');
            }

            // Update breadcrumb
            if (typeof updateBreadcrumb === 'function') {
                updateBreadcrumb(section);
            }

            // Load page content
            if (typeof loadPageContent === 'function') {
                loadPageContent(section);
            }

            // Close sidebar if open on mobile
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }

            // Close More menu if open
            const moreMenu = document.getElementById('mobile-more-menu');
            if (moreMenu && moreMenu.classList.contains('show')) {
                moreMenu.classList.remove('show');
            }
        });

        // Handle More menu button
        const moreBtn = document.getElementById('mobile-nav-more-btn');
        const moreMenu = document.getElementById('mobile-more-menu');
        const moreMenuClose = document.getElementById('mobile-more-menu-close');
        const moreMenuBackdrop = document.getElementById('mobile-more-menu-backdrop');

        if (moreBtn && moreMenu) {
            moreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                moreMenu.classList.add('show');
            });
        }

        if (moreMenuClose) {
            moreMenuClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                moreMenu.classList.remove('show');
            });
        }

        if (moreMenuBackdrop) {
            moreMenuBackdrop.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                moreMenu.classList.remove('show');
            });
        }

        // Handle More menu item clicks
        if (moreMenu) {
            moreMenu.addEventListener('click', (e) => {
                const menuItem = e.target.closest('.mobile-more-menu-item');
                if (!menuItem) return;

                e.preventDefault();
                e.stopPropagation();

                const section = menuItem.dataset.section;
                if (!section) return;

                // Close menu
                moreMenu.classList.remove('show');

                // Update active nav
                document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(nav => nav.classList.remove('active'));

                // Update sidebar nav
                const sidebarNavItem = document.querySelector(`.nav-item[data-section="${section}"]`);
                if (sidebarNavItem) {
                    sidebarNavItem.classList.add('active');
                }

                // Update breadcrumb
                if (typeof updateBreadcrumb === 'function') {
                    updateBreadcrumb(section);
                }

                // Load page content
                if (typeof loadPageContent === 'function') {
                    loadPageContent(section);
                }

                // Close sidebar if open on mobile
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            });
        }
    } else {
        // Fallback: direct attachment (for backwards compatibility)
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            // Skip if already has listener
            if (item._hasNavListener) return;
            item._hasNavListener = true;

            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active nav
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Get section ID
                const section = item.dataset.section;

                // Update breadcrumb
                if (typeof updateBreadcrumb === 'function') {
                    updateBreadcrumb(section);
                }

                // Load page content
                if (typeof loadPageContent === 'function') {
                    loadPageContent(section);
                }
            });
        });
    }


    // Navigation function for dashboard cards
    function navigateToSection(section) {
        const navItem = document.querySelector(`[data-section="${section}"]`);
        if (navItem) {
            navItem.click();
        } else if (typeof loadPageContent === 'function') {
            // If nav item doesn't exist, just load content
            updateBreadcrumb(section);
            loadPageContent(section);
        }
    }

    // Make navigateToSection globally available
    window.navigateToSection = navigateToSection;

    // Setup notification handlers (with duplicate prevention)
    function setupNotificationHandlers() {
        // Remove old listeners if they exist
        if (window._notificationBtnHandler) {
            const oldBtn = document.getElementById('notification-btn');
            if (oldBtn) {
                oldBtn.removeEventListener('click', window._notificationBtnHandler);
            }
        }
        if (window._notificationCloseHandler) {
            const oldCloseBtn = document.getElementById('close-notifications');
            if (oldCloseBtn) {
                oldCloseBtn.removeEventListener('click', window._notificationCloseHandler);
            }
        }
        if (window._notificationOutsideClickHandler) {
            document.removeEventListener('click', window._notificationOutsideClickHandler);
        }

        // Notification Toggle Button
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            window._notificationBtnHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('[Notifications] Button clicked');
                const notificationCenter = document.getElementById('notification-center');
                if (notificationCenter) {
                    const isShowing = notificationCenter.classList.contains('show');
                    console.log('[Notifications] Current state:', isShowing);
                    notificationCenter.classList.toggle('show');
                    console.log('[Notifications] New state:', notificationCenter.classList.contains('show'));

                    // Load notifications when opening the center
                    if (!isShowing) {
                        // Always reload notifications when opening to get latest
                        if (typeof loadNotifications === 'function') {
                            console.log('[Notifications] Loading notifications...');
                            loadNotifications().catch(error => {
                                console.error('[Notifications] Error loading notifications:', error);
                            });
                        } else {
                            console.warn('[Notifications] loadNotifications function not found');
                        }
                    }
                } else {
                    console.error('[Notifications] Notification center element not found');
                }
            };
            notificationBtn.addEventListener('click', window._notificationBtnHandler);
            console.log('[Notifications] Notification button handler attached');
        } else {
            console.warn('[Notifications] Notification button not found in DOM');
        }

        // Close Button
        const closeNotificationsBtn = document.getElementById('close-notifications');
        if (closeNotificationsBtn) {
            window._notificationCloseHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const notificationCenter = document.getElementById('notification-center');
                if (notificationCenter) {
                    notificationCenter.classList.remove('show');
                    console.log('[Notifications] Closed via close button');
                }
            };
            closeNotificationsBtn.addEventListener('click', window._notificationCloseHandler);
            console.log('[Notifications] Close button handler attached');
        }

        // Click Outside Handler
        window._notificationOutsideClickHandler = (e) => {
            const notificationCenter = document.getElementById('notification-center');
            const notificationBtn = document.getElementById('notification-btn');

            if (notificationCenter && notificationCenter.classList.contains('show')) {
                // Check if click is outside both the notification center and the button
                if (!notificationCenter.contains(e.target) &&
                    notificationBtn &&
                    !notificationBtn.contains(e.target)) {
                    notificationCenter.classList.remove('show');
                    console.log('[Notifications] Closed via outside click');
                }
            }
        };
        document.addEventListener('click', window._notificationOutsideClickHandler);
        console.log('[Notifications] Outside click handler attached');
    }

    // Setup notification handlers
    setupNotificationHandlers();

    // Make it globally available for re-initialization
    window.setupNotificationHandlers = setupNotificationHandlers;

    // Clear all notifications button
    const clearAllBtn = document.getElementById('clear-all-notifications');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (typeof clearAllNotifications === 'function') {
                await clearAllNotifications();
            }
        });
    }

    // Profile Dropdown - Initialize using the dedicated function
    initializeProfileDropdown();

    // Initialize mobile bottom nav visibility
    if (typeof window.updateMobileBottomNavVisibility === 'function') {
        window.updateMobileBottomNavVisibility();
    }
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            // Unsubscribe from notification listener
            if (window.notificationUnsubscribe) {
                window.notificationUnsubscribe();
                window.notificationUnsubscribe = null;
            }

            await signOut(auth);
            // Reset forms
            const onboardingForm = document.getElementById('onboarding-login-form');
            const clientForm = document.getElementById('client-login-form');
            if (onboardingForm) onboardingForm.reset();
            if (clientForm) clientForm.reset();

            const passwordChangeForm = document.getElementById('password-change-form');
            const licensingForm = document.getElementById('licensing-form');
            const campaignSetupForm = document.getElementById('campaign-setup-form');
            if (passwordChangeForm) passwordChangeForm.reset();
            if (licensingForm) licensingForm.reset();
            if (campaignSetupForm) campaignSetupForm.reset();

            currentUser = null;
            userEmail = null;
            campaignData = null;
            userSerialNumber = null;
            window.userEmail = null;
            window.campaignData = null;

            // Cleanup real-time listeners on logout
            if (window.cleanupAllRealtimeListeners) {
                window.cleanupAllRealtimeListeners();
            }

            // Show appropriate login screen
            await determineLoginScreen();
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');

        // Create overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        overlay.classList.toggle('active');
    });
}

// Initialize all event listeners
function init() {
    console.log('Initializing application...');
    initializeApplicationData();
    initializeEventListeners();
    initializeWorkspace();
    console.log('Application initialized');

    // Re-check onboarding form after a short delay to ensure it's ready
    setTimeout(() => {
        const onboardingForm = document.getElementById('onboarding-login-form');
        if (onboardingForm && !onboardingForm.hasAttribute('data-listener-attached')) {
            console.log('[init] Re-attaching onboarding form listener');
            attachOnboardingFormListener(onboardingForm);
        }
    }, 500);
}

// Track if we've received the initial auth state
let authStateInitialized = false;
let authStateResolver = null;
const authStatePromise = new Promise((resolve) => {
    authStateResolver = resolve;
});

// Remove loading-auth class from body once auth state is determined
function removeAuthLoadingClass() {
    document.body.classList.remove('loading-auth');
}

// Check Auth State with Client Code Validation
onAuthStateChanged(auth, async (user) => {
    console.log('[onAuthStateChanged] Auth state changed, user:', user ? user.email : 'null');

    // Handle initial auth state - don't hide loading if user is authenticated (will show workspace loading)
    if (!authStateInitialized) {
        authStateInitialized = true;

        // Only hide loading screen if no user (will show login)
        // If user exists, keep it showing for workspace loading with progress
        if (!user) {
            showLoading(false);
        } else {
            // User is authenticated - prepare loading screen for workspace update
            // Don't hide it yet, will be updated when workspace loads
            const loadingTitle = document.getElementById('loading-title');
            const loadingSubtitle = document.getElementById('loading-subtitle');
            if (loadingTitle) loadingTitle.textContent = 'Application Updating';
            if (loadingSubtitle && typeof getRandomMaldivianPoliticsFact === 'function') {
                loadingSubtitle.textContent = getRandomMaldivianPoliticsFact();
                loadingSubtitle.style.display = 'block';
            }
            // Ensure loading overlay is visible
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }
        }

        // Remove loading-auth class from body to allow screens to show
        removeAuthLoadingClass();

        // Resolve the promise so we know auth state is ready
        if (authStateResolver) {
            authStateResolver(user);
        }
    }

    if (user) {
        // Check if admin
        if (user.email === 'rixaski@gmail.com') {
            // Admin - redirect to admin panel
            window.location.href = 'admin.html';
            return;
        }

        // Restore client code from localStorage if available (persists across refreshes)
        const storedClientCode = localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');
        if (storedClientCode && !getClientCodeFromURL()) {
            // Restore code to URL if not present
            const newUrl = `${window.location.pathname}?code=${storedClientCode}`;
            window.history.replaceState({}, '', newUrl);
        }

        // Validate client code access (but don't sign out if user is already authenticated)
        const hasAccess = await checkClientCodeAccess();
        if (!hasAccess) {
            // If no access but user is authenticated, try to get code from client data
            try {
                const clientDoc = await getDoc(doc(db, 'clients', user.email));
                if (clientDoc.exists()) {
                    const clientData = clientDoc.data();
                    if (clientData.clientCode) {
                        // Store the client code for future use
                        localStorage.setItem('clientCode', clientData.clientCode);
                        sessionStorage.setItem('clientCode', clientData.clientCode);
                        // Restore to URL
                        const newUrl = `${window.location.pathname}?code=${clientData.clientCode}`;
                        window.history.replaceState({}, '', newUrl);
                    }
                }
            } catch (error) {
                console.warn('Could not retrieve client code from client document:', error);
            }
        }

        currentUser = user;
        userEmail = user.email;

        try {
            userEmail = user.email;
            window.userEmail = user.email;

            // Check client status
            let clientDoc;
            try {
                clientDoc = await getDoc(doc(db, 'clients', user.email));
            } catch (error) {
                console.error('[onAuthStateChanged] Error reading client document:', error);
                // If permission denied, it might be a rules issue - continue anyway
                if (error.code === 'permission-denied') {
                    console.warn('[onAuthStateChanged] Permission denied reading client document. Make sure Firestore rules are deployed.');
                    // Continue without client status check
                    clientDoc = {
                        exists: () => false
                    };
                } else {
                    throw error;
                }
            }

            if (clientDoc.exists()) {
                const clientData = clientDoc.data();
                if (clientData.isActive === false) {
                    await signOut(auth);
                    localStorage.removeItem('clientCode');
                    sessionStorage.removeItem('clientCode');
                    // Always use custom error dialog (dialog.js is loaded before app.js)
                    if (window.showErrorDialog) {
                        window.showErrorDialog('Your account has been suspended. Please contact your administrator.', 'Account Suspended');
                    } else {
                        // Fallback only if dialog system hasn't loaded yet - wait and retry
                        setTimeout(() => {
                            if (window.showErrorDialog) {
                                window.showErrorDialog('Your account has been suspended. Please contact your administrator.', 'Account Suspended');
                            } else if (window.showDialog) {
                                window.showDialog({
                                    type: 'error',
                                    title: 'Account Suspended',
                                    message: 'Your account has been suspended. Please contact your administrator.'
                                });
                            }
                        }, 500);
                    }
                    // Show login screen after sign out
                    await determineLoginScreen();
                    return;
                }
            }

            const userDoc = await getDoc(doc(db, 'users', user.email));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userSerialNumber = userData.serialNumber || null;
                const clientCode = localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');

                // Track session (non-blocking)
                if (clientCode) {
                    trackClientSession(user.email, clientCode).catch(err => {
                        console.warn('Session tracking error (non-critical):', err);
                    });
                    startSessionActivityTracking(user.email);
                }

                // Ensure loading class is removed before showing any screen
                removeAuthLoadingClass();

                if (!userData.passwordChanged) {
                    showScreen('password-change-screen');
                } else if (!userData.serialNumber) {
                    document.getElementById('licensing-email').value = user.email;
                    showScreen('licensing-screen');
                } else if (!userData.campaignSet) {
                    showScreen('campaign-setup-screen');
                } else {
                    // Ensure loading screen is showing with correct title and random fact
                    const loadingOverlay = document.getElementById('loading-overlay');
                    const loadingTitle = document.getElementById('loading-title');
                    const loadingSubtitle = document.getElementById('loading-subtitle');

                    if (loadingTitle) loadingTitle.textContent = 'Application Updating';
                    if (loadingSubtitle && typeof getRandomMaldivianPoliticsFact === 'function') {
                        loadingSubtitle.textContent = getRandomMaldivianPoliticsFact();
                        loadingSubtitle.style.display = 'block';

                        // Start rotating facts every 3 seconds
                        if (factRotationInterval) {
                            clearInterval(factRotationInterval);
                        }
                        factRotationInterval = setInterval(() => {
                            if (loadingSubtitle && typeof getRandomMaldivianPoliticsFact === 'function') {
                                loadingSubtitle.textContent = getRandomMaldivianPoliticsFact();
                            }
                        }, 3000);
                    }

                    // Ensure loading overlay is visible (don't hide/show, just ensure it's visible)
                    if (loadingOverlay) {
                        loadingOverlay.classList.add('active');
                    }

                    // Component progress tracking removed - using main loading progress only

                    // Remove loading-auth class to allow workspace screen to show
                    removeAuthLoadingClass();

                    await loadWorkspace(userData);
                }
            } else {
                // User document doesn't exist - show login
                await determineLoginScreen();
            }
        } catch (error) {
            console.error('Error checking user state:', error);
            // On error, show login screen
            await determineLoginScreen();
        }
    } else {
        // No user logged in - determine which login screen to show
        // Make sure loading class is removed before showing login
        removeAuthLoadingClass();
        await determineLoginScreen();
    }
});

// Determine which login screen to show (onboarding vs regular)
async function determineLoginScreen() {
    try {
        // Ensure loading class is removed
        removeAuthLoadingClass();

        // Check if client code is in URL, localStorage, or sessionStorage
        const clientCode = getClientCodeFromURL() || localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');
        if (!clientCode) {
            // No client code - show regular login (will prompt for client code)
            showScreen('client-login-screen');
            return;
        }

        // Try to get client info to determine if onboarding is complete
        // For now, default to regular login screen
        // The system will redirect to onboarding if needed
        showScreen('client-login-screen');
    } catch (error) {
        console.error('Error determining login screen:', error);
        // Default to regular login screen
        removeAuthLoadingClass();
        showScreen('client-login-screen');
    }
}

// Get client code from URL
function getClientCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code') || null;
}

// Check client code on page load
window.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Check if this is an officer ballot view request
        const urlParams = new URLSearchParams(window.location.search);
        const ballotId = urlParams.get('ballot');
        const token = urlParams.get('token');

        if (ballotId && token) {
            // This is an officer view request - handle it separately
            await handleOfficerBallotView(ballotId, token);
            return;
        }

        // Show loading screen while checking auth state
        showLoading(true, {
            title: 'Loading...',
            subtitle: 'Checking authentication'
        });

        // Wait for auth state to initialize before showing login
        try {
            // Wait for auth state check (with timeout fallback - max 3 seconds)
            const authCheckPromise = authStatePromise;
            const timeoutPromise = new Promise(resolve => setTimeout(() => {
                console.log('[DOMContentLoaded] Auth state check timeout - proceeding anyway');
                removeAuthLoadingClass();
                showLoading(false);
                resolve(null);
            }, 3000));

            await Promise.race([authCheckPromise, timeoutPromise]);

            // Check for client code and preserve it in URL (non-blocking)
            const urlParams = new URLSearchParams(window.location.search);
            const codeInUrl = urlParams.get('code');

            if (codeInUrl) {
                console.log('[DOMContentLoaded] Client code found in URL:', codeInUrl);
                // Validate and store, but keep code in URL (non-blocking)
                checkClientCodeAccess().catch(err => {
                    console.warn('Client code validation error (non-critical):', err);
                });
            } else {
                // No code in URL - check localStorage first, then sessionStorage
                const storedCode = localStorage.getItem('clientCode') || sessionStorage.getItem('clientCode');
                if (storedCode) {
                    console.log('[DOMContentLoaded] Restoring client code to URL:', storedCode);
                    // Restore code to URL
                    const newUrl = window.location.pathname + (window.location.search ? window.location.search + '&' : '?') + `code=${storedCode}`;
                    window.history.replaceState({}, '', newUrl);
                    // Ensure it's in both storages
                    localStorage.setItem('clientCode', storedCode);
                    sessionStorage.setItem('clientCode', storedCode);
                }
                // Validate client code (non-blocking)
                checkClientCodeAccess().catch(err => {
                    console.warn('Client code validation error (non-critical):', err);
                });
            }

            // If auth state is not initialized yet and no user, wait a bit more
            if (!authStateInitialized && !auth.currentUser) {
                // Wait a bit more for auth state (fallback)
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!authStateInitialized) {
                    // Still not initialized - remove loading class and show login
                    removeAuthLoadingClass();
                    showLoading(false);
                    await determineLoginScreen();
                }
            }
        } catch (error) {
            console.error('[DOMContentLoaded] Error during initialization:', error);
            // On error, show login screen
            removeAuthLoadingClass();
            showLoading(false);
            await determineLoginScreen();
        }
    }
});

// Handle officer ballot view (no authentication required - only temporary password)
async function handleOfficerBallotView(ballotId, token) {
    // Show loading screen immediately
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const loadingScreen = document.getElementById('officer-loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('active');
    }

    try {
        // Initialize database without requiring authentication
        // Officers don't need Firebase Auth - they use temporary password only
        if (!app) {
            showOfficerError('Firebase not initialized. Please refresh the page.');
            return;
        }

        // Initialize db if not already initialized (without auth requirement)
        if (!db && !window.db) {
            const {
                getFirestore
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            db = getFirestore(app);
            window.db = db;
        }

        // Ensure db is available (check both local and window.db)
        const database = db || window.db;
        if (!database) {
            console.error('[handleOfficerBallotView] Database not initialized');
            showOfficerError('Database not initialized. Please refresh the page and try again.');
            return;
        }

        // Import Firebase functions
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify ballot and token
        const ballotRef = doc(database, 'ballots', ballotId);
        const ballotSnap = await getDoc(ballotRef);

        if (!ballotSnap.exists()) {
            showOfficerError('Invalid ballot link. The ballot may have been deleted.');
            return;
        }

        const ballotData = ballotSnap.data();

        // Verify token matches
        if (ballotData.shareToken !== token) {
            showOfficerError('Invalid access token. This link may have expired or been revoked.');
            return;
        }

        // Check if password is required - if not set, allow access without password (for backward compatibility)
        // But we'll still show the password screen (it will accept empty password)
        if (!ballotData.officerPassword) {
            console.warn('[handleOfficerBallotView] Ballot does not have password configured - allowing access without password');
        }

        // Store ballot info for password verification
        window.officerBallotInfo = {
            ballotId: ballotId,
            ballotData: ballotData,
            token: token
        };

        // Wait for DOM to be ready if needed
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Hide loading screen and show password entry screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const passwordScreen = document.getElementById('officer-password-screen');
        if (!passwordScreen) {
            console.error('[handleOfficerBallotView] Password screen element not found');
            showOfficerError('Page elements not loaded. Please refresh the page and try again.');
            return;
        }

        passwordScreen.classList.add('active');
        setupOfficerPasswordForm(ballotId, ballotData);

    } catch (error) {
        console.error('Error handling officer ballot view:', error);
        console.error('Error details:', error.message, error.stack);
        showOfficerError(`Failed to load ballot view: ${error.message || 'Unknown error'}. Please check the link and try again.`);
    }
}

// Setup officer password form
function setupOfficerPasswordForm(ballotId, ballotData) {
    const form = document.getElementById('officer-password-form');
    const passwordInput = document.getElementById('officer-password-input');
    const errorDiv = document.getElementById('officer-password-error');

    if (!form || !passwordInput) return;

    // Clear previous state
    passwordInput.value = '';
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    // Focus on password input
    setTimeout(() => passwordInput.focus(), 100);

    // Handle form submission
    form.onsubmit = async (e) => {
        e.preventDefault();

        const enteredPassword = passwordInput.value.trim().toUpperCase();
        const correctPassword = (ballotData.officerPassword || '').toUpperCase();

        // If ballot has no password configured, allow access without password
        if (!ballotData.officerPassword) {
            // Allow access without password for backward compatibility
        } else {
            // Password is required
            if (!enteredPassword) {
                if (errorDiv) {
                    errorDiv.textContent = 'Please enter the password.';
                    errorDiv.style.display = 'block';
                }
                return;
            }

            if (enteredPassword !== correctPassword) {
                if (errorDiv) {
                    errorDiv.textContent = 'Incorrect password. Please try again.';
                    errorDiv.style.display = 'block';
                }
                passwordInput.value = '';
                passwordInput.focus();
                return;
            }
        }

        // Password is correct - show ballot list
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const officerScreen = document.getElementById('officer-ballot-screen');
        if (officerScreen) {
            officerScreen.classList.add('active');
        }

        // Load ballot data for officer view
        if (window.loadOfficerBallotView) {
            await window.loadOfficerBallotView(ballotId, ballotData);
        }

        // Set up real-time listener for ballot status changes
        setupBallotStatusListener(ballotId);
    };
}

// Show error message for officer view
function showOfficerError(message) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--light-color);">
            <div style="background: var(--white); padding: 40px; border-radius: 16px; box-shadow: var(--shadow-lg); max-width: 500px; text-align: center;">
                <h2 style="color: var(--danger-color); margin-bottom: 20px;">Error</h2>
                <p style="color: var(--text-color); margin-bottom: 30px;">${message}</p>
                <button onclick="window.location.href='index.html'" class="btn-primary">Go to Home</button>
            </div>
        </div>
    `;
}

// Setup real-time listener for ballot status changes
function setupBallotStatusListener(ballotId) {
    if (!db) return;

    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js').then(({
        doc,
        onSnapshot
    }) => {
        const ballotRef = doc(db, 'ballots', ballotId);

        onSnapshot(ballotRef, (snapshot) => {
            if (snapshot.exists()) {
                const ballotData = snapshot.data();
                const status = ballotData.status || 'open';

                // Update UI based on status
                if (window.updateOfficerBallotStatus) {
                    window.updateOfficerBallotStatus(status);
                }

                // Show notification for status changes
                if (window.showBallotStatusNotification) {
                    window.showBallotStatusNotification(status);
                }
            }
        });
    });
}

// Initialize SVG Icons
function initIcons() {
    if (typeof icons === 'undefined') return;

    // Replace all data-icon attributes with SVG
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        if (icons[iconName]) {
            el.innerHTML = icons[iconName];
        }
    });
}

// Initialize everything when DOM is ready
// Note: Don't show login screen here - wait for auth state check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded');
        initIcons();
        init();
    });
} else {
    console.log('DOM already loaded');
    initIcons();
    init();
}

// Make initIcons globally available
window.initIcons = initIcons;

// Make page tracking functions globally available
window.trackPageLoad = trackPageLoad;
window.startPageTracking = startPageTracking;
window.stopPageTracking = stopPageTracking;

// Prompt for access code when accessing via call link
async function promptCallLinkAccessCode(linkId) {
    if (!window.db) {
        console.error('[promptCallLinkAccessCode] Database not initialized');
        // Wait a bit and retry
        setTimeout(() => {
            if (window.db) {
                promptCallLinkAccessCode(linkId);
            } else {
                if (window.showError) {
                    window.showError('Database not initialized. Please refresh the page.');
                }
            }
        }, 1000);
        return;
    }

    console.log('[promptCallLinkAccessCode] Prompting for access code, linkId:', linkId);

    // Create access code entry modal
    const modalOverlay = window.ensureModalExists ? window.ensureModalExists() : null;
    if (!modalOverlay) {
        console.error('[promptCallLinkAccessCode] Modal system not available');
        if (window.showError) {
            window.showError('Modal system not available.');
        }
        return;
    }

    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    if (!modalBody || !modalTitle) {
        if (window.showError) {
            window.showError('Modal elements not found.');
        }
        return;
    }

    modalTitle.textContent = 'Enter Access Code';
    modalBody.innerHTML = `
        <div class="modal-form">
            <div class="form-group">
                <label for="call-link-access-code">Access Code *</label>
                <input type="text" id="call-link-access-code" placeholder="Enter 6-digit access code" maxlength="6" pattern="[0-9]{6}" required style="font-size: 18px; font-family: monospace; letter-spacing: 4px; text-align: center; font-weight: 600;">
                <small style="color: var(--text-light); font-size: 12px; margin-top: 5px; display: block;">Please enter the access code provided with the link.</small>
            </div>
            <div id="call-link-verify-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal(); window.location.href = window.location.pathname;">Cancel</button>
                <button type="button" class="btn-primary btn-compact" onclick="verifyCallLinkAccessCode('${linkId}')">Verify & Continue</button>
            </div>
        </div>
    `;

    // Show modal
    modalOverlay.style.display = 'flex';
    if (document.body) {
        document.body.style.overflow = 'hidden';
    }

    // Focus on input and allow Enter key
    setTimeout(() => {
        const codeInput = document.getElementById('call-link-access-code');
        if (codeInput) {
            codeInput.focus();
            codeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    verifyCallLinkAccessCode(linkId);
                }
            });
        }
    }, 100);
}

// Verify access code and store link data
async function verifyCallLinkAccessCode(linkId) {
    if (!window.db) return;

    const codeInput = document.getElementById('call-link-access-code');
    const errorDiv = document.getElementById('call-link-verify-error');

    if (!codeInput) return;

    const accessCode = codeInput.value.trim();

    if (!accessCode || accessCode.length !== 6) {
        if (errorDiv) {
            errorDiv.textContent = 'Please enter a valid 6-digit access code.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        console.log('[verifyCallLinkAccessCode] Verifying link:', linkId);
        console.log('[verifyCallLinkAccessCode] Access code entered:', accessCode);

        const linkRef = doc(window.db, 'callLinks', linkId);
        const linkDoc = await getDoc(linkRef);

        console.log('[verifyCallLinkAccessCode] Link document exists:', linkDoc.exists());

        if (linkDoc.exists()) {
            const linkData = linkDoc.data();
            console.log('[verifyCallLinkAccessCode] Link data retrieved:', {
                hasAccessCode: !!linkData.accessCode,
                hasCallerNames: !!linkData.callerNames,
                campaignEmail: linkData.campaignEmail
            });

            if (linkData.accessCode === accessCode) {
                // Store link info globally
                window.callLinkData = {
                    linkId: linkId,
                    accessCode: accessCode,
                    callerNames: linkData.callerNames || []
                };

                // Set flag to indicate link access
                window.isCallLinkAccess = true;

                // Hide sidebar and top navigation for link access
                const sidebar = document.getElementById('sidebar');
                const topNav = document.getElementById('top-nav');
                if (sidebar) sidebar.style.display = 'none';
                if (topNav) topNav.style.display = 'none';

                // Close modal
                if (window.closeModal) {
                    window.closeModal();
                }

                // Auto-navigate to calls page
                setTimeout(() => {
                    if (window.loadPageContent) {
                        window.loadPageContent('calls');
                        if (window.updateBreadcrumb) {
                            window.updateBreadcrumb('calls');
                        }
                    }
                }, 500);
            } else {
                if (errorDiv) {
                    errorDiv.textContent = 'Invalid access code. Please check and try again.';
                    errorDiv.style.display = 'block';
                }
                codeInput.focus();
                codeInput.select();
            }
        } else {
            console.error('[verifyCallLinkAccessCode] Link document does not exist:', linkId);
            if (errorDiv) {
                errorDiv.textContent = 'Invalid call link. Please check the link and try again.';
                errorDiv.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('[verifyCallLinkAccessCode] Error verifying call link:', error);
        console.error('[verifyCallLinkAccessCode] Error code:', error.code);
        console.error('[verifyCallLinkAccessCode] Error message:', error.message);

        let errorMessage = 'Failed to verify access code. Please try again.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. Please check the link and try again.';
        } else if (error.code === 'not-found') {
            errorMessage = 'Link not found. The link may be invalid or expired.';
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }

        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        }
    }
}

// Make functions globally available
window.verifyCallLinkAccessCode = verifyCallLinkAccessCode;

// Update profile display with user information
function updateProfileDisplay(userData) {
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileInitials = document.getElementById('profile-initials');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileMenuName = document.getElementById('profile-menu-name');
    const profileMenuEmail = document.getElementById('profile-menu-email');
    const profileMenuInitials = document.getElementById('profile-menu-initials');
    const profileMenuAvatar = document.getElementById('profile-menu-avatar');

    // Get user email
    const email = userEmail || (userData && userData.email) || 'user@example.com';
    // Use email for profile name, not campaign name
    const name = email.split('@')[0] || 'User';

    // Generate initials
    const getInitials = (str) => {
        if (!str) return 'U';
        const words = str.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(name);

    // Update profile trigger
    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = email;
    if (profileInitials) profileInitials.textContent = initials;

    // Update profile menu
    if (profileMenuName) profileMenuName.textContent = name;
    if (profileMenuEmail) profileMenuEmail.textContent = email;
    if (profileMenuInitials) profileMenuInitials.textContent = initials;

    // Generate gradient color based on name
    const generateColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            ['rgba(111, 193, 218, 0.9)', 'rgba(141, 212, 232, 0.85)'],
            ['rgba(8, 145, 178, 0.9)', 'rgba(6, 182, 212, 0.85)'],
            ['rgba(5, 150, 105, 0.9)', 'rgba(16, 185, 129, 0.85)'],
            ['rgba(220, 38, 38, 0.9)', 'rgba(239, 68, 68, 0.85)'],
            ['rgba(217, 119, 6, 0.9)', 'rgba(245, 158, 11, 0.85)'],
        ];
        return colors[Math.abs(hash) % colors.length];
    };

    const [color1, color2] = generateColor(name);
    if (profileAvatar) {
        profileAvatar.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }
    if (profileMenuAvatar) {
        profileMenuAvatar.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }
}

// Initialize Profile Dropdown (modern implementation)
function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const profileMenu = document.getElementById('profile-menu');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (!profileBtn || !profileMenu || !profileDropdown) {
        console.warn('[Profile Dropdown] Profile elements not found', {
            btn: !!profileBtn,
            menu: !!profileMenu,
            dropdown: !!profileDropdown
        });
        return false;
    }

    // Only attach click listener once
    if (!profileBtn.hasAttribute('data-listener-attached')) {
        profileBtn.setAttribute('data-listener-attached', 'true');

        // Button click handler
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            const isShowing = profileMenu.classList.contains('show');

            // Close all other dropdowns first
            document.querySelectorAll('.profile-menu.show, .dropdown-menu.show').forEach(menu => {
                if (menu !== profileMenu) {
                    menu.classList.remove('show');
                    menu.closest('.profile-dropdown').classList.remove('active');
                }
            });

            // Toggle this dropdown
            if (isShowing) {
                profileMenu.classList.remove('show');
                profileDropdown.classList.remove('active');
            } else {
                profileMenu.classList.add('show');
                profileDropdown.classList.add('active');
            }
        });
        console.log('[Profile Dropdown] Click listener attached');
    }

    // Click outside to close - remove old handler if exists, then add new one
    if (window.profileDropdownClickHandler) {
        document.removeEventListener('click', window.profileDropdownClickHandler, true);
    }

    window.profileDropdownClickHandler = function(e) {
        // Check if click is outside the profile dropdown area
        if (!profileDropdown.contains(e.target)) {
            if (profileMenu && profileMenu.classList.contains('show')) {
                profileMenu.classList.remove('show');
                profileDropdown.classList.remove('active');
            }
        }
    };

    // Use capture phase to ensure it runs before other handlers
    document.addEventListener('click', window.profileDropdownClickHandler, true);
    console.log('[Profile Dropdown] Outside click handler attached');

    // Also handle Escape key
    if (!window.profileDropdownEscapeHandler) {
        window.profileDropdownEscapeHandler = function(e) {
            if (e.key === 'Escape' && profileMenu && profileMenu.classList.contains('show')) {
                profileMenu.classList.remove('show');
                profileDropdown.classList.remove('active');
            }
        };
        document.addEventListener('keydown', window.profileDropdownEscapeHandler);
    }

    // Add click handlers for menu items
    const profileMenuItem = document.getElementById('profile-menu-profile');
    const settingsMenuItem = document.getElementById('profile-menu-settings');
    const logoutMenuItem = document.getElementById('logout-btn');

    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            profileMenu.classList.remove('show');
            profileDropdown.classList.remove('active');
            // Navigate to settings page
            if (typeof loadPageContent === 'function') {
                loadPageContent('settings');
                // Update breadcrumb
                if (typeof updateBreadcrumb === 'function') {
                    updateBreadcrumb('settings');
                }
            } else if (typeof navigateToSection === 'function') {
                navigateToSection('settings');
            }
        });
    }

    if (settingsMenuItem) {
        settingsMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            profileMenu.classList.remove('show');
            profileDropdown.classList.remove('active');
            // Navigate to settings page
            if (typeof loadPageContent === 'function') {
                loadPageContent('settings');
                // Update breadcrumb
                if (typeof updateBreadcrumb === 'function') {
                    updateBreadcrumb('settings');
                }
            } else if (typeof navigateToSection === 'function') {
                navigateToSection('settings');
            }
        });
    }

    if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            profileMenu.classList.remove('show');
            profileDropdown.classList.remove('active');
            // Logout will be handled by existing logout handler
        });
    }

    // Update profile display with current user data
    if (userEmail && typeof db !== 'undefined') {
        getDoc(doc(db, 'clients', userEmail)).then(docSnap => {
            if (docSnap.exists()) {
                updateProfileDisplay(docSnap.data());
            } else {
                updateProfileDisplay({
                    email: userEmail
                });
            }
        }).catch(() => {
            updateProfileDisplay({
                email: userEmail
            });
        });
    } else if (userEmail) {
        updateProfileDisplay({
            email: userEmail
        });
    }

    window.profileDropdownInitialized = true;
    console.log('[Profile Dropdown] Initialized successfully');
    return true;
}

// Try to initialize profile dropdown when workspace screen becomes visible
let profileDropdownObserver = null;

function setupProfileDropdownObserver() {
    if (profileDropdownObserver) {
        return; // Already set up
    }

    profileDropdownObserver = new MutationObserver(() => {
        const workspaceScreen = document.getElementById('workspace-screen');
        if (workspaceScreen && workspaceScreen.style.display !== 'none' && workspaceScreen.style.display !== '') {
            // Only initialize if not already initialized or if elements are available
            if (!window.profileDropdownInitialized) {
                initializeProfileDropdown();
            }
        }
    });

    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const workspaceScreen = document.getElementById('workspace-screen');
            if (workspaceScreen) {
                profileDropdownObserver.observe(workspaceScreen, {
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
            // Try multiple times to ensure it works
            setTimeout(() => initializeProfileDropdown(), 100);
            setTimeout(() => initializeProfileDropdown(), 500);
            setTimeout(() => initializeProfileDropdown(), 1000);
        });
    } else {
        const workspaceScreen = document.getElementById('workspace-screen');
        if (workspaceScreen) {
            profileDropdownObserver.observe(workspaceScreen, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
        // Try multiple times to ensure it works
        setTimeout(() => initializeProfileDropdown(), 100);
        setTimeout(() => initializeProfileDropdown(), 500);
        setTimeout(() => initializeProfileDropdown(), 1000);
    }
}

// Setup observer
setupProfileDropdownObserver();