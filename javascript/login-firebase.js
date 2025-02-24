// login-firebase.js
import { auth, database } from '../database/firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const statusDiv = document.getElementById('status');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const submitButton = document.getElementById('submitButton');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Helper function to show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        
        // Set colors based on message type
        switch(type) {
            case 'error':
                statusDiv.style.backgroundColor = '#ffebee';
                statusDiv.style.color = '#c62828';
                break;
            case 'success':
                statusDiv.style.backgroundColor = '#e8f5e9';
                statusDiv.style.color = '#2e7d32';
                break;
            case 'loading':
                statusDiv.style.backgroundColor = '#e3f2fd';
                statusDiv.style.color = '#1976d2';
                break;
            default:
                statusDiv.style.backgroundColor = '#e3f2fd';
                statusDiv.style.color = '#1976d2';
        }
    }

    // Helper function to toggle loading state
    function setLoading(isLoading) {
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
        submitButton.disabled = isLoading;
        emailInput.disabled = isLoading;
        passwordInput.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Logging in...' : 'LOGIN';
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Login form submitted'); 
    
        try {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
    
            console.log('Email:', email); // Log the email
            console.log('Password:', password); // Log the password
    
            if (!email || !password) {
                showStatus('Please fill in all fields.', 'error');
                return;
            }
    
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showStatus('Please enter a valid email address.', 'error');
                return;
            }
    
            setLoading(true);
            showStatus('Logging in...', 'loading');
    
            console.log('Attempting to sign in with Firebase...'); // Log before Firebase sign-in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Firebase sign-in successful. User:', user); // Log the user object
    
            const snapshot = await get(ref(database, 'users/' + user.uid));
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log('User data found:', userData); // Log the user data
    
                localStorage.setItem('userData', JSON.stringify(userData));
                showStatus('Login successful! Redirecting...', 'success');
    
                setTimeout(() => {
                    console.log('Redirecting to dashboard...'); // Log before redirect
                    window.location.href = './dashboard.html';
                }, 1000);
            } else {
                throw new Error('User data not found');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
    
            let errorMessage;
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = 'Login failed. Please try again.';
            }
    
            showStatus(errorMessage, 'error');
            passwordInput.value = '';
        }
    });

    // Clear status message when user starts typing
    emailInput.addEventListener('input', () => {
        statusDiv.style.display = 'none';
    });

    passwordInput.addEventListener('input', () => {
        statusDiv.style.display = 'none';
    });

    // Handle password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.src = type === 'password' 
                ? './images/icons/eye-open.png' 
                : './images/icons/eye-closed.png';
        });
    }
});