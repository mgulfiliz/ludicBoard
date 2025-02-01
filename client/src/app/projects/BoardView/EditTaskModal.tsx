import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import AssignedUserSelect from "@/components/CustomComponents/AssignedUserSelect";
import { useUpdateTaskMutation } from "@/state/api";
import { Task } from "@/state/api";
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

  const [updateTask] = useUpdateTaskMutation();

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

  const handleSubmit = async () => {
    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), { representation: "complete" })
      : undefined;
    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), { representation: "complete" })
      : undefined;

    await updateTask({
      id: task?.id,
      title,
      description,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : undefined,
      authorUserId: authorUserId ? parseInt(authorUserId, 10) : undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="edit-task-modal">
      <Box
        className="p-6 rounded-2xl bg-white shadow-lg"
        sx={{
          maxWidth: 500,
          margin: "auto",
          mt: 8,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Edit Task
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
          />

          <TextField
            label="Start Date"
            type="date"
            value={startDate?.split("T")[0] || ""}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Due Date"
            type="date"
            value={dueDate?.split("T")[0] || ""}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <AssignedUserSelect
            assignedUserId={assignedUserId}
            setAssignedUserId={setAssignedUserId}
            label="Select Assignee"
          />

          <AssignedUserSelect
            assignedUserId={authorUserId}
            setAssignedUserId={setAuthorUserId}
            label="Select Author"
          />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>

          <Button onClick={handleSubmit} color="primary" variant="contained">
            Update Task
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EditTaskModal;
