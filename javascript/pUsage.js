// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, areaData, deviceData } from './energyData.js';

// **Chart Elements**
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// **Default Selections**
let selectedArea = 'Meeting Room';
let selectedTime = 'daily';
let energyChart, costChart, areaPieChart, areaBarChart, devicePieChart, deviceBarChart;

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    energyChart = new Chart(areaTimeEnergyCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy Usage (kW)',
                data: energyData[selectedArea][selectedTime],
                borderColor: 'blue',
                fill: false
            }]
        }
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
        }
    });
}

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
        }
    });
}

// **Initialize Device Usage Charts**
function createDeviceCharts() {
    devicePieChart = new Chart(devicePieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(deviceData),
            datasets: [{
                data: Object.values(deviceData),
                backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'teal']
            }]
        }
    });

    deviceBarChart = new Chart(deviceBarCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(deviceData),
            datasets: [{
                label: 'Device Energy Usage (kW)',
                data: Object.values(deviceData),
                backgroundColor: 'purple'
            }]
        }
    });
}

// **Run on Page Load**
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page Loaded. Initializing graphs...');
    createTimeGraphs();
    createAreaCharts();
    createDeviceCharts();
});
