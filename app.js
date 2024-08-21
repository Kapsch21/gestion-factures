// Charger les factures depuis le localStorage ou initialiser un tableau vide
let factures = JSON.parse(localStorage.getItem('factures')) || [];

// Fonction pour trier les factures
function trierFactures(par, ordre) {
    return factures.sort((a, b) => {
        if (ordre === 'asc') {
            return (a[par] < b[par]) ? -1 : (a[par] > b[par]) ? 1 : 0;
        } else {
            return (a[par] > b[par]) ? -1 : (a[par] < b[par]) ? 1 : 0;
        }
    });
}

// Fonction pour afficher toutes les factures
function afficherFactures() {
    const factureTableBody = document.querySelector('#factureTable tbody');
    factureTableBody.innerHTML = '';  // Vider la table avant de la remplir

    factures.forEach((facture, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${facture.fournisseur}</td>
            <td>${facture.numeroFacture}</td>
            <td>${facture.numeroEncodage}</td>
            <td>${facture.montant}€</td>
            <td>${facture.dateFacture}</td>
            <td>${facture.dateEcheance}</td>
            <td>${facture.approuvePar}</td>
            <td>${facture.datePaiement || 'Non payé'}</td>
            <td>${facture.modePaiement}</td>
            <td>
                <a href="${facture.pdfUrl}" target="_blank">Voir PDF</a>
                <button class="edit" data-index="${index}">Modifier</button>
                <button class="delete" data-index="${index}">Supprimer</button>
            </td>
        `;

        // Ajouter les boutons de modification et suppression
        tr.querySelector('.edit').addEventListener('click', modifierFacture);
        tr.querySelector('.delete').addEventListener('click', supprimerFacture);

        factureTableBody.appendChild(tr);
    });
}

// Ajouter une nouvelle facture ou mettre à jour une facture existante
document.getElementById('factureForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fournisseur = document.getElementById('fournisseur').value;
    const numeroFacture = document.getElementById('numeroFacture').value;
    const numeroEncodage = document.getElementById('numeroEncodage').value;
    const montant = document.getElementById('montant').value;
    const dateFacture = document.getElementById('dateFacture').value;
    const dateEcheance = document.getElementById('dateEcheance').value;
    const approuvePar = document.getElementById('approuvePar').value;
    const datePaiement = document.getElementById('datePaiement').value;
    const modePaiement = document.getElementById('modePaiement').value;

    const pdfFileInput = document.getElementById('pdfFile');
    const pdfFile = pdfFileInput.files[0];
    let pdfUrl = '';

    if (pdfFile) {
        // Créez un formulaire pour télécharger le fichier PDF sur un serveur ou un service de stockage
        const formData = new FormData();
        formData.append('pdfFile', pdfFile);

        fetch('/upload', {  // Assurez-vous que cette URL est celle de votre serveur de téléchargement
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            pdfUrl = data.fileUrl;  // Assurez-vous que le serveur renvoie l'URL du fichier PDF

            const facture = {
                fournisseur,
                numeroFacture,
                numeroEncodage,
                montant,
                dateFacture,
                dateEcheance,
                approuvePar,
                datePaiement,
                modePaiement,
                pdfUrl
            };

            const index = document.getElementById('factureForm').dataset.index;
            if (index !== undefined) {
                factures[index] = facture;  // Mise à jour de la facture existante
            } else {
                factures.push(facture);  // Ajout d'une nouvelle facture
            }

            // Sauvegarder les factures dans le localStorage
            localStorage.setItem('factures', JSON.stringify(factures));

            // Afficher les factures mises à jour
            afficherFactures();

            // Réinitialiser le formulaire
            document.getElementById('factureForm').reset();
            delete document.getElementById('factureForm').dataset.index;
        })
        .catch(error => console.error('Erreur de téléchargement :', error));
    } else {
        // Si aucun fichier n'est téléchargé, traiter normalement
        const facture = {
            fournisseur,
            numeroFacture,
            numeroEncodage,
            montant,
            dateFacture,
            dateEcheance,
            approuvePar,
            datePaiement,
            modePaiement
        };

        const index = document.getElementById('factureForm').dataset.index;
        if (index !== undefined) {
            factures[index] = facture;  // Mise à jour de la facture existante
        } else {
            factures.push(facture);  // Ajout d'une nouvelle facture
        }

        // Sauvegarder les factures dans le localStorage
        localStorage.setItem('factures', JSON.stringify(factures));

        // Afficher les factures mises à jour
        afficherFactures();

        // Réinitialiser le formulaire
        document.getElementById('factureForm').reset();
        delete document.getElementById('factureForm').dataset.index;
    }
});

// Modifier une facture
function modifierFacture(e) {
    const index = e.target.dataset.index;
    const facture = factures[index];

    document.getElementById('fournisseur').value = facture.fournisseur;
    document.getElementById('numeroFacture').value = facture.numeroFacture;
    document.getElementById('numeroEncodage').value = facture.numeroEncodage;
    document.getElementById('montant').value = facture.montant;
    document.getElementById('dateFacture').value = facture.dateFacture;
    document.getElementById('dateEcheance').value = facture.dateEcheance;
    document.getElementById('approuvePar').value = facture.approuvePar;
    document.getElementById('datePaiement').value = facture.datePaiement;
    document.getElementById('modePaiement').value = facture.modePaiement;

    // Mettre à jour le champ caché pour savoir quel index modifier
    document.getElementById('factureForm').dataset.index = index;

    // Ne pas afficher le PDF dans le visualiseur lors de la modification
    document.getElementById('pdfViewer').innerHTML = '';
}

// Supprimer une facture
function supprimerFacture(e) {
    const index = e.target.dataset.index;
    factures.splice(index, 1);  // Supprimer la facture de la liste

    // Sauvegarder les factures dans le localStorage
    localStorage.setItem('factures', JSON.stringify(factures));

    // Afficher les factures mises à jour
    afficherFactures();

    // Réinitialiser le visualiseur PDF
    document.getElementById('pdfViewer').innerHTML = '';
}

// Gestion des clics sur les boutons de tri
document.querySelectorAll('th button.sort').forEach(button => {
    button.addEventListener('click', function() {
        const sortBy = this.dataset.sort;
        const currentArrow = this.querySelector('.arrow');

        // Déterminer l'ordre de tri
        const currentSortOrder = currentArrow.textContent === '▼' ? 'asc' : 'desc';
        const newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';

        // Trier les factures
        factures = trierFactures(sortBy, newSortOrder);

        // Mettre à jour les flèches de tri
        document.querySelectorAll('th button.sort .arrow').forEach(arrow => {
            arrow.textContent = '▼';  // Mettre la flèche vers le bas
        });
        currentArrow.textContent = newSortOrder === 'asc' ? '▲' : '▼';  // Mettre la flèche vers le haut ou vers le bas

        // Sauvegarder les factures dans le localStorage
        localStorage.setItem('factures', JSON.stringify(factures));

        // Afficher les factures triées
        afficherFactures();
    });
});

// Afficher les factures au chargement de la page
afficherFactures();
