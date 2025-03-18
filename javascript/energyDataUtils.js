// energyDataUtils.js - Contains utility functions for data processing

import { COST_PER_KWH } from './energyDataConfig.js';
import {
    totalEnergyData,
    totalCostData,
    areaData,
    deviceData,
    energyData,
    costData,
    devicesByArea
} from './energyDataStatic.js';

// Current user's office ID
let currentOfficeID = null;

// Function to get the current user's office ID from localStorage
export function getCurrentOfficeID() {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            currentOfficeID = parsed.officeID || null;
            return currentOfficeID;
        }
    } catch (error) {
        console.error('Error getting office ID from localStorage:', error);
    }
    return null;
}

// Get date ranges for different periods
export function getDateRanges() {
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
export function groupDataByTimeSegments(readings, period) {
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
export function updateAreaData(readings) {
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
export function updateEnergyData(readings) {
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
export function updateDeviceData(readings) {
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
export function updateDevicesByArea(readings) {
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

// Extract readings from a single office's structure
export function extractReadingsFromOffice(officeData, officeID) {
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