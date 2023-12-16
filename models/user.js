
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lang: { type: String, required: true },
  proficiency: { type: Number, default: 0 },
  progress: [
    {
      score: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
