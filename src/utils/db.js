const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rickyguitar16_db_user:uFxXiFw27r8hTF9j@cluster0.hcwvm2m.mongodb.net/smart-study-planner?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Retry after 5 seconds instead of crashing
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
