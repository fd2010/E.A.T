import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
    const officeRef = ref(database, 'offices');
    const officeSnapshot = await get(officeRef);

    if (!officeSnapshot.exists()) {
        throw new Error('No offices found. Please check the Office ID.');
    }

    const offices = Object.values(officeSnapshot.val());
    const officeExists = offices.some(office => office.officeID === officeID);

    if (!officeExists) {
        throw new Error('Invalid Office ID. Please check and try again.');
    }

    return true;
}

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

const statusDiv = document.createElement('div');
statusDiv.style.margin = '10px 0';
statusDiv.style.padding = '10px';
statusDiv.style.borderRadius = '4px';
document.querySelector('.container').appendChild(statusDiv);

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    let createdUser = null;
    
    try {
        const email = document.getElementById('email').value;
        const officeID = document.getElementById('officeID').value;
        const prefName = document.getElementById('prefName').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const selectedRole = getSelectedRole();

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        createdUser = userCredential.user;  // Store reference to delete if needed

        const userData = {
            email: email,
            officeID: officeID,
            prefName: prefName,
            role: selectedRole,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        // Save user data to database
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
                await deleteUser(createdUser);
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