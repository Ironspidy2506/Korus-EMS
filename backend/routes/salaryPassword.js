import express from "express";
import { verifySalaryPassword, setSalaryPassword, sendSalaryPasswordResetOtp, resetSalaryPassword } from "../controllers/salaryPasswordController.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Verify salary password
router.post("/verify", verifySalaryPassword);

// Set salary password
router.post("/set", setSalaryPassword);

// Send reset OTP
router.post("/send-reset-otp", sendSalaryPasswordResetOtp);

// Reset password using OTP
router.post("/reset", resetSalaryPassword);

export default router;
