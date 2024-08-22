import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "1:776527209997:web:efaad230213394c4da1744"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addInvoice() {
    const date = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const amount = document.getElementById('amount').value;
    const number = document.getElementById('number').value;
    const provider = document.getElementById('provider').value;
    const paidBy = document.getElementById('paidBy').value;

    try {
        await addDoc(collection(db, 'invoices'), {
            date,
            dueDate,
            amount,
            number,
            provider,
            paidBy
        });
        console.log('Invoice added!');
        displayInvoices(); // Rafraîchir la liste
    } catch (e) {
        console.error('Error adding document: ', e);
    }
}

async function displayInvoices() {
    const invoiceTable = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
    invoiceTable.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, 'invoices'));
        querySnapshot.forEach((doc) => {
            const invoice = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.date}</td>
                <td>${invoice.dueDate}</td>
                <td>${invoice.amount}</td>
                <td>${invoice.number}</td>
                <td>${invoice.provider}</td>
                <td>${invoice.paidBy}</td>
                <td>
                    <button onclick="editInvoice('${doc.id}')">Edit</button>
                    <button onclick="deleteInvoice('${doc.id}')">Delete</button>
                </td>
            `;
            invoiceTable.appendChild(row);
        });
    } catch (e) {
        console.error('Error getting documents: ', e);
    }
}

async function deleteInvoice(id) {
    try {
        await deleteDoc(doc(db, 'invoices', id));
        console.log('Invoice deleted!');
        displayInvoices(); // Rafraîchir la liste
    } catch (e) {
        console.error('Error deleting document: ', e);
    }
}

// Call displayInvoices when the page loads
window.onload = displayInvoices;
