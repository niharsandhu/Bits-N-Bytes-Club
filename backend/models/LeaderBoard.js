const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    points: { type: Number, default: 0 },
    semester: { type: String, required: true, index: true }
}, { timestamps: true, optimizeIndexes: true });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);