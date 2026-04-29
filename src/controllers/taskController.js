const Task = require('../models/Task');

// Get all tasks, sorted by intelligent scheduling logic
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        
        // Smart Scheduling Logic: Sort tasks based on priority and deadline
        // Priority weight: High=3, Medium=2, Low=1
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        
        const sortedTasks = tasks.sort((a, b) => {
            // First, prioritize by deadline proximity
            const daysUntilA = (new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24);
            const daysUntilB = (new Date(b.deadline) - new Date()) / (1000 * 60 * 60 * 24);
            
            // Calculate a score: closer deadline + higher priority = higher urgency
            const urgencyScoreA = (1 / (daysUntilA > 0 ? daysUntilA : 0.1)) * priorityWeight[a.priority];
            const urgencyScoreB = (1 / (daysUntilB > 0 ? daysUntilB : 0.1)) * priorityWeight[b.priority];
            
            // Sort descending by score (highest urgency first)
            return urgencyScoreB - urgencyScoreA;
        });

        res.status(200).json({ success: true, count: sortedTasks.length, data: sortedTasks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update task status or actual time spent
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
