import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { Task as TaskType, User } from "@/types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useGetCurrentUserQuery } from "@/lib/api/api";

type TaskActionsProps = {
  task: TaskType;
  handleEditTask: (task: TaskType) => void;
  handleDeleteTask: (taskId: number) => void;
};

const TaskActions = ({ task, handleEditTask, handleDeleteTask }: TaskActionsProps) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdown and the dropdown button
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openConfirmationModal = () => {
    setIsDropdownOpen(false);
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const canEditOrDeleteTask = () => {
    if (!currentUser) return false;

    // Only the task author can edit or delete the task
    return task.authorUserId === currentUser.userId;
  };

  const confirmDeleteTask = async () => {
    if (!canEditOrDeleteTask()) {
      toast.error("Only the task author can delete this task.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      await handleDeleteTask(task.id);
      toast.success("Task deleted successfully", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Failed to delete task', error);
      toast.error("Unable to delete task. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      closeConfirmationModal();
    }
  };

  const handleEditTaskClick = () => {
    if (!canEditOrDeleteTask()) {
      toast.error("Only the task author can edit this task.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    handleEditTask(task);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button to toggle dropdown */}
      <button
        ref={buttonRef}
        className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500"
        onClick={toggleDropdown}
        aria-label="Task actions"
        aria-expanded={isDropdownOpen}
      >
        <EllipsisVertical size={26} />
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-neutral-800"
          role="menu"
        >
          <div className="py-1">
            {/* Edit option */}
            <button
              className={`flex w-full items-center px-4 py-2 text-sm ${
                canEditOrDeleteTask() 
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700' 
                  : 'text-gray-400 cursor-not-allowed opacity-50'
              }`}
              onClick={handleEditTaskClick}
              role="menuitem"
              disabled={!canEditOrDeleteTask()}
            >
              <Pencil className={`mr-2 h-4 w-4 ${
                canEditOrDeleteTask() ? 'text-blue-500' : 'text-gray-400'
              }`} />
              Edit
            </button>

            {/* Delete option */}
            <button
              className={`flex w-full items-center px-4 py-2 text-sm ${
                canEditOrDeleteTask() 
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700' 
                  : 'text-gray-400 cursor-not-allowed opacity-50'
              }`}
              onClick={openConfirmationModal}
              role="menuitem"
              disabled={!canEditOrDeleteTask()}
            >
              <Trash className={`mr-2 h-4 w-4 ${
                canEditOrDeleteTask() ? 'text-red-500' : 'text-gray-400'
              }`} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action will permanently remove the task and all its associated data."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default TaskActions;