// Define device types with their icon's'
const deviceTypes = {
    'Lights': '../../../public/icons/Lights.png',
    'A/C': '../../../public/icons/AC(MIT).png',
    'Speaker': '../../../public/icons/Speaker(MIT).png',
    'Projector': '../../../public/icons/Projector.png'
};

// initialise room counter
let roomCounter = 0;

// ADd event listener for the "Add Room" button
document.getElementById('addRoom').addEventListener('click', () => {
    roomCounter++;// increment room counter

    // Create a new room div
    const roomDiv = document.createElement('div');
    roomDiv.className = 'form-group';

    // Set up room HTML stuff
    roomDiv.innerHTML = 
    `
        <label for="room${roomCounter}">Room Name:<span class="info-star" title="Please enter room name">*</span></label>

        <div class="input-container">
            <input type="text" id="room${roomCounter}" name="room${roomCounter}" required>
            <img src="../../../public/icons/conferance room icon.png" alt="Conferance Room Icon">
        </div>

        <button type="button" class="buttonHome addDevice" style="background-color: #C1E6E3; width: auto; padding: 8px;">+</button>
        <button type="button" class="buttonHome removeRoom" style="background-color: #ff6b6b; width: auto; padding: 8px;">x</button>
    `;

    // Create div for the devices in this room
    const devicesDiv = document.createElement('div');
    devicesDiv.className = 'devices-container';

    // Applying styles to the devices div **MAY NEED TO UPDATE**
    devicesDiv.style.width = '80%';
    devicesDiv.style.marginLeft = 'auto';
    devicesDiv.style.marginRight = 'auto';

    // Add room and devices div to main div (roomsContainer)
    document.getElementById('roomsContainer').appendChild(roomDiv);
    document.getElementById('roomsContainer').appendChild(devicesDiv);

    // Add event listener for adding devices to room
    roomDiv.querySelector('.addDevice').addEventListener('click', () => {

        // Create device selection form
        const deviceSelect = document.createElement('div');
        deviceSelect.className = 'form-group';

        //set up device selection form
        deviceSelect.innerHTML = 
        `
            <label>Device Type:<span class="info-star">*</span></label>

            <div class="input-container" style="gap: 5px;">

                <select style="width: 100%; padding: 12px; border: none; border-bottom: 1px solid #000; background-color: transparent; font-family: 'Kay Pho Du', sans-serif; font-size: 16px; outline: none;">
                    
                ${Object.keys(deviceTypes).map(device => 
                        `<option value="${device}">${device}</option>`
                    ).join('')}

                </select>

                <input type="text" placeholder="Name" style="width: 100%;" required>
                
                <button type="button" class="buttonHome addDeviceConfirm" style="background-color: #C1E6E3; padding: 8px; margin-left: -60px;">Add</button>

            </div>
        `;

        // Add device selection form to devices div
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

            // Apply styles to device display element
            deviceDiv.style.backgroundColor = ' #DBC99F;';
            deviceDiv.style.padding = '15px';
            deviceDiv.style.borderRadius = '8px';
            deviceDiv.style.marginTop = '10px';

            // Set up device display element
            deviceDiv.innerHTML = 
            `
                <div style="display: flex; align-items: center; width: 100%; justify-content: space-between;">

                    <div style="display: flex; align-items: center; gap: 10px;">

                        <img src="${deviceTypes[selectedDevice]}" alt="${selectedDevice}" style="width: 24px; height: 24px;">

                        <div style="font-family: 'Kay Pho Du', sans-serif;">
                            <div>${deviceName}</div>
                            <div style="font-size: 12px; color: #666;">${selectedDevice}</div>
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
    roomDiv.querySelector('.removeRoom').addEventListener('click', () => {
        roomDiv.remove(); // remove room
        devicesDiv.remove(); //remove all devices
    }); 
});