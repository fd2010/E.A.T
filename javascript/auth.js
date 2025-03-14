// auth.js
// Helper functions for role-based authorisation

/**
 * Check if the current user has permission to add devices
 * Only lineManager and Admin roles can add devices
 * @returns {boolean} True if user has permission, false otherwise
 */
export function canAddDevices() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.role) {
            console.error('User data or role not found');
            return false;
        }
        
        const allowedRoles = ['lineManager', 'Admin'];
        return allowedRoles.includes(userData.role);
    } catch (error) {
        console.error('Error checking add device permission:', error);
        return false;
    }
}

/**
 * Check if the current user has permission to control devices
 * Only lineManager, facilityManager, and Admin roles can control devices
 * @returns {boolean} True if user has permission, false otherwise
 */
export function canControlDevices() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.role) {
            console.error('User data or role not found');
            return false;
        }
        
        const allowedRoles = ['lineManager', 'facilityManager', 'Admin'];
        return allowedRoles.includes(userData.role);
    } catch (error) {
        console.error('Error checking device control permission:', error);
        return false;
    }
}

/**
 * Display an authorisation error message to the user
 * @param {string} action - The action that was attempted
 */
export function showAuthorisationError(action) {
    alert(`You do not have the correct access level to ${action}.`);
}