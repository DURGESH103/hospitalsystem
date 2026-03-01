import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        if (token) localStorage.setItem('token', token);
      },
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },

      // Queue
      queue: [],
      setQueue: (queue) => set({ queue }),
      updateQueueItem: (id, updates) => set((state) => ({
        queue: state.queue.map((item) => item.id === id ? { ...item, ...updates } : item)
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter((item) => item.id !== id)
      })),

      // Appointments
      appointments: [],
      setAppointments: (appointments) => set({ appointments }),
      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map((apt) => apt.id === id ? { ...apt, ...updates } : apt)
      })),

      // Doctors
      doctors: [],
      setDoctors: (doctors) => set({ doctors }),
      updateDoctor: (id, updates) => set((state) => ({
        doctors: state.doctors.map((doc) => doc.id === id ? { ...doc, ...updates } : doc)
      })),

      // Analytics
      analytics: null,
      setAnalytics: (analytics) => set({ analytics }),
    }),
    {
      name: 'hospital-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
