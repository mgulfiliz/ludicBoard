import { Task, User, Project } from "@/lib/api/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import { 
  Chip, 
  Typography, 
  Box 
} from "@mui/material";
import { 
  Folder as FolderIcon 
} from "@mui/icons-material";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  return (
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
      {/* Project Information */}
      {task.project && (
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1} 
          mb={2}
        >
          <FolderIcon color="primary" />
          <Typography variant="subtitle2">
            Project: {task.project.name}
          </Typography>
        </Box>
      )}

      {task.attachments && task.attachments.length > 0 && (
        <div>
          <strong>Attachments:</strong>
          <div className="flex flex-wrap">
            {task.attachments && task.attachments.length > 0 && (
              <Image
                src={`/${task.attachments[0].fileURL}`}
                alt={task.attachments[0].fileName}
                width={400}
                height={200}
                className="rounded-md"
              />
            )}
          </div>
        </div>
      )}
      <p>
        <strong>ID:</strong> {task.id}
      </p>
      <p>
        <strong>Title:</strong> {task.title}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {task.description || "No description provided"}
      </p>
      <Box display="flex" gap={1} mb={1}>
        <Chip 
          label={task.status || "No Status"} 
          color="primary" 
          size="small" 
          variant="outlined"
        />
        <Chip 
          label={task.priority || "No Priority"} 
          color="secondary" 
          size="small" 
          variant="outlined"
        />
      </Box>
      <p>
        <strong>Tags:</strong> {task.tags || "No tags"}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Due Date:</strong>{" "}
        {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Author:</strong>{" "}
        {task.author ? task.author.username : "Unknown"}
      </p>
      <p>
        <strong>Assignee:</strong>{" "}
        {task.assignees && task.assignees.length > 0 
          ? task.assignees.map(a => a.username).join(', ') 
          : "Unassigned"}
      </p>
    </div>
  );
};

export default TaskCard;