import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Box,
} from "@mui/material";
import AssignedUserSelect from "@/components/common/AssignedUserSelect";
import { Task, useUpdateTaskMutation, useGetCurrentUserQuery } from "@/lib/api/api";
import { formatISO } from "date-fns";
import { toast } from "react-toastify";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

interface UpdateTaskPayload {
  taskId: number;
  task: Partial<Task>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    tags: "" as string,
    startDate: "",
    dueDate: "",
    assignedUserIds: [] as string[],
    authorUserId: currentUser?.userId ? String(currentUser.userId) : '',
  });

  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  useEffect(() => {
    if (task) {
      const tagsString = Array.isArray(task.tags) 
        ? task.tags.filter(tag => tag?.trim?.()).join(', ') 
        : task.tags || '';

      // Support both single and multiple user assignments
      const assignedUserIds = task.assignedUserIds 
        ? task.assignedUserIds.map(String) 
        : (task.assignedUserId ? [String(task.assignedUserId)] : []);

      setFormState({
        title: task.title,
        description: task.description ?? '',
        tags: tagsString,
        startDate: task.startDate ? formatISO(new Date(task.startDate), { representation: "date" }) : '',
        dueDate: task.dueDate ? formatISO(new Date(task.dueDate), { representation: "date" }) : '',
        assignedUserIds: assignedUserIds,
        authorUserId: String(task.authorUserId ?? ''),
      });
    }
  }, [task]);

  const isFormValid = () => {
    const titleValid = formState.title.trim().length > 0;
    return titleValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure current user is authenticated
    if (!currentUser) {
      toast.error("Authentication required", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

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

      // Process tags from input string
      const processTags = formState.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const updatePayload: UpdateTaskPayload = {
        taskId: task.id,
        task: {
          title: formState.title.trim(),
          description: formState.description.trim() || undefined,
          tags: processTags.length > 0 ? processTags : undefined,
          startDate: formattedStartDate,
          dueDate: formattedDueDate,
          // Explicitly handle assignedUserIds
          assignedUserIds: formState.assignedUserIds.length > 0 
            ? formState.assignedUserIds.map(id => parseInt(id, 10)) 
            : [], // Send an empty array to remove all assignments
          authorUserId: currentUser.userId, // Always use current user's ID
        }
      };

      console.log('Update Payload:', updatePayload); // Add logging for debugging

      const updatedTask = await updateTask(updatePayload).unwrap();

      console.log('Updated Task Response:', updatedTask);
      console.log('Assigned User IDs:', updatedTask.assignedUserIds);

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

          <input
            type="text"
            className={inputStyles}
            placeholder="Tags (comma-separated)"
            value={formState.tags}
            onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
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

          <AssignedUserSelect
            assignedUserIds={formState.assignedUserIds}
            setAssignedUserIds={(userIds) => 
              setFormState({ ...formState, assignedUserIds: userIds })
            }
            multiple={true}
            label="Select Assignees"
            className="mb-4"
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-md 
                border 
                border-gray-300 
                px-4 
                py-2 
                text-sm 
                text-gray-700 
                hover:bg-gray-50 
                dark:border-dark-tertiary 
                dark:text-white 
                dark:hover:bg-dark-tertiary
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="
                rounded-md 
                bg-blue-600 
                px-4 
                py-2 
                text-sm 
                text-white 
                hover:bg-blue-700 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                focus:ring-offset-2 
                dark:bg-blue-500 
                dark:hover:bg-blue-600
                disabled:opacity-50
              "
            >
              {isLoading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default EditTaskModal;
