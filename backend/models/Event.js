const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    maxParticipants: { type: Number, required: true },
    type: { type: String, enum: ['individual', 'team'], required: true },
    byteCoins: { type: Number, required: true },
    rounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Round' }],
    registeredUsers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        eventPoints: { type: Number, default: 0 }
    }],
    registeredTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }
}, { timestamps: true, optimizeIndexes: true });

module.exports = mongoose.model('Event', EventSchema);
