import express from 'express';
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
router.get('/', getAllLTCs);

// Get LTCs for a specific user
router.get('/user/:employeeId', getUserLTCs);

// Add new LTC
router.post('/', upload.single('attachment'), addLTC);

// Update LTC
router.put('/:id', upload.single('attachment'), updateLTC);

// Delete LTC
router.delete('/:id', deleteLTC);

// Approve LTC
router.post('/:id/approve', approveOrRejectLTC);

// Reject LTC
router.post('/:id/reject', approveOrRejectLTC);

// Get attachment
router.get('/:id/attachment', getLTCAttachment);

export default router; 