const express = require("express");
const { authenticateJWT } = require("../middlewares/passportAuth");
const { unlockBike, endRide, getActiveRide, getRideHistory, cancelRide } = require("../controllers/rideController");

const router = express.Router();

router.post("/unlock", authenticateJWT, unlockBike);
router.put("/:rideId/end", authenticateJWT, endRide);
router.put("/:rideId/cancel", authenticateJWT, cancelRide);
router.get("/active", authenticateJWT, getActiveRide);
router.get("/history", authenticateJWT, getRideHistory);

module.exports = router;
