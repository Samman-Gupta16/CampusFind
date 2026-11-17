
import { app } from "./firebase.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const claimsContainer = document.getElementById("claimsContainer");

onAuthStateChanged(auth, async (user) => {

    if (!user || !user.emailVerified) {
        window.location.href = "login.html";
        return;
    }

    loadClaims(user);
});

async function loadClaims(user) {

    claimsContainer.innerHTML = "Loading claims...";

    try {

        const q = query(
            collection(db, "claims"),
            where("ownerUid", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        claimsContainer.innerHTML = "";

        if (snapshot.empty) {
            claimsContainer.innerHTML = "<p>No claim requests found.</p>";
            return;
        }

        for (const claimDoc of snapshot.docs) {

            const claim = claimDoc.data();

            // Get actual item name using itemId
            let itemName = "Item details unavailable";

            if (claim.itemId) {
                try {
                    const itemSnapshot = await getDoc(
                        doc(db, "items", claim.itemId)
                    );

                    if (itemSnapshot.exists()) {
                        const itemData = itemSnapshot.data();
                        itemName = itemData.itemName || "Unknown Item";
                    }
                } catch (itemError) {
                    console.error("Error fetching item:", itemError);
                }
            }

            const currentStatus = claim.status || "Pending";

            const card = document.createElement("div");

            card.className = "dashboard-card";
            card.style.marginBottom = "20px";
            card.style.padding = "20px";
            card.style.background = "white";
            card.style.borderRadius = "12px";

            const heading = document.createElement("h3");
            heading.textContent = "Item: " + itemName;

            const claimant = document.createElement("p");
            claimant.textContent =
                "Claimant: " + (claim.claimantName || "Name unavailable");

            const proof = document.createElement("p");
            proof.textContent =
                "Proof: " + (claim.proofDescription || "No proof provided");

            const statusLine = document.createElement("p");
            statusLine.style.marginTop = "12px";

            const statusLabel = document.createElement("strong");
            statusLabel.textContent = "Status: ";

            const statusValue = document.createElement("span");
            statusValue.textContent = currentStatus;
            statusValue.style.fontWeight = "bold";

            statusLine.appendChild(statusLabel);
            statusLine.appendChild(statusValue);

            const options = document.createElement("select");

            options.style.padding = "10px 14px";
            options.style.marginTop = "12px";
            options.style.borderRadius = "7px";
            options.style.border = "1px solid #ccc";
            options.style.cursor = "pointer";
            options.style.background = "#f8f9fa";

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Options - Change Status";

            options.appendChild(defaultOption);

            ["Pending", "Approved", "Rejected"].forEach((status) => {

                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;

                options.appendChild(option);
            });

            options.addEventListener("change", async () => {

                const newStatus = options.value;

                if (!newStatus) return;

                if (
                    newStatus.toLowerCase() ===
                    currentStatus.toLowerCase()
                ) {
                    alert("This claim already has this status.");
                    options.value = "";
                    return;
                }

                const confirmChange = confirm(
                    "Are you sure you want to change status to " +
                    newStatus + "?"
                );

                if (!confirmChange) {
                    options.value = "";
                    return;
                }

                options.disabled = true;

                try {

                    await updateDoc(
                        doc(db, "claims", claimDoc.id),
                        {
                            status: newStatus
                        }
                    );

                    alert("Status changed to " + newStatus + " successfully!");

                    await loadClaims(user);

                } catch (error) {

                    console.error("Status update error:", error);

                    alert("Unable to update status: " + error.message);

                    options.disabled = false;
                    options.value = "";
                }
            });

            card.appendChild(heading);
            card.appendChild(claimant);
            card.appendChild(proof);
            card.appendChild(statusLine);
            card.appendChild(options);

            claimsContainer.appendChild(card);
        }

    } catch (error) {

        console.error("Error loading claims:", error);

        claimsContainer.innerHTML =
            "<p>Unable to load claims. Please try again.</p>";
    }
}
