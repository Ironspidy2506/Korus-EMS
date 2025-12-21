import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// Route to get all notifications
router.get("/get-all-notifications", authMiddleware, getAllNotifications);

export default router;

