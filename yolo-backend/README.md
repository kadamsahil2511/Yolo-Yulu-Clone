# YOLO Bike Sharing API

A RESTful API for bike sharing application built with Express.js and MongoDB.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database
node scripts/seed.js

# Start development server
npm run dev
```

## Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/bikeShare
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Authentication
All protected routes require: `Authorization: Bearer <token>`

---

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Register new user | ❌ |
| POST | `/users/login` | Login & get token | ❌ |
| GET | `/users/profile` | Get user profile | ✅ |
| PUT | `/users/profile` | Update profile | ✅ |
| POST | `/users/balance/add` | Add wallet balance | ✅ |

**Register/Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

### Bikes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/bikes` | Get all available bikes | ❌ |
| GET | `/bikes/nearby?lat=18.52&lng=73.85` | Get nearby bikes | ❌ |
| GET | `/bikes/:id` | Get bike by ID | ❌ |
| POST | `/bikes` | Create new bike | ✅ |
| PUT | `/bikes/:id` | Update bike | ✅ |
| DELETE | `/bikes/:id` | Delete bike | ✅ |

---

### Rides

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/rides/unlock` | Start a ride | ✅ |
| PUT | `/rides/:rideId/end` | End a ride | ✅ |
| PUT | `/rides/:rideId/cancel` | Cancel a ride | ✅ |
| GET | `/rides/active` | Get active ride | ✅ |
| GET | `/rides/history` | Get ride history | ✅ |

**Unlock Bike Request:**
```json
{
  "bikeId": "BIKE001",
  "lat": 18.5204,
  "lng": 73.8567
}
```

---

## Project Structure

```
yolo-backend/
├── src/
│   ├── config/
│   │   ├── db.js          # Database connection
│   │   └── passport.js     # JWT/Local strategies
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── bikeController.js
│   │   └── rideController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── passportAuth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Bike.js
│   │   └── Ride.js
│   └── routes/
│       ├── userRouter.js
│       ├── bikeRouter.js
│       └── rideRouter.js
├── scripts/
│   └── seed.js            # Database seeding
├── server.js              # Entry point
└── package.json
```

## Response Format

All responses follow this format:
```json
{
  "message": "Success message",
  "data": { }
}
```

## License

ISC
