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
        bg-white/70 dark:bg-surface-900/60 backdrop-blur-xl
        border-r border-surface-200/40 dark:border-surface-800/30
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-0
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200/40 dark:border-surface-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md shadow-primary-500/10">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold gradient-text">BlogAI</h1>
              <p className="text-xs text-surface-500">AI-Powered Writing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-surface-100/50 dark:hover:bg-surface-800/50 rounded-lg"
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
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/5 to-secondary-500/5 dark:from-primary-500/15 dark:to-secondary-500/10 border border-primary-500/20 dark:border-primary-400/20 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">AI Assistant</span>
            </div>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              AI helps you write better. You control the final content.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
