import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../config/multer.js';
import { addEmployee, getEmployees, updateEmployee, deleteEmployee, updateEmployeeLeaveBalance, updateEmployeeJourney } from '../controllers/employeeController.js';

const router = express.Router();

// Route to get all employees
router.get('/', authMiddleware, getEmployees);

// Route to add an employee
router.post('/add', authMiddleware, upload.single("profileImage"), addEmployee);

// Route to update an employee
router.put('/:_id', authMiddleware, upload.single("profileImage"), updateEmployee);

// Route to delete an employee
router.delete('/:_id', authMiddleware, deleteEmployee);

// Route to edit employee leave balances
router.put('/edit-leave-balance/:employeeId', authMiddleware, updateEmployeeLeaveBalance);

// Route to update employee journey
router.put('/update-journey/:employeeId', authMiddleware, updateEmployeeJourney)

export default router;