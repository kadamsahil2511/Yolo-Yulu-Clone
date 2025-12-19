/**
 * Database Seed Script
 * Run: node scripts/seed.js
 * 
 * Creates sample bikes in the database for testing
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Bike = require("../src/models/Bike");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bikeShare";

// Sample bike locations (Pune, India)
const sampleBikes = [
    {
        bikeId: "BIKE001",
        model: "Yolo E-Bike Pro",
        batteryLevel: 87,
        location: { type: "Point", coordinates: [73.8567, 18.5204] },
        status: "available",
        qrCode: "YOLO-BIKE001-QR"
    },
    {
        bikeId: "BIKE002",
        model: "Yolo E-Bike Lite",
        batteryLevel: 45,
        location: { type: "Point", coordinates: [73.8547, 18.5224] },
        status: "available",
        qrCode: "YOLO-BIKE002-QR"
    },
    {
        bikeId: "BIKE003",
        model: "Yolo Speed+",
        batteryLevel: 92,
        location: { type: "Point", coordinates: [73.8597, 18.5184] },
        status: "available",
        qrCode: "YOLO-BIKE003-QR"
    },
    {
        bikeId: "BIKE004",
        model: "Yolo E-Bike Lite",
        batteryLevel: 28,
        location: { type: "Point", coordinates: [73.8527, 18.5244] },
        status: "available",
        qrCode: "YOLO-BIKE004-QR"
    },
    {
        bikeId: "BIKE005",
        model: "Yolo E-Bike Pro",
        batteryLevel: 68,
        location: { type: "Point", coordinates: [73.8607, 18.5164] },
        status: "available",
        qrCode: "YOLO-BIKE005-QR"
    },
    {
        bikeId: "BIKE006",
        model: "Yolo Speed+",
        batteryLevel: 95,
        location: { type: "Point", coordinates: [73.8537, 18.5214] },
        status: "available",
        qrCode: "YOLO-BIKE006-QR"
    },
    {
        bikeId: "BIKE007",
        model: "Yolo E-Bike Pro",
        batteryLevel: 72,
        location: { type: "Point", coordinates: [73.8577, 18.5194] },
        status: "available",
        qrCode: "YOLO-BIKE007-QR"
    },
    {
        bikeId: "BIKE008",
        model: "Yolo E-Bike Lite",
        batteryLevel: 55,
        location: { type: "Point", coordinates: [73.8617, 18.5174] },
        status: "available",
        qrCode: "YOLO-BIKE008-QR"
    }
];

seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        await Bike.deleteMany({});
        console.log("🗑️  Cleared existing bikes");

        const bikes = await Bike.insertMany(sampleBikes);
        console.log(`🚲 Created ${bikes.length} sample bikes`);

        await Bike.collection.createIndex({ location: "2dsphere" });
        console.log("📍 Created geospatial index");

        console.log("\n✅ Database seeded successfully!\n");
        console.log("Sample bikes created:");
        bikes.forEach((bike) => {
            console.log(`  - ${bike.bikeId}: ${bike.model} (${bike.batteryLevel}% battery)`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seed();
