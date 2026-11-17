
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBVYRo2uicL9_-9WCXFc5P3Oe0lBX3r0Ic",
    authDomain: "campusfind-c9b2d.firebaseapp.com",
    projectId: "campusfind-c9b2d",
    storageBucket: "campusfind-c9b2d.firebasestorage.app",
    messagingSenderId: "657757999102",
    appId: "1:657757999102:web:834df36eed9267f7833aaf"
};


// FIREBASE CONNECTION
export const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const studentId = document.getElementById("studentId").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("message");

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match!";
            message.style.color = "red";
            return;
        }

        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await setDoc(doc(db, "students", result.user.uid), {
                fullName: fullName,
                email: email,
                studentId: studentId,
                createdAt: serverTimestamp()
            });

            await sendEmailVerification(result.user);

            message.textContent = "Account created! Please verify your email.";
            message.style.color = "green";

        } catch (error) {
            message.textContent = "Error: " + error.message;
            message.style.color = "red";
        }
    });
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            if (!result.user.emailVerified) {
                await signOut(auth);
                message.textContent = "Please verify your email first.";
                message.style.color = "red";
                return;
            }

            window.location.href = "dashboard.html";

        } catch (error) {
            message.textContent = "Invalid email or password.";
            message.style.color = "red";
        }
    });
}


// FORGOT PASSWORD
const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
    forgotPassword.addEventListener("click", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const message = document.getElementById("loginMessage");

        if (!email) {
            message.textContent = "Please enter your email first.";
            message.style.color = "red";
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            message.textContent = "Password reset link sent! Check your email.";
            message.style.color = "green";

        } catch (error) {
            message.textContent = error.code;
            message.style.color = "red";
        }
    });
}


// DASHBOARD SECURITY
const studentEmail = document.getElementById("studentEmail");

if (studentEmail) {
    onAuthStateChanged(auth, function(user) {

        if (user && user.emailVerified) {
            studentEmail.textContent = user.email;
        } else {
            window.location.href = "login.html";
        }

    });
}


// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function() {
        await signOut(auth);
        window.location.href = "login.html";
    });
}
