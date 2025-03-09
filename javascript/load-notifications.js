// load-notifications.js
// This script can be imported in any page to automatically initialize the notification system

import { initializeNotificationSystem } from './notifications.js';

// Function to ensure the notification modal exists
function ensureNotificationModal() {
    // Check if notification modal already exists
    if (!document.getElementById('notificationModal')) {
        // Create the notification modal if it doesn't exist
        const modalHTML = `
            <div id="notificationModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    
                    <h2 class="h2Light">Notifications</h2>
                    
                    <div id="notificationsList" class="notifications-list">
                        <!-- Notifications will be dynamically inserted here -->
                        <div class="no-notifications-message">No notifications to display</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Function to ensure notification CSS is loaded
function ensureNotificationCSS() {
    if (!document.querySelector('link[href="./css/notification.css"]')) {
        const notificationCss = document.createElement('link');
        notificationCss.rel = 'stylesheet';
        notificationCss.href = './css/notification.css';
        document.head.appendChild(notificationCss);
    }
}

// Function to fix notification close button
function fixNotificationCloseButton() {
    setTimeout(() => {
        const notificationCloseBtn = document.querySelector('#notificationModal .close-button');
        if (notificationCloseBtn) {
            console.log('Adding direct event listener to notification close button');
            notificationCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Notification close button clicked via direct handler');
                const modal = document.getElementById('notificationModal');
                if (modal) modal.style.display = 'none';
                return false;
            });
        }
    }, 1000); // Delay to ensure DOM is fully loaded
}

// Main function to load and initialize notifications
function loadNotifications() {
    console.log('Initializing notification system...');
    ensureNotificationCSS();
    ensureNotificationModal();
    initializeNotificationSystem();
    fixNotificationCloseButton();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadNotifications);

// Export the function for manual initialization if needed
export { loadNotifications };