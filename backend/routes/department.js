import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { addDepartment, getDepartments, getDepartment, updateDepartment , deleteDepartment} from '../controllers/departmentController.js';


const router = express.Router();

// Route to get all the departments
router.get('/', authMiddleware, getDepartments);

// Route to add a department
router.post('/add', authMiddleware, addDepartment);

// Route to edit a department
router.put('/:_id', authMiddleware, updateDepartment);

// Route to delete a department
router.delete('/:_id', authMiddleware, deleteDepartment);

// Route to get a department by ID
router.get('/:_id', authMiddleware, getDepartment);

export default router;