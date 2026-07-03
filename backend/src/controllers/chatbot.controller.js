import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ChatbotService } from '../services/chatbot.service.js';
import {
  ChatbotConversationRepository,
  ChatbotMessageRepository,
  ChatbotFeedbackRepository,
  ChatbotKnowledgeBaseRepository,
} from '../repositories/chatbot.repository.js';

const convRepo = new ChatbotConversationRepository();
const msgRepo = new ChatbotMessageRepository();
const fbRepo = new ChatbotFeedbackRepository();
const kbRepo = new ChatbotKnowledgeBaseRepository();
const chatbotService = new ChatbotService(convRepo, msgRepo, fbRepo, kbRepo);

export const startConversation = asyncHandler(async (req, res) => {
  const result = await chatbotService.startConversation(req.auth.userId, req.body);
  return successResponse(res, { statusCode: 201, message: 'Conversation started successfully', data: { conversation: result } });
});

export const listConversations = asyncHandler(async (req, res) => {
  const result = await chatbotService.listConversations(req.auth.userId, req.auth.roles, req.query);
  return successResponse(res, { message: 'Conversations retrieved', data: result });
});

export const getConversation = asyncHandler(async (req, res) => {
  const result = await chatbotService.getConversation(req.auth.userId, req.params.id, req.auth.roles);
  return successResponse(res, { message: 'Conversation retrieved', data: result });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const result = await chatbotService.sendMessage(req.auth.userId, req.params.id, req.body);
  return successResponse(res, { message: 'Message processed successfully', data: result });
});

export const quickAsk = asyncHandler(async (req, res) => {
  const result = await chatbotService.quickAsk(req.auth.userId, req.body);
  return successResponse(res, { message: 'Response generated', data: result });
});

export const submitFeedback = asyncHandler(async (req, res) => {
  const result = await chatbotService.submitFeedback(req.auth.userId, req.params.messageId, req.body);
  return successResponse(res, { message: 'Feedback submitted', data: result });
});

export const archiveConversation = asyncHandler(async (req, res) => {
  const result = await chatbotService.archiveConversation(req.auth.userId, req.params.id);
  return successResponse(res, { message: 'Conversation archived', data: result });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  await chatbotService.deleteConversation(req.auth.userId, req.params.id);
  return successResponse(res, { message: 'Conversation closed' });
});

export const listKnowledge = asyncHandler(async (req, res) => {
  const result = await chatbotService.listKnowledge(req.query.active !== 'false');
  return successResponse(res, { message: 'Knowledge base retrieved', data: result });
});

export const getKnowledge = asyncHandler(async (req, res) => {
  const result = await chatbotService.getKnowledge(req.params.id);
  return successResponse(res, { message: 'Knowledge item retrieved', data: result });
});

export const createKnowledge = asyncHandler(async (req, res) => {
  const result = await chatbotService.createKnowledge(req.body);
  return successResponse(res, { statusCode: 201, message: 'Knowledge item created', data: result });
});

export const updateKnowledge = asyncHandler(async (req, res) => {
  const result = await chatbotService.updateKnowledge(req.params.id, req.body);
  return successResponse(res, { message: 'Knowledge item updated', data: result });
});

export const deleteKnowledge = asyncHandler(async (req, res) => {
  await chatbotService.deleteKnowledge(req.params.id);
  return successResponse(res, { message: 'Knowledge item deactivated' });
});
