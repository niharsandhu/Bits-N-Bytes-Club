const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true, 
        index: true 
    },
    roundNumber: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    roundName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    roundType: {
        type: String,
        enum: ['quiz', 'task'],
        required: true
    },
    qualifiedUsers: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true
        },
        roundPoints: { 
            type: Number, 
            required: true, 
            default: 0 
        }
    }],
    qualifiedTeams: [{
        teamName: { 
            type: String, 
            required: true 
        },
        members: [{
            name: { type: String, required: true },
            email: { type: String, required: true }
        }],
        roundPoints: { 
            type: Number, 
            required: true, 
            default: 0 
        }
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    topX: { 
        type: Number, 
        required: true, 
        min: 1  // Ensures at least one user qualifies 
    }
}, { timestamps: true });

// Add a compound index for efficient event + round queries
RoundSchema.index({ eventId: 1, roundNumber: 1 }, { unique: true });

module.exports = mongoose.model('Round', RoundSchema);
