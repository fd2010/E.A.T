// admin-mode.js
import { auth, database } from '../database/firebase-config.js';
import { ref, get, update, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
                
                <!-- Role Selection Modal -->
                <div id="roleSelectionModal" class="role-selection-modal" style="display: none;">
                    <div class="role-selection-content">
                        <h3>Change User Role</h3>
                        <p id="roleChangeUserName">User Name</p>
                        
                        <div class="role-options">
                            <div class="role-option" data-role="systemAdmin">
                                <div class="role-badge role-systemAdmin">System Admin</div>
                                <p>Full system access with all permissions, with extra access to admin mode</p>
                            </div>
                            
                            <div class="role-option" data-role="facilityManager">
                                <div class="role-badge role-facilityManager">Facility Manager</div>
                                <p>Can: Manipulate devices, add/delete devices, control thermostat, view device analytics</p>
                            </div>
                            
                            <div class="role-option" data-role="lineManager">
                                <div class="role-badge role-lineManager">Line Manager</div>
                                <p>Can: Manipulate devices, control thermostat, view device analytics</p>
                            </div>
                            
                            <div class="role-option" data-role="employee">
                                <div class="role-badge role-employee">Employee</div>
                                <p>Can: view analytics, view devices, view temperature</p>
                            </div>
                        </div>
                        
                        <div class="role-selection-actions">
                            <button id="cancelRoleChange" class="cancel-button">Cancel</button>
                            <button id="confirmRoleChange" class="confirm-button">Save Changes</button>
                        </div>
                    </div>
                </div>
                
                <!-- Delete User Confirmation Modal -->
                <div id="deleteUserModal" class="delete-user-modal" style="display: none;">
                    <div class="delete-user-content">
                        <h3>Delete User</h3>
                        <p>Are you sure you want to delete the following user?</p>
                        <p id="deleteUserName" class="delete-user-name">User Name</p>
                        <p class="delete-warning">This action cannot be undone. The user will lose all access to the system.</p>
                        
                        <div class="delete-user-actions">
                            <button id="cancelUserDelete" class="cancel-button">Cancel</button>
                            <button id="confirmUserDelete" class="delete-button">Delete User</button>
                        </div>
                    </div>
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
    
    // Set up role selection modal event listeners
    setupRoleSelectionEventListeners();
}

// Set up event listeners for the role selection modal
function setupRoleSelectionEventListeners() {
    // Cancel button
    const cancelButton = document.getElementById('cancelRoleChange');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            hideRoleSelectionModal();
        });
    }
    
    // Confirm button
    const confirmButton = document.getElementById('confirmRoleChange');
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            updateUserRole();
        });
    }
    
    // Role option selection
    const roleOptions = document.querySelectorAll('.role-option');
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
        });
    });
    
    // Delete user modal - Cancel button
    const cancelDeleteButton = document.getElementById('cancelUserDelete');
    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', () => {
            hideDeleteConfirmationModal();
        });
    }
    
    // Delete user modal - Confirm button
    const confirmDeleteButton = document.getElementById('confirmUserDelete');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            deleteUser();
        });
    }
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
        // Hide role selection modal if it's open
        hideRoleSelectionModal();
        // Hide delete confirmation modal if it's open
        hideDeleteConfirmationModal();
    }
}

// Show role selection modal for a specific user
function showRoleSelectionModal(userId, userName, currentRole) {
    const roleModal = document.getElementById('roleSelectionModal');
    if (!roleModal) return;
    
    // Store the user ID as a data attribute
    roleModal.dataset.userId = userId;
    
    // Update user name in the modal
    document.getElementById('roleChangeUserName').textContent = userName;
    
    // Reset selected options
    document.querySelectorAll('.role-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select current role
    const currentRoleOption = document.querySelector(`.role-option[data-role="${currentRole}"]`);
    if (currentRoleOption) {
        currentRoleOption.classList.add('selected');
    }
    
    // Show the modal
    roleModal.style.display = 'block';
}

// Hide role selection modal
function hideRoleSelectionModal() {
    const roleModal = document.getElementById('roleSelectionModal');
    if (roleModal) {
        roleModal.style.display = 'none';
        // Clear user ID
        roleModal.dataset.userId = '';
    }
}

// Show delete user confirmation modal
function showDeleteConfirmationModal(userId, userName) {
    const deleteModal = document.getElementById('deleteUserModal');
    if (!deleteModal) return;
    
    // Store the user ID as a data attribute
    deleteModal.dataset.userId = userId;
    
    // Update user name in the modal
    document.getElementById('deleteUserName').textContent = userName;
    
    // Show the modal
    deleteModal.style.display = 'block';
}

// Hide delete user confirmation modal
function hideDeleteConfirmationModal() {
    const deleteModal = document.getElementById('deleteUserModal');
    if (deleteModal) {
        deleteModal.style.display = 'none';
        // Clear user ID
        deleteModal.dataset.userId = '';
    }
}

// Delete user from the database
async function deleteUser() {
    try {
        const deleteModal = document.getElementById('deleteUserModal');
        if (!deleteModal) return;
        
        const userId = deleteModal.dataset.userId;
        if (!userId) {
            throw new Error('User ID not found');
        }
        
        // Get the user's current data before deletion (to access their email)
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        
        if (!userSnapshot.exists()) {
            throw new Error('User not found');
        }
        
        const userData = userSnapshot.val();
        
        // Delete user from the database
        await set(userRef, null);
        
        // Hide delete confirmation modal
        hideDeleteConfirmationModal();
        
        // Refresh the user list
        await loadOfficeUsers();
        
        // Show success message
        showNotification(`User ${userData.email} has been deleted`, 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user: ' + error.message, 'error');
    }
}

// Update user role in the database
async function updateUserRole() {
    try {
        const roleModal = document.getElementById('roleSelectionModal');
        if (!roleModal) return;
        
        const userId = roleModal.dataset.userId;
        if (!userId) {
            throw new Error('User ID not found');
        }
        
        const selectedOption = document.querySelector('.role-option.selected');
        if (!selectedOption) {
            throw new Error('No role selected');
        }
        
        const newRole = selectedOption.dataset.role;
        
        // Update user role in database
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, { role: newRole });
        
        // Hide role selection modal
        hideRoleSelectionModal();
        
        // Refresh the user list
        await loadOfficeUsers();
        
        // Show success message
        showNotification('User role updated successfully', 'success');
    } catch (error) {
        console.error('Error updating user role:', error);
        showNotification('Error updating user role: ' + error.message, 'error');
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('admin-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'admin-notification';
        notification.className = 'admin-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `admin-notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
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
        <div class="user-actions">
            <div class="role-badge role-${role} clickable">${formattedRole}</div>
            <div class="delete-user-btn" title="Delete User">
                <img src="./images/icons/bin icon.svg" alt="delete user">
            </div>
        </div>
    `;
    
    // Add click event to the role badge
    const roleBadge = item.querySelector('.role-badge');
    roleBadge.addEventListener('click', () => {
        showRoleSelectionModal(id, prefName || email, role);
    });
    
    // Add click event to the delete button
    const deleteBtn = item.querySelector('.delete-user-btn');
    deleteBtn.addEventListener('click', () => {
        showDeleteConfirmationModal(id, prefName || email);
    });
    
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