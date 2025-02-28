// user-profile.js
import { auth, database } from '../database/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Constants that were in office-constants.js
const OFFICES_PATH = 'offices';
const USERS_PATH = 'users';
const ROOMS = 'rooms';
const STATUS_ON = 'On';

// Function to toggle loading state
function toggleLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    const profileContent = document.getElementById('profileContent');
    
    if (loadingState) loadingState.style.display = show ? 'block' : 'none';
    if (profileContent) profileContent.style.display = show ? 'none' : 'block';
}

// Function to handle errors
function handleError(error) {
    console.error('Profile Error:', error);
    const errorDisplay = document.getElementById('errorDisplay');
    
    toggleLoadingState(false);
    
    if (errorDisplay) {
        errorDisplay.style.display = 'block';
        errorDisplay.innerHTML = `
            <h1>Error Loading Profile</h1>
            <p>${error.message}</p>
            <p>Please try logging in again.</p>
            <button onclick="window.location.href='login.html'" class="buttonHome lightcyanButton">
                Return to Login
            </button>
        `;
    }
}

// Function to update user information display
function updateUserInfo(userData) {
    // Update header user display
    document.getElementById('prefName').textContent = userData.prefName || 'User';
    document.getElementById('userRole').textContent = userData.role || 'User';
    
    // Update detailed user information
    document.getElementById('userName').textContent = userData.prefName || 'User';
    document.getElementById('userEmail').textContent = userData.email || 'No email found';
    document.getElementById('userRoleDetail').textContent = userData.role || 'User';
    
    // Format and display last login date
    const lastLogin = userData.lastLogin ? new Date(userData.lastLogin) : null;
    document.getElementById('lastLogin').textContent = lastLogin 
        ? lastLogin.toLocaleString() 
        : 'No login data available';
}

// Function to update office information display
function updateOfficeInfo(officeData) {
    // Update office details
    document.getElementById('officeID').textContent = officeData.officeID || 'N/A';
    document.getElementById('organisationName').textContent = officeData.organisationName || 'N/A';
    
    // Format and display address
    const address = officeData.address || {};
    const formattedAddress = [
        address.buildingNumber || '',
        address.street || '',
        address.city || '',
        address.county ? address.county + '' : '',
        address.postcode || ''
    ].filter(Boolean).join(', ');
    
    document.getElementById('officeAddress').textContent = formattedAddress || 'No address information';
    document.getElementById('officeFloors').textContent = officeData.floors || 'N/A';
}

// Function to update room summary
function updateRoomSummary(rooms) {
    // Check if rooms exist and is not an empty object or array
    if (!rooms || (typeof rooms === 'object' && Object.keys(rooms).length === 0) || 
        (Array.isArray(rooms) && rooms.length === 0)) {
        document.getElementById('totalRooms').textContent = '0';
        document.getElementById('totalDevices').textContent = '0';
        document.getElementById('activeDevices').textContent = '0';
        document.getElementById('roomList').innerHTML = '<div class="no-data">No rooms found</div>';
        return;
    }
    
    // Handle either array or object format for rooms
    const roomEntries = Array.isArray(rooms) 
        ? rooms.map((room, index) => [`Room ${index + 1}`, room])
        : Object.entries(rooms);
    
    // Filter out null rooms
    const validRooms = roomEntries.filter(([_, room]) => room !== null);
    
    document.getElementById('totalRooms').textContent = validRooms.length;
    
    // Calculate total devices and active devices
    let totalDevices = 0;
    let activeDevices = 0;
    
    // Create room list HTML
    const roomListHTML = validRooms.map(([roomName, roomData]) => {
        // Handle devices in either array or object format
        const devices = Array.isArray(roomData) 
            ? roomData.filter(device => device !== null)
            : Object.values(roomData).filter(device => device !== null);
        
        // Update counts
        totalDevices += devices.length;
        activeDevices += devices.filter(device => device.status === STATUS_ON).length;
        
        // Create room item HTML
        return `
            <div class="room-item">
                <div class="room-name">${roomName}</div>
                <div class="room-device-count">${devices.length} devices</div>
                <div class="room-active-count">${devices.filter(device => device.status === STATUS_ON).length} active</div>
            </div>
        `;
    }).join('');
    
    // Update summary counts
    document.getElementById('totalDevices').textContent = totalDevices;
    document.getElementById('activeDevices').textContent = activeDevices;
    
    // Update room list
    document.getElementById('roomList').innerHTML = roomListHTML || '<div class="no-data">No rooms found</div>';
}

// Function to update the entire user interface with user and office data
async function updateUserInterface(userData) {
    
    // Update user information
    updateUserInfo(userData);
    
    // Fetch office data to get organization info, rooms, and devices
    try {
        const officeRef = ref(database, `${OFFICES_PATH}/${userData.officeID}`);
        const officeSnapshot = await get(officeRef);
        
        if (officeSnapshot.exists()) {
            const officeData = officeSnapshot.val();
            
            // Update office information
            updateOfficeInfo(officeData);
            
            // Update room summary if rooms exist
            if (officeData.rooms) {
                updateRoomSummary(officeData.rooms);
            } else {
                // Handle case with no rooms
                document.getElementById('totalRooms').textContent = '0';
                document.getElementById('totalDevices').textContent = '0';
                document.getElementById('activeDevices').textContent = '0';
                document.getElementById('roomList').innerHTML = '<div class="no-data">No rooms found</div>';
            }
        } else {
            console.error('Office data not found');
            // Display error or placeholder for office information
            document.getElementById('officeID').textContent = 'Office not found';
            document.getElementById('organisationName').textContent = 'N/A';
            document.getElementById('officeAddress').textContent = 'No address information';
            document.getElementById('officeFloors').textContent = 'N/A';
            
            // Handle missing room information
            document.getElementById('totalRooms').textContent = '0';
            document.getElementById('totalDevices').textContent = '0';
            document.getElementById('activeDevices').textContent = '0';
            document.getElementById('roomList').innerHTML = '<div class="no-data">No rooms found</div>';
        }
    } catch (error) {
        console.error('Error fetching office data:', error);
        handleError(error);
    }
}

// Initialize profile page
async function initialiseProfile() {
    try {
        // Show loading state
        toggleLoadingState(true);

        // First check if there's user data in localStorage (same approach as dashboard.js)
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            
            // Hide loading state and show profile content
            toggleLoadingState(false);
            
            // Update the UI with user data
            await updateUserInterface(userData);
            
            // Still verify with Firebase that the user is logged in
            onAuthStateChanged(auth, (user) => {
                if (!user) {
                    localStorage.removeItem('userData');
                    window.location.href = 'login.html';
                }
            });
            
            // Add logout functionality
            setupLogoutButton();
            
        } else {
            // No stored data, check authentication state
            onAuthStateChanged(auth, async (user) => {
                
                if (!user) {
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    
                    // Fetch fresh data from Firebase
                    const userRef = ref(database, `${USERS_PATH}/${user.uid}`);
                    const snapshot = await get(userRef);

                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        
                        // Hide loading state and show profile content
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
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error signing out. Please try again.');
            }
        });
    });
}

// Start initialisation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initialiseProfile();
});