import { Router } from 'express';
import { getStudents } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', protect, restrictTo('super_admin', 'admin', 'principal', 'teacher', 'parent', 'student'), getStudents);

export default router;
