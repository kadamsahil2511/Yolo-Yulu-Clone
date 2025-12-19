const express = require("express");
const router = express.Router();
const { authenticateJWT, authenticateLocal } = require("../middleware/auth");
const {
    register,
    login,
    getProfile,
    updateProfile,
} = require("../controllers/userControllers");

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @middleware authenticateLocal - Verifies email/password via Passport local strategy
 */
router.post("/login", authenticateLocal, login);

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private (JWT required)
 */
router.get("/profile", authenticateJWT, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private (JWT required)
 */
router.put("/profile", authenticateJWT, updateProfile);

module.exports = router;
