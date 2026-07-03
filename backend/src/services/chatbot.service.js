import { BaseService } from './base.service.js';
import { ChatbotEngine } from './chatbot-engine.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';

export class ChatbotService extends BaseService {
  constructor(conversationRepository, messageRepository, feedbackRepository, knowledgeRepository) {
    super(conversationRepository);
    this.messageRepository = messageRepository;
    this.feedbackRepository = feedbackRepository;
    this.knowledgeRepository = knowledgeRepository;
    this.engine = new ChatbotEngine();
  }

  async startConversation(userId, data) {
    const conversation = await this.repository.create({
      userId,
      title: data.title || 'Chatbot Conversation',
      contextType: data.contextType || 'GENERAL',
      contextId: data.contextId || null,
    });
    await logAuditEvent(getPrismaClient(), { action: 'chatbot_conversation_started', userId, conversationId: conversation.id });
    return conversation;
  }

  async listConversations(userId, userRoles, queryParams) {
    const { status, page, limit, userId: queryUserId } = queryParams;
    if (userRoles.includes('ADMIN') && queryUserId) {
      return this.repository.findByUserId(queryUserId, status, parseInt(page) || 1, parseInt(limit) || 20);
    }
    return this.repository.findByUserId(userId, status, parseInt(page) || 1, parseInt(limit) || 20);
  }

  async getConversation(userId, conversationId, userRoles) {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }
    if (conversation.userId !== userId && !userRoles.includes('ADMIN')) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    return conversation;
  }

  async sendMessage(userId, conversationId, data) {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }
    if (conversation.userId !== userId && !data._adminBypass) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const userMessage = await this.messageRepository.create({
      conversationId,
      sender: 'USER',
      message: data.message,
      metadata: data.context || null,
    });

    const engineResult = await this.engine.processMessage(data.message, {
      productId: data.context?.productId,
      gardenPlanId: data.context?.gardenPlanId,
    });

    const botMessage = await this.messageRepository.create({
      conversationId,
      sender: 'BOT',
      message: engineResult.message,
      intent: engineResult.intent,
      responseType: engineResult.responseType,
      metadata: {
        suggestedActions: engineResult.suggestedActions,
        suggestedProducts: engineResult.suggestedProducts,
        knowledgeMatches: engineResult.knowledgeMatches,
      },
    });

    await this.repository.update(conversationId, {
      updatedAt: new Date(),
      ...(conversation.title === 'Chatbot Conversation' && data.message.length < 80
        ? { title: data.message.substring(0, 200) }
        : {}),
    });

    await logAuditEvent(getPrismaClient(), { action: 'chatbot_message_sent', userId, conversationId, intent: engineResult.intent });

    return {
      userMessage,
      botMessage: {
        id: botMessage.id,
        message: botMessage.message,
        intent: botMessage.intent,
        responseType: botMessage.responseType,
        suggestedActions: engineResult.suggestedActions,
        suggestedProducts: engineResult.suggestedProducts,
        createdAt: botMessage.createdAt,
      },
    };
  }

  async quickAsk(userId, data) {
    const conversation = await this.repository.create({
      userId,
      title: data.message.substring(0, 200),
      contextType: 'GENERAL',
    });

    await this.messageRepository.create({
      conversationId: conversation.id,
      sender: 'USER',
      message: data.message,
    });

    const engineResult = await this.engine.processMessage(data.message);

    const botMessage = await this.messageRepository.create({
      conversationId: conversation.id,
      sender: 'BOT',
      message: engineResult.message,
      intent: engineResult.intent,
      responseType: engineResult.responseType,
      metadata: {
        suggestedActions: engineResult.suggestedActions,
        suggestedProducts: engineResult.suggestedProducts,
      },
    });

    await logAuditEvent(getPrismaClient(), { action: 'chatbot_message_sent', userId, conversationId: conversation.id, intent: engineResult.intent });

    return {
      conversationId: conversation.id,
      message: botMessage.message,
      intent: botMessage.intent,
      responseType: botMessage.responseType,
      suggestedActions: engineResult.suggestedActions,
      suggestedProducts: engineResult.suggestedProducts,
    };
  }

  async submitFeedback(userId, messageId, data) {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
    }
    if (message.sender !== 'BOT') {
      throw new AppError('Can only provide feedback on bot messages', 400, 'INVALID_FEEDBACK_TARGET');
    }
    const feedback = await this.feedbackRepository.create({
      conversationId: message.conversationId,
      messageId,
      userId,
      rating: data.rating,
      comment: data.comment || null,
    });
    await logAuditEvent(getPrismaClient(), { action: 'chatbot_feedback_submitted', userId, messageId, rating: data.rating });
    return feedback;
  }

  async archiveConversation(userId, conversationId) {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }
    if (conversation.userId !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    const result = await this.repository.update(conversationId, { status: 'ARCHIVED', archivedAt: new Date() });
    await logAuditEvent(getPrismaClient(), { action: 'chatbot_conversation_archived', userId, conversationId });
    return result;
  }

  async deleteConversation(userId, conversationId) {
    const conversation = await this.repository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }
    if (conversation.userId !== userId) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
    await this.repository.update(conversationId, { status: 'CLOSED', archivedAt: new Date() });
    await logAuditEvent(getPrismaClient(), { action: 'chatbot_conversation_deleted', userId, conversationId });
  }

  async listKnowledge(activeOnly = true) {
    return this.knowledgeRepository.findAll(activeOnly);
  }

  async getKnowledge(id) {
    const item = await this.knowledgeRepository.findById(id);
    if (!item) throw new AppError('Knowledge item not found', 404, 'KNOWLEDGE_NOT_FOUND');
    return item;
  }

  async createKnowledge(data) {
    const item = await this.knowledgeRepository.create(data);
    await logAuditEvent(getPrismaClient(), { action: 'knowledge_base_created', data: { title: data.title, category: data.category } });
    return item;
  }

  async updateKnowledge(id, data) {
    const item = await this.knowledgeRepository.findById(id);
    if (!item) throw new AppError('Knowledge item not found', 404, 'KNOWLEDGE_NOT_FOUND');
    const updated = await this.knowledgeRepository.update(id, data);
    await logAuditEvent(getPrismaClient(), { action: 'knowledge_base_updated', id });
    return updated;
  }

  async deleteKnowledge(id) {
    const item = await this.knowledgeRepository.findById(id);
    if (!item) throw new AppError('Knowledge item not found', 404, 'KNOWLEDGE_NOT_FOUND');
    await this.knowledgeRepository.delete(id);
    await logAuditEvent(getPrismaClient(), { action: 'knowledge_base_deleted', id });
  }
}
