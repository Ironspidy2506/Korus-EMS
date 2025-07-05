import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import { addFixedAllowance, addVoucherNo, deleteFixedAllowance, getAllFixedAllowance, getFixedAllowanceAttachment, getUserFixedAllowance, updateFixedAllowance } from "../controllers/fixedallowancecontroller.js";


const router = express.Router();

// Route to get all allowances
router.get('/', authMiddleware, getAllFixedAllowance);

// Route to get user fixed allowances
router.get('/get-user-fixed-allowances/:userId', authMiddleware, getUserFixedAllowance);

// Route to add an allowance
router.post('/add', authMiddleware, upload.single("attachment"), addFixedAllowance);

// Route to update an allowance
router.put('/:_id', authMiddleware, upload.single("attachment"), updateFixedAllowance);

// Route to delete an allowance
router.delete('/:_id', authMiddleware, deleteFixedAllowance);

// Route to get the attachment for the fixed allowance
router.get("/attachment/:_id", getFixedAllowanceAttachment);

// Route to add voucher no for fixed allowance
router.put('/add-voucher/:_id', authMiddleware, addVoucherNo);

export default router;
