/**
 * Sidebar Component
 * Left navigation panel with dashboard links
 */

import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenSquare, 
  FileText, 
  BarChart3,
  Sparkles,
  X,
  Palette
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/write', icon: PenSquare, label: 'Write' },
  { path: '/blogs', icon: FileText, label: 'My Blogs' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/design', icon: Palette, label: 'Design Studio' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64
        bg-white dark:bg-surface-900
        border-r border-surface-200 dark:border-surface-800
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-0
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold gradient-text">BlogAI</h1>
              <p className="text-xs text-surface-500">AI-Powered Writing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/write' && location.pathname.startsWith('/edit/'));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  sidebar-link
                  ${isActive ? 'sidebar-link-active' : ''}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* AI Assistant Info */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">AI Assistant</span>
            </div>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              AI helps you write better. You control the final content.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
