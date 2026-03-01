import { motion } from 'framer-motion';
import { UserGroupIcon, ClockIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from '../../shared/components/Card';
import { StatCard } from '../../shared/components/StatCard';
import { Badge } from '../../shared/components/Badge';
import { useAppStore } from '../../store';
import { formatTime } from '../../shared/utils';

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981',
};

export const AdminDashboard = () => {
  const { queue = [], appointments = [], doctors = [], analytics } = useAppStore();

  const activeQueue = queue.length;
  const totalAppointments = appointments.length;
  const activeDoctors = doctors.filter((d) => d.status === 'active').length;
  const avgWaitTime = analytics?.avgWaitTime || 0;

  const severityData = [
    { name: 'Critical', value: queue.filter((q) => q.severity === 'critical').length },
    { name: 'High', value: queue.filter((q) => q.severity === 'high').length },
    { name: 'Medium', value: queue.filter((q) => q.severity === 'medium').length },
    { name: 'Low', value: queue.filter((q) => q.severity === 'low').length },
  ];

  const waitTimeData = analytics?.waitTimeHistory || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold">System Overview</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time hospital analytics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Queue"
          value={activeQueue}
          icon={UserGroupIcon}
          color="blue"
          trend={5}
        />
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          icon={ChartBarIcon}
          color="green"
          trend={12}
        />
        <StatCard
          title="Active Doctors"
          value={activeDoctors}
          icon={UserIcon}
          color="orange"
        />
        <StatCard
          title="Avg Wait Time"
          value={formatTime(avgWaitTime)}
          icon={ClockIcon}
          color="red"
          trend={-3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Average Wait Time Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={waitTimeData}>
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line type="monotone" dataKey="wait" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Doctor Workload</h3>
        <div className="space-y-4">
          {doctors.map((doctor) => {
            const workload = queue.filter((q) => 
              q.doctorId === doctor.id || q.doctorId === doctor._id
            ).length;
            const maxWorkload = 10;
            const percentage = (workload / maxWorkload) * 100;
            const color = percentage > 80 ? 'bg-red-600' : percentage > 50 ? 'bg-orange-600' : 'bg-green-600';

            return (
              <motion.div
                key={doctor._id || doctor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <div className="w-40">
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${color} flex items-center justify-end pr-2`}
                    >
                      <span className="text-white text-xs font-semibold">{workload}</span>
                    </motion.div>
                  </div>
                </div>
                <Badge variant={doctor.status === 'active' ? 'low' : 'default'}>
                  {doctor.status}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
