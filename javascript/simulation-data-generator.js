// simulation-data-generator.js - UPDATED VERSION
// Responsible for creating realistic synthetic data for all charts

// Configuration constants
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const WEEKS_IN_MONTH = 4;
const MONTHS_IN_YEAR = 12;

// Energy consumption patterns by hour of day (0-23)
const HOURLY_PATTERNS = {
  weekday: [0.2, 0.15, 0.1, 0.1, 0.15, 0.3, 0.5, 0.8, 1.0, 0.9, 0.85, 0.9, 0.95, 0.9, 0.85, 0.8, 0.85, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
  weekend: [0.2, 0.15, 0.1, 0.1, 0.1, 0.15, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 0.85, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
};

// Weekly pattern (0 = Sunday, 6 = Saturday)
const WEEKLY_PATTERN = [0.5, 0.9, 1.0, 0.95, 0.9, 0.85, 0.6];

// Monthly pattern (seasonal effects)
const MONTHLY_PATTERN = [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 0.95, 1.0, 1.1, 1.2];

// Area distribution (percentage of total consumption)
const AREA_DISTRIBUTION = {
  "Meeting Room": 30,
  "Workstations": 40, 
  "Common Areas": 25,
  "Special": 5
};

// Device distribution (percentage within each area)
const DEVICE_DISTRIBUTION = {
  "Lights": 15,
  "A/C": 25,
  "Computers": 20,
  "Server": 12,
  "Projector": 8,
  "Coffee Machine": 5,
  "Monitors": 10,
  "Printer": 5
};

// Base consumption values (kWh)
const BASE_CONSUMPTION = {
  daily: 120,   // kWh per day
  weekly: 800,  // kWh per week
  monthly: 3500, // kWh per month
  yearly: 42000  // kWh per year
};

// Cost per kWh
const COST_PER_KWH = 0.28; // £0.28 per kWh

class EnergyDataGenerator {
  constructor() {
    this.randomSeed = Date.now(); // For reproducible randomness if needed
    this.data = this.generateAllData();
    console.log('EnergyDataGenerator initialized with data:', this.data);
  }
  
  // Seeded random function for consistent patterns
  random() {
    this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
    return this.randomSeed / 233280;
  }
  
  // Add realistic variation to a value
  addVariation(baseValue, variationPercent = 10) {
    const variation = (this.random() * 2 - 1) * (baseValue * variationPercent / 100);
    return baseValue + variation;
  }
  
  // Generate complete dataset for all time periods
  generateAllData() {
    console.log('Generating all simulation data');
    
    const dailyData = this.generateDailyData();
    const weeklyData = this.generateWeeklyData();
    const monthlyData = this.generateMonthlyData();
    const yearlyData = this.generateYearlyData();
    
    return {
      energy: {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData
      },
      cost: {
        daily: dailyData.map(kWh => kWh * COST_PER_KWH),
        weekly: weeklyData.map(kWh => kWh * COST_PER_KWH),
        monthly: monthlyData.map(kWh => kWh * COST_PER_KWH),
        yearly: yearlyData.map(kWh => kWh * COST_PER_KWH)
      },
      areaUsage: this.generateAreaData(),
      deviceUsage: this.generateDeviceData()
    };
  }
  
  // Generate daily consumption pattern (24 hour equivalent mapped to 5 data points)
  generateDailyData() {
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
    
    // For daily view in pUsage, we need exactly 5 data points
    const dataPoints = [
      (pattern.slice(0, 6).reduce((sum, val) => sum + val, 0) / 6) * BASE_CONSUMPTION.daily / 5,
      (pattern.slice(6, 12).reduce((sum, val) => sum + val, 0) / 6) * BASE_CONSUMPTION.daily / 5,
      (pattern.slice(12, 18).reduce((sum, val) => sum + val, 0) / 6) * BASE_CONSUMPTION.daily / 5,
      (pattern.slice(18, 24).reduce((sum, val) => sum + val, 0) / 6) * BASE_CONSUMPTION.daily / 5,
      (pattern.reduce((sum, val) => sum + val, 0) / 24) * BASE_CONSUMPTION.daily / 5
    ];
    
    // Add variation to each point
    return dataPoints.map(point => this.addVariation(point));
  }
  
  // Generate weekly data
  generateWeeklyData() {
    // For weekly view in pUsage, we need exactly 7 data points (days of week)
    return WEEKLY_PATTERN.map(factor => 
      this.addVariation(BASE_CONSUMPTION.daily * factor)
    );
  }
  
  // Generate monthly data
  generateMonthlyData() {
    // For monthly view in pUsage, we need exactly 4 data points (weeks)
    const currentMonth = new Date().getMonth();
    
    const result = [];
    for (let i = 0; i < 4; i++) {
      const monthIndex = (currentMonth + i - 1 + 12) % 12; // Ensure positive index
      const factor = MONTHLY_PATTERN[monthIndex];
      result.push(this.addVariation(BASE_CONSUMPTION.weekly * factor));
    }
    
    return result;
  }
  
  // Generate yearly data
  generateYearlyData() {
    // For yearly view, we return 12 months of data
    return MONTHLY_PATTERN.map(factor => 
      this.addVariation(BASE_CONSUMPTION.monthly * factor)
    );
  }
  
  // Generate area distribution data
  generateAreaData() {
    const totalEnergy = BASE_CONSUMPTION.daily;
    const result = {};
    
    Object.entries(AREA_DISTRIBUTION).forEach(([area, percentage]) => {
      result[area] = this.addVariation(totalEnergy * percentage / 100);
    });
    
    return result;
  }
  
  // Generate device type distribution
  generateDeviceData() {
    const totalEnergy = BASE_CONSUMPTION.daily;
    const result = {};
    
    Object.entries(DEVICE_DISTRIBUTION).forEach(([device, percentage]) => {
      result[device] = this.addVariation(totalEnergy * percentage / 100);
    });
    
    return result;
  }
  
  // Refresh data (call periodically to update)
  refreshData() {
    console.log('Refreshing simulation data');
    this.data = this.generateAllData();
    return this.data;
  }
  
  // Get the current data
  getData() {
    return this.data;
  }
}

// Export the generator
export const energyDataGenerator = new EnergyDataGenerator();