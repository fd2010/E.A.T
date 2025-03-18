// energyData.js - Modified to prevent automatic data fetch

// Firebase is already initialized in your app, so we'll use the existing instance
import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

// Cost per kilowatt-hour
const COST_PER_KWH = 0.28; // £0.28 per kWh (28 pence)

// Original time labels structure - kept exactly the same
export const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

// Static data that won't be automatically updated
export let totalEnergyDataGenerated = {
    daily: [7, 8, 10, 12, 6],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [150, 170, 160, 180]
};

export let totalEnergyData = {
    daily: [5, 8, 10, 12, 6],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [150, 170, 160, 180]
};

export let totalCostData = {
    daily: [2, 3, 5, 4, 6],
    weekly: [20, 25, 22, 30, 28, 24, 26],
    monthly: [90, 100, 95, 105]
};

export let areaData = {
    "Meeting Room": 30,
    "Workstations": 40,
    "Common Areas": 25,
    "Special": 20
};

export let deviceData = {
    "Lights": 50,
    "A/C": 20,
    "Speaker": 40,
    "Projector": 25,
    "Laptop": 10,
    "Printer": 22,
    "Coffee Machine": 18,
    "Monitor": 14,
    "Server": 18,
    "Electric Hoover": 18,
    "Electronic Desk": 12
};

export let energyData = {
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

export let costData = {
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

export let devicesByArea = {
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

// Current user's office ID
let currentOfficeID = null;

// Function to get the current user's office ID from localStorage
function getCurrentOfficeID() {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            return parsed.officeID || null;
        }
    } catch (error) {
        console.error('Error getting office ID from localStorage:', error);
    }
    return null;
}

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
    });
    
    console.log("Device data updated:", deviceData);
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

// POWER USAGE DATA FETCHING - Specific to user's office
// Fetch device readings from Firebase for the user's office
async function fetchOfficeDeviceReadings() {
    if (!database) {
        console.error("Firebase database not initialized");
        return [];
    }
    
    // Get current user's office ID
    const officeID = getCurrentOfficeID();
    if (!officeID) {
        console.warn("No office ID found for current user");
        return [];
    }
    
    console.log(`Fetching device readings for office: ${officeID}`);
    
    // Try to find device readings for this office
    try {
        // First try to get simulator readings for this office
        const readingsRef = ref(database, 'simulator/readings');
        const snapshot = await get(readingsRef);
        
        if (snapshot.exists()) {
            const rawData = snapshot.val();
            console.log(`Found simulator readings, filtering for office: ${officeID}`);
            
            // Convert to array and filter by office ID
            const readings = Array.isArray(rawData) 
                ? rawData.filter(r => r.office_id === officeID) 
                : Object.values(rawData).filter(r => r.office_id === officeID);
            
            console.log(`Found ${readings.length} readings for this office`);
            
            if (readings.length > 0) {
                return readings;
            }
        }
        
        // If no simulator readings, try to extract from office structure
        console.log("No direct readings found. Checking office structure...");
        const officeRef = ref(database, `offices/${officeID}`);
        const officeSnapshot = await get(officeRef);
        
        if (officeSnapshot.exists()) {
            const officeData = officeSnapshot.val();
            const readings = extractReadingsFromOffice(officeData, officeID);
            
            if (readings.length > 0) {
                console.log(`Extracted ${readings.length} readings from office structure`);
                return readings;
            }
        }
        
        console.warn(`No readings found for office: ${officeID}`);
        return [];
        
    } catch (error) {
        console.error("Error fetching office device readings:", error);
        return [];
    }
}

// Extract readings from a single office's structure
function extractReadingsFromOffice(officeData, officeID) {
    const readings = [];
    
    if (!officeData || !officeData.rooms) {
        return readings;
    }
    
    // Function to process a single device
    function processDevice(device, roomName) {
        if (!device || typeof device !== 'object') return;
        
        // Skip devices that are turned off
        if (device.status !== 'On') return;
        
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
            office_id: officeID,
            room_name: roomName,
            device_name: device.name || 'Unknown Device',
            device_type: deviceType,
            status: device.status,
            volts: 220 + (Math.random() * 10 - 5), // Random voltage around 220V
            watts: watts
        });
    }
    
    // Process all rooms and devices in this office
    for (const roomName in officeData.rooms) {
        const room = officeData.rooms[roomName];
        
        if (Array.isArray(room)) {
            // Room is an array of devices
            room.forEach(device => {
                processDevice(device, roomName);
            });
        } else if (typeof room === 'object') {
            // Room is an object with device keys
            for (const deviceId in room) {
                processDevice(room[deviceId], roomName);
            }
        }
    }
    
    console.log(`Extracted ${readings.length} device readings from office: ${officeID}`);
    return readings;
}

// Setup real-time listener for the current office's device data
function setupOfficeDeviceListener() {
    const officeID = getCurrentOfficeID();
    if (!officeID || !database) {
        console.warn("Cannot setup listener: Office ID missing or database not initialized");
        return;
    }
    
    console.log(`Setting up real-time listener for office: ${officeID}`);
    
    // Listen for changes to the office structure
    const officeRef = ref(database, `offices/${officeID}`);
    onValue(officeRef, async (snapshot) => {
        if (snapshot.exists()) {
            console.log(`Received update for office: ${officeID}`);
            const officeData = snapshot.val();
            
            // Extract readings from the updated office data
            const readings = extractReadingsFromOffice(officeData, officeID);
            
            if (readings.length > 0) {
                // Update all data structures with the readings
                updateAreaData(readings);
                updateEnergyData(readings);
                updateDeviceData(readings);
                updateDevicesByArea(readings);
                
                // Trigger custom event to notify that data is updated
                const event = new CustomEvent('energyDataUpdated');
                document.dispatchEvent(event);
                
                console.log("Energy data updated from real-time listener");
            }
        }
    }, (error) => {
        console.error(`Error in real-time listener for office ${officeID}:`, error);
    });
}

// Fetch renewable energy generation data from Firebase
async function fetchRenewableEnergyData() {
    try {
        console.log("Fetching renewable energy generation data...");
        
        if (!database) {
            console.error("Firebase database not initialized");
            return false;
        }
        
        // Try to get the data from window.renewableGenerator if it exists
        if (window.renewableGenerator && typeof window.renewableGenerator.getAggregatedData === 'function') {
            console.log("Using window.renewableGenerator for energy generation data");
            const data = window.renewableGenerator.getAggregatedData();
            
            // Update totalEnergyDataGenerated
            if (data.daily && data.daily.length > 0) totalEnergyDataGenerated.daily = data.daily;
            if (data.weekly && data.weekly.length > 0) totalEnergyDataGenerated.weekly = data.weekly;
            if (data.monthly && data.monthly.length > 0) totalEnergyDataGenerated.monthly = data.monthly;
            
            console.log("Updated totalEnergyDataGenerated from renewableGenerator:", totalEnergyDataGenerated);
            return true;
        }
        
        // Otherwise fetch from Firebase
        const generatedRef = ref(database, 'energy-generated/aggregated');
        const snapshot = await get(generatedRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Found energy generation data in Firebase:", data);
            
            // Update totalEnergyDataGenerated
            if (data.daily && data.daily.length > 0) totalEnergyDataGenerated.daily = data.daily;
            if (data.weekly && data.weekly.length > 0) totalEnergyDataGenerated.weekly = data.weekly;
            if (data.monthly && data.monthly.length > 0) totalEnergyDataGenerated.monthly = data.monthly;
            
            console.log("Updated totalEnergyDataGenerated from Firebase:", totalEnergyDataGenerated);
            
            // Trigger event for charts to update
            const event = new CustomEvent('energyGenerationDataUpdated');
            document.dispatchEvent(event);
            
            return true;
        } else {
            console.log("No energy generation data found in Firebase");
            return false;
        }
    } catch (error) {
        console.error("Error fetching renewable energy data:", error);
        return false;
    }
}

// Set up real-time listener for renewable energy data
function setupRenewableEnergyListener() {
    if (!database) {
        console.error("Firebase database not initialized");
        return;
    }
    
    // Set up Firebase listener for energy generation data
    const generatedRef = ref(database, 'energy-generated/aggregated');
    
    onValue(generatedRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Received updated energy generation data:", data);
            
            // Update totalEnergyDataGenerated
            if (data.daily && data.daily.length > 0) totalEnergyDataGenerated.daily = data.daily;
            if (data.weekly && data.weekly.length > 0) totalEnergyDataGenerated.weekly = data.weekly;
            if (data.monthly && data.monthly.length > 0) totalEnergyDataGenerated.monthly = data.monthly;
            
            console.log("Updated totalEnergyDataGenerated in real-time:", totalEnergyDataGenerated);
            
            // Trigger event for charts to update
            const event = new CustomEvent('energyGenerationDataUpdated');
            document.dispatchEvent(event);
        }
    }, (error) => {
        console.error("Error setting up renewable energy data listener:", error);
    });
}

// Main function to fetch and update all data
async function fetchAllData() {
    try {
        console.log("Fetching all energy data...");
        
        // Update current office ID
        currentOfficeID = getCurrentOfficeID();
        console.log("Current office ID:", currentOfficeID);
        
        // First, fetch renewable energy generation data
        await fetchRenewableEnergyData();
        
        // Then fetch consumption readings for the current office
        const readings = await fetchOfficeDeviceReadings();
        
        if (readings && readings.length > 0) {
            // Update all data structures with the readings
            updateAreaData(readings);
            updateEnergyData(readings);
            updateDeviceData(readings);
            updateDevicesByArea(readings);
            
            // Trigger custom event to notify that data is updated
            const event = new CustomEvent('energyDataUpdated');
            document.dispatchEvent(event);
            
            console.log("Energy data updated successfully for office:", currentOfficeID);
        } else {
            console.warn("No readings found to update consumption data for office:", currentOfficeID);
        }
    } catch (error) {
        console.error("Error fetching and updating energy data:", error);
    }
}

// Commenting out the auto-load functionality
/* 
document.addEventListener('DOMContentLoaded', () => {
    console.log("Setting up energy data...");
    
    // Set up real-time listeners
    setupRenewableEnergyListener();
    setupOfficeDeviceListener();
    
    // Fetch immediately
    fetchAllData();
    
    // Then fetch periodically
    setInterval(fetchAllData, 5 * 60 * 1000); // Every 5 minutes
    
    // Listen for refresh events
    document.addEventListener('refreshEnergyData', () => {
        console.log("Manual refresh requested");
        fetchAllData();
    });
    
    // Listen for user login/change events
    window.addEventListener('storage', (event) => {
        if (event.key === 'userData') {
            console.log("User data changed, refreshing energy data");
            fetchAllData();
        }
    });
});
*/

// Export an update function that can be called manually if needed
export function updateEnergyDataNow() {
    return fetchAllData();
}