import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {}}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
};
