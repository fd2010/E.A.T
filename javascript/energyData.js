export const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

export const totalEnergyData = {
    daily: [5, 8, 10, 12, 6],
    weekly: [40, 50, 45, 60, 55, 48, 52],
    monthly: [150, 170, 160, 180]
};

export const totalCostData = {
    daily: [2, 3, 5, 4, 6],
    weekly: [20, 25, 22, 30, 28, 24, 26],
    monthly: [90, 100, 95, 105]
};



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

export const areaData = {
    "Meeting Room": 30,
    "Workstations": 40,
    "Common Areas": 25,
    "Special": 20
};

export const deviceData = {
    "Computers": 50,
    "Lights": 20,
    "Heating": 40,
  //  "Monitors": 25,
   // "Speakers": 10,
  //  "A/C": 22,
  //  "Projector": 18,
  //  "Vending Machine": 12
};

export const devicesByArea = {
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

export const deviceEnergyData = {
    "Computers": {
        daily: [2, 4, 6, 5, 3],
        weekly: [20, 25, 30, 28, 26, 22, 24],
        monthly: [100, 120, 110, 130]
    },
    "Lights": {
        daily: [1, 2, 3, 3, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Heating": {
        daily: [5, 7, 10, 9, 6],
        weekly: [40, 50, 48, 55, 52, 46, 49],
        monthly: [200, 220, 210, 230]
    },
    "Monitors": {
        daily: [1, 3, 4, 3, 2],
        weekly: [15, 18, 20, 19, 17, 16, 18],
        monthly: [70, 80, 75, 85]
    },
    "Speakers": {
        daily: [0.5, 1, 1.5, 1, 0.7],
        weekly: [5, 6, 7, 6.5, 6, 5.5, 5.8],
        monthly: [25, 30, 28, 32]
    },
    "Vending Machine": {
        daily: [2, 3, 4, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    }
};

export const deviceCostData = {
    "Computers": {
        daily: [5, 8, 12, 10, 6],
        weekly: [40, 50, 60, 55, 52, 48, 50],
        monthly: [200, 240, 220, 260]
    },
    "Lights": {
        daily: [1, 2, 3, 2.5, 2],
        weekly: [10, 12, 15, 14, 13, 11, 12],
        monthly: [50, 55, 52, 58]
    },
    "Heating": {
        daily: [8, 12, 15, 13, 10],
        weekly: [70, 80, 85, 82, 78, 74, 75],
        monthly: [300, 320, 310, 330]
    },
    "Monitors": {
        daily: [2, 4, 5, 4, 3],
        weekly: [20, 25, 28, 26, 24, 22, 23],
        monthly: [90, 100, 95, 105]
    },
    "Speakers": {
        daily: [0.8, 1.2, 1.5, 1.4, 1],
        weekly: [8, 10, 12, 11, 9.5, 8.5, 9],
        monthly: [40, 50, 45, 55]
    },
    "Vending Machine": {
        daily: [3, 4, 5, 5, 4],
        weekly: [30, 35, 40, 38, 36, 33, 31],
        monthly: [120, 140, 130, 150]
    }
};
