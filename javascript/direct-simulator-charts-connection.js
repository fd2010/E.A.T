// direct-simulator-charts-connection.js - Fixed version
// This script directly links simulator data to the charts

// Import Firebase components
import { onValue, ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

// Global chart references
let charts = {
    energyUsageChart: null,
    energyCostChart: null,
    areaBarChart: null,
    devicePieChart: null
};

// Current time period selection
let selectedTimePeriod = 'daily';

// Store data for reuse
let lastData = null;

// Initialize the connection when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct simulator-to-charts connection initializing...');
    
    // Set up event listener for simulator data updates
    document.addEventListener('simulatorDataUpdated', handleSimulatorUpdate);
    
    // Listen for time period changes
    setupTimePeriodListeners();
    
    // Listen for Firebase path where simulator stores data
    listenToFirebaseData();
    
    // Initialize chart references once they're created
    setTimeout(initializeChartReferences, 1000);
});

// Initialize references to chart instances
function initializeChartReferences() {
    // Get references to all charts that might exist on the page
    const energyUsageElement = document.getElementById('energyUsageChart');
    if (energyUsageElement) {
        charts.energyUsageChart = Chart.getChart(energyUsageElement);
        console.log('Found energyUsageChart:', charts.energyUsageChart ? 'yes' : 'no');
    }
    
    const energyCostElement = document.getElementById('energyCostChart');
    if (energyCostElement) {
        charts.energyCostChart = Chart.getChart(energyCostElement);
        console.log('Found energyCostChart:', charts.energyCostChart ? 'yes' : 'no');
    }
    
    const areaBarElement = document.getElementById('areaBarChart');
    if (areaBarElement) {
        charts.areaBarChart = Chart.getChart(areaBarElement);
        console.log('Found areaBarChart:', charts.areaBarChart ? 'yes' : 'no');
    }
    
    const devicePieElement = document.getElementById('devicePieChart');
    if (devicePieElement) {
        charts.devicePieChart = Chart.getChart(devicePieElement);
        console.log('Found devicePieChart:', charts.devicePieChart ? 'yes' : 'no');
    }
    
    // Now that we have chart references, do an initial data fetch
    fetchLatestSimulatorData();
}

// Set up listeners for time period buttons
function setupTimePeriodListeners() {
    // Store the initial selected time
    window.selectedTime = selectedTimePeriod;
    
    // Find all time period selection buttons
    const timeButtons = document.querySelectorAll('.graph-buttons button');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Store the selected time period
            selectedTimePeriod = this.id; // 'daily', 'weekly', or 'monthly'
            window.selectedTime = selectedTimePeriod;
            console.log(`Time period changed to: ${selectedTimePeriod}`);
            
            // Update charts with the new time period immediately
            if (lastData) {
                updateChartsWithData(lastData);
            } else {
                fetchLatestSimulatorData();
            }
        });
    });
}

// Handle simulator data update event
function handleSimulatorUpdate() {
    console.log('Simulator data updated event received');
    fetchLatestSimulatorData();
}

// Listen to Firebase for simulator data updates
function listenToFirebaseData() {
    if (!database) {
        console.error('Firebase database not available');
        return;
    }
    
    // Listen to energy consumption data
    const consumptionRef = ref(database, 'energy-consumed/aggregated');
    onValue(consumptionRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log('Received energy consumption update from Firebase');
            const data = snapshot.val();
            
            // Store the data for reuse
            lastData = data;
            
            // Make the data globally available
            if (data.energy) window.totalEnergyData = data.energy;
            if (data.cost) window.totalCostData = data.cost;
            if (data.areaUsage) window.areaData = data.areaUsage;
            if (data.deviceUsage) window.deviceData = data.deviceUsage;
            if (data.devicesByArea) window.devicesByArea = data.devicesByArea;
            
            updateChartsWithData(data);
            
            // Also dispatch the chartDataUpdated event for direct listeners
            const event = new CustomEvent('chartDataUpdated', { detail: data });
            document.dispatchEvent(event);
        }
    });
    
    // Listen to generator data
    const generationRef = ref(database, 'energy-generated/aggregated');
    onValue(generationRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log('Received energy generation update from Firebase');
            const data = snapshot.val();
            
            // Make the data globally available
            window.totalEnergyDataGenerated = data;
            
            // Dispatch event for generation charts
            const event = new CustomEvent('energyGenerationDataUpdated');
            document.dispatchEvent(event);
        }
    });
}

// Fetch latest simulator data
async function fetchLatestSimulatorData() {
    console.log('Fetching latest simulator data...');
    
    try {
        // Try to get data from window.simulator if available
        if (window.simulator && typeof window.simulator.getTotalEnergyConsumptionData === 'function') {
            const data = window.simulator.getTotalEnergyConsumptionData();
            console.log('Retrieved data from simulator object:', data);
            
            // Store the data for reuse
            lastData = data;
            
            // Make the data globally available
            if (data.energy) window.totalEnergyData = data.energy;
            if (data.cost) window.totalCostData = data.cost;
            if (data.areaUsage) window.areaData = data.areaUsage;
            if (data.deviceUsage) window.deviceData = data.deviceUsage;
            if (data.devicesByArea) window.devicesByArea = data.devicesByArea;
            
            updateChartsWithData(data);
            
            // Also dispatch the chartDataUpdated event for direct listeners
            const event = new CustomEvent('chartDataUpdated', { detail: data });
            document.dispatchEvent(event);
            
            return;
        }
        
        // Otherwise, try to fetch from Firebase
        if (database) {
            const consumptionRef = ref(database, 'energy-consumed/aggregated');
            const snapshot = await get(consumptionRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('Retrieved data from Firebase:', data);
                
                // Store the data for reuse
                lastData = data;
                
                // Make the data globally available
                if (data.energy) window.totalEnergyData = data.energy;
                if (data.cost) window.totalCostData = data.cost;
                if (data.areaUsage) window.areaData = data.areaUsage;
                if (data.deviceUsage) window.deviceData = data.deviceUsage;
                if (data.devicesByArea) window.devicesByArea = data.devicesByArea;
                
                updateChartsWithData(data);
                
                // Also dispatch the chartDataUpdated event for direct listeners
                const event = new CustomEvent('chartDataUpdated', { detail: data });
                document.dispatchEvent(event);
                
                return;
            }
        }
        
        console.log('No simulator data found, using default data');
        
        // Use default data if no data is available
        const defaultData = {
            energy: {
                daily: [5, 8, 10, 12, 6],
                weekly: [40, 50, 45, 60, 55, 48, 52],
                monthly: [150, 170, 160, 180]
            },
            cost: {
                daily: [2, 3, 5, 4, 6],
                weekly: [20, 25, 22, 30, 28, 24, 26],
                monthly: [90, 100, 95, 105]
            },
            areaUsage: {
                "Meeting Room": 30,
                "Workstations": 40,
                "Common Areas": 25,
                "Special": 20
            },
            deviceUsage: {
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
            }
        };
        
        // Store the default data for reuse
        lastData = defaultData;
        
        // Make the data globally available
        window.totalEnergyData = defaultData.energy;
        window.totalCostData = defaultData.cost;
        window.areaData = defaultData.areaUsage;
        window.deviceData = defaultData.deviceUsage;
        
        updateChartsWithData(defaultData);
        
        // Also dispatch the chartDataUpdated event for direct listeners
        const event = new CustomEvent('chartDataUpdated', { detail: defaultData });
        document.dispatchEvent(event);
    } catch (error) {
        console.error('Error fetching simulator data:', error);
    }
}

// Fix area data structure if it's empty or malformed
function repairAreaData(data) {
    console.log('Checking area data quality:', data.areaUsage);
    
    // If areaUsage is empty, undefined, or not an object, create default
    if (!data.areaUsage || typeof data.areaUsage !== 'object' || Object.keys(data.areaUsage).length === 0) {
        console.log('Repairing empty area data with defaults');
        data.areaUsage = {
            "Meeting Room": 30,
            "Workstations": 40,
            "Common Areas": 25,
            "Special": 20
        };
    }
    
    // Ensure all values are positive numbers
    Object.keys(data.areaUsage).forEach(key => {
        // Fix any non-numeric values
        if (typeof data.areaUsage[key] !== 'number' || isNaN(data.areaUsage[key]) || data.areaUsage[key] < 0) {
            data.areaUsage[key] = 10; // Default value
        }
    });
    
    return data;
}

// Fix device data structure if it's empty or malformed
function repairDeviceData(data) {
    console.log('Checking device data quality:', data.deviceUsage);
    
    // If deviceUsage is empty, undefined, or not an object, create default
    if (!data.deviceUsage || typeof data.deviceUsage !== 'object' || Object.keys(data.deviceUsage).length === 0) {
        console.log('Repairing empty device data with defaults');
        data.deviceUsage = {
            "Lights": 50,
            "A/C": 20,
            "Speaker": 40,
            "Projector": 25,
            "Laptop": 10
        };
    }
    
    // Ensure all values are positive numbers
    Object.keys(data.deviceUsage).forEach(key => {
        // Fix any non-numeric values
        if (typeof data.deviceUsage[key] !== 'number' || isNaN(data.deviceUsage[key]) || data.deviceUsage[key] < 0) {
            data.deviceUsage[key] = 15; // Default value
        }
    });
    
    return data;
}

// Fix energy data structure if it's empty or malformed
function repairEnergyData(data) {
    console.log('Checking energy data quality:', data.energy);
    
    // If energy is empty, undefined, or not an object, create default
    if (!data.energy || typeof data.energy !== 'object') {
        console.log('Repairing empty energy data with defaults');
        data.energy = {
            daily: [5, 8, 10, 12, 6],
            weekly: [40, 50, 45, 60, 55, 48, 52],
            monthly: [150, 170, 160, 180]
        };
    } else {
        // Check each time period
        if (!data.energy.daily || !Array.isArray(data.energy.daily) || data.energy.daily.length === 0) {
            data.energy.daily = [5, 8, 10, 12, 6];
        }
        if (!data.energy.weekly || !Array.isArray(data.energy.weekly) || data.energy.weekly.length === 0) {
            data.energy.weekly = [40, 50, 45, 60, 55, 48, 52];
        }
        if (!data.energy.monthly || !Array.isArray(data.energy.monthly) || data.energy.monthly.length === 0) {
            data.energy.monthly = [150, 170, 160, 180];
        }
    }
    
    return data;
}

// Fix cost data structure if it's empty or malformed
function repairCostData(data) {
    console.log('Checking cost data quality:', data.cost);
    
    // If cost is empty, undefined, or not an object, create default
    if (!data.cost || typeof data.cost !== 'object') {
        console.log('Repairing empty cost data with defaults');
        data.cost = {
            daily: [2, 3, 5, 4, 6],
            weekly: [20, 25, 22, 30, 28, 24, 26],
            monthly: [90, 100, 95, 105]
        };
    } else {
        // Check each time period
        if (!data.cost.daily || !Array.isArray(data.cost.daily) || data.cost.daily.length === 0) {
            data.cost.daily = [2, 3, 5, 4, 6];
        }
        if (!data.cost.weekly || !Array.isArray(data.cost.weekly) || data.cost.weekly.length === 0) {
            data.cost.weekly = [20, 25, 22, 30, 28, 24, 26];
        }
        if (!data.cost.monthly || !Array.isArray(data.cost.monthly) || data.cost.monthly.length === 0) {
            data.cost.monthly = [90, 100, 95, 105];
        }
    }
    
    return data;
}

// Complete data repair function - call this before updating charts
function repairData(data) {
    if (!data) return null;
    
    // Create a deep copy to avoid modifying the original data
    const repairedData = JSON.parse(JSON.stringify(data));
    
    // Fix each data structure
    repairAreaData(repairedData);
    repairDeviceData(repairedData);
    repairEnergyData(repairedData);
    repairCostData(repairedData);
    
    return repairedData;
}


// Update the updateChartsWithData function to use the repair functions
function updateChartsWithData(data) {
    if (!data) {
        console.error('No data provided to updateChartsWithData');
        return;
    }
    
    // Repair the data before updating charts
    const repairedData = repairData(data);
    if (!repairedData) {
        console.error('Data repair failed');
        return;
    }
    
    console.log('Updating charts with repaired data:', repairedData);
    
    // Update energy usage chart
    if (charts.energyUsageChart && repairedData.energy && repairedData.energy[selectedTimePeriod]) {
        charts.energyUsageChart.data.datasets[0].data = repairedData.energy[selectedTimePeriod];
        charts.energyUsageChart.update();
        console.log('Updated energy usage chart with data:', repairedData.energy[selectedTimePeriod]);
    }
    
    // Update cost chart
    if (charts.energyCostChart && repairedData.cost && repairedData.cost[selectedTimePeriod]) {
        charts.energyCostChart.data.datasets[0].data = repairedData.cost[selectedTimePeriod];
        charts.energyCostChart.update();
        console.log('Updated energy cost chart with data:', repairedData.cost[selectedTimePeriod]);
    }
    
    // Update area bar chart
    if (charts.areaBarChart && repairedData.areaUsage) {
        const areas = Object.keys(repairedData.areaUsage);
        const values = Object.values(repairedData.areaUsage);
        
        // Make sure we have at least one non-zero value
        const hasData = values.some(v => v > 0);
        if (!hasData) {
            console.log('All area values are zero, using defaults instead');
            repairedData.areaUsage = {
                "Meeting Room": 30,
                "Workstations": 40,
                "Common Areas": 25,
                "Special": 20
            };
        }
        
        charts.areaBarChart.data.labels = Object.keys(repairedData.areaUsage);
        charts.areaBarChart.data.datasets[0].data = Object.values(repairedData.areaUsage);
        charts.areaBarChart.update();
        console.log('Updated area bar chart with data:', repairedData.areaUsage);
    }
    
    // Update device pie chart
    if (charts.devicePieChart && repairedData.deviceUsage) {
        const devices = Object.keys(repairedData.deviceUsage);
        const values = Object.values(repairedData.deviceUsage);
        
        // Make sure we have at least one non-zero value
        const hasData = values.some(v => v > 0);
        if (!hasData) {
            console.log('All device values are zero, using defaults instead');
            repairedData.deviceUsage = {
                "Lights": 50,
                "A/C": 20,
                "Speaker": 40,
                "Projector": 25,
                "Laptop": 10
            };
        }
        
        charts.devicePieChart.data.labels = Object.keys(repairedData.deviceUsage);
        charts.devicePieChart.data.datasets[0].data = Object.values(repairedData.deviceUsage);
        charts.devicePieChart.update();
        console.log('Updated device pie chart with data:', repairedData.deviceUsage);
    }
    
    // Update total figures
    updateTotalFigures(repairedData);
}
// Update total energy and cost figures
function updateTotalFigures(data) {
    // Update total energy
    const totalEnergyElement = document.getElementById('totalEnergy');
    if (totalEnergyElement && data.energy) {
        // Calculate total energy (sum of current time period)
        const totalEnergy = data.energy[selectedTimePeriod].reduce((sum, val) => sum + val, 0);
        totalEnergyElement.textContent = totalEnergy.toFixed(2);
    }
    
    // Update total cost
    const totalCostElement = document.getElementById('totalCost');
    if (totalCostElement && data.cost) {
        // Calculate total cost (sum of current time period)
        const totalCost = data.cost[selectedTimePeriod].reduce((sum, val) => sum + val, 0);
        totalCostElement.textContent = `£${totalCost.toFixed(2)}`;
    }
}

// Create a direct method to force a chart update from simulator data
export function forceChartUpdate(simulatorData) {
    console.log('Forcing chart update with provided data:', simulatorData);
    
    if (simulatorData) {
        // Store the data for reuse
        lastData = simulatorData;
        
        // Update charts
        updateChartsWithData(simulatorData);
    } else {
        // If no data provided, fetch fresh data
        fetchLatestSimulatorData();
    }
}

// Export chart updater functions for potential external use
export {
    fetchLatestSimulatorData,
    updateChartsWithData,
    charts,
    setupTimePeriodListeners
};