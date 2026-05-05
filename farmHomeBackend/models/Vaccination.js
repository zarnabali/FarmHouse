const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  animalTagId: { type: String, required: true },
  vaccineName: { type: String, required: true },
  manufacturer: { type: String },
  batchNumber: { type: String },
  vaccinationType: { type: String },
  dosage: { type: String },
  administrationRoute: { type: String },
  administeredBy: { type: String },
  treatmentDate: { type: Date, required: true },
  expiryDate: { type: Date },
  nextDueDate: { type: Date },
  cost: { type: Number },
  status: { type: String },
  sideEffects: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema); 