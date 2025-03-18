// chart-updater.js - Functions to update chart.js instances with simulator data

// Function to get a Chart.js instance by canvas ID
function getChartById(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    // Try to find the chart instance
    return Chart.getChart(canvas);
}

// Update Dashboard Power Consumption Chart
export function updateDashboardConsumptionChart(data) {
    const chart = getChartById('energyUsageChart');
    if (!chart) return false;
    
    // Determine which data to use based on current period selection
    const selectedTime = window.selectedTime || 'daily'; // Fallback to daily if not set
    
    // Add safeguards to check data is properly structured
    if (!data || !data[selectedTime] || !Array.isArray(data[selectedTime])) {
        console.error('Invalid energy data format for dashboard consumption chart:', data);
        return false;
    }
    
    // Update chart data
    chart.data.datasets[0].data = data[selectedTime];
    chart.update();
    
    console.log(`Updated dashboard consumption chart with data:`, data[selectedTime]);
    return true;
}

// Update pUsage Overall Usage Chart
export function updatePowerUsageOverallChart(data) {
    const chart = getChartById('energyUsageChart');
    if (!chart) return false;
    
    // Determine which data to use based on current period selection
    const selectedTime = window.selectedTime || 'daily'; // Fallback to daily if not set
    
    // Add safeguards to check data is properly structured
    if (!data || !data[selectedTime] || !Array.isArray(data[selectedTime])) {
        console.error('Invalid energy data format for power usage chart:', data);
        return false;
    }
    
    // Update chart data
    chart.data.datasets[0].data = data[selectedTime];
    chart.update();
    
    console.log(`Updated power usage overall chart with data:`, data[selectedTime]);
    return true;
}

// Update pUsage Area Bar Chart
export function updatePowerUsageAreaChart(areaData) {
    const chart = getChartById('areaBarChart');
    if (!chart) return false;
    
    // Add safeguards to check data is properly structured
    if (!areaData || typeof areaData !== 'object' || Object.keys(areaData).length === 0) {
        console.error('Invalid area data format:', areaData);
        return false;
    }
    
    // Update labels and data
    chart.data.labels = Object.keys(areaData);
    chart.data.datasets[0].data = Object.values(areaData);
    chart.update();
    
    console.log(`Updated area bar chart with data:`, areaData);
    return true;
}

// Update pUsage Device Pie Chart
export function updatePowerUsageDeviceChart(deviceData) {
    const chart = getChartById('devicePieChart');
    if (!chart) return false;
    
    // Add safeguards to check data is properly structured
    if (!deviceData || typeof deviceData !== 'object' || Object.keys(deviceData).length === 0) {
        console.error('Invalid device data format:', deviceData);
        return false;
    }
    
    // Update labels and data
    chart.data.labels = Object.keys(deviceData);
    chart.data.datasets[0].data = Object.values(deviceData);
    chart.update();
    
    console.log(`Updated device pie chart with data:`, deviceData);
    return true;
}

// Update overallUsage Energy Chart
export function updateOverallEnergyChart(data) {
    const chart = getChartById('energyUsageChart');
    if (!chart) return false;
    
    // Determine which data to use based on current period selection
    const selectedTime = window.selectedTime || 'daily'; // Fallback to daily if not set
    
    // Add safeguards to check data is properly structured
    if (!data || !data[selectedTime] || !Array.isArray(data[selectedTime])) {
        console.error('Invalid energy data format for overall energy chart:', data);
        return false;
    }
    
    // Update chart data
    chart.data.datasets[0].data = data[selectedTime];
    chart.update();
    
    console.log(`Updated overall energy chart with data:`, data[selectedTime]);
    return true;
}

// Update overallUsage Cost Chart
export function updateOverallCostChart(data) {
    const chart = getChartById('energyCostChart');
    if (!chart) return false;
    
    // Determine which data to use based on current period selection
    const selectedTime = window.selectedTime || 'daily'; // Fallback to daily if not set
    
    // Add safeguards to check data is properly structured
    if (!data || !data[selectedTime] || !Array.isArray(data[selectedTime])) {
        console.error('Invalid cost data format:', data);
        return false;
    }
    
    // Update chart data
    chart.data.datasets[0].data = data[selectedTime];
    chart.update();
    
    console.log(`Updated overall cost chart with data:`, data[selectedTime]);
    return true;
}

// Update all charts on a page based on the current page
export function updateAllChartsOnPage(pageType, energyData, costData, areaData, deviceData) {
    console.log(`Updating all charts on ${pageType} page:`, {
        energyData, costData, areaData, deviceData
    });
    
    if (pageType === 'dashboard') {
        // Update dashboard charts
        if (energyData) updateDashboardConsumptionChart(energyData);
    } 
    else if (pageType === 'pUsage') {
        // Update power usage charts
        if (energyData) updatePowerUsageOverallChart(energyData);
        if (areaData) updatePowerUsageAreaChart(areaData);
        if (deviceData) updatePowerUsageDeviceChart(deviceData);
    } 
    else if (pageType === 'overallUsage') {
        // Update overall usage charts
        if (energyData) updateOverallEnergyChart(energyData);
        if (costData) updateOverallCostChart(costData);
    }
}

// Function to handle time period changes
export function setupTimeSelectionListeners() {
    // Find all time period selection buttons
    const timeButtons = document.querySelectorAll('.graph-buttons button');
    
    // Set the initial selected time if it doesn't exist
    if (!window.selectedTime) {
        window.selectedTime = 'daily';
    }
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Store the selected time period in a global variable for the updater to access
            window.selectedTime = this.id; // 'daily', 'weekly', or 'monthly'
            console.log(`Time period changed to: ${window.selectedTime}`);
        });
    });
    
    // Highlight the default button
    const defaultButton = document.getElementById(window.selectedTime);
    if (defaultButton) {
        defaultButton.classList.add('active-button');
    }
}

// Calculate and update total figures displayed on the page
export function updateTotalFigures() {
    // Update total energy figure
    const totalEnergyElement = document.getElementById('totalEnergy');
    if (totalEnergyElement) {
        let totalEnergy = 0;
        
        // Calculate total energy from devices
        if (window.devicesByArea) {
            Object.values(window.devicesByArea).forEach(devices => {
                devices.forEach(device => {
                    totalEnergy += device.energy;
                });
            });
        }
        
        totalEnergyElement.textContent = totalEnergy.toFixed(2);
    }
    
    // Update total cost figure
    const totalCostElement = document.getElementById('totalCost');
    if (totalCostElement) {
        let totalCost = 0;
        
        // Calculate total cost from devices
        if (window.devicesByArea) {
            Object.values(window.devicesByArea).forEach(devices => {
                devices.forEach(device => {
                    totalCost += device.cost;
                });
            });
        }
        
        totalCostElement.textContent = `£${totalCost.toFixed(2)}`;
    }
}

// Automatic chart updater that listens for data changes
export function initializeAutoChartUpdater() {
    // Detect current page
    const path = window.location.pathname;
    let pageType = 'unknown';
    
    if (path.includes('dashboard.html')) {
        pageType = 'dashboard';
    } else if (path.includes('pUsage.html')) {
        pageType = 'pUsage';
    } else if (path.includes('overallUsage.html')) {
        pageType = 'overallUsage';
    }
    
    // Set up event listener for energy data updates
    document.addEventListener('energyDataUpdated', function(e) {
        // Get the latest data
        const { totalEnergyData, totalCostData, areaData, deviceData } = window;
        
        // Safeguard check - only update if we have proper data
        if (totalEnergyData && totalCostData && areaData && deviceData) {
            // Update all charts on the current page
            updateAllChartsOnPage(pageType, totalEnergyData, totalCostData, areaData, deviceData);
            console.log(`Auto-updated charts on ${pageType} page`);
        } else {
            console.warn('Missing data for chart update:', {
                totalEnergyData, totalCostData, areaData, deviceData
            });
        }
    });
}

// Function to initialize all chart update functionality
export function initializeChartUpdater() {
    console.log("Initializing chart updater");
    
    // Detect current page
    const path = window.location.pathname;
    let pageType = 'unknown';
    
    if (path.includes('dashboard.html')) {
        pageType = 'dashboard';
    } else if (path.includes('pUsage.html')) {
        pageType = 'pUsage';
    } else if (path.includes('overallUsage.html')) {
        pageType = 'overallUsage';
    }
    
    console.log(`Current page type: ${pageType}`);
    
    // Set up time selection listeners
    setupTimeSelectionListeners();
    
    // Set up event listener for energy data updates
    document.addEventListener('energyDataUpdated', function(e) {
        console.log(`Energy data updated event received on ${pageType} page`);
        
        // Make sure the charts are initialized before updating
        setTimeout(() => {
            // Get the latest data - these are expected to be global variables set by energyData.js
            // Add safeguards to ensure we have valid data
            let energyData = window.totalEnergyData || null;
            let costData = window.totalCostData || null;
            let areaData = window.areaData || null;
            let deviceData = window.deviceData || null;
            
            // Log the data we're about to use for debugging
            console.log('Updating charts with data:', {
                energyData, costData, areaData, deviceData
            });
            
            // Update all charts on the current page if we have valid data
            if (energyData || costData || areaData || deviceData) {
                updateAllChartsOnPage(pageType, energyData, costData, areaData, deviceData);
                
                // Update total figures displayed on the page
                updateTotalFigures();
                
                console.log(`Charts updated on ${pageType} page`);
            } else {
                console.warn('No valid data available for chart update');
            }
        }, 500); // Small delay to ensure charts are initialized
    });
    
    // Also set up generation data update listener for dashboard
    document.addEventListener('energyGenerationDataUpdated', function(e) {
        if (pageType === 'dashboard') {
            console.log('Energy generation data updated event received on dashboard page');
            
            // Update any generation-related charts or UI elements
            const generationChart = getChartById('energyGeneratedChart');
            if (generationChart && window.totalEnergyDataGenerated) {
                generationChart.data.datasets[0].data = window.totalEnergyDataGenerated[window.selectedTime || 'daily'];
                generationChart.update();
                console.log('Updated generation chart on dashboard');
            }
        }
    });
    
    // Also listen for the direct chartDataUpdated events
    document.addEventListener('chartDataUpdated', function(e) {
        console.log('Received chartDataUpdated event with data:', e.detail);
        
        // Ensure we have detail data before proceeding
        if (e.detail) {
            const data = e.detail;
            
            // Update the global variables
            if (data.energy) window.totalEnergyData = data.energy;
            if (data.cost) window.totalCostData = data.cost;
            if (data.areaUsage) window.areaData = data.areaUsage;
            if (data.deviceUsage) window.deviceData = data.deviceUsage;
            if (data.devicesByArea) window.devicesByArea = data.devicesByArea;
            
            // Update charts with the new data
            updateAllChartsOnPage(
                pageType, 
                data.energy, 
                data.cost, 
                data.areaUsage, 
                data.deviceUsage
            );
            
            // Update total figures
            updateTotalFigures();
        }
    });
    
    // Initial update - wait a bit longer to ensure charts are initialized
    console.log('Scheduling initial chart update');
    setTimeout(() => {
        // Get whatever data we have available
        const energyData = window.totalEnergyData;
        const costData = window.totalCostData;
        const areaData = window.areaData;
        const deviceData = window.deviceData;
        
        // Check if we have any valid data to update with
        if (energyData || costData || areaData || deviceData) {
            updateAllChartsOnPage(pageType, energyData, costData, areaData, deviceData);
            updateTotalFigures();
            console.log('Initial chart update completed');
        } else {
            console.warn('No data available for initial chart update');
        }
    }, 2000); // Longer delay for initial update
}

// Initialize updater when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for charts to initialize
    setTimeout(() => {
        initializeChartUpdater();
    }, 1000);
});