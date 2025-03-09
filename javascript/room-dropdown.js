// Enhanced room-dropdown.js that supports toggling between views

// This function replaces the room tabs with a dropdown menu
function convertRoomTabsToDropdown() {
    // Get the container where the room tabs are currently located
    const roomTabsContainer = document.getElementById('roomTabs');
    if (!roomTabsContainer) return;
    
    // If a dropdown already exists, just show it and hide tabs
    const existingDropdown = document.querySelector('.room-dropdown-container');
    if (existingDropdown) {
        existingDropdown.style.display = 'block';
        roomTabsContainer.style.display = 'none';
        return;
    }
    
    // Create the container for our new dropdown
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'room-dropdown-container';
    
    // Create the select element
    const selectElement = document.createElement('select');
    selectElement.className = 'room-select';
    selectElement.id = 'roomSelect';
    
    // Create the dropdown arrow
    const dropdownArrow = document.createElement('span');
    dropdownArrow.className = 'dropdown-arrow';
    
    // Get all existing room tabs
    const roomTabs = roomTabsContainer.querySelectorAll('.room-tab');
    
    // Check if we have any room tabs
    if (roomTabs.length === 0) {
        // If no rooms, add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'No rooms available';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);
    } else {
        // Add an initial prompt option
        const promptOption = document.createElement('option');
        promptOption.value = '';
        promptOption.textContent = 'Select a room';
        promptOption.disabled = true;
        promptOption.selected = true;
        selectElement.appendChild(promptOption);
        
        // Convert each room tab to an option in the dropdown
        roomTabs.forEach((tab, index) => {
            const option = document.createElement('option');
            option.value = tab.textContent;
            option.textContent = tab.textContent;
            
            // If the tab was active, select this option
            if (tab.classList.contains('active')) {
                option.selected = true;
                promptOption.selected = false;
            }
            
            selectElement.appendChild(option);
        });
    }
    
    // Add event listener to handle room selection
    selectElement.addEventListener('change', function() {
        const selectedRoomName = this.value;
        
        // Update UI to show selected room's devices
        if (window._latestRoomData && window._latestRoomData[selectedRoomName]) {
            // Simulate the old tab click behavior
            document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
            const matchingTab = Array.from(roomTabs).find(tab => tab.textContent === selectedRoomName);
            if (matchingTab) matchingTab.classList.add('active');
            
            // Update the devices grid with the selected room's data
            const currentRoomData = window._latestRoomData[selectedRoomName];
            
            // Import needed functions
            if (typeof updateDevicesGrid === 'function') {
                updateDevicesGrid(currentRoomData, selectedRoomName);
            } else {
                // Fall back to a more basic approach if the function isn't available
                const devicesGrid = document.getElementById('devicesGrid');
                if (devicesGrid) {
                    devicesGrid.innerHTML = '<div class="loading-devices">Loading devices...</div>';
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            }
        }
    });
    
    // Assemble the dropdown
    dropdownContainer.appendChild(selectElement);
    dropdownContainer.appendChild(dropdownArrow);
    
    // Replace the room tabs with our dropdown
    roomTabsContainer.parentNode.insertBefore(dropdownContainer, roomTabsContainer);
    roomTabsContainer.style.display = 'none';
}

// New function to convert dropdown back to tabs
function convertDropdownToTabs() {
    const roomTabsContainer = document.getElementById('roomTabs');
    const dropdownContainer = document.querySelector('.room-dropdown-container');
    
    if (roomTabsContainer && dropdownContainer) {
        // Show the tabs
        roomTabsContainer.style.display = 'flex';
        // Hide the dropdown
        dropdownContainer.style.display = 'none';
        
        // Transfer active state from dropdown to tabs
        const selectedOption = document.querySelector('#roomSelect option:checked');
        if (selectedOption && selectedOption.value) {
            const roomTabs = roomTabsContainer.querySelectorAll('.room-tab');
            roomTabs.forEach(tab => {
                if (tab.textContent === selectedOption.value) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }
    }
}

// This function initializes the room dropdown
function initializeRoomDropdown() {
    // Get user preference from localStorage
    const viewPreference = localStorage.getItem('roomViewPreference');
    
    // If preference is set to dropdown or undefined, convert to dropdown
    if (viewPreference === 'dropdown') {
        setTimeout(() => {
            convertRoomTabsToDropdown();
        }, 500);
    }
    
    // Set up toggle functionality - will be handled by room-view-toggle.js
}

// Export the functions to be used in other modules
export { 
    initializeRoomDropdown, 
    convertRoomTabsToDropdown, 
    convertDropdownToTabs 
};

// Call the initialization directly if this script is being run on its own
document.addEventListener('DOMContentLoaded', () => {
    // Check if dashboard elements are loaded
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        initializeRoomDropdown();
        
        // Also set up a mutation observer to catch dynamically loaded room tabs
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Look for room tabs being added
                    const roomTabs = document.getElementById('roomTabs');
                    if (roomTabs && roomTabs.children.length > 0 && 
                        !document.querySelector('.room-dropdown-container') && 
                        localStorage.getItem('roomViewPreference') === 'dropdown') {
                        convertRoomTabsToDropdown();
                        break;
                    }
                }
            }
        });
        
        observer.observe(dashboardContent, { childList: true, subtree: true });
    }
});