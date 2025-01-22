import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Function to get selected role
function getSelectedRole() {
    const roleInputs = document.querySelectorAll('input[name="role"]');
    for (const roleInput of roleInputs) {
        if (roleInput.checked) {
            return roleInput.value;
        }
    }
    return null;
}

// Function to save user data to database
async function saveUserData(userId, userData) {
    try {
        await set(ref(database, 'users/' + userId), userData);
        console.log('User data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}

// Get the status div for showing messages
const statusDiv = document.createElement('div');
statusDiv.style.margin = '10px 0';
statusDiv.style.padding = '10px';
statusDiv.style.borderRadius = '4px';
document.querySelector('.container').appendChild(statusDiv);

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
        // Get form values
        const email = document.getElementById('email').value;
        const officeID = document.getElementById('officeID').value;
        const prefName = document.getElementById('prefName').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const selectedRole = getSelectedRole();

        // Validate passwords match
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match!');
        }

        // Validate role selection
        if (!selectedRole) {
            throw new Error('Please select a role!');
        }

        // Show loading state
        statusDiv.textContent = 'Creating account...';
        statusDiv.style.backgroundColor = '#e3f2fd';
        statusDiv.style.color = '#1976d2';

        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare user data
        const userData = {
            email: email,
            officeID: officeID,
            prefName: prefName,
            role: selectedRole,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        // Save user data to database
        await saveUserData(user.uid, userData);
        
        // Show success message
        statusDiv.textContent = 'Account created successfully! Redirecting to login...';
        statusDiv.style.backgroundColor = '#e8f5e9';
        statusDiv.style.color = '#2e7d32';

        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error during signup:', error);
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
        
        // Show error message
        statusDiv.textContent = errorMessage;
        statusDiv.style.backgroundColor = '#ffebee';
        statusDiv.style.color = '#c62828';
    }
});