// AOS Animation Setup
AOS.init({
    easing: 'ease-in-out',
    once: true
});

// Hamburger Menu with Lottie
const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector(".nav-menu");
const menuOverlay = document.getElementById("menu-overlay"); // Get the overlay element

// Ensure hamburger and navMenu exist before trying to load Lottie animation
if (hamburger && navMenu) {
    const animation = lottie.loadAnimation({
        container: hamburger,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "icons/hamburger.json" // Make sure this path is correct
    });

    animation.setSpeed(2.5);

    let menuOpen = false;

    function toggleMenu(forceClose = false) {
        menuOpen = forceClose ? false : !menuOpen;

        animation.setDirection(menuOpen ? 1 : -1);
        animation.play();

        navMenu.classList.toggle("active", menuOpen);
        // Safely toggle overlay active class only if menuOverlay exists
        if (menuOverlay) {
            menuOverlay.classList.toggle("active", menuOpen);
        }
        document.body.style.overflow = menuOpen ? "hidden" : "auto";

        hamburger.classList.toggle("is-active-overlay", menuOpen);

        // Close theme dropdown when hamburger menu is toggled
        const themeDropdown = document.getElementById("theme-dropdown");
        if (themeDropdown && themeDropdown.classList.contains("active")) {
            themeDropdown.classList.remove("active");
        }
    }

    // Click hamburger icon
    hamburger.addEventListener("click", () => toggleMenu());

    // ESC key closes menu
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuOpen) {
            toggleMenu(true);
        }
    });

    // Click outside to close menu (This is now redundant due to overlay click, but kept for reference if overlay is removed)
    document.addEventListener("click", (e) => {
        if (
            menuOpen &&
            !hamburger.contains(e.target) &&
            !navMenu.contains(e.target)
        ) {
            toggleMenu(true);
        }
    });
}

// Safely add event listener for menuOverlay if it exists
if (menuOverlay) {
    menuOverlay.addEventListener("click", () => toggleMenu(true));
}


// =====================
// THEME TOGGLE LOGIC
// =====================

const themeToggleButton = document.getElementById("theme-toggle-button");
const themeDropdown = document.getElementById("theme-dropdown");
const themeOptions = document.querySelectorAll(".theme-option");

// Function to apply theme and update button display
// preferredTheme: 'light', 'dark', or 'system' (user's selection/preference)
// actualTheme: 'light' or 'dark' (the theme actually applied to the body)
function applyTheme(preferredTheme, actualTheme = null) {
    let finalActualTheme = actualTheme;

    // Determine the actual theme if not explicitly provided
    if (finalActualTheme === null) {
        if (preferredTheme === 'system') {
            finalActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            finalActualTheme = preferredTheme; // If light/dark is preferred, that's the actual theme
        }
    }

    // Apply the actual theme to the body
    if (document.body) {
        document.body.setAttribute('data-theme', finalActualTheme);
    } else {
        console.error("Document body not found. Cannot apply theme.");
        return;
    }

    // Store the *preferred* theme in local storage
    if (preferredTheme === 'system') {
        localStorage.removeItem('swiftel-theme'); // Clear if system is chosen to ensure system preference is re-evaluated
    } else {
        localStorage.setItem('swiftel-theme', preferredTheme);
    }

    // Update the main toggle button icon and text based on the *preferred* theme
    if (themeToggleButton) {
        let iconClass = '';
        let buttonText = '';

        if (preferredTheme === 'dark') {
            iconClass = 'fas fa-moon';
            buttonText = 'Dark';
        } else if (preferredTheme === 'light') {
            iconClass = 'fas fa-sun';
            buttonText = 'Light';
        } else { // 'system'
            iconClass = 'fas fa-desktop';
            buttonText = 'System';
        }
        themeToggleButton.innerHTML = `<i class="${iconClass}"></i> ${buttonText}`;
    }
}

// Initial theme application on page load
document.addEventListener("DOMContentLoaded", () => {
    const storedThemePreference = localStorage.getItem('swiftel-theme');

    if (storedThemePreference) {
        // If a preference is stored, apply it.
        // The actualTheme will be determined within applyTheme if preferredTheme is 'system'
        applyTheme(storedThemePreference);
    } else {
        // If no preference, it's implicitly 'system'.
        // Determine the system's actual theme and pass 'system' as the preferredTheme.
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme('system', prefersDarkMode ? 'dark' : 'light');
    }

    // Listener for system theme changes (only if system theme is the active preference or no preference stored)
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Re-evaluate and apply system theme if user hasn't explicitly chosen light/dark
            if (!localStorage.getItem("swiftel-theme")) { // If no explicit stored theme, it's system
                applyTheme('system', e.matches ? 'dark' : 'light');
            }
        });
    }

    // Toggle dropdown visibility
    if (themeToggleButton && themeDropdown) {
        themeToggleButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent click from bubbling to document and closing dropdown immediately
            themeDropdown.classList.toggle("active");
        });
    }

    // Handle theme option clicks
    themeOptions.forEach(option => {
        option.addEventListener("click", () => {
            const selectedTheme = option.getAttribute("data-theme-value");
            if (selectedTheme === "system") {
                // If system is chosen, remove explicit localStorage item
                localStorage.removeItem("swiftel-theme");
                // Re-evaluate based on current system preference
                applyTheme('system', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            } else {
                // For 'light' or 'dark', directly apply that as the preferred and actual theme
                applyTheme(selectedTheme);
            }
            themeDropdown.classList.remove("active"); // Hide dropdown after selection
        });
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", (event) => {
        if (themeDropdown && !themeDropdown.contains(event.target) && !themeToggleButton.contains(event.target)) {
            themeDropdown.classList.remove("active");
        }
    });
});
