// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, areaData, deviceData } from './energyData.js';

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

// **Initialize Device Comparison Charts**
function createDeviceCharts() {
    devicePieChart = new Chart(deviceComparisonPieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(deviceData),
            datasets: [{
                data: Object.values(deviceData),
                backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'teal']
            }]
        }
    });

    deviceBarChart = new Chart(deviceComparisonBarCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(deviceData),
            datasets: [{
                label: 'Energy Usage (kW)',
                data: Object.values(deviceData),
                backgroundColor: 'purple'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// **Initialize Time-Based Graphs**
function createDeviceTimeGraphs() {
    deviceEnergyChart = new Chart(deviceTimeEnergyCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy (kW)',
                data: energyData[selectedDevice][selectedTime],
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
                label: 'Cost (£)',
                data: costData[selectedDevice][selectedTime],
                borderColor: 'red',
                fill: false
            }]
        }
    });
}

// **Update Time Graphs Based on Period Selection**
window.updateDeviceTimeGraphs = function (period) {
    selectedTime = period;
    deviceEnergyChart.data.datasets[0].data = energyData[selectedDevice][selectedTime];
    deviceEnergyChart.update();

    deviceCostChart.data.datasets[0].data = costData[selectedDevice][selectedTime];
    deviceCostChart.update();
};

// **Calculate Totals for Sticky Footer**
function calculateTotals() {
    let totalEnergy = 0, totalCost = 0;
    let minRoom = "", maxRoom = "", minDevice = "", maxDevice = "";
    let minEnergy = Infinity, maxEnergy = -Infinity;
    let minRoomEnergy = Infinity, maxRoomEnergy = -Infinity; // Separate tracking for room totals

    Object.entries(devicesByArea).forEach(([room, devices]) => {
        let roomTotal = 0;

        devices.forEach(device => {
            totalEnergy += device.energy;
            totalCost += device.cost;
            roomTotal += device.energy;

            // Track minimum and maximum energy usage **for devices**
            if (device.energy < minEnergy) {
                minEnergy = device.energy;
                minDevice = device.name;
            }
            if (device.energy > maxEnergy) {
                maxEnergy = device.energy;
                maxDevice = device.name;
            }
        });

        // Track **minimum and maximum energy usage for rooms**
        if (roomTotal < minRoomEnergy) {
            minRoomEnergy = roomTotal;
            minRoom = room;
        }
        if (roomTotal > maxRoomEnergy) {
            maxRoomEnergy = roomTotal;
            maxRoom = room;
        }
    });

    // Assign values to the footer
    document.getElementById('totalEnergy').textContent = `${totalEnergy}`;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}`;
    document.getElementById('minUsageRoom').textContent = ` ${minRoom}`;
    document.getElementById('maxUsageRoom').textContent = ` ${maxRoom}`;
    document.getElementById('minUsageDevice').textContent = ` ${minDevice}`;
    document.getElementById('maxUsageDevice').textContent = ` ${maxDevice}`;
}

// **Run on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    createDeviceCharts();
    createDeviceTimeGraphs();
    calculateTotals();
});
