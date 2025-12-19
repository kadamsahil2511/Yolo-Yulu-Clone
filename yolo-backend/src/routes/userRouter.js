const express = require("express");
const { register, login, getProfile, updateProfile, addBalance } = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/balance/add", authMiddleware, addBalance);

module.exports = router;

