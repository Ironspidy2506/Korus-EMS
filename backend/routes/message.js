import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addMessage,
  deleteMessage,
  editMessage,
  getAllMessages,
  getMessageById,
  getUsersMessage,
  replyMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Route to get all messages
router.get("/get-all-messages", authMiddleware, getAllMessages);

// Route to add a message
router.post("/add-message", authMiddleware, addMessage);

// Route to edit a message
router.post("/edit-message/:messageId", authMiddleware, editMessage);

// Route to delete a message
router.delete("/delete-message/:messageId", authMiddleware, deleteMessage);

// Route to get users message
router.get("/get-users-message/:userId", authMiddleware, getUsersMessage);

// Route to get a message by id
router.get("/get-message-by-id/:messageId", authMiddleware, getMessageById);

// Route to reply to a message
router.post("/reply-message/:messageId", authMiddleware, replyMessage);



export default router;
