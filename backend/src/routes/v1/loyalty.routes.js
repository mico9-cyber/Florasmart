import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  getMyAccount,
  getMyTransactions,
  getRewards,
  redeemReward,
  getMyRedemptions,
  getAdminAccounts,
  adjustPoints,
  getAdminRewards,
  createReward,
  updateReward,
  deleteReward,
  getAdminRedemptions,
  getAdminTransactions,
} from '../../controllers/loyalty.controller.js';
import {
  rewardIdValidation,
  userIdParamValidation,
  adjustPointsValidation,
  createRewardValidation,
  updateRewardValidation,
  paginationValidation,
  adminTransactionsValidation,
} from '../../validators/loyalty.validators.js';

const router = Router();

router.use(authenticate);

router.get('/me', requireRoles('CUSTOMER'), getMyAccount);
router.get('/transactions', requireRoles('CUSTOMER'), paginationValidation, getMyTransactions);
router.get('/rewards', requireRoles('CUSTOMER'), getRewards);
router.post('/rewards/:id/redeem', requireRoles('CUSTOMER'), rewardIdValidation, redeemReward);
router.get('/redemptions', requireRoles('CUSTOMER'), paginationValidation, getMyRedemptions);

router.get('/admin/accounts', requireRoles('ADMIN'), paginationValidation, getAdminAccounts);
router.post('/admin/accounts/:userId/adjust', requireRoles('ADMIN'), adjustPointsValidation, adjustPoints);
router.get('/admin/rewards', requireRoles('ADMIN'), getAdminRewards);
router.post('/admin/rewards', requireRoles('ADMIN'), createRewardValidation, createReward);
router.patch('/admin/rewards/:id', requireRoles('ADMIN'), updateRewardValidation, updateReward);
router.delete('/admin/rewards/:id', requireRoles('ADMIN'), rewardIdValidation, deleteReward);
router.get('/admin/redemptions', requireRoles('ADMIN'), paginationValidation, getAdminRedemptions);
router.get('/admin/transactions', requireRoles('ADMIN'), adminTransactionsValidation, getAdminTransactions);

export default router;
