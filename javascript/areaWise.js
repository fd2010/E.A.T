// Chart elements
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// Sample Data for Time-Based Graphs
const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

const energyData = {
    meeting: {
        daily: [5, 8, 10, 12, 6],
        weekly: [40, 50, 45, 60, 55, 48, 52],
        monthly: [150, 170, 160, 180]
    },
    common: {
        daily: [3, 5, 7, 6, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [100, 120, 130, 110]
    }
};

// Device Types by Room
const devicesByArea = {
    "meeting": [
        { name: "Projector", energy: 5, cost: 2.5 },
        { name: "Speakers", energy: 2, cost: 1.2 },
        { name: "Lights", energy: 8, cost: 4 }
    ],
    "work": [
        { name: "Computers", energy: 15, cost: 8 },
        { name: "Monitors", energy: 10, cost: 5 },
        { name: "Printers", energy: 6, cost: 3 }
    ],
    "common": [
        { name: "Lights", energy: 12, cost: 6 },
        { name: "Air Conditioning", energy: 20, cost: 10 },
        { name: "Coffee Machine", energy: 8, cost: 4 }
    ],
    "cafeteria": [
        { name: "Microwave", energy: 7, cost: 3.5 },
        { name: "Fridge", energy: 18, cost: 9 },
        { name: "Oven", energy: 25, cost: 12 }
    ],
    "reception": [
        { name: "TV Screen", energy: 10, cost: 5 },
        { name: "Decorative Lighting", energy: 8, cost: 4 }
    ]
};

// Initialize Default Selection
let selectedArea = "meeting";
let selectedTime = "daily";

// Initialize Time-Based Graphs (Defaults to Meeting Room, Daily)
let energyChart = new Chart(areaTimeEnergyCtx, {
    type: 'line',
    data: { 
        labels: timeLabels.daily, 
        datasets: [{ label: 'Energy (kW)', data: energyData.meeting.daily, borderColor: 'blue', fill: false }] 
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

let costChart = new Chart(areaTimeCostCtx, {
    type: 'line',
    data: { 
        labels: timeLabels.daily, 
        datasets: [{ label: 'Cost (£)', data: energyData.meeting.daily.map(x => x * 2), borderColor: 'red', fill: false }] 
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Function to Update Time-Based Graphs
function updateTimeGraphs(period) {
    selectedTime = period; // Store the selected time period

    energyChart.data.labels = timeLabels[period];
    energyChart.data.datasets[0].data = energyData[selectedArea][period];
    energyChart.update();

    costChart.data.labels = timeLabels[period];
    costChart.data.datasets[0].data = energyData[selectedArea][period].map(x => x * 2);
    costChart.update();
}

// Function to Update Area Data on Selection
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    selectedArea = this.value;
    updateAreaData(selectedArea);
});

function updateAreaData(area) {
    if (area === "all") {
        document.getElementById('deviceList').innerHTML = "<p>Select an area to see devices</p>";
        return;
    }

    // Update Device List
    let deviceHTML = "";
    let deviceNames = [];
    let deviceEnergy = [];

    devicesByArea[area].forEach(device => {
        deviceHTML += `<div class="device-panel"><h3>${device.name}</h3><p>Usage: ${device.energy} kWh | Cost: £${device.cost}</p></div>`;
        deviceNames.push(device.name);
        deviceEnergy.push(device.energy);
    });

    document.getElementById('deviceList').innerHTML = deviceHTML;

    // Update Device Type Charts (Pie & Bar)
    updateDeviceCharts(deviceNames, deviceEnergy);

    // Update the time-based graphs when a new area is selected
    updateTimeGraphs(selectedTime);
}

// Function to Update Device Charts Without Recreating Them
function updateDeviceCharts(labels, data) {
    devicePieCtx.clearRect(0, 0, devicePieCtx.width, devicePieCtx.height);
    deviceBarCtx.clearRect(0, 0, deviceBarCtx.width, deviceBarCtx.height);

    new Chart(devicePieCtx, {
        type: 'pie',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'] }] }
    });

    new Chart(deviceBarCtx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Energy Usage (kW)', data: data, backgroundColor: 'purple' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// Run Default Selection on Page Load
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('areaTypeDropdown').value = "meeting"; // Default to Meeting Room
    updateAreaData("meeting"); // Load initial data
});

// Function to Calculate Total Energy, Cost, Min & Max Energy Usage in sticky footer 
function calculateTotals() {
    let totalEnergy = 0;
    let totalCost = 0;
    let energyValues = [];

    // Loop through all areas and calculate totals dynamically
    Object.values(devicesByArea).forEach(areaDevices => {
        areaDevices.forEach(device => {
            totalEnergy += device.energy;
            totalCost += device.cost;
            energyValues.push(device.energy);
        });
    });

    let minUsage = Math.min(...energyValues);
    let maxUsage = Math.max(...energyValues);

    // Update the Sticky Footer dynamically
    document.getElementById('totalEnergy').textContent = totalEnergy;
    document.getElementById('totalCost').textContent = totalCost.toFixed(2);
    document.getElementById('minUsage').textContent = minUsage;
    document.getElementById('maxUsage').textContent = maxUsage;
}

// Run Total Calculation on Page Load
document.addEventListener("DOMContentLoaded", function () {
    calculateTotals();
});



