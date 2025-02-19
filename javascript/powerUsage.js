// Import all shared data from energyData.js
import { timeLabels, energyData, costData, areaData, deviceData, devicesByArea } from './energyData.js';

// Chart Elements
const energyCostCtx = document.getElementById('energyCostChart').getContext('2d');
const energyUsageCtx = document.getElementById('energyUsageChart').getContext('2d');
const areaPieCtx = document.getElementById('areaPieChart').getContext('2d');
const areaBarCtx = document.getElementById('areaBarChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// **DEFAULT SELECTION**
let selectedTime = "daily";
let energyChart, costChart, areaPieChart, areaBarChart, devicePieChart, deviceBarChart;

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    energyChart = new Chart(energyUsageCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy Usage (kW)',
                data: energyData[selectedTime],
                borderColor: 'blue',
                fill: false
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    costChart = new Chart(energyCostCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy Cost (£)',
                data: costData[selectedTime],
                borderColor: 'red',
                fill: false
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// **Initialize Area-wise Usage Charts**
function createAreaCharts() {
    areaPieChart = new Chart(areaPieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(areaData),
            datasets: [{
                data: Object.values(areaData),
                backgroundColor: ['red', 'blue', 'green', 'purple']
            }]
        }
    });

    areaBarChart = new Chart(areaBarCtx, {
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

// **Initialize Device-wise Usage Charts**
function createDeviceCharts() {
    devicePieChart = new Chart(devicePieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(deviceData),
            datasets: [{
                data: Object.values(deviceData),
                backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'teal']
            }]
        }
    });

    deviceBarChart = new Chart(deviceBarCtx, {
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

// **Update Time Graphs Based on Period Selection**
function updateTimeGraphs(period) {
    selectedTime = period;

    energyChart.data.labels = timeLabels[period];
    energyChart.data.datasets[0].data = energyData[period];
    energyChart.update();

    costChart.data.labels = timeLabels[period];
    costChart.data.datasets[0].data = costData[period];
    costChart.update();

    // Highlight active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");

    const activeButton = document.getElementById(period);
    if (activeButton) {
        activeButton.classList.add("active-button");
    } else {
        console.error(`Error: Button ID '${period}' not found!`);
    }
}

// **Calculate Totals for Footer**
function calculateTotals() {
    let totalEnergy = 0, totalCost = 0;
    let minRoom = "", maxRoom = "", minDevice = "", maxDevice = "";
    let minEnergy = Infinity, maxEnergy = -Infinity;

    Object.entries(devicesByArea).forEach(([room, devices]) => {
        let roomTotal = 0;

        devices.forEach(device => {
            totalEnergy += device.energy;
            totalCost += device.cost;
            roomTotal += device.energy;

            if (device.energy < minEnergy) {
                minEnergy = device.energy;
                minDevice = device.name;
            }
            if (device.energy > maxEnergy) {
                maxEnergy = device.energy;
                maxDevice = device.name;
            }
        });

        if (roomTotal < minEnergy) {
            minEnergy = roomTotal;
            minRoom = room;
        }
        if (roomTotal > maxEnergy) {
            maxEnergy = roomTotal;
            maxRoom = room;
        }
    });

    document.getElementById('totalEnergy').textContent = `${totalEnergy}`;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}`;
    document.getElementById('minUsage').textContent = `${minRoom} (${minDevice})`;
    document.getElementById('maxUsage').textContent = `${maxRoom} (${maxDevice})`;
}

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("daily").addEventListener("click", () => updateTimeGraphs('daily'));
    document.getElementById("weekly").addEventListener("click", () => updateTimeGraphs('weekly'));
    document.getElementById("monthly").addEventListener("click", () => updateTimeGraphs('monthly'));

    createTimeGraphs();
    createAreaCharts();
    createDeviceCharts();
    calculateTotals();
});