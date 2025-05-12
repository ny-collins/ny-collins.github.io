document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Toggle hamburger menu
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('active');
            body.classList.toggle('nav-open');
        });
    }

    // Close menu when a nav link is clicked (mobile)
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('active');
                body.classList.remove('nav-open');
            }
        });
    });

    // Form submission handling
    const form = document.getElementById('contact-form');
    const formMessage = document.querySelector('.form-message');

    if (form && formMessage) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('#email').value;
            const message = form.querySelector('#message').value;

            if (email && message) {
                formMessage.textContent = 'Message sent successfully!';
                formMessage.classList.add('success');
                formMessage.classList.remove('error');
                form.reset();
            } else {
                formMessage.textContent = 'Please fill out all fields.';
                formMessage.classList.add('error');
                formMessage.classList.remove('success');
            }
        });
    }
});
