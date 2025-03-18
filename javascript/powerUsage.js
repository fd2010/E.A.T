// Import all shared data from energyData.js
import { timeLabels, totalEnergyData, totalCostData, areaData, deviceData, devicesByArea, updateEnergyDataNow } from './energyData.js';

console.log("powerUsage.js loaded successfully!");

// Check if user data is available
function getUserOfficeID() {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            console.log("Current user office ID:", parsed.officeID);
            return parsed.officeID;
        }
    } catch (error) {
        console.error("Error retrieving user data:", error);
    }
    return null;
}

// Get current user's office ID
const currentOfficeID = getUserOfficeID();
console.log("Current office ID for power usage:", currentOfficeID);

// Chart Elements - Get only if they exist
let energyUsageCtx, areaBarCtx, devicePieCtx;
let energyChart, areaBarChart, devicePieChart;

// Get contexts only if elements exist
const energyUsageElement = document.getElementById('energyUsageChart');
if (energyUsageElement) {
    console.log('Found energyUsageChart element');
    energyUsageCtx = energyUsageElement.getContext('2d');
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

// **DEFAULT SELECTION**
let selectedTime = "daily";

// **DOWNLOAD**
function downloadPageAsPDF() {
    // Create a loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdfLoading';
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingDiv.style.color = 'white';
    loadingDiv.style.borderRadius = '10px';
    loadingDiv.style.zIndex = '1000';
    loadingDiv.innerText = 'Generating PDF...';
    document.body.appendChild(loadingDiv);

    // Get the content to convert to PDF
    const element = document.querySelector('.power-container');
    const sideNav = document.querySelector('.side-nav');
    const notificationModal = document.querySelector('#notificationModal');
    const rightPanel = document.querySelector('.right-panel');

    // Store original styles to restore later
    const originalSideNavDisplay = sideNav ? sideNav.style.display : '';
    const originalMainContentMargin = document.querySelector('.main-content').style.marginLeft;
    const originalRightPanelPosition = rightPanel ? rightPanel.style.position : '';
    const originalRightPanelRight = rightPanel ? rightPanel.style.right : '';

    // Hide side-nav and notification modal during PDF generation
    if (sideNav) sideNav.style.display = 'none';
    if (notificationModal) notificationModal.style.display = 'none';

    // Adjust layout
    if (document.querySelector('.main-content')) {
        document.querySelector('.main-content').style.marginLeft = '20px';
        document.querySelector('.main-content').style.marginRight = '0';
    }
    if (rightPanel) {
        rightPanel.style.position = 'static';
        rightPanel.style.right = 'auto';
        rightPanel.style.width = '250px';
        rightPanel.style.float = 'right';
        rightPanel.style.marginLeft = '20px';
    }

    // Configure html2pdf options
    const opt = {
        margin: 10,
        filename: `power_usage_report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            windowWidth: document.body.scrollWidth,
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            putOnlyUsedFonts: true,
        },
        pagebreak: { mode: ['css', 'legacy'] },
    };

    // Generate and download the PDF
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore original styles after download
        if (sideNav) sideNav.style.display = originalSideNavDisplay;
        if (notificationModal) notificationModal.style.display = 'none';
        if (document.querySelector('.main-content')) {
            document.querySelector('.main-content').style.marginLeft = originalMainContentMargin;
        }
        if (rightPanel) {
            rightPanel.style.position = originalRightPanelPosition;
            rightPanel.style.right = originalRightPanelRight;
            rightPanel.style.float = 'none';
            rightPanel.style.marginLeft = '';
        }
        document.body.removeChild(loadingDiv);
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}

// Function to generate color palette
function generateColors(count) {
    const baseColors = [
        '#486e6c', // Teal
        '#B04242', // Red
        '#9cab83', // Green
        '#8a6d3b', // Brown
        '#7c90a0'  // Blue-gray
    ];
    
    // If we have more areas than base colors, generate additional colors
    if (count <= baseColors.length) {
        return baseColors.slice(0, count);
    }
    
    // Otherwise generate gradient colors
    return generateGradientColors('#486e6c', '#cfe3e1', count);
}

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

// **Initialize Energy Usage Chart**
function createEnergyChart() {
    if (energyUsageCtx) {
        console.log('Creating energy usage chart with data:', totalEnergyData[selectedTime]);
        try {
            energyChart = new Chart(energyUsageCtx, {
                type: 'line',
                data: {
                    labels: timeLabels[selectedTime],
                    datasets: [{
                        label: 'Energy Usage (kW)',
                        data: totalEnergyData[selectedTime],
                        borderColor: '#486e6c', 
                        backgroundColor: 'rgba(72, 110, 108, 0.2)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#486e6c'
                    }]
                },
                options: { 
                    responsive: true, 
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Energy Usage (kW)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: selectedTime === 'daily' ? 'Time' : selectedTime === 'weekly' ? 'Day' : 'Week'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Energy Usage Over Time',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating energy usage chart:', error);
        }
    }
}

// **Create Area Bar Chart**
function createAreaChart() {
    if (areaBarCtx) {
        console.log('Creating area bar chart with data:', Object.keys(areaData));
        try {
            const areaColors = generateColors(Object.keys(areaData).length);
            
            areaBarChart = new Chart(areaBarCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(areaData),
                    datasets: [{
                        label: 'Energy Usage (kW)',
                        data: Object.values(areaData),
                        backgroundColor: areaColors
                    }]
                },
                options: { 
                    responsive: true, 
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Energy Usage (kW)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Energy Usage by Area',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating area bar chart:', error);
        }
    }
}

// **Create Device Pie Chart**
function createDeviceChart() {
    if (devicePieCtx) {
        console.log('Creating device pie chart with data:', Object.keys(deviceData));
        try {
            const deviceColors = generateGradientColors('rgb(57, 89, 87)','rgb(225, 243, 241)', Object.keys(deviceData).length);
            
            devicePieChart = new Chart(devicePieCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(deviceData),
                    datasets: [{
                        data: Object.values(deviceData),
                        backgroundColor: deviceColors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            align: 'start',
                            labels: {
                                font: {
                                    size: 13,
                                    family: 'Kay Pho Du'
                                },
                                color: '#333333',
                                boxWidth: 14,
                                padding: 15
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating device pie chart:', error);
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
            // Update x-axis title based on period
            energyChart.options.scales.x.title.text = 
                period === 'daily' ? 'Time' : 
                period === 'weekly' ? 'Day' : 'Week';
                
            energyChart.data.labels = timeLabels[period];
            energyChart.data.datasets[0].data = totalEnergyData[period];
            energyChart.update();
        } catch (error) {
            console.error('Error updating energy chart:', error);
        }
    }

    // Highlight the active button
    document.querySelectorAll(".graph-buttons button").forEach(btn => {
        if (btn.id === period) {
            btn.classList.add("active-button");
        } else {
            btn.classList.remove("active-button");
        }
    });
}

// **Calculate Totals for Right Panel**
function calculateTotals() {
    const totalEnergyElement = document.getElementById('totalEnergy');
    const totalCostElement = document.getElementById('totalCost');
    
    if (!totalEnergyElement && !totalCostElement) return;

    console.log('Calculating totals');
    try {
        let totalEnergy = 0, totalCost = 0;
        
        // Calculate totals from devicesByArea
        Object.entries(devicesByArea).forEach(([_, devices]) => {
            devices.forEach(device => {
                totalEnergy += device.energy;
                totalCost += device.cost;
            });
        });
        
        // Update total energy display
        if (totalEnergyElement) {
            totalEnergyElement.textContent = `${totalEnergy.toFixed(2)}`;
        }
        
        // Update total cost display
        if (totalCostElement) {
            totalCostElement.textContent = `£${totalCost.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error calculating totals:', error);
    }
}

// Update all charts when data changes
function updateAllCharts() {
    console.log('Updating all charts with new data');
    
    // Update time-based charts
    if (energyChart) {
        updateTimeGraphs(selectedTime);
    }
    
    // Destroy and recreate area chart
    if (areaBarChart) {
        areaBarChart.destroy();
    }
    createAreaChart();
    
    // Destroy and recreate device chart
    if (devicePieChart) {
        devicePieChart.destroy();
    }
    createDeviceChart();
    
    // Recalculate totals
    calculateTotals();
}

// Setup event listeners for UI interactions
function setupEventListeners() {
    console.log('Setting up event listeners');

    try {
        // Explicitly set function on window
        window.updateTimeGraphs = updateTimeGraphs;
        
        // Set daily as default active button
        document.getElementById('daily').classList.add("active-button");

        // Add event listener for the Download PDF button
        const downloadButton = document.querySelector('.download-pdf-button');
        if (downloadButton) {
            downloadButton.addEventListener('click', downloadPageAsPDF);
        }

        // Listen for energy data updates
        document.addEventListener('energyDataUpdated', () => {
            console.log('Received energyDataUpdated event');
            updateAllCharts();
        });
        
        // Listen for user data changes (in case the office changes)
        window.addEventListener('storage', (event) => {
            if (event.key === 'userData') {
                console.log('User data changed, refreshing charts');
                updateEnergyDataNow().then(() => {
                    updateAllCharts();
                });
            }
        });

    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded - Power usage script running");

    try {
        // First fetch the latest data based on current user's office
        updateEnergyDataNow().then(() => {
            // Create initial charts
            createEnergyChart();
            createAreaChart();
            createDeviceChart();
            
            // Calculate totals for display
            calculateTotals();
            
            // Setup event listeners for UI interactions
            setupEventListeners();
        });
    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});