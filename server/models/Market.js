const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  question: { type: String, required: true },
  description: String,
  outcomes: { type: [String], required: true }, // e.g. ["Yes", "No"]
  outcomePools: { 
    type: Map, 
    of: Number,
    default: {} 
  }, // e.g. { "Yes": 100, "No": 300 }
  status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
  closesAt: { type: Date, required: true },
  resolvedOutcome: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', MarketSchema);
