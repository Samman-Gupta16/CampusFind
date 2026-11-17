
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBVYRo2uicL9_-9WCXFc5P3Oe0lBX3r0Ic",
    authDomain: "campusfind-c9b2d.firebaseapp.com",
    projectId: "campusfind-c9b2d",
    storageBucket: "campusfind-c9b2d.firebasestorage.app",
    messagingSenderId: "657757999102",
    appId: "1:657757999102:web:834df36eed9267f7833aaf"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;


// LOAD PROFILE

onAuthStateChanged(auth, async function(user) {

    if (!user || !user.emailVerified) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileStatus").textContent = "Verified";

    try {

        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {

            const data = studentSnap.data();

            document.getElementById("profileName").textContent =
                data.fullName || "Name not added";

            document.getElementById("profileStudentId").textContent =
                data.studentId || "Not added";

            document.getElementById("fullNameInput").value =
                data.fullName || "";

            document.getElementById("studentIdInput").value =
                data.studentId || "";

        }

        document.getElementById("editProfileBtn").hidden = false;

    } catch (error) {

        console.error(error);
        document.getElementById("profileName").textContent =
            "Unable to load profile";

    }

});


// OPEN EDIT PROFILE

document.getElementById("editProfileBtn").addEventListener("click", function() {

    document.getElementById("editProfileSection").hidden = false;
    this.hidden = true;

});


// SAVE PROFILE

document.getElementById("saveProfileBtn").addEventListener("click", async function() {

    const fullName = document.getElementById("fullNameInput").value.trim();
    const studentId = document.getElementById("studentIdInput").value.trim();

    const message = document.getElementById("saveMessage");

    if (!currentUser) {
        message.textContent = "Please login first.";
        return;
    }

    if (!fullName || !studentId) {
        message.textContent = "Please fill both fields.";
        message.style.color = "red";
        return;
    }

    try {

        const studentRef = doc(db, "students", currentUser.uid);

        await setDoc(studentRef, {
            fullName: fullName,
            studentId: studentId
        }, {
            merge: true
        });

        document.getElementById("profileName").textContent = fullName;
        document.getElementById("profileStudentId").textContent = studentId;

        document.getElementById("editProfileSection").hidden = true;
        document.getElementById("editProfileBtn").hidden = false;

        message.textContent = "Profile updated successfully!";
        message.style.color = "green";

    } catch (error) {

        message.textContent = "Error: " + error.message;
        message.style.color = "red";

    }

});


// LOGOUT

document.getElementById("logoutBtn").addEventListener("click", async function() {

    await signOut(auth);
    window.location.href = "login.html";

});
