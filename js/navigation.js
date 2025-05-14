/**
 * Initializes navigation-related functionalities:
 * - Smooth scrolling for internal links.
 * - Mobile menu toggle (hamburger).
 * - Closing mobile menu on outside click.
 * - Highlighting active navigation link based on scroll position.
 */
export function initNavigation() {
    // --- Smooth Scrolling ---
    // Select all navigation links and relevant CTA buttons pointing to internal anchors
    const navLinks = document.querySelectorAll('nav ul li a[href^="#"]');
    const ctaLinks = document.querySelectorAll('a.cta-button[href^="#"]');
    // Include the link in the success stories CTA and volunteer hub CTA
    const storyCtaLink = document.querySelector('.share-story-cta a[href^="#"]');
    const volunteerLinks = document.querySelectorAll('#volunteer-hub a[href^="#"]');
    const allScrollLinks = [...navLinks, ...ctaLinks, ...volunteerLinks];
    if (storyCtaLink) {
        allScrollLinks.push(storyCtaLink);
    }

    // Get header element once for offset calculation
    const header = document.querySelector('header');
    const headerOffset = header ? header.offsetHeight : 60; // Use actual height or fallback

    // Add click listener to all identified scroll links
    allScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Ensure it's an internal link before acting
            if (targetId.startsWith('#')) {
                e.preventDefault(); // Prevent default anchor jump
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Calculate position considering header height
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset;

                    // Perform smooth scroll
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if it's open and the clicked link is within the main nav
                    if (navUl && navUl.classList.contains('active') && this.closest('nav')) {
                        closeMobileMenu();
                    }
                }
            }
            // If it's not an internal link (e.g., external survey link), the default behavior proceeds.
        });
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle'); // Hamburger button
    const navUl = document.querySelector('nav ul'); // The list of nav links

    // Helper function to open the mobile menu
    function openMobileMenu() {
        if (navUl && menuToggle) {
            navUl.classList.add('active'); // Show the menu
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true'); // Update accessibility state
        }
    }

    // Helper function to close the mobile menu
    function closeMobileMenu() {
         if (navUl && menuToggle) {
            navUl.classList.remove('active'); // Hide the menu
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false'); // Update accessibility state
        }
    }

    // Add click listener to the hamburger button
    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            // Toggle menu state based on current aria-expanded attribute
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeMobileMenu(); // Close if already open
            } else {
                openMobileMenu(); // Open if closed
            }
        });
    }

    // --- Close Mobile Menu on Outside Click ---
    // Add a listener to the whole document
    document.addEventListener('click', (event) => {
        // Only act if the menu is currently active
        if (navUl && navUl.classList.contains('active')) {
            // Check if the click was inside the nav menu itself or on the toggle button
            const isClickInsideNav = navUl.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            // If the click was outside both, close the menu
            if (!isClickInsideNav && !isClickOnToggle) {
                closeMobileMenu();
            }
        }
    });

    // --- Active Navigation Link Highlighting ---
    const sections = document.querySelectorAll("main section[id]"); // Get all sections with an ID
    const navHeaderLinks = document.querySelectorAll("nav ul li a"); // Get all main navigation links

    // Function to update the active link based on scroll position
    function changeNavActiveState() {
        let currentSectionId = "";
        const scrollPosition = window.pageYOffset; // Current scroll position

        // Iterate through sections to find which one is currently in view
        sections.forEach(section => {
            // Calculate the top position of the section, adjusted for header and a small offset
            const sectionTop = section.offsetTop - headerOffset - 100; // Activate slightly before section top hits header
            
            // If the scroll position is below the adjusted top of the section, it's potentially the active one
            if (scrollPosition >= sectionTop) {
                currentSectionId = section.getAttribute("id");
            }
        });

        // Update the 'active-link' class and 'aria-current' attribute on nav links
        navHeaderLinks.forEach(link => {
            link.classList.remove("active-link"); // Remove from all links first
            link.removeAttribute("aria-current");
            // Add class and attribute if the link's href matches the current section
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active-link");
                link.setAttribute("aria-current", "page"); // Accessibility: indicates current page section
            }
        });
    }

    // Initial check on page load and add scroll event listener
    if (sections.length > 0 && navHeaderLinks.length > 0 && header) {
        changeNavActiveState(); // Set initial active link
        // Add listener to update active link on scroll
        // Note: For performance on complex pages, consider debouncing or throttling this listener
        window.addEventListener("scroll", changeNavActiveState);
    }
}
