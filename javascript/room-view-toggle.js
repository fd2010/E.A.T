// room-view-toggle.js - Toggle between room tabs and dropdown view

// Function to add the view toggle switch to the page
function addViewToggleSwitch() {
    console.log('Adding room view toggle switch...');
    
    // Create toggle switch container
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'view-toggle-container';
    
    // Create the toggle switch HTML
    toggleContainer.innerHTML = `
        <div class="view-toggle-label">
            <span class="tabs-label">Tabs</span>
            <label class="view-toggle-switch">
                <input type="checkbox" id="viewToggle">
                <span class="view-toggle-slider"></span>
            </label>
            <span class="dropdown-label">Dropdown</span>
        </div>
    `;
    
    // Find the appropriate location to insert the toggle
    // We'll place it above the room tabs
    const roomTabsContainer = document.getElementById('roomTabs');
    if (roomTabsContainer && roomTabsContainer.parentNode) {
        roomTabsContainer.parentNode.insertBefore(toggleContainer, roomTabsContainer);
        
        // Check if user preference is stored
        const viewPreference = localStorage.getItem('roomViewPreference');
        const viewToggle = document.getElementById('viewToggle');
        
        if (viewPreference === 'dropdown') {
            viewToggle.checked = true;
            convertToDropdown();
        } else {
            viewToggle.checked = false;
            convertToTabs();
        }
        
        // Add event listener for the toggle
        viewToggle.addEventListener('change', function() {
            if (this.checked) {
                // Switch to dropdown view
                console.log('Switching to dropdown view');
                localStorage.setItem('roomViewPreference', 'dropdown');
                convertToDropdown();
            } else {
                // Switch to tabs view
                console.log('Switching to tabs view');
                localStorage.setItem('roomViewPreference', 'tabs');
                convertToTabs();
            }
        });
    } else {
        console.error('Could not find roomTabs container');
    }
}

// Function to convert to dropdown view
function convertToDropdown() {
    const roomTabsContainer = document.getElementById('roomTabs');
    const dropdownContainer = document.querySelector('.room-dropdown-container');
    
    // If dropdown already exists, just show it
    if (dropdownContainer) {
        dropdownContainer.style.display = 'block';
        if (roomTabsContainer) roomTabsContainer.style.display = 'none';
        return;
    }
    
    // If not, create the dropdown using the existing function
    if (typeof convertRoomTabsToDropdown === 'function') {
        convertRoomTabsToDropdown();
    } else {
        console.error('convertRoomTabsToDropdown function not available');
        // Import the function dynamically if it's not already available
        import('./room-dropdown.js')
            .then(module => {
                if (typeof module.convertRoomTabsToDropdown === 'function') {
                    module.convertRoomTabsToDropdown();
                } else {
                    console.error('convertRoomTabsToDropdown function not found in module');
                }
            })
            .catch(err => console.error('Error importing room-dropdown.js:', err));
    }
}

// Function to convert to tabs view
function convertToTabs() {
    const roomTabsContainer = document.getElementById('roomTabs');
    const dropdownContainer = document.querySelector('.room-dropdown-container');
    
    if (roomTabsContainer && dropdownContainer) {
        // Show the original tabs
        roomTabsContainer.style.display = 'flex';
        // Hide the dropdown
        dropdownContainer.style.display = 'none';
    }
}

// Export the functions for use in other modules
export { 
    addViewToggleSwitch,
    convertToDropdown,
    convertToTabs
};

// Initialize if this script is loaded directly
document.addEventListener('DOMContentLoaded', () => {
    // Check if dashboard elements are loaded
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        // Add a slight delay to ensure other elements have loaded
        setTimeout(() => {
            addViewToggleSwitch();
        }, 800);
    }
});