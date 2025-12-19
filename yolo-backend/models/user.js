const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema for Bike Sharing App
 * - email: unique identifier for login
 * - password: hashed with bcrypt
 * - name: display name
 * - phone: contact number
 * - balance: wallet balance in INR
 * - totalRides: cumulative ride count
 * - activeRide: reference to current active ride (if any)
 */
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't include password in queries by default
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            default: function () {
                return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`;
            },
        },
        balance: {
            type: Number,
            default: 100, // Starting balance ₹100
            min: 0,
        },
        totalRides: {
            type: Number,
            default: 0,
        },
        activeRide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride",
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Pre-save hook to hash password before saving
 * Only hashes if password field is modified (new or updated)
 */
userSchema.pre("save", async function (next) {
    // Only hash password if it's modified (or new)
    if (!this.isModified("password")) {
        return next();
    }

    try {
        // Generate salt with cost factor 12
        const salt = await bcrypt.genSalt(12);
        // Hash the password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method to compare provided password with stored hash
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    // Need to explicitly select password since it's excluded by default
    const user = await this.constructor.findById(this._id).select("+password");
    return bcrypt.compare(candidatePassword, user.password);
};

/**
 * Static method to find user by email with password
 * (for authentication purposes)
 */
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email }).select("+password");
};

/**
 * Transform output to remove sensitive data
 */
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
