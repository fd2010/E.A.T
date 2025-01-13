// Define device types with their icons 
const deviceTypes = {
    'Lights': '/frontend/public/icons/Lights-inverted.png',
    'A/C': '/frontend/public/icons/AC(MIT)-inverted.png',
    'Speaker': '/frontend/public/icons/Speaker(MIT)-inverted.png',
    'Projector': '/frontend/public/icons/Projector-inverted.png'
};

// Initialise room counter
let roomCounter = 0;

// Add event listener for the "Add Room" button
document.getElementById('addRoom').addEventListener('click', () => {
    roomCounter++;// Increment room counter

    // Create devices container with styling
    const devicesDiv = document.createElement('div');
    devicesDiv.className = 'devices-container';
    devicesDiv.id = 'roomAddingButtons';
    
    // Create room input HTML
    const roomInput = document.createElement('div');
    roomInput.className = 'form-group';
    roomInput.innerHTML = 
    `
        <label for="room${roomCounter}">Room Name:<span class="info-star" title="Please enter room name">*</span></label>

        <div class="input-container">

            <input type="text" id="room${roomCounter}" name="room${roomCounter}" required>
            <img src="/frontend/public/icons/conferance room icon.png" alt="Conferance Room Icon">

        </div>

        <button type="button" class="buttonHome addDevice" style="background-color: #C1E6E3;">+</button>
        <button type="button" class="buttonHome removeRoom" style="background-color: #ff6b6b;">x</button>
    `;

    // Add room input to devices container
    devicesDiv.appendChild(roomInput);

    // Add devices container to main container
    document.getElementById('roomsContainer').appendChild(devicesDiv);

    // Add event listener for adding devices to room
    roomInput.querySelector('.addDevice').addEventListener('click', () => {
        // Make sure user enters a room name
        const roomName = roomInput.querySelector('.input-container input').value;
        if (!roomName.trim()) {
            alert('Please enter a room name before adding devices');
            return;
        }

        // Create device selection form
        const deviceSelect = document.createElement('div');
        deviceSelect.className = 'form-group';
        
        // Set up device selection form
        deviceSelect.innerHTML = 
        `
        <div id="deviceSelect" style="padding: 15px;">

            <label id="deviceTypeColour">Device Type:<span class="info-star">*</span></label>

            <div class="input-container" style="gap: 5px;">

                <div style="display: flex; flex: 1; border-bottom: 1px solid #FFFFFF;">

                    <select id="deviceTypeColour" style="width: 100%; padding: 12px; border: none; background-color: #9BA87C; font-family: 'Kay Pho Du', sans-serif; font-size: 16px; outline: none;">
                        ${Object.keys(deviceTypes).map(device => 
                            `<option value="${device}" id="deviceTypeColour" style="background-color: #9BA87C;">${device}</option>`
                        ).join('')}
                    </select>

                    <input id="deviceTypeColour" type="text" placeholder="Name" style="width: 100%; border: none; color: #F0F0FF;" class="device-name-input" required>

                </div>

                <button type="button" class="buttonHome addDeviceConfirm addDevice" style="background-color: #C1E6E3; padding: 8px; margin-left: 5px;">Add</button>
                
            </div>
        </div>
        `;

        // Adding styling for the placeholder text 
        const style = document.createElement('style');
        // CSS styling for the placeholder text, using !important to override the default styling
        style.textContent =
        `
            .device-name-input::placeholder {
                color: #F0F0FF !important;
                opacity: 1;
            }
            .device-name-input:-ms-input-placeholder {
                color: #F0F0FF !important;
            }
            .device-name-input::-ms-input-placeholder {
                color: #F0F0FF !important;
            }
        `;
        document.head.appendChild(style);

        // Add device selection form to devices container
        devicesDiv.appendChild(deviceSelect);

        // Add event listener for confirming device addition
        deviceSelect.querySelector('.addDeviceConfirm').addEventListener('click', () => {
            // Get selected device and device name
            const selectedDevice = deviceSelect.querySelector('select').value;
            const deviceName = deviceSelect.querySelector('input').value;
            
            // Make sure user enters a device name
            if (!deviceName.trim()) {
                alert('Please enter a device name');
                return;
            }

            // Create device display element
            const deviceDiv = document.createElement('div');
            deviceDiv.className = 'form-group';
            deviceDiv.id = 'deviceDisplay';

            // Set up device display element
            deviceDiv.innerHTML = 
            `
            <div style="display: flex; align-items: center; width: 100%; justify-content: space-between;">
                
            <div style="display: flex; align-items: center; gap: 10px;">
                   
                    <img src="${deviceTypes[selectedDevice]}" alt="${selectedDevice}" style="width: 24px; height: 24px;">

                    <div style="font-family: 'Kay Pho Du', sans-serif;">

                        <div id="deviceTypeColour">${deviceName}</div>
                        <div id="deviceTypeColour" style="font-size: 12px; color: #F0F0FF;">${selectedDevice}</div>

                    </div>
                </div>

                <button type="button" class="buttonHome removeDevice" style="background-color: #ff6b6b; padding: 5px 10px;">Remove</button>
            
            </div>
            `;

            // Replace selection form with device display
            deviceSelect.replaceWith(deviceDiv);

            // Add event listener for removing device
            deviceDiv.querySelector('.removeDevice').addEventListener('click', () => {
                deviceDiv.remove();
            });
        });
    });

    // Add event listener for removing entire room
    roomInput.querySelector('.removeRoom').addEventListener('click', () => {
        devicesDiv.remove(); // Remove entire container with room and devices
    });
});