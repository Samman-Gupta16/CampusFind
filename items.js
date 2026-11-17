
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
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

const container = document.getElementById("itemsContainer");
const pageTitle = document.getElementById("pageTitle");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const locationFilter = document.getElementById("locationFilter");
const resultCount = document.getElementById("resultCount");

const params = new URLSearchParams(window.location.search);
const selectedType = params.get("type");

let allItems = [];
let currentUser = null;


if (selectedType === "Lost" || selectedType === "Found") {
    pageTitle.textContent = selectedType + " Items";
} else {
    pageTitle.textContent = "All Campus Items";
}


// DISPLAY ITEMS

function displayItems(items) {

    container.innerHTML = "";

    resultCount.textContent = "Showing " + items.length + " item(s)";

    if (items.length === 0) {
        container.textContent = "No matching items found.";
        return;
    }

    items.forEach(function(item) {

        const card = document.createElement("div");
        card.className = "dashboard-card";

        const typeHeading = document.createElement("h3");
        typeHeading.textContent = item.type + " Item";

        const itemName = document.createElement("h2");
        itemName.textContent = item.itemName || "Unnamed Item";

        const category = document.createElement("p");
        category.textContent = "Category: " + (item.category || "Not specified");

        const description = document.createElement("p");
        description.textContent = item.description || "";

        const location = document.createElement("p");
        location.textContent = "Location: " + (item.location || "Not specified");

        card.append(
            typeHeading,
            itemName,
            category,
            description,
            location
        );

        // CLAIM BUTTON FOR FOUND ITEMS

        if (
            item.type === "Found" &&
            item.ownerUid !== currentUser.uid
        ) {

            const claimButton = document.createElement("button");

            claimButton.type = "button";
            claimButton.textContent = "Claim This Item";

            claimButton.addEventListener("click", function() {

                window.location.href =
                    "claim.html?itemId=" + encodeURIComponent(item.id);

            });

            card.appendChild(claimButton);

        }

        container.appendChild(card);

    });

}


// SEARCH AND FILTER

function filterItems() {

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value.toLowerCase();
    const locationText = locationFilter.value.trim().toLowerCase();

    const filteredItems = allItems.filter(function(item) {

        const name = (item.itemName || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const location = (item.location || "").toLowerCase();

        const matchesSearch =
            name.includes(searchText) ||
            category.includes(searchText) ||
            description.includes(searchText);

        const matchesCategory =
            !selectedCategory || category === selectedCategory;

        const matchesLocation =
            location.includes(locationText);

        return matchesSearch && matchesCategory && matchesLocation;

    });

    displayItems(filteredItems);

}


// LOAD ITEMS

onAuthStateChanged(auth, async function(user) {

    if (!user || !user.emailVerified) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    try {

        let itemsQuery;

        if (selectedType === "Lost" || selectedType === "Found") {

            itemsQuery = query(
                collection(db, "items"),
                where("type", "==", selectedType)
            );

        } else {

            itemsQuery = collection(db, "items");

        }

        const snapshot = await getDocs(itemsQuery);

        allItems = [];

        const categories = new Set();

        snapshot.forEach(function(itemDoc) {

            const item = itemDoc.data();

            allItems.push({
                ...item,
                id: itemDoc.id
            });

            if (item.category) {
                categories.add(item.category.trim());
            }

        });


        categories.forEach(function(category) {

            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);

        });

        displayItems(allItems);

    } catch (error) {

        container.textContent = "Unable to load items: " + error.message;
        console.error(error);

    }

});


// FILTER EVENTS

searchInput.addEventListener("input", filterItems);
categoryFilter.addEventListener("change", filterItems);
locationFilter.addEventListener("input", filterItems);


// LOGOUT

document.getElementById("logoutBtn").addEventListener("click", async function() {

    await signOut(auth);
    window.location.href = "login.html";

});
