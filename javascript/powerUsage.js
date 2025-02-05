const ctx = document.getElementById('powerUsageChart').getContext('2d');

let powerUsageChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
        datasets: [{
            label: 'Power Usage (kW)',
            data: [2, 3, 5, 4, 3],
            borderColor: 'blue',
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function updateChart(period) {
    let newLabels, newData;
    if (period === 'daily') {
        newLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];
        newData = [2, 3, 5, 4, 3];
    } else if (period === 'weekly') {
        newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        newData = [30, 40, 35, 50, 45, 38, 42];
    } else {
        newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        newData = [200, 220, 210, 230];
    }
    powerUsageChart.data.labels = newLabels;
    powerUsageChart.data.datasets[0].data = newData;
    powerUsageChart.update();
}
