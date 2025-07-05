import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  applyHelp,
  updateHelp,
  getAllHelps,
  resolveHelp,
  deleteHelp,
  addResponse,
  getUserHelps
} from "../controllers/helpdeskController.js";

const router = express.Router();

// Route to get all helpdesk tickets
router.get("/", authMiddleware, getAllHelps);

// Route to apply for helpdesk
router.post("/add", authMiddleware, applyHelp);

// Route to update helpdesk ticket
router.put("/:_id", authMiddleware, updateHelp);

// Route to delete helpdesk ticket
router.delete("/:_id", authMiddleware, deleteHelp);

// Route to resolve helpdesk ticket
router.put("/resolve-help/:_id", authMiddleware, resolveHelp);

// Route to add response to helpdesk ticket
router.put("/add-response/:helpId", authMiddleware, addResponse);

// Route to get user helpdesk tickets
router.get("/get-user-helpdesks/:userId", authMiddleware, getUserHelps);

export default router;
