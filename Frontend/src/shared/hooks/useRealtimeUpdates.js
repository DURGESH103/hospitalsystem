import { useEffect } from 'react';
import { wsService } from '../../core/websocket';
import { useAppStore } from '../../store';

export const useRealtimeUpdates = () => {
  const { 
    upsertQueueItem, 
    upsertAppointment, 
    upsertDoctor, 
    setAnalytics, 
    removeFromQueue 
  } = useAppStore();

  useEffect(() => {
    const handleQueueUpdate = (event) => {
      if (event.type === 'update' || event.type === 'create') {
        upsertQueueItem(event.data);
      } else if (event.type === 'delete') {
        removeFromQueue(event.data.id || event.data._id);
      }
    };

    const handleAppointmentUpdate = (event) => {
      if (event.type === 'update' || event.type === 'create') {
        upsertAppointment(event.data);
      }
    };

    const handleDoctorUpdate = (event) => {
      if (event.type === 'update') {
        upsertDoctor(event.data);
      }
    };

    const handleAnalyticsUpdate = (event) => {
      setAnalytics(event.data);
    };

    const handleQueueRecalculated = async () => {
      // Full resync on queue recalculation
      try {
        const { api } = await import('../services/api');
        const queue = await api.getQueue();
        const { setQueue } = useAppStore.getState();
        setQueue(queue);
      } catch (error) {
        console.error('Queue resync failed:', error);
      }
    };

    wsService.on('queue:update', handleQueueUpdate);
    wsService.on('appointment:update', handleAppointmentUpdate);
    wsService.on('doctor:update', handleDoctorUpdate);
    wsService.on('analytics:update', handleAnalyticsUpdate);
    wsService.on('queue:recalculated', handleQueueRecalculated);

    return () => {
      wsService.off('queue:update');
      wsService.off('appointment:update');
      wsService.off('doctor:update');
      wsService.off('analytics:update');
      wsService.off('queue:recalculated');
    };
  }, [upsertQueueItem, upsertAppointment, upsertDoctor, setAnalytics, removeFromQueue]);
};
