const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  tagId: { type: String, required: true, unique: true },
  breed: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  dob: { type: Date, required: true },  
  weight: { type: Number, required: true },
  condition: { type: String, required: true },
  status: { type: String, required: true },
  farmhouse: { type: String, required: true },
  sireId: { type: String },
  damId: { type: String },
  acquisitionType: { type: String, required: true },
  acquisitionDate: { type: Date, required: true },
  origin: { type: String },
  images: [
    { type: String },
  ],
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema); 