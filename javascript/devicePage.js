// Import shared data from energyData.js
import { timeLabels, deviceEnergyData, deviceCostData, devicesByArea, deviceData } from './energyData.js';

console.log("✅ energyData.js imported successfully!");
console.log("🔎 timeLabels:", timeLabels);
console.log("🔎 deviceEnergyData:", deviceEnergyData);
console.log("🔎 deviceCostData:", deviceCostData);
console.log("🔎 devicesByArea:", devicesByArea);

// **Chart Elements**
let deviceComparisonPieCtx, deviceComparisonBarCtx, deviceTimeCostCtx, deviceTimeEnergyCtx, deviceAreaPieCtx, deviceAreaBarCtx;
let selectedDevice = "Computers";
let selectedTime = "daily";
let devicePieChart, deviceBarChart, deviceEnergyChart, deviceCostChart, deviceAreaPieChart, deviceAreaBarChart;

// **Ensure Graph Elements Are Loaded Before Use**
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded. Initializing graphs...");

    // **Assign chart elements after DOM loads**
    deviceComparisonPieCtx = document.getElementById('deviceComparisonPie').getContext('2d');
    deviceComparisonBarCtx = document.getElementById('deviceComparisonBar').getContext('2d');
    deviceTimeCostCtx = document.getElementById('deviceTimeCostChart').getContext('2d');
    deviceTimeEnergyCtx = document.getElementById('deviceTimeEnergyChart').getContext('2d');
    deviceAreaPieCtx = document.getElementById('deviceAreaPieChart').getContext('2d');
    deviceAreaBarCtx = document.getElementById('deviceAreaBarChart').getContext('2d');

    // **Create Initial Graphs**
    createDeviceTimeGraphs();
    createDeviceAreaGraphs();
    calculateTotals();

    // **Dropdown Change Event**
    document.getElementById("deviceTypeDropdown").addEventListener("change", function () {
        selectedDevice = this.value;  // Update selected device
        selectedTime = "daily";       // Reset time selection

        updateDeviceData(); // Update all graphs

        // **Ensure the "daily" button is highlighted**
        document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
        document.getElementById("daily").classList.add("active-button");
    });

    // **Time Selection Buttons**
    document.getElementById("daily").addEventListener("click", () => updateDeviceTimeGraphs('daily'));
    document.getElementById("weekly").addEventListener("click", () => updateDeviceTimeGraphs('weekly'));
    document.getElementById("monthly").addEventListener("click", () => updateDeviceTimeGraphs('monthly'));
});

// **Get Device Energy Usage Across Areas**
function getDeviceEnergyAcrossAreas(device) {
    let areaLabels = [];
    let areaEnergyUsage = [];

    Object.entries(devicesByArea).forEach(([area, devices]) => {
        let totalEnergy = 0;
        devices.forEach(d => {
            if (d.name === device) {
                totalEnergy += d.energy;
            }
        });

        if (totalEnergy > 0) {
            areaLabels.push(area);
            areaEnergyUsage.push(totalEnergy);
        }
    });

    return { labels: areaLabels, data: areaEnergyUsage };
}

// **Initialize Device Usage Across Areas Graphs**
function createDeviceAreaGraphs() {
    let { labels, data } = getDeviceEnergyAcrossAreas(selectedDevice);

    if (deviceAreaPieChart) deviceAreaPieChart.destroy();
    if (deviceAreaBarChart) deviceAreaBarChart.destroy();

    deviceAreaPieChart = new Chart(deviceAreaPieCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'teal']
            }]
        }
    });

    deviceAreaBarChart = new Chart(deviceAreaBarCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Energy Usage (kW) - ${selectedDevice}`,
                data: data,
                backgroundColor: 'purple'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// **Get Time-Based Energy Data for Selected Device**
function getDeviceEnergyData(device, time) {
    return deviceEnergyData[device]?.[time] ?? Array(timeLabels[time].length).fill(0);
}

// **Get Time-Based Cost Data for Selected Device**
function getDeviceCostData(device, time) {
    return deviceCostData[device]?.[time] ?? Array(timeLabels[time].length).fill(0);
}

// **Initialize Time-Based Graphs**
function createDeviceTimeGraphs() {
    console.log(`🔍 Initializing Time Graphs for '${selectedDevice}' (${selectedTime})`);

    if (deviceEnergyChart) deviceEnergyChart.destroy();
    if (deviceCostChart) deviceCostChart.destroy();

    deviceEnergyChart = new Chart(deviceTimeEnergyCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: `Energy (kW) - ${selectedDevice}`,
                data: getDeviceEnergyData(selectedDevice, selectedTime),
                borderColor: 'blue',
                fill: false
            }]
        }
    });

    deviceCostChart = new Chart(deviceTimeCostCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: `Cost (£) - ${selectedDevice}`,
                data: getDeviceCostData(selectedDevice, selectedTime),
                borderColor: 'red',
                fill: false
            }]
        }
    });
}

// **Update Time Graphs Based on Period Selection**
window.updateDeviceTimeGraphs = function (period) {
    selectedTime = period;
    console.log(`🔄 Updating Time Graphs for ${selectedDevice} (${period})`);

    deviceEnergyChart.data.labels = timeLabels[selectedTime];
    deviceEnergyChart.data.datasets[0].data = getDeviceEnergyData(selectedDevice, selectedTime);
    deviceEnergyChart.update();

    deviceCostChart.data.labels = timeLabels[selectedTime];
    deviceCostChart.data.datasets[0].data = getDeviceCostData(selectedDevice, selectedTime);
    deviceCostChart.update();

    // Highlight the active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");
};

// **Update All Graphs When Changing Device Type**
function updateDeviceData() {
    console.log(`🔄 Updating data for: ${selectedDevice}`);

    createDeviceTimeGraphs();
    createDeviceAreaGraphs();
    calculateTotals();
}

// **Calculate Totals for Sticky Footer**
function calculateTotals() {
    let totalEnergy = 0, totalCost = 0;
    let minUsage = Infinity, maxUsage = -Infinity;
    let minDevice = "", maxDevice = "";

    Object.entries(deviceData).forEach(([device, usage]) => {
        totalEnergy += usage;
        totalCost += usage * 2; // Assume cost is proportional to energy usage

        if (usage < minUsage) {
            minUsage = usage;
            minDevice = device;
        }
        if (usage > maxUsage) {
            maxUsage = usage;
            maxDevice = device;
        }
    });

    document.getElementById('totalEnergy').textContent = `${totalEnergy}`;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}`;
    document.getElementById('minUsageDevice').textContent = `${minDevice}`;
    document.getElementById('maxUsageDevice').textContent = `${maxDevice}`;
}
