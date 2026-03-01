import { motion } from 'framer-motion';

export const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`badge ${variants[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
};
