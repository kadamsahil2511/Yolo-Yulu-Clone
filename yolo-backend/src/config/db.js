const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bikeShare";

// Connect with proper error handling for production
const connectDB = async () => {
    try {
        console.log("📦 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ Database connected successfully");
    } catch (err) {
        console.error("❌ Database connection error:", err.message);
        // Don't exit immediately on Render - allow health checks
        // but log the error for debugging
    }
};

// Connect on module load
connectDB();

const db = mongoose.connection;

db.on("connected", () => {
    console.log("✅ MongoDB connected");
});

db.on("disconnected", () => {
    console.log("📦 Database disconnected");
});

db.on("error", (err) => {
    console.error("❌ Database connection error:", err.message);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log("📦 MongoDB connection closed due to app termination");
    process.exit(0);
});

module.exports = db;
