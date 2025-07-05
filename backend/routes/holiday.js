import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addHoliday,
  deleteHoliday,
  editHoliday,
  getHolidays,
} from "../controllers/holidayController.js";

const router = express.Router();

// Route to get all holidays
router.get("/", authMiddleware, getHolidays);

// Route to add a holiday
router.post("/add", authMiddleware, addHoliday);

// Route to edit a holiday
router.put("/:_id", authMiddleware, editHoliday);

// Route to delete a holiday
router.delete("/:_id", authMiddleware, deleteHoliday);

export default router;
