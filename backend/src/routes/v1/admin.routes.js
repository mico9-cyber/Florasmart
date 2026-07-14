import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  listUsersValidation, createUserValidation, userIdValidation, updateUserValidation,
} from '../../validators/admin.validators.js';
import {
  listUsers, getUser, createUser, updateUser, toggleUserStatus, deleteUser,
} from '../../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/users', listUsersValidation, listUsers);
router.post('/users', createUserValidation, createUser);
router.get('/users/:id', userIdValidation, getUser);
router.patch('/users/:id', updateUserValidation, updateUser);
router.patch('/users/:id/status', userIdValidation, toggleUserStatus);
router.delete('/users/:id', userIdValidation, deleteUser);

export default router;
