import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, UserIcon, XCircleIcon } from '@heroicons/react/24/solid';

const steps = [
  { key: 'scheduled', label: 'Scheduled', icon: ClockIcon },
  { key: 'in_queue', label: 'In Queue', icon: ClockIcon },
  { key: 'in_consultation', label: 'Consultation', icon: UserIcon },
  { key: 'completed', label: 'Completed', icon: CheckCircleIcon },
];

export const Timeline = ({ currentStatus }) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCancelled
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {isCancelled ? (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                )}
              </motion.div>
              <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isActive ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-600"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
