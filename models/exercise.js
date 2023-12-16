const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], 
  answer: { type: String, required: true },
  difficulty: { type: Number, required: true },
  language: { type: String, required: true },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
