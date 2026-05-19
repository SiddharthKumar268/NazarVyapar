const express  = require('express');
const path     = require('path');
const cors     = require('cors');
require('dotenv').config();

const connectDB      = require('./config/db');
const footfallRoutes = require('./routes/footfall');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/footfall', footfallRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('NazarVyapar running on port ' + (process.env.PORT || 5000));
});