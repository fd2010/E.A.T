// admin-mode.js
import { auth, database } from '../database/firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

console.log('admin-mode.js loaded');

// Function to check if the current user is an admin
export function isAdmin() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.role) {
            return false;
        }
        
        return userData.role === 'systemAdmin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Function to initialize the admin mode button
export function initializeAdminMode() {
    // Only proceed if user is admin
    if (!isAdmin()) {
        return;
    }
    
    // Create Admin Mode button
    createAdminButton();
    
    // Create Admin Users modal if it doesn't exist
    createAdminModal();
    
    // Set up event listeners
    setupAdminEventListeners();
}

// Function to create the admin button
function createAdminButton() {
    // Check if button already exists
    if (document.getElementById('adminModeBtn')) {
        return;
    }
    
    // Get the greeting bubble to position our button
    const greetingBubble = document.querySelector('.greeting-bubble');
    if (!greetingBubble) {
        console.error('Could not find greeting bubble element');
        return;
    }
    
    // Create admin button
    const adminButton = document.createElement('div');
    adminButton.id = 'adminModeBtn';
    adminButton.className = 'admin-mode-button';
    adminButton.innerHTML = `
        <span>Admin Mode</span>
    `;
    
    // Insert the button after greeting bubble
    greetingBubble.parentNode.insertBefore(adminButton, greetingBubble.nextSibling);
}

// Create the admin modal
function createAdminModal() {
    // Check if modal already exists
    if (document.getElementById('adminUsersModal')) {
        return;
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="adminUsersModal" class="modal" style="display: none;">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                
                <h2 class="h2Light">Office Users</h2>
                
                <div id="usersList" class="users-list">
                    <!-- Users will be dynamically inserted here -->
                    <div class="no-users-message">Loading users...</div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Set up event listeners for admin functionality
function setupAdminEventListeners() {
    // Show modal when clicking admin button
    const adminButton = document.getElementById('adminModeBtn');
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            showAdminModal();
        });
    }
    
    // Close modal when clicking close button
    const closeButton = document.querySelector('#adminUsersModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideAdminModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('adminUsersModal');
        if (event.target === modal) {
            hideAdminModal();
        }
    });
}

// Show admin modal and load users
async function showAdminModal() {
    const modal = document.getElementById('adminUsersModal');
    if (modal) {
        modal.style.display = 'block';
        await loadOfficeUsers();
    }
}

// Hide admin modal
function hideAdminModal() {
    const modal = document.getElementById('adminUsersModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load all users with the same office ID
async function loadOfficeUsers() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.officeID) {
            throw new Error('User data or office ID not found');
        }
        
        const officeID = userData.officeID;
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            const officeUsers = [];
            
            // Filter users by office ID
            Object.entries(users).forEach(([userId, user]) => {
                if (user.officeID === officeID) {
                    officeUsers.push({ id: userId, ...user });
                }
            });
            
            if (officeUsers.length === 0) {
                usersList.innerHTML = '<div class="no-users-message">No users found for this office</div>';
                return;
            }
            
            // Sort users by role priority (admin first, then managers, then employees)
            const rolePriority = {
                'systemAdmin': 1,
                'facilityManager': 2,
                'lineManager': 3,
                'employee': 4
            };
            
            officeUsers.sort((a, b) => {
                return (rolePriority[a.role] || 5) - (rolePriority[b.role] || 5);
            });
            
            // Add each user to the list
            officeUsers.forEach(user => {
                const userItem = createUserElement(user);
                usersList.appendChild(userItem);
            });
        } else {
            usersList.innerHTML = '<div class="no-users-message">No users found</div>';
        }
    } catch (error) {
        console.error('Error loading office users:', error);
        document.getElementById('usersList').innerHTML = 
            `<div class="no-users-message">Error loading users: ${error.message}</div>`;
    }
}

// Create a user element for the list
function createUserElement(user) {
    const { id, prefName, email, role } = user;
    
    const item = document.createElement('div');
    item.className = 'user-item';
    
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1');
    
    item.innerHTML = `
        <div class="user-detail">
            <div class="user-name">${prefName || 'Unknown User'}</div>
            <div class="user-email">${email}</div>
        </div>
        <div class="role-badge role-${role}">${formattedRole}</div>
    `;
    
    return item;
}

// Self-initialization when loaded directly
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Mode: DOM Content Loaded - Checking if initialization needed');
    // Initialize after a short delay to ensure dashboard has loaded
    setTimeout(() => {
        if (isAdmin() && !document.getElementById('adminModeBtn')) {
            console.log('Admin Mode: Self-initializing');
            initializeAdminMode();
        }
    }, 1000);
});