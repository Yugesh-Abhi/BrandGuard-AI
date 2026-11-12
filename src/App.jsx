
import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandProvider } from './context/BrandContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

import { WelcomePage } from './components/auth/WelcomePage';
import { AuthPage } from './components/auth/AuthPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';

import { DashboardPage } from './components/dashboard/DashboardPage';
import { BrandGuidelinesPage } from './components/guidelines/BrandGuidelinesPage';
import { ContentSubmissionPage } from './components/submission/ContentSubmissionPage';
import { ComplianceAnalysisPage } from './components/analysis/ComplianceAnalysisPage';
import { ComplianceReportPage } from './components/report/ComplianceReportPage';
import { ReviewApprovalPage } from './components/reviews/ReviewApprovalPage';
import { RevisionHistoryPage } from './components/history/RevisionHistoryPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#070913] flex items-center justify-center text-purple-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
        Initializing BrandGuard AI...
      </span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <AppLayout>{children}</AppLayout>;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    return (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    );
  }

  return <WelcomePage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BrandProvider>
            <Routes>
              {/* Public welcome and authentication */}
              <Route path="/" element={<HomeRoute />} />

              <Route
                path="/login"
                element={<AuthPage initialMode="login" />}
              />
              <Route
  path="/reset-password"
  element={<ResetPasswordPage />}
/>

              <Route
                path="/register"
                element={<AuthPage initialMode="register" />}
              />

              {/* Protected application pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/guidelines"
                element={
                  <ProtectedRoute>
                    <BrandGuidelinesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/submission"
                element={
                  <ProtectedRoute>
                    <ContentSubmissionPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analysis"
                element={
                  <ProtectedRoute>
                    <ComplianceAnalysisPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <ComplianceReportPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/report/:id"
                element={
                  <ProtectedRoute>
                    <ComplianceReportPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reviews"
                element={
                  <ProtectedRoute>
                    <ReviewApprovalPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <RevisionHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Unknown paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrandProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
