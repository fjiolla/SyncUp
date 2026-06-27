import { create } from 'zustand';
import { notificationsApi } from '../api/notifications';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  refresh: async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      set({ unreadCount: res.data?.count || 0 });
    } catch {}
  },
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  decrement: (by = 1) => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),
}));
