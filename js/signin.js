
const email=document.getElementById("email");
const password=document.getElementById("password");
const emailReg=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;




async function signInValidation(e) {
    e.preventDefault();
    clearForms("emailContainer");
    clearForms("passwordContainer");

    let em = email.value.trim();
    let ps = password.value.trim();
    let isValid = true;

    if (em === "" || !emailReg.test(em)) {
        showError("emailContainer", "Enter valid email id");
        isValid = false;
    } 

    if (ps === "") {
        showError("passwordContainer", "Enter Password. It must not be blank");
        isValid = false;
    } 

    if (isValid) {
        try {
            let response = await fetch("https://695649a7b9b81bad7af29e76.mockapi.io/api/users");
            let users = await response.json();
            let user = users.find(u => u.email === em && u.password === ps);

            if (user) {
                localStorage.setItem("userEmail", user.email);
                localStorage.setItem("userId", user.id);
                localStorage.setItem("userName",user.name);
                localStorage.setItem("isadmin",String(user.isadmin === true));
                 if (user.isadmin===true) {
                    window.location.replace('./adminDashboard.html');
                } else {
                    window.location.replace('./dashboard.html');
                }
            } else {
                alert("No account found. Please create an account.");
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Something went wrong while checking account.");
        }
    }
}


function showError(id,msg){
    let parent=document.getElementById(id);
    let p=document.createElement('p');
    p.textContent=`* ${msg} *`;
    p.fontSize="18px";
    p.style.color="red";
    parent.appendChild(p);

}

function clearForms(id){
    let parent=document.getElementById(id);
    let errors=parent.querySelectorAll('p');
    errors.forEach(e=>{
        e.remove();
    })
}

function sendLink(){
    clearForms("newemailContainer");
    let isValid=true;
    const newEmail=document.getElementById("newemail").value;
    if(newEmail === "" || !emailReg.test(newEmail)){
    showError('newemailContainer', "Please enter valid email id");
    isValid = false;
    } else {
    clearForms("newemailContainer");
    }

    if(isValid){
    alert('Reset password link is sent successfully to your provided mail id');
    }
}




