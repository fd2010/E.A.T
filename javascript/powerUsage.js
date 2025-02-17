// Select the chart elements
const energyCostCtx = document.getElementById('energyCostChart').getContext('2d');
const energyUsageCtx = document.getElementById('energyUsageChart').getContext('2d');
const areaPieCtx = document.getElementById('areaPieChart').getContext('2d');
const areaBarCtx = document.getElementById('areaBarChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// Sample data
const timeLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];
const costData = [10, 15, 20, 18, 22]; // Sample cost in pounds
const usageData = [2, 3, 5, 4, 5]; // Sample energy usage in kW

const areaLabels = ['Meeting Room', 'Workstations', 'Cafeteria', 'Reception', 'Conference Room'];
const areaData = [30, 40, 25, 20, 35];

const deviceLabels = ['Computers', 'Lights', 'Heating', 'Monitors', 'Speakers'];
const deviceData = [50, 20, 15, 25, 10];

// Line Graph: Energy Cost Over Time
new Chart(energyCostCtx, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [{
            label: 'Energy Cost (£)',
            data: costData,
            borderColor: 'red',
            fill: false
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Line Graph: Energy Usage Over Time
new Chart(energyUsageCtx, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [{
            label: 'Energy Usage (kW)',
            data: usageData,
            borderColor: 'blue',
            fill: false
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Pie Chart: Energy Usage by Area
new Chart(areaPieCtx, {
    type: 'pie',
    data: {
        labels: areaLabels,
        datasets: [{
            data: areaData,
            backgroundColor: ['red', 'blue', 'green', 'orange', 'purple']
        }]
    }
});

// Bar Chart: Energy Usage by Area
new Chart(areaBarCtx, {
    type: 'bar',
    data: {
        labels: areaLabels,
        datasets: [{
            label: 'Energy Usage (kW)',
            data: areaData,
            backgroundColor: 'teal'
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// Pie Chart: Energy Usage by Device Type
new Chart(devicePieCtx, {
    type: 'pie',
    data: {
        labels: deviceLabels,
        datasets: [{
            data: deviceData,
            backgroundColor: ['red', 'blue', 'green', 'orange', 'purple']
        }]
    }
});

// Bar Chart: Energy Usage by Device Type
new Chart(deviceBarCtx, {
    type: 'bar',
    data: {
        labels: deviceLabels,
        datasets: [{
            label: 'Energy Usage (kW)',
            data: deviceData,
            backgroundColor: 'purple'
        }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
});
