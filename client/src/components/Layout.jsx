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
    <div className="h-screen w-screen max-w-full overflow-hidden bg-surface-50 dark:bg-surface-950 relative flex flex-col">
      {/* Premium Ambient Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-400/25 dark:bg-primary-500/15 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-400/25 dark:bg-secondary-500/15 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-accent-400/15 dark:bg-accent-500/10 blur-[130px] pointer-events-none animate-pulse-slow"></div>

      <div className="flex flex-1 h-full w-full max-w-full min-w-0 overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-w-0 max-w-full overflow-hidden">
          {/* Navbar */}
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 min-w-0 max-w-full w-full overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
