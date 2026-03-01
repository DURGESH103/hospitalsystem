export const severityConfig = {
  critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', priority: 1 },
  high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', priority: 2 },
  medium: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', priority: 3 },
  low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', priority: 4 },
};

export const statusConfig = {
  scheduled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Scheduled' },
  in_queue: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Queue' },
  in_consultation: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'In Consultation' },
  completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' },
};

export const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateWaitTime = (queuePosition, avgConsultationTime = 15) => {
  return queuePosition * avgConsultationTime;
};
