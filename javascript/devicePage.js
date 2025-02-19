// Import shared data from energyData.js
import { timeLabels, deviceEnergyData, deviceCostData, devicesByArea, deviceData } from './energyData.js';


// **Assign chart elements after DOM loads**
const deviceComparisonPieCtx = document.getElementById('deviceComparisonPie').getContext('2d');
const deviceComparisonBarCtx = document.getElementById('deviceComparisonBar').getContext('2d');
const deviceTimeCostCtx = document.getElementById('deviceTimeCostChart').getContext('2d');
const deviceTimeEnergyCtx = document.getElementById('deviceTimeEnergyChart').getContext('2d');
const deviceAreaPieCtx = document.getElementById('deviceAreaPieChart').getContext('2d');
const deviceAreaBarCtx = document.getElementById('deviceAreaBarChart').getContext('2d');

// **Chart Elements**
let deviceComparisonPieCtx, deviceComparisonBarCtx, deviceTimeCostCtx, deviceTimeEnergyCtx, deviceAreaPieCtx, deviceAreaBarCtx;
let selectedDevice = "Computers";
let selectedTime = "daily";
let devicePieChart, deviceBarChart, deviceEnergyChart, deviceCostChart, deviceAreaPieChart, deviceAreaBarChart;


// **Function to Create Device Comparison Graphs**
function createDeviceComparisonGraphs() {
    console.log("📊 Creating Device Comparison Graphs...");

    if (devicePieChart) devicePieChart.destroy();
    if (deviceBarChart) deviceBarChart.destroy();

    const deviceLabels = Object.keys(deviceData);
    const deviceUsage = Object.values(deviceData);

    // **Create Pie Chart for Device Comparison**
    devicePieChart = new Chart(deviceComparisonPieCtx, {
        type: 'pie',
        data: {
            labels: deviceLabels,
            datasets: [{
                data: deviceUsage,
                backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'teal']
            }]
        },
        options: { responsive: true }
    });

    // **Create Bar Chart for Device Comparison**
    deviceBarChart = new Chart(deviceComparisonBarCtx, {
        type: 'bar',
        data: {
            labels: deviceLabels,
            datasets: [{
                label: 'Energy Usage (kW)',
                data: deviceUsage,
                backgroundColor: 'purple'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    console.log("✅ Device Comparison Graphs Created!");
}

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

    // **Ensure Active Button is Highlighted**
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

// **Dropdown Change Event**
document.getElementById("deviceTypeDropdown").addEventListener("change", function () {
    selectedDevice = this.value;  // Update selected device
    selectedTime = "daily";       // Reset time selection

    updateDeviceData(); // Update all graphs

    // **Ensure the "daily" button is highlighted**
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById("daily").classList.add("active-button");
});

// **Ensure Graph Elements Are Loaded Before Use**
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded. Initializing graphs...");

    // **Create Initial Graphs**
    createDeviceComparisonGraphs();
    createDeviceTimeGraphs();
    createDeviceAreaGraphs();
    calculateTotals();

    // **Time Selection Buttons**
    document.getElementById("daily").addEventListener("click", () => updateDeviceTimeGraphs('daily'));
    document.getElementById("weekly").addEventListener("click", () => updateDeviceTimeGraphs('weekly'));
    document.getElementById("monthly").addEventListener("click", () => updateDeviceTimeGraphs('monthly'));

    // **Set Daily as Default Active Button**
    document.getElementById("daily").classList.add("active-button");
});