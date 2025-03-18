// energyDataGenerationFetcher.js - Fetches renewable energy generation data

import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { totalEnergyDataGenerated } from './energyDataStatic.js';

// Fetch renewable energy generation data from Firebase
export async function fetchRenewableEnergyData() {
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
            
            // Trigger event for charts to update
            const event = new CustomEvent('energyGenerationDataUpdated');
            document.dispatchEvent(event);
            
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
export function setupRenewableEnergyListener() {
    if (!database) {
        console.error("Firebase database not initialized");
        return;
    }
    
    console.log("Setting up renewable energy listener");
    
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