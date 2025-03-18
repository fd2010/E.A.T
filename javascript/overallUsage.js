// Import all shared data from energyData.js
import { timeLabels, totalEnergyData, totalCostData, areaData, deviceData, devicesByArea } from './energyData.js';

console.log("overallUsage.js loaded successfully!");

// Chart Elements - Get only if they exist
let energyCostCtx, energyUsageCtx;
let energyChart, costChart;

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
    }
    if (rightPanel) {
        rightPanel.style.position = 'static';
        rightPanel.style.right = '0';
        rightPanel.style.width = '250px';
    }

    // Configure html2pdf options
    const opt = {
        margin: 10,
        filename: `overall_usage_report_${new Date().toISOString().split('T')[0]}.pdf`,
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
        }
        document.body.removeChild(loadingDiv);
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    // Create energy usage chart if the element exists
    if (energyUsageCtx) {
        console.log('Creating energy usage chart with data:', totalEnergyData[selectedTime]);
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw} kW`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Create cost chart if the element exists
    if (energyCostCtx) {
        console.log('Creating energy cost chart with data:', totalCostData[selectedTime]);
        costChart = new Chart(energyCostCtx, {
            type: 'line',
            data: {
                labels: timeLabels[selectedTime],
                datasets: [{
                    label: 'Energy Cost (£)',
                    data: totalCostData[selectedTime],
                    borderColor: '#B04242',
                    backgroundColor: 'rgba(176, 66, 66, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#B04242'
                }]
            },
            options: { 
                responsive: true, 
                scales: { 
                    y: { 
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cost (£)'
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
                        text: 'Energy Cost Over Time',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `£${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// **Update Time Graphs Based on Period Selection**
function updateTimeGraphs(period) {
    console.log(`Updating time graphs to ${period}`);
    selectedTime = period;

    // Update energy chart if it exists
    if (energyChart) {
        console.log('Updating energy chart');
        // Update x-axis title based on period
        energyChart.options.scales.x.title.text = 
            period === 'daily' ? 'Time' : 
            period === 'weekly' ? 'Day' : 'Week';
            
        energyChart.data.labels = timeLabels[period];
        energyChart.data.datasets[0].data = totalEnergyData[period];
        energyChart.update();
    }

    // Update cost chart if it exists
    if (costChart) {
        console.log('Updating cost chart');
        // Update x-axis title based on period
        costChart.options.scales.x.title.text = 
            period === 'daily' ? 'Time' : 
            period === 'weekly' ? 'Day' : 'Week';
            
        costChart.data.labels = timeLabels[period];
        costChart.data.datasets[0].data = totalCostData[period];
        costChart.update();
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
}

// Setup event listeners for UI interactions
function setupEventListeners() {
    // Explicitly set function on window
    window.updateTimeGraphs = updateTimeGraphs;
    
    // Set daily as default active button
    const dailyButton = document.getElementById('daily');
    if (dailyButton) {
        dailyButton.classList.add("active-button");
    }

    // Add event listener for the Download PDF button
    const downloadButton = document.querySelector('.download-pdf-button');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadPageAsPDF);
    }

    // Listen for energy data updates
    document.addEventListener('energyDataUpdated', () => {
        console.log('Received energyDataUpdated event');
        
        if (energyChart || costChart) {
            updateTimeGraphs(selectedTime);
        }
        
        calculateTotals();
    });
}

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded - Overall usage script running");
    
    // Create initial charts
    createTimeGraphs();
    
    // Calculate totals for display
    calculateTotals();
    
    // Setup event listeners for UI interactions
    setupEventListeners();
});