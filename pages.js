// Page Content Templates for all sections - All data loaded dynamically from Firebase

// Delete Call Function will be defined later - ensure placeholder exists
if (typeof window.deleteCall === 'undefined') {
    window.deleteCall = null; // Placeholder to prevent errors
}

// Global Filter Utilities
(function() {
    'use strict';

    // Apply global filter to Firestore query
    function applyFilterToQuery(baseQuery, collectionName) {
        if (!window.GlobalFilter) {
            return baseQuery;
        }

        const filterState = window.GlobalFilter.getState();
        if (!filterState.isActive) {
            return baseQuery;
        }

        // Import Firestore functions dynamically
        return Promise.resolve().then(async () => {
            const {
                where,
                query
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            if (filterState.type === 'constituency') {
                return query(baseQuery, where('constituency', '==', filterState.value));
            } else if (filterState.type === 'island') {
                return query(baseQuery, where('island', '==', filterState.value));
            }

            return baseQuery;
        });
    }

    // Apply global filter to array of data
    function applyFilterToArray(dataArray) {
        if (!window.GlobalFilter || !Array.isArray(dataArray)) {
            return dataArray;
        }
        return window.GlobalFilter.filterArray(dataArray);
    }

    // Get filter description for UI
    function getFilterDescription() {
        if (!window.GlobalFilter) {
            return null;
        }
        const filterState = window.GlobalFilter.getState();
        if (!filterState.isActive) {
            return null;
        }
        return filterState.type === 'constituency' ?
            `Filtered by Constituency: ${filterState.value}` :
            `Filtered by Island: ${filterState.value}`;
    }

    // Expose filter utilities
    window.FilterUtils = {
        applyFilterToQuery: applyFilterToQuery,
        applyFilterToArray: applyFilterToArray,
        getFilterDescription: getFilterDescription
    };
})();

const pageTemplates = {
    dashboard: `
        <div class="page-header">
            <h1>Campaign Dashboard</h1>
            <p class="page-subtitle">Overview of your election campaign activities</p>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, rgba(111, 193, 218, 0.08) 0%, rgba(141, 212, 232, 0.08) 100%); border-radius: 12px; border: 1px solid rgba(111, 193, 218, 0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span style="font-weight: 600; color: var(--text-color); font-size: 14px;">Dashboard Statistics</span>
            </div>
            <button id="dashboard-stats-toggle" class="stats-toggle-btn" onclick="toggleStats('dashboard')" aria-label="Toggle statistics">
                <span class="stats-toggle-slider"></span>
                <span class="stats-toggle-icon stats-toggle-icon-show">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </span>
                <span class="stats-toggle-icon stats-toggle-icon-hide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
        </div>
        
        <div class="stats-grid" id="dashboard-stats-section" style="transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
            <div class="stat-card stat-card-primary">
                <div class="stat-card-header">
                    <div class="stat-icon-wrapper stat-icon-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <p class="stat-label">Total Candidates</p>
                </div>
                <h3 id="stat-candidates" class="stat-number stat-number-primary">0</h3>
                <p class="stat-description">Registered candidates</p>
            </div>
            
            <div class="stat-card stat-card-success">
                <div class="stat-card-header">
                    <div class="stat-icon-wrapper stat-icon-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    </div>
                    <p class="stat-label">Registered Voters</p>
                </div>
                <h3 id="stat-voters" class="stat-number stat-number-success">0</h3>
                <p class="stat-description">Voters in database</p>
            </div>
            
            <div class="stat-card stat-card-info">
                <div class="stat-card-header">
                    <div class="stat-icon-wrapper stat-icon-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--info-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <p class="stat-label">Upcoming Events</p>
                </div>
                <h3 id="stat-events" class="stat-number stat-number-info">0</h3>
                <p class="stat-description">Scheduled events</p>
            </div>
            
            <div class="stat-card stat-card-warning">
                <div class="stat-card-header">
                    <div class="stat-icon-wrapper stat-icon-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <p class="stat-label">Campaign Calls</p>
                </div>
                <h3 id="stat-calls" class="stat-number stat-number-warning">0</h3>
                <p class="stat-description">Calls made to voters</p>
            </div>
        </div>
        
        <div class="dashboard-sections">
            <div class="section-card">
                <h2>Recent Activities</h2>
                <div class="activity-list" id="recent-activities">
                    <div class="activity-item" style="text-align: center; padding: 20px; color: var(--text-light);">
                        <p>No recent activities</p>
                    </div>
                </div>
            </div>
            
            <div class="section-card">
                <h2>Quick Actions</h2>
                <div class="quick-actions">
                    <button class="action-btn" onclick="navigateToSection('candidates')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Add Candidate
                    </button>
                    <button class="action-btn" onclick="navigateToSection('events')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Schedule Event
                    </button>
                    <button class="action-btn" onclick="navigateToSection('calls')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        Make Call
                    </button>
                    <button class="action-btn" onclick="navigateToSection('pledges')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Pledge Tracker
                    </button>
                </div>
            </div>
        </div>
    `,

    candidates: `
        <div class="page-header">
            <div>
                <h1>Candidate Management</h1>
                <p class="page-subtitle">Manage candidate profiles and information</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <select id="candidate-island-filter" class="search-input" style="width: 180px; min-width: 0; flex-shrink: 0;">
                    <option value="">All Islands</option>
                </select>
                <select id="candidate-position-filter" class="search-input" style="width: 200px; min-width: 0; flex-shrink: 0;">
                    <option value="">All Positions</option>
                    <!-- Positions will be populated dynamically based on campaign type -->
                </select>
                <div style="display: flex; gap: 10px; align-items: center; flex-shrink: 0;">
                    <button id="clear-candidate-filters-btn" class="btn-secondary btn-compact" style="display: none; white-space: nowrap;" onclick="clearCandidateFilters()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Clear Filters
                    </button>
                    <button class="btn-primary btn-compact" style="white-space: nowrap;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Candidate
                    </button>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Island</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="candidates-table-body">
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">No candidates registered yet</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="candidates-pagination" class="table-pagination" style="display: none;"></div>
        <!-- Candidate Details Side Panel -->
        <div id="candidate-details-side-panel" class="call-details-side-panel" style="display: none;">
            <div class="call-details-side-panel-header">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Candidate Details</h2>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="maximize-candidate-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'" title="Maximize">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button id="close-candidate-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="candidate-details-side-panel-content" class="call-details-side-panel-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                <!-- Content will be populated dynamically -->
            </div>
        </div>
        <div id="candidate-details-side-panel-overlay" class="call-details-side-panel-overlay" style="display: none;"></div>
    `,

    voters: `
        <div class="page-header">
            <div>
                <h1>Voter Database</h1>
                <p class="page-subtitle">Access and manage voter information</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" placeholder="Search voters..." class="search-input" style="width: 200px;" id="voter-search">
                <button class="btn-primary btn-compact">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Import Voters
                </button>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, rgba(111, 193, 218, 0.08) 0%, rgba(141, 212, 232, 0.08) 100%); border-radius: 12px; border: 1px solid rgba(111, 193, 218, 0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span style="font-weight: 600; color: var(--text-color); font-size: 14px;">Voter Statistics</span>
            </div>
            <button id="voters-stats-toggle" class="stats-toggle-btn" onclick="toggleVotersStats()" aria-label="Toggle statistics">
                <span class="stats-toggle-slider"></span>
                <span class="stats-toggle-icon stats-toggle-icon-show">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </span>
                <span class="stats-toggle-icon stats-toggle-icon-hide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
        </div>
        
        <div id="voters-stats-section" class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Voters</p>
                </div>
                <h3 id="stat-voters-total" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--text-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">All registered voters</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(5, 150, 105, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Registered Today</p>
                </div>
                <h3 id="stat-voters-today" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--success-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">New registrations today</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(2, 132, 199, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--info-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Verified</p>
                </div>
                <h3 id="stat-voters-verified" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--info-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Verified voters</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(217, 119, 6, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pending</p>
                </div>
                <h3 id="stat-voters-pending" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--warning-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Pending verification</p>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">No.</th>
                        <th style="width: 60px;">Image</th>
                        <th>Name</th>
                        <th>Constituency</th>
                        <th>Island</th>
                        <th>Permanent Address</th>
                        <th>Current Location</th>
                        <th style="width: 100px;">Actions</th>
                    </tr>
                </thead>
                <tbody id="voters-table-body">
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">No voters registered yet</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="voters-pagination" class="table-pagination" style="display: none;"></div>
        <!-- Voter Details Side Panel -->
        <div id="voter-details-side-panel" class="call-details-side-panel" style="display: none;">
            <div class="call-details-side-panel-header">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Voter Details</h2>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="maximize-voter-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'" title="Maximize">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button id="close-voter-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="voter-details-side-panel-content" class="call-details-side-panel-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                <!-- Content will be populated dynamically -->
            </div>
        </div>
        <div id="voter-details-side-panel-overlay" class="call-details-side-panel-overlay" style="display: none;"></div>
    `,

    events: `
        <div class="page-header">
            <div>
                <h1>Campaign Events</h1>
                <p class="page-subtitle">Schedule and manage campaign events</p>
            </div>
            <button class="btn-primary btn-compact">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Schedule Event
            </button>
        </div>
        
        <div class="events-grid" id="events-grid">
            <div style="text-align: center; padding: 40px; color: var(--text-light); grid-column: 1 / -1;">
                <p>No events scheduled yet</p>
            </div>
        </div>
        <!-- Event Details Side Panel -->
        <div id="event-details-side-panel" class="call-details-side-panel" style="display: none;">
            <div class="call-details-side-panel-header">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Event Details</h2>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="maximize-event-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'" title="Maximize">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button id="close-event-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="event-details-side-panel-content" class="call-details-side-panel-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                <!-- Content will be populated dynamically -->
            </div>
        </div>
        <div id="event-details-side-panel-overlay" class="call-details-side-panel-overlay" style="display: none;"></div>
    `,

    calls: `
        <div class="page-header">
            <div>
                <h1>Call Management</h1>
                <p class="page-subtitle">Track and manage campaign calls</p>
            </div>
            <div class="action-buttons-row" style="display: flex; gap: 12px; flex-wrap: nowrap; align-items: center;">
                <button class="btn-secondary btn-compact" onclick="openCallLinkModal()" style="white-space: nowrap; flex: 0 0 auto;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    Generate Link
                </button>
                <button class="btn-primary btn-compact" onclick="window.openModal('call')" style="white-space: nowrap; flex: 0 0 auto;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Make Call
                </button>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, rgba(111, 193, 218, 0.08) 0%, rgba(141, 212, 232, 0.08) 100%); border-radius: 12px; border: 1px solid rgba(111, 193, 218, 0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span style="font-weight: 600; color: var(--text-color); font-size: 14px;">Call Statistics</span>
            </div>
            <button id="calls-stats-toggle" class="stats-toggle-btn" onclick="toggleStats('calls')" aria-label="Toggle statistics">
                <span class="stats-toggle-slider"></span>
                <span class="stats-toggle-icon stats-toggle-icon-show">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </span>
                <span class="stats-toggle-icon stats-toggle-icon-hide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
        </div>
        
        <div id="calls-stats-section" class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Calls</p>
                </div>
                <h3 id="stat-calls-total" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--text-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">All calls made</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(5, 150, 105, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Answered</p>
                </div>
                <h3 id="stat-calls-answered" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--success-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Calls answered</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(217, 119, 6, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pending</p>
                </div>
                <h3 id="stat-calls-pending" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--warning-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Pending calls</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(2, 132, 199, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--info-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Success Rate</p>
                </div>
                <h3 id="stat-calls-success" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--info-color); line-height: 1.1; word-break: break-word;">0%</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Call success rate</p>
            </div>
        </div>
        
        <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Voter Name</th>
                            <th>Constituency</th>
                            <th>Island</th>
                            <th>Phone</th>
                            <th>Caller</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="calls-table-body">
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No calls recorded yet</td>
                        </tr>
                    </tbody></table></div><!-- Call Details Side Panel -->
            <div id="call-details-side-panel" class="call-details-side-panel" style="display: none;">
                <div class="call-details-side-panel-header">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Call Details</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button id="maximize-call-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'" title="Maximize">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                        </button>
                        <button id="close-call-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div id="call-details-side-panel-content" class="call-details-side-panel-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                    <!-- Content will be populated dynamically -->
                </div></div><div id="call-details-side-panel-overlay" class="call-details-side-panel-overlay" style="display: none;"></div><div id="calls-pagination" class="table-pagination" style="display: none;"></div>
    `,

    pledges: `
        <div class="page-header">
            <div>
                <h1>Pledge Tracker</h1>
                <p class="page-subtitle">Track voter support pledges and commitments</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; min-width: 0;">
                <input type="text" placeholder="Search voters..." class="search-input" style="width: 200px; min-width: 0; flex: 1 1 auto;" id="pledge-search">
                <select class="search-input" style="width: 140px; min-width: 0; flex-shrink: 0;" id="pledge-filter">
                    <option value="">All Pledges</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="undecided">Undecided</option>
                </select>
                <button class="btn-primary btn-compact" style="flex-shrink: 0; white-space: nowrap;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Pledge
                </button>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, rgba(111, 193, 218, 0.08) 0%, rgba(141, 212, 232, 0.08) 100%); border-radius: 12px; border: 1px solid rgba(111, 193, 218, 0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span style="font-weight: 600; color: var(--text-color); font-size: 14px;">Pledge Statistics</span>
            </div>
            <button id="pledges-stats-toggle" class="stats-toggle-btn" onclick="toggleStats('pledges')" aria-label="Toggle statistics">
                <span class="stats-toggle-slider"></span>
                <span class="stats-toggle-icon stats-toggle-icon-show">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </span>
                <span class="stats-toggle-icon stats-toggle-icon-hide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
        </div>
        
        <div id="pledges-stats-section" class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(5, 150, 105, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pledged Yes</p>
                </div>
                <h3 id="stat-pledges-yes" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--success-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Positive pledges</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(217, 119, 6, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Undecided</p>
                </div>
                <h3 id="stat-pledges-undecided" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--warning-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Undecided voters</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(2, 132, 199, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--info-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pledged No</p>
                </div>
                <h3 id="stat-pledges-no" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--info-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Negative pledges</p>
            </div>
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Tracked</p>
                </div>
                <h3 id="stat-pledges-total" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--primary-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Total pledges tracked</p>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Image</th>
                        <th>ID Number</th>
                        <th>Name</th>
                        <th>Constituency</th>
                        <th>Island</th>
                        <th>Permanent Address</th>
                        <th>Current Location</th>
                        <th>Pledge Status</th>
                        <th>Date Recorded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="pledges-table-body">
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">No pledges recorded yet</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="pledges-pagination" class="table-pagination" style="display: none;"></div>
        <!-- Pledge Details Side Panel -->
        <div id="pledge-details-side-panel" class="call-details-side-panel" style="display: none;">
            <div class="call-details-side-panel-header">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Pledge Details</h2>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="maximize-pledge-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'" title="Maximize">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                    <button id="close-pledge-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)'" onmouseout="this.style.background='transparent'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="pledge-details-side-panel-content" class="call-details-side-panel-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                <!-- Content will be populated dynamically -->
            </div>
        </div>
        <div id="pledge-details-side-panel-overlay" class="call-details-side-panel-overlay" style="display: none;"></div>
    `,

    agents: `
        <div class="page-header">
            <div>
                <h1>Agent Assignment</h1>
                <p class="page-subtitle">Assign and manage campaign agents</p>
            </div>
            <div class="action-buttons-row" style="display: flex; gap: 12px; align-items: center; flex-wrap: nowrap;">
                <button class="btn-secondary btn-compact" onclick="showAgentSelectionForVoterAssignment()" style="white-space: nowrap; flex: 0 0 auto;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Assign Voters
                </button>
                <button class="btn-primary btn-compact" onclick="window.openModal('agent')" style="white-space: nowrap; flex: 0 0 auto;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Agent
                </button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Assigned Area</th>
                        <th>Assigned Voters</th>
                        <th>Number of Pledges</th>
                        <th>Success Rate</th>
                        <th style="width: 160px;">Actions</th>
                    </tr>
                </thead>
                <tbody id="agents-table-body">
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">
                            <p>No agents assigned yet</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="agents-pagination" class="table-pagination" style="display: none;">        </div>
        
        <!-- Assign Voters Side Panel -->
        <div id="assign-voters-side-panel" class="call-details-side-panel" style="display: none; position: fixed; top: 0; right: 0; width: 90%; max-width: 1400px; height: 100vh; background: white; box-shadow: -4px 0 20px rgba(0,0,0,0.15); z-index: 10000; flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease;">
            <div class="call-details-side-panel-header" style="padding: 20px; border-bottom: 2px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Assign Voters to Agents</h2>
                <button id="close-assign-voters-side-panel" class="icon-btn" style="width: 32px; height: 32px; padding: 0; border: none; background: transparent; color: var(--text-color); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='var(--light-color)';" onmouseout="this.style.background='transparent';">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div id="assign-voters-side-panel-content" class="call-details-side-panel-content" style="padding: 20px; overflow-y: auto; flex: 1;">
                <!-- Content will be populated dynamically -->
            </div>
        </div>
        <div id="assign-voters-side-panel-overlay" class="call-details-side-panel-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
    `,

    'zero-day': `
        <div class="page-header">
            <h1>Zero Day Management</h1>
            <p class="page-subtitle">Manage ballots and transportation requirements for election day</p>
        </div>
        
        <div class="zero-day-sections">
            <!-- Ballot Management Section -->
            <div class="section-card">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Ballot Management</h2>
                    <button class="btn-primary btn-compact" id="add-ballot-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Ballot
                    </button>
                </div>
                
                <!-- Ballot Tabs -->
                <div class="ballot-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    <button class="ballot-tab-btn active" data-ballot-tab="list" onclick="switchBallotTab('list')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        Ballot List
                    </button>
                    <button class="ballot-tab-btn" data-ballot-tab="statistics" onclick="switchBallotTab('statistics')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Statistics
                    </button>
                </div>
                
                <!-- Ballot List Tab -->
                <div id="ballot-list-tab" class="ballot-tab-content active">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ballot Number</th>
                                <th>Location</th>
                                <th>Expected Voters</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="ballots-table-body">
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">No ballots added yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div id="ballots-pagination" class="table-pagination" style="display: none;"></div>
                </div>
                
                <!-- Statistics Tab -->
                <div id="ballot-statistics-tab" class="ballot-tab-content" style="display: none;">
                    <div id="ballot-statistics-content">
                        <div style="text-align: center; padding: 40px; color: var(--text-light);">
                            <p>Select a ballot to view statistics</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Transportation Requirements Section -->
            <div class="section-card">
                <div class="section-header">
                    <h2>Transportation Requirements</h2>
                    <button class="btn-primary btn-compact" id="add-transportation-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Transportation
                    </button>
                </div>
                
                <div class="transportation-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    <button class="transportation-tab-btn active" data-transport-type="flights">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>
                        </svg>
                        Flights
                    </button>
                    <button class="transportation-tab-btn" data-transport-type="speedboats">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <path d="M3 18h18"></path>
                            <path d="M3 12h18"></path>
                            <path d="M3 6h18"></path>
                        </svg>
                        Speed Boats
                    </button>
                    <button class="transportation-tab-btn" data-transport-type="taxis">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect>
                            <line x1="7" y1="3" x2="7" y2="21"></line>
                            <line x1="17" y1="3" x2="17" y2="21"></line>
                        </svg>
                        Taxis
                    </button>
                </div>
                
                <div id="transportation-content">
                    <div class="transportation-panel active" data-panel="flights">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Flight Number</th>
                                        <th>Route</th>
                                        <th>Departure Time</th>
                                        <th>Arrival Time</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="flights-table-body">
                                    <tr>
                                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No flights scheduled yet</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="flights-pagination" class="table-pagination" style="display: none;"></div>
                    </div>
                    
                    <div class="transportation-panel" data-panel="speedboats" style="display: none;">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Boat Name/Number</th>
                                        <th>Route</th>
                                        <th>Departure Time</th>
                                        <th>Arrival Time</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="speedboats-table-body">
                                    <tr>
                                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No speed boats scheduled yet</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="speedboats-pagination" class="table-pagination" style="display: none;"></div>
                    </div>
                    
                    <div class="transportation-panel" data-panel="taxis" style="display: none;">
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Taxi Number</th>
                                        <th>Driver Name</th>
                                        <th>Contact</th>
                                        <th>Route/Area</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="taxis-table-body">
                                    <tr>
                                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No taxis assigned yet</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="taxis-pagination" class="table-pagination" style="display: none;"></div>
                    </div>
                </div>
            </div>
        </div>
    `,

    analytics: `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: var(--text-color);">Analytics & Reports</h1>
                <p class="page-subtitle" style="margin: 5px 0 0 0; color: var(--text-light);">Comprehensive campaign insights and performance metrics</p>
            </div>
            <button class="btn-primary btn-compact" onclick="refreshAnalytics()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Refresh Data
            </button>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(135deg, rgba(111, 193, 218, 0.08) 0%, rgba(141, 212, 232, 0.08) 100%); border-radius: 12px; border: 1px solid rgba(111, 193, 218, 0.2);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span style="font-weight: 600; color: var(--text-color); font-size: 14px;">Analytics Statistics</span>
            </div>
            <button id="analytics-stats-toggle" class="stats-toggle-btn" onclick="toggleStats('analytics')" aria-label="Toggle statistics">
                <span class="stats-toggle-slider"></span>
                <span class="stats-toggle-icon stats-toggle-icon-show">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </span>
                <span class="stats-toggle-icon stats-toggle-icon-hide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
        </div>
        
        <!-- Key Metrics Overview -->
        <div id="analytics-stats-section" class="analytics-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Voters</p>
                </div>
                <h3 id="analytics-total-voters" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--text-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Registered voters in database</p>
            </div>
            
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(5, 150, 105, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Positive Pledges</p>
                </div>
                <h3 id="analytics-positive-pledges" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--success-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="analytics-positive-percentage">0% of total</p>
            </div>
            
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(2, 132, 199, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--info-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Calls</p>
                </div>
                <h3 id="analytics-total-calls" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--info-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Calls made to voters</p>
            </div>
            
            <div class="stat-card" style="background: white; padding: 18px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Active Agents</p>
                </div>
                <h3 id="analytics-active-agents" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: var(--primary-color); line-height: 1.1; word-break: break-word;">0</h3>
                <p style="font-size: 11px; color: var(--text-light); margin: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Assigned campaign agents</p>
            </div>
        </div>
        
        <!-- Analytics Grid -->
        <div class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; margin-bottom: 24px;">
            <!-- Pledge Statistics -->
            <div class="analytics-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Pledge Statistics</h3>
                <div id="pledge-statistics-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Loading pledge statistics...</p>
                    </div>
                </div>
            </div>
            
            <!-- Voter Demographics -->
            <div class="analytics-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Voter Demographics</h3>
                <div id="demographics-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Loading demographics...</p>
                    </div>
                </div>
            </div>
            
            <!-- Island Distribution -->
            <div class="analytics-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Island Distribution</h3>
                <div id="island-distribution-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Loading island data...</p>
                    </div>
                </div>
            </div>
            
            <!-- Call Status Breakdown -->
            <div class="analytics-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Call Status</h3>
                <div id="call-status-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Loading call statistics...</p>
                    </div>
                </div>
            </div>
            
            <!-- Age Distribution -->
            <div class="analytics-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Age Distribution</h3>
                <div id="age-distribution-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Loading age distribution...</p>
                    </div>
                </div>
            </div>
            
            <!-- Agent Performance -->
            <div class="analytics-card" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Top Agents</h3>
                <div id="agent-performance-container">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                        <p>Loading agent performance...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Reports Section -->
        <div class="reports-section" style="background: white; padding: 24px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: var(--text-color);">Generate Reports</h2>
            <div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <button class="report-btn" onclick="generateReport('voter')" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; background: var(--light-color); border: 2px dashed var(--border-color); border-radius: 12px; cursor: pointer; transition: var(--transition); font-family: 'Poppins', sans-serif;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span style="font-weight: 600; color: var(--text-color);">Voter Report</span>
                    <span style="font-size: 12px; color: var(--text-light);">Export voter database</span>
                </button>
                <button class="report-btn" onclick="generateReport('call')" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; background: var(--light-color); border: 2px dashed var(--border-color); border-radius: 12px; cursor: pointer; transition: var(--transition); font-family: 'Poppins', sans-serif;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span style="font-weight: 600; color: var(--text-color);">Call Report</span>
                    <span style="font-size: 12px; color: var(--text-light);">Export call records</span>
                </button>
                <button class="report-btn" onclick="generateReport('event')" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; background: var(--light-color); border: 2px dashed var(--border-color); border-radius: 12px; cursor: pointer; transition: var(--transition); font-family: 'Poppins', sans-serif;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span style="font-weight: 600; color: var(--text-color);">Event Report</span>
                    <span style="font-size: 12px; color: var(--text-light);">Export event attendance</span>
                </button>
                <button class="report-btn" onclick="generateReport('pledge')" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; background: var(--light-color); border: 2px dashed var(--border-color); border-radius: 12px; cursor: pointer; transition: var(--transition); font-family: 'Poppins', sans-serif;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    <span style="font-weight: 600; color: var(--text-color);">Pledge Report</span>
                    <span style="font-size: 12px; color: var(--text-light);">Export pledge statistics</span>
                </button>
                <button class="report-btn" onclick="generateReport('full')" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; background: var(--gradient-primary); border: none; border-radius: 12px; cursor: pointer; transition: var(--transition); font-family: 'Poppins', sans-serif;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span style="font-weight: 600; color: white;">Full Campaign Report</span>
                    <span style="font-size: 12px; color: rgba(255,255,255,0.9);">Complete analytics export</span>
                </button>
            </div>
        </div>
    `,

    settings: `
        <div class="page-header">
            <h1>Settings</h1>
            <p class="page-subtitle">Manage your campaign and account settings</p>
        </div>
        
        <div class="settings-container">
            <div class="settings-section">
                <h2>Campaign Information</h2>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Campaign Name</h3>
                            <p>Current campaign name displayed across the platform</p>
                        </div>
                        <div class="setting-value">
                            <span id="setting-campaign-name">Loading...</span>
                            <button class="icon-btn-sm">Edit</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Campaign Type</h3>
                            <p>Type of election campaign</p>
                        </div>
                        <div class="setting-value">
                            <span id="setting-campaign-type">Loading...</span>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Location</h3>
                            <p>Atoll, Constituency, and Island</p>
                        </div>
                        <div class="setting-value">
                            <span id="setting-location">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h2>Account Settings</h2>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Email Address</h3>
                            <p>Your account email address</p>
                        </div>
                        <div class="setting-value">
                            <span id="setting-email">Loading...</span>
                            <button class="icon-btn-sm">Change</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Password</h3>
                            <p>Change your account password</p>
                        </div>
                        <div class="setting-value">
                            <button class="icon-btn-sm">Change Password</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h2>Notification Preferences</h2>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Email Notifications</h3>
                            <p>Receive notifications via email</p>
                        </div>
                        <div class="setting-value">
                            <label class="toggle-switch">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Push Notifications</h3>
                            <p>Receive push notifications in browser</p>
                        </div>
                        <div class="setting-value">
                            <label class="toggle-switch">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h2>Messenger Settings</h2>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Enable Messenger</h3>
                            <p>Enable the messenger chatbox to communicate with team members</p>
                        </div>
                        <div class="setting-value">
                            <label class="toggle-switch">
                                <input type="checkbox" id="messenger-enabled-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Enable Bottom Navigation</h3>
                            <p>Show bottom navigation dock on mobile devices for quick access to all sections</p>
                        </div>
                        <div class="setting-value">
                            <label class="toggle-switch">
                                <input type="checkbox" id="mobile-bottom-nav-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h2>Display Preferences</h2>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Show Voter Images</h3>
                            <p>Display voter images from the Images folder. When disabled, only avatar initials will be shown.</p>
                        </div>
                        <div class="setting-value">
                            <label class="toggle-switch">
                                <input type="checkbox" id="voter-images-toggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h2>Zero Day Management</h2>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Enable Zero Day</h3>
                            <p>Show Zero Day management in sidebar menu (under Dashboard)</p>
                        </div>
                        <div class="setting-value">
                            <label class="toggle-switch">
                                <input type="checkbox" id="zero-day-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Function to load page content
// Navigation debouncing and performance optimization
let currentSection = null;
let navigationTimeout = null;
let isNavigating = false;

function loadPageContent(section) {
    // Debounce rapid navigation
    if (navigationTimeout) {
        clearTimeout(navigationTimeout);
    }

    // Prevent duplicate loads of the same section
    if (currentSection === section && !isNavigating) {
        return;
    }

    navigationTimeout = setTimeout(() => {
        _loadPageContentInternal(section);
    }, 16); // ~1 frame debounce for smooth performance
}

function _loadPageContentInternal(section) {
    if (isNavigating) return;

    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    isNavigating = true;
    currentSection = section;

    // Use requestAnimationFrame for smooth transitions
    requestAnimationFrame(() => {
        // Fade out current content smoothly if switching pages
        if (contentArea.children.length > 0) {
            contentArea.style.opacity = '0';
            contentArea.style.transform = 'translateY(5px)';
            contentArea.style.transition = 'opacity 0.1s ease-out, transform 0.1s ease-out';
        }

        requestAnimationFrame(() => {
            if (pageTemplates[section]) {
                // Use innerHTML directly for better performance with templates
                contentArea.innerHTML = pageTemplates[section];

                // Reset styles immediately for instant display when using cache
                contentArea.style.opacity = '1';
                contentArea.style.transform = 'translateY(0)';

                // Restore statistics visibility for pages with statistics
                if (['dashboard', 'voters', 'calls', 'pledges', 'analytics'].includes(section)) {
                    setTimeout(() => {
                        restoreStatsVisibility(section);
                    }, 100);
                }
                contentArea.style.transition = 'opacity 0.12s ease-in, transform 0.12s ease-in';
                contentArea.style.willChange = 'contents';

                // Setup real-time listeners if not already set up (after a short delay to ensure db is ready)
                if (window.setupAllRealtimeListeners && !window.realtimeListenersInitialized) {
                    setTimeout(() => {
                        if (window.db && window.userEmail) {
                            window.setupAllRealtimeListeners();
                            window.realtimeListenersInitialized = true;
                        }
                    }, 1000);
                }

                // Load dynamic data from Firebase for each section
                if (section === 'dashboard') {
                    loadDashboardData();
                } else if (section === 'candidates') {
                    setupCandidateFilters();
                    loadCandidatesData();
                    setupSearchListeners('candidates');
                } else if (section === 'voters') {
                    loadVotersData();
                    setupSearchListeners('voters');
                    // Restore statistics visibility preference
                    setTimeout(() => {
                        restoreVotersStatsVisibility();
                    }, 200);
                } else if (section === 'events') {
                    loadEventsData();
                    setupSearchListeners('events');
                } else if (section === 'calls') {
                    loadCallsData();
                    setupSearchListeners('calls');
                } else if (section === 'pledges') {
                    loadPledgesData();
                    setupSearchListeners('pledges');
                } else if (section === 'agents') {
                    loadAgentsData();
                    setupSearchListeners('agents');
                } else if (section === 'zero-day') {
                    loadZeroDayData();
                } else if (section === 'analytics') {
                    loadAnalyticsData();
                } else if (section === 'settings') {
                    populateSettingsData();
                }

                // Reinitialize icons after content load
                setTimeout(() => {
                    if (typeof initIcons === 'function') {
                        initIcons();
                    }
                }, 50);

                // Attach modal button listeners after content is loaded
                setTimeout(() => {
                    attachModalButtonListeners();
                    isNavigating = false;
                }, 50);
            } else {
                contentArea.innerHTML = `
                    <div class="page-header">
                        <h1>Page Not Found</h1>
                        <p class="page-subtitle">The requested page could not be found.</p>
                    </div>
                `;
                isNavigating = false;
            }
        });
    });
}

// Track current section
window.currentSection = () => currentSection;

// Track current section
window.currentSection = () => currentSection;

// Load dashboard data from Firebase
async function loadDashboardData(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    try {
        // Update progress: Starting dashboard load
        if (window.updateComponentProgress) {
            window.updateComponentProgress('dashboard', 20);
        }

        const {
            collection,
            query,
            where,
            onSnapshot
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Update progress: Queries prepared
        if (window.updateComponentProgress) {
            window.updateComponentProgress('dashboard', 40);
        }

        // Store unsubscribe functions for cleanup
        if (!window.dashboardListeners) {
            window.dashboardListeners = [];
        }

        // Clear existing listeners if force refresh
        if (forceRefresh) {
            window.dashboardListeners.forEach(unsub => {
                if (typeof unsub === 'function') unsub();
            });
            window.dashboardListeners = [];
        }

        // Setup real-time listeners for dynamic statistics
        const candidatesQuery = query(collection(window.db, 'candidates'), where('email', '==', window.userEmail));
        const votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
        // Events use campaignEmail, and we want to count only upcoming events (future dates)
        const eventsQuery = query(collection(window.db, 'events'), where('campaignEmail', '==', window.userEmail));
        const callsQuery = query(collection(window.db, 'calls'), where('campaignEmail', '==', window.userEmail));

        // Update progress: Setting up listeners
        if (window.updateComponentProgress) {
            window.updateComponentProgress('dashboard', 60);
        }

        // Set up real-time listeners for each stat
        let statsLoaded = 0;
        const totalStats = 4;

        const updateStat = (statId, count) => {
            const el = document.getElementById(statId);
            if (el) {
                el.textContent = count || 0;
                // Add animation effect
                el.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 200);
            }
        };

        const checkComplete = () => {
            statsLoaded++;
            if (statsLoaded >= totalStats) {
                // Update progress: Dashboard complete
                if (window.updateComponentProgress) {
                    window.updateComponentProgress('dashboard', 100);
                }
                // Load recent activities after stats are ready
                loadRecentActivities();
            } else {
                const progress = 60 + (statsLoaded / totalStats) * 30;
                if (window.updateComponentProgress) {
                    window.updateComponentProgress('dashboard', Math.round(progress));
                }
            }
        };

        // Candidates listener
        const unsubCandidates = onSnapshot(candidatesQuery,
            (snapshot) => {
                updateStat('stat-candidates', snapshot.size);
                if (statsLoaded < totalStats) checkComplete();
            },
            (error) => {
                console.warn('Error listening to candidates:', error);
                updateStat('stat-candidates', 0);
                if (statsLoaded < totalStats) checkComplete();
            }
        );
        window.dashboardListeners.push(unsubCandidates);

        // Voters listener - apply global filter
        const unsubVoters = onSnapshot(votersQuery,
            (snapshot) => {
                let filteredSize = snapshot.size;
                if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
                    let count = 0;
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (window.GlobalFilter.matchesFilter(data)) {
                            count++;
                        }
                    });
                    filteredSize = count;
                }
                updateStat('stat-voters', filteredSize);
                if (statsLoaded < totalStats) checkComplete();
            },
            (error) => {
                console.warn('Error listening to voters:', error);
                updateStat('stat-voters', 0);
                if (statsLoaded < totalStats) checkComplete();
            }
        );
        window.dashboardListeners.push(unsubVoters);

        // Events listener - count only upcoming events (future dates) and apply global filter
        const unsubEvents = onSnapshot(eventsQuery,
            (snapshot) => {
                const now = new Date();
                let upcomingCount = 0;
                snapshot.forEach(doc => {
                    const eventData = doc.data();
                    // Apply global filter first
                    if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
                        if (!window.GlobalFilter.matchesFilter(eventData)) {
                            return;
                        }
                    }
                    if (eventData.eventDate) {
                        const eventDate = eventData.eventDate.toDate ? eventData.eventDate.toDate() : new Date(eventData.eventDate);
                        // Count only events with dates in the future
                        if (eventDate >= now) {
                            upcomingCount++;
                        }
                    }
                });
                updateStat('stat-events', upcomingCount);
                if (statsLoaded < totalStats) checkComplete();
            },
            (error) => {
                console.warn('Error listening to events:', error);
                updateStat('stat-events', 0);
                if (statsLoaded < totalStats) checkComplete();
            }
        );
        window.dashboardListeners.push(unsubEvents);

        // Calls listener - apply global filter
        const unsubCalls = onSnapshot(callsQuery,
            (snapshot) => {
                let filteredSize = snapshot.size;
                if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
                    let count = 0;
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (window.GlobalFilter.matchesFilter(data)) {
                            count++;
                        }
                    });
                    filteredSize = count;
                }
                updateStat('stat-calls', filteredSize);
                if (statsLoaded < totalStats) checkComplete();
            },
            (error) => {
                console.warn('Error listening to calls:', error);
                updateStat('stat-calls', 0);
                if (statsLoaded < totalStats) checkComplete();
            }
        );
        window.dashboardListeners.push(unsubCalls);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Mark as complete even on error
        if (window.updateComponentProgress) {
            window.updateComponentProgress('dashboard', 100);
        }
    }
}

// Load recent activities
async function loadRecentActivities(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    const activitiesEl = document.getElementById('recent-activities');
    if (!activitiesEl) return;

    // Check cache first
    if (!forceRefresh && isCacheValid('activities')) {
        console.log('[loadRecentActivities] Using cached data - instant load');
        renderCachedActivitiesData();
        return;
    }

    try {
        // Show loading state
        activitiesEl.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-light);"><p>Loading activities...</p></div>';

        const {
            collection,
            query,
            where,
            orderBy,
            limit,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const activities = [];
        const maxActivities = 3;

        // Get recent candidates
        try {
            // Query without orderBy first to avoid index issues
            const candidatesQuery = query(
                collection(window.db, 'candidates'),
                where('email', '==', window.userEmail),
                limit(5)
            );
            const candidatesSnap = await getDocs(candidatesQuery);
            candidatesSnap.forEach(doc => {
                const data = doc.data();
                // Only include if email matches (security check)
                if (data.email === window.userEmail || data.campaignEmail === window.userEmail) {
                    activities.push({
                        type: 'candidate',
                        icon: '👤',
                        text: `New candidate added: ${data.name || 'Unknown'}`,
                        timestamp: data.createdAt || data.updatedAt || null,
                        id: doc.id
                    });
                }
            });
        } catch (err) {
            console.warn('Error loading candidate activities:', err);
        }

        // Get recent voters
        try {
            const votersQuery = query(
                collection(window.db, 'voters'),
                where('email', '==', window.userEmail),
                limit(5)
            );
            const votersSnap = await getDocs(votersQuery);
            votersSnap.forEach(doc => {
                const data = doc.data();
                // Only include if email matches (security check)
                if (data.email === window.userEmail || data.campaignEmail === window.userEmail) {
                    activities.push({
                        type: 'voter',
                        icon: '🗳️',
                        text: `New voter registered: ${data.name || 'Unknown'}`,
                        timestamp: data.createdAt || data.updatedAt || null,
                        id: doc.id
                    });
                }
            });
        } catch (err) {
            console.warn('Error loading voter activities:', err);
        }

        // Get recent events
        try {
            const eventsQuery = query(
                collection(window.db, 'events'),
                where('email', '==', window.userEmail),
                limit(5)
            );
            const eventsSnap = await getDocs(eventsQuery);
            eventsSnap.forEach(doc => {
                const data = doc.data();
                // Only include if email matches (security check)
                if (data.email === window.userEmail || data.campaignEmail === window.userEmail) {
                    activities.push({
                        type: 'event',
                        icon: '📅',
                        text: `Event scheduled: ${data.eventName || 'Unknown'}`,
                        timestamp: data.eventDate || data.createdAt || null,
                        id: doc.id
                    });
                }
            });
        } catch (err) {
            console.warn('Error loading event activities:', err);
        }

        // Get recent calls
        try {
            const callsQuery = query(
                collection(window.db, 'calls'),
                where('email', '==', window.userEmail),
                limit(5)
            );
            const callsSnap = await getDocs(callsQuery);
            callsSnap.forEach(doc => {
                const data = doc.data();
                // Only include if email matches (security check)
                if (data.email === window.userEmail || data.campaignEmail === window.userEmail) {
                    activities.push({
                        type: 'call',
                        icon: '📞',
                        text: `Call made to: ${data.voterName || 'Unknown'}`,
                        timestamp: data.callDate || data.createdAt || null,
                        id: doc.id
                    });
                }
            });
        } catch (err) {
            console.warn('Error loading call activities:', err);
        }

        // Get recent pledges
        try {
            const pledgesQuery = query(
                collection(window.db, 'pledges'),
                where('email', '==', window.userEmail),
                limit(5)
            );
            const pledgesSnap = await getDocs(pledgesQuery);
            pledgesSnap.forEach(doc => {
                const data = doc.data();
                // Only include if email matches (security check)
                if (data.email === window.userEmail || data.campaignEmail === window.userEmail) {
                    activities.push({
                        type: 'pledge',
                        icon: '✅',
                        text: `Pledge received from: ${data.voterName || 'Unknown'}`,
                        timestamp: data.pledgeDate || data.createdAt || null,
                        id: doc.id
                    });
                }
            });
        } catch (err) {
            console.warn('Error loading pledge activities:', err);
        }

        // Sort activities by timestamp (most recent first)
        activities.sort((a, b) => {
            const timeA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime()) : 0;
            const timeB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime()) : 0;
            return timeB - timeA;
        });

        // Take only the most recent activities
        const recentActivities = activities.slice(0, maxActivities);

        // Store in cache
        dataCache.activities.data = recentActivities;
        dataCache.activities.timestamp = Date.now();
        dataCache.activities.userEmail = window.userEmail;

        // Render activities
        if (recentActivities.length === 0) {
            activitiesEl.innerHTML = '<div class="activity-item" style="text-align: center; padding: 20px; color: var(--text-light);"><p>No recent activities</p></div>';
        } else {
            activitiesEl.innerHTML = recentActivities.map(activity => {
                let timeText = 'Recently';
                if (activity.timestamp) {
                    try {
                        const timestamp = activity.timestamp.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
                        const now = new Date();
                        const diffMs = now - timestamp;
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        if (diffMins < 1) {
                            timeText = 'Just now';
                        } else if (diffMins < 60) {
                            timeText = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                        } else if (diffHours < 24) {
                            timeText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                        } else if (diffDays < 7) {
                            timeText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                        } else {
                            timeText = timestamp.toLocaleDateString();
                        }
                    } catch (err) {
                        console.warn('Error formatting timestamp:', err);
                    }
                }

                return `
                    <div class="activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-content">
                            <p class="activity-text">${activity.text}</p>
                            <span class="activity-time">${timeText}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading recent activities:', error);
        activitiesEl.innerHTML = '<div class="activity-item" style="text-align: center; padding: 20px; color: var(--text-light);"><p>Error loading activities</p></div>';
    }
}

// Render cached activities data
function renderCachedActivitiesData() {
    if (!dataCache.activities.data) return false;

    const activitiesEl = document.getElementById('recent-activities');
    if (!activitiesEl) return false;

    const recentActivities = dataCache.activities.data;

    // Render activities
    if (recentActivities.length === 0) {
        activitiesEl.innerHTML = '<div class="activity-item" style="text-align: center; padding: 20px; color: var(--text-light);"><p>No recent activities</p></div>';
    } else {
        activitiesEl.innerHTML = recentActivities.map(activity => {
            let timeText = 'Recently';
            if (activity.timestamp) {
                try {
                    const timestamp = activity.timestamp.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
                    const now = new Date();
                    const diffMs = now - timestamp;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    if (diffMins < 1) {
                        timeText = 'Just now';
                    } else if (diffMins < 60) {
                        timeText = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                    } else if (diffHours < 24) {
                        timeText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                    } else if (diffDays < 7) {
                        timeText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                    } else {
                        timeText = timestamp.toLocaleDateString();
                    }
                } catch (err) {
                    console.warn('Error formatting timestamp:', err);
                }
            }

            return `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <p class="activity-text">${activity.text}</p>
                        <span class="activity-time">${timeText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    return true;
}

// Load candidates data
async function loadCandidatesData(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    const tbody = document.getElementById('candidates-table-body');
    if (!tbody) return;

    // Check cache first
    if (!forceRefresh && isCacheValid('candidates')) {
        console.log('[loadCandidatesData] Using cached data - instant load');
        renderCachedCandidatesData();
        return;
    }

    // Show skeleton loading
    showTableSkeleton(tbody, 5, 5);

    try {
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const candidatesQuery = query(collection(window.db, 'candidates'), where('email', '==', window.userEmail));
        const snapshot = await getDocs(candidatesQuery);

        // Store in cache
        const candidatesArray = [];
        snapshot.forEach(doc => {
            candidatesArray.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Apply global filter
        // For candidates: Constituency is master - show all when constituency or show all is selected
        // Only filter by island when island filter is active
        let filteredCandidates = candidatesArray;
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            const filterState = window.GlobalFilter.getState();

            // Only apply filter if it's an island filter
            // For constituency or show all, show all candidates regardless of island
            if (filterState.type === 'island') {
                const beforeFilterCount = filteredCandidates.length;

                filteredCandidates = filteredCandidates.filter(candidate => {
                    const matches = window.GlobalFilter.matchesFilter(candidate);

                    // Debug logging for island filter (only log first few)
                    if (!matches && Math.random() < 0.05) {
                        console.log('[loadCandidatesData] Candidate filtered out by island:', {
                            candidateName: candidate.name,
                            candidateIsland: candidate.island || candidate.constituency || 'N/A',
                            filterIsland: filterState.value,
                            allData: candidate
                        });
                    }

                    return matches;
                });

                const afterFilterCount = filteredCandidates.length;
                console.log(`[loadCandidatesData] Island filter applied: ${beforeFilterCount} -> ${afterFilterCount} candidates (filter: ${filterState.value})`);
            } else if (filterState.type === 'constituency') {
                // Constituency selected - show all candidates (no filtering)
                console.log(`[loadCandidatesData] Constituency filter active - showing all ${filteredCandidates.length} candidates (constituency is master)`);
            }
        } else {
            // No filter active (Show All) - show all candidates
            console.log(`[loadCandidatesData] No filter active - showing all ${filteredCandidates.length} candidates`);
        }

        // Apply local candidate filters (Island and Position) - these are applied after global filter
        const islandFilter = document.getElementById('candidate-island-filter').value || '';
        const positionFilter = document.getElementById('candidate-position-filter').value || '';

        if (islandFilter || positionFilter) {
            const beforeLocalFilterCount = filteredCandidates.length;

            filteredCandidates = filteredCandidates.filter(candidate => {
                // Filter by island
                if (islandFilter) {
                    const candidateIsland = (candidate.island || candidate.constituency || '').trim();
                    if (candidateIsland.toLowerCase() !== islandFilter.toLowerCase()) {
                        return false;
                    }
                }

                // Filter by position
                if (positionFilter) {
                    const candidatePosition = (candidate.position || '').trim();
                    if (candidatePosition.toLowerCase() !== positionFilter.toLowerCase()) {
                        return false;
                    }
                }

                return true;
            });

            const afterLocalFilterCount = filteredCandidates.length;
            console.log(`[loadCandidatesData] Local filters applied: ${beforeLocalFilterCount} -> ${afterLocalFilterCount} candidates (island: ${islandFilter || 'all'}, position: ${positionFilter || 'all'})`);
        }

        dataCache.candidates.data = filteredCandidates;
        dataCache.candidates.timestamp = Date.now();
        dataCache.candidates.userEmail = window.userEmail;
        // Store current filter state to detect changes
        if (window.GlobalFilter) {
            dataCache.candidates.filterState = {
                ...window.GlobalFilter.getState()
            };
        }

        if (filteredCandidates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">No candidates registered yet</td></tr>';
            renderPagination('candidates', 0);
            return;
        }

        // Pagination
        const state = paginationState.candidates;
        const startIndex = (state.currentPage - 1) * state.recordsPerPage;
        const endIndex = startIndex + state.recordsPerPage;
        const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

        // Use DocumentFragment for efficient DOM updates
        const fragment = document.createDocumentFragment();
        paginatedCandidates.forEach((item, index) => {
            const data = item;
            const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
            const candidateId = data.candidateId || 'N/A';

            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.dataset.candidateId = item.id;
            row.innerHTML = `
                <td>
                    <div class="table-cell-user">
                        <div class="user-avatar">${initials}</div>
                        <div>
                            <strong>${data.name || 'N/A'}</strong>
                            ${candidateId !== 'N/A' ? `<span class="table-meta">ID: ${candidateId}</span>` : ''}
                        </div>
                    </div>
                </td>
                <td>${data.position || 'N/A'}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.island || data.constituency || 'N/A'}">${data.island || data.constituency || 'N/A'}</td>
                <td><span class="status-badge ${data.status === 'active' ? 'status-active' : 'status-pending'}">${data.status || 'Pending'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="icon-btn" title="Edit" onclick="event.stopPropagation(); editCandidate('${item.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-btn" title="View Details" onclick="event.stopPropagation(); if (window.openCandidateDetailsSidePanel) window.openCandidateDetailsSidePanel('${item.id}');">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="icon-btn icon-btn-danger" title="Delete" onclick="event.stopPropagation(); deleteCandidate('${item.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            `;

            // Add click handler to row
            row.addEventListener('click', function(e) {
                if (e.target.closest('.table-actions')) {
                    return;
                }
                if (window.openCandidateDetailsSidePanel) {
                    window.openCandidateDetailsSidePanel(item.id);
                }
            });

            fragment.appendChild(row);
        });

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            tbody.textContent = '';
            tbody.appendChild(fragment);
        });

        // Render pagination
        renderPagination('candidates', filteredCandidates.length);

        // Populate island filter dropdown with unique islands from candidates if not already populated
        populateCandidateIslandFilterFromData(candidatesArray);
    } catch (error) {
        console.error('Error loading candidates:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">Error loading candidates</td></tr>';
        renderPagination('candidates', 0);
    }
}

// Populate candidate island filter from candidate data
function populateCandidateIslandFilterFromData(candidatesArray) {
    const islandFilter = document.getElementById('candidate-island-filter');
    if (!islandFilter) return;

    // Check if already populated from constituency
    if (islandFilter.options.length > 1) {
        return; // Already populated
    }

    // Get unique islands from candidates
    const uniqueIslands = new Set();
    candidatesArray.forEach(candidate => {
        const island = candidate.island || candidate.constituency;
        if (island && island.trim()) {
            uniqueIslands.add(island.trim());
        }
    });

    // Sort and add to dropdown
    const sortedIslands = Array.from(uniqueIslands).sort();
    sortedIslands.forEach(island => {
        // Check if option already exists
        const exists = Array.from(islandFilter.options).some(opt => opt.value === island);
        if (!exists) {
            const option = document.createElement('option');
            option.value = island;
            option.textContent = island;
            islandFilter.appendChild(option);
        }
    });
}

// Render cached candidates data
function renderCachedCandidatesData() {
    if (!dataCache.candidates.data) return false;

    const tbody = document.getElementById('candidates-table-body');
    if (!tbody) return false;

    let candidatesArray = dataCache.candidates.data;

    // Apply global filter to cached data
    // For candidates: Constituency is master - show all when constituency or show all is selected
    // Only filter by island when island filter is active
    if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
        const filterState = window.GlobalFilter.getState();

        // Only apply filter if it's an island filter
        // For constituency or show all, show all candidates regardless of island
        if (filterState.type === 'island') {
            candidatesArray = candidatesArray.filter(candidate => {
                return window.GlobalFilter.matchesFilter(candidate);
            });
            console.log(`[renderCachedCandidatesData] Island filter applied: ${candidatesArray.length} candidates (filter: ${filterState.value})`);
        } else if (filterState.type === 'constituency') {
            // Constituency selected - show all candidates (no filtering)
            console.log(`[renderCachedCandidatesData] Constituency filter active - showing all ${candidatesArray.length} candidates (constituency is master)`);
        }
    } else {
        // No filter active (Show All) - show all candidates
        console.log(`[renderCachedCandidatesData] No filter active - showing all ${candidatesArray.length} candidates`);
    }

    // Apply local candidate filters (Island and Position) - these are applied after global filter
    const islandFilter = document.getElementById('candidate-island-filter').value || '';
    const positionFilter = document.getElementById('candidate-position-filter').value || '';

    if (islandFilter || positionFilter) {
        const beforeLocalFilterCount = candidatesArray.length;

        candidatesArray = candidatesArray.filter(candidate => {
            // Filter by island
            if (islandFilter) {
                const candidateIsland = (candidate.island || candidate.constituency || '').trim();
                if (candidateIsland.toLowerCase() !== islandFilter.toLowerCase()) {
                    return false;
                }
            }

            // Filter by position
            if (positionFilter) {
                const candidatePosition = (candidate.position || '').trim();
                if (candidatePosition.toLowerCase() !== positionFilter.toLowerCase()) {
                    return false;
                }
            }

            return true;
        });

        const afterLocalFilterCount = candidatesArray.length;
        console.log(`[renderCachedCandidatesData] Local filters applied: ${beforeLocalFilterCount} -> ${afterLocalFilterCount} candidates (island: ${islandFilter || 'all'}, position: ${positionFilter || 'all'})`);
    }

    if (candidatesArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">No candidates found</td></tr>';
        renderPagination('candidates', 0);
        return true;
    }

    // Pagination
    const state = paginationState.candidates;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const endIndex = startIndex + state.recordsPerPage;
    const paginatedCandidates = candidatesArray.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();

    paginatedCandidates.forEach((item) => {
        const data = item;
        const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
        const candidateId = data.candidateId || 'N/A';

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.dataset.candidateId = item.id;
        row.innerHTML = `
            <td>
                <div class="table-cell-user">
                    <div class="user-avatar">${initials}</div>
                    <div>
                        <strong>${data.name || 'N/A'}</strong>
                        ${candidateId !== 'N/A' ? `<span class="table-meta">ID: ${candidateId}</span>` : ''}
                    </div>
                </div>
            </td>
            <td>${data.position || 'N/A'}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.island || data.constituency || 'N/A'}">${data.island || data.constituency || 'N/A'}</td>
            <td><span class="status-badge ${data.status === 'active' ? 'status-active' : 'status-pending'}">${data.status || 'Pending'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn" title="Edit" onclick="event.stopPropagation(); editCandidate('${item.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-btn" title="View Details" onclick="event.stopPropagation(); if (window.openCandidateDetailsSidePanel) window.openCandidateDetailsSidePanel('${item.id}');">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="icon-btn icon-btn-danger" title="Delete" onclick="event.stopPropagation(); deleteCandidate('${item.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;

        // Add click handler to row
        row.addEventListener('click', function(e) {
            if (e.target.closest('.table-actions')) {
                return;
            }
            if (window.openCandidateDetailsSidePanel) {
                window.openCandidateDetailsSidePanel(item.id);
            }
        });

        fragment.appendChild(row);
    });

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        tbody.textContent = '';
        tbody.appendChild(fragment);
    });

    // Render pagination
    renderPagination('candidates', candidatesArray.length);
    return true;
}

// Get candidate positions based on campaign type (same logic as modals.js)
function getCandidatePositionsForCampaignType() {
    const campaignType = window.campaignData && window.campaignData.campaignType;

    if (!campaignType) {
        // If no campaign type, return all positions
        return [{
                value: 'WDC Member',
                label: 'WDC Member'
            },
            {
                value: 'WDC President',
                label: 'WDC President'
            },
            {
                value: 'Local Council Member',
                label: 'Local Council Member'
            },
            {
                value: 'Local Council President',
                label: 'Local Council President'
            },
            {
                value: 'Parliament Member',
                label: 'Parliament Member'
            },
            {
                value: 'Member of Parliament',
                label: 'Member of Parliament'
            },
            {
                value: 'President',
                label: 'President'
            },
            {
                value: 'Vice President',
                label: 'Vice President'
            }
        ];
    }

    // Map campaign types to positions
    const positionMap = {
        'WDC': [{
                value: 'WDC Member',
                label: 'WDC Member'
            },
            {
                value: 'WDC President',
                label: 'WDC President'
            },
            {
                value: 'Local Council Member',
                label: 'Local Council Member'
            },
            {
                value: 'Local Council President',
                label: 'Local Council President'
            }
        ],
        'Parliament': [{
                value: 'Parliament Member',
                label: 'Parliament Member'
            },
            {
                value: 'Member of Parliament',
                label: 'Member of Parliament'
            }
        ],
        'Presidential': [{
                value: 'President',
                label: 'President'
            },
            {
                value: 'Vice President',
                label: 'Vice President'
            }
        ]
    };

    return positionMap[campaignType] || positionMap['WDC']; // Default to WDC if unknown
}

// Setup candidate filters
function setupCandidateFilters() {
    // Populate island dropdown
    const islandFilter = document.getElementById('candidate-island-filter');
    if (islandFilter) {
        // Clear existing options except the first one
        islandFilter.innerHTML = '<option value="">All Islands</option>';

        // Get constituency from campaign data
        const constituency = window.campaignData && window.campaignData.constituency;

        if (constituency && window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
            const islands = window.getIslandsForConstituency(constituency);

            if (islands && islands.length > 0) {
                islands.forEach(island => {
                    const option = document.createElement('option');
                    option.value = island;
                    option.textContent = island;
                    islandFilter.appendChild(option);
                });
            }
        }

        // Add change event listener
        if (!islandFilter.dataset.listenerAttached) {
            islandFilter.dataset.listenerAttached = 'true';
            islandFilter.addEventListener('change', function() {
                updateCandidateFilterVisibility();
                loadCandidatesData(true);
            });
        }
    }

    // Setup position filter
    const positionFilter = document.getElementById('candidate-position-filter');
    if (positionFilter) {
        // Clear existing options except the first one
        const firstOption = positionFilter.querySelector('option[value=""]');
        positionFilter.innerHTML = '';
        if (firstOption) {
            positionFilter.appendChild(firstOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'All Positions';
            positionFilter.appendChild(defaultOption);
        }

        // Get positions for current campaign type
        const positions = getCandidatePositionsForCampaignType();

        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.value;
            option.textContent = position.label;
            positionFilter.appendChild(option);
        });

        // Add change event listener
        if (!positionFilter.dataset.listenerAttached) {
            positionFilter.dataset.listenerAttached = 'true';
            positionFilter.addEventListener('change', function() {
                updateCandidateFilterVisibility();
                loadCandidatesData(true);
            });
        }
    }

    // Setup clear filters button
    const clearBtn = document.getElementById('clear-candidate-filters-btn');
    if (clearBtn && !clearBtn.dataset.listenerAttached) {
        clearBtn.dataset.listenerAttached = 'true';
        clearBtn.addEventListener('click', clearCandidateFilters);
    }

    // Update filter visibility
    updateCandidateFilterVisibility();
}

// Update candidate filter visibility (show/hide clear button)
function updateCandidateFilterVisibility() {
    const islandFilter = document.getElementById('candidate-island-filter');
    const positionFilter = document.getElementById('candidate-position-filter');
    const clearBtn = document.getElementById('clear-candidate-filters-btn');

    if (clearBtn) {
        const hasActiveFilters = (islandFilter && islandFilter.value) || (positionFilter && positionFilter.value);
        clearBtn.style.display = hasActiveFilters ? 'flex' : 'none';
        // Ensure button maintains proper styling when shown
        if (hasActiveFilters) {
            clearBtn.style.whiteSpace = 'nowrap';
        }
    }
}

// Clear candidate filters
function clearCandidateFilters() {
    const islandFilter = document.getElementById('candidate-island-filter');
    const positionFilter = document.getElementById('candidate-position-filter');

    if (islandFilter) {
        islandFilter.value = '';
    }
    if (positionFilter) {
        positionFilter.value = '';
    }

    updateCandidateFilterVisibility();
    loadCandidatesData(true);
}

// Expose function to window
window.clearCandidateFilters = clearCandidateFilters;

// Load voters data
// Universal data cache system for all tables
const dataCache = {
    voters: {
        data: null,
        timestamp: null,
        userEmail: null
    },
    candidates: {
        data: null,
        timestamp: null,
        userEmail: null,
        filterState: null
    },
    events: {
        data: null,
        timestamp: null,
        userEmail: null,
        filterState: null
    },
    calls: {
        data: null,
        timestamp: null,
        userEmail: null
    },
    pledges: {
        data: null,
        timestamp: null,
        userEmail: null
    },
    agents: {
        data: null,
        timestamp: null,
        userEmail: null
    },
    activities: {
        data: null,
        timestamp: null,
        userEmail: null
    },
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Pagination state for all tables
// Setup search listeners for all tables
function setupSearchListeners(tableType) {
    // Debounce function for search
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Voters search
    if (tableType === 'voters') {
        const voterSearch = document.getElementById('voter-search');
        if (voterSearch) {
            const debouncedSearch = debounce(() => {
                if (voterDataCache.data) {
                    renderCachedVotersData();
                }
            }, 300);
            voterSearch.addEventListener('input', debouncedSearch);
        }
    }

    // Pledges search and filter
    if (tableType === 'pledges') {
        const pledgeSearch = document.getElementById('pledge-search');
        const pledgeFilter = document.getElementById('pledge-filter');

        const refreshPledges = debounce(() => {
            if (dataCache.pledges.data) {
                renderCachedPledgesData();
            }
        }, 300);

        if (pledgeSearch) {
            pledgeSearch.addEventListener('input', refreshPledges);
        }
        if (pledgeFilter) {
            pledgeFilter.addEventListener('change', refreshPledges);
        }
    }

    // Candidates search
    if (tableType === 'candidates') {
        // Add search if needed - candidates table doesn't have search input yet
    }

    // Agents search
    if (tableType === 'agents') {
        // Add search if needed - agents table doesn't have search input yet
    }

    // Calls search
    if (tableType === 'calls') {
        // Add search if needed - calls table doesn't have search input yet
    }

    // Events search
    if (tableType === 'events') {
        // Add search if needed - events table doesn't have search input yet
    }
}

const paginationState = {
    candidates: {
        currentPage: 1,
        recordsPerPage: 15
    },
    voters: {
        currentPage: 1,
        recordsPerPage: 15
    },
    events: {
        currentPage: 1,
        recordsPerPage: 15
    },
    calls: {
        currentPage: 1,
        recordsPerPage: 15
    },
    pledges: {
        currentPage: 1,
        recordsPerPage: 15,
        lastSearchTerm: '',
        lastFilterValue: ''
    },
    agents: {
        currentPage: 1,
        recordsPerPage: 15
    }
};

// Pagination utility functions
function renderPagination(tableType, totalRecords, recordsPerPage = 15) {
    const paginationContainer = document.getElementById(`${tableType}-pagination`);
    if (!paginationContainer) return;

    if (totalRecords <= recordsPerPage) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const currentPage = paginationState[tableType].currentPage || 1;

    let paginationHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-top: 1px solid var(--border-color); border-radius: 0 0 16px 16px;">
            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-light); font-size: 14px;">
                <span>Showing</span>
                <strong style="color: var(--text-color);">${((currentPage - 1) * recordsPerPage) + 1}</strong>
                <span>to</span>
                <strong style="color: var(--text-color);">${Math.min(currentPage * recordsPerPage, totalRecords)}</strong>
                <span>of</span>
                <strong style="color: var(--text-color);">${totalRecords}</strong>
                <span>records</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
    `;

    // Previous button
    paginationHTML += `
        <button 
            class="btn-secondary btn-compact" 
            onclick="goToPage('${tableType}', ${currentPage - 1})"
            ${currentPage === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
            style="min-width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `
            <button class="btn-secondary btn-compact" onclick="goToPage('${tableType}', 1)" style="min-width: 36px; height: 36px; padding: 0;">1</button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span style="color: var(--text-light); padding: 0 4px;">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button 
                class="${i === currentPage ? 'btn-primary' : 'btn-secondary'} btn-compact" 
                onclick="goToPage('${tableType}', ${i})"
                style="min-width: 36px; height: 36px; padding: 0; ${i === currentPage ? 'font-weight: 600;' : ''}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span style="color: var(--text-light); padding: 0 4px;">...</span>`;
        }
        paginationHTML += `
            <button class="btn-secondary btn-compact" onclick="goToPage('${tableType}', ${totalPages})" style="min-width: 36px; height: 36px; padding: 0;">${totalPages}</button>
        `;
    }

    // Next button
    paginationHTML += `
        <button 
            class="btn-secondary btn-compact" 
            onclick="goToPage('${tableType}', ${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
            style="min-width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    `;

    paginationHTML += `
            </div>
        </div>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Go to specific page function
function goToPage(tableType, page) {
    if (!paginationState[tableType]) {
        paginationState[tableType] = {
            currentPage: 1,
            recordsPerPage: 15
        };
    }

    const state = paginationState[tableType];

    // Try to get total records from cache first
    let totalRecords = getTotalRecordsForTable(tableType);
    let totalPages = 0;

    // If we have cached data, calculate total pages
    if (totalRecords > 0) {
        totalPages = Math.ceil(totalRecords / state.recordsPerPage);
    }

    // Validate page number
    if (page < 1) page = 1;
    if (totalPages > 0 && page > totalPages) page = totalPages;

    state.currentPage = page;

    // Render functions that use cached data (faster)
    const renderFunctions = {
        'candidates': renderCachedCandidatesData,
        'voters': renderCachedVotersData,
        'events': renderCachedEventsData,
        'calls': renderCachedCallsData,
        'pledges': renderCachedPledgesData,
        'agents': renderCachedAgentsData
    };

    // Data loaders (fallback if no cached data)
    const dataLoaders = {
        'candidates': loadCandidatesData,
        'voters': loadVotersData,
        'events': loadEventsData,
        'calls': loadCallsData,
        'pledges': loadPledgesData,
        'agents': loadAgentsData
    };

    // First, try to use cached data if available
    const renderFunc = renderFunctions[tableType];
    if (renderFunc && typeof renderFunc === 'function') {
        // Check if we have cached data
        if (dataCache[tableType] && dataCache[tableType].data) {
            // Use cached data - much faster
            renderFunc();
            return;
        }
    }

    // Fallback: reload from Firestore if no cached data
    const loader = dataLoaders[tableType];
    if (loader && typeof loader === 'function') {
        loader(false); // Don't force refresh, use cache if available
    }
}

// Get total records for a table type
function getTotalRecordsForTable(tableType) {
    if (!dataCache[tableType] || !dataCache[tableType].data) return 0;

    const data = dataCache[tableType].data;

    // Handle different data structures
    if (Array.isArray(data)) {
        return data.length;
    } else if (data.pledges && Array.isArray(data.pledges)) {
        return data.pledges.length;
    } else if (data.calls && Array.isArray(data.calls)) {
        return data.calls.length;
    } else if (data.events && Array.isArray(data.events)) {
        return data.events.length;
    } else if (data.candidates && Array.isArray(data.candidates)) {
        return data.candidates.length;
    } else if (data.agents && Array.isArray(data.agents)) {
        return data.agents.length;
    } else if (data.voters && Array.isArray(data.voters)) {
        return data.voters.length;
    }

    return 0;
}

// Make pagination functions globally available
window.goToPage = goToPage;

// Make cache globally accessible
window.dataCache = dataCache;

// Voter data cache (backward compatibility)
const voterDataCache = dataCache.voters;
window.voterDataCache = voterDataCache;

// ============================================
// GLOBAL RENDERING OPTIMIZATION UTILITIES
// ============================================

// Skeleton loading utility for tables
function showTableSkeleton(tbody, numRows = 5, numCols = 5) {
    if (!tbody) return;

    const skeletonRows = [];
    for (let i = 0; i < numRows; i++) {
        const cells = [];
        for (let j = 0; j < numCols; j++) {
            // Vary skeleton width for more realistic look
            const widths = ['60%', '80%', '70%', '90%', '65%'];
            const width = widths[j % widths.length];
            cells.push(`
                <td style="padding: 18px 24px;">
                    <div class="skeleton-loader" style="height: 16px; background: linear-gradient(90deg, var(--border-light) 25%, var(--border-color) 50%, var(--border-light) 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s ease-in-out infinite; border-radius: 4px; width: ${width};"></div>
                </td>
            `);
        }
        skeletonRows.push(`<tr>${cells.join('')}</tr>`);
    }

    tbody.innerHTML = skeletonRows.join('');
}

// Make skeleton function globally available
window.showTableSkeleton = showTableSkeleton;

// Optimized table rendering utility
function renderTableOptimized(tbody, rows, emptyMessage = 'No data available', useRAF = true) {
    if (!tbody) return;

    // Clear existing content efficiently
    tbody.textContent = '';

    if (!rows || rows.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="100%" style="text-align: center; padding: 40px; color: var(--text-light);">${emptyMessage}</td>`;
        tbody.appendChild(emptyRow);
        return;
    }

    // Use DocumentFragment for batch DOM operations
    const fragment = document.createDocumentFragment();

    // Batch create all rows
    rows.forEach(rowElement => {
        if (rowElement instanceof Node) {
            fragment.appendChild(rowElement);
        } else if (typeof rowElement === 'string') {
            // If string HTML, create temporary container
            const temp = document.createElement('tbody');
            temp.innerHTML = rowElement;
            while (temp.firstChild) {
                fragment.appendChild(temp.firstChild);
            }
        }
    });

    // Use requestAnimationFrame for smooth rendering
    const render = () => {
        tbody.appendChild(fragment);
    };

    if (useRAF && typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(render);
    } else {
        render();
    }
}

// Optimized string to DOM element converter
function createRowFromHTML(html) {
    const temp = document.createElement('tbody');
    temp.innerHTML = html;
    return temp.firstElementChild;
}

// Batch create multiple rows efficiently
function createRowsBatch(items, rowCreator) {
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        const row = rowCreator(item, index);
        if (row) {
            fragment.appendChild(row);
        }
    });
    return fragment;
}

// Debounce utility for expensive operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility for frequent operations
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Cache for image filenames to avoid repeated lookups
const imageFilenameCache = new Map();
// Cache for failed lookups to avoid repeated attempts  
const imageNotFoundCache = new Set();
// Pending image lookups to avoid duplicate requests
const pendingImageLookups = new Map();
// Image index loaded from images/index.json (for static hosting)
let imageIndex = null;
let imageIndexLoading = null;

// Helper function to check if voter images are enabled
function areVoterImagesEnabled() {
    const savedSetting = localStorage.getItem('voterImagesEnabled');
    // Default to true (enabled) if not set
    return savedSetting === null || savedSetting === 'true';
}

// Make it globally available
window.areVoterImagesEnabled = areVoterImagesEnabled;

// Function to get voter image URL, checking images folder first based on ID card number
// Returns the best available image URL (existing imageUrl takes priority, then images folder)
// This is a synchronous function that returns immediately (uses cache or returns empty for async lookup)
function getVoterImageUrl(voterData, idCardNumber = null) {
    // Check if voter images are enabled
    if (!areVoterImagesEnabled()) {
        return '';
    }

    // Get existing image URL from voter data first (highest priority)
    if (!voterData) {
        return '';
    }
    const existingImageUrl = voterData.imageUrl || voterData.image || voterData.photo || voterData.photoUrl || '';

    // If we already have a valid image URL, use it
    if (existingImageUrl && existingImageUrl.trim()) {
        return existingImageUrl;
    }

    // Get ID card number from voter data or parameter
    const idNumber = idCardNumber || voterData.idNumber || voterData.voterId || '';

    if (!idNumber || !idNumber.trim()) {
        return '';
    }

    // Normalize ID card number (remove spaces, convert to uppercase)
    const normalizedId = idNumber.trim().toUpperCase();

    // Check cache first
    if (imageFilenameCache.has(normalizedId)) {
        const cachedUrl = imageFilenameCache.get(normalizedId);
        if (cachedUrl) {
            return cachedUrl;
        }
    }

    // Skip if we've already determined no image exists for this ID
    if (imageNotFoundCache.has(normalizedId)) {
        return '';
    }

    // Return empty - the image will be looked up asynchronously
    // The lookupImageFromFolder function will be called to find it
    return '';
}

// Helper function to load the image index from images/index.json
async function loadImageIndex() {
    if (imageIndex !== null) {
        return imageIndex; // Already loaded
    }

    if (imageIndexLoading) {
        return await imageIndexLoading; // Already loading, wait for it
    }

    imageIndexLoading = (async () => {
        try {
            const response = await fetch('/images/index.json');
            if (response.ok) {
                imageIndex = await response.json();
                console.log(`[Image Index] Loaded ${Object.keys(imageIndex).length} image mappings`);
                return imageIndex;
            } else {
                console.log('[Image Index] index.json not found, will use fallback methods');
                imageIndex = {}; // Empty object means index doesn't exist
                return imageIndex;
            }
        } catch (error) {
            console.log('[Image Index] Failed to load index.json:', error);
            imageIndex = {}; // Empty object means index doesn't exist
            return imageIndex;
        }
    })();

    return await imageIndexLoading;
}

// Helper function to check if an image URL exists (for static hosting fallback)
async function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
        // Timeout after 2 seconds
        setTimeout(() => resolve(false), 2000);
    });
}

// Async function to lookup image from images folder by ID card number
// This calls the server endpoint to find matching images, with fallback for static hosting
async function lookupImageFromFolder(idCardNumber) {
    // Check if voter images are enabled
    if (!areVoterImagesEnabled()) {
        return null;
    }

    if (!idCardNumber || !idCardNumber.trim()) {
        return null;
    }

    const normalizedId = idCardNumber.trim().toUpperCase();

    // Check cache first
    if (imageFilenameCache.has(normalizedId)) {
        return imageFilenameCache.get(normalizedId);
    }

    // Skip if we've already determined no image exists
    if (imageNotFoundCache.has(normalizedId)) {
        return null;
    }

    // Check if there's already a pending lookup for this ID
    if (pendingImageLookups.has(normalizedId)) {
        return await pendingImageLookups.get(normalizedId);
    }

    // Create a promise for this lookup
    const lookupPromise = (async () => {
        try {
            // First, try the image index (fastest, works with static hosting)
            const index = await loadImageIndex();
            if (index && index[normalizedId]) {
                const imageUrl = '/' + index[normalizedId].replace(/^\/+/, ''); // Ensure leading slash
                imageFilenameCache.set(normalizedId, imageUrl);
                console.log(`[Image Lookup] Found image via index for ${normalizedId}: ${imageUrl}`);
                return imageUrl;
            }

            // Second, try the API endpoint (for local development with Python server)
            const apiUrl = `/api/find-image?id=${encodeURIComponent(normalizedId)}`;
            console.log(`[Image Lookup] Searching for image with ID: ${normalizedId}`);

            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`[Image Lookup] Response for ${normalizedId}:`, data);
                    if (data.found && data.url) {
                        // Cache the result
                        imageFilenameCache.set(normalizedId, data.url);
                        console.log(`[Image Lookup] Found image for ${normalizedId}: ${data.url}`);
                        return data.url;
                    }
                }
            } catch (apiError) {
                // API endpoint not available (likely static hosting), try direct image URLs
                console.log(`[Image Lookup] API not available, trying direct image URLs for ${normalizedId}`);
            }

            // Fallback: Try direct image URLs (for static hosting when index doesn't exist)
            // Try common patterns: {ID}.png, {ID}.jpg, {ID}.jpeg, and variations
            const extensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
            const baseUrl = `/images/${normalizedId}`;

            for (const ext of extensions) {
                const testUrl = baseUrl + ext;
                const exists = await checkImageExists(testUrl);
                if (exists) {
                    imageFilenameCache.set(normalizedId, testUrl);
                    console.log(`[Image Lookup] Found image via direct check: ${testUrl}`);
                    return testUrl;
                }
            }

            // Try pattern matching: {ID}.*.{ext} (for files like "A241695.Photo ID.171348.png")
            // We'll try a few common patterns
            const patternExtensions = ['.png', '.jpg', '.jpeg'];
            for (const ext of patternExtensions) {
                // Try common patterns that might exist
                const patterns = [
                    `${normalizedId}.Photo ID.${ext}`,
                    `${normalizedId}.Photo${ext}`,
                    `${normalizedId}${ext}`
                ];

                for (const pattern of patterns) {
                    const testUrl = `/images/${pattern}`;
                    const exists = await checkImageExists(testUrl);
                    if (exists) {
                        imageFilenameCache.set(normalizedId, testUrl);
                        console.log(`[Image Lookup] Found image via pattern check: ${testUrl}`);
                        return testUrl;
                    }
                }
            }

            // No image found, cache the negative result
            imageNotFoundCache.add(normalizedId);
            console.log(`[Image Lookup] No image found for ${normalizedId}`);
            return null;
        } catch (error) {
            console.warn(`[Image Lookup] Failed to lookup image for ID ${normalizedId}:`, error);
        } finally {
            // Remove from pending lookups
            pendingImageLookups.delete(normalizedId);
        }
        return null;
    })();

    // Store the pending lookup
    pendingImageLookups.set(normalizedId, lookupPromise);

    return await lookupPromise;
}

// Function to try loading image from images folder when main image fails
// This is called from image onerror handlers
async function tryLoadImageFromFolder(imgElement, idCardNumber) {
    // Check if voter images are enabled
    if (!areVoterImagesEnabled()) {
        return false;
    }

    if (!idCardNumber || !idCardNumber.trim() || !imgElement) {
        return false;
    }

    const imageUrl = await lookupImageFromFolder(idCardNumber);
    if (imageUrl) {
        imgElement.src = imageUrl;
        return true;
    }

    return false;
}

// Make utilities globally available
window.renderTableOptimized = renderTableOptimized;

// Generic toggle function for all statistics sections
function toggleStats(sectionName) {
    const sectionMap = {
        'dashboard': {
            section: 'dashboard-stats-section',
            toggle: 'dashboard-stats-toggle'
        },
        'voters': {
            section: 'voters-stats-section',
            toggle: 'voters-stats-toggle'
        },
        'calls': {
            section: 'calls-stats-section',
            toggle: 'calls-stats-toggle'
        },
        'pledges': {
            section: 'pledges-stats-section',
            toggle: 'pledges-stats-toggle'
        },
        'analytics': {
            section: 'analytics-stats-section',
            toggle: 'analytics-stats-toggle'
        }
    };

    const config = sectionMap[sectionName];
    if (!config) return;

    const statsSection = document.getElementById(config.section);
    const toggleBtn = document.getElementById(config.toggle);

    if (!statsSection || !toggleBtn) return;

    const isHidden = statsSection.style.display === 'none' ||
        statsSection.style.maxHeight === '0px' ||
        statsSection.classList.contains('stats-hidden');

    if (isHidden) {
        // Show statistics
        statsSection.style.display = statsSection.classList.contains('analytics-stats-grid') ? 'grid' : 'grid';
        statsSection.style.maxHeight = '1000px';
        statsSection.style.opacity = '1';
        statsSection.classList.remove('stats-hidden');
        toggleBtn.classList.add('stats-toggle-active');
        toggleBtn.setAttribute('aria-pressed', 'true');

        // Save preference
        localStorage.setItem(`${sectionName}StatsVisible`, 'true');
    } else {
        // Hide statistics
        statsSection.style.maxHeight = '0px';
        statsSection.style.opacity = '0';
        statsSection.classList.add('stats-hidden');

        // Wait for animation then hide
        setTimeout(() => {
            if (statsSection.style.maxHeight === '0px') {
                statsSection.style.display = 'none';
            }
        }, 400);

        toggleBtn.classList.remove('stats-toggle-active');
        toggleBtn.setAttribute('aria-pressed', 'false');

        // Save preference
        localStorage.setItem(`${sectionName}StatsVisible`, 'false');
    }
}

// Make toggle function globally available
window.toggleStats = toggleStats;
window.toggleVotersStats = () => toggleStats('voters'); // Keep for backward compatibility

// Restore statistics visibility preference on page load
function restoreStatsVisibility(sectionName) {
    const sectionMap = {
        'dashboard': {
            section: 'dashboard-stats-section',
            toggle: 'dashboard-stats-toggle'
        },
        'voters': {
            section: 'voters-stats-section',
            toggle: 'voters-stats-toggle'
        },
        'calls': {
            section: 'calls-stats-section',
            toggle: 'calls-stats-toggle'
        },
        'pledges': {
            section: 'pledges-stats-section',
            toggle: 'pledges-stats-toggle'
        },
        'analytics': {
            section: 'analytics-stats-section',
            toggle: 'analytics-stats-toggle'
        }
    };

    const config = sectionMap[sectionName];
    if (!config) return;

    const statsSection = document.getElementById(config.section);
    const toggleBtn = document.getElementById(config.toggle);

    if (!statsSection || !toggleBtn) return;

    const savedPreference = localStorage.getItem(`${sectionName}StatsVisible`);
    if (savedPreference === 'false') {
        statsSection.style.display = 'none';
        statsSection.style.maxHeight = '0px';
        statsSection.style.opacity = '0';
        statsSection.classList.add('stats-hidden');
        toggleBtn.classList.remove('stats-toggle-active');
        toggleBtn.setAttribute('aria-pressed', 'false');
    } else {
        statsSection.style.display = statsSection.classList.contains('analytics-stats-grid') ? 'grid' : 'grid';
        statsSection.style.maxHeight = '1000px';
        statsSection.style.opacity = '1';
        statsSection.classList.remove('stats-hidden');
        toggleBtn.classList.add('stats-toggle-active');
        toggleBtn.setAttribute('aria-pressed', 'true');
    }
}

// Backward compatibility function
function restoreVotersStatsVisibility() {
    restoreStatsVisibility('voters');
}
window.createRowFromHTML = createRowFromHTML;
window.createRowsBatch = createRowsBatch;
window.debounce = debounce;
window.throttle = throttle;

// ============================================
// REAL-TIME SYNC SYSTEM FOR ALL TABLES
// ============================================

// Global listeners storage
window.realtimeListeners = {
    candidates: null,
    voters: null,
    events: null,
    calls: null,
    pledges: null,
    agents: null,
    activities: null
};

// Debounced refresh function to avoid too many updates
const debouncedRefresh = debounce((tableType) => {
    console.log(`[Real-time Sync] Refreshing ${tableType} table...`);
    clearCache(tableType);

    // Always refresh the table if it's currently visible, regardless of section name
    const currentSection = window.currentSection || '';
    const shouldRefresh = currentSection === tableType ||
        currentSection === tableType.slice(0, -1) ||
        document.getElementById(`${tableType}-table-body`) !== null ||
        document.getElementById(`${tableType.slice(0, -1)}-table-body`) !== null;

    if (shouldRefresh) {
        console.log(`[Real-time Sync] Table ${tableType} is visible, refreshing...`);
        switch (tableType) {
            case 'candidates':
                if (typeof loadCandidatesData === 'function') loadCandidatesData(true);
                break;
            case 'voters':
                if (typeof loadVotersData === 'function') loadVotersData(true);
                break;
            case 'events':
                if (typeof loadEventsData === 'function') loadEventsData(true);
                break;
            case 'calls':
                if (typeof loadCallsData === 'function') loadCallsData(true);
                break;
            case 'pledges':
                console.log('[Real-time Sync] Debounced refresh: Loading pledges data...');
                if (typeof loadPledgesData === 'function') {
                    loadPledgesData(true);
                } else {
                    console.warn('[Real-time Sync] loadPledgesData function not found in debounced refresh');
                }
                break;
            case 'agents':
                if (typeof loadAgentsData === 'function') loadAgentsData(true);
                break;
        }
    } else {
        console.log(`[Real-time Sync] Table ${tableType} not visible, skipping refresh`);
    }

    // Always refresh activities when any data changes
    if (tableType !== 'activities') {
        clearCache('activities');
        if (typeof loadRecentActivities === 'function') {
            loadRecentActivities(true);
        }
    }
}, 300); // Reduced debounce time for faster updates

// Setup real-time listener for a collection
async function setupRealtimeListener(collectionName, tableType) {
    if (!window.db || !window.userEmail) {
        console.warn(`[Real-time Sync] Cannot setup listener for ${tableType}: db or userEmail not available`);
        return;
    }

    // Ensure user is authenticated before setting up listeners
    // Check auth if available, but don't block if auth object doesn't exist yet
    if (window.auth && !window.auth.currentUser) {
        console.warn(`[Real-time Sync] User not authenticated for ${tableType}, but continuing anyway (auth may be set up later)`);
        // Don't return - continue setting up listener as Firestore rules will handle auth
    }

    // Clean up existing listener if it exists
    if (window.realtimeListeners[tableType] && typeof window.realtimeListeners[tableType] === 'function') {
        console.log(`[Real-time Sync] Cleaning up existing listener for ${tableType}`);
        window.realtimeListeners[tableType]();
        window.realtimeListeners[tableType] = null;
    }

    try {
        const {
            collection,
            query,
            where,
            onSnapshot
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Determine the email field to use
        // For voters, we need to handle both 'email' and 'campaignEmail' fields
        let collectionQuery;
        let emailField; // Define emailField outside if/else for logging
        if (collectionName === 'voters') {
            // Try email field first, but we'll handle both in the listener
            emailField = 'email';
            collectionQuery = query(
                collection(window.db, collectionName),
                where('email', '==', window.userEmail)
            );
        } else {
            // For pledges, events, and calls, use 'email' field (pledges use 'email' set to campaign manager's email)
            // Events and calls use 'campaignEmail', but we'll handle pledges separately
            if (collectionName === 'pledges') {
                emailField = 'email';
                collectionQuery = query(
                    collection(window.db, collectionName),
                    where('email', '==', window.userEmail)
                );
                console.log(`[Real-time Sync] Pledges listener configured to listen for email: ${window.userEmail}`);
            } else {
                emailField = (collectionName === 'events' || collectionName === 'calls') ? 'campaignEmail' : 'email';
                collectionQuery = query(
                    collection(window.db, collectionName),
                    where(emailField, '==', window.userEmail)
                );
            }
        }

        let isInitialLoad = true;

        const unsubscribe = onSnapshot(
            collectionQuery,
            (snapshot) => {
                // Skip processing initial load (we already have data from initial fetch)
                if (isInitialLoad) {
                    isInitialLoad = false;
                    console.log(`[Real-time Sync] ${tableType} initial snapshot received (${snapshot.size} items) - listener is now active`);

                    // For agents, don't update cache on initial load - let loadAgentsData handle it with stats
                    if (tableType === 'agents') {
                        console.log(`[Real-time Sync] Agents initial snapshot - skipping cache update (will be handled by loadAgentsData)`);
                        return;
                    }

                    // For other tables, update cache with initial snapshot
                    const dataArray = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        // For voters, filter by both email and campaignEmail
                        if (tableType === 'voters') {
                            if (data.email === window.userEmail || data.campaignEmail === window.userEmail) {
                                dataArray.push({
                                    id: doc.id,
                                    ...data
                                });
                            }
                        } else {
                            dataArray.push({
                                id: doc.id,
                                ...data
                            });
                        }
                    });
                    if (dataCache[tableType]) {
                        dataCache[tableType].data = dataArray;
                        dataCache[tableType].timestamp = Date.now();
                        dataCache[tableType].userEmail = window.userEmail;
                    }
                    return;
                }

                console.log(`[Real-time Sync] ${tableType} collection changed. Processing changes...`);

                let hasChanges = false;
                let changeCount = {
                    added: 0,
                    modified: 0,
                    removed: 0
                };

                // Check for actual changes (not just initial load)
                snapshot.docChanges().forEach((change) => {
                    // For voters, filter by email/campaignEmail match
                    if (tableType === 'voters') {
                        const data = change.doc.data();
                        if (data.email !== window.userEmail && data.campaignEmail !== window.userEmail) {
                            // Skip this change - doesn't match user's email
                            return;
                        }
                    }
                    // For pledges, the query already filters by email, but log for debugging
                    if (tableType === 'pledges') {
                        const data = change.doc.data();
                        console.log(`[Real-time Sync] Pledge change detected:`, {
                            type: change.type,
                            pledgeId: change.doc.id,
                            email: data.email,
                            userEmail: window.userEmail,
                            voterName: data.voterName,
                            agentName: data.agentName
                        });
                    }

                    hasChanges = true;
                    if (change.type === 'added') {
                        changeCount.added++;
                        console.log(`[Real-time Sync] ✨ New ${tableType} added:`, change.doc.id);
                    } else if (change.type === 'modified') {
                        changeCount.modified++;
                        console.log(`[Real-time Sync] 🔄 ${tableType} modified:`, change.doc.id);
                    } else if (change.type === 'removed') {
                        changeCount.removed++;
                        console.log(`[Real-time Sync] 🗑️ ${tableType} removed:`, change.doc.id);
                    }
                });

                if (!hasChanges) {
                    console.log(`[Real-time Sync] ${tableType} snapshot received but no changes detected`);
                    return;
                }

                // Show sync notification
                showSyncNotification(tableType, changeCount);

                // For agents, we need to trigger full reload to recalculate stats
                // Don't update cache directly for agents - let loadAgentsData handle it
                if (tableType === 'agents') {
                    console.log(`[Real-time Sync] Agents changed - triggering full reload to recalculate stats...`);
                    // Clear cache to force full reload
                    clearCache('agents');
                    // Trigger immediate refresh
                    const tableBody = document.getElementById('agents-table-body');
                    if (tableBody && tableBody.offsetParent !== null) {
                        setTimeout(() => {
                            if (typeof loadAgentsData === 'function') {
                                loadAgentsData(true);
                            }
                        }, 100);
                    }
                    return; // Skip cache update for agents
                }

                // Update cache with new data (for other table types)
                // For pledges, maintain the structured cache format
                if (tableType === 'pledges') {
                    // For pledges, we need to maintain the structured format with pledges array
                    const pledgesArray = [];
                    snapshot.forEach(doc => {
                        pledgesArray.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });

                    // Preserve existing cache structure or create new one
                    if (dataCache.pledges && dataCache.pledges.data && typeof dataCache.pledges.data === 'object' && !Array.isArray(dataCache.pledges.data)) {
                        // Update existing structured cache
                        dataCache.pledges.data.pledges = pledgesArray;
                        dataCache.pledges.data.voterDataMap = dataCache.pledges.data.voterDataMap || [];
                        // Recalculate stats
                        let yes = 0,
                            no = 0,
                            undecided = 0;
                        pledgesArray.forEach(pledge => {
                            const status = (pledge.pledge || '').toLowerCase();
                            if (status === 'yes' || status.includes('yes')) yes++;
                            else if (status === 'no' || status === 'negative' || status.includes('no')) no++;
                            else undecided++;
                        });
                        dataCache.pledges.data.stats = {
                            yes,
                            no,
                            undecided,
                            total: pledgesArray.length
                        };
                    } else {
                        // Create new structured cache
                        dataCache.pledges.data = {
                            pledges: pledgesArray,
                            voterDataMap: [],
                            stats: {
                                yes: 0,
                                no: 0,
                                undecided: 0,
                                total: pledgesArray.length
                            }
                        };
                    }
                    dataCache.pledges.timestamp = Date.now();
                    dataCache.pledges.userEmail = window.userEmail;
                    console.log(`[Real-time Sync] ${tableType} cache updated with ${pledgesArray.length} items (structured format)`);
                } else {
                    // For other table types, use simple array format
                    const dataArray = [];
                    snapshot.forEach(doc => {
                        dataArray.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });

                    // Update cache
                    if (dataCache[tableType]) {
                        dataCache[tableType].data = dataArray;
                        dataCache[tableType].timestamp = Date.now();
                        dataCache[tableType].userEmail = window.userEmail;
                        console.log(`[Real-time Sync] ${tableType} cache updated with ${dataArray.length} items`);
                    }
                }

                // Always refresh UI - debouncedRefresh will check if table is visible
                console.log(`[Real-time Sync] Triggering refresh for ${tableType}...`);
                debouncedRefresh(tableType);

                // Also force immediate refresh if table is definitely visible (bypass debounce for critical updates)
                const tableBody = document.getElementById(`${tableType}-table-body`) ||
                    document.getElementById(`${tableType.slice(0, -1)}-table-body`);
                if (tableBody && tableBody.offsetParent !== null) {
                    // Table is visible, refresh immediately
                    setTimeout(() => {
                        switch (tableType) {
                            case 'voters':
                                if (typeof loadVotersData === 'function') loadVotersData(true);
                                break;
                            case 'calls':
                                if (typeof loadCallsData === 'function') loadCallsData(true);
                                break;
                            case 'pledges':
                                console.log('[Real-time Sync] Force refreshing pledges table immediately...');
                                if (typeof loadPledgesData === 'function') {
                                    loadPledgesData(true);
                                } else {
                                    console.warn('[Real-time Sync] loadPledgesData function not found');
                                }
                                break;
                            case 'events':
                                if (typeof loadEventsData === 'function') loadEventsData(true);
                                break;
                            case 'agents':
                                if (typeof loadAgentsData === 'function') loadAgentsData(true);
                                break;
                            case 'candidates':
                                if (typeof loadCandidatesData === 'function') loadCandidatesData(true);
                                break;
                        }
                    }, 100);
                }

                // Also refresh activities when any data changes
                if (tableType !== 'activities') {
                    clearCache('activities');
                    // Debounce activities refresh too
                    setTimeout(() => {
                        loadRecentActivities(true);
                    }, 1000);
                }
            },
            (error) => {
                console.error(`[Real-time Sync] Error listening to ${tableType} (collection: ${collectionName}):`, error);
                console.error(`[Real-time Sync] Error details:`, {
                    code: error.code,
                    message: error.message,
                    userEmail: window.userEmail,
                    emailField: emailField,
                    authenticated: window.auth && window.auth.currentUser ? 'yes' : 'no'
                });

                // If permission denied, try to provide helpful message
                if (error.code === 'permission-denied') {
                    console.warn(`[Real-time Sync] Permission denied for ${tableType}. Make sure Firestore rules are deployed and user is authenticated.`);
                }
            }
        );

        window.realtimeListeners[tableType] = unsubscribe;
        console.log(`[Real-time Sync] Listener set up for ${tableType} (collection: ${collectionName}, emailField: ${emailField}, userEmail: ${window.userEmail})`);

        // For pledges, log additional info to help debug agent-created pledges
        if (tableType === 'pledges') {
            console.log(`[Real-time Sync] Pledges listener configured to listen for email: ${window.userEmail}`);
            console.log(`[Real-time Sync] Agents should create pledges with email field set to campaign manager's email (${window.userEmail})`);
        }
    } catch (error) {
        console.error(`[Real-time Sync] Failed to setup listener for ${tableType} (collection: ${collectionName}):`, error);
        console.error(`[Real-time Sync] Error setting up listener for ${tableType}:`, error);
    }
}

// Setup all real-time listeners
async function setupAllRealtimeListeners() {
    if (!window.db || !window.userEmail) {
        console.warn('[Real-time Sync] Cannot setup listeners: db or userEmail not available');
        return;
    }

    console.log('[Real-time Sync] Setting up all real-time listeners...');

    // Setup listeners for all collections
    await setupRealtimeListener('candidates', 'candidates');
    await setupRealtimeListener('voters', 'voters');
    await setupRealtimeListener('events', 'events');
    await setupRealtimeListener('calls', 'calls');
    await setupRealtimeListener('pledges', 'pledges');
    await setupRealtimeListener('agents', 'agents');

    // Activities don't need a separate listener - they update when source data changes
    // The debouncedRefresh function already handles activities refresh

    // Start polling fallback
    startPollingFallback();

    console.log('[Real-time Sync] All listeners set up successfully');
}

// Cleanup all real-time listeners
function cleanupAllRealtimeListeners() {
    console.log('[Real-time Sync] Cleaning up all listeners...');
    Object.keys(window.realtimeListeners).forEach(key => {
        if (window.realtimeListeners[key] && typeof window.realtimeListeners[key] === 'function') {
            window.realtimeListeners[key]();
            window.realtimeListeners[key] = null;
        }
    });
    window.realtimeListenersInitialized = false;

    // Stop polling fallback
    stopPollingFallback();

    console.log('[Real-time Sync] All listeners cleaned up');
}

// Polling fallback mechanism (checks every 30 seconds if listeners fail)
let pollingInterval = null;
const POLLING_INTERVAL = 30000; // 30 seconds

function startPollingFallback() {
    // Clear existing interval if any
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // Only start polling if listeners are not working
    pollingInterval = setInterval(async () => {
        if (!window.db || !window.userEmail) return;

        // Check if listeners are active
        const listenersActive = Object.values(window.realtimeListeners).some(listener => listener !== null);

        if (!listenersActive && window.realtimeListenersInitialized) {
            console.log('[Real-time Sync] Listeners appear inactive, attempting to reinitialize...');
            try {
                await setupAllRealtimeListeners();
            } catch (error) {
                console.warn('[Real-time Sync] Failed to reinitialize listeners, will retry on next poll:', error);
            }
        }

        // Also do a lightweight sync check - refresh current section if visible
        const currentSection = window.currentSection || '';
        if (currentSection && ['candidates', 'voters', 'events', 'calls', 'pledges', 'agents'].includes(currentSection)) {
            // Light refresh - just check if cache is stale
            if (!isCacheValid(currentSection)) {
                console.log(`[Real-time Sync] Cache for ${currentSection} is stale, refreshing...`);
                switch (currentSection) {
                    case 'candidates':
                        loadCandidatesData(true);
                        break;
                    case 'voters':
                        loadVotersData(true);
                        break;
                    case 'events':
                        loadEventsData(true);
                        break;
                    case 'calls':
                        loadCallsData(true);
                        break;
                    case 'pledges':
                        loadPledgesData(true);
                        break;
                    case 'agents':
                        loadAgentsData(true);
                        break;
                }
            }
        }
    }, POLLING_INTERVAL);

    console.log('[Real-time Sync] Polling fallback started (30s interval)');
}

function stopPollingFallback() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('[Real-time Sync] Polling fallback stopped');
    }
}

// Make polling functions globally available
window.startPollingFallback = startPollingFallback;
window.stopPollingFallback = stopPollingFallback;

// Make functions globally available
// Show sync notification when data changes (bottom-right toast notification)
function showSyncNotification(tableType, changeCount) {
    // Create or get notification container
    let notificationContainer = document.getElementById('sync-notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'sync-notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            max-width: 350px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: var(--white);
        border-left: 4px solid var(--primary-color);
        border-radius: 8px;
        padding: 14px 16px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        max-width: 350px;
        animation: slideInBottomLeft 0.3s ease-out;
        pointer-events: auto;
        transition: all 0.3s ease;
    `;

    const tableNames = {
        voters: 'Voters',
        calls: 'Calls',
        pledges: 'Pledges',
        events: 'Events',
        agents: 'Agents',
        candidates: 'Candidates'
    };

    let message = '';
    if (changeCount.added > 0) {
        message = `${changeCount.added} new ${tableNames[tableType] || tableType} added`;
    } else if (changeCount.modified > 0) {
        message = `${changeCount.modified} ${tableNames[tableType] || tableType} updated`;
    } else if (changeCount.removed > 0) {
        message = `${changeCount.removed} ${tableNames[tableType] || tableType} removed`;
    }

    notification.innerHTML = `
        <div style="width: 10px; height: 10px; background: var(--primary-color); border-radius: 50%; flex-shrink: 0; animation: pulse 2s infinite;"></div>
        <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: 600; color: var(--text-color); margin-bottom: 2px;">Data Synced</div>
            <div style="font-size: 12px; color: var(--text-light); line-height: 1.4;">${message}</div>
        </div>
        <button class="sync-notification-close" style="background: none; border: none; color: var(--text-light); cursor: pointer; padding: 4px; margin-left: 8px; opacity: 0.6; transition: opacity 0.2s; flex-shrink: 0;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" onclick="this.parentElement.remove()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    notificationContainer.appendChild(notification);

    // Hover effect
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateY(-2px)';
        notification.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)';
    });
    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateY(0)';
        notification.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)';
    });

    // Remove after 4 seconds (increased from 3)
    setTimeout(() => {
        notification.style.animation = 'slideOutBottomRight 0.3s ease-out';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add CSS animations for sync notifications (bottom-right)
if (!document.getElementById('sync-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'sync-notification-styles';
    style.textContent = `
        @keyframes slideInBottomRight {
            from {
                transform: translateX(100%) translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateX(0) translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOutBottomRight {
            from {
                transform: translateX(0) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%) translateY(20px);
                opacity: 0;
            }
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
        @media (max-width: 768px) {
            #sync-notification-container {
                bottom: 10px !important;
                right: 10px !important;
                left: 10px !important;
                max-width: calc(100% - 20px) !important;
            }
            #sync-notification-container > div {
                min-width: auto !important;
                max-width: 100% !important;
            }
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
    `;
    document.head.appendChild(style);
}

window.setupAllRealtimeListeners = setupAllRealtimeListeners;
window.cleanupAllRealtimeListeners = cleanupAllRealtimeListeners;
window.setupRealtimeListener = setupRealtimeListener;
window.showSyncNotification = showSyncNotification;

// Universal cache validation function
function isCacheValid(cacheType, forceRefresh = false) {
    const cache = dataCache[cacheType];
    if (!cache) return false;
    if (forceRefresh) return false;
    if (!cache.data) return false;
    if (cache.userEmail !== window.userEmail) return false;
    if (!cache.timestamp) return false;

    // Check if GlobalFilter has changed since cache was created
    if (window.GlobalFilter && cache.filterState) {
        const currentFilterState = window.GlobalFilter.getState();
        const cachedFilterState = cache.filterState;
        // If filter state changed, cache is invalid
        if (currentFilterState.type !== cachedFilterState.type ||
            currentFilterState.value !== cachedFilterState.value) {
            console.log(`[isCacheValid] Cache invalidated due to filter change for ${cacheType}`);
            return false;
        }
    } else if (window.GlobalFilter) {
        // If GlobalFilter exists but cache doesn't have filterState, invalidate
        const currentFilterState = window.GlobalFilter.getState();
        if (currentFilterState.isActive) {
            console.log(`[isCacheValid] Cache invalidated - filter active but cache missing filterState for ${cacheType}`);
            return false;
        }
    }

    const now = Date.now();
    const cacheAge = now - cache.timestamp;
    return cacheAge < dataCache.CACHE_DURATION;
}

// Function to check if cache is valid (backward compatibility for voters)
function isVoterCacheValid(forceRefresh = false) {
    return isCacheValid('voters', forceRefresh);
}

// Function to clear cache for a specific type
function clearCache(cacheType) {
    if (dataCache[cacheType]) {
        dataCache[cacheType].data = null;
        dataCache[cacheType].timestamp = null;
        dataCache[cacheType].userEmail = null;
        dataCache[cacheType].filterState = null;
    }
}

// Function to clear all caches
function clearAllCaches() {
    Object.keys(dataCache).forEach(key => {
        if (key !== 'CACHE_DURATION' && dataCache[key]) {
            dataCache[key].data = null;
            dataCache[key].timestamp = null;
            dataCache[key].userEmail = null;
            dataCache[key].filterState = null;
        }
    });
}

// Function to render cached data immediately (optimized for instant display)
function renderCachedVotersData() {
    if (!voterDataCache.data) {
        console.warn('[renderCachedVotersData] No cache data available');
        return false;
    }

    const tbody = document.getElementById('voters-table-body');
    if (!tbody) {
        console.warn('[renderCachedVotersData] Table body not found');
        return false;
    }

    const {
        filteredDocs: allDocs,
        stats
    } = voterDataCache.data || {};

    // Safety check: ensure allDocs is an array
    if (!Array.isArray(allDocs)) {
        console.warn('[renderCachedVotersData] Cache data structure invalid, clearing cache and reloading...');
        clearVoterCache();
        if (typeof loadVotersData === 'function') {
            loadVotersData(true);
        }
        return false;
    }

    // Apply global filter to cached data
    let filteredDocs = allDocs;
    if (window.FilterUtils) {
        filteredDocs = window.FilterUtils.applyFilterToArray(allDocs);
    }

    // Safety check: if stats is missing, calculate it from the data
    // Recalculate stats based on filtered data if global filter is active
    let safeStats = stats;
    if (!safeStats || typeof safeStats !== 'object' || (window.GlobalFilter && window.GlobalFilter.getState().isActive)) {
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            console.log('[renderCachedVotersData] Recalculating stats based on filtered data...');
        } else {
            console.warn('[renderCachedVotersData] Stats missing from cache, calculating from data...');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let total = 0;
        let todayCount = 0;
        let verified = 0;
        let pending = 0;

        // Calculate stats from filtered data (or allDocs if no filter)
        const dataToUse = (window.GlobalFilter && window.GlobalFilter.getState().isActive) ? filteredDocs : allDocs;
        if (dataToUse && Array.isArray(dataToUse)) {
            dataToUse.forEach(({
                data
            }) => {
                total++;
                if (data.verified) verified++;
                else pending++;

                if (data.registeredAt) {
                    const regDate = data.registeredAt.toDate ? data.registeredAt.toDate() : new Date(data.registeredAt);
                    if (regDate >= today) todayCount++;
                }
            });
        }

        safeStats = {
            total,
            todayCount,
            verified,
            pending
        };
    }

    // Apply search filter
    const searchInput = document.getElementById('voter-search');
    const searchTerm = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';

    if (searchTerm && Array.isArray(filteredDocs)) {
        filteredDocs = filteredDocs.filter(({
            data
        }) => {
            const name = (data.name || '').toLowerCase();
            const idNumber = (data.idNumber || data.voterId || '').toLowerCase();
            const permanentAddress = (data.permanentAddress || data.address || '').toLowerCase();
            const currentLocation = (data.currentLocation || data.location || '').toLowerCase();
            const island = (data.island || '').toLowerCase();
            const atoll = (data.atoll || '').toLowerCase();

            return name.includes(searchTerm) ||
                idNumber.includes(searchTerm) ||
                permanentAddress.includes(searchTerm) ||
                currentLocation.includes(searchTerm) ||
                island.includes(searchTerm) ||
                atoll.includes(searchTerm);
        });
    }

    // Update statistics immediately (cache hit = instant display)
    const totalEl = document.getElementById('stat-voters-total');
    const todayEl = document.getElementById('stat-voters-today');
    const verifiedEl = document.getElementById('stat-voters-verified');
    const pendingEl = document.getElementById('stat-voters-pending');

    if (totalEl) totalEl.textContent = safeStats.total || 0;
    if (todayEl) todayEl.textContent = safeStats.todayCount || 0;
    if (verifiedEl) verifiedEl.textContent = safeStats.verified || 0;
    if (pendingEl) pendingEl.textContent = safeStats.pending || 0;

    // Track search state to detect changes - only reset to page 1 when search actually changes
    if (!paginationState.voters.lastSearchTerm) paginationState.voters.lastSearchTerm = '';

    const searchChanged = paginationState.voters.lastSearchTerm !== searchTerm;

    // Only reset to page 1 if search changed (not on pagination navigation)
    if (searchChanged) {
        paginationState.voters.currentPage = 1;
        paginationState.voters.lastSearchTerm = searchTerm;
    }

    // Render table
    if (filteredDocs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">' +
            (searchTerm ? 'No voters found matching your search' : 'No voters registered yet') + '</td></tr>';
        renderPagination('voters', filteredDocs.length);
        return true;
    }

    // Pagination
    const state = paginationState.voters;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const endIndex = startIndex + state.recordsPerPage;
    const paginatedVoters = filteredDocs.slice(startIndex, endIndex);

    // Build fragment efficiently
    const fragment = document.createDocumentFragment();
    let rowNumber = startIndex + 1;

    paginatedVoters.forEach(({
        id,
        data
    }) => {
        // Format date of birth
        let dobDisplay = 'N/A';
        if (data.dateOfBirth) {
            if (data.dateOfBirth.toDate) {
                const dob = data.dateOfBirth.toDate();
                dobDisplay = dob.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } else if (typeof data.dateOfBirth === 'string') {
                const dob = new Date(data.dateOfBirth);
                if (!isNaN(dob.getTime())) {
                    dobDisplay = dob.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                } else {
                    dobDisplay = data.dateOfBirth;
                }
            }
        }

        const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

        // Use actual ID number fields, avoid using doc.id as fallback
        let idNumber = data.idNumber || data.voterId || 'N/A';
        // Ensure we never use document IDs - if idNumber looks like a Firestore ID, set to N/A
        if (idNumber && idNumber !== 'N/A' && idNumber.length === 20 && /^[A-Za-z0-9]{20}$/.test(idNumber)) {
            idNumber = 'N/A'; // Likely a Firestore document ID, don't use it
        }

        const permanentAddress = (data.permanentAddress && data.permanentAddress.trim()) || (data.address && data.address.trim()) || 'N/A';
        const currentLocation = (data.currentLocation && data.currentLocation.trim()) || (data.location && data.location.trim()) || 'N/A';

        // Get image URL, checking images folder if needed
        let imageUrl = getVoterImageUrl(data, idNumber);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center; color: var(--text-light); font-weight: 600;">${rowNumber}</td>
            <td>
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${data.name || 'Voter'}" class="voter-image" loading="lazy" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" data-voter-id="${idNumber || ''}" onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${idNumber || ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });">` :
                    `<div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;">${initials}</div>`
                }
                ${imageUrl ? `<div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;">${initials}</div>` : ''}
            </td>
            <td>
                <div class="table-cell-user">
                    <strong>${data.name || 'N/A'}</strong>
                </div>
            </td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.constituency || 'N/A'}">${data.constituency || 'N/A'}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.island || 'N/A'}">${data.island || 'N/A'}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${permanentAddress}">${permanentAddress}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${currentLocation}">${currentLocation}</td>
            <td>
                <div class="table-actions" style="display: flex; gap: 6px; align-items: center;">
                    <button class="icon-btn" title="View Details" onclick="viewVoterDetails('${id}')" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 1px solid var(--border-color); border-radius: 8px; background: white; color: var(--text-color); transition: all 0.2s ease;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Edit Voter" onclick="editVoter('${id}')" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(111, 193, 218, 0.3);" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 10px rgba(111, 193, 218, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 6px rgba(111, 193, 218, 0.3)'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Delete Voter" onclick="deleteVoter('${id}')" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 10px rgba(220, 38, 38, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 6px rgba(220, 38, 38, 0.3)'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        fragment.appendChild(row);

        // If no image URL found, try to lookup from images folder asynchronously
        if (!imageUrl && idNumber && idNumber.trim()) {
            // Start async lookup - will update image when found
            lookupImageFromFolder(idNumber).then(foundUrl => {
                if (foundUrl) {
                    // Find the avatar div (initials) and replace it with image
                    const avatarDiv = row.querySelector('.user-avatar');
                    if (avatarDiv) {
                        const img = document.createElement('img');
                        img.src = foundUrl;
                        img.alt = data.name || 'Voter';
                        img.className = 'voter-image';
                        img.loading = 'lazy';
                        img.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover;';
                        img.setAttribute('data-voter-id', idNumber);
                        img.onerror = function() {
                            // If image fails to load, show initials again
                            this.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'user-avatar';
                            fallback.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;';
                            fallback.textContent = initials;
                            this.parentNode.replaceChild(fallback, this);
                        };
                        avatarDiv.parentNode.replaceChild(img, avatarDiv);
                    }
                }
            }).catch((error) => {
                console.warn(`Failed to load image for voter ${idNumber}:`, error);
            });
        }

        rowNumber++;
    });

    // Batch DOM update for instant cached rendering
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        tbody.textContent = '';
        tbody.appendChild(fragment);
    });

    // Render pagination
    renderPagination('voters', filteredDocs.length);

    return true;
}

async function loadVotersData(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    const tbody = document.getElementById('voters-table-body');
    if (!tbody) return;

    // Check cache first (unless forced refresh)
    if (!forceRefresh && isVoterCacheValid()) {
        console.log('[loadVotersData] Using cached data - instant load');
        // Render cached data immediately (no loading needed)
        renderCachedVotersData();
        return;
    }

    // Show skeleton loading
    showTableSkeleton(tbody, 8, 6);

    // Update main loading screen progress
    if (window.updateComponentProgress) {
        window.updateComponentProgress('voters', 20);
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs,
            or
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Query voters by email or campaignEmail (voters can use either field)
        let votersQuery;
        let snapshot;

        console.log('[loadVotersData] Starting to fetch voters from Firebase...');
        console.log('[loadVotersData] User email:', window.userEmail);
        const startTime = performance.now();

        try {
            if (window.updateComponentProgress) {
                window.updateComponentProgress('voters', 30);
            }

            // Query voters by both email and campaignEmail fields
            // Firestore doesn't support OR queries, so we need to query both and combine
            const emailDocs = [];
            const campaignEmailDocs = [];
            const allDocIds = new Set();

            // Query by 'email' field
            try {
                votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
                const emailSnapshot = await getDocs(votersQuery);
                emailSnapshot.docs.forEach(doc => {
                    if (!allDocIds.has(doc.id)) {
                        emailDocs.push(doc);
                        allDocIds.add(doc.id);
                    }
                });
                console.log(`[loadVotersData] Query by 'email' returned ${emailSnapshot.docs.length} documents`);
            } catch (emailQueryError) {
                console.warn('[loadVotersData] Query by email failed:', emailQueryError);
            }

            // Query by 'campaignEmail' field
            try {
                votersQuery = query(collection(window.db, 'voters'), where('campaignEmail', '==', window.userEmail));
                const campaignSnapshot = await getDocs(votersQuery);
                campaignSnapshot.docs.forEach(doc => {
                    if (!allDocIds.has(doc.id)) {
                        campaignEmailDocs.push(doc);
                        allDocIds.add(doc.id);
                    }
                });
                console.log(`[loadVotersData] Query by 'campaignEmail' returned ${campaignSnapshot.docs.length} documents`);
            } catch (campaignQueryError) {
                console.warn('[loadVotersData] Query by campaignEmail failed:', campaignQueryError);
            }

            // Combine results (avoiding duplicates)
            const combinedDocs = [...emailDocs, ...campaignEmailDocs];
            snapshot = {
                docs: combinedDocs
            };
            console.log(`[loadVotersData] Combined results: ${combinedDocs.length} unique voters found`);

            // If still no results, try loading all and filtering client-side (fallback for debugging)
            if (combinedDocs.length === 0) {
                console.log('[loadVotersData] No results from queries, trying fallback: loading all voters and filtering client-side');
                try {
                    const allVotersQuery = query(collection(window.db, 'voters'));
                    const allSnapshot = await getDocs(allVotersQuery);
                    console.log(`[loadVotersData] Loaded ${allSnapshot.docs.length} total voters, filtering by email...`);

                    // Filter client-side
                    const filtered = allSnapshot.docs.filter(doc => {
                        const data = doc.data();
                        return data.email === window.userEmail || data.campaignEmail === window.userEmail;
                    });
                    console.log(`[loadVotersData] After client-side filtering: ${filtered.length} voters match`);

                    // Log sample data for debugging
                    if (allSnapshot.docs.length > 0 && filtered.length === 0) {
                        const sampleDoc = allSnapshot.docs[0];
                        const sampleData = sampleDoc.data();
                        console.log('[loadVotersData] Sample voter from database:', {
                            email: sampleData.email,
                            campaignEmail: sampleData.campaignEmail,
                            userEmail: window.userEmail,
                            name: sampleData.name
                        });
                    }

                    snapshot = {
                        docs: filtered
                    };
                } catch (fallbackError) {
                    console.error('[loadVotersData] Fallback query also failed:', fallbackError);
                    throw fallbackError;
                }
            }

            const fetchTime = performance.now() - startTime;
            console.log(`[loadVotersData] Fetched ${snapshot.docs.length} documents in ${fetchTime.toFixed(2)}ms`);

            if (window.updateComponentProgress) {
                window.updateComponentProgress('voters', 50);
            }
        } catch (queryError) {
            console.error('Error querying voters:', queryError);
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">Error loading voters. Please check console for details.</td></tr>';
            // Mark voters as complete even on error
            if (window.updateComponentProgress) {
                window.updateComponentProgress('voters', 100);
            }
            return;
        }

        // Filter to ensure we only show voters matching user email (in case of data inconsistency)
        let filteredDocs = snapshot.docs.filter(doc => {
            const data = doc.data();
            const matches = data.email === window.userEmail || data.campaignEmail === window.userEmail;
            if (!matches && snapshot.docs.length > 0) {
                // Log first non-matching voter for debugging
                if (snapshot.docs.indexOf(doc) === 0) {
                    console.log('[loadVotersData] Sample voter data:', {
                        email: data.email,
                        campaignEmail: data.campaignEmail,
                        userEmail: window.userEmail,
                        name: data.name
                    });
                }
            }
            return matches;
        });

        // Apply global filter
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            const filterState = window.GlobalFilter.getState();
            const beforeFilterCount = filteredDocs.length;

            filteredDocs = filteredDocs.filter(doc => {
                const data = doc.data();
                const matches = window.GlobalFilter.matchesFilter(data);

                // Debug logging for constituency filter (only log first few)
                if (!matches && filterState.type === 'constituency' && Math.random() < 0.05) {
                    console.log('[loadVotersData] Voter filtered out by constituency:', {
                        voterName: data.name,
                        voterConstituency: data.constituency || data.voterConstituency || 'N/A',
                        filterConstituency: filterState.value,
                        allData: data
                    });
                }

                return matches;
            });

            const afterFilterCount = filteredDocs.length;
            if (filterState.type === 'constituency') {
                console.log(`[loadVotersData] Constituency filter applied: ${beforeFilterCount} -> ${afterFilterCount} voters (filter: ${filterState.value})`);
            }
        }

        console.log(`[loadVotersData] Processing ${filteredDocs.length} voters...`);

        // Update statistics
        const totalEl = document.getElementById('stat-voters-total');
        const todayEl = document.getElementById('stat-voters-today');
        const verifiedEl = document.getElementById('stat-voters-verified');
        const pendingEl = document.getElementById('stat-voters-pending');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let total = 0,
            todayCount = 0,
            verified = 0,
            pending = 0;

        filteredDocs.forEach(doc => {
            total++;
            const data = doc.data();
            if (data.verified) verified++;
            else pending++;

            if (data.registeredAt) {
                const regDate = data.registeredAt.toDate ? data.registeredAt.toDate() : new Date(data.registeredAt);
                if (regDate >= today) todayCount++;
            }
        });

        if (totalEl) totalEl.textContent = total;
        if (todayEl) todayEl.textContent = todayCount;
        if (verifiedEl) verifiedEl.textContent = verified;
        if (pendingEl) pendingEl.textContent = pending;

        if (filteredDocs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">No voters registered yet</td></tr>';
            renderPagination('voters', 0);
            // Mark voters as complete even if empty
            if (window.updateComponentProgress) {
                window.updateComponentProgress('voters', 100);
            }
            return;
        }

        // Pagination
        const state = paginationState.voters;
        const startIndex = (state.currentPage - 1) * state.recordsPerPage;
        const endIndex = startIndex + state.recordsPerPage;
        const paginatedVoters = filteredDocs.slice(startIndex, endIndex);

        // Use DocumentFragment for efficient DOM updates
        const fragment = document.createDocumentFragment();
        let rowNumber = startIndex + 1;
        const totalRows = paginatedVoters.length;
        const renderStartTime = performance.now();

        // Update progress - starting to render
        (tbody, 40);

        if (window.updateComponentProgress) {
            window.updateComponentProgress('voters', 60);
        }

        // Calculate update intervals for progress (update every 5% progress for smooth updates)
        const updateInterval = Math.max(1, Math.floor(totalRows / 20));
        let lastUpdatePercent = 40;
        let lastMainProgress = 60;

        for (let i = 0; i < paginatedVoters.length; i++) {
            const doc = paginatedVoters[i];
            const data = doc.data();

            // Update progress percentage during rendering (40-90%) - less frequently for better performance
            // Only update UI every N rows to reduce reflows
            if (totalRows > 50 && (i % Math.max(1, Math.floor(totalRows / 10)) === 0 || i === filteredDocs.length - 1)) {
                const renderProgress = Math.min(90, 40 + Math.round(((i + 1) / totalRows) * 50));
                if (renderProgress !== lastUpdatePercent) {
                    // Use requestAnimationFrame for progress updates to avoid blocking
                    lastUpdatePercent = renderProgress;

                    // Update main loading screen progress (60-95%)
                    const mainProgress = Math.min(95, 60 + Math.round(((i + 1) / totalRows) * 35));
                    if (mainProgress !== lastMainProgress && window.updateComponentProgress) {
                        window.updateComponentProgress('voters', mainProgress);
                        lastMainProgress = mainProgress;
                    }
                }
            }

            // Debug logging for first voter
            if (rowNumber === 1) {
                console.log('[loadVotersData] First voter data:', {
                    id: doc.id,
                    idNumber: data.idNumber,
                    name: data.name,
                    permanentAddress: data.permanentAddress,
                    currentLocation: data.currentLocation,
                    email: data.email,
                    campaignEmail: data.campaignEmail,
                    allFields: Object.keys(data)
                });
            }

            // Format date of birth
            let dobDisplay = 'N/A';
            if (data.dateOfBirth) {
                if (data.dateOfBirth.toDate) {
                    const dob = data.dateOfBirth.toDate();
                    dobDisplay = dob.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                } else if (typeof data.dateOfBirth === 'string') {
                    const dob = new Date(data.dateOfBirth);
                    if (!isNaN(dob.getTime())) {
                        dobDisplay = dob.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    } else {
                        dobDisplay = data.dateOfBirth;
                    }
                }
            }

            const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

            // Use actual ID number fields, avoid using doc.id as fallback
            let idNumber = data.idNumber || data.voterId || 'N/A';

            // Get image URL, checking images folder if needed
            let imageUrl = getVoterImageUrl(data, idNumber !== 'N/A' ? idNumber : null);
            // Ensure we never use document IDs - if idNumber looks like a Firestore ID, set to N/A
            if (idNumber && idNumber.length === 20 && /^[A-Za-z0-9]{20}$/.test(idNumber)) {
                idNumber = 'N/A'; // Likely a Firestore document ID, don't use it
            }

            const age = data.age ? data.age + '' : 'N/A';
            const gender = data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : 'N/A';
            const island = data.island || 'N/A';
            const ballotBox = data.ballot || (data.ballot && data.box ? `${data.ballot}-${data.box}` : '') || 'N/A';
            const permanentAddress = (data.permanentAddress && data.permanentAddress.trim()) || (data.address && data.address.trim()) || 'N/A';
            const currentLocation = (data.currentLocation && data.currentLocation.trim()) || (data.location && data.location.trim()) || 'N/A';
            const number = data.number || data.phone || 'N/A';

            // Create row element
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.dataset.voterId = doc.id;
            row.innerHTML = `
                <td style="text-align: center; color: var(--text-light); font-weight: 600;">${rowNumber}</td>
                <td>
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${data.name || 'Voter'}" class="voter-image" loading="lazy" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" data-voter-id="${idNumber !== 'N/A' ? idNumber : ''}" onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${idNumber !== 'N/A' ? idNumber : ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });"><div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;">${initials}</div>` :
                        `<div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;">${initials}</div>`
                    }
                </td>
                <td>
                    <div class="table-cell-user">
                        <strong>${data.name || 'N/A'}</strong>
                    </div>
                </td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.constituency || 'N/A'}">${data.constituency || 'N/A'}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${data.island || 'N/A'}">${data.island || 'N/A'}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${permanentAddress}">${permanentAddress}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${currentLocation}">${currentLocation}</td>
                <td>
                    <div class="table-actions" style="display: flex; gap: 6px; align-items: center;">
                        <button class="icon-btn" title="View Details" onclick="event.stopPropagation(); if (window.openVoterDetailsSidePanel) window.openVoterDetailsSidePanel('${doc.id}');" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 1px solid var(--border-color); border-radius: 8px; background: white; color: var(--text-color); transition: all 0.2s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="icon-btn" title="Edit Voter" onclick="editVoter('${doc.id}')" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(111, 193, 218, 0.3);" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 10px rgba(111, 193, 218, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 6px rgba(111, 193, 218, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" title="Delete Voter" onclick="deleteVoter('${doc.id}')" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 10px rgba(220, 38, 38, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 6px rgba(220, 38, 38, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            // Add click handler to row
            row.addEventListener('click', function(e) {
                // Don't trigger if clicking on the actions column
                if (e.target.closest('.table-actions')) {
                    return;
                }
                if (window.openVoterDetailsSidePanel) {
                    window.openVoterDetailsSidePanel(doc.id);
                }
            });

            fragment.appendChild(row);

            // If no image URL found, try to lookup from images folder asynchronously
            if (!imageUrl && idNumber && idNumber !== 'N/A' && idNumber.trim()) {
                lookupImageFromFolder(idNumber).then(foundUrl => {
                    if (foundUrl) {
                        const img = row.querySelector(`img[data-voter-id="${idNumber}"]`);
                        if (img) {
                            img.src = foundUrl;
                            img.style.display = '';
                            const fallback = img.nextElementSibling;
                            if (fallback && fallback.classList.contains('user-avatar')) {
                                fallback.style.display = 'none';
                            }
                        } else {
                            const avatarDiv = row.querySelector('.user-avatar');
                            if (avatarDiv) {
                                const img = document.createElement('img');
                                img.src = foundUrl;
                                img.alt = data.name || 'Voter';
                                img.className = 'voter-image';
                                img.loading = 'lazy';
                                img.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover;';
                                img.setAttribute('data-voter-id', idNumber);
                                avatarDiv.parentNode.replaceChild(img, avatarDiv);
                            }
                        }
                    }
                }).catch(() => {});
            }

            rowNumber++;
        }


        // Append all rows at once using DocumentFragment (much faster than innerHTML +=)
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            tbody.textContent = '';
            tbody.appendChild(fragment);

            const renderTime = performance.now() - renderStartTime;
            console.log(`[loadVotersData] Rendered ${totalRows} rows in ${renderTime.toFixed(2)}ms`);

            // Trigger a reflow to ensure smooth rendering
            tbody.offsetHeight;

            // Mark voters as 100% complete after rendering
            if (window.updateComponentProgress) {
                window.updateComponentProgress('voters', 100);
            }

            // Render pagination
            renderPagination('voters', filteredDocs.length);
        });

        // Cache the data for future use (store doc ID and data for reconstruction)
        voterDataCache.data = {
            filteredDocs: filteredDocs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })),
            stats: {
                total,
                todayCount,
                verified,
                pending
            }
        };
        voterDataCache.timestamp = Date.now();
        voterDataCache.userEmail = window.userEmail;
        // Store current filter state to detect changes
        if (window.GlobalFilter) {
            voterDataCache.filterState = {
                ...window.GlobalFilter.getState()
            };
        }
        console.log('[loadVotersData] Data cached for future use');

        // Loading indicator is already replaced by actual table content
    } catch (error) {
        console.error('Error loading voters:', error);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">Error loading voters</td></tr>';
    }
}

// Function to clear voter cache (useful when new voter is added/edited/deleted)
function clearVoterCache() {
    voterDataCache.data = null;
    voterDataCache.timestamp = null;
    voterDataCache.filterState = null;
    console.log('[clearVoterCache] Voter cache cleared');
}

// Make clearVoterCache globally available
window.clearVoterCache = clearVoterCache;
window.clearCache = clearCache;
window.clearAllCaches = clearAllCaches;

// Expose render cached functions globally for instant filter updates
window.renderCachedVotersData = renderCachedVotersData;
window.renderCachedCallsData = renderCachedCallsData;
window.renderCachedPledgesData = renderCachedPledgesData;
window.renderCachedCandidatesData = renderCachedCandidatesData;
window.renderCachedEventsData = renderCachedEventsData;
window.renderCachedAgentsData = renderCachedAgentsData;

// Load events data
async function loadEventsData(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    const grid = document.getElementById('events-grid');
    if (!grid) return;

    // Check cache first
    if (!forceRefresh && isCacheValid('events')) {
        console.log('[loadEventsData] Using cached data - instant load');
        renderCachedEventsData();
        return;
    }

    // Show skeleton loading for events grid
    grid.innerHTML = `
        ${Array(6).fill(0).map(() => `
            <div class="event-card" style="opacity: 0.7;">
                <div class="event-date" style="background: var(--border-light);"></div>
                <div class="event-content">
                    <div style="height: 20px; background: var(--border-light); border-radius: 4px; margin-bottom: 10px; width: 70%; animation: skeleton-loading 1.5s ease-in-out infinite;"></div>
                    <div style="height: 16px; background: var(--border-light); border-radius: 4px; margin-bottom: 8px; width: 50%; animation: skeleton-loading 1.5s ease-in-out infinite;"></div>
                    <div style="height: 14px; background: var(--border-light); border-radius: 4px; width: 40%; animation: skeleton-loading 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
        `).join('')}
    `;

    try {
        const {
            collection,
            query,
            where,
            orderBy,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        let snapshot;
        try {
            const eventsQuery = query(collection(window.db, 'events'), where('campaignEmail', '==', window.userEmail), orderBy('eventDate', 'asc'));
            snapshot = await getDocs(eventsQuery);
        } catch (queryError) {
            // If index missing, query without orderBy and sort in JavaScript
            if (queryError.code === 'failed-precondition' && queryError.message.includes('index')) {
                console.warn('Events index missing, sorting in JavaScript');
                const fallbackQuery = query(collection(window.db, 'events'), where('campaignEmail', '==', window.userEmail));
                snapshot = await getDocs(fallbackQuery);
            } else {
                throw queryError;
            }
        }

        // Convert to array and sort if needed (when index was missing)
        const eventsArray = [];
        snapshot.forEach(doc => {
            eventsArray.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by eventDate if not already sorted
        eventsArray.sort((a, b) => {
            const aDate = a.eventDate ? (a.eventDate.toDate ? a.eventDate.toDate() : new Date(a.eventDate)) : new Date(0);
            const bDate = b.eventDate ? (b.eventDate.toDate ? b.eventDate.toDate() : new Date(b.eventDate)) : new Date(0);
            return aDate - bDate; // Ascending order
        });

        // Apply global filter
        // For events: Constituency is master - show all when constituency or show all is selected
        // Only filter by island when island filter is active
        let filteredEventsArray = eventsArray;
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            const filterState = window.GlobalFilter.getState();

            // Only apply filter if it's an island filter
            // For constituency or show all, show all events regardless of island
            if (filterState.type === 'island') {
                const beforeFilterCount = filteredEventsArray.length;

                filteredEventsArray = filteredEventsArray.filter(event => {
                    const matches = window.GlobalFilter.matchesFilter(event);

                    // Debug logging for island filter (only log first few)
                    if (!matches && Math.random() < 0.05) {
                        console.log('[loadEventsData] Event filtered out by island:', {
                            eventName: event.eventName,
                            eventIsland: event.island || 'N/A',
                            filterIsland: filterState.value,
                            allData: event
                        });
                    }

                    return matches;
                });

                const afterFilterCount = filteredEventsArray.length;
                console.log(`[loadEventsData] Island filter applied: ${beforeFilterCount} -> ${afterFilterCount} events (filter: ${filterState.value})`);
            } else if (filterState.type === 'constituency') {
                // Constituency selected - show all events (no filtering)
                console.log(`[loadEventsData] Constituency filter active - showing all ${filteredEventsArray.length} events (constituency is master)`);
            }
        } else {
            // No filter active (Show All) - show all events
            console.log(`[loadEventsData] No filter active - showing all ${filteredEventsArray.length} events`);
        }

        // Store in cache
        dataCache.events.data = filteredEventsArray;
        dataCache.events.timestamp = Date.now();
        dataCache.events.userEmail = window.userEmail;
        // Store current filter state to detect changes
        if (window.GlobalFilter) {
            dataCache.events.filterState = {
                ...window.GlobalFilter.getState()
            };
        }

        if (filteredEventsArray.length === 0) {
            grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light); grid-column: 1 / -1;"><p>No events scheduled yet</p></div>';
            return;
        }

        // Use DocumentFragment for efficient DOM updates
        const fragment = document.createDocumentFragment();
        filteredEventsArray.forEach(event => {
            // Use event data directly from array, not doc.data()
            const data = event;
            const eventDate = data.eventDate ? (data.eventDate.toDate ? data.eventDate.toDate() : new Date(data.eventDate)) : new Date();
            const day = eventDate.getDate();
            const month = eventDate.toLocaleString('default', {
                month: 'short'
            });

            // Ensure we use actual data fields
            const eventName = data.eventName || 'Untitled Event';
            const location = data.location || 'Location TBD';
            const startTime = data.startTime || 'TBD';
            const endTime = data.endTime || 'TBD';
            const expectedAttendees = data.expectedAttendees || 0;

            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.style.cursor = 'pointer';
            eventCard.dataset.eventId = data.id;
            eventCard.innerHTML = `
                <div class="event-date">
                    <span class="event-day">${day}</span>
                    <span class="event-month">${month}</span>
                </div>
                <div class="event-content">
                    <h3>${eventName}</h3>
                    <p class="event-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${location}
                    </p>
                    <p class="event-time">${startTime} - ${endTime}</p>
                    <div class="event-actions">
                        <span class="event-attendees">Expected: ${expectedAttendees}+</span>
                        <div style="display: flex; gap: 6px;">
                            <button class="icon-btn-sm" onclick="event.stopPropagation(); if (window.openEventDetailsSidePanel) window.openEventDetailsSidePanel('${data.id}');" title="View Details">View</button>
                            <button class="icon-btn-sm" onclick="closeModal(); setTimeout(() => { if (window.openModal) window.openModal('event', '${data.id}'); }, 100);" title="Edit Event" style="color: var(--primary-color);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="icon-btn-sm" onclick="deleteEvent('${data.id}')" title="Delete Event" style="color: var(--danger-color);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add click handler to event card
            eventCard.addEventListener('click', function(e) {
                if (e.target.closest('.event-actions') || e.target.closest('button')) {
                    return;
                }
                if (window.openEventDetailsSidePanel) {
                    window.openEventDetailsSidePanel(data.id);
                }
            });

            fragment.appendChild(eventCard);
        });

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            grid.textContent = '';
            grid.appendChild(fragment);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light); grid-column: 1 / -1;"><p>Error loading events</p></div>';
    }
}

// View event details
async function viewEventDetails(eventId, navigateDirection = null) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Show loading indicator - use existing modal system
    let modalOverlay = document.getElementById('modal-overlay');
    let modalBody = null;
    let modalTitle = null;

    if (!modalOverlay) {
        // Try to use ensureModalExists if available
        if (typeof ensureModalExists === 'function') {
            modalOverlay = ensureModalExists();
        } else {
            // Create modal overlay if ensureModalExists is not available
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'modal-overlay';
            modalOverlay.className = 'modal-overlay';
            modalOverlay.style.display = 'none';
            modalOverlay.innerHTML = `
                <div class="modal-container" id="modal-container">
                    <div class="modal-header">
                        <h2 id="modal-title">Modal Title</h2>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button class="modal-maximize" id="modal-maximize-btn" title="Maximize" onclick="if (typeof toggleModalMaximize === 'function') { const container = this.closest('.modal-container'); toggleModalMaximize(container, this); }">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                </svg>
                            </button>
                            <button class="modal-close" id="modal-close-btn" onclick="if (typeof closeModal === 'function') closeModal(); else document.getElementById('modal-overlay').style.display = 'none';">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="modal-body" id="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            // Close on overlay click
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    if (typeof closeModal === 'function') {
                        closeModal();
                    } else {
                        modalOverlay.style.display = 'none';
                    }
                }
            });
        }
    }

    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        modalBody = document.getElementById('modal-body');
        modalTitle = document.getElementById('modal-title');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
            `;
        }
        if (modalTitle) {
            modalTitle.textContent = 'Loading Event...';
        }
    }

    try {
        if (!window.db) {
            throw new Error('Database not initialized');
        }
        if (!window.userEmail) {
            throw new Error('User email not available');
        }
        if (!eventId) {
            throw new Error('Event ID is required');
        }

        const {
            doc,
            getDoc,
            collection,
            query,
            where,
            orderBy,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all events for navigation
        let allEvents = [];
        let currentIndex = -1;
        try {
            const eventsQuery = query(
                collection(window.db, 'events'),
                where('campaignEmail', '==', window.userEmail),
                orderBy('eventDate', 'desc')
            );
            const allEventsSnapshot = await getDocs(eventsQuery);
            allEvents = allEventsSnapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            currentIndex = allEvents.findIndex(e => e.id === eventId);
        } catch (queryError) {
            // If index missing, query without orderBy
            if (queryError.code === 'failed-precondition') {
                const fallbackQuery = query(
                    collection(window.db, 'events'),
                    where('campaignEmail', '==', window.userEmail)
                );
                const fallbackSnapshot = await getDocs(fallbackQuery);
                allEvents = fallbackSnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                })).sort((a, b) => {
                    const dateA = a.eventDate.toDate ? a.eventDate.toDate() : new Date(a.eventDate || 0);
                    const dateB = b.eventDate.toDate ? b.eventDate.toDate() : new Date(b.eventDate || 0);
                    return dateB - dateA;
                });
                currentIndex = allEvents.findIndex(e => e.id === eventId);
            }
        }

        // Handle navigation
        if (navigateDirection === 'prev' && currentIndex > 0) {
            eventId = allEvents[currentIndex - 1].id;
            currentIndex = currentIndex - 1;
        } else if (navigateDirection === 'next' && currentIndex < allEvents.length - 1) {
            eventId = allEvents[currentIndex + 1].id;
            currentIndex = currentIndex + 1;
        }

        console.log('[viewEventDetails] Fetching event:', eventId);

        // Fetch event document
        const eventRef = doc(window.db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        console.log('[viewEventDetails] Event snapshot exists:', eventSnap.exists());

        if (!eventSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Event not found.', 'Error');
            }
            if (modalOverlay) modalOverlay.style.display = 'none';
            return;
        }

        const eventData = eventSnap.data();

        // Verify the event belongs to the current user
        if (eventData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to view this event.', 'Access Denied');
            }
            if (modalOverlay) modalOverlay.style.display = 'none';
            return;
        }

        // Format event date
        const eventDate = eventData.eventDate ? (eventData.eventDate.toDate ? eventData.eventDate.toDate() : new Date(eventData.eventDate)) : new Date();
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        // Format created date
        let createdDateStr = 'N/A';
        if (eventData.createdAt) {
            const createdDate = eventData.createdAt.toDate ? eventData.createdAt.toDate() : new Date(eventData.createdAt);
            createdDateStr = createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Create modal HTML
        const modalHTML = `
            <div class="event-details-modal" style="max-width: 600px; margin: 0 auto;">
                <!-- Navigation and Actions at top -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <!-- Navigation controls on left -->
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            id="event-nav-prev" 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewEventDetails('${eventId}', 'prev')"
                            style="display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Previous
                        </button>
                        <span style="color: var(--text-light); font-size: 12px; padding: 8px 8px; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0;">
                            ${currentIndex + 1} of ${allEvents.length}
                        </span>
                        <button 
                            id="event-nav-next" 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === allEvents.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewEventDetails('${eventId}', 'next')"
                            style="display: flex; align-items: center; gap: 6px;">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                    <!-- CRUD actions on right -->
                    <div style="display: flex; gap: 8px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            type="button"
                            title="Edit Event"
                            onclick="closeModal(); setTimeout(() => { if (window.openModal) window.openModal('event', '${eventId}'); }, 100);"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(111, 193, 218, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(111, 193, 218, 0.3)'"
                            style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(111, 193, 218, 0.3);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button 
                            type="button"
                            title="Delete Event"
                            onclick="deleteEvent('${eventId}')"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(220, 38, 38, 0.3)'"
                            style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: #dc2626; color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    <div style="width: 80px; height: 80px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; border: 3px solid var(--primary-color);">
                        <span style="font-size: 32px; line-height: 1;">${eventDate.getDate()}</span>
                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${eventDate.toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div>
                        <h2 style="margin: 0; color: var(--text-color); font-size: 24px; font-weight: 700;">${eventData.eventName || 'Untitled Event'}</h2>
                        <p style="margin: 5px 0 0 0; color: var(--text-light); font-size: 14px;">${formattedDate}</p>
                    </div>
                </div>

                <!-- Event Information Section -->
                <div style="background: var(--light-color); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: var(--text-color); font-size: 18px; font-weight: 600;">Event Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Location</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                ${eventData.location || 'N/A'}
                            </p>
                        </div>
                        <div class="detail-item" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Start Time</label>
                                <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    ${eventData.startTime || 'TBD'}
                                </p>
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">End Time</label>
                                <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    ${eventData.endTime || 'TBD'}
                                </p>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Expected Attendees</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                ${eventData.expectedAttendees || 0}+ attendees
                            </p>
                        </div>
                        ${eventData.description ? `
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Description</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${eventData.description}</p>
                        </div>
                        ` : ''}
                        ${eventData.createdAt ? `
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Created At</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${createdDateStr}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>

            </div>
        `;

        // Update modal
        if (modalBody) {
            modalBody.innerHTML = modalHTML;
        }
        if (modalTitle) {
            modalTitle.textContent = 'Event Details';
        }
    } catch (error) {
        console.error('Error loading event details:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            eventId: eventId,
            db: !!window.db,
            userEmail: window.userEmail
        });

        // Show error in modal - get references again in case they weren't set
        if (!modalBody) modalBody = document.getElementById('modal-body');
        if (!modalTitle) modalTitle = document.getElementById('modal-title');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="color: var(--danger-color); margin-bottom: 16px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h3 style="color: var(--text-color); margin-bottom: 8px;">Failed to load event details</h3>
                    <p style="color: var(--text-light); margin-bottom: 20px;">${error.message || 'An unexpected error occurred'}</p>
                    <button class="btn-primary btn-compact" onclick="closeModal()">Close</button>
                </div>
            `;
        }
        if (modalTitle) {
            modalTitle.textContent = 'Error';
        }

        if (window.showErrorDialog) {
            window.showErrorDialog(`Failed to load event details: ${error.message}`, 'Error');
        }
    }
}

// Make function globally available
window.viewEventDetails = viewEventDetails;

// Render cached events data
function renderCachedEventsData() {
    if (!dataCache.events.data) return false;

    const grid = document.getElementById('events-grid');
    if (!grid) return false;

    let eventsArray = dataCache.events.data;
    // Apply global filter
    if (window.FilterUtils) {
        eventsArray = window.FilterUtils.applyFilterToArray(eventsArray);
    }
    const fragment = document.createDocumentFragment();

    eventsArray.forEach(event => {
        const data = event;
        const eventDate = data.eventDate ? (data.eventDate.toDate ? data.eventDate.toDate() : new Date(data.eventDate)) : new Date();
        const day = eventDate.getDate();
        const month = eventDate.toLocaleString('default', {
            month: 'short'
        });
        const eventName = data.eventName || 'Untitled Event';
        const location = data.location || 'Location TBD';
        const startTime = data.startTime || 'TBD';
        const endTime = data.endTime || 'TBD';
        const expectedAttendees = data.expectedAttendees || 0;

        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-date">
                <span class="event-day">${day}</span>
                <span class="event-month">${month}</span>
            </div>
            <div class="event-content">
                <h3>${eventName}</h3>
                <p class="event-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ${location}
                </p>
                <p class="event-time">${startTime} - ${endTime}</p>
                <div class="event-actions">
                    <span class="event-attendees">Expected: ${expectedAttendees}+</span>
                    <button class="icon-btn-sm" onclick="viewEventDetails('${data.id}')">View</button>
                </div>
            </div>
        `;
        fragment.appendChild(eventCard);
    });

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        grid.textContent = '';
        grid.appendChild(fragment);
    });
    return true;
}

// Helper function to show Firestore index information
function showCallsIndexInfo() {
    if (window._callsIndexInfoLogged) return;
    window._callsIndexInfoLogged = true;
    console.log('%c📋 REQUIRED FIRESTORE INDEXES FOR CALLS', 'font-size: 16px; font-weight: bold; color: #6fc1da; padding: 10px; background: #f0f9fb; border-radius: 4px;');
    console.log('');
    console.log('%cIndex 1: Calls by campaignEmail', 'font-size: 14px; font-weight: bold; color: #059669;');
    console.table({
        'Collection': 'calls',
        'Field 1': 'campaignEmail (Ascending)',
        'Field 2': 'callDate (Descending)'
    });
    console.log('%cIndex 2: Calls by email', 'font-size: 14px; font-weight: bold; color: #059669;');
    console.table({
        'Collection': 'calls',
        'Field 1': 'email (Ascending)',
        'Field 2': 'callDate (Descending)'
    });
    console.log('');
    console.log('%c📝 How to create:', 'font-size: 14px; font-weight: bold; color: #0284c7;');
    console.log('1. Go to: https://console.firebase.google.com/');
    console.log('2. Select your project → Firestore Database → Indexes tab');
    console.log('3. Click "Create Index"');
    console.log('4. Configure each index as shown in the tables above');
    console.log('5. Wait 2-5 minutes for indexes to build');
    console.log('');
}

// Load calls data
async function loadCallsData(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    const tbody = document.getElementById('calls-table-body');
    if (!tbody) return;

    // Check cache first, but only use it if it has actual data
    if (!forceRefresh && isCacheValid('calls') && dataCache.calls.data && dataCache.calls.data.calls && dataCache.calls.data.calls.length > 0) {
        console.log('[loadCallsData] Using cached data - instant load');
        renderCachedCallsData();
        return;
    }

    // If cache is empty or invalid, clear it and force fresh load
    if (dataCache.calls.data && (!dataCache.calls.data.calls || dataCache.calls.data.calls.length === 0)) {
        console.log('[loadCallsData] Cache is empty, forcing fresh load');
        clearCache('calls');
    }

    // Show skeleton loading
    showTableSkeleton(tbody, 5, 6);

    try {
        const {
            collection,
            query,
            where,
            orderBy,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Query calls by both campaignEmail and email fields to catch all records
        let snapshot1, snapshot2;
        const allCalls = new Map(); // Use Map to avoid duplicates

        try {
            // Try querying by campaignEmail first
            try {
                const callsQuery1 = query(collection(window.db, 'calls'), where('campaignEmail', '==', window.userEmail), orderBy('callDate', 'desc'));
                snapshot1 = await getDocs(callsQuery1);
                snapshot1.forEach(doc => {
                    allCalls.set(doc.id, {
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (queryError1) {
                // If index missing, query without orderBy
                if (queryError1.code === 'failed-precondition' && queryError1.message.includes('index')) {
                    console.warn('Calls index missing for campaignEmail, querying without orderBy');
                    if (typeof showCallsIndexInfo === 'function') showCallsIndexInfo();
                    const fallbackQuery1 = query(collection(window.db, 'calls'), where('campaignEmail', '==', window.userEmail));
                    snapshot1 = await getDocs(fallbackQuery1);
                    snapshot1.forEach(doc => {
                        allCalls.set(doc.id, {
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                }
            }

            // Also query by email field to catch records that might only have email
            try {
                const callsQuery2 = query(collection(window.db, 'calls'), where('email', '==', window.userEmail), orderBy('callDate', 'desc'));
                snapshot2 = await getDocs(callsQuery2);
                snapshot2.forEach(doc => {
                    // Only add if not already in map (avoid duplicates)
                    if (!allCalls.has(doc.id)) {
                        allCalls.set(doc.id, {
                            id: doc.id,
                            ...doc.data()
                        });
                    }
                });
            } catch (queryError2) {
                // If index missing, query without orderBy
                if (queryError2.code === 'failed-precondition' && queryError2.message.includes('index')) {
                    console.warn('Calls index missing for email, querying without orderBy');
                    if (typeof showCallsIndexInfo === 'function') showCallsIndexInfo();
                    const fallbackQuery2 = query(collection(window.db, 'calls'), where('email', '==', window.userEmail));
                    snapshot2 = await getDocs(fallbackQuery2);
                    snapshot2.forEach(doc => {
                        if (!allCalls.has(doc.id)) {
                            allCalls.set(doc.id, {
                                id: doc.id,
                                ...doc.data()
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error querying calls:', error);
            throw error;
        }

        // Update statistics
        const totalEl = document.getElementById('stat-calls-total');
        const answeredEl = document.getElementById('stat-calls-answered');
        const pendingEl = document.getElementById('stat-calls-pending');
        const successEl = document.getElementById('stat-calls-success');

        let total = 0,
            answered = 0,
            pending = 0;

        // Convert Map to array for processing
        let callsArray = Array.from(allCalls.values());

        // Apply global filter
        if (window.FilterUtils) {
            callsArray = window.FilterUtils.applyFilterToArray(callsArray);
        }

        // Process statistics
        callsArray.forEach(callData => {
            total++;
            if (callData.status === 'answered') answered++;
            else pending++;
        });

        // Sort by callDate descending if not already sorted
        callsArray.sort((a, b) => {
            const aDate = a.callDate ? (a.callDate.toDate ? a.callDate.toDate() : new Date(a.callDate)) : new Date(0);
            const bDate = b.callDate ? (b.callDate.toDate ? b.callDate.toDate() : new Date(b.callDate)) : new Date(0);
            return bDate - aDate; // Descending order
        });

        const successRate = total > 0 ? Math.round((answered / total) * 100) : 0;

        // Store in cache
        dataCache.calls.data = {
            calls: callsArray,
            stats: {
                total,
                answered,
                pending,
                successRate
            }
        };
        dataCache.calls.timestamp = Date.now();
        dataCache.calls.userEmail = window.userEmail;

        if (totalEl) totalEl.textContent = total;
        if (answeredEl) answeredEl.textContent = answered;
        if (pendingEl) pendingEl.textContent = pending;
        if (successEl) successEl.textContent = `${successRate}%`;

        if (callsArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">No calls recorded yet</td></tr>';
            renderPagination('calls', 0);
            return;
        }

        // Pagination
        const state = paginationState.calls;
        const startIndex = (state.currentPage - 1) * state.recordsPerPage;
        const endIndex = startIndex + state.recordsPerPage;
        const paginatedCalls = callsArray.slice(startIndex, endIndex);

        // Use DocumentFragment for efficient DOM updates
        const fragment = document.createDocumentFragment();
        paginatedCalls.forEach(call => {
            const data = call;
            const callDate = data.callDate ? (data.callDate.toDate ? data.callDate.toDate() : new Date(data.callDate)) : new Date();
            const dateStr = callDate.toLocaleString('default', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const voterName = data.voterName || 'N/A';
            const phone = data.phone || data.number || 'N/A';
            const caller = data.caller || data.agentName || 'N/A';
            const status = data.status || 'pending';
            const statusClass = status === 'answered' ? 'status-success' : 'status-pending';
            const statusText = status === 'answered' ? 'Answered' : (status === 'no-answer' ? 'No Answer' : (status === 'busy' ? 'Busy' : 'Pending'));

            const constituency = data.constituency || data.voterConstituency || 'N/A';
            const island = data.island || data.voterIsland || 'N/A';

            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.dataset.callId = call.id;
            row.innerHTML = `
                <td>${voterName}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${constituency}">${constituency}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${island}">${island}</td>
                <td>${phone}</td>
                <td>${caller}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="icon-btn" title="Edit Call" onclick="event.stopPropagation(); closeModal(); setTimeout(() => { if (window.openModal) window.openModal('call', '${call.id}'); }, 100);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" title="Delete Call" onclick="event.stopPropagation(); if (window.deleteCall) window.deleteCall('${call.id}');" style="color: var(--danger-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            // Add click handler to row
            row.addEventListener('click', function(e) {
                // Don't trigger if clicking on the actions column
                if (e.target.closest('.table-actions')) {
                    return;
                }
                if (window.openCallDetailsSidePanel) {
                    window.openCallDetailsSidePanel(call.id);
                }
            });

            fragment.appendChild(row);
        });

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            tbody.textContent = '';
            tbody.appendChild(fragment);

            // Setup close button, maximize button, and overlay handlers
            setTimeout(() => {
                const closeBtn = document.getElementById('close-call-side-panel');
                const maximizeBtn = document.getElementById('maximize-call-side-panel');
                const overlay = document.getElementById('call-details-side-panel-overlay');
                if (closeBtn && !closeBtn.dataset.listenerAttached) {
                    closeBtn.dataset.listenerAttached = 'true';
                    closeBtn.addEventListener('click', function() {
                        if (window.closeCallDetailsSidePanel) {
                            window.closeCallDetailsSidePanel();
                        }
                    });
                }
                if (maximizeBtn && !maximizeBtn.dataset.listenerAttached) {
                    maximizeBtn.dataset.listenerAttached = 'true';
                    maximizeBtn.addEventListener('click', function() {
                        if (window.toggleSidePanelMaximize) {
                            window.toggleSidePanelMaximize('call-details-side-panel', 'maximize-call-side-panel');
                        }
                    });
                }
                if (overlay && !overlay.dataset.listenerAttached) {
                    overlay.dataset.listenerAttached = 'true';
                    overlay.addEventListener('click', function() {
                        if (window.closeCallDetailsSidePanel) {
                            window.closeCallDetailsSidePanel();
                        }
                    });
                }
            }, 100);

            // Render pagination
            renderPagination('calls', callsArray.length);
        });
    } catch (error) {
        console.error('Error loading calls:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">Error loading calls</td></tr>';
        renderPagination('calls', 0);
    }
}

// Setup real-time listener for pledge statistics
async function setupPledgeStatisticsListener() {
    if (!window.db || !window.userEmail || window.pledgesStatsListener) return;

    try {
        const {
            collection,
            query,
            where,
            onSnapshot
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const pledgesQuery = query(collection(window.db, 'pledges'), where('email', '==', window.userEmail));

        window.pledgesStatsListener = onSnapshot(pledgesQuery,
            (snapshot) => {
                // Apply global filter to snapshot before updating statistics
                const filteredSnapshot = {
                    forEach: (callback) => {
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
                                if (window.GlobalFilter.matchesFilter(data)) {
                                    callback(doc);
                                }
                            } else {
                                callback(doc);
                            }
                        });
                    }
                };
                updatePledgeStatistics(filteredSnapshot);
            },
            (error) => {
                console.warn('Error listening to pledge statistics:', error);
            }
        );
    } catch (error) {
        console.error('Error setting up pledge statistics listener:', error);
    }
}

// Helper function to update pledge statistics
function updatePledgeStatistics(snapshot) {
    const yesEl = document.getElementById('stat-pledges-yes');
    const noEl = document.getElementById('stat-pledges-no');
    const undecidedEl = document.getElementById('stat-pledges-undecided');
    const totalEl = document.getElementById('stat-pledges-total');

    let yes = 0,
        no = 0,
        undecided = 0,
        total = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        // Apply global filter (if snapshot is already filtered, this will be a no-op)
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            if (!window.GlobalFilter.matchesFilter(data)) {
                return; // Skip this pledge if it doesn't match filter
            }
        }
        total++;
        if (data.pledge === 'yes') yes++;
        else if (data.pledge === 'no' || data.pledge === 'negative') no++;
        else undecided++;
    });

    if (yesEl) {
        yesEl.textContent = yes;
        yesEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            yesEl.style.transform = 'scale(1)';
        }, 200);
    }
    if (noEl) {
        noEl.textContent = no;
        noEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            noEl.style.transform = 'scale(1)';
        }, 200);
    }
    if (undecidedEl) {
        undecidedEl.textContent = undecided;
        undecidedEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            undecidedEl.style.transform = 'scale(1)';
        }, 200);
    }
    if (totalEl) {
        totalEl.textContent = total;
        totalEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            totalEl.style.transform = 'scale(1)';
        }, 200);
    }
}

// Load pledges data
async function loadPledgesData(forceRefresh = false) {
    console.log('[loadPledgesData] Starting to load pledges data', {
        hasDb: !!window.db,
        userEmail: window.userEmail,
        forceRefresh
    });

    if (!window.db) {
        console.error('[loadPledgesData] Database not initialized');
        const tbody = document.getElementById('pledges-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">Database not initialized. Please refresh the page.</td></tr>';
        }
        return;
    }

    if (!window.userEmail) {
        console.error('[loadPledgesData] userEmail not set');
        const tbody = document.getElementById('pledges-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">User email not available. Please log in again.</td></tr>';
        }
        return;
    }

    const tbody = document.getElementById('pledges-table-body');
    if (!tbody) {
        console.error('[loadPledgesData] Pledges table body not found');
        return;
    }

    // Setup real-time listener for pledge statistics (only once)
    if (!window.pledgesStatsListener && !forceRefresh) {
        setupPledgeStatisticsListener();
    }

    // Check cache first
    if (!forceRefresh && isCacheValid('pledges')) {
        console.log('[loadPledgesData] Using cached data - instant load');
        renderCachedPledgesData();
        return;
    }

    // Show skeleton loading
    showTableSkeleton(tbody, 5, 9);

    try {
        const {
            collection,
            query,
            where,
            getDocs,
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        console.log('[loadPledgesData] Querying pledges for email:', window.userEmail);

        // First, let's check if there are any pledges at all (for debugging)
        const allPledgesQuery = query(collection(window.db, 'pledges'));
        try {
            const allPledgesSnapshot = await getDocs(allPledgesQuery);
            console.log('[loadPledgesData] Total pledges in database:', allPledgesSnapshot.size);
            if (allPledgesSnapshot.size > 0) {
                // Log first few pledges to see what email field they have
                const samplePledges = allPledgesSnapshot.docs.slice(0, 3);
                samplePledges.forEach((doc, index) => {
                    const data = doc.data();
                    console.log(`[loadPledgesData] Sample pledge ${index + 1}:`, {
                        id: doc.id,
                        email: data.email,
                        campaignEmail: data.campaignEmail,
                        voterName: data.voterName,
                        agentName: data.agentName
                    });
                });
            }
        } catch (debugError) {
            console.warn('[loadPledgesData] Could not fetch all pledges for debugging:', debugError);
        }

        const pledgesQuery = query(collection(window.db, 'pledges'), where('email', '==', window.userEmail));
        let snapshot;

        try {
            snapshot = await getDocs(pledgesQuery);
            console.log('[loadPledgesData] Query successful, found', snapshot.size, 'pledges for email:', window.userEmail);

            // If no results, try querying with campaignEmail field as fallback
            if (snapshot.empty) {
                console.log('[loadPledgesData] No pledges found with email field, trying campaignEmail field...');
                const fallbackQuery = query(collection(window.db, 'pledges'), where('campaignEmail', '==', window.userEmail));
                try {
                    const fallbackSnapshot = await getDocs(fallbackQuery);
                    console.log('[loadPledgesData] Fallback query found', fallbackSnapshot.size, 'pledges with campaignEmail field');
                    if (!fallbackSnapshot.empty) {
                        snapshot = fallbackSnapshot;
                        console.log('[loadPledgesData] Using fallback query results');
                    }
                } catch (fallbackError) {
                    console.warn('[loadPledgesData] Fallback query failed:', fallbackError);
                }
            }
        } catch (queryError) {
            console.error('[loadPledgesData] Error querying pledges:', queryError);
            // If index missing, try alternative query or show helpful message
            if (queryError.code === 'failed-precondition' && queryError.message.includes('index')) {
                throw new Error('Firestore index required. Please create the required index as shown in the browser console.');
            }
            throw queryError;
        }

        // Update statistics (initial load - real-time updates handled by listener)
        updatePledgeStatistics(snapshot);

        if (snapshot.empty) {
            console.log('[loadPledgesData] No pledges found for email:', window.userEmail);
            setTimeout(() => {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">No pledges recorded yet</td></tr>';
                renderPagination('pledges', 0);
            }, 300);
            return;
        }

        console.log('[loadPledgesData] Processing', snapshot.size, 'pledges');

        // Pagination state
        const state = paginationState.pledges;

        // Batch fetch all voter data at once (much faster than individual fetches)
        const voterIds = new Set();
        snapshot.docs.forEach(pledgeDoc => {
            const pledgeData = pledgeDoc.data();
            if (pledgeData.voterDocumentId) {
                voterIds.add(pledgeData.voterDocumentId);
            }
        });

        // Fetch all voters in parallel using Promise.all
        const voterDataMap = new Map();
        if (voterIds.size > 0) {
            const voterFetchPromises = Array.from(voterIds).map(async (voterId) => {
                try {
                    const voterDocRef = doc(window.db, 'voters', voterId);
                    const voterDoc = await getDoc(voterDocRef);
                    if (voterDoc.exists()) {
                        return {
                            id: voterId,
                            data: voterDoc.data()
                        };
                    }
                } catch (error) {
                    console.warn(`Could not fetch voter data for ${voterId}:`, error);
                }
                return null;
            });

            const voterResults = await Promise.all(voterFetchPromises);
            voterResults.forEach(result => {
                if (result) {
                    voterDataMap.set(result.id, result.data);
                }
            });
        }

        // Now render pledges with pre-fetched voter data
        const fragment = document.createDocumentFragment();
        let rowNumber = startIndex + 1;
        const allPledges = []; // Initialize array for cache

        // Initialize statistics counters (calculate from all docs, not just paginated)
        let yes = 0;
        let no = 0;
        let undecided = 0;
        let total = 0;

        // Apply global filter to pledges before processing
        let filteredPledgeDocs = snapshot.docs;
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            filteredPledgeDocs = snapshot.docs.filter(pledgeDoc => {
                const pledgeData = pledgeDoc.data();
                // Check if pledge matches filter (using constituency/island from pledge or voter data)
                return window.GlobalFilter.matchesFilter(pledgeData);
            });
        }

        // Calculate stats from filtered pledges
        filteredPledgeDocs.forEach(pledgeDoc => {
            const pledgeData = pledgeDoc.data();
            total++;
            if (pledgeData.pledge === 'yes') {
                yes++;
            } else if (pledgeData.pledge === 'no' || pledgeData.pledge === 'negative') {
                no++;
            } else {
                undecided++;
            }
        });

        // Update pagination to use filtered docs
        const filteredStartIndex = (state.currentPage - 1) * state.recordsPerPage;
        const filteredEndIndex = filteredStartIndex + state.recordsPerPage;
        const paginatedDocs = filteredPledgeDocs.slice(filteredStartIndex, filteredEndIndex);

        for (const pledgeDoc of paginatedDocs) {
            const pledgeData = pledgeDoc.data();
            const voterData = pledgeData.voterDocumentId ? voterDataMap.get(pledgeData.voterDocumentId) : null;

            // Use voter data if available, otherwise fall back to pledge data
            const displayData = voterData || pledgeData;

            // Apply global filter check (double-check for paginated items)
            if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
                if (!window.GlobalFilter.matchesFilter(pledgeData)) {
                    continue; // Skip this pledge if it doesn't match filter
                }
            }

            const voterName = voterData ? (voterData.name || pledgeData.voterName || 'N/A') : (pledgeData.voterName || 'N/A');

            // Get ID number - prioritize voter data, avoid document IDs
            let idNumber = 'N/A';
            if (voterData) {
                idNumber = voterData.idNumber || voterData.voterId || 'N/A';
            } else {
                // Only use pledge data voterId if it's not the document ID
                idNumber = pledgeData.voterId || 'N/A';
            }

            // Get image URL using the function that checks images folder
            let imageUrl = getVoterImageUrl(voterData || pledgeData, idNumber !== 'N/A' ? idNumber : null);
            const permanentAddress = voterData ?
                ((voterData.permanentAddress && voterData.permanentAddress.trim()) || (voterData.address && voterData.address.trim()) || 'N/A') :
                ((pledgeData.permanentAddress && pledgeData.permanentAddress.trim()) || 'N/A');
            const currentLocation = voterData ?
                ((voterData.currentLocation && voterData.currentLocation.trim()) || (voterData.location && voterData.location.trim()) || 'N/A') :
                ((pledgeData.currentLocation && pledgeData.currentLocation.trim()) || 'N/A');

            const initials = voterName && voterName !== 'N/A' ? voterName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

            const pledgeDate = pledgeData.recordedAt ? (pledgeData.recordedAt.toDate ? pledgeData.recordedAt.toDate() : new Date(pledgeData.recordedAt)) : new Date();
            const dateStr = pledgeDate.toLocaleDateString('default', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            let statusClass = 'status-pending';
            let statusText = 'Undecided';

            // Status display (stats already calculated above)
            if (pledgeData.pledge === 'yes') {
                statusClass = 'status-success';
                statusText = 'Yes';
            } else if (pledgeData.pledge === 'no' || pledgeData.pledge === 'negative') {
                statusClass = 'status-danger';
                statusText = 'No';
            }

            const row = document.createElement('tr');
            const currentPledgeId = pledgeDoc.id;
            row.style.cursor = 'pointer';
            row.dataset.pledgeId = currentPledgeId;
            row.innerHTML = `
                <td style="text-align: center; color: var(--text-light); font-weight: 600;">${rowNumber}</td>
                <td>
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${voterName}" class="voter-image" loading="lazy" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" data-voter-id="${idNumber !== 'N/A' ? idNumber : ''}" onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${idNumber !== 'N/A' ? idNumber : ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });"><div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;">${initials}</div>` :
                        `<div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;" data-voter-id="${idNumber !== 'N/A' ? idNumber : ''}">${initials}</div>`
                    }
                </td>
                <td>${idNumber}</td>
                <td>
                    <div class="table-cell-user">
                        <strong>${voterName}</strong>
                    </div>
                </td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${displayData.constituency || 'N/A'}">${displayData.constituency || 'N/A'}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${displayData.island || 'N/A'}">${displayData.island || 'N/A'}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${permanentAddress}">${permanentAddress}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${currentLocation}">${currentLocation}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${dateStr}</td>
                <td>
                    <div class="table-actions">
                        <button class="icon-btn" title="View Details" onclick="event.stopPropagation(); if (window.openPledgeDetailsSidePanel) window.openPledgeDetailsSidePanel('${currentPledgeId}');">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="icon-btn" title="Edit Pledge" onclick="editPledge('${currentPledgeId}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" title="Delete Pledge" onclick="deletePledge('${currentPledgeId}')" style="color: var(--danger-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            // Add click handler to row
            row.addEventListener('click', function(e) {
                if (e.target.closest('.table-actions')) {
                    return;
                }
                if (window.openPledgeDetailsSidePanel) {
                    window.openPledgeDetailsSidePanel(currentPledgeId);
                }
            });

            fragment.appendChild(row);

            // Store pledge data for cache
            allPledges.push({
                id: currentPledgeId,
                ...pledgeData,
                voterData: voterData
            });

            rowNumber++;
        }

        // Store in cache - use allPledges array we built during rendering
        dataCache.pledges.data = {
            pledges: allPledges,
            voterDataMap: Array.from(voterDataMap.entries()),
            stats: {
                yes,
                no,
                undecided,
                total
            }
        };
        dataCache.pledges.timestamp = Date.now();
        dataCache.pledges.userEmail = window.userEmail;

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            tbody.textContent = '';
            tbody.appendChild(fragment);
            // Render pagination with filtered count
            renderPagination('pledges', filteredPledgeDocs.length);
        });
    } catch (error) {
        console.error('Error loading pledges:', error);
        let errorMessage = 'Error loading pledges';

        // Provide more specific error messages
        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You may not have access to view pledges.';
        } else if (error.code === 'failed-precondition') {
            errorMessage = 'Firestore index required. Please check the console for index creation link.';
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }

        if (window.showErrorDialog && error.code) {
            window.showErrorDialog(errorMessage, 'Error Loading Pledges');
        }

        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <p style="color: var(--danger-color); font-weight: 600;">${errorMessage}</p>
                <button class="btn-secondary btn-compact" onclick="loadPledgesData(true)" style="margin-top: 10px;">Retry</button>
            </div>
        </td></tr>`;
    }
}

// Render cached pledges data with search and filter support
function renderCachedPledgesData() {
    if (!dataCache.pledges.data) return false;

    const tbody = document.getElementById('pledges-table-body');
    if (!tbody) return false;

    // Safety check: ensure cache data structure is valid
    // Handle different cache structures - be more flexible
    let allPledges = [];
    let voterDataMapEntries = [];
    let stats = null;

    const cacheData = dataCache.pledges.data;

    if (Array.isArray(cacheData)) {
        // Old format: cache is directly an array
        allPledges = cacheData;
        console.log('[renderCachedPledgesData] Using old cache format (array), found', allPledges.length, 'pledges');
    } else if (cacheData && typeof cacheData === 'object') {
        // New format: cache is an object with pledges, voterDataMap, stats
        allPledges = cacheData.pledges || cacheData.data || [];
        voterDataMapEntries = cacheData.voterDataMap || [];
        stats = cacheData.stats || null;
        console.log('[renderCachedPledgesData] Using new cache format (object), found', allPledges.length, 'pledges');
    } else {
        // Invalid cache - clear it and force refresh
        console.error('[renderCachedPledgesData] Invalid cache data structure, clearing cache:', cacheData);
        clearCache('pledges');
        // Force a fresh load
        setTimeout(() => {
            if (typeof loadPledgesData === 'function') {
                loadPledgesData(true);
            }
        }, 100);
        return false;
    }

    // Safety check: ensure allPledges is an array
    if (!Array.isArray(allPledges)) {
        console.error('[renderCachedPledgesData] Invalid pledges array in cache, clearing cache:', allPledges);
        clearCache('pledges');
        // Force a fresh load
        setTimeout(() => {
            if (typeof loadPledgesData === 'function') {
                loadPledgesData(true);
            }
        }, 100);
        return false;
    }

    const voterDataMap = new Map(voterDataMapEntries || []);

    // Apply search filter
    const searchInput = document.getElementById('pledge-search');
    const filterSelect = document.getElementById('pledge-filter');
    const searchTerm = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';
    const filterValue = (filterSelect && filterSelect.value) ? filterSelect.value.trim() : '';

    // Initialize filteredPledges - ensure it's always an array
    let filteredPledges = Array.isArray(allPledges) ? allPledges : [];

    // Apply global filter first
    if (window.FilterUtils) {
        filteredPledges = window.FilterUtils.applyFilterToArray(filteredPledges);
    }

    // Apply search filter
    if (searchTerm) {
        filteredPledges = allPledges.filter(pledge => {
            const voterData = pledge.voterData || (pledge.voterDocumentId ? voterDataMap.get(pledge.voterDocumentId) : null);
            const displayData = voterData || pledge;

            const voterName = (voterData ? (voterData.name || pledge.voterName) : pledge.voterName || '').toLowerCase();
            const idNumber = (voterData ? (voterData.idNumber || voterData.voterId) : pledge.voterId || '').toLowerCase();
            const permanentAddress = (voterData ? (voterData.permanentAddress || voterData.address) : pledge.permanentAddress || '').toLowerCase();
            const currentLocation = (voterData ? (voterData.currentLocation || voterData.location) : pledge.currentLocation || '').toLowerCase();
            const candidate = (pledge.candidate || pledge.candidateId || '').toLowerCase();

            return voterName.includes(searchTerm) ||
                idNumber.includes(searchTerm) ||
                permanentAddress.includes(searchTerm) ||
                currentLocation.includes(searchTerm) ||
                candidate.includes(searchTerm);
        });
    }

    // Apply status filter
    if (filterValue) {
        filteredPledges = filteredPledges.filter(pledge => {
            const pledgeStatus = (pledge.pledge || '').toLowerCase();
            if (filterValue === 'yes') {
                return pledgeStatus === 'yes' || pledgeStatus.includes('yes');
            } else if (filterValue === 'no') {
                return pledgeStatus === 'no' || pledgeStatus === 'negative' || pledgeStatus.includes('no');
            } else if (filterValue === 'undecided') {
                return !pledgeStatus || pledgeStatus === 'undecided' || (!pledgeStatus.includes('yes') && !pledgeStatus.includes('no'));
            }
            return true;
        });
    }

    // Initialize filter tracking if not exists
    if (!paginationState.pledges.hasOwnProperty('lastSearchTerm')) {
        paginationState.pledges.lastSearchTerm = '';
    }
    if (!paginationState.pledges.hasOwnProperty('lastFilterValue')) {
        paginationState.pledges.lastFilterValue = '';
    }

    // Check if filter/search changed - only reset to page 1 if filter actually changed
    const previousSearchTerm = paginationState.pledges.lastSearchTerm || '';
    const previousFilterValue = paginationState.pledges.lastFilterValue || '';

    // Only reset to page 1 if the filter/search actually changed (not on pagination navigation)
    const filterChanged = (searchTerm !== previousSearchTerm) || (filterValue !== previousFilterValue);

    if (filterChanged) {
        console.log('[Pagination] Filter/search changed, resetting to page 1', {
            previousSearch: previousSearchTerm,
            newSearch: searchTerm,
            previousFilter: previousFilterValue,
            newFilter: filterValue
        });
        paginationState.pledges.currentPage = 1;
    }

    // Always update the last known filter/search values (to track current state)
    paginationState.pledges.lastSearchTerm = searchTerm;
    paginationState.pledges.lastFilterValue = filterValue;

    // Update statistics based on filtered results
    updatePledgeStatisticsFromArray(filteredPledges);

    if (filteredPledges.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">' +
            (searchTerm || filterValue ? 'No pledges found matching your search' : 'No pledges recorded yet') + '</td></tr>';
        renderPagination('pledges', 0);
        return true;
    }

    // Pagination - use filtered results for pagination
    const state = paginationState.pledges;
    const totalFiltered = filteredPledges.length;
    const maxPage = Math.ceil(totalFiltered / state.recordsPerPage);

    // Ensure current page doesn't exceed max page for filtered results
    if (state.currentPage > maxPage && maxPage > 0) {
        state.currentPage = maxPage;
    }

    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const endIndex = startIndex + state.recordsPerPage;
    const paginatedPledges = filteredPledges.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    let rowNumber = startIndex + 1;

    paginatedPledges.forEach(pledge => {
        const pledgeData = pledge;
        const voterData = pledge.voterData || (pledge.voterDocumentId ? voterDataMap.get(pledge.voterDocumentId) : null);
        const displayData = voterData || pledgeData;

        const voterName = voterData ? (voterData.name || pledgeData.voterName || 'N/A') : (pledgeData.voterName || 'N/A');
        const idNumber = voterData ? (voterData.idNumber || voterData.voterId || 'N/A') : (pledgeData.voterId || 'N/A');
        // Get image URL using the function that checks images folder
        let imageUrl = getVoterImageUrl(voterData || pledgeData, idNumber !== 'N/A' ? idNumber : null);
        const permanentAddress = voterData ?
            ((voterData.permanentAddress && voterData.permanentAddress.trim()) || (voterData.address && voterData.address.trim()) || 'N/A') :
            ((pledgeData.permanentAddress && pledgeData.permanentAddress.trim()) || 'N/A');
        const currentLocation = voterData ?
            ((voterData.currentLocation && voterData.currentLocation.trim()) || (voterData.location && voterData.location.trim()) || 'N/A') :
            ((pledgeData.currentLocation && pledgeData.currentLocation.trim()) || 'N/A');

        const initials = voterName && voterName !== 'N/A' ? voterName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
        const pledgeDate = pledgeData.recordedAt ? (pledgeData.recordedAt.toDate ? pledgeData.recordedAt.toDate() : new Date(pledgeData.recordedAt)) : new Date();
        const dateStr = pledgeDate.toLocaleDateString('default', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        let statusClass = 'status-pending';
        let statusText = 'Undecided';
        if (pledgeData.pledge === 'yes') {
            statusClass = 'status-success';
            statusText = 'Yes';
        } else if (pledgeData.pledge === 'no' || pledgeData.pledge === 'negative') {
            statusClass = 'status-danger';
            statusText = 'No';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center; color: var(--text-light); font-weight: 600;">${rowNumber}</td>
            <td>
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${voterName}" class="voter-image" loading="lazy" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" data-voter-id="${idNumber !== 'N/A' ? idNumber : ''}" onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${idNumber !== 'N/A' ? idNumber : ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });"><div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;">${initials}</div>` :
                    `<div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 600; font-size: 14px;" data-voter-id="${idNumber !== 'N/A' ? idNumber : ''}">${initials}</div>`
                }
            </td>
            <td>${idNumber}</td>
            <td>
                <div class="table-cell-user">
                    <strong>${voterName}</strong>
                </div>
            </td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${displayData.constituency || 'N/A'}">${displayData.constituency || 'N/A'}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${displayData.island || 'N/A'}">${displayData.island || 'N/A'}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${permanentAddress}">${permanentAddress}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${currentLocation}">${currentLocation}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${dateStr}</td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn" title="View Details" onclick="viewPledgeDetails('${pledge.id || pledgeData.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Edit Pledge" onclick="editPledge('${pledge.id || pledgeData.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Delete Pledge" onclick="deletePledge('${pledge.id || pledgeData.id}')" style="color: var(--danger-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        fragment.appendChild(row);

        // If no image URL found, try to lookup from images folder asynchronously
        if (!imageUrl && idNumber && idNumber !== 'N/A' && idNumber.trim()) {
            lookupImageFromFolder(idNumber).then(foundUrl => {
                if (foundUrl) {
                    // Find the image element and update it
                    let img = row.querySelector(`img[data-voter-id="${idNumber}"]`);
                    if (img) {
                        img.src = foundUrl;
                        img.style.display = '';
                        const fallback = img.nextElementSibling;
                        if (fallback && fallback.classList.contains('user-avatar')) {
                            fallback.style.display = 'none';
                        }
                    } else {
                        // If no img element (we showed initials), create one
                        const avatarDiv = row.querySelector(`.user-avatar[data-voter-id="${idNumber}"]`);
                        if (avatarDiv) {
                            img = document.createElement('img');
                            img.src = foundUrl;
                            img.alt = voterName || 'Voter';
                            img.className = 'voter-image';
                            img.loading = 'lazy';
                            img.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover;';
                            img.setAttribute('data-voter-id', idNumber);
                            avatarDiv.parentNode.replaceChild(img, avatarDiv);
                        }
                    }
                }
            }).catch(() => {
                // Silently fail - fallback will show
            });
        }

        rowNumber++;
    });

    requestAnimationFrame(() => {
        tbody.textContent = '';
        tbody.appendChild(fragment);
        // Use filtered count for pagination (not total count)
        renderPagination('pledges', filteredPledges.length, state.recordsPerPage);
    });
    return true;
}

// Helper function to update pledge statistics from array
function updatePledgeStatisticsFromArray(pledges) {
    // Safety check: ensure pledges is an array
    if (!pledges || !Array.isArray(pledges)) {
        console.warn('[updatePledgeStatisticsFromArray] Invalid pledges array:', pledges);
        pledges = [];
    }

    let yes = 0,
        no = 0,
        undecided = 0,
        total = pledges.length;

    pledges.forEach(pledge => {
        const pledgeStatus = (pledge.pledge || '').toLowerCase();
        if (pledgeStatus === 'yes' || pledgeStatus.includes('yes')) {
            yes++;
        } else if (pledgeStatus === 'no' || pledgeStatus === 'negative' || pledgeStatus.includes('no')) {
            no++;
        } else {
            undecided++;
        }
    });

    const yesEl = document.getElementById('stat-pledges-yes');
    const noEl = document.getElementById('stat-pledges-no');
    const undecidedEl = document.getElementById('stat-pledges-undecided');
    const totalEl = document.getElementById('stat-pledges-total');

    if (yesEl) {
        yesEl.textContent = yes;
        yesEl.style.transform = 'scale(1.1)';
        setTimeout(() => yesEl.style.transform = 'scale(1)', 200);
    }
    if (noEl) {
        noEl.textContent = no;
        noEl.style.transform = 'scale(1.1)';
        setTimeout(() => noEl.style.transform = 'scale(1)', 200);
    }
    if (undecidedEl) {
        undecidedEl.textContent = undecided;
        undecidedEl.style.transform = 'scale(1.1)';
        setTimeout(() => undecidedEl.style.transform = 'scale(1)', 200);
    }
    if (totalEl) {
        totalEl.textContent = total;
        totalEl.style.transform = 'scale(1.1)';
        setTimeout(() => totalEl.style.transform = 'scale(1)', 200);
    }
}

// Load agents data
async function loadAgentsData(forceRefresh = false) {
    if (!window.db || !window.userEmail) return;

    const tbody = document.getElementById('agents-table-body');
    if (!tbody) return;

    // Check cache first
    if (!forceRefresh && isCacheValid('agents')) {
        console.log('[loadAgentsData] Using cached data - instant load');
        const rendered = renderCachedAgentsData();
        if (rendered) {
            return; // Successfully rendered from cache
        } else {
            console.log('[loadAgentsData] Cache render failed, loading from Firebase...');
            // Clear invalid cache and continue to load from Firebase
            clearCache('agents');
        }
    }

    // Show skeleton loading
    showTableSkeleton(tbody, 5, 7);

    try {
        (tbody, 10);

        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        (tbody, 30);

        const agentsQuery = query(collection(window.db, 'agents'), where('email', '==', window.userEmail));
        const snapshot = await getDocs(agentsQuery);

        (tbody, 50);

        if (snapshot.empty) {
            (tbody, 100);
            setTimeout(() => {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No agents assigned yet</td></tr>';
                renderPagination('agents', 0);
            }, 300);
            // Store empty cache
            dataCache.agents.data = [];
            dataCache.agents.timestamp = Date.now();
            dataCache.agents.userEmail = window.userEmail;
            return;
        }

        (tbody, 60);

        // Count assigned voters and pledges for each agent (batch query optimization)
        const agentsWithStats = [];
        const statsPromises = [];

        for (const agentDoc of snapshot.docs) {
            const agentData = agentDoc.data();
            // Create promise for voter count and pledges queries
            const statsPromise = (async () => {
                try {
                    // Count assigned voters
                    const votersQuery = query(collection(window.db, 'voters'),
                        where('email', '==', window.userEmail),
                        where('assignedAgentId', '==', agentDoc.id));
                    const votersSnapshot = await getDocs(votersQuery);
                    const votersCount = votersSnapshot.size;

                    // Count pledges by this agent
                    const pledgesQuery = query(collection(window.db, 'pledges'),
                        where('email', '==', window.userEmail),
                        where('agentId', '==', agentDoc.id));
                    const pledgesSnapshot = await getDocs(pledgesQuery);
                    const totalPledges = pledgesSnapshot.size;

                    // Calculate positive pledges (success rate)
                    let positivePledges = 0;
                    pledgesSnapshot.forEach(pledgeDoc => {
                        const pledgeData = pledgeDoc.data();
                        const pledge = pledgeData.pledge || '';
                        if (pledge.toLowerCase().includes('yes') ||
                            pledge.toLowerCase().includes('support') ||
                            pledge.toLowerCase().includes('positive') ||
                            pledge.toLowerCase() === 'yes') {
                            positivePledges++;
                        }
                    });

                    const successRate = totalPledges > 0 ? Math.round((positivePledges / totalPledges) * 100) : 0;

                    return {
                        id: agentDoc.id,
                        votersCount: votersCount,
                        pledgesCount: totalPledges,
                        successRate: successRate
                    };
                } catch (error) {
                    console.warn('Error calculating stats for agent:', error);
                    return {
                        id: agentDoc.id,
                        votersCount: 0,
                        pledgesCount: 0,
                        successRate: 0
                    };
                }
            })();
            statsPromises.push(statsPromise);
            agentsWithStats.push({
                id: agentDoc.id,
                data: agentData,
                assignedVotersCount: 0, // Will be updated after promise resolves
                pledgesCount: 0,
                successRate: 0
            });
        }

        (tbody, 70);

        // Wait for all stats queries in parallel
        const statsResults = await Promise.all(statsPromises);
        const statsMap = new Map(statsResults.map(s => [s.id, s]));
        agentsWithStats.forEach(agent => {
            const stats = statsMap.get(agent.id);
            if (stats) {
                agent.assignedVotersCount = stats.votersCount || 0;
                agent.pledgesCount = stats.pledgesCount || 0;
                agent.successRate = stats.successRate || 0;
            }
        });

        (tbody, 85);

        (tbody, 90);

        // Store in cache
        dataCache.agents.data = agentsWithStats;
        dataCache.agents.timestamp = Date.now();
        dataCache.agents.userEmail = window.userEmail;

        (tbody, 100);

        // Pagination
        const state = paginationState.agents;
        const startIndex = (state.currentPage - 1) * state.recordsPerPage;
        const endIndex = startIndex + state.recordsPerPage;
        const paginatedAgents = agentsWithStats.slice(startIndex, endIndex);

        // Use DocumentFragment for efficient DOM updates
        const fragment = document.createDocumentFragment();
        let rowNumber = startIndex + 1;
        paginatedAgents.forEach(({
            id,
            data,
            assignedVotersCount,
            pledgesCount,
            successRate
        }) => {
            const agentId = data.agentId || 'N/A';
            const agentName = data.name || 'N/A';
            const assignedArea = data.assignedArea || 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align: center; font-weight: 600; color: var(--text-light);">${rowNumber}</td>
                <td style="font-weight: 600; color: var(--text-color);">${agentName}</td>
                <td>${assignedArea}</td>
                <td style="text-align: center;">
                    <span style="font-weight: 600; color: var(--primary-color);">${assignedVotersCount}</span>
                </td>
                <td style="text-align: center;">
                    <span style="font-weight: 600; color: var(--info-color);">${pledgesCount || 0}</span>
                </td>
                <td style="text-align: center;">
                    <span style="font-weight: 600; color: ${successRate >= 70 ? 'var(--success-color)' : successRate >= 50 ? 'var(--warning-color)' : 'var(--text-light)'};">${successRate}%</span>
                </td>
                <td>
                    <div class="table-actions-compact" style="display: flex; align-items: center; gap: 8px;">
                        <button class="icon-btn" onclick="viewAgentDetails('${id}')" title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="icon-btn" onclick="viewAssignedVotersList('${id}')" title="View Assigned Voters">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                        <button class="icon-btn icon-btn-link" onclick="generateAgentLink('${id}')" title="Generate Link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </button>
                        <button class="icon-btn icon-btn-edit" onclick="editAgent('${id}')" title="Edit Agent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="icon-btn icon-btn-danger" onclick="deleteAgent('${id}')" title="Delete Agent">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            fragment.appendChild(row);
            rowNumber++;
        });

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            tbody.textContent = '';
            tbody.appendChild(fragment);
            // Render pagination
            renderPagination('agents', agentsWithStats.length);
        });
    } catch (error) {
        console.error('Error loading agents:', error);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">Error loading agents</td></tr>';
        }
        renderPagination('agents', 0);
    }
}

// Render cached calls data
function renderCachedCallsData() {
    if (!dataCache.calls.data) return false;

    const tbody = document.getElementById('calls-table-body');
    if (!tbody) return false;

    let {
        calls,
        stats
    } = dataCache.calls.data;

    // Apply global filter to cached calls
    if (window.FilterUtils) {
        calls = window.FilterUtils.applyFilterToArray(calls);
        // Recalculate stats based on filtered data
        let total = 0;
        let answered = 0;
        let pending = 0;
        calls.forEach(callData => {
            total++;
            if (callData.status === 'answered') answered++;
            else pending++;
        });
        const successRate = total > 0 ? Math.round((answered / total) * 100) : 0;
        stats = {
            total,
            answered,
            pending,
            successRate
        };
    }

    // Update statistics
    const totalEl = document.getElementById('stat-calls-total');
    const answeredEl = document.getElementById('stat-calls-answered');
    const pendingEl = document.getElementById('stat-calls-pending');
    const successEl = document.getElementById('stat-calls-success');
    if (totalEl) totalEl.textContent = stats.total;
    if (answeredEl) answeredEl.textContent = stats.answered;
    if (pendingEl) pendingEl.textContent = stats.pending;
    if (successEl) successEl.textContent = `${stats.successRate}%`;

    if (calls.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No calls recorded yet</td></tr>';
        renderPagination('calls', 0);
        return true;
    }

    // Pagination
    const state = paginationState.calls;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const endIndex = startIndex + state.recordsPerPage;
    const paginatedCalls = calls.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    paginatedCalls.forEach(call => {
        const data = call;

        const voterName = data.voterName || 'N/A';
        const constituency = data.constituency || data.voterConstituency || 'N/A';
        const island = data.island || data.voterIsland || 'N/A';
        const phone = data.phone || data.number || 'N/A';
        const caller = data.caller || data.agentName || 'N/A';
        const status = data.status || 'pending';
        const statusClass = status === 'answered' ? 'status-success' : 'status-pending';
        const statusText = status === 'answered' ? 'Answered' : (status === 'no-answer' ? 'No Answer' : (status === 'busy' ? 'Busy' : 'Pending'));

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.dataset.callId = call.id;
        row.innerHTML = `
            <td>${voterName}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${constituency}">${constituency}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${island}">${island}</td>
            <td>${phone}</td>
            <td>${caller}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn" title="Edit Call" onclick="event.stopPropagation(); closeModal(); setTimeout(() => { if (window.openModal) window.openModal('call', '${call.id}'); }, 100);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn" title="Delete Call" onclick="event.stopPropagation(); if (window.deleteCall) window.deleteCall('${call.id}');" style="color: var(--danger-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        // Add click handler to row
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on the actions column
            if (e.target.closest('.table-actions')) {
                return;
            }
            if (window.openCallDetailsSidePanel) {
                window.openCallDetailsSidePanel(call.id);
            }
        });

        fragment.appendChild(row);
    });

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        tbody.textContent = '';
        tbody.appendChild(fragment);

        // Setup close button and overlay handlers
        setTimeout(() => {
            const closeBtn = document.getElementById('close-call-side-panel');
            const overlay = document.getElementById('call-details-side-panel-overlay');
            if (closeBtn && !closeBtn.dataset.listenerAttached) {
                closeBtn.dataset.listenerAttached = 'true';
                closeBtn.addEventListener('click', function() {
                    if (window.closeCallDetailsSidePanel) {
                        window.closeCallDetailsSidePanel();
                    }
                });
            }
            if (overlay && !overlay.dataset.listenerAttached) {
                overlay.dataset.listenerAttached = 'true';
                overlay.addEventListener('click', function() {
                    if (window.closeCallDetailsSidePanel) {
                        window.closeCallDetailsSidePanel();
                    }
                });
            }
        }, 100);
    });

    // Render pagination
    renderPagination('calls', calls.length);
    return true;
}

// Render cached agents data
function renderCachedAgentsData() {
    if (!dataCache.agents.data) return false;

    const tbody = document.getElementById('agents-table-body');
    if (!tbody) return false;

    const agentsWithStats = dataCache.agents.data;

    // Pagination
    const state = paginationState.agents;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const endIndex = startIndex + state.recordsPerPage;
    const paginatedAgents = agentsWithStats.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    let rowNumber = startIndex + 1;

    paginatedAgents.forEach(({
        id,
        data,
        assignedVotersCount,
        pledgesCount,
        successRate
    }) => {
        const agentId = data.agentId || 'N/A';
        const agentName = data.name || 'N/A';
        const assignedArea = data.assignedArea || 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center; font-weight: 600; color: var(--text-light);">${rowNumber}</td>
            <td style="font-weight: 600; color: var(--text-color);">${agentName}</td>
            <td>${assignedArea}</td>
            <td style="text-align: center;">
                <span style="font-weight: 600; color: var(--primary-color);">${assignedVotersCount}</span>
            </td>
            <td style="text-align: center;">
                <span style="font-weight: 600; color: var(--info-color);">${pledgesCount || 0}</span>
            </td>
            <td style="text-align: center;">
                <span style="font-weight: 600; color: ${successRate >= 70 ? 'var(--success-color)' : successRate >= 50 ? 'var(--warning-color)' : 'var(--text-light)'};">${successRate}%</span>
            </td>
            <td>
                <div class="table-actions-compact" style="display: flex; align-items: center; gap: 6px; flex-wrap: nowrap;">
                    <button class="icon-btn" onclick="viewAgentDetails('${id}')" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="icon-btn" onclick="viewAssignedVotersList('${id}')" title="View Assigned Voters">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn-link" onclick="generateAgentLink('${id}')" title="Generate Link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn-edit" onclick="editAgent('${id}')" title="Edit Agent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="icon-btn icon-btn-danger" onclick="deleteAgent('${id}')" title="Delete Agent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        fragment.appendChild(row);
        rowNumber++;
    });

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        tbody.textContent = '';
        tbody.appendChild(fragment);
    });

    // Render pagination
    renderPagination('agents', agentsWithStats.length);
    return true;
}

// Edit agent function
async function editAgent(agentId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();

        // Verify the agent belongs to the current user
        if (agentData.email !== window.userEmail && agentData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to edit this agent.', 'Access Denied');
            }
            return;
        }

        // Open agent form modal with pre-filled data
        if (window.openModal) {
            window.openModal('agent', agentId);

            // Wait for modal to render, then populate form
            setTimeout(() => {
                populateAgentEditForm(agentData, agentId);
            }, 300);
        }
    } catch (error) {
        console.error('Error loading agent for edit:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load agent data. Please try again.', 'Error');
        }
    }
}

// Populate agent form with existing data for editing
function populateAgentEditForm(agentData, agentId) {
    // Set form values
    const setName = (name) => {
        const el = document.getElementById('agent-name');
        if (el) el.value = name || '';
    };
    const setAgentId = (id) => {
        const el = document.getElementById('agent-id');
        if (el) el.value = id || '';
    };
    const setAssignedArea = (area) => {
        const el = document.getElementById('agent-area');
        if (el) {
            // First ensure the dropdown is populated
            if (window.campaignData && window.campaignData.constituency && window.getIslandsForConstituency) {
                const constituency = window.campaignData.constituency;
                const islands = window.getIslandsForConstituency(constituency);

                // Clear and populate options
                el.innerHTML = '<option value="">Select Island</option>';
                islands.forEach(island => {
                    const option = document.createElement('option');
                    option.value = island;
                    option.textContent = island;
                    el.appendChild(option);
                });
            }
            // Then set the value
            if (area) {
                el.value = area;
            }
        }
    };
    const setPhone = (phone) => {
        const el = document.getElementById('agent-phone');
        if (el) el.value = phone || '';
    };
    const setEmail = (email) => {
        const el = document.getElementById('agent-email');
        if (el) el.value = email || '';
    };

    setName(agentData.name);
    setAgentId(agentData.agentId);
    setAssignedArea(agentData.assignedArea);
    setPhone(agentData.phone);
    setEmail(agentData.email);

    // Store agent ID for update
    const form = document.getElementById('modal-form');
    if (form) {
        form.dataset.editAgentId = agentId;

        // Update submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Agent';
        }
    }

    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Agent';
    }
}

// Delete agent function
async function deleteAgent(agentId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to delete this agent? This action cannot be undone. This will also remove all assigned voters and agent access.',
            'Delete Agent'
        );
        if (!confirmed) return;
    } else {
        if (!confirm('Are you sure you want to delete this agent? This action cannot be undone. This will also remove all assigned voters and agent access.')) {
            return;
        }
    }

    try {
        const {
            doc,
            deleteDoc,
            getDoc,
            collection,
            query,
            where,
            getDocs,
            updateDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify agent exists and belongs to user
        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();
        if (agentData.email !== window.userEmail && agentData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this agent.', 'Access Denied');
            }
            return;
        }

        // Remove agent assignment from all voters assigned to this agent
        try {
            const votersQuery = query(
                collection(window.db, 'voters'),
                where('email', '==', window.userEmail),
                where('assignedAgentId', '==', agentId)
            );
            const votersSnapshot = await getDocs(votersQuery);

            const updatePromises = [];
            votersSnapshot.forEach(voterDoc => {
                updatePromises.push(
                    updateDoc(voterDoc.ref, {
                        assignedAgentId: null,
                        assignedAgentName: null
                    })
                );
            });

            await Promise.all(updatePromises);
        } catch (error) {
            console.warn('Error removing agent assignments from voters:', error);
            // Continue with deletion even if this fails
        }

        // Delete the agent
        await deleteDoc(agentRef);

        // Show success message
        if (window.showSuccess) {
            window.showSuccess('Agent deleted successfully.', 'Success');
        }

        // Reload agents table
        if (window.reloadTableData) {
            window.reloadTableData('agent');
        } else {
            // Fallback: reload the page content
            if (window.loadPageContent) {
                window.loadPageContent('agent-assignment');
            }
        }
    } catch (error) {
        console.error('Error deleting agent:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete agent. Please try again.', 'Error');
        }
    }
}

// Load analytics data
async function loadAnalyticsData() {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all data in parallel for efficiency
        // For calls, query both campaignEmail and email fields
        const [callsSnap1, callsSnap2] = await Promise.all([
            getDocs(query(collection(window.db, 'calls'), where('campaignEmail', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            })),
            getDocs(query(collection(window.db, 'calls'), where('email', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            }))
        ]);

        // Merge calls from both queries (avoid duplicates)
        const allCallsMap = new Map();
        callsSnap1.forEach(doc => allCallsMap.set(doc.id, doc));
        callsSnap2.forEach(doc => allCallsMap.set(doc.id, doc));
        const callsSnap = {
            size: allCallsMap.size,
            docs: Array.from(allCallsMap.values()),
            forEach: (callback) => allCallsMap.forEach((doc) => callback(doc))
        };

        const [votersSnap, pledgesSnap, agentsSnap, eventsSnap, candidatesSnap] = await Promise.all([
            getDocs(query(collection(window.db, 'voters'), where('email', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            })),
            getDocs(query(collection(window.db, 'pledges'), where('email', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            })),
            getDocs(query(collection(window.db, 'agents'), where('email', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            })),
            getDocs(query(collection(window.db, 'events'), where('campaignEmail', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            })),
            getDocs(query(collection(window.db, 'candidates'), where('email', '==', window.userEmail))).catch(() => ({
                size: 0,
                docs: [],
                forEach: () => {}
            }))
        ]);

        // Extract data
        let voters = votersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        let pledges = pledgesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        let calls = callsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const agents = agentsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        let events = eventsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const candidates = candidatesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Apply global filter to voters, pledges, calls, and events
        if (window.GlobalFilter && window.GlobalFilter.getState().isActive) {
            const filterState = window.GlobalFilter.getState();

            // Filter voters
            const beforeVoterCount = voters.length;
            voters = voters.filter(voter => {
                return window.GlobalFilter.matchesFilter(voter);
            });
            console.log(`[loadAnalyticsData] Voters filtered: ${beforeVoterCount} -> ${voters.length} (filter: ${filterState.type} = ${filterState.value})`);

            // Filter pledges - check if pledge data matches filter (pledges may have voter data embedded)
            const beforePledgeCount = pledges.length;
            pledges = pledges.filter(pledge => {
                // Try to match pledge data directly (pledges may have constituency/island fields)
                return window.GlobalFilter.matchesFilter(pledge);
            });
            console.log(`[loadAnalyticsData] Pledges filtered: ${beforePledgeCount} -> ${pledges.length}`);

            // Filter calls
            const beforeCallCount = calls.length;
            calls = calls.filter(call => {
                return window.GlobalFilter.matchesFilter(call);
            });
            console.log(`[loadAnalyticsData] Calls filtered: ${beforeCallCount} -> ${calls.length}`);

            // Filter events - for events, constituency is master (show all when constituency or show all selected)
            // Only filter by island when island filter is active
            if (filterState.type === 'island') {
                const beforeEventCount = events.length;
                events = events.filter(event => {
                    return window.GlobalFilter.matchesFilter(event);
                });
                console.log(`[loadAnalyticsData] Events filtered: ${beforeEventCount} -> ${events.length}`);
            }
            // If constituency or show all, show all events (no filtering)
        }

        // Update key metrics
        updateKeyMetrics(voters, pledges, calls, agents);

        // Render analytics sections
        renderPledgeStatistics(pledges, voters.length);
        renderVoterDemographics(voters);
        renderIslandDistribution(voters);
        renderCallStatus(calls);
        renderAgeDistribution(voters);
        renderAgentPerformance(agents, pledges, calls);

    } catch (error) {
        console.error('Error loading analytics data:', error);
        showAnalyticsError();
    }
}

// Update key metrics cards
function updateKeyMetrics(voters, pledges, calls, agents) {
    // Total Voters
    const totalVotersEl = document.getElementById('analytics-total-voters');
    if (totalVotersEl) totalVotersEl.textContent = voters.length;

    // Positive Pledges
    const positivePledges = pledges.filter(p => p.pledge === 'yes').length;
    const positivePledgesEl = document.getElementById('analytics-positive-pledges');
    const positivePercentageEl = document.getElementById('analytics-positive-percentage');
    if (positivePledgesEl) positivePledgesEl.textContent = positivePledges;
    if (positivePercentageEl && voters.length > 0) {
        const percentage = Math.round((positivePledges / voters.length) * 100);
        positivePercentageEl.textContent = `${percentage}% of total voters`;
    }

    // Total Calls
    const totalCallsEl = document.getElementById('analytics-total-calls');
    if (totalCallsEl) totalCallsEl.textContent = calls.length;

    // Active Agents
    const activeAgentsEl = document.getElementById('analytics-active-agents');
    if (activeAgentsEl) activeAgentsEl.textContent = agents.length;
}

// Render pledge statistics
function renderPledgeStatistics(pledges, totalVoters) {
    const container = document.getElementById('pledge-statistics-container');
    if (!container) return;

    const yes = pledges.filter(p => p.pledge === 'yes').length;
    const no = pledges.filter(p => p.pledge === 'no').length;
    const undecided = pledges.filter(p => p.pledge === 'undecided').length;
    const notSet = totalVoters - pledges.length;
    const total = totalVoters || 1;

    const maxValue = Math.max(yes, no, undecided, notSet, 1);

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Positive</span>
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${yes} (${Math.round((yes / total) * 100)}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${(yes / maxValue) * 100}%; height: 100%; background: var(--success-color); border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Negative</span>
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${no} (${Math.round((no / total) * 100)}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${(no / maxValue) * 100}%; height: 100%; background: var(--danger-color); border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Undecided</span>
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${undecided} (${Math.round((undecided / total) * 100)}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${(undecided / maxValue) * 100}%; height: 100%; background: var(--warning-color); border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Not Set</span>
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${notSet} (${Math.round((notSet / total) * 100)}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${(notSet / maxValue) * 100}%; height: 100%; background: var(--text-light); border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render voter demographics
function renderVoterDemographics(voters) {
    const container = document.getElementById('demographics-container');
    if (!container) return;

    // Count by gender
    const genderCounts = {};
    voters.forEach(voter => {
        const gender = voter.gender ? voter.gender.toLowerCase() : 'unknown';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    const total = voters.length || 1;
    const male = genderCounts['male'] || 0;
    const female = genderCounts['female'] || 0;
    const other = (genderCounts['other'] || 0) + (genderCounts['unknown'] || 0);

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Male</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${male} (${Math.round((male / total) * 100)}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(male / total) * 100}%; height: 100%; background: var(--info-color); border-radius: 4px;"></div>
                </div>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Female</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${female} (${Math.round((female / total) * 100)}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(female / total) * 100}%; height: 100%; background: var(--primary-color); border-radius: 4px;"></div>
                </div>
            </div>
            ${other > 0 ? `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Other</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${other} (${Math.round((other / total) * 100)}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(other / total) * 100}%; height: 100%; background: var(--text-light); border-radius: 4px;"></div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// Render island distribution
function renderIslandDistribution(voters) {
    const container = document.getElementById('island-distribution-container');
    if (!container) return;

    // Count by island
    const islandCounts = {};
    voters.forEach(voter => {
        const island = voter.island || 'Unknown';
        islandCounts[island] = (islandCounts[island] || 0) + 1;
    });

    // Sort by count (descending) and get top 5
    const sortedIslands = Object.entries(islandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (sortedIslands.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-light);">No island data available</div>';
        return;
    }

    const maxCount = sortedIslands[0][1];

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${sortedIslands.map(([island, count]) => `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">${island}</span>
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${count}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${(count / maxCount) * 100}%; height: 100%; background: var(--gradient-primary); border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `).join('')}
            ${Object.keys(islandCounts).length > 5 ? `<p style="font-size: 12px; color: var(--text-light); margin-top: 8px; text-align: center;">+${Object.keys(islandCounts).length - 5} more islands</p>` : ''}
        </div>
    `;
}

// Render call status breakdown
function renderCallStatus(calls) {
    const container = document.getElementById('call-status-container');
    if (!container) return;

    const successful = calls.filter(c => c.status === 'successful' || c.status === 'answered').length;
    const missed = calls.filter(c => c.status === 'missed' || c.status === 'no-answer').length;
    const busy = calls.filter(c => c.status === 'busy').length;
    const other = calls.length - successful - missed - busy;
    const total = calls.length || 1;

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Successful</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${successful} (${Math.round((successful / total) * 100)}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(successful / total) * 100}%; height: 100%; background: var(--success-color); border-radius: 4px;"></div>
                </div>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Missed</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${missed} (${Math.round((missed / total) * 100)}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(missed / total) * 100}%; height: 100%; background: var(--warning-color); border-radius: 4px;"></div>
                </div>
            </div>
            ${busy > 0 ? `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Busy</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${busy} (${Math.round((busy / total) * 100)}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(busy / total) * 100}%; height: 100%; background: var(--danger-color); border-radius: 4px;"></div>
                </div>
            </div>
            ` : ''}
            ${other > 0 ? `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">Other</span>
                    <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${other}</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(other / total) * 100}%; height: 100%; background: var(--text-light); border-radius: 4px;"></div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// Render age distribution
function renderAgeDistribution(voters) {
    const container = document.getElementById('age-distribution-container');
    if (!container) return;

    // Calculate age groups
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        '65+': 0
    };

    voters.forEach(voter => {
        let age = voter.age;
        if (!age && voter.dateOfBirth) {
            const dob = voter.dateOfBirth.toDate ? voter.dateOfBirth.toDate() : new Date(voter.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
        }

        if (age) {
            if (age >= 18 && age <= 25) ageGroups['18-25']++;
            else if (age >= 26 && age <= 35) ageGroups['26-35']++;
            else if (age >= 36 && age <= 45) ageGroups['36-45']++;
            else if (age >= 46 && age <= 55) ageGroups['46-55']++;
            else if (age >= 56 && age <= 65) ageGroups['56-65']++;
            else if (age > 65) ageGroups['65+']++;
        }
    });

    const total = voters.length || 1;
    const maxCount = Math.max(...Object.values(ageGroups), 1);

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${Object.entries(ageGroups).map(([range, count]) => `
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 500;">${range} years</span>
                        <span style="font-size: 13px; color: var(--text-color); font-weight: 600;">${count} (${Math.round((count / total) * 100)}%)</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${(count / maxCount) * 100}%; height: 100%; background: var(--gradient-primary); border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render agent performance
async function renderAgentPerformance(agents, pledges, calls) {
    const container = document.getElementById('agent-performance-container');
    if (!container) return;

    if (agents.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-light);">No agents assigned</div>';
        return;
    }

    // Calculate performance for each agent
    const agentStats = agents.map(agent => {
        const agentPledges = pledges.filter(p => p.agentId === agent.id);
        const agentCalls = calls.filter(c => c.agentId === agent.id);
        const positivePledges = agentPledges.filter(p => p.pledge === 'yes').length;

        return {
            name: agent.name || agent.agentName || 'Unknown',
            id: agent.id,
            totalPledges: agentPledges.length,
            positivePledges: positivePledges,
            totalCalls: agentCalls.length,
            successRate: agentPledges.length > 0 ? Math.round((positivePledges / agentPledges.length) * 100) : 0
        };
    });

    // Sort by success rate or total pledges
    agentStats.sort((a, b) => {
        if (b.successRate !== a.successRate) return b.successRate - a.successRate;
        return b.totalPledges - a.totalPledges;
    });

    // Show top 5 agents
    const topAgents = agentStats.slice(0, 5);

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${topAgents.map((agent, index) => `
                <div style="padding: 12px; background: var(--light-color); border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <p style="margin: 0; font-size: 13px; font-weight: 600; color: var(--text-color);">${index + 1}. ${agent.name}</p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: var(--text-light);">${agent.totalPledges} pledges • ${agent.totalCalls} calls</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 16px; font-weight: 700; color: var(--success-color);">${agent.successRate}%</p>
                            <p style="margin: 0; font-size: 11px; color: var(--text-light);">Success</p>
                        </div>
                    </div>
                    <div style="width: 100%; height: 4px; background: var(--border-light); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${agent.successRate}%; height: 100%; background: var(--success-color); border-radius: 2px;"></div>
                    </div>
                </div>
            `).join('')}
            ${agents.length > 5 ? `<p style="font-size: 12px; color: var(--text-light); margin-top: 8px; text-align: center;">+${agents.length - 5} more agents</p>` : ''}
        </div>
    `;
}

// Show analytics error
function showAnalyticsError() {
    const containers = [
        'pledge-statistics-container',
        'demographics-container',
        'island-distribution-container',
        'call-status-container',
        'age-distribution-container',
        'agent-performance-container'
    ];

    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--danger-color);">Error loading data</div>';
        }
    });
}

// Refresh analytics data
async function refreshAnalytics() {
    const button = event.target.closest('button') || document.querySelector('[onclick*="refreshAnalytics"]');
    if (button) {
        button.disabled = true;
        button.innerHTML = `
            <div class="loading-spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 6px; display: inline-block;"></div>
            Refreshing...
        `;
    }

    await loadAnalyticsData();

    if (button) {
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Refresh Data
            `;
        }, 500);
    }
}

// Generate report
async function generateReport(type) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        let data = [];
        let filename = '';
        let headers = [];

        if (type === 'voter') {
            const snapshot = await getDocs(query(collection(window.db, 'voters'), where('email', '==', window.userEmail)));
            data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    'No.': snapshot.docs.indexOf(doc) + 1,
                    'ID Number': d.idNumber || 'N/A',
                    'Name': d.name || 'N/A',
                    'Date of Birth': d.dateOfBirth ? (d.dateOfBirth.toDate ? d.dateOfBirth.toDate().toLocaleDateString() : d.dateOfBirth) : 'N/A',
                    'Age': d.age || 'N/A',
                    'Gender': d.gender || 'N/A',
                    'Island': d.island || 'N/A',
                    'Ballot Box': d.ballot || 'N/A',
                    'Permanent Address': d.permanentAddress || 'N/A',
                    'Current Location': d.currentLocation || 'N/A',
                    'Phone': d.number || d.phone || 'N/A'
                };
            });
            filename = `voter-report-${Date.now()}.csv`;
        } else if (type === 'call') {
            const snapshot = await getDocs(query(collection(window.db, 'calls'), where('email', '==', window.userEmail)));
            data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    'Date': d.date ? (d.date.toDate ? d.date.toDate().toLocaleDateString() : d.date) : 'N/A',
                    'Voter Name': d.voterName || 'N/A',
                    'Voter ID': d.voterId || 'N/A',
                    'Status': d.status || 'N/A',
                    'Notes': d.notes || 'N/A',
                    'Agent': d.agentName || 'N/A'
                };
            });
            filename = `call-report-${Date.now()}.csv`;
        } else if (type === 'event') {
            const snapshot = await getDocs(query(collection(window.db, 'events'), where('email', '==', window.userEmail)));
            data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    'Event Name': d.eventName || 'N/A',
                    'Date': d.date ? (d.date.toDate ? d.date.toDate().toLocaleDateString() : d.date) : 'N/A',
                    'Location': d.location || 'N/A',
                    'Start Time': d.startTime || 'N/A',
                    'End Time': d.endTime || 'N/A',
                    'Attendees': d.attendees || 'N/A',
                    'Description': d.description || 'N/A'
                };
            });
            filename = `event-report-${Date.now()}.csv`;
        } else if (type === 'pledge') {
            // Fetch pledges with voter details
            const {
                getDoc,
                doc
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const pledgesSnapshot = await getDocs(query(collection(window.db, 'pledges'), where('email', '==', window.userEmail)));
            const pledges = [];

            for (const pledgeDoc of pledgesSnapshot.docs) {
                const pledgeData = pledgeDoc.data();
                let voterName = 'N/A';
                let voterId = 'N/A';

                if (pledgeData.voterDocumentId) {
                    try {
                        const voterDoc = await getDoc(doc(window.db, 'voters', pledgeData.voterDocumentId));
                        if (voterDoc.exists()) {
                            const voterData = voterDoc.data();
                            voterName = voterData.name || 'N/A';
                            voterId = voterData.idNumber || 'N/A';
                        }
                    } catch (err) {
                        console.warn('Error fetching voter for pledge:', err);
                    }
                }

                pledges.push({
                    'Voter Name': voterName,
                    'Voter ID': voterId,
                    'Pledge Status': pledgeData.pledge || 'N/A',
                    'Date Recorded': pledgeData.dateRecorded ? (pledgeData.dateRecorded.toDate ? pledgeData.dateRecorded.toDate().toLocaleDateString() : pledgeData.dateRecorded) : 'N/A',
                    'Agent': pledgeData.agentName || 'N/A'
                });
            }

            data = pledges;
            filename = `pledge-report-${Date.now()}.csv`;
        } else if (type === 'full') {
            // Generate comprehensive report with all data
            const [votersSnap, pledgesSnap, callsSnap, eventsSnap, agentsSnap] = await Promise.all([
                getDocs(query(collection(window.db, 'voters'), where('email', '==', window.userEmail))),
                getDocs(query(collection(window.db, 'pledges'), where('email', '==', window.userEmail))),
                getDocs(query(collection(window.db, 'calls'), where('email', '==', window.userEmail))),
                getDocs(query(collection(window.db, 'events'), where('email', '==', window.userEmail))),
                getDocs(query(collection(window.db, 'agents'), where('email', '==', window.userEmail)))
            ]);

            const report = {
                campaign: window.campaignData ? window.campaignData.campaignName : 'N/A',
                generatedAt: new Date().toLocaleString(),
                summary: {
                    totalVoters: votersSnap.size,
                    totalPledges: pledgesSnap.size,
                    totalCalls: callsSnap.size,
                    totalEvents: eventsSnap.size,
                    totalAgents: agentsSnap.size
                },
                details: 'See individual sections for detailed breakdowns'
            };

            // Create comprehensive text report
            const reportText = `
CAMPAIGN ANALYTICS REPORT
Generated: ${report.generatedAt}
Campaign: ${report.campaign}

SUMMARY
Total Voters: ${report.summary.totalVoters}
Total Pledges: ${report.summary.totalPledges}
Total Calls: ${report.summary.totalCalls}
Total Events: ${report.summary.totalEvents}
Total Agents: ${report.summary.totalAgents}

${report.details}
            `.trim();

            downloadTextFile(reportText, `full-campaign-report-${Date.now()}.txt`);
            if (window.showSuccessMessage) {
                window.showSuccessMessage('Full campaign report downloaded successfully!', 'Report Generated');
            }
            return;
        }

        if (data.length === 0) {
            if (window.showErrorDialog) {
                window.showErrorDialog(`No ${type} data available to export.`, 'No Data');
            }
            return;
        }

        // Convert to CSV
        headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(','))
        ];

        const csvContent = csvRows.join('\n');
        downloadCSV(csvContent, filename);

        if (window.showSuccessMessage) {
            window.showSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully!`, 'Report Generated');
        }

    } catch (error) {
        console.error('Error generating report:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to generate report. Please try again.', 'Error');
        }
    }
}

// Download CSV file
function downloadCSV(content, filename) {
    const blob = new Blob([content], {
        type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download text file
function downloadTextFile(content, filename) {
    const blob = new Blob([content], {
        type: 'text/plain;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Make functions globally available
window.refreshAnalytics = refreshAnalytics;
window.generateReport = generateReport;

// Update mobile bottom navigation visibility based on settings
function updateMobileBottomNavVisibility() {
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    if (!mobileBottomNav) return;

    const savedSetting = localStorage.getItem('mobileBottomNavEnabled');
    const isEnabled = savedSetting === 'true'; // Default to disabled (only enabled if explicitly set to 'true')

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    if (isEnabled && isMobile) {
        mobileBottomNav.classList.remove('hidden');
        mobileBottomNav.style.display = 'flex';
    } else {
        mobileBottomNav.classList.add('hidden');
        setTimeout(() => {
            if (mobileBottomNav.classList.contains('hidden')) {
                mobileBottomNav.style.display = 'none';
            }
        }, 300);
    }

    // Update Zero Day visibility in More menu
    updateMobileMoreMenuZeroDay();
}

// Update Zero Day visibility in mobile more menu
function updateMobileMoreMenuZeroDay() {
    const zeroDayNavItem = document.getElementById('mobile-more-zero-day');
    if (!zeroDayNavItem) return;

    // Check if zero day is enabled
    if (window.campaignData && window.campaignData.zeroDayEnabled) {
        zeroDayNavItem.style.display = 'flex';
    } else {
        zeroDayNavItem.style.display = 'none';
    }
}

// Make it globally available
window.updateMobileBottomNavVisibility = updateMobileBottomNavVisibility;

// Populate settings page with campaign data
function populateSettingsData() {
    // Initialize messenger toggle state from localStorage
    setTimeout(() => {
        const messengerToggle = document.getElementById('messenger-enabled-toggle');
        if (messengerToggle) {
            const savedSetting = localStorage.getItem('messengerEnabled');
            const isEnabled = savedSetting === 'true';
            messengerToggle.checked = isEnabled;

            // Update messenger visibility when settings page loads
            if (typeof window.updateMessengerVisibility === 'function') {
                window.updateMessengerVisibility();
            } else if (typeof updateMessengerVisibility === 'function') {
                updateMessengerVisibility();
            }

            // Add event listener for messenger toggle
            messengerToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                localStorage.setItem('messengerEnabled', enabled.toString());
                if (typeof window.updateMessengerVisibility === 'function') {
                    window.updateMessengerVisibility();
                }
            });
        }

        // Initialize mobile bottom nav toggle state from localStorage
        const mobileNavToggle = document.getElementById('mobile-bottom-nav-toggle');
        if (mobileNavToggle) {
            const savedSetting = localStorage.getItem('mobileBottomNavEnabled');
            const isEnabled = savedSetting === 'true'; // Default to disabled (only enabled if explicitly set to 'true')
            mobileNavToggle.checked = isEnabled;

            // Update mobile bottom nav visibility when settings page loads
            updateMobileBottomNavVisibility();

            // Add event listener for mobile bottom nav toggle
            mobileNavToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                localStorage.setItem('mobileBottomNavEnabled', enabled.toString());
                updateMobileBottomNavVisibility();
            });
        }

        // Initialize voter images toggle state from localStorage
        const voterImagesToggle = document.getElementById('voter-images-toggle');
        if (voterImagesToggle) {
            const savedSetting = localStorage.getItem('voterImagesEnabled');
            // Default to true (enabled) if not set
            const isEnabled = savedSetting === null || savedSetting === 'true';
            voterImagesToggle.checked = isEnabled;

            // Add event listener for voter images toggle
            voterImagesToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                localStorage.setItem('voterImagesEnabled', enabled.toString());

                // Clear image caches when disabling to prevent stale data
                if (!enabled) {
                    imageFilenameCache.clear();
                    imageNotFoundCache.clear();
                }

                // Reload current page data to reflect the change
                // Check which page we're on and reload accordingly
                if (typeof loadVotersData === 'function') {
                    loadVotersData(true); // Force refresh
                }
                if (typeof loadPledgesData === 'function') {
                    loadPledgesData(true); // Force refresh
                }
                if (typeof loadCallsData === 'function') {
                    loadCallsData(true); // Force refresh
                }

                console.log('[Settings] Voter images', enabled ? 'enabled' : 'disabled');
            });
        }

    }, 100);
    // Get campaign data from global window object (set by app.js)
    if (window.campaignData) {
        updateSettingsFields(window.campaignData);
    } else if (window.userEmail) {
        // Fallback: fetch from Firebase if available
        if (window.db && window.userEmail) {
            import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js').then(({
                getDoc,
                doc
            }) => {
                getDoc(doc(window.db, 'users', window.userEmail)).then(userDoc => {
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        updateSettingsFields(userData);
                        // Update campaignData if available
                        if (userData && !window.campaignData) {
                            window.campaignData = userData;
                        }
                    }
                }).catch(error => {
                    console.error('Error loading settings data:', error);
                });
            });
        }
    }

    // Setup Zero Day toggle event listener
    setTimeout(() => {

        const zeroDayToggle = document.getElementById('zero-day-toggle');
        if (zeroDayToggle) {
            zeroDayToggle.addEventListener('change', async (e) => {
                const enabled = e.target.checked;
                await saveZeroDayToggle(enabled);
                updateZeroDayMenuVisibility(enabled);
            });
        }
    }, 300);
}

// Save Zero Day toggle state to Firebase
async function saveZeroDayToggle(enabled) {
    if (!window.db || !window.userEmail) {
        console.error('Database or user email not available');
        return;
    }

    try {
        const {
            doc,
            updateDoc,
            setDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const userRef = doc(window.db, 'users', window.userEmail);

        // Try to update, if document doesn't exist, create it
        try {
            await updateDoc(userRef, {
                zeroDayEnabled: enabled
            });
        } catch (error) {
            if (error.code === 'not-found') {
                // Document doesn't exist, create it
                await setDoc(userRef, {
                    email: window.userEmail,
                    zeroDayEnabled: enabled
                }, {
                    merge: true
                });
            } else {
                throw error;
            }
        }

        // Update local campaignData
        if (window.campaignData) {
            window.campaignData.zeroDayEnabled = enabled;
        } else {
            window.campaignData = {
                zeroDayEnabled: enabled
            };
        }

        // Update mobile more menu
        updateMobileMoreMenuZeroDay();

        console.log('[saveZeroDayToggle] Zero Day toggle saved:', enabled);
    } catch (error) {
        console.error('Error saving Zero Day toggle:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to save Zero Day setting. Please try again.', 'Error');
        }
    }
}

// Load Zero Day data
async function loadZeroDayData() {
    if (!window.db || !window.userEmail) return;

    // Show skeleton animations for all tables simultaneously
    showBallotsSkeleton();
    showTransportationSkeleton('flights');
    showTransportationSkeleton('speedboats');
    showTransportationSkeleton('taxis');

    // Load all data in parallel (skip skeleton since we already showed them)
    await Promise.all([
        loadBallotsData(false, true), // skipSkeleton = true
        loadTransportationData(false, true) // skipSkeleton = true
    ]);
}

// Show skeleton loading for ballots table (using standard skeleton function)
function showBallotsSkeleton() {
    const tbody = document.getElementById('ballots-table-body');
    if (tbody && window.showTableSkeleton) {
        window.showTableSkeleton(tbody, 5, 5);
    }
}

// Load ballots data
async function loadBallotsData(forceRefresh = false, skipSkeleton = false) {
    if (!window.userEmail) return;

    const tbody = document.getElementById('ballots-table-body');
    if (!tbody) return;

    // Show skeleton loading (unless skipped, e.g., when called from loadZeroDayData)
    if (!skipSkeleton) {
        showBallotsSkeleton();
    }

    // Initialize cache if not exists
    if (!window.ballotsCache) {
        window.ballotsCache = {
            data: [],
            lastFetch: null,
            cacheDuration: 5 * 60 * 1000 // 5 minutes
        };
    }

    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && window.ballotsCache.data.length > 0 &&
        window.ballotsCache.lastFetch &&
        (now - window.ballotsCache.lastFetch) < window.ballotsCache.cacheDuration) {
        console.log('[Ballots] Using cached data');
        // Small delay to show skeleton briefly
        setTimeout(() => {
            renderBallotsTable(window.ballotsCache.data);
        }, 300);
        return;
    }

    try {
        // Load from local storage first
        const localStorageKey = `ballots_${window.userEmail}`;
        const localBallots = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        console.log('[Ballots] Loaded from local storage:', localBallots.length);

        // Load from Firebase
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

        // Combine local storage and Firebase data
        const allBallots = [];

        // Add local storage ballots (pending sync)
        localBallots.forEach(localBallot => {
            if (!localBallot._synced) {
                allBallots.push({
                    id: localBallot.id,
                    ...localBallot,
                    _isLocal: true
                });
            }
        });

        // Add Firebase ballots
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            allBallots.push({
                id: doc.id,
                ...data,
                _isLocal: false
            });
        });

        // Sort by ballot number
        allBallots.sort((a, b) => {
            const aNum = a.ballotNumber || '';
            const bNum = b.ballotNumber || '';
            return aNum.localeCompare(bNum, undefined, {
                numeric: true,
                sensitivity: 'base'
            });
        });

        // Update cache
        window.ballotsCache.data = allBallots;
        window.ballotsCache.lastFetch = now;

        // Render the table
        renderBallotsTable(allBallots);

        // Try to sync any pending local ballots to Firebase
        if (localBallots.length > 0) {
            syncPendingBallots(localBallots);
        }
    } catch (error) {
        console.error('Error loading ballots:', error);
        // Try to render from cache if available
        if (window.ballotsCache && window.ballotsCache.data.length > 0) {
            console.log('[Ballots] Using cached data due to error');
            renderBallotsTable(window.ballotsCache.data);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--danger-color);">Error loading ballots</td></tr>';
        }
    }
}

// Render ballots table
function renderBallotsTable(ballots) {
    const tbody = document.getElementById('ballots-table-body');
    if (!tbody) return;

    if (ballots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">No ballots added yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    ballots.forEach((ballot) => {
        const row = document.createElement('tr');
        // Add visual indicator for pending sync
        const pendingClass = ballot._isLocal ? ' style="opacity: 0.7;"' : '';
        const pendingBadge = ballot._isLocal ? '<span style="font-size: 10px; color: var(--warning-color); margin-left: 5px;">(Syncing...)</span>' : '';

        row.innerHTML = `
            <td><strong>${ballot.ballotNumber || 'N/A'}</strong>${pendingBadge}</td>
            <td>${ballot.location || 'N/A'}</td>
            <td>${ballot.expectedVoters || 0}</td>
            <td><span class="status-badge ${ballot.status === 'open' || ballot.status === 'active' ? 'status-active' : 'status-pending'}">${ballot.status ? ballot.status.charAt(0).toUpperCase() + ballot.status.slice(1) : 'Pending'}</span></td>
            <td>
                <div class="table-actions">
                    ${!ballot._isLocal ? `
                    <button class="icon-btn" title="View Statistics" onclick="viewBallotStatistics('${ballot.id}', '${ballot.ballotNumber || ''}')" style="color: var(--primary-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </button>
                    <button class="icon-btn" title="View Assigned Voters" onclick="viewBallotVoters('${ballot.id}', '${ballot.ballotNumber || ''}')" style="color: var(--info-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="icon-btn" title="Generate Shareable Link" onclick="generateBallotLink('${ballot.id}', '${ballot.ballotNumber || ''}')" style="color: var(--secondary-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <button class="icon-btn" title="Edit" onclick="editBallot('${ballot.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-btn" title="Delete" onclick="deleteBallot('${ballot.id}')" style="color: var(--danger-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>` : '<span style="color: var(--text-light); font-size: 12px;">Syncing...</span>'}
                </div>
            </td>
        `;
        if (pendingClass) row.setAttribute('style', 'opacity: 0.7;');
        tbody.appendChild(row);
    });
}

// Sync pending ballots from local storage to Firebase
async function syncPendingBallots(localBallots) {
    if (!window.db || !window.userEmail) return;

    const pendingBallots = localBallots.filter(b => !b._synced && b._isPending);
    if (pendingBallots.length === 0) return;

    console.log('[Ballots] Syncing pending ballots:', pendingBallots.length);

    const localStorageKey = `ballots_${window.userEmail}`;

    for (const localBallot of pendingBallots) {
        try {
            // Check if ballot already exists in Firebase (by ballotNumber to prevent duplicates)
            const {
                collection,
                query,
                where,
                getDocs,
                addDoc,
                serverTimestamp
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Check for existing ballot with same ballotNumber
            const existingQuery = query(
                collection(window.db, 'ballots'),
                where('email', '==', window.userEmail),
                where('ballotNumber', '==', localBallot.ballotNumber)
            );
            const existingSnap = await getDocs(existingQuery);

            if (!existingSnap.empty) {
                console.log('[Ballots] Ballot already exists in Firebase, skipping sync:', localBallot.ballotNumber);
                // Mark as synced and remove from local storage
                let updatedBallots = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                updatedBallots = updatedBallots.filter(b => b.id !== localBallot.id);
                localStorage.setItem(localStorageKey, JSON.stringify(updatedBallots));
                continue;
            }

            // Prepare data for Firebase
            const {
                id,
                _isPending,
                _synced,
                createdAt: localCreatedAt,
                ...firebaseData
            } = localBallot;

            firebaseData.createdAt = serverTimestamp();

            const docRef = await addDoc(collection(window.db, 'ballots'), firebaseData);
            console.log('[Ballots] Synced to Firebase:', docRef.id);

            // Remove from local storage
            let updatedBallots = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
            updatedBallots = updatedBallots.filter(b => b.id !== localBallot.id);
            localStorage.setItem(localStorageKey, JSON.stringify(updatedBallots));

            // Reload table to show synced data
            setTimeout(() => {
                if (window.loadBallotsData) {
                    window.loadBallotsData(true); // Force refresh
                }
            }, 500);
        } catch (error) {
            console.error('[Ballots] Error syncing ballot:', error);
            // Keep in local storage for retry later
        }
    }
}

// Show skeleton loading for transportation table (using standard skeleton function)
function showTransportationSkeleton(type) {
    const tbody = document.getElementById(`${type}-table-body`);
    if (tbody && window.showTableSkeleton) {
        window.showTableSkeleton(tbody, 5, 7);
    }
}

// Load transportation data
async function loadTransportationData(forceRefresh = false, skipSkeleton = false) {
    if (!window.userEmail) return;

    // Load all transportation types in parallel
    await Promise.all([
        loadTransportationByType('flights', forceRefresh, skipSkeleton),
        loadTransportationByType('speedboats', forceRefresh, skipSkeleton),
        loadTransportationByType('taxis', forceRefresh, skipSkeleton)
    ]);
}

// Load transportation by type
async function loadTransportationByType(type, forceRefresh = false, skipSkeleton = false) {
    if (!window.userEmail) return;

    const tbody = document.getElementById(`${type}-table-body`);
    if (!tbody) return;

    // Show skeleton loading (unless skipped, e.g., when called from loadZeroDayData)
    if (!skipSkeleton) {
        showTransportationSkeleton(type);
    }

    // Initialize cache if not exists
    const cacheKey = `transportation_${type}`;
    if (!window[cacheKey]) {
        window[cacheKey] = {
            data: [],
            lastFetch: null,
            cacheDuration: 5 * 60 * 1000 // 5 minutes
        };
    }

    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && window[cacheKey].data.length > 0 &&
        window[cacheKey].lastFetch &&
        (now - window[cacheKey].lastFetch) < window[cacheKey].cacheDuration) {
        console.log(`[Transportation ${type}] Using cached data`);
        // Small delay to show skeleton briefly
        setTimeout(() => {
            renderTransportationTable(type, window[cacheKey].data);
        }, 300);
        return;
    }

    try {
        // Load from local storage first
        const localStorageKey = `transportation_${type}_${window.userEmail}`;
        const localTransport = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        console.log(`[Transportation ${type}] Loaded from local storage:`, localTransport.length);

        const allTransport = [];

        // Add local storage items (pending sync)
        localTransport.forEach(localItem => {
            if (!localItem._synced) {
                allTransport.push({
                    id: localItem.id,
                    ...localItem,
                    _isLocal: true
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

                const transportQuery = query(
                    collection(window.db, 'transportation'),
                    where('email', '==', window.userEmail),
                    where('type', '==', type),
                    orderBy('departureTime', 'asc')
                );

                const snapshot = await getDocs(transportQuery);

                // Add Firebase items
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    allTransport.push({
                        id: doc.id,
                        ...data,
                        _isLocal: false
                    });
                });
            } catch (firebaseError) {
                console.warn(`[Transportation ${type}] Error loading from Firebase:`, firebaseError);
                // Continue with local storage data only
            }
        }

        // Sort by departure time
        allTransport.sort((a, b) => {
            const aTime = a.departureTime || '';
            const bTime = b.departureTime || '';
            return aTime.localeCompare(bTime);
        });

        // Update cache
        window[cacheKey].data = allTransport;
        window[cacheKey].lastFetch = now;

        // Render the table
        renderTransportationTable(type, allTransport);

        // Try to sync any pending local items to Firebase
        if (localTransport.length > 0) {
            syncPendingTransportation(localTransport, type);
        }
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        // Try to render from cache if available
        if (window[cacheKey] && window[cacheKey].data.length > 0) {
            console.log(`[Transportation ${type}] Using cached data due to error`);
            renderTransportationTable(type, window[cacheKey].data);
        } else {
            const errorMsg = type === 'flights' ? 'Error loading flights' :
                type === 'speedboats' ? 'Error loading speed boats' :
                'Error loading taxis';
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--danger-color);">${errorMsg}</td></tr>`;
        }
    }
}

// Render transportation table
function renderTransportationTable(type, transportItems) {
    const tbody = document.getElementById(`${type}-table-body`);
    if (!tbody) return;

    if (transportItems.length === 0) {
        const emptyMsg = type === 'flights' ? 'No flights scheduled yet' :
            type === 'speedboats' ? 'No speed boats scheduled yet' :
            'No taxis assigned yet';
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">${emptyMsg}</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    transportItems.forEach((item) => {
        const row = document.createElement('tr');
        // Add visual indicator for pending sync
        const pendingBadge = item._isLocal ? '<span style="font-size: 10px; color: var(--warning-color); margin-left: 5px;">(Syncing...)</span>' : '';

        if (item._isLocal) {
            row.style.opacity = '0.7';
        }

        if (type === 'flights') {
            row.innerHTML = `
                <td><strong>${item.flightNumber || item.number || 'N/A'}</strong>${pendingBadge}</td>
                <td>${item.route || 'N/A'}</td>
                <td>${item.departureTime || 'N/A'}</td>
                <td>${item.arrivalTime || 'N/A'}</td>
                <td>${item.capacity || 0}</td>
                <td><span class="status-badge ${item.status === 'confirmed' ? 'status-active' : 'status-pending'}">${item.status || 'Pending'}</span></td>
                <td>
                    <div class="table-actions">
                        ${!item._isLocal ? `
                        <button class="icon-btn" title="Generate Shareable Link" onclick="generateTransportationLink('${item.id}', '${type}', '${item.flightNumber || item.boatName || item.taxiNumber || item.number || ''}')" style="color: var(--secondary-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </button>
                        <button class="icon-btn" title="Edit" onclick="editTransportation('${item.id}', '${type}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-btn" title="Delete" onclick="deleteTransportation('${item.id}', '${type}')" style="color: var(--danger-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>` : '<span style="color: var(--text-light); font-size: 12px;">Syncing...</span>'}
                    </div>
                </td>
            `;
        } else if (type === 'speedboats') {
            row.innerHTML = `
                <td><strong>${item.boatName || item.number || 'N/A'}</strong>${pendingBadge}</td>
                <td>${item.route || 'N/A'}</td>
                <td>${item.departureTime || 'N/A'}</td>
                <td>${item.arrivalTime || 'N/A'}</td>
                <td>${item.capacity || 0}</td>
                <td><span class="status-badge ${item.status === 'confirmed' ? 'status-active' : 'status-pending'}">${item.status || 'Pending'}</span></td>
                <td>
                    <div class="table-actions">
                        ${!item._isLocal ? `
                        <button class="icon-btn" title="Generate Shareable Link" onclick="generateTransportationLink('${item.id}', '${type}', '${item.flightNumber || item.boatName || item.taxiNumber || item.number || ''}')" style="color: var(--secondary-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </button>
                        <button class="icon-btn" title="Edit" onclick="editTransportation('${item.id}', '${type}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-btn" title="Delete" onclick="deleteTransportation('${item.id}', '${type}')" style="color: var(--danger-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>` : '<span style="color: var(--text-light); font-size: 12px;">Syncing...</span>'}
                    </div>
                </td>
            `;
        } else if (type === 'taxis') {
            row.innerHTML = `
                <td><strong>${item.taxiNumber || item.number || 'N/A'}</strong>${pendingBadge}</td>
                <td>${item.driverName || 'N/A'}</td>
                <td>${item.contact || 'N/A'}</td>
                <td>${item.route || item.area || 'N/A'}</td>
                <td>${item.capacity || 0}</td>
                <td><span class="status-badge ${item.status === 'assigned' ? 'status-active' : 'status-pending'}">${item.status || 'Pending'}</span></td>
                <td>
                    <div class="table-actions">
                        ${!item._isLocal ? `
                        <button class="icon-btn" title="Generate Shareable Link" onclick="generateTransportationLink('${item.id}', '${type}', '${item.flightNumber || item.boatName || item.taxiNumber || item.number || ''}')" style="color: var(--secondary-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </button>
                        <button class="icon-btn" title="Edit" onclick="editTransportation('${item.id}', '${type}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-btn" title="Delete" onclick="deleteTransportation('${item.id}', '${type}')" style="color: var(--danger-color);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>` : '<span style="color: var(--text-light); font-size: 12px;">Syncing...</span>'}
                    </div>
                </td>
            `;
        }

        tbody.appendChild(row);
    });
}

// Sync pending transportation from local storage to Firebase
async function syncPendingTransportation(localTransport, type) {
    if (!window.db || !window.userEmail) return;

    const pendingItems = localTransport.filter(t => !t._synced && t._isPending);
    if (pendingItems.length === 0) return;

    console.log(`[Transportation ${type}] Syncing pending items:`, pendingItems.length);

    const localStorageKey = `transportation_${type}_${window.userEmail}`;

    for (const localItem of pendingItems) {
        try {
            const {
                collection,
                query,
                where,
                getDocs,
                addDoc,
                serverTimestamp
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            // Check if record already exists in Firebase (prevent duplicates)
            // Use a unique identifier based on type
            let existingQuery;
            if (type === 'flights') {
                existingQuery = query(
                    collection(window.db, 'transportation'),
                    where('email', '==', window.userEmail),
                    where('type', '==', type),
                    where('flightNumber', '==', localItem.flightNumber || localItem.number)
                );
            } else if (type === 'speedboats') {
                existingQuery = query(
                    collection(window.db, 'transportation'),
                    where('email', '==', window.userEmail),
                    where('type', '==', type),
                    where('boatName', '==', localItem.boatName || localItem.number)
                );
            } else if (type === 'taxis') {
                existingQuery = query(
                    collection(window.db, 'transportation'),
                    where('email', '==', window.userEmail),
                    where('type', '==', type),
                    where('taxiNumber', '==', localItem.taxiNumber || localItem.number)
                );
            }

            if (existingQuery) {
                const existingSnap = await getDocs(existingQuery);
                if (!existingSnap.empty) {
                    console.log(`[Transportation ${type}] Record already exists in Firebase, skipping sync`);
                    // Mark as synced and remove from local storage
                    let updatedItems = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                    updatedItems = updatedItems.filter(t => t.id !== localItem.id);
                    localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));
                    continue;
                }
            }

            // Prepare data for Firebase
            const {
                id,
                _isPending,
                _synced,
                createdAt: localCreatedAt,
                ...firebaseData
            } = localItem;

            firebaseData.createdAt = serverTimestamp();

            const docRef = await addDoc(collection(window.db, 'transportation'), firebaseData);
            console.log(`[Transportation ${type}] Synced to Firebase:`, docRef.id);

            // Remove from local storage
            let updatedItems = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
            updatedItems = updatedItems.filter(t => t.id !== localItem.id);
            localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));

            // Reload table to show synced data
            setTimeout(() => {
                if (window.loadTransportationByType) {
                    window.loadTransportationByType(type, true); // Force refresh
                }
            }, 500);
        } catch (error) {
            console.error(`[Transportation ${type}] Error syncing item:`, error);
            // Keep in local storage for retry later
        }
    }
}

// Make functions globally available
// Load officer ballot view (no authentication required)
window.loadOfficerBallotView = async (ballotId, ballotData) => {
    const database = window.db || db;
    if (!database) {
        console.error('[loadOfficerBallotView] Database not initialized');
        return;
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const ballotNumber = ballotData.ballotNumber || 'N/A';
        const location = ballotData.location || 'N/A';
        const status = ballotData.status || 'open';

        // Update header
        const titleEl = document.getElementById('officer-ballot-title');
        const subtitleEl = document.getElementById('officer-ballot-subtitle');
        if (titleEl) titleEl.textContent = `Ballot ${ballotNumber} - ${location}`;
        if (subtitleEl) subtitleEl.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;

        // Fetch voters assigned to this ballot (no email filter - officers can access by ballot number)
        const votersQuery = query(
            collection(database, 'voters'),
            where('ballot', '==', ballotNumber)
        );

        const votersSnapshot = await getDocs(votersQuery);
        const voters = [];

        // Also fetch agents for voter-agent mapping (if email is available)
        const agentsMap = {};
        if (ballotData.email) {
            try {
                const agentsQuery = query(
                    collection(database, 'agents'),
                    where('email', '==', ballotData.email)
                );
                const agentsSnapshot = await getDocs(agentsQuery);
                agentsSnapshot.docs.forEach(doc => {
                    const agentData = doc.data();
                    agentsMap[agentData.agentId || doc.id] = agentData.name || 'N/A';
                });
            } catch (agentError) {
                console.warn('Could not fetch agents:', agentError);
                // Continue without agent mapping
            }
        }

        votersSnapshot.docs.forEach((doc, index) => {
            const voterData = doc.data();
            const agentId = voterData.agentId || voterData.assignedAgent || null;
            voters.push({
                id: doc.id,
                number: index + 1,
                name: voterData.name || 'N/A',
                idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                permanentAddress: voterData.permanentAddress || voterData.address || 'N/A',
                ballot: ballotNumber,
                agentName: agentId ? (agentsMap[agentId] || 'N/A') : 'N/A',
                voted: voterData.voted || false,
                votedAt: voterData.votedAt || null
            });
        });

        // Store voters data globally for search functionality
        window.officerVotersData = voters;
        window.officerBallotStatus = status;

        // Render table
        renderOfficerBallotTable(voters, status);

        // Hide loading, show table
        const loadingEl = document.getElementById('officer-loading');
        const tableContainer = document.getElementById('officer-ballot-table-container');
        if (loadingEl) loadingEl.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';

        // Setup search functionality
        setupOfficerVoterSearch();

    } catch (error) {
        console.error('Error loading officer ballot view:', error);
        const loadingEl = document.getElementById('officer-loading');
        if (loadingEl) {
            loadingEl.innerHTML = '<p style="color: var(--danger-color);">Error loading ballot information. Please try again.</p>';
        }
    }
};

// Render officer ballot table
function renderOfficerBallotTable(voters, ballotStatus) {
    const tbody = document.getElementById('officer-ballot-table-body');
    if (!tbody) return;

    const isDisabled = ballotStatus === 'close';

    if (voters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-light);">No voters found</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    voters.forEach((voter, index) => {
        const row = document.createElement('tr');
        const votedClass = voter.voted ? 'status-active' : 'status-pending';
        const votedText = voter.voted ? 'Voted' : 'Not Voted';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${voter.name}</strong></td>
            <td>${voter.idNumber}</td>
            <td>${voter.permanentAddress}</td>
            <td>${voter.ballot}</td>
            <td>${voter.agentName}</td>
            <td>
                ${voter.voted ? 
                    `<span class="status-badge ${votedClass}">${votedText}</span>` :
                    `<button class="btn-primary btn-compact" onclick="markVoterAsVoted('${voter.id}')" ${isDisabled ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        Mark as Voted
                    </button>`
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Setup search functionality for officer voter list
function setupOfficerVoterSearch() {
    const searchInput = document.getElementById('officer-voter-search');
    if (!searchInput) return;

    // Debounce function to limit search frequency
    let searchTimeout;
    const debounceSearch = (callback, delay = 300) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(callback, delay);
    };

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();

        debounceSearch(() => {
            if (!window.officerVotersData || !window.officerBallotStatus) return;

            let filteredVoters = window.officerVotersData;

            if (searchTerm) {
                filteredVoters = window.officerVotersData.filter(voter => {
                    const name = (voter.name || '').toLowerCase();
                    const idNumber = (voter.idNumber || '').toLowerCase();
                    const address = (voter.permanentAddress || '').toLowerCase();
                    const agentName = (voter.agentName || '').toLowerCase();

                    return name.includes(searchTerm) ||
                        idNumber.includes(searchTerm) ||
                        address.includes(searchTerm) ||
                        agentName.includes(searchTerm);
                });
            }

            // Re-render table with filtered results
            renderOfficerBallotTable(filteredVoters, window.officerBallotStatus);
        });
    });

    // Clear search on Escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            if (window.officerVotersData && window.officerBallotStatus) {
                renderOfficerBallotTable(window.officerVotersData, window.officerBallotStatus);
            }
        }
    });
}

// Mark voter as voted (no authentication required for officers)
window.markVoterAsVoted = async (voterId) => {
    const database = window.db || db;
    if (!database) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            updateDoc,
            getDoc,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const voterRef = doc(database, 'voters', voterId);
        const voterSnap = await getDoc(voterRef);

        if (!voterSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Voter not found.', 'Error');
            }
            return;
        }

        // Update voter as voted
        await updateDoc(voterRef, {
            voted: true,
            votedAt: serverTimestamp()
        });

        if (window.showSuccess) {
            window.showSuccess('Voter marked as voted successfully!', 'Success');
        }

        // Clear ballot statistics cache since voter status changed
        clearBallotStatsCache();

        // Update the voter in stored data
        if (window.officerVotersData) {
            const voterIndex = window.officerVotersData.findIndex(v => v.id === voterId);
            if (voterIndex !== -1) {
                window.officerVotersData[voterIndex].voted = true;
                window.officerVotersData[voterIndex].votedAt = new Date();
            }
        }

        // Reload the table (preserve search filter)
        const searchInput = document.getElementById('officer-voter-search');
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

        if (window.officerVotersData && window.officerBallotStatus) {
            let votersToRender = window.officerVotersData;

            // Apply search filter if active
            if (searchTerm) {
                votersToRender = window.officerVotersData.filter(voter => {
                    const name = (voter.name || '').toLowerCase();
                    const idNumber = (voter.idNumber || '').toLowerCase();
                    const address = (voter.permanentAddress || '').toLowerCase();
                    const agentName = (voter.agentName || '').toLowerCase();

                    return name.includes(searchTerm) ||
                        idNumber.includes(searchTerm) ||
                        address.includes(searchTerm) ||
                        agentName.includes(searchTerm);
                });
            }

            renderOfficerBallotTable(votersToRender, window.officerBallotStatus);
        } else {
            // Fallback: reload from Firebase if data not stored
            const urlParams = new URLSearchParams(window.location.search);
            const ballotId = urlParams.get('ballot');
            if (ballotId && window.loadOfficerBallotView) {
                const database = window.db || db;
                if (database) {
                    const {
                        doc: docFn,
                        getDoc: getDocFn
                    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const ballotRef = docFn(database, 'ballots', ballotId);
                    const ballotSnap = await getDocFn(ballotRef);
                    if (ballotSnap.exists()) {
                        await window.loadOfficerBallotView(ballotId, ballotSnap.data());
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error marking voter as voted:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to mark voter as voted. Please try again.', 'Error');
        }
    }
};

// Update officer ballot status UI
window.updateOfficerBallotStatus = (status) => {
    const subtitleEl = document.getElementById('officer-ballot-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }

    // Re-render table with updated status
    const urlParams = new URLSearchParams(window.location.search);
    const ballotId = urlParams.get('ballot');
    if (ballotId && window.loadOfficerBallotView) {
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js').then(({
            doc,
            getDoc
        }) => {
            const ballotRef = doc(window.db, 'ballots', ballotId);
            getDoc(ballotRef).then(snapshot => {
                if (snapshot.exists()) {
                    window.loadOfficerBallotView(ballotId, snapshot.data());
                }
            });
        });
    }
};

// Show ballot status notification
window.showBallotStatusNotification = (status) => {
    const notificationCenter = document.getElementById('officer-notification-center');
    const notificationsList = document.getElementById('officer-notifications-list');

    if (!notificationCenter || !notificationsList) return;

    // Only show notifications for open/close status changes
    if (status !== 'open' && status !== 'close') {
        notificationCenter.style.display = 'none';
        return;
    }

    notificationCenter.style.display = 'block';

    const statusText = status === 'open' ? 'Open' : 'Closed';
    const statusColor = status === 'open' ? 'var(--success-color)' : 'var(--warning-color)';
    const message = status === 'open' ?
        'Ballot is now open. You can mark voters as voted.' :
        'Ballot is now closed. Actions are disabled.';

    const notification = document.createElement('div');
    notification.style.cssText = `
        padding: 15px;
        background: ${status === 'open' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(217, 119, 6, 0.1)'};
        border-left: 4px solid ${statusColor};
        border-radius: 8px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    notification.innerHTML = `
        <div style="flex: 1;">
            <strong style="color: ${statusColor};">Ballot Status: ${statusText}</strong>
            <p style="margin: 5px 0 0 0; color: var(--text-color);">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: var(--text-light); font-size: 20px; padding: 0 5px;">&times;</button>
    `;

    // Clear existing notifications and add new one
    notificationsList.innerHTML = '';
    notificationsList.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
            // Hide notification center if empty
            if (notificationsList.children.length === 0) {
                notificationCenter.style.display = 'none';
            }
        }
    }, 10000);
};

window.loadZeroDayData = loadZeroDayData;
window.loadBallotsData = loadBallotsData;
window.loadTransportationData = loadTransportationData;
window.loadTransportationByType = loadTransportationByType;
window.updateZeroDayMenuVisibility = updateZeroDayMenuVisibility;
window.syncPendingBallots = syncPendingBallots;
window.syncPendingTransportation = syncPendingTransportation;
// Edit ballot
window.editBallot = async (id) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const ballotRef = doc(window.db, 'ballots', id);
        const ballotSnap = await getDoc(ballotRef);

        if (!ballotSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Ballot not found.', 'Error');
            }
            return;
        }

        const data = ballotSnap.data();

        // Verify the ballot belongs to the current user
        if (data.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to edit this ballot.', 'Access Denied');
            }
            return;
        }

        // Open ballot form modal with pre-filled data
        if (window.openModal) {
            window.openModal('ballot', id);

            // Wait for modal to render, then populate form
            setTimeout(() => {
                const form = document.getElementById('modal-form');
                if (form) {
                    form.dataset.editBallotId = id;
                }

                // Populate form fields
                const ballotNumberField = document.getElementById('ballot-number');
                const locationField = document.getElementById('ballot-location');
                const expectedVotersField = document.getElementById('ballot-expected-voters');
                const statusField = document.getElementById('ballot-status');
                const notesField = document.getElementById('ballot-notes');

                if (ballotNumberField) ballotNumberField.value = data.ballotNumber || '';
                if (locationField) locationField.value = data.location || '';
                if (expectedVotersField) expectedVotersField.value = data.expectedVoters || '';
                if (statusField) statusField.value = data.status || 'open';
                if (notesField) notesField.value = data.notes || '';

                // Update modal title
                const modalTitle = document.getElementById('modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'Edit Ballot';
                }

                // Update submit button text
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Update Ballot';
                }
            }, 200);
        }
    } catch (error) {
        console.error('Error loading ballot for edit:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load ballot. Please try again.', 'Error');
        }
    }
};

// Delete ballot
window.deleteBallot = async (id) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to delete this ballot? This action cannot be undone.',
            'Delete Ballot'
        );
        if (!confirmed) return;
    } else {
        if (!confirm('Are you sure you want to delete this ballot? This action cannot be undone.')) {
            return;
        }
    }

    try {
        const {
            doc,
            deleteDoc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify ballot exists and belongs to user
        const ballotRef = doc(window.db, 'ballots', id);
        const ballotSnap = await getDoc(ballotRef);

        if (!ballotSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Ballot not found.', 'Error');
            }
            return;
        }

        const data = ballotSnap.data();
        if (data.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this ballot.', 'Access Denied');
            }
            return;
        }

        // Delete the ballot
        await deleteDoc(ballotRef);

        if (window.showSuccess) {
            window.showSuccess('Ballot deleted successfully!', 'Success');
        }

        // Reload table
        if (window.loadBallotsData) {
            window.loadBallotsData(true);
        }
    } catch (error) {
        console.error('Error deleting ballot:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete ballot. Please try again.', 'Error');
        }
    }
};

// View assigned voters for a ballot
window.viewBallotVoters = async (ballotId, ballotNumber) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs,
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get ballot data
        const ballotRef = doc(window.db, 'ballots', ballotId);
        const ballotSnap = await getDoc(ballotRef);

        if (!ballotSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Ballot not found.', 'Error');
            }
            return;
        }

        const ballotData = ballotSnap.data();
        const ballotNum = ballotNumber || ballotData.ballotNumber || 'N/A';

        // Fetch voters assigned to this ballot
        const votersQuery = query(
            collection(window.db, 'voters'),
            where('email', '==', window.userEmail),
            where('ballot', '==', ballotNum)
        );

        const votersSnapshot = await getDocs(votersQuery);
        const voters = [];

        votersSnapshot.docs.forEach(doc => {
            const voterData = doc.data();
            voters.push({
                id: doc.id,
                name: voterData.name || 'N/A',
                idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                permanentAddress: voterData.permanentAddress || voterData.address || 'N/A',
                agentName: voterData.agentName || 'N/A',
                voted: voterData.voted || false,
                votedAt: voterData.votedAt || null,
                pledge: voterData.pledge || null
            });
        });

        // Show modal with voters list
        showBallotVotersModal(ballotNum, ballotData.location || 'N/A', voters, ballotData.status || 'open');
    } catch (error) {
        console.error('Error loading ballot voters:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load assigned voters. Please try again.', 'Error');
        }
    }
};

// Switch ballot tab
window.switchBallotTab = function(tab) {
    console.log('[switchBallotTab] Switching to tab:', tab);
    // Update tab buttons
    document.querySelectorAll('.ballot-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.ballotTab === tab) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    const listTab = document.getElementById('ballot-list-tab');
    const statsTab = document.getElementById('ballot-statistics-tab');

    if (tab === 'list') {
        if (listTab) {
            listTab.classList.add('active');
            listTab.style.display = 'block';
        }
        if (statsTab) {
            statsTab.classList.remove('active');
            statsTab.style.display = 'none';
        }
    } else if (tab === 'statistics') {
        if (listTab) {
            listTab.classList.remove('active');
            listTab.style.display = 'none';
        }
        if (statsTab) {
            statsTab.classList.add('active');
            statsTab.style.display = 'block';
            console.log('[switchBallotTab] Loading statistics for all ballots...');
            // Load statistics for all ballots (will use cache if available)
            loadAllBallotsStatistics(false);
        }
    }
};

// View ballot statistics
window.viewBallotStatistics = async function(ballotId, ballotNumber) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        // Switch to statistics tab
        switchBallotTab('statistics');

        // Load statistics for this specific ballot
        await loadBallotStatistics(ballotId, ballotNumber);
    } catch (error) {
        console.error('Error loading ballot statistics:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load ballot statistics. Please try again.', 'Error');
        }
    }
};

// Load statistics for a specific ballot
async function loadBallotStatistics(ballotId, ballotNumber) {
    if (!window.db || !window.userEmail) return;

    const statsContent = document.getElementById('ballot-statistics-content');
    if (!statsContent) return;

    statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);"><p>Loading statistics...</p></div>';

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get ballot data
        const ballotRef = doc(window.db, 'ballots', ballotId);
        const ballotSnap = await getDoc(ballotRef);

        if (!ballotSnap.exists()) {
            statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);"><p>Ballot not found</p></div>';
            return;
        }

        const ballotData = ballotSnap.data();
        const ballotNum = ballotNumber || ballotData.ballotNumber || 'N/A';

        // Calculate statistics using helper function
        const stats = await calculateBallotStatistics(ballotId, ballotNum);

        if (!stats) {
            statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);"><p>Error calculating statistics</p></div>';
            return;
        }

        // Render statistics
        renderBallotStatistics(ballotNum, ballotData.location || 'N/A', stats);
    } catch (error) {
        console.error('Error loading ballot statistics:', error);
        statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);"><p>Error loading statistics. Please try again.</p></div>';
    }
}

// Initialize ballot statistics cache
if (!window.ballotStatsCache) {
    window.ballotStatsCache = {
        data: null,
        lastFetch: null,
        cacheDuration: 60000, // 1 minute cache
        userEmail: null
    };
}

// Clear ballot statistics cache (call when voters are marked as voted or ballots are updated)
function clearBallotStatsCache() {
    if (window.ballotStatsCache) {
        window.ballotStatsCache.data = null;
        window.ballotStatsCache.lastFetch = null;
        console.log('[clearBallotStatsCache] Ballot statistics cache cleared');
    }
}

// Make function globally available
window.clearBallotStatsCache = clearBallotStatsCache;

// Load statistics for all ballots
async function loadAllBallotsStatistics(forceRefresh = false) {
    const statsContent = document.getElementById('ballot-statistics-content');
    if (!statsContent) return;

    // Check cache first (unless forced refresh)
    const now = Date.now();
    if (!forceRefresh &&
        window.ballotStatsCache.data &&
        window.ballotStatsCache.lastFetch &&
        window.ballotStatsCache.userEmail === window.userEmail &&
        (now - window.ballotStatsCache.lastFetch) < window.ballotStatsCache.cacheDuration) {
        console.log('[loadAllBallotsStatistics] Using cached statistics');
        renderAllBallotsStatistics(window.ballotStatsCache.data);
        return;
    }

    statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);"><p>Loading statistics...</p></div>';

    if (!window.db || !window.userEmail) {
        statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);"><p>Database not initialized</p></div>';
        return;
    }

    try {
        const {
            collection,
            query,
            where,
            orderBy,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get all ballots - try both email and campaignEmail fields
        let ballots = [];
        let ballotsSnapshot;

        // Try querying by 'email' field first
        try {
            const ballotsQuery = query(
                collection(window.db, 'ballots'),
                where('email', '==', window.userEmail),
                orderBy('ballotNumber', 'asc')
            );
            ballotsSnapshot = await getDocs(ballotsQuery);
            ballotsSnapshot.docs.forEach(doc => {
                const ballotData = doc.data();
                if (ballotData.email === window.userEmail || ballotData.campaignEmail === window.userEmail) {
                    ballots.push({
                        id: doc.id,
                        ...ballotData
                    });
                }
            });
            console.log(`[loadAllBallotsStatistics] Query by 'email' returned ${ballots.length} ballots`);
        } catch (emailError) {
            console.warn('[loadAllBallotsStatistics] Query by email failed:', emailError);
        }

        // If no results, try querying by 'campaignEmail' field
        if (ballots.length === 0) {
            try {
                const campaignBallotsQuery = query(
                    collection(window.db, 'ballots'),
                    where('campaignEmail', '==', window.userEmail),
                    orderBy('ballotNumber', 'asc')
                );
                ballotsSnapshot = await getDocs(campaignBallotsQuery);
                ballotsSnapshot.docs.forEach(doc => {
                    const ballotData = doc.data();
                    if (ballotData.email === window.userEmail || ballotData.campaignEmail === window.userEmail) {
                        ballots.push({
                            id: doc.id,
                            ...ballotData
                        });
                    }
                });
                console.log(`[loadAllBallotsStatistics] Query by 'campaignEmail' returned ${ballots.length} ballots`);
            } catch (campaignError) {
                console.warn('[loadAllBallotsStatistics] Query by campaignEmail failed:', campaignError);
            }
        }

        // If still no results, try without orderBy (in case orderBy field doesn't exist)
        if (ballots.length === 0) {
            try {
                const simpleQuery = query(
                    collection(window.db, 'ballots'),
                    where('email', '==', window.userEmail)
                );
                ballotsSnapshot = await getDocs(simpleQuery);
                ballotsSnapshot.docs.forEach(doc => {
                    const ballotData = doc.data();
                    if (ballotData.email === window.userEmail || ballotData.campaignEmail === window.userEmail) {
                        ballots.push({
                            id: doc.id,
                            ...ballotData
                        });
                    }
                });
                // Sort client-side
                ballots.sort((a, b) => {
                    const aNum = a.ballotNumber || '';
                    const bNum = b.ballotNumber || '';
                    return aNum.localeCompare(bNum, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
                console.log(`[loadAllBallotsStatistics] Query without orderBy returned ${ballots.length} ballots`);
            } catch (simpleError) {
                console.warn('[loadAllBallotsStatistics] Simple query failed:', simpleError);
            }
        }

        if (ballots.length === 0) {
            console.log('[loadAllBallotsStatistics] No ballots found for user:', window.userEmail);
            statsContent.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <p>No ballots found. Add ballots to view statistics.</p>
                    <p style="font-size: 12px; margin-top: 8px; color: var(--text-light);">User email: ${window.userEmail || 'Not set'}</p>
                </div>
            `;
            return;
        }

        console.log(`[loadAllBallotsStatistics] Found ${ballots.length} ballots, calculating statistics...`);

        // Load statistics for each ballot
        const allStats = [];
        for (const ballot of ballots) {
            console.log(`[loadAllBallotsStatistics] Calculating stats for ballot ${ballot.ballotNumber || ballot.id}...`);
            const stats = await calculateBallotStatistics(ballot.id, ballot.ballotNumber || 'N/A');
            if (stats) {
                allStats.push({
                    ballotId: ballot.id,
                    ballotNumber: ballot.ballotNumber || 'N/A',
                    location: ballot.location || 'N/A',
                    ...stats
                });
                console.log(`[loadAllBallotsStatistics] Stats for ballot ${ballot.ballotNumber}:`, stats);
            } else {
                console.warn(`[loadAllBallotsStatistics] Failed to calculate stats for ballot ${ballot.ballotNumber || ballot.id}`);
            }
        }

        console.log(`[loadAllBallotsStatistics] Total stats calculated: ${allStats.length}`);

        // Cache the statistics
        window.ballotStatsCache.data = allStats;
        window.ballotStatsCache.lastFetch = Date.now();
        window.ballotStatsCache.userEmail = window.userEmail;
        console.log('[loadAllBallotsStatistics] Statistics cached');

        // Render all statistics
        if (allStats.length > 0) {
            renderAllBallotsStatistics(allStats);
        } else {
            statsContent.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--warning-color);">
                    <p>No statistics available. No voters found for the selected ballots.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading all ballots statistics:', error);
        // Try to use cached data if available
        if (window.ballotStatsCache.data && window.ballotStatsCache.data.length > 0) {
            console.log('[loadAllBallotsStatistics] Using cached data due to error');
            renderAllBallotsStatistics(window.ballotStatsCache.data);
        } else {
            statsContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);"><p>Error loading statistics. Please try again.</p></div>';
        }
    }
}

// Calculate statistics for a ballot (helper function)
async function calculateBallotStatistics(ballotId, ballotNumber) {
    if (!window.db || !window.userEmail) return null;

    try {
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch voters assigned to this ballot
        // Try querying by 'email' field first with 'ballot' field
        let votersSnapshot;
        let voters = [];

        try {
            const votersQuery = query(
                collection(window.db, 'voters'),
                where('email', '==', window.userEmail),
                where('ballot', '==', ballotNumber)
            );
            votersSnapshot = await getDocs(votersQuery);
            votersSnapshot.docs.forEach(doc => {
                const voterData = doc.data();
                if (voterData.email === window.userEmail || voterData.campaignEmail === window.userEmail) {
                    voters.push({
                        id: doc.id,
                        name: voterData.name || 'N/A',
                        idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                        permanentAddress: voterData.permanentAddress || voterData.address || 'N/A',
                        agentName: voterData.agentName || 'N/A',
                        voted: voterData.voted || false,
                        votedAt: voterData.votedAt || null,
                        pledge: voterData.pledge || null
                    });
                }
            });
            console.log(`[calculateBallotStatistics] Query by 'email' + 'ballot' returned ${voters.length} voters`);
        } catch (emailError) {
            console.warn('[calculateBallotStatistics] Query by email + ballot failed:', emailError);
        }

        // If no results, try querying by 'campaignEmail' field
        if (voters.length === 0) {
            try {
                const campaignVotersQuery = query(
                    collection(window.db, 'voters'),
                    where('campaignEmail', '==', window.userEmail),
                    where('ballot', '==', ballotNumber)
                );
                const campaignSnapshot = await getDocs(campaignVotersQuery);
                campaignSnapshot.docs.forEach(doc => {
                    const voterData = doc.data();
                    if (voterData.email === window.userEmail || voterData.campaignEmail === window.userEmail) {
                        voters.push({
                            id: doc.id,
                            name: voterData.name || 'N/A',
                            idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                            permanentAddress: voterData.permanentAddress || voterData.address || 'N/A',
                            agentName: voterData.agentName || 'N/A',
                            voted: voterData.voted || false,
                            votedAt: voterData.votedAt || null,
                            pledge: voterData.pledge || null
                        });
                    }
                });
                console.log(`[calculateBallotStatistics] Query by 'campaignEmail' + 'ballot' returned ${voters.length} voters`);
            } catch (campaignError) {
                console.warn('[calculateBallotStatistics] Query by campaignEmail + ballot failed:', campaignError);
            }
        }

        // If still no results, try querying by 'ballotBox' field instead of 'ballot'
        if (voters.length === 0) {
            try {
                const ballotBoxQuery = query(
                    collection(window.db, 'voters'),
                    where('email', '==', window.userEmail),
                    where('ballotBox', '==', ballotNumber)
                );
                const ballotBoxSnapshot = await getDocs(ballotBoxQuery);
                ballotBoxSnapshot.docs.forEach(doc => {
                    const voterData = doc.data();
                    if (voterData.email === window.userEmail || voterData.campaignEmail === window.userEmail) {
                        voters.push({
                            id: doc.id,
                            name: voterData.name || 'N/A',
                            idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                            permanentAddress: voterData.permanentAddress || voterData.address || 'N/A',
                            agentName: voterData.agentName || 'N/A',
                            voted: voterData.voted || false,
                            votedAt: voterData.votedAt || null,
                            pledge: voterData.pledge || null
                        });
                    }
                });
                console.log(`[calculateBallotStatistics] Query by 'email' + 'ballotBox' returned ${voters.length} voters`);
            } catch (ballotBoxError) {
                console.warn('[calculateBallotStatistics] Query by email + ballotBox failed:', ballotBoxError);
            }
        }

        // Fallback: Load all voters and filter client-side
        if (voters.length === 0) {
            console.log('[calculateBallotStatistics] No results from queries, trying fallback: loading all voters and filtering client-side');
            try {
                // Query by email first
                let allVotersQuery = query(
                    collection(window.db, 'voters'),
                    where('email', '==', window.userEmail)
                );
                let allSnapshot = await getDocs(allVotersQuery);

                // If no results, try campaignEmail
                if (allSnapshot.docs.length === 0) {
                    allVotersQuery = query(
                        collection(window.db, 'voters'),
                        where('campaignEmail', '==', window.userEmail)
                    );
                    allSnapshot = await getDocs(allVotersQuery);
                }

                // Filter client-side by ballot number (check both 'ballot' and 'ballotBox' fields)
                allSnapshot.docs.forEach(doc => {
                    const voterData = doc.data();
                    const matchesEmail = voterData.email === window.userEmail || voterData.campaignEmail === window.userEmail;
                    const matchesBallot = voterData.ballot === ballotNumber ||
                        voterData.ballotBox === ballotNumber ||
                        voterData.ballotNumber === ballotNumber;

                    if (matchesEmail && matchesBallot) {
                        voters.push({
                            id: doc.id,
                            name: voterData.name || 'N/A',
                            idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                            permanentAddress: voterData.permanentAddress || voterData.address || 'N/A',
                            agentName: voterData.agentName || 'N/A',
                            voted: voterData.voted || false,
                            votedAt: voterData.votedAt || null,
                            pledge: voterData.pledge || null
                        });
                    }
                });
                console.log(`[calculateBallotStatistics] After client-side filtering: ${voters.length} voters match`);
            } catch (fallbackError) {
                console.error('[calculateBallotStatistics] Fallback query failed:', fallbackError);
            }
        }

        // Calculate statistics
        const totalVoters = voters.length;
        const votedVoters = voters.filter(v => v.voted === true).length;
        const voterTurnout = totalVoters > 0 ? ((votedVoters / totalVoters) * 100).toFixed(1) : 0;

        // Pledge voters statistics
        const pledgeVoters = voters.filter(v => v.pledge === 'yes' || v.pledge === 'Yes');
        const pledgeVotersCount = pledgeVoters.length;
        const pledgeVotersVoted = pledgeVoters.filter(v => v.voted === true).length;
        const pledgeTurnout = pledgeVotersCount > 0 ? ((pledgeVotersVoted / pledgeVotersCount) * 100).toFixed(1) : 0;

        // Non-voted voters
        const nonVotedVoters = voters.filter(v => !v.voted || v.voted === false);

        return {
            totalVoters,
            votedVoters,
            voterTurnout,
            pledgeVotersCount,
            pledgeVotersVoted,
            pledgeTurnout,
            nonVotedVoters
        };
    } catch (error) {
        console.error('Error calculating ballot statistics:', error);
        return null;
    }
}

// Render statistics for all ballots
function renderAllBallotsStatistics(allStats) {
    const statsContent = document.getElementById('ballot-statistics-content');
    if (!statsContent) return;

    if (allStats.length === 0) {
        statsContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <p>No statistics available</p>
            </div>
        `;
        return;
    }

    // Calculate overall totals
    const overallTotal = allStats.reduce((sum, s) => sum + s.totalVoters, 0);
    const overallVoted = allStats.reduce((sum, s) => sum + s.votedVoters, 0);
    const overallTurnout = overallTotal > 0 ? ((overallVoted / overallTotal) * 100).toFixed(1) : 0;
    const overallPledgeCount = allStats.reduce((sum, s) => sum + s.pledgeVotersCount, 0);
    const overallPledgeVoted = allStats.reduce((sum, s) => sum + s.pledgeVotersVoted, 0);
    const overallPledgeTurnout = overallPledgeCount > 0 ? ((overallPledgeVoted / overallPledgeCount) * 100).toFixed(1) : 0;

    statsContent.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: var(--text-color); font-size: 20px; font-weight: 700;">Overall Statistics</h3>
            <p style="color: var(--text-light); margin: 0; font-size: 14px;">Summary across all ballots</p>
        </div>

        <!-- Overall Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Total Voters</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--text-color);">${overallTotal}</h3>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(5, 150, 105, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Voted Voters</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--success-color);">${overallVoted}</h3>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(111, 193, 218, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Overall Turnout</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--primary-color);">${overallTurnout}%</h3>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Pledge Turnout</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--warning-color);">${overallPledgeTurnout}%</h3>
                        <p style="font-size: 11px; color: var(--text-light); margin: 4px 0 0 0;">${overallPledgeVoted}/${overallPledgeCount} voted</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Individual Ballot Statistics -->
        <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: var(--text-color); font-size: 18px; font-weight: 600;">Ballot Statistics</h3>
        </div>

        <div style="display: grid; gap: 16px;">
            ${allStats.map(stat => `
                <div style="background: white; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
                    <div style="padding: 20px; border-bottom: 1px solid var(--border-color); background: var(--light-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: var(--text-color);">Ballot ${stat.ballotNumber} - ${stat.location}</h4>
                                <p style="margin: 0; font-size: 12px; color: var(--text-light);">${stat.totalVoters} total voters</p>
                            </div>
                            <button class="btn-primary btn-compact" onclick="viewBallotStatistics('${stat.ballotId}', '${stat.ballotNumber}')" style="font-size: 12px; padding: 8px 16px;">
                                View Details
                            </button>
                        </div>
                    </div>
                    <div style="padding: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                            <div>
                                <p style="font-size: 11px; color: var(--text-light); margin: 0 0 4px 0;">Voter Turnout</p>
                                <h4 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--primary-color);">${stat.voterTurnout}%</h4>
                                <p style="font-size: 11px; color: var(--text-light); margin: 4px 0 0 0;">${stat.votedVoters}/${stat.totalVoters} voted</p>
                            </div>
                            <div>
                                <p style="font-size: 11px; color: var(--text-light); margin: 0 0 4px 0;">Pledge Turnout</p>
                                <h4 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--warning-color);">${stat.pledgeTurnout}%</h4>
                                <p style="font-size: 11px; color: var(--text-light); margin: 4px 0 0 0;">${stat.pledgeVotersVoted}/${stat.pledgeVotersCount} voted</p>
                            </div>
                            <div>
                                <p style="font-size: 11px; color: var(--text-light); margin: 0 0 4px 0;">Not Voted</p>
                                <h4 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--danger-color);">${stat.nonVotedVoters.length}</h4>
                                <p style="font-size: 11px; color: var(--text-light); margin: 4px 0 0 0;">Remaining voters</p>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render ballot statistics
function renderBallotStatistics(ballotNumber, location, stats) {
    const statsContent = document.getElementById('ballot-statistics-content');
    if (!statsContent) return;

    const {
        totalVoters,
        votedVoters,
        voterTurnout,
        pledgeVotersCount,
        pledgeVotersVoted,
        pledgeTurnout,
        nonVotedVoters
    } = stats;

    statsContent.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: var(--text-color); font-size: 20px; font-weight: 700;">Ballot ${ballotNumber} - ${location}</h3>
            <p style="color: var(--text-light); margin: 0; font-size: 14px;">Voter turnout and pledge statistics</p>
        </div>

        <!-- Statistics Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Total Voters</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--text-color);">${totalVoters}</h3>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(5, 150, 105, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Voted Voters</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--success-color);">${votedVoters}</h3>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(111, 193, 218, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Voter Turnout</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--primary-color);">${voterTurnout}%</h3>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-light); font-weight: 500; margin: 0;">Pledge Voters Turnout</p>
                        <h3 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: var(--warning-color);">${pledgeTurnout}%</h3>
                        <p style="font-size: 11px; color: var(--text-light); margin: 4px 0 0 0;">${pledgeVotersVoted}/${pledgeVotersCount} voted</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Non-Voted Voters Table -->
        <div style="background: white; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color); display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Non-Voted Voters (${nonVotedVoters.length})
                </h4>
            </div>
            <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                ${nonVotedVoters.length === 0 ? 
                    '<div style="text-align: center; padding: 40px; color: var(--text-light);"><p>All voters have voted!</p></div>' :
                    `<table class="data-table" style="margin: 0;">
                        <thead style="position: sticky; top: 0; background: white; z-index: 10;">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>ID Number</th>
                                <th>Address</th>
                                <th>Agent</th>
                                <th>Pledge</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${nonVotedVoters.map((voter, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td><strong>${voter.name}</strong></td>
                                    <td>${voter.idNumber}</td>
                                    <td>${voter.permanentAddress}</td>
                                    <td>${voter.agentName}</td>
                                    <td>
                                        ${voter.pledge === 'yes' || voter.pledge === 'Yes' ? 
                                            '<span class="status-badge status-active">Yes</span>' : 
                                            voter.pledge === 'no' || voter.pledge === 'No' ? 
                                            '<span class="status-badge" style="background: rgba(220, 38, 38, 0.1); color: var(--danger-color);">No</span>' : 
                                            '<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color);">Undecided</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`
                }
            </div>
        </div>
    `;
}

// Show modal with ballot voters list
function showBallotVotersModal(ballotNumber, location, voters, ballotStatus) {
    const modalOverlay = document.getElementById('modal-overlay') || createModalOverlay();
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    if (!modalBody || !modalTitle) return;

    modalTitle.textContent = `Assigned Voters - Ballot ${ballotNumber}`;

    const votersList = voters.map((voter, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${voter.name}</td>
            <td>${voter.idNumber}</td>
            <td>${voter.permanentAddress}</td>
            <td>${voter.agentName}</td>
            <td>${voter.voted ? '<span class="status-badge status-active">Voted</span>' : '<span class="status-badge status-pending">Not Voted</span>'}</td>
        </tr>
    `).join('');

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Total Voters:</strong> ${voters.length}</p>
            <p><strong>Status:</strong> <span class="status-badge ${ballotStatus === 'open' ? 'status-active' : 'status-pending'}">${ballotStatus.charAt(0).toUpperCase() + ballotStatus.slice(1)}</span></p>
        </div>
        <div class="table-container" style="max-height: 400px; overflow-y: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>ID Number</th>
                        <th>Permanent Address</th>
                        <th>Agent</th>
                        <th>Voted</th>
                    </tr>
                </thead>
                <tbody>
                    ${voters.length > 0 ? votersList : '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">No voters assigned to this ballot</td></tr>'}
                </tbody>
            </table>
        </div>
        <div class="modal-footer" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn-secondary btn-compact" onclick="downloadBallotVotersList('${ballotNumber}', ${JSON.stringify(voters).replace(/"/g, '&quot;')})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download List
            </button>
            <button class="btn-secondary btn-compact" onclick="closeModal()">Close</button>
        </div>
    `;

    modalOverlay.style.display = 'flex';
}

// Download ballot voters list as CSV
window.downloadBallotVotersList = (ballotNumber, voters) => {
    if (!voters || voters.length === 0) {
        if (window.showErrorDialog) {
            window.showErrorDialog('No voters to download.', 'Info');
        }
        return;
    }

    // Prepare CSV content
    const headers = ['No.', 'Name', 'ID Number', 'Permanent Address', 'Agent', 'Voted'];
    const rows = voters.map((voter, index) => [
        index + 1,
        voter.name,
        voter.idNumber,
        voter.permanentAddress,
        voter.agentName,
        voter.voted ? 'Yes' : 'No'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Ballot_${ballotNumber}_Voters_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.showSuccess) {
        window.showSuccess('Voters list downloaded successfully!', 'Success');
    }
};

// Generate temporary password (6-8 alphanumeric characters)
function generateTemporaryPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters like 0, O, I, 1
    let password = '';
    const length = 6; // 6-character password
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Generate shareable link for ballot
window.generateBallotLink = async (ballotId, ballotNumber) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc,
            updateDoc,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get ballot data
        const ballotRef = doc(window.db, 'ballots', ballotId);
        const ballotSnap = await getDoc(ballotRef);

        if (!ballotSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Ballot not found.', 'Error');
            }
            return;
        }

        const ballotData = ballotSnap.data();

        // Generate unique token for the ballot link
        const token = 'ballot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Generate unique temporary password (already uppercase)
        const tempPassword = generateTemporaryPassword();

        // Update ballot with share token and temporary password (store in uppercase for consistency)
        await updateDoc(ballotRef, {
            shareToken: token,
            officerPassword: tempPassword.toUpperCase(), // Store the password in uppercase
            shareLinkGeneratedAt: serverTimestamp()
        });

        // Generate the shareable link
        const baseUrl = window.location.origin + window.location.pathname;
        const shareLink = `${baseUrl}?ballot=${ballotId}&token=${token}`;

        // Show modal with shareable link and password
        showBallotLinkModal(ballotNumber || ballotData.ballotNumber || 'N/A', shareLink, tempPassword);
    } catch (error) {
        console.error('Error generating ballot link:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to generate shareable link. Please try again.', 'Error');
        }
    }
};

// Show modal with shareable link
function showBallotLinkModal(ballotNumber, shareLink, tempPassword) {
    const modalOverlay = document.getElementById('modal-overlay') || createModalOverlay();
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    if (!modalBody || !modalTitle) return;

    modalTitle.textContent = `Shareable Link - Ballot ${ballotNumber}`;

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p style="color: var(--text-light); margin-bottom: 12px;">Share this link and password with voting center officers to allow them to view and manage the ballot list:</p>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-color);">Shareable Link:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="share-link-input" value="${shareLink}" readonly style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--light-color); font-family: monospace; font-size: 13px;">
                    <button class="btn-primary btn-compact" onclick="copyShareLink()" style="white-space: nowrap;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-color);">Temporary Password:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="temp-password-input" value="${tempPassword}" readonly style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--light-color); font-family: monospace; font-size: 16px; font-weight: 600; letter-spacing: 2px; text-align: center; color: var(--primary-color);">
                    <button class="btn-primary btn-compact" onclick="copyTempPassword()" style="white-space: nowrap;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy
                    </button>
                </div>
            </div>
            
            <div style="background: var(--warning-color); background: rgba(217, 119, 6, 0.1); border-left: 4px solid var(--warning-color); padding: 12px; border-radius: 8px; margin-top: 15px;">
                <p style="color: var(--text-color); font-size: 13px; margin: 0;">
                    <strong>Important:</strong> Share both the link and password with officers. They will need to enter this password to access the ballot list.
                </p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary btn-compact" onclick="closeModal()">Close</button>
        </div>
    `;

    modalOverlay.style.display = 'flex';
}

// Copy temporary password to clipboard
window.copyTempPassword = () => {
    const input = document.getElementById('temp-password-input');
    if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');

        if (window.showSuccess) {
            window.showSuccess('Password copied to clipboard!', 'Success');
        }
    }
};

// Copy share link to clipboard
window.copyShareLink = () => {
    const input = document.getElementById('share-link-input');
    if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');

        if (window.showSuccess) {
            window.showSuccess('Link copied to clipboard!', 'Success');
        }
    }
};

// Generate shareable link for transportation
window.generateTransportationLink = async (transportId, type, transportNumber) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc,
            updateDoc,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get transportation data
        const transportRef = doc(window.db, 'transportation', transportId);
        const transportSnap = await getDoc(transportRef);

        if (!transportSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Transportation record not found.', 'Error');
            }
            return;
        }

        const transportData = transportSnap.data();

        // Generate unique token for the transportation link
        const token = 'transport_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Update transportation with share token
        await updateDoc(transportRef, {
            shareToken: token,
            shareLinkGeneratedAt: serverTimestamp()
        });

        // Generate the shareable link
        const baseUrl = window.location.origin + window.location.pathname;
        const shareLink = `${baseUrl}?transport=${transportId}&token=${token}&type=${type}`;

        // Show modal with shareable link
        const typeName = type === 'flights' ? 'Flight' : type === 'speedboats' ? 'Speed Boat' : 'Taxi';
        showTransportationLinkModal(typeName, transportNumber || 'N/A', shareLink);
    } catch (error) {
        console.error('Error generating transportation link:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to generate shareable link. Please try again.', 'Error');
        }
    }
};

// Show modal with transportation shareable link
function showTransportationLinkModal(typeName, transportNumber, shareLink) {
    const modalOverlay = document.getElementById('modal-overlay') || createModalOverlay();
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    if (!modalBody || !modalTitle) return;

    modalTitle.textContent = `Shareable Link - ${typeName} ${transportNumber}`;

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p style="color: var(--text-light); margin-bottom: 12px;">Share this link with authorized personnel to allow them to view transportation details:</p>
            <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="share-link-input" value="${shareLink}" readonly style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--light-color); font-family: monospace; font-size: 13px;">
                <button class="btn-primary btn-compact" onclick="copyShareLink()" style="white-space: nowrap;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy
                </button>
            </div>
            <p style="color: var(--text-light); font-size: 12px; margin-top: 8px;">
                <strong>Note:</strong> Authorized personnel must be authenticated to access this link.
            </p>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary btn-compact" onclick="closeModal()">Close</button>
        </div>
    `;

    modalOverlay.style.display = 'flex';
}

// Create modal overlay if it doesn't exist
function createModalOverlay() {
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-container" id="modal-container">
                <div class="modal-header">
                    <h2 id="modal-title">Modal Title</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="modal-maximize" id="modal-maximize-btn" title="Maximize" onclick="if (typeof toggleModalMaximize === 'function') { const container = this.closest('.modal-container'); toggleModalMaximize(container, this); }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                        </button>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                </div>
                <div id="modal-body" class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    return overlay;
}

// Edit transportation
window.editTransportation = async (id, type) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const transportRef = doc(window.db, 'transportation', id);
        const transportSnap = await getDoc(transportRef);

        if (!transportSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Transportation record not found.', 'Error');
            }
            return;
        }

        const data = transportSnap.data();

        // Verify the record belongs to the current user
        if (data.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to edit this record.', 'Access Denied');
            }
            return;
        }

        // Open transportation form modal with pre-filled data
        if (window.openModal) {
            window.openModal('transportation', id);

            // Wait for modal to render, then populate form
            setTimeout(() => {
                const form = document.getElementById('modal-form');
                if (form) {
                    form.dataset.editTransportationId = id;
                }

                // Switch to the correct tab based on type
                const tabBtns = document.querySelectorAll('.transportation-tab-btn');
                tabBtns.forEach(btn => {
                    if (btn.getAttribute('data-transport-type') === type) {
                        btn.click();
                    }
                });

                // Populate form fields based on type
                if (type === 'flights') {
                    const flightNumberField = document.getElementById('transport-flight-number');
                    const routeField = document.getElementById('transport-route');
                    const departureTimeField = document.getElementById('transport-departure-time');
                    const arrivalTimeField = document.getElementById('transport-arrival-time');
                    const capacityField = document.getElementById('transport-capacity');
                    const statusField = document.getElementById('transport-status');
                    const notesField = document.getElementById('transport-notes');

                    if (flightNumberField) flightNumberField.value = data.flightNumber || data.number || '';
                    if (routeField) routeField.value = data.route || '';
                    if (departureTimeField) departureTimeField.value = data.departureTime || '';
                    if (arrivalTimeField) arrivalTimeField.value = data.arrivalTime || '';
                    if (capacityField) capacityField.value = data.capacity || '';
                    if (statusField) statusField.value = data.status || 'pending';
                    if (notesField) notesField.value = data.notes || '';
                } else if (type === 'speedboats') {
                    const boatNameField = document.getElementById('transport-boat-name');
                    const routeField = document.getElementById('transport-route-sb');
                    const departureTimeField = document.getElementById('transport-departure-time-sb');
                    const arrivalTimeField = document.getElementById('transport-arrival-time-sb');
                    const capacityField = document.getElementById('transport-capacity-sb');
                    const statusField = document.getElementById('transport-status-sb');
                    const notesField = document.getElementById('transport-notes-sb');

                    if (boatNameField) boatNameField.value = data.boatName || data.number || '';
                    if (routeField) routeField.value = data.route || '';
                    if (departureTimeField) departureTimeField.value = data.departureTime || '';
                    if (arrivalTimeField) arrivalTimeField.value = data.arrivalTime || '';
                    if (capacityField) capacityField.value = data.capacity || '';
                    if (statusField) statusField.value = data.status || 'pending';
                    if (notesField) notesField.value = data.notes || '';
                } else if (type === 'taxis') {
                    const taxiNumberField = document.getElementById('transport-taxi-number');
                    const driverNameField = document.getElementById('transport-driver-name');
                    const contactField = document.getElementById('transport-contact');
                    const routeField = document.getElementById('transport-route-taxi');
                    const capacityField = document.getElementById('transport-capacity-taxi');
                    const statusField = document.getElementById('transport-status-taxi');
                    const notesField = document.getElementById('transport-notes-taxi');

                    if (taxiNumberField) taxiNumberField.value = data.taxiNumber || data.number || '';
                    if (driverNameField) driverNameField.value = data.driverName || '';
                    if (contactField) contactField.value = data.contact || '';
                    if (routeField) routeField.value = data.route || data.area || '';
                    if (capacityField) capacityField.value = data.capacity || '';
                    if (statusField) statusField.value = data.status || 'pending';
                    if (notesField) notesField.value = data.notes || '';
                }

                // Update modal title
                const modalTitle = document.getElementById('modal-title');
                if (modalTitle) {
                    const typeName = type === 'flights' ? 'Flight' : type === 'speedboats' ? 'Speed Boat' : 'Taxi';
                    modalTitle.textContent = `Edit ${typeName}`;
                }

                // Update submit button text
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = `Update ${type === 'flights' ? 'Flight' : type === 'speedboats' ? 'Speed Boat' : 'Taxi'}`;
                }
            }, 300);
        }
    } catch (error) {
        console.error('Error loading transportation for edit:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load transportation record. Please try again.', 'Error');
        }
    }
};

// Delete transportation
window.deleteTransportation = async (id, type) => {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    const typeName = type === 'flights' ? 'flight' : type === 'speedboats' ? 'speed boat' : 'taxi';

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            `Are you sure you want to delete this ${typeName}? This action cannot be undone.`,
            `Delete ${typeName.charAt(0).toUpperCase() + typeName.slice(1)}`
        );
        if (!confirmed) return;
    } else {
        if (!confirm(`Are you sure you want to delete this ${typeName}? This action cannot be undone.`)) {
            return;
        }
    }

    try {
        const {
            doc,
            deleteDoc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify record exists and belongs to user
        const transportRef = doc(window.db, 'transportation', id);
        const transportSnap = await getDoc(transportRef);

        if (!transportSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Transportation record not found.', 'Error');
            }
            return;
        }

        const data = transportSnap.data();
        if (data.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this record.', 'Access Denied');
            }
            return;
        }

        // Delete the record
        await deleteDoc(transportRef);

        if (window.showSuccess) {
            window.showSuccess(`${typeName.charAt(0).toUpperCase() + typeName.slice(1)} deleted successfully!`, 'Success');
        }

        // Reload table
        if (window.loadTransportationByType) {
            window.loadTransportationByType(type, true);
        }
    } catch (error) {
        console.error('Error deleting transportation:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete record. Please try again.', 'Error');
        }
    }
};

// Setup transportation tab switching
document.addEventListener('DOMContentLoaded', function() {
    // Use event delegation for transportation tabs
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.transportation-tab-btn');
        if (tabBtn) {
            const transportType = tabBtn.getAttribute('data-transport-type');

            // Remove active class from all tabs
            document.querySelectorAll('.transportation-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked tab
            tabBtn.classList.add('active');

            // Hide all panels
            document.querySelectorAll('.transportation-panel').forEach(panel => {
                panel.style.display = 'none';
            });

            // Show selected panel
            const panel = document.querySelector(`.transportation-panel[data-panel="${transportType}"]`);
            if (panel) {
                panel.style.display = 'block';
            }
        }
    });

    // Setup add ballot button
    document.addEventListener('click', function(e) {
        if (e.target.closest('#add-ballot-btn')) {
            if (window.openModal) {
                window.openModal('ballot');
            }
        }

        if (e.target.closest('#add-transportation-btn')) {
            if (window.openModal) {
                window.openModal('transportation');
            }
        }
    });
});

function updateSettingsFields(data) {
    const campaignNameEl = document.getElementById('setting-campaign-name');
    const campaignTypeEl = document.getElementById('setting-campaign-type');
    const locationEl = document.getElementById('setting-location');
    const emailEl = document.getElementById('setting-email');
    const zeroDayToggle = document.getElementById('zero-day-toggle');

    if (campaignNameEl && data.campaignName) {
        campaignNameEl.textContent = data.campaignName;
    }

    if (campaignTypeEl && data.campaignType) {
        const typeMap = {
            'WDC': 'WDC and Local Council',
            'Parliament': 'Parliament',
            'Presidential': 'Presidential Election'
        };
        campaignTypeEl.textContent = typeMap[data.campaignType] || data.campaignType;
    }

    if (locationEl) {
        // Build location string from constituency and island (atoll removed)
        const locationParts = [];
        if (data.constituency) {
            locationParts.push(data.constituency);
        }
        if (data.island) {
            locationParts.push(data.island);
        }
        if (locationParts.length > 0) {
            locationEl.textContent = locationParts.join(', ');
        } else {
            locationEl.textContent = 'Not set';
        }
    }

    if (emailEl && data.email) {
        emailEl.textContent = data.email;
    }

    // Update Zero Day toggle
    if (zeroDayToggle) {
        zeroDayToggle.checked = data.zeroDayEnabled === true;
        updateZeroDayMenuVisibility(data.zeroDayEnabled === true);
    }
}

// Update Zero Day menu visibility based on toggle state
function updateZeroDayMenuVisibility(enabled) {
    const zeroDayNavItem = document.getElementById('zero-day-nav-item');
    if (zeroDayNavItem) {
        zeroDayNavItem.style.display = enabled ? 'flex' : 'none';
    }
}

// Update notification badge counter
function updateNotificationBadge(unreadCount) {
    const notificationBadge = document.getElementById('notification-badge');
    if (!notificationBadge) return;

    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notificationBadge.style.display = 'inline-block';
        // Add pulse animation class
        notificationBadge.classList.add('badge-pulse');
        setTimeout(() => {
            notificationBadge.classList.remove('badge-pulse');
        }, 600);
    } else {
        notificationBadge.style.display = 'none';
        notificationBadge.textContent = '0';
    }
}

// Real-time listener management system
// Store all active listeners for proper cleanup
window.activeListeners = {
    notifications: null,
    dashboard: null,
    // Add more as needed
};

// Cleanup function to unsubscribe all listeners
window.cleanupListeners = function() {
    Object.keys(window.activeListeners).forEach(key => {
        if (window.activeListeners[key] && typeof window.activeListeners[key] === 'function') {
            try {
                window.activeListeners[key]();
                console.log(`[cleanupListeners] Unsubscribed ${key} listener`);
            } catch (error) {
                console.warn(`[cleanupListeners] Error unsubscribing ${key}:`, error);
            }
            window.activeListeners[key] = null;
        }
    });
};

// Throttle UI updates to prevent excessive re-renders
function throttleUIUpdate(callback, delay = 300) {
    let lastCall = 0;
    let timeoutId = null;
    return function(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= delay) {
            // Enough time has passed, call immediately
            lastCall = now;
            callback.apply(this, args);
        } else {
            // Too soon, schedule for later
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                callback.apply(this, args);
            }, delay - timeSinceLastCall);
        }
    };
}

// Helper function to update notifications UI (extracted for reuse)
function updateNotificationsUI(snapshot) {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    let unreadCount = 0;
    const notifications = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.read) {
            unreadCount++;
        }
        notifications.push({
            id: doc.id,
            ...data
        });
    });

    // Sort by createdAt descending
    notifications.sort((a, b) => {
        const aDate = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const bDate = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return bDate - aDate;
    });

    // Update badge dynamically
    updateNotificationBadge(unreadCount);

    // Update notification list
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>No notifications</p></div>';
        return;
    }

    // Clear existing notifications first to prevent duplicates
    notificationList.innerHTML = '';

    // Use DocumentFragment for efficient DOM updates
    const fragment = document.createDocumentFragment();
    const addedIds = new Set(); // Track IDs to prevent duplicates in the same render

    notifications.slice(0, 10).forEach(notification => {
        // Skip if already added (safety check)
        if (addedIds.has(notification.id)) {
            return;
        }
        addedIds.add(notification.id);
        const createdAt = notification.createdAt ?
            (notification.createdAt.toDate ? notification.createdAt.toDate() : new Date(notification.createdAt)) :
            new Date();
        const timeAgo = getTimeAgo(createdAt);

        // Determine icon based on notification type
        let iconType = 'bell';
        if (notification.type === 'candidate') iconType = 'candidates';
        else if (notification.type === 'voter') iconType = 'voters';
        else if (notification.type === 'event') iconType = 'events';
        else if (notification.type === 'call') iconType = 'calls';
        else if (notification.type === 'pledge') iconType = 'pledges';

        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notification-item ${notification.read ? '' : 'notification-unread'}`;
        notificationDiv.setAttribute('data-notification-id', notification.id);
        notificationDiv.innerHTML = `
            <div class="notification-icon svg-icon" data-icon="${iconType}"></div>
            <div class="notification-content" style="flex: 1; min-width: 0;">
                <h4>${notification.title || 'Notification'}</h4>
                <p>${notification.message || notification.body || 'No message'}</p>
                <span class="notification-time">${timeAgo}</span>
            </div>
            <button class="notification-delete-btn" onclick="deleteNotification('${notification.id}')" title="Delete notification" style="background: transparent; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; border-radius: 4px; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        fragment.appendChild(notificationDiv);
    });

    notificationList.appendChild(fragment);

    // Reinitialize icons
    if (typeof initIcons === 'function') {
        setTimeout(() => initIcons(), 50);
    }
}

// Real-time notification listener - store globally so we can unsubscribe on logout
window.notificationUnsubscribe = null;
window.notificationsLoading = false; // Flag to prevent multiple simultaneous loads

// Load notifications from Firebase
async function loadNotifications() {
    console.log('[Notifications] loadNotifications called', {
        hasDb: !!window.db,
        userEmail: window.userEmail,
        authUser: window.auth.currentUser.email
    });

    if (!window.db) {
        console.warn('[Notifications] Database not initialized');
        const notificationList = document.getElementById('notification-list');
        if (notificationList) {
            notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>Database not initialized</p></div>';
        }
        updateNotificationBadge(0);
        return;
    }

    if (!window.userEmail) {
        console.warn('[Notifications] userEmail not set, trying to get from auth');
        // Try to get email from auth
        if (window.auth && window.auth.currentUser && window.auth.currentUser.email) {
            window.userEmail = window.auth.currentUser.email;
            console.log('[Notifications] Using email from auth:', window.userEmail);
        } else {
            console.warn('[Notifications] Cannot load notifications - no userEmail available');
            const notificationList = document.getElementById('notification-list');
            if (notificationList) {
                notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>Please log in to view notifications</p></div>';
            }
            updateNotificationBadge(0);
            return;
        }
    }

    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    // Prevent multiple simultaneous loads
    if (window.notificationsLoading) {
        console.log('[Notifications] Already loading, skipping duplicate call');
        return;
    }

    window.notificationsLoading = true;

    try {
        const {
            collection,
            query,
            where,
            orderBy,
            limit,
            onSnapshot
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Unsubscribe from previous listener if exists
        if (window.activeListeners && window.activeListeners.notifications) {
            try {
                window.activeListeners.notifications();
                delete window.activeListeners.notifications;
            } catch (error) {
                console.warn('Error unsubscribing previous notification listener:', error);
            }
        }
        if (window.notificationUnsubscribe) {
            try {
                window.notificationUnsubscribe();
            } catch (error) {
                console.warn('Error unsubscribing notification listener:', error);
            }
            window.notificationUnsubscribe = null;
        }

        // Query notifications for this user
        // Build query with orderBy - will fail on execution if index missing, handled in error callback
        const notificationsQuery = query(
            collection(window.db, 'notifications'),
            where('recipientEmail', '==', window.userEmail),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        // Set up real-time listener for notifications with throttled updates
        const throttledUpdateNotifications = throttleUIUpdate((snapshot) => {
            updateNotificationsUI(snapshot);
        }, 300); // Throttle to 300ms

        // Track processed notification IDs to prevent duplicates
        const processedNotificationIds = new Set();

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            // Check if this is the initial snapshot or an update
            const currentIds = new Set();
            snapshot.forEach(doc => currentIds.add(doc.id));

            // Only update if there are actual changes (new notifications or removed ones)
            const hasChanges = currentIds.size !== processedNotificationIds.size ||
                Array.from(currentIds).some(id => !processedNotificationIds.has(id)) ||
                Array.from(processedNotificationIds).some(id => !currentIds.has(id));

            if (hasChanges) {
                processedNotificationIds.clear();
                snapshot.forEach(doc => processedNotificationIds.add(doc.id));
                throttledUpdateNotifications(snapshot);
            }
        }, (error) => {
            console.error('Error listening to notifications:', error);
            // If index error, try fallback query without orderBy
            if (error.code === 'failed-precondition' && error.message && error.message.includes('index')) {
                console.warn('Notification index missing, using fallback query without orderBy');

                // Unsubscribe from the failed query first
                try {
                    unsubscribe();
                } catch (e) {
                    console.warn('Error unsubscribing failed query:', e);
                }

                const fallbackQuery = query(
                    collection(window.db, 'notifications'),
                    where('recipientEmail', '==', window.userEmail),
                    limit(10)
                );

                // Retry with fallback - also throttled
                const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
                    const currentIds = new Set();
                    snapshot.forEach(doc => currentIds.add(doc.id));

                    const hasChanges = currentIds.size !== processedNotificationIds.size ||
                        Array.from(currentIds).some(id => !processedNotificationIds.has(id)) ||
                        Array.from(processedNotificationIds).some(id => !currentIds.has(id));

                    if (hasChanges) {
                        processedNotificationIds.clear();
                        snapshot.forEach(doc => processedNotificationIds.add(doc.id));
                        throttledUpdateNotifications(snapshot);
                    }
                });

                window.activeListeners = window.activeListeners || {};
                window.activeListeners.notifications = fallbackUnsubscribe;
                window.notificationUnsubscribe = fallbackUnsubscribe;
                return;
            }
            notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>Error loading notifications</p></div>';
            updateNotificationBadge(0);
        });

        window.activeListeners = window.activeListeners || {};
        window.activeListeners.notifications = unsubscribe;
        window.notificationUnsubscribe = unsubscribe;

        // Note: onSnapshot will fire immediately with current data, so no need for initial getDocs call
        // This prevents duplicate notifications from being displayed
    } catch (error) {
        console.error('Error loading notifications:', error);
        notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>Error loading notifications</p></div>';
        updateNotificationBadge(0);
    } finally {
        window.notificationsLoading = false;
    }
}

// Helper function to get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('default', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Make functions globally available
// Attach event listeners to modal buttons
function attachModalButtonListeners() {
    // Map button text patterns to modal types
    const buttonMappings = [{
            patterns: ['Add Candidate', 'Candidate'],
            type: 'candidate'
        },
        {
            patterns: ['Import Voters', 'Import Voter', 'Voters'],
            type: 'voter'
        },
        {
            patterns: ['Schedule Event', 'Event'],
            type: 'event'
        },
        {
            patterns: ['Make Call', 'Call'],
            type: 'call'
        },
        {
            patterns: ['Add Pledge', 'Pledge'],
            type: 'pledge'
        },
        {
            patterns: ['Add Agent', 'Agent'],
            type: 'agent'
        }
    ];

    // Find all buttons with btn-primary class in the content area
    const contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.warn('[attachModalButtonListeners] Content area not found');
        return;
    }

    const buttons = contentArea.querySelectorAll('button.btn-primary');
    console.log(`[attachModalButtonListeners] Found ${buttons.length} buttons to check`);

    buttons.forEach(button => {
        // Get text content, removing SVG and extra whitespace
        const buttonText = button.textContent.trim().replace(/\s+/g, ' ');

        // Find matching modal type by checking if any pattern matches
        let mapping = null;
        for (const map of buttonMappings) {
            if (map.patterns.some(pattern => buttonText.includes(pattern))) {
                mapping = map;
                break;
            }
        }

        if (mapping && window.openModal) {
            // Check if listener already attached (avoid duplicates)
            if (button.dataset.modalListenerAttached === 'true') {
                return;
            }

            // Mark as attached
            button.dataset.modalListenerAttached = 'true';

            // Attach click listener
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`[attachModalButtonListeners] Opening ${mapping.type} modal`);
                if (window.openModal) {
                    window.openModal(mapping.type);
                } else {
                    console.error('[attachModalButtonListeners] openModal function not available');
                }
            });

            console.log(`[attachModalButtonListeners] Attached listener to "${buttonText}" → ${mapping.type} modal`);
        } else if (!window.openModal) {
            console.warn('[attachModalButtonListeners] window.openModal not available');
        }
    });
}

// View voter details function
async function viewVoterDetails(voterId, navigateDirection = null) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Show loading indicator immediately
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
            `;
        }
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Use cached voter data if available (much faster than fetching all voters)
        let allVoters = [];
        let currentIndex = -1;
        let data = null;

        if (voterDataCache.data && voterDataCache.data.filteredDocs) {
            // Use cached data for instant navigation
            allVoters = voterDataCache.data.filteredDocs.map(({
                id,
                data: voterData
            }) => ({
                id: id,
                ...voterData
            }));
            currentIndex = allVoters.findIndex(v => v.id === voterId);

            // If voter found in cache, use cached data
            if (currentIndex !== -1) {
                data = allVoters[currentIndex];
            }
        }

        // If not in cache or cache invalid, fetch from Firebase
        if (!data || currentIndex === -1) {
            // Fallback: fetch all voters if cache not available (slower)
            if (allVoters.length === 0) {
                const {
                    collection,
                    query,
                    where,
                    getDocs
                } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
                const allVotersSnapshot = await getDocs(votersQuery);
                allVoters = allVotersSnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));
                currentIndex = allVoters.findIndex(v => v.id === voterId);
            }

            // Handle navigation
            if (navigateDirection === 'prev' && currentIndex > 0) {
                voterId = allVoters[currentIndex - 1].id;
                currentIndex = currentIndex - 1;
            } else if (navigateDirection === 'next' && currentIndex < allVoters.length - 1) {
                voterId = allVoters[currentIndex + 1].id;
                currentIndex = currentIndex + 1;
            }

            // Fetch specific voter document
            const voterRef = doc(window.db, 'voters', voterId);
            const voterSnap = await getDoc(voterRef);

            if (!voterSnap.exists()) {
                if (window.showErrorDialog) {
                    window.showErrorDialog('Voter not found.', 'Error');
                }
                if (modalOverlay) modalOverlay.style.display = 'none';
                return;
            }

            data = voterSnap.data();
        } else {
            // Use cached data - handle navigation
            if (navigateDirection === 'prev' && currentIndex > 0) {
                voterId = allVoters[currentIndex - 1].id;
                currentIndex = currentIndex - 1;
                data = allVoters[currentIndex];
            } else if (navigateDirection === 'next' && currentIndex < allVoters.length - 1) {
                voterId = allVoters[currentIndex + 1].id;
                currentIndex = currentIndex + 1;
                data = allVoters[currentIndex];
            }
        }

        // Minimal debug logging (only in development)
        if (window.DEBUG_MODE) {
            console.log('[viewVoterDetails] Loaded voter:', voterId, 'from', data ? 'cache' : 'Firebase');
        }

        // Verify the voter belongs to the current user's campaign
        if (data.email !== window.userEmail && data.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to view this voter.', 'Access Denied');
            }
            return;
        }

        // Format date of birth
        let dobDisplay = 'N/A';
        if (data.dateOfBirth) {
            if (data.dateOfBirth.toDate) {
                const dob = data.dateOfBirth.toDate();
                dobDisplay = dob.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else if (typeof data.dateOfBirth === 'string') {
                const dob = new Date(data.dateOfBirth);
                if (!isNaN(dob.getTime())) {
                    dobDisplay = dob.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                } else {
                    dobDisplay = data.dateOfBirth;
                }
            }
        }

        // Format registration date
        let registeredDisplay = 'N/A';
        if (data.registeredAt) {
            if (data.registeredAt.toDate) {
                const regDate = data.registeredAt.toDate();
                registeredDisplay = regDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        // Get voter image or generate initials - use the same function that checks images folder
        const idNumber = data.idNumber || data.voterId || '';
        let imageUrl = getVoterImageUrl(data, idNumber);
        const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

        // If no image URL found, try to lookup from images folder asynchronously
        let imageLookupPromise = null;
        if (!imageUrl && idNumber && idNumber.trim()) {
            imageLookupPromise = lookupImageFromFolder(idNumber);
        }

        // Create modal HTML
        const modalHTML = `
            <div class="voter-details-modal" style="max-width: 600px; margin: 0 auto;">
                <!-- Navigation and Actions at top -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <!-- Navigation controls on left -->
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            id="voter-nav-prev" 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewVoterDetails('${voterId}', 'prev')"
                            style="display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Previous
                        </button>
                        <span style="color: var(--text-light); font-size: 12px; padding: 8px 8px; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0;">
                            ${currentIndex + 1} of ${allVoters.length}
                        </span>
                        <button 
                            id="voter-nav-next" 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === allVoters.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewVoterDetails('${voterId}', 'next')"
                            style="display: flex; align-items: center; gap: 6px;">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    ${imageUrl ? 
                        `<img id="voter-detail-image" src="${imageUrl}" alt="${data.name || 'Voter'}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color);" data-voter-id="${idNumber || ''}" onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${idNumber || ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });"><div id="voter-detail-fallback" style="width: 80px; height: 80px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 28px; border: 3px solid var(--primary-color);">${initials}</div>` :
                        `<div id="voter-detail-fallback" style="width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 28px; border: 3px solid var(--primary-color);">${initials}</div>`
                    }
                    <div>
                        <h2 style="margin: 0; color: var(--text-color); font-size: 24px; font-weight: 700;">${(data.name && data.name.trim()) ? data.name.trim() : 'N/A'}</h2>
                        <p style="margin: 5px 0 0 0; color: var(--text-light); font-size: 14px;">ID: ${(data.idNumber && data.idNumber.trim()) ? data.idNumber.trim() : (data.voterId ? data.voterId : 'N/A')}</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Date of Birth</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${dobDisplay}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Age</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(data.age !== undefined && data.age !== null && data.age !== '') ? (data.age + ' years') : 'N/A'}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Gender</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(data.gender && data.gender.trim()) ? (data.gender.charAt(0).toUpperCase() + data.gender.slice(1)) : 'N/A'}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Island</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(data.island && data.island.trim()) ? data.island.trim() : 'N/A'}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Constituency</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(window.campaignData && window.campaignData.constituency && window.campaignData.constituency.trim()) ? window.campaignData.constituency.trim() : 'N/A'}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Ballot</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(data.ballot && data.ballot.trim()) ? data.ballot.trim() : 'N/A'}</p>
                    </div>
                </div>

                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Permanent Address</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${(data.permanentAddress && data.permanentAddress.trim()) ? data.permanentAddress.trim() : 'N/A'}</p>
                </div>

                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Current Location</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${(data.currentLocation && data.currentLocation.trim()) ? data.currentLocation.trim() : 'N/A'}</p>
                </div>

                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Phone Number</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(data.number && data.number.trim()) ? data.number.trim() : 'N/A'}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; padding-top: 20px; border-top: 2px solid var(--border-color);">
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Status</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">
                            <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${data.verified ? 'var(--success-color)' : 'var(--warning-color)'}; color: white;">
                                ${data.verified ? 'Verified' : 'Pending'}
                            </span>
                        </p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Registered</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${registeredDisplay}</p>
                    </div>
                </div>
            </div>
        `;

        // Use requestAnimationFrame for smooth modal rendering
        requestAnimationFrame(() => {
            // Use the modal system to display voter details
            let modalOverlay = document.getElementById('modal-overlay');
            if (!modalOverlay) {
                // Create modal if it doesn't exist
                const overlay = document.createElement('div');
                overlay.id = 'modal-overlay';
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-container" id="modal-container" style="max-width: 700px;">
                        <div class="modal-header">
                            <h2 id="modal-title">Voter Details</h2>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <button class="modal-maximize" id="modal-maximize-btn" title="Maximize" onclick="if (typeof toggleModalMaximize === 'function') { const container = this.closest('.modal-container'); toggleModalMaximize(container, this); }">
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
                        <div class="modal-body" id="modal-body"></div>
                    </div>
                `;
                document.body.appendChild(overlay);
                modalOverlay = overlay;

                // Add close handlers (only once)
                const closeBtn = overlay.querySelector('#modal-close-btn');
                if (closeBtn && !closeBtn.dataset.listenerAttached) {
                    closeBtn.dataset.listenerAttached = 'true';
                    closeBtn.addEventListener('click', () => {
                        overlay.style.display = 'none';
                    });
                }
                if (!overlay.dataset.listenerAttached) {
                    overlay.dataset.listenerAttached = 'true';
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            overlay.style.display = 'none';
                        }
                    });
                }
            }

            // Display the modal content
            const modalBody = modalOverlay.querySelector('#modal-body');
            const modalTitle = modalOverlay.querySelector('#modal-title');

            if (modalTitle) modalTitle.textContent = 'Voter Details';
            if (modalBody) {
                modalBody.innerHTML = modalHTML;

                // If we started an async image lookup, update the image when found
                if (imageLookupPromise) {
                    imageLookupPromise.then(foundUrl => {
                        if (foundUrl) {
                            const detailImg = modalBody.querySelector('#voter-detail-image');
                            const detailFallback = modalBody.querySelector('#voter-detail-fallback');

                            if (detailImg) {
                                detailImg.src = foundUrl;
                                detailImg.style.display = '';
                                if (detailFallback) {
                                    detailFallback.style.display = 'none';
                                }
                            } else if (detailFallback) {
                                // If no img element exists, create one
                                const img = document.createElement('img');
                                img.id = 'voter-detail-image';
                                img.src = foundUrl;
                                img.alt = data.name || 'Voter';
                                img.style.cssText = 'width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color);';
                                img.setAttribute('data-voter-id', idNumber);
                                img.onerror = function() {
                                    this.style.display = 'none';
                                    if (detailFallback) {
                                        detailFallback.style.display = 'flex';
                                    }
                                };
                                detailFallback.parentNode.replaceChild(img, detailFallback);
                            }
                        }
                    }).catch(() => {
                        // Silently fail - fallback will show
                    });
                }
            }
            modalOverlay.style.display = 'flex';
        });
    } catch (error) {
        console.error('Error loading voter details:', error);
        // Hide loading indicator
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load voter details. Please try again.', 'Error');
        }
    }
}

// Edit voter function
async function editVoter(voterId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const voterRef = doc(window.db, 'voters', voterId);
        const voterSnap = await getDoc(voterRef);

        if (!voterSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Voter not found.', 'Error');
            }
            return;
        }

        const data = voterSnap.data();

        // Verify the voter belongs to the current user's campaign
        if (data.email !== window.userEmail && data.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to edit this voter.', 'Access Denied');
            }
            return;
        }

        // Close details modal
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }

        // Open voter form modal with pre-filled data
        if (window.openModal) {
            window.openModal('voter', voterId);

            // Wait for modal to render, then populate form
            // Use multiple attempts to ensure form is ready and all setup is complete
            let attempts = 0;
            const maxAttempts = 15;
            const tryPopulate = () => {
                const dobField = document.getElementById('voter-dob');
                const nameField = document.getElementById('voter-name');
                // Check if both fields exist (indicates form is ready)
                if ((dobField && nameField) || attempts >= maxAttempts) {
                    if (dobField && nameField) {
                        populateVoterEditForm(data, voterId);
                        // Double-check DOB was set after a short delay (in case something resets it)
                        setTimeout(() => {
                            const dobFieldCheck = document.getElementById('voter-dob');
                            if (dobFieldCheck && !dobFieldCheck.value && data.dateOfBirth) {
                                console.log('[editVoter] DOB was cleared, re-setting...');
                                const setDobValue = () => {
                                    let dateValue = '';
                                    const dob = data.dateOfBirth;
                                    if (dob && dob.toDate && typeof dob.toDate === 'function') {
                                        const date = dob.toDate();
                                        dateValue = date.toISOString().split('T')[0];
                                    } else if (dob instanceof Date) {
                                        dateValue = dob.toISOString().split('T')[0];
                                    } else if (typeof dob === 'string') {
                                        const date = new Date(dob);
                                        if (!isNaN(date.getTime())) {
                                            dateValue = date.toISOString().split('T')[0];
                                        } else if (dob.match(/^\d{4}-\d{2}-\d{2}/)) {
                                            dateValue = dob.split('T')[0];
                                        }
                                    } else if (dob && dob.seconds && typeof dob.seconds === 'number') {
                                        const date = new Date(dob.seconds * 1000);
                                        dateValue = date.toISOString().split('T')[0];
                                    }
                                    if (dateValue && dobFieldCheck) {
                                        dobFieldCheck.value = dateValue;
                                        console.log('[editVoter] DOB re-set to:', dateValue);
                                    }
                                };
                                setDobValue();
                            }
                        }, 200);
                    } else {
                        console.warn('[editVoter] Form fields not ready after', attempts, 'attempts');
                    }
                } else {
                    attempts++;
                    setTimeout(tryPopulate, 100);
                }
            };
            setTimeout(tryPopulate, 200);
        }
    } catch (error) {
        console.error('Error loading voter for edit:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load voter data. Please try again.', 'Error');
        }
    }
}

// Populate voter form with existing data for editing
function populateVoterEditForm(data, voterId) {
    // Set form values
    const setIdNumber = (id) => {
        const el = document.getElementById('voter-id-number');
        if (el) el.value = id || '';
    };
    const setName = (name) => {
        const el = document.getElementById('voter-name');
        if (el) el.value = name || '';
    };
    const setDob = (dob) => {
        const el = document.getElementById('voter-dob');
        if (!el) {
            console.warn('[populateVoterEditForm] voter-dob element not found');
            return;
        }

        if (!dob) {
            // If no date of birth, clear the field
            el.value = '';
            return;
        }

        try {
            let dateValue = '';

            // Handle Firestore Timestamp
            if (dob.toDate && typeof dob.toDate === 'function') {
                const date = dob.toDate();
                dateValue = date.toISOString().split('T')[0];
            }
            // Handle Date object
            else if (dob instanceof Date) {
                dateValue = dob.toISOString().split('T')[0];
            }
            // Handle string (ISO format or date string)
            else if (typeof dob === 'string') {
                // Try to parse the string
                const date = new Date(dob);
                if (!isNaN(date.getTime())) {
                    dateValue = date.toISOString().split('T')[0];
                } else {
                    // If it's already in YYYY-MM-DD format, use it directly
                    if (dob.match(/^\d{4}-\d{2}-\d{2}/)) {
                        dateValue = dob.split('T')[0];
                    }
                }
            }
            // Handle Timestamp object with seconds property
            else if (dob.seconds && typeof dob.seconds === 'number') {
                const date = new Date(dob.seconds * 1000);
                dateValue = date.toISOString().split('T')[0];
            }

            if (dateValue) {
                el.value = dateValue;
                console.log('[populateVoterEditForm] Set DOB:', dateValue, 'from:', dob);
            } else {
                console.warn('[populateVoterEditForm] Could not parse DOB:', dob);
                el.value = '';
            }
        } catch (error) {
            console.error('[populateVoterEditForm] Error setting DOB:', error, dob);
            el.value = '';
        }
    };
    const setAge = (age) => {
        const el = document.getElementById('voter-age');
        if (el) el.value = age || '';
    };
    const setGender = (gender) => {
        const el = document.getElementById('voter-gender');
        if (el) el.value = gender || '';
    };
    const setConstituency = (constituency) => {
        const el = document.getElementById('voter-constituency');
        if (el) {
            // Use constituency from data, or fallback to campaign data
            const valueToSet = constituency || (window.campaignData && window.campaignData.constituency ? window.campaignData.constituency : '');
            el.value = valueToSet || '';

            // If constituency is set, populate islands for that constituency
            if (valueToSet && window.populateIslandDropdownForVoter && typeof window.populateIslandDropdownForVoter === 'function') {
                window.populateIslandDropdownForVoter(valueToSet);
            } else if (valueToSet && window.getIslandsForConstituency && typeof window.getIslandsForConstituency === 'function') {
                // Fallback: manually populate islands
                const islandSelect = document.getElementById('voter-island');
                if (islandSelect) {
                    islandSelect.innerHTML = '<option value="">Select Island</option>';
                    const islands = window.getIslandsForConstituency(valueToSet);
                    islands.forEach(island => {
                        const option = document.createElement('option');
                        option.value = island;
                        option.textContent = island;
                        islandSelect.appendChild(option);
                    });
                }
            }
        }
    };
    const setIsland = (island) => {
        setTimeout(() => {
            const el = document.getElementById('voter-island');
            if (el) {
                el.value = island || '';
            }
        }, 300); // Increased timeout to allow constituency dropdown to populate islands first
    };
    const setBallot = (ballot) => {
        const el = document.getElementById('voter-ballot');
        if (el) el.value = ballot || '';
    };
    const setPermanentAddress = (address) => {
        const el = document.getElementById('voter-permanent-address');
        if (el) el.value = address || '';
    };
    const setCurrentLocation = (location) => {
        const el = document.getElementById('voter-current-location');
        if (el) el.value = location || '';
    };
    const setNumber = (number) => {
        const el = document.getElementById('voter-number');
        if (el) el.value = number || '';
    };
    const setImagePreview = (imageUrl) => {
        if (imageUrl) {
            const preview = document.getElementById('voter-image-preview');
            const previewImg = document.getElementById('voter-image-preview-img');
            if (preview && previewImg) {
                previewImg.src = imageUrl;
                preview.style.display = 'block';
            }
        }
    };

    // Populate all fields
    setIdNumber(data.idNumber);
    setName(data.name);
    setDob(data.dateOfBirth);
    setAge(data.age);
    setGender(data.gender);
    setConstituency(data.constituency);
    setIsland(data.island);
    setBallot(data.ballot);
    setPermanentAddress(data.permanentAddress);
    setCurrentLocation(data.currentLocation);
    setNumber(data.number);
    setImagePreview(data.imageUrl || data.image);

    // Store voter ID for update
    const form = document.getElementById('modal-form');
    if (form) {
        form.dataset.editVoterId = voterId;

        // Update submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Voter';
        }
    }
}

// Delete voter function
async function deleteVoter(voterId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to delete this voter? This action cannot be undone.',
            'Delete Voter'
        );
        if (!confirmed) return;
    } else {
        if (!confirm('Are you sure you want to delete this voter? This action cannot be undone.')) {
            return;
        }
    }

    try {
        const {
            doc,
            deleteDoc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify voter exists and belongs to user
        const voterRef = doc(window.db, 'voters', voterId);
        const voterSnap = await getDoc(voterRef);

        if (!voterSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Voter not found.', 'Error');
            }
            return;
        }

        const data = voterSnap.data();
        if (data.email !== window.userEmail && data.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this voter.', 'Access Denied');
            }
            return;
        }

        // Delete the voter
        await deleteDoc(voterRef);

        // Clear cache since voter was deleted
        clearVoterCache();

        // Show success message
        if (window.showSuccess) {
            window.showSuccess('Voter deleted successfully.', 'Success');
        }

        // Close modal
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }

        // Reload voters table
        if (window.reloadTableData) {
            window.reloadTableData('voter');
        } else if (window.loadPageContent) {
            setTimeout(() => {
                window.loadPageContent('voters');
            }, 500);
        }
    } catch (error) {
        console.error('Error deleting voter:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete voter. Please try again.', 'Error');
        }
    }
}

// View pledge details function
async function viewPledgeDetails(pledgeId, navigateDirection = null) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Show loading indicator immediately
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
            `;
        }
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs,
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all pledges for navigation
        const pledgesQuery = query(collection(window.db, 'pledges'), where('email', '==', window.userEmail));
        const allPledgesSnapshot = await getDocs(pledgesQuery);
        const allPledges = allPledgesSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        let currentIndex = allPledges.findIndex(p => p.id === pledgeId);

        // Handle navigation
        if (navigateDirection === 'prev' && currentIndex > 0) {
            pledgeId = allPledges[currentIndex - 1].id;
            currentIndex = currentIndex - 1;
        } else if (navigateDirection === 'next' && currentIndex < allPledges.length - 1) {
            pledgeId = allPledges[currentIndex + 1].id;
            currentIndex = currentIndex + 1;
        }

        // Fetch pledge document
        const pledgeRef = doc(window.db, 'pledges', pledgeId);
        const pledgeSnap = await getDoc(pledgeRef);

        if (!pledgeSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Pledge not found.', 'Error');
            }
            if (modalOverlay) modalOverlay.style.display = 'none';
            return;
        }

        const pledgeData = pledgeSnap.data();

        // Verify the pledge belongs to the current user
        if (pledgeData.email !== window.userEmail && pledgeData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to view this pledge.', 'Access Denied');
            }
            return;
        }

        // Fetch full voter data if voter document ID is available
        let voterData = null;
        if (pledgeData.voterDocumentId) {
            try {
                const voterRef = doc(window.db, 'voters', pledgeData.voterDocumentId);
                const voterSnap = await getDoc(voterRef);
                if (voterSnap.exists()) {
                    voterData = voterSnap.data();
                }
            } catch (error) {
                console.warn('Could not fetch voter data for pledge:', error);
            }
        }

        // Use voter data if available, otherwise fall back to pledge data
        const displayData = voterData || pledgeData;

        // Format dates
        let dobDisplay = 'N/A';
        if (displayData.dateOfBirth) {
            if (displayData.dateOfBirth.toDate) {
                const dob = displayData.dateOfBirth.toDate();
                dobDisplay = dob.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else if (typeof displayData.dateOfBirth === 'string') {
                const dob = new Date(displayData.dateOfBirth);
                if (!isNaN(dob.getTime())) {
                    dobDisplay = dob.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            }
        }

        const pledgeDate = pledgeData.recordedAt ? (pledgeData.recordedAt.toDate ? pledgeData.recordedAt.toDate() : new Date(pledgeData.recordedAt)) : new Date();
        const pledgeDateStr = pledgeDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Get ID number - prioritize voter data fields, NEVER use document IDs
        let idNumber = 'N/A';
        if (voterData) {
            // From voter data - use idNumber field first, then voterId (but not document ID)
            idNumber = (voterData.idNumber && voterData.idNumber.trim()) ||
                (voterData.voterId && voterData.voterId.trim()) ||
                'N/A';
        } else if (pledgeData) {
            // Fallback to pledge data - use voterId field (not document ID)
            idNumber = (pledgeData.voterId && pledgeData.voterId.trim()) || 'N/A';
        }

        // Ensure we never use document IDs - if idNumber looks like a Firestore ID, set to N/A
        if (idNumber && idNumber.length === 20 && /^[A-Za-z0-9]{20}$/.test(idNumber)) {
            idNumber = 'N/A'; // Likely a Firestore document ID, don't use it
        }

        // Get voter name - prioritize voter data
        const voterName = voterData ? (voterData.name || pledgeData.voterName || 'N/A') : (pledgeData.voterName || 'N/A');
        // Get image URL using the function that checks images folder
        let imageUrl = getVoterImageUrl(voterData || pledgeData, idNumber !== 'N/A' ? idNumber : null);
        const initials = voterName && voterName !== 'N/A' ? voterName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

        // If no image URL found, try to lookup from images folder asynchronously
        let imageLookupPromise = null;
        if (!imageUrl && idNumber && idNumber !== 'N/A' && idNumber.trim()) {
            imageLookupPromise = lookupImageFromFolder(idNumber);
        }

        // Get permanent address and current location
        const permanentAddress = voterData ? (voterData.permanentAddress || voterData.address || 'N/A') : (pledgeData.permanentAddress || 'N/A');
        const currentLocation = voterData ? (voterData.currentLocation || voterData.location || 'N/A') : (pledgeData.currentLocation || 'N/A');

        // Fetch assigned agent if agentId is present in voter data
        let assignedAgentName = 'N/A';
        if (voterData && voterData.assignedAgentId) {
            try {
                const agentRef = doc(window.db, 'agents', voterData.assignedAgentId);
                const agentSnap = await getDoc(agentRef);
                if (agentSnap.exists()) {
                    const agentData = agentSnap.data();
                    assignedAgentName = agentData.name || 'N/A';
                }
            } catch (error) {
                console.warn('Could not fetch agent data:', error);
            }
        }

        // Pledge status
        let statusClass = 'status-pending';
        let statusText = 'Undecided';
        if (pledgeData.pledge === 'yes') {
            statusClass = 'status-success';
            statusText = 'Yes - Will Support';
        } else if (pledgeData.pledge === 'no' || pledgeData.pledge === 'negative') {
            statusClass = 'status-danger';
            statusText = 'No - Will Not Support';
        }

        // Create modal HTML
        const modalHTML = `
            <div class="pledge-details-modal" style="max-width: 600px; margin: 0 auto;">
                <!-- Navigation and Actions at top -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <!-- Navigation controls on left -->
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            id="pledge-nav-prev" 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewPledgeDetails('${pledgeId}', 'prev')"
                            style="display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Previous
                        </button>
                        <span style="color: var(--text-light); font-size: 12px; padding: 8px 8px; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0;">
                            ${currentIndex + 1} of ${allPledges.length}
                        </span>
                        <button 
                            id="pledge-nav-next" 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === allPledges.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewPledgeDetails('${pledgeId}', 'next')"
                            style="display: flex; align-items: center; gap: 6px;">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                    <!-- CRUD actions on right -->
                    <div style="display: flex; gap: 8px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            type="button"
                            title="Edit Pledge"
                            onclick="editPledge('${pledgeId}')"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(111, 193, 218, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(111, 193, 218, 0.3)'"
                            style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(111, 193, 218, 0.3);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button 
                            type="button"
                            title="Delete Pledge"
                            onclick="deletePledge('${pledgeId}')"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(220, 38, 38, 0.3)'"
                            style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0; background: #dc2626; color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    ${imageUrl ? 
                        `<img id="pledge-detail-image" src="${imageUrl}" alt="${voterName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color);" data-voter-id="${idNumber !== 'N/A' ? idNumber : ''}" onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${idNumber !== 'N/A' ? idNumber : ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });"><div id="pledge-detail-fallback" style="width: 80px; height: 80px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 28px; border: 3px solid var(--primary-color);">${initials}</div>` :
                        `<div id="pledge-detail-fallback" style="width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 28px; border: 3px solid var(--primary-color);">${initials}</div>`
                    }
                    <div>
                        <h2 style="margin: 0; color: var(--text-color); font-size: 24px; font-weight: 700;">${(voterName && voterName.trim()) ? voterName.trim() : 'N/A'}</h2>
                        <p style="margin: 5px 0 0 0; color: var(--text-light); font-size: 14px;">ID: ${idNumber}</p>
                    </div>
                </div>

                <!-- Pledge Information Section -->
                <div style="background: var(--light-color); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: var(--text-color); font-size: 18px; font-weight: 600;">Pledge Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Pledge Status</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">
                                <span class="status-badge ${statusClass}" style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${statusText}</span>
                            </p>
                        </div>
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Date Recorded</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${pledgeDateStr}</p>
                        </div>
                    </div>
                    ${pledgeData.notes ? `
                        <div class="detail-item" style="margin-top: 15px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Notes</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${pledgeData.notes}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Voter Information Section -->
                <h3 style="margin: 0 0 20px 0; color: var(--text-color); font-size: 18px; font-weight: 600;">Voter Information</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Date of Birth</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${dobDisplay}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Age</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(displayData.age !== undefined && displayData.age !== null && displayData.age !== '') ? (displayData.age + ' years') : (pledgeData.age ? pledgeData.age + ' years' : 'N/A')}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Gender</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(displayData.gender && displayData.gender.trim()) ? (displayData.gender.charAt(0).toUpperCase() + displayData.gender.slice(1)) : 'N/A'}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Constituency</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(displayData.constituency && displayData.constituency.trim()) ? displayData.constituency.trim() : ((pledgeData.constituency && pledgeData.constituency.trim()) ? pledgeData.constituency.trim() : 'N/A')}</p>
                    </div>
                    <div class="detail-item">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Island</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${(displayData.island && displayData.island.trim()) ? displayData.island.trim() : ((pledgeData.island && pledgeData.island.trim()) ? pledgeData.island.trim() : 'N/A')}</p>
                    </div>
                    ${displayData.atoll ? `
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Atoll</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${displayData.atoll}</p>
                        </div>
                    ` : ''}
                    ${displayData.ballot ? `
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Ballot</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${displayData.ballot}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Always show Permanent Address, Current Location, and Assigned Agent -->
                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Permanent Address</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${permanentAddress}</p>
                </div>
                
                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Current Location</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500; line-height: 1.6;">${currentLocation}</p>
                </div>
                
                <div class="detail-item" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Assigned Agent</label>
                    <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${assignedAgentName}</p>
                </div>
                
                ${displayData.number ? `
                    <div class="detail-item" style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Phone Number</label>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${displayData.number}</p>
                    </div>
                ` : ''}
            </div>
        `;

        // Use requestAnimationFrame for smooth modal rendering
        requestAnimationFrame(() => {
            let modalOverlay = document.getElementById('modal-overlay');
            if (!modalOverlay) {
                const overlay = document.createElement('div');
                overlay.id = 'modal-overlay';
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-container" id="modal-container" style="max-width: 700px;">
                        <div class="modal-header">
                            <h2 id="modal-title">Pledge Details</h2>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <button class="modal-maximize" id="modal-maximize-btn" title="Maximize" onclick="if (typeof toggleModalMaximize === 'function') { const container = this.closest('.modal-container'); toggleModalMaximize(container, this); }">
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
                        <div class="modal-body" id="modal-body"></div>
                    </div>
                `;
                document.body.appendChild(overlay);
                modalOverlay = overlay;

                const closeBtn = overlay.querySelector('#modal-close-btn');
                if (closeBtn && !closeBtn.dataset.listenerAttached) {
                    closeBtn.dataset.listenerAttached = 'true';
                    closeBtn.addEventListener('click', () => {
                        overlay.style.display = 'none';
                    });
                }
                if (!overlay.dataset.listenerAttached) {
                    overlay.dataset.listenerAttached = 'true';
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            overlay.style.display = 'none';
                        }
                    });
                }
            }

            const modalBody = modalOverlay.querySelector('#modal-body');
            const modalTitle = modalOverlay.querySelector('#modal-title');

            if (modalTitle) modalTitle.textContent = 'Pledge Details';
            if (modalBody) {
                modalBody.innerHTML = modalHTML;

                // If we started an async image lookup, update the image when found
                if (imageLookupPromise) {
                    imageLookupPromise.then(foundUrl => {
                        if (foundUrl) {
                            const detailImg = modalBody.querySelector('#pledge-detail-image');
                            const detailFallback = modalBody.querySelector('#pledge-detail-fallback');

                            if (detailImg) {
                                detailImg.src = foundUrl;
                                detailImg.style.display = '';
                                if (detailFallback) {
                                    detailFallback.style.display = 'none';
                                }
                            } else if (detailFallback) {
                                // If no img element exists, create one
                                const img = document.createElement('img');
                                img.id = 'pledge-detail-image';
                                img.src = foundUrl;
                                img.alt = voterName || 'Voter';
                                img.style.cssText = 'width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color);';
                                img.setAttribute('data-voter-id', idNumber !== 'N/A' ? idNumber : '');
                                img.onerror = function() {
                                    this.style.display = 'none';
                                    if (detailFallback) {
                                        detailFallback.style.display = 'flex';
                                    }
                                };
                                detailFallback.parentNode.replaceChild(img, detailFallback);
                            }
                        }
                    }).catch(() => {
                        // Silently fail - fallback will show
                    });
                }
            }
            modalOverlay.style.display = 'flex';
        });
    } catch (error) {
        console.error('Error loading pledge details:', error);
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load pledge details. Please try again.', 'Error');
        }
    }
}

// Edit pledge function
async function editPledge(pledgeId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const pledgeRef = doc(window.db, 'pledges', pledgeId);
        const pledgeSnap = await getDoc(pledgeRef);

        if (!pledgeSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Pledge not found.', 'Error');
            }
            return;
        }

        const pledgeData = pledgeSnap.data();

        // Verify the pledge belongs to the current user
        if (pledgeData.email !== window.userEmail && pledgeData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to edit this pledge.', 'Access Denied');
            }
            return;
        }

        // Fetch voter data if voter document ID is available
        let voterData = null;
        if (pledgeData.voterDocumentId) {
            try {
                const voterRef = doc(window.db, 'voters', pledgeData.voterDocumentId);
                const voterSnap = await getDoc(voterRef);
                if (voterSnap.exists()) {
                    voterData = voterSnap.data();
                }
            } catch (error) {
                console.warn('Could not fetch voter data for pledge edit:', error);
            }
        }

        // Close details modal if open
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }

        // Open pledge form modal with pre-filled data
        if (window.openModal) {
            window.openModal('pledge', pledgeId);

            // Wait for modal to render, then populate form
            setTimeout(async () => {
                await populatePledgeEditForm(pledgeData, voterData, pledgeId);
            }, 300);
        }
    } catch (error) {
        console.error('Error loading pledge for edit:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load pledge data. Please try again.', 'Error');
        }
    }
}

// Populate pledge form with existing data for editing
async function populatePledgeEditForm(pledgeData, voterData, pledgeId) {
    // Use voter data if available, otherwise use pledge data
    const displayData = voterData || pledgeData;

    // Set voter name (this will trigger the dropdown if available)
    const voterNameInput = document.getElementById('pledge-voter-name');
    if (voterNameInput) {
        voterNameInput.value = displayData.name || pledgeData.voterName || '';
    }

    // Set hidden voter document ID
    const voterIdHidden = document.getElementById('pledge-voter-id-hidden');
    if (voterIdHidden && pledgeData.voterDocumentId) {
        voterIdHidden.value = pledgeData.voterDocumentId;
    }

    // Set voter ID
    const voterIdInput = document.getElementById('pledge-voter-id');
    if (voterIdInput) {
        voterIdInput.value = displayData.idNumber || displayData.voterId || pledgeData.voterId || '';
    }

    // Set island
    const islandInput = document.getElementById('pledge-island');
    if (islandInput) {
        islandInput.value = displayData.island || pledgeData.island || window.campaignData.island || '';
    }

    // Set current location
    const currentLocationTextarea = document.getElementById('pledge-current-location');
    if (currentLocationTextarea) {
        currentLocationTextarea.value = displayData.currentLocation || pledgeData.currentLocation || '';
    }

    // Ensure candidate dropdown is set up before populating values
    if (window.setupPledgeCandidateDropdown) {
        await window.setupPledgeCandidateDropdown();
    }

    // Set candidate(s) - handle both single and multiple selection
    const candidateSelect = document.getElementById('pledge-candidate');
    if (candidateSelect) {
        // Check if multiple selection is allowed based on campaign type
        const campaignType = window.campaignData.campaignType || '';
        const allowMultiple = campaignType === 'WDC' || campaignType === 'Local Council Election';

        // Get candidate IDs - prefer array format, fallback to single value
        let candidateIds = [];
        if (pledgeData.candidateIds && Array.isArray(pledgeData.candidateIds)) {
            candidateIds = pledgeData.candidateIds;
        } else if (pledgeData.candidates && Array.isArray(pledgeData.candidates)) {
            candidateIds = pledgeData.candidates;
        } else {
            // Fallback to single candidate for backward compatibility
            const candidateId = pledgeData.candidateId || pledgeData.candidate || '';
            if (candidateId) {
                candidateIds = [candidateId];
            }
        }

        // Set selected candidates
        if (candidateIds.length > 0) {
            if (allowMultiple && candidateSelect.multiple) {
                // Multiple selection - select all candidates
                Array.from(candidateSelect.options).forEach(option => {
                    option.selected = candidateIds.includes(option.value);
                });
            } else {
                // Single selection - select first candidate
                candidateSelect.value = candidateIds[0] || '';
            }
        }
    }

    // Set pledge status
    const pledgeStatusSelect = document.getElementById('pledge-status');
    if (pledgeStatusSelect) {
        pledgeStatusSelect.value = pledgeData.pledge || '';
    }

    // Set notes
    const notesTextarea = document.getElementById('pledge-notes');
    if (notesTextarea) {
        notesTextarea.value = pledgeData.notes || '';
    }

    // Store pledge ID for update
    const form = document.getElementById('modal-form');
    if (form) {
        form.dataset.editPledgeId = pledgeId;

        // Update submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Pledge';
        }
    }

    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Pledge';
    }
}

// Delete pledge function
async function deletePledge(pledgeId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to delete this pledge? This action cannot be undone.',
            'Delete Pledge'
        );
        if (!confirmed) return;
    } else {
        if (!confirm('Are you sure you want to delete this pledge? This action cannot be undone.')) {
            return;
        }
    }

    try {
        const {
            doc,
            deleteDoc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify pledge exists and belongs to user
        const pledgeRef = doc(window.db, 'pledges', pledgeId);
        const pledgeSnap = await getDoc(pledgeRef);

        if (!pledgeSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Pledge not found.', 'Error');
            }
            return;
        }

        const pledgeData = pledgeSnap.data();
        if (pledgeData.email !== window.userEmail && pledgeData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this pledge.', 'Access Denied');
            }
            return;
        }

        // Delete the pledge
        await deleteDoc(pledgeRef);

        // Show success message
        if (window.showSuccess) {
            window.showSuccess('Pledge deleted successfully.', 'Success');
        }

        // Close modal if open
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }

        // Reload pledges table
        if (window.reloadTableData) {
            window.reloadTableData('pledge');
        } else if (window.loadPageContent) {
            setTimeout(() => {
                window.loadPageContent('pledges');
            }, 500);
        }
    } catch (error) {
        console.error('Error deleting pledge:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete pledge. Please try again.', 'Error');
        }
    }
}

// View candidate details function
async function viewCandidateDetails(candidateId, navigateDirection = null) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc,
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all candidates for navigation
        const candidatesQuery = query(collection(window.db, 'candidates'), where('email', '==', window.userEmail));
        const allCandidatesSnapshot = await getDocs(candidatesQuery);
        const allCandidates = allCandidatesSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        let currentIndex = allCandidates.findIndex(c => c.id === candidateId);

        // Handle navigation
        if (navigateDirection === 'prev' && currentIndex > 0) {
            candidateId = allCandidates[currentIndex - 1].id;
            currentIndex = currentIndex - 1;
        } else if (navigateDirection === 'next' && currentIndex < allCandidates.length - 1) {
            candidateId = allCandidates[currentIndex + 1].id;
            currentIndex = currentIndex + 1;
        }

        // Fetch candidate document
        const candidateRef = doc(window.db, 'candidates', candidateId);
        const candidateSnap = await getDoc(candidateRef);

        if (!candidateSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Candidate not found.', 'Error');
            }
            return;
        }

        const candidateData = candidateSnap.data();

        // Verify the candidate belongs to the current user
        if (candidateData.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to view this candidate.', 'Access Denied');
            }
            return;
        }

        const initials = candidateData.name ? candidateData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
        const statusClass = candidateData.status === 'active' ? 'status-success' : candidateData.status === 'inactive' ? 'status-danger' : 'status-pending';
        const statusText = candidateData.status ? candidateData.status.charAt(0).toUpperCase() + candidateData.status.slice(1) : 'Pending';

        // Format created date
        let createdDateStr = 'N/A';
        if (candidateData.createdAt) {
            const createdDate = candidateData.createdAt.toDate ? candidateData.createdAt.toDate() : new Date(candidateData.createdAt);
            createdDateStr = createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Create modal HTML
        const modalHTML = `
            <div class="candidate-details-modal" style="max-width: 600px; margin: 0 auto;">
                <!-- Actions at top -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            class="btn-primary btn-compact" 
                            onclick="editCandidate('${candidateId}')"
                            style="white-space: nowrap; display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                        <button 
                            class="btn-secondary btn-compact" 
                            onclick="deleteCandidate('${candidateId}')"
                            style="display: flex; align-items: center; gap: 6px; background: var(--danger-color); color: white; border-color: var(--danger-color); white-space: nowrap;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    <div style="width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 28px; border: 3px solid var(--primary-color);">${initials}</div>
                    <div>
                        <h2 style="margin: 0; color: var(--text-color); font-size: 24px; font-weight: 700;">${candidateData.name || 'N/A'}</h2>
                        <p style="margin: 5px 0 0 0; color: var(--text-light); font-size: 14px;">ID: ${candidateData.candidateId || 'N/A'}</p>
                    </div>
                </div>

                <!-- Candidate Information Section -->
                <div style="background: var(--light-color); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: var(--text-color); font-size: 18px; font-weight: 600;">Candidate Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Position</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${candidateData.position || 'N/A'}</p>
                        </div>
                        <div class="detail-item">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Status</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">
                                <span class="status-badge ${statusClass}" style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${statusText}</span>
                            </p>
                        </div>
                        <div class="detail-item" style="grid-column: span 2;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Constituency</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${candidateData.constituency || 'N/A'}</p>
                        </div>
                        ${candidateData.createdAt ? `
                        <div class="detail-item" style="grid-column: span 2;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Created At</label>
                            <p style="margin: 0; color: var(--text-color); font-size: 15px; font-weight: 500;">${createdDateStr}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Navigation at bottom -->
                ${allCandidates.length > 1 ? `
                <div style="display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; padding-top: 20px; border-top: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewCandidateDetails('${candidateId}', 'prev')"
                            style="display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Previous
                        </button>
                        <span style="color: var(--text-light); font-size: 12px; padding: 8px 8px; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0;">
                            ${currentIndex + 1} of ${allCandidates.length}
                        </span>
                        <button 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === allCandidates.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewCandidateDetails('${candidateId}', 'next')"
                            style="display: flex; align-items: center; gap: 6px;">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Use requestAnimationFrame for smooth modal rendering
        requestAnimationFrame(() => {
            let modalOverlay = document.getElementById('modal-overlay');
            if (!modalOverlay) {
                const overlay = document.createElement('div');
                overlay.id = 'modal-overlay';
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-container" id="modal-container" style="max-width: 700px;">
                        <div class="modal-header">
                            <h2 id="modal-title">Candidate Details</h2>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <button class="modal-maximize" id="modal-maximize-btn" title="Maximize" onclick="if (typeof toggleModalMaximize === 'function') { const container = this.closest('.modal-container'); toggleModalMaximize(container, this); }">
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
                        <div class="modal-body" id="modal-body"></div>
                    </div>
                `;
                document.body.appendChild(overlay);
                modalOverlay = overlay;

                const closeBtn = overlay.querySelector('#modal-close-btn');
                if (closeBtn && !closeBtn.dataset.listenerAttached) {
                    closeBtn.dataset.listenerAttached = 'true';
                    closeBtn.addEventListener('click', () => {
                        overlay.style.display = 'none';
                    });
                }
                if (!overlay.dataset.listenerAttached) {
                    overlay.dataset.listenerAttached = 'true';
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            overlay.style.display = 'none';
                        }
                    });
                }
            }

            const modalBody = modalOverlay.querySelector('#modal-body');
            const modalTitle = modalOverlay.querySelector('#modal-title');

            if (modalTitle) modalTitle.textContent = 'Candidate Details';
            if (modalBody) {
                modalBody.innerHTML = modalHTML;
            }
            modalOverlay.style.display = 'flex';
        });
    } catch (error) {
        console.error('Error loading candidate details:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load candidate data. Please try again.', 'Error');
        }
    }
}

// Edit candidate function
async function editCandidate(candidateId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const candidateRef = doc(window.db, 'candidates', candidateId);
        const candidateSnap = await getDoc(candidateRef);

        if (!candidateSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Candidate not found.', 'Error');
            }
            return;
        }

        const candidateData = candidateSnap.data();

        // Verify the candidate belongs to the current user
        if (candidateData.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to edit this candidate.', 'Access Denied');
            }
            return;
        }

        // Close details modal if open
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }

        // Open candidate form modal with pre-filled data
        if (window.openModal) {
            window.openModal('candidate', candidateId);

            // Wait for modal to render, then populate form
            setTimeout(() => {
                populateCandidateEditForm(candidateData, candidateId);
            }, 300);
        }
    } catch (error) {
        console.error('Error loading candidate for edit:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load candidate data. Please try again.', 'Error');
        }
    }
}

// Populate candidate form with existing data for editing
function populateCandidateEditForm(candidateData, candidateId) {
    // Set candidate name
    const nameInput = document.getElementById('candidate-name');
    if (nameInput) {
        nameInput.value = candidateData.name || '';
    }

    // Set candidate ID
    const idInput = document.getElementById('candidate-id');
    if (idInput) {
        idInput.value = candidateData.candidateId || '';
    }

    // Set position (ensure dropdown is populated first)
    const positionSelect = document.getElementById('candidate-position');
    if (positionSelect) {
        // Make sure position dropdown is populated
        if (window.setupCandidatePositionDropdown && typeof window.setupCandidatePositionDropdown === 'function') {
            window.setupCandidatePositionDropdown();
        }
        // Set the value after a short delay to ensure dropdown is populated
        setTimeout(() => {
            const positionValue = candidateData.position || '';
            if (positionValue) {
                // Check if the value exists in the dropdown
                const optionExists = Array.from(positionSelect.options).some(opt => opt.value === positionValue);
                if (optionExists) {
                    positionSelect.value = positionValue;
                } else {
                    // If position doesn't exist in filtered list, add it temporarily (for backward compatibility)
                    const option = document.createElement('option');
                    option.value = positionValue;
                    option.textContent = positionValue;
                    positionSelect.appendChild(option);
                    positionSelect.value = positionValue;
                }
            }
        }, 150);
    }

    // Set constituency
    const constituencySelect = document.getElementById('candidate-constituency');
    if (constituencySelect) {
        constituencySelect.value = candidateData.constituency || '';
    }

    // Set status
    const statusSelect = document.getElementById('candidate-status');
    if (statusSelect) {
        statusSelect.value = candidateData.status || 'pending';
    }

    // Store candidate ID for update
    const form = document.getElementById('modal-form');
    if (form) {
        form.dataset.editCandidateId = candidateId;

        // Update submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Candidate';
        }
    }

    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Candidate';
    }
}

// Delete candidate function
async function deleteCandidate(candidateId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to delete this candidate? This action cannot be undone.',
            'Delete Candidate'
        );
        if (!confirmed) return;
    } else if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
        return;
    }

    try {
        const {
            doc,
            getDoc,
            deleteDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify candidate exists and belongs to user before deleting
        const candidateRef = doc(window.db, 'candidates', candidateId);
        const candidateSnap = await getDoc(candidateRef);

        if (!candidateSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Candidate not found.', 'Error');
            }
            return;
        }

        const candidateData = candidateSnap.data();

        // Verify the candidate belongs to the current user
        if (candidateData.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this candidate.', 'Access Denied');
            }
            return;
        }

        // Delete the candidate document
        await deleteDoc(candidateRef);

        // Clear cache
        clearCache('candidates');
        clearCache('activities');

        // Reload table
        if (window.reloadTableData) {
            window.reloadTableData('candidates');
        } else {
            loadCandidatesData(true);
        }

        // Show success message
        if (window.showSuccessMessage) {
            window.showSuccessMessage('Candidate deleted successfully.', 'Deleted');
        } else if (window.showSuccess) {
            window.showSuccess('Candidate deleted successfully.', 'Success');
        }

        // Close modal if open
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    } catch (error) {
        console.error('Error deleting candidate:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete candidate. Please try again.', 'Error');
        }
    }
}

// Reload table data function - directly refreshes table without reloading entire page
function reloadTableData(type, editVoterId = null, editPledgeId = null, editAgentId = null, editCandidateId = null) {
    // Clear relevant caches first to force fresh data
    if (type === 'voter' || type === 'voters') {
        clearCache('voters');
        clearCache('activities');
    } else if (type === 'candidate' || type === 'candidates') {
        clearCache('candidates');
        clearCache('activities');
    } else if (type === 'event' || type === 'events') {
        clearCache('events');
        clearCache('activities');
    } else if (type === 'call' || type === 'calls') {
        clearCache('calls');
        clearCache('activities');
    } else if (type === 'pledge' || type === 'pledges') {
        clearCache('pledges');
        clearCache('activities');
    } else if (type === 'agent' || type === 'agents') {
        clearCache('agents');
    } else if (type === 'ballot' || type === 'ballots') {
        // Clear ballots cache
        if (window.ballotsCache) {
            window.ballotsCache.data = [];
            window.ballotsCache.lastFetch = null;
        }
    } else if (type === 'transportation') {
        // Clear transportation cache for all types
        ['flights', 'speedboats', 'taxis'].forEach(transportType => {
            const cacheKey = `transportation_${transportType}`;
            if (window[cacheKey]) {
                window[cacheKey].data = [];
                window[cacheKey].lastFetch = null;
            }
        });
    }

    // Map form type to data loading function - functions are in same scope
    const dataLoaders = {
        'candidate': loadCandidatesData,
        'candidates': loadCandidatesData,
        'voter': loadVotersData,
        'voters': loadVotersData,
        'event': loadEventsData,
        'events': loadEventsData,
        'call': loadCallsData,
        'calls': loadCallsData,
        'pledge': loadPledgesData,
        'pledges': loadPledgesData,
        'agent': loadAgentsData,
        'agents': loadAgentsData,
        'ballot': loadBallotsData,
        'ballots': loadBallotsData
    };

    const loader = dataLoaders[type];
    if (loader && typeof loader === 'function') {
        // Force refresh by passing true
        loader(true);
        setTimeout(() => {
            try {
                loader();

                // If editing a voter, refresh the details view if it's open
                if (type === 'voter' && editVoterId) {
                    setTimeout(() => {
                        if (window.viewVoterDetails) {
                            window.viewVoterDetails(editVoterId);
                        }
                    }, 1000);
                }

                // If editing a pledge, refresh the details view if it's open
                if (type === 'pledge' && editPledgeId) {
                    setTimeout(() => {
                        if (window.viewPledgeDetails) {
                            window.viewPledgeDetails(editPledgeId);
                        }
                    }, 1000);
                }

                // If editing a candidate, refresh the details view if it's open
                if (type === 'candidate' && editCandidateId) {
                    setTimeout(() => {
                        if (window.viewCandidateDetails) {
                            window.viewCandidateDetails(editCandidateId);
                        }
                    }, 1000);
                }
            } catch (error) {
                console.error(`Error reloading ${type} data:`, error);
                // Fallback: reload entire page
                const sectionMap = {
                    'candidate': 'candidates',
                    'voter': 'voters',
                    'event': 'events',
                    'call': 'calls',
                    'pledge': 'pledges',
                    'agent': 'agents'
                };
                const section = sectionMap[type];
                if (section && window.loadPageContent) {
                    const prevSection = currentSection;
                    currentSection = null;
                    setTimeout(() => {
                        window.loadPageContent(section);
                        setTimeout(() => {
                            currentSection = prevSection;
                        }, 100);
                    }, 300);
                }
            }
        }, 300);
    } else {
        console.warn(`No data loader found for type: ${type}`);
        // Fallback: reload the entire page content
        const sectionMap = {
            'candidate': 'candidates',
            'voter': 'voters',
            'event': 'events',
            'call': 'calls',
            'pledge': 'pledges',
            'agent': 'agents'
        };
        const section = sectionMap[type];
        if (section && window.loadPageContent) {
            // Force reload by temporarily clearing currentSection
            const prevSection = currentSection;
            currentSection = null;
            setTimeout(() => {
                window.loadPageContent(section);
                // Restore current section after reload
                setTimeout(() => {
                    currentSection = prevSection;
                }, 100);
            }, 300);
        }
    }
}

// Assign voters to agent
async function assignVotersToAgent(agentId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        // Get agent details
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();

        // Fetch all voters for this campaign
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
        const votersSnapshot = await getDocs(votersQuery);

        if (votersSnapshot.empty) {
            if (window.showErrorDialog) {
                window.showErrorDialog('No voters found. Please import voters first.', 'No Voters');
            }
            return;
        }

        // Create modal for voter assignment
        const modalOverlay = ensureModalExists();
        if (!modalOverlay) return;

        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');

        if (!modalBody || !modalTitle) return;

        modalTitle.textContent = `Assign Voters to ${agentData.name}`;

        // Create voter selection interface
        const voters = [];
        votersSnapshot.forEach(voterDoc => {
            const voterData = voterDoc.data();
            voters.push({
                id: voterDoc.id,
                name: voterData.name || 'N/A',
                idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                currentAgent: voterData.assignedAgentId || null
            });
        });

        let html = `
            <div style="max-height: 500px; overflow-y: auto;">
                <div style="margin-bottom: 15px;">
                    <input type="text" id="voter-search-assign" placeholder="Search voters..." 
                           style="width: 100%; padding: 10px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px;">
                </div>
                <div id="voter-assignment-list" style="display: flex; flex-direction: column; gap: 10px;">
        `;

        voters.forEach(voter => {
            const isAssigned = voter.currentAgent === agentId;
            const isAssignedOther = voter.currentAgent && voter.currentAgent !== agentId;
            html += `
                <label style="display: flex; align-items: center; padding: 12px; border: 2px solid ${isAssigned ? 'var(--primary-color)' : 'var(--border-color)'}; 
                       border-radius: 8px; cursor: pointer; background: ${isAssigned ? 'var(--primary-50)' : 'white'}; 
                       transition: all 0.2s;" 
                       data-voter-id="${voter.id}" data-voter-name="${voter.name.toLowerCase()}">
                    <input type="checkbox" ${isAssigned ? 'checked' : ''} 
                           data-voter-id="${voter.id}" 
                           style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;"
                           ${isAssignedOther ? 'disabled' : ''}>
                    <div style="flex: 1;">
                        <strong style="display: block; color: var(--text-color);">${voter.name}</strong>
                        <span style="font-size: 12px; color: var(--text-light);">ID: ${voter.idNumber}</span>
                        ${isAssignedOther ? '<span style="font-size: 11px; color: var(--warning-color); margin-left: 10px;">(Assigned to another agent)</span>' : ''}
                    </div>
                </label>
            `;
        });

        html += `
                </div>
            </div>
            <div id="assignment-error" class="error-message" style="display: none; margin-top: 15px;"></div>
            <div class="modal-footer" style="margin-top: 20px;">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn-primary btn-compact" onclick="saveVoterAssignment('${agentId}')">Save Assignment</button>
            </div>
        `;

        modalBody.innerHTML = html;
        modalOverlay.style.display = 'flex';

        // Add search functionality
        const searchInput = document.getElementById('voter-search-assign');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const listItems = document.querySelectorAll('#voter-assignment-list label');
                listItems.forEach(item => {
                    const voterName = item.dataset.voterName || '';
                    if (voterName.includes(searchTerm) || item.textContent.toLowerCase().includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }

    } catch (error) {
        console.error('Error assigning voters to agent:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load voters for assignment. Please try again.', 'Error');
        }
    }
}

// Save voter assignment
async function saveVoterAssignment(agentId) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            updateDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const checkboxes = document.querySelectorAll('#voter-assignment-list input[type="checkbox"]:not(:disabled)');
        const assignedVoters = [];
        const unassignedVoters = [];

        checkboxes.forEach(checkbox => {
            const voterId = checkbox.dataset.voterId;
            if (checkbox.checked) {
                assignedVoters.push(voterId);
            } else {
                // Check if it was previously assigned to this agent
                const label = checkbox.closest('label');
                const wasAssigned = label.style.background === 'var(--primary-50)' || checkbox.checked;
                if (wasAssigned) {
                    unassignedVoters.push(voterId);
                }
            }
        });

        // Update all assigned voters
        for (const voterId of assignedVoters) {
            const voterRef = doc(window.db, 'voters', voterId);
            await updateDoc(voterRef, {
                assignedAgentId: agentId
            });
        }

        // Remove assignment from unassigned voters
        for (const voterId of unassignedVoters) {
            const voterRef = doc(window.db, 'voters', voterId);
            await updateDoc(voterRef, {
                assignedAgentId: null
            });
        }

        // Show success message
        if (window.showSuccess) {
            window.showSuccess(`Successfully assigned ${assignedVoters.length} voter(s) to agent.`, 'Success');
        }

        // Close modal
        closeModal();

        // Reload agents data
        if (window.reloadTableData) {
            window.reloadTableData('agent');
        }

    } catch (error) {
        console.error('Error saving voter assignment:', error);
        const errorEl = document.getElementById('assignment-error');
        if (errorEl) {
            errorEl.textContent = 'Failed to save assignment. Please try again.';
            errorEl.style.display = 'block';
        }
    }
}

// Generate agent access link
async function generateAgentLink(agentId) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            getDoc,
            updateDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();

        // Generate or get existing access code
        let accessCode = agentData.agentAccessCode;
        if (!accessCode) {
            accessCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
            await updateDoc(agentRef, {
                agentAccessCode: accessCode
            });
        }

        // Create shareable link (without code in URL)
        // Use a more robust method that works across browsers and devices
        let baseUrl = '';

        // Method 1: Try to get base URL from current location
        try {
            const currentUrl = new URL(window.location.href);
            // Remove the filename (index.html) from the path
            const pathParts = currentUrl.pathname.split('/').filter(p => p && !p.endsWith('.html'));
            const basePath = pathParts.length > 0 ? '/' + pathParts.join('/') + '/' : '/';
            baseUrl = currentUrl.origin + basePath;
        } catch (e) {
            // Fallback: Use origin + current directory
            const pathname = window.location.pathname;
            const lastSlash = pathname.lastIndexOf('/');
            const basePath = lastSlash >= 0 ? pathname.substring(0, lastSlash + 1) : '/';
            baseUrl = window.location.origin + basePath;
        }

        // Ensure baseUrl ends with /
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }

        const agentLink = `${baseUrl}agent.html`;

        // Debug: Log the generated link
        console.log('[generateAgentLink] Generated link:', {
            currentLocation: window.location.href,
            baseUrl: baseUrl,
            agentLink: agentLink
        });

        // Show link in modal
        const modalOverlay = ensureModalExists();
        if (!modalOverlay) return;

        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');

        if (!modalBody || !modalTitle) return;

        modalTitle.textContent = `Agent Access Link - ${agentData.name}`;

        modalBody.innerHTML = `
            <div style="padding: 20px;">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Share this link with the agent:</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="agent-link-input" value="${agentLink}" readonly
                               style="flex: 1; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--light-color);">
                        <button class="btn-primary btn-compact" onclick="copyAgentLink()" style="white-space: nowrap;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        </button>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Access Code (Share separately):</label>
                    <div style="display: flex; gap: 8px;">
                        <div style="position: relative; flex: 1;">
                            <input type="text" id="agent-code-input" value="${accessCode}" readonly
                                   style="width: 100%; padding: 12px 45px 12px 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 18px; background: var(--light-color); text-align: center; font-weight: 700; letter-spacing: 6px; font-family: monospace;">
                            <button class="icon-btn" onclick="changeAgentAccessCodeInModal('${agentId}', '${accessCode}')" 
                                    title="Change Access Code"
                                    style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--warning-color); color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                        </div>
                        <button class="btn-primary btn-compact" onclick="copyAgentCode()" style="white-space: nowrap;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy Code
                        </button>
                    </div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: var(--primary-50); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                    <p style="margin: 0; font-size: 13px; color: var(--text-color); line-height: 1.6;">
                        <strong>Important:</strong> Share the link and access code separately with the agent. The agent will need to enter the access code when they open the link.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Close</button>
            </div>
        `;

        modalOverlay.style.display = 'flex';

    } catch (error) {
        console.error('Error generating agent link:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to generate agent link. Please try again.', 'Error');
        }
    }
}

// Copy agent access code to clipboard
function copyAgentCode() {
    const codeInput = document.getElementById('agent-code-input');
    if (codeInput) {
        codeInput.select();
        codeInput.setSelectionRange(0, 99999); // For mobile devices
        try {
            document.execCommand('copy');
            if (window.showSuccess) {
                window.showSuccess('Access code copied to clipboard!', 'Copied');
            }
        } catch (err) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Failed to copy code. Please copy manually.', 'Error');
            }
        }
    }
}

// Copy agent link to clipboard
function copyAgentLink() {
    const linkInput = document.getElementById('agent-link-input');
    if (linkInput) {
        linkInput.select();
        linkInput.setSelectionRange(0, 99999); // For mobile devices
        try {
            document.execCommand('copy');
            if (window.showSuccess) {
                window.showSuccess('Link copied to clipboard!', 'Copied');
            }
        } catch (err) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Failed to copy link. Please copy manually.', 'Error');
            }
        }
    }
}

// View Agent Details (complete information)
async function viewAgentDetails(agentId, navigateDirection = null) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            getDoc,
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all agents for navigation
        const agentsQuery = query(collection(window.db, 'agents'), where('email', '==', window.userEmail));
        const allAgentsSnapshot = await getDocs(agentsQuery);
        const allAgents = allAgentsSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        let currentIndex = allAgents.findIndex(a => a.id === agentId);

        // Handle navigation
        if (navigateDirection === 'prev' && currentIndex > 0) {
            agentId = allAgents[currentIndex - 1].id;
            currentIndex = currentIndex - 1;
        } else if (navigateDirection === 'next' && currentIndex < allAgents.length - 1) {
            agentId = allAgents[currentIndex + 1].id;
            currentIndex = currentIndex + 1;
        }

        // Get agent data
        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();

        // Count assigned voters
        let assignedVotersCount = 0;
        try {
            const votersQuery = query(
                collection(window.db, 'voters'),
                where('email', '==', window.userEmail),
                where('assignedAgentId', '==', agentId)
            );
            const votersSnapshot = await getDocs(votersQuery);
            assignedVotersCount = votersSnapshot.size;
        } catch (error) {
            console.warn('Could not count assigned voters:', error);
        }

        // Fetch all pledges made by this agent
        const pledgesQuery = query(
            collection(window.db, 'pledges'),
            where('email', '==', window.userEmail),
            where('agentId', '==', agentId)
        );
        const pledgesSnapshot = await getDocs(pledgesQuery);
        const pledgesCount = pledgesSnapshot.size;

        // Calculate success rate based on positive pledges
        let successRate = 0;
        let positivePledges = 0;
        if (pledgesCount > 0) {
            pledgesSnapshot.forEach(pledgeDoc => {
                const pledgeData = pledgeDoc.data();
                const pledge = pledgeData.pledge || '';
                if (pledge.toLowerCase().includes('yes') ||
                    pledge.toLowerCase().includes('support') ||
                    pledge.toLowerCase().includes('positive') ||
                    pledge.toLowerCase() === 'yes') {
                    positivePledges++;
                }
            });
            successRate = Math.round((positivePledges / pledgesCount) * 100);
        }

        // Show detail modal
        const modalOverlay = ensureModalExists();
        if (!modalOverlay) return;

        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');
        const modalFooter = document.getElementById('modal-footer');

        if (!modalBody || !modalTitle) return;

        modalTitle.textContent = `Agent Details - ${agentData.name || 'N/A'}`;

        modalBody.innerHTML = `
            <div style="max-width: 700px; margin: 0 auto;">
                <!-- Actions at top right -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <div style="display: flex; gap: 8px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button class="icon-btn" onclick="closeModal(); generateAgentLink('${agentId}');" title="Generate Link" style="width: 40px; height: 40px; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(111, 193, 218, 0.3); display: inline-flex; align-items: center; justify-content: center; padding: 0;" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(111, 193, 218, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(111, 193, 218, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" onclick="closeModal(); viewAgentPerformance('${agentId}');" title="View Performance" style="width: 40px; height: 40px; background: var(--white); color: var(--text-color); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; padding: 0;" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'; this.style.borderColor='var(--primary-color)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.1)'; this.style.borderColor='var(--border-color)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="icon-btn" onclick="closeModal(); editAgent('${agentId}');" title="Edit Agent" style="width: 40px; height: 40px; background: var(--white); color: var(--text-color); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; padding: 0;" onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'; this.style.borderColor='var(--primary-color)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.1)'; this.style.borderColor='var(--border-color)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Agent Information -->
                <div style="background: var(--light-color); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
                    <h3 style="font-size: 18px; font-weight: 600; color: var(--text-color); margin-bottom: 20px; font-family: 'Poppins', sans-serif;">Agent Information</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Name</label>
                            <div style="font-size: 15px; color: var(--text-color); font-weight: 600;">${agentData.name || 'N/A'}</div>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Agent ID</label>
                            <div style="font-size: 15px; color: var(--text-color); font-weight: 500; font-family: monospace;">${agentData.agentId || agentId}</div>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Area</label>
                            <div style="font-size: 15px; color: var(--text-color); font-weight: 500;">${agentData.assignedArea || 'N/A'}</div>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Email</label>
                            <div style="font-size: 15px; color: var(--text-color); font-weight: 500;">${agentData.email || agentData.phone || 'N/A'}</div>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Phone</label>
                            <div style="font-size: 15px; color: var(--text-color); font-weight: 500;">${agentData.phone || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Statistics -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: var(--white); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid var(--border-color);">
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 5px;">${assignedVotersCount}</div>
                        <div style="font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Assigned Voters</div>
                    </div>
                    <div style="background: var(--white); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid var(--border-color);">
                        <div style="font-size: 28px; font-weight: 700; color: var(--info-color); margin-bottom: 5px;">${pledgesCount}</div>
                        <div style="font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Number of Pledges</div>
                    </div>
                    <div style="background: var(--white); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid var(--border-color);">
                        <div style="font-size: 28px; font-weight: 700; color: ${successRate >= 70 ? 'var(--success-color)' : successRate >= 50 ? 'var(--warning-color)' : 'var(--text-light)'}; margin-bottom: 5px;">${successRate}%</div>
                        <div style="font-size: 12px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Success Rate</div>
                    </div>
                </div>
            </div>
        `;

        if (modalFooter) {
            modalFooter.innerHTML = `
                <div style="display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 8px; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <!-- Navigation -->
                    ${allAgents.length > 1 ? `
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewAgentDetails('${agentId}', 'prev')"
                            style="display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Previous
                        </button>
                        <span style="color: var(--text-light); font-size: 12px; padding: 8px 8px; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0;">
                            ${currentIndex + 1} of ${allAgents.length}
                        </span>
                        <button 
                            class="btn-secondary btn-compact" 
                            ${currentIndex === allAgents.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewAgentDetails('${agentId}', 'next')"
                            style="display: flex; align-items: center; gap: 6px;">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                    ` : '<div></div>'}
                </div>
            `;
        }

        modalOverlay.style.display = 'flex';
        setTimeout(() => modalOverlay.classList.add('active'), 10);
    } catch (error) {
        console.error('Error loading agent details:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load agent details. Please try again.', 'Error');
        }
    }
}

// Make function globally available
window.viewAgentDetails = viewAgentDetails;

// View Agent Performance
async function viewAgentPerformance(agentId) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            getDoc,
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get agent data
        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();

        // Fetch all pledges made by this agent
        const pledgesQuery = query(
            collection(window.db, 'pledges'),
            where('agentId', '==', agentId)
        );
        const pledgesSnapshot = await getDocs(pledgesQuery);

        const pledges = [];
        pledgesSnapshot.forEach(doc => {
            pledges.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Fetch all remarks made by this agent
        const remarksQuery = query(
            collection(window.db, 'remarks'),
            where('agentId', '==', agentId)
        );
        const remarksSnapshot = await getDocs(remarksQuery);

        const remarks = [];
        remarksSnapshot.forEach(doc => {
            remarks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Count pledges by status
        const positiveCount = pledges.filter(p => p.pledge === 'yes').length;
        const negativeCount = pledges.filter(p => p.pledge === 'no').length;
        const undecidedCount = pledges.filter(p => p.pledge === 'undecided').length;
        const urgentRemarks = remarks.filter(r => r.isUrgent).length;

        // Show performance modal
        const modalOverlay = ensureModalExists();
        if (!modalOverlay) return;

        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');

        if (!modalBody || !modalTitle) return;

        modalTitle.textContent = `Agent Performance - ${agentData.name}`;

        modalBody.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <!-- Performance Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: var(--light-color); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--success-color); margin-bottom: 5px;">${positiveCount}</div>
                        <div style="font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Positive</div>
                    </div>
                    <div style="background: var(--light-color); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--danger-color); margin-bottom: 5px;">${negativeCount}</div>
                        <div style="font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Negative</div>
                    </div>
                    <div style="background: var(--light-color); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--warning-color); margin-bottom: 5px;">${undecidedCount}</div>
                        <div style="font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Undecided</div>
                    </div>
                    <div style="background: var(--light-color); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary-color); margin-bottom: 5px;">${pledges.length}</div>
                        <div style="font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Total Pledges</div>
                    </div>
                    <div style="background: var(--light-color); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: ${urgentRemarks > 0 ? 'var(--danger-color)' : 'var(--text-light)'}; margin-bottom: 5px;">${urgentRemarks}</div>
                        <div style="font-size: 13px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">Urgent Remarks</div>
                    </div>
                </div>
                
                <!-- Recent Pledges -->
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Recent Pledges</h3>
                <div class="table-container" style="max-height: 400px; overflow-y: auto; margin-bottom: 30px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Voter Name</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pledges.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-light);">No pledges recorded yet</td></tr>' : ''}
                            ${pledges.slice(0, 20).map(pledge => {
                                const date = pledge.recordedAt ? (pledge.recordedAt.toDate ? pledge.recordedAt.toDate() : new Date(pledge.recordedAt)) : new Date();
                                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                let statusClass = 'status-pending';
                                let statusText = 'Undecided';
                                if (pledge.pledge === 'yes') {
                                    statusClass = 'status-success';
                                    statusText = 'Positive';
                                } else if (pledge.pledge === 'no' || pledge.pledge === 'negative') {
                                    statusClass = 'status-danger';
                                    statusText = 'Negative';
                                }
                                return ` <
            tr >
            <
            td > < strong > $ {
                pledge.voterName || 'N/A'
            } < /strong></td >
            <
            td > < span class = "status-badge ${statusClass}" > $ {
                statusText
            } < /span></td >
            <
            td > $ {
                dateStr
            } < /td> <
        td style = "max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        title = "${pledge.notes || ''}" > $ {
            pledge.notes || 'N/A'
        } < /td> < /
        tr >
            `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Recent Remarks -->
                ${remarks.length > 0 ? `
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: var(--text-color);">Recent Remarks</h3>
                    <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Voter Name</th>
                                    <th>Remark</th>
                                    <th>Urgent</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${remarks.slice(0, 15).map(remark => {
                                    const date = remark.createdAt ? (remark.createdAt.toDate ? remark.createdAt.toDate() : new Date(remark.createdAt)) : new Date();
                                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    return `
                                        <tr>
                                            <td><strong>${remark.voterName || 'N/A'}</strong></td>
                                            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${remark.remark || ''}">${remark.remark || 'N/A'}</td>
                                            <td>${remark.isUrgent ? '<span class="status-badge" style="background: var(--danger-color); color: white;">Urgent</span>' : 'No'}</td>
                                            <td>${dateStr}</td>
                                        </tr>
                                    `;
    }).join('')
} <
/tbody> < /
table > <
    /div>
` : ''}
            </div>
            <div class="modal-footer" style="margin-top: 20px;">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Close</button>
            </div>
        `;

modalOverlay.style.display = 'flex';

}
catch (error) {
    console.error('Error loading agent performance:', error);
    if (window.showErrorDialog) {
        window.showErrorDialog('Failed to load agent performance. Please try again.', 'Error');
    }
}
}

// Helper function to ensure modal exists
function ensureModalExists() {
    let modalOverlay = document.getElementById('modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'modal-overlay';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-container" id="modal-container" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 id="modal-title">Modal</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="modal-maximize" id="modal-maximize-btn" title="Maximize" onclick="if (typeof toggleModalMaximize === 'function') { const container = this.closest('.modal-container'); toggleModalMaximize(container, this); }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                        </button>
                        <button class="modal-close" onclick="closeModal()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="modal-body" id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Add click outside to close
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    return modalOverlay;
}

window.viewVoterDetails = viewVoterDetails;
window.viewPledgeDetails = viewPledgeDetails;
window.viewCandidateDetails = viewCandidateDetails;
window.editVoter = editVoter;
window.deleteVoter = deleteVoter;
window.editPledge = editPledge;
window.deletePledge = deletePledge;
window.editCandidate = editCandidate;
window.deleteCandidate = deleteCandidate;
window.editAgent = editAgent;

// Delete event function
async function deleteEvent(eventId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Confirm deletion
    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to delete this event? This action cannot be undone.',
            'Delete Event'
        );
        if (!confirmed) return;
    } else if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    try {
        const {
            doc,
            getDoc,
            deleteDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Verify event exists and belongs to user before deleting
        const eventRef = doc(window.db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Event not found.', 'Error');
            }
            return;
        }

        const eventData = eventSnap.data();

        // Verify the event belongs to the current user
        if (eventData.campaignEmail !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this event.', 'Access Denied');
            }
            return;
        }

        // Delete the event document
        await deleteDoc(eventRef);

        // Clear cache
        clearCache('events');
        clearCache('activities');

        // Reload events data
        if (window.loadEventsData) {
            window.loadEventsData(true);
        }

        // Show success message
        if (window.showSuccessMessage) {
            window.showSuccessMessage('Event deleted successfully.', 'Deleted');
        } else if (window.showSuccess) {
            window.showSuccess('Event deleted successfully.', 'Success');
        }

        // Close modal if open
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to delete event. Please try again.', 'Error');
        }
    }
}

// Make function globally available
window.deleteEvent = deleteEvent;

// View Call Details Function
async function viewCallDetails(callId, navigateDirection = null) {
    if (!window.db || !window.userEmail) {
        window.showErrorDialog('Database not initialized. Please refresh the page.');
        return;
    }

    let modalTitle, modalBody;

    try {
        const {
            doc,
            getDoc,
            collection,
            query,
            where,
            orderBy,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all calls for navigation - query both campaignEmail and email fields
        let allCalls = [];
        let currentIndex = -1;
        const allCallsMap = new Map(); // Use Map to avoid duplicates

        try {
            // Query by campaignEmail first
            try {
                const callsQuery1 = query(
                    collection(window.db, 'calls'),
                    where('campaignEmail', '==', window.userEmail),
                    orderBy('callDate', 'desc')
                );
                const allCallsSnapshot1 = await getDocs(callsQuery1);
                allCallsSnapshot1.docs.forEach(d => {
                    allCallsMap.set(d.id, {
                        id: d.id,
                        ...d.data()
                    });
                });
            } catch (queryError1) {
                // If index missing, query without orderBy
                if (queryError1.code === 'failed-precondition' && queryError1.message.includes('index')) {
                    const fallbackQuery1 = query(
                        collection(window.db, 'calls'),
                        where('campaignEmail', '==', window.userEmail)
                    );
                    const fallbackSnapshot1 = await getDocs(fallbackQuery1);
                    fallbackSnapshot1.docs.forEach(d => {
                        allCallsMap.set(d.id, {
                            id: d.id,
                            ...d.data()
                        });
                    });
                }
            }

            // Also query by email field to catch records that might only have email
            try {
                const callsQuery2 = query(
                    collection(window.db, 'calls'),
                    where('email', '==', window.userEmail),
                    orderBy('callDate', 'desc')
                );
                const allCallsSnapshot2 = await getDocs(callsQuery2);
                allCallsSnapshot2.docs.forEach(d => {
                    // Only add if not already in map (avoid duplicates)
                    if (!allCallsMap.has(d.id)) {
                        allCallsMap.set(d.id, {
                            id: d.id,
                            ...d.data()
                        });
                    }
                });
            } catch (queryError2) {
                // If index missing, query without orderBy
                if (queryError2.code === 'failed-precondition' && queryError2.message.includes('index')) {
                    const fallbackQuery2 = query(
                        collection(window.db, 'calls'),
                        where('email', '==', window.userEmail)
                    );
                    const fallbackSnapshot2 = await getDocs(fallbackQuery2);
                    fallbackSnapshot2.docs.forEach(d => {
                        if (!allCallsMap.has(d.id)) {
                            allCallsMap.set(d.id, {
                                id: d.id,
                                ...d.data()
                            });
                        }
                    });
                }
            }

            // Convert Map to array and sort by callDate descending
            allCalls = Array.from(allCallsMap.values()).sort((a, b) => {
                const dateA = a.callDate ? (a.callDate.toDate ? a.callDate.toDate() : new Date(a.callDate)) : new Date(0);
                const dateB = b.callDate ? (b.callDate.toDate ? b.callDate.toDate() : new Date(b.callDate)) : new Date(0);
                return dateB - dateA; // Descending order
            });

            currentIndex = allCalls.findIndex(c => c.id === callId);
        } catch (error) {
            console.error('Error fetching calls for navigation:', error);
            // Fallback: try to get at least the current call
            allCalls = [];
            currentIndex = -1;
        }

        // Handle navigation
        if (navigateDirection === 'prev' && currentIndex > 0) {
            callId = allCalls[currentIndex - 1].id;
            currentIndex = currentIndex - 1;
        } else if (navigateDirection === 'next' && currentIndex < allCalls.length - 1) {
            callId = allCalls[currentIndex + 1].id;
            currentIndex = currentIndex + 1;
        }

        const callRef = doc(window.db, 'calls', callId);
        const callSnap = await getDoc(callRef);

        if (!callSnap.exists()) {
            window.showErrorDialog('Call record not found.', 'Error');
            return;
        }

        const callData = callSnap.data();

        // Check permission
        if (callData.campaignEmail !== window.userEmail && callData.email !== window.userEmail) {
            window.showErrorDialog('You do not have permission to view this call record.', 'Access Denied');
            return;
        }

        const callDate = callData.callDate ? (callData.callDate.toDate ? callData.callDate.toDate() : new Date(callData.callDate)) : new Date();
        const dateStr = callDate.toLocaleString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusClass = callData.status === 'answered' ? 'status-success' :
            (callData.status === 'no-answer' ? 'status-warning' :
                (callData.status === 'busy' ? 'status-info' : 'status-danger'));
        const statusText = callData.status === 'answered' ? 'Answered' :
            (callData.status === 'no-answer' ? 'No Answer' :
                (callData.status === 'busy' ? 'Busy' : 'Failed'));

        const modalContent = `
            <div class="call-details-modal" style="max-width: 600px; margin: 0 auto;">
                ${allCalls.length > 1 ? `
                <!-- Navigation and Actions at top -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <!-- Navigation controls on left -->
                    <div style="display: flex; gap: 6px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            id="call-nav-prev" 
                            class="icon-btn"
                            ${currentIndex === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewCallDetails('${callId}', 'prev')"
                            title="Previous Call"
                            style="width: 40px; height: 40px; background: var(--white); color: var(--text-color); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; padding: 0;"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'; this.style.borderColor='var(--primary-color)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.1)'; this.style.borderColor='var(--border-color)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <span style="color: var(--text-light); font-size: 12px; padding: 8px 8px; display: flex; align-items: center; white-space: nowrap; flex-shrink: 0;">
                            ${currentIndex + 1} of ${allCalls.length}
                        </span>
                        <button 
                            id="call-nav-next" 
                            class="icon-btn"
                            ${currentIndex === allCalls.length - 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                            onclick="viewCallDetails('${callId}', 'next')"
                            title="Next Call"
                            style="width: 40px; height: 40px; background: var(--white); color: var(--text-color); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; justify-content: center; padding: 0;"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.15)'; this.style.borderColor='var(--primary-color)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(0, 0, 0, 0.1)'; this.style.borderColor='var(--border-color)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                    <!-- CRUD actions on right -->
                    <div style="display: flex; gap: 8px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            type="button"
                            class="icon-btn" 
                            onclick="closeModal(); setTimeout(() => { if (window.openModal) window.openModal('call', '${callId}'); }, 100);" 
                            title="Edit Call"
                            style="width: 40px; height: 40px; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(111, 193, 218, 0.3); display: inline-flex; align-items: center; justify-content: center; padding: 0;"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(111, 193, 218, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(111, 193, 218, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button 
                            type="button"
                            class="icon-btn" 
                            onclick="window.deleteCall('${callId}')" 
                            title="Delete Call"
                            style="width: 40px; height: 40px; background: var(--danger-color); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); display: inline-flex; align-items: center; justify-content: center; padding: 0;"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(220, 38, 38, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                ` : `
                <!-- Actions only when single call -->
                <div style="display: flex; flex-wrap: nowrap; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <div style="display: flex; gap: 8px; flex-wrap: nowrap; flex-shrink: 0;">
                        <button 
                            type="button"
                            class="icon-btn" 
                            onclick="closeModal(); setTimeout(() => { if (window.openModal) window.openModal('call', '${callId}'); }, 100);" 
                            title="Edit Call"
                            style="width: 40px; height: 40px; background: linear-gradient(135deg, #6fc1da 0%, #8dd4e8 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(111, 193, 218, 0.3); display: inline-flex; align-items: center; justify-content: center; padding: 0;"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(111, 193, 218, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(111, 193, 218, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button 
                            type="button"
                            class="icon-btn" 
                            onclick="window.deleteCall('${callId}')" 
                            title="Delete Call"
                            style="width: 40px; height: 40px; background: var(--danger-color); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); display: inline-flex; align-items: center; justify-content: center; padding: 0;"
                            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.4)'"
                            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 2px 8px rgba(220, 38, 38, 0.3)'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                `}

                <div style="display: grid; gap: 1.5rem;">
                    <div style="background: var(--light-color); padding: 1.25rem; border-radius: 12px;">
                        <div style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.5rem;">Voter Information</div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${(() => {
                                const voterIdNumber = callData.voterId || '';
                                const voterName = callData.voterName || 'N/A';
                                const initials = voterName && voterName !== 'N/A' ? voterName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
                                const imageUrl = voterIdNumber ? getVoterImageUrl({}, voterIdNumber) : '';
                                const constituency = callData.constituency || callData.voterConstituency || 'N/A';
                                const island = callData.island || callData.voterIsland || 'N/A';
                                return imageUrl ? 
                                    ` < img id = "call-detail-image"
        src = "${imageUrl}"
        alt = "${voterName}"
        style = "width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);"
        data - voter - id = "${voterIdNumber}"
        onerror = "this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${voterIdNumber}').then(function(found) { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });" / >
            <
            div id = "call-detail-fallback"
        style = "width: 60px; height: 60px; border-radius: 50%; display: none; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 20px; border: 2px solid var(--primary-color);" > $ {
            initials
        } < /div>` :
        `<div id="call-detail-fallback" style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 20px; border: 2px solid var(--primary-color);">${initials}</div>`;
    })()
} <
/div> <div > <
div style = "font-size: 1.125rem; font-weight: 600; color: var(--text-color); margin-bottom: 0.25rem;" > $ {
    callData.voterName || 'N/A'
} < /div> <
div style = "font-size: 0.875rem; color: var(--text-light);" > ID: $ {
    callData.voterId || 'N/A'
} < /div> < /
div > <
    /div>

    <
    div style = "background: var(--light-color); padding: 1.25rem; border-radius: 12px;" >
    <
    div style = "font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.5rem;" > Call Information < /div> <
div style = "display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" >
    <
    div >
    <
    div style = "font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.25rem;" > Caller < /div> <
div style = "font-size: 0.9375rem; font-weight: 600; color: var(--text-color);" > $ {
    callData.caller || 'N/A'
} < /div> < /
div > <
    div >
    <
    div style = "font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.25rem;" > Date & Time < /div> <
div style = "font-size: 0.9375rem; font-weight: 600; color: var(--text-color);" > $ {
    dateStr
} < /div> < /
div > <
    div >
    <
    div style = "font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.25rem;" > Status < /div> <
div > < span class = "status-badge ${statusClass}" > $ {
        statusText
    } < /span></div >
    <
    /div> < /
div > <
    /div> < /
div > <
    /div>`;

// Open modal using the existing modal system
if (window.openModal) {
    window.openModal('call', callId);
    // Update modal content with details view
    setTimeout(() => {
        modalTitle = document.getElementById('modal-title');
        modalBody = document.getElementById('modal-body');
        if (modalTitle && modalBody) {
            modalTitle.textContent = 'Call Details';
            modalBody.innerHTML = modalContent;

            // If voterId exists, try to lookup image from images folder asynchronously
            const voterIdNumber = callData.voterId || '';
            if (voterIdNumber && voterIdNumber.trim()) {
                const currentImageUrl = getVoterImageUrl({}, voterIdNumber);
                if (!currentImageUrl) {
                    lookupImageFromFolder(voterIdNumber).then(foundUrl => {
                        if (foundUrl) {
                            const detailImg = modalBody.querySelector('#call-detail-image');
                            const detailFallback = modalBody.querySelector('#call-detail-fallback');

                            if (detailImg) {
                                detailImg.src = foundUrl;
                                detailImg.style.display = '';
                                if (detailFallback) {
                                    detailFallback.style.display = 'none';
                                }
                            } else if (detailFallback) {
                                // If no img element exists, create one
                                const voterName = callData.voterName || 'Voter';
                                const img = document.createElement('img');
                                img.id = 'call-detail-image';
                                img.src = foundUrl;
                                img.alt = voterName;
                                img.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);';
                                img.setAttribute('data-voter-id', voterIdNumber);
                                img.onerror = function() {
                                    this.style.display = 'none';
                                    if (detailFallback) {
                                        detailFallback.style.display = 'flex';
                                    }
                                };
                                detailFallback.parentNode.replaceChild(img, detailFallback);
                            }
                        }
                    }).catch(() => {
                        // Silently fail - fallback will show
                    });
                }
            }
        }
    }, 100);
} else {
    // Fallback: use showDialog if openModal not available
    window.showDialog('Call Details', modalContent);
}
} catch (error) {
    console.error('Error loading call details:', error);
    if (!modalTitle || !modalBody) {
        window.showErrorDialog('Failed to load call details. Please try again.', 'Error');
    } else {
        modalTitle.textContent = 'Error';
        modalBody.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--danger-color);">Failed to load call details. Please try again.</div>';
    }
}
}
window.viewCallDetails = viewCallDetails;

// Open Call Details Side Panel
async function openCallDetailsSidePanel(callId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        } else {
            alert('Database not initialized. Please refresh the page.');
        }
        return;
    }

    const sidePanel = document.getElementById('call-details-side-panel');
    const sidePanelContent = document.getElementById('call-details-side-panel-content');
    const overlay = document.getElementById('call-details-side-panel-overlay');

    if (!sidePanel || !sidePanelContent || !overlay) {
        console.error('[openCallDetailsSidePanel] Side panel elements not found');
        return;
    }

    try {
        // Show loading state
        sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">Loading call details...</div>';
        sidePanel.style.display = 'flex';
        sidePanel.classList.add('show');
        overlay.style.display = 'block';
        // Trigger reflow for animation
        void sidePanel.offsetWidth;

        // Fetch call data
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const callRef = doc(window.db, 'calls', callId);
        const callSnap = await getDoc(callRef);

        if (!callSnap.exists()) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Call record not found.</div>';
            return;
        }

        const callData = callSnap.data();

        // Check permission
        if (callData.campaignEmail !== window.userEmail && callData.email !== window.userEmail) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">You do not have permission to view this call record.</div>';
            return;

            // Get all calls for navigation
            let allCalls = [];
            try {
                const callsQuery1 = query(collection(window.db, 'calls'), where('campaignEmail', '==', window.userEmail), orderBy('callDate', 'desc'));
                const snapshot1 = await getDocs(callsQuery1);
                snapshot1.forEach(doc => {
                    allCalls.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (e) {
                const fallbackQuery1 = query(collection(window.db, 'calls'), where('campaignEmail', '==', window.userEmail));
                const fallbackSnapshot1 = await getDocs(fallbackQuery1);
                fallbackSnapshot1.forEach(doc => {
                    allCalls.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }
            try {
                const callsQuery2 = query(collection(window.db, 'calls'), where('email', '==', window.userEmail), orderBy('callDate', 'desc'));
                const snapshot2 = await getDocs(callsQuery2);
                snapshot2.forEach(doc => {
                    if (!allCalls.find(c => c.id === doc.id)) {
                        allCalls.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    }
                });
            } catch (e) {
                const fallbackQuery2 = query(collection(window.db, 'calls'), where('email', '==', window.userEmail));
                const fallbackSnapshot2 = await getDocs(fallbackQuery2);
                fallbackSnapshot2.forEach(doc => {
                    if (!allCalls.find(c => c.id === doc.id)) {
                        allCalls.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    }
                });
            }

            // Sort by callDate descending
            allCalls.sort((a, b) => {
                const dateA = a.callDate ? (a.callDate.toDate ? a.callDate.toDate() : new Date(a.callDate)) : new Date(0);
                const dateB = b.callDate ? (b.callDate.toDate ? b.callDate.toDate() : new Date(b.callDate)) : new Date(0);
                return dateB - dateA;
            });

            // Find current call index for navigation
            const currentIndex = allCalls.findIndex(c => c.id === callId);
            const prevCallId = currentIndex > 0 ? allCalls[currentIndex - 1].id : null;
            const nextCallId = currentIndex < allCalls.length - 1 ? allCalls[currentIndex + 1].id : null;

        }

        // Format date
        const callDate = callData.callDate ? (callData.callDate.toDate ? callData.callDate.toDate() : new Date(callData.callDate)) : new Date();
        const dateStr = callDate.toLocaleString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Status styling
        const statusClass = callData.status === 'answered' ? 'status-success' :
            (callData.status === 'no-answer' ? 'status-warning' :
                (callData.status === 'busy' ? 'status-info' : 'status-danger'));
        const statusText = callData.status === 'answered' ? 'Answered' :
            (callData.status === 'no-answer' ? 'No Answer' :
                (callData.status === 'busy' ? 'Busy' : 'Failed'));

        // Voter initials for avatar
        const voterName = callData.voterName || 'N/A';
        const initials = voterName && voterName !== 'N/A' ? voterName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
        const voterIdNumber = callData.voterId || '';

        // Build notes section
        const notesSection = callData.notes ?
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Notes & Remarks</div>' +
            '<div style="font-size: 14px; color: var(--text-color); line-height: 1.7; white-space: pre-wrap; word-wrap: break-word;">' + (callData.notes || '') + '</div>' +
            '</div>' :
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Notes & Remarks</div>' +
            '<div style="font-size: 14px; color: var(--text-muted); font-style: italic;">No notes available</div>' +
            '</div>';

        // Build panel content
        const panelHTML = '<div style="display: flex; flex-direction: column; gap: 20px;">' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Voter Information</div>' +
            '<div style="display: flex; align-items: center; gap: 16px;">' +
            '<div id="call-side-panel-avatar" style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 20px; border: 2px solid var(--primary-color); flex-shrink: 0;">' + initials + '</div>' +
            '<div style="flex: 1;">' +
            '<div style="font-size: 18px; font-weight: 600; color: var(--text-color); margin-bottom: 4px;">' + voterName + '</div>' +
            '<div style="font-size: 13px; color: var(--text-light);">ID: ' + (callData.voterId || 'N/A') + '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Call Information</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
            '<div>' +
            '<div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Caller</div>' +
            '<div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (callData.caller || 'N/A') + '</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Date & Time</div>' +
            '<div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + dateStr + '</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Status</div>' +
            '<div><span class="status-badge ' + statusClass + '">' + statusText + '</span></div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Phone</div>' +
            '<div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (callData.phone || callData.number || 'N/A') + '</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Constituency</div>' +
            '<div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (callData.constituency || callData.voterConstituency || 'N/A') + '</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Island</div>' +
            '<div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (callData.island || callData.voterIsland || 'N/A') + '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            notesSection +
            '</div>';

        sidePanelContent.innerHTML = panelHTML;

        // Try to load voter image if available
        if (voterIdNumber && voterIdNumber.trim()) {
            const currentImageUrl = getVoterImageUrl({}, voterIdNumber);
            const avatarEl = document.getElementById('call-side-panel-avatar');
            if (avatarEl && !currentImageUrl) {
                lookupImageFromFolder(voterIdNumber).then(foundUrl => {
                    if (foundUrl && avatarEl) {
                        const img = document.createElement('img');
                        img.src = foundUrl;
                        img.alt = voterName;
                        img.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);';
                        img.onerror = function() {
                            this.style.display = 'none';
                        };
                        avatarEl.parentNode.replaceChild(img, avatarEl);
                    }
                }).catch(() => {
                    // Silently fail - keep initials
                });
            } else if (avatarEl && currentImageUrl) {
                const img = document.createElement('img');
                img.src = currentImageUrl;
                img.alt = voterName;
                img.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);';
                img.onerror = function() {
                    this.style.display = 'none';
                };
                avatarEl.parentNode.replaceChild(img, avatarEl);
            }
        }

    } catch (error) {
        console.error('Error loading call details:', error);
        sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Failed to load call details. Please try again.</div>';
    }
}

// Close Call Details Side Panel
function closeCallDetailsSidePanel() {
    const sidePanel = document.getElementById('call-details-side-panel');
    const overlay = document.getElementById('call-details-side-panel-overlay');

    if (sidePanel) {
        sidePanel.classList.remove('show');
        sidePanel.classList.remove('side-panel-maximized');
        setTimeout(() => {
            sidePanel.style.display = 'none';
        }, 300);
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Generic function to toggle maximize for side panels
function toggleSidePanelMaximize(panelId, buttonId) {
    const sidePanel = document.getElementById(panelId);
    const maximizeBtn = document.getElementById(buttonId);

    if (!sidePanel || !maximizeBtn) return;

    const isMaximized = sidePanel.classList.contains('side-panel-maximized');

    if (isMaximized) {
        // Minimize
        sidePanel.classList.remove('side-panel-maximized');
        maximizeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        `;
        maximizeBtn.title = 'Maximize';
    } else {
        // Maximize
        sidePanel.classList.add('side-panel-maximized');
        maximizeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
        `;
        maximizeBtn.title = 'Restore';
    }
}

// Open Voter Details Side Panel
async function openVoterDetailsSidePanel(voterId) {
    // Use existing viewVoterDetails function but display in side panel
    const sidePanel = document.getElementById('voter-details-side-panel');
    const sidePanelContent = document.getElementById('voter-details-side-panel-content');
    const overlay = document.getElementById('voter-details-side-panel-overlay');

    if (!sidePanel || !sidePanelContent || !overlay) {
        // Fallback to modal if side panel not found
        if (window.viewVoterDetails) {
            window.viewVoterDetails(voterId);
        }
        return;
    }

    // Show loading
    sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">Loading voter details...</div>';
    sidePanel.style.display = 'flex';
    sidePanel.classList.add('show');
    overlay.style.display = 'block';
    void sidePanel.offsetWidth;

    try {
        // Fetch voter data (reuse logic from viewVoterDetails)
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const voterRef = doc(window.db, 'voters', voterId);
        const voterSnap = await getDoc(voterRef);

        if (!voterSnap.exists()) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Voter not found.</div>';
            return;
        }

        const data = voterSnap.data();

        // Verify permission
        if (data.email !== window.userEmail && data.campaignEmail !== window.userEmail) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">You do not have permission to view this voter.</div>';
            return;
        }

        // Format data
        const idNumber = data.idNumber || data.voterId || '';
        const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
        let imageUrl = getVoterImageUrl(data, idNumber);

        // Build content HTML (simplified version)
        const contentHTML = '<div style="display: flex; flex-direction: column; gap: 20px;">' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Voter Information</div>' +
            '<div style="display: flex; align-items: center; gap: 16px;">' +
            '<div id="voter-side-panel-avatar" style="width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 20px; border: 2px solid var(--primary-color); flex-shrink: 0;">' + initials + '</div>' +
            '<div style="flex: 1;">' +
            '<div style="font-size: 18px; font-weight: 600; color: var(--text-color); margin-bottom: 4px;">' + (data.name || 'N/A') + '</div>' +
            '<div style="font-size: 13px; color: var(--text-light);">ID: ' + idNumber + '</div>' +
            '</div></div></div>' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Details</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Age</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.age || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Gender</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.gender || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Island</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.island || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Constituency</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.constituency || data.voterConstituency || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Phone</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.number || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Status</div><div><span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ' + (data.verified ? 'var(--success-color)' : 'var(--warning-color)') + '; color: white;">' + (data.verified ? 'Verified' : 'Pending') + '</span></div></div>' +
            '</div></div>' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Address</div>' +
            '<div style="font-size: 14px; color: var(--text-color); line-height: 1.7;">' + (data.permanentAddress || 'N/A') + '</div>' +
            '</div></div>';

        sidePanelContent.innerHTML = contentHTML;

        // Try to load image
        if (idNumber && idNumber.trim()) {
            const avatarEl = document.getElementById('voter-side-panel-avatar');
            if (avatarEl) {
                if (!imageUrl) {
                    lookupImageFromFolder(idNumber).then(foundUrl => {
                        if (foundUrl && avatarEl) {
                            const img = document.createElement('img');
                            img.src = foundUrl;
                            img.alt = data.name || 'Voter';
                            img.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);';
                            img.onerror = function() {
                                this.style.display = 'none';
                            };
                            avatarEl.parentNode.replaceChild(img, avatarEl);
                        }
                    }).catch(() => {});
                } else if (imageUrl) {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = data.name || 'Voter';
                    img.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);';
                    img.onerror = function() {
                        this.style.display = 'none';
                    };
                    avatarEl.parentNode.replaceChild(img, avatarEl);
                }
            }
        }

        // Setup close and maximize handlers
        setTimeout(() => {
            const closeBtn = document.getElementById('close-voter-side-panel');
            const maximizeBtn = document.getElementById('maximize-voter-side-panel');
            if (closeBtn && !closeBtn.dataset.listenerAttached) {
                closeBtn.dataset.listenerAttached = 'true';
                closeBtn.addEventListener('click', () => closeVoterDetailsSidePanel());
            }
            if (maximizeBtn && !maximizeBtn.dataset.listenerAttached) {
                maximizeBtn.dataset.listenerAttached = 'true';
                maximizeBtn.addEventListener('click', () => toggleSidePanelMaximize('voter-details-side-panel', 'maximize-voter-side-panel'));
            }
            if (overlay && !overlay.dataset.listenerAttached) {
                overlay.dataset.listenerAttached = 'true';
                overlay.addEventListener('click', () => closeVoterDetailsSidePanel());
            }
        }, 100);

    } catch (error) {
        console.error('Error loading voter details:', error);
        sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Failed to load voter details.</div>';
    }
}

// Close Voter Details Side Panel
function closeVoterDetailsSidePanel() {
    const sidePanel = document.getElementById('voter-details-side-panel');
    const overlay = document.getElementById('voter-details-side-panel-overlay');

    if (sidePanel) {
        sidePanel.classList.remove('show');
        sidePanel.classList.remove('side-panel-maximized');
        setTimeout(() => {
            sidePanel.style.display = 'none';
        }, 300);
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Open Candidate Details Side Panel
async function openCandidateDetailsSidePanel(candidateId) {
    const sidePanel = document.getElementById('candidate-details-side-panel');
    const sidePanelContent = document.getElementById('candidate-details-side-panel-content');
    const overlay = document.getElementById('candidate-details-side-panel-overlay');

    if (!sidePanel || !sidePanelContent || !overlay) {
        if (window.viewCandidateDetails) {
            window.viewCandidateDetails(candidateId);
        }
        return;
    }

    sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">Loading candidate details...</div>';
    sidePanel.style.display = 'flex';
    sidePanel.classList.add('show');
    overlay.style.display = 'block';
    void sidePanel.offsetWidth;

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const candidateRef = doc(window.db, 'candidates', candidateId);
        const candidateSnap = await getDoc(candidateRef);

        if (!candidateSnap.exists()) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Candidate not found.</div>';
            return;
        }

        const data = candidateSnap.data();

        if (data.email !== window.userEmail) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">You do not have permission to view this candidate.</div>';
            return;
        }

        const contentHTML = '<div style="display: flex; flex-direction: column; gap: 20px;">' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Candidate Information</div>' +
            '<div style="font-size: 18px; font-weight: 600; color: var(--text-color); margin-bottom: 8px;">' + (data.name || 'N/A') + '</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Position</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.position || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Island</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.island || data.constituency || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Constituency</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.constituency || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Phone</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.phone || data.number || 'N/A') + '</div></div>' +
            '</div></div></div>';

        sidePanelContent.innerHTML = contentHTML;

        setTimeout(() => {
            const closeBtn = document.getElementById('close-candidate-side-panel');
            const maximizeBtn = document.getElementById('maximize-candidate-side-panel');
            if (closeBtn && !closeBtn.dataset.listenerAttached) {
                closeBtn.dataset.listenerAttached = 'true';
                closeBtn.addEventListener('click', () => closeCandidateDetailsSidePanel());
            }
            if (maximizeBtn && !maximizeBtn.dataset.listenerAttached) {
                maximizeBtn.dataset.listenerAttached = 'true';
                maximizeBtn.addEventListener('click', () => toggleSidePanelMaximize('candidate-details-side-panel', 'maximize-candidate-side-panel'));
            }
            if (overlay && !overlay.dataset.listenerAttached) {
                overlay.dataset.listenerAttached = 'true';
                overlay.addEventListener('click', () => closeCandidateDetailsSidePanel());
            }
        }, 100);

    } catch (error) {
        console.error('Error loading candidate details:', error);
        sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Failed to load candidate details.</div>';
    }
}

// Close Candidate Details Side Panel
function closeCandidateDetailsSidePanel() {
    const sidePanel = document.getElementById('candidate-details-side-panel');
    const overlay = document.getElementById('candidate-details-side-panel-overlay');

    if (sidePanel) {
        sidePanel.classList.remove('show');
        sidePanel.classList.remove('side-panel-maximized');
        setTimeout(() => {
            sidePanel.style.display = 'none';
        }, 300);
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Open Event Details Side Panel
async function openEventDetailsSidePanel(eventId) {
    const sidePanel = document.getElementById('event-details-side-panel');
    const sidePanelContent = document.getElementById('event-details-side-panel-content');
    const overlay = document.getElementById('event-details-side-panel-overlay');

    if (!sidePanel || !sidePanelContent || !overlay) {
        if (window.viewEventDetails) {
            window.viewEventDetails(eventId);
        }
        return;
    }

    sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">Loading event details...</div>';
    sidePanel.style.display = 'flex';
    sidePanel.classList.add('show');
    overlay.style.display = 'block';
    void sidePanel.offsetWidth;

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const eventRef = doc(window.db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Event not found.</div>';
            return;
        }

        const data = eventSnap.data();

        if (data.campaignEmail !== window.userEmail) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">You do not have permission to view this event.</div>';
            return;
        }

        const eventDate = data.eventDate ? (data.eventDate.toDate ? data.eventDate.toDate() : new Date(data.eventDate)) : new Date();
        const dateStr = eventDate.toLocaleString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const contentHTML = '<div style="display: flex; flex-direction: column; gap: 20px;">' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Event Information</div>' +
            '<div style="font-size: 18px; font-weight: 600; color: var(--text-color); margin-bottom: 16px;">' + (data.eventName || 'N/A') + '</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Date & Time</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + dateStr + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Venue</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.venue || data.location || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Island</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.island || 'N/A') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Expected Attendees</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.expectedAttendees || 0) + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Start Time</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.startTime || 'TBD') + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">End Time</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.endTime || 'TBD') + '</div></div>' +
            '</div></div></div>';

        sidePanelContent.innerHTML = contentHTML;

        setTimeout(() => {
            const closeBtn = document.getElementById('close-event-side-panel');
            const maximizeBtn = document.getElementById('maximize-event-side-panel');
            if (closeBtn && !closeBtn.dataset.listenerAttached) {
                closeBtn.dataset.listenerAttached = 'true';
                closeBtn.addEventListener('click', () => closeEventDetailsSidePanel());
            }
            if (maximizeBtn && !maximizeBtn.dataset.listenerAttached) {
                maximizeBtn.dataset.listenerAttached = 'true';
                maximizeBtn.addEventListener('click', () => toggleSidePanelMaximize('event-details-side-panel', 'maximize-event-side-panel'));
            }
            if (overlay && !overlay.dataset.listenerAttached) {
                overlay.dataset.listenerAttached = 'true';
                overlay.addEventListener('click', () => closeEventDetailsSidePanel());
            }
        }, 100);

    } catch (error) {
        console.error('Error loading event details:', error);
        sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Failed to load event details.</div>';
    }
}

// Close Event Details Side Panel
function closeEventDetailsSidePanel() {
    const sidePanel = document.getElementById('event-details-side-panel');
    const overlay = document.getElementById('event-details-side-panel-overlay');

    if (sidePanel) {
        sidePanel.classList.remove('show');
        sidePanel.classList.remove('side-panel-maximized');
        setTimeout(() => {
            sidePanel.style.display = 'none';
        }, 300);
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Open Pledge Details Side Panel
async function openPledgeDetailsSidePanel(pledgeId) {
    const sidePanel = document.getElementById('pledge-details-side-panel');
    const sidePanelContent = document.getElementById('pledge-details-side-panel-content');
    const overlay = document.getElementById('pledge-details-side-panel-overlay');

    if (!sidePanel || !sidePanelContent || !overlay) {
        if (window.viewPledgeDetails) {
            window.viewPledgeDetails(pledgeId);
        }
        return;
    }

    sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);">Loading pledge details...</div>';
    sidePanel.style.display = 'flex';
    sidePanel.classList.add('show');
    overlay.style.display = 'block';
    void sidePanel.offsetWidth;

    try {
        const {
            doc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const pledgeRef = doc(window.db, 'pledges', pledgeId);
        const pledgeSnap = await getDoc(pledgeRef);

        if (!pledgeSnap.exists()) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Pledge not found.</div>';
            return;
        }

        const data = pledgeSnap.data();

        if (data.email !== window.userEmail) {
            sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">You do not have permission to view this pledge.</div>';
            return;
        }

        const pledgeDate = data.recordedAt ? (data.recordedAt.toDate ? data.recordedAt.toDate() : new Date(data.recordedAt)) : new Date();
        const dateStr = pledgeDate.toLocaleDateString('default', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        let statusClass = 'status-pending';
        let statusText = 'Undecided';
        if (data.pledge === 'yes') {
            statusClass = 'status-success';
            statusText = 'Yes';
        } else if (data.pledge === 'no' || data.pledge === 'negative') {
            statusClass = 'status-danger';
            statusText = 'No';
        }

        const contentHTML = '<div style="display: flex; flex-direction: column; gap: 20px;">' +
            '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;">' +
            '<div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pledge Information</div>' +
            '<div style="font-size: 18px; font-weight: 600; color: var(--text-color); margin-bottom: 16px;">' + (data.voterName || 'N/A') + '</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Pledge</div><div><span class="status-badge ' + statusClass + '">' + statusText + '</span></div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Date</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + dateStr + '</div></div>' +
            '<div><div style="font-size: 12px; color: var(--text-light); margin-bottom: 6px;">Voter ID</div><div style="font-size: 15px; font-weight: 600; color: var(--text-color);">' + (data.voterId || 'N/A') + '</div></div>' +
            '</div></div>' +
            (data.notes ? '<div style="background: var(--light-color); padding: 20px; border-radius: 12px;"><div style="font-size: 13px; color: var(--text-light); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Notes</div><div style="font-size: 14px; color: var(--text-color); line-height: 1.7;">' + data.notes + '</div></div>' : '') +
            '</div>';

        sidePanelContent.innerHTML = contentHTML;

        setTimeout(() => {
            const closeBtn = document.getElementById('close-pledge-side-panel');
            const maximizeBtn = document.getElementById('maximize-pledge-side-panel');
            if (closeBtn && !closeBtn.dataset.listenerAttached) {
                closeBtn.dataset.listenerAttached = 'true';
                closeBtn.addEventListener('click', () => closePledgeDetailsSidePanel());
            }
            if (maximizeBtn && !maximizeBtn.dataset.listenerAttached) {
                maximizeBtn.dataset.listenerAttached = 'true';
                maximizeBtn.addEventListener('click', () => toggleSidePanelMaximize('pledge-details-side-panel', 'maximize-pledge-side-panel'));
            }
            if (overlay && !overlay.dataset.listenerAttached) {
                overlay.dataset.listenerAttached = 'true';
                overlay.addEventListener('click', () => closePledgeDetailsSidePanel());
            }
        }, 100);

    } catch (error) {
        console.error('Error loading pledge details:', error);
        sidePanelContent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger-color);">Failed to load pledge details.</div>';
    }
}

// Close Pledge Details Side Panel
function closePledgeDetailsSidePanel() {
    const sidePanel = document.getElementById('pledge-details-side-panel');
    const overlay = document.getElementById('pledge-details-side-panel-overlay');

    if (sidePanel) {
        sidePanel.classList.remove('show');
        sidePanel.classList.remove('side-panel-maximized');
        setTimeout(() => {
            sidePanel.style.display = 'none';
        }, 300);
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Expose functions to window
window.openCallDetailsSidePanel = openCallDetailsSidePanel;
window.closeCallDetailsSidePanel = closeCallDetailsSidePanel;
window.toggleSidePanelMaximize = toggleSidePanelMaximize;
window.openVoterDetailsSidePanel = openVoterDetailsSidePanel;
window.closeVoterDetailsSidePanel = closeVoterDetailsSidePanel;
window.openCandidateDetailsSidePanel = openCandidateDetailsSidePanel;
window.closeCandidateDetailsSidePanel = closeCandidateDetailsSidePanel;
window.openEventDetailsSidePanel = openEventDetailsSidePanel;
window.closeEventDetailsSidePanel = closeEventDetailsSidePanel;
window.openPledgeDetailsSidePanel = openPledgeDetailsSidePanel;
window.closePledgeDetailsSidePanel = closePledgeDetailsSidePanel;

// Delete Call Function - Expose to window immediately
window.deleteCall = async function deleteCall(callId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        } else {
            alert('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Show confirmation dialog with fallback
    let confirmed = false;
    if (window.showConfirm) {
        try {
            confirmed = await window.showConfirm(
                'Are you sure you want to delete this call record? This action cannot be undone.',
                'Delete Call'
            );
        } catch (error) {
            console.error('[deleteCall] Error showing confirm dialog:', error);
            confirmed = confirm('Are you sure you want to delete this call record? This action cannot be undone.');
        }
    } else if (window.showDialog) {
        try {
            confirmed = await window.showDialog({
                type: 'confirm',
                title: 'Delete Call',
                message: 'Are you sure you want to delete this call record? This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            });
        } catch (error) {
            console.error('[deleteCall] Error showing confirm dialog:', error);
            confirmed = confirm('Are you sure you want to delete this call record? This action cannot be undone.');
        }
    } else {
        confirmed = confirm('Are you sure you want to delete this call record? This action cannot be undone.');
    }

    if (!confirmed) return;

    try {
        const {
            doc,
            getDoc,
            deleteDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const callRef = doc(window.db, 'calls', callId);
        const callSnap = await getDoc(callRef);

        if (!callSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Call record not found.', 'Error');
            } else {
                alert('Call record not found.');
            }
            return;
        }

        const callData = callSnap.data();
        if (callData.campaignEmail !== window.userEmail && callData.email !== window.userEmail) {
            if (window.showErrorDialog) {
                window.showErrorDialog('You do not have permission to delete this call record.', 'Access Denied');
            } else {
                alert('You do not have permission to delete this call record.');
            }
            return;
        }

        await deleteDoc(callRef);

        // Clear cache
        if (window.clearCache) {
            window.clearCache('calls');
        }

        // Reload calls table
        if (window.reloadTableData) {
            window.reloadTableData('calls');
        } else if (window.loadCallsData) {
            window.loadCallsData(true);
        }

        // Show success message with fallback
        if (window.showSuccess) {
            window.showSuccess('Call record deleted successfully.', 'Deleted');
        } else if (window.showSuccessMessage) {
            window.showSuccessMessage('Call record deleted successfully.', 'Deleted');
        } else {
            alert('Call record deleted successfully.');
        }

        // Close modal if open
        if (typeof closeModal === 'function') {
            closeModal();
        }
    } catch (error) {
        console.error('Error deleting call:', error);
        let errorMessage = 'Failed to delete call record. Please try again.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You do not have permission to delete this call record.';
        } else if (error.message) {
            errorMessage = 'Failed to delete call record: ' + error.message;
        }

        if (window.showErrorDialog) {
            window.showErrorDialog(errorMessage, 'Error');
        } else {
            alert(errorMessage);
        }
    }
};
// Function is already assigned to window.deleteCall above
window.deleteAgent = deleteAgent;
window.loadPageContent = loadPageContent;
// Delete a single notification
async function deleteNotification(notificationId) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            deleteDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const notificationRef = doc(window.db, 'notifications', notificationId);
        await deleteDoc(notificationRef);

        // Remove from UI immediately with animation
        const notificationItem = document.querySelector(` [data - notification - id = "${notificationId}"]
`);
        if (notificationItem) {
            notificationItem.style.transition = 'opacity 0.3s, transform 0.3s';
            notificationItem.style.opacity = '0';
            notificationItem.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                notificationItem.remove();
                // Check if list is now empty
                const notificationList = document.getElementById('notification-list');
                if (notificationList && notificationList.querySelectorAll('.notification-item').length === 0) {
                    notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>No notifications</p></div>';
                }
            }, 300);
        }

        // Note: The real-time listener will automatically update the list and badge
        // We don't need to reload notifications manually
    } catch (error) {
        console.error('Error deleting notification:', error);
        let errorMessage = 'Failed to delete notification. Please try again.';

        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You may not have permission to delete this notification. Please contact your administrator.';
        } else if (error.message) {
            errorMessage = `
Error: $ {
    error.message
}
`;
        }
        if (window.showErrorDialog) {
            window.showErrorDialog(errorMessage, 'Error');
        } else {
            alert(errorMessage);
        }
    }
}

// Clear all notifications
async function clearAllNotifications() {
    if (!window.db || !window.userEmail) return;

    if (window.showConfirm) {
        const confirmed = await window.showConfirm(
            'Are you sure you want to clear all notifications? This action cannot be undone.',
            'Clear All Notifications'
        );
        if (!confirmed) return;
    }

    // Temporarily disable the real-time listener to prevent re-rendering
    const wasListenerActive = !!window.notificationUnsubscribe;
    if (window.notificationUnsubscribe) {
        window.notificationUnsubscribe();
        window.notificationUnsubscribe = null;
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs,
            deleteDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const notificationsQuery = query(
            collection(window.db, 'notifications'),
            where('recipientEmail', '==', window.userEmail)
        );
        const snapshot = await getDocs(notificationsQuery);

        if (snapshot.empty) {
            // No notifications to delete
            const notificationList = document.getElementById('notification-list');
            if (notificationList) {
                notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>No notifications</p></div>';
            }
            updateNotificationBadge(0);

            // Re-enable listener
            if (wasListenerActive) {
                loadNotifications();
            }
            return;
        }

        // Delete all notifications
        const deletePromises = [];
        snapshot.forEach(docRef => {
            deletePromises.push(deleteDoc(docRef.ref));
        });

        await Promise.all(deletePromises);

        // Update UI immediately
        const notificationList = document.getElementById('notification-list');
        if (notificationList) {
            notificationList.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);"><p>No notifications</p></div>';
        }

        // Update badge immediately
        if (typeof updateNotificationBadge === 'function') {
            updateNotificationBadge(0);
        }

        // Wait a moment before re-enabling the listener to ensure deletions are complete
        setTimeout(() => {
            // Re-enable the real-time listener
            if (wasListenerActive) {
                loadNotifications();
            }
        }, 500);

        if (window.showSuccessMessage) {
            window.showSuccessMessage('All notifications cleared successfully!', 'Cleared');
        }
    } catch (error) {
        console.error('Error clearing notifications:', error);
        let errorMessage = 'Failed to clear notifications. Please try again.';

        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You may not have permission to delete notifications. Please contact your administrator.';
        } else if (error.message) {
            errorMessage = `
Error: $ {
    error.message
}
`;
        }

        // Re-enable listener on error
        if (wasListenerActive) {
            loadNotifications();
        }

        if (window.showErrorDialog) {
            window.showErrorDialog(errorMessage, 'Error');
        } else {
            alert(errorMessage);
        }
    }
}

window.loadNotifications = loadNotifications;
window.reloadTableData = reloadTableData;
window.deleteNotification = deleteNotification;
window.clearAllNotifications = clearAllNotifications;

// Setup clear all notifications button handler (if not already set up in app.js)
document.addEventListener('DOMContentLoaded', function() {
    const clearAllBtn = document.getElementById('clear-all-notifications');
    if (clearAllBtn && !clearAllBtn.dataset.handlerAttached) {
        clearAllBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (typeof clearAllNotifications === 'function') {
                await clearAllNotifications();
            }
        });
        clearAllBtn.dataset.handlerAttached = 'true';
        console.log('[Notification Center] Clear all button handler attached');
    }
});
// Change agent access code (from within the Agent Access Link modal)
async function changeAgentAccessCodeInModal(agentId, currentCode) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            getDoc,
            updateDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const agentRef = doc(window.db, 'agents', agentId);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }

        const agentData = agentSnap.data();

        // Show confirmation
        if (window.showConfirm) {
            const confirmed = await window.showConfirm(
                `
Are you sure you want to change the access code
for $ {
    agentData.name
} ? The old code($ {
    currentCode
}) will no longer work.
`,
                'Change Access Code'
            );

            if (!confirmed) return;
        } else {
            if (!confirm(`
Are you sure you want to change the access code
for $ {
    agentData.name
} ? The old code($ {
    currentCode
}) will no longer work.
`)) {
                return;
            }
        }

        // Generate new random 4-digit code
        const newAccessCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Update access code
        await updateDoc(agentRef, {
            agentAccessCode: newAccessCode
        });

        // Update the modal with new code
        const codeInput = document.getElementById('agent-code-input');
        if (codeInput) {
            codeInput.value = newAccessCode;
        }

        // Show success message
        if (window.showSuccess) {
            window.showSuccess('Access code changed successfully! The new code is displayed above.', 'Code Changed');
        } else {
            alert('Access code changed successfully! The new code is displayed above.');
        }

        // Reload agents to show updated data
        if (window.reloadTableData) {
            window.reloadTableData('agent');
        }

    } catch (error) {
        console.error('Error changing access code:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to change access code. Please try again.', 'Error');
        }
    }
}
window.changeAgentAccessCodeInModal = changeAgentAccessCodeInModal;

// Change agent access code (standalone function - kept for compatibility)
async function changeAgentAccessCode(agentId) {
    // This function can still be called from elsewhere, but redirects to generate link modal
    await generateAgentLink(agentId);
}
window.changeAgentAccessCode = changeAgentAccessCode;

// Copy new agent code to clipboard
function copyNewAgentCode() {
    const codeInput = document.getElementById('new-agent-code-input');
    if (codeInput) {
        codeInput.select();
        codeInput.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            if (window.showSuccess) {
                window.showSuccess('New access code copied to clipboard!', 'Copied');
            }
        } catch (err) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Failed to copy code. Please copy manually.', 'Error');
            }
        }
    }
}
window.copyNewAgentCode = copyNewAgentCode;

// Show agent selection modal for voter assignment with two-panel layout
async function showAgentSelectionForVoterAssignment() {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Fetch all agents for this campaign
        const agentsQuery = query(collection(window.db, 'agents'), where('email', '==', window.userEmail));
        const agentsSnapshot = await getDocs(agentsQuery);

        if (agentsSnapshot.empty) {
            if (window.showErrorDialog) {
                window.showErrorDialog('No agents found. Please add an agent first.', 'No Agents');
            }
            return;
        }

        // Fetch all voters for this campaign
        const votersQuery = query(collection(window.db, 'voters'), where('email', '==', window.userEmail));
        const votersSnapshot = await getDocs(votersQuery);

        if (votersSnapshot.empty) {
            if (window.showErrorDialog) {
                window.showErrorDialog('No voters found. Please import voters first.', 'No Voters');
            }
            return;
        }

        // Open side panel for agent and voter assignment
        const sidePanel = document.getElementById('assign-voters-side-panel');
        const sidePanelContent = document.getElementById('assign-voters-side-panel-content');
        const overlay = document.getElementById('assign-voters-side-panel-overlay');

        if (!sidePanel || !sidePanelContent || !overlay) {
            console.error('[showAgentSelectionForVoterAssignment] Side panel elements not found');
            if (window.showErrorDialog) {
                window.showErrorDialog('Side panel elements not found. Please refresh the page.');
            }
            return;
        }

        // Build agents list
        const agents = [];
        agentsSnapshot.forEach(agentDoc => {
            const agentData = agentDoc.data();
            agents.push({
                id: agentDoc.id,
                name: agentData.name || 'Unnamed Agent',
                assignedArea: agentData.assignedArea || 'No area assigned'
            });
        });

        // Build voters list with all relevant fields for filtering
        const voters = [];
        votersSnapshot.forEach(voterDoc => {
            const voterData = voterDoc.data();
            voters.push({
                id: voterDoc.id,
                name: voterData.name || 'N/A',
                idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                island: voterData.island || 'Unknown',
                atoll: voterData.atoll || 'Unknown',
                constituency: voterData.constituency || 'Unknown',
                permanentAddress: voterData.permanentAddress || voterData.address || 'Unknown',
                ballotBox: voterData.ballotBox || voterData.ballotNumber || 'Unknown',
                gender: voterData.gender || 'Unknown',
                age: voterData.age || null,
                image: voterData.image || voterData.photo || voterData.photoUrl || null,
                currentAgent: voterData.assignedAgentId || null
            });
        });

        // Create three-panel layout with fixed HTML
        let html = `<div class="assign-voters-layout" style="display: flex; gap: 16px; height: calc(100vh - 100px); min-height: 500px;">
    <!--Left Panel: Agents List-->
    <div class="assign-panel-left" style="flex: 0 0 250px; display: flex; flex-direction: column; border: 2px solid var(--border-color); border-radius: 12px; overflow: hidden; background: white;">
        <div style="background: var(--primary-50); padding: 16px; border-bottom: 2px solid var(--border-color);">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color);">Agents</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-light);">Select an agent</p>
        </div>
        <div id="agents-list-container" style="flex: 1; overflow-y: auto; padding: 12px;">
    `;

        agents.forEach((agent, index) => {
            html += `<button class="agent-select-btn" data-agent-id="${agent.id}" onclick="selectAgentForAssignment('${agent.id}')" style="width: 100%; text-align: left; padding: 14px; margin-bottom: 8px; border: 2px solid var(--border-color); border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
            <div style="font-weight: 600; font-size: 14px; color: var(--text-color);">${agent.name}</div>
            <div style="font-size: 12px; color: var(--text-light);">${agent.assignedArea}</div>
        </button>`;
        });

        html += `</div></div>

    <!--Center Panel: Voters List-->
    <div class="assign-panel-center" style="flex: 1; display: flex; flex-direction: column; border: 2px solid var(--border-color); border-radius: 12px; overflow: hidden; background: white; min-width: 0;">
        <div style="background: var(--primary-50); padding: 16px; border-bottom: 2px solid var(--border-color);">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color);">Voters</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-light);" id="selected-agent-info">Select an agent first</p>
        </div>
        <div style="padding: 12px; border-bottom: 2px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; gap: 8px;">
                <input type="text" id="voter-search-assign" placeholder="Search voters by name, ID, island, address..." style="flex: 1; padding: 10px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px;">
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="filter-toggle-btn" class="btn-secondary btn-compact" onclick="toggleVoterFilters()" style="font-size: 12px; padding: 8px 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block;">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filters
                </button>
            </div>
            <div id="voter-filters-panel" style="display: none; padding: 10px; background: var(--light-color); border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Island</label>
                        <select id="filter-island" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                            <option value="">All Islands</option>
                        </select>
                    </div>
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Atoll</label>
                        <select id="filter-atoll" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                            <option value="">All Atolls</option>
                        </select>
                    </div>
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Constituency</label>
                        <select id="filter-constituency" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                            <option value="">All Constituencies</option>
                        </select>
                    </div>
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Address</label>
                        <select id="filter-address" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none; position: relative; z-index: 1;">
                            <option value="">All Addresses</option>
                        </select>
                    </div>
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Ballot Box</label>
                        <select id="filter-ballot" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                            <option value="">All Ballot Boxes</option>
                        </select>
                    </div>
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Gender</label>
                        <select id="filter-gender" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div style="position: relative;">
                        <label style="display: block; font-size: 11px; font-weight: 600; color: var(--text-light); margin-bottom: 4px; text-transform: uppercase;">Filter by Status</label>
                        <select id="filter-status" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: white; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none;">
                            <option value="">All Status</option>
                            <option value="unassigned">Unassigned</option>
                            <option value="assigned">Assigned to Selected</option>
                            <option value="assigned-other">Assigned to Other</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div id="voters-list-container" style="flex: 1; overflow-y: auto; padding: 12px;">
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <p>Please select an agent to view and assign voters</p>
            </div>
        </div>
    </div>

    <!--Right Panel: Voter Details-->
    <div class="assign-panel-right" style="flex: 0 0 320px; display: flex; flex-direction: column; border: 2px solid var(--border-color); border-radius: 12px; overflow: hidden; background: white;">
        <div style="background: var(--primary-50); padding: 16px; border-bottom: 2px solid var(--border-color);">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color);">Voter Details</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-light);">Select a voter to view details</p>
        </div>
        <div id="voter-details-container" style="flex: 1; overflow-y: auto; padding: 16px;">
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; opacity: 0.5;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p style="margin: 0;">Select a voter from the list to view full details</p>
            </div>
        </div>
    </div>
</div>
<div id="assignment-error" class="error-message" style="display: none; margin-top: 15px;"></div>`;

        sidePanelContent.innerHTML = html;

        // Show side panel with animation
        sidePanel.style.display = 'flex';
        overlay.style.display = 'block';
        // Trigger reflow for animation
        void sidePanel.offsetWidth;
        sidePanel.style.transform = 'translateX(0)';

        // Setup close button
        const closeBtn = document.getElementById('close-assign-voters-side-panel');
        if (closeBtn && !closeBtn.dataset.listenerAttached) {
            closeBtn.dataset.listenerAttached = 'true';
            closeBtn.addEventListener('click', function() {
                closeAssignVotersSidePanel();
            });
        }

        // Setup overlay click to close
        if (overlay && !overlay.dataset.listenerAttached) {
            overlay.dataset.listenerAttached = 'true';
            overlay.addEventListener('click', function() {
                closeAssignVotersSidePanel();
            });
        }

        // Store data globally for use in other functions
        window.assignmentData = {
            agents: agents,
            voters: voters,
            selectedAgentId: null,
            treeViewEnabled: false,
            filteredVoters: [],
            currentPage: 1,
            itemsPerPage: 50,
            searchDebounceTimer: null,
            cachedResults: null
        };

        // Add debounced search functionality
        const searchInput = document.getElementById('voter-search-assign');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Clear previous timer
                if (window.assignmentData.searchDebounceTimer) {
                    clearTimeout(window.assignmentData.searchDebounceTimer);
                }

                // Set new timer for debouncing
                window.assignmentData.searchDebounceTimer = setTimeout(() => {
                    if (window.assignmentData && window.assignmentData.selectedAgentId) {
                        window.assignmentData.currentPage = 1; // Reset to first page
                        renderVotersForAssignment(window.assignmentData.selectedAgentId);
                    }
                }, 300); // 300ms debounce
            });
        }

        // Add filter functionality - all filter dropdowns
        const filterIsland = document.getElementById('filter-island');
        const filterAtoll = document.getElementById('filter-atoll');
        const filterConstituency = document.getElementById('filter-constituency');
        const filterAddress = document.getElementById('filter-address');
        const filterBallot = document.getElementById('filter-ballot');
        const filterGender = document.getElementById('filter-gender');
        const filterStatus = document.getElementById('filter-status');

        // Helper function to handle filter changes
        const handleFilterChange = () => {
            if (window.assignmentData && window.assignmentData.selectedAgentId) {
                window.assignmentData.currentPage = 1; // Reset to first page
                window.assignmentData.cachedResults = null; // Clear cache
                renderVotersForAssignment(window.assignmentData.selectedAgentId);
            }
        };

        if (filterIsland) {
            filterIsland.addEventListener('change', handleFilterChange);
        }
        if (filterAtoll) {
            filterAtoll.addEventListener('change', handleFilterChange);
        }
        if (filterConstituency) {
            filterConstituency.addEventListener('change', handleFilterChange);
        }
        if (filterAddress) {
            filterAddress.addEventListener('change', handleFilterChange);
        }
        if (filterBallot) {
            filterBallot.addEventListener('change', handleFilterChange);
        }
        if (filterGender) {
            filterGender.addEventListener('change', handleFilterChange);
        }
        if (filterStatus) {
            filterStatus.addEventListener('change', handleFilterChange);
        }

    } catch (error) {
        console.error('Error loading agents and voters for assignment:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load data. Please try again.', 'Error');
        }
    }
}

// Close assign voters side panel
function closeAssignVotersSidePanel() {
    const sidePanel = document.getElementById('assign-voters-side-panel');
    const overlay = document.getElementById('assign-voters-side-panel-overlay');

    if (sidePanel) {
        sidePanel.style.transform = 'translateX(100%)';
        setTimeout(() => {
            sidePanel.style.display = 'none';
        }, 300);
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}
window.closeAssignVotersSidePanel = closeAssignVotersSidePanel;

// Select agent for assignment
function selectAgentForAssignment(agentId) {
    if (!window.assignmentData) return;

    // Update selected agent
    window.assignmentData.selectedAgentId = agentId;

    // Update agent button styles
    document.querySelectorAll('.agent-select-btn').forEach(btn => {
        if (btn.dataset.agentId === agentId) {
            btn.style.borderColor = 'var(--primary-color)';
            btn.style.background = 'var(--primary-50)';
        } else {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'white';
        }
    });

    // Find selected agent info
    const selectedAgent = window.assignmentData.agents.find(a => a.id === agentId);
    const agentInfo = document.getElementById('selected-agent-info');
    if (agentInfo && selectedAgent) {
        agentInfo.textContent = `
Assigning voters to: $ {
    selectedAgent.name
}
`;
    }

    // Reset pagination and cache when selecting new agent
    window.assignmentData.currentPage = 1;
    window.assignmentData.cachedResults = null;

    // Clear voter details panel
    const detailsContainer = document.getElementById('voter-details-container');
    if (detailsContainer) {
        detailsContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-light);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; opacity: 0.5;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <p style="margin: 0;">Select a voter from the list to view full details</p>
    </div>`;
    }

    // Render voters list
    renderVotersForAssignment(agentId);
}
window.selectAgentForAssignment = selectAgentForAssignment;

// Render voters list for assignment with tree view and sorting
function renderVotersForAssignment(agentId) {
    if (!window.assignmentData) return;

    const votersContainer = document.getElementById('voters-list-container');
    if (!votersContainer) return;

    // Get selected agent's island
    const selectedAgent = window.assignmentData.agents.find(a => a.id === agentId);
    const agentIsland = selectedAgent ? (selectedAgent.assignedArea || '') : '';

    // Get current filter settings
    const filterIslandEl = document.getElementById('filter-island');
    const filterAtollEl = document.getElementById('filter-atoll');
    const filterConstituencyEl = document.getElementById('filter-constituency');
    const filterAddressEl = document.getElementById('filter-address');
    const filterBallotEl = document.getElementById('filter-ballot');
    const filterGenderEl = document.getElementById('filter-gender');
    const filterStatusEl = document.getElementById('filter-status');

    const filterIsland = filterIslandEl ? filterIslandEl.value || '' : '';
    const filterAtoll = filterAtollEl ? filterAtollEl.value || '' : '';
    const filterConstituency = filterConstituencyEl ? filterConstituencyEl.value || '' : '';
    const filterAddress = filterAddressEl ? filterAddressEl.value || '' : '';
    const filterBallot = filterBallotEl ? filterBallotEl.value || '' : '';
    const filterGender = filterGenderEl ? filterGenderEl.value || '' : '';
    const filterStatus = filterStatusEl ? filterStatusEl.value || '' : '';
    const searchTerm = (document.getElementById('voter-search-assign') ? document.getElementById('voter-search-assign').value || '' : '').toLowerCase();
    const treeViewEnabled = window.assignmentData.treeViewEnabled || false;

    // Check cache first (if filters haven't changed)
    const cacheKey = `${agentId}-${agentIsland}-${filterIsland}-${filterAtoll}-${filterConstituency}-${filterAddress}-${filterBallot}-${filterGender}-${filterStatus}-${searchTerm}`;
    let filteredVoters;

    if (window.assignmentData.cachedResults && window.assignmentData.cachedResults.key === cacheKey) {
        filteredVoters = window.assignmentData.cachedResults.data;
    } else {
        // Filter voters - FIRST filter by agent's island
        filteredVoters = [...window.assignmentData.voters];

        // Filter by agent's island (show only voters from the same island as the agent)
        if (agentIsland) {
            filteredVoters = filteredVoters.filter(v => v.island === agentIsland);
        }

        // Apply search filter first (most selective)
        if (searchTerm) {
            filteredVoters = filteredVoters.filter(v => {
                const name = (v.name || '').toLowerCase();
                const id = (v.idNumber || '').toLowerCase();
                const island = (v.island || '').toLowerCase();
                const address = (v.permanentAddress || '').toLowerCase();
                const atoll = (v.atoll || '').toLowerCase();
                const constituency = (v.constituency || '').toLowerCase();
                const ballot = (v.ballotBox || '').toLowerCase();
                return name.includes(searchTerm) || id.includes(searchTerm) ||
                    island.includes(searchTerm) || address.includes(searchTerm) ||
                    atoll.includes(searchTerm) || constituency.includes(searchTerm) ||
                    ballot.includes(searchTerm);
            });
        }

        // Apply filters
        if (filterIsland) {
            filteredVoters = filteredVoters.filter(v => v.island === filterIsland);
        }
        if (filterAtoll) {
            filteredVoters = filteredVoters.filter(v => v.atoll === filterAtoll);
        }
        if (filterConstituency) {
            filteredVoters = filteredVoters.filter(v => v.constituency === filterConstituency);
        }
        if (filterAddress) {
            filteredVoters = filteredVoters.filter(v => v.permanentAddress === filterAddress);
        }
        if (filterBallot) {
            filteredVoters = filteredVoters.filter(v => v.ballotBox === filterBallot);
        }
        if (filterGender) {
            filteredVoters = filteredVoters.filter(v => v.gender === filterGender);
        }
        if (filterStatus) {
            if (filterStatus === 'unassigned') {
                filteredVoters = filteredVoters.filter(v => !v.currentAgent);
            } else if (filterStatus === 'assigned') {
                filteredVoters = filteredVoters.filter(v => v.currentAgent === agentId);
            } else if (filterStatus === 'assigned-other') {
                filteredVoters = filteredVoters.filter(v => v.currentAgent && v.currentAgent !== agentId);
            }
        }

        // Sort by name by default (no sort dropdown needed)
        filteredVoters.sort((a, b) => {
            return (a.name || '').localeCompare(b.name || '');
        });

        // Cache results
        window.assignmentData.cachedResults = {
            key: cacheKey,
            data: filteredVoters
        };
    }

    // Store filtered voters for pagination
    window.assignmentData.filteredVoters = filteredVoters;

    // Update filter dropdowns with available options (only if not cached)
    if (!window.assignmentData.cachedResults || window.assignmentData.cachedResults.key !== cacheKey) {
        updateFilterDropdowns(filteredVoters, filterIsland, filterAtoll);
    }

    // Always render list view (tree view removed for new design)
    renderListView(filteredVoters, agentId, votersContainer);
}

// Render list view (flat list) with pagination
function renderListView(voters, agentId, container) {
    if (!window.assignmentData) return;

    const totalVoters = voters.length;
    const itemsPerPage = window.assignmentData.itemsPerPage || 50;
    const currentPage = window.assignmentData.currentPage || 1;
    const totalPages = Math.ceil(totalVoters / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalVoters);
    const paginatedVoters = voters.slice(startIndex, endIndex);

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    if (totalVoters === 0) {
        wrapper.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);"><p>No voters match the current filters</p></div>';
    } else {
        // Render paginated voters using document fragments
        paginatedVoters.forEach(voter => {
            const isAssigned = voter.currentAgent === agentId;
            const isAssignedOther = voter.currentAgent && voter.currentAgent !== agentId;

            // Find the other agent's name if assigned
            let otherAgentName = '';
            if (isAssignedOther) {
                const otherAgent = window.assignmentData.agents.find(a => a.id === voter.currentAgent);
                otherAgentName = otherAgent ? otherAgent.name : 'Another Agent';
            }

            // Create voter card
            const voterCard = document.createElement('div');
            voterCard.className = 'voter-card-assign';
            voterCard.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 2px solid ${isAssigned ? 'var(--primary-color)' : isAssignedOther ? 'var(--warning-color)' : 'var(--border-color)'}; border-radius: 8px; background: ${isAssigned ? 'var(--primary-50)' : isAssignedOther ? 'rgba(217, 119, 6, 0.05)' : 'white'}; transition: all 0.2s; cursor: pointer; opacity: ${isAssignedOther ? '0.7' : '1'};`;
            voterCard.setAttribute('data-voter-id', voter.id);
            voterCard.setAttribute('data-voter-name', (voter.name || '').toLowerCase());

            // Click to view details
            voterCard.onclick = (e) => {
                // Don't trigger if clicking the assign button
                if (!e.target.closest('.assign-voter-btn')) {
                    showVoterDetailsForAssignment(voter);
                }
            };

            // Voter image section
            const imageSection = document.createElement('div');
            imageSection.style.cssText = 'flex-shrink: 0; margin-right: 12px;';

            // Get image URL using the function that checks images folder
            const voterIdNumber = voter.idNumber || voter.voterId || '';
            let imageUrl = getVoterImageUrl(voter, voterIdNumber);
            const initials = voter.name ? voter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = voter.name || 'Voter';
                img.style.cssText = 'width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid var(--border-color);';
                img.setAttribute('data-voter-id', voterIdNumber || '');
                img.onerror = function() {
                    // Fallback to initials if image fails to load, then try folder lookup
                    this.style.display = 'none';
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.style.cssText = 'width: 50px; height: 50px; border-radius: 8px; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border-color);';
                    fallbackDiv.textContent = initials;
                    imageSection.appendChild(fallbackDiv);

                    // Try to load from folder
                    if (voterIdNumber && voterIdNumber.trim()) {
                        tryLoadImageFromFolder(this, voterIdNumber).then(found => {
                            if (found) {
                                this.src = found;
                                this.style.display = '';
                                if (fallbackDiv.parentNode) {
                                    fallbackDiv.parentNode.removeChild(fallbackDiv);
                                }
                            }
                        });
                    }
                };
                imageSection.appendChild(img);
            } else {
                const initialsDiv = document.createElement('div');
                initialsDiv.style.cssText = 'width: 50px; height: 50px; border-radius: 8px; background: var(--gradient-primary); color: white; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--border-color);';
                initialsDiv.textContent = initials;
                imageSection.appendChild(initialsDiv);

                // Try to lookup image from folder asynchronously
                if (voterIdNumber && voterIdNumber.trim()) {
                    lookupImageFromFolder(voterIdNumber).then(foundUrl => {
                        if (foundUrl) {
                            const img = document.createElement('img');
                            img.src = foundUrl;
                            img.alt = voter.name || 'Voter';
                            img.style.cssText = 'width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid var(--border-color);';
                            img.setAttribute('data-voter-id', voterIdNumber);
                            img.onerror = function() {
                                this.style.display = 'none';
                                if (initialsDiv.parentNode) {
                                    initialsDiv.style.display = 'flex';
                                }
                            };
                            if (initialsDiv.parentNode) {
                                initialsDiv.parentNode.replaceChild(img, initialsDiv);
                            }
                        }
                    }).catch(() => {});
                }
            }

            // Voter info section
            const infoSection = document.createElement('div');
            infoSection.style.cssText = 'flex: 1; min-width: 0;';

            const nameDiv = document.createElement('div');
            nameDiv.style.cssText = 'font-weight: 600; font-size: 14px; color: var(--text-color); margin-bottom: 6px;';
            nameDiv.textContent = voter.name || 'N/A';

            const detailsDiv = document.createElement('div');
            detailsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-light);';

            const idDiv = document.createElement('div');
            idDiv.innerHTML = `<strong>ID:</strong> ${voter.idNumber || 'N/A'}`;
            detailsDiv.appendChild(idDiv);

            if (voter.permanentAddress && voter.permanentAddress !== 'Unknown') {
                const addressDiv = document.createElement('div');
                addressDiv.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                addressDiv.innerHTML = `<strong>Address:</strong> ${voter.permanentAddress}`;
                detailsDiv.appendChild(addressDiv);
            }

            if (isAssignedOther) {
                const assignedDiv = document.createElement('div');
                assignedDiv.style.cssText = 'font-size: 11px; color: var(--warning-color); font-weight: 600; margin-top: 4px;';
                assignedDiv.textContent = `Assigned to ${otherAgentName}`;
                detailsDiv.appendChild(assignedDiv);
            } else if (isAssigned) {
                const assignedDiv = document.createElement('div');
                assignedDiv.style.cssText = 'font-size: 11px; color: var(--success-color); font-weight: 600; margin-top: 4px;';
                assignedDiv.textContent = 'Currently assigned';
                detailsDiv.appendChild(assignedDiv);
            }

            infoSection.appendChild(nameDiv);
            infoSection.appendChild(detailsDiv);

            // Assign button
            const buttonDiv = document.createElement('div');
            buttonDiv.style.cssText = 'flex-shrink: 0; margin-left: 12px;';

            const assignBtn = document.createElement('button');
            assignBtn.className = 'assign-voter-btn';
            assignBtn.style.cssText = `padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: ${isAssignedOther ? 'not-allowed' : 'pointer'}; transition: all 0.2s; white-space: nowrap;`;

            if (isAssigned) {
                assignBtn.textContent = 'Unassign';
                assignBtn.style.cssText += 'background: var(--danger-color); color: white;';
            } else if (isAssignedOther) {
                assignBtn.textContent = 'Assigned';
                assignBtn.style.cssText += 'background: var(--light-color); color: var(--text-light);';
                assignBtn.disabled = true;
            } else {
                assignBtn.textContent = 'Assign';
                assignBtn.style.cssText += 'background: var(--primary-color); color: white;';
            }

            assignBtn.onclick = (e) => {
                e.stopPropagation();
                if (!isAssignedOther) {
                    toggleVoterAssignment(voter.id, agentId, !isAssigned);
                }
            };

            buttonDiv.appendChild(assignBtn);
            voterCard.appendChild(imageSection);
            voterCard.appendChild(infoSection);
            voterCard.appendChild(buttonDiv);
            wrapper.appendChild(voterCard);
        });

        // Add pagination controls if needed
        if (totalPages > 1) {
            const paginationDiv = document.createElement('div');
            paginationDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 16px; padding: 12px; border-top: 1px solid var(--border-color);';

            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← Previous';
            prevBtn.className = 'btn-secondary btn-compact';
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => {
                if (currentPage > 1) {
                    window.assignmentData.currentPage = currentPage - 1;
                    renderVotersForAssignment(agentId);
                }
            };

            const pageInfo = document.createElement('span');
            pageInfo.style.cssText = 'font-size: 13px; color: var(--text-light);';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalVoters} total)`;

            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next →';
            nextBtn.className = 'btn-secondary btn-compact';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => {
                if (currentPage < totalPages) {
                    window.assignmentData.currentPage = currentPage + 1;
                    renderVotersForAssignment(agentId);
                }
            };

            paginationDiv.appendChild(prevBtn);
            paginationDiv.appendChild(pageInfo);
            paginationDiv.appendChild(nextBtn);
            wrapper.appendChild(paginationDiv);
        }
    }

    fragment.appendChild(wrapper);
    container.innerHTML = '';
    container.appendChild(fragment);
}

// Render tree view (grouped by atoll/island)
function renderTreeView(voters, agentId, container) {
    if (!window.assignmentData) return;

    if (voters.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-light);"><p>No voters match the current filters</p></div>';
        return;
    }

    // Group voters by atoll, then by island
    const tree = {};
    voters.forEach(voter => {
        const atoll = voter.atoll || 'Unknown';
        const island = voter.island || 'Unknown';

        if (!tree[atoll]) {
            tree[atoll] = {};
        }
        if (!tree[atoll][island]) {
            tree[atoll][island] = [];
        }
        tree[atoll][island].push(voter);
    });

    // Sort atolls and islands
    const sortedAtolls = Object.keys(tree).sort();

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    sortedAtolls.forEach(atoll => {
        const islands = Object.keys(tree[atoll]).sort();
        const atollId = `atoll-${atoll.replace(/\s+/g, '-').toLowerCase()}`;
        const atollVoterCount = Object.values(tree[atoll]).reduce((sum, islandVoters) => sum + islandVoters.length, 0);

        html += `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                <div class="tree-node-header" onclick="toggleTreeNode('${atollId}')" 
                     style="background: var(--light-color); padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--border-light)'"
                     onmouseout="this.style.background='var(--light-color)'">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg class="tree-chevron" data-target="${atollId}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(0deg);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <strong style="font-size: 14px; color: var(--text-color);">${atoll}</strong>
                        <span style="font-size: 12px; color: var(--text-light);">(${atollVoterCount} voters)</span>
                    </div>
                </div>
                <div id="${atollId}" class="tree-node-content" style="display: block; padding: 8px;">
        `;

        islands.forEach(island => {
            const islandVoters = tree[atoll][island];
            const islandId = `island-${atoll.replace(/\s+/g, '-').toLowerCase()}-${island.replace(/\s+/g, '-').toLowerCase()}`;

            html += `
                <div style="margin-bottom: 8px; border-left: 2px solid var(--border-color); padding-left: 12px;">
                    <div class="tree-node-header" onclick="toggleTreeNode('${islandId}')" 
                         style="padding: 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s; border-radius: 6px;"
                         onmouseover="this.style.background='var(--light-color)'"
                         onmouseout="this.style.background='transparent'">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <svg class="tree-chevron" data-target="${islandId}" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(0deg);">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                            <span style="font-size: 13px; font-weight: 600; color: var(--text-color);">${island}</span>
                            <span style="font-size: 11px; color: var(--text-light);">(${islandVoters.length} voters)</span>
                        </div>
                    </div>
                    <div id="${islandId}" class="tree-node-content" style="display: block; padding: 8px 0 8px 16px;">
            `;

            islandVoters.forEach(voter => {
                const isAssigned = voter.currentAgent === agentId;
                const isAssignedOther = voter.currentAgent && voter.currentAgent !== agentId;

                let otherAgentName = '';
                if (isAssignedOther) {
                    const otherAgent = window.assignmentData.agents.find(a => a.id === voter.currentAgent);
                    otherAgentName = otherAgent ? otherAgent.name : 'Another Agent';
                }

                html += `
                    <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 6px; border: 2px solid ${isAssigned ? 'var(--primary-color)' : isAssignedOther ? 'var(--warning-color)' : 'var(--border-color)'}; 
                           border-radius: 6px; cursor: ${isAssignedOther ? 'not-allowed' : 'pointer'}; 
                           background: ${isAssigned ? 'var(--primary-50)' : isAssignedOther ? 'rgba(217, 119, 6, 0.05)' : 'white'}; 
                           transition: all 0.2s; opacity: ${isAssignedOther ? '0.7' : '1'};" 
                           data-voter-id="${voter.id}" 
                           data-voter-name="${voter.name.toLowerCase()}"
                           data-voter-island="${(voter.island || '').toLowerCase()}"
                           data-voter-address="${(voter.permanentAddress || '').toLowerCase()}">
                        <input type="checkbox" ${isAssigned ? 'checked' : ''} 
                               data-voter-id="${voter.id}" 
                               style="margin-right: 10px; width: 16px; height: 16px; cursor: ${isAssignedOther ? 'not-allowed' : 'pointer'};"
                               ${isAssignedOther ? 'disabled' : ''}
                               ${isAssignedOther ? 'title="This voter is already assigned to ' + otherAgentName + '"' : ''}>
                        <div style="flex: 1;">
                            <strong style="display: block; color: var(--text-color); font-size: 13px; margin-bottom: 4px;">${voter.name}</strong>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <span style="font-size: 11px; color: var(--text-light);"><strong>ID:</strong> ${voter.idNumber}</span>
                                    ${voter.island ? `<span style="font-size: 11px; color: var(--text-light);"><strong>Island:</strong> ${voter.island}</span>` : ''}
                                    ${voter.permanentAddress && voter.permanentAddress !== 'Unknown' ? `<span style="font-size: 11px; color: var(--text-light);"><strong>Address:</strong> ${voter.permanentAddress.length > 30 ? voter.permanentAddress.substring(0, 30) + '...' : voter.permanentAddress}</span>` : ''}
                                </div>
                                ${isAssignedOther ? `<span style="font-size: 10px; color: var(--warning-color); font-weight: 600; margin-top: 2px;">(Assigned to ${otherAgentName})</span>` : ''}
                                ${isAssigned ? '<span style="font-size: 10px; color: var(--success-color); font-weight: 600; margin-top: 2px;">(Assigned)</span>' : ''}
                            </div>
                        </div>
                        ${(() => {
                            const voterIdNumber = voter.idNumber || voter.voterId || '';
                            const imgUrl = getVoterImageUrl(voter, voterIdNumber);
                            return imgUrl ? 
                                `<img src="${imgUrl}" alt="${voter.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 2px solid var(--border-color); margin-left: 10px; flex-shrink: 0;" data-voter-id="${voterIdNumber || ''}" onerror="this.onerror=null; this.style.display='none'; tryLoadImageFromFolder(this, '${voterIdNumber || ''}').then(found => { if(found) { this.src=found; this.style.display=''; } });">` : 
                                '';
                        })()}
                    </label>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Update filter dropdowns with available options
function updateFilterDropdowns(voters, selectedIsland, selectedAtoll) {
    // Get unique values from all voters (not just filtered)
    const allVoters = window.assignmentData ? window.assignmentData.voters : voters;
    const islands = [...new Set(allVoters.map(v => v.island).filter(v => v && v !== 'Unknown'))].sort();
    const atolls = [...new Set(allVoters.map(v => v.atoll).filter(v => v && v !== 'Unknown'))].sort();
    const constituencies = [...new Set(allVoters.map(v => v.constituency).filter(v => v && v !== 'Unknown'))].sort();
    const ballotBoxes = [...new Set(allVoters.map(v => v.ballotBox).filter(v => v && v !== 'Unknown'))].sort();

    // Get permanent addresses - if island filter is selected, only show addresses from that island
    // Otherwise show all addresses from filtered voters
    let addresses;
    if (selectedIsland) {
        addresses = [...new Set(allVoters.filter(v => v.island === selectedIsland).map(v => v.permanentAddress).filter(v => v && v !== 'Unknown'))].sort();
    } else if (selectedAtoll) {
        addresses = [...new Set(allVoters.filter(v => v.atoll === selectedAtoll).map(v => v.permanentAddress).filter(v => v && v !== 'Unknown'))].sort();
    } else {
        addresses = [...new Set(allVoters.map(v => v.permanentAddress).filter(v => v && v !== 'Unknown'))].sort();
    }

    // Update island dropdown
    const islandSelect = document.getElementById('filter-island');
    if (islandSelect) {
        const currentValue = islandSelect.value;
        islandSelect.innerHTML = '<option value="">All Islands</option>';
        islands.forEach(island => {
            const option = document.createElement('option');
            option.value = island;
            option.textContent = island;
            if (island === currentValue) option.selected = true;
            islandSelect.appendChild(option);
        });
    }

    // Update atoll dropdown
    const atollSelect = document.getElementById('filter-atoll');
    if (atollSelect) {
        const currentValue = atollSelect.value;
        atollSelect.innerHTML = '<option value="">All Atolls</option>';
        atolls.forEach(atoll => {
            const option = document.createElement('option');
            option.value = atoll;
            option.textContent = atoll;
            if (atoll === currentValue) option.selected = true;
            atollSelect.appendChild(option);
        });
    }

    // Update constituency dropdown
    const constituencySelect = document.getElementById('filter-constituency');
    if (constituencySelect) {
        const currentValue = constituencySelect.value;
        constituencySelect.innerHTML = '<option value="">All Constituencies</option>';
        constituencies.forEach(constituency => {
            const option = document.createElement('option');
            option.value = constituency;
            option.textContent = constituency;
            if (constituency === currentValue) option.selected = true;
            constituencySelect.appendChild(option);
        });
    }

    // Update permanent address dropdown
    const addressSelect = document.getElementById('filter-address');
    if (addressSelect) {
        const currentValue = addressSelect.value;
        addressSelect.innerHTML = '<option value="">All Addresses</option>';
        addresses.forEach(address => {
            const option = document.createElement('option');
            option.value = address;
            option.textContent = address.length > 40 ? address.substring(0, 40) + '...' : address;
            option.title = address; // Full address on hover
            if (address === currentValue) option.selected = true;
            addressSelect.appendChild(option);
        });
    }

    // Update ballot box dropdown
    const ballotSelect = document.getElementById('filter-ballot');
    if (ballotSelect) {
        const currentValue = ballotSelect.value;
        ballotSelect.innerHTML = '<option value="">All Ballot Boxes</option>';
        ballotBoxes.forEach(ballot => {
            const option = document.createElement('option');
            option.value = ballot;
            option.textContent = ballot;
            if (ballot === currentValue) option.selected = true;
            ballotSelect.appendChild(option);
        });
    }
}

// Toggle tree node (expand/collapse)
function toggleTreeNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (!node) return;

    const isExpanded = node.style.display !== 'none';
    node.style.display = isExpanded ? 'none' : 'block';

    // Update chevron icon
    const chevron = document.querySelector(`.tree-chevron[data-target="${nodeId}"]`);
    if (chevron) {
        chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
    }
}

// Toggle tree view
function toggleTreeView() {
    if (!window.assignmentData || !window.assignmentData.selectedAgentId) return;

    window.assignmentData.treeViewEnabled = !window.assignmentData.treeViewEnabled;
    const btn = document.getElementById('tree-toggle-btn');
    if (btn) {
        if (window.assignmentData.treeViewEnabled) {
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'white';
        } else {
            btn.style.background = '';
            btn.style.color = '';
        }
    }
    renderVotersForAssignment(window.assignmentData.selectedAgentId);
}

// Toggle filter panel
function toggleVoterFilters() {
    const panel = document.getElementById('voter-filters-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

// Save bulk voter assignment
async function saveBulkVoterAssignment() {
    if (!window.assignmentData || !window.assignmentData.selectedAgentId) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Please select an agent first.', 'No Agent Selected');
        }
        return;
    }

    const agentId = window.assignmentData.selectedAgentId;
    const checkboxes = document.querySelectorAll('#voters-list-container input[type="checkbox"]:not(:disabled)');

    const assignedVoters = [];
    const unassignedVoters = [];

    checkboxes.forEach(checkbox => {
        const voterId = checkbox.dataset.voterId;
        const voter = window.assignmentData.voters.find(v => v.id === voterId);

        if (!voter) return;

        // Skip if voter is assigned to another agent
        if (voter.currentAgent && voter.currentAgent !== agentId) {
            return;
        }

        if (checkbox.checked) {
            assignedVoters.push(voterId);
        } else if (voter.currentAgent === agentId) {
            // Only unassign if currently assigned to this agent
            unassignedVoters.push(voterId);
        }
    });

    if (assignedVoters.length === 0 && unassignedVoters.length === 0) {
        if (window.showErrorDialog) {
            window.showErrorDialog('No changes to save.', 'No Changes');
        }
        return;
    }

    try {
        const {
            doc,
            updateDoc,
            batch,
            writeBatch
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const db = window.db;
        const batchOps = writeBatch(db);

        // Update all assigned voters
        for (const voterId of assignedVoters) {
            const voterRef = doc(db, 'voters', voterId);
            batchOps.update(voterRef, {
                assignedAgentId: agentId
            });
        }

        // Remove assignment from unassigned voters
        for (const voterId of unassignedVoters) {
            const voterRef = doc(db, 'voters', voterId);
            batchOps.update(voterRef, {
                assignedAgentId: null
            });
        }

        await batchOps.commit();

        // Show success message
        if (window.showSuccess) {
            const assignedCount = assignedVoters.length;
            const unassignedCount = unassignedVoters.length;
            let message = '';
            if (assignedCount > 0 && unassignedCount > 0) {
                message = `Successfully assigned ${assignedCount} voter(s) and unassigned ${unassignedCount} voter(s).`;
            } else if (assignedCount > 0) {
                message = `Successfully assigned ${assignedCount} voter(s) to agent.`;
            } else {
                message = `Successfully unassigned ${unassignedCount} voter(s) from agent.`;
            }
            window.showSuccess(message, 'Success');
        }

        // Refresh the agents data
        if (window.loadAgentsData) {
            window.loadAgentsData(true);
        }

        // Update the voters list to reflect changes
        window.assignmentData.voters.forEach(voter => {
            if (assignedVoters.includes(voter.id)) {
                voter.currentAgent = agentId;
            } else if (unassignedVoters.includes(voter.id)) {
                voter.currentAgent = null;
            }
        });

        // Re-render voters list
        renderVotersForAssignment(agentId);

    } catch (error) {
        console.error('Error saving voter assignment:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to save assignment. Please try again.', 'Error');
        }
    }
}

// View list of voters assigned to an agent with download option
async function viewAssignedVotersList(agentId) {
    if (!window.db || !window.userEmail) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Database not initialized. Please refresh the page.');
        }
        return;
    }

    try {
        const {
            doc,
            getDoc,
            collection,
            query,
            where,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Get agent data
        const agentDoc = await getDoc(doc(window.db, 'agents', agentId));
        if (!agentDoc.exists()) {
            if (window.showErrorDialog) {
                window.showErrorDialog('Agent not found.', 'Error');
            }
            return;
        }
        const agentData = agentDoc.data();

        // Fetch all voters assigned to this agent
        const votersQuery = query(
            collection(window.db, 'voters'),
            where('email', '==', window.userEmail),
            where('assignedAgentId', '==', agentId)
        );
        const votersSnapshot = await getDocs(votersQuery);

        if (votersSnapshot.empty) {
            if (window.showErrorDialog) {
                window.showErrorDialog('No voters assigned to this agent.', 'No Voters');
            }
            return;
        }

        // Build voters list
        const voters = [];
        votersSnapshot.forEach(voterDoc => {
            const voterData = voterDoc.data();
            voters.push({
                name: voterData.name || 'N/A',
                idNumber: voterData.idNumber || voterData.voterId || 'N/A',
                island: voterData.island || 'N/A',
                permanentAddress: voterData.permanentAddress || 'N/A',
                phone: voterData.phone || 'N/A',
                age: voterData.age || 'N/A'
            });
        });

        // Create modal
        const modalOverlay = ensureModalExists();
        if (!modalOverlay) return;

        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');

        if (!modalBody || !modalTitle) return;

        // Update modal container to be wider
        const modalContainer = modalOverlay.querySelector('.modal-container');
        if (modalContainer) {
            modalContainer.style.maxWidth = '900px';
            modalContainer.style.width = '95%';
        }

        modalTitle.textContent = `Voters Assigned to ${agentData.name || 'Agent'}`;

        // Build table HTML
        let html = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <p style="margin: 0; color: var(--text-light); font-size: 14px;">Total: <strong>${voters.length}</strong> voters</p>
                <button class="btn-primary btn-compact" onclick="downloadAssignedVotersList('${agentId}', '${agentData.name || 'Agent'}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download CSV
                </button>
            </div>
            <div style="max-height: 500px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                <table class="data-table" style="margin: 0;">
                    <thead style="position: sticky; top: 0; background: var(--light-color); z-index: 10;">
                        <tr>
                            <th>No.</th>
                            <th>Name</th>
                            <th>ID Number</th>
                            <th>Island</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>Age</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        voters.forEach((voter, index) => {
            html += `
                <tr>
                    <td style="text-align: center; font-weight: 600; color: var(--text-light);">${index + 1}</td>
                    <td style="font-weight: 600; color: var(--text-color);">${voter.name}</td>
                    <td>${voter.idNumber}</td>
                    <td>${voter.island}</td>
                    <td>${voter.permanentAddress}</td>
                    <td>${voter.phone}</td>
                    <td style="text-align: center;">${voter.age}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        modalBody.innerHTML = html;

        // Show modal
        modalOverlay.style.display = 'flex';
        setTimeout(() => modalOverlay.classList.add('active'), 10);

        // Store voters data for download
        window.currentVotersList = {
            agentId: agentId,
            agentName: agentData.name || 'Agent',
            voters: voters
        };

    } catch (error) {
        console.error('Error loading assigned voters list:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to load voters list. Please try again.', 'Error');
        }
    }
}

// Download assigned voters list as CSV
function downloadAssignedVotersList(agentId, agentName) {
    if (!window.currentVotersList || window.currentVotersList.agentId !== agentId) {
        if (window.showErrorDialog) {
            window.showErrorDialog('Voters list data not available. Please refresh and try again.', 'Error');
        }
        return;
    }

    const voters = window.currentVotersList.voters;
    const name = agentName || 'Agent';

    // Create CSV content
    let csvContent = 'Name,ID Number,Island,Address,Phone,Age\n';
    voters.forEach(voter => {
        const row = [
            `"${(voter.name || '').replace(/"/g, '""')}"`,
            `"${(voter.idNumber || '').replace(/"/g, '""')}"`,
            `"${(voter.island || '').replace(/"/g, '""')}"`,
            `"${(voter.permanentAddress || '').replace(/"/g, '""')}"`,
            `"${(voter.phone || '').replace(/"/g, '""')}"`,
            `"${(voter.age || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Voters_Assigned_to_${name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.showSuccess) {
        window.showSuccess(`Voters list downloaded successfully!`, 'Downloaded');
    }
}

window.assignVotersToAgent = assignVotersToAgent;
window.saveVoterAssignment = saveVoterAssignment;
window.generateAgentLink = generateAgentLink;
window.copyAgentLink = copyAgentLink;
window.copyAgentCode = copyAgentCode;
if (typeof copyNewAgentCode !== 'undefined') {
    window.copyNewAgentCode = copyNewAgentCode;
}
if (typeof changeAgentAccessCode !== 'undefined') {
    window.changeAgentAccessCode = changeAgentAccessCode;
}
if (typeof changeAgentAccessCodeInModal !== 'undefined') {
    window.changeAgentAccessCodeInModal = changeAgentAccessCodeInModal;
}
window.viewAgentPerformance = viewAgentPerformance;
if (typeof showAgentSelectionForVoterAssignment !== 'undefined') {
    window.showAgentSelectionForVoterAssignment = showAgentSelectionForVoterAssignment;
}
if (typeof selectAgentForAssignment !== 'undefined') {
    window.selectAgentForAssignment = selectAgentForAssignment;
}
if (typeof renderVotersForAssignment !== 'undefined') {
    window.renderVotersForAssignment = renderVotersForAssignment;
}
// Show voter details in right panel
function showVoterDetailsForAssignment(voter) {
    if (!voter || !window.assignmentData) return;

    const detailsContainer = document.getElementById('voter-details-container');
    if (!detailsContainer) return;

    // Find full voter data
    const fullVoter = window.assignmentData.voters.find(v => v.id === voter.id);
    if (!fullVoter) return;

    // Update selected voter styling
    document.querySelectorAll('.voter-card-assign').forEach(card => {
        if (card.dataset.voterId === voter.id) {
            card.style.borderColor = 'var(--primary-color)';
            card.style.boxShadow = '0 0 0 3px rgba(111, 193, 218, 0.2)';
        } else {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        }
    });

    // Get image URL using the function that checks images folder
    const voterIdNumber = fullVoter.idNumber || fullVoter.voterId || '';
    let imageUrl = getVoterImageUrl(fullVoter, voterIdNumber);
    const initials = fullVoter.name ? fullVoter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';

    // Build details HTML
    let html = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            ${imageUrl ? `
                <div style="text-align: center; margin-bottom: 8px;">
                    <img id="assignment-detail-image" src="${imageUrl}" alt="${fullVoter.name}" 
                         style="width: 120px; height: 120px; object-fit: cover; border-radius: 12px; border: 3px solid var(--border-color);"
                         data-voter-id="${voterIdNumber || ''}"
                         onerror="this.onerror=null; this.style.display='none'; const fallback=this.nextElementSibling; if(fallback) fallback.style.display='flex'; tryLoadImageFromFolder(this, '${voterIdNumber || ''}').then(found => { if(found) { this.src=found; this.style.display=''; if(fallback) fallback.style.display='none'; } });">
                    <div id="assignment-detail-fallback" style="width: 120px; height: 120px; border-radius: 12px; border: 3px solid var(--border-color); background: var(--gradient-primary); color: white; font-weight: 700; font-size: 36px; display: none; align-items: center; justify-content: center; margin: 0 auto;">${initials}</div>
                </div>
            ` : `
                <div style="text-align: center; margin-bottom: 8px;">
                    <div id="assignment-detail-fallback" style="width: 120px; height: 120px; border-radius: 12px; border: 3px solid var(--border-color); background: var(--gradient-primary); color: white; font-weight: 700; font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">${initials}</div>
                </div>
            `}
            <div style="border-bottom: 2px solid var(--border-color); padding-bottom: 12px;">
                <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: var(--text-color);">${fullVoter.name || 'N/A'}</h4>
                <p style="margin: 0; font-size: 13px; color: var(--text-light);">ID: ${fullVoter.idNumber || 'N/A'}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
    `;

    const fields = [{
            label: 'Permanent Address',
            value: fullVoter.permanentAddress
        },
        {
            label: 'Island',
            value: fullVoter.island
        },
        {
            label: 'Atoll',
            value: fullVoter.atoll
        },
        {
            label: 'Constituency',
            value: fullVoter.constituency
        },
        {
            label: 'Ballot Box',
            value: fullVoter.ballotBox
        },
        {
            label: 'Gender',
            value: fullVoter.gender
        },
        {
            label: 'Age',
            value: fullVoter.age
        }
    ];

    fields.forEach(field => {
        if (field.value && field.value !== 'Unknown' && field.value !== 'N/A') {
            html += `
                <div style="padding: 10px; background: var(--light-color); border-radius: 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; margin-bottom: 4px;">${field.label}</div>
                    <div style="font-size: 14px; color: var(--text-color);">${field.value}</div>
                </div>
            `;
        }
    });

    // Show assignment status
    const isAssigned = fullVoter.currentAgent === window.assignmentData.selectedAgentId;
    const isAssignedOther = fullVoter.currentAgent && fullVoter.currentAgent !== window.assignmentData.selectedAgentId;

    if (isAssigned) {
        const selectedAgent = window.assignmentData.agents.find(a => a.id === fullVoter.currentAgent);
        html += `
            <div style="padding: 10px; background: var(--success-50); border-radius: 8px; border: 2px solid var(--success-color);">
                <div style="font-size: 11px; font-weight: 600; color: var(--success-color); text-transform: uppercase; margin-bottom: 4px;">Assignment Status</div>
                <div style="font-size: 14px; color: var(--text-color);">Assigned to: ${selectedAgent ? selectedAgent.name : 'Current Agent'}</div>
            </div>
        `;
    } else if (isAssignedOther) {
        const otherAgent = window.assignmentData.agents.find(a => a.id === fullVoter.currentAgent);
        html += `
            <div style="padding: 10px; background: rgba(217, 119, 6, 0.1); border-radius: 8px; border: 2px solid var(--warning-color);">
                <div style="font-size: 11px; font-weight: 600; color: var(--warning-color); text-transform: uppercase; margin-bottom: 4px;">Assignment Status</div>
                <div style="font-size: 14px; color: var(--text-color);">Assigned to: ${otherAgent ? otherAgent.name : 'Another Agent'}</div>
            </div>
        `;
    } else {
        html += `
            <div style="padding: 10px; background: var(--light-color); border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase; margin-bottom: 4px;">Assignment Status</div>
                <div style="font-size: 14px; color: var(--text-color);">Unassigned</div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    detailsContainer.innerHTML = html;

    // If no image URL found, try to lookup from images folder asynchronously
    if (!imageUrl && voterIdNumber && voterIdNumber.trim()) {
        lookupImageFromFolder(voterIdNumber).then(foundUrl => {
            if (foundUrl) {
                const detailImg = detailsContainer.querySelector('#assignment-detail-image');
                const detailFallback = detailsContainer.querySelector('#assignment-detail-fallback');

                if (detailImg) {
                    detailImg.src = foundUrl;
                    detailImg.style.display = '';
                    if (detailFallback) {
                        detailFallback.style.display = 'none';
                    }
                } else if (detailFallback) {
                    // If no img element exists, create one
                    const img = document.createElement('img');
                    img.id = 'assignment-detail-image';
                    img.src = foundUrl;
                    img.alt = fullVoter.name || 'Voter';
                    img.style.cssText = 'width: 120px; height: 120px; object-fit: cover; border-radius: 12px; border: 3px solid var(--border-color);';
                    img.setAttribute('data-voter-id', voterIdNumber);
                    img.onerror = function() {
                        this.style.display = 'none';
                        if (detailFallback) {
                            detailFallback.style.display = 'flex';
                        }
                    };
                    detailFallback.parentNode.replaceChild(img, detailFallback);
                }
            }
        }).catch(() => {
            // Silently fail - fallback will show
        });
    }
}

// Toggle voter assignment (single voter)
async function toggleVoterAssignment(voterId, agentId, assign) {
    if (!window.db || !window.userEmail) return;

    try {
        const {
            doc,
            updateDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const voterRef = doc(window.db, 'voters', voterId);

        if (assign) {
            await updateDoc(voterRef, {
                assignedAgentId: agentId
            });
        } else {
            await updateDoc(voterRef, {
                assignedAgentId: null
            });
        }

        // Update local data
        const voter = window.assignmentData.voters.find(v => v.id === voterId);
        if (voter) {
            voter.currentAgent = assign ? agentId : null;
        }

        // Refresh the display
        if (window.assignmentData.selectedAgentId) {
            renderVotersForAssignment(window.assignmentData.selectedAgentId);
        }

        // Update details if this voter is currently shown
        const detailsContainer = document.getElementById('voter-details-container');
        if (detailsContainer && detailsContainer.querySelector(`[data-voter-id="${voterId}"]`)) {
            showVoterDetailsForAssignment(voter);
        }

        // Show success message
        if (window.showSuccess) {
            window.showSuccess(assign ? 'Voter assigned successfully' : 'Voter unassigned successfully', 'Success');
        }

    } catch (error) {
        console.error('Error toggling voter assignment:', error);
        if (window.showErrorDialog) {
            window.showErrorDialog('Failed to update assignment. Please try again.', 'Error');
        }
    }
}

window.saveBulkVoterAssignment = saveBulkVoterAssignment;
window.toggleTreeNode = toggleTreeNode;
window.toggleTreeView = toggleTreeView;
window.toggleVoterFilters = toggleVoterFilters;
window.viewAssignedVotersList = viewAssignedVotersList;
window.downloadAssignedVotersList = downloadAssignedVotersList;
window.showVoterDetailsForAssignment = showVoterDetailsForAssignment;
window.toggleVoterAssignment = toggleVoterAssignment;

// Toggle agent menu dropdown
// Initialize Agent Actions Menu with Event Delegation
(function initAgentActionsMenu() {
    // Use event delegation on the document for dynamic content
    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('.agent-menu-trigger');
        const actionBtn = e.target.closest('.agent-action-btn');
        const wrapper = e.target.closest('.agent-actions-wrapper');

        // Handle menu trigger click
        if (trigger) {
            e.stopPropagation();
            e.preventDefault();

            const agentId = trigger.getAttribute('data-agent-id');
            const menu = document.querySelector(`.agent-actions-menu[data-menu-for="${agentId}"]`);
            const allMenus = document.querySelectorAll('.agent-actions-menu');

            // Close all other menus
            allMenus.forEach(m => {
                if (m !== menu) {
                    m.classList.remove('is-open');
                }
            });

            // Toggle current menu
            if (menu) {
                menu.classList.toggle('is-open');
            }
            return;
        }

        // Handle action button click
        if (actionBtn) {
            e.stopPropagation();
            e.preventDefault();

            const agentId = actionBtn.getAttribute('data-agent-id');
            const action = actionBtn.getAttribute('data-action');
            const menu = actionBtn.closest('.agent-actions-menu');

            // Close menu
            if (menu) {
                menu.classList.remove('is-open');
            }

            // Execute action
            if (action === 'link') {
                if (typeof generateAgentLink === 'function') {
                    generateAgentLink(agentId);
                }
            } else if (action === 'edit') {
                if (typeof editAgent === 'function') {
                    editAgent(agentId);
                }
            } else if (action === 'delete') {
                if (typeof deleteAgent === 'function') {
                    deleteAgent(agentId);
                }
            }
            return;
        }

        // Close all menus when clicking outside
        if (!wrapper) {
            document.querySelectorAll('.agent-actions-menu').forEach(menu => {
                menu.classList.remove('is-open');
            });
        }
    });

    // Handle Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.agent-actions-menu').forEach(menu => {
                menu.classList.remove('is-open');
            });
        }
    });

    console.log('[Agent Actions] Menu system initialized with event delegation');
})();

// ==================== Call Link Generation Functions ====================

// Open Call Link Generation Modal
async function openCallLinkModal() {
    if (!window.db || !window.userEmail) {
        if (window.showError) {
            window.showError('Database not initialized. Please refresh the page.');
        }
        return;
    }

    // Use the existing modal system
    if (window.ensureModalExists && typeof window.ensureModalExists === 'function') {
        const modalOverlay = window.ensureModalExists();
        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');

        if (!modalBody || !modalTitle) {
            if (window.showError) {
                window.showError('Modal elements not found. Please refresh the page.');
            }
            return;
        }

        modalTitle.textContent = 'Generate Call Recording Link';
        modalBody.innerHTML = `
        <form id="call-link-form" class="modal-form">
            <div class="form-group">
                <label for="call-link-callers">Caller Name(s) *</label>
                <div id="callers-list" style="margin-bottom: 10px;"></div>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="call-link-caller-input" placeholder="Enter caller name" style="flex: 1;">
                    <button type="button" class="btn-secondary btn-compact" onclick="addCallerName()">Add</button>
                </div>
                <small style="color: var(--text-light); font-size: 12px; margin-top: 5px; display: block;">Add one or more caller names. These will appear in the dropdown when recording calls via the generated link.</small>
            </div>
            <div id="call-link-error" class="error-message" style="display: none;"></div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary btn-compact" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-compact">Generate Link & Code</button>
            </div>
        </form>
        <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid var(--border-color);">
            <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">Generated Links History</h3>
            <div id="call-links-history" style="max-height: 400px; overflow-y: auto;">
                <p style="text-align: center; color: var(--text-light); padding: 20px;">Loading history...</p>
            </div>
        </div>
    `;

        // Show modal
        modalOverlay.style.display = 'flex';
        if (document.body) {
            document.body.style.overflow = 'hidden';
        }

        // Load history
        await loadCallLinksHistory();

        // Form submission
        const form = document.getElementById('call-link-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await generateCallLink();
            });
        }
    } else {
        // Fallback: try to use window.openModal if available
        if (window.openModal) {
            // Create a custom modal type or use a workaround
            console.warn('ensureModalExists not available, using fallback');
        } else {
            if (window.showError) {
                window.showError('Modal system not available. Please refresh the page.');
            }
        }
    }
}

// Add caller name to list
let callerNamesList = [];

function addCallerName() {
    const input = document.getElementById('call-link-caller-input');
    const name = input.value.trim();

    if (!name) {
        window.showError('Please enter a caller name.');
        return;
    }

    if (callerNamesList.includes(name)) {
        window.showError('This caller name is already added.');
        return;
    }

    callerNamesList.push(name);
    input.value = '';
    updateCallersList();
}

// Update callers list display
function updateCallersList() {
    const list = document.getElementById('callers-list');
    if (!list) return;

    if (callerNamesList.length === 0) {
        list.innerHTML = '<p style="color: var(--text-light); font-size: 12px; margin: 0;">No callers added yet.</p>';
        return;
    }

    list.innerHTML = callerNamesList.map((name, index) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--light-color); border-radius: 8px; margin-bottom: 8px;">
            <span style="font-size: 14px; font-weight: 500;">${name}</span>
            <button type="button" onclick="removeCallerName(${index})" style="background: transparent; border: none; color: var(--danger-color); cursor: pointer; padding: 4px 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join('');
}

// Remove caller name
function removeCallerName(index) {
    callerNamesList.splice(index, 1);
    updateCallersList();
}

// Generate call link
async function generateCallLink() {
    if (!window.db || !window.userEmail) {
        window.showError('Database not initialized.');
        return;
    }

    if (callerNamesList.length === 0) {
        window.showError('Please add at least one caller name.');
        return;
    }

    const errorDiv = document.getElementById('call-link-error');
    errorDiv.style.display = 'none';

    try {
        // Generate temporary password (8-12 characters, alphanumeric)
        const tempPassword = Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 6).toUpperCase();

        // Generate unique link ID
        const linkId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Import Firebase functions
        const {
            doc,
            setDoc,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Create link document
        const linkData = {
            linkId: linkId,
            tempPassword: tempPassword, // Store temporary password
            callerNames: callerNamesList,
            campaignEmail: window.userEmail,
            createdAt: serverTimestamp(),
            callsMade: 0,
            active: true
        };

        await setDoc(doc(window.db, 'callLinks', linkId), linkData);

        // Reset form
        callerNamesList = [];
        updateCallersList();

        // Generate link to dedicated call recording page (like agent.html)
        // Use a more robust method that works across browsers and devices
        let baseUrl = '';

        // Method 1: Try to get base URL from current location
        try {
            const currentUrl = new URL(window.location.href);
            // Remove the filename (index.html) from the path
            const pathParts = currentUrl.pathname.split('/').filter(p => p && !p.endsWith('.html'));
            const basePath = pathParts.length > 0 ? '/' + pathParts.join('/') + '/' : '/';
            baseUrl = currentUrl.origin + basePath;
        } catch (e) {
            // Fallback: Use origin + current directory
            const pathname = window.location.pathname;
            const lastSlash = pathname.lastIndexOf('/');
            const basePath = lastSlash >= 0 ? pathname.substring(0, lastSlash + 1) : '/';
            baseUrl = window.location.origin + basePath;
        }

        // Ensure baseUrl ends with /
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }

        // Generate link to call-recording.html (will create this page)
        const linkUrl = `${baseUrl}call-recording.html?linkId=${linkId}`;

        // Close the generation modal first
        if (window.closeModal) {
            window.closeModal();
        }

        // Show results in a new modal (include temp password)
        showCallLinkResultsModal(linkUrl, tempPassword);

        // Reload history
        await loadCallLinksHistory();
    } catch (error) {
        console.error('Error generating call link:', error);
        errorDiv.textContent = 'Failed to generate link. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Load call links history
async function loadCallLinksHistory() {
    if (!window.db || !window.userEmail) return;

    const historyDiv = document.getElementById('call-links-history');
    if (!historyDiv) return;

    try {
        const {
            collection,
            query,
            where,
            orderBy,
            getDocs
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        let snapshot;
        try {
            // Try query with orderBy first
            const q = query(
                collection(window.db, 'callLinks'),
                where('campaignEmail', '==', window.userEmail),
                orderBy('createdAt', 'desc')
            );
            snapshot = await getDocs(q);
        } catch (indexError) {
            // If index doesn't exist, try without orderBy
            console.warn('Index not found, fetching without orderBy:', indexError);
            const q = query(
                collection(window.db, 'callLinks'),
                where('campaignEmail', '==', window.userEmail)
            );
            snapshot = await getDocs(q);
        }

        if (snapshot.empty) {
            historyDiv.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">No links generated yet.</p>';
            return;
        }

        const links = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Use doc.id as the primary ID, but also check if linkId exists in data
            links.push({
                id: doc.id, // Firestore document ID
                linkId: data.linkId || doc.id, // Stored linkId or fallback to doc.id
                ...data
            });
        });

        // Sort by createdAt descending (client-side) if orderBy wasn't used
        links.sort((a, b) => {
            const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        historyDiv.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color);">
                        <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: var(--text-color);">Callers</th>
                        <th style="text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: var(--text-color);">Date & Time</th>
                        <th style="text-align: center; padding: 12px; font-size: 13px; font-weight: 600; color: var(--text-color);">Calls</th>
                        <th style="text-align: center; padding: 12px; font-size: 13px; font-weight: 600; color: var(--text-color);">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${links.map(link => {
                        let date;
                        try {
                            if (link.createdAt?.toDate) {
                                date = link.createdAt.toDate();
                            } else if (link.createdAt?.seconds) {
                                date = new Date(link.createdAt.seconds * 1000);
                            } else if (link.createdAt) {
                                date = new Date(link.createdAt);
                            } else {
                                date = new Date();
                            }
                        } catch (e) {
                            date = new Date();
                        }
                        
                        const dateStr = date instanceof Date && !isNaN(date) 
                            ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
                            : 'N/A';
                        
                        const callerNamesStr = (link.callerNames && Array.isArray(link.callerNames)) 
                            ? link.callerNames.join(', ') 
                            : 'N/A';
                        
                        // Use linkId if available, otherwise use doc.id
                        const deleteId = link.linkId || link.id;
                        
                        return '<tr style="border-bottom: 1px solid var(--border-color);">' +
                            '<td style="padding: 12px; font-size: 13px;">' + callerNamesStr + '</td>' +
                            '<td style="padding: 12px; font-size: 13px; color: var(--text-light);">' + dateStr + '</td>' +
                            '<td style="padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: var(--primary-color);">' + (link.callsMade || 0) + '</td>' +
                            '<td style="padding: 12px; text-align: center;">' +
                            '<button onclick="deleteCallLink(\'' + deleteId.replace(/'/g, "\\'") + '\')" class="btn-danger btn-compact" style="padding: 6px 12px; font-size: 12px;">Delete</button>' +
                            '</td>' +
                            '</tr>';
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading call links history:', error);
        let errorMessage = 'Error loading history.';
        if (error.code === 'failed-precondition') {
            errorMessage = 'Firestore index required. Please create an index for callLinks collection with fields: campaignEmail (Ascending), createdAt (Descending).';
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }
        historyDiv.innerHTML = `<p style="text-align: center; color: var(--danger-color); padding: 20px;">${errorMessage}</p>`;
    }
}

// Delete call link
async function deleteCallLink(linkId) {
    if (!window.db || !window.userEmail) return;

    // Use custom dialog instead of browser confirm
    let confirmed = false;
    if (window.showDialog) {
        try {
            confirmed = await window.showDialog({
                type: 'confirm',
                title: 'Delete Call Link',
                message: 'Are you sure you want to delete this link? This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            });
        } catch (error) {
            console.error('[deleteCallLink] Error showing confirm dialog:', error);
            // Fallback to browser confirm
            confirmed = confirm('Are you sure you want to delete this link? This action cannot be undone.');
        }
    } else {
        // Fallback to browser confirm if custom dialog not available
        confirmed = confirm('Are you sure you want to delete this link? This action cannot be undone.');
    }

    if (!confirmed) {
        return;
    }

    try {
        const {
            doc,
            deleteDoc,
            getDoc
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        console.log('[deleteCallLink] Attempting to delete link:', linkId);
        console.log('[deleteCallLink] User email:', window.userEmail);

        // First, verify the document exists and check permissions
        const linkRef = doc(window.db, 'callLinks', linkId);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
            console.error('[deleteCallLink] Link not found:', linkId);
            window.showError('Link not found. It may have already been deleted.');
            await loadCallLinksHistory(); // Reload to refresh the table
            return;
        }

        const linkData = linkSnap.data();
        console.log('[deleteCallLink] Link data:', linkData);
        console.log('[deleteCallLink] Link campaignEmail:', linkData.campaignEmail);
        console.log('[deleteCallLink] Current user email:', window.userEmail);

        // Verify ownership before deleting
        if (linkData.campaignEmail !== window.userEmail) {
            console.error('[deleteCallLink] Permission denied - email mismatch');
            window.showError('Permission denied. You can only delete your own call links.');
            return;
        }

        // Delete the document
        await deleteDoc(linkRef);

        console.log('[deleteCallLink] Link deleted successfully');
        window.showSuccess('Link deleted successfully.', 'Deleted');
        await loadCallLinksHistory();
    } catch (error) {
        console.error('[deleteCallLink] Error deleting call link:', error);
        console.error('[deleteCallLink] Error code:', error.code);
        console.error('[deleteCallLink] Error message:', error.message);
        console.error('[deleteCallLink] Full error:', error);

        let errorMessage = 'Failed to delete link. Please try again.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. You can only delete your own call links. Please check the browser console for details.';
        } else if (error.code === 'not-found') {
            errorMessage = 'Link not found. It may have already been deleted.';
        } else if (error.message) {
            errorMessage = `Failed to delete link: ${error.message}`;
        }

        window.showError(errorMessage);
    }
}

// Show call link results modal
function showCallLinkResultsModal(linkUrl, tempPassword) {
    const modalOverlay = window.ensureModalExists ? window.ensureModalExists() : null;
    if (!modalOverlay) {
        window.showError('Modal system not available.');
        return;
    }

    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    if (!modalBody || !modalTitle) {
        window.showError('Modal elements not found.');
        return;
    }

    modalTitle.textContent = 'Link & Access Code Generated';
    modalBody.innerHTML = `
        <div style="padding: 20px 0;">
            <div style="background: linear-gradient(135deg, rgba(111, 193, 218, 0.1) 0%, rgba(141, 212, 232, 0.1) 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(111, 193, 218, 0.2);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-color);">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--text-color);">Link Generated Successfully!</h3>
                </div>
                <p style="margin: 0; font-size: 13px; color: var(--text-light); line-height: 1.6;">Share the link and access code with your callers. They will need both to access the call recording page.</p>
            </div>

            <div style="background: var(--light-color); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); margin-bottom: 8px;">Generated Link:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="generated-link-input-modal" value="${linkUrl}" readonly style="flex: 1; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; background: white; font-size: 13px; font-family: monospace; cursor: text;">
                    <button onclick="copyCallLinkFromModal()" class="btn-primary btn-compact" style="padding: 12px 20px; white-space: nowrap;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Link
                    </button>
                </div>
            </div>

            <div style="background: var(--light-color); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-light); margin-bottom: 8px;">Temporary Password:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" id="generated-password-input-modal" value="${tempPassword}" readonly style="flex: 1; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; background: white; font-size: 14px; font-family: monospace; font-weight: 600; cursor: text;">
                    <button onclick="copyCallPasswordFromModal()" class="btn-primary btn-compact" style="padding: 12px 20px; white-space: nowrap;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy Password
                    </button>
                </div>
            </div>
            <div style="background: rgba(111, 193, 218, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid var(--primary-color); margin-bottom: 16px;">
                <p style="font-size: 12px; color: var(--text-color); margin: 0; line-height: 1.6;">
                    <strong>Instructions:</strong> Share the link and temporary password with your callers. They will need to enter the campaign manager email and temporary password to access the call recording page.
                </p>
            </div>
        </div>
        <div class="modal-footer" style="margin-top: 0; padding-top: 20px; border-top: 1px solid var(--border-color);">
            <button type="button" class="btn-primary btn-compact" onclick="closeModal()" style="width: 100%;">Done</button>
        </div>
    `;

    // Show modal
    modalOverlay.style.display = 'flex';
    if (document.body) {
        document.body.style.overflow = 'hidden';
    }

    // Select all text in inputs when clicked for easy copying
    setTimeout(() => {
        const linkInput = document.getElementById('generated-link-input-modal');
        const codeInput = document.getElementById('generated-code-input-modal');

        if (linkInput) {
            linkInput.addEventListener('click', function() {
                this.select();
            });
        }

        if (codeInput) {
            codeInput.addEventListener('click', function() {
                this.select();
            });
        }
    }, 100);
}

// Copy call link from modal
async function copyCallLinkFromModal() {
    const linkInput = document.getElementById('generated-link-input-modal');
    if (linkInput && linkInput.value) {
        try {
            await navigator.clipboard.writeText(linkInput.value);
            window.showSuccess('Link copied to clipboard!', 'Copied');
        } catch (error) {
            console.error('Error copying link:', error);
            // Fallback: select text
            linkInput.select();
            linkInput.setSelectionRange(0, 99999);
            window.showError('Failed to copy. Text is selected - press Ctrl+C to copy.');
        }
    }
}

// Copy call code from modal
async function copyCallPasswordFromModal() {
    const passwordInput = document.getElementById('generated-password-input-modal');
    if (passwordInput && passwordInput.value) {
        try {
            await navigator.clipboard.writeText(passwordInput.value);
            window.showSuccess('Temporary password copied to clipboard!', 'Copied');
        } catch (error) {
            console.error('Error copying password:', error);
            // Fallback: select text
            passwordInput.select();
            passwordInput.setSelectionRange(0, 99999);
            document.execCommand('copy');
            window.showSuccess('Password selected. Press Ctrl+C to copy.', 'Selected');
        }
    }
}

async function copyCallCodeFromModal() {
    const codeInput = document.getElementById('generated-code-input-modal');
    if (codeInput && codeInput.value) {
        try {
            await navigator.clipboard.writeText(codeInput.value);
            window.showSuccess('Access code copied to clipboard!', 'Copied');
        } catch (error) {
            console.error('Error copying code:', error);
            // Fallback: select text
            codeInput.select();
            codeInput.setSelectionRange(0, 99999);
            window.showError('Failed to copy. Text is selected - press Ctrl+C to copy.');
        }
    }
}

// Make functions globally available
window.openCallLinkModal = openCallLinkModal;
window.addCallerName = addCallerName;
window.removeCallerName = removeCallerName;
window.copyCallPasswordFromModal = copyCallPasswordFromModal;
window.deleteCallLink = deleteCallLink;
window.copyCallLinkFromModal = copyCallLinkFromModal;
window.copyCallCodeFromModal = copyCallCodeFromModal;
window.copyCallCodeFromModal = copyCallCodeFromModal