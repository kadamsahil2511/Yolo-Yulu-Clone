const passport = require("passport");

/**
 * JWT Authentication Middleware
 * Use this to protect routes that require authentication
 * 
 * Usage: router.get('/protected', authenticateJWT, controller)
 * 
 * On success: req.user will contain the authenticated user
 * On failure: Returns 401 Unauthorized
 */
const authenticateJWT = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Authentication error",
                error: err.message,
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: info?.message || "Unauthorized - Invalid or missing token",
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Local Authentication Middleware
 * Used for login route to verify email/password
 * 
 * Usage: router.post('/login', authenticateLocal, controller)
 * 
 * On success: req.user will contain the authenticated user
 * On failure: Returns 401 with error message
 */
const authenticateLocal = (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Authentication error",
                error: err.message,
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: info?.message || "Invalid email or password",
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Optional JWT Authentication
 * Attaches user if token is valid, continues anyway if not
 * Useful for routes that have different behavior for auth/non-auth users
 */
const optionalJWT = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};

module.exports = {
    authenticateJWT,
    authenticateLocal,
    optionalJWT,
};
