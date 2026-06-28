import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/category.controller.js';
import {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
  listCategoriesValidation,
} from '../../validators/category.validators.js';

const router = Router();

router.get('/', listCategoriesValidation, listCategories);
router.get('/:id', categoryIdValidation, getCategory);
router.post('/', authenticate, requireRoles('ADMIN', 'FLORIST'), createCategoryValidation, createCategory);
router.patch('/:id', authenticate, requireRoles('ADMIN', 'FLORIST'), updateCategoryValidation, updateCategory);
router.delete('/:id', authenticate, requireRoles('ADMIN'), categoryIdValidation, deleteCategory);

export default router;
