# Code Documentation for Literacy Champions Website

This document provides a brief overview of the code structure for the Literacy Champions website project located in the `Edit/` directory.

## Project Structure

*   **`index.html`**: The main HTML file containing the structure and content of the single-page website.
*   **`Assets/`**: Directory containing image assets used on the site.
*   **`css/`**: Directory containing modular CSS files. Each file styles a specific component or section of the website.
    *   `global.css`: Base styles, resets, variables, and global element styling.
    *   `header.css`: Styles for the main header and navigation.
    *   `hero.css`: Styles for the top hero section.
    *   `infographics.css`: Styles for the infographic sections.
    *   `slideshow.css`: Styles for the book recommendation slideshow.
    *   `details.css`: Styles for the key information grid section.
    *   `checklist.css`: Styles for the interactive literacy checklist section.
    *   `resources.css`: Styles for the downloadable resources section.
    *   `pledge.css`: Styles for the reading pledge section.
    *   `activity.css`: Styles for the featured activity section.
    *   `stories.css`: Styles for the success stories section.
    *   `volunteer.css`: Styles for the volunteer/partnership hub section.
    *   `contact.css`: Styles for the contact form section.
    *   `survey.css`: Styles for the survey section.
    *   `footer.css`: Styles for the page footer.
*   **`js/`**: Directory containing modular JavaScript files.
    *   `firebase-config.js`: Contains the Firebase project configuration object. This configuration is imported by `main.js` to initialize Firebase services.
    *   `main.js`: The main entry point for JavaScript. It imports the Firebase configuration from `firebase-config.js`. On `DOMContentLoaded`, it initializes Firebase services (including Analytics and the Realtime Database visitor counter) and also initializes other imported functional modules (like navigation, animations, etc.).
    *   `navigation.js`: Handles smooth scrolling, mobile menu toggle, and active link highlighting.
    *   `animations.js`: Handles scroll-triggered animations for sections using IntersectionObserver.
    *   `slideshow.js`: Controls the functionality of the book recommendation slideshow.
    *   `checklist.js`: Handles the interactive logic for the literacy milestones checklist.
*   **`README_FIRST.md`**: Contains development guidelines for AI assistants working on the project.
*   **`README_CODE.md`**: This file, providing an overview of the code structure.

## Code Flow

1.  The user accesses `index.html`.
2.  The browser parses `index.html` and finds links to the CSS files in the `<head>`. It loads and applies these styles sequentially (`global.css` first, then component-specific styles).
3.  The browser reaches the end of the `<body>` and finds the `<script>` tags for Firebase SDKs and then `js/main.js`.
4.  Because these script tags use `defer`, the browser downloads them while parsing HTML. They are executed in order after the HTML is fully parsed: first the Firebase SDKs (which set up the global `firebase` object), then `js/main.js`.
5.  `js/main.js` (being a module) first processes its imports, including `firebaseConfig` from `firebase-config.js` and functions from other local modules.
6.  Once the DOM is fully parsed, the `DOMContentLoaded` event fires. The listener in `js/main.js` then executes.
7.  Inside this listener, `main.js` calls `initFirebaseVisitorCounter()` (which uses the imported `firebaseConfig` to initialize Firebase App, Analytics, and Realtime Database) and also calls initialization functions from other modules (e.g., `initNavigation()`, `initSlideshow()`).
8.  Each module's initialization function finds the relevant HTML elements and attaches necessary event listeners or sets up its specific functionality.

This modular approach keeps the code organized and makes it easier to manage and update specific parts of the website's functionality or styling.
