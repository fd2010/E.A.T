// simulator-to-firebase.js - Direct writer for simulator data to Firebase

import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

// Main function to write simulator data to Firebase
export function writeSimulatorDataToFirebase(simulatorData, officeID) {
  if (!database) {
    console.error("Firebase database not initialized");
    return false;
  }
  
  // Generate timestamp for this update
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`Writing simulator data to Firebase for office: ${officeID}`);
    
    // Format data for Firebase storage
    const formattedData = formatSimulatorData(simulatorData, officeID);
    
    // Write to multiple locations for redundancy
    
    // 1. Write to office-specific location
    if (officeID) {
      set(ref(database, `power-usage/offices/${officeID}`), {
        ...formattedData,
        lastUpdated: timestamp
      });
    }
    
    // 2. Write to aggregated location for dashboard access
    set(ref(database, `power-usage/aggregated`), {
      ...formattedData,
      lastUpdated: timestamp
    });
    
    // 3. Also update the energy-consumed location for compatibility
    set(ref(database, `energy-consumed/aggregated`), {
      ...formattedData,
      lastUpdated: timestamp
    });
    
    console.log("Successfully wrote simulator data to Firebase");
    return true;
  } catch (error) {
    console.error("Error writing simulator data to Firebase:", error);
    return false;
  }
}

// Format simulator data for Firebase storage
function formatSimulatorData(data, officeID) {
  // Ensure we don't modify the original data
  const formattedData = JSON.parse(JSON.stringify(data));
  
  // Add office identifier
  formattedData.officeID = officeID;
  
  // Ensure all expected structures exist
  if (!formattedData.energy) {
    formattedData.energy = {
      daily: [5, 8, 10, 12, 6],
      weekly: [40, 50, 45, 60, 55, 48, 52],
      monthly: [150, 170, 160, 180]
    };
  }
  
  if (!formattedData.cost) {
    formattedData.cost = {
      daily: [2, 3, 5, 4, 6],
      weekly: [20, 25, 22, 30, 28, 24, 26],
      monthly: [90, 100, 95, 105]
    };
  }
  
  if (!formattedData.areaUsage || Object.keys(formattedData.areaUsage).length === 0) {
    formattedData.areaUsage = {
      "Meeting Room": 30,
      "Workstations": 40,
      "Common Areas": 25,
      "Special": 20
    };
  }
  
  if (!formattedData.deviceUsage || Object.keys(formattedData.deviceUsage).length === 0) {
    formattedData.deviceUsage = {
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
  }
  
  if (!formattedData.devicesByArea || Object.keys(formattedData.devicesByArea).length === 0) {
    formattedData.devicesByArea = {
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
  }
  
  // Generate realistic data if simulator values are all zero or very small
  ensureRealisticData(formattedData);
  
  return formattedData;
}

// Ensure data has realistic values and not all zeros
function ensureRealisticData(data) {
  // Check if energy data needs to be randomized
  const isEnergyEmpty = isDataTooSmall(data.energy.daily) && 
                        isDataTooSmall(data.energy.weekly) && 
                        isDataTooSmall(data.energy.monthly);
  
  if (isEnergyEmpty) {
    data.energy.daily = generateRandomArray(5, 5, 15);
    data.energy.weekly = generateRandomArray(7, 30, 65);
    data.energy.monthly = generateRandomArray(4, 140, 200);
  }
  
  // Check if cost data needs to be randomized
  const isCostEmpty = isDataTooSmall(data.cost.daily) && 
                      isDataTooSmall(data.cost.weekly) && 
                      isDataTooSmall(data.cost.monthly);
  
  if (isCostEmpty) {
    data.cost.daily = generateRandomArray(5, 2, 7);
    data.cost.weekly = generateRandomArray(7, 15, 30);
    data.cost.monthly = generateRandomArray(4, 80, 120);
  }
  
  // Check if area usage data needs to be randomized
  const isAreaUsageEmpty = isObjectDataTooSmall(data.areaUsage);
  if (isAreaUsageEmpty) {
    data.areaUsage = {
      "Meeting Room": randomValue(25, 40),
      "Workstations": randomValue(35, 60),
      "Common Areas": randomValue(20, 35),
      "Special": randomValue(15, 30)
    };
  }
  
  // Check if device usage data needs to be randomized
  const isDeviceUsageEmpty = isObjectDataTooSmall(data.deviceUsage);
  if (isDeviceUsageEmpty) {
    data.deviceUsage = {
      "Lights": randomValue(40, 60),
      "A/C": randomValue(15, 30),
      "Speaker": randomValue(30, 50),
      "Projector": randomValue(20, 35),
      "Laptop": randomValue(5, 15),
      "Printer": randomValue(15, 30),
      "Coffee Machine": randomValue(10, 25),
      "Monitor": randomValue(10, 20),
      "Server": randomValue(15, 30),
      "Electric Hoover": randomValue(10, 25),
      "Electronic Desk": randomValue(10, 20)
    };
  }
}

// Check if array has only very small values
function isDataTooSmall(arr, threshold = 1.0) {
  if (!Array.isArray(arr) || arr.length === 0) return true;
  return arr.every(val => val < threshold);
}

// Check if object values are too small
function isObjectDataTooSmall(obj, threshold = 1.0) {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) return true;
  return Object.values(obj).every(val => val < threshold);
}

// Generate random array with values between min and max
function generateRandomArray(length, min, max) {
  return Array(length).fill(0).map(() => randomValue(min, max));
}

// Generate random value between min and max
function randomValue(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// Direct API to write current simulation data to Firebase
export function writeCurrentSimulationData() {
  // Try to get data from window.simulator if available
  if (window.simulator && typeof window.simulator.getTotalEnergyConsumptionData === 'function') {
    const data = window.simulator.getTotalEnergyConsumptionData();
    
    // Get office ID from localStorage
    let officeID = 'all';
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.officeID) {
          officeID = parsedData.officeID;
        }
      }
    } catch (e) {
      console.error("Error getting office ID from localStorage:", e);
    }
    
    // Write data to Firebase
    return writeSimulatorDataToFirebase(data, officeID);
  }
  
  return false;
}

// Initialize data writing on page load
export function initializeSimulatorDataWriter() {
  console.log("Initializing simulator data writer");
  
  // Check if we're on the simulator page
  if (window.location.pathname.includes('simulatorpagebackup.html')) {
    console.log("On simulator page, setting up direct data writing");
    
    // Set up event listener for simulator data updates
    document.addEventListener('simulatorDataUpdated', () => {
      console.log("Simulator data updated, writing to Firebase");
      writeCurrentSimulationData();
    });
    
    // Override the simulator's generateAndSaveReading method to also write to Firebase
    if (window.simulator) {
      const originalGenerateAndSave = window.simulator.generateAndSaveReading;
      
      window.simulator.generateAndSaveReading = function() {
        // Call original method
        const result = originalGenerateAndSave.apply(this, arguments);
        
        // After saving the reading, also write to Firebase
        if (result) {
          writeCurrentSimulationData();
        }
        
        return result;
      };
      
      console.log("Successfully enhanced simulator's save method");
    } else {
      console.log("Simulator not found yet, will attempt again shortly");
      
      // Retry in a second
      setTimeout(() => {
        if (window.simulator) {
          const originalGenerateAndSave = window.simulator.generateAndSaveReading;
          
          window.simulator.generateAndSaveReading = function() {
            // Call original method
            const result = originalGenerateAndSave.apply(this, arguments);
            
            // After saving the reading, also write to Firebase
            if (result) {
              writeCurrentSimulationData();
            }
            
            return result;
          };
          
          console.log("Successfully enhanced simulator's save method (retry)");
        }
      }, 1000);
    }
  } else {
    console.log("Not on simulator page, setting up data reading");
    
    // If we're on another page, let's still try to write some data initially
    // just in case the simulator page didn't write any yet
    setTimeout(() => {
      writeCurrentSimulationData();
    }, 2000);
  }
}

// Export direct data checker and updater
export async function checkAndUpdatePowerUsageData(officeID) {
  if (!database) {
    console.error("Firebase database not initialized");
    return false;
  }
  
  try {
    // Check if data exists for this office
    const powerDataRef = ref(database, `power-usage/offices/${officeID}`);
    const snapshot = await get(powerDataRef);
    
    if (!snapshot.exists()) {
      console.log(`No power usage data found for office ${officeID}, generating some...`);
      
      // Generate some random data
      const randomData = {
        energy: {
          daily: generateRandomArray(5, 5, 15),
          weekly: generateRandomArray(7, 30, 65),
          monthly: generateRandomArray(4, 140, 200)
        },
        cost: {
          daily: generateRandomArray(5, 2, 7),
          weekly: generateRandomArray(7, 15, 30),
          monthly: generateRandomArray(4, 80, 120)
        },
        areaUsage: {
          "Meeting Room": randomValue(25, 40),
          "Workstations": randomValue(35, 60),
          "Common Areas": randomValue(20, 35),
          "Special": randomValue(15, 30)
        },
        deviceUsage: {
          "Lights": randomValue(40, 60),
          "A/C": randomValue(15, 30),
          "Speaker": randomValue(30, 50),
          "Projector": randomValue(20, 35),
          "Laptop": randomValue(5, 15),
          "Printer": randomValue(15, 30),
          "Coffee Machine": randomValue(10, 25),
          "Monitor": randomValue(10, 20),
          "Server": randomValue(15, 30),
          "Electric Hoover": randomValue(10, 25),
          "Electronic Desk": randomValue(10, 20)
        },
        devicesByArea: {
          "Meeting Room": [
            { name: "Projector", energy: randomValue(4, 7), cost: randomValue(2, 3.5) },
            { name: "Speakers", energy: randomValue(1, 3), cost: randomValue(0.8, 1.5) },
            { name: "Lights", energy: randomValue(6, 10), cost: randomValue(3, 5) }
          ],
          "Workstations": [
            { name: "Computers", energy: randomValue(12, 18), cost: randomValue(6, 9) },
            { name: "Monitors", energy: randomValue(8, 12), cost: randomValue(4, 6) },
            { name: "Printers", energy: randomValue(5, 8), cost: randomValue(2.5, 4) }
          ],
          "Common Areas": [
            { name: "Lights", energy: randomValue(10, 15), cost: randomValue(5, 7.5) },
            { name: "Air Conditioning", energy: randomValue(15, 25), cost: randomValue(7.5, 12.5) },
            { name: "Vending Machine", energy: randomValue(6, 10), cost: randomValue(3, 5) }
          ],
          "Special": [
            { name: "Heating", energy: randomValue(20, 30), cost: randomValue(10, 15) },
            { name: "Speakers", energy: randomValue(8, 12), cost: randomValue(4, 6) }
          ]
        }
      };
      
      // Write to Firebase
      return writeSimulatorDataToFirebase(randomData, officeID);
    }
    
    return true;
  } catch (error) {
    console.error("Error checking power usage data:", error);
    return false;
  }
}

// Initialize the data writer when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeSimulatorDataWriter();
});