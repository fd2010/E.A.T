// settings.js
import { database } from '../database/firebase-config.js';
import { ref, update, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

export function initialiseSettingsModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('settingsModal')) {
        const modalHTML = `
            <div id="settingsModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    
                    <h2 class="h2Light">Settings</h2>
                    
                    <div class="settings-container">
                        <!-- Dark Mode Setting -->
                        <div class="setting-item">
                            <div class="setting-label">Dark Mode</div>
                            <label class="switch">
                                <input type="checkbox" id="darkModeToggle">
                                <span class="slider"></span>
                            </label>
                        </div>

                        <!-- Room tabs toggle -->
                        <div class="setting-item">
                            <div class="setting-label">Scrollable Tabs </div>
                            <label class="switch">
                                <input type="checkbox" id="darkModeToggle">
                                <span class="slider"></span>
                            </label>
                        </div>
                        
                        <!-- Export Data Setting -->
                        <div class="setting-item">
                            <div class="setting-label">Export Data</div>
                            <button id="exportDataBtn" class="buttonHome lightcyanButton">
                                Export
                            </button>
                        </div>
                        
                        <!-- About Section -->
                        <div class="setting-item">
                            <div class="setting-label">About</div>
                            <button id="aboutBtn" class="buttonHome lightcyanButton">
                                View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setupSettingsEventListeners();
    }
}

function setupSettingsEventListeners() {
    // Close button
    const closeButton = document.querySelector('#settingsModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent event bubbling
            closeSettingsModal();
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            // This is where dark mode functionality would go
            console.log('Dark mode:', this.checked ? 'On' : 'Off');
        });
    }

    // Export Data Button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            // This is where export data functionality goes

            //TODO

            alert('Putting this job on muskaan and karan lol');
        });
    }

    // About Button
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', function() {
            // This is where about page functionality would go
            console.log('About clicked');
            alert('Energy Allocation Tracker (E.A.T)\nVersion 1.0\nDeveloped by PearCare Inc.');
        });
    }

    // Close when clicking outside of modal
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('settingsModal');
        if (event.target === modal) {
            closeSettingsModal();
        }
    });
}

// Function to show the settings modal
function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) {
        initialiseSettingsModal();
    }
    document.getElementById('settingsModal').style.display = 'block';
}

// Function to close the settings modal
function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make showSettingsModal function globally accessible
window.showSettingsModal = showSettingsModal;

// Initialize the modal when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initialiseSettingsModal();
});

export { showSettingsModal };