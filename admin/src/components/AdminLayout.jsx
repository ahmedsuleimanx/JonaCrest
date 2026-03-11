import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import PageLoader from './PageLoader';
import NotificationDropdown from './NotificationDropdown';
import { Search } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state via CSS variable
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('.glass-sidebar');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarCollapsed(width <= 100);
      }
    });

    const sidebar = document.querySelector('.glass-sidebar');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <PageLoader />
      <Sidebar />

      {/* Top Header Bar */}
      <motion.header
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex fixed top-0 right-0 z-20 h-16 items-center justify-between px-8"
        style={{ left: sidebarCollapsed ? 80 : 280 }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="glass-input pl-10 pr-4 py-2 text-sm w-72"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationDropdown />
        </div>
      </motion.header>

      {/* Main Content Area */}
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="lg:pt-20 pt-16 p-4 lg:p-8 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </motion.main>
    </div>
  );
};

export default AdminLayout;
