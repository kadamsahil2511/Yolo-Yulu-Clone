const express = require("express");
const { getAllBikes, getNearbyBikes, getBikeById, createBike, updateBike, deleteBike } = require("../controllers/bikeController");

const router = express.Router();

router.get("/", getAllBikes);
router.get("/nearby", getNearbyBikes);
router.get("/:id", getBikeById);
router.post("/", createBike);
router.put("/:id", updateBike);
router.delete("/:id", deleteBike);

module.exports = router;
