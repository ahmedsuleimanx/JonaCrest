import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './components/properties/propertydetail';
import Aboutus from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Login from './components/login';
import Signup from './components/signup';
import PaymentCallback from './components/PaymentCallback';
import ForgotPassword from './components/forgetpassword';
import ResetPassword from './components/resetpassword';
import Footer from './components/footer';
import NotFoundPage from './components/Notfound';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import AIPropertyHub from './pages/Aiagent'
import UserDashboard from './pages/UserDashboard';
import Notifications from './pages/Notifications';
import Tickets from './pages/Tickets';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import StructuredData from './components/SEO/StructuredData';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import 'react-toastify/dist/ReactToastify.css';
import DashboardPropertyView from './pages/dashboard/PropertyDetailsView';


export const Backendurl = import.meta.env.VITE_API_BASE_URL;

// Wrapper component to conditionally render Footer and Navbar
const AppLayout = () => {
  const location = useLocation();
  
  // Check if current path is a dashboard route
  const isDashboardRoute = ['/dashboard', '/notifications', '/tickets', '/messages', '/settings', '/help', '/profile'].some(
    route => location.pathname === route || location.pathname.startsWith(route + '/')
  );

  return (
    <>
      <ErrorBoundary>
        {/* Base website structured data */}
        <StructuredData type="website" />
        <StructuredData type="organization" />
        
        {/* Hide main navbar on dashboard routes */}
        {!isDashboardRoute && <Navbar />}
        
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/single/:id" element={<PropertyDetails />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-property-hub" element={<AIPropertyHub />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/*" element={<UserDashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:ticketId" element={<Tickets />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<PublicProfile />} />
          <Route path="/dashboard/property/:id" element={<DashboardPropertyView />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        
        {/* Hide main footer on dashboard routes (they have their own footer) */}
        {!isDashboardRoute && <Footer />}
        
        <FloatingAIAssistant />
        <ToastContainer />
      </ErrorBoundary>
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
    <AuthProvider>
    <CurrencyProvider>
    <ThemeProvider>
    <Router>
      <AppLayout />
    </Router>
    </ThemeProvider>
    </CurrencyProvider>
    </AuthProvider>
    </HelmetProvider>
  )
}

export default App