console.log("Script loaded from:", window.location.pathname);

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

function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  animation.setDirection(isMenuOpen ? 1 : -1);
  animation.play();
  navMenu.classList.toggle('active', isMenuOpen);
  body.classList.toggle('no-scroll', isMenuOpen);
}

function closeMenu() {
  if (!isMenuOpen) return;
  isMenuOpen = false;
  animation.setDirection(-1);
  animation.play();
  navMenu.classList.remove('active');
  body.classList.remove('no-scroll');
}

if (hamburger) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
}

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

document.addEventListener('click', (e) => {
  if (isMenuOpen && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
    closeMenu();
  }
});

if (navMenu) {
  navMenu.addEventListener('touchmove', (e) => {
    if (isMenuOpen) e.preventDefault();
  }, { passive: false });
}

// ==================== SCROLL TO TOP BUTTON ====================
const scrollBtn = document.getElementById('scrollToTopBtn');

if (scrollBtn) {
  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==================== TESTIMONIALS CAROUSEL ====================
const carousel = document.querySelector('.testimonial-carousel');
const btnLeft = document.querySelectorAll('.carousel-btn.left');
const btnRight = document.querySelectorAll('.carousel-btn.right');

if (carousel && btnLeft.length && btnRight.length) {
  const scrollAmount = carousel.offsetWidth * 0.42 + 32;
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
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCountDisplay() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;
  cartCountEl.textContent = cart.length;
  cartCountEl.classList.add("cart-bounce");
  setTimeout(() => cartCountEl.classList.remove("cart-bounce"), 300);
}

function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCountDisplay();
}

function renderCartPage() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartEmptyMsg = document.getElementById("cart-empty");
  const cartSummary = document.getElementById("cart-summary");

  if (!cartItemsContainer || !cartEmptyMsg || !cartSummary) return;

  if (cart.length === 0) {
    cartEmptyMsg.style.display = "block";
    cartSummary.style.display = "none";
    return;
  }

  cartEmptyMsg.style.display = "none";
  cartSummary.style.display = "block";
  cartItemsContainer.innerHTML = "";

  let total = 0;
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

  cartSummary.innerHTML = `
    <p class="cart-total">Total: KES ${total.toLocaleString()}</p>
    <button class="clear-cart-btn" id="clear-cart-btn">Clear Cart</button>
  `;

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartPage();
      updateCartCountDisplay();
    });
  });

  document.getElementById("clear-cart-btn").addEventListener("click", () => {
  // Step 1: Clear memory + storage
  localStorage.removeItem("cart");
  cart = [];

  // Step 2: Clear DOM containers manually
  document.getElementById("cart-items").innerHTML = "";
  document.getElementById("cart-summary").innerHTML = "";

  // Step 3: Re-render clean state
  renderCartPage();
  updateCartCountDisplay();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCountDisplay();

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

  renderCartPage();
});