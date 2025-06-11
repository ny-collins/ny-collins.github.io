// ================= LOTTIE HAMBURGER SETUP ====================
const animation = lottie.loadAnimation({
  container: document.getElementById('hamburgerAnim'),
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: 'assets/animations/hamburger.json'
});

animation.setSpeed(3);

let isMenuOpen = false; 

const hamburger = document.getElementById('hamburgerLottie');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

// ==================== TOGGLE MENU ====================
function toggleMenu() {
  isMenuOpen = !isMenuOpen;

  animation.setDirection(isMenuOpen ? 1 : -1);
  animation.play();

  navMenu.classList.toggle('active', isMenuOpen);
  body.classList.toggle('no-scroll', isMenuOpen);
}

// ==================== CLOSE MENU FUNCTION ====================
function closeMenu() {
  if (!isMenuOpen) return;

  isMenuOpen = false;
  animation.setDirection(-1);
  animation.play();

  navMenu.classList.remove('active');
  body.classList.remove('no-scroll');
}

// ==================== EVENT LISTENERS ====================

// Click hamburger to toggle menu
hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// Close menu when clicking/tapping outside
document.addEventListener('click', (e) => {
  if (isMenuOpen && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
    closeMenu();
  }
});

// Optional: prevent touch scrolling when menu is open (mobile UX)
navMenu.addEventListener('touchmove', (e) => {
  if (isMenuOpen) e.preventDefault();
}, { passive: false });

// ==================== SCROLL TO TOP BUTTON ====================
const scrollBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
  scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==================== TESTIMONIALS CAROUSEL ====================
const carousel = document.querySelector('.testimonial-carousel');
const btnLeft = document.querySelectorAll('.carousel-btn.left');
const btnRight = document.querySelectorAll('.carousel-btn.right');

if (carousel && btnLeft.length && btnRight.length) {
  const scrollAmount = carousel.offsetWidth * 0.42 + 32; // 40% card + 2rem gap

  btnLeft.forEach(btn =>
    btn.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    })
  );

  btnRight.forEach(btn =>
    btn.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    })
  );
}

// ==================== FAQ ACCORDION TOGGLE ====================
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    item.classList.toggle('active');
  });
});