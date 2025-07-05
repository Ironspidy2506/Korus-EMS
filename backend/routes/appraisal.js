import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAppraisals,
  addAppraisal,
  editAppraisal,
  deleteAppraisal,
  getAppraisalsTeamLead,
  getUserAppraisals,
} from "../controllers/appraisalController.js";
const router = express.Router();

// Route to get all appraisals
router.get("/", authMiddleware, getAppraisals);

// Route to add an appraisal
router.post("/add", authMiddleware, addAppraisal);

// Route to edit an appraisal
router.put("/:id", authMiddleware, editAppraisal);

// Route to delete an appraisal
router.delete("/delete-appraisal/:id", authMiddleware, deleteAppraisal);

// Route to get user appraisals
router.get("/get-user-appraisals/:userId", authMiddleware, getUserAppraisals);

// Route to allow team lead to view added appraisals
router.get('/view-appraisals-teamlead/:userId', authMiddleware, getAppraisalsTeamLead)

export default router;
