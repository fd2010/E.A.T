//firebase-config.js

// All below code copied from firebase console
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
// import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics"; // optional


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
// const firebaseConfig = {
//     apiKey: "AIzaSyAOw5Zc-E3Gq74lGYAVHcpkgNnNrumrdu0",
//     authDomain: "energy-analysis-tool.firebaseapp.com",
//     databaseURL: "https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "energy-analysis-tool",
//     storageBucket: "energy-analysis-tool.firebasestorage.app",
//     messagingSenderId: "333108098273",
//     appId: "1:333108098273:web:ddabe077f6be647ad1b3a0",
//     measurementId: "G-CP2WDCMRM9"
//   };

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID // optional
  };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);
// const database = getDatabase(app);

// // Enable persistence for better offline support
// try {
//     database.enablePersistence()
//         .catch((err) => {
//             if (err.code === 'failed-precondition') {
//                 console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
//             } else if (err.code === 'unimplemented') {
//                 console.log('The current browser does not support persistence.');
//             }
//         });
// } catch (error) {
//     console.error('Error enabling persistence:', error);
// }

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app); // optional

// Enable persistence (with improved error handling)
try {
    getDatabase(app).enablePersistence()
        .catch(err => {
            if (err.code === 'failed-precondition') {
                console.error('Persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.error('Persistence failed: Browser does not support persistence.');
            } else {
                console.error('Persistence failed:', err);
            }
        });
} catch (error) {
  console.error('Error enabling persistence:', error);
}



export { app, auth, database, analytics };