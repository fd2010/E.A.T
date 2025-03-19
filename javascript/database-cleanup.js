// database-cleanup.js - Utility for cleaning up large database tables
import { ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from '../database/firebase-config.js';

/**
 * Utility class for database cleanup operations
 */
class DatabaseCleanup {
    constructor() {
        // Initialize status element references
        this.statusElement = null;
    }

    /**
     * Initialize the cleanup utility and set up event listeners
     */
    initialize() {
        console.log("Initializing database cleanup utility");

        // Get reference to the cleanup button and status element
        const cleanupButton = document.getElementById('cleanupDatabaseBtn');
        this.statusElement = document.getElementById('cleanupStatus');

        if (cleanupButton) {
            // Add click event listener to the cleanup button
            cleanupButton.addEventListener('click', () => {
                this.confirmAndCleanupTable('energy-consumed');
            });
            console.log("Database cleanup button initialized");
        } else {
            console.error("Cleanup button not found in the document");
        }
    }

    /**
     * Display status message in the status element
     * @param {string} message - Message to display
     * @param {string} type - Type of message (success, error, warning, info)
     */
    showStatus(message, type = 'info') {
        if (!this.statusElement) {
            console.log(`Status (${type}): ${message}`);
            return;
        }

        // Clear any existing classes
        this.statusElement.className = 'cleanup-status';
        
        // Add the appropriate class based on the message type
        this.statusElement.classList.add(type);
        
        // Set the message text
        this.statusElement.textContent = message;
        
        // Make sure the element is visible
        this.statusElement.style.display = 'block';
    }

    /**
     * Show confirmation dialog and clean up specified table if confirmed
     * @param {string} tableName - Name of the table to clean up
     */
    confirmAndCleanupTable(tableName) {
        if (confirm(`Are you sure you want to delete all data in the "${tableName}" table? This cannot be undone!`)) {
            this.showStatus(`Deleting data from ${tableName}...`, 'info');
            this.deleteTable(tableName);
        }
    }

    /**
     * Delete all data from a specified table
     * @param {string} tableName - Name of the table to delete
     */
    deleteTable(tableName) {
        // Check if database is initialized
        if (!database) {
            this.showStatus("Firebase database not initialized", 'error');
            return;
        }
        
        try {
            // Create a reference to the table
            const tableRef = ref(database, tableName);
            
            console.log(`Deleting table: ${tableName}`);
            
            // Set the reference to null, which deletes all data at that location
            set(tableRef, null)
                .then(() => {
                    console.log(`Successfully deleted ${tableName} data`);
                    this.showStatus(`Successfully deleted all data from ${tableName}!`, 'success');
                })
                .catch((error) => {
                    console.error(`Error deleting ${tableName} data:`, error);
                    this.showStatus(`Error deleting data: ${error.message}`, 'error');
                });
        } catch (error) {
            console.error(`Error setting up deletion for ${tableName}:`, error);
            this.showStatus(`Error setting up deletion: ${error.message}`, 'error');
        }
    }
}

// Create and initialize the cleanup utility when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing DatabaseCleanup');
    const databaseCleanup = new DatabaseCleanup();
    databaseCleanup.initialize();
    
    // Make the cleanup utility available globally
    window.databaseCleanup = databaseCleanup;
});

// Export the DatabaseCleanup class for potential use in other modules
export default DatabaseCleanup;