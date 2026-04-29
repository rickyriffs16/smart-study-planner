const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/utils/db');
require('dotenv').config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route files
const tasks = require('./src/routes/taskRoutes');

// Mount routes
app.use('/api/tasks', tasks);

// Basic route to test server
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'Server is running normally' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
