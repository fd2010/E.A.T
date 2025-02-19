
// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, areaData, deviceData } from './energyData.js';

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

function normalizeArea(area) {
    const mapping = {
        "meeting": "Meeting Room",
        "work": "Workstations",
        "common": "Common Areas",
        "special": "Special"
    };
    return mapping[area] || area;  // Return mapped value or original if no match
}
selectedArea = normalizeArea(selectedArea);

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
    console.log("🔍 costData:", costData);  // Debugging log
    if (!costData) {
        console.error("❌ costData is not defined!");
        return;
    }

    energyChart = new Chart(areaTimeEnergyCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy (kW)',
                data: energyData[selectedTime], // ✅ Uses energyData[selectedTime] directly
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
                data: costData[selectedTime],  // ✅ Uses costData[selectedTime]
                borderColor: 'red',
                fill: false
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}




// **Update Time Graphs Based on Period Selection**

window.updateTimeGraphs = function (period) {
    selectedTime = period;
    console.log("⏳ Updating Time Graphs:", period);

    energyChart.data.labels = timeLabels[selectedTime];
    energyChart.data.datasets[0].data = energyData[selectedTime];
    energyChart.update();

    costChart.data.labels = timeLabels[selectedTime];
    costChart.data.datasets[0].data = costData[selectedTime];
    costChart.update();

    // Highlight the active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");
};



// **Update Area Data on Selection**
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    selectedArea = normalizeArea(this.value);  // Normalize selection
    console.log("🔄 Updating area:", selectedArea);
    updateAreaData();  // Refresh charts & device list
});


// **Update Device Charts Based on Selected Area**
function updateAreaData() {
    selectedArea = normalizeArea(selectedArea);
    console.log("🔍 Selected Area:", selectedArea);
    
    if (!devicesByArea[selectedArea]) {
        console.error(`❌ No data found for selected area: '${selectedArea}'`);
        return;
    }

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

    updateTimeGraphs(selectedTime); // Ensure graphs update
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

