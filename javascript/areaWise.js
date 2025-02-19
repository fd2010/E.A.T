
// Import shared data from energyData.js
import { timeLabels, energyData, devicesByArea, areaData, deviceData } from './energyData.js';

console.log("✅ energyData.js imported successfully!");
console.log("🔎 timeLabels:", timeLabels);
console.log("🔎 energyData:", energyData);
console.log("🔎 devicesByArea:", devicesByArea);

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

// **Initialize Area Comparison Charts*
function createAreaCharts() {
    areaPieChart = new Chart(areaComparisonPieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(areaData),  
            datasets: [{
                data: Object.values(areaData), 
                backgroundColor: ['red', 'blue', 'green', 'orange']
            }]
        }
    });

    areaBarChart = new Chart(areaComparisonBarCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(areaData), // Labels from areaData
            datasets: [{
                label: 'Energy Usage (kW)',
                data: Object.values(areaData), // Use areaData values directly
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
function updateTimeGraphs(period) {
    function updateTimeGraphs(period) {
        selectedTime = period;
    
        console.log("Energy Data for Selected Time:", energyData[selectedTime]); // Debugging
    
        energyChart.data.labels = timeLabels[selectedTime];
        energyChart.data.datasets[0].data = energyData[selectedTime]; // Use energyData[selectedTime] directly
        energyChart.update();
    
        costChart.data.labels = timeLabels[selectedTime];
        costChart.data.datasets[0].data = costData[selectedTime]; // Use costData[selectedTime]
        costChart.update();
    
        // Highlight active button
        document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
        document.getElementById(period).classList.add("active-button");
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
    const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
    const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
    const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
    const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
    const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
    const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

    console.log("✅ Canvas elements loaded correctly!");
    
    // Call functions AFTER elements exist
    createAreaCharts();
    createTimeGraphs();
    updateAreaData();
    calculateTotals();
});

