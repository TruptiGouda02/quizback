

const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
