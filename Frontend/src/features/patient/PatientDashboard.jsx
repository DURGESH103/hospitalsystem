import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Timeline } from '../../shared/components/Timeline';
import { StatCard } from '../../shared/components/StatCard';
import { useAppStore } from '../../store';
import { formatTime, calculateWaitTime, formatDateTime } from '../../shared/utils';

export const PatientDashboard = () => {
  const { user, appointments, queue } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myAppointment = appointments.find((apt) => apt.patientId === user?.id && apt.status !== 'completed');
  const queuePosition = queue.findIndex((item) => item.patientId === user?.id) + 1;
  const estimatedWait = calculateWaitTime(queuePosition);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold">Welcome, {user?.name}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your appointment status in real-time</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Queue Position"
          value={queuePosition || 'N/A'}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          title="Estimated Wait"
          value={queuePosition ? formatTime(estimatedWait) : 'N/A'}
          icon={ClockIcon}
          color="orange"
        />
        <StatCard
          title="Appointment Status"
          value={myAppointment?.status.replace('_', ' ') || 'None'}
          icon={CalendarIcon}
          color="green"
        />
      </div>

      {myAppointment && (
        <Card className="p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6">Current Appointment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Doctor</p>
              <p className="text-lg font-medium mt-1">{myAppointment.doctorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Time</p>
              <p className="text-lg font-medium mt-1">{formatDateTime(myAppointment.scheduledTime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Severity</p>
              <Badge variant={myAppointment.severity} className="mt-1 inline-block">
                {myAppointment.severity.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Symptoms</p>
              <p className="text-lg font-medium mt-1">{myAppointment.symptoms}</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Appointment Progress</p>
            <Timeline currentStatus={myAppointment.status} />
          </div>
        </Card>
      )}

      {queuePosition > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">You're in the queue!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {queuePosition === 1 ? "You're next!" : `${queuePosition - 1} patient(s) ahead of you`}
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-bold text-blue-600"
                >
                  {queuePosition}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
