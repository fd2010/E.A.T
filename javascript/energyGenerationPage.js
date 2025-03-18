// Import your modular energy data
import { totalEnergyDataGenerated, updateEnergyDataNow } from './energyData.js';
import { setupRenewableEnergyListener } from './energyDataGenerationFetcher.js';

// Add a DOMContentLoaded listener to initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Energy generation page loaded');
    
    // Check if the simulator is already initialized globally
    if (!window.renewableGenerator) {
        console.log('RenewableEnergySimulator not found, attempting to import');
        
        // Import and initialize the simulator if needed
        import('./generated-simulator.js').then((module) => {
            console.log('RenewableEnergySimulator module loaded');
            // The simulator self-initializes in its module
        }).catch(error => {
            console.error('Error loading RenewableEnergySimulator:', error);
        });
    } else {
        console.log('Found existing renewableGenerator:', window.renewableGenerator);
    }
    
    // Set up the listener for the generated data
    setupRenewableEnergyListener();
    
    // Set up the chart update listener
    document.addEventListener('energyGenerationDataUpdated', updateGenerationCharts);
    
    // Initial data fetch
    updateEnergyDataNow();
});

// Function to update your charts when generation data changes
function updateGenerationCharts() {
    console.log('Updating generation charts with data:', totalEnergyDataGenerated);
    
    // If you have charts initialized, update them here
    // For example:
    if (window.dailyGenerationChart) {
        window.dailyGenerationChart.data.datasets[0].data = totalEnergyDataGenerated.daily;
        window.dailyGenerationChart.update();
    }
    
    if (window.weeklyGenerationChart) {
        window.weeklyGenerationChart.data.datasets[0].data = totalEnergyDataGenerated.weekly;
        window.weeklyGenerationChart.update();
    }
    
    if (window.monthlyGenerationChart) {
        window.monthlyGenerationChart.data.datasets[0].data = totalEnergyDataGenerated.monthly;
        window.monthlyGenerationChart.update();
    }
}