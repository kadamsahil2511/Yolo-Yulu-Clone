const mongoose = require("mongoose");

const bikeSchema = {
    bikeId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        enum: ["Yolo E-Bike Pro", "Yolo E-Bike Lite", "Yolo Speed+"],
        default: "Yolo E-Bike Pro"
    },
    batteryLevel: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 100
    },
    location: {
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
    status: {
        type: String,
        enum: ["available", "in-use", "maintenance", "low-battery"],
        default: "available"
    },
    lastMaintenanceDate: {
        type: Date,
        default: Date.now
    },
    totalRides: {
        type: Number,
        default: 0
    },
    currentRider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    qrCode: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
};

const schema = new mongoose.Schema(bikeSchema);

// Geospatial index for location-based queries
schema.index({ location: "2dsphere" });

// Index for quick status lookups
schema.index({ status: 1 });

// Virtual for lat (since MongoDB stores as lng/lat)
schema.virtual("lat").get(function () {
    return this.location.coordinates[1];
});

schema.virtual("lng").get(function () {
    return this.location.coordinates[0];
});

// Static method to find available bikes near a location
schema.statics.findNearby = function (lng, lat, maxDistance = 1000) {
    return this.find({
        status: "available",
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDistance
            }
        }
    });
};

// Transform to JSON with lat/lng format for frontend
schema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.lat = this.location.coordinates[1];
    obj.lng = this.location.coordinates[0];
    obj.id = obj.bikeId;
    delete obj.location;
    delete obj.__v;
    return obj;
};

const Bike = mongoose.model("Bike", schema);

module.exports = Bike;
