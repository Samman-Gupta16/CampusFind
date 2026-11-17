
const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const studentId = document.getElementById("studentId").value;

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const message = document.getElementById("message");

        if (password !== confirmPassword) {

            message.textContent = "Passwords do not match!";
            message.style.color = "red";

            return;
        }

        message.textContent =
            "Form check successful! Real account is not created yet.";

        message.style.color = "green";

        console.log(name, email, studentId);

    });

}
