// Data Manager - Handles energy consumption data tracking and calculations

class DataManager {
    constructor(simulator) {
        this.simulator = simulator;
        
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
    
    updateConsumptionAggregatedData(reading) {
        // Increment reading count
        this.energyConsumptionData.readingCount++;
        
        // Convert watts to kWh for this time period
        // Assuming each reading represents a time period of simulator.interval seconds
        const kwhForThisInterval = (reading.totalWatts / 1000) * (this.simulator.interval / 3600);
        
        // Calculate cost for this interval
        const costForThisInterval = kwhForThisInterval * this.simulator.costPerKwh;
        
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
    
    // Helper method to sanitize keys for Firebase
    sanitizeFirebaseKey(key) {
        // Replace characters that Firebase doesn't allow in keys
        return key.replace(/[.#$\/\[\]]/g, '_');
    }
    
    // Get the current energy consumption data
    getEnergyConsumptionData() {
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
}

export default DataManager;