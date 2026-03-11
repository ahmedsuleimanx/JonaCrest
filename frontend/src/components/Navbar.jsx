import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  Search,
  Users,
  MessageCircle,
  Sparkles,
  BotMessageSquare,
  Bell,
  Settings,
  UserCircle,
  Heart,
  Zap,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/jona_crest_logo.png";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

// Clean Animation Variants
const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications] = useState(3);
  const dropdownRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <img 
                src={logo} 
                alt="Jona Crest Properties" 
                className="w-10 h-10 object-contain rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-[#00796b] tracking-tight">
                Jona Crest
              </span>
              <span className="text-lg font-bold text-gray-700 tracking-tight ml-1">
                Properties
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <nav className="flex items-center gap-1">
              <NavLinks currentPath={location.pathname} />
            </nav>
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </motion.button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00796b] to-[#4db6ac] flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(user?.name)}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-4 bg-gradient-to-r from-[#00796b]/5 to-[#4db6ac]/5 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          {[
                            { icon: UserCircle, label: "Dashboard", path: "/dashboard" },
                            { icon: Heart, label: "Saved Properties", path: "/dashboard?tab=saved" },
                            { icon: Settings, label: "Settings", path: "/dashboard?tab=settings" }
                          ].map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.path}
                              onClick={() => setIsDropdownOpen(false)}
                              className="w-full px-3 py-2.5 text-sm text-gray-700 hover:text-[#00796b] flex items-center gap-3 rounded-lg transition-colors hover:bg-gray-50"
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                          
                          <div className="my-2 border-t border-gray-100" />
                          
                          <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2.5 text-sm text-red-600 hover:text-red-700 flex items-center gap-3 rounded-lg transition-colors hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#00796b] transition-colors rounded-lg hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00796b] to-[#4db6ac] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <MobileNavLinks
                setMobileMenuOpen={setIsMobileMenuOpen}
                isLoggedIn={isLoggedIn}
                user={user}
                handleLogout={handleLogout}
                currentPath={location.pathname}
                notifications={notifications}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavLinks = ({ currentPath }) => {
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/properties", icon: Search },
    { name: "Services", path: "/services", icon: Zap },
    { name: "About Us", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: MessageCircle },
  ];

  const isAIHubActive = currentPath.startsWith("/ai-property-hub");

  return (
    <div className="flex items-center gap-1">
      {navLinks.map(({ name, path, icon: Icon }) => {
        const isActive = path === "/" ? currentPath === path : currentPath.startsWith(path);

        return (
          <Link
            key={name}
            to={path}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#00796b] text-white shadow-md"
                : "text-gray-600 hover:text-[#00796b] hover:bg-[#00796b]/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{name}</span>
          </Link>
        );
      })}

      {/* AI Hub Link - Special Styling */}
      <Link
        to="/ai-property-hub"
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ml-1 ${
          isAIHubActive
            ? "bg-gradient-to-r from-[#00796b] to-[#c9a227] text-white shadow-md"
            : "text-[#00796b] bg-[#00796b]/10 hover:bg-[#00796b]/20"
        }`}
      >
        <BotMessageSquare className="w-4 h-4" />
        <span>Jona Crest AI</span>
        {!isAIHubActive && (
          <Sparkles className="w-3 h-3 text-[#c9a227]" />
        )}
      </Link>
    </div>
  );
};

const MobileNavLinks = ({
  setMobileMenuOpen,
  isLoggedIn,
  user,
  handleLogout,
  currentPath,
  notifications,
}) => {
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Properties", path: "/properties", icon: Search },
    { name: "Services", path: "/services", icon: Zap },
    { name: "About Us", path: "/about", icon: Users },
    { name: "Contact", path: "/contact", icon: MessageCircle },
  ];

  const isAIHubActive = currentPath.startsWith("/ai-property-hub");

  return (
    <div className="space-y-2">
      {/* AI Hub Link - Featured */}
      <Link
        to="/ai-property-hub"
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isAIHubActive
            ? "bg-gradient-to-r from-[#00796b] to-[#c9a227] text-white"
            : "bg-gradient-to-r from-[#00796b]/10 to-[#c9a227]/10 text-[#00796b]"
        }`}
      >
        <div className={`p-2 rounded-lg ${isAIHubActive ? 'bg-white/20' : 'bg-[#00796b]/10'}`}>
          <BotMessageSquare className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold flex items-center gap-2">
            Jona Crest AI
            {!isAIHubActive && <Sparkles className="w-4 h-4 text-[#c9a227]" />}
          </div>
          <div className={`text-xs ${isAIHubActive ? 'text-white/80' : 'text-gray-500'}`}>
            AI-powered property search
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div className="h-px bg-gray-100 my-3" />

      {/* Nav Links */}
      {navLinks.map(({ name, path, icon: Icon }) => {
        const isActive = path === "/" ? currentPath === path : currentPath.startsWith(path);

        return (
          <Link
            key={name}
            to={path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive
                ? "bg-[#00796b] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{name}</span>
          </Link>
        );
      })}

      {/* Divider */}
      <div className="h-px bg-gray-100 my-3" />

      {/* Auth Section */}
      {isLoggedIn ? (
        <div className="space-y-3">
          {/* User Profile */}
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00796b] to-[#4db6ac] flex items-center justify-center text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/dashboard?tab=saved"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Heart className="w-4 h-4" />
              Saved
            </Link>
            <Link
              to="/dashboard?tab=settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full px-4 py-3 text-center font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center font-medium text-white bg-gradient-to-r from-[#00796b] to-[#4db6ac] rounded-xl shadow-md"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

NavLinks.propTypes = {
  currentPath: PropTypes.string.isRequired,
};

MobileNavLinks.propTypes = {
  setMobileMenuOpen: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
  handleLogout: PropTypes.func.isRequired,
  currentPath: PropTypes.string.isRequired,
  notifications: PropTypes.number,
};

export default Navbar;
