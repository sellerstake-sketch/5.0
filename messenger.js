// Messenger Chatbox Functionality

// Import Firebase modules
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    getDocs,
    getFirestore
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
    onAuthStateChanged,
    getAuth
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    initializeApp,
    getApps
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase Configuration (same as app.js)
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

// Initialize Firebase instances (reuse if already initialized)
let app, auth, db, storage;
const apps = getApps();
if (apps.length > 0) {
    app = apps[0];
} else {
    app = initializeApp(firebaseConfig);
}
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// File attachment state
let attachedFiles = [];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for small files
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

let currentUser = null;
let userEmail = null;
let userSerialNumber = null;
let messengerEnabled = false;
let selectedUserId = null;
let onlineUsers = [];
let unreadCount = 0;
let seenMessageIds = new Set(); // Track messages that have been seen to avoid duplicate notifications

// Initialize Messenger
function initMessenger() {
    // Check if messenger is enabled in localStorage
    const savedSetting = localStorage.getItem('messengerEnabled');
    messengerEnabled = savedSetting === 'true';

    // Check if we're in admin mode
    const isAdminMode = window.location.pathname.includes('admin.html') ||
        (window.currentUser && window.currentUser.email === 'rixaski@gmail.com');

    // Auto-enable messenger for admin
    if (isAdminMode) {
        messengerEnabled = true;
        localStorage.setItem('messengerEnabled', 'true');
    }

    updateMessengerVisibility();

    // Setup event listeners
    setupMessengerListeners();

    // Setup header button click handler
    setupMessengerHeaderButton();

    // Check if we're in agent portal mode
    const isAgentPortal = window.agentData && window.campaignEmail;

    if (isAgentPortal) {
        // Agent portal: Enable messenger automatically and load Campaign Manager
        messengerEnabled = true;
        updateMessengerVisibility();

        // Set agent email for messaging (must match the format used in onlineUsers: agent_${id})
        // This format is used to create conversation IDs consistently
        if (window.agentData && window.agentData.id) {
            userEmail = `agent_${window.agentData.id}`;
        } else {
            console.error('[Messenger] Agent ID not found in agentData:', {
                agentData: window.agentData,
                hasId: !!(window.agentData && window.agentData.id)
            });
            // Don't return - try to continue with what we have
            if (window.agentData) {
                userEmail = `agent_${window.agentData.agentAccessCode || 'unknown'}`;
                console.warn('[Messenger] Using agentAccessCode as fallback:', userEmail);
            } else {
                console.error('[Messenger] Cannot initialize - no agent data available');
                return;
            }
        }
        userSerialNumber = null; // Agents don't use serial numbers

        // Set currentUser for agent (needed for some checks)
        // Create a minimal user object for agents
        currentUser = {
            email: userEmail,
            uid: window.agentData.id || userEmail
        };

        console.log('[Messenger] Agent portal initialized:', {
            userEmail,
            agentId: window.agentData.id,
            campaignEmail: window.campaignEmail,
            agentData: window.agentData
        });

        // Set up presence tracking for agent
        setupPresenceTrackingForAgent();

        // Load online users (Campaign Manager + other agents)
        loadOnlineUsers().catch(error => {
            console.error('[Messenger] Error loading online users:', error);
        });

        // Listen for messages (agent-specific)
        listenForMessages();
    } else if (isAdminMode) {
        // Admin mode: Enable messenger automatically
        messengerEnabled = true;
        updateMessengerVisibility();

        // Set admin email
        onAuthStateChanged(auth, async (user) => {
            if (user && user.email === 'rixaski@gmail.com') {
                currentUser = user;
                userEmail = user.email;
                userSerialNumber = 'ADMIN'; // Special identifier for admin

                // Setup presence tracking for admin
                await setupPresenceTracking();
                loadOnlineUsers();
                listenForMessages();
            }
        });
    } else {
        // Normal client portal: Use auth state
        // Listen for auth state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                userEmail = user.email;

                // Get user data including serial number
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.email));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        userSerialNumber = userData.serialNumber;

                        if (messengerEnabled && userSerialNumber) {
                            setupPresenceTracking();
                            loadOnlineUsers();
                            listenForMessages();
                        }
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            }
        });
    }
}

// Setup header button click handler (Facebook Messenger style)
function setupMessengerHeaderButton() {
    const headerBtn = document.getElementById('messenger-header-btn');
    if (headerBtn) {
        // Remove any existing listeners by cloning
        const newBtn = headerBtn.cloneNode(true);
        headerBtn.parentNode.replaceChild(newBtn, headerBtn);

        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatWindow = document.getElementById('messenger-chat-window');
            if (chatWindow) {
                const isOpen = chatWindow.classList.contains('open');
                if (isOpen) {
                    chatWindow.classList.remove('open');
                    selectedUserId = null;
                    // Clear messages when closing
                    const messagesContainer = document.getElementById('chat-messages');
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                    }
                } else {
                    chatWindow.classList.add('open');
                    // Always show user list when opening (if no user selected)
                    if (!selectedUserId) {
                        showUsersInChatWindow();
                    }
                }
            }
        });

        // Close messenger when clicking outside (Facebook Messenger style)
        document.addEventListener('click', (e) => {
            const chatWindow = document.getElementById('messenger-chat-window');
            if (chatWindow && chatWindow.classList.contains('open')) {
                if (!chatWindow.contains(e.target) && !newBtn.contains(e.target)) {
                    chatWindow.classList.remove('open');
                    selectedUserId = null;
                    const messagesContainer = document.getElementById('chat-messages');
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                    }
                }
            }
        });
        console.log('[Messenger] Header button handler attached');
    }
}

// Setup event listeners
function setupMessengerListeners() {
    // Old toggle button (if exists) - for backward compatibility
    const toggleBtn = document.getElementById('messenger-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const chatWindow = document.getElementById('messenger-chat-window');

            if (chatWindow) {
                const isOpen = chatWindow.classList.contains('open');
                if (isOpen) {
                    chatWindow.classList.remove('open');
                    selectedUserId = null;
                    // Clear messages when closing
                    const messagesContainer = document.getElementById('chat-messages');
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                    }
                } else {
                    chatWindow.classList.add('open');
                    // Always show user list when opening (if no user selected)
                    if (!selectedUserId) {
                        showUsersInChatWindow();
                    }
                }
            }
        });
    }

    // Close button - closes chat window (handle multiple close buttons)
    const closeBtns = document.querySelectorAll('#messenger-close-btn, #messenger-chat-close-btn, #messenger-container-close-btn');
    closeBtns.forEach(closeBtn => {
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatWindow = document.getElementById('messenger-chat-window');
                if (chatWindow) {
                    chatWindow.classList.remove('open');
                    selectedUserId = null;
                    const messagesContainer = document.getElementById('chat-messages');
                    if (messagesContainer) {
                        messagesContainer.innerHTML = '';
                    }
                }
            });
        }
    });

    // Chat back button - goes back to user list
    const backBtn = document.getElementById('chat-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            selectedUserId = null;
            showUsersInChatWindow();
        });
    }

    // Send message button
    const sendBtn = document.getElementById('chat-send-btn');
    const messageInput = document.getElementById('chat-message-input');

    if (sendBtn && messageInput) {
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // File attachment
    const fileInput = document.getElementById('chat-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Settings toggle
    document.addEventListener('click', (e) => {
        if (e.target.id === 'messenger-enabled-toggle' || e.target.closest('#messenger-enabled-toggle')) {
            const toggle = document.getElementById('messenger-enabled-toggle');
            if (toggle) {
                messengerEnabled = toggle.checked;
                localStorage.setItem('messengerEnabled', messengerEnabled.toString());
                updateMessengerVisibility();

                if (messengerEnabled && userSerialNumber) {
                    setupPresenceTracking();
                    loadOnlineUsers();
                    listenForMessages();
                } else {
                    // Disable presence tracking
                    updateUserPresence(false);
                }
            }
        }
    });

    // Search functionality
    const searchInput = document.getElementById('messenger-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterUsers(e.target.value);
        });
    }
}

// Update messenger visibility based on settings
function updateMessengerVisibility() {
    const headerBtn = document.getElementById('messenger-header-btn');
    const chatWindow = document.getElementById('messenger-chat-window');
    const settingsToggle = document.getElementById('messenger-enabled-toggle');

    if (messengerEnabled) {
        // Show header button only when messenger is enabled
        if (headerBtn) {
            headerBtn.style.display = 'flex';
        }
        if (chatWindow) chatWindow.style.display = 'flex';
    } else {
        // Hide header button when messenger is disabled
        if (headerBtn) {
            headerBtn.style.display = 'none';
        }
        if (chatWindow) {
            chatWindow.classList.remove('open');
            chatWindow.style.display = 'none';
        }
    }

    if (settingsToggle) {
        settingsToggle.checked = messengerEnabled;
    }

    console.log('[Messenger] Visibility updated:', {
        messengerEnabled,
        headerBtnVisible: headerBtn && headerBtn.style.display !== 'none'
    });
}

// Setup presence tracking
async function setupPresenceTracking() {
    if (!currentUser || !userEmail) return;

    // For admin, use special handling
    const isAdminMode = userSerialNumber === 'ADMIN' || userEmail === 'rixaski@gmail.com';

    if (isAdminMode) {
        // Ensure admin user document exists
        const userRef = doc(db, 'users', userEmail);
        try {
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    email: userEmail,
                    name: 'Support',
                    isOnline: true,
                    lastSeen: serverTimestamp(),
                    serialNumber: 'ADMIN'
                });
            } else {
                await updateDoc(userRef, {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error setting up admin presence:', error);
        }
    } else if (userSerialNumber) {
        const userRef = doc(db, 'users', userEmail);

        // Set user as online
        await updateDoc(userRef, {
            isOnline: true,
            lastSeen: serverTimestamp()
        });
    }

    // Update when user goes offline
    window.addEventListener('beforeunload', async () => {
        try {
            const userRef = doc(db, 'users', userEmail);
            await updateDoc(userRef, {
                isOnline: false,
                lastSeen: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating offline status:', error);
        }
    });
}

// Setup presence tracking for agents (uses agent_${id} format)
async function setupPresenceTrackingForAgent() {
    if (!userEmail || !userEmail.startsWith('agent_')) return;

    try {
        const userRef = doc(db, 'users', userEmail);

        // Check if document exists, create if not
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            // Create agent user document
            await setDoc(userRef, {
                email: window.agentData.email || window.campaignEmail,
                name: window.agentData.name || 'Agent',
                isOnline: true,
                lastSeen: serverTimestamp(),
                agentId: window.agentData.id || null,
                agentAccessCode: window.agentData.agentAccessCode || null
            });
            console.log('[Messenger] Created agent user document:', userEmail);
        } else {
            // Update existing document
            await updateDoc(userRef, {
                isOnline: true,
                lastSeen: serverTimestamp()
            });
        }

        // Update periodically to keep agent online
        const presenceInterval = setInterval(async () => {
            try {
                await updateDoc(userRef, {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
            } catch (error) {
                console.error('[Messenger] Error updating agent presence:', error);
            }
        }, 30000); // Update every 30 seconds

        // Update when user goes offline
        window.addEventListener('beforeunload', async () => {
            clearInterval(presenceInterval);
            try {
                await updateDoc(userRef, {
                    isOnline: false,
                    lastSeen: serverTimestamp()
                });
            } catch (error) {
                console.error('[Messenger] Error updating agent offline status:', error);
            }
        });

        // Store interval for cleanup
        window.agentPresenceInterval = presenceInterval;
    } catch (error) {
        console.error('[Messenger] Error setting up agent presence:', error);
    }
}

// Update user presence
async function updateUserPresence(isOnline) {
    if (!currentUser || !userEmail) return;

    try {
        const userRef = doc(db, 'users', userEmail);
        await updateDoc(userRef, {
            isOnline: isOnline,
            lastSeen: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating presence:', error);
    }
}

// Load online users with same serial number
async function loadOnlineUsers() {
    // Check if we're in agent portal mode
    const isAgentPortal = window.agentData && window.campaignEmail;

    if (isAgentPortal) {
        // Agent portal mode: Load Campaign Manager and other agents
        await loadOnlineUsersForAgent();
    } else if (userSerialNumber) {
        // Normal client portal mode: Load users by serial number
        await loadOnlineUsersBySerialNumber();
    }
}

// Load online users for agent portal
async function loadOnlineUsersForAgent() {
    if (!window.campaignEmail) return;

    try {
        // Set up real-time listener for Campaign Manager
        const campaignManagerRef = doc(db, 'users', window.campaignEmail);
        onSnapshot(
            campaignManagerRef,
            (managerDoc) => {
                if (managerDoc.exists()) {
                    const managerData = managerDoc.data();
                    // Update or add Campaign Manager to online users
                    const existingIndex = onlineUsers.findIndex(u => u.id === window.campaignEmail);
                    const managerUser = {
                        id: window.campaignEmail,
                        email: window.campaignEmail,
                        name: managerData.name || window.campaignEmail.split('@')[0] || 'Campaign Manager',
                        isOnline: managerData.isOnline || false,
                        agentCode: null,
                        isCampaignManager: true,
                        lastSeen: managerData.lastSeen
                    };

                    if (existingIndex >= 0) {
                        onlineUsers[existingIndex] = managerUser;
                    } else {
                        onlineUsers.push(managerUser);
                    }

                    updateOnlineCount();
                    const chatWindow = document.getElementById('messenger-chat-window');
                    if (chatWindow && chatWindow.classList.contains('open') && !selectedUserId) {
                        showUsersInChatWindow();
                    }
                }
            },
            (error) => {
                console.error('[Messenger] Error listening to Campaign Manager:', error);
                // Don't show error to user - just log it
                // The agent can still use chat even if Campaign Manager status isn't available
            }
        );

        // Set up real-time listener for agents
        const agentsQuery = query(
            collection(db, 'agents'),
            where('email', '==', window.campaignEmail)
        );

        onSnapshot(
            agentsQuery,
            (agentsSnapshot) => {
                // Remove all agents from onlineUsers (we'll re-add them)
                onlineUsers = onlineUsers.filter(u => !u.isAgent);

                agentsSnapshot.forEach((agentDoc) => {
                    const agentData = agentDoc.data();
                    // Don't include current agent
                    if (window.agentData && agentData.agentAccessCode === window.agentData.agentAccessCode) {
                        return;
                    }

                    // Get agent presence from agents collection
                    onlineUsers.push({
                        id: `agent_${agentDoc.id}`,
                        email: agentData.email || window.campaignEmail,
                        name: agentData.name || 'Agent',
                        isOnline: agentData.isOnline || false, // Get online status from agent document
                        agentCode: agentData.agentId || agentData.agentAccessCode || null,
                        isCampaignManager: false,
                        isAgent: true,
                        lastSeen: agentData.lastSeen || null
                    });
                });

                updateOnlineCount();
                const chatWindow = document.getElementById('messenger-chat-window');
                if (chatWindow && chatWindow.classList.contains('open') && !selectedUserId) {
                    showUsersInChatWindow();
                }
            },
            (error) => {
                console.error('[Messenger] Error listening to agents:', error);
                // Don't show error to user - just log it
            }
        );

    } catch (error) {
        console.error('Error loading online users for agent:', error);
    }
}

// Load online users by serial number (normal client portal mode)
async function loadOnlineUsersBySerialNumber() {
    // Check if admin mode
    const isAdminMode = userSerialNumber === 'ADMIN' || userEmail === 'rixaski@gmail.com';

    if (isAdminMode) {
        // Admin mode: Load all clients
        await loadOnlineUsersForAdmin();
        return;
    }

    // For all campaign managers (not just admin), show all online users
    // This allows all campaign managers to see and chat with each other
    try {
        // Load all users (not just same serial number) so all campaign managers can see each other
        const usersQuery = query(
            collection(db, 'users'),
            where('email', '!=', userEmail)
        );

        onSnapshot(usersQuery, (snapshot) => {
            onlineUsers = [];
            snapshot.forEach((doc) => {
                const userData = doc.data();
                // Only show users who have completed campaign setup (have serialNumber)
                if (userData.serialNumber && userData.campaignSet) {
                    onlineUsers.push({
                        id: doc.id,
                        email: doc.id,
                        name: userData.campaignName || userData.email.split('@')[0] || 'User',
                        isOnline: userData.isOnline || false,
                        agentCode: userData.agentCode || null,
                        isCampaignManager: true,
                        isAdmin: false,
                        lastSeen: userData.lastSeen,
                        campaignName: userData.campaignName || null
                    });
                }
            });

            // Load agents for this campaign and add them to online users
            loadAgentsForCampaignManager();

            // Add admin to online users if admin is online
            addAdminToOnlineUsers();

            // Update online count and UI
            updateOnlineCount();
            const chatWindow = document.getElementById('messenger-chat-window');
            if (chatWindow && chatWindow.classList.contains('open') && !selectedUserId) {
                showUsersInChatWindow();
            }
        }, (error) => {
            console.error('[Messenger] Error loading online users:', error);
        });
    } catch (error) {
        console.error('[Messenger] Error setting up online users listener:', error);
    }
}

// Load agents for campaign manager
async function loadAgentsForCampaignManager() {
    if (!userEmail) return; // Campaign manager's email

    try {
        // Get agents for this campaign
        const agentsQuery = query(
            collection(db, 'agents'),
            where('email', '==', userEmail)
        );

        const agentsSnapshot = await getDocs(agentsQuery);

        agentsSnapshot.forEach((agentDoc) => {
            const agentData = agentDoc.data();
            const agentUserId = `agent_${agentDoc.id}`;

            // Check if agent already in onlineUsers
            const existingIndex = onlineUsers.findIndex(u => u.id === agentUserId);

            // Get agent's online status from users collection
            const agentUserRef = doc(db, 'users', agentUserId);
            getDoc(agentUserRef).then((agentUserDoc) => {
                const isOnline = agentUserDoc.exists() ? (agentUserDoc.data().isOnline || false) : false;

                const agentUser = {
                    id: agentUserId,
                    email: agentData.email || userEmail,
                    name: agentData.name || 'Agent',
                    isOnline: isOnline,
                    agentCode: agentData.agentId || agentData.agentAccessCode || null,
                    isCampaignManager: false,
                    isAgent: true,
                    lastSeen: agentUserDoc.exists() ? agentUserDoc.data().lastSeen : null
                };

                if (existingIndex >= 0) {
                    // Update existing agent
                    onlineUsers[existingIndex] = agentUser;
                } else {
                    // Add new agent
                    onlineUsers.push(agentUser);
                }

                // Set up real-time listener for this agent's presence
                onSnapshot(agentUserRef, (agentUserDoc) => {
                    const agentIndex = onlineUsers.findIndex(u => u.id === agentUserId);
                    if (agentIndex >= 0) {
                        if (agentUserDoc.exists()) {
                            const agentUserData = agentUserDoc.data();
                            onlineUsers[agentIndex].isOnline = agentUserData.isOnline || false;
                            onlineUsers[agentIndex].lastSeen = agentUserData.lastSeen || null;
                        } else {
                            onlineUsers[agentIndex].isOnline = false;
                        }
                        updateOnlineCount();
                        const chatWindow = document.getElementById('messenger-chat-window');
                        if (chatWindow && chatWindow.classList.contains('open') && !selectedUserId) {
                            showUsersInChatWindow();
                        }
                    }
                });
            }).catch((error) => {
                console.error('[Messenger] Error getting agent user doc:', error);
            });
        });
    } catch (error) {
        console.error('[Messenger] Error loading agents for campaign manager:', error);
    }
}

// Load online users for admin (all clients)
async function loadOnlineUsersForAdmin() {
    try {
        // Get all clients from clients collection
        const clientsQuery = query(collection(db, 'clients'));
        const clientsSnapshot = await getDocs(clientsQuery);

        onlineUsers = [];

        clientsSnapshot.forEach((clientDoc) => {
            const clientData = clientDoc.data();
            const clientEmail = clientData.email || clientDoc.id;

            // Get user data to check online status
            getDoc(doc(db, 'users', clientEmail)).then((userDoc) => {
                const userData = userDoc.exists() ? userDoc.data() : {};

                onlineUsers.push({
                    id: clientEmail,
                    email: clientEmail,
                    name: clientData.name || clientEmail.split('@')[0] || 'Client',
                    isOnline: userData.isOnline || false,
                    agentCode: null,
                    isCampaignManager: false,
                    isAdmin: false,
                    lastSeen: userData.lastSeen || null
                });

                updateOnlineCount();

                // Show users in chat window if it's open
                const chatWindow = document.getElementById('messenger-chat-window');
                if (chatWindow && chatWindow.classList.contains('open') && !selectedUserId) {
                    showUsersInChatWindow();
                }
            }).catch(error => {
                console.warn('Error loading user data for client:', error);
            });
        });
    } catch (error) {
        console.error('Error loading online users for admin:', error);
    }
}

// Add admin to online users list
async function addAdminToOnlineUsers() {
    try {
        const adminEmail = 'rixaski@gmail.com';
        const adminDoc = await getDoc(doc(db, 'users', adminEmail));

        if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            const adminExists = onlineUsers.some(u => u.email === adminEmail);

            if (!adminExists) {
                onlineUsers.push({
                    id: adminEmail,
                    email: adminEmail,
                    name: 'Support',
                    isOnline: adminData.isOnline || false,
                    agentCode: null,
                    isCampaignManager: false,
                    isAdmin: true,
                    lastSeen: adminData.lastSeen
                });

                updateOnlineCount();

                // Show users in chat window if it's open
                const chatWindow = document.getElementById('messenger-chat-window');
                if (chatWindow && chatWindow.classList.contains('open') && !selectedUserId) {
                    showUsersInChatWindow();
                }
            }
        }
    } catch (error) {
        console.warn('Error adding admin to online users:', error);
    }
}

// Update online count in header
// Clean up old listeners and set up new ones when online users change
function updateMessageListeners() {
    cleanupMessageListeners();
    listenForMessages();
}

function updateOnlineCount() {
    const chatUserStatus = document.getElementById('chat-user-status');
    const onlineCountEl = document.getElementById('messenger-online-count');
    const headerBadge = document.getElementById('messenger-header-badge');
    const onlineCount = onlineUsers.filter(u => u.isOnline).length;

    if (chatUserStatus) {
        chatUserStatus.textContent = `${onlineCount} online`;
    }
    if (onlineCountEl) {
        onlineCountEl.textContent = `${onlineCount} online`;
    }

    // Update header badge (show unread count if any)
    if (headerBadge) {
        if (unreadCount > 0) {
            headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            headerBadge.style.display = 'flex';
        } else {
            headerBadge.style.display = 'none';
        }
    }

    // Update message listeners when online users change
    updateMessageListeners();
}

// Show users in chat window
function showUsersInChatWindow() {
    const messagesContainer = document.getElementById('chat-messages');
    const chatUserName = document.getElementById('chat-user-name');
    const chatUserStatus = document.getElementById('chat-user-status');
    const chatUserAvatar = document.getElementById('chat-user-avatar');
    const chatBackBtn = document.getElementById('chat-back-btn');
    const chatInputArea = document.querySelector('.chat-input-area');
    const chatPreviewArea = document.getElementById('chat-preview-area');

    if (!messagesContainer) return;

    // Hide input when showing user list
    if (chatInputArea) chatInputArea.style.display = 'none';
    if (chatPreviewArea) chatPreviewArea.style.display = 'none';

    // Update header
    if (chatUserName) chatUserName.textContent = 'Messages';
    if (chatUserStatus) {
        const onlineCount = onlineUsers.filter(u => u.isOnline).length;
        chatUserStatus.textContent = `${onlineCount} online`;
    }
    if (chatUserAvatar) chatUserAvatar.innerHTML = '';
    if (chatBackBtn) chatBackBtn.style.display = 'none';

    // Filter users
    const filteredUsers = onlineUsers;

    if (filteredUsers.length === 0) {
        messagesContainer.innerHTML = `
            <div class="messenger-empty" style="padding: 40px 20px; text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3; margin-bottom: 12px;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: var(--text-light);">No online users</p>
                <small style="font-size: 12px; color: var(--text-muted);">Users from your license will appear here when online</small>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = filteredUsers.map(user => {
        const initials = user.name.substring(0, 2).toUpperCase();
        // Show only name, no email or agent code
        const displayName = user.name;

        // Check if Campaign Manager
        const isCampaignManager = user.isCampaignManager === true;
        const isAdmin = user.isAdmin === true;

        return `
            <div class="messenger-user-item" data-user-id="${user.id}" style="margin: 0; border-bottom: 1px solid var(--border-light); cursor: pointer; position: relative;">
                <div class="messenger-user-avatar ${user.isOnline ? 'online' : ''}">${initials}</div>
                <div class="messenger-user-info" style="flex: 1;">
                    <div class="messenger-user-name" style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 13px;">${displayName}</span>
                        ${isAdmin ? `
                            <span class="support-badge" style="display: inline-flex; align-items: center; padding: 2px 8px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Support
                            </span>
                        ` : isCampaignManager ? `
                            <span class="campaign-manager-badge" style="display: inline-flex; align-items: center; padding: 2px 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Campaign Manager
                            </span>
                        ` : ''}
                    </div>
                    <div class="messenger-user-status-text">${user.isOnline ? 'Online' : 'Offline'}</div>
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners
    messagesContainer.querySelectorAll('.messenger-user-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.userId;
            openChat(userId);
        });
    });
}

// Render users list (kept for compatibility but not used)
function renderUsersList(filter = '') {
    // This function is no longer used as we show users in chat window
    showUsersInChatWindow();
}

// Filter users
function filterUsers(searchTerm) {
    renderUsersList(searchTerm);
}

// Open chat with user
async function openChat(userId) {
    selectedUserId = userId;
    const user = onlineUsers.find(u => u.id === userId);
    if (!user) return;

    // Reset unread count when opening a chat (messages will be marked as read when viewed)
    unreadCount = Math.max(0, unreadCount - 1); // Decrement, but don't go below 0
    updateOnlineCount();

    // Ensure chat window is open
    const chatWindow = document.getElementById('messenger-chat-window');
    if (chatWindow) {
        chatWindow.classList.add('open');
    }

    // Show input area
    const chatInputArea = document.querySelector('.chat-input-area');
    const chatPreviewArea = document.getElementById('chat-preview-area');
    if (chatInputArea) chatInputArea.style.display = 'flex';
    if (chatPreviewArea) chatPreviewArea.style.display = 'block';

    // Update chat header
    const chatUserName = document.getElementById('chat-user-name');
    const chatUserStatus = document.getElementById('chat-user-status');
    const chatUserAvatar = document.getElementById('chat-user-avatar');
    const chatBackBtn = document.getElementById('chat-back-btn');

    if (chatUserName) {
        // Show only name, no email or agent code
        const displayName = user.name;

        // Show Campaign Manager badge in chat header
        if (user.isAdmin) {
            chatUserName.innerHTML = `
                    <span style="font-size: 13px;">${displayName}</span>
                    <span class="support-badge" style="display: inline-flex; align-items: center; padding: 2px 8px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px;">
                        Support
                    </span>
                `;
        } else if (user.isAdmin) {
            chatUserName.innerHTML = `
                    <span style="font-size: 13px;">${displayName}</span>
                    <span class="support-badge" style="display: inline-flex; align-items: center; padding: 2px 8px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px;">
                        Support
                    </span>
                `;
        } else if (user.isCampaignManager) {
            chatUserName.innerHTML = `
                    <span style="font-size: 13px;">${displayName}</span>
                    <span class="campaign-manager-badge" style="display: inline-flex; align-items: center; padding: 2px 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px;">
                        Campaign Manager
                    </span>
                `;
        } else {
            chatUserName.innerHTML = `<span style="font-size: 13px;">${displayName}</span>`;
        }
    }
    if (chatUserStatus) {
        chatUserStatus.textContent = user.isOnline ? 'Online' : 'Offline';
    }
    if (chatUserAvatar) {
        const initials = user.name.substring(0, 2).toUpperCase();
        chatUserAvatar.textContent = initials;
    }
    if (chatBackBtn) {
        chatBackBtn.style.display = 'flex';
    }

    // Load messages
    loadMessages(userId);
}

// Load messages for a conversation
async function loadMessages(otherUserId) {
    if (!userEmail || !otherUserId) return;

    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    // Create conversation ID (sorted to ensure consistency)
    const conversationId = [userEmail, otherUserId].sort().join('_');

    try {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

        // Track if this is the first load (to avoid playing notification for existing messages)
        let isFirstLoad = true;
        const conversationKey = `seenMessages_${conversationId}`;

        // Load previously seen message IDs from sessionStorage
        const storedSeenIds = sessionStorage.getItem(conversationKey);
        if (storedSeenIds) {
            try {
                seenMessageIds = new Set(JSON.parse(storedSeenIds));
            } catch (e) {
                seenMessageIds = new Set();
            }
        }

        onSnapshot(
            messagesQuery,
            (snapshot) => {
                // Check for new messages using docChanges
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const messageId = change.doc.id;

                        // Only play notification if:
                        // 1. Message is from other user
                        // 2. Message hasn't been seen before
                        // 3. Not the first load (to avoid playing for existing messages on chat open)
                        if (message.senderId !== userEmail &&
                            !seenMessageIds.has(messageId) &&
                            !isFirstLoad) {
                            playNotificationSound();
                            // Increment unread count if chat window is not open or different conversation
                            const chatWindow = document.getElementById('messenger-chat-window');
                            const isChatOpen = chatWindow && chatWindow.classList.contains('open');
                            const isCurrentConversation = selectedUserId === otherUserId;
                            if (!isChatOpen || !isCurrentConversation) {
                                unreadCount++;
                                updateOnlineCount(); // This will update the badge
                            }
                        }

                        // Mark message as seen
                        seenMessageIds.add(messageId);
                    }
                });

                // Save seen message IDs to sessionStorage
                try {
                    sessionStorage.setItem(conversationKey, JSON.stringify(Array.from(seenMessageIds)));
                } catch (e) {
                    console.warn('[Messenger] Could not save seen message IDs:', e);
                }

                messagesContainer.innerHTML = '';
                snapshot.forEach((doc) => {
                    const message = doc.data();
                    renderMessage(message, message.senderId === userEmail);
                    // Mark all existing messages as seen
                    seenMessageIds.add(doc.id);
                });

                // Mark first load as complete
                isFirstLoad = false;

                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            },
            (error) => {
                console.error('[Messenger] Error loading messages:', error);
                if (error.code === 'permission-denied') {
                    console.error('[Messenger] Permission denied - check Firestore rules for conversations/messages');
                }
                // Show error to user
                if (messagesContainer) {
                    messagesContainer.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
                            <p>Error loading messages. Please refresh the page.</p>
                        </div>
                    `;
                }
            }
        );
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Render a message
function renderMessage(message, isSent) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;

    const time = message.timestamp && message.timestamp.toDate ?
        message.timestamp.toDate().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        }) :
        'Now';

    let contentHTML = '';

    // Render files/images
    if (message.files && message.files.length > 0) {
        message.files.forEach(file => {
            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

            if (isImage) {
                contentHTML += `<img src="${file.url}" alt="${file.name}" class="chat-message-image" onclick="window.open('${file.url}', '_blank')">`;
            } else {
                contentHTML += `
                    <div class="chat-message-file">
                        <a href="${file.url}" target="_blank" class="chat-file-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chat-file-icon">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span class="chat-file-name">${file.name}</span>
                        </a>
                    </div>
                `;
            }
        });
    }

    // Render text
    if (message.text) {
        contentHTML += `<div class="chat-message-bubble">${escapeHtml(message.text)}</div>`;
    }

    messageDiv.innerHTML = `
        ${contentHTML}
        <div class="chat-message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle file selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);

    files.forEach(file => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            if (window.showErrorDialog) {
                window.showErrorDialog(`File "${file.name}" is too large. Maximum size is 5MB.`, 'File Too Large');
            } else {
                alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
            }
            return;
        }

        // Validate file type
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isAllowedFile = ALLOWED_FILE_TYPES.includes(file.type);

        if (!isImage && !isAllowedFile) {
            if (window.showErrorDialog) {
                window.showErrorDialog(`File type "${file.type}" is not allowed. Please select images, PDF, DOC, DOCX, or TXT files.`, 'Invalid File Type');
            } else {
                alert(`File type "${file.type}" is not allowed. Please select images, PDF, DOC, DOCX, or TXT files.`);
            }
            return;
        }

        // Add to attached files
        attachedFiles.push(file);
        displayFilePreview(file);
    });

    // Reset input
    e.target.value = '';
}

// Display file preview
function displayFilePreview(file) {
    const previewArea = document.getElementById('chat-preview-area');
    if (!previewArea) return;

    previewArea.classList.add('show');

    const fileDiv = document.createElement('div');
    fileDiv.className = 'chat-file-preview';
    fileDiv.dataset.fileName = file.name;

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            fileDiv.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="chat-file-preview-image">
                <div class="chat-file-preview-info">
                    <div class="chat-file-preview-name">${file.name}</div>
                    <div class="chat-file-preview-size">${formatFileSize(file.size)}</div>
                </div>
                <button class="chat-file-preview-remove" onclick="removeFilePreview('${file.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        fileDiv.innerHTML = `
            <div class="chat-file-preview-info">
                <div class="chat-file-preview-name">${file.name}</div>
                <div class="chat-file-preview-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="chat-file-preview-remove" onclick="removeFilePreview('${file.name}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
    }

    previewArea.appendChild(fileDiv);
}

// Remove file preview
window.removeFilePreview = function(fileName) {
    attachedFiles = attachedFiles.filter(f => f.name !== fileName);

    const previewArea = document.getElementById('chat-preview-area');
    if (!previewArea) return;

    const fileDiv = previewArea.querySelector(`[data-file-name="${fileName}"]`);
    if (fileDiv) {
        fileDiv.remove();
    }

    if (attachedFiles.length === 0) {
        previewArea.classList.remove('show');
    }
};

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Upload file to Firebase Storage
async function uploadFile(file, conversationId) {
    try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const fileRef = ref(storage, `chat-files/${conversationId}/${fileName}`);

        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
            url: downloadURL,
            name: file.name,
            type: file.type,
            size: file.size
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Send message
async function sendMessage() {
    const messageInput = document.getElementById('chat-message-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if (!messageInput || !selectedUserId || !userEmail) {
        console.error('[Messenger] Cannot send message - missing required data:', {
            hasInput: !!messageInput,
            selectedUserId,
            userEmail
        });
        return;
    }

    // Check authentication
    if (!auth.currentUser) {
        console.error('[Messenger] Cannot send message - user not authenticated');
        if (window.showErrorDialog) {
            window.showErrorDialog('You must be authenticated to send messages. Please refresh the page.', 'Authentication Required');
        } else {
            alert('You must be authenticated to send messages. Please refresh the page.');
        }
        return;
    }

    const text = messageInput.value.trim();

    // Check if there's text or files to send
    if (!text && attachedFiles.length === 0) return;

    // Disable input
    if (sendBtn) sendBtn.disabled = true;

    try {
        // Create conversation ID
        const conversationId = [userEmail, selectedUserId].sort().join('_');

        console.log('[Messenger] Sending message:', {
            conversationId,
            senderId: userEmail,
            receiverId: selectedUserId,
            isAnonymous: auth.currentUser.isAnonymous,
            authEmail: auth.currentUser.email
        });

        // Ensure conversation document exists (Firestore allows subcollections without parent doc, but it's good practice)
        try {
            const conversationRef = doc(db, 'conversations', conversationId);
            const conversationDoc = await getDoc(conversationRef);
            if (!conversationDoc.exists()) {
                // Create conversation document if it doesn't exist
                await setDoc(conversationRef, {
                    participants: [userEmail, selectedUserId].sort(),
                    lastMessage: text || (attachedFiles.length > 0 ? 'File attachment' : ''),
                    lastMessageTime: serverTimestamp(),
                    createdAt: serverTimestamp()
                });
                console.log('[Messenger] Created conversation document:', conversationId);
            }
        } catch (convError) {
            console.warn('[Messenger] Could not create conversation document (may not be needed):', convError);
            // Continue anyway - messages can exist without parent doc
        }

        // Upload files if any
        const fileData = [];
        if (attachedFiles.length > 0) {
            for (const file of attachedFiles) {
                try {
                    const uploadedFile = await uploadFile(file, conversationId);
                    fileData.push(uploadedFile);
                } catch (error) {
                    console.error('Error uploading file:', error);
                    if (window.showErrorDialog) {
                        window.showErrorDialog(`Failed to upload ${file.name}. Please try again.`, 'Upload Failed');
                    } else {
                        alert(`Failed to upload ${file.name}`);
                    }
                }
            }
        }

        // Add message
        const messageData = {
            senderId: userEmail,
            receiverId: selectedUserId,
            timestamp: serverTimestamp(),
            read: false
        };

        if (text) {
            messageData.text = text;
        }

        if (fileData.length > 0) {
            messageData.files = fileData;
        }

        console.log('[Messenger] Adding message to Firestore:', messageData);
        await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);
        console.log('[Messenger] Message sent successfully');

        // Clear input and files
        messageInput.value = '';
        attachedFiles = [];

        // Clear preview
        const previewArea = document.getElementById('chat-preview-area');
        if (previewArea) {
            previewArea.innerHTML = '';
            previewArea.classList.remove('show');
        }

        if (sendBtn) sendBtn.disabled = false;
        messageInput.focus();
    } catch (error) {
        console.error('[Messenger] Error sending message:', error);
        console.error('[Messenger] Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack,
            userEmail,
            selectedUserId,
            conversationId: userEmail && selectedUserId ? [userEmail, selectedUserId].sort().join('_') : 'N/A',
            isAuthenticated: auth.currentUser != null,
            isAnonymous: auth.currentUser.isAnonymous,
            authEmail: auth.currentUser.email
        });

        let errorMessage = 'Failed to send message. Please try again.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. Please check your authentication status.';
        } else if (error.message) {
            errorMessage = `Failed to send message: ${error.message}`;
        }

        if (window.showErrorDialog) {
            window.showErrorDialog(errorMessage, 'Send Failed');
        } else {
            alert(errorMessage);
        }
        if (sendBtn) sendBtn.disabled = false;
    }
}

// Listen for new messages (global listener for notifications)
let globalMessageListeners = new Map(); // Track active listeners to avoid duplicates

function listenForMessages() {
    if (!userEmail) return;

    // For agents, userSerialNumber is null, so allow them to listen for messages
    // For regular users, require userSerialNumber
    const isAgentPortal = window.agentData && window.campaignEmail;
    if (!isAgentPortal && !userSerialNumber) return;

    console.log('[Messenger] Listening for messages for:', userEmail);

    // Set up listeners for each online user to detect new messages
    // This allows notifications even when chat window is not open
    onlineUsers.forEach(user => {
        if (user.id === userEmail) return; // Skip self

        const conversationId = [userEmail, user.id].sort().join('_');

        // Skip if listener already exists
        if (globalMessageListeners.has(conversationId)) return;

        try {
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

            // Listen for the latest message in this conversation
            const unsubscribe = onSnapshot(messagesQuery, (messagesSnapshot) => {
                messagesSnapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const messageId = change.doc.id;
                        const conversationKey = `seenMessages_${conversationId}`;

                        // Load seen message IDs for this conversation
                        let seenIds = new Set();
                        const storedSeenIds = sessionStorage.getItem(conversationKey);
                        if (storedSeenIds) {
                            try {
                                seenIds = new Set(JSON.parse(storedSeenIds));
                            } catch (e) {
                                seenIds = new Set();
                            }
                        }

                        // Only play notification if:
                        // 1. Message is from other user
                        // 2. Message hasn't been seen before
                        // 3. Chat window is not open or different conversation is selected
                        if (message.senderId !== userEmail && !seenIds.has(messageId)) {
                            const chatWindow = document.getElementById('messenger-chat-window');
                            const isChatOpen = chatWindow && chatWindow.classList.contains('open');
                            const isCurrentConversation = selectedUserId === user.id;

                            // Play notification if chat is closed or different conversation is open
                            if (!isChatOpen || !isCurrentConversation) {
                                playNotificationSound();
                            }

                            // Mark message as seen
                            seenIds.add(messageId);
                            try {
                                sessionStorage.setItem(conversationKey, JSON.stringify(Array.from(seenIds)));
                            } catch (e) {
                                console.warn('[Messenger] Could not save seen message IDs:', e);
                            }
                        }
                    }
                });
            }, (error) => {
                console.error('[Messenger] Error listening to messages for conversation:', conversationId, error);
            });

            // Store unsubscribe function
            globalMessageListeners.set(conversationId, unsubscribe);
        } catch (error) {
            console.error('[Messenger] Error setting up listener for conversation:', conversationId, error);
        }
    });
}

// Clean up listeners when users go offline
function cleanupMessageListeners() {
    // Remove listeners for users who are no longer online
    const activeUserIds = new Set(onlineUsers.map(u => u.id));
    globalMessageListeners.forEach((unsubscribe, conversationId) => {
        const userIds = conversationId.split('_');
        const otherUserId = userIds.find(id => id !== userEmail);
        if (otherUserId && !activeUserIds.has(otherUserId)) {
            unsubscribe();
            globalMessageListeners.delete(conversationId);
        }
    });
}

// Initialize when DOM is ready
// For agent portal, wait for agent data to be set before initializing
// For other portals, initialize normally
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if we're in agent portal - if so, don't auto-initialize (will be called from agent.js)
        const isAgentPortal = window.location.pathname.includes('agent.html');
        if (!isAgentPortal) {
            setTimeout(initMessenger, 500);
        } else {
            // For agent portal, wait a bit longer and check if agent data is available
            setTimeout(() => {
                if (window.agentData && window.campaignEmail) {
                    // Agent data is available, initialize
                    initMessenger();
                } else {
                    // Agent data not available yet, will be initialized from agent.js
                    console.log('[Messenger] Waiting for agent data to be set...');
                }
            }, 2000);
        }
    });
} else {
    // DOM already loaded
    const isAgentPortal = window.location.pathname.includes('agent.html');
    if (!isAgentPortal) {
        setTimeout(initMessenger, 500);
    } else {
        // For agent portal, wait for agent data
        setTimeout(() => {
            if (window.agentData && window.campaignEmail) {
                initMessenger();
            } else {
                console.log('[Messenger] Waiting for agent data to be set...');
            }
        }, 2000);
    }
}

// Play notification sound
function playNotificationSound() {
    try {
        const audio = new Audio('notification.mp3');
        audio.volume = 0.7; // Set volume to 70%
        audio.play().catch(error => {
            console.warn('[Messenger] Could not play notification sound:', error);
            // Silently fail - notification sound is optional
        });
    } catch (error) {
        console.warn('[Messenger] Error creating notification audio:', error);
    }
}

// Make functions available globally
window.initMessenger = initMessenger;
window.updateMessengerVisibility = updateMessengerVisibility;