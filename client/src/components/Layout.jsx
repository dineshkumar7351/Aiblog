/**
 * Layout Component
 * Main authenticated layout with sidebar and navbar
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative overflow-hidden">
      {/* Premium Ambient Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-400/25 dark:bg-primary-500/15 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-400/25 dark:bg-secondary-500/15 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-accent-400/15 dark:bg-accent-500/10 blur-[130px] pointer-events-none animate-pulse-slow"></div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {/* Navbar */}
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
