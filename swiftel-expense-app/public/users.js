
document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('user-list');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const userManagementLink = document.getElementById('user-management-link');

    const apiUrl = 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (!token || role !== 'Admin') {
        window.location.href = '/login.html';
        return;
    }

    welcomeMessage.textContent = `Welcome, ${username}`;
    userManagementLink.style.display = 'block';

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    async function loadUsers() {
        const response = await fetch(`${apiUrl}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        userList.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <div class="actions-cell-content">
                        <select data-userid="${user.id}">
                            <option value="Employee" ${user.role === 'Employee' ? 'selected' : ''}>Employee</option>
                            <option value="Employer" ${user.role === 'Employer' ? 'selected' : ''}>Employer</option>
                            <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <i class="fas fa-trash-alt delete-icon" data-userid="${user.id}"></i>
                    </div>
                </td>
            `;
            userList.appendChild(tr);
        });
    }

    userList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-icon')) {
            const userId = e.target.dataset.userid;
            deleteUser(userId);
        }
    });

    userList.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT' && e.target.dataset.userid) {
            const userId = e.target.dataset.userid;
            const newRole = e.target.value;
            updateUserRole(userId, newRole);
        }
    });

    async function deleteUser(id) {
        console.log('Attempting to delete user with ID:', id);
        if (!confirm('Are you sure you want to delete this user?')) return;

        const response = await fetch(`${apiUrl}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
        } else {
            const errorData = await response.json();
            alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
        }
    }

    async function updateUserRole(id, role) {
        const response = await fetch(`${apiUrl}/users/${id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role })
        });

        if (!response.ok) {
            alert('Failed to update user role');
            loadUsers(); // Reload to reset dropdown
        }
    }

    loadUsers();
});
