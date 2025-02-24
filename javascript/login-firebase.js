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
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Debug helper
console.log('login-firebase.js loaded');

// Ensure DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Setting up login form handler');
    
    const loginForm = document.getElementById('loginForm');
    const statusDiv = document.getElementById('status');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    if (!statusDiv) {
        console.error('Status div not found!');
    }
    
    // Add login handler with explicit preventDefault
    loginForm.addEventListener('submit', async function(event) {
        // This is critical - must prevent default form submission
        event.preventDefault();
        console.log('Login form submitted, default prevented');
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!statusDiv) {
            // Create status div if it doesn't exist
            const container = document.querySelector('.container');
            const newStatusDiv = document.createElement('div');
            newStatusDiv.id = 'status';
            newStatusDiv.className = 'statusMessage';
            container.appendChild(newStatusDiv);
            statusDiv = newStatusDiv;
        }
        
        try {
            // Show login attempt status
            statusDiv.textContent = 'Logging in...';
            statusDiv.style.color = 'blue';
            
            console.log('Attempting to sign in with:', email);
            
            // Attempt to sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User signed in:', user.uid);

            // Get user data from database
            console.log('Fetching user data from database');
            const snapshot = await get(ref(database, 'users/' + user.uid));
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log('User data retrieved:', userData);
                localStorage.setItem('userData', JSON.stringify(userData));
                
                statusDiv.textContent = 'Login successful!';
                statusDiv.style.color = 'green';
                
                console.log('Redirecting to dashboard in 1 second');
                setTimeout(() => {
                    window.location.href = './dashboard.html';
                }, 1000);
            } else {
                console.error('User data not found in database');
                statusDiv.textContent = 'User data not found';
                statusDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed: ';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with these credentials';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            statusDiv.textContent = errorMessage;
            statusDiv.style.color = 'red';
        }
    });
});