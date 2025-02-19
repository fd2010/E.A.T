export const timeLabels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
};

export const energyData = {
    daily: [2, 3, 5, 4, 5],
    weekly: [30, 40, 35, 50, 45, 38, 42],
    monthly: [200, 220, 210, 230]
};

export const costData = {
    daily: [10, 15, 20, 18, 22],
    weekly: [100, 120, 110, 140, 130, 125, 135],
    monthly: [400, 450, 420, 460]
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
    "Heating": 15,
    "Monitors": 25,
    "Speakers": 10,
    "Vending Machine": 10
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
