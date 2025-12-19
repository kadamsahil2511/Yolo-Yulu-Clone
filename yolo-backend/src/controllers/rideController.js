const Ride = require("../models/Ride");
const Bike = require("../models/Bike");
const User = require("../models/User");

/**
 * POST /rides/unlock
 * Unlock a bike and start a new ride (like issueBook)
 */
unlockBike = async (request, response) => {
    try {
        const { bikeId, lat, lng } = request.body;
        const userId = request.user._id;

        // Check if user already has an active ride
        const existingRide = await Ride.findOne({ user: userId, status: "active" });
        if (existingRide) {
            return response.status(400).json({ message: "You already have an active ride" });
        }

        // Find the bike
        const bike = await Bike.findOne({ bikeId: bikeId.toUpperCase() });
        if (!bike) {
            return response.status(404).json({ message: "Bike not found" });
        }

        if (bike.status !== "available") {
            return response.status(400).json({ message: `Bike is currently ${bike.status}` });
        }

        if (bike.batteryLevel < 10) {
            return response.status(400).json({ message: "Bike battery too low" });
        }

        // Check user balance
        const user = await User.findById(userId);
        if (user.balance < 10) {
            return response.status(400).json({ message: "Insufficient balance. Please add funds." });
        }

        // Create new ride
        const newRide = await Ride.create({
            user: userId,
            bike: bike._id,
            bikeId: bike.bikeId,
            startTime: new Date(),
            startLocation: {
                type: "Point",
                coordinates: [
                    lng || bike.location.coordinates[0],
                    lat || bike.location.coordinates[1]
                ]
            }
        });

        // Update bike status
        bike.status = "in-use";
        bike.currentRider = userId;
        await bike.save();

        // Update user with active ride
        await User.findByIdAndUpdate(userId, { activeRide: newRide._id });

        response.status(201).json({
            message: "Bike unlocked successfully",
            data: { ride: newRide, bike: bike }
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /rides/:id/end
 * End a ride (like returnBook)
 */
endRide = async (request, response) => {
    try {
        const { rideId } = request.params;
        const { lat, lng } = request.body;
        const userId = request.user._id;

        // Find active ride
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return response.status(404).json({ message: "Ride not found" });
        }

        if (ride.user.toString() !== userId.toString()) {
            return response.status(403).json({ message: "This ride does not belong to you" });
        }

        if (ride.status === "completed") {
            return response.status(400).json({ message: "Ride already ended" });
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
            bike.totalRides = bike.totalRides + 1;
            bike.batteryLevel = Math.max(0, bike.batteryLevel - Math.ceil(ride.duration / 10));
            if (endCoordinates) {
                bike.location.coordinates = endCoordinates;
            }
            await bike.save();
        }

        // Update user
        const user = await User.findById(userId);
        user.activeRide = null;
        user.totalRides = user.totalRides + 1;
        user.balance = Math.max(0, user.balance - ride.cost);
        await user.save();

        response.status(200).json({
            message: "Ride ended successfully",
            data: {
                ride: ride,
                cost: ride.cost,
                duration: ride.duration,
                newBalance: user.balance
            }
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /rides/active
 * Get user's current active ride
 */
getActiveRide = async (request, response) => {
    try {
        const ride = await Ride.findOne({
            user: request.user._id,
            status: "active"
        }).populate("bike");

        if (!ride) {
            return response.status(404).json({ message: "No active ride" });
        }

        response.status(200).json({
            message: "Active ride fetched successfully",
            data: ride
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /rides/history
 * Get user's ride history
 */
getRideHistory = async (request, response) => {
    try {
        const { page = 1, limit = 10 } = request.query;

        const rides = await Ride.find({ user: request.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("bike", "bikeId model");

        const total = await Ride.countDocuments({ user: request.user._id });

        response.status(200).json({
            message: "Ride history fetched successfully",
            data: rides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /rides/:id/cancel
 * Cancel an active ride
 */
cancelRide = async (request, response) => {
    try {
        const { rideId } = request.params;
        const userId = request.user._id;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return response.status(404).json({ message: "Ride not found" });
        }

        if (ride.user.toString() !== userId.toString()) {
            return response.status(403).json({ message: "This ride does not belong to you" });
        }

        if (ride.status !== "active") {
            return response.status(400).json({ message: "Can only cancel active rides" });
        }

        // Check if ride just started (within 2 minutes - free cancellation)
        const rideStarted = new Date(ride.startTime);
        const now = new Date();
        const minutesElapsed = (now - rideStarted) / 60000;

        ride.status = "cancelled";
        ride.endTime = now;
        await ride.save();

        // Update bike
        const bike = await Bike.findById(ride.bike);
        if (bike) {
            bike.status = "available";
            bike.currentRider = null;
            await bike.save();
        }

        // Update user
        await User.findByIdAndUpdate(userId, { activeRide: null });

        response.status(200).json({
            message: minutesElapsed <= 2
                ? "Ride cancelled - No charge (cancelled within 2 minutes)"
                : "Ride cancelled",
            data: ride
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    unlockBike,
    endRide,
    getActiveRide,
    getRideHistory,
    cancelRide
};
