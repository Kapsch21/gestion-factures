import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC9H6_YxzIoZ3sY9hPuZlQ1ITt7VSxMi6I",
    authDomain: "gestionfactures-d76dc.firebaseapp.com",
    projectId: "gestionfactures-d76dc",
    storageBucket: "gestionfactures-d76dc.appspot.com",
    messagingSenderId: "776527209997",
    appId: "1:776527209997:web:efaad230213394c4da1744"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sélecteurs DOM
const addInvoiceForm = document.getElementById('addInvoiceForm');
const invoiceTableBody = document.getElementById('invoiceTableBody');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const logoutButton = document.getElementById('logoutButton');
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const errorMessage = document.getElementById('errorMessage');

// Fonction pour ajouter une facture
async function addInvoice(event) {
    event.preventDefault();
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const amount = document.getElementById('amount').value;
    const provider = document.getElementById('provider').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paidDate = document.getElementById('paidDate').value; // Optionnel

    try {
        await addDoc(collection(db, 'invoices'), {
            invoiceNumber,
            invoiceDate,
            dueDate,
            amount,
            provider,
            paymentMethod,
            paidDate
        });
        fetchInvoices();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Fonction pour récupérer les factures
async function fetchInvoices() {
    invoiceTableBody.innerHTML = ''; // Efface les factures existantes
    try {
        const querySnapshot = await getDocs(collection(db, 'invoices'));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.invoiceNumber}</td>
                <td>${data.invoiceDate}</td>
                <td>${data.dueDate}</td>
                <td>${data.amount}</td>
                <td>${data.provider}</td>
                <td>${data.paymentMethod}</td>
                <td>${data.paidDate || ''}</td>
                <td>
                    <button onclick="editInvoice('${doc.id}')">Modifier</button>
                    <button onclick="deleteInvoice('${doc.id}')">Supprimer</button>
                    <button onclick="viewPDF('${doc.id}')">Voir PDF</button>
                </td>
            `;
            invoiceTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching documents: ", error);
    }
}

// Fonction pour supprimer une facture
async function deleteInvoice(id) {
    try {
        await deleteDoc(doc(db, 'invoices', id));
        fetchInvoices();
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}

// Fonction pour modifier une facture
async function editInvoice(id) {
    const invoiceNumber = prompt('Nouveau numéro de facture:');
    const invoiceDate = prompt('Nouvelle date de facture:');
    const dueDate = prompt('Nouvelle date d\'échéance:');
    const amount = prompt('Nouveau montant:');
    const provider = prompt('Nouveau fournisseur:');
    const paymentMethod = prompt('Nouvelle méthode de paiement:');
    const paidDate = prompt('Nouvelle date de paiement:'); // Optionnel
    try {
        await updateDoc(doc(db, 'invoices', id), {
            invoiceNumber,
            invoiceDate,
            dueDate,
            amount,
            provider,
            paymentMethod,
            paidDate
        });
        fetchInvoices();
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

// Fonction pour afficher le PDF
function viewPDF(id) {
    const pdfUrl = `path/to/your/pdf/${id}.pdf`; // Remplacez ce chemin par le chemin réel vers votre PDF
    window.open(pdfUrl, '_blank');
}

// Fonction de connexion
async function login(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        errorMessage.textContent = error.message;
    }
}

// Fonction de déconnexion
async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
}

// Événements
loginForm.addEventListener('submit', login);
logoutButton.addEventListener('click', logout);
addInvoiceForm.addEventListener('submit', addInvoice);

// Affiche la section appropriée selon l'état de l'utilisateur
onAuthStateChanged(auth, user => {
    if (user) {
        loginSection.style.display = 'none';
        appSection.style.display = 'block';
        fetchInvoices();
    } else {
        loginSection.style.display = 'block';
        appSection.style.display = 'none';
    }
});
