const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";

/**
 * LOCAL STRATEGY
 * Used for the /login route
 * Verifies user credentials (email + password)
 */
const localStrategy = new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
        session: false,
    },
    async (email, password, done) => {
        try {
            const user = await User.findByEmail(email);

            if (!user) {
                return done(null, false, { message: "No user found with this email" });
            }

            if (!user.isActive) {
                return done(null, false, { message: "Account is deactivated" });
            }

            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return done(null, false, { message: "Incorrect password" });
            }

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
 */
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.id);

        if (!user) {
            return done(null, false, { message: "User not found" });
        }

        if (!user.isActive) {
            return done(null, false, { message: "Account is deactivated" });
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
});

/**
 * Initialize Passport with strategies
 * @param {object} passport - Passport instance
 */
initializePassport = (passport) => {
    passport.use("local", localStrategy);
    passport.use("jwt", jwtStrategy);

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
