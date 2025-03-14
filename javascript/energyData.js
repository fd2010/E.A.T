// Example showing how to use the real-time energy data in your charts
// This would replace parts of your existing areaWise.js, deviceWise.js, etc.

// First, import the new data module with both the static exports and async methods
import { 
    timeLabels, 
    // Async data fetching functions - use these for real-time data
    fetchTotalEnergyData,
    fetchTotalCostData,
    fetchEnergyDataByRoom,
    fetchCostDataByRoom,
    fetchAreaData,
    fetchDeviceData,
    fetchDevicesByArea,
    fetchDeviceEnergyData,
    fetchDeviceCostData,
    // Default exports for backward compatibility
    totalEnergyData,
    totalCostData,
    energyData,
    costData,
    areaData,
    deviceData,
    devicesByArea,
    deviceEnergyData,
    deviceCostData
} from './realEnergyData.js';

// Initialize chart variables
let areaPieChart, areaBarChart, energyChart, costChart, devicePieChart, deviceBarChart;
let selectedArea = "Meeting Room";
let selectedTime = "daily";

// Example: Update time graphs with real-time data
async function updateTimeGraphs(period) {
    selectedTime = period;
    console.log(`Updating Time Graphs for ${selectedArea} (${period})`);

    try {
        // Fetch real-time data for the selected area
        const realEnergyData = await fetchEnergyDataByRoom();
        const realCostData = await fetchCostDataByRoom();

        // Check if the selected area exists in the data
        if (!realEnergyData[selectedArea] || !realCostData[selectedArea]) {
            console.error(`No energy or cost data found for '${selectedArea}'`);
            return;
        }

        // Update energy chart with real-time data
        energyChart.data.labels = timeLabels[selectedTime];
        energyChart.data.datasets[0].data = realEnergyData[selectedArea][selectedTime];
        energyChart.update();

        // Update cost chart with real-time data
        costChart.data.labels = timeLabels[selectedTime];
        costChart.data.datasets[0].data = realCostData[selectedArea][selectedTime];
        costChart.update();

        // Update active button state
        document.querySelectorAll(".graph-buttons button").forEach(btn => {
            btn.classList.remove("active-button");
        });
        document.getElementById(period).classList.add("active-button");
    } catch (error) {
        console.error("Error updating time graphs with real-time data:", error);
        
        // Fallback to static data if there's an error
        energyChart.data.labels = timeLabels[selectedTime];
        energyChart.data.datasets[0].data = energyData[selectedArea][selectedTime];
        energyChart.update();

        costChart.data.labels = timeLabels[selectedTime];
        costChart.data.datasets[0].data = costData[selectedArea][selectedTime];
        costChart.update();
    }
}

// Example: Initialize area comparison charts with real-time data
async function createAreaCharts() {
    try {
        // Fetch real-time area data
        const realAreaData = await fetchAreaData();
        
        // Create pie chart with real data
        areaPieChart = new Chart(areaComparisonPieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(realAreaData),
                datasets: [{
                    data: Object.values(realAreaData),
                    backgroundColor: ['red', 'blue', 'green', 'teal']
                }]
            }
        });

        // Create bar chart with real data
        areaBarChart = new Chart(areaComparisonBarCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(realAreaData),
                datasets: [{
                    label: 'Energy Usage (kW)',
                    data: Object.values(realAreaData),
                    backgroundColor: 'teal'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    } catch (error) {
        console.error("Error creating area charts with real-time data:", error);
        
        // Fallback to static data if there's an error
        areaPieChart = new Chart(areaComparisonPieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(areaData),
                datasets: [{
                    data: Object.values(areaData),
                    backgroundColor: ['red', 'blue', 'green', 'teal']
                }]
            }
        });

        areaBarChart = new Chart(areaComparisonBarCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(areaData),
                datasets: [{
                    label: 'Energy Usage (kW)',
                    data: Object.values(areaData),
                    backgroundColor: 'teal'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    }
}

// Example: Update area data when changing selected area
async function updateAreaData() {
    console.log("Selected Area:", selectedArea);

    try {
        // Fetch real-time devices by area data
        const realDevicesByArea = await fetchDevicesByArea();
        
        if (!realDevicesByArea[selectedArea]) {
            console.error(`No data found for selected area: '${selectedArea}'`);
            return;
        }

        let deviceHTML = "";
        let deviceNames = [];
        let deviceEnergy = [];

        realDevicesByArea[selectedArea].forEach(device => {
            deviceHTML += `
                <div class="device-panel">
                    <h3>${device.name}</h3>
                    <p>Usage: ${device.energy} kWh | Cost: £${device.cost}</p>
                </div>`;
            deviceNames.push(device.name);
            deviceEnergy.push(device.energy);
        });

        document.getElementById('deviceList').innerHTML = deviceHTML;

        if (devicePieChart) devicePieChart.destroy();
        if (deviceBarChart) deviceBarChart.destroy();

        devicePieChart = new Chart(devicePieCtx, {
            type: 'pie',
            data: {
                labels: deviceNames,
                datasets: [{
                    data: deviceEnergy,
                    backgroundColor: ['red', 'blue', 'green', 'orange', 'purple']
                }]
            }
        });

        deviceBarChart = new Chart(deviceBarCtx, {
            type: 'bar',
            data: {
                labels: deviceNames,
                datasets: [{
                    label: 'Energy Usage (kW)',
                    data: deviceEnergy,
                    backgroundColor: 'purple'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        // Update time graphs with real-time data
        await updateTimeGraphs(selectedTime);
    } catch (error) {
        console.error("Error updating area data with real-time data:", error);
        
        // Fallback to static data if there's an error
        // Code to use static devicesByArea data would go here
    }
}

// Example: Calculate totals with real-time data
async function calculateTotals() {
    try {
        // Fetch real-time data
        const realDevicesByArea = await fetchDevicesByArea();
        
        let totalEnergy = 0, totalCost = 0;
        let minRoom = "", maxRoom = "", minDevice = "", maxDevice = "";
        let minEnergy = Infinity, maxEnergy = -Infinity;
        let minRoomEnergy = Infinity, maxRoomEnergy = -Infinity;

        Object.entries(realDevicesByArea).forEach(([room, devices]) => {
            let roomTotal = 0;

            devices.forEach(device => {
                totalEnergy += device.energy;
                totalCost += device.cost;
                roomTotal += device.energy;

                // Track minimum and maximum energy usage for devices
                if (device.energy < minEnergy) {
                    minEnergy = device.energy;
                    minDevice = device.name;
                }
                if (device.energy > maxEnergy) {
                    maxEnergy = device.energy;
                    maxDevice = device.name;
                }
            });

            // Track minimum and maximum energy usage for rooms
            if (roomTotal < minRoomEnergy) {
                minRoomEnergy = roomTotal;
                minRoom = room;
            }
            if (roomTotal > maxRoomEnergy) {
                maxRoomEnergy = roomTotal;
                maxRoom = room;
            }
        });

        // Update UI with real data
        document.getElementById('totalEnergy').textContent = `${totalEnergy}`;
        document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}`;
        document.getElementById('minUsageRoom').textContent = ` ${minRoom}`;
        document.getElementById('maxUsageRoom').textContent = ` ${maxRoom}`;
        document.getElementById('minUsageDevice').textContent = ` ${minDevice}`;
        document.getElementById('maxUsageDevice').textContent = ` ${maxDevice}`;
    } catch (error) {
        console.error("Error calculating totals with real-time data:", error);
        
        // Fallback to static data calculation if there's an error
        // Code to calculate totals using static devicesByArea would go here
    }
}

// Set up auto-refresh to keep data updated
function setupAutoRefresh() {
    // Refresh data every 5 minutes
    setInterval(async () => {
        console.log("Auto-refreshing data...");
        
        // Refresh all charts with latest data
        await createAreaCharts();
        await updateAreaData();
        await calculateTotals();
        
        console.log("Data auto-refresh complete");
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
}

// Example: Initialize everything on page load
document.addEventListener("DOMContentLoaded", async function() {
    console.log(" Canvas elements loaded correctly!");
    selectedArea = document.getElementById('areaTypeDropdown').value;

    // Call functions with real-time data
    await createAreaCharts();
    await updateAreaData();
    await calculateTotals();
    
    // Set up auto-refresh
    setupAutoRefresh();
    
    // Event listener for dropdowns
    document.getElementById('areaTypeDropdown').addEventListener('change', function() {
        selectedArea = this.value;
        console.log(" Updating area:", selectedArea);
        updateAreaData();
    });

    // Time period buttons
    document.getElementById('daily').addEventListener('click', () => updateTimeGraphs('daily'));
    document.getElementById('weekly').addEventListener('click', () => updateTimeGraphs('weekly'));
    document.getElementById('monthly').addEventListener('click', () => updateTimeGraphs('monthly'));
});