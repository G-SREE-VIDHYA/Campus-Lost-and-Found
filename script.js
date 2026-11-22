
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    Timestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyD-WGXCOgWrXmzdnXioKrwnoRrZTXpa_dM",
    authDomain: "campus-lost-and-found-9c6d5.firebaseapp.com",
    projectId: "campus-lost-and-found-9c6d5",
    storageBucket: "campus-lost-and-found-9c6d5.firebasestorage.app",
    messagingSenderId: "685299500295",
    appId: "1:685299500295:web:a326f5ea0304e37cd4f1a2"
};

// 2. INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase initialized successfully!");

// 3. HTML ELEMENTS
const itemsList = document.getElementById("itemsList");
const itemForm = document.getElementById("itemForm");
const claimForm = document.getElementById("claimForm");
const claimsList = document.getElementById("claimsList");

// 4. AUTHENTICATION
async function authenticateUser() {
    try {
        await signInAnonymously(auth);
        console.log("Anonymous authentication successful!");
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}

// 5. LOAD AND DISPLAY ITEMS
async function loadItems() {
    itemsList.textContent = "Loading items...";

    try {
        const snapshot = await getDocs(collection(db, "Items"));

        itemsList.replaceChildren();

        if (snapshot.empty) {
            itemsList.textContent = "No items found.";
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const item = docSnapshot.data();

            const card = document.createElement("div");
            card.className = "item-card";

            const name = document.createElement("h3");
            name.textContent = item.itemName || "Unnamed item";

            const description = document.createElement("p");
            description.textContent = item.description || "No description";

            const category = document.createElement("p");
            category.textContent = "Category: " + (item.category || "N/A");

            const type = document.createElement("p");
            type.textContent = "Type: " + (item.itemType || "N/A");

            const location = document.createElement("p");
            location.textContent = "Location: " + (item.location || "N/A");

            const status = document.createElement("p");
            status.textContent = "Status: " + (item.status || "N/A");

            card.append(
                name,
                description,
                category,
                type,
                location,
                status
            );

            itemsList.appendChild(card);
        });

        console.log("Items retrieved successfully!");
        console.log("Total items:", snapshot.size);

    } catch (error) {
        console.error("Error fetching items:", error);
        itemsList.textContent = "Unable to load items.";
    }
}

// 6. REPORT A NEW ITEM
itemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
        alert("Authentication is not ready. Please refresh.");
        return;
    }

    const button = itemForm.querySelector("button[type='submit']");
    button.disabled = true;

    const newItem = {
        itemName: document.getElementById("itemName").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("category").value,
        itemType: document.getElementById("itemType").value,
        location: document.getElementById("location").value.trim(),
        dateReported: Timestamp.now(),
        reportedBy: auth.currentUser.uid,
        status: "OPEN"
    };

    try {
        await addDoc(collection(db, "Items"), newItem);

        alert("Item reported successfully!");
        itemForm.reset();

        await loadItems();

        console.log("New item added successfully!");

    } catch (error) {
        console.error("Error adding item:", error);
        alert("Unable to submit report: " + error.message);
    } finally {
        button.disabled = false;
    }
});

// 7. CLAIM FORM - MANUAL ITEM NAME ENTRY
async function loadFoundItems() {
    console.log("Manual item entry enabled.");
}

// 8. SUBMIT A CLAIM
claimForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!auth.currentUser) {
        alert("Authentication is not ready. Please refresh.");
        return;
    }

    const itemName = document.getElementById("claimItem").value.trim();

    const description =
        document.getElementById("claimDescription").value.trim();

    if (!itemName || !description) {
        alert("Please enter the item name and claim explanation.");
        return;
    }

    const button = claimForm.querySelector("button[type='submit']");
    button.disabled = true;

    const newClaim = {
        itemName: itemName,
        userId: auth.currentUser.uid,
        claimDate: Timestamp.now(),
        claimDescription: description,
        claimStatus: "PENDING"
    };

    try {
        await addDoc(collection(db, "Claims"), newClaim);

        alert("Claim submitted successfully!");

        claimForm.reset();

        await loadMyClaims();

        console.log("New claim added successfully!");

    } catch (error) {
        console.error("Error submitting claim:", error);
        alert("Unable to submit claim: " + error.message);
    } finally {
        button.disabled = false;
    }
});

// 9. DISPLAY MY CLAIMS
async function loadMyClaims() {
    claimsList.textContent = "Loading your claims...";

    try {
        const q = query(
            collection(db, "Claims"),
            where("userId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        claimsList.replaceChildren();

        if (snapshot.empty) {
            claimsList.textContent = "You haven't submitted any claims yet.";
            console.log("No claims found for this user.");
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const claim = docSnapshot.data();

            const card = document.createElement("div");
            card.className = "item-card";

            const title = document.createElement("h3");
            title.textContent = "Item: " + claim.itemName;

            const description = document.createElement("p");
            description.textContent =
                "Explanation: " + claim.claimDescription;

            const status = document.createElement("p");
            status.textContent = "Status: " + claim.claimStatus;

            card.append(title, description, status);
            claimsList.appendChild(card);
        });

        console.log("Claims displayed:", snapshot.size);

    } catch (error) {
        console.error("Error loading claims:", error);
        claimsList.textContent = "Unable to load your claims.";
    }
}

// 10. START APPLICATION
async function startApplication() {
    try {
        await authenticateUser();

        await loadItems();
        await loadFoundItems();
        await loadMyClaims();

    } catch (error) {
        itemsList.textContent = "Authentication failed. Please refresh.";
    }
}

startApplication();
