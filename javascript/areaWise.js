// Chart Elements
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// **DATA STORAGE**
const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

// **Energy Data Per Area**
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
    },
    work: {
        daily: [6, 9, 11, 14, 7],
        weekly: [45, 55, 50, 65, 60, 52, 57],
        monthly: [180, 200, 190, 210]
    },
    special: {
        daily: [7, 10, 12, 15, 8],
        weekly: [50, 60, 55, 70, 65, 58, 62],
        monthly: [200, 220, 210, 230]
    }
};

// **Device Types by Area**
const devicesByArea = {
    meeting: [
        { name: "Projector", energy: 5, cost: 2.5 },
        { name: "Speakers", energy: 2, cost: 1.2 },
        { name: "Lights", energy: 8, cost: 4 }
    ],
    work: [
        { name: "Computers", energy: 15, cost: 8 },
        { name: "Monitors", energy: 10, cost: 5 },
        { name: "Printers", energy: 6, cost: 3 }
    ],
    common: [
        { name: "Lights", energy: 12, cost: 6 },
        { name: "Air Conditioning", energy: 20, cost: 10 },
        { name: "Vending Machine", energy: 8, cost: 4 }
    ],
    special: [
        { name: "Heating", energy: 25, cost: 12 },
        { name: "Speakers", energy: 10, cost: 5 }
    ]
};

// **DEFAULT SELECTION**
let selectedArea = "meeting";
let selectedTime = "daily";

// **Initialize Charts**
let energyChart, costChart, devicePieChart, deviceBarChart;

// **Initialize Time-Based Graphs (Meeting Room Default)**
function createTimeGraphs() {
    energyChart = new Chart(areaTimeEnergyCtx, {
        type: 'line',
        data: { labels: timeLabels.daily, datasets: [{ label: 'Energy (kW)', data: energyData.meeting.daily, borderColor: 'blue', fill: false }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    costChart = new Chart(areaTimeCostCtx, {
        type: 'line',
        data: { labels: timeLabels.daily, datasets: [{ label: 'Cost (£)', data: energyData.meeting.daily.map(x => x * 2), borderColor: 'red', fill: false }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// **Function to Update Time-Based Graphs**
function updateTimeGraph(period) {
    selectedTime = period; // ✅ Ensure correct dataset is loaded

    energyChart.data.labels = timeLabels[period];
    energyChart.data.datasets[0].data = energyData[selectedArea][period];
    energyChart.update();

    costChart.data.labels = timeLabels[period];
    costChart.data.datasets[0].data = energyData[selectedArea][period].map(x => x * 2);
    costChart.update();
}

// **UPDATE AREA DATA ON SELECTION**
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    selectedArea = this.value;
    updateAreaData(selectedArea);
});

function updateAreaData(area) {
    let deviceHTML = "";
    let deviceNames = [];
    let deviceEnergy = [];

    devicesByArea[area].forEach(device => {
        deviceHTML += `<div class="device-panel"><h3>${device.name}</h3><p>Usage: ${device.energy} kWh | Cost: £${device.cost}</p></div>`;
        deviceNames.push(device.name);
        deviceEnergy.push(device.energy);
    });

    document.getElementById('deviceList').innerHTML = deviceHTML;

    // ✅ **Destroy old charts before creating new ones**
    if (devicePieChart) devicePieChart.destroy();
    if (deviceBarChart) deviceBarChart.destroy();

    // **Update Device Charts**
    devicePieChart = new Chart(devicePieCtx, {
        type: 'pie',
        data: { labels: deviceNames, datasets: [{ data: deviceEnergy, backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'] }] }
    });

    deviceBarChart = new Chart(deviceBarCtx, {
        type: 'bar',
        data: { labels: deviceNames, datasets: [{ label: 'Energy Usage (kW)', data: deviceEnergy, backgroundColor: 'purple' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    updateTimeGraph(selectedTime);
}

// **INITIALIZATION ON PAGE LOAD**
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('areaTypeDropdown').value = "meeting";
    createTimeGraphs();
    updateAreaData("meeting");
});

// **CALCULATE TOTALS FOR STICKY FOOTER**
function calculateTotals() {
    let totalEnergy = 0, totalCost = 0;

    Object.values(devicesByArea).forEach(areaDevices => {
        areaDevices.forEach(device => {
            totalEnergy += device.energy;
            totalCost += device.cost;
        });
    });

    document.getElementById('totalEnergy').textContent = totalEnergy + " kWh";
    document.getElementById('totalCost').textContent = "£" + totalCost.toFixed(2);
}

// **Run on Page Load**
document.addEventListener("DOMContentLoaded", function () { calculateTotals(); });
