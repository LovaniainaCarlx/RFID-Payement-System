const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware vérification API Key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Clé API invalide ❌' });
  }
  next();
};

// POST /api/scan — reçoit l'UID de l'ESP32
router.post('/', verifyApiKey, async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID manquant' });
  }

  try {
    // Chercher l'utilisateur par son UID RFID
    const result = await pool.query(
      'SELECT users.*, wallets.solde FROM users LEFT JOIN wallets ON users.id = wallets.user_id WHERE uid_rfid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Carte non reconnue ❌' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Carte reconnue ✅',
      nom: user.nom,
      solde: user.solde,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 