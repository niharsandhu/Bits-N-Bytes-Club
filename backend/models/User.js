const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    rollNo: { type: Number, required: true, unique: true },
    phone: { type: Number, required: true },
    department: { type: String, enum: ['CSE', 'CSE-AI'], required: true },
    year: { type: Number, required: true },
    group: { type: Number, required: true },
    points: { type: Number, default: 0 },
    password: { type: String, required: true },
    registeredEvents: [
        {
            eventId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event',
            },
            name: String,
            date: Date,
            status: {
                type: String,
                enum: ['upcoming', 'registered', 'completed'],
                default: 'upcoming',
            },
        },
    ],
    image: {
        url: { type: String },
        public_id: { type: String },
    }
}, { timestamps: true, optimizeIndexes: true });

module.exports = mongoose.model('User', UserSchema);
