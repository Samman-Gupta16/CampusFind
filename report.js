
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const reportForm = document.getElementById("reportForm");
const reportMessage = document.getElementById("reportMessage");

let currentUser = null;

onAuthStateChanged(auth, function(user) {
    if (user && user.emailVerified) {
        currentUser = user;
    } else {
        window.location.href = "login.html";
    }
});

reportForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!currentUser) {
        reportMessage.textContent = "Please login first.";
        return;
    }

    const reportData = {
        type: document.getElementById("itemType").value,
        itemName: document.getElementById("itemName").value.trim(),
        category: document.getElementById("category").value.trim(),
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        ownerUid: currentUser.uid,
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "items"), reportData);

        reportMessage.textContent = "Report submitted successfully!";
        reportMessage.style.color = "green";
        reportForm.reset();

    } catch (error) {
        reportMessage.textContent = "Error: " + error.message;
        reportMessage.style.color = "red";
    }
});
