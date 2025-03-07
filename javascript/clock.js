function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update analog clock hands
    const hourDeg = (hours % 12) * 30 + minutes * 0.5; // 30 degrees per hour + adjustment for minutes
    const minuteDeg = minutes * 6; // 6 degrees per minute
    const secondDeg = seconds * 6; // 6 degrees per second
    
    document.getElementById('hour-hand').style.transform = `rotate(${hourDeg}deg)`;
    document.getElementById('minute-hand').style.transform = `rotate(${minuteDeg}deg)`;
    document.getElementById('second-hand').style.transform = `rotate(${secondDeg}deg)`;
    
    // Update digital display
    const hoursDisplay = hours.toString().padStart(2, '0');
    const minutesDisplay = minutes.toString().padStart(2, '0');
    const secondsDisplay = seconds.toString().padStart(2, '0');
    document.getElementById('clock-time').textContent = `${hoursDisplay}:${minutesDisplay}:${secondsDisplay}`;
    
    // Update date
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', options);
    
    // Call this function every second
    setTimeout(updateClock, 1000);
}

// Start the clock when the page loads
window.onload = function() {
    updateClock();
};