document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, setting up form handlers');
    
    const form = document.getElementById('loginForm');
    
    if (form) {
      console.log('Form found, attaching submit handler');
      
      // First, add a submission prevention handler to guarantee it runs
      form.addEventListener('submit', function(event) {
        console.log('Form submit event triggered');
        event.preventDefault();
        console.log('Default form submission prevented');
        
        // You don't need to do anything else here, your other event handlers will still run
      }, true); // The 'true' ensures this runs before other handlers
    } else {
      console.error('Form with ID "loginForm" not found!');
      // Check if the form might have a different ID
      const forms = document.querySelectorAll('form');
      console.log('Forms found on page:', forms.length);
      forms.forEach((f, i) => console.log(`Form ${i} id:`, f.id));
    }
});

import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Debug helper
console.log('signupUser-firebase.js loaded');

function getSelectedRole() {
    const roleInputs = document.querySelectorAll('input[name="role"]');
    for (const roleInput of roleInputs) {
        if (roleInput.checked) {
            return roleInput.value;
        }
    }
    return null;
}

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

// Ensure DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Setting up user signup form handler');
    
    // Create status div if it doesn't exist
    let statusDiv = document.getElementById('status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status';
        statusDiv.style.margin = '10px 0';
        statusDiv.style.padding = '10px';
        statusDiv.style.borderRadius = '4px';
        document.querySelector('.container').appendChild(statusDiv);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Form with ID "loginForm" not found!');
        statusDiv.textContent = 'Error: Signup form not found';
        statusDiv.style.backgroundColor = '#ffebee';
        statusDiv.style.color = '#c62828';
        return;
    }

    // Add form submit handler with explicit preventDefault
    loginForm.addEventListener('submit', async function(event) {
        // Critical: prevent the default form submission
        event.preventDefault();
        console.log('User signup form submitted, default prevented');
        
        let createdUser = null;
        
        try {
            const email = document.getElementById('email')?.value;
            const officeID = document.getElementById('officeID')?.value;
            const prefName = document.getElementById('prefName')?.value;
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            const selectedRole = getSelectedRole();

            if (!email || !officeID || !prefName || !password || !confirmPassword) {
                throw new Error('Please fill in all required fields');
            }

            // Initial validation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match!');
            }

            if (!selectedRole) {
                throw new Error('Please select a role!');
            }

            statusDiv.textContent = 'Checking office ID...';
            statusDiv.style.backgroundColor = '#e3f2fd';
            statusDiv.style.color = '#1976d2';

            // First validate office ID
            await validateOfficeID(officeID);

            statusDiv.textContent = 'Creating account...';

            // Create Firebase Auth account
            console.log('Creating auth account with email:', email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            createdUser = userCredential.user;  // Store reference to delete if needed
            console.log('Auth account created with UID:', createdUser.uid);

            const userData = {
                email: email,
                officeID: officeID,
                prefName: prefName,
                role: selectedRole,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            // Save user data to database
            console.log('Saving user data to database');
            await saveUserData(createdUser.uid, userData);
            
            statusDiv.textContent = 'Account created successfully! Redirecting to login...';
            statusDiv.style.backgroundColor = '#e8f5e9';
            statusDiv.style.color = '#2e7d32';

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
            
            statusDiv.textContent = errorMessage;
            statusDiv.style.backgroundColor = '#ffebee';
            statusDiv.style.color = '#c62828';
        }
    });
});