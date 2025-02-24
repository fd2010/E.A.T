// login-firebase.js
import { auth, database } from '../database/firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const statusDiv = document.getElementById('status');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form from submitting normally
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Show loading state
            statusDiv.textContent = 'Logging in...';
            statusDiv.style.color = 'blue';

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Get user data from database
            const snapshot = await get(ref(database, 'users/' + user.uid));

            if (snapshot.exists()) {
                const userData = snapshot.val();
                localStorage.setItem('userData', JSON.stringify(userData));
                
                statusDiv.textContent = 'Login successful!';
                statusDiv.style.color = 'green';
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = './dashboard.html';
                }, 1000);
            } else {
                throw new Error('User data not found');
            }
        } catch (error) {
            console.error("Login failed:", error);
            let errorMessage = "Login failed: ";
            
            switch (error.code) {
                case "auth/user-not-found":
                    errorMessage = "No account found with this email.";
                    break;
                case "auth/wrong-password":
                    errorMessage = "Incorrect password.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Invalid email format.";
                    break;
                default:
                    errorMessage += error.message;
            }
            
            statusDiv.textContent = errorMessage;
            statusDiv.style.color = 'red';
        }
    });
});