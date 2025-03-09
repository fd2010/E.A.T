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
            <p>${error.message}</p>
            <button onclick="window.location.href='login.html'" class="buttonHome lightcyanButton">
                Return to Login
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
    
    // Hide the message after 5 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
        statusDiv.className = 'notification-status';
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
            createdBy: JSON.parse(localStorage.getItem('userData'))?.email || 'Unknown'
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
        showStatusMessage('Failed to send notification: ' + error.message, false);
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
        showStatusMessage('Failed to search notifications: ' + error.message, false);
    }
}

// Function to create a notification element for the list
function createNotificationElement(notification, emailKey, userEmail) {
    const { id, message, type, color, timestamp, createdBy } = notification;
    
    const item = document.createElement('div');
    item.className = 'recent-notification-item';
    item.style.backgroundColor = color || '#4285F4';
    
    const iconPath = `./images/icons/${type}.png`;
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
    item.querySelector('.notification-delete').addEventListener('click', async () => {
        try {
            const notificationId = item.querySelector('.notification-delete').dataset.id;
            const emailKey = item.querySelector('.notification-delete').dataset.email;
            
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
            showStatusMessage('Failed to delete notification: ' + error.message, false);
        }
    });
    
    return item;
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    toggleLoadingState(true);
    
    // Check if user is authenticated
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log('No authenticated user found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            // Hide loading state and show content
            toggleLoadingState(false);
            
            // Set up event listeners
            document.getElementById('sendNotificationBtn').addEventListener('click', sendNotification);
            document.getElementById('searchBtn').addEventListener('click', searchUserNotifications);
            
            // Also trigger search on Enter key for email search
            document.getElementById('searchUserEmail').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchUserNotifications();
                }
            });
            
            // Initialize color preview
            const colorSelect = document.getElementById('notificationColor');
            colorSelect.style.backgroundColor = colorSelect.value;
            
            colorSelect.addEventListener('change', function() {
                this.style.backgroundColor = this.value;
            });
            
        } catch (error) {
            console.error('Error initializing page:', error);
            handleError(error);
        }
    });
});