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

// Function to apply a theme
function applyTheme(theme) {
    // Check if the body element exists
    if (!document.body) {
        console.error("Document body not found. Cannot apply theme.");
        return;
    }

    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("swiftel-theme", theme); // Save user preference

    // Update the main toggle button icon
    const icon = themeToggleButton.querySelector("i");
    if (icon) {
        icon.classList.remove("fa-sun", "fa-moon", "fa-desktop");
        if (theme === "light") {
            icon.classList.add("fa-sun");
        } else if (theme === "dark") {
            icon.classList.add("fa-moon");
        } else { // system
            icon.classList.add("fa-desktop");
        }
    }
}

// Function to get the preferred theme (from localStorage or system)
function getPreferredTheme() {
    const storedTheme = localStorage.getItem("swiftel-theme");
    if (storedTheme) {
        return storedTheme; // User has a saved preference
    }

    // No saved preference, detect system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Initial theme application on page load
document.addEventListener("DOMContentLoaded", () => {
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    // If the initial theme is 'system', we need to listen for system changes
    // even if it initially loaded as 'light' or 'dark' based on system
    if (initialTheme === 'system' || !localStorage.getItem("swiftel-theme")) {
        // Listen for changes in system theme preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only re-apply system theme if user hasn't explicitly chosen light/dark
            if (localStorage.getItem("swiftel-theme") === 'system' || !localStorage.getItem("swiftel-theme")) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
});

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
            applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } else {
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