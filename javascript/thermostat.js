document.addEventListener('DOMContentLoaded', function() {
  const dialElement = document.getElementById('thermostat-dial');
  const handleElement = document.getElementById('dial-handle');
  const tempDisplay = document.getElementById('temp-display');
  const powerToggle = document.getElementById('power-toggle');
  
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
  }
  
  function updateTemperatureFromAngle(angle) {
    // Map angle (0-360) to temperature (10-40)
    const temp = Math.round(10 + (angle / 360) * 30);
    tempDisplay.textContent = temp;
  }
  
  // Toggle power
  powerToggle.addEventListener('change', function() {
    if (!this.checked) {
      tempDisplay.textContent = "0";
      dialElement.style.opacity = 0.5;
    } else {
      updateTemperatureFromAngle(currentAngle);
      dialElement.style.opacity = 1;
    }
  });
});