// models/Bin.js
const mongoose = require('mongoose');

const BinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'full', 'maintenance'], default: 'active' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { 
      type: [Number], // [LONGITUDE, LATITUDE]
      required: true 
    }
  }
});

// Create a geospatial index so we can search for bins near a user's GPS location later
BinSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Bin', BinSchema);