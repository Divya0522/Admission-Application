# VVIT Admissions Portal

This is a web-based admission management system for **VVIT College**, 
allowing students to register, sign in, and manage their admission application. 
Applicants can fill out, edit, or delete their admission form before the final submission deadline date.

Major Features:

User Authentication
  Register new users
  Sign in using credentials
  Personalized dashboard based on their submissions

Admission Application Form
  Submit admission form with personal, academic, and contact details along with the file submissions too
  Upload qualification marksheet and rank card
  Validation of all required fields
  Extend the dead line if required

Form Management
  View all applications submitted by the logged-in user
  Edit or delete applications before the submission deadline
  Each form is linked to the specific logged-in user

Data Persistence
  All data is stored using a **MockAPI** (RESTful API simulation)
  Data is tied to each user via `userId` and `submittedBy`

Project Structure
 All the html pages are stored in html folder
 All the styles are mentioned in CSS folder
 All the JS is mentioned in JS folde
 The assets required are mentioned in assets folder


 Technologies used
    HTML5 & CSS3 – Frontend structure and styling
    JavaScript (ES6) – Form handling and user logic
    Font Awesome – Icons for buttons
    MockAPI – Used for simulating backend storage (`https://mockapi.io/`)

Admin credentials:
mail: admin@vvit.edu
password: 1234567890
for checking the registering of admin credentials are:(creating account)
mail:principal@vvit.edu
