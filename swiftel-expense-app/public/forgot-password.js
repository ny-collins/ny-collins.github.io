
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const message = document.getElementById('message');
    const apiUrl = 'http://localhost:3000/api';

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            const response = await fetch(`${apiUrl}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                message.style.color = 'green';
            } else {
                message.textContent = data.message;
                message.style.color = 'red';
            }
        } catch (error) {
            message.textContent = 'An error occurred. Please try again.';
            message.style.color = 'red';
        }
    });
});
