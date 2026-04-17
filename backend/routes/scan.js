const express = require('express');
const router = express.Router();
const pool = require('../db');

// Stocke le dernier scan en mémoire
let dernierScan = null;

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Clé API invalide ❌' });
  }
  next();
};

// POST /api/scan — reçoit l'UID de l'ESP32
router.post('/', verifyApiKey, async (req, res) => {
  console.log('📡 Données reçues depuis ESP32:', req.body);
  const { uid } = req.body;

  if (!uid) return res.status(400).json({ error: 'UID manquant' });

  try {
    const result = await pool.query(
      'SELECT users.*, wallets.solde FROM users LEFT JOIN wallets ON users.id = wallets.user_id WHERE uid_rfid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      dernierScan = { uid, nom: null, email: null, solde: null };
      return res.status(404).json({ error: 'Carte non reconnue ❌' });
    }

    const user = result.rows[0];
    // Sauvegarde le dernier scan ✅
    dernierScan = {
      uid,
      nom: user.nom,
      email: user.email,
      solde: user.solde
    };

    res.json({ message: 'Carte reconnue ✅', ...dernierScan });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/scan/last — GUI récupère le dernier scan
router.get('/last', verifyApiKey, (req, res) => {
  if (!dernierScan) {
    return res.json({ uid: null });
  }
  res.json(dernierScan);
});

module.exports = router;