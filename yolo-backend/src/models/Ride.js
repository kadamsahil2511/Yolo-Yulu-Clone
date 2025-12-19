const mongoose = require("mongoose");

const rideSchema = {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike",
        required: true
    },
    bikeId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    startLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    endLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: null
        }
    },
    distance: {
        type: Number, // in kilometers
        default: 0
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    cost: {
        type: Number, // in INR
        default: 0
    },
    ratePerMinute: {
        type: Number,
        default: 2 // ₹2 per minute
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
};

const schema = new mongoose.Schema(rideSchema);

// Index for user's ride history
schema.index({ user: 1, createdAt: -1 });

// Calculate ride duration and cost when ending
schema.methods.endRide = function (endCoordinates) {
    this.endTime = new Date();
    this.status = "completed";

    if (endCoordinates) {
        this.endLocation = {
            type: "Point",
            coordinates: endCoordinates
        };
    }

    // Calculate duration in minutes
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.ceil(durationMs / 60000);

    // Calculate cost (₹2 per minute, minimum ₹10)
    this.cost = Math.max(this.duration * this.ratePerMinute, 10);

    // Estimate distance (simplified)
    this.distance = parseFloat((this.duration * 0.15).toFixed(1));

    return this;
};

// Transform to JSON for frontend
schema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;

    // Convert locations to lat/lng format
    if (obj.startLocation?.coordinates) {
        obj.startLocation = {
            lat: obj.startLocation.coordinates[1],
            lng: obj.startLocation.coordinates[0]
        };
    }
    if (obj.endLocation?.coordinates) {
        obj.endLocation = {
            lat: obj.endLocation.coordinates[1],
            lng: obj.endLocation.coordinates[0]
        };
    }

    delete obj.__v;
    return obj;
};

const Ride = new mongoose.model("Ride", schema);

module.exports = Ride;
