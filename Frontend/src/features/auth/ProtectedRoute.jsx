import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../store';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAppStore();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'patient' ? '/' : user.role === 'doctor' ? '/doctor' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
