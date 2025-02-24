// Debug helper
console.log('dashboard.js loading...');

import { auth, database } from '../database/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { updateRoomTabs, updateUserDisplay, toggleLoadingState } from './display-dashboard.js';
import { initialiseAddDeviceModal } from './add-device.js';

// Function to update user interface with user data
async function updateUserInterface(userData) {
    console.log('Updating UI with user data:', userData);
    
    // Update user display information
    updateUserDisplay(userData);
    
    // Fetch office data to get rooms and devices
    try {
        const officeRef = ref(database, `offices/${userData.officeID}`);
        const officeSnapshot = await get(officeRef);
        
        if (officeSnapshot.exists()) {
            const officeData = officeSnapshot.val();
            if (officeData.rooms) {
                updateRoomTabs(officeData.rooms);
            }
        }
    } catch (error) {
        console.error('Error fetching office data:', error);
        handleError(error);
    }
}

// Function to handle errors
function handleError(error) {
    console.error('Dashboard Error:', error);
    const errorDisplay = document.getElementById('errorDisplay');
    
    toggleLoadingState(false);
    
    if (errorDisplay) {
        errorDisplay.style.display = 'block';
        errorDisplay.innerHTML = `
            <h1>Error Loading Dashboard</h1>
            <p>${error.message}</p>
            <p>Please try logging in again.</p>
            <button onclick="window.location.href='login.html'" class="buttonHome" style="background-color: #C1E6E3;">
                Return to Login
            </button>
        `;
    }
}

// Initialize dashboard
async function initialiseDashboard() {
    console.log('Starting dashboard initialization');
    try {
        // Show loading state
        toggleLoadingState(true);

        // First check if there's user data in localStorage
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserData) {
            console.log('Found stored user data');
            const userData = JSON.parse(storedUserData);
            
            // Hide loading state and show dashboard
            toggleLoadingState(false);
            
            // Update the UI with user data
            await updateUserInterface(userData);
            
            // Still verify with Firebase that the user is logged in
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    console.log('No authenticated user found, redirecting to login');
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                }
            });
            
            // Add logout functionality
            setupLogoutButton();
            
        } else {
            // No stored data, check authentication state
            console.log('No stored user data, checking auth state');
            onAuthStateChanged(auth, async (user) => {
                console.log('Auth state changed:', user ? 'User is logged in' : 'No user');
                
                if (!user) {
                    console.log('No user found, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    console.log('Getting user data for:', user.uid);
                    
                    // Fetch fresh data from Firebase
                    const userRef = ref(database, `users/${user.uid}`);
                    console.log('Fetching user data from database...');
                    const snapshot = await get(userRef);

                    if (snapshot.exists()) {
                        console.log('User data found in database');
                        const userData = snapshot.val();
                        
                        // Hide loading state and show dashboard
                        toggleLoadingState(false);
                        
                        // Update the UI with user data
                        await updateUserInterface(userData);
                        
                        // Update localStorage
                        localStorage.setItem('userData', JSON.stringify(userData));
                        
                        // Add logout functionality
                        setupLogoutButton();
                        
                    } else {
                        console.error('No user data found in database');
                        throw new Error('User data not found in database');
                    }

                } catch (error) {
                    console.error('Error in auth state change handler:', error);
                    handleError(error);
                }
            });
        }
    } catch (error) {
        console.error('Error in initialization:', error);
        handleError(error);
    }
}

// Set up logout button functionality
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error signing out. Please try again.');
            }
        });
    }
}

// Start initialisation when the page loads
console.log('Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initialising dashboard and modal');
    initialiseDashboard();
    initialiseAddDeviceModal();
});