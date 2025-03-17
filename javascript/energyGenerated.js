// Import all shared data from energyData.js
import { timeLabels, totalEnergyDataGenerated } from './energyData.js';


// Chart Elements - Get only if they exist
let energyUsageCtx;


const energyUsageElement = document.getElementById('energyGeneratedChart');
if (energyUsageElement) {
    console.log('Found energyGeneratedChart element');
    energyUsageCtx = energyUsageElement.getContext('2d');
}


// **DEFAULT SELECTION**
let selectedTime = "daily";
let energyChart;

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
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        } catch (error) {
            console.error('Error creating energy usage chart:', error);
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
            energyChart.data.datasets[0].data = totalEnergyDataGenerated[period];
            energyChart.update();
        } catch (error) {
            console.error('Error updating energy chart:', error);
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

        setupEventListeners();

        // Create charts based on which page we're on
        createTimeGraphs();

    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});