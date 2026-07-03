import { del, get, patch, post } from './api';
export const chatbotService = {
  quickAsk: (payload) => post('/chatbot/ask', payload, { requiresAuth: true }),
  startConversation: (payload) => post('/chatbot/conversations', payload, { requiresAuth: true }),
  listConversations: (query = '') => get(`/chatbot/conversations${query}`, { requiresAuth: true }),
  getConversation: (id) => get(`/chatbot/conversations/${id}`, { requiresAuth: true }),
  sendMessage: (id, payload) => post(`/chatbot/conversations/${id}/messages`, payload, { requiresAuth: true }),
  archiveConversation: (id) => post(`/chatbot/conversations/${id}/archive`, {}, { requiresAuth: true }),
  removeConversation: (id) => del(`/chatbot/conversations/${id}`, { requiresAuth: true }),
  submitFeedback: (messageId, payload) => post(`/chatbot/messages/${messageId}/feedback`, payload, { requiresAuth: true }),
  knowledge: () => get('/chatbot/knowledge', { requiresAuth: true }),
  knowledgeById: (id) => get(`/chatbot/knowledge/${id}`, { requiresAuth: true }),
  createKnowledge: (payload) => post('/chatbot/knowledge', payload, { requiresAuth: true }),
  updateKnowledge: (id, payload) => patch(`/chatbot/knowledge/${id}`, payload, { requiresAuth: true }),
  removeKnowledge: (id) => del(`/chatbot/knowledge/${id}`, { requiresAuth: true }),
};
