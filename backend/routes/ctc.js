import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMonthWiseCTC,
  getYearWiseCTC,
  getEmployeeWiseCTC,
} from "../controllers/ctcController.js";

const router = express.Router();

router.get("/monthly/:month/:year", authMiddleware, getMonthWiseCTC);
router.get("/yearly/:year", authMiddleware, getYearWiseCTC);
router.get("/employee/:employeeId", authMiddleware, getEmployeeWiseCTC);

export default router;
