// models/FootfallEntry.js
const mongoose = require('mongoose');

const FootfallSchema = new mongoose.Schema({
  count:     { type: Number, default: 1 },
  light:     { type: Number },        // LDR analog value 0-4095
  hour:      { type: Number },        // 0-23
  day:       { type: String },        // Mon ... Sun
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FootfallEntry', FootfallSchema);