// search-device.js - Separate file for device search functionality
console.log('search-device.js loading...');

/**
 * Initialise the device search functionality
 */
function initialiseDeviceSearch() {
    const searchInput = document.getElementById('deviceSearchInput');
    if (!searchInput) {
        console.error('Device search input not found');
        return;
    }

    // Add input event listener for real-time filtering
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterDevices(searchTerm);
    });

    console.log('Device search initialised');
}

/**
 * Filter devices based on search term
 * @param {string} searchTerm - The search term to filter by
 */
function filterDevices(searchTerm) {
    const deviceCards = document.querySelectorAll('.device-card');
    let visibleCount = 0;
    
    deviceCards.forEach(card => {
        const deviceName = card.querySelector('.device-name').textContent.toLowerCase();
        const deviceType = card.querySelector('.device-type').textContent.toLowerCase();
        
        // Check if device name or type contains the search term
        const isMatch = deviceName.includes(searchTerm) || deviceType.includes(searchTerm);
        
        // Show/hide the card based on match
        card.classList.toggle('hidden', !isMatch);
        
        if (isMatch) {
            visibleCount++;
        }
    });
    
    // Handle no results message
    let noResultsMessage = document.querySelector('.no-results-message');
    
    if (visibleCount === 0 && searchTerm !== '') {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.textContent = 'No devices found matching your search';
            document.getElementById('devicesGrid').appendChild(noResultsMessage);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

/**
 * Apply current search filter after room tab changes or when devices are updated
 */
function reapplySearchFilter() {
    const searchInput = document.getElementById('deviceSearchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        filterDevices(searchInput.value.toLowerCase().trim());
    }
}

// Initialise when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing device search');
    initialiseDeviceSearch();
});

// Export functions for use in other files
export {
    initialiseDeviceSearch,
    filterDevices,
    reapplySearchFilter
};