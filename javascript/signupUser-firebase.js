// signupUser-firebase.js
import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { ref, set, get } from "firebase/database";

document.addEventListener('DOMContentLoaded', () => {
    // Find or create status div
    let statusDiv = document.querySelector('.statusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'statusMessage';
        document.querySelector('.container').appendChild(statusDiv);
    }

    // Get the form
    const signupForm = document.getElementById('loginForm');

    // Helper function to get selected role
    function getSelectedRole() {
        const roleInputs = document.querySelectorAll('input[name="role"]');
        for (const input of roleInputs) {
            if (input.checked) {
                return input.value;
            }
        }
        return null;
    }

    // Helper function to validate office ID
    async function validateOfficeID(officeID) {
        try {
            const officeSnapshot = await get(ref(database, 'offices'));
            
            if (!officeSnapshot.exists()) {
                throw new Error('No offices found in the database.');
            }

            const offices = Object.values(officeSnapshot.val());
            return offices.some(office => office.officeID === officeID);
        } catch (error) {
            console.error('Error validating office ID:', error);
            throw new Error('Failed to validate office ID. Please try again.');
        }
    }

    // Handle form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        let createdUser = null;

        try {
            // Update status
            statusDiv.textContent = 'Processing signup...';
            statusDiv.style.backgroundColor = '#e3f2fd';
            statusDiv.style.color = '#1976d2';

            // Get form values
            const email = document.getElementById('email').value.trim();
            const officeID = document.getElementById('officeID').value.trim();
            const prefName = document.getElementById('prefName').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const selectedRole = getSelectedRole();

            // Validation
            if (!email || !officeID || !prefName || !password || !confirmPassword) {
                throw new Error('Please fill in all required fields.');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match.');
            }

            if (!selectedRole) {
                throw new Error('Please select a role.');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address.');
            }

            // Password strength validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long.');
            }

            // Validate office ID
            statusDiv.textContent = 'Validating office ID...';
            const isValidOffice = await validateOfficeID(officeID);
            if (!isValidOffice) {
                throw new Error('Invalid office ID. Please check and try again.');
            }

            // Check if email already exists
            statusDiv.textContent = 'Checking email availability...';
            const usersSnapshot = await get(ref(database, 'users'));
            if (usersSnapshot.exists()) {
                const emailExists = Object.values(usersSnapshot.val())
                    .some(user => user.email === email);
                if (emailExists) {
                    throw new Error('This email is already registered.');
                }
            }

            // Create authentication account
            statusDiv.textContent = 'Creating your account...';
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            createdUser = userCredential.user;

            // Prepare user data
            const userData = {
                email,
                officeID,
                prefName,
                role: selectedRole,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            // Save to database
            await set(ref(database, 'users/' + createdUser.uid), userData);

            // Success message and redirect
            statusDiv.textContent = 'Account created successfully! Redirecting to login...';
            statusDiv.style.backgroundColor = '#e8f5e9';
            statusDiv.style.color = '#2e7d32';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Signup error:', error);

            // Clean up if auth was created but database failed
            if (createdUser) {
                try {
                    await deleteUser(createdUser);
                } catch (deleteError) {
                    console.error('Error cleaning up auth user:', deleteError);
                }
            }

            // Handle specific error messages
            let errorMessage = '';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. It must be at least 6 characters.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = error.message || 'An unexpected error occurred. Please try again.';
            }

            // Display error
            statusDiv.textContent = errorMessage;
            statusDiv.style.backgroundColor = '#ffebee';
            statusDiv.style.color = '#c62828';
        }
    });
});