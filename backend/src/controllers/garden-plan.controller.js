import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { GardenPlanService } from '../services/garden-plan.service.js';
import {
  GardenPlanRepository,
  GardenCellRepository,
  GardenPlantPlacementRepository,
  GardenNoteRepository,
} from '../repositories/garden-plan.repository.js';

const planRepo = new GardenPlanRepository();
const cellRepo = new GardenCellRepository();
const placementRepo = new GardenPlantPlacementRepository();
const noteRepo = new GardenNoteRepository();
const gardenPlanService = new GardenPlanService(planRepo, cellRepo, placementRepo, noteRepo);

export const listPlans = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.list(req.auth.userId, req.auth.roles);
  return successResponse(res, { message: 'Garden plans retrieved', data: result });
});

export const getPlan = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.getById(req.auth.userId, req.params.planId, req.auth.roles);
  return successResponse(res, { message: 'Garden plan retrieved', data: result });
});

export const createPlan = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.create(req.auth.userId, req.body);
  return successResponse(res, { statusCode: 201, message: 'Garden plan created', data: result });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.update(req.auth.userId, req.params.planId, req.body, req.auth.roles);
  return successResponse(res, { message: 'Garden plan updated', data: result });
});

export const deletePlan = asyncHandler(async (req, res) => {
  await gardenPlanService.remove(req.auth.userId, req.params.planId, req.auth.roles);
  return successResponse(res, { message: 'Garden plan deleted' });
});

export const setDefaultPlan = asyncHandler(async (req, res) => {
  await gardenPlanService.setDefault(req.auth.userId, req.params.planId, req.auth.roles);
  return successResponse(res, { message: 'Default plan updated' });
});

export const updateCell = asyncHandler(async (req, res) => {
  await gardenPlanService.updateCell(
    req.params.planId,
    req.auth.userId,
    parseInt(req.params.row, 10),
    parseInt(req.params.col, 10),
    req.body,
    req.auth.roles,
  );
  return successResponse(res, { message: 'Cell updated' });
});

export const removeCell = asyncHandler(async (req, res) => {
  await gardenPlanService.removeCell(
    req.params.planId,
    req.auth.userId,
    parseInt(req.params.row, 10),
    parseInt(req.params.col, 10),
    req.auth.roles,
  );
  return successResponse(res, { message: 'Cell reset' });
});

export const addPlacement = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.addPlacement(req.params.planId, req.auth.userId, req.body, req.auth.roles);
  return successResponse(res, { statusCode: 201, message: 'Plant placement added', data: result });
});

export const updatePlacement = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.updatePlacement(
    req.params.planId,
    req.auth.userId,
    req.params.placementId,
    req.body,
    req.auth.roles,
  );
  return successResponse(res, { message: 'Placement updated', data: result });
});

export const deletePlacement = asyncHandler(async (req, res) => {
  await gardenPlanService.removePlacement(req.params.planId, req.auth.userId, req.params.placementId, req.auth.roles);
  return successResponse(res, { message: 'Placement removed' });
});

export const listPlacements = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.listPlacements(req.params.planId, req.auth.userId, req.auth.roles);
  return successResponse(res, { message: 'Placements retrieved', data: result });
});

export const addNote = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.addNote(req.params.planId, req.auth.userId, req.body, req.auth.roles);
  return successResponse(res, { statusCode: 201, message: 'Note added', data: result });
});

export const updateNote = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.updateNote(req.params.planId, req.auth.userId, req.params.noteId, req.body, req.auth.roles);
  return successResponse(res, { message: 'Note updated', data: result });
});

export const deleteNote = asyncHandler(async (req, res) => {
  await gardenPlanService.removeNote(req.params.planId, req.auth.userId, req.params.noteId, req.auth.roles);
  return successResponse(res, { message: 'Note deleted' });
});

export const listNotes = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.listNotes(req.params.planId, req.auth.userId, req.auth.roles);
  return successResponse(res, { message: 'Notes retrieved', data: result });
});

export const getSummary = asyncHandler(async (req, res) => {
  const result = await gardenPlanService.getSummary(req.auth.userId);
  return successResponse(res, { message: 'Garden planner summary', data: result });
});
