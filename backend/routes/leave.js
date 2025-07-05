import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import {
  getAllLeaves,
  getLeaveHistory,
  getUserLeaveForApprovals,
  applyForLeave,
  updateLeaveById,
  deleteLeaveById,
  approveOrReject,
  getLeaveAttachment,
  updateReasonOfRejection,
} from "../controllers/leaveController.js";

const router = express.Router();

// Route to get all leaves
router.get('/', authMiddleware, getAllLeaves);

// Route to get user leaves
router.get('/get-user-leaves/:userId', authMiddleware, getLeaveHistory)

// Route to get leave the user leave for approvals
router.get('/get-leaves-for-approval/:userId', authMiddleware, getUserLeaveForApprovals)

// Route to apply for leave
router.post(
  "/apply/:userId",
  authMiddleware,
  upload.single("attachment"),
  applyForLeave
);

// Route to update a leave
router.put(
  "/edit/:_id",
  authMiddleware,
  upload.single("attachment"),
  updateLeaveById
);

// Route to delete a leave
router.delete("/:_id", authMiddleware, deleteLeaveById);

// Route to approve or reject a leave
router.post("/:action/:leaveId", authMiddleware, approveOrReject);

// Route to get the attachment of a leave
router.get("/attachment/:leaveId", getLeaveAttachment);

// Route to update the reason of rejection
router.post('/update/ror/:leaveId', authMiddleware, updateReasonOfRejection)

export default router;
