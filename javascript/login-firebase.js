import { auth, database } from '../database/firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Add login handler
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('status');
    
    try {
        // Attempt to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from database
        const snapshot = await get(ref(database, 'users/' + user.uid));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            localStorage.setItem('userData', JSON.stringify(userData));
            statusDiv.textContent = 'Login successful!';
            statusDiv.style.color = 'green';
            setTimeout(() => {
                window.location.href = './dashboard.html';
            }, 1000);
        } else {
            statusDiv.textContent = 'User data not found';
        }
    } catch (error) {
        console.error('Error:', error);
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
    }
});