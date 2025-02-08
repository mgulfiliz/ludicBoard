"use client";

import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Palette, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const settingsSections = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your personal information',
      comingSoon: false
    },
    {
      icon: Lock,
      title: 'Account Security',
      description: 'Change password and manage security settings',
      comingSoon: false
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize your interface',
      comingSoon: false
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Control your notification preferences',
      comingSoon: true
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Manage data sharing and privacy settings',
      comingSoon: true
    }
  ];

  const renderComingSoonOverlay = () => (
    <div className="absolute inset-0 bg-gray-100/80 dark:bg-neutral-900/80 flex items-center justify-center">
      <span className="text-gray-500 dark:text-gray-400 font-semibold">
        Coming Soon
      </span>
    </div>
  );

  const renderSettingsContent = () => {
    switch(activeSection) {
      case 'Profile':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md 
                    bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md 
                    bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        );
      case 'Account Security':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Account Security</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md 
                    bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md 
                    bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>
        );
      case 'Appearance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 border rounded-md bg-white dark:bg-neutral-800 
                    text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700">
                    Light
                  </button>
                  <button className="px-4 py-2 border rounded-md bg-neutral-900 
                    text-white hover:bg-neutral-800">
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full p-6 text-gray-500 dark:text-gray-400">
            Select a settings section to view details
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="w-1/3 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Settings</h1>
        <div className="space-y-2">
          {settingsSections.map((section) => (
            <button
              key={section.title}
              onClick={() => !section.comingSoon && setActiveSection(section.title)}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all 
                ${activeSection === section.title 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'}
                relative`}
            >
              <div className="flex items-center space-x-4">
                <section.icon className="h-6 w-6" />
                <div className="text-left">
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
                </div>
              </div>
              {section.comingSoon && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
              {!section.comingSoon && <ChevronRight className="h-5 w-5" />}
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-gray-200 dark:border-neutral-800 pt-4">
          <button 
            className="w-full flex items-center justify-between p-4 rounded-lg 
              hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <div className="flex items-center space-x-4">
              <LogOut className="h-6 w-6" />
              <span className="font-semibold">Logout</span>
            </div>
          </button>
        </div>
      </div>
      <div className="w-2/3 bg-neutral-50 dark:bg-neutral-950 relative">
        {activeSection && settingsSections.find(s => s.title === activeSection)?.comingSoon && renderComingSoonOverlay()}
        {renderSettingsContent()}
      </div>
    </div>
  );
};

export default SettingsPage;
