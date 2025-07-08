
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    const apiUrl = 'http://localhost:3000/api';

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    const registerUsernameInput = document.getElementById('register-username');
    const usernameError = document.getElementById('username-error');
    const registerBtn = document.getElementById('register-btn');

    let isUsernameUnique = false;

    registerUsernameInput.addEventListener('input', async () => {
        const username = registerUsernameInput.value;
        if (username.length > 2) {
            try {
                const response = await fetch(`${apiUrl}/users/check-username`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                const data = await response.json();
                if (data.isUnique) {
                    usernameError.style.display = 'none';
                    isUsernameUnique = true;
                    registerBtn.disabled = false;
                } else {
                    usernameError.textContent = 'Username already taken.';
                    usernameError.style.display = 'block';
                    isUsernameUnique = false;
                    registerBtn.disabled = true;
                }
            } catch (error) {
                console.error('Error checking username:', error);
            }
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isUsernameUnique) {
            alert('Please choose a unique username.');
            return;
        }
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const email = document.getElementById('register-email').value;
        const role = 'Employee'; // Default role

        try {
            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, role })
            });
            if (response.ok) {
                alert('Registration successful!');
                showLogin.click();
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert('Error during registration.');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('role', data.role);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userId', data.id);
                window.location.href = '/dashboard.html'; // Redirect to dashboard
            } else {
                alert('Login failed. Check your credentials.');
            }
        } catch (error) {
            alert('Error during login.');
        }
    });
});
