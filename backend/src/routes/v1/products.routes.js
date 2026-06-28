import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  listProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/product.controller.js';
import {
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  productSlugValidation,
  listProductsValidation,
} from '../../validators/product.validators.js';

const router = Router();

router.get('/', listProductsValidation, listProducts);
router.get('/slug/:slug', productSlugValidation, getProductBySlug);
router.get('/:id', productIdValidation, getProduct);
router.post('/', authenticate, requireRoles('ADMIN', 'FLORIST'), createProductValidation, createProduct);
router.patch('/:id', authenticate, requireRoles('ADMIN', 'FLORIST'), updateProductValidation, updateProduct);
router.delete('/:id', authenticate, requireRoles('ADMIN'), productIdValidation, deleteProduct);

export default router;
