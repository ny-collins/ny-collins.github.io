
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">
<div align="left">
	<img src="https://github.com/K1rsN7/TechHaven/blob/master/img/logo.webp"></div>
	<br>

# TechHaven - Responsive Gadget Store

## 🌐 Live Demo  
[View Site on GitHub Pages](https://ny-collins.github.io/)

---

## 🧩 Project Overview

**TechHaven** is a fully responsive gadget retail website crafted from scratch using **HTML**, **CSS**, and **vanilla JavaScript**. Inspired by the layout of the Solus mental wellness template, TechHaven adapts that aesthetic to a modern e-commerce experience. It emphasizes clean structure, smooth interactivity, responsive layouts, and a polished user interface optimized for both mobile and desktop users.

---

## 🎨 Color System

The site uses a custom WCAG AA-compliant palette tailored for clarity, trust, and excitement:

| Role        | Color Name  | HEX       | Purpose |
|-------------|-------------|-----------|---------|
| Primary     | Coral Red   | `#ff6b6b` | Highlights CTA buttons and icons |
| Secondary   | Navy Blue   | `#1e2a38` | Used for headers, nav, and structural contrast |
| Accent      | Soft Blue   | `#4a90e2` | Adds vibrance and link highlights |
| Background  | Soft Gray   | `#f2f4f7` | Keeps content easy to read |

---

## 📱 Responsive Breakpoints

TechHaven uses a **mobile-first design** strategy with the following breakpoints:

- **Small (0–767px)**:
  - Stacked layout for all sections
  - Mobile nav with Lottie hamburger animation
  - Carousel and contact form fully responsive
  - Optimized spacing for narrow viewports

- **Medium (768–1023px)**:
  - 2-column layout for product grid and testimonial content
  - Carousel buttons repositioned for middle-sized screens
  - Consistent spacing and font scale adjustments

- **Large (1024px and above)**:
  - 3-column product grid and horizontal testimonial layout
  - Footer and FAQ sections aligned with full-width constraints
  - Layout matches Solus spacing conventions with TechHaven visuals

---

## 🚀 Key Features

- ✅ **Fully Responsive Layout** using CSS Flexbox and media queries  
- ✅ **Animated Lottie Hamburger Menu** (slide-in mobile nav)  
- ✅ **Internal Product Detail Pages** for each gadget  
- ✅ **Shopping Cart System** with persistent state via `localStorage`  
- ✅ **Dynamic Cart Page** rendering items stored in localStorage  
- ✅ **Stylized Product Cards** with hover effects and pricing  
- ✅ **Testimonial Carousel** with left-text/right-carousel layout and fade effect  
- ✅ **Accessible Contact Form** with floating labels and input focus transitions  
- ✅ **FAQ Section** with toggleable answers  
- ✅ **Scroll-to-Top Button**  
- ✅ **Trusted Partners Logo Marquee** with seamless scroll  
- ✅ **How It Works Section** with custom illustration and CTA  
- ✅ **Clean Grid System** using consistent `max-width` containers  
- ✅ **Semantic HTML5** structure with ARIA roles and labels  
- ✅ **WCAG AA Color Contrast Compliance**

---

## 🛒 Shopping Cart Details

- Products can be added to cart from detail pages  
- Cart contents are stored in `localStorage` for persistence  
- The `cart.html` page dynamically displays items, quantities, and totals  
- Item removal and cart-clearing functionality included (via buttons)  
- Consistent theming and layout across all pages

---

## 🧠 Creative Divergences from Solus Template

TechHaven creatively adapts the original Solus layout by:

- Rebranding the theme from mental wellness to consumer electronics  
- Building an internal product page system rather than using external links  
- Adding a persistent cart system and simulated e-commerce logic  
- Modifying the testimonial layout with carousel-like behavior  
- Redesigning the "How It Works" section for a tech buying journey  
- Using TechHaven-specific icons, assets, and color palette

---

## 🧪 Tools & Resources Used

- **Languages**: HTML5, CSS3, JavaScript (no frameworks)  
- **Animation**: Lottie (JSON hamburger icon)  
- **Icons**: FontAwesome  
- **Accessibility**: WebAIM & Coolors for contrast validation  
- **Hosting**: GitHub Pages  
- **Assets**: Custom images under `/assets/images` and Lottie JSON in `/assets/icons`

---

## 📝 How to Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/ny-collins/ny-collins.github.io.git
   ```

2. Navigate to the project folder and open `index.html` in your browser.

3. **Important Note**:  
   The animated hamburger menu may not load due to **CORS policy** when opening files locally. Use a live server (e.g. VS Code's Live Server extension) to preview correctly.
   This bash installation is for linux users or those who do not use VS Code extension
   ```bash
   npm install -g live-server
   live-server
   ```

---

## 🧾 License

This project is for **educational and non-commercial** use only.  
All icons, images, and animations used are credited to their original sources and follow usage terms where applicable.

---
