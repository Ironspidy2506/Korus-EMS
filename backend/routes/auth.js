import express from "express";
import { login, resetPassword, sendResetOtp, verify } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// Route for user login
router.post('/login', login);

// Route to verify a user
router.get('/verify', authMiddleware, verify);

// Route to send a reset password otp
router.post('/send-reset-otp', sendResetOtp);

// Route to reset password
router.post('/reset-password', resetPassword);

export default router;
