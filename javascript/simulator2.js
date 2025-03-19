// Main simulator file - imports components and initializes the simulator
import { onValue, ref, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import DeviceManager from './deviceManager.js';
import UIManager from './uiManager.js';
import DataManager from './dataManager.js';
import FirebaseManager from './firebaseManager.js';


class SmartMeterSimulator {
    constructor() {
        // Core simulation variables
        this.isRunning = false;
        this.interval = 5; // seconds
        this.intervalId = null;
        this.readings = [];
        this.costPerKwh = 0.28; // £0.28 per kWh (28 pence)
        
        // Firebase connection status
        this.connectedToFirebase = false;
        
        // Office data and selections
        this.officesData = {};
        this.selectedOffice = 'all';
        
        // Metrics tracking
        this.officeMetrics = {};
        this.officeTotalExpenses = { all: 0 };
        
        // Last reading timestamp for cost calculations
        this.lastReadingTimestamp = null;
        
        // Initialize component managers
        this.deviceManager = new DeviceManager();
        this.uiManager = new UIManager(this);
        this.dataManager = new DataManager(this);
        this.firebaseManager = new FirebaseManager(this, database);
        
        // Connect to Firebase
        this.connectToFirebase();
    }
    
    connectToFirebase() {
        const dbStatus = document.getElementById('databaseStatus');
        
        // Listen for offices data
        onValue(ref(database, 'offices'), (snapshot) => {
            if (snapshot.exists()) {
                this.officesData = snapshot.val();
                this.connectedToFirebase = true;
                dbStatus.innerHTML = `<span class="success">Connected to Firebase. Found ${Object.keys(this.officesData).length} offices.</span>`;
                
                // Initialize UI components
                this.uiManager.updateOfficeSelectors();
                this.uiManager.updateOfficeTabs();
                this.initializeOfficeMetrics();
                this.uiManager.updateRoomsUI();
                
                // Connect to energy consumption database
                this.firebaseManager.connectToEnergyConsumedDatabase();
            } else {
                dbStatus.innerHTML = `<span class="error">No offices found in Firebase database.</span>`;
            }
        }, (error) => {
            console.error("Firebase error:", error);
            dbStatus.innerHTML = `<span class="error">Error connecting to Firebase: ${error.message}</span>`;
        });
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
        this.uiManager.updateMetricsDisplay();
    }
    
    generateReadings() {
        if (!this.connectedToFirebase || !this.officesData) {
            console.error("Not connected to Firebase or no office data available");
            return null;
        }
        
        const timestamp = new Date();
        const voltage = this.deviceManager.generateRandomVoltage();
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
                    const devicePower = this.deviceManager.getDevicePower(device);
                    
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

    saveTotalCostsToFirebase() {
        // First check if we have the update method imported
        if (typeof update !== 'function') {
            console.error("Firebase update function not available");
            return;
        }
        
        try {
            // Create a reference to the total-costs node in Firebase
            const totalCostsRef = ref(database, 'total-costs');
            
            // Convert the officeTotalExpenses object to a format we can save to Firebase
            const totalCostsData = {};
            
            for (const [officeId, totalCost] of Object.entries(this.officeTotalExpenses)) {
                // Format to 2 decimal places for display and storage
                totalCostsData[officeId] = parseFloat(totalCost.toFixed(2));
            }
            
            // Update the Firebase database with the new totals
            update(totalCostsRef, totalCostsData);
            console.log("Successfully saved total costs to Firebase:", totalCostsData);
        } catch (error) {
            console.error("Error saving total costs to Firebase:", error);
        }
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
        this.uiManager.displayReading(reading, elapsedHours);
        
        // Update metrics
        this.updateOfficeMetrics(reading, elapsedHours);
        
        // Save energy consumption data to Firebase
        try {
            console.log("Saving reading to Firebase...");
            this.firebaseManager.saveEnergyConsumptionToFirebase(reading);
            console.log("Successfully saved reading to Firebase");
            
            // Also save the accumulated total costs
            this.saveTotalCostsToFirebase();
        } catch (error) {
            console.error("Error saving to Firebase:", error);
        }
    
        return true;
    }
    
    updateOfficeMetrics(reading, elapsedHours) {
        // Reset office power metrics before updating
        for (const officeId in this.officeMetrics) {
            this.officeMetrics[officeId].totalPower = 0;
        }
        
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
        }
        
        // Update dashboard and metrics display
        this.uiManager.updateDashboard(reading.voltage, reading.totalWatts);
        this.uiManager.updateMetricsDisplay();
    }
    
    resetTotalExpenses() {
        // Reset all expense tracking locally
        for (const officeId in this.officeTotalExpenses) {
            this.officeTotalExpenses[officeId] = 0;
        }
        
        // Also reset the values in Firebase
        this.saveTotalCostsToFirebase();
        
        // Update the UI
        this.uiManager.updateMetricsDisplay();
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
        
        // Update UI
        this.uiManager.updateStartStopButton(true);
        console.log("Simulation started");
    }
    
    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.intervalId);
        this.isRunning = false;
        
        // Update UI
        this.uiManager.updateStartStopButton(false);
        console.log("Simulation stopped");
    }
    
    // Method to expose the consumption data for external use
    getTotalEnergyConsumptionData() {
        return this.dataManager.getEnergyConsumptionData();
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