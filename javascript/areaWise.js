// Import shared data from energyData.js
import { timeLabels, energyData, devicesByArea } from './energyData.js';

// Chart Elements
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

let selectedArea = "meeting";
let selectedTime = "daily";
let areaPieChart, areaBarChart, energyChart, costChart, devicePieChart, deviceBarChart;

// **Initialize Area Comparison Charts**
function createAreaCharts() {
    areaPieChart = new Chart(areaComparisonPieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(energyData),
            datasets: [{
                data: Object.values(energyData).map(area => area[selectedTime].reduce((a, b) => a + b, 0)),
                backgroundColor: ['red', 'blue', 'green', 'orange']
            }]
        }
    });

    areaBarChart = new Chart(areaComparisonBarCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(energyData),
            datasets: [{
                label: 'Energy Usage (kW)',
                data: Object.values(energyData).map(area => area[selectedTime].reduce((a, b) => a + b, 0)),
                backgroundColor: 'teal'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    energyChart = new Chart(areaTimeEnergyCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy (kW)',
                data: energyData[selectedArea][selectedTime],
                borderColor: 'blue',
                fill: false
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    costChart = new Chart(areaTimeCostCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Cost (£)',
                data: energyData[selectedArea][selectedTime].map(x => x * 2),
                borderColor: 'red',
                fill: false
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// **Update Time Graphs Based on Period Selection**
function updateTimeGraph(period) {
    selectedTime = period;

    energyChart.data.labels = timeLabels[selectedTime];
    energyChart.data.datasets[0].data = energyData[selectedArea][selectedTime];
    energyChart.update();

    costChart.data.labels = timeLabels[selectedTime];
    costChart.data.datasets[0].data = energyData[selectedArea][selectedTime].map(x => x * 2);
    costChart.update();

    // Highlight active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");

    const activeButton = document.getElementById(period);
    if (activeButton) {
        activeButton.classList.add("active-button");
    } else {
        console.error(` Error: Button ID '${period}' not found!`);
    }
}

// **Update Area Data on Selection**
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    selectedArea = this.value;
    updateAreaData();
});

// **Update Device Charts Based on Selected Area**
function updateAreaData() {
    let deviceHTML = "";
    let deviceNames = [];
    let deviceEnergy = [];

    devicesByArea[selectedArea].forEach(device => {
        deviceHTML += `
            <div class="device-panel">
                <h3>${device.name}</h3>
                <p>Usage: ${device.energy} kWh | Cost: £${device.cost}</p>
            </div>`;
        deviceNames.push(device.name);
        deviceEnergy.push(device.energy);
    });

    document.getElementById('deviceList').innerHTML = deviceHTML;

    // **Destroy and recreate only the device charts when changing area**
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

    // **Update time graphs instead of recreating them**
    updateTimeGraph(selectedTime);
}

// **Calculate Totals for Sticky Footer**
function calculateTotals() {
    let totalEnergy = 0;
    let totalCost = 0;

    Object.values(devicesByArea).forEach(areaDevices => {
        areaDevices.forEach(device => {
            totalEnergy += device.energy;
            totalCost += device.cost;
        });
    });

    document.getElementById('totalEnergy').textContent = totalEnergy;
    document.getElementById('totalCost').textContent = totalCost.toFixed(2);
}

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('areaTypeDropdown').value = "meeting";
    createAreaCharts();
    createTimeGraphs();
    updateAreaData();
    calculateTotals();
});
