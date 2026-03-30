const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users — liste tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT users.*, wallets.solde FROM users LEFT JOIN wallets ON users.id = wallets.user_id ORDER BY users.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/users — créer un utilisateur
router.post('/', async (req, res) => {
  const { uid_rfid, nom, email } = req.body;
  try {
    const user = await pool.query(
      'INSERT INTO users (uid_rfid, nom, email) VALUES ($1, $2, $3) RETURNING *',
      [uid_rfid, nom, email]
    );
    // Créer automatiquement un wallet pour cet utilisateur
    await pool.query(
      'INSERT INTO wallets (user_id, solde) VALUES ($1, $2)',
      [user.rows[0].id, 0.00]
    );
    res.status(201).json({ message: 'Utilisateur créé ✅', user: user.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id — modifier un utilisateur
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET nom=$1, email=$2 WHERE id=$3 RETURNING *',
      [nom, email, id]
    );
    res.json({ message: 'Utilisateur modifié ✅', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/users/:id — supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'Utilisateur supprimé ✅' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;