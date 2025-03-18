//This is a backup for the simulator things

// Import Firebase modules correctly for simulator.js
import { onValue, ref, set, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

class SmartMeterSimulator {
    constructor() {
        // Device power specifications (same as in Python)
        this.deviceSpecs = {
            'Desktop Computer': { wattsRange: [80, 175] },
            'Laptop': { wattsRange: [20, 50] },
            'Printer': { wattsRange: [30, 350] },
            'Coffee Machine': { wattsRange: [200, 1200] },
            'Monitor': { wattsRange: [20, 40] },
            'Server': { wattsRange: [200, 500] },
            'A/C': { wattsRange: [500, 1500] },
            'Lights': { wattsRange: [10, 100] },
            'Projector': { wattsRange: [150, 300] },
            'Speaker': { wattsRange: [15, 80] },         
            'Electric Hoover': { wattsRange: [30, 70] },
            'Electronic Desk': { wattsRange: [50, 150] } 
        };
        
        // Simulation variables
        this.isRunning = false;
        this.interval = 5; // seconds
        this.intervalId = null;
        this.readings = [];
        this.costPerKwh = 0.28; // £0.28 per kWh (28 pence)
        
        // Firebase data
        this.officesData = {};
        this.connectedToFirebase = false;
        
        // Currently selected office for filtering views
        this.selectedOffice = 'all';
        
        // Per-office metrics
        this.officeMetrics = {};
        
        // Total expenses tracking for each office
        this.officeTotalExpenses = {
            all: 0
        };
        
        // Track the last reading timestamp to calculate elapsed time
        this.lastReadingTimestamp = null;
        
        // Initialize energy consumption data
        this.energyConsumptionData = {
            energy: {
                daily: [0, 0, 0, 0, 0],
                weekly: [0, 0, 0, 0, 0, 0, 0],
                monthly: [0, 0, 0, 0]
            },
            cost: {
                daily: [0, 0, 0, 0, 0],
                weekly: [0, 0, 0, 0, 0, 0, 0],
                monthly: [0, 0, 0, 0]
            },
            areaUsage: {},
            deviceUsage: {},
            readingCount: 0
        };
        
        // Connect to Firebase
        this.connectToFirebase();
        
        // Also connect to the energy-consumed database
        this.connectToEnergyConsumedDatabase();
    }
    
    connectToFirebase() {
        const dbStatus = document.getElementById('databaseStatus');
        
        // Listen for offices data
        onValue(ref(database, 'offices'), (snapshot) => {
            if (snapshot.exists()) {
                this.officesData = snapshot.val();
                this.connectedToFirebase = true;
                dbStatus.innerHTML = `<span class="success">Connected to Firebase. Found ${Object.keys(this.officesData).length} offices.</span>`;
                
                // Update office lists in UI
                this.updateOfficeSelectors();
                
                // Update office tabs
                this.updateOfficeTabs();
                
                // Initialize office metrics
                this.initializeOfficeMetrics();
                
                // Update rooms UI
                this.updateRoomsUI();
            } else {
                dbStatus.innerHTML = `<span class="error">No offices found in Firebase database.</span>`;
            }
        }, (error) => {
            console.error("Firebase error:", error);
            dbStatus.innerHTML = `<span class="error">Error connecting to Firebase: ${error.message}</span>`;
        });
    }
    
    initializeEnergyConsumedDatabase() {
        console.log("Initializing energy-consumed database structure");
        
        // Create initial structure for energy consumption data
        set(ref(database, 'energy-consumed'), {
            offices: {},
            aggregated: {
                energy: {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                },
                cost: {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                },
                areaUsage: {},
                deviceUsage: {}
            }
        });
    }
    
    connectToEnergyConsumedDatabase() {
        // Check if we can connect to the 'energy-consumed' node
        onValue(ref(database, 'energy-consumed'), (snapshot) => {
            console.log('Connected to Firebase energy-consumed database');
            
            // Initialize the database structure if it doesn't exist
            if (!snapshot.exists()) {
                this.initializeEnergyConsumedDatabase();
            } else {
                console.log('Energy-consumed database already exists');
                
                // Load existing aggregated data if available
                if (snapshot.val().aggregated) {
                    this.loadExistingConsumptionData(snapshot.val().aggregated);
                }
            }
            
        }, (error) => {
            console.error("Firebase energy-consumed error:", error);
        });
    }
    
    loadExistingConsumptionData(data) {
        // Initialize our tracking objects if they don't exist
        if (!this.energyConsumptionData) {
            this.energyConsumptionData = {
                energy: {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                },
                cost: {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                },
                areaUsage: {},
                deviceUsage: {},
                readingCount: 0
            };
        }
        
        // Load existing data if available
        if (data.energy) {
            if (data.energy.daily && Array.isArray(data.energy.daily)) {
                this.energyConsumptionData.energy.daily = data.energy.daily;
            }
            if (data.energy.weekly && Array.isArray(data.energy.weekly)) {
                this.energyConsumptionData.energy.weekly = data.energy.weekly;
            }
            if (data.energy.monthly && Array.isArray(data.energy.monthly)) {
                this.energyConsumptionData.energy.monthly = data.energy.monthly;
            }
        }
        
        if (data.cost) {
            if (data.cost.daily && Array.isArray(data.cost.daily)) {
                this.energyConsumptionData.cost.daily = data.cost.daily;
            }
            if (data.cost.weekly && Array.isArray(data.cost.weekly)) {
                this.energyConsumptionData.cost.weekly = data.cost.weekly;
            }
            if (data.cost.monthly && Array.isArray(data.cost.monthly)) {
                this.energyConsumptionData.cost.monthly = data.cost.monthly;
            }
        }
        
        if (data.areaUsage) {
            this.energyConsumptionData.areaUsage = {...data.areaUsage};
        }
        
        if (data.deviceUsage) {
            this.energyConsumptionData.deviceUsage = {...data.deviceUsage};
        }
    }
    
    // Helper method to sanitize keys for Firebase
    sanitizeFirebaseKey(key) {
        // Replace characters that Firebase doesn't allow in keys
        return key.replace(/[.#$\/\[\]]/g, '_');
    }
    
    // Helper method to sanitize all keys in the reading object
    sanitizeReadingKeys(reading) {
        // Create a deep clone of the reading object
        const sanitizedReading = JSON.parse(JSON.stringify(reading));
        
        // Sanitize device names in each office and room
        for (const officeId in sanitizedReading.officeReadings) {
            const officeData = sanitizedReading.officeReadings[officeId];
            
            for (const roomName in officeData.rooms) {
                const roomData = officeData.rooms[roomName];
                const sanitizedDevices = {};
                
                // Sanitize each device name (key)
                for (const deviceName in roomData.devices) {
                    const sanitizedDeviceName = this.sanitizeFirebaseKey(deviceName);
                    sanitizedDevices[sanitizedDeviceName] = roomData.devices[deviceName];
                }
                
                // Replace with sanitized devices
                roomData.devices = sanitizedDevices;
            }
        }
        
        return sanitizedReading;
    }
    
    // Method to save energy consumption data to Firebase
    saveEnergyConsumptionToFirebase(reading) {
        if (!reading || !this.connectedToFirebase) return false;
        
        // Sanitize all keys in the reading object to make Firebase-safe
        const sanitizedReading = this.sanitizeReadingKeys(reading);
        
        // Add the individual reading to Firebase
        const readingsRef = ref(database, 'energy-consumed/readings');
        const newReadingRef = push(readingsRef);
        set(newReadingRef, sanitizedReading);
        
        // Save aggregated office data
        this.saveOfficeDataToFirebase(sanitizedReading);
        
        // Update aggregated data for visualization
        this.updateConsumptionAggregatedData(sanitizedReading);
        
        return true;
    }

    // Method to save office-specific data to Firebase
    saveOfficeDataToFirebase(reading) {
        for (const officeId in reading.officeReadings) {
            const officeData = reading.officeReadings[officeId];
            const officeRef = ref(database, `energy-consumed/offices/${officeId}`);
            
            // Add timestamp and total power for this reading
            const officeReading = {
                timestamp: reading.timestamp.getTime(),
                formattedTime: reading.timestamp.toLocaleString(),
                totalPower: officeData.totalPower,
                totalCost: (officeData.totalPower / 1000) * this.costPerKwh,
                rooms: {}
            };
            
            // Add room-specific data
            for (const roomName in officeData.rooms) {
                const roomData = officeData.rooms[roomName];
                officeReading.rooms[roomName] = {
                    totalPower: roomData.totalPower,
                    activeDevices: roomData.activeDevices,
                    totalDevices: roomData.totalDevices,
                    devices: roomData.devices
                };
            }
            
            // Save this office reading to Firebase
            push(ref(database, `energy-consumed/offices/${officeId}/readings`), officeReading);
            
            // Update the current state for this office
            set(ref(database, `energy-consumed/offices/${officeId}/current`), {
                timestamp: reading.timestamp.getTime(),
                formattedTime: reading.timestamp.toLocaleString(),
                totalPower: officeData.totalPower,
                totalCost: (officeData.totalPower / 1000) * this.costPerKwh,
                totalExpense: this.officeTotalExpenses[officeId]
            });
        }
    }

    // Method to update aggregated data for visualizations
    updateConsumptionAggregatedData(reading) {
        // Increment reading count
        this.energyConsumptionData.readingCount++;
        
        // Convert watts to kWh for this time period
        // Assuming each reading represents a time period of 'this.interval' seconds
        const kwhForThisInterval = (reading.totalWatts / 1000) * (this.interval / 3600);
        
        // Calculate cost for this interval
        const costForThisInterval = kwhForThisInterval * this.costPerKwh;
        
        // Update daily data (total energy in kWh for this interval)
        const dailyIndex = this.energyConsumptionData.readingCount % 5;
        this.energyConsumptionData.energy.daily[dailyIndex] = kwhForThisInterval;
        this.energyConsumptionData.cost.daily[dailyIndex] = costForThisInterval;
        
        // If we've completed a "day" (5 readings), update weekly data
        if (this.energyConsumptionData.readingCount % 5 === 0) {
            const dailyTotal = this.energyConsumptionData.energy.daily.reduce((sum, val) => sum + val, 0);
            const dailyCostTotal = this.energyConsumptionData.cost.daily.reduce((sum, val) => sum + val, 0);
            
            const weeklyIndex = Math.floor(this.energyConsumptionData.readingCount / 5) % 7;
            this.energyConsumptionData.energy.weekly[weeklyIndex] = dailyTotal;
            this.energyConsumptionData.cost.weekly[weeklyIndex] = dailyCostTotal;
            
            // If we've completed a "week" (7 days = 35 readings), update monthly data
            if (weeklyIndex === 6) {
                const weeklyTotal = this.energyConsumptionData.energy.weekly.reduce((sum, val) => sum + val, 0);
                const weeklyCostTotal = this.energyConsumptionData.cost.weekly.reduce((sum, val) => sum + val, 0);
                
                const monthlyIndex = Math.floor(this.energyConsumptionData.readingCount / 35) % 4;
                this.energyConsumptionData.energy.monthly[monthlyIndex] = weeklyTotal;
                this.energyConsumptionData.cost.monthly[monthlyIndex] = weeklyCostTotal;
            }
        }
        
        // Update area usage data
        this.updateAreaUsageData(reading);
        
        // Update device usage data
        this.updateDeviceUsageData(reading);
        
        // Save the aggregated data to Firebase
        set(ref(database, 'energy-consumed/aggregated'), this.energyConsumptionData);
    }

    // Method to update area usage data
    updateAreaUsageData(reading) {
        // Reset area usage data
        this.energyConsumptionData.areaUsage = {};
        
        // Group by room types and calculate totals
        for (const officeId in reading.officeReadings) {
            const officeData = reading.officeReadings[officeId];
            
            for (const roomName in officeData.rooms) {
                // Group room by type
                let roomType = this.categorizeRoom(roomName);
                
                // Initialize room type if it doesn't exist
                if (!this.energyConsumptionData.areaUsage[roomType]) {
                    this.energyConsumptionData.areaUsage[roomType] = 0;
                }
                
                // Add this room's power to the room type total
                this.energyConsumptionData.areaUsage[roomType] += officeData.rooms[roomName].totalPower;
            }
        }
    }

    // Helper method to categorize rooms
    categorizeRoom(roomName) {
        roomName = roomName.toLowerCase();
        
        if (roomName.includes('meeting') || roomName.includes('conference')) {
            return 'Meeting Room';
        } else if (roomName.includes('work') || roomName.includes('office') || roomName.includes('desk')) {
            return 'Workstations';
        } else if (roomName.includes('kitchen') || roomName.includes('break') || roomName.includes('lobby') || roomName.includes('reception')) {
            return 'Common Areas';
        } else {
            return 'Special';
        }
    }

    // Method to update device usage data
    updateDeviceUsageData(reading) {
        // Reset device usage data
        this.energyConsumptionData.deviceUsage = {};
        
        // Count total power by device type
        for (const officeId in reading.officeReadings) {
            const officeData = reading.officeReadings[officeId];
            
            for (const roomName in officeData.rooms) {
                const roomData = officeData.rooms[roomName];
                
                // Process each device
                for (const deviceName in roomData.devices) {
                    const device = roomData.devices[deviceName];
                    const deviceType = device.type;
                    
                    // Sanitize device type for Firebase
                    const sanitizedDeviceType = this.sanitizeFirebaseKey(deviceType);
                    
                    // Initialize device type if it doesn't exist
                    if (!this.energyConsumptionData.deviceUsage[sanitizedDeviceType]) {
                        this.energyConsumptionData.deviceUsage[sanitizedDeviceType] = 0;
                    }
                    
                    // Add this device's power to the device type total
                    this.energyConsumptionData.deviceUsage[sanitizedDeviceType] += device.power;
                }
            }
        }
    }

    // Method to expose the consumption data for external use
    getTotalEnergyConsumptionData() {
        if (!this.energyConsumptionData) {
            return {
                energy: {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                },
                cost: {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                },
                areaUsage: {
                    "Meeting Room": 0,
                    "Workstations": 0,
                    "Common Areas": 0,
                    "Special": 0
                },
                deviceUsage: {
                    "Lights": 0,
                    "A_C": 0,
                    "Speaker": 0,
                    "Projector": 0,
                    "Laptop": 0,
                    "Printer": 0,
                    "Coffee Machine": 0,
                    "Monitor": 0,
                    "Server": 0,
                    "Electric Hoover": 0,
                    "Electronic Desk": 0
                }
            };
        }
        
        return this.energyConsumptionData;
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
        for (const officeId of Object.keys(this.officesData)) {
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
        for (const officeId of Object.keys(this.officesData)) {
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
        this.selectedOffice = officeId;
        
        // Update UI based on selected office
        this.filterRoomsByOffice(officeId);
        this.filterReadingsByOffice(officeId);
        this.updateMetricsDisplay();
    }
    
    initializeOfficeMetrics() {
        // Initialize metrics for each office
        this.officeMetrics = {
            all: {
                totalPower: 0,
                deviceCount: 0,
                activeDevices: 0,
                roomCount: 0
            }
        };
        
        // Initialize total expenses for each office
        this.officeTotalExpenses = {
            all: 0
        };
        
        for (const officeId of Object.keys(this.officesData)) {
            this.officeMetrics[officeId] = {
                totalPower: 0,
                deviceCount: 0,
                activeDevices: 0,
                roomCount: 0
            };
            
            // Initialize total expenses for this office
            this.officeTotalExpenses[officeId] = 0;
        }
        
        // Update UI
        this.updateMetricsDisplay();
    }
    
    updateMetricsDisplay() {
        const metricsContainer = document.getElementById('officeMetrics');
        metricsContainer.innerHTML = '';
        
        // Display metrics for selected office
        const metrics = this.officeMetrics[this.selectedOffice];
        
        if (!metrics) return;
        
        // Create metrics
        const deviceCountMetric = this.createMetricElement('Total Devices', metrics.deviceCount);
        const activeDevicesMetric = this.createMetricElement('Active Devices', metrics.activeDevices);
        const roomCountMetric = this.createMetricElement('Rooms', metrics.roomCount);
        const costMetric = this.createMetricElement('Est. Cost/hr', `£${((metrics.totalPower / 1000) * this.costPerKwh).toFixed(2)}`);
        
        // Add total expenses metric
        const totalExpensesMetric = this.createMetricElement('Total Expenses', `£${this.officeTotalExpenses[this.selectedOffice].toFixed(2)}`);
        
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
        
        if (!this.officesData || Object.keys(this.officesData).length === 0) {
            roomsContainer.innerHTML = '<div>No offices or rooms found in Firebase.</div>';
            return;
        }
        
        // For each office
        for (const [officeId, officeData] of Object.entries(this.officesData)) {
            // Skip if not the selected office and not showing all
            if (this.selectedOffice !== 'all' && this.selectedOffice !== officeId) {
                continue;
            }
            
            if (!officeData.rooms) continue;
            
            // Track room count for metrics
            this.officeMetrics[officeId].roomCount = Object.keys(officeData.rooms).length;
            if (this.selectedOffice === 'all') {
                this.officeMetrics.all.roomCount += Object.keys(officeData.rooms).length;
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
        this.officeMetrics[officeId].deviceCount += devicesArray.length;
        this.officeMetrics.all.deviceCount += devicesArray.length;
        
        // Count active devices for metrics
        const activeDevices = devicesArray.filter(device => device.status === 'On').length;
        this.officeMetrics[officeId].activeDevices += activeDevices;
        this.officeMetrics.all.activeDevices += activeDevices;
        
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
    
    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    generateRandomVoltage() {
        return this.getRandomInRange(215, 225);
    }
    
    getDevicePower(device) {
        // If device is off, it consumes no power
        if (device.status !== 'On') {
            return 0;
        }
        
        // Get device type and specs
        const deviceType = device.type;
        let wattsRange = [10, 50]; // Default range if type is unknown
        
        if (this.deviceSpecs[deviceType]) {
            wattsRange = this.deviceSpecs[deviceType].wattsRange;
        }
        
        // Get current month for seasonal adjustments (same as Python)
        const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-11
        
        let deviceMin, deviceMax;
        const min = wattsRange[0];
        const max = wattsRange[1];
        const range = max - min;
        
        // Determine appropriate power range based on month - exactly like Python
        if ([11, 12, 1, 2].includes(currentMonth)) {
            // Winter months - upper 25%
            deviceMin = min + 0.75 * range;
            deviceMax = max;
        } else if ([3, 4, 5].includes(currentMonth)) {
            // Spring months - lower 25%
            deviceMin = min;
            deviceMax = min + 0
            deviceMax = min + 0.25 * range;
        } else {
            // Summer/Fall months - middle 50%
            deviceMin = min + 0.25 * range;
            deviceMax = min + 0.75 * range;
        }
        
        // Generate random value within range
        return this.getRandomInRange(deviceMin, deviceMax);
    }
    
    generateReadings() {
        if (!this.connectedToFirebase || !this.officesData) {
            console.error("Not connected to Firebase or no office data available");
            return null;
        }
        
        const timestamp = new Date();
        const voltage = this.generateRandomVoltage();
        let totalWatts = 0;
        const officeReadings = {};
        
        // For each office
        for (const [officeId, officeData] of Object.entries(this.officesData)) {
            if (!officeData.rooms) continue;
            
            officeReadings[officeId] = {
                rooms: {},
                totalPower: 0
            };
            
            // For each room in the office
            for (const [roomName, devices] of Object.entries(officeData.rooms)) {
                const roomReading = {
                    devices: {},
                    totalPower: 0,
                    activeDevices: 0,
                    totalDevices: 0
                };
                
                // Process devices in this room
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
                
                roomReading.totalDevices = devicesArray.length;
                
                // Process each device in the room
                for (const device of devicesArray) {
                    const devicePower = this.getDevicePower(device);
                    
                    roomReading.devices[device.name] = {
                        type: device.type,
                        status: device.status,
                        power: devicePower
                    };
                    
                    // Update device power in UI
                    const devicePowerEl = document.getElementById(`device-power-${officeId}-${roomName.replace(/\s+/g, '-')}-${device.name.replace(/\s+/g, '-')}`);
                    if (devicePowerEl) {
                        devicePowerEl.textContent = `${devicePower.toFixed(2)} W`;
                    }
                    
                    // Update totals
                    if (device.status === 'On') {
                        roomReading.activeDevices++;
                        roomReading.totalPower += devicePower;
                    }
                }
                
                officeReadings[officeId].rooms[roomName] = roomReading;
                officeReadings[officeId].totalPower += roomReading.totalPower;
                totalWatts += roomReading.totalPower;
            }
        }
        
        return {
            timestamp: timestamp,
            voltage: voltage,
            totalWatts: totalWatts,
            officeReadings: officeReadings
        };
    }
    
    saveReading(reading) {
        if (!reading) return false;
        
        this.readings.push(reading);
        
        // Calculate elapsed time since last reading for expense calculation
        const currentTimestamp = reading.timestamp;
        let elapsedHours = 0;
        
        if (this.lastReadingTimestamp) {
            // Calculate hours between readings (converts milliseconds to hours)
            elapsedHours = (currentTimestamp - this.lastReadingTimestamp) / (1000 * 60 * 60);
        } else {
            // First reading - use the simulation interval as elapsed time
            elapsedHours = this.interval / (60 * 60); // Convert seconds to hours
        }
        
        // Update last timestamp
        this.lastReadingTimestamp = currentTimestamp;
        
        // Display in UI
        const readingsEl = document.getElementById('readings');
        const readingEl = document.createElement('div');
        readingEl.className = 'reading';
        
        // Set data attribute for filtering
        readingEl.dataset.offices = Object.keys(reading.officeReadings).join(',');
        
        // Hide if not the selected office and not showing all
        if (this.selectedOffice !== 'all' && !readingEl.dataset.offices.includes(this.selectedOffice)) {
            readingEl.style.display = 'none';
        }
        
        // Calculate cost per hour
        const costPerHour = (reading.totalWatts / 1000) * this.costPerKwh;
        
        // Format timestamp
        const time = reading.timestamp.toLocaleTimeString();
        const date = reading.timestamp.toLocaleDateString();
        
        // Get active devices count and reset office metrics
        let totalActiveDevices = 0;
        
        // Reset office power metrics before updating
        for (const officeId in this.officeMetrics) {
            this.officeMetrics[officeId].totalPower = 0;
        }
        
        // Track office-specific data
        let officeDetails = '';
        
        for (const officeId in reading.officeReadings) {
            const officePower = reading.officeReadings[officeId].totalPower;
            const officeCost = (officePower / 1000) * this.costPerKwh;
            
            // Update office metrics
            this.officeMetrics[officeId].totalPower = officePower;
            this.officeMetrics.all.totalPower += officePower;
            
            // Update total expenses
            // Calculate cost for this time period based on power usage and elapsed time
            const periodCost = officeCost * elapsedHours;
            
            // Update running totals
            this.officeTotalExpenses[officeId] += periodCost;
            this.officeTotalExpenses.all += periodCost;
            
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
                    Total Expense: £${this.officeTotalExpenses[officeId].toFixed(2)}
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
        
        // Update dashboard and metrics
        this.updateDashboard(reading.voltage, reading.totalWatts);
        this.updateMetricsDisplay();
        
        // Save energy consumption data to Firebase
        try {
            console.log("Saving reading to Firebase...");
            this.saveEnergyConsumptionToFirebase(reading);
            console.log("Successfully saved reading to Firebase");
        } catch (error) {
            console.error("Error saving to Firebase:", error);
        }

        return true;
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
    
    updateDashboard(voltage, watts) {
        document.getElementById('currentVoltage').textContent = `${voltage.toFixed(2)} V`;
        document.getElementById('currentPower').textContent = `${watts.toFixed(2)} W`;
        
        const costPerHour = (watts / 1000) * this.costPerKwh;
        document.getElementById('currentCost').textContent = `£${costPerHour.toFixed(4)}/hr`;
    }
    
    generateAndSaveReading() {
        console.log("Generating new reading...");
        const reading = this.generateReadings();
        if (reading) {
            console.log("Reading generated successfully, saving...");
            return this.saveReading(reading);
        }
        console.error("Failed to generate reading");
        return false;
    }
    
    // Add method to reset total expenses
    resetTotalExpenses() {
        // Reset all expense tracking
        for (const officeId in this.officeTotalExpenses) {
            this.officeTotalExpenses[officeId] = 0;
        }
        
        // Update the UI
        this.updateMetricsDisplay();
    }
    
    start(interval) {
        console.log("Start method called, isRunning:", this.isRunning);
        if (this.isRunning) return;
        
        console.log("Connected to Firebase:", this.connectedToFirebase);
        if (!this.connectedToFirebase) {
            alert("Cannot start simulation: Not connected to Firebase database.");
            return;
        }
        
        this.interval = interval || this.interval;
        this.isRunning = true;
        
        // Generate initial reading
        try {
            console.log("Generating initial reading...");
            this.generateAndSaveReading();
            console.log("Initial reading generated and saved successfully");
        } catch (error) {
            console.error("Error generating initial reading:", error);
        }
        
        // Set up interval for future readings
        console.log("Setting up interval for readings every", this.interval, "seconds");
        this.intervalId = setInterval(() => {
            try {
                this.generateAndSaveReading();
            } catch (error) {
                console.error("Error in interval reading generation:", error);
            }
        }, this.interval * 1000);
        
        // Update button text
        document.getElementById('startStopButton').textContent = 'Stop Simulation';
        document.getElementById('startStopButton').classList.add('stop');
        console.log("Simulation started");
        
        // Create reset expenses button if it doesn't exist
        if (!document.getElementById('resetExpensesButton')) {
            const controlsContainer = document.getElementById('startStopButton').parentElement;
            const resetButton = document.createElement('button');
            resetButton.id = 'resetExpensesButton';
            resetButton.textContent = 'Reset Total Expenses';
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all total expenses to zero?')) {
                    this.resetTotalExpenses();
                }
            });
            controlsContainer.appendChild(resetButton);
            console.log("Reset expenses button created");
        }
    }
    
    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.intervalId);
        this.isRunning = false;
        
        // Update button text
        document.getElementById('startStopButton').textContent = 'Start Simulation';
        document.getElementById('startStopButton').classList.remove('stop');
        console.log("Simulation stopped");
    }
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing SmartMeterSimulator');
    const simulator = new SmartMeterSimulator();
    
    // Set up start/stop button
    const startStopButton = document.getElementById('startStopButton');
    startStopButton.addEventListener('click', () => {
        console.log("Start/Stop button clicked");
        if (simulator.isRunning) {
            simulator.stop();
        } else {
            const interval = parseInt(document.getElementById('interval').value, 10);
            console.log("Starting simulator with interval:", interval);
            simulator.start(interval);
        }
    });
    
    // Make the simulator available globally for debugging and for the export function
    window.simulator = simulator;
});

// Export the simulator class for potential use in other modules
export default SmartMeterSimulator;

// Export the energy consumption data in the required format
export const getTotalEnergyConsumptionData = () => {
    if (window.simulator) {
        return window.simulator.getTotalEnergyConsumptionData();
    }
    
    // Default data if the simulator isn't initialized
    return {
        energy: {
            daily: [5, 8, 10, 12, 6],
            weekly: [40, 50, 45, 60, 55, 48, 52],
            monthly: [150, 170, 160, 180]
        },
        cost: {
            daily: [2, 3, 5, 4, 6],
            weekly: [20, 25, 22, 30, 28, 24, 26],
            monthly: [90, 100, 95, 105]
        },
        areaUsage: {
            "Meeting Room": 30,
            "Workstations": 40,
            "Common Areas": 25,
            "Special": 20
        },
        deviceUsage: {
            "Lights": 50,
            "A_C": 20,
            "Speaker": 40,
            "Projector": 25,
            "Laptop": 10,
            "Printer": 22,
            "Coffee Machine": 18,
            "Monitor": 14,
            "Server": 18,
            "Electric Hoover": 18,
            "Electronic Desk": 12
        }
    };
};