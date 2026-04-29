const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    // For Basic Gamification
    streak: {
        type: Number,
        default: 0
    },
    lastStudyDate: {
        type: Date
    },
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
