import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

function generateOfficeID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

async function saveOfficeData(officeID, officeData) {
    try {
        await set(ref(database, 'offices/' + officeID), officeData);
        return true;
    } catch (error) {
        console.error('Error saving office data:', error);
        throw error;
    }
}

async function saveUserData(userId, userData) {
    try {
        await set(ref(database, 'users/' + userId), userData);
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}

function processDeviceType(input) {
    // Trim any extra spaces
    const cleanType = input.trim();

    // Find the matching device type from the keys in deviceTypes
    const matchingType = Object.keys(deviceTypes).find(type => cleanType.endsWith(` ${type}`));

    if (matchingType) {
        // Extract the part before the matching type
        const cleansedName = cleanType.substring(0, cleanType.lastIndexOf(` ${matchingType}`)).trim();
        const cleansedType = matchingType;

        return { cleansedName, cleansedType };
    } else {
        throw new Error('Invalid device type or format');
    }
}

function getRoomData() {
    const roomsContainer = document.getElementById('roomsContainer');
    const rooms = {};
    
    roomsContainer.querySelectorAll('.devices-container').forEach(roomDiv => {
        const roomInput = roomDiv.querySelector('input[type="text"]');
        const roomName = roomInput.value;
        const devices = [];
        
        roomDiv.querySelectorAll('#deviceDisplay').forEach(deviceDiv => {
            //const deviceName = deviceDiv.querySelector('div > div > div').textContent;
            const deviceType = deviceDiv.querySelector('div > div > div:nth-child(2)').textContent;
            
            // Clean up the text content by removing the extra text
            //const cleanName = deviceName.replace('Remove', '').replace(deviceType, '').trim();
            const cleanType = deviceType.trim();

            const { cleansedName, cleansedType } = processDeviceType(cleanType); 
            
            devices.push({ 
                name: cleansedName,
                type: cleansedType,
                status: 'Off'
            });
        });
        
        rooms[roomName] = devices;
    });
    
    return rooms;
}

const statusDiv = document.createElement('div');
statusDiv.style.margin = '10px 0';
statusDiv.style.padding = '10px';
statusDiv.style.borderRadius = '4px';
document.querySelector('.container').appendChild(statusDiv);

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
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

        statusDiv.textContent = 'Checking email availability...';
        statusDiv.style.backgroundColor = '#e3f2fd';
        statusDiv.style.color = '#1976d2';

        // Check if admin email exists
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
            const emailExists = Object.values(usersSnapshot.val()).some(user => user.email === email);
            if (emailExists) {
                throw new Error('This email is already registered');
            }
        }

        statusDiv.textContent = 'Creating office and admin account...';

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