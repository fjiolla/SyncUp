import apiClient from './client';

export const chatApi = {
  getOrCreateConversation: (targetUserId) => apiClient.post(`/chat/conversations/${targetUserId}`),
  getConversations: () => apiClient.get('/chat/conversations'),
  getMessages: (conversationId, params) => apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId) => apiClient.post(`/chat/conversations/${conversationId}/read`),
  acceptConversation: (conversationId) => apiClient.post(`/chat/conversations/${conversationId}/accept`),
  declineConversation: (conversationId) => apiClient.delete(`/chat/conversations/${conversationId}`),
};
