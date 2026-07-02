import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../../controllers/cart.controller.js';
import {
  addCartItemValidation,
  updateCartItemValidation,
  removeCartItemValidation,
} from '../../validators/cart.validators.js';

const router = Router();

router.use(authenticate);
router.use(requireRoles('CUSTOMER'));

router.get('/', getCart);
router.post('/items', addCartItemValidation, addCartItem);
router.patch('/items/:itemId', updateCartItemValidation, updateCartItem);
router.delete('/items/:itemId', removeCartItemValidation, removeCartItem);
router.delete('/', clearCart);

export default router;
