import { useEffect } from 'react';
import { wsService } from '../../core/websocket';
import { useAppStore } from '../../store';

export const useRealtimeUpdates = () => {
  const { updateQueueItem, updateAppointment, updateDoctor, setAnalytics } = useAppStore();

  useEffect(() => {
    wsService.on('queue:update', (data) => {
      updateQueueItem(data.id, data);
    });

    wsService.on('appointment:update', (data) => {
      updateAppointment(data.id, data);
    });

    wsService.on('doctor:update', (data) => {
      updateDoctor(data.id, data);
    });

    wsService.on('analytics:update', (data) => {
      setAnalytics(data);
    });

    return () => {
      wsService.off('queue:update');
      wsService.off('appointment:update');
      wsService.off('doctor:update');
      wsService.off('analytics:update');
    };
  }, [updateQueueItem, updateAppointment, updateDoctor, setAnalytics]);
};
