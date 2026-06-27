import { create } from 'zustand';

export const useConfirmStore = create((set) => ({
  open: false,
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'primary',
  resolver: null,
  prompt: (options) =>
    new Promise((resolve) => {
      set({
        open: true,
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        tone: options.tone || 'primary',
        resolver: resolve,
      });
    }),
  resolve: (value) =>
    set((state) => {
      state.resolver?.(value);
      return { open: false, resolver: null };
    }),
}));

export const confirmDialog = (options) => useConfirmStore.getState().prompt(options);
