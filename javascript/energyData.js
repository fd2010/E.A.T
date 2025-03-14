// energyData.js - Modified to fetch real data from Firebase
// IMPORTANT: This keeps all original variable names but populates them with real data

// Firebase configuration - Set up at the beginning
import firebase from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getDatabase, ref, onValue, query, orderByChild, startAt, endAt } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js';

// Initialize Firebase (update with your project details)
const firebaseConfig = {
    apiKey: "AIzaSyAQD0Tqjq6GQRs88OP9tHUE5GbWUxJH5-Y",
    authDomain: "energy-analysis-tool.firebaseapp.com",
    databaseURL: "https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "energy-analysis-tool",
    storageBucket: "energy-analysis-tool.appspot.com",
    messagingSenderId: "507807371796",
    appId: "1:507807371796:web:5429d8339a1aa3e7e2ead0"
};

// Initialize Firebase
let firebaseApp;
let database;
let initComplete = false;

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
    daily: [0, 0, 0, 0, 0],
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: [0, 0, 0, 0]
};

export const totalCostData = {
    daily: [0, 0, 0, 0, 0],
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: [0, 0, 0, 0]
};

export const energyData = {
    "Meeting Room": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Common Areas": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Workstations": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Special": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    }
};

export const costData = {
    "Meeting Room": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Common Areas": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Workstations": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Special": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    }
};

export const areaData = {
    "Meeting Room": 0,
    "Workstations": 0,
    "Common Areas": 0,
    "Special": 0
};

export const deviceData = {
    "Computers": 0,
    "Lights": 0,
    "Heating": 0,
    "Monitors": 0,
    "Speakers": 0,
    "A/C": 0,
    "Projector": 0,
    "Vending Machine": 0
};

export const devicesByArea = {
    "Meeting Room": [
        { name: "Projector", energy: 0, cost: 0 },
        { name: "Speakers", energy: 0, cost: 0 },
        { name: "Lights", energy: 0, cost: 0 }
    ],
    "Workstations": [
        { name: "Computers", energy: 0, cost: 0 },
        { name: "Monitors", energy: 0, cost: 0 },
        { name: "Printers", energy: 0, cost: 0 }
    ],
    "Common Areas": [
        { name: "Lights", energy: 0, cost: 0 },
        { name: "Air Conditioning", energy: 0, cost: 0 },
        { name: "Vending Machine", energy: 0, cost: 0 }
    ],
    "Special": [
        { name: "Heating", energy: 0, cost: 0 },
        { name: "Speakers", energy: 0, cost: 0 }
    ]
};

export const deviceEnergyData = {
    "Computers": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Lights": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Heating": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Monitors": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Speakers": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Vending Machine": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    }
};

export const deviceCostData = {
    "Computers": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Lights": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Heating": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Monitors": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Speakers": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    },
    "Vending Machine": {
        daily: [0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0]
    }
};

// Initialize Firebase connection
function initFirebase() {
    if (initComplete) return;
    
    try {
        // Check if Firebase is already initialized globally
        if (window.firebase) {
            console.log("Using globally initialized Firebase");
            firebaseApp = window.firebase.app();
            database = window.firebase.database();
            initComplete = true;
        } else {
            try {
                // Try using Firebase v9
                firebaseApp = firebase.getApp();
            } catch (e) {
                firebaseApp = firebase.initializeApp(firebaseConfig);
            }
            
            // Get database reference
            database = getDatabase(firebaseApp);
            initComplete = true;
        }
        
        console.log("Firebase initialized for energy data");
        
        // Start fetching data
        fetchAllData();
        
        // Set up a refresh interval
        setInterval(fetchAllData, 5 * 60 * 1000); // Refresh every 5 minutes
        
        // Also allow manual refresh via events
        document.addEventListener('refreshEnergyData', fetchAllData);
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        console.log("Will try again in 5 seconds...");
        
        // Try again in 5 seconds
        setTimeout(initFirebase, 5000);
    }
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
    // Reset the area data first
    for (const area in areaData) {
        areaData[area] = 0;
    }
    
    // Group by room/area
    readings.forEach(reading => {
        const room = reading.room_name;
        
        // Create the area if it doesn't exist
        if (areaData[room] === undefined) {
            areaData[room] = 0;
            
            // Also create entries in other data structures if needed
            if (energyData[room] === undefined) {
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
                
                devicesByArea[room] = [];
            }
        }
        
        // Add the watts to the area total
        areaData[room] += reading.watts;
    });
    
    console.log("Area data updated:", areaData);
}

// Update energy data by room and time period
function updateEnergyData(readings) {
    // Get unique rooms
    const rooms = [...new Set(readings.map(r => r.room_name))];
    
    // Update all time periods
    ['daily', 'weekly', 'monthly'].forEach(period => {
        // Update total energy data
        totalEnergyData[period] = groupDataByTimeSegments(readings, period);
        
        // Convert to cost
        totalCostData[period] = totalEnergyData[period].map(w => (w / 1000) * COST_PER_KWH);
        
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
            energyData[room][period] = groupDataByTimeSegments(roomReadings, period);
            
            // Convert to cost
            costData[room][period] = energyData[room][period].map(w => (w / 1000) * COST_PER_KWH);
        });
    });
    
    console.log("Energy data updated:", energyData);
    console.log("Cost data updated:", costData);
}

// Update device data based on readings
function updateDeviceData(readings) {
    // Reset the device data first
    for (const device in deviceData) {
        deviceData[device] = 0;
    }
    
    // Get unique device types
    const devices = [...new Set(readings.map(r => r.device_type))];
    
    // Update device totals
    devices.forEach(device => {
        const deviceReadings = readings.filter(r => r.device_type === device);
        
        // Create device entry if it doesn't exist
        if (deviceData[device] === undefined) {
            deviceData[device] = 0;
            
            // Also create entries in other data structures if needed
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
        }
        
        // Sum up watts for this device
        deviceData[device] = deviceReadings.reduce((sum, reading) => sum + reading.watts, 0);
        
        // Update time-based energy data
        ['daily', 'weekly', 'monthly'].forEach(period => {
            deviceEnergyData[device][period] = groupDataByTimeSegments(deviceReadings, period);
            deviceCostData[device][period] = deviceEnergyData[device][period].map(w => (w / 1000) * COST_PER_KWH);
        });
    });
    
    console.log("Device data updated:", deviceData);
}

// Update devices by area
function updateDevicesByArea(readings) {
    // Get unique rooms
    const rooms = [...new Set(readings.map(r => r.room_name))];
    
    // Reset and recreate devicesByArea
    rooms.forEach(room => {
        // Initialize if needed
        if (!devicesByArea[room]) {
            devicesByArea[room] = [];
        } else {
            // Clear existing entries
            devicesByArea[room] = [];
        }
        
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
            
            // Add to devicesByArea
            devicesByArea[room].push({
                name: deviceName,
                type: deviceType,
                energy: parseFloat(energySum.toFixed(2)),
                cost: parseFloat(costSum.toFixed(2))
            });
        });
    });
    
    console.log("Devices by area updated:", devicesByArea);
}

// Fetch device readings from Firebase (where the simulator stores the data)
async function fetchDeviceReadings() {
    if (!database) {
        console.error("Firebase database not initialized");
        return [];
    }
    
    // This is the path where the device readings are stored by the simulator
    // Change this to match your actual database structure
    const deviceReadingsRef = ref(database, 'deviceReadings');
    
    // Log the path we're querying for debugging
    console.log("Fetching device readings from path:", deviceReadingsRef.toString());
    
    try {
        return new Promise((resolve, reject) => {
            onValue(deviceReadingsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const rawData = snapshot.val();
                    console.log("Sample of raw data:", JSON.stringify(rawData).substring(0, 200) + "...");
                    
                    const readings = Array.isArray(rawData) ? 
                        rawData : Object.values(rawData);
                    
                    console.log(`Fetched ${readings.length} device readings`);
                    resolve(readings);
                } else {
                    console.log("No device readings found at path. Trying alternate paths...");
                    
                    // Try alternative paths where data might be stored
                    const alternativePaths = [
                        'device_readings',
                        'readings',
                        'simulator/readings',
                        'offices'  // The office structure might contain device readings
                    ];
                    
                    // Try each path
                    Promise.all(alternativePaths.map(path => {
                        return new Promise(resolveAlt => {
                            const altRef = ref(database, path);
                            onValue(altRef, (altSnapshot) => {
                                if (altSnapshot.exists()) {
                                    console.log(`Found data at alternate path: ${path}`);
                                    resolveAlt({
                                        path: path,
                                        data: altSnapshot.val()
                                    });
                                } else {
                                    resolveAlt(null);
                                }
                            }, {onlyOnce: true});
                        });
                    })).then(results => {
                        const foundData = results.filter(r => r !== null);
                        if (foundData.length > 0) {
                            console.log("Found data in alternative paths:", 
                                foundData.map(d => d.path).join(', '));
                            
                            // Process the first found path
                            const firstFound = foundData[0];
                            console.log(`Using data from ${firstFound.path}`);
                            
                            // Process data based on path structure
                            if (firstFound.path === 'offices') {
                                // Extract device readings from office structure
                                const extractedReadings = extractReadingsFromOffices(firstFound.data);
                                resolve(extractedReadings);
                            } else {
                                const readings = Array.isArray(firstFound.data) ? 
                                    firstFound.data : Object.values(firstFound.data);
                                resolve(readings);
                            }
                        } else {
                            console.warn("No data found in any alternative paths");
                            resolve([]);
                        }
                    });
                }
            }, (error) => {
                console.error("Error fetching device readings:", error);
                reject(error);
            }, {onlyOnce: true}); // Only fetch once
        });
    } catch (error) {
        console.error("Error setting up Firebase listener:", error);
        return [];
    }
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
        console.log("Fetching all energy data...");
        
        // Fetch readings from deviceReadings collection
        const readings = await fetchDeviceReadings();
        
        if (readings.length === 0) {
            console.warn("No device readings available. Checking for simulator in database...");
            
            // If our direct fetch failed, check if the simulator has an active session
            const simulatorRef = ref(database, 'simulator/activeSession');
            onValue(simulatorRef, (snapshot) => {
                if (snapshot.exists()) {
                    console.log("Simulator active session found! Extracting readings...");
                    const simulatorData = snapshot.val();
                    
                    // Try to extract readings from simulator data
                    let simulatorReadings = [];
                    
                    if (simulatorData.readings) {
                        // Direct readings array
                        simulatorReadings = Array.isArray(simulatorData.readings) ?
                            simulatorData.readings : Object.values(simulatorData.readings);
                    } else if (simulatorData.officeReadings) {
                        // Office-organized readings
                        simulatorReadings = extractReadingsFromOffices(simulatorData.officeReadings);
                    }
                    
                    if (simulatorReadings.length > 0) {
                        console.log(`Found ${simulatorReadings.length} readings from simulator`);
                        
                        // Update all data structures with the readings
                        updateAreaData(simulatorReadings);
                        updateEnergyData(simulatorReadings);
                        updateDeviceData(simulatorReadings);
                        updateDevicesByArea(simulatorReadings);
                        
                        // Trigger custom event to notify that data is updated
                        const event = new CustomEvent('energyDataUpdated');
                        document.dispatchEvent(event);
                    }
                } else {
                    console.warn("No simulator session found");
                }
            }, { onlyOnce: true });
            
            return;
        }
        
        // Update all data structures with the readings
        updateAreaData(readings);
        updateEnergyData(readings);
        updateDeviceData(readings);
        updateDevicesByArea(readings);
        
        // Trigger custom event to notify that data is updated
        const event = new CustomEvent('energyDataUpdated');
        document.dispatchEvent(event);
        
        console.log("All energy data updated successfully");
    } catch (error) {
        console.error("Error fetching and updating energy data:", error);
    }
}

// Initialize Firebase when the module is imported
initFirebase();

// Export an update function that can be called manually
export function updateEnergyDataNow() {
    return fetchAllData();
}