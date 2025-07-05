import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import upload from "../config/multer.js";
import { addAllowance, getAllAllowance, updateAllowance, deleteAllowance, getAllowanceAttachment, addVoucherNo, getUserAllowance, approveOrRejectAllowance } from '../controllers/allowanceController.js';

const router = express.Router();

// Route to get all allowances
router.get('/', authMiddleware, getAllAllowance);

// Route to get user allowances
router.get('/get-user-allowances/:userId', authMiddleware, getUserAllowance);

// Route to add an allowance
router.post('/add', authMiddleware, upload.single("attachment"), addAllowance);

// Route to update an allowance
router.put('/:_id', authMiddleware, upload.single("attachment"), updateAllowance);

// Route to delete an allowance
router.delete('/:_id', authMiddleware, deleteAllowance);

// Route to approve/reject an allowance
router.post("/:action/:allowanceId", authMiddleware, approveOrRejectAllowance);

// Route to get the attachment for the allowance
router.get("/attachment/:_id", getAllowanceAttachment);

// Route to add voucher no for allowance
router.put('/add-voucher/:_id', authMiddleware, addVoucherNo);


export default router;