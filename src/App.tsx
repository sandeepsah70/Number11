import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import NumberListScreen from './screens/NumberListScreen';
import NumberDetailsScreen from './screens/NumberDetailsScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import MyNumbersScreen from './screens/MyNumbersScreen';
import InboxScreen from './screens/InboxScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import ProfileScreen from './screens/ProfileScreen';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="phone-frame">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<PublicRoute><AuthScreen defaultTab="login" /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthScreen defaultTab="signup" /></PublicRoute>} />

        <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
        <Route path="/numbers/:country" element={<ProtectedRoute><NumberListScreen /></ProtectedRoute>} />
        <Route path="/number-details" element={<ProtectedRoute><NumberDetailsScreen /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentScreen /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessScreen /></ProtectedRoute>} />
        <Route path="/my-numbers" element={<ProtectedRoute><MyNumbersScreen /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><InboxScreen /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsScreen /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
