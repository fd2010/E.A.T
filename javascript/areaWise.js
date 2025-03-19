// Import shared data from energyData.js
import { timeLabels, energyData, costData, devicesByArea, areaData, deviceData, updateEnergyDataNow } from './energyData.js';

console.log(" areaWise.js loaded successfully!");
console.log(" timeLabels:", timeLabels);
console.log(" energyData:", energyData);
console.log(" devicesByArea:", devicesByArea);

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
console.log("Current office ID for area-wise usage:", currentOfficeID);

// **Chart Elements**
const areaComparisonPieCtx = document.getElementById('areaComparisonPie').getContext('2d');
const areaComparisonBarCtx = document.getElementById('areaComparisonBar').getContext('2d');
const areaTimeCostCtx = document.getElementById('areaTimeCostChart').getContext('2d');
const areaTimeEnergyCtx = document.getElementById('areaTimeEnergyChart').getContext('2d');
const devicePieCtx = document.getElementById('devicePieChart').getContext('2d');
const deviceBarCtx = document.getElementById('deviceBarChart').getContext('2d');

// **Normalize Area Names**
function normalizeArea(area) {
    const mapping = {
        "meeting": "Meeting Room",
        "work": "Workstations",
        "common": "Common Areas",
        "special": "Special"
    };
    return mapping[area] || area;
}

// **Set Default Values**
let selectedArea = normalizeArea("meeting");
let selectedTime = "daily";
let areaPieChart, areaBarChart, energyChart, costChart, devicePieChart, deviceBarChart;

// Generate nice colors for the charts
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

// **Initialize Area Comparison Charts**
function createAreaCharts() {
    console.log("Creating area comparison charts with data:", Object.keys(areaData));
    const areaColors = generateColors(Object.keys(areaData).length);
    
    areaPieChart = new Chart(areaComparisonPieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(areaData),
            datasets: [{
                data: Object.values(areaData),
                backgroundColor: areaColors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Energy Usage by Area',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Kay Pho Du' } }
                }
            }
        }
    });

    areaBarChart = new Chart(areaComparisonBarCtx, {
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
                    font: { size: 16 }
                }
            }
        }
    });
}

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    console.log("Initializing Time Graphs for area:", selectedArea);

    if (!energyData[selectedArea] || !costData[selectedArea]) {
        console.error(`No energy or cost data found for '${selectedArea}'`);
        return;
    }

    energyChart = new Chart(areaTimeEnergyCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Energy (kW)',
                data: energyData[selectedArea][selectedTime],
                borderColor: '#486e6c',
                backgroundColor: 'rgba(72, 110, 108, 0.2)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4
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
            }
        }
    });

    costChart = new Chart(areaTimeCostCtx, {
        type: 'line',
        data: {
            labels: timeLabels[selectedTime],
            datasets: [{
                label: 'Cost (£)',
                data: costData[selectedArea][selectedTime],
                borderColor: '#B04242',
                backgroundColor: 'rgba(176, 66, 66, 0.2)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4
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
            }
        }
    });
}

// **Update Time Graphs Based on Period Selection**
window.updateTimeGraphs = function (period) {
    selectedTime = period;
    console.log(` Updating Time Graphs for ${selectedArea} (${period})`);

    const normalizedArea = normalizeArea(selectedArea);

    if (!energyData[normalizedArea] || !costData[normalizedArea]) {
        console.error(` No energy or cost data found for '${normalizedArea}'`);
        return;
    }

    energyChart.data.labels = timeLabels[selectedTime];
    energyChart.data.datasets[0].data = energyData[normalizedArea][selectedTime]; 
    energyChart.update();

    costChart.data.labels = timeLabels[selectedTime];
    costChart.data.datasets[0].data = costData[normalizedArea][selectedTime]; 
    costChart.update();

    // Highlight the active button
    document.querySelectorAll(".area-graph-buttons button").forEach(btn => btn.classList.remove("active-button"));
    document.getElementById(period).classList.add("active-button");
};

// **Update Device & Time Graphs When Changing Area**
function updateAreaData() {
    const normalizedArea = normalizeArea(selectedArea);
    console.log(" Selected Area:", normalizedArea);

    if (!devicesByArea[normalizedArea]) {
        console.error(` No data found for selected area: '${normalizedArea}'`);
        return;
    }

    let deviceHTML = "";
    let deviceNames = [];
    let deviceEnergy = [];

    devicesByArea[normalizedArea].forEach(device => {
        deviceHTML += `
            <div class="device-panel">
                <h3>${device.name}</h3>
                <p>Usage: ${device.energy} kWh | Cost: £${device.cost}</p>
            </div>`;
        deviceNames.push(device.name);
        deviceEnergy.push(device.energy);
    });

    document.getElementById('deviceList').innerHTML = deviceHTML;

    if (devicePieChart) devicePieChart.destroy();
    if (deviceBarChart) deviceBarChart.destroy();

    const deviceColors = generateColors(deviceNames.length);

    devicePieChart = new Chart(devicePieCtx, {
        type: 'pie',
        data: {
            labels: deviceNames,
            datasets: [{
                data: deviceEnergy,
                backgroundColor: deviceColors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Device Energy Usage',
                    font: { size: 16 }
                }
            }
        }
    });

    deviceBarChart = new Chart(deviceBarCtx, {
        type: 'bar',
        data: {
            labels: deviceNames,
            datasets: [{
                label: 'Energy Usage (kW)',
                data: deviceEnergy,
                backgroundColor: deviceColors
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
                    text: 'Device Energy Usage',
                    font: { size: 16 }
                }
            }
        }
    });

    // Update time graphs when area changes
    updateTimeGraphs(selectedTime);
}

// ** PDF Download Function
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

    // Store original styles to restore later
    const originalSideNavDisplay = sideNav ? sideNav.style.display : '';
    const originalMainContentMargin = document.querySelector('.main-content').style.marginLeft;

    // Hide side-nav and notification modal during PDF generation
    if (sideNav) sideNav.style.display = 'none';
    if (notificationModal) notificationModal.style.display = 'none';

    // Adjust layout
    if (document.querySelector('.main-content')) {
        document.querySelector('.main-content').style.marginLeft = '20px';
    }

    // Configure html2pdf options
    const opt = {
        margin: 10,
        filename: `area_usage_report_${new Date().toISOString().split('T')[0]}.pdf`,
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
        document.body.removeChild(loadingDiv);
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}

// Update all charts when data changes
function updateAllCharts() {
    console.log('Updating all charts with new data');
    
    // Destroy and recreate area charts
    if (areaPieChart) {
        areaPieChart.destroy();
    }
    if (areaBarChart) {
        areaBarChart.destroy();
    }
    createAreaCharts();
    
    // Update device and time graphs for the selected area
    updateAreaData();
}

// **Dropdown Event Listener**
document.getElementById('areaTypeDropdown').addEventListener('change', function () {
    selectedArea = this.value; // Store the dropdown value
    console.log(" Updating area:", selectedArea);
    updateAreaData();
});

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    console.log(" DOM Content Loaded - areaWise.js running");
    
    // Update dropdown with available areas
    const dropdown = document.getElementById('areaTypeDropdown');
    dropdown.innerHTML = '';
    
    Object.keys(areaData).forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        dropdown.appendChild(option);
    });
    
    selectedArea = dropdown.value;
    
    // First fetch the latest data for the current user's office
    updateEnergyDataNow().then(() => {
        // Create charts
        createAreaCharts();
        createTimeGraphs();
        updateAreaData();
        
        // Set up download button
        const downloadButton = document.querySelector('.download-pdf-button');
        if (downloadButton) {
            downloadButton.addEventListener('click', downloadPageAsPDF);
        }
        
        // Set default active period button
        document.getElementById('daily').classList.add('active-button');
        
        // Listen for data updates
        document.addEventListener('energyDataUpdated', updateAllCharts);
        
        // Listen for user data changes (if office changes)
        window.addEventListener('storage', (event) => {
            if (event.key === 'userData') {
                console.log('User data changed, refreshing data');
                updateEnergyDataNow().then(updateAllCharts);
            }
        });
    });
});