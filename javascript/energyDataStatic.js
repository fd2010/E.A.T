// energyDataStatic.js - Contains all the static data that doesn't change

// Generation data
export let totalEnergyDataGenerated = {
    daily: [7, 8, 10, 12, 6],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [150, 170, 160, 180]
};

// Energy consumption data
export let totalEnergyData = {
    daily: [5, 8, 10, 12, 6],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [150, 170, 160, 180]
};

// Cost data
export let totalCostData = {
    daily: [2, 3, 5, 4, 6],
    weekly: [20, 25, 22, 30, 28, 24, 26],
    monthly: [90, 100, 95, 105]
};

// Area usage data
export let areaData = {
    "Meeting Room": 30,
    "Workstations": 40,
    "Common Areas": 25,
    "Special": 20
};

// Device usage data
export let deviceData = {
    "Lights": 50,
    "A/C": 20,
    "Speaker": 40,
    "Projector": 25,
    "Laptop": 10,
    "Printer": 22,
    "Coffee Machine": 18,
    "Monitor": 14,
    "Server": 18,
    "Electric Hoover": 18,
    "Electronic Desk": 12
};

// Room-specific energy data
export let energyData = {
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

// Room-specific cost data
export let costData = {
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

// Device by area data
export let devicesByArea = {
    "Meeting Room": [
        { name: "Projector", energy: 5, cost: 2.5 },
        { name: "Speakers", energy: 2, cost: 1.2 },
        { name: "Lights", energy: 8, cost: 4 }
    ],
    "Workstations": [
        { name: "Computers", energy: 15, cost: 8 },
        { name: "Monitors", energy: 10, cost: 5 },
        { name: "Printers", energy: 6, cost: 3 }
    ],
    "Common Areas": [
        { name: "Lights", energy: 12, cost: 6 },
        { name: "Air Conditioning", energy: 20, cost: 10 },
        { name: "Vending Machine", energy: 8, cost: 4 }
    ],
    "Special": [
        { name: "Heating", energy: 25, cost: 12 },
        { name: "Speakers", energy: 10, cost: 5 }
    ]
};