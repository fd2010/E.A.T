// cross-page-sync.js - Fixed version with no duplicate declarations

// This script allows simulator data to be synchronized across pages

// Function to broadcast simulator data to other tabs
function broadcastSimulatorData(data) {
    // Use localStorage as a communication channel between tabs
    localStorage.setItem('simulatorDataTimestamp', new Date().toISOString());
    localStorage.setItem('simulatorData', JSON.stringify(data));
    
    console.log('Broadcasted simulator data to other tabs:', data);
}

// Listen for simulator data updates if we're on the simulator page
if (window.location.pathname.includes('simulatorpagebackup.html')) {
    console.log('Setting up simulator data broadcast from simulator page');
    
    document.addEventListener('simulatorDataUpdated', function() {
        console.log('Broadcasting simulator data to other tabs');
        
        // Get data from the simulator
        if (window.simulator && typeof window.simulator.getTotalEnergyConsumptionData === 'function') {
            const data = window.simulator.getTotalEnergyConsumptionData();
            broadcastSimulatorData(data);
        }
    });
    
    // Add function to the SmartMeterSimulator.prototype to broadcast data
    if (window.simulator) {
        const originalGenerateAndSave = window.simulator.generateAndSaveReading;
        
        // Override the existing method to add broadcasting
        window.simulator.generateAndSaveReading = function() {
            // Call the original method first and store its result
            const result = originalGenerateAndSave.apply(this, arguments);
            
            // After saving the reading, broadcast to other tabs
            if (result && typeof broadcastSimulatorData === 'function') {
                broadcastSimulatorData(this.getTotalEnergyConsumptionData());
            }
            
            return result;
        };
    }
    
    // For the renewable energy simulator
    if (window.renewableGenerator) {
        const originalGenerateAndSave = window.renewableGenerator.generateAndSaveReading;
        
        // Override the existing method to add broadcasting
        window.renewableGenerator.generateAndSaveReading = function() {
            // Call the original method first and store its result
            const result = originalGenerateAndSave.apply(this, arguments);
            
            // After saving the reading, broadcast to other tabs
            if (result && typeof broadcastSimulatorData === 'function') {
                broadcastSimulatorData(this.getAggregatedData());
            }
            
            return result;
        };
    }
}

// On visualization pages, listen for localStorage changes
if (!window.location.pathname.includes('simulatorpagebackup.html')) {
    console.log('Setting up simulator data receiver on visualization page');
    
    // Listen for changes in localStorage
    window.addEventListener('storage', function(event) {
        // If the simulator data timestamp changed, this is a broadcast from another tab
        if (event.key === 'simulatorDataTimestamp') {
            console.log('Received simulator data from another tab');
            
            try {
                // Get the data from localStorage
                const simulatorData = JSON.parse(localStorage.getItem('simulatorData'));
                if (simulatorData) {
                    console.log('Processing simulator data:', simulatorData);
                    
                    // Create and dispatch a chartDataUpdated event with this data
                    const customEvent = new CustomEvent('chartDataUpdated', { detail: simulatorData });
                    document.dispatchEvent(customEvent);
                }
            } catch (error) {
                console.error('Error processing simulator data from localStorage:', error);
            }
        }
    });
}

// Export for use in other modules
export {
    broadcastSimulatorData
};