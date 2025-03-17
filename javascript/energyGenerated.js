// Import all shared data from energyData.js
import { timeLabels, totalEnergyDataGenerated, updateEnergyDataNow } from './energyData.js';

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
console.log("Current office ID for energy generation:", currentOfficeID);

// Chart Elements - Get only if they exist
let energyUsageCtx;
let energyChart;

const energyUsageElement = document.getElementById('energyGeneratedChart');
if (energyUsageElement) {
    console.log('Found energyGeneratedChart element');
    energyUsageCtx = energyUsageElement.getContext('2d');
}

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

    // Get the content to convert to PDF (target the power-container)
    const powerContainer = document.querySelector('.power-container');
    const sideNav = document.querySelector('.side-nav');
    const notificationModal = document.querySelector('#notificationModal');

    // Store original styles to restore later
    const originalSideNavDisplay = sideNav ? sideNav.style.display : '';
    const originalMainContentMargin = document.querySelector('.main-content').style.marginLeft;
    const originalBodyOverflow = document.body.style.overflow;

    // Hide side-nav and notification modal during PDF generation
    if (sideNav) sideNav.style.display = 'none';
    if (notificationModal) notificationModal.style.display = 'none';

    // Adjust layout to fill the space left by the side-nav
    if (document.querySelector('.main-content')) {
        document.querySelector('.main-content').style.marginLeft = '20px'; // Reset margin to a small value
    }
    document.body.style.overflow = 'visible'; // Ensure no hidden overflow

    // Configure html2pdf options to capture the full content
    const opt = {
        margin: 10, // Margin in mm
        filename: `energy_generated_report_${new Date().toISOString().split('T')[0]}.pdf`, // Dynamic filename with date
        image: { type: 'jpeg', quality: 0.98 }, // High-quality image for charts
        html2canvas: {
            scale: 2, // Increase resolution for better chart quality
            useCORS: true, // Handle cross-origin images if any
            windowWidth: document.body.scrollWidth, // Ensure full width is captured
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            putOnlyUsedFonts: true, // Optimize PDF size
        },
        pagebreak: { mode: ['css', 'legacy'] }, // Handle page breaks properly
    };

    // Generate and download the PDF
    html2pdf().set(opt).from(powerContainer).save().then(() => {
        // Restore original styles after download
        if (sideNav) sideNav.style.display = originalSideNavDisplay;
        if (notificationModal) notificationModal.style.display = 'none'; // Ensure modal stays hidden unless triggered
        if (document.querySelector('.main-content')) {
            document.querySelector('.main-content').style.marginLeft = originalMainContentMargin;
        }
        document.body.style.overflow = originalBodyOverflow;
        document.body.removeChild(loadingDiv); // Remove loading indicator
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}

// **DEFAULT SELECTION**
let selectedTime = "daily";

// **Initialize Time-Based Graphs**
function createTimeGraphs() {
    // Create energy usage chart if the element exists
    if (energyUsageCtx) {
        console.log('Creating energy generation chart with data:', totalEnergyDataGenerated[selectedTime]);
        try {
            energyChart = new Chart(energyUsageCtx, {
                type: 'line',
                data: {
                    labels: timeLabels[selectedTime],
                    datasets: [{
                        label: 'Energy Generated (kW)',
                        data: totalEnergyDataGenerated[selectedTime],
                        borderColor: '#486e6c', // Line color
                        backgroundColor: 'rgba(96, 105, 82, 0.2)', // Optional for soft fill
                        fill: false,
                        tension: 0.4, // Makes the line curvy
                        borderWidth: 2, // Adjust line thickness
                        pointRadius: 4, // Adjust point size
                        pointBackgroundColor: '#486e6c' // Point color
                    }]
                },
                options: { 
                    responsive: true, 
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Generated Energy (kWh)'
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
                            text: 'Renewable Energy Generation',
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.raw} kWh`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating energy generation chart:', error);
        }
    }
}

// **Update Time Graphs Based on Period Selection**
function updateTimeGraphs(period) {
    console.log(`Updating time graphs to ${period} with data:`, totalEnergyDataGenerated[period]);
    selectedTime = period;

    // Update energy chart if it exists
    if (energyChart) {
        console.log('Updating energy generation chart');
        try {
            // Update x-axis title based on period
            energyChart.options.scales.x.title.text = 
                period === 'daily' ? 'Time' : 
                period === 'weekly' ? 'Day' : 'Week';
                
            energyChart.data.labels = timeLabels[period];
            energyChart.data.datasets[0].data = totalEnergyDataGenerated[period];
            energyChart.update();
        } catch (error) {
            console.error('Error updating energy generation chart:', error);
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

// Setup event listeners for the period selection buttons
function setupEventListeners() {
    console.log('Setting up event listeners for energy generation');

    try {
        // Add event listeners to time period buttons
        const dailyBtn = document.getElementById("daily");
        const weeklyBtn = document.getElementById("weekly");
        const monthlyBtn = document.getElementById("monthly");

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

        // Add event listener for the Download PDF button
        const downloadButton = document.querySelector('.download-pdf-button');
        if (downloadButton) {
            console.log('Adding click listener to download PDF button');
            downloadButton.addEventListener('click', () => {
                console.log('Download PDF button clicked');
                downloadPageAsPDF();
            });
        }

        // Add listener for energy generation data updates from Firebase
        document.addEventListener('energyGenerationDataUpdated', () => {
            console.log('Received energyGenerationDataUpdated event');
            updateTimeGraphs(selectedTime);
        });
        
        // Listen for user data changes (in case the office changes)
        window.addEventListener('storage', (event) => {
            if (event.key === 'userData') {
                console.log('User data changed, refreshing energy generation data');
                updateEnergyDataNow().then(() => {
                    updateTimeGraphs(selectedTime);
                });
            }
        });

    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Update all charts when data changes
function updateCharts() {
    console.log('Updating energy generation chart with new data');
    
    // If chart exists, destroy it and recreate
    if (energyChart) {
        energyChart.destroy();
        createTimeGraphs();
    } else {
        createTimeGraphs();
    }
}

// **Run Scripts on Page Load**
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded - Energy generation script running");

    try {
        // Fetch the latest data
        updateEnergyDataNow().then(() => {
            // Setup UI interactions
            setupEventListeners();
            
            // Create charts
            createTimeGraphs();
        });

    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});