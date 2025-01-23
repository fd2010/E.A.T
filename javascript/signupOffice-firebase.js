import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Generate unique office ID
function generateOfficeID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Save office data to database
async function saveOfficeData(officeID, officeData) {
    try {
        await set(ref(database, 'offices/' + officeID), officeData);
        return true;
    } catch (error) {
        console.error('Error saving office data:', error);
        throw error;
    }
}

// Save admin user data
async function saveUserData(userId, userData) {
    try {
        await set(ref(database, 'users/' + userId), userData);
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}

// Get room data from the form
function getRoomData() {
    const roomsContainer = document.getElementById('roomsContainer');
    const rooms = {};
    
    roomsContainer.querySelectorAll('.devices-container').forEach(roomDiv => {
        const roomInput = roomDiv.querySelector('input[type="text"]');
        const roomName = roomInput.value;
        const devices = [];
        
        roomDiv.querySelectorAll('#deviceDisplay').forEach(deviceDiv => {
            const deviceName = deviceDiv.querySelector('div > div > div').textContent;
            const deviceType = deviceDiv.querySelector('div > div > div:nth-child(2)').textContent;
            devices.push({ name: deviceName, type: deviceType });
        });
        
        rooms[roomName] = devices;
    });
    
    return rooms;
}

// Setup status display
const statusDiv = document.createElement('div');
statusDiv.style.margin = '10px 0';
statusDiv.style.padding = '10px';
statusDiv.style.borderRadius = '4px';
document.querySelector('.container').appendChild(statusDiv);

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
        // Get form values
        const orgName = document.getElementById('organisationName').value;
        const buildingNum = document.getElementById('buildingNameNumber').value;
        const street = document.getElementById('Street').value;
        const city = document.getElementById('city').value;
        const county = document.getElementById('county').value || null;
        const postcode = document.getElementById('postcode').value;
        const floors = document.getElementById('numberInput').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match!');
        }

        statusDiv.textContent = 'Creating office and admin account...';
        statusDiv.style.backgroundColor = '#e3f2fd';
        statusDiv.style.color = '#1976d2';

        // Generate office ID
        const officeID = generateOfficeID();

        // Create office data structure
        const officeData = {
            officeID: officeID,
            organisationName: orgName,
            address: {
                buildingNumber: buildingNum,
                street: street,
                city: city,
                county: county,
                postcode: postcode
            },
            floors: parseInt(floors),
            rooms: getRoomData(),
            createdAt: new Date().toISOString()
        };

        // Create admin account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create admin user data
        const userData = {
            email: email,
            officeID: officeID,
            prefName: 'Admin',
            role: 'systemAdmin',
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        // Save both office and user data
        await saveOfficeData(officeID, officeData);
        await saveUserData(user.uid, userData);
        
        statusDiv.textContent = 'Office and admin account created! Redirecting to login...';
        statusDiv.style.backgroundColor = '#e8f5e9';
        statusDiv.style.color = '#2e7d32';

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error during signup:', error);
        let errorMessage = 'An error occurred during signup: ';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Please choose a stronger password (at least 6 characters).';
                break;
            default:
                errorMessage = error.message;
        }
        
        statusDiv.textContent = errorMessage;
        statusDiv.style.backgroundColor = '#ffebee';
        statusDiv.style.color = '#c62828';
    }
});