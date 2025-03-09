// manage-notifications.js
import { auth, database } from '../database/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, push, get, remove, query, orderByChild } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Function to toggle loading state
function toggleLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    const notificationsContent = document.getElementById('notificationsContent');
    
    if (loadingState) loadingState.style.display = show ? 'flex' : 'none';
    if (notificationsContent) notificationsContent.style.display = show ? 'none' : 'block';
}

// Function to handle errors
function handleError(error) {
    console.error('Error:', error);
    const errorDisplay = document.getElementById('errorDisplay');
    
    toggleLoadingState(false);
    
    if (errorDisplay) {
        errorDisplay.style.display = 'flex';
        errorDisplay.innerHTML = `
            <h1>Error</h1>
            <p>${error.message || 'An unknown error occurred'}</p>
            <button onclick="window.location.href='dashboard.html'" class="buttonHome lightcyanButton">
                Return to Dashboard
            </button>
        `;
    }
}

// Function to show status message
function showStatusMessage(message, isSuccess = true) {
    const statusDiv = document.getElementById('notificationStatus');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = 'notification-status ' + (isSuccess ? 'success' : 'error');
    statusDiv.style.display = 'block';
    
    // Hide the message after 5 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Function to send a notification
async function sendNotification() {
    const userEmail = document.getElementById('userEmail').value.trim();
    const notificationType = document.querySelector('input[name="notificationType"]:checked').value;
    const notificationColor = document.getElementById('notificationColor').value;
    const notificationMessage = document.getElementById('notificationMessage').value.trim();
    
    if (!userEmail || !notificationMessage) {
        showStatusMessage('Please fill in all required fields', false);
        return;
    }
    
    try {
        // Convert email to a valid Firebase key by replacing dots with commas
        const emailKey = encodeURIComponent(userEmail.replace(/\./g, ','));
        
        // Create notification object
        const notification = {
            type: notificationType,
            color: notificationColor,
            message: notificationMessage,
            timestamp: Date.now(),
            createdBy: JSON.parse(localStorage.getItem('userData'))?.email || 'System Administrator'
        };
        
        // Push to Firebase with a unique ID
        const notificationsRef = ref(database, `notifications/${emailKey}`);
        const newNotificationRef = push(notificationsRef);
        await set(newNotificationRef, notification);
        
        showStatusMessage(`Notification sent to ${userEmail} successfully`);
        
        // Clear form fields
        document.getElementById('notificationMessage').value = '';
        
        // Update the recent notifications if the searched email matches
        const searchedEmail = document.getElementById('searchUserEmail').value.trim();
        if (searchedEmail === userEmail) {
            searchUserNotifications();
        }
        
    } catch (error) {
        console.error('Error sending notification:', error);
        showStatusMessage('Failed to send notification: ' + (error.message || 'Unknown error'), false);
    }
}

// Function to search for a user's notifications
async function searchUserNotifications() {
    const userEmail = document.getElementById('searchUserEmail').value.trim();
    
    if (!userEmail) {
        showStatusMessage('Please enter a user email to search', false);
        return;
    }
    
    try {
        // Convert email to a valid Firebase key
        const emailKey = encodeURIComponent(userEmail.replace(/\./g, ','));
        
        // Get notifications from Firebase
        const notificationsRef = ref(database, `notifications/${emailKey}`);
        const snapshot = await get(notificationsRef);
        
        const notificationsList = document.getElementById('recentNotificationsList');
        notificationsList.innerHTML = '';
        
        if (snapshot.exists()) {
            const notifications = snapshot.val();
            
            // Sort notifications by timestamp (newest first)
            const notificationItems = Object.entries(notifications)
                .map(([id, notification]) => ({ id, ...notification }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            if (notificationItems.length === 0) {
                notificationsList.innerHTML = `<div class="no-notifications-message">No notifications found for ${userEmail}</div>`;
                return;
            }
            
            // Add each notification to the list
            notificationItems.forEach(notification => {
                const notificationItem = createNotificationElement(notification, emailKey, userEmail);
                notificationsList.appendChild(notificationItem);
            });
        } else {
            notificationsList.innerHTML = `<div class="no-notifications-message">No notifications found for ${userEmail}</div>`;
        }
    } catch (error) {
        console.error('Error searching notifications:', error);
        showStatusMessage('Failed to search notifications: ' + (error.message || 'Unknown error'), false);
    }
}

// Function to create a notification element for the list
function createNotificationElement(notification, emailKey, userEmail) {
    const { id, message, type, color, timestamp, createdBy } = notification;
    
    const item = document.createElement('div');
    item.className = 'recent-notification-item';
    item.style.backgroundColor = color || '#4285F4';
    
    // Updated to use SVG instead of PNG
    const iconPath = `./images/icons/${type}.svg`;
    const date = new Date(timestamp || Date.now());
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    item.innerHTML = `
        <img src="${iconPath}" alt="${type}" class="notification-icon">
        <div class="notification-info">
            <div class="notification-message">${message}</div>
            <div class="notification-details">
                <span class="notification-user">To: ${userEmail}</span>
                <span class="notification-timestamp">${formattedDate}</span>
                <span class="notification-type-badge notification-type-${type}">${type}</span>
            </div>
        </div>
        <div class="notification-delete" data-id="${id}" data-email="${emailKey}">×</div>
    `;
    
    // Add event listener for deleting notification
    item.querySelector('.notification-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const notificationId = e.target.dataset.id;
            const emailKey = e.target.dataset.email;
            
            await remove(ref(database, `notifications/${emailKey}/${notificationId}`));
            
            item.remove();
            showStatusMessage(`Notification removed successfully`);
            
            // Check if we have any notifications left
            const notificationsList = document.getElementById('recentNotificationsList');
            if (notificationsList && notificationsList.children.length === 0) {
                notificationsList.innerHTML = `<div class="no-notifications-message">No notifications found for ${userEmail}</div>`;
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            showStatusMessage('Failed to delete notification: ' + (error.message || 'Unknown error'), false);
        }
    });
    
    return item;
}

// Function to initialize notification color preview
function initializeColorPreview() {
    const colorSelect = document.getElementById('notificationColor');
    if (colorSelect) {
        // Set initial background color
        colorSelect.style.backgroundColor = colorSelect.value;
        
        // Update background color when selection changes
        colorSelect.addEventListener('change', function() {
            this.style.backgroundColor = this.value;
        });
    }
}

// Function to setup notification type change behavior
function setupNotificationTypeChange() {
    const typeRadios = document.querySelectorAll('input[name="notificationType"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Update color based on notification type
            const colorSelect = document.getElementById('notificationColor');
            switch(this.value) {
                case 'reminder':
                    colorSelect.value = '#4285F4'; // Blue
                    break;
                case 'warning':
                    colorSelect.value = '#FBBC05'; // Yellow
                    break;
                case 'fault':
                    colorSelect.value = '#EA4335'; // Red
                    break;
            }
            // Update color preview
            colorSelect.style.backgroundColor = colorSelect.value;
            
            // Update the preview icon - changed to SVG
            const previewIcon = document.getElementById('previewIcon');
            if (previewIcon) {
                previewIcon.src = `./images/icons/${this.value}.svg`;
                previewIcon.alt = this.value;
            }
            
            // Update the preview background color
            const previewItem = document.getElementById('previewItem');
            if (previewItem) {
                previewItem.style.backgroundColor = colorSelect.value;
            }
        });
    });
}

// Function to setup live notification preview
function setupLivePreview() {
    const messageInput = document.getElementById('notificationMessage');
    const colorSelect = document.getElementById('notificationColor');
    const previewContent = document.getElementById('previewContent');
    const previewItem = document.getElementById('previewItem');
    
    // Update preview on message change
    if (messageInput && previewContent) {
        messageInput.addEventListener('input', function() {
            previewContent.textContent = this.value || 'Your notification will appear like this';
        });
    }
    
    // Update preview on color change
    if (colorSelect && previewItem) {
        colorSelect.addEventListener('change', function() {
            previewItem.style.backgroundColor = this.value;
        });
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Notification manager initializing...');
    
    try {
        // Show loading state initially
        toggleLoadingState(true);
        
        // Initialize UI components that don't require Firebase
        initializeColorPreview();
        setupNotificationTypeChange();
        setupLivePreview();
        
        // Add debug system
        console.log('Setting up debug failsafe...');
        // If authentication takes too long, just show the interface
        setTimeout(() => {
            const loadingState = document.getElementById('loadingState');
            if (loadingState && loadingState.style.display !== 'none') {
                console.log('Debug timeout activated - showing notification manager interface');
                toggleLoadingState(false);
                showStatusMessage('Firebase authentication timeout. Some features may be limited.', false);
            }
        }, 3000); // 3 second failsafe
        
        // Set up event listeners
        document.getElementById('sendNotificationBtn').addEventListener('click', sendNotification);
        document.getElementById('searchBtn').addEventListener('click', searchUserNotifications);
        
        // Also trigger search on Enter key for email search
        document.getElementById('searchUserEmail').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchUserNotifications();
            }
        });
        
        // Check if user is authenticated
        console.log('Checking authentication status...');
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log('No authenticated user found, but we will allow access for testing');
                toggleLoadingState(false);
                showStatusMessage('You are not logged in. This is a testing environment.', false);
                return;
            }
            
            try {
                console.log('User authenticated, setting up notification manager');
                // Hide loading state and show content
                toggleLoadingState(false);
                
                // Initialize default notifications view if admin email is available
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (userData && userData.email) {
                    // Pre-fill search field with admin's email
                    document.getElementById('searchUserEmail').value = userData.email;
                    // Pre-fill the form email field with the same email
                    document.getElementById('userEmail').value = userData.email;
                    // Perform initial search
                    searchUserNotifications();
                }
                
            } catch (error) {
                console.error('Error initializing notification manager:', error);
                handleError(error);
            }
        });
    } catch (error) {
        console.error('Error in initialization:', error);
        handleError(error);
        // Still show the interface for testing
        toggleLoadingState(false);
    }
});

// Export key functions
export {
    sendNotification,
    searchUserNotifications,
    showStatusMessage
};