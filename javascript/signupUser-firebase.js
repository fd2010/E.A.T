// Debug helper - print a message to confirm script is loading
console.log('signupUser-firebase.js loading...');

import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Function to update status message
function updateStatus(message, isError = true) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
    statusDiv.style.display = 'block';
}

// Function to get selected role from radio buttons
function getSelectedRole() {
    const roleInputs = document.querySelectorAll('input[name="role"]');
    for (const roleInput of roleInputs) {
        if (roleInput.checked) {
            return roleInput.value;
        }
    }
    return null;
}

// Function to validate Office ID exists in the database
async function validateOfficeID(officeID) {
    console.log('Validating office ID:', officeID);
    const officeRef = ref(database, 'offices');
    const officeSnapshot = await get(officeRef);

    if (!officeSnapshot.exists()) {
        console.error('No offices found in database');
        throw new Error('No offices found. Please check the Office ID.');
    }

    console.log('Offices found:', Object.keys(officeSnapshot.val()));
    const offices = Object.values(officeSnapshot.val());
    const officeExists = offices.some(office => office.officeID === officeID);

    if (!officeExists) {
        console.error('Office ID not found:', officeID);
        throw new Error('Invalid Office ID. Please check and try again.');
    }

    console.log('Office ID is valid');
    return true;
}

// Function to save user data to database
async function saveUserData(userId, userData) {
    try {
        console.log('Saving user data for UID:', userId);
        await set(ref(database, 'users/' + userId), userData);
        console.log('User data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}

// Function to handle signup process
async function handleSignup(email, officeID, prefName, password, role) {
    let createdUser = null;
    
    try {
        // Validate office ID
        updateStatus('Checking office ID...', false);
        await validateOfficeID(officeID);

        // Create Firebase Auth account
        updateStatus('Creating account...', false);
        console.log('Creating auth account with email:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        createdUser = userCredential.user;
        console.log('Auth account created with UID:', createdUser.uid);

        // Create user data object
        const userData = {
            email: email,
            officeID: officeID,
            prefName: prefName,
            role: role,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        // Save user data to database
        console.log('Saving user data to database');
        await saveUserData(createdUser.uid, userData);
        
        updateStatus('Account created successfully! Redirecting to login...', false);

        // Redirect to login page after short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error during signup:', error);
        
        // If we created a user but later steps failed, delete the auth user
        if (createdUser) {
            try {
                console.log('Cleaning up auth user due to error');
                await deleteUser(createdUser);
                console.log('Auth user deleted');
            } catch (deleteError) {
                console.error('Error cleaning up auth user:', deleteError);
            }
        }

        // Display appropriate error message
        let errorMessage = 'An error occurred during signup: ';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Please choose a stronger password (at least 6 characters).';
                break;
            default:
                errorMessage = error.message;
        }
        
        updateStatus(errorMessage);
    }
}

// Initialize signup functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing signup functionality');
    
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) {
        console.error('Signup form not found!');
        updateStatus('Error: Signup form not found');
        return;
    }
    
    // Add form submit event listener
    signupForm.addEventListener('submit', function(event) {
        // Prevent default form submission
        event.preventDefault();
        console.log('Signup form submitted');
        
        // Get form values
        const email = document.getElementById('email')?.value;
        const officeID = document.getElementById('officeID')?.value;
        const prefName = document.getElementById('prefName')?.value;
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const selectedRole = getSelectedRole();

        // Validate all fields are filled
        if (!email || !officeID || !prefName || !password || !confirmPassword) {
            updateStatus('Please fill in all required fields');
            return;
        }

        // Validate password matching
        if (password !== confirmPassword) {
            updateStatus('Passwords do not match!');
            return;
        }

        // Validate role is selected
        if (!selectedRole) {
            updateStatus('Please select a role!');
            return;
        }

        // Proceed with signup
        handleSignup(email, officeID, prefName, password, selectedRole);
    });
    
    // Also handle click on the submit button (as extra precaution)
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            signupForm.dispatchEvent(new Event('submit'));
        });
    }
});