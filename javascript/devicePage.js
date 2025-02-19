// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, deviceData } from './energyData.js';

console.log("✅ energyData.js imported successfully!");
console.log("🔎 timeLabels:", timeLabels);
console.log("🔎 energyData:", energyData);
console.log("🔎 devicesByArea:", devicesByArea);

// **Chart Elements**
let deviceComparisonPieCtx, deviceComparisonBarCtx, deviceTimeCostCtx, deviceTimeEnergyCtx, deviceAreaPieCtx, deviceAreaBarCtx;
let selectedDevice = "Computers";
let selectedTime = "daily";
let devicePieChart, deviceBarChart, deviceEnergyChart, deviceCostChart, deviceAreaPieChart, deviceAreaBarChart;

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
                backgroundColor: 'purple'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
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

// **Update Device Usage Across Areas Graphs**
function updateDeviceAreaGraphs() {
    console.log(`🔄 Updating Device Area Graphs for ${selectedDevice}`);

    let { labels, data } = getDeviceEnergyAcrossAreas(selectedDevice);

    // **Destroy old charts before creating new ones**
    if (deviceAreaPieChart) deviceAreaPieChart.destroy();
    if (deviceAreaBarChart) deviceAreaBarChart.destroy();

    // **Create Updated Pie Chart**
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

    // **Create Updated Bar Chart**
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

// **Update All Graphs When Changing Device Type**
function updateDeviceData() {
    console.log(`🔄 Updating data for: ${selectedDevice}`);

    // **Destroy old charts before updating**
    if (deviceEnergyChart) deviceEnergyChart.destroy();
    if (deviceCostChart) deviceCostChart.destroy();

    // **Update Time Graphs**
    updateDeviceTimeGraphs("daily");

    // **Update Area Graphs**
    updateDeviceAreaGraphs();
}

// **Device Dropdown Change Event**
document.getElementById("deviceTypeDropdown").addEventListener("change", function () {
    selectedDevice = this.value;  // Update selected device
    selectedTime = "daily";       // Reset time to daily

    updateDeviceData();  // Update all graphs

    // **Ensure the "daily" button is highlighted**
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById("daily").classList.add("active-button");
});

// **Run on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded. Initializing graphs...");
    createDeviceTimeGraphs();
    createDeviceAreaGraphs();
    calculateTotals();
});


// **Get Time-Based Energy Data for Selected Device**
function getDeviceEnergyData(device, time) {
    if (!deviceEnergyData[device] || !deviceEnergyData[device][time]) {
        console.warn(`No energy data found for '${device}' in '${time}'`);
        return Array(timeLabels[time].length).fill(0);
    }
    return deviceEnergyData[device][time];
}


// **Get Time-Based Cost Data for Selected Device**
function getDeviceCostData(device, time) {
    if (!deviceCostData[device] || !deviceCostData[device][time]) {
        console.warn(`No cost data found for '${device}' in '${time}'`);
        return Array(timeLabels[time].length).fill(0);
    }
    return deviceCostData[device][time];
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

    // Highlight active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");
};


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

    document.getElementById('totalEnergy').textContent = `${totalEnergy}`;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}`;
    document.getElementById('minUsageDevice').textContent = `${minDevice}`;
    document.getElementById('maxUsageDevice').textContent = `${maxDevice}`;
}

// **Run on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    // Assign chart elements after DOM is fully loaded
    deviceComparisonPieCtx = document.getElementById('deviceComparisonPie').getContext('2d');
    deviceComparisonBarCtx = document.getElementById('deviceComparisonBar').getContext('2d');
    deviceTimeCostCtx = document.getElementById('deviceTimeCostChart').getContext('2d');
    deviceTimeEnergyCtx = document.getElementById('deviceTimeEnergyChart').getContext('2d');
    deviceAreaPieCtx = document.getElementById('deviceAreaPieChart').getContext('2d');
    deviceAreaBarCtx = document.getElementById('deviceAreaBarChart').getContext('2d');

    // **Device Dropdown Change Event**
    document.getElementById("deviceTypeDropdown").addEventListener("change", function () {
        selectedDevice = this.value;  // Update selected device
        selectedTime = "daily";       // Reset time to daily

        updateDeviceData(); // Update all graphs

        // **Ensure the "daily" button is highlighted**
        document.querySelectorAll(".graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
        document.getElementById("daily").classList.add("active-button");
    });

    // **Time Selection Buttons**
    document.getElementById("daily").addEventListener("click", () => updateDeviceTimeGraphs('daily'));
    document.getElementById("weekly").addEventListener("click", () => updateDeviceTimeGraphs('weekly'));
    document.getElementById("monthly").addEventListener("click", () => updateDeviceTimeGraphs('monthly'));

    console.log("✅ Page Loaded. Initializing graphs...");

    // **Initialize Graphs**
    createDeviceTimeGraphs();  // ✅ Create time-based graphs for default device
    createDeviceAreaGraphs();  // ✅ Create area comparison graphs
    calculateTotals();
});



