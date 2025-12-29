// Agent Portal JavaScript
// Handles agent authentication, voter management, and agent-specific actions

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

import {
    initializeApp,
    getApps,
    getApp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signOut,
    signInAnonymously
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc,
    serverTimestamp,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize Firebase (check if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentAgentData = null;
let assignedVoters = [];

// Update agent online status
async function updateAgentPresence(isOnline) {
    if (!currentAgentData || !currentAgentData.id) {
        console.warn('[updateAgentPresence] No agent data available');
        return;
    }

    try {
        const agentRef = doc(db, 'agents', currentAgentData.id);
        await updateDoc(agentRef, {
            isOnline: isOnline,
            lastSeen: serverTimestamp()
        });
        console.log(`[Agent Presence] Set agent ${currentAgentData.id} online status to: ${isOnline}`);
    } catch (error) {
        console.error('Error updating agent presence:', error);
    }
}

// Initialize agent portal
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Agent Portal] Initializing...');

    // Sign in anonymously for Firestore access (required for messenger)
    try {
        const userCredential = await signInAnonymously(auth);
        console.log('[Agent Portal] Anonymous authentication successful', {
            uid: userCredential.user.uid,
            isAnonymous: userCredential.user.isAnonymous
        });
    } catch (error) {
        console.error('[Agent Portal] Error signing in anonymously:', error);
        // Show error to user if anonymous auth fails
        if (error.code === 'auth/operation-not-allowed') {
            alert('Anonymous authentication is not enabled in Firebase. Please contact your administrator.');
        }
    }

    // Hide loading screen initially, show access code modal
    // Don't check URL for code anymore - always prompt for access code
    hideLoading();
    showAccessCodeModal();
});


// Validate agent code and load agent data
async function validateAgentCode(agentCode) {
    try {
        updateLoadingProgress(20, 'Validating access code...');

        // Trim and normalize the code
        if (agentCode && typeof agentCode === 'string') {
            agentCode = agentCode.trim();
        }

        // Convert to string if it's a number
        agentCode = String(agentCode);

        // Validate code format
        if (!agentCode || agentCode.length !== 4 || !/^\d{4}$/.test(agentCode)) {
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Please enter a valid 4-digit code.');
            return;
        }

        console.log('[Agent Portal] Validating access code:', agentCode, '(type:', typeof agentCode + ')');

        // Search for agent with this access code
        // Note: This query requires an index if not already created
        let snapshot;
        try {
            // Try querying with string value first
            const agentsQuery = query(collection(db, 'agents'), where('agentAccessCode', '==', agentCode));
            snapshot = await getDocs(agentsQuery);
            console.log('[Agent Portal] Query result (string):', snapshot.empty ? 'No matches' : `${snapshot.docs.length} match(es)`);

            // If no results with string, try with number (in case some records stored it as number)
            if (snapshot.empty) {
                const numericCode = parseInt(agentCode, 10);
                if (!isNaN(numericCode)) {
                    console.log('[Agent Portal] Trying numeric query:', numericCode);
                    try {
                        const numericQuery = query(collection(db, 'agents'), where('agentAccessCode', '==', numericCode));
                        const numericSnapshot = await getDocs(numericQuery);
                        if (!numericSnapshot.empty) {
                            snapshot = numericSnapshot;
                            console.log('[Agent Portal] Query result (number):', `${snapshot.docs.length} match(es)`);
                        }
                    } catch (numError) {
                        console.warn('[Agent Portal] Numeric query failed:', numError);
                    }
                }
            }
        } catch (queryError) {
            console.error('Error querying agents:', queryError);
            // If index missing, try to get all agents and filter client-side (less efficient but works)
            if (queryError.code === 'failed-precondition' && queryError.message.includes('index')) {
                console.warn('Agent access code index missing, fetching all agents...');
                const allAgentsQuery = query(collection(db, 'agents'));
                const allSnapshot = await getDocs(allAgentsQuery);

                // Filter client-side - handle both string and number types
                const matchingDocs = allSnapshot.docs.filter(doc => {
                    const data = doc.data();
                    const storedCode = data.agentAccessCode;

                    // Convert both to strings for comparison
                    const storedCodeStr = storedCode != null ? String(storedCode).trim() : '';
                    const inputCodeStr = String(agentCode).trim();

                    // Also try numeric comparison
                    const storedCodeNum = storedCode != null && !isNaN(storedCode) ? parseInt(String(storedCode).trim(), 10) : null;
                    const inputCodeNum = !isNaN(agentCode) ? parseInt(String(agentCode).trim(), 10) : null;

                    const stringMatch = storedCodeStr === inputCodeStr;
                    const numberMatch = storedCodeNum !== null && inputCodeNum !== null && storedCodeNum === inputCodeNum;

                    if (stringMatch || numberMatch) {
                        console.log('[Agent Portal] Code match found:', {
                            stored: storedCode,
                            storedType: typeof storedCode,
                            storedStr: storedCodeStr,
                            storedNum: storedCodeNum,
                            input: agentCode,
                            inputStr: inputCodeStr,
                            inputNum: inputCodeNum,
                            stringMatch,
                            numberMatch
                        });
                    }

                    return stringMatch || numberMatch;
                });

                console.log('[Agent Portal] Client-side filter result:', matchingDocs.length, 'match(es)');

                // Create a mock snapshot-like object
                snapshot = {
                    empty: matchingDocs.length === 0,
                    docs: matchingDocs
                };
            } else {
                throw queryError;
            }
        }

        if (snapshot.empty) {
            console.error('[Agent Portal] No agent found with access code:', agentCode);
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Invalid access code. Please check and try again.');
            return;
        }

        // Get agent data
        const agentDoc = snapshot.docs[0];
        currentAgentData = {
            id: agentDoc.id,
            ...agentDoc.data()
        };

        updateLoadingProgress(40, 'Loading agent data...');

        // Display agent name
        const agentNameDisplay = document.getElementById('agent-name-display');
        if (agentNameDisplay) {
            agentNameDisplay.textContent = currentAgentData.name || 'Agent';
        }

        // Store agent data globally for messenger access
        window.agentData = currentAgentData;
        window.agentId = currentAgentData.id;
        // Ensure campaignEmail is set - prioritize campaignEmail field, fallback to email
        window.campaignEmail = currentAgentData.campaignEmail || currentAgentData.email;
        if (!window.campaignEmail) {
            console.error('Warning: Campaign email not found in agent data:', currentAgentData);
        }
        window.agentName = currentAgentData.name || 'Agent';

        // Set agent as online (ensure auth is ready first)
        // Wait a moment to ensure anonymous auth is complete
        setTimeout(async () => {
            try {
                // Verify auth state before updating
                if (auth.currentUser) {
                    await updateAgentPresence(true);
                } else {
                    console.warn('[Agent Portal] Not authenticated yet, retrying...');
                    // Retry after auth state is ready
                    setTimeout(async () => {
                        if (auth.currentUser) {
                            await updateAgentPresence(true);
                        } else {
                            console.error('[Agent Portal] Failed to authenticate - cannot update presence');
                        }
                    }, 1000);
                }
            } catch (err) {
                console.error('Error setting agent online:', err);
            }
        }, 500);

        updateLoadingProgress(60, 'Loading assigned voters...');

        // Load assigned voters
        await loadAssignedVoters();

        updateLoadingProgress(80, 'Initializing portal...');

        // Setup event listeners
        setupEventListeners();

        // Initialize messenger (will handle chat with Campaign Manager badge)
        // This needs to be called after window variables are set
        // Wait a bit longer to ensure all data is ready and messenger.js is loaded
        const initMessengerWithRetry = (retries = 3) => {
            if (window.initMessenger && window.agentData && window.campaignEmail) {
                console.log('[Agent Portal] Initializing messenger with agent data:', {
                    agentData: window.agentData,
                    campaignEmail: window.campaignEmail,
                    agentId: window.agentData.id
                });
                try {
                    window.initMessenger();
                } catch (error) {
                    console.error('[Agent Portal] Error initializing messenger:', error);
                }
            } else if (retries > 0) {
                console.log(`[Agent Portal] Messenger not ready, retrying... (${retries} attempts left)`);
                setTimeout(() => initMessengerWithRetry(retries - 1), 500);
            } else {
                console.error('[Agent Portal] Failed to initialize messenger after retries');
            }
        };

        setTimeout(() => initMessengerWithRetry(), 1000);

        updateLoadingProgress(100, 'Ready!');

        // Hide loading and show portal
        setTimeout(() => {
            hideLoading();
            const portalContainer = document.getElementById('agent-portal-container');
            if (portalContainer) {
                portalContainer.style.display = 'block';
            }
        }, 500);

    } catch (error) {
        console.error('Error validating agent code:', error);
        hideLoading();
        showAccessCodeModal();
        showAccessCodeError('Failed to validate access code. Please try again.');
    }
}

// Load assigned voters
async function loadAssignedVoters() {
    if (!currentAgentData || !currentAgentData.id) {
        console.error('[loadAssignedVoters] Missing agent data or ID');
        return;
    }

    // Ensure campaignEmail is set
    if (!window.campaignEmail) {
        window.campaignEmail = currentAgentData.campaignEmail || currentAgentData.email;
        if (!window.campaignEmail) {
            console.error('[loadAssignedVoters] Campaign email not found');
            showError('Agent data incomplete. Please contact your campaign manager.', 'Error');
            return;
        }
    }

    try {
        console.log('[loadAssignedVoters] Loading voters for agent:', {
            agentId: currentAgentData.id,
            campaignEmail: window.campaignEmail
        });

        // Query voters assigned to this agent AND belonging to this campaign
        // Try query with both filters first
        let votersQuery;
        let snapshot;

        try {
            votersQuery = query(
                collection(db, 'voters'),
                where('assignedAgentId', '==', currentAgentData.id),
                where('email', '==', window.campaignEmail)
            );
            snapshot = await getDocs(votersQuery);
        } catch (queryError) {
            // If composite index is missing, try querying by assignedAgentId only
            // and filter by email in JavaScript
            if (queryError.code === 'failed-precondition' && queryError.message.includes('index')) {
                console.warn('[loadAssignedVoters] Composite index missing, using fallback query');
                const fallbackQuery = query(
                    collection(db, 'voters'),
                    where('assignedAgentId', '==', currentAgentData.id)
                );
                snapshot = await getDocs(fallbackQuery);
            } else {
                throw queryError;
            }
        }

        assignedVoters = [];
        snapshot.forEach(doc => {
            const voterData = doc.data();
            // Filter by campaign email if we used fallback query
            if (!votersQuery || voterData.email === window.campaignEmail || voterData.campaignEmail === window.campaignEmail) {
                assignedVoters.push({
                    id: doc.id,
                    ...voterData
                });
            }
        });

        console.log(`[loadAssignedVoters] Loaded ${assignedVoters.length} assigned voters`);

        // Update stats
        updateAgentStats();

        // Load content
        loadSection('assigned-voters');

    } catch (error) {
        console.error('[loadAssignedVoters] Error loading assigned voters:', error);
        let errorMessage = 'Failed to load assigned voters. Please try again.';

        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You may not have access to view voters. Please contact your campaign manager.';
        } else if (error.code === 'failed-precondition') {
            errorMessage = 'Database index is missing. Please contact your administrator to create the required index.';
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }

        showError(errorMessage, 'Error');
    }
}

// Update agent stats
function updateAgentStats() {
    const statsVoters = document.getElementById('agent-stats-voters');
    const statsCalls = document.getElementById('agent-stats-calls');
    const statsPledges = document.getElementById('agent-stats-pledges');

    if (statsVoters) statsVoters.textContent = assignedVoters.length;
    if (statsCalls) statsCalls.textContent = currentAgentData.callsMade || 0;

    // Count pledges made by this agent
    // This would need to be fetched separately if we track agentId in pledges
    if (statsPledges) statsPledges.textContent = '0'; // TODO: Count agent pledges
}

// Load section content
function loadSection(section) {
    const contentArea = document.getElementById('agent-content');
    if (!contentArea) return;

    if (section === 'assigned-voters') {
        loadAssignedVotersSection();
    }
}

// Load assigned voters section
async function loadAssignedVotersSection() {
    const contentArea = document.getElementById('agent-content');
    if (!contentArea) return;

    // Fetch existing pledges for these voters
    const voterPledges = await fetchVoterPledges();

    let html = `
        <div class="page-header" style="margin-bottom: 25px;">
            <div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: var(--text-color);">My Assigned Voters</h1>
                <p class="page-subtitle" style="margin: 5px 0 0 0; color: var(--text-light);">${assignedVoters.length} voter(s) assigned to you</p>
            </div>
        </div>
    `;

    if (assignedVoters.length === 0) {
        html += `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: var(--shadow-sm);">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 20px; opacity: 0.5;">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3 style="color: var(--text-color); margin: 0 0 10px 0;">No Voters Assigned</h3>
                <p style="color: var(--text-light); margin: 0;">You don't have any voters assigned yet. Contact your campaign manager.</p>
            </div>
        `;
    } else {
        html += `
            <div class="table-container" style="background: white; border-radius: 12px; box-shadow: var(--shadow-sm); overflow: hidden;">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--light-color); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">No.</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">Image</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">ID Number</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">Name</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">Constituency</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">Island</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">Phone</th>
                            <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px;">Pledge Status</th>
                            <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px; width: 50px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="assigned-voters-table-body" style="background: white;">
        `;

        assignedVoters.forEach((voter, index) => {
            const initials = voter.name ? voter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
            const imageUrl = voter.imageUrl || voter.image || '';

            // Get existing pledge for this voter
            const existingPledge = voterPledges.find(p => p.voterDocumentId === voter.id);
            const currentPledge = existingPledge ? existingPledge.pledge : null;

            // Determine pledge status display
            let pledgeStatusHtml = '<span style="color: var(--text-light); font-size: 13px;">Not Set</span>';
            if (currentPledge === 'yes') {
                pledgeStatusHtml = '<span class="status-badge status-success" style="font-size: 12px;">Positive</span>';
            } else if (currentPledge === 'no') {
                pledgeStatusHtml = '<span class="status-badge status-inactive" style="font-size: 12px;">Negative</span>';
            } else if (currentPledge === 'undecided') {
                pledgeStatusHtml = '<span class="status-badge status-pending" style="font-size: 12px;">Undecided</span>';
            }

            html += `
                <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.2s;" 
                    onmouseover="this.style.background='var(--light-color)'" 
                    onmouseout="this.style.background='white'">
                    <td style="padding: 14px 16px; text-align: center; color: var(--text-light); font-weight: 600; font-size: 13px;">${index + 1}</td>
                    <td style="padding: 14px 16px;">
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${voter.name}" class="voter-image" loading="lazy" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">` :
                            `<div class="user-avatar" style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 13px; border: 2px solid var(--border-color);">${initials}</div>`
                        }
                    </td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-color); font-weight: 500;">${voter.idNumber || voter.voterId || 'N/A'}</td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-color); font-weight: 600;">${voter.name || 'N/A'}</td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-color);">${voter.constituency || 'N/A'}</td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-color);">${voter.island || 'N/A'}</td>
                    <td style="padding: 14px 16px; font-size: 13px; color: var(--text-color);">${voter.number || voter.phone || 'N/A'}</td>
                    <td style="padding: 14px 16px;">${pledgeStatusHtml}</td>
                    <td style="padding: 14px 16px; text-align: center; position: relative;">
                        <div class="agent-voter-actions-inline" data-voter-id="${voter.id}">
                            <div class="agent-pledge-actions-group">
                                <button type="button" class="agent-pledge-btn agent-pledge-btn-positive ${currentPledge === 'yes' ? 'active' : ''}" data-action="positive" data-voter-id="${voter.id}" title="Mark as Positive">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </button>
                                <button type="button" class="agent-pledge-btn agent-pledge-btn-negative ${currentPledge === 'no' ? 'active' : ''}" data-action="negative" data-voter-id="${voter.id}" title="Mark as Negative">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                </button>
                                <button type="button" class="agent-pledge-btn agent-pledge-btn-undecided ${currentPledge === 'undecided' ? 'active' : ''}" data-action="undecided" data-voter-id="${voter.id}" title="Mark as Undecided">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                </button>
                            </div>
                            <button type="button" class="agent-remark-btn" data-action="remark" data-voter-id="${voter.id}" title="Add Remark">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    contentArea.innerHTML = html;

    // Menu closing is now handled by event delegation in initAgentVoterActionsMenu
}

// Initialize Agent Voter Actions Menu with Event Delegation
(function initAgentVoterActionsMenu() {
    // Use event delegation on the document for dynamic content
    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('.agent-voter-actions-btn');
        const actionBtn = e.target.closest('.agent-voter-action-item');
        const wrapper = e.target.closest('.agent-voter-actions-wrapper');

        // Handle menu trigger click
        if (trigger) {
            e.stopPropagation();
            e.preventDefault();

            const voterId = trigger.getAttribute('data-voter-id');
            const menu = document.querySelector(`.agent-voter-actions-menu[data-menu-for="${voterId}"]`);
            const allMenus = document.querySelectorAll('.agent-voter-actions-menu');

            // Close all other menus
            allMenus.forEach(m => {
                if (m !== menu) {
                    m.classList.remove('is-open');
                    const container = m.closest('.agent-voter-actions-wrapper');
                    if (container) {
                        container.classList.remove('active');
                    }
                }
            });

            // Toggle current menu
            if (menu) {
                menu.classList.toggle('is-open');
                const container = menu.closest('.agent-voter-actions-wrapper');
                if (container) {
                    container.classList.toggle('active');
                }
            }
            return;
        }

        // Handle action button click (both old menu style and new inline style)
        const pledgeBtn = e.target.closest('.agent-pledge-btn, .agent-remark-btn');
        if (pledgeBtn) {
            e.stopPropagation();
            e.preventDefault();

            const voterId = pledgeBtn.getAttribute('data-voter-id');
            const action = pledgeBtn.getAttribute('data-action');

            // Execute action
            if (action === 'positive') {
                if (typeof quickUpdatePledge === 'function') {
                    quickUpdatePledge(voterId, 'yes');
                }
            } else if (action === 'negative') {
                if (typeof quickUpdatePledge === 'function') {
                    quickUpdatePledge(voterId, 'no');
                }
            } else if (action === 'undecided') {
                if (typeof quickUpdatePledge === 'function') {
                    quickUpdatePledge(voterId, 'undecided');
                }
            } else if (action === 'remark') {
                if (typeof addRemarkForVoter === 'function') {
                    addRemarkForVoter(voterId);
                }
            }
            return;
        }

        if (actionBtn && !actionBtn.classList.contains('disabled')) {
            e.stopPropagation();
            e.preventDefault();

            const voterId = actionBtn.getAttribute('data-voter-id');
            const action = actionBtn.getAttribute('data-action');
            const menu = actionBtn.closest('.agent-voter-actions-menu');

            // Close menu
            if (menu) {
                menu.classList.remove('is-open');
                const container = menu.closest('.agent-voter-actions-wrapper');
                if (container) {
                    container.classList.remove('active');
                }
            }

            // Execute action
            if (action === 'positive') {
                if (typeof quickUpdatePledge === 'function') {
                    quickUpdatePledge(voterId, 'yes');
                }
            } else if (action === 'negative') {
                if (typeof quickUpdatePledge === 'function') {
                    quickUpdatePledge(voterId, 'no');
                }
            } else if (action === 'undecided') {
                if (typeof quickUpdatePledge === 'function') {
                    quickUpdatePledge(voterId, 'undecided');
                }
            } else if (action === 'remark') {
                if (typeof addRemarkForVoter === 'function') {
                    addRemarkForVoter(voterId);
                }
            }
            return;
        }

        // Close all menus when clicking outside
        if (!wrapper) {
            document.querySelectorAll('.agent-voter-actions-menu').forEach(menu => {
                menu.classList.remove('is-open');
                const container = menu.closest('.agent-voter-actions-wrapper');
                if (container) {
                    container.classList.remove('active');
                }
            });
        }
    });

    // Handle Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.agent-voter-actions-menu').forEach(menu => {
                menu.classList.remove('is-open');
                const container = menu.closest('.agent-voter-actions-wrapper');
                if (container) {
                    container.classList.remove('active');
                }
            });
        }
    });

    console.log('[Agent Voter Actions] Menu system initialized with event delegation');
})();

// Fetch existing pledges for assigned voters
async function fetchVoterPledges() {
    if (!currentAgentData || !currentAgentData.id) return [];

    try {
        const pledgesQuery = query(
            collection(db, 'pledges'),
            where('agentId', '==', currentAgentData.id)
        );
        const snapshot = await getDocs(pledgesQuery);

        const pledges = [];
        snapshot.forEach(doc => {
            pledges.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return pledges;
    } catch (error) {
        console.error('Error fetching pledges:', error);
        return [];
    }
}

// Quick update pledge status
async function quickUpdatePledge(voterId, pledgeStatus) {
    if (!db || !currentAgentData) {
        showError('Database or agent data not initialized.', 'Error');
        return;
    }

    try {
        // Ensure campaignEmail is set
        if (!window.campaignEmail) {
            window.campaignEmail = currentAgentData.campaignEmail || currentAgentData.email;
            if (!window.campaignEmail) {
                showError('Campaign email not found. Please contact your administrator.', 'Error');
                return;
            }
        }

        // Get voter data
        const voterDoc = await getDoc(doc(db, 'voters', voterId));
        if (!voterDoc.exists()) {
            showError('Voter not found.', 'Error');
            return;
        }

        const voterData = voterDoc.data();

        // Verify voter is assigned to this agent
        if (voterData.assignedAgentId !== currentAgentData.id) {
            showError('You do not have permission to update this voter\'s pledge.', 'Access Denied');
            return;
        }

        // Check if pledge already exists
        const existingPledgesQuery = query(
            collection(db, 'pledges'),
            where('voterDocumentId', '==', voterId),
            where('agentId', '==', currentAgentData.id)
        );
        const existingSnapshot = await getDocs(existingPledgesQuery);

        const pledgeData = {
            voterName: voterData.name || 'N/A',
            voterId: voterData.idNumber || voterData.voterId || voterId,
            voterDocumentId: voterId,
            island: voterData.island || '',
            age: voterData.age || null,
            pledge: pledgeStatus,
            notes: '',
            agentId: currentAgentData.id,
            agentName: currentAgentData.name || 'Agent',
            email: window.campaignEmail
        };

        if (!existingSnapshot.empty) {
            // Update existing pledge
            const existingPledgeId = existingSnapshot.docs[0].id;
            const existingPledge = existingSnapshot.docs[0].data();

            // Prepare update data - preserve original timestamp if it exists
            const updateData = {
                ...pledgeData
            };

            // Only preserve recordedAt if it exists in the existing pledge
            if (existingPledge.recordedAt) {
                updateData.recordedAt = existingPledge.recordedAt;
            } else {
                // If no recordedAt exists, set it now
                updateData.recordedAt = serverTimestamp();
            }

            await updateDoc(doc(db, 'pledges', existingPledgeId), updateData);
        } else {
            // Create new pledge with timestamp
            await addDoc(collection(db, 'pledges'), {
                ...pledgeData,
                recordedAt: serverTimestamp()
            });
        }

        // Send notification to campaign manager (non-blocking)
        try {
            console.log('[Pledge Update] Attempting to send notification...');
            await notifyCampaignManager({
                type: 'pledge',
                title: 'Pledge Updated',
                message: `${currentAgentData.name} updated pledge for ${voterData.name}: ${pledgeStatus}`,
                agentId: currentAgentData.id,
                agentName: currentAgentData.name
            });
            console.log('[Pledge Update] Notification sent successfully');
        } catch (notifError) {
            console.error('[Pledge Update] Failed to send notification:', notifError);
            console.error('[Pledge Update] Notification error details:', {
                code: notifError.code,
                message: notifError.message,
                campaignEmail: window.campaignEmail,
                agentId: currentAgentData.id
            });
            // Continue even if notification fails - don't block pledge update
        }

        // Reload table
        await loadAssignedVoters();

        if (window.showSuccess) {
            window.showSuccess('Pledge updated successfully!', 'Success');
        } else {
            alert('Pledge updated successfully!');
        }

    } catch (error) {
        console.error('Error updating pledge:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to update pledge. Please try again.';

        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You may not have permission to update pledges. Please contact your administrator.';
        } else if (error.code === 'unavailable') {
            errorMessage = 'Service temporarily unavailable. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = `Failed to update pledge: ${error.message}`;
        }

        showError(errorMessage, 'Error');
    }
}

// Add remark for voter
function addRemarkForVoter(voterId) {
    showAddRemarkModal(voterId);
}

// View voter details for agent
async function viewVoterForAgent(voterId) {
    if (!window.db) return;

    try {
        const voterDoc = await getDoc(doc(db, 'voters', voterId));
        if (!voterDoc.exists()) {
            showError('Voter not found.', 'Error');
            return;
        }

        const voterData = voterDoc.data();

        // Verify voter is assigned to this agent
        if (voterData.assignedAgentId !== currentAgentData.id) {
            showError('You do not have permission to view this voter.', 'Access Denied');
            return;
        }

        // Show voter details modal with agent actions
        showVoterDetailsModal(voterData, voterId);

    } catch (error) {
        console.error('Error loading voter details:', error);
        showError('Failed to load voter details. Please try again.', 'Error');
    }
}

// Show voter details modal with agent actions
function showVoterDetailsModal(voterData, voterId) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modalOverlay || !modalTitle || !modalBody) return;

    modalTitle.textContent = 'Voter Details';

    const imageUrl = voterData.imageUrl || voterData.image || '';
    const initials = voterData.name ? voterData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

    modalBody.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${voterData.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color);">` :
                    `<div style="width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 28px;">${initials}</div>`
                }
                <div>
                    <h2 style="margin: 0; color: var(--text-color); font-size: 24px; font-weight: 700;">${voterData.name || 'N/A'}</h2>
                    <p style="margin: 5px 0 0 0; color: var(--text-light); font-size: 14px;">ID: ${voterData.idNumber || voterData.voterId || 'N/A'}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div class="detail-item">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Age</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${voterData.age ? voterData.age + ' years' : 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Gender</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${voterData.gender ? voterData.gender.charAt(0).toUpperCase() + voterData.gender.slice(1) : 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Island</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${voterData.island || 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Phone</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${voterData.number || 'N/A'}</p>
                </div>
            </div>
            
            ${voterData.permanentAddress ? `
                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Permanent Address</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${voterData.permanentAddress}</p>
                </div>
            ` : ''}
            
            ${voterData.currentLocation ? `
                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Current Location</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${voterData.currentLocation}</p>
                </div>
            ` : ''}
            
            <!-- Agent Actions -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid var(--border-color);">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: var(--text-color);">Actions</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <button class="btn-primary btn-compact" onclick="openAgentActionModal('call', '${voterId}')" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Make Call
                    </button>
                    <button class="btn-primary btn-compact" onclick="openAgentActionModal('pledge', '${voterId}')" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Mark Pledge
                    </button>
                    <button class="btn-primary btn-compact" onclick="openAgentActionModal('event', '${voterId}')" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Event Attendance
                    </button>
                    <button class="btn-primary btn-compact" onclick="openAgentActionModal('remark', '${voterId}')" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Add Remark
                    </button>
                </div>
            </div>
        </div>
    `;

    modalOverlay.style.display = 'flex';
}

// Open agent action modal
function openAgentActionModal(actionType, voterId) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modalOverlay || !modalTitle || !modalBody) return;

    // Close voter details modal first
    modalOverlay.style.display = 'none';

    // Show action modal after a brief delay
    setTimeout(() => {
        if (actionType === 'call') {
            showMakeCallModal(voterId);
        } else if (actionType === 'pledge') {
            showMarkPledgeModal(voterId);
        } else if (actionType === 'event') {
            showEventAttendanceModal(voterId);
        } else if (actionType === 'remark') {
            showAddRemarkModal(voterId);
        }
    }, 100);
}

// Show make call modal
function showMakeCallModal(voterId) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Make Call';

    const now = new Date();
    const dateTimeStr = now.toISOString().slice(0, 16);

    modalBody.innerHTML = `
        <form id="agent-call-form" class="modal-form">
            <div class="form-group">
                <label for="call-date">Call Date & Time *</label>
                <input type="datetime-local" id="call-date" name="call-date" value="${dateTimeStr}" required>
            </div>
            <div class="form-group">
                <label for="call-status">Call Status *</label>
                <select id="call-status" name="call-status" required>
                    <option value="">Select status</option>
                    <option value="answered">Answered</option>
                    <option value="no-answer">No Answer</option>
                    <option value="busy">Busy</option>
                    <option value="callback">Callback Requested</option>
                </select>
            </div>
            <div class="form-group">
                <label for="call-notes">Notes</label>
                <textarea id="call-notes" name="call-notes" rows="4" placeholder="Add notes about the call..."></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Save Call</button>
            </div>
        </form>
    `;

    // Handle form submission
    const form = document.getElementById('agent-call-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAgentCall(voterId);
        });
    }

    modalOverlay.style.display = 'flex';
}

// Show mark pledge modal
function showMarkPledgeModal(voterId) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Mark Pledge';

    modalBody.innerHTML = `
        <form id="agent-pledge-form" class="modal-form">
            <div class="form-group">
                <label for="pledge-status">Pledge Status *</label>
                <select id="pledge-status" name="pledge-status" required>
                    <option value="">Select pledge</option>
                    <option value="yes">Yes - Will Support</option>
                    <option value="no">No - Will Not Support</option>
                    <option value="undecided">Undecided</option>
                </select>
            </div>
            <div class="form-group">
                <label for="pledge-notes">Notes</label>
                <textarea id="pledge-notes" name="pledge-notes" rows="4" placeholder="Add notes about the pledge..."></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Save Pledge</button>
            </div>
        </form>
    `;

    // Handle form submission
    const form = document.getElementById('agent-pledge-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAgentPledge(voterId);
        });
    }

    modalOverlay.style.display = 'flex';
}

// Show event attendance modal
function showEventAttendanceModal(voterId) {
    // Fetch events for this campaign
    loadEventsForAttendance(voterId);
}

// Load events for attendance
async function loadEventsForAttendance(voterId) {
    if (!window.campaignEmail) return;

    try {
        const eventsQuery = query(
            collection(db, 'events'),
            where('email', '==', window.campaignEmail)
        );
        const snapshot = await getDocs(eventsQuery);

        const events = [];
        snapshot.forEach(doc => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });

        showEventAttendanceModalWithEvents(voterId, events);

    } catch (error) {
        console.error('Error loading events:', error);
        showError('Failed to load events. Please try again.', 'Error');
    }
}

// Show event attendance modal with events list
function showEventAttendanceModalWithEvents(voterId, events) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Mark Event Attendance';

    if (events.length === 0) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--text-light);">No events available for attendance marking.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Close</button>
            </div>
        `;
        modalOverlay.style.display = 'flex';
        return;
    }

    let html = `
        <form id="agent-event-attendance-form" class="modal-form">
            <div class="form-group">
                <label for="event-select">Select Event *</label>
                <select id="event-select" name="event-select" required>
                    <option value="">Select an event</option>
    `;

    events.forEach(event => {
        const eventDate = event.eventDate ? (event.eventDate.toDate ? event.eventDate.toDate() : new Date(event.eventDate)) : new Date();
        const dateStr = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        html += `<option value="${event.id}">${event.eventName || 'Unnamed Event'} - ${dateStr}</option>`;
    });

    html += `
                </select>
            </div>
            <div class="form-group">
                <label for="attendance-status">Attendance Status *</label>
                <select id="attendance-status" name="attendance-status" required>
                    <option value="">Select status</option>
                    <option value="attended">Attended</option>
                    <option value="not-attended">Not Attended</option>
                    <option value="partial">Partial Attendance</option>
                </select>
            </div>
            <div class="form-group">
                <label for="attendance-notes">Notes</label>
                <textarea id="attendance-notes" name="attendance-notes" rows="4" placeholder="Add notes about attendance..."></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Save Attendance</button>
            </div>
        </form>
    `;

    modalBody.innerHTML = html;

    // Handle form submission
    const form = document.getElementById('agent-event-attendance-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveEventAttendance(voterId);
        });
    }

    modalOverlay.style.display = 'flex';
}

// Show add remark modal
function showAddRemarkModal(voterId) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = 'Add Remark';

    modalBody.innerHTML = `
        <form id="agent-remark-form" class="modal-form">
            <div class="form-group">
                <label for="remark-text">Remark *</label>
                <textarea id="remark-text" name="remark-text" rows="5" placeholder="Enter your remark about this voter..." required></textarea>
            </div>
            <div class="form-group">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="remark-urgent" name="remark-urgent" style="width: 18px; height: 18px;">
                    <span style="color: var(--danger-color); font-weight: 600;">Mark as Urgent Request</span>
                </label>
                <small style="color: var(--text-light); display: block; margin-top: 5px;">Urgent remarks will be immediately notified to the campaign manager</small>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Save Remark</button>
            </div>
        </form>
    `;

    // Handle form submission
    const form = document.getElementById('agent-remark-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAgentRemark(voterId);
        });
    }

    modalOverlay.style.display = 'flex';
}

// Save agent call
async function saveAgentCall(voterId) {
    if (!db || !currentAgentData) return;

    try {
        const form = document.getElementById('agent-call-form');
        const formData = new FormData(form);

        // Get voter data for call record
        const voterDoc = await getDoc(doc(db, 'voters', voterId));
        if (!voterDoc.exists()) {
            showError('Voter not found.', 'Error');
            return;
        }

        const voterData = voterDoc.data();

        const callData = {
            voterName: voterData.name || 'N/A',
            voterId: voterData.idNumber || voterData.voterId || voterId,
            voterDocumentId: voterId,
            constituency: voterData.constituency || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : '') || '',
            island: voterData.island || '',
            callDate: new Date(formData.get('call-date')),
            status: formData.get('call-status'),
            notes: formData.get('call-notes') || '',
            agentId: currentAgentData.id,
            agentName: currentAgentData.name,
            email: window.campaignEmail,
            createdAt: serverTimestamp()
        };

        // Save call
        await addDoc(collection(db, 'calls'), callData);

        // Update agent calls made count
        const agentRef = doc(db, 'agents', currentAgentData.id);
        await updateDoc(agentRef, {
            callsMade: (currentAgentData.callsMade || 0) + 1
        });

        // Send notification to campaign manager
        await notifyCampaignManager({
            type: 'call',
            title: 'New Call Recorded',
            message: `${currentAgentData.name} made a call to ${voterData.name}`,
            agentId: currentAgentData.id,
            agentName: currentAgentData.name
        });

        // Show success
        if (window.showSuccess) {
            window.showSuccess('Call recorded successfully!', 'Success');
        }

        // Close modal and reload
        closeModal();
        await loadAssignedVoters();

    } catch (error) {
        console.error('Error saving call:', error);
        showError('Failed to save call. Please try again.', 'Error');
    }
}

// Save agent pledge
async function saveAgentPledge(voterId) {
    if (!db || !currentAgentData) return;

    try {
        const form = document.getElementById('agent-pledge-form');
        const formData = new FormData(form);

        // Get voter data
        const voterDoc = await getDoc(doc(db, 'voters', voterId));
        if (!voterDoc.exists()) {
            showError('Voter not found.', 'Error');
            return;
        }

        const voterData = voterDoc.data();

        const pledgeData = {
            voterName: voterData.name || 'N/A',
            voterId: voterData.idNumber || voterData.voterId || voterId,
            voterDocumentId: voterId,
            island: voterData.island || '',
            age: voterData.age || null,
            pledge: formData.get('pledge-status'),
            notes: formData.get('pledge-notes') || '',
            agentId: currentAgentData.id,
            agentName: currentAgentData.name,
            email: window.campaignEmail,
            recordedAt: serverTimestamp()
        };

        // Save pledge
        await addDoc(collection(db, 'pledges'), pledgeData);

        // Send notification to campaign manager
        await notifyCampaignManager({
            type: 'pledge',
            title: 'New Pledge Recorded',
            message: `${currentAgentData.name} recorded a pledge for ${voterData.name}: ${formData.get('pledge-status')}`,
            agentId: currentAgentData.id,
            agentName: currentAgentData.name
        });

        // Show success
        if (window.showSuccess) {
            window.showSuccess('Pledge recorded successfully!', 'Success');
        }

        // Close modal and reload
        closeModal();
        await loadAssignedVoters();

    } catch (error) {
        console.error('Error saving pledge:', error);
        showError('Failed to save pledge. Please try again.', 'Error');
    }
}

// Save event attendance
async function saveEventAttendance(voterId) {
    if (!db || !currentAgentData) return;

    try {
        const form = document.getElementById('agent-event-attendance-form');
        const formData = new FormData(form);

        const eventId = formData.get('event-select');
        if (!eventId) {
            showError('Please select an event.', 'Error');
            return;
        }

        // Get event and voter data
        const [eventDoc, voterDoc] = await Promise.all([
            getDoc(doc(db, 'events', eventId)),
            getDoc(doc(db, 'voters', voterId))
        ]);

        if (!eventDoc.exists() || !voterDoc.exists()) {
            showError('Event or voter not found.', 'Error');
            return;
        }

        const eventData = eventDoc.data();
        const voterData = voterDoc.data();

        // Save attendance (create a new collection or add to events subcollection)
        const attendanceData = {
            eventId: eventId,
            eventName: eventData.eventName || 'Unnamed Event',
            voterId: voterId,
            voterName: voterData.name || 'N/A',
            attendanceStatus: formData.get('attendance-status'),
            notes: formData.get('attendance-notes') || '',
            agentId: currentAgentData.id,
            agentName: currentAgentData.name,
            email: window.campaignEmail,
            recordedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'eventAttendance'), attendanceData);

        // Send notification to campaign manager
        await notifyCampaignManager({
            type: 'event',
            title: 'Event Attendance Recorded',
            message: `${currentAgentData.name} recorded attendance for ${voterData.name} at ${eventData.eventName}`,
            agentId: currentAgentData.id,
            agentName: currentAgentData.name
        });

        // Show success
        if (window.showSuccess) {
            window.showSuccess('Attendance recorded successfully!', 'Success');
        }

        // Close modal
        closeModal();

    } catch (error) {
        console.error('Error saving attendance:', error);
        showError('Failed to save attendance. Please try again.', 'Error');
    }
}

// Save agent remark
async function saveAgentRemark(voterId) {
    if (!db || !currentAgentData) {
        showError('Database not initialized or agent data missing.', 'Error');
        return;
    }

    try {
        const form = document.getElementById('agent-remark-form');
        if (!form) {
            showError('Form not found. Please refresh the page.', 'Error');
            return;
        }

        const formData = new FormData(form);

        const remarkText = formData.get('remark-text');
        const isUrgent = formData.get('remark-urgent') === 'on';

        if (!remarkText || !remarkText.trim()) {
            showError('Please enter a remark.', 'Error');
            return;
        }

        // Ensure campaignEmail is set
        if (!window.campaignEmail) {
            // Try to get it from agent data
            window.campaignEmail = currentAgentData.email || currentAgentData.campaignEmail;
            if (!window.campaignEmail) {
                showError('Campaign email not found. Please contact your administrator.', 'Error');
                return;
            }
        }

        // Get voter data
        const voterDoc = await getDoc(doc(db, 'voters', voterId));
        if (!voterDoc.exists()) {
            showError('Voter not found.', 'Error');
            return;
        }

        const voterData = voterDoc.data();

        // Save remark
        const remarkData = {
            voterId: voterId,
            voterName: voterData.name || 'N/A',
            remark: remarkText.trim(),
            isUrgent: isUrgent,
            agentId: currentAgentData.id,
            agentName: currentAgentData.name || 'Agent',
            email: window.campaignEmail,
            createdAt: serverTimestamp()
        };

        // Validate required fields for Firestore rules
        if (!remarkData.agentId || !remarkData.email) {
            showError('Missing required data. Please contact your administrator.', 'Error');
            console.error('Missing required fields:', {
                agentId: remarkData.agentId,
                email: remarkData.email
            });
            return;
        }

        await addDoc(collection(db, 'remarks'), remarkData);

        // Send urgent notification if marked as urgent
        try {
            await notifyCampaignManager({
                type: 'remark',
                title: isUrgent ? '⚠️ URGENT: New Remark' : 'New Remark Added',
                message: `${currentAgentData.name} added a remark for ${voterData.name}: ${remarkText.substring(0, 100)}${remarkText.length > 100 ? '...' : ''}`,
                agentId: currentAgentData.id,
                agentName: currentAgentData.name,
                isUrgent: isUrgent
            });
        } catch (notifError) {
            console.warn('Failed to send notification (non-critical):', notifError);
            // Continue even if notification fails
        }

        // Show success
        if (window.showSuccess) {
            window.showSuccess(isUrgent ? 'Urgent remark saved and campaign manager notified!' : 'Remark saved successfully!', 'Success');
        }

        // Close modal
        closeModal();

        // Reload assigned voters to show updated data
        if (window.reloadAssignedVotersTable) {
            window.reloadAssignedVotersTable();
        }

    } catch (error) {
        console.error('Error saving remark:', error);

        // Show more specific error message
        let errorMessage = 'Failed to save remark. Please try again.';

        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You may not have permission to save remarks. Please contact your administrator.';
        } else if (error.code === 'unavailable') {
            errorMessage = 'Service temporarily unavailable. Please check your connection and try again.';
        } else if (error.message) {
            errorMessage = `Failed to save remark: ${error.message}`;
        }

        showError(errorMessage, 'Error');
    }
}

// Notify campaign manager
async function notifyCampaignManager(notificationData) {
    if (!db) {
        console.error('[Notification] Database not initialized');
        return;
    }

    if (!window.campaignEmail) {
        console.error('[Notification] Campaign email not set. Current agent data:', currentAgentData);
        // Try to get campaign email from agent data
        if (currentAgentData && (currentAgentData.campaignEmail || currentAgentData.email)) {
            window.campaignEmail = currentAgentData.campaignEmail || currentAgentData.email;
            console.log('[Notification] Using campaign email from agent data:', window.campaignEmail);
        } else {
            console.error('[Notification] Cannot send notification - no campaign email available');
            return;
        }
    }

    try {
        const notification = {
            recipientEmail: window.campaignEmail,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'info',
            agentId: notificationData.agentId,
            agentName: notificationData.agentName,
            isUrgent: notificationData.isUrgent || false,
            read: false,
            createdAt: serverTimestamp()
        };

        console.log('[Notification] Sending notification to campaign manager:', {
            recipientEmail: window.campaignEmail,
            title: notification.title,
            message: notification.message,
            type: notification.type
        });

        const docRef = await addDoc(collection(db, 'notifications'), notification);
        console.log('[Notification] Notification sent successfully with ID:', docRef.id);

    } catch (error) {
        console.error('[Notification] Error sending notification:', error);
        console.error('[Notification] Error details:', {
            code: error.code,
            message: error.message,
            campaignEmail: window.campaignEmail,
            notificationData: notificationData
        });
        // Re-throw error so caller can handle it if needed
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            // Update active state
            navItems.forEach(ni => ni.classList.remove('active'));
            item.classList.add('active');

            // Load section
            loadSection(section);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('agent-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.showConfirm) {
                window.showConfirm('Are you sure you want to logout?', 'Logout').then(confirmed => {
                    if (confirmed) {
                        // Set agent as offline
                        updateAgentPresence(false).catch(err => {
                            console.error('Error setting agent offline:', err);
                        });
                        window.location.href = 'index.html';
                    }
                });
            } else {
                if (confirm('Are you sure you want to logout?')) {
                    // Set agent as offline
                    updateAgentPresence(false).catch(err => {
                        console.error('Error setting agent offline:', err);
                    });
                    window.location.href = 'index.html';
                }
            }
        });
    }

    // Set agent offline when page is closed/unloaded
    window.addEventListener('beforeunload', async () => {
        try {
            await updateAgentPresence(false);
        } catch (error) {
            console.error('Error setting agent offline on page unload:', error);
        }
    });
}

// Helper functions
function showLoading(show = true) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = show ? 'flex' : 'none';
    }
}

function hideLoading() {
    showLoading(false);
}

// Show access code verification modal
function showAccessCodeModal() {
    const modal = document.getElementById('access-code-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    // Clear input
    const input = document.getElementById('access-code-input');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }

    // Hide any previous errors
    hideAccessCodeError();

    // Handle form submission
    const form = document.getElementById('access-code-form');
    if (form) {
        // Remove existing listeners by cloning
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Add new listener
        const updatedForm = document.getElementById('access-code-form');
        const updatedInput = document.getElementById('access-code-input');

        updatedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Trim and normalize the input
            let code = updatedInput.value.trim();

            // Remove any non-digit characters
            code = code.replace(/\D/g, '');

            // Limit to 4 digits
            if (code.length > 4) {
                code = code.substring(0, 4);
                updatedInput.value = code;
            }

            if (code.length === 4 && /^\d{4}$/.test(code)) {
                // Hide modal and show loading
                modal.style.display = 'none';
                showLoading();
                hideAccessCodeError();
                await validateAgentCode(code);
            } else {
                showAccessCodeError('Please enter a valid 4-digit code');
            }
        });

        // Auto-submit on 4 digits entered and normalize input
        if (updatedInput) {
            // Only allow digits
            updatedInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) {
                    value = value.substring(0, 4);
                }
                e.target.value = value;
            });
            updatedInput.addEventListener('input', (e) => {
                const code = e.target.value.trim();
                if (code.length === 4 && /^\d{4}$/.test(code)) {
                    // Auto-submit after a brief delay
                    setTimeout(() => {
                        updatedForm.dispatchEvent(new Event('submit'));
                    }, 300);
                }
            });
        }
    }
}

// Show access code error
function showAccessCodeError(message) {
    const errorEl = document.getElementById('access-code-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

// Hide access code error
function hideAccessCodeError() {
    const errorEl = document.getElementById('access-code-error');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

function updateLoadingProgress(percent, subtitle = null) {
    const percentageEl = document.getElementById('loading-percentage');
    const progressBar = document.getElementById('loading-progress-bar');
    const subtitleEl = document.getElementById('loading-subtitle');

    if (percentageEl) percentageEl.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (subtitleEl && subtitle) {
        subtitleEl.textContent = subtitle;
        subtitleEl.style.display = 'block';
    }
}

function showError(message, title = 'Error') {
    if (window.showErrorDialog) {
        window.showErrorDialog(message, title);
    } else {
        alert(`${title}: ${message}`);
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

// Make functions globally available
window.db = db;
window.viewVoterForAgent = viewVoterForAgent;
window.openAgentActionModal = openAgentActionModal;
window.closeModal = closeModal;
window.quickUpdatePledge = quickUpdatePledge;
window.addRemarkForVoter = addRemarkForVoter;