import React from "react";
import { Menu, Moon, Settings, Sun, Bell, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/lib/api";
import { SearchBar } from "./SearchBar";

const Navbar = () => {
  const dispatch = useAppDispatch();

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      {/* Search Bar */}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        <SearchBar isDarkMode={isDarkMode} />
      </div>

      {/* Icons */}
      <div className="flex items-center">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={`rounded p-2 ${
            isDarkMode ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>
        <Link
          href="/notifications"
          className={`h-min w-min rounded p-2 ${
            isDarkMode ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <Link
          href="/settings"
          className={`h-min w-min rounded p-2 ${
            isDarkMode ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label="Settings"
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <Link
          href="/profile"
          className={`h-min w-min rounded p-2 ${
            isDarkMode ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label="User Profile"
        >
          <User className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
