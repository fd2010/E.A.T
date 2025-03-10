// Import all shared data from energyData.js
import { timeLabels, totalEnergyData, totalCostData, areaData, deviceData, devicesByArea } from './energyData.js';

// Determine which page we're on
const isPowerUsagePage = document.getElementById('areaPieChart') !== null;
const isDashboardPage = document.getElementById('dashboardContent') !== null;

console.log("Page detected:", isPowerUsagePage ? "Power Usage Page" : "Dashboard Page");

// Chart Elements - Get only if they exist
let energyCostCtx, energyUsageCtx, areaPieCtx, areaBarCtx, devicePieCtx, deviceBarCtx;

// Get contexts only if elements exist
const energyCostElement = document.getElementById('energyCostChart');
if (energyCostElement) {
    console.log('Found energyCostChart element');
    energyCostCtx = energyCostElement.getContext('2d');
}

const energyUsageElement = document.getElementById('energyUsageChart');
if (energyUsageElement) {
    console.log('Found energyUsageChart element');
    energyUsageCtx = energyUsageElement.getContext('2d');
}

const areaPieElement = document.getElementById('areaPieChart');
if (areaPieElement) {
    console.log('Found areaPieChart element');
    areaPieCtx = areaPieElement.getContext('2d');
}

const areaBarElement = document.getElementById('areaBarChart');
if (areaBarElement) {
    console.log('Found areaBarChart element');
    areaBarCtx = areaBarElement.getContext('2d');
}

const devicePieElement = document.getElementById('devicePieChart');
if (devicePieElement) {
    console.log('Found devicePieChart element');
    devicePieCtx = devicePieElement.getContext('2d');
}

const deviceBarElement = document.getElementById('deviceBarChart');
if (deviceBarElement) {
    console.log('Found deviceBarChart element');
    deviceBarCtx = deviceBarElement.getContext('2d');
}

// **DEFAULT SELECTION**
let selectedTime = "daily";
let energyChart, costChart, areaPieChart, areaBarChart, devicePieChart, deviceBarChart;

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    // Create energy usage chart if the element exists
    if (energyUsageCtx) {
        console.log('Creating energy usage chart');
        try {
            energyChart = new Chart(energyUsageCtx, {
                type: 'line',
                data: {
                    labels: timeLabels[selectedTime],
                    datasets: [{
                        label: 'Energy Usage (kW)',
                        data: totalEnergyData[selectedTime],
                        borderColor: '#606952', // Line color
                        backgroundColor: 'rgba(96, 105, 82, 0.2)', // Optional for soft fill
                        fill: false,
                        tension: 0.4, // Makes the line curvy
                        borderWidth: 2, // Adjust line thickness
                        pointRadius: 4, // Adjust point size
                        pointBackgroundColor: '#606952' // Point color
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        } catch (error) {
            console.error('Error creating energy usage chart:', error);
        }
    }



    // Create cost chart if the element exists
    if (energyCostCtx) {
        console.log('Creating energy cost chart');
        try {
            costChart = new Chart(energyCostCtx, {
                type: 'line',
                data: {
                    labels: timeLabels[selectedTime],
                    datasets: [{
                        label: 'Energy Cost (£)',
                        data: totalCostData[selectedTime],
                        borderColor: '#B04242', // Line color
                        backgroundColor: 'rgba(96, 105, 82, 0.2)', // Optional for soft fill
                        fill: false,
                        tension: 0.4, // Makes the line curvy
                        borderWidth: 2, // Adjust line thickness
                        pointRadius: 4, // Adjust point size
                        pointBackgroundColor: '#B04242' // Point color
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        } catch (error) {
            console.error('Error creating energy cost chart:', error);
        }
    }
}


// **Update Time Graphs Based on Period Selection**
function updateTimeGraphs(period) {
    console.log(`Updating time graphs to ${period}`);
    selectedTime = period;

    // Update energy chart if it exists
    if (energyChart) {
        console.log('Updating energy chart');
        try {
            energyChart.data.labels = timeLabels[period];
            energyChart.data.datasets[0].data = totalEnergyData[period];
            energyChart.update();
        } catch (error) {
            console.error('Error updating energy chart:', error);
        }
    }

    // Update cost chart if it exists
    if (costChart) {
        console.log('Updating cost chart');
        try {
            costChart.data.labels = timeLabels[period];
            costChart.data.datasets[0].data = totalCostData[period];
            costChart.update();
        } catch (error) {
            console.error('Error updating cost chart:', error);
        }
    }

    // Highlight the active button on all pages
    document.querySelectorAll(".graph-buttons button").forEach(btn => {
        if (btn.id === period) {
            btn.classList.add("active-button");
        } else {
            btn.classList.remove("active-button");
        }
    });
}

// **Initialize Area-wise Usage Charts**
function createAreaCharts() {
    console.log('Creating area charts');
    try {
        areaPieChart = new Chart(areaPieCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(areaData),
                datasets: [{
                    data: Object.values(areaData),
                    backgroundColor: ['red', 'blue', 'green', 'purple']
                }]
            }
        });

        areaBarChart = new Chart(areaBarCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(areaData),
                datasets: [{
                    label: 'Energy Usage (kW)',
                    data: Object.values(areaData),
                    backgroundColor: '#B04242'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    } catch (error) {
        console.error('Error creating area charts:', error);
    }
}

// PIE CHART - DEVICE

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

const deviceNames = Object.keys(deviceData);
const deviceUsage = Object.values(deviceData);

const blueShades = generateGradientColors('#121c7b', '#c3d1ff', deviceNames.length);

console.log("Device Names:", deviceNames);
console.log("Device Usage:", deviceUsage);
console.log("Generated Colors:", blueShades);

 // Create datasets dynamically for each ring
const datasets = deviceNames.map((device, index) => ({
    label: device,
    data: [deviceUsage[index], 100 - deviceUsage[index]], // Usage vs remaining space
    backgroundColor: [blueShades[index] || '#121c7b', '#E5E5E5'], // Color + Gray for unused
    borderWidth: 10, // Thicker rings
    cutout: `${30 + index * 15}%`, // Expands rings outward for spacing
    circumference: 360,
    rotation: 0, // Starts from the top
}));

console.log("Final Datasets:", datasets);

// **Initialize Device-wise Usage Charts**
function createDeviceCharts() {

    console.log('Creating device charts');
    try {
        devicePieChart = new Chart(devicePieCtx, {
            type: 'doughnut',
            data: { labels: deviceNames, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // Hide default legend
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems) {
                                return deviceNames[tooltipItems[0].datasetIndex]; // Correct device label
                            },
                            label: function (tooltipItem) {
                                return `Usage: ${deviceUsage[tooltipItem.datasetIndex]}%`;
                            }
                        }
                    }
                }
            }
        });

        deviceBarChart = new Chart(deviceBarCtx, {
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

        devicePieChart.update();

    } catch (error) {
        console.error('Error creating device charts:', error);
    }
}

// **Calculate Totals for Footer**
function calculateTotals() {
    // Only calculate totals on the power usage page
    const totalEnergyElement = document.getElementById('totalEnergy');
    if (!totalEnergyElement) return;

    console.log('Calculating totals for footer');
    try {
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
        totalEnergyElement.textContent = `${totalEnergy}`;

        const totalCostElement = document.getElementById('totalCost');
        if (totalCostElement) {
            totalCostElement.textContent = `${totalCost.toFixed(2)}`;
        }

        // Check if these elements exist before updating them
        const minUsageRoomElement = document.getElementById('minUsageRoom');
        if (minUsageRoomElement) {
            minUsageRoomElement.textContent = ` ${minRoom}`;
        }

        const maxUsageRoomElement = document.getElementById('maxUsageRoom');
        if (maxUsageRoomElement) {
            maxUsageRoomElement.textContent = `: ${maxRoom}`;
        }

        const minUsageDeviceElement = document.getElementById('minUsageDevice');
        if (minUsageDeviceElement) {
            minUsageDeviceElement.textContent = ` ${minDevice}`;
        }

        const maxUsageDeviceElement = document.getElementById('maxUsageDevice');
        if (maxUsageDeviceElement) {
            maxUsageDeviceElement.textContent = ` ${maxDevice}`;
        }
    } catch (error) {
        console.error('Error calculating totals:', error);
    }
}

// Setup event listeners for the period selection buttons
function setupEventListeners() {
    console.log('Setting up event listeners');

    try {
        // Add event listeners to all period buttons that exist on the page
        const dailyBtn = document.getElementById("daily");
        const weeklyBtn = document.getElementById("weekly");
        const monthlyBtn = document.getElementById("monthly");

        console.log('Buttons found:', {
            daily: !!dailyBtn,
            weekly: !!weeklyBtn,
            monthly: !!monthlyBtn
        });

        if (dailyBtn) {
            console.log('Adding click listener to daily button');
            dailyBtn.addEventListener("click", () => {
                console.log('Daily button clicked');
                updateTimeGraphs('daily');
            });
        }

        if (weeklyBtn) {
            console.log('Adding click listener to weekly button');
            weeklyBtn.addEventListener("click", () => {
                console.log('Weekly button clicked');
                updateTimeGraphs('weekly');
            });
        }

        if (monthlyBtn) {
            console.log('Adding click listener to monthly button');
            monthlyBtn.addEventListener("click", () => {
                console.log('Monthly button clicked');
                updateTimeGraphs('monthly');
            });
        }

        // Set daily as default active button if it exists
        if (dailyBtn) {
            dailyBtn.classList.add("active-button");
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded - Power usage script running");

    try {
        // Setup event listeners
        setupEventListeners();

        // Create charts based on which page we're on
        createTimeGraphs();

        createAreaCharts();
        createDeviceCharts();
        calculateTotals();

    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});