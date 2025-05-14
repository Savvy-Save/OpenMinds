/**
 * Initializes the interactive functionality for the Literacy Milestones Checklist.
 * Attaches an event listener to the 'See My Progress' button to calculate
 * and display the number of checked items in each category.
 */
export function initChecklist() {
    // Get the form element containing the checklist
    const milestoneForm = document.getElementById('milestonesForm');
    // Exit if the form element isn't found
    if (!milestoneForm) {
        console.warn("Milestone form '#milestonesForm' not found.");
        return; 
    }

    // Get the button and the feedback display area
    const milestoneCheckButton = document.getElementById('milestoneCheckButton');
    const milestoneFeedbackDiv = document.getElementById('milestoneFeedback');

    // Ensure both the button and feedback area exist before adding listener
    if (milestoneCheckButton && milestoneFeedbackDiv) {
        // Add click listener to the button
        milestoneCheckButton.addEventListener('click', () => {
            // Select checkboxes within each category using more specific selectors
            const checkboxesAge34 = milestoneForm.querySelectorAll('.milestone-category:nth-of-type(1) input[type="checkbox"]');
            const checkboxesAge56 = milestoneForm.querySelectorAll('.milestone-category:nth-of-type(2) input[type="checkbox"]');

            // Count checked items in the first category (Ages 3-4)
            let checkedCountAge34 = 0;
            checkboxesAge34.forEach(cb => {
                if (cb.checked) checkedCountAge34++; // Increment if checked
            });

            // Count checked items in the second category (Ages 5-6)
            let checkedCountAge56 = 0;
            checkboxesAge56.forEach(cb => {
                if (cb.checked) checkedCountAge56++; // Increment if checked
            });

            // Construct the feedback message based on counts
            let feedbackMessage = "Thank you for using the checklist! ";
            let hasCheckedItems = false; // Flag to check if any item was selected

            // Add results for the first category if it exists
            if (checkboxesAge34.length > 0) {
                feedbackMessage += `For ages 3-4, you've checked ${checkedCountAge34} out of ${checkboxesAge34.length} milestones. `;
                if (checkedCountAge34 > 0) hasCheckedItems = true;
            }
            // Add results for the second category if it exists
            if (checkboxesAge56.length > 0) {
                feedbackMessage += `For ages 5-6, you've checked ${checkedCountAge56} out of ${checkboxesAge56.length} milestones. `;
                 if (checkedCountAge56 > 0) hasCheckedItems = true;
            }

            // Provide specific feedback if no items were checked
            if (!hasCheckedItems && (checkboxesAge34.length > 0 || checkboxesAge56.length > 0)) {
                 feedbackMessage = "It looks like you haven't checked any milestones yet. Feel free to select the ones that apply!";
            } 
            // Add encouraging closing remark if items were checked
            else if (hasCheckedItems) {
                 feedbackMessage += "This is a great start! Remember, every child develops differently. For personalized advice, consider talking to a teacher or healthcare professional.";
            }

            // Display the feedback message and update styles
            milestoneFeedbackDiv.textContent = feedbackMessage;
            milestoneFeedbackDiv.style.borderStyle = 'solid'; // Change border from dashed to solid
            milestoneFeedbackDiv.style.padding = '1rem'; // Ensure consistent padding
            milestoneFeedbackDiv.style.fontStyle = 'normal'; // Remove initial italic style
        });
    } else {
        // Log error if essential elements are missing
        if (!milestoneCheckButton) console.error("Checklist button '#milestoneCheckButton' not found.");
        if (!milestoneFeedbackDiv) console.error("Checklist feedback area '#milestoneFeedback' not found.");
    }
}
