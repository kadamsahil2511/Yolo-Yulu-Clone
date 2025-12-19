const express = require("express");
const { unlockBike, endRide, getActiveRide, getRideHistory, cancelRide } = require("../controllers/rideController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/unlock", authMiddleware, unlockBike);
router.put("/:rideId/end", authMiddleware, endRide);
router.put("/:rideId/cancel", authMiddleware, cancelRide);
router.get("/active", authMiddleware, getActiveRide);
router.get("/history", authMiddleware, getRideHistory);

module.exports = router;

