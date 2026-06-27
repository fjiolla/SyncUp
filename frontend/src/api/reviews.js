import apiClient from './client';

export const reviewsApi = {
  create: (eventId, data) => apiClient.post(`/events/${eventId}/reviews`, data),
  getEventReviews: (eventId, params) => apiClient.get(`/events/${eventId}/reviews`, { params }),
  getPodReviews: (podId, params) => apiClient.get(`/pods/${podId}/reviews`, { params }),
  getMyReview: (eventId) => apiClient.get(`/events/${eventId}/my-review`),
};
