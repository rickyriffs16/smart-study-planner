const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    deadline: {
        type: Date,
        required: true
    },
    estimatedHours: {
        type: Number,
        required: true,
        min: 0.5
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    // For tracking actual time spent vs estimated
    actualTimeSpent: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // In a real app with auth this would be required, 
        // but for a simple demo we can make it optional or hardcode a user
        required: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
