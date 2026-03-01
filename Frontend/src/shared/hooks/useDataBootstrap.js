import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store';
import { api } from '../services/api';
import { wsService } from '../../core/websocket';

export const useDataBootstrap = () => {
  const { 
    user, 
    token,
    isInitialized, 
    setInitialized, 
    setLoading, 
    setError,
    setAppointments,
    setQueue,
    setDoctors,
    setAnalytics,
    setLastSyncTime
  } = useAppStore();
  
  const bootstrapAttempted = useRef(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [appointments, queue, doctors] = await Promise.all([
        api.getAppointments(),
        api.getQueue(),
        api.getDoctors()
      ]);

      setAppointments(appointments);
      setQueue(queue);
      setDoctors(doctors);

      if (user.role === 'admin' || user.role === 'doctor') {
        const analytics = await api.getAnalytics();
        setAnalytics(analytics);
      }

      setLastSyncTime(Date.now());
      setInitialized(true);
      
      // Connect WebSocket with reconnection handler
      wsService.connect(token, handleReconnect);
    } catch (error) {
      console.error('Bootstrap failed:', error);
      setError(error.message);
      setTimeout(() => fetchInitialData(), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    console.log('Reconnected - resyncing data');
    try {
      const [appointments, queue] = await Promise.all([
        api.getAppointments(),
        api.getQueue()
      ]);
      setAppointments(appointments);
      setQueue(queue);
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Resync failed:', error);
    }
  };

  useEffect(() => {
    if (!user || !token || isInitialized || bootstrapAttempted.current) return;

    bootstrapAttempted.current = true;
    fetchInitialData();
  }, [user, token, isInitialized]);

  return { isInitialized };
};
