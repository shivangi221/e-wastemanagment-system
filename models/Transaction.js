// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  binId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin', required: true },
  itemCategory: { type: String, required: true }, // e.g., "Smartphone", "Keyboard"
  pointsAwarded: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);