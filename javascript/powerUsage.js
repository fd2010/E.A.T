// Chart elements
const energyCostCtx = document.getElementById('energyCostChart').getContext('2d');
const energyUsageCtx = document.getElementById('energyUsageChart').getContext('2d');
const areaPieCtx = document.getElementById('areaPieChart').getContext('2d');
const areaBarCtx = document.getElementById('areaBarChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// Sample Data
const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

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

// Initial Time-wise Energy & Cost Graphs
let energyChart = new Chart(energyUsageCtx, {
    type: 'line',
    data: { labels: timeLabels.daily, datasets: [{ label: 'Energy Usage (kW)', data: energyData.daily, borderColor: 'blue', fill: false }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

let costChart = new Chart(energyCostCtx, {
    type: 'line',
    data: { labels: timeLabels.daily, datasets: [{ label: 'Energy Cost (£)', data: costData.daily, borderColor: 'red', fill: false }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Function to Update Time-wise Graphs
function updateTimeGraphs(period) {
    energyChart.data.labels = timeLabels[period];
    energyChart.data.datasets[0].data = energyData[period];
    energyChart.update();

    costChart.data.labels = timeLabels[period];
    costChart.data.datasets[0].data = costData[period];
    costChart.update();
}

// Pie Chart: Energy Usage by Area
new Chart(areaPieCtx, {
    type: 'pie',
    data: {
        labels: ['Meeting Room', 'Workstations', 'Cafeteria', 'Reception', 'Conference Room'],
        datasets: [{ data: [30, 40, 25, 20, 35], backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'] }]
    }
});

// Bar Chart: Energy Usage by Area
new Chart(areaBarCtx, {
    type: 'bar',
    data: {
        labels: ['Meeting Room', 'Workstations', 'Cafeteria', 'Reception', 'Conference Room'],
        datasets: [{ label: 'Energy Usage (kW)', data: [30, 40, 25, 20, 35], backgroundColor: 'teal' }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Pie Chart: Energy Usage by Device Type
new Chart(devicePieCtx, {
    type: 'pie',
    data: {
        labels: ['Computers', 'Lights', 'Heating', 'Monitors', 'Speakers'],
        datasets: [{ data: [50, 20, 15, 25, 10], backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'] }]
    }
});

// Bar Chart: Energy Usage by Device Type
new Chart(deviceBarCtx, {
    type: 'bar',
    data: {
        labels: ['Computers', 'Lights', 'Heating', 'Monitors', 'Speakers'],
        datasets: [{ label: 'Energy Usage (kW)', data: [50, 20, 15, 25, 10], backgroundColor: 'purple' }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});
