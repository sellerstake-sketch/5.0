// Modal System with Full Form Functionality
// Provides complete modal forms for all campaign management features

// Check if modal overlay exists, if not, create one
function ensureModalExists() {
    let modalOverlay = document.getElementById('modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'modal-overlay';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.display = 'none';
        modalOverlay.innerHTML = `
            <div class="modal-container" id="modal-container">
                <div class="modal-header">
                    <h2 id="modal-title">Modal Title</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="modal-maximize" id="modal-maximize-btn" title="Maximize">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                        </button>
                        <button class="modal-close" id="modal-close-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="modal-body" id="modal-body">
                    <!-- Modal content will be inserted here -->
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Add close button handler
        const closeBtn = modalOverlay.querySelector('#modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Add maximize button handler
        const maximizeBtn = modalOverlay.querySelector('#modal-maximize-btn');
        const modalContainer = modalOverlay.querySelector('#modal-container');
        if (maximizeBtn && modalContainer) {
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleModalMaximize(modalContainer, maximizeBtn);
            });
        }

        // Close on overlay click (only if import is not in progress)
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay && !isBulkImportInProgress && !modalOverlay.hasAttribute('data-import-in-progress')) {
                closeModal();
            }
        });
    }
    return modalOverlay;
}

// Get form template based on type
function getFormTemplate(type) {
    const templates = {
        candidate: getCandidateFormTemplate(),
        voter: getVoterFormTemplate(),
        event: getEventFormTemplate(),
        call: getCallFormTemplate(),
        pledge: getPledgeFormTemplate(),
        agent: getAgentFormTemplate(),
        ballot: getBallotFormTemplate(),
        transportation: getTransportationFormTemplate()
    };
    return templates[type] || '<p>Unknown form type</p>';
}

// Candidate Form Template
function getCandidateFormTemplate() {
    return `
        <form id="modal-form" class="modal-form">
            <div class="form-group">
                <label for="candidate-name">Full Name *</label>
                <input type="text" id="candidate-name" name="candidate-name" placeholder="Enter candidate full name" required>
            </div>
            <div class="form-group">
                <label for="candidate-id">Candidate ID</label>
                <input type="text" id="candidate-id" name="candidate-id" placeholder="Auto-generated if left empty">
                <small>Leave empty to auto-generate</small>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="candidate-position">Position *</label>
                    <select id="candidate-position" name="candidate-position" required>
                        <option value="">Select position</option>
                        <!-- Positions will be populated dynamically based on campaign type -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="candidate-island">Island *</label>
                    <select id="candidate-island" name="candidate-island" required>
                        <option value="">Select Island</option>
                    </select>
                    <small style="color: var(--text-light); font-size: 12px;">Islands from your constituency settings</small>
                </div>
            </div>
            <div class="form-group">
                <label for="candidate-status">Status</label>
                <select id="candidate-status" name="candidate-status">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Add Candidate</button>
            </div>
        </form>
    `;
}

// Voter Form Template
function getVoterFormTemplate() {
    const atolls = window.maldivesData.atolls || [];
    const atollOptions = atolls.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
    const islands = window.maldivesData.islands || {};
    const currentIslands = window.campaignData.island ? [window.campaignData.island] : [];

    return `
        <div class="import-mode-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color);">
            <button type="button" class="import-tab-btn active" data-mode="single" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid var(--primary-color); color: var(--primary-color); font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                Single Import
            </button>
            <button type="button" class="import-tab-btn" data-mode="batch" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-light); font-weight: 500; cursor: pointer; font-family: 'Poppins', sans-serif;">
                Batch CSV Import
            </button>
        </div>
        
        <!-- Single Import Form -->
        <form id="modal-form" class="modal-form import-form" data-import-mode="single" enctype="multipart/form-data" style="display: block;">
            <div class="form-group">
                <label for="voter-image" style="display: block; font-size: 14px; font-weight: 600; color: var(--text-color); margin-bottom: 8px;">Image</label>
                <div id="voter-image-upload-area" style="position: relative; border: 2px dashed var(--border-color); border-radius: 12px; padding: 32px 20px; text-align: center; background: var(--light-color); transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.borderColor='var(--primary-color)'; this.style.background='var(--primary-50)'" onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--light-color)'">
                    <input type="file" id="voter-image" name="voter-image" accept="image/*" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; opacity: 0; cursor: pointer; z-index: 1;" onchange="handleImagePreview(this)">
                    <div style="pointer-events: none; z-index: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display: block;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: var(--text-color);">Upload voter photo</p>
                        <p style="margin: 0; font-size: 13px; color: var(--text-light);">Click to browse or drag and drop</p>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--text-muted);">(Optional - JPG, PNG up to 5MB)</p>
                    </div>
                </div>
                <div id="voter-image-preview" style="margin-top: 16px; display: none; text-align: center;">
                    <div style="position: relative; display: inline-block;">
                        <img id="voter-image-preview-img" src="" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 12px; border: 3px solid var(--primary-color); box-shadow: 0 4px 12px rgba(111, 193, 218, 0.2); object-fit: cover;">
                        <button type="button" onclick="removeImagePreview()" style="position: absolute; top: -8px; right: -8px; width: 32px; height: 32px; border-radius: 50%; background: var(--danger-color); color: white; border: 2px solid white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Remove image">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="voter-id-number">ID Number *</label>
                <input type="text" id="voter-id-number" name="voter-id-number" placeholder="Enter ID number" required>
            </div>
            <div class="form-group">
                <label for="voter-name">Full Name *</label>
                <input type="text" id="voter-name" name="voter-name" placeholder="Enter voter full name" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="voter-dob">Date of Birth</label>
                    <input type="date" id="voter-dob" name="voter-dob" placeholder="Select date of birth">
                </div>
                <div class="form-group">
                    <label for="voter-age">Age</label>
                    <input type="number" id="voter-age" name="voter-age" placeholder="Enter age" min="18" max="120">
                </div>
            </div>
            <div class="form-group">
                <label for="voter-gender">Gender</label>
                <select id="voter-gender" name="voter-gender">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="voter-constituency">Constituency <span style="color: red;">*</span></label>
                    <select id="voter-constituency" name="voter-constituency" required>
                        <option value="">Select Constituency</option>
                    </select>
                    <small style="color: var(--text-light); font-size: 12px;">Select the constituency (Dhaaira)</small>
                </div>
                <div class="form-group">
                    <label for="voter-island">Island <span style="color: red;">*</span></label>
                    <select id="voter-island" name="voter-island" required>
                        <option value="">Select Island</option>
                    </select>
                    <small style="color: var(--text-light); font-size: 12px;">Islands will appear after selecting a constituency</small>
                </div>
            </div>
            <div class="form-group">
                <label for="voter-ballot">Ballot</label>
                <select id="voter-ballot" name="voter-ballot">
                    <option value="">Select ballot</option>
                    <!-- Ballots will be populated dynamically -->
                </select>
            </div>
            <div class="form-group">
                <label for="voter-permanent-address">Permanent Address *</label>
                <textarea id="voter-permanent-address" name="voter-permanent-address" rows="2" placeholder="Enter permanent address" required></textarea>
            </div>
            <div class="form-group">
                <label for="voter-current-location">Current Location *</label>
                <textarea id="voter-current-location" name="voter-current-location" rows="2" placeholder="Enter current location" required></textarea>
            </div>
            <div class="form-group">
                <label for="voter-number">Phone Number</label>
                <input type="tel" id="voter-number" name="voter-number" placeholder="Enter phone number">
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Import Voter</button>
            </div>
        </form>
        
        <!-- Batch CSV Import Form -->
        <div id="batch-import-form" class="import-form" data-import-mode="batch" style="display: none;">
            <div class="form-group">
                <label for="csv-file">CSV File *</label>
                <input type="file" id="csv-file" accept=".csv" required>
                <small>Upload a CSV file with voter data. <a href="#" id="download-csv-template" style="color: var(--primary-color); text-decoration: none;">Download template</a></small>
            </div>
            <div id="csv-preview" style="display: none; margin-top: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: var(--text-color);">Preview (First 5 rows):</h4>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                    <table id="csv-preview-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead style="background: var(--light-color); position: sticky; top: 0;">
                            <tr id="csv-preview-header"></tr>
                        </thead>
                        <tbody id="csv-preview-body"></tbody>
                    </table>
                </div>
                <p id="csv-row-count" style="margin-top: 10px; font-size: 13px; color: var(--text-light);"></p>
            </div>
            <div id="batch-import-error" class="error-message" style="display: none;"></div>
            <div id="batch-import-progress" style="display: none; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: var(--text-color);">
                    <span>Importing voters...</span>
                    <span id="batch-progress-text">0 / 0 (0%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div id="batch-progress-bar" style="height: 100%; background: var(--gradient-primary); width: 0%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="button" id="start-batch-import-btn" class="btn-primary btn-compact" disabled>Import Voters</button>
            </div>
        </div>
    `;
}

// Event Form Template
function getEventFormTemplate() {
    return `
        <form id="modal-form" class="modal-form">
            <div class="form-group">
                <label for="event-name">Event Name *</label>
                <input type="text" id="event-name" name="event-name" placeholder="Enter event name" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="event-date">Event Date *</label>
                    <input type="date" id="event-date" name="event-date" required>
                </div>
                <div class="form-group">
                    <label for="event-venue">Venue *</label>
                    <input type="text" id="event-venue" name="event-venue" placeholder="Enter venue" required>
                </div>
            </div>
            <div class="form-group">
                <label for="event-island">Island *</label>
                <select id="event-island" name="event-island" required>
                    <option value="">Select Island</option>
                </select>
                <small style="color: var(--text-light); font-size: 12px; margin-top: 4px;">Islands available in your constituency</small>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="event-start-time">Start Time *</label>
                    <input type="time" id="event-start-time" name="event-start-time" required>
                </div>
                <div class="form-group">
                    <label for="event-end-time">End Time *</label>
                    <input type="time" id="event-end-time" name="event-end-time" required>
                </div>
            </div>
            <div class="form-group">
                <label for="event-attendees">Expected Attendees</label>
                <input type="number" id="event-attendees" name="event-attendees" placeholder="Enter expected number" min="0">
            </div>
            <div class="form-group">
                <label for="event-description">Description</label>
                <textarea id="event-description" name="event-description" rows="3" placeholder="Enter event description"></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Schedule Event</button>
            </div>
        </form>
    `;
}

// Call Form Template
function getCallFormTemplate() {
    return `
        <form id="modal-form" class="modal-form">
            <div class="form-group">
                <label for="call-voter-name">Voter Name *</label>
                <div class="searchable-dropdown" style="position: relative;">
                    <input type="text" id="call-voter-name" name="call-voter-name" placeholder="Search voter by name..." autocomplete="off" required>
                    <input type="hidden" id="call-voter-id-hidden" name="call-voter-id-hidden">
                    <div id="call-voter-dropdown" class="dropdown-list" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid var(--border-color); border-radius: 12px; max-height: 300px; overflow-y: auto; z-index: 1000; margin-top: 5px; box-shadow: var(--shadow-lg);">
                        <!-- Voter options will be populated here -->
                    </div>
                </div>
                <small style="color: var(--text-light); font-size: 12px; margin-top: 5px; display: block;">Start typing to search voters</small>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="call-voter-id">Voter ID</label>
                    <input type="text" id="call-voter-id" name="call-voter-id" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);">
                </div>
                <div class="form-group">
                    <label for="call-voter-phone">Voter Phone Number</label>
                    <input type="text" id="call-voter-phone" name="call-voter-phone" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="call-voter-constituency">Constituency</label>
                    <input type="text" id="call-voter-constituency" name="call-voter-constituency" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);">
                </div>
                <div class="form-group">
                    <label for="call-voter-island">Island</label>
                    <input type="text" id="call-voter-island" name="call-voter-island" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="call-voter-address">Permanent Address</label>
                    <input type="text" id="call-voter-address" name="call-voter-address" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="call-caller-name">Caller Name *</label>
                    <div id="call-caller-name-container">
                        <input type="text" id="call-caller-name" name="call-caller-name" placeholder="Enter caller name" required style="display: none;">
                        <select id="call-caller-name-dropdown" name="call-caller-name-dropdown" required style="display: none;">
                            <option value="">Select caller name</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="call-date">Call Date *</label>
                    <input type="datetime-local" id="call-date" name="call-date" required>
                </div>
            </div>
            <div class="form-group">
                <label for="call-status">Call Status *</label>
                <select id="call-status" name="call-status" required>
                    <option value="answered">Answered</option>
                    <option value="no-answer">No Answer</option>
                    <option value="busy">Busy</option>
                    <option value="failed">Failed</option>
                </select>
            </div>
            <div class="form-group">
                <label for="call-notes">Notes</label>
                <textarea id="call-notes" name="call-notes" rows="4" placeholder="Enter call notes or conversation summary"></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Record Call</button>
            </div>
        </form>
    `;
}

// Pledge Form Template
function getPledgeFormTemplate() {
    return `
        <form id="modal-form" class="modal-form">
            <div class="form-group">
                <label for="pledge-voter-name">Voter Name *</label>
                <div class="searchable-dropdown" style="position: relative;">
                    <input type="text" id="pledge-voter-name" name="pledge-voter-name" placeholder="Search voter by name..." autocomplete="off" required>
                    <input type="hidden" id="pledge-voter-id-hidden" name="pledge-voter-id-hidden">
                    <div id="pledge-voter-dropdown" class="dropdown-list" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 2px solid var(--border-color); border-radius: 12px; max-height: 300px; overflow-y: auto; z-index: 1000; margin-top: 5px; box-shadow: var(--shadow-lg);">
                        <!-- Voter options will be populated here -->
                    </div>
                </div>
                <small style="color: var(--text-light); font-size: 12px; margin-top: 5px; display: block;">Start typing to search voters</small>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="pledge-voter-id">Voter ID</label>
                    <input type="text" id="pledge-voter-id" name="pledge-voter-id" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);">
                </div>
                <div class="form-group">
                    <label for="pledge-island">Island</label>
                    <input type="text" id="pledge-island" name="pledge-island" placeholder="Auto-filled when voter selected" readonly style="background: var(--light-color);" value="${window.campaignData?.island || ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="pledge-current-location">Current Location</label>
                <textarea id="pledge-current-location" name="pledge-current-location" rows="2" placeholder="Auto-filled when voter selected"></textarea>
            </div>
            <div class="form-group">
                <label for="pledge-candidate">Candidate *</label>
                <select id="pledge-candidate" name="pledge-candidate" required>
                    <option value="">Select candidate</option>
                    <!-- Candidates will be populated dynamically -->
                </select>
                <small id="pledge-candidate-hint" style="display: none; color: var(--text-light); font-size: 12px; margin-top: 4px;">
                    Hold Ctrl/Cmd to select multiple candidates
                </small>
            </div>
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
                <textarea id="pledge-notes" name="pledge-notes" rows="3" placeholder="Additional notes about the pledge"></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Add Pledge</button>
            </div>
        </form>
    `;
}

// Agent Form Template
function getAgentFormTemplate() {
    return `
        <form id="modal-form" class="modal-form">
            <div class="form-group">
                <label for="agent-name">Full Name *</label>
                <input type="text" id="agent-name" name="agent-name" placeholder="Enter agent full name" required>
            </div>
            <div class="form-group">
                <label for="agent-id">Agent ID</label>
                <input type="text" id="agent-id" name="agent-id" placeholder="Auto-generated if left empty">
                <small>Leave empty to auto-generate</small>
            </div>
            <div class="form-group">
                <label for="agent-area">Island *</label>
                <select id="agent-area" name="agent-area" required>
                    <option value="">Select Island</option>
                </select>
                <small>Islands available in your constituency</small>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="agent-phone">Phone Number</label>
                    <input type="tel" id="agent-phone" name="agent-phone" placeholder="Enter phone number">
                </div>
                <div class="form-group">
                    <label for="agent-email">Email</label>
                    <input type="email" id="agent-email" name="agent-email" placeholder="Enter email address">
                </div>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact" id="agent-submit-btn">Add Agent</button>
            </div>
        </form>
    `;
}

// Ballot Form Template
function getBallotFormTemplate() {
    return `
        <form id="modal-form" class="modal-form">
            <div class="form-group">
                <label for="ballot-number">Ballot Number *</label>
                <input type="text" id="ballot-number" name="ballot-number" placeholder="Enter ballot number" required>
            </div>
            <div class="form-group">
                <label for="ballot-location">Location *</label>
                <input type="text" id="ballot-location" name="ballot-location" placeholder="Enter ballot location" required>
            </div>
            <div class="form-group">
                <label for="ballot-expected-voters">Expected Voters *</label>
                <input type="number" id="ballot-expected-voters" name="ballot-expected-voters" placeholder="Enter expected number of voters" min="0" required>
            </div>
            <div class="form-group">
                <label for="ballot-status">Status</label>
                <select id="ballot-status" name="ballot-status">
                    <option value="open">Open</option>
                    <option value="close">Close</option>
                </select>
            </div>
            <div class="form-group">
                <label for="ballot-notes">Notes</label>
                <textarea id="ballot-notes" name="ballot-notes" rows="3" placeholder="Additional notes (optional)"></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Add Ballot</button>
            </div>
        </form>
    `;
}

// Transportation Form Template
function getTransportationFormTemplate() {
    return `
        <div class="transportation-form-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color);">
            <button type="button" class="transport-form-tab-btn active" data-transport-type="flights" style="padding: 10px 20px; background: none; border: none; border-bottom: 3px solid var(--primary-color); color: var(--primary-color); font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>
                </svg>
                Flight
            </button>
            <button type="button" class="transport-form-tab-btn" data-transport-type="speedboats" style="padding: 10px 20px; background: none; border: none; border-bottom: 3px solid transparent; color: var(--text-light); font-weight: 500; cursor: pointer; font-family: 'Poppins', sans-serif;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;">
                    <path d="M3 18h18"></path>
                    <path d="M3 12h18"></path>
                    <path d="M3 6h18"></path>
                </svg>
                Speed Boat
            </button>
            <button type="button" class="transport-form-tab-btn" data-transport-type="taxis" style="padding: 10px 20px; background: none; border: none; border-bottom: 3px solid transparent; color: var(--text-light); font-weight: 500; cursor: pointer; font-family: 'Poppins', sans-serif;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;">
                    <rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect>
                    <line x1="7" y1="3" x2="7" y2="21"></line>
                    <line x1="17" y1="3" x2="17" y2="21"></line>
                </svg>
                Taxi
            </button>
        </div>
        
        <!-- Flight Form -->
        <form id="modal-form" class="modal-form transport-form" data-transport-type="flights" style="display: block;">
            <div class="form-group">
                <label for="transport-flight-number">Flight Number *</label>
                <input type="text" id="transport-flight-number" name="transport-flight-number" placeholder="Enter flight number" required>
            </div>
            <div class="form-group">
                <label for="transport-route">Route *</label>
                <input type="text" id="transport-route" name="transport-route" placeholder="e.g., Male to Addu" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="transport-departure-time">Departure Time *</label>
                    <input type="time" id="transport-departure-time" name="transport-departure-time" required>
                </div>
                <div class="form-group">
                    <label for="transport-arrival-time">Arrival Time *</label>
                    <input type="time" id="transport-arrival-time" name="transport-arrival-time" required>
                </div>
            </div>
            <div class="form-group">
                <label for="transport-capacity">Capacity *</label>
                <input type="number" id="transport-capacity" name="transport-capacity" placeholder="Number of passengers" min="1" required>
            </div>
            <div class="form-group">
                <label for="transport-status">Status</label>
                <select id="transport-status" name="transport-status">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label for="transport-notes">Notes</label>
                <textarea id="transport-notes" name="transport-notes" rows="3" placeholder="Additional notes (optional)"></textarea>
            </div>
            <div id="modal-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Add Flight</button>
            </div>
        </form>
        
        <!-- Speed Boat Form -->
        <form id="modal-form-speedboat" class="modal-form transport-form" data-transport-type="speedboats" style="display: none;">
            <div class="form-group">
                <label for="transport-boat-name">Boat Name/Number *</label>
                <input type="text" id="transport-boat-name" name="transport-boat-name" placeholder="Enter boat name or number" required>
            </div>
            <div class="form-group">
                <label for="transport-route-sb">Route *</label>
                <input type="text" id="transport-route-sb" name="transport-route-sb" placeholder="e.g., Male to Maafushi" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="transport-departure-time-sb">Departure Time *</label>
                    <input type="time" id="transport-departure-time-sb" name="transport-departure-time-sb" required>
                </div>
                <div class="form-group">
                    <label for="transport-arrival-time-sb">Arrival Time *</label>
                    <input type="time" id="transport-arrival-time-sb" name="transport-arrival-time-sb" required>
                </div>
            </div>
            <div class="form-group">
                <label for="transport-capacity-sb">Capacity *</label>
                <input type="number" id="transport-capacity-sb" name="transport-capacity-sb" placeholder="Number of passengers" min="1" required>
            </div>
            <div class="form-group">
                <label for="transport-status-sb">Status</label>
                <select id="transport-status-sb" name="transport-status-sb">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label for="transport-notes-sb">Notes</label>
                <textarea id="transport-notes-sb" name="transport-notes-sb" rows="3" placeholder="Additional notes (optional)"></textarea>
            </div>
            <div id="modal-error-sb" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Add Speed Boat</button>
            </div>
        </form>
        
        <!-- Taxi Form -->
        <form id="modal-form-taxi" class="modal-form transport-form" data-transport-type="taxis" style="display: none;">
            <div class="form-group">
                <label for="transport-taxi-number">Taxi Number *</label>
                <input type="text" id="transport-taxi-number" name="transport-taxi-number" placeholder="Enter taxi number" required>
            </div>
            <div class="form-group">
                <label for="transport-driver-name">Driver Name *</label>
                <input type="text" id="transport-driver-name" name="transport-driver-name" placeholder="Enter driver name" required>
            </div>
            <div class="form-group">
                <label for="transport-contact">Contact Number *</label>
                <input type="tel" id="transport-contact" name="transport-contact" placeholder="Enter contact number" required>
            </div>
            <div class="form-group">
                <label for="transport-route-taxi">Route/Area *</label>
                <input type="text" id="transport-route-taxi" name="transport-route-taxi" placeholder="e.g., Male City Center" required>
            </div>
            <div class="form-group">
                <label for="transport-capacity-taxi">Capacity *</label>
                <input type="number" id="transport-capacity-taxi" name="transport-capacity-taxi" placeholder="Number of passengers" min="1" required>
            </div>
            <div class="form-group">
                <label for="transport-status-taxi">Status</label>
                <select id="transport-status-taxi" name="transport-status-taxi">
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label for="transport-notes-taxi">Notes</label>
                <textarea id="transport-notes-taxi" name="transport-notes-taxi" rows="3" placeholder="Additional notes (optional)"></textarea>
            </div>
            <div id="modal-error-taxi" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Add Taxi</button>
            </div>
        </form>
    `;
}

// Handle form submission
async function handleFormSubmit(type, formData) {
    if (!window.db || !window.userEmail) {
        showModalError('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const {
            collection,
            addDoc,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        let dataToSave = {};
        const emailField = (type === 'event' || type === 'call') ? 'campaignEmail' : 'email';

        // Helper function to clean form values (preserve empty strings for text fields like currentLocation)
        const cleanFormValue = (val) => {
            if (val === null || val === undefined) {
                return null;
            }
            if (typeof val === 'string') {
                const trimmed = val.trim();
                // Return empty string for text fields (like currentLocation, notes) to ensure they're saved
                // Return null only for truly missing values
                return trimmed === '' ? '' : trimmed;
            }
            return val;
        };

        switch (type) {
            case 'candidate':
                // Check if this is an edit operation
                const candidateForm = document.getElementById('modal-form');
                const editCandidateId = candidateForm && candidateForm.dataset.editCandidateId ? candidateForm.dataset.editCandidateId : null;

                const candidateName = formData.get('candidate-name');
                const candidateId = formData.get('candidate-id');
                const candidatePosition = formData.get('candidate-position');
                const candidateIsland = formData.get('candidate-island');
                const candidateStatus = formData.get('candidate-status');

                if (!candidateName || !candidateName.trim()) {
                    showModalError('Candidate name is required.');
                    return;
                }
                if (!candidatePosition || !candidatePosition.trim()) {
                    showModalError('Position is required.');
                    return;
                }
                if (!candidateIsland || !candidateIsland.trim()) {
                    showModalError('Island is required.');
                    return;
                }
                
                // Get constituency from island for backward compatibility
                const candidateConstituency = window.getConstituencyForIsland && typeof window.getConstituencyForIsland === 'function' 
                    ? window.getConstituencyForIsland(candidateIsland.trim()) 
                    : (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : null);

                // If editing, preserve candidateId from existing data if not provided
                let finalCandidateId = candidateId && candidateId.trim() ? candidateId.trim() : null;

                if (editCandidateId && !finalCandidateId) {
                    // Will be preserved during update, but we need to ensure it's not null
                    finalCandidateId = null; // Will be loaded and preserved during update
                } else if (!finalCandidateId) {
                    finalCandidateId = `CAND-${Date.now()}`;
                }

                dataToSave = {
                    name: candidateName.trim(),
                    candidateId: finalCandidateId,
                    position: candidatePosition.trim(),
                    island: candidateIsland.trim(),
                    constituency: candidateConstituency || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : null),
                    status: candidateStatus && candidateStatus.trim() ? candidateStatus.trim() : 'active',
                    [emailField]: window.userEmail
                };

                // If editing, preserve createdAt; if creating, add it
                if (!editCandidateId) {
                    dataToSave.createdAt = serverTimestamp();
                }
                break;

            case 'voter':
                // Check if this is an edit operation
                const voterForm = document.getElementById('modal-form');
                const editVoterId = voterForm && voterForm.dataset.editVoterId ? voterForm.dataset.editVoterId : null;

                // Handle image upload if provided
                let imageUrl = '';
                const imageInput = document.getElementById('voter-image');
                const imageFile = imageInput && imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;

                if (imageFile) {
                    try {
                        const {
                            getStorage,
                            ref,
                            uploadBytes,
                            getDownloadURL
                        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
                        const storage = getStorage();
                        const imageRef = ref(storage, `voters/${window.userEmail}/${Date.now()}_${imageFile.name}`);
                        await uploadBytes(imageRef, imageFile);
                        imageUrl = await getDownloadURL(imageRef);
                    } catch (uploadError) {
                        console.warn('Image upload failed:', uploadError);
                        // Continue without image if upload fails
                    }
                } else if (editVoterId) {
                    // If editing and no new image, preserve existing image
                    try {
                        const {
                            doc,
                            getDoc
                        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                        const voterRef = doc(window.db, 'voters', editVoterId);
                        const voterSnap = await getDoc(voterRef);
                        if (voterSnap.exists()) {
                            const existingData = voterSnap.data();
                            imageUrl = existingData.imageUrl || existingData.image || '';
                        }
                    } catch (error) {
                        console.warn('Error loading existing image:', error);
                    }
                }

                // Calculate age from date of birth if age is not provided
                const dob = formData.get('voter-dob');
                let age = formData.get('voter-age') ? parseInt(formData.get('voter-age')) : null;
                if (!age && dob) {
                    age = calculateAge(dob);
                }

                // Get form values and ensure they're not empty strings
                const getIdNumber = () => {
                    const val = formData.get('voter-id-number');
                    return (val && typeof val === 'string' && val.trim()) ? val.trim() : null;
                };
                const getName = () => {
                    const val = formData.get('voter-name');
                    return (val && typeof val === 'string' && val.trim()) ? val.trim() : null;
                };
                const getPermanentAddress = () => {
                    const val = formData.get('voter-permanent-address');
                    return (val && typeof val === 'string' && val.trim()) ? val.trim() : null;
                };
                const getCurrentLocation = () => {
                    const val = formData.get('voter-current-location');
                    return (val && typeof val === 'string' && val.trim()) ? val.trim() : null;
                };

                // If editing, preserve verified status and registeredAt
                let verifiedStatus = false;
                let registeredAtValue = serverTimestamp();

                if (editVoterId) {
                    try {
                        const {
                            doc,
                            getDoc
                        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                        const voterRef = doc(window.db, 'voters', editVoterId);
                        const voterSnap = await getDoc(voterRef);
                        if (voterSnap.exists()) {
                            const existingData = voterSnap.data();
                            verifiedStatus = existingData.verified || false;
                            registeredAtValue = existingData.registeredAt || serverTimestamp();
                        }
                    } catch (error) {
                        console.warn('Error loading existing voter data:', error);
                    }
                }

                // Helper function to clean form values (convert empty strings to null)
                // This is now defined at the top of the switch statement for all cases
                const idNumber = getIdNumber();
                const name = getName();

                dataToSave = {
                    idNumber: idNumber,
                    name: name,
                    voterId: idNumber || `VOT-${Date.now()}`,
                    dateOfBirth: dob || null,
                    age: age || null,
                    gender: cleanFormValue(formData.get('voter-gender')),
                    constituency: cleanFormValue(formData.get('voter-constituency')) || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : ''),
                    atoll: null, // Keep for backward compatibility, but use constituency instead
                    island: cleanFormValue(formData.get('voter-island')),
                    ballot: cleanFormValue(formData.get('voter-ballot')),
                    permanentAddress: getPermanentAddress(),
                    currentLocation: getCurrentLocation(),
                    number: cleanFormValue(formData.get('voter-number')),
                    imageUrl: imageUrl || null,
                    image: imageUrl || null, // Keep for backward compatibility
                    verified: verifiedStatus,
                    email: window.userEmail, // Always use 'email' field for voters
                    registeredAt: registeredAtValue
                };

                // Debug logging
                console.log('[handleFormSubmit] Voter data to save:', dataToSave);
                console.log('[handleFormSubmit] Form values:', {
                    idNumber: formData.get('voter-id-number'),
                    name: formData.get('voter-name'),
                    permanentAddress: formData.get('voter-permanent-address'),
                    currentLocation: formData.get('voter-current-location'),
                    gender: formData.get('voter-gender'),
                    island: formData.get('voter-island'),
                    ballot: formData.get('voter-ballot'),
                    number: formData.get('voter-number')
                });
                break;

            case 'event':
                const eventName = formData.get('event-name');
                const eventDate = formData.get('event-date');
                const eventVenue = formData.get('event-venue');
                const eventIsland = formData.get('event-island');
                const eventStartTime = formData.get('event-start-time');
                const eventEndTime = formData.get('event-end-time');
                const eventAttendees = formData.get('event-attendees');
                const eventDescription = formData.get('event-description');

                if (!eventName || !eventName.trim()) {
                    showModalError('Event name is required.');
                    return;
                }
                if (!eventDate || !eventDate.trim()) {
                    showModalError('Event date is required.');
                    return;
                }
                if (!eventVenue || !eventVenue.trim()) {
                    showModalError('Venue is required.');
                    return;
                }
                if (!eventIsland || !eventIsland.trim()) {
                    showModalError('Island is required.');
                    return;
                }
                if (!eventStartTime || !eventStartTime.trim()) {
                    showModalError('Start time is required.');
                    return;
                }

                let eventDateValue = null;
                if (eventDate && eventStartTime) {
                    // Combine date and time into a single Date object
                    const dateTimeString = eventDate + 'T' + eventStartTime;
                    eventDateValue = new Date(dateTimeString);
                } else if (eventDate) {
                    eventDateValue = new Date(eventDate);
                }

                dataToSave = {
                    eventName: eventName.trim(),
                    eventDate: eventDateValue || serverTimestamp(),
                    location: eventVenue.trim(), // Keep 'location' field for backward compatibility
                    venue: eventVenue.trim(),
                    island: eventIsland.trim(),
                    startTime: eventStartTime.trim(),
                    endTime: cleanFormValue(eventEndTime),
                    expectedAttendees: eventAttendees && eventAttendees.trim() ? parseInt(eventAttendees) : null,
                    description: cleanFormValue(eventDescription),
                    [emailField]: window.userEmail,
                    createdAt: serverTimestamp()
                };
                break;

            case 'call':
                const callVoterName = formData.get('call-voter-name');
                const callVoterId = formData.get('call-voter-id');
                const callVoterPhone = formData.get('call-voter-phone');
                const callVoterConstituency = formData.get('call-voter-constituency');
                const callVoterIsland = formData.get('call-voter-island');
                // Check both input and dropdown for caller name
                const callCallerNameInput = formData.get('call-caller-name');
                const callCallerNameDropdown = formData.get('call-caller-name-dropdown');
                const callCallerName = callCallerNameDropdown || callCallerNameInput;
                const callDateValue = formData.get('call-date');
                const callStatus = formData.get('call-status');
                const callNotes = formData.get('call-notes');
                const callVoterDocumentId = formData.get('call-voter-id-hidden'); // Get hidden voter ID

                if (!callVoterName || !callVoterName.trim()) {
                    showModalError('Voter name is required.');
                    return;
                }
                if (!callCallerName || !callCallerName.trim()) {
                    showModalError('Caller name is required.');
                    return;
                }
                if (!callStatus || !callStatus.trim()) {
                    showModalError('Call status is required.');
                    return;
                }

                dataToSave = {
                    voterName: callVoterName.trim(),
                    voterId: cleanFormValue(callVoterId),
                    voterDocumentId: cleanFormValue(callVoterDocumentId), // Save the document ID
                    phone: cleanFormValue(callVoterPhone),
                    constituency: cleanFormValue(callVoterConstituency) || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : ''),
                    island: cleanFormValue(callVoterIsland),
                    caller: callCallerName.trim(),
                    callDate: callDateValue ? new Date(callDateValue) : serverTimestamp(),
                    status: callStatus.trim(),
                    notes: cleanFormValue(callNotes),
                    [emailField]: window.userEmail,
                    createdAt: serverTimestamp()
                };
                break;

            case 'pledge':
                // Get voter document ID from hidden field (this links to the actual voter record)
                const pledgeVoterName = formData.get('pledge-voter-name');
                const voterDocumentId = formData.get('pledge-voter-id-hidden');
                const pledgeVoterId = formData.get('pledge-voter-id');
                const pledgeIsland = formData.get('pledge-island');
                const pledgeCurrentLocation = formData.get('pledge-current-location');
                const pledgeStatus = formData.get('pledge-status');
                const pledgeNotes = formData.get('pledge-notes');

                if (!pledgeVoterName || !pledgeVoterName.trim()) {
                    showModalError('Voter name is required.');
                    return;
                }
                if (!pledgeStatus || !pledgeStatus.trim()) {
                    showModalError('Pledge status is required.');
                    return;
                }

                // Handle candidate selection - check if multiple selection is allowed
                const campaignType = window.campaignData.campaignType || '';
                const allowMultiple = campaignType === 'WDC' || campaignType === 'Local Council Election';

                let pledgeCandidates = [];
                if (allowMultiple) {
                    // Get all selected candidates
                    const candidateSelect = document.getElementById('pledge-candidate');
                    if (candidateSelect) {
                        const selectedOptions = Array.from(candidateSelect.selectedOptions);
                        pledgeCandidates = selectedOptions
                            .filter(option => option.value && option.value.trim())
                            .map(option => option.value.trim());
                    }

                    if (pledgeCandidates.length === 0) {
                        showModalError('Please select at least one candidate.');
                        return;
                    }
                } else {
                    // Single candidate selection
                    const pledgeCandidate = formData.get('pledge-candidate');
                    if (!pledgeCandidate || !pledgeCandidate.trim()) {
                        showModalError('Candidate is required.');
                        return;
                    }
                    pledgeCandidates = [pledgeCandidate.trim()];
                }
                // Get voter document ID - try FormData first, then DOM element as fallback
                let finalVoterDocumentId = voterDocumentId;

                if (!finalVoterDocumentId || !finalVoterDocumentId.trim()) {
                    // Try to get it directly from the DOM element as fallback
                    const hiddenField = document.getElementById('pledge-voter-id-hidden');
                    if (hiddenField && hiddenField.value && hiddenField.value.trim()) {
                        finalVoterDocumentId = hiddenField.value.trim();
                        console.log('[Pledge Form] Using hidden field value from DOM:', finalVoterDocumentId);
                    }
                }

                // Debug: Log form data before validation
                console.log('[Pledge Form] Form submission data:', {
                    pledgeVoterName: pledgeVoterName,
                    voterDocumentId: voterDocumentId,
                    finalVoterDocumentId: finalVoterDocumentId,
                    pledgeVoterId: pledgeVoterId,
                    hiddenFieldValue: document.getElementById('pledge-voter-id-hidden').value || 'N/A'
                });

                if (!finalVoterDocumentId || !finalVoterDocumentId.trim()) {
                    showModalError('Please select a voter from the dropdown.');
                    return;
                }

                // Prepare candidate data - store as array for multiple, single value for backward compatibility
                const primaryCandidate = pledgeCandidates[0];
                const candidateIds = allowMultiple ? pledgeCandidates : [primaryCandidate];

                dataToSave = {
                    voterName: pledgeVoterName.trim(),
                    voterId: cleanFormValue(pledgeVoterId), // Keep for backward compatibility
                    voterDocumentId: finalVoterDocumentId.trim(), // Link to voter document in voters collection
                    island: cleanFormValue(pledgeIsland),
                    currentLocation: cleanFormValue(pledgeCurrentLocation),
                    candidateId: primaryCandidate, // Primary candidate ID for backward compatibility
                    candidate: primaryCandidate, // Also store as candidate for backward compatibility
                    candidateIds: candidateIds, // Array of all selected candidate IDs
                    candidates: candidateIds, // Alias for candidateIds
                    pledge: pledgeStatus.trim(),
                    notes: cleanFormValue(pledgeNotes),
                    [emailField]: window.userEmail,
                    recordedAt: serverTimestamp()
                };
                break;

            case 'agent':
                // Check if this is an edit operation
                const agentForm = document.getElementById('modal-form');
                const editAgentId = agentForm && agentForm.dataset.editAgentId ? agentForm.dataset.editAgentId : null;

                // If editing, preserve agentAccessCode, createdAt, callsMade, and successRate
                let agentAccessCode = null;
                let createdAtValue = serverTimestamp();
                let callsMade = 0;
                let successRate = 0;

                if (editAgentId) {
                    try {
                        const {
                            doc,
                            getDoc
                        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                        const agentRef = doc(window.db, 'agents', editAgentId);
                        const agentSnap = await getDoc(agentRef);
                        if (agentSnap.exists()) {
                            const existingData = agentSnap.data();
                            agentAccessCode = existingData.agentAccessCode || Math.floor(1000 + Math.random() * 9000).toString();
                            createdAtValue = existingData.createdAt || serverTimestamp();
                            callsMade = existingData.callsMade || 0;
                            successRate = existingData.successRate || 0;
                        }
                    } catch (error) {
                        console.warn('Error loading existing agent data:', error);
                        // Generate new code if we can't load existing data
                        agentAccessCode = Math.floor(1000 + Math.random() * 9000).toString();
                    }
                } else {
                    // Generate unique agent access code for new agents
                    agentAccessCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
                }

                const agentName = formData.get('agent-name');
                const agentId = formData.get('agent-id');
                const agentArea = formData.get('agent-area');
                const agentPhone = formData.get('agent-phone');
                const agentEmail = formData.get('agent-email');

                if (!agentName || !agentName.trim()) {
                    showModalError('Agent name is required.');
                    return;
                }
                if (!agentArea || !agentArea.trim()) {
                    showModalError('Island is required.');
                    return;
                }

                dataToSave = {
                    name: agentName.trim(),
                    agentId: agentId && agentId.trim() ? agentId.trim() : `AGT-${Date.now()}`,
                    agentAccessCode: agentAccessCode, // Unique access code for agent portal
                    assignedArea: agentArea.trim(),
                    phone: cleanFormValue(agentPhone),
                    email: cleanFormValue(agentEmail),
                    callsMade: callsMade,
                    successRate: successRate,
                    [emailField]: window.userEmail,
                    createdAt: createdAtValue
                };
                break;

            case 'ballot':
                const ballotNumber = formData.get('ballot-number');
                const ballotLocation = formData.get('ballot-location');
                const ballotExpectedVoters = formData.get('ballot-expected-voters');
                const ballotStatus = formData.get('ballot-status');
                const ballotNotes = formData.get('ballot-notes');

                if (!ballotNumber || !ballotNumber.trim()) {
                    showModalError('Ballot number is required.');
                    return;
                }
                if (!ballotLocation || !ballotLocation.trim()) {
                    showModalError('Location is required.');
                    return;
                }
                if (!ballotExpectedVoters || parseInt(ballotExpectedVoters) < 0) {
                    showModalError('Expected voters must be a valid number.');
                    return;
                }

                dataToSave = {
                    ballotNumber: ballotNumber.trim(),
                    location: ballotLocation.trim(),
                    expectedVoters: parseInt(ballotExpectedVoters),
                    status: ballotStatus && ballotStatus.trim() ? ballotStatus.trim() : 'open',
                    notes: cleanFormValue(ballotNotes),
                    [emailField]: window.userEmail
                };

                // Only add createdAt if it's a new ballot (not editing)
                const form = document.getElementById('modal-form');
                if (!form || !form.dataset.editBallotId) {
                    dataToSave.createdAt = serverTimestamp();
                }
                break;

            case 'transportation':
                // Determine transport type from active form
                const activeTransportForm = document.querySelector('.transport-form[style*="block"]');
                if (!activeTransportForm) {
                    showModalError('Please select a transportation type.');
                    return;
                }

                const transportType = activeTransportForm.dataset.transportType;

                if (transportType === 'flights') {
                    const flightNumber = formData.get('transport-flight-number');
                    const route = formData.get('transport-route');
                    const departureTime = formData.get('transport-departure-time');
                    const arrivalTime = formData.get('transport-arrival-time');
                    const capacity = formData.get('transport-capacity');
                    const status = formData.get('transport-status');
                    const notes = formData.get('transport-notes');

                    if (!flightNumber || !flightNumber.trim()) {
                        showModalError('Flight number is required.');
                        return;
                    }
                    if (!route || !route.trim()) {
                        showModalError('Route is required.');
                        return;
                    }
                    if (!departureTime || !arrivalTime) {
                        showModalError('Departure and arrival times are required.');
                        return;
                    }
                    if (!capacity || parseInt(capacity) < 1) {
                        showModalError('Capacity must be at least 1.');
                        return;
                    }

                    dataToSave = {
                        type: 'flights',
                        flightNumber: flightNumber.trim(),
                        number: flightNumber.trim(), // Alias for consistency
                        route: route.trim(),
                        departureTime: departureTime,
                        arrivalTime: arrivalTime,
                        capacity: parseInt(capacity),
                        status: status && status.trim() ? status.trim() : 'pending',
                        notes: cleanFormValue(notes),
                        [emailField]: window.userEmail
                    };

                    // Only add createdAt if it's a new record (not editing)
                    const form = document.getElementById('modal-form');
                    if (!form || !form.dataset.editTransportationId) {
                        dataToSave.createdAt = serverTimestamp();
                    }
                } else if (transportType === 'speedboats') {
                    const boatName = formData.get('transport-boat-name');
                    const route = formData.get('transport-route-sb');
                    const departureTime = formData.get('transport-departure-time-sb');
                    const arrivalTime = formData.get('transport-arrival-time-sb');
                    const capacity = formData.get('transport-capacity-sb');
                    const status = formData.get('transport-status-sb');
                    const notes = formData.get('transport-notes-sb');

                    if (!boatName || !boatName.trim()) {
                        showModalError('Boat name/number is required.');
                        return;
                    }
                    if (!route || !route.trim()) {
                        showModalError('Route is required.');
                        return;
                    }
                    if (!departureTime || !arrivalTime) {
                        showModalError('Departure and arrival times are required.');
                        return;
                    }
                    if (!capacity || parseInt(capacity) < 1) {
                        showModalError('Capacity must be at least 1.');
                        return;
                    }

                    dataToSave = {
                        type: 'speedboats',
                        boatName: boatName.trim(),
                        number: boatName.trim(), // Alias for consistency
                        route: route.trim(),
                        departureTime: departureTime,
                        arrivalTime: arrivalTime,
                        capacity: parseInt(capacity),
                        status: status && status.trim() ? status.trim() : 'pending',
                        notes: cleanFormValue(notes),
                        [emailField]: window.userEmail
                    };

                    // Only add createdAt if it's a new record (not editing)
                    const form = document.getElementById('modal-form');
                    if (!form || !form.dataset.editTransportationId) {
                        dataToSave.createdAt = serverTimestamp();
                    }
                } else if (transportType === 'taxis') {
                    const taxiNumber = formData.get('transport-taxi-number');
                    const driverName = formData.get('transport-driver-name');
                    const contact = formData.get('transport-contact');
                    const route = formData.get('transport-route-taxi');
                    const capacity = formData.get('transport-capacity-taxi');
                    const status = formData.get('transport-status-taxi');
                    const notes = formData.get('transport-notes-taxi');

                    if (!taxiNumber || !taxiNumber.trim()) {
                        showModalError('Taxi number is required.');
                        return;
                    }
                    if (!driverName || !driverName.trim()) {
                        showModalError('Driver name is required.');
                        return;
                    }
                    if (!contact || !contact.trim()) {
                        showModalError('Contact number is required.');
                        return;
                    }
                    if (!route || !route.trim()) {
                        showModalError('Route/Area is required.');
                        return;
                    }
                    if (!capacity || parseInt(capacity) < 1) {
                        showModalError('Capacity must be at least 1.');
                        return;
                    }

                    dataToSave = {
                        type: 'taxis',
                        taxiNumber: taxiNumber.trim(),
                        number: taxiNumber.trim(), // Alias for consistency
                        driverName: driverName.trim(),
                        contact: contact.trim(),
                        route: route.trim(),
                        area: route.trim(), // Alias for consistency
                        capacity: parseInt(capacity),
                        status: status && status.trim() ? status.trim() : 'pending',
                        notes: cleanFormValue(notes),
                        [emailField]: window.userEmail
                    };

                    // Only add createdAt if it's a new record (not editing)
                    const form = document.getElementById('modal-form');
                    if (!form || !form.dataset.editTransportationId) {
                        dataToSave.createdAt = serverTimestamp();
                    }
                } else {
                    showModalError('Invalid transportation type.');
                    return;
                }
                break;
        }

        let collectionName;
        if (type === 'voter') {
            collectionName = 'voters';
        } else if (type === 'ballot') {
            collectionName = 'ballots';
        } else if (type === 'transportation') {
            collectionName = 'transportation';
        } else {
            collectionName = `${type}s`;
        }

        // Check if this is an edit operation (check again here in case it wasn't set earlier)
        const form = document.getElementById('modal-form');
        const editVoterId = form && form.dataset.editVoterId ? form.dataset.editVoterId : null;
        const editPledgeId = form && form.dataset.editPledgeId ? form.dataset.editPledgeId : null;
        const editAgentId = form && form.dataset.editAgentId ? form.dataset.editAgentId : null;
        const editCandidateId = form && form.dataset.editCandidateId ? form.dataset.editCandidateId : null;
        const editBallotId = form && form.dataset.editBallotId ? form.dataset.editBallotId : null;
        const editTransportationId = form && form.dataset.editTransportationId ? form.dataset.editTransportationId : null;
        const editCallId = form && form.dataset.editCallId ? form.dataset.editCallId : null;

        if (editVoterId && type === 'voter') {
            // Update existing voter
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const voterRef = doc(window.db, 'voters', editVoterId);
            await updateDoc(voterRef, dataToSave);

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Voter updated successfully!', 'Success');
            }

            // Close modal
            closeModal();

            // Reload voters table
            if (window.reloadTableData) {
                window.reloadTableData('voter');
            } else if (window.loadPageContent) {
                setTimeout(() => {
                    window.loadPageContent('voters');
                }, 500);
            }
        } else if (editCandidateId && type === 'candidate') {
            // Update existing candidate (preserve createdAt and candidateId if not provided)
            const {
                doc,
                getDoc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Load existing candidate data to preserve candidateId if not provided
            const candidateRef = doc(window.db, 'candidates', editCandidateId);
            const candidateSnap = await getDoc(candidateRef);

            if (candidateSnap.exists()) {
                const existingData = candidateSnap.data();

                // Preserve candidateId if not provided in form
                if (!dataToSave.candidateId && existingData.candidateId) {
                    dataToSave.candidateId = existingData.candidateId;
                }
            }

            // Remove createdAt from update data (preserve original timestamp)
            const {
                createdAt,
                ...updateData
            } = dataToSave;

            await updateDoc(candidateRef, updateData);

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Candidate updated successfully!', 'Success');
            }
        } else if (editPledgeId && type === 'pledge') {
            // Update existing pledge (don't update recordedAt timestamp)
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Remove recordedAt from update data (preserve original timestamp)
            const {
                recordedAt,
                ...updateData
            } = dataToSave;

            const pledgeRef = doc(window.db, 'pledges', editPledgeId);
            await updateDoc(pledgeRef, updateData);

            // Update voter's currentLocation if it was changed
            if (dataToSave.voterDocumentId && dataToSave.currentLocation !== undefined) {
                try {
                    const voterRef = doc(window.db, 'voters', dataToSave.voterDocumentId);
                    await updateDoc(voterRef, {
                        currentLocation: dataToSave.currentLocation
                    });
                    console.log('[Pledge Update] Updated voter currentLocation:', dataToSave.currentLocation);
                } catch (voterUpdateError) {
                    console.error('[Pledge Update] Error updating voter currentLocation:', voterUpdateError);
                    // Don't fail the pledge update if voter update fails
                }
            }

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Pledge updated successfully!', 'Success');
            }

            // Close modal
            closeModal();

            // Reload pledges table
            if (window.reloadTableData) {
                window.reloadTableData('pledge', null, editPledgeId);
            } else if (window.loadPageContent) {
                setTimeout(() => {
                    window.loadPageContent('pledges');
                }, 500);
            }
        } else if (editAgentId && type === 'agent') {
            // Update existing agent (preserve createdAt, agentAccessCode, callsMade, successRate)
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Remove createdAt from update data (preserve original timestamp)
            const {
                createdAt,
                ...updateData
            } = dataToSave;

            const agentRef = doc(window.db, 'agents', editAgentId);
            await updateDoc(agentRef, updateData);

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Agent updated successfully!', 'Success');
            }
        } else if (editBallotId && type === 'ballot') {
            // Update existing ballot (preserve createdAt)
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Remove createdAt from update data (preserve original timestamp)
            const {
                createdAt,
                ...updateData
            } = dataToSave;

            const ballotRef = doc(window.db, 'ballots', editBallotId);
            await updateDoc(ballotRef, updateData);

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Ballot updated successfully!', 'Success');
            }

            // Close modal
            closeModal();

            // Reload table
            if (window.loadBallotsData) {
                window.loadBallotsData(true);
            }
        } else if (editCallId && type === 'call') {
            // Update existing call
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const callRef = doc(window.db, 'calls', editCallId);
            await updateDoc(callRef, dataToSave);

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Call updated successfully!', 'Success');
            }

            // Close modal
            closeModal();

            // Reload calls table
            if (window.reloadTableData) {
                window.reloadTableData('call', editCallId);
            } else if (window.loadCallsData) {
                setTimeout(() => {
                    window.loadCallsData(true);
                }, 500);
            }
        } else if (editTransportationId && type === 'transportation') {
            // Update existing transportation (preserve createdAt)
            const {
                doc,
                updateDoc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Remove createdAt from update data (preserve original timestamp)
            const {
                createdAt,
                ...updateData
            } = dataToSave;

            const transportRef = doc(window.db, 'transportation', editTransportationId);
            await updateDoc(transportRef, updateData);

            // Show success message
            if (window.showSuccess) {
                window.showSuccess('Transportation updated successfully!', 'Success');
            }

            // Close modal
            closeModal();

            // Reload table - determine type from data
            const transportType = dataToSave.type || 'flights';
            if (window.loadTransportationByType) {
                window.loadTransportationByType(transportType, true);
            }
        } else {
            // Create new record
            // For ballots, save to local storage first, then Firebase
            if (type === 'ballot') {
                // Generate temporary ID for local storage
                const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                // Prepare data for local storage (remove serverTimestamp)
                const localData = {
                    ...dataToSave,
                    id: tempId,
                    _isPending: true,
                    _synced: false,
                    createdAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
                };

                // Save to local storage first
                const localStorageKey = `ballots_${window.userEmail}`;
                let localBallots = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                localBallots.push(localData);
                localStorage.setItem(localStorageKey, JSON.stringify(localBallots));
                console.log('[Ballot Save] Saved to local storage:', tempId);

                // Immediately render the ballot in the table (force refresh to show new item)
                if (window.loadBallotsData) {
                    window.loadBallotsData(true); // Force refresh to bypass cache
                }

                // Close modal immediately for better UX
                closeModal();

                // Show success message
                if (window.showSuccess) {
                    window.showSuccess('Ballot added successfully!', 'Success');
                }

                // Refresh ballot dropdowns
                if (window.setupBallotDropdown) {
                    setTimeout(() => {
                        window.setupBallotDropdown();
                    }, 300);
                }

                // Save to Firebase in the background
                try {
                    // Prepare data for Firebase (with serverTimestamp)
                    const {
                        id,
                        _isPending,
                        _synced,
                        createdAt: localCreatedAt,
                        ...firebaseData
                    } = localData;

                    const {
                        serverTimestamp
                    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    firebaseData.createdAt = serverTimestamp();

                    console.log(`[handleFormSubmit] Saving ballot to Firebase:`, JSON.stringify(firebaseData, null, 2));
                    const docRef = await addDoc(collection(window.db, collectionName), firebaseData);
                    console.log(`[handleFormSubmit] Successfully saved ballot to Firebase with ID:`, docRef.id);

                    // Remove from local storage once synced
                    localBallots = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                    localBallots = localBallots.filter(b => b.id !== tempId);
                    localStorage.setItem(localStorageKey, JSON.stringify(localBallots));
                    console.log('[Ballot Save] Removed from local storage after Firebase sync');

                    // Reload table to show Firebase data (force refresh)
                    if (window.loadBallotsData) {
                        window.loadBallotsData(true); // Force refresh to show synced data
                    }
                } catch (firebaseError) {
                    console.error('[Ballot Save] Error saving to Firebase:', firebaseError);
                    // Keep in local storage if Firebase save fails
                    // The ballot will be retried on next page load
                }
            } else if (type === 'transportation') {
                // For transportation, save to local storage first, then Firebase
                // Determine transport type from active form
                const activeTransportForm = document.querySelector('.transport-form[style*="block"]');
                const transportType = activeTransportForm ? activeTransportForm.dataset.transportType : dataToSave.type;

                if (!transportType) {
                    showModalError('Transportation type is required.');
                    return;
                }

                // Generate temporary ID for local storage
                const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                // Prepare data for local storage (remove serverTimestamp)
                const localData = {
                    ...dataToSave,
                    id: tempId,
                    type: transportType,
                    _isPending: true,
                    _synced: false,
                    createdAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
                };

                // Save to local storage first
                const localStorageKey = `transportation_${transportType}_${window.userEmail}`;
                let localTransport = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                localTransport.push(localData);
                localStorage.setItem(localStorageKey, JSON.stringify(localTransport));
                console.log(`[Transportation ${transportType} Save] Saved to local storage:`, tempId);

                // Immediately render the transportation in the table (force refresh)
                if (window.loadTransportationByType) {
                    window.loadTransportationByType(transportType, true); // Force refresh to bypass cache
                }

                // Close modal immediately for better UX
                closeModal();

                // Show success message
                if (window.showSuccess) {
                    window.showSuccess('Transportation added successfully!', 'Success');
                }

                // Save to Firebase in the background
                try {
                    // Prepare data for Firebase (with serverTimestamp)
                    const {
                        id,
                        _isPending,
                        _synced,
                        createdAt: localCreatedAt,
                        ...firebaseData
                    } = localData;

                    const {
                        serverTimestamp
                    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    firebaseData.createdAt = serverTimestamp();

                    console.log(`[handleFormSubmit] Saving transportation to Firebase:`, JSON.stringify(firebaseData, null, 2));
                    const docRef = await addDoc(collection(window.db, collectionName), firebaseData);
                    console.log(`[handleFormSubmit] Successfully saved transportation to Firebase with ID:`, docRef.id);

                    // Remove from local storage once synced
                    localTransport = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                    localTransport = localTransport.filter(t => t.id !== tempId);
                    localStorage.setItem(localStorageKey, JSON.stringify(localTransport));
                    console.log(`[Transportation ${transportType} Save] Removed from local storage after Firebase sync`);

                    // Reload table to show Firebase data (force refresh)
                    if (window.loadTransportationByType) {
                        window.loadTransportationByType(transportType, true); // Force refresh to show synced data
                    }
                } catch (firebaseError) {
                    console.error(`[Transportation ${transportType} Save] Error saving to Firebase:`, firebaseError);
                    // Keep in local storage if Firebase save fails
                    // The item will be retried on next page load
                }
            } else {
                // For other types, use the original flow
                console.log(`[handleFormSubmit] Saving ${type} to collection "${collectionName}":`, JSON.stringify(dataToSave, null, 2));
                const docRef = await addDoc(collection(window.db, collectionName), dataToSave);
                console.log(`[handleFormSubmit] Successfully saved ${type} with ID:`, docRef.id);

                // If call was made via link, increment call count
                if (type === 'call') {
                    // Check if callLinkData exists and has linkId
                    if (window.callLinkData && window.callLinkData.linkId) {
                        const callLinkId = window.callLinkData.linkId;
                        try {
                            const {
                                doc,
                                getDoc,
                                updateDoc
                            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                            const linkRef = doc(window.db, 'callLinks', callLinkId);
                            const linkSnap = await getDoc(linkRef);
                            if (linkSnap.exists()) {
                                const currentCount = linkSnap.data().callCount || 0;
                                await updateDoc(linkRef, {
                                    callCount: currentCount + 1
                                });
                                console.log(`[handleFormSubmit] Incremented call count for link ${callLinkId}`);
                            }
                        } catch (error) {
                            console.error('Error incrementing call count:', error);
                        }
                    } else {
                        // Call was made from regular call management, not from link
                        console.log('[handleFormSubmit] Call made from regular interface (not from link)');
                    }
                }
                console.log(`[handleFormSubmit] Verifying saved data...`);

                // Verify the data was saved correctly
                try {
                    const {
                        doc,
                        getDoc
                    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const savedDoc = await getDoc(docRef);
                    if (savedDoc.exists()) {
                        console.log(`[handleFormSubmit] Verified saved data:`, JSON.stringify(savedDoc.data(), null, 2));
                    } else {
                        console.error(`[handleFormSubmit] Document was not saved!`);
                    }
                } catch (verifyError) {
                    console.error(`[handleFormSubmit] Error verifying saved data:`, verifyError);
                }

                // If this is a new pledge, update the voter's currentLocation
                if (type === 'pledge' && dataToSave.voterDocumentId && dataToSave.currentLocation !== undefined) {
                    try {
                        const {
                            doc,
                            updateDoc
                        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                        const voterRef = doc(window.db, 'voters', dataToSave.voterDocumentId);
                        await updateDoc(voterRef, {
                            currentLocation: dataToSave.currentLocation
                        });
                        console.log('[Pledge Create] Updated voter currentLocation:', dataToSave.currentLocation);
                    } catch (voterUpdateError) {
                        console.error('[Pledge Create] Error updating voter currentLocation:', voterUpdateError);
                        // Don't fail the pledge creation if voter update fails
                    }
                }

                // Show success message
                if (window.showSuccess) {
                    window.showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`, 'Success');
                }

                // If ballot was added, refresh ballot dropdowns in any open modals
                if (type === 'ballot' && window.setupBallotDropdown) {
                    setTimeout(() => {
                        window.setupBallotDropdown();
                    }, 300);
                }

                // Close modal
                closeModal();

                // Reload table data immediately after saving
                reloadTableData(type, editVoterId, editPledgeId, editAgentId, editCandidateId);
            }
        }

    } catch (error) {
        console.error('Error saving data:', error);
        showModalError(error.message || 'Failed to save data. Please try again.');
    }
}

// Show error in modal
function showModalError(message) {
    const errorEl = document.getElementById('modal-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

// Setup constituency and island dropdowns
function setupConstituencyIslandDropdowns() {
    const constituencySelect = document.getElementById('voter-constituency');
    const islandSelect = document.getElementById('voter-island');
    
    if (!constituencySelect || !islandSelect) return;
    
    // Populate constituency dropdown
    if (window.getAllConstituencies && typeof window.getAllConstituencies === 'function') {
        const constituencies = window.getAllConstituencies();
        
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
        
        constituencies.forEach(constituency => {
            const option = document.createElement('option');
            option.value = constituency;
            option.textContent = constituency;
            // Set default if campaign data has constituency
            if (window.campaignData && window.campaignData.constituency === constituency) {
                option.selected = true;
            }
            constituencySelect.appendChild(option);
        });
    }
    
    // Setup constituency change listener
    constituencySelect.addEventListener('change', function() {
        const selectedConstituency = this.value;
        populateIslandDropdownForVoter(selectedConstituency);
    });
    
    // If campaign data has constituency, populate islands immediately
    if (window.campaignData && window.campaignData.constituency) {
        populateIslandDropdownForVoter(window.campaignData.constituency);
    }
}

// Populate island dropdown based on selected constituency
function populateIslandDropdownForVoter(constituency) {
    const islandSelect = document.getElementById('voter-island');
    if (!islandSelect) return;
    
    // Clear existing options
    islandSelect.innerHTML = '<option value="">Select Island</option>';
    
    if (constituency && window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
        const islands = window.getIslandsForConstituency(constituency);
        
        islands.forEach(island => {
            const option = document.createElement('option');
            option.value = island;
            option.textContent = island;
            // Set default if campaign data has island
            if (window.campaignData && window.campaignData.island === island) {
                option.selected = true;
            }
            islandSelect.appendChild(option);
        });
    }
}

// Setup island dropdown for agent form based on constituency setting
function setupAgentIslandDropdown() {
    const islandSelect = document.getElementById('agent-area');
    if (!islandSelect) return;
    
    // Clear existing options
    islandSelect.innerHTML = '<option value="">Select Island</option>';
    
    // Get constituency from campaign data
    const constituency = window.campaignData && window.campaignData.constituency;
    
    if (constituency && window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
        const islands = window.getIslandsForConstituency(constituency);
        
        if (islands && islands.length > 0) {
            islands.forEach(island => {
                const option = document.createElement('option');
                option.value = island;
                option.textContent = island;
                islandSelect.appendChild(option);
            });
        } else {
            // If no islands found, show a message
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No islands found for this constituency';
            option.disabled = true;
            islandSelect.appendChild(option);
        }
    } else {
        // If no constituency or function not available, show a message
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Constituency not set in settings';
        option.disabled = true;
        islandSelect.appendChild(option);
    }
}

// Expose function globally for use in pages.js
window.populateIslandDropdownForVoter = populateIslandDropdownForVoter;

// Get positions based on campaign type
function getCandidatePositionsForCampaignType() {
    const campaignType = window.campaignData && window.campaignData.campaignType;
    
    if (!campaignType) {
        // If no campaign type, return all positions
        return [
            { value: 'WDC Member', label: 'WDC Member' },
            { value: 'WDC President', label: 'WDC President' },
            { value: 'Local Council Member', label: 'Local Council Member' },
            { value: 'Local Council President', label: 'Local Council President' },
            { value: 'Parliament Member', label: 'Parliament Member' },
            { value: 'Member of Parliament', label: 'Member of Parliament' },
            { value: 'President', label: 'President' },
            { value: 'Vice President', label: 'Vice President' }
        ];
    }
    
    // Map campaign types to positions
    const positionMap = {
        'WDC': [
            { value: 'WDC Member', label: 'WDC Member' },
            { value: 'WDC President', label: 'WDC President' },
            { value: 'Local Council Member', label: 'Local Council Member' },
            { value: 'Local Council President', label: 'Local Council President' }
        ],
        'Parliament': [
            { value: 'Parliament Member', label: 'Parliament Member' },
            { value: 'Member of Parliament', label: 'Member of Parliament' }
        ],
        'Presidential': [
            { value: 'President', label: 'President' },
            { value: 'Vice President', label: 'Vice President' }
        ]
    };
    
    return positionMap[campaignType] || positionMap['WDC']; // Default to WDC if unknown
}

// Setup candidate position dropdown based on campaign type
function setupCandidatePositionDropdown() {
    const positionSelect = document.getElementById('candidate-position');
    if (!positionSelect) return;
    
    // Clear existing options except the first one
    const firstOption = positionSelect.querySelector('option[value=""]');
    positionSelect.innerHTML = '';
    if (firstOption) {
        positionSelect.appendChild(firstOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select position';
        positionSelect.appendChild(defaultOption);
    }
    
    // Get positions for current campaign type
    const positions = getCandidatePositionsForCampaignType();
    
    positions.forEach(position => {
        const option = document.createElement('option');
        option.value = position.value;
        option.textContent = position.label;
        positionSelect.appendChild(option);
    });
}

// Setup candidate island dropdown
function setupCandidateIslandDropdown() {
    const islandSelect = document.getElementById('candidate-island');
    if (!islandSelect) return;
    
    // Clear existing options
    islandSelect.innerHTML = '<option value="">Select Island</option>';
    
    // Get constituency from campaign data
    const constituency = window.campaignData && window.campaignData.constituency;
    
    if (constituency && window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
        const islands = window.getIslandsForConstituency(constituency);
        
        if (islands && islands.length > 0) {
            islands.forEach(island => {
                const option = document.createElement('option');
                option.value = island;
                option.textContent = island;
                islandSelect.appendChild(option);
            });
        } else {
            // If no islands found, show a message
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No islands found for this constituency';
            option.disabled = true;
            islandSelect.appendChild(option);
        }
    } else {
        // If no constituency or function not available, show a message
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Constituency not set in settings';
        option.disabled = true;
        islandSelect.appendChild(option);
    }
}

// Expose functions globally for use in pages.js
window.setupCandidateIslandDropdown = setupCandidateIslandDropdown;
window.setupCandidatePositionDropdown = setupCandidatePositionDropdown;
window.getCandidatePositionsForCampaignType = getCandidatePositionsForCampaignType;

// Setup event island dropdown
function setupEventIslandDropdown(selectedIsland = null) {
    const islandSelect = document.getElementById('event-island');
    if (!islandSelect) return;
    
    // Clear existing options
    islandSelect.innerHTML = '<option value="">Select Island</option>';
    
    // Get constituency from campaign data
    const constituency = window.campaignData && window.campaignData.constituency;
    
    if (constituency && window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
        const islands = window.getIslandsForConstituency(constituency);
        
        if (islands && islands.length > 0) {
            islands.forEach(island => {
                const option = document.createElement('option');
                option.value = island;
                option.textContent = island;
                // Pre-select if provided (for edit mode)
                if (selectedIsland && island === selectedIsland) {
                    option.selected = true;
                }
                islandSelect.appendChild(option);
            });
        } else {
            // If no islands found, show a message
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No islands found for this constituency';
            option.disabled = true;
            islandSelect.appendChild(option);
        }
    } else {
        // If no constituency or function not available, show a message
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Constituency not set in settings';
        option.disabled = true;
        islandSelect.appendChild(option);
    }
}

// Expose function globally for use in pages.js
window.setupEventIslandDropdown = setupEventIslandDropdown;

// Open modal function
function openModal(type, itemId = null) {
    try {
        if (!type) {
            console.warn('openModal called without type parameter');
            return;
        }

        if (!document || !document.body) {
            console.warn('Document not ready, cannot open modal');
            return;
        }

        const modalOverlay = ensureModalExists();
        if (!modalOverlay) {
            console.warn('Could not create modal overlay');
            return;
        }

        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');

        if (!modalBody || !modalTitle) {
            console.warn('Modal elements not found');
            return;
        }

        // Set title (will be updated if editing)
        const titles = {
            'candidate': 'Add Candidate',
            'voter': 'Import Voter',
            'event': 'Schedule Event',
            'call': 'Make Call',
            'pledge': 'Add Pledge',
            'agent': 'Add Agent',
            'ballot': 'Add Ballot',
            'transportation': 'Add Transportation'
        };

        modalTitle.textContent = titles[type] || 'Modal';

        // If itemId is provided, it means we're editing (handled by populate functions)
        // Title will be updated by populatePledgeEditForm or similar

        // Set form content
        modalBody.innerHTML = getFormTemplate(type);

        // Setup form submission
        const form = document.getElementById('modal-form');
        if (form) {
            // Remove existing submit listener if any (by cloning without listeners)
            const formClone = form.cloneNode(true);
            form.parentNode.replaceChild(formClone, form);
            const freshForm = document.getElementById('modal-form');

            // Store itemId in form dataset if provided (for edit mode detection)
            if (itemId !== null && itemId !== undefined) {
                if (type === 'voter') {
                    freshForm.dataset.editVoterId = itemId;
                } else if (type === 'candidate') {
                    freshForm.dataset.editCandidateId = itemId;
                } else if (type === 'pledge') {
                    freshForm.dataset.editPledgeId = itemId;
                } else if (type === 'agent') {
                    freshForm.dataset.editAgentId = itemId;
                } else if (type === 'ballot') {
                    freshForm.dataset.editBallotId = itemId;
                } else if (type === 'transportation') {
                    freshForm.dataset.editTransportationId = itemId;
                } else if (type === 'call') {
                    freshForm.dataset.editCallId = itemId;
                }
            }

            // Setup caller dropdown for call form if accessed via link
            if (type === 'call') {
                setTimeout(() => setupCallFormForLink(), 100);
            }

            // Setup island dropdown for agent form
            if (type === 'agent') {
                setTimeout(() => setupAgentIslandDropdown(), 100);
            }
            
            // Setup island dropdown and position dropdown for candidate form
            if (type === 'candidate') {
                setTimeout(() => {
                    setupCandidatePositionDropdown();
                    setupCandidateIslandDropdown();
                }, 100);
            }
            
            // Setup island dropdown for event form
            if (type === 'event') {
                setTimeout(() => setupEventIslandDropdown(), 100);
            }

            freshForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('[Modal] Form submit triggered for type:', type);

                // For voter form, only submit if in single import mode or if editing
                if (type === 'voter') {
                    const activeForm = document.querySelector('.import-form[style*="block"]');
                    const isSingleImportMode = activeForm && activeForm.dataset.importMode === 'single';
                    // Check if editing by looking at form dataset
                    const voterForm = document.getElementById('modal-form');
                    const isEditing = voterForm && voterForm.dataset.editVoterId;

                    if (isSingleImportMode || isEditing) {
                        console.log('[Modal] Voter form submitting (single import mode or editing)');
                        const formData = new FormData(freshForm);
                        await handleFormSubmit(type, formData);
                    } else {
                        console.log('[Modal] Voter form not in single import mode, skipping submit');
                    }
                } else if (type === 'transportation') {
                    // For transportation, find the active form based on visible tab
                    const activeTransportForm = document.querySelector('.transport-form[style*="block"]');
                    if (activeTransportForm) {
                        console.log('[Modal] Transportation form submitting:', activeTransportForm.dataset.transportType);
                        const formData = new FormData(activeTransportForm);
                        await handleFormSubmit(type, formData);
                    } else {
                        console.log('[Modal] No active transportation form found');
                    }
                } else {
                    // For all other forms (pledge, candidate, event, call, agent, ballot), submit normally
                    console.log('[Modal] Non-voter form submitting:', type);
                    const formData = new FormData(freshForm);
                    await handleFormSubmit(type, formData);
                }
            });
        }

        // Setup transportation form tabs if type is transportation
        if (type === 'transportation') {
            setTimeout(() => {
                setupTransportationFormTabs();
            }, 100);
        }

        // Setup constituency and island dropdowns for voter form
        if (type === 'voter') {
            setTimeout(() => {
                setupConstituencyIslandDropdowns();
                // If editing, populateVoterEditForm will handle setting values
                // Otherwise, campaign data defaults are set in setupConstituencyIslandDropdowns

                // Setup image preview
                const imageInput = document.getElementById('voter-image');
                const imagePreview = document.getElementById('voter-image-preview');
                const imagePreviewImg = document.getElementById('voter-image-preview-img');
                const uploadArea = document.getElementById('voter-image-upload-area');

                if (imageInput && imagePreview && imagePreviewImg) {
                    // Handle file selection
                    imageInput.addEventListener('change', (e) => {
                        handleImagePreview(e.target);
                    });

                    // Drag and drop functionality
                    if (uploadArea) {
                        uploadArea.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            uploadArea.style.borderColor = 'var(--primary-color)';
                            uploadArea.style.background = 'var(--primary-50)';
                        });

                        uploadArea.addEventListener('dragleave', (e) => {
                            e.preventDefault();
                            uploadArea.style.borderColor = 'var(--border-color)';
                            uploadArea.style.background = 'var(--light-color)';
                        });

                        uploadArea.addEventListener('drop', (e) => {
                            e.preventDefault();
                            uploadArea.style.borderColor = 'var(--border-color)';
                            uploadArea.style.background = 'var(--light-color)';
                            
                            const files = e.dataTransfer.files;
                            if (files.length > 0 && files[0].type.startsWith('image/')) {
                                imageInput.files = files;
                                handleImagePreview(imageInput);
                            }
                        });
                    }
                }

                // Auto-calculate age from date of birth
                const dobInput = document.getElementById('voter-dob');
                const ageInput = document.getElementById('voter-age');
                if (dobInput && ageInput) {
                    dobInput.addEventListener('change', (e) => {
                        if (e.target.value) {
                            const dob = new Date(e.target.value);
                            const today = new Date();
                            let age = today.getFullYear() - dob.getFullYear();
                            const monthDiff = today.getMonth() - dob.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                                age--;
                            }
                            if (age >= 18 && age <= 120) {
                                ageInput.value = age;
                            }
                        }
                    });
                }

                // Setup import mode tabs
                setupVoterImportTabs();

                // Setup CSV import
                setupCSVImport();

                // Setup ballot dropdown
                setupBallotDropdown();
            }, 100);
        }

        // Setup searchable voter dropdown and candidate dropdown for pledge form (after form is set up)
        if (type === 'pledge') {
            setTimeout(() => {
                setupPledgeVoterDropdown();
                setupPledgeCandidateDropdown();
            }, 150);
        }

        // Setup searchable voter dropdown for call form (after form is set up)
        if (type === 'call') {
            setTimeout(() => {
                setupCallVoterDropdown();
                // If editing, populate form with existing call data
                if (itemId) {
                    populateCallEditForm(itemId);
                }
            }, 150);
        }

        // Set default date/time for event and call forms
        if (type === 'event') {
            setTimeout(() => {
                const dateInput = document.getElementById('event-date');
                if (dateInput) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dateInput.value = tomorrow.toISOString().split('T')[0];
                }
            }, 100);
        }

        if (type === 'call') {
            setTimeout(() => {
                const dateInput = document.getElementById('call-date');
                if (dateInput) {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            }, 100);
        }

        // Show modal
        modalOverlay.style.display = 'flex';
        if (document.body) {
            document.body.style.overflow = 'hidden';
        }

    } catch (error) {
        console.error('Error opening modal:', error);
    }
}

// Close modal function
function closeModal() {
    // Prevent closing if bulk import is in progress
    if (isBulkImportInProgress) {
        console.log('[closeModal] Cannot close modal - bulk import in progress');
        return;
    }
    
    try {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
            // Reset maximize state when closing
            const modalContainer = modalOverlay.querySelector('#modal-container');
            const maximizeBtn = modalOverlay.querySelector('#modal-maximize-btn');
            if (modalContainer && maximizeBtn) {
                modalContainer.classList.remove('modal-maximized');
                maximizeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                `;
                maximizeBtn.title = 'Maximize';
            }
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

// Toggle modal maximize/minimize
function toggleModalMaximize(modalContainer, maximizeBtn) {
    if (!modalContainer || !maximizeBtn) return;

    const isMaximized = modalContainer.classList.contains('modal-maximized');

    if (isMaximized) {
        // Minimize
        modalContainer.classList.remove('modal-maximized');
        maximizeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        `;
        maximizeBtn.title = 'Maximize';
    } else {
        // Maximize
        modalContainer.classList.add('modal-maximized');
        maximizeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
        `;
        maximizeBtn.title = 'Restore';
    }
}

// Make function globally available
window.toggleModalMaximize = toggleModalMaximize;

// Setup ballot dropdown for voter form and other forms
async function setupBallotDropdown() {
    const ballotSelect = document.getElementById('voter-ballot');
    if (!ballotSelect) return;

    if (!window.userEmail) {
        console.warn('User email not available for ballot dropdown');
        return;
    }

    try {
        // Load from local storage first
        const localStorageKey = `ballots_${window.userEmail}`;
        const localBallots = JSON.parse(localStorage.getItem(localStorageKey) || '[]');

        // Clear existing options except the first one
        ballotSelect.innerHTML = '<option value="">Select ballot</option>';

        const allBallots = [];

        // Add local storage ballots
        localBallots.forEach(localBallot => {
            if (localBallot.ballotNumber) {
                allBallots.push({
                    ballotNumber: localBallot.ballotNumber,
                    location: localBallot.location || ''
                });
            }
        });

        // Load from Firebase if available
        if (window.db) {
            try {
                const {
                    collection,
                    query,
                    where,
                    orderBy,
                    getDocs
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

                const ballotsQuery = query(
                    collection(window.db, 'ballots'),
                    where('email', '==', window.userEmail),
                    orderBy('ballotNumber', 'asc')
                );

                const snapshot = await getDocs(ballotsQuery);

                // Add Firebase ballots (avoid duplicates)
                const existingNumbers = new Set(allBallots.map(b => b.ballotNumber));
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.ballotNumber && !existingNumbers.has(data.ballotNumber)) {
                        allBallots.push({
                            ballotNumber: data.ballotNumber,
                            location: data.location || ''
                        });
                        existingNumbers.add(data.ballotNumber);
                    }
                });
            } catch (firebaseError) {
                console.warn('Error loading ballots from Firebase:', firebaseError);
                // Continue with local storage data only
            }
        }

        if (allBallots.length === 0) {
            // Add a disabled option if no ballots exist
            const noBallotsOption = document.createElement('option');
            noBallotsOption.value = '';
            noBallotsOption.textContent = 'No ballots available';
            noBallotsOption.disabled = true;
            ballotSelect.appendChild(noBallotsOption);
            return;
        }

        // Sort by ballot number
        allBallots.sort((a, b) => {
            const aNum = a.ballotNumber || '';
            const bNum = b.ballotNumber || '';
            return aNum.localeCompare(bNum, undefined, {
                numeric: true,
                sensitivity: 'base'
            });
        });

        // Add ballot options
        allBallots.forEach(ballot => {
            const option = document.createElement('option');
            option.value = ballot.ballotNumber || '';
            // Display format: "Ballot Number - Location"
            const displayText = ballot.ballotNumber ?
                `${ballot.ballotNumber}${ballot.location ? ' - ' + ballot.location : ''}` :
                'Unknown Ballot';
            option.textContent = displayText;
            ballotSelect.appendChild(option);
        });

        console.log('[setupBallotDropdown] Loaded', allBallots.length, 'ballots');
    } catch (error) {
        console.error('Error loading ballots for dropdown:', error);
        // On error, keep the default option
        ballotSelect.innerHTML = '<option value="">Error loading ballots</option>';
    }
}

// Setup searchable voter dropdown for call form
function setupCallVoterDropdown() {
    const voterInput = document.getElementById('call-voter-name');
    const voterDropdown = document.getElementById('call-voter-dropdown');
    const voterIdInput = document.getElementById('call-voter-id');
    const voterPhoneInput = document.getElementById('call-voter-phone');
    const voterConstituencyInput = document.getElementById('call-voter-constituency');
    const voterIslandInput = document.getElementById('call-voter-island');
    const voterAddressInput = document.getElementById('call-voter-address');
    const voterIdHidden = document.getElementById('call-voter-id-hidden');

    if (!voterInput || !voterDropdown) return;

    let allVoters = [];
    let filteredVoters = [];
    let selectedVoter = null;

    // Load voters from cache or Firebase
    async function loadVoters() {
        // Try to use cached data first
        if (window.voterDataCache && window.voterDataCache.data && window.voterDataCache.data.filteredDocs) {
            allVoters = window.voterDataCache.data.filteredDocs.map(({
                id,
                data
            }) => ({
                id: id,
                name: data.name || 'N/A',
                idNumber: data.idNumber || data.voterId || id,
                phone: data.phone || data.phoneNumber || data.mobile || data.contact || data.number || '',
                constituency: data.constituency || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : '') || '',
                island: data.island || '',
                address: data.address || data.permanentAddress || data.location || ''
            }));
            return;
        }

        // Fallback: fetch from Firebase
        if (!window.db || !window.userEmail) return;

        try {
            const {
                collection,
                query,
                where,
                getDocs
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
            const snapshot = await getDocs(votersQuery);
            allVoters = snapshot.docs
                .filter(doc => {
                    const data = doc.data();
                    return data.email === window.userEmail || data.campaignEmail === window.userEmail;
                })
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'N/A',
                        idNumber: data.idNumber || data.voterId || doc.id,
                        phone: data.phone || data.phoneNumber || data.mobile || data.contact || data.number || '',
                        constituency: data.constituency || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : '') || '',
                        island: data.island || '',
                        address: data.address || data.permanentAddress || data.location || ''
                    };
                });
        } catch (error) {
            console.error('Error loading voters for call:', error);
        }
    }

    // Filter and display voters
    function filterVoters(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            filteredVoters = [];
            voterDropdown.style.display = 'none';
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        filteredVoters = allVoters.filter(voter =>
            voter.name.toLowerCase().includes(term) ||
            voter.idNumber.toLowerCase().includes(term)
        ).slice(0, 20); // Limit to 20 results for performance

        if (filteredVoters.length === 0) {
            voterDropdown.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-light);">No voters found</div>';
            voterDropdown.style.display = 'block';
            return;
        }

        // Render dropdown options
        voterDropdown.innerHTML = filteredVoters.map(voter => `
            <div class="dropdown-option" data-voter-id="${voter.id}" data-voter-name="${voter.name}" data-voter-idnumber="${voter.idNumber}" data-voter-phone="${voter.phone || ''}" data-voter-constituency="${(voter.constituency || '').replace(/"/g, '&quot;')}" data-voter-island="${(voter.island || '').replace(/"/g, '&quot;')}" data-voter-address="${(voter.address || '').replace(/"/g, '&quot;')}" style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border-light); transition: background 0.2s;">
                <div style="font-weight: 600; color: var(--text-color); margin-bottom: 4px;">${voter.name}</div>
                <div style="font-size: 12px; color: var(--text-light);">ID: ${voter.idNumber}${voter.phone ? ` • Phone: ${voter.phone}` : ''}${voter.constituency ? ` • ${voter.constituency}` : ''}${voter.island ? ` • ${voter.island}` : ''}</div>
            </div>
        `).join('');

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

                // Set selected voter
                voterInput.value = voterName;
                if (voterIdInput) voterIdInput.value = voterIdNumber;
                if (voterPhoneInput) voterPhoneInput.value = voterPhone;
                if (voterConstituencyInput) voterConstituencyInput.value = voterConstituency;
                if (voterIslandInput) voterIslandInput.value = voterIsland;
                if (voterAddressInput) voterAddressInput.value = voterAddress;
                if (voterIdHidden) {
                    voterIdHidden.value = voterId;
                    voterIdHidden.dispatchEvent(new Event('change', {
                        bubbles: true
                    }));
                }

                selectedVoter = {
                    id: voterId,
                    name: voterName,
                    idNumber: voterIdNumber
                };

                voterDropdown.style.display = 'none';
            });

            option.addEventListener('mouseenter', () => {
                option.style.background = 'var(--light-color)';
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'white';
            });
        });

        voterDropdown.style.display = 'block';
    }

    // Load voters and setup event listeners
    loadVoters().then(() => {
        // Search input handler
        voterInput.addEventListener('input', (e) => {
            filterVoters(e.target.value);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!voterInput.contains(e.target) && !voterDropdown.contains(e.target)) {
                voterDropdown.style.display = 'none';
            }
        });

        // Close dropdown on Escape key
        voterInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                voterDropdown.style.display = 'none';
            }
        });
    });
}

// Populate call edit form with existing data
async function populateCallEditForm(callId) {
    if (!window.db || !window.userEmail || !callId) {
        console.warn('[populateCallEditForm] Missing required parameters');
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const callRef = doc(window.db, 'calls', callId);
        const callSnap = await getDoc(callRef);

        if (!callSnap.exists()) {
            console.warn('[populateCallEditForm] Call not found:', callId);
            return;
        }

        const callData = callSnap.data();

        // Check permission
        if (callData.campaignEmail !== window.userEmail && callData.email !== window.userEmail) {
            console.warn('[populateCallEditForm] Permission denied');
            return;
        }

        // Update modal title
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Call';
        }

        // Populate form fields
        const voterNameInput = document.getElementById('call-voter-name');
        const voterIdInput = document.getElementById('call-voter-id');
        const voterPhoneInput = document.getElementById('call-voter-phone');
        const voterConstituencyInput = document.getElementById('call-voter-constituency');
        const voterIslandInput = document.getElementById('call-voter-island');
        const voterAddressInput = document.getElementById('call-voter-address');
        const voterIdHidden = document.getElementById('call-voter-id-hidden');
        const callerNameInput = document.getElementById('call-caller-name');
        const callDateInput = document.getElementById('call-date');
        const callStatusSelect = document.getElementById('call-status');
        const callNotesTextarea = document.getElementById('call-notes');

        if (voterNameInput) voterNameInput.value = callData.voterName || '';
        if (voterIdInput) voterIdInput.value = callData.voterId || '';
        if (voterPhoneInput) voterPhoneInput.value = callData.phone || '';
        if (voterConstituencyInput) voterConstituencyInput.value = callData.constituency || callData.voterConstituency || '';
        if (voterIslandInput) voterIslandInput.value = callData.island || callData.voterIsland || '';
        if (voterAddressInput) voterAddressInput.value = callData.address || '';
        if (voterIdHidden && callData.voterDocumentId) voterIdHidden.value = callData.voterDocumentId;
        if (callerNameInput) callerNameInput.value = callData.caller || '';
        if (callStatusSelect) callStatusSelect.value = callData.status || 'answered';

        // Format date for datetime-local input
        if (callDateInput && callData.callDate) {
            const callDate = callData.callDate.toDate ? callData.callDate.toDate() : new Date(callData.callDate);
            const year = callDate.getFullYear();
            const month = String(callDate.getMonth() + 1).padStart(2, '0');
            const day = String(callDate.getDate()).padStart(2, '0');
            const hours = String(callDate.getHours()).padStart(2, '0');
            const minutes = String(callDate.getMinutes()).padStart(2, '0');
            callDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        if (callNotesTextarea) callNotesTextarea.value = callData.notes || '';

        console.log('[populateCallEditForm] Form populated successfully');
    } catch (error) {
        console.error('[populateCallEditForm] Error populating form:', error);
    }
}

// Setup searchable voter dropdown for pledge form
function setupPledgeVoterDropdown() {
    const voterInput = document.getElementById('pledge-voter-name');
    const voterDropdown = document.getElementById('pledge-voter-dropdown');
    const voterIdInput = document.getElementById('pledge-voter-id');
    const voterIdHidden = document.getElementById('pledge-voter-id-hidden');
    const islandInput = document.getElementById('pledge-island');
    const currentLocationTextarea = document.getElementById('pledge-current-location');

    if (!voterInput || !voterDropdown) return;

    let allVoters = [];
    let filteredVoters = [];
    let selectedVoter = null;

    // Load voters from cache or Firebase
    async function loadVoters() {
        // Try to use cached data first
        if (window.voterDataCache && window.voterDataCache.data && window.voterDataCache.data.filteredDocs) {
            allVoters = window.voterDataCache.data.filteredDocs.map(({
                id,
                data
            }) => ({
                id: id,
                name: data.name || 'N/A',
                idNumber: data.idNumber || data.voterId || id,
                island: data.island || '',
                currentLocation: data.currentLocation || ''
            }));
            return;
        }

        // Fallback: fetch from Firebase
        if (!window.db || !window.userEmail) return;

        try {
            const {
                collection,
                query,
                where,
                getDocs
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
            const snapshot = await getDocs(votersQuery);
            allVoters = snapshot.docs
                .filter(doc => {
                    const data = doc.data();
                    return data.email === window.userEmail || data.campaignEmail === window.userEmail;
                })
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'N/A',
                        idNumber: data.idNumber || data.voterId || doc.id,
                        island: data.island || '',
                        currentLocation: data.currentLocation || ''
                    };
                });
        } catch (error) {
            console.error('Error loading voters for pledge:', error);
        }
    }

    // Filter and display voters
    function filterVoters(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            filteredVoters = [];
            voterDropdown.style.display = 'none';
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        filteredVoters = allVoters.filter(voter =>
            voter.name.toLowerCase().includes(term) ||
            voter.idNumber.toLowerCase().includes(term)
        ).slice(0, 20); // Limit to 20 results for performance

        if (filteredVoters.length === 0) {
            voterDropdown.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-light);">No voters found</div>';
            voterDropdown.style.display = 'block';
            return;
        }

        // Render dropdown options
        voterDropdown.innerHTML = filteredVoters.map(voter => `
            <div class="dropdown-option" data-voter-id="${voter.id}" data-voter-name="${voter.name}" data-voter-idnumber="${voter.idNumber}" data-voter-island="${voter.island || ''}" data-voter-currentlocation="${(voter.currentLocation || '').replace(/"/g, '&quot;')}" style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border-light); transition: background 0.2s;">
                <div style="font-weight: 600; color: var(--text-color); margin-bottom: 4px;">${voter.name}</div>
                <div style="font-size: 12px; color: var(--text-light);">ID: ${voter.idNumber}${voter.island ? ` • ${voter.island}` : ''}</div>
            </div>
        `).join('');

        // Add click handlers
        voterDropdown.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', () => {
                const voterId = option.dataset.voterId;
                const voterName = option.dataset.voterName;
                const voterIdNumber = option.dataset.voterIdnumber;
                const voterIsland = option.dataset.voterIsland;
                const voterCurrentLocation = option.dataset.voterCurrentlocation || '';

                // Set selected voter
                voterInput.value = voterName;
                if (voterIdInput) voterIdInput.value = voterIdNumber;
                if (voterIdHidden) {
                    voterIdHidden.value = voterId;
                    // Trigger change event to ensure FormData picks it up
                    voterIdHidden.dispatchEvent(new Event('change', {
                        bubbles: true
                    }));
                }
                if (islandInput) islandInput.value = voterIsland || window.campaignData.island || '';
                if (currentLocationTextarea) currentLocationTextarea.value = voterCurrentLocation;

                // Debug: Log the selected voter ID
                console.log('[Pledge Form] Voter selected:', {
                    voterId: voterId,
                    voterName: voterName,
                    hiddenFieldValue: voterIdHidden ? voterIdHidden.value : 'N/A',
                    hiddenFieldName: voterIdHidden ? voterIdHidden.name : 'N/A'
                });

                selectedVoter = {
                    id: voterId,
                    name: voterName,
                    idNumber: voterIdNumber,
                    island: voterIsland,
                    currentLocation: voterCurrentLocation
                };

                voterDropdown.style.display = 'none';
            });

            option.addEventListener('mouseenter', () => {
                option.style.background = 'var(--light-color)';
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'white';
            });
        });

        voterDropdown.style.display = 'block';
    }

    // Load voters and setup event listeners
    loadVoters().then(() => {
        // Search input handler
        voterInput.addEventListener('input', (e) => {
            filterVoters(e.target.value);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!voterInput.contains(e.target) && !voterDropdown.contains(e.target)) {
                voterDropdown.style.display = 'none';
            }
        });

        // Handle focus
        voterInput.addEventListener('focus', () => {
            if (voterInput.value.trim()) {
                filterVoters(voterInput.value);
            }
        });
    });
}

// Setup candidate dropdown for pledge form
async function setupPledgeCandidateDropdown() {
    const candidateSelect = document.getElementById('pledge-candidate');
    if (!candidateSelect) return;

    // Check campaign type to determine if multiple selection is allowed
    const campaignType = window.campaignData.campaignType || '';
    const allowMultiple = campaignType === 'WDC' || campaignType === 'Local Council Election';

    // Update select element based on campaign type
    if (allowMultiple) {
        candidateSelect.setAttribute('multiple', 'multiple');
        candidateSelect.size = 4; // Show 4 options at once
        candidateSelect.style.minHeight = '120px';
        candidateSelect.style.padding = '8px';

        // Show hint
        const hint = document.getElementById('pledge-candidate-hint');
        if (hint) {
            hint.style.display = 'block';
            hint.textContent = 'Hold Ctrl/Cmd (Windows/Mac) or Shift to select multiple candidates';
        }
    } else {
        candidateSelect.removeAttribute('multiple');
        candidateSelect.size = 1;
        candidateSelect.style.minHeight = '';
        candidateSelect.style.padding = '';

        // Hide hint
        const hint = document.getElementById('pledge-candidate-hint');
        if (hint) {
            hint.style.display = 'none';
        }
    }

    // Try to use cached candidates first
    let candidates = [];
    if (window.dataCache && window.dataCache.candidates && window.dataCache.candidates.data) {
        candidates = window.dataCache.candidates.data;
    } else if (window.db && window.userEmail) {
        // Fetch from Firebase if not cached
        try {
            const {
                collection,
                query,
                where,
                getDocs
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const candidatesQuery = query(collection(window.db, 'candidates'), where('email', '==', window.userEmail));
            const snapshot = await getDocs(candidatesQuery);
            candidates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading candidates for pledge form:', error);
        }
    }

    // Populate dropdown
    candidateSelect.innerHTML = '<option value="">Select candidate' + (allowMultiple ? '(s)' : '') + '</option>';
    candidates.forEach(candidate => {
        const candidateName = candidate.name || 'Unknown';
        const candidateId = candidate.candidateId || candidate.id;
        const option = document.createElement('option');
        option.value = candidateId;
        option.textContent = `${candidateName}${candidate.position ? ` - ${candidate.position}` : ''}`;
        candidateSelect.appendChild(option);
    });
}

// Setup voter import tabs (single vs batch)
function setupVoterImportTabs() {
    const tabs = document.querySelectorAll('.import-tab-btn');
    const singleForm = document.querySelector('.import-form[data-import-mode="single"]');
    const batchForm = document.getElementById('batch-import-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;

            // Update tab styles
            tabs.forEach(t => {
                if (t.dataset.mode === mode) {
                    t.classList.add('active');
                    t.style.borderBottomColor = 'var(--primary-color)';
                    t.style.color = 'var(--primary-color)';
                    t.style.fontWeight = '600';
                } else {
                    t.classList.remove('active');
                    t.style.borderBottomColor = 'transparent';
                    t.style.color = 'var(--text-light)';
                    t.style.fontWeight = '500';
                }
            });

            // Show/hide forms
            if (mode === 'single') {
                if (singleForm) singleForm.style.display = 'block';
                if (batchForm) batchForm.style.display = 'none';
            } else {
                if (singleForm) singleForm.style.display = 'none';
                if (batchForm) batchForm.style.display = 'block';
            }
        });
    });
}

// Setup CSV import functionality
function setupCSVImport() {
    const csvFileInput = document.getElementById('csv-file');
    const csvPreview = document.getElementById('csv-preview');
    const csvPreviewHeader = document.getElementById('csv-preview-header');
    const csvPreviewBody = document.getElementById('csv-preview-body');
    const csvRowCount = document.getElementById('csv-row-count');
    const startBatchImportBtn = document.getElementById('start-batch-import-btn');
    const downloadTemplateBtn = document.getElementById('download-csv-template');

    let csvData = [];

    // Download CSV template
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadCSVTemplate();
        });
    }

    // Handle CSV file selection
    if (csvFileInput) {
        csvFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const parseResult = parseCSV(text);
                csvData = parseResult.data;

                if (csvData.length === 0) {
                    showModalError('CSV file is empty or invalid. Please ensure your CSV has columns: No., Image, ID Number, Name, Date of Birth, Age, Gender, Island, Ballot Box, Permanent Address, Current Location, Number.');
                    csvPreview.style.display = 'none';
                    startBatchImportBtn.disabled = true;
                    return;
                }

                // Show preview
                displayCSVPreview(csvData, csvPreviewHeader, csvPreviewBody, csvRowCount, parseResult.headers);
                csvPreview.style.display = 'block';
                startBatchImportBtn.disabled = false;

            } catch (error) {
                console.error('Error reading CSV:', error);
                showModalError('Error reading CSV file: ' + error.message);
                csvPreview.style.display = 'none';
                startBatchImportBtn.disabled = true;
            }
        });
    }

    // Handle batch import
    if (startBatchImportBtn) {
        startBatchImportBtn.addEventListener('click', async () => {
            if (csvData.length === 0) {
                showModalError('No data to import. Please select a valid CSV file.');
                return;
            }
            await handleBatchVoterImport(csvData);
        });
    }
}

// Parse CSV text into array of objects
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        console.warn('[parseCSV] Not enough lines in CSV');
        return {
            data: [],
            headers: []
        }; // Need at least header + 1 row
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Create multiple normalization variations for better matching
    const normalizeHeader = (h) => {
        const trimmed = h.trim().toLowerCase();
        return {
            original: h.trim(),
            noSpaces: trimmed.replace(/\s+/g, ''),
            noSpecial: trimmed.replace(/[^a-z0-9\s]/g, ''),
            noSpacesNoSpecial: trimmed.replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''),
            withSpaces: trimmed
        };
    };

    const normalizedHeaders = headers.map(normalizeHeader);

    console.log('[parseCSV] Original headers:', headers);
    console.log('[parseCSV] Normalized headers:', normalizedHeaders.map(h => h.noSpacesNoSpecial));

    // Map common column name variations (more comprehensive)
    const headerMap = {
        // Image column
        'image': 'image',
        'img': 'image',
        'photo': 'image',
        'picture': 'image',
        // No. column
        'no': 'no',
        'num': 'no',
        '#': 'no',
        // Image column
        'image': 'image',
        'img': 'image',
        'photo': 'image',
        'picture': 'image',
        // ID Number column (National ID)
        'idnumber': 'idnumber',
        'nid': 'idnumber',
        'id': 'idnumber',
        'voterid': 'idnumber',
        'voteridnumber': 'idnumber',
        'idno': 'idnumber',
        'nationalid': 'idnumber',
        // Name column
        'name': 'name',
        'fullname': 'name',
        'votername': 'name',
        // Date of Birth column
        'dateofbirth': 'dateofbirth',
        'dob': 'dateofbirth',
        'birthdate': 'dateofbirth',
        'birth': 'dateofbirth',
        'date': 'dateofbirth',
        // Age column
        'age': 'age',
        // Gender column
        'gender': 'gender',
        'sex': 'gender',
        // Constituency column
        'constituency': 'constituency',
        'voterconstituency': 'constituency',
        'dhaaira': 'constituency',
        'dhaairaa': 'constituency',
        // Island column
        'island': 'island',
        // Ballot Box column
        'ballotbox': 'ballotbox',
        'ballot-box': 'ballotbox',
        'ballot': 'ballotbox',
        'ballotnumber': 'ballotbox',
        // Permanent Address column
        'permanentaddress': 'permanentaddress',
        'permanent-address': 'permanentaddress',
        'permanent address': 'permanentaddress',
        'address': 'permanentaddress',
        'permanent': 'permanentaddress',
        'peraddr': 'permanentaddress',
        // Current Location column
        'currentlocation': 'currentlocation',
        'current-location': 'currentlocation',
        'current location': 'currentlocation',
        'location': 'currentlocation',
        'current': 'currentlocation',
        'currentloc': 'currentlocation',
        // Number column (phone)
        'number': 'number',
        'phone': 'number',
        'phonenumber': 'number',
        'mobile': 'number',
        'contact': 'number',
        'tel': 'number'
    };

    // Try to match headers using multiple normalization strategies
    const mappedHeaders = normalizedHeaders.map(norm => {
        // Try exact match first
        let mapped = headerMap[norm.noSpacesNoSpecial];
        if (mapped) return mapped;

        // Try with spaces
        mapped = headerMap[norm.noSpaces];
        if (mapped) return mapped;

        // Try with special chars removed but spaces kept
        mapped = headerMap[norm.noSpecial.replace(/\s+/g, '')];
        if (mapped) return mapped;

        // Try partial matches for common patterns
        const lower = norm.withSpaces;
        // No.
        if ((lower === 'no' || lower === 'no.' || lower === '#')) return 'no';
        // Image
        if (lower.includes('image') || lower.includes('img') || lower.includes('photo') || lower.includes('picture')) return 'image';
        // ID Number
        if (lower.includes('id') && lower.includes('number')) return 'idnumber';
        if (lower.includes('nid') || (lower === 'id' || lower === 'idnumber')) return 'idnumber';
        // Name
        if (lower.includes('name') && !lower.includes('campaign')) return 'name';
        // Date of Birth
        if (lower.includes('date') && lower.includes('birth')) return 'dateofbirth';
        if (lower === 'dob' || lower.includes('birthdate')) return 'dateofbirth';
        // Age
        if (lower === 'age') return 'age';
        // Gender
        if (lower.includes('gender') || lower === 'sex') return 'gender';
        // Constituency
        if (lower.includes('constituency') || lower.includes('dhaaira')) return 'constituency';
        // Island
        if (lower === 'island') return 'island';
        // Ballot Box
        if (lower.includes('ballot') && lower.includes('box')) return 'ballotbox';
        if (lower.includes('ballot')) return 'ballotbox';
        // Permanent Address
        if (lower.includes('permanent') && lower.includes('address')) return 'permanentaddress';
        if (lower.includes('permanent') || (lower === 'address' || lower.includes('address')) && !lower.includes('current')) return 'permanentaddress';
        // Current Location
        if (lower.includes('current') && lower.includes('location')) return 'currentlocation';
        if (lower.includes('current location')) return 'currentlocation';
        // Number (phone)
        if ((lower === 'number' || lower.includes('phone') || lower.includes('mobile') || lower.includes('contact') || lower.includes('tel')) && !lower.includes('id')) return 'number';

        // Return original if no match found
        return norm.original.toLowerCase().replace(/\s+/g, '');
    });

    console.log('[parseCSV] Mapped headers:', mappedHeaders);

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || values.every(v => !v.trim())) continue; // Skip empty rows

        const row = {};
        mappedHeaders.forEach((mappedHeader, index) => {
            if (mappedHeader && values[index] !== undefined && values[index] !== null) {
                const value = values[index].trim();
                if (value) {
                    row[mappedHeader] = value;
                }
            }
        });

        // Debug first row
        if (i === 1) {
            console.log('[parseCSV] First row data:', row);
            console.log('[parseCSV] First row values:', values);
        }

        // Only add rows with at least ID Number and Name
        if ((row.idnumber || row.nid || row.id) && row.name) {
            data.push(row);
        } else {
            // Log why row was skipped for debugging
            if (i <= 5) {
                console.warn(`[parseCSV] Row ${i} skipped - missing fields:`, {
                    hasNID: !!(row.nid || row.idnumber),
                    hasName: !!row.name,
                    rowData: row
                });
            }
        }
    }

    console.log(`[parseCSV] Parsed ${data.length} valid rows from ${lines.length - 1} total rows`);
    return {
        data: data,
        headers: headers // Return original headers for display
    };
}

// Parse a single CSV line handling quoted values and different separators
function parseCSVLine(line) {
    // Check if line uses semicolon separator (common in Excel exports)
    const separator = line.includes(';') && !line.includes(',') ? ';' : ',';

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // Handle escaped quotes ("")
            if (i + 1 < line.length && line[i + 1] === '"' && inQuotes) {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current); // Add last value

    return values.map(v => v.replace(/^"|"$/g, '').trim());
}

// Display CSV preview
function displayCSVPreview(data, headerEl, bodyEl, countEl, originalHeaders = null) {
    if (data.length === 0) {
        if (countEl) {
            countEl.innerHTML = '<span style="color: var(--error-color);">No valid data found. Please check your CSV format and column names.</span>';
        }
        return;
    }

    // Get all unique keys from data
    const allKeys = new Set();
    data.forEach(row => Object.keys(row).forEach(key => allKeys.add(key)));
    const headers = Array.from(allKeys);

    // Display headers with mapping info
    headerEl.innerHTML = headers.map(h => {
        const displayName = h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1');
        return `<th style="padding: 8px; text-align: left; border-bottom: 2px solid var(--border-color);">${displayName}</th>`;
    }).join('');

    // Display preview rows (first 5)
    const previewRows = data.slice(0, 5);
    bodyEl.innerHTML = previewRows.map(row => {
        return `<tr>${headers.map(h => `<td style="padding: 6px; border-bottom: 1px solid var(--border-light); font-size: 11px;">${row[h] || '<span style="color: #999;">(empty)</span>'}</td>`).join('')}</tr>`;
    }).join('');

    // Show row count with detected columns
    let countText = `Total rows to import: ${data.length}${data.length > 5 ? ' (showing first 5)' : ''}`;
    if (originalHeaders && originalHeaders.length > 0) {
        countText += `<br><small style="color: var(--text-secondary);">Detected columns: ${originalHeaders.join(', ')}</small>`;
    }
    if (countEl) {
        countEl.innerHTML = countText;
    }
}

// Download CSV template
function downloadCSVTemplate() {
    const headers = ['No.', 'Image', 'ID Number', 'Name', 'Date of Birth', 'Age', 'Gender', 'Constituency', 'Island', 'Ballot Box', 'Permanent Address', 'Current Location', 'Number'];
    const sampleRows = [
        ['1', '', 'A123456', 'Ahmed Ali', '1990-01-15', '34', 'Male', 'M01 Meedhoo Dhaaira', 'Malé', 'DHU-98', 'Malé, Maldives', 'Malé, Maldives', '+960 1234567'],
        ['2', '', 'B789012', 'Aisha Mohamed', '1985-05-20', '39', 'Female', 'M01 Meedhoo Dhaaira', 'Hulhumalé', 'DHU-99', 'Hulhumalé, Maldives', 'Hulhumalé, Maldives', '+960 7654321']
    ];

    let csv = headers.join(',') + '\n';
    csv += sampleRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], {
        type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voter_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Track bulk import status
let isBulkImportInProgress = false;

// Handle batch voter import
async function handleBatchVoterImport(csvDataArray) {
    // Ensure csvData is an array
    const csvData = Array.isArray(csvDataArray) ? csvDataArray : (csvDataArray.data || []);
    if (!window.db || !window.userEmail) {
        showModalError('Database not initialized. Please refresh the page.');
        return;
    }

    const progressDiv = document.getElementById('batch-import-progress');
    const progressBar = document.getElementById('batch-progress-bar');
    const progressText = document.getElementById('batch-progress-text');
    const startBtn = document.getElementById('start-batch-import-btn');
    const errorEl = document.getElementById('batch-import-error');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeBtn = modalOverlay ? modalOverlay.querySelector('#modal-close-btn') : null;
    const cancelBtn = document.querySelector('#batch-import-form .btn-secondary');

    if (errorEl) {
        errorEl.style.display = 'none';
    }

    // Set import in progress flag and disable modal closing
    isBulkImportInProgress = true;
    
    // Disable close button
    if (closeBtn) {
        closeBtn.style.pointerEvents = 'none';
        closeBtn.style.opacity = '0.5';
        closeBtn.style.cursor = 'not-allowed';
    }
    
    // Disable cancel button
    if (cancelBtn) {
        cancelBtn.disabled = true;
        cancelBtn.style.pointerEvents = 'none';
        cancelBtn.style.opacity = '0.5';
        cancelBtn.style.cursor = 'not-allowed';
    }
    
    // Prevent closing on overlay click by adding a data attribute
    if (modalOverlay) {
        modalOverlay.setAttribute('data-import-in-progress', 'true');
    }

    if (progressDiv) progressDiv.style.display = 'block';
    if (startBtn) startBtn.disabled = true;

    try {
        const {
            collection,
            addDoc,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const {
            getStorage,
            ref,
            uploadBytes,
            getDownloadURL
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
        const storage = getStorage();

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        const total = csvData.length;

        for (let i = 0; i < total; i++) {
            const row = csvData[i];

            try {
                // Prepare voter data - map from new column structure
                // Parse ballot box if it's in format "X-Y" or just "X"
                let ballot = null;
                if (row.ballotbox) {
                    const parts = row.ballotbox.split('-');
                    if (parts.length > 1) {
                        ballot = row.ballotbox; // Keep as "X-Y" format
                    } else {
                        ballot = row.ballotbox.trim();
                    }
                }

                // Helper function to convert empty strings to null
                const cleanValue = (val) => {
                    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
                        return null;
                    }
                    return typeof val === 'string' ? val.trim() : val;
                };

                // Extract and clean values from CSV row
                const idNumber = cleanValue(row.idnumber || row.nid || row.id || row.voterid);
                const name = cleanValue(row.name || row.fullname || row.votername);
                const permanentAddress = cleanValue(row.permanentaddress || row.address || row.permanent);
                const currentLocation = cleanValue(row.currentlocation || row.location || row.current);
                const constituency = cleanValue(row.constituency || row.voterconstituency || row.dhaaira);

                const voterData = {
                    idNumber: idNumber,
                    name: name,
                    voterId: idNumber || `VOT-${Date.now()}-${i}`,
                    dateOfBirth: cleanValue(row.dateofbirth || row.dob || row.birthdate),
                    age: row.age ? (parseInt(row.age) || null) : (row.dateofbirth || row.dob ? calculateAge(row.dateofbirth || row.dob) : null),
                    gender: cleanValue((row.gender || row.sex || '').toLowerCase()),
                    constituency: constituency, // Add constituency field
                    voterConstituency: constituency, // Also store as voterConstituency for backward compatibility
                    atoll: null, // Can be extracted from island if needed
                    island: cleanValue(row.island),
                    ballot: cleanValue(ballot || row.ballot),
                    permanentAddress: permanentAddress,
                    currentLocation: currentLocation,
                    number: cleanValue(row.number || row.phone || row.phonenumber || row.mobile),
                    imageUrl: cleanValue(row.image), // Image URL or path from CSV
                    image: cleanValue(row.image),
                    verified: false,
                    email: window.userEmail,
                    registeredAt: serverTimestamp()
                };

                // Debug logging for first few rows
                if (i < 3) {
                    console.log(`[handleBatchVoterImport] Row ${i + 1} data:`, {
                        originalRow: row,
                        cleanedVoterData: voterData
                    });
                }

                // Validate required fields (only ID Number and Name are truly required)
                const missingFields = [];
                if (!voterData.idNumber) missingFields.push('ID Number');
                if (!voterData.name) missingFields.push('Name');

                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                await addDoc(collection(window.db, 'voters'), voterData);
                successCount++;

            } catch (rowError) {
                errorCount++;
                errors.push(`Row ${i + 1}: ${rowError.message || 'Unknown error'}`);
                console.error(`Error importing row ${i + 1}:`, rowError);
            }

            // Update progress
            const progress = Math.round(((i + 1) / total) * 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${i + 1} / ${total} (${progress}%)`;
        }

        // Show results
        if (progressDiv) progressDiv.style.display = 'none';

        let message = `Import completed!\n\nSuccessfully imported: ${successCount} voters`;
        if (errorCount > 0) {
            message += `\nFailed: ${errorCount} voters`;
            if (errors.length > 0 && errors.length <= 10) {
                message += `\n\nErrors:\n${errors.join('\n')}`;
            } else if (errors.length > 10) {
                message += `\n\nFirst 10 errors:\n${errors.slice(0, 10).join('\n')}`;
            }
        }

        if (window.showSuccess) {
            window.showSuccess(message, 'Import Complete');
        } else {
            alert(message);
        }

        // Clear cache since new voters were imported
        if (window.clearVoterCache) {
            window.clearVoterCache();
        }

        // Reset import flag and re-enable modal closing
        isBulkImportInProgress = false;
        
        // Re-enable close button
        if (closeBtn) {
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.opacity = '1';
            closeBtn.style.cursor = 'pointer';
        }
        
        // Re-enable cancel button
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.style.pointerEvents = 'auto';
            cancelBtn.style.opacity = '1';
            cancelBtn.style.cursor = 'pointer';
        }
        
        // Re-enable overlay click
        if (modalOverlay) {
            modalOverlay.removeAttribute('data-import-in-progress');
        }

        // Close modal and immediately reload voter table data
        closeModal();
        if (window.reloadTableData) {
            // Directly reload voter table data
            window.reloadTableData('voter');
        } else if (window.loadPageContent) {
            // Fallback: reload entire page
            window.loadPageContent('voters');
        }

    } catch (error) {
        console.error('Batch import error:', error);
        
        // Reset import flag on error
        isBulkImportInProgress = false;
        
        // Re-enable close button on error
        if (closeBtn) {
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.opacity = '1';
            closeBtn.style.cursor = 'pointer';
        }
        
        // Re-enable cancel button on error
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.style.pointerEvents = 'auto';
            cancelBtn.style.opacity = '1';
            cancelBtn.style.cursor = 'pointer';
        }
        
        // Re-enable overlay click on error
        if (modalOverlay) {
            modalOverlay.removeAttribute('data-import-in-progress');
        }
        
        showModalError('Batch import failed: ' + error.message);
        if (progressDiv) progressDiv.style.display = 'none';
        if (startBtn) startBtn.disabled = false;
    }
}

// Calculate age from date of birth
function calculateAge(dateString) {
    try {
        const dob = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age >= 18 && age <= 120 ? age : null;
    } catch {
        return null;
    }
}

// Make functions globally available
window.setupPledgeCandidateDropdown = setupPledgeCandidateDropdown;
// Setup transportation form tabs
function setupTransportationFormTabs() {
    const tabButtons = document.querySelectorAll('.transport-form-tab-btn');
    const transportForms = document.querySelectorAll('.transport-form');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const transportType = btn.dataset.transportType;

            // Remove active class from all tabs
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.style.borderBottomColor = 'transparent';
                b.style.color = 'var(--text-light)';
                b.style.fontWeight = '500';
            });

            // Add active class to clicked tab
            btn.classList.add('active');
            btn.style.borderBottomColor = 'var(--primary-color)';
            btn.style.color = 'var(--primary-color)';
            btn.style.fontWeight = '600';

            // Hide all forms
            transportForms.forEach(form => {
                form.style.display = 'none';
            });

            // Show selected form
            const activeForm = document.querySelector(`.transport-form[data-transport-type="${transportType}"]`);
            if (activeForm) {
                activeForm.style.display = 'block';
            }

            // Update submit button text based on type
            const submitBtn = activeForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                const btnTexts = {
                    'flights': 'Add Flight',
                    'speedboats': 'Add Speed Boat',
                    'taxis': 'Add Taxi'
                };
                submitBtn.textContent = btnTexts[transportType] || 'Add Transportation';
            }
        });
    });

    // Setup submit handlers for all transportation forms
    transportForms.forEach(form => {
        const formClone = form.cloneNode(true);
        form.parentNode.replaceChild(formClone, form);
        const freshForm = document.querySelector(`.transport-form[data-transport-type="${form.dataset.transportType}"]`);

        if (freshForm) {
            freshForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('[Modal] Transportation form submitting:', freshForm.dataset.transportType);
                const formData = new FormData(freshForm);
                await handleFormSubmit('transportation', formData);
            });
        }
    });
}

// Setup call form for link access
async function setupCallFormForLink() {
    const callerInput = document.getElementById('call-caller-name');
    const callerDropdown = document.getElementById('call-caller-name-dropdown');

    if (!callerInput || !callerDropdown) return;

    // Check if accessed via link (use stored callLinkData)
    const callLinkData = window.callLinkData;

    // If accessed via link and verified, show dropdown; otherwise show input
    if (callLinkData && callLinkData.linkId && callLinkData.accessCode) {
        try {
            // Use caller names from stored link data (already verified)
            const callerNames = callLinkData.callerNames || [];


            // Populate dropdown with caller names
            if (callerNames && callerNames.length > 0) {
                callerDropdown.innerHTML = '<option value="">Select caller name</option>' +
                    callerNames.map(name => `<option value="${name}">${name}</option>`).join('');

                callerInput.style.display = 'none';
                callerInput.removeAttribute('required');
                callerDropdown.style.display = 'block';
                callerDropdown.setAttribute('required', 'required');
            }
        } catch (error) {
            console.error('Error loading call link:', error);
            if (window.showError) {
                window.showError('Failed to load caller names. Please try again.');
            }
        }
    } else {
        // Normal access - show input field
        callerInput.style.display = 'block';
        callerInput.setAttribute('required', 'required');
        callerDropdown.style.display = 'none';
        callerDropdown.removeAttribute('required');
    }
}

// Handle image preview
function handleImagePreview(input) {
    const file = input.files && input.files[0];
    const imagePreview = document.getElementById('voter-image-preview');
    const imagePreviewImg = document.getElementById('voter-image-preview-img');
    const uploadArea = document.getElementById('voter-image-upload-area');
    
    if (file && imagePreview && imagePreviewImg) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Image file is too large. Please select an image smaller than 5MB.', 'File Too Large');
            }
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Please select a valid image file (JPG, PNG, etc.).', 'Invalid File Type');
            }
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreviewImg.src = event.target.result;
            imagePreview.style.display = 'block';
            if (uploadArea) {
                uploadArea.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    } else {
        if (imagePreview) imagePreview.style.display = 'none';
        if (uploadArea) uploadArea.style.display = 'block';
    }
}

// Remove image preview
function removeImagePreview() {
    const imageInput = document.getElementById('voter-image');
    const imagePreview = document.getElementById('voter-image-preview');
    const uploadArea = document.getElementById('voter-image-upload-area');
    
    if (imageInput) {
        imageInput.value = '';
    }
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
}

window.openModal = openModal;
window.setupBallotDropdown = setupBallotDropdown;
window.closeModal = closeModal;
window.calculateAge = calculateAge;
window.setupCallFormForLink = setupCallFormForLink;
window.ensureModalExists = ensureModalExists;
window.handleImagePreview = handleImagePreview;
window.removeImagePreview = removeImagePreview;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeModal
    };
}