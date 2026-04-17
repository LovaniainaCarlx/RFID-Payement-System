const API = 'http://localhost:3000';

// Navigation entre pages
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  if (pageId === 'users') loadUsers();
  if (pageId === 'transactions') loadTransactions();
  if (pageId === 'dashboard') loadDashboard();
}

// Dashboard
async function loadDashboard() {
  const users = await fetch(`${API}/api/users`).then(r => r.json());
  const transactions = await fetch(`${API}/api/transactions`).then(r => r.json());

  document.getElementById('total-users').textContent = users.length;
  document.getElementById('total-transactions').textContent = transactions.length;
}

// Charger les utilisateurs
async function loadUsers() {
  const users = await fetch(`${API}/api/users`).then(r => r.json());
  const tbody = document.getElementById('users-table');
  tbody.innerHTML = '';

  users.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.id}</td> 
        <td>${u.uid_rfid}</td>
        <td>${u.nom}</td>
        <td>${u.email || '-'}</td>
        <td>${u.solde} Ar</td>
        <td>${new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
      </tr>
    `;
  });
}

// Ajouter un utilisateur
async function addUser() {
  const uid = document.getElementById('uid').value;
  const nom = document.getElementById('nom').value;
  const email = document.getElementById('email').value;

  if (!uid || !nom) {
    alert('UID et Nom sont obligatoires !');
    return;
  }

  const res = await fetch(`${API}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid_rfid: uid, nom, email })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);
    document.getElementById('uid').value = '';
    document.getElementById('nom').value = '';
    document.getElementById('email').value = '';
    loadUsers();
  } else {
    alert('Erreur : ' + data.error);
  }
}

// Charger les transactions
async function loadTransactions() {
  const transactions = await fetch(`${API}/api/transactions`).then(r => r.json());
  const tbody = document.getElementById('transactions-table');
  tbody.innerHTML = '';

  transactions.forEach(t => {
    tbody.innerHTML += `
      <tr>
        <td>${t.nom || '-'}</td>
        <td>${t.montant} Ar</td>
        <td><span class="badge-${t.type}">${t.type}</span></td>
        <td>${t.description || '-'}</td>
        <td>${new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
      </tr>
    `;
  });
}

// Ajouter une transaction
async function addTransaction() {
  const user_id = document.getElementById('t-user-id').value;
  const montant = document.getElementById('t-montant').value;
  const type = document.getElementById('t-type').value;
  const description = document.getElementById('t-description').value;

  if (!user_id || !montant) {
    alert('ID utilisateur et montant sont obligatoires !');
    return;
  }

  const res = await fetch(`${API}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, montant, type, description })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);
    document.getElementById('t-user-id').value = '';
    document.getElementById('t-montant').value = '';
    document.getElementById('t-description').value = '';
    loadTransactions();
  } else {
    alert('Erreur : ' + data.error);
  }
}

// Scan en temps réel - vérifie toutes les 2 secondes
let lastUID = null;

async function checkScan() {
  try {
    const res = await fetch(`${API}/api/scan/last`, {
      headers: { 'x-api-key': 'rfid_secret_key_123' }
    });
    if (!res.ok) return;
    
    const data = await res.json();
    
    if (data.uid && data.uid !== lastUID) {
      lastUID = data.uid;
      afficherScan(data);
    }
  } catch (err) {
    console.error('Erreur scan:', err);
  }
}

function afficherScan(data) {
  document.getElementById('scan-uid').textContent = data.uid || '-';
  document.getElementById('scan-nom').textContent = data.nom || 'Inconnu ❌';
  document.getElementById('scan-email').textContent = data.email || '-';
  document.getElementById('scan-solde').textContent = data.solde ? data.solde + ' Ar' : '-';

  const status = document.getElementById('scan-status');
  if (data.nom) {
    status.textContent = '✅ Carte reconnue !';
    status.className = 'scan-status success';
  } else {
    status.textContent = '❌ Carte non enregistrée';
    status.className = 'scan-status error';
  }
}

// Démarre le polling
setInterval(checkScan, 2000);

// Charger le dashboard au démarrage
loadDashboard();