const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = {
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: function () {
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`;
        }
    },
    balance: {
        type: Number,
        default: 100,
        min: 0
    },
    totalRides: {
        type: Number,
        default: 0
    },
    activeRide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
};

const schema = new mongoose.Schema(userSchema);

// Pre-save hook to hash password
schema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare passwords
schema.methods.comparePassword = async function (candidatePassword) {
    const user = await this.constructor.findById(this._id).select("+password");
    return bcrypt.compare(candidatePassword, user.password);
};

// Static method to find user by email with password
schema.statics.findByEmail = function (email) {
    return this.findOne({ email }).select("+password");
};

// Transform output to remove sensitive data
schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

const User = new mongoose.model("User", schema);

module.exports = User;
