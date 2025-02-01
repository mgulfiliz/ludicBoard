import React, { useState } from "react";
import { useGetUsersQuery } from "@/state/api";
import Image from "next/image";
import { ChevronDown, Check, User as UserIcon } from "lucide-react";

interface User {
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
}

interface Props {
  assignedUserId: string;
  setAssignedUserId: (value: string) => void;
  label?: string;
}

export default function AssignedUserSelect({
  assignedUserId,
  setAssignedUserId,
  label = "Comment As"
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: users, isLoading, isError } = useGetUsersQuery();

  if (isLoading) return (
    <div className="text-sm text-gray-500 dark:text-neutral-400 py-2">
      Loading users...
    </div>
  );

  if (isError || !users) return (
    <div className="text-sm text-red-500 dark:text-red-400 py-2">
      Error fetching users
    </div>
  );

  const selectedUserId = assignedUserId ? Number(assignedUserId) : null;

  const handleUserSelect = (userId: number) => {
    setAssignedUserId(String(userId));
    setIsOpen(false);
  };

  const selectedUser = selectedUserId 
    ? users.find(user => user.userId === selectedUserId) 
    : null;

  return (
    <div className="relative w-full">
      {/* User Selection Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between 
          px-4 py-3 
          bg-gray-100 dark:bg-dark-secondary 
          border border-transparent 
          rounded-lg 
          text-left 
          focus:outline-none 
          focus:ring-2 focus:ring-blue-500
          transition-all duration-300
        "
      >
        <div className="flex items-center space-x-3">
          {selectedUser?.profilePictureUrl ? (
            <Image 
              src={`/${selectedUser.profilePictureUrl}`}
              alt={selectedUser.username}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center">
              <UserIcon size={20} className="text-gray-500 dark:text-neutral-400" />
            </div>
          )}
          <span className="text-sm text-gray-800 dark:text-white">
            {selectedUser ? selectedUser.username : label}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`
            text-gray-500 dark:text-neutral-400 
            transform transition-transform duration-300
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="
            absolute z-50 top-full left-0 right-0 mt-1
            bg-white dark:bg-dark-secondary 
            border border-gray-200 dark:border-neutral-700
            rounded-lg shadow-lg
            max-h-60 overflow-y-auto
            divide-y divide-gray-100 dark:divide-neutral-700
          "
        >
          {users.map((user) => (
            <button
              key={user.userId}
              type="button"
              onClick={() => handleUserSelect(user.userId)}
              className="
                w-full flex items-center justify-between 
                px-4 py-3 
                hover:bg-gray-50 dark:hover:bg-neutral-800
                focus:outline-none 
                transition-colors duration-200
                group
              "
            >
              <div className="flex items-center space-x-3">
                {user.profilePictureUrl ? (
                  <Image 
                    src={`/${user.profilePictureUrl}`}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center">
                    <UserIcon size={20} className="text-gray-500 dark:text-neutral-400" />
                  </div>
                )}
                <span className="text-sm text-gray-800 dark:text-white">
                  {user.username}
                </span>
              </div>
              {selectedUserId === user.userId && (
                <Check 
                  size={20} 
                  className="text-blue-500 opacity-100 group-hover:opacity-100" 
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}