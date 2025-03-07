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
            <button onclick="window.location.href='login.html'" class="buttonHome lightcyanButton">
                Return to Login
            </button>
        `;
    }
}

// Function to synchronise the thermostat with the Firebase temperature value
async function synchroniseTemperature(officeID) {
    try {
        const officeRef = ref(database, `offices/${officeID}`);
        const officeSnapshot = await get(officeRef);
        
        if (officeSnapshot.exists()) {
            const officeData = officeSnapshot.val();
            
            // Check if temperature field exists
            if (officeData.hasOwnProperty('temperature')) {
                const storedTemp = officeData.temperature;
                console.log('Retrieved temperature from Firebase:', storedTemp);
                
                // Get thermostat elements
                const tempDisplay = document.getElementById('temp-display');
                const powerToggle = document.getElementById('power-toggle');
                const dialElement = document.getElementById('thermostat-dial');
                
                // Update the thermostat UI if elements exist
                if (tempDisplay && powerToggle && dialElement) {
                    // If temperature is 0, set thermostat to off
                    if (storedTemp === 0) {
                        tempDisplay.textContent = "OFF";
                        powerToggle.checked = false;
                        dialElement.style.opacity = 0.5;
                    } else {
                        // Otherwise set thermostat to on with stored temperature
                        tempDisplay.textContent = storedTemp.toString();
                        powerToggle.checked = true;
                        dialElement.style.opacity = 1;
                        
                        // Optional: Calculate and update the dial position based on the temperature
                        // This would require additional code to map the temperature back to an angle
                    }
                }
            } else {
                console.log('No temperature field found in office data, will be created when thermostat is used');
            }
        }
    } catch (error) {
        console.error('Error synchronising temperature:', error);
    }
}


// Initialise dashboard
async function initialiseDashboard() {
    console.log('Starting dashboard initialisation');
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
            
            // Synchronise thermostat with Firebase temperature
            if (userData.officeID) {
                synchroniseTemperature(userData.officeID);
            }
            
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
                        
                        // Synchronise thermostat with Firebase temperature
                        if (userData.officeID) {
                            synchroniseTemperature(userData.officeID);
                        }
                        
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
        console.error('Error in initialisation:', error);
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