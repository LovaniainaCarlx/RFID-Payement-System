const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const pool = require('./db');

const app = express();

// Middlewares
app.use(helmet()); 
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Serveur RFID opérationnel ✅' });
});

// Routes
const scanRoute = require('./routes/scan');
const usersRoute = require('./routes/users');
const transactionsRoute = require('./routes/transactions');

app.use('/api/scan', scanRoute);
app.use('/api/users', usersRoute);
app.use('/api/transactions', transactionsRoute);

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});