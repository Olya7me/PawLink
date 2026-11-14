import { create } from 'zustand';

import type { AppLanguage } from '@/i18n';

type AppState = {
  language: AppLanguage | null;
  setLanguage: (language: AppLanguage) => void;
};

/**
 * Client UI preferences only. Server state belongs in TanStack Query.
 */
export const useAppStore = create<AppState>((set) => ({
  language: null,
  setLanguage: (language) => set({ language }),
}));
