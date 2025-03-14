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
        
        const allowedRoles = ['facilityManager', 'systemAdmin'];
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
        
        const allowedRoles = ['lineManager', 'facilityManager', 'systemAdmin'];
        return allowedRoles.includes(userData.role);
    } catch (error) {
        console.error('Error checking device control permission:', error);
        return false;
    }
}

/**
 * Check if the current user has permission to delete devices
 * Only facilityManager and Admin roles can delete devices
 * @returns {boolean} True if user has permission, false otherwise
 */
export function canDeleteDevices() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.role) {
            console.error('User data or role not found');
            return false;
        }
        
        const allowedRoles = ['facilityManager', 'systemAdmin'];
        return allowedRoles.includes(userData.role);
    } catch (error) {
        console.error('Error checking delete device permission:', error);
        return false;
    }
}

/**
 * Check if the current user has permission to control thermostat
 * All roles except employee can control thermostat
 * @returns {boolean} True if user has permission, false otherwise
 */
/**
 * Check if the current user has permission to control thermostat
 * All roles except employee can control thermostat
 * @returns {boolean} True if user has permission, false otherwise
 */
export function canControlThermostat() {
    try {
        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');
        console.log("Raw userData from localStorage:", userDataString);
        
        if (!userDataString) {
            console.error('User data not found in localStorage');
            return false;
        }
        
        // Parse user data
        const userData = JSON.parse(userDataString);
        console.log("Parsed userData:", userData);
        
        if (!userData || !userData.role) {
            console.error('User data or role not found after parsing');
            return false;
        }
        
        // Normalize the role (trim whitespace and convert to lowercase)
        const normalizedRole = userData.role.trim().toLowerCase();
        console.log("Normalized role:", normalizedRole);
        
        // Employee is not allowed, all other roles are allowed
        const hasPermission = normalizedRole !== 'employee';
        console.log(`User has thermostat permission: ${hasPermission}`);
        return hasPermission;
    } catch (error) {
        console.error('Error checking thermostat control permission:', error);
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