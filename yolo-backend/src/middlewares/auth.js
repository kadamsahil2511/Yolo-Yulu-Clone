const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";

/**
 * Auth middleware for token verification
 * Verifies JWT from Authorization header
 */
const authMiddleware = (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return response.status(401).json({ message: "Unauthorized - Token missing" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        request.user = decoded;
        next();
    } catch (error) {
        response.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};

module.exports = authMiddleware;
