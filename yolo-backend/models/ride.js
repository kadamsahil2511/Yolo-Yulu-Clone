const mongoose = require("mongoose");

/**
 * Ride Schema for Bike Sharing App
 * Tracks individual rides with start/end times, locations, and costs
 */
const rideSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bike: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bike",
            required: true,
        },
        bikeId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
        startTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endTime: {
            type: Date,
            default: null,
        },
        startLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        endLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: null,
            },
        },
        distance: {
            type: Number, // in kilometers
            default: 0,
        },
        duration: {
            type: Number, // in minutes
            default: 0,
        },
        cost: {
            type: Number, // in INR
            default: 0,
        },
        ratePerMinute: {
            type: Number,
            default: 2, // ₹2 per minute
        },
    },
    {
        timestamps: true,
    }
);

// Index for user's ride history
rideSchema.index({ user: 1, createdAt: -1 });

/**
 * Calculate ride duration and cost when ending
 */
rideSchema.methods.endRide = function (endCoordinates) {
    this.endTime = new Date();
    this.status = "completed";

    if (endCoordinates) {
        this.endLocation = {
            type: "Point",
            coordinates: endCoordinates,
        };
    }

    // Calculate duration in minutes
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.ceil(durationMs / 60000); // Round up to nearest minute

    // Calculate cost (₹2 per minute, minimum ₹10)
    this.cost = Math.max(this.duration * this.ratePerMinute, 10);

    // Estimate distance (simplified - in production use actual GPS tracking)
    this.distance = parseFloat((this.duration * 0.15).toFixed(1)); // ~0.15 km per minute avg

    return this;
};

/**
 * Transform to JSON for frontend
 */
rideSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;

    // Convert locations to lat/lng format
    if (obj.startLocation?.coordinates) {
        obj.startLocation = {
            lat: obj.startLocation.coordinates[1],
            lng: obj.startLocation.coordinates[0],
        };
    }
    if (obj.endLocation?.coordinates) {
        obj.endLocation = {
            lat: obj.endLocation.coordinates[1],
            lng: obj.endLocation.coordinates[0],
        };
    }

    delete obj.__v;
    return obj;
};

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
