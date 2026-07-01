/**
 * Settings Panel Component
 * Handles Settings, Privacy, and Security tabs
 */

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Eye, 
  Lock, 
  ChevronRight,
  Shield,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPanel = ({ tab, user }) => {
  const { updateUser } = useAuth();
  const [settings, setSettings] = useState(() => {
    const userSettings = user?.settings || {};
    return {
      // Notifications
      emailNotifications: userSettings.notifications?.emailNotifications ?? true,
      pushNotifications: userSettings.notifications?.pushNotifications ?? false,
      blogUpdates: userSettings.notifications?.blogUpdates ?? true,
      weeklyDigest: userSettings.notifications?.weeklyDigest ?? true,
      marketingEmails: userSettings.notifications?.marketingEmails ?? false,

      // Privacy
      profilePublic: userSettings.privacy?.profilePublic ?? true,
      showEmail: userSettings.privacy?.showEmail ?? false,
      allowMessages: userSettings.privacy?.allowMessages ?? true,
      indexInSearch: userSettings.privacy?.indexInSearch ?? true,

      // Security
      twoFactorEnabled: userSettings.security?.twoFactorEnabled ?? false,
      loginAlerts: userSettings.security?.loginAlerts ?? true,
      suspiciousActivityAlerts: userSettings.security?.suspiciousActivityAlerts ?? true,
      deviceTrusted: userSettings.security?.deviceTrusted ?? false,
    };
  });

  useEffect(() => {
    if (user?.settings) {
      const userSettings = user.settings;
      setSettings({
        emailNotifications: userSettings.notifications?.emailNotifications ?? true,
        pushNotifications: userSettings.notifications?.pushNotifications ?? false,
        blogUpdates: userSettings.notifications?.blogUpdates ?? true,
        weeklyDigest: userSettings.notifications?.weeklyDigest ?? true,
        marketingEmails: userSettings.notifications?.marketingEmails ?? false,

        profilePublic: userSettings.privacy?.profilePublic ?? true,
        showEmail: userSettings.privacy?.showEmail ?? false,
        allowMessages: userSettings.privacy?.allowMessages ?? true,
        indexInSearch: userSettings.privacy?.indexInSearch ?? true,

        twoFactorEnabled: userSettings.security?.twoFactorEnabled ?? false,
        loginAlerts: userSettings.security?.loginAlerts ?? true,
        suspiciousActivityAlerts: userSettings.security?.suspiciousActivityAlerts ?? true,
        deviceTrusted: userSettings.security?.deviceTrusted ?? false,
      });
    }
  }, [user]);

  const handleToggle = async (key) => {
    const updatedValue = !settings[key];
    
    // Optimistic UI update
    setSettings(prev => ({
      ...prev,
      [key]: updatedValue
    }));

    try {
      const newSettings = {
        notifications: {
          emailNotifications: key === 'emailNotifications' ? updatedValue : settings.emailNotifications,
          pushNotifications: key === 'pushNotifications' ? updatedValue : settings.pushNotifications,
          blogUpdates: key === 'blogUpdates' ? updatedValue : settings.blogUpdates,
          weeklyDigest: key === 'weeklyDigest' ? updatedValue : settings.weeklyDigest,
          marketingEmails: key === 'marketingEmails' ? updatedValue : settings.marketingEmails,
        },
        privacy: {
          profilePublic: key === 'profilePublic' ? updatedValue : settings.profilePublic,
          showEmail: key === 'showEmail' ? updatedValue : settings.showEmail,
          allowMessages: key === 'allowMessages' ? updatedValue : settings.allowMessages,
          indexInSearch: key === 'indexInSearch' ? updatedValue : settings.indexInSearch,
        },
        security: {
          twoFactorEnabled: key === 'twoFactorEnabled' ? updatedValue : settings.twoFactorEnabled,
          loginAlerts: key === 'loginAlerts' ? updatedValue : settings.loginAlerts,
          suspiciousActivityAlerts: key === 'suspiciousActivityAlerts' ? updatedValue : settings.suspiciousActivityAlerts,
          deviceTrusted: key === 'deviceTrusted' ? updatedValue : settings.deviceTrusted,
        }
      };

      await updateUser({ settings: newSettings });
      toast.success('Settings updated successfully!');
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast.error('Failed to update settings. Please try again.');
      // Revert UI state on error
      setSettings(prev => ({
        ...prev,
        [key]: !updatedValue
      }));
    }
  };

  const renderSettings = () => {
    if (tab === 'settings') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time notifications' },
                { key: 'blogUpdates', label: 'Blog Updates', desc: 'Notify me when blogs are published' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get weekly summary of activities' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional content and offers' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{label}</p>
                    <p className="text-sm text-surface-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      settings[key] ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings[key] ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
            <h3 className="font-medium text-surface-900 dark:text-white mb-4">Quick Actions</h3>
            <button className="w-full flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                <span className="text-sm font-medium">Connected Devices</span>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-400" />
            </button>
          </div>
        </div>
      );
    }

    if (tab === 'privacy') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-600" />
              Privacy Settings
            </h2>

            <div className="space-y-4">
              {[
                { key: 'profilePublic', label: 'Public Profile', desc: 'Make your profile visible to others' },
                { key: 'showEmail', label: 'Show Email Address', desc: 'Display email on your profile' },
                { key: 'allowMessages', label: 'Allow Direct Messages', desc: 'Let others message you' },
                { key: 'indexInSearch', label: 'Index in Search Engines', desc: 'Allow Google and other search engines to index your profile' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{label}</p>
                    <p className="text-sm text-surface-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      settings[key] ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings[key] ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
            <h3 className="font-medium text-surface-900 dark:text-white mb-4">Data Management</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 transition-colors">
                <span className="text-sm font-medium">Download My Data</span>
                <ChevronRight className="w-4 h-4 text-surface-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 transition-colors">
                <span className="text-sm font-medium">Delete All Data</span>
                <ChevronRight className="w-4 h-4 text-surface-400" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (tab === 'security') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-600" />
              Security Settings
            </h2>

            <div className="space-y-4">
              {[
                { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', desc: 'Add extra security to your account' },
                { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified of new login attempts' },
                { key: 'suspiciousActivityAlerts', label: 'Suspicious Activity Alerts', desc: 'Be alerted of unusual account activity' },
                { key: 'deviceTrusted', label: 'Trust This Device', desc: 'Remember this device for future logins' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{label}</p>
                    <p className="text-sm text-surface-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      settings[key] ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings[key] ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
            <h3 className="font-medium text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Active Sessions
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-surface-900 dark:text-white">Current Device</p>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Active</span>
                </div>
                <p className="text-sm text-surface-500">Windows • Chrome • Now</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
              Logout All Other Sessions
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {renderSettings()}
    </div>
  );
};

export default SettingsPanel;
