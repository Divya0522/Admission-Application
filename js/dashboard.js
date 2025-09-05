let currentEditId = null;

document.addEventListener('DOMContentLoaded', function () {

    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "./signin.html";
        return;
    }

    const userName = localStorage.getItem("userName");
    if (userName) {
        document.getElementById("profileDisplay").textContent = userName;
    }

    setupEventListeners();

    manageDashboard();

    showSection('application');
});


function setupEventListeners() {

    const navLinks = document.querySelectorAll(".navLink");
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute("data-section");
            showSection(section);
            setActiveNav(this);
        });
    });

    document.getElementById("closeModal").addEventListener('click', function () {
        document.getElementById("admissionModal").classList.remove("active");
    });


    document.getElementById("logout").addEventListener('click', function () {
        localStorage.clear();
        window.location.href = "./signin.html";
    });


    document.getElementById("admissionModal").addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.remove("active");
        }
    });
}


function showSection(sectionId) {

    const sections = document.querySelectorAll(".section-content");
    sections.forEach(section => {
        section.classList.remove("active");
    });


    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
        activeSection.classList.add("active");


        activeSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}


function setActiveNav(activeLink) {

    const navLinks = document.querySelectorAll(".navLink");
    navLinks.forEach(link => {
        link.classList.remove("active");
    });


    activeLink.classList.add("active");
}


async function manageDashboard() {
    const userId = localStorage.getItem("userId");
    const myFormsContainer = document.getElementById("myforms");

    try {
        const response = await fetch("https://6823f6a065ba058033986857.mockapi.io/api/job_application/users");
        const users = await response.json();

        const userApplications = users.filter(user =>
            user.submittedBy === userId && user.admissionForm
        );

        myFormsContainer.innerHTML = "";

        if (userApplications.length === 0) {
            showNoApplication();
        } else {
            showApplication(userApplications[0]);
        }
    } catch (err) {
        console.error("Error fetching data:", err);
        showErrorState();
    }
}


async function showNoApplication() {
    const deadline = await fetchApplicationDeadline();
    const today = new Date();
    const canEdit = today <= deadline;

    const myFormsContainer = document.getElementById("myforms");
    myFormsContainer.innerHTML = `
    <div class="no-application">
      <div class="no-application-icon">
        <i class="far fa-file-alt"></i>
      </div>
      <h2 class="no-application-title">No Application Found</h2>
      <p class="no-application-text">
        You haven't submitted any application yet. Click the button below to start your admission process.
        ${!canEdit ? `<br><strong>Note: The application deadline has passed (${deadline.toLocaleDateString()}).</strong>` : ''}
      </p>
      ${canEdit ? `
        <button class="btn btn-primary" id="createApplication">
          <i class="fas fa-plus"></i> Create Application
        </button>
      ` : ''}
    </div>
  `;
    document.querySelector(".deadlineNotice").innerHTML = `
    <i class="fas fa-exclamation-circle"></i>&nbsp;&nbsp;&nbsp;Last date to apply: ${deadline.toLocaleDateString()}
  `;

    if (canEdit) {
        document.getElementById("createApplication").addEventListener('click', function () {
            currentEditId = null;
            resetForm();
            document.getElementById("admissionModal").classList.add("active");
        });
    }
}

async function showApplication(application) {
    const deadline = await fetchApplicationDeadline();
    const today = new Date();
    const canEdit = today <= deadline;

    let statusClass = 'statusSubmitted';
    let statusText = application.admissionForm?.status || 'Submitted';

    if (statusText === 'Approved') {
        statusClass = 'statusApproved';
    } else if (statusText === 'Rejected') {
        statusClass = 'statusRejected';
    }

    const myFormsContainer = document.getElementById("myforms");
    myFormsContainer.innerHTML = `
    <div class="appContainer">
      <div class="appHeader">
        <h2 class="appTitle">Admission Application</h2>
        <span class="appStatus ${statusClass}">${statusText}</span>
      </div>
      
      <div class="appDetails">
        <div class="detailItem">
          <span class="detailLabel">Full Name</span>
          <span class="detailValue">${application.admissionForm.name || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Date of Birth</span>
          <span class="detailValue">${application.admissionForm.dob || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Email</span>
          <span class="detailValue">${application.admissionForm.email || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Phone</span>
          <span class="detailValue">${application.admissionForm.phone || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Gender</span>
          <span class="detailValue">${application.admissionForm.gender || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Course Applied</span>
          <span class="detailValue">${application.admissionForm.course || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Qualification</span>
          <span class="detailValue">${application.admissionForm.qualification || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Address</span>
          <span class="detailValue">${application.admissionForm.address || 'Not provided'}</span>
        </div>
        
        <div class="detailItem">
          <span class="detailLabel">Submission Date</span>
          <span class="detailValue">${application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown'}</span>
        </div>
      </div>
      
      <div class="actionButtons">
        ${canEdit ? `
          <button class="btn btn-primary" id="editApplication" data-id="${application.id}">
            <i class="fas fa-edit"></i> Edit Application
          </button>
          <button class="btn btn-danger" id="deleteApplication" data-id="${application.id}">
            <i class="fas fa-trash"></i> Delete Application
          </button>
        ` : `
          <button class="btn btn-outline" disabled>
            <i class="fas fa-info-circle"></i> Editing closed after deadline (${deadline.toLocaleDateString()})
          </button>
        `}
      </div>
    </div>
  `;

    document.querySelector(".deadlineNotice").innerHTML = `
    <i class="fas fa-exclamation-circle"></i>&nbsp;&nbsp;&nbsp;Last date to apply: ${deadline.toLocaleDateString()}
  `;

    if (canEdit) {
        document.getElementById("editApplication").addEventListener('click', function () {
            currentEditId = application.id;
            loadFormData(application);
            document.getElementById("admissionModal").classList.add("active");
        });

        document.getElementById("deleteApplication").addEventListener('click', async function () {
            const confirmDelete = confirm("Are you sure you want to delete your application? This action cannot be undone.");
            if (!confirmDelete) return;

            try {
                const res = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${application.id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    alert("Application deleted successfully.");
                    manageDashboard();
                } else {
                    alert("Failed to delete application. Please try again.");
                }
            } catch (err) {
                console.error("Delete error:", err);
                alert("An error occurred while deleting. Please try again.");
            }
        });
    }
}
function showErrorState() {
    const myFormsContainer = document.getElementById("myforms");
    myFormsContainer.innerHTML = `
        <div class="no-application">
          <div class="no-application-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2 class="no-application-title">Error Loading Application</h2>
          <p class="no-application-text">
            Something went wrong while loading your application. Please try again later.
          </p>
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="fas fa-sync-alt"></i> Try Again
          </button>
        </div>
      `;
}


function loadFormData(application) {
    document.getElementById("modal-name").value = application.admissionForm.name || '';
    document.getElementById("modal-dob").value = application.admissionForm.dob || '';
    document.getElementById("modal-email").value = application.admissionForm.email || '';
    document.getElementById("modal-phone").value = application.admissionForm.phone || '';
    document.getElementById("modal-qualification").value = application.admissionForm.qualification || '';
    document.getElementById("modal-course").value = application.admissionForm.course || '';
    document.getElementById("modal-address").value = application.admissionForm.address || '';

    if (application.admissionForm.gender) {
        const genderRadio = document.querySelector(`input[name="modal-gender"][value="${application.admissionForm.gender}"]`);
        if (genderRadio) {
            genderRadio.checked = true;
        }
    }
}


function resetForm() {
    document.getElementById("admissionForm").reset();
}


async function submitAdmission(event) {
    event.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User not identified. Please log in first.");
        return;
    }


    const name = document.getElementById("modal-name").value.trim();
    const dob = document.getElementById("modal-dob").value;
    const email = document.getElementById("modal-email").value.trim();
    const phone = document.getElementById("modal-phone").value.trim();
    const qualification = document.getElementById("modal-qualification").value.trim();
    const course = document.getElementById("modal-course").value;
    const address = document.getElementById("modal-address").value.trim();


    const genderInputs = document.querySelectorAll('input[name="modal-gender"]');
    let gender = "";
    genderInputs.forEach(radio => {
        if (radio.checked) gender = radio.value;
    });

    if (!gender) {
        alert("Please select your gender.");
        return;
    }


    const admissionForm = {
        name,
        dob,
        email,
        phone,
        gender,
        course,
        qualification,
        address,
        submissionDate: new Date().toISOString(),
        status: "Submitted"
    };

    try {
        let response;

        if (currentEditId) {

            response = await fetch(`https://6823f6a065ba058033986857.mockapi.io/api/job_application/users/${currentEditId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    admissionForm,
                    submittedBy: userId
                })
            });
        } else {

            const formPayload = {
                submittedBy: userId,
                admissionForm,
                status: "Submitted",
                createdAt: new Date().toISOString()
            };

            response = await fetch("https://6823f6a065ba058033986857.mockapi.io/api/job_application/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formPayload)
            });
        }

        if (response.ok) {
            alert(`Application ${currentEditId ? 'updated' : 'submitted'} successfully!`);
            document.getElementById("admissionModal").classList.remove("active");
            manageDashboard();
        } else {
            alert("Failed to submit. Please try again.");
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred. Please try again later.");
    }
}
async function fetchApplicationDeadline() {
    try {

        const response = await fetch("https://6823f6a065ba058033986857.mockapi.io/api/job_application/users");
        if (response.ok) {
            const users = await response.json();

            const adminWithDeadline = users.find(user =>
                user.isadmin === true && user.applicationDeadline
            );

            if (adminWithDeadline) {
                return new Date(adminWithDeadline.applicationDeadline);
            }


            const userWithDeadline = users.find(user => user.applicationDeadline);
            if (userWithDeadline) {
                return new Date(userWithDeadline.applicationDeadline);
            }
        }


        return new Date('2025-06-30');
    } catch (error) {
        console.error("Error fetching deadline:", error);
        return new Date('2025-06-30');
    }
}