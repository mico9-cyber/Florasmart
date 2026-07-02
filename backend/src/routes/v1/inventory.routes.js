import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  getInventorySummary,
  listStock,
  getStockById,
  adjustStock,
  listMovements,
  getLowStock,
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../controllers/inventory.controller.js';
import {
  adjustStockValidation,
  listStockValidation,
  stockIdValidation,
  listMovementsValidation,
  createLocationValidation,
  updateLocationValidation,
  locationIdValidation,
} from '../../validators/inventory.validators.js';

const router = Router();

router.use(authenticate);

router.get('/summary', requireRoles('ADMIN', 'FLORIST'), getInventorySummary);

router.get('/stock', requireRoles('ADMIN', 'FLORIST'), listStockValidation, listStock);
router.get('/stock/:id', requireRoles('ADMIN', 'FLORIST'), stockIdValidation, getStockById);

router.post('/adjust', requireRoles('ADMIN', 'FLORIST'), adjustStockValidation, adjustStock);

router.get('/movements', requireRoles('ADMIN', 'FLORIST'), listMovementsValidation, listMovements);

router.get('/low-stock', requireRoles('ADMIN', 'FLORIST'), getLowStock);

router.get('/locations', requireRoles('ADMIN', 'FLORIST'), listLocations);
router.get('/locations/:id', requireRoles('ADMIN', 'FLORIST'), locationIdValidation, getLocationById);
router.post('/locations', requireRoles('ADMIN'), createLocationValidation, createLocation);
router.patch('/locations/:id', requireRoles('ADMIN'), updateLocationValidation, updateLocation);
router.delete('/locations/:id', requireRoles('ADMIN'), locationIdValidation, deleteLocation);

export default router;
