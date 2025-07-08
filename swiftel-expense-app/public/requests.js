
document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('request-form');
    const requestList = document.getElementById('request-list');
    const requestFormSection = document.getElementById('request-form-section');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const userManagementLink = document.getElementById('user-management-link');

    const apiUrl = 'http://localhost:3000/api';
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    welcomeMessage.textContent = `Welcome, ${username}`;

    if (role === 'Admin') {
        userManagementLink.style.display = 'block';
    }
    if (role === 'Employee') {
        requestFormSection.style.display = 'block';
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('request-description').value;
        const amount = document.getElementById('request-amount').value;

        const response = await fetch(`${apiUrl}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description, amount })
        });

        if (response.ok) {
            requestForm.reset();
            loadRequests();
        } else {
            alert('Request submission failed');
        }
    });

    async function loadRequests() {
        const response = await fetch(`${apiUrl}/requests`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const requests = await response.json();
        requestList.innerHTML = '';
        const currentUserId = parseInt(localStorage.getItem('userId'));

        requests.forEach(request => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${request.description}</td>
                <td>${request.amount}</td>
                <td><span class="status-${request.status}">${request.status}</span></td>
                <td class="decisions-cell"></td>
                <td class="actions"></td>
            `;

            const decisionsCell = tr.querySelector('.decisions-cell');
            const actionsCell = tr.querySelector('.actions');

            // Display individual employer decisions for Admin/Employer
            if (role === 'Admin' || role === 'Employer') {
                const currentEmployerDecision = request.decisions.find(d => d.employerId === currentUserId);
                const otherDecisions = request.decisions.filter(d => d.employerId !== currentUserId);

                let decisionsHtml = '';
                if (request.requestorUsername) {
                    decisionsHtml += `<div class="decision-entry">Requested by: <strong>${request.requestorUsername}</strong></div>`;
                }

                otherDecisions.forEach(decision => {
                    decisionsHtml += `<div class="decision-entry">${decision.employerUsername}: <span class="status-${decision.status}">${decision.status}</span></div>`;
                });

                if (role === 'Employer') {
                    if (currentEmployerDecision) {
                        decisionsHtml += `<div class="decision-entry">Your decision: <span class="status-${currentEmployerDecision.status}">${currentEmployerDecision.status}</span> <i class="fas fa-pencil-alt edit-decision-icon" data-requestid="${request.id}" data-currentstatus="${currentEmployerDecision.status}"></i></div>`;
                    } else {
                        decisionsHtml += `<div class="decision-entry">Your decision: <button class="btn-approve-decision">Approve</button> <button class="btn-disapprove-decision">Disapprove</button></div>`;
                    }
                }
                decisionsCell.innerHTML = decisionsHtml;
            }

            // Admin can delete any request, Employee can delete their own pending requests
            if (role === 'Admin' || (role === 'Employee' && request.userId === currentUserId && request.status === 'PENDING')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'btn-delete';
                deleteBtn.onclick = () => deleteRequest(request.id);
                actionsCell.appendChild(deleteBtn);
            }

            requestList.appendChild(tr);
        });
    }

    async function makeDecision(requestId, status) {
        const response = await fetch(`${apiUrl}/requests/${requestId}/decision`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadRequests();
        } else {
            const errorData = await response.json();
            alert(`Failed to record decision: ${errorData.message || 'Unknown error'}`);
        }
    }

    // Event delegation for decision buttons and edit icon
    requestList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-approve-decision')) {
            const requestId = e.target.closest('[data-requestid]').dataset.requestid;
            makeDecision(requestId, 'APPROVED');
        } else if (e.target.classList.contains('btn-disapprove-decision')) {
            const requestId = e.target.closest('[data-requestid]').dataset.requestid;
            makeDecision(requestId, 'DISAPPROVED');
        } else if (e.target.classList.contains('edit-decision-icon')) {
            const requestId = e.target.closest('[data-requestid]').dataset.requestid;
            const currentStatus = e.target.dataset.currentstatus;
            const newStatus = prompt(`Current decision is ${currentStatus}. Enter new decision (APPROVED or DISAPPROVED):`);
            if (newStatus && (newStatus.toUpperCase() === 'APPROVED' || newStatus.toUpperCase() === 'DISAPPROVED')) {
                makeDecision(requestId, newStatus.toUpperCase());
            } else if (newStatus) {
                alert('Invalid decision. Please enter APPROVED or DISAPPROVED.');
            }
        }
    });

    async function deleteRequest(id) {
        if (!confirm('Are you sure you want to delete this request?')) return;

        const response = await fetch(`${apiUrl}/requests/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadRequests();
        } else {
            alert('Failed to delete request');
        }
    }

    loadRequests();
});
