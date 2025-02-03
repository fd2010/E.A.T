// Device icons mapping with actual image paths
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
    // Check if device.type exists in the deviceTypes object
    if (deviceTypes[device.type]) {
        return deviceTypes[device.type];
    } else {
        return './images/icons/error icon inverted.png'; 
    }
}


// Function to create device card
function createDeviceCard(device, roomName) {
    const card = document.createElement('div');
    card.className = 'device-card';
    
    // Determine the correct icon path based on device type
    const deviceType = device.type.charAt(0).toUpperCase() + device.type.slice(1); // Capitalise first letter
    const iconPath = searchDevicePath(device);
    
    card.innerHTML = `
        <div class="device-info">
            <img src="${iconPath}" alt="${device.type}" class="device-icon">

            <div class="device-details">

                <div class="device-name">${device.name}</div>
                <div class="device-type">${device.type}</div>

            </div>
        </div>

        <label class="device-toggle">

            <input type="checkbox" ${device.status === 'On' ? 'checked' : ''}>
            <span class="toggle-slider"></span>

        </label>
    `;

    // Add event listener for toggle
    const toggle = card.querySelector('input[type="checkbox"]');
    toggle.addEventListener('change', (e) => {
        deviceToggle(device, roomName, e.target.checked);
    });

    return card;
}

// Function to handle device toggle
async function deviceToggle(device, roomName, isOn) {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const officeID = userData.officeID;
        
        const devicePath = `offices/${officeID}/rooms/${roomName}`;
        
        const roomRef = ref(database, devicePath);
        const updates = {};
        
        updates[`${devicePath}/${device.name}/status`] = isOn ? 'On' : 'Off';
        
        await update(ref(database), updates);
        
        const deviceCard = document.querySelector(`.device-card:has(> .device-info > .device-details > .device-name:contains('${device.name}'))`);
        if (deviceCard) {
            // Toggle active class
            deviceCard.classList.toggle('device-card-active', isOn);
            
            // Update image
            const deviceIcon = deviceCard.querySelector('.device-icon');
            const currentPath = deviceIcon.src;
            const newPath = isOn ? 
                deviceTypesNotInveted[device.type] :
                deviceTypes[device.type];
            
            deviceIcon.src = newPath;
        }
    } catch (error) {
        console.error('Error toggling device:', error);
        alert('Failed to update device status. Please try again.');
    }
}

// Function to update room tabs
function updateRoomTabs(rooms) {
    const roomTabs = document.getElementById('roomTabs');
    roomTabs.innerHTML = '';
    
    Object.keys(rooms).forEach((roomName, index) => {
        const tab = document.createElement('div');
        tab.className = `room-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = roomName;
        tab.onclick = () => {
            document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateDevicesGrid(rooms[roomName], roomName);
        };
        roomTabs.appendChild(tab);
    });
    
    // Show devices for first room by default
    if (Object.keys(rooms).length > 0) {
        const firstRoom = Object.keys(rooms)[0];
        updateDevicesGrid(rooms[firstRoom], firstRoom);
    }
}

// Function to update devices grid
function updateDevicesGrid(devices, roomName) {
    const devicesGrid = document.getElementById('devicesGrid');
    devicesGrid.innerHTML = '';
    
    devices.forEach(device => {
        const card = createDeviceCard(device, roomName);
        devicesGrid.appendChild(card);
    });
}

// Function to show/hide loading state
function toggleLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    const dashboardContent = document.getElementById('dashboardContent');
    
    if (loadingState) loadingState.style.display = show ? 'block' : 'none';
    if (dashboardContent) dashboardContent.style.display = show ? 'none' : 'block';
}

// Function to update user display information
function updateUserDisplay(userData) {
    document.getElementById('prefName').textContent = userData.prefName || 'User';
    document.getElementById('userRole').textContent = userData.role || 'User';
}

// Export functions to be used in dashboard.js
export {
    updateRoomTabs,
    updateUserDisplay,
    toggleLoadingState
};