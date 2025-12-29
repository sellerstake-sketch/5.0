// Global Filter State Manager
// Single source of truth for location-based filtering across the entire application

(function() {
    'use strict';

    // Global filter state
    const filterState = {
        type: null, // 'constituency' | 'island' | null
        value: null, // constituency name or island name
        listeners: [] // Array of callback functions to notify on filter changes
    };

    // Initialize filter state from localStorage if available
    function initializeFilterState() {
        try {
            const savedFilter = localStorage.getItem('globalLocationFilter');
            if (savedFilter) {
                const parsed = JSON.parse(savedFilter);
                if (parsed.type && parsed.value) {
                    filterState.type = parsed.type;
                    filterState.value = parsed.value;
                }
            }
        } catch (error) {
            console.warn('[GlobalFilter] Failed to load saved filter state:', error);
        }
    }

    // Save filter state to localStorage
    function persistFilterState() {
        try {
            if (filterState.type && filterState.value) {
                localStorage.setItem('globalLocationFilter', JSON.stringify({
                    type: filterState.type,
                    value: filterState.value
                }));
            } else {
                localStorage.removeItem('globalLocationFilter');
            }
        } catch (error) {
            console.warn('[GlobalFilter] Failed to save filter state:', error);
        }
    }

    // Get current filter state
    function getFilterState() {
        return {
            type: filterState.type,
            value: filterState.value,
            isActive: filterState.type !== null && filterState.value !== null
        };
    }

    // Set filter state
    function setFilter(type, value) {
        if (type !== 'constituency' && type !== 'island' && type !== null) {
            console.error('[GlobalFilter] Invalid filter type:', type);
            return;
        }

        const previousState = { ...filterState };
        
        filterState.type = type;
        filterState.value = value;

        persistFilterState();
        notifyListeners(previousState);
    }

    // Clear filter
    function clearFilter() {
        setFilter(null, null);
    }

    // Subscribe to filter changes
    function subscribe(callback) {
        if (typeof callback !== 'function') {
            console.error('[GlobalFilter] Callback must be a function');
            return;
        }

        filterState.listeners.push(callback);

        // Return unsubscribe function
        return function unsubscribe() {
            const index = filterState.listeners.indexOf(callback);
            if (index > -1) {
                filterState.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of filter changes
    function notifyListeners(previousState) {
        const currentState = getFilterState();
        filterState.listeners.forEach(callback => {
            try {
                callback(currentState, previousState);
            } catch (error) {
                console.error('[GlobalFilter] Error in filter listener:', error);
            }
        });
    }

    // Filter utility: Check if a data item matches the current filter
    function matchesFilter(item) {
        if (!filterState.type || !filterState.value) {
            return true; // No filter active, show all
        }

        if (filterState.type === 'constituency') {
            // Match if item's constituency matches (check multiple possible field names)
            const itemConstituency = (item.constituency || item.voterConstituency || '').toString().trim();
            const filterValue = filterState.value.toString().trim();
            
            // Use case-insensitive comparison
            const matches = itemConstituency.toLowerCase() === filterValue.toLowerCase();
            
            // Debug logging (only log first few mismatches to avoid spam)
            if (!matches && Math.random() < 0.01) { // Log 1% of mismatches
                console.log('[GlobalFilter] Constituency mismatch:', {
                    itemConstituency: itemConstituency,
                    filterValue: filterValue,
                    item: item
                });
            }
            
            return matches;
        } else if (filterState.type === 'island') {
            // Match if item's island matches (use case-insensitive comparison)
            const itemIsland = (item.island || '').toString().trim();
            const filterValue = filterState.value.toString().trim();
            return itemIsland.toLowerCase() === filterValue.toLowerCase();
        }

        return true;
    }

    // Filter utility: Filter an array of data items
    function filterArray(dataArray) {
        if (!Array.isArray(dataArray)) {
            return [];
        }

        if (!filterState.type || !filterState.value) {
            return dataArray; // No filter active, return all
        }

        return dataArray.filter(matchesFilter);
    }

    // Get islands for current constituency filter
    function getFilteredIslands() {
        if (filterState.type === 'constituency' && filterState.value) {
            return getIslandsForConstituency(filterState.value) || [];
        }
        return [];
    }

    // Get constituency for current island filter
    function getFilteredConstituency() {
        if (filterState.type === 'island' && filterState.value) {
            return getConstituencyForIsland(filterState.value);
        }
        return null;
    }

    // Initialize on load
    initializeFilterState();

    // Expose global filter API
    window.GlobalFilter = {
        getState: getFilterState,
        setFilter: setFilter,
        clearFilter: clearFilter,
        subscribe: subscribe,
        matchesFilter: matchesFilter,
        filterArray: filterArray,
        getFilteredIslands: getFilteredIslands,
        getFilteredConstituency: getFilteredConstituency
    };

    console.log('[GlobalFilter] Initialized with state:', getFilterState());
})();


