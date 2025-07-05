import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getUsersData,
  getUserData,
  deleteUserData,
} from "../controllers/userController.js";

const router = express.Router();

// Route to get all users
router.get("/", authMiddleware, getUsersData);

// Route to get user by id
router.get("/:userId", authMiddleware, getUserData);

// Route to delete user
router.delete("/delete/:userId", authMiddleware, deleteUserData);


export default router;
