// Chart elements
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// Sample Data: Energy Usage & Cost by Area
const areaLabels = ['Meeting Room', 'Workstations', 'Cafeteria', 'Reception', 'Conference Room'];
const areaData = [30, 40, 25, 20, 35]; // kWh
const costData = [100, 150, 90, 70, 130]; // £

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

// Set Static Footer Values (Stays the Same)
document.getElementById('totalEnergy').textContent = "500"; // Total energy used across all rooms
document.getElementById('totalCost').textContent = "1200"; // Total cost of energy
document.getElementById('minUsage').textContent = "20"; // Minimum energy usage
document.getElementById('maxUsage').textContent = "80"; // Maximum energy usage

// Initial Charts (Overall Area Comparison)
new Chart(areaComparisonPieCtx, {
    type: 'pie',
    data: { labels: areaLabels, datasets: [{ data: areaData, backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'] }] }
});

new Chart(areaComparisonBarCtx, {
    type: 'bar',
    data: { labels: areaLabels, datasets: [{ label: 'Energy Usage (kW)', data: areaData, backgroundColor: 'teal' }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Function to Update Area Data on Selection
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    const selectedArea = this.value;
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
    new Chart(devicePieCtx, {
        type: 'pie',
        data: { labels: deviceNames, datasets: [{ data: deviceEnergy, backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'] }] }
    });

    new Chart(deviceBarCtx, {
        type: 'bar',
        data: { labels: deviceNames, datasets: [{ label: 'Energy Usage (kW)', data: deviceEnergy, backgroundColor: 'purple' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// Function to Update Time-Based Energy & Cost Graphs
function updateTimeGraph(period) {
    let newLabels, newData;
    
    if (period === 'daily') {
        newLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];
        newData = [5, 8, 10, 12, 6];
    } else if (period === 'weekly') {
        newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        newData = [40, 50, 45, 60, 55, 48, 52];
    } else {
        newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        newData = [150, 170, 160, 180];
    }

    new Chart(areaTimeEnergyCtx, {
        type: 'line',
        data: { labels: newLabels, datasets: [{ label: 'Energy (kW)', data: newData, borderColor: 'blue', fill: false }] }
    });

    new Chart(areaTimeCostCtx, {
        type: 'line',
        data: { labels: newLabels, datasets: [{ label: 'Cost (£)', data: newData.map(x => x * 2), borderColor: 'red', fill: false }] }
    });
}

// Initialize Default View
updateAreaData("all");
