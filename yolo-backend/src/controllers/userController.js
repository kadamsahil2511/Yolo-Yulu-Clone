const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT Token
 */
generateToken = (user) => {
    const payload = {
        id: user._id.toString(),
        email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * POST /users/register
 * Register a new user
 */
register = async (request, response) => {
    try {
        const { email, password, name, phone } = request.body;

        if (!email || !password || !name) {
            return response.status(400).json({ message: "Email, password, and name are required" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return response.status(400).json({ message: "User with this email already exists" });
        }

        const newUser = await User.create({
            email: email.toLowerCase(),
            password,
            name,
            phone
        });

        const token = generateToken(newUser);

        response.status(201).json({
            message: "User registered successfully",
            data: { user: newUser.toJSON(), token }
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return response.status(400).json({ message: messages.join(", ") });
        }
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /users/login
 * Login user and issue JWT
 */
login = async (request, response) => {
    try {
        const user = request.user;
        const token = generateToken(user);

        response.status(200).json({
            message: "Login successful",
            data: { user: user.toJSON(), token }
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /users/profile
 * Get current user's profile
 */
getProfile = async (request, response) => {
    try {
        const user = await User.findById(request.user._id).populate("activeRide");

        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        response.status(200).json({
            message: "User profile fetched successfully",
            data: user.toJSON()
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /users/profile
 * Update current user's profile
 */
updateProfile = async (request, response) => {
    try {
        const { name, phone, avatar } = request.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (avatar) updateFields.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            request.user._id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return response.status(404).json({ message: "User not found" });
        }

        response.status(200).json({
            message: "Profile updated successfully",
            data: updatedUser.toJSON()
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /users/balance/add
 * Add balance to user wallet
 */
addBalance = async (request, response) => {
    try {
        const { amount } = request.body;

        if (!amount || amount <= 0) {
            return response.status(400).json({ message: "Please provide a valid amount" });
        }

        const user = await User.findById(request.user._id);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        user.balance = user.balance + amount;
        await user.save();

        response.status(200).json({
            message: "Balance added successfully",
            data: { balance: user.balance }
        });
    } catch (error) {
        response.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    addBalance
};
