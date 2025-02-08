import React, { useState, useEffect } from "react";
import { Menu, Moon, Settings, Sun, Bell } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/lib/api";
import { SearchBar } from "./SearchBar";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const iconClassName = "h-5 w-5 text-gray-600 dark:text-gray-300";
  const buttonClassName = "p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800";

  return (
    <div className={`fixed top-0 inset-x-0 h-[56px] border-b border-gray-200 dark:border-neutral-700 z-[10] 
      bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ease-in-out
      ${isSidebarCollapsed ? "left-16 md:left-16 sm:left-0" : "left-64 md:left-64 sm:left-0"}`}
    >
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between px-4">
        {isMobile && (
          <button 
            onClick={toggleSidebar} 
            className={`${buttonClassName} mr-2`}
            aria-label="Toggle Sidebar"
          >
            <Menu className={iconClassName} />
          </button>
        )}
        <SearchBar isDarkMode={isDarkMode} />

        {/* Icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <button
            onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
            className={buttonClassName}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className={iconClassName} />
            ) : (
              <Moon className={iconClassName} />
            )}
          </button>
          <Link
            href="/notifications"
            className={`${buttonClassName} h-min w-min`}
            aria-label="Notifications"
          >
            <Bell className={iconClassName} />
          </Link>
          <Link 
            href="/settings" 
            className={buttonClassName}
            aria-label="Settings"
          >
            <Settings className={iconClassName} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;