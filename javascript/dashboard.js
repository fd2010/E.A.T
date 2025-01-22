import { auth, database } from '../database/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Function to update user interface with user data
function updateUserInterface(userData) {
    console.log('Updating UI with user data:', userData);
    const prefNameElement = document.getElementById('prefName');
    const userRoleElement = document.getElementById('userRole');
    const officeIDElement = document.getElementById('officeID');
    
    if (prefNameElement) prefNameElement.textContent = userData.prefName || 'User';
    if (userRoleElement) userRoleElement.textContent = userData.role || 'Not specified';
    if (officeIDElement) officeIDElement.textContent = userData.officeID || 'Not specified';
}

// Function to handle errors
function handleError(error) {
    console.error('Dashboard Error:', error);
    document.body.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h1>Error Loading Dashboard</h1>
            <p>${error.message}</p>
            <p>Please try logging in again.</p>
            <button onclick="window.location.href='login.html'" class="buttonHome" style="background-color: #C1E6E3;">
                Return to Login
            </button>
        </div>
    `;
    document.body.style.display = 'block';
}

// Initialise dashboard
async function initializeDashboard() {
    console.log('Starting dashboard initialization');
    try {
        // Show loading state
        document.body.innerHTML = '<div style="text-align: center; padding: 20px;">Loading dashboard...</div>';
        document.body.style.display = 'block';

        // Check if user data exists in localStorage
        const storedData = localStorage.getItem('userData');
        console.log('Stored user data:', storedData);

        // Check authentication state
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
                    
                    // Update the page content
                    document.body.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                            <div>
                                <h1 class="h1Light">Welcome, <span id="prefName">Loading...</span></h1>
                                <p class="h2Light">Role: <span id="userRole">Loading...</span></p>
                                <p class="h2Light">Office ID: <span id="officeID">Loading...</span></p>
                            </div>
                            <button id="logoutBtn" class="buttonHome" style="background-color: #C1E6E3;">Logout</button>
                        </div>
                        <br>
                        <div class="divLight">
                            <p id="companyName">PearCare.Inc</p>
                            <div id="line"></div>
                        </div>
                    `;
                    
                    // Update the UI with user data
                    updateUserInterface(userData);
                    
                    // Update localStorage
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    // Add logout functionality
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
                } else {
                    console.error('No user data found in database');
                    throw new Error('User data not found in database');
                }

            } catch (error) {
                console.error('Error in auth state change handler:', error);
                handleError(error);
            }
        });

    } catch (error) {
        console.error('Error in initialization:', error);
        handleError(error);
    }
}

// Start initialization when the page loads
console.log('Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', initializeDashboard);