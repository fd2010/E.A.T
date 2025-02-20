//login-firebase.js
import { auth, database } from '../database/firebase-config.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

// Add login handler
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const statusDiv = document.getElementById('status');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
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
            console.error(`User data not found for UID: ${user.uid}`);
            statusDiv.textContent = 'User data not found. Please check your account details.';
        }
    } catch (error) {
        console.error("Login failed:", error); // Log the full error object
        let errorMessage = "Login failed. ";
        if (error.code === "auth/user-not-found") {
          errorMessage = "User not found.";
        } else if (error.code === "auth/wrong-password") {
          errorMessage = "Wrong password.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Invalid email.";
        } else if (error.code.startsWith("firebase/database/")) {
            errorMessage = "Database error: " + error.message;
        } else {
          errorMessage += error.message;
        }
        statusDiv.textContent = errorMessage;
    }
});