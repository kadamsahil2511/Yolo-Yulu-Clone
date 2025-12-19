const passport = require("passport");

/**
 * JWT Authentication Middleware
 * Use this to protect routes that require authentication
 */
authenticateJWT = (request, response, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) {
            return response.status(500).json({
                message: "Authentication error",
                error: err.message
            });
        }

        if (!user) {
            return response.status(401).json({
                message: info?.message || "Unauthorized - Invalid or missing token"
            });
        }

        request.user = user;
        next();
    })(request, response, next);
};

/**
 * Local Authentication Middleware
 * Used for login route to verify email/password
 */
authenticateLocal = (request, response, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) {
            return response.status(500).json({
                message: "Authentication error",
                error: err.message
            });
        }

        if (!user) {
            return response.status(401).json({
                message: info?.message || "Invalid email or password"
            });
        }

        request.user = user;
        next();
    })(request, response, next);
};

/**
 * Optional JWT Authentication
 * Attaches user if token is valid, continues anyway if not
 */
optionalJWT = (request, response, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (user) {
            request.user = user;
        }
        next();
    })(request, response, next);
};

module.exports = { authenticateJWT, authenticateLocal, optionalJWT };
