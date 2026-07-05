import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PlantCareReminderService } from '../services/plant-care-reminder.service.js';

const plantCareReminderService = new PlantCareReminderService();

export const sendPlantCareReminders = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  const tips = await plantCareReminderService.generateRandomCareTips(userId);
  
  return successResponse(res, {
    message: `Plant care tips sent successfully (${tips.length} tips)`,
    data: { tips }
  });
});