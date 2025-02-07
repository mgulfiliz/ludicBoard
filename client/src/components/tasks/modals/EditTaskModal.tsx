import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Box,
} from "@mui/material";
import AssignedUserSelect from "@/components/common/AssignedUserSelect";
import { Task, useUpdateTaskMutation } from "@/lib/api/api";
import { formatISO } from "date-fns";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [assignedUserId, setAssignedUserId] = useState<string>("");
  const [authorUserId, setAuthorUserId] = useState<string>("");

  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStartDate(task.startDate ? formatISO(new Date(task.startDate), { representation: "complete" }) : null);
      setDueDate(task.dueDate ? formatISO(new Date(task.dueDate), { representation: "complete" }) : null);
      setAssignedUserId(String(task.assignedUserId));
      setAuthorUserId(String(task.authorUserId));
    }
  }, [task]);

  const isFormValid = () => {
    return title && authorUserId;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), { representation: "complete" })
      : undefined;
    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), { representation: "complete" })
      : undefined;

    try {
      if (!task) {
        throw new Error('No task selected');
      }
      await updateTask({
        taskId: task.id,
        task: {
          title,
          description,
          startDate: formattedStartDate,
          dueDate: formattedDueDate,
          assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : undefined,
          authorUserId: authorUserId ? parseInt(authorUserId, 10) : undefined,
        }
      });
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
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
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            className={inputStyles}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className={inputStyles}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
            <input
              type="date"
              className={inputStyles}
              value={startDate?.split("T")[0] || ""}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              className={inputStyles}
              value={dueDate?.split("T")[0] || ""}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Due Date"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-4">Select Author</label>
            <AssignedUserSelect
              assignedUserId={authorUserId}
              setAssignedUserId={setAuthorUserId}
              label="Select Author"
              className={selectStyles}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-4">Select Team Members</label>
            <AssignedUserSelect
              assignedUserId={assignedUserId}
              setAssignedUserId={setAssignedUserId}
              label="Select Team Members"
              className={selectStyles}
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
