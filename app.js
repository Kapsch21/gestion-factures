document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const contentDiv = document.getElementById('content');
    const invoiceForm = document.getElementById('invoice-form');
    const invoiceTableBody = document.getElementById('invoice-table-body');
    const invoices = [];

    // Connexion des utilisateurs
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('users.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(users => {
                const user = users.find(user => user.username === username && user.password === password);
                
                if (user) {
                    loginMessage.textContent = 'Connexion réussie !';
                    loginMessage.style.color = 'green';
                    loginForm.style.display = 'none';
                    contentDiv.style.display = 'block';
                } else {
                    loginMessage.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
                    loginMessage.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des utilisateurs :', error);
                loginMessage.textContent = 'Erreur de connexion. Veuillez réessayer plus tard.';
                loginMessage.style.color = 'red';
            });
    });

    // Ajout de facture
    invoiceForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const invoiceDate = document.getElementById('invoice-date').value;
        const dueDate = document.getElementById('due-date').value;
        const amount = document.getElementById('amount').value;
        const invoiceNumber = document.getElementById('invoice-number').value;
        const encodingNumber = document.getElementById('encoding-number').value;
        const supplierName = document.getElementById('supplier-name').value;
        const seenBy = document.getElementById('seen-by').value;
        const paymentMethod = document.getElementById('payment-method').value;
        const paidDate = document.getElementById('paid-date').value;
        const invoicePdf = document.getElementById('invoice-pdf').files[0];

        const reader = new FileReader();
        reader.onloadend = function() {
            const pdfData = reader.result;

            invoices.push({
                invoiceDate,
                dueDate,
                amount,
                invoiceNumber,
                encodingNumber,
                supplierName,
                seenBy,
                paymentMethod,
                paidDate,
                pdfData
            });

            renderInvoices();
            invoiceForm.reset();
        };

        if (invoicePdf) {
            reader.readAsDataURL(invoicePdf);
        }
    });

    // Afficher les factures
    function renderInvoices() {
        invoiceTableBody.innerHTML = '';
        invoices.forEach((invoice, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.invoiceDate}</td>
                <td>${invoice.dueDate}</td>
                <td>${invoice.amount}</td>
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.encodingNumber}</td>
                <td>${invoice.supplierName}</td>
                <td>${invoice.seenBy}</td>
                <td>${invoice.paymentMethod}</td>
                <td>${invoice.paidDate}</td>
                <td><a href="${invoice.pdfData}" target="_blank">Voir le PDF</a></td>
                <td><button onclick="deleteInvoice(${index})">Supprimer</button></td>
            `;
            invoiceTableBody.appendChild(row);
        });
    }

    // Supprimer une facture
    window.deleteInvoice = function(index) {
        invoices.splice(index, 1);
        renderInvoices();
    };

    // Trier les factures par date d'échéance
    document.getElementById('sort-by-due-date').addEventListener('click', () => {
        invoices.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        renderInvoices();
    });

    // Trier les factures par numéro d'encodage
    document.getElementById('sort-by-encoding-number').addEventListener('click', () => {
        invoices.sort((a, b) => a.encodingNumber.localeCompare(b.encodingNumber));
        renderInvoices();
    });
});
