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
    <div className="relative z-30">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="absolute top-0 right-0 m-2 text-gray-500 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        <EllipsisVertical size={20} />
      </button>

      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-8 right-2 z-40 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-secondary dark:ring-white dark:ring-opacity-10"
        >
          <div className="py-1">
            <button
              onClick={() => {
                handleEditTask(task);
                setIsDropdownOpen(false);
              }}
              disabled={!canEditOrDeleteTask()}
              className={`flex w-full items-center px-4 py-2 text-sm ${
                canEditOrDeleteTask()
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-dark-tertiary'
                  : 'text-gray-300 dark:text-neutral-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Pencil size={16} className="mr-2" /> Edit
            </button>

            <button
              onClick={openConfirmationModal}
              disabled={!canEditOrDeleteTask()}
              className={`flex w-full items-center px-4 py-2 text-sm ${
                canEditOrDeleteTask()
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20'
                  : 'text-gray-300 dark:text-neutral-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Trash size={16} className="mr-2" /> Delete
            </button>

            {/* Placeholder for future menu items */}
            <div className="border-t border-gray-200 dark:border-neutral-700 my-1" />
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-dark-tertiary"
            >
              Additional Action
            </button>
          </div>
        </div>
      )}

      {isConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeConfirmationModal}
          onConfirm={confirmDeleteTask}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default TaskActions;