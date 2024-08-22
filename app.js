// Importer les modules Firebase nécessaires
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
  try {
    await updateDoc(doc(db, 'invoices', id), {
      invoiceNumber,
      invoiceDate,
      dueDate,
      amount,
      provider,
      paymentMethod
    });
    fetchInvoices();
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

// Fonction pour se connecter
async function login(event) {
  event.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    fetchInvoices();
  } catch (error) {
    console.error("Error signing in: ", error);
  }
}

// Fonction pour se déconnecter
async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
}

// Ajouter des écouteurs d'événements
addInvoiceForm.addEventListener('submit', addInvoice);
loginForm.addEventListener('submit', login);
logoutButton.addEventListener('click', logout);

// Récupérer les factures lors du chargement
fetchInvoices();
