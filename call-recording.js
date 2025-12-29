// Call Recording Portal JavaScript
// Handles call link access code validation and call recording

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
    signInAnonymously
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp,
    updateDoc,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize Firebase (check if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentLinkData = null;
let linkId = null;

// Get linkId from URL
const urlParams = new URLSearchParams(window.location.search);
linkId = urlParams.get('linkId');

// Log for debugging
if (linkId) {
    console.log('[Call Recording] Initial linkId from URL:', linkId);
} else {
    console.warn('[Call Recording] No linkId found in URL on initialization');
    console.warn('[Call Recording] Current URL:', window.location.href);
}

// Initialize call recording portal
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Call Recording] Initializing...');
    console.log('[Call Recording] Link ID from URL:', linkId);

    // Hide loading screen initially, show access code modal first
    hideLoading();
    showAccessCodeModal();

    // Small delay to ensure modal is rendered before showing errors
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!linkId) {
        showAccessCodeError('Invalid link. No link ID found.');
        return;
    }

    // No need for anonymous authentication - we'll use email/password authentication
    console.log('[Call Recording] Waiting for user to enter credentials...');
});

// Show loading screen
function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

// Hide loading screen
function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
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

// Validate credentials and load link data
async function validateAccessCode(email, password) {
    try {
        updateLoadingProgress(20, 'Validating credentials...');

        // Validate email
        if (!email || typeof email !== 'string' || email.trim() === '') {
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Please enter a valid email address.');
            return;
        }
        email = email.trim().toLowerCase();

        // Validate password
        if (!password || typeof password !== 'string' || password.trim() === '') {
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Please enter the temporary password.');
            return;
        }
        password = password.trim();

        console.log('[Call Recording] Validating credentials for email:', email);

        // Ensure linkId is available (re-read from URL if needed, or use from currentLinkData)
        if (!linkId) {
            // Try to get from currentLinkData first
            if (currentLinkData && currentLinkData.linkId) {
                linkId = currentLinkData.linkId;
                console.log('[Call Recording] Using linkId from currentLinkData:', linkId);
            } else {
                // Fallback to reading from URL
                const urlParams = new URLSearchParams(window.location.search);
                linkId = urlParams.get('linkId');
                console.log('[Call Recording] Re-read linkId from URL:', linkId);
            }
        }

        // Validate linkId exists and is valid
        if (!linkId || typeof linkId !== 'string' || linkId.trim() === '') {
            console.error('[Call Recording] No linkId available or invalid');
            console.error('[Call Recording] linkId value:', linkId);
            console.error('[Call Recording] linkId type:', typeof linkId);
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Invalid link. No link ID found in URL. Please check the link and try again.');
            return;
        }

        // Trim linkId to remove any whitespace
        linkId = linkId.trim();

        // Get the call link document
        console.log('[Call Recording] Attempting to read callLink with ID:', linkId);
        console.log('[Call Recording] Current auth state:', auth.currentUser ? {
            uid: auth.currentUser.uid,
            isAnonymous: auth.currentUser.isAnonymous,
            email: auth.currentUser.email
        } : 'Not authenticated');

        const linkRef = doc(db, 'callLinks', linkId);
        let linkSnap;

        try {
            linkSnap = await getDoc(linkRef);
        } catch (error) {
            console.error('[Call Recording] Error reading callLink:', error);
            console.error('[Call Recording] Error code:', error.code);
            console.error('[Call Recording] Error message:', error.message);

            if (error.code === 'permission-denied') {
                hideLoading();
                showAccessCodeModal();
                showAccessCodeError('Permission denied. Please check Firestore rules or try again.');
                return;
            } else {
                hideLoading();
                showAccessCodeModal();
                showAccessCodeError('Failed to validate link. Please check your connection and try again.');
                return;
            }
        }

        if (!linkSnap.exists()) {
            console.error('[Call Recording] Link not found:', linkId);
            console.error('[Call Recording] This could be due to:');
            console.error('  1. Link ID is incorrect');
            console.error('  2. Link was deleted');
            console.error('  3. Firestore permission issue');
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Invalid link. The link may have been deleted or expired.');
            return;
        }

        const linkData = linkSnap.data();
        console.log('[Call Recording] Link data retrieved');

        // Verify email matches campaign email
        const campaignEmail = (linkData.campaignEmail || '').trim().toLowerCase();
        if (email !== campaignEmail) {
            console.error('[Call Recording] Email mismatch. Expected:', campaignEmail, 'Got:', email);
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Email does not match the campaign manager email for this link.');
            return;
        }

        // Verify temporary password
        if (!linkData.tempPassword || linkData.tempPassword !== password) {
            console.error('[Call Recording] Invalid temporary password');
            hideLoading();
            showAccessCodeModal();
            showAccessCodeError('Invalid temporary password. Please check and try again.');
            return;
        }

        console.log('[Call Recording] All credentials verified. Authenticating...');

        // Use anonymous authentication (credentials already verified against callLink)
        // This allows access without conflicting with existing user accounts
        try {
            updateLoadingProgress(40, 'Authenticating...');
            try {
                await signInAnonymously(auth);
                console.log('[Call Recording] Anonymous authentication successful');
            } catch (anonError) {
                // If anonymous auth fails, log warning but continue
                // Firestore rules should allow unauthenticated access for call links
                console.warn('[Call Recording] Anonymous authentication not available:', anonError.code);
                console.warn('[Call Recording] Continuing without authentication - Firestore rules should allow access');
            }
        } catch (authError) {
            console.error('[Call Recording] Authentication error:', authError);
            // Don't block access - credentials are already verified against callLink
            console.warn('[Call Recording] Continuing without authentication');
        }

        // Store link data globally
        currentLinkData = {
            linkId: linkId,
            callerNames: linkData.callerNames || [],
            campaignEmail: linkData.campaignEmail
        };

        window.callLinkData = currentLinkData;
        window.isCallLinkAccess = true;

        updateLoadingProgress(60, 'Loading call recording interface...');

        // Show call recording interface
        setTimeout(() => {
            hideLoading();
            showCallRecordingInterface();
        }, 500);

    } catch (error) {
        console.error('[Call Recording] Error validating access code:', error);
        hideLoading();
        showAccessCodeModal();
        showAccessCodeError('Failed to validate access code. Please try again.');
    }
}

// Show call recording interface
async function showCallRecordingInterface() {
    const modal = document.getElementById('access-code-modal');
    const container = document.getElementById('call-recording-container');
    const mainContent = document.getElementById('call-recording-main');

    if (modal) modal.style.display = 'none';
    if (container) container.style.display = 'block';

    // Load call form (await to ensure it completes)
    if (mainContent && currentLinkData) {
        await loadCallForm(mainContent);
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit?')) {
                window.location.href = 'index.html';
            }
        });
    }
}

// Load call form
async function loadCallForm(container) {
    if (!currentLinkData || !currentLinkData.callerNames || currentLinkData.callerNames.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--text-light); font-size: 16px;">No caller names configured for this link.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: var(--text-color); font-family: 'Poppins', sans-serif;">Record a Call</h2>
            <p style="margin: 0; color: var(--text-light); font-size: 14px;">Fill in the details below to record a call</p>
        </div>

        <form id="call-recording-form" class="modal-form">
            <div class="form-group" style="position: relative;">
                <label for="call-voter-name">Voter Name *</label>
                <input type="text" id="call-voter-name" name="call-voter-name" placeholder="Search voter by name, ID, phone..." autocomplete="off" required>
                <input type="hidden" id="call-voter-id-hidden" name="call-voter-id-hidden">
                <div id="call-voter-dropdown" class="dropdown-list" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid var(--border-color); border-radius: 12px; max-height: 300px; overflow-y: auto; z-index: 1000; margin-top: 5px; box-shadow: var(--shadow-lg);">
                    <!-- Dropdown options will be populated here -->
                </div>
                <small style="color: var(--text-light); font-size: 12px; margin-top: 5px; display: block;">Start typing to search for a voter</small>
            </div>

            <div class="form-group">
                <label for="call-voter-id">Voter ID</label>
                <input type="text" id="call-voter-id" name="call-voter-id" readonly class="readonly-input">
            </div>

            <div class="form-group">
                <label for="call-voter-phone">Phone Number</label>
                <input type="tel" id="call-voter-phone" name="call-voter-phone" readonly class="readonly-input">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="call-voter-constituency">Constituency</label>
                    <input type="text" id="call-voter-constituency" name="call-voter-constituency" readonly class="readonly-input">
                </div>
                <div class="form-group">
                    <label for="call-voter-island">Island</label>
                    <input type="text" id="call-voter-island" name="call-voter-island" readonly class="readonly-input">
                </div>
            </div>

            <div class="form-group">
                <label for="call-voter-address">Address</label>
                <input type="text" id="call-voter-address" name="call-voter-address" readonly class="readonly-input">
            </div>

            <div class="form-group">
                <label for="call-caller-name">Caller Name *</label>
                <select id="call-caller-name-dropdown" name="call-caller-name" required style="width: 100%; padding: 12px 16px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px; font-family: 'Poppins', sans-serif; color: var(--text-color); background: var(--white); transition: var(--transition); box-sizing: border-box;">
                    <option value="">Select caller name</option>
                    ${currentLinkData.callerNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
            </div>

            <div class="form-group">
                <label for="call-date">Call Date *</label>
                <input type="date" id="call-date" name="call-date" required>
            </div>

            <div class="form-group">
                <label for="call-status">Call Status *</label>
                <select id="call-status" name="call-status" required>
                    <option value="">Select status</option>
                    <option value="answered">Answered</option>
                    <option value="no-answer">No Answer</option>
                    <option value="busy">Busy</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            <div class="form-group">
                <label for="call-notes">Notes</label>
                <textarea id="call-notes" name="call-notes" rows="4" placeholder="Enter any additional notes about the call"></textarea>
            </div>

            <div id="call-recording-error" class="error-message" style="display: none;"></div>

            <div class="modal-footer" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                <button type="button" class="btn-secondary btn-compact" onclick="resetCallForm()">Clear</button>
                <button type="submit" class="btn-primary btn-compact">Record Call</button>
            </div>
        </form>
    `;

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('call-date');
    if (dateInput) {
        dateInput.value = today;
    }

    // Setup voter name search (await to ensure voters are loaded)
    await setupVoterSearch();

    // Setup form submission
    const form = document.getElementById('call-recording-form');
    if (form) {
        form.addEventListener('submit', handleCallSubmission);
    }
}

// Global variable to store all voters
let allVotersForCall = [];

// Setup voter search with dropdown
async function setupVoterSearch() {
    const voterInput = document.getElementById('call-voter-name');
    const voterDropdown = document.getElementById('call-voter-dropdown');
    const voterIdInput = document.getElementById('call-voter-id');
    const voterPhoneInput = document.getElementById('call-voter-phone');
    const voterConstituencyInput = document.getElementById('call-voter-constituency');
    const voterIslandInput = document.getElementById('call-voter-island');
    const voterAddressInput = document.getElementById('call-voter-address');
    const voterIdHidden = document.getElementById('call-voter-id-hidden');

    if (!voterInput || !voterDropdown) return;

    // Load all voters for the campaign
    console.log('[Call Recording] Starting to load voters...');
    try {
        await loadVotersForCall();
        console.log('[Call Recording] Voters loaded. Total:', allVotersForCall.length);

        if (allVotersForCall.length === 0) {
            console.warn('[Call Recording] WARNING: No voters loaded. Search will not work.');
            // Update placeholder to indicate no voters
            const voterInputEl = document.getElementById('call-voter-name');
            if (voterInputEl) {
                voterInputEl.placeholder = 'No voters found for this campaign. Check campaign email matches.';
                voterInputEl.disabled = true;
                voterInputEl.style.cursor = 'not-allowed';
            }
            // Show a visible message to the user
            const formGroup = voterInput.parentElement;
            if (formGroup) {
                const errorMsg = document.createElement('div');
                errorMsg.id = 'voter-load-error';
                errorMsg.style.cssText = 'color: var(--danger-color); font-size: 12px; margin-top: 5px; padding: 8px; background: rgba(220, 38, 38, 0.1); border-radius: 4px;';
                errorMsg.textContent = 'No voters found for this campaign. Please verify the campaign email matches your voter database.';
                formGroup.appendChild(errorMsg);
            }
        } else {
            // Reset placeholder if voters loaded successfully
            const voterInputEl = document.getElementById('call-voter-name');
            if (voterInputEl) {
                voterInputEl.placeholder = 'Search voter by name, ID, phone...';
                voterInputEl.disabled = false;
                voterInputEl.style.cursor = 'text';
            }
            // Remove any error messages
            const errorMsg = document.getElementById('voter-load-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    } catch (error) {
        console.error('[Call Recording] Failed to load voters:', error);
        console.error('[Call Recording] Error stack:', error.stack);

        const voterInputEl = document.getElementById('call-voter-name');
        if (voterInputEl) {
            voterInputEl.placeholder = 'Error loading voters. Check console (F12) for details.';
            voterInputEl.disabled = true;
            voterInputEl.style.cursor = 'not-allowed';
        }

        // Show error message to user
        const voterInputForError = document.getElementById('call-voter-name');
        const formGroup = voterInputForError.parentElement;
        if (formGroup) {
            // Remove any existing error message
            const existingError = document.getElementById('voter-load-error');
            if (existingError) {
                existingError.remove();
            }

            const errorMsg = document.createElement('div');
            errorMsg.id = 'voter-load-error';
            errorMsg.style.cssText = 'color: var(--danger-color); font-size: 12px; margin-top: 5px; padding: 8px; background: rgba(220, 38, 38, 0.1); border-radius: 4px;';
            errorMsg.innerHTML = `<strong>Error loading voters:</strong> ${error.message || 'Unknown error'}. <br>Please check the browser console (F12) for more details.`;
            formGroup.appendChild(errorMsg);
        }
    }

    // Debounce function for search
    let searchTimeout;

    function debounceSearch(func, delay) {
        return function(...args) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Filter and display voters
    function filterVoters(searchTerm) {
        console.log('[Call Recording] Filtering voters with term:', searchTerm);
        console.log('[Call Recording] Total voters available:', allVotersForCall.length);
        console.log('[Call Recording] Voter dropdown element:', voterDropdown);

        if (!voterDropdown) {
            console.error('[Call Recording] Voter dropdown element not found!');
            return;
        }

        if (!searchTerm || searchTerm.trim() === '') {
            voterDropdown.style.display = 'none';
            return;
        }

        if (allVotersForCall.length === 0) {
            console.warn('[Call Recording] No voters loaded. Showing message.');
            voterDropdown.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-light);">No voters available. Please wait for voters to load...</div>';
            voterDropdown.style.display = 'block';
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filtered = allVotersForCall.filter(voter => {
            const name = (voter.name || '').toLowerCase();
            const voterId = (voter.voterId || voter.idNumber || '').toLowerCase();
            const phone = (voter.phone || voter.phoneNumber || voter.mobile || '').toLowerCase();
            const island = (voter.island || voter.constituency || '').toLowerCase();
            const address = (voter.address || voter.permanentAddress || '').toLowerCase();

            return name.includes(term) ||
                voterId.includes(term) ||
                phone.includes(term) ||
                island.includes(term) ||
                address.includes(term);
        }).slice(0, 20); // Limit to 20 results for performance

        console.log('[Call Recording] Filtered voters:', filtered.length);

        if (filtered.length === 0) {
            voterDropdown.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-light);">No voters found matching "' + searchTerm + '"</div>';
            voterDropdown.style.display = 'block';
            voterDropdown.style.zIndex = '10000';
            return;
        }

        // Render dropdown options
        voterDropdown.innerHTML = filtered.map(voter => {
            const name = voter.name || 'N/A';
            const idNumber = voter.voterId || voter.idNumber || 'N/A';
            const phone = voter.phone || voter.phoneNumber || voter.mobile || '';
            const constituency = voter.constituency || '';
            const island = voter.island || '';
            const address = (voter.address || '').replace(/"/g, '&quot;');
            // Get permanent address separately
            const permanentAddress = (voter.permanentAddress || '').replace(/"/g, '&quot;');

            return `
                <div class="dropdown-option" 
                     data-voter-id="${voter.id}" 
                     data-voter-name="${name.replace(/"/g, '&quot;')}" 
                     data-voter-idnumber="${idNumber}" 
                     data-voter-phone="${phone}" 
                     data-voter-constituency="${constituency.replace(/"/g, '&quot;')}" 
                     data-voter-island="${island.replace(/"/g, '&quot;')}" 
                     data-voter-address="${address}" 
                     data-voter-permanent-address="${permanentAddress}"
                     style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border-light); transition: background 0.2s;">
                    <div style="font-weight: 600; color: var(--text-color); margin-bottom: 4px;">${name}</div>
                    <div style="font-size: 12px; color: var(--text-light);">
                        ID: ${idNumber}${phone ? ` • Phone: ${phone}` : ''}${constituency ? ` • ${constituency}` : ''}${island ? ` • ${island}` : ''}
                    </div>
                    ${permanentAddress ? `<div style="font-size: 11px; color: var(--text-light); margin-top: 4px; font-style: italic;">Address: ${permanentAddress}</div>` : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        voterDropdown.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', () => {
                const voterId = option.dataset.voterId;
                const voterName = option.dataset.voterName;
                const voterIdNumber = option.dataset.voterIdnumber;
                const voterPhone = option.dataset.voterPhone || '';
                const voterConstituency = option.dataset.voterConstituency || '';
                const voterIsland = option.dataset.voterIsland || '';
                const voterAddress = option.dataset.voterAddress || '';
                const voterPermanentAddress = option.dataset.voterPermanentAddress || '';

                // Get fresh references to all form elements (in case they were replaced)
                const currentVoterInput = document.getElementById('call-voter-name');
                const currentVoterIdInput = document.getElementById('call-voter-id');
                const currentVoterPhoneInput = document.getElementById('call-voter-phone');
                const currentVoterConstituencyInput = document.getElementById('call-voter-constituency');
                const currentVoterIslandInput = document.getElementById('call-voter-island');
                const currentVoterAddressInput = document.getElementById('call-voter-address');
                const currentVoterIdHidden = document.getElementById('call-voter-id-hidden');

                // Fill all form fields with fresh element references
                if (currentVoterInput) {
                    currentVoterInput.value = voterName;
                    console.log('[Call Recording] Set voter name to:', voterName);
                } else {
                    console.error('[Call Recording] Voter name input not found!');
                }

                if (currentVoterIdInput) currentVoterIdInput.value = voterIdNumber;
                if (currentVoterPhoneInput) currentVoterPhoneInput.value = voterPhone;
                if (currentVoterConstituencyInput) currentVoterConstituencyInput.value = voterConstituency;
                if (currentVoterIslandInput) currentVoterIslandInput.value = voterIsland;
                if (currentVoterAddressInput) {
                    // Show permanent address if available, otherwise show regular address
                    currentVoterAddressInput.value = voterPermanentAddress || voterAddress;
                }
                if (currentVoterIdHidden) currentVoterIdHidden.value = voterId;

                // Hide dropdown
                const currentDropdown = document.getElementById('call-voter-dropdown');
                if (currentDropdown) {
                    currentDropdown.style.display = 'none';
                }
            });

            option.addEventListener('mouseenter', () => {
                option.style.background = 'var(--light-color)';
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'white';
            });
        });

        voterDropdown.style.display = 'block';
        voterDropdown.style.zIndex = '10000';
        console.log('[Call Recording] Dropdown displayed with', filtered.length, 'results');
    }

    // Search input handler with debounce
    const debouncedFilter = debounceSearch(filterVoters, 300);

    // Remove any existing listeners by cloning the input
    const newVoterInput = voterInput.cloneNode(true);
    voterInput.parentNode.replaceChild(newVoterInput, voterInput);
    const updatedVoterInput = document.getElementById('call-voter-name');

    if (updatedVoterInput) {
        console.log('[Call Recording] Setting up event listeners on voter input');

        updatedVoterInput.addEventListener('input', (e) => {
            const value = e.target.value;
            console.log('[Call Recording] Search input changed:', value);
            console.log('[Call Recording] Voters available:', allVotersForCall.length);
            debouncedFilter(value);
        });

        updatedVoterInput.addEventListener('focus', () => {
            console.log('[Call Recording] Voter input focused');
            if (updatedVoterInput.value.trim()) {
                filterVoters(updatedVoterInput.value);
            }
        });

        updatedVoterInput.addEventListener('keydown', (e) => {
            // Allow typing
            console.log('[Call Recording] Key pressed in voter input:', e.key);
        });
    } else {
        console.error('[Call Recording] Updated voter input element not found after cloning!');
    }

    // Close dropdown when clicking outside
    const clickOutsideHandler = (e) => {
        const updatedInput = document.getElementById('call-voter-name');
        const updatedDropdown = document.getElementById('call-voter-dropdown');
        if (updatedInput && updatedDropdown &&
            !updatedInput.contains(e.target) &&
            !updatedDropdown.contains(e.target)) {
            updatedDropdown.style.display = 'none';
        }
    };

    // Use a single document-level listener
    document.removeEventListener('click', clickOutsideHandler); // Remove if exists
    document.addEventListener('click', clickOutsideHandler);

    console.log('[Call Recording] Voter search setup completed. Voters loaded:', allVotersForCall.length);
}

// Load all voters for the campaign
async function loadVotersForCall() {
    try {
        if (!currentLinkData || !currentLinkData.campaignEmail) {
            console.warn('[Call Recording] No campaign email available for voter loading');
            allVotersForCall = [];
            return;
        }

        const campaignEmail = currentLinkData.campaignEmail;
        console.log('[Call Recording] Loading voters for campaign:', campaignEmail);
        console.log('[Call Recording] Campaign email type:', typeof campaignEmail);
        console.log('[Call Recording] Campaign email length:', campaignEmail ? campaignEmail.length : 0);
        console.log('[Call Recording] Campaign email trimmed:', campaignEmail ? campaignEmail.trim() : 'null');

        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Build query to get voters for this campaign
        // Note: This query requires a Firestore index on campaignEmail if not already created
        // Also try querying by 'email' field as fallback since some voters might use that field
        const trimmedCampaignEmail = campaignEmail ? campaignEmail.trim() : '';
        const votersQuery = query(
            collection(db, 'voters'),
            where('campaignEmail', '==', trimmedCampaignEmail)
        );

        console.log('[Call Recording] Executing query for campaignEmail:', trimmedCampaignEmail);

        let snapshot;
        try {
            snapshot = await getDocs(votersQuery);
            console.log('[Call Recording] Voters query result:', snapshot.size, 'documents');

            // If no results, try querying by 'email' field as fallback
            if (snapshot.empty && trimmedCampaignEmail) {
                console.warn('[Call Recording] No voters found with campaignEmail, trying email field as fallback...');
                try {
                    const emailQuery = query(
                        collection(db, 'voters'),
                        where('email', '==', trimmedCampaignEmail)
                    );
                    const emailSnapshot = await getDocs(emailQuery);
                    console.log('[Call Recording] Email field query result:', emailSnapshot.size, 'documents');
                    if (!emailSnapshot.empty) {
                        snapshot = emailSnapshot;
                        console.log('[Call Recording] Found voters using email field instead of campaignEmail');
                    }
                } catch (emailQueryError) {
                    console.warn('[Call Recording] Email field query also failed:', emailQueryError);
                    // Continue with empty snapshot
                }
            }
        } catch (queryError) {
            console.error('[Call Recording] Error executing voters query:', queryError);
            console.error('[Call Recording] Query error code:', queryError.code);
            console.error('[Call Recording] Query error message:', queryError.message);
            console.error('[Call Recording] Campaign email used:', currentLinkData.campaignEmail);
            console.error('[Call Recording] Auth state:', auth.currentUser ? {
                uid: auth.currentUser.uid,
                isAnonymous: auth.currentUser.isAnonymous,
                email: auth.currentUser.email
            } : 'Not authenticated');

            // Handle different error types
            if (queryError.code === 'permission-denied') {
                const errorMsg = 'Permission denied: Unable to load voters. Please ensure Firestore rules allow unauthenticated reads for voters with campaignEmail. Rules must be deployed to Firebase.';
                console.error('[Call Recording]', errorMsg);
                throw new Error(errorMsg);
            } else if (queryError.code === 'failed-precondition' || queryError.code === 400 || queryError.message.includes('400') || queryError.message.includes('index')) {
                // Missing index or 400 error - try fallback: load all voters and filter client-side
                console.warn('[Call Recording] Query failed, trying fallback: loading all voters and filtering client-side');
                try {
                    const allVotersRef = collection(db, 'voters');
                    const allVotersSnapshot = await getDocs(allVotersRef);
                    console.log('[Call Recording] Loaded all voters:', allVotersSnapshot.size, 'documents');

                    // Filter by campaignEmail client-side (check both campaignEmail and email fields)
                    const trimmedCampaignEmail = currentLinkData.campaignEmail ? currentLinkData.campaignEmail.trim() : '';
                    const filteredDocs = allVotersSnapshot.docs.filter(doc => {
                        const data = doc.data();
                        const voterCampaignEmail = (data.campaignEmail || data.email || '').trim();
                        const matches = voterCampaignEmail === trimmedCampaignEmail;
                        if (!matches && voterCampaignEmail) {
                            console.log('[Call Recording] Voter campaignEmail mismatch:', {
                                expected: trimmedCampaignEmail,
                                found: voterCampaignEmail,
                                voterName: data.name || 'N/A'
                            });
                        }
                        return matches;
                    });

                    // Log sample of campaign emails found if no matches
                    if (filteredDocs.length === 0 && allVotersSnapshot.docs.length > 0) {
                        console.warn('[Call Recording] No voters matched. Sample campaign emails found:');
                        const sampleEmails = allVotersSnapshot.docs.slice(0, 5).map(doc => {
                            const data = doc.data();
                            return {
                                campaignEmail: data.campaignEmail || 'not set',
                                email: data.email || 'not set',
                                name: data.name || 'N/A'
                            };
                        });
                        console.warn('[Call Recording] Sample emails:', sampleEmails);
                        console.warn('[Call Recording] Looking for:', trimmedCampaignEmail);
                    }

                    console.log('[Call Recording] Filtered to campaign voters:', filteredDocs.length, 'documents');

                    // Create a snapshot-like object that matches Firestore QuerySnapshot structure
                    snapshot = {
                        docs: filteredDocs,
                        size: filteredDocs.length,
                        empty: filteredDocs.length === 0,
                        query: votersQuery, // Keep reference to original query
                        metadata: {
                            fromCache: false,
                            hasPendingWrites: false
                        }
                    };

                    console.log('[Call Recording] Fallback successful - using client-side filtered results');
                } catch (fallbackError) {
                    console.error('[Call Recording] Fallback also failed:', fallbackError);
                    const errorMsg = 'Failed to load voters. Error: ' + (queryError.message || queryError.code || 'Unknown error') + '. Please check Firestore rules and indexes.';
                    throw new Error(errorMsg);
                }
            } else {
                throw queryError;
            }
        }

        // Check if snapshot is valid
        if (!snapshot || !snapshot.docs) {
            console.error('[Call Recording] Invalid snapshot received');
            allVotersForCall = [];
            throw new Error('Invalid response from Firestore');
        }

        allVotersForCall = snapshot.docs.map(doc => {
            const data = doc.data();
            const voter = {
                id: doc.id,
                name: data.name || 'N/A',
                voterId: data.voterId || data.idNumber || '',
                idNumber: data.idNumber || data.voterId || '',
                phone: data.phone || data.phoneNumber || data.mobile || data.contact || data.number || '',
                constituency: data.constituency || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : '') || '',
                island: data.island || '',
                address: data.address || data.location || '',
                permanentAddress: data.permanentAddress || data.address || data.location || '',
                // Include email fields for debugging
                campaignEmail: data.campaignEmail || data.email || '',
                email: data.email || ''
            };
            // Log first voter's email fields for debugging
            if (snapshot.docs.indexOf(doc) === 0) {
                console.log('[Call Recording] First voter email fields:', {
                    campaignEmail: data.campaignEmail,
                    email: data.email,
                    name: data.name
                });
            }
            return voter;
        });

        console.log(`[Call Recording] Successfully loaded ${allVotersForCall.length} voters for campaign:`, currentLinkData.campaignEmail);

        if (allVotersForCall.length === 0) {
            console.warn('[Call Recording] No voters found for this campaign.');
            console.warn('[Call Recording] Campaign email used:', currentLinkData.campaignEmail);
            console.warn('[Call Recording] Campaign email (trimmed):', currentLinkData.campaignEmail ? currentLinkData.campaignEmail.trim() : 'null');
            console.warn('[Call Recording] This could mean:');
            console.warn('  1. No voters exist for this campaign email');
            console.warn('  2. Voters have a different campaignEmail value (check for case sensitivity or whitespace)');
            console.warn('  3. Voters use "email" field instead of "campaignEmail"');
            console.warn('  4. Firestore rules are blocking the read');
            console.warn('[Call Recording] To debug: Check voter documents in Firestore console and verify campaignEmail field matches exactly');
        } else {
            console.log('[Call Recording] Sample voter data (first voter):', allVotersForCall[0]);
            console.log('[Call Recording] First voter campaignEmail:', allVotersForCall[0].campaignEmail || 'not in sample data');
        }
    } catch (error) {
        console.error('[Call Recording] Error loading voters:', error);
        console.error('[Call Recording] Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        allVotersForCall = [];

        // Show user-friendly error message
        const errorMessage = error.code === 'permission-denied' ?
            'Permission denied: Firestore rules may not allow unauthenticated reads. Please deploy updated Firestore rules to Firebase.' :
            `Failed to load voters: ${error.message || 'Unknown error'}. Please check your connection and Firestore rules.`;

        console.error('[Call Recording]', errorMessage);

        // Show error to user if dialog system is available
        if (window.showError) {
            window.showError(errorMessage, 'Error Loading Voters');
        } else {
            // Fallback: show alert
            alert(errorMessage);
        }
    }
}

// Handle call submission
async function handleCallSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const errorDiv = document.getElementById('call-recording-error');
    errorDiv.style.display = 'none';

    const formData = new FormData(form);
    const voterName = formData.get('call-voter-name');
    const callerName = formData.get('call-caller-name');
    const callDate = formData.get('call-date');
    const callStatus = formData.get('call-status');
    const callNotes = formData.get('call-notes');
    const voterId = formData.get('call-voter-id');
    const voterDocumentId = formData.get('call-voter-id-hidden');
    const voterPhone = formData.get('call-voter-phone');
    const voterConstituency = formData.get('call-voter-constituency');
    const voterIsland = formData.get('call-voter-island');
    const voterAddress = formData.get('call-voter-address');

    if (!voterName || !voterName.trim()) {
        showFormError('Voter name is required.');
        return;
    }

    if (!callerName || !callerName.trim()) {
        showFormError('Caller name is required.');
        return;
    }

    if (!callStatus || !callStatus.trim()) {
        showFormError('Call status is required.');
        return;
    }

    try {
        updateLoadingProgress(50, 'Recording call...');

        const callData = {
            voterName: voterName.trim(),
            voterId: voterId || '',
            voterDocumentId: voterDocumentId || '',
            phone: voterPhone || '',
            constituency: voterConstituency || ((window.campaignData && window.campaignData.constituency) ? window.campaignData.constituency : ''),
            island: voterIsland || '',
            address: voterAddress || '',
            caller: callerName.trim(),
            callDate: callDate ? new Date(callDate) : serverTimestamp(),
            status: callStatus.trim(),
            notes: callNotes || '',
            campaignEmail: currentLinkData.campaignEmail,
            callLinkId: linkId,
            createdAt: serverTimestamp()
        };

        // Save call to Firestore
        const callsRef = collection(db, 'calls');
        await addDoc(callsRef, callData);

        // Increment call count for the link
        // Ensure linkId is available before updating (use from currentLinkData if available)
        if (!linkId) {
            if (currentLinkData && currentLinkData.linkId) {
                linkId = currentLinkData.linkId;
                console.log('[Call Recording] Using linkId from currentLinkData for increment:', linkId);
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                linkId = urlParams.get('linkId');
                console.log('[Call Recording] Re-read linkId from URL for increment:', linkId);
            }
        }

        if (!linkId || typeof linkId !== 'string' || linkId.trim() === '') {
            console.error('[Call Recording] Cannot increment callsMade - linkId is invalid:', linkId);
            // Don't throw error, just log - call recording should still succeed
        } else {
            linkId = linkId.trim();
            const linkRef = doc(db, 'callLinks', linkId);
            await updateDoc(linkRef, {
                callsMade: increment(1)
            });
        }

        updateLoadingProgress(100, 'Call recorded successfully!');

        // Show success and reset form
        setTimeout(() => {
            hideLoading();
            if (window.showSuccess) {
                window.showSuccess('Call recorded successfully!', 'Success');
            } else {
                alert('Call recorded successfully!');
            }
            resetCallForm();
        }, 500);

    } catch (error) {
        console.error('[Call Recording] Error recording call:', error);
        hideLoading();
        showFormError('Failed to record call. Please try again.');
    }
}

// Reset call form
function resetCallForm() {
    const form = document.getElementById('call-recording-form');
    if (form) {
        form.reset();
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('call-date');
        if (dateInput) {
            dateInput.value = today;
        }
        // Clear error
        const errorDiv = document.getElementById('call-recording-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

// Show form error
function showFormError(message) {
    const errorDiv = document.getElementById('call-recording-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Show access code verification modal
function showAccessCodeModal() {
    const modal = document.getElementById('access-code-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    // Clear inputs
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (emailInput) emailInput.value = '';
    if (passwordInput) {
        passwordInput.value = '';
        setTimeout(() => passwordInput.focus(), 100);
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
        const updatedEmailInput = document.getElementById('login-email');
        const updatedPasswordInput = document.getElementById('login-password');

        updatedForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = updatedEmailInput ? updatedEmailInput.value.trim() : '';
            const password = updatedPasswordInput ? updatedPasswordInput.value.trim() : '';

            // Validate all fields
            if (!email || !email.includes('@')) {
                showAccessCodeError('Please enter a valid email address.');
                return;
            }

            if (!password || password.length < 6) {
                showAccessCodeError('Please enter the temporary password.');
                return;
            }

            modal.style.display = 'none';
            showLoading();
            hideAccessCodeError();
            await validateAccessCode(email, password);
        });

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