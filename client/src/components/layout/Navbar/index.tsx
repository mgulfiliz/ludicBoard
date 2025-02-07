import React from "react";
import { Moon, Settings, Sun, Bell } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/lib/api";
import { SearchBar } from "./SearchBar";

const Navbar = () => {
  const dispatch = useAppDispatch();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const iconClassName = "h-5 w-5 text-gray-600 dark:text-gray-300";
  const buttonClassName = "p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800";

  return (
    <div className="fixed top-0 inset-x-0 h-[56px] border-b border-gray-200 dark:border-neutral-700 z-[10] bg-neutral-100 dark:bg-neutral-900">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between px-4">
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