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
        minTemp: -20,
        maxTemp: 50,
        unit: "Celcius"
    };

    // Get thermostat elements
    const tempSlider = document.querySelector("input[type='range']");
    const minTempInput = document.getElementById("minTemp");
    const maxTempInput = document.getElementById("maxTemp");
    const temperatureDisplay = document.getElementById("temperature");
    const powerToggle = document.getElementById("power-toggle");
    const unitP = document.getElementById("unit");

    // Weather elements
    const currentTemperatureElement = document.getElementById('current-temprature');
    const weatherDescElement = document.querySelector('.weather-desc');

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

    // Ensure all elements exist
    if (!tempSlider || !temperatureDisplay || !powerToggle) {
        console.error('Thermostat elements missing!');
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

    // Toggle temperature unit (Celsius <-> Fahrenheit)
    unitP.addEventListener("click", () => {
        config.unit = config.unit === "Celcius" ? "Fahrenheit" : "Celcius";
        unitP.innerHTML = config.unit + ' ' + units[config.unit];
        return setTemperature();
    });

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
});
