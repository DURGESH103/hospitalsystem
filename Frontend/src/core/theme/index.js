import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((state) => {
        const newIsDark = !state.isDark;
        document.documentElement.classList.toggle('dark', newIsDark);
        return { isDark: newIsDark };
      }),
      setDark: (isDark) => set(() => {
        document.documentElement.classList.toggle('dark', isDark);
        return { isDark };
      }),
    }),
    { name: 'theme' }
  )
);
