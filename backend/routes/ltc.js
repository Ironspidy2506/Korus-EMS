import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';
import {
  getAllLTCs,
  getUserLTCs,
  addLTC,
  updateLTC,
  deleteLTC,
  approveOrRejectLTC,
  getLTCAttachment
} from '../controllers/ltcController.js';

const router = express.Router();

// Get all LTCs
router.get('/', authMiddleware, getAllLTCs);

// Get LTCs for a specific user
router.get('/user/:userId', authMiddleware, getUserLTCs);

// Add new LTC
router.post('/', authMiddleware, upload.single('attachment'), addLTC);

// Update LTC
router.put('/:id', authMiddleware, upload.single('attachment'), updateLTC);

// Delete LTC
router.delete('/:id', authMiddleware, deleteLTC);

// Approve LTC
router.post('/:id/approve', authMiddleware, approveOrRejectLTC);

// Reject LTC
router.post('/:id/reject', authMiddleware, approveOrRejectLTC);

// Get attachment
router.get('/attachment/:id', getLTCAttachment);

export default router; 