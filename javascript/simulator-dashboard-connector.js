// simulator-dashboard-connector.js - Connects the simulator to the dashboard visualization

import { database } from '../database/firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

class SimulatorDashboardConnector {
    constructor() {
        // Connection status
        this.connectedToFirebase = false;
        this.simulatorRunning = false;
        
        // Track the current page to apply appropriate updates
        this.currentPage = this.detectCurrentPage();
        
        // Initialize the connection
        this.initializeConnection();
    }
    
    // Detect which page we're on
    detectCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('dashboard.html')) {
            return 'dashboard';
        } else if (path.includes('pUsage.html')) {
            return 'pUsage';
        } else if (path.includes('overallUsage.html')) {
            return 'overallUsage';
        } else if (path.includes('simulatorpagebackup.html')) {
            return 'simulator';
        }
        
        return 'unknown';
    }
    
    // Initialize connections to Firebase and simulators
    initializeConnection() {
        console.log(`Initializing SimulatorDashboardConnector on page: ${this.currentPage}`);
        
        // Connect to Firebase
        this.connectToFirebase();
        
        // Connect to simulators if we're on the simulator page
        if (this.currentPage === 'simulator') {
            this.setupSimulatorListeners();
        } else {
            // On visualization pages, set up listeners for data updates
            this.setupVisualizationListeners();
        }
    }
    
    // Connect to Firebase database
    connectToFirebase() {
        if (!database) {
            console.error("Firebase database not initialized");
            return;
        }
        
        // Test connection by reading a simple node
        const testRef = ref(database, '.info/connected');
        onValue(testRef, (snapshot) => {
            if (snapshot.val() === true) {
                this.connectedToFirebase = true;
                console.log("Connected to Firebase database");
                
                // Now that we're connected, set up data listeners
                this.setupFirebaseDataListeners();
            } else {
                this.connectedToFirebase = false;
                console.warn("Disconnected from Firebase database");
            }
        });
    }
    
    // Set up listeners for the simulator page
    setupSimulatorListeners() {
        console.log("Setting up simulator page listeners");
        
        // Check for simulator objects periodically
        const checkForSimulators = setInterval(() => {
            // Check for consumption simulator
            if (window.simulator) {
                console.log("Found consumption simulator");
                clearInterval(checkForSimulators);
                
                // Listen for simulator start/stop
                const startStopBtn = document.getElementById('startStopButton');
                if (startStopBtn) {
                    startStopBtn.addEventListener('click', () => {
                        this.simulatorRunning = !this.simulatorRunning;
                        console.log(`Simulator ${this.simulatorRunning ? 'started' : 'stopped'}`);
                    });
                }
                
                // Listen for reading generation
                document.addEventListener('simulatorDataUpdated', () => {
                    console.log("Simulator data updated - ready for dashboard consumption");
                });
            }
            
            // Check for generation simulator
            if (window.renewableGenerator) {
                console.log("Found renewable energy generator");
                clearInterval(checkForSimulators);
                
                // Listen for generator start/stop
                const genStartStopBtn = document.getElementById('generatorStartStopButton');
                if (genStartStopBtn) {
                    genStartStopBtn.addEventListener('click', () => {
                        console.log("Generator start/stop clicked");
                    });
                }
                
                // Listen for generation data updates
                document.addEventListener('simulatorDataUpdated', () => {
                    console.log("Generator data updated - ready for dashboard consumption");
                });
            }
        }, 1000);
        
        // Cleanup after 10 seconds if simulators aren't found
        setTimeout(() => {
            clearInterval(checkForSimulators);
        }, 10000);
    }
    
    // Set up listeners for visualization pages
    setupVisualizationListeners() {
        console.log(`Setting up visualization listeners for page: ${this.currentPage}`);
        
        // Listen for energy data updates from our bridge
        document.addEventListener('energyDataUpdated', () => {
            console.log(`Energy consumption data updated for ${this.currentPage} page`);
            
            if (this.currentPage === 'dashboard') {
                this.updateDashboardCharts();
            } else if (this.currentPage === 'pUsage') {
                this.updatePowerUsageCharts();
            } else if (this.currentPage === 'overallUsage') {
                this.updateOverallUsageCharts();
            }
        });
        
        // Listen for generation data updates
        document.addEventListener('energyGenerationDataUpdated', () => {
            console.log(`Energy generation data updated for ${this.currentPage} page`);
            
            if (this.currentPage === 'dashboard') {
                this.updateDashboardGenerationCharts();
            }
        });
    }
    
    // Set up Firebase data listeners
    setupFirebaseDataListeners() {
        console.log("Setting up Firebase data listeners");
        
        // Listen for energy consumption data updates
        const consumptionRef = ref(database, 'energy-consumed/aggregated');
        onValue(consumptionRef, (snapshot) => {
            if (snapshot.exists()) {
                console.log("Received energy consumption update from Firebase");
                
                // The energyDataBridge already handles this data,
                // but we can add specific handling here if needed
            }
        });
        
        // Listen for energy generation data updates
        const generationRef = ref(database, 'energy-generated/aggregated');
        onValue(generationRef, (snapshot) => {
            if (snapshot.exists()) {
                console.log("Received energy generation update from Firebase");
                
                // The energyDataBridge already handles this data,
                // but we can add specific handling here if needed
            }
        });
    }
    
    // Update dashboard charts
    updateDashboardCharts() {
        // Find the energy usage chart and update it
        const energyChart = getChartById('energyUsageChart');
        if (energyChart) {
            console.log("Updating dashboard energy usage chart");
            // The chart's update function is typically called automatically
            // through the 'updateTimeGraphs' function in powerUsage.js
        }
    }
    
    // Update dashboard generation charts
    updateDashboardGenerationCharts() {
        // Dashboard doesn't have generation charts by default
        // But we could update related UI elements if needed
    }
    
    // Update power usage charts
    updatePowerUsageCharts() {
        // Find and update the energy usage chart
        const energyChart = getChartById('energyUsageChart');
        if (energyChart) {
            console.log("Updating power usage energy chart");
        }
        
        // Find and update the area bar chart
        const areaChart = getChartById('areaBarChart');
        if (areaChart) {
            console.log("Updating power usage area chart");
        }
        
        // Find and update the device pie chart
        const deviceChart = getChartById('devicePieChart');
        if (deviceChart) {
            console.log("Updating power usage device chart");
        }
    }
    
    // Update overall usage charts
    updateOverallUsageCharts() {
        // Find and update the energy usage chart
        const energyChart = getChartById('energyUsageChart');
        if (energyChart) {
            console.log("Updating overall usage energy chart");
        }
        
        // Find and update the cost chart
        const costChart = getChartById('energyCostChart');
        if (costChart) {
            console.log("Updating overall usage cost chart");
        }
    }
}

// Helper function to get a Chart.js instance by canvas ID
function getChartById(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    // Try to find the chart instance
    return Chart.getChart(canvas);
}

// Initialize the connector when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Simulator Dashboard Connector");
    window.dashboardConnector = new SimulatorDashboardConnector();
});

export default SimulatorDashboardConnector;