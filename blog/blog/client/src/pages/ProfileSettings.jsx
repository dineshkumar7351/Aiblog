/**
 * Profile Settings Page
 * User profile management with edit, settings, and preferences
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Lock, 
  Eye, 
  Save,
  X,
  Upload,
  Camera
} from 'lucide-react';
import EditProfile from '../components/EditProfile';
import SettingsPanel from '../components/SettingsPanel';

const ProfileSettings = () => {
  const { user, updateUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile'); // profile, settings, privacy, notifications
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Set active tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'settings', 'privacy', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  if (!loading && !user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile & Settings</h1>
              <p className="text-sm text-surface-500">Manage your account and preferences</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 sticky top-24 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-l-4 transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 p-6 lg:p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <EditProfile 
                  user={user} 
                  onUpdate={(updatedUser) => {
                    updateUser(updatedUser);
                    setShowSaveAlert(true);
                    setTimeout(() => setShowSaveAlert(false), 3000);
                  }}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <SettingsPanel tab="settings" user={user} />
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <SettingsPanel tab="privacy" user={user} />
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <SettingsPanel tab="security" user={user} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {showSaveAlert && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in">
          <Save className="w-5 h-5" />
          <span>Profile updated successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
