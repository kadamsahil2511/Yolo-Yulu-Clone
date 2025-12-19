const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
    getAvailableBikes,
    getBikeById,
    unlockBike,
    endRide,
    getRideHistory,
    getActiveRide,
} = require("../controllers/bikeControllers");

// ============== BIKE ROUTES ==============

/**
 * @route   GET /api/bikes/available
 * @desc    Get all available bikes (optionally near a location)
 * @access  Public (can be used without auth for map display)
 * @query   lat, lng, radius (optional)
 */
router.get("/bikes/available", getAvailableBikes);

/**
 * @route   GET /api/bikes/:bikeId
 * @desc    Get a specific bike by ID
 * @access  Public
 */
router.get("/bikes/:bikeId", getBikeById);

// ============== RIDE ROUTES ==============

/**
 * @route   POST /api/rides/unlock
 * @desc    Unlock a bike and start a ride
 * @access  Private (JWT required)
 * @body    { bikeId: string, lat?: number, lng?: number }
 */
router.post("/rides/unlock", authenticateJWT, unlockBike);

/**
 * @route   POST /api/rides/end
 * @desc    End the current ride
 * @access  Private (JWT required)
 * @body    { rideId: string, lat?: number, lng?: number }
 */
router.post("/rides/end", authenticateJWT, endRide);

/**
 * @route   GET /api/rides/history
 * @desc    Get user's ride history
 * @access  Private (JWT required)
 * @query   page, limit (optional, default 1 & 10)
 */
router.get("/rides/history", authenticateJWT, getRideHistory);

/**
 * @route   GET /api/rides/active
 * @desc    Get user's current active ride
 * @access  Private (JWT required)
 */
router.get("/rides/active", authenticateJWT, getActiveRide);

module.exports = router;
