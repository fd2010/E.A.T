import { ref, update, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { deviceTypes } from './device-type.js';

let currentStep = 1;
let selectedRoom = null;
let selectedDevice = null;
let deviceIndex = null;

export function initialiseDeleteDeviceModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('deleteDeviceModal')) {
        const modalHTML = `
            <div id="deleteDeviceModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    
                    <!-- Step 1: Room Selection -->
                    <div id="deleteStep1" class="step">
                        <h2 class="h2Light">Select Room to Delete From</h2>
                        <div id="deleteRoomsList" class="rooms-list">
                            <!-- Rooms will be inserted here -->
                        </div>
                    </div>

                    <!-- Step 2: Device Selection -->
                    <div id="deleteStep2" class="step" style="display: none;">
                        <h2 class="h2Light">Select Device to Delete</h2>
                        <div id="deleteDevicesList" class="devices-list">
                            <!-- Devices will be inserted here -->
                        </div>
                    </div>

                    <!-- Step 3: Confirmation -->
                    <div id="deleteStep3" class="step" style="display: none;">
                        <h2 class="h2Light">Confirm Deletion</h2>
                        <div class="delete-confirmation">
                            <div id="deleteConfirmationMessage" class="confirmation-message"></div>
                            <div class="confirmation-buttons">
                                <button id="cancelDelete" style="width: 50%;" class="buttonHome greenishButton">
                                    Cancel
                                </button>
                                <button id="confirmDelete" style="width: 50%;" class="buttonHome darkishgreenishButton">
                                    Confirm
                                </button>
                            </div>
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
    const closeButton = document.querySelector('#deleteDeviceModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent event bubbling
            closeModal();
        });
    }

    // Cancel deletion button
    document.getElementById('cancelDelete').addEventListener('click', () => {
        closeModal();
    });

    // Confirm deletion button
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        if (selectedDevice !== null) {
            // Device deletion
            await deleteDeviceFromRoom();
        } else if (selectedRoom !== null) {
            // Room deletion
            await deleteRoom();
        }
        
        closeModal();
        location.reload();
    });
}

async function loadRooms() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        const roomsRef = ref(database, `offices/${officeID}/rooms`);
        const snapshot = await get(roomsRef);
        
        const roomsList = document.getElementById('deleteRoomsList');
        roomsList.innerHTML = '';

        if (snapshot.exists()) {
            Object.keys(snapshot.val()).forEach(roomName => {
                const roomContainer = document.createElement('div');
                roomContainer.className = 'room-container';
                
                const roomButton = document.createElement('button');
                roomButton.className = 'room-button buttonHome yellowishButton';
                roomButton.textContent = roomName;
                roomButton.onclick = () => {
                    selectedRoom = roomName;
                    selectedDevice = null; // Reset selected device when changing rooms
                    deviceIndex = null;
                    showStep(2);
                };
                
                const deleteRoomButton = document.createElement('button');
                deleteRoomButton.className = 'delete-room-button';
                deleteRoomButton.innerHTML = '&times;';
                deleteRoomButton.title = 'Delete Room';
                deleteRoomButton.onclick = (e) => {
                    e.stopPropagation();
                    selectedRoom = roomName;
                    selectedDevice = null;
                    deviceIndex = null;
                    document.getElementById('deleteConfirmationMessage').innerHTML = `
                        <p>Are you sure you want to delete the room <strong>${roomName}</strong> and all its devices?</p>
                        <p class="warning-text">This action cannot be undone!</p>
                    `;
                    showStep(3);
                };
                
                roomContainer.appendChild(roomButton);
                roomContainer.appendChild(deleteRoomButton);
                roomsList.appendChild(roomContainer);
            });
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

async function loadDevices() {
    try {
        console.log('Loading devices for room:', selectedRoom);
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        const roomRef = ref(database, `offices/${officeID}/rooms/${selectedRoom}`);
        const snapshot = await get(roomRef);
        
        const devicesList = document.getElementById('deleteDevicesList');
        devicesList.innerHTML = '';
        
        console.log('Device types available:', deviceTypes);

        if (snapshot.exists()) {
            const roomData = snapshot.val();
            console.log('Room data retrieved:', roomData);
            
            // Handle different potential data structures
            let devices = [];
            if (Array.isArray(roomData)) {
                devices = roomData;
                console.log('Room data is an array with', devices.length, 'devices');
            } else if (typeof roomData === 'object') {
                devices = Object.values(roomData);
                console.log('Room data is an object with', devices.length, 'devices');
            }
            
            devices.forEach((device, index) => {
                console.log('Processing device:', device);
                // Skip if device is not valid
                if (!device || typeof device !== 'object') {
                    console.warn('Invalid device data found:', device);
                    return;
                }
                
                const deviceOption = document.createElement('div');
                deviceOption.className = 'device-option delete-device-option';
                
                // Get the icon path based on device type
                let iconPath = './images/icons/error icon inverted.png';
                try {
                    if (device.type && deviceTypes[device.type]) {
                        iconPath = deviceTypes[device.type];
                    }
                } catch (error) {
                    console.error('Error getting device icon:', error);
                }
                
                const deviceName = device.name || 'Unknown Device';
                const deviceType = device.type || 'Unknown Type';
                
                deviceOption.innerHTML = `
                    <img src="${iconPath}" alt="${deviceType}">
                    <span>${deviceName}</span>
                `;
                
                deviceOption.onclick = () => {
                    selectedDevice = device;
                    deviceIndex = index;
                    document.getElementById('deleteConfirmationMessage').innerHTML = `
                        <p>Are you sure you want to delete the device <strong>${device.name}</strong> from room <strong>${selectedRoom}</strong>?</p>
                        <p class="warning-text">This action cannot be undone!</p>
                    `;
                    showStep(3);
                };
                
                devicesList.appendChild(deviceOption);
            });
            
            if (devices.length === 0) {
                console.log('No devices found for this room');
                devicesList.innerHTML = '<div class="no-devices-message">No devices in this room</div>';
            }
        } else {
            console.log('Room does not exist or has no data');
            devicesList.innerHTML = '<div class="no-devices-message">No devices in this room</div>';
        }
    } catch (error) {
        console.error('Error loading devices:', error);
        devicesList.innerHTML = '<div class="no-devices-message">Error loading devices</div>';
    }
    console.log('Finished loading devices');
}

async function deleteDeviceFromRoom() {
    try {
        console.log('Deleting device', selectedDevice.name, 'from room', selectedRoom, 'at index', deviceIndex);
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        
        // Get current devices in the room
        const roomRef = ref(database, `offices/${officeID}/rooms/${selectedRoom}`);
        const snapshot = await get(roomRef);
        
        if (snapshot.exists()) {
            const roomData = snapshot.val();
            console.log('Current room data:', roomData);
            
            // Make sure we handle both array and object structures
            let devices = [];
            let isArray = Array.isArray(roomData);
            
            if (isArray) {
                devices = [...roomData]; // Clone the array
            } else if (typeof roomData === 'object') {
                // Convert object to array if needed
                devices = Object.values(roomData);
            }
            
            console.log('Devices before deletion:', devices);
            console.log('Removing device at index:', deviceIndex);
            
            // Remove the device at the specified index
            if (deviceIndex >= 0 && deviceIndex < devices.length) {
                devices.splice(deviceIndex, 1);
                console.log('Devices after deletion:', devices);
                
                // Update the room with the modified devices array
                await update(ref(database), {
                    [`offices/${officeID}/rooms/${selectedRoom}`]: devices
                });
                
                console.log(`Device ${selectedDevice.name} deleted from ${selectedRoom}`);
            } else {
                console.error('Device index out of bounds:', deviceIndex);
            }
        } else {
            console.error('Room not found:', selectedRoom);
        }
    } catch (error) {
        console.error('Error deleting device:', error);
    }
}

async function deleteRoom() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        
        // Remove the entire room
        await update(ref(database), {
            [`offices/${officeID}/rooms/${selectedRoom}`]: null
        });
        
        console.log(`Room ${selectedRoom} deleted`);
    } catch (error) {
        console.error('Error deleting room:', error);
    }
}

function showStep(step) {
    currentStep = step;
    document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
    document.getElementById(`deleteStep${step}`).style.display = 'block';

    if (step === 1) {
        loadRooms();
    } else if (step === 2) {
        loadDevices();
    }
}

// Function to show the modal - make it accessible globally
function showDeleteDevice() {
    const modal = document.getElementById('deleteDeviceModal');
    if (!modal) {
        initialiseDeleteDeviceModal();
    }
    document.getElementById('deleteDeviceModal').style.display = 'block';
    showStep(1);
}

function closeModal() {
    const modal = document.getElementById('deleteDeviceModal');
    modal.style.display = 'none';
    currentStep = 1;
    selectedRoom = null;
    selectedDevice = null;
    deviceIndex = null;
}

// Make showDeleteDevice function globally accessible
window.showDeleteDevice = showDeleteDevice;

// Initialize the modal when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initialiseDeleteDeviceModal();
    
    // Attach event listener to the delete device button in the manage devices page
    const deleteDeviceButton = document.querySelector('.delete-device-button');
    if (deleteDeviceButton) {
        deleteDeviceButton.addEventListener('click', showDeleteDevice);
    }
    
    // Also try with the id selector in case the HTML was updated
    const deleteDeviceBtn = document.getElementById('deleteDeviceBtn');
    if (deleteDeviceBtn) {
        deleteDeviceBtn.addEventListener('click', showDeleteDevice);
    }
});

export { showDeleteDevice };