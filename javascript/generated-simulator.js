// Import Firebase modules
import { onValue, ref, set, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

class RenewableEnergySimulator {
    constructor() {
        // Simulation variables
        this.isRunning = false;
        this.interval = 6; // hours by default (simulated)
        this.speedMultiplier = 10; // seconds per simulated hour
        this.intervalId = null;
        this.readings = [];
        
        // Generation specs for different renewable sources
        this.generationSpecs = {
            'Solar Panel': { 
                kwhRange: [0.2, 5.0],
                weatherFactor: true,
                timeFactor: true
            },
            'Wind Turbine': { 
                kwhRange: [0.5, 8.0],
                weatherFactor: true,
                timeFactor: false
            },
            'Geothermal': { 
                kwhRange: [2.0, 4.0],
                weatherFactor: false,
                timeFactor: false
            }
        };
        
        // Track the generated data for easy export
        this.generatedData = {
            daily: [],   // Every 6 hours (4 readings per day)
            weekly: [],  // Daily totals for a week
            monthly: []  // Weekly totals for a month
        };
        
        // Track the last simulated time
        this.currentSimulatedTime = new Date();
        
        // Track the database connection status
        this.connectedToFirebase = false;
        
        // Connect to Firebase
        this.connectToFirebase();
        
        // Initialize weather conditions
        this.weatherConditions = this.generateWeatherConditions();
    }
    
    connectToFirebase() {
        // Check if we can connect to the 'energy-generated' node
        onValue(ref(database, 'energy-generated'), (snapshot) => {
            this.connectedToFirebase = true;
            console.log('Connected to Firebase energy generation database');
            
            // Initialize the database structure if it doesn't exist
            if (!snapshot.exists()) {
                this.initializeDatabase();
            } else {
                // Load existing data
                this.loadExistingData(snapshot.val());
            }
            
            // Update status in UI if element exists
            const dbStatus = document.getElementById('generatorDatabaseStatus');
            if (dbStatus) {
                dbStatus.innerHTML = '<span class="success">Connected to Firebase energy generation database.</span>';
            }
            
        }, (error) => {
            console.error("Firebase energy generation error:", error);
            
            // Update status in UI if element exists
            const dbStatus = document.getElementById('generatorDatabaseStatus');
            if (dbStatus) {
                dbStatus.innerHTML = `<span class="error">Error connecting to Firebase energy generation: ${error.message}</span>`;
            }
        });
    }
    
    initializeDatabase() {
        // Create initial structure for energy generation data
        set(ref(database, 'energy-generated'), {
            sources: {
                solarPanels: {
                    name: 'Solar Panels',
                    type: 'Solar Panel',
                    capacity: 'Average 4 kWh',
                    location: 'Rooftop'
                },
                windTurbines: {
                    name: 'Wind Turbines',
                    type: 'Wind Turbine',
                    capacity: 'Average 6 kWh',
                    location: 'Facility perimeter'
                },
                geothermalSystems: {
                    name: 'Geothermal Heat Pumps',
                    type: 'Geothermal',
                    capacity: 'Average 3 kWh',
                    location: 'Basement'
                }
            },
            readings: {},
            aggregated: {
                daily: [],
                weekly: [],
                monthly: []
            }
        });
    }
    
    loadExistingData(data) {
        // Load existing aggregated data if available
        if (data.aggregated) {
            if (data.aggregated.daily && Array.isArray(data.aggregated.daily)) {
                this.generatedData.daily = data.aggregated.daily;
            }
            
            if (data.aggregated.weekly && Array.isArray(data.aggregated.weekly)) {
                this.generatedData.weekly = data.aggregated.weekly;
            }
            
            if (data.aggregated.monthly && Array.isArray(data.aggregated.monthly)) {
                this.generatedData.monthly = data.aggregated.monthly;
            }
        }
        
        // Update UI
        this.updateGenerationUI();
    }
    
    updateGenerationUI() {
        // Update UI elements with current generation data
        const dailyDataEl = document.getElementById('dailyGenerationData');
        const weeklyDataEl = document.getElementById('weeklyGenerationData');
        const monthlyDataEl = document.getElementById('monthlyGenerationData');
        
        if (dailyDataEl) {
            dailyDataEl.textContent = JSON.stringify(this.generatedData.daily);
        }
        
        if (weeklyDataEl) {
            weeklyDataEl.textContent = JSON.stringify(this.generatedData.weekly);
        }
        
        if (monthlyDataEl) {
            monthlyDataEl.textContent = JSON.stringify(this.generatedData.monthly);
        }
    }
    
    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    generateWeatherConditions() {
        // Generate random weather conditions that will affect generation
        return {
            cloudCover: this.getRandomInRange(0, 1),  // 0 is clear, 1 is overcast
            windSpeed: this.getRandomInRange(0, 20),  // mph
            temperature: this.getRandomInRange(40, 90) // Fahrenheit
        };
    }
    
    updateWeatherConditions() {
        // Gradually change weather conditions
        const cloudChange = this.getRandomInRange(-0.2, 0.2);
        const windChange = this.getRandomInRange(-2, 2);
        const tempChange = this.getRandomInRange(-3, 3);
        
        this.weatherConditions.cloudCover = Math.max(0, Math.min(1, this.weatherConditions.cloudCover + cloudChange));
        this.weatherConditions.windSpeed = Math.max(0, Math.min(30, this.weatherConditions.windSpeed + windChange));
        this.weatherConditions.temperature = Math.max(20, Math.min(110, this.weatherConditions.temperature + tempChange));
    }
    
    getTimeEfficiencyFactor(sourceType) {
        const hour = this.currentSimulatedTime.getHours();
        
        // Solar is most efficient during daylight hours
        if (sourceType === 'Solar Panel') {
            // Peak hours between 10am and 2pm
            if (hour >= 10 && hour <= 14) {
                return 1.0;
            } 
            // Decent generation between 7am and 5pm
            else if (hour >= 7 && hour <= 17) {
                return 0.7;
            }
            // Low generation at dawn/dusk
            else if ((hour >= 5 && hour < 7) || (hour > 17 && hour <= 19)) {
                return 0.3;
            }
            // No generation at night
            else {
                return 0.0;
            }
        }
        
        // Other types don't have time factors
        return 1.0;
    }
    
    getWeatherEfficiencyFactor(sourceType) {
        switch (sourceType) {
            case 'Solar Panel':
                // Cloud cover affects solar (0 clouds = 100% efficiency, 1 = 20% efficiency)
                return 1.0 - (this.weatherConditions.cloudCover * 0.8);
                
            case 'Wind Turbine':
                // Wind needs to be between 7-25 mph for optimal generation
                if (this.weatherConditions.windSpeed < 3) {
                    return 0.1; // Too little wind
                } else if (this.weatherConditions.windSpeed < 7) {
                    return 0.4; // Low wind
                } else if (this.weatherConditions.windSpeed <= 25) {
                    return 1.0; // Optimal wind
                } else {
                    return 0.5; // Too much wind (turbines have to feather)
                }
                
            case 'Geothermal':
                // Not affected by weather
                return 1.0;
                
            default:
                return 1.0;
        }
    }
    
    getSeasonalEfficiencyFactor(sourceType) {
        const month = this.currentSimulatedTime.getMonth();
        
        switch (sourceType) {
            case 'Solar Panel':
                // More efficient in summer months
                if (month >= 4 && month <= 8) { // May through September
                    return 1.2;
                } else if (month >= 2 && month <= 10) { // March through November
                    return 1.0;
                } else { // Winter months
                    return 0.8;
                }
                
            case 'Wind Turbine':
                // More efficient in winter and fall (typically windier)
                if (month >= 9 || month <= 2) { // October through March
                    return 1.2;
                } else {
                    return 1.0;
                }
                
            default:
                return 1.0;
        }
    }
    
    generateEnergyReading() {
        if (!this.connectedToFirebase) {
            console.error("Not connected to Firebase database");
            return null;
        }
        
        const timestamp = new Date(this.currentSimulatedTime);
        const sourceReadings = {};
        let totalKwh = 0;
        
        // Update weather for this reading
        this.updateWeatherConditions();
        
        // Generate readings for each source
        for (const [sourceType, specs] of Object.entries(this.generationSpecs)) {
            let baseGeneration = this.getRandomInRange(specs.kwhRange[0], specs.kwhRange[1]);
            
            // Apply efficiency factors
            if (specs.timeFactor) {
                baseGeneration *= this.getTimeEfficiencyFactor(sourceType);
            }
            
            if (specs.weatherFactor) {
                baseGeneration *= this.getWeatherEfficiencyFactor(sourceType);
            }
            
            // Apply seasonal factor to all sources
            baseGeneration *= this.getSeasonalEfficiencyFactor(sourceType);
            
            // Round to 2 decimal places
            const kwhGenerated = Math.round(baseGeneration * 100) / 100;
            
            sourceReadings[sourceType] = {
                kwhGenerated: kwhGenerated
            };
            
            totalKwh += kwhGenerated;
        }
        
        // Create complete reading
        const reading = {
            timestamp: timestamp.getTime(),
            formattedTime: timestamp.toLocaleString(),
            totalKwh: Math.round(totalKwh * 100) / 100,
            sources: sourceReadings,
            weather: this.weatherConditions
        };
        
        // Add to readings array
        this.readings.push(reading);
        
        // Limit readings array to 100 entries to avoid memory issues
        if (this.readings.length > 100) {
            this.readings.shift();
        }
        
        return reading;
    }
    
    saveReadingToFirebase(reading) {
        if (!reading || !this.connectedToFirebase) return false;
        
        // Add to Firebase
        const readingsRef = ref(database, 'energy-generated/readings');
        const newReadingRef = push(readingsRef);
        set(newReadingRef, reading);
        
        // Update aggregated data
        this.updateAggregatedData(reading);
        
        return true;
    }
    
    updateAggregatedData(reading) {
        // Add to daily data (every 6 hours by default)
        // Daily data is per interval
        this.generatedData.daily.push(reading.totalKwh);
        
        // Keep only the last 5 daily readings
        if (this.generatedData.daily.length > 5) {
            this.generatedData.daily.shift();
        }
        
        // Simulate weekly data when we get 4 readings in a day (assuming 6 hour intervals)
        // Every 4th reading, add to weekly
        if (this.readings.length % 4 === 0) {
            // Sum the last 4 readings and add to weekly data
            const dayTotal = this.readings.slice(-4).reduce((sum, r) => sum + r.totalKwh, 0);
            this.generatedData.weekly.push(Math.round(dayTotal * 10) / 10);
            
            // Keep only the last 7 weekly readings
            if (this.generatedData.weekly.length > 7) {
                this.generatedData.weekly.shift();
            }
            
            // Every 7 days, add to monthly
            if (this.generatedData.weekly.length % 7 === 0) {
                const weekTotal = this.generatedData.weekly.reduce((sum, day) => sum + day, 0);
                this.generatedData.monthly.push(Math.round(weekTotal));
                
                // Keep only the last 4 monthly readings
                if (this.generatedData.monthly.length > 4) {
                    this.generatedData.monthly.shift();
                }
            }
        }
        
        // Update Firebase aggregated data
        set(ref(database, 'energy-generated/aggregated'), this.generatedData);
        
        // Update UI
        this.updateGenerationUI();
    }
    
    displayReading(reading) {
        // Display reading in UI
        const readingsEl = document.getElementById('generationReadings');
        if (!readingsEl) return;
        
        const readingEl = document.createElement('div');
        readingEl.className = 'reading';
        
        // Build sources details
        let sourceDetails = '';
        for (const [sourceType, data] of Object.entries(reading.sources)) {
            sourceDetails += `<div><strong>${sourceType}:</strong> ${data.kwhGenerated} kWh</div>`;
        }
        
        // Build weather details
        const weatherDetails = `
            <div>
                <strong>Weather:</strong> 
                Cloud Cover: ${Math.round(reading.weather.cloudCover * 100)}%, 
                Wind: ${reading.weather.windSpeed.toFixed(1)} mph, 
                Temp: ${reading.weather.temperature.toFixed(1)}°F
            </div>
        `;
        
        readingEl.innerHTML = `
            <strong>${reading.formattedTime}</strong> - 
            <span>Total Energy Generated: ${reading.totalKwh} kWh</span>
            <div class="reading-details">
                ${sourceDetails}
                ${weatherDetails}
            </div>
        `;
        
        readingsEl.insertBefore(readingEl, readingsEl.firstChild);
        
        // Limit displayed readings to 20
        while (readingsEl.children.length > 20) {
            readingsEl.removeChild(readingsEl.lastChild);
        }
        
        // Update dashboard if elements exist
        const currentGenEl = document.getElementById('currentGeneration');
        if (currentGenEl) {
            currentGenEl.textContent = `${reading.totalKwh} kWh`;
        }
    }
    
    generateAndSaveReading() {
        // Generate a new reading
        const reading = this.generateEnergyReading();
        
        if (reading) {
            // Save to Firebase
            this.saveReadingToFirebase(reading);
            
            // Display in UI
            this.displayReading(reading);
            
            // Advance the simulated time by the interval
            this.currentSimulatedTime = new Date(this.currentSimulatedTime.getTime() + (this.interval * 60 * 60 * 1000));
            
            return true;
        }
        
        return false;
    }
    
    start(interval, speedMultiplier) {
        if (this.isRunning) return;
        
        if (!this.connectedToFirebase) {
            alert("Cannot start generation simulation: Not connected to Firebase database.");
            return;
        }
        
        // Set parameters if provided
        if (interval) {
            this.interval = parseFloat(interval);
        }
        
        if (speedMultiplier) {
            this.speedMultiplier = parseFloat(speedMultiplier);
        }
        
        this.isRunning = true;
        
        // Generate initial reading
        this.generateAndSaveReading();
        
        // Set up interval for future readings (convert simulated hours to real seconds)
        const intervalMs = this.speedMultiplier * 1000;
        this.intervalId = setInterval(() => {
            this.generateAndSaveReading();
        }, intervalMs);
        
        // Update button text if it exists
        const startStopButton = document.getElementById('generatorStartStopButton');
        if (startStopButton) {
            startStopButton.textContent = 'Stop Generation Simulation';
            startStopButton.classList.add('stop');
        }
    }
    
    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.intervalId);
        this.isRunning = false;
        
        // Update button text if it exists
        const startStopButton = document.getElementById('generatorStartStopButton');
        if (startStopButton) {
            startStopButton.textContent = 'Start Generation Simulation';
            startStopButton.classList.remove('stop');
        }
    }
    
    // Get the aggregated data in the format specified
    getAggregatedData() {
        return {
            daily: [...this.generatedData.daily],
            weekly: [...this.generatedData.weekly],
            monthly: [...this.generatedData.monthly]
        };
    }
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing RenewableEnergySimulator');
    const generator = new RenewableEnergySimulator();
    
    // Set up start/stop button if it exists
    const startStopButton = document.getElementById('generatorStartStopButton');
    if (startStopButton) {
        startStopButton.addEventListener('click', () => {
            if (generator.isRunning) {
                generator.stop();
            } else {
                const interval = parseFloat(document.getElementById('generatorInterval').value);
                const speedMultiplier = parseFloat(document.getElementById('generatorSpeed').value);
                generator.start(interval, speedMultiplier);
            }
        });
    }
    
    // Make the generator available globally for debugging
    window.renewableGenerator = generator;
});

// Export the generator class for potential use in other modules
export default RenewableEnergySimulator;

// Export the totalEnergyDataGenerated object in the required format
export const getTotalEnergyDataGenerated = () => {
    if (window.renewableGenerator) {
        return window.renewableGenerator.getAggregatedData();
    }
    
    // Default data if the generator isn't initialized
    return {
        daily: [7, 8, 10, 12, 6],
        weekly: [40, 50, 45, 60, 55, 48, 52],
        monthly: [150, 170, 160, 180]
    };
};