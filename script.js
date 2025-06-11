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

// ===================== CART SYSTEM =========================

// Retrieve cart or initialize empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// -------------------- Update Cart Count on Navbar --------------------
function updateCartCountDisplay() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;

  cartCountEl.textContent = cart.length;

  // Optional bounce animation
  cartCountEl.classList.add("cart-bounce");
  setTimeout(() => cartCountEl.classList.remove("cart-bounce"), 300);
}

// -------------------- Add Item to Cart --------------------
function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCountDisplay();
}

// -------------------- Render Cart Items (Only on cart.html) --------------------
function renderCartPage() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartEmptyMsg = document.getElementById("cart-empty");
  const cartSummary = document.getElementById("cart-summary");

  if (!cartItemsContainer || !cartSummary || !cartEmptyMsg) return;

  if (cart.length === 0) {
    cartEmptyMsg.style.display = "block";
    cartSummary.style.display = "none";
    return;
  }

  cartEmptyMsg.style.display = "none";
  cartSummary.style.display = "block";

  let total = 0;
  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const priceNumber = parseInt(item.price.replace(/[^\d]/g, ""));
    total += priceNumber;

    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="cart-item-price">${item.price}</p>
      </div>
      <button class="remove-btn" data-index="${index}" aria-label="Remove">&times;</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  // Cart total and clear button
  cartSummary.innerHTML = `
    <p class="cart-total">Total: KES ${total.toLocaleString()}</p>
    <button class="clear-cart-btn" id="clear-cart-btn">Clear Cart</button>
  `;

  // Event: remove single item
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartPage(); // Re-render
      updateCartCountDisplay();
    });
  });

  // Event: clear entire cart
  const clearBtn = document.getElementById("clear-cart-btn");
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("cart");
    cart = [];
    renderCartPage();
    updateCartCountDisplay();
  });
}

// -------------------- DOM Ready Setup --------------------
document.addEventListener("DOMContentLoaded", () => {
  updateCartCountDisplay();

  // Hook up product "Add to Cart" buttons
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = {
        name: btn.dataset.name,
        price: btn.dataset.price,
        image: btn.dataset.image,
      };
      addToCart(product);
    });
  });

  // If on cart.html, render cart page
  renderCartPage();
});
