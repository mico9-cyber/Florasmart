import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  setDefaultPlan,
  updateCell,
  removeCell,
  addPlacement,
  updatePlacement,
  deletePlacement,
  listPlacements,
  addNote,
  updateNote,
  deleteNote,
  listNotes,
  getSummary,
} from '../../controllers/garden-plan.controller.js';
import {
  createPlanValidation,
  updatePlanValidation,
  planIdValidation,
  updateCellValidation,
  addPlacementValidation,
  updatePlacementValidation,
  placementIdValidation,
  addNoteValidation,
  updateNoteValidation,
  noteIdValidation,
} from '../../validators/garden-plan.validators.js';

const router = Router();

router.use(authenticate);
router.use(requireRoles('CUSTOMER', 'GARDENER', 'ADMIN', 'FLORIST'));

router.get('/', listPlans);
router.post('/', createPlanValidation, createPlan);
router.get('/summary/me', getSummary);
router.get('/:planId', planIdValidation, getPlan);
router.patch('/:planId', updatePlanValidation, updatePlan);
router.delete('/:planId', planIdValidation, deletePlan);
router.post('/:planId/default', planIdValidation, setDefaultPlan);

router.put('/:planId/cells/:row/:col', updateCellValidation, updateCell);
router.delete('/:planId/cells/:row/:col', updateCellValidation, removeCell);

router.get('/:planId/placements', planIdValidation, listPlacements);
router.post('/:planId/placements', addPlacementValidation, addPlacement);
router.patch('/:planId/placements/:placementId', updatePlacementValidation, updatePlacement);
router.delete('/:planId/placements/:placementId', placementIdValidation, deletePlacement);

router.get('/:planId/notes', planIdValidation, listNotes);
router.post('/:planId/notes', addNoteValidation, addNote);
router.patch('/:planId/notes/:noteId', updateNoteValidation, updateNote);
router.delete('/:planId/notes/:noteId', noteIdValidation, deleteNote);

export default router;
