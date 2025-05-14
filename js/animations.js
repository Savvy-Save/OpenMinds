/**
 * Initializes scroll-triggered animations for sections using IntersectionObserver.
 * Sections fade and slide up slightly as they enter the viewport.
 */
export function initScrollAnimations() {
    // Select all sections to be animated
    const animatedSections = document.querySelectorAll('section'); 

    // Check if IntersectionObserver API is supported by the browser
    if (!('IntersectionObserver' in window)) {
        // console.log("IntersectionObserver not supported, animations disabled."); // Keep commented unless debugging
        // Fallback: Make sections visible immediately if API is not supported
        animatedSections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
        return; 
    }

    // Configuration for the IntersectionObserver
    const observerOptions = {
        root: null, // Observe intersections relative to the viewport
        rootMargin: '0px', // No margin around the viewport
        threshold: 0.1 // Trigger when 10% of the section is visible
    };

    // Callback function for the IntersectionObserver
    const intersectionCallback = (entries, observer) => {
        entries.forEach(entry => {
            // If the section is intersecting (entering the viewport)
            if (entry.isIntersecting) {
                // Apply final animation styles (fade in, slide up)
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Optional: Stop observing the element after it has animated once
                // observer.unobserve(entry.target); 
            } 
            // Optional: Reset animation if element scrolls out of view
            // else {
            //     entry.target.style.opacity = '0';
            //     entry.target.style.transform = 'translateY(20px)';
            // }
        });
    };

    // Create the IntersectionObserver instance
    const observer = new IntersectionObserver(intersectionCallback, observerOptions);

    // Prepare each section for animation and start observing it
    animatedSections.forEach(section => {
        section.style.opacity = '0'; // Set initial invisible state
        section.style.transform = 'translateY(20px)'; // Set initial slightly moved down state
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'; // Define animation transition
        observer.observe(section); // Start observing the section
    });
}
