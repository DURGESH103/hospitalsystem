import { motion } from 'framer-motion';
import { UserIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { StatCard } from '../../shared/components/StatCard';
import { useAppStore } from '../../store';
import { api } from '../../shared/services/api';
import { formatTime, severityConfig } from '../../shared/utils';

export const DoctorDashboard = () => {
  const { user, queue = [], appointments = [] } = useAppStore();

  const myQueue = queue.filter((item) => 
    item.doctorId === user?.id || item.doctorId === user?._id
  );
  
  const myAppointments = appointments.filter((apt) => 
    apt.doctorId === user?.id || apt.doctorId === user?._id
  );
  
  const activeAppointment = myAppointments.find((apt) => apt.status === 'in_consultation');
  const completedToday = myAppointments.filter((apt) => apt.status === 'completed').length;

  const sortedQueue = [...myQueue].sort((a, b) => {
    return severityConfig[a.severity].priority - severityConfig[b.severity].priority;
  });

  const handleStart = async (appointmentId) => {
    try {
      await api.updateAppointment(appointmentId, { status: 'in_consultation' });
    } catch (error) {
      console.error('Failed to start appointment:', error);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await api.updateAppointment(appointmentId, { status: 'completed' });
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold">Dr. {user?.name}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your patient queue</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="In Queue"
          value={myQueue.length}
          icon={UserIcon}
          color="blue"
        />
        <StatCard
          title="Active"
          value={activeAppointment ? 1 : 0}
          icon={ClockIcon}
          color="orange"
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Avg Wait Time"
          value={formatTime(15)}
          icon={ClockIcon}
          color="blue"
        />
      </div>

      {activeAppointment && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently Consulting</p>
              <h3 className="text-2xl font-bold mt-1">{activeAppointment.patientName}</h3>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant={activeAppointment.severity}>{activeAppointment.severity}</Badge>
                <span className="text-sm text-gray-600">{activeAppointment.symptoms}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleComplete(activeAppointment._id || activeAppointment.id)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Complete
            </motion.button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Patient Queue</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sortedQueue.length} patient(s) waiting
          </span>
        </div>

        <div className="space-y-3">
          {sortedQueue.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No patients in queue</p>
            </div>
          ) : (
            sortedQueue.map((patient, index) => (
              <motion.div
                key={patient.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{patient.patientName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{patient.symptoms}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={patient.severity}>{patient.severity}</Badge>
                  <span className="text-sm text-gray-500">{formatTime(patient.waitTime)}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStart(patient._id || patient.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Start
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
