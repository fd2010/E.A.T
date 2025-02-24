// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "energy-analysis-tool.firebaseapp.com",
    databaseURL: "https://energy-analysis-tool-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "energy-analysis-tool",
    storageBucket: "energy-analysis-tool.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// Enable persistence
try {
    database.enablePersistence()
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.error('Multiple tabs open. Persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.error('Browser does not support persistence.');
            }
        });
} catch (error) {
    console.error('Error enabling persistence:', error);
}

export { app, auth, database, analytics };