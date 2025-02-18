// Chart Elements
const energyCostCtx = document.getElementById('energyCostChart').getContext('2d');
const energyUsageCtx = document.getElementById('energyUsageChart').getContext('2d');
const areaPieCtx = document.getElementById('areaPieChart').getContext('2d');
const areaBarCtx = document.getElementById('areaBarChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// Time Labels
const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

// Energy Data
const energyData = {
    daily: [2, 3, 5, 4, 5],
    weekly: [30, 40, 35, 50, 45, 38, 42],
    monthly: [200, 220, 210, 230]
};

const costData = {
    daily: [10, 15, 20, 18, 22],
    weekly: [100, 120, 110, 140, 130, 125, 135],
    monthly: [400, 450, 420, 460]
};

// Area-wise Energy Usage Data
const areaData = {
    "Meeting Room": 30,
    "Workstations": 40,
    "Common Areas": 25,
    "Special": 20
};

// Device-wise Energy Usage Data
const deviceData = {
    "Computers": 50,
    "Lights": 20,
    "Heating": 15,
    "Monitors": 25,
    "Speakers": 10,
    "Vending Machine": 10
};

// Device Types by Room
const devicesByArea = {
    "Meeting Room": [
        { name: "Projector", energy: 5, cost: 2.5 },
        { name: "Speakers", energy: 2, cost: 1.2 },
        { name: "Lights", energy: 8, cost: 4 }
    ],
    "Workstations": [
        { name: "Computers", energy: 15, cost: 8 },
        { name: "Monitors", energy: 10, cost: 5 },
        { name: "Printers", energy: 6, cost: 3 }
    ],
    "Common Areas": [
        { name: "Lights", energy: 12, cost: 6 },
        { name: "Air Conditioning", energy: 20, cost: 10 },
        { name: "Vending Machine", energy: 8, cost: 4 }
    ],
    "Special": [
        { name: "Heating", energy: 25, cost: 12 },
        { name: "Speakers", energy: 10, cost: 5 }
    ]
};

// Initialize Global Variables
let selectedTime = "daily";
let energyChart, costChart;

// Initialize Time-Based Graphs
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

// Function to Update Time-Based Graphs
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
}

// Initialize Area-wise Usage Charts
new Chart(areaPieCtx, {
    type: 'pie',
    data: {
        labels: Object.keys(areaData),
        datasets: [{
            data: Object.values(areaData),
            backgroundColor: ['red', 'blue', 'green', 'purple']
        }]
    }
});

new Chart(areaBarCtx, {
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

// Initialize Device-wise Usage Charts
new Chart(devicePieCtx, {
    type: 'pie',
    data: {
        labels: Object.keys(deviceData),
        datasets: [{
            data: Object.values(deviceData),
            backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'teal']
        }]
    }
});

new Chart(deviceBarCtx, {
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

// Function to Calculate Sticky Footer Totals
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

// Run Scripts on Page Load
document.addEventListener("DOMContentLoaded", function () {
    createTimeGraphs();
    calculateTotals();
});
