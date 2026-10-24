import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getParentChildren,
  getSelf,
  getTeacherStudents,
  getUsers,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();
const accountManagers = ['super_admin', 'admin', 'principal', 'teacher'];

router.use(protect);
router.get('/me', getSelf);
router.get('/parents/me/children', restrictTo('parent'), getParentChildren);
router.get('/teachers/me/students', restrictTo('teacher'), getTeacherStudents);
router.get('/', getUsers);
router.post('/', restrictTo(...accountManagers), createUser);
router.delete('/:id', restrictTo(...accountManagers), deleteUser);

export default router;
