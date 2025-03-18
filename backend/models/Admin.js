const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'core-team'], required: true }
}, { timestamps: true, optimizeIndexes: true });

module.exports = mongoose.model('Admin', AdminSchema);