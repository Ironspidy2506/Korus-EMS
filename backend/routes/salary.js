import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { getAllSalaries, addSalary, updateSalary, deleteSalary, getUserSalaries, } from '../controllers/salaryController.js';

const router = express.Router();

// Route to get all salaries
router.get('/', authMiddleware, getAllSalaries)

// Route to add salary
router.post('/add', authMiddleware, addSalary);

// Route to update a salary
router.put('/:_id', authMiddleware, updateSalary);

// Route to delete a salary
router.delete('/:_id', authMiddleware, deleteSalary)

// Route to get user salaries
router.get('/get-user-salaries/:userId', authMiddleware, getUserSalaries)


export default router;