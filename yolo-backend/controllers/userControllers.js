const jwt = require("jsonwebtoken");
const User = require("../models/user");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT Token
 * 
 * Payload Structure:
 * {
 *   id: MongoDB ObjectId string,
 *   email: user's email address
 * }
 * 
 * @param {object} user - User document
 * @returns {string} - Signed JWT token
 */
const generateToken = (user) => {
    const payload = {
        id: user._id.toString(),
        email: user.email,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * POST /api/register
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "Email, password, and name are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Create new user (password will be hashed by pre-save hook)
        const user = new User({
            email: email.toLowerCase(),
            password,
            name,
            phone,
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        // Handle MongoDB validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message,
        });
    }
};

/**
 * POST /api/login
 * Login user and issue JWT (uses passport local strategy via middleware)
 */
const login = async (req, res) => {
    try {
        // req.user is set by authenticateLocal middleware
        const user = req.user;

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message,
        });
    }
};

/**
 * GET /api/profile
 * Get current user's profile (protected by JWT)
 */
const getProfile = async (req, res) => {
    try {
        // req.user is set by authenticateJWT middleware
        const user = await User.findById(req.user._id).populate("activeRide");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user.toJSON(),
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message,
        });
    }
};

/**
 * PUT /api/profile
 * Update current user's profile
 */
const updateProfile = async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (avatar) updateFields.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: user.toJSON(),
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
};
