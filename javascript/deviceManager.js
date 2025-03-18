// Device Manager - Handles device power calculations and specifications

class DeviceManager {
    constructor() {
        // Device power specifications (same as in Python)
        this.deviceSpecs = {
            'Desktop Computer': { wattsRange: [80, 175] },
            'Laptop': { wattsRange: [20, 50] },
            'Printer': { wattsRange: [30, 350] },
            'Coffee Machine': { wattsRange: [200, 1200] },
            'Monitor': { wattsRange: [20, 40] },
            'Server': { wattsRange: [200, 500] },
            'A/C': { wattsRange: [500, 1500] },
            'Lights': { wattsRange: [10, 100] },
            'Projector': { wattsRange: [150, 300] },
            'Speaker': { wattsRange: [15, 80] },         
            'Electric Hoover': { wattsRange: [30, 70] },
            'Electronic Desk': { wattsRange: [50, 150] } 
        };
    }
    
    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    generateRandomVoltage() {
        return this.getRandomInRange(215, 225);
    }
    
    getDevicePower(device) {
        // If device is off, it consumes no power
        if (device.status !== 'On') {
            return 0;
        }
        
        // Get device type and specs
        const deviceType = device.type;
        let wattsRange = [10, 50]; // Default range if type is unknown
        
        if (this.deviceSpecs[deviceType]) {
            wattsRange = this.deviceSpecs[deviceType].wattsRange;
        }
        
        // Get current month for seasonal adjustments (same as Python)
        const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-11
        
        let deviceMin, deviceMax;
        const min = wattsRange[0];
        const max = wattsRange[1];
        const range = max - min;
        
        // Determine appropriate power range based on month
        if ([11, 12, 1, 2].includes(currentMonth)) {
            // Winter months - upper 25%
            deviceMin = min + 0.75 * range;
            deviceMax = max;
        } else if ([3, 4, 5].includes(currentMonth)) {
            // Spring months - lower 25%
            deviceMin = min;
            deviceMax = min + 0.25 * range;
        } else {
            // Summer/Fall months - middle 50%
            deviceMin = min + 0.25 * range;
            deviceMax = min + 0.75 * range;
        }
        
        // Generate random value within range
        return this.getRandomInRange(deviceMin, deviceMax);
    }
}

export default DeviceManager;