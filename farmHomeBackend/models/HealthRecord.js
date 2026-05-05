const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  animalTagId: { type: String, required: true },
  healthIssue: { type: String, required: true },
  symptoms: { type: String },
  diagnosis: { type: String },
  treatment: { type: String },
  veterinarian: { type: String },
  treatmentDate: { type: Date, required: true },
  followUpDate: { type: Date },
  severity: { type: String },
  cost: { type: Number },
  status: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema); 