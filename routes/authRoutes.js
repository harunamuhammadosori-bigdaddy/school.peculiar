import { Router } from 'express';
import { adminLogin, changePassword, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.patch('/password', protect, changePassword);

export default router;
