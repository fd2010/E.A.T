// energyDataPowerFetcher.js - Fetches power usage data

import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { 
    getCurrentOfficeID,
    updateAreaData,
    updateEnergyData,
    updateDeviceData,
    updateDevicesByArea,
    extractReadingsFromOffice
} from './energyDataUtils.js';

// POWER USAGE DATA FETCHING - Specific to user's office
// Fetch device readings from Firebase for the user's office
export async function fetchOfficeDeviceReadings() {
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

// Setup real-time listener for the current office's device data
export function setupOfficeDeviceListener() {
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