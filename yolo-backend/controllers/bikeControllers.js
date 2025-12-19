const { Bike, Ride, User } = require("../models");

/**
 * GET /api/bikes/available
 * Get all available bikes (optionally near a location)
 */
const getAvailableBikes = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        let bikes;

        if (lat && lng) {
            // Find bikes near the provided location
            bikes = await Bike.find({
                status: "available",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lng), parseFloat(lat)],
                        },
                        $maxDistance: parseInt(radius) || 1000, // Default 1km radius
                    },
                },
            }).limit(20);
        } else {
            // Return all available bikes
            bikes = await Bike.find({ status: "available" }).limit(50);
        }

        res.json({
            success: true,
            count: bikes.length,
            data: bikes,
        });
    } catch (error) {
        console.error("Get bikes error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching bikes",
            error: error.message,
        });
    }
};

/**
 * GET /api/bikes/:bikeId
 * Get a specific bike by ID
 */
const getBikeById = async (req, res) => {
    try {
        const bike = await Bike.findOne({ bikeId: req.params.bikeId.toUpperCase() });

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found",
            });
        }

        res.json({
            success: true,
            data: bike,
        });
    } catch (error) {
        console.error("Get bike error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching bike",
            error: error.message,
        });
    }
};

/**
 * POST /api/rides/unlock
 * Unlock a bike and start a new ride
 */
const unlockBike = async (req, res) => {
    try {
        const { bikeId, lat, lng } = req.body;
        const userId = req.user._id;

        // Check if user already has an active ride
        const existingRide = await Ride.findOne({ user: userId, status: "active" });
        if (existingRide) {
            return res.status(400).json({
                success: false,
                message: "You already have an active ride",
                data: { rideId: existingRide._id },
            });
        }

        // Find the bike
        const bike = await Bike.findOne({ bikeId: bikeId.toUpperCase() });
        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found",
            });
        }

        if (bike.status !== "available") {
            return res.status(400).json({
                success: false,
                message: `Bike is currently ${bike.status}`,
            });
        }

        if (bike.batteryLevel < 10) {
            return res.status(400).json({
                success: false,
                message: "Bike battery too low",
            });
        }

        // Create new ride
        const ride = new Ride({
            user: userId,
            bike: bike._id,
            bikeId: bike.bikeId,
            startTime: new Date(),
            startLocation: {
                type: "Point",
                coordinates: [
                    lng || bike.location.coordinates[0],
                    lat || bike.location.coordinates[1],
                ],
            },
        });

        await ride.save();

        // Update bike status
        bike.status = "in-use";
        bike.currentRider = userId;
        await bike.save();

        // Update user with active ride
        await User.findByIdAndUpdate(userId, { activeRide: ride._id });

        res.status(201).json({
            success: true,
            message: "Bike unlocked successfully",
            data: {
                ride: ride.toJSON(),
                bike: bike.toJSON(),
            },
        });
    } catch (error) {
        console.error("Unlock bike error:", error);
        res.status(500).json({
            success: false,
            message: "Error unlocking bike",
            error: error.message,
        });
    }
};

/**
 * POST /api/rides/end
 * End the current ride
 */
const endRide = async (req, res) => {
    try {
        const { rideId, lat, lng } = req.body;
        const userId = req.user._id;

        // Find active ride
        const ride = await Ride.findOne({
            _id: rideId,
            user: userId,
            status: "active",
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Active ride not found",
            });
        }

        // End the ride (calculates duration and cost)
        const endCoordinates = lat && lng ? [parseFloat(lng), parseFloat(lat)] : null;
        ride.endRide(endCoordinates);
        await ride.save();

        // Update bike status
        const bike = await Bike.findById(ride.bike);
        if (bike) {
            bike.status = "available";
            bike.currentRider = null;
            bike.totalRides += 1;
            // Reduce battery based on ride duration
            bike.batteryLevel = Math.max(0, bike.batteryLevel - Math.ceil(ride.duration / 10));
            if (endCoordinates) {
                bike.location.coordinates = endCoordinates;
            }
            await bike.save();
        }

        // Update user
        const user = await User.findById(userId);
        user.activeRide = null;
        user.totalRides += 1;
        user.balance = Math.max(0, user.balance - ride.cost);
        await user.save();

        res.json({
            success: true,
            message: "Ride ended successfully",
            data: {
                ride: ride.toJSON(),
                cost: ride.cost,
                duration: ride.duration,
                newBalance: user.balance,
            },
        });
    } catch (error) {
        console.error("End ride error:", error);
        res.status(500).json({
            success: false,
            message: "Error ending ride",
            error: error.message,
        });
    }
};

/**
 * GET /api/rides/history
 * Get user's ride history
 */
const getRideHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const rides = await Ride.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("bike", "bikeId model");

        const total = await Ride.countDocuments({ user: req.user._id });

        res.json({
            success: true,
            data: rides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get ride history error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching ride history",
            error: error.message,
        });
    }
};

/**
 * GET /api/rides/active
 * Get user's current active ride
 */
const getActiveRide = async (req, res) => {
    try {
        const ride = await Ride.findOne({
            user: req.user._id,
            status: "active",
        }).populate("bike");

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "No active ride",
            });
        }

        res.json({
            success: true,
            data: ride.toJSON(),
        });
    } catch (error) {
        console.error("Get active ride error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching active ride",
            error: error.message,
        });
    }
};

module.exports = {
    getAvailableBikes,
    getBikeById,
    unlockBike,
    endRide,
    getRideHistory,
    getActiveRide,
};
