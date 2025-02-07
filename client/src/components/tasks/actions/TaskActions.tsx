import { useState } from "react";
import { toast } from "react-toastify";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { Task as TaskType } from "@/types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

type TaskActionsProps = {
  task: TaskType;
  handleEditTask: (task: TaskType) => void;
  handleDeleteTask: (taskId: number) => void;
};

const TaskActions = ({ task, handleEditTask, handleDeleteTask }: TaskActionsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

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

  const confirmDeleteTask = async () => {
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

  return (
    <div className="relative">
      {/* Button to toggle dropdown */}
      <button
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
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
              onClick={() => {
                handleEditTask(task);
                setIsDropdownOpen(false);
              }}
              role="menuitem"
            >
              <Pencil className="mr-2 h-4 w-4 text-blue-500" />
              Edit
            </button>

            {/* Delete option */}
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
              onClick={openConfirmationModal}
              role="menuitem"
            >
              <Trash className="mr-2 h-4 w-4 text-red-500" />
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