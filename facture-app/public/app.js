// public/app.js
import { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, auth, signInWithEmailAndPassword, signOut } from './firebase-config.js';

// Sélecteurs DOM
const tableBody = document.getElementById('invoiceTableBody');
const addInvoiceForm = document.getElementById('addInvoiceForm');
const invoiceNumberInput = document.getElementById('invoiceNumber');
const invoiceDateInput = document.getElementById('invoiceDate');
const dueDateInput = document.getElementById('dueDate');
const amountInput = document.getElementById('amount');
const providerInput = document.getElementById('provider');
const paymentMethodInput = document.getElementById('paymentMethod');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const logoutButton = document.getElementById('logoutButton');

// Collection Firestore
const invoicesCollection = collection(db, 'invoices');

// Fonction pour récupérer les factures
async function fetchInvoices() {
  tableBody.innerHTML = '';
  const querySnapshot = await getDocs(invoicesCollection);
  querySnapshot.forEach((doc) => {
    const invoice = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${invoice.invoiceNumber}</td>
      <td>${invoice.invoiceDate}</td>
      <td>${invoice.dueDate}</td>
      <td>${invoice.amount}</td>
      <td>${invoice.provider}</td>
      <td>${invoice.paymentMethod}</td>
      <td>
        <button onclick="editInvoice('${doc.id}')">Modifier</button>
        <button onclick="deleteInvoice('${doc.id}')">Supprimer</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Fonction pour ajouter une facture
async function addInvoice(event) {
  event.preventDefault();
  try {
    await addDoc(invoicesCollection, {
      invoiceNumber: invoiceNumberInput.value,
      invoiceDate: invoiceDateInput.value,
      dueDate: dueDateInput.value,
      amount: amountInput.value,
      provider: providerInput.value,
      paymentMethod: paymentMethodInput.value
    });
    fetchInvoices();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

// Fonction pour supprimer une facture
async function deleteInvoice(id) {
  try {
    await deleteDoc(doc(db, 'invoices', id));
    fetchInvoices();
  } catch (error) {
    console.error("Error removing document: ", error);
  }
}

// Fonction pour modifier une facture
async function editInvoice(id) {
  const invoiceDoc = doc(db, 'invoices', id);
  const newAmount = prompt("Enter new amount:");
  try {
    await updateDoc(invoiceDoc, {
      amount: newAmount
    });
    fetchInvoices();
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

// Fonction de connexion
async function login(event) {
  event.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    console.log('User logged in');
    fetchInvoices();
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

// Fonction de déconnexion
async function logout() {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Écouteurs d'événements
addInvoiceForm.addEventListener('submit', addInvoice);
loginForm.addEventListener('submit', login);
logoutButton.addEventListener('click', logout);

// Vérifier l'état de connexion
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user);
    fetchInvoices();
  } else {
    console.log('No user is signed in');
    tableBody.innerHTML = '<tr><td colspan="7">Veuillez vous connecter pour voir les factures.</td></tr>';
  }
});
