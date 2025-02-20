// All below code copied from firebase console
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyAOw5Zc-E3Gq74lGYAVHcpkgNnNrumrdu0",
//     authDomain: "energy-analysis-tool.firebaseapp.com",
//     databaseURL: "https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "energy-analysis-tool",
//     storageBucket: "energy-analysis-tool.appspot.com",
//     messagingSenderId: "333108098273",
//     appId: "1:333108098273:web:ddabe077f6be647ad1b3a0",
//     measurementId: "G-CP2WDCMRM9"
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Enable persistence for better offline support
try {
    database.enablePersistence()
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.log('The current browser does not support persistence.');
            }
        });
} catch (error) {
    console.error('Error enabling persistence:', error);
}

export { app, auth, database, analytics };