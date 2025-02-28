// database-service.js
import { auth, database } from '../database/firebase-config.js';
import { 
    ref, 
    get, 
    update, 
    onValue, 
    set, 
    push,
    remove 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { 
    OFFICES_PATH, 
    USERS_PATH,
    OFFICE_ID,
    ROOMS,
    DEVICE_NAME,
    DEVICE_TYPE,
    DEVICE_STATUS,
    STATUS_ON,
    STATUS_OFF,
    USER_PREF_NAME,
    USER_ROLE
} from './office-constants.js';

// Cached data to minimize database reads
let cachedUserData = null;
let cachedOfficeData = null;
let cachedRoomsData = null;
let activeListeners = {};

// User data management
export async function getCurrentUser() {
    if (cachedUserData) return cachedUserData;
    
    // Try to get from localStorage first
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
        cachedUserData = JSON.parse(storedUserData);
        return cachedUserData;
    }
    
    // If no cached data, get from Firebase
    if (!auth.currentUser) {
        throw new Error('No authenticated user');
    }
    
    const userRef = ref(database, `${USERS_PATH}/${auth.currentUser.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        cachedUserData = snapshot.val();
        localStorage.setItem('userData', JSON.stringify(cachedUserData));
        return cachedUserData;
    } else {
        throw new Error('User data not found in database');
    }
}

export async function updateUserProfile(userData) {
    if (!auth.currentUser) {
        throw new Error('No authenticated user');
    }
    
    const updates = {};
    updates[`${USERS_PATH}/${auth.currentUser.uid}`] = {
        ...cachedUserData,
        ...userData
    };
    
    await update(ref(database), updates);
    
    // Update cache
    cachedUserData = {
        ...cachedUserData,
        ...userData
    };
    
    localStorage.setItem('userData', JSON.stringify(cachedUserData));
    return cachedUserData;
}

// Office data management
export async function getOfficeData() {
    if (cachedOfficeData) return cachedOfficeData;
    
    const userData = await getCurrentUser();
    const officeRef = ref(database, `${OFFICES_PATH}/${userData.officeID}`);
    const snapshot = await get(officeRef);
    
    if (snapshot.exists()) {
        cachedOfficeData = snapshot.val();
        return cachedOfficeData;
    } else {
        throw new Error('Office data not found');
    }
}

// Room management
export async function getRooms() {
    if (cachedRoomsData) return cachedRoomsData;
    
    const officeData = await getOfficeData();
    cachedRoomsData = officeData.rooms || {};
    return cachedRoomsData;
}

export async function addRoom(roomName) {
    const userData = await getCurrentUser();
    const roomPath = `${OFFICES_PATH}/${userData.officeID}/${ROOMS}/${roomName}`;
    
    await set(ref(database, roomPath), []);
    
    // Update cache
    if (cachedRoomsData) {
        cachedRoomsData[roomName] = [];
    }
    
    return true;
}

// Device management
export async function addDevice(roomName, deviceData) {
    const userData = await getCurrentUser();
    const roomPath = `${OFFICES_PATH}/${userData.officeID}/${ROOMS}/${roomName}`;
    
    // Set default status if not provided
    if (!deviceData[DEVICE_STATUS]) {
        deviceData[DEVICE_STATUS] = STATUS_OFF;
    }
    
    // Add device to array or object based on current structure
    const roomRef = ref(database, roomPath);
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
        const roomData = snapshot.val();
        
        if (Array.isArray(roomData)) {
            // Add to array
            const newIndex = roomData.length;
            await set(ref(database, `${roomPath}/${newIndex}`), deviceData);
            
            // Update cache if it exists
            if (cachedRoomsData && cachedRoomsData[roomName]) {
                cachedRoomsData[roomName][newIndex] = deviceData;
            }
            
            return newIndex;
        } else {
            // Add to object
            const newRef = push(ref(database, roomPath));
            await set(newRef, deviceData);
            
            // Update cache if it exists
            if (cachedRoomsData && cachedRoomsData[roomName]) {
                const key = newRef.key;
                cachedRoomsData[roomName][key] = deviceData;
                return key;
            }
            
            return newRef.key;
        }
    } else {
        // Create new room with array
        await set(ref(database, roomPath), [deviceData]);
        
        // Update cache if it exists
        if (cachedRoomsData) {
            cachedRoomsData[roomName] = [deviceData];
        }
        
        return 0; // First index
    }
}

export async function toggleDevice(roomName, deviceKey, isOn) {
    const userData = await getCurrentUser();
    const devicePath = `${OFFICES_PATH}/${userData.officeID}/${ROOMS}/${roomName}/${deviceKey}/${DEVICE_STATUS}`;
    
    const status = isOn ? STATUS_ON : STATUS_OFF;
    await set(ref(database, devicePath), status);
    
    // Update cache if it exists
    if (cachedRoomsData && cachedRoomsData[roomName]) {
        if (Array.isArray(cachedRoomsData[roomName])) {
            if (cachedRoomsData[roomName][deviceKey]) {
                cachedRoomsData[roomName][deviceKey][DEVICE_STATUS] = status;
            }
        } else {
            if (cachedRoomsData[roomName][deviceKey]) {
                cachedRoomsData[roomName][deviceKey][DEVICE_STATUS] = status;
            }
        }
    }
    
    return status;
}

export async function deleteDevice(roomName, deviceKey) {
    const userData = await getCurrentUser();
    const devicePath = `${OFFICES_PATH}/${userData.officeID}/${ROOMS}/${roomName}/${deviceKey}`;
    
    await remove(ref(database, devicePath));
    
    // Update cache if it exists
    if (cachedRoomsData && cachedRoomsData[roomName]) {
        if (Array.isArray(cachedRoomsData[roomName])) {
            // If array, we can't truly remove without reindexing, so set to null
            cachedRoomsData[roomName][deviceKey] = null;
        } else {
            // If object, delete the property
            delete cachedRoomsData[roomName][deviceKey];
        }
    }
    
    return true;
}

// Real-time updates
export function subscribeToRooms(callback) {
    const listenerKey = 'rooms';
    
    // Remove existing listener if any
    if (activeListeners[listenerKey]) {
        activeListeners[listenerKey]();
        delete activeListeners[listenerKey];
    }
    
    const setupListener = async () => {
        const userData = await getCurrentUser();
        const roomsRef = ref(database, `${OFFICES_PATH}/${userData.officeID}/${ROOMS}`);
        
        const unsubscribe = onValue(roomsRef, (snapshot) => {
            const rooms = snapshot.val() || {};
            cachedRoomsData = rooms;
            callback(rooms);
        });
        
        activeListeners[listenerKey] = unsubscribe;
    };
    
    setupListener();
    
    // Return function to unsubscribe
    return () => {
        if (activeListeners[listenerKey]) {
            activeListeners[listenerKey]();
            delete activeListeners[listenerKey];
        }
    };
}

export function subscribeToDevices(roomName, callback) {
    const listenerKey = `devices_${roomName}`;
    
    // Remove existing listener if any
    if (activeListeners[listenerKey]) {
        activeListeners[listenerKey]();
        delete activeListeners[listenerKey];
    }
    
    const setupListener = async () => {
        const userData = await getCurrentUser();
        const devicesRef = ref(database, `${OFFICES_PATH}/${userData.officeID}/${ROOMS}/${roomName}`);
        
        const unsubscribe = onValue(devicesRef, (snapshot) => {
            const devices = snapshot.val() || {};
            if (cachedRoomsData) {
                cachedRoomsData[roomName] = devices;
            }
            callback(devices, roomName);
        });
        
        activeListeners[listenerKey] = unsubscribe;
    };
    
    setupListener();
    
    // Return function to unsubscribe
    return () => {
        if (activeListeners[listenerKey]) {
            activeListeners[listenerKey]();
            delete activeListeners[listenerKey];
        }
    };
}

// UI helper functions
export function updateUserDisplay(element, userData = null) {
    const updateUI = (data) => {
        if (element.id === 'prefName' || element.id === 'userPrefName') {
            element.textContent = data[USER_PREF_NAME] || 'User';
        } else if (element.id === 'userRole' || element.id === 'role') {
            element.textContent = data[USER_ROLE] || 'User';
        } else {
            // If element is not a specific field, update all user display elements
            const prefNameElem = document.getElementById('prefName');
            const roleElem = document.getElementById('userRole');
            
            if (prefNameElem) prefNameElem.textContent = data[USER_PREF_NAME] || 'User';
            if (roleElem) roleElem.textContent = data[USER_ROLE] || 'User';
        }
    };
    
    if (userData) {
        updateUI(userData);
    } else {
        getCurrentUser().then(updateUI);
    }
}

// Clear cache on logout
export function clearCache() {
    cachedUserData = null;
    cachedOfficeData = null;
    cachedRoomsData = null;
    
    // Unsubscribe from all listeners
    Object.values(activeListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    });
    
    activeListeners = {};
    
    localStorage.removeItem('userData');
}