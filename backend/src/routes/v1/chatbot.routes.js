import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  startConversation,
  listConversations,
  getConversation,
  sendMessage,
  quickAsk,
  submitFeedback,
  archiveConversation,
  deleteConversation,
  listKnowledge,
  getKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from '../../controllers/chatbot.controller.js';
import {
  startConversationValidation,
  sendMessageValidation,
  quickAskValidation,
  feedbackValidation,
  conversationIdValidation,
  knowledgeCreateValidation,
  knowledgeUpdateValidation,
  knowledgeIdValidation,
} from '../../validators/chatbot.validators.js';

const router = Router();

router.use(authenticate);

router.post('/conversations', startConversationValidation, startConversation);
router.get('/conversations', listConversations);
router.get('/conversations/:id', conversationIdValidation, getConversation);
router.post('/conversations/:id/messages', sendMessageValidation, sendMessage);
router.post('/conversations/:id/archive', conversationIdValidation, archiveConversation);
router.delete('/conversations/:id', conversationIdValidation, deleteConversation);

router.post('/ask', quickAskValidation, quickAsk);
router.post('/messages/:messageId/feedback', feedbackValidation, submitFeedback);

router.get('/knowledge', requireRoles('ADMIN'), listKnowledge);
router.get('/knowledge/:id', requireRoles('ADMIN'), knowledgeIdValidation, getKnowledge);
router.post('/knowledge', requireRoles('ADMIN'), knowledgeCreateValidation, createKnowledge);
router.patch('/knowledge/:id', requireRoles('ADMIN'), knowledgeUpdateValidation, updateKnowledge);
router.delete('/knowledge/:id', requireRoles('ADMIN'), knowledgeIdValidation, deleteKnowledge);

export default router;
