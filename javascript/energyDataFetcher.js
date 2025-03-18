// energyDataGenerationFetcher.js - Fetches renewable energy generation data

import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { totalEnergyDataGenerated } from './energyDataStatic.js';

// Fetch renewable energy generation data from Firebase or simulator
export async function fetchRenewableEnergyData() {
    try {
        console.log("Fetching renewable energy generation data...");
        
        // Try to get the data from window.renewableGenerator if it exists
        if (window.renewableGenerator && typeof window.renewableGenerator.getAggregatedData === 'function') {
            console.log("Using window.renewableGenerator for energy generation data");
            const data = window.renewableGenerator.getAggregatedData();
            console.log("Retrieved data from simulator:", data);
            
            // Update totalEnergyDataGenerated
            if (data.daily && data.daily.length > 0) {
                totalEnergyDataGenerated.daily = [...data.daily];
            }
            if (data.weekly && data.weekly.length > 0) {
                totalEnergyDataGenerated.weekly = [...data.weekly];
            }
            if (data.monthly && data.monthly.length > 0) {
                totalEnergyDataGenerated.monthly = [...data.monthly];
            }
            
            console.log("Updated totalEnergyDataGenerated from renewableGenerator:", totalEnergyDataGenerated);
            
            // Trigger event for charts to update
            const event = new CustomEvent('energyGenerationDataUpdated');
            document.dispatchEvent(event);
            
            return true;
        }
        
        // Otherwise fetch from Firebase
        if (!database) {
            console.error("Firebase database not initialized");
            return false;
        }
        
        const generatedRef = ref(database, 'energy-generated/aggregated');
        const snapshot = await get(generatedRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Found energy generation data in Firebase:", data);
            
            // Update totalEnergyDataGenerated
            if (data.daily && data.daily.length > 0) {
                totalEnergyDataGenerated.daily = [...data.daily];
            }
            if (data.weekly && data.weekly.length > 0) {
                totalEnergyDataGenerated.weekly = [...data.weekly];
            }
            if (data.monthly && data.monthly.length > 0) {
                totalEnergyDataGenerated.monthly = [...data.monthly];
            }
            
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
    console.log("Setting up renewable energy listener");
    
    // First, listen for changes from the simulator (via custom events)
    const simulatorUpdateListener = () => {
        if (window.renewableGenerator && typeof window.renewableGenerator.getAggregatedData === 'function') {
            console.log("Simulator data updated, fetching latest data");
            fetchRenewableEnergyData();
        }
    };
    
    // Remove any existing listeners to avoid duplicates
    document.removeEventListener('simulatorDataUpdated', simulatorUpdateListener);
    
    // Add the listener
    document.addEventListener('simulatorDataUpdated', simulatorUpdateListener);
    
    // Also set up Firebase listener as a backup
    if (database) {
        // Set up Firebase listener for energy generation data
        const generatedRef = ref(database, 'energy-generated/aggregated');
        
        onValue(generatedRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("Received updated energy generation data from Firebase:", data);
                
                // Only update from Firebase if we don't have a simulator
                if (!window.renewableGenerator) {
                    // Update totalEnergyDataGenerated
                    if (data.daily && data.daily.length > 0) {
                        totalEnergyDataGenerated.daily = [...data.daily];
                    }
                    if (data.weekly && data.weekly.length > 0) {
                        totalEnergyDataGenerated.weekly = [...data.weekly];
                    }
                    if (data.monthly && data.monthly.length > 0) {
                        totalEnergyDataGenerated.monthly = [...data.monthly];
                    }
                    
                    console.log("Updated totalEnergyDataGenerated from Firebase listener:", totalEnergyDataGenerated);
                    
                    // Trigger event for charts to update
                    const event = new CustomEvent('energyGenerationDataUpdated');
                    document.dispatchEvent(event);
                }
            }
        }, (error) => {
            console.error("Error in Firebase energy generation listener:", error);
        });
    } else {
        console.error("Firebase database not initialized, cannot set up listener");
    }
    
    // Initial fetch to get current data
    fetchRenewableEnergyData();
}