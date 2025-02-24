import { ref, update, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { deviceTypes, deviceTypesNotInverted } from './device-type.js';

function searchDevicePath(device) {
    return deviceTypes[device.type] || './images/icons/error icon inverted.png';
}

function createDeviceCard(device, roomName, deviceKey) {
    if (!device || typeof device !== 'object') {
        console.error('Invalid device data:', device);
        return document.createElement('div');
    }

    const card = document.createElement('div');
    card.className = `device-card ${device.status === 'On' ? 'device-card-active' : ''}`;
    card.dataset.deviceId = deviceKey;

    const deviceType = device.type ? device.type.charAt(0).toUpperCase() + device.type.slice(1) : 'Unknown';
    
    // Select the appropriate image based on status
    const iconPath = device.status === 'On' ? deviceTypesNotInverted[device.type] : deviceTypes[device.type];

    card.innerHTML = `
        <div class="device-icon-container">
            <img src="${iconPath}" alt="${deviceType}" class="device-icon">
        </div>
        <div class="device-details">
            <div class="device-name">${device.name || 'Unknown Device'}</div>
            <div class="device-type">${deviceType}</div>
        </div>

        <br>
        
        <label class="device-toggle">
            <input type="checkbox" ${device.status === 'On' ? 'checked' : ''}>
            <span class="toggle-slider"></span>
        </label>
    `;

    const toggle = card.querySelector('input[type="checkbox"]');
    toggle.addEventListener('change', (e) => {
        deviceToggle(device, roomName, e.target.checked, deviceKey);
    });

    return card;
}


async function deviceToggle(device, roomName, isOn, deviceKey) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        const devicePath = `offices/${officeID}/rooms/${roomName}/${deviceKey}`;
        const updates = {};
        
        // Update the status in Firebase
        updates[`${devicePath}/status`] = isOn ? 'On' : 'Off';
        
        await update(ref(database), updates);
        
        // Update device state in local memory
        device.status = isOn ? 'On' : 'Off';
        
        // Update the UI immediately
        const deviceCard = document.querySelector(`[data-device-id="${deviceKey}"]`);
        if (deviceCard) {
            deviceCard.classList.toggle('device-card-active', isOn);
            const toggle = deviceCard.querySelector('input[type="checkbox"]');
            if (toggle) {
                toggle.checked = isOn;
            }
        }
    } catch (error) {
        console.error('Error toggling device:', error);
        alert('Failed to update device status. Please try again.');
    }
}

function setupRealtimeUpdates(officeID) {
    const officeRef = ref(database, `offices/${officeID}/rooms`);
    onValue(officeRef, (snapshot) => {
        const rooms = snapshot.val();
        if (rooms) {
            // Store the latest room data
            window._latestRoomData = rooms;
            
            // Update the currently displayed room if it exists
            const activeTab = document.querySelector('.room-tab.active');
            if (activeTab) {
                const roomName = activeTab.textContent;
                if (rooms[roomName]) {
                    updateDevicesGrid(rooms[roomName], roomName);
                }
            }
        }
    });
}

function updateRoomTabs(rooms) {
    const roomTabs = document.getElementById('roomTabs');
    roomTabs.innerHTML = '';
    
    // Store rooms data globally for reference
    window._latestRoomData = rooms;
    
    // Get user data for office ID
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.officeID) {
        setupRealtimeUpdates(userData.officeID);
    }
    
    const roomEntries = Array.isArray(rooms) 
        ? rooms.map((room, index) => [`room ${index + 1}`, room])
        : Object.entries(rooms);
    
    const validRooms = roomEntries.filter(([_, room]) => room !== null);
    
    validRooms.forEach(([roomName, roomData], index) => {
        const tab = document.createElement('div');
        tab.className = `room-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = roomName;
        tab.onclick = () => {
            document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Use the latest room data when switching tabs
            const currentRoomData = window._latestRoomData[roomName];
            updateDevicesGrid(currentRoomData, roomName);
        };
        roomTabs.appendChild(tab);
    });
    
    if (validRooms.length > 0) {
        updateDevicesGrid(validRooms[0][1], validRooms[0][0]);
    }
}

function updateDevicesGrid(roomData, roomName) {
    const devicesGrid = document.getElementById('devicesGrid');
    devicesGrid.innerHTML = '';
    
    const devices = Array.isArray(roomData) ? 
        roomData.map((device, index) => ({ ...device, key: index })) : 
        Object.entries(roomData).map(([key, device]) => ({ ...device, key }));
    
    devices.forEach(device => {
        const card = createDeviceCard(device, roomName, device.key);
        devicesGrid.appendChild(card);
    });
}

function toggleLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    const dashboardContent = document.getElementById('dashboardContent');
    
    if (loadingState) loadingState.style.display = show ? 'block' : 'none';
    if (dashboardContent) dashboardContent.style.display = show ? 'none' : 'block';
}

function updateUserDisplay(userData) {
    document.getElementById('prefName').textContent = userData.prefName || 'User';
    document.getElementById('userRole').textContent = userData.role || 'User';
}

export {
    deviceToggle,
    updateRoomTabs,
    updateUserDisplay,
    toggleLoadingState
};