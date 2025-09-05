

const adminEmails = ["admin@vvit.edu", "principal@vvit.edu"];
const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function signUpValidation(e) {
    e.preventDefault();
    let isValid = true;

    clearError("email");
    clearError("fullName");
    clearError("password");
    clearError("confirmPassword");

    let em = email.value.trim();
    let fn = fullName.value.trim();
    let ps = password.value;
    let cp = confirmPassword.value;

    if (em === "" || !emailReg.test(em)) {
        showError("email", "Please enter valid email address");
        isValid = false;
    }
    if (fn === "") {
        showError("fullName", "Please enter your full name");
        isValid = false;
    }
    if (ps === "") {
        showError("password", "Please enter password");
        isValid = false;
    } else if (ps.length < 6) {
        showError("password", "Password must be at least 6 characters");
        isValid = false;
    }
    if (cp === "") {
        showError("confirmPassword", "Please confirm password");
        isValid = false;
    } else if (ps !== cp) {
        showError("confirmPassword", "Passwords do not match");
        isValid = false;
    }

    if (isValid) {
        try {
             const isAdmin = adminEmails.some(adminEmail => adminEmail === em);
            const response = await fetch("https://6823f6a065ba058033986857.mockapi.io/api/job_application/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fn,
                    email: em,
                    password: ps,
                    isadmin: isAdmin
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create account');
            }

            const data = await response.json();
            alert("Account created successfully! Please sign in to continue.");
            window.location.href = "./signin.html";
        } catch (error) {
            console.error("Signup error:", error);
            alert("Failed to create account. Please try again.");
        }
    }
}


function showError(id, msg) {
    clearError(id);
    const input = document.getElementById(id);
    let ele = document.createElement('p');
    ele.textContent = `* ${msg} *`;
    ele.className = "error";
    ele.style.color = "red";
    ele.style.marginTop = "5px";
    ele.style.fontSize = "14px";
    input.insertAdjacentElement("afterend", ele);
}

function clearError(id) {
    const input = document.getElementById(id);
    const next = input.nextElementSibling;
    if (next && next.classList.contains("error")) {
        next.remove();
    }
}