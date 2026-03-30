const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/transactions — historique complet
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT transactions.*, users.nom, users.uid_rfid FROM transactions LEFT JOIN users ON transactions.user_id = users.id ORDER BY transactions.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/transactions — ajouter une transaction
router.post('/', async (req, res) => {
  const { user_id, montant, type, description } = req.body;
  try {
    // Enregistrer la transaction
    const transaction = await pool.query(
      'INSERT INTO transactions (user_id, montant, type, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, montant, type, description]
    );

    // Mettre à jour le solde
    if (type === 'credit') {
      await pool.query(
        'UPDATE wallets SET solde = solde + $1, updated_at = NOW() WHERE user_id = $2',
        [montant, user_id]
      );
    } else if (type === 'debit') {
      await pool.query(
        'UPDATE wallets SET solde = solde - $1, updated_at = NOW() WHERE user_id = $2',
        [montant, user_id]
      );
    }

    res.status(201).json({ message: 'Transaction ajoutée ✅', transaction: transaction.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/transactions/:user_id — transactions d'un utilisateur
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;