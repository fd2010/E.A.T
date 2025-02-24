// signupOffice-firebase.js
import { auth, database } from '../database/firebase-config.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { deviceTypes } from './device-type.js';

document.addEventListener('DOMContentLoaded', () => {
    // Find or create status div
    let statusDiv = document.querySelector('.statusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'statusMessage';
        document.querySelector('.container').appendChild(statusDiv);
    }

    // Get the form
    const signupForm = document.getElementById('loginForm');

    // Helper function to generate office ID
    function generateOfficeID() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    // Helper function to process device types
    function processDeviceType(input) {
        const cleanType = input.trim();
        const matchingType = Object.keys(deviceTypes)
            .find(type => cleanType.toLowerCase().includes(type.toLowerCase()));

        if (!matchingType) {
            throw new Error(`Invalid device type: ${cleanType}`);
        }

        const cleansedName = cleanType
            .replace(new RegExp(matchingType, 'i'), '')
            .trim() || matchingType;

        return {
            cleansedName,
            cleansedType: matchingType
        };
    }

    // Helper function to get room data
    function getRoomData() {
        const roomsContainer = document.getElementById('roomsContainer');
        const rooms = {};

        if (!roomsContainer) {
            console.warn('Rooms container not found');
            return rooms;
        }

        roomsContainer.querySelectorAll('.devices-container').forEach(roomDiv => {
            try {
                const roomInput = roomDiv.querySelector('input[type="text"]');
                if (!roomInput) return;

                const roomName = roomInput.value.trim();
                if (!roomName) return;

                const devices = [];
                roomDiv.querySelectorAll('#deviceDisplay').forEach(deviceDiv => {
                    try {
                        const deviceTypeElement = deviceDiv.querySelector('div > div > div:nth-child(2)');
                        if (!deviceTypeElement) return;

                        const deviceType = deviceTypeElement.textContent.trim();
                        const { cleansedName, cleansedType } = processDeviceType(deviceType);

                        devices.push({
                            name: cleansedName,
                            type: cleansedType,
                            status: 'Off'
                        });
                    } catch (error) {
                        console.error('Error processing device:', error);
                    }
                });

                if (devices.length > 0) {
                    rooms[roomName] = devices;
                }
            } catch (error) {
                console.error('Error processing room:', error);
            }
        });

        return rooms;
    }

    // Handle form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        let createdUser = null;

        try {
            // Update status
            statusDiv.textContent = 'Processing signup...';
            statusDiv.style.backgroundColor = '#e3f2fd';
            statusDiv.style.color = '#1976d2';

            // Get form values
            const orgName = document.getElementById('organisationName').value.trim();
            const buildingNum = document.getElementById('buildingNameNumber').value.trim();
            const street = document.getElementById('Street').value.trim();
            const city = document.getElementById('city').value.trim();
            const county = document.getElementById('county').value.trim();
            const postcode = document.getElementById('postcode').value.trim();
            const floors = document.getElementById('numberInput').value;
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validation
            if (!orgName || !buildingNum || !street || !city || !postcode || !floors || !email || !password) {
                throw new Error('Please fill in all required fields.');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match.');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address.');
            }

            // Password strength validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long.');
            }

            // UK postcode validation
            const postcodeRegex = /^([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})$/i;
            if (!postcodeRegex.test(postcode)) {
                throw new Error('Please enter a valid UK postcode.');
            }

            // Check if email already exists
            statusDiv.textContent = 'Checking email availability...';
            const usersSnapshot = await get(ref(database, 'users'));
            if (usersSnapshot.exists()) {
                const emailExists = Object.values(usersSnapshot.val())
                    .some(user => user.email === email);
                if (emailExists) {
                    throw new Error('This email is already registered.');
                }
            }

            // Generate office ID
            const officeID = generateOfficeID();

            // Get room data
            const rooms = getRoomData();
            if (Object.keys(rooms).length === 0) {
                throw new Error('Please add at least one room with devices.');
            }

            // Create office data
            const officeData = {
                officeID,
                organisationName: orgName,
                address: {
                    buildingNumber: buildingNum,
                    street,
                    city,
                    county: county || null,
                    postcode: postcode.toUpperCase()
                },
                floors: parseInt(floors),
                rooms,
                createdAt: new Date().toISOString()
            };

            // Create authentication account
            statusDiv.textContent = 'Creating admin account...';
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            createdUser = userCredential.user;

            // Create admin user data
            const userData = {
                email,
                officeID,
                prefName: 'Admin',
                role: 'systemAdmin',
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            // Save office and user data
            await set(ref(database, 'offices/' + officeID), officeData);
            await set(ref(database, 'users/' + createdUser.uid), userData);

            // Success message and redirect
            statusDiv.textContent = 'Office and admin account created successfully! Redirecting to login...';
            statusDiv.style.backgroundColor = '#e8f5e9';
            statusDiv.style.color = '#2e7d32';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Signup error:', error);

            // Clean up if auth was created but database failed
            if (createdUser) {
                try {
                    await deleteUser(createdUser);
                } catch (deleteError) {
                    console.error('Error cleaning up auth user:', deleteError);
                }
            }

            // Handle specific error messages
            let errorMessage = '';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. It must be at least 6 characters.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage = error.message || 'An unexpected error occurred. Please try again.';
            }

            // Display error
            statusDiv.textContent = errorMessage;
            statusDiv.style.backgroundColor = '#ffebee';
            statusDiv.style.color = '#c62828';
        }
    });
});