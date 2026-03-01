import { useNavigate } from 'react-router-dom';
import { MoonIcon, SunIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../../core/theme';
import { useAppStore } from '../../store';
import { motion } from 'framer-motion';

export const Header = () => {
  const { isDark, toggle } = useThemeStore();
  const { user, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Smart Hospital</h1>
              <p className="text-xs text-gray-500">AI Triage System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};
