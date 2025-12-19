const express = require("express");
const { authenticateJWT } = require("../middlewares/passportAuth");
const { getAllBikes, getNearbyBikes, getBikeById, createBike, updateBike, deleteBike } = require("../controllers/bikeController");

const router = express.Router();

router.get("/", getAllBikes);
router.get("/nearby", getNearbyBikes);
router.get("/:id", getBikeById);
router.post("/", authenticateJWT, createBike);
router.put("/:id", authenticateJWT, updateBike);
router.delete("/:id", authenticateJWT, deleteBike);

module.exports = router;
