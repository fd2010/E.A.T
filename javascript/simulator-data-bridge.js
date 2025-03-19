// simulator-data-bridge.js - UPDATED VERSION
import { energyDataGenerator } from './simulation-data-generator.js';

// Function to inject simulated data into the charts
export function injectSimulatedData() {
  console.log('Initializing simulation data bridge');
  
  // Get initial simulated data
  const simulatedData = energyDataGenerator.getData();
  
  // Define global variables accessed by charts
  if (typeof window.timeLabels === 'undefined') {
    // Create timeLabels if it doesn't exist yet
    window.timeLabels = {
      daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
      weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    };
  }
  
  // CRITICAL: Replace the energyData module's exported variables
  console.log('Injecting simulated data into global scope');
  
  // Main data objects that need to be exposed globally for the charts
  window.totalEnergyData = {
    daily: simulatedData.energy.daily,
    weekly: simulatedData.energy.weekly,
    monthly: simulatedData.energy.monthly
  };
  
  window.totalCostData = {
    daily: simulatedData.cost.daily,
    weekly: simulatedData.cost.weekly,
    monthly: simulatedData.cost.monthly
  };
  
  window.areaData = simulatedData.areaUsage;
  window.deviceData = simulatedData.deviceUsage;
  
  // Setup area-specific data used by area charts
  window.energyData = {};
  Object.keys(simulatedData.areaUsage).forEach(area => {
    const areaFactor = simulatedData.areaUsage[area] / 
                    Object.values(simulatedData.areaUsage).reduce((sum, val) => sum + val, 0);
    
    window.energyData[area] = {
      daily: simulatedData.energy.daily.map(value => value * areaFactor),
      weekly: simulatedData.energy.weekly.map(value => value * areaFactor),
      monthly: simulatedData.energy.monthly.map(value => value * areaFactor)
    };
  });
  
  // Setup area-specific cost data
  window.costData = {};
  Object.keys(simulatedData.areaUsage).forEach(area => {
    window.costData[area] = {
      daily: window.energyData[area].daily.map(kWh => kWh * 0.28),
      weekly: window.energyData[area].weekly.map(kWh => kWh * 0.28),
      monthly: window.energyData[area].monthly.map(kWh => kWh * 0.28)
    };
  });
  
  // Create devicesByArea structure for pie chart
  window.devicesByArea = {};
  Object.keys(simulatedData.areaUsage).forEach(area => {
    window.devicesByArea[area] = [];
    
    Object.entries(simulatedData.deviceUsage).forEach(([device, totalEnergy]) => {
      const areaFactor = simulatedData.areaUsage[area] / 
                      Object.values(simulatedData.areaUsage).reduce((sum, val) => sum + val, 0);
      
      const energyInArea = totalEnergy * areaFactor;
      
      window.devicesByArea[area].push({
        name: device,
        energy: parseFloat(energyInArea.toFixed(2)),
        cost: parseFloat((energyInArea * 0.28).toFixed(2))
      });
    });
  });
  
  // CRITICAL: Override the update function used by the charts
  window.updateEnergyDataNow = function() {
    console.log('Refreshing simulated energy data');
    
    // Generate new data
    const newData = energyDataGenerator.refreshData();
    
    // Update all global variables with new data
    window.totalEnergyData.daily = newData.energy.daily;
    window.totalEnergyData.weekly = newData.energy.weekly;
    window.totalEnergyData.monthly = newData.energy.monthly;
    
    window.totalCostData.daily = newData.cost.daily;
    window.totalCostData.weekly = newData.cost.weekly;
    window.totalCostData.monthly = newData.cost.monthly;
    
    window.areaData = newData.areaUsage;
    window.deviceData = newData.deviceUsage;
    
    // Update all other derived data structures (energyData, costData, devicesByArea)
    // ...similar to the code above
    
    // Force chart update by triggering the energyDataUpdated event
    console.log('Dispatching energyDataUpdated event');
    const event = new CustomEvent('energyDataUpdated');
    document.dispatchEvent(event);
    
    // If the updateAllCharts function exists, call it directly
    if (typeof window.updateAllCharts === 'function') {
      console.log('Calling updateAllCharts function directly');
      window.updateAllCharts();
    }
    
    // Call updateTimeGraphs with current period if it exists
    if (typeof window.updateTimeGraphs === 'function') {
      const activeButton = document.querySelector('.graph-buttons button.active-button');
      const period = activeButton ? activeButton.id : 'daily';
      console.log('Calling updateTimeGraphs with period:', period);
      window.updateTimeGraphs(period);
    }
    
    return Promise.resolve(newData);
  };
  
  // Set up timing for regular data updates
  setInterval(() => {
    console.log('Auto-refreshing simulation data');
    window.updateEnergyDataNow();
  }, 60 * 1000); // Every minute
  
  // Force initial update
  setTimeout(() => {
    console.log('Forcing initial chart update');
    window.updateEnergyDataNow();
  }, 1000); // Small delay to ensure charts are initialized
  
  console.log('Simulation data bridge initialized successfully');
}