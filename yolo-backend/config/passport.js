const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";

/**
 * LOCAL STRATEGY
 * Used for the /api/login route
 * Verifies user credentials (email + password)
 */
const localStrategy = new LocalStrategy(
    {
        usernameField: "email", // Use 'email' instead of 'username'
        passwordField: "password",
        session: false, // Stateless - no sessions
    },
    async (email, password, done) => {
        try {
            // Find user by email, explicitly include password field
            const user = await User.findByEmail(email);

            if (!user) {
                return done(null, false, { message: "No user found with this email" });
            }

            // Check if user account is active
            if (!user.isActive) {
                return done(null, false, { message: "Account is deactivated" });
            }

            // Verify password
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return done(null, false, { message: "Incorrect password" });
            }

            // Success - return user without password
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
);

/**
 * JWT STRATEGY
 * Used as global middleware for protected routes
 * Extracts and verifies JWT from Authorization header
 * 
 * JWT Payload Structure:
 * {
 *   id: "user_mongodb_id",
 *   email: "user@example.com",
 *   iat: 1234567890,  // issued at timestamp
 *   exp: 1234567890   // expiration timestamp
 * }
 */
const jwtOptions = {
    // Extract token from: Authorization: Bearer <token>
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
    // Optionally verify issuer/audience in production
    // issuer: 'yolo-bike-sharing',
    // audience: 'yolo-app',
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // Find user by ID from JWT payload
        const user = await User.findById(payload.id);

        if (!user) {
            return done(null, false, { message: "User not found" });
        }

        if (!user.isActive) {
            return done(null, false, { message: "Account is deactivated" });
        }

        // Success - attach user to request
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
});

/**
 * Initialize Passport with strategies
 * @param {object} passport - Passport instance
 */
const initializePassport = (passport) => {
    passport.use("local", localStrategy);
    passport.use("jwt", jwtStrategy);

    // Since we're stateless (no sessions), we don't need serialize/deserialize
    // But defining them prevents potential errors
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

module.exports = initializePassport;
