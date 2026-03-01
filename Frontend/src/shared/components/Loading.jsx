import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
      />
    </div>
  );
};
