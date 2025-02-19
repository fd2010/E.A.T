export const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

// **Total Energy and Cost Data**
export const totalEnergyData = {
    daily: [10, 15, 20, 25, 12],
    weekly: [80, 100, 90, 120, 110, 96, 104],
    monthly: [320, 340, 330, 360]
};

export const totalCostData = {
    daily: [5, 10, 12, 15, 8],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [160, 180, 170, 200]
};

// **Energy Data Per Area**
export const energyData = {
    "Meeting Room": {
        daily: [5, 8, 10, 12, 6],
        weekly: [40, 50, 45, 60, 55, 48, 52],
        monthly: [150, 170, 160, 180]
    },
    "Common Areas": {
        daily: [3, 5, 7, 6, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [100, 120, 130, 110]
    },
    "Workstations": {
        daily: [6, 9, 11, 14, 7],
        weekly: [45, 55, 50, 65, 60, 52, 57],
        monthly: [180, 200, 190, 210]
    },
    "Special": {
        daily: [7, 10, 12, 15, 8],
        weekly: [50, 60, 55, 70, 65, 58, 62],
        monthly: [200, 220, 210, 230]
    }
};

// **Cost Data Per Area**
export const costData = {
    "Meeting Room": {
        daily: [10, 16, 20, 24, 12],
        weekly: [80, 100, 90, 120, 110, 96, 104],
        monthly: [300, 340, 320, 360]
    },
    "Common Areas": {
        daily: [6, 10, 14, 12, 8],
        weekly: [60, 70, 80, 76, 72, 66, 62],
        monthly: [200, 240, 260, 220]
    },
    "Workstations": {
        daily: [12, 18, 22, 28, 14],
        weekly: [90, 110, 100, 130, 120, 104, 114],
        monthly: [360, 400, 380, 420]
    },
    "Special": {
        daily: [14, 20, 24, 30, 16],
        weekly: [100, 120, 110, 140, 130, 116, 124],
        monthly: [400, 440, 420, 460]
    }
};

// **Area-Wise Energy Usage**
export const areaData = {
    "Meeting Room": 30,
    "Workstations": 40,
    "Common Areas": 25,
    "Special": 20
};

// **Device Energy Usage**
export const deviceData = {
    "Computers": 50,
    "Monitors": 25,
    "Printers": 15,
    "Wi-Fi Router": 10,
    "Speakers": 10,
    "Projector": 12,
    "Lights": 20,
    "Heating": 15,
    "Air Conditioning": 30,
    "Vending Machine": 10,
    "Coffee Machine": 8
};

// **Devices in Each Area**
export const devicesByArea = {
    "Meeting Room": [
        { name: "Projector", energy: 5, cost: 2.5 },
        { name: "Speakers", energy: 2, cost: 1.2 },
        { name: "Lights", energy: 8, cost: 4 },
        { name: "Wi-Fi Router", energy: 2, cost: 1 },
        { name: "Conference Phone", energy: 3, cost: 1.5 }
    ],
    "Workstations": [
        { name: "Computers", energy: 15, cost: 8 },
        { name: "Monitors", energy: 10, cost: 5 },
        { name: "Printers", energy: 6, cost: 3 },
        { name: "Wi-Fi Router", energy: 4, cost: 2 },
        { name: "Desk Lamps", energy: 3, cost: 1.5 },
        { name: "Docking Stations", energy: 5, cost: 2.5 }
    ],
    "Common Areas": [
        { name: "Lights", energy: 12, cost: 6 },
        { name: "Air Conditioning", energy: 20, cost: 10 },
        { name: "Vending Machine", energy: 8, cost: 4 },
        { name: "Coffee Machine", energy: 5, cost: 3 },
        { name: "Water Dispenser", energy: 4, cost: 2 },
        { name: "Microwave", energy: 6, cost: 3 }
    ],
    "Special": [
        { name: "Heating", energy: 25, cost: 12 },
        { name: "Speakers", energy: 10, cost: 5 },
        { name: "Server Rack", energy: 40, cost: 20 },
        { name: "Security System", energy: 8, cost: 4 }
    ]
};


export const deviceEnergyData = {
    "Computers": {
        daily: [3, 6, 8, 9, 5],
        weekly: [30, 35, 40, 38, 36, 32, 34],
        monthly: [120, 140, 130, 150]
    },
    "Monitors": {
        daily: [2, 4, 5, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    },
    "Printers": {
        daily: [1, 2, 3, 3, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Wi-Fi Router": {
        daily: [1, 2, 3, 2.5, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Speakers": {
        daily: [0.5, 1, 1.5, 1, 0.7],
        weekly: [5, 6, 7, 6.5, 6, 5.5, 5.8],
        monthly: [25, 30, 28, 32]
    },
    "Projector": {
        daily: [2, 3, 4, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    },
    "Lights": {
        daily: [3, 5, 6, 6, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [100, 120, 130, 110]
    },
    "Heating": {
        daily: [5, 7, 10, 9, 6],
        weekly: [40, 50, 48, 55, 52, 46, 49],
        monthly: [200, 220, 210, 230]
    },
    "Air Conditioning": {
        daily: [8, 12, 15, 14, 10],
        weekly: [70, 80, 85, 82, 78, 74, 75],
        monthly: [300, 320, 310, 330]
    },
    "Vending Machine": {
        daily: [2, 3, 4, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    },
    "Coffee Machine": {
        daily: [2, 3, 5, 4, 3],
        weekly: [20, 25, 30, 28, 26, 22, 24],
        monthly: [100, 120, 110, 130]
    }
};

// **Device-Specific Cost Data**
export const deviceCostData = {
    "Computers": {
        daily: [6, 10, 12, 14, 8],
        weekly: [50, 60, 70, 65, 60, 55, 58],
        monthly: [200, 220, 210, 230]
    },
    "Monitors": {
        daily: [3, 5, 7, 6, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [100, 120, 130, 110]
    },
    "Printers": {
        daily: [1, 2, 3, 3, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Wi-Fi Router": {
        daily: [0.5, 1, 1.5, 1.2, 1],
        weekly: [5, 6, 7, 6.5, 6, 5.5, 5.8],
        monthly: [25, 30, 28, 32]
    },
    "Speakers": {
        daily: [0.8, 1.2, 1.5, 1.4, 1],
        weekly: [8, 10, 12, 11, 9.5, 8.5, 9],
        monthly: [40, 50, 45, 55]
    },
    "Projector": {
        daily: [3, 5, 6, 6, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [100, 120, 130, 110]
    },
    "Lights": {
        daily: [2, 4, 5, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    },
    "Heating": {
        daily: [8, 12, 15, 13, 10],
        weekly: [70, 80, 85, 82, 78, 74, 75],
        monthly: [300, 320, 310, 330]
    },
    "Air Conditioning": {
        daily: [10, 14, 18, 16, 12],
        weekly: [90, 100, 110, 105, 98, 94, 96],
        monthly: [360, 400, 380, 420]
    },
    "Vending Machine": {
        daily: [3, 4, 5, 5, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [120, 140, 130, 150]
    },
    "Coffee Machine": {
        daily: [2, 4, 5, 5, 4],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    }
};
