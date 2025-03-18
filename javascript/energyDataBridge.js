// energyDataBridge.js - Connects simulator data to visualization UI

import { onValue, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';
import { 
    totalEnergyData, 
    totalCostData, 
    areaData, 
    deviceData,
    totalEnergyDataGenerated,
    devicesByArea
} from './energyDataStatic.js';

// Main function to initialize the bridge between simulator and UI
export function initializeDataBridge() {
    console.log("Initializing Energy Data Bridge...");
    
    // Set up listener for simulator data updates
    setupSimulatorListeners();
    
    // Set up Firebase listeners for real-time updates
    setupFirebaseListeners();
}

// Establish listeners for simulator events
function setupSimulatorListeners() {
    // Listen for consumption simulator updates
    if (window.simulator) {
        console.log("Found consumption simulator, setting up listeners");
        
        // When the simulator generates a new reading
        document.addEventListener('simulatorDataUpdated', () => {
            if (window.simulator && typeof window.simulator.getTotalEnergyConsumptionData === 'function') {
                const consumptionData = window.simulator.getTotalEnergyConsumptionData();
                updateConsumptionData(consumptionData);
            }
        });
    }
    
    // Listen for generation simulator updates
    if (window.renewableGenerator) {
        console.log("Found generation simulator, setting up listeners");
        
        // When the generator creates new data
        document.addEventListener('simulatorDataUpdated', () => {
            if (window.renewableGenerator && typeof window.renewableGenerator.getAggregatedData === 'function') {
                const generationData = window.renewableGenerator.getAggregatedData();
                updateGenerationData(generationData);
            }
        });
    }
}

// Set up Firebase real-time listeners
function setupFirebaseListeners() {
    if (!database) {
        console.error("Firebase database not initialized");
        return;
    }
    
    // Listen for changes to consumption data
    const consumptionRef = ref(database, 'energy-consumed/aggregated');
    onValue(consumptionRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            updateConsumptionData(data);
        }
    }, (error) => {
        console.error("Error in consumption data listener:", error);
    });
    
    // Listen for changes to generation data
    const generationRef = ref(database, 'energy-generated/aggregated');
    onValue(generationRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            updateGenerationData(data);
        }
    }, (error) => {
        console.error("Error in generation data listener:", error);
    });
}

// Update consumption data across all graphs
function updateConsumptionData(data) {
    console.log("Updating consumption data from bridge:", data);
    
    // Update energy consumption data
    if (data.energy) {
        if (data.energy.daily) totalEnergyData.daily = [...data.energy.daily];
        if (data.energy.weekly) totalEnergyData.weekly = [...data.energy.weekly];
        if (data.energy.monthly) totalEnergyData.monthly = [...data.energy.monthly];
    }
    
    // Update cost data
    if (data.cost) {
        if (data.cost.daily) totalCostData.daily = [...data.cost.daily];
        if (data.cost.weekly) totalCostData.weekly = [...data.cost.weekly];
        if (data.cost.monthly) totalCostData.monthly = [...data.cost.monthly];
    }
    
    // Update area usage data
    if (data.areaUsage) {
        Object.keys(data.areaUsage).forEach(area => {
            areaData[area] = data.areaUsage[area];
        });
    }
    
    // Update device usage data
    if (data.deviceUsage) {
        Object.keys(data.deviceUsage).forEach(device => {
            // Convert sanitized keys back (replace underscores with appropriate characters)
            const originalKey = device.replace(/_/g, ' ');
            deviceData[originalKey] = data.deviceUsage[device];
        });
    }
    
    // If device by area data is available, update it
    if (data.devicesByArea) {
        // Update the existing structure
        Object.keys(data.devicesByArea).forEach(area => {
            devicesByArea[area] = data.devicesByArea[area];
        });
    }
    
    // Notify the UI that data has been updated
    const event = new CustomEvent('energyDataUpdated');
    document.dispatchEvent(event);
}

// Update generation data across all graphs
function updateGenerationData(data) {
    console.log("Updating generation data from bridge:", data);
    
    // Update generation data
    if (data.daily && data.daily.length > 0) {
        totalEnergyDataGenerated.daily = [...data.daily];
    }
    if (data.weekly && data.weekly.length > 0) {
        totalEnergyDataGenerated.weekly = [...data.weekly];
    }
    if (data.monthly && data.monthly.length > 0) {
        totalEnergyDataGenerated.monthly = [...data.monthly];
    }
    
    // Notify the UI that generation data has been updated
    const event = new CustomEvent('energyGenerationDataUpdated');
    document.dispatchEvent(event);
}

// Call this to manually fetch the latest data
export async function refreshAllData() {
    console.log("Manually refreshing all energy data");
    
    try {
        // Get consumption data from simulator if available
        if (window.simulator && typeof window.simulator.getTotalEnergyConsumptionData === 'function') {
            const consumptionData = window.simulator.getTotalEnergyConsumptionData();
            updateConsumptionData(consumptionData);
        }
        
        // Get generation data from simulator if available
        if (window.renewableGenerator && typeof window.renewableGenerator.getAggregatedData === 'function') {
            const generationData = window.renewableGenerator.getAggregatedData();
            updateGenerationData(generationData);
        }
        
        return true;
    } catch (error) {
        console.error("Error refreshing data:", error);
        return false;
    }
}

// Initialize the bridge when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDataBridge();
});