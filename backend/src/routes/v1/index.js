import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import roleRoutes from './roles.routes.js';
import permissionRoutes from './permissions.routes.js';
import productRoutes from './products.routes.js';
import categoryRoutes from './categories.routes.js';
import inventoryRoutes from './inventory.routes.js';
import cartRoutes from './cart.routes.js';
import checkoutRoutes from './checkout.routes.js';
import orderRoutes from './orders.routes.js';
import deliveryRoutes from './delivery.routes.js';
import loyaltyRoutes from './loyalty.routes.js';
import auditRoutes from './audit.routes.js';
import recommendationRoutes from './recommendations.routes.js';
import chatbotRoutes from './chatbot.routes.js';
import analyticsRoutes from './analytics.routes.js';
import reportsRoutes from './reports.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/audit', auditRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportsRoutes);

export default router;

