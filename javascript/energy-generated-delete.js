// Energy Generated deletion utility
import { ref, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the button element
    const deleteEnergyGeneratedBtn = document.getElementById('deleteEnergyGeneratedBtn');
    
    // Add click event listener
    if (deleteEnergyGeneratedBtn) {
        deleteEnergyGeneratedBtn.addEventListener('click', async () => {
            // Confirmation dialog with clear warning about complete deletion
            if (confirm('WARNING: This will PERMANENTLY DELETE the entire energy-generated field and ALL its contents. This action cannot be undone. Continue?')) {
                const statusElement = document.getElementById('cleanupStatus');
                
                try {
                    // Update status
                    statusElement.textContent = 'Deleting entire energy-generated field...';
                    statusElement.className = 'cleanup-status info';
                    statusElement.style.display = 'block';
                    
                    // Get reference to the energy-generated node
                    const energyGeneratedRef = ref(database, 'energy-generated');
                    
                    // Completely remove the node and all its contents
                    await remove(energyGeneratedRef);
                    
                    // Success message
                    statusElement.textContent = 'Successfully deleted the entire energy-generated field from Firebase!';
                    statusElement.className = 'cleanup-status success';
                    
                    console.log('Successfully deleted entire energy-generated field from Firebase');
                } catch (error) {
                    // Error handling
                    statusElement.textContent = `Error deleting energy-generated field: ${error.message}`;
                    statusElement.className = 'cleanup-status error';
                    
                    console.error('Error deleting energy-generated field:', error);
                }
            }
        });
    } else {
        console.error('Could not find deleteEnergyGeneratedBtn element');
    }
});