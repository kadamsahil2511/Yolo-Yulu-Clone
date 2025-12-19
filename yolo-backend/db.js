const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bikeShare";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
    }
};

// Connection event handlers
mongoose.connection.on("connected", () => {
    console.log("📦 Mongoose connected to MongoDB");
});

mongoose.connection.on("disconnected", () => {
    console.log("📦 Mongoose disconnected from MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("📦 Mongoose connection error:", err);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("📦 MongoDB connection closed due to app termination");
    process.exit(0);
});

module.exports = connectDB;