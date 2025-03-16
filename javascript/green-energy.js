// green-energy.js
import { database } from '../database/firebase-config.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { canSetGreenEnergyRecommendation } from './auth.js';

/**
 * Initialize green energy recommendation functionality
 * - Loads the current recommendation from Firebase
 * - Sets up edit controls for authorized users
 */
export function initializeGreenEnergyRecommendation() {
    console.log('Initializing green energy recommendation');
    
    // Load current recommendation text
    loadGreenEnergyRecommendation();
    
    // Setup edit functionality if user has permission
    setupEditControls();
}

/**
 * Load green energy recommendation from Firebase
 */
async function loadGreenEnergyRecommendation() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.officeID) {
            console.error('User data or office ID not found');
            displayDefaultRecommendation();
            return;
        }
        
        const officeID = userData.officeID;
        const officeRef = ref(database, `offices/${officeID}`);
        const officeSnapshot = await get(officeRef);
        
        if (officeSnapshot.exists()) {
            const officeData = officeSnapshot.val();
            
            // Check if greenEnergyRecommendation field exists
            if (officeData.hasOwnProperty('greenEnergyRecommendation')) {
                updateRecommendationDisplay(officeData.greenEnergyRecommendation);
            } else {
                displayDefaultRecommendation();
            }
        } else {
            console.error('Office data not found');
            displayDefaultRecommendation();
        }
    } catch (error) {
        console.error('Error loading green energy recommendation:', error);
        displayDefaultRecommendation();
    }
}

/**
 * Update the recommendation display with the provided text
 */
function updateRecommendationDisplay(recommendationText) {
    const recommendationContent = document.querySelector('.recommendation-content');
    if (recommendationContent) {
        recommendationContent.innerHTML = recommendationText || 'No goals set.';
    }
}

/**
 * Display default recommendation when none is set
 */
function displayDefaultRecommendation() {
    updateRecommendationDisplay('No goals set.');
}

/**
 * Setup edit controls for authorized users
 */
function setupEditControls() {
    if (!canSetGreenEnergyRecommendation()) {
        return; // User doesn't have permission
    }
    
    console.log('User has permission to edit green energy recommendation');
    
    const recommendationHeader = document.querySelector('.recommendation-header');
    if (!recommendationHeader) return;
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-recommendation-btn';
    editButton.title = 'Edit Recommendation';
    editButton.style.background = 'none';
    editButton.style.border = 'none';
    editButton.style.cursor = 'pointer';
    editButton.style.marginLeft = '10px';
    
    // Create image element for the pencil icon
    const pencilIcon = document.createElement('img');
    pencilIcon.src = './images/icons/pencil.svg';
    pencilIcon.alt = 'Edit';
    pencilIcon.style.width = '16px';
    pencilIcon.style.height = '16px';
    
    // Add image to button
    editButton.appendChild(pencilIcon);
    
    // Add click handler to edit button
    editButton.addEventListener('click', openEditRecommendationModal);
    
    // Add edit button to the header
    recommendationHeader.style.display = 'flex';
    recommendationHeader.style.justifyContent = 'space-between';
    recommendationHeader.style.alignItems = 'center';
    recommendationHeader.appendChild(editButton);
}

/**
 * Open modal to edit recommendation
 */
function openEditRecommendationModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('editRecommendationModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editRecommendationModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const closeButton = document.createElement('span');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'h2Light';
        modalTitle.textContent = 'Edit Green Energy Recommendation';
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        const textArea = document.createElement('textarea');
        textArea.id = 'recommendationTextarea';
        textArea.rows = 5;
        textArea.style.width = '100%';
        textArea.style.padding = '10px';
        textArea.style.marginBottom = '20px';
        textArea.style.borderRadius = '4px';
        textArea.style.border = '1px solid #ccc';
        
        // Add current text to textarea
        const currentText = document.querySelector('.recommendation-content').innerHTML;
        textArea.value = currentText;
        
        // Save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Changes';
        saveButton.className = 'buttonHome lightcyanButton';
        saveButton.style.marginTop = '10px';
        saveButton.addEventListener('click', () => {
            saveRecommendationText(textArea.value);
            modal.style.display = 'none';
        });
        
        modalBody.appendChild(textArea);
        modalBody.appendChild(saveButton);
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        
        // Add modal to document
        document.body.appendChild(modal);
    }
    
    // Populate textarea with current recommendation text
    const textarea = document.getElementById('recommendationTextarea');
    const currentText = document.querySelector('.recommendation-content').innerHTML;
    textarea.value = currentText;
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Save recommendation text to Firebase
 */
async function saveRecommendationText(text) {
    try {
        if (!canSetGreenEnergyRecommendation()) {
            console.error('User does not have permission to edit recommendation');
            return;
        }
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.officeID) {
            console.error('User data or office ID not found');
            return;
        }
        
        const officeID = userData.officeID;
        
        // Update Firebase with new recommendation text
        const updates = {};
        updates[`offices/${officeID}/greenEnergyRecommendation`] = text || 'No goals set.';
        
        await update(ref(database), updates);
        console.log('Green energy recommendation updated successfully');
        
        // Update the display
        updateRecommendationDisplay(text);
        
    } catch (error) {
        console.error('Error saving green energy recommendation:', error);
        alert('Failed to update recommendation. Please try again.');
    }
}