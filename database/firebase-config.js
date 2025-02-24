// firebase-config.js
// Common Firebase configuration file

// Debug helper
console.log('Loading firebase-config.js');

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAOw5Zc-E3Gq74lGYAVHcpkgNnNrumrdu0",
    authDomain: "energy-analysis-tool.firebaseapp.com",
    databaseURL: "https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "energy-analysis-tool",
    storageBucket: "energy-analysis-tool.firebasestorage.app",
    messagingSenderId: "333108098273",
    appId: "1:333108098273:web:ddabe077f6be647ad1b3a0",
    measurementId: "G-CP2WDCMRM9"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
  
export { app, auth, database };