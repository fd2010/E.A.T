// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, areaData, deviceData } from './energyData.js';

console.log("✅ energyData.js imported successfully!");
console.log("🔎 timeLabels:", timeLabels);
console.log("🔎 energyData:", energyData);
console.log("🔎 costData:", costData);
console.log("🔎 devicesByArea:", devicesByArea);
console.log("🔎 areaData:", areaData);
console.log("🔎 deviceData:", deviceData);

// **Chart Elements**
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// **Set Default Values**
let selectedArea = "Meeting Room";
let selectedTime = "daily";
let areaPieChart, areaBarChart, energyChart, costChart, devicePieChart, deviceBarChart;

// Function to generate gradient shades between two colors
function generateGradientColors(startColor, endColor, steps) {
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        let bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function rgbToHex(r, g, b) {
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    }

    let startRGB = hexToRgb(startColor);
    let endRGB = hexToRgb(endColor);
    let gradient = [];

    for (let i = 0; i < steps; i++) {
        let r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * (i / (steps - 1)));
        let g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * (i / (steps - 1)));
        let b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * (i / (steps - 1)));

        gradient.push(rgbToHex(r, g, b));
    }

    return gradient;
}

const areaShades = generateGradientColors('#486e6c', '#A7C7C5', Object.keys(areaData).length);

// **Initialize Area Comparison Charts**
function createAreaCharts() {
    areaPieChart = new Chart(areaComparisonPieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(areaData).map(label => `${label} (${Object.values(areaData)[Object.keys(areaData).indexOf(label)]} kWh)`), // Include kWh in labels
            datasets: [{
                data: Object.values(areaData),
                backgroundColor: areaShades, // Gradient colors
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 16,
                            family: 'Lato, sans-serif'
                        },
                        color: '#333333',
                        boxWidth: 18,
                        padding: 15
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 20
                }
            }
        }
    });

    areaBarChart = new Chart(areaComparisonBarCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(areaData),
            datasets: [{
                label: 'Energy Usage (kW)',
                data: Object.values(areaData),
                backgroundColor: '#638785'
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
                borderColor: '#B04242',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#B04242'

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
                borderColor: '#B04242',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#B04242'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}



// **Update Time Graphs Based on Period Selection**
window.updateTimeGraphs = function (period) {
    selectedTime = period;
    console.log(`Updating Time Graphs for ${selectedArea} (${period})`);

    if (!energyData[selectedArea] || !costData[selectedArea]) {
        console.error(`No energy or cost data found for '${selectedArea}'`);
        return;
    }

    energyChart.data.labels = timeLabels[selectedTime];
    energyChart.data.datasets[0].data = energyData[selectedArea][selectedTime];
    energyChart.update();

    costChart.data.labels = timeLabels[selectedTime];
    costChart.data.datasets[0].data = costData[selectedArea][selectedTime];
    costChart.update();

    document.querySelectorAll(".area-graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");

};

// **Update Device & Time Graphs When Changing Area**
function updateAreaData() {
    console.log("Selected Area:", selectedArea);

    if (!devicesByArea[selectedArea]) {
        console.error(`No data found for selected area: '${selectedArea}'`);
        return;
    }

    // Ensure devicesByArea[selectedArea] exists, or use an empty array to prevent errors
    const devices = devicesByArea[selectedArea] || [];

    const deviceNames = devices.map(device => device.name);
    const deviceEnergy = devices.map(device => device.energy);

    // Generate HTML for device panels
    document.getElementById('deviceList').innerHTML = devices.map(device => `
    <div class="device-panel">
        <h3>${device.name}</h3>
        <p>Usage: ${device.energy} kWh | Cost: £${device.cost}</p>
    </div>
    `).join('');

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
                backgroundColor: '#B04242'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

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

    console.log(" Canvas elements loaded correctly!");
    selectedArea = document.getElementById('areaTypeDropdown').value;

    // Call functions AFTER elements exist
    createAreaCharts();
    createTimeGraphs();
    updateAreaData();
    calculateTotals();

});