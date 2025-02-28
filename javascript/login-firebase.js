// Debug helper
console.log('login-firebase.js loading...');

import { auth, database } from '../database/firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Function to update status message
function updateStatus(message, isError = true) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
    statusDiv.style.display = 'block';
}

// Function to update last login timestamp
async function updateLastLogin(userId) {
    try {
        // Create current timestamp
        const timestamp = new Date().toISOString();
        
        // Create the update object
        const updates = {};
        updates[`users/${userId}/lastLogin`] = timestamp;
        
        // Update the database
        console.log('Updating last login timestamp for user:', userId);
        await update(ref(database), updates);
        console.log('Last login timestamp updated successfully');
        
        return timestamp;
    } catch (error) {
        console.error('Error updating last login timestamp:', error);
        // We don't want to fail the login process if this update fails
        // So we just log the error and continue
    }
}

// Function to handle login
async function handleLogin(email, password) {
    try {
        // Show loading message
        updateStatus('Logging in...', false);
        
        console.log('Attempting login with:', email);
        
        // Attempt to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed in successfully:', user.uid);

        // Get user data from database
        console.log('Fetching user data from database');
        const snapshot = await get(ref(database, 'users/' + user.uid));
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User data retrieved:', userData);
            
            // Update last login timestamp
            const lastLoginTimestamp = await updateLastLogin(user.uid);
            
            // Update the userData object with new lastLogin time if update was successful
            if (lastLoginTimestamp) {
                userData.lastLogin = lastLoginTimestamp;
            }
            
            // Store user data in localStorage for use across the app
            localStorage.setItem('userData', JSON.stringify(userData));
            
            updateStatus('Login successful! Redirecting...', false);
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            console.error('User data not found in database');
            updateStatus('User data not found. Please contact support.');
        }
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed: ';
        
        // Provide user-friendly error messages
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            default:
                errorMessage += error.message;
        }
        
        updateStatus(errorMessage);
    }
}

// Initialize login functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing login functionality');
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    // Add form submit event listener
    loginForm.addEventListener('submit', function(event) {
        // Prevent default form submission
        event.preventDefault();
        console.log('Login form submitted');
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate inputs
        if (!email || !password) {
            updateStatus('Please enter both email and password');
            return;
        }
        
        // Attempt login
        handleLogin(email, password);
    });
    
    // Also handle click on the login button (as extra precaution)
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            loginForm.dispatchEvent(new Event('submit'));
        });
    }
});