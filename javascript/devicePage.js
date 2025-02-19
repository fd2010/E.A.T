// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, deviceData } from './energyData.js';

console.log("✅ energyData.js imported successfully!");
console.log("🔎 timeLabels:", timeLabels);
console.log("🔎 energyData:", energyData);
console.log("🔎 devicesByArea:", devicesByArea);

// **Chart Elements**
const deviceComparisonPieCtx = document.getElementById('deviceComparisonPie').getContext('2d');
const deviceComparisonBarCtx = document.getElementById('deviceComparisonBar').getContext('2d');
const deviceTimeCostCtx = document.getElementById('deviceTimeCostChart').getContext('2d');
const deviceTimeEnergyCtx = document.getElementById('deviceTimeEnergyChart').getContext('2d');
const deviceAreaPieCtx = document.getElementById('deviceAreaPieChart').getContext('2d');
const deviceAreaBarCtx = document.getElementById('deviceAreaBarChart').getContext('2d');

let selectedDevice = "Computers";
let selectedTime = "daily";
let devicePieChart, deviceBarChart, deviceEnergyChart, deviceCostChart, deviceAreaPieChart, deviceAreaBarChart;

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
    let data = Array(timeLabels[time].length).fill(0);

    Object.entries(devicesByArea).forEach(([area, devices]) => {
        devices.forEach(d => {
            if (d.name === device) {
                data = data.map((val, index) => val + (energyData[area] ? energyData[area][time][index] || 0 : 0));
            }
        });
    });

    return data;
}

// **Get Time-Based Cost Data for Selected Device**
function getDeviceCostData(device, time) {
    let data = Array(timeLabels[time].length).fill(0);

    Object.entries(devicesByArea).forEach(([area, devices]) => {
        devices.forEach(d => {
            if (d.name === device) {
                data = data.map((val, index) => val + (costData[area] ? costData[area][time][index] || 0 : 0));
            }
        });
    });

    return data;
}

// **Initialize Time-Based Graphs**
function createDeviceTimeGraphs() {
    console.log(`🔍 Initializing Time Graphs for '${selectedDevice}' (${selectedTime})`);

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

// **Update Device Usage Across Areas Graphs**
function updateDeviceAreaGraphs() {
    let { labels, data } = getDeviceEnergyAcrossAreas(selectedDevice);

    deviceAreaPieChart.data.labels = labels;
    deviceAreaPieChart.data.datasets[0].data = data;
    deviceAreaPieChart.update();

    deviceAreaBarChart.data.labels = labels;
    deviceAreaBarChart.data.datasets[0].data = data;
    deviceAreaBarChart.update();
}

// **Update All Graphs When Changing Device Type**
function updateDeviceData() {
    console.log(`🔄 Updating data for: ${selectedDevice}`);

    updateDeviceTimeGraphs(selectedTime);
    updateDeviceAreaGraphs();
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

    // Assign values to the footer
    document.getElementById('totalEnergy').textContent = `${totalEnergy}`;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}`;
    document.getElementById('minUsageDevice').textContent = `${minDevice}`;
    document.getElementById('maxUsageDevice').textContent = `${maxDevice}`;
}

// **Dropdown Event Listener for Device Selection**
document.getElementById('deviceTypeDropdown').addEventListener('change', function () {
    selectedDevice = this.value;
    updateDeviceData();
});

// **Run on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("daily").addEventListener("click", () => updateTimeGraphs('daily'));
    document.getElementById("weekly").addEventListener("click", () => updateTimeGraphs('weekly'));
    document.getElementById("monthly").addEventListener("click", () => updateTimeGraphs('monthly'));

    console.log(" Page Loaded. Initializing graphs...");
    createDeviceCharts();
    createDeviceTimeGraphs();
    calculateTotals();
});

