document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, setting up form handlers');
    
    const form = document.getElementById('loginForm');
    
    if (form) {
      console.log('Form found, attaching submit handler');
      
      // First, add a submission prevention handler to guarantee it runs
      form.addEventListener('submit', function(event) {
        console.log('Form submit event triggered');
        event.preventDefault();
        console.log('Default form submission prevented');
        
        // You don't need to do anything else here, your other event handlers will still run
      }, true); // The 'true' ensures this runs before other handlers
    } else {
      console.error('Form with ID "loginForm" not found!');
      // Check if the form might have a different ID
      const forms = document.querySelectorAll('form');
      console.log('Forms found on page:', forms.length);
      forms.forEach((f, i) => console.log(`Form ${i} id:`, f.id));
    }
});

import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { deviceTypes } from './device-type.js';

// Debug helper
console.log('signupOffice-firebase.js loaded');

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
        console.log('Saving office data:', officeData);
        
        // Ensure temperature field is added to the office data
        if (!officeData.hasOwnProperty('temperature')) {
            officeData.temperature = 0;
        }
        
        await set(ref(database, 'offices/' + officeID), officeData);
        console.log('Office data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving office data:', error);
        throw error;
    }
}

async function saveUserData(userId, userData) {
    try {
        console.log('Saving user data:', userData);
        await set(ref(database, 'users/' + userId), userData);
        console.log('User data saved successfully');
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
    if (!roomsContainer) {
        console.warn('roomsContainer not found, returning empty object');
        return {};
    }
    
    const rooms = {};
    
    roomsContainer.querySelectorAll('.devices-container').forEach(roomDiv => {
        const roomInput = roomDiv.querySelector('input[type="text"]');
        if (!roomInput) {
            console.warn('Room input not found in a room div');
            return;
        }
        
        const roomName = roomInput.value;
        const devices = [];
        
        roomDiv.querySelectorAll('#deviceDisplay').forEach(deviceDiv => {
            try {
                const deviceType = deviceDiv.querySelector('div > div > div:nth-child(2)').textContent;
                const cleanType = deviceType.trim();
                const { cleansedName, cleansedType } = processDeviceType(cleanType); 
                
                devices.push({ 
                    name: cleansedName,
                    type: cleansedType,
                    status: 'Off'
                });
            } catch (error) {
                console.warn('Error processing a device:', error);
            }
        });
        
        if (roomName) {
            rooms[roomName] = devices;
        }
    });
    
    console.log('Collected room data:', rooms);
    return rooms;
}

// Ensure the DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Setting up signup form handler');
    
    // Create status div if it doesn't exist
    let statusDiv = document.getElementById('status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status';
        statusDiv.style.margin = '10px 0';
        statusDiv.style.padding = '10px';
        statusDiv.style.borderRadius = '4px';
        document.querySelector('.container').appendChild(statusDiv);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Form with ID "loginForm" not found!');
        statusDiv.textContent = 'Error: Signup form not found';
        statusDiv.style.backgroundColor = '#ffebee';
        statusDiv.style.color = '#c62828';
        return;
    }
    
    // Add form submit handler with explicit preventDefault
    loginForm.addEventListener('submit', async function(event) {
        // Critical: prevent the default form submission
        event.preventDefault();
        console.log('Signup form submitted, default prevented');
        
        try {
            const orgName = document.getElementById('organisationName')?.value;
            const buildingNum = document.getElementById('buildingNameNumber')?.value;
            const street = document.getElementById('Street')?.value;
            const city = document.getElementById('city')?.value;
            const county = document.getElementById('county')?.value || null;
            const postcode = document.getElementById('postcode')?.value;
            const floors = document.getElementById('numberInput')?.value;
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (!orgName || !buildingNum || !street || !city || !postcode || !floors || !email || !password) {
                throw new Error('Please fill in all required fields');
            }

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
            console.log('Generated office ID:', officeID);

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
                temperature: 0,
                createdAt: new Date().toISOString()
        };

            // Create admin account
            console.log('Creating admin account with email:', email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Admin account created with UID:', user.uid);

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
            console.log('Saving office and user data to database');
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
});