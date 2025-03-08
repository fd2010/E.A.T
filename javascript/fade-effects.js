// Add this to your dashboard.js or create a new script file and import it

document.addEventListener('DOMContentLoaded', function() {
    // Set up scroll listeners for all scrollable elements
    setupScrollFades();
});

function setupScrollFades() {
    // Set up for devices grid (vertical scrolling)
    const devicesGrids = document.querySelectorAll('.devices-grid');
    devicesGrids.forEach(grid => {
        // Set initial fade state
        updateVerticalFade(grid);
        
        // Add scroll event listener
        grid.addEventListener('scroll', function() {
            updateVerticalFade(this);
        });
    });
    
    // Set up for room tabs (horizontal scrolling)
    const roomTabs = document.querySelectorAll('.room-tabs');
    roomTabs.forEach(tabs => {
        // Set initial fade state
        updateHorizontalFade(tabs);
        
        // Add scroll event listener
        tabs.addEventListener('scroll', function() {
            updateHorizontalFade(this);
        });
    });
}

function updateVerticalFade(element) {
    // Check if scrolled to bottom
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5; // 5px tolerance
    
    // Check if scrolled to top
    const isAtTop = element.scrollTop <= 5; // 5px tolerance
    
    if (isAtBottom && isAtTop) {
        // Content fits without scrolling - no fade needed
        element.style.webkitMaskImage = 'none';
        element.style.maskImage = 'none';
    } else if (isAtBottom) {
        // Only top fade
        element.style.webkitMaskImage = 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)';
        element.style.maskImage = 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)';
    } else if (isAtTop) {
        // Only bottom fade
        element.style.webkitMaskImage = 'linear-gradient(to bottom, black 0%, black 95%, transparent 100%)';
        element.style.maskImage = 'linear-gradient(to bottom, black 0%, black 95%, transparent 100%)';
    } else {
        // Both top and bottom fade
        element.style.webkitMaskImage = 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)';
        element.style.maskImage = 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)';
    }
}

function updateHorizontalFade(element) {
    // Check if scrolled to rightmost edge
    const isAtRight = element.scrollWidth - element.scrollLeft <= element.clientWidth + 5; // 5px tolerance
    
    // Check if scrolled to leftmost edge
    const isAtLeft = element.scrollLeft <= 5; // 5px tolerance
    
    if (isAtRight && isAtLeft) {
        // Content fits without scrolling - no fade needed
        element.style.webkitMaskImage = 'none';
        element.style.maskImage = 'none';
    } else if (isAtRight) {
        // Only left fade
        element.style.webkitMaskImage = 'linear-gradient(to right, transparent 0%, black 5%, black 100%)';
        element.style.maskImage = 'linear-gradient(to right, transparent 0%, black 5%, black 100%)';
    } else if (isAtLeft) {
        // Only right fade
        element.style.webkitMaskImage = 'linear-gradient(to right, black 0%, black 95%, transparent 100%)';
        element.style.maskImage = 'linear-gradient(to right, black 0%, black 95%, transparent 100%)';
    } else {
        // Both left and right fade
        element.style.webkitMaskImage = 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)';
        element.style.maskImage = 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)';
    }
}