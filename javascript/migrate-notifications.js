// migrate-notifications.js
// A script to migrate notifications from URL-encoded paths to our safer encoding method

import { database } from '../database/firebase-config.js';
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Function to safely encode email for Firebase path
function encodeEmailForFirebase(email) {
    // Firebase doesn't allow '.', '#', '$', '[', or ']' in paths
    return email.replace(/\./g, ',').replace(/#/g, '_hash_')
                .replace(/\$/g, '_dollar_').replace(/\[/g, '_lbracket_')
                .replace(/\]/g, '_rbracket_');
}

// Function to decode a URL encoded email to get the original email
function decodeEmailFromURL(urlEncodedEmail) {
    try {
        return decodeURIComponent(urlEncodedEmail);
    } catch (error) {
        console.error('Error decoding URL encoded email:', error);
        return urlEncodedEmail;
    }
}

// Function to migrate notifications for a single email
async function migrateNotificationsForEmail(urlEncodedEmail) {
    try {
        // Get the original email
        const email = decodeEmailFromURL(urlEncodedEmail);
        console.log(`Migrating notifications for ${email} (${urlEncodedEmail})`);
        
        // Get notifications from the URL encoded path
        const oldNotificationsRef = ref(database, `notifications/${urlEncodedEmail}`);
        const snapshot = await get(oldNotificationsRef);
        
        if (!snapshot.exists()) {
            console.log(`No notifications found for ${email}`);
            return;
        }
        
        const notifications = snapshot.val();
        console.log(`Found ${Object.keys(notifications).length} notifications to migrate`);
        
        // Get the safe encoded email path
        const safeEncodedEmail = encodeEmailForFirebase(email);
        
        // Save each notification to the new path
        for (const [key, notification] of Object.entries(notifications)) {
            try {
                await set(ref(database, `notifications/${safeEncodedEmail}/${key}`), notification);
                console.log(`Migrated notification ${key}`);
            } catch (error) {
                console.error(`Error migrating notification ${key}:`, error);
            }
        }
        
        // Optionally remove the old notifications (uncomment to enable)
        // await remove(oldNotificationsRef);
        // console.log(`Removed old notifications for ${email}`);
        
        return Object.keys(notifications).length;
    } catch (error) {
        console.error(`Error migrating notifications for ${urlEncodedEmail}:`, error);
        return 0;
    }
}

// Main migration function
async function migrateAllNotifications() {
    try {
        console.log('Starting notification migration...');
        
        // Get all notifications
        const notificationsRef = ref(database, 'notifications');
        const snapshot = await get(notificationsRef);
        
        if (!snapshot.exists()) {
            console.log('No notifications found to migrate');
            return;
        }
        
        const encodedEmails = Object.keys(snapshot.val());
        console.log(`Found ${encodedEmails.length} email paths to check`);
        
        let totalMigrated = 0;
        
        // Check each email path to see if it's URL encoded
        for (const encodedEmail of encodedEmails) {
            // If it contains '%', it's likely URL encoded
            if (encodedEmail.includes('%')) {
                const count = await migrateNotificationsForEmail(encodedEmail);
                totalMigrated += count;
            } else {
                console.log(`Email path ${encodedEmail} appears to be already using safe encoding, skipping`);
            }
        }
        
        console.log(`Migration complete. Migrated ${totalMigrated} notifications.`);
        return totalMigrated;
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

// Run the migration when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if there's user data (must be logged in)
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData || !userData.email) {
            console.error('Not logged in, cannot run migration');
            return;
        }
        
        // Only allow system admins to run migration
        if (userData.role !== 'systemAdmin') {
            console.error('Only system admins can run migration');
            return;
        }
        
        console.log('User is a system admin, running migration...');
        await migrateAllNotifications();
        
        // Show success message
        alert('Notification migration completed successfully. Refresh the page to see the changes.');
    } catch (error) {
        console.error('Error running migration:', error);
        alert('Error running notification migration: ' + error.message);
    }
});

// Create a button to manually trigger migration
export function createMigrationButton() {
    const button = document.createElement('button');
    button.innerText = 'Migrate Notifications';
    button.className = 'buttonHome lightcyanButton';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    
    button.addEventListener('click', async () => {
        button.disabled = true;
        button.innerText = 'Migration Running...';
        
        try {
            await migrateAllNotifications();
            button.innerText = 'Migration Complete!';
            setTimeout(() => {
                button.innerText = 'Migrate Notifications';
                button.disabled = false;
            }, 3000);
        } catch (error) {
            console.error('Error running migration:', error);
            button.innerText = 'Migration Failed';
            setTimeout(() => {
                button.innerText = 'Retry Migration';
                button.disabled = false;
            }, 3000);
        }
    });
    
    document.body.appendChild(button);
    return button;
}

// Export migration functions
export { migrateAllNotifications, encodeEmailForFirebase };