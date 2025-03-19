// Firebase Manager - Handles all Firebase interactions

import { onValue, ref, set, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

class FirebaseManager {
    constructor(simulator, database) {
        this.simulator = simulator;
        this.database = database;
    }
    
    connectToEnergyConsumedDatabase() {
        // Check if we can connect to the 'energy-consumed' node
        onValue(ref(this.database, 'energy-consumed'), (snapshot) => {
            console.log('Connected to Firebase energy-consumed database');
            
            // Initialize the database structure if it doesn't exist
            if (!snapshot.exists()) {
                this.initializeEnergyConsumedDatabase();
            } else {
                console.log('Energy-consumed database already exists');
                
                // Load existing aggregated data if available
                if (snapshot.val().aggregated) {
                    this.simulator.dataManager.loadExistingConsumptionData(snapshot.val().aggregated);
                }
            }
            
        }, (error) => {
            console.error("Firebase energy-consumed error:", error);
        });
    }
    
    initializeEnergyConsumedDatabase() {
        console.log("Initializing energy-consumed database structure");
        
        // Create initial structure for energy consumption data
        set(ref(this.database, 'energy-consumed'), {
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
    
    // Method to save energy consumption data to Firebase
    saveEnergyConsumptionToFirebase(reading) {
        if (!reading || !this.simulator.connectedToFirebase) return false;
        
        // Sanitize all keys in the reading object to make Firebase-safe
        const sanitizedReading = this.sanitizeReadingKeys(reading);
        
        // Add the individual reading to Firebase
        const readingsRef = ref(this.database, 'energy-consumed/readings');
        const newReadingRef = push(readingsRef);
        set(newReadingRef, sanitizedReading);
        
        // Save office-specific data
        this.saveOfficeDataToFirebase(sanitizedReading);
        
        // Update aggregated data for visualization
        this.simulator.dataManager.updateConsumptionAggregatedData(sanitizedReading);
        
        // Save the aggregated data to Firebase
        set(ref(this.database, 'energy-consumed/aggregated'), this.simulator.dataManager.energyConsumptionData);
        
        return true;
    }

    saveOfficeTotalCostsToFirebase(totalCostsData) {
        if (!this.database) {
            console.error("Firebase database not initialized");
            return;
        }
        
        try {
            // Get reference to the total-costs node in Firebase
            const totalCostsRef = ref(this.database, 'total-costs');
            
            // Update the existing data with new values
            update(totalCostsRef, totalCostsData);
            console.log("Successfully saved total costs to Firebase:", totalCostsData);
        } catch (error) {
            console.error("Error saving total costs to Firebase:", error);
        }
    }
    
    // Method to save office-specific data to Firebase
    saveOfficeDataToFirebase(reading) {
        for (const officeId in reading.officeReadings) {
            const officeData = reading.officeReadings[officeId];
            const officeRef = ref(this.database, `energy-consumed/offices/${officeId}`);
            
            // Add timestamp and total power for this reading
            const officeReading = {
                timestamp: reading.timestamp.getTime(),
                formattedTime: reading.timestamp.toLocaleString(),
                totalPower: officeData.totalPower,
                totalCost: (officeData.totalPower / 1000) * this.simulator.costPerKwh,
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
            push(ref(this.database, `energy-consumed/offices/${officeId}/readings`), officeReading);
            
            // Update the current state for this office
            set(ref(this.database, `energy-consumed/offices/${officeId}/current`), {
                timestamp: reading.timestamp.getTime(),
                formattedTime: reading.timestamp.toLocaleString(),
                totalPower: officeData.totalPower,
                totalCost: (officeData.totalPower / 1000) * this.simulator.costPerKwh,
                totalExpense: this.simulator.officeTotalExpenses[officeId]
            });
        }
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
    
    // Helper method to sanitize keys for Firebase
    sanitizeFirebaseKey(key) {
        // Replace characters that Firebase doesn't allow in keys
        return key.replace(/[.#$\/\[\]]/g, '_');
    }
}

export default FirebaseManager;