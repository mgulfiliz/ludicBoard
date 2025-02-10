import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Moon, Settings, Sun, Bell, LogIn, UserPlus, User, LogOut } from "lucide-react";
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/lib/api";
import { SearchBar } from "./SearchBar";
import { useLogoutMutation } from '@/lib/api/api';
import { clearCredentials } from '@/lib/features/authSlice';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { toast } from 'react-toastify';
import CustomMenu from '@/components/common/CustomMenu';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      toast.info('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  const iconClassName = "h-5 w-5 text-gray-600 dark:text-gray-300";
  const buttonClassName = "p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800";

  return (
    <>
      <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 border-b border-gray-200 dark:border-neutral-700 bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent h-16">
        <div className="max-w-8xl mx-auto">
          <div className="py-2 lg:px-8 lg:border-0 mx-4 lg:mx-0">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Search Bar */}
                <SearchBar isDarkMode={isDarkMode} />
              </div>

              <div className="flex items-center space-x-2">
                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDarkMode} 
                  className={buttonClassName}
                >
                  {isDarkMode ? <Sun className={iconClassName} /> : <Moon className={iconClassName} />}
                </button>

                {/* Notifications */}
                <Link 
                  href="/notifications" 
                  className={buttonClassName}
                >
                  <Bell className={iconClassName} />
                </Link>

                {/* Settings */}
                <Link 
                  href="/settings" 
                  className={buttonClassName}
                >
                  <Settings className={iconClassName} />
                </Link>

                {user ? (
                  <CustomMenu 
                    buttonLabel={
                      <div className="flex items-center space-x-2">
                        {user.profilePictureUrl ? (
                          <div className="relative w-8 h-8">
                            <Image
                              src={`/${user.profilePictureUrl}`}
                              alt={`${user.username}'s profile`}
                              fill
                              className="rounded-full object-cover"
                              onError={(e) => {
                                console.error('Profile picture failed to load:', user.profilePictureUrl);
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
                          {user.username}
                        </span>
                      </div>
                    }
                    actions={[
                      {
                        label: 'Profile',
                        icon: User,
                        onClick: () => router.push('/profile'),
                        variant: 'default'
                      },
                      {
                        label: 'Settings',
                        icon: Settings,
                        onClick: () => router.push('/settings'),
                        variant: 'default'
                      },
                      {
                        label: 'Logout',
                        icon: LogOut,
                        onClick: handleLogout,
                        variant: 'destructive',
                        confirmationTitle: 'Logout',
                        confirmationMessage: 'Are you sure you want to log out?'
                      }
                    ]}
                    className="relative"
                    buttonClassName="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-neutral-800 p-1 rounded-md"
                    menuClassName="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outlined" 
                      startIcon={<LogIn />} 
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<UserPlus />} 
                      onClick={() => setIsRegisterModalOpen(true)}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;