/**
 * Initializes the slideshow functionality for the Book Recommendations section.
 * Handles slide navigation (prev/next buttons, dots) and display logic.
 */
export function initSlideshow() {
    // Find the main container for the slideshow section
    const slideshowContainer = document.getElementById('books-recommendation');
    // Exit if the container element isn't found on the page
    if (!slideshowContainer) {
        console.warn("Slideshow container '#books-recommendation' not found.");
        return; 
    }

    // Get HTML collections of slides and navigation dots within the container
    const slides = slideshowContainer.getElementsByClassName("slide");
    const dots = slideshowContainer.getElementsByClassName("dot");
    // Get the previous and next control buttons
    const prevButton = slideshowContainer.querySelector('.prev-slide');
    const nextButton = slideshowContainer.querySelector('.next-slide');

    // Exit if there are no slides to show
    if (slides.length === 0) {
        console.warn("No slides found within the slideshow container.");
        return; 
    }

    let slideIndex = 1; // Start with the first slide

    // Function to display a specific slide
    function showSlides(n) {
        // Handle index wrapping (going past the last or first slide)
        if (n > slides.length) { slideIndex = 1 } // Wrap to first
        if (n < 1) { slideIndex = slides.length } // Wrap to last

        // Hide all slides by default
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none"; 
            slides[i].classList.remove("active"); // Remove active class if present
        }

        // Deactivate all dots
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove("active-dot");
        }

        // Display the target slide and activate its corresponding dot
        slides[slideIndex - 1].style.display = "block"; // Show the slide
        slides[slideIndex - 1].classList.add("active"); // Add active class (for potential CSS transitions/styling)
        if (dots.length > 0) { // Check if dots exist
            dots[slideIndex - 1].classList.add("active-dot"); // Highlight the active dot
        }
    }

    // Function to advance to the next/previous slide
    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    // Function to jump to a specific slide (used by dots)
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    // --- Initialization ---

    // Show the initial slide when the page loads
    showSlides(slideIndex);

    // --- Event Listeners ---

    // Add click listeners to previous/next buttons if they exist
    if (prevButton) {
        prevButton.addEventListener('click', () => plusSlides(-1));
    } else {
        console.warn("Previous slide button not found.");
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => plusSlides(1));
    } else {
        console.warn("Next slide button not found.");
    }

    // Add click listeners to each dot indicator if they exist
    if (dots.length > 0) {
        for (let i = 0; i < dots.length; i++) {
            dots[i].addEventListener('click', () => currentSlide(i + 1)); // Dots are 1-indexed for currentSlide
        }
    } else {
         console.warn("Slide indicator dots not found.");
    }
}
