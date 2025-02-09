import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Box,
} from "@mui/material";
import AssignedUserSelect from "@/components/common/AssignedUserSelect";
import { Task, useUpdateTaskMutation } from "@/lib/api/api";
import { formatISO } from "date-fns";
import { toast } from "react-toastify";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

interface UpdateTaskPayload {
  taskId: number;
  task: Partial<Task> & {
    tags?: string | string[] | undefined;
  };
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    startDate: "",
    dueDate: "",
    assignedUserId: "",
    authorUserId: "",
  });

  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  useEffect(() => {
    if (task) {
      // Handle tags as either array or string
      const parseTags = (tags?: string | string[]) => {
        if (!tags) return [];
        
        // If tags is already an array, trim and filter
        if (Array.isArray(tags)) {
          return tags.map(tag => tag.trim()).filter(tag => tag);
        }
        
        // If tags is a string, split and process
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      };

      setFormState({
        title: task.title,
        description: task.description ?? '',
        tags: parseTags(task.tags),
        startDate: task.startDate ? formatISO(new Date(task.startDate), { representation: "date" }) : '',
        dueDate: task.dueDate ? formatISO(new Date(task.dueDate), { representation: "date" }) : '',
        assignedUserId: String(task.assignedUserId ?? ''),
        authorUserId: String(task.authorUserId ?? ''),
      });
    }
  }, [task]);

  const isFormValid = () => {
    const titleValid = formState.title.trim().length > 0;
    const authorValid = formState.authorUserId.trim().length > 0;
    return titleValid && authorValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Please fill in all required fields", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const formattedStartDate = formState.startDate 
      ? formatISO(new Date(formState.startDate), { representation: 'complete' }) 
      : null;
    
    const formattedDueDate = formState.dueDate 
      ? formatISO(new Date(formState.dueDate), { representation: 'complete' }) 
      : null;

    try {
      if (!task) {
        throw new Error('No task selected');
      }

      const updatePayload: UpdateTaskPayload = {
        taskId: task.id,
        task: {
          title: formState.title.trim(),
          description: formState.description.trim() || undefined,
          tags: formState.tags.length > 0 ? formState.tags : undefined,
          startDate: formattedStartDate,
          dueDate: formattedDueDate,
          assignedUserId: formState.assignedUserId ? parseInt(formState.assignedUserId, 10) : undefined,
          authorUserId: formState.authorUserId ? parseInt(formState.authorUserId, 10) : undefined,
        }
      };

      await updateTask(updatePayload).unwrap();

      toast.success("Task updated successfully", {
        position: "bottom-right",
        autoClose: 3000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const inputStyles = 
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  const selectStyles =
    "mb-4 block w-full rounded border-none px-3 py-2 bg-transparent dark:bg-transparent dark:text-white";

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      aria-labelledby="edit-task-modal"
      className="flex items-center justify-center"
    >
      <Box
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-dark-secondary"
        sx={{
          margin: "auto",
          mt: 8,
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          className="mb-4 text-center text-gray-800 dark:text-white"
        >
          Edit Task
        </Typography>

        <form 
          className="mt-4 space-y-6"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            className={inputStyles}
            placeholder="Title"
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            required
          />

          <textarea
            className={inputStyles}
            placeholder="Description"
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            rows={4}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
            <input
              type="date"
              className={inputStyles}
              value={formState.startDate}
              onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
              placeholder="Start Date"
            />
            <input
              type="date"
              className={inputStyles}
              value={formState.dueDate}
              onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
              placeholder="Due Date"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-4">Select Author</label>
            <AssignedUserSelect
              assignedUserId={formState.authorUserId}
              setAssignedUserId={(value) => setFormState({ ...formState, authorUserId: value })}
              label="Select Author"
              className={selectStyles}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-4">Select Team Members</label>
            <AssignedUserSelect
              assignedUserId={formState.assignedUserId}
              setAssignedUserId={(value) => setFormState({ ...formState, assignedUserId: value })}
              label="Select Team Members"
              className={selectStyles}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-4">Tags</label>
            <input
              type="text"
              className={inputStyles}
              placeholder="Tags (comma-separated)"
              value={formState.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                setFormState({ ...formState, tags });
              }}
            />
          </div>

          <button
            type="submit"
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Updating..." : "Update Task"}
          </button>
        </form>
      </Box>
    </Modal>
  );
};

export default EditTaskModal;
