import React, { useState, useEffect } from "react";
import { useGetUsersQuery } from "@/lib/api/api";
import Image from "next/image";
import { ChevronDown, Check, User as UserIcon } from "lucide-react";

type AssignedUserSelectProps = {
  assignedUserId?: string;
  setAssignedUserId: (userId: string) => void;
  label?: string;
  className?: string;
  required?: boolean;
};

const AssignedUserSelect: React.FC<AssignedUserSelectProps> = ({ 
  assignedUserId, 
  setAssignedUserId, 
  label = 'Select User',
  className = '',
  required = false
}) => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [selectedUser, setSelectedUser] = useState<string | undefined>(assignedUserId);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedUser(assignedUserId);
  }, [assignedUserId]);

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    setAssignedUserId(userId);
    setIsOpen(false);
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error loading users</div>;

  const currentUser = users?.find(user => user.userId.toString() === selectedUser);

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between 
          px-4 py-3 
          bg-white dark:bg-dark-tertiary
          border border-[#e6e4e4] dark:border-stroke-dark
          rounded-md 
          text-left 
          focus:outline-none 
          focus:ring-2 focus:ring-blue-primary
          transition-all duration-300
        "
      >
        <div className="flex items-center space-x-3">
          {currentUser?.profilePictureUrl ? (
            <Image 
              src={`/${currentUser.profilePictureUrl}`}
              alt={currentUser.username}
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
            {currentUser ? currentUser.username : label}
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

      {isOpen && (
        <div 
          className="
            absolute z-50 top-full left-0 right-0 mt-1
            bg-white dark:bg-dark-tertiary 
            border-none
            rounded-md shadow-lg
            max-h-60 overflow-y-auto
            divide-y divide-gray-100 dark:divide-neutral-700
          "
        >
          {users?.map((user) => (
            <button
              key={user.userId}
              type="button"
              onClick={() => handleUserChange(user.userId.toString())}
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
              {selectedUser === user.userId.toString() && (
                <Check 
                  size={20} 
                  className="text-blue-500 opacity-100 group-hover:opacity-100" 
                />
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AssignedUserSelect;