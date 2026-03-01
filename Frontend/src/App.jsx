import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { useThemeStore } from './core/theme';
import { useRealtimeUpdates } from './shared/hooks/useRealtimeUpdates';
import { useDataBootstrap } from './shared/hooks/useDataBootstrap';
import { Header } from './shared/components/Header';
import { Loading } from './shared/components/Loading';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { PatientDashboard } from './features/patient/PatientDashboard';
import { DoctorDashboard } from './features/doctor/DoctorDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';

const DashboardRouter = () => {
  const { user, isLoading, isInitialized } = useAppStore();
  const { isInitialized: bootstrapped } = useDataBootstrap();
  useRealtimeUpdates();

  if (!user) return <Navigate to="/login" replace />;
  if (isLoading || !bootstrapped) return <Loading />;

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            user.role === 'patient' ? (
              <Navigate to="/" replace />
            ) : user.role === 'doctor' ? (
              <Navigate to="/doctor" replace />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

function App() {
  const { isDark, setDark } = useThemeStore();

  useEffect(() => {
    setDark(isDark);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<DashboardRouter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
