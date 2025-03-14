// Import Firebase modules
import { database } from '../database/firebase-config.js';
import { ref, update, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
  
  // Thermostat functionality
  const dialElement = document.getElementById('thermostat-dial');
  const handleElement = document.getElementById('dial-handle');
  const tempDisplay = document.getElementById('temp-display');
  const powerToggle = document.getElementById('power-toggle');
  
  // Weather functionality
  const currentTemperatureElement = document.getElementById('current-temprature');
  const weatherDescElement = document.querySelector('.weather-desc');

  // Function to update temperature in Firebase
  async function updateTemperatureInFirebase(temp) {
    try {
      // Get the office ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.officeID) {
        console.error('User data or office ID not found');
        return;
      }
      
      const officeID = userData.officeID;
      const updates = {};
      
      // Update the temperature in Firebase
      updates[`offices/${officeID}/temperature`] = temp;
      
      await update(ref(database), updates);
      console.log('Temperature updated in Firebase:', temp);
    } catch (error) {
      console.error('Error updating temperature in Firebase:', error);
    }
  }

  // Function to get temperature from Firebase
  async function getTemperatureFromFirebase() {
    try {
      // Get the office ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.officeID) {
        console.error('User data or office ID not found');
        return null;
      }
      
      const officeID = userData.officeID;
      const dbRef = ref(database);
      
      // Get the temperature from Firebase
      const snapshot = await get(child(dbRef, `offices/${officeID}/temperature`));
      
      if (snapshot.exists()) {
        const temp = snapshot.val();
        console.log('Retrieved temperature from Firebase:', temp);
        return temp;
      } else {
        console.log('No temperature data available in Firebase');
        return null;
      }
    } catch (error) {
      console.error('Error getting temperature from Firebase:', error);
      return null;
    }
  }

  //RIGHT NOW THIS IS RANDOM AS WE NEED TO SIGN UP FOR A API KEY TO IMPLEMENT THIS
  // Add weather update functionality
  function updateWeather() {
    const randomTemp = Math.floor(Math.random() * 20) + 5;
    
    const weatherConditions = [
      'Clear sky',
      'Few clouds',
      'Scattered clouds',
      'Overcast',
      'Light rain',
      'Moderate rain',
      'Heavy rain',
      'Foggy',
      'Light snow',
      'Snow'
    ];
    
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    // Update the temperature display
    if (currentTemperatureElement) {
      currentTemperatureElement.textContent = `+${randomTemp}°C Outdoor Temperature`;
    }
    
    // Update the weather description
    if (weatherDescElement) {
      weatherDescElement.textContent = randomCondition;
    }
  }
  
  // Call the weather update function when the page loads
  updateWeather();

  // Function to update status icon color based on temperature
  function updateStatusIconColor(temp) {
    const statusIcon = document.querySelector('.status-icon');
    if (!statusIcon) return;
    
    // If thermostat is off, set a neutral gray color
    if (temp === "OFF" || temp === 0) {
      statusIcon.style.backgroundColor = '#999999';
      return;
    }
    
    // Parse the temperature as a number
    const temperature = parseInt(temp, 10);
    
    // Define temperature range and corresponding colors
    const minTemp = 10; // Coldest (blue)
    const maxTemp = 30; // Hottest (red)
    
    // Calculate how far along the range the current temperature is (0 to 1)
    const normalizedTemp = Math.max(0, Math.min(1, (temperature - minTemp) / (maxTemp - minTemp)));
    
    // Calculate RGB values for a gradient from blue to red
    // Blue (0, 120, 255) to Red (231, 76, 60)
    const r = Math.round(0 + normalizedTemp * (231 - 0));
    const g = Math.round(120 - normalizedTemp * (120 - 76));
    const b = Math.round(255 - normalizedTemp * (255 - 60));
    
    // Set the background color
    statusIcon.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }

  // Thermostat controls:
  
  // Check if thermostat elements exist
  if (!dialElement || !handleElement || !tempDisplay || !powerToggle) {
    console.error('Thermostat elements not found');
    return;
  }

  // Clear any existing markers that might be causing issues
  const existingMarkers = dialElement.querySelectorAll('.dial-marker, .temperature-label');
  existingMarkers.forEach(marker => marker.remove());
  
  // Get the actual dimensions of the dial for proper scaling
  const dialRect = dialElement.getBoundingClientRect();
  const dialRadius = dialRect.width / 2;
  const centerX = dialRadius;
  const centerY = dialRadius;
  
  // Create temperature markers - fewer markers for cleaner look
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) - 90; // -90 degrees offset to start at top
    const marker = document.createElement('div');
    marker.className = 'dial-marker';
    
    // Convert angle to radians
    const rad = angle * (Math.PI / 180);
    
    // Calculate the absolute position for the marker instead of using rotation
    const markerOuterRadius = dialRadius - 5; // Position slightly inside the dial edge
    const markerX = centerX + markerOuterRadius * Math.cos(rad);
    const markerY = centerY + markerOuterRadius * Math.sin(rad);
    
    // Set absolute position
    marker.style.position = 'absolute';
    marker.style.width = '3px';
    marker.style.height = '10px';
    marker.style.backgroundColor = '#999';
    marker.style.transformOrigin = 'center center';
    marker.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
    marker.style.left = `${markerX}px`;
    marker.style.top = `${markerY}px`;
    
    dialElement.appendChild(marker);
    
    // Add temperature labels at quarters (10, 20, 30)
    if (i % 3 === 0) {
      const label = document.createElement('div');
      label.className = 'temperature-label';
      
      // Temperature values (10, 20, 30, 40)
      const temp = 10 + (i / 3) * 5;
      label.textContent = `${temp}°`;
      
      // Position label outside the markers
      const labelRadius = dialRadius - 20; // Position labels a bit further in
      const labelX = centerX + labelRadius * Math.cos(rad);
      const labelY = centerY + labelRadius * Math.sin(rad);
      
      label.style.position = 'absolute';
      label.style.left = `${labelX}px`;
      label.style.top = `${labelY}px`;
      label.style.transform = 'translate(-50%, -50%)';
      
      dialElement.appendChild(label);
    }
  }
  
  let currentAngle = 0;
  let isDragging = false;
  
  // Create initial pointer - we'll create two elements for this effect
  // First, create an invisible spacer that extends from center
  const pointerSpacer = document.createElement('div');
  pointerSpacer.className = 'temperature-pointer-spacer';
  
  // Style the spacer to be invisible but take up space
  pointerSpacer.style.position = 'absolute';
  pointerSpacer.style.width = '4px';
  pointerSpacer.style.height = `${dialRadius - 15}px`; // Length to reach near edge
  pointerSpacer.style.backgroundColor = 'transparent'; // Invisible
  pointerSpacer.style.transformOrigin = 'bottom center';
  pointerSpacer.style.bottom = '50%';
  pointerSpacer.style.left = '50%';
  pointerSpacer.style.marginLeft = '-2px';
  pointerSpacer.style.zIndex = '10';
  
  // Create the visible pointer tip that will appear at the end of the spacer
  const pointerTip = document.createElement('div');
  pointerTip.className = 'temperature-pointer-tip';
  
  // Style the tip to be visible
  pointerTip.style.position = 'absolute';
  pointerTip.style.width = '4px';
  pointerTip.style.height = '40px'; // Visible part length
  pointerTip.style.backgroundColor = '#e74c3c'; // Red pointer
  pointerTip.style.borderRadius = '2px';
  pointerTip.style.top = '0';
  pointerTip.style.left = '0';
  pointerTip.style.zIndex = '11';
  pointerTip.style.boxShadow = '0 0 3px rgba(0,0,0,0.3)';
  
  // Append the tip to the spacer, then both to the dial
  pointerSpacer.appendChild(pointerTip);
  dialElement.appendChild(pointerSpacer);
  
  // Function to convert temperature to angle
  function temperatureToAngle(temp) {
    // Calculate angle based on temperature (inverted formula from updateTemperatureFromAngle)
    // Angle = (Temperature - 10) / 20 * 360
    return ((temp - 10) / 20) * 360;
  }
  
  // Initialize the thermostat based on stored temperature
  async function initializeThermostat() {
    // First try to get temperature from Firebase
    let initialTemp = await getTemperatureFromFirebase();
    
    // If we couldn't get a temperature from Firebase, use the display value
    if (initialTemp === null) {
      initialTemp = parseInt(tempDisplay.textContent, 10);
    }
    
    // If temp is 0, the thermostat is off
    if (initialTemp === 0) {
      powerToggle.checked = false;
      tempDisplay.textContent = "OFF";
      dialElement.style.opacity = 0.5;
      pointerTip.style.opacity = 0;
      // Set neutral color for status icon when off
      updateStatusIconColor("OFF");
    } else {
      // Ensure valid temperature (10-30)
      initialTemp = Math.max(10, Math.min(30, initialTemp));
      
      // Calculate the angle based on the temperature
      currentAngle = temperatureToAngle(initialTemp);
      
      // Update the thermostat display
      tempDisplay.textContent = initialTemp;
      
      // Update pointer position
      updatePointerPosition(currentAngle);
      
      // Update the status icon color
      updateStatusIconColor(initialTemp);
      
      // Ensure the power toggle is on
      powerToggle.checked = true;
    }
  }
  
  // Call the initialization function
  initializeThermostat();
  
  handleElement.addEventListener('mousedown', startDrag);
  handleElement.addEventListener('touchstart', startDrag, { passive: false });
  
  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }
  
  function drag(e) {
    if (!isDragging || !powerToggle.checked) return;
    
    const rect = dialElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get cursor position
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : centerX);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : centerY);
    
    // Calculate angle
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    
    // Convert to 0-360 range
    currentAngle = (angle + 90) % 360;
    if (currentAngle < 0) currentAngle += 360;
    
    updateTemperatureFromAngle(currentAngle);
  }
  
  function endDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    
    // Get current temperature value when dragging ends
    const tempText = tempDisplay.textContent;
    
    // Only update Firebase if power is on and we have a valid temperature (not "OFF")
    if (powerToggle.checked && tempText !== "OFF") {
      const temp = parseInt(tempText);
      if (!isNaN(temp)) {
        updateTemperatureInFirebase(temp);
      }
    }
  }
  
  function updateTemperatureFromAngle(angle) {
    // Map angle (0-360) to temperature (10-40)
    const temp = Math.round(10 + (angle / 360) * 20);
    // Make sure the temperature is never below 10 when in 'on' mode
    const displayTemp = Math.max(10, temp);
    tempDisplay.textContent = displayTemp;
    
    // Update the pointer position to reflect the current temperature
    updatePointerPosition(angle);
    
    // Update the status icon color based on temperature
    updateStatusIconColor(displayTemp);
  }
  
  // Function to create or update the temperature pointer
  function updatePointerPosition(angle) {
    // Update the position of the pointer spacer
    let pointerSpacer = dialElement.querySelector('.temperature-pointer-spacer');
    
    // Convert the angle to the correct position for the pointer
    // Add 90 degrees to adjust for CSS rotation starting position
    pointerSpacer.style.transform = `rotate(${angle}deg)`;
  }
  
  // Toggle power
  powerToggle.addEventListener('change', function() {
    const pointerSpacer = dialElement.querySelector('.temperature-pointer-spacer');
    const pointerTip = dialElement.querySelector('.temperature-pointer-tip');
    
    if (!this.checked) {
      tempDisplay.textContent = "OFF";
      dialElement.style.opacity = 0.5;
      // Hide pointer when thermostat is off
      if (pointerTip) pointerTip.style.opacity = 0;
      // Update status icon to neutral color
      updateStatusIconColor("OFF");
      // Update Firebase with 0 temperature when thermostat is turned off
      updateTemperatureInFirebase(0);
    } else {
      updateTemperatureFromAngle(currentAngle);
      dialElement.style.opacity = 1;
      // Show pointer when thermostat is on
      if (pointerTip) pointerTip.style.opacity = 1;
      // Update status icon color based on current temperature
      updateStatusIconColor(tempDisplay.textContent);
      // Update Firebase with current temperature when thermostat is turned on
      const temp = parseInt(tempDisplay.textContent);
      if (!isNaN(temp)) {
        updateTemperatureInFirebase(temp);
      }
    }
  });
});