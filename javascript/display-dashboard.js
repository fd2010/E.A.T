import { ref, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

const deviceTypes = {
    'Lights': './images/icons/Lights-inverted.png',
    'A/C': './images/icons/AC(MIT)-inverted.png',
    'Speaker': './images/icons/Speaker(MIT)-inverted.png',
    'Projector': './images/icons/Projector-inverted.png'
};

const deviceTypesNotInveted = {
    'Lights': './images/icons/Lights.png',
    'A/C': './images/icons/AC(MIT).png',
    'Speaker': './images/icons/Speaker(MIT).png',
    'Projector': './images/icons/Projector.png'
};

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
    
    const deviceType = device.type ? device.type.charAt(0).toUpperCase() + device.type.slice(1) : 'Unknown';
    const iconPath = device.type ? searchDevicePath(device) : './images/icons/error icon inverted.png';
    
    card.innerHTML = `
        <div class="device-info">
            <img src="${iconPath}" alt="${deviceType}" class="device-icon">
            <div class="device-details">
                <div class="device-name">${device.name || 'Unknown Device'}</div>
                <div class="device-type">${deviceType}</div>
            </div>
        </div>
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
        
        // Find the device card and update its class and checkbox state
        const deviceCards = document.querySelectorAll('.device-card');
        deviceCards.forEach(card => {
            const deviceNameElement = card.querySelector('.device-name');
            if (deviceNameElement && deviceNameElement.textContent === device.name) {
                card.classList.toggle('device-card-active', isOn);
                const toggle = card.querySelector('input[type="checkbox"]');
                if (toggle) {
                    toggle.checked = isOn;
                }
            }
        });
    } catch (error) {
        console.error('Error toggling device:', error);
        alert('Failed to update device status. Please try again.');
    }
}

function updateRoomTabs(rooms) {
    const roomTabs = document.getElementById('roomTabs');
    roomTabs.innerHTML = '';
    
    // Handle both array and object room structures
    const roomEntries = Array.isArray(rooms) 
        ? rooms.map((room, index) => [`room ${index + 1}`, room])
        : Object.entries(rooms);
    
    // Filter out null values
    const validRooms = roomEntries.filter(([_, room]) => room !== null);
    
    validRooms.forEach(([roomName, roomData], index) => {
        const tab = document.createElement('div');
        tab.className = `room-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = roomName;
        tab.onclick = () => {
            document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateDevicesGrid(roomData, roomName);
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
    
    // Handle both array and object room structures
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