// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, areaData, deviceData } from './energyData.js';

console.log(" energyData.js imported successfully!");
console.log(" timeLabels:", timeLabels);
console.log(" energyData:", energyData);
console.log(" devicesByArea:", devicesByArea);

// **Chart Elements**
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// **Normalize Area Names**
function normalizeArea(area) {
    const mapping = {
        "meeting": "Meeting Room",
        "work": "Workstations",
        "common": "Common Areas",
        "special": "Special"
    };
    return mapping[area] || area;
}

// **Set Default Values**
let selectedArea = normalizeArea("meeting");
let selectedTime = "daily";
let areaPieChart, areaBarChart, energyChart, costChart, devicePieChart, deviceBarChart;

// **Initialize Area Comparison Charts**
function createAreaCharts() {
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

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    console.log("Initializing Time Graphs...");

    if (!energyData[selectedArea] || !costData[selectedArea]) {
        console.error(`No energy or cost data found for '${selectedArea}'`);
        return;
    }

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
                data: costData[selectedArea][selectedTime],
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
    console.log(` Updating Time Graphs for ${selectedArea} (${period})`);

    const normalizedArea = normalizeArea(selectedArea);

    if (!energyData[normalizedArea] || !costData[normalizedArea]) {
        console.error(` No energy or cost data found for '${normalizedArea}'`);
        return;
    }

    energyChart.data.labels = timeLabels[selectedTime];
    energyChart.data.datasets[0].data = energyData[normalizedArea][selectedTime]; //  Use normalized area
    energyChart.update();

    costChart.data.labels = timeLabels[selectedTime];
    costChart.data.datasets[0].data = costData[normalizedArea][selectedTime]; //  Use normalized area
    costChart.update();

    // Highlight the active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");
};

// **Update Device & Time Graphs When Changing Area**
function updateAreaData() {
    const normalizedArea = normalizeArea(selectedArea);
    console.log(" Selected Area:", normalizedArea);

    if (!devicesByArea[normalizedArea]) {
        console.error(` No data found for selected area: '${normalizedArea}'`);
        return;
    }

    let deviceHTML = "";
    let deviceNames = [];
    let deviceEnergy = [];

    devicesByArea[normalizedArea].forEach(device => {
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

    //  Update time graphs when area changes
    updateTimeGraphs(selectedTime);
}

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

// **Dropdown Event Listener**
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    selectedArea = this.value; // Store the dropdown value
    console.log(" Updating area:", selectedArea);
    updateAreaData();
});

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
    const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
    const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
    const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
    const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
    const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

    console.log(" Canvas elements loaded correctly!");
    selectedArea = normalizeArea(document.getElementById('areaTypeDropdown').value);

    // Call functions AFTER elements exist
    createAreaCharts();
    createTimeGraphs();
    updateAreaData();
    calculateTotals();
});

