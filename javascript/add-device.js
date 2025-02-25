import { ref, update, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { deviceTypes } from './device-type.js';

let currentStep = 1;
let selectedRoom = null;
let selectedDevice = null;

export function initialiseAddDeviceModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('addDeviceModal')) {
        const modalHTML = `
            <div id="addDeviceModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    
                    <!-- Step 1: Room Selection -->
                    <div id="step1" class="step">
                        <h2 class="h2Light">Select Room</h2>
                        <div id="roomsList" class="rooms-list">
                            <!-- Rooms will be inserted here -->
                        </div>
                        <button id="addNewRoomBtn" class="buttonHome lightcyanButton">
                            + Add New Room
                        </button>
                        <div id="newRoomInput" style="display: none;" class="form-group">
                            <input type="text" id="newRoomName" placeholder="Enter room name">
                            <button id="confirmNewRoom" class="buttonHome lightcyanButton">
                                Add Room
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Device Selection -->
                    <div id="step2" class="step" style="display: none;">
                        <h2 class="h2Light">Select Device Type</h2>
                        <div id="devicesList" class="devices-list">
                            <!-- Devices will be inserted here -->
                        </div>
                    </div>

                    <!-- Step 3: Device Naming -->
                    <div id="step3" class="step" style="display: none;">
                        <h2 class="h2Light">Name Your Device</h2>
                        <div class="selected-device-preview">
                            <img id="selectedDeviceIcon" src="" alt="Selected device">
                            <span id="selectedDeviceType"></span>
                        </div>
                        <div class="form-group">
                            <input type="text" id="deviceName" placeholder="Enter device name">
                            <button id="confirmDevice" class="buttonHome lightcyanButton">
                                Add Device
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setupModalEventListeners();
    }
}

function setupModalEventListeners() {
    // Close button
    document.querySelector('.close-button').addEventListener('click', closeModal);

    // Add new room button
    document.getElementById('addNewRoomBtn').addEventListener('click', () => {
        document.getElementById('newRoomInput').style.display = 'block';
    });

    // Confirm new room
    document.getElementById('confirmNewRoom').addEventListener('click', () => {
        const roomName = document.getElementById('newRoomName').value.trim();
        if (roomName) {
            selectedRoom = roomName;
            showStep(2);
        }
    });

    // Confirm device
    document.getElementById('confirmDevice').addEventListener('click', async () => {
        const deviceName = document.getElementById('deviceName').value.trim();
        if (deviceName) {
            await addDeviceToRoom(deviceName);
            closeModal();
        }
    });
}

async function loadRooms() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        const roomsRef = ref(database, `offices/${officeID}/rooms`);
        const snapshot = await get(roomsRef);
        
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = '';

        if (snapshot.exists()) {
            Object.keys(snapshot.val()).forEach(roomName => {
                const roomButton = document.createElement('button');
                roomButton.className = 'room-button buttonHome darkishgreenishButton';
                roomButton.textContent = roomName;
                roomButton.onclick = () => {
                    selectedRoom = roomName;
                    showStep(2);
                };
                roomsList.appendChild(roomButton);
            });
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function loadDevices() {
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = '';

    Object.entries(deviceTypes).forEach(([type, iconPath]) => {
        const deviceButton = document.createElement('div');
        deviceButton.className = 'device-option';
        deviceButton.innerHTML = `
            <img src="${iconPath}" alt="${type}">
            <span>${type}</span>
        `;
        deviceButton.onclick = () => {
            selectedDevice = type;
            document.getElementById('selectedDeviceIcon').src = iconPath;
            document.getElementById('selectedDeviceType').textContent = type;
            showStep(3);
        };
        devicesList.appendChild(deviceButton);
    });
}

async function addDeviceToRoom(deviceName) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        
        const deviceData = {
            name: deviceName,
            type: selectedDevice,
            status: 'Off'
        };

        const roomRef = ref(database, `offices/${officeID}/rooms/${selectedRoom}`);
        const snapshot = await get(roomRef);
        let devices = [];
        
        if (snapshot.exists()) {
            devices = Array.isArray(snapshot.val()) ? snapshot.val() : Object.values(snapshot.val());
        }
        
        devices.push(deviceData);
        
        await update(ref(database), {
            [`offices/${officeID}/rooms/${selectedRoom}`]: devices
        });

        // Reset state
        selectedRoom = null;
        selectedDevice = null;
        currentStep = 1;
    } catch (error) {
        console.error('Error adding device:', error);
    }
}

function showStep(step) {
    currentStep = step;
    document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';

    if (step === 1) {
        loadRooms();
    } else if (step === 2) {
        loadDevices();
    }
}

// Function to show the modal
window.showAddDevice = function() {
    const modal = document.getElementById('addDeviceModal');
    modal.style.display = 'block';
    showStep(1);
};

function closeModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.style.display = 'none';
    document.getElementById('newRoomInput').style.display = 'none';
    document.getElementById('newRoomName').value = '';
    document.getElementById('deviceName').value = '';
    currentStep = 1;
    selectedRoom = null;
    selectedDevice = null;
}