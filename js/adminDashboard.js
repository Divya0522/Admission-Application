const applicationsTableBody = document.getElementById('applicationsTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const detailModal = document.getElementById('detailModal');
const applicationDetailContent = document.getElementById('applicationDetailContent');
const closeDetailModal = document.getElementById('closeDetailModal');
const logoutBtn = document.getElementById('logout');
const deadlineForm = document.getElementById('deadlineForm');
const deadlineInput = document.getElementById('deadlineInput');
const currentDeadline = document.getElementById('currentDeadline');
const applicationsLink = document.getElementById('applicationsLink');
const settingsLink = document.getElementById('settingsLink');


let applications = [];
let currentDeadlineDate = null;


document.addEventListener('DOMContentLoaded', async function () {

    const isAdmin = localStorage.getItem('isadmin') === 'true';
    if (!isAdmin) {
        window.location.href = './signin.html';
        return;
    }

    const adminName = localStorage.getItem('userName');
    if (adminName) {
        document.getElementById('profileDisplay').textContent = adminName;
    }


    await loadApplications();
    await loadDeadline();


    setupEventListeners();
});


function setupEventListeners() {

    searchInput.addEventListener('input', filterApplications);
    statusFilter.addEventListener('change', filterApplications);

    closeDetailModal.addEventListener('click', () => {
        detailModal.classList.remove('active');
    });


    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = './signin.html';
    });

    deadlineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateDeadline();
    });


    applicationsLink.addEventListener('click', (e) => {
        e.preventDefault();
        applicationsLink.classList.add('active');
        settingsLink.classList.remove('active');
        document.querySelector('.deadline-controls').style.display = 'block';
        document.querySelector('.admin-controls').style.display = 'flex';
        document.querySelector('.table-responsive').style.display = 'block';
    });

    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        settingsLink.classList.add('active');
        applicationsLink.classList.remove('active');
        document.querySelector('.deadline-controls').style.display = 'none';
        document.querySelector('.admin-controls').style.display = 'none';
        document.querySelector('.table-responsive').style.display = 'none';

    });
}

async function loadApplications() {
    try {
        const response = await fetch('https://6823f6a065ba058033986857.mockapi.io/api/job_application/users');

        if (!response.ok) {
            throw new Error('Failed to fetch applications');
        }

        applications = await response.json();

        applications = applications.filter(app => app.admissionForm);

        renderApplications(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
        applicationsTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: var(--danger-color);">
              Failed to load applications. Please try again later.
            </td>
          </tr>
        `;
    }
}

function renderApplications(apps) {
    applicationsTableBody.innerHTML = '';

    if (apps.length === 0) {
        applicationsTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center;">
              No applications found.
            </td>
          </tr>
        `;
        return;
    }

    apps.forEach(app => {
        const status = app.admissionForm.status || 'Submitted';
        let statusClass = 'status-submitted';
        if (status === 'Approved') statusClass = 'status-approved';
        if (status === 'Rejected') statusClass = 'status-rejected';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${app.id}</td>
          <td>${app.admissionForm.name || 'N/A'}</td>
          <td>${app.admissionForm.course || 'N/A'}</td>
          <td>${app.admissionForm.email || 'N/A'}</td>
          <td>${app.admissionForm.phone || 'N/A'}</td>
          <td><span class="status-badge ${statusClass}">${status}</span></td>
          <td>
            <button class="action-btn btn-view view-btn" data-id="${app.id}">
              <i class="fas fa-eye"></i> View
            </button>
            ${status !== 'Approved' ? `
              <button class="action-btn btn-approve approve-btn" data-id="${app.id}">
                <i class="fas fa-check"></i> Approve
              </button>
            ` : ''}
            ${status !== 'Rejected' ? `
              <button class="action-btn btn-reject reject-btn" data-id="${app.id}">
                <i class="fas fa-times"></i> Reject
              </button>
            ` : ''}
          </td>
        `;

        applicationsTableBody.appendChild(row);
    });


    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewApplication(btn.dataset.id));
    });

    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            approveApplication(btn.dataset.id);
        });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            rejectApplication(btn.dataset.id);
        });
    });
}

function filterApplications() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;

    let filteredApps = applications;


    if (statusFilterValue !== 'all') {
        filteredApps = filteredApps.filter(app =>
            (app.admissionForm.status || 'Submitted') === statusFilterValue
        );
    }

    if (searchTerm) {
        filteredApps = filteredApps.filter(app => {
            return (
                (app.admissionForm.name && app.admissionForm.name.toLowerCase().includes(searchTerm)) ||
                (app.admissionForm.email && app.admissionForm.email.toLowerCase().includes(searchTerm)) ||
                (app.admissionForm.phone && app.admissionForm.phone.includes(searchTerm)) ||
                (app.id && app.id.toString().includes(searchTerm))
            );
        });
    }

    renderApplications(filteredApps);
}


async function viewApplication(appId) {
    try {
        applicationDetailContent.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-color);"></i>
            <p>Loading application details...</p>
          </div>
        `;
        detailModal.classList.add('active');

        const response = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${appId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch application: ${response.status}`);
        }

        const application = await response.json();

        if (!application || !application.admissionForm) {
            throw new Error('Invalid application data structure');
        }

        const status = application.admissionForm.status || 'Submitted';
        let statusClass = 'status-submitted';
        if (status === 'Approved') statusClass = 'status-approved';
        if (status === 'Rejected') statusClass = 'status-rejected';

        applicationDetailContent.innerHTML = `
          <div class="application-detail-view">
            <h2>Application Details</h2>
            
            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">Application ID:</span>
                <span class="detail-value">${application.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge ${statusClass}">${status}</span></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submitted On:</span>
                <span class="detail-value">${application.createdAt ? new Date(application.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Personal Information</h3>
              <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${application.admissionForm.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${application.admissionForm.dob || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Gender:</span>
                <span class="detail-value">${application.admissionForm.gender || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${application.admissionForm.email || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${application.admissionForm.phone || 'N/A'}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Academic Information</h3>
              <div class="detail-row">
                <span class="detail-label">Course Applied:</span>
                <span class="detail-value">${application.admissionForm.course || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Last Qualification:</span>
                <span class="detail-value">${application.admissionForm.qualification || 'N/A'}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Address</h3>
              <div class="detail-row">
                <span class="detail-value">${application.admissionForm.address || 'N/A'}</span>
              </div>
            </div>
            
            <div class="modal-actions">
              ${status !== 'Approved' ? `
                <button class="action-btn btn-approve" id="modalApprove" data-id="${application.id}">
                  <i class="fas fa-check"></i> Approve
                </button>
              ` : ''}
              ${status !== 'Rejected' ? `
                <button class="action-btn btn-reject" id="modalReject" data-id="${application.id}">
                  <i class="fas fa-times"></i> Reject
                </button>
              ` : ''}
              <button class="action-btn btn-view" id="modalClose">
                <i class="fas fa-times"></i> Close
              </button>
            </div>
          </div>
        `;

        // Set up modal button event listeners
        document.getElementById('modalApprove')?.addEventListener('click', async () => {
            try {
                document.getElementById('modalApprove').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                document.getElementById('modalApprove').disabled = true;

                await updateApplicationStatus(application.id, 'Approved');
                detailModal.classList.remove('active');
                loadApplications();
            } catch (err) {
                console.error('Approval failed:', err);
                alert('Approval failed. Please try again.');
            }
        });

        document.getElementById('modalReject')?.addEventListener('click', async () => {
            try {
                document.getElementById('modalReject').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                document.getElementById('modalReject').disabled = true;

                await updateApplicationStatus(application.id, 'Rejected');
                detailModal.classList.remove('active');
                loadApplications();
            } catch (err) {
                console.error('Rejection failed:', err);
                alert('Rejection failed. Please try again.');
            }
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            detailModal.classList.remove('active');
        });

    } catch (err) {
        console.error('Error loading application details:', err);
        applicationDetailContent.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger-color);"></i>
            <h3>Error Loading Application</h3>
            <p style="color: var(--danger-color);">${err.message}</p>
            <button class="action-btn btn-view" id="modalClose" style="margin-top: 1rem;">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
        `;
        document.getElementById('modalClose').addEventListener('click', () => {
            detailModal.classList.remove('active');
        });
    }
}


async function approveApplication(appId) {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
        await updateApplicationStatus(appId, 'Approved');
        loadApplications();
    } catch (err) {
        console.error('Approval failed:', err);
        alert('Failed to approve application. Please try again.');
    }
}


async function rejectApplication(appId) {
    if (!confirm('Are you sure you want to reject this application?')) return;

    try {
        await updateApplicationStatus(appId, 'Rejected');
        loadApplications();
    } catch (err) {
        console.error('Rejection failed:', err);
        alert('Failed to reject application. Please try again.');
    }
}

async function updateApplicationStatus(appId, status) {
    try {
        const response = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${appId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch application: ${response.status}`);
        }

        const application = await response.json();

        const updatedAdmissionForm = {
            ...application.admissionForm,
            status: status,
            statusUpdatedAt: new Date().toISOString()
        };

        const updateResponse = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                admissionForm: updatedAdmissionForm
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update application: ${updateResponse.status}`);
        }

        const updatedApp = await updateResponse.json();
        alert(`Application ${status.toLowerCase()} successfully!`);
        return updatedApp;

    } catch (err) {
        console.error('Error updating application status:', err);
        throw err;
    }
}

async function loadDeadline() {
    try {
        const adminId = localStorage.getItem("userId");
        if (!adminId) {
            throw new Error("Admin not logged in");
        }


        const response = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${adminId}`);

        if (response.ok) {
            const adminData = await response.json();

            if (adminData.applicationDeadline) {
                currentDeadlineDate = new Date(adminData.applicationDeadline);
                deadlineInput.valueAsDate = currentDeadlineDate;
                currentDeadline.textContent = `Current Deadline: ${currentDeadlineDate.toLocaleDateString()}`;
                return;
            }
        }

        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 30);
        currentDeadlineDate = defaultDeadline;
        deadlineInput.valueAsDate = defaultDeadline;
        currentDeadline.textContent = `Current Deadline: ${defaultDeadline.toLocaleDateString()}`;


        await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${adminId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                applicationDeadline: defaultDeadline.toISOString()
            })
        });

    } catch (err) {
        console.error('Error loading deadline:', err);

        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 30);
        currentDeadlineDate = defaultDeadline;
        deadlineInput.valueAsDate = defaultDeadline;
        currentDeadline.textContent = `Current Deadline: ${defaultDeadline.toLocaleDateString()}`;
    }
}

async function updateDeadline() {
    try {
        const newDeadline = new Date(deadlineInput.value);
        const adminId = localStorage.getItem("userId");

        if (isNaN(newDeadline.getTime())) {
            throw new Error('Invalid date');
        }

        const response = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${adminId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                applicationDeadline: newDeadline.toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update deadline');
        }

        currentDeadlineDate = newDeadline;
        currentDeadline.textContent = `Current Deadline: ${newDeadline.toLocaleDateString()}`;
        alert('Deadline updated successfully!');

    } catch (err) {
        console.error('Error updating deadline:', err);
        alert('Failed to update deadline. Please enter a valid date.');
    }
}
