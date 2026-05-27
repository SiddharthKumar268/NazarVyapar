const mongoose = require('mongoose');
const FootfallSchema = new mongoose.Schema({
  count:     { type: Number, default: 1 },
  light:     { type: Number },        
  hour:      { type: Number },        
  day:       { type: String },        
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FootfallEntry', FootfallSchema);
