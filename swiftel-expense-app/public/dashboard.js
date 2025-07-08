
document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const userRole = document.getElementById('user-role');
    const logoutBtn = document.getElementById('logout-btn');
    const userManagementLink = document.getElementById('user-management-link');

    const totalRequestsCount = document.getElementById('total-requests-count');
    const pendingRequestsCount = document.getElementById('pending-requests-count');
    const approvedRequestsCount = document.getElementById('approved-requests-count');
    const recentRequestsList = document.getElementById('recent-requests-list');
    const recentActivityUserHeader = document.getElementById('recent-activity-user-header');
    const quickSubmitSection = document.getElementById('quick-submit-section');
    const quickRequestForm = document.getElementById('quick-request-form');

    const apiUrl = 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    welcomeMessage.innerHTML = `Welcome, <span id="welcome-username">${username}</span>`;
    userRole.innerHTML = `ROLE: <span id="user-role-text">${role}</span>`;

    if (role === 'Admin') {
        userManagementLink.style.display = 'block';
    }

    if (role === 'Employee') {
        quickSubmitSection.style.display = 'block';
    } else {
        recentActivityUserHeader.style.display = 'table-cell'; // Show user column for Employer/Admin
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    quickRequestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('quick-request-description').value;
        const amount = document.getElementById('quick-request-amount').value;

        const response = await fetch(`${apiUrl}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description, amount })
        });

        if (response.ok) {
            quickRequestForm.reset();
            alert('Expense request submitted successfully!');
            loadDashboardData(); // Reload data after submission
        } else {
            alert('Failed to submit expense request.');
        }
    });

    async function loadDashboardData() {
        try {
            // Load Summary Counts
            const summaryResponse = await fetch(`${apiUrl}/dashboard/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!summaryResponse.ok) {
                const errorData = await summaryResponse.json();
                throw new Error(errorData.message || 'Failed to fetch summary data');
            }
            const summaryData = await summaryResponse.json();
            totalRequestsCount.textContent = summaryData.total;
            pendingRequestsCount.textContent = summaryData.pending;
            approvedRequestsCount.textContent = summaryData.approved;

            // Load Recent Requests
            const recentRequestsResponse = await fetch(`${apiUrl}/dashboard/recent-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!recentRequestsResponse.ok) {
                const errorData = await recentRequestsResponse.json();
                throw new Error(errorData.message || 'Failed to fetch recent requests');
            }
            const recentRequestsData = await recentRequestsResponse.json();
            recentRequestsList.innerHTML = '';
            recentRequestsData.forEach(request => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${request.description}</td>
                    <td>${request.amount}</td>
                    <td><span class="status-${request.status}">${request.status}</span></td>
                    ${role !== 'Employee' ? `<td>${request.username}</td>` : ''}
                `;
                recentRequestsList.appendChild(tr);
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            alert('Failed to load dashboard data.');
        }
    }

    loadDashboardData();
});
