const express = require('express');
const cors = require('cors');
const passport = require('passport');

require('dotenv').config();
require('./src/config/db');

const userRouter = require('./src/routes/userRouter');
const bikeRouter = require('./src/routes/bikeRouter');
const rideRouter = require('./src/routes/rideRouter');
const initializePassport = require('./src/config/passport');

const app = express();

// Request logger middleware
const requestLogger = (request, response, next) => {
    console.log(`${request.method} ${request.path} ${new Date().toISOString()}`);
    next();
};

// API Documentation at root
app.get("/", (request, response) => {
    response.json({
        name: "YOLO Bike Sharing API",
        version: "1.0.0",
        description: "RESTful API for bike sharing application",
        documentation: {
            users: {
                "POST /users/register": {
                    description: "Register a new user",
                    body: { email: "string", password: "string", name: "string", phone: "string (optional)" },
                    response: { message: "string", data: { user: "object", token: "string" } }
                },
                "POST /users/login": {
                    description: "Login and get JWT token",
                    body: { email: "string", password: "string" },
                    response: { message: "string", data: { user: "object", token: "string" } }
                },
                "GET /users/profile": {
                    description: "Get current user profile (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    response: { message: "string", data: "user object" }
                },
                "PUT /users/profile": {
                    description: "Update user profile (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    body: { name: "string (optional)", phone: "string (optional)", avatar: "string (optional)" },
                    response: { message: "string", data: "user object" }
                },
                "POST /users/balance/add": {
                    description: "Add balance to wallet (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    body: { amount: "number" },
                    response: { message: "string", data: { balance: "number" } }
                }
            },
            bikes: {
                "GET /bikes": {
                    description: "Get all available bikes",
                    response: { bikes: "array of bike objects" }
                },
                "GET /bikes/nearby": {
                    description: "Get bikes near a location",
                    query: { lat: "number", lng: "number", radius: "number (meters, optional)" },
                    response: { bikes: "array", count: "number" }
                },
                "GET /bikes/:id": {
                    description: "Get a specific bike by ID",
                    response: { bike: "bike object" }
                },
                "POST /bikes": {
                    description: "Create a new bike (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    body: { bikeId: "string", model: "string", lat: "number", lng: "number", batteryLevel: "number" },
                    response: { message: "string", bike: "bike object" }
                }
            },
            rides: {
                "POST /rides/unlock": {
                    description: "Unlock a bike and start ride (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    body: { bikeId: "string", lat: "number (optional)", lng: "number (optional)" },
                    response: { message: "string", data: { ride: "object", bike: "object" } }
                },
                "PUT /rides/:rideId/end": {
                    description: "End an active ride (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    body: { lat: "number (optional)", lng: "number (optional)" },
                    response: { message: "string", data: { ride: "object", cost: "number", duration: "number", newBalance: "number" } }
                },
                "PUT /rides/:rideId/cancel": {
                    description: "Cancel an active ride (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    response: { message: "string", data: "ride object" }
                },
                "GET /rides/active": {
                    description: "Get current active ride (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    response: { message: "string", data: "ride object" }
                },
                "GET /rides/history": {
                    description: "Get ride history (requires auth)",
                    headers: { Authorization: "Bearer <token>" },
                    query: { page: "number (default 1)", limit: "number (default 10)" },
                    response: { message: "string", data: "array", pagination: "object" }
                }
            }
        },
        authentication: {
            type: "Bearer Token (JWT)",
            header: "Authorization: Bearer <your-token>",
            note: "Get token from /users/login or /users/register"
        },
        status: {
            health: "/health",
            server: "running"
        }
    });
});

// CORS configuration
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://yolo.superuserz.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Initialize Passport
app.use(passport.initialize());
initializePassport(passport);

// Routes
app.use('/users', userRouter);
app.use('/bikes', bikeRouter);
app.use('/rides', rideRouter);

// Health endpoint
app.get("/health", (request, response) => {
    response.status(200).json({
        status: "OK",
        message: "Server is running successfully"
    });
});

// 404 handler
app.use((request, response) => {
    response.status(404).json({
        message: `Route ${request.method} ${request.url} not found`
    });
});

// Error handler
app.use((err, request, response, next) => {
    console.error("Server error:", err);
    response.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚲 YOLO Bike Sharing API                        ║
║                                                   ║
║   Server running on: http://localhost:${PORT}       ║
║   Environment: ${process.env.NODE_ENV || "development"}                      ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
});

module.exports = app;
