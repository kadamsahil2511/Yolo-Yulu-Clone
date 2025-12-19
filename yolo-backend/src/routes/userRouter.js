const express = require("express");
const { authenticateLocal, authenticateJWT } = require("../middlewares/passportAuth");
const { register, login, getProfile, updateProfile, addBalance } = require("../controllers/userController");

const router = express.Router();

router.post("/register", register);
router.post("/login", authenticateLocal, login);
router.get("/profile", authenticateJWT, getProfile);
router.put("/profile", authenticateJWT, updateProfile);
router.post("/balance/add", authenticateJWT, addBalance);

module.exports = router;
