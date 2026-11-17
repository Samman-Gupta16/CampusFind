
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
    collection,
    addDoc,
    query,
    where,
    getDocs,
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

const params = new URLSearchParams(window.location.search);
const itemId = params.get("itemId");

const claimForm = document.getElementById("claimForm");
const claimMessage = document.getElementById("claimMessage");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;
let currentItem = null;
let claimantName = "Student";

// CHECK LOGIN AND LOAD ITEM

onAuthStateChanged(auth, async function(user) {

    if (!user || !user.emailVerified) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    if (!itemId) {
        claimMessage.textContent = "Invalid item link.";
        claimForm.hidden = true;
        return;
    }

    try {

        // GET CLAIMANT NAME FROM OWN PROFILE

        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
            claimantName =
                studentSnap.data().fullName ||
                user.displayName ||
                "Student";
        }

        // LOAD ITEM

        const itemRef = doc(db, "items", itemId);
        const itemSnap = await getDoc(itemRef);

        if (!itemSnap.exists()) {
            claimMessage.textContent = "Item not found.";
            claimForm.hidden = true;
            return;
        }

        currentItem = itemSnap.data();

        if (currentItem.type !== "Found") {
            claimMessage.textContent =
                "Only Found Items can be claimed.";
            claimForm.hidden = true;
            return;
        }

        if (currentItem.ownerUid === user.uid) {
            claimMessage.textContent =
                "You cannot claim your own report.";
            claimForm.hidden = true;
            return;
        }

        document.getElementById("itemName").textContent =
            currentItem.itemName;

        document.getElementById("itemCategory").textContent =
            "Category: " + currentItem.category;

        document.getElementById("itemLocation").textContent =
            "Location: " + currentItem.location;

        // CHECK PREVIOUS CLAIM

        const previousClaimsQuery = query(
            collection(db, "claims"),
            where("itemId", "==", itemId),
            where("claimantUid", "==", user.uid)
        );

        const previousClaims = await getDocs(previousClaimsQuery);

        if (!previousClaims.empty) {
            claimMessage.textContent =
                "You have already submitted a claim for this item.";
            claimForm.hidden = true;
        }

    } catch (error) {

        claimMessage.textContent =
            "Unable to load item: " + error.message;

        claimForm.hidden = true;
        console.error(error);

    }

});


// SUBMIT CLAIM

claimForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!currentUser || !currentItem) {
        claimMessage.textContent =
            "Please wait for the item to load.";
        return;
    }

    const proofDescription =
        document.getElementById("proofDescription").value.trim();

    if (proofDescription.length < 10) {
        claimMessage.textContent =
            "Please enter at least 10 characters.";
        return;
    }

    try {

        // CHECK DUPLICATE AGAIN

        const previousClaimsQuery = query(
            collection(db, "claims"),
            where("itemId", "==", itemId),
            where("claimantUid", "==", currentUser.uid)
        );

        const previousClaims = await getDocs(previousClaimsQuery);

        if (!previousClaims.empty) {
            claimMessage.textContent =
                "You have already submitted a claim.";
            return;
        }

        // SAVE CLAIM WITH CLAIMANT NAME

        await addDoc(collection(db, "claims"), {

            itemId: itemId,
            claimantUid: currentUser.uid,
            claimantName: claimantName,
            ownerUid: currentItem.ownerUid,
            proofDescription: proofDescription,
            status: "Pending",
            createdAt: serverTimestamp()

        });

        claimMessage.textContent =
            "Claim submitted successfully! Waiting for item owner review.";

        claimMessage.style.color = "green";
        claimForm.reset();
        claimForm.hidden = true;

    } catch (error) {

        claimMessage.textContent = "Error: " + error.message;
        claimMessage.style.color = "red";
        console.error(error);

    }

});


// LOGOUT

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function() {
        await signOut(auth);
        window.location.href = "login.html";
    });
}
