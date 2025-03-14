// energyData.js - Modified to fetch real data from Firebase
// IMPORTANT: This keeps all original variable names but populates them with real data

// Firebase is already initialized in your app, so we'll use the existing instance
// Import from the version your app is using
import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

// Cost per kilowatt-hour
const COST_PER_KWH = 0.28; // £0.28 per kWh

// Original time labels structure - kept exactly the same
export const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

// Original data structures that will be updated with real data
export const totalEnergyData = {
    daily: [5, 8, 10, 12, 6],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [150, 170, 160, 180]
};

export const totalCostData = {
    daily: [2, 3, 5, 4, 6],
    weekly: [20, 25, 22, 30, 28, 24, 26],
    monthly: [90, 100, 95, 105]
};

export const energyData = {
    "Meeting Room": {
        daily: [5, 8, 10, 12, 6],
        weekly: [40, 50, 45, 60, 55, 48, 52],
        monthly: [150, 170, 160, 180]
    },
    "Common Areas": {
        daily: [3, 5, 7, 6, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [100, 120, 130, 110]
    },
    "Workstations": {
        daily: [6, 9, 11, 14, 7],
        weekly: [45, 55, 50, 65, 60, 52, 57],
        monthly: [180, 200, 190, 210]
    },
    "Special": {
        daily: [7, 10, 12, 15, 8],
        weekly: [50, 60, 55, 70, 65, 58, 62],
        monthly: [200, 220, 210, 230]
    }
};

export const costData = {
    "Meeting Room": {
        daily: [10, 16, 20, 24, 12],
        weekly: [80, 100, 90, 120, 110, 96, 104],
        monthly: [300, 340, 320, 360]
    },
    "Common Areas": {
        daily: [6, 10, 14, 12, 8],
        weekly: [60, 70, 80, 76, 72, 66, 62],
        monthly: [200, 240, 260, 220]
    },
    "Workstations": {
        daily: [12, 18, 22, 28, 14],
        weekly: [90, 110, 100, 130, 120, 104, 114],
        monthly: [360, 400, 380, 420]
    },
    "Special": {
        daily: [14, 20, 24, 30, 16],
        weekly: [100, 120, 110, 140, 130, 116, 124],
        monthly: [400, 440, 420, 460]
    }
};

export const areaData = {
    "Meeting Room": 30,
    "Workstations": 40,
    "Common Areas": 25,
    "Special": 20
};

export const deviceData = {
    "Computers": 50,
    "Lights": 20,
    "Heating": 40,
    "Monitors": 25,
    "Speakers": 10,
    "A/C": 22,
    "Projector": 18,
    "Vending Machine": 12
};

export const devicesByArea = {
    "Meeting Room": [
        { name: "Projector", energy: 5, cost: 2.5 },
        { name: "Speakers", energy: 2, cost: 1.2 },
        { name: "Lights", energy: 8, cost: 4 }
    ],
    "Workstations": [
        { name: "Computers", energy: 15, cost: 8 },
        { name: "Monitors", energy: 10, cost: 5 },
        { name: "Printers", energy: 6, cost: 3 }
    ],
    "Common Areas": [
        { name: "Lights", energy: 12, cost: 6 },
        { name: "Air Conditioning", energy: 20, cost: 10 },
        { name: "Vending Machine", energy: 8, cost: 4 }
    ],
    "Special": [
        { name: "Heating", energy: 25, cost: 12 },
        { name: "Speakers", energy: 10, cost: 5 }
    ]
};

export const deviceEnergyData = {
    "Computers": {
        daily: [2, 4, 6, 5, 3],
        weekly: [20, 25, 30, 28, 26, 22, 24],
        monthly: [100, 120, 110, 130]
    },
    "Lights": {
        daily: [1, 2, 3, 3, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Heating": {
        daily: [5, 7, 10, 9, 6],
        weekly: [40, 50, 48, 55, 52, 46, 49],
        monthly: [200, 220, 210, 230]
    },
    "Monitors": {
        daily: [1, 3, 4, 3, 2],
        weekly: [15, 18, 20, 19, 17, 16, 18],
        monthly: [70, 80, 75, 85]
    },
    "Speakers": {
        daily: [0.5, 1, 1.5, 1, 0.7],
        weekly: [5, 6, 7, 6.5, 6, 5.5, 5.8],
        monthly: [25, 30, 28, 32]
    },
    "Vending Machine": {
        daily: [2, 3, 4, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    }
};

export const deviceCostData = {
    "Computers": {
        daily: [5, 8, 12, 10, 6],
        weekly: [40, 50, 60, 55, 52, 48, 50],
        monthly: [200, 240, 220, 260]
    },
    "Lights": {
        daily: [1, 2, 3, 2.5, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Heating": {
        daily: [8, 12, 15, 13, 10],
        weekly: [70, 80, 85, 82, 78, 74, 75],
        monthly: [300, 320, 310, 330]
    },
    "Monitors": {
        daily: [2, 4, 5, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    },
    "Speakers": {
        daily: [0.8, 1.2, 1.5, 1.4, 1],
        weekly: [8, 10, 12, 11, 9.5, 8.5, 9],
        monthly: [40, 50, 45, 55]
    },
    "Vending Machine": {
        daily: [3, 4, 5, 5, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [120, 140, 130, 150]
    }
};

// Get date ranges for different periods
function getDateRanges() {
    const now = new Date();
    
    // Daily range (today)
    const dailyStart = new Date(now);
    dailyStart.setHours(0, 0, 0, 0);
    
    // Weekly range (this week)
    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - now.getDay()); // Start from Sunday
    weeklyStart.setHours(0, 0, 0, 0);
    
    // Monthly range (this month)
    const monthlyStart = new Date(now);
    monthlyStart.setDate(1); // First day of month
    monthlyStart.setHours(0, 0, 0, 0);
    
    return {
        daily: {
            start: dailyStart.getTime(),
            end: now.getTime()
        },
        weekly: {
            start: weeklyStart.getTime(),
            end: now.getTime()
        },
        monthly: {
            start: monthlyStart.getTime(),
            end: now.getTime()
        }
    };
}

// Helper function to group data by time segments
function groupDataByTimeSegments(readings, period) {
    // Reset the output arrays
    const segments = period === 'daily' ? 5 : period === 'weekly' ? 7 : 4;
    const result = new Array(segments).fill(0);
    
    if (!readings || readings.length === 0) {
        return result;
    }
    
    const now = new Date();
    const ranges = getDateRanges();
    const periodStart = new Date(ranges[period].start);
    
    if (period === 'daily') {
        // Group by 6-hour segments
        const totalHours = 24;
        const hoursPerSegment = totalHours / (segments - 1);
        
        readings.forEach(reading => {
            const readingDate = new Date(reading.timestamp);
            // Calculate hours elapsed since start of day
            const hoursElapsed = (readingDate - periodStart) / (1000 * 60 * 60);
            const segmentIndex = Math.min(Math.floor(hoursElapsed / hoursPerSegment), segments - 1);
            
            result[segmentIndex] += reading.watts;
        });
    } 
    else if (period === 'weekly') {
        // Group by day of week
        readings.forEach(reading => {
            const readingDate = new Date(reading.timestamp);
            const dayOfWeek = readingDate.getDay(); // 0-6 (Sunday to Saturday)
            
            result[dayOfWeek] += reading.watts;
        });
    } 
    else if (period === 'monthly') {
        // Group by week of month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPerSegment = daysInMonth / segments;
        
        readings.forEach(reading => {
            const readingDate = new Date(reading.timestamp);
            const dayOfMonth = readingDate.getDate();
            const segmentIndex = Math.min(Math.floor((dayOfMonth - 1) / daysPerSegment), segments - 1);
            
            result[segmentIndex] += reading.watts;
        });
    }
    
    return result;
}

// Update area data based on readings
function updateAreaData(readings) {
    // Create a new object to hold the updated area data
    const newAreaData = {};
    
    // Group by room/area
    readings.forEach(reading => {
        const room = reading.room_name;
        
        // Create the area if it doesn't exist
        if (!newAreaData[room]) {
            newAreaData[room] = 0;
        }
        
        // Add the watts to the area total
        newAreaData[room] += reading.watts;
    });
    
    // Update the original areaData object with new values
    // Keep existing keys that aren't in the readings
    for (const room in areaData) {
        if (newAreaData[room] !== undefined) {
            areaData[room] = newAreaData[room];
        }
    }
    
    // Add any new rooms that weren't in the original
    for (const room in newAreaData) {
        if (areaData[room] === undefined) {
            areaData[room] = newAreaData[room];
        }
    }
    
    console.log("Area data updated:", areaData);
}

// Update energy data by room and time period
function updateEnergyData(readings) {
    // Get unique rooms
    const rooms = [...new Set(readings.map(r => r.room_name))];
    
    // Update all time periods
    ['daily', 'weekly', 'monthly'].forEach(period => {
        // Update total energy data
        const newTotalEnergy = groupDataByTimeSegments(readings, period);
        totalEnergyData[period] = newTotalEnergy;
        
        // Convert to cost
        totalCostData[period] = newTotalEnergy.map(w => (w / 1000) * COST_PER_KWH);
        
        // Update per-room data
        rooms.forEach(room => {
            const roomReadings = readings.filter(r => r.room_name === room);
            
            // Create room entry if it doesn't exist
            if (!energyData[room]) {
                energyData[room] = {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                };
                
                costData[room] = {
                    daily: [0, 0, 0, 0, 0],
                    weekly: [0, 0, 0, 0, 0, 0, 0],
                    monthly: [0, 0, 0, 0]
                };
            }
            
            // Update energy data for this room and period
            const roomEnergyData = groupDataByTimeSegments(roomReadings, period);
            energyData[room][period] = roomEnergyData;
            
            // Convert to cost
            costData[room][period] = roomEnergyData.map(w => (w / 1000) * COST_PER_KWH);
        });
    });
    
    console.log("Energy data updated");
}

// Update device data based on readings
function updateDeviceData(readings) {
    // Create a new object to hold the updated device data
    const newDeviceData = {};
    
    // Get unique device types
    const devices = [...new Set(readings.map(r => r.device_type))];
    
    // Update device totals
    devices.forEach(device => {
        const deviceReadings = readings.filter(r => r.device_type === device);
        
        // Sum up watts for this device
        newDeviceData[device] = deviceReadings.reduce((sum, reading) => sum + reading.watts, 0);
        
        // Update original deviceData
        if (deviceData[device] !== undefined) {
            deviceData[device] = newDeviceData[device];
        } else {
            // Add new device type
            deviceData[device] = newDeviceData[device];
        }
        
        // Create entries in energy data if needed
        if (deviceEnergyData[device] === undefined) {
            deviceEnergyData[device] = {
                daily: [0, 0, 0, 0, 0],
                weekly: [0, 0, 0, 0, 0, 0, 0],
                monthly: [0, 0, 0, 0]
            };
            
            deviceCostData[device] = {
                daily: [0, 0, 0, 0, 0],
                weekly: [0, 0, 0, 0, 0, 0, 0],
                monthly: [0, 0, 0, 0]
            };
        }
        
        // Update time-based energy data
        ['daily', 'weekly', 'monthly'].forEach(period => {
            deviceEnergyData[device][period] = groupDataByTimeSegments(deviceReadings, period);
            deviceCostData[device][period] = deviceEnergyData[device][period].map(w => (w / 1000) * COST_PER_KWH);
        });
    });
    
    console.log("Device data updated");
}

// Update devices by area
function updateDevicesByArea(readings) {
    // Get unique rooms
    const rooms = [...new Set(readings.map(r => r.room_name))];
    
    // Temporary storage for new data
    const newDevicesByArea = {};
    
    rooms.forEach(room => {
        // Initialize if needed
        newDevicesByArea[room] = [];
        
        // Get unique devices in this room
        const roomReadings = readings.filter(r => r.room_name === room);
        const deviceNames = [...new Set(roomReadings.map(r => r.device_name))];
        
        // Create entry for each device
        deviceNames.forEach(deviceName => {
            const deviceReadings = roomReadings.filter(r => r.device_name === deviceName);
            const deviceType = deviceReadings[0].device_type; // Get type from first reading
            
            // Calculate total energy (kWh) and cost
            const energySum = deviceReadings.reduce((sum, r) => sum + r.watts, 0) / 1000; // Convert watts to kWh
            const costSum = energySum * COST_PER_KWH;
            
            // Add to newDevicesByArea
            newDevicesByArea[room].push({
                name: deviceName,
                type: deviceType,
                energy: parseFloat(energySum.toFixed(2)),
                cost: parseFloat(costSum.toFixed(2))
            });
        });
    });
    
    // Update the original devicesByArea with new data
    for (const room in newDevicesByArea) {
        devicesByArea[room] = newDevicesByArea[room];
    }
    
    console.log("Devices by area updated");
}

// Fetch device readings from Firebase (where the simulator stores the data)
async function fetchDeviceReadings() {
    if (!database) {
        console.error("Firebase database not initialized");
        return [];
    }
    
    // Try to find where the device readings are stored
    const pathsToCheck = [
        'deviceReadings',
        'device_readings',
        'readings',
        'simulator/readings'
    ];
    
    for (const path of pathsToCheck) {
        console.log(`Checking path: ${path}`);
        try {
            const dataRef = ref(database, path);
            const snapshot = await get(dataRef);
            
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                console.log(`Found data at path: ${path}`);
                
                const readings = Array.isArray(rawData) 
                    ? rawData 
                    : Object.values(rawData);
                
                console.log(`Found ${readings.length} readings`);
                return readings;
            }
        } catch (error) {
            console.warn(`Error checking path ${path}:`, error);
        }
    }
    
    // If we haven't found anything, try to extract from office structure
    console.log("No direct readings found. Checking office structure...");
    try {
        const officesRef = ref(database, 'offices');
        const officesSnapshot = await get(officesRef);
        
        if (officesSnapshot.exists()) {
            const officesData = officesSnapshot.val();
            const readings = extractReadingsFromOffices(officesData);
            
            if (readings.length > 0) {
                console.log(`Extracted ${readings.length} readings from offices`);
                return readings;
            }
        }
    } catch (error) {
        console.warn("Error extracting from offices:", error);
    }
    
    console.warn("No readings found in any location");
    return [];
}

// Extract readings from office structure
function extractReadingsFromOffices(officesData) {
    const readings = [];
    
    // Function to process a single device
    function processDevice(device, roomName, officeId) {
        if (!device || typeof device !== 'object') return;
        
        // Check if it's already a reading format
        if (device.watts !== undefined && device.timestamp !== undefined) {
            readings.push(device);
            return;
        }
        
        // Otherwise create a reading from device data
        if (device.status === 'On') {
            // Generate a realistic power value based on device type
            const deviceType = device.type || 'Unknown';
            const powerRanges = {
                'Desktop Computer': [80, 175],
                'Laptop': [20, 50],
                'Printer': [30, 350],
                'Coffee Machine': [200, 1200],
                'Monitor': [20, 40],
                'Server': [200, 500],
                'A/C': [500, 1500],
                'Lights': [10, 100],
                'Projector': [150, 300],
                'Speakers': [15, 80],
                'Electric Hoover': [30, 70],
                'Default': [20, 100]
            };
            
            const range = powerRanges[deviceType] || powerRanges.Default;
            const watts = Math.random() * (range[1] - range[0]) + range[0];
            
            readings.push({
                timestamp: new Date().toISOString(),
                office_id: officeId,
                room_name: roomName,
                device_name: device.name || 'Unknown Device',
                device_type: deviceType,
                status: device.status,
                volts: 220 + (Math.random() * 10 - 5), // Random voltage around 220V
                watts: watts
            });
        }
    }
    
    // Process all offices, rooms, and devices
    for (const officeId in officesData) {
        const office = officesData[officeId];
        
        if (office && office.rooms) {
            for (const roomName in office.rooms) {
                const room = office.rooms[roomName];
                
                if (Array.isArray(room)) {
                    // Room is an array of devices
                    room.forEach(device => {
                        processDevice(device, roomName, officeId);
                    });
                } else if (typeof room === 'object') {
                    // Room is an object with device keys
                    for (const deviceId in room) {
                        processDevice(room[deviceId], roomName, officeId);
                    }
                }
            }
        }
    }
    
    console.log(`Extracted ${readings.length} device readings from offices structure`);
    return readings;
}

// Main function to fetch and update all data
async function fetchAllData() {
    try {
        console.log("Fetching energy data...");
        
        // Fetch readings from database
        const readings = await fetchDeviceReadings();
        
        if (readings && readings.length > 0) {
            // Update all data structures with the readings
            updateAreaData(readings);
            updateEnergyData(readings);
            updateDeviceData(readings);
            updateDevicesByArea(readings);
            
            // Trigger custom event to notify that data is updated
            const event = new CustomEvent('energyDataUpdated');
            document.dispatchEvent(event);
            
            console.log("Energy data updated successfully");
        } else {
            console.warn("No readings found to update data");
        }
    } catch (error) {
        console.error("Error fetching and updating energy data:", error);
    }
}

// Start fetching data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("Setting up energy data...");
    
    // Fetch immediately
    fetchAllData();
    
    // Then fetch periodically
    setInterval(fetchAllData, 5 * 60 * 1000); // Every 5 minutes
    
    // Listen for refresh events
    document.addEventListener('refreshEnergyData', () => {
        console.log("Manual refresh requested");
        fetchAllData();
    });
});

// Export an update function that can be called manually
export function updateEnergyDataNow() {
    return fetchAllData();
}