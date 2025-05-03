import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updatePassword,
  updateUser
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Admin-only: List all users
router.get('/', authenticate, authorize(['admin']), getAllUsers);

// Admin-only: Get user details
router.get('/:id', authenticate, authorize(['admin']), getUserById);

// Authenticated user: Update own password
router.put('/password', authenticate, updatePassword);
router.put("/:id",authenticate, authorize(['admin']), updateUser);

export default router;
