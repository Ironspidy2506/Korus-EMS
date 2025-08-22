import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import upload from "../config/multer.js";
import { 
  getAllTravelExpenditures, 
  getUserTravelExpenditures, 
  addTravelExpenditure, 
  updateTravelExpenditure, 
  deleteTravelExpenditure, 
  approveOrRejectTravelExpenditure, 
  addVoucherNo, 
  updateVoucherNo,
  getTravelExpenditureAttachment
} from '../controllers/travelExpenditureController.js';

const router = express.Router();

// Route to get all travel expenditures
router.get('/', authMiddleware, getAllTravelExpenditures);

// Route to get user travel expenditures
router.get('/get-user-travel-expenditures/:userId', authMiddleware, getUserTravelExpenditures);

// Route to add a travel expenditure
router.post('/add', authMiddleware, upload.single("attachment"), addTravelExpenditure);

// Route to update a travel expenditure
router.put('/:_id', authMiddleware, upload.single("attachment"), updateTravelExpenditure);

// Route to delete a travel expenditure
router.delete('/:_id', authMiddleware, deleteTravelExpenditure);

// Route to approve/reject a travel expenditure
router.post("/:action/:travelExpenditureId", authMiddleware, approveOrRejectTravelExpenditure);

// Route to get the attachment for the travel expenditure
router.get("/attachment/:_id", getTravelExpenditureAttachment);

// Route to add voucher no for travel expenditure
router.put('/add-voucher/:_id', authMiddleware, addVoucherNo);

// Route to update voucher no for travel expenditure
router.put('/update-voucher/:_id', authMiddleware, updateVoucherNo);

export default router; 