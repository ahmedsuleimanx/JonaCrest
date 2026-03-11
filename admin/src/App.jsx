import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";

// Context
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";
import AdminLayout from "./components/AdminLayout";

// Pages
import Login from "./components/login";
import Dashboard from "./pages/Dashboard";
import PropertyListings from "./pages/List";
import Add from "./pages/Add";
import Update from "./pages/Update";
import Appointments from "./pages/Appointments";
import UsersManagement from "./pages/UsersManagement";
import ServiceRequests from "./pages/ServiceRequests";
import TicketsManagement from "./pages/TicketsManagement";
import PartnersManagement from "./pages/PartnersManagement";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

// Config
import { APP_CONSTANTS } from "./config/constants";

const App = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <AuthProvider>
        <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Admin Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/properties" element={<PropertyListings />} />
              <Route path="/add-property" element={<Add />} />
              <Route path="/update/:id" element={<Update />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/service-requests" element={<ServiceRequests />} />
              <Route path="/tickets" element={<TicketsManagement />} />
              <Route path="/partners" element={<PartnersManagement />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: APP_CONSTANTS.DEFAULT_TOAST_DURATION,
            style: {
              background: 'rgba(30, 30, 30, 0.95)',
              color: '#fff',
              borderRadius: '14px',
              fontSize: '14px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;