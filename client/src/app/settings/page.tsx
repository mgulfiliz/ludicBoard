"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Palette, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from "@/app/redux";
import { 
  useLogoutMutation, 
  useUpdateProfileMutation,
  useChangePasswordMutation
} from '@/lib/api/api';
import { clearCredentials } from '@/lib/features/authSlice';
import { toast } from 'react-toastify';
import { setIsDarkMode } from "@/lib/api";

const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [logout] = useLogoutMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  
  const { user } = useAppSelector((state) => state.auth);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Profile edit state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      toast.info('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  // Profile save handler
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        username: profileData.username
      }).unwrap();
      
      toast.success('Profile updated successfully');
      setIsProfileEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error', error);
    }
  };

  // Password change handler
  const handleChangePassword = async () => {
    // Validate inputs
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap();

      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to change password');
      console.error('Password change error', error);
    }
  };

  // Settings sections
  const settingsSections = [
    {
      icon: User,
      name: 'Profile',
      description: 'Manage your profile information'
    },
    {
      icon: Lock,
      name: 'Security',
      description: 'Change password and manage security settings'
    },
    {
      icon: Palette,
      name: 'Appearance',
      description: 'Customize your interface'
    },
    {
      icon: Bell,
      name: 'Notifications',
      description: 'Manage notification preferences'
    },
    {
      icon: Shield,
      name: 'Privacy',
      description: 'Control your data and privacy'
    }
  ];

  // Render profile section
  const renderProfileSection = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Profile Settings</h2>
        {!isProfileEditing ? (
          <button 
            onClick={() => setIsProfileEditing(true)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                setProfileData({
                  username: user?.username || '',
                  email: user?.email || ''
                });
                setIsProfileEditing(false);
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              className="text-blue-600 hover:text-blue-800 flex items-center font-semibold"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input 
            type="text" 
            value={profileData.username}
            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
            disabled={!isProfileEditing}
            className={`w-full px-3 py-2 border rounded-md 
              ${isProfileEditing 
                ? 'border-blue-500 bg-white dark:bg-neutral-800' 
                : 'border-gray-300 bg-gray-100 dark:bg-neutral-700'}
              text-gray-900 dark:text-gray-100`}
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input 
            type="email" 
            value={profileData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md 
              bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            placeholder="Email cannot be changed"
          />
        </div>
      </div>
    </div>
  );

  // Render password change section
  const renderPasswordSection = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Change Password</h2>
        {!isChangingPassword ? (
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                setIsChangingPassword(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmNewPassword: ''
                });
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </button>
            <button 
              onClick={handleChangePassword}
              className="text-blue-600 hover:text-blue-800 flex items-center font-semibold"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <input 
            type="password" 
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            disabled={!isChangingPassword}
            className={`w-full px-3 py-2 border rounded-md 
              ${isChangingPassword 
                ? 'border-blue-500 bg-white dark:bg-neutral-800' 
                : 'border-gray-300 bg-gray-100 dark:bg-neutral-700'}
              text-gray-900 dark:text-gray-100`}
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <input 
            type="password" 
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            disabled={!isChangingPassword}
            className={`w-full px-3 py-2 border rounded-md 
              ${isChangingPassword 
                ? 'border-blue-500 bg-white dark:bg-neutral-800' 
                : 'border-gray-300 bg-gray-100 dark:bg-neutral-700'}
              text-gray-900 dark:text-gray-100`}
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input 
            type="password" 
            value={passwordData.confirmNewPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})}
            disabled={!isChangingPassword}
            className={`w-full px-3 py-2 border rounded-md 
              ${isChangingPassword 
                ? 'border-blue-500 bg-white dark:bg-neutral-800' 
                : 'border-gray-300 bg-gray-100 dark:bg-neutral-700'}
              text-gray-900 dark:text-gray-100`}
            placeholder="Confirm new password"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Appearance</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Dark Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isDarkMode}
                  onChange={() => dispatch(setIsDarkMode(!isDarkMode))}
                />
                <div className={`
                  w-10 h-4 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'} 
                  rounded-full shadow-inner transition duration-300
                `}></div>
                <div className={`
                  dot absolute -left-1 -top-1 bg-white w-6 h-6 rounded-full 
                  shadow transition transform 
                  ${isDarkMode ? 'translate-x-full bg-blue-500' : 'translate-x-0 bg-white'}
                `}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );  

  // Render settings content based on active section
  const renderSettingsContent = () => {
    switch(activeSection) {
      case 'Profile':
        return renderProfileSection();
      case 'Security':
        return renderPasswordSection();
      case 'Appearance':
        return renderAppearanceSection();
      default:
        return (
          <div className="flex items-center justify-center h-full p-6 text-gray-500 dark:text-gray-400">
            Select a settings section to view details
          </div>
        );
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  // Render nothing if no user
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <div className="w-1/3 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">Settings</h1>
        <div className="space-y-2">
          {settingsSections.map((section) => (
            <button
              key={section.name}
              onClick={() => setActiveSection(section.name)}
              className={`w-full text-left p-3 rounded-md transition-colors duration-200 
                ${activeSection === section.name 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'}
                flex items-center justify-between`}
            >
              <div className="flex items-center">
                <section.icon className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">{section.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{section.description}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </button>
          ))}
        </div>
        <div className="mt-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 
              text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 
              transition-colors duration-200"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 bg-neutral-50 dark:bg-neutral-950 relative">
        {renderSettingsContent()}
      </div>
    </div>
  );
};

export default SettingsPage;