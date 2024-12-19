# E.A.T Frontend

## Overview
React-based frontend application for the Energy Analysis Tool project.

## Structure
```
frontend/
├── public/           # Static files
│   ├── images/
│   ├── icons/
│   └── index.html
├── src/
│   ├── components/  # Reusable components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── Modal/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   └── features/
│   │       ├── Dashboard/
│   │       ├── DeviceControl/
│   │       └── EnergyMonitor/
│   ├── pages/      # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   └── Dashboard/
│   ├── hooks/     # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useDevice.js
│   ├── context/  # React context
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── utils/   # Utility functions
│   │   ├── api.js
│   │   └── helpers.js
│   ├── styles/  # Styling files
│   │   ├── global.css
│   │   └── variables.css
│   ├── types/  # TypeScript types
│   └── App.js
├── tests/      # Frontend tests
├── .env
├── package.json
└── README.md
```

