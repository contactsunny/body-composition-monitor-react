import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ReportsOverview from './pages/ReportsOverview';
import BodyFatReport from './pages/BodyFatReport';
import MuscleMassReport from './pages/MuscleMassReport';
import WeightReport from './pages/WeightReport';
import CustomMetricsReport from './pages/CustomMetricsReport';
import NotFound from './pages/NotFound';
import InstallPrompt from './components/InstallPrompt';

function AppContent() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="reports/overview" element={<ReportsOverview />} />
          <Route path="reports/body-fat" element={<BodyFatReport />} />
          <Route path="reports/muscle-mass" element={<MuscleMassReport />} />
          <Route path="reports/weight" element={<WeightReport />} />
          <Route path="reports/custom" element={<CustomMetricsReport />} />
        </Route>
        {/** Settings removed */}
        {/* Catch-all: show 404 page for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

