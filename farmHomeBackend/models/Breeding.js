const mongoose = require('mongoose');

const breedingSchema = new mongoose.Schema({
  sireTagId: { type: String, required: true },
  damTagId: { type: String, required: true },
  breedingDate: { type: Date, required: true },
  breedingMethod: { type: String },
  expectedDelivery: { type: Date },
  actualDelivery: { type: Date },
  numberOfOffspring: { type: Number },
  status: { type: String },
  cost: { type: Number },
  performedBy: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Breeding', breedingSchema); 