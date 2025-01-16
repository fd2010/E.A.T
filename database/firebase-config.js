// Import the required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOw5Zc-E3Gq74lGYAVHcpkgNnNrumrdu0",
    authDomain: "energy-analysis-tool.firebaseapp.com",
    databaseURL: "https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "energy-analysis-tool",
    storageBucket: "energy-analysis-tool.firebasestorage.app",
    messagingSenderId: "333108098273",
    appId: "1:333108098273:web:ddabe077f6be647ad1b3a0",
    measurementId: "G-CP2WDCMRM9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const database = getDatabase();

// Get form elements
const loginForm = document.getElementById('loginForm');
const email = document.getElementById('email');
const officeID = document.getElementById('officeID');
const prefName = document.getElementById('prefName');
const username = document.getElementById('username');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

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

// Function to validate form
function validateForm() {
    if (password.value !== confirmPassword.value) {
        alert("Passwords don't match!");
        return false;
    }
    if (password.value.length < 6) {
        alert("Password should be at least 6 characters!");
        return false;
    }
    return true;
}

// Function to save user data to database
async function saveUserData(userId, userData) {
    try {
        await set(ref(database, 'users/' + userId), userData);
        console.log('User data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const selectedRole = getSelectedRole();
    if (!selectedRole) {
        alert('Please select a role!');
        return;
    }

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        // Prepare user data
        const userData = {
            email: email.value,
            officeID: officeID.value,
            prefName: prefName.value,
            username: username.value,
            role: selectedRole,
            createdAt: new Date().toISOString()
        };

        // Save user data to database
        const dataSaved = await saveUserData(user.uid, userData);
        
        if (dataSaved) {
            alert('Signup successful!');
            // Redirect to login or dashboard page
            window.location.href = 'login.html'; // Change this to your login page URL
        } else {
            alert('Error saving user data. Please try again.');
        }

    } catch (error) {
        console.error('Error during signup:', error);
        let errorMessage = 'An error occurred during signup.';
        
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
                errorMessage = 'Please choose a stronger password.';
                break;
        }
        
        alert(errorMessage);
    }
});