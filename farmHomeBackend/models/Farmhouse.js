const mongoose = require('mongoose');

const FarmhouseSchema = new mongoose.Schema({
  f_id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  manager: {
    type: String,
    required: false,
  },
  admin: {
    type: String,
    required: false,
  },
  assistants: [
    {
      type: String,
      required: false,
    }
  ],
  location: {
    type: String,
    required: false,
  },
}, { timestamps: true });

// Add pre-save hook to auto-generate f_id if not present
FarmhouseSchema.pre('save', function(next) {
  if (!this.f_id) {
    this.f_id = 'FARM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Farmhouse', FarmhouseSchema); 