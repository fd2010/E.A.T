// admin.js
// Admin tools for system administrators to manage the system

import { database } from '../database/firebase-config.js';
import { ref, get, remove, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { migrateAllNotifications, encodeEmailForFirebase } from './migrate-notifications.js';

// Function to safely encode email for Firebase path
function encodeEmail(email) {
    return encodeEmailForFirebase(email);
}

// Create admin tools panel for system administrators
export function createAdminTools() {
    try {
        // Check if user is a system admin
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData || !userData.role !== 'systemAdmin') {
            console.log('User is not a system admin, not creating admin tools');
            return;
        }
        
        console.log('Creating admin tools for system admin');
        
        // Create admin tools panel
        const panel = document.createElement('div');
        panel.className = 'admin-tools-panel';
        panel.style.position = 'fixed';
        panel.style.top = '50px';
        panel.style.right = '10px';
        panel.style.backgroundColor = '#f8f9fa';
        panel.style.border = '1px solid #dee2e6';
        panel.style.borderRadius = '4px';
        panel.style.padding = '10px';
        panel.style.zIndex = '1000';
        panel.style.maxWidth = '300px';
        panel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        panel.style.display = 'none'; // Hidden by default
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.innerText = 'Admin Tools';
        toggleButton.className = 'buttonHome lightcyanButton';
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '10px';
        toggleButton.style.right = '10px';
        toggleButton.style.zIndex = '1001';
        
        toggleButton.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        // Add tools to panel
        panel.innerHTML = `
            <h3 style="margin-top: 0;">Admin Tools</h3>
            <div class="admin-tool">
                <button id="migrateNotificationsBtn" class="buttonHome lightcyanButton" style="width: 100%; margin-bottom: 10px;">
                    Migrate Notifications
                </button>
                <p class="tool-description">
                    Fix notification paths in the database
                </p>
            </div>
            <div class="admin-tool">
                <button id="clearNotificationsBtn" class="buttonHome lightcyanButton" style="width: 100%; margin-bottom: 10px;">
                    Clear My Notifications
                </button>
                <p class="tool-description">
                    Remove all notifications for your account
                </p>
            </div>
            <div class="admin-tool">
                <button id="fixDatabaseBtn" class="buttonHome lightcyanButton" style="width: 100%; margin-bottom: 10px;">
                    Fix Database Issues
                </button>
                <p class="tool-description">
                    Attempt to fix common database issues
                </p>
            </div>
            <div id="adminToolStatus" style="color: #28a745; margin-top: 10px;"></div>
        `;
        
        // Add event listeners to buttons
        document.body.appendChild(panel);
        document.body.appendChild(toggleButton);
        
        // Setup event listeners
        document.getElementById('migrateNotificationsBtn').addEventListener('click', async () => {
            try {
                document.getElementById('adminToolStatus').textContent = 'Migration running...';
                await migrateAllNotifications();
                document.getElementById('adminToolStatus').textContent = 'Migration completed successfully!';
            } catch (error) {
                console.error('Error migrating notifications:', error);
                document.getElementById('adminToolStatus').textContent = 'Error: ' + error.message;
            }
        });
        
        document.getElementById('clearNotificationsBtn').addEventListener('click', async () => {
            try {
                document.getElementById('adminToolStatus').textContent = 'Clearing notifications...';
                await clearMyNotifications(userData.email);
                document.getElementById('adminToolStatus').textContent = 'Notifications cleared successfully!';
            } catch (error) {
                console.error('Error clearing notifications:', error);
                document.getElementById('adminToolStatus').textContent = 'Error: ' + error.message;
            }
        });
        
        document.getElementById('fixDatabaseBtn').addEventListener('click', async () => {
            try {
                document.getElementById('adminToolStatus').textContent = 'Fixing database issues...';
                await fixDatabaseIssues(userData.officeID);
                document.getElementById('adminToolStatus').textContent = 'Database issues fixed!';
            } catch (error) {
                console.error('Error fixing database issues:', error);
                document.getElementById('adminToolStatus').textContent = 'Error: ' + error.message;
            }
        });
        
        return panel;
    } catch (error) {
        console.error('Error creating admin tools:', error);
    }
}

// Function to clear all notifications for the current user
async function clearMyNotifications(email) {
    try {
        // Try both encoding methods
        const encodedEmail = encodeEmail(email);
        const urlEncodedEmail = encodeURIComponent(email);
        
        // Clear notifications with the proper encoding
        try {
            await remove(ref(database, `notifications/${encodedEmail}`));
            console.log('Cleared notifications with proper encoding');
        } catch (error) {
            console.error('Error clearing notifications with proper encoding:', error);
        }
        
        // Clear notifications with URL encoding
        try {
            await remove(ref(database, `notifications/${urlEncodedEmail}`));
            console.log('Cleared notifications with URL encoding');
        } catch (error) {
            console.error('Error clearing notifications with URL encoding:', error);
        }
        
        return true;
    } catch (error) {
        console.error('Error clearing notifications:', error);
        throw error;
    }
}

// Function to fix common database issues
async function fixDatabaseIssues(officeID) {
    try {
        console.log('Fixing database issues for office:', officeID);
        
        // Fix temperature field
        try {
            const officeRef = ref(database, `offices/${officeID}`);
            const snapshot = await get(officeRef);
            
            if (snapshot.exists()) {
                const officeData = snapshot.val();
                
                // Ensure temperature field exists and is a number
                if (!officeData.hasOwnProperty('temperature') || 
                    typeof officeData.temperature !== 'number') {
                    
                    await set(ref(database, `offices/${officeID}/temperature`), 0);
                    console.log('Fixed temperature field');
                }
            }
        } catch (error) {
            console.error('Error fixing temperature field:', error);
        }
        
        // Run notification migration
        await migrateAllNotifications();
        
        return true;
    } catch (error) {
        console.error('Error fixing database issues:', error);
        throw error;
    }
}

// Initialize admin tools on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        setTimeout(() => {
            createAdminTools();
        }, 2000); // Delay to ensure dashboard is loaded
    } catch (error) {
        console.error('Error initializing admin tools:', error);
    }
});