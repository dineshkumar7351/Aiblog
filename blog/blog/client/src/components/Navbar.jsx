/**
 * Navbar Component
 * Top navigation bar with user profile and theme toggle
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, 
  Sun, 
  Moon, 
  LogOut, 
  User,
  ChevronDown,
  Settings
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left side - Menu button for mobile */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-surface-600" />
            )}
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 pr-4 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-surface-500">
                  {user?.email || 'user@email.com'}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                      {user?.name}
                    </p>
                    <p className="text-xs text-surface-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile-settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile-settings?tab=settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <div className="border-t border-surface-200 dark:border-surface-700 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
