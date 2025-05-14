/**
 * Main JavaScript entry point for the Literacy Champions website.
 * Imports and initializes all necessary JavaScript modules after the DOM is loaded.
 */

// Import initialization functions from modules
import { initNavigation } from './navigation.js';
import { initScrollAnimations } from './animations.js';
import { initSlideshow } from './slideshow.js';
import { initChecklist } from './checklist.js';
// import { initResourceModals } from './resourceModals.js'; // Assuming it would be a separate module

// Import Firebase configuration
import { firebaseConfig } from './firebase-config.js';

// Module-scoped Firebase app and database instances
let app;
let database;

/**
 * Initializes Firebase app and database if not already done.
 */
const initializeFirebaseApp = () => {
    if (!app && typeof firebase !== 'undefined') {
        try {
            app = firebase.initializeApp(firebaseConfig);
            firebase.analytics(app); // Initialize Analytics
            database = firebase.database(app); // Initialize Realtime Database
            // console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Error initializing Firebase app:", error);
        }
    }
};

/**
 * Initializes Firebase and sets up a unique visitor counter using Firebase Realtime Database.
 * Displays the count in an element with the ID 'visitor-count'.
 */
const initFirebaseVisitorCounter = () => {
    if (!database) {
        console.error('Firebase database not initialized. Visitor counter cannot start.');
        const displayElement = document.getElementById('visitor-count');
        if (displayElement) displayElement.textContent = 'Error';
        return;
    }
    try {
        const visitorCountRef = database.ref('visitorCount');
            const displayElement = document.getElementById('visitor-count');
            const sessionCountedKey = 'firebaseVisitorCounted';

            const updateDisplay = (count) => {
                if (displayElement) displayElement.textContent = count || '0';
            };

            if (!sessionStorage.getItem(sessionCountedKey)) {
                visitorCountRef.transaction((currentCount) => (currentCount || 0) + 1,
                (error, committed, snapshot) => {
                    if (error) console.error('Firebase transaction failed: ', error);
                    else if (committed) sessionStorage.setItem(sessionCountedKey, 'true');
                });
            }

            visitorCountRef.on('value', (snapshot) => updateDisplay(snapshot.val()),
            (error) => {
                console.error('Error fetching visitor count from Firebase:', error);
                updateDisplay('N/A');
            });

    } catch (error) {
        console.error("Error setting up Firebase visitor counter:", error);
        const displayElement = document.getElementById('visitor-count');
        if (displayElement) displayElement.textContent = 'Error';
    }
};

/**
 * Initializes the contact form to submit messages to Firebase Realtime Database.
 */
const initContactForm = () => {
    if (!database) {
        console.error('Firebase database not initialized. Contact form cannot be set up.');
        return;
    }

    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        console.error('Contact form element not found!');
        return;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default page reload

        const nameInput = contactForm.querySelector('#name');
        const emailInput = contactForm.querySelector('#email');
        const messageInput = contactForm.querySelector('#message');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        // Basic email validation
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const messagesRef = database.ref('contactMessages');
            await messagesRef.push({
                name: name,
                email: email,
                message: message,
                timestamp: firebase.database.ServerValue.TIMESTAMP // Server-side timestamp
            });
            alert('Message sent successfully! Thank you for contacting us.');
            contactForm.reset(); // Clear the form
        } catch (error) {
            console.error('Error sending message to Firebase:', error);
            alert('Failed to send message. Please try again later.');
        }
    });
};

/**
 * Wait for the HTML document to be fully parsed before running scripts
 * to ensure all elements are available in the DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase first
    initializeFirebaseApp();

    // Initialize all imported modules, with error handling for each
    try {
        initNavigation();
    } catch (error) {
        console.error("Error initializing navigation:", error);
    }

    try {
        initScrollAnimations();
    } catch (error) {
        console.error("Error initializing scroll animations:", error);
    }

    try {
        initSlideshow();
    } catch (error) {
        console.error("Error initializing slideshow:", error);
    }

    try {
        initChecklist();
    } catch (error) {
        console.error("Error initializing checklist:", error);
    }

    try {
        initFirebaseVisitorCounter();
    } catch (error) {
        console.error("Error initializing Firebase visitor counter from DOMContentLoaded:", error);
    }

    try {
        initContactForm(); // Initialize the contact form
    } catch (error) {
        console.error("Error initializing contact form:", error);
    }

    try {
        initResourceModals(); // Initialize resource modals
    } catch (error) {
        console.error("Error initializing resource modals:", error);
    }
    
    // console.log("All modules initialized.");
});

/**
 * Initializes modal functionality for resource kit downloads.
 * Allows modals to be opened by buttons and closed by a close button or clicking outside.
 */
const initResourceModals = () => {
    const openModalButtons = document.querySelectorAll('.open-modal-button');
    const modals = document.querySelectorAll('.modal');

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });

    modals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Close modal if user clicks outside of the modal content
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modal with Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
};
