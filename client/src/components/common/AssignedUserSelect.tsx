import React, { useState, useEffect } from "react";
import { useGetUsersQuery } from "@/lib/api/api";
import Image from "next/image";
import { ChevronDown, Check, User as UserIcon, X } from "lucide-react";

type AssignedUserSelectProps = {
  assignedUserIds?: string[];
  setAssignedUserIds: (userIds: string[]) => void;
  label?: string;
  className?: string;
  required?: boolean;
  multiple?: boolean;
};

const AssignedUserSelect: React.FC<AssignedUserSelectProps> = ({ 
  assignedUserIds = [], 
  setAssignedUserIds, 
  label = 'Select User',
  className = '',
  required = false,
  multiple = false
}) => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(assignedUserIds);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedUserIds(assignedUserIds);
  }, [assignedUserIds]);

  const handleUserChange = (userId: string) => {
    let newSelectedUserIds: string[];
    
    if (multiple) {
      // For multiple selection
      newSelectedUserIds = selectedUserIds.includes(userId)
        ? selectedUserIds.filter(id => id !== userId)
        : [...selectedUserIds, userId];
    } else {
      // For single selection
      newSelectedUserIds = [userId];
    }

    setSelectedUserIds(newSelectedUserIds);
    setAssignedUserIds(newSelectedUserIds);
    
    if (!multiple) {
      setIsOpen(false);
    }
  };

  const removeUser = (userId: string) => {
    const newSelectedUserIds = selectedUserIds.filter(id => id !== userId);
    setSelectedUserIds(newSelectedUserIds);
    setAssignedUserIds(newSelectedUserIds);
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error loading users</div>;

  const selectedUsers = users?.filter(user => 
    selectedUserIds.includes(user.userId.toString())
  ) || [];

  return (
    <div className={`relative w-full ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
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
          cursor-pointer
        "
      >
        <div className="flex items-center space-x-3 w-full">
          {selectedUsers.length > 0 ? (
            <div className="flex items-center space-x-2 w-full overflow-x-auto">
              {selectedUsers.map(user => (
                <div 
                  key={user.userId} 
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded-full"
                >
                  {user.profilePictureUrl ? (
                    <Image 
                      src={`/${user.profilePictureUrl}`}
                      alt={user.username}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center">
                      <UserIcon size={16} className="text-gray-500 dark:text-neutral-400" />
                    </div>
                  )}
                  <span className="text-xs text-gray-800 dark:text-white">
                    {user.username}
                  </span>
                  {multiple && (
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUser(user.userId.toString());
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          removeUser(user.userId.toString());
                        }
                      }}
                      className="text-gray-500 hover:text-red-500 cursor-pointer"
                    >
                      <X size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center">
                <UserIcon size={20} className="text-gray-500 dark:text-neutral-400" />
              </div>
              <span className="text-sm text-gray-800 dark:text-white">
                {label}
              </span>
            </div>
          )}
        
        <ChevronDown 
          size={20} 
          className={`
            text-gray-500 dark:text-neutral-400 
            transform transition-transform duration-300
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `} 
        />
        </div>
      </div>

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
            <div
              key={user.userId}
              role="button"
              tabIndex={0}
              onClick={() => handleUserChange(user.userId.toString())}
              onKeyDown={(e) => e.key === 'Enter' && handleUserChange(user.userId.toString())}
              className="
                w-full flex items-center justify-between 
                px-4 py-3 
                hover:bg-gray-50 dark:hover:bg-neutral-800
                focus:outline-none 
                transition-colors duration-200
                group
                cursor-pointer
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
              {selectedUserIds.includes(user.userId.toString()) && (
                <Check 
                  size={20} 
                  className="text-blue-500 opacity-100 group-hover:opacity-100" 
                />
              )}
            </div>
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