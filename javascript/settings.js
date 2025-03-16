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
        loadSavedSettings();
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
            toggleDarkMode(this.checked);
            saveSettings('darkMode', this.checked);
        });
    }

    // Export Data Button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            exportUserData();
        });
    }

    // About Button
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', function() {
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

function toggleDarkMode(isDark) {
    const body = document.body;
    
    // Change the body's background color
    if (isDark) {
        body.classList.remove('bodyLight');
        body.classList.add('bodyDark');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        body.classList.remove('bodyDark');
        body.classList.add('bodyLight');
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Invert company branding
    const companyDiv = document.querySelector('.divLight');
    if (companyDiv) {
        if (isDark) {
            companyDiv.classList.remove('divLight');
            companyDiv.classList.add('divDark');
            // Also update the company name text color
            const companyName = document.getElementById('companyName');
            if (companyName) {
                companyName.style.color = '#FFFFFF';
            }
            // Update the line color
            const line = document.getElementById('line');
            if (line) {
                line.style.background = '#FFFFFF';
            }
        } else {
            companyDiv.classList.remove('divDark');
            companyDiv.classList.add('divLight');
            // Reset company name text color
            const companyName = document.getElementById('companyName');
            if (companyName) {
                companyName.style.color = '';
            }
            // Reset the line color
            const line = document.getElementById('line');
            if (line) {
                line.style.background = '';
            }
        }
    }

    // Update user profile section
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        if (isDark) {
            userProfile.style.background = 'linear-gradient(145deg,rgb(255, 255, 255),rgb(255, 255, 255))';
            userProfile.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)';
        } else {
            userProfile.style.background = 'linear-gradient(145deg, #121212, #2a2a2a)';
            userProfile.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        }
    }

    // Update user role badge
    const userRole = document.getElementById('userRole');
    if (userRole) {
        if (isDark) {
            userRole.style.backgroundColor = '#444444';
            userRole.style.color = '#FFFFFF';
        } else {
            userRole.style.backgroundColor = '#f5f5f5';
            userRole.style.color = '#333';
        }
    }

    // Update profile icon background
    const profileIcon = document.querySelector('.profile-icon');
    if (profileIcon) {
        if (isDark) {
            profileIcon.style.backgroundColor = '#000000';
        } else {
            profileIcon.style.backgroundColor = '#FFF';
        }
    }
}

// Function to export user data
function exportUserData() {
    alert('This is a job for karan and muskaan lol');
}

// Save settings to localStorage
function saveSettings(key, value) {
    try {
        const settings = JSON.parse(localStorage.getItem('eatSettings')) || {};
        settings[key] = value;
        localStorage.setItem('eatSettings', JSON.stringify(settings));
        
        // If connected to Firebase, also save there
        if (typeof database !== 'undefined') {
            const user = getCurrentUser(); // You would need to implement this
            if (user) {
                const userSettingsRef = ref(database, `users/${user.uid}/settings`);
                update(userSettingsRef, { [key]: value });
            }
        }
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Load saved settings
function loadSavedSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('eatSettings')) || {};
        
        // Apply dark mode if it was saved
        if (settings.darkMode) {
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
            }
            toggleDarkMode(true);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Function to get the current user - placeholder, implement based on your auth system
function getCurrentUser() {
    // This would return the current user from your authentication system
    return null;
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
    
    // Check if we should load dark mode from URL parameters (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('darkMode')) {
        const darkMode = urlParams.get('darkMode') === 'true';
        toggleDarkMode(darkMode);
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = darkMode;
        }
    }
});

export { showSettingsModal, toggleDarkMode };