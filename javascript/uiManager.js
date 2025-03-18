// UI Manager - Handles all UI-related operations

class UIManager {
    constructor(simulator) {
        this.simulator = simulator;
    }
    
    updateOfficeSelectors() {
        // Update office filter dropdowns
        const officeFilter = document.getElementById('officeFilter');
        const roomOfficeFilter = document.getElementById('roomOfficeFilter');
        
        // Clear existing options except the "All" option
        while (officeFilter.options.length > 1) {
            officeFilter.remove(1);
        }
        
        while (roomOfficeFilter.options.length > 1) {
            roomOfficeFilter.remove(1);
        }
        
        // Add office options
        for (const officeId of Object.keys(this.simulator.officesData)) {
            const option1 = document.createElement('option');
            option1.value = officeId;
            option1.textContent = `Office: ${officeId}`;
            officeFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = officeId;
            option2.textContent = `Office: ${officeId}`;
            roomOfficeFilter.appendChild(option2);
        }
        
        // Add event listeners
        officeFilter.addEventListener('change', (e) => {
            const selectedOffice = e.target.value;
            this.filterReadingsByOffice(selectedOffice);
        });
        
        roomOfficeFilter.addEventListener('change', (e) => {
            const selectedOffice = e.target.value;
            this.filterRoomsByOffice(selectedOffice);
        });
    }
    
    updateOfficeTabs() {
        const officeTabsContainer = document.getElementById('officeTabs');
        
        // Clear existing tabs except "All Offices"
        const allOfficesTab = officeTabsContainer.querySelector('[data-office="all"]');
        officeTabsContainer.innerHTML = '';
        officeTabsContainer.appendChild(allOfficesTab);
        
        // Add tab for each office
        for (const officeId of Object.keys(this.simulator.officesData)) {
            const tab = document.createElement('div');
            tab.className = 'office-tab';
            tab.dataset.office = officeId;
            tab.textContent = `Office: ${officeId}`;
            tab.addEventListener('click', () => {
                this.selectOfficeTab(officeId);
            });
            officeTabsContainer.appendChild(tab);
        }
        
        // Add event listener to "All Offices" tab
        allOfficesTab.addEventListener('click', () => {
            this.selectOfficeTab('all');
        });
        
        // Set initial active tab
        this.selectOfficeTab('all');
    }
    
    selectOfficeTab(officeId) {
        // Update active tab
        const tabs = document.querySelectorAll('.office-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.office === officeId);
        });
        
        // Update selected office
        this.simulator.selectedOffice = officeId;
        
        // Update UI based on selected office
        this.filterRoomsByOffice(officeId);
        this.filterReadingsByOffice(officeId);
        this.updateMetricsDisplay();
    }
    
    updateMetricsDisplay() {
        const metricsContainer = document.getElementById('officeMetrics');
        metricsContainer.innerHTML = '';
        
        // Display metrics for selected office
        const metrics = this.simulator.officeMetrics[this.simulator.selectedOffice];
        
        if (!metrics) return;
        
        // Create metrics
        const deviceCountMetric = this.createMetricElement('Total Devices', metrics.deviceCount);
        const activeDevicesMetric = this.createMetricElement('Active Devices', metrics.activeDevices);
        const roomCountMetric = this.createMetricElement('Rooms', metrics.roomCount);
        const costMetric = this.createMetricElement('Est. Cost/hr', `£${((metrics.totalPower / 1000) * this.simulator.costPerKwh).toFixed(2)}`);
        
        // Add total expenses metric
        const totalExpensesMetric = this.createMetricElement('Total Expenses', `£${this.simulator.officeTotalExpenses[this.simulator.selectedOffice].toFixed(2)}`);
        
        // Add to container
        metricsContainer.appendChild(deviceCountMetric);
        metricsContainer.appendChild(activeDevicesMetric);
        metricsContainer.appendChild(roomCountMetric);
        metricsContainer.appendChild(costMetric);
        metricsContainer.appendChild(totalExpensesMetric);
    }
    
    createMetricElement(label, value) {
        const metricEl = document.createElement('div');
        metricEl.className = 'office-metric';
        metricEl.innerHTML = `
            <h4>${label}</h4>
            <div class="value">${value}</div>
        `;
        return metricEl;
    }
    
    updateRoomsUI() {
        const roomsContainer = document.getElementById('roomsContainer');
        roomsContainer.innerHTML = '';
        
        if (!this.simulator.officesData || Object.keys(this.simulator.officesData).length === 0) {
            roomsContainer.innerHTML = '<div>No offices or rooms found in Firebase.</div>';
            return;
        }
        
        // For each office
        for (const [officeId, officeData] of Object.entries(this.simulator.officesData)) {
            // Skip if not the selected office and not showing all
            if (this.simulator.selectedOffice !== 'all' && this.simulator.selectedOffice !== officeId) {
                continue;
            }
            
            if (!officeData.rooms) continue;
            
            // Track room count for metrics
            this.simulator.officeMetrics[officeId].roomCount = Object.keys(officeData.rooms).length;
            if (this.simulator.selectedOffice === 'all') {
                this.simulator.officeMetrics.all.roomCount += Object.keys(officeData.rooms).length;
            }
            
            // For each room in the office
            for (const [roomName, devices] of Object.entries(officeData.rooms)) {
                const roomCard = document.createElement('div');
                roomCard.className = 'room-card';
                roomCard.dataset.office = officeId;
                roomCard.innerHTML = `
                    <h3>${roomName} <small>(Office: ${officeId})</small></h3>
                    <div class="devices" id="room-${officeId}-${roomName.replace(/\s+/g, '-')}">
                        <div>Loading devices...</div>
                    </div>
                `;
                roomsContainer.appendChild(roomCard);
                
                // Add devices to room
                this.updateRoomDevices(officeId, roomName, devices);
            }
        }
        
        // Update metrics display
        this.updateMetricsDisplay();
    }
    
    updateRoomDevices(officeId, roomName, devices) {
        const roomDevicesEl = document.getElementById(`room-${officeId}-${roomName.replace(/\s+/g, '-')}`);
        roomDevicesEl.innerHTML = '';
        
        if (!devices || Object.keys(devices).length === 0) {
            roomDevicesEl.innerHTML = '<div>No devices in this room.</div>';
            return;
        }
        
        // Process each device in the room
        let devicesArray = [];
        
        // Check if devices is an array or object
        if (Array.isArray(devices)) {
            devicesArray = devices.filter(device => device !== null);
        } else {
            // If it's an object, convert to array
            for (const [deviceId, device] of Object.entries(devices)) {
                if (device !== null) {
                    devicesArray.push({
                        ...device,
                        id: deviceId
                    });
                }
            }
        }
        
        // Update device count metrics
        this.simulator.officeMetrics[officeId].deviceCount += devicesArray.length;
        this.simulator.officeMetrics.all.deviceCount += devicesArray.length;
        
        // Count active devices for metrics
        const activeDevices = devicesArray.filter(device => device.status === 'On').length;
        this.simulator.officeMetrics[officeId].activeDevices += activeDevices;
        this.simulator.officeMetrics.all.activeDevices += activeDevices;
        
        // Render devices
        for (const device of devicesArray) {
            const deviceEl = document.createElement('div');
            deviceEl.className = 'device-row';
            deviceEl.innerHTML = `
                <div>
                    <span class="device-status ${device.status === 'On' ? 'on' : 'off'}"></span>
                    <strong>${device.name}</strong> (${device.type})
                </div>
                <div class="device-power" id="device-power-${officeId}-${roomName.replace(/\s+/g, '-')}-${device.name.replace(/\s+/g, '-')}">
                    0.00 W
                </div>
            `;
            roomDevicesEl.appendChild(deviceEl);
        }
    }
    
    filterRoomsByOffice(officeId) {
        const roomCards = document.querySelectorAll('.room-card');
        
        if (officeId === 'all') {
            // Show all rooms
            roomCards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            // Show only rooms for the selected office
            roomCards.forEach(card => {
                card.style.display = card.dataset.office === officeId ? 'block' : 'none';
            });
        }
    }
    
    filterReadingsByOffice(officeId) {
        const readings = document.querySelectorAll('.reading');
        
        if (officeId === 'all') {
            // Show all readings
            readings.forEach(reading => {
                reading.style.display = 'block';
            });
        } else {
            // Show only readings for the selected office
            readings.forEach(reading => {
                const offices = reading.dataset.offices.split(',');
                reading.style.display = offices.includes(officeId) ? 'block' : 'none';
            });
        }
    }
    
    displayReading(reading, elapsedHours) {
        const readingsEl = document.getElementById('readings');
        const readingEl = document.createElement('div');
        readingEl.className = 'reading';
        
        // Set data attribute for filtering
        readingEl.dataset.offices = Object.keys(reading.officeReadings).join(',');
        
        // Hide if not the selected office and not showing all
        if (this.simulator.selectedOffice !== 'all' && !readingEl.dataset.offices.includes(this.simulator.selectedOffice)) {
            readingEl.style.display = 'none';
        }
        
        // Calculate cost per hour
        const costPerHour = (reading.totalWatts / 1000) * this.simulator.costPerKwh;
        
        // Format timestamp
        const time = reading.timestamp.toLocaleTimeString();
        const date = reading.timestamp.toLocaleDateString();
        
        // Get active devices count
        let totalActiveDevices = 0;
        
        // Track office-specific data
        let officeDetails = '';
        
        for (const officeId in reading.officeReadings) {
            const officePower = reading.officeReadings[officeId].totalPower;
            const officeCost = (officePower / 1000) * this.simulator.costPerKwh;
            
            // Count active devices
            let officeActiveDevices = 0;
            for (const roomName in reading.officeReadings[officeId].rooms) {
                officeActiveDevices += reading.officeReadings[officeId].rooms[roomName].activeDevices;
            }
            totalActiveDevices += officeActiveDevices;
            
            // Add office details
            officeDetails += `
                <div class="office-reading" data-office="${officeId}">
                    <strong>Office ${officeId}:</strong> 
                    Power: ${officePower.toFixed(2)}W, 
                    Active Devices: ${officeActiveDevices}, 
                    Cost: £${officeCost.toFixed(4)}/hr,
                    Total Expense: £${this.simulator.officeTotalExpenses[officeId].toFixed(2)}
                </div>
            `;
        }
        
        readingEl.innerHTML = `
            <strong>${date} ${time}</strong> - 
            <span>Voltage: ${reading.voltage.toFixed(2)}V</span>,
            <span>Total Power: ${reading.totalWatts.toFixed(2)}W</span>,
            <span>Active Devices: ${totalActiveDevices}</span>,
            <span>Cost: £${costPerHour.toFixed(4)}/hr</span>
            <div class="reading-details">
                ${officeDetails}
            </div>
        `;
        
        readingsEl.insertBefore(readingEl, readingsEl.firstChild);
    }
    
    updateDashboard(voltage, watts) {
        document.getElementById('currentVoltage').textContent = `${voltage.toFixed(2)} V`;
        document.getElementById('currentPower').textContent = `${watts.toFixed(2)} W`;
        
        const costPerHour = (watts / 1000) * this.simulator.costPerKwh;
        document.getElementById('currentCost').textContent = `£${costPerHour.toFixed(4)}/hr`;
    }
    
    updateStartStopButton(isRunning) {
        const startStopButton = document.getElementById('startStopButton');
        
        if (isRunning) {
            startStopButton.textContent = 'Stop Simulation';
            startStopButton.classList.add('stop');
            
            // Create reset expenses button if it doesn't exist
            if (!document.getElementById('resetExpensesButton')) {
                const controlsContainer = startStopButton.parentElement;
                const resetButton = document.createElement('button');
                resetButton.id = 'resetExpensesButton';
                resetButton.textContent = 'Reset Total Expenses';
                resetButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset all total expenses to zero?')) {
                        this.simulator.resetTotalExpenses();
                    }
                });
                controlsContainer.appendChild(resetButton);
            }
        } else {
            startStopButton.textContent = 'Start Simulation';
            startStopButton.classList.remove('stop');
        }
    }
}

export default UIManager;