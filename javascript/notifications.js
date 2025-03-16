// notifications.js
import { auth, database } from '../database/firebase-config.js';
import { ref, onValue, update, get, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Initialize notification system
function initializeNotificationSystem() {
    // First check if we're on a page that should have notifications
    const notificationImg = document.querySelector('img[alt="Notifications"]');
    if (!notificationImg) {
        console.log('No notification bell found on this page, skipping initialization');
        return;
    }

    // Create notification modal if it doesn't exist
    if (!document.getElementById('notificationModal')) {
        // Create the notification modal if it doesn't exist
        const modalHTML = `
            <div id="notificationModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    
                    <h2 class="h2Light">Notifications</h2>
                    
                    <div class="notifications-container">
                        <div id="notificationsList" class="notifications-list">
                            <!-- Notifications will be dynamically inserted here -->
                            <div class="no-notifications-message">No notifications to display</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Add CSS if needed
    if (!document.querySelector('link[href="./css/notification.css"]')) {
        const notificationCss = document.createElement('link');
        notificationCss.rel = 'stylesheet';
        notificationCss.href = './css/notification.css';
        document.head.appendChild(notificationCss);
    }

    // Set up event listeners for existing modal
    setupNotificationEventListeners();

    // Convert notification bell to have badge
    setupNotificationBell();

    // Start listening for notifications
    startNotificationListener();
}

// Set up the notification bell
function setupNotificationBell() {
    const notificationImg = document.querySelector('img[alt="Notifications"]');
    
    if (notificationImg) {
        // Create a container for the bell and badge
        const bellContainer = document.createElement('div');
        bellContainer.className = 'notification-bell';
        
        // Create the badge
        const badge = document.createElement('div');
        badge.className = 'notification-badge';
        badge.id = 'notificationBadge';
        badge.textContent = '0';
        
        // Replace the image with our container
        const parent = notificationImg.parentNode;
        parent.replaceChild(bellContainer, notificationImg);
        
        // Add the image and badge to our container
        bellContainer.appendChild(notificationImg);
        bellContainer.appendChild(badge);
        
        // Add click event to show notifications
        bellContainer.addEventListener('click', showNotificationModal);
    }
}

// Set up event listeners for notification interactions
function setupNotificationEventListeners() {
    // More direct approach to find and attach event to close button
    setTimeout(() => {
        const closeButton = document.querySelector('#notificationModal .close-button');
        if (closeButton) {
            console.log('Found notification close button, attaching event');
            
            // Add direct click handler with named function for debugging
            closeButton.onclick = function notificationCloseHandler(e) {
                console.log('Notification close button clicked');
                e.preventDefault();
                e.stopPropagation();
                hideNotificationModal();
                return false; // Extra measure to prevent event propagation
            };
        } else {
            console.log('Could not find notification close button');
        }
    }, 100); // Small delay to ensure DOM is ready
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('notificationModal');
        if (event.target === modal) {
            hideNotificationModal();
        }
    });
}


// Show notification modal
function showNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.style.display = 'block';
        loadUserNotifications();
    }
}

// Hide notification modal
function hideNotificationModal() {
    console.log('Attempting to hide notification modal');
    const modal = document.getElementById('notificationModal');
    if (modal) {
        console.log('Modal found, hiding it');
        modal.style.display = 'none';
    } else {
        console.log('Modal not found');
    }
}

// Start listening for notifications for the current user
function startNotificationListener() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            console.error('User data not found in localStorage');
            return;
        }

        const userEmail = userData.email;
        const emailKey = encodeURIComponent(userEmail.replace(/\./g, ','));
        const notificationsRef = ref(database, `notifications/${emailKey}`);

        // Set up real-time listener for notifications
        onValue(notificationsRef, (snapshot) => {
            updateNotificationBadge(snapshot);
        });

    } catch (error) {
        console.error('Error setting up notification listener:', error);
    }
}

// Update the notification badge count
function updateNotificationBadge(snapshot) {
    const badge = document.getElementById('notificationBadge');
    
    if (!badge) return;
    
    if (snapshot.exists()) {
        const notifications = snapshot.val();
        const count = Object.keys(notifications).length;
        
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.toggle('active', count > 0);
    } else {
        badge.textContent = '0';
        badge.classList.remove('active');
    }
}

// Load and display user notifications
async function loadUserNotifications() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            console.error('User data not found in localStorage');
            return;
        }

        const userEmail = userData.email;
        const emailKey = encodeURIComponent(userEmail.replace(/\./g, ','));
        const notificationsRef = ref(database, `notifications/${emailKey}`);

        const snapshot = await get(notificationsRef);
        const notificationsList = document.getElementById('notificationsList');
        
        if (notificationsList) {
            // Clear previous notifications
            notificationsList.innerHTML = '';
            
            if (snapshot.exists()) {
                const notifications = snapshot.val();
                
                // Sort notifications by timestamp (newest first) if timestamp exists
                const notificationItems = Object.entries(notifications)
                    .map(([id, notification]) => ({ id, ...notification }))
                    .sort((a, b) => {
                        return (b.timestamp || 0) - (a.timestamp || 0);
                    });
                
                if (notificationItems.length === 0) {
                    notificationsList.innerHTML = '<div class="no-notifications-message">No notifications to display</div>';
                    return;
                }
                
                // Add each notification to the list
                notificationItems.forEach(notification => {
                    const notificationItem = createNotificationElement(notification);
                    notificationsList.appendChild(notificationItem);
                });
            } else {
                notificationsList.innerHTML = '<div class="no-notifications-message">No notifications to display</div>';
            }
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Create a notification element
function createNotificationElement(notification) {
    const { id, message, type, color } = notification;
    
    const item = document.createElement('div');
    item.className = `notification-item notification-${type}`;
    item.style.backgroundColor = color || '#ffffff33';
    
    // Updated to use SVG instead of PNG
    const iconPath = `./images/icons/${type}.svg`;
    
    item.innerHTML = `
        <img src="${iconPath}" alt="${type}" class="notification-icon">
        <div class="notification-content">${message}</div>
        <div class="notification-close" data-id="${id}">×</div>
    `;
    
    // Add event listener for closing/removing notification
    item.querySelector('.notification-close').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNotification(id);
        item.remove();
        
        // Check if we have any notifications left
        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList && notificationsList.children.length === 0) {
            notificationsList.innerHTML = '<div class="no-notifications-message">No notifications to display</div>';
        }
    });
    
    return item;
}


// Delete a notification from Firebase
async function deleteNotification(notificationId) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.email) {
            console.error('User data not found in localStorage');
            return;
        }

        const userEmail = userData.email;
        const emailKey = encodeURIComponent(userEmail.replace(/\./g, ','));
        const notificationRef = ref(database, `notifications/${emailKey}/${notificationId}`);
        
        await remove(notificationRef);
        console.log(`Notification ${notificationId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
}

// Export functions that might be needed elsewhere
export { 
    initializeNotificationSystem,
    showNotificationModal,
    hideNotificationModal
};