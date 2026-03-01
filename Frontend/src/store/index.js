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
        set({ user: null, token: null, appointments: [], queue: [], doctors: [], analytics: null });
        localStorage.removeItem('token');
      },

      // Loading states
      isLoading: false,
      error: null,
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Queue
      queue: [],
      setQueue: (queue) => set({ queue: queue || [] }),
      updateQueueItem: (id, updates) => set((state) => ({
        queue: state.queue.map((item) => 
          (item._id === id || item.id === id) ? { ...item, ...updates, _version: (item._version || 0) + 1 } : item
        )
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter((item) => item._id !== id && item.id !== id)
      })),
      upsertQueueItem: (item) => set((state) => {
        const existing = state.queue.find(q => (q._id === item._id || q.id === item.id));
        if (!existing || (item._version || 0) > (existing._version || 0)) {
          return {
            queue: existing 
              ? state.queue.map(q => (q._id === item._id || q.id === item.id) ? item : q)
              : [...state.queue, item]
          };
        }
        return state;
      }),

      // Appointments
      appointments: [],
      setAppointments: (appointments) => set({ appointments: appointments || [] }),
      addAppointment: (appointment) => set((state) => ({
        appointments: [appointment, ...state.appointments]
      })),
      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map((apt) => 
          (apt._id === id || apt.id === id) ? { ...apt, ...updates, _version: (apt._version || 0) + 1 } : apt
        )
      })),
      upsertAppointment: (appointment) => set((state) => {
        const existing = state.appointments.find(a => (a._id === appointment._id || a.id === appointment.id));
        if (!existing || (appointment._version || 0) > (existing._version || 0)) {
          return {
            appointments: existing
              ? state.appointments.map(a => (a._id === appointment._id || a.id === appointment.id) ? appointment : a)
              : [appointment, ...state.appointments]
          };
        }
        return state;
      }),

      // Doctors
      doctors: [],
      setDoctors: (doctors) => set({ doctors: doctors || [] }),
      updateDoctor: (id, updates) => set((state) => ({
        doctors: state.doctors.map((doc) => 
          (doc._id === id || doc.id === id) ? { ...doc, ...updates, _version: (doc._version || 0) + 1 } : doc
        )
      })),
      upsertDoctor: (doctor) => set((state) => {
        const existing = state.doctors.find(d => (d._id === doctor._id || d.id === doctor.id));
        if (!existing || (doctor._version || 0) > (existing._version || 0)) {
          return {
            doctors: existing
              ? state.doctors.map(d => (d._id === doctor._id || d.id === doctor.id) ? doctor : d)
              : [...state.doctors, doctor]
          };
        }
        return state;
      }),

      // Analytics
      analytics: null,
      setAnalytics: (analytics) => set({ analytics }),

      // Data initialization flag
      isInitialized: false,
      setInitialized: (isInitialized) => set({ isInitialized }),
      
      // Last sync timestamp for reconnection
      lastSyncTime: null,
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
    }),
    {
      name: 'hospital-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
