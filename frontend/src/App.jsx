// App.jsx — React Router + AnimatePresence page transitions
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useUser } from './context/UserContext.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PracticePage from './pages/PracticePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DocumentPracticePage from './pages/DocumentPracticePage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function ProtectedRoute({ element }) {
  const { user } = useUser();
  return user ? element : <Navigate to="/" replace />;
}

export default function App() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home/Register — redirect to dashboard if already logged in */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />

        {/* Protected routes */}
        <Route path="/dashboard"         element={<ProtectedRoute element={<DashboardPage />} />} />
        <Route path="/practice"          element={<ProtectedRoute element={<PracticePage />} />} />
        <Route path="/document-practice" element={<ProtectedRoute element={<DocumentPracticePage />} />} />
        <Route path="/progress"          element={<ProtectedRoute element={<ProgressPage />} />} />
        <Route path="/settings"          element={<ProtectedRoute element={<SettingsPage />} />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
