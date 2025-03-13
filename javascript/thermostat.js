// Import Firebase modules
import { database } from '../database/firebase-config.js';
import { ref, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', function () {
    // Temperature Units
    const units = {
        Celcius: "°C"
    };

    // Configuration settings
    const config = {
        minTemp: 10,
        maxTemp: 40,
        unit: "Celcius"
    };

    // Get thermostat elements from original code
    const tempSlider = document.querySelector("input[type='range']");
    const minTempInput = document.getElementById("minTemp");
    const maxTempInput = document.getElementById("maxTemp");
    const temperatureDisplay = document.getElementById("temperature");
    const powerToggle = document.getElementById("power-toggle");
    const unitP = document.getElementById("unit");

    // Get thermostat elements from new code
    const dialElement = document.getElementById('thermostat-dial');
    const handleElement = document.getElementById('dial-handle');
    const tempDisplay = document.getElementById('temp-display');

    // Weather elements
    const currentTemperatureElement = document.getElementById('current-temprature');
    const weatherDescElement = document.querySelector('.weather-desc');

    // Determine which thermostat UI is being used
    const usingDial = dialElement && handleElement && tempDisplay;
    const usingSlider = tempSlider && temperatureDisplay;

    // Function to update temperature in Firebase
    async function updateTemperatureInFirebase(temp) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (!userData || !userData.officeID) {
                console.error('User data or office ID not found');
                return;
            }

            const officeID = userData.officeID;
            const updates = {};

            updates[`offices/${officeID}/temperature`] = temp;

            await update(ref(database), updates);
            console.log('Temperature updated in Firebase:', temp);
        } catch (error) {
            console.error('Error updating temperature in Firebase:', error);
        }
    }

    // Simulated Weather Update (Replace with API later)
    function updateWeather() {
        const randomTemp = Math.floor(Math.random() * 20) + 5;
        const weatherConditions = [
            'Clear sky', 'Few clouds', 'Scattered clouds', 'Overcast',
            'Light rain', 'Moderate rain', 'Heavy rain', 'Foggy',
            'Light snow', 'Snow'
        ];
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

        if (currentTemperatureElement) {
            currentTemperatureElement.textContent = `+${randomTemp}°C Outdoor Temperature`;
        }
        if (weatherDescElement) {
            weatherDescElement.textContent = randomCondition;
        }
    }

    updateWeather(); // Call weather update on page load

    // DIAL THERMOSTAT FUNCTIONALITY
    if (usingDial) {
        // Check if thermostat elements exist
        if (!powerToggle) {
            console.error('Power toggle element not found');
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

            // Position the marker
            marker.style.transformOrigin = `50% ${dialRadius}px`;
            marker.style.transform = `rotate(${angle}deg)`;

            dialElement.appendChild(marker);

            // Add temperature labels at quarters (10, 20, 30)
            if (i % 3 === 0) {
                const label = document.createElement('div');
                label.className = 'temperature-label';

                // Temperature values (10, 20, 30, 40)
                const temp = 10 + (i / 3) * 10;
                label.textContent = `${temp}°`;

                // Position label outside the markers
                const labelRadius = dialRadius - 15;
                const labelX = centerX + labelRadius * Math.cos(rad);
                const labelY = centerY + labelRadius * Math.sin(rad);

                label.style.left = `${labelX}px`;
                label.style.top = `${labelY}px`;
                label.style.transform = 'translate(-50%, -50%)';

                dialElement.appendChild(label);
            }
        }

        let currentAngle = 0;
        let isDragging = false;

        // Initialize temperature based on initial angle
        updateTemperatureFromAngle(currentAngle);

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
            const temp = Math.round(config.minTemp + (angle / 360) * (config.maxTemp - config.minTemp));
            // Make sure the temperature is never below minimum when in 'on' mode
            const displayTemp = Math.max(config.minTemp, temp);
            tempDisplay.textContent = displayTemp;
        }

        // Toggle power
        powerToggle.addEventListener('change', function () {
            if (!this.checked) {
                tempDisplay.textContent = "OFF";
                dialElement.style.opacity = 0.5;
                // Update Firebase with 0 temperature when thermostat is turned off
                updateTemperatureInFirebase(0);
            } else {
                updateTemperatureFromAngle(currentAngle);
                dialElement.style.opacity = 1;
                // Update Firebase with current temperature when thermostat is turned on
                const temp = parseInt(tempDisplay.textContent);
                if (!isNaN(temp)) {
                    updateTemperatureInFirebase(temp);
                }
            }
        });
    }

    // SLIDER THERMOSTAT FUNCTIONALITY  
    if (usingSlider) {
        // Ensure all elements exist
        if (!tempSlider || !temperatureDisplay || !powerToggle) {
            console.error('Slider thermostat elements missing!');
            return;
        }

        // Function to set temperature height and display
        function setTemperature() {
            temperatureDisplay.style.height = ((tempSlider.value - config.minTemp) / (config.maxTemp - config.minTemp)) * 100 + "%";
            temperatureDisplay.dataset.value = tempSlider.value + units[config.unit];
        }

        // Update temperature on slider change
        tempSlider.addEventListener("input", setTemperature);

        // Save temperature to Firebase on slider release
        tempSlider.addEventListener("change", function () {
            if (powerToggle.checked) {
                updateTemperatureInFirebase(parseInt(tempSlider.value));
            }
        });

        // Change min/max temperature values
        if (minTempInput && maxTempInput) {
            const tempValueInputs = document.querySelectorAll("input[type='text']");
            tempValueInputs.forEach(input => {
                input.addEventListener("change", event => {
                    const newValue = event.target.value;

                    if (isNaN(newValue)) {
                        return input.value = config[input.id];
                    } else {
                        config[input.id] = input.value;
                        tempSlider[input.id.slice(0, 3)] = config[input.id]; // Update range values
                        return setTemperature();
                    }
                });
            });
        }

        // Toggle temperature unit (Celsius <-> Fahrenheit)
        if (unitP) {
            unitP.addEventListener("click", () => {
                config.unit = config.unit === "Celcius" ? "Fahrenheit" : "Celcius";
                unitP.innerHTML = config.unit + ' ' + units[config.unit];
                return setTemperature();
            });
        }

        // Power Toggle Functionality
        powerToggle.addEventListener('change', function () {
            if (!this.checked) {
                temperatureDisplay.textContent = "OFF";
                tempSlider.disabled = true;
                updateTemperatureInFirebase(0); // Set temperature to 0 in Firebase when turned off
            } else {
                tempSlider.disabled = false;
                const temp = parseInt(tempSlider.value);
                temperatureDisplay.textContent = `${temp}°C`;
                updateTemperatureInFirebase(temp);
            }
        });

        // Initialize temperature display
        setTimeout(setTemperature, 1000);
    }
});