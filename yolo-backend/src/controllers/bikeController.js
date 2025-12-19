const Bike = require("../models/Bike");

/**
 * GET /bikes
 * Get all available bikes
 */
const getAllBikes = async (request, response) => {
    try {
        const bikes = await Bike.find({ status: "available" }).limit(50);
        response.status(200).json({ bikes });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /bikes/nearby
 * Get available bikes near a location
 */
const getNearbyBikes = async (request, response) => {
    try {
        const { lat, lng, radius } = request.query;

        if (!lat || !lng) {
            return response.status(400).json({ message: "Please provide lat and lng coordinates" });
        }

        const bikes = await Bike.find({
            status: "available",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius) || 1000
                }
            }
        }).limit(20);

        response.status(200).json({ bikes, count: bikes.length });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /bikes/:id
 * Get a specific bike by ID
 */
const getBikeById = async (request, response) => {
    try {
        const foundBike = await Bike.findOne({ bikeId: request.params.id.toUpperCase() });

        if (!foundBike) {
            return response.status(404).json({ message: "Bike not found" });
        }

        response.status(200).json({ bike: foundBike });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /bikes
 * Create a new bike (Admin only)
 */
const createBike = async (request, response) => {
    try {
        const { bikeId, model, batteryLevel, lat, lng, qrCode } = request.body;

        if (!bikeId || !lat || !lng) {
            return response.status(400).json({ message: "Please provide bikeId, lat, and lng" });
        }

        const existingBike = await Bike.findOne({ bikeId: bikeId.toUpperCase() });
        if (existingBike) {
            return response.status(400).json({ message: "Bike with this ID already exists" });
        }

        const newBike = await Bike.create({
            bikeId: bikeId.toUpperCase(),
            model: model || "Yolo E-Bike Pro",
            batteryLevel: batteryLevel || 100,
            location: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            qrCode: qrCode || `YOLO-${bikeId.toUpperCase()}-QR`,
            status: "available"
        });

        response.status(201).json({ message: "Bike created successfully", bike: newBike });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /bikes/:id
 * Update a bike's information
 */
const updateBike = async (request, response) => {
    try {
        const { model, batteryLevel, status, lat, lng } = request.body;

        const updateFields = {};
        if (model) updateFields.model = model;
        if (batteryLevel !== undefined) updateFields.batteryLevel = batteryLevel;
        if (status) updateFields.status = status;
        if (lat && lng) {
            updateFields.location = {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        const updatedBike = await Bike.findOneAndUpdate(
            { bikeId: request.params.id.toUpperCase() },
            updateFields,
            { new: true }
        );

        if (!updatedBike) {
            return response.status(404).json({ message: "Bike not found" });
        }

        response.status(200).json({ message: "Bike updated successfully", data: updatedBike });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /bikes/:id
 * Delete a bike
 */
const deleteBike = async (request, response) => {
    try {
        const deletedBike = await Bike.findOneAndDelete({ bikeId: request.params.id.toUpperCase() });

        if (!deletedBike) {
            return response.status(404).json({ message: "Bike not found" });
        }

        response.status(200).json({ message: "Bike deleted successfully" });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllBikes,
    getNearbyBikes,
    getBikeById,
    createBike,
    updateBike,
    deleteBike
};
