
document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const message = document.getElementById('message');
    const apiUrl = 'http://localhost:3000/api';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        message.textContent = 'Invalid or missing reset token.';
        message.style.color = 'red';
        return;
    }

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            message.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                message.style.color = 'green';
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
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
